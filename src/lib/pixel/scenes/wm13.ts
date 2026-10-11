/**
 * Wealth Management lesson 13 (health care planning and HSAs): its opener, the pathway backdrop
 * and its keepsake, as one set loaded on demand.
 *
 * The opener is the house's apothecary: teal-striped walls, an eye chart, a shelf of coloured
 * bottles, and in the middle a white glass-fronted cabinet under a green cross, its shelves
 * stacked with gold that grows from shelf to shelf: the health savings account, invested and left
 * alone for decades. On the left the father files a medical receipt in a shoebox to claim, tax
 * free, years from now. The lesson's triple tax advantage is the motion: three gold ticks over the
 * cabinet light one after another, in, growth, out, then all three together. The cross breathes,
 * gold and glass glint, the receipt goes into the box. The keepsake carries a doctor's bag with a
 * white cross.
 */
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';
import { wmBackdrop } from './wm-backdrop';
import { wmBands, wmCompose, wmParent, WM_INKS } from './wm-kit';
import { wmStripes } from './wm-kit-a';
import { wmKeepsake } from './wm1-finish';

/** The cabinet's top-left; its roundel, gold and glints are placed from it. */
const CAB_X = 28;
const CAB_Y = 20;

/** The ticks' row: three of them, ten apart from this left edge. */
const TICK_X = 26;
const TICK_Y = 5;

const SHELF_X = 57;
const SHELF_Y = 22;

/** A stack of `n` gold coins seen edge on, 6 wide, the top one catching the light. */
const goldStack = (n: number) => Array.from({ length: n }, (_, i) => {
  if (i === 0) return 'yGGGGg';
  return i % 2 === 1 ? 'gggggO' : 'GGGGGg';
});

/**
 * One glass door's view into the cabinet, 8x24: three compartments on two glass shelves (x), each
 * holding one stack, the stacks given by height from the top compartment down.
 */
function pane(heights: readonly [number, number, number]): string[] {
  const rows: string[] = Array.from({ length: 24 }, (_, j) => (j === 7 || j === 15 ? 'xxxxxxxx' : 'kkkkkkkk'));
  const floors = [6, 14, 23];
  heights.forEach((n, c) => {
    goldStack(n).forEach((ink, i) => {
      rows[floors[c] - n + 1 + i] = `k${ink}k`;
    });
  });
  return rows;
}

const LEFT_PANE = pane([2, 3, 5]);
const RIGHT_PANE = pane([3, 5, 7]);

/** The health savings cabinet: a white cornice, two glass doors on gold, a drawer, a plinth. 24x35. */
const cabinet: PixelSprite = {
  id: 'wm13-opener-cabinet',
  name: 'wm13-opener-cabinet',
  tags: ['scene', 'wm13'],
  rows: [
    `.x${'w'.repeat(20)}X.`,
    `x${'w'.repeat(22)}X`,
    `${'X'.repeat(23)}D`,
    `.x${'w'.repeat(20)}D.`,
    ...LEFT_PANE.map((left, j) => `.xw${left}ww${RIGHT_PANE[j]}wD.`),
    `.x${'w'.repeat(20)}D.`,
    `.x${'X'.repeat(20)}D.`,
    `.x${'w'.repeat(9)}yG${'w'.repeat(9)}D.`,
    `.x${'w'.repeat(20)}D.`,
    `${'X'.repeat(23)}D`,
    'D'.repeat(24),
    `.KK${'.'.repeat(18)}KK.`,
  ],
};

/** A white roundel with the green cross, standing on the cabinet's cornice. 8x8. */
const roundel: PixelSprite = {
  id: 'wm13-opener-roundel',
  name: 'wm13-opener-roundel',
  tags: ['scene', 'wm13'],
  rows: ['..xwwX..', '.xwNNwX.', 'xwwNNwwX', 'wNNNNNNX', 'wNNNNNNX', 'xwwNNwwX', '.xwNNwX.', '..XXXX..'],
};

/** A tick lit gold, two pixels thick. 7x5. */
const TICK = ['.....yG', '....yGg', 'yG.yGg.', 'gGyGg..', '.gGg...'];

/** The same tick unlit, in the deep golds, so all three are always there to be lit. */
const tickDim: PixelSprite = {
  id: 'wm13-opener-tick-dim',
  name: 'wm13-opener-tick-dim',
  tags: ['scene', 'wm13'],
  rows: TICK.map((row) => row.replace(/y/g, 'g').replace(/[Gg]/g, (ch) => (ch === 'G' ? 'g' : 'O'))),
};

/** An apothecary bottle: cork, neck, a body with a white glint. 3x6. */
const bottle = (light: string, dark: string) => ['.C.', `.${dark}.`, `${light}${light}${dark}`, `w${light}${dark}`, `${light}${dark}${dark}`, `${dark}${dark}${dark}`];

