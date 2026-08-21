/**
 * The onboarding step index must never leave [0, count-1].
 *
 * Apple rejected iOS 1.0 (build 1.0.0(6), Apr 2026) under guideline 2.1(a) with a
 * screenshot of the onboarding header reading "6/5" over a blank body and a dead
 * Continue button -- an index past the end of STEPS, so `STEPS[renderStep]` was
 * undefined and nothing rendered. Apple described it as "the app became unresponsive
 * during onboarding process".
 *
 * clampStep is the guard. This asserts it holds, including the exact 6-of-5 case.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// The hook imports react-native, which will not load under plain node. Extract the pure
// function from source instead -- it is deliberately self-contained for exactly this.
const src = readFileSync(new URL('../src/shared/motion/step-transition.ts', import.meta.url), 'utf8');
const m = src.match(/export function clampStep\(n: number, count: number\): number \{([\s\S]*?)\n\}/);
assert.ok(m, 'clampStep not found in step-transition.ts — did it get renamed?');
const clampStep = new Function('n', 'count', m[1].replace(/: number/g, ''));

// the rejection, exactly: 5 steps, something asked for index 5 (displayed as "6/5")
assert.equal(clampStep(5, 5), 4, 'index 5 of 5 steps must clamp to the last step, not render blank');
assert.equal(clampStep(6, 5), 4, 'well past the end must clamp too');

// ordinary in-range traffic is untouched
for (let i = 0; i < 16; i++) assert.equal(clampStep(i, 16), i, `in-range ${i} must pass through`);

// lower bound
assert.equal(clampStep(-1, 16), 0);
assert.equal(clampStep(-999, 16), 0);

// non-integers and garbage cannot become an array index
assert.equal(clampStep(2.7, 16), 2, 'fractional index must truncate');
assert.equal(clampStep(NaN, 16), 0, 'NaN must not reach STEPS[]');
// Non-finite is garbage, and garbage resolves to 0 rather than to the last step.
// Clamping Infinity up to count-1 would fling the user onto the paywall and skip
// onboarding entirely, which is a worse failure than restarting at the first question.
assert.equal(clampStep(Infinity, 16), 0, 'a non-finite index must not jump to the paywall');
assert.equal(clampStep(-Infinity, 16), 0);

// degenerate counts must still yield a usable index
assert.equal(clampStep(3, 1), 0);
assert.equal(clampStep(3, 0), 0, 'an empty step list must not produce -1');

// and the guard must actually be wired into goTo, not merely exported
assert.ok(/const next = clampStep\(raw, count\)/.test(src),
  'clampStep exists but goTo does not use it — the guard is decorative');
assert.ok(/useStepTransition\(initial: number, scrollRef: RefObject<ScrollView \| null>, count: number\)/.test(src),
  'useStepTransition must take the step count so it can clamp');

const caller = readFileSync(new URL('../src/app/onboarding.tsx', import.meta.url), 'utf8');
assert.ok(/useStepTransition\(startStep, scrollRef, TOTAL\)/.test(caller),
  'onboarding.tsx must pass TOTAL, or the clamp has nothing to clamp against');

console.log('PASS — the onboarding step index cannot leave its range, and goTo is wired to the clamp.');
