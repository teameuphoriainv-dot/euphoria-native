/**
 * Product analytics — Unit 17b.
 *
 * WHY THIS EXISTS. Every other lever in Unit 17 (the reward offer, the dismissal paywall, the
 * involuntary-churn work) is a bet. Without a funnel there is no way to tell a bet that worked from
 * one that did nothing, and the unit's own spec says so: "Nothing else in this unit can be judged
 * until 17b lands. Build it first."
 *
 * WHAT IT DOES NOT DO, deliberately:
 *   - **No session replay.** Off by default in the SDK and explicitly off here. Recording a
 *     teenager's screen inside a finance app is not a trade this product should make.
 *   - **No autocapture.** Every event in `Ev` below is one somebody chose to send. Autocapture
 *     would quietly ship whatever a future screen happens to render, which is how "we only measure
 *     how the app is used" stops being true without anyone deciding to break it.
 *
 *     IT IS OFF BY OMISSION, NOT BY A FLAG, and that is the trap. PostHog only autocaptures through
 *     `<PostHogProvider autocapture>`; this module constructs the client directly and never mounts
 *     that Provider. So wrapping the app in `<PostHogProvider>` — a reasonable-looking change —
 *     silently turns it on and makes `why-not-free.tsx` false. If you add the Provider, pass
 *     `autocapture={false}` and re-read that screen's copy before shipping.
 *   - **No PII, ever.** Not name, handle or email — the profile holds all three and none of them
 *     go here. The identity is `installId`, the same pseudonymous id the rate limiter already uses.
 *
 * That set is what keeps `why-not-free.tsx` honest. If any of it is relaxed, THAT COPY MUST CHANGE
 * IN THE SAME COMMIT.
 */
import type PostHogType from 'posthog-react-native';

import { useApp } from './store';

const KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY;
const HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';

/**
 * Shape-validated, not length-validated — the C76 lesson, applied a third time.
 *
 * `IAP_ENABLED` was once `KEY.length > 0`, which was TRUE for a `test_…` placeholder, so the app
 * believed purchases were live and shipped a Buy button that could only fail. A PostHog project
 * key is always `phc_` followed by base62. Anything else — empty, "TODO", a personal API key
 * (`phx_`), a server key — reads as NOT CONFIGURED, and analytics stays entirely inert.
 */
export const ANALYTICS_ENABLED = /^phc_[A-Za-z0-9]{20,}$/.test(KEY ?? '');

/**
 * The funnel from 17b, verbatim:
 *   install → first lesson → day 2 return → day 3 → paywall seen → paywall dismissed → paid
 *
 * Named constants rather than inline strings because an event name typed twice is two events, and
 * you find out months later when the funnel has a hole in it.
 */
export const Ev = {
  install: 'install',
  firstLesson: 'first_lesson_completed',
  dayReturn: 'day_return',
  paywallSeen: 'paywall_seen',
  paywallDismissed: 'paywall_dismissed',
  /** 17d. The whole point of the dismissal offer is that `special_offer_seen` divided by
   *  `paywall_dismissed` is a rate you can actually read, and `special_offer_accepted` over
   *  `special_offer_seen` tells you whether a second ask is worth the interruption at all. */
  specialOfferSeen: 'special_offer_seen',
  specialOfferAccepted: 'special_offer_accepted',
  specialOfferDismissed: 'special_offer_dismissed',
  /** 17f. The guided first action, which is where activation is actually decided. `kind` separates
   *  the real path (a lesson) from the fallback (a guide), so a drop in activation can be told
   *  apart from the course module failing to load. Skipping is its own event rather than an absent
   *  one — a missing event cannot distinguish "chose to skip" from "the screen crashed". */
  firstActionStarted: 'first_action_started',
  firstActionSkipped: 'first_action_skipped',
  trialStarted: 'trial_started',
  paid: 'paid',
} as const;

export type EvName = (typeof Ev)[keyof typeof Ev];

let client: PostHogType | null = null;
let loading: Promise<PostHogType | null> | null = null;

/**
 * Loaded lazily and never on the startup path.
 *
 * Analytics must not be able to delay or break app launch — a tracking SDK that throws while the
 * bundle is evaluating presents as "the app became unresponsive during onboarding", which is
 * literally the bug Apple rejected this app for. Nothing here runs until the first event.
 */
async function getClient(): Promise<PostHogType | null> {
  if (!ANALYTICS_ENABLED) return null;
  if (client) return client;
  loading ??= import('posthog-react-native')
    .then((m) => {
      client = new m.default(KEY!, {
        host: HOST,
        // See the header. These three are the privacy promise, expressed as configuration.
        enableSessionReplay: false,
        captureAppLifecycleEvents: true,
        defaultOptIn: true,
      });
      return client;
    })
    .catch(() => null);
  return loading;
}

/**
 * Record one funnel event. Fire-and-forget by design: a dropped analytics call is a rounding error,
 * a lesson that fails to complete because the tracker threw is a bug. Nothing here can reject.
 */
export function track(event: EvName, properties?: Record<string, string | number | boolean>): void {
  if (!ANALYTICS_ENABLED) return;
  void getClient()
    .then((c) => {
      if (!c) return;
      // The pseudonymous install id, NOT the person. Matches the rate limiter's identity, so a
      // funnel row and a rate-limit bucket describe the same device without naming anybody.
      c.capture(event, { ...properties, install_id: useApp.getState().installId });
    })
    .catch(() => {});
}

/** Flush before the app is backgrounded, so the last event of a session is not lost. */
export function flushAnalytics(): void {
  if (!ANALYTICS_ENABLED) return;
  void getClient()
    .then((c) => c?.flush())
    .catch(() => {});
}
