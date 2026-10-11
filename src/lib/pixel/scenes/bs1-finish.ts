/**
 * Business Strategy keepsake: the house banner, earned. Lesson 1 sets the SHAPE all 25 lessons share.
 *
 * Base = an orchid banner on a gold rod, hung from a ring, with a dark octagonal roundel in a gold
 * ring. The roundel is the EMBLEM SLOT: a 16x16 emblem drawn at (16, 10) sits inside it, on a dark
 * field like the canvas the catalogue's 16x16 sprites were drawn for, so those can stand in as well.
 * bsKeepsake(id, label, emblem) builds a lesson's keepsake; lesson 1 passes bsEmblemMoat from the kit.
 * Moving: the swallowtail flutters, light runs over the ring, sparkles twinkle, motes rise.
 */
import type { PixelSprite } from '../types';
import { bsEmblemMoat, bsLater, bsMoved } from './bs-kit';
import type { SceneArt } from './types';

const banner: PixelSprite = {
  id: 'bs-keepsake-banner',
  name: 'banner',
  tags: [],
  rows: [
    '.......................yG.......................',
    '......................y..O......................',
    '....................gggGOggg....................',
    '......yG.........ggg........ggg.........Gy......',
    '.....yGgGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGg.....',
    '......gOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOgO......',
    '..........EyyyyyyGGGGGGGGGGGGGGGGGGGGE..........',
    '..........EqPPPPPPPPPPPPPPPPPPPPPPPPpE..........',
    '..........EqPPPPPPOOOOOOOOOOOOPPPPPPpE..........',
    '..........EqPPPPPOyyyyyyyyyyGGOPPPPPpE..........',
    '..........EqPPPPOyKKKKKKKKKKKKGOPPPPpE..........',
    '..........EqPPPOyKKKKKKKKKKKKKKGOPPPpE..........',
    '..........EqPPOyKKKKKKKKKKKKKKKKGOPPpE..........',
    '..........EqPPOyKKKKKKKKKKKKKKKKGOPPpE..........',
    '..........EqPPOyKKKKKKKKKKKKKKKKgOPPpE..........',
    '..........EqPPOyKKKKKKKKKKKKKKKKgOPPpE..........',
    '..........EqPPOyKKKKKKKKKKKKKKKKgOPPpE..........',
    '..........EqPPOyKKKKKKKKKKKKKKKKgOPPpE..........',
    '..........EqPPOyKKKKKKKKKKKKKKKKgOPPpE..........',
    '..........EqPPOyKKKKKKKKKKKKKKKKgOPPpE..........',
    '..........EqPPOyKKKKKKKKKKKKKKKKgOPPpE..........',
    '..........EqPPOyKKKKKKKKKKKKKKKKgOPPpE..........',
    '..........EqPPOGKKKKKKKKKKKKKKKKgOPPpE..........',
    '..........EqPPOGKKKKKKKKKKKKKKKKgOPPpE..........',
    '..........EqPPPOGKKKKKKKKKKKKKKgOPPPpE..........',
    '..........EqPPPPOGKKKKKKKKKKKKgOPPPPpE..........',
    '..........EqPPPPPOGGggggggggggOPPPPPpE..........',
    '..........EqPPPPPPOOOOOOOOOOOOPPPPPPpE..........',
    '..........EqPPPPPPPPPPPPPPPPPPPPPPPPpE..........',
    '..........EGGGGGGGGGGGGGGGGGGGGGGGGGGE..........',
    '..........EOOOOOOOOOOOOOOOOOOOOOOOOOOE..........',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
  ],
};

const tailsRows = [
  '.EqPPPPPPPPPPPEEPPPPPPPPPPPpE.',
  '.EqPPPPPPPPPPE..EPPPPPPPPPPpE.',
  '.EqPPPPPPPPPE....EPPPPPPPPPpE.',
  '.EqPPPPPPPPE......EPPPPPPPPpE.',
  '.EqPPPPPPPE........EPPPPPPPpE.',
  '.EqPPPPPPE..........EPPPPPPpE.',
  '.EqPPPPE..............EPPPPpE.',
  '.EqPE....................EPpE.',
  '.yG........................Gy.',
];

const tails: PixelSprite = {
  id: 'bs-keepsake-tails',
  name: 'tails',
  tags: [],
  blurb: 'The swallowtail under the hem: the points swing while the top stays sewn on.',
  rows: tailsRows,
  frames: [
    tailsRows,
    bsMoved(tailsRows, {
      4: '..EqPPPPPPPE........EPPPPPPPpE',
      5: '..EqPPPPPPE..........EPPPPPPpE',
      6: '..EqPPPPE..............EPPPPpE',
      7: '..EqPE....................EPpE',
      8: '..yG........................Gy',
    }),
    tailsRows,
    bsMoved(tailsRows, {
      4: 'EqPPPPPPPE........EPPPPPPPpE..',
      5: 'EqPPPPPPE..........EPPPPPPpE..',
      6: 'EqPPPPE..............EPPPPpE..',
      7: 'EqPE....................EPpE..',
      8: 'yG........................Gy..',
    }),
  ],
  frameMs: 560,
};

