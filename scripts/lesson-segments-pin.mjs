#!/usr/bin/env node
/**
 * The Learn / Vocab / Practice split, against the REAL corpus, all 300 lessons.
 *
 * WHAT IS ACTUALLY AT RISK HERE. `src/lib/lesson-segments.ts` decides where a lesson breaks, and
 * everything downstream is keyed off that answer: the part card, the XP share, the per-part
 * progress bar, the resume entry point and the per-kind completion record the store persists. A
 * split that quietly moves is not a cosmetic change. It renames the part someone already finished,
 * which is how a learner gets asked to redo Learn, or gets paid for Vocab twice.
 *
 * And it CAN move without anyone touching this file. `src/lib/curriculum/**` is regenerated
 * wholesale by scripts/sync-curriculum.sh, loadCourseLessons filters retired step types at load,
 * and the native loader swaps every teachingSlide and interactiveGraph for a mobileDeck. Adding
 * one keyTermsCards to a lesson turns a two part lesson into a three part lesson and changes what
 * every share pays. So the shapes are counted here rather than assumed, and the count is pinned so
 * that sync shows up as a failure in `npm run check` instead of as a support message.
 *
 * Reads the NATIVE shape (`src/lib/curriculum/index.ts`), not the web shape, because the split
 * runs on the same runtime steps `lesson.tsx` walks. Checking the web shape would be checking a
 * lesson the runner never sees, which is the trap lesson-resume-corpus-regression.mjs documents.
 *
 * `--selftest` runs every detector below against deliberately wrong segment lists and fails if one
 * of them stays quiet. A detector that cannot go red is not a check (CONSTITUTION 1.5).
 */
import assert from 'node:assert/strict';

import { COURSES, loadCourseLessons } from '../src/lib/curriculum/index.ts';
import { expandSteps } from '../src/lib/lesson-steps.ts';
import { hasMasteryChallenge } from '../src/lib/mastery-challenge-model.ts';
import {
  isSegmentBoundary,
  legacyDoneKinds,
  readSegmentRecord,
  segmentEndingAt,
  segmentEntry,
  segmentIndexAt,
  segmentXpShares,
  segmentedProgress,
  segmentsOf,
} from '../src/lib/lesson-segments.ts';

const sizeOf = (s) => Math.max(0, s.last - s.first + 1);

/*
 * The owner's XP split, Learn 2 : Vocab 1 : Practice 3, written out as the number on every part
 * card for every XP value the corpus uses. Design section 3a.
 *
 * THIS LIVES OUTSIDE `selftest()` ON PURPOSE, and both lanes assert it. The corpus lane alone
 * cannot see a weight change: with 2/1/4 instead of 2/1/3 every share in the app moves, the
 * shares still sum to the lesson XP, the smallest is still 5 and the largest non-final is still
 * under 30, so every corpus assertion below stays green and the run exits 0. Measured, not
 * argued: that edit was applied and the corpus lane printed `ok` (`part payouts 5..20 XP`) while
 * `--selftest` exited 1. A check that is green on a change to the owner's decision is the shape
 * CONSTITUTION 1.5 is about, so the weights are pinned in whichever lane runs.
 *
 * The corpus lane also pins that these two shapes are the only two that exist, so this table plus
 * that assertion fixes the payout of all 300 lessons.
 */
const XP_SHARE_TABLE = {
  25: [[10, 5, 10], [10, 15]],
  30: [[10, 5, 15], [10, 20]],
  35: [[10, 5, 20], [15, 20]],
  40: [[15, 5, 20], [15, 25]],
  45: [[15, 10, 20], [20, 25]],
  50: [[15, 10, 25], [20, 30]],
  55: [[20, 10, 25], [20, 35]],
  60: [[20, 10, 30], [25, 35]],
};

