// Lesson scene art (src/lib/pixel/scenes): every scene must honour the contract the renderer
// relies on, and the rules the owner set for it (2026-09-29: big art, always moving, and a backdrop
// that never fights the text in front of it).
//
// Each check names the failure it prevents:
//   size      a base that is not width x height is drawn at the wrong size and layers land off it
//   inside    a layer outside the scene is clipped on the backdrop and overlaps text on the opener
//   framed    a big sprite with frames re-renders hundreds of rects on the JS thread per frame
//   moving    a scene with nothing moving is a frozen picture, which the owner ruled out
//   budget    rect counts are the render cost; the limits are what the pilot measured as smooth
//   quiet     a bright backdrop colour sits behind white text and purple buttons
//   key       an entry for a lesson that does not exist is art nobody will ever see
//   label     VoiceOver reads the label, so it must exist and carry no em dash (CONSTITUTION 4)
//   loads     every entry is a lazy import (scenes/index.ts); one that fails would only show in-app
//   orphan    a `<prefix><N>.ts` lesson set with no entry in index.ts is art nobody will ever see
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';

import { compileFrames, compileSprite } from '../src/lib/pixel/compile.ts';
import { EUPHORIA_PIXEL_PALETTE, PIXEL_PALETTE_LIGHT } from '../src/lib/pixel/palette.ts';
import { LESSON_ART_LOADERS } from '../src/lib/pixel/scenes/index.ts';
import { COURSES } from '../src/lib/curriculum/courseIndex.ts';

const BUDGET = { opener: 900, backdrop: 700, finish: 400 };
const MIN_MOVING = { opener: 4, backdrop: 3, finish: 3 };
const BACKDROP_MAX_LUMINANCE = 0.15;
const FRAMED_MAX_AREA = 32 * 32;

const luminance = (hex) => {
  const v = hex.replace('#', '');
  const lin = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};

const failures = [];
const check = (ok, msg) => { if (!ok) failures.push(msg); };
const courseIds = new Set(COURSES.map((c) => c.id));
let scenes = 0;

const keys = Object.keys(LESSON_ART_LOADERS);
const lessonFiles = readdirSync(new URL('../src/lib/pixel/scenes/', import.meta.url)).filter((f) => /^[a-z]{2}\d{1,2}\.ts$/.test(f));
check(lessonFiles.length === keys.length,
  `${String(lessonFiles.length)} lesson set files in scenes/ but ${String(keys.length)} entries in LESSON_ART_LOADERS; register every <prefix><N>.ts`);

for (const key of keys) {
  const [courseId, num] = key.split(':');
  check(courseIds.has(courseId), `${key}: no course "${courseId}"`);
  check(Number.isInteger(Number(num)) && Number(num) >= 1 && Number(num) <= 25, `${key}: lesson number out of range`);
  let set;
  try {
    ({ art: set } = await LESSON_ART_LOADERS[key]());
  } catch (error) {
    check(false, `${key}: art does not load: ${error instanceof Error ? error.message : String(error)}`);
    continue;
  }

  for (const slot of ['opener', 'backdrop', 'finish']) {
    const art = set[slot];
    if (!art) continue;
    scenes += 1;
    const where = `${key} ${slot} (${art.id})`;
    let base;
    try {
      base = compileSprite(art.base);
    } catch (error) {
      check(false, `${where}: base does not compile: ${error instanceof Error ? error.message : String(error)}`);
      continue;
    }
    check(base.width === art.width && base.height === art.height,
      `${where}: base is ${base.width}x${base.height}, scene says ${art.width}x${art.height}`);
    check(typeof art.label === 'string' && art.label.trim().length >= 12, `${where}: no label for VoiceOver`);
    check(!/[–—]/.test(art.label ?? ''), `${where}: label carries an em or en dash`);

    let rects = base.rects.length;
    let moving = 0;
    const colours = new Set(base.rects.map((r) => r.fill));
    for (const layer of art.layers) {
      let still;
      let frames;
      try {
        still = compileSprite(layer.sprite);
        frames = compileFrames(layer.sprite);
      } catch (error) {
        check(false, `${where}: layer ${layer.sprite.id} does not compile: ${error instanceof Error ? error.message : String(error)}`);
        continue;
      }
      rects += still.rects.length;
      for (const f of frames) for (const r of f.rects) colours.add(r.fill);
      const framed = frames.length > 1;
      if (framed) {
        check(still.width * still.height <= FRAMED_MAX_AREA,
          `${where}: layer ${layer.sprite.id} has frames at ${still.width}x${still.height}; framed layers stay within ${FRAMED_MAX_AREA} pixels`);
      }
      if (framed || (layer.motion && layer.motion.periodMs > 0)) moving += 1;
      if (layer.motion) check(layer.motion.periodMs >= 400, `${where}: layer ${layer.sprite.id} cycles in under 400ms, which flickers`);
      check(layer.x >= 0 && layer.y >= 0 && layer.x + still.width <= art.width && layer.y + still.height <= art.height,
        `${where}: layer ${layer.sprite.id} (${still.width}x${still.height} at ${layer.x},${layer.y}) leaves the scene`);
    }
    check(rects <= BUDGET[slot], `${where}: ${rects} rects at rest, budget is ${BUDGET[slot]}`);
    check(moving >= MIN_MOVING[slot], `${where}: ${moving} moving layers, the owner asked for art that is always moving (at least ${MIN_MOVING[slot]})`);
    if (slot === 'backdrop') {
      for (const hex of colours) {
        const l = luminance(hex);
        check(l <= BACKDROP_MAX_LUMINANCE, `${where}: ${hex} has luminance ${l.toFixed(3)}, over ${BACKDROP_MAX_LUMINANCE} for art behind text`);
      }
    }
  }
}

// The frames cache is keyed by canvas as well as sprite: a flat one handed a light-canvas request the
// dark mesh, so animated sprites kept the first theme's colours after a theme switch.
const swap = Object.keys(EUPHORIA_PIXEL_PALETTE).find((c) => PIXEL_PALETTE_LIGHT[c] && PIXEL_PALETTE_LIGHT[c] !== EUPHORIA_PIXEL_PALETTE[c]);
const probe = { id: 'pin-frames-canvas', name: 'probe', tags: [], rows: [swap], frames: [[swap], [swap]] };
check(compileFrames(probe, 'dark')[0].rects[0].fill !== compileFrames(probe, 'light')[0].rects[0].fill, 'compileFrames: a light-canvas compile returned the dark mesh (frames cache not keyed by canvas)');

assert.ok(scenes > 0, 'no lesson scenes found; this pin cannot see what it guards');
assert.deepEqual(failures, [], `lesson scenes break their contract:\n  ${failures.join('\n  ')}`);
console.log(`lesson-scenes-pin: OK. ${String(scenes)} scenes across ${String(keys.length)} lessons honour size, bounds, motion, budget and backdrop quiet.`);
