/**
 * Options chain proxy — Tradier.
 *
 * WHY TRADIER AND NOT POLYGON: we already proxy Polygon for equities, but its options chain sits
 * behind a paid Options plan. Tradier's SANDBOX is free, returns delayed quotes, and gives a full
 * chain with greeks (IV, delta, gamma, theta, vega) for every strike and expiry. For a paper
 * trading app that teaches, delayed is not a compromise — it is honest, and it is what a free
 * account can stand behind. Swapping to Polygon/Massive options later is this file only.
 *
 * Actions:
 *   ?action=expirations&sym=AAPL          -> the expiry dates that actually exist
 *   ?action=chain&sym=AAPL&expiry=2026-09-18 -> every strike, both sides, with greeks
 *
 * Without TRADIER_TOKEN both answer 503 `not_configured`, and the screen falls back to the
 * Black-Scholes teaching model — clearly labelled as a model, never as a quote.
 */

import { decide, refuse } from './_entitlement';
import { verifiedUserId } from './_identity';
import { guard } from './_limit';
import { isoDate, symbol } from './_validate';

const BASE = 'https://sandbox.tradier.com/v1/markets/options';

type Raw = Record<string, unknown>;

async function tradier(path: string, token: string) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  if (!res.ok) {
    // Never forward an upstream body — it can echo the token back.
    console.error('[options] upstream', res.status, (await res.text()).slice(0, 300));
    throw new Error(`upstream_${res.status}`);
  }
  return res.json();
}

/** Tradier returns a bare object when a collection has exactly one member. */
const many = <T,>(v: T | T[] | null | undefined): T[] => (Array.isArray(v) ? v : v ? [v] : []);

export async function GET(request: Request) {
  const gate = await guard(request, 'options', 30, 60_000);
  if (gate) return gate;

  // F7. The options desk is a Pro feature and was gated only on the client. Same no-op-until-
  // configured behaviour as the chat route; see `_entitlement.ts`.
  const paid = await decide(await verifiedUserId(request));
  if (!paid.allow) return refuse(paid);

  const token = process.env.TRADIER_TOKEN;
  if (!token) return Response.json({ error: 'not_configured' }, { status: 503 });

  const url = new URL(request.url);
  const action = url.searchParams.get('action') ?? '';
  // Validated, not merely uppercased: `sym` is concatenated straight into Tradier's query string
  // below, where an unescaped `&` starts a parameter we did not write.
  const sym = symbol(url.searchParams.get('sym'));
  if (!sym) return Response.json({ error: 'bad_sym' }, { status: 400 });

  try {
    if (action === 'expirations') {
      const d = await tradier(`/expirations?symbol=${sym}&includeAllRoots=true`, token);
      const dates = many<string>((d?.expirations as Raw | undefined)?.date as string | string[]);
      return Response.json({ sym, expirations: dates.slice(0, 8) });
    }

    if (action === 'chain') {
      const expiry = isoDate(url.searchParams.get('expiry'));
      if (!expiry) return Response.json({ error: 'bad_expiry' }, { status: 400 });
      const d = await tradier(`/chains?symbol=${sym}&expiration=${expiry}&greeks=true`, token);
      const raw = many<Raw>((d?.options as Raw | undefined)?.option as Raw | Raw[]);

      const contracts = raw.map((o) => {
        const g = (o.greeks ?? {}) as Raw;
        const bid = Number(o.bid) || 0;
        const ask = Number(o.ask) || 0;
        return {
          symbol: String(o.symbol ?? ''),
          kind: o.option_type === 'put' ? 'put' : 'call',
          strike: Number(o.strike) || 0,
          bid,
          ask,
          // What you would actually pay to open. Mid is the fair reference; ask is the truth for a
          // buyer, so the UI quotes ask and shows mid alongside it.
          mid: bid && ask ? (bid + ask) / 2 : ask || bid,
          iv: Number(g.mid_iv ?? g.smv_vol) || 0,
          delta: Number(g.delta) || 0,
          openInterest: Number(o.open_interest) || 0,
          volume: Number(o.volume) || 0,
        };
      });

      return Response.json({ sym, expiry, contracts });
    }

    return Response.json({ error: 'bad_action' }, { status: 400 });
  } catch (e) {
    console.error('[options] failed', e);
    return Response.json({ error: 'upstream' }, { status: 502 });
  }
}
