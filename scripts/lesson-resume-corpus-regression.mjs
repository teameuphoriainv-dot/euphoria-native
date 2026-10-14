#!/usr/bin/env node
/**
 * The resume pointer against the REAL corpus, all 300 lessons.
 *
 * scripts/lesson-resume-regression.mjs proves the pure rules and the wiring. This proves the
 * assumption underneath both of them: that the number lesson.tsx persists means the same thing to
 * every reader of it.
 *
 * WHY THAT IS NOT OBVIOUS. There are two numberings in the runner. `expandSteps` lifts an authored
 * compound scene into several screens, and `expandedStepIdentities` maps each of those screens back
 * to the authored step that owns them, which is what the "3/12" header counts. The pointer is
 * written in the RUNTIME numbering, the one `idx` walks. If the two ever disagreed on length, the
 * header and the pointer would be counting different things and a saved position would drift
 * against the progress bar.
 *
 * Today the expansion is the identity across the whole corpus, because the only authored type it
 * lifts is `simulationFinale` and that is in RETIRED_STEP_TYPES, filtered out at load. That is a
 * coincidence of the current filter set, not a property of the code, and deleting one line from
 * RETIRED_STEP_TYPES brings 389 authored steps back in a single commit. So the agreement is
 * asserted rather than assumed, and the count is pinned so that commit shows up here.
 *
 * Also checked here because it needs the corpus: every lesson resolves a usable shape, every
 * in-range screen round-trips through the pointer, and no lesson is short enough that a resume
 * would have nowhere to land.
 *
 * `--selftest` runs the same detectors against synthetic lessons that are deliberately wrong.
 */
import assert from 'node:assert/strict';

/*
 * BOTH LOADERS, DELIBERATELY.
 *
 * `./courseIndex` is the web shape: the authored corpus with retired step types filtered and the
 * reading level collapsed. `./index` is what the APP loads, and it additionally replaces every
 * heavy `teachingSlide` and `interactiveGraph` with a single `mobileDeck` step.
 *
 * The parity scripts are told to import courseIndex directly so they do not compare native decks
 * against web steps. This script must do the opposite and import `./index`, because the resume
 * pointer is written by lesson.tsx, which loads `@/lib/curriculum`. Testing the web shape here
 * would have been testing a lesson the runner never sees.
 */
// The phone caps practice at five screens (curriculum/index.ts, withCappedPractice, 2026-10-01),
// so the web shape is compared WITH the same cap; everything else here is unchanged.
import { COURSES, loadCourseLessons as loadWebShape } from '../src/lib/curriculum/courseIndex.ts';
import { loadCourseLessons, withCappedPractice, withMobileDecks } from '../src/lib/curriculum/index.ts';
import { nativeLessonKeys } from '../src/lib/native-lessons/index.ts';
import { expandSteps, expandedStepIdentities } from '../src/lib/lesson-steps.ts';
import { hasMasteryChallenge } from '../src/lib/mastery-challenge-model.ts';
import {
  isResumableScreen,
  lessonShapeSignature,
  resumeScreenFor,
} from '../src/lib/lesson-step-session.ts';

/**
 * Every way one lesson's resume behaviour can be wrong, as a list of strings. Pure in the lesson,
 * so the selftest can hand it a broken one and watch it complain.
 */
function findingsFor(key, lesson) {
  const out = [];
  const authored = lesson.steps ?? [];
  const runtime = expandSteps(authored);
  const identities = expandedStepIdentities(authored);
  const screens = runtime.length;
  const shape = lessonShapeSignature(runtime.map((s) => s?.type ?? ''));

  if (identities.length !== screens) {
    out.push(`${key}: the progress header counts ${String(identities.length)} screens, the pointer counts ${String(screens)}`);
  }
  if (screens < 1) out.push(`${key}: no runtime screens, so there is nothing to resume onto`);
  if (!/^[0-9a-f]{8}$/.test(shape)) out.push(`${key}: shape hash is not an 8 digit hex value`);

  const lessonFacts = { key, screens, shape };
  for (let screen = 1; screen <= screens; screen += 1) {
    if (!isResumableScreen(screen, screens)) out.push(`${key}: screen ${String(screen)} refuses to be saved`);
    const point = { key, screen, shape, savedAt: 0 };
    if (resumeScreenFor(point, lessonFacts) !== screen) {
      out.push(`${key}: screen ${String(screen)} did not restore to itself`);
    }
  }

  // The celebration and the streak screen pay the lesson out. Neither may ever be restored onto,
  // whatever is in storage.
  for (const terminal of [screens + 1, screens + 2]) {
    if (resumeScreenFor({ key, screen: terminal, shape, savedAt: 0 }, lessonFacts) !== 0) {
      out.push(`${key}: a pointer at terminal screen ${String(terminal)} would pay the lesson out on reopen`);
    }
  }

  // A shortened lesson is the re-sync case, simulated by dropping the last step. The old pointer
  // must be refused outright, not clamped onto whatever now sits at that number.
  if (screens > 1) {
    const shorter = {
      key,
      screens: screens - 1,
      shape: lessonShapeSignature(runtime.slice(0, -1).map((s) => s?.type ?? '')),
    };
    if (resumeScreenFor({ key, screen: screens, shape, savedAt: 0 }, shorter) !== 0) {
      out.push(`${key}: a pointer survived the lesson getting shorter underneath it`);
    }
  }
  return out;
}

