/**
 * CLICKTHROUGH PREDICT PIN: the predict card (M2) only ever reveals the authored bar, prints only
 * authored strings, refuses to build without them, and its hand-picked placements build from the
 * real corpus into a deck slot that exists.
 *
 *   node --import ./scripts/ts-resolve-hooks.mjs scripts/clickthrough-predict-pin.mjs
 *
 * WHY THIS EXISTS. The predict card asks the learner to commit to a guess and then shows the
 * lesson's own bar growing over it. Two failures would make it lie: revealing the learner's guess
 * (or any number derived from it) as though it were the answer, and building from a chart missing
 * a figure and filling the gap. A third makes it pointless: placing it where the lesson has
 * already said the answer, which is why global-economics:22:5 was refused (22:4 says "from 40%
 * to 90%" one screen earlier; check 5 below fails on it).
 *
 * WHAT IT ASSERTS:
 *   1. Fixtures: a comparison and a bars chart build with authored labels, displays and the
 *      target's authored `explain`; the revealed percent is the authored `percent` (comparison) or
 *      value / max x 100 (bars), in authored order.
 *   2. Refusals: null for a missing explain, percent, displayValue or title, 3 rows, identical
 *      labels or displays, an over-long caption, and a step that is not a teaching slide.
 *   3. Fixed copy: the prompt, the how-to line, the replay line and every verdict line have NO digits (so the
 *      verdict can never state a gap the lesson did not write) and no em or en dash; verdictOf
 *      words the three cases right; the reveal beat (what VoiceOver hears) is the verdict line then
 *      the authored explain; once locked, beat 0 is the replay line, not the drag how-to.
 *   4. Every PREDICT_PLACEMENTS key builds non-null from the RAW loader (courseIndex.ts, what the
 *      placement builder is handed), and its revealed percent / displays / caption equal the
 *      authored visual.
 *   5. In the WRAPPED loader (curriculum/index.ts, what renders) each key's deck has a `chart`
 *      card and no other interactive, applyPlacement with the predict builder puts a `predict`
 *      card in the chart's place, nothing earlier in the lesson states the target's figure (the
 *      answer), and no other card on the deck repeats the reveal caption. If PLACEMENTS already
 *      carries the key, the rendered deck itself must hold the predict card.
 *   6. Renderer source: Reduce Motion is read and branched on, the revealed CellRect draws
 *      `targetCells` from `spec.target.percent` (not the guess), Check is disabled until touched,
 *      Check is a button, the guess row is adjustable, no spring touches geometry, no hex literal.
 *
 * BREAK TESTS (each watched failing, exit 1, then restored to exit 0 on 2026-09-22):
 *   - the revealed CellRect set to `cells={guessCells}` fails check 6;
 *   - bars printing `String(i.value)` instead of `displayValue` fails checks 1, 2 and 4;
 *   - a verdict line reading "Close, within 10." fails check 3;
 *   - review 2026-09-22: predictBeats ignoring `locked` (beat 0 always the how-to) fails check 3;
 *     the card passing `verdict` instead of the live `shownVerdict` fails check 6;
 *   - global-economics:22:5 added to PREDICT_PLACEMENTS (caption ceiling lifted) fails check 5 on
 *     "90%" stated before the reveal.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = new URL('..', import.meta.url).pathname;
const imported = (path) => import(pathToFileURL(join(ROOT, path)).href);

const P = await imported('src/lib/mobile-lesson/clickthrough/predict.ts');
const PL = await imported('src/lib/mobile-lesson/parts/placements.ts');
const R = await imported('src/lib/curriculum/courseIndex.ts');
const W = await imported('src/lib/curriculum/index.ts');

const failures = [];
const check = (name, ok, detail = '') => {
  if (!ok) failures.push(`${name}${detail ? `: ${detail}` : ''}`);
};

// 1. Fixtures.
const slide = (diagramVisual) => ({ type: 'teachingSlide', sectionLabel: 'x', title: 'x', paragraphs: [], highlightedTerms: [], diagramDescription: '', diagramVisual });
const CMP = {
  type: 'comparison',
  title: 'Cheap fund vs pricey fund',
  rows: [
    { label: 'Cheap fund', value: '$100', percent: 100, explain: 'The cheap one.' },
    { label: 'Pricey fund', value: '$60', percent: 60, explain: 'The pricey one keeps less.' },
  ],
  footer: 'Fees add up',
  sentiment: 'negative',
};
const BARS = {
  type: 'bars',
  title: 'Two returns',
  items: [
    { label: 'Stocks', value: 80, displayValue: '8%/yr', explain: 'Stocks pay more.' },
    { label: 'Bonds', value: 40, displayValue: '4%/yr', explain: 'Bonds pay less.' },
  ],
  sentiment: 'positive',
};

const c = P.buildPredict(slide(CMP));
check('comparison fixture builds', !!c);
if (c) {
  check('kind predict', c.kind === 'predict');
  check('anchor is the first authored row', c.anchor.label === 'Cheap fund' && c.anchor.display === '$100' && c.anchor.percent === 100, JSON.stringify(c.anchor));
  check('target is the second authored row', c.target.label === 'Pricey fund' && c.target.display === '$60', JSON.stringify(c.target));
  check('revealed percent is the authored percent', c.target.percent === 60, String(c.target.percent));
  check('caption is the authored explain', c.target.caption === 'The pricey one keeps less.');
  check('footer kept when it restates nothing', c.footer === 'Fees add up', String(c.footer));
}
const b = P.buildPredict(slide(BARS));
check('bars fixture builds', !!b);
if (b) {
  check('bars display is displayValue, never the sizing value', b.anchor.display === '8%/yr' && b.target.display === '4%/yr', `${b.anchor.display} / ${b.target.display}`);
  check('bars percent is value / max x 100', b.anchor.percent === 100 && b.target.percent === 50, `${b.anchor.percent} / ${b.target.percent}`);
  check('bars without footer has none', !('footer' in b));
}
const restating = P.buildPredict(slide({ ...CMP, footer: 'The gap is $60 in the end' }));
check('footer restating a shown figure is dropped (say it once)', restating && !('footer' in restating), JSON.stringify(restating?.footer));

// 2. Refusals.
const clone = (v) => structuredClone(v);
const cmpWith = (fn) => { const v = clone(CMP); fn(v); return slide(v); };
const barsWith = (fn) => { const v = clone(BARS); fn(v); return slide(v); };
const refusals = [
  ['target explain missing', cmpWith((v) => delete v.rows[1].explain)],
  ['anchor explain missing', cmpWith((v) => delete v.rows[0].explain)],
  ['target percent missing', cmpWith((v) => delete v.rows[1].percent)],
  ['percent above 100', cmpWith((v) => (v.rows[0].percent = 140))],
  ['value missing', cmpWith((v) => (v.rows[1].value = ' '))],
  ['three rows', cmpWith((v) => v.rows.push({ label: 'Third', value: '$1', percent: 1, explain: 'x' }))],
  ['identical labels', cmpWith((v) => (v.rows[1].label = v.rows[0].label))],
  ['identical displays', cmpWith((v) => (v.rows[1].value = v.rows[0].value))],
  ['no title', cmpWith((v) => (v.title = ''))],
  ['caption over the ceiling', cmpWith((v) => (v.rows[1].explain = 'x'.repeat(P.PREDICT_CAPTION_MAX_CHARS + 1)))],
  ['bars displayValue missing', barsWith((v) => delete v.items[1].displayValue)],
  ['bars explain missing', barsWith((v) => delete v.items[0].explain)],
  ['bars value zero', barsWith((v) => (v.items[1].value = 0))],
  ['pie visual', slide({ type: 'pie', title: 't', segments: [], sentiment: 'positive' })],
  ['not a teaching slide', { type: 'hookOpener', title: 't', fact: '', outcome: '', visualDescription: '', visual: CMP }],
];
for (const [name, step] of refusals) check(`null when ${name}`, P.buildPredict(step) === null);

// 3. Fixed copy: no digits, no em or en dash.
const fixed = [P.PREDICT_PROMPT, P.PREDICT_HOW, P.PREDICT_REPLAY, ...Object.values(P.VERDICT_LINE)];
for (const line of fixed) {
  check('fixed line has no digits', !/\d/.test(line), line);
  check('fixed line has no em or en dash', !/[–—]/.test(line), line);
}
check('verdict shorter', P.verdictOf(40, 76) === 'shorter');
check('verdict longer', P.verdictOf(100, 49.5) === 'longer');
check('verdict close within one step', P.verdictOf(80, 76) === 'close' && P.verdictOf(70, 76) === 'close');
check('guessAt snaps to steps', P.guessAt(0.76) === 80 && P.guessAt(1.4) === 100 && P.guessAt(-1) === 0);
check('nudge clamps', P.nudgeGuess(100, 1) === 100 && P.nudgeGuess(0, -1) === 0 && P.nudgeGuess(30, 1) === 40);
const beats = c ? P.predictBeats(c, 'close', false) : [];
check('two beats', beats.length === 2);
// The reveal beat is what VoiceOver hears: the verdict, then the authored explain word for word.
check('reveal beat speaks the verdict then the authored explain', beats[1]?.caption === `${P.VERDICT_LINE.close} ${c?.target.caption}`, beats[1]?.caption);
check('a miss nods, never celebrates', c && P.predictBeats(c, 'shorter', true)[1].reaction === 'nod');
// Once locked, beat 0 must not tell the learner to drag controls that are gone.
check('locked beat 0 is the replay line, not the how-to', c && P.predictBeats(c, 'shorter', true)[0].caption === P.PREDICT_REPLAY && beats[0]?.caption === P.PREDICT_HOW);

// 4 and 5. The placements, raw then wrapped.
const figures = (s) => s.match(/\$?\d[\d,.]*%?/g) ?? [];
const built = [];
for (const key of P.PREDICT_PLACEMENTS) {
  const [course, num, idx] = key.split(':');
  const raw = (await R.loadCourseLessons(course)).find((l) => l.num === Number(num));
  const step = raw?.steps?.[Number(idx)];
  const spec = step ? P.buildPredict(step, raw.steps) : null;
  check(`${key} builds from the raw loader`, !!spec, step?.type);
  if (!spec) continue;
  const v = step.diagramVisual;
  const items = v.type === 'comparison' ? v.rows : v.items;
  const max = v.type === 'bars' ? Math.max(...items.map((i) => i.value)) : null;
  const authoredPct = v.type === 'comparison' ? items[1].percent : (items[1].value / max) * 100;
  check(`${key} revealed percent is authored`, spec.target.percent === authoredPct, `${spec.target.percent} vs ${authoredPct}`);
  const disp = (i) => (v.type === 'comparison' ? i.value : i.displayValue);
  check(`${key} displays are authored strings`, spec.anchor.display === disp(items[0]) && spec.target.display === disp(items[1]));
  check(`${key} caption is the authored explain`, spec.target.caption === items[1].explain);
  for (const line of P.textOf(spec)) check(`${key} no em or en dash`, !/[–—]/.test(line), line);

  const wrapped = (await W.loadCourseLessons(course)).find((l) => l.num === Number(num));
  const deck = wrapped?.steps?.[Number(idx)];
  check(`${key} wrapped step is a slide deck`, deck?.type === 'mobileDeck' && deck?.sourceType === 'teachingSlide', deck?.type);
  if (!deck) continue;
  const cards = deck.cards ?? [];
  const rendered = cards.filter((x) => x.kind === 'interactive').map((x) => x.spec.kind);
  const integrated = PL.PLACEMENTS[key];
  if (integrated) {
    check(`${key} is placed on the chart slot`, integrated.slot === 'chart', integrated.slot);
    check(`${key} renders a predict card`, rendered.includes('predict'), `[${rendered.join(', ')}]`);
  } else {
    check(`${key} derived deck has a chart card`, cards.some((x) => x.kind === 'chart'));
    check(`${key} derived deck has no other interactive`, rendered.length === 0, `[${rendered.join(', ')}]`);
    const table = { [key]: { kind: 'predict', slot: 'chart', build: (s, ls) => { const sp = P.buildPredict(s, ls); return sp ? { spec: sp, text: P.textOf(sp) } : null; } } };
    const placed = PL.applyPlacement(deck, deck.sourceId, raw.steps, table);
    const kinds = placed.cards.map((x) => (x.kind === 'interactive' ? `interactive:${x.spec.kind}` : x.kind));
    check(`${key} applyPlacement puts predict in the chart's place`, kinds.includes('interactive:predict') && !kinds.includes('chart') && placed.cards.length === cards.length, kinds.join(','));
  }
  // The answer must not be on screen before the reveal: earlier steps, and this deck's other cards.
  const before = JSON.stringify([...wrapped.steps.slice(0, Number(idx)), cards.filter((x) => x.kind !== 'chart' && !(x.kind === 'interactive' && x.spec.kind === 'predict'))]);
  for (const f of figures(spec.target.display)) check(`${key} answer "${f}" not stated before the reveal`, !before.includes(f));
  const others = JSON.stringify(cards.filter((x) => !(x.kind === 'interactive' && x.spec.kind === 'predict')).map((x) => ({ ...x, visual: undefined })));
  check(`${key} caption said once on the deck`, !others.includes(spec.target.caption.slice(0, 40)));
  built.push(`${key} ${spec.anchor.display}/${spec.target.display} at ${Math.round(spec.target.percent)}${integrated ? ' (integrated)' : ' (pending integration)'}`);
}

// 6. Renderer source.
const card = readFileSync(join(ROOT, 'src/components/mobile-lesson/clickthrough/predict-card.tsx'), 'utf8');
const code = card.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
check('reads Reduce Motion', /useReducedMotion\(\)/.test(code));
check('branches on Reduce Motion', /reduced \?/.test(code));
check('targetCells come from the authored percent', /targetCells = cellsFor\(spec\.target\.percent,/.test(code));
const reveal = code.match(/\{revealed \? \([\s\S]*?<CellRect[\s\S]*?\/>/)?.[0] ?? '';
check('revealed bar draws the authored percent', /cells=\{targetCells\}/.test(reveal) && !/guess/i.test(reveal.replace(/\{revealed \? \(/, '')), reveal.slice(0, 80));
check('Check disabled until touched', /onPress=\{check\}\s*disabled=\{!touched\}/.test(code));
// SlabButton renders an accessibilityRole="button" SpringPressable, so either form is a button.
check('Check is a button', /accessibilityRole="button"\s*accessibilityLabel="Check your guess"|<SlabButton[^>]*accessibilityLabel="Check your guess"/.test(code));
check('guess row is adjustable while guessing', /accessibilityRole=\{checked \? 'text' : 'adjustable'\}/.test(code) && /name: 'increment'/.test(code));
check('beats carry the live verdict before Check', /predictBeats\(spec, shownVerdict, checked\)/.test(code) && /shownVerdict = verdict \?\? verdictOf\(guess,/.test(code));
check('no spring on geometry', !/withSpring/.test(code));
check('no hex literal', !/#[0-9a-fA-F]{3,8}\b/.test(card));
check('no autoplay to the answer', /autoplay: false/.test(code));

if (failures.length) {
  console.error(`clickthrough-predict-pin FAILED (${failures.length}):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`clickthrough-predict-pin ok: fixtures, ${refusals.length} refusals, digit-free verdicts, ${built.length} placements: ${built.join('; ')}`);
