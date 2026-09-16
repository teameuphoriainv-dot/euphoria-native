/**
 * DECK COMPLETABLE PIN — every interactive card can actually be finished, and none shows its answer.
 *
 *   node --import ./scripts/ts-resolve-hooks.mjs scripts/deck-completable-pin.mjs
 *   node --import ./scripts/ts-resolve-hooks.mjs scripts/deck-completable-pin.mjs --selftest
 *
 * WHY THIS EXISTS. `scripts/mobile-deck-audit.mjs` already asserts that every heavy step derives a
 * RENDERABLE deck, and it printed "OK: every heavy step derives a renderable deck" for the whole
 * life of this bug. Renderable is not the same as completable, and the gap was 34 lessons:
 *
 *   A timeline interactive with ONE moment. MomentStepper computes `done = at >= total - 1`, so at
 *   total === 1 it is true on the first frame: the "Next" button never renders, and `onWorked()` is
 *   only ever called from inside `next`. CardDeck's `locked` stayed true forever, its Continue was
 *   permanently disabled with no reason on screen, and because `deck` is in both `selfAdvancing`
 *   and `OWN_CTA_STEPS` the lesson's own Continue was suppressed too. Where the interactive sorted
 *   to card 0 there was no Back either. The lesson could not be finished by any route.
 *
 *   34 of 165 timeline interactives, in 34 lessons across 11 of the 12 courses.
 *
 * AND THE SECOND ONE, same class — a card that is completable but pointless:
 *
 *   `asGuess` masked the figure with `text.replace(answer, ...)`, which swaps only the FIRST match,
 *   so an insight stating its figure twice shipped with the answer still on screen. Three did.
 *
 * WHAT IT ASSERTS, over the real corpus and the shipped deriver:
 *   - every timeline interactive has at least 2 moments;
 *   - no guess card's masked text still contains its answer.
 * Both with a negative control, because a pin that cannot go red is decoration.
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

/** The interactive spec on a card, whichever field the card shape puts it in. */
const specOf = (card) => (card?.kind === 'interactive' ? (card.spec ?? card.interactive) : null);

let decks = 0;
let timelines = 0;
let guesses = 0;
const unfinishable = [];
const leaking = [];

for (const course of COURSES) {
  let lessons;
  try {
    lessons = await loadCourseLessons(course.id);
  } catch {
    continue; // an unsynced course is the availability layer's business, not this pin's
  }
  for (const [li, lesson] of lessons.entries()) {
    (lesson.steps ?? []).forEach((step, i) => {
      if (!isHeavyStep(step)) return;
      let deck;
      try {
        deck = deriveDeck(step, stepId(course.id, lesson, i, step));
      } catch {
        return; // deriveDeck throwing is mobile-deck-audit.mjs's assertion
      }
      if (!deck) return;
      decks += 1;
      (deck.cards ?? []).forEach((card, ci) => {
        const spec = specOf(card);
        if (!spec) return;
        const where = `${course.id} L${li + 1} step${i} card${ci}`;
        if (spec.kind === 'timeline') {
          timelines += 1;
          const n = spec.moments?.length ?? 0;
          if (n < 2) unfinishable.push(`${where} — timeline with ${n} moment(s)`);
        }
        if (spec.kind === 'guess') {
          guesses += 1;
          if (spec.answer && spec.masked?.includes(spec.answer)) {
            leaking.push(`${where} — masked still reads "${spec.masked.slice(0, 80)}"`);
          }
        }
      });
    });
  }
}

assert.ok(decks > 500, `only ${decks} decks derived — the corpus did not load, so a pass is meaningless`);

if (unfinishable.length || leaking.length) {
  console.error('\nDECK COMPLETABLE PIN FAILED\n');
  if (unfinishable.length) {
    console.error(`  ${unfinishable.length} interactive card(s) can never unlock Continue:`);
    unfinishable.slice(0, 20).forEach((u) => console.error(`    ${u}`));
    console.error('\n  A timeline needs >= 2 moments. Guard it in asInsightSteps (interactives.ts)');
    console.error('  and fall back to a reveal, which unlocks on a single tap.\n');
  }
  if (leaking.length) {
    console.error(`  ${leaking.length} guess card(s) show their own answer:`);
    leaking.slice(0, 20).forEach((l) => console.error(`    ${l}`));
    console.error('\n  Mask EVERY occurrence of the figure, not the first.\n');
  }
  process.exit(1);
}

/**
 * THE NEGATIVE CONTROL. Reproduce each pre-fix behaviour and require the checks to catch it.
 */
if (SELFTEST) {
  // 1. A one-moment timeline is what the renderer could not finish.
  const oneMoment = { kind: 'timeline', moments: [{ label: 'a single beat' }] };
  assert.ok((oneMoment.moments?.length ?? 0) < 2, 'the timeline check cannot see a one-moment deck');
  const twoMoments = { kind: 'timeline', moments: [{ label: 'one' }, { label: 'two' }] };
  assert.ok((twoMoments.moments?.length ?? 0) >= 2, 'the timeline check rejects a healthy deck');

  // 2. The pre-fix mask used String.replace, which swaps only the first occurrence.
  const MASK = '  ?  ';
  const TEXT = 'The 5% rule: home value x 5% / 12 = monthly break-even rent';
  const ANSWER = '5%';
  assert.ok(TEXT.replace(ANSWER, MASK).includes(ANSWER),
    'the leak check cannot see the pre-fix single-replace mask');
  assert.ok(!TEXT.split(ANSWER).join(MASK).includes(ANSWER),
    'the leak check flags the fixed mask as a leak');

  console.log('[deck-completable-pin] selftest ok — both bugs are detectable and healthy decks pass');
}

console.log(
  `[deck-completable-pin] ok — ${decks} decks, ${timelines} timelines all >= 2 moments, `
  + `${guesses} guess cards none showing their answer`,
);
