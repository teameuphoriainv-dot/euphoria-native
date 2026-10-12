/**
 * Investing Fundamentals lesson 25, Paper Trading: Evaluate & Graduate: from student to investor.
 *
 * The pathway's last lesson and one of its three 50-XP lessons, so it is a harvest: the grown orchard
 * at sunset, every far hill lined with trees, and close by the orchard this course planted, a heavy
 * money tree with an apple tree and a plum tree beside it (one portfolio, more than one kind of fruit).
 * The investor stands on an upturned harvest crate in a mortarboard, holding out a diploma tied with a
 * red ribbon: the plan they wrote, their Investment Policy Statement. At their feet the first real coin
 * is already planted and sprouting. The tassel swings and confetti falls (frames), the sun's rays shine,
 * coins glint, gold dust rises and the first stars come out.
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
import { IF_APPLE, IF_PLUM, ifBedOf, ifCoinSprout, ifFruitTree, ifRecolour } from './if-kit-a';
import { IF_SUNSET_RAYS_AT, ifOrchardRow, ifPremiumKeepsake, ifSunsetRays, ifSunsetSky } from './if-kit-b';
import { ifFall } from './if-kit-c';
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
  'P..',
  'P..',
  'P..',
  'qP.',
  'Pp.',
];
const TASSEL_SWUNG = [
  'P..',
  '.P.',
  '.P.',
  '.qP',
  '.Pp',
];

/** The tassel, 3x5, purple so it reads on the amber sky, swinging. */
const tassel: PixelSprite = {
  id: 'if25-tassel',
  name: 'if25-tassel',
  tags: ['scene', 'if'],
  rows: TASSEL_STILL,
  frames: [TASSEL_STILL, TASSEL_STILL, TASSEL_SWUNG, TASSEL_SWUNG],
  frameMs: 320,
};

/** The diploma, 8x3: a white roll tied with a red ribbon, held by its left end. */
const diploma: PixelSprite = {
  id: 'if25-diploma',
  name: 'if25-diploma',
  tags: ['scene', 'if'],
  rows: [
    'wwwwRwwx',
    'xxxxRxxX',
    '....rr..',
  ],
};

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

/** High enough on the crate that the mortarboard stands against the amber sky, not the far trees. */
const INVESTOR = { x: 19, y: 20 } as const;
const CRATE = { x: INVESTOR.x, y: INVESTOR.y + 21 } as const;
/** Held by its left end, which the hand closes over. */
const DIPLOMA = { x: INVESTOR.x + IF_INVESTOR_HAND.x, y: INVESTOR.y + IF_INVESTOR_HAND.y - 1 } as const;
const BED = { x: 35, y: 46 } as const;
const SPROUT = { x: BED.x + 2, y: BED.y - 6 } as const;
const TREE = { x: 55, y: 9 } as const;

const base = ifCompose('if25-opener-base', 80, 60, [
  { sprite: ifStage, x: 0, y: 0 },
  { sprite: ifSunsetSky, x: 0, y: 0 },
  { sprite: ifOrchardRow, x: 0, y: 25 },
  { sprite: ifMoneyTree, x: TREE.x, y: TREE.y },
  { sprite: ifRecolour(ifFruitTree, 'if25-apple-tree', IF_APPLE), x: 44, y: 26 },
  { sprite: ifRecolour(ifFruitTree, 'if25-plum-tree', IF_PLUM), x: 70, y: 27 },
  { sprite: ifBedOf('if25-bed', 12), x: BED.x, y: BED.y },
  { sprite: ifCoinSprout, x: SPROUT.x, y: SPROUT.y },
  { sprite: crate, x: CRATE.x, y: CRATE.y },
  // The diploma before the graduate, so the hand closes over its end.
  { sprite: diploma, x: DIPLOMA.x, y: DIPLOMA.y },
  { sprite: graduate, x: INVESTOR.x, y: INVESTOR.y },
]);

export const if25Opener: SceneArt = {
  id: 'if25-opener',
  label: 'At sunset in the grown orchard, an investor in a graduation cap stands on a harvest crate holding out a diploma tied with a red ribbon, a first real coin sprouting at their feet and confetti falling.',
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
