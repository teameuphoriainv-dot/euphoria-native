/**
 * Dial: a live formula card, built only from numbers the lesson authored.
 *
 * WHY THIS EXISTS. Measured 2026-09-22 in the WRAPPED loader (src/lib/curriculum/index.ts):
 * corporate-finance lesson 6 renders hook, stakes, deck (idea, term, chart, takeaway), then three
 * question steps. Zero hands-on steps, in a lesson whose whole point is one subtraction the learner
 * could be doing with their own thumb. personal-finance lesson 14's only interactive is a guess card
 * whose masked sentence reads "The ? rule: home value x ? / 12", which asks the learner to guess
 * the name of the rule rather than use it.
 *
 * TWO FORMULAS, BOTH AUTHORED.
 *   ccc       Cash Conversion Cycle = DIO + DSO - DPO. corporateFinance.ts:2027 writes
 *             "A company with 45 DIO, 30 DSO, and 60 DPO has CCC = 45+30-60 = 15 days."
 *   rentRule  Break-even rent = home price x 5% / 12. personalFinance.ts:3435 writes
 *             "A $400,000 home: $20,000 yearly, $1,667 monthly."
 *
 * THE RULE (CONSTITUTION 3.1). Every number on the card is one the lesson authored, or plain math
 * on those. The builders READ the authored figures on every load and check that the formula
 * reproduces the authored answer. If a re-sync rewrote the sentence, or the arithmetic stops
 * matching, the builder returns null and the derived deck ships untouched. There is no default:
 * a dial that shows 45/30/60 when the lesson no longer says 45/30/60 is a fabricated number.
 *
 * Pure module: no React, no runtime imports, so `node --import ./scripts/ts-resolve-hooks.mjs`
 * can load it and scripts/part-dial-pin.mjs can check the math against the corpus.
 */
import type { LessonStep } from '@/lib/curriculum';

export type DialFormula = 'ccc' | 'rentRule';

export type DialInput = {
  label: string;
  /** Where the dial starts. Always an authored figure. */
  value: number;
  /** One press of +/- (ccc), or the gap between price chips (rentRule). */
  step: number;
  min: number;
  max: number;
};

export type DialSpec = {
  kind: 'dial';
  prompt: string;
  inputs: DialInput[];
  formula: DialFormula;
  /** The target the learner is steering toward (ccc only). */
  goal?: string;
  /** Said once the learner has worked the dial. */
  verdict: string;
  /**
   * An authored figure to hold against the output (rentRule: the lesson's comparable rent slider
   * default). Absent when the lesson does not author one; the card then skips that question.
   */
  compare?: { label: string; value: number };
};

/** The rule's own constants. Written in the authored sentence as "5%" and "divide by 12". */
const RENT_RULE_RATE = 0.05;
const MONTHS = 12;

/** Pure: the formula's output for these input values, in input order. */
export function evaluate(spec: Pick<DialSpec, 'formula'>, values: readonly number[]): number {
  if (spec.formula === 'ccc') {
    const [dio = 0, dso = 0, dpo = 0] = values;
    return dio + dso - dpo;
  }
  const [price = 0] = values;
  return (price * RENT_RULE_RATE) / MONTHS;
}

/**
 * Dollars with thousands commas, no cents: 1666.67 -> "$1,667".
 *
 * Written out rather than using toLocaleString, because Node's and Hermes' Intl builds are not
 * guaranteed to agree, and the pin compares this output byte for byte with the authored "$1,667".
 */
