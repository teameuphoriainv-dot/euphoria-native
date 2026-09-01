#!/usr/bin/env node
import assert from 'node:assert/strict';

import { COURSES, loadCourseLessons } from '../src/lib/curriculum/courseIndex.ts';
import { normalizeStep } from '../src/lib/lesson-steps.ts';

let matchingModel;
try {
  matchingModel = await import('../src/lib/matching-pairs-model.ts');
} catch (error) {
  assert.fail(`matching-pairs escape model is missing: ${error instanceof Error ? error.message : String(error)}`);
}

const {
  matchingPairsEscape,
  nextMatchingWrongAttempts,
} = matchingModel;

assert.equal(typeof nextMatchingWrongAttempts, 'function', 'matching misses need a shared transition');
assert.equal(typeof matchingPairsEscape, 'function', 'matching needs a shared escape decision');

let wrongAttempts = 0;
assert.equal(matchingPairsEscape(wrongAttempts, 0, 3), null, 'Skip must not appear before a miss');

wrongAttempts = nextMatchingWrongAttempts(wrongAttempts);
assert.equal(wrongAttempts, 1, 'one wrong selection must count as exactly one miss');
assert.equal(matchingPairsEscape(wrongAttempts, 0, 3), null, 'Skip must not appear after only one miss');

wrongAttempts = nextMatchingWrongAttempts(wrongAttempts);
assert.equal(wrongAttempts, 2, 'the second wrong selection must count exactly once');
assert.deepEqual(
  matchingPairsEscape(wrongAttempts, 0, 3),
  {
    message: 'Tricky one. Keep going, or move on and come back to it.',
    cta: 'Skip',
    passed: false,
  },
  'the second miss must expose the exact production-web explanation and false completion',
);
assert.equal(
  matchingPairsEscape(wrongAttempts, 3, 3),
  null,
  'a completed match must preserve the success state instead of offering Skip',
);

let rawMatchCount = 0;
let normalizedMatchCount = 0;
for (const course of COURSES) {
  const lessons = await loadCourseLessons(course.id);
  for (const lesson of lessons) {
    for (const step of lesson.steps) {
      if (step.type === 'match' || step.type === 'matchingPairs') rawMatchCount += 1;
      const normalized = normalizeStep(step);
      if (normalized.kind !== 'match') continue;
      normalizedMatchCount += 1;
      assert.ok(normalized.spec.pairs.length > 0, `${course.id} lesson ${lesson.num} has an empty match`);
      assert.equal(
        matchingPairsEscape(2, 0, normalized.spec.pairs.length)?.passed,
        false,
        `${course.id} lesson ${lesson.num} does not inherit the false-completion escape`,
      );
    }
  }
}

assert.equal(rawMatchCount, 201, 'the exact 4,050-step production corpus match count changed');
assert.equal(normalizedMatchCount, rawMatchCount, 'a matching source step bypasses the shared native renderer');

console.log(`matching-pairs parity regression ok — ${normalizedMatchCount} matching screens inherit the two-miss Skip escape`);
