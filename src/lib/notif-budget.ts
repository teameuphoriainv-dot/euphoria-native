/**
 * HOW OFTEN EUPHORIA IS ALLOWED TO SPEAK.
 *
 * Nothing in this file schedules anything. It decides whether a notification may be scheduled at
 * all, and at what hour — deliberately separated from `notifications.ts` so the rule can be tested
 * without an OS, and so a fifth notification type cannot be added without passing through here.
 *
 * THE NUMBERS ARE NOT GUESSED. They come from what the winning apps actually do:
 *   - Duolingo caps at 2 push notifications per day. Its gamification programme cut churn from
 *     47% to 28% and holds ~55% month-over-month DAU retention, roughly double the category.
 *   - Across mobile generally, users receiving MORE THAN 6 app-initiated pushes a week are 3.4x
 *     more likely to uninstall within 30 days, and CTR falls 10-20% for each message past five.
 *
 * The reconciliation that shapes this file: a streak reminder the user switched on and set the
 * hour for is NOT an app-initiated push. It is their own alarm clock, which is why Duolingo can
 * send one daily without paying the uninstall penalty. Everything else IS app-initiated, so it
 * draws from a separate and much tighter weekly budget.
 *
 *   streak    1/day, at the hour they chose, outside the shared budget
 *   others    MAX_OTHER_PER_WEEK per rolling week, and never more than one on the same day
 *   all       never outside WINDOW_START_HOUR..WINDOW_END_HOUR
 */

/** Every kind of notification the app may send. Adding one here forces a decision about budget. */
export type NotifKind = 'streak' | 'billing' | 'winback' | 'market';

/**
 * Who wins when two want the same slot. Billing first because missing it COSTS THE USER MONEY —
 * a missed trial-ending notice is a charge they did not expect, which is a refund request and a
 * one-star review. Market news is last because it is the only one that is merely interesting.
 */
export const PRIORITY: readonly NotifKind[] = ['billing', 'winback', 'market'] as const;

/** Duolingo's ceiling, counting the streak reminder. */
export const MAX_PER_DAY = 2;

/** App-initiated messages per rolling 7 days. Well under the 6/week uninstall cliff. */
export const MAX_OTHER_PER_WEEK = 2;

export const WINDOW_START_HOUR = 9;
export const WINDOW_END_HOUR = 21;

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

/** One delivered-or-scheduled notification. Persisted, so the budget survives a restart. */
export type NotifEntry = { at: number; kind: NotifKind };

/**
 * Move a delivery time inside the allowed window.
 *
 * Before 9am is pulled FORWARD to 9am the same day; after 9pm is pushed to 9am the NEXT day. A
 * notification is never silently dropped for being out of hours, because a dropped win-back is
 * indistinguishable from a win-back that was never written — the failure this whole session has
 * been hunting.
 */
export function clampToWindow(at: Date): Date {
  const out = new Date(at.getTime());
  const h = out.getHours();
  if (h < WINDOW_START_HOUR) {
    out.setHours(WINDOW_START_HOUR, 0, 0, 0);
  } else if (h >= WINDOW_END_HOUR) {
    out.setDate(out.getDate() + 1);
    out.setHours(WINDOW_START_HOUR, 0, 0, 0);
  }
  return out;
}

/** Entries inside the last `ms`. Future-dated entries count too: a notification already queued for
 *  tomorrow has spent its slot, and ignoring it is how a budget gets double-spent. */
function within(ledger: readonly NotifEntry[], now: number, ms: number): NotifEntry[] {
  return ledger.filter((e) => e.at > now - ms);
}

/** Same local calendar day. Not `< 24h`: two notifications 23 hours apart on different days read
 *  as one a day to a person, and that is whose opinion matters here. */
function sameDay(a: number, b: number): boolean {
  const x = new Date(a);
  const y = new Date(b);
  return (
    x.getFullYear() === y.getFullYear() && x.getMonth() === y.getMonth() && x.getDate() === y.getDate()
  );
}

/**
 * May this kind be scheduled for `at`?
 *
 * `streakEnabled` is passed in rather than read from the store so this stays pure. It matters
 * because an enabled streak reminder already occupies one of the two daily slots every single day,
 * which is precisely what stops "2 per day" from quietly meaning three.
 */
