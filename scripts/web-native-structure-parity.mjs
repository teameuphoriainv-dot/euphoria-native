#!/usr/bin/env node
/**
 * Prove native's lesson structure is a DELIBERATE derivation of the web app's, not an accident.
 *
 * WHAT CHANGED AND WHY THIS SCRIPT DID. This used to assert that native renders the same screens in
 * the same order as web. That is no longer true and is no longer the goal: on iOS every
 * `teachingSlide` and every `interactiveGraph` is replaced by a `mobileDeck` of three or four cards,
 * because the median graph step runs 2,557 authored characters against a phone viewport that holds
 * about 1,000. Deleting this script would have removed the only guard on the thing that still must
 * hold, so it was rewritten to pin the SUBSTITUTION instead of pinning sameness.
 *
 * The invariant now is:
 *   1. same lesson count, same screen count, same order                  (saved progress depends on it)
 *   2. at a position web holds teachingSlide or interactiveGraph, native holds EXACTLY a mobileDeck
 *   3. at every OTHER position, native holds the identical authored step type
 *   4. the number of substitutions is the known corpus census
 * Rule 3 is what stops the mobile layer quietly spreading into step types nobody agreed to change.
 *
 * A BUG THIS REWRITE FIXES. The old version compared `web[i]?.kind` with `native[i]?.kind`. Lesson
 * steps carry `.type`; there is no `.kind` on them. Both sides read `undefined` for all 4,050
 * screens, so `kindMatches === screens` was true by construction and the headline assertion had
 * never tested anything. It is `.type` now, and the counts below prove it can see a difference.
 */
import assert from 'node:assert/strict';

/** The authored corpus, exactly as the web player receives it. */
import { COURSES, loadCourseLessons as loadWeb } from '../src/lib/curriculum/courseIndex.ts';
/** What the iOS app receives, decks and all. */
import { loadCourseLessons as loadNative } from '../src/lib/curriculum/index.ts';
import { expandSteps } from '../src/lib/lesson-steps.ts';

const EXPECTED_LESSONS = 300;
const EXPECTED_SCREENS = 4050;
/** teachingSlide 432 + interactiveGraph 289, measured over the 12 synced courses. */
const EXPECTED_SUBSTITUTIONS = 721;
const SUBSTITUTED = new Set(['teachingSlide', 'interactiveGraph']);

// A GREEN RUN MEANS NOTHING UNLESS THE LANE CAN GO RED.
if (process.argv.includes('--selftest')) {
  const ok = (c, m) => { if (!c) { console.error(`selftest FAILED: ${m}`); process.exit(1); } };
  ok(SUBSTITUTED.has('teachingSlide'), 'teachingSlide must be a substituted type');
  ok(!SUBSTITUTED.has('quiz'), 'quiz must NOT be substituted');
  // The exact shape the old bug hid: comparing a field the objects do not have.
  ok(({ type: 'quiz' }).kind === undefined, 'steps carry .type, not .kind');
  ok(({ type: 'quiz' }).type === 'quiz', 'reading .type must distinguish step types');
  console.log('selftest passed');
  process.exit(0);
}

let lessons = 0, screens = 0, substitutions = 0, identical = 0;
const countDiffs = [], wrongSubstitution = [], unexpectedChange = [];

for (const course of COURSES) {
  const webLessons = await loadWeb(course.id);
  const nativeLessons = await loadNative(course.id);
  assert.equal(webLessons.length, nativeLessons.length, `${course.id} lesson count drifted`);

  for (let li = 0; li < webLessons.length; li += 1) {
    lessons += 1;
    const web = expandSteps(webLessons[li].steps ?? []);
    const native = expandSteps(nativeLessons[li].steps ?? []);
    const title = webLessons[li].title;

    if (web.length !== native.length) {
      countDiffs.push({ course: course.id, title, web: web.length, native: native.length });
    }

    for (let i = 0; i < Math.max(web.length, native.length); i += 1) {
      screens += 1;
      const w = web[i]?.type ?? '(none)';
      const n = native[i]?.type ?? '(none)';

      if (SUBSTITUTED.has(w)) {
        if (n === 'mobileDeck') substitutions += 1;
        else wrongSubstitution.push({ title, index: i, web: w, native: n });
      } else if (w === n) {
        identical += 1;
      } else {
        unexpectedChange.push({ title, index: i, web: w, native: n });
      }
    }
  }
}

console.log('\nWeb/native lesson structure parity');
console.log(`  lessons compared      ${lessons}`);
console.log(`  screens compared      ${screens}`);
console.log(`  substituted to deck   ${substitutions}`);
console.log(`  identical to web      ${identical}`);

const problems = [];
if (lessons !== EXPECTED_LESSONS) problems.push(`expected ${EXPECTED_LESSONS} lessons, walked ${lessons}`);
if (screens !== EXPECTED_SCREENS) problems.push(`expected ${EXPECTED_SCREENS} screens, walked ${screens}`);
if (countDiffs.length) problems.push(`${countDiffs.length} lesson(s) render a different number of screens than web`);
if (substitutions !== EXPECTED_SUBSTITUTIONS) {
  problems.push(`expected ${EXPECTED_SUBSTITUTIONS} deck substitutions, found ${substitutions}`);
}
if (wrongSubstitution.length) problems.push(`${wrongSubstitution.length} heavy step(s) did NOT become a deck`);
if (unexpectedChange.length) problems.push(`${unexpectedChange.length} screen(s) changed type without being a heavy step`);
if (substitutions + identical !== screens) problems.push('every screen must be either substituted or identical');

if (problems.length) {
  console.log('\nFAIL');
  problems.forEach((p) => console.log(`  - ${p}`));
  countDiffs.slice(0, 10).forEach((d) => console.log(`    ${d.course} · ${d.title}: web=${d.web} native=${d.native}`));
  wrongSubstitution.slice(0, 10).forEach((d) => console.log(`    ${d.title} idx ${d.index}: web=${d.web} native=${d.native}`));
  unexpectedChange.slice(0, 10).forEach((d) => console.log(`    ${d.title} idx ${d.index}: web=${d.web} native=${d.native}`));
  process.exit(1);
}
console.log('\nPASS — native substitutes exactly the heavy steps and leaves every other screen alone.\n');
