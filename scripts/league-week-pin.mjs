/**
 * A league week must resolve exactly once, and the zone boundaries must land where the screen
 * draws them.
 *
 * Two silent failure modes, both invisible without arranging a week boundary by hand:
 *
 *   PAYING TWICE. `resolveLeagueWeek` runs on every Home mount. Without the
 *   `lastWeekResolved === weekStart` guard it would mint 150 Euphorium per app launch — a currency
 *   exploit that no test would catch and no error would report, in an economy whose most expensive
 *   item costs 1000.
 *
 *   OFF-BY-ONE AT THE LINE. league.tsx draws PROMOTION ZONE above rank 3 and the demotion line at
 *   index >= 7. If resultFor disagrees by one, a user who watched themselves finish third is told
 *   they held, or someone at rank 7 is demoted from a position the screen showed as safe. That is
 *   the single most closely-watched number in the feature.
 *
 * The real module is imported, not re-implemented — a pin that copies the logic it guards tests
 * only its own copy.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  PROMOTE_RANK, DEMOTE_RANK, WEEK_BONUS, rankFor, resultFor, outcomeFor,
} from '../src/lib/league-week.ts';

/* The real rival scores, read out of people.ts as TEXT rather than imported. That file pulls in
 * app modules Node cannot resolve, and the point here is to rank against the numbers actually
 * shipped — not against a fixture that would keep passing after the field is retuned. */
const FIELD = [...readFileSync('src/lib/people.ts', 'utf8').matchAll(/weeklyXp:\s*(\d+)/g)]
  .map((m) => Number(m[1]));
assert.ok(FIELD.length > 0, 'no rival weeklyXp values found in people.ts — the field parse broke');

// ── the zone boundaries, from both sides
assert.equal(resultFor(1), 'promoted', 'first place must promote');
assert.equal(resultFor(PROMOTE_RANK), 'promoted', 'the last promotion slot must promote');
assert.equal(resultFor(PROMOTE_RANK + 1), 'held', 'one below the promotion line must NOT promote');
assert.equal(resultFor(DEMOTE_RANK - 1), 'held', 'one above the drop must be safe');
assert.equal(resultFor(DEMOTE_RANK), 'demoted', 'the first demotion rank must demote');

// ── rank is computed from the real field, and ties sit BELOW the rival, matching the stable sort
const top = Math.max(...FIELD);
assert.equal(rankFor(top + 1, FIELD), 1, 'out-earning every rival must finish first');
assert.equal(
  rankFor(top, FIELD), 2,
  'tying the leader must rank BELOW them — league.tsx sorts rivals before "You" and sort is stable',
);
assert.equal(rankFor(0, FIELD), FIELD.length + 1, 'a zero week must finish last');
assert.ok(
  rankFor(top + 1, FIELD) <= PROMOTE_RANK,
  'the promotion zone must be reachable at all — a field nobody can beat makes the ladder decorative',
);

// ── payout is bounded by the zone, never by effort
for (const xp of [0, 1, 50, 500, 5000, 1_000_000]) {
  const o = outcomeFor('2026-08-17', xp, FIELD);
  assert.ok(o.coins <= WEEK_BONUS.promoted, `payout must never exceed the promotion bonus (xp=${xp})`);
  assert.equal(o.coins, WEEK_BONUS[o.result], `payout must equal the zone bonus (xp=${xp})`);
  assert.equal(o.week, '2026-08-17', 'the outcome must carry the week it resolves');
}
assert.equal(outcomeFor('2026-08-17', 0, FIELD).coins, 0, 'a zero week pays nothing');

// ── the double-pay guard, asserted where it actually lives
const store = readFileSync('src/lib/store.ts', 'utf8');
assert.ok(
  /if \(!s\.weekStart \|\| s\.weekStart === wk \|\| s\.lastWeekResolved === s\.weekStart\) return s;/.test(store),
  'resolveLeagueWeek lost its guard — it runs on every Home mount and would pay the bonus repeatedly',
);
assert.ok(
  /lastWeekResolved: s\.lastWeekResolved/.test(store),
  'lastWeekResolved is not persisted, so every cold start would re-pay the last week',
);

console.log(
  `league-week-pin: OK — zone boundaries at ${PROMOTE_RANK}/${DEMOTE_RANK} against ${FIELD.length} rivals, ` +
  'payout bounded, ties rank below, double-pay guarded and persisted.',
);
