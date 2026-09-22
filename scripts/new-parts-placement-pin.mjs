/**
 * NEW PARTS PLACEMENT PIN: every hand-placed part renders, in the WRAPPED loader, where it was put.
 *
 *   node --import ./scripts/ts-resolve-hooks.mjs scripts/new-parts-placement-pin.mjs
 *
 * WHY THIS EXISTS. The dial, lever and scene parts each shipped with a builder pin that passed while
 * the app showed none of them: PLACEMENTS in parts/placements.ts was `{}` and nothing in src called
 * applyPlacement, so the wrapped loader (src/lib/curriculum/index.ts, the one lesson.tsx reads)
 * rendered 0 dials, 0 levers and 0 scenes. The lever review also measured a quieter trap: handed the
 * already-wrapped steps instead of the raw ones, buildLever returns null and the guess card silently
 * stays. A builder that works is not a part a learner sees, so this pin asks the loader itself.
 *
 * WHAT IT ASSERTS, through the wrapped loader:
 *   1. PLACEMENTS holds exactly the expected positions, no more and no fewer.
 *   2. Each position renders a deck whose ONLY interactive is the placed kind (and dial formula).
 *   3. The part took the place of the named slot and every other card is byte-identical to the
 *      derived deck, so a placement cannot quietly reorder or rewrite its neighbours.
 *   4. The deck keeps 3-4 cards and its takeaway last (the ordering rule mobile-deck-audit enforces).
 *   5. No sibling card repeats a line the part shows (CONSTITUTION 5.1, say a thing once).
 *   6. Across all 300 lessons, the number of dial, lever and scene cards equals the table's, so a
 *      part cannot turn up anywhere it was not placed.
 * It was watched failing with PLACEMENTS empty (every position reported, exit 1) before the table
 * was filled.
 */
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = new URL('..', import.meta.url).pathname;
const imported = (path) => import(pathToFileURL(join(ROOT, path)).href);

const W = await imported('src/lib/curriculum/index.ts');
const RAW = await imported('src/lib/curriculum/courseIndex.ts');
const { deriveDeck } = await imported('src/lib/mobile-lesson/derive.ts');
const { stepId } = await imported('src/lib/mobile-lesson/stepId.ts');
const { PLACEMENTS } = await imported('src/lib/mobile-lesson/parts/placements.ts');
const { SCENES, textOf: sceneText } = await imported('src/lib/mobile-lesson/parts/scene.ts');
const { textOf: dialText } = await imported('src/lib/mobile-lesson/parts/dial.ts');
const { textOf: leverText } = await imported('src/lib/mobile-lesson/parts/lever.ts');

/*
 * The expected table, written out here and NOT read from PLACEMENTS, so an emptied or edited table
 * fails instead of agreeing with itself. Scenes come from scene.ts's own SCENES table because that
 * is where their slot is authored; the pin still requires each one to be placed and to render.
 */
const EXPECTED = {
  'corporate-finance:6:2': { kind: 'dial', formula: 'ccc', slot: 'chart' },
  'personal-finance:14:4': { kind: 'dial', formula: 'rentRule', slot: 'interactive' },
  'alternative-investments:2:4': { kind: 'lever', slot: 'interactive' },
  ...Object.fromEntries(Object.entries(SCENES).map(([key, s]) => [key, { kind: 'scene', slot: s.slot }])),
};

const failures = [];
const fail = (msg) => failures.push(msg);
const lines = { dial: dialText, lever: leverText, scene: sceneText };

// 1. The table.
const placedKeys = Object.keys(PLACEMENTS).sort();
const expectedKeys = Object.keys(EXPECTED).sort();
for (const k of expectedKeys) if (!PLACEMENTS[k]) fail(`${k} is not in PLACEMENTS`);
for (const k of placedKeys) if (!EXPECTED[k]) fail(`${k} is in PLACEMENTS but this pin does not expect it`);
for (const k of placedKeys) {
  if (EXPECTED[k] && PLACEMENTS[k].kind !== EXPECTED[k].kind) fail(`${k} PLACEMENTS kind ${PLACEMENTS[k].kind}, expected ${EXPECTED[k].kind}`);
}

const specOf = (card) => (card?.kind === 'interactive' ? card.spec : null);
const slotOf = (card) => (card.kind === 'interactive' ? 'interactive' : card.kind);

