/**
 * The single authority on "can this user do this?".
 *
 * WHY IT IS ITS OWN MODULE: before this file the answer was spread across three store getters
 * (`canAccessLesson`, `atlasLeft`, `derivativesLeft`) with three different shapes and no shared
 * notion of WHY something was refused. The gate sheet needs one question with one answer that
 * carries a reason, or every caller invents its own copy.
 *
 * ── THE CEILING, STATED HONESTLY ──────────────────────────────────────────────────────────────
 * The trial clock is DEVICE-LOCAL. `activeDays` lives in AsyncStorage keyed off the device clock,
 * so deleting and reinstalling resets it, and moving the date forward can add days. There is no
 * server check.
 *
 * That is deliberate and acceptable for launch, and it must NEVER be described as enforcement
 * anywhere in the app or in a commit message. It is a COURTESY trial: it shapes the honest
 * majority's experience at zero cost. The real entitlement is `isPro`, which RevenueCat will drive
 * from an Apple-validated receipt in Unit 5.
 *
 * Upgrade path, increasing effort — deliberately the same shape as the limiter's ceiling in
 * api/_limit.ts:
 *   1. RevenueCat anonymous app-user-id  — survives reinstall on the same Apple ID
 *   2. Supabase row keyed on installId   — lib/auth.ts already scaffolds this
 *   3. Full account auth                 — the trial follows the person, not the device
 */
import { useMemo } from 'react';

import {
  FREE_ATLAS_MESSAGES,
  FREE_LESSON_LIMIT,
  PRO_DERIVATIVE_PREVIEW,
  TRIAL_DAYS,
  useApp,
  type AppState,
} from './store';

/**
 * Re-exported from the store, which owns it beside `activeDays`. Callers can keep importing it from
 * here; there is only one definition, so the rule cannot drift between the two modules.
 */
export { TRIAL_DAYS };

/**
 * WHY "DAYS USED" AND NOT "DAYS ELAPSED":
 * a calendar trial punishes someone who installs and forgets for a week — they return to find it
 * gone having used nothing, which reads as theft. Counting distinct days of real ACTION cannot be
 * burned by inactivity, matches how the trial is described to the user, and survives an App Review
 * conversation about fairness. `store.withToday` is what appends a day, and only the five actions
 * that constitute real use call it.
 */
export type Tier = 'trial' | 'expired' | 'pro';

/**
 * Everything a gate can protect.
 *
 * `trade` and `market` are here because of an explicit product decision: after the trial expires,
 * EVERYTHING locks except the streak/XP/league loop. The alternative — keeping the market surface
 * open as Bloom does — was considered and rejected. The consequence is real and the gate sheet has
 * to carry it: an expired user has nothing left to open, so the sheet's dismiss path and the
 * retention loop are the only ways back in. Never gate streak, XP or league.
 */
export type Feature = 'lesson' | 'guide' | 'atlas' | 'options' | 'trade' | 'market';

/**
 * Why a feature was refused. The gate sheet renders different copy per reason, which is the entire
 * point of returning this instead of a boolean — a gate that cannot say WHAT happened falls back to
 * "Upgrade to Pro", and that is the version users resent.
 */
export type Refusal =
  | { ok: true }
  | { ok: false; reason: 'trial-expired' }
  | { ok: false; reason: 'count-limit'; feature: Feature; used: number; limit: number };

export const trialDaysUsed = (s: AppState) => s.activeDays.length;

/** Never negative. A "-1 days left" has shipped in other apps and reads as broken. */
export const trialDaysLeft = (s: AppState) => Math.max(0, TRIAL_DAYS - s.activeDays.length);

/**
 * Which trial day the user is ON, 1-based and clamped to TRIAL_DAYS. Use this for display.
 *
 * WHY THIS EXISTS, and it was found by measuring rather than reasoning: on the third active day
 * `trialDaysLeft` is 0 while `tier` is still 'trial' — both correct, since expiry begins on the
 * FOURTH distinct day. But a banner reading "0 days left" on a day the user can still fully use
 * reads as already expired, and that is the version that generates "I paid and it still says my
 * trial ended" mail.
 *
 * So: "Day 3 of 3" for UI, never "0 days left". The exact wording is Unit 4's call; this getter
 * just makes the honest framing the easy one to reach for.
 */
export const trialDayNumber = (s: AppState) =>
  Math.min(TRIAL_DAYS, Math.max(1, s.activeDays.length || 1));

/**
 * `isPro` wins over everything.
 *
 * ORDER MATTERS: a paying user must never see a trial countdown. That specific bug is what
 * generates "I already paid" support mail and refund requests.
 */
export function tier(s: AppState): Tier {
  if (s.isPro) return 'pro';
  return s.activeDays.length > TRIAL_DAYS ? 'expired' : 'trial';
}

/**
 * The one question.
 *
 * During the trial the COUNT limits still apply, so a trial user runs out of whichever comes first
 * — 5 lessons, 10 Atlas messages, or 3 days. Options are the exception: their cap is a DATA limit
 * that binds Pro users equally, so it is not a trial restriction. After the trial nothing applies:
 * it is all Pro. That keeps the gate copy to ONE reason at a time.
 */
