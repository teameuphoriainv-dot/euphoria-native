/**
 * COMPRESS MEANING PIN — the compressor may shorten a sentence, never change what it claims.
 *
 *   node --import ./scripts/ts-resolve-hooks.mjs scripts/compress-meaning-pin.mjs
 *   node --import ./scripts/ts-resolve-hooks.mjs scripts/compress-meaning-pin.mjs --selftest
 *
 * WHY THIS EXISTS. `compress.ts` promises, in its own header, that it only picks and trims
 * sentences the curriculum author wrote and never invents a claim. `stripFiller` broke that
 * promise in two ways at once, and both shipped:
 *
 *   1. 'rather' was on the hedge list, so "suitable investments rather than those that generate
 *      the highest fees" rendered as "suitable investments than those that generate the highest
 *      fees". That is the FIDUCIARY STANDARD with its contrast deleted. 16 cards across 6 courses
 *      read that way, including the definitions of value-based pricing and a meme stock.
 *
 *   2. 'one of the' was on the same list, so "is one of the strongest indicators of a moat"
 *      rendered as "is strongest indicators of a moat" — ungrammatical, and a membership claim
 *      promoted into a superlative the author never made.
 *
 * WHY A PIN RATHER THAN A FIX ALONE. Neither bug fails a type check, neither empties a card, and
 * both produce output that LOOKS like prose in a list of 2,402 cards. The deck audit was green
 * through the whole thing. The only thing that catches this class is asserting the property.
 *
 * WHAT IT ASSERTS. Two things, both over the real corpus and the shipped `compress`:
 *   - No output contains a comparative "than" with nothing to compare against.
 *   - No output contains "is/are + bare plural superlative", the signature of a stripped
 *     membership phrase.
 * Plus a negative control: the pre-fix filler list must FAIL this pin, or the pin proves nothing.
 */
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = new URL('..', import.meta.url).pathname;
const imported = (path) => import(pathToFileURL(join(ROOT, path)).href);

const { COURSES, loadCourseLessons } = await imported('src/lib/curriculum/courseIndex.ts');
const { deriveDeck, isHeavyStep } = await imported('src/lib/mobile-lesson/derive.ts');
const { stepId } = await imported('src/lib/mobile-lesson/stepId.ts');

const SELFTEST = process.argv.includes('--selftest');

/**
 * Words that license a following "than". Deliberately broad, including the `-er` catch-all, so the
 * pin flags only a "than" with genuinely nothing in front of it rather than every idiom.
 */
const LICENSES_THAN =
  /\b(?:rather|more|less|fewer|greater|other|otherwise|better|worse|else|nothing|no one|nobody|different|differently|prefer\w*|sooner|further|farther|beyond|[a-z]+er)\b/i;

/**
 * Words that END in -s (or ARE "as") but are not plural nouns. Without this the noun slot below
 * matches the "as" in "is only as good as", which is ordinary English and not a defect.
 */
const NOT_A_PLURAL_NOUN = '(?!(?:as|is|was|has|its|this|thus|us|plus|versus|less|unless|across|always|perhaps)\\b)';

/** "is/are/was/were + superlative + plural noun" — what a stripped "one of the" leaves behind. */
const BARE_SUPERLATIVE = new RegExp(
  '\\b(?:is|are|was|were|becomes?|became|remains?|stays?)\\s+'
  + '(?:most|least|best|worst|first|only|leading|largest|biggest|highest|lowest|strongest|weakest'
  + '|richest|poorest|greatest|[a-z]+est)\\s+'
  + NOT_A_PLURAL_NOUN + '[a-z]+s\\b',
  'i',
);

/**
 * The clause a "than" actually belongs to: everything back to the last hard break.
 *
 * A period between two digits is a DECIMAL POINT, not a sentence end. Splitting on it cut
 * "sits closer to South Africa at 0.63 than to Denmark" down to "63 than to Denmark", which threw
 * away the "closer" that licenses the comparison and reported a clean sentence as broken.
 */
