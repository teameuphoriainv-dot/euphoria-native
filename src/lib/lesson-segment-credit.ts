/**
 * WHAT ONE PART OF A LESSON PAYS, and what the final part is still owed.
 *
 * A lesson now finishes in two or three parts (Learn, Vocab, Practice — see `lesson-segments.ts`).
 * Each non-final part credits XP, minutes and the streak the moment its card appears; the last
 * part runs the existing `completeLesson`. Two paths pay from one wallet, which is exactly the
 * shape that farms a reward: pay the part and the whole lesson without subtracting, and a
 * three-part lesson pays its XP twice. Nothing on screen would say so.
 *
 * ITS OWN FILE, taking plain values rather than AppState, for the C113 reason `streak-freeze.ts`,
 * `trial-reward.ts` and `dismissal-offer.ts` already state: reward arithmetic defined at a call
 * site is untestable, because `store.ts` cannot be imported by a Node regression (zustand and
 * React Native). An untestable rule that mints XP, coins and streak days is how an economy
 * silently inflates. `scripts/lesson-segment-credit-regression.mjs` imports this file directly.
 *
 * WHAT IT DELIBERATELY DOES NOT DO:
 *   - **It never applies the XP itself.** `applyXp` is private to `store.ts:219` and is the one
 *     place a tier crossing is detected; an award that skipped it would make lifetime and weekly
 *     totals diverge. `patch.xpToApply` is handed back and the store funnels it through.
 *   - **It never reads the clock.** The three day keys and the Double XP multiplier are injected,
 *     so a regression can place "today" on either side of a midnight without waiting for one.
 *     `activeDays` is left to the store, which owns `withToday` and its real-clock `dayKey()`.
 *   - **It never touches `completedLessons`, lesson coins or reward cards.** Those are whole-lesson
 *     rewards by the owner's decision, and they stay in `completeLesson`.
 *
 * KEEP THIS FILE ERASABLE-SYNTAX-ONLY. Node strips types rather than compiling them.
 */
import { readSegmentRecord, type SegmentKind, type SegmentRecord } from './lesson-segments';
import { resolveStreak } from './streak-freeze';
import { EARN } from './shop-items';

/**
 * Bounds on the minutes ONE lesson may credit to the daily goal. The floor pays a genuinely fast
 * completion; the ceiling stops a lesson left open in a pocket from swallowing the whole goal.
 *
 * MOVED HERE FROM `store.ts`, where they were module-private, because the ceiling is now shared by
 * two paths. Left private there, the per-part credit would have needed its own copy of 30, and
 * three parts of one lesson could each have credited up to 30 minutes — 90 minutes against a
 * ten-minute goal, paying the +50 goal bonus off a single lesson. Section 6.3: never resolve the
 * same rule in two places.
 */
export const MIN_MINUTES_PER_LESSON = 1;
export const MAX_MINUTES_PER_LESSON = 30;

/**
 * The daily-goal bonus, re-exported by `store.ts` so every existing importer keeps working.
 *
 * It lives here for the same reason the minute bounds do: both `completeLesson` and the per-part
 * credit pay it, and a second literal is a second source of truth. Defined here rather than there
 * so the regression can import the real number instead of restating 50 in a fixture that would
 * never notice the day the bonus changed.
 */
export const XP_DAILY_GOAL = 50;

/**
 * Every kind a lesson can contain, in order.
 *
 * `segmentsDoneFor` answers this whole list for a lesson in `completedLessons`, which is what
 * makes the migration a no-op (design 2c.1): a finished lesson counts every part done without a
 * byte written, for any segment shape a future curriculum sync produces.
 */
export const ALL_SEGMENT_KINDS: readonly SegmentKind[] = ['learn', 'vocab', 'practice'];

