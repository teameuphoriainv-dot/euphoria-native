#!/usr/bin/env node
// ============================================================================
// Teach the lesson driver about the steps expandSteps() creates.
//
//   node --import ./scripts/ts-resolve-hooks.mjs scripts/anim/answers-augment.mjs
//
// WHY. scripts/anim/lesson-answers.mjs summarises the CURRICULUM, one entry per
// authored step. The app no longer renders authored steps one-to-one: expandSteps()
// lifts a progressiveCalc into its calcQuiz/calcWalkthrough screens and a
// simulationFinale into simProse/simDecision screens. Those screens have no entry in
// the answers file, so solve.answer() returns 'no-match', drive.advance() falls back
// to tapping an arbitrary row, and the driver stalls — which is exactly what happened
// when commit e9a91e8 tried to device-verify a finale and could not reach one.
//
// I broke the driver by changing the app, so the driver is mine to fix.
//
// HOW, and why this shape. Rather than re-deriving which option is correct — the third
// place in this repo that would encode the same rule and the third that could drift —
// this runs the app's OWN expandSteps() and normalizeStep(). Anything they turn into a
// `choice` becomes a driver answer, so the driver's model of a lesson is by construction
// the model the screen renders. A new interactive step type is picked up for free.
//
// ADDITIVE ON PURPOSE. Existing entries are left exactly as they are, because the
// authored-step path already drives 300 lessons and the failure here is limited to the
// screens that did not exist before. find_step() scans every entry for one whose options
// are all on screen, so extra candidates cost nothing but a comparison.
// ============================================================================
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

// this file lives at scripts/anim/, so the repo root is two levels up
const REPO = new URL('../..', import.meta.url).pathname;
const COURSES = join(REPO, 'src/lib/curriculum/courses');
const OUT = process.env.ANSWERS ?? '/tmp/lesson-answers.json';

const { expandSteps, normalizeStep } = await import(
  pathToFileURL(join(REPO, 'src/lib/lesson-steps.ts')).href
);

const SYNTHETIC = new Set(['calcQuiz', 'simDecision']);

let existing = {};
try {
  existing = JSON.parse(readFileSync(OUT, 'utf8'));
} catch {
  console.error(`no existing ${OUT}; run scripts/anim/lesson-answers.mjs first`);
  process.exit(1);
}

let added = 0, lessonsTouched = 0;
for (const file of readdirSync(COURSES).filter((f) => f.endsWith('.ts')).sort()) {
  const key = file.replace('.ts', '');            // answers are keyed camelCase, like the filename
  const bucket = existing[key];
  if (!Array.isArray(bucket)) continue;
  const lessons = (await import(pathToFileURL(join(COURSES, file)).href)).default ?? [];
  for (const lesson of lessons) {
    const entry = bucket.find((l) => l.num === lesson.num) ?? bucket[lesson.num - 1];
    if (!entry || !Array.isArray(entry.steps)) continue;
    let before = entry.steps.length;
    for (const step of expandSteps(lesson.steps ?? [])) {
      if (!SYNTHETIC.has(step?.type)) continue;
      const n = normalizeStep(step);
      // Only a graded single-choice screen is drivable; simProse and calcWalkthrough are
      // prose and advance on Continue with no answer needed.
      if (n?.kind !== 'choice' || !Array.isArray(n.options) || n.options.length < 2) continue;
      entry.steps.push({ kind: 'quiz', options: n.options, correct: n.correct });
      added += 1;
    }
    if (entry.steps.length > before) lessonsTouched += 1;
  }
}

writeFileSync(OUT, JSON.stringify(existing));
console.log(`added ${added} driver answers across ${lessonsTouched} lessons -> ${OUT}`);

// A green run means nothing unless the numbers are the ones the app will actually show.
const expectCalc = 136, expectDecisions = 781;
if (added !== expectCalc + expectDecisions) {
  console.error(`EXPECTED ${expectCalc + expectDecisions} (136 calcQuiz + 781 graded decisions), got ${added}.`);
  console.error('Either the corpus changed or expandSteps did — reconcile before trusting a driver run.');
  process.exit(1);
}
console.log(`matches the audit: ${expectCalc} calcQuiz + ${expectDecisions} graded decisions`);