function clauseBefore(text, idx) {
  const head = text.slice(0, idx).replace(/(\d)\.(\d)/g, '$1\u2024$2');
  return head.split(/[,.;:!?()"]/).pop();
}

function violations(text) {
  const out = [];
  for (const m of text.matchAll(/\bthan\b/gi)) {
    if (!LICENSES_THAN.test(clauseBefore(text, m.index))) {
      out.push({ kind: 'dangling-than', text });
      break;
    }
  }
  const sup = text.match(BARE_SUPERLATIVE);
  if (sup) out.push({ kind: 'bare-superlative', text, hit: sup[0] });
  return out;
}

/** Every string the learner can actually read on a card, with the deck it came from. */
function stringsOf(deck) {
  const out = [];
  const walk = (v) => {
    if (typeof v === 'string') out.push(v);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') Object.values(v).forEach(walk);
  };
  (deck.cards ?? []).forEach(walk);
  return out;
}

let decks = 0;
let strings = 0;
const failures = [];

for (const course of COURSES) {
  let lessons;
  try {
    lessons = await loadCourseLessons(course.id);
  } catch {
    continue; // a course with no synced lessons is the availability layer's business, not this pin's
  }
  for (const lesson of lessons) {
    (lesson.steps ?? []).forEach((step, i) => {
      if (!isHeavyStep(step)) return;
      const id = stepId(course.id, lesson, i, step);
      let deck;
      try {
        deck = deriveDeck(step, id);
      } catch {
        return; // deriveDeck throwing is mobile-deck-audit.mjs's assertion, not this one
      }
      if (!deck) return;
      decks += 1;
      for (const s of stringsOf(deck)) {
        strings += 1;
        for (const v of violations(s)) failures.push({ id, ...v });
      }
    });
  }
}

assert.ok(decks > 500, `only ${decks} decks derived — the corpus did not load, so a pass is meaningless`);

if (failures.length) {
  console.error(`\nCOMPRESS MEANING PIN FAILED — ${failures.length} card string(s) changed meaning:\n`);
  for (const f of failures.slice(0, 20)) {
    console.error(`  [${f.kind}] ${f.id}\n    HIT: ${JSON.stringify(f.hit ?? f.text.match(/[^.]*\bthan\b[^.]*/i)?.[0]?.trim())}\n    ${f.text.slice(0, 200)}\n`);
  }
  if (failures.length > 20) console.error(`  ...and ${failures.length - 20} more.\n`);
  console.error('A hedge on FILLER in src/lib/mobile-lesson/compress.ts is load-bearing in front of');
  console.error('the word that follows it. Guard it in NEVER_BEFORE, or take it off the list.\n');
  process.exit(1);
}

/**
 * THE NEGATIVE CONTROL.
 *
 * A pin that cannot go red is decoration. The pre-fix behaviour was exactly `stripFiller` with
 * 'rather' unguarded and 'one of the' present, so reproduce that and require it to trip both rules
 * on the two sentences that actually shipped broken.
 */
if (SELFTEST) {
  const preFix = (text) =>
    ['rather', 'one of the'].reduce((s, w) => s.replace(new RegExp(`\\b${w}\\b\\s*`, 'gi'), ''), text);

  const FIDUCIARY =
    "A legal obligation requiring financial advisors to act solely in the client's best interest, "
    + 'recommending the most cost-effective and suitable investments rather than those that generate '
    + 'the highest fees or commissions.';
  const MOAT = 'Consistently high ROE across multiple years is one of the strongest indicators of a competitive moat.';

  assert.equal(violations(FIDUCIARY).length, 0, 'the authored fiduciary sentence must be clean');
  assert.equal(violations(MOAT).length, 0, 'the authored moat sentence must be clean');

  const brokeThan = violations(preFix(FIDUCIARY)).some((v) => v.kind === 'dangling-than');
  const brokeSup = violations(preFix(MOAT)).some((v) => v.kind === 'bare-superlative');
  assert.ok(brokeThan, 'the pin cannot see the "rather than" bug it was written for');
  assert.ok(brokeSup, 'the pin cannot see the "one of the" bug it was written for');

  // And it must not be trigger-happy: ordinary comparatives are not violations.
  for (const ok of [
    'Growth stocks are more volatile than value stocks.',
    'It is one of the reasons the fund underperformed.',
    'This is a large position for a beginner to hold.',
    'Bonds carry less risk than equities over a single year.',
    'She would rather hold cash.',
  ]) {
    assert.equal(violations(ok).length, 0, `false positive on: ${ok}`);
  }

  console.log('[compress-meaning-pin] selftest ok — both bugs are detectable and clean prose passes');
}

console.log(
  `[compress-meaning-pin] ok — ${strings} card strings across ${decks} decks, `
  + 'no dangling comparative and no invented superlative',
);
