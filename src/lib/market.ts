/**
 * Live market data client (Polygon, via `api/market+api.ts`).
 *
 * THE RULE THIS FILE EXISTS TO ENFORCE: when there is no API key, callers get `null`, never a
 * plausible-looking number. `lib/stocks.ts` still holds a small static table for the seeded
 * watchlist, and it would be very easy to quietly serve those as though they were live quotes.
 * That is precisely the class of thing this app has been removing — an invented $104,237.55
 * portfolio, a bezier posing as a chart. `null` forces the UI to say "not live" instead.
 */
import { ApiError, apiGet } from './api';
import { setChange, setMark, setMarkDate } from './marks';

/** Ranges the chart offers. Order matters — this is the row under the chart, left to right.
 *  TradingView, Bloom and Yahoo Finance all ship this control (3/3). */
export const RANGES = ['1H', '1D', '1W', '1M', '3M', 'YTD', '1Y', '5Y'] as const;
export type RangeKey = (typeof RANGES)[number];

export type Quote = {
  sym: string;
  price: number;
  change: number;
  changePct: number;
  /**
   * Epoch ms of the bar this price came from, or null if upstream omitted it. Present so a
   * caller can say how old a price is -- without it a three-week-old quote renders identically
   * to a live one, which is exactly what happened before it was added.
   */
  asOf?: number | null;
};
export type ChartPoint = { t: number; c: number };
export type Chart = { sym: string; range: RangeKey; label: string; points: ChartPoint[] };
export type TickerHit = { sym: string; name: string; exchange: string };
export type Article = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  published: string;
  /** -1..1 from Alpha Vantage. Absent when the article came from Polygon. */
  sentiment?: number;
  sentimentLabel?: string;
  /**
   * Article thumbnail — Alpha Vantage's `banner_image`, Polygon's `image_url`.
   *
   * OPTIONAL ON PURPOSE, and the UI must treat it that way. Alpha Vantage returns an empty string
   * for a large share of its feed, so a layout that REQUIRES an image would show holes on live
   * data, not just when the key is missing. Every consumer degrades to a text row instead — which
   * is also §0.4's rule: no placeholder art, ever.
   */
  image?: string;
};

/** True once any call has come back `not_configured`, so the UI can stop pretending live data is
 *  coming and say what is actually true. */
let liveUnavailable = false;
export const isLiveUnavailable = () => liveUnavailable;

/**
 * True once a call has been rate limited. Kept SEPARATE from `liveUnavailable` because the two
 * mean opposite things to a user: "this build has no key" is permanent and nothing they did,
 * "you are going too fast" is temporary and theirs to fix. One flag for both would make the
 * screen tell one of the two groups something false.
 *
 * Cleared on the next success, so a screen never keeps apologising after the window rolls over.
 */
let rateLimited = false;
export const isRateLimited = () => rateLimited;

async function safe<T>(path: string): Promise<T | null> {
  try {
    const out = await apiGet<T>(path);
    rateLimited = false;
    return out;
  } catch (e) {
    if (e instanceof ApiError && e.code === 'not_configured') liveUnavailable = true;
    if (e instanceof ApiError && e.code === 'rate_limited') rateLimited = true;
    return null;
  }
}

/** Every active US ticker matching `q`. This is what makes "search the whole NYSE" real rather
 *  than a filter over seven hardcoded names. */
export const searchTickers = (q: string) =>
  safe<{ results: TickerHit[] }>(`/api/market?action=search&q=${encodeURIComponent(q)}`).then((d) => d?.results ?? []);

/**
 * A quote, and the ONLY place a live mark enters the app.
 *
 * Recording the mark here rather than at each caller is deliberate: `stock/[sym].tsx`, the Trade tab
 * and anything added later all route through this function, so execution and valuation cannot drift
 * apart again by someone forgetting to update a cache. `safe()` returns null on any failure, so a
 * refusal leaves the previous mark standing rather than clearing it.
 */
export const getQuote = (sym: string) =>
  safe<Quote>(`/api/market?action=quote&sym=${sym}`).then((q) => {
    if (q) setMark(q.sym ?? sym, q.price);
    return q;
  });

/**
 * Price many symbols in ONE upstream call.
 *
 * WHY THIS EXISTS. `setMark` was reachable only through `getQuote`, and `getQuote` only from
 * stock/[sym].tsx -- so the Trade tab, which fetches nothing, priced every holding from the
 * hardcoded fallback table in stocks.ts. MEASURED 2026-08-20 against the real previous close:
 * NVDA was listed at $1,184.00 against an actual $217.56 (-81.6%), GOOGL at $182.11 against
 * $344.72 (+89.3%), AAPL at $228.50 against $316.83 (+38.7%). A twelve-share NVDA position
 * rendered $14,208 where the market said $2,611.
 *
 * Per-symbol quotes cannot fix that: seven tickers against a five-per-minute ceiling is the same
 * burst that produced the logo 429s. Grouped daily bars cover the entire US market in a single
 * request, so the cost does not grow with the number of tickers on screen.
 *
 * Marks are recorded HERE for the same reason getQuote records its own: routing every price
 * through one place is what stops execution and valuation drifting apart again.
 *
 * CALLED WITH NO ARGUMENT ON PURPOSE. The grouped response covers the WHOLE US market -- 12,548
 * tickers measured -- for the same single request, so filtering it to the seven symbols on the
 * Trade tab would throw away 12,541 prices that had already been paid for. Taking all of them
 * means a searched ticker, a mover, or any stock screen is priced the moment it renders, with no
 * further API call against a five-per-minute ceiling.
 *
 * `syms` stays available for callers that genuinely want a small payload. Only what the user
 * holds or watches is PERSISTED -- see partialize in store.ts, which runs on every state write
 * and must not serialise a quarter megabyte each time.
 */
