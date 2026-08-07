/**
 * Option premiums — Black-Scholes.
 *
 * WHY A MODEL AND NOT DATA: real premiums come from an options chain (bid/ask, greeks, open
 * interest, implied vol per strike). That needs a derivatives market-data provider Euphoria has
 * not wired up. The choice was between a made-up number, no feature at all, or the textbook model
 * with its assumptions stated out loud. This is the third — and for a teaching app the model is
 * arguably the point: it shows WHY a further-out strike costs less and why time has value.
 *
 * Everything that would normally come from the market is a stated constant below. The UI repeats
 * these assumptions on screen; they must never be presented as quotes.
 */

/** Assumed annualised volatility. Roughly a large-cap equity's long-run realised vol. */
export const ASSUMED_VOL = 0.3;
/** Assumed risk-free rate. */
export const ASSUMED_RATE = 0.04;

/** Standard normal CDF (Abramowitz & Stegun 7.1.26 via erf). Accurate to ~1e-7, which is far
 *  beyond what a teaching premium needs. */
function normCdf(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989422804014327 * Math.exp(-(x * x) / 2);
  const p =
    d * t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return x >= 0 ? 1 - p : p;
}

/**
 * Black-Scholes premium for one contract-share.
 *
 * @param spot   underlying price
 * @param strike strike price
 * @param days   calendar days to expiry
 */
export function premium(kind: 'call' | 'put', spot: number, strike: number, days: number): number {
  if (spot <= 0 || strike <= 0 || days <= 0) return 0;
  const t = days / 365;
  const sqrtT = Math.sqrt(t);
  const d1 =
    (Math.log(spot / strike) + (ASSUMED_RATE + (ASSUMED_VOL * ASSUMED_VOL) / 2) * t) / (ASSUMED_VOL * sqrtT);
  const d2 = d1 - ASSUMED_VOL * sqrtT;
  const disc = Math.exp(-ASSUMED_RATE * t);
  const call = spot * normCdf(d1) - strike * disc * normCdf(d2);
  // Put-call parity, so the two can never disagree.
  return kind === 'call' ? Math.max(0, call) : Math.max(0, call - spot + strike * disc);
}

/** US equity options are for 100 shares. Stated here so the screen and the store agree. */
export const CONTRACT_SIZE = 100;

/** Strikes around the money, in 5% steps — enough to show that further out is cheaper. */
export function strikesAround(spot: number): number[] {
  const base = Math.round(spot);
  return [-0.1, -0.05, 0, 0.05, 0.1].map((p) => Math.round(base * (1 + p)));
}

if (__DEV__) {
  // One runnable check on the money path. A premium that ignores its inputs is invisible on screen
  // — it just looks like a number — so assert the relationships that must always hold.
  const spot = 100;
  const atm = premium('call', spot, 100, 30);
  const otm = premium('call', spot, 110, 30);
  const longer = premium('call', spot, 100, 90);
  const put = premium('put', spot, 100, 30);
  if (!(otm < atm)) console.error('[options] a further out-of-the-money call must cost less');
  if (!(longer > atm)) console.error('[options] more time to expiry must cost more');
  if (!(atm > 0 && put > 0)) console.error('[options] premiums must be positive');
  // Put-call parity: C - P = S - K*e^(-rt)
  const parity = atm - put - (spot - 100 * Math.exp(-ASSUMED_RATE * (30 / 365)));
  if (Math.abs(parity) > 0.01) console.error(`[options] put-call parity broken by ${parity.toFixed(4)}`);
}
