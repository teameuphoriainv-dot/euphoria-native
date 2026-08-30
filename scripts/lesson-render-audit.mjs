#!/usr/bin/env node
// ============================================================================
// LESSON RENDER AUDIT — every step of every lesson, through the REAL normaliser.
//
//   node --import ./scripts/ts-resolve-hooks.mjs scripts/lesson-render-audit.mjs
//   node --import ./scripts/ts-resolve-hooks.mjs scripts/lesson-render-audit.mjs --thin
//
// WHY THIS EXISTS. The corpus is byte-identical to the web repo — that was
// proven by diff. What that does NOT prove is that the app can RENDER it. A
// step type with no case in src/lib/lesson-steps.ts falls to `default:`, which
// returns kind 'todo' and pulls only setup/principle/optimalOutcome/formula. If
// a step carries none of those fields, the learner gets a title and an empty
// screen — in a paid app, mid-lesson.
//
// Sampling a few lessons cannot find that. This runs the ACTUAL normaliseStep()
// over every lesson returned by the same canonical course loaders the app uses, so the answer is
// exhaustive rather than indicative.
//
// It imports the TypeScript directly: every import in lesson-steps.ts is
// `import type`, so Node 24's type stripping erases the lot and the module is
// pure. No build step, no reimplementation of the logic being tested — a
// reimplementation would drift from the thing it is checking, which is the
// failure mode this whole audit keeps running into.
// ============================================================================
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = new URL('..', import.meta.url).pathname;
const { normalizeStep, expandSteps, visualIsRenderable, chartLabel } = await import(pathToFileURL(join(ROOT, 'src/lib/lesson-steps.ts')).href);
const { buildInteractiveGraphModel, defaultGraphValues } = await import(pathToFileURL(join(ROOT, 'src/lib/interactive-graph-model.ts')).href);
const { COURSES, loadCourseLessons } = await import(pathToFileURL(join(ROOT, 'src/lib/curriculum/courseIndex.ts')).href);

const VERBOSE = process.argv.includes('--thin');

// A GREEN RUN MEANS NOTHING UNLESS THE LANE CAN GO RED. Each detector added after the
// silent-failure review is seeded with the exact shape it exists to catch, and a harmless shape it
// must ignore. Every one of these three was a real blind spot: an unrenderable kind tallied as
// "reaching the screen", a degenerate payload that returned a truthy-but-empty element, and a
// visual-only step that read as zero content because blockText could not see inside a chart.
if (process.argv.includes('--selftest')) {
  const ok = (c, m) => { if (!c) { console.error(`selftest FAILED: ${m}`); process.exit(1); } };
  ok(!visualIsRenderable({ type: 'pixel', title: 'x', items: [{ label: 'a' }] }),
    'an UNRENDERABLE kind was accepted');
  ok(!visualIsRenderable({ type: 'stack', title: 'x', segments: [] }),
    'a known kind with an EMPTY payload was accepted');
  ok(!visualIsRenderable({ type: 'metric', title: 'x' }),
    'a metric with no value was accepted');
  ok(visualIsRenderable({ type: 'stack', title: 'x', segments: [{ label: 'a', percent: 50 }] }),
    'a VALID stack was wrongly rejected');
  ok(visualIsRenderable({ type: 'metric', title: 'x', value: '$1' }),
    'a VALID metric was wrongly rejected');
  ok(blockText({ b: 'visual', visual: { type: 'bars', title: 'T', items: [{ label: 'L', displayValue: '9%' }] } }).includes('9%'),
    'blockText could not see inside a visual block');
  ok(blockText({ b: 'stat', value: 'V', label: 'L' }) === 'V L', 'blockText regressed on stat');
  ok(chartLabel({ type: 'bars', title: 'T', items: [{ label: 'L', displayValue: '9%' }] }) === 'T. L: 9%',
    'chartLabel did not build a sentence from the fields that exist');
  ok(chartLabel({ type: 'pixel', title: 'T' }) === '', 'chartLabel invented a label for an unrenderable kind');
  ok(!chartLabel({ type: 'bars', title: 'T', items: [{ label: 'L' }] }).includes('undefined'),
    'chartLabel leaked an undefined into the label');
  const graph = {
    type: 'interactiveGraph',
    sectionLabel: 'The gap',
    title: 'Market return versus investor return',
    graphType: 'comparison',
    description: 'Adjust the penalty.',
    paragraphs: ['Behavior compounds.'],
    highlightedTerms: [],
    insights: ['Small gaps become large gaps.'],
    sliders: [
      { label: 'Market Return', min: 6, max: 12, default: 10, unit: '%' },
      { label: 'Behavioral Penalty', min: 0, max: 6, default: 4, unit: '%' },
      { label: 'Time Period', min: 10, max: 40, default: 30, unit: ' years' },
    ],
  };
  const normalizedGraph = normalizeStep(graph);
  ok(normalizedGraph.kind === 'graph', 'interactiveGraph was flattened to a non-interactive screen');
  ok(normalizedGraph.spec.graphType === 'comparison', 'interactiveGraph lost its authored graph type');
  ok(normalizedGraph.spec.sliders.length === 3, 'interactiveGraph lost its authored controls');
  const lost = expandSteps([{ type: 'progressiveCalc', title: 't', calcSteps: [{ nonsense: true }] }]);
  ok(lost.length === 0, 'a malformed calcStep produced a step it should not have');
  ok(expandSteps([{ type: 'quiz', question: 'q' }]).length === 1, 'a normal step was not passed through');
  console.log('lesson-render-audit selftest ok — graph semantics and visual safety assertions passed');
  process.exit(0);
}

