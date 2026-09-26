/**
 * v7: streak safety net. Existing installs get the starter freeze new ones start with (only if
 * they hold fewer than 2), and their current run counts as having passed the milestones below
 * it, so nobody is paid a retroactive milestone freeze. Pure, so a regression can run it.
 */
import { milestoneAtOrBelow, type StreakRepair } from './streak-freeze';

export const STREAK_SAFETY_STORE_VERSION = 7;

type StreakFields = { streak?: number; streakFreezes?: number; freezeMilestoneRun?: number; streakRepair?: StreakRepair | null };

export function applyStreakSafety<T extends StreakFields>(state: T, from: number): T {
  if (from >= STREAK_SAFETY_STORE_VERSION) return state;
  const held = state.streakFreezes ?? 0;
  return {
    ...state,
    streakFreezes: held < 2 ? held + 1 : held,
    freezeMilestoneRun: milestoneAtOrBelow(state.streak ?? 0),
    streakRepair: null,
  };
}