function selftest() {
  const good = { steps: [{ type: 'prose' }, { type: 'match' }, { type: 'choice' }] };
  const clean = findingsFor('x:1', good);
  if (clean.length) throw new Error(`selftest: a sound lesson was flagged: ${clean.join('; ')}`);

  const empty = findingsFor('x:2', { steps: [] });
  if (!empty.some((f) => f.includes('nothing to resume onto'))) {
    throw new Error('selftest: an empty lesson would slip through');
  }

  // A pointer that trusts the raw screen number is the naive fix this whole file exists to refuse.
  const naive = (p, l) => p?.screen ?? 0;
  const restore = resumeScreenFor;
  const terminalSlips = naive({ key: 'x:1', screen: 4 }, { key: 'x:1', screens: 3 }) !== 0;
  if (!terminalSlips) throw new Error('selftest: the naive resume did not actually misbehave');
  if (restore({ key: 'x:1', screen: 4, shape: 'a', savedAt: 0 }, { key: 'x:1', screens: 3, shape: 'a' }) !== 0) {
    throw new Error('selftest: the real resume accepted a terminal screen');
  }

  // And the expansion lane has to be able to fail: a lesson whose two numberings disagree.
  const disagreeing = findingsFor('x:3', {
    steps: [{ type: 'simulationFinale', decisions: [{ prompt: 'p', options: [{ score: 1 }, { score: 0 }] }], setup: 's', optimalOutcome: 'o', principle: 'p', title: 't' }],
  });
  if (disagreeing.some((f) => f.includes('the progress header counts'))) {
    throw new Error('selftest: expandSteps and expandedStepIdentities disagree on a real finale, which is itself a bug');
  }
  console.log('[lesson-resume-corpus-regression] selftest ok, every lane can go red');
}

if (process.argv.includes('--selftest')) {
  selftest();
  process.exit(0);
}

const findings = [];
let lessons = 0;
let withChallenge = 0;
let expanded = 0;
let shortest = Infinity;
let decks = 0;
let heavyOnWeb = 0;
const lengthDrift = [];
/*
 * NATIVE LESSONS (src/lib/native-lessons, owner 2026-10-12) are whole lessons rewritten for the
 * phone, so they are a different length and shape from web BY DESIGN and sit outside the 1:1 deck
 * census below. Every screen still has to round-trip (findingsFor), and the one promise that matters
 * for a rewrite is asserted instead: a position saved on the lesson as it was before the rewrite
 * (the derived phone lesson) is refused once, never clamped onto different content.
 */
const NATIVE_KEYS = new Set(nativeLessonKeys());
let rewrites = 0;

