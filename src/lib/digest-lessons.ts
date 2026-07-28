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

  // Personal Finance
  'first-paycheck-guide': { course: 'personal-finance', num: 1 },
  'budgeting-50-30-20-rule': { course: 'personal-finance', num: 2 },
  'emergency-fund-how-much': { course: 'personal-finance', num: 4 },
  'how-credit-scores-work': { course: 'personal-finance', num: 5 },
  'good-debt-vs-bad-debt': { course: 'personal-finance', num: 6 },
  'roth-ira-explained-for-beginners': { course: 'personal-finance', num: 16 },

  // Global Economics
  'inflation-explained': { course: 'global-economics', num: 5 },
};

export const lessonForGuide = (slug: string): GuideLesson | undefined => GUIDE_LESSONS[slug];
