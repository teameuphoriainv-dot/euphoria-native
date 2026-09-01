#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { COURSES, loadCourseLessons } from '../src/lib/curriculum/courseIndex.ts';
import { normalizeStep } from '../src/lib/lesson-steps.ts';

let steps = 0;
for (const course of COURSES) {
  for (const lesson of await loadCourseLessons(course.id)) {
    for (const raw of lesson.steps ?? []) {
      if (raw.type !== 'fillBlank') continue;
      steps += 1;
      const normalized = normalizeStep(raw);
      assert.equal(normalized.kind, 'choice');
      assert.equal(normalized.sourceType, 'fillBlank');
      assert.equal(normalized.submitMode, 'confirm');
      assert.match(normalized.prompt, /___/, `${course.id} lesson ${String(lesson.num)} lost its inline blank`);
    }
  }
}

assert.equal(steps, 281, `expected 281 fill-blank steps, found ${String(steps)}`);

const runner = readFileSync('src/app/lesson.tsx', 'utf8');
assert.match(runner, /const isFillBlank = isChoice && norm\.sourceType === 'fillBlank'/);
assert.match(runner, /norm\.prompt\.split\('___'\)/, 'fill blank must render the sentence around an inline answer slot');
assert.match(runner, /styles\.fillBlankOptions/, 'fill blank must use the web two-column option grid');
assert.match(runner, /styles\.fillBlankOptionWrap/, 'each fill-blank option must occupy one grid column');
assert.match(runner, /fillBlankOptionWrap: \{ width: '48%'/, 'fill-blank choices must wrap into a two-column grid on iPhone');
assert.match(runner, /fillBlankSlot: \{[^}]*backgroundColor: 'rgba\(166,80,231,0\.08\)'/, 'an unanswered inline blank must remain visibly outlined and tinted');
assert.match(runner, /isFillBlank \? null : \([\s\S]*?Quick check/, 'fill blank must not gain the generic Quick check label');
assert.match(runner, /isFillBlank && pick !== null[\s\S]*?norm\.options\[pick\]/, 'the selected word must appear inside the sentence blank');
assert.match(runner, /isFillBlank && pick !== null && !checked[\s\S]*?label="Submit"/, 'selection must reveal the web inline Submit action');
assert.match(runner, /fillBlankSubmitButton: \{ width: 134, minHeight: 48 \}/, 'inline Submit must preserve the web large-button geometry');
assert.match(runner, /\|\| isFillBlank \|\| ownsItsCta/, 'fill blank must not gain the pinned generic lesson footer');

console.log(`fill blank parity: PASS — ${String(steps)} inline-blank screens`);
