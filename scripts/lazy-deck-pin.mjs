#!/usr/bin/env node
/**
 * LAZY DECK PIN — loading a course must not derive the decks of lessons nobody opened.
 *
 *   node --import ./scripts/ts-resolve-hooks.mjs scripts/lazy-deck-pin.mjs
 *
 * WHY. curriculum/index.ts used to run deriveDeck over every heavy step of all 25 lessons the first
 * time anything loaded a course. Home and Learn call loadCourseLessons only for num, title and xp,
 * so they paid for 721 decks corpus-wide that they never showed. Measured in node, interpreter only
 * (--no-opt --no-sparkplug --no-maglev, standing in for Hermes): Home's course load took about 65ms
 * for investing-fundamentals and for personal-finance, most of it decks for lessons the learner was
 * not opening. Nothing looked broken; it was just a slower Home on every cold start.
 *
 * WHAT IT CHECKS, over the same loader the app renders (index.ts, not courseIndex.ts):
 *   1. After loading all 12 courses and reading num/title/xp on every lesson, ZERO decks derived.
 *   2. Reading one lesson's steps derives exactly that lesson's heavy steps, once (memoized).
 *   3. Every lesson's steps are byte-identical (JSON) to the eager path: deriveDeck called directly
 *      on the raw lesson, the way mobile-deck-audit.mjs does it, then applyPlacement over the raw
 *      steps, and withShorterQuestions on the rest. Laziness must change WHEN the work happens, never WHAT the learner sees.
 *
 * THE COUNT DOES NOT TRUST THE MODULE UNDER TEST. A counter exported by index.ts would pass if
 * index.ts simply stopped counting. So a load hook wraps deriveDeck in derive.ts itself and counts
 * every real call, whoever makes it. That probe works on the pre-change code too, which is how this
 * pin was watched failing there (721 derivations after metadata reads) rather than only failing on
 * a missing export. index.ts's own deckDerivationCount() must then agree with the probe.
 */
import { register } from 'node:module';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

globalThis.__DEV__ = false;

// ─── The probe: count every deriveDeck call at its source ───────────────────
const PROBE_HOOK = `
export async function load(url, context, nextLoad) {
  const out = await nextLoad(url, context);
  if (!url.endsWith('/src/lib/mobile-lesson/derive.ts')) return out;
  const src = String(out.source);
  const DEF = 'export function deriveDeck(';
  if (!src.includes(DEF)) throw new Error('lazy-deck-pin probe: deriveDeck definition not found in derive.ts');
  const wrapped = src.replace(DEF, 'function __probedDeriveDeck(') +
    '\\nexport function deriveDeck(...args) { globalThis.__deriveDeckProbe = (globalThis.__deriveDeckProbe ?? 0) + 1; return __probedDeriveDeck(...args); }\\n';
  return { ...out, source: wrapped };
}`;
register(`data:text/javascript,${encodeURIComponent(PROBE_HOOK)}`);
const probe = () => globalThis.__deriveDeckProbe ?? 0;

const ROOT = new URL('..', import.meta.url).pathname;
const imported = (path) => import(pathToFileURL(join(ROOT, path)).href);

const raw = await imported('src/lib/curriculum/courseIndex.ts');
const native = await imported('src/lib/curriculum/index.ts');
const { deriveDeck, isHeavyStep } = await imported('src/lib/mobile-lesson/derive.ts');
const { stepId } = await imported('src/lib/mobile-lesson/stepId.ts');
const { applyPlacement } = await imported('src/lib/mobile-lesson/parts/placements.ts');
/*
 * NATIVE LESSONS (src/lib/native-lessons, owner 2026-10-12): while a rewrite's fingerprint is
 * active, the wrapped getter hands back its hand-written steps instead of deriving, so for those
 * keys the eager equivalent is the native data itself, and reading them must derive no deck. A stale
 * rewrite falls back to the derived path and is compared like every other lesson.
 */
const { nativeLessonKeys, nativeLessonStatus, loadNativeLesson } = await imported('src/lib/native-lessons/index.ts');
const NATIVE_KEYS = new Set(nativeLessonKeys());

const failures = [];
const check = (ok, message) => { if (!ok) failures.push(message); };
const ownCount = () => (typeof native.deckDerivationCount === 'function' ? native.deckDerivationCount() : NaN);

// ─── 1. Metadata reads derive nothing ───────────────────────────────────────
const byCourse = new Map();
let lessonCount = 0;
for (const course of raw.COURSES) {
  const lessons = await native.loadCourseLessons(course.id);
  byCourse.set(course.id, lessons);
  for (const lesson of lessons) {
    lessonCount += 1;
    void lesson.num; void lesson.title; void lesson.xp;
  }
}
check(lessonCount === 300, `expected 300 lessons from the wrapped loader, got ${lessonCount}`);
check(probe() === 0, `loading every course and reading num/title/xp derived ${probe()} decks; it must derive 0`);
check(typeof native.deckDerivationCount === 'function', 'index.ts must export deckDerivationCount()');
check(ownCount() === probe(), `deckDerivationCount() says ${ownCount()} but deriveDeck actually ran ${probe()} times`);

