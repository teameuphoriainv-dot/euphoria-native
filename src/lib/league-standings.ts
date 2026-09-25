/**
 * League week standings, shared by the League screen and Home's league card so the two can never
 * disagree about where you stand. Standings rank on WEEKLY xp (a rank is defended and reset); the
 * tier comes from lifetime xp -- see the note at the top of src/app/league.tsx.
 */
import { PEOPLE } from './people';
import { weekKey } from './store';

/** Top 3 promote. */
export const PROMOTE = 3;

/** Days left in the league week. weekKey() returns the Monday a week belongs to, so it closes at
 *  the end of the following Sunday. Derived rather than printed, because the previous copy read
 *  "3 days left" on every day of the week including Sunday. */
export function daysLeft(): string {
  const monday = new Date(`${weekKey()}T00:00:00`);
  const endOfSunday = new Date(monday.getTime() + 7 * 86_400_000);
  const days = Math.ceil((endOfSunday.getTime() - Date.now()) / 86_400_000);
  if (days <= 1) return 'Ends today';
  if (days === 2) return '1 day left';
  return `${days - 1} days left`;
}

export type Standing = {
  /** 1-based rank among the full league field plus you. */
  rank: number;
  total: number;
  /** XP needed to reach the promotion zone; 0 when already in it. */
  toPromotion: number;
  /** Your weekly XP as a share of the promotion line (1 when in the zone). */
  towardPromotion: number;
};

/** Your place in this week's league. Ties rank you below the other player, matching the sorted
 *  board on the League screen (the field is listed first, and the sort is stable). */
export function standingFor(weekly: number): Standing {
  const others = PEOPLE.map((p) => p.weeklyXp).sort((a, b) => b - a);
  const ahead = others.filter((xp) => xp >= weekly).length;
  const rank = ahead + 1;
  const line = others[PROMOTE - 1] ?? 0;
  const inZone = rank <= PROMOTE;
  return {
    rank,
    total: others.length + 1,
    toPromotion: inZone ? 0 : line - weekly + 1,
    towardPromotion: inZone ? 1 : line > 0 ? Math.min(1, weekly / (line + 1)) : 0,
  };
}
