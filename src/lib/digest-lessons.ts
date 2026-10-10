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
  'what-is-a-401k-and-employer-match': { course: 'investing-fundamentals', num: 10 },
  'how-to-read-a-stock-quote': { course: 'investing-fundamentals', num: 11 },
  'bull-and-bear-markets-explained': { course: 'investing-fundamentals', num: 16 },
  'capital-gains-tax-basics': { course: 'investing-fundamentals', num: 18 },
  'market-crashes-what-history-teaches': { course: 'investing-fundamentals', num: 23 },
  'investment-fees-explained': { course: 'investing-fundamentals', num: 20 },
  'target-date-funds-explained': { course: 'investing-fundamentals', num: 7 },
  'what-moves-a-stock-price': { course: 'investing-fundamentals', num: 22 },
  'how-earnings-season-works': { course: 'investing-fundamentals', num: 22 },
  'how-to-open-your-first-brokerage-account': { course: 'investing-fundamentals', num: 10 },
  'mutual-funds-vs-etfs': { course: 'investing-fundamentals', num: 7 },
  'what-are-dividends': { course: 'investing-fundamentals', num: 13 },
  'the-behavior-gap': { course: 'investing-fundamentals', num: 19 },
  'time-horizon-and-asset-allocation': { course: 'investing-fundamentals', num: 9 },
  'apr-vs-apy-explained': { course: 'investing-fundamentals', num: 3 },
  'what-is-market-cap': { course: 'investing-fundamentals', num: 1 },
  'why-bond-yields-matter': { course: 'investing-fundamentals', num: 4 },

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
  'traditional-vs-roth-explained': { course: 'personal-finance', num: 16 },
  'bank-fees-and-how-to-avoid-them': { course: 'personal-finance', num: 9 },
  'checking-vs-savings-accounts': { course: 'personal-finance', num: 9 },
  'high-yield-savings-accounts-explained': { course: 'personal-finance', num: 9 },
  'credit-utilization-explained': { course: 'personal-finance', num: 5 },
  'how-to-build-credit-at-18': { course: 'personal-finance', num: 5 },
  'how-to-read-your-credit-report': { course: 'personal-finance', num: 5 },
  'car-loans-and-why-the-term-matters': { course: 'personal-finance', num: 6 },
  'how-income-tax-actually-works': { course: 'personal-finance', num: 7 },
  'how-to-read-a-pay-stub': { course: 'personal-finance', num: 7 },
  'sinking-funds-explained': { course: 'personal-finance', num: 2 },
  'why-your-subscriptions-keep-getting-more-expensive': { course: 'personal-finance', num: 3 },
  'student-loan-repayment-explained': { course: 'personal-finance', num: 13 },
  'the-student-loan-machine': { course: 'personal-finance', num: 13 },
  'why-college-tuition-costs-what-it-does': { course: 'personal-finance', num: 13 },
  'why-a-starter-home-costs-so-much': { course: 'personal-finance', num: 14 },
  'w2-vs-1099-explained': { course: 'personal-finance', num: 17 },
  'what-a-1099-job-really-pays': { course: 'personal-finance', num: 17 },

  // Global Economics
  'inflation-explained': { course: 'global-economics', num: 5 },
  'what-the-federal-reserve-actually-does': { course: 'global-economics', num: 3 },
  // both are demand meeting a supply that cannot grow fast enough, which is lesson 2's whole idea
  'ai-data-centers-and-your-power-bill': { course: 'global-economics', num: 2 },
  'the-used-car-price-shock': { course: 'global-economics', num: 2 },

  // Corporate Finance
  'what-is-an-ipo': { course: 'corporate-finance', num: 14 },

  // Alternative Investments
  'inside-the-sneaker-resale-market': { course: 'alternative-investments', num: 7 },

  /*
   * APP-ONLY guides (`appOnly: true` in the web repo; they lived in content/posts-app/ until
   * 2026-09-28). They exist in the app and not on the web site. Each targets a lesson that an
   * existing entry already points at, so the course/num pairs are known-good.
   */
  'carrying-a-balance-myth': { course: 'personal-finance', num: 5 },
  'the-cost-of-waiting-five-years': { course: 'investing-fundamentals', num: 3 },
  'the-month-maya-did-nothing': { course: 'investing-fundamentals', num: 23 },
  'avalanche-vs-snowball': { course: 'personal-finance', num: 6 },
  'picking-stocks-myth': { course: 'investing-fundamentals', num: 5 },
  'the-ten-best-days': { course: 'investing-fundamentals', num: 16 },
  'buy-now-pay-later': { course: 'personal-finance', num: 6 },
  'the-money-order-of-operations': { course: 'personal-finance', num: 4 },
  'lump-sum-vs-dca': { course: 'investing-fundamentals', num: 8 },
};

/**
 * Guides with DELIBERATELY no lesson, each with the reason. The reader's closing CTA then reads
 * "Keep learning" and opens the pathway (see digest/[slug].tsx), which is the honest answer for a
 * post with no concept to practise. check-digest-lessons.mjs accepts a post listed here and
 * fails any other post with no mapping, so "no lesson" is a decision, never an omission.
 */
export const NO_LESSON: Record<string, string> = {
  'introducing-euphoria-mobile': 'A product announcement. There is no money concept in it to practise.',
};

export const lessonForGuide = (slug: string): GuideLesson | undefined => GUIDE_LESSONS[slug];
