// Renders lesson scene art (src/lib/pixel/scenes) to PNG so it can be LOOKED AT before it is wired in.
//
// A sprite is text, and text cannot be judged. Three sprites failed their first review on the web
// repo for reasons no one saw in the rows (a monocle that read as a speech bubble, a ring whose
// gem floated off the band), so the rule there became: render at two sizes before wiring. This is
// that rule for scenes. It also runs the same contract checks as lesson-scenes-pin.mjs, so an
// artist gets the budget, motion and luminance verdict with the picture instead of at check time.
//
//   node --import ./scripts/ts-resolve-hooks.mjs scripts/render-scene.mjs <scene.ts> [--out DIR] [--slot opener|backdrop|finish]
//
// The file may live anywhere (a scratch dir); only its exported SceneArt objects are read, and
// `import type` lines are erased by Node, so a draft needs nothing from the repo at run time.
// Writes, per exported scene: <id>@6.png (every scene pixel is 6 image pixels, for review),
// <id>@2.png (small, the squint test), <id>-phone.png (the scene in its slot on a 393x852 phone,
// mock text where the lesson's text would be) and <id>-frames.png (every framed layer's frames in
// a strip). Prints the check verdict and exits 1 if any check fails.
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Buffer } from 'node:buffer';
import { deflateSync } from 'node:zlib';

import { compileFrames, compileSprite } from '../src/lib/pixel/compile.ts';

const CANVAS = '#0A090F';
const BUDGET = { opener: 900, backdrop: 700, finish: 400 };
const MIN_MOVING = { opener: 4, backdrop: 3, finish: 3 };
const SLOT_SCALE = { opener: 4, backdrop: 4, finish: 3 };
const BACKDROP_MAX_LUMINANCE = 0.15;
const FRAMED_MAX_AREA = 32 * 32;
const PHONE = { w: 393, h: 852 };

/* ── args ─────────────────────────────────────────────────────────────────────────────────────── */
const argv = process.argv.slice(2);
const file = argv.find((a) => !a.startsWith('--'));
if (!file) {
  console.error('usage: render-scene.mjs <scene.ts> [--out DIR] [--slot opener|backdrop|finish]');
  process.exit(2);
}
const flag = (name) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : undefined; };
const outDir = flag('--out') ?? resolve(file, '..', 'render');
const forcedSlot = flag('--slot');
mkdirSync(outDir, { recursive: true });

/* ── a tiny PNG writer (RGB, no dependency) ──────────────────────────────────────────────────── */
const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};
function png(width, height, rgb) {
  const raw = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 3 + 1)] = 0;
    rgb.copy(raw, y * (width * 3 + 1) + 1, y * width * 3, (y + 1) * width * 3);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ── an RGB canvas with rect fills ───────────────────────────────────────────────────────────── */
const hexRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
class Canvas {
  constructor(w, h, bg = CANVAS) {
    this.w = w; this.h = h; this.px = Buffer.alloc(w * h * 3);
    this.fill(0, 0, w, h, bg);
  }
  fill(x, y, w, h, hex, alpha = 1) {
    const [r, g, b] = hexRgb(hex);
    for (let j = Math.max(0, y); j < Math.min(this.h, y + h); j++) {
      for (let i = Math.max(0, x); i < Math.min(this.w, x + w); i++) {
        const o = (j * this.w + i) * 3;
        this.px[o] = Math.round(r * alpha + this.px[o] * (1 - alpha));
        this.px[o + 1] = Math.round(g * alpha + this.px[o + 1] * (1 - alpha));
        this.px[o + 2] = Math.round(b * alpha + this.px[o + 2] * (1 - alpha));
      }
    }
  }
  /** Draws a compiled sprite with its top-left at (x, y), `scale` canvas pixels per art pixel. */
  sprite(compiled, x, y, scale, alpha = 1) {
    for (const r of compiled.rects) this.fill(x + r.x * scale, y + r.y * scale, r.w * scale, r.h * scale, r.fill, alpha);
  }
  save(path) { writeFileSync(path, png(this.w, this.h, this.px)); }
}

/* ── the checks, mirrored from lesson-scenes-pin.mjs ─────────────────────────────────────────── */
const luminance = (hex) => {
  const lin = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
  const [r, g, b] = hexRgb(hex);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};

