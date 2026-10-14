#!/usr/bin/env node
/**
 * Story cards (native lessons): the story art, the Reduce Motion stills, and the three card sources.
 *
 *   node --import ./scripts/ts-resolve-hooks.mjs scripts/story-cards-pin.mjs
 *   node --import ./scripts/ts-resolve-hooks.mjs scripts/story-cards-pin.mjs --selftest
 *
 * native-lesson-pin owns the lesson DATA (copy, figures, the override). This pin owns what the data
 * is drawn with, the half lesson-spec.md section 9.1 lists and that no other pin sees:
 *   - lesson-scenes-pin scans only src/lib/pixel/scenes, so story art (src/lib/pixel/stories) gets
 *     its rules here: base equals the frame, layers inside, framed layers within 32 x 32, at most 900
 *     rects, something moving in every frame, a VoiceOver label, and no K outline.
 *   - THE REDUCE MOTION STILL. Under Reduce Motion, and on Back, StoryStage cuts to storyRestAt /
 *     toggleRestAt instead of playing a beat. That still is the ONLY picture such a learner sees, so it
 *     must show what the caption says: the counted copies the caption names, every resting actor
 *     inside the frame, every actor the art can draw. Checked through the real rest functions, not
 *     the cue data, because those functions are the path the app takes.
 *   - The card sources: a Reduce Motion gate on every animated card (AGENTS.md), theme colours only
 *     (CONSTITUTION 5.8), no infinite loops or springs on data geometry, a ScrollView so controls never
 *     slide under the deck footer, 48pt targets (5.10), VoiceOver roles, and the clip clock on the story.
 *   - PixelScene keeps its story-still branch and its archetype fallback (spec 6.3).
 *
 * K OUTLINES are measured, not banned. K is legitimate as a fill (the ticket window's dark interior,
 * floorboard seams) and as a single eye pixel on the opener's own investor. An outline is a sprite
 * whose EDGE ring is K, so the rule is K's share of each sprite's edge pixels (measured 2026-10-13:
 * 0% on every story sprite; a K-outlined sprite is near 100%).
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const imported = (rel) => import(pathToFileURL(join(ROOT, rel)).href);
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');

const { compileFrames, compileSprite } = await imported('src/lib/pixel/compile.ts');
const STORIES = await imported('src/lib/pixel/stories/index.ts');
const { storyRestAt, copyAt } = await imported('src/lib/mobile-lesson/parts/story.ts');
const { toggleRestAt } = await imported('src/lib/mobile-lesson/parts/toggle.ts');
const N = await imported('src/lib/native-lessons/index.ts');

const W = 80;
const H = 60;
const MAX_RECTS = 900;
const FRAMED_MAX_AREA = 32 * 32;
const MIN_PERIOD_MS = 400;
const K_EDGE_MAX = 0.25;
const TRANSPARENT = new Set(['.', ' ']);

/** K's share of a sprite's edge pixels (opaque pixels with a transparent or outside neighbour). */
function kEdgeShare(rows) {
  const at = (x, y) => (y < 0 || y >= rows.length || x < 0 ? '.' : (rows[y][x] ?? '.'));
  let edge = 0;
  let k = 0;
  rows.forEach((row, y) => [...row].forEach((c, x) => {
    if (TRANSPARENT.has(c)) return;
    if (![[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => TRANSPARENT.has(at(x + dx, y + dy)))) return;
    edge += 1;
    if (c === 'K') k += 1;
  }));
  return edge ? k / edge : 0;
}

const kOutline = (where, sprite) => [sprite.rows, ...(sprite.frames ?? [])].flatMap((rows, i) =>
  kEdgeShare(rows ?? []) > K_EDGE_MAX ? [`${where}${i ? ` frame ${String(i)}` : ''}: K is ${String(Math.round(kEdgeShare(rows) * 100))}% of its edge, a K outline on the dark canvas (use the deep steps O, E, D, I)`] : []);

/** One frame or still: the scene contract lesson-scenes-pin holds for the lesson art slots. */
function checkScene(where, sc, { needsMotion }) {
  const P = [];
  let base;
  try { base = compileSprite(sc.base); } catch (e) { return [`${where}: base does not compile: ${String(e?.message ?? e)}`]; }
  if (sc.width !== W || sc.height !== H || base.width !== W || base.height !== H) P.push(`${where}: base ${String(base.width)}x${String(base.height)}, scene ${String(sc.width)}x${String(sc.height)}; story art is ${String(W)}x${String(H)}`);
  if (typeof sc.label !== 'string' || sc.label.trim().length < 12) P.push(`${where}: no VoiceOver label`);
  if (/[–—]/.test(sc.label ?? '')) P.push(`${where}: label has an em or en dash`);
  let rects = base.rects.length;
  let moving = 0;
  for (const layer of sc.layers) {
    let still;
    let frames;
    try { still = compileSprite(layer.sprite); frames = compileFrames(layer.sprite); } catch (e) { P.push(`${where}: layer ${layer.sprite.id} does not compile: ${String(e?.message ?? e)}`); continue; }
    rects += still.rects.length;
    if (frames.length > 1 && still.width * still.height > FRAMED_MAX_AREA) P.push(`${where}: layer ${layer.sprite.id} has frames at ${String(still.width)}x${String(still.height)}; framed layers stay within 32 x 32`);
    if (frames.length > 1 || (layer.motion && layer.motion.periodMs > 0)) moving += 1;
    if (layer.motion && layer.motion.periodMs < MIN_PERIOD_MS) P.push(`${where}: layer ${layer.sprite.id} cycles in under ${String(MIN_PERIOD_MS)}ms, which flickers`);
    if (!(layer.x >= 0 && layer.y >= 0 && layer.x + still.width <= W && layer.y + still.height <= H)) P.push(`${where}: layer ${layer.sprite.id} (${String(still.width)}x${String(still.height)} at ${String(layer.x)},${String(layer.y)}) leaves the frame`);
    P.push(...kOutline(`${where} layer ${layer.sprite.id}`, layer.sprite));
  }
  if (rects > MAX_RECTS) P.push(`${where}: ${String(rects)} rects at rest, budget ${String(MAX_RECTS)}`);
  if (needsMotion && moving < 1) P.push(`${where}: nothing moves; every story frame keeps at least one ambient layer`);
  return P;
}

/** A whole story art module. Pure: the selftest feeds it broken copies. */
function checkArt(art) {
  const P = [];
  if (art.width !== W || art.height !== H) P.push(`${art.id}: art is ${String(art.width)}x${String(art.height)}`);
  for (const [id, sc] of Object.entries(art.frames)) P.push(...checkScene(`${art.id} frame ${id}`, sc, { needsMotion: true }));
  for (const [id, sc] of Object.entries(art.stills)) P.push(...checkScene(`${art.id} still ${id}`, sc, { needsMotion: false }));
  for (const [id, sprite] of Object.entries(art.actors)) {
    let still;
    let frames;
    try { still = compileSprite(sprite); frames = compileFrames(sprite); } catch (e) { P.push(`${art.id} actor ${id}: does not compile: ${String(e?.message ?? e)}`); continue; }
    if (still.width > W || still.height > H) P.push(`${art.id} actor ${id}: ${String(still.width)}x${String(still.height)} is bigger than the frame`);
    if (frames.length > 1 && still.width * still.height > FRAMED_MAX_AREA) P.push(`${art.id} actor ${id}: frames at ${String(still.width)}x${String(still.height)}; framed sprites stay within 32 x 32`);
    P.push(...kOutline(`${art.id} actor ${id}`, sprite));
  }
  for (const id of art.order ?? []) if (!art.actors[id]) P.push(`${art.id}: order names "${id}", which is not an actor`);
  return P;
}

/** The picture Reduce Motion and Back cut to, for one beat or state, against the art and the caption. */
function checkRest(where, rest, cast, caption, art) {
  const P = [];
  for (const [id, r] of Object.entries(rest)) {
    if (!r.visible) continue;
    const sprite = art.actors[id];
    if (!sprite) { P.push(`${where}: the still draws "${id}", which the art does not have`); continue; }
    if (r.ghostSprite && !art.actors[r.ghostSprite]) P.push(`${where}: the still draws ghost "${r.ghostSprite}", which the art does not have`);
    const { width: w, height: h } = compileSprite(sprite);
    const n = r.copies?.n ?? 1;
    for (let k = 0; k < n; k += 1) {
      const p = r.copies ? copyAt(r.at, k, r.copies, { w, h }) : r.at;
      if (p.x < 0 || p.y < 0 || p.x + w > W || p.y + h > H) { P.push(`${where}: in the still, ${id}${r.copies ? ` copy ${String(k + 1)}` : ''} (${String(w)}x${String(h)} at ${String(p.x)},${String(p.y)}) leaves the frame`); break; }
    }
  }
  // The number a caption names must be the number the still shows (lit copies = copies minus ghosts).
  for (const c of cast ?? []) {
    if (!c.derivedFrom) continue;
    const r = rest[c.actor];
    const says = Number((c.derivedFrom.match(/\d+/) ?? [NaN])[0]);
    const lit = r?.visible ? (r.copies?.n ?? 1) - r.ghostCopies.length : 0;
    if (!caption.includes(c.derivedFrom)) P.push(`${where}: derivedFrom "${c.derivedFrom}" is not in the caption`);
    if (lit !== says) P.push(`${where}: the caption says "${c.derivedFrom}" but the Reduce Motion still shows ${String(lit)} lit ${c.actor}`);
  }
  return P;
}

function checkSpecRests(spec, art) {
  if (spec.kind === 'story') return spec.beats.flatMap((b, i) => checkRest(`story "${spec.title}" beat ${String(i + 1)}`, storyRestAt(b), b.cast, b.caption, art));
  if (spec.kind === 'toggle') return spec.states.flatMap((s, i) => {
    const where = `toggle "${spec.title}" state "${s.chip}"`;
    const rest = toggleRestAt(spec, i);
    const P = checkRest(where, rest.actors, s.cast, s.caption, art);
    if (!art.frames[rest.frame]) P.push(`${where}: the still's frame "${rest.frame}" is not in the art`);
    if (spec.strip && rest.strip) {
      const { at, count, tileW, gap } = spec.strip;
      const tallest = Math.max(rest.strip.h, rest.strip.ghostUp ?? 0, rest.strip.ghostDown ?? 0);
      if (at.x < 0 || at.x + count * tileW + (count - 1) * gap > W || at.y - tallest < 0 || at.y > H) P.push(`${where}: the still's strip leaves the frame`);
    }
    return P;
  });
  return [];
}

/* ── the sources ──────────────────────────────────────────────────────────────────────────────── */

const PARTS = 'src/components/mobile-lesson/parts/';
const stripComments = (t) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
const CARDS = {
  'story-card.tsx': [[/useClipTimeline\(/, 'never runs the clip clock (useClipTimeline), so autoplay, VoiceOver pause and focus rules are lost'], [/<ClipControls\b/, 'has no ClipControls (the 48pt Back / Play / Next)']],
  'toggle-scene-card.tsx': [[/const animate = change\.animate && !reduced\b/, 'no longer gates its motion on Reduce Motion (const animate = change.animate && !reduced)'], [/minHeight: (4[89]|[5-9]\d)\b/, 'has no 48pt chip']],
  'growth-ledger-card.tsx': [[/const live = play && !reduced\b/, 'no longer gates row motion on Reduce Motion (const live = play && !reduced)'], [/const jumpLive = [^;\n]*!reduced/, 'no longer gates the year 30 rescale on Reduce Motion'], [/minHeight: (4[89]|[5-9]\d)\b/, 'has no 48pt control']],
};
const STAGE = {
  'story-stage.tsx': [[/useReducedMotion\(\)/, 'never reads useReducedMotion, so a card that forgets `reduced` would animate'], [/const animate = change\.animate && !reduced && !systemReduced/, 'no longer cuts on Reduce Motion (const animate = change.animate && !reduced && !systemReduced)'], [/<StripLayer[^>]*change=\{motion\}/, 'hands the strip an ungated change'], [/<LabelsLayer[^>]*change=\{motion\}/, 'hands the labels an ungated change']],
  'story-overlays.tsx': [[/if \(!change\.animate\) \{/, 'lost its cut path for Reduce Motion and Back']],
};

/** Source rules for one file. Pure: the selftest feeds it broken copies. */
function checkSource(name, src) {
  const code = stripComments(src);
  const P = [];
  const bad = (msg) => P.push(`${name} ${msg}`);
  if (/#[0-9A-Fa-f]{3,8}\b/.test(code)) bad('hardcodes a hex colour (CONSTITUTION 5.8: theme tokens only)');
  if (/withRepeat\(/.test(code)) bad('uses withRepeat; nothing in a story card loops (the frame ambient layers already do, paused off-focus)');
  if (/withSpring\(/.test(code)) bad('uses withSpring; data geometry moves with monotonic easing only (AGENTS.md)');
  if (/ZoomIn/.test(code)) bad('uses ZoomIn');
  if (/withSequence\(withTiming\(1\.\d/.test(code)) bad('inlines an accent swell; use ACCENT_SCALE and ACCENT_MS');
  if (CARDS[name]) {
    if (!/useReducedMotion\(\)/.test(code)) bad('never reads useReducedMotion (AGENTS.md: a Reduce Motion outcome for every animation)');
    if (!/<ScrollView\b/.test(code)) bad('has no ScrollView, so its controls slide under the deck footer on an SE or at large Dynamic Type');
    if (!/accessibilityRole=/.test(code)) bad('sets no accessibilityRole');
  }
  for (const [re, msg] of [...(CARDS[name] ?? []), ...(STAGE[name] ?? [])]) if (!re.test(code)) bad(msg);
  return P;
}

const PIXEL_SCENE = 'src/components/mobile-lesson/PixelScene.tsx';
function checkPixelScene(src) {
  const code = stripComments(src);
  const P = [];
  if (!/useStoryArt\(scene\.story\?\.artKey/.test(code)) P.push('PixelScene no longer reads story art, so Term, Idea and Takeaway cards show keyword icons instead of the story world');
  if (!/\.stills\[scene\.story\.still\]/.test(code)) P.push('PixelScene no longer draws the named story still');
  if (!/composeScene\(\{ archetype, accent, overlay \}\)/.test(code)) P.push('PixelScene lost its archetype path, which is the fallback when story art fails');
  return P;
}

/* ── run ──────────────────────────────────────────────────────────────────────────────────────── */

async function realInputs() {
  const arts = new Map();
  for (const key of Object.keys(STORIES.STORY_ART_LOADERS)) arts.set(key, await STORIES.loadStoryArt(key));
  const specs = [];
  for (const key of N.nativeLessonKeys()) {
    const lesson = await N.loadNativeLesson(key);
    for (const d of lesson.steps.filter((s) => s.type === 'mobileDeck')) for (const c of d.cards) if (c.kind === 'interactive') specs.push(c.spec);
  }
  const sources = Object.fromEntries([...Object.keys(CARDS), ...Object.keys(STAGE)].map((f) => [f, read(PARTS + f)]));
  return { arts, specs, sources, pixelScene: read(PIXEL_SCENE) };
}

function checkAll({ arts, specs, sources, pixelScene }) {
  const P = [];
  for (const [key, art] of arts) {
    if (!art) { P.push(`story art "${key}" does not load under node`); continue; }
    P.push(...checkArt(art));
  }
  for (const spec of specs) {
    const art = arts.get(spec.artKey);
    if (art) P.push(...checkSpecRests(spec, art));
  }
  for (const [name, src] of Object.entries(sources)) P.push(...checkSource(name, src));
  P.push(...checkPixelScene(pixelScene));
  return P;
}

async function selftest() {
  const real = await realInputs();
  const clean = checkAll(real);
  if (clean.length) { console.error(`story-cards-pin --selftest: the real inputs are not clean, so mutations prove nothing:\n  ${clean.join('\n  ')}`); process.exit(1); }
  const art = [...real.arts.values()][0];
  const fill = [...art.actors.maya.rows.join('')].find((c) => !TRANSPARENT.has(c) && c !== 'K');
  const story = real.specs.find((s) => s.kind === 'story');
  const frameId = Object.keys(art.frames)[0];
  const countBeat = story.beats.findIndex((b) => (b.cast ?? []).some((c) => c.do === 'count' && c.derivedFrom));
  const ghostBeat = story.beats.findIndex((b) => (b.cast ?? []).some((c) => c.do === 'ghost' && c.derivedFrom));
  const cases = [
    ['a layer outside the frame', /leaves the frame/, (x) => { x.arts.get(art.id).frames[frameId].layers[0].x = 79; }],
    ['a base of the wrong size', /base \d+x\d+/, (x) => { x.arts.get(art.id).frames[frameId].base = { ...art.frames[frameId].base, rows: art.frames[frameId].base.rows.slice(1) }; }],
    ['a big framed layer', /within 32 x 32/, (x) => { const rows = Array.from({ length: 40 }, () => fill.repeat(40)); x.arts.get(art.id).frames[frameId].layers.push({ sprite: { id: 'big', name: 'big', tags: [], rows, frames: [rows, rows] }, x: 0, y: 0 }); }],
    ['a frame over the rect budget', /rects at rest/, (x) => { const rows = Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, i) => ((i + y) % 2 ? fill : 'K')).join('')); x.arts.get(art.id).frames[frameId].base = { id: 'checker', name: 'checker', tags: [], rows }; }],
    ['a frame with nothing moving', /nothing moves/, (x) => { const f = x.arts.get(art.id).frames[frameId]; f.layers = f.layers.filter((l) => !(l.sprite.frames?.length > 1) && !(l.motion?.periodMs > 0)); }],
    ['a K-outlined actor', /K outline/, (x) => { x.arts.get(art.id).actors.boxed = { id: 'boxed', name: 'boxed', tags: [], rows: ['KKKK', `K${fill}${fill}K`, 'KKKK'] }; }],
    ['a frame with no label', /VoiceOver label/, (x) => { x.arts.get(art.id).frames[frameId].label = ''; }],
    ['a count whose still disagrees with its caption', /Reduce Motion still shows/, (x) => { x.specs.find((s) => s.kind === 'story').beats[countBeat].cast.find((c) => c.do === 'count').n = 8; }],
    ['a ghost whose still disagrees with its caption', /Reduce Motion still shows/, (x) => { x.specs.find((s) => s.kind === 'story').beats[ghostBeat].cast.find((c) => c.do === 'ghost').index = undefined; }],
    ['an actor resting outside the frame', /leaves the frame/, (x) => { const c = x.specs.find((s) => s.kind === 'toggle').states[0].cast.find((q) => q.at); c.at = { x: 78, y: 58 }; }],
    ['a toggle still on a missing frame', /frame ".*" is not in the art/, (x) => { x.specs.find((s) => s.kind === 'toggle').states[0].frame = 'nowhere'; }],
    ['a card without useReducedMotion', /useReducedMotion/, (x) => { x.sources['toggle-scene-card.tsx'] = x.sources['toggle-scene-card.tsx'].replaceAll('useReducedMotion()', 'false'); }],
    ['a card with a hex colour', /hex/, (x) => { x.sources['growth-ledger-card.tsx'] += "\nconst c = '#FF0000';"; }],
    ['a card with withRepeat', /withRepeat/, (x) => { x.sources['story-card.tsx'] += '\nwithRepeat(withTiming(1), -1);'; }],
    ['a card with withSpring', /withSpring/, (x) => { x.sources['growth-ledger-card.tsx'] += '\nwithSpring(1);'; }],
    ['a card without a ScrollView', /ScrollView/, (x) => { x.sources['toggle-scene-card.tsx'] = x.sources['toggle-scene-card.tsx'].replaceAll('<ScrollView', '<View'); }],
    ['a story without the clip clock', /useClipTimeline/, (x) => { x.sources['story-card.tsx'] = x.sources['story-card.tsx'].replaceAll('useClipTimeline(', 'useOtherClock('); }],
    ['a stage that ignores Reduce Motion', /no longer cuts on Reduce Motion/, (x) => { x.sources['story-stage.tsx'] = x.sources['story-stage.tsx'].replace('&& !reduced && !systemReduced', ''); }],
    ['a ledger whose rows ignore Reduce Motion', /row motion/, (x) => { x.sources['growth-ledger-card.tsx'] = x.sources['growth-ledger-card.tsx'].replace('const live = play && !reduced', 'const live = play'); }],
    ['a toggle chip under 48pt', /48pt/, (x) => { x.sources['toggle-scene-card.tsx'] = x.sources['toggle-scene-card.tsx'].replace(/minHeight: (4[89]|[5-9]\d)\b/g, 'minHeight: 40'); }],
    ['PixelScene without story stills', /story art/, (x) => { x.pixelScene = x.pixelScene.replace('useStoryArt(scene.story?.artKey', 'useStoryArt(null'); }],
    ['PixelScene without its archetype fallback', /archetype path/, (x) => { x.pixelScene = x.pixelScene.replace('composeScene({ archetype, accent, overlay })', 'null'); }],
  ];
  let quiet = 0;
  for (const [name, expect, mutate] of cases) {
    const copy = { arts: new Map([...real.arts].map(([k, v]) => [k, structuredClone(v)])), specs: structuredClone(real.specs), sources: { ...real.sources }, pixelScene: real.pixelScene };
    mutate(copy);
    const found = checkAll(copy);
    if (!found.some((p) => expect.test(p))) { quiet += 1; console.error(`  QUIET on ${name} (got: ${found.slice(0, 3).join(' | ') || 'nothing'})`); }
  }
  if (quiet) { console.error(`story-cards-pin --selftest: ${String(quiet)} detector(s) stayed quiet`); process.exit(1); }
  console.log(`story-cards-pin --selftest: OK, all ${String(cases.length)} detectors fire`);
}

if (process.argv.includes('--selftest')) {
  await selftest();
} else {
  const inputs = await realInputs();
  const problems = checkAll(inputs);
  if (problems.length) {
    console.error(`story-cards-pin: ${String(problems.length)} problem(s)\n  ${problems.join('\n  ')}`);
    process.exit(1);
  }
  const counts = [...inputs.arts.values()].map((a) => `${a.id}: ${String(Object.keys(a.frames).length)} frames, ${String(Object.keys(a.stills).length)} stills, ${String(Object.keys(a.actors).length)} actors`).join('; ');
  console.log(`story-cards-pin: OK (${counts}; ${String(inputs.specs.length)} native cards' Reduce Motion stills; ${String(Object.keys(inputs.sources).length)} card sources; PixelScene stills)`);
}
