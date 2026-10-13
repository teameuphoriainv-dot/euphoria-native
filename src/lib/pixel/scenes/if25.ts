/**
 * Investing Fundamentals lesson 25, Paper Trading: Evaluate & Graduate: from student to investor.
 *
 * The pathway's last lesson and one of its three 50-XP lessons, so it is a harvest: the grown orchard
 * at sunset, every far hill lined with trees, and close by the portfolio this course planted, grown
 * up: lesson 9's three funds as a fig tree (the rest of the world), the heavy money tree (home stocks)
 * and a teal bush (bonds). In the middle the investor stands on an upturned harvest crate in a
 * mortarboard and holds up the plan they wrote after evaluating their paper trading, their Investment
 * Policy Statement: a page unrolled from a scroll, a heading and lines of writing, and a green check
 * mark. At the crate's foot the first real coin is already planted and sprouting. The gold tassel
 * swings and confetti falls (frames), the sun's rays shine, coins glint, gold dust rises and the first
 * stars come out.
 *
 * The keepsake is the premium acorn (halo and a ring of lights); its emblem is the mortarboard.
 */
import type { PixelSprite } from '../types';
import {
  IF_INVESTOR_HAND,
  IF_PALETTE,
  ifCompose,
  ifGlint,
  ifGoldMote,
  ifInvestor,
  ifLater,
  ifMoneyTree,
  ifStage,
  ifStar,
} from './if-kit';
import { ifBackdrop } from './if-backdrop';
import { IF_FIG, ifBedOf, ifCoinSprout, ifFruitTree, ifRecolour } from './if-kit-a';
import { IF_SUNSET_RAYS_AT, ifOrchardRow, ifPremiumKeepsake, ifSunsetRays, ifSunsetSky } from './if-kit-b';
import { ifFall } from './if-kit-c';
import { ifBondBush } from './if-kit-r';
import type { LessonArtSet, SceneArt } from './types';

/* ── the graduate ──────────────────────────────────────────────────────────────────────────────── */

/**
 * The kit's investor with the orange hat swapped for a mortarboard: a flat board lit on its far edge,
 * its near edge dark, over a black skull cap. The tassel is a layer (it swings), hung at TASSEL_AT.
 */
const graduate: PixelSprite = {
  ...ifInvestor,
  id: 'if25-graduate',
  name: 'if25-graduate',
  rows: [
    '..............',
    '..XDDDDDDD....',
    'KKKKKKKKKKKKK.',
    '...KkkkkkK....',
    '..KkkkkkkkK...',
    ...ifInvestor.rows.slice(5),
  ],
};

/** Where the tassel hangs from, in the graduate's pixels: the board's right end. */
const TASSEL_AT = { x: 12, y: 3 } as const;

const TASSEL_STILL = [
  'O..',
  'O..',
  'O..',
  'gO.',
  'Og.',
];
const TASSEL_SWUNG = [
  'O..',
  '.O.',
  '.O.',
  '.gO',
  '.Og',
];

/**
 * The tassel, 3x5, swinging: gold like the emblem's, in the deep steps of gold (O g) so it still reads
 * against the amber sky.
 */
const tassel: PixelSprite = {
  id: 'if25-tassel',
  name: 'if25-tassel',
  tags: ['scene', 'if'],
  rows: TASSEL_STILL,
  frames: [TASSEL_STILL, TASSEL_STILL, TASSEL_SWUNG, TASSEL_SWUNG],
  frameMs: 320,
};

/**
 * The investor's own Investment Policy Statement, 8x10, held up by its lower left: a page unrolled
 * from a scroll tied with a red ribbon, a heading, lines of writing, and a green check mark where the
 * plan was reviewed and signed off.
 */
const policy: PixelSprite = {
  id: 'if25-policy',
  name: 'if25-policy',
  tags: ['scene', 'if'],
  rows: [
    'xwwwwwwx',
    'wKKKKKwx',
    'wwwwwwwx',
    'wXXXXXwx',
    'wXXXXwwx',
    'wXXXwwnx',
    'wwwwwnwx',
    'wnwwnwwx',
    'wwnnwwwx',
    'xxxRxxxX',
  ],
};
/** Where the hand holds the page, in its pixels: the lower left corner. */
const POLICY_GRIP = { x: 0, y: 9 } as const;

/** An upturned harvest crate to stand on, 14x5. */
const crate: PixelSprite = {
  id: 'if25-crate',
  name: 'if25-crate',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [
    'hhhhhhhhhhhhhA',
    'hAAAAAAAAAAAAa',
    'haaaaaaaaaaaaa',
    'hAAAAAAAAAAAAa',
    'aaaaaaaaaaaaaa',
  ],
};

/* ── confetti ──────────────────────────────────────────────────────────────────────────────────── */

/** A clump of confetti, 5x4, in the brand's colours and gold, falling with a little sway. */
const confetti = ifFall(
  'if25-confetti',
  6,
  25,
  ['F...y', '..B..', 'y..m.', '.w..F'],
  [[0, 0], [1, 3], [0, 6], [1, 9], [0, 12], [1, 15], [0, 18], [1, 21], [-9, -9]],
  230,
  3,
);