/** What the runner needs back to draw the part card and fire one analytics event. */
export type SegmentCreditResult = {
  /** False when the part was already paid, or the lesson is already finished. */
  credited: boolean;
  /** WHAT THIS PART ITSELF PAID: the share times Double XP, 0 when the credit was refused.
   *
   *  NOT the whole XP movement. This used to be `(share + bonus) * mult`, and the daily-goal
   *  bonus rode along into the card: measured on the simulator on 22 Sep 2026, finishing Learn on
   *  investing-fundamentals:2 (30 XP, shares 10/5/15) with `minutesToday` at 9 of a 10 minute goal
   *  drew "+60 XP" on the part card, twice what the whole lesson is worth, and the same run then
   *  offered "Collect +15 XP" at the end. Design 3a fixes the ceiling the other way round: "the
   *  largest share a part card ever shows is 25", which is what keeps a part from reading as the
   *  payout beat. The lesson-complete screen has never shown the goal bonus in its Collect label
   *  either, so the two surfaces now count the same thing.
   *
   *  Still read back from the reducer and never the share that was asked for (section 6.5): a
   *  part credited twice returns 0 here and the card draws no chip. `patch.xpToApply` remains the
   *  full movement, so the bonus is still PAID — it is only not announced as part XP. */
  xp: number;
  streakAdvanced: boolean;
  streak: number;
};

/** The slice of AppState this reducer reads. Narrow on purpose: a wider type would let a future
 *  field be read here without the regression's fixture ever mentioning it. */
export type SegmentCreditState = {
  completedLessons: readonly string[];
  lessonSegments: Record<string, SegmentRecord>;
  lastActiveDay: string;
  minutesToday: number;
  lessonsToday: number;
  streak: number;
  bestStreak: number;
  streakFreezes: number;
  coins: number;
  profile: { dailyMinutes: number | null };
};

export type SegmentCreditOptions = {
  id: string;
  kind: SegmentKind;
  /** This part's XP share, from `segmentXpShares`. */
  share: number;
  /** Real elapsed minutes in THIS part. The runner resets its clock at every part start. */
  minutes: number;
  today: string;
  yesterday: string;
  dayBefore: string;
  /** 2 while Double XP is active, 1 otherwise. */
  mult: number;
};

export type SegmentCreditPatch = {
  lessonSegments: Record<string, SegmentRecord>;
  coins: number;
  minutesToday: number;
  lessonsToday: number;
  lastActiveDay: string;
  streak: number;
  bestStreak: number;
  streakFreezes: number;
  /** NOT a state field. The store must spread `applyXp(s, xpToApply)` — see the header. */
  xpToApply: number;
};

/** Minutes this lesson may still credit. Read by both paths so a lesson caps at 30 in total. */
export function lessonMinutesRemaining(record: SegmentRecord): number {
  return Math.max(0, MAX_MINUTES_PER_LESSON - record.minutesPaid);
}

/**
 * XP the final part still owes: the lesson's XP minus what its parts already paid.
 *
 * `Math.max(0, …)` rather than a raw subtraction because a curriculum sync can LOWER a lesson's
 * XP between the part that was paid and the part that finishes it. Without the floor that lesson
 * would pay a negative award, and `applyXp` would quietly take XP off a learner who earned it.
 */
export function lessonXpRemainder(record: SegmentRecord, xp: number): number {
  const total = Number.isFinite(xp) && xp > 0 ? xp : 0;
  return Math.max(0, total - record.xpPaid);
}

/**
 * Drop a lesson's part record. Called by `completeLesson`, so the map only ever holds lessons
 * someone has started and not finished, and cannot grow for the life of the install.
 */
export function withoutSegmentRecord(
  map: Record<string, SegmentRecord>,
  id: string,
): Record<string, SegmentRecord> {
  if (!(id in map)) return map;
  const next = { ...map };
  delete next[id];
  return next;
}

/**
 * Credit ONE non-final part.
 *
 * THE DEDUPE IS THE ANTI-FARM RULE. Back, a resume, a deep link, a remount or a replay all re-enter
 * a part that was already paid; without the `done.includes` guard each of those is free XP, free
 * minutes and, on a fresh day, a free +25 coins. The card is credited when it APPEARS rather than
 * on a tap, so a force quit keeps the part — which makes a repeat visit the ordinary case, not the
 * exotic one.
 */
