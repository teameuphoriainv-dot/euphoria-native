#!/usr/bin/env node
/**
 * WHAT THIS GUARDS NOW, AND WHY IT IS STILL HERE.
 *
 * iOS no longer renders this step type. `src/lib/curriculum/index.ts` replaces every teachingSlide
 * and every interactiveGraph with a `mobileDeck` before the app sees it, so in the shipping app the
 * normalized kind counts are deck:721, teaching:0, graph:4 (the 4 being explorables, not graphs).
 *
 * It is kept, not deleted, for two reasons. It imports `./curriculum/courseIndex` directly, which
 * is the untransformed authored corpus, so it still proves the normaliser can faithfully render
 * what the web app renders, which is the contract the mobile deck is DERIVED from. And it is the
 * safety net under a revert: if the deck layer is ever turned off, this is the evidence that the
 * path it falls back to still works.
 *
 * So a failure here does not mean a learner sees something broken today. It means the reference
 * path drifted, and the derivation is built on that path.
 */
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { readFile } from 'node:fs/promises';

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

const graphSource = await readFile(join(ROOT, 'src/components/interactive-graph.tsx'), 'utf8');
const visualSource = await readFile(join(ROOT, 'src/components/lesson-visual.tsx'), 'utf8');
ok(graphSource.includes('const GRAPH_GEOMETRY_MS = 300;'), 'graph geometry lost the canonical 300ms tween');
ok(graphSource.includes('const GRAPH_FAST_MS = 150;'), 'scatter geometry lost the canonical 150ms tween');
ok(graphSource.includes('const WATERFALL_STAGGER_MS = 50;'), 'waterfall lost its canonical 50ms stagger');
ok(graphSource.includes('const COMPOUND_CURVE_MS = 250;'), 'compound-growth curve lost its canonical 250ms tween');
ok(graphSource.includes('delay={index * WATERFALL_STAGGER_MS}'), 'waterfall bars no longer consume the stagger token');
ok(graphSource.includes('const WEB_GRAPH_BOUNCY = { stiffness: 500, damping: 18, mass: 0.8 }'), 'graph prompt lost the canonical web spring');
ok(graphSource.includes('useReducedMotion()'), 'graph geometry motion lost its Reduced Motion guard');
ok(graphSource.includes('pixelsPerReturn * 2.5'), 'compound-growth handle lost the live 49e vertical drag mapping');
ok(
  graphSource.includes('onResponderTerminationRequest={() => false}'),
  'compound-growth vertical drag can be terminated by its enclosing ScrollView',
);
ok(graphSource.includes("onExplore('monthly', value)"), 'compound-growth monthly lever no longer participates in the three-lever unlock');
ok(graphSource.includes("const threshold = lever === 'return' ? 2 : lever === 'years' ? 5 : 50;"), 'compound-growth unlock thresholds drifted');
ok(graphSource.includes('setLastCrossover(data.crossoverYear)'), 'compound-growth no longer retains its discovered crossover marker');
ok(visualSource.includes('const LINE_DRAW_MS = 900;'), 'explicit line visual lost its canonical 900ms draw');
ok(visualSource.includes('<DrawnPolyline points={coordinates} length={lineLength} color={accent} />'), 'explicit line visual reverted to a completed-line fade');

const graphControlSource = graphSource.match(/function GraphControl\([\s\S]*?\n}\n\nfunction Summary/)?.[0] ?? '';
ok(graphSource.includes('return slider.max > 1000 ? 100 : 1;'), 'generic graph controls lost the canonical web step rule');
ok(graphControlSource.includes('PanResponder.create'), 'generic graph controls do not own continuous horizontal drag gestures');
ok(graphControlSource.includes('onMoveShouldSetPanResponder'), 'generic graph controls do not distinguish horizontal drag from vertical lesson scrolling');
ok(graphControlSource.includes('Math.abs(gesture.dx) > Math.abs(gesture.dy)'), 'generic graph controls can steal vertical lesson scrolling');
ok(graphControlSource.includes('onPanResponderMove'), 'generic graph controls do not update continuously while dragged');
ok(graphControlSource.includes('onPanResponderTerminationRequest: () => false'), 'an active horizontal graph drag can be terminated by the lesson ScrollView');
ok(graphControlSource.includes('accessibilityRole="adjustable"'), 'generic graph controls lost their adjustable accessibility role');
ok(graphControlSource.includes("{ name: 'increment' }"), 'generic graph controls lost their accessibility increment action');
ok(graphControlSource.includes("{ name: 'decrement' }"), 'generic graph controls lost their accessibility decrement action');