/**
 * The XP table and the floor, asserted value by value.
 *
 * These are the numbers that end up on the part card, and the sum is what the final part's
 * `xp - xpPaid` depends on: a table that summed low would silently delete XP from every lesson in
 * the app, and one that summed high would pay it twice.
 */
function assertXpShareTable() {
  for (const [xp, [three, two]] of Object.entries(XP_SHARE_TABLE)) {
    assert.deepEqual(segmentXpShares(Number(xp), ['learn', 'vocab', 'practice']), three, `three part shares for ${xp} XP`);
    assert.deepEqual(segmentXpShares(Number(xp), ['learn', 'practice']), two, `two part shares for ${xp} XP`);
  }
  // A lesson worth less than its floors must not drive the final share negative, because
  // `Math.max(0, xp - xpPaid)` would then pay the last part nothing at all. Nothing in the corpus
  // reaches this, so the corpus lane cannot see the floor either: dropping `Math.max(5, ...)` was
  // applied and the corpus lane still exited 0. This is the only lane that holds the floor.
  assert.deepEqual(segmentXpShares(8, ['learn', 'vocab', 'practice']), [5, 3, 0]);
  assert.deepEqual(segmentXpShares(0, ['learn', 'practice']), [0, 0]);
  assert.deepEqual(segmentXpShares(Number.NaN, ['learn', 'practice']), [0, 0]);
}

/**
 * Every way one lesson's split can be wrong, as a list of strings.
 *
 * `segs` is passed in rather than computed, so the selftest can hand this a broken split and watch
 * each detector complain. That is the only way to know the detectors work.
 */
