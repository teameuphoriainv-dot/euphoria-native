#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { COURSES, loadCourseLessons } from '../src/lib/curriculum/courseIndex.ts';
import { normalizeStep } from '../src/lib/lesson-steps.ts';

let lessons = 0;
let steps = 0;
let visuals = 0;
let noVisual = 0;
for (const course of COURSES) {
  for (const lesson of await loadCourseLessons(course.id)) {
    lessons += 1;
    for (const raw of lesson.steps) {
      if (raw.type !== 'stakesCard') continue;
      steps += 1;
      const normalized = normalizeStep(raw);
      assert.equal(normalized.kind, 'stakes', `${course.id} lesson ${String(lesson.num)} flattened its stakes scene`);
      if (normalized.kind !== 'stakes') continue;
      assert.equal(normalized.spec.without.label, raw.without.label);
      assert.equal(normalized.spec.with.label, raw.with.label);
      const count = Number(Boolean(raw.withoutVisual)) + Number(Boolean(raw.withVisual));
      visuals += count;
      if (!count) noVisual += 1;
    }
  }
}

assert.equal(lessons, 300);
assert.equal(steps, 300);
assert.equal(visuals, 596);
assert.equal(noVisual, 2);

// Production does not reuse the panel's bottom takeaway as its heading when an author leaves the
// optional heading blank. Lesson 1 is the canonical live case: the top labels are the comparison
// categories, while "If you leave it in the account" / "If you put it to work" remain at bottom.
const firstLesson = (await loadCourseLessons('investing-fundamentals'))[0];
const firstStakes = firstLesson.steps.find((step) => step.type === 'stakesCard');
assert.ok(firstStakes, 'investing lesson 1 lost its stakes scene');
const firstNormalized = normalizeStep(firstStakes);
assert.equal(firstNormalized.kind, 'stakes');
// An UNAUTHORED heading now renders nothing rather than a generic one. The old fallback headed
// 265 of the 300 cards "Without Investing / With Investing" -- above `Barings Bank, No Risk
// Controls` on Risk Management, above `WeWork: Fake Profitability` on Applied Accounting. The
// authored visual title beneath already names each side and the panel's check/close icon still
// carries the polarity. The invariant this block was written to protect is unchanged and is
// asserted directly below: the bottom takeaway must never be promoted into the heading.
assert.equal(firstNormalized.spec.withoutLabel, '');
assert.equal(firstNormalized.spec.withLabel, '');
assert.notEqual(firstNormalized.spec.withoutLabel, firstStakes.without.label);
assert.notEqual(firstNormalized.spec.withLabel, firstStakes.with.label);

const component = readFileSync('src/components/stakes-card.tsx', 'utf8');
const runner = readFileSync('src/app/lesson.tsx', 'utf8');
assert.match(component, /Why This Matters/, 'scene title must match production capitalization');
assert.match(component, /\{heading \? <ThemedText/, 'panel must omit the heading text when no heading is authored');
/*
 * THE DWELL IS SIX SECONDS ON MOBILE, DELIBERATELY DIFFERENT FROM WEB.
 *
 * This asserted 15 seconds, matching production web. That is the right number on a desktop, where
 * the whole comparison is visible at once and the cursor is already resting on Continue. On a phone
 * a fifteen second greyed-out button reads as a frozen app: Sriyan sent a screenshot of "Continue
 * in 5s" asking for it to be shorter, and by then it had been counting down for ten seconds.
 *
 * The gate is KEPT, only shortened. Removing it entirely would let a learner skim past the diagram,
 * which is the thing it exists to prevent. Six is long enough to force a look and short enough not
 * to read as broken.
 *
 * Pinned to an exact value rather than a range so that changing it stays a decision somebody makes
 * on purpose.
 */
assert.match(component, /DIAGRAM_DWELL_SECONDS = 6;/, 'the mobile diagram dwell must stay at 6 seconds');
assert.match(component, /FadeInLeft\.delay\(300\)/, 'without panel must enter from the left after 300ms');
assert.match(component, /FadeInRight\.delay\(500\)/, 'with panel must enter from the right after 500ms');
assert.match(component, /width >= 1024/, 'phone panels must stack and only become columns at the web lg breakpoint');
assert.match(component, /!spec\.withoutVisual && !spec\.withVisual/, 'details must only show on the two chartless scenes');
assert.match(runner, /norm\.kind === 'stakes'[\s\S]*?<StakesCard/, 'lesson runner must dispatch the stakes scene');
assert.match(runner, /OWN_CTA_STEPS = new Set\(\[[^\]]*'stakes'/, 'generic footer must not cover the dwell CTA');

console.log(`stakes card parity: PASS — ${String(steps)} scenes, ${String(visuals)} visuals, ${String(noVisual)} chartless scenes`);
