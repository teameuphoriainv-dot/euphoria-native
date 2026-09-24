/**
 * Cutting authored prose down to a phone, without writing any new prose.
 *
 * THE RULE. This module never generates a sentence. It picks one the curriculum author already
 * wrote and removes material from it. That constraint is not stylistic: this repo has a history of
 * confident generated content being wrong (charts that lied, every wrong answer explained with the
 * same boilerplate), and a finance claim nobody wrote is exactly the thing that must not reach a
 * paying learner. Removal can make a sentence blunt. It cannot make it false.
 *
 * WHAT IT ACHIEVES. Against the real corpus the median `interactiveGraph` step is 2,557 characters
 * and the median `teachingSlide` is 1,636. Measured per step, the deck that replaces one keeps a
 * median of about 21% of what the author wrote: a median step cut of about 79%, with a floor of 72%
 * enforced by `scripts/mobile-card-budget-pin.mjs` (minStepReduction). An earlier version of this
 * comment claimed 92%, which counted card bodies only and ignored titles, prompts and beats.
 *
 * THE ORDER OF OPERATIONS matters and is deliberate:
 *   1. split the source into sentences
 *   2. try each sentence in authored order, because authors put the claim first
 *   3. on each one, apply surgery: asides, hedges, discourse markers, register swaps, tails
 *   4. take the first result that fits the budget
 *   5. if none fits, take the shortest safe reduction that is within BUDGET_GRACE (1.4x) of the
 *      budget, running long rather than cutting a sentence mid-coordination
 *   6. if even that fails, return nothing, except with `mustReturn` (vocabulary), where the whole
 *      first sentence after surgery is returned, because a term with no meaning is worse than a
 *      long one
 * Nothing here cuts a sentence at an arbitrary word. Only compressTitle cuts at a word, and only
 * past TITLE_GRACE.
 */

/**
 * Sentence-ending punctuation followed by a space and a capital.
 *
 * The lookbehind excludes abbreviations that end in a full stop but not a sentence. "Stocks vs.
 * Bonds" was being split into "Stocks vs." and "Bonds", and since the first fragment is under the
 * minimum length it was dropped, leaving a card headed "Bonds: 20-Year Performance" on a step about
 * both. The corpus is finance prose, so vs./e.g./i.e./U.S./Inc. are the ones that actually occur.
 */
