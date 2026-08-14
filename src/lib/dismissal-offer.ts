/**
 * 17d — WHEN THE DISMISSAL OFFER MAY FIRE. One rule, one copy.
 *
 * Same reasoning as `trial-reward.ts`, and the same reason it is its own dependency-free file:
 * `entitlement.ts` imports `./store`, which pulls in zustand and React Native, so a regression
 * script cannot load it. A predicate defined inline at a call site is untestable, and this one now
 * has FOUR call sites rather than one.
 *
 * WHY FOUR. §22 C115: the offer lived inside `gate-sheet.tsx` and nowhere else, while
 * `lesson.tsx` and `chat.tsx` render their own full-screen hard walls that never mount that sheet.
 * A user whose trial expired and who tapped Start on Home — the path the home screen pushes
 * hardest — hit the wall, dismissed it, and never saw the highest-convergence lever in the unit.
 * The rule had one home and three doors that bypassed it.
 *
 * KEEP THIS FILE ERASABLE-SYNTAX-ONLY. Node strips types rather than compiling them.
 */

/**
 * True when a second, better ask is honest right now.
 *
 * `iapEnabled` is in here for the §0.5 reason the gate sheet has always used it: with no configured
 * store there is no better price we could actually honour, and an offer the build cannot keep is a
 * dead control wearing a promise.
 *
 * ONCE PER INSTALL, EVER. The banked evidence (Yazio, Numify) shows apps re-prompting, and both
 * push a second spin — but an offer that reappears on every dismissal is not an offer, it is
 * nagging, and on a HARD wall it is the only thing between the user and the app.
 */
export function dismissalOfferAvailable(p: {
  iapEnabled: boolean;
  isPro: boolean;
  specialOfferSeenAt: number | null;
}): boolean {
  if (!p.iapEnabled) return false;
  if (p.isPro) return false;
  // `!== null`, never truthiness: a stamp of 0 is a stamp. Epoch 0 is not "unseen".
  return p.specialOfferSeenAt === null;
}