const motionGraphSource = graphSource.match(/function MotionGraph\([\s\S]*?\n}\n\nfunction AtlasPrompt/)?.[0] ?? '';
ok(!motionGraphSource.includes('model.accessibilityLabel'), 'graph entrance still restarts when slider values change the accessibility label');

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
ok(dalbarModel.presentation === 'comparison', 'DALBAR lost its comparison presentation');
ok(dalbarModel.axisEnd === 'Year 30', `DALBAR ended at ${dalbarModel.axisEnd}, not Year 30`);
ok(dalbarModel.series.length === 2, 'DALBAR did not produce two series');
ok(dalbarModel.series[0].label === 'Market return', 'DALBAR market series label drifted');
ok(dalbarModel.series[1].label === 'Investor return', 'DALBAR investor series label drifted');
ok(dalbarModel.series[0].points.at(-1).y === 1744940, 'DALBAR market outcome is not $1,744,940');
ok(dalbarModel.series[1].points.at(-1).y === 574349, 'DALBAR investor outcome is not $574,349');

const graphStep = (graphType, sliders, extra = {}) => ({
  type: 'interactiveGraph',
  sectionLabel: 'Renderer parity',
  title: `${graphType} fixture`,
  graphType,
  description: `Exercise the ${graphType} renderer.`,
  paragraphs: [],
  highlightedTerms: [],
  insights: [],
  sliders,
  ...extra,
});

const fixtures = [
  graphStep('exponential', [
    { label: 'Annual Return', min: 0, max: 20, default: 8, unit: '%' },
    { label: 'Years', min: 1, max: 40, default: 20, unit: ' years' },
  ]),
  graphStep('timeline', [
    { label: 'Year', min: 2000, max: 2030, default: 2020, unit: '' },
    { label: 'Intensity', min: 1, max: 10, default: 5, unit: '/10' },
  ]),
  graphStep('pie', [
    { label: 'Stocks', min: 0, max: 100, default: 60, unit: '%' },
    { label: 'Bonds', min: 0, max: 100, default: 40, unit: '%' },
  ]),
  graphStep('barChart', [
    { label: 'Company A', min: 0, max: 100, default: 70, unit: '%' },
    { label: 'Company B', min: 0, max: 100, default: 45, unit: '%' },
  ]),
  graphStep('balanceSheet', [
    { label: 'Assets', min: 0, max: 200000, default: 100000, unit: '$' },
    { label: 'Liabilities', min: 0, max: 200000, default: 40000, unit: '$' },
  ]),
  graphStep('gauge', [{ label: 'Credit score', min: 300, max: 850, default: 700, unit: '' }]),
  graphStep('waterfall', [
    { label: 'Revenue', min: 0, max: 100000, default: 80000, unit: '$' },
    { label: 'Expenses', min: 0, max: 100000, default: 30000, unit: '$' },
  ]),
  graphStep('meter', [
    { label: 'Needs', min: 0, max: 100, default: 50, unit: '%' },
    { label: 'Wants', min: 0, max: 100, default: 30, unit: '%' },
  ]),
  graphStep('scatter', [
    { label: 'Risk', min: 0, max: 100, default: 50, unit: '%' },
    { label: 'Return', min: 0, max: 30, default: 10, unit: '%' },
  ]),
  graphStep('distribution', [
    { label: 'Mean', min: -5, max: 15, default: 8, unit: '%' },
    { label: 'Standard deviation', min: 1, max: 50, default: 20, unit: '%' },
  ]),
  graphStep('heatmap', [{ label: 'Correlation Shift', min: -50, max: 50, default: 0, unit: '%' }]),
  graphStep('multiline', [
    { label: 'Drift', min: 0, max: 20, default: 8, unit: '%' },
    { label: 'Volatility', min: 5, max: 60, default: 25, unit: '%' },
  ]),
  graphStep('financialChart', [
    { label: 'Short MA Period', min: 5, max: 50, default: 20, unit: ' days' },
    { label: 'Long MA Period', min: 20, max: 200, default: 50, unit: ' days' },
  ], { chartPreset: 'sma-vs-ema' }),
  graphStep('funnel', [
    { label: 'Initial screen', min: 10, max: 100, default: 80, unit: '%' },
    { label: 'Final selection', min: 1, max: 50, default: 20, unit: '%' },
  ]),
  graphStep('line', [
    { label: 'Price', min: 1, max: 100, default: 30, unit: '$' },
    { label: 'Growth', min: 0, max: 20, default: 8, unit: '%' },
  ]),
];

for (const fixture of fixtures) {
  const resolved = resolveGraphType(fixture);
  const expected = fixture.graphType === 'barChart' ? 'bar' : fixture.graphType;
  const model = buildInteractiveGraphModel(fixture, defaultGraphValues(fixture));
  ok(resolved === expected, `${fixture.graphType} resolved to ${resolved}`);
  ok(model.presentation === expected, `${fixture.graphType} collapsed into ${model.presentation}`);
}

