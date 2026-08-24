/**
 * THE TERM BANK — 60 terms, five per course, tagged by the course they belong to and the
 * difficulty band that course sits in.
 *
 * WHY THIS FILE EXISTS AT ALL. term-match.tsx held five hardcoded pairs and picked them with
 * `shuffle(PAIRS)` under an empty dependency array, so every player on earth got the same five
 * forever. The curriculum looked like the fix — `highlightedTerms` carries real term/definition
 * pairs — but exactly ONE of the twelve courses actually has any (corporateFinance, 40 terms) and
 * the other eleven have none. Drawing from them would have adapted for a single course and quietly
 * degraded to nothing everywhere else, and those files are auto-synced from the web repo so they
 * cannot be topped up from here. So the bank is iOS-owned, like digest-extra.ts and achievements.ts.
 *
 * DEFINITIONS ARE SHORT ON PURPOSE. These are read at a glance inside a matching grid, not studied.
 * Every one is written to be unambiguous against the other 59 — a matching game where two answers
 * both look right is a coin flip, which is the same defect Trend Master had to have designed out.
 *
 * `course` is the id from courseIndex.ts and `tier` is that course own tier, so what a learner is
 * asked is a function of what they have actually studied. See learner-phase.ts.
 */
import { tiersFor, type Phase } from './learner-phase';

export type Term = {
  id: string;
  term: string;
  def: string;
  /** Course id from courseIndex.ts. */
  course: string;
  tier: 'easy' | 'intermediate' | 'advanced';
};

