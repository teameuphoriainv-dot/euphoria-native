/**
 * Personal Finance lesson 21, Estate Planning Basics: with a will, you decide who gets what.
 *
 * A new set, the den by the fire at night: a stone fireplace, a family portrait over the mantel (two
 * grown-ups and a child, the beneficiaries the lesson names), candles either side, and a bookcase.
 * The figure stands at the writing desk holding up the will, WILL across its top, signed and sealed
 * in red; the quill is back in its inkwell and the other documents are stacked in folders beside it.
 * The cat sleeps on the rug by the hearth. Moving: the fire, its glow, the candles, a glint on the seal, a spark,
 * the cat's z.
 */
import type { PixelSprite } from '../types';
import { pfCat, pfCompose, pfKitchen, pfSparkle, pfTable, pfZzz } from './pf-kit';
import { pfSaverHold } from './pf-kit-a';
import { pfKeepsake } from './pf1-finish';
import { pfBackdrop } from './pf-backdrop';
import type { LessonArtSet, SceneArt } from './types';

const SKIN: Record<string, string> = {
  M: '#D6A87C',
  C: '#C08552',
  U: '#9A6638',
  j: '#6B3A1F',
  H: '#43291A',
};

/** The family over the mantel in a gilt frame: two grown-ups and, between them, a child. */
const portrait: PixelSprite = {
  id: 'pf21-portrait',
  name: 'portrait',
  tags: ['scene', 'pf'],
  palette: SKIN,
  rows: [
    'OOOOOOOOOOOOOOOOO',
    'OgggggggggggggggO',
    'OgtttttttttttttgO',
    'OgtHHHtttttyyytgO',
    'OgtHCCtttttCCytgO',
    'OgtCCCtjjjtCCCtgO',
    'OgBBBBBCCCRRRRRgO',
    'OgBBBBBCCCRRRRRgO',
    'OgBBBBNNNNNRRRRgO',
    'OgBBBBNNNNNRRRRgO',
    'OgBBBBNNNNNRRRRgO',
    'OgggggggggggggggO',
    'OOOOOOOOOOOOOOOOO',
  ],
};

/**
 * The fireplace, 30 wide and 31 tall: a mantel shelf, a stone surround lit on its left, the dark
 * firebox with two logs on the grate, and the hearth slab on the floor.
 */
function fireplace(): PixelSprite {
  const W = 30;
  return {
    id: 'pf21-fireplace',
    name: 'fireplace',
    tags: ['scene', 'pf'],
    rows: Array.from({ length: 31 }, (_, y) =>
      Array.from({ length: W }, (_, x) => {
        if (y === 0) return 'y';
        if (y === 1) return 'G';
        if (y === 2) return x === 0 || x === W - 1 ? '.' : 'O';
        if (y >= 26) {
          if (y === 26) return 'x';
          return y === 30 ? 'D' : 'X';
        }
        if (x < 2 || x >= W - 2) return '.';
        const opening = x >= 8 && x <= 21 && y >= 10;
        if (opening) {
          if (y >= 22 && y <= 23 && x >= 10 && x <= 19) return y === 22 ? 'g' : 'O';
          if (y >= 24) return x % 3 === 0 ? 'D' : 'K';
          return 'K';
        }
        if (x === 7 || x === 22 || (y === 9 && x > 7 && x < 22)) return 'D';
        if (x === 2) return 'x';
        return (x + y * 3) % 11 === 0 ? 'D' : 'X';
      }).join(''),
    ),
  };
}

/** The flames on the logs, a LAYER only: three frames of the fire's ramp, white-hot at the heart. */
const FIRE_A = [
  '.....1......',
  '....121..1..',
  '..1.1321.11.',
  '.12123321121',
  '123234432332',
  '234345544343',
  '344455554444',
];
const FIRE_B = [
  '..1.........',
  '.121....1...',
  '.1321..121..',
  '123321123211',
  '233344334321',
  '344455444433',
  '344555554444',
];
const FIRE_C = [
  '.......1....',
  '...1..121...',
  '..121.1321.1',
  '.12321233211',
  '123343443332',
  '234445554443',
  '344455555444',
];
const fire: PixelSprite = {
  id: 'pf21-fire',
  name: 'fire',
  tags: ['scene', 'pf'],
  rows: FIRE_A,
  frames: [FIRE_A, FIRE_B, FIRE_C],
  frameMs: 420,
};

