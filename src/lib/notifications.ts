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

// The failure this guards is silent by construction: opting in, seeing no error, and simply
// never being reminded. One dev-only assertion that the schedule really landed.
if (__DEV__) {
  setTimeout(() => {
    void (async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') return; // nothing to assert until permission exists
      const all = await scheduledNudges();
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
