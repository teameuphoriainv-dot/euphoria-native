/**
 * The archetype vocabulary: the fixed set of ideas the mobile art can depict.
 *
 * WHY A FIXED LIST. The art and the code that chooses the art are written separately, so they need
 * a contract. Without one, a deriver asks for `compoundGrowth` while the kit exports `compound` and
 * the card renders nothing, which is exactly the class of silent blank screen this repo keeps
 * auditing for. These ids ARE the contract. `scripts/mobile-pixel-kit-pin.mjs` asserts the kit
 * exports one sprite per id, and `scripts/mobile-deck-audit.mjs` asserts every scene a deck asks
 * for is on this list.
 *
 * WHY THESE TWENTY FOUR. They are the ideas the 300-lesson corpus actually keeps teaching, taken
 * from the step titles and diagram labels rather than invented. Each one recurs across many
 * lessons, which is the point: one piece of art, recoloured and stamped with a small overlay,
 * serves a dozen lessons and still reads as drawn for each of them.
 */

export const ARCHETYPES = [
  /** Something getting larger over time. The single most common shape in the corpus. */
  'growth',
  /** Returns earning returns. Growth that accelerates rather than adding. */
  'compound',
  /** Two things weighed against each other. Risk against reward, now against later. */
  'tradeoff',
  /** One whole divided into named parts. Budgets, allocations, ownership. */
  'split',
  /** Value escaping slowly. Inflation, fees, lifestyle creep. */
  'leak',
  /** Cover against a bad outcome. Insurance, emergency funds, hedges. */
  'shield',
  /** Something that comes around again. Market cycles, pay cycles, business cycles. */
  'cycle',
  /** The distance between two quantities. Wage gaps, spreads, shortfalls. */
  'gap',
  /** A line being crossed, where behaviour changes on the other side. Brackets, limits, margin. */
  'threshold',
  /** Ordered steps, one after another. Processes, waterfalls, priority orders. */
  'sequence',
  /** Many small holdings instead of one. Diversification. */
  'spread',
  /** Everything resting on one thing. Concentration risk, single points of failure. */
  'concentrate',
  /** An obligation owed. Loans, leverage, liabilities. */
  'debt',
  /** Money arriving. Wages, dividends, rent, coupons. */
  'income',
  /** A decision with two outcomes. Choices, branches, scenarios. */
  'fork',
  /** Value moving up and down sharply. Volatility, drawdowns. */
  'swing',
  /** Waiting, and being rewarded for it. Time in the market, holding periods. */
  'patience',
  /** A small recurring cost eating a large total. Expense ratios, commissions, spreads. */
  'fee',
  /** Many people acting at once. Markets, sentiment, herd behaviour. */
  'crowd',
  /** Relative size. Comparing magnitudes that are hard to picture. */
  'scale',
  /** A fixed reference everything is measured against. Benchmarks, cost basis, anchoring bias. */
  'anchor',
  /** How easily a thing turns into cash. */
  'liquidity',
  /** A goal, and progress toward it. Retirement numbers, savings targets. */
  'target',
  /** A rule or constraint that holds. Policy, regulation, contracts, tax law. */
  'rulebook',
] as const;

export type Archetype = (typeof ARCHETYPES)[number];

const ARCHETYPE_SET: ReadonlySet<string> = new Set(ARCHETYPES);

export function isArchetype(id: string): id is Archetype {
  return ARCHETYPE_SET.has(id);
}

/**
 * Words that pick an archetype, most specific first.
 *
 * ORDER MATTERS and the list is walked top to bottom. "compound" must be tested before "growth"
 * because every compounding lesson also says growth, and the more specific picture is the better
 * one. Matching is on whole words against the lowercased title plus diagram label.
 *
 * This is deliberately a lookup table rather than anything cleverer. A table can be read, argued
 * with, and corrected by whoever notices a lesson wearing the wrong picture. It also cannot
 * surprise anyone at runtime, which a similarity score would.
 */