/** A squat jar with a lid. 4x4. */
const jar = (light: string, dark: string) => ['CCCU', `${light}${light}${light}${dark}`, `w${light}${light}${dark}`, `${dark}${dark}${dark}${dark}`];

/** The bottles on the shelf, [rows, x, bottom row] in the shelf's own pixels. */
const BOTTLES: readonly (readonly [readonly string[], number, number])[] = [
  [bottle('R', 'r'), 2, 9],
  [jar('B', 'b'), 6, 9],
  [bottle('N', 'n'), 12, 9],
  [jar('G', 'g'), 2, 19],
  [bottle('P', 'p'), 8, 19],
  [bottle('T', 't'), 13, 19],
  [jar('q', 'p'), 3, 29],
  [bottle('B', 'b'), 10, 29],
  [jar('R', 'r'), 14, 29],
];

/** An open shelf of dark wood, three compartments, bottles and jars on each. 20x33. */
const shelfRows = [
  `${'C'.repeat(19)}U`,
  `${'U'.repeat(19)}O`,
  ...[0, 1, 2].flatMap((c) => [
    ...Array.from({ length: 8 }, () => `U${'K'.repeat(18)}O`),
    ...(c < 2 ? [`U${'C'.repeat(18)}O`, `U${'O'.repeat(18)}O`] : []),
  ]),
  'O'.repeat(20),
  'O'.repeat(20),
  `KK${'.'.repeat(16)}KK`,
].map((row) => [...row]);
for (const [rows, x, bottom] of BOTTLES) {
  rows.forEach((row, j) => {
    [...row].forEach((ch, i) => {
      if (ch !== '.') shelfRows[bottom - rows.length + 1 + j][x + 1 + i] = ch;
    });
  });
}
const shelf: PixelSprite = {
  id: 'wm13-opener-shelf',
  name: 'wm13-opener-shelf',
  tags: ['scene', 'wm13'],
  palette: WM_INKS,
  rows: shelfRows.map((row) => row.join('')),
};

/** A shoebox of receipts with its lid off: rim, slips inside, the front. 10x5. */
const shoebox: PixelSprite = {
  id: 'wm13-opener-shoebox',
  name: 'wm13-opener-shoebox',
  tags: ['scene', 'wm13'],
  palette: WM_INKS,
  rows: ['CCCCCCCCCU', 'CwxKwxKwKU', 'UUUUUUUUUO', 'UCCCCCCCUO', 'OOOOOOOOOO'],
};

/** An optician's chart on the wall: letters shrinking line by line down to the red line. 10x15. */
const eyeChart: PixelSprite = {
  id: 'wm13-opener-eye-chart',
  name: 'wm13-opener-eye-chart',
  tags: ['scene', 'wm13'],
  rows: [
    'XxxxxxxxxD',
    'xwwwwwwwwD',
    'xwwkkkwwwD',
    'xwwkkwwwwD',
    'xwwkkkwwwD',
    'xwwwwwwwwD',
    'xwkkwkkwwD',
    'xwwwwwwwwD',
    'xwkwkwkwwD',
    'xwwwwwwwwD',
    'xwkwkwkwkD',
    'xwwwwwwwwD',
    'xwrrrrrrwD',
    'xwwwwwwwwD',
    'XXXXXXXXXD',
  ],
};

const base = wmCompose('wm13-opener-base', [
  ...wmBands(80, [['K', 2], ['D', 1], ['k', 1]]),
  ...wmStripes(80, 37, 'h', 't', 8),
  ...wmBands(80, [['U', 1], ['O', 1], ['K', 1], ['k', 4], ['D', 1], ['k', 4], ['D', 1], ['k', 6]]),
], [
  { sprite: tickDim, x: TICK_X, y: TICK_Y },
  { sprite: tickDim, x: TICK_X + 10, y: TICK_Y },
  { sprite: tickDim, x: TICK_X + 20, y: TICK_Y },
  { sprite: eyeChart, x: 7, y: 14 },
  { sprite: roundel, x: CAB_X + 8, y: CAB_Y - 8 },
  { sprite: cabinet, x: CAB_X, y: CAB_Y },
  { sprite: shelf, x: SHELF_X, y: SHELF_Y },
  { sprite: wmParent, x: 8, y: 42 },
  { sprite: shoebox, x: 16, y: 50 },
]);

/* ── the triple advantage: in, growth, out ────────────────────────────────────────────────────── */

