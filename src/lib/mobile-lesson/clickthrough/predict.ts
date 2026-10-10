/**
 * Predict, then reveal (M2, research2/design.md section 2): the first bar is drawn at its authored
 * length, the learner sets the second one's length, taps Check, and the authored bar grows over
 * their guess while Atlas says, in words only, whether they guessed shorter, longer or close.
 *
 * WHY THIS EXISTS. A teaching slide's two-bar chart card (lesson-visual.tsx) animates once on mount,
 * so the learner is told the gap before they have had a chance to expect anything. Asking for the
 * guess first turns the same authored chart into a surprise the learner owns. It is a commitment
 * device, not a quiz: nothing is graded, scored or counted toward XP or mastery.
 *
 * THE RULE (CONSTITUTION 3.1). The builder copies; it never writes. Every string on the card is an
 * authored `title`, `label`, `value` / `displayValue`, `explain` or `footer`. `percent` only sizes
 * geometry and is never printed. If any of those is missing the builder returns null and the
 * derived chart card ships untouched. The verdict is chosen from three fixed lines with NO digits,
 * so the card can never state a gap in numbers the lesson did not write (the pin checks this).
 *
 * Pure on purpose (no React Native): scripts/clickthrough-predict-pin.mjs imports it under plain node.
 */
import type { AnimatedVisual, LessonStep } from '@/lib/curriculum';
// Relative, not '@/': the pin loads this under plain node, which has no path alias.
import { compressTitle } from '../compress';
import { CARD_BUDGET } from '../types';
import { DRAW_MS, PREDICT_DELAY_MS, PREDICT_GROW_MS } from './timing';
import type { ClipBeat, PredictRow, PredictSpec } from './types';

/** The guess moves in tenths of the full bar: coarse enough to be a decision, not a fiddle. */
export const GUESS_STEP = 10;
export const GUESS_MAX = 100;

/**
 * The longest authored `explain` the reveal may carry. The caption box reserves three lines and
 * grows past them; beyond this it is five lines at 375pt and pushes Continue off a small phone.
 * The same ceiling stage.ts uses, so two clip kinds never disagree about how much a beat may say.
 */
export const PREDICT_CAPTION_MAX_CHARS = 150;

/** Fixed lines. No digits anywhere, so none can be mistaken for an authored figure. */
export const PREDICT_PROMPT = 'Your turn. How long is the bottom bar?';
export const PREDICT_HOW = 'Drag the bottom bar or tap minus and plus. Then tap Check.';
/*
 * Beat 0 once the guess is locked (Back or Replay after Check). Without it the caption told the
 * learner to drag and tap minus and plus while those controls were gone and the bar was frozen.
 */
export const PREDICT_REPLAY = 'The dashed outline is your guess. Watch the real bar.';
export type Verdict = 'shorter' | 'longer' | 'close';
export const VERDICT_LINE: Record<Verdict, string> = {
  shorter: 'You guessed shorter.',
  longer: 'You guessed longer.',
  close: 'Close. Nice read.',
};

const text = (s: unknown): string | null => (typeof s === 'string' && s.trim() ? s.trim() : null);

/** A guess moved one step, clamped to the bar. */
export function nudgeGuess(guess: number, dir: 1 | -1): number {
  return Math.max(0, Math.min(GUESS_MAX, guess + dir * GUESS_STEP));
}

/** A drag position (0 to 1 along the track) snapped to the nearest step. */
export function guessAt(fraction: number): number {
  if (!Number.isFinite(fraction)) return 0;
  const f = Math.max(0, Math.min(1, fraction));
  return Math.round((f * GUESS_MAX) / GUESS_STEP) * GUESS_STEP;
}

/**
 * Words, not numbers. Within one step either way is close: the guess itself is only ever a
 * multiple of GUESS_STEP, so a tighter band would call a perfect-as-possible guess on a 76 bar
 * (80) "longer", which reads as a telling-off for the control's own resolution.
 */
