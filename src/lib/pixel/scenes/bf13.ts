/**
 * Behavioral Finance lesson 13: regret aversion and decision paralysis, inside the investor's head.
 *
 * Built on bfMindRoom. Through the left eye a wall of eighteen funds, the jam-jar study's too many
 * choices, with a selection box that hops from one to the next and never settles; through the right
 * the cost of waiting, the market climbing away from cash that stays flat. In the room System 1 has
 * frozen: the hare faces us, paws pressed to its cheeks, eyes darting, question marks rising, while an
 * hourglass drains beside it. The tortoise walks in with a coin to put to work now.
 *
 * The keepsake jar holds an hourglass.
 */
import type { PixelSprite } from '../types';
import {
  bfConsoleLights,
  bfLater,
  bfMindRoom,
  bfShadowNarrow,
  bfShadowWide,
  bfStar,
  bfStarBig,
  bfTortoise,
} from './bf-kit';
import { bfCoin, bfStamp } from './bf-kit-b';
import { bfBackdrop } from './bf-backdrop';
import { bfKeepsake } from './bf1-finish';
import type { LessonArtSet, SceneArt } from './types';

/** The left eye: too many funds to choose from. */
const choiceWall: PixelSprite = {
  id: 'bf13-opener-choices',
  name: 'bf13-opener-choices',
  tags: ['scene', 'bf13'],
  rows: [
    'GG.FF.NN.BB.qq.RR',
    'GG.FF.NN.BB.qq.RR',
    '.................',
    'FF.NN.yy.RR.BB.GG',
    'FF.NN.yy.RR.BB.GG',
    '.................',
    'NN.qq.GG.FF.RR.BB',
    'NN.qq.GG.FF.RR.BB',
  ],
};

/** The selection box, hopping from fund to fund and never settling on one. */
const cursor: PixelSprite = {
  id: 'bf13-opener-cursor',
  name: 'bf13-opener-cursor',
  tags: ['scene', 'bf13'],
  rows: [
    'wwww...............',
    'w..w...............',
    'w..w...............',
    'wwww...............',
    '...................',
    '...................',
    '...................',
    '...................',
    '...................',
    '...................',
  ],
  frames: [
    [
      'wwww...............',
      'w..w...............',
      'w..w...............',
      'wwww...............',
      '...................',
      '...................',
      '...................',
      '...................',
      '...................',
      '...................',
    ],
    [
      '...................',
      '...................',
      '...................',
      '............wwww...',
      '............w..w...',
      '............w..w...',
      '............wwww...',
      '...................',
      '...................',
      '...................',
    ],
    [
      '...................',
      '...................',
      '...................',
      '...................',
      '...................',
      '...................',
      '...wwww............',
      '...w..w............',
      '...w..w............',
      '...wwww............',
    ],
    [
      '...............wwww',
      '...............w..w',
      '...............w..w',
      '...............wwww',
      '...................',
      '...................',
      '...................',
      '...................',
      '...................',
      '...................',
    ],
    [
      '...................',
      '...................',
      '...................',
      '......wwww.........',
      '......w..w.........',
      '......w..w.........',
      '......wwww.........',
      '...................',
      '...................',
      '...................',
    ],
  ],
  frameMs: 450,
};

/** The right eye: cash drag, the market climbing in green away from cash flat in grey. */
const cashDrag: PixelSprite = {
  id: 'bf13-opener-cash-drag',
  name: 'bf13-opener-cash-drag',
  tags: ['scene', 'bf13'],
  rows: [
    '...................W',
    '.................NN.',
    '...............NN...',
    '.............NN.....',
    '...........NN.......',
    '.........NN.........',
    '......NNN...........',
    '....NN..............',
    '..NN................',
    'NNXXXXXXXXXXXXXXXXXw',
  ],
};

const frozen = [
  '....DD.........DD....',
  '...DxwD.......DwxD...',
  '...DxFD.......DFxD...',
  '...DxFwD.....DwFxD...',
  '....DxFD.....DFxD....',
  '....DxFwD...DwFxD....',
  '.....DxFD...DFxD.....',
  '.....DxwD...DwxD.....',
  '....DDxxDDDDDxxDD....',
  '...DXxxxxxxxxxxxXD...',
  '..DXxxxxxxxxxxxxxXD..',
  '..DXxWWWxxxxxWWWxXD..',
  '..DXxWKWxxxxxWKWxXD..',
  '.DwwDWWWxxxxxWWWDwwD.',
  'DwwwwxxxxxFxxxxxwwwwD',
  'DwwwXxxxxxKxxxxxXwwwD',
  '.DwwDXxxxxKxxxxXDwwD.',
  '.DXD.DXxxxxxxxXD.DXD.',
  '.DXXD.DDXxxxXDD.DXXD.',
  '..DXXDDXxwwwxXDDXXD..',
  '...DXXXxwwwwwxXXXD...',
  '....DXxxwwwwwxxXD....',
  '....DXxxwwwwwxxXD....',
  '....DXxxxwwwxxxXD....',
  '...DXXxxxxxxxxxXXD...',
  '..DXXxxDDDDDDDxxXXD..',
  '..DwwwwD.....DwwwwD..',
  '..DDDDDD.....DDDDDD..',
];
const glance = (eyes: string) => frozen.map((row, y) => (y === 12 ? eyes : row));

/** System 1 frozen by choice: facing us, paws pressed to its cheeks, eyes darting side to side. */
const hareFrozen: PixelSprite = {
  id: 'bf13-hare-frozen',
  name: 'bf13-hare-frozen',
  tags: ['character', 'bf13', 'system-1'],
  rows: frozen,
  frames: [frozen, glance('..DXxKWWxxxxxKWWxXD..'), frozen, glance('..DXxWWKxxxxxWWKxXD..')],
  frameMs: 500,
};

