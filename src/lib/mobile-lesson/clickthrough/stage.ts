/**
 * Stage (M1, research2/design.md section 2): one authored diagram played as a short Atlas clip,
 * one item per beat. Each Next draws the next bar, line step or pictograph row in the accent, dims
 * the ones already drawn, and puts that item's authored `explain` under the frame.
 *
 * WHY THIS EXISTS. A teaching slide's chart card animates once on mount (lesson-visual.tsx) and the
 * item explanations sit behind taps most learners never make. The same authored diagram, drawn one
 * item at a time with its own sentence, turns the chart into the lesson's worked example.
 *
 * THE RULE (CONSTITUTION 3.1). The builder copies; it never writes. Every string on the card is an
 * authored `title`, `label`, `displayValue`/`value`, `explain` or `footer`. `magnitude` only sizes
 * geometry and is never printed. If any item is missing any of those, the builder returns null and
 * the derived chart card ships untouched: a stage with one blank caption would be a clip that goes
 * silent mid-way, and a stage that filled the gap would be putting words in the author's mouth.
 *
 * Pure on purpose (no React Native): scripts/clickthrough-stage-pin.mjs imports it under plain node.
 */
import type { AnimatedVisual, LessonStep } from '@/lib/curriculum';
// Relative, not '@/': the pin loads this under plain node, which has no path alias.
import { getSprite } from '../../pixel/sprites';
import type { StageItem, StageSpec } from './types';

export const STAGE_MIN_ITEMS = 2;
export const STAGE_MAX_ITEMS = 5;
/**
 * The longest authored `explain` a beat may carry. The card reserves the height of the LONGEST
 * caption on the clip (stage-card.tsx CaptionSlot), so a long one never makes the controls jump,
 * but past this the caption block is five lines at 375pt and pushes Continue off a small phone.
 * Above scene.ts's 125 because the stage has no separate prompt line to pay for.
 */
export const STAGE_CAPTION_MAX_CHARS = 150;
/** One title line at 375pt on this card, the same ceiling the deck's own title budget uses. */
export const STAGE_TITLE_MAX_CHARS = 60;
/**
 * Most marks in one pictograph row. Ten 18pt sprites plus gaps fill a 375pt frame; an eleventh
 * would wrap and read as a second row, which on an isotype chart is a different number.
 */
export const STAGE_MAX_MARKS = 10;

/**
 * A stage over a pictograph also carries the mark and its unit key. An isotype chart without its key
 * ("each coin = one month") is a row of pictures with no number in it, so for pictograph mode this
 * is required, and the builder returns null without it.
 */
export type StageClipSpec = StageSpec & { mark?: { sprite: string; unitLabel: string } };

const text = (s: unknown): string | null => (typeof s === 'string' && s.trim() ? s.trim() : null);

/**
 * A line point's authored `value` as a number, for sizing only, or null.
 * Accepts "$2,190", "$117K", "4.5%", "~26%", "1,020,000"; the unit class is returned so a line
 * mixing "$" and "%" points is refused: sharing one axis would draw a dollar and a percent as
 * comparable heights, which is a false picture of authored data.
 */
export function parseAuthored(value: string): { n: number; unit: '$' | '%' | '' } | null {
  const m = /^\s*~?\s*(\$)?\s*(\d{1,3}(?:,\d{3})+|\d+)(\.\d+)?\s*([KMBT])?\s*(%)?\s*$/i.exec(value);
  if (!m) return null;
  const [, dollar, whole, frac, suffix, pct] = m;
  if (dollar && pct) return null;
  const scale = suffix ? { K: 1e3, M: 1e6, B: 1e9, T: 1e12 }[suffix.toUpperCase() as 'K' | 'M' | 'B' | 'T'] : 1;
  const n = Number(whole.replace(/,/g, '') + (frac ?? '')) * scale;
  return Number.isFinite(n) ? { n, unit: dollar ? '$' : pct ? '%' : '' } : null;
}

/** The authored visual on a step: a teaching slide's diagram or a hook opener's chart. */
export function visualOf(step: LessonStep): AnimatedVisual | null {
  const s = step as { diagramVisual?: AnimatedVisual; visual?: AnimatedVisual };
  return s.diagramVisual ?? s.visual ?? null;
}

/**
 * Build a stage from an authored visual, or return null.
 *
 * Null unless ALL of these hold:
 *   - the visual is bars, line or pictograph with a non-empty title of at most STAGE_TITLE_MAX_CHARS;
 *   - it has 2 to 5 items, and EVERY item has a label, a displayable authored value and an
 *     `explain` of at most STAGE_CAPTION_MAX_CHARS;
 *   - bars: every `value` is a finite number at or above 0 (a stage grows up from one baseline);
 *   - line: every `value` string parses with parseAuthored, all in one unit, none below 0;
 *   - pictograph: the sprite exists, a unit key is authored, and every row is a whole number of
 *     marks from 1 to STAGE_MAX_MARKS. A fraction of a mark is drawn as a clipped sprite on the
 *     static chart; stamped one by one it would be a mark that is not there.
 * Items keep their authored order. Sorting them would change the story the author wrote, and the
 * stage pin's break test sorts them to prove it notices.
 */
