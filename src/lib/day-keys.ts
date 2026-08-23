/**
 * Calendar keys and the streak rule. Small, and load-bearing out of all proportion to its size.
 *
 * WHY ITS OWN FILE. `store.ts` warns at its own foot that "the XP funnel is exactly where a silent
 * drift hides: a wrong weekKey means…" — and then defined weekKey inline, untestable, in a file
 * over its line threshold. Every function here decides something a user sees as a fact about
 * themselves: whether their streak survived the night, whether today counted toward the trial,
 * which week their league standing belongs to. All of them fail SILENTLY and none of them fail on
 * the day you write them — they fail across a midnight, a year boundary, or a timezone the author
 * does not live in.
 *
 * Extracted alongside `cost-basis.ts`, `portfolio-value.ts`, `trial-reward.ts`, `dismissal-offer.ts`
 * and `billing-retry.ts`, for the same reason each of those exists: a rule a regression can import
 * rather than restate.
 *
 * KEEP THIS FILE ERASABLE-SYNTAX-ONLY. Node strips types rather than compiling them.
 *
 * `d` is injectable throughout so a test can pin a boundary without waiting for one.
 */

/** Local calendar day, 'YYYY-MM-DD'. Local rather than UTC so the daily goal rolls over at the
 *  user's midnight, not UTC's. */
export const dayKey = (d: Date = new Date()) =>
  new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

/**
 * Append today to the trial's active-day set, idempotently.
 *
 * Shared by `markActiveDay` and by the five actions that constitute real use, so the trial clock
 * can never disagree with the thing that advanced it. Slice(-4) is TRIAL_DAYS + 1 — one past the
 * limit is all `tier()` in lib/entitlement.ts needs to answer "expired", and keeping more would
 * grow the array for the life of the install with no reader.
 */
export const withToday = (days: string[]) => {
  const k = dayKey();
  return days.includes(k) ? days : [...days, k].slice(-4);
};

/**
 * Whether a launch right now is a RETURN worth counting, given the day one was last counted.
 *
 * Three conditions, each load-bearing:
 *   - `activeDays.length > 0` — a first-ever install is an install, not a return.
 *   - `!activeDays.includes(k)` — today has not already counted as a trial day.
 *   - `lastReturnDay !== k`    — and we have not already counted a return today.
 *
 * The third one was missing, and the first two cannot cover for it. `activeDays` is written by real
 * USE, never by launching — see `withToday`'s call sites — so between opening the app and doing
 * anything in it, both of the first two conditions stay true on EVERY launch. Verified against
 * PostHog on 2026-08-13: two launches ninety seconds apart produced two `day_return` events for one
 * device. That inflates the precise metric the event exists to measure, and day-N retention would
 * have read as engagement. Same shape as the `paywall_dismissed` double-count in 17d.
 *
 * Kept here rather than at the call site because it is a rule about days, and because a unit test on
 * the old predicate would have passed — the bug was that the predicate was asked once per launch.
 */
export const shouldCountReturn = (lastReturnDay: string, activeDays: string[]) => {
  const k = dayKey();
  return activeDays.length > 0 && !activeDays.includes(k) && lastReturnDay !== k;
};

/** Yesterday's local day key. Used to decide whether a completion extends the streak or restarts it. */
export const prevDayKey = () => dayKey(new Date(Date.now() - 86_400_000));

/** Two days back. Only the Streak Freeze needs it: a freeze bridges exactly one missed day, so the
 *  rule has to be able to name the day BEFORE yesterday to recognise that gap and no wider one. */
export const dayBeforeKey = () => dayKey(new Date(Date.now() - 2 * 86_400_000));

/** The streak a completion *right now* produces: unchanged if today is already counted, +1 if the
 *  last active day was yesterday, otherwise restarted at 1. Shared so the lesson celebration and
 *  the actual write can never disagree. */
export const nextStreak = (streak: number, lastActiveDay: string) => {
  if (lastActiveDay === dayKey()) return streak;
  return lastActiveDay === prevDayKey() ? streak + 1 : 1;
};

/** Monday of the local week, 'YYYY-MM-DD'. League standings run Monday to Sunday like the
 *  reference apps. Keyed by the week's start DATE rather than an ISO week number, which is fiddly
 *  across year boundaries for no benefit here. */
export const weekKey = (d: Date = new Date()) => {
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  const mondayOffset = (local.getUTCDay() + 6) % 7; // Mon=0 ... Sun=6
  local.setUTCDate(local.getUTCDate() - mondayOffset);
  return local.toISOString().slice(0, 10);
};
