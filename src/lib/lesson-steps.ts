/**
 * Curriculum step → renderable shape.
 *
 * `lesson.tsx` used to hardcode one demo lesson. The real data has 24 step types across 5,341
 * steps, but they collapse into a handful of render kinds: prose, a single-choice question, or a
 * spec for an interactive component we already ship. This module is that collapse, kept PURE so it
 * can be checked without a simulator (see scripts/check-lesson-steps.mjs).
 *
 * Anything not yet renderable returns kind 'todo' WITH its real title, so an unsupported step
 * shows something honest instead of a blank screen.
 */
import type { AnimatedVisual, LessonStep } from '@/lib/curriculum';
import type { MatchSpec } from '@/components/matching-pairs';
import type { MultiSpec } from '@/components/multi-select';
import type { NumberLineSpec } from '@/components/number-line';
import type { OrderSpec } from '@/components/order-steps';
import type { RevealSpec } from '@/components/tap-reveal';
import type { CalcSpec } from '@/components/calc-blanks';
import type { TileSpec } from '@/components/tile-builder';

export type ProseBlock =
  | { b: 'p'; text: string }
  | { b: 'stat'; value: string; label: string }
  | { b: 'term'; term: string; definition: string; example?: string }
  | { b: 'pair'; leftLabel: string; left: string; rightLabel: string; right: string }
  | { b: 'event'; when: string; what: string; detail?: string }
  /**
   * A chart the curriculum authored. 1,309 of these existed in the data and NONE of them reached
   * the screen before this block type: `AnimatedVisual` appeared only in the data layer, in zero
   * components. The same lesson on the web showed the chart; the app showed the prose around it.
   */
  | { b: 'visual'; visual: AnimatedVisual };

export type Normalized =
  | { kind: 'prose'; label?: string; title: string; blocks: ProseBlock[] }
  | { kind: 'choice'; prompt: string; options: string[]; correct: number; right: string; wrong: string }
  | { kind: 'reveal'; spec: RevealSpec }
  | { kind: 'match'; spec: MatchSpec }
  | { kind: 'order'; spec: OrderSpec }
  | { kind: 'line'; spec: NumberLineSpec }
  | { kind: 'multi'; spec: MultiSpec }
  | { kind: 'build'; spec: TileSpec }
  | { kind: 'calc'; spec: CalcSpec }
  | { kind: 'todo'; type: string; title: string; blocks: ProseBlock[] };

const p = (text: string): ProseBlock => ({ b: 'p', text });
/** paragraphs arrive as string[] but a few authored entries are empty — drop those, not the step */
const paras = (xs?: string[]): ProseBlock[] => (xs ?? []).filter((t) => t?.trim()).map(p);
const terms = (xs?: { term: string; definition: string; example?: string }[]): ProseBlock[] =>
  (xs ?? []).map((t) => ({ b: 'term', term: t.term, definition: t.definition, example: t.example }));

/**
 * The visual kinds LessonVisual can actually draw. Single source of truth, and it lives in this
 * PURE module rather than in the component so that scripts/lesson-render-audit.mjs can import it
 * under plain Node -- the component pulls in React Native and cannot be loaded there.
 *
 * `AnimatedVisual` also declares `pixel` and `pictograph`. Neither occurs in the corpus today and
 * neither is implemented, so they are deliberately ABSENT here: that makes an unrenderable kind a
 * loud, countable event instead of a card that quietly disappears.
 */
export const RENDERABLE_VISUAL_KINDS = new Set([
  'bars', 'comparison', 'stack', 'pie', 'grid', 'flow', 'line', 'metric',
]);

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
  const rows: unknown =
    a.type === 'bars' || a.type === 'grid' ? a.items
    : a.type === 'comparison' ? a.rows
    : a.type === 'stack' || a.type === 'pie' ? a.segments
    : a.type === 'flow' ? a.nodes
    : a.type === 'line' ? a.points
    : null;
  if (rows === null) return typeof a.value === 'string' && a.value.length > 0;  // metric
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
    default:
      return '';
  }
  parts.push(txt(a.footer));
  return parts.filter(Boolean).join('. ');
}

/** A chart block, or nothing when the step carries no RENDERABLE visual. Keeps the three call
 *  sites honest: a visual is an addition to prose that already works, never a replacement. */
const vis = (v?: AnimatedVisual): ProseBlock[] =>
  (v && visualIsRenderable(v) ? [{ b: 'visual', visual: v }] : []);

/** de-duplicate a tray while preserving author order — repeated distractors would be unplaceable */
const uniq = (xs: string[]): string[] => Array.from(new Set(xs));

