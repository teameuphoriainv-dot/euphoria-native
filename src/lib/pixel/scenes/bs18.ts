/**
 * Business Strategy lesson 18 opener: a crisis is met in the first hour, and in the open.
 *
 * Built on bsHarbour. The house ship has caught fire at its mooring: flames climb from the deck into
 * the sail and smoke drifts across the moon. Nobody waits to learn the whole story before acting. The
 * lighthouse is already flashing the alarm, the strategist stands on the jetty directing, and the crew
 * have formed the bucket chain they drilled for a night like this, passing water hand to hand and
 * throwing it at the bow. The fire is the brightest mark, doubled in the water; the jetty party stands
 * dark in front of it. Moving: the flames leap, the smoke sways and puffs rise, sparks fly up, the
 * reflection flickers, the lighthouse flashes, the bucket goes down the chain and the water flies, the
 * crew shift, the strategist points and blinks, and stars twinkle.
 */
import type { PixelSprite } from '../types';
import { bsBackdrop } from './bs-backdrop';
import { bsEmber, bsMoved, bsStar } from './bs-kit';
import { BS_COAT_BLUE, BS_COAT_GREEN, bsFolk, bsHarbour, bsMirrored, bsRecoloured, bsStrategistStand } from './bs-kit-a';
import { bsKeepsake } from './bs1-finish';
import type { LessonArtSet, SceneArt } from './types';

const ship: PixelSprite = {
  id: 'bs18-ship',
  name: 'ship',
  tags: [],
  blurb: 'The house ship at its mooring, its orchid sail scorched through near the foot of the mast. The bow post is at (x, y + 17), the waterline on the bottom row.',
  rows: [
    '..............y...............',
    '..............D...............',
    '.....EEEEEEEEEDEEEEEEEEE......',
    '.....qPPPPPPPPDPPPPPPPPE......',
    '.....qPPPPPPPPDPPPPPPPPE......',
    '.....qPPPPPPPPDPPPPPPPPE......',
    '.....qPPPPPPPPDPPPPPPPPE......',
    '.....qGGGGGGGGDGGGGGGGGE......',
    '.....qPPPPPPPPDPPPPPPPPE......',
    '.....qPPPPPPPPDPPPPPPPPE......',
    '.....qPPPPPPPPDPPPPPPPPE......',
    '.....qPPPPPKKPDPPPPPPPPE......',
    '.....qPPPPK11KDPPPPPPPPE......',
    '.....qPPP1K..KD1PPPPPPPE......',
    '.....EEE1K....D.1EEEEEEE......',
    '..............D...............',
    '..............D...............',
    'O.............D..............O',
    '.O............D.............O.',
    '.OOOOOOOOOOOOOOOOOOOOOOOOOOOO.',
    '.gggggOgggggOgggggOgggggOgggg.',
    '..OOOOOOOOOOOOOOOOOOOOOOOOOO..',
    '...gggggggggggggggggggggggg...',
    '....OOOOOOOOOOOOOOOOOOOOOO....',
    '.....bbbbbbbbbbbbbbbbbbbb.....',
  ],
};

const fireRows = [
  '.....3..........',
  '....343.....3...',
  '....343....343..',
  '..2.3443...343..',
  '.23234542.23432.',
  '.34344443234432.',
  '2344454443444432',
  '2344555444554432',
  '1334455545544331',
  '1233444444443321',
  '1223333443333221',
  '.11223333332211.',
  '..111111111111..',
];

const fire: PixelSprite = {
  id: 'bs18-fire',
  name: 'fire',
  tags: [],
  blurb: 'The fire on the deck, licking up into the sail. Its embers sit on the bottom row; the tongues leap and change.',
  rows: fireRows,
  frames: [
    fireRows,
    bsMoved(fireRows, {
      0: '......3.........',
      1: '.....343...3....',
      2: '...2.343..343...',
      3: '..23.3443.3432..',
      4: '.2343345423432..',
    }),
    fireRows,
    bsMoved(fireRows, {
      0: '....3.......3...',
      1: '...343......3...',
      2: '...3432.....43..',
      3: '.2.34432..2343..',
      4: '.2323454323432..',
    }),
  ],
  frameMs: 340,
};

const sternFireRows = [
  '..3...',
  '.343..',
  '.3432.',
  '234432',
  '234432',
  '123321',
  '.1111.',
];

