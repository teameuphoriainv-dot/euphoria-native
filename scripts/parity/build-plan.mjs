#!/usr/bin/env node
/**
 * Build the immutable work plan for the 300-lesson web/native evidence run.
 *
 * This reads the same filtered course loader and the same screen expansion/normalization path as
 * the app. It deliberately fails unless the agreed corpus is still exactly 12 courses, 300
 * lessons, 4,050 authored steps and 4,050 outer rendered screens. Progressive calculations and
 * explorable checks keep their internal states inside authored scenes, as production does. A
 * changed corpus needs a reviewed new baseline—silently auditing a
 * partial directory would make every downstream percentage false.
 */
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO = new URL('../..', import.meta.url).pathname;
const { COURSES, loadCourseLessons } = await import(
  pathToFileURL(resolve(REPO, 'src/lib/curriculum/courseIndex.ts')).href
);
const { expandSteps, normalizeStep, visualRows } = await import(
  pathToFileURL(resolve(REPO, 'src/lib/lesson-steps.ts')).href
);
const { effectiveGraphSliders } = await import(
  pathToFileURL(resolve(REPO, 'src/lib/interactive-graph-model.ts')).href
);
const { ACTIVE_CHALLENGE_QUESTIONS, challengeHappyPathScreens, challengeRuntimeStates, hasMasteryChallenge } = await import(
  pathToFileURL(resolve(REPO, 'src/lib/mastery-challenge-model.ts')).href
);

const EXPECTED = Object.freeze({ courses: 12, lessons: 300, authoredSteps: 4050, expandedScreens: 4050 });
const EXPECTED_CHALLENGE_RUNTIME = Object.freeze({ lessons: 295, questions: 1180, happyPathScreens: 1770, finiteStates: 2065 });
const SOURCE_PINS = Object.freeze({
  productionWebCommit: '49e91490e19318f9be5919ab604346a9fa4d04d9',
  nativeBaselineCommit: '2b2408e7edd29f5164c9fee3a59d53c5d07f51d6',
});
const VISUAL_KEYS = ['visual', 'diagramVisual', 'withVisual', 'withoutVisual'];

const add = (bag, key, amount = 1) => {
  if (!key) return;
  bag[key] = (bag[key] ?? 0) + amount;
};

function graphControlCount(normalized) {
  if (normalized.kind !== 'graph') return 0;
  const step = normalized.spec;
  let count = effectiveGraphSliders(step).length;
  // Explorables synthesize controls in the renderer rather than declaring `sliders`. Counting
  // only spec.sliders recreated the original 289-chart audit blind spot. A prediction is one
  // required interaction; the portfolio mixer adds three independently tappable crash tests.
  if (step?.type === 'explorable' && step.widget === 'inflationEroder' && step.params?.predict) count += 1;
  if (step?.type === 'explorable' && step.widget === 'portfolioMixer') count += 3;
  return count;
}

function interactionFor(kind, normalized) {
  switch (kind) {
    case 'choice': return 'single_choice';
    case 'reveal': return 'tap_reveal';
    case 'match': return 'matching_pairs';
    case 'dragSort': case 'order': return 'reorder';
    case 'line': return 'slider';
    case 'multi': return 'multi_select';
    case 'trueFalse': return 'true_false_sequence';
    case 'build': return 'tile_builder';
    case 'calc': return 'numeric_input';
    case 'tree': return 'decision_tree';
    case 'vocab': return 'atlas_vocabulary_conversation';
    case 'progressiveCalc': return 'progressive_calculation';
    case 'teaching': return normalized.spec?.highlightedTerms?.length ? 'inline_term_popovers' : null;
    case 'graph': return graphControlCount(normalized) > 0 ? 'interactive_graph_controls' : 'interactive_graph';
    default: return null;
  }
}