const ABBREVIATION = /(?:\bvs|\be\.g|\bi\.e|\bU\.S|\bInc|\bCorp|\bCo|\bapprox|\best|\bNo|\bMr|\bMs|\bDr|\bSt|\bJr|\bSr)\.$/i;
const SENTENCE_SPLIT = /(?<=[.!?])\s+(?=[A-Z0-9"'(])/;

/**
 * Openers that carry no information on a card.
 *
 * On the web these connect a paragraph to the one above it. A card has nothing above it, so the
 * connective is pure cost. Anchored to the start and case-insensitive on the first letter only.
 */
const DISCOURSE_OPENERS = [
  'however', 'that said', 'in other words', 'put simply', 'simply put', 'in short',
  'importantly', 'more importantly', 'crucially', 'notably', 'of course', 'indeed',
  'in practice', 'in reality', 'in fact', 'as a result', 'for this reason', 'therefore',
  'consequently', 'furthermore', 'moreover', 'additionally', 'in addition', 'similarly',
  'by contrast', 'on the other hand', 'ultimately', 'essentially', 'fundamentally',
  'generally speaking', 'broadly speaking', 'at its core', 'the key point is that',
  'the important thing is that', 'what this means is that', 'this is why', 'this means that',
];

/**
 * Hedges and intensifiers that can go without changing what is claimed.
 *
 * Every entry here weakens or pads a claim rather than qualifying it in a way a learner acts on.
 * Words that DO change a claim -- "usually", "rarely", "never", "always", "most", "some" -- are
 * deliberately absent, because dropping those would turn a careful statement into a false one.
 *
 * THAT TEST IS PER-WORD AND IT IS NOT ENOUGH. A word can be pure padding on its own and load
 * bearing in front of the word that follows it, which is a property of the PAIR, not the entry.
 * `stripFiller` used a bare \b word boundary, so both of these shipped to real cards:
 *
 *   "recommending the most cost-effective and suitable investments rather than those that
 *    generate the highest fees"   ->   "... suitable investments than those that ..."
 *
 *   "Consistently high ROE across multiple years is one of the strongest indicators of a moat"
 *    ->   "... is strongest indicators of a moat"
 *
 * The first is the definition of the FIDUCIARY STANDARD with its contrast destroyed; 16 cards
 * across 6 courses read that way. The second is worse than ungrammatical: "one of the strongest"
 * is a membership claim and "strongest" is a superlative, so the strip INVENTED a claim the
 * author did not make, which is the one thing this file promises never to do.
 *
 * NEVER_BEFORE is therefore part of the list, not a patch on it. Adding a FILLER entry means
 * asking what the next word does with it.
 */
const FILLER = [
  'essentially', 'fundamentally', 'basically', 'simply', 'actually', 'really', 'quite',
  'very', 'extremely', 'incredibly', 'highly', 'particularly', 'especially', 'relatively',
  'somewhat', 'rather', 'fairly', 'truly', 'genuinely', 'clearly', 'obviously', 'notably',
  'significantly', 'substantially', 'considerably', 'effectively', 'ultimately', 'indeed',
  'in general', 'as such', 'that is to say', 'it is worth noting that', 'it should be noted that',
  'a number of', 'the fact that',
];

/*
 * 'one of the' USED TO BE ON THAT LIST AND IS NOT A HEDGE.
 *
 * It was first guarded here against superlatives, which fixed "is one of the strongest indicators"
 * -> "is strongest indicators". The guard was the wrong shape: the phrase introduces a MEMBER of a
 * set, so removing it leaves a bare plural where the sentence expects a singular, superlative or
 * not. "It is one of the reasons the fund underperformed" became "It is reasons the fund
 * underperformed". There is no following word that makes the strip safe, so there is no lookahead
 * that rescues it, and it is deleted rather than guarded.
 */

/**
 * Words a FILLER entry may not be stripped in front of, because the pair carries the meaning.
 *
 * Keyed by the FILLER entry. The value is the alternation for a negative lookahead, so a guarded
 * entry is still stripped everywhere else: "rather large" loses "rather", "rather than" keeps it.
 */
const NEVER_BEFORE: Readonly<Record<string, string>> = {
  // "rather than" is a contrast, not a hedge. Dropping "rather" leaves a comparative with nothing
  // to compare, and a learner reads the wreckage as if the author wrote it.
  rather: 'than',
  // In a finance app "relatively safe" -> "safe" is a different statement about risk.
  relatively: '(?:safe|safer|secure|stable|certain|liquid|risk-?free|riskless|predictable)',
  // "effectively zero" is a rounding the author chose; "zero" is an absolute.
  effectively: '(?:zero|nil|none|nothing|all|infinite|unlimited|free|impossible|certain)',
};

/**
 * Plain-English swaps.
 *
 * ONLY general-register vocabulary appears here. No finance term is ever swapped: "dividend",
 * "equity", "liquidity" and their kin are the words the lesson exists to teach, and replacing them
 * would defeat the lesson while looking like an improvement. Each pair is a true synonym in every
 * context the corpus uses it, which is what makes the substitution safe to apply blind.
 */
const PLAIN_WORDS: readonly (readonly [RegExp, string])[] = [
  [/\butilis[ez]e?\b/gi, 'use'],
  [/\butilizing\b/gi, 'using'],
  [/\bapproximately\b/gi, 'about'],
  [/\bindividuals\b/gi, 'people'],
  [/\ban individual\b/gi, 'a person'],
  [/\baccumulate\b/gi, 'build up'],
  [/\bdemonstrates?\b/gi, 'shows'],
  [/\bpurchasing\b/gi, 'buying'],
  [/\bpurchases\b/gi, 'buys'],
  [/\bpurchase\b/gi, 'buy'],
  [/\badditional\b/gi, 'more'],
  [/\bprior to\b/gi, 'before'],
  [/\bsubsequent to\b/gi, 'after'],
  [/\bin order to\b/gi, 'to'],
  [/\bwith regard to\b/gi, 'about'],
  [/\bin the event that\b/gi, 'if'],
  [/\bdue to the fact that\b/gi, 'because'],
  [/\bfor the purpose of\b/gi, 'for'],
  [/\bat this point in time\b/gi, 'now'],
  [/\bon a regular basis\b/gi, 'regularly'],
  [/\brequires? that you\b/gi, 'means you'],
  [/\bis able to\b/gi, 'can'],
  [/\bare able to\b/gi, 'can'],
  [/\bhas the ability to\b/gi, 'can'],
  [/\bcommence\b/gi, 'start'],
  [/\bterminate\b/gi, 'end'],
  [/\battempt to\b/gi, 'try to'],
  [/\bobtain\b/gi, 'get'],
  [/\bsufficient\b/gi, 'enough'],
  [/\bnumerous\b/gi, 'many'],
  [/\bmajority of\b/gi, 'most of'],
  [/\bportion of\b/gi, 'part of'],
  [/\bper annum\b/gi, 'a year'],
  [/\bannually\b/gi, 'a year'],
];

/**
 * Trailing clauses that explain rather than claim, and are safe to drop.
 *
 * Every one of these is NON-RESTRICTIVE: it is set off by a comma and adds commentary to a sentence
 * that is already complete without it. Dropping one shortens the claim; it cannot contradict it.
 */
const TAIL_CLAUSE = /,\s+(which|because|since|so that|so|while|whereas|although|though|meaning|allowing|resulting in|leading to|designed to|intended to|meant to|tracking|covering|showing|reflecting|including|representing|the human equivalent of|the equivalent of)\b[^.!?]*[.!?]?$/i;

/**
 * A colon that introduces a list or an expansion, where the part BEFORE it is already a full claim.
 * "A stock is partial ownership in a company: you own a tiny piece" keeps the half that teaches.
 */
const COLON_EXPANSION = /:\s+[^.!?]*[.!?]?$/;

/**
 * A reduction left hanging on a coordinator, with the other half of the pair removed.
 *
 * "by selling assets that have grown and buying those that have shrunk" describes a two-sided
 * action. An early version of this module trimmed it at a word boundary and produced "by selling",
 * which is not a shorter version of the definition, it is a different and false one.
 *
 * NARROWED DELIBERATELY. The first version of this guard rejected any reduction CONTAINING a
 * trailing "and", which threw out "spreading your money across different assets, sectors, and
 * countries" -- a sentence whose list is complete and whose coordination was never cut. Only a
 * DANGLING coordinator indicates a severed pair, and since every reduction below is the removal of
 * a clause that begins with a subordinator rather than a coordinator, this is the whole risk.
 */
const DANGLING_COORDINATOR = /\b(and|or|plus|but|nor|as well as|along with)[\s,]*[.!?]?$/i;

/**
 * A result or reason clause with no comma in front of it.
 *
 * "...across different assets, sectors, and countries so one failure cannot sink you" is a complete
 * definition followed by its consequence. TAIL_CLAUSE only sees comma-delimited tails, so this
 * catches the rest. The caller requires what remains to still read as a claim before using it.
 */
const BARE_RESULT_CLAUSE = /\s+\b(so that|so|because|which means|meaning)\b[^.!?]*[.!?]?$/i;

/**
 * A parenthetical or bracketed aside. Never the main claim.
 *
 * An aside starts after a space (or at the start). A bracket glued to the word before it is part
 * of that word: "401(k)", "506(c)", "3(c)(7)". Matching those too made 10 card strings in 8 decks
 * show a bare "401" (measured 2026-09-22 through the wrapped loader), e.g. investing-fundamentals
 * L10 s2's idea card "A 401 is a workplace retirement account." deck-derive-polish-pin check 5.
 */
const ASIDE = /(?:^|\s+)[([][^)\]]*[)\]]/g;

