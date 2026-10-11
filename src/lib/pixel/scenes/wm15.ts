/**
 * Wealth Management lesson 15 (business owner wealth strategies): its opener, the pathway backdrop
 * and its keepsake, as one set loaded on demand.
 *
 * The opener is the family's shop on the high street at night: a brick upper storey with lamplit
 * windows, a green fascia carrying the kit's gold coin mark, an orchid and white awning over a
 * window full of lit goods, the shop door, and a carved sign of the family oak hanging from an iron
 * bracket. The father, its owner, stands outside with his briefcase. The lesson is about moving
 * the business's earnings into the family's wealth on purpose (salary, retirement plans, a planned
 * sale), so the motion is a gold coin hopping out of the shop door in an arc and into his case,
 * again and again. The sign swings, the windows glow, the street lamp flickers, stars twinkle. The
 * keepsake carries a briefcase.
 */
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';
import { wmBackdrop } from './wm-backdrop';
import {
  wmBands,
  wmCompose,
  wmLampFlame,
  wmLampPost,
  wmMarkEarn,
  wmMarkOak,
  wmParent,
  wmStar,
  wmStarDot,
  WM_INKS,
} from './wm-kit';
import { wmAshlar, wmCobbles, wmCottageGlow, wmCottageWindow, wmSkyDots } from './wm-kit-b';
import { wmKeepsake } from './wm1-finish';

/** The shop's left edge; everything on its front is placed from it. */
const SHOP_X = 14;

/** The display window's top-left. */
const SHOW_X = SHOP_X + 2;
const SHOW_Y = 39;

const skyDots = wmSkyDots('wm15-opener-sky-dots', 80, 12, [
  [5, 3, 'X'],
  [21, 1, 'D'],
  [33, 5, 'X'],
  [49, 2, 'D'],
  [62, 6, 'X'],
  [74, 3, 'D'],
]);

/** The white stone parapet over the shop. 52x3. */
const parapet: PixelSprite = {
  id: 'wm15-opener-parapet',
  name: 'wm15-opener-parapet',
  tags: ['scene', 'wm15'],
  rows: [`x${'w'.repeat(50)}X`, `${'X'.repeat(51)}D`, 'D'.repeat(52)],
};

/** The upper storey in dark brick. 52x17. */
const brick: PixelSprite = {
  id: 'wm15-opener-brick',
  name: 'wm15-opener-brick',
  tags: ['scene', 'wm15'],
  rows: wmAshlar(52, 17, '1', 'K', 8, 3),
};

/** The fascia: a green board between gold mouldings, the coin mark at its middle. 52x7. */
const fascia: PixelSprite = {
  id: 'wm15-opener-fascia',
  name: 'wm15-opener-fascia',
  tags: ['scene', 'wm15'],
  palette: WM_INKS,
  rows: [`y${'G'.repeat(50)}g`, ...Array.from({ length: 5 }, () => `g${'h'.repeat(50)}O`), 'O'.repeat(52)],
};

/** The shop's ground floor in wood: lit pilasters (C) with their shadow (O), panels between. 52x15. */
const shopfront: PixelSprite = {
  id: 'wm15-opener-shopfront',
  name: 'wm15-opener-shopfront',
  tags: ['scene', 'wm15'],
  palette: WM_INKS,
  rows: Array.from({ length: 15 }, () =>
    Array.from({ length: 52 }, (_, x) => {
      if (x === 0 || x === 30 || x === 40) return 'C';
      return x === 1 || x === 31 || x === 41 ? 'O' : 'U';
    }).join(''),
  ),
};

/** The striped awning over the window, scalloped along its hem. 29x4. */
const awning: PixelSprite = {
  id: 'wm15-opener-awning',
  name: 'wm15-opener-awning',
  tags: ['scene', 'wm15'],
  rows: Array.from({ length: 4 }, (_, j) =>
    Array.from({ length: 29 }, (_, x) => {
      if (j === 3 && x % 3 === 2) return '.';
      if (j === 0) return 'p';
      return Math.floor(x / 3) % 2 === 0 ? 'P' : 'Q';
    }).join(''),
  ),
};

/** The display window: two panes of lit goods, jars on a shelf, coins on the counter. 27x10. */
const PANE_LEFT = [
  'gggggggggggg',
  'gCUgggCUgggg',
  'gUUgggUUggCg',
  'gUUgggUUggUg',
  'OOOOOOOOOOOO',
  'ggggyGgggggg',
  'gggGGgggUUgg',
  'gggGgggUUUUg',
];
const PANE_RIGHT = [
  'gggggggggggg',
  'ggCUggCUgggg',
  'ggUUggUUgCUg',
  'ggUUggUUgUUg',
  'OOOOOOOOOOOO',
  'ggyGgggggggg',
  'ggGGgyGggggg',
  'ggGggGGggggg',
];
const showWindow: PixelSprite = {
  id: 'wm15-opener-show-window',
  name: 'wm15-opener-show-window',
  tags: ['scene', 'wm15'],
  palette: WM_INKS,
  rows: [`U${'C'.repeat(25)}U`, ...PANE_LEFT.map((left, j) => `U${left}U${PANE_RIGHT[j]}U`), 'x'.repeat(27)],
};