/** Text a prose/todo block actually puts on screen.
 *
 * Enumerated against the real ProseBlock union in src/lib/lesson-steps.ts, not guessed. The first
 * version read `b.text/left/right/term/def/q/a` and therefore could not see a `stat` block at all,
 * whose fields are `value` and `label` -- so 34 perfectly good walkthrough screens were reported
 * thin. `term` was wrong too: the field is `definition`, not `def`. A checker that under-reads the
 * shape it checks reports the checker, not the app.
 *
 *   p     -> text
 *   stat  -> value, label
 *   term  -> term, definition, example
 *   pair  -> leftLabel, left, rightLabel, right
 *   event -> when, what, detail
 */
function blockText(b) {
  if (!b || typeof b !== 'object') return '';
  // A `visual` block carries its content one level down. Without this, a step whose ONLY block is
  // a chart -- possible for a teachingSlide with a diagramVisual and no paragraphs -- reads as
  // zero content and gets flagged thin, which would be the checker reporting itself again.
  if (b.b === 'visual') {
    const v = b.visual ?? {};
    const rows = v.items ?? v.rows ?? v.segments ?? v.nodes ?? v.points ?? [];
    return [v.title, v.value, v.detail, v.footer, v.centerLabel, v.total,
            ...rows.flatMap((r) => [r?.label, r?.value, r?.displayValue])]
      .filter((x) => typeof x === 'string').join(' ').trim();
  }
  return [b.text, b.value, b.label, b.term, b.definition, b.example,
          b.leftLabel, b.left, b.rightLabel, b.right, b.when, b.what, b.detail]
    .filter((v) => typeof v === 'string')
    .join(' ')
    .trim();
}

/** A step is THIN when it reaches the screen with no readable body and no interaction.
 *
 * The first version of this only looked at `n.blocks`, so it flagged all 443 quiz, 312 microCheck,
 * 281 fillBlank and 273 scenario steps -- 1,309 false positives -- because a `choice` step carries
 * its content in `prompt`/`options`, not `blocks`, and `gates()` does not list 'choice'. Checking
 * each kind against the shape it actually has is the whole job here.
 */
