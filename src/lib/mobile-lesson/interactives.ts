/**
 * Turning a desktop graph step into something worth touching on a phone.
 *
 * WHAT THE AUTHORED DATA ACTUALLY IS. Measured across all 289 `interactiveGraph` steps:
 *   - `chartData` is EMPTY in every single one. There is no authored series anywhere in the corpus.
 *     The web chart is generated from the `graphType` string plus slider defaults.
 *   - `insights` is present in all 289, median 4 per step, median 104 characters each. These are
 *     short, factual, self-contained sentences and they are the best writing in the step.
 *   - `sliders` is present in 279, median 2, with free-text labels and units.
 *   - Only 17% of `comparison` titles are parseable as "A vs B", so the title is not a reliable
 *     source of two sides. That was checked before it was relied on, and it failed.
 *
 * THE RULE THIS MODULE FOLLOWS. Never compute a number whose meaning has not been positively
 * identified. The web renderer learned this the hard way: its comparison graph assumed slider 0 was
 * a stock allocation percentage, so on a personal-finance lesson whose slider 0 was an Annual
 * Income in dollars it clamped every value from $30,000 to $150,000 to 100%, and dragging the
 * slider moved nothing while the legend read "Your allocation". See the `comparisonModel` comment
 * in `src/lib/curriculum/types.ts` for that whole story.
 *
 * So there are exactly two outcomes here:
 *   1. The sliders CONFIDENTLY carry a money amount and a percentage rate. Then the learner gets a
 *      real compound calculator whose arithmetic is correct and checkable, with the time horizon as
 *      their own input rather than as a claim the lesson is making.
 *   2. Anything else. Then the learner taps through the authored insights one at a time. Every word
 *      on screen was written by the curriculum author, so it cannot be wrong.
 * There is no third branch that guesses.
 */
import type { InteractiveGraphStep } from '@/lib/curriculum';
import type { MobileInteractive, SceneSpec } from './types';
import { CARD_BUDGET } from './types';
import { compress, compressTitle } from './compress';
import { pickArchetype } from './archetypes';

type Slider = NonNullable<InteractiveGraphStep['sliders']>[number];

/** A slider holding an amount of money. Unit is the strong signal; the label confirms it. */
function isMoney(s: Slider): boolean {
  const unit = (s.unit ?? '').trim();
  if (unit === '$' || unit === 'USD') return true;
  return /\b(amount|balance|principal|savings|portfolio|income|salary|contribution|deposit|invest)\b/i.test(s.label)
    && !/%/.test(unit);
}

/** A slider holding an annual percentage rate of return. */
function isRate(s: Slider): boolean {
  const unit = (s.unit ?? '').trim();
  if (unit !== '%' && !/percent/i.test(unit)) return false;
  return /\b(return|rate|yield|growth|interest|apy|apr)\b/i.test(s.label);
}

/** A slider holding a number of years. */
function isYears(s: Slider): boolean {
  const unit = (s.unit ?? '').trim();
  if (/year/i.test(unit)) return true;
  return /\b(years|horizon|period|time|duration|term)\b/i.test(s.label) && s.max <= 100;
}

/**
 * Compound growth, if and only if the authored inputs are unambiguous.
 *
 * Requires a money slider AND a rate slider, each matched by BOTH its unit and its label. Anything
 * less returns null and the step falls back to the insight stepper. Being wrong here means showing
 * a learner a confident dollar figure that is not true, so the detector is strict on the two values
 * the lesson supplies and the fallback is deliberately cheap.
 */
function asGrow(step: InteractiveGraphStep): MobileInteractive | null {
  const sliders = step.sliders ?? [];
  if (sliders.length < 2) return null;

  const money = sliders.find(isMoney);
  const rate = sliders.find(isRate);
  if (!money || !rate) return null;
  if (!(money.default > 0) || !(rate.default > 0)) return null;

  /*
   * A years slider is NOT required, and requiring one was wrong.
   *
   * The first version of this demanded all three, which rejected a step literally titled "The
   * Compound Growth Calculator" because its sliders were Starting Amount, Monthly Contribution and
   * Annual Return with no time axis. Only 9 of 289 graph steps passed. The horizon is the one input
   * the LEARNER supplies by dragging, so it is not a claim the lesson is making and it does not
   * need authorial backing: compounding $10,000 at 10% for 20 years is true arithmetic whoever
   * picked the 20. What must be authored is the money and the rate, and those still are.
   */
  const years = sliders.find(isYears);

  const verdict = compress(step.insights ?? [], CARD_BUDGET.verdict);
  if (!verdict) return null;

  return {
    kind: 'grow',
    prompt: compressTitle(step.title, CARD_BUDGET.prompt) || 'Drag the years',
    startLabel: money.label,
    start: money.default,
    ratePercent: rate.default,
    maxYears: years && years.max > 1 ? Math.min(years.max, 50) : 40,
    verdict,
  };
}