export function dollars(n: number): string {
  const r = Math.round(Math.abs(n));
  const s = String(r).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${n < 0 ? '-' : ''}$${s}`;
}

/** "$400K" for a whole thousand, which is how the lesson itself writes it on the chips' scale. */
export function dollarsShort(n: number): string {
  return n >= 1000 && n % 1000 === 0 ? `$${n / 1000}K` : dollars(n);
}

/** Every authored string on a step, in any field, so a guard can search the step as written. */
function authoredStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) for (const v of value) authoredStrings(v, out);
  else if (value && typeof value === 'object') for (const v of Object.values(value)) authoredStrings(v, out);
  return out;
}

const textOfStep = (step: LessonStep) => authoredStrings(step).join('\n');

/**
 * Normalise the minus sign. The authored example writes "45+30−60" with U+2212, and a guard
 * matching only "-" would null out a correct lesson over typography.
 */
const plainMinus = (s: string) => s.replace(/−/g, '-');

/*
 * ---- ccc ----
 * The authored sentence, matched loosely enough to survive spacing edits and tightly enough that
 * the three numbers are unambiguously DIO, DSO and DPO in that order.
 */
const CCC_FIGURES = /(\d+)\s*DIO,\s*(\d+)\s*DSO,\s*and\s*(\d+)\s*DPO/;
const CCC_RESULT = /=\s*(-?\d+)\s*days/;

function buildCcc(step: LessonStep): DialSpec | null {
  const text = plainMinus(textOfStep(step));
  const figures = text.match(CCC_FIGURES);
  if (!figures) return null;
  // The result must sit in the SAME authored sentence as the figures, or "15 days" could be
  // borrowed from an unrelated line and the check below would prove nothing.
  const sentence = text.slice(figures.index).split('\n')[0];
  const result = sentence.match(CCC_RESULT);
  if (!result) return null;
  const [dio, dso, dpo] = [Number(figures[1]), Number(figures[2]), Number(figures[3])];
  const authored = Number(result[1]);
  // The self-check. If the author's arithmetic and ours disagree, one of us is wrong and the
  // learner must not be shown either.
  if (evaluate({ formula: 'ccc' }, [dio, dso, dpo]) !== authored) return null;

  /*
   * Stepper bounds are control geometry, never shown as a claim: 0 days up to twice the largest
   * authored figure, in steps of 5. With 45/30/60 that is 0-120, which lets the learner push the
   * cycle well below zero (0 + 0 - 120) without the bar running off its own scale.
   */
  const max = 2 * Math.max(dio, dso, dpo);
  const input = (label: string, value: number): DialInput => ({ label, value, step: 5, min: 0, max });
  return {
    kind: 'dial',
    formula: 'ccc',
    prompt: 'Shrink the cash cycle',
    inputs: [
      input('Days to sell stock (DIO)', dio),
      input('Days to get paid (DSO)', dso),
      input('Days to pay suppliers (DPO)', dpo),
    ],
    goal: 'Get it to 0 or below',
    // "no later than", not "before": at exactly 0 the two dates coincide, and the goal counts 0 as
    // reached, so "before" would be false on the very screen that shows it.
    verdict: 'At zero or below, customers pay you no later than you pay suppliers, like Amazon.',
  };
}

/*
 * ---- rentRule ----
 * Guarded on three authored things, and null without any one of them:
 *   1. a Home Price slider in the lesson (its min, default and max become the chips);
 *   2. the placed step naming that default price, as "$400,000" or "$400K";
 *   3. the lesson stating the rule's answer for that price, "$1,667", which is ALSO checked
 *      against evaluate() so the chips can never disagree with the text.
 */
type Slider = { label?: unknown; min?: unknown; max?: unknown; default?: unknown };

function sliders(steps: LessonStep[]): Slider[] {
  return steps.flatMap((s) => {
    const list = (s as { sliders?: unknown }).sliders;
    return Array.isArray(list) ? (list as Slider[]) : [];
  });
}

const findSlider = (steps: LessonStep[], label: RegExp) =>
  sliders(steps).find((s) => typeof s.label === 'string' && label.test(s.label)
    && typeof s.min === 'number' && typeof s.max === 'number' && typeof s.default === 'number');

function buildRent(step: LessonStep, lessonSteps: LessonStep[]): DialSpec | null {
  const price = findSlider(lessonSteps, /^home price$/i);
  if (!price) return null;
  const [min, max, start] = [price.min as number, price.max as number, price.default as number];
  // Chips run min, min+gap, ... max with the gap set by the authored default, so the default is
  // always one of them: 200K, 400K, 600K, 800K. An uneven range would need an invented stop.
  const gap = start - min;
  if (!(gap > 0) || (max - min) % gap !== 0 || (max - min) / gap > 5) return null;

  const here = textOfStep(step);
  if (!here.includes(dollars(start)) && !here.includes(dollarsShort(start))) return null;

  const lesson = lessonSteps.map(textOfStep).join('\n');
  if (!/\b5%/.test(lesson) || !/\b12\b/.test(lesson)) return null;
  if (!lesson.includes(dollars(evaluate({ formula: 'rentRule' }, [start])))) return null;

  const rent = findSlider(lessonSteps, /rent/i);
  return {
    kind: 'dial',
    formula: 'rentRule',
    prompt: 'Find the break-even rent',
    inputs: [{ label: 'Home price', value: start, step: gap, min, max }],
    // "may cost less", as the lesson itself hedges it ("Below this, renting may be cheaper",
    // personalFinance.ts 5% Rule term). The spec forbids buy/rent advice, and step 4 spends a
    // paragraph on when buying wins anyway; a flat "costs less" would overrule the lesson.
    verdict: 'Rule of thumb: rent under this line means renting may cost less than owning.',
    ...(rent ? { compare: { label: 'Comparable rent', value: rent.default as number } } : {}),
  };
}

/**
 * Build the dial for this step, or null.
 *
 * Which formula is decided by what the step AUTHORS, never by the caller: a step carrying the
 * DIO/DSO/DPO sentence gets the cash cycle, a step in a lesson carrying the 5% rule gets the rent
 * dial, anything else gets null and keeps its derived deck.
 */
export function buildDial(step: LessonStep, lessonSteps: LessonStep[]): DialSpec | null {
  return buildCcc(step) ?? buildRent(step, lessonSteps);
}

/** The price stops shown as chips, min to max by `step`. */
export function chipValues(input: DialInput): number[] {
  const out: number[] = [];
  for (let v = input.min; v <= input.max; v += input.step) out.push(v);
  return out;
}

/**
 * Every sentence the card puts on screen, for the deck's repeat check and the card budget pin.
 * Labels are included: they are text the learner reads.
 */
export function textOf(spec: DialSpec): string[] {
  return [
    spec.prompt,
    ...spec.inputs.map((i) => i.label),
    ...(spec.goal ? [spec.goal] : []),
    spec.verdict,
    ...(spec.compare ? [spec.compare.label] : []),
  ];
}
