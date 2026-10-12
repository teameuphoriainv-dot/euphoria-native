/**
 * Investing Fundamentals lesson 21, Rebalancing Your Portfolio: trimming what grew too big back to
 * the plan.
 *
 * Two trees were planted to a plan, and a stake in front of them still says it: 60/40. A good year
 * later the money tree (stocks) has grown far past its share and the plum tree (bonds) is small
 * beside it, so the investor is up a stepladder with garden shears, cutting the money tree back. A
 * trimmed twig, coin and all, drops to the cuttings already on the ground. The shears snip and the twig
 * falls (frames), coins glint, stars twinkle and fireflies drift up.
 *
 * The keepsake's emblem is a pair of open shears.
 */
import type { PixelSprite } from '../types';
import {
  IF_PALETTE,
  ifCompose,
  ifFirefly,
  ifGlint,
  ifInvestor,
  ifKeepsake,
  ifLater,
  ifMoneyTree,
  ifStage,
  ifStar,
  ifStarBig,
  ifYoungTree,
} from './if-kit';
import { ifBackdrop } from './if-backdrop';
import { IF_PLUM, ifRecolour } from './if-kit-a';
import { ifDigits } from './if-kit-b';
import { ifFall } from './if-kit-c';
import type { LessonArtSet, SceneArt } from './types';

/* ── props ─────────────────────────────────────────────────────────────────────────────────────── */

/** A wooden stepladder, front on, 12x20: rails splaying toward the ground, a rung every four rows. */
const ladder: PixelSprite = {
  id: 'if21-ladder',
  name: 'if21-ladder',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [
    '..hhhhhhhA..',
    '..h......A..',
    '..h......A..',
    '..hhhhhhhA..',
    '..h......A..',
    '.h........A.',
    '.h........A.',
    '.hhhhhhhhhA.',
    '.h........A.',
    '.h........A.',
    '.h........A.',
    '.hhhhhhhhhA.',
    'h..........A',
    'h..........A',
    'h..........A',
    'hhhhhhhhhhhA',
    'h..........A',
    'h..........A',
    'h..........A',
    'a..........a',
  ],
};

/** The row of the ladder's rung that the investor stands on. */
const LADDER_STEP = 11;

/** The plan, on a stake: 60/40 in white on a board 21 wide, its post sunk in the ground. */
const signBoard: PixelSprite = {
  id: 'if21-sign-board',
  name: 'if21-sign-board',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [
    'hhhhhhhhhhhhhhhhhhhhA',
    'hAAAAAAAAAAAAAAAAAAAa',
    'hAAAAAAAAAAAAAAAAAAAa',
    'hAAAAAAAAAAAAAAAAAAAa',
    'hAAAAAAAAAAAAAAAAAAAa',
    'hAAAAAAAAAAAAAAAAAAAa',
    'aaaaaaaaaaaaaaaaaaaaa',
    '.........hA..........',
    '.........hA..........',
    '.........hA..........',
    '.........hA..........',
    '.........hA..........',
  ],
};
const sign = ifCompose('if21-sign', 21, 12, [
  { sprite: signBoard, x: 0, y: 0 },
  { sprite: ifDigits('if21-plan', '60/40', 'w'), x: 1, y: 1 },
]);

/** Twigs already cut, lying at the foot of the ladder, 9x2. */
const cuttings: PixelSprite = {
  id: 'if21-cuttings',
  name: 'if21-cuttings',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [
    '.mN...mn.',
    'hAAnAAhNn',
  ],
};

/* ── moving parts ──────────────────────────────────────────────────────────────────────────────── */

const SHEARS_OPEN = [
  '.......wx',
  '.....wx..',
  'rrrAK....',
  '.....xX..',
  '.......xX',
];
const SHEARS_SHUT = [
  '.........',
  '.........',
  'rrrAKwwwx',
  '.........',
  '.........',
];

/** Garden shears, 9x5, red grips in the hand and the blades opening and snapping shut. */
const shears: PixelSprite = {
  id: 'if21-shears',
  name: 'if21-shears',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: SHEARS_OPEN,
  frames: [SHEARS_OPEN, SHEARS_OPEN, SHEARS_SHUT, SHEARS_SHUT],
  frameMs: 230,
};

