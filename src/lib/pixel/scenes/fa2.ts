/**
 * Financial Analytics lesson 2, descriptive statistics: the shape of a year's returns.
 *
 * OPENER. A close-up of one machine: the sorting board, a tall glass bean machine fed from the
 * ceiling chute. Yearly returns drop through the pegs and stack in eleven bins into the lesson's
 * picture of annual stock returns, lopsided the way they really fall: a long low red tail of crash
 * years on the left, the teal body piled up right of centre, a short green gains tail. Because the
 * crash years drag it, the gold dashed mean sits left of the white dashed median, and both sit left
 * of the tallest bin, the mode: the typical year beats the average year. A bright white bracket on
 * the scale spans one standard deviation either side of the mean. The histogram builds itself and
 * clears; the analyst checks it on the tablet, and the map lights ANALYZE.
 *
 * KEEPSAKE. The trophy with the same lopsided histogram in thin bars: a long flat red crash tail,
 * the gold dashed mean just left of the tallest bar, a white bracket for one standard deviation.
 */
import { faBackdrop } from './fa-backdrop';
import { faAnalyst, faCompose, faDrawnChart, faFalling, faPipelineMap, faTabletLine, FA_ANALYST_TABLET } from './fa-kit';
import { faDrawnBy, faKeepsake, faRoom, faStageLight } from './fa-kit-a';
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';

/* ── the sorting board ─────────────────────────────────────────────────────────────────────── */

const GLASS_W = 43;
/** Every bin is a 3px stack and a 1px divider. */
const BIN = 4;
/**
 * Stack heights, bin by bin: skewed left, the way annual returns fall. The mean is bin 6.05, the
 * median falls exactly on the divider between bins 6 and 7, the mode is bin 7, and one standard
 * deviation is 2.4 bins.
 */
const HEIGHTS = [2, 2, 3, 4, 6, 9, 13, 17, 14, 6, 2];
/** In glass pixels: the mean (centre of bin 6), the median (the 6 and 7 divider), one SD either side. */
const STATS = { mean: 25, median: 27, sdFrom: 16, sdTo: 35 } as const;

/** 49 x 37. Glass from (3, 4): pegs on rows 5, 7 and 9, bins from row 11, the scale on row 31. */
const board: PixelSprite = (() => {
  const span = (inside: string) => `DxD${inside}DkD`;
  const glass = (at: (x: number) => string) => span(Array.from({ length: GLASS_W }, (_, x) => at(x)).join(''));
  const pegs = (from: number) => glass((x) => (x >= from && (x - from) % 6 === 0 ? 'x' : 'K'));
  const open = glass(() => 'K');
  const bins = glass((x) => (x % BIN === BIN - 1 ? 'D' : 'K'));
  // The scale (s is glass x + 1): a bright white bracket one standard deviation either side of the
  // mean, its ends turned up into the floor above, and the gold mean tick inside it.
  const sd = (s: number) => s >= STATS.sdFrom + 1 && s <= STATS.sdTo + 1;
  const scale = Array.from({ length: 45 }, (_, s) => (s === STATS.mean + 1 ? 'y' : sd(s) ? 'w' : 'X')).join('');
  const floor = Array.from({ length: 45 }, (_, s) => (s === STATS.sdFrom + 1 || s === STATS.sdTo + 1 ? 'w' : 'D')).join('');
  return {
    id: 'fa2-board',
    name: 'sorting board',
    tags: ['scene', 'fa2', 'station'],
    blurb: 'A glass bean machine: pegs above, eleven bins below, a scale along the foot.',
    rows: [
      `.${'D'.repeat(47)}.`,
      `Dxw${'x'.repeat(18)}DKKKKKD${'x'.repeat(18)}XkD`,
      `Dx${'X'.repeat(19)}DKKKKKD${'X'.repeat(19)}kD`,
      `Dx${'D'.repeat(20)}KKKKK${'D'.repeat(20)}kD`,
      open, pegs(2), open, pegs(5), open, pegs(2), open, open,
      ...Array.from({ length: 18 }, () => bins),
      `Dx${floor}kD`,
      `Dx${scale}kD`,
      `D${'T'.repeat(46)}tD`,
      `Dx${'X'.repeat(45)}kD`,
      `Dx${'X'.repeat(45)}kD`,
      'D'.repeat(49),
      `.DkD${'.'.repeat(41)}DkD.`,
    ],
  };
})();

const chute: PixelSprite = {
  id: 'fa2-chute',
  name: 'chute',
  tags: ['scene', 'fa2', 'prop'],
  rows: [
    '.DxXXXkD.',
    '.DxXXXkD.',
    '.DxXXXkD.',
    'DDDDDDDDD',
    '.DxXXXkD.',
    '.DxXXXkD.',
    '.DxXXXkD.',
    '.DxXXXkD.',
    '.DxXXXkD.',
    'DDDDDDDDD',
    '.DxXXXkD.',
    '.DxXXXkD.',
  ],
};

/* Where things stand. The board's glass starts 3px in and 4px down. */
const BOARD = { x: 4, y: 12 } as const;
const GLASS = { x: BOARD.x + 3, y: BOARD.y + 4 } as const;
const MAP = { x: 47, y: 2 } as const;
const ANALYST = { x: 63, y: 33 } as const;

const room = faRoom('fa2-opener-room', [
  [6, 50, 50, 1, 'Z'],
  [6, 51, 48, 1, 'Z'],
  [66, 57, 13, 2, 'Z'],
]);

const base = faCompose('fa2-opener-base', room, [
  [faPipelineMap, MAP.x, MAP.y],
  [chute, BOARD.x + 20, 0],
  [board, BOARD.x, BOARD.y],
  [faAnalyst, ANALYST.x, ANALYST.y],
]);

