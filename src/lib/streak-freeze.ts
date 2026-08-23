/**
 * WHEN A STREAK FREEZE IS SPENT, and what the streak becomes. One rule, one copy.
 *
 * Its own file taking plain values rather than AppState, for the C113 reason trial-reward.ts and
 * dismissal-offer.ts already state: entitlement-shaped logic defined at a call site is untestable,
 * and `store.ts` cannot be imported by a Node regression because it pulls in zustand and React
 * Native. An untestable rule guarding a PAID item is how a purchase silently stops working.
 *
 * KEEP THIS FILE ERASABLE-SYNTAX-ONLY. Node strips types rather than compiling them.
 */

/**
 * `nextStreak` resets to 1 on ANY gap. A Streak Freeze absorbs exactly ONE missed day, which is
 * precisely what the shop item promises — "Protects your streak for one missed day" — and no more:
 * a freeze that covered a week would make the streak meaningless, and the item does not claim to.
 *
 * Returns `freezeUsed` rather than mutating, so the caller decrements in the same `set` that writes
 * the streak. Two writes could interleave and spend a freeze without crediting the day.
 */
export function resolveStreak(p: {
  streak: number;
  lastActiveDay: string;
  /** Day keys, injected so this is pure and a test can place "today" anywhere. */
  today: string;
  yesterday: string;
  dayBefore: string;
  freezes: number;
}): { streak: number; freezeUsed: boolean } {
  // Already counted today. Not a new day, so nothing to protect and nothing to spend.
  if (p.lastActiveDay === p.today) return { streak: p.streak, freezeUsed: false };

  // The ordinary case: yesterday into today. No gap, so a freeze must NOT be spent here — that
  // would burn a paid item on a day the user did not miss.
  if (p.lastActiveDay === p.yesterday) return { streak: p.streak + 1, freezeUsed: false };

  // Exactly one missed day, and a freeze in hand. The streak continues as if the day happened.
  if (p.lastActiveDay === p.dayBefore && p.freezes > 0) {
    return { streak: p.streak + 1, freezeUsed: true };
  }

  // Two or more missed days, or no freeze. The streak resets, and a freeze is NOT spent on a gap
  // it cannot bridge — spending it here would take the item and still lose the streak.
  return { streak: 1, freezeUsed: false };
}
