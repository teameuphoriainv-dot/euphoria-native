/**
 * Phase 16. The live mark behind `priceOf`.
 *
 * WHY THIS EXISTS. `stock/[sym].tsx` carried a long comment explaining that `priceOf()` — the static
 * table in `stocks.ts` — is the app's canonical mark for BOTH executing a trade and valuing the
 * resulting position, and that the two must move together or a cost basis gets booked in one
 * currency and the gain computed against another. It then named the exit: *"When Phase 16 makes
 * `priceOf` itself live-backed, execution and valuation move TOGETHER and this line needs no
 * change."* This is that. Every call site of `priceOf` is untouched.
 *
 * WHY A MODULE-LEVEL MAP AND NOT THE STORE. `stocks.ts` cannot import `store.ts` — the store already
 * imports `stocks.ts`, and the cycle is exactly why `portfolio-value.ts` takes `priceOf` as an
 * INJECTED argument rather than importing it. This file imports nothing, so nothing can cycle
 * through it. The store mirrors it for persistence and calls `hydrateMarks` on rehydration.
 *
 * WHY IT PERSISTS. A cold start with no network must not silently revert every position to the
 * static table. That is a portfolio-wide reprice presenting as a normal launch — the C113 shape, and
 * the reason §9.3 warns that making valuation live without making execution live is worse than
 * leaving both static. Last known marks survive the app being killed.
 *
 * WHY `0` MEANS "NO MARK". `priceOf` falls through to the static table on a falsy mark, so a
 * rejected value degrades to the old behaviour rather than to zero. A zero mark would make `cost`
 * zero, `0 <= cash` pass, and an unpriced ticker buyable for nothing — the exact door
 * `stock/[sym].tsx:122` was hardened against.
 *
 * KEEP THIS FILE ERASABLE-SYNTAX-ONLY. Node strips types rather than compiling them, so a regression
 * can import the real rule instead of restating it.
 */

const marks = new Map<string, number>();

/**
 * Record a live mark. Rejects anything that is not a positive finite number.
 *
 * The guard is not defensive noise: `/api/market` degrades by returning `null` from `safe()`, but a
 * malformed upstream body can still parse into `{ price: null }` or `{ price: 0 }`, and the columnar
 * options transpose in `api/_chain.ts` proves this codebase has already shipped a provider shape
 * that yields zeros instead of an error. A zero that reached `priceOf` would reprice a holding to
 * nothing while every screen rendered perfectly.
 */
export const setMark = (sym: string, price: number): void => {
  if (!Number.isFinite(price) || price <= 0) return;
  marks.set(sym.toUpperCase(), price);
};

/** The live mark, or 0 if this ticker has never been quoted. 0 is the fall-through signal. */
export const markOf = (sym: string): number => marks.get(sym.toUpperCase()) ?? 0;

/**
 * THE PHASE 16 RULE: a live mark supersedes the fallback, and nothing else does.
 *
 * `priceOf` in `stocks.ts` is one call to this, so the ordering lives here where a regression can
 * import it — `stocks.ts` itself is not importable by one, because it now has a dependency and Node
 * cannot resolve this codebase's extensionless imports. Same reasoning that keeps `cost-basis.ts`,
 * `portfolio-value.ts`, `day-keys.ts` and `api/_entitlement.ts` dependency-free.
 *
 * `||` rather than `??` is deliberate: `markOf` returns 0 for "never quoted", and 0 must fall
 * through to the fallback rather than being served as a price.
 */
export const markOr = (sym: string, fallback: number): number => markOf(sym) || fallback;

/** Snapshot for persistence. Plain object so it survives JSON. */
export const allMarks = (): Record<string, number> => Object.fromEntries(marks);

/**
 * Restore persisted marks on rehydration. Every entry goes through `setMark`, so a corrupted or
 * hand-edited storage blob cannot inject a zero or a NaN that a fresh fetch would have rejected.
 */
export const hydrateMarks = (saved: Record<string, number> | undefined): void => {
  if (!saved) return;
  for (const [sym, price] of Object.entries(saved)) setMark(sym, price);
};

/** Test seam. Not used by the app. */
export const clearMarks = (): void => {
  marks.clear();
};
