/**
 * Euphoria persisted app state (zustand + AsyncStorage). Survives app restarts.
 * XP/level/streak/lesson progress + paper portfolio. Screens read via useApp();
 * lesson completion + trades write here. Replaces the scattered mock literals.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const XP_PER_LEVEL = 500;

export type AppState = {
  xp: number;
  streak: number;
  completedLessons: string[]; // ids of finished lessons
  /** Derived: level from total XP (1-based). */
  level: () => number;
  /** XP into the current level, and the level size — for progress bars. */
  levelProgress: () => { into: number; size: number; toNext: number };
  /** Mark a lesson done (idempotent) and award XP once. */
  completeLesson: (id: string, xp: number) => void;
  addXp: (n: number) => void;
  reset: () => void;
};

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      // sensible starting values so a fresh install still feels alive
      xp: 2340,
      streak: 12,
      completedLessons: [],

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
    { name: 'euphoria-app-state', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
