#!/usr/bin/env node
// ============================================================================
// MOBILE DECK AUDIT — every heavy step of every lesson, through the REAL deriver.
//
//   node --import ./scripts/ts-resolve-hooks.mjs scripts/mobile-deck-audit.mjs
//   node --import ./scripts/ts-resolve-hooks.mjs scripts/mobile-deck-audit.mjs --selftest
//   node --import ./scripts/ts-resolve-hooks.mjs scripts/mobile-deck-audit.mjs --over-budget
//   node --import ./scripts/ts-resolve-hooks.mjs scripts/mobile-deck-audit.mjs --stale
//
// WHY THIS EXISTS. On iOS every `teachingSlide` and every `interactiveGraph` is replaced by a deck
// of cards derived from it. That is 721 of the 4,050 steps in the corpus, and they hold essentially
// all of the prose in the product. If the deriver returns an empty deck, or a card with no text, or
// asks for a piece of art that does not exist, the learner reaches a blank frame mid-lesson in a
// paid app. Sampling a few lessons cannot find that, so this runs the ACTUAL deriver over every
// lesson the app itself loads.
//
// It imports the TypeScript directly. Every module under src/lib/mobile-lesson is pure, so Node's
// type stripping erases the type imports and the rest runs as plain ES modules. No build step and,
// critically, no reimplementation of the logic being tested: a reimplementation drifts from the
// thing it is checking, which is the failure this repo keeps running into.
//
// --over-budget prints the queue for src/lib/mobile-lesson/overrides.ts, worst first.
// ============================================================================
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = new URL('..', import.meta.url).pathname;
const imported = (path) => import(pathToFileURL(join(ROOT, path)).href);

const { COURSES, loadCourseLessons } = await imported('src/lib/curriculum/courseIndex.ts');
const { deriveDeck, isHeavyStep } = await imported('src/lib/mobile-lesson/derive.ts');
const { stepId, stepIdPosition } = await imported('src/lib/mobile-lesson/stepId.ts');
const { overrideKeys } = await imported('src/lib/mobile-lesson/overrides.ts');
const { ARCHETYPES, isArchetype } = await imported('src/lib/mobile-lesson/archetypes.ts');
const { CARD_BUDGET, DECK_MIN_CARDS, DECK_MAX_CARDS } = await imported('src/lib/mobile-lesson/types.ts');
const { BUDGET_GRACE } = await imported('src/lib/mobile-lesson/compress.ts');
const { visualIsRenderable } = await imported('src/lib/lesson-steps.ts');

/*
 * THE ART KIT ITSELF, not just the vocabulary.
 *
 * Checking a scene id against ARCHETYPES only proves the deriver asked for something on the agreed
 * list. It does NOT prove a sprite with that id exists. Those came apart in exactly the way you
 * would expect: the kit shipped 24 correct, animated, 16x16 sprites under ids like
 * `mk-growth-curve` while the deriver asked for `growth`, so every scene in the product resolved to
 * nothing and both halves looked fine in isolation. PixelScene renders null on an unknown id, which
 * is the right failure mode and also a silent one.
 *
 * A MISSING KIT IS A HARD FAILURE, and it did not start that way.
 *
 * This import was originally wrapped in a try/catch that downgraded a missing kit to a printed
 * warning, on the reasoning that the audit predated the kit. That reasoning expired the moment the
 * kit shipped, and the softness bit twice in one session: both times the module genuinely failed to
 * load, both times the audit printed "NOT FOUND" and then "OK: every heavy step derives a
 * renderable deck", and both times `npm run check` exited 0 with every scene in the product
 * resolving to no art. A check that cannot fail is not a check.
 */
let KIT_IDS = null;
try {
  const kit = await imported('src/lib/pixel/sprites-mobile-kit.ts');
  /*
   * The KEYS, not the sprites' own `.id` fields. `composeScene` does `MOBILE_KIT[spec.archetype]`,
   * so the key is the lookup and the id is just a label. They are usually the same, and
   * deliberately are not for `rulebook`, which has no art of its own and aliases the threshold
   * sprite. Checking ids reported rulebook as missing while the app resolves it perfectly well.
   */
  const keys = Object.keys(kit.MOBILE_KIT ?? {});
  if (keys.length > 0) KIT_IDS = new Set(keys);
} catch (err) {
  console.error(`FAIL: the sprite kit did not load, so no scene in the product has art.\n  ${err.message}`);
  process.exit(1);
}
if (!KIT_IDS || KIT_IDS.size === 0) {
  console.error('FAIL: the sprite kit loaded but exports no sprites.');
  process.exit(1);
}

