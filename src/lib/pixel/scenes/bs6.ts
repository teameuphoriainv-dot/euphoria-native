/**
 * Business Strategy lesson 6 opener: scaling, a tower going up on ground already proven.
 *
 * Built on bsHillside. On the hilltop the finished lower floors are solid stone and lit; above them
 * the new courses go up inside scaffolding, and a crane on top hoists the next block. Across the
 * river the strategist points up at it, and on the far ridge a village's windows come on one after
 * another (a network that grows more valuable as it fills). The moon is the brightest mark, the lit
 * tower windows the warmest. Moving: the block rises and lowers, the strategist points and blinks,
 * the tower torch flickers and sparks, village lights come and go, a cloud crosses the moon, stars
 * twinkle.
 */
import type { PixelSprite } from '../types';
import { bsBackdrop } from './bs-backdrop';
import { bsEmber, bsMoved, bsStar, bsTorch } from './bs-kit';
import { bsHillside, bsStrategistStand } from './bs-kit-a';
import { bsKeepsake } from './bs1-finish';
import type { LessonArtSet, SceneArt } from './types';

const tower: PixelSprite = {
  id: 'bs6-tower',
  name: 'tower',
  tags: [],
  blurb: 'The tower going up: finished stone below, new courses in scaffolding above, a crane with its jib out to the right (jib end over x + 26). Foot on the bottom row.',
  rows: [
    '................O...........',
    '.........DggggggggggOOgggggg',
    '.........DOOOOOOOOOOOOOOOOOO',
    '.........DDD...gOO....OO....',
    '.........DDD...gO...OO......',
    '...............gO.OO........',
    '.O.............gOO..O.......',
    '.O.............gO...O.......',
    '.O.............gO...O.......',
    'ggggggggggggggggOggggg......',
    '.O.Dxx...XD.........O.......',
    '.O.DxDXX.DX..DX.....O.......',
    '.O.DDxXXDXX..XXXD.D.O.......',
    '.O.DxxXDXXXDXXXDX.D.O.......',
    '.O.DxxDXXXDXXXDXXXD.O.......',
    '.O.DxDXXXDXXXDXXXDD.O.......',
    'gggggggggggggggggggggg......',
    '.O.DxxXXXXXXXXXXXDD.O.......',
    '.O.DxxXXXXXXXXXXXDD.O.......',
    '.O.DxxDDDDDDDDDDDDD.O.......',
    '.O.DxxXyGXXXXyGXXDD.O.......',
    '.O.DxxXGGXXXXGGXXDD.O.......',
    '.O.DxxXXXXXXXXXXXDD.O.......',
    '.O.DxxDDDDDDDDDDDDD.O.......',
    '.O.DxxXXXXXXXXXXXDD.O.......',
    '.O.DxxXXXXXXXXXXXDD.O.......',
    '.O.DxxXXXDDDDXXXXDD.O.......',
    '.O.DxxDDDKOOKDDDDDD.O.......',
    '.O.DxxXXXKOOKXXXXDD.O.......',
    '.O.DxxXXXKOOKXXXXDD.O.......',
    '.O.DxxXXXKOOKXXXXDD.O.......',
    '.XxxxxxxxxxxxxxxxxxxX.......',
    '.DDDDDDDDDDDDDDDDDDDD.......',
    '.DDDDDDDDDDDDDDDDDDDD.......',
  ],
};

const hoistRows = [
  '..x..',
  '..x..',
  '..x..',
  '..x..',
  '..x..',
  '..x..',
  '..x..',
  '..x..',
  '..x..',
  '..x..',
  '..x..',
  'DxXXD',
  'DXXXD',
  'DDDDD',
  '.....',
  '.....',
  '.....',
];

const hoistB = bsMoved(hoistRows, {
  8: 'DxXXD',
  9: 'DXXXD',
  10: 'DDDDD',
  11: '.....',
  12: '.....',
  13: '.....',
});

const hoist: PixelSprite = {
  id: 'bs6-hoist',
  name: 'hoist',
  tags: [],
  blurb: "The crane's rope and the stone block on it, hung under the jib end; the block is hauled up and let down.",
  rows: hoistRows,
  frames: [
    hoistRows,
    hoistB,
    bsMoved(hoistRows, {
      5: 'DxXXD',
      6: 'DXXXD',
      7: 'DDDDD',
      8: '.....',
      9: '.....',
      10: '.....',
      11: '.....',
      12: '.....',
      13: '.....',
    }),
    hoistB,
  ],
  frameMs: 700,
};

