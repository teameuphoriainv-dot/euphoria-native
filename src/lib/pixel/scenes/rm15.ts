/**
 * Risk Management lesson 15 opener, Insurance & Risk Transfer: the lifeboat house, its big doors open
 * on the storm. A boat has gone over and the mate is clinging to its upturned hull; the keeper has
 * thrown a life ring on a line, and it is in the air between them. Insurance is the ring you hung on
 * the wall before the storm, one of many, so that when the loss comes it lands on someone able to
 * carry it. The rack keeps the rest ready, one peg empty. Moving: the ring, the boat in the swell,
 * rain and lightning outside, the lantern.
 */
import type { PixelSprite } from '../types';
import { rmBackdrop } from './rm-backdrop';
import { RM_PALETTE, rmCompose, rmKeepsake, rmLantern, rmLater, rmLightning, rmWatchRoom } from './rm-kit';
import { rmFlip, rmKeeperReach, rmMark, rmPortRain, rmPortSwell } from './rm-kit-a';
import { rmFill } from './rm-kit-b';
import type { LessonArtSet, SceneArt } from './types';

/**
 * The open doors: a timber frame round the storm outside, cloud over a far horizon and the sea coming
 * right up to the threshold. 34x42.
 */
const doorway: PixelSprite = {
  id: 'rm15-opener-doorway',
  name: 'open doors',
  tags: ['scene', 'rm15'],
  palette: RM_PALETTE,
  rows: rmFill(
    Array.from({ length: 42 }, (_, y) => {
      if (y === 0) return 'D'.repeat(34);
      if (y === 1) return `D${'X'.repeat(32)}D`;
      const fill = y < 13 ? 'k' : y < 20 ? 'D' : y === 20 ? 'u' : y < 28 ? 'V' : 'v';
      return `DX${fill.repeat(30)}XD`;
    }),
    [
      [2, 20, 2, 'K'], [2, 14, 3, 'K'], [22, 31, 4, 'K'], [26, 31, 5, 'K'],
      [6, 18, 8, 'K'], [9, 15, 9, 'K'], [20, 31, 11, 'K'],
      [2, 9, 15, 'k'], [16, 28, 17, 'k'],
      [5, 10, 23, 'u'], [18, 24, 25, 'u'], [3, 8, 30, 'u'], [24, 30, 32, 'u'],
      [10, 16, 35, 'u'], [2, 31, 40, 'U'], [2, 31, 41, 'u'],
      [4, 6, 40, 'w'], [15, 17, 40, 'w'], [26, 28, 40, 'w'],
    ],
  ),
};

/** A life ring: red, with its four white bands. 9x9. */
const ring: PixelSprite = {
  id: 'rm15-opener-ring',
  name: 'life ring',
  tags: ['scene', 'rm15'],
  rows: [
    '...RRR...',
    '.RRRwRRr.',
    '.RR...rr.',
    'Rw.....wr',
    'Rw.....wr',
    'Rw.....wr',
    '.RR...rr.',
    '.rRRwRrr.',
    '...rrr...',
  ],
};

/** The rack on the wall: a plank with three pegs, the top one empty. 6x34. */
const rack: PixelSprite = {
  id: 'rm15-opener-rack',
  name: 'ring rack',
  tags: ['scene', 'rm15'],
  rows: rmMark(
    ['OOOOOO', ...Array.from({ length: 32 }, () => 'OGGGgO'), 'OOOOOO'],
    [[2, 3, 'D'], [3, 3, 'D'], [3, 4, 'D'], [2, 13, 'D'], [3, 13, 'D'], [2, 23, 'D'], [3, 23, 'D']],
  ),
};

/** The upturned boat with the mate clinging to it, orchid hat and all; give it a `bob`. 14x7. */
const capsized: PixelSprite = {
  id: 'rm15-opener-capsized',
  name: 'capsized boat',
  tags: ['scene', 'rm15'],
  palette: RM_PALETTE,
  rows: [
    '.EEE..........',
    'EPqPE..DDDDDD.',
    '.SKSS.DrRsRRrD',
    'SSSSSDRRRRRRrD',
    '.SSDDRRRRRRrrD',
    'UwUURRRRRrrrrU',
    'UUUUUUwUUUUwUU',
  ],
};

