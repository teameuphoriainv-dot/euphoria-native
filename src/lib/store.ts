/**
 * Euphoria app state (zustand). Screens read via useApp(); lesson completion + trades write here.
 * Replaces scattered mock literals with one source of truth.
 *
 * Persistence IS live: the persist middleware below is backed by AsyncStorage, whose native module
 * is present in the current dev client. (An earlier note here claimed persistence was disabled
 * because importing AsyncStorage red-boxed the app — that is no longer true and the app runs with
 * these imports. Verify with a force-quit + relaunch, not by trusting this comment.)
 *
 * Anything added to state must ALSO be added to `partialize` at the bottom, or it silently
 * won't survive a restart.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Profile } from './onboarding-path';
import { EMPTY_PROFILE, MINUTES_PER_LESSON, recommendPath } from './onboarding-path';
import { SEED_FOLLOWERS } from './people';
import { ALL_SYMS, priceOf } from './stocks';

const XP_PER_LEVEL = 500;

/**
 * Distinct days of real use the trial lasts. **THIS IS THE OFFER.**
 *
 * Defined HERE, beside `activeDays`, and re-exported by lib/entitlement.ts — not the other way
 * round. entitlement.ts imports this module, so a store -> entitlement import would be a genuine
 * cycle. One definition, no duplication of the rule.
 *
 * ── WHAT REPLACED THE OLD OFFER (§22 C27) ─────────────────────────────────────────────────────
 * There used to be a `FREE_LESSON_LIMIT = 5` here whose docblock claimed the same title. It is
 * gone. Content is UNMETERED during the trial — every lesson, every guide — because that is what
 * 4/4 reference trials actually grant: Headway "full access to the Premium experience", Promova
 * "Unlock all lessons", Quizlet "Get instant access", Nibble "Start daily microlearning lessons".
 * A metered trial shows the user a smaller product than the one they are being asked to buy.
 *
 * TWO CAPS SURVIVE, and neither is a trial restriction:
 *   - FREE_ATLAS_MESSAGES — the one feature with a real per-message cost to us.
 *   - PRO_DERIVATIVE_PREVIEW — a DATA limit that binds Pro users equally (§22 C26).
 *
 * So the free/paid line is now purely TIME, and this is the only number that moves it. After the
 * trial the wall is hard on everything except the streak/XP/league loop (§22 C13, C28).
 */
export const TRIAL_DAYS = 3;

/**
 * Paper-trading starting balance.
 *
 * $10,000, not the $100,000 the trading apps hand out. This is a personal-finance TEACHING tool
 * and a six-figure fantasy balance teaches the wrong instinct — a beginner learns more from
 * sizing a position against a plausible first portfolio. One constant to change if that is wrong.
 */
export const STARTING_CASH = 10_000;

/**
 * Named streak tiers, for the commitment ask on Home.
 *
 * NAMED, not bare numbers, because that is what the evidence shows: Headway `128564` offers
 * 7-day *Promising* / 14-day *Determined* / 30-day *Impressive* / 50-day *Unstoppable* with a mascot
 * line, and Duolingo's streak-commitment step is flagged uniqueness 7 in the dataset — the app asks
 * you to PROACTIVELY commit rather than just counting. 2/2 convergence (§22 C25).
 *
 * A number alone is a target. A name is an identity, and that is the whole mechanism.
 */
export const STREAK_TIERS = [
  { days: 7, name: 'Promising' },
  { days: 14, name: 'Determined' },
  { days: 30, name: 'Impressive' },
  { days: 50, name: 'Unstoppable' },
] as const;

/**
 * Options contracts a PRO member may open, lifetime.
 *
 * This cap is HONEST, not invented scarcity. Real options pricing needs an options market-data
 * provider (chains, greeks, open interest, settlement) that Euphoria has not wired up. Futures are
 * deliberately out of scope entirely
 * — the premiums below come from a textbook model, not a market. Capping the preview is how we
 * offer the mechanic without pretending we have the data. The UI says exactly this.
 *
 * Free members get zero: derivatives are a Pro feature.
 */
export const PRO_DERIVATIVE_PREVIEW = 3;

/** Atlas messages a free account may send, lifetime. Separate from the lesson allowance because
 *  chat is the one feature with a real per-use cost — the two limits defend different things and
 *  should be tunable apart. */
export const FREE_ATLAS_MESSAGES = 10;

