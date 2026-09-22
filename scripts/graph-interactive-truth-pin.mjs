/**
 * GRAPH INTERACTIVE TRUTH PIN: the cards that replace desktop graphs say only true things.
 *
 *   node --import ./scripts/ts-resolve-hooks.mjs scripts/graph-interactive-truth-pin.mjs
 *
 * Measured over the WRAPPED loader (src/lib/curriculum/index.ts), which is what renders. The raw
 * courseIndex.ts is read only to recover the authored sliders a deck was built from.
 *
 * WHY THIS EXISTS. Four defects, all measured on 2026-09-22 before the fix:
 *
 *   1. WRONG RATE. `isRate` accepted any % slider whose label said rate/apr/growth/interest and
 *      `asGrow` took the first one, so 11 of 33 grow cards compounded something that is not a
 *      return: Marginal Tax Rate 32% (wealth-management:16:4 showed $2,000,000 growing 16x in ten
 *      years), Savings Rate 30%, Monthly Churn Rate 5%, Withdrawal Rate 4%, Rate Change 2%, an APR
 *      on a debt and an interest rate on a loan balance.
 *   2. RECURRING TREATED AS ONCE. investing-fundamentals:8:4's own card line reads "$500/month for
 *      30 years at 10% average return = ~$1,130,000", and tapping 30y showed $500 x 1.1^30 = $8,725.
 *      The same one-deposit maths ran on 10 cards whose money slider is monthly or yearly.
 *   3. HALF-MASKED FIGURE. alternative-investments:2:4 masked "5%" inside "25%" as well, so the card
 *      read "= 2 ? return on equity" and gave part of another number away.
 *   4. PROMPT = TITLE. All 289 graph decks used `step.title` as the interactive prompt, so the card
 *      repeated the deck title word for word instead of telling the learner what to do.
 *
 * WHAT IT ASSERTS (each must be 0):
 *   - grow cards whose rate label is on the deny list, or whose money label is a debt;
 *   - grow cards whose own line states "$X ... N years" for its scenario and growValue at N years
 *     is more than 5% away from $X (the scenario is identified by the card stating the card's own
 *     rate AND its own money amount, so a sentence about some other example is not held to it);
 *   - recurring money labels (monthly / annual) left as a one-time deposit;
 *   - recurring grow cards whose verdict names the deposit with no frequency ("$3K at 15");
 *   - guess cards whose blank touches a digit, i.e. it masked part of a longer figure;
 *   - graph decks whose interactive prompt equals, or is a prefix of, the deck title.
 * Plus a negative control per rule so the pin cannot pass by counting nothing.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = new URL('..', import.meta.url).pathname;
const imported = (path) => import(pathToFileURL(join(ROOT, path)).href);

const W = await imported('src/lib/curriculum/index.ts');
const R = await imported('src/lib/curriculum/courseIndex.ts');

/*
 * Before the fix there was no grow-math.ts, and the screen computed start * (1 + r)^years for every
 * card. Falling back to exactly that is what lets this pin be run against the old code and go red
 * for the reason it exists, rather than crashing on a missing import.
 */
const growValue = existsSync(join(ROOT, 'src/lib/mobile-lesson/grow-math.ts'))
  ? (await imported('src/lib/mobile-lesson/grow-math.ts')).growValue
  : (spec, years) => spec.start * (1 + spec.ratePercent / 100) ** years;

const RATE_DENY = /tax|savings rate|churn|withdrawal|rate change|\bapr\b|fee|inflation/i;
const MONEY_DENY = /debt|loan|owed/i;
const RECURRING = /monthly|per month|\/mo\b|annual|per year|yearly/i;
// The exact blank asGuess writes: two figure spaces, a question mark, two figure spaces.
const BLANK = '\u2007\u2007?\u2007\u2007';

/** "$1,130,000", "$1.2M", "$155K", "$3.4 million" as a number, or NaN. */
function dollars(s) {
  const m = String(s).match(/\$\s?([\d][\d,]*(?:\.\d+)?)\s*(k|m|b|thousand|million|billion)?\b/i);
  if (!m) return NaN;
  const n = Number(m[1].replace(/,/g, ''));
  const unit = (m[2] ?? '').toLowerCase();
  const mult = unit === 'k' || unit === 'thousand' ? 1e3 : unit === 'm' || unit === 'million' ? 1e6 : unit === 'b' || unit === 'billion' ? 1e9 : 1;
  return n * mult;
}

