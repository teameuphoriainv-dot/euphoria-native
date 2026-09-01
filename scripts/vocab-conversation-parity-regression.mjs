#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { COURSES, loadCourseLessons } from '../src/lib/curriculum/courseIndex.ts';
import { normalizeStep } from '../src/lib/lesson-steps.ts';
import { buildVocabConversation } from '../src/lib/vocab-conversation.ts';

const terms = [
  { term: 'Alpha', definition: 'First definition', example: 'First example', sentence: 'Alpha in a sentence.' },
  { term: 'Beta', definition: 'Second definition', example: 'Second example', sentence: 'Beta in a sentence.' },
  { term: 'Gamma', definition: 'Third definition', example: 'Third example', sentence: 'Gamma in a sentence.' },
  { term: 'Delta', definition: 'Fourth definition', example: 'Fourth example', sentence: 'Delta in a sentence.' },
];

const first = buildVocabConversation(terms);
const second = buildVocabConversation(terms);
assert.deepEqual(second, first, 'a lesson must always produce the same beats and option order');
assert.equal(first[0].kind, 'say');
assert.equal(first[0].cta, 'Teach me');
assert.deepEqual(first.slice(1, 5).map((beat) => beat.kind), ['teach', 'teach', 'teach', 'teach']);
assert.equal(first.filter((beat) => beat.kind === 'ask').length, 4, 'web caps vocabulary quizzes at four');
assert.equal(first.at(-1)?.kind, 'say');
assert.equal(first.at(-1)?.cta, 'Done');

for (const beat of first.filter((item) => item.kind === 'ask')) {
  assert.equal(beat.options.length, 4);
  assert.equal(new Set(beat.options).size, 4, 'quiz options must be distinct');
  assert.equal(beat.options.includes(beat.options[beat.correct]), true, 'the correct index must address a visible option');
}

const short = buildVocabConversation(terms.slice(0, 2));
assert.equal(short.some((beat) => beat.kind === 'ask'), false, 'two-term sets must not become coin-flip quizzes');

const normalized = normalizeStep({ type: 'keyTermsCards', terms });
assert.equal(normalized.kind, 'vocab', 'keyTermsCards must not collapse to tap-reveal cards');
if (normalized.kind !== 'vocab') process.exit(1);
assert.deepEqual(normalized.terms, terms, 'all authored term fields must reach the conversation');

let lessons = 0;
let steps = 0;
let authoredTerms = 0;
let beats = 0;
let asks = 0;
for (const course of COURSES) {
  for (const lesson of await loadCourseLessons(course.id)) {
    lessons += 1;
    for (const step of lesson.steps) {
      if (step.type !== 'keyTermsCards') continue;
      steps += 1;
      authoredTerms += step.terms.length;
      const conversation = buildVocabConversation(step.terms);
      beats += conversation.length;
      asks += conversation.filter((beat) => beat.kind === 'ask').length;
      assert.equal(normalizeStep(step).kind, 'vocab', `${course.id} lesson ${String(lesson.num)} lost its conversation`);
    }
  }
}

assert.equal(lessons, 300);
assert.equal(steps, 186);
assert.equal(authoredTerms, 1036);
assert.equal(beats, 2331);
assert.equal(asks, 737);

const component = readFileSync('src/components/atlas-conversation.tsx', 'utf8');
const lesson = readFileSync('src/app/lesson.tsx', 'utf8');
assert.match(component, /TYPEWRITER_CPS = 46/, 'native must retain the production 46 cps delivery');
assert.match(component, /useReducedMotion\(\)/, 'typing and entrance motion must respect Reduced Motion');
assert.match(component, /onPress=\{finish\}/, 'tapping Atlas speech must reveal the full line');
assert.match(component, /useLessonStepState\('vocab\.index'/, 'conversation beat must survive Previous and forward navigation');
assert.match(component, /useLessonStepState<number \| null>\('vocab\.picked'/, 'conversation answer must survive Previous and forward navigation');
assert.match(component, /useLessonStepState\('vocab\.score'/, 'conversation score must survive Previous and forward navigation');
assert.match(component, /#14121C/, 'the canonical Atlas bubble surface must survive translation');
assert.match(
  component,
  /content: \{[^}]*paddingHorizontal: 24/,
  'the conversation must preserve the web px-6 mobile content gutter',
);
assert.match(component, /beat\.options\.map/, 'ask beats must render authored answer options');
assert.match(component, /beat\.onWrong/, 'wrong answers must retain the authored correction');
assert.match(lesson, /norm\.kind === 'vocab'[\s\S]*?<VocabConversation/, 'the lesson runner must dispatch the dedicated conversation');
assert.match(lesson, /OWN_CTA_STEPS = new Set\(\[[^\]]*'vocab'/, 'the generic lesson footer must not stack over conversation CTAs');
assert.match(lesson, /selfAdvancing = [^\n]*norm\?\.kind === 'vocab'/, 'restored conversations must not gain a duplicate footer CTA');

console.log(`vocab conversation parity: PASS — ${String(steps)} steps, ${String(authoredTerms)} terms, ${String(beats)} beats, ${String(asks)} asks`);