const question: PixelSprite = {
  id: 'bf13-question',
  name: 'bf13-question',
  tags: ['prop', 'bf13'],
  blurb: "A question mark, made to rise off a head that cannot decide.",
  rows: [
    '.ww.',
    'w..w',
    '..w.',
    '.w..',
    '....',
    '.w..',
  ],
};

/** An hourglass on the floor, the sand running out while nothing gets decided. */
const hourglass: PixelSprite = {
  id: 'bf13-hourglass',
  name: 'bf13-hourglass',
  tags: ['prop', 'bf13'],
  rows: [
    'OOOOOOOOO',
    '.OgGGGgO.',
    '.x.....x.',
    '.xyyyyyx.',
    '..xyyyx..',
    '...xyx...',
    '....y....',
    '...xyx...',
    '..x.y.x..',
    '.x..y..x.',
    '.x..G..x.',
    '.xGGGGGx.',
    '.OgGGGgO.',
    'OOOOOOOOO',
  ],
  frames: [
    [
      'OOOOOOOOO',
      '.OgGGGgO.',
      '.x.....x.',
      '.xyyyyyx.',
      '..xyyyx..',
      '...xyx...',
      '....y....',
      '...xyx...',
      '..x.y.x..',
      '.x..y..x.',
      '.x..G..x.',
      '.xGGGGGx.',
      '.OgGGGgO.',
      'OOOOOOOOO',
    ],
    [
      'OOOOOOOOO',
      '.OgGGGgO.',
      '.x.....x.',
      '.x.....x.',
      '..xyyyx..',
      '...xyx...',
      '....y....',
      '...xyx...',
      '..x.y.x..',
      '.x..y..x.',
      '.x.GGG.x.',
      '.xGGGGGx.',
      '.OgGGGgO.',
      'OOOOOOOOO',
    ],
    [
      'OOOOOOOOO',
      '.OgGGGgO.',
      '.x.....x.',
      '.x.....x.',
      '..x...x..',
      '...xyx...',
      '....y....',
      '...x.x...',
      '..x.y.x..',
      '.x..G..x.',
      '.xGGGGGx.',
      '.xGGGGGx.',
      '.OgGGGgO.',
      'OOOOOOOOO',
    ],
  ],
  frameMs: 700,
};

/** The fix in the tortoise's mouth: a coin, invested now rather than when it feels safe. */
const tortoiseCoin = bfStamp(bfTortoise, 'bf13-tortoise-coin', bfCoin, 33, 6, [0, 1]);

const consoleLightsLater = bfLater(bfConsoleLights, 'bf13-opener-console-lights-later', 1, 520);

export const bf13Opener: SceneArt = {
  id: 'bf13-opener',
  label: "Inside an investor's head, a frozen hare clutches its cheeks before a wall of too many choices while an hourglass drains and the market climbs away, and a calm tortoise walks in with a coin to invest.",
  width: 80,
  height: 60,
  base: bfMindRoom,
  layers: [
    { sprite: bfStar, x: 17, y: 27, motion: { kind: 'twinkle', periodMs: 2100, min: 0.2 } },
    { sprite: bfStarBig, x: 52, y: 14, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.5, min: 0.3 } },
    { sprite: choiceWall, x: 14, y: 17 },
    { sprite: cursor, x: 13, y: 16 },
    { sprite: cashDrag, x: 49, y: 17 },
    { sprite: bfConsoleLights, x: 24, y: 34 },
    { sprite: consoleLightsLater, x: 66, y: 34 },
    { sprite: bfShadowWide, x: 1, y: 54 },
    { sprite: bfShadowNarrow, x: 41, y: 54 },
    { sprite: hourglass, x: 67, y: 41 },
    { sprite: tortoiseCoin, x: 0, y: 39 },
    { sprite: hareFrozen, x: 41, y: 28 },
    { sprite: question, x: 37, y: 23, motion: { kind: 'rise', amp: 4, periodMs: 1700 } },
    { sprite: question, x: 63, y: 22, motion: { kind: 'rise', amp: 4, periodMs: 1700, phase: 0.5 } },
  ],
};

const emblemHourglass: PixelSprite = {
  id: 'bf13-emblem-hourglass',
  name: 'bf13-emblem-hourglass',
  tags: ['emblem', 'bf', 'lesson-13'],
  blurb: "Lesson 13's emblem: regret aversion caught as an hourglass, the sand running out while you wait.",
  rows: [
    'OOOOOOOOOOOOO',
    'OyGGGGGGGGGgO',
    '.OOOOOOOOOOO.',
    '.Dw.......xD.',
    '.DwyyyyyyyxD.',
    '..DwyyyyyxD..',
    '...DwyyyxD...',
    '....DwyxD....',
    '.....DyD.....',
    '....Dw.xD....',
    '...Dw.y.xD...',
    '..Dw..y..xD..',
    '.Dw..GyG..xD.',
    '.DwGGGGGGGxD.',
    '.OOOOOOOOOOO.',
    'OyGGGGGGGGGgO',
    'OOOOOOOOOOOOO',
  ],
};

export const bf13Finish: SceneArt = bfKeepsake(
  'bf13-finish',
  'A corked glass jar with a paper tag, holding a small gold hourglass with its sand running down, with bubbles rising inside and sparkles around it.',
  emblemHourglass,
);

export const art: LessonArtSet = { opener: bf13Opener, backdrop: bfBackdrop, finish: bf13Finish };