const MONEY = String.raw`\$\s?[\d][\d,]*(?:\.\d+)?(?:\s*(?:k|m|b|thousand|million|billion)\b)?`;
const YEARS = String.raw`(\d+)\s*(?:years?|yrs?)\b`;

/** Every (years, dollars) pair a sentence states, in either order. Independent of the app's code. */
function statedPairs(text) {
  const out = [];
  // "$174,494 in 30 years", "$525K in 20yrs"
  for (const m of text.matchAll(new RegExp(`(${MONEY})\\s+(?:in|after|by)\\s+${YEARS}`, 'gi'))) {
    out.push({ years: Number(m[2]), value: dollars(m[1]), said: m[0] });
  }
  // "for 30 years at 10% average return = ~$1,130,000"
  for (const m of text.matchAll(new RegExp(`for\\s+${YEARS}[^=]{0,60}=\\s*~?(${MONEY})`, 'gi'))) {
    out.push({ years: Number(m[1]), value: dollars(m[2]), said: m[0] });
  }
  return out.filter((p) => Number.isFinite(p.value) && p.value > 0 && p.years > 0);
}

/** Does this sentence describe the card's own scenario: its own rate and its own money amount? */
function aboutScenario(text, spec) {
  const rate = new RegExp(`(^|[^\\d.])${String(spec.ratePercent).replace('.', '\\.')}%`);
  if (!rate.test(text)) return false;
  return [...text.matchAll(new RegExp(MONEY, 'gi'))].some((m) => Math.abs(dollars(m[0]) - spec.start) < 0.5);
}

/** Recover the rate label: the spec carries it after the fix; before it, match the default. */
function rateLabelOf(spec, rawStep) {
  if (spec.rateLabel) return spec.rateLabel;
  const s = (rawStep.sliders ?? []).find((x) => /%|percent/i.test(x.unit ?? '') && x.default === spec.ratePercent);
  return s?.label ?? '';
}

/*
 * A recurring card whose verdict names its own deposit with no frequency after it ("$3K at 15"
 * under a lab reading "$3,000 a year") is describing a different scenario from the number above it.
 * personal-finance:24:4 did exactly this once contributions stopped being compounded as one deposit.
 */
function namesOneOff(text, spec) {
  if ((spec.contribution ?? 'once') === 'once') return false;
  for (const m of text.matchAll(new RegExp(MONEY, 'gi'))) {
    if (Math.abs(dollars(m[0]) - spec.start) >= 0.5) continue;
    const after = text.slice(m.index + m[0].length);
    if (!/^\s*(?:\/\s*(?:year|yr|month|mo)\b|(?:a|per|each|every)\s+(?:year|month)\b|annually|monthly|yearly)/i.test(after)) return true;
  }
  return false;
}

const norm = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

const deny = [];
const horizon = [];
const once = [];
const oneOff = [];
const halfMask = [];
const echo = [];
let graphDecks = 0;
let grows = 0;
let guesses = 0;
let horizonChecked = 0;