const sternFire: PixelSprite = {
  id: 'bs18-stern-fire',
  name: 'stern-fire',
  tags: [],
  blurb: 'A second, smaller blaze at the stern.',
  rows: sternFireRows,
  frames: [
    sternFireRows,
    bsMoved(sternFireRows, {
      0: '...3..',
      1: '..343.',
      2: '.3443.',
    }),
    bsMoved(sternFireRows, {
      0: '.3....',
      1: '.343..',
      2: '23432.',
    }),
  ],
  frameMs: 300,
};

const smoke: PixelSprite = {
  id: 'bs18-smoke',
  name: 'smoke',
  tags: [],
  blurb: 'The smoke column, rising from behind the sail and leaning off toward the moon. Drawn before the ship so the sail hides its root.',
  rows: [
    '..........DDDD..',
    '........DDXXXDD.',
    '.......DXXXXXXD.',
    '......DXXDDXXXD.',
    '......DXDDDDXD..',
    '.....DXXD..DD...',
    '.....DXXXD......',
    '....DXXXXD......',
    '....DXXXD.......',
    '...DXXXD........',
    '...DXXD.........',
    '...DXXD.........',
    '..DXXXD.........',
    '..DXXD..........',
    '..DXXD..........',
    '..DXD...........',
    '.DXXD...........',
    '.DXD............',
    '.DXD............',
    '.DD.............',
    '..D.............',
    '................',
  ],
};

const puff: PixelSprite = {
  id: 'bs18-puff',
  name: 'puff',
  tags: [],
  blurb: 'A puff of smoke breaking off the top of the column, for a rise layer.',
  rows: [
    '.DD.',
    'DXXD',
    '.DD.',
  ],
};

const glow: PixelSprite = {
  id: 'bs18-glow',
  name: 'glow',
  tags: [],
  blurb: 'The fire again, broken up on the water under the hull.',
  rows: [
    '..2..33..2...3..22....',
    '....3..2...33...2..3..',
    '.1..2....3....2....1..',
    '....1..2...1....2.....',
    '..1.....1....1........',
  ],
};

const alarm: PixelSprite = {
  id: 'bs18-alarm',
  name: 'alarm',
  tags: [],
  blurb: "The lighthouse lamp burning red with its rays, at (1, 1) so the lamp fills the lamp room: a twinkle layer makes it flash.",
  rows: [
    '.r....r..',
    '.........',
    'rr.RR.rr.',
    '...Rs....',
  ],
};

/** A mark on the bucket chain's grid: column, row and the character to put there. */
type Mark = readonly [number, number, string];

const CHAIN_W = 26;
const CHAIN_H = 12;

/** One frame of the chain: marks on a blank grid the size of the sprite, so every row comes out the same width. */
function chainFrame(...marks: Mark[]): string[] {
  const grid = Array.from({ length: CHAIN_H }, () => Array.from({ length: CHAIN_W }, () => '.'));
  for (const [x, y, ch] of marks) grid[y][x] = ch;
  return grid.map((row) => row.join(''));
}

/** A bucket hanging from a hand on row 9 at column `x`. */
const held = (x: number): Mark[] => [
  [x - 1, 10, 'g'], [x, 10, 'B'], [x + 1, 10, 'g'],
  [x - 1, 11, 'O'], [x, 11, 'g'], [x + 1, 11, 'O'],
];

/** The same bucket swung up and tipped toward the ship. */
const tipped = (x: number): Mark[] => [
  [x, 9, 'g'], [x + 1, 9, 'B'], [x - 1, 10, 'O'], [x, 10, 'g'], [x + 1, 10, 'O'],
];

const chain: PixelSprite = {
  id: 'bs18-bucket-chain',
  name: 'bucket-chain',
  tags: [],
  blurb: "One bucket's trip down the chain, at (14, 36): from the first hand to the second, to the end of the jetty, then thrown, the water arcing onto the bow.",
  rows: chainFrame(...held(7)),
  frames: [
    chainFrame(...held(1)),
    chainFrame(...held(7)),
    chainFrame(...held(14)),
    chainFrame(...tipped(14), [16, 8, 'B'], [17, 7, 'B'], [16, 7, 'w']),
    chainFrame(...tipped(14), [18, 6, 'B'], [19, 5, 'B'], [20, 5, 'w'], [19, 6, 'B']),
    chainFrame([22, 6, 'B'], [23, 7, 'w'], [24, 6, 'w'], [24, 8, 'w'], [25, 7, 'B']),
  ],
  frameMs: 330,
};