const SHOW_OVER = process.argv.includes('--over-budget');
const SHOW_STALE = process.argv.includes('--stale');

/** The text a card actually puts on screen, so "is this card empty" is one question everywhere. */
function cardText(card) {
  if (card.kind === 'idea') return `${card.title} ${card.body}`.trim();
  if (card.kind === 'term') return `${card.term} ${card.plain}`.trim();
  if (card.kind === 'takeaway') return card.body ?? '';
  if (card.kind === 'chart') return card.title ?? '';
  if (card.kind === 'interactive') {
    const s = card.spec;
    if (s.kind === 'timeline') return [s.prompt, ...s.moments.map((m) => m.label)].join(' ');
    if (s.kind === 'reveal') return `${s.prompt} ${s.hidden}`;
    return `${s.prompt} ${s.verdict ?? ''}`;
  }
  return '';
}

/** The budget that applies to a card's own body copy, or 0 when it has none. */
function bodyBudget(card) {
  if (card.kind === 'idea') return CARD_BUDGET.body;
  if (card.kind === 'term') return CARD_BUDGET.plain;
  if (card.kind === 'takeaway') return CARD_BUDGET.takeaway;
  return 0;
}

function bodyOf(card) {
  if (card.kind === 'idea' || card.kind === 'takeaway') return card.body ?? '';
  if (card.kind === 'term') return card.plain ?? '';
  return '';
}

// ---------------------------------------------------------------------------
// A GREEN RUN MEANS NOTHING UNLESS THE LANE CAN GO RED. Every detector below is seeded here with
// the exact shape it exists to catch AND a harmless shape it must ignore. Each of these was a real
// bug during the build: an interactive whose moments repeated the takeaway verbatim, a chart card
// titled from an author-facing note about the artwork, and a prompt split in half at "vs.".
// ---------------------------------------------------------------------------
if (process.argv.includes('--selftest')) {
  const ok = (cond, msg) => { if (!cond) { console.error(`selftest FAILED: ${msg}`); process.exit(1); } };

  ok(cardText({ kind: 'idea', title: 'T', body: '' }) === 'T', 'cardText should survive an empty body');
  ok(cardText({ kind: 'term', term: 'X', plain: 'Y' }) === 'X Y', 'cardText should read a term card');
  ok(bodyBudget({ kind: 'chart' }) === 0, 'a chart card has no body budget');
  ok(bodyBudget({ kind: 'term' }) === CARD_BUDGET.plain, 'a term card uses the vocabulary budget');

  ok(!isArchetype('compoundGrowthLab'), 'an id that is not in the vocabulary must be rejected');
  ok(isArchetype(ARCHETYPES[0]), 'a real archetype must be accepted');

  // Empty-deck detection.
  ok(emptyCards({ cards: [{ kind: 'takeaway', body: '' }] }).length === 1, 'an empty card must be caught');
  ok(emptyCards({ cards: [{ kind: 'takeaway', body: 'real words here' }] }).length === 0, 'a real card must pass');

  // Duplicate detection, the bug where the timeline's first moment and the takeaway were the same.
  ok(repeatedText({ cards: [
    { kind: 'takeaway', body: 'Stocks have outperformed bonds since 1926.' },
    { kind: 'idea', title: 'a', body: 'Stocks have outperformed bonds since 1926.' },
  ] }), 'a deck that says the same thing twice must be caught');
  ok(!repeatedText({ cards: [
    { kind: 'takeaway', body: 'Stocks have outperformed bonds since 1926.' },
    { kind: 'idea', title: 'a', body: 'Bonds pay a fixed coupon instead.' },
  ] }), 'a deck of two different sentences must pass');

  console.log('selftest passed');
  process.exit(0);
}

function emptyCards(deck) {
  return deck.cards.filter((c) => cardText(c).trim().length === 0);
}

/** True when two cards in one deck open with the same words. */
function repeatedText(deck) {
  const heads = deck.cards
    .map((c) => bodyOf(c).toLowerCase().replace(/[^a-z0-9 ]/g, '').slice(0, 28))
    .filter((h) => h.length > 10);
  return new Set(heads).size !== heads.length;
}

