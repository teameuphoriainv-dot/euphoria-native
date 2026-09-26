#!/usr/bin/env node
// ============================================================================
// CLICKTHROUGH PLACE PIN: the tap-to-place card (M4) shows only authored labels on authored sizes,
// grades against the authored pairing, refuses without the authored data, and never needs a drag.
//
//   node --import ./scripts/ts-resolve-hooks.mjs scripts/clickthrough-place-pin.mjs
//   node --import ./scripts/ts-resolve-hooks.mjs scripts/clickthrough-place-pin.mjs --builder-only
//
// WHY THIS EXISTS. src/lib/mobile-lesson/clickthrough/place.ts tears the labels off an authored
// diagram and asks the learner to put them back. Three quiet ways that goes wrong:
//   - the grader pairs a label with the wrong spot (the card marks a right answer amber);
//   - two spots come out the same size after a re-sync, so the size clue has two right answers;
//   - the order on screen answers the question ("Month 1" on the first row, a label under its own
//     spot), which is the order-steps defect of 2026-08-22 in a new card.
// And one loud one: a drag-only mechanic VoiceOver cannot play (CONSTITUTION 5.10).
//
//   1. Builder fixtures: pie -> waffle, pictograph, stack; every string equals its authored field.
//   2. Waffle cells per slot equal the authored percents and total 100.
//   3. Null on missing data: no explain, EQUAL MAGNITUDES (the break test), 2 or 5 slots, a pie that
//      is not whole percents summing to 100, a pictograph without sprite/unit, too many marks.
//   4. Raw loader: every PLACE_PLACEMENTS key builds, its captions are the authored explains word
//      for word, the derived deck at that position has the chart slot it replaces, and its sprite
//      resolves. Layout: no slot or token in its own place, and the same on every load.
//   5. The reducer: pairing, Try again keeps the right ones, only the first try counts.
//   6. The renderer source: no PanResponder or gesture handler, every pressable is a button,
//      Reduce Motion is read, no spring on geometry, no destructive red, no hex, firstTry reaches
//      onWorked, and the amber bar slides up.
//   7. THE WRAPPED LOADER (src/lib/curriculum/index.ts) renders a place card on each placement.
//      Fails until the integrator adds the placements; `--builder-only` skips only this block.
// ============================================================================
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = new URL('..', import.meta.url).pathname;
const imported = (path) => import(pathToFileURL(join(ROOT, path)).href);

const raw = await imported('src/lib/curriculum/courseIndex.ts');
const P = await imported('src/lib/mobile-lesson/clickthrough/place.ts');
const { CARD_BUDGET } = await imported('src/lib/mobile-lesson/types.ts');
const { deriveDeck } = await imported('src/lib/mobile-lesson/derive.ts');
const { stepId, stepIdPosition } = await imported('src/lib/mobile-lesson/stepId.ts');
const { getSprite } = await imported('src/lib/pixel/sprites.ts');

const BUILDER_ONLY = process.argv.includes('--builder-only');
const failures = [];
const check = (ok, msg) => { if (!ok) failures.push(msg); };

// ---- 1. fixtures -------------------------------------------------------------------------------
const pie = (segments, extra = {}) => ({ type: 'teachingSlide', diagramVisual: { type: 'pie', title: 'Split', segments, footer: 'Foot', sentiment: 'positive', ...extra } });
const seg = (label, percent, explain = `Why ${label}.`) => ({ label, percent, color: 'x', explain });
const PIE = pie([seg('Needs', 50), seg('Wants', 30), seg('Savings', 20)]);
const waffle = P.buildPlace(PIE);
check(waffle?.mode === 'waffle', `pie must build a waffle, got ${waffle?.mode ?? 'null'}`);
if (waffle) {
  check(waffle.title === 'Split' && waffle.footer === 'Foot', 'title/footer must be the authored strings');
  waffle.slots.forEach((s, i) => {
    const a = PIE.diagramVisual.segments[i];
    check(s.label === a.label && s.caption === a.explain && s.magnitude === a.percent, `waffle slot ${i} must be authored segment ${i} (label, explain, percent)`);
  });
  // ---- 2. waffle cells ----
  const cells = P.waffleCells(waffle);
  check(cells.length === 100, `waffle must have 100 cells, got ${cells.length}`);
  waffle.slots.forEach((s, k) => check(cells.filter((c) => c === k).length === s.magnitude, `waffle slot ${k} cells must equal its authored ${s.magnitude}%`));
}

