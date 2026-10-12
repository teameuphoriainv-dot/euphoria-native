/**
 * Business Strategy lesson 21 opener: what the house plants now, it harvests for decades.
 *
 * Built on bsHillside, read left to right as time passing. On the near hill the strategist waters a
 * sapling just put in the ground. Across the clean river stand the trees planted the same way years
 * ago: a young one finding its height, and a great one hung with golden fruit, purpose and profit
 * growing on the same branches. A fish leaps in the river. The gold fruit and the strategist's coat are
 * the brightest marks; the moon sits between them. Moving: water falls from the can, the fruit glints,
 * the fish leaps, fireflies blink, the strategist blinks and stars twinkle.
 */
import type { PixelSprite } from '../types';
import { bsBackdrop } from './bs-backdrop';
import { bsMoved, bsStar } from './bs-kit';
import { bsHillside, bsMirrored, bsStrategistStand } from './bs-kit-a';
import { bsKeepsake } from './bs1-finish';
import type { LessonArtSet, SceneArt } from './types';

const wateringRows = bsMoved(bsStrategistStand.rows, {
  6: '......SSSUHHD.........',
  7: '.......SSUUD..........',
  8: '.......wUUw...........',
  9: '......EqwwPGGE........',
  10: '.....EqPPPPPGpE.......',
  13: '..tTTTtEqGPPPPppE.....',
  14: '.ttTmTtEqPPPPPppE.....',
  15: 't.tTTTtEqGPPPPppE.....',
  16: '..tttttEqPPPPPppE.....',
});

const watering: PixelSprite = {
  id: 'bs21-watering',
  name: 'watering',
  tags: [],
  blurb: 'The strategist standing, facing left, holding a teal watering can low; the spout tip is at (x, y + 15). Mirror it to water something on the right. Frames: rest, blink.',
  palette: { S: '#C08552', U: '#9A6638', H: '#43291A' },
  rows: wateringRows,
  frames: [
    wateringRows,
    wateringRows,
    wateringRows,
    bsMoved(wateringRows, {
      4: '......SSSUHHHD........',
    }),
  ],
  frameMs: 700,
};

const dropFrame = (at: number) => Array.from({ length: 8 }, (_, i) => (i === at || i === at + 4 ? 'B' : '.'));

const drops: PixelSprite = {
  id: 'bs21-drops',
  name: 'drops',
  tags: [],
  blurb: 'Water falling from the can onto the sapling, two drops at a time.',
  rows: dropFrame(0),
  frames: [dropFrame(0), dropFrame(1), dropFrame(2), dropFrame(3)],
  frameMs: 200,
};

const sapling: PixelSprite = {
  id: 'bs21-sapling',
  name: 'sapling',
  tags: [],
  blurb: 'A sapling just planted, in its mound of fresh earth (bottom row).',
  rows: [
    '..N..',
    '.NmN.',
    'Nn.nN',
    '..O..',
    '.NO..',
    '..O..',
    '.OOO.',
  ],
};

const youngTree: PixelSprite = {
  id: 'bs21-young-tree',
  name: 'young-tree',
  tags: [],
  blurb: 'A young tree a few years in, its roots on the bottom row.',
  rows: [
    '...nnnnn...',
    '..nNmNNNn..',
    '.nNmNNNNNn.',
    '.nNNNNNNNn.',
    '.nNNNNnNNn.',
    '..nNNNNNn..',
    '...nnOnn...',
    '.....Og....',
    '.....Og....',
    '.....Og....',
    '.....Og....',
    '.....Og....',
    '....OOgO...',
  ],
};

const grownTree: PixelSprite = {
  id: 'bs21-grown-tree',
  name: 'grown-tree',
  tags: [],
  blurb: 'A great tree planted long ago, hung with golden fruit, its roots on the bottom row.',
  rows: [
    '......nnnnnn......',
    '....nnNNNNNNnn....',
    '...nNNmmNNNNNNn...',
    '..nNmmNNNGNNNNNn..',
    '..nNmNNNNNNNNNNn..',
    '.nNNNNNGNNNNNGNNn.',
    '.nNmNNNNNNNnNNNNn.',
    'nNNNNGNNNNNNNNNNnn',
    'nNNNNNNNNnNNGNNNnn',
    'nNGNNNNNNNNNNNNnnn',
    '.nNNNNNNGNNNNNnnn.',
    '.nnNNNNNNNNNNnnnn.',
    '..nnnNNNnNNNnnnn..',
    '...nnnnnOgnnnnn...',
    '.....nnnOgnnn.....',
    '........Og........',
    '........Og........',
    '........Og........',
    '........Og........',
    '........Og........',
    '.......OOgO.......',
    '......O.Og.O......',
  ],
};