/** The line from the keeper's hand up and out through the doors to the ring. 14x11. */
const line: PixelSprite = {
  id: 'rm15-opener-line',
  name: 'line',
  tags: ['scene', 'rm15'],
  rows: rmMark(
    Array.from({ length: 11 }, () => '.'.repeat(14)),
    [[0, 10, 'x'], [1, 9, 'X'], [2, 8, 'x'], [3, 7, 'X'], [4, 6, 'x'], [5, 5, 'X'], [6, 4, 'x'], [7, 3, 'X'], [8, 2, 'x'], [9, 2, 'X'], [10, 1, 'x'], [11, 1, 'X'], [12, 0, 'x'], [13, 0, 'X']],
  ),
};

/** The lantern's chain from the ceiling. 1x3. */
const chain: PixelSprite = {
  id: 'rm15-opener-chain',
  name: 'chain',
  tags: ['scene', 'rm15'],
  rows: ['X', 'x', 'X'],
};

/** Floor shadow under the keeper. */
const floorShadow: PixelSprite = {
  id: 'rm15-opener-floor-shadow',
  name: 'rm15-opener-floor-shadow',
  tags: ['scene', 'rm15'],
  palette: RM_PALETTE,
  rows: [
    '..ZZZZZZZZZZZZZZZZ',
    '....ZZZZZZZZZZZZ..',
  ],
};

const base = rmCompose('rm15-opener-base', rmWatchRoom(80, 60, 50), [
  [doorway, 44, 8],
  [rack, 7, 6],
  [chain, 33, 2],
  [line, 40, 28],
  [floorShadow, 21, 52],
]);

export const rm15Opener: SceneArt = {
  id: 'rm15-opener',
  label: 'Inside a lifeboat house, a lighthouse keeper throws a red and white life ring on a line out through the open doors to a sailor clinging to an upturned boat in a storm, as more rings hang ready on the wall.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: rmLightning, x: 64, y: 11 },
    { sprite: rmPortSwell, x: 48, y: 42, motion: { kind: 'drift', amp: 1, periodMs: 3000 } },
    { sprite: capsized, x: 60, y: 37, motion: { kind: 'bob', amp: 1, periodMs: 2200 } },
    { sprite: rmPortSwell, x: 63, y: 45, motion: { kind: 'drift', amp: 1, periodMs: 3400, phase: 0.5 } },
    { sprite: rmPortRain, x: 46, y: 10 },
    { sprite: rmLater(rmPortRain, 'rm15-opener-rain-later', 1, 170), x: 57, y: 18 },
    { sprite: ring, x: 5, y: 20 },
    { sprite: ring, x: 5, y: 30 },
    { sprite: rmLantern, x: 30, y: 5 },
    { sprite: rmFlip(rmKeeperReach, 'rm15-opener-keeper'), x: 22, y: 24 },
    { sprite: ring, x: 52, y: 20, motion: { kind: 'bob', amp: 1, periodMs: 1600 } },
  ],
};

/** Lesson 15's emblem: the lifeboat, orange cabin over a blue hull, riding a wave. 16x11. */
const emblemLifeboat: PixelSprite = {
  id: 'rm15-emblem-lifeboat',
  name: 'lifeboat',
  tags: ['rm', 'emblem', 'lesson 15'],
  palette: RM_PALETTE,
  rows: [
    '.......DD.......',
    '......D33D......',
    '.....D3ww3D.....',
    '....D333333D....',
    '.DDDDDDDDDDDDDD.',
    'DwwwwwwwwwwwwwwD',
    '.DbbbbbbbbbbbbD.',
    '..DbbbbbbbbbbD..',
    '...DDDDDDDDDD...',
    'uUuuUUuuUuuUUuuU',
    '.uuuuuuuuuuuuuu.',
  ],
};

export const rm15Finish: SceneArt = rmKeepsake(
  'rm15-finish',
  'A red and white life ring hanging from a rope, with a lifeboat at its center, an orange cabin over a blue hull, riding a wave.',
  emblemLifeboat,
);

export const art: LessonArtSet = { opener: rm15Opener, backdrop: rmBackdrop, finish: rm15Finish };
