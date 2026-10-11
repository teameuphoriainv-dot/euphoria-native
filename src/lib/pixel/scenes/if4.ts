/**
 * Investing Fundamentals lesson 4, Stocks vs. Bonds: the two ways to put money to work, side by side.
 *
 * Behind the investor stands a money tree with their purple pennant planted at its foot: they own
 * it, coins and swings and all, which is a share. In front of them is a neighbour's red barn with an
 * IOU nailed to its door, and the investor holds out a coin toward it: a loan, paid back with interest,
 * and a coupon coin keeps rising off the note. A new set for the pathway (the barn), still lit from
 * the left by the moon behind the tree. The pennant flutters, the loft lantern flickers, coins glint,
 * stars twinkle and fireflies drift.
 *
 * The keepsake's emblem is the same pair: a small tree for a share beside a note for a loan.
 */
import type { PixelSprite } from '../types';
import {
  IF_INVESTOR_HAND,
  ifCoin,
  ifCompose,
  ifFirefly,
  ifFlame,
  ifGlint,
  ifGoldMote,
  ifInvestor,
  ifKeepsake,
  ifLater,
  ifMoneyTree,
  ifStage,
  ifStar,
  ifStarBig,
} from './if-kit';
import { ifBackdrop } from './if-backdrop';
import { IF_A_PALETTE } from './if-kit-a';
import type { LessonArtSet, SceneArt } from './types';

/* ── props ─────────────────────────────────────────────────────────────────────────────────────── */

/** A gambrel barn's front gable, 30x31, lit from the left; the loft glows at (13, 8), the door is (9..20, 15..29). */
const barn: PixelSprite = {
  id: 'if4-barn',
  name: 'if4-barn',
  tags: ['scene', 'if'],
  rows: [
    '.............DDDD.............',
    '...........DDwwxxDD...........',
    '.........DDwwrrrrxxDD.........',
    '.......DDwwrrrrrrrrxxDD.......',
    '.....DDwwrrrwwwwwwrrrxxDD.....',
    '....DDwr1rrrwKKKKwrrr1rxDD....',
    '...DDwrr1rrrwKKKKwrrr1rrxDD...',
    '...DDwrr1rrrwKKKKwrrr1rrxDD...',
    '..DDwrrr1rrrw3333wrrr1rrrxDD..',
    '..DDwrrr1rrrw4444wrrr1rrrxDD..',
    '.DDw1rrr1rrrwwwwwwrrr1rrr1xDD.',
    '.DDw1rrr1rrrrrrrrrrrr1rrr1xDD.',
    'DDwwwwwwwwwwwwwxxxxxxxxxxxxxDD',
    '.Rrr1rrrrrrrrrrrrrrrrrrrr1rr1.',
    '.Rrr1rrrrrrrrrrrrrrrrrrrr1rr1.',
    '.Rrr1rrrrwwwwwwwwwwwwrrrr1rr1.',
    '.Rrr1rrrrwrrrr11rrrrwrrrr1rr1.',
    '.Rrr1rrrrwrrrr11rrrrwrrrr1rr1.',
    '.Rrr1rrrrwrrrr11rrrrwrrrr1rr1.',
    '.Rrr1rrrrwrrrr11rrrrwrrrr1rr1.',
    '.Rrr1rrrrwrrrr11rrrrwrrrr1rr1.',
    '.Rrr1rrrrwrrrr11rrrrwrrrr1rr1.',
    '.Rrr1rrrrwRRRR11RRRRwrrrr1rr1.',
    '.Rrr1rrrrwrrrr11rrrrwrrrr1rr1.',
    '.Rrr1rrrrwrrrr11rrrrwrrrr1rr1.',
    '.Rrr1rrrrwrrrr11rrrrwrrrr1rr1.',
    '.Rrr1rrrrwrrrr11rrrrwrrrr1rr1.',
    '.Rrr1rrrrwrrrr11rrrrwrrrr1rr1.',
    '.Rrr1rrrrwrrrr11rrrrwrrrr1rr1.',
    '.Rrr1rrrrwrrrr11rrrrwrrrr1rr1.',
    'XXXXXXXXXXXXXXXDDDDDDDDDDDDDDD',
  ],
};

/** The note on the barn door, 11x6, pinned at the top: I O U in ink. */
const iou: PixelSprite = {
  id: 'if4-iou',
  name: 'if4-iou',
  tags: ['scene', 'if'],
  rows: [
    'wwwwwGwwwww',
    'wKwKKKwKwKw',
    'wKwKwKwKwKw',
    'wKwKwKwKwKw',
    'wKwKKKwKKKw',
    'wwwwwwwwwwx',
  ],
};

