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
import { applyBuy, applyGrant, applySell, clearStaticPricing } from './cost-basis';
import { signOutServer } from './auth';
import { dayBeforeKey, dayKey, nextStreak, prevDayKey, weekKey, withToday } from './day-keys';
import { resolveDay, type StreakRepair } from './streak-freeze';
import { applyStreakSafety, STREAK_SAFETY_STORE_VERSION } from './streak-safety-migration';
import { prune as pruneNotifs, type NotifEntry, type NotifKind } from './notif-budget';
import { valueOf } from './portfolio-value';
import { appendMarketPortfolioSnapshot, appendPortfolioSnapshot } from './portfolio-history';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { outcomeFor, type WeekOutcome } from './league-week';
import { TIER_UP_BONUS, tierForXp } from './league';
import { DEFAULT_AVATAR_ID } from './avatars';
import { nextAtlasTourState, type AtlasTourState } from './atlas-tour';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Profile } from './onboarding-path';
import { EMPTY_PROFILE, MINUTES_PER_LESSON, recommendPath } from './onboarding-path';
import { SEED_FOLLOWERS } from './people';
import { EARN } from './shop-items';
// The MERGED catalogue, not shop-items' own lookup: that file is the web's table verbatim and does
// not know about the items iOS added, so buying one would silently no-op.
import { allItemById as itemById } from './shop-items-extra';
import { allMarks, hydrateMarks, persistableMarks } from './marks';
import { ALL_SYMS, priceOf } from './stocks';
import { DEFAULT_AVAILABLE_COURSE_ID, isCourseAvailable } from './curriculum/availability';
import type { LessonResumePoint } from './lesson-step-session';
import { replayOnboardingOnUpgrade, backfillPaywallSeen } from './onboarding-replay-migration';
import { readSegmentRecord, type SegmentKind, type SegmentRecord } from './lesson-segments';
import {
  ALL_SEGMENT_KINDS,
  MAX_MINUTES_PER_LESSON,
  MIN_MINUTES_PER_LESSON,
  XP_DAILY_GOAL,
  creditSegment,
  lessonMinutesRemaining,
  lessonXpRemainder,
  withoutSegmentRecord,
  type SegmentCreditResult,
} from './lesson-segment-credit';

const XP_PER_LEVEL = 500;

/** Hearts, mirroring the web's `heart_refill` metadata ({ hearts: 5 }). */
const MAX_HEARTS = 5;

/* MIN_MINUTES_PER_LESSON and MAX_MINUTES_PER_LESSON were defined here, module-private. They moved
 * to `lesson-segment-credit.ts` because a lesson now pays in parts and the ceiling has to be
 * shared: left private here, the per-part credit would have carried its own 30 and a three-part
 * lesson could have credited 90 minutes against a ten-minute goal. Their docblock moved with them. */

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
 * Default hour for the daily nudge. Evening, not morning: the nudge exists to rescue a streak
 * before the day ends, which is only actionable while there is still time to do a five-minute
 * lesson. Defined HERE rather than in lib/notifications so the store does not import the module
 * that imports the store — same direction rule as TRIAL_DAYS above.
 */
export const DEFAULT_NUDGE_HOUR = 19;

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

// Re-exported: screens already import these from the store, and the rules now live in
// `day-keys.ts` so a regression can pin them.
export { dayKey, shouldCountReturn, weekKey } from './day-keys';

/** Stable id for one curriculum lesson inside `completedLessons`. */
export const lessonKey = (courseId: string, num: number) => `${courseId}:${num}`;

/**
 * Longest display name. 18 fits the league row and the profile banner at the largest Dynamic Type
 * step without truncating, which is the constraint that actually matters — a name that ellipsises
 * on the leaderboard is worse than one the owner had to shorten themselves.
 */
export const NAME_MAX = 18;

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
/*
 * XP_DAILY_GOAL is DEFINED in `lesson-segment-credit.ts` and re-exported here, so every existing
 * importer keeps working. Both paths that pay it — `completeLesson` below and the per-part credit
 * — now need the number, and a second literal is a second source of truth (§6.3). Defining it
 * there also lets the Node regression import the real bonus instead of restating 50 in a fixture
 * that would never notice the day it changed.
 */
export { XP_DAILY_GOAL };

/**
 * Apply an XP award to BOTH counters, rolling the weekly tally over when the week has changed.
 *
 * EVERY award funnels through here. If a caller ever writes `xp` directly, lifetime and weekly
 * totals drift apart and the league silently ranks people on stale numbers.
 */
/**
 * Append a portfolio-value snapshot. Capped so a heavy trader cannot grow the persisted blob
 * without bound; 500 points is far more than any chart draws.
 *
 * MUST VALUE THE SAME THINGS `portfolioValue()` DOES. It did not, and that was a real defect:
 * `portfolioValue` counts open option contracts at cost, this counted only cash and shares. So the
 * headline said $10,003.28 while the chart's newest point sat at $9,222.22 — the exact premium of
 * one open contract, $781.06, missing from one of them. The Trade tab then rendered
 * "−$777.78 (7.78%) all time" underneath a portfolio that had not lost anything, permanently, for
 * anyone who ever opened a contract.
 *
 * The comment on `portfolioValue` already describes this bug and fixes it THERE. The fix never
 * reached here, because the value was computed twice from two different formulas. Same rule now
 * lives in both: contracts count at COST, so an option contributes a return of exactly zero until
 * it can be priced — understated, never invented.
 *
 * `derivatives` is a parameter rather than read off `s` because `openDerivative` snapshots with the
 * list it is in the middle of appending to; reading `s.derivatives` there would miss the new one.
 */
const snapshot = (
  s: { valueHistory: { t: number; v: number }[]; derivatives: { premium: number }[] },
  cash: number,
  positions: Record<string, number>,
  derivatives: { premium: number }[] = s.derivatives,
) => {
  return appendPortfolioSnapshot(s.valueHistory, { cash, positions, derivatives, priceOf });
};