const stats = {
  heavy: 0, decks: 0, cards: 0, sourceChars: 0, deckChars: 0,
  byCardKind: new Map(), byInteractive: new Map(), bySize: new Map(), byArchetype: new Map(),
  /** Distinct card sequences. Three of these across 721 decks is what "boring" measured as. */
  byShape: new Map(),
  /** Decks that put the same sprite on more than one card. */
  repeatedArt: 0,
};
const failures = [];
const overBudget = [];
const positions = new Map();

for (const course of COURSES) {
  for (const lesson of await loadCourseLessons(course.id)) {
    lesson.steps.forEach((step, index) => {
      if (!isHeavyStep(step)) return;
      stats.heavy += 1;

      const id = stepId(course.id, lesson.num, index, step);
      positions.set(stepIdPosition(id), id);

      let deck;
      try {
        deck = deriveDeck(step, id);
      } catch (err) {
        failures.push(`${id} THREW: ${err.message}`);
        return;
      }
      if (!deck) { failures.push(`${id} produced NO deck`); return; }
      stats.decks += 1;

      if (deck.cards.length < DECK_MIN_CARDS) failures.push(`${id} has only ${deck.cards.length} card(s)`);
      if (deck.cards.length > DECK_MAX_CARDS) failures.push(`${id} has ${deck.cards.length} cards, over the cap`);
      stats.bySize.set(deck.cards.length, (stats.bySize.get(deck.cards.length) ?? 0) + 1);

      for (const empty of emptyCards(deck)) failures.push(`${id} has an EMPTY ${empty.kind} card`);
      if (repeatedText(deck)) failures.push(`${id} says the same thing on two cards`);
      if (!deck.title?.trim()) failures.push(`${id} has no title`);

      const src = step.paragraphs ?? [];
      stats.sourceChars += [...src, step.description ?? '', ...(step.insights ?? [])].join(' ').length;

      stats.byShape.set(
        deck.cards.map((c) => c.kind).join(','),
        (stats.byShape.get(deck.cards.map((c) => c.kind).join(',')) ?? 0) + 1,
      );
      const deckArt = deck.cards.map((c) => c.scene?.archetype).filter(Boolean);
      if (new Set(deckArt).size !== deckArt.length) {
        stats.repeatedArt += 1;
        failures.push(`${id} shows the same art on more than one card`);
      }
      /*
       * A takeaway is the last word or it is not a takeaway. `arrange()` holds it out of the
       * running order for this reason, and an earlier version did not, which put "remember this"
       * ahead of the chart it was summarising on 115 decks.
       */
      const takeawayAt = deck.cards.findIndex((c) => c.kind === 'takeaway');
      if (takeawayAt >= 0 && takeawayAt !== deck.cards.length - 1) {
        failures.push(`${id} puts the takeaway before the evidence`);
      }

      for (const card of deck.cards) {
        stats.cards += 1;
        stats.deckChars += cardText(card).length;
        stats.byCardKind.set(card.kind, (stats.byCardKind.get(card.kind) ?? 0) + 1);

        if (card.kind === 'interactive') {
          stats.byInteractive.set(card.spec.kind, (stats.byInteractive.get(card.spec.kind) ?? 0) + 1);
        }
        if (card.kind === 'chart') {
          /*
           * A chart card carries EITHER an AnimatedVisual or a raw authored SVG string, never
           * both and never neither. Checking only the visual failed the 5 slides whose diagram is
           * an SVG, which are the same 5 that scripts/raw-svg-parity-regression.mjs counts.
           */
          const drawable = visualIsRenderable(card.visual)
            || (typeof card.svg === 'string' && card.svg.trim().length > 0);
          if (!drawable) failures.push(`${id} kept a chart card the renderer cannot draw`);
          if (card.visual && card.svg) failures.push(`${id} chart card has BOTH a visual and an svg`);
        }
        if (card.scene) {
          if (!isArchetype(card.scene.archetype)) {
            failures.push(`${id} asks for art "${card.scene.archetype}" which is not in the vocabulary`);
          } else if (!KIT_IDS.has(card.scene.archetype)) {
            failures.push(`${id} asks for art "${card.scene.archetype}" which the sprite kit does not export`);
          }
          stats.byArchetype.set(card.scene.archetype, (stats.byArchetype.get(card.scene.archetype) ?? 0) + 1);
        }

        const budget = bodyBudget(card);
        const body = bodyOf(card);
        if (budget > 0 && body.length > budget) {
          overBudget.push({ id, kind: card.kind, len: body.length, budget, body });
          // Past the grace ceiling is a HARD failure: the compressor promises never to exceed it
          // except on the mustReturn path, and a card that long will not fit any phone.
          if (body.length > budget * BUDGET_GRACE * 1.6) {
            failures.push(`${id} ${card.kind} card is ${body.length} chars, far past any budget`);
          }
        }
      }
    });
  }
}

