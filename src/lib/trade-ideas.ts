/**
 * Trade ideas — PURE DERIVATION from the portfolio the user already has.
 *
 * Same contract as `lib/quests.ts`: not one byte of new persisted state, no `Math.random()`, and
 * every number quoted is read from the store at call time rather than cached. A second source of
 * truth about "what is in your portfolio" is exactly the split-authority defect C19/C26 spent two
 * units removing.
 *
 * ── WHAT THIS IS, AND THE ONE THING IT MUST NEVER BECOME ──────────────────────────────────────
 * The ask was a learning surface on Trade: suggestions with an explicit not-financial-advice
 * stance. So every idea here is an OBSERVATION ABOUT THE USER'S OWN PORTFOLIO paired with the
 * course that teaches the concept behind it. It states a fact they can verify on the same screen
 * ("NVDA is 71% of your portfolio") and names the concept ("Concentration risk").
 *
 * **It never says buy, sell, or hold, and it never names a ticker the user does not already own or
 * follow.** A simulator that issues directional calls is giving investment advice with no licence
 * and no accountability, and §20.5 already forbids inventing urgency. Suggesting a stock is a
 * bigger version of the same sin.
 *
 * ── SCREENSDESIGN, counted in pixels ──────────────────────────────────────────────────────────
 *   2/2  an explicit disclaimer on any suggestion surface
 *        Investing.com WarrenAI `211319`: "may provide incorrect information and is **never
 *        financial advice**. More in our T&Cs" — persistent, bottom of screen, grey
 *        TradingView `185073`: a House Rules agreement gate before an idea can be published
 *   2/2  every idea carries a CONCEPT/CATEGORY tag, not just a headline
 *        Investing.com: capability pills — Technical Insights, Watchlist Insights, Screener
 *        TradingView: a required `Category` field, e.g. "Harmonic patterns"
 *   1/2  a LEARNING type distinct from a market call — TradingView's `Analysis | Tutorial`
 *        segmented control. Below convergence, but it is the mechanism this feature IS, so it is
 *        adopted deliberately and labelled: **every Euphoria idea is the Tutorial type.**
 *   1/2  a directional stance (TradingView's Long / Neutral / Short, in semantic colour).
 *        **NOT ADOPTED, and the reason is the point:** TradingView hosts other traders' calls and
 *        makes the author accountable for them. Euphoria would be the author. A stance chip is
 *        precisely the financial-advice signal this surface must not emit, so there is none.
 *
 * Falls back to nothing rather than to filler: with an empty portfolio only the getting-started
 * idea fires, and if a rule's precondition is false it simply does not appear. No placeholders.
 */
import { COURSES } from './curriculum/courseIndex';
import { priceOf } from './stocks';

export type TradeIdea = {
  /** Stable key. Also the reason a rule can only fire once. */
  id: string;
  /** The concept, which is the part that transfers off this screen. 2/2 convergence. */
  concept: string;
  /** One sentence, and it must contain a number the user can check on this same screen. */
  detail: string;
  /** A real course id from `courseIndex.ts`. */
  courseId: string;
  /** The audited lesson that teaches this exact concept. Pinned by the routing regression. */
  lessonNumber: number;
};

/** The line that must appear wherever these render. 2/2 convergence, and it is not decoration. */
export const IDEAS_DISCLAIMER =
  'Teaching examples drawn from your own portfolio. Never financial advice.';

const titleOf = (id: string) => COURSES.find((c) => c.id === id)?.title ?? '';

/** Course title for display, exported so the UI never hand-writes one that could drift. */
export const ideaCourseTitle = titleOf;

/** The Expo Router destination shared by the UI and its regression test. */
export const tradeIdeaRoute = (idea: Pick<TradeIdea, 'courseId' | 'lessonNumber'>) => ({
  pathname: '/lesson' as const,
  params: { course: idea.courseId, num: String(idea.lessonNumber) },
});

export type IdeaInput = {
  cash: number;
  positions: Record<string, number>;
  watchlist: string[];
  /**
   * `store.portfolioValue()` — PASSED IN, never recomputed here, and that is a correctness rule
   * rather than a style choice.
   *
   * The first version summed `cash + shares x priceOf` itself and got $9,222 while the card at the
   * top of the same screen read $10,003, because portfolioValue() also counts OPEN OPTION
   * CONTRACTS at cost. It rendered "61% of your portfolio is uninvested cash" against a total the
   * user could not find anywhere on screen. An observation you cannot check against the number
   * directly above it is worse than no observation: it teaches the reader to distrust both.
   * One authority for portfolio value, and it lives in the store.
   */
  total: number;
};

/**
 * At most three, in priority order — the riskiest observation first, because that is the one worth
 * interrupting someone for. Three is the cap for the same reason quests cap at three: a list of
 * eight suggestions is a backlog, not a nudge.
 */
