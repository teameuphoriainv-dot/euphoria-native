/**
 * Investing Fundamentals lesson 7, Mutual Funds & Fund Types: many people's money in one shared tub,
 * tended by someone they hired.
 *
 * In the middle stands a big half-barrel with one tree growing in it, and that one tree bears coins,
 * apples, plums and figs at once: a single fund holding many kinds of holding. Other people's coins
 * already shine half-buried in its soil (the pool), the investor tosses in their own coin to join
 * them, and on the far side the orchard's gardener, the manager, waters the tub for everyone. The
 * tossed coin arcs in and the water falls (frames), the pooled coins glint, stars twinkle and
 * fireflies drift.
 *
 * The keepsake's emblem is three coins dropping into one tub of coins.
 */
import type { PixelSprite } from '../types';
import {
  IF_INVESTOR_HAND,
  IF_PALETTE,
  ifCoin,
  ifCompose,
  ifFirefly,
  ifFlip,
  ifGlint,
  ifInvestor,
  ifKeepsake,
  ifLater,
  ifMoneyTree,
  ifStage,
  ifStar,
  ifStarBig,
  ifWater,
  ifWateringCan,
} from './if-kit';
import { ifBackdrop } from './if-backdrop';
import { IF_APPLE, IF_FIG, IF_GARDENER_HAND, IF_PLUM, ifCoinDrop, ifGardener, ifRecolour } from './if-kit-a';
import type { LessonArtSet, SceneArt } from './types';

/* ── props ─────────────────────────────────────────────────────────────────────────────────────── */

/** The shared tub, 26x8: soil with other people's coins half-buried in it, staves and two iron hoops. */
const tub: PixelSprite = {
  id: 'if7-tub',
  name: 'if7-tub',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [
    'cccccOyGOcccccccccOyGOcccc',
    'eeeeeOGgOeeeeeeeeeOGgOeeee',
    'xxxxxxxxXXXXXXXXXXXXXXXXXD',
    '.hAAaAAAaAAAaAAAaAAAaAAAa.',
    '.hAAaAAAaAAAaAAAaAAAaAAAa.',
    '.xxxxxXXXXXXXXXXXXXXXXXXD.',
    '..hAaAAAaAAAaAAAaAAAaAAa..',
    '...aaaaaaaaaaaaaaaaaaaa...',
  ],
};

/**
 * Three of the money tree's six coins, by their top-left corner in the tree, painted over as other
 * fruit. ifCoin is the same 4x4 shape as the tree's coins, so each lands exactly on one.
 */
const OTHER_FRUIT = [
  { swap: IF_APPLE, x: 4, y: 8 },
  { swap: IF_PLUM, x: 18, y: 10 },
  { swap: IF_FIG, x: 3, y: 16 },
] as const;

/** The kit's can turned to face left, for the gardener; its grip is then at (10, 0), its rose at (0, 2). */
const canFacingLeft = ifFlip(ifWateringCan, 'if7-can-left');
const CAN_GRIP = { x: 10, y: 0 } as const;

/* ── the opener ────────────────────────────────────────────────────────────────────────────────── */

const TUB = { x: 22, y: 39 } as const;
/** The tree's roots sit on the tub's soil. */
const TREE = { x: TUB.x + 1, y: TUB.y - 33 } as const;
const INVESTOR = { x: 2, y: 25 } as const;
const MANAGER = { x: 58, y: 25 } as const;
const CAN = { x: MANAGER.x + IF_GARDENER_HAND.x - CAN_GRIP.x, y: MANAGER.y + IF_GARDENER_HAND.y - CAN_GRIP.y } as const;

const base = ifCompose('if7-opener-base', 80, 60, [
  { sprite: ifStage, x: 0, y: 0 },
  { sprite: tub, x: TUB.x, y: TUB.y },
  { sprite: ifMoneyTree, x: TREE.x, y: TREE.y },
  ...OTHER_FRUIT.map(({ swap, x, y }, i) => ({
    sprite: ifRecolour(ifCoin, `if7-fruit-${String(i)}`, swap),
    x: TREE.x + x,
    y: TREE.y + y,
  })),
  { sprite: ifInvestor, x: INVESTOR.x, y: INVESTOR.y },
  // The can before the manager, so the hand closes over the handle.
  { sprite: canFacingLeft, x: CAN.x, y: CAN.y },
  { sprite: ifGardener, x: MANAGER.x, y: MANAGER.y },
]);

/** The investor's coin, flipped up out of the hand and over into the tub. */
const tossedCoin = ifCoinDrop('if7-tossed-coin', 14, 12, [[1, 6], [3, 3], [5, 2], [7, 2], [8, 4], [9, 7], [-9, -9], [-9, -9]], 180);

export const if7Opener: SceneArt = {
  id: 'if7-opener',
  label: 'An investor tosses a coin into a big shared tub whose one tree grows coins, apples, plums and figs together, its soil full of coins from other people, while a gardener waters it for everyone.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: tossedCoin, x: INVESTOR.x + IF_INVESTOR_HAND.x, y: INVESTOR.y + IF_INVESTOR_HAND.y - 8 },
    { sprite: ifWater, x: CAN.x - 2, y: CAN.y + 2 },
    { sprite: ifGlint, x: TUB.x + 5, y: TUB.y - 1 },
    { sprite: ifLater(ifGlint, 'if7-glint-pool', 2, 290), x: TUB.x + 18, y: TUB.y - 1 },
    { sprite: ifLater(ifGlint, 'if7-glint-tree', 4, 330), x: TREE.x + 14, y: TREE.y + 3 },
    { sprite: ifStarBig, x: 56, y: 6, motion: { kind: 'twinkle', periodMs: 2300, min: 0.3 } },
    { sprite: ifStar, x: 21, y: 3, motion: { kind: 'twinkle', periodMs: 1800, phase: 0.4, min: 0.2 } },
    { sprite: ifStar, x: 68, y: 13, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.7, min: 0.2 } },
    { sprite: ifStar, x: 75, y: 3, motion: { kind: 'twinkle', periodMs: 2000, phase: 0.2, min: 0.25 } },
    { sprite: ifFirefly, x: 12, y: 50, motion: { kind: 'rise', amp: 5, periodMs: 3400, phase: 0.1 } },
    { sprite: ifFirefly, x: 51, y: 50, motion: { kind: 'rise', amp: 6, periodMs: 4100, phase: 0.5 } },
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────────── */

const emblemPool: PixelSprite = {
  id: 'if-emblem-pool',
  name: 'if-emblem-pool',
  tags: ['scene', 'if'],
  blurb: "Lesson 7: three coins dropping into one tub of coins. Many people's money, pooled.",
  palette: IF_PALETTE,
  rows: [
    '.yG.yG.yG.',
    '.Gg.Gg.Gg.',
    '..........',
    'xxxxXXXXXD',
    'hAyGyGyGAa',
    '.xxXXXXXD.',
    '.hAAAAAAa.',
    '..aaaaaa..',
  ],
};

export const if7Finish: SceneArt = ifKeepsake(
  'if7-finish',
  'A golden acorn hanging from an oak twig, with three coins dropping into a tub of coins in its purple window and small sparkles around it.',
  emblemPool,
);

export const art: LessonArtSet = { opener: if7Opener, backdrop: ifBackdrop, finish: if7Finish };
