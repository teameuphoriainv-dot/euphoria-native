#!/usr/bin/env node

import assert from 'node:assert/strict';

import { COURSES, loadCourseLessons } from '../src/lib/curriculum/courseIndex.ts';
import { normalizeStep } from '../src/lib/lesson-steps.ts';

let sliders = 0;
let explained = 0;
let investingLessonOneSlider;

for (const course of COURSES) {
  for (const lesson of await loadCourseLessons(course.id)) {
    for (const [index, step] of lesson.steps.entries()) {
      if (step.type !== 'slider') continue;
      sliders += 1;
      if (step.explanation) explained += 1;

      const normalized = normalizeStep(step);
      assert.equal(normalized.kind, 'line', `${course.id} L${String(lesson.num)} S${String(index + 1)} did not normalize as a slider`);
      assert.equal(
        normalized.spec.tolerance,
        (step.max - step.min) * 0.15,
        `${course.id} L${String(lesson.num)} S${String(index + 1)} does not use the production 15% answer band`,
      );
      assert.equal(normalized.spec.step, 1, `${course.id} L${String(lesson.num)} S${String(index + 1)} lost the production step size`);
      assert.equal(normalized.spec.unit, step.unit, `${course.id} L${String(lesson.num)} S${String(index + 1)} lost its unit`);
      assert.equal(normalized.spec.explanation, step.explanation, `${course.id} L${String(lesson.num)} S${String(index + 1)} lost authored feedback`);

      if (course.id === 'investing-fundamentals' && lesson.num === 1 && index === 14) {
        investingLessonOneSlider = normalized.spec;
      }
    }
  }
}

assert.equal(sliders, 199, 'slider corpus coverage changed');
assert.equal(explained, 2, 'authored slider explanation coverage changed');
assert.ok(investingLessonOneSlider, 'Investing Fundamentals lesson 1 slide 15 is missing');
assert.deepEqual(
  {
    min: investingLessonOneSlider.min,
    max: investingLessonOneSlider.max,
    target: investingLessonOneSlider.target,
    tolerance: investingLessonOneSlider.tolerance,
    step: investingLessonOneSlider.step,
    unit: investingLessonOneSlider.unit,
  },
  { min: 2, max: 20, target: 9, tolerance: 2.6999999999999997, step: 1, unit: 'years' },
  'Investing Fundamentals lesson 1 slide 15 contract drifted',
);

let model;
try {
  model = await import('../src/lib/number-line-model.ts');
} catch {
  model = {};
}

assert.equal(typeof model.initialNumberLineValue, 'function', 'the shared slider model is missing its initial-value behavior');
assert.equal(model.initialNumberLineValue(investingLessonOneSlider), 11, 'sliders must start at the rounded midpoint');
assert.equal(model.numberLineValueAtX(70, 180, investingLessonOneSlider), 9, 'continuous drag does not map track position to a stepped value');
assert.equal(model.numberLineValueAtX(-20, 180, investingLessonOneSlider), 2, 'continuous drag does not clamp below the track');
assert.equal(model.numberLineValueAtX(220, 180, investingLessonOneSlider), 20, 'continuous drag does not clamp above the track');

const lockedValue = model.changeNumberLineValue(8, 15, true, investingLessonOneSlider);
assert.equal(lockedValue, 8, 'a submitted slider can still change');
assert.equal(model.changeNumberLineValue(8, 15, false, investingLessonOneSlider), 15, 'an unsubmitted slider cannot change continuously');
assert.equal(model.numberLinePassed(11, investingLessonOneSlider), true, 'the production 15% band rejected a close IF1 answer');
assert.equal(model.numberLinePassed(12, investingLessonOneSlider), false, 'the production 15% band accepted a distant IF1 answer');
assert.equal(model.numberLineDisplayValue(12, false, investingLessonOneSlider), 12, 'the pre-reveal answer changed unexpectedly');
assert.equal(model.numberLineDisplayValue(12, true, investingLessonOneSlider), 9, 'the reveal did not snap to the authored answer');
assert.equal(model.NUMBER_LINE_REVEAL_MS, 300, 'the production reveal delay drifted');
assert.equal(typeof model.shouldNumberLineClaimGesture, 'function', 'the shared slider model is missing scroll-safe drag ownership');
assert.equal(typeof model.numberLinePhase, 'function', 'the shared slider model is missing its Submit/reveal/Continue phases');
assert.equal(model.shouldNumberLineClaimGesture(8, 1, false), true, 'a horizontal slider drag is not claimed');
assert.equal(model.shouldNumberLineClaimGesture(4, 1, false), false, 'minor finger movement incorrectly begins a slider drag');
assert.equal(model.shouldNumberLineClaimGesture(8, 12, false), false, 'the slider steals vertical lesson scrolling');
assert.equal(model.shouldNumberLineClaimGesture(8, 1, true), false, 'a submitted slider still claims drag gestures');
assert.equal(model.numberLinePhase(false, false), 'editing', 'Submit is not available during editing');
assert.equal(model.numberLinePhase(true, false), 'waiting', 'the 300ms locked reveal beat was skipped');
assert.equal(model.numberLinePhase(true, true), 'revealed', 'manual Continue is not available after reveal');

console.log(`slider parity regression: PASS — ${String(sliders)} sliders, ${String(explained)} authored explanations`);
