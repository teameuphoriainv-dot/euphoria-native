/**
 * The daily streak nudge.
 *
 * Onboarding has always ASKED "Want a daily nudge?" and written a boolean. Nothing anywhere
 * ever scheduled anything, so every user who opted in was promised a reminder that could not
 * arrive. This is the missing half.
 *
 * The rule worth keeping: callers must persist what this RETURNS, not what the user tapped.
 * Tapping "yes" is an intent, and iOS still gets a veto at the system prompt. Storing the
 * intent as though it were the outcome is exactly how an app ends up believing notifications
 * are on while the OS drops every one of them.
 */
import * as Notifications from 'expo-notifications';

import { TRIAL_DAYS, useApp } from './store';

/** Evening, not morning. The nudge exists to rescue a streak before the day ends, which is
 *  only actionable while there is still time to do a five-minute lesson. */
export const NUDGE_HOUR = 19;

/** Fixed id so a re-run REPLACES the reminder instead of adding a second one. */
const DAILY_ID = 'euphoria-daily-nudge';

// Without a handler, a notification arriving while the app is open is silently swallowed.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Apply the user's preference, and report what is ACTUALLY scheduled afterwards.
 *
 * Safe to call repeatedly: it cancels before it schedules, so re-answering the question — or
 * toggling this later from settings — can never stack duplicate daily reminders.
 */
export async function applyDailyNudge(optIn: boolean): Promise<boolean> {
  // Cancelling an id that was never scheduled is not an error worth propagating.
  await Notifications.cancelScheduledNotificationAsync(DAILY_ID).catch(() => undefined);
  if (!optIn) return false;

  const current = await Notifications.getPermissionsAsync();
  let status = current.status;
  // Asking again after a hard denial does nothing on iOS — it never re-prompts, so respect it
  // rather than firing a request that silently resolves denied.
  if (status !== 'granted' && current.canAskAgain) {
    status = (await Notifications.requestPermissionsAsync()).status;
  }
  if (status !== 'granted') return false;

  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_ID,
    content: {
      title: 'Keep your streak alive',
      body: 'Five minutes with Atlas is all it takes.',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: NUDGE_HOUR,
      minute: 0,
    },
  });
  return true;
}

/** What the OS actually has queued. Used by the dev self-check below and safe to call anywhere. */
export const scheduledNudges = async () => Notifications.getAllScheduledNotificationsAsync();

/* ── THE TRIAL REMINDER ────────────────────────────────────────────────────────────────────────
 *
 * The paywall says "We'll remind you before anything is charged." C13 decision 3 attached an
 * obligation to that exact sentence — "Do not ship the copy on the strength of an intention" — and
 * for a while the app shipped the sentence with nothing behind it. This is the something.
 *
 * WHAT IT SCHEDULES AGAINST, and why that took thought: a days-used trial has NO computable end
 * date (C32). Day 3 might be tomorrow or a fortnight away, so there is no deadline to count back
 * from — which is why every reference app that shows a date pill (Headway April 21, Nibble
 * April 30, Quizlet June 1) is a CALENDAR trial and Euphoria cannot copy that.
 *
 * But the day-2 TRANSITION is exactly computable: it is the moment `activeDays` reaches
 * TRIAL_DAYS - 1. So the reminder is scheduled off the transition rather than off the end, and it
 * warns that the NEXT day of use is the last one. That is the honest version of the promise.
 *
 * COPY IS UNAPPROVED, per the §20 convention. It deliberately does not say "you will be charged",
 * because with no IAP wired nothing can be, and after Unit 5 a days-used trial still is not
 * auto-billed. It says the free days are running out, which is what actually happens.
 */
const TRIAL_ID = 'euphoria-trial-reminder';

/** Seconds until the next NUDGE_HOUR, pushed a day if that is imminent — a reminder arriving
 *  twenty minutes after the session that triggered it is noise, not a reminder. */
function secondsToNextNudgeHour(now: Date): number {
  const target = new Date(now);
  target.setHours(NUDGE_HOUR, 0, 0, 0);
  if (target.getTime() - now.getTime() < 60 * 60 * 1000) target.setDate(target.getDate() + 1);
  return Math.round((target.getTime() - now.getTime()) / 1000);
}

/**
 * Schedule (or clear) the one-shot trial reminder. Returns what the OS ACTUALLY accepted, never
 * what we asked for — the same rule `applyDailyNudge` documents, and for the same reason.
 *
 * Never requests permission. Asking for notification permission because a trial clock ticked would
 * be a prompt the user did not initiate; if they already granted it for the daily nudge this rides
 * along, and if they did not, it stays silent rather than nagging.
 */
