#!/usr/bin/env node
/**
 * Investing Fundamentals lesson 1 owns two manipulate-to-learn widgets. Exercise their authored
 * data through the same normalization and pure model paths used by the native lesson runner.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { loadCourseLessons } from '../src/lib/curriculum/courseIndex.ts';
import * as graphModel from '../src/lib/interactive-graph-model.ts';
import { expandSteps, expandedStepIdentities, normalizeStep } from '../src/lib/lesson-steps.ts';

const lessons = await loadCourseLessons('investing-fundamentals');
const lesson = lessons.find((candidate) => candidate.num === 1);
assert.ok(lesson, 'Investing Fundamentals lesson 1 is missing');

const explorables = lesson.steps.filter(
  (step) => step.type === 'explorable' && ['inflationEroder', 'portfolioMixer'].includes(step.widget),
);
assert.deepEqual(
  explorables.map((step) => step.widget),
  ['inflationEroder', 'portfolioMixer'],
  'IF1 canonical explorable set changed',
);

const runtimeSteps = expandSteps(lesson.steps);
assert.equal(runtimeSteps.length, lesson.steps.length, 'explorable checks are internal web states, not duplicate outer slides');
assert.equal(runtimeSteps.some((step) => step.type === 'explorableCheck'), false, 'native must not synthesize duplicate explorable checks');
assert.equal(expandedStepIdentities(lesson.steps).length, lesson.steps.length, 'outer progress must stay aligned with the authored 17-slide lesson');

for (const step of explorables) {
  const normalized = normalizeStep(step);
  assert.equal(normalized.kind, 'graph', `${step.widget} does not reach the shared interactive renderer`);
  assert.equal(normalized.spec, step, `${step.widget} lost its authored step during normalization`);
  assert.equal(graphModel.resolveGraphType(step), step.widget, `${step.widget} lost its distinct presentation`);
  assert.ok(graphModel.effectiveGraphSliders(step).length >= 2, `${step.widget} has no native controls`);
  assert.doesNotThrow(() => graphModel.buildInteractiveGraphModel(step, graphModel.defaultGraphValues(step)));
}

const inflation = explorables.find((step) => step.widget === 'inflationEroder');
assert.ok(inflation, 'inflationEroder is missing');
const inflationDefaults = graphModel.defaultGraphValues(inflation);
assert.deepEqual(inflationDefaults, [3, 30], 'inflationEroder ignored its authored defaults');
const inflationModel = graphModel.buildInteractiveGraphModel(inflation, inflationDefaults);
assert.equal(inflationModel.presentation, 'inflationEroder');
assert.equal(inflationModel.explorable?.kind, 'inflationEroder');
assert.equal(inflationModel.explorable.totalTickets, 8);
assert.equal(inflationModel.explorable.survivors, 3, '30 years at 3% should leave three full tickets');
assert.ok(Math.abs(inflationModel.explorable.purchasingPower - 41.1987) < 0.001, 'purchasing power formula drifted');
assert.equal(inflationModel.explorable.revealReady, true, 'authored 30-year goal should reveal the insight');
const zeroInflation = graphModel.buildInteractiveGraphModel(inflation, [0, 30]);
assert.equal(zeroInflation.explorable?.kind, 'inflationEroder');
assert.equal(zeroInflation.explorable.survivors, 8);
assert.equal(zeroInflation.explorable.revealReady, false, 'no purchasing-power loss must not reveal the insight');

const portfolio = explorables.find((step) => step.widget === 'portfolioMixer');
assert.ok(portfolio, 'portfolioMixer is missing');
const portfolioModel = graphModel.buildInteractiveGraphModel(portfolio, [60, 90, 0]);
assert.equal(portfolioModel.presentation, 'portfolioMixer');
assert.equal(portfolioModel.explorable?.kind, 'portfolioMixer');
assert.deepEqual(
  [portfolioModel.explorable.stocks, portfolioModel.explorable.bonds, portfolioModel.explorable.cash],
  [60, 30, 10],
  'portfolio boundaries no longer sum to 100%',
);
assert.equal(portfolioModel.series.length, 3, 'portfolio projection lost its median/range paths');
assert.equal(portfolioModel.series[0].points.length, 21, 'authored 20-year horizon is not represented');
assert.ok(portfolioModel.explorable.bestEnd > portfolioModel.explorable.medianEnd);
assert.ok(portfolioModel.explorable.medianEnd > portfolioModel.explorable.worstEnd);
assert.equal(portfolioModel.explorable.crash?.id, 'gfc');
assert.ok(Math.abs(portfolioModel.explorable.crash.yours + 0.2046) < 1e-9, '2008 mix result drifted');
assert.equal(portfolioModel.explorable.crash.allStock, -0.37);

const componentSource = readFileSync(new URL('../src/components/interactive-graph.tsx', import.meta.url), 'utf8');
for (const behavior of [
  'Portfolio allocation bar',
  '2008 crash',
  'Your call:',
  'reduced',
  'explanationCorrect',
  'explanationWrong',
  'onComplete',
]) {
  assert.ok(componentSource.includes(behavior), `native explorable UI is missing ${behavior}`);
}
assert.match(componentSource, /predictOptions: \{[^}]*flexDirection: 'row'[^}]*flexWrap: 'wrap'/, 'prediction choices must use the web pill-wrap layout');
assert.doesNotMatch(componentSource, /— now prove it\./, 'the selected prediction summary must not add native-only copy');
assert.doesNotMatch(componentSource, /yearTicks\.at\(-1\)[^\n]*yearTicks\.push\(data\.years\)/, 'compound-growth axes must not append a colliding terminal-year tick');
assert.doesNotMatch(componentSource, /Try all three levers to unlock the insight/, 'compound growth must not add native-only progress instructions');
assert.match(componentSource, /slider=\{monthlySlider\}[\s\S]*?stepOverride=\{25\}/, 'monthly contribution must retain the web $25 step');
assert.match(componentSource, /revealed \? \(\s*<View style=\{\[styles\.compoundInsight/, 'compound insight must render inside the chart stage before its controls');
assert.match(componentSource, /compoundInsight: \{ backgroundColor: 'rgba\(0,0,0,0\.7\)'/, 'compound insight must use the web square black annotation treatment');
assert.match(componentSource, /revealed \? special\?\.kind === 'compoundGrowthLab' \? null : <Card/, 'compound insight must not render again in the generic card slot');
assert.match(componentSource, /contentContainerStyle=\{\[styles\.content, explorable && styles\.explorableContent\]\}/, 'explorables must preserve their dedicated web mobile frame');
assert.match(componentSource, /explorableHeader: \{ gap: 8 \}/, 'explorable title and prompt must retain the web gap-2 grouping');
assert.match(componentSource, /explorableTitle: \{ fontSize: 30, lineHeight: 36/, 'explorable title must retain the web text-3xl mobile scale');
assert.match(componentSource, /explorableContent: \{ paddingHorizontal: 16, paddingTop: 16, gap: 24 \}/, 'explorable frame must retain web px-4/pt-4/gap-6 spacing');
assert.match(componentSource, /graphStep \? \([\s\S]*?sectionLabel\.toUpperCase/, 'only generic graph steps may render their authored eyebrow');
assert.match(componentSource, /explorable \? \([\s\S]*?styles\.explorableStage[\s\S]*?!controlsLive && styles\.explorableLocked/, 'explorable hero must use the web transparent locked stage');
assert.match(componentSource, /explorableLocked: \{ opacity: 0\.4 \}/, 'prediction must dim the inert explorable hero to the web 40% opacity');
assert.doesNotMatch(componentSource, /accessibilityLabel=\{`Decrease \$\{slider\.label\}`\}/, 'web graph sliders must not grow separate minus-button chrome');
assert.doesNotMatch(componentSource, /accessibilityLabel=\{`Increase \$\{slider\.label\}`\}/, 'web graph sliders must not grow separate plus-button chrome');
assert.match(componentSource, /accessibilityRole="adjustable"[\s\S]*?accessibilityActions=\{\[\{ name: 'increment' \}, \{ name: 'decrement' \}\]\}/, 'compact sliders must retain VoiceOver adjustment actions');
assert.match(componentSource, /finalPick !== null[\s\S]*?<Button[\s\S]*?label="Continue"/, 'a checked explorable must own its Continue action');
assert.match(componentSource, /revealed && !explorable\?\.check[\s\S]*?<Button[\s\S]*?label="Continue"/, 'a revealed checkless explorable must own its Continue action');
assert.doesNotMatch(componentSource, /<Card style=\{styles\.checkCard\}>/, 'web-style follow-up checks must not be nested in a second card');
assert.match(componentSource, /right \? <UIcon name="check"/, 'the locked correct answer must show the web checkmark');
assert.match(componentSource, /firstWrong !== null && finalPick === null[\s\S]*?Not that one\. The chart you just dragged has the answer\./, 'a first wrong explorable answer must use the web retry prompt');
assert.match(componentSource, /finalPick !== null[\s\S]*?correct \? check\.explanationCorrect : check\.explanationWrong/, 'a locked explorable answer must use its authored final explanation');

const lessonSource = readFileSync(new URL('../src/app/lesson.tsx', import.meta.url), 'utf8');
assert.match(lessonSource, /norm\.kind === 'graph'[\s\S]*?<InteractiveGraph[\s\S]*?onComplete=/, 'graph completion must advance through the graph, not the generic footer');
assert.match(lessonSource, /OWN_CTA_STEPS = new Set\(\[[^\]]*'graph'/, 'the generic Continue must never bypass an explorable');

console.log('investing explorable regression: PASS — IF1 inflation ticket wall + portfolio stress lab');