export const getMarks = (syms?: string[]) =>
  safe<{ date: string; count: number; marks: Record<string, number>; changes?: Record<string, number> }>(
    `/api/market?action=marks${syms?.length ? `&syms=${syms.map(encodeURIComponent).join(',')}` : ''}`,
  ).then((r) => {
    if (r?.marks) for (const [sym, price] of Object.entries(r.marks)) setMark(sym, price);
    if (r?.changes) for (const [sym, pct] of Object.entries(r.changes)) setChange(sym, pct);
    if (r?.date) setMarkDate(r.date);
    return r;
  });

export const getChart = (sym: string, range: RangeKey) =>
  safe<Chart>(`/api/market?action=chart&sym=${sym}&range=${range}`);

export const getNews = (sym?: string) =>
  safe<{ articles: Article[] }>(`/api/market?action=news${sym ? `&sym=${sym}` : ''}`).then((d) => d?.articles ?? []);

/**
 * Change over the whole series, which is what the range row is really selecting.
 *
 * All three reference apps recompute the headline change for the selected range — TradingView
 * flips between "+0.27% at close" and "+1.04% past 5 days"; Bloom between "Today" and "Past 5
 * Years". A chart whose change figure never moves reads as broken.
 */
export function seriesChange(points: ChartPoint[]): { abs: number; pct: number } | null {
  if (points.length < 2) return null;
  const first = points[0].c;
  const last = points[points.length - 1].c;
  return { abs: last - first, pct: first ? ((last - first) / first) * 100 : 0 };
}

/** Points -> an SVG path, scaled into `w` x `h`. Flat series get a centre line rather than a
 *  divide-by-zero. */
export function toPath(points: ChartPoint[], w: number, h: number, pad = 2): string {
  if (points.length < 2) return '';
  const ys = points.map((p) => p.c);
  const min = Math.min(...ys);
  const max = Math.max(...ys);
  const span = max - min;
  const inner = h - pad * 2;
  const x = (i: number) => (i / (points.length - 1)) * w;
  const y = (v: number) => (span === 0 ? h / 2 : pad + inner - ((v - min) / span) * inner);
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(2)} ${y(p.c).toFixed(2)}`).join(' ');
}

/* ------------------------------------------------------------------ options chain (Tradier) */

/**
 * The client's view of a contract. **This is a SECOND declaration of `api/_chain.ts`'s `Contract`**
 * and the two must stay in step — the client cannot import the server module, so nothing enforces
 * it. Adding a field to one and not the other is silent: the JSON still arrives, and the screen just
 * cannot see it. That is exactly how gamma, theta, vega and rho were dropped for the whole life of
 * this feature while the provider was sending them all along.
 */
export type Contract = {
  symbol: string;
  kind: 'call' | 'put';
  strike: number;
  bid: number;
  ask: number;
  mid: number;
  iv: number;
  /** The full greek set. 0 means unknown, matching the server mapping. */
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
  /** The provider's theoretical value, where it publishes one. */
  theo: number;
  openInterest: number;
  volume: number;
};

/** Expiry dates that actually exist for this underlying. Empty when there is no token. */
export const getExpirations = (sym: string) =>
  safe<{ expirations: string[] }>(`/api/options?action=expirations&sym=${sym}`).then((d) => d?.expirations ?? []);

/**
 * The chain for one expiry, both sides, with greeks — AND the spot that produced it.
 *
 * The spot travels WITH the chain deliberately. The options header used to read `priceOf(sym)`,
 * which falls back to the static table for any symbol the user has not opened a stock screen for,
 * so it rendered "Apple at $228.50" above strikes centred on 305.35. Same number, two sources, one
 * screen — the $1,184 defect again. `null` means no live chain.
 */
export const getChain = (sym: string, expiry: string) =>
  safe<{ contracts: Contract[]; spot?: number }>(
    `/api/options?action=chain&sym=${sym}&expiry=${expiry}`,
  ).then((d) => (d?.contracts ? { contracts: d.contracts, spot: Number(d.spot) || 0 } : null));

/* ------------------------------------------------------------------ key statistics */

export type Stats = {
  sym: string;
  previousClose: number | null;
  open: number | null;
  dayLow: number | null;
  dayHigh: number | null;
  volume: number | null;
  weekLow52: number | null;
  weekHigh52: number | null;
  avgVolume: number | null;
  yearChangePct: number | null;
};

/** Real aggregates, or `null` when there is no key. Never a modelled stand-in — a fabricated
 *  52-week range would be indistinguishable from a real one on screen. */
export const getStats = (sym: string) => safe<Stats>(`/api/market?action=stats&sym=${sym}`);

/** 86.22M / 1.2K. Volumes are unreadable at full precision. */
export const compact = (n: number): string => {
  const a = Math.abs(n);
  if (a >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (a >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (a >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return String(Math.round(n));
};

/* ------------------------------------------------------------------ movers */

export type Mover = { sym: string; price: number; changePct: number };

/** Today's biggest movers. `[]` when there is no key — the section hides rather than showing an
 *  empty table, the same rule the rest of this file follows. */
export const getMovers = (dir: 'gainers' | 'losers') =>
  safe<{ movers: Mover[] }>(`/api/market?action=movers&dir=${dir}`).then((d) => d?.movers ?? []);
