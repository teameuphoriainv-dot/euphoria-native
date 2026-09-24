/**
 * Shortening the questions and the answer options for a phone.
 *
 * MEASURED over the 1,307 choice steps in the corpus:
 *   question prompts  median 165 characters, p90 269, longest 467, and 76% over 120
 *   answer options    median 52, p90 192, longest 1,030, and 45% over 60
 * A 1,030 character answer option is a paragraph pretending to be a button.
 *
 * THE PROMPT AND THE OPTIONS ARE NOT THE SAME PROBLEM, and treating them the same is how a
 * shortener breaks a quiz.
 *
 * A PROMPT is prose. Trimming it can only cost context, and the compressor already refuses cuts
 * that could change a claim, so it gets the same treatment as a lesson card.
 *
 * AN OPTION IS AN ANSWER. It is one of a set, and the set has to keep working:
 *   - two options must never become the same string, or the learner is asked to choose between
 *     identical buttons and one of them is marked wrong
 *   - the correct option must not become the conspicuously different one, because length is a tell
 *     and this corpus already has a history of it (76.5% of its questions once had the longest
 *     option as the correct one)
 *   - a qualifier that carries the whole distinction ("...but only for accounts under $10,000")
 *     must never be the thing that gets cut
 * So options are shortened ALL OR NOTHING, as a set, and only when every one of those invariants
 * still holds afterwards. If any of them fails, the whole set is left exactly as authored. A long
 * option is survivable. A quiz with two identical answers is not.
 */
import { BUDGET_GRACE, compress, sentences } from './compress';

/** Budgets, from what actually fits a 393pt screen without the options falling below the fold. */
export const QUESTION_BUDGET = {
  /** A prompt that stays under about three lines. */
  prompt: 130,
  /** An option that stays on one or two lines. */
  option: 70,
} as const;

/**
 * Budgets for the other text-heavy steps, measured the same way.
 *
 * HOOK OPENER is the first screen of all 300 lessons and the worst offender left in the corpus:
 * `fact` runs to a median of 338 characters with a longest of 894, on a screen that also carries a
 * title, a chart and a button. `outcome` adds another 241 under it.
 *
 * STAKES DETAIL only renders when neither panel has an authored visual, but when it does it is two
 * paragraphs of about 305 characters each inside panels that already have to share one screen.
 *
 * VOCABULARY definitions are shown one per beat, so their median of 154 is survivable; the cap is
 * here for the tail, which reaches 288.
 */
export const STEP_TEXT_BUDGET = {
  /** The hook's hero statement. Long enough for a real statistic, short enough to land. */
  fact: 150,
  /** What the lesson will give you. One sentence. */
  outcome: 110,
  /** One side of a stakes comparison. */
  stakesDetail: 150,
  /** One vocabulary definition, on its own beat. */
  definition: 180,
} as const;

/**
 * Trim an authored field to a budget, or leave it exactly as written.
 *
 * Returns the original whenever compression cannot produce something shorter AND safe, because
 * every one of these fields is load-bearing: a hook with no fact is a blank hero, and a definition
 * with no text is a word with no meaning.
 */
export function shortenField(text: string | undefined, budget: number): string | undefined {
  if (typeof text !== 'string') return text;
  const trimmed = text.trim();
  if (trimmed.length <= budget) return text;
  const out = compress(trimmed, budget);
  return out && out.length < trimmed.length ? out : text;
}


/**
 * The hook's fact, keeping its first AND last sentence when the pair fits.
 *
 * A hook fact is a setup and a payoff: "Put $100 in a drawer in 1995 and it is still $100 today.
 * ... Inflation averaged roughly 2.5% a year and quietly took two thirds of it." (investing-
 * fundamentals L1 s0). shortenField is topic-sentence-first, so it kept only the setup, and the
 * first screen of the lesson showed a flat statement with the surprise cut off. The pair is kept
 * when it fits BUDGET_GRACE x budget, the same overrun compress allows a card, and otherwise this
 * falls back to shortenField exactly as before.
 */
export function shortenHookFact(fact: string | undefined, budget: number): string | undefined {
  if (typeof fact !== 'string') return fact;
  const trimmed = fact.trim();
  if (trimmed.length <= budget) return fact;
  const parts = splitSentences(trimmed);
  if (parts.length >= 2) {
    const pair = parts.length === 2 ? trimmed : `${parts[0]} ${parts[parts.length - 1]}`;
    if (pair.length <= budget * BUDGET_GRACE) return pair;
  }
  return shortenField(fact, budget);
}

