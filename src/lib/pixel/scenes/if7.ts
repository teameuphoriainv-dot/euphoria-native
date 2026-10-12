/**
 * Investing Fundamentals lesson 7, Mutual Funds & Fund Types: many people's money in one shared tub,
 * run by someone they hired.
 *
 * In the middle stands a big half-barrel heaped with coins, a few young sprouts of different kinds
 * coming up through them: one fund holding many things. Three investors toss in a coin each, two from
 * the left and one from the right, landing one after another: the pool. Behind the tub stands the
 * manager they hired, in a dark felt hat and waistcoat, who lifts one coin out of the heap for
 * themselves every so often: the expense ratio, paid out of the pool. A chalk slate leaning on the
 * tub's front carries one price, 25, because a fund is priced once a day, at its NAV. The tossed coins
 * arc in and the lifted coin rises (frames), the heap glints, stars twinkle and fireflies drift.
 *
 * The keepsake's emblem is three coins dropping into one tub of coins.
 */
import type { PixelSprite } from '../types';
import {
  IF_INVESTOR_HAND,
  IF_PALETTE,
  ifCompose,
  ifFirefly,
  ifFlip,
  ifGlint,
  ifInvestor,
  ifKeepsake,
  ifLater,
  ifStage,
  ifStar,
  ifStarBig,
} from './if-kit';
import { ifBackdrop } from './if-backdrop';
import { IF_GARDENER_HAND, ifCoinDrop, ifRecolour } from './if-kit-a';
import { ifDigits } from './if-kit-b';
import { IF_R_PALETTE } from './if-kit-r';
import type { LessonArtSet, SceneArt } from './types';

/* ── the tub ───────────────────────────────────────────────────────────────────────────────────── */

/** The shared tub, 30x9: a heap of coins over the rim, staves and two iron hoops. */
const tub: PixelSprite = {
  id: 'if7-tub',
  name: 'if7-tub',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [
    '...yG..yGyG...yG...yGyG..yG...',
    '.yGyGyGgGgGyGyGgGyGyGgGgGyGyG.',
    'yGgGgGgGgGgGgGgGgGgGgGgGgGgGgg',
    'xxxxxxxxxxXXXXXXXXXXXXXXXXXXXD',
    '.hAAaAAAaAAAaAAAaAAAaAAAaAAAa.',
    '.hAAaAAAaAAAaAAAaAAAaAAAaAAAa.',
    '.xxxxxXXXXXXXXXXXXXXXXXXXXXXD.',
    '..hAaAAAaAAAaAAAaAAAaAAAaAAa..',
    '...aaaaaaaaaaaaaaaaaaaaaaaa...',
  ],
};

/** A young sprout coming up through the coins, 3x3, its bud the colour of what it will bear. */
const sprout = (id: string, bud: string): PixelSprite => ({
  id,
  name: id,
  tags: ['scene', 'if'],
  rows: [`.${bud}.`, 'mNn', '.n.'],
});

/** The day's price on a chalk slate in a wooden frame, 9x7, leaning on the tub. */
const slate = ifCompose('if7-slate', 9, 7, [
  {
    sprite: {
      id: 'if7-slate-board',
      name: 'if7-slate-board',
      tags: ['scene', 'if'],
      palette: IF_PALETTE,
      rows: ['hhhhhhhhA', ...Array.from({ length: 5 }, () => 'hDDDDDDDA'), 'AAAAAAAAa'],
    },
    x: 0,
    y: 0,
  },
  { sprite: ifDigits('if7-nav', '25', 'w'), x: 1, y: 1 },
]);

/* ── the people ────────────────────────────────────────────────────────────────────────────────── */

