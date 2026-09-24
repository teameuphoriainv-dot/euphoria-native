/**
 * Leverage Lens: the same price move, a very different return on the cash you put in.
 *
 * WHY THIS EXISTS. alternative-investments:2:4 ("How Leverage Amplifies Real Estate Returns")
 * shipped a guess card that blanked "5%" in "A 5% appreciation on a $500K property with 80%
 * leverage = 25% return on equity". Because "5%" is also the tail of "25%", the card read
 * "= 2 ? return on equity" (scouts.json, measured 2026-09-22). Even with the half-mask fixed, a
 * guess card only asks the learner to recall a number. The step's own sliders (Down Payment 10-50,
 * default 20; Annual Appreciation -10 to 15, default 5) are exactly the two inputs of the idea, so
 * the learner can drive it instead and see the downside by arithmetic rather than by being told.
 *
 * THE ONLY FORMULA. Return on your cash = price move / share of the price you paid in cash:
 *   roe(down, appr) = appr / (down / 100)
 * Before rent, mortgage interest and costs, which is why the card says so on screen. The authored
 * sentence is the check: roe(20, 5) = 25, the "25% return on equity" the lesson states.
 *
 * NOTHING HERE HAS A DEFAULT. Every chip value is an authored slider end or default, and
 * `buildLever` returns null unless the step's own insight states the figure the defaults produce.
 * A re-sync that rewrites the step therefore removes the card instead of leaving it showing numbers
 * the lesson no longer contains (CONSTITUTION 3.1).
 */
import type { LessonStep } from '@/lib/curriculum';

export type LeverSpec = {
  kind: 'lever';
  prompt: string;
  /** Down payment chips, percent of the price: the authored slider min, default and max. */
  downChips: number[];
  /** Price move chips, percent: the authored slider min, default and max. */
  moveChips: number[];
  /** Where the card opens: the authored slider defaults, which reproduce the authored figure. */
  down: number;
  move: number;
  /** The caveat under the big number. Leverage maths without it reads as a promise. */
  note: string;
  /** Shown once the learner has tried a second combination. */
  verdict: string;
};

/*
 * Written as appr * 100 / down rather than appr / (down / 100). Same maths, but 0.2 has no exact
 * binary form, so the second spelling leaves room for a 24.999999 on some future chip pair; with
 * integer chips the first spelling divides two integers and stays exact.
 */
/** Return on your cash, in percent, for a price move of `apprPct` with `downPct` of the price down. */
export function roe(downPct: number, apprPct: number): number {
  return (apprPct * 100) / downPct;
}

/** How many times the price move your cash moves by. 20% down means 5x. */
export function multiplier(downPct: number): number {
  return 100 / downPct;
}

/** The lowest and highest return any chip pair on this card can show, for the bar's scale. */
export function roeRange(spec: Pick<LeverSpec, 'downChips' | 'moveChips'>): { min: number; max: number } {
  let min = 0;
  let max = 0;
  for (const d of spec.downChips) {
    for (const m of spec.moveChips) {
      const r = roe(d, m);
      if (r < min) min = r;
      if (r > max) max = r;
    }
  }
  return { min, max };
}

type Slider = { label: string; min: number; max: number; default: number; unit: string };

const isPct = (s: Slider) => /%|percent/i.test(s.unit ?? '');

/** A figure as a whole percentage, not the tail of a longer one: "5%" must not match inside "25%". */
const statesPct = (text: string, n: number) =>
  new RegExp(`(^|[^\\d.])${String(n).replace('.', '\\.')}%`).test(text);

/** Min, default, max, deduplicated and in order. These are the only values a chip may take. */
const chipsOf = (s: Slider) => [...new Set([s.min, s.default, s.max])].sort((a, b) => a - b);

export const LEVER_PROMPT = 'Same price move. How much does your cash move?';
export const LEVER_NOTE = 'return on your cash, before rent and costs';
export const LEVER_VERDICT = 'Less cash down makes every price move hit you harder, up and down.';

/**
 * Build the card from an interactiveGraph step, or return null.
 *
 * Null unless ALL of these are authored on the step:
 *   - a percent slider labelled as a down payment, with a default above 0;
 *   - a percent slider labelled as appreciation (a price move);
 *   - an insight that states the appreciation default, the leverage it implies (100 - down) and the
 *     return roe(down, appreciation) as whole percentages. On alternative-investments:2:4 that is
 *     "A 5% appreciation on a $500K property with 80% leverage = 25% return on equity."
 * The third check is what ties the card's opening screen to a sentence the author wrote. If the
 * defaults and the sentence ever disagree, the card is not built.
 *
 * `lessonSteps` is accepted for the placement contract (parts/placements.ts) and unused: this card's
 * figures all sit on its own step.
 */
export function buildLever(step: LessonStep, _lessonSteps?: LessonStep[]): LeverSpec | null {
  const s = step as { type?: string; sliders?: Slider[]; insights?: string[] };
  if (s.type !== 'interactiveGraph') return null;
  const sliders = Array.isArray(s.sliders) ? s.sliders : [];
  const downSlider = sliders.find((x) => isPct(x) && /down\s*payment/i.test(x.label));
  const moveSlider = sliders.find((x) => isPct(x) && /appreciation/i.test(x.label));
  if (!downSlider || !moveSlider) return null;
  if (!(downSlider.min > 0) || !(downSlider.default > 0) || downSlider.max > 100) return null;

  const down = downSlider.default;
  const move = moveSlider.default;
  const expected = roe(down, move);
  if (!Number.isInteger(expected)) return null;

  const insights = Array.isArray(s.insights) ? s.insights : [];
  const authored = insights.find(
    (t) =>
      /appreciation/i.test(t) &&
      /leverage/i.test(t) &&
      statesPct(t, move) &&
      statesPct(t, 100 - down) &&
      statesPct(t, expected),
  );
  if (!authored) return null;

  return {
    kind: 'lever',
    prompt: LEVER_PROMPT,
    downChips: chipsOf(downSlider),
    moveChips: chipsOf(moveSlider),
    down,
    move,
    note: LEVER_NOTE,
    verdict: LEVER_VERDICT,
  };
}

/** Every fixed sentence this card puts on screen, for the deck's say-it-once check. */
export function textOf(spec: LeverSpec): string[] {
  return [spec.prompt, spec.note, spec.verdict];
}