const fruitGlint: PixelSprite = {
  id: 'bs21-fruit-glint',
  name: 'fruit-glint',
  tags: [],
  blurb: 'Light catching three of the great tree\'s fruit, at tree + (2, 5).',
  rows: [
    '.....W......',
    '............',
    '............',
    '..........W.',
    'W...........',
  ],
};

const fishRest = [
  '......',
  '......',
  '......',
  '......',
  '.wBBw.',
];

const fish: PixelSprite = {
  id: 'bs21-fish',
  name: 'fish',
  tags: [],
  blurb: 'A fish leaping from the clean river and diving back in.',
  rows: fishRest,
  frames: [
    fishRest,
    ['......', '......', '..xw..', '.xXX..', '.w..w.'],
    ['..xX..', '.xXXw.', '...x..', '......', '......'],
    ['......', '......', '...Xx.', '..XXx.', '.w..w.'],
    fishRest,
    fishRest,
  ],
  frameMs: 380,
};

const firefly: PixelSprite = {
  id: 'bs21-firefly',
  name: 'firefly',
  tags: [],
  rows: [
    'm',
  ],
};

const wateringRight = bsMirrored(watering, 'bs21-watering-right');

export const bs21Opener: SceneArt = {
  id: 'bs21-opener',
  label: 'On a moonlit hill a strategist waters a sapling just planted, while across the river the trees planted years ago stand tall and hung with golden fruit.',
  width: 80,
  height: 60,
  base: bsHillside,
  layers: [
    { sprite: bsStar, x: 8, y: 6, motion: { kind: 'twinkle', periodMs: 2200, min: 0.2 } },
    { sprite: bsStar, x: 56, y: 9, motion: { kind: 'twinkle', periodMs: 2700, phase: 0.5, min: 0.2 } },
    { sprite: bsStar, x: 72, y: 4, motion: { kind: 'twinkle', periodMs: 2400, phase: 0.8, min: 0.2 } },
    { sprite: bsStar, x: 24, y: 13, motion: { kind: 'twinkle', periodMs: 3000, phase: 0.3, min: 0.2 } },
    { sprite: youngTree, x: 53, y: 32 },
    { sprite: grownTree, x: 62, y: 24 },
    { sprite: fruitGlint, x: 64, y: 29, motion: { kind: 'twinkle', periodMs: 1800, min: 0.15 } },
    { sprite: fish, x: 45, y: 44 },
    { sprite: firefly, x: 38, y: 38, motion: { kind: 'twinkle', periodMs: 1700, min: 0.1 } },
    { sprite: firefly, x: 58, y: 26, motion: { kind: 'twinkle', periodMs: 2100, phase: 0.5, min: 0.1 } },
    { sprite: firefly, x: 76, y: 47, motion: { kind: 'twinkle', periodMs: 2500, phase: 0.25, min: 0.1 } },
    { sprite: sapling, x: 22, y: 28 },
    { sprite: drops, x: 24, y: 20 },
    { sprite: wateringRight, x: 3, y: 4 },
  ],
};

const emblem: PixelSprite = {
  id: 'bs21-emblem-tree',
  name: 'emblem-tree',
  tags: [],
  blurb: 'Lesson 21 emblem, 16x16: a full green tree hung with golden fruit, standing on a strip of grass.',
  rows: [
    '................',
    '.....nnnnnn.....',
    '...nnNNNNmNnn...',
    '..nNNmmNNNNNNn..',
    '..nNmNNyNNNGNn..',
    '.nNNNNNNNNNNNNn.',
    '.nNGNNNNNGNNNNn.',
    '.nNNNNNNNNNNNnn.',
    '..nNNNNGNNNNnn..',
    '..nnNNNNNNnnnn..',
    '...nnnnOOnnnn...',
    '.......Og.......',
    '.......Og.......',
    '......OOgO......',
    '...nnnnnnnnnn...',
    '................',
  ],
};

export const bs21Finish: SceneArt = bsKeepsake(
  'bs21-finish',
  'A purple house banner on a gold rod, its roundel showing a green tree hung with golden fruit.',
  emblem,
);

export const art: LessonArtSet = { opener: bs21Opener, backdrop: bsBackdrop, finish: bs21Finish };
