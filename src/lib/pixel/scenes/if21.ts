/**
 * Investing Fundamentals lesson 21, Rebalancing Your Portfolio: trimming what grew too big and moving
 * it to what fell behind.
 *
 * Two holdings were planted to a plan, and a stake in front of the bond bush still says it: 60/40. A
 * good year later the money tree (stocks) has grown far past its share and the teal bush (bonds, as
 * lesson 9 planted them) is small beside it, so the investor is up a stepladder with garden shears,
 * cutting the money tree back. Nothing cut is thrown away: the snipped coin drops into a basket at the
 * foot of the ladder, hops out and rolls across to the bush, and settles into a fresh hole at its
 * foot, where a trowel stands in the turned soil. The money taken off what grew is planted in what
 * fell behind, and no coin leaves the picture. The shears snip and the coin falls and rolls (frames),
 * coins glint, stars twinkle and fireflies drift up.
 *
 * The keepsake's emblem is the same move: open shears, and a coin dropping into the teal bush.
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
} from './if-kit';
import { ifBackdrop } from './if-backdrop';
import { ifCoinBasket, ifDigits } from './if-kit-b';
import { ifBondBush } from './if-kit-r';
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

/**
 * The fresh hole at the bush's foot, 9x5: a dark pit in turned soil, a coin from an earlier trim set
 * in it up to its middle, and a trowel standing in the heap on the left. The trip's coin settles on
 * that coin exactly (HOLE_COIN).
 */
const hole: PixelSprite = {
  id: 'if21-hole',
  name: 'if21-hole',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [
    '.h.......',
    '.hA..OO..',
    '.xw.OyGO.',
    'cXxdddddc',
    '.ccdddcc.',
  ],
};
/** Where the set coin's top-left is, in the hole's pixels. */
const HOLE_COIN = { x: 4, y: 1 } as const;

/* ── moving parts: the trim's one coin, and the shears on its clock ──────────────────────────── */

const COIN_FACE = ['.OO.', 'OyGO', 'OGgO', '.OO.'];
const COIN_EDGE = ['.OO.', '.yG.', '.Gg.', '.OO.'];
/** The coin settled in the hole: its top half, the rest under the soil. */
const COIN_SET = ['.OO.', 'OyGO'];

type CoinStep = readonly [x: number, y: number, shape: readonly string[]];

/** Where the coin rests on the basket's heap, and where it settles in the bush's hole (scene pixels). */
const RESTING = { x: 24, y: 37 } as const;
const SETTLED = { x: 57, y: 42 } as const;

/**
 * One coin's trip, in scene pixels: its top-left and shape per frame, at 180ms a frame. Cut at the
 * blades (0), it drops into the basket's heap (5) and rests a beat, hops out over the rim (7 to 9),
 * rolls along the ground in front of the money tree's roots, turning (10 to 16), and drops into the
 * fresh hole (17), settling on the coin already set there (18 to 20), so it never vanishes.
 */
const TRIP: readonly CoinStep[] = [
  [26, 27, COIN_FACE],
  [26, 29, COIN_EDGE],
  [25, 31, COIN_FACE],
  [25, 33, COIN_EDGE],
  [24, 35, COIN_FACE],
  [RESTING.x, RESTING.y, COIN_FACE],
  [RESTING.x, RESTING.y, COIN_FACE],
  [27, 34, COIN_EDGE],
  [30, 36, COIN_FACE],
  [33, 40, COIN_EDGE],
  [36, 40, COIN_FACE],
  [39, 40, COIN_EDGE],
  [42, 40, COIN_FACE],
  [45, 40, COIN_EDGE],
  [48, 40, COIN_FACE],
  [51, 40, COIN_EDGE],
  [54, 40, COIN_FACE],
  [57, 41, COIN_EDGE],
  [SETTLED.x, SETTLED.y, COIN_SET],
  [SETTLED.x, SETTLED.y, COIN_SET],
  [SETTLED.x, SETTLED.y, COIN_SET],
];
const TRIP_MS = 180;
/** The layer's corner and size: the box the whole trip fits in. */
const TRIP_AT = { x: 24, y: 27, width: 37, height: 17 } as const;

const TRIP_FRAMES = TRIP.map(([x, y, shape]) => {
  const cells = Array.from({ length: TRIP_AT.height }, () => new Array<string>(TRIP_AT.width).fill('.'));
  shape.forEach((row, j) => {
    const line = cells[y - TRIP_AT.y + j];
    if (!line) return;
    [...row].forEach((ch, k) => {
      if (ch !== '.') line[x - TRIP_AT.x + k] = ch;
    });
  });
  return cells.map((line) => line.join(''));
});

/** The coin's trip as one layer. At rest and under Reduce Motion it sits on the basket's heap (6). */
const trip: PixelSprite = {
  id: 'if21-trip',
  name: 'if21-trip',
  tags: ['scene', 'if'],
  rows: TRIP_FRAMES[6] ?? [],
  frames: TRIP_FRAMES,
  frameMs: TRIP_MS,
};

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

