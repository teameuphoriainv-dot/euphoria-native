/**
 * N3 — the age floor is a GATE, not an absence.
 *
 * The audit said "Age range starts at 18 — needs to be expanded to include younger/older users."
 * Expanding it downward is the part that carries a legal edge: COPPA turns on ACTUAL KNOWLEDGE,
 * and onboarding collects a name, an age band, goals and an experience level.
 *
 * The failure mode this pin exists for is quiet and plausible: someone tidying the options list
 * deletes the "Under 13" row because "we don't support under-13 anyway". That silently converts a
 * working gate into a list a 12-year-old simply answers 13–17 to — which is worse than having no
 * gate, because now the app has a compliance story it does not actually implement.
 *
 * So all three parts are asserted together. Any one of them alone is not a floor.
 */
import { readFileSync } from 'node:fs';

const src = readFileSync('src/app/onboarding.tsx', 'utf8');
const fail = [];

if (!/export const AGE_FLOOR = 13;/.test(src)) fail.push('AGE_FLOOR is not 13.');
if (!/const UNDER_AGE = 'under-13';/.test(src)) fail.push('UNDER_AGE key is missing.');
if (!/\{ key: UNDER_AGE, title: `Under \$\{String\(AGE_FLOOR\)\}` \}/.test(src))
  fail.push('The AGES list no longer offers an under-13 option, so nobody can answer honestly.');
if (!/const underAge =[\s\S]{0,200}?underAgePick/.test(src))
  fail.push('The underAge predicate is gone.');
/*
 * AND IT MUST NOT READ THE PERSISTED PROFILE.
 *
 * This used to be `profile.ageBand === UNDER_AGE`, which only worked because the handler wrote the
 * answer to the store first — so the app recorded the age of a child it had just refused, and the
 * AGE FLOOR block's promise that "nothing is persisted" was false. The predicate now reads
 * component state. Asserting the absence keeps a later "simplification" from putting it back.
 */
if (/const underAge =[\s\S]{0,200}?profile\.ageBand === UNDER_AGE/.test(src))
  fail.push('underAge reads the persisted profile again — the under-13 answer is being stored.');
if (!/if \(underAge\) return false;/.test(src))
  fail.push('canContinue no longer blocks on under-13 — the option exists but does nothing.');
if (!/Euphoria is built for ages \$\{String\(AGE_FLOOR\)\} and up/.test(src))
  fail.push('The blocked step no longer states its reason, so the CTA is silently inert.');
/*
 * THE ONE THIS PIN ORIGINALLY MISSED. Single-select steps auto-advance on pick, so a disabled
 * Continue button is only half the gate: the first version of this fix blocked the button while
 * the screen had already moved to the next step. The pin passed; the simulator did not. Both
 * paths are asserted now, because either one alone is not a floor.
 */
const guard = src.match(/if \(def\.field === 'ageBand' && k === UNDER_AGE\) \{([\s\S]{0,200}?)\n\s*\}/);
if (!guard) fail.push('Picking under-13 auto-advances again — the disabled CTA is bypassed entirely.');
else {
  if (!/\breturn;/.test(guard[1]))
    fail.push('The under-13 branch no longer returns, so the pick advances the step.');
  if (/\banswer\s*\(/.test(guard[1]))
    fail.push('The under-13 branch calls answer() — the refused age is written to the store.');
}
/*
 * The guard has to come BEFORE the write, not after it. Ordering is the whole property here: an
 * early return that sits underneath `answer(def.field, k)` blocks the step and still records the
 * answer, which is what shipped.
 */
const handler = src.match(/onChange=\{\(k\) => \{([\s\S]*?)\n\s*\}\}/);
if (!handler) fail.push('The single-select onChange handler could not be found.');
else {
  const guardAt = handler[1].indexOf("k === UNDER_AGE");
  const answerAt = handler[1].indexOf('answer(def.field, k)');
  if (guardAt < 0 || answerAt < 0 || guardAt > answerAt)
    fail.push('answer() runs before the under-13 guard, so the refused age is persisted anyway.');
}

if (fail.length) {
  console.error('age-floor-pin: the age gate is not intact.');
  fail.forEach((f) => console.error('  ' + f));
  process.exit(1);
}
console.log('age-floor-pin: OK — under-13 is offered, blocks, says why, and is never stored.');
