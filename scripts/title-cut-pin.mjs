#!/usr/bin/env node
/**
 * TITLE CUT PIN: no deck title, term, chart title or interactive prompt stops on a dangling word.
 *
 *   node --import ./scripts/ts-resolve-hooks.mjs scripts/title-cut-pin.mjs
 *   node --import ./scripts/ts-resolve-hooks.mjs scripts/title-cut-pin.mjs --selftest
 *
 * WHY THIS EXISTS. compressTitle used to slice at budget-1 and back off to the last space, with
 * no ellipsis. Measured 2026-09-22 on the WRAPPED loader, 105 titles on real cards ended on a
 * function word or a comma:
 *   investing-fundamentals L10 s2  "The Five Investment Accounts You Need to"   (authored "...to Know")
 *   investing-fundamentals L18 s2  "Capital Gains: The Tax on Your"
 *   personal-finance       L16 s4  "Pay Taxes Now or Later? The"
 *   personal-finance       L15 s4  "How 1% in Fees Costs You Hundreds of"
 * A heading that stops on "to" reads as a rendering bug, and nothing else in `npm run check`
 * looked at titles at all.
 *
 * WHAT IT ASSERTS, over every mobileDeck the wrapped loader (src/lib/curriculum/index.ts, the one
 * the app renders) produces:
 *   1. no title-like string ends on a stopword, ',' ':' ';' '&' or a dash, unless the author wrote
 *      it that way (the RAW step has a string ending in the same two words, e.g. "What to Look For");
 *   2. none ends on a figure unless the author ended it there ("...and the $3.5" lost "Trillion");
 *   3. none runs past 1.3x its budget, the most a two-line title can carry;
 *   4. a fixed set of authored titles that HEAD damaged come back whole (see KEEP_WHOLE).
 * `--selftest` feeds both checks the pre-fix outputs above and requires them to go red.
 */
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = new URL('..', import.meta.url).pathname;
const imported = (path) => import(pathToFileURL(join(ROOT, path)).href);

const wrapped = await imported('src/lib/curriculum/index.ts');
const raw = await imported('src/lib/curriculum/courseIndex.ts');
const { CARD_BUDGET } = await imported('src/lib/mobile-lesson/types.ts');
const { compressTitle } = await imported('src/lib/mobile-lesson/compress.ts');

/*
 * The list and the ceiling are written out HERE rather than imported from compress.ts on purpose:
 * a pin that reads the implementation's own list passes the day someone shortens that list.
 */
const TITLE_STOPWORDS = [
  'to', 'of', 'the', 'a', 'an', 'and', 'or', 'your', 'in', 'for', 'with', 'on', 'at', 'by', 'how', 'what', 'is',
  'than', 'from', 'into', 'as', 'but', 'vs', 'between', 'about', 'that', 'which', 'who', 'when',
  'where', 'why', 'are', 'its', 'their', 'our', 'this', 'these', 'those',
];
const TITLE_GRACE = 1.3;

const SELFTEST = process.argv.includes('--selftest');
const STOP = new Set(TITLE_STOPWORDS);