const crewGreen = bsRecoloured(bsFolk, 'bs18-crew-green', BS_COAT_GREEN);
const crewBlue = bsRecoloured(bsFolk, 'bs18-crew-blue', BS_COAT_BLUE, { S: '#F4CBA4', U: '#D6A87C', H: '#3A2418' });
const strategistRight = bsMirrored(bsStrategistStand, 'bs18-strategist-right');

export const bs18Opener: SceneArt = {
  id: 'bs18-opener',
  label: 'On a night harbour a ship burns at its mooring, while a strategist on the jetty directs a bucket chain and the lighthouse flashes the alarm.',
  width: 80,
  height: 60,
  base: bsHarbour,
  layers: [
    { sprite: bsStar, x: 27, y: 6, motion: { kind: 'twinkle', periodMs: 2100, min: 0.2 } },
    { sprite: bsStar, x: 38, y: 3, motion: { kind: 'twinkle', periodMs: 2700, phase: 0.5, min: 0.2 } },
    { sprite: bsStar, x: 20, y: 11, motion: { kind: 'twinkle', periodMs: 2400, phase: 0.8, min: 0.2 } },
    { sprite: alarm, x: 1, y: 1, motion: { kind: 'twinkle', periodMs: 1000, min: 0.1 } },
    { sprite: smoke, x: 48, y: 5, motion: { kind: 'drift', amp: 1, periodMs: 4200 } },
    { sprite: puff, x: 57, y: 4, motion: { kind: 'rise', amp: 4, periodMs: 2600 } },
    { sprite: puff, x: 54, y: 8, motion: { kind: 'rise', amp: 5, periodMs: 3100, phase: 0.5 } },
    { sprite: ship, x: 37, y: 25 },
    { sprite: glow, x: 40, y: 50, motion: { kind: 'twinkle', periodMs: 1300, min: 0.35 } },
    { sprite: fire, x: 41, y: 31 },
    { sprite: sternFire, x: 58, y: 37 },
    { sprite: bsEmber, x: 45, y: 28, motion: { kind: 'rise', amp: 7, periodMs: 1700 } },
    { sprite: bsEmber, x: 50, y: 29, motion: { kind: 'rise', amp: 6, periodMs: 2100, phase: 0.4 } },
    { sprite: bsEmber, x: 61, y: 35, motion: { kind: 'rise', amp: 5, periodMs: 1500, phase: 0.7 } },
    { sprite: strategistRight, x: 0, y: 18 },
    { sprite: crewGreen, x: 15, y: 37, motion: { kind: 'bob', amp: 1, periodMs: 1300 } },
    { sprite: crewBlue, x: 22, y: 37, motion: { kind: 'bob', amp: 1, periodMs: 1300, phase: 0.5 } },
    { sprite: chain, x: 14, y: 36 },
  ],
};

const emblem: PixelSprite = {
  id: 'bs18-emblem-bell',
  name: 'emblem-bell',
  tags: [],
  blurb: 'Lesson 18 emblem, 16x16: a gold alarm bell ringing, white sound lines either side.',
  rows: [
    '................',
    '.......OO.......',
    '......OyGO......',
    '.....OyGGgO.....',
    '....OyGGGGgO....',
    '.w..OyGGGGgO..w.',
    'w..OyGGGGGGgO..w',
    'w..OyGGGGGGgO..w',
    '.w.OyGGGGGGgO.w.',
    '..OyGGGGGGGGgO..',
    '..OyGGGGGGGGgO..',
    '.OyGGGGGGGGGGgO.',
    '.OOOOOOOOOOOOOO.',
    '......OyGO......',
    '.......OO.......',
    '................',
  ],
};

export const bs18Finish: SceneArt = bsKeepsake(
  'bs18-finish',
  'A purple house banner on a gold rod, its roundel showing a gold alarm bell ringing, with small sparkles around it.',
  emblem,
);

export const art: LessonArtSet = { opener: bs18Opener, backdrop: bsBackdrop, finish: bs18Finish };
