#!/usr/bin/env node
/** Pure regression for Previous -> forward state restoration across every gated step family. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { COURSES, loadCourseLessons } from '../src/lib/curriculum/courseIndex.ts';
import { expandSteps, gates, normalizeStep } from '../src/lib/lesson-steps.ts';
import {
  createLessonStepSession,
  isLessonStepComplete,
  markLessonStepCompletion,
  readLessonStepSnapshot,
  writeLessonStepSnapshot,
} from '../src/lib/lesson-step-session.ts';

const session = createLessonStepSession();
const familySnapshots = {
  calc: { entries: ['72', '9'], checked: true },
  reveal: { revealed: [true, true, true] },
  match: { rightOrder: [2, 0, 1], selected: null, matched: [0, 1, 2] },
  dragSort: { index: 3, picked: null, score: 2, done: true },
  order: { order: [0, 1, 2], selected: null },
  line: { value: 72, checked: true },
  trueFalse: { index: 2, score: 2, phase: 'explanation', answeredIndex: 2, lastCorrect: true },
  build: { placed: ['Needs', 'Wants', 'Savings'] },
  tree: { current: 2, chosen: 1, allCorrect: false, done: true },
  vocab: { index: 5, picked: 2, score: 1 },
  progressiveCalc: { index: 2, score: 2, selected: null, revealed: 1, finished: false },
};

let stepIndex = 10;
for (const [family, snapshot] of Object.entries(familySnapshots)) {
  writeLessonStepSnapshot(session, stepIndex, `${family}.regression`, snapshot);
  assert.equal(markLessonStepCompletion(session, stepIndex, false), false, `${family} began completed`);
  assert.equal(markLessonStepCompletion(session, stepIndex, true), true, `${family} could not complete`);

  // Simulate leaving for the next screen, then returning through Previous.
  readLessonStepSnapshot(session, stepIndex + 1, 'other.screen', () => ({ touched: true }));
  let initializedAgain = false;
  const restored = readLessonStepSnapshot(session, stepIndex, `${family}.regression`, () => {
    initializedAgain = true;
    return {};
  });
  assert.deepEqual(restored, snapshot, `${family} state did not survive Previous -> forward`);
  assert.equal(initializedAgain, false, `${family} reran its initializer on remount`);
  assert.equal(markLessonStepCompletion(session, stepIndex, false), true, `${family} completion regressed on remount`);
  assert.equal(isLessonStepComplete(session, stepIndex), true, `${family} lost monotonic completion`);
  stepIndex += 2;
}

assert.notDeepEqual(
  readLessonStepSnapshot(session, 999, 'trueFalse.regression', () => ({ index: 0 })),
  familySnapshots.trueFalse,
  'snapshots leaked between runtime screen indices',
);

const componentSlots = {
  'calc-blanks.tsx': ['calc.entries', 'calc.checked'],
  'tap-reveal.tsx': ['reveal.revealed'],
  'matching-pairs.tsx': ['match.rightOrder', 'match.selected', 'match.matched', 'match.wrong'],
  'drag-sort.tsx': ['dragSort.flow'],
  'order-steps.tsx': ['order.order', 'order.selected'],
  'number-line.tsx': ['line.value', 'line.checked'],
  'true-false-sequence.tsx': ['trueFalse.flow'],
  'tile-builder.tsx': ['build.placed'],
  'decision-tree.tsx': ['tree.current', 'tree.chosen', 'tree.allCorrect', 'tree.done'],
  'atlas-conversation.tsx': ['vocab.index', 'vocab.picked', 'vocab.score'],
  'progressive-calc.tsx': ['progressive.index', 'progressive.score', 'progressive.selected', 'progressive.revealed', 'progressive.finished'],
};
for (const [file, slots] of Object.entries(componentSlots)) {
  const source = readFileSync(new URL(`../src/components/${file}`, import.meta.url), 'utf8');
  assert.ok(source.includes('useLessonStepState'), `${file} does not use the lesson session`);
  for (const slot of slots) assert.ok(source.includes(`'${slot}'`), `${file} does not persist ${slot}`);
}

const runner = readFileSync(new URL('../src/app/lesson.tsx', import.meta.url), 'utf8');
assert.ok(runner.includes('<LessonStepSessionProvider'), 'lesson runner does not provide keyed snapshots');
assert.ok(runner.includes('markLessonStepCompletion'), 'lesson runner does not preserve monotonic completion');
assert.ok(!runner.includes('onSolvedChange={setSolved}'), 'a gated child can still overwrite restored completion');

const gatedCounts = {};
for (const course of COURSES) {
  for (const lesson of await loadCourseLessons(course.id)) {
    for (const step of expandSteps(lesson.steps ?? [])) {
      const normalized = normalizeStep(step);
      if (!gates(normalized)) continue;
      gatedCounts[normalized.kind] = (gatedCounts[normalized.kind] ?? 0) + 1;
    }
  }
}
assert.deepEqual(gatedCounts, {
  vocab: 186,
  reveal: 248,
  calc: 4,
  dragSort: 231,
  trueFalse: 273,
  line: 199,
  tree: 1,
  match: 201,
  build: 29,
  progressiveCalc: 44,
}, 'gated curriculum coverage changed');

console.log('lesson Previous state regression: PASS — 1,602 gated screens, 10 persistent families');
