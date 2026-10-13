/**
 * Personal Finance lesson 20, Understanding Inflation & Purchasing Power: the same money buys less.
 *
 * A new set, the evening market, seen over the figure's shoulder: they stand with their back to us,
 * holding up a bill, and look at the bread stall's chalkboard, where the old $2 is struck out in
 * red and $3 is chalked beside it, followed by a red arrow up. The same bill buys less bread.
 * Bread on a shelf, apples in a crate, string lights under a striped awning, and the cat sat on
 * the counter. Moving: the lights, the lamp, a star, the bill, the cat's tail.
 */
import type { PixelSprite } from '../types';
import { pfCompose } from './pf-kit';
import { pfCatSit } from './pf-kit-a';
import { pfStar, pfText } from './pf-kit-b';
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

const SKY = ['E', 'E', 'E', 'E', 'p', 'p', 'p', 'p', 'p', 'f', 'f', 'f', 'f', 'f', '3', '3', '3', '3', '4', '4', '4'];

/**
 * The street: a dusk sky, a dark brick corner on the left with two lit windows and a chimney, and
 * the pavement from row 47 (a lit kerb, then slabs).
 */
function street(): string[] {
  return Array.from({ length: 60 }, (_, y) =>
    Array.from({ length: 80 }, (_, x) => {
      if (y === 47) return 'X';
      if (y > 47) return y % 4 === 0 || (x + (y % 8 < 4 ? 0 : 5)) % 10 === 0 ? 'k' : 'D';
      if (x < 21 && y >= 19) {
        if (y === 19 || x === 20) return 'D';
        if ((y === 24 || y === 25 || y === 26) && (x === 4 || x === 5 || x === 12 || x === 13)) return 'G';
        return (x + y) % 7 === 0 ? 'K' : 'k';
      }
      if (x >= 6 && x <= 8 && y >= 15 && y < 19) return y === 15 ? 'D' : 'k';
      return SKY[Math.min(y, SKY.length - 1)];
    }).join(''),
  );
}

/**
 * The figure seen from behind, the back of the head, the ears, and the right arm raised high with
 * its hand at columns 17 to 19, rows 2 and 3: the bill is stamped over the hand.
 */
const saverBack: PixelSprite = {
  id: 'pf20-saver-back',
  name: 'saver from behind',
  tags: ['scene', 'pf'],
  palette: SKIN,
  rows: [
    '.....HHHHHH.........',
    '....HjjjjjjH........',
    '...HjjjjjjjjH....MCM',
    '..HjjjjjjjjjjH...UCU',
    '..HjjjjjjjjjjH...bBb',
    '..HjjjjjjjjjjH..BBb.',
    '..CjjjjjjjjjjC..BBb.',
    '..UHjjjjjjjjHU.BBb..',
    '...HHjjjjjjHH..BBb..',
    '....HHHHHHHH..BBb...',
    '......UUUU....BBb...',
    '...bBBBBBBBBBBBb....',
    '..bBBBBBBBBBBBBb....',
    '.bBBBBBBBBBBBBb.....',
    '.bBBBBBBBBBBBBb.....',
    '.bBBbBBBBBBBBBb.....',
    '.bBBbBBBBBBBBBb.....',
    '.bBBbBBBBBBBBBb.....',
    '.bBBbBBBBBBBBBb.....',
    '.bBBbBBBBBBBBBb.....',
    '.bBBbBBBBBBBBBb.....',
    '.bBBbBBBBBBBBBb.....',
    '.bBBbBBBBBBBBBb.....',
    '.bBBbBBBBBBBBBb.....',
    '.bBBbBBBBBBBBBb.....',
    '.bBBbBBBBBBBBBb.....',
  ],
};

/** The same bill as before, held up to the board, its edge flicking. A LAYER only. */
const BILL_REST = [
  'nnnnnnn',
  'nmNNNmn',
  'nNNmNNn',
  'nnnnnnn',
];
const BILL_FLICK = [
  'nnnnnn.',
  'nmNNNmn',
  'nNNmNNn',
  'nnnnnnn',
];
const bill: PixelSprite = {
  id: 'pf20-bill',
  name: 'bill',
  tags: ['scene', 'pf'],
  rows: BILL_REST,
  frames: [BILL_REST, BILL_REST, BILL_FLICK],
  frameMs: 500,
};

/** A street lamp's post, its head, and its warm halo for a twinkle. */
const lampPost: PixelSprite = {
  id: 'pf20-lamp-post',
  name: 'lamp post',
  tags: ['scene', 'pf'],
  rows: Array.from({ length: 20 }, () => 'D'),
};
const lamp: PixelSprite = {
  id: 'pf20-lamp',
  name: 'lamp',
  tags: ['scene', 'pf'],
  rows: [
    '.DDD.',
    'DXXXD',
    '.yWy.',
    '..D..',
  ],
};
const lampGlow: PixelSprite = {
  id: 'pf20-lamp-glow',
  name: 'lamp glow',
  tags: ['scene', 'pf'],
  rows: [
    'y.....y',
    '.y...y.',
  ],
};