export const TERM_BANK: Term[] = [
  // investing-fundamentals (easy)
  { id: 'bull', term: 'Bull market', def: 'A long stretch of rising prices', course: 'investing-fundamentals', tier: 'easy' },
  { id: 'bear', term: 'Bear market', def: 'A fall of 20% or more', course: 'investing-fundamentals', tier: 'easy' },
  { id: 'div', term: 'Dividend', def: 'A share of profits paid to owners', course: 'investing-fundamentals', tier: 'easy' },
  { id: 'diver', term: 'Diversification', def: 'Spreading money so one loss cannot sink you', course: 'investing-fundamentals', tier: 'easy' },
  { id: 'index', term: 'Index fund', def: 'A basket that tracks a whole market at once', course: 'investing-fundamentals', tier: 'easy' },
  // personal-finance (easy)
  { id: 'budget', term: 'Budget', def: 'A plan for your money before you spend it', course: 'personal-finance', tier: 'easy' },
  { id: 'efund', term: 'Emergency fund', def: 'Cash set aside for the unexpected', course: 'personal-finance', tier: 'easy' },
  { id: 'score', term: 'Credit score', def: 'A number lenders use to price your risk', course: 'personal-finance', tier: 'easy' },
  { id: 'apr', term: 'APR', def: 'The yearly cost of borrowing, fees included', course: 'personal-finance', tier: 'easy' },
  { id: 'networth', term: 'Net worth', def: 'What you own minus what you owe', course: 'personal-finance', tier: 'easy' },
  // global-economics (easy)
  { id: 'infl', term: 'Inflation', def: 'When money buys less than it used to', course: 'global-economics', tier: 'easy' },
  { id: 'rec', term: 'Recession', def: 'A stretch where the economy shrinks', course: 'global-economics', tier: 'easy' },
  { id: 'gdp', term: 'GDP', def: 'The value of everything a country produces', course: 'global-economics', tier: 'easy' },
  { id: 'tariff', term: 'Tariff', def: 'A tax on goods arriving from abroad', course: 'global-economics', tier: 'easy' },
  { id: 'supply', term: 'Supply and demand', def: 'How scarcity and want settle a price', course: 'global-economics', tier: 'easy' },
  // corporate-finance (intermediate)
  { id: 'equity', term: 'Equity', def: 'Ownership in a company', course: 'corporate-finance', tier: 'intermediate' },
  { id: 'lev', term: 'Leverage', def: 'Using borrowed money to enlarge a return', course: 'corporate-finance', tier: 'intermediate' },
  { id: 'ipo', term: 'IPO', def: 'The first sale of shares to the public', course: 'corporate-finance', tier: 'intermediate' },
  { id: 'ebitda', term: 'EBITDA', def: 'Profit before interest, tax and write-downs', course: 'corporate-finance', tier: 'intermediate' },
  { id: 'wcap', term: 'Working capital', def: 'Short-term assets minus short-term bills', course: 'corporate-finance', tier: 'intermediate' },
  // business-strategy (intermediate)
  { id: 'moat', term: 'Moat', def: 'A durable edge rivals cannot copy', course: 'business-strategy', tier: 'intermediate' },
  { id: 'burn', term: 'Burn rate', def: 'How fast a company spends its cash', course: 'business-strategy', tier: 'intermediate' },
  { id: 'runway', term: 'Runway', def: 'How long the cash lasts at that burn', course: 'business-strategy', tier: 'intermediate' },
  { id: 'unit', term: 'Unit economics', def: 'Profit or loss on a single sale', course: 'business-strategy', tier: 'intermediate' },
  { id: 'churn', term: 'Churn', def: 'The share of customers who leave', course: 'business-strategy', tier: 'intermediate' },
  // financial-analytics (intermediate)
  { id: 'dcf', term: 'DCF', def: 'Valuing something by its future cash, discounted', course: 'financial-analytics', tier: 'intermediate' },
  { id: 'regr', term: 'Regression', def: 'Fitting a line to see how variables move together', course: 'financial-analytics', tier: 'intermediate' },
  { id: 'var2', term: 'Variance', def: 'How far results spread from the average', course: 'financial-analytics', tier: 'intermediate' },
  { id: 'corr', term: 'Correlation', def: 'How closely two things move together', course: 'financial-analytics', tier: 'intermediate' },
  { id: 'outl', term: 'Outlier', def: 'A point sitting far off the pattern', course: 'financial-analytics', tier: 'intermediate' },
  // behavioral-finance (intermediate)
  { id: 'lossav', term: 'Loss aversion', def: 'Losses hurting more than equal gains please', course: 'behavioral-finance', tier: 'intermediate' },
  { id: 'anchor', term: 'Anchoring', def: 'Leaning too hard on the first number you saw', course: 'behavioral-finance', tier: 'intermediate' },
  { id: 'herd', term: 'Herding', def: 'Following the crowd instead of the evidence', course: 'behavioral-finance', tier: 'intermediate' },
  { id: 'sunk', term: 'Sunk cost', def: 'Money already spent that should not sway you', course: 'behavioral-finance', tier: 'intermediate' },
  { id: 'confirm', term: 'Confirmation bias', def: 'Seeking only what agrees with you', course: 'behavioral-finance', tier: 'intermediate' },
  // applied-accounting (advanced)
  { id: 'accr', term: 'Accrual', def: 'Recording money when earned, not when paid', course: 'applied-accounting', tier: 'advanced' },
  { id: 'depr', term: 'Depreciation', def: 'Spreading an asset cost over its useful life', course: 'applied-accounting', tier: 'advanced' },
  { id: 'good', term: 'Goodwill', def: 'What a buyer pays above fair asset value', course: 'applied-accounting', tier: 'advanced' },
  { id: 'amort', term: 'Amortisation', def: 'Depreciation for things you cannot touch', course: 'applied-accounting', tier: 'advanced' },
  { id: 'defrev', term: 'Deferred revenue', def: 'Cash taken for work not yet done', course: 'applied-accounting', tier: 'advanced' },
  // quantitative-analysis (advanced)
  { id: 'alpha', term: 'Alpha', def: 'Return beyond what the market alone explains', course: 'quantitative-analysis', tier: 'advanced' },
  { id: 'beta', term: 'Beta', def: 'How hard a holding swings against the market', course: 'quantitative-analysis', tier: 'advanced' },
  { id: 'sharpe', term: 'Sharpe ratio', def: 'Return earned per unit of risk taken', course: 'quantitative-analysis', tier: 'advanced' },
  { id: 'mc', term: 'Monte Carlo', def: 'Testing an outcome across thousands of random runs', course: 'quantitative-analysis', tier: 'advanced' },
  { id: 'sd', term: 'Standard deviation', def: 'The usual distance from the average', course: 'quantitative-analysis', tier: 'advanced' },
  // risk-management (advanced)
  { id: 'hedge', term: 'Hedge', def: 'A position taken to offset another one loss', course: 'risk-management', tier: 'advanced' },
  { id: 'varisk', term: 'Value at Risk', def: 'The worst loss expected at a set confidence', course: 'risk-management', tier: 'advanced' },
  { id: 'cparty', term: 'Counterparty risk', def: 'The chance the other side cannot pay', course: 'risk-management', tier: 'advanced' },
  { id: 'sysr', term: 'Systemic risk', def: 'A failure that spreads through the whole system', course: 'risk-management', tier: 'advanced' },
  { id: 'stress', term: 'Stress test', def: 'Running a portfolio through a deliberate disaster', course: 'risk-management', tier: 'advanced' },
  // alternative-investments (advanced)
  { id: 'pe', term: 'Private equity', def: 'Buying companies that are not publicly traded', course: 'alternative-investments', tier: 'advanced' },
  { id: 'reit', term: 'REIT', def: 'A fund that owns income-producing property', course: 'alternative-investments', tier: 'advanced' },
  { id: 'illiq', term: 'Illiquidity', def: 'Not being able to sell quickly at a fair price', course: 'alternative-investments', tier: 'advanced' },
  { id: 'carry', term: 'Carried interest', def: 'The share of profits a fund manager keeps', course: 'alternative-investments', tier: 'advanced' },
  { id: 'vc', term: 'Venture capital', def: 'Money backing young companies in return for equity', course: 'alternative-investments', tier: 'advanced' },
  // wealth-management (advanced)
  { id: 'alloc', term: 'Asset allocation', def: 'How money is split across kinds of investment', course: 'wealth-management', tier: 'advanced' },
  { id: 'rebal', term: 'Rebalancing', def: 'Selling winners to restore your target mix', course: 'wealth-management', tier: 'advanced' },
  { id: 'tlh', term: 'Tax-loss harvesting', def: 'Selling at a loss to offset a taxable gain', course: 'wealth-management', tier: 'advanced' },
  { id: 'estate', term: 'Estate planning', def: 'Deciding who gets what, before it matters', course: 'wealth-management', tier: 'advanced' },
  { id: 'fid', term: 'Fiduciary', def: 'Someone legally bound to put you first', course: 'wealth-management', tier: 'advanced' },
];

