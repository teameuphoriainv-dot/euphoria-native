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

/**
 * Strikes fetched per chain, centred on the money. **THIS NUMBER IS A BUDGET, NOT A PREFERENCE.**
 *
 * marketdata.app bills roughly ONE CREDIT PER CONTRACT, not per request. Measured 2026-08-14 against
 * the live account: a full NVDA chain for one expiry returned 216 contracts and consumed **193
 * credits** of a 100,000/day allowance. That is ~518 options screen loads PER DAY across the entire
 * userbase — a few hundred users would exhaust it before lunch and every one of them would then see
 * an error. It is the single hardest production ceiling in this app.
 *
 * `strikeLimit=16` returned 32 contracts for **32 credits** — a 6x cut, ~3,125 loads/day — and the
 * strikes came back 205–242.50 against a 225.30 spot. So the same parameter also fixes two things
 * that were filed as separate bugs: the chain used to open at $50 (4.5x from the money, so the first
 * screen was deep-ITM calls nobody can afford), and the IV column rendered provider noise at the
 * wings (`IV 0%` beside `IV 617%`). Near the money, IV came back 0.4059 — a credible 40.6%.
 *
 * RAISING THIS COSTS CREDITS LINEARLY. 16 strikes is 32 contracts is 32 credits. Doubling it halves
 * the number of chain loads the app can serve in a day. Do not raise it without redoing that
 * arithmetic against the CURRENT allowance, and do not assume the allowance is what this comment
 * says — read `x-api-ratelimit-limit` from a live response.
 */
export const STRIKE_WINDOW = 16;

/**
 * The marketdata.app chain path, with the strike window applied.
 *
 * Built here rather than inline in `options+api.ts` for this file's usual reason: that route cannot
 * be imported by a regression, so a `strikeLimit` written inline would be a production cost control
 * that nothing can test. Dropping it does not throw — it returns a bigger, more expensive, correct
 * looking chain, which is the silent-failure shape this whole file is about.
 */
export const chainPath = (sym: string, expiry: string, strikes: number = STRIKE_WINDOW) =>
  `/chain/${sym}/?expiration=${expiry}&strikeLimit=${strikes}`;

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
/**
 * Implied volatility, or 0 meaning WE DO NOT KNOW.
 *
 * IV is solved numerically from the option price, and the solve is ill-conditioned where the option
 * has almost no time value — deep in or out of the money. The provider does not flag this; it
 * returns the junk. Measured on the live NVDA chain 2026-08-14: every strike from 210 to 242.50 sat
 * in a clean smile between 0.30 and 0.41, while the 205 and 207.50 CALLS came back 0.0001 and 0.0026
 * — and the PUTS at those same two strikes were fine at 0.4145 and 0.3862. A wider pull showed the
 * other tail: 6.17, i.e. 617%.
 *
 * `options.tsx` renders `IV ${iv * 100}%`, so 0.0001 printed as a confident **"IV 0%"** and 6.17 as
 * **"IV 617%"**, side by side with correct rows. §0.4: never show a number the app cannot back. 0 is
 * this file's established "no value" signal (see the header on missing columns), and the screen
 * omits the segment rather than printing a zero.
 *
 * The band is deliberately WIDE — 1% to 500%. It is here to reject numerical noise, not to second
 * guess the market: a real earnings-week short-dated IV can legitimately exceed 200%, and clipping
 * that would be inventing data in the opposite direction.
 */
export const plausibleIv = (iv: number): number => (iv >= 0.01 && iv <= 5 ? iv : 0);

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
      iv: plausibleIv(num('iv', i)),
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
      iv: plausibleIv(Number(g.mid_iv ?? g.smv_vol) || 0),
      delta: Number(g.delta) || 0,
      openInterest: Number(o.open_interest) || 0,
      volume: Number(o.volume) || 0,
    };
  });
}