/** The stall's striped awning, 59 wide: red and white bands lit along the top, scalloped below. */
function awning(width: number): PixelSprite {
  const band = (x: number) => (Math.floor(x / 4) % 2 === 0 ? 'r' : 'w');
  return {
    id: 'pf20-awning',
    name: 'awning',
    tags: ['scene', 'pf'],
    rows: Array.from({ length: 11 }, (_, y) =>
      Array.from({ length: width }, (_, x) => {
        if (y === 0) return 'D';
        const ch = band(x);
        if (y === 9) return ch === 'w' ? 'x' : 'r';
        if (y === 10) return x % 4 === 0 || x % 4 === 3 ? '.' : ch === 'w' ? 'x' : 'r';
        return y === 1 && ch === 'r' ? 'R' : ch;
      }).join(''),
    ),
  };
}

/** The stall's back wall of dark boards, and its two posts. */
function stallWall(width: number, height: number): PixelSprite {
  return {
    id: 'pf20-stall-wall',
    name: 'stall wall',
    tags: ['scene', 'pf'],
    rows: Array.from({ length: height }, (_, y) =>
      Array.from({ length: width }, (_, x) => {
        if (x <= 1 || x >= width - 2) return x === 0 || x === width - 2 ? 'g' : 'O';
        return y % 5 === 4 ? 'K' : 'k';
      }).join(''),
    ),
  };
}

/** The counter: a lit top edge, then a front of upright boards. */
function counter(width: number): PixelSprite {
  return {
    id: 'pf20-counter',
    name: 'counter',
    tags: ['scene', 'pf'],
    rows: [
      'O'.repeat(width),
      'y' + 'G'.repeat(width - 2) + 'g',
      'O'.repeat(width),
      ...Array.from({ length: 8 }, () =>
        Array.from({ length: width }, (_, x) => (x % 6 === 0 ? 'O' : x % 6 === 1 ? 'G' : 'g')).join(''),
      ),
    ],
  };
}

/** The chalkboard in its wooden frame; the words and prices are stamped on it in chalk. */
function chalkboard(width: number, height: number): PixelSprite {
  return {
    id: 'pf20-chalkboard',
    name: 'chalkboard',
    tags: ['scene', 'pf'],
    rows: Array.from({ length: height }, (_, y) =>
      Array.from({ length: width }, (_, x) => {
        if (y === 0 || x === 0) return 'g';
        if (y === height - 1 || x === width - 1) return 'O';
        return 'K';
      }).join(''),
    ),
  };
}

/** A dollar sign in the board's 3x5 hand. */
function dollar(id: string, ink: string): PixelSprite {
  return {
    id,
    name: id,
    tags: ['scene', 'pf'],
    rows: ['.' + ink + ink, ink + ink + '.', '.' + ink + '.', '.' + ink + ink, ink + ink + '.'],
  };
}

/** The red stroke through the old price, and the red arrow up beside the new one. */
const strike: PixelSprite = {
  id: 'pf20-strike',
  name: 'strike',
  tags: ['scene', 'pf'],
  rows: [
    '.......RR',
    '..RRRRR..',
    'RR.......',
  ],
};
const arrowUp: PixelSprite = {
  id: 'pf20-arrow-up',
  name: 'arrow up',
  tags: ['scene', 'pf'],
  rows: [
    '..R..',
    '.RRR.',
    'RRRRR',
    '.RR..',
    '.RR..',
  ],
};

/** A shelf of round loaves and a basket of baguettes leaning up out of it. */
const breadShelf: PixelSprite = {
  id: 'pf20-bread-shelf',
  name: 'bread shelf',
  tags: ['scene', 'pf'],
  rows: [
    '..........Gg..Gg.',
    '.........GyO.Gyg.',
    '.........GgOGygO.',
    '..........GgGgO..',
    '.OGGO.OGGO.GgGgO.',
    'OGyGgOGyGgOOgOgO.',
    'OGGggOGGggOOOOOO.',
    'OOOOOOOOOOOgOgOgO',
    'gggggggggggggggg.',
    'OOOOOOOOOOOOOOOO.',
  ],
};

/** A wooden crate heaped with red apples, lit on their left. */
const appleCrate: PixelSprite = {
  id: 'pf20-apple-crate',
  name: 'apple crate',
  tags: ['scene', 'pf'],
  rows: [
    '.sR.sR..sR.sR.',
    'sRrRRrsRrRRrR.',
    'RrrRrrRrrRrrRr',
    'OOOOOOOOOOOOOO',
    'OGGGGGGGGGGGgO',
    'OgggggggggggOO',
    'OGGGGGGGGGGGgO',
    'OOOOOOOOOOOOOO',
  ],
};

