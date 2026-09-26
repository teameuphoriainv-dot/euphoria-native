/**
 * A LESSON PAID IN PARTS MUST STILL PAY EXACTLY ONE LESSON.
 *
 * Splitting a lesson into Learn, Vocab and Practice puts two paths on the same wallet: each
 * non-final part credits XP, minutes, the streak and its coins the moment its card appears, and
 * the last part runs `completeLesson`. Every failure in that arrangement is silent and looks like
 * generosity:
 *   - the final screen paying the lesson's full XP again, so a three-part lesson is worth double;
 *   - a part re-entered by Back, a resume, a deep link or a remount paying a second time;
 *   - three parts each crediting up to 30 minutes against a ten-minute daily goal;
 *   - two parts on one day each advancing the streak and each paying +25 coins;
 *   - a freeze spent twice on one missed day, which takes a PAID item the user can see is gone.
 * None of them throws, none of them shows on screen, and all of them inflate the economy.
 *
 * WHAT THIS FILE CAN AND CANNOT RUN. `store.ts` pulls in zustand and React Native, so Node cannot
 * import it. The arithmetic therefore lives in `lesson-segment-credit.ts` and is executed here for
 * real. The pieces that must stay inside the reducer — the clamp `goal-minutes-pin` matches, the
 * freeze decrement `streak-freeze-regression` matches, the early return `lesson-resume-regression`
 * matches — are asserted as source text, including the one line that merges the helper's patch, so
 * the model below cannot drift away from the wiring it stands for.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { readSegmentRecord, segmentXpShares, segmentsOf } from '../src/lib/lesson-segments.ts';
import {
  MAX_MINUTES_PER_LESSON,
  MIN_MINUTES_PER_LESSON,
  XP_DAILY_GOAL,
  creditSegment,
  lessonMinutesRemaining,
  lessonXpRemainder,
  withoutSegmentRecord,
} from '../src/lib/lesson-segment-credit.ts';
import { resolveStreak } from '../src/lib/streak-freeze.ts';

const fail = [];
const check = (name, ok, detail = '') => {
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${name}`);
  if (!ok) fail.push(detail ? `${name}: ${detail}` : name);
};
const eq = (name, got, want) =>
  check(name, JSON.stringify(got) === JSON.stringify(want), `expected ${JSON.stringify(want)}, got ${JSON.stringify(got)}`);

const D = { today: '2026-09-22', yesterday: '2026-09-21', dayBefore: '2026-09-20' };

const stateAt = (over = {}) => ({
  completedLessons: [],
  lessonSegments: {},
  lastActiveDay: '',
  minutesToday: 0,
  lessonsToday: 0,
  streak: 0,
  bestStreak: 0,
  streakFreezes: 0,
  coins: 0,
  // A goal nothing in these fixtures can reach, so the +50 bonus does not contaminate the XP
  // arithmetic. It gets its own case below.
  profile: { dailyMinutes: 999 },
  ...over,
});

/**
 * Apply one part credit the way the store does.
 *
 * This mirrors `completeLessonSegment`'s single merge line, and that line is pinned as text at the
 * foot of this file. A model that drifts from the reducer proves nothing about the reducer.
 */
function credit(state, opts) {
  const { patch, result } = creditSegment(state, { ...D, mult: 1, minutes: 0, ...opts });
  if (!patch) return { state, result, xpApplied: 0 };
  const { xpToApply, ...rest } = patch;
  return { state: { ...state, ...rest }, result, xpApplied: xpToApply };
}

/** The final part's minutes, exactly as `completeLesson` computes them. Pinned as text below. */
const finalMinutes = (record, spent) =>
  Math.min(MAX_MINUTES_PER_LESSON, Math.max(MIN_MINUTES_PER_LESSON, Math.round(spent)), lessonMinutesRemaining(record));

console.log('\nlesson part credit\n');

/* ── (a) the shares sum to the lesson, over the real corpus ──────────────────────────────────
 * Measured rather than assumed: the XP values and the two-or-three-part shapes come from the
 * curriculum itself, so a sync that introduces a new XP value is covered the day it lands.
 */
