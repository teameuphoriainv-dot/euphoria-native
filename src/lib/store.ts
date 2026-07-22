/**
 * Euphoria app state (zustand). Screens read via useApp(); lesson completion + trades write here.
 * Replaces scattered mock literals with one source of truth.
 *
 * NOTE: currently in-memory only. `@react-native-async-storage/async-storage` is installed but its
 * NATIVE module isn't in the current dev-client binary — importing it red-boxes the app. Disk
 * persistence turns on after the dev client is rebuilt (`expo run:ios`): re-add the persist
 * middleware with an AsyncStorage-backed storage. Until then state resets on restart (acceptable).
 */
import { create } from 'zustand';

const XP_PER_LEVEL = 500;

export type AppState = {
  xp: number;
  streak: number;
  completedLessons: string[];
  level: () => number;
  levelProgress: () => { into: number; size: number; toNext: number };
  completeLesson: (id: string, xp: number) => void;
  addXp: (n: number) => void;
  reset: () => void;
};

export const useApp = create<AppState>()((set, get) => ({
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
}));
