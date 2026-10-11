/**
 * Wealth Management lesson 8 (advanced tax optimisation): its opener, the pathway backdrop and its
 * keepsake, as one set loaded on demand.
 *
 * The opener is the house's library: a wall of the kit's bookcases under a brass chandelier. The
 * advisor stands at an easel and points to a chalkboard with two bars on it, the tax the family
 * pays in red and what it keeps in gold. Beside them, on a pedestal table, a pair of brass scales
 * holds a red weight against a pan of coins. The lesson's strategies (harvesting losses, Roth
 * conversions, giving shares, timing income) are the motion: the red bar steps down as the gold
 * bar steps up, and the scales tip toward the coins. The chandelier's candles flicker. The
 * keepsake carries the scales emblem from wm-kit-a.ts, which lesson 16 shares.
 */
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';
import { wmBackdrop } from './wm-backdrop';
import { wmBands, wmCompose, wmLater, WM_INKS } from './wm-kit';
import { wmAdvisorPointing, wmBookcase, wmCandleFlame, wmEmblemScales } from './wm-kit-a';
import { wmKeepsake } from './wm1-finish';

/** The chalkboard's top-left in the scene; the chalk and the bars are placed from it. */
const BOARD_X = 24;
const BOARD_Y = 24;
const BOARD_W = 28;
const BOARD_H = 20;
const CHANDELIER_X = 33;

/** Floorboards under a shadow line. 80x14. */
const floor = Array.from({ length: 14 }, (_, j) => {
  if (j === 0) return 'K'.repeat(80);
  return j % 4 === 1 ? 'U'.repeat(80) : 'O'.repeat(80);
});

/** A green chalkboard in a wooden frame lit along its top and left. 28x20. */
const board: PixelSprite = {
  id: 'wm8-opener-board',
  name: 'wm8-opener-board',
  tags: ['scene', 'wm8'],
  palette: WM_INKS,
  rows: Array.from({ length: BOARD_H }, (_, j) =>
    Array.from({ length: BOARD_W }, (_, i) => {
      if (j === 0 || i === 0) return 'C';
      if (j === BOARD_H - 1 || i === BOARD_W - 1) return 'O';
      if (j === 1 || i === 1 || j === BOARD_H - 2 || i === BOARD_W - 2) return 'U';
      return 'h';
    }).join(''),
  ),
};

/** Chalk on the board: a scrawled heading and the chart's two axes. 20x15. */
const chalk: PixelSprite = {
  id: 'wm8-opener-chalk',
  name: 'wm8-opener-chalk',
  tags: ['scene', 'wm8'],
  rows: [
    '..XXX.XX.XXXX.......',
    ...Array.from({ length: 13 }, () => `x${'.'.repeat(19)}`),
    'x'.repeat(20),
  ],
};

/** One of the easel's two posts, running behind the board to the floor. 2x36. */
const easelPost: PixelSprite = {
  id: 'wm8-opener-easel-post',
  name: 'wm8-opener-easel-post',
  tags: ['scene', 'wm8'],
  palette: WM_INKS,
  rows: Array.from({ length: 36 }, () => 'UO'),
};

/** The chalk ledge under the board, a stick of chalk on it. 28x2. */
const ledge: PixelSprite = {
  id: 'wm8-opener-ledge',
  name: 'wm8-opener-ledge',
  tags: ['scene', 'wm8'],
  palette: WM_INKS,
  rows: ['CCCCCCCCCCCCCCCCCCCwwCCCCCCU', `${'O'.repeat(27)}K`],
};

/** A pedestal table for the scales. 15x11. */
const pedestalTable: PixelSprite = {
  id: 'wm8-opener-pedestal-table',
  name: 'wm8-opener-pedestal-table',
  tags: ['scene', 'wm8'],
  palette: WM_INKS,
  rows: [
    'CCCCCCCCCCCCCCU',
    'UUUUUUUUUUUUUUO',
    '.KKKKKKKKKKKKK.',
    '......UOK......',
    '......UOK......',
    '......UOK......',
    '......UOK......',
    '......UOK......',
    '.....UUOKK.....',
    '...UUOOOOKKK...',
    '..UO.......OK..',
  ],
};

/** A brass chandelier on a chain from the ceiling, four candles on its ring. 15x11. */
const chandelier: PixelSprite = {
  id: 'wm8-opener-chandelier',
  name: 'wm8-opener-chandelier',
  tags: ['scene', 'wm8'],
  rows: [
    '.......O.......',
    '.......O.......',
    '.......O.......',
    '.......O.......',
    '.k...k.O.k...k.',
    '.w...w.O.w...w.',
    '.x...x.g.x...x.',
    'yGg.yGgGyGg.yGg',
    '.gGGGGGGGGGGGg.',
    '......gGg......',
    '.......O.......',
  ],
};

