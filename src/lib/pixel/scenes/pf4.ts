/**
 * Personal Finance lesson 4, Building an Emergency Fund: saving for the rainy day that comes.
 *
 * Night, and it is raining: the window streams, and the ceiling has sprung a leak that drips into a
 * bucket on the floor, the kind of surprise the lesson's fund exists for. On the table the fund
 * itself, a glass jar of coins with a first-aid cross on its label, and the figure, now reaching from
 * the right, feeding it one more coin. Moving: the rain, the coin, the drip, the lamp, the cat's z.
 */
import type { PixelSprite } from '../types';
import {
  pfCat,
  pfCompose,
  pfCurtain,
  pfKitchen,
  pfLampGlow,
  pfLampPool,
  pfPendantLamp,
  pfTable,
  pfZzz,
} from './pf-kit';
import { pfSaverReachLeft, pfWindowNight } from './pf-kit-a';
import { pfKeepsake } from './pf1-finish';
import { pfBackdrop } from './pf-backdrop';
import type { LessonArtSet, SceneArt } from './types';

/** The emergency fund: a lidded glass jar of coins, a slot in the lid at columns 4 to 6. */
const fundJar: PixelSprite = {
  id: 'pf4-fund-jar',
  name: 'fund jar',
  tags: ['scene', 'pf'],
  rows: [
    '..OOOOOOO..',
    '..OGKKKGO..',
    '..OgggggO..',
    '..xxxxxxX..',
    '.xw......X.',
    'xw.wwwww..X',
    'xw.wwRww..X',
    'xwGwRRRwyGX',
    'xGgwwRwwGgX',
    'xgGwwwwwgGX',
    'xGgGyGgGyGX',
    '.xxxxxxxXX.',
  ],
};

/** A coin let go over the jar's slot, which is just under the sprite: held, sunk in, a glint. */
const jarCoin: PixelSprite = {
  id: 'pf4-jar-coin',
  name: 'jar coin',
  tags: ['scene', 'pf'],
  rows: ['.OO.', 'OyGO', 'OGgO', '.OO.'],
  frames: [
    ['.OO.', 'OyGO', 'OGgO', '.OO.'],
    ['.OO.', 'OyGO', 'OGgO', '.OO.'],
    ['.OO.', 'OyGO', 'OGgO', '.OO.'],
    ['....', '.OO.', 'OyGO', 'OGgO'],
    ['....', '....', '.OO.', 'OyGO'],
    ['....', '....', '....', '.OO.'],
    ['....', '....', '..y.', '.yWy'],
    ['....', '....', '....', '..w.'],
    ['....', '....', '....', '....'],
    ['....', '....', '....', '....'],
  ],
  frameMs: 170,
};

/** Rain on the glass: three frames, five rows apart, so the streaks fall without a seam. The sash bar's row stays dry. */
const rain: PixelSprite = {
  id: 'pf4-rain',
  name: 'rain',
  tags: ['scene', 'pf'],
  rows: [
    'B............x...x..',
    'B............x....x.',
    '......x...........x.',
    '......x.x...........',
    '....................',
    '....x.......x......x',
    '..........x........x',
    '...B......x.........',
    '...B............x...',
    '................x...',
    '.........x..........',
    '.x.......x..........',
    '.x.............x....',
    '.......B.......x....',
    '.......B.........x..',
  ],
  frames: [
    [
      'B............x...x..',
      'B............x....x.',
      '......x...........x.',
      '......x.x...........',
      '....................',
      '....x.......x......x',
      '..........x........x',
      '...B......x.........',
      '...B............x...',
      '................x...',
      '.........x..........',
      '.x.......x..........',
      '.x.............x....',
      '.......B.......x....',
      '.......B.........x..',
    ],
    [
      '.........x..........',
      '.x.......x..........',
      '.x.............x....',
      '.......B.......x....',
      '....................',
      'B............x...x..',
      'B............x....x.',
      '......x...........x.',
      '......x.x...........',
      '....x...x...x.......',
      '....x.......x......x',
      '..........x........x',
      '...B......x.........',
      '...B............x...',
      '................x...',
    ],
    [
      '....x.......x......x',
      '..........x........x',
      '...B......x.........',
      '...B............x...',
      '....................',
      '.........x..........',
      '.x.......x..........',
      '.x.............x....',
      '.......B.......x....',
      '.......B.........x..',
      'B............x...x..',
      'B............x....x.',
      '......x...........x.',
      '......x.x...........',
      '....x...x...x.......',
    ],
  ],
  frameMs: 160,
};

