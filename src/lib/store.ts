/**
 * Euphoria app state (zustand). Screens read via useApp(); lesson completion + trades write here.
 * Replaces scattered mock literals with one source of truth.
 *
 * NOTE: currently in-memory only. `@react-native-async-storage/async-storage` is installed but its
 * NATIVE module isn't in the current dev-client binary — importing it red-boxes the app. Disk
 * persistence turns on after the dev client is rebuilt (`expo run:ios`): re-add the persist
 * middleware with an AsyncStorage-backed storage. Until then state resets on restart (acceptable).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

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
      partialize: (s) => ({ signedIn: s.signedIn, xp: s.xp, streak: s.streak, completedLessons: s.completedLessons, activeCourseId: s.activeCourseId }),
    },
  ),
);