export function buildStageFromVisual(visual: AnimatedVisual | null | undefined): StageClipSpec | null {
  if (!visual) return null;
  const title = text(visual.title);
  if (!title || title.length > STAGE_TITLE_MAX_CHARS) return null;
  const footer = text((visual as { footer?: string }).footer) ?? undefined;

  let raw: { label: unknown; display: unknown; magnitude: number | null; explain: unknown }[];
  let mode: StageSpec['mode'];
  let mark: StageClipSpec['mark'];

  if (visual.type === 'bars') {
    mode = 'bars';
    raw = (visual.items ?? []).map((it) => ({
      label: it.label,
      display: it.displayValue ?? (Number.isFinite(it.value) ? String(it.value) : null),
      magnitude: Number.isFinite(it.value) && it.value >= 0 ? it.value : null,
      explain: it.explain,
    }));
  } else if (visual.type === 'line') {
    mode = 'line';
    const parsed = (visual.points ?? []).map((p) => (typeof p.value === 'string' ? parseAuthored(p.value) : null));
    const units = new Set(parsed.map((p) => p?.unit));
    if (units.size !== 1) return null;
    raw = (visual.points ?? []).map((p, i) => ({
      label: p.label,
      display: p.value,
      magnitude: parsed[i] && parsed[i]!.n >= 0 ? parsed[i]!.n : null,
      explain: p.explain,
    }));
  } else if (visual.type === 'pictograph') {
    mode = 'pictograph';
    const unitLabel = text(visual.unitLabel);
    if (!unitLabel || !getSprite(visual.sprite) || !(visual.unitValue > 0)) return null;
    mark = { sprite: visual.sprite, unitLabel };
    raw = (visual.rows ?? []).map((r) => {
      const marks = Number.isFinite(r.value) ? r.value / visual.unitValue : NaN;
      const whole = Number.isInteger(marks) && marks >= 1 && marks <= STAGE_MAX_MARKS;
      return {
        label: r.label,
        display: r.displayValue ?? (Number.isFinite(r.value) ? String(r.value) : null),
        magnitude: whole ? marks : null,
        explain: r.explain,
      };
    });
  } else {
    return null;
  }

  if (raw.length < STAGE_MIN_ITEMS || raw.length > STAGE_MAX_ITEMS) return null;
  const items: StageItem[] = [];
  for (const r of raw) {
    const label = text(r.label);
    const display = text(r.display);
    const caption = text(r.explain);
    if (!label || !display || !caption || r.magnitude === null) return null;
    if (caption.length > STAGE_CAPTION_MAX_CHARS) return null;
    items.push({ label, display, magnitude: r.magnitude, caption });
  }
  // A diagram whose every item is zero has nothing to draw: each beat would be an empty frame.
  if (!items.some((i) => i.magnitude > 0)) return null;

  return { kind: 'stage', title, mode, items, ...(footer ? { footer } : {}), ...(mark ? { mark } : {}) };
}

/**
 * The placement contract (parts/placements.ts): build from the RAW step at the placed position.
 * `lessonSteps` is unused; every figure a stage shows sits on its own step's visual.
 */
export function buildStage(step: LessonStep, _lessonSteps?: LessonStep[]): StageClipSpec | null {
  return buildStageFromVisual(visualOf(step));
}

/** Every line the card puts on screen, for the deck's say-it-once check. */
export function textOf(spec: StageClipSpec): string[] {
  return [spec.title, ...spec.items.flatMap((i) => [i.label, i.display, i.caption]), ...(spec.footer ? [spec.footer] : []), ...(spec.mark ? [spec.mark.unitLabel] : [])];
}

/**
 * The hand-picked stage positions, `course:lesson:stepIndex` (lesson = its `num`), for the
 * integrator to add to PLACEMENTS with `slot: 'chart'`. Each is a teaching slide whose derived deck
 * has a chart card drawing this same visual, so the stage replaces the static chart with the clip of
 * it and no other card changes. Neither holds a scene, dial or lever (a deck carries one
 * interactive), and neither is a predict candidate (design M2 took the Stocks vs. Bonds slide).
 *   personal-finance:3:2   line, "The Latte Factor: $6/Day Coffee" (personalFinance.ts:76)
 *   personal-finance:12:2  bars, "Spending Filters: How Many Impulse Buys Survive" (personalFinance.ts:3017)
 * Only 12 steps in the corpus build a stage at all, and 5 of those sit on a deck with a chart card;
 * two of the five already hold a scene, and one is the predict slide.
 */
export const STAGE_PLACEMENTS = ['personal-finance:3:2', 'personal-finance:12:2'] as const;