/** The shop door: a lit fanlight, a glazed upper half, panels, a brass knob, the step. 8x15. */
const door: PixelSprite = {
  id: 'wm15-opener-door',
  name: 'wm15-opener-door',
  tags: ['scene', 'wm15'],
  palette: WM_INKS,
  rows: [
    'UCCCCCCU',
    'UyGGGGgU',
    'UCCCCCCU',
    'UCyGGgOU',
    'UCGGGgOU',
    'UCGGggOU',
    'UCggggOU',
    'UCCCCCOU',
    'UCUUUUOU',
    'UCUUUUOU',
    'UCUUUGOU',
    'UCUUUUOU',
    'UCUUUUOU',
    'UCCCCCOU',
    'xxxxxxxx',
  ],
};

/** A dark neighbour's front, `width` x `height`, lit down the edge that faces the shop's lamp. */
function neighbour(id: string, width: number, height: number, litLeft: boolean): PixelSprite {
  const face = 'k'.repeat(width - 1);
  return {
    id,
    name: id,
    tags: ['scene', 'wm15'],
    rows: ['D'.repeat(width), ...Array.from({ length: height - 1 }, () => (litLeft ? `D${face}` : `${face}K`))],
  };
}

/** The iron bracket the shop's sign hangs from, with its brace. 12x4. */
const bracket: PixelSprite = {
  id: 'wm15-opener-bracket',
  name: 'wm15-opener-bracket',
  tags: ['scene', 'wm15'],
  rows: ['XXXXXXXXXXXX', '.........X..', '..........X.', '...........X'],
};

/** The owner's briefcase, held at his side. 5x4. */
const briefcase: PixelSprite = {
  id: 'wm15-opener-briefcase',
  name: 'wm15-opener-briefcase',
  tags: ['scene', 'wm15'],
  palette: WM_INKS,
  rows: ['.UCU.', 'CCCCU', 'CCyCU', 'UUUUO'],
};

const base = wmCompose('wm15-opener-base', wmBands(80, [['K', 50], ['D', 2], ['X', 1], ['k', 7]]), [
  { sprite: skyDots, x: 0, y: 0 },
  { sprite: neighbour('wm15-opener-left-house', 14, 41, false), x: 0, y: 9 },
  { sprite: neighbour('wm15-opener-right-house', 14, 37, true), x: 66, y: 13 },
  { sprite: wmCottageWindow, x: 3, y: 11 },
  { sprite: wmCottageWindow, x: 3, y: 33 },
  { sprite: wmCottageWindow, x: 70, y: 18 },
  { sprite: parapet, x: SHOP_X, y: 8 },
  { sprite: brick, x: SHOP_X, y: 11 },
  { sprite: wmCottageWindow, x: SHOP_X + 8, y: 15 },
  { sprite: wmCottageWindow, x: SHOP_X + 37, y: 15 },
  { sprite: fascia, x: SHOP_X, y: 28 },
  { sprite: wmMarkEarn, x: SHOP_X + 22, y: 29 },
  { sprite: shopfront, x: SHOP_X, y: 35 },
  { sprite: awning, x: SHOP_X + 1, y: 35 },
  { sprite: showWindow, x: SHOW_X, y: SHOW_Y },
  { sprite: door, x: SHOP_X + 32, y: 35 },
  { sprite: bracket, x: 3, y: 20 },
  { sprite: { id: 'wm15-opener-road', name: 'wm15-opener-road', tags: ['scene', 'wm15'], rows: wmCobbles(80, 7) }, x: 0, y: 53 },
  { sprite: wmLampPost, x: 71, y: 27 },
  { sprite: wmParent, x: 58, y: 38 },
  { sprite: briefcase, x: 63, y: 47 },
]);

/* ── the takings: a coin hops from the door into the owner's case ─────────────────────────────── */

/** The coin's arc, top-left corners in the coin layer's own pixels, from the door to the case. */
const ARC: readonly (readonly [number, number])[] = [
  [0, 5],
  [3, 2],
  [7, 0],
  [11, 1],
  [14, 4],
  [15, 9],
  [15, 12],
];

const COIN = ['yG', 'Gg'];