/** Two more investors: the kit's figure in other hats, shirts and skin tones. */
const poolerLeft: PixelSprite = {
  ...ifRecolour(ifInvestor, 'if7-pooler-left', { '4': 'm', '3': 'T', '2': 't', C: 'S', U: 'M', q: 's', P: 'R', p: 'r' }),
  palette: IF_R_PALETTE,
};
/** The one on the right faces left, so they are mirrored; their hand is then at (1, 11). */
const poolerRight = ifFlip(
  ifRecolour(ifInvestor, 'if7-pooler-right-lit', { '4': 'B', '3': 'b', '2': 'u', C: 'J', U: 'z', q: 'm', P: 'N', p: 'n' }),
  'if7-pooler-right',
);
const POOLER_RIGHT_HAND = { x: 1, y: IF_INVESTOR_HAND.y } as const;

/**
 * The fund manager, 14x21, facing left: the gardener's figure in a dark felt hat with a black band,
 * grey hair, a white shirt, a black tie and a dark waistcoat, one arm out at IF_GARDENER_HAND.
 */
const manager: PixelSprite = {
  id: 'if7-manager',
  name: 'if7-manager',
  tags: ['scene', 'if'],
  palette: IF_R_PALETTE,
  rows: [
    '......DDD.....',
    '.....XDDDDD...',
    '.....KKKKKK...',
    '...XDDDDDDDD..',
    '....SSSSSxxx..',
    '....SSSSSSxx..',
    '....SKSSSSSx..',
    '...SSSSSSSMx..',
    '....MSSSSSM...',
    '.....MSSSMM...',
    '.....wwKwwx...',
    'SSwwwDDKDDwx..',
    'MMxxxDDKDDxx..',
    '....wDDGDDKx..',
    '....wDDDDDKx..',
    '....wDDDDDKx..',
    '....KDDDDDKK..',
    '.....XXXXXD...',
    '....XXD.XXD...',
    '....XD..XXD...',
    '...hAAa.hAAa..',
  ],
};

/* ── the opener ────────────────────────────────────────────────────────────────────────────────── */

const TUB = { x: 28, y: 38 } as const;
/** Clear of where the coins land and where the manager's coin comes up. */
const SPROUTS = [
  { sprite: sprout('if7-sprout-apple', 'R'), x: TUB.x + 13 },
  { sprite: sprout('if7-sprout-plum', 'B'), x: TUB.x + 18 },
  { sprite: sprout('if7-sprout-fig', 'Q'), x: TUB.x + 23 },
] as const;
const SLATE = { x: TUB.x + 11, y: TUB.y + 4 } as const;
/** The far investor stands a little further back than the near one. */
const POOLER_LEFT = { x: 0, y: 22 } as const;
const INVESTOR = { x: 14, y: 26 } as const;
const POOLER_RIGHT = { x: 61, y: 25 } as const;
/** The manager stands behind the tub, so its heap and staves hide the legs. */
const MANAGER = { x: 38, y: 22 } as const;
const MANAGER_HAND = { x: MANAGER.x + IF_GARDENER_HAND.x, y: MANAGER.y + IF_GARDENER_HAND.y } as const;

const base = ifCompose('if7-opener-base', 80, 60, [
  { sprite: ifStage, x: 0, y: 0 },
  { sprite: manager, x: MANAGER.x, y: MANAGER.y },
  { sprite: tub, x: TUB.x, y: TUB.y },
  ...SPROUTS.map(({ sprite, x }) => ({ sprite, x, y: TUB.y - 2 })),
  { sprite: slate, x: SLATE.x, y: SLATE.y },
  { sprite: poolerLeft, x: POOLER_LEFT.x, y: POOLER_LEFT.y },
  { sprite: ifInvestor, x: INVESTOR.x, y: INVESTOR.y },
  { sprite: poolerRight, x: POOLER_RIGHT.x, y: POOLER_RIGHT.y },
]);

/**
 * The three tosses share one 18-frame cycle and take turns, so the coins land one after another: the
 * far investor's first, high over the near one's hat, then the near one's, then the right one's. A
 * point off the layer is a frame with no coin. At rest all three hang in the air over the tub.
 */
