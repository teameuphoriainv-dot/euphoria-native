/**
 * Business Strategy lesson 23 opener: a portfolio is made by what you say no to.
 *
 * Built on bsWarRoom with the strategist turned round to work from the left. On the wall hangs the
 * portfolio chart in four quadrants: a star, a question mark, a stack of coins for the cash cow, and a
 * red cross for the dogs. On the table a crowd of grey pieces, every product the house half-believes
 * in, is being raked off the end, one tumbling to the floor at a time, while four gold pieces stand
 * kept at the other end. The parchment and the gold pieces are the brightest surfaces. Moving: a piece
 * tips off the table and falls, the strategist rakes and blinks, the chart's star glints, the torch
 * and the candle burn, embers rise and stars twinkle.
 */
import type { PixelSprite } from '../types';
import { bsBackdrop } from './bs-backdrop';
import {
  bsCandle,
  bsEmber,
  bsPawn,
  bsScroll,
  bsStar,
  bsStrategist,
  bsTorch,
  bsWarRoom,
  bsWarTable,
} from './bs-kit';
import { BS_COAT_GOLD, bsMirrored, bsRecoloured } from './bs-kit-a';
import { bsKeepsake } from './bs1-finish';
import type { LessonArtSet, SceneArt } from './types';

const bcg: PixelSprite = {
  id: 'bs23-bcg',
  name: 'bcg',
  tags: [],
  blurb: 'The portfolio chart for the scroll, at scroll + (4, 5): four quadrants holding a star, a question mark, a stack of coins and a red cross.',
  rows: [
    'OOOOOOOOOOOOOOOOOOOOOOO',
    'O..........O....PP....O',
    'O....g.....O...P..P...O',
    'O...gGg....O......P...O',
    'O..gGGGg...O.....P....O',
    'O...gGg....O....P.....O',
    'O...g.g....O..........O',
    'O..........O....P.....O',
    'OOOOOOOOOOOOOOOOOOOOOOO',
    'O..........O..........O',
    'O...GG.....O...r...r..O',
    'O...Og.....O....r.r...O',
    'O...GG.GG..O.....r....O',
    'O...Og.Og..O....r.r...O',
    'O...GG.GG..O...r...r..O',
    'O...Og.Og..O..........O',
    'OOOOOOOOOOOOOOOOOOOOOOO',
  ],
};

const glint: PixelSprite = {
  id: 'bs23-glint',
  name: 'glint',
  tags: [],
  blurb: "A white point at the heart of the chart's star, for a twinkle layer.",
  rows: [
    'W',
  ],
};

/** A mark on a sprite grid: column, row and the character to put there. */
type Mark = readonly [number, number, string];

/** A `w` x `h` grid with marks on it, so a sprite made of placed pieces keeps every row the same width. */
function grid(w: number, h: number, marks: readonly Mark[]): string[] {
  const cells = Array.from({ length: h }, () => Array.from({ length: w }, () => '.'));
  for (const [x, y, ch] of marks) if (x >= 0 && x < w && y >= 0 && y < h) cells[y][x] = ch;
  return cells.map((row) => row.join(''));
}

/** A grey piece standing with its top-left at (x, y): bsPawn's shape in dull greys. */
const greyPiece = (x: number, y: number): Mark[] => [
  [x + 1, y, 'x'],
  [x, y + 1, 'x'], [x + 1, y + 1, 'X'], [x + 2, y + 1, 'D'],
  [x + 1, y + 2, 'X'],
  [x, y + 3, 'x'], [x + 1, y + 3, 'X'], [x + 2, y + 3, 'D'],
  [x, y + 4, 'D'], [x + 1, y + 4, 'D'], [x + 2, y + 4, 'D'],
];

/** A grey piece knocked over, lying with its top-left at (x, y). */
const lyingPiece = (x: number, y: number): Mark[] => [
  [x, y, 'x'], [x + 1, y, 'X'], [x + 2, y, 'X'], [x + 3, y, 'x'],
  [x, y + 1, 'D'], [x + 1, y + 1, 'D'], [x + 2, y + 1, 'D'], [x + 3, y + 1, 'D'],
];

const crowd: PixelSprite = {
  id: 'bs23-crowd',
  name: 'crowd',
  tags: [],
  blurb: 'The crowd of grey pieces on the felt, at (33, 38): the ones still waiting, and a knot of them against the rake head at the right.',
  rows: grid(35, 8, [
    ...greyPiece(0, 1), ...greyPiece(4, 3), ...greyPiece(7, 0), ...greyPiece(11, 2),
    ...greyPiece(15, 0), ...greyPiece(18, 3), ...greyPiece(21, 1),
    ...greyPiece(28, 1), ...greyPiece(31, 3),
  ]),
};

