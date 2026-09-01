/**
 * Curriculum step → renderable shape.
 *
 * `lesson.tsx` used to hardcode one demo lesson. The canonical website data has many authored step
 * types, but they collapse into a handful of render kinds: prose, a single-choice question, or a
 * spec for an interactive component we already ship. This module is that collapse, kept PURE so it
 * can be checked without a simulator (see scripts/check-lesson-steps.mjs).
 *
 * Anything not yet renderable returns kind 'todo' WITH its real title, so an unsupported step
 * shows something honest instead of a blank screen.
 */
import type { AnimatedVisual, ExplorableStepData, InteractiveGraphStep, LessonStep } from '@/lib/curriculum';
import type { MatchSpec } from '@/components/matching-pairs';
import type { MultiSpec } from '@/components/multi-select';
import type { NumberLineSpec } from '@/lib/number-line-model';
import type { OrderSpec } from '@/components/order-steps';
import type { DragSortSpec } from '@/lib/drag-sort-model';
import type { RevealSpec } from '@/components/tap-reveal';
import type { CalcSpec } from '@/components/calc-blanks';
import type { DecisionTreeSpec } from '@/components/decision-tree';
import type { TileSpec } from '@/components/tile-builder';
import type { TrueFalseSpec } from '@/lib/true-false-model';
import type { VocabTerm } from '@/lib/vocab-conversation';
import type { TeachingSlideSpec } from '@/lib/teaching-slide';
import type { ProgressiveCalcSpec } from '@/components/progressive-calc';
import { stableOptions } from './stable-options';

export type ProseBlock =
  | { b: 'p'; text: string }
  | { b: 'stat'; value: string; label: string }
  | { b: 'term'; term: string; definition: string; example?: string }
  | { b: 'svg'; xml: string; label: string }
  | {
      b: 'pair';
      leftLabel: string;
      left: string;
      rightLabel: string;
      right: string;
      /** Stakes visuals stay inside their authored without/with panel. */
      leftVisual?: AnimatedVisual;
      rightVisual?: AnimatedVisual;
      leftSvg?: { xml: string; label: string };
      rightSvg?: { xml: string; label: string };
      stakes?: boolean;
    }
  | { b: 'event'; when: string; what: string; detail?: string }
  /**
   * A chart the curriculum authored. These existed in the data and NONE of them reached
   * the screen before this block type: `AnimatedVisual` appeared only in the data layer, in zero
   * components. The same lesson on the web showed the chart; the app showed the prose around it.
   */
  | { b: 'visual'; visual: AnimatedVisual };

/**
 * Explorable widget key -> the screen that actually implements it.
 *
 * ONE entry today, and that is the honest state: `compoundGrowthLab` has a built screen and
 * `inflationEroder` does not. A map rather than an if, so adding the second widget is one line and
 * a missing one is simply absent rather than a broken link.
 */
const EXPLORABLE_LABS: Record<string, { route: string; label: string } | undefined> = {
  compoundGrowthLab: { route: '/explore/compound', label: 'Open the lab' },
};

export type Normalized =
  | {
      kind: 'prose';
      label?: string;
      title: string;
      blocks: ProseBlock[];
      lab?: { route: string; label: string };
      atlas?: { hint?: string; recap?: string };
    }
  | { kind: 'hook'; spec: HookOpenerSpec }
  | { kind: 'stakes'; spec: StakesCardSpec }
  | {
      kind: 'choice';
      prompt: string;
      options: string[];
      correct: number;
      right: string;
      wrong: string;
      sourceType: string;
      submitMode: 'immediate' | 'confirm';
      /** Authored feedback permuted into the same runtime order as `options`. */
      feedbackByOption: string[];
      /** Canonical scenarios may author more than one valid decision. */
      correctByOption: boolean[];
    }
  | { kind: 'reveal'; spec: RevealSpec }
  | { kind: 'match'; spec: MatchSpec }
  | { kind: 'dragSort'; spec: DragSortSpec }
  | { kind: 'order'; spec: OrderSpec }
  | { kind: 'line'; spec: NumberLineSpec }
  | { kind: 'multi'; spec: MultiSpec }
  | { kind: 'trueFalse'; spec: TrueFalseSpec }
  | { kind: 'build'; spec: TileSpec }
  | { kind: 'calc'; spec: CalcSpec }
  | { kind: 'tree'; spec: DecisionTreeSpec }
  | { kind: 'graph'; spec: InteractiveGraphStep | ExplorableStepData }
  | { kind: 'vocab'; terms: VocabTerm[] }
  | { kind: 'teaching'; spec: TeachingSlideSpec }
  | { kind: 'progressiveCalc'; spec: ProgressiveCalcSpec }
  | { kind: 'todo'; type: string; title: string; blocks: ProseBlock[] };

