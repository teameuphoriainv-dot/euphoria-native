/**
 * Daily quests — PURE DERIVATION. Not one byte of new persisted state.
 *
 * WHY DERIVED: a quest table in AsyncStorage would need a migration, would drift from the actions
 * that actually satisfy it, and would become a second source of truth about "did you do a lesson
 * today". Everything below is computed from fields the store already writes and already day-scopes.
 *
 * WHY DETERMINISTIC: picking quests with Math.random() reshuffles them on every render — a purity
 * violation (trap #11 territory) and a UX bug, because the user watches their goals change while
 * looking at them. The day key seeds the pick, so the set is stable for the whole day and rolls over
 * at midnight with no scheduled work.
 *
 * ── WHAT THE EVIDENCE ASKED FOR (ScreensDesign, Duolingo 862 + Bloom 2004) ────────────────────
 *   3/3  a daily quest set where every quest shows x/y progress
 *        Duolingo 112764 "Complete your next 2 lessons  2/2"
 *        Bloom 156310   "Complete 5 lessons ... 2/5 completed"
 *        Promova 138812 "7-day challenge" with a numbered sequence
 *   2/2  quests stated as a COUNT goal, never a vague encouragement
 *   2/2  a refresh countdown — Duolingo "12 HOURS", Bloom "17h 56m 16s"
 *   2/2  LOCKED future quests shown rather than hidden — Duolingo "Revealed in 2 days",
 *        Bloom "wait" + a lock. Same rule as §6.6.3's locked content: showing it makes the app
 *        look larger than what you have done today.
 *   1/3  an escalating per-day reward (Bloom's 10/20/30/40 Oinks) — NOT convergent, and Euphoria
 *        has no soft currency to escalate, so it is not copied (§0.5).
 *
 * ── WHY THERE IS NO "READ A GUIDE" QUEST, and this is deliberate ───────────────────────────────
 * §17.3 proposed one. The store has `readPosts` but nothing day-scoped about it — `markPostRead`
 * appends a slug and stamps `lastActiveDay`, so there is no honest way to ask "did you read one
 * TODAY" without adding a persisted counter. A quest that cannot tell whether you completed it is
 * worse than one fewer quest, so it is omitted rather than faked. Add a day-keyed guide counter to
 * the store and this becomes a fourth quest in about six lines.
 */
import { dayKey, type AppState } from './store';

export type QuestKind = 'lesson' | 'goal' | 'trade';

export type Quest = {
  kind: QuestKind;
  title: string;
  /** How far along, and out of what. Both real counts — this is the 3/3 mechanic. */
  at: number;
  of: number;
  done: boolean;
};

/** Stable per-day index from the day key. No Date.now() in render — trap #11. */
export function seedFor(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Local-midnight comparison. `valueHistory` stores epoch ms, so this is the honest "today" test. */
function isToday(ms: number, now: Date): boolean {
  const d = new Date(ms);
  return (
    d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
  );
}

/**
 * Today's quests, derived. `now` is injected rather than read inside so a caller can capture it once
 * and stay pure across a render — the same discipline portfolio-chart.tsx uses for its window.
 */
export function questsForToday(s: AppState, now: Date): Quest[] {
  const minutes = s.lastActiveDay === dayKey() ? s.minutesToday : 0;
  const goal = s.profile.dailyMinutes ?? 10;
  // COUNTED, not divided. This was `Math.floor(minutes / MINUTES_PER_LESSON)`, which held only
  // while every lesson credited the same fixed 5 minutes. completeLesson now credits real elapsed
  // time, so the division would report e.g. 3 lessons for one long one — and 0 for a fast one.
  const lessonsToday = s.lastActiveDay === dayKey() ? s.lessonsToday : 0;
  const tradesToday = s.valueHistory.filter((v) => isToday(v.t, now)).length;

  const all: Quest[] = [
    { kind: 'lesson', title: 'Finish a lesson', at: Math.min(lessonsToday, 1), of: 1, done: lessonsToday >= 1 },
    {
      kind: 'goal',
      title: `Reach your ${String(goal)}-minute goal`,
      at: Math.min(minutes, goal),
      of: goal,
      done: minutes >= goal,
    },
    { kind: 'trade', title: 'Place a paper trade', at: Math.min(tradesToday, 1), of: 1, done: tradesToday >= 1 },
  ];

  /*
   * Two of the three, chosen by the day key. Duolingo shows ONE daily quest plus locked upcoming
   * ones; Bloom shows many. Two is the middle and it keeps the card to a height Home can afford —
   * the whole reason Home had no quests is that nothing would fit, so a quest card that pushes the
   * course rail off the screen would trade one defect for another.
   *
   * The goal quest is always included because it is the only one that measures the commitment the
   * user actually set, and rotating it out would make the daily target invisible on some days.
   */
  const rotating = all.filter((q) => q.kind !== 'goal');
  const pick = rotating[seedFor(dayKey()) % rotating.length];
  return [all.find((q) => q.kind === 'goal')!, pick];
}

/** All of today's quests done. Feeds the reward hook-up in home.tsx. */
export const questsComplete = (q: Quest[]) => q.length > 0 && q.every((x) => x.done);

/** Hours until the quests roll over, for the 2/2 countdown convergence. Whole hours only — a
 *  ticking second counter would need a timer, and a timer on Home is a render loop waiting to
 *  happen for information nobody acts on to the second. */
export function hoursUntilReset(now: Date): number {
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.max(1, Math.round((midnight.getTime() - now.getTime()) / 3_600_000));
}

if (__DEV__) {
  // ONE runnable check. A quest that reports itself done when it is not would pay out a reward
  // card for nothing, which is a real-money-adjacent bug in an app that grants fractional shares.
  const base = {
    minutesToday: 0,
    lastActiveDay: dayKey(),
    valueHistory: [],
    profile: { dailyMinutes: 10 },
  } as unknown as AppState;
  const now = new Date(2026, 0, 15, 12, 0, 0);

  const fresh = questsForToday(base, now);
  if (fresh.length !== 2) console.error('[quests] expected exactly 2 quests');
  if (fresh.some((q) => q.done)) console.error('[quests] a fresh day must have nothing done');
  if (questsComplete(fresh)) console.error('[quests] a fresh day must not read as complete');
  if (!fresh.some((q) => q.kind === 'goal')) console.error('[quests] the goal quest must always be present');

  const met = questsForToday({ ...base, minutesToday: 10 } as AppState, now);
  const goalQ = met.find((q) => q.kind === 'goal');
  if (!goalQ?.done) console.error('[quests] 10 minutes against a 10-minute goal must be done');
  if (goalQ && goalQ.at !== goalQ.of) console.error('[quests] a done quest must show at === of');

  // The pick must not move within a day, which is the entire point of seeding it.
  const a = questsForToday(base, now).map((q) => q.kind).join();
  const b = questsForToday(base, now).map((q) => q.kind).join();
  if (a !== b) console.error('[quests] the daily pick is not stable');

  if (hoursUntilReset(new Date(2026, 0, 15, 23, 30, 0)) !== 1) console.error('[quests] 23:30 should read 1 hour');
}
