/**
 * Server-side rate limiting.
 *
 * The leading underscore keeps expo-router from treating this as a route.
 *
 * WHY THIS EXISTS: every API route in this app spends someone else's quota — Gemini tokens cost
 * real money, Polygon and Tradier are both rate-limited upstream, and the keys live on the server
 * precisely so a client cannot burn them. A proxy without a limiter just relocates the problem: it
 * stops the key leaking and leaves the quota wide open.
 *
 * ── THE CEILING, STATED HONESTLY ────────────────────────────────────────────────────────────
 * This is an IN-MEMORY limiter, so its state is PER-INSTANCE. On EAS Hosting these routes run as
 * Cloudflare Workers, which means per-isolate: two requests can land on two isolates and each will
 * see a fresh bucket. It is therefore a REAL limiter against a single client hammering one
 * instance, and a WEAK one against a distributed attacker.
 *
 * That is a deliberate trade for today, not an oversight, and it must not be described as a global
 * limiter anywhere. The upgrade path, in increasing order of effort:
 *   1. Cloudflare Durable Object keyed by the identity — strongly consistent, single-region hop.
 *   2. Workers KV — eventually consistent, cheap, fine for coarse budgets.
 *   3. Upstash Redis — if the limiter ever needs to be shared with the web app's Supabase functions.
 * Any of the three is a drop-in replacement for `take()`; nothing else in the codebase changes.
 *
 * ── THIS LIMITER DOES NOT LIMIT AGAINST THE METRO DEV SERVER. NOT A BUG. ────────────────────
 * Measured 2026-08-07: 25 POSTs to /api/chat through `npx expo start` (:8082) returned 25 passes.
 * The same 25 through the exported bundle (`npx expo export -p web` + `npx expo serve`, :8090)
 * returned 20 passes then 429s. The dev server re-evaluates the route module per request to pick
 * up edits, which re-creates `buckets` empty every time; the production server evaluates it once.
 *
 * So: VERIFY AGAINST THE EXPORTED BUNDLE, NEVER AGAINST :8082. A dev-server run looks exactly
 * like a broken limiter, and "fixing" it would mean rewriting working code.
 */

import { verifiedUserId } from './_identity';

type Bucket = { count: number; resetAt: number };

/**
 * Fixed-window counters keyed by `${identity}:${scope}`.
 *
 * Fixed window rather than sliding: a sliding window needs a timestamp list per key, which is more
 * memory per identity for a budget that is already coarse. The known cost is a burst across a
 * window boundary — up to 2× the limit in a short span. Acceptable at these budgets; state it
 * rather than pretend the window is smooth.
 */
const buckets = new Map<string, Bucket>();

/**
 * Drop expired entries.
 *
 * NOT optional. Without it, an attacker rotating the identity header grows this map without bound
 * and the limiter becomes its own memory-exhaustion vector — the thing it was added to prevent.
 * Swept on write so there is no timer to leak in a Worker isolate.
 */
function sweep(now: number) {
  for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
}

export type Verdict = { ok: true } | { ok: false; retryAfter: number };

/**
 * Consume one unit against `key`.
 *
 * @param key      identity + scope, e.g. `"<installId>:chat"`
 * @param limit    requests allowed per window
 * @param windowMs window length in ms
 */
export function take(key: string, limit: number, windowMs: number): Verdict {
  const now = Date.now();
  sweep(now);

  const b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  if (b.count < limit) {
    b.count += 1;
    return { ok: true };
  }
  // Ceil so a caller that waits exactly `Retry-After` seconds is past the reset, not on it.
  return { ok: false, retryAfter: Math.max(1, Math.ceil((b.resetAt - now) / 1000)) };
}

/** The 429 response. Carries `Retry-After` so a client can back off instead of spinning. */
export function limited(v: Extract<Verdict, { ok: false }>): Response {
  return Response.json(
    { error: 'rate_limited', retryAfter: v.retryAfter },
    { status: 429, headers: { 'Retry-After': String(v.retryAfter) } },
  );
}

/**
 * Identity for the bucket key.
 *
 * The client sends a stable per-install id. A MISSING header is not an error and not a bypass —
 * it collapses to a single shared `anon` bucket, which every anonymous caller competes for. Since
 * `anon` budgets are divided by ANON_DIVISOR at the call site, stripping the header is strictly
 * worse for the caller than sending it. That is the point: make the honest path the cheap one.
 *
 * Deliberately NOT keyed on IP — behind a CDN that is the edge node, so it would lump unrelated
 * users together and let one noisy network throttle a whole region.
 *
 * THE HEADER IS UNAUTHENTICATED. A caller can send any string, so this bounds ACCIDENTAL and
 * casual abuse, not a determined attacker — one who rotates the header gets a fresh bucket each
 * time. Saying otherwise would be the "global limiter" claim above in a different costume. The fix
 * is the same one: a real identity, which is why `lib/auth.ts` already sits in front of this.
 */
export function identify(request: Request): string {
  const id = request.headers.get('x-euphoria-install')?.trim();
  // Bound the length so a caller cannot use the key itself as a memory amplifier.
  return id && id.length <= 64 ? `i:${id}` : 'anon';
}

/**
 * The identity to bill, preferring one the SERVER established over one the caller asserted.
 *
 * NAMESPACED ON PURPOSE. `u:` for a verified subject, `i:` for a self-declared install id. Without
 * the prefixes the two namespaces share a keyspace, and a caller who sets their install header to
 * somebody's user id lands in that person's bucket — which is either a way to exhaust a stranger's
 * budget or a way to borrow it, depending on who gets there first. Two identities that mean
 * different things must not be able to collide.
 */
export async function identifyVerified(request: Request): Promise<string> {
  const sub = await verifiedUserId(request);
  return sub ? `u:${sub}` : identify(request);
}

/** Anonymous callers get a third of the budget. */
export const ANON_DIVISOR = 3;

/** Budget for a scope, tightened when the caller declined to identify itself. */
export function budgetFor(identity: string, limit: number): number {
  return identity === 'anon' ? Math.max(1, Math.floor(limit / ANON_DIVISOR)) : limit;
}

/**
 * One-call guard. Returns a `Response` to return immediately, or `null` to proceed.
 *
 * Usage at the top of a handler, BEFORE any upstream call — the whole point is to not spend the
 * quota:
 *   const gate = guard(request, 'chat', 20, 5 * 60_000);
 *   if (gate) return gate;
 */
export async function guard(
  request: Request,
  scope: string,
  limit: number,
  windowMs: number,
): Promise<Response | null> {
  const id = await identifyVerified(request);
  const v = take(`${id}:${scope}`, budgetFor(id, limit), windowMs);
  return v.ok ? null : limited(v);
}

if (__DEV__) {
  // One runnable check on the money path. A limiter that never limits looks identical to a working
  // one from the outside — it just quietly costs money — so assert the behaviour that must hold.
  const k = `selftest-${Math.random()}`;
  let allowed = 0;
  for (let i = 0; i < 5; i++) if (take(k, 3, 60_000).ok) allowed += 1;
  if (allowed !== 3) console.error(`[limit] expected 3 allowed, got ${allowed}`);
  const denied = take(k, 3, 60_000);
  if (denied.ok) console.error('[limit] 4th call should have been denied');
  else if (denied.retryAfter < 1) console.error('[limit] retryAfter must be >= 1');
  if (budgetFor('anon', 30) !== 10) console.error('[limit] anon budget should be a third');
  if (budgetFor('abc', 30) !== 30) console.error('[limit] identified budget should be full');
}