const REPO = process.cwd();
const { COURSES, loadCourseLessons } = await import(path.join(REPO, 'src/lib/curriculum/index.ts'));
const { expandSteps } = await import(path.join(REPO, 'src/lib/lesson-steps.ts'));
const { hasMasteryChallenge } = await import(path.join(REPO, 'src/lib/mastery-challenge-model.ts'));

const shapes = new Set();
const xpValues = new Set();
let lessons = 0;
for (const course of COURSES) {
  for (const lesson of await loadCourseLessons(course.id)) {
    const kinds = segmentsOf(expandSteps(lesson.steps).map((s) => s.type), hasMasteryChallenge(lesson.challenge)).map((s) => s.kind);
    shapes.add(kinds.join('+'));
    xpValues.add(lesson.xp);
    lessons += 1;
  }
}
const xpList = [...xpValues].sort((a, b) => a - b);
console.log(`  corpus: ${lessons} lessons, xp values ${xpList.join(', ')}, shapes ${[...shapes].join(' / ')}`);

let shareFailures = 0;
let biggestNonFinal = 0;
for (const shape of shapes) {
  const kinds = shape.split('+');
  for (const xp of xpList) {
    const shares = segmentXpShares(xp, kinds);
    const sum = shares.reduce((a, b) => a + b, 0);
    if (sum !== xp) shareFailures += 1;
    if (shares.length !== kinds.length) shareFailures += 1;
    if (shares.some((v) => v < 5)) shareFailures += 1;
    biggestNonFinal = Math.max(biggestNonFinal, ...shares.slice(0, -1));
  }
}
check(`(a) every share sums to its lesson xp and none is below 5 (${shapes.size} shapes x ${xpList.length} xp values)`,
  shareFailures === 0, `${shareFailures} share sets were wrong`);
console.log(`  largest non-final share across the corpus: ${biggestNonFinal}`);

/* ── (b) a part is paid once, whatever re-enters it ──────────────────────────────────────────── */
{
  const first = credit(stateAt(), { id: 'c:1', kind: 'learn', share: 10, minutes: 4 });
  const again = credit(first.state, { id: 'c:1', kind: 'learn', share: 10, minutes: 4 });
  eq('(b) the first credit of a part pays its share', [first.result.credited, first.xpApplied], [true, 10]);
  eq('(b) a repeat of the same part pays nothing', [again.result.credited, again.xpApplied], [false, 0]);
  eq('(b) and nothing is recorded twice', readSegmentRecord(again.state.lessonSegments['c:1']), { done: ['learn'], xpPaid: 10, minutesPaid: 4 });
  const done = credit(stateAt({ completedLessons: ['c:1'] }), { id: 'c:1', kind: 'vocab', share: 5, minutes: 3 });
  eq('(b) a finished lesson cannot credit a part at all', [done.result.credited, done.xpApplied], [false, 0]);
}

/* ── (c) parts plus the finish pay EXACTLY the lesson, for every corpus shape and xp ─────────── */
{
  const wrong = [];
  for (const shape of shapes) {
    const kinds = shape.split('+');
    for (const xp of xpList) {
      const shares = segmentXpShares(xp, kinds);
      let state = stateAt();
      let paid = 0;
      for (let i = 0; i < kinds.length - 1; i += 1) {
        const step = credit(state, { id: 'c:1', kind: kinds[i], share: shares[i], minutes: 3 });
        state = step.state;
        paid += step.xpApplied;
      }
      // the final part is `completeLesson`, which pays the remainder off the record the parts left
      paid += lessonXpRemainder(readSegmentRecord(state.lessonSegments['c:1']), xp);
      if (paid !== xp) wrong.push(`${shape} @ ${xp} paid ${paid}`);
    }
  }
  check('(c) every part plus the finish pays exactly the lesson xp, never more', wrong.length === 0, wrong.join('; '));

  // and the record is gone once the lesson is complete, so a replay cannot subtract old shares
  const held = { 'c:1': { done: ['learn'], xpPaid: 15, minutesPaid: 4 }, 'c:2': { done: [], xpPaid: 0, minutesPaid: 0 } };
  eq('(c) completing a lesson drops its record', Object.keys(withoutSegmentRecord(held, 'c:1')), ['c:2']);
  eq('(c) and a lesson with no record is left alone', withoutSegmentRecord(held, 'c:9') === held, true);
}