function slotOf(art) {
  if (forcedSlot) return forcedSlot;
  if (/backdrop/.test(art.id)) return 'backdrop';
  if (/finish|keepsake/.test(art.id)) return 'finish';
  return 'opener';
}

function check(art) {
  const slot = slotOf(art);
  const problems = [];
  const base = compileSprite(art.base);
  if (base.width !== art.width || base.height !== art.height) {
    problems.push(`base is ${base.width}x${base.height}, scene says ${art.width}x${art.height}`);
  }
  if (typeof art.label !== 'string' || art.label.trim().length < 12) problems.push('no label for VoiceOver (12+ chars)');
  if (/[–—]/.test(art.label ?? '')) problems.push('label carries an em or en dash');
  let rects = base.rects.length;
  let moving = 0;
  const colours = new Set(base.rects.map((r) => r.fill));
  const layers = [];
  for (const layer of art.layers) {
    const still = compileSprite(layer.sprite);
    const frames = compileFrames(layer.sprite);
    rects += still.rects.length;
    for (const f of frames) for (const r of f.rects) colours.add(r.fill);
    const framed = frames.length > 1;
    if (framed && still.width * still.height > FRAMED_MAX_AREA) {
      problems.push(`layer ${layer.sprite.id} has frames at ${still.width}x${still.height}; framed layers stay within ${FRAMED_MAX_AREA} px`);
    }
    if (framed || (layer.motion && layer.motion.periodMs > 0)) moving += 1;
    if (layer.motion && layer.motion.periodMs < 400) problems.push(`layer ${layer.sprite.id} cycles in under 400ms`);
    if (layer.x < 0 || layer.y < 0 || layer.x + still.width > art.width || layer.y + still.height > art.height) {
      problems.push(`layer ${layer.sprite.id} (${still.width}x${still.height} at ${layer.x},${layer.y}) leaves the scene`);
    }
    layers.push({ layer, still, frames });
  }
  if (rects > BUDGET[slot]) problems.push(`${rects} rects at rest, budget for ${slot} is ${BUDGET[slot]}`);
  if (moving < MIN_MOVING[slot]) problems.push(`${moving} moving layers, ${slot} needs at least ${MIN_MOVING[slot]}`);
  if (slot === 'backdrop') {
    for (const hex of colours) {
      const l = luminance(hex);
      if (l > BACKDROP_MAX_LUMINANCE) problems.push(`${hex} has luminance ${l.toFixed(3)}, over ${BACKDROP_MAX_LUMINANCE} for art behind text`);
    }
  }
  return { slot, problems, base, layers, rects, moving };
}

/* ── renders ─────────────────────────────────────────────────────────────────────────────────── */
function drawScene(canvas, art, base, layers, x, y, scale) {
  canvas.sprite(base, x, y, scale);
  for (const { layer, still } of layers) canvas.sprite(still, x + layer.x * scale, y + layer.y * scale, scale);
}

