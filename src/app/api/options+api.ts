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

import { type Contract, fromMarketdata, fromTradier, many } from './_chain';
import { decide, refuse } from './_entitlement';
import { verifiedUserId } from './_identity';
import { guard } from './_limit';
import { isoDate, symbol } from './_validate';

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

  const url = new URL(request.url);
  const action = url.searchParams.get('action') ?? '';
  // Validated, not merely uppercased: `sym` lands in an upstream path and query string, where an
  // unescaped `&` starts a parameter we did not write and `../` walks to another endpoint.
  const sym = symbol(url.searchParams.get('sym'));
  if (!sym) return Response.json({ error: 'bad_sym' }, { status: 400 });

  const tradierToken = process.env.TRADIER_TOKEN;

  try {
    if (action === 'expirations') {
      let dates: string[];
      try {
        const j = await marketdata(`/expirations/${sym}/`);
        dates = (Array.isArray(j.expirations) ? j.expirations : []).map(String);
      } catch (e) {
        if (!tradierToken) throw e;
        const d = await tradier(`/expirations?symbol=${sym}&includeAllRoots=true`, tradierToken);
        dates = many<string>((d?.expirations as Raw | undefined)?.date as string | string[]);
      }
      return Response.json({ sym, expirations: dates.slice(0, 8) });
    }

    if (action === 'chain') {
      const expiry = isoDate(url.searchParams.get('expiry'));
      if (!expiry) return Response.json({ error: 'bad_expiry' }, { status: 400 });

      let contracts: Contract[];
      try {
        contracts = fromMarketdata(await marketdata(`/chain/${sym}/?expiration=${expiry}`));
      } catch (e) {
        if (!tradierToken) throw e;
        contracts = fromTradier(
          await tradier(`/chains?symbol=${sym}&expiration=${expiry}&greeks=true`, tradierToken),
        );
      }

      return Response.json({ sym, expiry, contracts });
    }

    return Response.json({ error: 'bad_action' }, { status: 400 });
  } catch (e) {
    console.error('[options] failed', e);
    return Response.json({ error: 'upstream' }, { status: 502 });
  }
}