export type HookOpenerSpec = {
  title: string;
  fact: string;
  outcome: string;
  visualDescription: string;
  visual?: AnimatedVisual;
  chartSvg?: string;
};

export type StakesCardSpec = {
  withoutLabel: string;
  without: { label: string; detail: string };
  withLabel: string;
  with: { label: string; detail: string };
  withoutVisual?: AnimatedVisual;
  withVisual?: AnimatedVisual;
  withoutSvg?: string;
  withSvg?: string;
};

const p = (text: string): ProseBlock => ({ b: 'p', text });
/** paragraphs arrive as string[] but a few authored entries are empty — drop those, not the step */
const paras = (xs?: string[]): ProseBlock[] => (xs ?? []).filter((t) => t?.trim()).map(p);

/**
 * The visual kinds LessonVisual can actually draw. Single source of truth, and it lives in this
 * PURE module rather than in the component so that scripts/lesson-render-audit.mjs can import it
 * under plain Node -- the component pulls in React Native and cannot be loaded there.
 *
 * `pixel` remains absent because it has no authored occurrence in the canonical corpus. Pictograph
 * is present because its repeated marks encode magnitude in two website lessons.
 */
export const RENDERABLE_VISUAL_KINDS = new Set([
  'bars', 'comparison', 'stack', 'pie', 'grid', 'flow', 'line', 'metric', 'pictograph',
]);

/**
 * The authored rows a visual exposes for tap-to-explain behavior.
 *
 * Web uses a different property name for nearly every chart family. Keeping this transpose in the
 * pure normalization layer means the native component and the exhaustive curriculum audit read
 * the exact same set; adding a new chart family cannot silently strand its `explain` fields.
 */
export function visualRows(v?: AnimatedVisual): Record<string, any>[] {
  const a = v as (AnimatedVisual & Record<string, any>) | undefined;
  if (!a?.type) return [];
  const rows: unknown =
    a.type === 'bars' || a.type === 'grid' ? a.items
    : a.type === 'comparison' || a.type === 'pictograph' ? a.rows
    : a.type === 'stack' || a.type === 'pie' ? a.segments
    : a.type === 'flow' ? a.nodes
    : a.type === 'line' ? a.points
    : [];
  return Array.isArray(rows) ? rows : [];
}

/**
 * True when a visual will actually put something on screen.
 *
 * TWO ways it can fail, and BOTH used to be invisible:
 *   1. an unrenderable `type` -- LessonVisual's switch falls to `default: return null`, which drops
 *      the whole card including its title and footer;
 *   2. a KNOWN type whose driving array is empty or missing -- a `stack` with no `segments`, say.
 *      That one is nastier, because the component still returns a truthy element (an empty View is
 *      still an object), so no `!body` guard catches it and the learner gets an empty frame.
 *
 * Rejecting here means the step keeps its prose and the audit can count what was rejected, rather
 * than the corpus silently growing charts that nobody renders.
 */
export function visualIsRenderable(v?: AnimatedVisual): boolean {
  const a = v as (AnimatedVisual & Record<string, any>) | undefined;
  if (!a?.type || !RENDERABLE_VISUAL_KINDS.has(a.type)) return false;
  const rows: unknown = a.type === 'metric' ? null : visualRows(a);
  if (rows === null) return typeof a.value === 'string' && a.value.length > 0;  // metric
  if (a.type === 'pictograph' && (!(a.unitValue > 0) || typeof a.sprite !== 'string')) return false;
  return Array.isArray(rows) && rows.length > 0;
}

