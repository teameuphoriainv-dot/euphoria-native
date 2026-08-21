import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { EBGaramond_400Regular, EBGaramond_500Medium, EBGaramond_600SemiBold, EBGaramond_700Bold } from '@expo-google-fonts/eb-garamond';
import { Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { useFonts } from 'expo-font';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
// NativeWind was unwired 2026-08-21 (see metro.config.js for the full reasoning and how to
// restore it). This import was already redundant: withNativeWind injected the same runtime
// through Metro, so removing it alone changed nothing measurable.
// Side-effect import, same reason as the line above: lib/notifications arms the day-2 trial
// reminder with a module-scope store subscription, and without this it would only be armed for a
// user who happens to open Settings or onboarding. The paywall promises that reminder.
import '@/lib/notifications';
// Side-effect import, third of the same kind: lib/widget mirrors streak/xp/dayKey into the App
// Group so the widget process can render them. Without this the widget renders zeros forever and
// nothing errors — the failure is silent by construction.
import '@/lib/widget';
import { refreshEntitlement } from '@/lib/purchases';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AppState as RNAppState } from 'react-native';

import { Ev, flushAnalytics, track } from '@/lib/analytics';
import { shouldCountReturn, useApp } from '@/lib/store';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    EBGaramond_400Regular,
    EBGaramond_500Medium,
    EBGaramond_600SemiBold,
    EBGaramond_700Bold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  /*
   * Ask RevenueCat what this Apple ID is actually entitled to, once per launch, so a subscription
   * cancelled or expired on another device is reflected here rather than trusting a stale cached
   * flag forever.
   *
   * It cannot revoke access on a network failure — `refreshEntitlement` only writes `isPro` from a
   * SUCCESSFUL read, because flipping a paying member to free the moment their train enters a tunnel
   * is indistinguishable in the logs from a real lapse. A no-op without a key.
   */
  useEffect(() => {
    void refreshEntitlement();
  }, []);

  /*
   * 17b funnel: the return steps, which are the ones that decide retention. `install` is NOT sent
   * from here — PostHog's `captureAppLifecycleEvents` emits Application Installed itself and keeps
   * its own persisted flag, which is strictly more reliable than anything reconstructed from store
   * state after a rehydrate.
   *
   * A "return" is a launch on a calendar day the user has not been active on yet, and it carries
   * the day NUMBER, because "came back" and "came back on day 3" are different facts and only the
   * second one tells you whether the trial length is right.
   *
   * Runs once per launch, after rehydration — `activeDays` is persisted, so reading it before the
   * store settles would count every cold start as day one.
   */
  useEffect(() => {
    if (!loaded) return;
    const { activeDays, lastReturnDay, markReturnCounted } = useApp.getState();
    if (shouldCountReturn(lastReturnDay, activeDays)) {
      track(Ev.dayReturn, { day_number: activeDays.length + 1 });
      // Stamp BEFORE the day is otherwise recorded. `activeDays` only gains today once the user
      // does something real, so without this every launch in between counted as another return.
      markReturnCounted();
    }
  }, [loaded]);

  /**
   * Flush on the way out. `flushAnalytics` existed with ZERO call sites until 2026-08-13 — the
   * function was written for exactly this and never wired, so the events of a short session were
   * simply lost. Measured: two launches fired `day_return`, and neither reached PostHog, because
   * PostHog's own batch timer had not elapsed before the process died.
   *
   * `RNAppState` is aliased because `AppState` in this codebase already means the Zustand store's
   * shape — importing it unaliased reads as the store and type-checks as neither.
   */
  useEffect(() => {
    const sub = RNAppState.addEventListener('change', (next) => {
      if (next !== 'active') flushAnalytics();
    });
    return () => {
      sub.remove();
    };
  }, []);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={DarkTheme}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#09090D' } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