/* ── (d) one day is one streak day, however many parts it takes ──────────────────────────────── */
{
  const start = stateAt({ streak: 4, lastActiveDay: D.yesterday, coins: 100 });
  const one = credit(start, { id: 'c:1', kind: 'learn', share: 10, minutes: 3 });
  const two = credit(one.state, { id: 'c:1', kind: 'vocab', share: 5, minutes: 3 });
  eq('(d) the first part of the day advances the streak', [one.result.streakAdvanced, one.result.streak], [true, 5]);
  eq('(d) the second part does not advance it again', [two.result.streakAdvanced, two.result.streak], [false, 5]);
  eq('(d) and +25 coins is paid exactly once', [one.state.coins, two.state.coins], [125, 125]);

  // a freeze bridges one missed day, and only one part may spend it
  // streak 4, not 6: reaching day 7 now earns a milestone freeze (streak safety net), which would
  // mask the spend this case is about.
  const gap = stateAt({ streak: 4, lastActiveDay: D.dayBefore, streakFreezes: 1 });
  const g1 = credit(gap, { id: 'c:1', kind: 'learn', share: 10, minutes: 2 });
  const g2 = credit(g1.state, { id: 'c:1', kind: 'vocab', share: 5, minutes: 2 });
  eq('(d) one missed day, one freeze: the streak is saved and one freeze is spent', [g1.result.streak, g1.state.streakFreezes], [5, 0]);
  eq('(d) the second part of the same day spends no second freeze', [g2.result.streak, g2.state.streakFreezes], [5, 0]);

  /*
   * THE TWO PATHS AGREE BECAUSE THEY CALL THE SAME RULE. `completeLesson` keeps its streak block
   * inline (moving it would edit three pinned literals), so the guarantee here is that the part
   * path resolves to exactly what `resolveStreak` returns for the same state — the same function
   * `completeLesson` calls, with the same six inputs, which is asserted as text at the foot.
   */
  for (const [label, last, freezes, streak] of [
    ['same day', D.today, 2, 3],
    ['yesterday', D.yesterday, 2, 3],
    ['one missed day with a freeze', D.dayBefore, 1, 3],
    ['one missed day with none', D.dayBefore, 0, 3],
    ['a week away', '2026-09-14', 3, 9],
  ]) {
    const s = stateAt({ streak, lastActiveDay: last, streakFreezes: freezes });
    const part = credit(s, { id: 'c:9', kind: 'learn', share: 10, minutes: 1 });
    const rule = resolveStreak({ streak, lastActiveDay: last, ...D, freezes });
    eq(`(d) part credit matches resolveStreak: ${label}`,
      [part.result.streak, part.state.streakFreezes],
      [rule.streak, rule.freezeUsed ? freezes - 1 : freezes]);
  }
}

/* ── (e) D2: a part must roll yesterday's lesson count over, never carry it ──────────────────── */
{
  const stale = stateAt({ lastActiveDay: D.yesterday, lessonsToday: 2, minutesToday: 17 });
  const next = credit(stale, { id: 'c:1', kind: 'learn', share: 10, minutes: 4 });
  eq('(e) a part on a new day clears the stale lesson count', next.state.lessonsToday, 0);
  eq('(e) and the stale minutes with it', next.state.minutesToday, 4);
  const sameDay = credit(stateAt({ lastActiveDay: D.today, lessonsToday: 1, minutesToday: 6 }), { id: 'c:1', kind: 'learn', share: 10, minutes: 4 });
  eq('(e) a part later the same day leaves the count alone and adds its minutes', [sameDay.state.lessonsToday, sameDay.state.minutesToday], [1, 10]);
}

