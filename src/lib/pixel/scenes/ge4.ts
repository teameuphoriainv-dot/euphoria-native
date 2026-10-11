/**
 * Global Economics lesson 4: GDP, measuring the economy, in the study at dusk.
 *
 * A bar chart stands on an easel, one bar for each year's output, and the newest bar keeps growing
 * past the last while the student points at it: GDP is the whole economy's output added up, and
 * growth is that bar rising. A banker's lamp, a mug and a stack of books sit on the desk under the
 * window onto the harbor. Only small layers move: the newest bar and its sparkle, steam off the
 * mug, the lamp, and two stars and a ship's light in the window.
 *
 * The keepsake's emblem is the same chart in small: four bars, rising.
 */
import type { PixelSprite } from '../types';
import { geBackdrop } from './ge-backdrop';
import { GE_PALETTE, geCompose, geSmoke, geSparkle, geStamp, geStar, geStarBig, geStudent, geTint } from './ge-kit';
import { geGroundStudy, geLampGlow, geShadow } from './ge-kit-a';
import { geKeepsake } from './ge1-finish';
import type { LessonArtSet, SceneArt } from './types';

/* ── one-off props ──────────────────────────────────────────────────────────────────────────── */

/**
 * The easel, 30x40: a framed sheet with a chart of four years' output and the fifth year's bar left
 * empty (it grows as a layer at x 23, bottom on row 18), a chalk tray and three legs.
 */
const easel: PixelSprite = {
  id: 'ge4-opener-easel',
  name: 'easel chart',
  tags: ['ge4', 'prop'],
  blurb: 'An easel holding a white sheet with a bar chart of four rising emerald bars.',
  palette: GE_PALETTE,
  rows: [
    'uuuuuuuuuuuuuuuuuuuuuuuuuuuuuu',
    'ullllllllllllllllllllllllllllu',
    'ulzzzzzzzzzzzzzzzzzzzzzzzzzzlu',
    'ulzzzzzzzzzzzzzzzzzzzzzzzzzzlu',
    'ulzzzKzzzzzzzzzzzzzzzzzzzzzzlu',
    'ulzzzKzzzzzzzzzzzzzzzzzzzzzzlu',
    'ulzzzKzzzzzzzzzzzzzzzzzzzzzzlu',
    'ulzzzKzzzzzzzzzzzzzNnJzzzzzzlu',
    'ulzzzKzzzzzzzzzzzzzNnJzzzzzzlu',
    'ulzzzKzzzzzzzzzzzzzNnJzzzzzzlu',
    'ulzzzKzzzzzzzzzNnJzNnJzzzzzzlu',
    'ulzzzKzzzzzzzzzNnJzNnJzzzzzzlu',
    'ulzzzKzzzzzNnJzNnJzNnJzzzzzzlu',
    'ulzzzKzzzzzNnJzNnJzNnJzzzzzzlu',
    'ulzzzKzzzzzNnJzNnJzNnJzzzzzzlu',
    'ulzzzKzNnJzNnJzNnJzNnJzzzzzzlu',
    'ulzzzKzNnJzNnJzNnJzNnJzzzzzzlu',
    'ulzzzKzNnJzNnJzNnJzNnJzzzzzzlu',
    'ulzzzKzNnJzNnJzNnJzNnJzzzzzzlu',
    'ulzzzKKKKKKKKKKKKKKKKKKKKKzzlu',
    'ulzzzzzzzzzzzzzzzzzzzzzzzzzzlu',
    'ulzzzzzzzzzzzzzzzzzzzzzzzzzzlu',
    'ullllllllllllllllllllllllllllu',
    'uuuuuuuuuuuuuuuuuuuuuuuuuuuuuu',
    '.oooooooooooooooooooooooooooo.',
    '.uuuuuuuuuuuuuuuuuuuuuuuuuuuu.',
    '....lu........kk........lu....',
    '....lu........kk........lu....',
    '....lu........kk........lu....',
    '...lu.........kk.........lu...',
    '...lu.........kk.........lu...',
    '...lu.........kk.........lu...',
    '...lu.........kk.........lu...',
    '..lu..........kk..........lu..',
    '..lu..........kk..........lu..',
    '..lu..........kk..........lu..',
    '..lu..........kk..........lu..',
    '.lu...........kk...........lu.',
    '.lu........................lu.',
    'kkk........................kkk',
  ],
};

