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
  /**
   * THE FULL GREEK SET, because Cboe hands it over for free and dropping it was a self-inflicted
   * limitation. This type used to carry `delta` alone while the payload it was mapped from also
   * contained gamma, theta, vega, rho and a theoretical value — every one discarded in the mapper.
   *
   * They are what makes an options teaching screen worth having: delta is direction, gamma is how
   * fast direction changes, theta is what the position loses per day, vega is exposure to a change
   * in volatility. `stock/[sym].tsx` says the desk exists so a learner can watch a contract move on
   * "time and volatility, not just direction" — and time and volatility were the two the app could
   * not show.
   *
   * 0 means UNKNOWN throughout, consistent with the rest of this file.
   */
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
  /** The provider's own theoretical value. Useful next to mid: a wide spread shows up as a gap. */
  theo: number;
  openInterest: number;
  volume: number;
};

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

/**
 * A non-negative, finite money or count field, or 0.
 *
 * `Number(x) || 0` — which every mapper here used — catches `NaN`, `null` and `undefined` and
 * catches NEITHER of the two that matter. Probed with a hostile payload 2026-08-14:
 *   bid: -5     -> survived as -5, because -5 is truthy. A negative price.
 *   ask: 1e309  -> survived as Infinity, which `JSON.stringify` emits as `null`.
 * Both then reach `cost = ask * CONTRACT_SIZE` on the buy control. `Infinity > 0` passes the
 * positive-cost guard, and only `cost <= cash` happens to stop the trade — a guard written for a
 * different purpose, holding the money path up by accident.
 *
 * A price cannot be negative and cannot be infinite. Neither is a measurement, so neither is
 * rendered. Same rule as `plausibleIv` one function up, applied to the fields that are money.
 */
export const finiteNonNegative = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

/**
 * A finite SIGNED greek, or 0.
 *
 * theta is negative for a long option, rho is negative for puts, and gamma/vega are positive — so
 * these cannot use `finiteNonNegative` without silently zeroing the ones that carry the most
 * meaning. Only non-finite values are rejected. The magnitude is deliberately NOT clamped: unlike
 * IV there is no universal plausible band for a greek, and inventing one would discard real data
 * from a short-dated contract.
 */
export const finiteSigned = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** Delta is a probability-like quantity: calls sit in [0,1], puts in [-1,0]. Anything else is noise. */
export const plausibleDelta = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) && n >= -1 && n <= 1 ? n : 0;
};

/**
 * OCC option symbol -> expiry, side, strike. `NVDA260814C00050000` is NVDA, 2026-08-14, call, $50.
 *
 * Root is variable length, the date is `yymmdd`, and the strike is 8 digits in THOUSANDTHS — so
 * `00050000` is 50.000 and not 50000. Getting that divisor wrong yields a strike a thousand times
 * too large, which renders as a plausible-looking row rather than an error. Verified against all
 * 3,794 contracts in a live NVDA payload on 2026-08-14: zero unparsed.
 */
export const parseOcc = (s: string): { expiry: string; kind: 'call' | 'put'; strike: number } | null => {
  const m = /^[A-Z]+(\d{2})(\d{2})(\d{2})([CP])(\d{8})/.exec(s);
  if (!m) return null;
  return {
    expiry: `20${m[1]}-${m[2]}-${m[3]}`,
    kind: m[4] === 'C' ? 'call' : 'put',
    strike: Number(m[5]) / 1000,
  };
};

/**
 * The underlying's price, as the SAME payload that produced the chain reports it.
 *
 * Shipped because the options header read "Apple at $228.50" from the static table while the chain
 * beside it was centred on Cboe's real 305.35 — strikes from 287.50 up. Two sources for one number,
 * on one screen, which is the $1,184-versus-$225.30 defect in a second location. The screen has a
 * live mark only for symbols the user already visited a stock screen for, so every OTHER underlying
 * was wrong. Returning the spot with the chain means the headline and the strikes cannot disagree.
 */
export const spotFromCboe = (j: Raw): number =>
  Number((j.data as Raw | undefined)?.current_price ?? (j.data as Raw | undefined)?.close ?? 0) || 0;

/** Every expiry present in a Cboe payload, soonest first. One fetch covers all of them. */
export function expiriesFromCboe(j: Raw): string[] {
  const rows = ((j.data as Raw | undefined)?.options ?? []) as Raw[];
  const seen = new Set<string>();
  for (const r of rows) {
    const p = parseOcc(String(r.option ?? ''));
    if (p) seen.add(p.expiry);
  }
  return [...seen].sort();
}