for (const course of W.COURSES) {
  let lessons;
  let raws;
  try {
    lessons = await W.loadCourseLessons(course.id);
    raws = await R.loadCourseLessons(course.id);
  } catch {
    continue; // an unsynced course is the availability layer's business
  }
  for (const lesson of lessons) {
    const raw = raws.find((l) => l.num === lesson.num);
    lesson.steps.forEach((deck, i) => {
      if (deck?.type !== 'mobileDeck' || deck.sourceType !== 'interactiveGraph') return;
      graphDecks += 1;
      const where = `${course.id}:${lesson.num}:${i}`;
      const spec = deck.cards.find((c) => c.kind === 'interactive')?.spec;
      if (!spec) return;

      const pn = norm(spec.prompt);
      const tn = norm(deck.title);
      // Both directions: the title is cut at 42 characters and the prompt was cut at 60, so on a long
      // title the deck title is a prefix of the prompt rather than the other way round.
      if (pn && tn && (pn === tn || tn.startsWith(pn) || pn.startsWith(tn))) echo.push(`${where} "${spec.prompt}"`);

      if (spec.kind === 'grow') {
        grows += 1;
        const rateLabel = rateLabelOf(spec, raw?.steps?.[i] ?? {});
        if (RATE_DENY.test(rateLabel) || MONEY_DENY.test(spec.startLabel)) {
          deny.push(`${where} money="${spec.startLabel}" rate="${rateLabel}" ${spec.ratePercent}%`);
        }
        if (RECURRING.test(spec.startLabel) && (spec.contribution ?? 'once') === 'once') {
          once.push(`${where} "${spec.startLabel}" compounded as a single deposit`);
        }
        if (namesOneOff(spec.verdict, spec)) oneOff.push(`${where} verdict "${spec.verdict}" on a ${spec.contribution} card`);
        const lines = [spec.verdict, ...deck.cards.filter((c) => c.kind === 'takeaway').map((c) => c.body)];
        for (const line of lines) {
          if (!aboutScenario(line, spec)) continue;
          for (const p of statedPairs(line)) {
            horizonChecked += 1;
            const got = growValue(spec, p.years);
            const off = Math.abs(got - p.value) / p.value;
            if (off > 0.05) {
              horizon.push(`${where} says "${p.said}" but the lab shows $${Math.round(got).toLocaleString('en-US')} at ${p.years}y (${(off * 100).toFixed(0)}% off)`);
            }
          }
        }
      }

      if (spec.kind === 'guess') {
        guesses += 1;
        let at = spec.masked.indexOf(BLANK);
        while (at >= 0) {
          const before = spec.masked[at - 1] ?? '';
          const after = spec.masked.slice(at + BLANK.length, at + BLANK.length + 2);
          // A trailing K/M/B is part of the figure too: "$30K" blanked as "$30" left "? K invested"
          // on personal-finance:25:4 and "? K-$400K" on wealth-management:16:4 once those two stopped
          // being grow cards (measured 2026-09-22, after the deny list landed).
          if (/[\d.,]/.test(before) || /^\d|^[.,]\d|^[KMBkmb]\b/.test(after)) {
            halfMask.push(`${where} "${spec.masked.slice(Math.max(0, at - 12), at + BLANK.length + 12)}"`);
            break;
          }
          at = spec.masked.indexOf(BLANK, at + BLANK.length);
        }
      }
    });
  }
}

/*
 * NEGATIVE CONTROLS. Each detector is run on a known-bad example so a regex typo that matches
 * nothing cannot turn this pin permanently green.
 */
const controls = [
  ['deny list catches a tax rate', RATE_DENY.test('Marginal Tax Rate')],
  ['deny list lets a return through', !RATE_DENY.test('Annual Return')],
  ['money deny catches a loan', MONEY_DENY.test('Loan Balance')],
  ['horizon parser reads "= ~$1,130,000"', statedPairs('$500/month for 30 years at 10% average return = ~$1,130,000')[0]?.value === 1130000],
  ['horizon parser reads "$155K in 10yrs"', statedPairs('$891/month invested at 8%: $155K in 10yrs')[0]?.value === 155000],
  ['scenario match needs the rate', !aboutScenario('$500 for 30 years = $9', { ratePercent: 10, start: 500 })],
  ['half-mask detector sees "2?"', /[\d.,]/.test(`= 2${BLANK} return`.split(BLANK)[0].slice(-1))],
  ['one-off detector sees "$3K at 15" on a yearly $3,000 card', namesOneOff('Teen invests $3K at 15 → $437K at 65', { start: 3000, contribution: 'yearly' })],
  ['one-off detector lets "$3K/year" through', !namesOneOff('$3K/year from 15-18 → $1.75M at 65', { start: 3000, contribution: 'yearly' })],
  ['counted some graph decks', graphDecks > 200],
  ['counted some grow cards', grows > 5],
  ['counted some guess cards', guesses > 20],
  ['checked at least one stated horizon', horizonChecked > 0],
];

let failed = false;
for (const [name, ok] of controls) {
  if (!ok) { console.error(`CONTROL FAILED: ${name}`); failed = true; }
}

const report = (label, list) => {
  console.log(`${label}: ${list.length}`);
  for (const x of list) console.log(`  ${x}`);
  if (list.length > 0) failed = true;
};

console.log(`graph decks ${graphDecks}, grow ${grows}, guess ${guesses}, stated horizons checked ${horizonChecked}`);
report('grow cards compounding a deny-listed rate or a debt', deny);
report('grow cards whose own line disagrees with growValue by more than 5%', horizon);
report('recurring contributions compounded as one deposit', once);
report('recurring grow cards whose verdict describes a one-time deposit', oneOff);
report('guess cards masking part of a longer figure', halfMask);
report('graph decks whose prompt repeats the title', echo);

if (failed) {
  console.error('FAIL: graph-interactive-truth-pin');
  process.exit(1);
}
console.log('OK: graph interactives tell the truth');
