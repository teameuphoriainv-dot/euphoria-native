/**
 * Investing Fundamentals lesson 9, Building Your First Portfolio: the first morning of the orchard,
 * and a planting plan.
 *
 * A new set for the pathway: dawn. The night sky warms band by band toward a sun coming up behind
 * the far hills (the stage's rows repainted, the moon gone). On a round sign the plan is a pie, 60%
 * gold, 30% orchid and 10% teal, and beside it three fresh beds sized to match, each marked with a
 * flag of its colour: coin sprouts for home stocks, fig sprouts for the rest of the world, and a
 * small teal bush for bonds. The investor holds the next seedling. Birds cross, the sun's rays shine,
 * the last stars fade, seed fluff rises and a glint crosses the sign.
 *
 * The keepsake's emblem is the same pie.
 */
import type { PixelSprite } from '../types';
import {
  IF_INVESTOR_HAND,
  IF_PALETTE,
  ifCompose,
  ifGlint,
  ifInvestor,
  ifKeepsake,
  ifLater,
  ifSeedMote,
  ifStage,
  ifStar,
} from './if-kit';
import { ifBackdrop } from './if-backdrop';
import { IF_FIG, ifBedOf, ifCoinSprout, ifRecolour } from './if-kit-a';
import type { LessonArtSet, SceneArt } from './types';

/* ── dawn ──────────────────────────────────────────────────────────────────────────────────────── */

/**
 * The stage's top 33 rows at dawn, laid over it: sky bands from night (k) through orchid and pink to
 * amber and pale gold at the horizon, the night streaks turned to lit cloud, the hills unchanged and
 * the sun half up behind them, centred at (59, 31).
 */
const dawnSky: PixelSprite = {
  id: 'if9-dawn-sky',
  name: 'if9-dawn-sky',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE',
    'EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE',
    'EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE',
    'EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE',
    'EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE',
    'pppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppp',
    'pppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppp',
    'pppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppp',
    'pppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppp',
    'pppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppp',
    'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP',
    'PPPPPPPPPqqqqqqPPPPPPPPPPPPPPPPPPPPPPPPPPPPPqqqqqqqqqPPPPPPPPPPPPPPPPPPPPPPPPPPP',
    'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPqqqqqqqqqqqqqqqqqqqqqqqqPPPPPPPPPPPPPPPPPPPP',
    'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP',
    'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP',
    'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
    'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
    'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
    'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
    'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
    '44444444444444444444444444444444vv44444444444444444444444yyyyy444444444444444444',
    '4444444444444444444444444444444vvvv44444444444444444444yyyyyyyyy5555555555vv4444',
    '4444445555555555555555555544444vvvv4444444444444444444yyy55555yyy44444444vvvv444',
    '444444444444444444vv44444444444vvvvv444444444444444444yy5555555yy444444444vvvvvv',
    'yyyyyyyyyyyyyyyyyvvvvyyyyyyyyyvvvvvvvvvyyyyyyyyyyyyyyyy555555555yvvyyyyyvvvvvvvv',
    'yyyyyyyyyyyyyyyvvvvvyyyyyyyvvvvvvvvvvvvvyyyyyyyyyyyyyyy555555555vvvvyyvvvvvvvvvv',
    'yyyvvyyyyyyyvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvyyyvvvvyyyyyy5vvvv5555vvvvvvvvvvvvvvvv',
    'yyvvvvyyyyvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvyvvvvyyyvvvvvvvvvvvvvvvvvvvvvvvvvvvv',
  ],
};

/** Rays over the rising sun, 17x6, set to twinkle. */
const sunRays: PixelSprite = {
  id: 'if9-sun-rays',
  name: 'if9-sun-rays',
  tags: ['scene', 'if'],
  rows: [
    '........5........',
    '..y.....5.....y..',
    '...y.........y...',
    '.................',
    'y...............y',
    '.................',
  ],
};

/** A bird crossing the dawn sky, wings up and down. */
const bird: PixelSprite = {
  id: 'if9-bird',
  name: 'if9-bird',
  tags: ['scene', 'if'],
  rows: [
    'K...K',
    '.K.K.',
    '..K..',
  ],
  frames: [
    [
      'K...K',
      '.K.K.',
      '..K..',
    ],
    [
      '.....',
      'KK.KK',
      '..K..',
    ],
  ],
  frameMs: 300,
};

/* ── the plan ──────────────────────────────────────────────────────────────────────────────────── */

/** The plan on a round board, 13x13: 60% gold, 30% orchid, 10% teal, clockwise from twelve. */
const pieSign: PixelSprite = {
  id: 'if9-pie-sign',
  name: 'if9-pie-sign',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [
    '....AAAAA....',
    '..AAATyyAAA..',
    '.AAQTTyyGGAA.',
    '.AQQTTyGGGGA.',
    'AAQQQTGGGGGAA',
    'AQQQqqGGGGGgA',
    'AQQqqqGGGGggA',
    'AqqqqqGGggggA',
    'AAqqqGGggggAA',
    '.AqqGGgggggA.',
    '.AAqggggggAA.',
    '..AAAgggAAA..',
    '....AAAAA....',
  ],
};

const signPost: PixelSprite = {
  id: 'if9-sign-post',
  name: 'if9-sign-post',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [...Array.from({ length: 11 }, () => '.hA.'), 'ahAa'],
};

/** A bed's marker flag, 3x8, gold; recoloured for the other two beds. */
const flag: PixelSprite = {
  id: 'if9-flag',
  name: 'if9-flag',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [
    'hyG',
    'hGg',
    'h..',
    'h..',
    'h..',
    'h..',
    'h..',
    'A..',
  ],
};

