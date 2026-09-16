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
 * and the median `teachingSlide` is 1,636. A deck of four cards at the budgets in `types.ts` comes
 * to roughly 220 characters, so this is about a 92% cut. That number is asserted corpus-wide by
 * `scripts/mobile-card-budget-pin.mjs` rather than trusted.
 *
 * THE ORDER OF OPERATIONS matters and is deliberate:
 *   1. split the source into sentences
 *   2. try each sentence in authored order, because authors put the claim first
 *   3. on each one, apply surgery: asides, hedges, discourse markers, register swaps, tails
 *   4. take the first result that fits the budget
 *   5. if none fits, take the shortest surgical result and trim it at a clause boundary
 * Step 5 is the only lossy path and `worstCase()` reports how often it fires.
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

/** A parenthetical or bracketed aside. Never the main claim. */
const ASIDE = /\s*[([][^)\]]*[)\]]/g;

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

let worstCaseCount = 0;
/** How many times compression had to fall back to a clause trim. Read by the budget pin. */
export function worstCase(): number {
  return worstCaseCount;
}
export function resetWorstCase(): void {
  worstCaseCount = 0;
}

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
    if (withinGrace.length > 0) {
      worstCaseCount += 1;
      return withinGrace[0];
    }
  }

  /**
   * Every sentence was longer than the grace ceiling. `mustReturn` is set for vocabulary, where a
   * definition that is merely long beats no definition at all: dropping it would leave a term card
   * with a word and no meaning.
   */
  if (opts.mustReturn) {
    const first = surgery(pool[0]);
    if (first && !isRepeat(first)) {
      worstCaseCount += 1;
      return first;
    }
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
 * A card title from an authored title.
 *
 * Titles are already short. The work here is dropping the section prefixes the web uses for
 * hierarchy ("Part 2: ", "Step 3 - ") which mean nothing on a card that shows its own position.
 */
export function compressTitle(title: string, budget: number): string {
  let out = tidy(String(title ?? ''))
    .replace(/^(part|step|section|lesson|module|chapter)\s*\d+\s*[:.\-–]\s*/i, '')
    .replace(/^\d+\s*[:.)\-–]\s*/, '');
  out = plainer(out);
  if (out.length <= budget) return capitalise(out);
  const cut = out.slice(0, budget - 1);
  const atWord = cut.lastIndexOf(' ');
  return capitalise(atWord > 12 ? cut.slice(0, atWord) : cut);
}