/**
 * One coherent sentence describing a chart, for the screen reader.
 *
 * WHY. These charts carry their meaning in bar LENGTH, stacked segment WIDTH, pie wedges and
 * authored hex COLOUR -- none of which VoiceOver can see. Left alone, a chart is a scatter of text
 * fragments read in layout order: a title, then a label, then a number, then another label, with
 * nothing tying them together and no statement of what is being compared.
 *
 * INVENTS NOTHING. Every word comes from a field the author wrote -- title, label,
 * value/displayValue, percent, footer, trend, centerLabel, total. The only added tokens are the
 * separators and the word the component ALREADY renders on screen for a trend ("Upward"/
 * "Downward"), so a sighted and an unsighted reader get the same claim.
 *
 * It lives in this pure module, next to visualIsRenderable, so scripts/lesson-render-audit.mjs can
 * assert every chart in the corpus produces a non-empty label without importing React Native.
 */
export function chartLabel(v?: AnimatedVisual): string {
  const a = v as (AnimatedVisual & Record<string, any>) | undefined;
  if (!a?.type) return '';
  const txt = (x: unknown) => (typeof x === 'string' && x.trim() ? x.trim() : '');
  const num = (x: unknown) => (typeof x === 'number' && Number.isFinite(x) ? `${x}%` : '');
  const parts: string[] = [txt(a.title)];
  const pair = (label: unknown, value: unknown) => [txt(label), txt(value)].filter(Boolean).join(': ');

  switch (a.type) {
    case 'metric':
      parts.push(txt(a.value), txt(a.detail));
      break;
    case 'bars':
      parts.push((a.items ?? []).map((i: any) => pair(i.label, i.displayValue ?? String(i.value ?? ''))).filter(Boolean).join(', '));
      break;
    case 'comparison':
      parts.push((a.rows ?? []).map((r: any) => pair(r.label, r.value)).filter(Boolean).join(', '));
      break;
    case 'grid':
      parts.push((a.items ?? []).map((i: any) => pair(i.label, i.value)).filter(Boolean).join(', '));
      break;
    case 'flow':
      // "then" mirrors the arrow the sighted reader sees between nodes
      parts.push((a.nodes ?? []).map((n: any) => pair(n.label, n.value)).filter(Boolean).join(', then '));
      break;
    case 'stack':
      parts.push(txt(a.total), (a.segments ?? []).map((sg: any) => pair(sg.label, txt(sg.value) || num(sg.percent))).filter(Boolean).join(', '));
      break;
    case 'pie':
      parts.push(txt(a.centerLabel), (a.segments ?? []).map((sg: any) => pair(sg.label, num(sg.percent))).filter(Boolean).join(', '));
      break;
    case 'line':
      parts.push(a.trend === 'down' ? 'Downward over the period' : 'Upward over the period',
                 (a.points ?? []).map((pt: any) => pair(pt.label, pt.value)).filter(Boolean).join(', '));
      break;
    case 'pictograph':
      parts.push(`Each mark represents ${txt(a.unitLabel)}`,
                 (a.rows ?? []).map((r: any) => pair(r.label, r.displayValue ?? String(r.value ?? ''))).filter(Boolean).join(', '));
      break;
    default:
      return '';
  }
  parts.push(txt(a.footer));
  return parts.filter(Boolean).join('. ');
}

/** de-duplicate a tray while preserving author order — repeated distractors would be unplaceable */
const uniq = (xs: string[]): string[] => Array.from(new Set(xs));

const choice = (
  prompt: string,
  options: string[],
  correct: number,
  right: string,
  wrong: string,
  authoredFeedback?: string[],
  sourceType = 'quiz',
  submitMode: 'immediate' | 'confirm' = 'immediate',
  optionOrder: 'stable-shuffle' | 'authored' = 'stable-shuffle',
  authoredCorrectness?: boolean[],
): Extract<Normalized, { kind: 'choice' }> => {
  const ordered = optionOrder === 'authored'
    ? { options: [...options], correct, sourceIndices: options.map((_option, index) => index) }
    : stableOptions(options, correct);
  const feedback = options.map((_, index) => authoredFeedback?.[index] ?? (index === correct ? right : wrong));
  return {
    kind: 'choice',
    prompt,
    options: ordered.options,
    correct: ordered.correct,
    right,
    wrong,
    sourceType,
    submitMode,
    feedbackByOption: ordered.sourceIndices.map((sourceIndex) => feedback[sourceIndex]),
    correctByOption: ordered.sourceIndices.map((sourceIndex) => authoredCorrectness?.[sourceIndex] ?? sourceIndex === correct),
  };
};

