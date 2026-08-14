#!/usr/bin/env node
// ============================================================================
// 17d — pins the dismissal offer rule AND the surfaces that must consult it.
//
//   node scripts/dismissal-offer-regression.mjs
//
// WHY THE SECOND HALF EXISTS, and why it is the important one.
//
// The predicate was never wrong. §22 C115 was not a logic bug — it was a
// COVERAGE bug: the rule lived inside gate-sheet.tsx and three other surfaces
// rendered their own trial-expired walls that had never heard of it. A user whose
// trial expired and who tapped Start on Home dismissed a wall and never saw the
// highest-convergence lever in the unit. Verified on device: specialOfferSeenAt
// stayed null on that path and fired instantly on the one screen away.
//
// A unit test on the predicate would have passed the whole time. So this script
// also asserts, structurally, that every dismissible trial-expired wall consults
// the rule — because the next person to add a wall will not read C115.
// ============================================================================

import { readFileSync } from 'node:fs';

import { dismissalOfferAvailable } from '../src/lib/dismissal-offer.ts';

const base = { iapEnabled: true, isPro: false, specialOfferSeenAt: null };
const fail = [];
const check = (name, got, want) => {
  const ok = got === want;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${name}`);
  if (!ok) fail.push(`${name}: expected ${want}, got ${got}`);
};

console.log('\n17d — the dismissal offer\n');
console.log(' the rule');
check('unspent, not pro, store configured', dismissalOfferAvailable(base), true);
check('ALREADY PRO — never discount what they bought', dismissalOfferAvailable({ ...base, isPro: true }), false);
check('ALREADY SEEN — once per install, ever', dismissalOfferAvailable({ ...base, specialOfferSeenAt: 1786663702459 }), false);
check('NO STORE — an offer we cannot honour is a dead control', dismissalOfferAvailable({ ...base, iapEnabled: false }), false);
// The trap: `if (seenAt)` reads epoch 0 as unseen and re-mints the offer.
check('seen at epoch 0 is still SEEN', dismissalOfferAvailable({ ...base, specialOfferSeenAt: 0 }), false);
check('pro AND seen', dismissalOfferAvailable({ ...base, isPro: true, specialOfferSeenAt: 1 }), false);

/*
 * COVERAGE. Every file that renders a DISMISSIBLE trial-expired wall must consult the rule.
 *
 * onboarding.tsx is excluded on purpose: it IS the paywall, the place the offer sends people, so
 * offering there would be a loop. you.tsx is excluded because its expired state is an inline banner
 * with no dismiss control — there is no "before you go" moment to intercept.
 */
const WALLS = [
  ['src/app/lesson.tsx', 'the hard wall reached by tapping Start on Home'],
  ['src/app/chat.tsx', 'the expired-Atlas wall'],
  ['src/components/gate-sheet.tsx', 'the contextual gate'],
];

console.log('\n coverage — every dismissible wall consults the rule');
for (const [file, what] of WALLS) {
  const src = readFileSync(file, 'utf8');
  const consults = src.includes('dismissalOfferAvailable');
  const raises = src.includes('DismissalOfferSheet');
  const ok = consults && raises;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${file} — ${what}`);
  if (!consults) fail.push(`${file} never calls dismissalOfferAvailable — it can dismiss without offering`);
  else if (!raises) fail.push(`${file} checks the rule but never renders DismissalOfferSheet`);
}

/*
 * ONE COPY OF THE SHEET. The offer's headline used to be inline in gate-sheet.tsx; if it reappears
 * anywhere but the component, the two will drift and only one of them will be the approved copy.
 */
const HEADLINE = 'one better offer';
const owners = WALLS.map(([f]) => f)
  .concat('src/components/dismissal-offer-sheet.tsx')
  .filter((f) => readFileSync(f, 'utf8').includes(HEADLINE));
console.log('\n one definition of the copy');
const single = owners.length === 1 && owners[0].endsWith('dismissal-offer-sheet.tsx');
console.log(`  ${single ? 'ok  ' : 'FAIL'}  "${HEADLINE}" appears in exactly one file`);
if (!single) fail.push(`offer copy lives in ${owners.length} files: ${owners.join(', ')}`);

if (fail.length > 0) {
  console.log('\nFAILED\n');
  for (const f of fail) console.log(`  ${f}`);
  console.log('\nIf you added a trial-expired wall, it must call dismissalOfferAvailable and render');
  console.log('DismissalOfferSheet — or the offer is invisible on whatever path reaches it.\n');
  process.exit(1);
}

console.log('\nPASS — one rule, one sheet, and every wall that can let a user go asks first.\n');