/**
 * Openers that point at a sentence which will not be on the card.
 *
 * "The same in bonds at 5% becomes $26,533" is true and useless once the sentence it refers back to
 * has been cut. Candidates starting this way are pushed to the bottom rather than banned, because
 * in a one-sentence source there may be nothing else to show.
 */
const DANGLING_REFERENCE = /^(this|that|these|those|it|they|them|he|she|such|both|either|neither|here|there|the (same|former|latter|first|second|third|last|next|other|remaining))\b/i;

/**
 * Mid-sentence words that only mean something next to a sentence that is not on the card.
 * "The last decade ALONE added $278,000" is a comparison to a figure the card never shows.
 */
const COMPARATIVE_ORPHAN = /\b(alone|instead|by contrast|the difference|that same|the other)\b/i;

/** Roughly, does this read as a definition or a headline claim rather than an aside? */
const CLAIM_SHAPE = /\b(is|are|means|refers to|works by|happens when|describes|measures|represents|lets you|means that)\b/i;

function tidy(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/^[,;:\s]+/, '')
    /*
     * Drop punctuation left dangling by a clause removal, BEFORE anything re-terminates the
     * sentence. Stripping ", leaving zero unallocated" off a definition leaves a trailing comma,
     * and the sentence terminator is then appended straight onto it: "assigned a specific
     * purpose,." That reached a real card in personal-finance lesson 2.
     */
    .replace(/[,;:]+(\s*[.!?])?\s*$/, (_m, end) => (end ? end.trim() : ''))
    .trim();
}

