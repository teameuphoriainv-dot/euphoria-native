/**
 * LessonArt — the lesson's mark, as a pixel sprite.
 *
 * Art is chosen by matching the real lesson title against METAPHORS — a NARROW concept tier first,
 * then broader course-level nets. Unmatched titles hash to NEUTRAL. THAT LOGIC IS UNCHANGED and is
 * kept verbatim below: it carries measured tuning (the 96%-of-one-course case in its own comment),
 * and it is not what was wrong here.
 *
 * WHAT WAS WRONG was the drawing. This file held ~950 lines of SVG scenes sharing one gradient
 * (`laBall`, lite -> base -> dark) plus a cast `Ground` ellipse under every mark — a soft 3D
 * treatment in an app whose identity is pixel art, and the exact look the design doc rejects.
 *
 * Rendered side by side in the art gallery it was also LESS varied than its size suggests: because
 * keys are matched on title, and titles repeat across courses, "investing · What is a st…",
 * "personal · What is a st…" and "behavioral · What is a…" were the identical drawing in three
 * tints. Keying the same 40 metaphors to 40 DISTINCT sprites adds variety rather than losing it.
 *
 * 33 of the 40 come from the shared catalogue. The other seven had no equivalent and were drawn
 * (sprites-lesson.ts) rather than approximated — forcing `dice` onto a question mark would put the
 * same picture on different lessons, which is the problem this replaces.
 *
 * THE COURSE ACCENT IS GONE, deliberately. Each scene used to be tinted by its course, which is
 * what made three courses share one drawing in three colours. A sprite carries its own palette, so
 * the mark now identifies the LESSON and the course accent still identifies the course everywhere
 * else it appears — the eyebrow, the card tint, the border.
 */
import { memo } from 'react';

import {
  anchor, arrowSplit, bank, barChart, bill, book, cart, certificate, chartUp, chat, coin,
  compass, crack, creditCard, crowd, dice, dividend, frame, funnel, globe, handshake, hourglass,
  house, inflation, ladder, lightbulb, lock, magnet, magnifier, network, pieSlice, piggyBank,
  pricetag, receipt, safetyNet, scales, stockTicker, target, umbrella, vault,
  PixelSpriteView, type PixelSprite,
} from '@/lib/pixel';

/**
 * One sprite per metaphor, all forty distinct. Keys are exactly the ones artKeyFor already
 * returns, so the matching table below did not have to change at all.
 */
const ART: Record<string, PixelSprite> = {
  snowball: chartUp,        // compounding — a mass gathering down a slope
  candles: stockTicker,
  scale: scales,
  basket: cart,
  balloon: inflation,       // a balloon IS the inflation mark
  certificate,
  receipt,
  hourglass,
  jars: piggyBank,
  card: creditCard,
  dividendtree: dividend,
  bucket: safetyNet,
  magnifier,
  mind: lightbulb,
  house,
  bank,
  vault,
  globe,
  pricetag,
  umbrella,
  pipes: arrowSplit,        // cash flowing and splitting
  dice,
  ledger: book,
  chess: compass,           // strategy — the catalogue has no board, and a compass is the idea
  lock,
  coins: coin,
  crowd,
  anchor,
  frame,
  magnet,
  story: chat,
  invoice: bill,
  boxes: pieSlice,          // allocation
  decay: crack,
  flag: target,             // a goal reached
  handshake,
  funnel,
  network,
  dashboard: barChart,
  stairs: ladder,
};

/* ---------------------------------------------------------------- title -> metaphor */

/**
 * Matched in order, first hit wins — so put specific phrases above generic words.
 * Titles come from the real curriculum (342 of them), which is finance-wide, so this
 * matches on topic vocabulary rather than trying to enumerate every lesson.
 */