export function isChoiceCorrect(step: Extract<Normalized, { kind: 'choice' }>, selectedIndex: number): boolean {
  return step.correctByOption?.[selectedIndex] ?? selectedIndex === step.correct;
}

/** Return the explanation attached to the option the learner actually selected. */
export function choiceFeedback(step: Extract<Normalized, { kind: 'choice' }>, selectedIndex: number): string {
  return step.feedbackByOption[selectedIndex] ?? (isChoiceCorrect(step, selectedIndex) ? step.right : step.wrong);
}

/**
 * Canonical answer response shared by quiz and scenario presentation.
 *
 * A correct quiz relies on its selected/correct state and celebration; repeating the explanation
 * in a second card is not part of the web flow. A scenario is different: the selected decision's
 * outcome is the reward, so it remains inline. Wrong answers always hand Atlas the explanation for
 * the option the learner actually chose.
 */
export function choiceResponse(
  step: Extract<Normalized, { kind: 'choice' }>,
  selectedIndex: number,
): {
  correct: boolean;
  correctOutcome?: string;
  correction?: { answer: string; reason?: string };
} {
  if (isChoiceCorrect(step, selectedIndex)) {
    const outcome = choiceFeedback(step, selectedIndex);
    return step.sourceType === 'scenario' && outcome
      ? { correct: true, correctOutcome: outcome }
      : { correct: true };
  }

  const reason = choiceFeedback(step, selectedIndex);
  return {
    correct: false,
    correction: {
      answer: step.sourceType === 'scenario'
        ? `The better move was "${step.options[step.correct]}".`
        : `The answer is "${step.options[step.correct]}".`,
      ...(reason ? { reason } : {}),
    },
  };
}

/** Production's legacy investing stakes scenes infer their comparison headings from the panel
 * content when authors omit `withoutLabel`/`withLabel`. Keep this lookup identical to
 * TemplateStepRenderers.tsx; the bottom takeaway is a different field and must never be promoted
 * into the heading. Newer course scenes author explicit labels and bypass this fallback. */
function stakesFallbackHeadings(withoutPanelLabel: unknown): { without: string; with: string } {
  const label = String(withoutPanelLabel ?? '').toLowerCase();
  if (label.includes('single stock') && label.includes('80%')) return { without: 'Concentrated', with: 'Diversified' };
  if (label.includes('22') || label.includes('starting at')) return { without: 'Starting Late', with: 'Starting Early' };
  if (label.includes('100% stocks')) return { without: '100% Stocks', with: '60/40 Balanced' };
  if (label.includes('meta') || label.includes('100%')) return { without: 'Single Stock', with: 'Diversified Portfolio' };
  if (label.includes('high-fee') || label.includes('active fund') || label.includes('1.5%') || label.includes('fund manager') || label.includes('pick stocks')) {
    return { without: 'High Fees', with: 'Low-Cost Index' };
  }
  if (label.includes('mutual fund') || label.includes('load fund') || label.includes('individual stocks')) return { without: 'Active Fund', with: 'Index Fund' };
  if (label.includes('lump sum') || label.includes('all at once') || label.includes('time the market') || label.includes('timing')) {
    return { without: 'Lump Sum', with: 'Dollar-Cost Avg' };
  }
  return { without: 'Without Investing', with: 'With Investing' };
}

