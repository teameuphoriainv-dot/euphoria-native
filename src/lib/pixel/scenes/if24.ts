/**
 * Investing Fundamentals lesson 24, Paper Trading: Build Your Portfolio: plant it on paper first.
 *
 * One of the pathway's three 50-XP lessons, so it is a harvest: the grown orchard at sunset, a row
 * of trees on every far hill and a heavy money tree close by. The investor is not picking anything
 * yet. They sit on a stool at an easel and draw the orchard they mean to plant: three trees, one each
 * of gold coins, plums and apples (a three-fund portfolio), and under them a tally of the days they
 * have tracked it. Practice with nothing real at stake, before the real thing. The pencil writes (bob),
 * the sun's rays shine, the page's corner lifts in the breeze (frames), coins glint, gold dust rises
 * and the first stars come out.
 *
 * The keepsake is the premium acorn (halo and a ring of lights); its emblem is the paper plan.
 */
import type { PixelSprite } from '../types';
import {
  IF_PALETTE,
  ifCompose,
  ifGlint,
  ifGoldMote,
  ifLater,
  ifMoneyTree,
  ifStage,
  ifStar,
} from './if-kit';
import { ifBackdrop } from './if-backdrop';
import { IF_A_PALETTE } from './if-kit-a';
import {
  IF_SEATED_HAND,
  IF_SEATED_SEAT,
  IF_SUNSET_RAYS_AT,
  ifInvestorSeated,
  ifOrchardRow,
  ifPremiumKeepsake,
  ifSunsetRays,
  ifSunsetSky,
} from './if-kit-b';
import type { LessonArtSet, SceneArt } from './types';

/* ── the easel ─────────────────────────────────────────────────────────────────────────────────── */

/**
 * A painter's easel, 22x26: the mast standing above the page, a ledge the page rests on, two front
 * legs splaying to the ground and a back leg behind. The page (paper, below) is laid over it.
 */
const easel: PixelSprite = {
  id: 'if24-easel',
  name: 'if24-easel',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [
    '..........hA..........',
    '..........hA..........',
    '..........hA..........',
    '.........aaaa.........',
    '..........hA..........',
    '..........hA..........',
    '..........hA..........',
    '..........hA..........',
    '..........hA..........',
    '..........hA..........',
    '..........hA..........',
    '..........hA..........',
    '..........hA..........',
    '..........hA..........',
    '..........hA..........',
    '..........hA..........',
    '..........hA..........',
    '..........hA..........',
    '..........hA..........',
    '.hhhhhhhhhhhhhhhhhhhA.',
    '.aaaaaaaaaaaaaaaaaaaa.',
    '...hA.....a......hA...',
    '..hA......a.......hA..',
    '..hA......a.......hA..',
    '.hA.......a........hA.',
    'aa........a.........aa',
  ],
};

/** Where the page sits on the easel: under the clip, on the ledge. */
const PAGE_AT = { x: 2, y: 4 } as const;

/**
 * The page, 18x15: three trees drawn in a row, gold coins, plums and apples, on a pencilled ground
 * line, and under them a tally of days in pencil.
 */
const page: PixelSprite = {
  id: 'if24-page',
  name: 'if24-page',
  tags: ['scene', 'if'],
  palette: IF_A_PALETTE,
  rows: [
    'wwwwwwwwwwwwwwwwwx',
    'wwNNwwwwNNwwwwNNwx',
    'wNGNnwwNuNnwwNRNnx',
    'wnNnnwwnNnnwwnNnnx',
    'wwwAwwwwwAwwwwwAwx',
    'wXXXXXXXXXXXXXXXwx',
    'wwwwwwwwwwwwwwwwwx',
    'wwwwwwwwwwwwwwwwwx',
    'wXwXwXwXwwXwXwXwwx',
    'wXwXwXwXwwXwXwXwwx',
    'wXwXwXwXwwXwXwXwwx',
    'wwwwwwwwwwwwwwwwwx',
    'wwwwwwwwwwwwwwwwwx',
    'wwwwwwwwwwwwwwwwwx',
    'xxxxxxxxxxxxxxxxxx',
  ],
};

/** A three-legged stool, 7x4, its seat under the sitter's thighs. */
const stool: PixelSprite = {
  id: 'if24-stool',
  name: 'if24-stool',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [
    'hhhhhhA',
    '.h...A.',
    '.h...a.',
    'h.....a',
  ],
};

/* ── moving parts ──────────────────────────────────────────────────────────────────────────────── */

/** The pencil, 6x1, its tip on the page: pink eraser, brass band, yellow body, dark point. */
const pencil: PixelSprite = {
  id: 'if24-pencil',
  name: 'if24-pencil',
  tags: ['scene', 'if'],
  rows: [
    'FxGGyK',
  ],
};

