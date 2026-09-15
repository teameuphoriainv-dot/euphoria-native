#!/usr/bin/env node
/**
 * The lesson resume pointer: where a half-finished lesson reopens, and where it must refuse to.
 *
 * WHAT WAS BROKEN. Lesson position lived only in the runner's component state. Backgrounding the
 * app does not unmount the screen, so Previous/forward kept working and the gap was invisible in
 * normal use; a force quit or an OS eviction dropped the learner back on the warmup screen of a
 * lesson they were nine screens into, while Home went on calling that button "Continue". Nothing
 * in the store persisted a position: `partialize` had no such field.
 *
 * WHAT A NAIVE FIX BREAKS, which is why this file is longer than the fix:
 *
 *   1. LENGTH IS NOT A PROPERTY OF THE CORPUS FILE. loadCourseLessons filters RETIRED_STEP_TYPES
 *      and drops duplicate match steps at load, so retiring one more type renumbers every screen
 *      after it in 300 lessons at once. A saved "screen 7" then points at different content and
 *      nothing reports it. The pointer therefore carries a hash of the runtime step-type sequence
 *      and is thrown away when that changes.
 *
 *   2. THE TERMINAL SCREENS PAY OUT. `screens + 1` is the completion celebration and `screens + 2`
 *      the streak screen, and completeLesson only runs on Continue from the latter. A pointer
 *      aimed at either would hand out a lesson's XP, coins, streak day and reward cards for
 *      reopening the app.
 *
 *   3. AN INDEX PAST THE END RENDERS NOTHING. `steps[idx - 1]` is undefined and every branch in
 *      lesson.tsx then declines to draw, leaving a blank body under a live Continue button. That
 *      is the exact state Apple rejected build 1.0.0(6) over under guideline 2.1(a).
 *      scripts/step-clamp-regression.mjs pins the onboarding instance of this; the lesson runner
 *      had no equivalent guard at all.
 *
 *   4. A FINISHED LESSON MUST DROP ITS POINTER, including on a REPEAT run, which completeLesson
 *      dedupes to a no-op. Otherwise re-opening it skips straight to its last screen.
 *
 * Run `--selftest` to watch every detector below go red against a deliberately broken input. A
 * green run of a lane that cannot fail proves nothing, which is this repo's standing rule.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  clampLessonScreen,
  isResumableScreen,
  lessonShapeSignature,
  resumeScreenFor,
} from '../src/lib/lesson-step-session.ts';

const read = (rel) => readFileSync(new URL(rel, import.meta.url), 'utf8');

const SHAPE = lessonShapeSignature(['prose', 'match', 'choice', 'reveal', 'prose']);
const LESSON = { key: 'personal-finance:3', screens: 5, shape: SHAPE };
const point = (over = {}) => ({ key: LESSON.key, screen: 3, shape: SHAPE, savedAt: 1, ...over });

// ── 1. the shape hash ───────────────────────────────────────────────────────────────────────
function shapeRules() {
  const base = ['prose', 'match', 'choice'];
  return {
    stable: lessonShapeSignature(base) === lessonShapeSignature([...base]),
    lengthChanges: lessonShapeSignature(base) !== lessonShapeSignature([...base, 'reveal']),
    // A retired type removed from the MIDDLE is the real re-sync case: same length is impossible,
    // but a reorder is, and a hash that missed it would restore onto the wrong content.
    orderChanges: lessonShapeSignature(base) !== lessonShapeSignature(['match', 'prose', 'choice']),
    // Separator safety: ['a','b'] and ['a|b'] are different lessons and must not collide.
    noSeparatorCollision: lessonShapeSignature(['a', 'b']) !== lessonShapeSignature(['a|b']),
    isHex: /^[0-9a-f]{8}$/.test(lessonShapeSignature(base)),
  };
}

// ── 2. the clamp ────────────────────────────────────────────────────────────────────────────
function clampRules(clamp) {
  return {
    // 5 content screens, so 7 (the streak screen) is the last addressable index.
    pastEnd: clamp(99, 5) === 7,
    inRange: clamp(3, 5) === 3,
    negative: clamp(-4, 5) === 0,
    // Garbage resolves to the warmup, never to the far end. Clamping NaN or Infinity UP would
    // fling the learner onto the completion celebration of a lesson they never did, the same
    // judgement scripts/step-clamp-regression.mjs pins for onboarding and the paywall.
    nan: clamp(NaN, 5) === 0,
    infinite: clamp(Infinity, 5) === 0,
    fractional: clamp(2.9, 5) === 2,
    emptyLesson: clamp(9, 0) === 2,
  };
}

// ── 3. what the runner may resume onto ──────────────────────────────────────────────────────
function resumeRules(resolve) {
  return {
    restores: resolve(point(), LESSON) === 3,
    noPointer: resolve(null, LESSON) === 0,
    otherLesson: resolve(point({ key: 'investing-fundamentals:3' }), LESSON) === 0,
    // The re-sync case. A shape that no longer matches is not clamped, it is discarded: landing on
    // screen 3 of a lesson whose steps moved is wrong-but-confident, and starting over is
    // plain-but-correct.
    shapeMoved: resolve(point({ shape: 'deadbeef' }), LESSON) === 0,
    // Both terminal screens pay out and must never be restored onto.
    celebration: resolve(point({ screen: 6 }), LESSON) === 0,
    streakScreen: resolve(point({ screen: 7 }), LESSON) === 0,
    pastEnd: resolve(point({ screen: 99 }), LESSON) === 0,
    warmup: resolve(point({ screen: 0 }), LESSON) === 0,
    garbage: resolve(point({ screen: NaN }), LESSON) === 0,
    lastContentScreen: resolve(point({ screen: 5 }), LESSON) === 5,
  };
}

// ── 3b. a corrupt pointer must degrade, never throw ─────────────────────────────────────────
/*
 * WHY THIS LANE EXISTS. The pointer comes back out of AsyncStorage through JSON.parse, so its
 * shape is whatever an older build, an interrupted write or a store migration left behind. It is
 * read on the lesson route's load path, inside a promise `.then()`, where a throw would be an
 * unhandled rejection and the lesson would sit on its skeleton forever. Returning 0 and starting
 * the lesson from the top is the only acceptable failure.
 *
 * The concrete instance this was written for: the build that introduced the mobile deck layer
 * replaces 721 teachingSlide/interactiveGraph steps with `mobileDeck` at load. Counts are
 * unchanged, so the saved index still lines up, but the TYPES at those positions changed, so every
 * pointer written before it is refused here. That is the intended answer, and it must be a
 * returned 0, not an exception.
 */