/* ── (f) a lesson started before parts existed is adopted free, and still pays in full ───────── */
{
  // what `adoptLegacySegments` writes: the parts the old pointer had passed, and nothing paid
  const adopted = readSegmentRecord({ done: ['learn', 'nonsense', 'learn'], xpPaid: 0, minutesPaid: 0 });
  eq('(f) adoption keeps only real kinds, once each, and pays nothing', adopted, { done: ['learn'], xpPaid: 0, minutesPaid: 0 });
  eq('(f) so the rest of the lesson still owes the whole 40 xp', lessonXpRemainder(adopted, 40), 40);

  let state = stateAt({ lessonSegments: { 'c:1': adopted } });
  const relearn = credit(state, { id: 'c:1', kind: 'learn', share: 15, minutes: 5 });
  eq('(f) and an adopted part cannot be re-credited by replaying it', [relearn.result.credited, relearn.xpApplied], [false, 0]);
  const vocab = credit(state, { id: 'c:1', kind: 'vocab', share: 5, minutes: 2 });
  const total = vocab.xpApplied + lessonXpRemainder(readSegmentRecord(vocab.state.lessonSegments['c:1']), 40);
  eq('(f) the adopted lesson pays 40 in total, not 25 and not 55', total, 40);

  // a malformed or missing record degrades to "nothing done" rather than throwing mid-render
  eq('(f) a missing record reads as nothing done', readSegmentRecord(undefined), { done: [], xpPaid: 0, minutesPaid: 0 });
  eq('(f) a corrupt record reads as nothing done', readSegmentRecord({ done: 'learn', xpPaid: 'lots' }), { done: [], xpPaid: 0, minutesPaid: 0 });
}

/* ── (g) one lesson can never credit more than 30 minutes, however it is split ───────────────── */
{
  let state = stateAt({ profile: { dailyMinutes: 10 } });
  let step = credit(state, { id: 'c:1', kind: 'learn', share: 10, minutes: 20 });
  state = step.state;
  step = credit(state, { id: 'c:1', kind: 'vocab', share: 5, minutes: 20 });
  state = step.state;
  const record = readSegmentRecord(state.lessonSegments['c:1']);
  const spentOnParts = record.minutesPaid;
  const last = finalMinutes(record, 20);
  eq('(g) the parts credit 20 then 10, not 20 then 20', spentOnParts, MAX_MINUTES_PER_LESSON);
  eq('(g) so the finish credits 0 more', last, 0);
  eq('(g) and the lesson totals the 30 minute ceiling exactly', spentOnParts + last, MAX_MINUTES_PER_LESSON);
  eq('(g) a part with no measured time credits no minutes, unlike a whole lesson',
    credit(stateAt(), { id: 'c:2', kind: 'learn', share: 10, minutes: 0 }).state.minutesToday, 0);

  // the +50 goal bonus crosses once a day, whichever part happens to cross it
  const goal = stateAt({ profile: { dailyMinutes: 10 } });
  const a = credit(goal, { id: 'c:3', kind: 'learn', share: 10, minutes: 6 });
  const b = credit(a.state, { id: 'c:3', kind: 'vocab', share: 5, minutes: 6 });
  const c = credit(b.state, { id: 'c:3', kind: 'practice', share: 15, minutes: 6 });
  eq('(g) the part that crosses the daily goal pays the bonus', [a.xpApplied, b.xpApplied, c.xpApplied], [10, 5 + XP_DAILY_GOAL, 15]);
  eq('(g) Double XP doubles a part, share and bonus together',
    credit(stateAt({ profile: { dailyMinutes: 10 } }), { id: 'c:4', kind: 'learn', share: 10, minutes: 12, mult: 2 }).xpApplied,
    (10 + XP_DAILY_GOAL) * 2);

  /*
   * WHAT THE CARD ANNOUNCES IS NOT THE WHOLE WALLET MOVEMENT. `xpApplied` above is everything the
   * credit moved; `result.xp` is the part's own award, and it is the number the part card prints.
   *
   * These were one value until 22 Sep 2026, and the simulator showed why they cannot be. Finishing
   * Learn on investing-fundamentals:2 (30 XP, shares 10/5/15) with `minutesToday` at 9 of a 10
   * minute goal drew "+60 XP" on the part card — twice what the whole lesson pays — and the same
   * run then offered "Collect +15 XP" on the finish screen. Design 3a puts the ceiling the other
   * way round ("the largest share a part card ever shows is 25"), which is what keeps a part from
   * reading as the payout beat, and the finish screen has never shown the goal bonus either.
   */
  eq('(g) the part that crosses the goal still ANNOUNCES only its own share',
    [a.result.xp, b.result.xp, c.result.xp], [10, 5, 15]);
  eq('(g) Double XP is part of the award, so the card doubles with it and still omits the bonus',
    credit(stateAt({ profile: { dailyMinutes: 10 } }), { id: 'c:5', kind: 'learn', share: 10, minutes: 12, mult: 2 }).result.xp,
    20);
}