/**
 * Free-stock reward cards granted per finished lesson.
 *
 * Bloom's loop, frame-for-frame (ScreensDesign flow 53308): pass a quiz -> "Woohoo! You passed &
 * earned 3 free stocks!" -> "NOW SCRATCH THE CARDS!" -> one reveal per stock. Three cards, each a
 * FRACTIONAL DOLLAR AMOUNT of a real ticker ($0.50, $1.00), not whole shares.
 *
 * This is the bridge Euphoria was missing: XP and the paper portfolio existed and nothing joined
 * them. Learning now pays out into the thing you trade with.
 */
export const REWARD_CARDS_PER_LESSON = 3;
/** Dollar value range of one card. Bloom's observed rewards sat at $0.50–$1.00. */
const REWARD_MIN = 0.25;
const REWARD_MAX = 2;

/**
 * Mint reward cards. ONE definition, because §17.3 is explicit that a second reward path must not
 * exist — the lesson payout and the quest payout have to produce the same kind of object or the
 * reward screen starts having two shapes to render and `rewardsEarned` starts having two meanings.
 *
 * Fractional DOLLAR amounts of a real ticker, not whole shares — Bloom's observed rewards sat at
 * $0.50–$1.00 (flow 53308) and `claimReward` divides by the live price to get the share count.
 */
const mintRewardCards = (n: number) =>
  Array.from({ length: n }, () => ({
    sym: ALL_SYMS[Math.floor(Math.random() * ALL_SYMS.length)],
    value: Math.round((REWARD_MIN + Math.random() * (REWARD_MAX - REWARD_MIN)) * 100) / 100,
  }));

/** Stable id for one curriculum lesson inside `completedLessons`. */
export const lessonKey = (courseId: string, num: number) => `${courseId}:${num}`;

/** Local calendar day, 'YYYY-MM-DD'. Local rather than UTC so the daily goal rolls over at the
 *  user's midnight, not UTC's. */
export const dayKey = (d: Date = new Date()) =>
  new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

/**
 * Append today to the trial's active-day set, idempotently.
 *
 * Shared by `markActiveDay` and by the five actions that constitute real use, so the trial clock
 * can never disagree with the thing that advanced it. Slice(-4) is TRIAL_DAYS + 1 — one past the
 * limit is all `tier()` in lib/entitlement.ts needs to answer "expired", and keeping more would
 * grow the array for the life of the install with no reader.
 */
const withToday = (days: string[]) => {
  const k = dayKey();
  return days.includes(k) ? days : [...days, k].slice(-4);
};

/** Yesterday's local day key. Used to decide whether a completion extends the streak or restarts it. */
const prevDayKey = () => dayKey(new Date(Date.now() - 86_400_000));

/** The streak a completion *right now* produces: unchanged if today is already counted, +1 if the
 *  last active day was yesterday, otherwise restarted at 1. Shared so the lesson celebration and
 *  the actual write can never disagree. */
const nextStreak = (streak: number, lastActiveDay: string) => {
  if (lastActiveDay === dayKey()) return streak;
  return lastActiveDay === prevDayKey() ? streak + 1 : 1;
};

/** Monday of the local week, 'YYYY-MM-DD'. League standings run Monday to Sunday like the
 *  reference apps. Keyed by the week's start DATE rather than an ISO week number, which is fiddly
 *  across year boundaries for no benefit here. */
export const weekKey = (d: Date = new Date()) => {
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  const mondayOffset = (local.getUTCDay() + 6) % 7; // Mon=0 ... Sun=6
  local.setUTCDate(local.getUTCDate() - mondayOffset);
  return local.toISOString().slice(0, 10);
};

/**
 * What each action is worth.
 *
 * Proportioned the way the reference apps do it: frequent small awards, a read worth about half a
 * lesson because it is lighter work, and a daily-goal bonus worth a full lesson so finishing the
 * day you committed to is the strongest single move available. 50 stays the lesson baseline so
 * existing levels do not shift under anyone.
 *
 * Before this, ONE call site in the entire app awarded XP (lesson.tsx), which is why the league
 * could not be climbed.
 */
export const XP_LESSON = 50;
export const XP_GUIDE = 25;
export const XP_GAME = 20;
export const XP_DAILY_GOAL = 50;

/**
 * Apply an XP award to BOTH counters, rolling the weekly tally over when the week has changed.
 *
 * EVERY award funnels through here. If a caller ever writes `xp` directly, lifetime and weekly
 * totals drift apart and the league silently ranks people on stale numbers.
 */
/** Append a portfolio-value snapshot. Capped so a heavy trader cannot grow the persisted blob
 *  without bound; 500 points is far more than any chart draws. */
const snapshot = (
  s: { valueHistory: { t: number; v: number }[] },
  cash: number,
  positions: Record<string, number>,
) => {
  const v = Object.entries(positions).reduce((sum, [sym, sh]) => sum + sh * priceOf(sym), cash);
  return [...s.valueHistory, { t: Date.now(), v }].slice(-500);
};

