/**
 * The arithmetic behind the grow card, kept pure so a pin can run it without React.
 *
 * WHY THIS IS ITS OWN MODULE. The grow card used to compute `start * (1 + r) ** years` inline in
 * `GrowLab`, for every card, whatever the money slider meant. On investing-fundamentals:8:4 the
 * slider is "Monthly Investment" $500 and the card's own line reads "$500/month for 30 years at 10%
 * average return = ~$1,130,000"; tapping 30y showed $500 x 1.1^30 = $8,725. Ten grow cards had a
 * monthly or yearly money slider and all ten were treated as a single deposit (measured 2026-09-22
 * by scripts/graph-interactive-truth-pin.mjs over the wrapped loader). The formula now lives where
 * the pin can check it against every figure the lesson states.
 */

/** How the authored money slider is paid in. */
export type Contribution = 'once' | 'monthly' | 'yearly';

/** The subset of the grow spec the arithmetic needs. */
export interface GrowInputs {
  start: number;
  ratePercent: number;
  contribution: Contribution;
}

/**
 * Value after `years`.
 *
 *   once     start * (1 + r)^y                         a lump sum, compounded yearly
 *   monthly  P * ((1 + r/12)^(12y) - 1) / (r/12)       end-of-month deposits, compounded monthly
 *   yearly   P * ((1 + r)^y - 1) / r                   end-of-year deposits, compounded yearly
 *
 * The monthly convention is the one the corpus uses: $500 a month at 10% for 30 years comes to
 * $1,130,244, and the lesson says ~$1,130,000. A zero rate is handled as plain saving so the
 * annuity formulas never divide by zero; asGrow already refuses a rate that is not positive, so
 * this is a guard, not a path the corpus reaches.
 */
export function growValue(spec: GrowInputs, years: number): number {
  const r = spec.ratePercent / 100;
  const y = Math.max(0, years);
  if (spec.contribution === 'monthly') {
    const m = r / 12;
    return m === 0 ? spec.start * 12 * y : spec.start * (((1 + m) ** (12 * y) - 1) / m);
  }
  if (spec.contribution === 'yearly') {
    return r === 0 ? spec.start * y : spec.start * (((1 + r) ** y - 1) / r);
  }
  return spec.start * (1 + r) ** y;
}

/** Everything the learner paid in by `years`, which is what the growth multiple is measured against. */
export function paidIn(spec: GrowInputs, years: number): number {
  const y = Math.max(0, years);
  if (spec.contribution === 'monthly') return spec.start * 12 * y;
  if (spec.contribution === 'yearly') return spec.start * y;
  return spec.start;
}

/**
 * Read how a money slider is paid in from its authored label.
 *
 * Label only, never the amount: "$500" says nothing about frequency, "Monthly Investment" does.
 * Monthly is tested first because no label in the corpus says both, and "per month" is the more
 * specific claim if one ever does.
 */
export function contributionOf(label: string): Contribution {
  if (/monthly|per month|\/mo\b/i.test(label)) return 'monthly';
  if (/annual|per year|yearly/i.test(label)) return 'yearly';
  return 'once';
}

const MONEY = String.raw`\$\s?\d[\d,]*(?:\.\d+)?(?:\s*(?:k|m|b|thousand|million|billion)\b)?`;
const YEARS = String.raw`(\d+)\s*(?:years?|yrs?)\b`;

/** "$1,130,000", "$1.2M", "$155K" as a number, or NaN. */
function dollars(s: string): number {
  const m = s.match(/\$\s?(\d[\d,]*(?:\.\d+)?)\s*(k|m|b|thousand|million|billion)?\b/i);
  if (!m) return NaN;
  const unit = (m[2] ?? '').toLowerCase();
  const mult = unit === 'k' || unit === 'thousand' ? 1e3
    : unit === 'm' || unit === 'million' ? 1e6
      : unit === 'b' || unit === 'billion' ? 1e9 : 1;
  return Number(m[1].replace(/,/g, '')) * mult;
}

