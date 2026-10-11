/**
 * Investing Fundamentals lesson 2, Risk vs. Reward: the orchard split by weather.
 *
 * On the left, under a clear moon, a sprout sits safe under a glass cloche and stays small: money
 * with no volatility and no growth. On the right a storm has rolled in over the money tree, rain
 * driving across it, coins blowing loose and lightning on the far hill, and the tree is still the one
 * heavy with coins. The investor stands between them under an umbrella, facing the storm: accepting
 * the swings is the price of the return. Rain, lightning and falling coins are frames (layer motion
 * can only rise); stars, fireflies and the glint on the glass are the calm side's motion.
 *
 * The keepsake's emblem is a balance: the trade the lesson is about.
 */
import type { PixelSprite } from '../types';
import {
  IF_INVESTOR_HAND,
  IF_PALETTE,
  ifCompose,
  ifFirefly,
  ifGlint,
  ifInvestor,
  ifKeepsake,
  ifLater,
  ifMoneyTree,
  ifSprout,
  ifStage,
  ifStar,
  ifStarBig,
} from './if-kit';
import { ifBackdrop } from './if-backdrop';
import { ifCoinDrop } from './if-kit-a';
import type { LessonArtSet, SceneArt } from './types';

/* ── props ─────────────────────────────────────────────────────────────────────────────────────── */

/** The storm bank, 52x15: round tops lit on their upper left by the moon, a dark ragged underside. */
const stormCloud: PixelSprite = {
  id: 'if2-storm-cloud',
  name: 'if2-storm-cloud',
  tags: ['scene', 'if'],
  rows: [
    '.............xxxxxxxx..xxxxxxxxxx..xxxxxxxx.........',
    '............xxxxxxxxxxxxxxxxxxxxXXxxxxxxxxxx..xxxx..',
    '...........xxxxxxXXXXXxxxxxXXXXXXXxxxxxXXXXXXxxxxxXX',
    '.....xxXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXxXXXXXXX',
    '....xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    '...xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    '...xXXXXXXXDXXXXXDDDDDXXXXXXDDDDDDXXXXXDDDDDXXXXXXDD',
    '..xXXXDDDDDDXDDDDDDDDDXXDDDDDDDDDXXDDDDDDDDXXDDDDDDD',
    '.xXXDDDDDDDXDDDDDDDDDXDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    '.xDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    '.xDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    '.KDDDDDDKKDDDDDDDDKDDDDDDDDDKDDDDDDDDDKKDDDDDDDDDDDD',
    '..KDKKKK..DDDKKKKK.KDDDDKKKKKKDDDDKKKKK.DDDKKKKKKKKK',
    '...KKKK...KKKKKKKK..KKKKKKKK..KKKKKKKK..KKKKKKKK....',
    '............KKKK.....KKKKKK....KKKKKK.....KKKK......',
  ],
};

/** A glass cloche on a board, 12x13: the safe place. The glass is see-through; whatever is in it shows. */
const cloche: PixelSprite = {
  id: 'if2-cloche',
  name: 'if2-cloche',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [
    '.....xx.....',
    '....wwxx....',
    '...wQ..Qx...',
    '..wQ....Qx..',
    '.wQ......Qx.',
    '.w........x.',
    '.w........x.',
    '.w........x.',
    '.wQ.......x.',
    '.w........x.',
    '.w........x.',
    'hhhhAAAAAAaa',
    '.aaaaaaaaaa.',
  ],
};

/** A teal umbrella, 15x18, held by the grip at (7, 17). */
const umbrella: PixelSprite = {
  id: 'if2-umbrella',
  name: 'if2-umbrella',
  tags: ['scene', 'if'],
  rows: [
    '.......X.......',
    '....mmmTTTt....',
    '..mmTTTTTTTTt..',
    '.mTTTTTTTTTTTt.',
    'mTTTTTTTTTTTTTt',
    'tTt.tTtXtTt.tTt',
    '.......X.......',
    '.......X.......',
    '.......X.......',
    '.......X.......',
    '.......X.......',
    '.......X.......',
    '.......X.......',
    '.......X.......',
    '.......X.......',
    '.......X.......',
    '.......X.......',
    '.......X.......',
  ],
};
const UMBRELLA_GRIP = { x: 7, y: 17 } as const;

/** A coin knocked off the tree, lying in the grass. */
const fallenCoin: PixelSprite = {
  id: 'if2-fallen-coin',
  name: 'if2-fallen-coin',
  tags: ['scene', 'if'],
  rows: [
    'OyGO',
    '.OO.',
  ],
};

/* ── moving parts ──────────────────────────────────────────────────────────────────────────────── */

const BOLT = [
  '....ww',
  '...ww.',
  '..ww..',
  '.ww...',
  'ww....',
  'wwwww.',
  '...ww.',
  '..ww..',
  '.ww...',
  'ww....',
  'wwww..',
  '..ww..',
  '.ww...',
  'ww....',
  'w.....',
];
const DARK = BOLT.map((row) => '.'.repeat(row.length));

/** Lightning on the far hill: two quick flashes, then a long dark beat. */
const lightning: PixelSprite = {
  id: 'if2-lightning',
  name: 'if2-lightning',
  tags: ['scene', 'if'],
  rows: BOLT,
  frames: [BOLT, DARK, BOLT, DARK, DARK, DARK, DARK, DARK, DARK, DARK],
  frameMs: 130,
};

/**
 * Rain over a patch: a streak two pixels long in each listed column (with its offset in a six-row
 * repeat), moved down two rows a frame, so three frames loop without a seam.
 */
