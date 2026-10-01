#!/usr/bin/env node

import { deepStrictEqual, match, strictEqual } from 'node:assert';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = new URL('..', import.meta.url).pathname;
const source = await readFile(join(ROOT, 'src/components/lesson-visual.tsx'), 'utf8');
const { COURSES, loadCourseLessons } = await import(pathToFileURL(join(ROOT, 'src/lib/curriculum/courseIndex.ts')).href);
const { visualRows } = await import(pathToFileURL(join(ROOT, 'src/lib/lesson-steps.ts')).href);

/*
 * `stakesVisual` ADDED, and every count below RE-MEASURED, on 2026-09-30: the `stakesCard` step
 * was retired at the loader (courseIndex.ts) and its "with" visual folded onto the next teaching
 * slide under that key, where the phone shows it as a chart card. Its "without" visual is gone by
 * the owner's decision, so the corpus lost those 300 (and the two stakes cards with no visual at
 * all): header sprites 491 -> 390, interactive visuals 822 -> 692, explanation targets 3322 -> 2846.
 */
const VISUAL_KEYS = ['visual', 'diagramVisual', 'withVisual', 'withoutVisual', 'stakesVisual'];
const expectedHeadersByType = {
  bars: 48,
  pie: 2,
  flow: 230,
  comparison: 6,
  stack: 1,
  grid: 100,
  line: 3,
};
const headersByType = Object.fromEntries(Object.keys(expectedHeadersByType).map((type) => [type, 0]));
let interactiveVisuals = 0;
let explanationTargets = 0;

for (const course of COURSES) {
  for (const lesson of await loadCourseLessons(course.id)) {
    for (const step of lesson.steps ?? []) {
      for (const key of VISUAL_KEYS) {
        const visual = step?.[key];
        if (!visual?.type) continue;
        const rows = visualRows(visual);
        const targets = rows.filter((row) => typeof row?.explain === 'string' && row.explain.trim().length > 0).length;
        if (targets > 0) interactiveVisuals += 1;
        explanationTargets += targets;
        if (typeof visual.sprite === 'string' && visual.sprite.trim() && Object.hasOwn(headersByType, visual.type)) {
          headersByType[visual.type] += 1;
        }
      }
    }
  }
}

deepStrictEqual(headersByType, expectedHeadersByType, 'live-49e visual header-sprite corpus drifted');
strictEqual(Object.values(headersByType).reduce((sum, count) => sum + count, 0), 390, 'supported header-sprite total drifted');
strictEqual(headersByType.pie + headersByType.comparison + headersByType.stack + headersByType.line, 12, 'newly recovered header-sprite total drifted');
strictEqual(interactiveVisuals, 692, 'interactive visual count drifted');
strictEqual(explanationTargets, 2846, 'visual explanation target count drifted');

match(
  source,
  /const HEADER_SPRITE_TYPES = new Set\(\['bars', 'pie', 'flow', 'comparison', 'stack', 'grid', 'line'\]\);/,
  'native header renderer does not cover every live-49e sprite-bearing visual family',
);
match(source, /<VisualHeaderMark id=\{v\.sprite\} \/>/, 'supported visuals do not render the shared animated header mark');
match(source, /key=\{`visual-atlas-\$\{String\(openRow\)\}`\}/, 'Atlas explanation is not keyed to the selected visual row');

const atlasBlock = source.match(/function VisualAtlasExplanation\([\s\S]*?\n}\n\n/)?.[0] ?? '';
match(atlasBlock, /entering=\{entering\}/, 'Atlas explanation lost its entrance animation');
match(atlasBlock, /exiting=\{exiting\}/, 'Atlas explanation lost its exit animation');
match(atlasBlock, /translateY: 8/, 'Atlas explanation entrance no longer matches the live-49e eight-point offset');
match(atlasBlock, /translateY: 4/, 'Atlas explanation exit no longer matches the live-49e four-point offset');
match(atlasBlock, /stiffness\(400\)[\s\S]*?damping\(28\)/, 'Atlas explanation lost the live-49e spring');
match(atlasBlock, /reduced \? FadeIn\.duration\(0\)/, 'Atlas explanation entrance does not honor Reduced Motion');
match(atlasBlock, /reduced \? FadeOut\.duration\(0\)/, 'Atlas explanation exit does not honor Reduced Motion');
match(atlasBlock, /collapsable=\{false\}/, 'Atlas explanation exit is vulnerable to native view flattening');
match(atlasBlock, /styles\.explainTail/, 'Atlas explanation bubble lost the web speech tail');
match(source, /explain: \{[^}]*backgroundColor: '#14121C'[^}]*borderColor: 'rgba\(255,255,255,0\.12\)'/, 'Atlas explanation bubble surface or border drifted from web');

console.log('lesson visual explanation regression: PASS — 822 visuals, 3,322 targets, 491 header sprites');