const OFF = [-9, -9] as const;
const TOSS_MS = 150;
const tossFar = ifCoinDrop(
  'if7-toss-far',
  21,
  21,
  [[0, 12], [2, 7], [5, 3], [8, 1], [11, 1], [14, 4], [16, 9], [17, 14], [17, 17], OFF, OFF, OFF, OFF, OFF, OFF, OFF, OFF, OFF],
  TOSS_MS,
  4,
);
const TOSS_FAR_AT = { x: POOLER_LEFT.x + IF_INVESTOR_HAND.x, y: POOLER_LEFT.y + IF_INVESTOR_HAND.y - 16 } as const;
const tossNear = ifCoinDrop(
  'if7-toss-near',
  12,
  10,
  [OFF, OFF, OFF, OFF, OFF, OFF, [1, 5], [3, 2], [5, 1], [7, 3], [8, 6], OFF, OFF, OFF, OFF, OFF, OFF, OFF],
  TOSS_MS,
  8,
);
const TOSS_NEAR_AT = { x: INVESTOR.x + IF_INVESTOR_HAND.x - 2, y: INVESTOR.y + IF_INVESTOR_HAND.y - 9 } as const;
const tossRight = ifCoinDrop(
  'if7-toss-right',
  11,
  11,
  [OFF, OFF, OFF, OFF, OFF, OFF, OFF, OFF, OFF, OFF, OFF, OFF, [7, 5], [5, 2], [3, 1], [2, 3], [1, 7], OFF],
  TOSS_MS,
  14,
);
const TOSS_RIGHT_AT = { x: POOLER_RIGHT.x + POOLER_RIGHT_HAND.x - 9, y: POOLER_RIGHT.y + POOLER_RIGHT_HAND.y - 9 } as const;

/** The manager's fee: a coin lifted out of the heap up into the hand, then pocketed. At rest it is in the hand. */
const feeCoin = ifCoinDrop('if7-fee-coin', 4, 11, [[0, 7], [0, 4], [0, 1], OFF, OFF, OFF], 260, 2);
const FEE_AT = { x: MANAGER_HAND.x - 2, y: MANAGER_HAND.y - 5 } as const;

export const if7Opener: SceneArt = {
  id: 'if7-opener',
  label: 'Three investors toss coins into one big shared tub heaped with coins and a few young sprouts, while the manager they hired stands behind it lifting one coin out as a fee, and a chalk slate leaning on the tub shows the single price for today, 25.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: tossFar, x: TOSS_FAR_AT.x, y: TOSS_FAR_AT.y },
    { sprite: tossNear, x: TOSS_NEAR_AT.x, y: TOSS_NEAR_AT.y },
    { sprite: tossRight, x: TOSS_RIGHT_AT.x, y: TOSS_RIGHT_AT.y },
    { sprite: feeCoin, x: FEE_AT.x, y: FEE_AT.y },
    { sprite: ifGlint, x: TUB.x + 2, y: TUB.y - 1 },
    { sprite: ifLater(ifGlint, 'if7-glint-pool', 2, 290), x: TUB.x + 20, y: TUB.y - 1 },
    { sprite: ifStarBig, x: 56, y: 6, motion: { kind: 'twinkle', periodMs: 2300, min: 0.3 } },
    { sprite: ifStar, x: 24, y: 4, motion: { kind: 'twinkle', periodMs: 1800, phase: 0.4, min: 0.2 } },
    { sprite: ifStar, x: 68, y: 14, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.7, min: 0.2 } },
    { sprite: ifStar, x: 75, y: 3, motion: { kind: 'twinkle', periodMs: 2000, phase: 0.2, min: 0.25 } },
    { sprite: ifFirefly, x: 10, y: 52, motion: { kind: 'rise', amp: 5, periodMs: 3400, phase: 0.1 } },
    { sprite: ifFirefly, x: 66, y: 51, motion: { kind: 'rise', amp: 6, periodMs: 4100, phase: 0.5 } },
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
