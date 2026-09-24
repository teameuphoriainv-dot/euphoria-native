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
const { applyPlacement } = await imported('src/lib/mobile-lesson/parts/placements.ts');
const { CARD_BUDGET } = await imported('src/lib/mobile-lesson/types.ts');
const { shortenOptions, shortenPrompt, QUESTION_BUDGET } = await imported('src/lib/mobile-lesson/question.ts');

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
  /**
   * Measured 23.5% on 2026-09-15, RAISED from a hard-coded 25%, deliberately and not to pass.
   *
   * The old figure was calibrated while shortenPrompt returned the final question sentence alone
   * for every over-budget prompt. That is how it kept prompts short: by deleting the scenario the
   * question was about. Keeping the data costs characters, and this is the budget that pays for it.
   * The real guarantees now live in maxPromptsLosingNumbers and the zero-tolerance check on losing
   * the question, which are properties rather than proxies.
   *
   * RAISED AGAIN 2026-09-22 to 0.68, measured 860 / 1,307 = 65.8%, deliberately and not to pass.
   * The A1 shortener now treats a setup as load-bearing whenever it has a figure the ask does not
   * repeat, because the old per-question rule dropped 243 setups that carried numbers
   * (investing-fundamentals L6 s3 lost both expense ratios it asked about). That took prompts
   * losing every number from 16 to 0, and 684 of the 860 over-budget prompts are now shown exactly
   * as authored: there is nothing left to cut without cutting data. Getting back under 35% means
   * rewriting prompts in overrides.ts, not a tighter shortener. 0.68 still fails the build if the
   * shortener stops trimming the ones it can (it trims 930 authored-over-budget down to 860).
   */
  maxPromptsOverBudgetRatio: 0.68,
  /**
   * Measured 16, down from 653 before the shortener kept its setups. Not zero: a handful of
   * prompts state their figures only inside a clause that will not survive any trim, and forcing
   * those through whole would put a paragraph on the screen.
   */
  maxPromptsLosingNumbers: 40,
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
    // A scene shows one caption at a time, like the timeline above, and has no verdict: the
    // fallthrough would have measured it as its 23-character prompt and called it tiny.
    if (s.kind === 'scene') return s.prompt.length + Math.max(0, ...s.beats.map((b) => b.caption.length));
    // A dial shows every stepper label at once, plus its goal and verdict.
    if (s.kind === 'dial') return s.prompt.length + s.inputs.reduce((n, i) => n + i.label.length, 0) + (s.goal ?? '').length + s.verdict.length;
    if (s.kind === 'lever') return s.prompt.length + s.note.length + s.verdict.length;
    /*
     * THE ATLAS CLIPS (clickthrough/*) carry a title and no prompt; the fallthrough below threw on
     * them. Each shows one caption at a time under a mounted diagram, so the longest moment is the
     * title plus one item's label, value and caption. Place also keeps every tray label on screen.
     * No 70-char caption budget: the captions are the authored explains, word for word, 104-229
     * characters on the 11 placements, and cutting them is exactly what the builders refuse to do.
     */
    if (s.kind === 'stage') return s.title.length + Math.max(0, ...s.items.map((i) => i.label.length + i.display.length + i.caption.length));
    if (s.kind === 'predict') return s.title.length + s.anchor.label.length + s.anchor.display.length + s.target.label.length + s.target.display.length + s.target.caption.length;
    if (s.kind === 'build') return s.title.length + Math.max(0, ...s.pieces.map((p) => p.label.length + (p.tag ?? '').length + p.caption.length));
    if (s.kind === 'place') return s.title.length + s.slots.reduce((n, p) => n + p.label.length, 0) + Math.max(0, ...s.slots.map((p) => p.caption.length));
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
  ok(visibleChars({ kind: 'interactive', spec: { kind: 'scene', prompt: 'ab', beats: [{ caption: 'abc' }, { caption: 'abcde' }] } }) === 7,
    'a scene must measure its prompt plus its LONGEST caption, not its prompt alone');
  // The Atlas clips have no `prompt` at all: the fallthrough read `undefined.length` and threw
  // (2026-09-22 integration). A clip shows its title plus one caption at a time.
  ok(visibleChars({ kind: 'interactive', spec: { kind: 'stage', title: 'ab', items: [{ label: 'L', display: 'D', caption: 'abc' }, { label: 'L', display: 'D', caption: 'abcdef' }] } }) === 10,
    'a stage clip must measure its title plus its longest beat (label, value, caption)');
  ok(visibleChars({ kind: 'interactive', spec: { kind: 'place', title: 'ab', slots: [{ label: 'xy', caption: 'abc' }, { label: 'z', caption: 'a' }] } }) === 8,
    'a place clip must measure its title, every tray label and its longest caption');
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
      // Placed parts included, over the RAW steps, as curriculum/index.ts renders them.
      const id = stepId(course.id, lesson.num, index, step);
      const derived = deriveDeck(step, id);
      const deck = derived ? applyPlacement(derived, id, lesson.steps) : null;
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

/*
 * QUESTIONS AND OPTIONS, checked here rather than in their own script because they are the same
 * promise: a lesson screen ends.
 *
 * The answer-length tell is pinned COMPARATIVELY. 66% of the corpus already had the correct option
 * as the single longest before any of this existed, so an absolute threshold would fail the build
 * on authored content nobody here wrote. What must hold is that shortening never ADDS one.
 */
