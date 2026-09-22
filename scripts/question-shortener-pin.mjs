/**
 * A1: the question shortener must never cut an answer mid-sentence or drop the data a prompt needs.
 *
 * Run: node --import ./scripts/ts-resolve-hooks.mjs scripts/question-shortener-pin.mjs [--selftest]
 *
 * WHAT IT CAUGHT. Measured on HEAD 5c2eab7 (2026-09-22) against the WRAPPED loader
 * (src/lib/curriculum/index.ts, which is what renders) compared with the raw authored corpus:
 *   495 questions showed an option ending on a function word ("...make up for the")
 *   286 of those were the CORRECT option, so the right answer was the unfinished one
 *   487 options lost a number the author wrote
 *    68 options were left with an unclosed "("
 *   243 prompts dropped a setup sentence carrying figures (investing-fundamentals L6 s3 asked
 *       which fund produces more while hiding both expense ratios)
 *    33 prompts not ending in "?" lost their actual ask ("This is an example of:")
 *     1 prompt started in the middle of "U.S." ("still import textiles from Bangladesh?")
 * Those are the scout's counts (health2/health3.mjs). This pin's own lanes, run on the same HEAD,
 * measured 496 / 288 / 486 / 68 / 421 / 33 / 1: it strips trailing punctuation before testing an
 * ending and a number, and it counts every dropped setup sentence with a figure the shown prompt
 * lacks, not only the prompts cut down to their last sentence. All seven exited 1 before the fix.
 * The option cuts came from compressTitle, which slices at a character budget and backs off to a
 * space with no ellipsis. The prompt losses came from setupIsLoadBearing returning false whenever
 * the question had ANY digit, and from a last-sentence regex that treated "U.S." as a sentence end.
 *
 * Every count is measured by comparing a rendered string with the string the author wrote, so a
 * shortener that does nothing passes, and one that cuts anything badly fails.
 */
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = join(import.meta.dirname, '..');
const imported = (p) => import(pathToFileURL(join(ROOT, p)).href);

/*
 * The function-word ending. The union of the words the A1 spec names and the scout's wider list,
 * because an option ending on "their" or "between" is just as unfinished as one ending on "the".
 * Trailing sentence punctuation is stripped first: "...more than make up for the." is still cut.
 */
const STOP_END = /\b(and|or|but|nor|the|a|an|of|to|for|with|in|on|by|at|from|as|than|that|which|your|their|its|is|are|was|were|be|while|when|if|because|since|so|vs|versus|into|per|about|over|under|between|this|these|not|no|more|less)$/i;
export const endsUnfinished = (o) => {
  const t = String(o).trim();
  return /,$/.test(t) || STOP_END.test(t.replace(/[.!?]+$/, '').trim());
};

/*
 * A number as the author wrote it, unit included ("$600", "0.03%"). Trailing sentence punctuation
 * is dropped, so "at 35," and "at 35." are the same number: the scout's raw token counted those as
 * a lost number, which is a punctuation change, not lost data.
 */
