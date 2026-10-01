/**
 * CLICKTHROUGH BUILD-UP PIN: the build-up card (design M3) shows only authored text, in authored
 * order, inside Hilbert's 2.5s budget, refuses to build without every figure, and never passes an
 * authored hex to the renderer.
 *
 *   node --import ./scripts/ts-resolve-hooks.mjs scripts/clickthrough-buildup-pin.mjs
 *
 * WHY THIS EXISTS. A flow's ORDER is its lesson ("cheapest money first"), and on a chart card
 * LessonVisual shows the finished picture at once. clickthrough/buildup.ts rebuilds it one piece at
 * a time and captions each piece with its authored `explain`. The ways that goes wrong, each checked:
 * a builder that sorts or reorders the pieces, a caption that is not the author's sentence, a
 * missing explain filled with nothing (a diagram with a hole), a build too slow to watch, an
 * authored '#EF4444' repainting a tier outside the theme, and a card that animates under Reduce
 * Motion.
 *
 * WHAT IT ASSERTS:
 *   1. Fixtures: a flow and a stack build with pieces in authored order, captions = authored
 *      explains, tags = authored values, weights = authored percents, and no colour or hex anywhere
 *      in the spec.
 *   2. Null on: one missing explain, one missing label, a 2-node flow, a 6-node flow, a stack with a
 *      zero percent, a bars visual, no title, an em dash in a caption, a non-teaching-slide step.
 *   3. Time: the build of BUILDUP_MAX_PIECES pieces ends by BUILD_MAX_MS (computed from timing.ts),
 *      pieceTiming is ordered piece by piece, and beat 0 carries the whole build.
 *   4. tierCells is monotonic in the authored percent (a bigger share is never a shorter tier).
 *   5. The hand-picked placements build non-null from the RAW loader (what applyPlacement hands a
 *      builder), in authored order, and the WRAPPED loader (what renders) has a `chart` card there
 *      for the card to take, or already renders the build card. personal-finance:10:2 (7 nodes)
 *      builds null, so the cap is real on shipped content.
 *   6. The card source: useReducedMotion, no withSpring (data geometry never overshoots), pieces are
 *      buttons, the shared kit is used (useClipTimeline, ClipControls, AtlasCue, CellRect), and no
 *      hex literal or authored colour field is read.
 *
 * BREAK TESTS, watched failing before this shipped (CONSTITUTION 1.5):
 *   - BUILDUP_MAX_PIECES raised to 7 in buildup.ts: the duration assertion (3,180ms > 2,500ms) and
 *     the personal-finance:10:2 null check fail.
 *   - pieces sorted by label in buildFromVisual: the authored-order checks fail.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = new URL('..', import.meta.url).pathname;
const imported = (path) => import(pathToFileURL(join(ROOT, path)).href);

const B = await imported('src/lib/mobile-lesson/clickthrough/buildup.ts');
const T = await imported('src/lib/mobile-lesson/clickthrough/timing.ts');
const R = await imported('src/lib/curriculum/courseIndex.ts');
const W = await imported('src/lib/curriculum/index.ts');

const failures = [];
const check = (name, ok, detail = '') => {
  if (!ok) failures.push(`${name}${detail ? `: ${detail}` : ''}`);
};
const HEX = /#[0-9a-f]{3,8}\b/i;

// 1. Fixtures.
const flow = {
  type: 'flow',
  title: 'Borrowing Order',
  nodes: [
    { label: 'Grants', value: 'Free', color: '#10B981', explain: 'Money you never pay back.' },
    { label: 'Subsidized', value: 'No interest in school', color: '#3B82F6', explain: 'The balance sits still.' },
    { label: 'Private', explain: 'Only after every tier above is empty.' },
  ],
  footer: 'Exhaust each tier first',
  sentiment: 'positive',
};
const stack = {
  type: 'stack',
  title: 'Who Gets Paid',
  segments: [
    { label: 'Secured', value: 'Paid first', percent: 40, color: '#10B981', explain: 'A thing is pledged.' },
    { label: 'Unsecured', value: 'Next', percent: 30, color: '#3B82F6', explain: 'A promise and nothing else.' },
    { label: 'Common', value: 'Last', percent: 10, color: '#EF4444', explain: 'Paid only after everyone.' },
  ],
  sentiment: 'positive',
};

const f = B.buildFromVisual(flow);
check('flow fixture builds', !!f);
if (f) {
  check('flow kind/mode', f.kind === 'build' && f.mode === 'flow');
  check('flow labels in authored order', JSON.stringify(f.pieces.map((p) => p.label)) === JSON.stringify(flow.nodes.map((n) => n.label)));
  check('flow captions are the authored explains', f.pieces.every((p, i) => p.caption === flow.nodes[i].explain));
  check('flow tags are the authored values', f.pieces.every((p, i) => p.tag === flow.nodes[i].value));
  check('flow footer authored', f.footer === flow.footer);
  check('flow spec carries no hex', !HEX.test(JSON.stringify(f)), JSON.stringify(f));
  check('flow pieces have no colour field', f.pieces.every((p) => !('color' in p)));
}
const s = B.buildFromVisual(stack);
check('stack fixture builds', !!s);
if (s) {
  check('stack mode', s.mode === 'stack');
  check('stack labels in authored order', JSON.stringify(s.pieces.map((p) => p.label)) === '["Secured","Unsecured","Common"]');
  check('stack weights are the authored percents', JSON.stringify(s.pieces.map((p) => p.weight)) === '[40,30,10]');
  check('stack spec carries no hex', !HEX.test(JSON.stringify(s)), JSON.stringify(s));
}

// 2. Refusals.
const clone = (v) => structuredClone(v);
const edit = (v, fn) => { const c = clone(v); fn(c); return c; };
const nodes6 = Array.from({ length: 6 }, (_, i) => ({ label: `Step ${i + 1}`, explain: `Beat ${i + 1}.` }));
const refusals = [
  ['one explain missing', edit(flow, (c) => { delete c.nodes[1].explain; })],
  ['one explain blank', edit(flow, (c) => { c.nodes[2].explain = '  '; })],
  ['one label missing', edit(flow, (c) => { delete c.nodes[0].label; })],
  ['a 2-node flow', edit(flow, (c) => { c.nodes = c.nodes.slice(0, 2); })],
  ['a 6-node flow', { ...clone(flow), nodes: nodes6 }],
  ['a stack segment at 0%', edit(stack, (c) => { c.segments[2].percent = 0; })],
  ['a stack segment without percent', edit(stack, (c) => { delete c.segments[1].percent; })],
  ['one stack explain missing', edit(stack, (c) => { delete c.segments[0].explain; })],
  ['a bars visual', { type: 'bars', title: 'x', items: [{ label: 'a', value: 1, explain: 'a' }], sentiment: 'positive' }],
  ['no title', edit(flow, (c) => { c.title = ''; })],
  ['an em dash in a caption', edit(flow, (c) => { c.nodes[0].explain = 'Free money \u2014 never repaid.'; })],
];
for (const [name, v] of refusals) check(`null on ${name}`, B.buildFromVisual(v) === null);
check('null on a non-teaching-slide step', B.buildBuildup({ type: 'hookOpener', visual: flow }) === null);
check('builds on a teaching slide step', !!B.buildBuildup({ type: 'teachingSlide', diagramVisual: flow }));

// 3. Time.
const maxMs = T.buildTotalMs(B.BUILDUP_MAX_PIECES);
check(`a ${B.BUILDUP_MAX_PIECES}-piece build ends by BUILD_MAX_MS`, maxMs <= T.BUILD_MAX_MS, `${maxMs}ms > ${T.BUILD_MAX_MS}ms`);
const maxSpec = { pieces: Array.from({ length: B.BUILDUP_MAX_PIECES }, () => ({ label: 'x', caption: 'x' })) };
check('buildDurationMs equals timing.ts buildTotalMs', B.buildDurationMs(maxSpec) === maxMs, `${B.buildDurationMs(maxSpec)} vs ${maxMs}`);
for (let k = 1; k < B.BUILDUP_MAX_PIECES; k++) {
  const a = B.pieceTiming(k - 1);
  const b = B.pieceTiming(k);
  check(`piece ${k} starts after piece ${k - 1}`, b.connectorAt > a.connectorAt && b.fillAt >= b.connectorAt + b.connectorMs);
  // Piece k's connector grows out of piece k-1, so it may not start before piece k-1 has begun to fill.
  check(`piece ${k} connector starts after piece ${k - 1} begins filling`, b.connectorAt >= a.fillAt, JSON.stringify({ a, b }));
}
check('piece 0 has no connector', B.pieceTiming(0).connectorMs === 0);
if (f) {
  const beats = B.beatsFor(f);
  check('one beat per piece', beats.length === f.pieces.length);
  check('beat captions are the authored explains, in order', beats.every((b, i) => b.caption === flow.nodes[i].explain));
  check('beat 0 carries the whole build', beats[0].motionMs === B.buildDurationMs(f));
  check('later beats only move the highlight', beats.slice(1).every((b) => b.motionMs === 0));
}

// 4. Tier heights.
const weights = [40, 30, 20, 10];
const cells = weights.map((w) => B.tierCells(w, 40));
check('tierCells strictly falls with the authored percent', cells.every((c, i) => i === 0 || c < cells[i - 1]), cells.join(','));
check('every tier is at least 44pt', cells.every((c) => c * T.CELL_PT >= 44), cells.join(','));

// 5. Placements, raw and wrapped. Keys are `course:lessonNum:stepIndex`, the applyPlacement key.
const PLACED = {
  'investing-fundamentals:6:1': { mode: 'flow', labels: ['Investor buys ETF shares', 'ETF holds every stock in the index', 'Index tracks the market'] },
  'personal-finance:13:1': { mode: 'flow', labels: ['Grants & scholarships', 'Subsidized federal', 'Unsubsidized federal', 'Private loans'] },
  'corporate-finance:15:1': { mode: 'stack', labels: ['Secured Creditors', 'Unsecured Creditors', 'Preferred Stock', 'Common Stock'] },
};
const at = async (loader, key) => {
  const [course, num, idx] = key.split(':');
  const lesson = (await loader.loadCourseLessons(course)).find((l) => l.num === Number(num));
  return { lesson, step: lesson?.steps?.[Number(idx)] };
};
const status = [];
for (const [key, want] of Object.entries(PLACED)) {
  const { lesson, step } = await at(R, key);
  const spec = step ? B.buildBuildup(step, lesson.steps) : null;
  check(`${key} builds from the raw loader`, !!spec, step?.type);
  if (!spec) continue;
  check(`${key} mode ${want.mode}`, spec.mode === want.mode, spec.mode);
  check(`${key} pieces in authored order`, JSON.stringify(spec.pieces.map((p) => p.label)) === JSON.stringify(want.labels), spec.pieces.map((p) => p.label).join(' | '));
  const items = step.diagramVisual.nodes ?? step.diagramVisual.segments;
  check(`${key} captions are the authored explains`, spec.pieces.every((p, i) => p.caption === items[i].explain));
  check(`${key} carries no hex`, !HEX.test(JSON.stringify(spec)));
  check(`${key} build ends by BUILD_MAX_MS`, B.buildDurationMs(spec) <= T.BUILD_MAX_MS, String(B.buildDurationMs(spec)));

  const { step: deck } = await at(W, key);
  const kinds = (deck?.cards ?? []).map((c) => (c.kind === 'interactive' ? `interactive:${c.spec.kind}` : c.kind));
  const chart = deck?.cards?.find((c) => c.kind === 'chart');
  const placed = kinds.includes('interactive:build');
  check(`${key} WRAPPED deck has the chart slot or the build card`, deck?.type === 'mobileDeck' && (!!chart || placed), kinds.join(','));
  // Only while the slot is still a chart: once the build is placed, the chart left on the deck is the
  // retired stakes card's (a 2nd chart card since 2026-09-30), with its own heading.
  if (chart && !placed) check(`${key} keeps the chart card's heading`, chart.title === spec.title, `${chart.title} vs ${spec.title}`);
  status.push(`${key} ${placed ? 'placed' : 'chart slot open'} (${spec.pieces.length} ${spec.mode}, ${B.buildDurationMs(spec)}ms)`);
}
{
  const { lesson, step } = await at(R, 'personal-finance:10:1');
  const n = step?.diagramVisual?.nodes?.length;
  check('personal-finance:10:1 is the authored 7-node flow', n === 7, String(n));
  check('personal-finance:10:1 builds null (over the cap)', B.buildBuildup(step, lesson?.steps) === null);
}

// 6. The card source.
const card = readFileSync(join(ROOT, 'src/components/mobile-lesson/clickthrough/buildup-card.tsx'), 'utf8');
const code = card.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
check('card reads useReducedMotion', /useReducedMotion\(\)/.test(code));
check('card has no withSpring (data geometry never overshoots)', !/withSpring/.test(code));
check('pieces are buttons', /accessibilityRole="button"/.test(code));
for (const kit of ['useClipTimeline', 'ClipControls', 'AtlasCue', 'CellRect', 'StageFrame', 'ClipCaption']) {
  check(`card uses the shared kit's ${kit}`, new RegExp(`\\b${kit}\\b`).test(code));
}
check('card has no hex literal', !/#[0-9A-Fa-f]{6}\b/.test(code));
check('card never reads an authored colour', !/\.color\b|segments|\.nodes\b/.test(code));
check('reduced motion builds on the first frame', /const built = reduced \|\|/.test(code));
// The timeline clamps beat 0's motion to BEAT_MAX_MS (1500), but a 4-piece build runs 1830ms, so
// with the timeline's own `busy` Next went live mid-build on personal-finance:13:2 and
// corporate-finance:15:2 and captioned a row that had no label yet. Controls must wait on `built`.
check('Next waits for the build to land', /busy:\s*timeline\.busy\s*\|\|\s*!built/.test(code));
// A rounded row clipped the 2-cell pixel marker into a half-pill: a round shape inside a cell-grid
// diagram (CONSTITUTION 5.5). Rows are square; only the kit's frame is rounded.
check('diagram rows have square corners', !/borderRadius/.test(code));

if (failures.length) {
  console.error(`clickthrough-buildup-pin FAILED (${failures.length}):`);
  for (const x of failures) console.error(`  - ${x}`);
  process.exit(1);
}
console.log(`clickthrough-buildup-pin ok: ${refusals.length + 1} refusals, max build ${maxMs}ms <= ${T.BUILD_MAX_MS}ms, ${status.join('; ')}`);
