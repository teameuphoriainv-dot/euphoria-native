/**
 * Tap feedback must be VISIBLE on a real tap, not merely specified.
 *
 * The owner reported "whenever I click on something, it doesn't become huge and become
 * small". They were right. SpringPressable nominally scaled to 0.97, but used
 * Spring.snappy (response 0.50s) -- and a spring does not jump to its target. On a
 * typical 80ms tap it had travelled 28.7% of the way, a 0.86% squish, while
 * Spring.press (response 0.25s) sat unused in tokens.ts, documented for this exact job.
 *
 * This pins the OUTCOME rather than the constants: whatever spring and scaleTo someone
 * picks later, the shrink an actual finger produces must clear the floor. A future edit
 * that swaps the spring back for a slower one fails here even though nothing "looks"
 * wrong in the diff.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const TAP_MS = 80;        // a normal tap; anything slower is a long-press
const MIN_SHRINK = 0.025; // 2.5% -- below this the feedback reads as nothing happening
const MIN_ZETA = 0.95;    // tokens.ts: "wobble on a ~100ms beat reads as lag rather than life"

const tokens = readFileSync(new URL('../src/shared/motion/tokens.ts', import.meta.url), 'utf8');
const press = readFileSync(new URL('../src/shared/motion/spring-pressable.tsx', import.meta.url), 'utf8');

const used = press.match(/withSpring\(scaleTo,\s*Spring\.(\w+)\)/);
assert.ok(used, 'SpringPressable no longer springs to scaleTo — has the press animation been removed?');
const name = used[1];

const tok = tokens.match(new RegExp(`\\b${name}:\\s*\\{([^}]*)\\}`));
assert.ok(tok, `Spring.${name} not found in tokens.ts`);
const num = (k) => {
  const m = tok[1].match(new RegExp(`${k}:\\s*([\\d.]+)`));
  assert.ok(m, `Spring.${name}.${k} missing`);
  return Number(m[1]);
};
const k = num('stiffness'), c = num('damping'), m = num('mass');

const scaleToM = press.match(/scaleTo = ([\d.]+)/);
assert.ok(scaleToM, 'scaleTo default not found');
const scaleTo = Number(scaleToM[1]);

const zeta = c / (2 * Math.sqrt(k * m));
const w0 = Math.sqrt(k / m);

/** fraction of the way from 1 to scaleTo at time t */
function travelled(t) {
  if (zeta < 1) {
    const wd = w0 * Math.sqrt(1 - zeta * zeta);
    return 1 - Math.exp(-zeta * w0 * t) *
      (Math.cos(wd * t) + (zeta / Math.sqrt(1 - zeta * zeta)) * Math.sin(wd * t));
  }
  return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
}

const frac = travelled(TAP_MS / 1000);
const shrink = (1 - scaleTo) * frac;

assert.ok(zeta >= MIN_ZETA,
  `Spring.${name} has zeta ${zeta.toFixed(3)}; press feedback must be near-critically damped `
  + `(>= ${MIN_ZETA}) or the release wobbles and reads as lag`);

assert.ok(shrink >= MIN_SHRINK,
  `a ${TAP_MS}ms tap only shrinks by ${(shrink * 100).toFixed(2)}% `
  + `(Spring.${name}, scaleTo ${scaleTo}, ${(frac * 100).toFixed(1)}% of travel) — `
  + `floor is ${(MIN_SHRINK * 100).toFixed(1)}%. Use a faster spring or a deeper scaleTo.`);

// and the scale must actually return to rest, or taps accumulate shrink
assert.ok(/withSpring\(1,\s*Spring\.\w+\)/.test(press), 'press release must spring back to 1');

console.log(`PASS — a ${TAP_MS}ms tap shrinks ${(shrink * 100).toFixed(2)}% `
  + `(Spring.${name}: zeta ${zeta.toFixed(3)}, response ${(2 * Math.PI / w0).toFixed(2)}s, `
  + `scaleTo ${scaleTo}), above the ${(MIN_SHRINK * 100).toFixed(1)}% floor.`);