const METAPHORS: readonly (readonly [RegExp, string])[] = [
  /* ══════════════════════════════════════════════════════════════════════════════════════
   * TIER 0 — CONCEPT-LEVEL, matched FIRST. Added 2026-08-07.
   *
   * WHY THIS TIER EXISTS. The table below TIER 0 matches at COURSE granularity: every lesson
   * in Behavioral Finance contains a behavioural word, so all of them hit the `mind` net.
   * Measured across the real 295 authored lesson titles before this tier existed:
   *
   *   behavioralFinance   'mind'      24 of 25 nodes (96%)  — 16 CONSECUTIVE identical icons
   *   businessStrategy    'chess'     20 of 25 (80%)        —  7 in a row
   *   appliedAccounting   'ledger'    19 of 25 (76%)        —  6 in a row
   *   financialAnalytics  'magnifier' 16 of 25 (64%)        —  6 in a row
   *
   * A path of 25 nodes showing one glyph is decoration wearing the costume of information —
   * the same conclusion that got node-TYPE badges removed from learn.tsx. The fix is not more
   * fallbacks; it is matching the CONCEPT the lesson actually teaches.
   *
   * ORDER IS LOAD-BEARING. Every pattern here must stay above the broad nets, and narrower
   * ones above wider ones inside this tier. `/depreciat/` in particular must precede the
   * `ledger` net, which also matches it.
   *
   * Verify any change with the distribution script: no course may show one icon on more than
   * ~5 of its 25 nodes, and no icon may repeat on 3+ consecutive nodes.
   * ══════════════════════════════════════════════════════════════════════════════════════ */

  /* -- behavioural concepts ---------------------------------------------------------- */
  [/herd behav|social proof|bandwagon/i, 'crowd'],
  [/anchoring/i, 'anchor'],
  [/framing|mental account/i, 'frame'],
  [/nudge|choice architect/i, 'funnel'],
  [/narrative fallacy|storytell/i, 'story'],
  [/attention bias|media influence/i, 'magnet'],
  [/social media/i, 'network'],
  [/sunk cost/i, 'decay'],
  [/status quo|inertia/i, 'lock'],
  [/regret aversion|paralysis/i, 'hourglass'],
  [/overconfiden|illusion of control|emotional cycle/i, 'balloon'],
  [/disposition effect|selling winners/i, 'candles'],
  [/gambler|hot hand/i, 'dice'],
  [/endowment effect/i, 'house'],
  [/debiasing|cognitive tool|your brain/i, 'mind'],
  [/cognitive bias/i, 'bucket'],
  [/behavioral portfolio/i, 'basket'],
  [/everyday life/i, 'jars'],
  [/market anomal/i, 'magnifier'],
  [/rational (investment )?framework/i, 'stairs'],
  [/prospect theory/i, 'scale'],

  /* -- accounting concepts ----------------------------------------------------------- */
  [/balance sheet/i, 'scale'],
  [/inventory/i, 'boxes'],
  [/depreciat/i, 'decay'],
  [/payroll|employee benefit/i, 'crowd'],
  [/receivable|payable/i, 'handshake'],
  [/consolidat|group accounting/i, 'basket'],
  [/information system/i, 'network'],
  [/financial statement analysis/i, 'dashboard'],
  [/income statement|revenue recognition|accrual/i, 'invoice'],
  [/cost accounting|break.?even/i, 'bucket'],
  [/internal control|\bauditing\b/i, 'lock'],
  [/forensic|fraud detection|x.?ray/i, 'magnifier'],
  [/managerial account/i, 'chess'],
  [/nonprofit|government account/i, 'bank'],
  [/\bifrs\b|\bgaap\b|international account/i, 'globe'],
  [/ethics|professional standard/i, 'certificate'],
  [/journal entr|double.entry|language of account/i, 'ledger'],
  [/variance analysis/i, 'jars'],

  /* -- strategy concepts ------------------------------------------------------------- */
  [/market positioning|competitive analysis|go.to.market/i, 'flag'],
  [/merger|acquisition|partnership|alliance/i, 'handshake'],
  [/scaling a business|business model|predictive model/i, 'stairs'],
  [/leadership|organizational|talent strategy|human capital/i, 'crowd'],
  [/customer acquisition|retention/i, 'funnel'],
  [/brand building|market perception|financial modeling/i, 'frame'],
  [/supply chain|\bsql\b|database quer|big data/i, 'boxes'],
  [/digital transformation|innovation|disrupt|machine learning|\bnlp\b|natural language|python for/i, 'network'],
  [/data.driven|dashboard|data visuali|what is financial analytics/i, 'dashboard'],
  [/crisis management|business continuity|stress test/i, 'umbrella'],
  [/sustainab|\besg\b|social responsib/i, 'dividendtree'],
  [/platform business|real.time data|streaming/i, 'pipes'],
  [/product strategy|portfolio analytics/i, 'basket'],
  [/strategic finance/i, 'ledger'],

  /* -- analytics concepts ------------------------------------------------------------ */
  [/sentiment analysis|alternative data/i, 'story'],
  [/time series/i, 'hourglass'],
  [/credit scoring/i, 'card'],
  [/a\/b test|experimentation/i, 'funnel'],
  [/automated reporting/i, 'invoice'],
  [/anomaly detection|fraud analytics/i, 'lock'],
  [/monte carlo|descriptive statistic/i, 'dice'],
  [/regression analysis/i, 'magnifier'],

  /* -- macro / global economics ------------------------------------------------------ */
  [/supply and demand/i, 'scale'],
  [/federal reserve|monetary polic|central bank/i, 'bank'],
  [/\bgdp\b|economic indicator|leading signal/i, 'dashboard'],
  [/fiscal polic|government spending|deficit|sovereign risk/i, 'invoice'],
  [/currency market|exchange rate|\bcbdc|digital currency|future of money/i, 'coins'],
  [/emerging market|development econom|poverty/i, 'stairs'],
  [/labor market|employment|income inequal|wealth distribution/i, 'crowd'],
  [/trade war|tariff|sanction|geopolit/i, 'flag'],
  [/commodit|natural resource/i, 'boxes'],
  [/climate/i, 'dividendtree'],
  [/digital economy|platform econom/i, 'network'],
  [/bubble|financial cris|contagion|systemic risk/i, 'balloon'],
  [/international trade|globalizat/i, 'globe'],

  /* -- wealth management ------------------------------------------------------------- */
  [/estate plan|trusts|wealth transfer/i, 'certificate'],
  [/charitable|philanthrop|impact investing|values.based/i, 'dividendtree'],
  [/family wealth|multi.generational/i, 'crowd'],
  [/financial advisor|robo.advisor/i, 'handshake'],
  [/asset location|tax.efficient|tax.advantaged|tax optimization/i, 'receipt'],
  [/social security|government benefit/i, 'bank'],
  [/health care planning|\bhsa/i, 'umbrella'],
  [/concentrated stock/i, 'candles'],
  [/divorce|financial separation/i, 'scale'],
  [/business owner wealth/i, 'flag'],
  [/preserving wealth|building & preserving/i, 'vault'],
  [/retirement income|withdrawal strateg/i, 'hourglass'],

  /* -- risk management --------------------------------------------------------------- */
  [/value at risk|risk decomposition|quantitative risk model/i, 'dice'],
  [/credit risk|default probab|counterparty|collateral/i, 'card'],
  [/operational|liquidity risk/i, 'pipes'],
  [/hedging|\bfx hedg/i, 'umbrella'],
  [/duration|interest rate (risk|model)/i, 'certificate'],
  [/enterprise risk|risk governance|board oversight/i, 'chess'],
  [/basel|regulatory framework/i, 'lock'],
  [/tail risk|black swan/i, 'balloon'],
  [/cyber|technology threat/i, 'magnet'],
  [/model risk|validation|backtest/i, 'frame'],
  [/scenario analysis|war gaming/i, 'story'],
  [/risk transfer/i, 'handshake'],

  /* -- quantitative ------------------------------------------------------------------ */
  [/portfolio optimiz|markowitz/i, 'basket'],
  [/black.scholes|derivatives pricing|risk.neutral|measure theory/i, 'pricetag'],
  [/factor model|alpha generation/i, 'network'],
  [/statistical arbitrage|high.frequency|market microstructure/i, 'candles'],
  [/algorithmic trading|execution algorithm|transaction cost/i, 'pipes'],
  [/stochastic calculus/i, 'dice'],
  [/copula|dependency model/i, 'network'],
  [/bayesian/i, 'scale'],
  [/volatilit.*garch|\bgarch\b/i, 'balloon'],
  [/exotic option|path.dependent/i, 'anchor'],
  [/quantum computing/i, 'magnet'],

  /* -- investing fundamentals -------------------------------------------------------- */
  [/compound interest|dollar cost averag/i, 'snowball'],
  [/stocks vs\.? bonds|mutual fund|fund types/i, 'certificate'],
  [/diversificat/i, 'basket'],
  [/etfs? & index|index funds/i, 'boxes'],
  [/first portfolio|rebalancing/i, 'scale'],
  [/account types/i, 'vault'],
  [/reading stock chart|market order|market cycle/i, 'candles'],
  [/dividend/i, 'dividendtree'],
  [/growth vs value/i, 'stairs'],
  [/international investing/i, 'globe'],
  [/introduction to options/i, 'anchor'],
  [/investing pitfall/i, 'mind'],
  [/investment fees/i, 'bucket'],
  [/due diligence/i, 'magnifier'],
  [/long.term investing/i, 'hourglass'],
  [/paper trading/i, 'flag'],
  [/risk vs\.? reward/i, 'dice'],

  /* -- every course ends in one; keeps the last node from inheriting a broad net ----- */
  [/capstone|checkpoint/i, 'vault'],

  /* -- narrow, high-confidence topics first ------------------------------------------ */
  [/compound|snowball|exponential|growth over time|dollar cost averag|time value|long-term investing/i, 'snowball'],
  [/inflation|purchasing power|cost of living|deflation|hyperinflat/i, 'balloon'],
  [/retire|401|\bira\b|pension|nest egg|annuit|social security|withdrawal strateg/i, 'hourglass'],
  [/fraud|identity theft|\bscam|phishing|cyber|password|security\b|embezzl|ponzi|\btheft/i, 'lock'],
  [/\bbond|treasur|coupon|fixed income|credit rating|debenture|duration|yield curve|regulat|complian|basel|structured product|prospectus|disclosure/i, 'certificate'],
  [/\btax|\birs\b|deduction|withhold|capital gains|estate plan|write-off|philanthrop|charitable|\bhsa/i, 'receipt'],
  [/dividend|payout|passive income|income stream|buyback|yield on cost/i, 'dividendtree'],
  [/budget|spending|sinking fund|envelope|zero-based|paycheck|salary|negotiat/i, 'jars'],
  [/real estate|\bhome\b|housing|property|\brent|mortgage|\breit|landlord|homeown|farmland|infrastructure/i, 'house'],
  [/\bdebt|credit card|credit score|\bloan|borrow|leverage|\bapr\b|refinanc|amortiz|default probab|distress|restructur|bankrupt|insolven/i, 'card'],
  [/\bfees?\b|expense ratio|cost drag|commission|12b-1|leak|\bload\b|transaction cost/i, 'bucket'],
  [/insur|coverage|deductible|underwrit|policyholder|actuar|reinsur/i, 'umbrella'],
  [/cash flow|cashflow|liquidit|working capital|free cash|burn rate|runway|inflow|outflow|fundrais|venture fund|startup finance/i, 'pipes'],
  [/behavio|\bbias|debias|psycholog|emotion|herd|anchoring|overconfiden|\bfomo\b|mental account|aversion|your brain|framing|prospect theory|nudge|choice architect|fallacy|disposition effect|paralysis/i, 'mind'],
  [/bank|\bfdic\b|monetary polic|federal reserve|\bdeposit|checking account|credit union|the fed\b/i, 'bank'],
  [/saving|emergency fund|vault|store of value|preserv|thrift|wealth\b|financial advisor|financial planning|life events|\bhnw\b/i, 'vault'],
  [/global|internationa|currenc|forex|exchange rate|geopolit|emerging market|world econom|tariff|\bimport|\bexport|\bgdp\b|supply and demand|crypto|\bdefi\b|token|blockchain|digital asset|econom/i, 'globe'],
  [/valuation|\bdcf\b|intrinsic|price target|\bp\/e\b|multiples|apprais|pricing|book value|black-scholes|\bprice\b|valuing|\bwacc\b|cost of capital|compensation|value investing/i, 'pricetag'],
  [/probabilit|monte carlo|\bdice\b|\bodds\b|bayes|stochast|expected value|simulat|random|standard deviation|statistic|regression|\bquant/i, 'dice'],
  [/account|ledger|balance sheet|bookkeep|\bdebit|\bgaap\b|\bifrs\b|journal|double-entry|income statement|financial statement|depreciat|revenue recognition|\baudit/i, 'ledger'],
  [/strateg|competit|\bmoat\b|game theory|chess|positioning|first.mover|\bswot\b|porter|go-to-market|scaling a business|business model|governance|\bethic|innovat|disrupt|leadership|organizational|customer acquisition|digital transformation|crisis management|sustainab|\besg\b|social responsib|merger|acquisition/i, 'chess'],

  /* -- broader nets last; everything above must stay reachable ----------------------- */
  [/diversif|allocat|portfolio|basket|spread|rebalanc|optimiz|\betfs?\b|index fund|mutual fund|asset class|alternative (invest|asset)|collectib|commodit/i, 'basket'],
  [/risk|volatil|uncertain|downside|hedge|safety|protect|derivativ|option/i, 'scale'],
  [/research|due diligence|forensic|red flag|screening|investigat|analy(s|z|t)|model|forecast|ratio|\bdata\b|dashboard|machine learning|\bsql\b|reporting|algorithm|comput|visualiz|testing|experiment/i, 'magnifier'],
  [/stock|share|equit|market|ticker|chart|candle|trading|trade|order|\bipo|\bspac|blank check/i, 'candles'],
];