const picto = (rows, extra = {}) => ({ type: 'teachingSlide', diagramVisual: { type: 'pictograph', title: 'Shares', sprite: 'coin', unitValue: 1, unitLabel: '1 share', rows, sentiment: 'positive', ...extra } });
const row = (label, value, explain = `Why ${label}.`) => ({ label, value, displayValue: `${value}`, explain });
const PICTO = picto([row('$40', 5), row('$20', 10), row('$25', 8)]);
const pg = P.buildPlace(PICTO);
check(pg?.mode === 'pictograph' && pg.mark?.sprite === 'coin' && pg.mark.unitValue === 1 && pg.mark.unitLabel === '1 share', 'pictograph must carry the authored sprite, unitValue and unitLabel');
if (pg) check(pg.slots.map((s) => P.marksFor(pg, s)).join() === '5,10,8', 'pictograph marks must be value / unitValue');

const stack = (segments) => ({ type: 'teachingSlide', diagramVisual: { type: 'stack', title: 'Tranches', segments, sentiment: 'positive' } });
const ST = P.buildPlace(stack([seg('Senior', 70), seg('Mezz', 20), seg('Equity', 10)]));
check(ST?.mode === 'stack' && ST.slots.map((s) => s.label).join() === 'Senior,Mezz,Equity', 'stack must build in authored order');
check(ST && P.placeLayout(ST).slotOrder.join() === '0,1,2', 'a stack is never reordered: tier order is its meaning');

// ---- 3. null on missing data --------------------------------------------------------------------
const nulls = {
  'a missing explain': pie([seg('Needs', 50), seg('Wants', 30), { label: 'Savings', percent: 20, color: 'x' }]),
  // THE BREAK TEST: two slots the same size. Remove the distinct-magnitude guard and this fails.
  'equal magnitudes': pie([seg('Needs', 40), seg('Wants', 40), seg('Savings', 20)]),
  'equal pictograph values': picto([row('$40', 5), row('$20', 5), row('$25', 8)]),
  'two slots': pie([seg('Needs', 60), seg('Wants', 40)]),
  'five slots': pie([seg('A', 30), seg('B', 25), seg('C', 20), seg('D', 15), seg('E', 10)]),
  'a pie summing to 99': pie([seg('Needs', 50), seg('Wants', 30), seg('Savings', 19)]),
  'a fractional percent': pie([seg('Needs', 50.5), seg('Wants', 29.5), seg('Savings', 20)]),
  'duplicate labels': pie([seg('Needs', 50), seg('Needs', 30), seg('Savings', 20)]),
  'a pictograph without sprite': picto([row('$40', 5), row('$20', 10), row('$25', 8)], { sprite: '' }),
  'a pictograph without unitValue': picto([row('$40', 5), row('$20', 10), row('$25', 8)], { unitValue: 0 }),
  'a row over PLACE_MAX_MARKS': picto([row('$40', 5), row('$20', 13), row('$25', 8)]),
  'a zero-size stack tier': stack([seg('Senior', 70), seg('Mezz', 30), seg('Equity', 0)]),
  'a bars visual': { type: 'teachingSlide', diagramVisual: { type: 'bars', title: 'B', items: [], sentiment: 'positive' } },
  'no visual': { type: 'teachingSlide' },
};
for (const [why, step] of Object.entries(nulls)) check(P.buildPlace(step) === null, `buildPlace must be null on ${why}`);