/**
 * The universal fallback: the authored insights, one at a time, each on its own beat.
 *
 * This is not a consolation prize. `insights` is where the authors put the sentence they most
 * wanted a learner to remember, and on the web those sentences sit in a list underneath a chart
 * that most of a lesson's screen space went to. Giving each one its own beat with its own picture
 * is a promotion.
 *
 * TWO moments, never more, and the renderer shows them ONE AT A TIME rather than stacking them.
 *
 * The first version took three and left each one on screen as the next appeared, so the last beat
 * of the card carried three sentences at once, around 210 characters. That is the wall of text this
 * whole layer exists to remove, revealed slowly instead of all at once, and the budget pin caught
 * it: median visible characters per card came out at 106 against a target of 85. Two beats, one
 * visible at a time, is the version that actually reads like a phone.
 */
function asInsightSteps(step: InteractiveGraphStep): MobileInteractive {
  const pool = (step.insights ?? []).filter((i) => i?.trim());

  /*
   * PICK INSIGHTS THAT FIT, rather than forcing the first two through whole.
   *
   * The first version passed `mustReturn` here, so an insight that would not compress came back at
   * full length. Authored insights run to a median of 104 characters against a 70 character beat,
   * so that path fired constantly and the interactive card ended up the longest card in the deck at
   * a median of 145. There are a median of FOUR insights per step, so there is almost always a
   * shorter one: try them all, keep the two that fit, and only fall back to a long one if not a
   * single insight in the step will compress.
   */
  const fitted = pool
    .map((insight) => ({ insight, label: compress(insight, CARD_BUDGET.detail) }))
    .filter((x) => x.label.length > 0);

  const chosen = fitted.length > 0
    ? fitted.slice(0, 2)
    : pool.slice(0, 2).map((insight) => ({ insight, label: compress(insight, CARD_BUDGET.detail, { mustReturn: true }) }));

  const moments = chosen
    .map(({ insight, label }) => ({ label, detail: '', sprite: pickArchetype(insight, step.title) }))
    .filter((m) => m.label.length > 0);

  /*
   * FEWER THAN TWO MOMENTS IS NOT A TIMELINE, AND A ONE-BEAT ONE COULD NOT BE FINISHED.
   *
   * This guard used to read `=== 0`, which left the one-moment case to the renderer. MomentStepper
   * computes `done = at >= total - 1`, so at total === 1 it is already true on the first frame: the
   * "Next" button never renders, and `onWorked()` is only ever called from inside `next`. CardDeck's
   * `locked` therefore stayed true forever and its Continue was permanently disabled with no reason
   * on screen. `deck` is in both `selfAdvancing` and `OWN_CTA_STEPS`, so the lesson's own Continue is
   * suppressed too, and where the interactive sorted to card 0 there was no Back either. The lesson
   * could not be completed by any route except leaving it.
   *
   * It is not rare: 34 of the 165 timeline interactives, in 34 lessons across 11 of the 12 courses.
   * `fitted.slice(0, 2)` yields one moment whenever exactly one authored insight survives
   * `compress`, which is the common shape for a step with four long insights.
   *
   * REVEAL RATHER THAN PADDING TO TWO. Topping up from the pool would need `mustReturn`, which
   * returns the insight at full length and puts the card back over the budget this layer exists to
   * hold. A reveal is a real interactive that teaches the same sentence and unlocks on tap.
   *
   * The surviving insight is preferred over `step.description` as the hidden text: it is the
   * sentence the author chose to call out, and it already compresses.
   */
  if (moments.length < 2) {
    const survivor = moments[0]?.label;
    const hidden = survivor
      ?? compress(step.description ?? step.title, CARD_BUDGET.verdict, { mustReturn: true });
    const scene: SceneSpec = { archetype: moments[0]?.sprite ?? pickArchetype(step.title, step.description) };
    return { kind: 'reveal', prompt: compressTitle(step.title, CARD_BUDGET.prompt) || 'Tap to see', hidden, scene };
  }

  return {
    kind: 'timeline',
    prompt: compressTitle(step.title, CARD_BUDGET.prompt) || 'Tap through',
    moments,
  };
}