function isThin(n) {
  if (!n) return true;
  switch (n.kind) {
    case 'choice':
      return !(n.prompt ?? '').trim() || (n.options ?? []).length < 2;
    // EVERY spec-driven kind must be listed here. `calc` was missing when it was added and all
    // 3 calculator steps read as thin -- a `calc` has no `blocks`, so it fell to the branch
    // below and `[].every()` is vacuously true. Sixth time this checker has under-read a shape
    // it checks; the shape list is the thing to keep in step with lesson-steps.ts's Normalized.
    case 'reveal': case 'match': case 'order': case 'line': case 'multi': case 'build': case 'calc': case 'tree': {
      const spec = n.spec ?? {};
      const arrays = Object.values(spec).filter(Array.isArray);
      // a spec-driven interactive is thin only if it has nothing to interact with
      return arrays.length > 0 && arrays.every((a) => a.length === 0);
    }
    case 'graph': {
      try {
        const model = buildInteractiveGraphModel(n.spec, defaultGraphValues(n.spec));
        const marks = model.series.flatMap((series) => series.points)
          .concat(model.bars, model.slices, model.cells);
        return !n.spec?.title?.trim() || !model.accessibilityLabel?.trim() || marks.length === 0;
      } catch {
        return true;
      }
    }
    case 'prose': case 'todo':
    default: {
      const blocks = Array.isArray(n.blocks) ? n.blocks : [];
      return blocks.every((b) => blockText(b).length === 0);
    }
  }
}

let steps = 0, lessons = 0, thin = 0, todo = 0, visualBlocks = 0, visualsInData = 0, rawCalcSteps = 0, rawDecisions = 0, graphSteps = 0, graphScreens = 0, graphControls = 0, renderedGraphControls = 0;
const unrenderable = [], unlabelled = [];
const visualKinds = new Map();
const byType = new Map();
const thinByType = new Map();
const thinExamples = [];

for (const course of COURSES) {
  // Audit the same resolved and filtered lesson list the app receives. Importing course modules
  // directly audits retired steps and unresolved reading-level maps that never reach the UI.
  const list = await loadCourseLessons(course.id);
  for (const lesson of list) {
    lessons += 1;
    // audit what the app ACTUALLY renders, which is the expanded list
    for (const raw of lesson.steps ?? []) {
      if (raw?.type === 'progressiveCalc') rawCalcSteps += (raw.calcSteps ?? []).length;
      if (raw?.type === 'simulationFinale') rawDecisions += (raw.decisions ?? []).length;
    }
    for (const step of expandSteps(lesson.steps ?? [])) {
      steps += 1;
      byType.set(step.type, (byType.get(step.type) ?? 0) + 1);
      let n;
      try {
        n = normalizeStep(step);
      } catch (err) {
        thin += 1;
        thinByType.set(step.type, (thinByType.get(step.type) ?? 0) + 1);
        thinExamples.push(`THREW  ${course.id} L${lesson.num} ${step.type}: ${err.message}`);
        continue;
      }
      if (n.kind === 'todo') todo += 1;
      if (step.type === 'interactiveGraph') {
        graphSteps += 1;
        graphControls += step.sliders?.length ?? 0;
        if (n.kind === 'graph') {
          graphScreens += 1;
          renderedGraphControls += n.spec.sliders?.length ?? 0;
        }
      }
      // Count every visual the DATA carries, so a chart that never became a block is visible.
      for (const k of ['visual', 'diagramVisual', 'withVisual', 'withoutVisual']) {
        const v = step?.[k];
        if (v?.type) {
          visualsInData += 1;
          if (!visualIsRenderable(v)) {
            unrenderable.push(`${course.id} L${lesson.num} ${step.type}.${k} type=${v.type}`);
          } else if (chartLabel(v).length < 4) {
            // A chart carries its meaning in length, width, wedges and colour. If it cannot produce
            // a sentence, a VoiceOver user gets a silent card -- the same silence this whole unit
            // was built to remove, just moved to a different audience.
            unlabelled.push(`${course.id} L${lesson.num} ${step.type}.${k} type=${v.type}`);
          }
        }
      }
      for (const b of (Array.isArray(n.blocks) ? n.blocks : [])) {
        if (b?.b === 'visual' && b.visual?.type) {
          visualBlocks += 1;
          visualKinds.set(b.visual.type, (visualKinds.get(b.visual.type) ?? 0) + 1);
        }
      }
      if (isThin(n)) {
        thin += 1;
        thinByType.set(step.type, (thinByType.get(step.type) ?? 0) + 1);
        if (thinExamples.length < 4000) {
          thinExamples.push(`${course.id} L${lesson.num} step "${(step.title ?? '').slice(0, 46)}" (${step.type})`);
        }
      }
    }
  }
}

