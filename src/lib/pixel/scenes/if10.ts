/**
 * Investing Fundamentals lesson 10, Investment Account Types: where you plant decides what you keep.
 *
 * One of the pathway's three 50-XP lessons, so it is a harvest: the grown orchard at sunset, a row
 * of trees on every far hill. The heaviest tree grows inside a glass greenhouse, sheltered, every coin
 * still on it: a tax-advantaged account, where the growth is yours. Out in the open a tree planted the
 * same year is smaller and missing a coin, and a crow is flying off with it into the sun: the tax a
 * taxable account pays every year. The investor carries a full basket toward the glass. The crow
 * flaps (frames), the sun's rays shine, coins glint, gold dust rises and the first stars come out.
 *
 * The keepsake is the premium acorn (halo and a ring of lights); its emblem is the greenhouse.
 */
import type { PixelSprite } from '../types';
import {
  IF_INVESTOR_HAND,
  ifCompose,
  ifGlint,
  ifGoldMote,
  ifInvestor,
  ifLater,
  ifMoneyTree,
  ifStage,
  ifStar,
  ifYoungTree,
} from './if-kit';
import { ifBackdrop } from './if-backdrop';
import {
  IF_COIN_BASKET_GRIP,
  IF_SUNSET_RAYS_AT,
  ifCoinBasket,
  ifOrchardRow,
  ifPremiumKeepsake,
  ifSunsetRays,
  ifSunsetSky,
} from './if-kit-b';
import type { LessonArtSet, SceneArt } from './types';

/* ── props ─────────────────────────────────────────────────────────────────────────────────────── */

/**
 * The greenhouse, 30x36: a white frame lit from the left, a centre rafter in the gable, two posts and
 * a transom in the wall, a few streaks of light on the glass, and a brick plinth. The glass is clear,
 * so whatever is stamped before it shows through.
 */
const greenhouse: PixelSprite = {
  id: 'if10-greenhouse',
  name: 'if10-greenhouse',
  tags: ['scene', 'if'],
  rows: [
    '..............wx..............',
    '............www.xx............',
    '..........ww..w...xx..........',
    '........ww....w.....xx........',
    '......ww......w.......xx......',
    '....ww........w.........xx....',
    '..ww..........w...........xx..',
    'ww............w.............xx',
    'wwwwwwwwwwwwwwwxxxxxxxxxxxxxxx',
    'w.........w........x.........x',
    'w.....Q...w........x.........x',
    'w....Q....w........x.......Q.x',
    'w...Q...Q.w........x......Q..x',
    'w..Q...Q..w........x.....Q...x',
    'w.........w........x....Q....x',
    'w.........w........x.........x',
    'w.........w........x.........x',
    'w.........w........x.........x',
    'w.........w........x.........x',
    'wwwwwwwwwwwwwwwxxxxxxxxxxxxxxx',
    'w.........w........x.........x',
    'w......Q..w........x.........x',
    'w.....Q...w........x.........x',
    'w....Q....w........x......Q..x',
    'w.........w........x.....Q...x',
    'w.........w........x.........x',
    'w.........w........x.........x',
    'w.........w........x.........x',
    'w.........w........x.........x',
    'w.........w........x.........x',
    'w.........w........x.........x',
    'w.........w........x.........x',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    '222122212221222122212221222122',
    '212221222122212221222122212221',
    '111111111111111111111111111111',
  ],
};

/** Leaves over the young tree's lower coin, at (2, 6) in the tree: the coin the crow took. */
const takenCoin: PixelSprite = {
  id: 'if10-taken-coin',
  name: 'if10-taken-coin',
  tags: ['scene', 'if'],
  rows: [
    '.mm.',
    'mNNN',
    'NNNN',
    '.NN.',
  ],
};

/* ── moving parts ──────────────────────────────────────────────────────────────────────────────── */

const CROW_UP = [
  '.....D....',
  '....DD....',
  '...DDD....',
  '.KDDDDDDDD',
  'yKDDDDD...',
  'Gg........',
];
const CROW_LEVEL = [
  '..........',
  '..........',
  '....DDDD..',
  '.KDDDDDDDD',
  'yKDDDDD...',
  'Gg........',
];
const CROW_DOWN = [
  '..........',
  '..........',
  '..........',
  '.KDDDDDDDD',
  'yKDDDDD...',
  'Gg..DDD...',
];

/** A crow flying left into the sun with a coin in its beak, wings beating. */
const crow: PixelSprite = {
  id: 'if10-crow',
  name: 'if10-crow',
  tags: ['scene', 'if'],
  rows: CROW_LEVEL,
  frames: [CROW_UP, CROW_LEVEL, CROW_DOWN, CROW_LEVEL],
  frameMs: 150,
};