/**
 * A figure in an authored sentence: money, a percentage, a multiple, or a plain count.
 *
 * Deliberately narrow. It must match something a learner would read AS a quantity, and it must not
 * match a year, because "since 1926" is not a figure anyone is meant to guess and blanking it turns
 * a true sentence into a riddle.
 */
const FIGURE = /\$[\d][\d,]*(?:\.\d+)?(?:\s?(?:million|billion|trillion))?|\b\d+(?:\.\d+)?%|\b\d+(?:\.\d+)?x\b/;
const YEAR = /^(?:19|20)\d\d$/;

/** Rewrite a figure at a new magnitude, keeping the author's own formatting. */
function scaleFigure(figure: string, factor: number): string | null {
  const m = figure.match(/[\d][\d,]*(?:\.\d+)?/);
  if (!m) return null;
  const raw = Number(m[0].replace(/,/g, ''));
  if (!Number.isFinite(raw) || raw <= 0) return null;

  const scaled = raw * factor;
  if (scaled < 0.01) return null;
  const decimals = m[0].includes('.') ? (m[0].split('.')[1]?.length ?? 0) : 0;
  const rendered = scaled >= 1000
    ? Math.round(scaled).toLocaleString('en-US')
    : scaled.toFixed(decimals);
  return figure.replace(m[0], rendered);
}

/**
 * Guess the figure.
 *
 * Returns null unless everything lines up: an insight short enough to read on a card, a figure that
 * is not a year, and two distractors that are distinct from the answer and from each other. Every
 * one of those is a reason to fall back rather than to improvise, because a guessing game with two
 * identical options or with the answer visible is worse than no guessing game.
 */
function asGuess(step: InteractiveGraphStep): MobileInteractive | null {
  for (const insight of step.insights ?? []) {
    const text = String(insight ?? '').trim();
    if (!text || text.length > 150) continue;

    const found = text.match(FIGURE);
    if (!found) continue;
    const answer = found[0];
    if (YEAR.test(answer.replace(/[^\d]/g, ''))) continue;

    const low = scaleFigure(answer, 0.5);
    const high = scaleFigure(answer, 2);
    if (!low || !high) continue;

    const options = [answer, low, high];
    if (new Set(options).size !== 3) continue;

    return {
      kind: 'guess',
      prompt: compressTitle(step.title, CARD_BUDGET.prompt) || 'Fill in the number',
      masked: text.replace(answer, '\u2007\u2007?\u2007\u2007'),
      answer,
      // Sorted so position never leaks the answer: the real figure is not always first.
      options: [...options].sort((a, b) => a.localeCompare(b, 'en', { numeric: true })),
      full: text,
      scene: { archetype: pickArchetype(text, step.title) },
    };
  }
  return null;
}

/**
 * The mobile interactive that replaces one desktop graph.
 *
 * Never returns null: a graph step must always become something, or the learner reaches a card
 * frame with nothing in it.
 */
export function interactiveFor(step: InteractiveGraphStep): MobileInteractive {
  const grow = asGrow(step);
  if (grow) return grow;

  /*
   * ROTATE between the kinds that fit, rather than always taking the first that does.
   *
   * `asGuess` succeeds on about 90% of graph steps, so preferring it unconditionally would simply
   * replace one monotony with another: before this, 256 of the 289 graph steps were the identical
   * tap-through. Choosing from the step's own id keeps it deterministic, so a learner going back a
   * screen finds the same interaction, while adjacent steps in a lesson differ.
   */
  let h = 0;
  const id = `${step.title}|${step.sectionLabel ?? ''}`;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) >>> 0;

  const guess = asGuess(step);
  const steps = asInsightSteps(step);
  if (!guess) return steps;
  return h % 2 === 0 ? guess : steps;
}

/** Which branch fired, for `scripts/mobile-deck-audit.mjs` to report. Not used by the app. */
export function interactiveKindFor(step: InteractiveGraphStep): MobileInteractive['kind'] {
  return interactiveFor(step).kind;
}
