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

const XP_PER_LEVEL = 500;

/** Stable id for one curriculum lesson inside `completedLessons`. */
export const lessonKey = (courseId: string, num: number) => `${courseId}:${num}`;

/** Local calendar day, 'YYYY-MM-DD'. Local rather than UTC so the daily goal rolls over at the
 *  user's midnight, not UTC's. */
export const dayKey = (d: Date = new Date()) =>
  new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

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
      lastActiveDay: '',
      activeCourseId: 'investing-fundamentals',
      readPosts: [],
      dailyPick: null,
      profile: EMPTY_PROFILE,
      hasHydrated: false,
      weeklyXp: 0,
      weekStart: '',
      lastGameDay: '',
      following: [],
      followers: SEED_FOLLOWERS,

      setHasHydrated: (v) => set({ hasHydrated: v }),
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
          return {
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
      awardGameXp: () =>
        set((s) => (s.lastGameDay === dayKey() ? s : { lastGameDay: dayKey(), ...applyXp(s, XP_GAME) })),
      markPostRead: (slug) =>
        set((s) => {
          // The idempotence guard is what makes this safe to pay for: [slug].tsx fires it on
          // reaching the last card, and re-reading a guide must not mint XP again.
          if (s.readPosts.includes(slug)) return s;
          const today = dayKey();
          return {
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
      reset: () => set({ xp: 0, weeklyXp: 0, weekStart: '', lastGameDay: '', following: [], streak: 0, completedLessons: [], minutesToday: 0, lastActiveDay: '', readPosts: [], dailyPick: null }),
    }),
    {
      name: 'euphoria-app-state',
      storage: createJSONStorage(() => AsyncStorage),
      // only persist data, not the action fns / derived getters
      partialize: (s) => ({ signedIn: s.signedIn, xp: s.xp, streak: s.streak, completedLessons: s.completedLessons, minutesToday: s.minutesToday, lastActiveDay: s.lastActiveDay, activeCourseId: s.activeCourseId, readPosts: s.readPosts, dailyPick: s.dailyPick, profile: s.profile, weeklyXp: s.weeklyXp, weekStart: s.weekStart, lastGameDay: s.lastGameDay, following: s.following, followers: s.followers }),
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