/** Remove a leading discourse marker, then re-capitalise whatever is now first. */
function stripOpener(text: string): string {
  let out = text;
  for (const opener of DISCOURSE_OPENERS) {
    const re = new RegExp(`^${opener}\\b[,:]?\\s*`, 'i');
    if (re.test(out)) {
      out = out.replace(re, '');
      break;
    }
  }
  return out;
}

function stripFiller(text: string): string {
  let out = text;
  for (const word of FILLER) {
    const guard = NEVER_BEFORE[word];
    /*
     * The lookahead swallows the space ITSELF and sits immediately after the word.
     *
     * Putting it after `\\s*` looks equivalent and is not: `\\s*` backtracks to zero width to make
     * the lookahead succeed, so `rather\\s*(?!than)` happily matched "rather" in "rather than" by
     * consuming no space and testing against " than", which does not begin with "than". The guard
     * passed and the word was stripped anyway.
     */
    const pattern = guard ? `\\b${word}\\b(?!\\s*(?:${guard}))\\s*` : `\\b${word}\\b\\s*`;
    out = out.replace(new RegExp(pattern, 'gi'), '');
  }
  return out;
}

function plainer(text: string): string {
  let out = text;
  for (const [re, to] of PLAIN_WORDS) out = out.replace(re, to);
  return out;
}

function capitalise(text: string): string {
  if (!text) return text;
  return text[0].toUpperCase() + text.slice(1);
}

/** Everything short of dropping the tail clause. Safe to apply to any sentence. */
function surgery(sentence: string): string {
  return capitalise(tidy(plainer(stripFiller(stripOpener(tidy(sentence.replace(ASIDE, '')))))));
}

/** Split prose into sentences, dropping anything that is not a real one. */
export function sentences(text: string): string[] {
  const raw = String(text ?? '').split(SENTENCE_SPLIT).map((s) => s.trim()).filter(Boolean);
  // Re-join anything the splitter tore apart at an abbreviation rather than a sentence end.
  const joined: string[] = [];
  for (const piece of raw) {
    const prev = joined[joined.length - 1];
    if (prev && ABBREVIATION.test(prev)) joined[joined.length - 1] = `${prev} ${piece}`;
    else joined.push(piece);
  }
  return joined.filter((s) => s.length > 12);
}