console.log(`\ncourses ${COURSES.length}   lessons ${lessons}   steps ${steps}   distinct types ${byType.size}`);
console.log(`fell through to the 'todo' default: ${todo} step(s)`);
console.log(`THIN (reach the screen with no readable body and no interaction): ${thin}`);
console.log(`AnimatedVisuals in the data: ${visualsInData}   reaching the screen: ${visualBlocks}   all labelled for VoiceOver: ${unlabelled.length === 0 ? 'yes' : 'NO'}`);
if (visualKinds.size) {
  console.log('  ' + [...visualKinds.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join('   '));
}
console.log('');
console.log(`Interactive graphs in the data: ${graphSteps}   reaching the screen: ${graphScreens}`);
console.log(`Authored graph controls in the data: ${graphControls}   reaching the screen: ${renderedGraphControls}`);
console.log('');

if (thinByType.size) {
  console.log('thin steps by type:');
  for (const [t, n] of [...thinByType.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${t.padEnd(18)} ${String(n).padStart(4)} of ${byType.get(t)}`);
  }
} else {
  console.log('no thin steps — every step renders readable content or an interaction.');
}

if (VERBOSE && thinExamples.length) {
  console.log(`\nfirst ${Math.min(40, thinExamples.length)} thin steps:`);
  for (const e of thinExamples.slice(0, 40)) console.log(`  ${e}`);
}

// PINNED BASELINE. 44 progressiveCalc steps still render as a bare title: each one is a sequence
// of MCQs (4 in the case measured) and the normaliser emits ONE screen per step, so rendering them
// properly needs a multi-question renderer rather than a normaliser case. Showing one of four
// questions, or revealing the answers as a "walkthrough", would both quietly lose authored
// assessment -- so this records the gap instead of papering over it.
//
// The number is a CEILING, not a target: this exits non-zero the moment a sync or an edit makes
// MORE steps thin, which is the regression nothing else in `npm run check` would notice.
const BASELINE = 0;
const { droppedCalcSteps, tiedDecisions } = await import(pathToFileURL(join(ROOT, 'src/lib/lesson-steps.ts')).href);
const emittedCalc = byType.get('calcQuiz') ?? 0;
const emittedWalk = byType.get('calcWalkthrough') ?? 0;
console.log(`calcSteps in data ${rawCalcSteps} -> emitted ${emittedCalc + emittedWalk} (dropped ${droppedCalcSteps})`);
const gradedDecisions = byType.get('simDecision') ?? 0;
console.log(`decisions in data ${rawDecisions} -> graded ${gradedDecisions} + tied-as-prose ${tiedDecisions}`);
if (rawDecisions !== gradedDecisions + tiedDecisions) {
  console.error(`\nDECISIONS LOST: ${rawDecisions} in the data, ${gradedDecisions + tiedDecisions} accounted for.`);
  process.exit(1);
}
if (graphSteps !== graphScreens || graphControls !== renderedGraphControls) {
  console.error(`\nGRAPH SEMANTICS LOST: ${graphSteps} graphs/${graphControls} controls in data, ${graphScreens} graphs/${renderedGraphControls} controls rendered.`);
  process.exit(1);
}
if (unlabelled.length) {
  console.error(`\n${unlabelled.length} chart(s) with no accessibility label:`);
  for (const u of unlabelled.slice(0, 20)) console.error(`  ${u}`);
  process.exit(1);
}
if (unrenderable.length) {
  console.error(`\n${unrenderable.length} visual(s) the app CANNOT render:`);
  for (const u of unrenderable.slice(0, 20)) console.error(`  ${u}`);
  process.exit(1);
}
if (rawCalcSteps !== emittedCalc + emittedWalk || droppedCalcSteps > 0) {
  console.error(`\nCALC STEPS LOST: ${rawCalcSteps} in the data, ${emittedCalc + emittedWalk} emitted.`);
  process.exit(1);
}
if (thin > BASELINE) {
  console.error(`\nREGRESSION: ${thin} thin steps, baseline is ${BASELINE}.`);
  console.error('Re-run with --thin to list them.');
  process.exit(1);
}
if (thin < BASELINE) {
  console.log(`\nthin count is DOWN to ${thin} (baseline ${BASELINE}). Lower the baseline in this file.`);
}
process.exit(0);