export function tradeIdeas({ cash, positions, watchlist, total }: IdeaInput, limit = 3): TradeIdea[] {
  const held = Object.keys(positions).filter((s) => (positions[s] ?? 0) > 0);
  const valueOf = (s: string) => (positions[s] ?? 0) * priceOf(s);
  const out: TradeIdea[] = [];

  // Nothing owned yet. The only idea that fires on an empty portfolio, and it is the honest one.
  if (held.length === 0) {
    out.push({
      id: 'first-position',
      concept: 'Getting started',
      detail: `You have ${fmt(cash)} in practice cash and no positions yet. Nothing here is real money.`,
      courseId: 'investing-fundamentals',
      lessonNumber: 1,
    });
  }

  if (held.length > 0 && total > 0) {
    // Concentration. Ranked first because it is the failure mode that actually ends portfolios.
    const top = held.reduce((a, b) => (valueOf(a) >= valueOf(b) ? a : b));
    const share = valueOf(top) / total;
    if (share >= 0.4) {
      out.push({
        id: 'concentration',
        concept: 'Concentration risk',
        detail: `${top} is ${Math.round(share * 100)}% of your portfolio. One name moving decides your whole result.`,
        courseId: 'investing-fundamentals',
        lessonNumber: 5,
      });
    }

    // Too few names to diversify across, which is a different fact from concentration and can be
    // true when concentration is not — three equal thirds is spread, and it is still only three.
    if (held.length < 3) {
      out.push({
        id: 'few-names',
        concept: 'Diversification',
        detail: `You hold ${held.length} ${held.length === 1 ? 'name' : 'names'}. Diversification is about how many bets, not how big each one is.`,
        courseId: 'investing-fundamentals',
        lessonNumber: 5,
      });
    }
  }

  // Idle cash. Real at both extremes, so both are stated rather than only the one that flatters.
  if (total > 0) {
    const cashShare = cash / total;
    if (held.length > 0 && cashShare >= 0.6) {
      out.push({
        id: 'cash-drag',
        concept: 'Cash drag',
        detail: `${Math.round(cashShare * 100)}% of your portfolio is uninvested cash. Sitting out has a cost too.`,
        courseId: 'behavioral-finance',
        lessonNumber: 13,
      });
    }
    if (held.length > 0 && cashShare <= 0.05) {
      out.push({
        id: 'no-buffer',
        concept: 'Liquidity',
        detail: `Only ${Math.round(cashShare * 100)}% of your portfolio is cash. Fully invested means no room to act.`,
        courseId: 'personal-finance',
        lessonNumber: 4,
      });
    }
  }

  // Watched but never acted on — the bias this app is unusually well placed to name.
  const watching = watchlist.filter((s) => !held.includes(s));
  if (watching.length >= 2) {
    out.push({
      id: 'watchlist-idle',
      concept: 'Analysis paralysis',
      detail: `${watching.length} names on your watchlist, none bought. Watching is not a decision.`,
      courseId: 'behavioral-finance',
      lessonNumber: 13,
    });
  }

  return out.slice(0, limit);
}

function fmt(n: number): string {
  // Pinned to en-US like lib/stocks.ts money(). Unpinned, this formats from the DEVICE
  // locale, so a German phone rendered "$1.234,56" — a US currency symbol wired to European
  // separators, inside English copy. The app is English-only by design; the numbers have to
  // agree with that rather than with whoever's handset they land on.
  return `$${Math.round(n).toLocaleString('en-US')}`;
}

/*
 * ONE RUNNABLE CHECK. Every rule here is a threshold on a ratio, which is the kind of thing that
 * silently inverts during a refactor and still renders something plausible — the worst failure
 * mode this codebase has, because a wrong-but-confident number is indistinguishable from a right
 * one on screen. These run on device at import and report out loud.
 */
if (__DEV__) {
  const say = (ok: boolean, what: string) => {
    if (!ok) console.error(`[trade-ideas] FAILED: ${what}`);
  };
  const ids = (i: IdeaInput) => tradeIdeas(i, 9).map((x) => x.id);

  say(ids({ cash: 10000, positions: {}, watchlist: [], total: 10000 }).includes('first-position'),
    'an empty portfolio offers getting-started');
  say(!ids({ cash: 10000, positions: {}, watchlist: [], total: 10000 }).includes('concentration'),
    'an empty portfolio cannot be concentrated');
  // One name is both concentrated AND undiversified: two different facts, both true, both said.
  const one = ids({ cash: 0, positions: { NVDA: 10 }, watchlist: [], total: 10 * priceOf('NVDA') });
  say(one.includes('concentration') && one.includes('few-names'),
    'a single holding is flagged as concentrated and as too few names');
  say(ids({ cash: 0, positions: { NVDA: 10 }, watchlist: [], total: 10 * priceOf('NVDA') }).includes('no-buffer'),
    'zero cash is flagged as no liquidity buffer');
  say(!ids({ cash: 0, positions: { NVDA: 10 }, watchlist: [], total: 10 * priceOf('NVDA') }).includes('cash-drag'),
    'zero cash is NOT also flagged as cash drag');
  say(ids({ cash: 0, positions: { NVDA: 1 }, watchlist: ['AAPL', 'MSFT'], total: priceOf('NVDA') }).includes('watchlist-idle'),
    'two unbought watchlist names is analysis paralysis');
  say(tradeIdeas({ cash: 0, positions: { NVDA: 1 }, watchlist: ['AAPL', 'MSFT'], total: priceOf('NVDA') }).length <= 3,
    'never more than three ideas');
  say(tradeIdeas({ cash: 0, positions: {}, watchlist: [], total: 0 }, 9).every((i) => titleOf(i.courseId) !== ''),
    'every idea points at a course that actually exists');
}