/** The newest year's bar, 3x14, growing past the last year's, then holding. Its still is the full bar. */
const barFrame = (h: number) => Array.from({ length: 14 }, (_, y) => (y >= 14 - h ? 'NnJ' : '...'));
const newBar: PixelSprite = {
  id: 'ge4-opener-new-bar',
  name: 'newest bar',
  tags: ['ge4', 'animated'],
  blurb: 'An emerald bar on the chart growing taller than the one before it.',
  palette: GE_PALETTE,
  rows: barFrame(14),
  frames: [barFrame(10), barFrame(12), barFrame(14), barFrame(14)],
  frameMs: 700,
};

/** A long pointer, 5x14, held up from the student's hand to the foot of the newest bar. */
const pointer: PixelSprite = {
  id: 'ge4-opener-pointer',
  name: 'pointer',
  tags: ['ge4', 'prop'],
  blurb: 'A long wooden pointer with a pale tip.',
  palette: GE_PALETTE,
  rows: [
    'y....',
    'g....',
    'g....',
    'g....',
    '.g...',
    '.g...',
    '.g...',
    '..g..',
    '..g..',
    '..g..',
    '...g.',
    '...g.',
    '...g.',
    '....g',
  ],
};

/** A banker's lamp, 11x13: emerald shade, the bulb's glow under it, brass stem and foot. */
const lamp: PixelSprite = {
  id: 'ge4-opener-lamp',
  name: "banker's lamp",
  tags: ['ge4', 'prop'],
  blurb: "A banker's lamp with an emerald shade and a brass stand, lit.",
  palette: GE_PALETTE,
  rows: [
    '..JJJJJJJ..',
    '.JmNNNNNnJ.',
    'JmNNNNNNNnJ',
    'JJJJJJJJJJJ',
    '...y555y...',
    '.....O.....',
    '.....O.....',
    '.....O.....',
    '.....O.....',
    '.....O.....',
    '....OgO....',
    '..OOOGOOO..',
    '.OOOOOOOOO.',
  ],
};

/** The lamp's light on the desk top. */
const lampPool: PixelSprite = {
  id: 'ge4-opener-lamp-pool',
  name: 'lamp light',
  tags: ['ge4'],
  palette: GE_PALETTE,
  rows: [
    '....oooooooooo...',
    '.ooooooooooooooo.',
    'ooooooooooooooooo',
  ],
};

/** Three books lying flat, 10x6, page edges showing. */
const books: PixelSprite = {
  id: 'ge4-opener-books',
  name: 'books',
  tags: ['ge4', 'prop'],
  blurb: 'A stack of three books, red, blue and green.',
  palette: GE_PALETTE,
  rows: [
    'rrrrrrrrr1.',
    'zzzzzzzzzr.',
    '.bbbbbbbbbh',
    '.zzzzzzzzzb',
    'nnnnnnnnnJ.',
    'zzzzzzzzzn.',
  ],
};

/** A red mug, 5x4. */
const mug: PixelSprite = {
  id: 'ge4-opener-mug',
  name: 'mug',
  tags: ['ge4', 'prop'],
  blurb: 'A red mug.',
  palette: GE_PALETTE,
  rows: [
    '1rr1.',
    'rRRrr',
    'rRRr.',
    '1rr1.',
  ],
};

/* ── the opener ─────────────────────────────────────────────────────────────────────────────── */

const EASEL = { x: 4, y: 6 };
/** Where the student stands, in front of the desk's end; the pointer leaves the raised hand. */
const STUDENT = { x: 30, y: 34 };