export function verdictOf(guess: number, percent: number): Verdict {
  const gap = guess - percent;
  if (Math.abs(gap) <= GUESS_STEP) return 'close';
  return gap < 0 ? 'shorter' : 'longer';
}

/** The authored visual on a teaching slide. Hook openers are not decks, so they never get a card. */
function visualOf(step: LessonStep): AnimatedVisual | null {
  const s = step as { type?: string; diagramVisual?: AnimatedVisual };
  return s.type === 'teachingSlide' && s.diagramVisual ? s.diagramVisual : null;
}

type Row = { label: string; display: string; percent: number; caption: string };

function rowsOf(v: AnimatedVisual): Row[] | null {
  if (v.type === 'comparison') {
    if (v.rows.length !== 2) return null;
    const rows: Row[] = [];
    for (const r of v.rows) {
      const label = text(r.label);
      const display = text(r.value);
      const caption = text(r.explain);
      const percent = r.percent;
      if (!label || !display || !caption || typeof percent !== 'number') return null;
      if (!(percent > 0 && percent <= 100)) return null;
      rows.push({ label, display, percent, caption });
    }
    return rows;
  }
  if (v.type === 'bars') {
    if (v.items.length !== 2) return null;
    /*
     * `displayValue` is required for bars, never `value`: a bars `value` is a sizing number
     * (investing-fundamentals:4:3 stores 10.3%/yr as 103), so printing it would show "103".
     */
    const max = Math.max(...v.items.map((i) => i.value));
    if (!(max > 0)) return null;
    const rows: Row[] = [];
    for (const i of v.items) {
      const label = text(i.label);
      const display = text(i.displayValue);
      const caption = text(i.explain);
      if (!label || !display || !caption || !(i.value > 0)) return null;
      rows.push({ label, display, percent: (i.value / max) * 100, caption });
    }
    return rows;
  }
  return null;
}

/** Every figure-like token in a string ("$41,000", "0.97%", "24%"). */
const figures = (s: string): string[] => s.match(/\$?\d[\d,.]*%?/g) ?? [];

/**
 * Build a predict card from an authored two-row chart, or return null.
 *
 * Null unless ALL of these hold:
 *   - the step is a teaching slide (the only step that derives a `chart` card to take over);
 *   - its diagram is a comparison with exactly 2 rows, each with a label, a `value`, a `percent`
 *     in (0, 100] and an `explain`; or bars with exactly 2 items, each with a label, a positive
 *     `value`, a `displayValue` and an `explain`;
 *   - the two labels differ and the two displays differ. behavioral-finance:13:0 authors bars
 *     labelled "30%" and "30% 2" with the same "3%" twice (survey 2026-09-22); predicting between
 *     two identical rows would be a card with nothing to find out;
 *   - the target's `explain` is at most PREDICT_CAPTION_MAX_CHARS;
 *   - the title is authored.
 * The top row is the anchor and the bottom row the target, in authored order.
 *
 * `lessonSteps` is accepted for the placement contract (parts/placements.ts) and unused.
 */
export function buildPredict(step: LessonStep, _lessonSteps?: LessonStep[]): PredictSpec | null {
  const v = visualOf(step);
  return v ? predictFromVisual(v) : null;
}

