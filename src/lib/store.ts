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

      completeLesson: (id, xp) =>
        set((s) => {
          if (s.completedLessons.includes(id)) return s;
          const today = dayKey();
          // roll the tally over when the calendar day changed since the last completion
          const base = s.lastActiveDay === today ? s.minutesToday : 0;
          return {
            completedLessons: [...s.completedLessons, id],
            xp: s.xp + xp,
            minutesToday: base + MINUTES_PER_LESSON,
            lastActiveDay: today,
            // nothing incremented this before, so Home's pill and week strip were pinned forever
            streak: nextStreak(s.streak, s.lastActiveDay),
          };
        }),
      addXp: (n) => set((s) => ({ xp: s.xp + n })),
      markPostRead: (slug) =>
        set((s) => (s.readPosts.includes(slug) ? s : { readPosts: [...s.readPosts, slug] })),
      setDailyPick: (day, slug) =>
        set((s) => (s.dailyPick?.day === day && s.dailyPick.slug === slug ? s : { dailyPick: { day, slug } })),
      reset: () => set({ xp: 0, streak: 0, completedLessons: [], minutesToday: 0, lastActiveDay: '', readPosts: [], dailyPick: null }),
    }),
    {
      name: 'euphoria-app-state',
      storage: createJSONStorage(() => AsyncStorage),
      // only persist data, not the action fns / derived getters
      partialize: (s) => ({ signedIn: s.signedIn, xp: s.xp, streak: s.streak, completedLessons: s.completedLessons, minutesToday: s.minutesToday, lastActiveDay: s.lastActiveDay, activeCourseId: s.activeCourseId, readPosts: s.readPosts, dailyPick: s.dailyPick, profile: s.profile }),
      // Fires after rehydration settles, on success AND on failure. Flipping the flag in both
      // cases is deliberate: if storage is unreadable we must still route rather than hang on a
      // blank screen forever — a new install is the correct fallback for "no readable state".
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