/**
 * A figure as the author wrote it, unit included ("$600", "0.03%"). Trailing sentence punctuation
 * is dropped so "at 35," and "at 35." count as the same number.
 */
function numbersIn(text: string): string[] {
  return (String(text).match(/\$?\d[\d,.]*%?/g) ?? []).map((n) => n.replace(/[.,]+$/, ''));
}

/** Every figure in `authored` still appears in `shown`. */
function keepsEveryNumber(authored: string, shown: string): boolean {
  const have = new Set(numbersIn(shown));
  return numbersIn(authored).every((n) => have.has(n));
}

/**
 * Abbreviations that end in a full stop without ending a sentence. `\b[A-Z]\.[A-Z]` covers U.S.
 * and U.K.; the rest are the ones compress.ts already knows the corpus uses.
 */
const ABBREVIATION_END = /(?:\b[A-Z]\.[A-Z]|\bvs|\be\.g|\bi\.e|\bInc|\bCorp|\bCo|\bapprox|\bMr|\bMs|\bDr|\bSt|\bJr|\bSr)\.$/i;

/**
 * Split a prompt into sentences, WITHOUT the two mistakes the old last-sentence regex made.
 *
 * 1. "U.S." IS NOT A SENTENCE END. The old `([^.!?]+\?)\s*$` began matching after the last '.',
 *    so global-economics L6 s3 ("...Should the U.S. still import textiles from Bangladesh?")
 *    reached the learner as "still import textiles from Bangladesh?". Splits that land after an
 *    abbreviation are re-joined here.
 * 2. A QUOTATION IS ONE UNIT. behavioral-finance L18 s8 quotes a colleague across two sentences
 *    and then asks "Evaluate this reasoning." Splitting inside the quote would keep half of what
 *    is being evaluated and leave an unclosed quote mark on screen. Straight quotes are only
 *    tracked when they pair up, so one stray mark cannot swallow the rest of the prompt.
 *
 * Unlike compress's `sentences`, nothing is dropped for being short: "This demonstrates:" is the
 * whole ask of business-strategy L13 s3.
 */
