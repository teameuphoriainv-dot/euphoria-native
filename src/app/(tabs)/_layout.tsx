import { Tabs } from 'expo-router';

import { TabBar } from '@/components/tab-bar';

export default function TabsLayout() {
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