export async function applyTrialReminder(schedule: boolean, now: Date = new Date()): Promise<boolean> {
  await Notifications.cancelScheduledNotificationAsync(TRIAL_ID).catch(() => undefined);
  if (!schedule) return false;

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') return false;

  await Notifications.scheduleNotificationAsync({
    identifier: TRIAL_ID,
    content: {
      title: 'One free day left',
      body: 'Your next day on Euphoria is the last of your free three. Nothing is charged automatically.',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: secondsToNextNudgeHour(now),
      repeats: false,
    },
  });
  // Report the truth: read it back rather than assuming the write landed.
  const all = await scheduledNudges();
  return all.some((n) => n.identifier === TRIAL_ID);
}

/*
 * ARMING IT. A module-scope subscription rather than a call site inside `withToday`, because the
 * store must not perform async side effects and the five actions that mark a day should not each
 * have to remember this exists. One place, and it cannot be forgotten by the sixth caller.
 *
 * Fires on the TRANSITION only. Without the `last` guard this would reschedule on every store
 * write — every XP change, every trade — cancelling and re-adding the same notification hundreds of
 * times a session.
 *
 * `_layout.tsx` imports this module for its side effect (beside `global.css`, which is already a
 * side-effect import there) so the subscription is armed for a user who never opens Settings.
 */
let lastKey = '';
useApp.subscribe((s) => {
  const days = s.activeDays.length;
  /*
   * Keyed on isPro AS WELL AS the day count. Keying on days alone had the exact bug this file
   * warns about elsewhere: buying Pro while ON day 2 does not change the count, so the guard
   * returned early and the trial reminder survived the purchase — a paying user reminded their
   * trial is ending is what generates "I already paid" mail.
   */
  const key = `${days}:${String(s.isPro)}`;
  if (key === lastKey) return;
  lastKey = key;

  // One unconditional call. `applyTrialReminder(false)` cancels first and then does nothing, so
  // this both arms day 2 and clears a stale reminder on every other transition — including a
  // purchase, an expiry, and a seeded reset. An earlier version branched three ways to decide
  // whether cancelling was necessary and left one path where it was not.
  const arm = !s.isPro && days === TRIAL_DAYS - 1;
  void applyTrialReminder(arm).then((accepted) => {
    if (__DEV__ && arm && !accepted) {
      // Not an error: permission may simply not be granted. Logged so a session can tell the
      // difference between "declined by the OS" and "we never asked".
      console.log('[trial-reminder] day 2 reached, OS did not accept a schedule (permission?)');
    }
  });
});

// The failure this guards is silent by construction: opting in, seeing no error, and simply
// never being reminded. One dev-only assertion that the schedule really landed.
if (__DEV__) {
  setTimeout(() => {
    void (async () => {
      const { status } = await Notifications.getPermissionsAsync();
      /*
       * REPORT THE GROUND TRUTH, unconditionally. C13 decision 3 requires the day-2 reminder to be
       * verified against what the OS ACTUALLY accepted rather than what we asked for, and that is
       * impossible to check from outside the app. This line is how a session reads it: permission
       * status plus every identifier iOS is really holding. It prints even when permission is
       * denied, because "denied" is the answer that changes the paywall copy.
       */
      const queued = await scheduledNudges();
      console.log(
        `[notif] permission=${status} queued=[${queued.map((n) => n.identifier).join(', ')}] ` +
          `days=${String(useApp.getState().activeDays.length)} isPro=${String(useApp.getState().isPro)}`,
      );
      if (status !== 'granted') return; // nothing to assert until permission exists
      const all = queued;
      const daily = all.find((n) => n.identifier === DAILY_ID);
      if (!daily) return; // user has not opted in — not a failure
      // Assert only what this layer can actually see. The trigger comes back NORMALISED by the
      // native side, and `hour` is not reliably on its top level — an earlier version of this
      // check read `trigger.hour`, got undefined, and reported a broken schedule that iOS had
      // in fact stored correctly at 19:00. A self-check that cries wolf is worse than none.
      const t = daily.trigger as Record<string, unknown> | null;
      const hour = t?.hour ?? (t?.dateComponents as { hour?: number } | undefined)?.hour;
      if (hour !== undefined && hour !== NUDGE_HOUR) {
        console.error(`[nudge] scheduled at hour ${String(hour)}, expected ${NUDGE_HOUR}`);
      }
    })();
  }, 3000);
}
