/**
 * PART SCENE PIN: every scene script captions only authored text, casts only sprites that exist,
 * draws no count it cannot derive, and refuses to build once the lesson stops saying what it says.
 *
 *   node --no-warnings --import ./scripts/ts-resolve-hooks.mjs scripts/part-scene-pin.mjs
 *
 * WHY THIS EXISTS. parts/scene.ts turns a wall-of-text teaching slide into a captioned pixel scene
 * (research 2026-09-22: the Euphoria web recording's Diversification "principle" slide is about
 * 1,000 characters; Brilliant plays a picture once and steps it in beats instead). The captions are
 * the lesson's own sentences and the only thing stopping a scene from putting words or numbers on
 * screen the lesson never wrote is this pin (CONSTITUTION 3.1).
 *
 * WHY IT READS THE RAW CORPUS. The placement is not wired into derive.ts yet (integration owns
 * placements.ts), so the WRAPPED loader cannot render a scene today. The builder is handed raw
 * lesson steps by applyPlacement, so that is what this pin hands it. The wrapped loader is still
 * used for one thing: the say-it-once check against the sibling cards that WILL sit next to the
 * scene in the rendered deck.
 *
 * WHAT IT ASSERTS, for every SCENES entry:
 *   1. buildScene on the raw step builds, both by key and by guard match alone.
 *   2. Every caption appears word for word in the step's authored text, is at most 125 characters,
 *      carries no em or en dash, and repeats no sibling card in the wrapped deck.
 *   3. Every actor resolves to a sprite: `px:` in SPRITES_BY_ID with the catalogue `lesson` slot,
 *      `kit:` a MOBILE_KIT archetype with a real accent.
 *   4. 3 to 6 beats, each 1500-3000ms, at most one cue per actor per beat, dwell >= reading time.
 *   5. Every `stack`/`count` has an `n` that is plain math on `derivedFrom` text in its caption:
 *      "double(s)" gives 2, two money figures give floor(a / b).
 *   6. Refusal: with a guard removed, a caption reworded, or the wrong key, buildScene is null.
 *   7. stageAt: after the final beat, every actor whose last cue was `exit` is hidden, and at least
 *      one actor is on stage at every beat (a blank stage is a broken beat).
 *   8. At least 4 placements.
 */
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = new URL('..', import.meta.url).pathname;
const imported = (path) => import(pathToFileURL(join(ROOT, path)).href);

const S = await imported('src/lib/mobile-lesson/parts/scene.ts');
const R = await imported('src/lib/curriculum/courseIndex.ts');
const W = await imported('src/lib/curriculum/index.ts');

const failures = [];
const check = (name, ok, detail = '') => {
  if (!ok) failures.push(`${name}${detail ? `: ${detail}` : ''}`);
};

const money = (t) => Number(t.replace(/[$,]/g, ''));
/** The only derivations a count may use. Anything else is a number the lesson did not author. */
function derive(cue) {
  const from = cue.derivedFrom ?? [];
  if (from.length === 1 && /^doubles?$/.test(from[0])) return 2;
  if (from.length === 2 && from.every((t) => /^\$[\d,]+(\.\d+)?$/.test(t))) return Math.floor(money(from[0]) / money(from[1]));
  return NaN;
}

const entries = Object.entries(S.SCENES);
check('at least 4 placements', entries.length >= 4, String(entries.length));

const rawCache = new Map();
const wrappedCache = new Map();
const lessonsOf = async (cache, loader, course) => {
  if (!cache.has(course)) cache.set(course, await loader.loadCourseLessons(course));
  return cache.get(course);
};