/** The histogram stacking up bin by bin, holding, then the bins emptying for the next run. */
const histogram: PixelSprite = (() => {
  const ink = (bin: number) => (bin < 3 ? 'RRr' : bin > 8 ? 'NNn' : 'TTt');
  const full = Array.from({ length: 19 }, (_, y) =>
    Array.from({ length: GLASS_W }, (_, x) => {
      const bin = Math.floor(x / BIN);
      return x % BIN < 3 && y >= 19 - HEIGHTS[bin] ? ink(bin)[x % BIN] : '.';
    }).join(''));
  const grow = (k: number) => HEIGHTS.map((h) => Math.ceil((h * k) / 6));
  return faDrawnChart('fa2-histogram', full, HEIGHTS.map((_, b) => [b * BIN, b * BIN + 2] as const), [
    grow(1), grow(2), grow(3), grow(4), grow(5), grow(6), grow(6), grow(6), grow(6), grow(6), grow(6), HEIGHTS.map(() => 0),
  ], 300);
})();

/** The mean: a gold dashed line down bin 6. */
const meanLine: PixelSprite = { id: 'fa2-mean-line', name: 'mean line', tags: ['scene', 'fa2'], rows: Array.from({ length: 19 }, (_, y) => (y % 2 ? '.' : 'y')) };
/** The median: a white dashed line down the divider after bin 6, its dashes between the mean's. */
const medianLine: PixelSprite = { id: 'fa2-median-line', name: 'median line', tags: ['scene', 'fa2'], rows: Array.from({ length: 19 }, (_, y) => (y % 2 ? 'w' : '.')) };

/** Returns dropping from the slot through the pegs. */
const drops = faFalling('fa2-drops', 5, 9, [[0, 0, 'B'], [2, 4, 'B'], [4, 7, 'T'], [1, 6, 'w'], [3, 2, 'B']], 130);

export const fa2Opener: SceneArt = {
  id: 'fa2-opener',
  label: 'A tall glass sorting board in the data works: yearly returns drop through pegs and stack into a lopsided histogram with a long low red tail of crash years, a gold mean line left of a white median line and the tallest bin, and a white bracket one standard deviation either side, while an analyst with a tablet watches.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: histogram, x: GLASS.x, y: GLASS.y + 7 },
    { sprite: meanLine, x: GLASS.x + STATS.mean, y: GLASS.y + 7, motion: { kind: 'twinkle', periodMs: 1700, min: 0.4 } },
    { sprite: medianLine, x: GLASS.x + STATS.median, y: GLASS.y + 7, motion: { kind: 'twinkle', periodMs: 1700, phase: 0.5, min: 0.4 } },
    { sprite: drops, x: GLASS.x + 19, y: GLASS.y },
    faStageLight('analyze', MAP.x, MAP.y),
    { sprite: faTabletLine, x: ANALYST.x + FA_ANALYST_TABLET.x, y: ANALYST.y + FA_ANALYST_TABLET.y },
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────── */

/** The emblem's bars: one pixel wide on every other column, lopsided like the opener's. */
const EMBLEM_BARS = [1, 1, 2, 4, 7, 9, 5, 2];
/** Where the emblem's bars stand, its mean (a gap column, x = 8.65 rounded), and one SD either side. */
const EMBLEM = { floor: 9, mean: 9, sdFrom: 5, sdTo: 12 } as const;

/**
 * LESSON 2: descriptive statistics. Eight thin bars with gaps between them, skewed like real
 * returns: a long flat red crash tail on the left, the teal body tallest right of centre, a short
 * pale gains tail. A gold dashed mean runs down the gap just left of the tallest bar, and along the
 * foot a white bracket spans one standard deviation either side of it. The bars rise, the mean
 * drops in, the bracket is drawn, it holds, the screen clears.
 */
export const faEmblemBell: PixelSprite = (() => {
  const ink = (bar: number) => (bar < 3 ? 'R' : bar === EMBLEM_BARS.length - 1 ? 'm' : 'T');
  const full = Array.from({ length: 11 }, (_, y) =>
    Array.from({ length: 16 }, (_, x) => {
      if (y === EMBLEM.floor + 1) {
        if (x === EMBLEM.mean) return 'y';
        return x >= EMBLEM.sdFrom && x <= EMBLEM.sdTo ? 'w' : '.';
      }
      if (x === EMBLEM.mean) return y >= 1 && y % 2 === 1 ? 'y' : '.';
      const bar = x / 2;
      const h = x % 2 === 0 ? (EMBLEM_BARS[bar] ?? 0) : 0;
      return y <= EMBLEM.floor && y > EMBLEM.floor - h ? ink(bar) : '.';
    }).join(''));
  return {
    ...faDrawnBy('fa-emblem-bell', full, (x, y, ch) => {
      if (y === EMBLEM.floor + 1) return 7;
      if (ch === 'y') return 6;
      return 1 + Math.floor((EMBLEM.floor - y) / 2);
    }, 300, 4),
    name: 'emblem histogram',
    blurb: 'A lopsided histogram with a long red tail, its mean and one standard deviation.',
  };
})();

export const fa2Finish: SceneArt = faKeepsake(
  'fa2-finish',
  'A gold terminal trophy on a purple stand, its screen drawing a lopsided histogram of thin bars with a long flat red tail, a gold dashed mean line beside the tallest bar and a white bracket for one standard deviation, with small sparkles around it.',
  faEmblemBell,
);

export const art: LessonArtSet = { opener: fa2Opener, backdrop: faBackdrop, finish: fa2Finish };
