/**
 * P5 — the two surfaces that show lesson parts outside the runner: the Learn trail and the Home
 * hero, plus the one-shot handoff between them.
 *
 * Splitting a lesson into parts moves state that used to live in exactly one boolean
 * (`completedLessons`) into two places. Every defect this pin exists for is the same shape: a
 * surface that keeps reading the old boolean, or reads the new record and then announces it as if
 * it were the old one. Four of them, each pinned against the exact line it would break.
 *
 * Run: node --import ./scripts/ts-resolve-hooks.mjs scripts/segment-surfaces-pin.mjs
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { readSegmentRecord, segmentEntry, segmentsOf } from '../src/lib/lesson-segments.ts';

const read = (rel) => readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');
const home = read('src/app/(tabs)/home.tsx');
const learn = read('src/app/(tabs)/learn.tsx');
const handoff = read('src/lib/lesson-trail-celebration.ts');

/* ------------------------------------------------------------------ *
 * 1. Home's Continue verb must read part progress, not only the pointer.
 * ------------------------------------------------------------------ */

/*
 * `lessonResume` is ONE pointer for the whole app, so opening any other lesson overwrites it.
 * Before parts that made the hero say "Start" to someone nine screens into lesson 1, which the
 * runner then quietly contradicted by restoring their place. With parts the same line starts
 * denying banked XP: a learner who finished Learn, took the part card's XP and tapped "Done for
 * now" is told to Start a lesson the store will refuse to pay for a second time.
 *
 * The break test for this pin is reverting the line to its pointer-only form.
 */
const resumingLine = /const resuming = [^;]*;/.exec(home);
assert.ok(resumingLine, 'home.tsx must still derive `resuming` for the hero verb');
assert.ok(
  resumingLine[0].includes('segmentsDone.length > 0'),
  'home `resuming` must count finished parts, not only the single-slot lessonResume pointer: '
    + `found ${resumingLine[0]}`,
);
assert.ok(
  resumingLine[0].includes('resumeKey === lessonKey(activeCourseId, next.num)'),
  'home `resuming` must KEEP the pointer test. Parts are the second way to be mid-lesson, not a '
    + 'replacement: a learner part way through Learn itself has a pointer and no finished part.',
);
assert.ok(
  home.includes("const heroVerb = doneInCourse === 0 && !resuming ? 'Start' : 'Continue';"),
  'the hero verb line must stay verbatim — widening `resuming` is the whole fix, and rewriting '
    + 'the verb instead would leave the accessibility label and the card disagreeing',
);

/*
 * Both surfaces must resolve a persisted record through the ONE validator. A raw
 * `record.done.length` treats an unknown kind written by a newer build, or a duplicate, as real
 * progress, and the two screens would then disagree about how far along the same lesson is.
 * §6.3: never resolve the same thing in two places.
 */
for (const [name, source] of [['home.tsx', home], ['learn.tsx', learn]]) {
  assert.ok(
    source.includes('readSegmentRecord('),
    `${name} must read persisted part records through readSegmentRecord, never a raw .done`,
  );
  assert.ok(
    /useApp\(\(s\) => s\.lessonSegments\)/.test(source),
    `${name} must SUBSCRIBE to the lessonSegments record. Selecting the store's segmentsDoneFor `
      + 'getter alone freezes the surface at mount, because zustand compares the selector result '
      + 'and the getter identity never changes.',
  );
}

/*
 * Both surfaces must name the next part the way the RUNNER opens it: `segmentEntry` takes the
 * first kind NOT in `done`. Counting `done.length` instead agrees with that only while the shape
 * holds still, and the shape is the one thing the kind-keyed record exists to survive (design 2b).
 * After a sync drops a lesson's keyTermsCards, `done` = ['learn','vocab'] against a two-part
 * lesson counts 2 of 2: Home paints a FULL ring and drops the part line, Learn's label reads
 * "Part 3 of 2 next", and the runner meanwhile opens practice.
 */
