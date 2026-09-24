/**
 * slider-unit-format-pin: every slider value reads the way a person writes it.
 *   node --import ./scripts/ts-resolve-hooks.mjs scripts/slider-unit-format-pin.mjs
 *
 * WHY. The slider formatter glued the unit onto the number, so the rule-of-72 slider in
 * investing-fundamentals:3 showed "15years" and every "$" slider showed "15$" (owner screenshot,
 * 2026-09-22). This checks the fixture table AND every slider unit the corpus actually ships.
 */
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = new URL('..', import.meta.url).pathname;
const imp = (p) => import(pathToFileURL(join(ROOT, p)).href);
const { formatSliderValue } = await imp('src/lib/lesson-steps.ts');
const raw = await imp('src/lib/curriculum/courseIndex.ts');

const failures = [];
const CASES = [
  ['', '15'], ['years', '15 years'], [' years', '15 years'], ['%', '15%'], ['$', '$15'], ['$M', '$15M'],
  ['$ trillion', '$15 trillion'], ['$/ton', '$15/ton'], ['x', '15x'], ['×', '15×'], [':1', '15:1'],
  [':1 leverage', '15:1 leverage'], ['B', '15B'], ['M dollars', '15M dollars'], ['x annual income', '15x annual income'],
  ['bps', '15 bps'], ['VIX', '15 VIX'], ['percentage points', '15 percentage points'], ['cent', '15 cent'],
];
for (const [unit, want] of CASES) {
  const got = formatSliderValue(15, unit);
  if (got !== want) failures.push(`unit ${JSON.stringify(unit)}: got "${got}", want "${want}"`);
}

let seen = 0;
for (const c of raw.COURSES) {
  for (const l of await raw.loadCourseLessons(c.id)) {
    for (const s of l.steps) {
      if (s.type !== 'slider') continue;
      seen++;
      const out = formatSliderValue(s.correct ?? 0, s.unit ?? '');
      if (/\d[A-Za-z]{2,}/.test(out) && !/^\d+(?:[xBMK])\s/.test(out)) failures.push(`${c.id}:${l.num} "${out}" glues a word to its number`);
      if (/\d\$/.test(out)) failures.push(`${c.id}:${l.num} "${out}" puts the dollar sign after the number`);
    }
  }
}
if (seen < 150) failures.push(`only ${seen} slider steps seen; the loader is not reading the corpus`);

if (failures.length) {
  console.error(`slider-unit-format-pin: ${failures.length} failure(s)`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`slider-unit-format-pin: ok (${CASES.length} fixtures, ${seen} corpus sliders)`);