// ─── 2. One lesson's steps derive exactly that lesson, once ─────────────────
const rawPF = await raw.loadCourseLessons('personal-finance');
const target = rawPF.find((l) => l.steps.filter(isHeavyStep).length > 0);
const heavyInTarget = target.steps.filter(isHeavyStep).length;
const nativeTarget = byCourse.get('personal-finance').find((l) => l.num === target.num);
const before = probe();
void nativeTarget.steps;
check(probe() - before === heavyInTarget,
  `reading personal-finance:${target.num} steps derived ${probe() - before} decks; that lesson has ${heavyInTarget} heavy steps`);
const afterFirst = probe();
void nativeTarget.steps;
check(probe() === afterFirst, `reading the same lesson's steps again derived ${probe() - afterFirst} more decks; it must be memoized`);
check(ownCount() === probe(), `after one lesson, deckDerivationCount() says ${ownCount()} but the probe says ${probe()}`);

if (typeof native.getMobileLesson === 'function') {
  const viaGetter = await native.getMobileLesson('personal-finance', target.num);
  check(viaGetter === nativeTarget, 'getMobileLesson must return the same lesson object the course list holds');
  check(probe() === afterFirst, 'getMobileLesson re-derived a lesson that was already derived');
  check((await native.getMobileLesson('personal-finance', 999)) === null, 'getMobileLesson must resolve null for a missing lesson');
} else {
  failures.push('index.ts must export getMobileLesson(courseId, num)');
}

// ─── 3. Byte-identical to the eager path, all 300 lessons ───────────────────
const shorten = native.withShorterQuestions;
check(typeof shorten === 'function', 'index.ts must export withShorterQuestions for the eager comparison');
let compared = 0;
if (typeof shorten === 'function') {
  for (const course of raw.COURSES) {
    const rawLessons = await raw.loadCourseLessons(course.id);
    const nativeLessons = byCourse.get(course.id);
    for (const rawLesson of rawLessons) {
      const key = `${course.id}:${rawLesson.num}`;
      if (NATIVE_KEYS.has(key) && (await nativeLessonStatus(key, rawLessons)).state === 'active') {
        const lazy = nativeLessons.find((l) => l.num === rawLesson.num);
        compared += 1;
        const beforeNative = probe();
        const steps = lazy?.steps;
        check(probe() === beforeNative, `${key} is a native lesson but reading its steps derived ${probe() - beforeNative} decks`);
        if (JSON.stringify(steps) !== JSON.stringify((await loadNativeLesson(key))?.steps)) failures.push(`${key} lazy steps differ from its native lesson`);
        continue;
      }
      // The eager path includes applyPlacement over the RAW steps, as index.ts does, or the 9
      // lessons carrying a dial, lever or scene would differ for a reason that is not laziness.
      // Capped like the loader caps it (withCappedPractice, 2026-10-01): practice runs five screens on the phone.
      const eager = native.withCappedPractice(rawLesson.steps.map((step, index) => {
        if (!isHeavyStep(step)) return shorten(step);
        const id = stepId(course.id, rawLesson.num, index, step);
        const deck = deriveDeck(step, id);
        return deck ? applyPlacement(deck, id, rawLesson.steps) : step;
      }));
      const lazy = nativeLessons.find((l) => l.num === rawLesson.num);
      compared += 1;
      if (!lazy) { failures.push(`${course.id}:${rawLesson.num} missing from the wrapped loader`); continue; }
      if (JSON.stringify(lazy.steps) !== JSON.stringify(eager)) failures.push(`${course.id}:${rawLesson.num} lazy steps differ from the eager derivation`);
    }
  }
  check(compared === 300, `compared ${compared} lessons, expected 300`);
}

// Enumerable, so spreads and JSON.stringify of a lesson still carry its steps.
const sample = byCourse.get('investing-fundamentals')[3];
check(Object.keys(sample).includes('steps'), 'steps must stay an enumerable own property of each lesson');
check(Array.isArray(JSON.parse(JSON.stringify(sample)).steps), 'JSON.stringify(lesson) must still include steps');

if (failures.length) {
  console.error(`FAIL lazy-deck-pin (${failures.length}):`);
  for (const f of failures.slice(0, 20)) console.error(`  ${f}`);
  process.exit(1);
}
console.log(`OK lazy-deck-pin: 300 lessons loaded with 0 decks derived; one lesson derived its ${heavyInTarget} heavy steps once; ${compared}/300 lessons byte-identical to the eager path.`);