const base = geCompose('ge4-opener-base', geGroundStudy, [
  { sprite: easel, x: EASEL.x, y: EASEL.y },
  { sprite: lampPool, x: 62, y: 42 },
  { sprite: lamp, x: 66, y: 32 },
  { sprite: books, x: 53, y: 39 },
  { sprite: mug, x: 47, y: 41 },
  { sprite: geShadow, x: STUDENT.x + 7, y: STUDENT.y + 24 },
  { sprite: geStudent, x: STUDENT.x, y: STUDENT.y },
]);

const steam = geTint(geSmoke, 'ge4-opener-steam', { X: 'x' });
/** A ship's light far out, seen through the window. */
const shipLight = geTint(geStar, 'ge4-opener-ship-light', { z: 'G' });

export const ge4Opener: SceneArt = {
  id: 'ge4-opener',
  label: 'In a study at dusk, a student points up at a bar chart on an easel where each bar is taller than the last and the newest bar is still growing, beside a desk with a green lamp.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: newBar, x: EASEL.x + 23, y: EASEL.y + 19 - 14 },
    { sprite: geSparkle, x: EASEL.x + 22, y: EASEL.y + 0, motion: { kind: 'twinkle', periodMs: 1800, min: 0.4 } },
    { sprite: pointer, x: STUDENT.x - 2, y: STUDENT.y - 8 },
    { sprite: steam, x: 47, y: 37, motion: { kind: 'rise', amp: 4, periodMs: 2400 } },
    { sprite: steam, x: 48, y: 36, motion: { kind: 'rise', amp: 4, periodMs: 2400, phase: 0.5 } },
    { sprite: geLampGlow, x: 70, y: 36, motion: { kind: 'twinkle', periodMs: 3000, min: 0.5 } },
    { sprite: geStar, x: 50, y: 7, motion: { kind: 'twinkle', periodMs: 2100, phase: 0.3, min: 0.2 } },
    { sprite: geStarBig, x: 63, y: 7, motion: { kind: 'twinkle', periodMs: 2600, min: 0.3 } },
    { sprite: shipLight, x: 66, y: 23, motion: { kind: 'twinkle', periodMs: 3100, phase: 0.6, min: 0.35 } },
  ],
};

/* ── the keepsake ───────────────────────────────────────────────────────────────────────────── */

const BAR_X = [1, 5, 9, 13] as const;

/** The emblem's chart with its four bars at `heights`, a glint on the tallest when `glint`. */
function barsFrame(heights: readonly number[], glint = false): string[] {
  let rows: string[] = Array.from({ length: 16 }, () => '.'.repeat(16));
  rows = geStamp(rows, ['AAAAAAAAAAAAAAAA'], 0, 14);
  heights.forEach((h, i) => {
    for (let y = 14 - h; y < 14; y += 1) rows = geStamp(rows, ['mNn'], BAR_X[i], y);
  });
  if (glint) rows = geStamp(rows, ['z'], BAR_X[3] + 1, 14 - heights[3]);
  return rows;
}

/** Output, measured: four emerald bars growing to full height, the tallest glinting. */
const emblemBars: PixelSprite = {
  id: 'ge4-emblem-bars',
  name: 'emblem bar chart',
  tags: ['ge', 'emblem', 'animated'],
  blurb: 'A small bar chart of four emerald bars rising left to right.',
  palette: GE_PALETTE,
  rows: barsFrame([4, 7, 10, 13]),
  frames: [barsFrame([2, 4, 6, 8]), barsFrame([3, 5, 8, 11]), barsFrame([4, 7, 10, 13]), barsFrame([4, 7, 10, 13], true)],
  frameMs: 650,
};

export const ge4Finish: SceneArt = geKeepsake(
  'ge4-finish',
  'A postage stamp with perforated edges and an emerald frame, showing a bar chart of four emerald bars rising from left to right, with small sparkles around it.',
  emblemBars,
);

export const art: LessonArtSet = { opener: ge4Opener, backdrop: geBackdrop, finish: ge4Finish };