const FALL_W = 7;
const FALL_H = 18;
const floor = lyingPiece(0, 16);

const falling: PixelSprite = {
  id: 'bs23-falling',
  name: 'falling',
  tags: [],
  blurb: 'One grey piece at a time going over the end of the table, at (67, 38): it teeters on the rim, tips, drops past the leg and lands on the floor beside the last one.',
  rows: grid(FALL_W, FALL_H, [...greyPiece(0, 0), ...floor]),
  frames: [
    grid(FALL_W, FALL_H, [...greyPiece(0, 0), ...floor]),
    grid(FALL_W, FALL_H, [...lyingPiece(2, 3), ...floor]),
    grid(FALL_W, FALL_H, [...lyingPiece(3, 8), ...floor]),
    grid(FALL_W, FALL_H, [...lyingPiece(3, 13), ...floor]),
    grid(FALL_W, FALL_H, [...lyingPiece(3, 16), ...floor]),
    grid(FALL_W, FALL_H, [...lyingPiece(3, 16), ...floor]),
  ],
  frameMs: 260,
};

const keptPiece = bsRecoloured(bsPawn, 'bs23-piece-gold', BS_COAT_GOLD);
const strategistRight = bsMirrored(bsStrategist, 'bs23-strategist-right');

export const bs23Opener: SceneArt = {
  id: 'bs23-opener',
  label: 'A strategist rakes a crowd of grey pieces off the end of the war table and keeps only four gold ones, under a chart of the four portfolio quadrants.',
  width: 80,
  height: 60,
  base: bsWarRoom,
  layers: [
    { sprite: bsScroll, x: 2, y: 1 },
    { sprite: bcg, x: 6, y: 6 },
    { sprite: glint, x: 11, y: 10, motion: { kind: 'twinkle', periodMs: 1900, min: 0.1 } },
    { sprite: bsTorch, x: 36, y: 9 },
    { sprite: bsEmber, x: 37, y: 7, motion: { kind: 'rise', amp: 4, periodMs: 1500 } },
    { sprite: bsEmber, x: 38, y: 8, motion: { kind: 'rise', amp: 5, periodMs: 2100, phase: 0.5 } },
    { sprite: bsStar, x: 74, y: 7, motion: { kind: 'twinkle', periodMs: 1900, min: 0.2 } },
    { sprite: bsStar, x: 73, y: 10, motion: { kind: 'twinkle', periodMs: 2500, phase: 0.6, min: 0.2 } },
    { sprite: bsWarTable, x: 9, y: 37 },
    { sprite: keptPiece, x: 14, y: 39 },
    { sprite: keptPiece, x: 19, y: 41 },
    { sprite: keptPiece, x: 24, y: 39 },
    { sprite: keptPiece, x: 29, y: 41 },
    { sprite: crowd, x: 33, y: 38 },
    { sprite: falling, x: 67, y: 38 },
    { sprite: bsCandle, x: 11, y: 33 },
    { sprite: strategistRight, x: 40, y: 17 },
  ],
};

const emblem: PixelSprite = {
  id: 'bs23-emblem-matrix',
  name: 'emblem-matrix',
  tags: [],
  blurb: 'Lesson 23 emblem, 16x16: the four-quadrant portfolio grid in gold, a gold star top left, a question mark, coins and a red cross.',
  rows: [
    '................',
    '.OOOOOOOOOOOOOO.',
    '.O..y..OO.PPP.O.',
    '.O.yGg.OO....PO.',
    '.OyGGGgOO..PP.O.',
    '.O.GGg.OO.....O.',
    '.O.g.g.OO..P..O.',
    '.OOOOOOOOOOOOOO.',
    '.OOOOOOOOOOOOOO.',
    '.O.....OOr...rO.',
    '.OyG...OO.r.r.O.',
    '.OOgyG.OO..r..O.',
    '.OyGOg.OO.r.r.O.',
    '.OOgyG.OOr...rO.',
    '.OOOOOOOOOOOOOO.',
    '................',
  ],
};

export const bs23Finish: SceneArt = bsKeepsake(
  'bs23-finish',
  'A purple house banner on a gold rod, its roundel showing a four part portfolio grid with a gold star in one corner.',
  emblem,
);

export const art: LessonArtSet = { opener: bs23Opener, backdrop: bsBackdrop, finish: bs23Finish };