let qN = 0, qLong = 0, tellBefore = 0, tellAfter = 0, tellCreated = 0, dupSets = 0;
let qLostQuestion = 0, qLostEveryNumber = 0;
for (const course of COURSES) {
  for (const lesson of await loadCourseLessons(course.id)) {
    for (const step of lesson.steps) {
      let opts = null, correct = 0, prompt = '';
      if (step.type === 'quiz' || step.type === 'microCheck' || step.type === 'fillBlank') {
        opts = step.options; correct = step.correct; prompt = step.question ?? step.sentence ?? '';
      } else if (step.type === 'scenario') {
        opts = (step.choices ?? []).map((c) => c.label);
        correct = Math.max(0, (step.choices ?? []).findIndex((c) => c.correct));
        prompt = step.situation ?? '';
      }
      if (!opts || opts.length < 2) continue;
      qN += 1;
      const shown = shortenPrompt(prompt);
      if (shown.length > QUESTION_BUDGET.prompt) qLong += 1;
      /*
       * THE TWO THINGS LENGTH WAS ONLY EVER A PROXY FOR.
       *
       * shortenPrompt used to return the final question sentence alone for any over-budget prompt
       * ending in '?', which is short and scores well here while being unanswerable. 766 of 1,026
       * prompts were cut that way, 653 lost every number they were given, and 7 lost the question
       * itself. A learner who cannot answer guesses and pays a heart for it.
       *
       * These assert the properties directly, so a future shortener cannot trade answerability for
       * a better length figure.
       */
      if (/\?/.test(prompt) && !/\?/.test(shown)) qLostQuestion += 1;
      if (/\d/.test(prompt) && !/\d/.test(shown)) qLostEveryNumber += 1;

      const out = shortenOptions(opts, correct);
      if (new Set(out.map((o) => o.trim().toLowerCase())).size !== out.length) dupSets += 1;
      const tells = (arr) => {
        const lens = arr.map((o) => o.length);
        const max = Math.max(...lens);
        return lens[correct] === max && lens.filter((x) => x === max).length === 1;
      };
      const b = tells(opts), a = tells(out);
      if (b) tellBefore += 1;
      if (a) tellAfter += 1;
      if (!b && a) tellCreated += 1;
    }
  }
}

console.log('MOBILE CARD BUDGET PIN');
console.log(`  decks                 ${decks}`);
console.log(`  cards                 ${cards}`);
console.log(`  median card chars     ${medianCard}   (limit ${LIMITS.medianCardChars})`);
console.log(`  cards per deck        ${minDeck}..${maxDeck}   (allowed ${LIMITS.minCardsPerDeck}..${LIMITS.maxCardsPerDeck})`);
console.log(`  over budget           ${overBudget} / ${cards} = ${(overRatio * 100).toFixed(1)}%   (limit ${(LIMITS.maxOverBudgetRatio * 100).toFixed(0)}%)`);
console.log(`  empty cards           ${empty}   (limit ${LIMITS.maxEmptyCards})`);
console.log(`  median step reduction ${(medianReduction * 100).toFixed(0)}%   (floor ${(LIMITS.minStepReduction * 100).toFixed(0)}%)`);
console.log(`  questions             ${qN}, ${qLong} still over ${QUESTION_BUDGET.prompt} chars`);
console.log(`  prompts losing the question  ${qLostQuestion}   (limit 0)`);
console.log(`  prompts losing every number  ${qLostEveryNumber}   (limit ${LIMITS.maxPromptsLosingNumbers})`);
console.log(`  option sets with a duplicate answer  ${dupSets}   (limit 0)`);
console.log(`  longest option is correct  ${tellBefore} authored -> ${tellAfter} shown, ${tellCreated} created by shortening   (limit 0)`);

const problems = [];
if (medianCard > LIMITS.medianCardChars) problems.push(`median card is ${medianCard} chars, over ${LIMITS.medianCardChars}`);
if (overRatio > LIMITS.maxOverBudgetRatio) problems.push(`${(overRatio * 100).toFixed(1)}% of cards are over budget, over the ${(LIMITS.maxOverBudgetRatio * 100).toFixed(0)}% allowance`);
if (maxDeck > LIMITS.maxCardsPerDeck) problems.push(`a deck has ${maxDeck} cards, over the cap of ${LIMITS.maxCardsPerDeck}`);
if (minDeck < LIMITS.minCardsPerDeck) problems.push(`a deck has only ${minDeck} card(s)`);
if (empty > LIMITS.maxEmptyCards) problems.push(`${empty} card(s) render no text`);
if (medianReduction < LIMITS.minStepReduction) problems.push(`median step reduction is ${(medianReduction * 100).toFixed(0)}%, under the ${(LIMITS.minStepReduction * 100).toFixed(0)}% floor`);
if (dupSets > 0) problems.push(`${dupSets} question(s) would show two identical answers after shortening`);
if (tellCreated > 0) problems.push(`shortening CREATED the answer-length tell on ${tellCreated} question(s)`);
if (tellAfter > tellBefore) problems.push('shortening increased how often the correct answer is the longest');
if (qLong > qN * LIMITS.maxPromptsOverBudgetRatio) problems.push(`${qLong} of ${qN} prompts are still over budget`);
if (qLostQuestion > 0) problems.push(`${qLostQuestion} prompt(s) lose their question entirely and cannot be answered`);
if (qLostEveryNumber > LIMITS.maxPromptsLosingNumbers) problems.push(`${qLostEveryNumber} prompts lose every number they were given, over the allowance of ${LIMITS.maxPromptsLosingNumbers}`);

if (problems.length) {
  console.error('\nFAIL');
  problems.forEach((p) => console.error(`  - ${p}`));
  console.error('\nIf a limit is now wrong, change it deliberately and say why. Do not widen it to pass.');
  process.exit(1);
}
console.log('\nOK: the mobile cut holds across the corpus.');
