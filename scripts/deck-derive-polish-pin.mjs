#!/usr/bin/env node
// ============================================================================
// DECK DERIVE POLISH PIN: slider instructions, course colour, and the placement hook.
//
//   node --import ./scripts/ts-resolve-hooks.mjs scripts/deck-derive-polish-pin.mjs
//
// Runs over the WRAPPED loader (src/lib/curriculum/index.ts), which is what the app renders. The
// raw courseIndex.ts hands back authored steps that are never shown on iOS, so a number measured
// there describes a screen nobody sees.
//
// WHAT IT ASSERTS, each measured 2026-09-22 before the fix:
//   1. No graph deck's idea card opens on an instruction for a control the phone does not draw.
//      Was 37 of 289, e.g. investing-fundamentals:3:4 "Adjust the starting amount, monthly
//      contribution, and annual return to see how your wealth grows exponentially over time."
//      Nor on the "Compare/See/Explore" direction that followed such an instruction (was 3 once
//      the instruction alone was dropped, e.g. wealth-management:23:4).
//   2. Every scene on every deck carries its course's sprite ramp, every course in COURSES has an
//      entry, and the courses use at least 6 distinct ramps. Was 0 of 1,806 scenes: every lesson
//      in all 12 courses drew its art in the same default orchid.
//   3. applyPlacement with an empty table returns the SAME deck object, unmutated, for
//      every one of the 721 decks. The integration step wires it into the loader; this is the proof
//      that wiring it in with nothing placed changes nothing.
//   4. A placement whose builder returns null (its authored figures gone after a re-sync) leaves
//      every deck untouched. And a builder that DOES return a part lands in the slot, never pushes
//      the takeaway off the end, and never makes a fifth card: the positive control, so check 4
//      cannot pass merely because applyPlacement ignores the table.
//   5. No card shows a bare "401" where its source step wrote "401(k)". compress.ts stripped any
//      bracket as an aside, including one glued to its word, so 10 card strings in 8 decks said "401"
//      (investing-fundamentals:10:2 "A 401 is a workplace retirement account.").
// ============================================================================
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = new URL('..', import.meta.url).pathname;
const imported = (path) => import(pathToFileURL(join(ROOT, path)).href);

const wrapped = await imported('src/lib/curriculum/index.ts');
const raw = await imported('src/lib/curriculum/courseIndex.ts');
const { COURSE_SCENE_ACCENT } = await imported('src/lib/mobile-lesson/derive.ts');
const { applyPlacement, PLACEMENTS } = await imported('src/lib/mobile-lesson/parts/placements.ts');
const { stepIdPosition } = await imported('src/lib/mobile-lesson/stepId.ts');
const { DECK_MAX_CARDS } = await imported('src/lib/mobile-lesson/types.ts');
const { MOBILE_KIT_ACCENTS } = await imported('src/lib/pixel/sprites-mobile-kit.ts');
const { sentences } = await imported('src/lib/mobile-lesson/compress.ts');

/** Same verbs derive.ts drops; kept separate so a regression in derive.ts cannot also blind this. */
const CONTROL_VERB = /^(adjust|drag|move|slide|toggle|use the slider|watch how|try changing|click)\b/i;
/**
 * "Compare ..." / "See ..." / "Explore ..." AFTER a control instruction in the same passage is the
 * rest of the directions. Dropping only the control sentence handed the card to it: measured
 * 2026-09-22, wealth-management:23:4 became "Compare the 4% rule, 5% withdrawal, and 6% withdrawal."
 */
const FOLLOW_ON = /^(compare|see|explore)\b/i;
const opening = (t) => String(t).toLowerCase().replace(/[^a-z0-9 ]/g, '').slice(0, 28);
/** The follow-on directions an authored graph step contains, as comparable openings. */
function followOnDirections(step) {
  const out = [];
  for (const passage of [step?.description ?? '', ...(step?.paragraphs ?? [])]) {
    let afterControl = false;
    for (const s of sentences(passage)) {
      if (CONTROL_VERB.test(s)) afterControl = true;
      else if (afterControl && FOLLOW_ON.test(s)) out.push(opening(s));
    }
  }
  return out;
}

