/**
 * PRACTICE TRANSITION PIN — the "Now quiz yourself" beat must still fire on the real corpus.
 *
 *   node --import ./scripts/ts-resolve-hooks.mjs scripts/practice-transition-pin.mjs
 *   node --import ./scripts/ts-resolve-hooks.mjs scripts/practice-transition-pin.mjs --selftest
 *
 * WHY. `shouldAnnouncePractice` matches step TYPE NAMES, and withMobileDecks (curriculum/index.ts)
 * rewrites every teachingSlide and interactiveGraph into a step of type 'mobileDeck' before a
 * lesson is rendered. Those two were the most common reading halves in the corpus, so the deck
 * conversion silently switched the transition off for 406 of the 597 eligible edges. Nothing
 * failed: a transition that does not play looks exactly like one that was not meant to.
 *
 * THE REAL LESSON, and the reason this pin measures rather than greps. A unit test on
 * shouldAnnouncePractice would have passed throughout — the function was always correct about the
 * names it was given. The bug lived in the gap between the names it knew and the names the app
 * actually produces, which only shows up if you run it over lessons loaded the way the app loads
 * them. Note that is `loadCourseLessons` from curriculum/index.ts, NOT the raw one in
 * courseIndex.ts: only the former applies the deck conversion, and measuring with the wrong one
 * reports a clean 597/597.
 */
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

globalThis.__DEV__ = false;

const ROOT = new URL('..', import.meta.url).pathname;
const imported = (path) => import(pathToFileURL(join(ROOT, path)).href);

const { COURSES } = await imported('src/lib/curriculum/courseIndex.ts');
const { loadCourseLessons } = await imported('src/lib/curriculum/index.ts');
const { shouldAnnouncePractice } = await imported('src/lib/step-mode-transition.ts');

const SELFTEST = process.argv.includes('--selftest');

/** Kept in step with PRACTICE_STEPS in src/lib/step-mode-transition.ts. */
const PRACTICE = new Set([
  'microCheck', 'fillBlank', 'quiz', 'dragSort', 'scenario', 'slider',
  'trueFalse', 'match', 'matchingPairs', 'buildIt', 'progressiveCalc',
  'calculator', 'sorting', 'budgetBuilder', 'decisionTree', 'scenarioSim',
  'visualInteractive', 'tapReveal',
]);
/** Every type that reads as teaching, INCLUDING the deck the conversion produces. */
const READING = new Set([
  'hookOpener', 'stakesCard', 'teachingSlide', 'interactiveGraph', 'mobileDeck',
  'keyTermsCards', 'concept', 'timeline', 'explorable', 'canvas',
]);

let eligible = 0;
let firing = 0;
let deckHalf = 0;
for (const course of COURSES) {
  let lessons;
  try {
    lessons = await loadCourseLessons(course.id);
  } catch {
    continue;
  }
  for (const lesson of lessons) {
    const steps = lesson.steps ?? [];
    for (let i = 0; i < steps.length - 1; i += 1) {
      const from = steps[i];
      const to = steps[i + 1];
      if (READING.has(from?.type) && PRACTICE.has(to?.type)) {
        eligible += 1;
        if (from.type === 'mobileDeck') deckHalf += 1;
      }
      if (shouldAnnouncePractice(from, to)) firing += 1;
    }
  }
}

assert.ok(eligible > 400, `only ${eligible} eligible edges — the corpus did not load the deck way`);
assert.ok(deckHalf > 0,
  'no edge has a deck as its reading half, so this pin is measuring un-converted lessons and proves nothing');

const missed = eligible - firing;
if (missed > 0) {
  console.error(`\npractice-transition-pin: ${missed} of ${eligible} reading -> practice edges announce nothing.`);
  console.error(`  ${deckHalf} of those edges have a mobileDeck as the reading half.`);
  console.error('\n  READING_STEPS in src/lib/step-mode-transition.ts matches type NAMES, and');
  console.error('  withMobileDecks rewrites teachingSlide and interactiveGraph into mobileDeck');
  console.error('  before render. A type added to the pipeline has to be added there too.\n');
  process.exit(1);
}

if (SELFTEST) {
  // The pre-fix set, reproduced: without 'mobileDeck' the deck edges must go dark.
  const preFix = new Set([...READING].filter((t) => t !== 'mobileDeck'));
  const wouldFire = (from, to) => preFix.has(from) && PRACTICE.has(to);
  assert.equal(wouldFire('mobileDeck', 'quiz'), false,
    'the control is wrong: the pre-fix set must NOT announce a deck -> quiz edge');
  assert.equal(shouldAnnouncePractice({ type: 'mobileDeck' }, { type: 'quiz' }), true,
    'the shipped set must announce a deck -> quiz edge');
  assert.equal(shouldAnnouncePractice({ type: 'quiz' }, { type: 'quiz' }), false,
    'practice -> practice must stay silent');
  console.log('[practice-transition-pin] selftest ok — the pre-fix set is confirmed to fail this');
}

console.log(`[practice-transition-pin] ok — ${firing}/${eligible} reading -> practice edges announce, ${deckHalf} via a deck`);
