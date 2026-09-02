#!/usr/bin/env node
/**
 * WHITE TEXT ON EVERY COURSE'S HERO BLOCK MUST CLEAR WCAG AA.
 *
 * Home's next-lesson card became a solid block filled with the course accent on 2026-09-02. The
 * accents in course-accents.ts are Tailwind-400 pastels that were chosen as tints and borders on
 * a dark card; used raw as a fill, white text fails contrast on ALL TWELVE (the amber is 1.67:1).
 * courseHeroFill darkens them by HERO_DEEP..HERO_LIFT, and those two numbers are the guarantee.
 *
 * This pin re-measures rather than trusting the comment, because the failure is one nobody sees:
 * the active course on the dev simulator has been Risk Management (red, which passes easily at
 * every darkening) for the whole build, and a pastel added for a thirteenth course, or an accent
 * "brightened a little", would ship a card whose title is unreadable for the users who happen to
 * pick that course and never for the person who edited it.
 *
 * Both gradient ends are checked. A gradient can hide a failing stop at one edge while the other
 * passes, and a title can sit on either edge depending on its length.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const src = readFileSync(new URL('../src/lib/course-accents.ts', import.meta.url), 'utf8');

const accents = [...src.matchAll(/'([a-z-]+)':\s*'(#[0-9A-Fa-f]{6})'/g)].map((m) => [m[1], m[2]]);
assert.ok(accents.length >= 12, `expected at least 12 course accents, found ${String(accents.length)}`);

const deep = Number(/export const HERO_DEEP = ([0-9.]+);/.exec(src)?.[1]);
const lift = Number(/export const HERO_LIFT = ([0-9.]+);/.exec(src)?.[1]);
assert.ok(Number.isFinite(deep) && Number.isFinite(lift), 'HERO_DEEP / HERO_LIFT are gone from course-accents.ts');
assert.ok(deep >= lift, 'HERO_DEEP must darken at least as much as HERO_LIFT');

// Same maths as the source, on purpose: the pin must measure what the app paints.
const shade = (hex, amount) => {
  const v = hex.slice(1);
  const f = 1 - amount;
  const ch = (o) => Math.round(parseInt(v.slice(o, o + 2), 16) * f).toString(16).padStart(2, '0');
  return `#${ch(0)}${ch(2)}${ch(4)}`;
};
const lum = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const contrastVsWhite = (hex) => 1.05 / (lum(hex) + 0.05);

const AA = 4.5;
const failures = [];
let worst = Infinity;
for (const [id, hex] of accents) {
  for (const [label, amt] of [['deep', deep], ['lift', lift]]) {
    const ratio = contrastVsWhite(shade(hex, amt));
    worst = Math.min(worst, ratio);
    if (ratio < AA) failures.push(`${id} ${label} stop ${shade(hex, amt)} is ${ratio.toFixed(2)}:1 against white`);
  }
}

assert.equal(failures.length, 0,
  `white text fails AA on a course hero block:\n  ${failures.join('\n  ')}\n` +
  `raise HERO_DEEP/HERO_LIFT in course-accents.ts or darken the accent`);

console.log(`PASS — white text clears ${String(AA)}:1 on both stops of all ${String(accents.length)} course hero blocks (worst ${worst.toFixed(2)}:1)`);
