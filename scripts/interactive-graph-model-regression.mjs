#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const fail = (message) => {
  console.error(`interactive-graph-model FAILED: ${message}`);
  process.exit(1);
};
const ok = (condition, message) => { if (!condition) fail(message); };

let graphModule;
try {
  graphModule = await import(pathToFileURL(join(ROOT, 'src/lib/interactive-graph-model.ts')).href);
} catch (error) {
  fail(`model module is missing or cannot load: ${error.message}`);
}

const { buildInteractiveGraphModel, defaultGraphValues, resolveGraphType } = graphModule;
const { COURSES, loadCourseLessons } = await import(pathToFileURL(join(ROOT, 'src/lib/curriculum/courseIndex.ts')).href);

const dalbar = {
  type: 'interactiveGraph',
  sectionLabel: 'The DALBAR gap',
  title: 'Why Your Brain Costs You Money',
  graphType: 'comparison',
  description: 'Compare market and investor returns.',
  paragraphs: [],
  highlightedTerms: [],
  insights: [],
  sliders: [
    { label: 'Market Return', min: 6, max: 12, default: 10, unit: '%' },
    { label: 'Behavioral Penalty', min: 0, max: 6, default: 4, unit: '%' },
    { label: 'Time Period', min: 10, max: 40, default: 30, unit: ' years' },
  ],
};

const dalbarModel = buildInteractiveGraphModel(dalbar, defaultGraphValues(dalbar));
ok(resolveGraphType(dalbar) === 'comparison', 'DALBAR did not resolve to comparison');
ok(dalbarModel.presentation === 'line', 'DALBAR did not produce a line presentation');
ok(dalbarModel.axisEnd === 'Year 30', `DALBAR ended at ${dalbarModel.axisEnd}, not Year 30`);
ok(dalbarModel.series.length === 2, 'DALBAR did not produce two series');
ok(dalbarModel.series[0].label === 'Market return', 'DALBAR market series label drifted');
ok(dalbarModel.series[1].label === 'Investor return', 'DALBAR investor series label drifted');
ok(dalbarModel.series[0].points.at(-1).y === 1744940, 'DALBAR market outcome is not $1,744,940');
ok(dalbarModel.series[1].points.at(-1).y === 574349, 'DALBAR investor outcome is not $574,349');

let graphs = 0;
const failures = [];
for (const course of COURSES) {
  for (const lesson of await loadCourseLessons(course.id)) {
    for (const step of lesson.steps ?? []) {
      if (step.type !== 'interactiveGraph') continue;
      graphs += 1;
      try {
        const values = defaultGraphValues(step);
        const model = buildInteractiveGraphModel(step, values);
        if (!model.presentation) throw new Error('no presentation');
        if (!model.accessibilityLabel?.trim()) throw new Error('no accessibility label');
        const numbers = [
          ...(model.series ?? []).flatMap((series) => (series.points ?? []).flatMap((point) => [point.x, point.y])),
          ...(model.bars ?? []).map((bar) => bar.value),
          ...(model.slices ?? []).map((slice) => slice.value),
          ...(model.cells ?? []).map((cell) => cell.value),
        ];
        if (numbers.length === 0 || numbers.some((number) => !Number.isFinite(number))) {
          throw new Error('empty or non-finite model');
        }
      } catch (error) {
        failures.push(`${course.id} L${lesson.num} ${step.graphType}: ${error.message}`);
      }
    }
  }
}

ok(graphs === 289, `expected 289 interactive graphs, found ${graphs}`);
ok(failures.length === 0, `unrenderable graph models:\n${failures.slice(0, 20).join('\n')}`);
console.log(`interactive graph model ok — ${graphs} graphs, DALBAR semantics verified`);