/* ── the opener ────────────────────────────────────────────────────────────────────────────────── */

const GREENHOUSE = { x: 49, y: 10 } as const;
/** The sheltered tree: crown two rows under the ridge, roots hidden by the plinth. */
const TREE = { x: GREENHOUSE.x + 3, y: GREENHOUSE.y + 2 } as const;
const TAXED = { x: 6, y: 25 } as const;
const INVESTOR = { x: 24, y: 25 } as const;
const BASKET = {
  x: INVESTOR.x + IF_INVESTOR_HAND.x - IF_COIN_BASKET_GRIP.x,
  y: INVESTOR.y + IF_INVESTOR_HAND.y - IF_COIN_BASKET_GRIP.y,
} as const;

const base = ifCompose('if10-opener-base', 80, 60, [
  { sprite: ifStage, x: 0, y: 0 },
  { sprite: ifSunsetSky, x: 0, y: 0 },
  { sprite: ifOrchardRow, x: 0, y: 25 },
  { sprite: ifYoungTree, x: TAXED.x, y: TAXED.y },
  { sprite: takenCoin, x: TAXED.x + 2, y: TAXED.y + 6 },
  // The tree before the glass, so the frame and the plinth close over it.
  { sprite: ifMoneyTree, x: TREE.x, y: TREE.y },
  { sprite: greenhouse, x: GREENHOUSE.x, y: GREENHOUSE.y },
  // The basket before the investor, so the hand closes over its rim.
  { sprite: ifCoinBasket, x: BASKET.x, y: BASKET.y },
  { sprite: ifInvestor, x: INVESTOR.x, y: INVESTOR.y },
]);

export const if10Opener: SceneArt = {
  id: 'if10-opener',
  label: 'At sunset in the grown orchard, the heaviest money tree grows sheltered inside a glass greenhouse while a smaller tree outside loses a coin to a crow, and an investor carries a full basket toward the glass.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: ifSunsetRays, x: IF_SUNSET_RAYS_AT.x, y: IF_SUNSET_RAYS_AT.y, motion: { kind: 'twinkle', periodMs: 2600, min: 0.35 } },
    // Across the sun's disc, so it reads black against the brightest thing in the sky.
    { sprite: crow, x: 6, y: 15, motion: { kind: 'drift', amp: 2, periodMs: 2400 } },
    { sprite: ifGlint, x: TREE.x + 14, y: TREE.y + 3 },
    { sprite: ifLater(ifGlint, 'if10-glint-low', 2, 290), x: TREE.x + 9, y: TREE.y + 13 },
    { sprite: ifLater(ifGlint, 'if10-glint-basket', 4, 330), x: BASKET.x + 1, y: BASKET.y - 1 },
    { sprite: ifGoldMote, x: 45, y: 44, motion: { kind: 'rise', amp: 6, periodMs: 3400, phase: 0.1 } },
    { sprite: ifGoldMote, x: 21, y: 49, motion: { kind: 'rise', amp: 5, periodMs: 3900, phase: 0.5 } },
    { sprite: ifGoldMote, x: 66, y: 51, motion: { kind: 'rise', amp: 5, periodMs: 3600, phase: 0.8 } },
    { sprite: ifStar, x: 33, y: 1, motion: { kind: 'twinkle', periodMs: 2600, min: 0.2 } },
    { sprite: ifStar, x: 71, y: 2, motion: { kind: 'twinkle', periodMs: 3000, phase: 0.5, min: 0.2 } },
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────────── */

const emblemGreenhouse: PixelSprite = {
  id: 'if-emblem-greenhouse',
  name: 'if-emblem-greenhouse',
  tags: ['scene', 'if'],
  blurb: "Lesson 10: a sprout growing under glass. An account that shelters what grows in it.",
  rows: [
    '....wx....',
    '...wQQx...',
    '..wQQQQx..',
    '.wwwwxxxx.',
    '.wQmNNnQx.',
    '.wQ.Nn.Qx.',
    '.wQ.nn.Qx.',
    '.wwwwxxxx.',
  ],
};

export const if10Finish: SceneArt = ifPremiumKeepsake(
  'if10-finish',
  'A golden acorn inside a ring of gold light, hanging from an oak twig, with a sprout in a glass greenhouse in its purple window and sparkles all around it.',
  emblemGreenhouse,
);

export const art: LessonArtSet = { opener: if10Opener, backdrop: ifBackdrop, finish: if10Finish };