const CORNER_FLAT = [
  '...',
  '...',
  '...',
];
const CORNER_LIFT = [
  '..x',
  '.xx',
  '...',
];
const CORNER_UP = [
  '.xx',
  'xxD',
  '...',
];

/** The page's top right corner lifting in the breeze and settling. */
const corner: PixelSprite = {
  id: 'if24-corner',
  name: 'if24-corner',
  tags: ['scene', 'if'],
  rows: CORNER_FLAT,
  frames: [CORNER_FLAT, CORNER_FLAT, CORNER_LIFT, CORNER_UP, CORNER_LIFT, CORNER_FLAT],
  frameMs: 260,
};

/* ── the opener ────────────────────────────────────────────────────────────────────────────────── */

/** Clear of the sun's glow on the left, so the hat reads against the sky. */
const INVESTOR = { x: 21, y: 25 } as const;
const STOOL = { x: INVESTOR.x + IF_SEATED_SEAT.x, y: INVESTOR.y + IF_SEATED_SEAT.y + 1 } as const;
const EASEL = { x: 37, y: 22 } as const;
const PAGE = { x: EASEL.x + PAGE_AT.x, y: EASEL.y + PAGE_AT.y } as const;
const TREE = { x: 59, y: 11 } as const;

const base = ifCompose('if24-opener-base', 80, 60, [
  { sprite: ifStage, x: 0, y: 0 },
  { sprite: ifSunsetSky, x: 0, y: 0 },
  { sprite: ifOrchardRow, x: 0, y: 25 },
  { sprite: ifMoneyTree, x: TREE.x, y: TREE.y },
  { sprite: easel, x: EASEL.x, y: EASEL.y },
  { sprite: page, x: PAGE.x, y: PAGE.y },
  { sprite: stool, x: STOOL.x, y: STOOL.y },
  { sprite: ifInvestorSeated, x: INVESTOR.x, y: INVESTOR.y },
]);

export const if24Opener: SceneArt = {
  id: 'if24-opener',
  label: 'At sunset in the grown orchard, an investor sits on a stool at an easel and draws three trees, one of gold coins, one of plums and one of apples, with a tally of days beneath them.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: ifSunsetRays, x: IF_SUNSET_RAYS_AT.x, y: IF_SUNSET_RAYS_AT.y, motion: { kind: 'twinkle', periodMs: 2600, min: 0.35 } },
    { sprite: pencil, x: INVESTOR.x + IF_SEATED_HAND.x + 2, y: INVESTOR.y + IF_SEATED_HAND.y, motion: { kind: 'bob', amp: 1, periodMs: 600 } },
    { sprite: corner, x: PAGE.x + 15, y: PAGE.y },
    { sprite: ifGlint, x: TREE.x + 14, y: TREE.y + 3 },
    { sprite: ifLater(ifGlint, 'if24-glint-low', 2, 300), x: TREE.x + 9, y: TREE.y + 13 },
    { sprite: ifGoldMote, x: 30, y: 50, motion: { kind: 'rise', amp: 6, periodMs: 3400, phase: 0.1 } },
    { sprite: ifGoldMote, x: 9, y: 46, motion: { kind: 'rise', amp: 5, periodMs: 3900, phase: 0.5 } },
    { sprite: ifGoldMote, x: 55, y: 52, motion: { kind: 'rise', amp: 5, periodMs: 3600, phase: 0.8 } },
    { sprite: ifStar, x: 37, y: 1, motion: { kind: 'twinkle', periodMs: 2600, min: 0.2 } },
    { sprite: ifStar, x: 52, y: 3, motion: { kind: 'twinkle', periodMs: 3000, phase: 0.5, min: 0.2 } },
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────────── */

const emblemPaperPlan: PixelSprite = {
  id: 'if-emblem-paper-plan',
  name: 'if-emblem-paper-plan',
  tags: ['scene', 'if'],
  blurb: "Lesson 24: a page with three trees drawn on it and a tally of days. A portfolio planted on paper first.",
  palette: IF_A_PALETTE,
  rows: [
    'wwwwwwwwwx',
    'wNNwNNwNNx',
    'wGnwunwRnx',
    'whwwhwwhwx',
    'wwwwwwwwwx',
    'wXwXwXwwwx',
    'wXwXwXwwwx',
    'xxxxxxxxxx',
  ],
};

export const if24Finish: SceneArt = ifPremiumKeepsake(
  'if24-finish',
  'A golden acorn inside a ring of gold light, hanging from an oak twig, with a page of three drawn trees and a tally of days in its purple window and sparkles all around it.',
  emblemPaperPlan,
);

export const art: LessonArtSet = { opener: if24Opener, backdrop: ifBackdrop, finish: if24Finish };