function findingsFor(key, { types, hasChallenge, xp }, segs) {
  const out = [];
  const total = types.length;
  const kinds = segs.map((s) => s.kind);

  // 1. Shape. Two or three parts, always in this order, and Learn always has something in it.
  if (segs.length < 2 || segs.length > 3) {
    out.push(`${key}: split into ${String(segs.length)} parts, expected 2 or 3`);
  }
  // Stop here rather than indexing segs[1] below. Dropping the challenge-only practice leaves
  // 15 lessons with a single part, and a pin that dies on a TypeError names the crash instead of
  // naming the lesson that lost a part.
  if (segs.length < 2) return out;
  if (kinds[0] !== 'learn') out.push(`${key}: first part is ${String(kinds[0])}, not learn`);
  if (kinds[kinds.length - 1] !== 'practice') {
    out.push(`${key}: last part is ${String(kinds[kinds.length - 1])}, not practice`);
  }
  if (segs[0] && sizeOf(segs[0]) < 1) out.push(`${key}: learn has no screens`);
  if (new Set(kinds).size !== kinds.length) out.push(`${key}: the same kind appears twice`);

  // 2. Contiguity and coverage. Screens are never reordered and never lost. A challenge-only
  // practice satisfies this as an empty range at total+1..total, which is why it is written that
  // way rather than dropped.
  if (segs[0] && segs[0].first !== 1) out.push(`${key}: the split starts at screen ${String(segs[0].first)}, not 1`);
  for (let i = 1; i < segs.length; i += 1) {
    if (segs[i].first !== segs[i - 1].last + 1) {
      out.push(`${key}: a gap or overlap between ${kinds[i - 1]} and ${kinds[i]}`);
    }
  }
  const lastSeg = segs[segs.length - 1];
  if (lastSeg && lastSeg.last !== total) {
    out.push(`${key}: the split ends at screen ${String(lastSeg.last)}, the lesson has ${String(total)}`);
  }
  if (segs.reduce((sum, s) => sum + sizeOf(s), 0) !== total) {
    out.push(`${key}: the parts cover ${String(segs.reduce((sum, s) => sum + sizeOf(s), 0))} screens of ${String(total)}`);
  }

  // 3. The owner's rule itself: vocab is exactly the keyTermsCards screen, wherever it sits.
  const k = types.indexOf('keyTermsCards');
  const vocab = segs.find((s) => s.kind === 'vocab');
  if (k >= 0 && !vocab) out.push(`${key}: has a keyTermsCards screen and no vocab part`);
  if (k < 0 && vocab) out.push(`${key}: has a vocab part and no keyTermsCards screen`);
  if (vocab && (vocab.first !== k + 1 || vocab.last !== k + 1)) {
    out.push(`${key}: vocab is screens ${String(vocab.first)}..${String(vocab.last)}, keyTermsCards is screen ${String(k + 1)}`);
  }
  if (types.filter((t) => t === 'keyTermsCards').length > 1) {
    out.push(`${key}: two keyTermsCards screens, the split rule assumes one`);
  }

  // 4. An empty practice is only ever the mastery challenge standing in for one.
  const practice = segs.find((s) => s.kind === 'practice');
  if (practice && sizeOf(practice) === 0 && !hasChallenge) {
    out.push(`${key}: practice has no screens and no challenge, so it is an empty part`);
  }
  const flagged = segs.filter((s) => s.challenge).length;
  if (hasChallenge && (flagged !== 1 || !lastSeg.challenge)) {
    out.push(`${key}: the mastery challenge is not on the last part`);
  }
  if (!hasChallenge && flagged !== 0) out.push(`${key}: a part claims a challenge the lesson does not have`);

  // 5. XP. The shares must sum to the lesson's XP exactly, because the final part pays the
  // remainder: a split that summed low would delete XP from every lesson in the app.
  const shares = segmentXpShares(xp, kinds);
  if (shares.length !== segs.length) out.push(`${key}: ${String(shares.length)} shares for ${String(segs.length)} parts`);
  const paid = shares.reduce((a, b) => a + b, 0);
  if (paid !== xp) out.push(`${key}: the parts pay ${String(paid)} XP, the lesson is worth ${String(xp)}`);
  for (const share of shares) {
    if (share < 5) out.push(`${key}: a part pays ${String(share)} XP, below the floor of 5`);
  }

  // 6. The part card trigger fires once per non-final part and never on the final one, whose end
  // is the existing challenge / DONE / STREAK path.
  let boundaries = 0;
  for (let idx = 1; idx <= total; idx += 1) {
    const endK = segmentEndingAt(segs, idx);
    if (endK === null) continue;
    boundaries += 1;
    if (endK === segs.length - 1) out.push(`${key}: the part card would fire on the final part at screen ${String(idx)}`);
    if (segs[endK].last !== idx) out.push(`${key}: segmentEndingAt named the wrong part at screen ${String(idx)}`);
    if (!isSegmentBoundary(segs, idx)) out.push(`${key}: isSegmentBoundary disagrees with segmentEndingAt at screen ${String(idx)}`);
  }
  const expectedBoundaries = segs.filter((s, i) => i < segs.length - 1 && sizeOf(s) > 0).length;
  if (boundaries !== expectedBoundaries) {
    out.push(`${key}: ${String(boundaries)} part cards for ${String(segs.length)} parts`);
  }

  // 7. Every screen belongs to the part that contains it.
  for (let idx = 1; idx <= total; idx += 1) {
    const expected = segs.findIndex((s) => sizeOf(s) > 0 && idx >= s.first && idx <= s.last);
    if (segmentIndexAt(segs, idx) !== expected) {
      out.push(`${key}: screen ${String(idx)} reports part ${String(segmentIndexAt(segs, idx))}, it is in part ${String(expected)}`);
    }
  }
  if (segmentIndexAt(segs, 0) !== 0) out.push(`${key}: the warmup does not belong to the first part`);

  // 8. Opening the lesson. Four cases, all of them a real session.
  const fresh = segmentEntry(segs, [], 0);
  if (fresh.screen !== 0 || fresh.segment !== 0 || fresh.challengeIntro) {
    out.push(`${key}: a fresh open lands on screen ${String(fresh.screen)} instead of the warmup`);
  }
  if (sizeOf(segs[0]) >= 2) {
    const mid = segs[0].first + 1;
    const resumed = segmentEntry(segs, [], mid);
    if (resumed.screen !== mid || resumed.segment !== 0) {
      out.push(`${key}: a mid-part pointer at screen ${String(mid)} restored to ${String(resumed.screen)}`);
    }
  }
  // A pointer left inside a part that is now done must not reopen that part. It moves on.
  const afterFirst = segmentEntry(segs, [segs[0].kind], segs[0].last);
  if (afterFirst.segment !== 1) {
    out.push(`${key}: with ${segs[0].kind} done, the lesson reopened part ${String(afterFirst.segment)}`);
  }
  if (sizeOf(segs[1]) > 0 && (afterFirst.screen !== segs[1].first || afterFirst.challengeIntro)) {
    out.push(`${key}: with ${segs[0].kind} done, the lesson reopened on screen ${String(afterFirst.screen)} instead of ${String(segs[1].first)}`);
  }
  if (sizeOf(segs[1]) === 0 && !(afterFirst.challengeIntro && afterFirst.screen === total)) {
    out.push(`${key}: a challenge-only part did not reopen on the challenge intro`);
  }
  const last = segmentEntry(segs, kinds.slice(0, -1), 0);
  if (last.segment !== segs.length - 1) out.push(`${key}: with every earlier part done, the lesson did not open the last one`);
  if (sizeOf(lastSeg) === 0 && !last.challengeIntro) out.push(`${key}: a challenge-only practice did not open its intro`);

  // 9. The one-time backfill for someone already mid-lesson. It can never mark the final part
  // done, because that would skip the lesson's payout entirely.
  for (let idx = 1; idx <= total; idx += 1) {
    const adopted = legacyDoneKinds(segs, idx);
    const expected = segs.filter((s) => sizeOf(s) > 0 && s.last < idx).map((s) => s.kind);
    if (adopted.join(',') !== expected.join(',')) {
      out.push(`${key}: a legacy pointer at screen ${String(idx)} adopted ${adopted.join('+') || 'nothing'}, expected ${expected.join('+') || 'nothing'}`);
    }
    if (adopted.includes(kinds[kinds.length - 1])) {
      out.push(`${key}: a legacy pointer at screen ${String(idx)} marked the final part done`);
    }
  }

  // 10. The bar only ever moves forwards, and it is full only when the lesson is.
  let previous = -1;
  const walk = [];
  for (let idx = 0; idx <= total; idx += 1) walk.push(segmentedProgress(segs, idx, 'steps'));
  if (hasChallenge) walk.push(segmentedProgress(segs, total, 'challenge'));
  walk.push(segmentedProgress(segs, total, 'complete'));
  for (const fills of walk) {
    if (fills.length !== segs.length) out.push(`${key}: the bar drew ${String(fills.length)} parts of ${String(segs.length)}`);
    if (fills.some((f) => !(f >= 0 && f <= 1))) out.push(`${key}: a bar fill left 0..1`);
    const sum = fills.reduce((a, b) => a + b, 0);
    if (sum < previous - 1e-9) out.push(`${key}: the bar went backwards`);
    previous = sum;
  }
  const done = walk[walk.length - 1];
  if (done.some((f) => f !== 1)) out.push(`${key}: the bar is not full on a finished lesson`);
  if (hasChallenge) {
    const duringSteps = segmentedProgress(segs, total, 'steps');
    if (duringSteps[segs.length - 1] >= 1) out.push(`${key}: the bar filled before the mastery challenge ran`);
  }

  return out;
}