const applyXp = (
  s: { xp: number; weeklyXp: number; weekStart: string; pendingTierUp: string | null },
  n: number,
) => {
  const wk = weekKey();
  const carried = s.weekStart === wk ? s.weeklyXp : 0;
  const xp = s.xp + n;
  /*
   * TIER CROSSINGS ARE DETECTED HERE, in the one function every XP award already routes through,
   * for the same reason the awards themselves were centralised: an award that skips applyXp makes
   * lifetime and weekly totals diverge, and one that skipped this would silently swallow the
   * milestone. There is no second place to remember.
   *
   * `?? s.pendingTierUp` is load bearing: returning null on a non-crossing award would CLEAR a
   * milestone the user has not seen yet — finish a lesson that promotes you, earn a game bonus
   * before opening Home, and the celebration is gone forever.
   *
   * Paid on claim, not here. One caller sets `coins` immediately before spreading this
   * (`coins: s.coins + EARN.gameWinMin, ...applyXp(...)`), so returning coins from applyXp would
   * silently override it and eat that award.
   */
  const crossed = tierForXp(xp).name !== tierForXp(s.xp).name;
  return {
    xp,
    weeklyXp: carried + n,
    weekStart: wk,
    pendingTierUp: crossed ? tierForXp(xp).name : s.pendingTierUp,
  };
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
  /** Longest streak ever reached. The one number that survives a broken streak — and therefore the
   *  reason to start again rather than only the record of having stopped. Never decreases. */
  bestStreak: number;
  completedLessons: string[];
  /** Minutes practised on `lastActiveDay`. Read via `minutesDoneToday()`, which zeroes it once
   *  the day rolls over — don't read this field directly. */
  minutesToday: number;
  /**
   * Lessons finished on `lastActiveDay`. Counted, not inferred.
   *
   * quests.ts used to derive this as `minutesToday / MINUTES_PER_LESSON`, which was only ever
   * correct while every lesson credited exactly the same fixed number of minutes. It no longer
   * does — `completeLesson` credits real elapsed time — so the division would have quietly
   * reported the wrong number of lessons the moment a lesson took anything other than 5 minutes.
   */
  lessonsToday: number;

  /**
   * Where the learner is inside a lesson they have not finished, or null.
   *
   * THE ONLY piece of lesson position that survives the process. Everything else the runner holds
   * (a graded pick, a half-completed drag, monotonic per-step completion) is session state and
   * dies with the mount, deliberately: see the long note above LessonResumePoint in
   * lesson-step-session.ts for why restoring child widget state would be worse than not.
   *
   * Written by lesson.tsx on every screen change and cleared by `completeLesson`, including on a
   * REPEAT of an already finished lesson, which the dedupe below would otherwise skip. A pointer
   * left behind by a completed lesson is exactly how "Continue" drops you back onto the last step
   * of something you already finished.
   */
  lessonResume: LessonResumePoint | null;
  /** Remember a position. Pass null to forget one; lesson.tsx does that on the terminal screens. */
  setLessonResume: (point: LessonResumePoint | null) => void;

  /**
   * Which PARTS of an unfinished lesson have already been paid, keyed by `lessonKey`.
   *
   * KEYED BY KIND, NOT POSITION. A curriculum sync can add or remove a lesson's keyTermsCards
   * screen, which moves every boundary; a record of "parts 0 and 1 are done" would then credit or
   * re-charge the wrong screens, silently. A record of "learn and vocab are done" survives it.
   *
   * IN-PROGRESS LESSONS ONLY. `completeLesson` deletes the entry, and both writers refuse a lesson
   * already in `completedLessons`, so this map cannot grow past the lessons someone started and
   * did not finish. `completedLessons` keeps its old meaning — EVERY part done — which is what
   * leaves all ~25 of its readers (the path flags, the unlock rule, Home's next, the quest, the
   * gate sheet) untouched by parts.
   *
   * There is NO store version bump behind this. An already finished lesson needs nothing written:
   * `segmentsDoneFor` answers every kind from `completedLessons`. An in-progress one cannot be
   * backfilled inside `migrate`, which is synchronous while the segment boundaries need the
   * lesson's runtime steps from the async `loadCourseLessons` — a version-gated backfill would
   * have had to guess them. `adoptLegacySegments` does it lazily instead, on first open.
   */
  lessonSegments: Record<string, SegmentRecord>;
  /**
   * Credit ONE non-final part. Returns what actually happened (§6.5) so the runner can draw the
   * card and fire one event; a repeat returns `credited: false` and pays nothing.
   */
  completeLessonSegment: (id: string, kind: SegmentKind, share: number, minutesSpent: number) => SegmentCreditResult;
  /** Adopt a pre-parts resume pointer as finished parts. PAYS NOTHING — see `lessonSegments`. */
  adoptLegacySegments: (id: string, kinds: SegmentKind[]) => void;
  /** Parts already done. A finished lesson answers every kind, with no record needed. */
  segmentsDoneFor: (id: string) => SegmentKind[];
  /** XP the final part still owes, for the DONE screen and the Collect button. Showing the
   *  lesson's full XP there would announce the Learn and Vocab awards a second time. */
  lessonXpRemaining: (id: string, xp: number) => number;

  /* ── EUPHORIUM (N21) ────────────────────────────────────────────────────────
   * The in-app currency, ported from the web Shop. RULE ZERO: rates and prices come from
   * lib/shop-items.ts, which is the web's table verbatim — never re-derived here.
   *
   * DEVICE-LOCAL, and the Shop screen says so out loud. The web wallet lives in Supabase
   * (`profiles.coins`, `user_inventory`, `active_powerups`, `coin_transactions`) behind an account.
   * iOS now has accounts too, but this balance still cannot sync until the two clients share one
   * ledger. Owner's call, 2026-08-23, on condition it is stated in the UI rather than hidden — the
   * same standard applied to the practice profiles on Friends.
   */
  /** Euphorium balance. */
  coins: number;
  /** Owned shop item ids. Cosmetics stay owned forever; consumables are counted separately. */
  inventory: string[];
  /** Epoch ms until which XP is doubled, or 0. A timestamp, not a boolean, so it survives a restart. */
  doubleXpUntil: number;
  /** Unspent streak freezes. */
  streakFreezes: number;
  /** Unspent hints. */
  hints: number;
  /** Hearts remaining. Refills on a new day, or by buying a refill. */
  hearts: number;
  /** Day key the hearts were last topped up on, so they refill once per day and not per render. */
  heartsDay: string;
  /** Equipped cosmetics by slot. Slot names come from the web items' own metadata. */
  equipped: { hat?: string; accessory?: string; theme?: string; frame?: string; badge?: string };

  awardCoins: (n: number) => void;
  /** Returns false when the balance is short or the item is already owned. */
  buyItem: (id: string) => boolean;
  equipItem: (id: string) => void;
  unequipSlot: (slot: 'hat' | 'accessory' | 'theme' | 'frame' | 'badge') => void;
  spendHint: () => boolean;
  loseHeart: () => void;
  heartsNow: () => number;
  xpMultiplier: () => number;
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
  /**
   * UNIT 15a. The hour the daily nudge fires. Was a hardcoded 19 that nobody was ever asked about
   * — Headway `128567` captures the TIME before the system prompt, which is what makes the prompt
   * convertible: the user has already chosen when, so iOS is only asking whether.
   */
  nudgeHour: number;
  /**
   * Every notification this app has scheduled in the last week, so the frequency budget survives
   * a restart. Without persistence the cap resets on every cold start, which is exactly how an
   * app that believes it sends two a day sends eight.
   */
  notifLedger: NotifEntry[];
  recordNotif: (kind: NotifKind, at: number) => void;
  setNudgeHour: (h: number) => void;
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
  signOut: () => Promise<void>;
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
  /** What finishing a lesson now would do to the streak (freeze, repair, milestone freeze). */
  streakPreview: () => ReturnType<typeof resolveDay>;
  /** The streak as it stands right now, before today's activity: 0 once a break has happened
   *  (the stored value only resolves on the next activity), plus any earn-back that is or would
   *  be open. Primitives only, so a component can select it with useShallow. */
  streakNow: () => { streak: number; repairLost: number; repairLeft: number; repairDeadline: number };
  /** Open earn-back window after a break, or null. */
  streakRepair: StreakRepair | null;
  /** Highest freeze milestone already paid in the current run. */
  freezeMilestoneRun: number;
  /** Lifetime XP earned this league week. Drives STANDINGS (promote/demote) while `xp` drives the
   *  permanent tier, so a quiet week costs you rank but never costs you the tier you earned. */
  weeklyXp: number;
  /** Monday of the week `weeklyXp` belongs to. */
  weekStart: string;
  /** Weekly XP, zeroed once the week rolls over. Derived at read time for the same reason
   *  `minutesDoneToday` is: no timer and no foreground listener needed. */
  weeklyXpNow: () => number;
  /** The `weekStart` whose result has already been paid. Guards against paying a week twice —
   *  `resolveLeagueWeek` runs on every Home mount, so it WILL be called repeatedly. */
  lastWeekResolved: string;
  /** Last week's finishing position and bonus, for the league screen to show. Null until a week
   *  has actually finished, which is not the same as "no weeks played". */
  lastWeekOutcome: WeekOutcome | null;
  /**
   * Close out a finished league week: pay the zone bonus, record the result, start a clean week.
   *
   * Before this existed, `applyXp` simply carried zero forward at the week boundary, so a finished
   * week was discarded rather than resolved and the PROMOTION ZONE on the league screen paid
   * nothing. See league-week.ts.
   */
  resolveLeagueWeek: () => void;
  /**
   * N22 — "Add Light Mode / Dark Mode + other color preferences".
   *
   * DEFAULTS TO DARK, NOT TO THE DEVICE. `system` was the first default and it was wrong: it put
   * everyone whose phone is set to Light into a light app they never asked for, on a brand that is
   * dark-first. Owner's call on sight of it, and the right one — the option still exists for
   * anyone who wants it, it is just no longer imposed.
   *
   * `system` remains SELECTABLE. Removing it would be an overcorrection: someone who deliberately
   * wants the app to follow their phone should be able to say so.
   */
  themePref: 'system' | 'light' | 'dark';
  setThemePref: (v: 'system' | 'light' | 'dark') => void;
  /**
   * The pixel avatar the player chose for themselves. An id into lib/avatars, not a sprite, so the
   * persisted blob stays a plain string and the art can be re-drawn without a migration.
   */
  avatarId: string;
  setAvatarId: (id: string) => void;
  /**
   * The achievement whose TITLE you are wearing, or '' for none. An achievement id rather than the
   * word itself, so the copy can be rewritten without a migration, and so a title you no longer
   * qualify for stops rendering on its own rather than persisting a claim you cannot back up.
   */
  titleId: string;
  /** Chosen profile banner. Falls back to the default if the id is unknown — see banners.ts. */
  bannerId: string;
  setBannerId: (id: string) => void;
  /**
   * Rename yourself. Trimmed and capped at NAME_MAX here rather than at the input, so every future
   * caller inherits the same rule — a validation that lives in one text field is a validation that
   * the next screen forgets. An empty result is REJECTED rather than stored: a blank name would
   * render an anonymous profile with no way back to a real one from the UI.
   */
  setDisplayName: (name: string) => void;
  setTitleId: (id: string) => void;
  /**
   * Best score per game id. The thing that makes a 60-second game worth a second run — without a
   * number to beat, a score is a receipt for time already spent.
   *
   * Keyed by game id rather than a field per game, so a new game needs no store change at all.
   */
  gameBest: Record<string, number>;
  /** Records a run. Only ever raises the best, so a bad run cannot erase a good one. */
  recordGameScore: (gameId: string, score: number) => void;
  /** A tier crossed but not yet celebrated. Persisted, so closing the app cannot swallow it. */
  pendingTierUp: string | null;
  /** Show the celebration, pay TIER_UP_BONUS, clear it. Idempotent: a second call pays nothing. */
  claimTierUp: () => void;
  /** Local day the game bonus was last paid, '' if never. */
  lastGameDay: string;
  /**
   * Guides finished today, as a SELF-CONTAINED (day, count) pair — deliberately not folded into
   * the `lastActiveDay` family.
   *
   * `lessonsToday` and `minutesToday` roll off `lastActiveDay`, which means EVERY writer that
   * stamps that field has to remember to roll them too; store.ts already carries a comment about
   * exactly that trap. Adding a third rider would put the same bug one forgotten writer away:
   * read a guide Monday, do a lesson first thing Tuesday, and Tuesday's guide quest would already
   * read as done. Carrying its own day stamp makes the reader `guidesDay === dayKey() ? n : 0`,
   * which is self-healing and has precisely one writer. Same shape as `heartsDay`/`hearts`.
   */
  guidesDay: string;
  guidesToday: number;
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
  /** Perf HUD. SESSION ONLY, deliberately absent from `partialize`: a diagnostic overlay that
   *  survived a relaunch would be a way to ship a permanently visible HUD to a real user by
   *  accident. Off by default, so an OTA carrying this is invisible until someone opts in. */
  perfHud: boolean;
  setPerfHud: (v: boolean) => void;
  isPro: boolean;
  setPro: (v: boolean) => void;
  /** Epoch ms the 17d dismissal offer was shown, or null. A STAMP rather than a boolean so we can
   *  later ask "how long ago" without a migration.
   *
   *  ONCE PER INSTALL, EVER. The evidence (Yazio, Numify) shows apps re-prompting — both push a
   *  second spin — but a better offer that reappears on every dismissal is not an offer, it is
   *  nagging, and on a HARD wall the gate sheet is already the only thing between the user and the
   *  app. Deliberately NOT cleared by `reset()`: replaying onboarding must not mint a fresh
   *  discount. */
  specialOfferSeenAt: number | null;
  markSpecialOfferSeen: () => void;
  /** 17c. The trial reward offer, fired off the first completed lesson inside the trial.
   *
   *  SAME once-per-install rule as `specialOfferSeenAt`, and deliberately NOT cleared by `reset()`
   *  for the same reason: replaying onboarding must not mint a fresh discount. Separate field
   *  rather than a shared "offerSeenAt", because the two offers fire at opposite ends of the trial
   *  — 17c on a win inside it, 17d on a wall after it — and a user who declined one has not
   *  declined the other. */
  trialRewardSeenAt: number | null;
  markTrialRewardSeen: () => void;
  /**
   * Has the Atlas app tour run? See lib/atlas-tour.ts for the beats and the gate.
   *
   * A THREE-STATE FLAG, NOT A BOOLEAN, and `armed` is the whole reason. The app is already on the
   * App Store, so a plain `hasSeenTour: false` default would have played a new-user walkthrough to
   * every existing member on the next update. A persisted blob with no `atlasTour` key rehydrates
   * to `unseen` and stays there forever; only finishing onboarding moves it to `armed`, and only
   * finishing or skipping the tour moves it to `seen`.
   *
   * Every transition goes through `nextAtlasTourState`, so "arm never overwrites seen" is one rule
   * in one pure function the regression can check, rather than a condition repeated at two call
   * sites that can drift apart.
   */
  atlasTour: AtlasTourState;
  armAtlasTour: () => void;
  markAtlasTourSeen: () => void;
  /** 17e. Apple is retrying this member's payment. Written ONLY by lib/purchases from a successful
   *  customerInfo read, same authority rule as `isPro`.
   *
   *  Persisted, because the app must be able to say "there is a problem with your card" on a cold
   *  start BEFORE RevenueCat answers — that first screen is often the whole window in which
   *  somebody is willing to go and fix it. */
  billingIssue: boolean;
  setBillingIssue: (v: boolean) => void;
  /* `canAccessLesson` and `freeLessonsLeft` USED TO LIVE HERE and are deliberately gone (§22 C27).
     Lessons are no longer count-limited at all, so a getter answering "how many lessons are left"
     had no honest answer to give. The one question — may this user open a lesson — is
     `entitled(s, 'lesson')` in lib/entitlement.ts, which is also the only thing that knows about
     expiry. Two authorities disagreeing about an allowance is exactly the C19 defect Unit 3 existed
     to remove; this keeps it at one. */
  /** Uninvested paper cash. Real state: every number on the Trade tab derives from this and
   *  `positions`, so nothing there can drift from what the user actually did. */
  cash: number;
  /**
   * Persisted live marks, Phase 16. The live copy lives in `lib/marks.ts` (a module map, because
   * `stocks.ts` cannot import this file without a cycle); this field exists ONLY so the marks
   * survive the app being killed. Without it, a cold start reverts every position to the static
   * table — a portfolio-wide reprice that looks exactly like a normal launch.
   */
  marks: Record<string, number>;
  /** Shares held, by ticker. Absent or 0 means no position. */
  positions: Record<string, number>;
  /**
   * TOTAL DOLLARS PAID for the shares currently held, by ticker. Average-cost method: a second buy
   * adds to it, a sell reduces it proportionally, and it is deleted with the position.
   *
   * WHY IT EXISTS. The Trade tab rendered `STOCKS[sym].chg` beside every position — a HARDCODED
   * field on the stock, identical for every user regardless of what they paid. NVDA showed "+3.1%"
   * to somebody who had just bought it at the same price it still trades at, whose real return was
   * 0.0%. A number the user reads as "my gain" that is computed from something else entirely: the
   * same class of defect as §22 C100, where the chart and the headline valued different portfolios.
   *
   * Without a basis there is nothing to subtract from, so the truthful percentage was not merely
   * wrong, it was uncomputable. This is what makes it computable.
   *
   * ABSENT for positions opened before this existed, and there the UI shows no percentage rather
   * than guessing one. Reward stock is booked at its grant value, so free shares start at 0% rather
   * than infinity.
   *
   * The average-cost rule — in particular that a PARTIAL SELL retires the same fraction of the basis
   * as of the shares, leaving the average per share unchanged — is pinned by
   * `scripts/cost-basis-regression.mjs`.
   */
  costBasis: Record<string, number>;
  /** Total paper account value: cash + every position marked at its current price. */
  portfolioValue: () => number;
  /** Record the current marked value after a successful market-data refresh. */
  recordPortfolioSnapshot: () => void;
  /** Buy at `price`. No-op when the cash is not there — the caller must not have to check. */
  buy: (sym: string, shares: number, price: number) => void;
  /** Sell at `price`. Clamped to what is actually held, so it cannot go short by accident. */
  sell: (sym: string, shares: number, price: number) => void;
  /** Portfolio value snapshots, oldest first. Written on trades and successful mark refreshes.
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
  /**
   * The last local day a `day_return` was counted. Separate from `activeDays` on purpose: that set
   * is written by real USE, so it cannot also serve as "already counted a return today" — the gap
   * between launching and doing anything is exactly where the double-count lived.
   */
  lastReturnDay: string;
  /** Stamp today as counted, so the rest of the day's launches are not returns. Idempotent. */
  markReturnCounted: () => void;
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
  /** `minutesSpent` is real elapsed time in the lesson; omitted, it falls back to the old
   *  MINUTES_PER_LESSON constant. Clamped by the implementation. */
  completeLesson: (id: string, xp: number, minutesSpent?: number) => void;
  addXp: (n: number) => void;
  markPostRead: (slug: string) => void;
  setDailyPick: (day: string, slug: string) => void;
  reset: () => void;
  /**
   * ACCOUNT DELETION, for App Store Guideline 5.1.1(v): an app that supports account creation must
   * offer deletion inside the app. Euphoria's account is device-local, so this is the whole account.
   *
   * Clears everything `reset()` does AND the identity itself: name, handle, email, the provider that
   * proved it, the avatar, worn cosmetics and every onboarding answer.
   *
   * DELIBERATELY KEEPS `installId`, `isPro` and the trial clock, for the same reason `reset()` does
   * and the store already documents: if deleting a profile restarted the trial, the trial would be a
   * button rather than a limit. Those three are not identity, they are entitlement and rate-limit
   * bookkeeping, and none of them names a person.
   */
  deleteProfile: () => void;
};

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      signedIn: false,
      // A new install has done nothing yet. These were demo literals; `reset()` below already
      // treated 0/0 as the clean state, so the initial values simply disagreed with it.
      xp: 0,
      streak: 0,
      bestStreak: 0,
      completedLessons: [],
      minutesToday: 0,
      lessonsToday: 0,
      lessonResume: null,
      lessonSegments: {},
      coins: 0,
      inventory: [],
      doubleXpUntil: 0,
      // One free freeze to start: a first missed day should not cost a brand-new streak.
      streakFreezes: 1,
      streakRepair: null,
      freezeMilestoneRun: 0,
      hints: 0,
      hearts: MAX_HEARTS,
      heartsDay: '',
      equipped: {},
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
      // 19:00 stays the DEFAULT for the same reason it was the constant: evening, so a nudge is
      // still actionable. It is now a starting point rather than a decision made on the user's behalf.
      nudgeHour: DEFAULT_NUDGE_HOUR,
      notifLedger: [],
      // Prunes on every write, so the ledger cannot grow without bound on a long-lived install.
      recordNotif: (kind, at) =>
        set((s) => ({ notifLedger: pruneNotifs([...s.notifLedger, { at, kind }], at) })),
      setNudgeHour: (h) => {
        set({ nudgeHour: Math.max(0, Math.min(23, Math.round(h))) });
      },
      lastActiveDay: '',
      activeCourseId: 'investing-fundamentals',
      readPosts: [],
      dailyPick: null,
      profile: EMPTY_PROFILE,
      hasHydrated: false,
      weeklyXp: 0,
      weekStart: '',
      themePref: 'dark',
      avatarId: DEFAULT_AVATAR_ID,
      titleId: '',
      bannerId: 'slate',
      gameBest: {},
      lastWeekResolved: '',
      lastWeekOutcome: null,
      pendingTierUp: null,
      lastGameDay: '',
      guidesDay: '',
      guidesToday: 0,
      lastQuestDay: '',
      following: [],
      /*
       * NOT PERSISTED, deliberately — see partialize. `followers` has exactly one writer, this
       * seed. `follow()` appends only to `following`, and nothing anywhere writes `followers`, so
       * a persisted copy can only ever hold whatever the seed was on the day of install.
       *
       * That mattered on 2026-08-22: emptying SEED_FOLLOWERS stops NEW installs claiming that
       * invented people follow you, but every EXISTING install had ['priya','chris'] already in
       * AsyncStorage and would have kept it forever. Dropping it from partialize re-seeds from here
       * on every launch, which clears it everywhere without a migration.
       *
       * IF A BACKEND EVER WRITES THIS, it must go back into partialize in the same commit — from
       * that moment the persisted copy stops being derivable from a constant.
       */
      followers: SEED_FOLLOWERS,
      isPro: false,
      specialOfferSeenAt: null,
      trialRewardSeenAt: null,
      atlasTour: 'unseen',
      billingIssue: false,

      setHasHydrated: (v) => set({ hasHydrated: v }),
      perfHud: false,
  setPerfHud: (v) => set({ perfHud: v }),
  setPro: (v) => set({ isPro: v }),
      markSpecialOfferSeen: () => set((s) => (s.specialOfferSeenAt ? s : { specialOfferSeenAt: Date.now() })),
      markTrialRewardSeen: () => set((s) => (s.trialRewardSeenAt ? s : { trialRewardSeenAt: Date.now() })),
      // Both return the same state object when nothing changes, so zustand skips the notify and an
      // effect that fires twice cannot re-arm or re-mark.
      armAtlasTour: () => set((s) => {
        const next = nextAtlasTourState(s.atlasTour, 'arm');
        return next === s.atlasTour ? s : { atlasTour: next };
      }),
      markAtlasTourSeen: () => set((s) => {
        const next = nextAtlasTourState(s.atlasTour, 'seen');
        return next === s.atlasTour ? s : { atlasTour: next };
      }),
      setBillingIssue: (v) => set({ billingIssue: v }),

      cash: STARTING_CASH,
      positions: {},
      costBasis: {},
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
      marks: {},
      // Cap is TRIAL_DAYS + 1 (4). One past the limit is all `tier()` needs to say "expired";
      // keeping more would grow forever for no reader.
      markActiveDay: () => set((s) => ({ activeDays: withToday(s.activeDays) })),
      lastReturnDay: '',
      markReturnCounted: () => {
        set({ lastReturnDay: dayKey() });
      },
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
          // Booked at the grant value, not at zero — see applyGrant.
          const { positions, costBasis } = applyGrant(s, card.sym, shares, card.value);
          return {
            pendingRewards: rest,
            positions,
            costBasis,
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
          const derivatives = [...s.derivatives, { ...d, id: `${d.sym}-${d.kind}-${d.strike}-${s.derivativeTrades}` }];
          return {
            cash: s.cash - d.premium,
            derivativeTrades: s.derivativeTrades + 1,
            derivatives,
            // Opening a contract wrote no snapshot at all, so the chart had no point for the one
            // event most likely to move the line. Worse, the NEXT trade's snapshot picked up the
            // reduced cash while the contract that consumed it was invisible, which is how the
            // drop got recorded as a loss. Snapshot here, with the list including the new contract.
            valueHistory: snapshot(s, s.cash - d.premium, s.positions, derivatives),
            activeDays: withToday(s.activeDays),
          };
        }),

      /*
       * The rule lives in `lib/portfolio-value.ts` and this reads it. It used to be spelled out
       * here AND inside `snapshot()` above, and those two copies had already diverged once — the
       * headline counted open contracts, the chart did not, and the Trade tab showed a permanent
       * loss to anyone who ever opened one. See that file for the full account.
       */
      portfolioValue: () => {
        const s = get();
        return valueOf(s.cash, s.positions, s.derivatives, priceOf);
      },
      recordPortfolioSnapshot: () =>
        set((s) => ({
          valueHistory: appendMarketPortfolioSnapshot(s.valueHistory, {
            cash: s.cash,
            positions: s.positions,
            derivatives: s.derivatives,
            priceOf,
          }),
        })),
      buy: (sym, shares, price) =>
        set((s) => {
          const cost = shares * price;
          // Refusing here rather than at the call site means no screen can create money by
          // forgetting to check. An unaffordable buy is a no-op, not a negative balance.
          if (shares <= 0 || cost > s.cash) return s;
          // The holdings math lives in lib/cost-basis.ts — ONE copy, imported by the regression
          // script too. §22 C113: the partial-basis fix previously had to be written twice.
          const { positions, costBasis } = applyBuy(s, sym, shares, cost);
          return { cash: s.cash - cost, positions, costBasis, valueHistory: snapshot(s, s.cash - cost, positions), activeDays: withToday(s.activeDays) };
        }),
      sell: (sym, shares, price) =>
        set((s) => {
          // `sold` comes back from applySell because the clamp lives there; re-deriving it here
          // would be the same rule written twice, which is what §22 C113 is about.
          const { positions, costBasis, sold } = applySell(s, sym, shares);
          if (sold <= 0) return s;
          const cash = s.cash + sold * price;
          return { cash, positions, costBasis, valueHistory: snapshot(s, cash, positions), activeDays: withToday(s.activeDays) };
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
      signOut: async () => {
        try {
          await signOutServer();
        } finally {
          set({ signedIn: false });
        }
      },
      // Availability is enforced at the state boundary so a stale screen, deep link, or future
      // caller cannot activate an unknown or not-yet-reviewed course id.
      setActiveCourse: (id) => {
        if (isCourseAvailable(id)) set({ activeCourseId: id });
      },

      level: () => Math.floor(get().xp / XP_PER_LEVEL) + 1,
      levelProgress: () => {
        const into = get().xp % XP_PER_LEVEL;
        return { into, size: XP_PER_LEVEL, toNext: XP_PER_LEVEL - into };
      },

      minutesDoneToday: () => (get().lastActiveDay === dayKey() ? get().minutesToday : 0),
      dailyGoalMinutes: () => get().profile.dailyMinutes ?? 10,
      streakIfCompletedToday: () => nextStreak(get().streak, get().lastActiveDay),
      streakNow: () => {
        const s = get();
        const today = dayKey();
        const alive =
          s.lastActiveDay === '' ||
          s.lastActiveDay === today ||
          s.lastActiveDay === prevDayKey() ||
          (s.lastActiveDay === dayBeforeKey() && s.streakFreezes > 0);
        const open = s.streakRepair && Date.now() <= s.streakRepair.deadline ? s.streakRepair : null;
        const rep = alive
          ? open
          : resolveDay({ streak: s.streak, lastActiveDay: s.lastActiveDay, today, yesterday: prevDayKey(), dayBefore: dayBeforeKey(), freezes: 0, repair: s.streakRepair, milestoneRun: s.freezeMilestoneRun, now: Date.now(), isLesson: false }).repair;
        return {
          streak: alive ? s.streak : 0,
          repairLost: rep?.lost ?? 0,
          repairLeft: rep ? rep.need - rep.done : 0,
          // Only a window that is actually OPEN has a deadline. A would-open one is computed from
          // Date.now() and would change on every call, re-rendering subscribers forever.
          repairDeadline: open && rep === open ? open.deadline : 0,
        };
      },
      streakPreview: () => {
        const s = get();
        return resolveDay({
          streak: s.streak,
          lastActiveDay: s.lastActiveDay,
          today: dayKey(),
          yesterday: prevDayKey(),
          dayBefore: dayBeforeKey(),
          freezes: s.streakFreezes,
          repair: s.streakRepair,
          milestoneRun: s.freezeMilestoneRun,
          now: Date.now(),
          isLesson: true,
        });
      },

      weeklyXpNow: () => (get().weekStart === weekKey() ? get().weeklyXp : 0),

      setThemePref: (v) => set({ themePref: v }),

      setAvatarId: (id) => set({ avatarId: id }),

      setTitleId: (id) => set({ titleId: id }),
      setBannerId: (id) => set({ bannerId: id }),
      setDisplayName: (name) =>
        set((st) => {
          const clean = name.trim().slice(0, NAME_MAX);
          return clean ? { profile: { ...st.profile, name: clean } } : st;
        }),

      recordGameScore: (gameId, score) =>
        set((st) => (score > (st.gameBest[gameId] ?? 0) ? { gameBest: { ...st.gameBest, [gameId]: score } } : st)),

      claimTierUp: () =>
        // Guarded rather than trusting the caller: the sheet's dismiss and its button can both
        // fire, and paying twice for one crossing is exactly the kind of thing nobody notices.
        set((s) => (s.pendingTierUp ? { coins: s.coins + TIER_UP_BONUS, pendingTierUp: null } : s)),

      resolveLeagueWeek: () =>
        set((s) => {
          const wk = weekKey();
          /*
           * Three ways there is nothing to do, and all three are normal rather than exceptional:
           * a user who has never earned XP has no weekStart at all; a user mid-week is not
           * finished; and a week already paid must never pay again. Returning `s` unchanged means
           * zustand skips the notify, so calling this on every Home mount is free.
           */
          if (!s.weekStart || s.weekStart === wk || s.lastWeekResolved === s.weekStart) return s;
          const outcome = outcomeFor(s.weekStart, s.weeklyXp);
          return {
            coins: s.coins + outcome.coins,
            lastWeekResolved: s.weekStart,
            lastWeekOutcome: outcome,
            // Start the new week here rather than leaving it to the next XP award, so the board
            // reads 0 immediately instead of showing last week's total until you earn something.
            weeklyXp: 0,
            weekStart: wk,
          };
        }),

      /**
       * `minutes` is REAL ELAPSED TIME in the lesson, not a constant.
       *
       * Reported 2026-08-22: "it looks like the app measures time based on the lesson's listed
       * duration, not actual time spent in-app. After finishing a lesson it shows 5 minutes even
       * if you were on the app much longer." Exactly right — this added MINUTES_PER_LESSON (5)
       * per completion no matter what, so the daily goal was counting lessons and calling them
       * minutes. A four-minute lesson and a twenty-minute one paid the same.
       *
       * CLAMPED, because elapsed wall-clock is not the same as time spent. A lesson left open
       * while the phone is in a pocket would otherwise credit hours against a ten-minute goal.
       * The floor keeps a fast, genuine completion from paying nothing.
       *
       * Optional with the old constant as its default, so a caller that omits it degrades to the
       * previous behaviour rather than crediting zero.
       */
      setLessonResume: (point) => set({ lessonResume: point }),
      completeLesson: (id, xp, minutesSpent) =>
        set((s) => {
          /*
           * THE RESUME POINTER DIES WITH THE ATTEMPT, and it has to die on BOTH paths out of this
           * reducer. The dedupe below makes a repeat of an already finished lesson a no-op, so
           * clearing only inside the credited branch would leave a pointer behind whenever someone
           * replayed a lesson they had already done. The next open of that lesson would then skip
           * straight to its last step, which is the "stuck re-entering a finished lesson" state.
           */
          const lessonResume = s.lessonResume?.key === id ? null : s.lessonResume;
          if (s.completedLessons.includes(id)) {
            return lessonResume === s.lessonResume ? s : { lessonResume };
          }
          /*
           * WHAT THE PARTS ALREADY PAID. A lesson now finishes in two or three parts and the
           * earlier ones credited XP and minutes when their cards appeared. Without this read the
           * final screen would pay the lesson's full XP a second time, so a three-part lesson
           * would be worth roughly double a one-part one and nothing on screen would say so.
           *
           * The early return above needs no deletion of the record: both writers refuse a lesson
           * already in `completedLessons`, so a completed lesson can never hold one.
           */
          const seg = readSegmentRecord(s.lessonSegments[id]);
          const today = dayKey();
          // roll the tally over when the calendar day changed since the last completion
          const base = s.lastActiveDay === today ? s.minutesToday : 0;
          const earned = Math.min(
            MAX_MINUTES_PER_LESSON,
            Math.max(MIN_MINUTES_PER_LESSON, Math.round(minutesSpent ?? MINUTES_PER_LESSON)),
            // and never past what the parts of THIS lesson have already credited, or a three-part
            // lesson could pay 30 minutes three times over against a ten-minute daily goal
            lessonMinutesRemaining(seg),
          );
          const minutes = base + earned;
          // Crossing the daily commitment pays a bonus, and crossing happens exactly once per day,
          // so this cannot be farmed by finishing more lessons.
          const goal = s.profile.dailyMinutes ?? 10;
          const bonus = base < goal && minutes >= goal ? XP_DAILY_GOAL : 0;
          // Reward cards ride on the SAME dedupe as the completion itself (the `includes` guard
          // above), so re-opening a finished lesson cannot farm free stock.
          const cards = mintRewardCards(REWARD_CARDS_PER_LESSON);

          /*
           * EUPHORIUM. The web pays 50-100 per lesson; the band exists so a longer lesson pays more
           * than a short one, so the award scales with the lesson's own XP and clamps to the band.
           * A 30 XP lesson pays 80, a 50 XP lesson pays the 100 ceiling.
           */
          const lessonCoins = Math.min(EARN.lessonMax, EARN.lessonMin + xp);
          /*
           * A STREAK FREEZE IS SPENT HERE, inside the same `set` that writes the streak. Doing it in
           * a second write could interleave and take the paid item without crediting the day.
           * resolveStreak absorbs exactly ONE missed day, which is all the item promises.
           */
          const resolved = resolveDay({
            streak: s.streak,
            lastActiveDay: s.lastActiveDay,
            today,
            yesterday: prevDayKey(),
            dayBefore: dayBeforeKey(),
            freezes: s.streakFreezes,
            repair: s.streakRepair,
            milestoneRun: s.freezeMilestoneRun,
            now: Date.now(),
            isLesson: true,
          });
          const streakNext = resolved.streak;
          // +25 only when the streak actually ADVANCES. Finishing a second lesson the same day is
          // not a second streak day, and paying it twice would make the streak farmable.
          const streakCoins = streakNext > s.streak ? EARN.dailyStreak : 0;

          // Double XP applies to the LESSON award and its goal bonus, which is what the item says
          // ("All XP earned is doubled"). It deliberately does not touch coins — the web's boost is
          // an XP item, not a coin multiplier, and doubling both would compound.
          const mult = get().doubleXpUntil > Date.now() ? 2 : 1;

          return {
            activeDays: withToday(s.activeDays),
            pendingRewards: [...s.pendingRewards, ...cards],
            completedLessons: [...s.completedLessons, id],
            lessonResume,
            /*
             * THE RECORD DIES WITH THE LESSON, in the same write that marks it complete. Leaving
             * it would keep an entry for every lesson ever finished, and `lessonXpRemaining` would
             * then keep subtracting the old shares from a REPLAY of that lesson.
             */
            lessonSegments: withoutSegmentRecord(s.lessonSegments, id),
            coins: s.coins + lessonCoins + streakCoins,
            // The REMAINDER, not the lesson's XP. The parts already paid `seg.xpPaid`; the goal
            // bonus and Double XP still apply to what is left, exactly as they did before parts.
            ...applyXp(s, (lessonXpRemainder(seg, xp) + bonus) * mult),
            minutesToday: minutes,
            lessonsToday: (s.lastActiveDay === today ? s.lessonsToday : 0) + 1,
            lastActiveDay: today,
            // nothing incremented this before, so Home's pill and week strip were pinned forever.
            // Reads `streakNext` rather than recomputing: recomputing would ignore the freeze that
            // was just resolved, and the two values would silently disagree.
            streak: streakNext,
            bestStreak: Math.max(s.bestStreak ?? 0, streakNext),
            // resolveDay spends a freeze, pays a milestone freeze, and opens/advances/closes a
            // repair -- all in this same write, so none of them can interleave with the day.
            streakFreezes: resolved.freezes,
            streakRepair: resolved.repair,
            freezeMilestoneRun: resolved.milestoneRun,
          };
        }),

      /**
       * CREDIT ONE NON-FINAL PART. The arithmetic lives in `lesson-segment-credit.ts`; this is the
       * wiring, and it is deliberately thin.
       *
       * `applyXp` is applied HERE rather than in the helper because it is private to this file and
       * is the one place a tier crossing is detected. An award that routed around it would leave
       * lifetime and weekly XP disagreeing and swallow the promotion celebration.
       *
       * `activeDays` is stamped here too, because `withToday` reads the real clock and the helper
       * is kept clock-free so a regression can place "today" wherever it needs to. A part marks a
       * trial day for the same reason a trade and an Atlas message already do: it is real use.
       *
       * The result is captured out of the reducer rather than recomputed after it. Reading the
       * store again would race a second credit and could report another part's streak.
       */
      completeLessonSegment: (id, kind, share, minutesSpent) => {
        let out: SegmentCreditResult = { credited: false, xp: 0, streakAdvanced: false, streak: get().streak };
        set((s) => {
          const credit = creditSegment(s, {
            id,
            kind,
            share,
            minutes: minutesSpent,
            today: dayKey(),
            yesterday: prevDayKey(),
            dayBefore: dayBeforeKey(),
            // Double XP applies to a part exactly as it applies to a lesson. The item says "All XP
            // earned is doubled", and a part that ignored it would make the item worth less the
            // more a lesson is split up.
            mult: get().doubleXpUntil > Date.now() ? 2 : 1,
          });
          out = credit.result;
          // Returning `s` itself is a true no-op in zustand (it compares with Object.is before
          // merging), so a refused repeat cannot re-render every screen that reads this store.
          if (!credit.patch) return s;
          const { xpToApply, ...patch } = credit.patch;
          return { ...patch, activeDays: withToday(s.activeDays), ...applyXp(s, xpToApply) };
        });
        return out;
      },

      /**
       * ADOPT A PRE-PARTS RESUME POINTER, once, on the first open of a lesson that was started
       * before parts existed.
       *
       * IT PAYS NOTHING: no XP, no minutes, no streak, no `lastActiveDay`. Someone mid-lesson at
       * upgrade did the reading but was never paid per part, so paying now would mint XP for work
       * the old build already paid for in full at the end. `xpPaid: 0` means the final part still
       * pays `lesson.xp - 0`, the whole lesson. Nothing is lost and nothing is paid twice.
       *
       * Refuses a finished lesson, and refuses to overwrite an existing record — a second adoption
       * would reset `xpPaid` to 0 after parts had genuinely been paid, which is the farm.
       */
      adoptLegacySegments: (id, kinds) =>
        set((s) => {
          if (s.completedLessons.includes(id)) return s;
          if (s.lessonSegments[id]) return s;
          // Through `readSegmentRecord` rather than trusting the argument: it is derived from a
          // persisted pointer, so unknown kinds and duplicates are possible input, not theory.
          const record = readSegmentRecord({ done: kinds, xpPaid: 0, minutesPaid: 0 });
          // Written even when nothing finished, because its EXISTENCE is what tells the runner the
          // lesson has been adopted. Without the empty record, adoption would re-run every open.
          return { lessonSegments: { ...s.lessonSegments, [id]: record } };
        }),

      /*
       * A FINISHED LESSON ANSWERS EVERY KIND, with no data written. That single line is the whole
       * migration (design 2c): every lesson completed before parts existed counts all its parts
       * done, and stays right for any segment shape a future curriculum sync produces.
       */
      segmentsDoneFor: (id) =>
        get().completedLessons.includes(id)
          ? [...ALL_SEGMENT_KINDS]
          : readSegmentRecord(get().lessonSegments[id]).done,

      lessonXpRemaining: (id, xp) => lessonXpRemainder(readSegmentRecord(get().lessonSegments[id]), xp),
      /* ── EUPHORIUM ────────────────────────────────────────────────────────────
       * All rates come from `shop-items.ts::EARN`, which is the web Shop's own "How to earn
       * Euphorium" panel. Nothing here invents a number.
       */
      awardCoins: (n) => set((s) => (n > 0 ? { coins: s.coins + Math.round(n) } : s)),

      /**
       * Buy once, then own. Cosmetics live in `inventory` forever; consumables are counted so
       * buying two hint packs gives thirteen hints rather than one "owned" flag.
       *
       * Returns false rather than throwing: the caller is a tap handler, and a shop that throws on
       * a price check is a crash on the screen whose job is taking money.
       */
      buyItem: (id) => {
        const item = itemById(id);
        if (!item) return false;
        const s = get();
        if (s.coins < item.price) return false;
        // Cosmetics are one-per-account; consumables may be bought repeatedly.
        const cosmetic = item.category !== 'power-up';
        if (cosmetic && s.inventory.includes(id)) return false;

        const next: Partial<AppState> = { coins: s.coins - item.price };
        if (cosmetic) next.inventory = [...s.inventory, id];

        switch (item.itemType) {
          case 'double_xp': {
            const mins = Number(item.metadata.duration_minutes ?? 0);
            // EXTENDS an active boost rather than replacing it, so buying a second one while the
            // first is running cannot shorten what was already paid for.
            const from = Math.max(Date.now(), s.doubleXpUntil);
            next.doubleXpUntil = from + mins * 60_000;
            break;
          }
          case 'streak_freeze':
            next.streakFreezes = s.streakFreezes + Number(item.metadata.uses ?? 1);
            break;
          case 'hint':
            next.hints = s.hints + Number(item.metadata.uses ?? 1);
            break;
          case 'heart_refill':
            next.hearts = MAX_HEARTS;
            next.heartsDay = dayKey();
            break;
          default:
            break;
        }
        set(next as AppState);
        return true;
      },

      /** Equipping swaps whatever occupied the slot; the old item stays owned. */
      equipItem: (id) =>
        set((s) => {
          const item = itemById(id);
          if (!item || !s.inventory.includes(id)) return s;
          const slot =
            item.itemType === 'avatar_item' ? String(item.metadata.slot)
            : item.itemType === 'profile_theme' ? 'theme'
            : item.itemType === 'profile_frame' ? 'frame'
            : item.itemType === 'profile_badge' ? 'badge'
            : null;
          if (!slot) return s;
          return { equipped: { ...s.equipped, [slot]: id } };
        }),

      unequipSlot: (slot) =>
        set((s) => {
          const next = { ...s.equipped };
          delete next[slot];
          return { equipped: next };
        }),

      spendHint: () => {
        if (get().hints <= 0) return false;
        set((s) => ({ hints: s.hints - 1 }));
        return true;
      },

      /** Hearts refill on a NEW DAY, read-time, for the same reason minutesDoneToday is: no timer. */
      heartsNow: () => (get().heartsDay === dayKey() ? get().hearts : MAX_HEARTS),

      loseHeart: () =>
        set((s) => {
          const today = dayKey();
          const base = s.heartsDay === today ? s.hearts : MAX_HEARTS;
          return { hearts: Math.max(0, base - 1), heartsDay: today };
        }),

      /** 2 while a Double XP boost is live, else 1. Read at award time, never cached. */
      xpMultiplier: () => (get().doubleXpUntil > Date.now() ? 2 : 1),

      addXp: (n) => set((s) => applyXp(s, n)),
      follow: (id) =>
        set((s) => (s.following.includes(id) ? s : { following: [...s.following, id] })),
      unfollow: (id) => set((s) => ({ following: s.following.filter((f) => f !== id) })),
      friendIds: () => get().following.filter((id) => get().followers.includes(id)),
      /* +{EARN.dailyChallenge} rides the SAME lastQuestDay guard that already makes the card payout
       * idempotent. A second guard would be a second thing to get wrong. */
      claimQuestReward: () =>
        set((s) =>
          s.lastQuestDay === dayKey()
            ? s
            : { lastQuestDay: dayKey(), coins: s.coins + EARN.dailyChallenge, pendingRewards: [...s.pendingRewards, ...mintRewardCards(1)] },
        ),
      /*
       * The web pays 10-50 Euphorium for WINNING A GAME. iOS has one game and one once-per-day
       * award rather than a per-win one, so it pays the floor of that band: paying the top of a
       * range for a weaker version of the action would inflate this economy against the web's.
       */
      awardGameXp: () =>
        set((s) =>
          s.lastGameDay === dayKey()
            ? s
            : { lastGameDay: dayKey(), coins: s.coins + EARN.gameWinMin, ...applyXp(s, XP_GAME) },
        ),
      markPostRead: (slug) =>
        set((s) => {
          // The idempotence guard is what makes this safe to pay for: [slug].tsx fires it on
          // reaching the last card, and re-reading a guide must not mint XP again.
          if (s.readPosts.includes(slug)) return s;
          const today = dayKey();
          return {
            activeDays: withToday(s.activeDays),
            readPosts: [...s.readPosts, slug],
            // Rides the guard above, so re-reading a guide cannot inflate today's count.
            guidesDay: today,
            guidesToday: (s.guidesDay === today ? s.guidesToday : 0) + 1,
            ...applyXp(s, XP_GUIDE),
            // A guide read counts as your day, so Digest can keep a streak alive on its own.
            streak: nextStreak(s.streak, s.lastActiveDay),
            bestStreak: Math.max(s.bestStreak ?? 0, nextStreak(s.streak, s.lastActiveDay)),
            /* A guide keeps the day but must not hide a break: a later lesson would see
               lastActiveDay === today and never open the earn-back. freezes: 0 keeps guides from
               spending one (unchanged behaviour); isLesson false means it never counts toward it. */
            ...(() => {
              const d = resolveDay({ streak: s.streak, lastActiveDay: s.lastActiveDay, today, yesterday: prevDayKey(), dayBefore: dayBeforeKey(), freezes: 0, repair: s.streakRepair, milestoneRun: s.freezeMilestoneRun, now: Date.now(), isLesson: false });
              return { streakRepair: d.repair, freezeMilestoneRun: d.milestoneRun, streakFreezes: s.streakFreezes + (d.freezeEarned ? 1 : 0) };
            })(),
            lastActiveDay: today,
            // Rolling the tally is NOT optional next to that stamp. minutesDoneToday() gates on
            // lastActiveDay === today, so stamping today while leaving a stale minutesToday would
            // report yesterday's practice minutes as today's. A read credits no minutes of its
            // own — the daily goal measures practice, and reading is not practice.
            minutesToday: s.lastActiveDay === today ? s.minutesToday : 0,
            // Same rule for the lesson tally. It was left stale, so a guide read first thing made
            // quests.ts see lastActiveDay === today beside YESTERDAY's lessonsToday, and "Finish a
            // lesson" showed done before any lesson that day.
            lessonsToday: s.lastActiveDay === today ? s.lessonsToday : 0,
          };
        }),
      setDailyPick: (day, slug) =>
        set((s) => (s.dailyPick?.day === day && s.dailyPick.slug === slug ? s : { dailyPick: { day, slug } })),
      reset: () => set({ xp: 0, weeklyXp: 0, weekStart: '', lastGameDay: '', following: [], streak: 0, bestStreak: 0, streakRepair: null, freezeMilestoneRun: 0, completedLessons: [], lessonResume: null, lessonSegments: {}, minutesToday: 0, lastActiveDay: '', readPosts: [], dailyPick: null, cash: STARTING_CASH, positions: {}, costBasis: {}, valueHistory: [], derivativeTrades: 0, derivatives: [], pendingRewards: [], rewardsEarned: 0, watchlist: [] }),
      deleteProfile: () =>
        set({
          xp: 0, weeklyXp: 0, weekStart: '', lastGameDay: '', following: [], streak: 0,
          bestStreak: 0, completedLessons: [], lessonResume: null, lessonSegments: {}, minutesToday: 0, lessonsToday: 0, lastActiveDay: '',
          readPosts: [], dailyPick: null, cash: STARTING_CASH, positions: {}, costBasis: {},
          valueHistory: [], derivativeTrades: 0, derivatives: [], pendingRewards: [],
          rewardsEarned: 0, watchlist: [],
          // the identity itself, which is what "delete my account" actually means
          profile: EMPTY_PROFILE,
          avatarId: DEFAULT_AVATAR_ID,
          titleId: '',
          bannerId: '',
          streakGoal: null,
          activeDays: [],
          notifLedger: [],
          signedIn: false,
        }),
    }),
    {
      name: 'euphoria-app-state',
      storage: createJSONStorage(() => AsyncStorage),
      // v1: Phase 16. Every basis recorded before the mark went live was paid in static dollars.
      // The rule lives in cost-basis.ts beside the reducers it protects, so the regression imports
      // it rather than restating it — the drift C113 records happened exactly once already.
      version: STREAK_SAFETY_STORE_VERSION,
      /*
       * WRAPPED, because a migration that throws does not fail loudly — it hangs the app forever.
       * zustand calls `migrate` inside a promise chain; a throw rejects it and `onRehydrateStorage`
       * then fires with `state === undefined`, so `setHasHydrated(true)` never runs and
       * `app/index.tsx` never routes. Returning the persisted blob untouched degrades to "migration
       * did not happen", which the version number will retry next launch, instead of a blank screen.
       */
      migrate: (persisted, from) => {
        try {
          let next = clearStaticPricing(persisted as Partial<AppState>, from) as AppState;
          /*
           * v3. The first light-mode release defaulted themePref to 'system', so every install
           * that launched it has 'system' PERSISTED — changing the initial value alone would not
           * reach them, and anyone on a light phone would stay in a light app.
           *
           * Only 'system' is rewritten. A deliberate 'light' is left alone: this is undoing a bad
           * default, not overriding a choice someone made.
           */
          if (from < 3 && (next as Partial<AppState>).themePref === 'system') {
            (next as Partial<AppState>).themePref = 'dark';
          }
          // v4. Reject a stale, unknown course id left by an older build.
          if (from < 4 && !isCourseAvailable(next.activeCourseId)) {
            next.activeCourseId = DEFAULT_AVAILABLE_COURSE_ID;
          }
          // v5. Existing testers need one complete Welcome -> onboarding -> paywall -> sign-up
          // rehearsal. This resets routing only; progress, entitlement and trial history survive.
          next = replayOnboardingOnUpgrade(next, from);
          /*
           * v6. `profile.onboardingPaywallSeenAt` is new, so every existing install is missing it,
           * and the entry redirect now sends anyone without it to the paywall. Correct for someone
           * who force-quit before reaching it; wrong for an install that finished the flow before
           * the field existed, which would be handed a purchase screen out of nowhere.
           *
           * AFTER the v5 replay on purpose: that one nulls completedAt for anything below v5, and
           * those installs are being sent through the whole flow again, so they meet the paywall
           * honestly and must not be stamped.
           */
          next = backfillPaywallSeen(next, from);
          // v7. Streak safety net: starter freeze + no retroactive milestone (streak-safety-migration.ts).
          next = applyStreakSafety(next, from);
          return next;
        } catch (e) {
          console.error('[store] migration failed, leaving state as-is', e);
          return persisted as AppState;
        }
      },
      // only persist data, not the action fns / derived getters
      partialize: (s) => ({ signedIn: s.signedIn, xp: s.xp, streak: s.streak, bestStreak: s.bestStreak, completedLessons: s.completedLessons, lessonResume: s.lessonResume, lessonSegments: s.lessonSegments, minutesToday: s.minutesToday, lessonsToday: s.lessonsToday, coins: s.coins, themePref: s.themePref, avatarId: s.avatarId, titleId: s.titleId, bannerId: s.bannerId, gameBest: s.gameBest, lastWeekResolved: s.lastWeekResolved, lastWeekOutcome: s.lastWeekOutcome, pendingTierUp: s.pendingTierUp, inventory: s.inventory, doubleXpUntil: s.doubleXpUntil, streakFreezes: s.streakFreezes, streakRepair: s.streakRepair, freezeMilestoneRun: s.freezeMilestoneRun, hints: s.hints, hearts: s.hearts, heartsDay: s.heartsDay, equipped: s.equipped, lastActiveDay: s.lastActiveDay, activeCourseId: s.activeCourseId, readPosts: s.readPosts, dailyPick: s.dailyPick, profile: s.profile, weeklyXp: s.weeklyXp, weekStart: s.weekStart, lastGameDay: s.lastGameDay, guidesDay: s.guidesDay, guidesToday: s.guidesToday, following: s.following, isPro: s.isPro, specialOfferSeenAt: s.specialOfferSeenAt, trialRewardSeenAt: s.trialRewardSeenAt, atlasTour: s.atlasTour, billingIssue: s.billingIssue, atlasAsked: s.atlasAsked, cash: s.cash, positions: s.positions,
      // Read from the module map, NOT from `s.marks`. `setMark` writes to the map (it cannot touch
      // the store without a cycle), so the state field is only ever a persistence mirror — reading
      // `s.marks` here would save the marks the app STARTED with and quietly discard every quote
      // fetched since. Ceiling: this snapshots on the next state write, so a session that fetches
      // quotes and changes nothing else keeps the previous marks rather than the newest.
      marks: persistableMarks(allMarks(), [...Object.keys(s.positions), ...s.watchlist]), costBasis: s.costBasis, valueHistory: s.valueHistory, derivativeTrades: s.derivativeTrades, derivatives: s.derivatives, pendingRewards: s.pendingRewards, rewardsEarned: s.rewardsEarned, watchlist: s.watchlist, installId: s.installId, activeDays: s.activeDays, lastReturnDay: s.lastReturnDay, streakGoal: s.streakGoal, lastQuestDay: s.lastQuestDay, widgetAsksSeen: s.widgetAsksSeen, widgetAskDay: s.widgetAskDay, widgetAdded: s.widgetAdded, nudgeHour: s.nudgeHour, notifLedger: s.notifLedger }),
      // Fires after rehydration settles, on success AND on failure. Flipping the flag in both
      // cases is deliberate: if storage is unreadable we must still route rather than hang on a
      // blank screen forever — a new install is the correct fallback for "no readable state".
      onRehydrateStorage: () => (state, error) => {
        // `error` was previously ignored. If rehydration fails the app must still ROUTE — a new
        // install is the correct fallback for unreadable state, and the flag below is what releases
        // routing at all.
        // Guarded on `window` for the same reason the routing fallback below is: no `window`
        // means STATIC RENDERING, where rehydration ALWAYS rejects because AsyncStorage needs
        // one. That failure is expected and harmless, but logging it as an error puts a red
        // `[store] rehydrate failed ReferenceError: window is not defined` into every EAS build
        // log, where it reads like a production defect. It cost a real investigation once.
        if (error && typeof window !== 'undefined') console.error('[store] rehydrate failed', error);
        // Marks BEFORE the flag: `hasHydrated` is what releases routing, and a screen that renders
        // with an empty mark map prices every holding off the static table for one frame.
        hydrateMarks(state?.marks);
        /*
         * `state` is undefined when rehydration REJECTED, so `state?.setHasHydrated(true)` no-ops
         * and nothing ever routes — the soft-lock this whole block exists to prevent. Falling back
         * to the live store handle fixes that on device.
         *
         * WRAPPED, because the first version of this fallback BROKE THE WEB EXPORT. Static
         * rendering has no `window`, so rehydration always rejects there, and reaching for the
         * store handle mid-module-evaluation threw `ReferenceError: window is not defined` and took
         * `expo export` down with it. Worse, `eas deploy` then reported success while shipping the
         * previous bundle — §4's "a deploy that succeeds proves nothing" in the flesh.
         *
         * On a server render there is nothing to route anyway, so swallowing is correct there and
         * only there.
         */
        if (state) {
          state.setHasHydrated(true);
        } else if (typeof window !== 'undefined') {
          // Rehydration REJECTED on a real client. Without this the flag never flips and
          // `app/index.tsx` renders nothing forever — the soft-lock this block exists to prevent.
          useApp.getState().setHasHydrated(true);
        }
        // No `window` means STATIC RENDERING, where rehydration always rejects (AsyncStorage needs
        // one) and there is nothing to route regardless. Reaching for the store handle there threw
        // `ReferenceError: window is not defined` ASYNCHRONOUSLY — after setHasHydrated triggered a
        // re-render — so a try/catch around it did not help and `expo export` died. Guarding the
        // CONDITION rather than the throw is the fix.
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
  const at = (xp: number, weeklyXp: number, weekStart: string, pendingTierUp: string | null = null) =>
    ({ xp, weeklyXp, weekStart, pendingTierUp });
  eq(applyXp(at(10, 5, wk), 50).weeklyXp, 55, 'same week accumulates');
  eq(applyXp(at(10, 5, wk), 50).xp, 60, 'lifetime always accumulates');
  eq(applyXp(at(10, 900, '1999-01-04'), 50).weeklyXp, 50, 'a stale week resets');
  eq(applyXp(at(10, 900, '1999-01-04'), 50).xp, 60, 'a stale week never resets lifetime');

  // Tier crossings. The preserve case is the one that actually bit: an award that does not cross
  // must never clear a milestone the user has not been shown yet.
  eq(applyXp(at(10, 5, wk), 5).pendingTierUp, null, 'an award inside one tier raises nothing');
  eq(applyXp(at(499, 5, wk), 1).pendingTierUp, 'Investor', 'crossing a threshold raises the tier');
  eq(applyXp(at(498, 5, wk), 1).pendingTierUp, null, 'stopping one short of a threshold raises nothing');
  eq(
    applyXp(at(600, 5, wk, 'Investor'), 10).pendingTierUp, 'Investor',
    'a non-crossing award must PRESERVE an unseen milestone, not clear it',
  );
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