/** A trimmed twig with a coin on it, dropping from the blades to the ground, then a beat. */
const twig = ifFall(
  'if21-twig',
  8,
  21,
  ['.mNn..', 'mNNnhA', '.OOnn.', 'OyGO..', 'OGgO..', '.OO...'],
  [[2, 0], [2, 2], [1, 5], [1, 8], [0, 11], [0, 14], [0, 15], [0, 15], [-9, -9], [-9, -9]],
  180,
  3,
  IF_PALETTE,
);

/* ── the opener ────────────────────────────────────────────────────────────────────────────────── */

const INVESTOR = { x: 6, y: 17 } as const;
/** Under the investor, so their shoes rest on the rung LADDER_STEP. */
const LADDER = { x: INVESTOR.x + 1, y: INVESTOR.y + 21 - LADDER_STEP } as const;
/** The grips just past the hand, so the blades reach into the crown's left edge. */
const SHEARS = { x: INVESTOR.x + 14, y: INVESTOR.y + 9 } as const;
const TREE = { x: 26, y: 11 } as const;
const PLUMS = { x: 61, y: 24 } as const;

const base = ifCompose('if21-opener-base', 80, 60, [
  { sprite: ifStage, x: 0, y: 0 },
  { sprite: ifMoneyTree, x: TREE.x, y: TREE.y },
  { sprite: ifRecolour(ifYoungTree, 'if21-plum-tree', IF_PLUM), x: PLUMS.x, y: PLUMS.y },
  { sprite: cuttings, x: 21, y: 44 },
  { sprite: sign, x: 54, y: 47 },
  // The ladder before the investor, who stands in front of it.
  { sprite: ladder, x: LADDER.x, y: LADDER.y },
  { sprite: ifInvestor, x: INVESTOR.x, y: INVESTOR.y },
]);

export const if21Opener: SceneArt = {
  id: 'if21-opener',
  label: 'At night an investor on a stepladder trims an overgrown money tree with garden shears beside a much smaller plum tree, and a stake in front of the two trees reads 60/40.',
  width: 80,
  height: 60,
  base,
  layers: [
    // The twig before the shears, so the blades stay over it as it is cut.
    { sprite: twig, x: SHEARS.x, y: SHEARS.y },
    { sprite: shears, x: SHEARS.x, y: SHEARS.y },
    { sprite: ifGlint, x: TREE.x + 14, y: TREE.y + 3 },
    { sprite: ifLater(ifGlint, 'if21-glint-low', 2, 300), x: TREE.x + 18, y: TREE.y + 10 },
    { sprite: ifStarBig, x: 54, y: 6, motion: { kind: 'twinkle', periodMs: 2300, min: 0.3 } },
    { sprite: ifStar, x: 33, y: 4, motion: { kind: 'twinkle', periodMs: 1800, phase: 0.4, min: 0.2 } },
    { sprite: ifStar, x: 68, y: 12, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.7, min: 0.2 } },
    { sprite: ifStar, x: 76, y: 3, motion: { kind: 'twinkle', periodMs: 2900, phase: 0.2, min: 0.2 } },
    { sprite: ifFirefly, x: 33, y: 51, motion: { kind: 'rise', amp: 5, periodMs: 3500, phase: 0.1 } },
    { sprite: ifFirefly, x: 52, y: 44, motion: { kind: 'rise', amp: 6, periodMs: 4100, phase: 0.55 } },
    { sprite: ifFirefly, x: 8, y: 54, motion: { kind: 'rise', amp: 5, periodMs: 3800, phase: 0.8 } },
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────────── */

const emblemShears: PixelSprite = {
  id: 'if-emblem-shears',
  name: 'if-emblem-shears',
  tags: ['scene', 'if'],
  blurb: "Lesson 21: a pair of open shears. Cutting back what outgrew the plan.",
  rows: [
    'w........w',
    'xw......wx',
    '.xw....wx.',
    '..xw..wx..',
    '....KK....',
    '..RR..RR..',
    '.R..RR..R.',
    '..RR..RR..',
  ],
};

export const if21Finish: SceneArt = ifKeepsake(
  'if21-finish',
  'A golden acorn hanging from an oak twig, with a pair of open shears in its purple window and small sparkles around it.',
  emblemShears,
);

export const art: LessonArtSet = { opener: if21Opener, backdrop: ifBackdrop, finish: if21Finish };