const KEYWORDS: readonly (readonly [Archetype, readonly string[]])[] = [
  ['compound', ['compound', 'compounding', 'exponential', 'snowball', 'reinvest', 'accrue']],
  ['fee', ['fee', 'fees', 'expense ratio', 'commission', 'cost basis drag', 'load', 'spread cost']],
  ['leak', ['inflation', 'erode', 'erosion', 'creep', 'purchasing power', 'shrink', 'decay']],
  /*
   * 'cover' was removed: it matched "covers your needs", "coverage of the index" and any sentence
   * about one number covering another, and put an insurance shield on a budgeting lesson titled
   * "The 50/30/20 Rule". Whole words that mean the concept, never words that merely appear near it.
   */
  ['shield', ['insurance', 'insured', 'emergency fund', 'hedge', 'hedging', 'safety net', 'protects you', 'protection against']],
  ['debt', ['debt', 'loan', 'credit', 'mortgage', 'leverage', 'liability', 'borrow', 'interest owed']],
  ['income', ['income', 'salary', 'wage', 'paycheck', 'dividend', 'coupon', 'rent ', 'earnings', 'revenue', 'cash in', 'payout']],
  ['split', ['allocation', 'allocate', 'budget', 'split', 'portion', 'proportion', 'breakdown', 'share of']],
  ['spread', ['diversif', 'spread across', 'uncorrelated', 'basket', 'variety']],
  ['concentrate', ['concentration', 'single point', 'all in one', 'overweight', 'undiversified']],
  ['tradeoff', ['tradeoff', 'trade off', 'versus', ' vs', 'balance', 'compromise', 'risk and return']],
  ['swing', ['volatility', 'volatile', 'drawdown', 'swing', 'fluctuat', 'crash', 'correction', 'bear']],
  ['cycle', ['cycle', 'cyclical', 'recession', 'expansion', 'recurring', 'seasonal', 'rotation']],
  ['gap', ['gap', 'shortfall', 'deficit', 'surplus', 'difference between', 'wage gap', 'spread between']],
  ['threshold', ['threshold', 'bracket', 'limit', 'cap', 'margin call', 'minimum', 'cutoff', 'breakeven']],
  ['sequence', ['steps', 'order of', 'waterfall', 'process', 'first then', 'stages', 'pipeline']],
  ['fork', ['decision', 'choose', 'choice', 'scenario', 'branch', 'either', 'option to']],
  ['patience', ['time in the market', 'long term', 'holding period', 'patience', 'horizon', 'decades']],
  ['crowd', ['market sentiment', 'herd', 'crowd', 'panic', 'euphoria', 'bubble', 'everyone']],
  ['anchor', ['benchmark', 'anchor', 'baseline', 'reference', 'index tracking', 'par value']],
  ['liquidity', ['liquid', 'liquidity', 'cash flow', 'illiquid', 'redemption']],
  ['target', ['goal', 'target', 'retirement number', 'milestone', 'objective', 'aim for']],
  ['rulebook', ['tax', 'regulation', 'rule', 'law', 'compliance', 'contract', 'policy', 'requirement']],
  ['scale', ['scale', 'magnitude', 'compare size', 'how big', 'billion', 'trillion', 'market cap', 'size of']],
  ['tradeoff', ['return', 'reward', 'upside', 'downside']],
  ['target', ['gain', 'achieve', 'reach']],
  ['growth', ['growth', 'grow', 'increase', 'rise', 'appreciation', 'compounded over', 'over time']],
];

/**
 * Pick the archetype that fits some lesson text.
 *
 * Falls back to `growth` because it is the most broadly true picture in a finance corpus and
 * because a card MUST have art: returning nothing would leave the layout with a hole. The fallback
 * rate is reported by `scripts/mobile-deck-audit.mjs`, so a corpus drifting away from this table
 * shows up as a number rather than as quietly identical artwork everywhere.
 */
export function pickArchetype(...text: (string | undefined)[]): Archetype {
  /*
   * EACH SOURCE IN TURN, most authoritative first. Not all of them joined together.
   *
   * Callers pass the title first and supporting text after it. Joining them let a word buried in
   * the supporting text outrank the subject of the card: the 50/30/20 diagram lists insurance as an
   * example of a need, so a budgeting card about splitting a paycheck came out wearing the
   * insurance shield. A title is what a card is ABOUT; a description merely mentions things.
   *
   * So the title gets a whole pass of its own, and only if nothing in it matches does the next
   * source get a look.
   */
  const sources = text.filter((t): t is string => Boolean(t && t.trim()));
  for (const source of sources) {
    const hay = source.toLowerCase();
    for (const [archetype, words] of KEYWORDS) {
      for (const w of words) if (hay.includes(w)) return archetype;
    }
  }
  return 'growth';
}

/** True when `pickArchetype` found nothing and fell back. Used by the audit, not by the app. */
export function archetypeWasFallback(...text: (string | undefined)[]): boolean {
  const hay = text.filter(Boolean).join(' ').toLowerCase();
  for (const [, words] of KEYWORDS) {
    for (const w of words) if (hay.includes(w)) return false;
  }
  return true;
}