/* ── the opener ────────────────────────────────────────────────────────────────────────────────── */

/** In the middle, high enough on the crate that the mortarboard stands against the amber sky. */
const INVESTOR = { x: 31, y: 20 } as const;
const CRATE = { x: INVESTOR.x, y: INVESTOR.y + 21 } as const;
/** Held up by its lower left corner, which the hand closes over. */
const POLICY = {
  x: INVESTOR.x + IF_INVESTOR_HAND.x - POLICY_GRIP.x,
  y: INVESTOR.y + IF_INVESTOR_HAND.y + 1 - POLICY_GRIP.y,
} as const;
/** The portfolio lesson 9 planted, grown: a fig tree, the money tree and a teal bush for bonds. */
const FIG = { x: 5, y: 26 } as const;
const TREE = { x: 56, y: 9 } as const;
const BUSH = { x: 51, y: 32 } as const;
/** At the crate's foot, the first real coin, planted. */
const BED = { x: 18, y: 46 } as const;
const SPROUT = { x: BED.x + 2, y: BED.y - 6 } as const;

const base = ifCompose('if25-opener-base', 80, 60, [
  { sprite: ifStage, x: 0, y: 0 },
  { sprite: ifSunsetSky, x: 0, y: 0 },
  { sprite: ifOrchardRow, x: 0, y: 25 },
  { sprite: ifMoneyTree, x: TREE.x, y: TREE.y },
  { sprite: ifRecolour(ifFruitTree, 'if25-fig-tree', IF_FIG), x: FIG.x, y: FIG.y },
  { sprite: ifBondBush, x: BUSH.x, y: BUSH.y },
  { sprite: ifBedOf('if25-bed', 12), x: BED.x, y: BED.y },
  { sprite: ifCoinSprout, x: SPROUT.x, y: SPROUT.y },
  { sprite: crate, x: CRATE.x, y: CRATE.y },
  // The page before the graduate, so the hand closes over its corner.
  { sprite: policy, x: POLICY.x, y: POLICY.y },
  { sprite: graduate, x: INVESTOR.x, y: INVESTOR.y },
]);

export const if25Opener: SceneArt = {
  id: 'if25-opener',
  label: 'At sunset in the grown orchard, between a fig tree and the money tree with a teal bush, an investor in a graduation cap stands on a harvest crate holding up the plan they wrote, lines of writing with a green check mark, while a first real coin sprouts nearby and confetti falls.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: ifSunsetRays, x: IF_SUNSET_RAYS_AT.x, y: IF_SUNSET_RAYS_AT.y, motion: { kind: 'twinkle', periodMs: 2600, min: 0.35 } },
    { sprite: tassel, x: INVESTOR.x + TASSEL_AT.x, y: INVESTOR.y + TASSEL_AT.y },
    { sprite: confetti, x: 10, y: 0 },
    { sprite: ifLater(confetti, 'if25-confetti-mid', 3, 250), x: 37, y: 1 },
    { sprite: ifLater(confetti, 'if25-confetti-right', 6, 210), x: 62, y: 0 },
    { sprite: ifGlint, x: TREE.x + 14, y: TREE.y + 3 },
    { sprite: ifLater(ifGlint, 'if25-glint-low', 2, 300), x: TREE.x + 9, y: TREE.y + 13 },
    { sprite: ifLater(ifGlint, 'if25-glint-sprout', 4, 340), x: SPROUT.x + 1, y: SPROUT.y + 4 },
    { sprite: ifGoldMote, x: 12, y: 50, motion: { kind: 'rise', amp: 6, periodMs: 3400, phase: 0.1 } },
    { sprite: ifGoldMote, x: 50, y: 53, motion: { kind: 'rise', amp: 5, periodMs: 3900, phase: 0.5 } },
    { sprite: ifGoldMote, x: 73, y: 48, motion: { kind: 'rise', amp: 5, periodMs: 3600, phase: 0.8 } },
    { sprite: ifStar, x: 33, y: 2, motion: { kind: 'twinkle', periodMs: 2600, min: 0.2 } },
    { sprite: ifStar, x: 50, y: 4, motion: { kind: 'twinkle', periodMs: 3000, phase: 0.5, min: 0.2 } },
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────────── */

const emblemMortarboard: PixelSprite = {
  id: 'if-emblem-mortarboard',
  name: 'if-emblem-mortarboard',
  tags: ['scene', 'if'],
  blurb: "Lesson 25: a graduation cap with a gold tassel. From student to investor.",
  rows: [
    '...wwxx...',
    '.wxxxxxxX.',
    'KKKKKKKKKK',
    '..DDDDDk.G',
    '..DDDDkk.G',
    '...Dkkk..G',
    '........yG',
    '........GO',
  ],
};

export const if25Finish: SceneArt = ifPremiumKeepsake(
  'if25-finish',
  'A golden acorn inside a ring of gold light, hanging from an oak twig, with a graduation cap and its gold tassel in its purple window and sparkles all around it.',
  emblemMortarboard,
);

export const art: LessonArtSet = { opener: if25Opener, backdrop: ifBackdrop, finish: if25Finish };