const base = wmCompose('wm8-opener-base', [...wmBands(80, [['K', 2], ['D', 1], ['k', 43]]), ...floor], [
  ...[0, 16, 32, 48, 64].map((x) => ({ sprite: wmBookcase, x, y: 7 })),
  { sprite: chandelier, x: CHANDELIER_X, y: 0 },
  { sprite: easelPost, x: BOARD_X + 3, y: BOARD_Y - 2 },
  { sprite: easelPost, x: BOARD_X + BOARD_W - 5, y: BOARD_Y - 2 },
  { sprite: board, x: BOARD_X, y: BOARD_Y },
  { sprite: chalk, x: BOARD_X + 4, y: BOARD_Y + 2 },
  { sprite: ledge, x: BOARD_X, y: BOARD_Y + BOARD_H },
  { sprite: wmAdvisorPointing, x: 13, y: 43 },
  { sprite: pedestalTable, x: 57, y: 46 },
]);

/** One row of a bar `height` tall in a 12-row chart, `top` on its first row. */
function barRow(j: number, height: number, top: string, body: string): string {
  if (j < 12 - height) return '.....';
  return j === 12 - height ? top : body;
}

/** The tax bar (red) and the kept bar (gold) at the given heights. 14x12. */
const chart = (tax: number, kept: number) =>
  Array.from({ length: 12 }, (_, j) => `${barRow(j, tax, 'sRRRr', 'RRRRr')}....${barRow(j, kept, 'yyyGg', 'yGGGg')}`);

/** The two bars trading places: tax down a step, wealth kept up a step, then a hold. */
const bars: PixelSprite = {
  id: 'wm8-opener-bars',
  name: 'wm8-opener-bars',
  tags: ['scene', 'wm8'],
  blurb: 'The red tax bar stepping down as the gold bar of wealth kept steps up.',
  rows: chart(6, 11),
  frames: [chart(12, 5), chart(10, 7), chart(8, 9), chart(6, 11), chart(6, 11), chart(6, 11)],
  frameMs: 650,
};

const SCALES_LEVEL = [
  '.......y.......',
  '..yGGGGGGGGGg..',
  '..g....G....g..',
  '..g....G....g..',
  '.rRr...G...yGg.',
  'gGGGg..G..gGGGg',
  '.ggg...G...ggg.',
  '.......G.......',
  '.......G.......',
  '......yGg......',
  '.....yGGGg.....',
  '....OOOOOOO....',
];
const SCALES_TIPPED = [
  '..yGG..y.......',
  '..g..GGGGG.....',
  '..g....G..GGg..',
  '.rRr...G....g..',
  'gGGGg..G....g..',
  '.ggg...G...yGg.',
  '.......G..gGGGg',
  '.......G...ggg.',
  '.......G.......',
  '......yGg......',
  '.....yGGGg.....',
  '....OOOOOOO....',
];

/** Brass scales, a red weight against a pan of coins, settling toward the coins. 15x12. */
const scales: PixelSprite = {
  id: 'wm8-opener-scales',
  name: 'wm8-opener-scales',
  tags: ['scene', 'wm8'],
  rows: SCALES_TIPPED,
  frames: [SCALES_LEVEL, SCALES_TIPPED, SCALES_TIPPED, SCALES_TIPPED, SCALES_LEVEL],
  frameMs: 700,
};

export const wm8Opener: SceneArt = {
  id: 'wm8-opener',
  label: 'In a library the advisor points to a chalkboard where a red tax bar shrinks as a gold bar grows, beside brass scales tipping toward a pan of coins.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: bars, x: BOARD_X + 7, y: BOARD_Y + 4 },
    { sprite: scales, x: 57, y: 34 },
    { sprite: wmCandleFlame, x: CHANDELIER_X + 1, y: 1 },
    { sprite: wmLater(wmCandleFlame, 'wm8-opener-flame-2', 1, 300), x: CHANDELIER_X + 5, y: 1 },
    { sprite: wmLater(wmCandleFlame, 'wm8-opener-flame-3', 2, 260), x: CHANDELIER_X + 9, y: 1 },
    { sprite: wmLater(wmCandleFlame, 'wm8-opener-flame-4', 3, 320), x: CHANDELIER_X + 13, y: 1 },
  ],
};

export const wm8Finish: SceneArt = wmKeepsake(
  'wm8-finish',
  wmEmblemScales,
  'A green crest with a gold rim bearing a pair of scales, framed by laurel over a purple banner, with sparkles around it.',
);

export const art: LessonArtSet = { opener: wm8Opener, backdrop: wmBackdrop, finish: wm8Finish };