/**
 * Cboe's delayed feed -> the same `Contract` shape every screen already consumes.
 *
 * WHY CBOE IS THE PRIMARY. marketdata.app answers **403 to the deployed Worker** while serving the
 * identical token from a laptop — its egress IP is blocked. That is §5.2's Alpha Vantage lesson with
 * a new provider, and it made the options screen dead in production while every local check passed.
 * Cboe operates the options exchanges, publishes this feed with **no key at all**, and therefore has
 * no quota to exhaust and no per-contract billing to budget against — the entire `STRIKE_WINDOW`
 * cost ceiling exists only for marketdata and stops mattering here.
 *
 * ONE FETCH CARRIES EVERY EXPIRY (3,794 contracts for NVDA), so the window is applied HERE rather
 * than by the provider. Strikes are chosen by distance from spot, which is what `strikeLimit` did
 * upstream — the screen must open at the money, not at $50 against a $225 stock.
 */
export function fromCboe(j: Raw, expiry: string, window?: number): Contract[] {
  const data = (j.data ?? {}) as Raw;
  const rows = (data.options ?? []) as Raw[];
  const spot = Number(data.current_price ?? data.close ?? 0);

  const parsed = rows
    .map((r) => ({ raw: r, occ: parseOcc(String(r.option ?? '')) }))
    .filter((x) => x.occ && x.occ.expiry === expiry);

  // Nearest strikes to spot. Without a spot we cannot centre, so take the lowest — deterministic
  // and visibly wrong rather than randomly wrong.
  const strikes = [...new Set(parsed.map((x) => x.occ!.strike))].sort((a, b) =>
    spot > 0 ? Math.abs(a - spot) - Math.abs(b - spot) : a - b,
  );
  /*
   * NO WINDOW MEANS THE ENTIRE CHAIN, and that is the normal case now.
   *
   * `STRIKE_WINDOW` exists because marketdata.app bills PER CONTRACT. Cboe bills nothing, so
   * truncating its chain buys us exactly nothing and costs the user every strike outside the box.
   * A full NVDA expiry is 63-108 strikes, which is a small JSON payload. The window is kept as an
   * argument solely for the marketdata fallback, where it is still a real budget.
   */
  const keep = new Set(window ? strikes.slice(0, window) : strikes);

  return parsed
    .filter((x) => keep.has(x.occ!.strike))
    .map(({ raw, occ }) => {
      const bid = finiteNonNegative(raw.bid);
      const ask = finiteNonNegative(raw.ask);
      return {
        symbol: String(raw.option ?? ''),
        kind: occ!.kind,
        strike: occ!.strike,
        bid,
        ask,
        mid: bid && ask ? (bid + ask) / 2 : ask || bid,
        iv: plausibleIv(finiteNonNegative(raw.iv)),
        // Greeks are signed: theta is negative for a long option, rho negative for puts. Only the
        // magnitude is bounded, so they cannot use the non-negative clamp.
        delta: plausibleDelta(raw.delta),
        gamma: finiteSigned(raw.gamma),
        theta: finiteSigned(raw.theta),
        vega: finiteSigned(raw.vega),
        rho: finiteSigned(raw.rho),
        theo: finiteNonNegative(raw.theo),
        openInterest: finiteNonNegative(raw.open_interest),
        volume: finiteNonNegative(raw.volume),
      };
    })
    .sort((a, b) => a.strike - b.strike || a.kind.localeCompare(b.kind));
}

/**
 * marketdata.app answers COLUMNAR — parallel arrays, not a list of objects. Transpose it.
 *
 * `optionSymbol` is the length authority; a short column is read as a zero rather than throwing,
 * because one missing greek should not cost the user the whole chain.
 */
export function fromMarketdata(j: Raw): Contract[] {
  const col = (k: string) => (Array.isArray(j[k]) ? (j[k] as unknown[]) : []);
  const syms = col('optionSymbol');
  const num = (k: string, i: number) => finiteNonNegative(col(k)[i]);
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
      // delta is the one field that is legitimately NEGATIVE (puts), so it cannot use `num`.
      delta: plausibleDelta(col('delta')[i]),
      gamma: finiteSigned(col('gamma')[i]),
      theta: finiteSigned(col('theta')[i]),
      vega: finiteSigned(col('vega')[i]),
      // marketdata does not publish rho or a theoretical value. 0 means unknown, as everywhere here.
      rho: 0,
      theo: 0,
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
    const bid = finiteNonNegative(o.bid);
    const ask = finiteNonNegative(o.ask);
    return {
      symbol: String(o.symbol ?? ''),
      kind: o.option_type === 'put' ? 'put' : 'call',
      strike: finiteNonNegative(o.strike),
      bid,
      ask,
      mid: bid && ask ? (bid + ask) / 2 : ask || bid,
      iv: plausibleIv(finiteNonNegative(g.mid_iv ?? g.smv_vol)),
      delta: plausibleDelta(g.delta),
      // Tradier publishes the full greek set under `greeks`, including rho — the only provider here
      // that does. `theo` has no Tradier equivalent; 0 means unknown.
      gamma: finiteSigned(g.gamma),
      theta: finiteSigned(g.theta),
      vega: finiteSigned(g.vega),
      rho: finiteSigned(g.rho),
      theo: 0,
      openInterest: finiteNonNegative(o.open_interest),
      volume: finiteNonNegative(o.volume),
    };
  });
}
