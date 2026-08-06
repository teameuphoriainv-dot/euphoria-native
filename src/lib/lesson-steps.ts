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
import type { LessonStep } from '@/lib/curriculum';
import type { MatchSpec } from '@/components/matching-pairs';
import type { MultiSpec } from '@/components/multi-select';
import type { NumberLineSpec } from '@/components/number-line';
import type { OrderSpec } from '@/components/order-steps';
import type { RevealSpec } from '@/components/tap-reveal';
import type { TileSpec } from '@/components/tile-builder';

export type ProseBlock =
  | { b: 'p'; text: string }
  | { b: 'stat'; value: string; label: string }
  | { b: 'term'; term: string; definition: string; example?: string }
  | { b: 'pair'; leftLabel: string; left: string; rightLabel: string; right: string }
  | { b: 'event'; when: string; what: string; detail?: string };

export type Normalized =
  | { kind: 'prose'; label?: string; title: string; blocks: ProseBlock[] }
  | { kind: 'choice'; prompt: string; options: string[]; correct: number; right: string; wrong: string }
  | { kind: 'reveal'; spec: RevealSpec }
  | { kind: 'match'; spec: MatchSpec }
  | { kind: 'order'; spec: OrderSpec }
  | { kind: 'line'; spec: NumberLineSpec }
  | { kind: 'multi'; spec: MultiSpec }
  | { kind: 'build'; spec: TileSpec }
  | { kind: 'todo'; type: string; title: string; blocks: ProseBlock[] };

const p = (text: string): ProseBlock => ({ b: 'p', text });
/** paragraphs arrive as string[] but a few authored entries are empty — drop those, not the step */
const paras = (xs?: string[]): ProseBlock[] => (xs ?? []).filter((t) => t?.trim()).map(p);
const terms = (xs?: { term: string; definition: string; example?: string }[]): ProseBlock[] =>
  (xs ?? []).map((t) => ({ b: 'term', term: t.term, definition: t.definition, example: t.example }));

/** de-duplicate a tray while preserving author order — repeated distractors would be unplaceable */
const uniq = (xs: string[]): string[] => Array.from(new Set(xs));

export function normalizeStep(step: LessonStep): Normalized {
  const s = step as Extract<LessonStep, { type: string }> & Record<string, any>;
  switch (s.type) {
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
      return { kind: 'prose', label: 'To start', title: s.title, blocks: [p(s.fact), p(s.outcome)] };
    case 'teachingSlide':
      return {
        kind: 'prose',
        label: s.sectionLabel,
        title: s.title,
        blocks: [
          ...paras(s.paragraphs),
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
    default:
      return {
        kind: 'todo',
        type: s.type,
        title: s.title ?? 'Coming soon',
        blocks: paras([s.setup, s.principle, s.optimalOutcome, s.formula]),
      };
  }
}

/** Steps that gate Continue until solved. Prose never blocks; interactives always do. */
export function gates(n: Normalized): boolean {
  return n.kind === 'reveal' || n.kind === 'match' || n.kind === 'order' || n.kind === 'line' || n.kind === 'multi' || n.kind === 'build';
}