export function entitled(s: AppState, f: Feature): Refusal {
  if (s.isPro) return { ok: true };
  if (tier(s) === 'expired') return { ok: false, reason: 'trial-expired' };

  const capped = (used: number, limit: number): Refusal =>
    used < limit ? { ok: true } : { ok: false, reason: 'count-limit', feature: f, used, limit };

  switch (f) {
    case 'lesson':
      return capped(s.completedLessons.length, FREE_LESSON_LIMIT);
    case 'atlas':
      return capped(s.atlasAsked, FREE_ATLAS_MESSAGES);
    case 'options':
      /*
       * PRO_DERIVATIVE_PREVIEW is a DATA limit, not a tier. There is no options provider connected,
       * which is why options.tsx says "More arrives with a full options data plan" and why even a
       * Pro user gets only three. So the same cap applies to a trial user — it is not a lesser
       * allowance, it is the same allowance, because three is all the app can honestly offer.
       *
       * 4/4 reference trials grant full premium access rather than metered previews (Headway
       * "full access to the Premium experience", Promova "Unlock all lessons", Quizlet "Get instant
       * access", Nibble "Start daily microlearning lessons and quizzes"). §22 C26.
       */
      return capped(s.derivativeTrades, PRO_DERIVATIVE_PREVIEW);
    case 'guide':
    case 'trade':
    case 'market':
      // Never count-limited during the trial. Gating these mid-trial would be a new restriction
      // nobody asked for; only expiry closes them.
      return { ok: true };
  }
}

/**
 * Hook forms, so screens never reach into the store shape themselves.
 *
 * `useEntitlement` selects PRIMITIVES and memoises the result. It must never be written as
 * `useApp((s) => entitled(s, f))`: `entitled()` builds a fresh object every call, so zustand sees a
 * changed snapshot on every render and loops until React throws "Maximum update depth exceeded".
 * That shipped once and took down the whole Learn tab. `useTier` and `useTrialDaysLeft` are safe
 * because they return a string and a number.
 *
 * If you only need the answer at the moment of a tap, do not use this at all — call
 * `entitled(useApp.getState(), feature)` inside the handler and subscribe to nothing.
 */
export const useEntitlement = (f: Feature): Refusal => {
  const isPro = useApp((s) => s.isPro);
  const days = useApp((s) => s.activeDays.length);
  const lessons = useApp((s) => s.completedLessons.length);
  const asked = useApp((s) => s.atlasAsked);
  const derivativeTrades = useApp((s) => s.derivativeTrades);
  return useMemo(
    () =>
      entitled(
        {
          isPro,
          activeDays: Array.from({ length: days }, (_, i) => `d${i}`),
          completedLessons: Array.from({ length: lessons }, (_, i) => `l${i}`),
          atlasAsked: asked,
          derivativeTrades,
        } as unknown as AppState,
        f,
      ),
    [isPro, days, lessons, asked, derivativeTrades, f],
  );
};
export const useTier = () => useApp(tier);
export const useTrialDaysLeft = () => useApp(trialDaysLeft);

if (__DEV__) {
  // ONE runnable check, on the money path. A trial that never expires looks identical to a working
  // one until the fourth day — by which point it has shipped.
  const base = {
    isPro: false,
    completedLessons: [],
    atlasAsked: 0,
    derivativeTrades: 0,
  } as unknown as AppState;
  const at = (n: number) =>
    ({ ...base, activeDays: Array.from({ length: n }, (_, i) => `d${i}`) }) as AppState;

  const bad = (cond: boolean, what: string) => {
    if (cond) console.error(`[entitlement] ${what}`);
  };

  bad(tier(at(0)) !== 'trial', 'day 0 should be trial');
  // THE BOUNDARY. Day three is still a trial day; expiry begins on the FOURTH distinct day.
  // Off by one here charges people a day early, which is exactly what produces refunds.
  bad(tier(at(3)) !== 'trial', 'DAY 3 MUST STILL BE A TRIAL DAY');
  bad(tier(at(4)) !== 'expired', 'day 4 should be expired');
  bad(tier({ ...at(9), isPro: true } as AppState) !== 'pro', 'isPro must beat everything');
  bad(trialDaysLeft(at(9)) !== 0, 'daysLeft must never go negative');
  bad(trialDaysLeft(at(1)) !== 2, 'one day used should leave two');

  // Display framing: on the last usable day the user is on "day 3 of 3", NOT "0 days left".
  bad(trialDayNumber(at(0)) !== 1, 'a fresh trial displays as day 1');
  bad(trialDayNumber(at(3)) !== 3, 'the third active day displays as day 3');
  bad(trialDayNumber(at(9)) !== 3, 'day number must clamp to TRIAL_DAYS');

  // Expiry closes EVERY feature, including the ones with no count limit.
  for (const f of ['lesson', 'guide', 'atlas', 'options', 'trade', 'market'] as Feature[]) {
    bad(entitled(at(4), f).ok, `expiry must close "${f}"`);
    bad(!entitled({ ...at(4), isPro: true } as AppState, f).ok, `Pro must open "${f}"`);
  }

  // A count limit must report the numbers the gate copy needs, not just refuse.
  const spent = { ...at(1), completedLessons: Array.from({ length: FREE_LESSON_LIMIT }, (_, i) => `l${i}`) } as AppState;
  const r = entitled(spent, 'lesson');
  bad(r.ok, 'a spent lesson allowance must refuse');
  bad(r.ok === false && r.reason !== 'count-limit', 'in-trial refusal must be count-limit, not expiry');

  /**
   * Time travel for device verification. On globalThis rather than a UI control, because a debug
   * button visible to a user is a dead control. From a dev console:
   *   __euphoriaTrialDays(4)   // expired
   *   __euphoriaTrialDays(0)   // fresh
   */
  (globalThis as { __euphoriaTrialDays?: (n: number) => void }).__euphoriaTrialDays = (n: number) =>
    useApp.setState({ activeDays: Array.from({ length: n }, (_, i) => `seed-${i}`) });
}