const applyXp = (s: { xp: number; weeklyXp: number; weekStart: string }, n: number) => {
  const wk = weekKey();
  const carried = s.weekStart === wk ? s.weeklyXp : 0;
  return { xp: s.xp + n, weeklyXp: carried + n, weekStart: wk };
};

/**
 * How you relate to another learner.
 *
 * Modelled on Duolingo, which does not use mutual friend requests: their help centre calls it
 * "find, follow, and block", and Friend Streak requires someone who "follows you back". So a
 * follow is one-directional and needs no approval, and FRIEND IS DERIVED - it simply means both
 * directions exist. Deriving it is what stops `following` and `followers` from disagreeing, the
 * same reason a tier is derived from xp rather than stored alongside it.
 */
export type Relationship = 'none' | 'following' | 'follows-you' | 'friends';

export function relationshipOf(id: string, following: string[], followers: string[]): Relationship {
  const iFollow = following.includes(id);
  const theyFollow = followers.includes(id);
  if (iFollow && theyFollow) return 'friends';
  if (iFollow) return 'following';
  if (theyFollow) return 'follows-you';
  return 'none';
}

export type AppState = {
  signedIn: boolean;
  xp: number;
  streak: number;
  completedLessons: string[];
  /** Minutes practised on `lastActiveDay`. Read via `minutesDoneToday()`, which zeroes it once
   *  the day rolls over — don't read this field directly. */
  minutesToday: number;
  /** Local day key the `minutesToday` tally belongs to. */
  lastActiveDay: string;
  /** Course id the Learn pathway is currently showing — one of COURSES from '@/lib/curriculum'. */
  activeCourseId: string;
  /** Slugs of Digest guides already read. Drives the read ticks in the catch-up list. */
  readPosts: string[];
  /** The guide chosen as today's read, pinned to the local day it was chosen on. Pinned so the
   *  tab does not swap what "today" means the moment you finish reading it. */
  dailyPick: { day: string; slug: string } | null;
  /** True once persist has finished rehydrating from AsyncStorage.
   *
   *  Rehydration is ASYNC, so the first render of a cold start sees the INITIAL state, not the
   *  stored one. Anything that ROUTES on persisted state must wait for this or it will navigate
   *  on a value that had not loaded yet — see src/app/index.tsx. Deliberately NOT in
   *  `partialize`: it describes this run's load status, not user data, and persisting it would
   *  restore `true` before hydration had actually finished and reintroduce the exact race. */
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  /** The streak length the user COMMITTED to, or null if they have not been asked yet.
   *  null is meaningfully different from 0: it is what makes the ask appear exactly once. */
  streakGoal: number | null;
  setStreakGoal: (days: number) => void;
  /**
   * UNIT 15d. How many of the three widget asks have been spent, and on which day the last one
   * landed. Counted rather than flagged because the ARGUMENT escalates with the count (§15.1) —
   * a boolean could only ever repeat the same pitch.
   */
  widgetAsksSeen: number;
  widgetAskDay: string;
  widgetAdded: boolean;
  recordWidgetAsk: () => void;
  markWidgetAdded: () => void;
  /** The day the quest reward was already paid. Day-keyed for the same reason `lastGameDay` is:
   *  it makes the payout once-per-day and unfarmable without a second tally to keep in sync. */
  lastQuestDay: string;
  /** Pay for finishing ALL of today's quests. Idempotent per day — §8b asks for a reward card and
   *  this reuses `pendingRewards` + `claimReward()` rather than building a second reward path.
   *  ONE card, not the three a lesson pays: a day of quests is lighter than a finished lesson and
   *  paying the same would make the lesson feel cheaper. */
  claimQuestReward: () => void;
  /** Everything onboarding collects. Persisted; drives the recommended path. */
  profile: Profile;
  /** Merge a patch into the profile. Called on every onboarding answer. */
  setProfile: (patch: Partial<Profile>) => void;
  /** End of onboarding: stamp completion and point Learn at the first recommended course.
   *  NOTE: intentionally NOT a derived getter — see you.tsx:43, a getter returning a fresh
   *  object gives zustand an unstable snapshot and loops renders. Call `recommendPath`
   *  (pure, in onboarding-path.ts) from a useMemo instead. */
  completeOnboarding: () => void;
  signIn: () => void;
  signOut: () => void;
  setActiveCourse: (id: string) => void;
  level: () => number;
  levelProgress: () => { into: number; size: number; toNext: number };
  /** Minutes practised today, 0 after midnight. Derived at read time so the ring resets without
   *  needing a timer or an app-foreground listener. */
  minutesDoneToday: () => number;
  /** The user's chosen daily commitment in minutes, defaulted for pre-onboarding users. */
  dailyGoalMinutes: () => number;
  /** Streak the next completion today would produce — for previewing the reward before it's written. */
  streakIfCompletedToday: () => number;
  /** Lifetime XP earned this league week. Drives STANDINGS (promote/demote) while `xp` drives the
   *  permanent tier, so a quiet week costs you rank but never costs you the tier you earned. */
  weeklyXp: number;
  /** Monday of the week `weeklyXp` belongs to. */
  weekStart: string;
  /** Weekly XP, zeroed once the week rolls over. Derived at read time for the same reason
   *  `minutesDoneToday` is: no timer and no foreground listener needed. */
  weeklyXpNow: () => number;
  /** Local day the game bonus was last paid, '' if never. */
  lastGameDay: string;
  /** Ids of people YOU follow. One-directional; no approval needed. */
  following: string[];
  /** Ids of people who follow YOU. Seeded from mock people so the "follows you" state is
   *  reachable at all without a backend. */
  followers: string[];
  /** Idempotent: following twice must not duplicate, unfollowing an absent id must be a no-op. */
  follow: (id: string) => void;
  unfollow: (id: string) => void;
  /** Mutual follows, which is what "friend" means here. Derived, never stored. */
  friendIds: () => string[];
  /** Pay the game bonus, at most once per day. Games are REPLAYABLE, unlike a lesson which has a
   *  permanent id to dedupe against, so paying every round would let anyone farm the weekly
   *  standings with a matching game. */
  awardGameXp: () => void;
  /** Entitlement. The ONLY thing in the app that means "has paid". Currently flipped by the dev
   *  toggle in Settings; when IAP lands, the purchase callback sets this same flag and nothing
   *  downstream changes. Deliberately NOT cleared by `reset()` — resetting progress must never
   *  revoke a purchase. */
  isPro: boolean;
  setPro: (v: boolean) => void;
  /* `canAccessLesson` and `freeLessonsLeft` USED TO LIVE HERE and are deliberately gone (§22 C27).
     Lessons are no longer count-limited at all, so a getter answering "how many lessons are left"
     had no honest answer to give. The one question — may this user open a lesson — is
     `entitled(s, 'lesson')` in lib/entitlement.ts, which is also the only thing that knows about
     expiry. Two authorities disagreeing about an allowance is exactly the C19 defect Unit 3 existed
     to remove; this keeps it at one. */
  /** Uninvested paper cash. Real state: every number on the Trade tab derives from this and
   *  `positions`, so nothing there can drift from what the user actually did. */
  cash: number;
  /** Shares held, by ticker. Absent or 0 means no position. */
  positions: Record<string, number>;
  /** Total paper account value: cash + every position marked at its current price. */
  portfolioValue: () => number;
  /** Buy at `price`. No-op when the cash is not there — the caller must not have to check. */
  buy: (sym: string, shares: number, price: number) => void;
  /** Sell at `price`. Clamped to what is actually held, so it cannot go short by accident. */
  sell: (sym: string, shares: number, price: number) => void;
  /** Portfolio value snapshots, oldest first. Written on every trade.
   *
   *  This is the ONLY honest source for a portfolio chart. Polygon can give per-ticker history,
   *  but a curve built from today's holdings projected backwards is a BACKTEST of the current
   *  basket, not what this account was worth — presenting one as the other is the same class of
   *  lie as the $104,237.55 card. So the chart starts empty and fills as you trade. */
  valueHistory: { t: number; v: number }[];
  /** Reward cards earned but not yet revealed. Each is a dollar amount of one ticker. */
  pendingRewards: { sym: string; value: number }[];
  /** Total dollar value of stock granted by lessons. Kept separate so the Trade tab can say how
   *  much of the portfolio was EARNED rather than traded — otherwise free stock silently inflates
   *  what looks like investing skill. */
  rewardsEarned: number;
  /** Reveal the next card: credits fractional shares, no cash spent. Returns nothing; read
   *  `pendingRewards` to know what is left. */
  claimReward: () => void;
  /**
   * Tickers the user has explicitly followed.
   *
   * The Trade tab used to render "watchlist" as `ALL_SYMS minus what you hold` — a list nobody
   * chose, labelled as though they had. Bloom, Investing.com and TradingView all treat Follow as a
   * first-class action sitting beside Buy (3/4 of the reference set); a watchlist you did not
   * build is not a watchlist.
   */
  watchlist: string[];
  /**
   * Stable per-install identity, generated once.
   *
   * Sent as `X-Euphoria-Install` on every API call and used as the rate-limit bucket key. No PII —
   * a random id, not a device identifier.
   *
   * DELIBERATELY EXCLUDED FROM `reset()`, for the same reason `isPro` is: resetting progress must
   * not mint a fresh identity and thereby hand the caller a fresh rate-limit budget. Progress is
   * the user's to clear; the quota is not.
   */
  installId: string;
  /**
   * Distinct day keys on which the user did something REAL — finished a lesson, read a guide,
   * asked Atlas, or placed a trade. NOT app launches: a mis-tap on the home-screen icon must
   * never burn a trial day.
   *
   * DELIBERATELY EXCLUDED FROM `reset()`, for the same reason `isPro` and `installId` are. If
   * resetting progress restarted the trial, the trial would be a button rather than a limit.
   *
   * Capped at TRIAL_DAYS + 1 entries. Once it is over the exact count stops mattering, and an
   * uncapped array would grow for the life of the install.
   */
  activeDays: string[];
  /**
   * Idempotent. Records today as a trial day. Called from the four actions that already write on
   * real use; see the call sites in completeLesson / markPostRead / spendAtlasMessage / buy / sell.
   */
  markActiveDay: () => void;
  /** Follow / unfollow. Idempotent both ways. */
  toggleWatch: (sym: string) => void;
  /** Options contracts opened. Counts against `PRO_DERIVATIVE_PREVIEW`. */
  derivativeTrades: number;
  /** Preview derivative trades remaining. 0 for anyone who is not Pro — this is a Pro feature. */
  derivativesLeft: () => number;
  /** True once the trial's day allowance is spent. The single definition of expiry. */
  trialExpired: () => boolean;
  /** Open derivative positions. Simplified: no exercise, no assignment, no expiry processing —
   *  the screen states that plainly rather than implying a settlement engine exists. */
  derivatives: {
    id: string;
    sym: string;
    kind: 'call' | 'put';
    strike: number;
    days: number;
    premium: number;
  }[];
  /** Open a contract. No-op unless Pro, in budget, and the premium is affordable. */
  openDerivative: (d: { sym: string; kind: 'call' | 'put'; strike: number; days: number; premium: number }) => void;
  /** Atlas messages sent on the free allowance. Never decremented — spent is spent. */
  atlasAsked: number;
  /** Atlas messages still available. Pro reports Infinity. */
  atlasLeft: () => number;
  /** Record one sent message. No-op for Pro, so the counter cannot creep while subscribed and
   *  then strand a lapsed user at zero. */
  spendAtlasMessage: () => void;
  completeLesson: (id: string, xp: number) => void;
  addXp: (n: number) => void;
  markPostRead: (slug: string) => void;
  setDailyPick: (day: string, slug: string) => void;
  reset: () => void;
};

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      signedIn: false,
      // A new install has done nothing yet. These were demo literals; `reset()` below already
      // treated 0/0 as the clean state, so the initial values simply disagreed with it.
      xp: 0,
      streak: 0,
      completedLessons: [],
      minutesToday: 0,
      streakGoal: null,
      setStreakGoal: (days) => set({ streakGoal: days }),
      widgetAsksSeen: 0,
      widgetAskDay: '',
      widgetAdded: false,
      recordWidgetAsk: () => {
        set((s) => ({ widgetAsksSeen: s.widgetAsksSeen + 1, widgetAskDay: dayKey() }));
      },
      /*
       * iOS gives no API to place a widget or to ask whether one exists, so this records INTENT —
       * the user reached the tutorial. That is the only signal available, and it is enough to stop
       * asking someone who has already followed the instructions.
       */
      markWidgetAdded: () => {
        set({ widgetAdded: true });
      },
      lastActiveDay: '',
      activeCourseId: 'investing-fundamentals',
      readPosts: [],
      dailyPick: null,
      profile: EMPTY_PROFILE,
      hasHydrated: false,
      weeklyXp: 0,
      weekStart: '',
      lastGameDay: '',
      lastQuestDay: '',
      following: [],
      followers: SEED_FOLLOWERS,
      isPro: false,

      setHasHydrated: (v) => set({ hasHydrated: v }),
      setPro: (v) => set({ isPro: v }),

      cash: STARTING_CASH,
      positions: {},
      valueHistory: [],
      derivativeTrades: 0,
      derivatives: [],
      pendingRewards: [],
      rewardsEarned: 0,
      watchlist: [],
      // Generated at first store creation, then persisted forever. Not cryptographic and does not
      // need to be — it is a bucket key, not a credential.
      installId: `eu_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`,
      atlasAsked: 0,
      activeDays: [],
      // Cap is TRIAL_DAYS + 1 (4). One past the limit is all `tier()` needs to say "expired";
      // keeping more would grow forever for no reader.
      markActiveDay: () => set((s) => ({ activeDays: withToday(s.activeDays) })),
      atlasLeft: () => (get().isPro ? Infinity : Math.max(0, FREE_ATLAS_MESSAGES - get().atlasAsked)),

      claimReward: () =>
        set((s) => {
          const [card, ...rest] = s.pendingRewards;
          if (!card) return s;
          const price = priceOf(card.sym);
          if (price <= 0) return { pendingRewards: rest };
          // Fractional shares. A $1 reward on a $1,184 stock is 0.00084 shares — real, and exactly
          // how fractional brokerages credit it.
          const shares = card.value / price;
          const positions = { ...s.positions, [card.sym]: (s.positions[card.sym] ?? 0) + shares };
          return {
            pendingRewards: rest,
            positions,
            rewardsEarned: s.rewardsEarned + card.value,
            valueHistory: snapshot(s, s.cash, positions),
          };
        }),

      toggleWatch: (sym) =>
        set((s) => ({
          watchlist: s.watchlist.includes(sym) ? s.watchlist.filter((w) => w !== sym) : [...s.watchlist, sym],
        })),

      trialExpired: () => get().activeDays.length > TRIAL_DAYS,

      derivativesLeft: () => {
        const s = get();
        /*
         * CORRECTED 2026-08-07. This used to `return 0` for anyone not Pro, which contradicted
         * lib/entitlement.ts and made the You tab print "0 options previews left" to a trial user
         * who was in fact entitled to three. See §22 C19 and C26.
         *
         * The reframe that resolved it: PRO_DERIVATIVE_PREVIEW is NOT a monetisation tier. It is a
         * DATA limit — there is no options provider connected, which is why options.tsx says "More
         * arrives with a full options data plan" and why even Pro gets only three. So the cap
         * applies to everyone WITH ACCESS, and access is the thing that is gated.
         *
         * 4/4 of the reference trials grant full premium access, not metered previews:
         * Headway "full access to the Premium experience", Promova "Unlock all lessons",
         * Quizlet "Get instant access", Nibble "Start daily microlearning lessons and quizzes".
         * A trial user therefore gets the same three a Pro user gets.
         */
        if (!s.isPro && s.trialExpired()) return 0; // zero-because-locked
        return Math.max(0, PRO_DERIVATIVE_PREVIEW - s.derivativeTrades);
      },
      openDerivative: (d) =>
        set((s) => {
          if (!s.isPro) return s;
          if (s.derivativeTrades >= PRO_DERIVATIVE_PREVIEW) return s;
          if (d.premium > s.cash) return s;
          return {
            cash: s.cash - d.premium,
            derivativeTrades: s.derivativeTrades + 1,
            derivatives: [...s.derivatives, { ...d, id: `${d.sym}-${d.kind}-${d.strike}-${s.derivativeTrades}` }],
          };
        }),

      portfolioValue: () => {
        const s = get();
        const equity = Object.entries(s.positions).reduce((sum, [sym, sh]) => sum + sh * priceOf(sym), s.cash);
        /*
         * Open option contracts count too, MARKED AT COST.
         *
         * Without this, buying a $781 contract read as a straight $781 loss — the cash left but
         * the asset it bought was invisible, so the Trade tab showed "-$781.06 (7.81%) since you
         * started" the moment a contract opened. The user holds something; the portfolio has to
         * say so.
         *
         * At COST rather than marked-to-market because re-pricing needs a live chain (spot moved,
         * time decayed, vol shifted) and we do not have one. Cost means an option contributes a
         * return of exactly zero until it is priced — understated, but never invented. When the
         * Tradier chain is connected this becomes a mark against the current bid.
         */
        return s.derivatives.reduce((sum, d) => sum + d.premium, equity);
      },
      buy: (sym, shares, price) =>
        set((s) => {
          const cost = shares * price;
          // Refusing here rather than at the call site means no screen can create money by
          // forgetting to check. An unaffordable buy is a no-op, not a negative balance.
          if (shares <= 0 || cost > s.cash) return s;
          const positions = { ...s.positions, [sym]: (s.positions[sym] ?? 0) + shares };
          return { cash: s.cash - cost, positions, valueHistory: snapshot(s, s.cash - cost, positions), activeDays: withToday(s.activeDays) };
        }),
      sell: (sym, shares, price) =>
        set((s) => {
          const held = s.positions[sym] ?? 0;
          const n = Math.min(shares, held);
          if (n <= 0) return s;
          const rest = { ...s.positions };
          // Drop the key entirely at zero, so "do I hold this?" is one truthy check everywhere
          // instead of a 0-vs-undefined trap.
          if (held - n <= 0) delete rest[sym];
          else rest[sym] = held - n;
          return { cash: s.cash + n * price, positions: rest, valueHistory: snapshot(s, s.cash + n * price, rest), activeDays: withToday(s.activeDays) };
        }),
      spendAtlasMessage: () => set((s) => (s.isPro ? s : { atlasAsked: s.atlasAsked + 1, activeDays: withToday(s.activeDays) })),
      setProfile: (patch) => set((s) => ({ profile: { ...s.profile, ...patch } })),
      completeOnboarding: () =>
        set((s) => {
          const path = recommendPath(s.profile);
          return {
            profile: { ...s.profile, completedAt: Date.now() },
            // this is what makes the answers visible: Learn opens on the recommended course
            activeCourseId: path[0]?.id ?? s.activeCourseId,
          };
        }),

      signIn: () => set({ signedIn: true }),
      signOut: () => set({ signedIn: false }),
      setActiveCourse: (id) => set({ activeCourseId: id }),

      level: () => Math.floor(get().xp / XP_PER_LEVEL) + 1,
      levelProgress: () => {
        const into = get().xp % XP_PER_LEVEL;
        return { into, size: XP_PER_LEVEL, toNext: XP_PER_LEVEL - into };
      },

      minutesDoneToday: () => (get().lastActiveDay === dayKey() ? get().minutesToday : 0),
      dailyGoalMinutes: () => get().profile.dailyMinutes ?? 10,
      streakIfCompletedToday: () => nextStreak(get().streak, get().lastActiveDay),

      weeklyXpNow: () => (get().weekStart === weekKey() ? get().weeklyXp : 0),

      completeLesson: (id, xp) =>
        set((s) => {
          if (s.completedLessons.includes(id)) return s;
          const today = dayKey();
          // roll the tally over when the calendar day changed since the last completion
          const base = s.lastActiveDay === today ? s.minutesToday : 0;
          const minutes = base + MINUTES_PER_LESSON;
          // Crossing the daily commitment pays a bonus, and crossing happens exactly once per day,
          // so this cannot be farmed by finishing more lessons.
          const goal = s.profile.dailyMinutes ?? 10;
          const bonus = base < goal && minutes >= goal ? XP_DAILY_GOAL : 0;
          // Reward cards ride on the SAME dedupe as the completion itself (the `includes` guard
          // above), so re-opening a finished lesson cannot farm free stock.
          const cards = mintRewardCards(REWARD_CARDS_PER_LESSON);
          return {
            activeDays: withToday(s.activeDays),
            pendingRewards: [...s.pendingRewards, ...cards],
            completedLessons: [...s.completedLessons, id],
            ...applyXp(s, xp + bonus),
            minutesToday: minutes,
            lastActiveDay: today,
            // nothing incremented this before, so Home's pill and week strip were pinned forever
            streak: nextStreak(s.streak, s.lastActiveDay),
          };
        }),
      addXp: (n) => set((s) => applyXp(s, n)),
      follow: (id) =>
        set((s) => (s.following.includes(id) ? s : { following: [...s.following, id] })),
      unfollow: (id) => set((s) => ({ following: s.following.filter((f) => f !== id) })),
      friendIds: () => get().following.filter((id) => get().followers.includes(id)),
      claimQuestReward: () =>
        set((s) => (s.lastQuestDay === dayKey() ? s : { lastQuestDay: dayKey(), pendingRewards: [...s.pendingRewards, ...mintRewardCards(1)] })),
      awardGameXp: () =>
        set((s) => (s.lastGameDay === dayKey() ? s : { lastGameDay: dayKey(), ...applyXp(s, XP_GAME) })),
      markPostRead: (slug) =>
        set((s) => {
          // The idempotence guard is what makes this safe to pay for: [slug].tsx fires it on
          // reaching the last card, and re-reading a guide must not mint XP again.
          if (s.readPosts.includes(slug)) return s;
          const today = dayKey();
          return {
            activeDays: withToday(s.activeDays),
            readPosts: [...s.readPosts, slug],
            ...applyXp(s, XP_GUIDE),
            // A guide read counts as your day, so Digest can keep a streak alive on its own.
            streak: nextStreak(s.streak, s.lastActiveDay),
            lastActiveDay: today,
            // Rolling the tally is NOT optional next to that stamp. minutesDoneToday() gates on
            // lastActiveDay === today, so stamping today while leaving a stale minutesToday would
            // report yesterday's practice minutes as today's. A read credits no minutes of its
            // own — the daily goal measures practice, and reading is not practice.
            minutesToday: s.lastActiveDay === today ? s.minutesToday : 0,
          };
        }),
      setDailyPick: (day, slug) =>
        set((s) => (s.dailyPick?.day === day && s.dailyPick.slug === slug ? s : { dailyPick: { day, slug } })),
      reset: () => set({ xp: 0, weeklyXp: 0, weekStart: '', lastGameDay: '', following: [], streak: 0, completedLessons: [], minutesToday: 0, lastActiveDay: '', readPosts: [], dailyPick: null, cash: STARTING_CASH, positions: {}, valueHistory: [], derivativeTrades: 0, derivatives: [], pendingRewards: [], rewardsEarned: 0, watchlist: [] }),
    }),
    {
      name: 'euphoria-app-state',
      storage: createJSONStorage(() => AsyncStorage),
      // only persist data, not the action fns / derived getters
      partialize: (s) => ({ signedIn: s.signedIn, xp: s.xp, streak: s.streak, completedLessons: s.completedLessons, minutesToday: s.minutesToday, lastActiveDay: s.lastActiveDay, activeCourseId: s.activeCourseId, readPosts: s.readPosts, dailyPick: s.dailyPick, profile: s.profile, weeklyXp: s.weeklyXp, weekStart: s.weekStart, lastGameDay: s.lastGameDay, following: s.following, followers: s.followers, isPro: s.isPro, atlasAsked: s.atlasAsked, cash: s.cash, positions: s.positions, valueHistory: s.valueHistory, derivativeTrades: s.derivativeTrades, derivatives: s.derivatives, pendingRewards: s.pendingRewards, rewardsEarned: s.rewardsEarned, watchlist: s.watchlist, installId: s.installId, activeDays: s.activeDays, streakGoal: s.streakGoal, lastQuestDay: s.lastQuestDay, widgetAsksSeen: s.widgetAsksSeen, widgetAskDay: s.widgetAskDay, widgetAdded: s.widgetAdded }),
      // Fires after rehydration settles, on success AND on failure. Flipping the flag in both
      // cases is deliberate: if storage is unreadable we must still route rather than hang on a
      // blank screen forever — a new install is the correct fallback for "no readable state".
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

// Week rollover and the XP funnel are exactly where a silent drift hides: a wrong weekKey means
// standings never reset, and an award that skips applyXp means lifetime and weekly totals diverge.
// One runnable check, dev only.
if (__DEV__) {
  const eq = (got: unknown, want: unknown, what: string) => {
    if (got !== want) console.error(`[store] ${what}: got ${String(got)}, expected ${String(want)}`);
  };
  // 2026-08-03 is a Monday; every day of that week must key to it, and the next Monday must not.
  eq(weekKey(new Date('2026-08-03T12:00:00Z')), '2026-08-03', 'Monday keys to itself');
  eq(weekKey(new Date('2026-08-09T12:00:00Z')), '2026-08-03', 'Sunday still keys to that Monday');
  eq(weekKey(new Date('2026-08-10T12:00:00Z')), '2026-08-10', 'the next Monday starts a new week');

  const wk = weekKey();
  eq(applyXp({ xp: 10, weeklyXp: 5, weekStart: wk }, 50).weeklyXp, 55, 'same week accumulates');
  eq(applyXp({ xp: 10, weeklyXp: 5, weekStart: wk }, 50).xp, 60, 'lifetime always accumulates');
  eq(applyXp({ xp: 10, weeklyXp: 900, weekStart: '1999-01-04' }, 50).weeklyXp, 50, 'a stale week resets');
  eq(applyXp({ xp: 10, weeklyXp: 900, weekStart: '1999-01-04' }, 50).xp, 60, 'a stale week never resets lifetime');
}

// The follow graph has exactly two failure modes worth guarding: a double-follow that duplicates
// an id, and a relationship derived from only one of the two arrays. Both are silent.
if (__DEV__) {
  const eqR = (got: string, want: string, what: string) => {
    if (got !== want) console.error(`[follow] ${what}: got ${got}, expected ${want}`);
  };
  eqR(relationshipOf('a', [], []), 'none', 'a stranger is none');
  eqR(relationshipOf('a', ['a'], []), 'following', 'one-way out is following');
  eqR(relationshipOf('a', [], ['a']), 'follows-you', 'one-way in is follows-you');
  eqR(relationshipOf('a', ['a'], ['a']), 'friends', 'mutual is friends');
}