export const numbersIn = (s) => (String(s).match(/\$?\d[\d,.]*%?/g) ?? []).map((n) => n.replace(/[.,]+$/, ''));
export const lostNumbers = (authored, shown) => {
  const have = new Set(numbersIn(shown));
  return numbersIn(authored).filter((n) => !have.has(n));
};
export const unbalancedParen = (o) => /\($/.test(o) || o.split('(').length !== o.split(')').length;

/** Split for the setup-sentence check. Same boundary the scout used, plus the U.S.-style re-join. */
const splitSentences = (t) => {
  const raw = String(t).trim().split(/(?<=[.!?]["'”]?)\s+(?=["'“(]?[A-Z0-9])/);
  const out = [];
  for (const p of raw) {
    const prev = out[out.length - 1];
    if (prev && /(?:\b[A-Z]\.[A-Z]|\bvs|\be\.g|\bi\.e|\bInc|\bCorp|\bCo|\bapprox|\bNo|\bMr|\bMs|\bDr|\bSt)\.$/i.test(prev)) out[out.length - 1] = `${prev} ${p}`;
    else out.push(p);
  }
  return out;
};

/**
 * Setup sentences with a figure the shown prompt does not carry. The setup is whatever of the
 * authored prompt precedes its final sentence (the ask). A number the shown prompt repeats is not
 * lost, because the learner still sees it.
 */
export const droppedDataSentences = (authored, shown) => {
  const parts = splitSentences(authored);
  const setup = parts.slice(0, -1);
  return setup.filter((s) => lostNumbers(s, shown).length > 0);
};

/** The scout's exact lost-ask rule, kept verbatim so the before and after numbers compare. */
export const lostTheAsk = (authored, shown) => {
  if (/\?\s*$/.test(authored.trim())) return false;
  const last = authored.trim().split(/(?<=[.!?:])\s+/).pop();
  return !shown.includes(last.slice(0, 20));
};
/*
 * A rewrite that breaks the sentence it shortened. Found in review of A1 on the wrapped loader,
 * once every option and prompt sentence went through compress: a quote left open
 * (risk-management L1 s13), "does this shows?" (global-economics L17 s3), "every more unit"
 * (applied-accounting L7 s6), a correct option with "the fact that" stripped out of its subject
 * (risk-management L2 s10), a lost "However," (investing-fundamentals L15 s3), and a lowercase
 * fill-in-the-blank option capitalised mid-sentence (financial-analytics L1 s6).
 */
const quoteMarks = (s) => (String(s).match(/["“”]/g) ?? []).length;
const BROKEN = [/\b(?:do|does|did|will|would|can|could|should|may|might|must|to)\s+(?:\w+\s+)?shows\b/i, /\b(?:an?|every|each|one|any|in)\s+more\b/i];
export const rewriteBroke = (authored, shown) => {
  const a = String(authored), t = String(shown);
  if (a === t) return null;
  if (quoteMarks(a) % 2 === 0 && quoteMarks(t) % 2 === 1) return 'quote left open';
  const bad = BROKEN.find((re) => re.test(t) && !re.test(a));
  if (bad) return `ungrammatical swap ${bad}`;
  for (const m of a.matchAll(/\bthe fact that\s+(\S+\s+\S+)/gi)) if (!t.includes(m[0]) && t.includes(m[1])) return '"the fact that" stripped';
  // A sentence that kept its words but lost the "However," in front of them.
  for (const m of a.matchAll(/\b(?:However|But|Yet|Instead|Meanwhile),?\s+(\S+\s+\S+\s+\S+)/g)) {
    const rest = m[1][0].toUpperCase() + m[1].slice(1);
    if (!t.includes(m[0]) && t.includes(rest)) return `lost the turn "${m[0]}"`;
  }
  if (/^[a-z]/.test(a) && /^[A-Z]/.test(t)) return 'lowercase option capitalised';
  return null;
};
export const startsMidAbbreviation = (shown) => /^(S\.|[a-z])/.test(shown) || /^(e\.g|i\.e)/.test(shown);

// A GREEN RUN MEANS NOTHING UNLESS EVERY LANE CAN GO RED. Each detector is fed the shape it must
// catch and a shape it must ignore, then the shortener itself is fed the incidents by name.
if (process.argv.includes('--selftest')) {
  const { shortenOptions, shortenPrompt } = await imported('src/lib/mobile-lesson/question.ts');
  const ok = (c, m) => { if (!c) { console.error(`selftest FAILED: ${m}`); process.exit(1); } };
  ok(endsUnfinished('She is right, the higher salary at 35 will more than make up for the'), 'an option ending on "the" is unfinished');
  ok(endsUnfinished('Even $300/month starting now likely beats $600/month at 35, because'), 'an option ending on "because" is unfinished');
  ok(endsUnfinished('Sell everything now,'), 'a trailing comma is unfinished');
  ok(!endsUnfinished('Seven extra years of compounding outweigh the bigger contribution.'), 'a complete clause is not unfinished');
  ok(!endsUnfinished('Theory'), 'a word merely containing "the" is not a function word');
  ok(lostNumbers('Fund A at 1.0% and Fund B at 0.03%', 'Fund A at 1.0%').join() === '0.03%', 'a dropped percentage is a lost number');
  ok(lostNumbers('beats $600/month at 35, because', 'beats $600/month at 35.').length === 0, 'punctuation after a number is not a lost number');
  ok(unbalancedParen('Index funds (low cost'), 'an unclosed paren is caught');
  ok(!unbalancedParen('Index funds (low cost)'), 'a closed paren is fine');
  ok(droppedDataSentences('Fund A charges 1.0%. Fund B charges 0.03%. Which is cheaper?', 'Which is cheaper?').length === 2, 'both fee sentences were dropped');
  ok(droppedDataSentences('It rose 10% in 2020. What did 10% in 2020 mean?', 'What did 10% in 2020 mean?').length === 0, 'a figure the question repeats is not dropped data');
  ok(lostTheAsk('Cirque du Soleil dropped animals. This is an example of:', 'Cirque du Soleil dropped animals.'), 'a lost colon ask is caught');
  ok(!lostTheAsk('Cirque du Soleil dropped animals. This is an example of:', 'Cirque du Soleil dropped animals. This is an example of:'), 'a kept colon ask is fine');
  ok(startsMidAbbreviation('still import textiles from Bangladesh?'), 'a prompt starting mid-sentence is caught');
  ok(rewriteBroke('The CEO says: "Great. We\'re safe."', 'The CEO says: "Great.') === 'quote left open', 'a quote left open is caught');
  ok(rewriteBroke('What does this demonstrate?', 'What does this shows?'), '"does this shows" is caught');
  ok(rewriteBroke('with every additional unit', 'with every more unit'), '"every more unit" is caught');
  ok(rewriteBroke('Act now, the fact that it has not happened does not mean', 'Act now, it has not happened does not mean'), 'a stripped "the fact that" is caught');
  ok(rewriteBroke('It gains 12%. However, the euro falls 7%.', 'It gains 12%. The euro falls 7%.'), 'a lost "However," is caught');
  ok(rewriteBroke('intuitive, because managers feel it', 'Intuitive, because managers feel it'), 'a capitalised blank option is caught');
  ok(!rewriteBroke('It simply shows more returns.', 'It shows more returns.'), 'a plain filler strip is fine');
  ok(splitSentences('The U.S. can make both. Should the U.S. still import?').length === 2, 'U.S. is not a sentence end');

  // The shortener on the incidents themselves, independent of the corpus.
  const us = shortenPrompt('The U.S. can produce both computers and textiles more efficiently than Bangladesh does today, in every measure. Should the U.S. still import textiles from Bangladesh?');
  ok(!startsMidAbbreviation(us), `the U.S. prompt must not start mid-sentence, got "${us}"`);
  const fee = shortenPrompt('Fund A charges a 1.0% expense ratio. Fund B charges 0.03%. Both earn 10% gross return. On a $10,000 investment over 30 years, approximately how much more does the low-cost fund produce?');
  ok(fee.includes('1.0%') && fee.includes('0.03%'), `the fee prompt must keep both expense ratios, got "${fee}"`);
  const authoredSet = ['She is right, the higher salary at 35 will more than make up for the seven years she skipped', 'Even $300/month starting now likely beats $600/month at 35, because seven extra years of compounding outweigh doubling the contribution', 'Wait for a raise'];
  const cut = shortenOptions(authoredSet, 1);
  ok(!cut.some((o, i) => o !== authoredSet[i] && endsUnfinished(o)), `no shortened option may end unfinished, got ${JSON.stringify(cut)}`);
  ok(cut[1] === authoredSet[1], `the correct option keeps its "because" clause, got "${cut[1]}"`);
  const ceo = 'Your firm\'s 1-day 99% VaR model shows a maximum expected loss of $15 million. The CEO says: "Great, so we can never lose more than $15 million in a day. We\'re safe." Using what you\'ve learned about VaR\'s limitations, what is the best response?';
  ok(!rewriteBroke(ceo, shortenPrompt(ceo)), `the CEO quote must not be left open, got "${shortenPrompt(ceo)}"`);
  const blank = ['statistical', 'emotional, since gut instinct is what separates great investors from average ones', 'intuitive, because experienced managers can simply feel where a market is heading', 'anecdotal, drawing on stories and tips passed around the trading floor'];
  ok(!shortenOptions(blank, 0).some((o, i) => rewriteBroke(blank[i], o)), 'a lowercase blank option stays lowercase');
  console.log('question-shortener-pin selftest: every detector fires on its shape and ignores the other');
  process.exit(0);
}

const wrapped = await imported('src/lib/curriculum/index.ts');
const raw = await imported('src/lib/curriculum/courseIndex.ts');
const question = await imported('src/lib/mobile-lesson/question.ts');
const { optionsWereShortened, STEP_TEXT_BUDGET } = question;

/*
 * The allowance for prompts that drop a figure-bearing setup sentence. The spec allows at most 5,
 * each listed by id. It is empty: the measured count after the fix is 0.
 */
const ALLOWED_DROPPED_DATA = new Set([]);

const found = { broken: [], dangling: new Set(), danglingCorrect: new Set(), lostNumber: [], paren: [], droppedData: [], lostAsk: [], abbrev: [], coverageMismatch: [] };
let questions = 0, optionSetsShortened = 0, promptsShortened = 0;
const byId = new Map();

for (const course of wrapped.COURSES) {
  const W = await wrapped.loadCourseLessons(course.id);
  const R = await raw.loadCourseLessons(course.id);
  W.forEach((lesson, li) => lesson.steps.forEach((step, si) => {
    const id = `${course.id}:L${lesson.num}:s${si}`;
    const rs = R[li]?.steps?.[si];
    if (!rs) return;
    let opts = null, ropts = null, correct = 0, prompt = '', rp = '';
    if (['quiz', 'microCheck', 'visualInteractive', 'fillBlank'].includes(step.type)) {
      opts = step.options; ropts = rs.options; correct = rs.correct ?? 0; prompt = step.question ?? ''; rp = rs.question ?? '';
    } else if (step.type === 'scenario') {
      opts = step.choices.map((c) => c.label); ropts = rs.choices.map((c) => c.label);
      correct = Math.max(0, rs.choices.findIndex((c) => c.correct)); prompt = step.situation ?? ''; rp = rs.situation ?? '';
    }
    if (!opts || !ropts) return;
    questions += 1;
    byId.set(id, { opts, ropts, correct, prompt, rp });

    const changed = opts.some((o, i) => o !== ropts[i]);
    if (changed) optionSetsShortened += 1;
    // optionsWereShortened is the shortener's own answer to the same question. If the two ever
    // disagree, the wrapped loader is not running the shortener this pin is measuring.
    if (optionsWereShortened(ropts, correct) !== changed) found.coverageMismatch.push(id);

    opts.forEach((o, i) => {
      const r = String(ropts[i] ?? '');
      if (o === r) return;
      if (endsUnfinished(o)) { found.dangling.add(id); if (i === correct) found.danglingCorrect.add(id); }
      const lost = lostNumbers(r, o);
      if (lost.length) found.lostNumber.push(`${id} opt${i}: lost ${lost.join(',')}: "${o}" <- "${r}"`);
      if (unbalancedParen(o)) found.paren.push(`${id} opt${i}: "${o}"`);
      const why = rewriteBroke(r, o);
      if (why) found.broken.push(`${id} opt${i}: ${why}: "${o}"`);
    });

    if (rp && prompt !== rp) {
      promptsShortened += 1;
      const dropped = droppedDataSentences(rp, prompt);
      if (dropped.length && !ALLOWED_DROPPED_DATA.has(id)) found.droppedData.push(`${id}: shown "${prompt}" dropped "${dropped.join(' ').slice(0, 140)}"`);
      if (lostTheAsk(rp, prompt)) found.lostAsk.push(`${id}: shown "${prompt}"`);
      if (startsMidAbbreviation(prompt)) found.abbrev.push(`${id}: "${prompt}"`);
      const why = rewriteBroke(rp, prompt);
      if (why) found.broken.push(`${id} prompt: ${why}: "${prompt}"`);
    }
  }));
}

/* The named cases from the A1 acceptance, checked by id so a corpus edit cannot hide them. */
const named = [];
const at = (id) => byId.get(id);
{
  const q = at('investing-fundamentals:L3:s13');
  if (!q || q.opts[q.correct] !== q.ropts[q.correct]) named.push(`investing-fundamentals:L3:s13 correct option is not the authored text: "${q?.opts[q?.correct]}"`);
}
{
  const q = at('investing-fundamentals:L6:s3');
  if (!q || !q.prompt.includes('1.0%') || !q.prompt.includes('0.03%')) named.push(`investing-fundamentals:L6:s3 prompt lost an expense ratio: "${q?.prompt}"`);
}
{
  const q = at('corporate-finance:L2:s7');
  if (!q || !q.prompt.includes('$350')) named.push(`corporate-finance:L2:s7 prompt lost the $350 price: "${q?.prompt}"`);
}
{
  const lessons = await raw.loadCourseLessons('investing-fundamentals');
  const fact = lessons.find((l) => l.num === 1)?.steps?.[0]?.fact ?? '';
  if (typeof question.shortenHookFact !== 'function') named.push('shortenHookFact is not exported from question.ts');
  else {
    const shown = question.shortenHookFact(fact, STEP_TEXT_BUDGET.fact);
    if (!shown.includes('two thirds')) named.push(`shortenHookFact dropped the payoff of investing-fundamentals:L1:s0: "${shown}"`);
  }
}

const rows = [
  ['questions with a shown option ending unfinished', found.dangling.size, 0],
  ['  of those, the CORRECT option', found.danglingCorrect.size, 0],
  ['options that lost an authored number', found.lostNumber.length, 0],
  ['options with an unclosed "("', found.paren.length, 0],
  ['prompts dropping a setup sentence with a figure', found.droppedData.length, 0],
  ['non-"?" prompts that lost their ask', found.lostAsk.length, 0],
  ['prompts starting mid-abbreviation', found.abbrev.length, 0],
  ['options or prompts a rewrite left broken', found.broken.length, 0],
  ['optionsWereShortened disagreeing with the loader', found.coverageMismatch.length, 0],
  ['named acceptance cases failing', named.length, 0],
];

console.log('QUESTION SHORTENER PIN');
console.log(`  ${questions} choice questions, ${optionSetsShortened} option sets shortened, ${promptsShortened} prompts shortened`);
for (const [label, n, limit] of rows) console.log(`  ${label.padEnd(52)} ${String(n).padStart(4)}   (limit ${limit})`);

const failing = rows.filter(([, n, limit]) => n > limit);
if (failing.length) {
  const show = (title, list) => { if (list.length) { console.error(`\n${title}:`); list.slice(0, 6).forEach((e) => console.error(`  ${e}`)); } };
  show('unfinished options', [...found.dangling]);
  show('lost numbers', found.lostNumber);
  show('unclosed parens', found.paren);
  show('dropped setup data', found.droppedData);
  show('lost asks', found.lostAsk);
  show('mid-abbreviation starts', found.abbrev);
  show('broken rewrites', found.broken);
  show('optionsWereShortened mismatches', found.coverageMismatch);
  show('named cases', named);
  console.error(`\nFAIL: ${failing.length} lane(s) over their limit`);
  process.exit(1);
}
console.log('\nPASS');