/** Three loaves on a board on the counter. */
const loaves: PixelSprite = {
  id: 'pf20-loaves',
  name: 'loaves',
  tags: ['scene', 'pf'],
  rows: [
    '..OOOO.....OOOO..',
    '.OGyyGO...OGyyGO.',
    'OGyGyGgOOOGyGyGgO',
    'OGGGGGgOyGOGGGGgO',
    'OOOOOOOOGgOOOOOOO',
    'ggggggggggggggggg',
  ],
};

/** The string of lights under the awning, its bulbs (stamped dark here, lit by the twinkle layers). */
const LIGHT_XS = [24, 30, 36, 42, 48, 54, 60, 66, 72];
const lightWire: PixelSprite = {
  id: 'pf20-light-wire',
  name: 'light wire',
  tags: ['scene', 'pf'],
  rows: [
    Array.from({ length: 56 }, (_, x) => (LIGHT_XS.includes(x + 22) ? 'O' : 'D')).join(''),
  ],
};
function bulbs(id: string, pick: number): PixelSprite {
  return {
    id,
    name: id,
    tags: ['scene', 'pf'],
    rows: [
      Array.from({ length: 49 }, (_, x) => (x % 6 === 0 && (x / 6) % 2 === pick ? 'y' : '.')).join(''),
    ],
  };
}

/** Lesson 20's emblem: a white price tag with its hole, and a red arrow up on it. */
const emblemPriceTag: PixelSprite = {
  id: 'pf20-emblem-price-tag',
  name: 'pf20-emblem-price-tag',
  tags: ['scene', 'pf', 'emblem'],
  rows: [
    '...wwwwwwwwwwx',
    '..wwwwwwwRRwwx',
    '.wwwwwwwRRRRwx',
    'wwKKwwwRRRRRRx',
    'wwKKwwwwwRRwwx',
    '.wwwwwwwwRRwwx',
    '..wwwwwwwRRwwx',
    '...xxxxxxxxxxx',
  ],
};

// Order is depth: the stall's wall and its awning, the board and its chalk, the bread, the counter
// and what is on it, the lamp, then the figure in the foreground over everything, cropped below.
const base = pfCompose('pf20-opener-base', 80, 60, street(), [
  [stallWall(57, 31), 22, 15],
  [awning(59), 21, 5],
  [lightWire, 22, 16],
  [chalkboard(27, 15), 42, 18],
  [pfText('pf20-bread', 'BREAD', 'w'), 46, 20],
  [dollar('pf20-dollar-old', 'x'), 44, 26],
  [pfText('pf20-price-old', '2', 'x'), 48, 26],
  [strike, 43, 27],
  [dollar('pf20-dollar-new', 'w'), 54, 26],
  [pfText('pf20-price-new', '3', 'w'), 58, 26],
  [arrowUp, 62, 26],
  [breadShelf, 25, 19],
  [counter(57), 22, 37],
  [appleCrate, 27, 30],
  [loaves, 44, 32],
  [lampPost, 14, 15],
  [lamp, 12, 11],
  [saverBack, 1, 34],
]);

export const pf20Opener: SceneArt = {
  id: 'pf20-opener',
  label: 'At an evening market, seen from behind, a person holds up a bill to a bread stall whose chalkboard reads BREAD and shows the old price of two dollars struck out in red and three dollars written beside it, followed by a red arrow pointing up, with string lights under the awning, apples and bread on the counter and the cat sitting on it.',
  width: 80,
  height: 60,
  base,
  layers: [
    // The bill is in the raised hand (figure at 1,34; hand at columns 17 to 19, rows 2 and 3).
    { sprite: bill, x: 15, y: 32 },
    { sprite: pfCatSit, x: 67, y: 27 },
    { sprite: bulbs('pf20-bulbs-a', 0), x: 24, y: 16, motion: { kind: 'twinkle', periodMs: 1600, min: 0.3 } },
    { sprite: bulbs('pf20-bulbs-b', 1), x: 24, y: 16, motion: { kind: 'twinkle', periodMs: 1600, min: 0.3, phase: 0.5 } },
    { sprite: lampGlow, x: 11, y: 14, motion: { kind: 'twinkle', periodMs: 3000, min: 0.3 } },
    { sprite: pfStar, x: 3, y: 2, motion: { kind: 'twinkle', periodMs: 2600, min: 0.2 } },
  ],
};

export const pf20Finish = pfKeepsake(
  'pf20-finish',
  'A gold house-shaped key fob with a teal roof on a key ring with a brass key, its window showing a white price tag with a red arrow pointing up, with small sparkles around it.',
  emblemPriceTag,
);

export const art: LessonArtSet = { opener: pf20Opener, backdrop: pfBackdrop, finish: pf20Finish };