/** The fire's light on the hearth, for a twinkle. */
const fireGlow: PixelSprite = {
  id: 'pf21-fire-glow',
  name: 'fire glow',
  tags: ['scene', 'pf'],
  rows: [
    '4.4.4.4.4.4.4.4',
  ],
};

/** A candlestick on the mantel; its flame is a twinkle layer. */
const candle: PixelSprite = {
  id: 'pf21-candle',
  name: 'candle',
  tags: ['scene', 'pf'],
  rows: [
    '.w.',
    '.w.',
    '.x.',
    'OGO',
    '.g.',
  ],
};
const candleFlame: PixelSprite = {
  id: 'pf21-candle-flame',
  name: 'candle flame',
  tags: ['scene', 'pf'],
  rows: [
    'y',
    '5',
  ],
};

/** A spark rising off the fire. */
const spark: PixelSprite = {
  id: 'pf21-spark',
  name: 'spark',
  tags: ['scene', 'pf'],
  rows: [
    '4',
  ],
};

/**
 * WILL in capitals with a five-column W, since the font's three-column W reads as an H: a one-column
 * I and Ls `lw` columns wide, a one-column gap between letters, ink on transparent.
 */
function willWord(id: string, lw: 2 | 3, ink: string): PixelSprite {
  const W = ['X...X', 'X...X', 'X.X.X', 'X.X.X', '.X.X.'];
  const L = (r: number) => (r < 4 ? 'X' + '.'.repeat(lw - 1) : 'X'.repeat(lw));
  return {
    id,
    name: id,
    tags: ['scene', 'pf'],
    rows: W.map((w, r) => [w, 'X', L(r), L(r)].join('.').replace(/X/g, ink)),
  };
}

/**
 * The will, held up in both hands: a long sheet with WILL across the top (stamped on it), lines of
 * terms, the signature in blue ink and a red wax seal at the lower right.
 */
const will: PixelSprite = {
  id: 'pf21-will',
  name: 'will',
  tags: ['scene', 'pf'],
  rows: [
    '.xxxxxxxxxxxxxxx.',
    'xwwwwwwwwwwwwwwwX',
    'xwwwwwwwwwwwwwwwX',
    'xwwwwwwwwwwwwwwwX',
    'xwwwwwwwwwwwwwwwX',
    'xwwwwwwwwwwwwwwwX',
    'xwwwwwwwwwwwwwwwX',
    'xwwwwwwwwwwwwwwwX',
    'xwXXXXXwXXXXXwwwX',
    'xwwwwwwwwwwwwwwwX',
    'xwXXXXwXXXXXwrRrX',
    'xwbwbbwbwwwrRsRrX',
    'xwwbwwbwwwwwrRrwX',
    'xwwwwwwwwwwwwrwrX',
    'xxxxxxxxxxxxxxxxX',
  ],
};

/** An inkwell with the quill stood back in it. */
const inkwell: PixelSprite = {
  id: 'pf21-inkwell',
  name: 'inkwell',
  tags: ['scene', 'pf'],
  rows: [
    '....w',
    '...wx',
    '..wx.',
    '..wx.',
    '.wx..',
    '.x...',
    'XxX..',
    'DKKD.',
    'DbKD.',
    'DDDD.',
  ],
};

/** The rest of the estate papers, stacked in folders. */
const folders: PixelSprite = {
  id: 'pf21-folders',
  name: 'folders',
  tags: ['scene', 'pf'],
  rows: [
    '..ppppp......',
    '.PPPPPPPPPPPp',
    'EwwwwwwwwwwwE',
    'tTTTTTTTTTTTt',
    'ttttTTTTTTTTt',
    'gGGGGGGGGGGGg',
    'OOOOOOOOOOOOO',
  ],
};

