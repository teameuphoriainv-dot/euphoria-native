/**
 * Financial Analytics lesson 2, descriptive statistics: the shape of a year's returns.
 *
 * OPENER. A close-up of one machine: the sorting board, a tall glass bean machine fed from the
 * ceiling chute. Yearly returns drop through the pegs and stack in eleven bins into the lesson's
 * picture, a bell-shaped distribution: red in the loss tail, teal through the body, green in the
 * gains tail, a gold dashed line at the mean and white ticks on the scale one standard deviation
 * either side. The histogram builds itself and clears; the analyst checks it on the tablet, and
 * the map lights ANALYZE.
 *
 * KEEPSAKE. The trophy with the bell curve: red and green tails, a gold mean marker on top.
 */
import { faBackdrop } from './fa-backdrop';
import { faAnalyst, faCompose, faDrawnChart, faFalling, faPipelineMap, faTabletLine, FA_ANALYST_TABLET } from './fa-kit';
import { faKeepsake, faRoom, faStageLight } from './fa-kit-a';
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';

/* ── the sorting board ─────────────────────────────────────────────────────────────────────── */

const GLASS_W = 43;
/** Every bin is a 3px stack and a 1px divider. */
const BIN = 4;
/** Stack heights, bin by bin: a bell with fat tails, the way annual returns fall. */
const HEIGHTS = [2, 3, 6, 10, 14, 17, 14, 10, 6, 3, 2];

/** 49 x 37. Glass from (3, 4): pegs on rows 5, 7 and 9, bins from row 11, the scale on row 31. */
const board: PixelSprite = (() => {
  const span = (inside: string) => `DxD${inside}DkD`;
  const glass = (at: (x: number) => string) => span(Array.from({ length: GLASS_W }, (_, x) => at(x)).join(''));
  const pegs = (from: number) => glass((x) => (x >= from && (x - from) % 6 === 0 ? 'x' : 'K'));
  const open = glass(() => 'K');
  const bins = glass((x) => (x % BIN === BIN - 1 ? 'D' : 'K'));
  // The scale: a gold tick under the mean, white ticks one standard deviation either side.
  const scale = Array.from({ length: 45 }, (_, s) => (s === 22 ? 'y' : s === 16 || s === 28 ? 'w' : 'X')).join('');
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
      `Dx${'D'.repeat(45)}kD`,
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
  const ink = (bin: number) => (bin < 2 ? 'RRr' : bin > 8 ? 'NNn' : 'TTt');
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

/** The mean: a gold dashed line down the centre bin. */
const meanLine: PixelSprite = { id: 'fa2-mean-line', name: 'mean line', tags: ['scene', 'fa2'], rows: Array.from({ length: 19 }, (_, y) => (y % 2 ? '.' : 'y')) };

/** Returns dropping from the slot through the pegs. */
const drops = faFalling('fa2-drops', 5, 9, [[0, 0, 'B'], [2, 4, 'B'], [4, 7, 'T'], [1, 6, 'w'], [3, 2, 'B']], 130);

export const fa2Opener: SceneArt = {
  id: 'fa2-opener',
  label: 'A tall glass sorting board in the data works: returns drop through pegs and stack into a bell shaped histogram with red and green tails and a gold mean line, while an analyst with a tablet watches.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: histogram, x: GLASS.x, y: GLASS.y + 7 },
    { sprite: meanLine, x: GLASS.x + 21, y: GLASS.y + 7, motion: { kind: 'twinkle', periodMs: 1700, min: 0.4 } },
    { sprite: drops, x: GLASS.x + 19, y: GLASS.y },
    faStageLight('analyze', MAP.x, MAP.y),
    { sprite: faTabletLine, x: ANALYST.x + FA_ANALYST_TABLET.x, y: ANALYST.y + FA_ANALYST_TABLET.y },
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────── */

/**
 * LESSON 2: descriptive statistics. A bell curve, red in the loss tail and green in the gains
 * tail, its rim lit, with a gold marker over the peak for the mean. It rises from the baseline,
 * the mean lands on top and flashes, it holds, the screen clears.
 */
export const faEmblemBell: PixelSprite = (() => {
  const full = [
    '.......yy.......',
    '................',
    '.......mm.......',
    '......mTTm......',
    '......TTTT......',
    '.....mTTTTm.....',
    '.....TTTTTT.....',
    '....mTTTTTTm....',
    '...mTTTTTTTTm...',
    '..RTTTTTTTTTTN..',
    'RRRTTTTTTTTTTNNN',
  ];
  const BELL = [1, 1, 2, 3, 4, 6, 8, 9, 9, 8, 6, 4, 3, 2, 1, 1];
  const grow = (k: number) => BELL.map((h) => Math.ceil((h * k) / 4));
  const withMean = BELL.map((h, x) => (x === 7 || x === 8 ? 11 : h));
  const chart = faDrawnChart('fa-emblem-bell', full, BELL.map((_, x) => [x, x] as const), [
    grow(1), grow(2), grow(3), grow(4), withMean, withMean, withMean, withMean, BELL.map(() => 0),
  ], 320);
  const frames = chart.frames ?? [chart.rows];
  // The mean catches the light on the beat after it lands.
  frames[5] = frames[5].map((row, y) => (y === 0 ? row.replace('yy', 'ww') : row));
  return { ...chart, name: 'emblem bell', tags: ['scene', 'fa', 'emblem'], blurb: 'A bell curve with fat tails and its mean.', frames };
})();

export const fa2Finish: SceneArt = faKeepsake(
  'fa2-finish',
  'A gold terminal trophy on a purple stand, its screen drawing a bell curve with a red tail, a green tail and a gold mean marker, with small sparkles around it.',
  faEmblemBell,
);

export const art: LessonArtSet = { opener: fa2Opener, backdrop: faBackdrop, finish: fa2Finish };