/**
 * Cut `source` to at most `budget` characters, using only words the author wrote.
 *
 * Returns an empty string when there is nothing usable, which the caller treats as "this card does
 * not exist" rather than rendering an empty frame.
 */
export function compress(source: string | string[], budget: number, opts: CompressOpts = {}): string {
  const pool = Array.isArray(source) ? source.flatMap(sentences) : sentences(source);
  if (pool.length === 0) return '';

  const ceiling = budget * BUDGET_GRACE;
  const seen = (opts.avoid ?? []).filter(Boolean).map(head);
  const isRepeat = (t: string) => seen.length > 0 && seen.includes(head(t));

  /**
   * AUTHORED ORDER WINS. The corpus is written topic-sentence-first, so the opening sentence of a
   * paragraph is the claim and everything after it is elaboration, caveat or example.
   *
   * An earlier version of this scored every sentence on keyword overlap with the title and picked
   * the highest. That sounded smarter and read worse: on a slide titled "Stocks = Ownership, Bonds
   * = Loans" it scored "Predictable but limited: stocks are equity, bonds are fixed income" above
   * the actual definition, because the caveat happened to mention both title nouns. Position is the
   * stronger signal and it is one a reader can predict, so it is the only one used.
   */
  for (let i = 0; i < pool.length; i += 1) {
    const base = surgery(pool[i]);
    if (!base) continue;
    // A sentence that opens by pointing backwards is useless once its antecedent is cut, unless it
    // is all there is.
    if (DANGLING_REFERENCE.test(base) && i < pool.length - 1) continue;
    if (COMPARATIVE_ORPHAN.test(base) && i > 0) continue;

    const safe = safeReductions(base).filter(
      (v) => v.length >= 16 && !DANGLING_COORDINATOR.test(v) && !isRepeat(v),
    );
    if (safe.length === 0) continue;

    // Of the reductions that fit, keep the one that says the most.
    const fits = safe.filter((v) => v.length <= budget).sort((a, b) => b.length - a.length);
    if (fits.length > 0) return fits[0];

    // Nothing fits exactly. Run slightly long rather than print something untrue: the rejected
    // alternative was cutting mid-coordination, which turned "by selling assets that have grown
    // and buying those that have shrunk" into "by selling". A two-line card is a design
    // compromise. A card that states the opposite of the lesson is a defect.
    const withinGrace = safe.filter((v) => v.length <= ceiling).sort((a, b) => a.length - b.length);
    if (withinGrace.length > 0) return withinGrace[0];
  }

  /**
   * Every sentence was longer than the grace ceiling. `mustReturn` is set for vocabulary, where a
   * definition that is merely long beats no definition at all: dropping it would leave a term card
   * with a word and no meaning.
   */
  if (opts.mustReturn) {
    const first = surgery(pool[0]);
    if (first && !isRepeat(first)) return first;
  }
  return '';
}

export interface CompressOpts {
  /** Return the full opening sentence rather than nothing when no reduction fits. */
  mustReturn?: boolean;
  /**
   * Text already shown on an earlier card in the same deck.
   *
   * Without this a four-card deck happily shows its opening claim twice: the claim card and the
   * takeaway card both compress the same paragraph array and both pick sentence one. Comparison is
   * on a normalised prefix rather than equality, because the two cards run at different budgets and
   * so produce two different trims of the same sentence.
   */
  avoid?: string[];
}

/** Lowercased, punctuation-free opening of a string, for near-duplicate detection. */
function head(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9 ]/g, '').slice(0, 28);
}

/** How far past a budget a card may run rather than print something untrue. */
export const BUDGET_GRACE = 1.4;

/**
 * Every shortening of `sentence` that cannot change what it claims.
 *
 * Returned longest first. The full sentence is always included; the reductions are only ever
 * removals of non-restrictive material.
 */