export function predictFromVisual(v: AnimatedVisual): PredictSpec | null {
  const title = text(v.title);
  if (!title) return null;
  const rows = rowsOf(v);
  if (!rows) return null;
  const [a, t] = rows;
  if (a.label === t.label || a.display === t.display) return null;
  if (t.caption.length > PREDICT_CAPTION_MAX_CHARS) return null;

  const anchor: PredictRow = { label: a.label, display: a.display, percent: a.percent };
  const target: PredictSpec['target'] = { label: t.label, display: t.display, percent: t.percent, caption: t.caption };

  /*
   * SAY IT ONCE (CONSTITUTION 5.1). personal-finance:15:2's footer "A 0.97% fee gap quietly erases
   * $41,000, 24% of your final wealth" repeats the $41,000 the reveal caption already says, so a
   * footer that restates any figure from the caption or the two displays is dropped, not trimmed.
   */
  const footer = text((v as { footer?: string }).footer);
  const said = new Set([...figures(t.caption), ...figures(a.display), ...figures(t.display)]);
  const keepFooter = footer && !figures(footer).some((f) => said.has(f)) && footer !== t.caption;

  return {
    kind: 'predict',
    title: compressTitle(title, CARD_BUDGET.title),
    anchor,
    target,
    ...(keepFooter ? { footer } : {}),
  };
}

/**
 * The clip's two beats: the anchor drawing in while the learner guesses, then the reveal.
 * Atlas celebrates a close guess and only nods at a miss: an overshoot hop for being wrong would
 * read as a reward for it (AGENTS.md reserves overshoot for Atlas and EARNED moments).
 *
 * `verdict` is the verdict of the guess as it stands (the card passes the live one before Check,
 * so the beats the timeline holds at the moment of Check already carry it). Beat 1's caption is
 * what VoiceOver hears on the reveal: the verdict line, then the authored explain. The card
 * DRAWS only the authored explain under the frame; the verdict sits in Atlas's bubble. Without
 * the verdict here a VoiceOver learner was never told how the guess went (accessibilityLiveRegion
 * on the bubble is Android-only).
 */
export function predictBeats(spec: PredictSpec, verdict: Verdict, locked: boolean): ClipBeat[] {
  return [
    { caption: locked ? PREDICT_REPLAY : PREDICT_HOW, motionMs: DRAW_MS, reaction: 'point' },
    {
      caption: `${VERDICT_LINE[verdict]} ${spec.target.caption}`,
      motionMs: PREDICT_DELAY_MS + PREDICT_GROW_MS,
      reaction: verdict === 'close' ? 'celebrate' : 'nod',
    },
  ];
}

/** Every sentence this card puts on screen, for the deck's say-it-once check. */
export function textOf(spec: PredictSpec): string[] {
  return [spec.title, spec.anchor.label, spec.anchor.display, spec.target.label, spec.target.display, spec.target.caption, ...(spec.footer ? [spec.footer] : [])];
}

/*
 * THE HAND-PICKED PLACEMENTS, for the integrator to add to parts/placements.ts with slot 'chart'.
 * Keys are `course:lessonNum:stepIndex` (stepId.ts), lesson NUMBER not array index: design.md
 * section M2 wrote `personal-finance:14:2` and `investing-fundamentals:3:3`, which are the array
 * indexes of these same two slides and would place nothing (or the wrong step) under the real key.
 *
 *   personal-finance:15:2       "Index Fund vs Active Fund: $10K Over 30 Years" (courses/personalFinance.ts:3663
 *                               comparison, 100 / 76). Guess the active fund against the index fund.
 *   investing-fundamentals:4:3  "Stocks vs. Bonds (1926-2023)" (courses/investingFundamentals.ts:67 bars,
 *                               10.3%/yr / 5.1%/yr). Guess bonds against stocks.
 *
 * REFUSED, with the reason, so nobody re-adds them:
 *   global-economics:22:5 (opt-in 40% vs opt-out 90%): the deck just before it, 22:4, already says
 *     "from 40% to 90%", so the guess would be a memory test (the pin's leak check fails on it when
 *     the caption ceiling is lifted); its 181-character explain is also over PREDICT_CAPTION_MAX_CHARS.
 *   corporate-finance:4:4 and behavioral-finance:19:2: already carry a scene interactive, and a deck
 *     holds one interactive (placements.ts). corporate-finance:4:4's scene also says "the 15%".
 */
export const PREDICT_PLACEMENTS = ['personal-finance:15:1', 'investing-fundamentals:4:2'] as const;
