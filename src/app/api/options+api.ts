/**
 * Options chain proxy — marketdata.app, with Tradier as a fallback.
 *
 * ── WHY THIS MOVED OFF TRADIER ──────────────────────────────────────────────────────────────
 * Tradier's sandbox is free and returns a full chain with greeks, and it was the right choice on
 * the evidence available then. The problem is not the API, it is the door: signing up walks into a
 * BROKERAGE account flow asking for SSN and employment details. For a data-only need on a paper
 * trading app that is an absurd price of entry, and it left this route dead — `TRADIER_TOKEN` was
 * never set, so the options desk answered 503 and fell back to the Black-Scholes teaching model.
 *
 * marketdata.app needs only an EMAIL, no identity documents. Verified live 2026-08-13:
 *
 *   GET /v1/options/chain/AAPL/?expiration=2026-09-18  ->  HTTP 203, 93 contracts
 *   fields: bid ask mid last iv delta gamma theta vega openInterest volume strike dte inTheMoney
 *   GET /v1/options/expirations/AAPL/                  ->  20+ real expiry dates
 *
 * **AND A CORRECTION MADE THE SAME HOUR.** Those calls used NO token, and it was briefly recorded
 * here that the provider needs no account at all. It does. **AAPL is their demo symbol and is the
 * only one served unauthenticated** — `GET /v1/options/expirations/TSLA/` answers
 * `401 {"s":"error","errmsg":"Invalid token header. No credentials provided."}`. Testing one ticker
 * and generalising is how that got written down; testing a second is how it got caught.
 *
 * That is a SUPERSET of what Tradier was asked for. **203 is not an error** — it is
 * "Non-Authoritative Information", which this provider uses to mark a delayed/free-tier response.
 * Treat 200 and 203 as success; a strict `res.ok` check passes both, but do not "fix" a 203.
 *
 * Delayed is not a compromise here, it is honest: the desk is capped at three previews, the app
 * teaches rather than trades, and the alternative this replaces was a textbook model with no market
 * behind it at all.
 *
 * ── THE OPTIONAL TOKEN ──────────────────────────────────────────────────────────────────────
 * `MARKETDATA_TOKEN` IS REQUIRED for any symbol except AAPL — see the correction above. It is free
 * and needs only an email, which is the entire reason this route left Tradier.
 *
 * It also buys us our own quota rather than whatever the Worker's shared egress IP is allotted.
 * That is not hypothetical: Alpha Vantage silently throttled this same deployment by IP on the day
 * this was written (§22, `[market] alphavantage refused`).
 *
 * ── TRADIER IS KEPT, NOT DELETED ────────────────────────────────────────────────────────────
 * It runs only if `TRADIER_TOKEN` exists AND marketdata.app failed. That is not dead code hedging:
 * it is one working provider behind another, costing ten lines, on a route whose upstream is now an
 * unauthenticated free tier that can rate-limit us without warning.
 *
 * Actions, and the response shape is UNCHANGED so no screen has to move:
 *   ?action=expirations&sym=AAPL              -> { sym, expirations: string[] }
 *   ?action=chain&sym=AAPL&expiry=2026-09-18  -> { sym, expiry, contracts: [...] }
 */

import {
  chainPath,
  type Contract,
  expiriesFromCboe,
  spotFromCboe,
  fromCboe,
  fromMarketdata,
  fromTradier,
  many,
} from '@/lib/server/chain';
import { decide, refuse } from '@/lib/server/entitlement';
import { verifiedUserId } from '@/lib/server/identity';
import { guard } from '@/lib/server/limit';
import { ALL_SYMS } from '@/lib/stocks';
import { isoDate, symbol } from '@/lib/server/validate';

const CBOE_BASE = 'https://cdn.cboe.com/api/global/delayed_quotes/options';
const MD_BASE = 'https://api.marketdata.app/v1/options';
const TRADIER_BASE = 'https://sandbox.tradier.com/v1/markets/options';

type Raw = Record<string, unknown>;