// ---- 4. the hand-picked placements, from the RAW loader -----------------------------------------
const lessonsBy = new Map();
async function stepAt(key) {
  const [course, num, index] = key.split(':');
  if (!lessonsBy.has(course)) lessonsBy.set(course, await raw.loadCourseLessons(course));
  const lesson = lessonsBy.get(course).find((l) => l.num === Number(num));
  return lesson ? { course, num: Number(num), index: Number(index), step: lesson.steps[Number(index)] } : null;
}
check(P.PLACE_PLACEMENTS.length >= 2 && P.PLACE_PLACEMENTS.length <= 4, `2 to 4 hand-picked placements, got ${P.PLACE_PLACEMENTS.length}`);
const report = [];
for (const { key, slot } of P.PLACE_PLACEMENTS) {
  const at = await stepAt(key);
  check(at?.step, `${key}: no such step in the raw loader`);
  if (!at?.step) continue;
  const spec = P.buildPlace(at.step);
  check(spec, `${key}: buildPlace returned null from the raw loader`);
  if (!spec) continue;
  const v = at.step.diagramVisual ?? at.step.visual;
  const authored = v.segments ?? v.rows;
  spec.slots.forEach((s, i) => {
    check(s.label === authored[i].label, `${key}: slot ${i} label is not the authored "${authored[i].label}"`);
    check(s.caption === authored[i].explain, `${key}: slot ${i} caption is not the authored explain word for word`);
  });
  check(spec.title === v.title && (spec.footer ?? undefined) === (v.footer ?? undefined), `${key}: title/footer not authored`);
  if (spec.mode === 'waffle') check(P.waffleCells(spec).length === 100, `${key}: waffle is not 100 cells`);
  if (spec.mark) check(!!getSprite(spec.mark.sprite), `${key}: sprite "${spec.mark.sprite}" does not resolve`);
  const id = stepId(at.course, at.num, at.index, at.step);
  check(stepIdPosition(id) === key, `${key}: stepIdPosition gives ${stepIdPosition(id)}`);
  const deck = deriveDeck(at.step, id);
  check(deck?.cards.some((c) => c.kind === slot), `${key}: derived deck has no "${slot}" card for the place card to replace`);
  check(spec.title.length <= CARD_BUDGET.title, `${key}: title ${spec.title.length} > ${CARD_BUDGET.title}`);
  for (const s of spec.slots) check(s.label.length <= CARD_BUDGET.detail, `${key}: label "${s.label}" > ${CARD_BUDGET.detail}`);
  for (const t of P.textOf(spec)) check(!/[–—]/.test(t), `${key}: en/em dash in "${t}"`);
  const { slotOrder, tokenOrder } = P.placeLayout(spec);
  check(JSON.stringify(P.placeLayout(P.buildPlace(at.step))) === JSON.stringify({ slotOrder, tokenOrder }), `${key}: layout differs between loads`);
  if (spec.mode === 'pictograph') check(slotOrder.every((s, j) => s !== j), `${key}: a pictograph row is drawn in its authored place, so its label answers itself`);
  check(tokenOrder.every((t, j) => t !== slotOrder[j]), `${key}: a label sits in the tray directly under its own spot`);
  check([...tokenOrder].sort().join() === slotOrder.map((_, i) => i).join(), `${key}: tray does not hold every label once`);
  report.push(`${key} ${spec.mode} ${spec.slots.length} slots, captions ${Math.max(...spec.slots.map((s) => s.caption.length))} chars max`);
}

// ---- 5. the reducer ------------------------------------------------------------------------------
{
  const play = (acts, n = 3) => acts.reduce(P.placeReducer, P.initialPlace(n));
  const put = (token, slot) => [{ type: 'pick', token }, { type: 'slot', slot }];
  const right = play([...put(0, 0), ...put(1, 1), ...put(2, 2), { type: 'check' }]);
  check(right.solved && right.firstTry && right.tries === 1, 'all right on the first Check must be solved and firstTry');
  const noCheckEarly = play([...put(0, 0), { type: 'check' }]);
  check(noCheckEarly.tries === 0, 'Check must do nothing until every spot is filled');
  const miss = play([...put(0, 0), ...put(2, 1), ...put(1, 2), { type: 'check' }]);
  check(!miss.solved && miss.locked.join() === 'true,false,false' && miss.wrong.join() === 'false,true,true', 'a miss must lock the right spot and flag the wrong ones');
  check(P.placeReducer(miss, { type: 'pick', token: 1 }) === miss, 'nothing may move while the amber verdict waits on Try again');
  const again = P.placeReducer(miss, { type: 'retry' });
  check(again.placed.join() === '0,,' && again.locked[0] && !again.wrong.some(Boolean), 'Try again must keep the right ones placed and send only the wrong ones home');
  check(P.placeReducer(again, { type: 'slot', slot: 0 }).placed[0] === 0, 'a locked spot must never move');
  const solvedLate = [...put(1, 1), ...put(2, 2), { type: 'check' }].reduce(P.placeReducer, again);
  check(solvedLate.solved && !solvedLate.firstTry && solvedLate.tries === 2, 'a second-try solve must not count as firstTry (owner decision 4)');
  const swap = play([...put(0, 0), ...put(1, 0)]);
  check(swap.placed.join() === '1,,' && P.trayTokens(swap, [0, 1, 2]).join() === '0,2', 'placing on a filled spot must send the old label back to the tray');
}
for (const n of [2, 3, 4, 5]) {
  for (let i = 0; i < 50; i += 1) {
    const d = P.derangement(n, `seed${i}`);
    check(d.every((v, j) => v !== j) && new Set(d).size === n, `derangement(${n}, seed${i}) has a fixed point or repeats`);
  }
}