// 2-5. Each position.
for (const [key, want] of Object.entries(EXPECTED)) {
  const [course, num, idx] = key.split(':');
  const lesson = (await W.loadCourseLessons(course)).find((l) => l.num === Number(num));
  const deck = lesson?.steps?.[Number(idx)];
  if (deck?.type !== 'mobileDeck') { fail(`${key} WRAPPED step is ${deck?.type ?? 'missing'}, not a deck`); continue; }

  const interactives = deck.cards.map(specOf).filter(Boolean);
  const part = interactives.find((s) => s.kind === want.kind && (!want.formula || s.formula === want.formula));
  if (!part) {
    fail(`${key} WRAPPED deck renders no ${want.kind}${want.formula ? `:${want.formula}` : ''} (cards: ${deck.cards.map((c) => specOf(c)?.kind ?? c.kind).join(',')})`);
    continue;
  }
  // A part over the CHART must not leave another card talking about that chart ("Press each bar").
  if (PLACEMENTS[key]?.slot === 'chart') {
    for (const c of deck.cards) {
      const ex = c.scene?.explain;
      if (ex && /\b(?:bars?|slices?|press each|tap each|the chart|the graph)\b/i.test(ex)) fail(`${key} still says "${ex}" about a chart the part replaced`);
    }
  }
  if (interactives.length !== 1) fail(`${key} has ${interactives.length} interactive cards; a deck holds one`);

  const rawStep = (await RAW.loadCourseLessons(course)).find((l) => l.num === Number(num))?.steps?.[Number(idx)];
  const derived = rawStep ? deriveDeck(rawStep, stepId(course, Number(num), Number(idx), rawStep)) : null;
  if (!derived) { fail(`${key} derives no deck from the raw step`); continue; }
  const at = derived.cards.findIndex((c) => slotOf(c) === want.slot);
  if (at < 0) fail(`${key} derived deck has no ${want.slot} card for the part to replace`);
  else {
    if (specOf(deck.cards[at])?.kind !== want.kind) fail(`${key} part is not in the ${want.slot} position (card ${at})`);
    if (deck.cards.length !== derived.cards.length) fail(`${key} card count changed ${derived.cards.length} -> ${deck.cards.length}`);
    deck.cards.forEach((c, i) => {
      // The only allowed change is a chart-slot part dropping a scene explain that talked about the chart.
      const before = derived.cards[i];
      const expected = want.slot === 'chart' && before?.scene?.explain && !c.scene?.explain
        ? { ...before, scene: Object.fromEntries(Object.entries(before.scene).filter(([k]) => k !== 'explain')) }
        : before;
      if (i !== at && JSON.stringify(c) !== JSON.stringify(expected)) fail(`${key} card ${i} (${c.kind}) changed when the part was placed`);
    });
  }

  if (deck.cards.length < 3 || deck.cards.length > 4) fail(`${key} deck has ${deck.cards.length} cards`);
  const takeawayAt = deck.cards.findIndex((c) => c.kind === 'takeaway');
  if (takeawayAt >= 0 && takeawayAt !== deck.cards.length - 1) fail(`${key} puts the takeaway before the part`);

  const siblings = deck.cards.filter((c) => specOf(c) !== part).map((c) => JSON.stringify(c)).join(' ');
  for (const line of lines[want.kind](part)) {
    if (line.length > 12 && siblings.includes(line)) fail(`${key} repeats "${line}" on a sibling card`);
  }
}

// 6. Nowhere else.
const counts = { dial: 0, lever: 0, scene: 0 };
for (const course of RAW.COURSES) {
  for (const lesson of await W.loadCourseLessons(course.id)) {
    for (const step of lesson.steps) {
      if (step.type !== 'mobileDeck') continue;
      for (const c of step.cards) {
        const k = specOf(c)?.kind;
        if (k in counts) counts[k] += 1;
      }
    }
  }
}
for (const kind of Object.keys(counts)) {
  const want = Object.values(EXPECTED).filter((e) => e.kind === kind).length;
  if (counts[kind] !== want) fail(`corpus renders ${counts[kind]} ${kind} card(s), the table places ${want}`);
}

if (failures.length) {
  console.error(`new-parts-placement-pin: ${failures.length} failure(s)`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`new-parts-placement-pin: OK. ${expectedKeys.length} placements render in the wrapped loader (dial ${counts.dial}, lever ${counts.lever}, scene ${counts.scene}), each in its slot with its neighbours untouched.`);
