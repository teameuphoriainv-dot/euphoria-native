#!/usr/bin/env node
/**
 * Atlas expression sprites for App Store decoration layers.
 *
 * These are NOT redrawn. The body is the shipping `assets/images/atlas-logo.png`, and the eyes
 * and brows are the exact coordinates `src/components/atlas.tsx` renders on device -- same
 * 100x104 design box, same INK, same radii. Copying the numbers rather than eyeballing a
 * lookalike is the only way a marketing sprite stays the same character as the in-app mascot.
 *
 * Output: goldie/decor/atlas-<expression>.png (transparent, 600x624)
 *
 * Usage: node scripts/atlas-expressions.mjs
 */
import { Buffer } from 'node:buffer';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const LOGO = path.join(ROOT, 'assets/images/atlas-logo.png');
const OUT = path.join(ROOT, 'goldie/decor');

const INK = '#1A1523';
/** The design box atlas.tsx draws into. Every coordinate below is in these units. */
const BOX_W = 100;
const BOX_H = 104;
const S = 6; // 600x624 output

/** Eye whites. Centres taken from the closed-eye paths; radii from `whiteR`. */
const WHITES = { lx: 34.8, ly: 27.5, rx: 61.2, ry: 26, lr: 13, rr: 11.8 };

const brow = (d, w = 2.4) =>
  `<path d="${d}" stroke="${INK}" stroke-width="${w}" stroke-linecap="round" fill="none"/>`;
const dot = (cx, cy, r, fill = INK) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`;

/**
 * Nine expressions ship in the app; these are the five with fully static geometry, so they
 * rasterise identically to a frame of the on-device render. `happy` is excluded because its
 * eyes are animated arc paths rather than fixed circles.
 */
const EXPRESSIONS = {
  proud: {
    pupils:
      dot(34.8, 22.5, 6.6) + dot(32.6, 20.5, 2.2, '#fff') +
      dot(61.2, 21.2, 6) + dot(59, 19.2, 2, '#fff') +
      brow('M24 28.5 Q34.8 33 45.6 28.5', 2.6) + brow('M51.4 27 Q61.2 31.2 71 27', 2.6),
    brows: brow('M25 11 L44 9.5') + brow('M52 9.5 L71 8'),
  },
  thinking: {
    pupils:
      dot(32, 22, 6.6) + dot(29.8, 20, 2.2, '#fff') +
      dot(59, 23.5, 5.8) + dot(57, 21.5, 1.8, '#fff') +
      brow('M26 20 Q34.8 16.5 42 19.5'),
    brows: brow('M25 15 Q34.5 12 44 14') + brow('M52 8 L71 10'),
  },
  watching: {
    pupils:
      dot(31.8, 29.5, 6.6) + dot(29.4, 27, 2, '#fff') +
      dot(58.3, 28, 6) + dot(56, 25.8, 1.8, '#fff'),
    brows: brow('M25 13 L44 12') + brow('M52 11.5 L71 10.5'),
  },
  silly: {
    pupils:
      dot(39.5, 27, 6.2) + dot(37.2, 24.7, 2, '#fff') +
      dot(57, 26.2, 5.7) + dot(54.9, 24.1, 1.8, '#fff'),
    brows: brow('M25 9 L44 12') + brow('M52 14 Q61 9 70 13'),
  },
  whoa: {
    // `whoa` widens the whites; atlas.tsx swaps whiteR to [14, 12.8] for this one alone.
    whites: { ...WHITES, lr: 14, rr: 12.8 },
    pupils: dot(34.8, 26.5, 4.4) + dot(61.2, 25, 4),
    brows: brow('M25 9 Q34.5 4 44 8') + brow('M52 7.5 Q61 2.5 70 6.5'),
  },
};

function faceSvg(spec) {
  const w = spec.whites ?? WHITES;
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${BOX_W * S}" height="${BOX_H * S}" viewBox="0 0 ${BOX_W} ${BOX_H}">` +
      `<circle cx="${w.lx}" cy="${w.ly}" r="${w.lr}" fill="#fff"/>` +
      `<circle cx="${w.rx}" cy="${w.ry}" r="${w.rr}" fill="#fff"/>` +
      spec.pupils +
      spec.brows +
      `</svg>`,
  );
}

mkdirSync(OUT, { recursive: true });

const body = await sharp(LOGO)
  .resize(BOX_W * S, BOX_H * S, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

for (const [name, spec] of Object.entries(EXPRESSIONS)) {
  const file = path.join(OUT, `atlas-${name}.png`);
  await sharp(body).composite([{ input: faceSvg(spec), top: 0, left: 0 }]).png().toFile(file);
  console.log(`  atlas-${name}.png`);
}

console.log(`\n${Object.keys(EXPRESSIONS).length} expression sprites in ${path.relative(ROOT, OUT)}`);
