/**
 * Investing Fundamentals lesson 22, Investment Research & Due Diligence: look under the leaves before
 * you buy.
 *
 * A night tree nursery: three young money trees for sale stand on a plank stand, their roots balled in
 * burlap, each with a white price tag. Before buying the nearest one, the shiniest, the investor holds
 * a big magnifying glass over its root ball, and through the glass a white grub is chewing at a root
 * that has rotted black: a problem nobody sees from the leaves, the way a company can look great on
 * top and be rotten underneath. The grub squirms (bob), the lens catches the light, coins glint, stars
 * twinkle and fireflies drift up.
 *
 * The keepsake's emblem is the magnifying glass, with the grub and the rotten root in its lens.
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
  ifSapling,
  ifStage,
  ifStar,
  ifStarBig,
  ifYoungTree,
} from './if-kit';
import { ifBackdrop } from './if-backdrop';
import type { LessonArtSet, SceneArt } from './types';

/* ── the nursery ───────────────────────────────────────────────────────────────────────────────── */

/** A tree's roots balled in burlap, 9x6, tied at the trunk: lay it over the foot of the trunk. */
const rootBall: PixelSprite = {
  id: 'if22-root-ball',
  name: 'if22-root-ball',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [
    '...aAa...',
    '.hhhAAAa.',
    'hhAhAAaAa',
    'hAhAAaAaa',
    '.hAAaAaa.',
    '..aaaaa..',
  ],
};

/** The plank stand the trees are sold from, 58x3. */
const stand: PixelSprite = {
  id: 'if22-stand',
  name: 'if22-stand',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [
    'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhA',
    'AAAAAAAAAaAAAAAAAAAAAAAAAaAAAAAAAAAAAAAAAAaAAAAAAAAAAAAAAa',
    'aa.....................aa......................aa.......aa',
  ],
};

/** A price tag on its string, 3x4. */
const priceTag: PixelSprite = {
  id: 'if22-price-tag',
  name: 'if22-price-tag',
  tags: ['scene', 'if'],
  rows: [
    '.x.',
    'www',
    'wKx',
    'wwx',
  ],
};

/* ── the magnifying glass ──────────────────────────────────────────────────────────────────────── */

/**
 * The lens, 9x9: a steel rim lit on its upper left, and inside it the root ball seen up close, the
 * soil lit by the glass: a pale root that turns black and rotten partway along, and the grub (a
 * layer) chewing at the rot.
 */
const lens: PixelSprite = {
  id: 'if22-lens',
  name: 'if22-lens',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [
    '..wwxxx..',
    '.wcccccX.',
    'whhcccccX',
    'wcchhcccX',
    'xccccKKcX',
    'xcccccKKX',
    'XcccccKKD',
    '.XccccKD.',
    '..XXDDD..',
  ],
};

/** The handle, 4x3, from the investor's fist down to the rim's upper left. */
const handle: PixelSprite = {
  id: 'if22-handle',
  name: 'if22-handle',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [
    'aA..',
    '.aA.',
    '..aA',
  ],
};

/** The grub in the glass, 5x3: a fat white C, its brown head and black jaws at the rotten root. */
const grub: PixelSprite = {
  id: 'if22-grub',
  name: 'if22-grub',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [
    '.www.',
    'ww.hK',
    '.www.',
  ],
};

/** A glare on the glass, twinkled. */
const glare: PixelSprite = {
  id: 'if22-glare',
  name: 'if22-glare',
  tags: ['scene', 'if'],
  rows: [
    'W.',
    '.w',
  ],
};

/* ── the opener ────────────────────────────────────────────────────────────────────────────────── */