function safeReductions(sentence: string): string[] {
  const out = [sentence];
  const withEnd = (t: string) => (/[.!?]$/.test(t) ? t : `${t}.`);

  /*
   * Strip trailing non-restrictive clauses REPEATEDLY, not once.
   *
   * Authors stack them. One definition in behavioral-finance lesson 9 runs "A written record of
   * every investment decision made before the outcome is known, tracking the reasoning, emotional
   * state, alternatives considered, and kill criteria, designed to separate decision quality from
   * outcomes and reveal systematic patterns" -- 248 characters carrying two droppable tails. A
   * single pass removed the purpose clause and still left 163. Cascading gets to the 78-character
   * definition the author actually led with, and every step of the cascade is a removal of
   * commentary from a sentence that was already complete without it.
   */
  let cursor = sentence;
  for (let pass = 0; pass < 4; pass += 1) {
    const stripped = capitalise(tidy(cursor.replace(TAIL_CLAUSE, '')));
    if (stripped === cursor || stripped.length <= 24) break;
    out.push(withEnd(stripped));
    cursor = stripped;
  }

  const noResult = capitalise(tidy(sentence.replace(BARE_RESULT_CLAUSE, '')));
  if (noResult.length > 40 && noResult !== sentence && CLAIM_SHAPE.test(noResult)) out.push(withEnd(noResult));

  // A colon expansion is only safe to drop when what precedes it stands alone as a claim.
  const beforeColon = capitalise(tidy(sentence.replace(COLON_EXPANSION, '')));
  if (beforeColon.length > 24 && beforeColon !== sentence && CLAIM_SHAPE.test(beforeColon)) {
    out.push(withEnd(beforeColon));
  }

  return out;
}


/**
 * How far past its budget a title may run before it is cut at all. A title wraps to a second line,
 * so the budget (one line at 393pt) is a preference, not a wall. 1.3x is the most two lines hold.
 */
export const TITLE_GRACE = 1.3;

/**
 * Words a title must never end on, because each one promises a word that is not there.
 *
 * The old cutter sliced at budget-1 and backed off to a space, and 105 headings on real cards ended
 * mid-phrase: "The Five Investment Accounts You Need to" (investing-fundamentals L10), "Pay Taxes
 * Now or Later? The" (personal-finance L16), "Capital Gains: The Tax on Your" (investing-
 * fundamentals L18). Pinned by scripts/title-cut-pin.mjs, which keeps its own copy of this list so
 * shortening this one cannot quietly make the pin pass.
 */
export const TITLE_STOPWORDS = [
  'to', 'of', 'the', 'a', 'an', 'and', 'or', 'your', 'in', 'for', 'with', 'on', 'at', 'by', 'how', 'what', 'is',
  /*
   * Past the list in the original report: with the cut moved out to 1.3x, the first run still
   * produced "Why Company Culture Drives Performance More Than" and "...Differ from Real-World P".
   */
  'than', 'from', 'into', 'as', 'but', 'vs', 'between', 'about', 'that', 'which', 'who', 'when',
  'where', 'why', 'are', 'its', 'their', 'our', 'this', 'these', 'those',
];
const TITLE_STOP = new Set(TITLE_STOPWORDS);

/**
 * Strip whatever a cut left hanging: a stopword, or a mark that promises more text (',' ':' ';'
 * '&' a dash), repeatedly, because "Revenue, Spending, and" needs two passes. An unclosed '(' is
 * cut back to before the bracket, since "Roth IRA (tax" is a half-open aside, not a title.
 */