let beatsTotal = 0;
for (const [key, script] of entries) {
  const [course, n, i] = key.split(':');
  const raw = (await lessonsOf(rawCache, R, course)).find((l) => l.num === Number(n));
  const step = raw?.steps?.[Number(i)];
  check(`${key} raw step exists`, !!step);
  if (!step) continue;

  // 1. Builds.
  const spec = S.buildScene(step, raw.steps, key);
  check(`${key} builds by key`, !!spec);
  check(`${key} builds by guard match alone`, !!S.buildScene(step, raw.steps));
  if (spec) {
    check(`${key} kind is scene`, spec.kind === 'scene');
    check(`${key} textOf = prompt + captions`, S.textOf(spec).length === script.beats.length + 1);
    const built = S.sceneBuilder(key)(step, raw.steps);
    check(`${key} sceneBuilder returns spec and text`, !!built && built.text.length === script.beats.length + 1);
  }

  // 2. Captions.
  const text = S.stepText(step);
  for (const g of script.guards) check(`${key} guard is authored`, text.includes(g), g);
  const wrapped = (await lessonsOf(wrappedCache, W, course)).find((l) => l.num === Number(n))?.steps?.[Number(i)];
  const siblings = (wrapped?.cards ?? [])
    .filter((c) => c.kind !== script.slot && !(c.kind === 'interactive' && c.spec?.kind === 'scene'))
    .map((c) => JSON.stringify(c))
    .join(' ');
  check(`${key} wrapped step is a deck`, wrapped?.type === 'mobileDeck', wrapped?.type);
  // Once placed, the scene IS the slot: an idea-slot scene replaces the idea card, so the check is
  // that the wrapped deck renders the scene, not that the card it replaced is still there.
  // (new-parts-placement-pin.mjs checks it sits in that card's position with its neighbours intact.)
  check(`${key} wrapped deck renders the scene in its ${script.slot} slot`,
    (wrapped?.cards ?? []).some((c) => c.kind === 'interactive' && c.spec?.kind === 'scene'));

  // 4. Beat shape.
  check(`${key} has 3-6 beats`, script.beats.length >= S.MIN_BEATS && script.beats.length <= S.MAX_BEATS, String(script.beats.length));
  script.beats.forEach((beat, j) => {
    beatsTotal++;
    const at = `${key} beat ${j + 1}`;
    check(`${at} caption is authored text`, text.includes(beat.caption), beat.caption);
    check(`${at} caption <= ${S.CAPTION_MAX_CHARS} chars`, beat.caption.length <= S.CAPTION_MAX_CHARS, String(beat.caption.length));
    check(`${at} caption has no em or en dash`, !/[–—]/.test(beat.caption), beat.caption);
    check(`${at} caption repeats no sibling card`, !siblings.includes(beat.caption), beat.caption);
    check(`${at} duration 1500-3000ms`, beat.durationMs >= S.BEAT_MIN_MS && beat.durationMs <= S.BEAT_MAX_MS, String(beat.durationMs));
    check(`${at} dwell covers reading time`, S.dwellMs(beat) >= beat.caption.length * S.READ_MS_PER_CHAR);
    check(`${at} has a cast`, beat.cast.length > 0);
    const actors = beat.cast.map((c) => c.actor);
    check(`${at} one cue per actor`, new Set(actors).size === actors.length, actors.join(', '));

    for (const cue of beat.cast) {
      // 3. Sprites.
      check(`${at} ${cue.actor} resolves to a sprite`, !!S.resolveActorSprite(cue.actor));
      // 5. Counts.
      if (cue.do === 'stack' || cue.do === 'count') {
        const expected = derive(cue);
        check(`${at} ${cue.actor} n is derived`, Number.isInteger(cue.n) && cue.n === expected, `n=${cue.n} derived=${expected}`);
        for (const d of cue.derivedFrom ?? []) check(`${at} derivedFrom is in the caption`, beat.caption.includes(d), d);
      } else {
        check(`${at} ${cue.actor} draws no count`, cue.n === undefined && cue.derivedFrom === undefined);
      }
    }

    // 7. A beat never leaves the stage empty.
    const stage = S.stageAt(script.beats, j);
    check(`${at} has an actor on stage`, Object.values(stage).some((s) => s.visible));
  });

  // 7. Exits stick.
  const final = S.stageAt(script.beats, script.beats.length - 1);
  for (const actor of S.castOf(script.beats)) {
    let lastCue;
    for (const b of script.beats) for (const c of b.cast) if (c.actor === actor) lastCue = c;
    if (lastCue?.do === 'exit') check(`${key} ${actor} hidden after its exit`, final[actor].visible === false);
  }

  // 6. Refusals.
  const clone = (patch) => ({ ...structuredClone(step), ...patch });
  const scrub = (needle) => {
    const swap = (t) => (typeof t === 'string' ? t.split(needle).join('') : t);
    const s = structuredClone(step);
    for (const f of ['title', 'description']) s[f] = swap(s[f]);
    for (const f of ['paragraphs', 'insights']) if (Array.isArray(s[f])) s[f] = s[f].map(swap);
    if (s.atlas) s.atlas = { ...s.atlas, hint: swap(s.atlas.hint), recap: swap(s.atlas.recap) };
    if (s.realExample) s.realExample = { ...s.realExample, explanation: swap(s.realExample.explanation) };
    return s;
  };
  const firstCaption = script.beats[0].caption;
  const reworded = scrub(firstCaption.slice(0, Math.ceil(firstCaption.length / 2)));
  check(`${key} null when a guard is gone`, S.buildScene(scrub(script.guards[0]), raw.steps, key) === null);
  check(`${key} null when beat 1 caption is reworded`, S.buildScene(reworded, raw.steps, key) === null);
  check(`${key} null for an unknown key`, S.buildScene(step, raw.steps, `${key}:x`) === null);
  check(`${key} null for an empty step`, S.buildScene(clone({ title: '', description: '', paragraphs: [], insights: [], atlas: undefined, realExample: undefined }), raw.steps, key) === null);
}

// Resolver refusals: a typo must fail, never fall back to orchid or a same-named sprite.
check('unknown px sprite is null', S.resolveActorSprite('px:no-such-sprite') === null);
check('unknown kit archetype is null', S.resolveActorSprite('kit:no-such') === null);
check('unknown kit accent is null', S.resolveActorSprite('kit:compound:plaid') === null);
check('bare id without namespace is null', S.resolveActorSprite('shield') === null);

if (failures.length) {
  console.error(`part-scene-pin FAILED (${failures.length}):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`part-scene-pin ok: ${entries.length} scenes, ${beatsTotal} beats, every caption authored, every sprite resolves, counts derived, 4 refusals each`);