function validateTotals(summary) {
  const failures = Object.entries(EXPECTED)
    .filter(([key, value]) => summary[key] !== value)
    .map(([key, value]) => `${key}: expected ${value}, found ${summary[key]}`);
  if (failures.length) throw new Error(`Corpus boundary changed; refusing to build parity plan:\n- ${failures.join('\n- ')}`);
}

async function buildPlan() {
  const lessons = [];
  const summary = {
    courses: COURSES.length,
    lessons: 0,
    authoredSteps: 0,
    expandedScreens: 0,
    challengeLessons: 0,
    activeChallengeQuestions: 0,
    challengeHappyPathScreens: 0,
    challengeFiniteStates: 0,
    totalHappyPathScreens: 0,
  };
  const corpusComponents = { rawStepTypes: {}, renderedKinds: {}, visualFamilies: {}, interactions: {} };

  for (const course of COURSES) {
    const courseLessons = await loadCourseLessons(course.id);
    for (const lesson of courseLessons) {
      summary.lessons += 1;
      summary.authoredSteps += lesson.steps?.length ?? 0;
      const expanded = expandSteps(lesson.steps ?? []);
      summary.expandedScreens += expanded.length;
      const challengeEnabled = hasMasteryChallenge(lesson.challenge);
      const activeChallengeQuestions = challengeEnabled ? lesson.challenge.slice(0, ACTIVE_CHALLENGE_QUESTIONS).length : 0;
      const challengeScreens = challengeHappyPathScreens(lesson.challenge);
      const finiteChallengeStates = challengeRuntimeStates(lesson.challenge);
      if (challengeEnabled) summary.challengeLessons += 1;
      summary.activeChallengeQuestions += activeChallengeQuestions;
      summary.challengeHappyPathScreens += challengeScreens;
      summary.challengeFiniteStates += finiteChallengeStates;
      summary.totalHappyPathScreens += expanded.length + challengeScreens;

      const components = { rawStepTypes: {}, renderedKinds: {}, visualFamilies: {} };
      const interactions = {};
      const motionExpectations = { screenEntry: expanded.length, atlasTap: expanded.length, authoredAtlas: 0, animatedVisuals: 0, graphTransitions: 0 };
      const screens = [];

      for (const raw of lesson.steps ?? []) {
        for (const key of VISUAL_KEYS) {
          const visual = raw?.[key];
          if (!visual?.type) continue;
          add(components.visualFamilies, visual.type);
          add(corpusComponents.visualFamilies, visual.type);
          motionExpectations.animatedVisuals += 1;
          if (visual.sprite) motionExpectations.authoredAtlas += 1;
          motionExpectations.authoredAtlas += visualRows(visual).filter((row) => row?.sprite).length;
        }
        if (raw?.atlas) motionExpectations.authoredAtlas += 1;
      }

      for (const [screenOffset, step] of expanded.entries()) {
        const normalized = normalizeStep(step);
        add(components.rawStepTypes, step.type);
        add(components.renderedKinds, normalized.kind);
        add(corpusComponents.rawStepTypes, step.type);
        add(corpusComponents.renderedKinds, normalized.kind);
        const interaction = interactionFor(normalized.kind, normalized);
        add(interactions, interaction);
        add(corpusComponents.interactions, interaction);
        if (normalized.kind === 'graph') motionExpectations.graphTransitions += 1;
        screens.push({
          screenIndex: screenOffset + 1,
          stepType: step.type,
          renderedKind: normalized.kind,
          interaction,
          title: normalized.title ?? normalized.prompt ?? normalized.spec?.title ?? normalized.spec?.prompt ?? '',
          graphControls: graphControlCount(normalized),
        });
      }

      const id = `${course.id}--${String(lesson.num).padStart(2, '0')}`;
      const lessonPlan = {
        id,
        courseId: course.id,
        courseTitle: course.title,
        lessonNumber: lesson.num,
        title: lesson.title,
        route: `euphorianative://lesson?course=${course.id}&num=${lesson.num}`,
        authoredSteps: lesson.steps?.length ?? 0,
        expandedScreens: expanded.length,
        activeChallengeQuestions,
        challengeHappyPathScreens: challengeScreens,
        challengeFiniteStates: finiteChallengeStates,
        totalHappyPathScreens: expanded.length + challengeScreens,
        screens,
        components,
        interactions,
        motionExpectations,
      };
      lessonPlan.lessonDigest = createHash('sha256').update(JSON.stringify(lessonPlan)).digest('hex');
      lessons.push(lessonPlan);
    }
  }

  validateTotals(summary);
  const challengeSummary = {
    lessons: summary.challengeLessons,
    questions: summary.activeChallengeQuestions,
    happyPathScreens: summary.challengeHappyPathScreens,
    finiteStates: summary.challengeFiniteStates,
  };
  if (JSON.stringify(challengeSummary) !== JSON.stringify(EXPECTED_CHALLENGE_RUNTIME)) {
    throw new Error(`Challenge runtime boundary changed; refusing to build parity plan: ${JSON.stringify(challengeSummary)}`);
  }
  if (new Set(lessons.map((lesson) => lesson.id)).size !== EXPECTED.lessons) {
    throw new Error('Lesson IDs are not unique; checkpoints would overwrite one another.');
  }
  const identity = JSON.stringify(lessons.map(({ id, title, authoredSteps, expandedScreens, activeChallengeQuestions, challengeHappyPathScreens, challengeFiniteStates, screens, components }) =>
    ({ id, title, authoredSteps, expandedScreens, activeChallengeQuestions, challengeHappyPathScreens, challengeFiniteStates, screens, components })));
  return {
    schemaVersion: 2,
    generatedAt: new Date().toISOString(),
    sourcePins: SOURCE_PINS,
    corpusDigest: createHash('sha256').update(identity).digest('hex'),
    expected: EXPECTED,
    summary,
    corpusComponents,
    lessons,
  };
}