const INVESTOR = { x: 2, y: 25 } as const;
/** The three trees for sale, each with its root ball under the trunk and a tag on a right branch. */
const TREES = [
  { sprite: ifYoungTree, x: 17, y: 20, ball: { x: 19, y: 40 }, tag: { x: 30, y: 29 } },
  { sprite: ifYoungTree, x: 38, y: 20, ball: { x: 40, y: 40 }, tag: { x: 51, y: 29 } },
  { sprite: ifSapling, x: 60, y: 28, ball: { x: 60, y: 40 }, tag: { x: 69, y: 34 } },
] as const;
/** The glass over the first tree's root ball; the handle runs up to the hand at the investor's (12, 11). */
const LENS = { x: 19, y: 38 } as const;
const HANDLE = { x: INVESTOR.x + 14, y: INVESTOR.y + 12 } as const;

const base = ifCompose('if22-opener-base', 80, 60, [
  { sprite: ifStage, x: 0, y: 0 },
  { sprite: stand, x: 16, y: 46 },
  ...TREES.flatMap(({ sprite, x, y, ball, tag }) => [
    { sprite, x, y },
    { sprite: rootBall, x: ball.x, y: ball.y },
    { sprite: priceTag, x: tag.x, y: tag.y },
  ]),
  { sprite: ifInvestor, x: INVESTOR.x, y: INVESTOR.y },
  { sprite: handle, x: HANDLE.x, y: HANDLE.y },
  { sprite: lens, x: LENS.x, y: LENS.y },
]);

export const if22Opener: SceneArt = {
  id: 'if22-opener',
  label: 'At a night tree nursery, an investor holds a big magnifying glass over the burlap root ball of a young money tree for sale and finds a white grub chewing a root that has rotted black.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: grub, x: LENS.x + 1, y: LENS.y + 4, motion: { kind: 'bob', amp: 1, periodMs: 800 } },
    { sprite: glare, x: LENS.x + 2, y: LENS.y + 1, motion: { kind: 'twinkle', periodMs: 1900, min: 0.2 } },
    { sprite: ifGlint, x: TREES[0].x + 8, y: TREES[0].y + 3 },
    { sprite: ifLater(ifGlint, 'if22-glint-mid', 2, 300), x: TREES[1].x + 2, y: TREES[1].y + 6 },
    { sprite: ifStarBig, x: 30, y: 7, motion: { kind: 'twinkle', periodMs: 2300, min: 0.3 } },
    { sprite: ifStar, x: 47, y: 3, motion: { kind: 'twinkle', periodMs: 1800, phase: 0.4, min: 0.2 } },
    { sprite: ifStar, x: 64, y: 11, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.7, min: 0.2 } },
    { sprite: ifStar, x: 75, y: 4, motion: { kind: 'twinkle', periodMs: 2900, phase: 0.2, min: 0.2 } },
    { sprite: ifFirefly, x: 12, y: 50, motion: { kind: 'rise', amp: 5, periodMs: 3500, phase: 0.1 } },
    { sprite: ifFirefly, x: 54, y: 53, motion: { kind: 'rise', amp: 6, periodMs: 4100, phase: 0.55 } },
    { sprite: ifFirefly, x: 75, y: 45, motion: { kind: 'rise', amp: 5, periodMs: 3800, phase: 0.8 } },
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────────── */

const emblemMagnifier: PixelSprite = {
  id: 'if-emblem-magnifier-grub',
  name: 'if-emblem-magnifier-grub',
  tags: ['scene', 'if'],
  blurb: "Lesson 22: a magnifying glass over a grub chewing a rotten root. The flaw you only find by looking under the leaves.",
  palette: IF_PALETTE,
  rows: [
    '..wwxx....',
    '.wchhcx...',
    'wcccKhcx..',
    'wwwhKKcX..',
    'xw.cKKcX..',
    '.xwwccX...',
    '..XXXXhA..',
    '......ahAa',
  ],
};

export const if22Finish: SceneArt = ifKeepsake(
  'if22-finish',
  'A golden acorn hanging from an oak twig, with a magnifying glass showing a white grub chewing a black rotten root in its purple window and small sparkles around it.',
  emblemMagnifier,
);

export const art: LessonArtSet = { opener: if22Opener, backdrop: ifBackdrop, finish: if22Finish };
