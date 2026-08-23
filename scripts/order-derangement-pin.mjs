/**
 * No row of an ordering question may start in its correct slot.
 *
 * Reported 2026-08-22: "the drag-to-order steps sometimes load with answers already in the correct
 * position... Confirmed happening across every lesson." The guard was rejecting only the fully
 * solved arrangement, which still leaves ONE fixed point on average — and OrderSteps paints a row
 * in its correct slot green with a check, so the app was answering its own question.
 *
 * This is a PROBABILISTIC defect: it reproduces on some loads and not others, so a human spot-check
 * can pass on a broken build. It needs a pin. Pinning the OUTCOME rather than the source text means
 * a future rewrite of the shuffle still has to satisfy it.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const src = readFileSync(new URL('../src/components/order-steps.tsx', import.meta.url), 'utf8');

const body = src.match(/const shuffledOrder = \(n: number\): number\[\] => \{([\s\S]*?)\n\};/);
assert.ok(body, 'shuffledOrder not found in order-steps.tsx — was it renamed or moved?');

// Re-run the SHIPPED algorithm rather than a paraphrase of it: strip the types and evaluate.
const js = `(n) => {${body[1].replace(/: number\[\]/g, '').replace(/: number/g, '')}}`;
const shuffledOrder = eval(js);

// n = 1 has no derangement (D(1) = 0); it must return early rather than hang.
assert.deepEqual(shuffledOrder(1), [0], 'a single-item list must return as-is, not loop forever');
assert.deepEqual(shuffledOrder(0), [], 'an empty list must return empty');

const TRIALS = 20000;
for (const n of [2, 3, 4, 5, 6, 8]) {
  for (let t = 0; t < TRIALS / 4; t++) {
    const a = shuffledOrder(n);
    assert.equal(a.length, n, `length changed for n=${n}`);
    assert.deepEqual([...a].sort((x, y) => x - y), Array.from({ length: n }, (_, i) => i),
      `n=${n} produced something that is not a permutation: ${JSON.stringify(a)}`);
    const fixed = a.filter((v, i) => v === i);
    assert.equal(fixed.length, 0,
      `n=${n} returned ${JSON.stringify(a)} — position(s) ${JSON.stringify(fixed)} start already correct, `
      + 'so the lesson shows a green check before the learner has touched it');
  }
}

// and prove the pin could FAIL: the old guard must not satisfy it.
const oldGuard = (n) => {
  const a = Array.from({ length: n }, (_, i) => i);
  if (n <= 1) return a;
  do {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
  } while (a.every((v, i) => v === i));
  return a;
};
let sawFixedPoint = false;
for (let t = 0; t < 5000 && !sawFixedPoint; t++) sawFixedPoint = oldGuard(5).some((v, i) => v === i);
assert.ok(sawFixedPoint,
  'the PREVIOUS implementation passed this check — the pin cannot distinguish the bug from the fix');

console.log(`PASS — ${TRIALS} orderings across n=2..8, zero rows ever start in place; `
  + 'and the pre-fix shuffle is confirmed to fail this.');