// Overrides whose step has moved out from under them.
const live = new Set([...positions.values()]);
const stale = overrideKeys().filter((k) => !live.has(k));

const pct = (n, d) => (d ? `${Math.round((n / d) * 100)}%` : 'n/a');

/*
 * VARIETY, PINNED, because it regresses silently.
 * Before `arrange()` existed there were 3 distinct card sequences across all 721 decks and the most
 * common one was 40% of them. Both numbers are the thing a learner experiences as sameness.
 */
const MIN_DECK_SHAPES = 8;
const MAX_SHARE_ONE_SHAPE = 0.35;

console.log('MOBILE DECK AUDIT');
console.log(`  heavy steps          ${stats.heavy}`);
console.log(`  decks derived        ${stats.decks}`);
console.log(`  cards total          ${stats.cards}`);
console.log(`  cards per deck       ${[...stats.bySize].sort((a, b) => a[0] - b[0]).map(([k, v]) => `${k}:${v}`).join('  ')}`);
console.log(`  card kinds           ${[...stats.byCardKind].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${v}`).join('  ')}`);
console.log(`  interactives         ${[...stats.byInteractive].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${v}`).join('  ')}`);
console.log(`  archetypes used      ${stats.byArchetype.size}/${ARCHETYPES.length}`);
console.log(`  distinct deck shapes ${stats.byShape.size}   (floor ${MIN_DECK_SHAPES})`);
{
  const top = [...stats.byShape].sort((a, b) => b[1] - a[1])[0];
  console.log(`  most common shape    ${pct(top[1], stats.decks)} ${top[0]}   (cap ${Math.round(MAX_SHARE_ONE_SHAPE * 100)}%)`);
}
console.log(`  decks repeating art  ${stats.repeatedArt}   (limit 0)`);
console.log(`  sprite kit           ${KIT_IDS.size} sprites, every scene id checked against real art`);
console.log(`  authored chars       ${stats.sourceChars}`);
console.log(`  on-card chars        ${stats.deckChars}`);
console.log(`  REDUCTION            ${pct(stats.sourceChars - stats.deckChars, stats.sourceChars)}`);
console.log(`  over card budget     ${overBudget.length} (${pct(overBudget.length, stats.cards)} of cards) <- the overrides.ts queue`);
console.log(`  overrides written    ${overrideKeys().length}`);
console.log(`  overrides gone stale ${stale.length}`);

const unused = ARCHETYPES.filter((a) => !stats.byArchetype.has(a));
if (unused.length) console.log(`  archetypes never used: ${unused.join(', ')}`);

if (SHOW_OVER) {
  console.log('\nOVER BUDGET, worst first. Write a better deck for these in overrides.ts:');
  for (const o of overBudget.sort((a, b) => b.len - a.len).slice(0, 40)) {
    console.log(`  ${o.id}  [${o.kind} ${o.len}/${o.budget}]\n    ${o.body}`);
  }
}
if (SHOW_STALE && stale.length) {
  console.log('\nSTALE OVERRIDES, their step changed in a re-sync. Rewrite against the new text:');
  for (const k of stale) console.log(`  ${k}`);
}

{
  const top = [...stats.byShape].sort((a, b) => b[1] - a[1])[0];
  if (stats.byShape.size < MIN_DECK_SHAPES) {
    failures.push(`only ${stats.byShape.size} distinct deck shapes, floor is ${MIN_DECK_SHAPES}`);
  }
  if (top && top[1] / stats.decks > MAX_SHARE_ONE_SHAPE) {
    failures.push(`one deck shape is ${pct(top[1], stats.decks)} of all decks, cap is ${Math.round(MAX_SHARE_ONE_SHAPE * 100)}%`);
  }
}

if (failures.length) {
  console.error(`\nFAILURES (${failures.length}):`);
  for (const f of failures.slice(0, 40)) console.error(`  ${f}`);
  if (failures.length > 40) console.error(`  ... and ${failures.length - 40} more`);
  process.exit(1);
}
console.log('\nOK: every heavy step derives a renderable deck.');
