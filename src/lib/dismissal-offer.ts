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
/**
 * Lessons that must be finished before this offer may fire.
 *
 * ADDED 2026-08-23 from the audit: "Instead of showing this after every single lesson, consider
 * showing it after a few lessons."
 *
 * The premise is not literally true — this offer and the trial reward are BOTH once per install,
 * and neither repeats. But there are TWO of them and they both fired around lesson one: the reward
 * chest on the first completion, and this one the first time a wall was dismissed. Two monetisation
 * sheets inside a couple of minutes is indistinguishable, from the outside, from one sheet that
 * keeps coming back. The perception is the defect even though the count was already correct.
 *
 * Three, because it is the smallest number that guarantees the two cannot stack: the reward is
 * anchored to lesson one, so a floor of three puts at least one clean lesson between them.
 */
export const OFFER_MIN_LESSONS = 3;

export function dismissalOfferAvailable(p: {
  iapEnabled: boolean;
  isPro: boolean;
  specialOfferSeenAt: number | null;
  /** Completed lessons. Optional so a caller that cannot cheaply count them still behaves as
   *  before rather than silently suppressing the offer forever. */
  lessonsDone?: number;
}): boolean {
  if (!p.iapEnabled) return false;
  if (p.isPro) return false;
  // `!== null`, never truthiness: a stamp of 0 is a stamp. Epoch 0 is not "unseen".
  if (p.specialOfferSeenAt !== null) return false;
  // Undefined means "caller did not say", which must not mean "zero" — that would gate the offer
  // shut on every surface that has not been updated.
  return p.lessonsDone === undefined || p.lessonsDone >= OFFER_MIN_LESSONS;
}
