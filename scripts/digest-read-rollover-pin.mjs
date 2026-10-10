// A Digest read stamps lastActiveDay = today. Every per-day tally that rolls off lastActiveDay must
// roll in the same write, or quests.ts reads yesterday's count as today's: a guide read first thing
// showed "Finish a lesson" done before any lesson (found 2026-09-15, fixed 2026-09-28).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const store = readFileSync(new URL('../src/lib/store.ts', import.meta.url), 'utf8');
const block = store.match(/markPostRead: \(slug\) =>[\s\S]*?\n {6}setDailyPick:/)?.[0];
assert.ok(block, 'markPostRead is gone from store.ts; update this pin to wherever the Digest read lands');
assert.match(block, /lastActiveDay: today/, 'markPostRead no longer stamps the day; this pin is stale');
for (const tally of ['minutesToday', 'lessonsToday']) {
  assert.match(
    block,
    new RegExp(`${tally}: s\\.lastActiveDay === today \\? s\\.${tally} : 0`),
    `markPostRead stamps lastActiveDay without rolling ${tally}, so yesterday's ${tally} reads as today's`,
  );
}
console.log('digest-read-rollover-pin: OK — a Digest read rolls minutesToday and lessonsToday with the day stamp.');
