#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { normalizeStep } from '../src/lib/lesson-steps.ts';

const visual = { type: 'metric', title: 'Growth', value: '2x', detail: 'Example' };
const normalizedVisual = normalizeStep({
  type: 'hookOpener',
  title: 'A visible hook',
  fact: 'The opening fact.',
  outcome: 'The learner outcome.',
  visualDescription: 'A metric card',
  visual,
});

assert.equal(normalizedVisual.kind, 'hook', 'hook openers need a dedicated renderer, not generic prose');
if (normalizedVisual.kind !== 'hook') process.exit(1);
assert.equal(normalizedVisual.spec.visual, visual, 'the authored animated visual must reach the hook stage unchanged');

const rawSvg = '<svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" /></svg>';
const normalizedSvg = normalizeStep({
  type: 'hookOpener',
  title: 'A raw SVG hook',
  fact: 'The opening fact.',
  outcome: 'The learner outcome.',
  visualDescription: 'A circle',
  chartSvg: rawSvg,
});
assert.equal(normalizedSvg.kind, 'hook');
if (normalizedSvg.kind !== 'hook') process.exit(1);
assert.equal(normalizedSvg.spec.chartSvg, rawSvg, 'raw canonical SVG hooks must not disappear during normalization');

const generatedCounts = readFileSync('src/lib/curriculum/stepTypes.generated.ts', 'utf8');
assert.match(generatedCounts, /'hookOpener':\s*300/, 'the dedicated renderer must cover the full 300-hook corpus');

const component = readFileSync('src/components/hook-opener.tsx', 'utf8');
const lesson = readFileSync('src/app/lesson.tsx', 'utf8');

assert.match(component, /useReducedMotion\(\)/, 'translated hook staging must respect Reduced Motion');
assert.match(component, /delay\(250\)/, 'the visual must retain the canonical 250ms entrance delay');
assert.match(component, /delay\(500\)/, 'the outcome must retain the canonical 500ms entrance delay');
assert.match(component, /duration\(600\)/, 'the visual stage must retain the canonical 600ms entrance');
assert.match(component, /AuthoredSvg/, 'the two authored raw-SVG hooks need a real native render path');
assert.match(component, /label="Begin"/, 'the hook must retain the canonical Begin action');
assert.match(lesson, /norm\.kind === 'hook'[\s\S]*?<HookOpener/, 'the lesson viewer must route hooks to the dedicated stage');
assert.match(lesson, /OWN_CTA_STEPS = new Set\(\[[^\]]*'hook'/, 'the generic Continue footer must not stack over Begin');

console.log('hook opener parity: PASS - 300 hooks retain composition, staging, CTA, SVG fallback, and Reduced Motion');
