/**
 * ONBOARDING ANSWERS MATTER PIN — every answer the flow offers must change something.
 *
 *   node --import ./scripts/ts-resolve-hooks.mjs scripts/onboarding-answers-matter-pin.mjs
 *   node --import ./scripts/ts-resolve-hooks.mjs scripts/onboarding-answers-matter-pin.mjs --selftest
 *
 * WHY. A question whose answers all produce the same path is worse than no question: it costs a new
 * user a screen and pretends to listen. Five offered answers did exactly that — riskComfort 'wait'
 * and 'buy', horizon 'soon' and 'year', and the blocker 'time' were tapped, written to the profile,
 * and matched by nothing in `candidates()`. A learner could answer three questions differently and
 * get a byte-identical path with byte-identical reasons.
 *
 * Nothing caught it, because every one of those screens WORKS. The taps register, the radio fills,
 * the flow advances. The failure is silent and lives one layer down, in a function no screen shows.
 *
 * WHAT COUNTS AS CHANGING SOMETHING. The reveal screen prints a course list AND the reason each
 * course earned its slot, so a mapping that reorders nothing but renames a reason is still a real
 * difference a learner reads. `horizon: 'soon'` leads with investing-fundamentals either way, but
 * it says "You want to start within a few months" instead of the generic goal line. This pin
 * therefore compares the (id, reason) pairs, not the ids.
 *
 * THE OPTION KEYS ARE READ OUT OF onboarding.tsx, not retyped here. A list retyped in a pin drifts
 * from the screen it is meant to be pinning, and then passes forever.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

globalThis.__DEV__ = false; // onboarding-path.ts runs its own dev assertions at import time

const ROOT = new URL('..', import.meta.url).pathname;
const imported = (path) => import(pathToFileURL(join(ROOT, path)).href);

const { EMPTY_PROFILE, recommendPathDetailed } = await imported('src/lib/onboarding-path.ts');

const SELFTEST = process.argv.includes('--selftest');
const src = readFileSync(join(ROOT, 'src/app/onboarding.tsx'), 'utf8');

/** Pull the `key:` values out of a named Choice[] literal in onboarding.tsx. */
function optionKeys(name) {
  const block = src.match(new RegExp(`const ${name}: Choice\\[\\] = \\[([\\s\\S]*?)\\n\\];`));
  assert.ok(block, `${name} not found in onboarding.tsx — was it renamed or removed?`);
  const keys = [...block[1].matchAll(/key:\s*'([^']+)'/g)].map((m) => m[1]);
  assert.ok(keys.length > 0, `${name} has no option keys`);
  return keys;
}

/**
 * The fields whose answers are supposed to steer the path, and how to write one onto a profile.
 *
 * `topics`, `experience` and `goal` are deliberately absent: they are covered by the dev assertions
 * in onboarding-path.ts and by the availability check there. This pin exists for the three fields
 * whose options were only PARTLY mapped, which is the failure that actually shipped.
 */
const STEERING = [
  { field: 'riskComfort', list: 'RISK', apply: (v) => ({ riskComfort: v }) },
  { field: 'horizon', list: 'HORIZONS', apply: (v) => ({ horizon: v }) },
  { field: 'blockers', list: 'BLOCKERS', apply: (v) => ({ blockers: [v] }) },
];

const fingerprint = (over) =>
  recommendPathDetailed({ ...EMPTY_PROFILE, ...over })
    .map((p) => `${p.course.id}::${p.reason}`)
    .join(' | ');

const base = fingerprint({});
assert.ok(base.length > 0, 'an empty profile produced no path at all');

const inert = [];
let checked = 0;
for (const { field, list, apply } of STEERING) {
  for (const key of optionKeys(list)) {
    checked += 1;
    if (fingerprint(apply(key)) === base) inert.push(`${field} = '${key}'`);
  }
}

if (inert.length) {
  console.error(`\nONBOARDING ANSWERS MATTER PIN FAILED — ${inert.length} offered answer(s) change nothing:\n`);
  inert.forEach((i) => console.error(`    ${i}`));
  console.error('\n  Each of these is a tap a new user pays for and receives nothing back.');
  console.error('  Map it in candidates() in src/lib/onboarding-path.ts, or take the option off');
  console.error('  the screen. Educational sequencing only — see the regulatory note in that file.\n');
  process.exit(1);
}

/**
 * THE NEGATIVE CONTROL. A profile field that nothing in `candidates()` reads must be caught, or
 * this pin cannot tell a mapped answer from an unmapped one.
 */
if (SELFTEST) {
  assert.equal(
    fingerprint({ ageBand: '25-34' }),
    base,
    'ageBand is expected to steer NOTHING — if that changed, this control needs rewriting',
  );
  // ...and a field that IS mapped must differ, so the comparison is not simply always-equal.
  assert.notEqual(fingerprint({ riskComfort: 'sell' }), base,
    'the pin cannot see a mapped answer changing the path');
  assert.notEqual(fingerprint({ horizon: 'soon' }), base,
    'the pin cannot see a reason-only change, which is what it exists to catch');

  console.log('[onboarding-answers-matter-pin] selftest ok — mapped and unmapped answers are distinguishable');
}

console.log(`[onboarding-answers-matter-pin] ok — ${checked} offered answers, every one moves the path or its reason`);
