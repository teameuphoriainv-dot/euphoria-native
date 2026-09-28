#!/usr/bin/env node
/** Focused production-49e parity contract for IF1 screen 17's decision tree. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = new URL('..', import.meta.url).pathname;
const { loadCourseLessons } = await import(
  pathToFileURL(join(ROOT, 'src/lib/curriculum/courseIndex.ts')).href
);
const {
  DECISION_TREE_RESULT_HOLD_MS,
  decisionTreeCompletion,
  decisionTreeNextLabel,
  isDecisionTreeTerminal,
} = await import(pathToFileURL(join(ROOT, 'src/lib/decision-tree-model.ts')).href);

const [lesson] = await loadCourseLessons('investing-fundamentals');
const screenIndex = lesson.steps.findIndex((step) => step.type === 'decisionTree');
assert.equal(screenIndex, 16, 'IF1 decision tree must remain authored screen 17');

const tree = lesson.steps[screenIndex];
assert.equal(tree.type, 'decisionTree');
assert.equal(tree.decisions.length, 2);

const firstCorrect = tree.decisions[0].options[1];
const finalCorrect = tree.decisions[1].options[0];
const firstWrong = tree.decisions[0].options[0];
assert.equal(firstCorrect.feedback, 'You bought your remaining shares at the cheapest prices in a decade. This is the single decision that separates outcomes over a lifetime.');
assert.equal(finalCorrect.feedback, 'The honest one. Nobody knew the date. Owning productive assets pays off over decades, not on a schedule you pick.');
assert.equal(isDecisionTreeTerminal(firstCorrect, tree.decisions.length), false);
assert.equal(isDecisionTreeTerminal(finalCorrect, tree.decisions.length), true);
assert.equal(decisionTreeNextLabel(firstCorrect, tree.decisions.length), 'Next Decision');
assert.equal(decisionTreeNextLabel(finalCorrect, tree.decisions.length), 'See Results');
assert.equal(decisionTreeCompletion(true, finalCorrect), true, 'all-correct path must propagate true');
assert.equal(decisionTreeCompletion(false, finalCorrect), false, 'an earlier miss must propagate false');
assert.equal(decisionTreeCompletion(true, firstWrong), false, 'a wrong terminal choice must propagate false');
assert.equal(DECISION_TREE_RESULT_HOLD_MS, 800, 'production holds the result for 800ms before completion');

const component = readFileSync(join(ROOT, 'src/components/decision-tree.tsx'), 'utf8');
const lessonRunner = readFileSync(join(ROOT, 'src/app/lesson.tsx'), 'utf8');
const nativeDriver = readFileSync(join(ROOT, 'scripts/anim/drive.py'), 'utf8');
for (const required of [
  'FadeInRight',
  'FadeOutLeft',
  'ZoomIn',
  'translateY: 20',
  'translateX: 30',
  'translateX: -30',
  'scale: 0.9',
  'scale: 0.6',
  // Right and wrong now go through the shared lib/feedback vocabulary (haptic + sound + confetti).
  "feedback(option.correct ? 'correct' : 'wrong')",
  "Good effort. Review the feedback you saw along the way.",
  'DECISION_TREE_RESULT_HOLD_MS',
  'decisionTreeCompletion(allCorrect, selected)',
]) {
  assert.ok(component.includes(required), `native decision tree lost production behavior: ${required}`);
}
assert.ok(/<DecisionTree[\s\S]*?onComplete=\{\(passed\)[\s\S]*?captureSolved\(true\)[\s\S]*?advance\(\)/.test(lessonRunner),
  'lesson runner must receive decision-tree correctness, mark the scene complete, then advance');
assert.ok(/post_solve_button[\s\S]*?'see results'/.test(nativeDriver),
  'the native evidence driver must recognize production\'s terminal decision-tree CTA');

console.log('decision-tree parity regression passed — IF1 screen 17 behavior matches production 49e');