const failures = [];
let failCount = 0;
const fail = (msg) => { failCount += 1; if (failures.length < 40) failures.push(msg); };
let decks = 0;
let graphIdeas = 0;
let scenes = 0;
let accented = 0;
let identity = 0;
let nullKept = 0;
let placedReplaced = 0;
let placedInserted = 0;
let placedSkipped = 0;
const rampsUsed = new Set();

// 2a. The table itself: every course known, every name a real kit ramp, enough variety.
for (const course of wrapped.COURSES) {
  const accent = COURSE_SCENE_ACCENT[course.id];
  if (!accent) fail(`${course.id} has no entry in COURSE_SCENE_ACCENT`);
  else if (!MOBILE_KIT_ACCENTS.includes(accent)) fail(`${course.id} maps to "${accent}", not a kit ramp`);
}
const distinctRamps = new Set(Object.values(COURSE_SCENE_ACCENT)).size;
if (distinctRamps < 6) fail(`only ${distinctRamps} distinct ramps across the courses, need at least 6`);

/** Every string inside a card, however deep, so check 5 cannot miss a field it did not name. */
const textsOf = (o, out = []) => {
  if (typeof o === 'string') out.push(o);
  else if (o && typeof o === 'object') for (const v of Object.values(o)) textsOf(v, out);
  return out;
};
let bare401Decks = 0;

const NULL_BUILDER = { kind: 'dial', slot: 'interactive', build: () => null };
const probe = (slot) => ({
  kind: 'dial',
  slot,
  build: () => ({ spec: { kind: 'reveal', prompt: 'probe', hidden: 'probe', scene: { archetype: 'growth' } }, text: ['probe'] }),
});