function selftest() {
  const threePart = {
    types: ['hookOpener', 'mobileDeck', 'keyTermsCards', 'quiz', 'fillBlank'],
    hasChallenge: true,
    xp: 45,
  };
  const good = segmentsOf(threePart.types, threePart.hasChallenge);
  const clean = findingsFor('x:1', threePart, good);
  if (clean.length) throw new Error(`selftest: a sound lesson was flagged: ${clean.join('; ')}`);

  const twoPart = { types: ['hookOpener', 'mobileDeck', 'quiz', 'match'], hasChallenge: false, xp: 30 };
  const cleanTwo = findingsFor('x:2', twoPart, segmentsOf(twoPart.types, twoPart.hasChallenge));
  if (cleanTwo.length) throw new Error(`selftest: a sound two part lesson was flagged: ${cleanTwo.join('; ')}`);

  const challengeOnly = { types: ['hookOpener', 'mobileDeck', 'keyTermsCards'], hasChallenge: true, xp: 40 };
  const cleanOnly = findingsFor('x:3', challengeOnly, segmentsOf(challengeOnly.types, challengeOnly.hasChallenge));
  if (cleanOnly.length) throw new Error(`selftest: a sound challenge-only lesson was flagged: ${cleanOnly.join('; ')}`);

  /*
   * Each entry breaks the split one way a real edit could break it, and names the phrase the
   * detector must produce. If a line here stops firing, the detector above has gone quiet and the
   * corpus run below is no longer checking anything.
   */
  const broken = [
    // The MAP lens's splitter: cut at the first practice step and let vocab fall into practice.
    ['cut at the first question instead of the vocab', threePart, [
      { kind: 'learn', first: 1, last: 2, challenge: false },
      { kind: 'practice', first: 3, last: 5, challenge: true },
    ], 'has a keyTermsCards screen and no vocab part'],
    ['a screen lost between two parts', threePart, [
      { kind: 'learn', first: 1, last: 2, challenge: false },
      { kind: 'vocab', first: 4, last: 4, challenge: false },
      { kind: 'practice', first: 5, last: 5, challenge: true },
    ], 'a gap or overlap'],
    ['the last part stops short of the lesson', threePart, [
      { kind: 'learn', first: 1, last: 2, challenge: false },
      { kind: 'vocab', first: 3, last: 3, challenge: false },
      { kind: 'practice', first: 4, last: 4, challenge: true },
    ], 'the lesson has 5'],
    ['an empty learn', threePart, [
      { kind: 'learn', first: 1, last: 0, challenge: false },
      { kind: 'vocab', first: 1, last: 3, challenge: false },
      { kind: 'practice', first: 4, last: 5, challenge: true },
    ], 'learn has no screens'],
    ['the challenge moved off the last part', threePart, [
      { kind: 'learn', first: 1, last: 2, challenge: true },
      { kind: 'vocab', first: 3, last: 3, challenge: false },
      { kind: 'practice', first: 4, last: 5, challenge: false },
    ], 'not on the last part'],
    // Dropping the challenge-only branch is the second break test in the design table.
    ['a practice dropped for having no screens', challengeOnly, [
      { kind: 'learn', first: 1, last: 2, challenge: false },
      { kind: 'vocab', first: 3, last: 3, challenge: true },
    ], 'last part is vocab, not practice'],
    ['four parts', threePart, [
      { kind: 'learn', first: 1, last: 1, challenge: false },
      { kind: 'learn', first: 2, last: 2, challenge: false },
      { kind: 'vocab', first: 3, last: 3, challenge: false },
      { kind: 'practice', first: 4, last: 5, challenge: true },
    ], 'split into 4 parts'],
  ];
  for (const [label, facts, segs, phrase] of broken) {
    const found = findingsFor('x:broken', facts, segs);
    if (!found.some((f) => f.includes(phrase))) {
      throw new Error(`selftest: ${label} slipped through, expected a finding containing "${phrase}", got: ${found.join('; ') || 'nothing'}`);
    }
  }

  assertXpShareTable();

  // Persisted state is untrusted. Every one of these is a record a force quit or an old build can
  // leave behind, and each must degrade to "nothing done" rather than throw in a render.
  assert.deepEqual(readSegmentRecord(undefined), { done: [], xpPaid: 0, minutesPaid: 0 });
  assert.deepEqual(readSegmentRecord(null), { done: [], xpPaid: 0, minutesPaid: 0 });
  assert.deepEqual(readSegmentRecord('learn'), { done: [], xpPaid: 0, minutesPaid: 0 });
  assert.deepEqual(readSegmentRecord({ done: ['learn', 'learn', 'sim', 7], xpPaid: '20', minutesPaid: -3 }), {
    done: ['learn'],
    xpPaid: 0,
    minutesPaid: 0,
  });
  assert.deepEqual(readSegmentRecord({ done: ['vocab', 'learn'], xpPaid: 15, minutesPaid: 2.5 }), {
    done: ['vocab', 'learn'],
    xpPaid: 15,
    minutesPaid: 2.5,
  });

  // An empty lesson cannot crash the runner, and cannot look finished either.
  assert.deepEqual(segmentsOf([], false), []);
  assert.deepEqual(segmentedProgress([], 0, 'steps'), []);
  assert.deepEqual(segmentEntry([], [], 0), { segment: 0, screen: 0, challengeIntro: false });
  assert.equal(segmentEndingAt(segmentsOf(['quiz'], false), 1), null, 'a single part lesson has no part card');

  console.log('[lesson-segments-pin] selftest ok, every lane can go red');
}

