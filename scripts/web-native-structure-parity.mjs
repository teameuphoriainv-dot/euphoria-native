#!/usr/bin/env node
/**
 * Prove native renders the same screens, in the same order, as the production web app.
 *
 * The web player does no expansion at all -- PathwayLessonViewer renders `lesson.steps` 1:1 and
 * labels progress `${stepIdx + 1}/${lesson.steps.length}`. Native instead runs expandSteps()
 * before rendering. Those two are the ONLY things standing between identical curriculum data and
 * a different on-screen journey, so comparing them directly is exact, offline and exhaustive --
 * strictly better evidence than scraping rendered text out of a browser 300 times.
 *
 * Content parity is a separate axis, covered by `npm run parity:web` against the deployed bundle.
 */
import { COURSES, loadCourseLessons } from '../src/lib/curriculum/courseIndex.ts';
import { expandSteps } from '../src/lib/lesson-steps.ts';

const EXPECTED_LESSONS = 300;
const EXPECTED_SCREENS = 4050;

let lessons = 0, screens = 0, kindMatches = 0;
const countDiffs = [], kindDiffs = [];

for (const course of COURSES) {
  for (const lesson of await loadCourseLessons(course.id)) {
    lessons += 1;
    const web = lesson.steps ?? [];            // exactly what the web player renders
    const native = expandSteps(web);           // exactly what native renders
    if (web.length !== native.length) {
      countDiffs.push({ course: course.id, title: lesson.title, web: web.length, native: native.length });
    }
    for (let i = 0; i < Math.max(web.length, native.length); i += 1) {
      screens += 1;
      const w = web[i]?.kind ?? '(none)';
      const n = native[i]?.kind ?? '(none)';
      if (w === n) kindMatches += 1;
      else if (kindDiffs.length < 20) kindDiffs.push({ title: lesson.title, index: i, web: w, native: n });
    }
  }
}

console.log('\nWeb/native lesson structure parity');
console.log(`  lessons compared   ${lessons}`);
console.log(`  screens compared   ${screens}`);
console.log(`  step-kind matches  ${kindMatches}/${screens}`);

const problems = [];
if (lessons !== EXPECTED_LESSONS) problems.push(`expected ${EXPECTED_LESSONS} lessons, walked ${lessons}`);
if (screens !== EXPECTED_SCREENS) problems.push(`expected ${EXPECTED_SCREENS} screens, walked ${screens}`);
if (countDiffs.length) problems.push(`${countDiffs.length} lesson(s) render a different number of screens than the web`);
if (kindMatches !== screens) problems.push(`${screens - kindMatches} screen(s) differ in step kind`);

if (problems.length) {
  console.log('\nFAIL');
  problems.forEach((p) => console.log(`  - ${p}`));
  countDiffs.slice(0, 10).forEach((d) => console.log(`    ${d.course} · ${d.title}: web=${d.web} native=${d.native}`));
  kindDiffs.forEach((d) => console.log(`    ${d.title} idx ${d.index}: web=${d.web} native=${d.native}`));
  process.exit(1);
}
console.log('\nPASS — every screen matches the web player by index and step kind.\n');