/**
 * Topic-neutral art for titles that match no metaphor. Chosen by hashing the TITLE, not the
 * index: art must not change when a lesson is reordered, and two adjacent generic titles
 * should still differ. Keep these generic — never put a strong metaphor (inflation, risk)
 * in here or it will assert something false about an unrelated lesson.
 */
const NEUTRAL = ['coins', 'candles'] as const;

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function artKeyFor(title: string, _index = 0): string {
  for (const [re, key] of METAPHORS) if (re.test(title)) return key;
  return NEUTRAL[hash(title) % NEUTRAL.length];
}

/**
 * One DISTINCT mark per lesson, across a whole course.
 *
 * `artKeyFor` picks by meaning, and meaning repeats: "Budgeting Basics" and "Tracking Your
 * Spending" both match the `jars` net, so a 25-lesson course resolves to 12–22 distinct keys and
 * the path shows the same picture two rows apart. On a vertical list you are scrolling to find
 * your place in, that is worse than a slightly-off metaphor — the mark's job there is to be
 * recognisable, and a repeat destroys exactly that.
 *
 * So: the semantic choice WINS whenever it is still free, and a collision falls through to the
 * next unused sprite. Courses are at most 25 lessons and ART holds 40, so uniqueness is always
 * reachable — `lesson-art-pin` asserts that headroom rather than leaving it to luck.
 *
 * The fallback scan starts at a TITLE-DERIVED offset, not at index 0. Starting at 0 would hand
 * every course the same substitutes in the same order, so the second half of every path would
 * rhyme. Deriving it from the title keeps the assignment deterministic — the same course always
 * renders the same marks, which matters because a user learns "the ladder one is lesson 8".
 */