if (process.argv.includes('--selftest')) {
  selftest();
  process.exit(0);
}

const findings = [];
const shapes = new Map();
const challengeOnly = [];
const oneScreenPractice = [];
let lessons = 0;
let withChallenge = 0;
let maxNonFinalShare = 0;
let minShare = Infinity;
const learnSizes = [];
const practiceSizes = [];
const xpValues = new Set();

for (const course of COURSES) {
  for (const lesson of await loadCourseLessons(course.id)) {
    lessons += 1;
    const key = `${course.id}:${String(lesson.num)}`;
    const types = expandSteps(lesson.steps ?? []).map((s) => s?.type ?? '');
    const hasChallenge = hasMasteryChallenge(lesson.challenge);
    if (hasChallenge) withChallenge += 1;
    const segs = segmentsOf(types, hasChallenge);
    const facts = { types, hasChallenge, xp: lesson.xp };
    findings.push(...findingsFor(key, facts, segs));

    const shape = segs.map((s) => s.kind).join('+');
    shapes.set(shape, (shapes.get(shape) ?? 0) + 1);
    const practice = segs[segs.length - 1];
    if (sizeOf(practice) === 0) challengeOnly.push(key);
    if (sizeOf(practice) === 1) oneScreenPractice.push(key);
    learnSizes.push(sizeOf(segs[0]));
    practiceSizes.push(sizeOf(practice));

    xpValues.add(lesson.xp);
    const shares = segmentXpShares(lesson.xp, segs.map((s) => s.kind));
    for (let i = 0; i < shares.length; i += 1) {
      minShare = Math.min(minShare, shares[i]);
      if (i < shares.length - 1) maxNonFinalShare = Math.max(maxNonFinalShare, shares[i]);
    }
  }
}

