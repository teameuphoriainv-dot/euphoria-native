/**
 * Atlas chat proxy.
 *
 * The entire reason this file exists: the provider key must never reach the app bundle. Anything
 * shipped inside the IPA is extractable, and an extracted key bills our account. So the client
 * talks to this route, this route talks to the provider, and the key stays in server env.
 *
 * Requires `web.output: "server"` in app.json — with "static" (the previous value) API routes are
 * not emitted at all.
 *
 * Step 1 of the chat build: ONE non-streaming completion, verifiable with curl. Streaming, rate
 * limiting and the per-session cost cap land in later steps — see refs/HANDOFF.md. Do not add a
 * chat UI against this until the cap exists; an uncapped proxy is an open tab on our account.
 */

import { guard } from './_limit';

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

/** Gemini free tier — no card required. Swapping providers is this line plus the fetch body. */
const MODEL = 'gemini-2.5-flash';

/** Bounds on a SINGLE request. This is input validation at the trust boundary, not rate limiting
 *  — nothing here stops a caller making a thousand valid requests. That is step 3. */
const MAX_TURNS = 24;
const MAX_CHARS = 2000;

/**
 * Derived from the three lines Atlas already speaks in-app — lesson.tsx:154, start.tsx:79,
 * streak-ignite.tsx:232 — rather than invented. All three are short, second person, contracted,
 * and guide instead of lecture. 3/3.
 *
 * COPY IS UNAPPROVED. Voice rules are evidence-backed; the exact wording has not been signed off.
 */
const SYSTEM = [
  'You are Atlas, the guide inside Euphoria, a finance education app.',
  'Speak in short sentences. Second person, contractions, warm but never cutesy.',
  'Guide rather than lecture: one idea at a time, then check whether it landed.',
  'Your words render inside a speech bubble, so use no markdown, no emoji, and no stacked exclamation marks.',
  'If a question falls outside personal finance or the lesson at hand, say so briefly and steer back.',
  'Never give individualised investment advice and never recommend specific securities. Explain how things work instead.',
].join(' ');

type Turn = { role: 'user' | 'model'; content: string };

/** Returns the validated turns, or an error code string. Callers must check with typeof. */
function parseTurns(body: unknown): Turn[] | string {
  const raw = (body as { messages?: unknown } | null)?.messages;
  if (!Array.isArray(raw) || raw.length === 0) return 'messages_required';
  if (raw.length > MAX_TURNS) return 'too_many_messages';

  const turns: Turn[] = [];
  for (const m of raw) {
    const role = (m as Partial<Turn> | null)?.role;
    const content = (m as Partial<Turn> | null)?.content;
    if (role !== 'user' && role !== 'model') return 'bad_role';
    if (typeof content !== 'string') return 'bad_content';
    const trimmed = content.trim();
    if (!trimmed) return 'empty_content';
    if (trimmed.length > MAX_CHARS) return 'message_too_long';
    turns.push({ role, content: trimmed });
  }
  if (turns[turns.length - 1].role !== 'user') return 'last_must_be_user';
  return turns;
}

export async function POST(request: Request) {
  // Rate limit FIRST — before the key check, before parsing, before any upstream call. An
  // unlimited proxy just relocates the quota problem instead of solving it.
  const gate = guard(request, 'chat', 20, 5 * 60_000);
  if (gate) return gate;

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.error('[chat] GEMINI_API_KEY is not set');
    return Response.json({ error: 'not_configured' }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'bad_json' }, { status: 400 });
  }

  const turns = parseTurns(body);
  if (typeof turns === 'string') return Response.json({ error: turns }, { status: 400 });

  try {
    const res = await fetch(`${ENDPOINT}/${MODEL}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM }] },
        contents: turns.map((t) => ({ role: t.role, parts: [{ text: t.content }] })),
        generationConfig: { maxOutputTokens: 400, temperature: 0.7 },
      }),
    });

    if (!res.ok) {
      // Upstream bodies echo quota state and can carry key fragments. Log them, never forward them.
      console.error('[chat] upstream', res.status, (await res.text()).slice(0, 500));
      return Response.json({ error: 'upstream' }, { status: 502 });
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== 'string' || !text.trim()) {
      console.error('[chat] no text in response', JSON.stringify(data).slice(0, 500));
      return Response.json({ error: 'empty' }, { status: 502 });
    }

    return Response.json({ text });
  } catch (e) {
    console.error('[chat] request failed', e);
    return Response.json({ error: 'upstream' }, { status: 502 });
  }
}