function withoutDanglingEnd(text: string): string {
  let out = text.trim();
  const open = out.lastIndexOf('(');
  if (open > 0 && out.indexOf(')', open) === -1) out = out.slice(0, open).trim();
  for (let guard = 0; guard < 12; guard += 1) {
    const before = out;
    out = out.replace(/[\s,:;&\-–(]+$/, '');
    const lastSpace = out.lastIndexOf(' ');
    const last = out.slice(lastSpace + 1).toLowerCase().replace(/[^a-z']/g, '');
    // A one-letter word at a cut is the stub of a longer phrase ("Real-World P"), never a word.
    if (lastSpace > 0 && (TITLE_STOP.has(last) || /^[a-z]$/i.test(out.slice(lastSpace + 1)))) {
      out = out.slice(0, lastSpace);
    }
    if (out === before) break;
  }
  return out;
}

/**
 * A card title from an authored title.
 *
 * Titles are already short. The main work is dropping the section prefixes the web uses for
 * hierarchy ("Part 2: ", "Step 3 - ") which mean nothing on a card that shows its own position.
 *
 * WHEN ONE IS TOO LONG, in this order, each step only if the one before did not fit:
 *   1. drop a subtitle after ':' or '?' when the head alone still says something (12+ chars):
 *      "Pay Taxes Now or Later? The Roth vs. Traditional Choice" becomes "Pay Taxes Now or Later?";
 *      a subtitle carrying a number is kept instead when the whole title fits TITLE_GRACE;
 *   2. keep it whole up to TITLE_GRACE x budget, because a title can wrap to two lines;
 *   3. past that, keep a whole first sentence when one ends inside the ceiling;
 *   4. only then cut at a word, and keep backing off until it does not end on a TITLE_STOPWORDS
 *      word, a dangling mark or a number cut from its unit. Never returns "... You Need to".
 */
export function compressTitle(title: string, budget: number): string {
  let out = tidy(String(title ?? ''))
    .replace(/^(part|step|section|lesson|module|chapter)\s*\d+\s*[:.\-–]\s*/i, '')
    /*
     * A section number is one or two digits followed by a mark and a space ("2: ", "3) ", "4 - ").
     * The old pattern (any run of digits, then any mark, spaces optional) also ate "30-" off
     * "30-year annualized returns" (rendered "Year annualized returns") and the year off
     * "2008: Stocks vs. Bonds", dropping the number the chart is about.
     */
    .replace(/^\d{1,2}\s*(?:[:.)]|\s[-–])\s+/, '');
  out = plainer(out);
  if (out.length <= budget) return capitalise(out);

  const ceiling = Math.floor(budget * TITLE_GRACE);
  const subtitle = out.match(/^(.{12,}?)(?::|(\?))\s+(\S.*)$/);
  /*
   * A subtitle that carries a number stays when the whole title fits the grace: dropping it turned
   * the chart title "Income Statement Waterfall: Apple Q4 2022 ($B)" into "Income Statement
   * Waterfall", losing the company, the year and the unit the bars are in.
   */
  if (subtitle && !(/\d/.test(subtitle[3]) && out.length <= ceiling)) {
    const head = withoutDanglingEnd(subtitle[1]) + (subtitle[2] ?? '');
    if (head.length >= 12) out = head;
    if (out.length <= budget) return capitalise(out);
  }

  if (out.length <= ceiling) return capitalise(out);

  /*
   * A whole first sentence beats a word cut: "Debt is cheap but dangerous. Equity is safe but
   * expensive." word-cut to "... Equity is safe", a claim the lesson does not make. "vs." and
   * one-letter initials ("U.S.") are not sentence ends.
   */
  const sentenceEnd = [...out.slice(0, ceiling + 1).matchAll(/(?<!\bvs|\b[A-Za-z])[.!?](?=\s+[A-Z])/g)]
    .map((m) => (m.index ?? 0) + 1)
    .filter((i) => i >= 12)
    .pop();
  if (sentenceEnd) return capitalise(out.slice(0, sentenceEnd));

  const cut = out.slice(0, ceiling + 1);
  const atWord = cut.lastIndexOf(' ');
  let trimmed = withoutDanglingEnd(atWord > 12 ? cut.slice(0, atWord) : cut.slice(0, ceiling));
  /*
   * A cut must not end on a number whose scale was cut away: "...and the $3.5 Trillion Problem"
   * word-cut to "...and the $3.5", a trillionth of the figure the author wrote.
   */
  for (let guard = 0; guard < 4 && /\d\S*$/.test(trimmed); guard += 1) {
    const space = trimmed.lastIndexOf(' ');
    if (space <= 12) break;
    trimmed = withoutDanglingEnd(trimmed.slice(0, space));
  }
  return capitalise(trimmed || out.slice(0, ceiling).trim());
}
