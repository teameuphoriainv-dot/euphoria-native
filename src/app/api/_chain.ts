/**
 * Options chain mapping — provider shapes in, ONE `Contract` out.
 *
 * The leading underscore keeps expo-router from treating this as a route.
 *
 * WHY ITS OWN FILE, and it is the same reason for the sixth time in this repo: a regression cannot
 * import `options+api.ts`. That route imports `./_entitlement`, `./_identity`, `./_limit` and
 * `./_validate` extensionless, which Node's ESM resolver will not follow, so the mapping inside it
 * was untestable. `cost-basis.ts`, `portfolio-value.ts`, `billing-retry.ts`, `day-keys.ts`,
 * `trial-reward.ts` and `dismissal-offer.ts` all exist for exactly this reason.
 *
 * WHAT IS AT STAKE. marketdata.app answers COLUMNAR — parallel arrays keyed by name. Every field is
 * a string lookup. Rename a column upstream, or return one short, and this does not throw: it
 * produces **zeros**. A chain of contracts with bid 0, ask 0 and delta 0 renders perfectly and looks
 * like a quiet strike rather than a broken integration — and those are numbers a user reads as
 * prices. C113, in a transpose.
 *
 * KEEP THIS FILE ERASABLE-SYNTAX-ONLY. Node strips types rather than compiling them.
 */

type Raw = Record<string, unknown>;

/** The shape every screen consumes. Both providers are mapped onto this. */
export type Contract = {
  symbol: string;
  kind: 'call' | 'put';
  strike: number;
  bid: number;
  ask: number;
  mid: number;
  iv: number;
  delta: number;
  openInterest: number;
  volume: number;
};

/**
 * marketdata.app answers COLUMNAR — parallel arrays, not a list of objects. Transpose it.
 *
 * `optionSymbol` is the length authority; a short column is read as a zero rather than throwing,
 * because one missing greek should not cost the user the whole chain.
 */
export function fromMarketdata(j: Raw): Contract[] {
  const col = (k: string) => (Array.isArray(j[k]) ? (j[k] as unknown[]) : []);
  const syms = col('optionSymbol');
  const num = (k: string, i: number) => Number(col(k)[i]) || 0;
  return syms.map((s, i) => {
    const bid = num('bid', i);
    const ask = num('ask', i);
    return {
      symbol: String(s),
      kind: String(col('side')[i]) === 'put' ? 'put' : 'call',
      strike: num('strike', i),
      bid,
      ask,
      // Prefer the provider's own mid; fall back to the midpoint, then to whichever side exists.
      mid: num('mid', i) || (bid && ask ? (bid + ask) / 2 : ask || bid),
      iv: num('iv', i),
      delta: num('delta', i),
      openInterest: num('openInterest', i),
      volume: num('volume', i),
    };
  });
}

/** Tradier returns a bare object when a collection has exactly one member. */
export const many = <T,>(v: T | T[] | null | undefined): T[] => (Array.isArray(v) ? v : v ? [v] : []);

export function fromTradier(j: Raw): Contract[] {
  return many<Raw>((j?.options as Raw | undefined)?.option as Raw | Raw[]).map((o) => {
    const g = (o.greeks ?? {}) as Raw;
    const bid = Number(o.bid) || 0;
    const ask = Number(o.ask) || 0;
    return {
      symbol: String(o.symbol ?? ''),
      kind: o.option_type === 'put' ? 'put' : 'call',
      strike: Number(o.strike) || 0,
      bid,
      ask,
      mid: bid && ask ? (bid + ask) / 2 : ask || bid,
      iv: Number(g.mid_iv ?? g.smv_vol) || 0,
      delta: Number(g.delta) || 0,
      openInterest: Number(o.open_interest) || 0,
      volume: Number(o.volume) || 0,
    };
  });
}
