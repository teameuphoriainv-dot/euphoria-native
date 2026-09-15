#!/usr/bin/env node
// ============================================================================
// MOBILE CARD BUDGET PIN — the word-count cut, asserted rather than claimed.
//
//   node --import ./scripts/ts-resolve-hooks.mjs scripts/mobile-card-budget-pin.mjs
//   node --import ./scripts/ts-resolve-hooks.mjs scripts/mobile-card-budget-pin.mjs --selftest
//
// WHY. The whole point of the mobile lesson layer is that a phone screen ends. That is easy to
// lose: one generous fallback added to compress.ts, or one authored paragraph that leads with a
// long sentence, and cards quietly become paragraphs again with nothing to notice.
//
// THE TWO NUMBERS, because they say different things and only quoting one is misleading.
//   PER SCREEN the cut is about 96%: a median card carries 104 visible characters where the web
//   step it replaces put 2,557 on a single screen. That is the number a learner experiences.
//   PER STEP the cut is about 78%: a whole deck of three or four cards carries roughly a fifth of
//   what the author wrote. That is the number that says how much teaching was dropped.
//
// A CORRECTION WORTH RECORDING. An earlier version of this header claimed a 74 character median.
// That was measured on card BODIES only and ignored titles, prompts and interactive beats, so it
// described a card that does not exist. The limits below are set against the honest figure.
//
// WHAT IT IS NOT. It is not a cap on every card. 24% of cards run over budget on purpose, because
// the alternative was cutting a sentence mid-coordination and turning a definition into a false
// one (see the DANGLING_COORDINATOR comment in compress.ts). Those are tracked as a WORK QUEUE in
// src/lib/mobile-lesson/overrides.ts, and this pin holds the line on how big that queue may get.
// ============================================================================
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = new URL('..', import.meta.url).pathname;
const imported = (path) => import(pathToFileURL(join(ROOT, path)).href);

const { COURSES, loadCourseLessons } = await imported('src/lib/curriculum/courseIndex.ts');
const { deriveDeck, isHeavyStep } = await imported('src/lib/mobile-lesson/derive.ts');
const { stepId } = await imported('src/lib/mobile-lesson/stepId.ts');
const { CARD_BUDGET } = await imported('src/lib/mobile-lesson/types.ts');

/*
 * THE LIMITS. Each is set a little looser than the measured value so that ordinary authoring churn
 * in the web repo does not fail the build, and tight enough that a real regression does.
 * Measured 2026-09-14 over the 12 synced courses.
 */
const LIMITS = {
  /**
   * Measured 104, including titles and prompts. Above this cards are becoming paragraphs again.
   *
   * It is not lower because the deriver never writes prose: it picks and trims sentences the
   * curriculum author wrote, so the floor is the author's own shortest true sentence. Getting
   * below this means hand-writing cards in src/lib/mobile-lesson/overrides.ts, which is what the
   * over-budget queue is for. Do not lower this limit without writing the overrides first.
   */
  medianCardChars: 115,
  /** Measured 24%. The overrides.ts queue is allowed to grow, but not without someone noticing. */
  maxOverBudgetRatio: 0.30,
  /** Measured 4. A deck longer than this is a scroll view wearing a costume. */
  maxCardsPerDeck: 4,
  /** Measured 2. Below this a deck is not teaching anything. */
  minCardsPerDeck: 2,
  /** Measured 0. A card with no text is a blank screen mid-lesson. */
  maxEmptyCards: 0,
  /** The per-step cut against the authored source. Measured 78%. */
  minStepReduction: 0.72,
};

function bodyOf(card) {
  if (card.kind === 'idea' || card.kind === 'takeaway') return card.body ?? '';
  if (card.kind === 'term') return card.plain ?? '';
  return '';
}
function budgetOf(card) {
  if (card.kind === 'idea') return CARD_BUDGET.body;
  if (card.kind === 'takeaway') return CARD_BUDGET.takeaway;
  if (card.kind === 'term') return CARD_BUDGET.plain;
  return 0;
}
function visibleChars(card) {
  if (card.kind === 'idea') return `${card.title}${card.body}`.length;
  if (card.kind === 'term') return `${card.term}${card.plain}`.length;
  if (card.kind === 'takeaway') return (card.body ?? '').length;
  if (card.kind === 'chart') return (card.title ?? '').length;
  if (card.kind === 'interactive') {
    const s = card.spec;
    /*
     * The LONGEST single moment, not the sum. The stepper shows one beat at a time and replaces it,
     * so the sum is not a quantity any learner ever sees. Summing it measured a card that does not
     * exist, which is the opposite of what a budget should do.
     */
    if (s.kind === 'timeline') return s.prompt.length + Math.max(0, ...s.moments.map((m) => m.label.length));
    if (s.kind === 'reveal') return s.prompt.length + s.hidden.length;
    return s.prompt.length + (s.verdict ?? '').length;
  }
  return 0;
}