const balance = buildInteractiveGraphModel(fixtures[4], defaultGraphValues(fixtures[4]));
ok(balance.bars.map((bar) => bar.label).join(',') === 'Assets,Liabilities,Equity', 'balance sheet omitted computed equity');
ok(balance.bars.at(-1)?.value === 60000, 'balance sheet equity is not assets minus liabilities');

const waterfall = buildInteractiveGraphModel(fixtures[6], defaultGraphValues(fixtures[6]));
ok(waterfall.bars.at(-1)?.label === 'Net', 'waterfall omitted the net bar');
ok(waterfall.bars.at(-1)?.value === 50000, 'waterfall did not subtract expenses');

const distribution = buildInteractiveGraphModel(fixtures[9], defaultGraphValues(fixtures[9]));
ok(distribution.markers.some((marker) => marker.label === 'VaR 95%'), 'distribution omitted the VaR marker');

const financial = buildInteractiveGraphModel(fixtures[12], defaultGraphValues(fixtures[12]));
ok(financial.candles.length >= 60, 'financial chart omitted deterministic price candles');
ok(financial.series.some((series) => series.label.startsWith('SMA')), 'financial chart omitted moving averages');

const heatmap = buildInteractiveGraphModel(fixtures[10], defaultGraphValues(fixtures[10]));
ok(heatmap.cells.length === 25, 'heatmap is not a 5 by 5 correlation matrix');
ok(heatmap.labels.length === 5, 'heatmap omitted correlation labels');

const investingLessons = await loadCourseLessons('investing-fundamentals');
const investingLessonOne = investingLessons.find((lesson) => lesson.num === 1);
const compound = investingLessonOne?.steps.find((step) => step.type === 'explorable' && step.widget === 'compoundGrowthLab');
ok(Boolean(compound), 'IF1 compoundGrowthLab is missing');
const compoundDefaults = defaultGraphValues(compound);
ok(compoundDefaults.join(',') === '8,25,50', `IF1 compound defaults drifted to ${compoundDefaults.join(',')}`);
ok(resolveGraphType(compound) === 'compoundGrowthLab', 'compoundGrowthLab collapsed into a generic chart');
const compoundModel = buildInteractiveGraphModel(compound, compoundDefaults);
ok(compoundModel.explorable?.kind === 'compoundGrowthLab', 'compound-growth specialized model is missing');
ok(compoundModel.series.map((series) => series.label).join(',') === 'Total,Contributed,Where you started', 'compound-growth lost its live/contribution/ghost curves');
ok(compoundModel.series.every((series) => series.points.length === 26), 'compound-growth does not cover every authored year');
ok(compoundModel.explorable.endValue === 54400, `IF1 ending value drifted to ${compoundModel.explorable.endValue}`);
ok(compoundModel.explorable.contributed === 16000, 'compound-growth contribution basis drifted');
ok(compoundModel.explorable.crossoverYear === 15, 'compound-growth crossover marker drifted');
ok(compoundModel.explorable.domainMax === 150000, 'compound-growth fixed 12% headroom drifted');
const movedCompound = buildInteractiveGraphModel(compound, [10, 35, 100]);
ok(movedCompound.explorable?.kind === 'compoundGrowthLab', 'moved compound-growth model is missing');
ok(movedCompound.explorable.ghostEnd === 129479, 'compound-growth ghost baseline moved with the live controls');
ok(movedCompound.explorable.endValue === 407766, 'compound-growth direct manipulation did not update the curve');
ok(movedCompound.explorable.crossoverYear === 13, 'compound-growth crossover did not follow the live curve');

let graphs = 0;
let compoundLabs = 0;
const failures = [];
for (const course of COURSES) {
  for (const lesson of await loadCourseLessons(course.id)) {
    for (const step of lesson.steps ?? []) {
      if (step.type === 'explorable' && step.widget === 'compoundGrowthLab') {
        compoundLabs += 1;
        try {
          const model = buildInteractiveGraphModel(step, defaultGraphValues(step));
          if (model.explorable?.kind !== 'compoundGrowthLab') throw new Error('specialized model missing');
          if (model.series.length !== 3 || model.series.some((series) => series.points.some((point) => !Number.isFinite(point.x) || !Number.isFinite(point.y)))) {
            throw new Error('empty or non-finite compound series');
          }
        } catch (error) {
          failures.push(`${course.id} L${lesson.num} compoundGrowthLab: ${error.message}`);
        }
      }
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
ok(compoundLabs >= 2, `expected at least two authored compound-growth labs, found ${compoundLabs}`);
ok(failures.length === 0, `unrenderable graph models:\n${failures.slice(0, 20).join('\n')}`);
console.log(`interactive graph model ok — ${graphs} graphs + ${compoundLabs} compound labs, DALBAR semantics verified`);
