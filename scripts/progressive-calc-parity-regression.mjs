#!/usr/bin/env node
import { deepStrictEqual, match, strictEqual } from 'node:assert';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = new URL('..', import.meta.url).pathname;
const { COURSES, loadCourseLessons } = await import(pathToFileURL(join(ROOT, 'src/lib/curriculum/courseIndex.ts')).href);
const { normalizeStep, expandSteps, expandedStepIdentities } = await import(pathToFileURL(join(ROOT, 'src/lib/lesson-steps.ts')).href);

let authored = 0;
let quizScenes = 0;
let walkthroughScenes = 0;
let rounds = 0;
let explanations = 0;

for (const course of COURSES) {
  for (const lesson of await loadCourseLessons(course.id)) {
    for (const step of lesson.steps) {
      if (step.type !== 'progressiveCalc') continue;
      authored += 1;
      rounds += step.calcSteps.length;
      explanations += step.calcSteps.filter((round) => 'explanation' in round && round.explanation).length;

      const walkthrough = 'label' in step.calcSteps[0];
      strictEqual(step.calcSteps.every((round) => ('label' in round) === walkthrough), true,
        `${course.id} lesson ${lesson.num}: mixed calculation modes`);
      if (walkthrough) walkthroughScenes += 1;
      else quizScenes += 1;

      const normalized = normalizeStep(step);
      strictEqual(normalized.kind, 'progressiveCalc', `${course.id} lesson ${lesson.num}: calculation flattened`);
      deepStrictEqual(normalized.spec, { title: step.title, calcSteps: step.calcSteps },
        `${course.id} lesson ${lesson.num}: authored calculation payload changed`);
      deepStrictEqual(expandSteps([step]), [step],
        `${course.id} lesson ${lesson.num}: authored calculation became outer lesson screens`);
      deepStrictEqual(expandedStepIdentities([step]), [{ authoredIndex: 0, subIndex: 0, subTotal: 1 }],
        `${course.id} lesson ${lesson.num}: outer progress no longer matches web`);
    }
  }
}

strictEqual(authored, 44, `expected 44 progressive calculations, found ${authored}`);
strictEqual(quizScenes, 39, `expected 39 quiz calculations, found ${quizScenes}`);
strictEqual(walkthroughScenes, 5, `expected 5 walkthrough calculations, found ${walkthroughScenes}`);
strictEqual(rounds, 170, `expected 170 internal rounds, found ${rounds}`);
strictEqual(explanations, 3, `expected 3 authored working-out explanations, found ${explanations}`);

const component = await readFile(join(ROOT, 'src/components/progressive-calc.tsx'), 'utf8');
const runner = await readFile(join(ROOT, 'src/app/lesson.tsx'), 'utf8');
match(component, /reduced \? 0 : 800/, 'quiz auto-advance no longer matches the production 800ms delay');
match(component, /Math\.ceil\(steps\.length \/ 2\)/, 'quiz pass threshold drifted from production');
match(component, /Follow the calculation, step by step/, 'walkthrough guidance is missing');
match(component, /Reveal next step/, 'walkthrough reveal action is missing');
match(component, /useLessonStepState\('progressive\.index'/, 'Previous no longer restores internal calculation progress');
match(runner, /norm\.kind === 'progressiveCalc'/, 'lesson runner does not dispatch the calculation scene');
match(runner, /OWN_CTA_STEPS = new Set\(\[[^\]]*'progressiveCalc'/,
  'generic lesson footer can overlap the calculation CTA');

console.log(`PASS — ${authored} authored calculations remain ${authored} outer scenes with ${rounds} internal rounds (${quizScenes} quiz, ${walkthroughScenes} walkthrough, ${explanations} explanations).`);
