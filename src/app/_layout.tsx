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
// NativeWind entry. Side-effect import — without it every className silently no-ops.
import '../../global.css';
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
