/**
 * Mirrors today's learning activity (minutes, lessons, streak) to Supabase `daily_activity`.
 *
 * Subscribes to the store rather than living inside completeLesson, so the lesson path stays
 * synchronous and offline-first: the device is the source of truth, the server is a copy. The RPC
 * only ever raises a day's counts, so a retry or a second device cannot erase progress.
 *
 * Ceiling: push only. Restoring streak on a fresh install (pull + merge) is the next step.
 */
import { currentUserId, supabase } from './auth';
import { useApp } from './store';

let lastSent = '';

function push() {
  const sb = supabase();
  const s = useApp.getState();
  if (!sb || !currentUserId() || !s.lastActiveDay) return;
  const key = `${s.lastActiveDay}|${String(s.minutesToday)}|${String(s.lessonsToday)}|${String(s.streak)}`;
  if (key === lastSent) return;
  lastSent = key;
  // A failed send is not retried until the numbers change: the store writes on every tap, and
  // clearing lastSent on error would turn an outage (or the table not deployed yet) into a flood.
  // The next real change carries the full day's totals anyway, so nothing is lost.
  void sb.rpc('record_daily_activity', {
    p_day: s.lastActiveDay,
    p_minutes: s.minutesToday,
    p_lessons: s.lessonsToday,
    p_streak: s.streak,
  });
}

/** Call once at app start. Returns the unsubscribe. */
export function startActivitySync(): () => void {
  push();
  return useApp.subscribe(push);
}
