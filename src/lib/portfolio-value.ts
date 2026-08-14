/**
 * What a paper portfolio is worth. ONE formula, and the reason it is one.
 *
 * It was three. `portfolioValue()` had it, `snapshot()` had it again — the comment on `snapshot`
 * says so outright, "Same rule now lives in both" — and `portfolio-snapshot-regression.mjs` wrote a
 * third copy to test against. Three statements of one rule, in a file already over its line
 * threshold.
 *
 * The two in `store.ts` had ALREADY diverged once, and §22 records the damage: `portfolioValue`
 * counted open option contracts, `snapshot` counted only cash and shares, so the headline read
 * $10,003.28 while the chart's newest point sat at $9,222.22 — one contract's $781.06 premium
 * missing from one of them. The Trade tab then rendered "−$777.78 (7.78%) all time" under a
 * portfolio that had not lost anything, permanently, for anyone who ever opened a contract. The fix
 * was applied to one copy and did not reach the other, because there was no "other" to notice.
 *
 * That is C113's lesson in its purest form: a green gate over a number the user reads as their own
 * money. The regression that was supposed to catch it re-implemented the rule and therefore tested
 * its own copy.
 *
 * KEEP THIS FILE ERASABLE-SYNTAX-ONLY — the regression imports it under Node, which strips types
 * rather than compiling them. `priceOf` is INJECTED rather than imported for the same reason:
 * `stocks.ts` is fine today, but the moment prices come from a live quote this file must not drag a
 * network client into a test.
 */

/**
 * Cash, plus shares at mark, plus open contracts AT COST.
 *
 * At cost rather than marked-to-market because re-pricing an option needs a live chain — spot has
 * moved, time has decayed, vol has shifted — and there is no chain connected. Cost means a contract
 * contributes a return of exactly zero until it can be priced: understated, but never invented,
 * which is the §0.4 direction to be wrong in. When the Tradier chain lands this becomes a mark
 * against the current bid, and it becomes so in ONE place.
 */
export function valueOf(
  cash: number,
  positions: Record<string, number>,
  derivatives: { premium: number }[],
  priceOf: (sym: string) => number,
): number {
  const equity = Object.entries(positions).reduce((sum, [sym, shares]) => sum + shares * priceOf(sym), cash);
  return derivatives.reduce((sum, d) => sum + d.premium, equity);
}