function safetyRules(resolve) {
  const attempt = (p) => {
    try {
      return resolve(p, LESSON);
    } catch {
      return 'threw';
    }
  };
  return {
    undefinedPointer: attempt(undefined) === 0,
    nullPointer: attempt(null) === 0,
    emptyObject: attempt({}) === 0,
    // A corrupt blob that parsed to a primitive rather than an object.
    stringBlob: attempt('garbage') === 0,
    numberBlob: attempt(7) === 0,
    // Right lesson, right shape, nonsense index.
    stringScreen: attempt(point({ screen: '4' })) === 0,
    nullScreen: attempt(point({ screen: null })) === 0,
    missingShape: attempt({ key: LESSON.key, screen: 3 }) === 0,
    // The mobileDeck upgrade: same lesson, same length, every heavy step retyped.
    retypedCorpus: attempt(point({ shape: lessonShapeSignature(['prose', 'teachingSlide', 'choice', 'reveal', 'prose']) })) === 0,
  };
}

// ── 4. only content screens are written ─────────────────────────────────────────────────────
function writeRules(resumable) {
  return {
    content: resumable(3, 5) === true,
    lastContent: resumable(5, 5) === true,
    warmup: resumable(0, 5) === false,
    celebration: resumable(6, 5) === false,
    streakScreen: resumable(7, 5) === false,
    fractional: resumable(2.5, 5) === false,
  };
}