/** The investor's pennant on a stake, 6x11: theirs, planted at the foot of the tree they own. */
const pennant: PixelSprite = {
  id: 'if4-pennant',
  name: 'if4-pennant',
  tags: ['scene', 'if'],
  palette: IF_A_PALETTE,
  rows: [
    'hqPp..',
    'hPPPPp',
    'hPPp..',
    'h.....',
    'h.....',
    'h.....',
    'h.....',
    'h.....',
    'h.....',
    'h.....',
    'A.....',
  ],
  frames: [
    [
      'hqPp..',
      'hPPPPp',
      'hPPp..',
      'h.....',
      'h.....',
      'h.....',
      'h.....',
      'h.....',
      'h.....',
      'h.....',
      'A.....',
    ],
    [
      'hqPPp.',
      'hPPPp.',
      'hPp...',
      'h.....',
      'h.....',
      'h.....',
      'h.....',
      'h.....',
      'h.....',
      'h.....',
      'A.....',
    ],
    [
      'hqPp..',
      'hPPPPp',
      'hPPp..',
      'h.....',
      'h.....',
      'h.....',
      'h.....',
      'h.....',
      'h.....',
      'h.....',
      'A.....',
    ],
    [
      'hqP...',
      'hPPPPp',
      'hPPPp.',
      'h.....',
      'h.....',
      'h.....',
      'h.....',
      'h.....',
      'h.....',
      'h.....',
      'A.....',
    ],
  ],
  frameMs: 260,
};

/* ── the opener ────────────────────────────────────────────────────────────────────────────────── */

const TREE = { x: 2, y: 12 } as const;
const INVESTOR = { x: 27, y: 25 } as const;
const BARN = { x: 50, y: 15 } as const;
const IOU = { x: BARN.x + 10, y: BARN.y + 18 } as const;
/** The coin is pinched at its left edge, so the hand closes over it. */
const COIN = { x: INVESTOR.x + IF_INVESTOR_HAND.x + 1, y: INVESTOR.y + IF_INVESTOR_HAND.y - 2 } as const;

const base = ifCompose('if4-opener-base', 80, 60, [
  { sprite: ifStage, x: 0, y: 0 },
  { sprite: ifMoneyTree, x: TREE.x, y: TREE.y },
  { sprite: barn, x: BARN.x, y: BARN.y },
  { sprite: iou, x: IOU.x, y: IOU.y },
  { sprite: ifCoin, x: COIN.x, y: COIN.y },
  { sprite: ifInvestor, x: INVESTOR.x, y: INVESTOR.y },
]);

export const if4Opener: SceneArt = {
  id: 'if4-opener',
  label: 'An investor holds out a coin toward a red barn with an IOU nailed to its door, a loan, while behind them their own money tree has their purple pennant planted at its foot, a share they own.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: pennant, x: TREE.x + 17, y: TREE.y + 23 },
    { sprite: ifFlame, x: BARN.x + 13, y: BARN.y + 7 },
    // The coupon: a coin lifting off the note and fading, again and again, with a mote beside it.
    { sprite: ifCoin, x: IOU.x + 4, y: IOU.y - 5, motion: { kind: 'rise', amp: 6, periodMs: 2400 } },
    { sprite: ifGoldMote, x: IOU.x + 2, y: IOU.y - 2, motion: { kind: 'rise', amp: 5, periodMs: 2400, phase: 0.5 } },
    { sprite: ifGlint, x: COIN.x, y: COIN.y },
    { sprite: ifLater(ifGlint, 'if4-glint-tree', 2, 290), x: TREE.x + 14, y: TREE.y + 3 },
    { sprite: ifLater(ifGlint, 'if4-glint-tree-low', 4, 330), x: TREE.x + 3, y: TREE.y + 16 },
    { sprite: ifStarBig, x: 44, y: 5, motion: { kind: 'twinkle', periodMs: 2300, min: 0.3 } },
    { sprite: ifStar, x: 31, y: 9, motion: { kind: 'twinkle', periodMs: 1800, phase: 0.4, min: 0.2 } },
    { sprite: ifStar, x: 56, y: 6, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.7, min: 0.2 } },
    { sprite: ifStar, x: 74, y: 10, motion: { kind: 'twinkle', periodMs: 2000, phase: 0.2, min: 0.25 } },
    { sprite: ifFirefly, x: 45, y: 44, motion: { kind: 'rise', amp: 5, periodMs: 3400, phase: 0.1 } },
    { sprite: ifFirefly, x: 9, y: 50, motion: { kind: 'rise', amp: 6, periodMs: 4100, phase: 0.5 } },
    { sprite: ifFirefly, x: 36, y: 53, motion: { kind: 'rise', amp: 5, periodMs: 3700, phase: 0.8 } },
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────────── */

const emblemShareAndNote: PixelSprite = {
  id: 'if-emblem-share-note',
  name: 'if-emblem-share-note',
  tags: ['scene', 'if'],
  blurb: "Lesson 4: a small tree you own beside a note you are owed. A share and a bond.",
  palette: IF_A_PALETTE,
  rows: [
    '.mN.wwwwww',
    'mNNnwKwKKw',
    'NNnnwwwwww',
    '.nn.wKKKww',
    '.hA.wwwwww',
    '.hA.wKKwKw',
    '.hA.wwwwGx',
    'hhAa.xxxx.',
  ],
};

export const if4Finish: SceneArt = ifKeepsake(
  'if4-finish',
  'A golden acorn hanging from an oak twig, with a small tree beside a written note in its purple window and small sparkles around it.',
  emblemShareAndNote,
);

export const art: LessonArtSet = { opener: if4Opener, backdrop: ifBackdrop, finish: if4Finish };