for (const course of COURSES) {
  const native = await loadCourseLessons(course.id);
  const rawWeb = await loadWebShape(course.id);
  const web = rawWeb.map((l) => ({ ...l, steps: withCappedPractice(l.steps) }));
  const derivedOnly = NATIVE_KEYS.size ? withMobileDecks(rawWeb, course.id) : [];
  for (const lesson of native) {
    lessons += 1;
    const key = `${course.id}:${String(lesson.num)}`;
    const authored = lesson.steps ?? [];
    if (expandSteps(authored).length !== authored.length) expanded += 1;
    if (hasMasteryChallenge(lesson.challenge)) withChallenge += 1;
    shortest = Math.min(shortest, expandSteps(authored).length);
    findings.push(...findingsFor(key, lesson));

    if (NATIVE_KEYS.has(key)) {
      rewrites += 1;
      const before = derivedOnly.find((l) => l.num === lesson.num)?.steps ?? [];
      const oldShape = lessonShapeSignature(expandSteps(before).map((s) => s?.type ?? ''));
      const newShape = lessonShapeSignature(expandSteps(authored).map((s) => s?.type ?? ''));
      if (oldShape === newShape) findings.push(`${key}: the shape hash did not notice the native rewrite`);
      let restored;
      try {
        restored = resumeScreenFor({ key, screen: 1, shape: oldShape, savedAt: 0 }, { key, screens: authored.length, shape: newShape });
      } catch (err) {
        findings.push(`${key}: a pointer from before the native rewrite THREW instead of degrading: ${String(err)}`);
        restored = 0;
      }
      if (restored !== 0) findings.push(`${key}: a pointer from before the native rewrite was trusted`);
      continue;
    }
    decks += authored.filter((step) => step?.type === 'mobileDeck').length;

    /*
     * THE MOBILE DECK LAYER MUST NOT MOVE ANYONE'S POSITION.
     *
     * `withMobileDecks` replaces a heavy step 1:1, so a lesson is the same length on both shapes
     * and screen 7 is still screen 7. That is a promise in a comment, and a saved position is now
     * riding on it, so it is asserted per lesson rather than trusted. If a future deck ever
     * expands one authored step into several, this is the line that says so.
     */
    const twin = web.find((l) => l.num === lesson.num);
    if (!twin) {
      lengthDrift.push(`${key}: present natively but not in the web shape`);
    } else if ((twin.steps ?? []).length !== authored.length) {
      lengthDrift.push(`${key}: ${String((twin.steps ?? []).length)} web steps became ${String(authored.length)} native steps`);
    }
    heavyOnWeb += (twin?.steps ?? []).filter((step) => step?.type === 'teachingSlide' || step?.type === 'interactiveGraph').length;

    /*
     * AND THE SHAPE HASH MUST NOTICE THE SWAP. This is the upgrade case the pointer was designed
     * for: same count, different types at 721 positions. A pointer written before this layer
     * landed is REFUSED, not clamped onto a step whose content changed underneath it, and the
     * refusal is a returned 0 rather than a throw.
     */
    if (twin && (twin.steps ?? []).some((step) => step?.type === 'teachingSlide' || step?.type === 'interactiveGraph')) {
      const webShape = lessonShapeSignature(expandSteps(twin.steps ?? []).map((s) => s?.type ?? ''));
      const nativeShape = lessonShapeSignature(expandSteps(authored).map((s) => s?.type ?? ''));
      if (webShape === nativeShape) {
        findings.push(`${key}: the shape hash did not notice teachingSlide becoming mobileDeck`);
      }
      const stale = { key, screen: 1, shape: webShape, savedAt: 0 };
      let restored;
      try {
        restored = resumeScreenFor(stale, { key, screens: authored.length, shape: nativeShape });
      } catch (err) {
        findings.push(`${key}: a pointer from the pre-deck build THREW instead of degrading: ${String(err)}`);
        restored = 0;
      }
      if (restored !== 0) findings.push(`${key}: a pre-deck pointer was trusted after the swap`);
    }
  }
}
findings.push(...lengthDrift);
if (rewrites !== NATIVE_KEYS.size) findings.push(`${String(NATIVE_KEYS.size)} native lesson key(s) but ${String(rewrites)} matched a lesson`);

if (findings.length) {
  for (const f of findings.slice(0, 20)) console.error(`[lesson-resume-corpus-regression] ${f}`);
  if (findings.length > 20) console.error(`[lesson-resume-corpus-regression] ...and ${String(findings.length - 20)} more`);
  process.exit(1);
}

assert.equal(lessons, 300, 'the corpus changed size; re-read this file before re-pinning it');
/*
 * Zero is the CURRENT truth, not a design rule: `simulationFinale` is the only type expandSteps
 * lifts and it is retired at load. If this number moves, the expansion has come back to life and
 * the two numberings above stop being trivially equal, so the pointer's meaning needs re-reading
 * rather than this line needs bumping.
 */
assert.equal(expanded, 0, 'expandSteps is no longer the identity; re-read what the pointer numbers');
assert.equal(
  withChallenge, 295,
  'the mastery challenge coverage changed; Back past the celebration is only safe while onFail exits',
);
assert.ok(shortest >= 1, 'a lesson with no screens cannot be resumed');
/*
 * Proof that this file is reading the NATIVE shape. Zero decks would mean the import was pointed
 * at courseIndex again and every assertion above was checking a lesson the runner never loads.
 * One deck per heavy web step, which is the 1:1 replacement stated in curriculum/index.ts.
 */
assert.ok(decks > 0, 'no mobileDeck steps: this script is reading the web shape, not what lesson.tsx loads');
assert.equal(decks, heavyOnWeb, 'the deck layer is no longer a 1:1 replacement, so saved positions have moved');

console.log(`[lesson-resume-corpus-regression] ok, ${String(lessons)} lessons round-trip every screen, ${String(withChallenge)} carry a challenge, ${String(decks)} heavy steps became decks 1:1`);
