#!/usr/bin/env node
// ============================================================================
// PART DIAL PIN: the Dial card's math matches the lesson, and it refuses without the lesson.
//
//   node --import ./scripts/ts-resolve-hooks.mjs scripts/part-dial-pin.mjs
//   node --import ./scripts/ts-resolve-hooks.mjs scripts/part-dial-pin.mjs --builder-only
//
// WHY THIS EXISTS. The dial (src/lib/mobile-lesson/parts/dial.ts) puts live numbers on screen.
// A live number the lesson did not author is the fabricated-number failure in CONSTITUTION 3.1,
// and the shape it would take here is quiet: a re-sync rewrites "45 DIO, 30 DSO, and 60 DPO" and
// the card keeps showing 45/30/60 against a lesson that now says something else. So this asserts,
// over the REAL corpus:
//
//   1. evaluate() reproduces every authored answer: CCC 45/30/60 = 15 days (corporateFinance.ts:2027),
//      the microCheck's 60/45/30 = 75 days (6:3), and $400,000 x 5% / 12 = $1,667
//      (personalFinance.ts:3435), rounded and formatted to the exact authored string.
//   2. buildDial returns a spec for both placements, starting on the authored figures.
//   3. buildDial returns NULL when any authored figure it depends on is removed or contradicted.
//      That null is the staleness check, so it is tested, not assumed.
//   4. The card text fits CARD_BUDGET (prompt, verdict; labels and goal against detail).
//   5. applyPlacement composes with the builder: placed over the chart slot, the deck carries a dial.
//   6. THE WRAPPED LOADER (src/lib/curriculum/index.ts, what the app renders) shows a dial on
//      corporate-finance:6:2 and on personal-finance lesson 14. This one fails until integration
//      fills PLACEMENTS and wires applyPlacement into the loader; that is intended, and
//      `--builder-only` skips only this block so 1-5 can run before then.
// ============================================================================
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = new URL('..', import.meta.url).pathname;
const imported = (path) => import(pathToFileURL(join(ROOT, path)).href);

const raw = await imported('src/lib/curriculum/courseIndex.ts');
const { buildDial, evaluate, dollars, chipValues, textOf } = await imported('src/lib/mobile-lesson/parts/dial.ts');
const { CARD_BUDGET } = await imported('src/lib/mobile-lesson/types.ts');
const { deriveDeck } = await imported('src/lib/mobile-lesson/derive.ts');
const { stepId } = await imported('src/lib/mobile-lesson/stepId.ts');
const { applyPlacement } = await imported('src/lib/mobile-lesson/parts/placements.ts');

const BUILDER_ONLY = process.argv.includes('--builder-only');
const failures = [];
const check = (ok, msg) => { if (!ok) failures.push(msg); };

/** Every string in an authored object, with `needle` removed. Deep copy; the corpus is untouched. */
const scrub = (value, needle, to = '') => {
  if (typeof value === 'string') return value.split(needle).join(to);
  if (Array.isArray(value)) return value.map((v) => scrub(v, needle, to));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, scrub(v, needle, to)]));
  }
  return value;
};
const allText = (v) => JSON.stringify(v);

async function authoredLesson(courseId, num) {
  const lessons = await raw.loadCourseLessons(courseId);
  const lesson = lessons.find((l) => l.num === num);
  assert.ok(lesson, `${courseId} lesson ${num} is missing from the corpus; this pin has drifted`);
  return lesson.steps;
}

// ---- 1. the math, against the authored answers --------------------------------------------------
check(evaluate({ formula: 'ccc' }, [45, 30, 60]) === 15, 'CCC 45+30-60 must be 15 days (corporateFinance.ts:2027)');
check(evaluate({ formula: 'ccc' }, [60, 45, 30]) === 75, 'CCC 60+45-30 must be 75 days (the 6:3 microCheck)');
check(dollars(Math.round(evaluate({ formula: 'rentRule' }, [400000]))) === '$1,667',
  '$400,000 x 5% / 12 must format to the authored "$1,667" (personalFinance.ts:3435)');
check(dollars(Math.round(evaluate({ formula: 'rentRule' }, [350000]))) === '$1,458',
  '$350,000 x 5% / 12 must format to the microCheck\'s "$1,458" (14:3)');

// ---- 2. the builders, on the real corpus ---------------------------------------------------------
const cf6 = await authoredLesson('corporate-finance', 6);
const ccc = buildDial(cf6[2], cf6);
check(ccc?.formula === 'ccc', `corporate-finance:6:2 must build a ccc dial, got ${ccc?.formula ?? 'null'}`);
if (ccc) {
  check(ccc.inputs.map((i) => i.value).join('/') === '45/30/60', `ccc must start on 45/30/60, got ${ccc.inputs.map((i) => i.value).join('/')}`);
  check(evaluate(ccc, ccc.inputs.map((i) => i.value)) === 15, 'ccc at its starting values must equal the authored 15');
  check(ccc.goal === 'Get it to 0 or below', 'ccc goal text changed');
  // Reachability: the goal must be reachable with the steppers, or onWorked unlocks a dead card.
  const [a, b, c] = ccc.inputs;
  check(a.min + b.min - c.max <= 0, 'ccc steppers cannot reach the goal of 0 or below');
}