/* ── the wiring, because a pure helper nothing calls protects nothing ─────────────────────────── */
{
  const strip = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  const store = strip(readFileSync(new URL('../src/lib/store.ts', import.meta.url), 'utf8'));
  const analytics = readFileSync(new URL('../src/lib/analytics.ts', import.meta.url), 'utf8');

  const has = (name, re, why) => check(name, re.test(store), why);

  has('store: the part reducer merges the helper patch, stamps the trial day and funnels XP through applyXp',
    /return \{ \.\.\.patch, activeDays: withToday\(s\.activeDays\), \.\.\.applyXp\(s, xpToApply\) \};/,
    'completeLessonSegment no longer merges creditSegment\'s patch the way the model above assumes, '
    + 'or it applies XP without applyXp, which makes lifetime and weekly totals diverge');
  has('store: completeLesson pays the REMAINDER, not the lesson xp again',
    /\.\.\.applyXp\(s, \(lessonXpRemainder\(seg, xp\) \+ bonus\) \* mult\)/,
    'the final screen is paying the full lesson xp on top of what the parts already paid');
  has('store: completeLesson caps its minutes by what the parts already credited',
    /lessonMinutesRemaining\(seg\)/,
    'a three part lesson can credit 30 minutes per part against a ten minute daily goal');
  /*
   * THE WHOLE-LESSON CLAMP, ASSERTED HERE BECAUSE MOVING THE CONSTANTS SILENTLY KILLED THE PIN
   * THAT HELD IT.
   *
   * `goal-minutes-pin.mjs:37` matches /MAX_MINUTES_PER_LESSON,[\s\S]{0,160}MIN_MINUTES_PER_LESSON/
   * against comment-stripped store.ts. Until this build those two identifiers appeared in exactly
   * one place, the clamp inside `completeLesson`, so that regex stood for the clamp. Moving them
   * into `lesson-segment-credit.ts` put them a second time into the import that pulls them back,
   * adjacent and in that order, which satisfies the regex on its own. Measured, not reasoned:
   * with the clamp deleted outright from `completeLesson`, `goal-minutes-pin` still printed PASS.
   * A pin that cannot fail is worse than no pin, because it is counted as coverage.
   *
   * So the clamp is matched here as one expression, floor and ceiling and per-lesson remainder
   * together. The floor is what pays a genuinely fast completion; the ceiling is what stops a
   * lesson left open in a pocket from swallowing a ten minute goal. Neither failure throws and
   * neither shows on screen.
   */
  has('store: the whole-lesson minute clamp is still a clamp (goal-minutes-pin can no longer tell)',
    /Math\.min\(\s*MAX_MINUTES_PER_LESSON,\s*Math\.max\(MIN_MINUTES_PER_LESSON, Math\.round\(minutesSpent \?\? MINUTES_PER_LESSON\)\),\s*lessonMinutesRemaining\(seg\),\s*\)/,
    'completeLesson no longer clamps its credited minutes between the one minute floor and the '
    + 'thirty minute ceiling. goal-minutes-pin cannot catch this any more: its clamp assertion now '
    + 'matches the import of those two constants instead of the clamp');
  /*
   * AND THE NUMBERS THEMSELVES, ONCE. Every other assertion in this file is symbolic, so a sync
   * that set the ceiling to 300 would leave the whole suite green while one lesson swallowed ten
   * days of the daily goal. The two payers now share these constants, which is exactly when a
   * silent change to one of them reaches twice as far.
   */
  check('the shared minute bounds are still one minute and thirty',
    MIN_MINUTES_PER_LESSON === 1 && MAX_MINUTES_PER_LESSON === 30,
    `floor ${MIN_MINUTES_PER_LESSON}, ceiling ${MAX_MINUTES_PER_LESSON}: the bounds both the part `
    + 'path and completeLesson clamp to have changed, and every other assertion here is symbolic');
  has('store: completeLesson reads the record before paying',
    /const seg = readSegmentRecord\(s\.lessonSegments\[id\]\);/,
    'completeLesson has stopped reading what the parts paid');
  has('store: completing a lesson drops its record',
    /lessonSegments: withoutSegmentRecord\(s\.lessonSegments, id\)/,
    'the map keeps an entry for every finished lesson and grows for the life of the install');
  has('store: the finished lesson still counts ONE lesson for the quest',
    /lessonsToday: \(s\.lastActiveDay === today \? s\.lessonsToday : 0\) \+ 1/,
    'completeLesson no longer counts the lesson, or a part started counting itself as one');
  // Both paths now call resolveDay (streak safety net) from the same state; the part path passes
  // isLesson: false, the finish isLesson: true.
  has('store: completeLesson passes the same streak inputs to resolveDay as the part path',
    /resolveDay\(\{\s*streak: s\.streak,\s*lastActiveDay: s\.lastActiveDay,\s*today,\s*yesterday: prevDayKey\(\),\s*dayBefore: dayBeforeKey\(\),\s*freezes: s\.streakFreezes,\s*repair: s\.streakRepair,\s*milestoneRun: s\.freezeMilestoneRun,\s*now: Date\.now\(\),\s*isLesson: true,\s*\}\)/,
    'the two streak paths no longer resolve from the same state, so a part and a finish can disagree');
  has('store: part progress survives a restart',
    /lessonSegments: s\.lessonSegments/,
    'lessonSegments is missing from partialize — store.ts:10 warns this fails SILENTLY on restart, '
    + 'and every part would be payable again after a force quit');
  check('store: reset() and deleteProfile() both clear part progress',
    (store.match(/lessonSegments: \{\}/g) ?? []).length >= 3,
    'a reset profile keeps its part records, so parts of lessons it no longer remembers stay unpayable');
  has('store: a finished lesson answers every kind without a record',
    /\.\.\.ALL_SEGMENT_KINDS/,
    'segmentsDoneFor no longer short-circuits on completedLessons, so every lesson finished before '
    + 'parts existed would show as not started');
  has('store: adoption refuses a lesson that already has a record',
    /if \(s\.lessonSegments\[id\]\) return s;/,
    'a second adoption resets xpPaid to 0 after parts were genuinely paid, which pays them twice');
  has('store: adoption refuses a finished lesson',
    /if \(s\.completedLessons\.includes\(id\)\) return s;/,
    'a finished lesson can be given a part record, which completeLesson would then subtract from');

  check('analytics: the part event exists, so part to part drop-off is measurable',
    /lessonPartCompleted: 'lesson_part_completed'/.test(analytics),
    'there is no way to tell whether splitting lessons into parts improved completion');
}

if (fail.length) {
  console.error('\n' + fail.map((f) => `  ${f}`).join('\n') + '\n');
  process.exit(1);
}
console.log('\nPASS — parts and the finish pay exactly one lesson, a part pays once, one day is one '
  + 'streak day, and a lesson cannot credit more than 30 minutes.\n');
