/**
 * Investing Fundamentals lesson 3, The Magic of Compound Interest: growth on growth, drawn as a
 * family tree.
 *
 * At the top of the picture stands one grown money tree. Two of its coins fell and became the two
 * young trees below it, and their coins fell in turn and came up as four seedlings along the front,
 * each still growing out of its coin. One, then two, then four: the earnings earn. Coins keep arcing
 * down from each generation to the next (frames, since layer motion can only rise), the newest coins
 * glint, and the night sky twinkles.
 *
 * The keepsake's emblem is three stacks of coins, each twice the height of the last.
 */
import type { PixelSprite } from '../types';
import {
  ifCompose,
  ifFirefly,
  ifGlint,
  ifKeepsake,
  ifLater,
  ifMoneyTree,
  ifStage,
  ifStar,
  ifStarBig,
  ifYoungTree,
} from './if-kit';
import { ifBackdrop } from './if-backdrop';
import { ifBedOf, ifCoinDrop, ifCoinSprout } from './if-kit-a';
import type { LessonArtSet, SceneArt } from './types';

/* ── the three generations ─────────────────────────────────────────────────────────────────────── */

const PARENT = { x: 28, y: 7 } as const;
const LEFT_CHILD = { x: 6, y: 27 } as const;
const RIGHT_CHILD = { x: 60, y: 27 } as const;
/** The seedlings' x; each stands on its own short bed along the bottom edge. */
const SEEDLINGS = [2, 17, 55, 71] as const;
const SEEDLING_Y = 50;

const hillBed = ifBedOf('if3-bed-parent', 24);
const childBed = ifBedOf('if3-bed-child', 18);
const seedBed = ifBedOf('if3-bed-seedling', 11);

const base = ifCompose('if3-opener-base', 80, 60, [
  { sprite: ifStage, x: 0, y: 0 },
  { sprite: hillBed, x: PARENT.x, y: PARENT.y + 33 },
  { sprite: ifMoneyTree, x: PARENT.x, y: PARENT.y },
  { sprite: childBed, x: LEFT_CHILD.x - 2, y: LEFT_CHILD.y + 20 },
  { sprite: childBed, x: RIGHT_CHILD.x - 2, y: RIGHT_CHILD.y + 20 },
  { sprite: ifYoungTree, x: LEFT_CHILD.x, y: LEFT_CHILD.y },
  { sprite: ifYoungTree, x: RIGHT_CHILD.x, y: RIGHT_CHILD.y },
  ...SEEDLINGS.flatMap((x) => [
    { sprite: seedBed, x: x - 2, y: SEEDLING_Y + 6 },
    { sprite: ifCoinSprout, x, y: SEEDLING_Y },
  ]),
]);

/* ── coins passing down ────────────────────────────────────────────────────────────────────────── */

/** Parent to left child: off the parent's lower-left coin, tossed out and down onto the child's bed. */
const toLeftChild = ifCoinDrop('if3-coin-to-left', 20, 23, [[14, 2], [12, 3], [9, 5], [7, 8], [4, 12], [2, 18], [-9, -9], [-9, -9]], 180, 2);
/** Parent to right child: off the crown's right edge. */
const toRightChild = ifCoinDrop('if3-coin-to-right', 20, 28, [[3, 1], [6, 2], [8, 5], [11, 9], [13, 16], [16, 23], [-9, -9], [-9, -9], [-9, -9]], 170, 3);
/** Each child to a seedling at its side, a shorter fall. */
const toLeftSeedling = ifCoinDrop('if3-coin-to-seedling-l', 12, 22, [[2, 2], [3, 3], [4, 6], [5, 10], [6, 16], [-9, -9], [-9, -9]], 200, 2);
const toRightSeedling = ifCoinDrop('if3-coin-to-seedling-r', 13, 23, [[7, 2], [6, 3], [5, 6], [4, 10], [2, 16], [-9, -9], [-9, -9], [-9, -9]], 190, 3);

export const if3Opener: SceneArt = {
  id: 'if3-opener',
  label: 'A grown money tree stands above two young trees that grew from its coins, and their coins have sprouted into four seedlings in front, as more coins fall from each tree to the next.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: toLeftChild, x: 17, y: 25 },
    { sprite: toRightChild, x: 44, y: 20 },
    { sprite: toLeftSeedling, x: 13, y: 34 },
    { sprite: toRightSeedling, x: 55, y: 34 },
    { sprite: ifGlint, x: PARENT.x + 14, y: PARENT.y + 3 },
    { sprite: ifLater(ifGlint, 'if3-glint-left', 2, 280), x: LEFT_CHILD.x + 8, y: LEFT_CHILD.y + 3 },
    { sprite: ifLater(ifGlint, 'if3-glint-right', 4, 320), x: RIGHT_CHILD.x + 2, y: RIGHT_CHILD.y + 6 },
    { sprite: ifStarBig, x: 60, y: 6, motion: { kind: 'twinkle', periodMs: 2300, min: 0.3 } },
    { sprite: ifStar, x: 24, y: 3, motion: { kind: 'twinkle', periodMs: 1800, phase: 0.4, min: 0.2 } },
    { sprite: ifStar, x: 71, y: 15, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.7, min: 0.2 } },
    { sprite: ifStar, x: 52, y: 1, motion: { kind: 'twinkle', periodMs: 2100, phase: 0.15, min: 0.25 } },
    { sprite: ifFirefly, x: 26, y: 46, motion: { kind: 'rise', amp: 5, periodMs: 3500, phase: 0.3 } },
    { sprite: ifFirefly, x: 53, y: 38, motion: { kind: 'rise', amp: 5, periodMs: 4000, phase: 0.75 } },
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────────── */

const emblemStacks: PixelSprite = {
  id: 'if-emblem-stacks',
  name: 'if-emblem-stacks',
  tags: ['scene', 'if'],
  blurb: "Lesson 3: three stacks of coins, each twice the height of the last.",
  rows: [
    '.......yG.',
    '.......Gg.',
    '.......yG.',
    '.......Gg.',
    '....yG.yG.',
    '....Gg.Gg.',
    '.yG.yG.yG.',
    '.Gg.Gg.Gg.',
  ],
};

export const if3Finish: SceneArt = ifKeepsake(
  'if3-finish',
  'A golden acorn hanging from an oak twig, with three stacks of coins doubling in height in its purple window and small sparkles around it.',
  emblemStacks,
);

export const art: LessonArtSet = { opener: if3Opener, backdrop: ifBackdrop, finish: if3Finish };
