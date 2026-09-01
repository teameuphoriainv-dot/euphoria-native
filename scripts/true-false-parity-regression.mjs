#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { normalizeStep } from '../src/lib/lesson-steps.ts';
import * as trueFalseModel from '../src/lib/true-false-model.ts';

const {
  advanceTrueFalse,
  answerTrueFalse,
  canAnswerTrueFalse,
  createTrueFalseState,
  didPassTrueFalse,
  finishTrueFalseTransition,
  trueFalseFeedback,
} = trueFalseModel;

const statements = [
  { s: 'Visible prompt A', a: true },
  { s: 'Visible prompt B', a: false },
  { s: 'Visible prompt C', a: true },
  { s: 'Visible prompt D', a: false },
];

const normalized = normalizeStep({ type: 'trueFalse', statements });
assert.equal(normalized.kind, 'trueFalse', 'true/false must keep its canonical sequential renderer');
if (normalized.kind !== 'trueFalse') process.exit(1);
assert.deepEqual(normalized.spec.statements, statements, 'normalization must preserve statement identity and truth values');

let state = createTrueFalseState();
assert.equal(canAnswerTrueFalse(state), true);
const gradedIdentities = [];

for (let expectedIndex = 0; expectedIndex < statements.length; expectedIndex += 1) {
  const answered = answerTrueFalse(state, statements, {
    visibleIndex: expectedIndex,
    value: statements[expectedIndex].a,
  });
  gradedIdentities.push(answered.answeredIndex);
  assert.equal(answered.phase, 'explanation');
  assert.equal(answered.lastCorrect, true);
  assert.equal(canAnswerTrueFalse(answered), false);
  assert.equal(
    answerTrueFalse(answered, statements, { visibleIndex: expectedIndex, value: false }),
    answered,
    'rapid duplicate answers must be idempotent',
  );

  const advanced = advanceTrueFalse(answered, statements.length);
  if (expectedIndex === statements.length - 1) {
    state = advanced;
    break;
  }
  assert.equal(advanced.phase, 'transition');
  assert.equal(
    finishTrueFalseTransition(advanced, expectedIndex),
    advanced,
    'the exiting prompt must not unlock the next prompt',
  );
  state = finishTrueFalseTransition(advanced, expectedIndex + 1);
  assert.equal(state.phase, 'question');
}

assert.deepEqual(gradedIdentities, [0, 1, 2, 3]);
assert.equal(state.phase, 'complete');
assert.equal(didPassTrueFalse(state, statements.length), true);
assert.equal(typeof trueFalseFeedback, 'function', 'true/false model must expose canonical feedback behavior');
assert.deepEqual(
  trueFalseFeedback({ s: 'A bond pays a fixed rate.', a: true }, true),
  { showCorrection: false },
  'a correct answer must use the colored statement state without a redundant feedback card',
);
assert.deepEqual(
  trueFalseFeedback({ s: 'Cash carries no risk.', a: false }, false),
  { showCorrection: true, answer: "It's false." },
  'a wrong statement with no authored explanation must not invent generic finance prose',
);
assert.deepEqual(
  trueFalseFeedback({ s: 'Authored statement', a: true, explanation: 'Authored reason.' }, false),
  { showCorrection: true, answer: "It's true.", reason: 'Authored reason.' },
  'a wrong statement must preserve its authored explanation when one exists',
);

const component = readFileSync('src/components/true-false-sequence.tsx', 'utf8');
const lesson = readFileSync('src/app/lesson.tsx', 'utf8');
assert.match(component, /useReducedMotion\(\)/, 'translated prompt motion must respect Reduced Motion');
assert.match(component, /Next Statement/, 'intermediate explanations need the canonical next action');
assert.match(component, /Finish/, 'the final explanation needs the canonical finish action');
assert.match(component, /<AtlasCorrection/, 'wrong true\/false answers must hand correction to Atlas');
assert.doesNotMatch(component, /TRUE OR FALSE/, 'native must not add a label that production web does not render');
assert.match(lesson, /norm\.kind === 'trueFalse'[\s\S]*?<TrueFalseSequence/, 'the lesson viewer must route the family to its dedicated renderer');

console.log('true/false parity: PASS — sequential identity, explanation, transition, completion, and Reduced Motion are pinned');