// ---- 6. the renderer source ---------------------------------------------------------------------
const card = readFileSync(join(ROOT, 'src/components/mobile-lesson/clickthrough/place-card.tsx'), 'utf8');
const code = card.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
check(!/PanResponder|Gesture\w*|onResponder\w*|onPan\w*|react-native-gesture-handler/.test(code), 'place-card must be tap only: no PanResponder, gesture handler or responder props');
// Up to the child element: a prop like onPress={() => x} holds a ">" but never a "<".
const pressables = code.match(/<(?:SpringPressable|SlabButton)\b[^<]*/g) ?? [];
check(pressables.length >= 4, `expected token, spot, Check and Try again pressables, found ${pressables.length}`);
// SlabButton carries the role itself (it renders a SpringPressable with accessibilityRole="button").
for (const p of pressables) check(/^<SlabButton\b/.test(p) || /accessibilityRole="button"/.test(p), `a pressable without accessibilityRole="button": ${p.slice(0, 80)}`);
check(/useReducedMotion\(\)/.test(code), 'place-card must read useReducedMotion');
for (const m of code.match(/entering=\{[^}]*\}/g) ?? []) check(/reduced|animate \?/.test(m), `an entering animation not guarded by Reduce Motion: ${m}`);
check(!/withSpring|springify/.test(code), 'no spring on the card: data geometry never overshoots (Atlas acts inside AtlasCue)');
check(!/destructive/.test(code), 'a miss is amber, never destructive red (owner decision 4)');
check(!/#[0-9A-Fa-f]{6}\b/.test(card), 'no hex literal in place-card.tsx (design-rules-pin ratchet)');
check(/minHeight: 44/.test(code), 'spots and tokens must keep the 44pt minimum');
// Owner decision 4: only the first try counts toward XP/mastery. The reducer records it; this is the
// guard that the card actually hands it to the deck, not just computes it and drops it.
check(/onWorked\w*\.current\(\{\s*firstTry:\s*state\.firstTry\s*\}\)/.test(code), 'place-card must report firstTry through onWorked (owner decision 4)');
// The miss is a slide-up bar (owner decision 4, brilliant/hi/incorrect_01.jpg), not a block that pops in.
check(/styles\.barMiss\][^>]*entering=\{reduced \? undefined : FadeInDown/.test(code) || /entering=\{reduced \? undefined : FadeInDown[^}]*\}[^>]*styles\.barMiss/.test(code), 'the amber miss bar must slide up (FadeInDown), guarded by Reduce Motion');

// ---- 7. the wrapped loader ----------------------------------------------------------------------
if (!BUILDER_ONLY) {
  const { getMobileLesson } = await imported('src/lib/curriculum/index.ts');
  for (const { key } of P.PLACE_PLACEMENTS) {
    const [course, num, index] = key.split(':');
    const lesson = await getMobileLesson(course, Number(num));
    const step = lesson?.steps?.[Number(index)];
    const has = step?.type === 'mobileDeck' && step.cards.some((c) => c.kind === 'interactive' && c.spec?.kind === 'place');
    check(has, `WRAPPED ${key} renders no place card; integration has not placed it`);
  }
}

if (failures.length) {
  console.error(`clickthrough-place-pin: ${failures.length} failure(s)`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`clickthrough-place-pin: OK. ${Object.keys(nulls).length} null cases; ${report.join('; ')}${BUILDER_ONLY ? ' (wrapped-loader check skipped)' : '; all render in the wrapped loader'}.`);