const village: PixelSprite = {
  id: 'bs6-village',
  name: 'village',
  tags: [],
  blurb: 'Three small houses on the far ridge, unlit.',
  rows: [
    '.....D.........',
    '..D.DkD.....D..',
    '.DkDDkkD...DkD.',
    'DkkkDkkkD.DkkkD',
    'DkkkDkkkD.DkkkD',
    'DDDDDDDDDDDDDDD',
  ],
};

const lightsA: PixelSprite = {
  id: 'bs6-lights-a',
  name: 'lights-a',
  tags: [],
  blurb: 'Some of the village windows.',
  rows: [
    '...............',
    '...............',
    '...............',
    '.O.....O.......',
    '...............',
    '...............',
  ],
};

const lightsB: PixelSprite = {
  id: 'bs6-lights-b',
  name: 'lights-b',
  tags: [],
  blurb: 'The rest of the village windows, lit out of step with the first.',
  rows: [
    '...............',
    '...............',
    '...............',
    '...O.......G...',
    '.....G.........',
    '...............',
  ],
};

const cloud: PixelSprite = {
  id: 'bs6-cloud',
  name: 'cloud',
  tags: [],
  blurb: 'A thin cloud that drifts across the moon.',
  rows: [
    '....kkkkkk......',
    '.kkkkkkkkkkkkk..',
    'kkkkkkkkkkkkkkkk',
  ],
};

export const bs6Opener: SceneArt = {
  id: 'bs6-opener',
  label: 'A stone tower rises in scaffolding on a hilltop as a crane hoists the next block, while the strategist points up at it and village windows light up across the valley.',
  width: 80,
  height: 60,
  base: bsHillside,
  layers: [
    { sprite: cloud, x: 33, y: 8, motion: { kind: 'drift', amp: 4, periodMs: 9000 } },
    { sprite: bsStar, x: 8, y: 6, motion: { kind: 'twinkle', periodMs: 2200, min: 0.2 } },
    { sprite: bsStar, x: 54, y: 9, motion: { kind: 'twinkle', periodMs: 2700, phase: 0.5, min: 0.2 } },
    { sprite: bsStar, x: 72, y: 4, motion: { kind: 'twinkle', periodMs: 2400, phase: 0.8, min: 0.2 } },
    { sprite: village, x: 64, y: 22 },
    { sprite: lightsA, x: 64, y: 22, motion: { kind: 'twinkle', periodMs: 3200, min: 0.15 } },
    { sprite: lightsB, x: 64, y: 22, motion: { kind: 'twinkle', periodMs: 4100, phase: 0.5, min: 0.15 } },
    { sprite: tower, x: 6, y: 2 },
    { sprite: hoist, x: 30, y: 5 },
    { sprite: bsTorch, x: 20, y: 22 },
    { sprite: bsEmber, x: 21, y: 20, motion: { kind: 'rise', amp: 4, periodMs: 1700 } },
    { sprite: bsEmber, x: 22, y: 21, motion: { kind: 'rise', amp: 5, periodMs: 2200, phase: 0.5 } },
    { sprite: bsStrategistStand, x: 52, y: 15 },
  ],
};

const emblem: PixelSprite = {
  id: 'bs6-emblem-pyramid',
  name: 'emblem-pyramid',
  tags: [],
  blurb: 'Lesson 6 emblem, 16x16: the scaling pyramid in four tiers, product fit at the base and operations in gold at the top.',
  rows: [
    '................',
    '................',
    '.......yy.......',
    '......yyyg......',
    '......yGGg......',
    '......yGGg......',
    '....qqqqqqqp....',
    '....qPPPPPPp....',
    '....qPPPPPPp....',
    '..BBBBBBBBBBBb..',
    '..BBBBBBBBBBBb..',
    '..BBBBBBBBBBBb..',
    'mmmmmmmmmmmmmmmn',
    'mNNNNNNNNNNNNNNn',
    'mNNNNNNNNNNNNNNn',
    '................',
  ],
};

export const bs6Finish: SceneArt = bsKeepsake(
  'bs6-finish',
  'A purple house banner on a gold rod, its roundel showing a four tier pyramid, green at the base and gold at the top.',
  emblem,
);

export const art: LessonArtSet = { opener: bs6Opener, backdrop: bsBackdrop, finish: bs6Finish };
