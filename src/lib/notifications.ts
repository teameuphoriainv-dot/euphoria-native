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

import { Ev, track } from './analytics';
import { DEFAULT_NUDGE_HOUR, TRIAL_DAYS, useApp } from './store';
import { canSpend, clampToWindow, type NotifEntry } from './notif-budget';
import { getNews } from './market';

/**
 * UNIT 15a. Kept as a named re-export so existing callers and the dev self-check keep compiling,
 * but it is now only the DEFAULT. The hour actually scheduled comes from the store, because
 * Headway `128567` captures the time BEFORE the system prompt and that is what makes the prompt
 * convertible — the user has already decided when, so iOS is only asking whether.
 */
export const NUDGE_HOUR = DEFAULT_NUDGE_HOUR;

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

// Local notifications have no server receipt. A response is the first trustworthy user outcome,
// so measure the tap rather than pretending that an accepted schedule was a delivered message.
Notifications.addNotificationResponseReceivedListener((response) => {
  const kind = response.notification.request.content.data?.kind;
  if (typeof kind === 'string') track(Ev.notificationOpened, { kind });
});

/**
 * Apply the user's preference, and report what is ACTUALLY scheduled afterwards.
 *
 * Safe to call repeatedly: it cancels before it schedules, so re-answering the question — or
 * toggling this later from settings — can never stack duplicate daily reminders.
 */
export async function applyDailyNudge(
  optIn: boolean,
  hour: number = useApp.getState().nudgeHour,
): Promise<boolean> {
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
  track(Ev.notificationPermission, { status });
  if (status !== 'granted') return false;

  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_ID,
    content: {
      title: 'Keep your streak alive',
      body: 'Five minutes with Atlas is all it takes.',
      sound: true,
      data: { kind: 'streak' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute: 0,
    },
  });
  const accepted = (await scheduledNudges()).some((n) => n.identifier === DAILY_ID);
  if (accepted) track(Ev.notificationScheduled, { kind: 'streak' });
  return accepted;
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
  target.setHours(useApp.getState().nudgeHour, 0, 0, 0);
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
      data: { kind: 'billing' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: secondsToNextNudgeHour(now),
      repeats: false,
    },
  });
  // Report the truth: read it back rather than assuming the write landed.
  const all = await scheduledNudges();
  const accepted = all.some((n) => n.identifier === TRIAL_ID);
  if (accepted) track(Ev.notificationScheduled, { kind: 'billing' });
  return accepted;
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
      const want = useApp.getState().nudgeHour;
      if (hour !== undefined && hour !== want) {
        console.error(`[nudge] scheduled at hour ${String(hour)}, expected ${String(want)}`);
      }
    })();
  }, 3000);
}


/* ── WIN-BACK ──────────────────────────────────────────────────────────────────────────────────
 *
 * Three touches while someone is away, then silence. The intervals and the FRAMINGS are both from
 * measured behaviour, not taste:
 *
 *   day 3   reminder framing            recovers 15-25% of the cohort
 *   day 7   value-restatement framing   recovers 8-15%
 *   day 14  win-back framing            recovers 3-8%
 *
 * Two findings shape this and both are easy to get wrong. First, the same message three times
 * performs far worse than three different framings, so these deliberately do not rhyme with each
 * other. Second, CONTINUING PAST DAY 14 ACCELERATES UNINSTALL: after the third touch the correct
 * behaviour is to stop entirely rather than drop to a slower drip. There is no day 21 here, and
 * adding one would make this worse, not more thorough.
 *
 * Rescheduled from zero every time the user opens the app, because "three days after they last
 * used it" is the only reading of day 3 that means anything. Cancelling first means an active
 * user can never accumulate a queue of these.
 */
const WINBACK: { id: string; days: number; title: string; body: string }[] = [
  {
    id: 'euphoria-winback-3',
    days: 3,
    title: 'Three days off',
    body: 'Five minutes today puts you back on track.',
  },
  {
    id: 'euphoria-winback-7',
    days: 7,
    title: 'Markets moved this week',
    body: 'Come and see what changed while you were away.',
  },
  {
    id: 'euphoria-winback-14',
    days: 14,
    title: 'Your progress is saved',
    body: 'Pick up exactly where you left off.',
  },
];

/**
 * Schedule (or clear) the win-back sequence. Returns the ids the OS ACTUALLY accepted, which is
 * the same rule the two functions above document and for the same reason: what we asked for and
 * what iOS stored are different questions.
 *
 * Never requests permission. A lapsed user is the worst possible moment to raise a system prompt.
 */
