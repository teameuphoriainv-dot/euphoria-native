import { Redirect } from 'expo-router';

import { hasAccount } from '@/lib/onboarding-path';
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
  const profile = useApp((s) => s.profile);

  if (!hasHydrated) return null;
  if (!profile.completedAt) return <Redirect href="/welcome" />;
  /*
   * FINISHED THE QUESTIONS, NEVER MADE AN ACCOUNT.
   *
   * This test used to be `completedAt ? home : welcome`, and that single missing condition WAS
   * the escape hatch: account creation sat after the paywall, nothing required it, so quitting on
   * the auth screen and relaunching walked straight into Home. The answers persist in the store,
   * so the app had no reason to ask again.
   *
   * Sending them to /auth rather than back through onboarding is the point — their answers are
   * already saved and re-running fifteen questions to reach a screen they skipped would be a
   * punishment. They land on the one screen they actually owe.
   *
   * The tab layout repeats this check. That is not redundancy: this branch keeps a cold start
   * from rendering a frame of Home before redirecting, and the layout catches every other door.
   */
  if (!hasAccount(profile)) return <Redirect href={'/auth' as never} />;
  /*
   * FINISHED THE QUESTIONS, MADE AN ACCOUNT, NEVER SAW THE OFFER.
   *
   * `completeOnboarding()` stamps `completedAt` at the LOADER, two steps before the paywall. With
   * only the two tests above, someone who signed up at the account wall, reached the paywall and
   * killed the app relaunched straight into Home — past the one screen that asks for money, with
   * nothing anywhere that would ever route them back to it. One force-quit was the entire bypass,
   * and it is the cheapest kind: no jailbreak, no timing, just closing the app.
   *
   * `firstRunDoneAt` cannot stand in for this. It is written only by /start, which sits AFTER the
   * paywall, so it is null for someone who has seen the offer and declined it too.
   *
   * `firstRun=1` is the same marker /auth sends back, so onboarding treats this as the flow it
   * is — resuming it — rather than as a returning user opening the upsell from inside the app.
   */
  if (!profile.onboardingPaywallSeenAt) {
    return <Redirect href={'/onboarding?step=paywall&firstRun=1' as never} />;
  }
  return <Redirect href="/(tabs)/home" />;
}