for (const [name, source] of [['home.tsx', home], ['learn.tsx', learn]]) {
  assert.ok(
    /\.findIndex\(\(kind\) => !\w+\.includes\(kind\)\)/.test(source),
    `${name} must resolve the NEXT part as the first kind not in done, the way segmentEntry does, `
      + 'never as done.length',
  );
  assert.ok(
    /\.filter\(\(kind\) => \w+\.includes\(kind\)\)\.length/.test(source),
    `${name} must count filled arcs by intersecting the persisted kinds with the LIVE shape; `
      + 'done.length can exceed the shape after a curriculum sync and overfill the ring',
  );
  assert.ok(
    !/filled=\{\w*[Ss]egmentsDone\.length\}|filled=\{\w*[Dd]one\.length\}/.test(source),
    `${name} must not hand the ring a raw done.length as its filled-arc count`,
  );
}

/*
 * THE HERO RING'S UNFILLED ARCS CANNOT BE A THEME TOKEN.
 *
 * The hero block is the course colour in BOTH themes, so a token that flips with the app theme
 * decides the ring's legibility on a background that did not change. `theme.border` measured
 * 1.27:1 against the white filled arcs in the light palette: a one-of-three ring rendered as a
 * solid white ring, telling every light theme learner the lesson was finished. The trail's ring
 * sits on the app background and is fine on `theme.border`; this one is not, and the two call
 * sites are what make that easy to miss.
 */