/**
 * Garden shears, 9x5, red grips in the hand, on the coin's clock: the blades snap shut as the coin is
 * cut (frames 20 and 0) and stand open for the rest of its trip.
 */
const shears: PixelSprite = {
  id: 'if21-shears',
  name: 'if21-shears',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: SHEARS_OPEN,
  frames: TRIP.map((_, i) => (i === 0 || i === TRIP.length - 1 ? SHEARS_SHUT : SHEARS_OPEN)),
  frameMs: TRIP_MS,
};

/* ── the opener ────────────────────────────────────────────────────────────────────────────────── */

const INVESTOR = { x: 6, y: 17 } as const;
/** Under the investor, so their shoes rest on the rung LADDER_STEP. */
const LADDER = { x: INVESTOR.x + 1, y: INVESTOR.y + 21 - LADDER_STEP } as const;
/** The grips just past the hand, so the blades reach into the crown's left edge. */
const SHEARS = { x: INVESTOR.x + 14, y: INVESTOR.y + 9 } as const;
const TREE = { x: 26, y: 11 } as const;
const BUSH = { x: 61, y: 34 } as const;
/** At the ladder's foot, the middle of its heap under the trip's resting coin. */
const BASKET = { x: RESTING.x - 3, y: RESTING.y + 2 } as const;
/** Under the trip's last frames, so the coin settles on the one already set there. */
const HOLE = { x: SETTLED.x - HOLE_COIN.x, y: SETTLED.y - HOLE_COIN.y } as const;

const base = ifCompose('if21-opener-base', 80, 60, [
  { sprite: ifStage, x: 0, y: 0 },
  { sprite: ifMoneyTree, x: TREE.x, y: TREE.y },
  { sprite: ifBondBush, x: BUSH.x, y: BUSH.y },
  { sprite: hole, x: HOLE.x, y: HOLE.y },
  { sprite: ifCoinBasket, x: BASKET.x, y: BASKET.y },
  { sprite: sign, x: 54, y: 47 },
  // The ladder before the investor, who stands in front of it.
  { sprite: ladder, x: LADDER.x, y: LADDER.y },
  { sprite: ifInvestor, x: INVESTOR.x, y: INVESTOR.y },
]);

export const if21Opener: SceneArt = {
  id: 'if21-opener',
  label: 'At night an investor on a stepladder trims an overgrown money tree with garden shears, and the cut gold coin drops into a basket at the foot of the ladder, then rolls across to a much smaller teal bush and settles into a fresh hole at its foot, with a stake in front of the bush reading 60/40.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: trip, x: TRIP_AT.x, y: TRIP_AT.y },
    { sprite: shears, x: SHEARS.x, y: SHEARS.y },
    { sprite: ifGlint, x: TREE.x + 14, y: TREE.y + 3 },
    { sprite: ifLater(ifGlint, 'if21-glint-low', 2, 300), x: TREE.x + 18, y: TREE.y + 10 },
    { sprite: ifLater(ifGlint, 'if21-glint-basket', 4, 330), x: BASKET.x + 2, y: BASKET.y - 1 },
    { sprite: ifStarBig, x: 54, y: 6, motion: { kind: 'twinkle', periodMs: 2300, min: 0.3 } },
    { sprite: ifStar, x: 33, y: 4, motion: { kind: 'twinkle', periodMs: 1800, phase: 0.4, min: 0.2 } },
    { sprite: ifStar, x: 68, y: 12, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.7, min: 0.2 } },
    { sprite: ifStar, x: 76, y: 3, motion: { kind: 'twinkle', periodMs: 2900, phase: 0.2, min: 0.2 } },
    { sprite: ifFirefly, x: 33, y: 51, motion: { kind: 'rise', amp: 5, periodMs: 3500, phase: 0.1 } },
    { sprite: ifFirefly, x: 47, y: 46, motion: { kind: 'rise', amp: 6, periodMs: 4100, phase: 0.55 } },
    { sprite: ifFirefly, x: 8, y: 54, motion: { kind: 'rise', amp: 5, periodMs: 3800, phase: 0.8 } },
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────────── */

const emblemShearsToBonds: PixelSprite = {
  id: 'if-emblem-shears-to-bonds',
  name: 'if-emblem-shears-to-bonds',
  tags: ['scene', 'if'],
  blurb: "Lesson 21: open shears, and the coin they cut going into the teal bush. Trim what outgrew the plan; plant it in what fell behind.",
  rows: [
    'w...w.....',
    'xw.wx..OO.',
    '.xKx..OyGO',
    'RR.RR.OGgO',
    'R..R.R.OO.',
    'RR.RRmTTt.',
    '....mTTTTt',
    '...TTTTTtt',
  ],
};

export const if21Finish: SceneArt = ifKeepsake(
  'if21-finish',
  'A golden acorn hanging from an oak twig, with open garden shears beside a gold coin dropping into a small teal bush in its purple window and small sparkles around it.',
  emblemShearsToBonds,
);

export const art: LessonArtSet = { opener: if21Opener, backdrop: ifBackdrop, finish: if21Finish };