for (const course of wrapped.COURSES) {
  const shown = await wrapped.loadCourseLessons(course.id);
  const authored = await raw.loadCourseLessons(course.id);
  const expectAccent = COURSE_SCENE_ACCENT[course.id];

  shown.forEach((lesson, li) => {
    const lessonSteps = authored[li]?.steps ?? [];
    lesson.steps.forEach((deck) => {
      if (deck?.type !== 'mobileDeck') return;
      decks += 1;
      const id = deck.sourceId;

      // 5. a glued bracket is part of its word
      const authoredStep5 = lessonSteps[Number(stepIdPosition(id).split(':')[2])];
      if (textsOf(authoredStep5).some((t) => t.includes('401(k)'))) {
        bare401Decks += 1;
        for (const t of textsOf(deck.cards)) {
          if (/\b401\b(?!\()/.test(t)) fail(`${id} shows a bare 401 for the authored 401(k): "${t.slice(0, 90)}"`);
        }
      }

      for (const card of deck.cards) {
        // 1. control-verb idea bodies on graph decks
        if (card.kind === 'idea' && deck.sourceType === 'interactiveGraph') {
          graphIdeas += 1;
          if (CONTROL_VERB.test(card.body)) fail(`${id} idea card opens on a control instruction: "${card.body}"`);
          const authoredStep = lessonSteps[Number(stepIdPosition(id).split(':')[2])];
          if (followOnDirections(authoredStep).includes(opening(card.body))) {
            fail(`${id} idea card is the direction that followed a slider instruction: "${card.body}"`);
          }
        }
        // 2b. every scene tinted with its course's ramp
        for (const scene of [card.scene, card.spec?.scene]) {
          if (!scene) continue;
          scenes += 1;
          if (scene.accent) { accented += 1; rampsUsed.add(scene.accent); }
          if (scene.accent !== expectAccent) fail(`${id} ${card.kind} scene accent is ${scene.accent}, expected ${expectAccent}`);
        }
      }

      // 3. empty table: identity, no mutation. An explicit {} rather than the shipped table, so this
      //    keeps meaning the same thing after integration fills PLACEMENTS.
      const before = structuredClone(deck);
      const out = applyPlacement(deck, id, lessonSteps, {});
      if (out !== deck) fail(`${id} applyPlacement with an empty table returned a different object`);
      else identity += 1;
      assert.deepStrictEqual(deck, before, `${id} applyPlacement mutated the deck`);

      // 4. a builder returning null keeps the derived deck
      const position = stepIdPosition(id);
      const kept = applyPlacement(deck, id, lessonSteps, { [position]: NULL_BUILDER });
      if (kept !== deck) fail(`${id} a null builder did not return the original deck`);
      else nullKept += 1;
      assert.deepStrictEqual(deck, before, `${id} a null builder mutated the deck`);

      // 4, positive control: a real part lands, and the deck's shape rules still hold.
      for (const slot of ['interactive', 'chart']) {
        const placed = applyPlacement(deck, id, lessonSteps, { [position]: probe(slot) });
        assert.deepStrictEqual(deck, before, `${id} placing a part mutated the original deck`);
        const hadSlot = deck.cards.some((c) => c.kind === slot);
        if (hadSlot || deck.cards.length < DECK_MAX_CARDS) {
          if (placed === deck) { fail(`${id} a ${slot} placement with room was ignored`); continue; }
          if (!placed.cards.some((c) => c.spec?.prompt === 'probe')) fail(`${id} the placed part is not in the deck`);
          if (hadSlot) {
            placedReplaced += 1;
            if (placed.cards.length !== deck.cards.length) fail(`${id} replacing the ${slot} changed the card count`);
          } else placedInserted += 1;
        } else {
          placedSkipped += 1;
          if (placed !== deck) fail(`${id} a full deck without a ${slot} card was changed`);
        }
        if (placed.cards.length > DECK_MAX_CARDS) fail(`${id} a placement made ${placed.cards.length} cards`);
        const t = placed.cards.findIndex((c) => c.kind === 'takeaway');
        if (t >= 0 && t !== placed.cards.length - 1) fail(`${id} a placement put the takeaway before the evidence`);
      }
    });
  });
}

// Every shipped placement must name a kind this hook supports.
for (const [key, p] of Object.entries(PLACEMENTS)) {
  if (!['dial', 'lever', 'scene'].includes(p.kind)) fail(`placement ${key} has unsupported kind ${p.kind}`);
  if (!/^[a-z-]+:\d+:\d+$/.test(key)) fail(`placement key ${key} is not course:lesson:stepIndex`);
}
if (decks !== 721) fail(`expected 721 decks through the wrapped loader, saw ${decks}`);
if (scenes === 0) fail('saw no scenes at all; the pin is not reading decks');
if (bare401Decks === 0) fail('saw no deck sourced from a 401(k) passage; check 5 is not reading anything');

const summary = `${decks} decks; control-verb graph ideas ${graphIdeas ? 'checked on ' + graphIdeas : 'NONE SEEN'}; `
  + `scenes accented ${accented}/${scenes} (${rampsUsed.size} ramps in use, ${distinctRamps} in the table); `
  + `empty-table identity ${identity}/${decks}; null-builder kept ${nullKept}/${decks}; `
  + `probe placed ${placedReplaced} replaced, ${placedInserted} inserted, ${placedSkipped} skipped (full); `
  + `401(k) decks checked ${bare401Decks}`;

if (failures.length) {
  console.error(`[deck-derive-polish-pin] FAIL: ${failCount} problem(s)${failCount > failures.length ? `, first ${failures.length} shown` : ''}`);
  for (const f of failures) console.error(`  - ${f}`);
  console.error(`  ${summary}`);
  process.exit(1);
}
console.log(`[deck-derive-polish-pin] ok: ${summary}`);