/** The bonds: a small, steady teal bush. */
const tealBush: PixelSprite = {
  id: 'if9-teal-bush',
  name: 'if9-teal-bush',
  tags: ['scene', 'if'],
  rows: [
    '.mT.',
    'mTTt',
    'TTtt',
    '.tt.',
  ],
};

/** A seedling in a clay pot, 6x7, held by the rim at (0, 3). */
const pottedSeedling: PixelSprite = {
  id: 'if9-potted-seedling',
  name: 'if9-potted-seedling',
  tags: ['scene', 'if'],
  rows: [
    '.mN.Nn',
    'mNNnNn',
    '..n...',
    '433332',
    '.3332.',
    '.3322.',
    '..11..',
  ],
};
const POT_GRIP = { x: 0, y: 3 } as const;

/* ── the opener ────────────────────────────────────────────────────────────────────────────────── */

const INVESTOR = { x: 2, y: 25 } as const;
const POT = { x: INVESTOR.x + IF_INVESTOR_HAND.x + 1 - POT_GRIP.x, y: INVESTOR.y + IF_INVESTOR_HAND.y - POT_GRIP.y } as const;
const SIGN = { x: 22, y: 21 } as const;
const BED_Y = 47;
/** 60/30/10 of the ground right of the sign: 23, 11 and 5 pixels, with a flag at each bed's left end. */
const BEDS = [
  { x: 37, width: 23, flag },
  { x: 62, width: 11, flag: ifRecolour(flag, 'if9-flag-orchid', { y: 'Q', G: 'q', g: 'P' }) },
  { x: 75, width: 5, flag: ifRecolour(flag, 'if9-flag-teal', { y: 'm', G: 'T', g: 't' }) },
] as const;
const COIN_SPROUTS_X = [41, 47, 53] as const;
const figSprout = ifRecolour(ifCoinSprout, 'if9-fig-sprout', IF_FIG);

const base = ifCompose('if9-opener-base', 80, 60, [
  { sprite: ifStage, x: 0, y: 0 },
  { sprite: dawnSky, x: 0, y: 0 },
  { sprite: signPost, x: SIGN.x + 4, y: SIGN.y + 13 },
  { sprite: pieSign, x: SIGN.x, y: SIGN.y },
  ...BEDS.flatMap(({ x, width, flag: marker }, i) => [
    { sprite: ifBedOf(`if9-bed-${String(i)}`, width), x, y: BED_Y },
    { sprite: marker, x, y: BED_Y - 7 },
  ]),
  ...COIN_SPROUTS_X.map((x) => ({ sprite: ifCoinSprout, x, y: BED_Y - 6 })),
  { sprite: figSprout, x: 65, y: BED_Y - 6 },
  { sprite: tealBush, x: 76, y: BED_Y - 3 },
  // The pot before the investor, so the hand closes over its rim.
  { sprite: pottedSeedling, x: POT.x, y: POT.y },
  { sprite: ifInvestor, x: INVESTOR.x, y: INVESTOR.y },
]);

export const if9Opener: SceneArt = {
  id: 'if9-opener',
  label: 'At dawn an investor holds a seedling by a round sign showing a pie of sixty, thirty and ten percent, beside three new beds sized to match, planted with coin sprouts, fig sprouts and a small teal bush.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: sunRays, x: 51, y: 18, motion: { kind: 'twinkle', periodMs: 2600, min: 0.35 } },
    { sprite: bird, x: 12, y: 13, motion: { kind: 'drift', amp: 4, periodMs: 3200 } },
    { sprite: ifLater(bird, 'if9-bird-later', 1, 340), x: 30, y: 8, motion: { kind: 'drift', amp: 3, periodMs: 2800, phase: 0.5 } },
    { sprite: ifStar, x: 9, y: 2, motion: { kind: 'twinkle', periodMs: 3000, min: 0.1 } },
    { sprite: ifStar, x: 46, y: 1, motion: { kind: 'twinkle', periodMs: 3400, phase: 0.4, min: 0.1 } },
    { sprite: ifStar, x: 71, y: 3, motion: { kind: 'twinkle', periodMs: 2800, phase: 0.7, min: 0.1 } },
    { sprite: ifGlint, x: SIGN.x + 6, y: SIGN.y + 1 },
    { sprite: ifLater(ifGlint, 'if9-glint-sprout', 3, 300), x: COIN_SPROUTS_X[1] + 1, y: BED_Y - 2 },
    { sprite: ifSeedMote, x: 58, y: 44, motion: { kind: 'rise', amp: 6, periodMs: 3300, phase: 0.2 } },
    { sprite: ifSeedMote, x: 34, y: 49, motion: { kind: 'rise', amp: 5, periodMs: 3900, phase: 0.7 } },
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────────── */

const emblemPie: PixelSprite = {
  id: 'if-emblem-pie',
  name: 'if-emblem-pie',
  tags: ['scene', 'if'],
  blurb: "Lesson 9: a 60/30/10 pie in gold, orchid and teal. The allocation is the plan.",
  rows: [
    '...TTyy...',
    '..QTTGGG..',
    '.QQQTGGGG.',
    '.QQQQGGGg.',
    '.QQQQGGgg.',
    '.QQQGgggg.',
    '..QGgggg..',
    '...gggg...',
  ],
};

export const if9Finish: SceneArt = ifKeepsake(
  'if9-finish',
  'A golden acorn hanging from an oak twig, with a pie chart in gold, orchid and teal in its purple window and small sparkles around it.',
  emblemPie,
);

export const art: LessonArtSet = { opener: if9Opener, backdrop: ifBackdrop, finish: if9Finish };