export function normalizeStep(step: LessonStep): Normalized {
  const s = step as Extract<LessonStep, { type: string }> & Record<string, any>;
  // `as string`: expandSteps() below emits two SYNTHETIC types ('calcQuiz', 'calcWalkthrough')
  // that are not in the curriculum union, because they are screens this app derives rather than
  // content the web repo authors. Every case body reads fields through the Record<string, any>
  // above, so the union's narrowing was never load-bearing here.
  switch (s.type as string) {
    // ─── single-choice family → the quiz UI lesson.tsx already has ─────────────
    case 'quiz':
      return choice(s.question, s.options, s.correct, s.explanation, s.explanation);
    case 'microCheck':
      return choice(s.question, s.options, s.correct, s.explanationCorrect, s.explanationWrong, undefined, 'microCheck');
    case 'fillBlank':
      return choice(s.sentence, s.options, s.correct, 'That fits.', 'Not the one.', undefined, 'fillBlank', 'confirm');
    case 'visualInteractive':
      return choice(s.question, s.options, s.correct, s.description ?? '', s.description ?? '', undefined, 'visualInteractive');
    case 'scenario': {
      const choices = (s.choices ?? []) as { label: string; outcome: string; correct: boolean }[];
      const correct = Math.max(0, choices.findIndex((c) => c.correct));
      return choice(
        s.situation,
        choices.map((c) => c.label),
        correct,
        choices[correct]?.outcome ?? '',
        choices.find((c) => !c.correct)?.outcome ?? '',
        choices.map((c) => c.outcome),
        'scenario',
        'immediate',
        'authored',
        choices.map((choice) => choice.correct),
      );
    }

    // ─── interactive components we already ship ───────────────────────────────
    case 'trueFalse':
      return {
        kind: 'trueFalse',
        spec: {
          statements: (s.statements ?? []).map((statement: { s: string; a: boolean; explanation?: string }) => ({
            s: statement.s,
            a: statement.a,
            ...(statement.explanation ? { explanation: statement.explanation } : {}),
          })),
        },
      };
    case 'match':
      return { kind: 'match', spec: { title: s.title, pairs: (s.pairs ?? []).map(([left, right]: [string, string]) => ({ left, right })) } };
    case 'matchingPairs':
      return { kind: 'match', spec: { title: s.title, pairs: (s.pairs ?? []).map((x: any) => ({ left: x.term, right: x.definition })) } };
    case 'tapReveal':
      return {
        kind: 'reveal',
        spec: {
          title: s.title,
          cards: (s.cards ?? []).map(([term, def, meta]: [string, string, { stat?: string; sprite?: string }?]) => ({
            term,
            def,
            ...(meta?.stat ? { stat: meta.stat } : {}),
            ...(meta?.sprite ? { sprite: meta.sprite } : {}),
          })),
        },
      };
    case 'keyTermsCards':
      return {
        kind: 'vocab',
        // Production web does not render these as reveal cards. Atlas teaches every authored term,
        // then asks up to four deterministic questions built only from this lesson's vocabulary.
        terms: (s.terms ?? []).map((term: any) => ({
          term: String(term.term ?? ''),
          definition: String(term.definition ?? ''),
          example: String(term.example ?? ''),
          sentence: String(term.sentence ?? ''),
        })),
      };
    case 'dragSort':
      return { kind: 'dragSort', spec: { prompt: s.prompt, items: s.items ?? [] } };
    case 'sorting':
      // Legacy sorting remains a list reorder. Canonical dragSort is the production adjacent-pair
      // lesson above; collapsing them was what replaced its teaching and feedback with swaps.
      return { kind: 'order', spec: { title: s.prompt, hint: 'Tap two rows to swap them.', items: s.items ?? [] } };
    case 'timeline':
      return {
        kind: 'order',
        spec: {
          title: s.title,
          hint: 'Put these in order, earliest first.',
          items: (s.events ?? []).map((e: any) => `${e.year} · ${e.label}`),
        },
      };
    case 'slider': {
      const min = Number(s.min) || 0;
      const max = Number(s.max) || 100;
      const unit = s.unit ?? '';
      return {
        kind: 'line',
        spec: {
          prompt: s.question,
          min,
          max,
          target: s.correct,
          // Production grades the learner's frozen submission inside a 15% range band, then
          // reveals the exact authored value. Keep that contract in the shared adapter so every
          // slider lesson — not just a hand-picked screen — gets the same grading semantics.
          tolerance: (max - min) * 0.15,
          step: 1,
          unit,
          explanation: s.explanation,
          format: (n: number) => `${Number(n.toFixed(6))}${unit}`,
        },
      };
    }
    case 'buildIt': {
      const slots = (s.slots ?? []) as { label: string; options: string[]; correct: number }[];
      return {
        kind: 'build',
        spec: {
          title: s.instruction || s.title,
          slots: slots.map((x) => ({ label: x.label, correct: x.options[x.correct] })),
          tray: uniq(slots.flatMap((x) => x.options)),
        },
      };
    }
    case 'decisionTree':
      return { kind: 'tree', spec: { scenario: s.scenario, decisions: s.decisions ?? [] } };

    // ─── prose ────────────────────────────────────────────────────────────────
    case 'concept':
      return { kind: 'prose', title: `${s.emoji ?? ''} ${s.title}`.trim(), blocks: [p(s.body)] };
    case 'hookOpener':
      return {
        kind: 'hook',
        spec: {
          title: s.title,
          fact: s.fact,
          outcome: s.outcome,
          visualDescription: s.visualDescription,
          ...(visualIsRenderable(s.visual) ? { visual: s.visual } : {}),
          ...(!visualIsRenderable(s.visual) && typeof s.chartSvg === 'string' && s.chartSvg.trim()
            ? { chartSvg: s.chartSvg }
            : {}),
        },
      };
    case 'teachingSlide':
      return {
        kind: 'teaching',
        spec: {
          sectionLabel: s.sectionLabel,
          title: s.title,
          paragraphs: (s.paragraphs ?? []).filter((text: string) => text?.trim()),
          highlightedTerms: s.highlightedTerms ?? [],
          diagramDescription: s.diagramDescription ?? s.title,
          ...(visualIsRenderable(s.diagramVisual) ? { diagramVisual: s.diagramVisual } : {}),
          ...(!visualIsRenderable(s.diagramVisual) && typeof s.diagramSvg === 'string' && s.diagramSvg.trim()
            ? { diagramSvg: s.diagramSvg }
            : {}),
          ...(s.atlas ? { atlas: s.atlas } : {}),
        },
      };
    case 'interactiveGraph':
      return { kind: 'graph', spec: step as InteractiveGraphStep };
    case 'stakesCard': {
      const fallback = stakesFallbackHeadings(s.without?.label);
      return {
        kind: 'stakes',
        spec: {
          withoutLabel: String(s.withoutLabel ?? fallback.without),
          without: { label: String(s.without?.label ?? ''), detail: String(s.without?.detail ?? '') },
          withLabel: String(s.withLabel ?? fallback.with),
          with: { label: String(s.with?.label ?? ''), detail: String(s.with?.detail ?? '') },
          ...(visualIsRenderable(s.withoutVisual) ? { withoutVisual: s.withoutVisual } : {}),
          ...(visualIsRenderable(s.withVisual) ? { withVisual: s.withVisual } : {}),
          ...(!visualIsRenderable(s.withoutVisual) && typeof s.withoutSvg === 'string' && s.withoutSvg.trim()
            ? { withoutSvg: s.withoutSvg }
            : {}),
          ...(!visualIsRenderable(s.withVisual) && typeof s.withSvg === 'string' && s.withSvg.trim()
            ? { withSvg: s.withSvg }
            : {}),
        },
      };
    }
    case 'misconceptions':
      return {
        kind: 'prose',
        label: s.subtitle,
        title: s.title,
        blocks: (s.items ?? []).map((i: any) => ({ b: 'pair' as const, leftLabel: 'Myth', left: i.myth, rightLabel: 'Truth', right: i.truth })),
      };
    case 'caseStudy':
      return {
        kind: 'prose',
        label: 'Case study',
        title: s.title,
        blocks: [...(s.events ?? []).map((e: any) => ({ b: 'event' as const, when: e.date, what: e.event, detail: e.context })), p(s.lesson)],
      };
    case 'summaryCards':
      return {
        kind: 'prose',
        label: 'Recap',
        title: s.lessonTitle ?? 'What you learned',
        blocks: (s.cards ?? []).map((c: any) => ({ b: 'term' as const, term: c.takeaway, definition: c.detail })),
      };
    case 'whatsNext':
      return {
        kind: 'prose',
        label: 'Up next',
        title: s.nextTitle,
        blocks: [p(s.preview), ...(s.estimatedTime ? [{ b: 'stat' as const, value: `${s.estimatedTime} min`, label: 'Next lesson' }] : [])],
      };

    // ─── not renderable yet — show the real title, never a blank screen ───────
    case 'calculator':
      /*
       * Was falling to the `todo` default, which pulls setup/principle/optimalOutcome/formula --
       * so these rendered a title and their formula, and the `blanks` that ARE the exercise were
       * dropped. Every blank carries its own tolerance, which only means something if a learner
       * can type a number, so they get a typed answer rather than invented multiple choice.
       */
      return { kind: 'calc', spec: { title: s.title, formula: s.formula, blanks: s.blanks ?? [] } };
    case 'progressiveCalc':
      // This is one authored web scene with an internal calculation flow. Flattening its 3–8
      // rounds into outer lesson screens changes progress, transitions, feedback and Back behavior.
      return {
        kind: 'progressiveCalc',
        spec: {
          title: String(s.title ?? ''),
          calcSteps: (s.calcSteps ?? []).map((calcStep: any) => ({ ...calcStep })),
        },
      };
    case 'simProse':
      // The scenario's setup, or its debrief. Both are authored prose that used to share ONE screen
      // with the decisions the learner never got to make.
      return { kind: 'prose', label: s.label, title: s.title, blocks: paras(s.paragraphs) };
    case 'simDecision': {
      /*
       * One decision out of a simulationFinale. `correct` is the option with the highest authored
       * `score`; the feedback is that option's own `consequence`, so nothing is invented. Both the
       * right and wrong branches show it, which is what `quiz` already does with its single
       * explanation -- the learner needs to know which choice was best either way.
       */
      const opts: any[] = s.options ?? [];
      const best = opts.reduce((b, o, i) => ((o?.score ?? -Infinity) > (opts[b]?.score ?? -Infinity) ? i : b), 0);
      const why = String(opts[best]?.consequence ?? '');
      return choice(s.prompt, opts.map((o) => String(o?.label ?? '')), best, why, why);
    }
    case 'calcQuiz':
      /*
       * One question out of a progressiveCalc, lifted to its own screen by expandSteps() below.
       * calcSteps carry no explanation of their own, so the feedback is a short generic line --
       * the same compromise `fillBlank` above already makes ('That fits.' / 'Not the one.'), and
       * for the same reason: the alternative is an empty feedback bar.
       */
      return choice(s.prompt, s.options, s.correct, 'That is the one.', 'Not that one.');
    case 'calcWalkthrough':
      /*
       * A worked line of a progressiveCalc: `formula` produces `result`. Rendered as a stat so the
       * result reads as the answer and the formula sits under it as its label -- both strings are
       * authored, and nothing is invented to join them.
       */
      return { kind: 'prose', title: s.label, blocks: [{ b: 'stat', value: s.result, label: s.formula }] };
    case 'explorable':
      if (s.widget === 'inflationEroder' || s.widget === 'portfolioMixer' || s.widget === 'compoundGrowthLab') {
        return { kind: 'graph', spec: step as ExplorableStepData };
      }
      // A future explorable with no specialized native stage still keeps its authored prompt and
      // insight instead of becoming a blank screen. Canonical widgets keep prediction, controls,
      // insight and comprehension check inside this one authored scene, exactly as production web.
      return {
        kind: 'prose',
        title: s.title,
        blocks: paras([s.prompt, s.insight]),
        lab: EXPLORABLE_LABS[s.widget],
      };
    default:
      return {
        kind: 'todo',
        type: s.type,
        title: s.title ?? 'Coming soon',
        blocks: paras([s.setup, s.principle, s.optimalOutcome, s.formula]),
      };
  }
}