function renderAll(art, info) {
  const { base, layers, slot } = info;
  for (const scale of [6, 2]) {
    const pad = 2 * scale;
    const c = new Canvas(art.width * scale + pad * 2, art.height * scale + pad * 2);
    drawScene(c, art, base, layers, pad, pad, scale);
    c.save(resolve(outDir, `${art.id}@${String(scale)}.png`));
  }

  // The phone mock: the slot's scale and place, with grey bars where the lesson's text sits.
  const scale = SLOT_SCALE[slot];
  const phone = new Canvas(PHONE.w, PHONE.h);
  const text = (x, y, w, h, tone = '#F2EFF7', alpha = 0.9) => phone.fill(x, y, w, h, tone, alpha);
  if (slot === 'opener') {
    // lesson-warmup: scene centred, then the title, subtitle and a Start button.
    const sw = art.width * scale; const sh = art.height * scale;
    const top = 150;
    drawScene(phone, art, base, layers, Math.round((PHONE.w - sw) / 2), top, scale);
    text(60, top + sh + 24, PHONE.w - 120, 22);
    text(90, top + sh + 54, PHONE.w - 180, 22);
    text(110, top + sh + 100, PHONE.w - 220, 12, '#A79DB5', 0.8);
    phone.fill(96, top + sh + 150, PHONE.w - 192, 52, '#A451E6');
  } else if (slot === 'backdrop') {
    // lesson.tsx: pinned to the bottom, centred, clipped at the screen edges; content in front.
    const sw = art.width * scale; const sh = art.height * scale;
    drawScene(phone, art, base, layers, Math.round((PHONE.w - sw) / 2), PHONE.h - sh, scale);
    // A teaching card and body text over it, the way a lesson screen actually sits.
    phone.fill(20, 120, PHONE.w - 40, 300, '#14121C');
    for (let i = 0; i < 6; i++) text(40, 150 + i * 30, PHONE.w - 80 - (i % 3) * 40, 12, '#F2EFF7', 0.85);
    for (let i = 0; i < 5; i++) text(24, 470 + i * 34, PHONE.w - 48 - (i % 2) * 60, 14, '#F2EFF7', 0.85);
    phone.fill(24, PHONE.h - 120, PHONE.w - 48, 52, '#A451E6');
  } else {
    // lesson-complete: node, beam, Atlas and chips above; the keepsake arrives under the line.
    phone.fill(PHONE.w / 2 - 36, 120, 72, 72, '#A451E6');
    phone.fill(PHONE.w / 2 - 6, 192, 12, 88, '#C57FF3', 0.6);
    phone.fill(PHONE.w / 2 - 56, 260, 112, 116, '#B862ED', 0.5);
    text(80, 400, PHONE.w - 160, 26);
    for (let i = 0; i < 3; i++) phone.fill(40 + i * 110, 450, 92, 40, '#14121C');
    text(60, 510, PHONE.w - 120, 12, '#A79DB5', 0.8);
    const sw = art.width * scale; const sh = art.height * scale;
    drawScene(phone, art, base, layers, Math.round((PHONE.w - sw) / 2), 550, scale);
    phone.fill(24, PHONE.h - 120, PHONE.w - 48, 52, '#A451E6');
    if (550 + sh > PHONE.h - 120) info.problems.push(`keepsake bottom ${String(550 + sh)} runs under the Continue button at ${String(PHONE.h - 120)}`);
  }
  phone.save(resolve(outDir, `${art.id}-phone.png`));

  // Frame strips for every layer with frames, at 6x, one row per layer.
  const framed = layers.filter((l) => l.frames.length > 1);
  if (framed.length) {
    const s = 6; const gap = 6;
    const w = Math.max(...framed.map((l) => l.frames.length * (l.still.width * s + gap))) + gap;
    const h = framed.reduce((a, l) => a + l.still.height * s + gap, gap);
    const strip = new Canvas(w, h);
    let y = gap;
    for (const l of framed) {
      l.frames.forEach((f, i) => strip.sprite(f, gap + i * (l.still.width * s + gap), y, s));
      y += l.still.height * s + gap;
    }
    strip.save(resolve(outDir, `${art.id}-frames.png`));
  }
}

/* ── main ─────────────────────────────────────────────────────────────────────────────────────── */
const mod = await import(pathToFileURL(resolve(file)).href);
const scenes = Object.entries(mod).filter(([, v]) => v && typeof v === 'object' && Array.isArray(v.layers) && v.base);
if (!scenes.length) {
  console.error(`${file} exports no SceneArt (an object with base and layers)`);
  process.exit(2);
}
let failed = false;
for (const [name, art] of scenes) {
  let info;
  try {
    info = check(art);
  } catch (error) {
    console.log(`${name} (${art.id}): DOES NOT COMPILE: ${error instanceof Error ? error.message : String(error)}`);
    failed = true;
    continue;
  }
  renderAll(art, info);
  const verdict = info.problems.length ? 'FAIL' : 'OK';
  console.log(`${name} (${art.id}) ${art.width}x${art.height} as ${info.slot}: ${verdict}. ${String(info.rects)} rects (budget ${String(BUDGET[info.slot])}), ${String(info.moving)} moving layers (min ${String(MIN_MOVING[info.slot])}), ${String(art.layers.length)} layers.`);
  for (const p of info.problems) console.log(`  - ${p}`);
  console.log(`  -> ${outDir}/${art.id}@6.png, @2.png, -phone.png${info.layers.some((l) => l.frames.length > 1) ? ', -frames.png' : ''}`);
  if (info.problems.length) failed = true;
}
process.exit(failed ? 1 : 0);
