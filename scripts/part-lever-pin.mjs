/**
 * PART LEVER PIN: the Leverage Lens card does only the lesson's own arithmetic, refuses to build
 * without the authored figures, and is what alternative-investments:2:4 actually renders.
 *
 *   node --import ./scripts/ts-resolve-hooks.mjs scripts/part-lever-pin.mjs
 *
 * WHY THIS EXISTS. alternative-investments:2:4 ("How Leverage Amplifies Real Estate Returns")
 * shipped a guess card reading "A ? appreciation on a $500K property with 80% leverage = 2 ? return
 * on equity", because "5%" was also blanked inside "25%" (measured 2026-09-22, scouts.json). The
 * step's own sliders (Down Payment 10-50 default 20, Annual Appreciation -10 to 15 default 5) are
 * the two inputs of the idea, so parts/lever.ts turns them into a card the learner drives.
 *
 * WHAT IT ASSERTS:
 *   1. roe(20, 5) = 25, the authored "25% return on equity"; roe(20, -10) = -50; roe(50, 5) = 10.
 *   2. buildLever on the authored step opens at 20% down and a 5% move, and its chips are exactly
 *      the slider ends and defaults (10/20/50 and -10/5/15). No chip value is invented.
 *   3. buildLever returns null when "25%" is gone from the insight, when the sliders are gone, when
 *      either slider is gone, and when a default no longer reproduces the authored figure. A card
 *      that kept rendering after a re-sync rewrote the step would be showing numbers the lesson no
 *      longer contains (CONSTITUTION 3.1).
 *   4. Every fixed line fits CARD_BUDGET and carries no em or en dash (CONSTITUTION 4).
 *   5. In the WRAPPED loader (src/lib/curriculum/index.ts, what renders), 2:4's deck has an
 *      interactive of kind 'lever' and no guess card. This fails until the placement is integrated,
 *      which is the point: it goes red on HEAD because 2:4 is still a guess card.
 */
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = new URL('..', import.meta.url).pathname;
const imported = (path) => import(pathToFileURL(join(ROOT, path)).href);

const L = await imported('src/lib/mobile-lesson/parts/lever.ts');
const T = await imported('src/lib/mobile-lesson/types.ts');
const R = await imported('src/lib/curriculum/courseIndex.ts');
const W = await imported('src/lib/curriculum/index.ts');

const COURSE = 'alternative-investments';
const LESSON = 2;
const STEP = 3; // was 4 until 2026-09-30: the stakesCard at position 1 was retired at the loader
const WHERE = `${COURSE}:${LESSON}:${STEP}`;

const failures = [];
const check = (name, ok, detail = '') => {
  if (!ok) failures.push(`${name}${detail ? `: ${detail}` : ''}`);
};

// 1. The arithmetic, against the authored figure and the two acceptance cases.
check('roe(20,5) = 25 (authored)', L.roe(20, 5) === 25, String(L.roe(20, 5)));
check('roe(20,-10) = -50', L.roe(20, -10) === -50, String(L.roe(20, -10)));
check('roe(50,5) = 10', L.roe(50, 5) === 10, String(L.roe(50, 5)));
check('multiplier(20) = 5', L.multiplier(20) === 5, String(L.multiplier(20)));

// 2. The authored step, read from the raw corpus the placement hands the builder.
const rawLesson = (await R.loadCourseLessons(COURSE)).find((l) => l.num === LESSON);
const step = rawLesson?.steps?.[STEP];
check('authored step is the leverage graph', step?.type === 'interactiveGraph' && /leverage/i.test(step?.title ?? ''), step?.title);

const spec = step ? L.buildLever(step, rawLesson.steps) : null;
check('buildLever builds on the authored step', !!spec);
if (spec) {
  check('kind is lever', spec.kind === 'lever');
  check('opens at the authored 20% down', spec.down === 20, String(spec.down));
  check('opens at the authored 5% move', spec.move === 5, String(spec.move));
  check('opening value is the authored 25%', L.roe(spec.down, spec.move) === 25);
  check('down chips are the slider ends and default', JSON.stringify(spec.downChips) === '[10,20,50]', JSON.stringify(spec.downChips));
  check('move chips are the slider ends and default', JSON.stringify(spec.moveChips) === '[-10,5,15]', JSON.stringify(spec.moveChips));
  check('note says before rent and costs', /before rent and costs/.test(spec.note), spec.note);

  // 4. Budgets and dashes on every fixed line.
  const B = T.CARD_BUDGET;
  check('prompt within budget', spec.prompt.length <= B.prompt, `${spec.prompt.length}/${B.prompt}`);
  check('note within budget', spec.note.length <= B.detail, `${spec.note.length}/${B.detail}`);
  check('verdict within budget', spec.verdict.length <= B.verdict, `${spec.verdict.length}/${B.verdict}`);
  for (const line of L.textOf(spec)) check('no em or en dash', !/[–—]/.test(line), line);
  check('textOf covers prompt, note, verdict', L.textOf(spec).length === 3);
}

// 3. Refusal: every missing or disagreeing figure must give null, never a card with a default.
if (step) {
  const clone = (patch) => ({ ...structuredClone(step), ...patch });
  const insights = step.insights ?? [];
  const sliders = step.sliders ?? [];
  const cases = [
    ['no "25%" in any insight', clone({ insights: insights.map((t) => t.replace(/25%/g, '')) })],
    ['no insights at all', clone({ insights: [] })],
    ['no sliders at all', clone({ sliders: undefined })],
    ['no Down Payment slider', clone({ sliders: sliders.filter((s) => !/down payment/i.test(s.label)) })],
    ['no Appreciation slider', clone({ sliders: sliders.filter((s) => !/appreciation/i.test(s.label)) })],
    ['appreciation default moved to 6 (would show 30%, never authored)', clone({ sliders: sliders.map((s) => (/appreciation/i.test(s.label) ? { ...s, default: 6 } : s)) })],
    ['down payment default moved to 25 (would show 20%, never authored)', clone({ sliders: sliders.map((s) => (/down payment/i.test(s.label) ? { ...s, default: 25 } : s)) })],
    ['not an interactiveGraph', clone({ type: 'teachingSlide' })],
  ];
  for (const [name, input] of cases) check(`null when ${name}`, L.buildLever(input, [input]) === null);
}

// 5. What renders. The wrapped loader, not the raw corpus.
const wrapped = (await W.loadCourseLessons(COURSE)).find((l) => l.num === LESSON);
const deck = wrapped?.steps?.[STEP];
check('wrapped step is a graph deck', deck?.type === 'mobileDeck' && deck?.sourceType === 'interactiveGraph', deck?.type);
const kinds = (deck?.cards ?? []).filter((c) => c.kind === 'interactive').map((c) => c.spec.kind);
check(`${WHERE} renders a lever card`, kinds.includes('lever'), `interactive kinds: [${kinds.join(', ')}]`);
check(`${WHERE} has no guess card`, !kinds.includes('guess'), `interactive kinds: [${kinds.join(', ')}]`);

if (failures.length) {
  console.error(`part-lever-pin FAILED (${failures.length}):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`part-lever-pin ok: roe 25/-50/10, chips from authored sliders, 8 refusals, ${WHERE} renders [${kinds.join(', ')}]`);