// A GREEN RUN MEANS NOTHING UNLESS THE LANE CAN GO RED. Each detector is seeded with the shape it
// must catch and a shape it must ignore.
if (process.argv.includes('--selftest')) {
  const ok = (c, m) => { if (!c) { console.error(`selftest FAILED: ${m}`); process.exit(1); } };
  ok(bodyOf({ kind: 'term', plain: 'x'.repeat(200) }).length === 200, 'a term body must be measured');
  ok(bodyOf({ kind: 'chart', title: 'x' }) === '', 'a chart card has no body to budget');
  ok(budgetOf({ kind: 'term' }) === CARD_BUDGET.plain, 'the term budget must be the vocabulary one');
  ok(budgetOf({ kind: 'interactive' }) === 0, 'an interactive is not held to a body budget');
  ok(visibleChars({ kind: 'idea', title: 'ab', body: 'cde' }) === 5, 'visible chars must include the title');
  ok(visibleChars({ kind: 'reveal' }) === 0, 'an unknown kind must measure zero, not throw');
  ok(median([1, 2, 3, 100]) === 3, 'median must not be an average');
  ok(median([]) === 0, 'median of nothing must be zero, not NaN');
  console.log('selftest passed');
  process.exit(0);
}

function median(xs) {
  if (xs.length === 0) return 0;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

const cardLengths = [];
const deckSizes = [];
const reductions = [];
let cards = 0, overBudget = 0, empty = 0, decks = 0;

for (const course of COURSES) {
  for (const lesson of await loadCourseLessons(course.id)) {
    lesson.steps.forEach((step, index) => {
      if (!isHeavyStep(step)) return;
      const deck = deriveDeck(step, stepId(course.id, lesson.num, index, step));
      if (!deck) return;
      decks += 1;
      deckSizes.push(deck.cards.length);

      const authored = [
        ...(step.paragraphs ?? []),
        step.description ?? '',
        ...(step.insights ?? []),
        ...(step.highlightedTerms ?? []).map((t) => `${t.term} ${t.definition}`),
      ].join(' ').length;

      let shown = 0;
      for (const card of deck.cards) {
        cards += 1;
        const v = visibleChars(card);
        shown += v;
        cardLengths.push(v);
        if (v === 0) empty += 1;
        const b = budgetOf(card);
        if (b > 0 && bodyOf(card).length > b) overBudget += 1;
      }
      if (authored > 200) reductions.push(1 - shown / authored);
    });
  }
}

const medianCard = median(cardLengths);
const overRatio = cards ? overBudget / cards : 0;
const medianReduction = median(reductions);
const maxDeck = Math.max(...deckSizes);
const minDeck = Math.min(...deckSizes);

console.log('MOBILE CARD BUDGET PIN');
console.log(`  decks                 ${decks}`);
console.log(`  cards                 ${cards}`);
console.log(`  median card chars     ${medianCard}   (limit ${LIMITS.medianCardChars})`);
console.log(`  cards per deck        ${minDeck}..${maxDeck}   (allowed ${LIMITS.minCardsPerDeck}..${LIMITS.maxCardsPerDeck})`);
console.log(`  over budget           ${overBudget} / ${cards} = ${(overRatio * 100).toFixed(1)}%   (limit ${(LIMITS.maxOverBudgetRatio * 100).toFixed(0)}%)`);
console.log(`  empty cards           ${empty}   (limit ${LIMITS.maxEmptyCards})`);
console.log(`  median step reduction ${(medianReduction * 100).toFixed(0)}%   (floor ${(LIMITS.minStepReduction * 100).toFixed(0)}%)`);

const problems = [];
if (medianCard > LIMITS.medianCardChars) problems.push(`median card is ${medianCard} chars, over ${LIMITS.medianCardChars}`);
if (overRatio > LIMITS.maxOverBudgetRatio) problems.push(`${(overRatio * 100).toFixed(1)}% of cards are over budget, over the ${(LIMITS.maxOverBudgetRatio * 100).toFixed(0)}% allowance`);
if (maxDeck > LIMITS.maxCardsPerDeck) problems.push(`a deck has ${maxDeck} cards, over the cap of ${LIMITS.maxCardsPerDeck}`);
if (minDeck < LIMITS.minCardsPerDeck) problems.push(`a deck has only ${minDeck} card(s)`);
if (empty > LIMITS.maxEmptyCards) problems.push(`${empty} card(s) render no text`);
if (medianReduction < LIMITS.minStepReduction) problems.push(`median step reduction is ${(medianReduction * 100).toFixed(0)}%, under the ${(LIMITS.minStepReduction * 100).toFixed(0)}% floor`);

if (problems.length) {
  console.error('\nFAIL');
  problems.forEach((p) => console.error(`  - ${p}`));
  console.error('\nIf a limit is now wrong, change it deliberately and say why. Do not widen it to pass.');
  process.exit(1);
}
console.log('\nOK: the mobile cut holds across the corpus.');
