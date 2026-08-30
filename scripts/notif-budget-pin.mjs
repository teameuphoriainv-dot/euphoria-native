/**
 * THE NOTIFICATION BUDGET IS RESEARCH, NOT PREFERENCE, AND IT MUST NOT DRIFT.
 *
 * These are conservative launch limits selected from Apple's value/frequency guidance and broad
 * cross-industry frequency-capping guidance. They are not presented as another company's private
 * production limits. Change them only through a measured experiment with opt-out/uninstall guardrails.
 *
 * A cap is the kind of constant that gets nudged upward one release at a time, each nudge
 * defensible on its own, until the app is the thing people mute. This pin makes the number
 * argue back. Raising it should require deleting a line that explains why it is what it is.
 */
import { canSpend, clampToWindow, MAX_OTHER_PER_WEEK, MAX_PER_DAY, PRIORITY, prune, selfCheck, WINDOW_END_HOUR, WINDOW_START_HOUR } from '../src/lib/notif-budget.ts';

const fail = (msg) => {
  console.error(`[notif-budget-pin] ${msg}`);
  process.exit(1);
};

// 1. The module's own invariants (caps, clamping, pruning, priority).
try {
  selfCheck();
} catch (e) {
  fail(`self-check failed: ${e instanceof Error ? e.message : String(e)}`);
}

// 2. The researched numbers themselves.
if (MAX_PER_DAY !== 2) fail(`MAX_PER_DAY is ${MAX_PER_DAY}, expected the launch ceiling of 2.`);
if (MAX_OTHER_PER_WEEK !== 2) fail(`MAX_OTHER_PER_WEEK is ${MAX_OTHER_PER_WEEK}, expected the conservative launch ceiling of 2.`);
if (WINDOW_START_HOUR !== 9 || WINDOW_END_HOUR !== 21) fail(`delivery window is ${WINDOW_START_HOUR}..${WINDOW_END_HOUR}, expected 9..21. A notification at the wrong hour reads as spam whatever it says.`);
if (PRIORITY[0] !== 'billing') fail('billing must outrank every other kind: missing it costs the user money.');

// 3. The cap must actually BITE, not merely be declared. A constant nothing consults is decoration.
const noon = new Date('2026-08-25T12:00:00').getTime();
if (canSpend('market', [{ at: noon, kind: 'billing' }], noon, true)) {
  fail('canSpend allowed a second app-initiated notification on a day the streak reminder already holds a slot.');
}
if (canSpend('market', [{ at: noon - 2 * 864e5, kind: 'billing' }, { at: noon - 864e5, kind: 'winback' }], noon, false)) {
  fail('canSpend allowed a third app-initiated notification inside one rolling week.');
}
if (clampToWindow(new Date('2026-08-25T23:30:00')).getHours() !== WINDOW_START_HOUR) {
  fail('clampToWindow left a 23:30 delivery outside the window.');
}
if (prune([{ at: noon - 8 * 864e5, kind: 'market' }], noon).length !== 0) {
  fail('prune kept an entry older than a week; the ledger would grow without bound.');
}

console.log('[notif-budget-pin] ok');