const heroRing = /<SegmentRing[\s\S]{0,600}?\/>/.exec(home);
assert.ok(heroRing, 'home.tsx must still draw the hero part ring');
assert.ok(
  !/track=\{theme\./.test(heroRing[0]),
  'the hero ring track must not be a theme token: the block under it is the course colour in '
    + 'both themes, and theme.border measures 1.27:1 against the white filled arcs in light',
);
assert.ok(
  /track=\{HERO_RING_TRACK\}/.test(heroRing[0]) && /const HERO_RING_TRACK = 'rgba\(255,255,255,0\.[0-9]+\)';/.test(home),
  'the hero ring track must be the measured translucent white constant',
);

/* ------------------------------------------------------------------ *
 * 2. Learn's progression rule is untouched.
 * ------------------------------------------------------------------ */

/*
 * THE TRAIL DERIVES ONE LESSON'S SHAPE, NOT TWENTY-FIVE.
 *
 * `lesson.steps` is a getter: withMobileDecks (curriculum/index.ts) runs mobileSteps on first
 * touch. scripts/lazy-deck-pin.mjs exists because deriving every lesson's deck cost about 65ms
 * for a course nobody had opened, and it probes the LOADER, so a loop in a render slips past it.
 * Measured at 88.8 / 60.4 / 75.4ms for investing-fundamentals, personal-finance and
 * financial-analytics under --no-opt --no-sparkplug --no-maglev, paid again on every course
 * switch, for a ring that appears on exactly one node.
 */
assert.ok(
  !/for \(const lesson of lessons\)[\s\S]{0,400}expandSteps\(lesson\.steps\)/.test(learn),
  'the trail must not expand every lesson\'s steps: that re-derives all 25 mobile decks on the '
    + 'render thread, which is the cost lazy-deck-pin was written to remove',
);
assert.equal(
  (learn.match(/expandSteps\(/g) ?? []).length,
  1,
  'exactly one expandSteps call on the trail, for the current lesson only',
);

/*
 * The trail's current node, start.tsx's first action and Home's hero all resolve to the first
 * lesson not in `completedLessons`. A part credit deliberately does not write that list
 * (design 3b), so a half-finished lesson is still `current` and the next node is still locked.
 * If parts ever moved this line, finishing Learn would unlock lesson 2.
 */
assert.ok(
  learn.includes('const current = doneFlags.indexOf(false);'),
  'the current node must stay the first lesson not in completedLessons; a part must not unlock '
    + 'the next node',
);
assert.ok(
  learn.includes('completedLessons.includes(lessonKey(trailCourseId, l.num))'),
  'doneFlags must keep reading completedLessons, so a check mark still means every part is done',
);

/* ------------------------------------------------------------------ *
 * 3. The part ring is never drawn on a finished node.
 * ------------------------------------------------------------------ */

/*
 * A done pod already carries a check. A ring reading 3 of 3 beside it states the same fact twice
 * (design rule 1) and, worse, invites a tap on a lesson whose parts pay nothing.
 *
 * Asserted twice, because either half alone is escapable. The text assertion fixes the gate; the
 * simulation below proves the gate is sufficient, by showing `active` and `done` can never both
 * hold for the same node whatever the learner's history looks like.
 */
assert.ok(
  learn.includes('const showRing = active && kinds.length > 1;'),
  'the part ring must be gated on the ACTIVE node and on a lesson that really has 2 or 3 parts',
);
const ringMount = /\{showRing && \(/.test(learn);
assert.ok(ringMount, 'the ring must mount behind the `showRing` gate and nothing else');
assert.equal(
  (learn.match(/<SegmentRing/g) ?? []).length,
  1,
  'exactly one SegmentRing on the trail: a second mount is how a done or locked pod grows one',
);

for (const flags of [
  [],
  [false],
  [true],
  [true, true, true],
  [true, false, false],
  [false, true, true],
  [true, true, false, false],
]) {
  const current = flags.indexOf(false);
  flags.forEach((done, i) => {
    const active = i === current;
    const locked = current >= 0 && i > current;
    assert.ok(!(active && done), `node ${String(i)} of [${String(flags)}] is both active and done`);
    assert.ok(!(active && locked), `node ${String(i)} of [${String(flags)}] is both active and locked`);
  });
}

/* ------------------------------------------------------------------ *
 * 4. A part must not fire the whole-lesson trail reactions.
 * ------------------------------------------------------------------ */

/*
 * The node "earned" bounce and the drawn connector both mean THIS LESSON IS DONE AND THE NEXT ONE
 * IS OPEN. After Learn the next node is still locked, so firing them draws a line to a pod the
 * learner cannot press and bounces a node that did not change state. Every `earned` in learn.tsx
 * must therefore require the handoff to carry no segment.
 */
const earnedAssignments = learn.match(/const earned = [\s\S]*?;/g) ?? [];
assert.ok(earnedAssignments.length >= 2, 'both the connector and the node must derive `earned`');
for (const assignment of earnedAssignments) {
  assert.ok(
    assignment.includes('celebrating?.segment === undefined'),
    'an `earned` reaction fired without checking that the handoff carries no segment:\n'
      + assignment,
  );
}
assert.ok(
  !/<EarnedConnector[\s\S]{0,400}segment/.test(learn),
  'the connector must not be handed a segment; it is a whole-lesson reaction',
);

/*
 * The handoff itself. `segment` has to be OPTIONAL rather than a second required argument,
 * because lesson.tsx's whole-lesson call site is pinned text elsewhere and must keep compiling
 * unchanged, and because the absent case is what the two reactions above test for.
 */
assert.ok(
  handoff.includes('queueLessonTrailCelebration(lessonId: string, opts?: { segment?: SegmentKind })'),
  'the trail handoff must take the segment as an OPTIONAL second argument, so the existing '
    + 'whole-lesson call site keeps compiling and an absent segment still means a full lesson',
);
assert.ok(
  /takeLessonTrailCelebration\(\): LessonTrailCelebration \| null/.test(handoff),
  'the handoff must return the whole celebration, so the trail can tell a part from a lesson',
);
assert.ok(
  !/^\s*(?!.*\/\/).*(AsyncStorage|persist)/m.test(handoff),
  'the handoff must stay session-only; persisting it replays an old celebration after a cold launch',
);
assert.ok(
  learn.includes('const celebration = takeLessonTrailCelebration();'),
  'the trail must still consume the handoff exactly once, on focus',
);

/* ------------------------------------------------------------------ *
 * 5. The surfaces and the runner must name the SAME next part.
 * ------------------------------------------------------------------ */

/*
 * The text assertions above fix the shape of the rule; this runs it. Both surfaces derive the
 * next part as `kinds.findIndex((k) => !done.includes(k))` and the filled count as
 * `kinds.filter((k) => done.includes(k)).length`. `segmentEntry` is what the runner actually
 * opens with. If those two ever disagree, Home says "Part 2 of 3, Vocab" and the tap lands on
 * practice, which is worse than saying nothing: the hero is the promise the runner has to keep.
 *
 * The interesting rows are the ones where a curriculum sync moved the split under a record that
 * was written against the old shape. That is the case the kind-keyed record exists for, and the
 * case a `done.length` index gets wrong.
 */
const LEARN_VOCAB_PRACTICE = ['hookOpener', 'concept', 'keyTermsCards', 'fillBlank', 'quiz'];
const LEARN_PRACTICE = ['hookOpener', 'concept', 'fillBlank', 'quiz'];
for (const [label, types, hasChallenge, rawDone] of [
  ['fresh 3-part', LEARN_VOCAB_PRACTICE, false, []],
  ['3-part, learn banked', LEARN_VOCAB_PRACTICE, false, ['learn']],
  ['3-part, learn + vocab banked', LEARN_VOCAB_PRACTICE, false, ['learn', 'vocab']],
  ['2-part, learn banked', LEARN_PRACTICE, true, ['learn']],
  // The sync cases: the record was written when the lesson still had its vocab screen.
  ['vocab REMOVED under a banked learn', LEARN_PRACTICE, false, ['learn']],
  ['vocab REMOVED under a banked learn + vocab', LEARN_PRACTICE, false, ['learn', 'vocab']],
  // Untrusted persisted input, the shapes readSegmentRecord is there to absorb.
  ['garbage kinds', LEARN_VOCAB_PRACTICE, false, ['learn', 'learn', 'warmup', 7]],
  ['out of order, vocab skipped', LEARN_VOCAB_PRACTICE, false, ['learn', 'practice']],
]) {
  const segs = segmentsOf(types, hasChallenge);
  const kinds = segs.map((s) => s.kind);
  const done = readSegmentRecord({ done: rawDone }).done;

  // The two derivations both surfaces now use, verbatim.
  const filled = kinds.filter((kind) => done.includes(kind)).length;
  const nextIndex = kinds.findIndex((kind) => !done.includes(kind));

  // No pointer: the surfaces have none, and a pointer only ever moves the SCREEN inside the
  // segment segmentEntry already picked, never the segment itself.
  const runner = segmentEntry(segs, done, 0);
  assert.equal(
    nextIndex < 0 ? kinds.length - 1 : nextIndex,
    runner.segment,
    `${label}: the surfaces would announce part ${String((nextIndex < 0 ? kinds.length - 1 : nextIndex) + 1)} `
      + `but the runner opens part ${String(runner.segment + 1)}`,
  );
  /*
   * A FULL RING ON A LESSON NOBODY FINISHED IS THE HEADLINE BUG, and it is what counting gets
   * wrong. Every row here is an UNFINISHED lesson, because that is the only kind either surface
   * draws: `completeLesson` deletes the record, Home's `next` is by construction the first lesson
   * not in `completedLessons`, and the trail's ring is gated on `current`, which is the same
   * lesson. So the ring must always have an empty arc left. `done.length` against a lesson that
   * lost its vocab to a sync reads 2 of 2 and paints the whole ring.
   */
  assert.ok(
    filled < kinds.length,
    `${label}: ${String(filled)} of ${String(kinds.length)} arcs filled on a lesson that is not `
      + 'finished. Count the kinds the lesson ACTUALLY has, not how many were banked',
  );
}

console.log(
  `segment-surfaces-pin ok — home Continue reads parts, current node unchanged, `
    + `${String((learn.match(/<SegmentRing/g) ?? []).length)} trail ring gated on active, `
    + `${String(earnedAssignments.length)} earned reactions guarded against parts`,
);
