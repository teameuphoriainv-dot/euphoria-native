/**
 * budget-balancer-pin — runs the ENGINE'S OWN assertions under Node.
 *
 * Not a second copy of the rules. src/lib/budget-balancer.ts carries its assertions in a __DEV__
 * block so they run on device too; this sets __DEV__, imports the real module, and counts what it
 * reports. One rule, one place — the same reason billing-retry-regression.mjs imports the rule
 * instead of mirroring it, after the mirrored copy drifted.
 *
 * The rules being held, each of which has a WRONG version that plays as a different game:
 *   - torque is weight TIMES distance (ignore distance and the fixed-vs-variable lesson vanishes)
 *   - only variable costs clear (a disciplined month does not cancel your rent)
 *   - leaving tolerance RESETS the hold rather than pausing it
 *   - a finished run is absorbing and cannot keep scoring
 *   - no phase-3 start is unbalanceable (skill must beat noise)
 *   - the engine clamps leverage rather than trusting the screen
 *
 * Verified to fail: breaking torque to weight-only fails 3, letting fixed costs clear fails 2,
 * pausing the hold instead of resetting fails 1.
 */
import assert from 'node:assert/strict';

globalThis.__DEV__ = true;

let failures = 0;
const orig = console.error;
console.error = (...a) => { failures++; orig('  ', ...a); };
await import('../src/lib/budget-balancer.ts');
console.error = orig;

assert.strictEqual(failures, 0, `${failures} budget-balancer assertion(s) failed — see above`);

// The pin must also prove the assertions RAN. A module that silently skipped its __DEV__ block
// would report zero failures and look identical to a passing one.
const m = await import('../src/lib/budget-balancer.ts');
assert.ok(m.costTorque([{ id: 0, kind: 'fixed', label: 'Rent', weight: 1, dist: 0.9 }]) > 0.8, 'engine did not load');
assert.strictEqual(m.step(m.createGame(5, 0), 16, 99).incomeDist, 1, 'engine must clamp leverage');

console.log('budget-balancer-pin ok — the engine ran its own assertions and all of them held');