/** The ring's top-left arc in roundel pixels, from low on the left side up and over the top. */
const GLINT_PATH: readonly (readonly [number, number])[] = [
  [2, 16], [1, 15], [1, 14], [1, 13], [1, 12], [1, 11], [1, 10], [1, 9], [1, 8], [1, 7], [1, 6],
  [1, 5], [1, 4], [2, 3], [3, 2], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1], [9, 1], [10, 1], [11, 1],
  [12, 1], [13, 1], [14, 1], [15, 1], [16, 2],
];

/**
 * Light running along the gold ring: a white point, a pale pixel either side, a gold tail, three ring
 * pixels a step, then a rest. Built from the path rather than written out, because nineteen frames of
 * a 20x20 grid that each light four pixels are where a miscounted row would hide.
 */
function glintFrames(): string[][] {
  const blank = Array.from({ length: 20 }, () => '.'.repeat(20));
  const frames: string[][] = [];
  for (let s = 0; s < GLINT_PATH.length + 3; s += 3) {
    const grid = blank.map((row) => row.split(''));
    for (const [k, ch] of [[s - 2, 'y'], [s - 1, 'w'], [s + 1, 'w'], [s, 'W']] as const) {
      if (k < 0 || k >= GLINT_PATH.length) continue;
      const [x, y] = GLINT_PATH[k];
      grid[y][x] = ch;
    }
    frames.push(grid.map((row) => row.join('')));
  }
  return [...frames, ...Array.from({ length: 8 }, () => blank)];
}

const glint = glintFrames();

const ringGlint: PixelSprite = {
  id: 'bs-keepsake-ring-glint',
  name: 'ring-glint',
  tags: [],
  rows: glint[glint.length - 1],
  frames: glint,
  frameMs: 110,
};

const sparkle: PixelSprite = {
  id: 'bs-keepsake-sparkle',
  name: 'sparkle',
  tags: [],
  rows: [
    '..q..',
    '.qQq.',
    'qQWQq',
    '.qQq.',
    '..q..',
  ],
  frames: [
    [
      '..q..',
      '.qQq.',
      'qQWQq',
      '.qQq.',
      '..q..',
    ],
    [
      '.....',
      '..q..',
      '.qWq.',
      '..q..',
      '.....',
    ],
    [
      '.....',
      '.....',
      '..Q..',
      '.....',
      '.....',
    ],
    [
      '.....',
      '..q..',
      '.qWq.',
      '..q..',
      '.....',
    ],
  ],
  frameMs: 360,
};

const moteGold: PixelSprite = {
  id: 'bs-keepsake-mote-gold',
  name: 'mote-gold',
  tags: [],
  rows: [
    'y',
    'G',
  ],
};

const moteOrchid: PixelSprite = {
  id: 'bs-keepsake-mote-orchid',
  name: 'mote-orchid',
  tags: [],
  rows: [
    'Q',
    'q',
  ],
};

const sparkleLater = bsLater(sparkle, 'bs-keepsake-sparkle-later', 2, 410);

/** Where an emblem's top-left goes: inside the roundel, one pixel in from its gold ring. */
export const BS_EMBLEM_SLOT = { x: 16, y: 10 } as const;

/** The house banner around one lesson's emblem. Every lesson gets the same banner; only the emblem changes. */
export function bsKeepsake(id: string, label: string, emblem: PixelSprite): SceneArt {
  return {
    id,
    label,
    width: 48,
    height: 40,
    base: banner,
    layers: [
      { sprite: emblem, x: BS_EMBLEM_SLOT.x, y: BS_EMBLEM_SLOT.y },
      { sprite: tails, x: 9, y: 31 },
      { sprite: ringGlint, x: 14, y: 8 },
      { sprite: sparkle, x: 2, y: 13, motion: { kind: 'twinkle', periodMs: 1700, min: 0.4 } },
      { sprite: sparkleLater, x: 41, y: 25, motion: { kind: 'twinkle', periodMs: 2000, phase: 0.5, min: 0.4 } },
      { sprite: moteGold, x: 6, y: 27, motion: { kind: 'rise', amp: 5, periodMs: 2300, phase: 0.1 } },
      { sprite: moteOrchid, x: 42, y: 16, motion: { kind: 'rise', amp: 5, periodMs: 2700, phase: 0.6 } },
      { sprite: moteGold, x: 43, y: 35, motion: { kind: 'rise', amp: 4, periodMs: 2000, phase: 0.35 } },
    ],
  };
}

export const bs1Finish: SceneArt = bsKeepsake(
  'bs1-finish',
  'A purple house banner on a gold rod, its roundel showing a gold keep standing in a blue moat, with small sparkles around it.',
  bsEmblemMoat,
);
