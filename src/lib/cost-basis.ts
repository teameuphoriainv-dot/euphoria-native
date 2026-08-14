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
 * Phase 16's storage migration: withdraw every basis that was PAID IN STATIC DOLLARS.
 *
 * `priceOf` became live-backed on 2026-08-13. Positions bought before that were executed against
 * the static table, so they are now valued in one currency against a basis booked in another — a
 * seeded NVDA holding reads ~$1,184/share paid against a ~$225 mark, an ~81% loss that never
 * happened. That is C113's exact shape, arriving through the fix for C113's exact shape.
 *
 * CLEARED, NOT RESCALED, and the decision is already made above: *"A PARTIAL BASIS IS WORSE THAN NO
 * BASIS… The basis stays ABSENT until the position is closed and rebuilt from a known price."*
 * Rescaling would carry forward a percentage that was itself fiction — under a static book nothing
 * ever moved, so the only honest thing to preserve is nothing. An absent basis makes
 * `hasUnknownBasis` true, the Trade row renders no percentage, and the copy already shipped there
 * — "nothing was recorded to compare against" — becomes literally true rather than merely tactful.
 *
 * `positions` and `cash` are untouched BY v1. The user keeps every share. Only the claim about what
 * they paid is withdrawn, because that claim was denominated in a currency the app no longer uses.
 * (v2 below DOES adjust cash, by refunding an unwound premium — read it before trusting this line.)
 *
 * `valueHistory` GOES TOO, and forgetting it was the first draft of this function. Those snapshots
 * are portfolio totals computed with the static table — a $10,003 series against a portfolio now
 * worth $7,126. Nothing rewrites the series until the next trade, so it reads as merely stale; the
 * moment one lands, the chart draws a 29% cliff that never happened and the card's "all time" figure
 * measures a currency change. Clearing one field and not the other is the half-migration §9.3 warns
 * about, in miniature.
 *
 * ── v2: DERIVATIVES ARE UNWOUND, NOT KEPT ─────────────────────────────────────────────────────
 * Shares survived v1 because a holding is a holding: 3 NVDA is 3 NVDA whatever it cost, so only the
 * claim about the price was withdrawn. A contract breaks that parallel — its defining parameter IS
 * a static-dollar number. A call struck at $1,302 against a $225 spot cannot be reinterpreted at
 * live prices the way a share count can; it is unsalvageable, not merely mispriced.
 *
 * So it is reversed rather than repriced: the contract goes, the premium returns to cash, and
 * `derivativeTrades` is restored. The refund is NET-NEUTRAL, not a grant — cash was always real
 * dollars, only PRICES were fictional, so returning what was spent on a position we are deleting
 * leaves the balance where it started. Leaving the cash spent would be a takeaway. And clearing the
 * contracts WITHOUT restoring the counter would quietly consume part of a lifetime allowance of
 * `PRO_DERIVATIVE_PREVIEW` (3) for positions the user no longer has.
 *
 * v2 rather than folding into v1 because v1 already shipped to dev installs, and a migration that
 * silently changes meaning after it has run is how a store ends up in a state no version describes.
 */
export function clearStaticPricing<
  T extends {
    costBasis?: Record<string, number>;
    valueHistory?: unknown[];
    derivatives?: { premium: number }[];
    derivativeTrades?: number;
    cash?: number;
  },
>(state: T, fromVersion: number): T {
  let s = state;
  if (fromVersion < 1) s = { ...s, costBasis: {}, valueHistory: [] };
  if (fromVersion < 2) {
    /*
     * `Array.isArray`, NOT `?? []`. Found in security review 2026-08-14: `??` only catches null and
     * undefined, so a persisted blob whose `derivatives` is an object, string or number reaches
     * `.reduce` and throws. That throw happens INSIDE zustand's migrate, which rejects its promise,
     * which calls `onRehydrateStorage` with `state === undefined`, so `setHasHydrated(true)` never
     * runs — and `app/index.tsx` gates all routing on that flag. The app renders nothing, forever,
     * until storage is cleared by hand. One bad field, permanent soft-lock, and it did not exist
     * before this migration was added.
     */
    const held = Array.isArray(s.derivatives) ? s.derivatives : [];
    const refund = held.reduce((sum, d) => sum + (Number(d?.premium) || 0), 0);
    s = { ...s, derivatives: [], derivativeTrades: 0 };
    /*
     * `cash` is written ONLY when there is something to refund AND a number to add it to.
     *
     * The first draft was `cash: (s.cash ?? 0) + refund`, which writes an explicit 0 whenever a
     * persisted blob lacks `cash` — and zustand merges migrate output OVER the defaults, so that 0
     * beats STARTING_CASH and the user opens the app with no money. `marks.ts` states the rule this
     * violates: a zero that reaches the money path is not a safe default, it is a value. `?? 0` is
     * only safe on a number you are about to READ, never on one you are about to PERSIST.
     */
    if (refund > 0 && typeof s.cash === 'number') s = { ...s, cash: s.cash + refund };
  }
  return s;
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
