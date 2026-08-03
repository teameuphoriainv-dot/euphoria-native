import { Redirect } from 'expo-router';

import { useApp } from '@/lib/store';

/**
 * Entry.
 *
 * This used to be an unconditional `<Redirect href="/welcome" />`. The onboarding answers
 * persisted all along — `profile` is in the store's `partialize` — but nothing READ them here,
 * so every returning user re-ran the entire flow on every launch and never reached the tabs.
 * It is also why work on Home could look like it had no effect: the app was sitting on /welcome.
 *
 * The hydration gate is not optional. zustand's persist middleware rehydrates from AsyncStorage
 * ASYNCHRONOUSLY, so the first render of a cold start sees the INITIAL state, where
 * `completedAt` is null. Redirecting on that would send a returning user to /welcome whenever
 * the render won the race — the same bug, now intermittent, which is worse because it passes a
 * casual test and fails in the user's hand. Once expo-router has navigated, a later state
 * update does not pull it back.
 *
 * Rendering null is safe: `onRehydrateStorage` flips the flag on failure as well as success, so
 * unreadable storage falls through to /welcome rather than hanging on a blank screen.
 */
export default function Index() {
  const hasHydrated = useApp((s) => s.hasHydrated);
  const completedAt = useApp((s) => s.profile.completedAt);

  if (!hasHydrated) return null;
  return <Redirect href={completedAt ? '/(tabs)/home' : '/welcome'} />;
}