function rain(id: string, width: number, height: number, columns: readonly (readonly [number, number])[]): PixelSprite {
  const frame = (shift: number) =>
    Array.from({ length: height }, (_, y) =>
      Array.from({ length: width }, (_, x) =>
        columns.some(([cx, offset]) => cx === x && (((y - offset - shift) % 6) + 6) % 6 < 2) ? 'B' : '.',
      ).join(''),
    );
  return { id, name: id, tags: ['scene', 'if'], rows: frame(0), frames: [0, 2, 4].map(frame), frameMs: 100 };
}

const rainOverUmbrella = rain('if2-rain-a', 16, 4, [[3, 1], [8, 4], [13, 2]]);
const rainNear = rain('if2-rain-b', 16, 28, [[1, 0], [5, 3], [9, 1], [13, 4]]);
const rainFar = rain('if2-rain-c', 16, 28, [[2, 2], [6, 5], [10, 0], [14, 3]]);

/** Two coins blown off the tree's windward side, falling down and to the left into the grass. */
const blownCoin = ifCoinDrop('if2-blown-coin', 13, 15, [[9, 0], [8, 2], [6, 4], [5, 7], [3, 9], [2, 11], [-9, -9], [-9, -9]], 170, 2);
const blownCoinHigh = ifCoinDrop('if2-blown-coin-high', 12, 22, [[8, 0], [7, 3], [6, 6], [4, 10], [3, 13], [2, 16], [1, 18], [-9, -9]], 190, 3);

/* ── the opener ────────────────────────────────────────────────────────────────────────────────── */

const INVESTOR = { x: 24, y: 25 } as const;
const UMBRELLA = { x: INVESTOR.x + IF_INVESTOR_HAND.x - UMBRELLA_GRIP.x, y: INVESTOR.y + IF_INVESTOR_HAND.y - UMBRELLA_GRIP.y } as const;
const CLOCHE = { x: 4, y: 33 } as const;

const base = ifCompose('if2-opener-base', 80, 60, [
  { sprite: ifStage, x: 0, y: 0 },
  { sprite: stormCloud, x: 28, y: 0 },
  { sprite: ifMoneyTree, x: 50, y: 13 },
  { sprite: fallenCoin, x: 43, y: 46 },
  { sprite: fallenCoin, x: 47, y: 47 },
  // The sprout before the glass, so the board closes over its soil and the glass sits in front.
  { sprite: ifSprout, x: CLOCHE.x + 2, y: CLOCHE.y + 7 },
  { sprite: cloche, x: CLOCHE.x, y: CLOCHE.y },
  // The umbrella before the investor, so the hand closes over the grip.
  { sprite: umbrella, x: UMBRELLA.x, y: UMBRELLA.y },
  { sprite: ifInvestor, x: INVESTOR.x, y: INVESTOR.y },
]);

export const if2Opener: SceneArt = {
  id: 'if2-opener',
  label: 'On a calm moonlit side a small sprout sits safe under a glass cloche, while on the other side a storm rains on a tall money tree full of coins and an investor faces it under an umbrella.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: rainOverUmbrella, x: 28, y: 15 },
    { sprite: rainNear, x: 44, y: 15 },
    { sprite: rainFar, x: 60, y: 15 },
    { sprite: lightning, x: 74, y: 12 },
    { sprite: blownCoin, x: 42, y: 31 },
    { sprite: blownCoinHigh, x: 46, y: 24 },
    { sprite: ifLater(ifGlint, 'if2-glint-glass', 1, 300), x: CLOCHE.x + 2, y: CLOCHE.y + 1 },
    { sprite: ifStarBig, x: 22, y: 4, motion: { kind: 'twinkle', periodMs: 2400, min: 0.3 } },
    { sprite: ifStar, x: 25, y: 14, motion: { kind: 'twinkle', periodMs: 1900, phase: 0.4, min: 0.2 } },
    { sprite: ifStar, x: 1, y: 19, motion: { kind: 'twinkle', periodMs: 2700, phase: 0.7, min: 0.2 } },
    { sprite: ifStar, x: 13, y: 18, motion: { kind: 'twinkle', periodMs: 2100, phase: 0.2, min: 0.25 } },
    { sprite: ifFirefly, x: 18, y: 41, motion: { kind: 'rise', amp: 5, periodMs: 3600, phase: 0.2 } },
    { sprite: ifFirefly, x: 2, y: 31, motion: { kind: 'rise', amp: 4, periodMs: 3100, phase: 0.6 } },
    { sprite: ifFirefly, x: 21, y: 51, motion: { kind: 'rise', amp: 5, periodMs: 3900, phase: 0.85 } },
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────────── */

const emblemScales: PixelSprite = {
  id: 'if-emblem-scales',
  name: 'if-emblem-scales',
  tags: ['scene', 'if'],
  blurb: "Lesson 2: a balance with two pans. Every return is weighed against its risk.",
  rows: [
    '....yy....',
    '.yyyGGggg.',
    '.w..yG..x.',
    'w.w.yG.x.x',
    'www.yG.xxx',
    '....yG....',
    '...yyGg...',
    '..OOOOOO..',
  ],
};

export const if2Finish: SceneArt = ifKeepsake(
  'if2-finish',
  'A golden acorn hanging from an oak twig, with a balance scale in its purple window and small sparkles around it.',
  emblemScales,
);

export const art: LessonArtSet = { opener: if2Opener, backdrop: ifBackdrop, finish: if2Finish };
