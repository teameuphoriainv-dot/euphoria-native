/**
 * Resolving a league week.
 *
 * THE BUG THIS FIXES IS SILENT, WHICH IS WHY IT SURVIVED. `applyXp` carries zero forward the
 * moment the week key changes:
 *
 *     const carried = s.weekStart === wk ? s.weeklyXp : 0;
 *
 * So a finished week was not resolved, it was DISCARDED — at the next XP award whatever you earned
 * last week vanished, and nothing ever paid you. The league screen drew a PROMOTION ZONE line and
 * the zone meant nothing: you could finish first every week for a month and the app would never
 * once acknowledge it. Nothing failed, nothing logged, no gate went red.
 *
 * THE PAYOUT IS MEASURED AGAINST YOU, NOT AGAINST THE RIVALS. The league board ranks you against
 * PEOPLE, and people.ts opens by saying so in capitals: "EVERY PERSON IN THIS FILE IS FABRICATED."
 * Ranking against them is fine — it is disclosed on screen as a practice league — but paying real
 * currency for beating invented people makes the reward rest on the fabrication, and the day those
 * rivals are replaced by real accounts every payout silently changes meaning. A weekly XP target
 * does not have that problem: it means the same thing before and after accounts exist, and it
 * cannot be gamed by the field being tuned.
 *
 * THE TARGETS ARE FIXED, NOT DERIVED FROM THE USER'S OWN GOAL. Scaling to `profile.dailyMinutes`
 * sounds fairer and is exploitable: set the daily goal to its minimum and the bonus is trivially
 * earned every week. A fixed bar means the same effort earns the same reward for everyone.
 *
 * The numbers are anchored, not picked. At the app's own award rates (people.ts: lesson 50, guide
 * 25, game 20, daily goal 50) a week of one lesson a day plus the daily goal is about 700 XP. So
 * 600 is a genuinely committed week and 250 is a real but lighter one. The bonus ceiling is 150 a
 * week however much is ground out, which is roughly 30% of a strong week at shop-items.ts::EARN
 * rates and buys exactly one Streak Freeze.
 */

/**
 * Ordered HIGHEST FIRST — `outcomeFor` takes the first bar the week clears, so the order is load
 * bearing. A new tier inserted in the wrong place would silently pay the lower bonus.
 */
export const WEEK_TARGETS = [
  { key: 'strong', xp: 600, coins: 150, label: 'Strong week' },
  { key: 'steady', xp: 250, coins: 50, label: 'Steady week' },
  { key: 'quiet', xp: 0, coins: 0, label: 'Quiet week' },
] as const;

export type WeekResult = (typeof WEEK_TARGETS)[number]['key'];

export type WeekOutcome = {
  /** The Monday of the week this resolves, so a result can never be paid twice. */
  week: string;
  xp: number;
  result: WeekResult;
  coins: number;
};

/** The highest target `weeklyXp` clears. Never undefined: the last bar is 0. */
export function targetFor(weeklyXp: number) {
  return WEEK_TARGETS.find((t) => weeklyXp >= t.xp) ?? WEEK_TARGETS[WEEK_TARGETS.length - 1];
}

export function outcomeFor(week: string, weeklyXp: number): WeekOutcome {
  const t = targetFor(weeklyXp);
  return { week, xp: weeklyXp, result: t.key, coins: t.coins };
}

/** Copy for a resolved week, so the store holds the key and the screen holds the words. */
export function labelFor(result: WeekResult): string {
  return WEEK_TARGETS.find((t) => t.key === result)?.label ?? '';
}

/* One runnable check, dev only — the pattern league.ts already uses. Boundaries are the whole risk:
 * an off-by-one at a target pays or withholds a bonus at exactly the number a user is watching. */
if (typeof __DEV__ !== 'undefined' && __DEV__) {
  const eq = (got: unknown, want: unknown, what: string) => {
    if (got !== want) console.error(`[league-week] ${what}: got ${String(got)}, expected ${String(want)}`);
  };
  eq(targetFor(600).key, 'strong', 'landing exactly on the strong bar clears it');
  eq(targetFor(599).key, 'steady', 'one XP short of strong is steady, not strong');
  eq(targetFor(250).key, 'steady', 'landing exactly on the steady bar clears it');
  eq(targetFor(249).key, 'quiet', 'one XP short of steady pays nothing');
  eq(targetFor(0).key, 'quiet', 'a week with no XP is quiet');
  eq(outcomeFor('2026-08-17', 10_000).coins, 150, 'the bonus is capped by the top tier, not by effort');
}