const words = (s) => String(s).toLowerCase().replace(/[^a-z0-9%$' ]+/g, ' ').trim().split(/\s+/).filter(Boolean);

/** Ends on a function word or on punctuation that promises more text. */
function dangles(text) {
  const t = String(text).trim();
  if (/[,:;&\-–(]$/.test(t)) return true;
  const w = words(t);
  return w.length > 0 && STOP.has(w[w.length - 1]);
}

/** Ends on a figure, so whatever scale followed it ("$3.5 Trillion") may have been cut away. */
const endsOnNumber = (text) => /\d\S*$/.test(String(text).trim());

/** Every string in the raw step, so an authored "What to Look For" is not blamed on the cutter. */
function strings(value, out = []) {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => strings(v, out));
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => strings(v, out));
  return out;
}
function authoredThatWay(text, rawStep) {
  const tail = words(text).slice(-2).join(' ');
  return strings(rawStep).some((s) => words(s).slice(-2).join(' ') === tail);
}

/** The title-like strings a deck renders, each with the budget compressTitle was given. */
function titlesOf(deck) {
  const out = [{ field: 'deck.title', text: deck.title, budget: CARD_BUDGET.title }];
  (deck.cards ?? []).forEach((c, ci) => {
    if (c.kind === 'idea' || c.kind === 'chart') out.push({ field: `card${ci}.${c.kind}.title`, text: c.title, budget: CARD_BUDGET.title });
    if (c.kind === 'term') out.push({ field: `card${ci}.term`, text: c.term, budget: CARD_BUDGET.title });
    const spec = c.kind === 'interactive' ? c.spec : null;
    if (spec?.prompt) out.push({ field: `card${ci}.${spec.kind}.prompt`, text: spec.prompt, budget: CARD_BUDGET.prompt });
  });
  return out.filter((t) => typeof t.text === 'string' && t.text.length > 0);
}

let decks = 0;
let checked = 0;
const dangling = [];
const overlong = [];

for (const course of wrapped.COURSES) {
  let lessons;
  let rawLessons;
  try {
    lessons = await wrapped.loadCourseLessons(course.id);
    rawLessons = await raw.loadCourseLessons(course.id);
  } catch {
    continue; // an unsynced course is the availability layer's business
  }
  lessons.forEach((lesson, li) => {
    (lesson.steps ?? []).forEach((step, si) => {
      if (step?.type !== 'mobileDeck') return;
      decks += 1;
      const rawStep = rawLessons[li]?.steps?.[si];
      for (const t of titlesOf(step)) {
        checked += 1;
        const where = `${course.id}:L${lesson.num ?? li + 1}:s${si} ${t.field}`;
        if ((dangles(t.text) || endsOnNumber(t.text)) && !authoredThatWay(t.text, rawStep)) dangling.push(`${where}  "${t.text}"`);
        if (t.text.length > Math.floor(t.budget * TITLE_GRACE)) overlong.push(`${where}  ${t.text.length} > ${Math.floor(t.budget * TITLE_GRACE)}  "${t.text}"`);
      }
    });
  });
}

/*
 * Authored titles the cutter damaged in ways the corpus walk above cannot see, because the damage
 * leaves a clean-looking ending. Measured on HEAD 2026-09-22, all rendered on real cards:
 *   "3-Fund Portfolio" -> "Fund Portfolio" (a TERM card), "10-K Annual Report" -> "K Annual Report",
 *   "30-year annualized returns" -> "Year annualized returns", "2008: Stocks vs. Bonds" -> "Stocks
 *   vs. Bonds": a section-number strip that ate the number the title is about.
 *   "Income Statement Waterfall: Apple Q4 2022 ($B)" -> "Income Statement Waterfall": a subtitle drop
 *   that took the company, year and unit off a chart that fit whole within the grace.
 *   "Debt is cheap but dangerous. Equity is safe but expensive." -> "... Equity is safe": a word
 *   cut that left a claim the lesson does not make.
 */
const KEEP_WHOLE = [
  '3-Fund Portfolio', '10-K Annual Report', '24-Hour Rule', '30-year annualized returns',
  '2008: Stocks vs. Bonds', 'Income Statement Waterfall: Apple Q4 2022 ($B)',
];
const damaged = [];
for (const t of KEEP_WHOLE) {
  const shown = compressTitle(t, CARD_BUDGET.title);
  if (shown !== t) damaged.push(`"${t}" -> "${shown}"`);
}
const debt = compressTitle('Debt is cheap but dangerous. Equity is safe but expensive.', CARD_BUDGET.title);
if (/equity is safe$/i.test(debt)) damaged.push(`"Debt is cheap but dangerous. Equity is safe but expensive." -> "${debt}"`);

// The wrapped loader must actually have converted steps, or a pass says nothing.
assert.ok(decks > 500, `only ${decks} mobileDeck steps seen; the wrapped loader did not run, so a pass is meaningless`);

if (SELFTEST) {
  const PRE_FIX = [
    'The Five Investment Accounts You Need to',
    'Capital Gains: The Tax on Your',
    'Pay Taxes Now or Later? The',
    'How 1% in Fees Costs You Hundreds of',
    'Stocks, Bonds,',
  ];
  for (const s of PRE_FIX) assert.ok(dangles(s), `selftest: the dangle check cannot see "${s}"`);
  assert.ok(endsOnNumber('Defined Benefit vs. Defined Contribution, and the $3.5'), 'selftest: a number cut from its scale is not seen');
  assert.ok(!endsOnNumber('Two Scales, One $3.5 Trillion Problem'), 'selftest: a whole title is blamed for a number');
  assert.ok(!dangles('The Five Investment Accounts You Need to Know'), 'selftest: the dangle check blames a whole title');
  assert.ok(authoredThatWay('What to Look For', { title: 'What to Look For' }), 'selftest: an authored stopword ending is blamed on the cutter');
  assert.ok(!authoredThatWay('You Need to', { title: 'You Need to Know' }), 'selftest: a cut is excused as authored');
  assert.ok('x'.repeat(60).length > Math.floor(CARD_BUDGET.title * TITLE_GRACE), 'selftest: the length check cannot see a 60-char title');
  console.log('[title-cut-pin] selftest ok: pre-fix cuts are caught and whole titles pass');
}

if (dangling.length || overlong.length || damaged.length) {
  console.error('\nTITLE CUT PIN FAILED\n');
  if (dangling.length) {
    console.error(`  ${dangling.length} title(s) end on a dangling word, mark or cut-off figure:`);
    dangling.slice(0, 25).forEach((d) => console.error(`    ${d}`));
  }
  if (damaged.length) {
    console.error(`  ${damaged.length} authored title(s) changed that must stay whole:`);
    damaged.forEach((d) => console.error(`    ${d}`));
  }
  if (overlong.length) {
    console.error(`  ${overlong.length} title(s) run past ${TITLE_GRACE}x their budget:`);
    overlong.slice(0, 25).forEach((d) => console.error(`    ${d}`));
  }
  console.error('\n  Fix it in compressTitle (src/lib/mobile-lesson/compress.ts), not here.\n');
  process.exit(1);
}

console.log(`[title-cut-pin] ok: ${checked} titles across ${decks} decks, 0 dangling, 0 over ${TITLE_GRACE}x budget`);
