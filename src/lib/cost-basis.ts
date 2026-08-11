/**
 * Average-cost holdings math — THE one copy.
 *
 * WHY THIS FILE EXISTS. `scripts/cost-basis-regression.mjs` used to re-implement these three
 * reducers because the store is TypeScript and the script is plain node. §22 C113 records what that
 * cost: when the partial-basis bug was fixed, the fix had to be written TWICE — once in `store.ts`
 * and again in the script's copy — which is precisely the drift the script existed to catch,
 * happening inside the change that added it. A test asserting a rule the app does not run is worse
 * than no test, because it is green.
 *
 * Node 24 strips types natively, so the script now imports THIS module directly and there is no
 * second copy to drift from. Keep the syntax here ERASABLE — plain functions and types only, no
 * enums, no namespaces, no parameter properties — or `node scripts/...` stops being able to load it.
 *
 * Pure and holdings-only on purpose: cash, valueHistory and activeDays stay in the store, because
 * they are the parts a test cannot meaningfully assert without the whole app around them.
 */

export type Holdings = {
  /** Shares held, by ticker. Absent or 0 means no position. */
  positions: Record<string, number>;
  /** TOTAL DOLLARS PAID for the shares currently held, by ticker. */
  costBasis: Record<string, number>;
};

/**
 * True when a position exists that has NO usable basis.
 *
 * `> 0`, not `!== undefined`: `priceOf()` returns 0 for a ticker absent from STOCKS and the buy
 * control passes a cost of 0, so a basis of exactly 0 can be recorded — DEFINED, and it slipped
 * past an `undefined` check straight back into the partial-basis bug (§22 C113, the second door).
 */
export function hasUnknownBasis(h: Holdings, sym: string): boolean {
  return (h.positions[sym] ?? 0) > 0 && !((h.costBasis[sym] ?? 0) > 0);
}

/**
 * Add bought shares.
 *
 * A PARTIAL BASIS IS WORSE THAN NO BASIS. Adding to a position opened before basis tracking would
 * record only the NEW cost while `positions` counts ALL the shares, so `paid / held` divides one
 * share's cost across four: 3 legacy NVDA plus one bought at $1,184 rendered "avg $296.00, +300.0%".
 * The basis stays ABSENT until the position is closed and rebuilt from a known price.
 */
export function applyBuy(h: Holdings, sym: string, shares: number, cost: number): Holdings {
  const legacy = hasUnknownBasis(h, sym);
  return {
    positions: { ...h.positions, [sym]: (h.positions[sym] ?? 0) + shares },
    costBasis: legacy ? h.costBasis : { ...h.costBasis, [sym]: (h.costBasis[sym] ?? 0) + cost },
  };
}

/**
 * Remove sold shares, clamped to what is held. `sold` is returned because the caller needs it to
 * credit cash and cannot re-derive it without repeating the clamp.
 *
 * A PARTIAL SELL retires the same FRACTION of the basis as of the shares, so the average per share
 * is unchanged. Booking the sale against the whole basis instead would make every partial sale look
 * like a windfall.
 */
export function applySell(h: Holdings, sym: string, shares: number): Holdings & { sold: number } {
  const held = h.positions[sym] ?? 0;
  const sold = Math.min(shares, held);
  if (sold <= 0) return { ...h, sold: 0 };

  const positions = { ...h.positions };
  const costBasis = { ...h.costBasis };
  if (held - sold <= 0) {
    // Drop both keys at zero, so "do I hold this?" is one truthy check everywhere instead of a
    // 0-vs-undefined trap, and so a reopened position starts from a knowable price.
    delete positions[sym];
    delete costBasis[sym];
  } else {
    positions[sym] = held - sold;
    if (costBasis[sym] !== undefined) costBasis[sym] = costBasis[sym] * ((held - sold) / held);
  }
  return { positions, costBasis, sold };
}

/**
 * Add granted (free) shares, booked at their GRANT VALUE rather than at zero — a $0 basis would
 * show an infinite return and teach the opposite of the lesson that paid for it. Same
 * partial-basis guard as a buy.
 */
export function applyGrant(h: Holdings, sym: string, shares: number, dollars: number): Holdings {
  const legacy = hasUnknownBasis(h, sym);
  return {
    positions: { ...h.positions, [sym]: (h.positions[sym] ?? 0) + shares },
    costBasis: legacy ? h.costBasis : { ...h.costBasis, [sym]: (h.costBasis[sym] ?? 0) + dollars },
  };
}

/** Average price paid per share, or null when this position has no usable basis. */
export function avgCostOf(h: Holdings, sym: string): number | null {
  const held = h.positions[sym] ?? 0;
  const paid = h.costBasis[sym];
  if (held <= 0 || paid === undefined || paid <= 0) return null;
  return paid / held;
}

/** Percentage return against `mark`, or null when there is no basis to compare with. */
export function gainPct(h: Holdings, sym: string, mark: number): number | null {
  const avg = avgCostOf(h, sym);
  return avg === null ? null : ((mark - avg) / avg) * 100;
}
