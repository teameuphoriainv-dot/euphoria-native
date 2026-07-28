/**
 * Euphoria Digest content — ported from euphoriaweb src/features/digest/content/posts.
 * Metadata + excerpts for the mobile Digest hub (full markdown bodies load in Phase 7's
 * article reader). Newest first.
 */
export type DigestCategory = 'Money basics' | 'Investing' | 'Credit' | 'Markets' | 'Strategy';

export type DigestPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: DigestCategory;
  date: string;
  readMinutes: number;
  /** Key into DIGEST_HEROES. Same illustration the web post uses, so a guide looks the
   *  same on both platforms. */
  hero: string;
};

/** EUPHORIA_ICONS name per category (illustration tier). */
export const CATEGORY_ICON: Record<DigestCategory, string> = {
  'Money basics': 'money-bag',
  Investing: 'trend-line',
  Credit: 'bank',
  Markets: 'bar-chart',
  Strategy: 'target',
};

export const DIGEST_POSTS: DigestPost[] = [
  { slug: 'first-paycheck-guide', hero: 'mobile-payments', title: 'What to Do With Your First Paycheck', excerpt: 'A simple order of operations for the money that hits your account — before it disappears.', category: 'Money basics', date: '2026-07-20', readMinutes: 5 },
  { slug: 'budgeting-50-30-20-rule', hero: 'wallet', title: 'The 50/30/20 Rule: A Simple Way to Budget', excerpt: 'Split every dollar into needs, wants, and future-you — no spreadsheet required.', category: 'Money basics', date: '2026-07-19', readMinutes: 5 },
  { slug: 'good-debt-vs-bad-debt', hero: 'credit-card', title: 'Good Debt vs Bad Debt', excerpt: 'Not all borrowing is equal. How to tell the debt that builds you from the debt that drains you.', category: 'Credit', date: '2026-07-19', readMinutes: 5 },
  { slug: 'how-the-stock-market-works', hero: 'stock-prices', title: 'How the Stock Market Actually Works', excerpt: 'Shares, exchanges, and why prices move — the plain-English version.', category: 'Markets', date: '2026-07-18', readMinutes: 5 },
  { slug: 'inflation-explained', hero: 'finance', title: 'Inflation: Why Prices Keep Going Up', excerpt: 'What inflation really is, and what it quietly does to the cash under your mattress.', category: 'Markets', date: '2026-07-18', readMinutes: 5 },
  { slug: 'emergency-fund-how-much', hero: 'savings', title: 'How Big Should Your Emergency Fund Be', excerpt: 'Three months? Six? The honest answer depends on numbers you already know.', category: 'Money basics', date: '2026-07-17', readMinutes: 6 },
  { slug: 'dollar-cost-averaging-explained', hero: 'savings', title: 'Dollar-Cost Averaging, Explained', excerpt: 'Why investing the same amount on a schedule beats trying to time the market.', category: 'Strategy', date: '2026-07-16', readMinutes: 6 },
  { slug: 'market-crashes-what-history-teaches', hero: 'stock-prices', title: 'Market Crashes & What History Teaches', excerpt: 'Every crash felt like the end. Here is what actually happened next, every time.', category: 'Markets', date: '2026-07-16', readMinutes: 5 },
  { slug: 'how-credit-scores-work', hero: 'credit-card', title: 'How Credit Scores Actually Work', excerpt: 'The five things that move your score, and the myths that do not.', category: 'Credit', date: '2026-07-15', readMinutes: 7 },
  { slug: 'build-your-first-investment-portfolio', hero: 'investing', title: 'Build Your First Investment Portfolio', excerpt: 'From zero to a diversified starter portfolio you actually understand.', category: 'Investing', date: '2026-07-14', readMinutes: 7 },
  { slug: 'what-is-risk-tolerance', title: 'What Is Risk Tolerance', excerpt: 'How much of a drop you can sit through without selling — and how to find your own number.', category: 'Strategy', date: '2026-07-20', readMinutes: 5, hero: 'analytics' },
  { slug: 'what-is-an-etf', title: 'What Is an ETF', excerpt: 'One purchase, hundreds of companies. How funds work and which fee quietly matters.', category: 'Investing', date: '2026-07-17', readMinutes: 6, hero: 'analytics' },
  { slug: 'roth-ira-explained-for-beginners', title: 'Roth IRA, Explained for Beginners', excerpt: 'Pay tax now so future-you does not have to. What a Roth actually is, in plain terms.', category: 'Investing', date: '2026-07-16', readMinutes: 5, hero: 'growing' },
  { slug: 'stocks-vs-bonds-explained', title: 'Stocks vs Bonds', excerpt: 'Owning a slice versus lending money — and why a portfolio usually wants both.', category: 'Investing', date: '2026-07-15', readMinutes: 6, hero: 'stock-prices' },
  { slug: 'what-is-compound-interest', title: 'What Is Compound Interest', excerpt: 'Growth earning its own growth. The one idea that makes starting early matter so much.', category: 'Money basics', date: '2026-07-14', readMinutes: 6, hero: 'growing' },
];

export const DIGEST_CATEGORIES = [...new Set(DIGEST_POSTS.map((p) => p.category))] as DigestCategory[];