// ── 5. the wiring, because a pure helper nothing calls protects nothing ─────────────────────
function wiringFindings() {
  const store = read('../src/lib/store.ts');
  const runner = read('../src/app/lesson.tsx');
  const home = read('../src/app/(tabs)/home.tsx');
  const learn = read('../src/app/(tabs)/learn.tsx');
  const start = read('../src/app/start.tsx');
  const out = [];

  if (!/lessonResume: s\.lessonResume/.test(store)) {
    out.push('store: lessonResume is missing from partialize, so the pointer dies with the process');
  }
  if (!/const lessonResume = s\.lessonResume\?\.key === id \? null : s\.lessonResume/.test(store)) {
    out.push('store: completeLesson no longer clears the pointer for the lesson it just credited');
  }
  if (!/if \(s\.completedLessons\.includes\(id\)\) \{\s*\n\s*return lessonResume === s\.lessonResume \? s : \{ lessonResume \};/.test(store)) {
    out.push('store: a REPEAT of a finished lesson returns early without dropping its pointer');
  }
  if (!/lessonResume: null/.test(store)) out.push('store: reset() leaves a pointer behind');

  if (!/resumeScreenFor\(useApp\.getState\(\)\.lessonResume/.test(runner)) {
    out.push('lesson.tsx: the lesson no longer opens on the saved screen');
  }
  if (!/if \(!hasHydrated\) return;/.test(runner)) {
    out.push('lesson.tsx: the restore reads the pointer before rehydration, so it always reads null');
  }
  if (!/const target = clampLessonScreen\(nextIndex, total\);/.test(runner)) {
    out.push('lesson.tsx: openLessonScreen takes an index on trust, so a blank body is reachable');
  }
  if (!/recordResume\(target\)/.test(runner)) out.push('lesson.tsx: screen changes are not persisted');
  if (!/isResumableScreen\(screen, total\)/.test(runner)) {
    out.push('lesson.tsx: recordResume would write a terminal screen, which pays out on reopen');
  }
  if (!/idx > 0 && idx < DONE && challengeStage === 'none'/.test(runner)) {
    out.push('lesson.tsx: Back is offered on the terminal screens, which re-arms the mastery challenge');
  }
  if (!/heartLimited && isChoice && justGraded && checked/.test(runner)) {
    out.push('lesson.tsx: the heart wall fires on restored `checked`, so every past mistake re-walls');
  }

  // All three entry points must answer "which lesson is next" the same way, or a personalised path
  // stops feeling like one. The rule is: the first lesson in course order that is not completed.
  const rule = /!completedLessons\.includes\(lessonKey\(/;
  if (!rule.test(home)) out.push('home.tsx: the hero no longer resolves the first unfinished lesson');
  if (!rule.test(start)) out.push('start.tsx: the first action no longer resolves the first unfinished lesson');
  if (!/const current = doneFlags\.indexOf\(false\);/.test(learn)) {
    out.push('learn.tsx: the current node no longer resolves the first unfinished lesson');
  }
  if (!/const heroVerb = doneInCourse === 0 && !resuming \? 'Start' : 'Continue';/.test(home)) {
    out.push('home.tsx: the hero says Start for a lesson the runner is about to resume');
  }
  return out;
}

function selftest() {
  const bad = (label, obj) => {
    const broken = Object.entries(obj).filter(([, ok]) => !ok).map(([k]) => k);
    if (broken.length) throw new Error(`selftest: ${label} should have passed, failed ${broken.join(', ')}`);
  };
  const catches = (label, obj) => {
    if (Object.values(obj).every(Boolean)) throw new Error(`selftest: ${label} would slip through`);
  };

  // Every rule set must pass against the real implementation and fail against a broken one.
  bad('clamp', clampRules(clampLessonScreen));
  catches('an unclamped index', clampRules((n) => n));
  catches('a clamp that pins garbage to the far end', clampRules((n, c) => (Number.isFinite(n) ? Math.min(Math.trunc(n), c + 2) : c + 2)));
  catches('a clamp with no lower bound', clampRules((n) => (Number.isFinite(n) ? Math.min(Math.trunc(n), 7) : 0)));

  bad('resume', resumeRules(resumeScreenFor));
  catches('a resume that trusts any pointer', resumeRules((p) => p?.screen ?? 0));
  catches('a resume that ignores the shape', resumeRules((p, l) => (p && p.key === l.key && p.screen >= 1 && p.screen <= l.screens ? p.screen : 0)));
  catches('a resume that clamps onto the terminal screens instead of refusing', resumeRules((p, l) => (p && p.key === l.key && p.shape === l.shape ? clampLessonScreen(p.screen, l.screens) : 0)));

  bad('throw safety', safetyRules(resumeScreenFor));
  catches('a resume that reads the pointer without guarding its shape', safetyRules((p, l) => {
    // The naive version: trust whatever parsed out of storage. Every corrupt blob below either
    // throws on property access or sails straight through with a bogus index.
    if (p.key !== l.key) return 0;
    return p.screen;
  }));

  bad('write gate', writeRules(isResumableScreen));
  catches('a write gate that saves the celebration', writeRules((s, c) => s >= 1 && s <= c + 2));

  bad('shape hash', shapeRules());

  // The wiring lane has to be able to go red too. Deleting the clamp from a copy of the runner is
  // the cheapest proof, and it is checked against the string the detector actually greps for.
  const runner = read('../src/app/lesson.tsx');
  if (!runner.includes('const target = clampLessonScreen(nextIndex, total);')) {
    throw new Error('selftest: the wiring detector greps for a string the runner does not contain');
  }
  if (runner.replace('const target = clampLessonScreen(nextIndex, total);', 'const target = nextIndex;')
    .includes('const target = clampLessonScreen(nextIndex, total);')) {
    throw new Error('selftest: removing the clamp did not change the source the detector reads');
  }
  console.log('[lesson-resume-regression] selftest ok, every lane can go red');
}

if (process.argv.includes('--selftest')) {
  selftest();
  process.exit(0);
}

for (const [name, ok] of Object.entries(shapeRules())) assert.ok(ok, `shape hash: ${name}`);
for (const [name, ok] of Object.entries(clampRules(clampLessonScreen))) assert.ok(ok, `clamp: ${name}`);
for (const [name, ok] of Object.entries(resumeRules(resumeScreenFor))) assert.ok(ok, `resume: ${name}`);
for (const [name, ok] of Object.entries(safetyRules(resumeScreenFor))) assert.ok(ok, `throw safety: ${name}`);
for (const [name, ok] of Object.entries(writeRules(isResumableScreen))) assert.ok(ok, `write gate: ${name}`);

const findings = wiringFindings();
if (findings.length) {
  for (const f of findings) console.error(`[lesson-resume-regression] ${f}`);
  process.exit(1);
}

console.log('[lesson-resume-regression] ok, the pointer restores, refuses and clears as specified');
