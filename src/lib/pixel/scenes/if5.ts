/**
 * Investing Fundamentals lesson 5, Diversification: don't put all your eggs in one basket, so put a
 * little of everything in it.
 *
 * The bed is planted as a mixed orchard, four kinds of tree in a row (apples, coins, plums and figs,
 * kit trees recoloured with ifRecolour). The investor is picking from the first, and the basket at
 * their feet already holds one of each. A crow
 * is raiding the plum tree and knocking its fruit into the dirt, which is one holding's bad year; the
 * basket hardly notices. The crow pecks and a plum falls (frames), coins glint, stars twinkle and
 * fireflies drift.
 *
 * The keepsake's emblem is the basket itself.
 */
import type { PixelSprite } from '../types';
import {
  IF_INVESTOR_HAND,
  ifBed,
  ifCoin,
  ifCompose,
  ifFirefly,
  ifGlint,
  ifInvestor,
  ifKeepsake,
  ifLater,
  ifStage,
  ifStar,
  ifStarBig,
  ifYoungTree,
} from './if-kit';
import { ifBackdrop } from './if-backdrop';
import { IF_APPLE, IF_A_PALETTE, IF_FIG, IF_PLUM, ifCoinDrop, ifFruitTree, ifRecolour } from './if-kit-a';
import type { LessonArtSet, SceneArt } from './types';

/* ── props ─────────────────────────────────────────────────────────────────────────────────────── */

/** A woven basket, 10x9, set down full: a coin, an apple, a plum and a fig. */
const basket: PixelSprite = {
  id: 'if5-basket',
  name: 'if5-basket',
  tags: ['scene', 'if'],
  palette: IF_A_PALETTE,
  rows: [
    '..hhhhhh..',
    '.h......h.',
    'hyGsRBbQqh',
    'hGgRrbuqPh',
    'Ahhhhhhhha',
    'AAhAAhAAha',
    'AhAAhAAhAa',
    '.AAhAAhAa.',
    '..aaaaaa..',
  ],
};

/** A crow, 7x5, facing left on a treetop, pecking. */
const CROW_UP = [
  '.XD....',
  'GDwD...',
  '.DDDDDD',
  '..DDDXD',
  '...D.D.',
];
const CROW_DOWN = [
  '.......',
  '.XD....',
  'GDwDDDD',
  '..DDDXD',
  '...D.D.',
];
const crow: PixelSprite = {
  id: 'if5-crow',
  name: 'if5-crow',
  tags: ['scene', 'if'],
  rows: CROW_UP,
  frames: [CROW_UP, CROW_DOWN, CROW_UP, CROW_UP, CROW_DOWN, CROW_UP, CROW_UP, CROW_UP],
  frameMs: 210,
};

/* ── the orchard ───────────────────────────────────────────────────────────────────────────────── */

const appleTree = ifRecolour(ifYoungTree, 'if5-apple-tree', IF_APPLE);
const plumTree = ifRecolour(ifYoungTree, 'if5-plum-tree', IF_PLUM);
const figTree = ifRecolour(ifFruitTree, 'if5-fig-tree', IF_FIG);
const fallenPlum = ifRecolour(ifCoin, 'if5-fallen-plum', IF_PLUM);

/** The investor reaches into the apple tree; the hand lands among its leaves, next to an apple. */
const INVESTOR = { x: 9, y: 25 } as const;
const APPLE_TREE = { x: INVESTOR.x + IF_INVESTOR_HAND.x + 1, y: 27 } as const;
const BASKET = { x: 0, y: 37 } as const;
const PLUM_TREE = { x: 50, y: 27 } as const;

const base = ifCompose('if5-opener-base', 80, 60, [
  { sprite: ifStage, x: 0, y: 0 },
  { sprite: ifBed, x: 22, y: 47 },
  { sprite: appleTree, x: APPLE_TREE.x, y: APPLE_TREE.y },
  { sprite: ifFruitTree, x: 37, y: 31 },
  { sprite: plumTree, x: PLUM_TREE.x, y: PLUM_TREE.y },
  { sprite: figTree, x: 65, y: 31 },
  { sprite: fallenPlum, x: 52, y: 44 },
  { sprite: basket, x: BASKET.x, y: BASKET.y },
  { sprite: ifInvestor, x: INVESTOR.x, y: INVESTOR.y },
]);

/** A plum knocked loose by the crow, dropping straight onto the bed. */
const droppingPlum = ifRecolour(
  ifCoinDrop('if5-plum-drop', 4, 14, [[0, 0], [0, 2], [0, 4], [0, 7], [0, 10], [-9, -9], [-9, -9], [-9, -9]], 200),
  'if5-plum-drop',
  IF_PLUM,
);

export const if5Opener: SceneArt = {
  id: 'if5-opener',
  label: 'An investor picks from a mixed orchard of apple, coin, plum and fig trees, a full basket of all four at their feet, so a crow raiding the plum tree barely matters.',
  width: 80,
  height: 60,
  base,
  layers: [
    // Seated in the crown rather than on top of it, so it reads dark against the leaves, not lost in the sky.
    { sprite: crow, x: PLUM_TREE.x + 2, y: PLUM_TREE.y + 1 },
    { sprite: droppingPlum, x: PLUM_TREE.x + 8, y: PLUM_TREE.y + 6 },
    { sprite: ifGlint, x: 40, y: 33 },
    { sprite: ifLater(ifGlint, 'if5-glint-basket', 3, 310), x: BASKET.x, y: BASKET.y + 1 },
    { sprite: ifStarBig, x: 44, y: 8, motion: { kind: 'twinkle', periodMs: 2300, min: 0.3 } },
    { sprite: ifStar, x: 30, y: 3, motion: { kind: 'twinkle', periodMs: 1800, phase: 0.4, min: 0.2 } },
    { sprite: ifStar, x: 62, y: 12, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.7, min: 0.2 } },
    { sprite: ifStar, x: 73, y: 4, motion: { kind: 'twinkle', periodMs: 2000, phase: 0.2, min: 0.25 } },
    { sprite: ifFirefly, x: 20, y: 51, motion: { kind: 'rise', amp: 5, periodMs: 3400, phase: 0.1 } },
    { sprite: ifFirefly, x: 47, y: 40, motion: { kind: 'rise', amp: 6, periodMs: 4100, phase: 0.5 } },
    { sprite: ifFirefly, x: 76, y: 52, motion: { kind: 'rise', amp: 5, periodMs: 3700, phase: 0.8 } },
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────────── */

const emblemBasket: PixelSprite = {
  id: 'if-emblem-basket',
  name: 'if-emblem-basket',
  tags: ['scene', 'if'],
  blurb: "Lesson 5: a basket with a coin, an apple, a plum and a fig in it.",
  palette: IF_A_PALETTE,
  rows: [
    '..hhhhhh..',
    '.h......h.',
    'hyGsRBbQqh',
    'hGgRrbuqPh',
    'Ahhhhhhhha',
    'AAhAAhAAha',
    'AhAAhAAhAa',
    '.aaaaaaaa.',
  ],
};

export const if5Finish: SceneArt = ifKeepsake(
  'if5-finish',
  'A golden acorn hanging from an oak twig, with a basket of four different fruits in its purple window and small sparkles around it.',
  emblemBasket,
);

export const art: LessonArtSet = { opener: if5Opener, backdrop: ifBackdrop, finish: if5Finish };