if (__DEV__) {
  // A duplicate id would make two tiles indistinguishable to the matcher; a duplicate DEFINITION
  // would make the game unwinnable-by-reasoning, which is worse because it looks like a bug in the
  // player rather than in the data.
  const ids = new Set<string>();
  const defs = new Set<string>();
  for (const t of TERM_BANK) {
    if (ids.has(t.id)) console.error(`[term-bank] duplicate id "${t.id}"`);
    if (defs.has(t.def)) console.error(`[term-bank] duplicate definition "${t.def}"`);
    ids.add(t.id);
    defs.add(t.def);
    if (t.def.length > 52) console.error(`[term-bank] "${t.term}" definition is too long to read in a tile`);
  }
  if (TERM_BANK.length !== 60) console.error(`[term-bank] expected 60 terms, found ${String(TERM_BANK.length)}`);
  // Every tier must hold enough to fill the largest round on its own, or a fluent player restricted
  // to one band would silently get a short grid.
  for (const tier of ['easy', 'intermediate', 'advanced'] as const) {
    const n = TERM_BANK.filter((t) => t.tier === tier).length;
    if (n < 8) console.error(`[term-bank] tier "${tier}" has only ${String(n)} terms`);
  }
}

/**
 * The round a given learner should be handed.
 *
 * THREE RULES, in order, and the order is the whole design:
 *
 *   1. SIZE SCALES WITH PHASE. Four pairs when new, seven when fluent. A fixed grid means the game
 *      either bores the practised player or buries the new one; term-match shipped with five for
 *      everybody.
 *   2. COURSES YOU HAVE STARTED COME FIRST. Being asked about what you just studied is the point —
 *      this is the difference between a review game and a trivia game.
 *   3. THE REST FILLS FROM YOUR BAND, NEVER ABOVE IT. `tiersFor` caps a new learner at easy
 *      courses. Filling upward would hand someone on lesson two "carried interest", which does not
 *      read as a challenge, it reads as the game being unfair.
 *
 * `seed` is passed IN rather than read from Date.now() here, so this stays pure and a caller can
 * capture one seed per round — a shuffle that re-rolls mid-render would reshuffle the board while
 * the player is looking at it, which is the same purity trap quests.ts documents.
 */
