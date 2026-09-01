import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  buildRecallQuiz,
  completedLessonNumbers,
} from '../src/lib/lesson-warmup-recall.ts';

const lesson = readFileSync(new URL('../src/app/lesson.tsx', import.meta.url), 'utf8');
const warmup = readFileSync(new URL('../src/components/lesson-warmup.tsx', import.meta.url), 'utf8');

assert.match(lesson, /<AmbientBackground starCount=\{40\} \/>/, 'lesson must retain the quiet ambient background');
assert.doesNotMatch(lesson, /<LessonBackground/, 'moving lesson orbs must not return to the lesson shell');
assert.match(lesson, /completedLessonIds=\{completedLessonIds\}/, 'warmup must receive actual completion history');

assert.doesNotMatch(warmup, /PRIMERS|how are you feeling|focus check/i, 'retired mood primers must not return');
assert.doesNotMatch(warmup, /RadialGradient|warmup-flame/, 'production warmup has no flame halo');
assert.match(warmup, /PixelSpriteView sprite=\{flameSprite\} scale=\{9\} play="loop"/, 'warmup must use the canonical 144px looping pixel flame');
assert.match(warmup, /First, a quick check on what you have already covered\./, 'recall intro copy must match production');
assert.match(warmup, /FROM LESSON/, 'recall questions must identify their source lesson');
assert.match(warmup, /beat < available\.length \? 'Next' : 'Start lesson'/, 'answered recalls must advance manually');
assert.match(warmup, /AtlasSpeech text=\{`It was/, 'wrong recall answers must get the canonical Atlas correction');

assert.deepEqual(
  completedLessonNumbers('personal-finance', ['personal-finance:1', 'global-economics:2', 'personal-finance:4', 'personal-finance:nope']),
  [1, 4],
  'completed lesson ids must remain course-scoped and numeric',
);
assert.deepEqual(await buildRecallQuiz('investing-fundamentals', 1, []), [], 'first lesson must not invent recall questions');
const recall = await buildRecallQuiz('investing-fundamentals', 5, [1, 2, 3, 4, 8]);
assert.equal(recall.length, 2, 'warmup must cap recall at two questions');
assert.ok(recall.every((question) => question.fromLesson < 5), 'warmup must only draw from earlier completed lessons');
assert.deepEqual(recall, await buildRecallQuiz('investing-fundamentals', 5, [1, 2, 3, 4, 8]), 'warmup selection must be deterministic');

console.log('lesson warmup parity regression: passed');
