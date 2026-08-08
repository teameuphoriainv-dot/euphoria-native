/**
 * Which lesson a Digest guide sends you to.
 *
 * The reader's closing CTA used to be a bare `router.push('/lesson')` for all 20 guides, so
 * "Practice this in a lesson" meant the same lesson whether you had just read about compound
 * interest or about credit scores.
 *
 * Hand-written and NOT synced. The web repo owns Digest prose and artwork, but it has no notion
 * of the native curriculum's course ids, so the join between the two lives here. Both sides of
 * it are generated elsewhere: slugs come from digest-content.ts, and `course`/`num` must match a
 * real lesson in src/lib/curriculum/courses/**. Run ./scripts/check-digest-lessons.mjs after either
 * sync: it fails loudly if a lesson moved out from under an entry. That failure is otherwise
 * silent, since a dead mapping just opens the wrong lesson.
 */
export type GuideLesson = { course: string; num: number };

export const GUIDE_LESSONS: Record<string, GuideLesson> = {
  // Investing Fundamentals
  'how-the-stock-market-works': { course: 'investing-fundamentals', num: 1 },
  'what-is-risk-tolerance': { course: 'investing-fundamentals', num: 2 },
  'what-is-compound-interest': { course: 'investing-fundamentals', num: 3 },
  'stocks-vs-bonds-explained': { course: 'investing-fundamentals', num: 4 },
  'what-is-diversification': { course: 'investing-fundamentals', num: 5 },
  'what-is-an-etf': { course: 'investing-fundamentals', num: 6 },
  'dollar-cost-averaging-explained': { course: 'investing-fundamentals', num: 8 },
  'build-your-first-investment-portfolio': { course: 'investing-fundamentals', num: 9 },
  'employer-401k-match': { course: 'investing-fundamentals', num: 10 },
  'how-to-read-a-stock-quote': { course: 'investing-fundamentals', num: 11 },
  'bull-vs-bear-markets': { course: 'investing-fundamentals', num: 16 },
  'capital-gains-tax-basics': { course: 'investing-fundamentals', num: 18 },
  'market-crashes-what-history-teaches': { course: 'investing-fundamentals', num: 23 },
  'investment-fees-explained': { course: 'investing-fundamentals', num: 20 },
  'target-date-funds-explained': { course: 'investing-fundamentals', num: 7 },
  'what-moves-a-stock-price': { course: 'investing-fundamentals', num: 22 },

  // Personal Finance
  'first-paycheck-guide': { course: 'personal-finance', num: 1 },
  'budgeting-50-30-20-rule': { course: 'personal-finance', num: 2 },
  'emergency-fund-how-much': { course: 'personal-finance', num: 4 },
  'how-credit-scores-work': { course: 'personal-finance', num: 5 },
  'good-debt-vs-bad-debt': { course: 'personal-finance', num: 6 },
  'roth-ira-explained-for-beginners': { course: 'personal-finance', num: 16 },
  'how-tax-brackets-work': { course: 'personal-finance', num: 7 },
  // deliberately shares lesson 6 with good-debt-vs-bad-debt: both guides land on carrying a
  // balance, and there is no closer lesson. A duplicate target is better than no target, which
  // falls back to the demo lesson.
  'how-credit-cards-work': { course: 'personal-finance', num: 6 },

  // Global Economics
  'inflation-explained': { course: 'global-economics', num: 5 },

  /*
   * APP-ONLY guides (web repo content/posts-app/). They exist in the app and not on the web
   * site, so these four mappings have no counterpart there. Each targets a lesson that an
   * existing entry already points at, so the course/num pairs are known-good.
   */
  'carrying-a-balance-myth': { course: 'personal-finance', num: 5 },
  'the-cost-of-waiting-five-years': { course: 'investing-fundamentals', num: 3 },
  'roth-vs-traditional': { course: 'personal-finance', num: 16 },
  'the-month-maya-did-nothing': { course: 'investing-fundamentals', num: 23 },
  'avalanche-vs-snowball': { course: 'personal-finance', num: 6 },
  'picking-stocks-myth': { course: 'investing-fundamentals', num: 5 },
  'the-ten-best-days': { course: 'investing-fundamentals', num: 16 },
  'buy-now-pay-later': { course: 'personal-finance', num: 6 },
  'the-money-order-of-operations': { course: 'personal-finance', num: 4 },
  'lump-sum-vs-dca': { course: 'investing-fundamentals', num: 8 },
};

export const lessonForGuide = (slug: string): GuideLesson | undefined => GUIDE_LESSONS[slug];