/** The leak: a damp stain on the ceiling, and the bucket set under it. */
const stain: PixelSprite = {
  id: 'pf4-stain',
  name: 'stain',
  tags: ['scene', 'pf'],
  rows: [
    'DKKKKD',
    '.DKKD.',
  ],
};

const bucket: PixelSprite = {
  id: 'pf4-bucket',
  name: 'bucket',
  tags: ['scene', 'pf'],
  rows: [
    'DXXXXXXD',
    'DbBBBBbD',
    '.DxxxxX.',
    '.DxXxxX.',
    '.DDDDDD.',
    '.DxxxxX.',
    '..DDDD..',
  ],
};

/** The drip, 47 rows from the stain to the bucket's rim, its drop in column 1. */
const DRIP_ROWS = 47;
function dripFrame(cells: readonly (readonly [row: number, col: number, ch: string])[]): string[] {
  const grid = Array.from({ length: DRIP_ROWS }, () => ['.', '.', '.']);
  for (const [r, c, ch] of cells) grid[r][c] = ch;
  return grid.map((row) => row.join(''));
}
const fall = (r: number) => [[r, 1, 'B'], [r + 1, 1, 'b']] as const;

const drip: PixelSprite = {
  id: 'pf4-drip',
  name: 'drip',
  tags: ['scene', 'pf'],
  rows: dripFrame([[0, 1, 'b']]),
  frames: [
    dripFrame([[0, 1, 'b']]),
    dripFrame([[0, 1, 'B'], [1, 1, 'b']]),
    dripFrame(fall(4)),
    dripFrame(fall(11)),
    dripFrame(fall(19)),
    dripFrame(fall(28)),
    dripFrame(fall(37)),
    dripFrame(fall(44)),
    dripFrame([[45, 0, 'B'], [45, 2, 'B'], [46, 1, 'x']]),
    dripFrame([]),
    dripFrame([]),
  ],
  frameMs: 140,
};

/** Lesson 4's emblem: the fund jar between two raindrops. */
const emblemFund: PixelSprite = {
  id: 'pf4-emblem-fund',
  name: 'pf4-emblem-fund',
  tags: ['scene', 'pf', 'emblem'],
  rows: [
    '....OOOOOO....',
    '.B..OggggO..B.',
    '.b.xxxxxxxX.b.',
    '..xw.wRww..X..',
    '..xwwRRRwyGX..',
    '..xGwwRwwGgX..',
    '..xgGwwwwgGX..',
    '..xGgGyGgGyX..',
    '...xxxxxxXX...',
  ],
};

// Order is depth: the figure behind the table; the jar on its top (row 37), the bucket on the floor.
const base = pfCompose('pf4-opener-base', 80, 60, pfKitchen.rows, [
  [pfWindowNight, 3, 5],
  [pfCurtain, 2, 4],
  [pfCurtain, 26, 4],
  [stain, 65, 0],
  [pfPendantLamp, 31, 0],
  [pfSaverReachLeft, 34, 12],
  [pfTable(56, 12), 4, 36],
  [pfLampPool, 25, 37],
  [fundJar, 30, 26],
  [bucket, 64, 48],
  [pfCat, 12, 50],
]);

export const pf4Opener: SceneArt = {
  id: 'pf4-opener',
  label: 'On a rainy night, a person drops a coin into a jar of emergency savings on the kitchen table while a leak in the ceiling drips into a bucket and the cat sleeps on the rug.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: rain, x: 6, y: 7 },
    // The coin hangs from the hand (figure at 34,12; hand at column 1, row 10) above the jar's slot.
    { sprite: jarCoin, x: 34, y: 22 },
    { sprite: drip, x: 67, y: 2 },
    { sprite: pfLampGlow, x: 32, y: 9, motion: { kind: 'twinkle', periodMs: 3000, min: 0.55 } },
    { sprite: pfZzz, x: 11, y: 45, motion: { kind: 'rise', amp: 3, periodMs: 2800, phase: 0.3 } },
  ],
};

export const pf4Finish = pfKeepsake(
  'pf4-finish',
  'A gold house-shaped key fob with a teal roof on a key ring with a brass key, its window showing a jar of coins marked with a first aid cross between two raindrops, with small sparkles around it.',
  emblemFund,
);

export const art: LessonArtSet = { opener: pf4Opener, backdrop: pfBackdrop, finish: pf4Finish };
