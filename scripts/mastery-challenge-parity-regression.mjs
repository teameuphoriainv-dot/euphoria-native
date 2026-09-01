#!/usr/bin/env node
/** Production-49e mastery challenge contract across the canonical native curriculum. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = new URL('..', import.meta.url).pathname;
const { COURSES, loadCourseLessons } = await import(
  pathToFileURL(join(ROOT, 'src/lib/curriculum/courseIndex.ts')).href
);
const {
  ACTIVE_CHALLENGE_QUESTIONS,
  CHALLENGE_FAILURE_HOLD_MS,
  CHALLENGE_HEARTS,
  CHALLENGE_HINT_RESET_MS,
  CHALLENGE_INTRO_MS,
  FREE_CHALLENGE_HINTS,
  challengeHappyPathScreens,
  challengeRuntimeStates,
  gradeChallengeAnswer,
  hasMasteryChallenge,
  lessonProgressPercent,
  nextChallengePhase,
  shuffleChallengeQuestions,
} = await import(pathToFileURL(join(ROOT, 'src/lib/mastery-challenge-model.ts')).href);

assert.equal(ACTIVE_CHALLENGE_QUESTIONS, 4);
assert.equal(CHALLENGE_HEARTS, 3);
assert.equal(CHALLENGE_INTRO_MS, 2_600);
assert.equal(CHALLENGE_FAILURE_HOLD_MS, 1_200);
assert.equal(FREE_CHALLENGE_HINTS, 2);
assert.equal(CHALLENGE_HINT_RESET_MS, 2 * 60 * 60 * 1_000);
assert.equal(hasMasteryChallenge(Array(3).fill(null)), false);
assert.equal(hasMasteryChallenge(Array(4).fill(null)), true);

const sample = [
  { question: 'Q', options: ['A', 'B', 'C', 'D'], correct: 2, explanation: 'Because C.' },
];
const [shuffled] = shuffleChallengeQuestions(sample, () => 0);
assert.equal(shuffled.options[shuffled.correct], 'C', 'shuffling must carry the answer key with its option');
assert.deepEqual(gradeChallengeAnswer(2, 2, 3), { correct: true, hearts: 3, failed: false });
assert.deepEqual(gradeChallengeAnswer(0, 2, 1), { correct: false, hearts: 0, failed: true });
assert.equal(nextChallengePhase(2, 4), 'question');
assert.equal(nextChallengePhase(3, 4), 'passed');
assert.equal(lessonProgressPercent({ authoredIndex: 15, authoredTotal: 16, phase: 'steps', hasChallenge: true }), 80);
assert.equal(lessonProgressPercent({ authoredIndex: 15, authoredTotal: 16, phase: 'challenge', hasChallenge: true }), 90);
assert.equal(lessonProgressPercent({ authoredIndex: 15, authoredTotal: 16, phase: 'complete', hasChallenge: true }), 100);
assert.equal(lessonProgressPercent({ authoredIndex: 15, authoredTotal: 16, phase: 'steps', hasChallenge: false }), 100);

let lessons = 0;
let eligibleLessons = 0;
let activeQuestions = 0;
let happyPathScreens = 0;
let runtimeStates = 0;
for (const course of COURSES) {
  for (const lesson of await loadCourseLessons(course.id)) {
    lessons += 1;
    if (!hasMasteryChallenge(lesson.challenge)) continue;
    eligibleLessons += 1;
    activeQuestions += lesson.challenge.slice(0, ACTIVE_CHALLENGE_QUESTIONS).length;
    happyPathScreens += challengeHappyPathScreens(lesson.challenge);
    runtimeStates += challengeRuntimeStates(lesson.challenge);
  }
}
assert.deepEqual(
  { lessons, eligibleLessons, activeQuestions, happyPathScreens, runtimeStates },
  { lessons: 300, eligibleLessons: 295, activeQuestions: 1_180, happyPathScreens: 1_770, runtimeStates: 2_065 },
  'challenge runtime corpus accounting changed',
);

const runner = readFileSync(join(ROOT, 'src/app/lesson.tsx'), 'utf8');
const round = readFileSync(join(ROOT, 'src/components/mastery-challenge-round.tsx'), 'utf8');
const intro = readFileSync(join(ROOT, 'src/components/mastery-challenge-intro.tsx'), 'utf8');
const hints = readFileSync(join(ROOT, 'src/hooks/use-mastery-hints.ts'), 'utf8');
const driver = readFileSync(join(ROOT, 'scripts/anim/drive.py'), 'utf8');
const solver = readFileSync(join(ROOT, 'scripts/anim/solve.py'), 'utf8');

for (const required of [
  'hasMasteryChallenge(lesson?.challenge)',
  "setChallengeStage('intro')",
  'lessonProgressPercent({',
  "challengeStage !== 'none' ? 'Challenge'",
  '<MasteryChallengeRound',
  '<MasteryChallengeIntro',
]) assert.ok(runner.includes(required), `lesson runner lost challenge behavior: ${required}`);

for (const required of [
  'Mastery challenge',
  'Mastery Achieved!',
  'Out of Hearts',
  'Try Again',
  'Use a hint',
  'CHALLENGE_FAILURE_HOLD_MS',
]) assert.ok(round.includes(required), `challenge round lost production behavior: ${required}`);

assert.ok(intro.includes('Alright. Time for a quick check.'));
assert.ok(intro.includes('3 hearts'));
assert.ok(intro.includes('hints if you need them'));
assert.ok(hints.includes('AsyncStorage.multiGet([RESET_KEY, FREE_KEY])'), 'free hint balance is not restored');
assert.ok(hints.includes('CHALLENGE_HINT_RESET_MS'), 'free hints no longer reset on production cadence');
assert.ok(/onPass=\{\(\) => \{[\s\S]*?setChallengeStage\('none'\)[\s\S]*?openLessonScreen\(DONE\)/.test(runner),
  'passing the challenge must be the only route into the completion screen');
assert.ok(driver.includes("'submit'"), 'native driver cannot submit challenge answers');
assert.ok(driver.includes("'start the challenge'"), 'native driver cannot dismiss the challenge introduction');
assert.ok(solver.includes("lesson.get('challenge', [])"), 'native solver cannot resolve challenge answer keys');

console.log('mastery challenge parity passed — 295 lessons / 1,180 questions / 1,770 happy-path runtime screens');