/**
 * Lift each `progressiveCalc` into the screens it actually contains.
 *
 * MEASURED: all 44 progressiveCalc steps rendered as a bare title over empty space, because the
 * type has no case and the `todo` default pulls setup/principle/optimalOutcome/formula -- none of
 * which it has. The content was never missing: those 44 steps hold 170 calcSteps between them
 * (136 questions and 34 worked lines, 3 to 8 per step, no other shapes anywhere in the corpus).
 *
 * The renderer shows ONE screen per step, so a case could only ever have surfaced one of them.
 * Showing the first question and dropping the rest, or revealing every answer as a "walkthrough",
 * would both quietly lose authored assessment. Expanding the LIST instead loses nothing: 44 empty
 * screens become 170 real ones.
 *
 * Everything else passes through untouched, so this is a no-op for 5,297 of the 5,341 steps.
 *
 * NOTE FOR THE DEVICE DRIVER: scripts/anim/solve.py keys answers by step INDEX, and expansion
 * shifts every index after a progressiveCalc. That is tooling, not product, and is called out
 * here so the next person does not read a driver mismatch as a content bug.
 */
/** Count of calcSteps expandSteps could not place. Read by scripts/lesson-render-audit.mjs, which
 *  cannot otherwise see data lost inside this function. Any value above zero is a defect. */