/** The coin layer, 18x14 from (50, 33): the coin at one point of its arc, or the glint as it lands. */
function coinFrame(at: number | 'landed' | 'none'): string[] {
  const grid = wmBands(18, [['.', 14]]).map((row) => [...row]);
  if (at === 'landed') {
    grid[12][14] = 'y';
    grid[11][15] = 'W';
    grid[12][17] = 'y';
  } else if (at !== 'none') {
    const [x, y] = ARC[at];
    COIN.forEach((row, j) => {
      [...row].forEach((ch, i) => {
        grid[y + j][x + i] = ch;
      });
    });
  }
  return grid.map((row) => row.join(''));
}

const coin: PixelSprite = {
  id: 'wm15-opener-coin',
  name: 'wm15-opener-coin',
  tags: ['scene', 'wm15'],
  blurb: 'A gold coin arcing from the shop door into the owner\'s briefcase.',
  rows: coinFrame(4),
  frames: [...ARC.map((_, i) => coinFrame(i)), coinFrame('landed'), coinFrame('none'), coinFrame('none')],
  frameMs: 260,
};

/** The oak sign: the kit's oak mark on a green board in a gold frame. 9x7. */
const BOARD = [
  'OgggggggO',
  ...wmMarkOak.rows.map((row) => `g${row.replace(/\./g, 'H')}g`),
  'OgggggggO',
];

/** The sign on its two chains, swung `shift` pixels at the board. 11x9. */
function signAt(shift: number): string[] {
  const chain = (lean: number) => [...'.'.repeat(11)].map((ch, x) => (x === 2 + lean || x === 8 + lean ? 'D' : ch)).join('');
  return [chain(0), chain(shift), ...BOARD.map((row) => `${'.'.repeat(1 + shift)}${row}${'.'.repeat(1 - shift)}`)];
}

const sign: PixelSprite = {
  id: 'wm15-opener-sign',
  name: 'wm15-opener-sign',
  tags: ['scene', 'wm15'],
  palette: WM_INKS,
  rows: signAt(0),
  frames: [signAt(0), signAt(1), signAt(0), signAt(-1)],
  frameMs: 640,
};

/** Lamplight catching the goods in the window. */
const showGlint: PixelSprite = {
  id: 'wm15-opener-show-glint',
  name: 'wm15-opener-show-glint',
  tags: ['scene', 'wm15'],
  rows: ['yy...........yy', '...............', '...............', '...............', '...............', '.....y......y..'],
};

export const wm15Opener: SceneArt = {
  id: 'wm15-opener',
  label: 'A father stands with his briefcase outside the family shop on the high street at night, its window glowing, as gold coins hop from its door into his case beneath a swinging sign carved with the family oak.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: coin, x: 50, y: 33 },
    { sprite: sign, x: 3, y: 21 },
    { sprite: showGlint, x: SHOW_X + 3, y: SHOW_Y + 1, motion: { kind: 'twinkle', periodMs: 2600, min: 0.2 } },
    { sprite: wmCottageGlow, x: SHOP_X + 9, y: 16, motion: { kind: 'twinkle', periodMs: 4400, min: 0.4 } },
    { sprite: wmCottageGlow, x: SHOP_X + 38, y: 16, motion: { kind: 'twinkle', periodMs: 5000, phase: 0.5, min: 0.4 } },
    { sprite: wmCottageGlow, x: 4, y: 12, motion: { kind: 'twinkle', periodMs: 5600, phase: 0.25, min: 0.35 } },
    { sprite: wmLampFlame, x: 72, y: 30 },
    { sprite: wmStar, x: 40, y: 1, motion: { kind: 'twinkle', periodMs: 2300, min: 0.3 } },
    { sprite: wmStarDot, x: 68, y: 8, motion: { kind: 'twinkle', periodMs: 1900, phase: 0.6, min: 0.2 } },
  ],
};

/** A briefcase with a white clasp: the owner's plans. */
const emblemBriefcase: PixelSprite = {
  id: 'wm15-emblem-briefcase',
  name: 'wm15-emblem-briefcase',
  tags: ['scene', 'wm15'],
  rows: [
    '.....yGGg.....',
    '.....G..g.....',
    '.yyGGGGGGGGgg.',
    'yGGGGGGGGGGGgg',
    'yGGGGGGGGGGGgg',
    'gggggOwwOggggO',
    'yGGGGOwwOGGGgg',
    'yGGGGGGGGGGGgg',
    'yGGGGGGGGGGGgg',
    'gGGGGGGGGGGggO',
    '.gggggggggggO.',
  ],
};

export const wm15Finish: SceneArt = wmKeepsake(
  'wm15-finish',
  emblemBriefcase,
  'A green crest with a gold rim bearing a briefcase with a white clasp, framed by laurel over a purple banner, with sparkles around it.',
);

export const art: LessonArtSet = { opener: wm15Opener, backdrop: wmBackdrop, finish: wm15Finish };