if (findings.length) {
  for (const f of findings.slice(0, 20)) console.error(`[lesson-segments-pin] ${f}`);
  if (findings.length > 20) console.error(`[lesson-segments-pin] ...and ${String(findings.length - 20)} more`);
  process.exit(1);
}

assert.equal(lessons, 300, 'the corpus changed size; re-read this file before re-pinning it');
/*
 * MEASURED 22 Sep 2026, not chosen. 186 lessons carry a keyTermsCards screen and split three ways;
 * the other 114 split at their first non-reading step. If these move, a curriculum sync has
 * changed how lessons are shaped, and the XP shares, the part cards and every persisted
 * `done: ['learn']` record for an in-progress lesson change meaning with it. That is a change to
 * read, not a number to bump.
 */
assert.equal(shapes.get('learn+vocab+practice'), 186, 'the number of three part lessons moved');
assert.equal(shapes.get('learn+practice'), 114, 'the number of two part lessons moved');
assert.equal(shapes.size, 2, 'a new lesson shape appeared');
assert.equal(withChallenge, 295, 'the mastery challenge coverage moved; the challenge-only parts depend on it');

/*
 * The 16 lessons whose entire practice IS the mastery challenge, by name. A lesson that joins or
 * leaves this list has had content added or removed, and its learner sees a different second half.
 * Named rather than counted so the failure says which lesson.
 */
