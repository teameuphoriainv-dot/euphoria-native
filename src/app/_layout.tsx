import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { EBGaramond_400Regular, EBGaramond_500Medium, EBGaramond_600SemiBold, EBGaramond_700Bold } from '@expo-google-fonts/eb-garamond';
import { Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { useFonts } from 'expo-font';
import { Observe, ObserveRoot, useObserve } from 'expo-observe';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';

import { PerfHud } from '@/components/perf-hud';
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
import * as Updates from 'expo-updates';

import { useTheme, useThemeMode } from '@/hooks/use-theme';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';


import { AppState as RNAppState } from 'react-native';

import { Ev, flushAnalytics, track } from '@/lib/analytics';
import { shouldCountReturn, useApp } from '@/lib/store';

SplashScreen.preventAutoHideAsync();

/*
 * Production observability without product analytics or user identity.
 *
 * EAS Observe owns app-start, route-performance and JavaScript-error diagnostics. PostHog remains
 * the consent-gated product funnel. Keeping those jobs separate prevents a crash tool from quietly
 * becoming a second behavioral tracker, and no account, email, handle, portfolio or lesson answer
 * is attached here.
 *
 * Router parameters that could ever carry an authentication credential are filtered at the SDK
 * boundary. Most current routes do not use them; the list is defensive so a future deep-link flow
 * cannot turn a useful navigation trace into a credential log.
 */
Observe.configure({
  environment: Updates.channel ?? (__DEV__ ? 'development' : 'production'),
  dispatchInDebug: false,
  integrations: {
    'expo-router': {
      filteredParams: ['access_token', 'refresh_token', 'token', 'code', 'email'],
    },
  },
});

function RootLayout() {
  const { markInteractive } = useObserve();
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
    if (!loaded) return;
    void SplashScreen.hideAsync();
    // Fonts are the only startup work that deliberately holds the splash screen. Marking earlier
    // would report a quick TTI for an app that is still visibly unavailable; marking later would
    // mix route data and network latency into the startup metric.
    markInteractive({ params: { fonts_loaded: true } });
  }, [loaded, markInteractive]);

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

  const theme = useTheme();
  const mode = useThemeMode();

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/*
        * N22. These three were hardcoded to dark and sit ABOVE every screen in the app, so they
        * are the difference between light mode working and light mode being a light card on a
        * near-black page: the navigator's own background shows through during transitions and
        * anywhere a screen does not paint edge to edge, and a light status bar is unreadable on a
        * white one.
        */}
      <ThemeProvider value={mode === 'light' ? DefaultTheme : DarkTheme}>
        <StatusBar style={mode === 'light' ? 'dark' : 'light'} />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.background } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
        </Stack>
        {/* Renders nothing unless Preferences turns it on, so an OTA carrying it is invisible. */}
        <PerfHud />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

export default ObserveRoot.wrap(RootLayout);
