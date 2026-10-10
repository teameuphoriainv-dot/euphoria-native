/**
 * The App Group bridge (§15.3 consequence 2).
 *
 * The widget runs in a SEPARATE PROCESS. It cannot read zustand and it cannot read AsyncStorage,
 * so anything it renders has to be mirrored into a shared `UserDefaults(suiteName:)` container
 * that both sides can reach.
 *
 * Deliberately the same shape as the trial reminder in `lib/notifications.ts`: one module-scope
 * subscription with a transition guard, imported for its side effect by `_layout.tsx`. The guard
 * is not a micro-optimisation — WidgetKit RATE-LIMITS reload requests, and a widget that asks on
 * every XP tick and every trade gets its budget spent and then stops refreshing at all. Writing
 * only on a real change is what keeps the reloads meaningful.
 */
import { ExtensionStorage } from '@bacons/apple-targets';
import { Platform } from 'react-native';

import { dayKey, useApp } from './store';

/**
 * Declared ONCE in `app.json` under `ios.entitlements`; `targets/widget/expo-target.config.js`
 * mirrors it from there, so the app side and the widget side cannot drift apart. If this string
 * stops matching, `UserDefaults(suiteName:)` returns nil in the widget and it silently renders
 * zeros — there is no error to see.
 */
export const APP_GROUP = 'group.com.euphoriainv.euphoria';

const storage = Platform.OS === 'ios' ? new ExtensionStorage(APP_GROUP) : null;

let last = '';

/**
 * Mirror the widget's inputs. Exported so a test or a dev screen can force a write; the normal
 * path is the subscription below.
 */
export function syncWidget(s = useApp.getState()) {
  if (!storage) return;

  const today = dayKey();
  const goalMinutes = s.dailyGoalMinutes();
  /*
   * minutesDoneToday(), NOT s.minutesToday.
   *
   * store.ts declares the raw field "Minutes practised on lastActiveDay. Read via
   * minutesDoneToday(), which zeroes it once the day rolls over — don't read this field
   * directly." This module read it directly, and the consequence was the exact lie the widget's
   * staleness guard exists to prevent:
   *
   *   Finish 10/10 on day D. Open the app at 9am on D+1. The raw field still holds 10 because it
   *   is only rolled inside completeLesson/readGuide. today is now D+1, so the dedupe key changes
   *   and this writes minutesToday=10 under dayKey=D+1. The widget sees fresh data meeting the
   *   goal and renders "done" — for a day with zero minutes practised.
   *
   * The guard in mood.swift is correct; it was being fed poisoned input one layer up. Comparing
   * dayKey cannot catch this, because the stale minutes arrive wearing today's date.
   */
  const minutes = s.minutesDoneToday();

  /*
   * THE DEDUPE KEY MUST NAME EVERY FIELD WE WRITE.
   *
   * This guard exists because WidgetKit rate-limits reloads and a widget that asks on every XP
   * tick spends its budget and then stops refreshing at all. But the guard is also the most
   * dangerous line in this file: a field written below and MISSING from this key will never
   * trigger a reload, so the widget renders the old value forever and simply looks "stuck".
   * There is no error, no warning, and nothing in the UI that says the data is old.
   *
   * The key was `streak:xp:dayKey` while the widget rendered exactly those three. Anything added
   * to the writes below MUST be added here in the same edit.
   */
  const key = [s.streak, s.xp, s.bestStreak, minutes, goalMinutes, today, s.lastActiveDay, s.streakFreezes].join(':');
  if (key === last) return;
  last = key;

  storage.set('streak', s.streak);
  storage.set('xp', s.xp);
  /** Tells a streak of 0 that was NEVER started apart from one that lapsed. Different message. */
  storage.set('bestStreak', s.bestStreak);
  /*
   * Progress toward the daily goal, in MINUTES.
   *
   * goal-minutes-pin.mjs holds the rule that the daily goal counts TIME and quests count LESSONS,
   * and that neither may be derived from the other — a regression in 2026-08 had completeLesson
   * adding a flat minutes-per-lesson, so the goal counted lessons and called them minutes. The
   * widget mirrors the same two numbers rather than recomputing, so it cannot reintroduce that.
   */
  storage.set('minutesToday', minutes);
  storage.set('goalMinutes', goalMinutes);
  /*
   * dayKey is LOAD-BEARING, not metadata. `minutesToday` is only meaningful for the day it was
   * written: if the user practised yesterday and has not opened the app today, this container
   * still holds yesterday's minutes. The widget compares this key against its own current date
   * and treats a stale one as "not done today" — without that comparison it would tell a user
   * they had already practised when they had not, which is the one lie a streak widget must
   * never tell.
   */
  /*
   * lastActiveDay is what makes a LOST streak representable at all.
   *
   * nextStreak() in day-keys.ts returns streak, streak+1, or 1 — never 0 — and no launch-time
   * reconcile decays a broken one. So `streak == 0 && bestStreak > 0`, which the widget used as
   * its lapsed condition, is a state the app can never produce. After a missed day the widget
   * kept rendering "12 · Not done yet" indefinitely: a dead streak drawn as live, which is the
   * one thing a streak widget exists to get right.
   *
   * With the last active day mirrored, the widget derives liveness itself instead of waiting for
   * a zero that never comes.
   */
  storage.set('lastActiveDay', s.lastActiveDay);
  /** Freezes make a gap legitimate. Without this the widget would cry lapsed on a protected day. */
  storage.set('streakFreezes', s.streakFreezes);
  storage.set('dayKey', today);

  /*
   * Scoped to our one kind. `reloadWidget()` with no argument calls reloadAllTimelines(), and
   * each widget INSTANCE has its own refresh budget — so an unscoped reload spends budget on
   * every other kind the moment a second one exists.
   */
  ExtensionStorage.reloadWidget('EuphoriaWidget');
}

useApp.subscribe((s) => {
  syncWidget(s);
});

/*
 * Hydrate on cold start. Without this, a user who adds the widget and then does not complete a
 * lesson sees zeros until their next store write — the widget would be lying about a streak they
 * actually have. The guard above makes the repeat call free.
 */
syncWidget();