export function roundFor(
  opts: { phase: Phase; started: string[]; seed: number },
): Term[] {
  const size = SIZE_BY_PHASE[opts.phase];
  const allowed = tiersFor(opts.phase);
  const pool = TERM_BANK.filter((t) => allowed.includes(t.tier));

  const started = new Set(opts.started);
  // Studied first, everything else after; shuffled WITHIN each group so the preference survives.
  const mine = shuffleSeeded(pool.filter((t) => started.has(t.course)), opts.seed);
  const rest = shuffleSeeded(pool.filter((t) => !started.has(t.course)), opts.seed + 1);

  return [...mine, ...rest].slice(0, size);
}

/** Four pairs to seven. See rule 1 above. */
export const SIZE_BY_PHASE: Record<Phase, number> = { new: 4, learning: 5, practised: 6, fluent: 7 };

/** Fisher-Yates over a seeded PRNG — deterministic for a seed, uniform, and no Math.random. */
export function shuffleSeeded<T>(arr: T[], seed: number): T[] {
  const out = [...arr];
  let x = seed || 1;
  for (let i = out.length - 1; i > 0; i--) {
    x = (x * 1664525 + 1013904223) >>> 0;
    const j = x % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

if (__DEV__) {
  const round = (phase: Phase, started: string[] = [], seed = 7) => roundFor({ phase, started, seed });

  for (const p of ['new', 'learning', 'practised', 'fluent'] as const) {
    const r = round(p);
    if (r.length !== SIZE_BY_PHASE[p]) console.error(`[term-bank] ${p} round is ${String(r.length)}, expected ${String(SIZE_BY_PHASE[p])}`);
    // The wall test: nothing above your band, ever.
    const allowed = tiersFor(p);
    if (r.some((t) => !allowed.includes(t.tier))) console.error(`[term-bank] ${p} was served a term above its band`);
    if (new Set(r.map((t) => t.id)).size !== r.length) console.error(`[term-bank] ${p} round contains a duplicate`);
  }

  // Preference must be REAL, not decorative: a fluent learner who has only touched wealth-management
  // must see its terms before any other course's.
  const pref = round('fluent', ['wealth-management']);
  const wm = TERM_BANK.filter((t) => t.course === 'wealth-management').length;
  if (pref.slice(0, wm).some((t) => t.course !== 'wealth-management')) {
    console.error('[term-bank] started-course preference did not come first');
  }

  // Same seed, same board — the property that keeps a re-render from reshuffling under the player.
  if (round('practised').map((t) => t.id).join() !== round('practised').map((t) => t.id).join()) {
    console.error('[term-bank] roundFor is not deterministic for a seed');
  }
  // Different seed, different board — otherwise every session of the game is identical.
  if (round('fluent', [], 1).map((t) => t.id).join() === round('fluent', [], 999).map((t) => t.id).join()) {
    console.error('[term-bank] two seeds produced the same board');
  }
}
