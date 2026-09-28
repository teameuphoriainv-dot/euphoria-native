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
const { textOf: stageText } = await imported('src/lib/mobile-lesson/clickthrough/stage.ts');
const { textOf: predictText } = await imported('src/lib/mobile-lesson/clickthrough/predict.ts');
const { textOf: buildText } = await imported('src/lib/mobile-lesson/clickthrough/buildup.ts');
const { textOf: placeText } = await imported('src/lib/mobile-lesson/clickthrough/place.ts');

/*
 * The expected table, written out here and NOT read from PLACEMENTS, so an emptied or edited table
 * fails instead of agreeing with itself. Scenes come from scene.ts's own SCENES table because that
 * is where their slot is authored; the pin still requires each one to be placed and to render.
 */
const EXPECTED = {
  'corporate-finance:6:2': { kind: 'dial', formula: 'ccc', slot: 'chart' },
  'personal-finance:14:4': { kind: 'dial', formula: 'rentRule', slot: 'interactive' },
  'alternative-investments:2:4': { kind: 'lever', slot: 'interactive' },
  /*
   * Scene keys are WRITTEN OUT (2026-09-22 integration) rather than spread from SCENES: spreading
   * meant a scene deleted from scene.ts vanished from this table too and the pin agreed with itself.
   * The slot is still read from SCENES, where it is authored.
   */
  ...Object.fromEntries([
    'investing-fundamentals:3:2', 'investing-fundamentals:5:2', 'personal-finance:20:2',
    'investing-fundamentals:20:4', 'corporate-finance:9:2', 'financial-analytics:23:2',
    // S2's eight new scenes.
    'personal-finance:7:2', 'behavioral-finance:19:2', 'business-strategy:20:2', 'personal-finance:23:2',
    'global-economics:21:2', 'corporate-finance:4:4', 'behavioral-finance:23:2', 'personal-finance:6:2',
  ].map((key) => [key, { kind: 'scene', slot: SCENES[key]?.slot ?? 'idea' }])),
  // The Atlas clips (clickthrough/*), all over the chart card.
  'personal-finance:3:2': { kind: 'stage', slot: 'chart' },
  'personal-finance:12:2': { kind: 'stage', slot: 'chart' },
  'personal-finance:15:2': { kind: 'predict', slot: 'chart' },
  'investing-fundamentals:4:3': { kind: 'predict', slot: 'chart' },
  'investing-fundamentals:6:2': { kind: 'build', slot: 'chart' },
  'personal-finance:13:2': { kind: 'build', slot: 'chart' },
  'corporate-finance:15:2': { kind: 'build', slot: 'chart' },
  'personal-finance:2:2': { kind: 'place', slot: 'chart' },
  'investing-fundamentals:8:2': { kind: 'place', slot: 'chart' },
  'personal-finance:4:2': { kind: 'place', slot: 'chart' },
  'corporate-finance:24:2': { kind: 'place', slot: 'chart' },
};

const failures = [];
const fail = (msg) => failures.push(msg);
const lines = { dial: dialText, lever: leverText, scene: sceneText, stage: stageText, predict: predictText, build: buildText, place: placeText };

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
  /*
   * A SHORT LABEL THE REPLACED CHART ALREADY CARRIED IS NOT A NEW REPEAT. The clip cards' textOf
   * lists titles and row labels as well as sentences, and on personal-finance:2:2 the waffle's title
   * "The 50/30/20 Rule" is the idea card's title, exactly as the chart card it replaced was titled;
   * on personal-finance:13:2 the row label "Subsidized federal" is the first two words of the idea
   * body. Neither is a sentence said twice (CONSTITUTION 5.1), and neither was introduced by the
   * placement. Sentences (4+ words) stay strict whatever the chart said.
   */
  const replaced = JSON.stringify(derived.cards.find((c) => slotOf(c) === want.slot) ?? '');
  for (const line of lines[want.kind](part)) {
    if (line.length <= 12 || !siblings.includes(line)) continue;
    if (line.trim().split(/\s+/).length < 4 && replaced.includes(line)) continue;
    fail(`${key} repeats "${line}" on a sibling card`);
  }
}

// 6. Nowhere else.
const counts = { dial: 0, lever: 0, scene: 0, stage: 0, predict: 0, build: 0, place: 0 };
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

/*
 * 7. ONE MASCOT PER SCREEN (CONSTITUTION 5.6). Every card below mounts its own Atlas, and lesson.tsx
 * floats an Ask-Atlas button over every step, so each of these decks showed two Atlases until the
 * float learned to hide (S2 and K0 reviews, 2026-09-22; design-rules-pin does not see it). Source
 * checks, because card-deck.tsx imports React Native and cannot load under node:
 *   - every placed kind whose card file draws an Atlas is listed in cardDrawsAtlas, and
 *   - lesson.tsx wires the deck's report into the float's condition.
 */
{
  const { readFileSync } = await import('node:fs');
  const read = (p) => readFileSync(join(ROOT, p), 'utf8');
  const CARD_FILE = {
    dial: 'src/components/mobile-lesson/parts/dial-card.tsx',
    lever: 'src/components/mobile-lesson/parts/lever-card.tsx',
    scene: 'src/components/mobile-lesson/parts/scene-card.tsx',
    stage: 'src/components/mobile-lesson/clickthrough/stage-card.tsx',
    predict: 'src/components/mobile-lesson/clickthrough/predict-card.tsx',
    build: 'src/components/mobile-lesson/clickthrough/buildup-card.tsx',
    place: 'src/components/mobile-lesson/clickthrough/place-card.tsx',
  };
  const deckSrc = read('src/components/mobile-lesson/card-deck.tsx');
  const drawsFn = deckSrc.slice(deckSrc.indexOf('export function cardDrawsAtlas'), deckSrc.indexOf('export function cardDrawsAtlas') + 600);
  for (const kind of new Set(Object.values(EXPECTED).map((e) => e.kind))) {
    const file = CARD_FILE[kind];
    if (!file) { fail(`no card file known for placed kind ${kind}; add it to this pin`); continue; }
    const drawsAtlas = /<(?:Atlas|AtlasCue)\b/.test(read(file));
    const listed = drawsFn.includes(`'${kind}'`);
    if (drawsAtlas && !listed) fail(`${kind} card draws its own Atlas but cardDrawsAtlas does not list it, so the lesson shows two`);
  }
  const lessonSrc = read('src/app/lesson.tsx');
  if (!/onAtlasCard=\{setDeckAtlas\}/.test(lessonSrc)) fail('lesson.tsx does not pass onAtlasCard to CardDeck');
  // The float stays mounted since 2026-09-28 and takes the guard as `hidden={!(...)}`; either form.
  if (!/\{atlasContext && !deckAtlas\b[^}]*\? \(|hidden=\{!\(atlasContext && !deckAtlas\b/.test(lessonSrc)) fail('lesson.tsx floats Ask-Atlas without checking deckAtlas');
}

if (failures.length) {
  console.error(`new-parts-placement-pin: ${failures.length} failure(s)`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`new-parts-placement-pin: OK. ${expectedKeys.length} placements render in the wrapped loader (${Object.entries(counts).map(([k, n]) => `${k} ${n}`).join(', ')}), each in its slot with its neighbours untouched.`);