const plan = await buildPlan();
if (process.argv.includes('--selftest')) {
  validateTotals(plan.summary);
  const if1 = plan.lessons.find((lesson) => lesson.id === 'investing-fundamentals--01');
  const if1GraphControls = if1?.screens.reduce((total, screen) => total + screen.graphControls, 0);
  if (if1?.interactions?.interactive_graph_controls !== 3 || if1GraphControls !== 11) {
    throw new Error(`selftest: IF1 graph controls drifted (screens=${String(if1?.interactions?.interactive_graph_controls)}, controls=${String(if1GraphControls)})`);
  }
  if (plan.summary.challengeHappyPathScreens !== 1770 || plan.summary.totalHappyPathScreens !== 5820) {
    throw new Error(`selftest: challenge runtime screens drifted (${String(plan.summary.challengeHappyPathScreens)} challenge / ${String(plan.summary.totalHappyPathScreens)} total)`);
  }
  let rejected = false;
  try { validateTotals({ ...plan.summary, expandedScreens: plan.summary.expandedScreens - 1 }); }
  catch { rejected = true; }
  if (!rejected) throw new Error('selftest: a partial 4,178-screen plan was accepted');
  console.log(`parity plan selftest ok — ${plan.summary.courses} courses / ${plan.summary.lessons} lessons / ${plan.summary.expandedScreens} authored screens + ${plan.summary.challengeHappyPathScreens} challenge screens`);
  process.exit(0);
}

const outFlag = process.argv.indexOf('--out');
const output = resolve(outFlag >= 0 ? process.argv[outFlag + 1] : 'artifacts/lesson-parity/plan.json');
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(plan, null, 2)}\n`);
console.log(`wrote ${output}`);
console.log(`${plan.summary.courses} courses / ${plan.summary.lessons} lessons / ${plan.summary.authoredSteps} authored steps / ${plan.summary.expandedScreens} expanded screens`);
