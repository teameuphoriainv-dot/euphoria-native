/**
 * CLICKTHROUGH STAGE PIN: the Stage clip (M1) only ever shows the lesson's own words and numbers,
 * in the author's order, refuses to build when any of them is missing, and keeps a reduced-motion
 * outcome and button controls.
 *
 *   node --import ./scripts/ts-resolve-hooks.mjs scripts/clickthrough-stage-pin.mjs
 *
 * WHY THIS EXISTS. A stage replays an authored chart one item per beat with that item's `explain`
 * as the caption. The two ways it can lie are quiet ones: a caption or value that is not the
 * author's (a fallback line, a formatted number), and items in a different order than the author
 * drew them (a sort that turns "then" into "most"). Neither crashes, so only a check catches them.
 *
 * WHAT IT ASSERTS:
 *   1. Fixtures: bars, line and pictograph visuals build, with display/caption/label copied verbatim
 *      and magnitudes from the authored values (line: parsed from the authored string).
 *   2. Refusals: null when ONE explain is deleted, a label is blank, the title is missing, there are
 *      1 or 6 items, a line point does not parse or mixes "$" with "%", a bar is negative, a
 *      pictograph row is a fraction of a mark or its sprite is unknown, and for pie/metric visuals.
 *   3. Over the whole RAW corpus: every built stage's display equals the authored displayValue/value,
 *      every caption equals the authored explain, labels match, and items are in authored order;
 *      deleting any single explain from any built visual makes the builder return null.
 *   4. STAGE_PLACEMENTS: each key builds non-null from the RAW loader (the placement contract hands
 *      builders raw steps), its derived deck has a `chart` card for this visual (the slot exists),
 *      and it holds no other interactive. The WRAPPED loader (src/lib/curriculum/index.ts, what
 *      renders) is reported: chart still there (not integrated yet) or a stage equal to the build.
 *   5. Renderer source: useReducedMotion present, no withSpring anywhere, every `entering=` guarded
 *      by reduced motion, controls are pixel-stage's ClipControls whose Back/Next are
 *      accessibilityRole="button" labelled "Previous step" / "Next step", and no em or en dash in
 *      the card's own fixed copy.
 * Watched failing: with the builder sorting items by magnitude (the design's break test) and with
 * the explain check removed; see the L1 report.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = new URL('..', import.meta.url).pathname;
const imported = (path) => import(pathToFileURL(join(ROOT, path)).href);

const S = await imported('src/lib/mobile-lesson/clickthrough/stage.ts');
const R = await imported('src/lib/curriculum/courseIndex.ts');
const W = await imported('src/lib/curriculum/index.ts');
const { deriveDeck } = await imported('src/lib/mobile-lesson/derive.ts');
const { stepId } = await imported('src/lib/mobile-lesson/stepId.ts');

const failures = [];
const check = (name, ok, detail = '') => {
  if (!ok) failures.push(`${name}${detail ? `: ${detail}` : ''}`);
};
const clone = (v) => structuredClone(v);

// 1. Fixtures.
const BARS = {
  type: 'bars',
  title: 'Fixture bars',
  items: [
    { label: 'A', value: 10, displayValue: '$10K', explain: 'First.' },
    { label: 'B', value: 40, explain: 'Second.' },
    { label: 'C', value: 25, displayValue: '$25K', explain: 'Third.' },
  ],
  footer: 'Fixture footer',
  sentiment: 'positive',
};
const LINE = {
  type: 'line',
  title: 'Fixture line',
  points: [
    { label: 'Y0', value: '$2,190', explain: 'One.' },
    { label: 'Y10', value: '$117K', explain: 'Two.' },
    { label: 'Y20', value: '$1.5M', explain: 'Three.' },
  ],
  trend: 'up',
  sentiment: 'positive',
};
const PICTO = {
  type: 'pictograph',
  title: 'Fixture marks',
  sprite: 'coin',
  unitValue: 1,
  unitLabel: '1 share',
  rows: [
    { label: 'M1', value: 5, displayValue: '5 shares', explain: 'Five.' },
    { label: 'M2', value: 10, displayValue: '10 shares', explain: 'Ten.' },
  ],
  sentiment: 'positive',
};

const b = S.buildStageFromVisual(BARS);
check('bars fixture builds', !!b);
if (b) {
  check('bars mode', b.mode === 'bars');
  check('bars display verbatim, value when no displayValue', JSON.stringify(b.items.map((i) => i.display)) === '["$10K","40","$25K"]', JSON.stringify(b.items.map((i) => i.display)));
  check('bars order authored', b.items.map((i) => i.label).join('') === 'ABC');
  check('bars magnitudes authored', JSON.stringify(b.items.map((i) => i.magnitude)) === '[10,40,25]');
  check('bars captions verbatim', b.items.map((i) => i.caption).join('|') === 'First.|Second.|Third.');
  check('bars footer copied', b.footer === 'Fixture footer');
}
const l = S.buildStageFromVisual(LINE);
check('line fixture builds', !!l);
if (l) {
  check('line display is the authored string', l.items.map((i) => i.display).join('|') === '$2,190|$117K|$1.5M');
  check('line magnitudes parsed', JSON.stringify(l.items.map((i) => i.magnitude)) === '[2190,117000,1500000]', JSON.stringify(l.items.map((i) => i.magnitude)));
  check('line has no footer invented', !('footer' in l));
}
const p = S.buildStageFromVisual(PICTO);
check('pictograph fixture builds', !!p);
if (p) {
  check('pictograph magnitude is the mark count', JSON.stringify(p.items.map((i) => i.magnitude)) === '[5,10]');
  check('pictograph carries sprite and unit key', p.mark?.sprite === 'coin' && p.mark?.unitLabel === '1 share');
}

// 2. Refusals.
const without = (v, key, i, field) => {
  const c = clone(v);
  delete c[key][i][field];
  return c;
};
const refusals = [
  ['bars, one explain deleted', without(BARS, 'items', 1, 'explain')],
  ['line, one explain deleted', without(LINE, 'points', 2, 'explain')],
  ['pictograph, one explain deleted', without(PICTO, 'rows', 0, 'explain')],
  ['bars, blank label', (() => { const c = clone(BARS); c.items[0].label = '  '; return c; })()],
  ['no title', (() => { const c = clone(BARS); c.title = ''; return c; })()],
  ['one item', (() => { const c = clone(BARS); c.items = c.items.slice(0, 1); return c; })()],
  ['six items', (() => { const c = clone(BARS); c.items = [...c.items, ...c.items]; return c; })()],
  ['negative bar', (() => { const c = clone(BARS); c.items[0].value = -5; return c; })()],
  ['line point that does not parse', (() => { const c = clone(LINE); c.points[1].value = 'about a lot'; return c; })()],
  ['line mixing $ and %', (() => { const c = clone(LINE); c.points[1].value = '12%'; return c; })()],
  ['pictograph fraction of a mark', (() => { const c = clone(PICTO); c.rows[0].value = 4.5; return c; })()],
  ['pictograph over the mark cap', (() => { const c = clone(PICTO); c.rows[0].value = S.STAGE_MAX_MARKS + 1; return c; })()],
  ['pictograph unknown sprite', (() => { const c = clone(PICTO); c.sprite = 'no-such-sprite'; return c; })()],
  ['pictograph no unit key', (() => { const c = clone(PICTO); c.unitLabel = ''; return c; })()],
  ['caption over the cap', (() => { const c = clone(BARS); c.items[0].explain = 'x'.repeat(S.STAGE_CAPTION_MAX_CHARS + 1); return c; })()],
  ['pie visual', { type: 'pie', title: 'P', segments: [{ label: 'a', percent: 50, color: 'x', explain: 'e' }, { label: 'b', percent: 50, color: 'x', explain: 'e' }], sentiment: 'positive' }],
  ['metric visual', { type: 'metric', title: 'M', value: '$1', sentiment: 'positive' }],
  ['no visual', undefined],
];
for (const [name, v] of refusals) check(`null when ${name}`, S.buildStageFromVisual(v) === null);

// 3. The whole raw corpus.
const listOf = (v) => (v.type === 'bars' ? v.items : v.type === 'line' ? v.points : v.rows);
const authoredDisplay = (v, it) => (v.type === 'line' ? it.value : it.displayValue ?? String(it.value));
let built = 0;
const builtKeys = [];
for (const course of R.COURSES) {
  for (const lesson of await R.loadCourseLessons(course.id)) {
    lesson.steps.forEach((step, i) => {
      const spec = S.buildStage(step, lesson.steps);
      if (!spec) return;
      built += 1;
      const key = `${course.id}:${lesson.num}:${i}`;
      builtKeys.push(key);
      const v = S.visualOf(step);
      const list = listOf(v);
      check(`${key} item count`, spec.items.length === list.length);
      spec.items.forEach((it, k) => {
        check(`${key}[${k}] display is authored`, it.display === String(authoredDisplay(v, list[k]) ?? '').trim(), `${it.display} vs ${authoredDisplay(v, list[k])}`);
        check(`${key}[${k}] caption is the authored explain`, it.caption === String(list[k].explain ?? '').trim(), it.caption.slice(0, 40));
        check(`${key}[${k}] label in authored order`, it.label === String(list[k].label ?? '').trim(), `${it.label} vs ${list[k].label}`);
      });
      check(`${key} title is authored`, spec.title === v.title.trim());
      for (let k = 0; k < list.length; k += 1) {
        const c = clone(v);
        delete listOf(c)[k].explain;
        check(`${key} null with explain ${k} deleted`, S.buildStageFromVisual(c) === null);
      }
    });
  }
}
check('the corpus builds some stages', built > 0, String(built));

// 4. The placements.
const wrappedStatus = [];
for (const key of S.STAGE_PLACEMENTS) {
  const [course, num, idx] = key.split(':');
  const raw = (await R.loadCourseLessons(course)).find((x) => x.num === Number(num));
  const step = raw?.steps?.[Number(idx)];
  const spec = step ? S.buildStage(step, raw.steps) : null;
  check(`${key} builds from the RAW loader`, !!spec);
  if (!spec) continue;
  const derived = deriveDeck(step, stepId(course, Number(num), Number(idx), step));
  const chart = derived?.cards?.find((c) => c.kind === 'chart');
  check(`${key} derived deck has the chart slot`, !!chart && chart.visual === S.visualOf(step), derived?.cards?.map((c) => c.kind).join(','));
  const others = (derived?.cards ?? []).filter((c) => c.kind === 'interactive');
  check(`${key} derived deck holds no other interactive`, others.length === 0, others.map((c) => c.spec.kind).join(','));

  const wrapped = (await W.loadCourseLessons(course)).find((x) => x.num === Number(num))?.steps?.[Number(idx)];
  check(`${key} WRAPPED step is a deck`, wrapped?.type === 'mobileDeck', wrapped?.type);
  const stage = wrapped?.cards?.find((c) => c.kind === 'interactive' && c.spec.kind === 'stage')?.spec;
  const wrappedOthers = (wrapped?.cards ?? []).filter((c) => c.kind === 'interactive' && c.spec.kind !== 'stage');
  check(`${key} WRAPPED deck holds no competing interactive`, wrappedOthers.length === 0, wrappedOthers.map((c) => c.spec.kind).join(','));
  if (stage) {
    check(`${key} WRAPPED stage equals the raw build`, JSON.stringify(stage) === JSON.stringify(spec));
    check(`${key} WRAPPED stage replaced the chart`, !wrapped.cards.some((c) => c.kind === 'chart'));
    wrappedStatus.push(`${key} renders stage`);
  } else {
    check(`${key} WRAPPED deck still has its chart (not integrated yet)`, wrapped?.cards?.some((c) => c.kind === 'chart'));
    wrappedStatus.push(`${key} not placed yet (chart)`);
  }
}

// 5. Renderer source.
const card = readFileSync(join(ROOT, 'src/components/mobile-lesson/clickthrough/stage-card.tsx'), 'utf8');
const kit = readFileSync(join(ROOT, 'src/components/mobile-lesson/clickthrough/pixel-stage.tsx'), 'utf8');
const code = card.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
check('card reads useReducedMotion', /useReducedMotion\(\)/.test(code));
check('card never springs', !/withSpring/.test(code));
for (const m of code.matchAll(/entering=\{([^\n]*)/g)) check('every entering is reduced-motion guarded', /reduced|stamp/.test(m[1]), m[1].slice(0, 60));
check('stamp is off under reduced motion', /const stamp = [^;]*!reduced/.test(code));
check('DropRect cuts under reduced motion', /if \(!animate \|\| reduced\)/.test(code));
check('card uses the kit ClipControls', /<ClipControls timeline=\{timeline\}/.test(code));
check('card mounts one AtlasCue', (code.match(/<AtlasCue\b/g) ?? []).length === 1);
check('kit Back is a labelled button', /accessibilityRole="button"\s+accessibilityLabel="Previous step"/.test(kit));
check('kit Next is a labelled button', /accessibilityRole="button"\s+accessibilityLabel=\{`Next step, /.test(kit));
for (const lit of code.matchAll(/['"`]([^'"`\n]*[–—][^'"`\n]*)['"`]/g)) check('no em or en dash in card copy', false, lit[1]);

if (failures.length) {
  console.error(`clickthrough-stage-pin FAILED (${failures.length}):`);
  for (const f of failures.slice(0, 40)) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`clickthrough-stage-pin ok: 3 fixtures, ${refusals.length} refusals, ${built} corpus stages verbatim and in order (${builtKeys.join(', ')}), placements: ${wrappedStatus.join('; ')}`);