export async function applyWinBack(schedule: boolean, now: Date = new Date()): Promise<string[]> {
  await Promise.all(
    WINBACK.map((w) => Notifications.cancelScheduledNotificationAsync(w.id).catch(() => undefined)),
  );
  if (!schedule) return [];

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') return [];

  const st = useApp.getState();
  const streakOn = st.profile.notifyOptIn === true;
  /*
   * Accumulated LOCALLY as well as read from the store. Scheduling three in one pass means the
   * second and third must see the first, and a store write does not land in time to be read back
   * inside the same loop.
   */
  const spent: NotifEntry[] = [...st.notifLedger];

  for (const w of WINBACK) {
    const at = clampToWindow(new Date(now.getTime() + w.days * 24 * 60 * 60 * 1000));
    const ms = at.getTime();
    if (!canSpend('winback', spent, ms, streakOn)) continue;

    const seconds = Math.round((ms - now.getTime()) / 1000);
    if (seconds <= 0) continue;

    await Notifications.scheduleNotificationAsync({
      identifier: w.id,
      content: { title: w.title, body: w.body, sound: true, data: { kind: 'winback' } },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
        repeats: false,
      },
    });
    spent.push({ at: ms, kind: 'winback' });
    st.recordNotif('winback', ms);
    track(Ev.notificationScheduled, { kind: 'winback', day: w.days });
  }

  // Read back what iOS is really holding rather than trusting the writes above.
  const queued = await scheduledNudges();
  return WINBACK.map((w) => w.id).filter((id) => queued.some((n) => n.identifier === id));
}

/*
 * ARMING IT. Keyed on the day the user was last active: opening the app on a new day pushes the
 * whole sequence out by that much. Same module-scope subscription pattern as the trial reminder,
 * and for the same reason given there.
 */
let lastDayKey = '';
useApp.subscribe((s) => {
  if (s.lastActiveDay === lastDayKey) return;
  lastDayKey = s.lastActiveDay;
  if (!s.lastActiveDay) return;
  void applyWinBack(true);
  // Same once-a-day trigger. Budget-gated inside, so on most days this schedules nothing at all.
  void applyMarketAlert();
});


/* ── MARKET NEWS ───────────────────────────────────────────────────────────────────────────────
 *
 * FOREGROUND-SCHEDULED, AND THAT LIMIT IS DELIBERATE. Firing the moment news breaks would need
 * expo-background-task or expo-task-manager, which are native modules this app does not have.
 * Adding one on submission day, to a build that is otherwise ready, is not a trade worth making.
 * So this reads the feed while the app is open and schedules at most one alert for later.
 *
 * What that genuinely cannot do: notice a story while the app has never been opened. Stated here
 * rather than discovered later, because a limitation nobody wrote down is indistinguishable from
 * a bug.
 *
 * WHAT EARNS AN INTERRUPTION. Alpha Vantage scores every article -1..1 and stops qualifying its
 * own label at 0.35: below that it says "Somewhat-Bullish" or "Somewhat-Bearish". A story the
 * provider itself will not call decisive is not worth a notification, so the bar is the provider's
 * boundary rather than a number picked here.
 *
 * And it is scoped to ONE symbol the user actually holds or watches. Market-wide news would fire
 * most days, which is the definition of the thing that gets an app muted.
 */
const MARKET_ID = 'euphoria-market-alert';

/** Alpha Vantage's own threshold for a decisively signed story. */
const STRONG_SENTIMENT = 0.35;

/**
 * Schedule at most one market-news alert. Returns the headline used, or null when nothing
 * qualified, which is the common and correct outcome on most days.
 *
 * Never requests permission, and never schedules a story that would land on a later day: news
 * delivered tomorrow morning about yesterday afternoon is not news.
 */
export async function applyMarketAlert(now: Date = new Date()): Promise<string | null> {
  await Notifications.cancelScheduledNotificationAsync(MARKET_ID).catch(() => undefined);

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') return null;

  const st = useApp.getState();
  // Their own holdings first, then the watchlist. No symbol of their own means no alert.
  const sym = Object.keys(st.positions)[0] ?? st.watchlist[0];
  if (!sym) return null;

  const at = clampToWindow(new Date(now.getTime() + 3 * 60 * 60 * 1000));
  // Clamping pushed it past midnight, so the story would arrive stale. Skip rather than mislead.
  if (at.getDate() !== now.getDate()) return null;
  if (!canSpend('market', st.notifLedger, at.getTime(), st.profile.notifyOptIn === true)) return null;

  let articles;
  try {
    articles = await getNews(sym);
  } catch {
    // getNews now rejects rather than returning []. A feed we could not read is not a quiet day,
    // and neither is a reason to bother the user.
    return null;
  }

  const strong = articles.find((a) => Math.abs(a.sentiment ?? 0) >= STRONG_SENTIMENT);
  if (!strong) return null;

  const seconds = Math.round((at.getTime() - now.getTime()) / 1000);
  if (seconds <= 0) return null;

  await Notifications.scheduleNotificationAsync({
    identifier: MARKET_ID,
    content: {
      title: `${sym} is in the news`,
      // The real headline, trimmed. Never a generated summary: rule 3.1, no invented content.
      body: strong.title.length > 120 ? `${strong.title.slice(0, 117)}...` : strong.title,
      sound: true,
      data: { kind: 'market' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
      repeats: false,
    },
  });
  st.recordNotif('market', at.getTime());

  // Read back what iOS actually holds, per the rule this file has followed since it was written.
  const queued = await scheduledNudges();
  const accepted = queued.some((n) => n.identifier === MARKET_ID);
  if (accepted) track(Ev.notificationScheduled, { kind: 'market' });
  return accepted ? strong.title : null;
}