export let droppedCalcSteps = 0;

/** Decisions rendered as prose because their top score is TIED (or they have fewer than two
 *  options), so a graded question would mark an equally-good answer wrong. Read by the render
 *  audit so `decisions in data === graded + tied` can be asserted rather than assumed. */
export let tiedDecisions = 0;

export type ExpandedStepIdentity = {
  authoredIndex: number;
  subIndex: number;
  subTotal: number;
};

/**
 * Map runtime-expanded screens back to the single authored web step that owns them. Explorables
 * and progressive calculations retain their internal states inside one outer scene, as on web.
 */
export function expandedStepIdentities(steps: LessonStep[]): ExpandedStepIdentity[] {
  return steps.flatMap((step, authoredIndex) => {
    const s = step as Record<string, any>;
    let subTotal = 1;
    if (s?.type === 'simulationFinale' && Array.isArray(s.decisions) && s.decisions.length > 0) {
      subTotal = s.decisions.length + 2;
    }
    return Array.from({ length: subTotal }, (_, subIndex) => ({ authoredIndex, subIndex, subTotal }));
  });
}

export function expandSteps(steps: LessonStep[]): LessonStep[] {
  const out: LessonStep[] = [];
  for (const step of steps) {
    const s = step as Record<string, any>;
    if (s?.type === 'simulationFinale' && Array.isArray(s.decisions) && s.decisions.length > 0) {
      /*
       * A finale is a SCENARIO: a setup, a series of decisions, then the debrief. It used to render
       * as one prose screen carrying the setup, the principle and the optimal outcome, with all 783
       * decisions across the corpus dropped -- the learner read what the right answer was without
       * ever being asked. Same shape of loss as progressiveCalc, same fix.
       */
      out.push({ type: 'simProse', label: 'The scenario', title: s.title, paragraphs: [s.setup] } as unknown as LessonStep);
      for (const d of s.decisions) {
        const opts: any[] = Array.isArray(d?.options) ? d.options : [];
        const scores = opts.map((o) => o?.score ?? -Infinity);
        const top = Math.max(...scores);
        const tied = scores.filter((x) => x === top).length > 1;
        if (opts.length < 2 || tied) {
          tiedDecisions += 1;
          /*
           * TWO of the 783 decisions have a TIED top score, and a graded question cannot represent
           * that -- it would mark an equally-good answer wrong. Those render as prose showing every
           * option with its authored consequence, so the reasoning still lands and nothing the
           * author wrote is contradicted.
           */
          out.push({
            type: 'simProse',
            label: 'Consider',
            title: String(d?.prompt ?? s.title),
            paragraphs: opts.map((o) => `${o?.label ?? ''}: ${o?.consequence ?? ''}`),
          } as unknown as LessonStep);
        } else {
          out.push({ type: 'simDecision', prompt: d.prompt, options: opts } as unknown as LessonStep);
        }
      }
      out.push({ type: 'simProse', label: 'The takeaway', title: s.title, paragraphs: [s.optimalOutcome, s.principle] } as unknown as LessonStep);
      continue;
    }
    // progressiveCalc intentionally stays as ONE outer screen. Its authored rounds are rendered
    // by ProgressiveCalc, exactly as the web viewer does, instead of distorting lesson progress.
    out.push(step);
  }
  return out;
}

/** Steps that gate Continue until solved. Prose never blocks; interactives always do. */
export function gates(n: Normalized): boolean {
  return n.kind === 'reveal' || n.kind === 'match' || n.kind === 'dragSort' || n.kind === 'order' || n.kind === 'line' || n.kind === 'multi' || n.kind === 'trueFalse' || n.kind === 'build' || n.kind === 'calc' || n.kind === 'tree' || n.kind === 'vocab' || n.kind === 'progressiveCalc';
}
