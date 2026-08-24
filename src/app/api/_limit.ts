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
 * limiter anywhere.
 *
 * ── MEASURED, 2026-08-14. IT IS WEAKER THAN "WEAK". ─────────────────────────────────────────
 * Against production, all with the SAME `x-euphoria-install` id, so a working limiter would have
 * refused nearly all of them:
 *   100 concurrent requests to /api/market  ->   0 refused by us
 *    25 concurrent requests to /api/chat    ->   1 refused by us
 * Under concurrency each request lands on its own isolate and sees an empty bucket, so this is
 * effectively NOT a limiter against exactly the burst it exists to stop. The only thing actually
 * rate-limiting this app today is the upstream: Polygon allows 5 requests a minute, and Gemini
 * throttles under load.
 *
 * ── THE UPGRADE PATH THAT USED TO BE WRITTEN HERE DOES NOT EXIST ON THIS PLATFORM ────────────
 * This block previously offered "1. Cloudflare Durable Object, 2. Workers KV, 3. Upstash Redis"
 * and called any of the three a drop-in. **1 and 2 are not available on EAS Hosting.** It is a
 * MANAGED Workers platform: there is no `wrangler.toml`, `eas deploy` exposes no binding flags, and
 * the documented persistence options are all external services reached over HTTP. A Durable Object
 * or a KV namespace needs a binding you cannot declare here. Checked 2026-08-14 before writing this.
 *
 * So the real path is a store reachable over plain HTTP, and every option costs a credential:
 *   - Upstash Redis — free tier, REST API, one token. Smallest change, and the natural fit.
 *   - Supabase — already planned for `_identity.ts`, so it adds no NEW dependency.
 *   - Cloudflare D1 / Turso — heavier than a counter needs.
 * Whichever is chosen replaces `take()` and nothing else in the codebase moves.
 *
 * DO NOT "fix" this with `caches.default` as a shared counter. It is per-colo rather than global,
 * and a read-modify-write over a cache has no atomicity — under the concurrent burst that defeats
 * the current limiter it would undercount too, while LOOKING like a control. A control that cannot
 * be trusted is worse than a documented gap.
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
    /*
     * `no-store` matters as much as the status. EAS Hosting caches GET responses that carry no
     * Cache-Control, with a default TTL nobody has read (§9.2) — so ONE throttled caller could have
     * their 429 cached and served to every other caller of the same URL. The routes' own `fresh()`
     * wrappers exist for exactly this, and this response is returned BEFORE reaching them.
     */
    { status: 429, headers: { 'Retry-After': String(v.retryAfter), 'Cache-Control': 'no-store' } },
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

/**
 * THE NETWORK BUCKET — a second, independent limit that a caller cannot rotate away.
 *
 * `identify()`'s own comment says a determined caller "rotates the header [and] gets a fresh bucket
 * each time", and treats a real identity as the only answer. That is right about identity and wrong
 * about the interim: there IS a second signal here, and the reason recorded for skipping it does not
 * hold on this platform. The note says IP would be "the edge node, behind a CDN". EAS Hosting is a
 * MANAGED CLOUDFLARE WORKERS platform — this file establishes that a few lines up — and Cloudflare
 * sets `cf-connecting-ip` to the TRUE client address, not the edge. The edge-node objection applies
 * to a naive `x-forwarded-for` read, which is why that is only the fallback here.
 *
 * WHY THE NETWORK BUDGET IS DELIBERATELY HUGE. A school, a library and anyone behind carrier-grade
 * NAT share one address. Sized like a per-user limit this would let one classroom throttle itself,
 * which is exactly the failure the original note was protecting against — the objection was sound
 * even though its stated mechanism was not. At NETWORK_MULTIPLIER the bucket is far above any
 * plausible shared-network load and only trips on abuse that a single actor is generating.
 *
 * HONEST CEILING, because a control that overclaims is worse than none: this does NOT make the
 * limiter global. It is still the same per-isolate Map, so it inherits the concurrency gap measured
 * above, and a caller with a proxy pool gets a fresh address the same way they got a fresh header.
 * What it removes is the FREE bypass — rotating a header you already control, which costs nothing.
 * Making abuse require real infrastructure is worth having while the shared store is unbuilt.
 */
const NETWORK_MULTIPLIER = 12;

export function networkKey(request: Request): string {
  // Cloudflare's own header first: it is set by the edge and cannot be spoofed by the client,
  // because Cloudflare overwrites whatever the caller sent.
  const cf = request.headers.get('cf-connecting-ip')?.trim();
  if (cf) return `n:${cf}`;
  // Fallback only. X-Forwarded-For IS caller-writable, so the leftmost entry is untrusted — it is
  // still better than nothing for casual abuse, and it is never the only control.
  const xff = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (xff && xff.length <= 64) return `n:${xff}`;
  return 'n:unknown';
}

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
  if (!v.ok) return limited(v);

  /*
   * BOTH buckets must have room. Checked AFTER the identity bucket so a caller who is simply over
   * their own limit still gets the precise per-identity Retry-After rather than the network one.
   *
   * A verified user is exempt: `u:` means the server established who they are, so they are already
   * rate-limited as a person and should not additionally be punished for sharing a school's IP with
   * thirty classmates. The network bucket exists to make the SELF-ASSERTED path unprofitable.
   */
  if (id.startsWith('u:')) return null;
  const n = take(`${networkKey(request)}:${scope}`, limit * NETWORK_MULTIPLIER, windowMs);
  return n.ok ? null : limited(n);
}

if (__DEV__) {
  /*
   * THE BYPASS THIS EXISTS TO CLOSE, asserted rather than described. A caller rotating
   * `x-euphoria-install` used to get a fresh budget on every single request, forever, for free.
   * The network bucket must stop that. If this ever passes with the network check removed, the
   * control is decorative.
   */
  const netProbe = (n: number) => {
    const headers = new Headers({ 'cf-connecting-ip': '203.0.113.7' });
    let served = 0;
    for (let i = 0; i < n; i++) {
      headers.set('x-euphoria-install', `rotating-${String(i)}`);
      // Mirrors guard()'s two takes without needing an async context here.
      const idKey = `i:rotating-${String(i)}:probe`;
      if (!take(idKey, 5, 60_000).ok) continue;
      if (take('n:203.0.113.7:probe', 5 * NETWORK_MULTIPLIER, 60_000).ok) served += 1;
    }
    return served;
  };
  const served = netProbe(200);
  if (served >= 200) {
    console.error('[limit] header rotation still buys an unlimited budget — the network bucket is not working');
  }
  if (served !== 5 * NETWORK_MULTIPLIER) {
    console.error(`[limit] expected the network bucket to cap a rotating caller at ${String(5 * NETWORK_MULTIPLIER)}, got ${String(served)}`);
  }

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