function splitSentences(text: string): string[] {
  const src = String(text ?? '').trim();
  if (!src) return [];
  const trackStraight = (src.match(/"/g) ?? []).length % 2 === 0;
  const out: string[] = [];
  let start = 0;
  let inQuote = false;
  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i];
    if ((ch === '"' && trackStraight) || ch === '“' || ch === '”') {
      inQuote = ch === '"' ? !inQuote : ch === '“';
      continue;
    }
    if (inQuote || !/\s/.test(ch)) continue;
    const before = src.slice(start, i);
    const next = src.slice(i).trimStart()[0] ?? '';
    const ends = /[.!?]["'”’)]*$/.test(before);
    if (!ends || !/["'“(A-Z0-9]/.test(next) || ABBREVIATION_END.test(before)) continue;
    out.push(before.trim());
    start = i + 1;
  }
  const last = src.slice(start).trim();
  if (last) out.push(last);
  return out;
}

/*
 * An ask that points back at something the setup introduced. "At age 65, who has more money?"
 * (investing-fundamentals L3 s7) means nothing without the twins it is about.
 */
const REFERS_BACK = /^["'“(]?(it|its|this|that|these|those|they|their|them|he|his|she|her|both|each|such|twin|the (fund|company|stock|investor|couple|family|firm|business|plan|portfolio|board|bank|country|city|government|twins?))\b/i;
/*
 * The same pointing, anywhere in the ask. behavioral-finance L17 s7 ends "Using disposition effect
 * research, evaluate this advice." and was shown with the advice cut. "that" is left out on
 * purpose: it is far more often a conjunction ("shows that...") than a pointer.
 */
const THIRD_PERSON = /\b(it|its|they|them|their|he|him|his|she|her|this|these|those)\b/i;

/** An ask phrased as an instruction or a sentence the options complete, rather than a question. */
const INSTRUCTION = /^["'“(]?(using|explain|predict|which|why|what|how|this is|evaluate|identify|design|describe|compare|calculate)\b/i;

/**
 * Does the setup carry something the question needs?
 *
 * The test is deliberately CONSERVATIVE, because the two mistakes are not equally bad. Keeping a
 * setup that was not needed costs characters. Dropping one that WAS needed produces a question
 * nobody can answer, and a wrong answer costs the learner a heart.
 *
 * It used to return false whenever the question had ANY digit, on the theory that a question with
 * its own numbers does not need the setup's. That dropped 243 setups carrying figures (scout,
 * 2026-09-22): investing-fundamentals L6 s3 asked "On a $10,000 investment over 30 years, how much
 * more does the low-cost fund produce?" with both expense ratios cut. The rule is now per figure:
 * the setup is load-bearing if it has ANY number the question does not repeat, or the question
 * refers back to it, or the question is too short to stand alone.
 */
function setupIsLoadBearing(setup: string, ask: string): boolean {
  if (!setup) return false;
  const askNumbers = new Set(numbersIn(ask));
  if (numbersIn(setup).some((n) => !askNumbers.has(n))) return true;
  if (REFERS_BACK.test(ask) || THIRD_PERSON.test(ask)) return true;
  return ask.length < 40;
}

/*
 * Setup sentences that must survive even with no figure in them.
 *
 * A TURN: applied-accounting L25 s3 is "A company shows 22% ROE, growing revenue, and positive net
 * income. But operating cash flow has been negative for three consecutive years..." and was shown
 * with the "But" sentence cut, which leaves a healthy company and the opposite of the question.
 * A BACK-REFERENCE drags in the sentence before it: corporate-finance L19 s9 kept "The green bond
 * would cost $2M more" and dropped the sentence that introduced the green bond.
 */
const TURN = /^["'\u201C(]?(but|however|yet|although|though|still|except|instead|meanwhile)\b/i;
const POINTS_BACK = /^["'\u201C(]?(this|that|these|those|it|its|they|their|them|he|his|she|her|both|such|the (same|other|green|first|second|former|latter|fund|company|stock|bond|investor|twins?|board|plan))\b/i;

/**
 * Choose which setup sentences to show in front of the ask, or '' when they cannot all fit.
 *
 * MUST KEEP: every sentence with a figure the ask does not repeat, every turn, and the sentence
 * before anything that points back. The old version filled from the end and skipped whatever did
 * not fit, which is how investing-fundamentals L4 s7 kept the bond return and dropped the 60/40
 * split the question was about. If the must-keep set runs past BUDGET_GRACE x budget this returns
 * '' and the caller shows every sentence: long and answerable beats short and not.
 *
 * Whatever room is left goes to the other sentences, nearest the ask first, STOPPING at the first
 * one that does not fit rather than skipping past it. Skipping is how behavioral-finance L17 s7
 * kept "You own a stock that has tripled" and dropped the friend's advice its ask says to
 * evaluate. The room is the budget, or the grace ceiling once the must-keep set is already over
 * the budget (a prompt that is over either way loses nothing by keeping its context) or when the
 * ask cannot stand on little.
 * Authored order is kept: a setup is a sequence, and reordering it would change what it says.
 */
function keepTheData(setup: string[], ask: string): string {
  const askNumbers = new Set(numbersIn(ask));
  const ceiling = QUESTION_BUDGET.prompt * BUDGET_GRACE;
  const keep = new Set<number>();
  setup.forEach((s, i) => {
    if (TURN.test(s) || numbersIn(s).some((n) => !askNumbers.has(n))) keep.add(i);
  });
  // A kept sentence, or the ask itself, that points back keeps the one before it, transitively.
  if (POINTS_BACK.test(ask) && setup.length > 0) keep.add(setup.length - 1);
  for (let i = setup.length - 1; i > 0; i -= 1) {
    if (keep.has(i) && (POINTS_BACK.test(setup[i]) || TURN.test(setup[i]))) keep.add(i - 1);
  }
  let used = ask.length + [...keep].reduce((sum, i) => sum + setup[i].length + 1, 0);
  if (used > ceiling) return '';

  /*
   * An ask that is short or points back ("How does THIS difference affect the income statement?",
   * applied-accounting L19 s3; "What do you recommend?" after "The CEO wants to make the same
   * change", applied-accounting L13 s11) is the one most hurt by a missing sentence, so it gets the
   * grace ceiling too. Measured cost: 797 to 860 of 1,307 prompts over the 130 budget (2026-09-22).
   */
  const needy = ask.length < 40 || THIRD_PERSON.test(ask);
  const room = used > QUESTION_BUDGET.prompt || needy ? ceiling : QUESTION_BUDGET.prompt;
  for (let i = setup.length - 1; i >= 0; i -= 1) {
    if (keep.has(i)) continue;
    const cost = setup[i].length + 1;
    if (used + cost > room) break;
    keep.add(i);
    used += cost;
  }
  // Not one sentence fit under the budget. The nearest one within the grace beats no context.
  if (keep.size === 0) {
    const nearest = setup[setup.length - 1] ?? '';
    if (!nearest || ask.length + nearest.length + 1 > ceiling) return '';
    keep.add(setup.length - 1);
  }
  return setup.filter((_, i) => keep.has(i)).join(' ');
}

/**
 * Tighten an over-budget ask on its own. Refused, and the ask returned whole, if the result loses
 * the question mark or a figure: a long question a learner can answer beats a short statement.
 *
 * Falling through to `compress` on the whole prompt used to drop the question altogether on 7
 * prompts, because compress is topic-sentence-first and the topic sentence of a scenario is the
 * scene, not the ask.
 */
function tightenAsk(ask: string): string {
  const out = compress(ask, QUESTION_BUDGET.prompt);
  if (!out || out.length >= ask.length) return ask;
  if (/\?/.test(ask) && !/\?/.test(out)) return ask;
  return keepsEveryNumber(ask, out) && readsWhole(ask, out) ? out : ask;
}

/**
 * One sentence with its padding removed, or exactly as written.
 *
 * Once every figure has to stay, the only characters left to save are the ones compress already
 * knows are padding: hedges, discourse openers, register swaps, trailing non-restrictive clauses.
 * Refused unless the sentence is a single sentence to compress (a quoted pair would come back as
 * its first half), and unless every figure, the question mark and the qualifiers survive.
 */
function trimSentence(sentence: string): string {
  if (sentences(sentence).length !== 1) return sentence;
  /*
   * compress's `sentences` drops short sentences, so a quoted pair still counts as ONE above.
   * risk-management L1 s13 ('The CEO says: "Great, so we can never lose more than $15 million in a
   * day. We're safe."') came back without "We're safe." and with its quote left open on screen.
   * A unit with a sentence boundary inside it is shown exactly as written.
   */
  if (/[.!?]["'”’)]*\s+\S/.test(sentence)) return sentence;
  const out = compress(sentence, sentence.length - 1);
  if (!out || out.length >= sentence.length) return sentence;
  if (/\?/.test(sentence) && !/\?/.test(out)) return sentence;
  if (/:$/.test(sentence) && !/:$/.test(out)) return sentence;
  return optionIsWhole(sentence, out) ? out : sentence;
}

/**
 * Shorten a question prompt.
 *
 * A prompt is usually a SETUP followed by the ASK, and the ask is its last sentence. That holds
 * whether it ends in '?', in ':' ("This is an example of:"), in an instruction ("Using supply and
 * demand, predict the long-term consequences.") or in the turn of a scenario ("On Friday a rare
 * pair drops for $350, cash up front."). The old code only found the ask when the prompt ended in
 * '?' and sent everything else to `compress`, which kept the FIRST sentence: 33 prompts lost their
 * ask (business-strategy L3 s3 showed the Cirque du Soleil facts and never asked anything), and
 * corporate-finance L2 s7 came out as "You run a sneaker resale page." with every price gone.
 *
 * The setup is dropped only when the ask is a real question or instruction that stands without
 * it AND none of the setup fits beside it. A scenario's last sentence never stands alone, so its
 * setup is always kept.
 *
 * Falls back to the authored prompt rather than returning nothing: a question with no text is
 * unanswerable, which is worse than a long one.
 */
export function shortenPrompt(prompt: string): string {
  const text = String(prompt ?? '').trim();
  if (text.length <= QUESTION_BUDGET.prompt) return text;

  const parts = splitSentences(text).map(trimSentence);
  if (parts.length < 2) return tightenAsk(text);
  const ask = parts[parts.length - 1];
  const setup = parts.slice(0, -1);

  const standsAlone = /\?["'”)]*$/.test(ask) || /:$/.test(ask) || INSTRUCTION.test(ask);
  const mayDropSetup = standsAlone && !setupIsLoadBearing(setup.join(' '), ask);
  const whole = parts.join(' ');

  // An ask already over budget leaves no room for a setup. It is tightened alone when the setup
  // may go, and otherwise every sentence is shown with only the padding trimSentence removed.
  if (ask.length > QUESTION_BUDGET.prompt) return mayDropSetup ? tightenAsk(ask) : whole;

  /*
   * EVEN A SETUP THAT MAY GO KEEPS WHAT FITS. The load-bearing test cannot see every dependency:
   * "Based on your understanding of the Greeks, what most likely happened?" (quantitative-analysis
   * L5 s14) has no figure and no pronoun and is meaningless without the investor it follows.
   * Keeping the nearest context whenever it fits cost 10 more over-budget prompts out of 1,307
   * (791 to 797, measured 2026-09-22); dropping it is only the fallback when nothing fits.
   */
  const kept = keepTheData(setup, ask);
  if (kept) return `${kept} ${ask}`;
  return mayDropSetup ? ask : whole;
}

/*
 * WHERE AN OPTION IS UNFINISHED. The union of the words the A1 spec names and the wider list the
 * scout measured with, because "...make up for the" and "...the ratio between" are equally cut.
 */
const UNFINISHED_END = /\b(and|or|but|nor|the|a|an|of|to|for|with|in|on|by|at|from|as|than|that|which|your|their|its|is|are|was|were|be|while|when|if|because|since|so|vs|versus|into|per|about|over|under|between|this|these|not|no|more|less)$/i;

/*
 * Words that carry the distinction between one answer and another. An option may lose padding;
 * it may not lose one of these. investing-fundamentals L3 s13's correct answer is "Even $300/month
 * starting now likely beats $600/month at 35, because seven extra years of compounding outweigh
 * doubling the contribution": the reason IS the answer, and the distractors differ from it in
 * exactly that clause. "so" and "which" are here for the same reason: "Disagree, high implied
 * volatility means Apple will make a huge move, so buying options is the better trade"
 * (quantitative-analysis L5 s10) lost the conclusion that made it wrong.
 */
const QUALIFIERS = /\b(not|never|no|none|only|unless|except|but|because|since|so|which|therefore|if|without|always|all|every|before|after|until|than)\b|n't\b/gi;

/**
 * Is a shortened option still a complete answer?
 *
 * The three checks from the 2026-09-22 scout, each of which compressTitle failed at scale: it must
 * not end on a function word or a comma (495 questions did, 286 of them on the CORRECT option), it
 * must not leave a '(' open or drop an aside (68 did), and it must keep every figure the author
 * wrote (487 options lost one).
 */
function optionIsWhole(authored: string, shown: string): boolean {
  if (shown === authored) return true;
  const t = shown.trim();
  if (/,$/.test(t) || UNFINISHED_END.test(t.replace(/[.!?]+$/, '').trim())) return false;
  const opens = t.split('(').length - 1;
  if (opens !== t.split(')').length - 1 || opens !== authored.split('(').length - 1) return false;
  if (!keepsEveryNumber(authored, t)) return false;
  const had = (authored.match(QUALIFIERS) ?? []).map((w) => w.toLowerCase());
  const has = new Set((t.match(QUALIFIERS) ?? []).map((w) => w.toLowerCase()));
  if (!had.every((w) => has.has(w))) return false;
  return readsWhole(authored, t);
}

/*
 * compress's word swaps and filler strips are safe in most sentences and ungrammatical in a few
 * specific ones. Each shape below reached the wrapped loader once options and prompt sentences
 * started going through compress (review of A1, 2026-09-22):
 *   "the fact that" stripped:  risk-management L2 s10's CORRECT option became "Run the stress test
 *                              immediately, something hasn't happened doesn't mean it can't happen"
 *   demonstrate -> shows:      global-economics L17 s3 "What economic concept does this shows?"
 *   additional -> more:        applied-accounting L7 s6 "every more unit a company produces"
 *   "However," stripped:       investing-fundamentals L15 s3 lost the turn "However, the euro falls
 *                              7%", which is the reversal the question is about
 * A rewrite that makes one of these is refused and the text is shown as written.
 */
const BROKEN_BY_REWRITE = [
  /\b(?:do|does|did|will|would|can|could|should|may|might|must|to)\s+(?:\w+\s+)?shows\b/i,
  /\b(?:an?|every|each|one|any|in)\s+more\b/i,
];
const quoteMarks = (s: string) => (s.match(/["“”]/g) ?? []).length;

function readsWhole(authored: string, shown: string): boolean {
  if (/\bthe fact that\b/i.test(authored) && !/\bthe fact that\b/i.test(shown)) return false;
  if (BROKEN_BY_REWRITE.some((re) => re.test(shown) && !re.test(authored))) return false;
  if (TURN.test(authored) && !TURN.test(shown)) return false;
  // A dropped half of a quotation leaves its mark open on screen.
  return quoteMarks(shown) % 2 === 0 || quoteMarks(authored) % 2 === 1;
}

/** Everything that must still be true of a set of options after shortening it. */
function setIsStillValid(original: string[], shortened: string[], correct: number): boolean {
  if (shortened.length !== original.length) return false;
  if (shortened.some((o) => o.trim().length < 2)) return false;

  // Every option must still be a complete answer. One cut option fails the whole set.
  if (shortened.some((o, i) => !optionIsWhole(original[i], o))) return false;

  // No two options may collapse into the same answer.
  const seen = new Set(shortened.map((o) => o.trim().toLowerCase()));
  if (seen.size !== shortened.length) return false;

  /*
   * SHORTENING MUST NEVER CREATE THE LENGTH TELL.
   *
   * If the correct option is the single longest, a learner can pick it without reading any of them.
   * Measured on this corpus that was already true of 867 of the 1,307 questions, 66%, before any of
   * this ran, which matches the 76.5% recorded in an earlier content audit.
   *
   * The rule is comparative, not absolute, and that distinction is the whole point. Refusing every
   * set where the correct answer ends up longest would refuse 597 questions and fix none of them,
   * because the tell is in the authored content and shortening is not what put it there. What this
   * has to guarantee is that shortening does not MAKE it worse.
   *
   * A first version used an absolute threshold (longest > 1.5x the next) and created the tell on 25
   * questions that did not have it. Comparing before against after takes that to zero.
   */
  const tells = (arr: string[]) => {
    const lengths = arr.map((o) => o.length);
    const longest = Math.max(...lengths);
    return lengths[correct] === longest && lengths.filter((x) => x === longest).length === 1;
  };
  if (!tells(original) && tells(shortened)) return false;

  return true;
}

/**
 * One option, shortened with `compress` or left exactly as authored.
 *
 * compressTitle was used here and it is a TITLE cutter: it slices at the budget and backs off to a
 * space with no ellipsis, so it produced "She is right, the higher salary at 35 will more than make
 * up for the". compress only ever removes non-restrictive material from a whole sentence. It is
 * given the FIRST sentence alone, because compress skips a short opener and would otherwise hand
 * back the second sentence of "No. It only works if..." as though it were the answer.
 */
function shortenOption(authored: string): string {
  if (authored.length <= QUESTION_BUDGET.option) return authored;
  const first = splitSentences(authored)[0] ?? authored;
  let out = compress(first, QUESTION_BUDGET.option);
  if (!out || out.length >= authored.length) return authored;
  // compress terminates what it returns. An option authored with no full stop keeps none, or the
  // one shortened option would be the only button in the set ending in '.'.
  if (!/[.!?]$/.test(authored.trim())) out = out.replace(/\.$/, '');
  /*
   * compress also capitalises what it returns. financial-analytics L1 s6 is a fill-in-the-blank
   * whose options are lowercase words dropped into a sentence ("statistical"), and the shortened
   * distractor came back as "Intuitive, because...": the only capitalised option, mid-sentence.
   */
  if (/^[a-z]/.test(authored) && out[0]?.toLowerCase() === authored[0]) out = authored[0] + out.slice(1);
  return optionIsWhole(authored, out) ? out : authored;
}

/**
 * Shorten a whole set of options, or return them untouched.
 *
 * `correct` is the index of the right answer in `options`, as authored.
 */
export function shortenOptions(options: string[], correct: number): string[] {
  const authored = options.map((o) => String(o ?? ''));
  if (authored.every((o) => o.length <= QUESTION_BUDGET.option)) return authored;
  const shortened = authored.map(shortenOption);
  return setIsStillValid(authored, shortened, correct) ? shortened : authored;
}

/**
 * Whether a set was actually shortened. Not used by the app. scripts/question-shortener-pin.mjs
 * calls it on every authored set and fails if its answer ever disagrees with what the wrapped
 * loader rendered, which would mean the loader is not running this shortener.
 */
export function optionsWereShortened(options: string[], correct: number): boolean {
  return shortenOptions(options, correct).join('\u0000') !== options.join('\u0000');
}
