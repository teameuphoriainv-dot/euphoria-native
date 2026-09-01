#!/usr/bin/env node
/**
 * Prove that rewritten web-only lesson affordances survive native normalization.
 *
 * Semantic parity proves the authored objects are identical. This audit proves the native lesson
 * runner does not then discard the fields that make the rewritten lesson type work: visual row
 * explanations, visual sprites, rich reveal-card metadata, and teaching-slide Atlas guidance.
 */
import { deepStrictEqual, strictEqual } from 'node:assert';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = new URL('..', import.meta.url).pathname;
const { COURSES, loadCourseLessons } = await import(pathToFileURL(join(ROOT, 'src/lib/curriculum/courseIndex.ts')).href);
const { normalizeStep, visualRows } = await import(pathToFileURL(join(ROOT, 'src/lib/lesson-steps.ts')).href);

deepStrictEqual(visualRows({ type: 'bars', items: [{ label: 'one' }] }), [{ label: 'one' }]);
deepStrictEqual(visualRows({ type: 'flow', nodes: [{ label: 'two' }] }), [{ label: 'two' }]);
deepStrictEqual(visualRows({ type: 'metric', value: '3' }), []);

const VISUAL_KEYS = ['visual', 'diagramVisual', 'withVisual', 'withoutVisual'];
let lessons = 0;
let visuals = 0;
let explanations = 0;
let visualSprites = 0;
let rowSprites = 0;
let revealCards = 0;
let revealStats = 0;
let revealSprites = 0;
let atlasGuides = 0;

for (const course of COURSES) {
  for (const lesson of await loadCourseLessons(course.id)) {
    lessons += 1;
    for (const raw of lesson.steps) {
      const normalized = normalizeStep(raw);

      for (const key of VISUAL_KEYS) {
        const visual = raw?.[key];
        if (!visual?.type) continue;
        visuals += 1;
        if (visual.sprite) visualSprites += 1;
        const rows = visualRows(visual);
        explanations += rows.filter((row) => typeof row.explain === 'string' && row.explain.trim()).length;
        rowSprites += rows.filter((row) => typeof row.sprite === 'string' && row.sprite.trim()).length;

        const reached = (normalized.kind === 'hook' && normalized.spec.visual === visual)
          || (normalized.kind === 'stakes' && (normalized.spec.withoutVisual === visual || normalized.spec.withVisual === visual))
          || (normalized.kind === 'teaching' && normalized.spec.diagramVisual === visual)
          || (normalized.kind === 'prose' && normalized.blocks.some((block) =>
            (block.b === 'visual' && block.visual === visual)
            || (block.b === 'pair' && (block.leftVisual === visual || block.rightVisual === visual)),
          ));
        strictEqual(reached, true, `${course.id} lesson ${lesson.num}: ${raw.type}.${key} did not reach native UI`);
      }

      if (raw.type === 'tapReveal') {
        strictEqual(normalized.kind, 'reveal', `${course.id} lesson ${lesson.num}: tapReveal changed kind`);
        const expected = raw.cards.map(([term, def, meta]) => ({
          term,
          def,
          ...(meta?.stat ? { stat: meta.stat } : {}),
          ...(meta?.sprite ? { sprite: meta.sprite } : {}),
        }));
        deepStrictEqual(normalized.spec.cards, expected, `${course.id} lesson ${lesson.num}: reveal metadata changed`);
        revealCards += raw.cards.length;
        revealStats += raw.cards.filter(([, , meta]) => meta?.stat).length;
        revealSprites += raw.cards.filter(([, , meta]) => meta?.sprite).length;
      }

      if (raw.type === 'teachingSlide' && raw.atlas) {
        strictEqual(normalized.kind, 'teaching', `${course.id} lesson ${lesson.num}: teaching slide changed kind`);
        deepStrictEqual(normalized.spec.atlas, raw.atlas, `${course.id} lesson ${lesson.num}: Atlas guide changed`);
        atlasGuides += 1;
      }
    }
  }
}

strictEqual(lessons, 300, `expected 300 lessons, found ${lessons}`);
strictEqual(visuals > 0, true, 'no authored visuals found');
strictEqual(explanations > 0, true, 'no authored visual explanations found');

console.log('\nLesson experience parity\n');
console.log(`  lessons                 ${lessons}`);
console.log(`  visuals reaching UI     ${visuals}`);
console.log(`  tappable explanations   ${explanations}`);
console.log(`  visual/header sprites   ${visualSprites + rowSprites}`);
console.log(`  reveal cards            ${revealCards}`);
console.log(`    authored stats        ${revealStats}`);
console.log(`    authored sprites      ${revealSprites}`);
console.log(`  Atlas hint/recap slides ${atlasGuides}`);
console.log('\nPASS — every rewritten lesson affordance survives native normalization.');