const pf14 = await authoredLesson('personal-finance', 14);
const rentAt = pf14.findIndex((s) => allText(s).includes('$1,667') && /\$400,000|\$400K/.test(allText(s)));
check(rentAt >= 0, 'personal-finance:14 has no step holding both $400,000/$400K and $1,667');
const rent = rentAt >= 0 ? buildDial(pf14[rentAt], pf14) : null;
check(rent?.formula === 'rentRule', `personal-finance:14:${rentAt} must build a rentRule dial, got ${rent?.formula ?? 'null'}`);
if (rent) {
  const chips = chipValues(rent.inputs[0]);
  check(chips.join(',') === '200000,400000,600000,800000', `rent chips must be the authored slider range, got ${chips.join(',')}`);
  check(rent.inputs[0].value === 400000, 'rent dial must start on the authored $400,000');
  check(dollars(Math.round(evaluate(rent, [rent.inputs[0].value]))) === '$1,667', 'rent dial start must read $1,667');
  check(rent.compare?.value === 2000, `rent comparison must be the authored $2,000 slider default, got ${rent.compare?.value}`);
}

// ---- 3. null without the authored figures ---------------------------------------------------------
const cccWithout = (needle, to) => buildDial(scrub(cf6[2], needle, to), cf6.map((s, i) => (i === 2 ? scrub(s, needle, to) : s)));
check(cccWithout('45 DIO, 30 DSO, and 60 DPO') === null, 'ccc must be null without "45 DIO, 30 DSO, and 60 DPO"');
check(cccWithout('15 days') === null, 'ccc must be null without "15 days"');
check(cccWithout('= 15 days', '= 16 days') === null, 'ccc must be null when the authored answer disagrees with the math');

if (rentAt >= 0) {
  const scrubbedLesson = (needle) => pf14.map((s) => scrub(s, needle));
  check(buildDial(scrub(pf14[rentAt], '$1,667'), scrubbedLesson('$1,667')) === null, 'rent must be null without "$1,667"');
  const noPrice = scrub(scrub(pf14[rentAt], '$400,000'), '$400K');
  check(buildDial(noPrice, pf14) === null, 'rent must be null when the placed step names no $400,000/$400K');
  const noSlider = pf14.map((s) => (Array.isArray(s.sliders) ? { ...s, sliders: s.sliders.filter((x) => x.label !== 'Home Price') } : s));
  check(buildDial(pf14[rentAt], noSlider) === null, 'rent must be null without the authored Home Price slider');
}
// A step that authors neither must not get a dial at all.
check(buildDial(cf6[0], cf6) === null, 'corporate-finance:6:0 (the hook) must not build a dial');

// ---- 4. budget ------------------------------------------------------------------------------------
for (const [name, spec] of [['ccc', ccc], ['rent', rent]]) {
  if (!spec) continue;
  check(spec.prompt.length <= CARD_BUDGET.prompt, `${name} prompt ${spec.prompt.length} > ${CARD_BUDGET.prompt}`);
  check(spec.verdict.length <= CARD_BUDGET.verdict, `${name} verdict ${spec.verdict.length} > ${CARD_BUDGET.verdict}`);
  for (const t of [...spec.inputs.map((i) => i.label), spec.goal ?? '']) {
    check(t.length <= CARD_BUDGET.detail, `${name} "${t}" ${t.length} > ${CARD_BUDGET.detail}`);
  }
  for (const t of textOf(spec)) check(!/[–—]/.test(t), `${name} text has an en/em dash: ${t}`);
}

// ---- 5. composes with the placement hook ----------------------------------------------------------
const table = { 'corporate-finance:6:2': { kind: 'dial', slot: 'chart', build: (s, all) => { const spec = buildDial(s, all); return spec ? { spec, text: textOf(spec) } : null; } } };
const derived = deriveDeck(cf6[2], stepId('corporate-finance', 6, 2, cf6[2]));
const placed = derived ? applyPlacement(derived, derived.sourceId, cf6, table) : null;
check(placed?.cards.some((c) => c.kind === 'interactive' && c.spec?.kind === 'dial'), 'applyPlacement did not put the dial into corporate-finance:6:2');

// ---- 6. the wrapped loader ------------------------------------------------------------------------
if (!BUILDER_ONLY) {
  const { getMobileLesson } = await imported('src/lib/curriculum/index.ts');
  const dialsIn = (lesson) => (lesson?.steps ?? []).flatMap((s, i) => (s.type === 'mobileDeck'
    ? s.cards.filter((c) => c.kind === 'interactive' && c.spec?.kind === 'dial').map((c) => ({ i, formula: c.spec.formula }))
    : []));
  const cfDials = dialsIn(await getMobileLesson('corporate-finance', 6));
  check(cfDials.some((d) => d.i === 2 && d.formula === 'ccc'),
    `WRAPPED corporate-finance:6:2 renders no ccc dial (found ${JSON.stringify(cfDials)}); integration has not placed it`);
  const pfDials = dialsIn(await getMobileLesson('personal-finance', 14));
  check(pfDials.some((d) => d.formula === 'rentRule'),
    `WRAPPED personal-finance:14 renders no rentRule dial (found ${JSON.stringify(pfDials)}); integration has not placed it`);
}

if (failures.length) {
  console.error(`part-dial-pin: ${failures.length} failure(s)`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`part-dial-pin: OK. ccc 45/30/60 = 15, 60/45/30 = 75; rent $400,000 -> $1,667 at personal-finance:14:${rentAt}; null on every missing figure${BUILDER_ONLY ? ' (wrapped-loader check skipped)' : '; both dials render in the wrapped loader'}.`);
