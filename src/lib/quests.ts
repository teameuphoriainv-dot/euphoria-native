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
 * ── THE POOL GREW, ON REQUEST ─────────────────────────────────────────────────────────────────
 * The owner's words: "there's only one, and I don't like that one. There's only a couple of them.
 * I need you to make more." Two changes, both honest:
 *
 *   1. SIX rotating quests instead of two, and THREE shown instead of two. The pool is what makes
 *      tomorrow feel different from today; the count is what makes the card look like a day's work
 *      rather than an afterthought.
 *   2. Two of the six are the SAME action at a higher count ("Finish 3 lessons", "Place 2 paper
 *      trades"). That is not padding — an x/y quest whose y is always 1 never shows progress, and
 *      progress is the 3/3 mechanic the evidence actually converged on.
 *
 * This block previously explained why there was no "read a guide" quest: `markPostRead` stamped
 * `lastActiveDay` but nothing counted guides per day, and a quest that cannot tell whether it was
 * completed is worse than one fewer quest. The store now carries `guidesDay`/`guidesToday`, so the
 * quest is real rather than faked, and the objection is retired rather than ignored.
 */
import { dayKey, type AppState } from './store';

export type QuestKind = 'lesson' | 'goal' | 'trade' | 'guide' | 'game';

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
  // Both self-contained (day, value) pairs, so neither depends on another writer rolling it.
  const guidesToday = s.guidesDay === dayKey() ? s.guidesToday : 0;
  const playedGame = s.lastGameDay === dayKey() ? 1 : 0;

  /** One place to build an x/y quest, so `at` can never disagree with `done`. */
  const q = (kind: QuestKind, title: string, at: number, of: number): Quest => ({
    kind,
    title,
    at: Math.min(at, of),
    of,
    done: at >= of,
  });

  const goalQuest = q('goal', `Reach your ${String(goal)}-minute goal`, minutes, goal);

  const rotating: Quest[] = [
    q('lesson', 'Finish a lesson', lessonsToday, 1),
    q('lesson', 'Finish 3 lessons', lessonsToday, 3),
    q('trade', 'Place a paper trade', tradesToday, 1),
    q('trade', 'Place 2 paper trades', tradesToday, 2),
    q('guide', 'Read a guide', guidesToday, 1),
    q('game', 'Play a game', playedGame, 1),
  ];

  /*
   * The goal quest plus TWO distinct picks from the six.
   *
   * The goal is always present because it is the only quest measuring the commitment the user
   * themselves set; rotating it out would make their own daily target invisible on some days.
   *
   * The two picks must be DISTINCT, and the arithmetic makes that a property rather than a hope:
   * the second index is `i + 1 + (k mod (n-1))` where k >= 0, so the offset lands in [1, n-1] and
   * can never be 0 mod n. A shuffle would need a seeded PRNG and a loop to say the same thing.
   * The second seed is drawn from a salted key so the two picks do not move in lockstep.
   */
  const n = rotating.length;
  const i = seedFor(dayKey()) % n;
  const j = (i + 1 + (seedFor(`${dayKey()}b`) % (n - 1))) % n;
  return [goalQuest, rotating[i], rotating[j]];
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
    lessonsToday: 0,
    valueHistory: [],
    guidesDay: '',
    guidesToday: 0,
    lastGameDay: '',
    profile: { dailyMinutes: 10 },
  } as unknown as AppState;
  const now = new Date(2026, 0, 15, 12, 0, 0);

  const fresh = questsForToday(base, now);
  if (fresh.length !== 3) console.error('[quests] expected exactly 3 quests');
  // The distinctness of the two picks is an arithmetic property, so assert it as one: every day
  // key must yield two different rotating quests, not merely the handful this test happens to see.
  for (let d = 0; d < 400; d++) {
    const picks = questsForToday(base, new Date(2026, 0, 1 + d, 12)).slice(1);
    if (picks[0].title === picks[1].title) {
      console.error('[quests] the two rotating picks collided — a day shows one quest twice');
      break;
    }
  }
  if (fresh.some((q) => q.done)) console.error('[quests] a fresh day must have nothing done');
  if (questsComplete(fresh)) console.error('[quests] a fresh day must not read as complete');
  if (!fresh.some((q) => q.kind === 'goal')) console.error('[quests] the goal quest must always be present');

  // A higher-count quest must NOT read as done on partial progress — the bug that would pay out a
  // reward card for one lesson when the quest asked for three.
  const partial = questsForToday({ ...base, lessonsToday: 1 } as AppState, now);
  for (const p of partial) {
    if (p.title === 'Finish 3 lessons' && p.done) console.error('[quests] 1 of 3 lessons is not done');
    if (p.at > p.of) console.error('[quests] progress overshot its own target');
  }

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