/** The ticks' layer with the first `lit` ticks lit; `flash` adds a white glint to each tip. 27x5. */
function ticksFrame(lit: number, flash = false): string[] {
  const grid = wmBands(27, [['.', 5]]).map((row) => [...row]);
  for (let t = 0; t < lit; t += 1) {
    TICK.forEach((row, j) => {
      [...row].forEach((ch, i) => {
        if (ch !== '.') grid[j][10 * t + i] = ch;
      });
    });
    if (flash) grid[0][10 * t + 6] = 'W';
  }
  return grid.map((row) => row.join(''));
}

const ticks: PixelSprite = {
  id: 'wm13-opener-ticks',
  name: 'wm13-opener-ticks',
  tags: ['scene', 'wm13'],
  blurb: 'Three gold ticks lighting in turn: tax free in, tax free growth, tax free out.',
  rows: ticksFrame(3),
  frames: [ticksFrame(1), ticksFrame(2), ticksFrame(3), ticksFrame(3, true), ticksFrame(3), ticksFrame(0), ticksFrame(0)],
  frameMs: 560,
};

/** The receipt leaving the father's hand, arcing over and dropping into the shoebox. 10x7. */
const RECEIPT = ['wx', 'xX'];
function receiptAt(x: number, y: number): string[] {
  const grid = wmBands(10, [['.', 7]]).map((row) => [...row]);
  RECEIPT.forEach((row, j) => {
    [...row].forEach((ch, i) => {
      grid[y + j][x + i] = ch;
    });
  });
  return grid.map((row) => row.join(''));
}
const noReceipt = wmBands(10, [['.', 7]]);
const receipt: PixelSprite = {
  id: 'wm13-opener-receipt',
  name: 'wm13-opener-receipt',
  tags: ['scene', 'wm13'],
  rows: receiptAt(1, 4),
  frames: [receiptAt(1, 4), receiptAt(3, 1), receiptAt(5, 0), receiptAt(6, 3), receiptAt(6, 5), noReceipt, noReceipt],
  frameMs: 480,
};

/** The cross lit brighter, over the roundel's. */
const crossGlow: PixelSprite = {
  id: 'wm13-opener-cross-glow',
  name: 'wm13-opener-cross-glow',
  tags: ['scene', 'wm13'],
  rows: ['..mm..', '..mm..', 'mmmmmm', 'mmmmmm', '..mm..', '..mm..'],
};

/** Glints on the tallest stacks of gold. */
const goldGlint: PixelSprite = {
  id: 'wm13-opener-gold-glint',
  name: 'wm13-opener-gold-glint',
  tags: ['scene', 'wm13'],
  rows: ['W..........', '...........', '...........', '...........', '...........', '..........W'],
};

/** A glint on the glass, high on the left door. */
const glassGlint: PixelSprite = {
  id: 'wm13-opener-glass-glint',
  name: 'wm13-opener-glass-glint',
  tags: ['scene', 'wm13'],
  rows: ['x.', '.x', '.x'],
};

export const wm13Opener: SceneArt = {
  id: 'wm13-opener',
  label: 'In an apothecary a white cabinet under a green cross holds growing stacks of gold as three gold ticks above it light one after another, while a father files a receipt in a shoebox to claim later.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: ticks, x: TICK_X, y: TICK_Y },
    { sprite: receipt, x: 13, y: 44 },
    { sprite: crossGlow, x: CAB_X + 9, y: CAB_Y - 7, motion: { kind: 'twinkle', periodMs: 3000, min: 0.25 } },
    { sprite: goldGlint, x: CAB_X + 4, y: CAB_Y + 16, motion: { kind: 'twinkle', periodMs: 2200, min: 0.15 } },
    { sprite: glassGlint, x: CAB_X + 4, y: CAB_Y + 5, motion: { kind: 'twinkle', periodMs: 3600, phase: 0.5, min: 0.2 } },
  ],
};

/** A doctor's bag with a white cross: health care paid for. */
const emblemBag: PixelSprite = {
  id: 'wm13-emblem-bag',
  name: 'wm13-emblem-bag',
  tags: ['scene', 'wm13'],
  rows: [
    '....yGGGGg....',
    '...yG....Gg...',
    '..yyGGGGGGgg..',
    '.yGGGGGGGGGGg.',
    'yGGGGGwwGGGGgg',
    'yGGGGGwwGGGGgg',
    'yGGGwwwwwwGGgg',
    'yGGGwwwwwwGGgg',
    'yGGGGGwwGGGGgg',
    'yGGGGGwwGGGGgg',
    'gGGGGGGGGGGggO',
    '.ggggggggggOO.',
  ],
};

export const wm13Finish: SceneArt = wmKeepsake(
  'wm13-finish',
  emblemBag,
  'A green crest with a gold rim bearing a doctor\'s bag marked with a white cross, framed by laurel over a purple banner, with sparkles around it.',
);

export const art: LessonArtSet = { opener: wm13Opener, backdrop: wmBackdrop, finish: wm13Finish };
