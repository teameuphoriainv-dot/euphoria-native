#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { COURSES, loadCourseLessons } from '../src/lib/curriculum/index.ts';
import { expandSteps, normalizeStep } from '../src/lib/lesson-steps.ts';

const RAW_FIELDS = ['chartSvg', 'diagramSvg', 'withoutSvg', 'withSvg'];
let authored = 0;
let rendered = 0;
const missing = [];

for (const course of COURSES) {
  for (const lesson of await loadCourseLessons(course.id)) {
    for (const step of expandSteps(lesson.steps)) {
      const expected = RAW_FIELDS.filter((field) => typeof step[field] === 'string' && step[field].trim()).length;
      if (expected === 0) continue;
      authored += expected;

      const normalized = normalizeStep(step);
      let observed = 0;
      if (normalized.kind === 'hook' && normalized.spec.chartSvg) observed += 1;
      if (normalized.kind === 'stakes') {
        if (normalized.spec.withoutSvg) observed += 1;
        if (normalized.spec.withSvg) observed += 1;
      }
      if (normalized.kind === 'teaching' && normalized.spec.diagramSvg) observed += 1;
      if (normalized.kind === 'prose') {
        for (const block of normalized.blocks) {
          if (block.b === 'svg' && block.xml) observed += 1;
          if (block.b === 'pair') {
            if (block.leftSvg) observed += 1;
            if (block.rightSvg) observed += 1;
          }
        }
      }
      rendered += observed;
      if (observed !== expected) {
        missing.push(`${course.id} L${String(lesson.num)} ${step.type}: ${String(observed)}/${String(expected)}`);
      }
    }
  }
}

assert.equal(authored, 11, 'the canonical raw-SVG census changed; inspect the new authored family before updating');
assert.deepEqual(missing, [], `raw SVGs disappeared during normalization:\n${missing.join('\n')}`);
assert.equal(rendered, authored, 'every authored raw SVG must reach a native renderable shape');

const component = readFileSync('src/components/authored-svg.tsx', 'utf8');
assert.match(component, /SvgXml/, 'authored SVG markup needs a real react-native-svg renderer');
assert.match(component, /accessibilityRole="image"/, 'raw SVG meaning must remain available to VoiceOver');
assert.match(component, /aspectRatio/, 'raw SVGs must preserve their authored viewBox geometry');

console.log(`raw SVG parity: PASS - ${String(rendered)}/${String(authored)} authored charts reach the native UI`);
