/**
 * Investing Fundamentals lesson 13, Dividends & Dividend Investing: being paid to own the tree.
 *
 * The investor sits on a stump under a grown money tree, a coin in their open hand, doing nothing at
 * all, and the tree pays them anyway: coins drop one after another into the basket at its foot.
 * On the trunk's other side a coin falls onto the bed beside two coin sprouts already coming up from
 * earlier coins planted back in the soil, which is a dividend reinvested (DRIP). Coins fall (frames),
 * glint on the tree and in the hand, stars twinkle, fireflies drift and seed fluff rises off the
 * sprouts.
 *
 * The keepsake's emblem is coins falling from a leafy bough.
 */
import type { PixelSprite } from '../types';
import {
  IF_PALETTE,
  ifCoin,
  ifCompose,
  ifFirefly,
  ifGlint,
  ifKeepsake,
  ifLater,
  ifMoneyTree,
  ifSeedMote,
  ifStage,
  ifStar,
  ifStarBig,
} from './if-kit';
import { ifBackdrop } from './if-backdrop';
import { ifBedOf, ifCoinDrop, ifCoinSprout } from './if-kit-a';
import { IF_SEATED_HAND, IF_SEATED_SEAT, ifCoinBasket, ifInvestorSeated } from './if-kit-b';
import type { LessonArtSet, SceneArt } from './types';

/* ── props ─────────────────────────────────────────────────────────────────────────────────────── */

/** An old stump to sit on, 9x4: a lit top with rings, bark down the sides. */
const stump: PixelSprite = {
  id: 'if13-stump',
  name: 'if13-stump',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [
    '.hhhhhhA.',
    'ahAhAAAAa',
    'aAAAAAAaa',
    'aaaaaaaaa',
  ],
};

/* ── the opener ────────────────────────────────────────────────────────────────────────────────── */

const BED = { x: 29, y: 45, width: 36 } as const;
/** The tree's last row sits on the bed's top edge. */
const TREE = { x: 34, y: BED.y - 33 } as const;
/** The basket under the crown's left side, on the bed. */
const BASKET = { x: 33, y: BED.y - 6 } as const;
const SPROUTS = [52, 58] as const;
const INVESTOR = { x: 16, y: 24 } as const;
const STUMP = { x: INVESTOR.x + IF_SEATED_SEAT.x - 1, y: INVESTOR.y + IF_SEATED_SEAT.y } as const;
/** The coin in the open hand, pinched at its left edge so the fingers close over it. */
const COIN = { x: INVESTOR.x + IF_SEATED_HAND.x + 1, y: INVESTOR.y + IF_SEATED_HAND.y - 2 } as const;

const base = ifCompose('if13-opener-base', 80, 60, [
  { sprite: ifStage, x: 0, y: 0 },
  { sprite: ifBedOf('if13-bed', BED.width), x: BED.x, y: BED.y },
  { sprite: ifMoneyTree, x: TREE.x, y: TREE.y },
  { sprite: ifCoinBasket, x: BASKET.x, y: BASKET.y },
  ...SPROUTS.map((x) => ({ sprite: ifCoinSprout, x, y: BED.y - 6 })),
  { sprite: stump, x: STUMP.x, y: STUMP.y },
  { sprite: ifCoin, x: COIN.x, y: COIN.y },
  { sprite: ifInvestorSeated, x: INVESTOR.x, y: INVESTOR.y },
]);

/**
 * Into the basket: one coin from the crown's left edge falls the whole way, a beat, then a second
 * from the lowest coin falls the short way. One layer, so the two never fall at once.
 */
const intoBasket = ifCoinDrop(
  'if13-into-basket',
  7,
  17,
  [[3, 0], [3, 3], [3, 6], [3, 9], [3, 11], [3, 13], [-9, -9], [-9, -9], [2, 8], [2, 10], [2, 12], [2, 13], [-9, -9], [-9, -9]],
  170,
  2,
);

/** Beside the trunk: a coin falls onto the bed next to the sprouts, where it will be planted. */
const ontoBed = ifCoinDrop('if13-onto-bed', 4, 12, [[0, 0], [0, 3], [0, 6], [0, 8], [-9, -9], [-9, -9], [-9, -9], [-9, -9], [-9, -9]], 200, 1);

export const if13Opener: SceneArt = {
  id: 'if13-opener',
  label: 'An investor sits on a stump under a money tree holding a coin, while the tree drops coins into a basket at its foot and another coin falls beside two coin sprouts planted from earlier coins.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: intoBasket, x: TREE.x + 1, y: TREE.y + 12 },
    { sprite: ontoBed, x: TREE.x + 14, y: TREE.y + 22 },
    { sprite: ifGlint, x: COIN.x, y: COIN.y },
    { sprite: ifLater(ifGlint, 'if13-glint-tree', 2, 290), x: TREE.x + 14, y: TREE.y + 3 },
    { sprite: ifLater(ifGlint, 'if13-glint-basket', 4, 330), x: BASKET.x + 3, y: BASKET.y - 1 },
    { sprite: ifStarBig, x: 30, y: 6, motion: { kind: 'twinkle', periodMs: 2300, min: 0.3 } },
    { sprite: ifStar, x: 24, y: 15, motion: { kind: 'twinkle', periodMs: 1800, phase: 0.4, min: 0.2 } },
    { sprite: ifStar, x: 70, y: 9, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.7, min: 0.2 } },
    { sprite: ifStar, x: 76, y: 22, motion: { kind: 'twinkle', periodMs: 2000, phase: 0.2, min: 0.25 } },
    { sprite: ifSeedMote, x: SPROUTS[1] + 3, y: BED.y - 9, motion: { kind: 'rise', amp: 5, periodMs: 3300, phase: 0.3 } },
    { sprite: ifFirefly, x: 8, y: 47, motion: { kind: 'rise', amp: 5, periodMs: 3500, phase: 0.1 } },
    { sprite: ifFirefly, x: 73, y: 50, motion: { kind: 'rise', amp: 6, periodMs: 4000, phase: 0.6 } },
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────────── */

const emblemFallingCoins: PixelSprite = {
  id: 'if-emblem-falling-coins',
  name: 'if-emblem-falling-coins',
  tags: ['scene', 'if'],
  blurb: "Lesson 13: coins dropping from a leafy bough. A tree that pays you for owning it.",
  rows: [
    'mNNnmNNNnn',
    '.nn.nnn.n.',
    '..yG...yG.',
    '..Gg...Gg.',
    '.....yG...',
    '.....Gg...',
    '.yG.......',
    '.Gg.......',
  ],
};

export const if13Finish: SceneArt = ifKeepsake(
  'if13-finish',
  'A golden acorn hanging from an oak twig, with gold coins dropping from a leafy bough in its purple window and small sparkles around it.',
  emblemFallingCoins,
);

export const art: LessonArtSet = { opener: if13Opener, backdrop: ifBackdrop, finish: if13Finish };
