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
 *      `kit:` a MOBILE_KIT archetype with a real accent, `add:` a scene prop in SCENE_PROPS.
 *   4. 3 to 6 beats, at most one cue per actor per beat, each beat's motion inside the clip budget
 *      (BEAT_MOTION_MAX_MS, which must equal the clip kit's BEAT_MAX_MS), and an Atlas mood that is
 *      one of his real expressions.
 *   5. Every `stack`/`count` has an `n` that is plain math on `derivedFrom` text in its caption:
 *      "double(s)" gives 2, two money figures give floor(a / b).
 *   6. Refusal: with a guard removed, a caption reworded, or the wrong key, buildScene is null.
 *   7. stageAt: after the final beat, every actor whose last cue was `exit` is hidden, and at least
 *      one actor is on stage at every beat (a blank stage is a broken beat).
 *   8. At least 12 placements (owner ruling 2026-09-22: about 10-15 hand-picked clips in total).
 *   9. The spec carries its course, so the stage's floor band is that course's accent.
 *  10. The renderer (scene-card.tsx) draws exactly one Atlas, guards motion with useReducedMotion,
 *      uses no hex literal (colour from theme and courseAccent only), never loops (no withRepeat),
 *      runs on the shared clip clock, swaps captions on the measured out/gap/in constants, and uses
 *      no spring outside Atlas's own entrance. It takes its geometry from sceneStage, scrolls when
 *      taller than the deck, and does not fade its first caption out and back in on arrival.
 *  11. Beat 1's caption starts a sentence (capital, digit, $ or quote).
 *  12. At stage widths 307, 325 and 362pt, no visible prop copy on any beat overlaps Atlas's box.
 *
 * 11 and 12 and the new 10 checks were added in the 2026-09-22 adversarial review and watched
 * FAILING against the builder's version (endowment beat 1 lowercase; Atlas 7pt into right-low props
 * at 307pt in financial-analytics:23:2 and global-economics:21:2; no ScrollView; no arrival guard),
 * then passing.
 *
 * Watched FAILING on 2026-09-22 before scene-card.tsx was rewritten (the renderer checks in 10
 * reported the old card's missing Atlas, missing clip clock and missing caption constants, exit 1),
 * then passing.
 */
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = new URL('..', import.meta.url).pathname;
const imported = (path) => import(pathToFileURL(join(ROOT, path)).href);

const S = await imported('src/lib/mobile-lesson/parts/scene.ts');
const R = await imported('src/lib/curriculum/courseIndex.ts');
const W = await imported('src/lib/curriculum/index.ts');
const T = await imported('src/lib/mobile-lesson/clickthrough/timing.ts');
const { readFileSync } = await import('node:fs');

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
check('at least 12 placements', entries.length >= 12, String(entries.length));
check('scene beat budget equals the clip kit beat budget', S.BEAT_MOTION_MAX_MS === T.BEAT_MAX_MS, `${S.BEAT_MOTION_MAX_MS} vs ${T.BEAT_MAX_MS}`);

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
    check(`${key} spec carries its course for the floor band`, spec.course === course, String(spec.course));
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
    const motion = S.sceneMotionMs(beat);
    check(`${at} motion inside the ${S.BEAT_MOTION_MAX_MS}ms clip budget`, motion > 0 && motion <= S.BEAT_MOTION_MAX_MS, String(motion));
    check(`${at} atlas mood is a real expression`, S.SCENE_ATLAS_MOODS.includes(beat.atlas), String(beat.atlas));
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

  // 11. A clip opens on a sentence, not on the lowercase back half of one: the endowment scene
  // first opened on "people want much more ..." and never named the effect it was about.
  check(`${key} beat 1 caption starts a sentence`, /^[A-Z$0-9"'(]/.test(script.beats[0].caption), script.beats[0].caption);

  // 12. Atlas never stands inside a prop, at the stage widths phones give this card (sceneStage
  // comment: 307 on an SE, 325 on a 393pt phone, 362 on a 430pt one). Final positions of every
  // visible actor on every beat, every copy of a stack or count.
  for (const w of [307, 325, 362]) {
    const st = S.sceneStage(w);
    const ax1 = w - S.SCENE_ATLAS_INSET.right;
    const ax0 = ax1 - st.atlasPt;
    const ay1 = st.h - S.SCENE_ATLAS_INSET.bottom;
    const ay0 = ay1 - st.atlasPt;
    script.beats.forEach((_, j) => {
      for (const a of Object.values(S.stageAt(script.beats, j))) {
        if (!a.visible) continue;
        const pt = S.markPoint(a.mark);
        const size = a.layout === 'count' ? S.COUNT_PT : S.SPRITE_PT;
        for (const o of S.copyOffsets(a)) {
          const x0 = pt.x * st.area.w + o.x;
          const y0 = pt.y * st.area.h + o.y;
          const hit = x0 < ax1 && x0 + size > ax0 && y0 < ay1 && y0 + size > ay0;
          check(`${key} beat ${j + 1} ${a.actor} clears Atlas at ${w}pt`, !hit,
            `prop ${x0.toFixed(1)},${y0.toFixed(1)}+${size} vs Atlas ${ax0},${ay0}+${st.atlasPt}`);
        }
      }
    });
  }

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
check('unknown scene prop is null', S.resolveActorSprite('add:no-such') === null);
check('scene prop with an accent is null', S.resolveActorSprite('add:mug:gold') === null);
check('scene prop lookup ignores inherited keys', S.resolveActorSprite('add:toString') === null);
// A hop is the one overshoot in a clip: never under a sad last beat, never mid-scene.
check('no celebrate mid-scene', S.sceneReaction({ atlas: 'proud', cast: [], caption: '' }, 0, 3) === 'nod');
check('no celebrate on a sad last beat', S.sceneReaction({ atlas: 'sad', cast: [], caption: '' }, 2, 3) === 'nod');
check('celebrate on a proud last beat', S.sceneReaction({ atlas: 'proud', cast: [], caption: '' }, 2, 3) === 'celebrate');

// 10. The renderer.
const card = readFileSync(join(ROOT, 'src/components/mobile-lesson/parts/scene-card.tsx'), 'utf8');
const code = card.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
check('card draws exactly one Atlas', (code.match(/<Atlas\b/g) ?? []).length === 1, String((code.match(/<Atlas\b/g) ?? []).length));
check('card guards motion with useReducedMotion', /useReducedMotion\(/.test(code));
check('card uses no hex literal', !/['"]#[0-9A-Fa-f]{3,8}['"]/.test(code));
check('card floor band is the course accent', /courseAccent\(/.test(code));
check('card never loops', !/withRepeat/.test(code));
check('card runs on the shared clip clock', /useClipTimeline\(/.test(code) && /ClipControls/.test(code));
for (const c of ['CAPTION_OUT_MS', 'CAPTION_GAP_MS', 'CAPTION_IN_MS', 'ACTOR_EXIT_MS', 'ACTOR_SLIDE_MS', 'ACTOR_ENTER_MS']) {
  check(`card uses the measured ${c}`, new RegExp(`\\b${c}\\b`).test(code));
}
check('card takes its geometry from sceneStage, where this pin measures it', /sceneStage\(/.test(code) && !/STAGE_ASPECT\) \/ 4/.test(code));
check('card sizes Atlas from the measured stage', /size=\{stage\.atlasPt\}/.test(code));
// At default text the card is ~400pt and an SE deck leaves ~385; unscrolled it slid under the
// deck footer and covered Next, the only way to reach the beat that unlocks Continue.
check('card scrolls when taller than the deck', /<ScrollView\b/.test(code));
// The clip clock mounts beat 0 with animate true; run as a swap, the first caption faded out and back.
check('caption treats its first run as an arrival, not a swap', /arrived\.current/.test(code));
const springs = code.match(/withSpring\(/g) ?? [];
check('card springs only Atlas (one withSpring, in AtlasOnFloor)', springs.length <= 1 && (springs.length === 0 || /function AtlasOnFloor[\s\S]*withSpring\(/.test(code)), String(springs.length));

if (failures.length) {
  console.error(`part-scene-pin FAILED (${failures.length}):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`part-scene-pin ok: ${entries.length} scenes, ${beatsTotal} beats, every caption authored, every sprite resolves, counts derived, 4 refusals each`);
