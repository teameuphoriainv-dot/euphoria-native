#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

/*
 * TWO LOADERS, ON PURPOSE.
 *
 * `./curriculum/index.ts` is what the APP sees: on iOS it has already replaced every teachingSlide
 * and interactiveGraph with a mobileDeck (see withMobileDecks there). `./curriculum/courseIndex.ts`
 * is the untransformed authored corpus.
 *
 * The census has to be taken on the AUTHORED corpus. Taking it on the transformed one made this
 * script report 6 authored SVGs instead of 11, because five of them live on steps that are now
 * decks -- which reads as "the census changed" when what actually changed is where they are stored.
 * Counting authored on web and rendered on native is what makes the comparison mean "native loses
 * nothing" rather than "native and native agree".
 */
import { COURSES, loadCourseLessons } from '../src/lib/curriculum/index.ts';
import { loadCourseLessons as loadWebLessons } from '../src/lib/curriculum/courseIndex.ts';
import { expandSteps, normalizeStep } from '../src/lib/lesson-steps.ts';

/*
 * `stakesSvg` ADDED and the census RE-TAKEN on 2026-09-30: the `stakesCard` step was retired at the
 * loader (courseIndex.ts). Its "with" SVG is folded onto the next teaching slide as `stakesSvg`
 * and reaches the phone as a deck chart card; its "without" SVG is gone by the owner's decision.
 * The two SVG-bearing stakes cards therefore give up one each: 11 -> 9.
 */
const RAW_FIELDS = ['chartSvg', 'diagramSvg', 'withoutSvg', 'withSvg', 'stakesSvg'];
let authored = 0;
let rendered = 0;
const missing = [];

// Pass 1: the census, over the AUTHORED corpus.
for (const course of COURSES) {
  for (const lesson of await loadWebLessons(course.id)) {
    for (const step of expandSteps(lesson.steps)) {
      authored += RAW_FIELDS.filter((f) => typeof step[f] === 'string' && step[f].trim()).length;
    }
  }
}

// Pass 2: what the app actually renders.
for (const course of COURSES) {
  for (const lesson of await loadCourseLessons(course.id)) {
    for (const step of expandSteps(lesson.steps)) {
      /*
       * A deck holds its source step's authored SVG on a chart card. Its own `type` carries none of
       * the RAW_FIELDS, so without this branch every SVG that moved into a deck reads as lost.
       */
      if (step.type === 'mobileDeck') {
        const kept = (step.cards ?? []).filter(
          (c) => c.kind === 'chart' && typeof c.svg === 'string' && c.svg.trim(),
        ).length;
        rendered += kept;
        continue;
      }

      const expected = RAW_FIELDS.filter((field) => typeof step[field] === 'string' && step[field].trim()).length;
      if (expected === 0) continue;

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

assert.equal(authored, 9, 'the canonical raw-SVG census changed; inspect the new authored family before updating');
assert.deepEqual(missing, [], `raw SVGs disappeared during normalization:\n${missing.join('\n')}`);
assert.equal(rendered, authored, 'every authored raw SVG must reach a native renderable shape');

const component = readFileSync('src/components/authored-svg.tsx', 'utf8');
assert.match(component, /SvgXml/, 'authored SVG markup needs a real react-native-svg renderer');
assert.match(component, /accessibilityRole="image"/, 'raw SVG meaning must remain available to VoiceOver');
assert.match(component, /aspectRatio/, 'raw SVGs must preserve their authored viewBox geometry');

console.log(`raw SVG parity: PASS - ${String(rendered)}/${String(authored)} authored charts reach the native UI`);