assert.deepEqual(
  challengeOnly.sort(),
  [
    'behavioral-finance:25',
    'corporate-finance:4',
    'financial-analytics:14',
    'financial-analytics:15',
    'financial-analytics:16',
    'financial-analytics:17',
    'financial-analytics:18',
    'financial-analytics:19',
    'financial-analytics:20',
    'financial-analytics:21',
    'financial-analytics:22',
    'financial-analytics:23',
    'financial-analytics:24',
    'financial-analytics:25',
    'global-economics:25',
    'risk-management:25',
  ],
  'the set of lessons whose practice is only the mastery challenge changed',
);
assert.deepEqual(
  oneScreenPractice.sort(),
  ['business-strategy:25', 'corporate-finance:10', 'corporate-finance:5', 'corporate-finance:9'],
  'the set of lessons with a one screen practice changed',
);

assert.ok(Math.min(...learnSizes) >= 3, 'a learn part dropped below 3 screens');
assert.equal(minShare, 5, 'the smallest part payout moved off the 5 XP floor');

/*
 * The owner's 2/1/3 weights, pinned in the lane that runs against the corpus as well as in
 * `--selftest`. See the note on XP_SHARE_TABLE: without this the weights are only held by the
 * selftest lane, and a build wired to run one lesson-segments-pin line instead of two would ship
 * a silent repricing of all 300 lessons.
 *
 * The XP set is asserted first so the table is known to cover every lesson. MEASURED 22 Sep 2026:
 * every lesson is worth 25 to 60 XP in steps of 5. A new value is not a number to add here. At
 * 70 XP the two part Learn share lands on exactly 30, which scripts/anim/drive.py:590 reads as a
 * finished lesson, so a new XP value needs the weights looked at, not the table extended.
 */
assert.deepEqual(
  [...xpValues].sort((a, b) => a - b),
  Object.keys(XP_SHARE_TABLE).map(Number),
  'the set of lesson XP values changed, so the pinned part payout table no longer covers the corpus',
);
assertXpShareTable();
/*
 * scripts/anim/drive.py:590 treats "+30 xp" on screen as the lesson-done signal. A part card is
 * not a finished lesson, so no non-final part may ever pay 30. The 2/1/3 weights keep the largest
 * at 25; flattening them to 1/1/1 puts +30 on the Learn part of a 60 XP two part lesson.
 */
assert.ok(maxNonFinalShare < 30, `a part pays ${String(maxNonFinalShare)} XP, which drive.py reads as a finished lesson`);

const median = (v) => [...v].sort((a, b) => a - b)[v.length >> 1];
console.log(
  `[lesson-segments-pin] ok: ${String(lessons)} lessons, 186 three part and 114 two part, ` +
    `learn ${String(Math.min(...learnSizes))}..${String(Math.max(...learnSizes))} (median ${String(median(learnSizes))}) screens, ` +
    `practice ${String(Math.min(...practiceSizes))}..${String(Math.max(...practiceSizes))} (median ${String(median(practiceSizes))}) screens, ` +
    `${String(challengeOnly.length)} challenge-only, part payouts ${String(minShare)}..${String(maxNonFinalShare)} XP`,
);
