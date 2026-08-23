/**
 * The daily goal must count TIME, and quests must count LESSONS. Neither may be derived from
 * the other.
 *
 * Reported 2026-08-22: "it looks like the app measures time based on the lesson's listed duration,
 * not actual time spent in-app. After finishing a lesson it shows 5 minutes even if you were on the
 * app much longer." completeLesson added a flat MINUTES_PER_LESSON per completion, so the goal was
 * counting lessons and calling them minutes.
 *
 * The reason this needs a pin rather than a comment: quests.ts recovered the lesson count by
 * DIVIDING minutes by that same constant. The two bugs cancelled out, so both looked correct.
 * Fixing one alone silently corrupts the other, and neither surface throws.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

/**
 * Comments are stripped before any absence check. The first version of this pin asserted that
 * `Math.floor(minutes / MINUTES_PER_LESSON)` was gone — and failed, because the comment explaining
 * WHY it is gone quotes it verbatim. An absence assertion that reads comments cannot tell code from
 * a description of code. pricing-pin.mjs strips for the same reason.
 */
const read = (rel) => readFileSync(new URL(rel, import.meta.url), 'utf8');
const strip = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

const store = strip(read('../src/lib/store.ts'));
const quests = strip(read('../src/lib/quests.ts'));
const lesson = strip(read('../src/app/lesson.tsx'));

// 1. the goal is credited from a passed-in measurement, not a constant
assert.match(store, /completeLesson: \(id, xp, minutesSpent\) =>/,
  'completeLesson no longer accepts elapsed time — the daily goal is back to counting lessons');
assert.doesNotMatch(store, /const minutes = base \+ MINUTES_PER_LESSON;/,
  'completeLesson is adding the flat MINUTES_PER_LESSON constant again — this is the reported bug');

// 2. and it is bounded, so a lesson left open cannot swallow the whole goal
assert.match(store, /MAX_MINUTES_PER_LESSON,[\s\S]{0,160}MIN_MINUTES_PER_LESSON/,
  'the credited minutes are no longer clamped between a floor and a ceiling');

// 3. quests COUNT lessons; they must never divide minutes by a per-lesson constant again
assert.doesNotMatch(quests, /Math\.floor\(minutes \/ MINUTES_PER_LESSON\)/,
  'quests.ts is deriving the lesson count from minutes again. That only holds while every lesson '
  + 'credits identical minutes, which is exactly what was just fixed — it will report the wrong '
  + 'count for any lesson that is not exactly MINUTES_PER_LESSON long, and never throw');
assert.match(quests, /s\.lessonsToday/, 'quests.ts no longer reads the counted lessonsToday');

// 4. lessonsToday must survive a restart, or the count silently resets mid-day
assert.match(store, /lessonsToday: s\.lessonsToday/,
  'lessonsToday is missing from partialize — store.ts:10 warns this fails SILENTLY on restart');

// 5. the caller actually measures something
assert.match(lesson, /Date\.now\(\) - openedAt\.current/,
  'lesson.tsx no longer measures elapsed time, so completeLesson falls back to the constant');

console.log('PASS — the goal counts real clamped minutes, quests count lessons directly, and '
  + 'lessonsToday persists.');