export function canSpend(
  kind: NotifKind,
  ledger: readonly NotifEntry[],
  at: number,
  streakEnabled: boolean,
): boolean {
  // Their own alarm, at their own hour. Never blocked, and never charged to the shared budget.
  if (kind === 'streak') return true;

  const dayUsed = within(ledger, at, DAY_MS).filter((e) => sameDay(e.at, at)).length;
  const streakSlot = streakEnabled ? 1 : 0;
  if (dayUsed + streakSlot >= MAX_PER_DAY) return false;

  const weekUsed = within(ledger, at, WEEK_MS).filter((e) => e.kind !== 'streak').length;
  return weekUsed < MAX_OTHER_PER_WEEK;
}

/** Drop entries older than a week. Called on write so the ledger cannot grow without bound. */
export function prune(ledger: readonly NotifEntry[], now: number): NotifEntry[] {
  return ledger.filter((e) => e.at > now - WEEK_MS);
}

/* ── SELF-CHECK ────────────────────────────────────────────────────────────────────────────────
 * Run with: node --experimental-strip-types src/lib/notif-budget.ts
 * Also runs inside scripts/notif-budget-pin.mjs, which is wired into `npm run check`.
 */
export function selfCheck(): void {
  const ok = (cond: boolean, msg: string) => {
    if (!cond) throw new Error(`[notif-budget] ${msg}`);
  };
  const at = new Date('2026-08-25T14:00:00').getTime();

  // Streak is exempt in both directions.
  ok(canSpend('streak', [], at, true), 'streak must always be allowed');
  ok(
    canSpend('streak', [{ at, kind: 'billing' }, { at, kind: 'market' }], at, true),
    'streak must not be blocked by a full shared budget',
  );

  // With the streak on, exactly ONE other may go out that day.
  ok(canSpend('billing', [], at, true), 'first other of the day should fit beside the streak');
  ok(
    !canSpend('market', [{ at, kind: 'billing' }], at, true),
    'a second other on the same day must be refused when the streak holds a slot',
  );
  // With the streak off, two others fit — that is the whole daily cap.
  ok(
    canSpend('market', [{ at, kind: 'billing' }], at, false),
    'without a streak reminder the second daily slot is free',
  );

  // The weekly ceiling bites even when the days are different.
  const d1 = at - 3 * DAY_MS;
  const d2 = at - 1 * DAY_MS;
  ok(
    !canSpend('market', [{ at: d1, kind: 'billing' }, { at: d2, kind: 'winback' }], at, false),
    'a third app-initiated message inside one week must be refused',
  );
  // ...and stops biting once they age out.
  ok(
    canSpend('market', [{ at: at - 8 * DAY_MS, kind: 'billing' }], at, false),
    'an entry older than a week must not count against the budget',
  );
  // Streak entries never consume the weekly budget.
  ok(
    canSpend('market', [{ at: d1, kind: 'streak' }, { at: d2, kind: 'streak' }], at, false),
    'streak entries must not consume the weekly other-budget',
  );

  // Window clamping, all three cases.
  const early = clampToWindow(new Date('2026-08-25T06:30:00'));
  ok(early.getHours() === WINDOW_START_HOUR, 'pre-window time must move to 9am same day');
  ok(early.getDate() === 25, 'pre-window time must NOT roll to the next day');
  const late = clampToWindow(new Date('2026-08-25T23:10:00'));
  ok(late.getHours() === WINDOW_START_HOUR, 'post-window time must move to 9am');
  ok(late.getDate() === 26, 'post-window time must roll to the next day');
  const fine = clampToWindow(new Date('2026-08-25T14:00:00'));
  ok(fine.getHours() === 14 && fine.getDate() === 25, 'in-window time must be left alone');

  // Pruning keeps the ledger bounded.
  ok(prune([{ at: at - 8 * DAY_MS, kind: 'market' }], at).length === 0, 'stale entries must prune');
  ok(prune([{ at: at - 1 * DAY_MS, kind: 'market' }], at).length === 1, 'fresh entries must survive');

  // Priority is a total order over the app-initiated kinds, billing first.
  ok(PRIORITY[0] === 'billing', 'billing must outrank everything: missing it costs the user money');
  ok(PRIORITY.length === 3, 'every non-streak kind must have a documented rank');
}
