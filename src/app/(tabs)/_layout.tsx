import { Redirect, Tabs } from 'expo-router';

import { TabBar } from '@/components/tab-bar';
import { hasAccount } from '@/lib/onboarding-path';
import { useApp } from '@/lib/store';

export default function TabsLayout() {
  /*
   * THE ACCOUNT GATE. This is the enforcement; onboarding's redirect is only the happy path.
   *
   * It lives HERE rather than in index.tsx because index is one door and this is the room. Every
   * way into the app converges on this layout — the cold-start redirect, `router.replace('/home')`
   * after a purchase, the `/start` hand-off, a deep link, a notification tap. Guarding the entry
   * redirect alone left all of those open, which is exactly how the old build let a user finish
   * onboarding, never sign up, relaunch, and land in Home with no account behind them.
   *
   * The hydration wait is not optional, and index.tsx documents why at length: zustand's persist
   * middleware rehydrates from AsyncStorage ASYNCHRONOUSLY, so the first render of a cold start
   * sees an EMPTY profile. Redirecting on that would throw every signed-up user back to /auth
   * whenever the render won the race — an intermittent bug, which is worse than a constant one
   * because it passes a casual test and fails in someone's hand. Rendering null for a frame is
   * what index.tsx already does at the same fork.
   */
  const hasHydrated = useApp((s) => s.hasHydrated);
  const profile = useApp((s) => s.profile);

  if (!hasHydrated) return null;
  if (!hasAccount(profile)) return <Redirect href={'/auth' as never} />;

  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="learn" options={{ title: 'Learn' }} />
      <Tabs.Screen name="trade" options={{ title: 'Trade' }} />
      <Tabs.Screen name="digest" options={{ title: 'Digest' }} />
      {/*
        * GAMES IS A TAB; PROFILE IS NOT. Audit, 2026-08-23: "Friends and Games should be moved out
        * of the You tab and made a bigger, more visible part of the app overall." Grouping them
        * inside You (shipped earlier today) did not satisfy that — he asked for them to LEAVE.
        *
        * The web app is the reference and resolves it the same way: its tabs are
        * Home / Trade / Games / Shop / Classes and there is no You tab at all — profile lives
        * behind the header. Five slots is the practical maximum before iOS shows a More overflow
        * and the labels start truncating (they already did once at accessibility sizes), so
        * something had to give and profile is the thing you visit, not the thing you do.
        *
        * `you.tsx` moved to src/app/, so the route is STILL `/you` and every existing
        * router.push('/you') keeps working.
        */}
      <Tabs.Screen name="games" options={{ title: 'Games' }} />
    </Tabs>
  );
}
