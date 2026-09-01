#!/usr/bin/env node
/** Exact production-49e dragSort model, corpus coverage, feedback, CTA, and a11y pin. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { COURSES, loadCourseLessons } from '../src/lib/curriculum/courseIndex.ts';
import {
  advanceDragSort,
  answerDragSort,
  createDragSortState,
  dragSortRounds,
  passedDragSort,
} from '../src/lib/drag-sort-model.ts';
import { normalizeStep } from '../src/lib/lesson-steps.ts';
import { STEP_TYPE_COUNTS } from '../src/lib/curriculum/stepTypes.generated.ts';

assert.equal(STEP_TYPE_COUNTS.dragSort, 231, 'generated curriculum count drifted from 231 dragSort steps');

const lengthCounts = {};
let stepCount = 0;
let roundCount = 0;
for (const course of COURSES) {
  for (const lesson of await loadCourseLessons(course.id)) {
    for (const step of lesson.steps ?? []) {
      if (step.type !== 'dragSort') continue;
      stepCount += 1;
      lengthCounts[step.items.length] = (lengthCounts[step.items.length] ?? 0) + 1;
      assert.ok(step.items.length >= 2, `${course.id}:${lesson.num} has no pair to compare`);
      assert.equal(new Set(step.items).size, step.items.length, `${course.id}:${lesson.num} has duplicate ordering items`);

      const normalized = normalizeStep(step);
      assert.equal(normalized.kind, 'dragSort', `${course.id}:${lesson.num} fell back to the list-reorder UI`);
      if (normalized.kind !== 'dragSort') continue;
      assert.deepEqual(normalized.spec, { prompt: step.prompt, items: step.items });

      const rounds = dragSortRounds(normalized.spec);
      roundCount += rounds.length;
      assert.equal(rounds.length, step.items.length - 1, `${course.id}:${lesson.num} lost an adjacent comparison`);
      assert.deepEqual(rounds, dragSortRounds(normalized.spec), `${course.id}:${lesson.num} changes order when reopened`);

      const authoredPairs = step.items.slice(0, -1).map((item, index) => `${item}\u0000${step.items[index + 1]}`).sort();
      const playedPairs = rounds.map((round) => round.correct === 'left'
        ? `${round.left}\u0000${round.right}`
        : `${round.right}\u0000${round.left}`).sort();
      assert.deepEqual(playedPairs, authoredPairs, `${course.id}:${lesson.num} compares something other than authored neighbors`);
    }
  }
}

assert.equal(stepCount, 231, 'not every canonical dragSort step reached the parity model');
assert.equal(roundCount, 1023, 'the 231 canonical steps should produce 1,023 adjacent-pair rounds');
assert.deepEqual(lengthCounts, { 3: 3, 4: 4, 5: 120, 6: 99, 7: 5 }, 'dragSort item-count distribution drifted');

// Pin the exact prompt-seeded production permutation, not just “some deterministic shuffle.”
assert.deepEqual(dragSortRounds({ prompt: 'Order', items: ['A', 'B', 'C', 'D', 'E'] }), [
  { left: 'D', right: 'E', correct: 'left' },
  { left: 'D', right: 'C', correct: 'right' },
  { left: 'C', right: 'B', correct: 'right' },
  { left: 'A', right: 'B', correct: 'left' },
]);

const twoRounds = dragSortRounds({ prompt: 'Order these', items: ['First', 'Second', 'Third'] });
let flow = createDragSortState();
assert.equal(advanceDragSort(flow, twoRounds.length), flow, 'a round advanced before the learner answered');
const firstWrong = twoRounds[0].correct === 'left' ? 'right' : 'left';
flow = answerDragSort(flow, twoRounds, firstWrong);
assert.equal(flow.score, 0, 'a wrong adjacent call increased the score');
assert.equal(answerDragSort(flow, twoRounds, twoRounds[0].correct), flow, 'one round accepted two answers');
flow = advanceDragSort(flow, twoRounds.length);
flow = answerDragSort(flow, twoRounds, twoRounds[1].correct);
assert.equal(flow.score, 1, 'a correct adjacent call was not scored');
flow = advanceDragSort(flow, twoRounds.length);
assert.equal(flow.done, true, 'the final round did not reveal the full authored order');
assert.equal(passedDragSort(flow.score, twoRounds.length), true, 'production majority threshold changed');
assert.equal(passedDragSort(1, 3), false, 'less than half must not pass');
assert.equal(passedDragSort(2, 3), true, 'at least half must pass');

const component = readFileSync(new URL('../src/components/drag-sort.tsx', import.meta.url), 'utf8');
for (const [needle, message] of [
  ["'dragSort.flow'", 'round state is not restored after Previous'],
  ['Which one comes first?', 'production question framing disappeared'],
  [">vs</ThemedText>", 'the production comparison separator must remain lowercase'],
  ["textTransform: 'none'", 'the label variant must not uppercase the production comparison separator'],
  ['question: { fontSize: 20', 'the production mobile question size drifted from 20px'],
  ['padding: 20', 'the production comparison-card padding drifted from 20px'],
  ['Next round', 'component lost ownership of its round CTA'],
  ['See the full order', 'component lost the authored-order reveal CTA'],
  ['The order that matters', 'full authored-order payoff disappeared'],
  ['AtlasCorrection', 'wrong answers must use the same Atlas correction treatment as production web'],
  ['SparkBurst', 'correct-answer reaction disappeared'],
  ['NotificationFeedbackType.Success', 'correct haptic feedback disappeared'],
  ['NotificationFeedbackType.Error', 'wrong haptic feedback disappeared'],
  ['accessibilityLiveRegion="polite"', 'round feedback is not announced'],
  ['accessibilityRole="progressbar"', 'round progress is not exposed to assistive technology'],
  ['accessibilityState={{ selected: chosen, disabled: answered }}', 'answer state is not exposed to assistive technology'],
]) assert.ok(component.includes(needle), message);

const runner = readFileSync(new URL('../src/app/lesson.tsx', import.meta.url), 'utf8');
assert.ok(runner.includes("norm.kind === 'dragSort'"), 'lesson runner does not mount the production dragSort component');
assert.ok(runner.includes("'dragSort'"), 'lesson runner does not give dragSort ownership of its CTA');
assert.ok(runner.includes('captureSolved(passed);'), 'dragSort score is not reported to the lesson runner');

console.log('dragSort parity regression: PASS — 231 steps, 1,023 deterministic adjacent-pair rounds');
