/**
 * Server-side entitlement — F7.
 *
 * The leading underscore keeps expo-router from treating this as a route.
 *
 * ── THE HOLE THIS EXISTS TO CLOSE ───────────────────────────────────────────────────────────
 * `atlas` and `options` are PAID features in `entitlement.ts`'s `Feature` union, and every check
 * was client-side. Grep `src/app/api/` for `isPro`, `tier(` or `entitlement` before this file and
 * you get nothing. So `/api/chat` — which spends real Gemini tokens — was available to anyone who
 * knew the URL, regardless of trial state, expiry, or whether they had ever paid.
 *
 * That is a DIFFERENT bug from the rate limit. F1 was "one caller can spend too much". This is
 * "a caller entitled to nothing can spend anything at all", and it stopped being theoretical the
 * moment Atlas actually started answering.
 *
 * ── FAILS OPEN, DELIBERATELY, AND NOT OUT OF LAZINESS ───────────────────────────────────────
 * `purchases.ts` already establishes the rule this follows: **a network failure must never revoke a
 * paying member's access.** Doing so reads as "I paid and it locked me out", generates the worst
 * support mail there is, and is indistinguishable from a real lapse in the logs.
 *
 * So every uncertain path here ALLOWS: no secret configured, RevenueCat unreachable, a 5xx, a
 * malformed body, a timeout. The only thing that DENIES is RevenueCat affirmatively answering that
 * this subscriber has no active entitlement. Being wrong in the open direction costs tokens; being
 * wrong in the closed direction costs a customer.
 *
 * ── THE ROLLOUT, WHICH IS THREE STEPS AND ONLY ONE IS DONE ──────────────────────────────────
 *   1. **Today.** `REVENUECAT_SECRET_KEY` unset → this module allows everything and behaviour is
 *      byte-identical to before it existed. Rate limits are the only bound.
 *   2. **Secret set, sign-in shipped.** Verified callers are checked against RevenueCat. A signed-in
 *      non-payer can no longer spend our tokens.
 *   3. **`ATLAS_REQUIRE_AUTH=1`.** Anonymous callers are refused outright. **Only this step actually
 *      closes F7**, because the attack is anonymous — someone with the URL and no account. Steps 1
 *      and 2 must not be described as having closed it.
 *
 * Do not skip to step 3 before sign-in exists. There is no sign-in UI yet, so today every real user
 * is anonymous and requiring auth would refuse the entire userbase.
 */

/** Cheap, bounded memo. An entitlement lookup per chat turn is its own cost problem. */
type Cached = { entitled: boolean; at: number };
const cache = new Map<string, Cached>();
const TTL_MS = 5 * 60_000;
/** Bound the map for the same reason `_limit.ts` bounds its keys: it is keyed on caller input. */
const MAX_CACHED = 5_000;

export const ENTITLEMENT_ID = 'pro';

/** What the route needs to know, and why — so a 403 body can say something true. */
export type Decision =
  | { allow: true; reason: 'not-enforced' | 'entitled' | 'anonymous-allowed' | 'lookup-failed' }
  | { allow: false; reason: 'not-entitled' | 'auth-required' };

function remember(subject: string, entitled: boolean) {
  if (cache.size >= MAX_CACHED) cache.clear(); // coarse, but never unbounded
  cache.set(subject, { entitled, at: Date.now() });
}

/**
 * Ask RevenueCat whether this subscriber is entitled.
 *
 * Returns null when we could not find out — which the caller must treat as ALLOW, not as "no".
 */
async function lookup(subject: string, secret: string): Promise<boolean | null> {
  const hit = cache.get(subject);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.entitled;

  try {
    const res = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(subject)}`, {
      headers: { Authorization: `Bearer ${secret}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(2500),
    });
    // 404 is a REAL answer: RevenueCat has never seen this subscriber, so they have never paid.
    if (res.status === 404) {
      remember(subject, false);
      return false;
    }
    if (!res.ok) {
      console.error('[entitlement] revenuecat', res.status);
      return null;
    }
    const data = await res.json();
    const ent = data?.subscriber?.entitlements?.[ENTITLEMENT_ID];
    if (!ent) {
      remember(subject, false);
      return false;
    }
    /*
     * `expires_date` null means a non-expiring entitlement (lifetime). A date in the past is a
     * lapse. Note this does NOT re-implement the billing-retry grace from `lib/billing-retry.ts` —
     * that rule runs client-side off `customerInfo`, and duplicating it here would be a second copy
     * of a money rule, which is the thing this repo keeps extracting modules to avoid. A member
     * mid-retry may therefore be refused by this check while the client still grants them access.
     * Recorded as a known gap rather than papered over; the fix is to share one rule, not two.
     */
    const expires = ent.expires_date ? Date.parse(ent.expires_date) : null;
    const entitled = expires === null || (Number.isFinite(expires) && expires > Date.now());
    remember(subject, entitled);
    return entitled;
  } catch (e) {
    console.error('[entitlement] lookup failed', e);
    return null;
  }
}

/**
 * Decide whether this caller may spend our quota on a paid feature.
 *
 * @param subject the SERVER-VERIFIED user id, or null for an anonymous caller
 */
export async function decide(subject: string | null): Promise<Decision> {
  const secret = process.env.REVENUECAT_SECRET_KEY;
  // Step 1: nothing configured. Identical to the behaviour before this file existed.
  if (!secret) return { allow: true, reason: 'not-enforced' };

  if (!subject) {
    // Step 3. Off by default, because there is no sign-in UI and this would refuse everybody.
    if (process.env.ATLAS_REQUIRE_AUTH === '1') return { allow: false, reason: 'auth-required' };
    return { allow: true, reason: 'anonymous-allowed' };
  }

  const entitled = await lookup(subject, secret);
  if (entitled === null) return { allow: true, reason: 'lookup-failed' };
  return entitled ? { allow: true, reason: 'entitled' } : { allow: false, reason: 'not-entitled' };
}

/** The refusal. 402 rather than 403: this is "you have not paid", not "you may not ask". */
export function refuse(d: Extract<Decision, { allow: false }>): Response {
  /*
   * `no-store`, and this one fails in the direction that costs a CUSTOMER.
   *
   * EAS Hosting caches GET responses carrying no Cache-Control, on a default TTL nobody has read
   * (§9.2). This response had none. So a 402 for one unentitled caller could be cached against a
   * URL and then served to a PAYING user asking for the same symbol and expiry — refusing someone
   * who did pay, for as long as the TTL lasts.
   *
   * `purchases.ts` already holds the line that a network failure must never revoke a paying
   * member's access; a cached refusal is that same failure wearing a CDN. Dormant until
   * REVENUECAT_SECRET_KEY is set, which is exactly why it is fixed now rather than after.
   */
  return Response.json(
    { error: d.reason },
    {
      status: d.reason === 'auth-required' ? 401 : 402,
      headers: { 'Cache-Control': 'no-store' },
    },
  );
}