export function creditSegment(
  s: SegmentCreditState,
  o: SegmentCreditOptions,
): { patch: SegmentCreditPatch | null; result: SegmentCreditResult } {
  const record = readSegmentRecord(s.lessonSegments[o.id]);
  const refused = { credited: false, xp: 0, streakAdvanced: false, streak: s.streak };
  if (s.completedLessons.includes(o.id)) return { patch: null, result: refused };
  if (record.done.includes(o.kind)) return { patch: null, result: refused };

  const share = Number.isFinite(o.share) && o.share > 0 ? Math.round(o.share) : 0;
  const mult = o.mult === 2 ? 2 : 1;

  // roll the tally over when the calendar day changed since the last credit
  const base = s.lastActiveDay === o.today ? s.minutesToday : 0;
  /*
   * NO ONE-MINUTE FLOOR HERE, unlike `completeLesson`. That floor exists so a genuinely fast whole
   * lesson still pays something. A part is a fraction of a lesson, so a floor per part would pay a
   * three-part lesson three minutes for under a minute of work and turn the daily goal into a
   * lesson count again — the exact bug `goal-minutes-pin` was written for, arriving by a new door.
   */
  const measured = Number.isFinite(o.minutes) && o.minutes > 0 ? Math.round(o.minutes) : 0;
  const earned = Math.min(measured, lessonMinutesRemaining(record));
  const minutes = base + earned;

  // Crossing the daily commitment pays a bonus, and crossing happens exactly once per day, so
  // parts cannot farm it: the second part of the day sees `base >= goal` and pays nothing.
  const goal = s.profile.dailyMinutes ?? 10;
  const bonus = base < goal && minutes >= goal ? XP_DAILY_GOAL : 0;

  /*
   * `resolveStreak`, NOT `nextStreak`. D3: guides extend the streak through `nextStreak`, which
   * never spends a freeze, so a learner with a freeze in hand and one missed day would lose the
   * streak they paid to protect. The freeze is decremented in the same patch, for the reason
   * `streak-freeze.ts` gives: two writes could interleave and take the item without the day.
   */
  const resolved = resolveStreak({
    streak: s.streak,
    lastActiveDay: s.lastActiveDay,
    today: o.today,
    yesterday: o.yesterday,
    dayBefore: o.dayBefore,
    freezes: s.streakFreezes,
  });
  const streakAdvanced = resolved.streak > s.streak;
  // +25 only when the streak actually ADVANCES. A second part the same day is not a second streak
  // day, and paying it again would make the streak farmable one part at a time.
  const streakCoins = streakAdvanced ? EARN.dailyStreak : 0;

  const next: SegmentRecord = {
    done: [...record.done, o.kind],
    // The BASE share, never the multiplied or bonused figure. `completeLesson` pays
    // `xp - xpPaid` against the lesson's own XP, so storing a doubled share here would hand the
    // final part a negative remainder and silently delete the last part's award.
    xpPaid: record.xpPaid + share,
    minutesPaid: record.minutesPaid + earned,
  };

  return {
    patch: {
      lessonSegments: { ...s.lessonSegments, [o.id]: next },
      coins: s.coins + streakCoins,
      minutesToday: minutes,
      /*
       * D2, AND THE REASON THIS LINE IS NOT `s.lessonsToday`. `markPostRead` stamps `lastActiveDay`
       * without rolling `lessonsToday` over, so reading a guide first thing carries yesterday's
       * lesson count into today's quest. Every writer of `lastActiveDay` has to roll the tallies
       * that hang off it. A part is not a finished lesson, so this never increments — it only
       * clears a stale count. Fixing `markPostRead` itself is out of scope and reported separately.
       */
      lessonsToday: s.lastActiveDay === o.today ? s.lessonsToday : 0,
      lastActiveDay: o.today,
      streak: resolved.streak,
      bestStreak: Math.max(s.bestStreak ?? 0, resolved.streak),
      streakFreezes: resolved.freezeUsed ? s.streakFreezes - 1 : s.streakFreezes,
      xpToApply: (share + bonus) * mult,
    },
    result: {
      credited: true,
      // The part's own award, not `xpToApply`. See SegmentCreditResult.xp: folding the daily-goal
      // bonus in here put "+60 XP" on a part of a 30 XP lesson.
      xp: share * mult,
      streakAdvanced,
      streak: resolved.streak,
    },
  };
}
