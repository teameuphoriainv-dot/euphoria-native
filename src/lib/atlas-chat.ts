/**
 * Client for the Atlas chat proxy (`src/app/api/chat+api.ts`).
 *
 * THE ORIGIN PROBLEM: on web a relative `fetch('/api/chat')` resolves against the page, but on
 * native there is no page — a relative URL has nothing to resolve against and the request fails.
 * The API route is served by the Metro dev server in development and by EAS Hosting in
 * production, so the base URL has to be worked out at runtime rather than hardcoded.
 *
 * Resolution order lives in ONE place, `apiBase()` in `./api`. It used to be duplicated here, and
 * the duplicate is what made this file dangerous. The C98 fix gave `apiBase()` a compiled-in
 * DEFAULT_API_ORIGIN so an OTA could never ship without an origin; this copy never got it. An OTA
 * published without `--environment` would therefore leave market data working off the constant
 * while Atlas ALONE resolved to '' and fetched a relative URL native cannot resolve — a partial
 * outage, which is harder to read than a total one, because the half that works argues the
 * configuration is fine.
 *
 * `scripts/api-origin-pin.mjs` now fails the build if EXPO_PUBLIC_API_URL is read anywhere but
 * `src/lib/api.ts`, so a third copy cannot appear the way this second one did.
 */
import { apiBase, apiHeaders, apiOriginMissing } from './api';

export type ChatTurn = { role: 'user' | 'model'; content: string };

/** Error codes the route returns. `not_configured` means the server has no API key. */
export class ChatError extends Error {
  constructor(public code: string) {
    super(code);
    this.name = 'ChatError';
  }
}

/**
 * Send the whole thread and get one reply. Non-streaming by design for now — streaming is a
 * separate unit, and shipping a fake "typing" animation over a blocking request would be a lie
 * about what the network is doing.
 */
export async function askAtlas(messages: ChatTurn[], signal?: AbortSignal): Promise<string> {
  // Same C98 guard as `apiGet`. Atlas is the most visible casualty of a missing origin — a
  // reviewer taps the mascot, nothing happens, and it reads as the app being broken rather than
  // misconfigured.
  if (apiOriginMissing()) throw new ChatError('no_api_origin');
  const res = await fetch(`${apiBase()}/api/chat`, {
    method: 'POST',
    headers: apiHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ messages }),
    signal,
  });

  const data = await res.json().catch(() => null);
  if (res.status === 429) throw new ChatError('rate_limited');
  if (!res.ok) throw new ChatError(data?.error ?? `http_${res.status}`);
  if (typeof data?.text !== 'string') throw new ChatError('empty');
  return data.text;
}

/** What the user sees for each error code. Never surface a raw code. */
export function chatErrorMessage(code: string): string {
  switch (code) {
    case 'not_configured':
      return 'Atlas is not switched on in this build yet.';
    case 'rate_limited':
      return "You're asking faster than I can think. Give me a moment.";
    case 'message_too_long':
      return 'That is a bit long for me. Try trimming it down.';
    case 'too_many_messages':
      return 'This conversation has got long. Start a new one and I will keep up.';
    default:
      return "I could not reach my brain just then. Try me again in a moment.";
  }
}
