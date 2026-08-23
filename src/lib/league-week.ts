/**
 * Resolving a league week — the missing half of the ladder.
 *
 * THE BUG THIS FIXES IS SILENT, WHICH IS WHY IT SURVIVED. `applyXp` carries zero forward the
 * moment the week key changes:
 *
 *     const carried = s.weekStart === wk ? s.weeklyXp : 0;
 *
 * So a finished week is not resolved, it is DISCARDED — at the next XP award, whatever you earned
 * last week vanishes and nothing ever promoted, demoted or paid you. The league screen drew a
 * PROMOTION ZONE line above rank 3 and the zone meant nothing: you could finish first every week
 * for a month and the app would never once acknowledge it. Nothing in the app failed, no test went
 * red, and no error was logged, which is exactly how a missing mechanic hides.
 *
 * RULE ZERO. The web does not have this to copy: euphoriaweb keeps LEAGUE_SIZE / PROMOTION_ZONE /
 * DEMOTION_ZONE in leaderboard/constants.ts and a weekly cycle in getWeekStart, but its league
 * pays nothing either — it is a board you look at. This is iOS going ahead of web rather than
 * catching up, which is the one direction that needs its reasoning written down.
 *
 * RANK IS COMPUTED, NOT INVENTED. The standings field is PEOPLE, a fixed list with fixed weekly
 * scores, so a finished week's finishing position is a pure function of the XP you ended it with.
 * The rival scores are PASSED IN rather than imported, which keeps this module free of any data
 * dependency: it is pure arithmetic over numbers, so league-week-pin.mjs can import and exercise
 * the real functions under plain Node instead of re-implementing them.
 * That matters: resolving a past week must never fabricate a placement, and here it does not have
 * to. The tie rule mirrors the screen exactly — league.tsx sorts `b.xp - a.xp` over a field with
 * the rivals BEFORE "You", and Array.prototype.sort is stable, so a rival on equal XP is drawn
 * above you. Ranking you below ties is therefore what the user actually saw, not a coin flip.
 *
 * WHY THE PAYOUT IS THE ZONE AND NOT THE XP. Paying per-XP would mean a huge week that finished
 * eighth outearned a modest week that finished first, which argues against the thing the ladder
 * exists to encourage. The rank IS the achievement, so the rank is what pays. It also cannot
 * inflate: the ceiling is 150 a week no matter how much is ground out.
 *
 * The numbers are anchored to shop-items.ts::EARN rather than picked. At EARN's own rates a
 * committed week is roughly 7 lessons (50 each) plus 7 daily streaks (25 each) = 525 Euphorium, so
 * a 150 promotion bonus is about 30% of a strong week — worth chasing, not a windfall, and a
 * Streak Freeze (150) is exactly one promotion.
 */
/** Top 3 promote. Mirrors league.tsx's PROMOTE, which draws the line on screen. */
export const PROMOTE_RANK = 3;
/** Rank 8 and below demote. league.tsx draws its line at index >= 7, which is this 1-based. */
export const DEMOTE_RANK = 8;

export const WEEK_BONUS = { promoted: 150, held: 50, demoted: 0 } as const;

export type WeekResult = 'promoted' | 'held' | 'demoted';

export type WeekOutcome = {
  /** The Monday of the week this resolves, so a result can never be paid twice. */
  week: string;
  xp: number;
  /** 1-based finishing position in the full league field. */
  rank: number;
  result: WeekResult;
  coins: number;
};

/**
 * Where `weeklyXp` finished among the rivals.
 *
 * `>=` and not `>`: a rival tied with you is drawn above you on the board (stable sort, rivals
 * first), so counting ties as ahead is what the screen showed.
 */
export function rankFor(weeklyXp: number, rivalXp: readonly number[]): number {
  return 1 + rivalXp.filter((x) => x >= weeklyXp).length;
}

export function resultFor(rank: number): WeekResult {
  if (rank <= PROMOTE_RANK) return 'promoted';
  if (rank >= DEMOTE_RANK) return 'demoted';
  return 'held';
}

export function outcomeFor(week: string, weeklyXp: number, rivalXp: readonly number[]): WeekOutcome {
  const rank = rankFor(weeklyXp, rivalXp);
  const result = resultFor(rank);
  return { week, xp: weeklyXp, rank, result, coins: WEEK_BONUS[result] };
}

/* One runnable check, dev only — the pattern league.ts already uses. The boundaries are the whole
 * risk here: an off-by-one at rank 3 or rank 8 pays or withholds a bonus at exactly the position a
 * user is watching most closely, and would never announce itself. */
// `typeof` guard, unlike league.ts's bare `__DEV__`, so league-week-pin.mjs can import this module
// under plain Node and exercise the real functions rather than a copy of them. A pin that
// re-implements the logic it is guarding tests only itself.
if (typeof __DEV__ !== 'undefined' && __DEV__) {
  const eq = (a: unknown, b: unknown, what: string) => {
    if (JSON.stringify(a) !== JSON.stringify(b)) {
      console.error(`[league-week] ${what}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
    }
  };
  eq(resultFor(1), 'promoted', 'first place promotes');
  eq(resultFor(PROMOTE_RANK), 'promoted', 'the last promotion slot promotes');
  eq(resultFor(PROMOTE_RANK + 1), 'held', 'one below the line holds, it does not promote');
  eq(resultFor(DEMOTE_RANK - 1), 'held', 'one above the drop holds');
  eq(resultFor(DEMOTE_RANK), 'demoted', 'the first demotion rank demotes');
  const field = [400, 300, 200, 100];
  eq(outcomeFor('2026-08-17', 0, field).coins, WEEK_BONUS.demoted, 'a zero week pays nothing');
  eq(rankFor(401, field), 1, 'out-earning the whole field finishes first');
  eq(rankFor(400, field), 2, 'tying the leader ranks below them, as the board draws it');
}