export function normalizeStep(step: LessonStep): Normalized {
  const s = step as Extract<LessonStep, { type: string }> & Record<string, any>;
  // `as string`: expandSteps() below emits two SYNTHETIC types ('calcQuiz', 'calcWalkthrough')
  // that are not in the curriculum union, because they are screens this app derives rather than
  // content the web repo authors. Every case body reads fields through the Record<string, any>
  // above, so the union's narrowing was never load-bearing here.
  switch (s.type as string) {
    // ─── single-choice family → the quiz UI lesson.tsx already has ─────────────
    case 'quiz':
      return { kind: 'choice', prompt: s.question, options: s.options, correct: s.correct, right: s.explanation, wrong: s.explanation };
    case 'microCheck':
      return { kind: 'choice', prompt: s.question, options: s.options, correct: s.correct, right: s.explanationCorrect, wrong: s.explanationWrong };
    case 'fillBlank':
      return { kind: 'choice', prompt: s.sentence, options: s.options, correct: s.correct, right: 'That fits.', wrong: 'Not the one.' };
    case 'visualInteractive':
      return { kind: 'choice', prompt: s.question, options: s.options, correct: s.correct, right: s.description ?? '', wrong: s.description ?? '' };
    case 'scenario': {
      const choices = (s.choices ?? []) as { label: string; outcome: string; correct: boolean }[];
      const correct = Math.max(0, choices.findIndex((c) => c.correct));
      return {
        kind: 'choice',
        prompt: s.situation,
        options: choices.map((c) => c.label),
        correct,
        right: choices[correct]?.outcome ?? '',
        wrong: choices.find((c) => !c.correct)?.outcome ?? '',
      };
    }

    // ─── interactive components we already ship ───────────────────────────────
    case 'trueFalse':
      return {
        kind: 'multi',
        spec: {
          title: 'Select every statement that is true.',
          options: (s.statements ?? []).map((x: { s: string; a: boolean }) => ({ label: x.s, correct: x.a })),
        },
      };
    case 'match':
      return { kind: 'match', spec: { title: s.title, pairs: (s.pairs ?? []).map(([left, right]: [string, string]) => ({ left, right })) } };
    case 'matchingPairs':
      return { kind: 'match', spec: { title: s.title, pairs: (s.pairs ?? []).map((x: any) => ({ left: x.term, right: x.definition })) } };
    case 'tapReveal':
      return { kind: 'reveal', spec: { title: s.title, cards: (s.cards ?? []).map(([term, def]: [string, string]) => ({ term, def })) } };
    case 'keyTermsCards':
      return {
        kind: 'reveal',
        // TapReveal already prints "Tap each card to reveal what it means." as its own subtitle
        // (tap-reveal.tsx:36) — the title has to say what the cards ARE, or it reads twice.
        spec: { title: 'Key terms from this lesson.', cards: (s.terms ?? []).map((t: any) => ({ term: t.term, def: t.definition })) },
      };
    case 'dragSort':
    case 'sorting':
      // OrderSteps takes items in CORRECT order and shuffles internally
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
          // authored data carries no tolerance; 5% of range keeps it winnable without being free
          tolerance: Math.max((max - min) * 0.05, 0.5),
          format: (n: number) => `${Math.round(n)}${unit}`,
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

    // ─── prose ────────────────────────────────────────────────────────────────
    case 'concept':
      return { kind: 'prose', title: `${s.emoji ?? ''} ${s.title}`.trim(), blocks: [p(s.body)] };
    case 'hookOpener':
      // the visual sits between the fact and the outcome, which is where the web places it
      return { kind: 'prose', label: 'To start', title: s.title, blocks: [p(s.fact), ...vis(s.visual), p(s.outcome)] };
    case 'teachingSlide':
      return {
        kind: 'prose',
        label: s.sectionLabel,
        title: s.title,
        blocks: [
          ...paras(s.paragraphs),
          ...vis(s.diagramVisual),
          ...terms(s.highlightedTerms),
          ...(s.realExample
            ? [{ b: 'stat' as const, value: s.realExample.metric, label: `${s.realExample.company} — ${s.realExample.outcome}` }, p(s.realExample.explanation)]
            : []),
        ],
      };
    case 'interactiveGraph':
      // the chart itself is a later cycle; its written analysis stands on its own
      return {
        kind: 'prose',
        label: s.sectionLabel,
        title: s.title,
        blocks: [...paras([s.description]), ...paras(s.paragraphs), ...terms(s.highlightedTerms), ...paras(s.insights)],
      };
    case 'stakesCard':
      return {
        kind: 'prose',
        title: 'Why this matters',
        blocks: [
          {
            b: 'pair',
            leftLabel: s.withoutLabel ?? s.without?.label ?? 'Without this',
            left: s.without?.detail ?? '',
            rightLabel: s.withLabel ?? s.with?.label ?? 'With this',
            right: s.with?.detail ?? '',
          },
          ...vis(s.withoutVisual),
          ...vis(s.withVisual),
        ],
      };
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
    case 'explorableCheck':
      /*
       * The comprehension question an `explorable` carries. Lifted to its own screen by
       * expandSteps so it lands AFTER the insight that answers it -- asking first would be a
       * question about something never explained, which is why the explorable case renders prose
       * and does not try to carry both on one screen.
       */
      return { kind: 'choice', prompt: s.question, options: s.options, correct: s.correct, right: s.explanationCorrect, wrong: s.explanationWrong };
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
      return { kind: 'choice', prompt: s.prompt, options: opts.map((o) => String(o?.label ?? '')), correct: best, right: why, wrong: why };
    }
    case 'calcQuiz':
      /*
       * One question out of a progressiveCalc, lifted to its own screen by expandSteps() below.
       * calcSteps carry no explanation of their own, so the feedback is a short generic line --
       * the same compromise `fillBlank` above already makes ('That fits.' / 'Not the one.'), and
       * for the same reason: the alternative is an empty feedback bar.
       */
      return { kind: 'choice', prompt: s.prompt, options: s.options, correct: s.correct, right: 'That is the one.', wrong: 'Not that one.' };
    case 'calcWalkthrough':
      /*
       * A worked line of a progressiveCalc: `formula` produces `result`. Rendered as a stat so the
       * result reads as the answer and the formula sits under it as its label -- both strings are
       * authored, and nothing is invented to join them.
       */
      return { kind: 'prose', title: s.label, blocks: [{ b: 'stat', value: s.result, label: s.formula }] };
    case 'explorable':
      /*
       * MEASURED, not assumed: these rendered as an EMPTY SCREEN. `explorable` had no case, so it
       * fell to the `todo` default below, which pulls setup/principle/optimalOutcome/formula --
       * none of which an explorable has. scripts/lesson-render-audit.mjs ran the real normaliser
       * over all 5,341 steps and found 3 of 3 explorables thin, and two of the three are in
       * investing-fundamentals LESSON 1: the second screen a brand-new user ever sees was a
       * label, a title and a Continue button over empty space.
       *
       * The authored content was there the whole time. `prompt` sets the scene and `insight` is
       * the payoff -- "Nobody touched the bill. It still says $100. But 3% inflation for 30 years
       * ate 5 of your 8 tickets." Rendering them invents nothing.
       *
       * STILL MISSING and deliberately not faked here: the interactive widget itself, and the
       * step's `check` MCQ. A one-screen normaliser cannot carry both the insight and a gated
       * question, and a question about a thing that was never explained is worse than no question.
       */
      return {
        kind: 'prose',
        title: s.title,
        blocks: paras([s.prompt, s.insight]),
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

export function expandSteps(steps: LessonStep[]): LessonStep[] {
  const out: LessonStep[] = [];
  for (const step of steps) {
    const s = step as Record<string, any>;
    if (s?.type === 'explorable' && Array.isArray(s?.check?.options) && s.check.options.length > 1) {
      // The prose screen first (prompt + insight), then the author's own check. Both are already
      // written; only the interactive widget itself remains unrendered.
      out.push(step);
      out.push({ type: 'explorableCheck', ...s.check } as unknown as LessonStep);
      continue;
    }
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
            paragraphs: opts.map((o) => `${o?.label ?? ''} — ${o?.consequence ?? ''}`),
          } as unknown as LessonStep);
        } else {
          out.push({ type: 'simDecision', prompt: d.prompt, options: opts } as unknown as LessonStep);
        }
      }
      out.push({ type: 'simProse', label: 'The takeaway', title: s.title, paragraphs: [s.optimalOutcome, s.principle] } as unknown as LessonStep);
      continue;
    }
    if (s?.type !== 'progressiveCalc' || !Array.isArray(s.calcSteps) || s.calcSteps.length === 0) {
      out.push(step);
      continue;
    }
    for (const c of s.calcSteps) {
      if (Array.isArray(c?.options)) {
        out.push({ type: 'calcQuiz', prompt: c.prompt, options: c.options, correct: c.correct } as unknown as LessonStep);
      } else if (typeof c?.formula === 'string') {
        out.push({ type: 'calcWalkthrough', label: c.label, formula: c.formula, result: c.result } as unknown as LessonStep);
      } else {
        // NOT SILENTLY DROPPED. A calcStep that is neither shape would otherwise vanish one layer
        // BEFORE the render audit looks -- the audit iterates what expandSteps emits, so anything
        // lost in here is structurally uncountable by it. Emitting a marker keeps the loss visible
        // to both the audit and __DEV__, instead of a question quietly disappearing from a lesson.
        droppedCalcSteps += 1;
        // `typeof` guard, not a bare `__DEV__`: this module is PURE and is imported by
        // scripts/lesson-render-audit.mjs under plain Node, where the React Native global does
        // not exist. The audit's own selftest caught this by throwing here on the first run.
        if (typeof __DEV__ !== 'undefined' && __DEV__) {
          console.warn('[lesson-steps] unrecognised calcStep shape dropped:', Object.keys(c ?? {}));
        }
      }
    }
  }
  return out;
}

/** Steps that gate Continue until solved. Prose never blocks; interactives always do. */
export function gates(n: Normalized): boolean {
  return n.kind === 'reveal' || n.kind === 'match' || n.kind === 'order' || n.kind === 'line' || n.kind === 'multi' || n.kind === 'build' || n.kind === 'calc';
}