const ART_ORDER = Object.keys(ART);

export function assignLessonArt(titles: readonly string[]): PixelSprite[] {
  const used = new Set<string>();
  return titles.map((title, i) => {
    let key = artKeyFor(title, i);
    if (used.has(key)) {
      const start = hash(title) % ART_ORDER.length;
      for (let n = 0; n < ART_ORDER.length; n++) {
        const cand = ART_ORDER[(start + n) % ART_ORDER.length];
        if (!used.has(cand)) {
          key = cand;
          break;
        }
      }
    }
    used.add(key);
    return ART[key] ?? coin;
  });
}

/* ---------------------------------------------------------------- component */

function LessonArtInner({
  title,
  index = 0,
  size = 48,
}: {
  /** Kept in the signature though unused: every call site passes it, and the course still drives
   *  the eyebrow, tint and border around this mark. See the note on the accent above. */
  courseId?: string;
  title: string;
  index?: number;
  size?: number;
}) {
  // Falls back rather than rendering nothing: artKeyFor already hashes unmatched titles into
  // NEUTRAL, so this only fires if ART loses a key the table can still return.
  return <PixelSpriteView sprite={ART[artKeyFor(title, index)] ?? coin} size={size} />;
}

/*
 * MEMOISED. This was 267 SVG nodes and profiling eight lesson steps showed 12,910 `G` commits —
 * about 1,614 group renders to advance ONE step — for art that is a pure function of its props.
 * A compiled sprite is far cheaper, but the props are still primitives and the reasoning is
 * unchanged, so the memo stays.
 */
export const LessonArt = memo(LessonArtInner);
