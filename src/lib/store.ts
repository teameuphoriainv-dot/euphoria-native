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
import { EMPTY_PROFILE, recommendPath } from './onboarding-path';

const XP_PER_LEVEL = 500;

/** Stable id for one curriculum lesson inside `completedLessons`. */
export const lessonKey = (courseId: string, num: number) => `${courseId}:${num}`;

export type AppState = {
  signedIn: boolean;
  xp: number;
  streak: number;
  completedLessons: string[];
  /** Course id the Learn pathway is currently showing — one of COURSES from '@/lib/curriculum'. */
  activeCourseId: string;
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
  completeLesson: (id: string, xp: number) => void;
  addXp: (n: number) => void;
  reset: () => void;
};

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      signedIn: false,
      xp: 2340,
      streak: 12,
      completedLessons: [],
      activeCourseId: 'investing-fundamentals',
      profile: EMPTY_PROFILE,

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

      completeLesson: (id, xp) =>
        set((s) => (s.completedLessons.includes(id) ? s : { completedLessons: [...s.completedLessons, id], xp: s.xp + xp })),
      addXp: (n) => set((s) => ({ xp: s.xp + n })),
      reset: () => set({ xp: 0, streak: 0, completedLessons: [] }),
    }),
    {
      name: 'euphoria-app-state',
      storage: createJSONStorage(() => AsyncStorage),
      // only persist data, not the action fns / derived getters
      partialize: (s) => ({ signedIn: s.signedIn, xp: s.xp, streak: s.streak, completedLessons: s.completedLessons, activeCourseId: s.activeCourseId, profile: s.profile }),
    },
  ),
);
