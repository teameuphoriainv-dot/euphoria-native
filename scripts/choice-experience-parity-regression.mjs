#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { COURSES, loadCourseLessons } from '../src/lib/curriculum/courseIndex.ts';
import * as lessonSteps from '../src/lib/lesson-steps.ts';

const { normalizeStep } = lessonSteps;

let choices = 0;
for (const course of COURSES) {
  for (const lesson of await loadCourseLessons(course.id)) {
    for (const raw of lesson.steps) {
      const normalized = normalizeStep(raw);
      if (normalized.kind !== 'choice') continue;
      choices += 1;
      if (raw.type === 'fillBlank') assert.equal(normalized.submitMode, 'confirm');
      else assert.equal(normalized.submitMode, 'immediate', `${raw.type} must grade on the web option tap`);
    }
  }
}
assert.equal(choices, 1307, 'choice-family corpus drifted');

const if1Quiz = normalizeStep({
  type: 'quiz',
  question: 'You have $10,000 you will not touch for twenty years. Which choice is the risky one?',
  options: ['Index fund', 'Savings account', 'Neither', 'Both'],
  correct: 1,
  explanation: 'Inflation erodes the savings account over that holding period.',
});
assert.equal(if1Quiz.kind, 'choice');
if (if1Quiz.kind !== 'choice') process.exit(1);
assert.equal(typeof lessonSteps.choiceResponse, 'function', 'choice normalization must expose canonical response behavior');
assert.deepEqual(
  lessonSteps.choiceResponse(if1Quiz, if1Quiz.correct),
  { correct: true },
  'a correct quiz choice must not repeat the explanation in a second feedback card',
);
const if1Wrong = lessonSteps.choiceResponse(if1Quiz, if1Quiz.options.indexOf('Index fund'));
assert.deepEqual(
  if1Wrong,
  {
    correct: false,
    correction: {
      answer: 'The answer is "Savings account".',
      reason: 'Inflation erodes the savings account over that holding period.',
    },
  },
  'a wrong quiz choice must hand Atlas the correct answer and authored explanation',
);

const runner = readFileSync(new URL('../src/app/lesson.tsx', import.meta.url), 'utf8');
assert.match(runner, /norm\.submitMode === 'immediate' \? gradeChoice\(i\) : setPick\(i\)/, 'immediate choice families do not grade on option tap');
assert.match(runner, /norm\.submitMode === 'confirm' && !checked && pick !== null/, 'fill blanks lost their explicit submit step');
assert.doesNotMatch(runner, /<FeedbackBanner/, 'web choice feedback must not use the oversized generic feedback sheet');
assert.doesNotMatch(runner, /Quick check/, 'native must not add a choice heading that production web does not render');
assert.match(runner, /choiceResponse\(norm, pick\)/, 'the runner must consume the tested canonical choice response');
assert.match(runner, /<AtlasCorrection[\s\S]*?show=\{gradedChoice\?\.correction !== undefined\}/, 'wrong choices must hand correction to Atlas');
assert.match(runner, /gradedChoice\?\.correctOutcome/, 'correct scenario outcomes must remain visible');

console.log(`choice experience parity: PASS — ${String(choices)} immediate/confirm choice screens`);
