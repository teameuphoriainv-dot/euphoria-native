/**
 * 17c — WHEN THE TRIAL REWARD OFFER MAY FIRE. One rule, one copy.
 *
 * WHY THIS IS ITS OWN FILE, and why it takes plain numbers instead of `AppState`:
 * the C113 lesson, applied again. `cost-basis.ts` exists because the portfolio regression had
 * re-implemented the holdings math, the two copies drifted, and the partial-basis fix had to be
 * applied twice — inside the very change that added the script meant to prevent that. `entitlement.ts`
 * cannot be imported by a regression script: it imports `./store`, which pulls in zustand and
 * React Native, so Node cannot load it. A predicate defined at the `lesson.tsx` call site would
 * therefore be untestable, and an untestable gate on a paid offer is how a discount ends up minted
 * twice.
 *
 * KEEP THIS FILE ERASABLE-SYNTAX-ONLY. Node strips types rather than compiling them, so an `enum`
 * or a `namespace` here breaks `scripts/trial-reward-regression.mjs`.
 */

/** Mirrors `tier()`'s trial arm: not pro, and inside the granted window. */
export function trialRewardAvailable(p: {
  /** A configured store. §0.5: with no store there is no better price we could honour, so an
   *  "Open it" would open onto nothing. */
  iapEnabled: boolean;
  isPro: boolean;
  /** Null until spent. ONCE PER INSTALL, EVER — and not cleared by `reset()`, so replaying
   *  onboarding cannot mint a fresh discount. */
  trialRewardSeenAt: number | null;
  activeDays: number;
  trialDays: number;
}): boolean {
  // ORDER MIRRORS tier(): pro wins over everything, then the window. A paying member must never be
  // offered a discount on what they already bought.
  if (!p.iapEnabled) return false;
  if (p.isPro) return false;
  if (p.trialRewardSeenAt !== null) return false;
  // `>` not `>=`: tier() grants the trial through day TRIAL_DAYS inclusive and only expires past it.
  return p.activeDays <= p.trialDays;
}
