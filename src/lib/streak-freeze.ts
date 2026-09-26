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

/*
 * STREAK SAFETY NET (owner decision, research-backed): a broken streak makes learners disengage
 * (Silverman & Barasch 2023), and a repair window softens that (Duolingo's streak repair). Pure,
 * so the rules are pinned by scripts/streak-freeze-regression.mjs rather than by a device.
 */

/** An open earn-back: finish `need` lessons before `deadline` (epoch ms) to restore `lost` days. */
export type StreakRepair = { lost: number; need: number; done: number; deadline: number };

export const REPAIR_WINDOW_MS = 48 * 3_600_000;
/** Streaks shorter than this simply restart; there is little to earn back. */
export const REPAIR_MIN_LOST = 3;
/** Missed more days than this and it is a fresh start, not a repair. */
export const REPAIR_MAX_MISSED = 2;
/** Lessons needed to earn a streak back: 2, or 3 for a streak of 30+ (Duolingo's number). */
export const repairNeed = (lost: number) => (lost >= 30 ? 3 : 2);
/** A freeze is earned once per run at each of these lengths. */
export const FREEZE_MILESTONES = [7, 30] as const;
/** Earned freezes stop at this many held; shop purchases are not capped. */
export const EARNED_FREEZE_CAP = 2;

/** Whole days from day key `a` to day key `b` ('YYYY-MM-DD'). */
export function daysBetween(a: string, b: string): number {
  const ms = (k: string) => Date.UTC(Number(k.slice(0, 4)), Number(k.slice(5, 7)) - 1, Number(k.slice(8, 10)));
  return Math.round((ms(b) - ms(a)) / 86_400_000);
}

/** The highest milestone at or below `streak` (0 if none) -- used so a restored or migrated run is
 *  never paid a milestone it already passed. */
export const milestoneAtOrBelow = (streak: number) => FREEZE_MILESTONES.filter((m) => m <= streak).reduce((a, m) => Math.max(a, m), 0);

/**
 * One day's activity, resolved: the streak (with freeze and repair), the freezes held after it,
 * the repair window, and whether a milestone freeze was earned. `isLesson` is true only for a
 * finished lesson: guides and lesson parts keep the day but never count toward a repair.
 */
export function resolveDay(p: {
  streak: number;
  lastActiveDay: string;
  today: string;
  yesterday: string;
  dayBefore: string;
  freezes: number;
  repair: StreakRepair | null;
  milestoneRun: number;
  now: number;
  isLesson: boolean;
}): {
  streak: number;
  freezes: number;
  freezeUsed: boolean;
  repair: StreakRepair | null;
  milestoneRun: number;
  freezeEarned: boolean;
  /** The days restored when a repair completes on this activity (for the roll-up), else null. */
  restored: number | null;
} {
  const base = resolveStreak(p);
  let streak = base.streak;
  let freezes = base.freezeUsed ? p.freezes - 1 : p.freezes;
  let repair = p.repair && p.now <= p.repair.deadline ? p.repair : null;
  let milestoneRun = p.milestoneRun;
  let restored: number | null = null;

  const broke = p.streak > 0 && p.lastActiveDay !== '' && streak === 1 && p.lastActiveDay !== p.today && p.lastActiveDay !== p.yesterday;
  if (broke) {
    milestoneRun = 0;
    const missed = daysBetween(p.lastActiveDay, p.today) - 1;
    if (p.streak >= REPAIR_MIN_LOST && missed <= REPAIR_MAX_MISSED) {
      repair = { lost: p.streak, need: repairNeed(p.streak), done: 0, deadline: p.now + REPAIR_WINDOW_MS };
    }
  }

  if (repair && p.isLesson) {
    const done = repair.done + 1;
    if (done >= repair.need) {
      restored = repair.lost;
      streak = repair.lost + streak;
      milestoneRun = milestoneAtOrBelow(repair.lost);
      repair = null;
    } else {
      repair = { ...repair, done };
    }
  }

  let freezeEarned = false;
  for (const m of FREEZE_MILESTONES) {
    if (streak >= m && milestoneRun < m) {
      milestoneRun = m;
      if (freezes < EARNED_FREEZE_CAP) {
        freezes += 1;
        freezeEarned = true;
      }
    }
  }

  return { streak, freezes, freezeUsed: base.freezeUsed, repair, milestoneRun, freezeEarned, restored };
}