/** A bookcase in the corner: a dark frame, four shelves of spines in the pathway's colours. */
const SPINES = ['PpPEq', 'TtbBt', 'RrGgO', 'NnwxD', 'BbFfI'];
function bookcase(width: number, height: number): PixelSprite {
  return {
    id: 'pf21-bookcase',
    name: 'bookcase',
    tags: ['scene', 'pf'],
    rows: Array.from({ length: height }, (_, y) =>
      Array.from({ length: width }, (_, x) => {
        if (x === 0 || x === width - 1 || y === 0) return 'O';
        const shelf = y % 8;
        if (shelf === 0) return 'g';
        if (shelf === 1) return 'O';
        const tier = Math.floor(y / 8);
        const book = SPINES[(tier + Math.floor((x - 1) / 2)) % SPINES.length];
        const tall = 2 + ((x * 7 + tier * 3) % 3);
        if (shelf < tall) return 'K';
        return book[(x + tier) % book.length];
      }).join(''),
    ),
  };
}

/**
 * Lesson 21's emblem: the will itself, a sheet filling the window with WILL across its top (the same
 * five-column W as the opener's), the signature in blue ink and the red wax seal at its foot.
 */
const emblemWill: PixelSprite = {
  id: 'pf21-emblem-will',
  name: 'pf21-emblem-will',
  tags: ['scene', 'pf', 'emblem'],
  rows: [
    'wwwwwwwwwwwwwx',
    ...willWord('pf21-emblem-word', 2, 'K').rows.map((r) => 'w' + r.replace(/\./g, 'w')),
    'wwwwwwwwwrRrwx',
    'wbwbbwbwrRsRrx',
    'xxxxxxxxxrRrxx',
  ],
};

// Order is depth: the portrait and the fireplace on the left wall, the bookcase, the figure, the will
// in its hands, then the desk over the figure's lower half and the things on the desk.
const base = pfCompose('pf21-opener-base', 80, 60, pfKitchen.rows, [
  [portrait, 8, 3],
  [fireplace(), 2, 18],
  [candle, 4, 13],
  [candle, 27, 13],
  [bookcase(16, 34), 63, 2],
  [pfSaverHold, 46, 12],
  [will, 45, 22],
  [willWord('pf21-will-word', 3, 'K'), 46, 24],
  [pfTable(42, 12), 36, 36],
  [inkwell, 38, 28],
  [folders, 64, 31],
  [pfCat, 33, 51],
]);

export const pf21Opener: SceneArt = {
  id: 'pf21-opener',
  label: 'In a den at night, a person at a writing desk holds up a signed will with a red wax seal, beside a quill in an inkwell and a stack of folders, with a family portrait over a crackling fireplace and the cat asleep on the rug by the hearth.',
  width: 80,
  height: 60,
  base,
  layers: [
    // The flames sit on the logs (fireplace at 2,18; logs on rows 22 and 23 of it).
    { sprite: fire, x: 11, y: 33 },
    { sprite: fireGlow, x: 8, y: 44, motion: { kind: 'twinkle', periodMs: 1500, min: 0.25 } },
    { sprite: candleFlame, x: 5, y: 11, motion: { kind: 'twinkle', periodMs: 900, min: 0.4 } },
    { sprite: candleFlame, x: 28, y: 11, motion: { kind: 'twinkle', periodMs: 1100, min: 0.4, phase: 0.5 } },
    { sprite: spark, x: 16, y: 33, motion: { kind: 'rise', amp: 4, periodMs: 1800 } },
    { sprite: pfSparkle, x: 59, y: 30, motion: { kind: 'twinkle', periodMs: 2000, min: 0.35, phase: 0.3 } },
    { sprite: pfZzz, x: 32, y: 45, motion: { kind: 'rise', amp: 3, periodMs: 2800, phase: 0.3 } },
  ],
};

export const pf21Finish = pfKeepsake(
  'pf21-finish',
  'A gold house-shaped key fob with a teal roof on a key ring with a brass key, its window showing a sheet lettered WILL, signed in blue and sealed with red wax, with small sparkles around it.',
  emblemWill,
);

export const art: LessonArtSet = { opener: pf21Opener, backdrop: pfBackdrop, finish: pf21Finish };