async function marketdata(path: string): Promise<Raw> {
  const token = process.env.MARKETDATA_TOKEN;
  const res = await fetch(`${MD_BASE}${path}`, {
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  // 203 is this provider's "here it is, but delayed". `res.ok` covers 200-299, so both pass.
  if (!res.ok) {
    console.error('[options] marketdata', res.status, (await res.text()).slice(0, 200));
    throw new Error(`marketdata_${res.status}`);
  }
  const j = (await res.json()) as Raw;
  /*
   * This API reports failure INSIDE a successful response: `{"s":"error"}` or `{"s":"no_data"}`.
   * Reading only the HTTP status would turn a refusal into an empty chain — the exact shape of the
   * Alpha Vantage bug found the same day, where a throttle arrived as 200 and read as "no news".
   */
  if (j.s !== 'ok') {
    console.error('[options] marketdata said', String(j.s), String(j.errmsg ?? '').slice(0, 160));
    throw new Error(`marketdata_${String(j.s)}`);
  }
  return j;
}

/**
 * Cboe's delayed quotes — the PRIMARY chain source, and the reason is not preference.
 *
 * marketdata.app answers **403 to the deployed Worker** while serving the identical token from a
 * laptop: its egress IP is blocked. Options was dead in production and every local check passed,
 * which is §5.2's Alpha Vantage lesson arriving through a different provider. A provider that works
 * from a developer machine is not a provider that works.
 *
 * Cboe operates the options exchanges and publishes this with NO KEY, so there is no quota to
 * exhaust, no per-contract billing, and nothing to leak. One response carries every expiry, so the
 * cache key is the SYMBOL — 7 of them, not 56.
 *
 * It is large (~1.7 MB for NVDA, 3,794 contracts), which is why filtering happens in `_chain.ts`
 * rather than by asking the provider for less. NOTE: this response is NO LONGER edge-cached — the
 * route is entitlement-gated and a shared cache cannot see who is asking. See `cached()` below.
 */
async function cboe(sym: string): Promise<Raw> {
  const res = await fetch(`${CBOE_BASE}/${sym}.json`, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    console.error('[options] cboe', res.status);
    throw new Error(`cboe_${res.status}`);
  }
  const j = (await res.json()) as Raw;
  // Same silent-failure guard as marketdata: a 200 carrying no options is a refusal, not a quiet
  // market. Reading only the status would render an empty chain and look like a holiday.
  if (!((j.data as Raw | undefined)?.options as unknown[] | undefined)?.length) {
    throw new Error('cboe_no_data');
  }
  return j;
}

async function tradier(path: string, token: string): Promise<Raw> {
  const res = await fetch(`${TRADIER_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  if (!res.ok) {
    // Never forward an upstream body — it can echo the token back.
    console.error('[options] tradier', res.status, (await res.text()).slice(0, 300));
    throw new Error(`tradier_${res.status}`);
  }
  return res.json() as Promise<Raw>;
}

export async function GET(request: Request) {
  const gate = await guard(request, 'options', 30, 60_000);
  if (gate) return gate;

  // F7. The options desk is a Pro feature and was gated only on the client. Same no-op-until-
  // configured behaviour as the chat route; see `_entitlement.ts`.
  const paid = await decide(await verifiedUserId(request));
  if (!paid.allow) return refuse(paid);

  /*
   * CACHING IS A COST CONTROL HERE, not a latency tweak.
   *
   * marketdata.app bills per CONTRACT (see `_chain.ts`), so provider spend is driven by how many
   * times we call it — which, uncached, scales with the number of USERS. Cached at the edge it
   * scales with the number of DISTINCT (symbol, expiry) PAIRS instead, and that is a small fixed
   * number: 7 underlyings x 8 expiries. One user or ten thousand cost the same.
   *
   * ── WHY ONE HOUR, WHICH IS ARITHMETIC AND NOT TASTE ────────────────────────────────────────
   * The ceiling is `combinations × refreshes-per-day × credits-per-refresh`. There are 7 underlyings
   * × 8 expiries = **56** distinct cache keys, and a chain costs 32 credits (`STRIKE_WINDOW`).
   *
   *   15 min TTL → 56 × 96 × 32 = **172,032/day**  ← EXCEEDS the 100,000 allowance
   *   30 min TTL → 56 × 48 × 32 =  86,016/day      ← under, but only 14% headroom
   *   60 min TTL → 56 × 24 × 32 =  **43,008/day**  ← ~2.3× headroom, plus ~168 for expirations
   *
   * The first draft of this shipped at 15 minutes, which is over the limit if every combination
   * stays warm. That worst case needs demand round the clock on all 56, which a young app will not
   * have — but "probably under the limit" is not a ceiling, and the failure mode is every user
   * seeing an error for the rest of the day.
   *
   * An hour is honest because the data is ALREADY delayed: marketdata answers `203
   * Non-Authoritative`, which is the free tier saying it is not real time, and the screen says
   * "Delayed" in as many words. An hour-old delayed chain and a fresh delayed chain are both "not
   * live"; only one of them can run the account dry.
   *
   * `stale-while-revalidate` costs nothing extra — it only revalidates when a request arrives, so an
   * idle combination is free. RAISING `STRIKE_WINDOW` OR ADDING UNDERLYINGS CHANGES THIS SUM. Redo
   * it, against `x-api-ratelimit-limit` read from a live response rather than from this comment.
   *
   * ERRORS GET `no-store`, and that is the half people forget. EAS Hosting edge-caches GET API
   * routes (§4 of the carryover — it is what made a live options route serve a cached 503 for an
   * hour). Cache a 502 and every user gets the outage until the TTL expires, long after the upstream
   * recovered.
   */
  /*
   * `private`, NOT `public`. THIS ROUTE IS PAYWALLED AND THE EDGE CACHE DOES NOT KNOW THAT.
   *
   * Found in security review 2026-08-14, and it was introduced by the caching commit earlier the
   * same day. `decide()` runs above, then the success response was returned with
   * `public, s-maxage=3600`. The CDN's cache key is the URL — symbol and expiry — with no notion of
   * who is asking. A cache HIT is served from the edge WITHOUT re-invoking the Worker, so the
   * entitlement check never runs again. One entitled caller warming AAPL's front month would have
   * handed the same chain to every anonymous caller for an hour: not a weakened gate, an absent one.
   *
   * It is invisible today only because entitlement is `not-enforced` while REVENUECAT_SECRET_KEY is
   * unset — so there is nothing yet to bypass. It would have become a full paywall bypass on the
   * day that secret was set, which is the same "about to go live" timing as the `_identity.ts` work.
   *
   * `private` keeps the DEVICE cache (a repeat view costs nothing) and forbids shared caches. The
   * cost control this replaces mattered when the provider billed per contract; Cboe is free and
   * keyless, so the thing being protected now is Worker CPU, not a quota.
   */
  const cached = (body: unknown) =>
    Response.json(body, {
      headers: { 'Cache-Control': 'private, max-age=300' },
    });
  const fresh = (body: unknown, status: number) =>
    Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

  const url = new URL(request.url);
  const action = url.searchParams.get('action') ?? '';
  // Validated, not merely uppercased: `sym` lands in an upstream path and query string, where an
  // unescaped `&` starts a parameter we did not write and `../` walks to another endpoint.
  const sym = symbol(url.searchParams.get('sym'));
  if (!sym) return fresh({ error: 'bad_sym' }, 400);
  /*
   * MEMBERSHIP, not just shape. `symbol()` proves a string LOOKS like a ticker; it does not prove
   * this app offers it.
   *
   * Security review 2026-08-14: `_chain.ts` sizes its cache and cost model on a CLOSED universe —
   * seven underlyings — but nothing enforced that, so varying `sym` across shape-valid strings
   * forced a fresh uncached upstream fetch every time and defeated the ceiling by construction.
   *
   * This route can close the set because the SCREEN can: `options.tsx` renders exactly these seven
   * chips and offers no way to ask for anything else, so a request for anything else did not come
   * from our UI. `/api/market` deliberately does NOT do this — "search every listed stock" is a
   * real feature there, and closing that set would break it.
   */
  if (!ALL_SYMS.includes(sym)) return fresh({ error: 'unsupported_sym' }, 400);

  const tradierToken = process.env.TRADIER_TOKEN;

  try {
    if (action === 'expirations') {
      let dates: string[];
      try {
        dates = expiriesFromCboe(await cboe(sym));
      } catch (primary) {
        console.error('[options] cboe expirations failed, trying marketdata', String(primary));
        try {
          const j = await marketdata(`/expirations/${sym}/`);
          dates = (Array.isArray(j.expirations) ? j.expirations : []).map(String);
        } catch (e) {
          if (!tradierToken) throw e;
          const d = await tradier(`/expirations?symbol=${sym}&includeAllRoots=true`, tradierToken);
          dates = many<string>((d?.expirations as Raw | undefined)?.date as string | string[]);
        }
      }
      return cached({ sym, expirations: dates.slice(0, 8) });
    }

    if (action === 'chain') {
      const expiry = isoDate(url.searchParams.get('expiry'));
      if (!expiry) return fresh({ error: 'bad_expiry' }, 400);

      let contracts: Contract[];
      // The spot that PRODUCED this chain, so the screen's headline cannot disagree with its strikes.
      // 0 means we do not know, and the client keeps its own mark rather than rendering a zero.
      let spot = 0;
      try {
        const j = await cboe(sym);
        spot = spotFromCboe(j);
        contracts = fromCboe(j, expiry);
        // An expiry Cboe does not list yields an empty array, not an error. Fall through to the
        // other providers rather than rendering an empty chain as "no contracts today".
        if (contracts.length === 0) throw new Error('cboe_expiry_absent');
      } catch (primary) {
        console.error('[options] cboe chain failed, trying marketdata', String(primary));
        try {
          contracts = fromMarketdata(await marketdata(chainPath(sym, expiry)));
        } catch (e) {
          if (!tradierToken) throw e;
          contracts = fromTradier(
            await tradier(`/chains?symbol=${sym}&expiration=${expiry}&greeks=true`, tradierToken),
          );
        }
      }

      return cached({ sym, expiry, spot, contracts });
    }

    return fresh({ error: 'bad_action' }, 400);
  } catch (e) {
    /*
     * NAME THE REFUSAL. §5.1 is the most expensive lesson in this repo: three separate times, a
     * refusal WE caused was reported as a failure THEY caused, and each one sent the next person to
     * check the key, the network and the provider's status page while all three were fine.
     *
     * This route collapsed EVERY failure into `{"error":"upstream"}` with a 502 — and on 2026-08-14
     * that cost real time. Options was down in production, the body said "upstream", and there was
     * no way to tell a blocked egress IP from an exhausted quota from a bad token without deploying
     * a change to find out. Meanwhile `/api/market` answered 200 from the same Worker, so it was
     * never an outage.
     *
     * The upstream STATUS is safe to surface — it is a number, not a body. The body is deliberately
     * never forwarded: `tradier()` notes it can echo the token back.
     */
    const msg = e instanceof Error ? e.message : String(e);
    const code = /^marketdata_(\d+)$/.exec(msg)?.[1];
    const upstream = code ? Number(code) : 0;
    console.error('[options] failed', msg);

    // 429 is OURS to report honestly, and it is not a 502: the provider is fine, we asked too often.
    if (upstream === 429) return fresh({ error: 'rate_limited', upstream }, 429);
    // 401/403 means the token or the caller was refused — a CONFIG problem, not an outage. Polygon's
    // plan limit taught this exact distinction (`501 plan_required`, §5.1).
    if (upstream === 401 || upstream === 403) return fresh({ error: 'provider_refused', upstream }, 502);
    /*
     * `reason` IS ALLOWLISTED, NOT PASSED THROUGH, and that is a fix for a leak this handler
     * introduced when it was written earlier today.
     *
     * Most throws here are our own labels — `cboe_403`, `marketdata_no_data`, `cboe_expiry_absent`.
     * But `res.json()` throws a SyntaxError whose message EMBEDS A FRAGMENT OF THE UPSTREAM BODY:
     * `Unexpected token 'o', "not json" is not valid JSON`. Echoing `e.message` therefore forwards
     * upstream bytes to the client on exactly the malformed-response path where we understand least
     * about what those bytes are. `tradier()` above already states the rule — "never forward an
     * upstream body, it can echo the token back" — and this violated it two functions later.
     *
     * So: only shapes WE mint escape. Anything else becomes `unknown`, and the detail stays in the
     * server log where it is useful and unreachable.
     */
    const safeReason = /^[a-z]+_[a-z0-9_]+$/.test(msg) ? msg : 'unknown';
    return fresh({ error: 'upstream', upstream: upstream || undefined, reason: safeReason }, 502);
  }
}