/**
 * True when an authored sentence states an outcome for THIS card's scenario that the lab, run at
 * the same horizon, would contradict by more than 5%.
 *
 * WHY. The grow card shows its verdict underneath the number the learner just produced, so a
 * verdict that disagrees with the lab puts two different answers to one question on one screen.
 * personal-finance:17:4 is the case: its line reads "$891/month invested at 8%: $155K in 10yrs,
 * $525K in 20yrs, $1.2M in 30yrs", and no single compounding convention produces all three. Monthly
 * deposits give $163,005 / $524,817 / $1,327,910; yearly deposits of $10,692 give $154,890 /
 * $489,287 / $1,211,224. Whichever the lab uses, one of those authored figures is 5-10% away from
 * the number on screen, so that sentence cannot be the verdict.
 *
 * A sentence is only held to the lab when it names the card's own rate AND its own money amount,
 * so "The difference between 0.25% and 2.0% fees on $500K over 30 years is $2.2 million" is not
 * mistaken for a claim about a $500,000 portfolio at 8%.
 */
export function contradictsLab(text: string, spec: GrowInputs): boolean {
  const rate = new RegExp(`(^|[^\\d.])${String(spec.ratePercent).replace('.', '\\.')}%`);
  if (!rate.test(text)) return false;
  const namesStart = [...text.matchAll(new RegExp(MONEY, 'gi'))]
    .some((m) => Math.abs(dollars(m[0]) - spec.start) < 0.5);
  if (!namesStart) return false;

  const pairs: { years: number; value: number }[] = [];
  for (const m of text.matchAll(new RegExp(`(${MONEY})\\s+(?:in|after|by)\\s+${YEARS}`, 'gi'))) {
    pairs.push({ years: Number(m[2]), value: dollars(m[1]) });
  }
  for (const m of text.matchAll(new RegExp(`for\\s+${YEARS}[^=]{0,60}=\\s*~?(${MONEY})`, 'gi'))) {
    pairs.push({ years: Number(m[1]), value: dollars(m[2]) });
  }
  return pairs.some((p) => p.value > 0 && p.years > 0
    && Math.abs(growValue(spec, p.years) - p.value) / p.value > 0.05);
}

/*
 * A deposit counts as recurring when the figure is followed by a frequency: "$3K/year",
 * "$500/month", "$200 a month", "$7,000 per year", "$6,500 annually".
 */
const FREQUENCY_AFTER = /^\s*(?:\/\s*(?:year|yr|month|mo)\b|(?:a|per|each|every)\s+(?:year|month)\b|annually|monthly|yearly)/i;

/**
 * True when a sentence names this card's deposit as a ONE-TIME amount while the card compounds it
 * as a monthly or yearly deposit.
 *
 * WHY. personal-finance:24:4's money slider is "Annual Teen Contribution" $3,000, so the lab shows
 * "$3,000 a year at 10.7%", and its first insight reads "Teen invests $3K at 15 -> $437K at 65",
 * which is one $3K deposit. Put under the lab as the verdict, that is two different scenarios on one
 * screen, and at 50 years the lab reads about $4.5M against the sentence's $437K. `contradictsLab`
 * does not see it because the sentence never names the rate. The same step's
 * "$3K/year from 15-18" and "$3K/year from 25-65" name the frequency, so they still qualify.
 */
export function describesOneDeposit(text: string, spec: GrowInputs): boolean {
  if (spec.contribution === 'once') return false;
  for (const m of text.matchAll(new RegExp(MONEY, 'gi'))) {
    if (Math.abs(dollars(m[0]) - spec.start) >= 0.5) continue;
    const after = text.slice((m.index ?? 0) + m[0].length);
    if (!FREQUENCY_AFTER.test(after)) return true;
  }
  return false;
}
