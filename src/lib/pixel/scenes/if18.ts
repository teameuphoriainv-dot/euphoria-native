/**
 * Investing Fundamentals lesson 18, Tax-Efficient Investing: let a loss pay part of the tax.
 *
 * Lesson 10 drew tax as a crow that flies off with a coin. Here the investor pulls the lesson's main
 * lever, tax-loss harvesting. One sapling withered and never grew a coin (a loser), and the investor
 * is cutting it down with an axe. The tax crow flies off across the moon with one of its dead grey
 * branches in its beak instead of a coin: the realized loss is set against the gains. Beside the
 * loser, a young coin tree of a different kind stands in a burlap root ball, bought to be planted in
 * its place (similar, not identical, so the wash sale rule is kept and the money stays invested), and
 * the grown money tree beyond keeps its coins. The axe swings and the crow flaps (frames), coins
 * glint, stars twinkle and fireflies drift up.
 *
 * The keepsake's emblem is the crow carrying the dead twig.
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
  ifStage,
  ifStar,
  ifStarBig,
} from './if-kit';
import { ifBackdrop } from './if-backdrop';
import { ifFruitTree } from './if-kit-a';
import type { LessonArtSet, SceneArt } from './types';

/* ── the loser and its replacement ─────────────────────────────────────────────────────────────── */

/**
 * The loser, 11x16: a sapling that withered and never grew a coin. Bare grey branches lit on their
 * left, with no leaf and no coin on them, and a notch low in the trunk where the axe bites.
 */
const withered: PixelSprite = {
  id: 'if18-withered',
  name: 'if18-withered',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [
    '....x......',
    '.x..xX..x..',
    '.xX.xX.xX..',
    '..xXxXxX...',
    'x..xXXX..x.',
    'xX..xX..xX.',
    '.xX.xX.xX..',
    '..xXxXxX...',
    '....xXX....',
    '....xX.....',
    '....hh.....',
    '....xX.....',
    '....xX.....',
    '....xX.....',
    '....xX.....',
    '...xXXD....',
  ],
};

/** Where the axe bites, in the withered sapling's own pixels. */
const NOTCH = { x: 4, y: 10 } as const;

/** A young tree's roots balled in burlap, 9x5, tied at the trunk: bought, waiting to go in the ground. */
const rootBall: PixelSprite = {
  id: 'if18-root-ball',
  name: 'if18-root-ball',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [
    '...aAa...',
    '.hhhAAAa.',
    'hhAhAAaAa',
    '.hAAaAaa.',
    '..aaaaa..',
  ],
};

/* ── moving parts ──────────────────────────────────────────────────────────────────────────────── */

const AXE_UP = [
  '.....wX..',
  '....wxXX.',
  '...hAxX..',
  '..hA.....',
  '.hA......',
  'hA.......',
  '.........',
  '.........',
  '.........',
  '.........',
  '.........',
];
const AXE_DOWN = [
  '.........',
  '.........',
  '.........',
  '.........',
  '.........',
  'hA.......',
  '.hA......',
  '..hA..wx.',
  '...hAwxX.',
  '....hAX.h',
  '......h..',
];

/**
 * The axe, 9x11, gripped at (0, 5) in the investor's fist: raised, then swung down into the notch, a
 * chip of pale wood flying off as it bites.
 */
const axe: PixelSprite = {
  id: 'if18-axe',
  name: 'if18-axe',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: AXE_UP,
  frames: [AXE_UP, AXE_UP, AXE_DOWN, AXE_DOWN],
  frameMs: 260,
};

const CROW_UP = [
  '.........XK...',
  '........XKK...',
  '.......XKKK...',
  '......XKKK....',
  '...XXXKKKK....',
  '..XwKKKKKKKXXX',
  'XDKKKKKKKKKK..',
  '.XD...........',
  'X..D..........',
];
const CROW_LEVEL = [
  '..............',
  '..............',
  '..............',
  '..............',
  '...XXXXXXXXXX.',
  '..XwKKKKKKKXXX',
  'XDKKKKKKKKKK..',
  '.XD...........',
  'X..D..........',
];
const CROW_DOWN = [
  '..............',
  '..............',
  '..............',
  '..............',
  '...XXXXX......',
  '..XwKKKKKKKXXX',
  'XDKKKKKKKKKK..',
  '.XD...KKKK....',
  'X..D...KKK....',
];

/**
 * The tax crow, 14x9, flying off to the left with a dead grey branch in its beak, wings beating:
 * black with a moonlit grey rim along its back, so it reads on the moon and off it.
 */
const crow: PixelSprite = {
  id: 'if18-crow',
  name: 'if18-crow',
  tags: ['scene', 'if'],
  rows: CROW_UP,
  frames: [CROW_UP, CROW_LEVEL, CROW_DOWN, CROW_LEVEL],
  frameMs: 170,
};

/* ── the opener ────────────────────────────────────────────────────────────────────────────────── */

const INVESTOR = { x: 10, y: 25 } as const;
/** The axe's grip, its (0, 5), in the fist (the hand is at the investor's (12, 11)). */
const AXE = { x: INVESTOR.x + IF_INVESTOR_HAND.x, y: INVESTOR.y + IF_INVESTOR_HAND.y - 5 } as const;
/** Where the swung axe's blade (its (7, 8)) lands in the notch. */
const WITHERED = { x: AXE.x + 7 - NOTCH.x, y: AXE.y + 8 - NOTCH.y } as const;
/** The replacement, a coin tree of another kind, its root ball under its trunk, beside the loser. */
const NEW_TREE = { x: WITHERED.x + 11, y: 26 } as const;
const TREE = { x: 55, y: 12 } as const;

const base = ifCompose('if18-opener-base', 80, 60, [
  { sprite: ifStage, x: 0, y: 0 },
  { sprite: ifMoneyTree, x: TREE.x, y: TREE.y },
  { sprite: ifFruitTree, x: NEW_TREE.x, y: NEW_TREE.y },
  { sprite: rootBall, x: NEW_TREE.x + 2, y: NEW_TREE.y + 15 },
  { sprite: withered, x: WITHERED.x, y: WITHERED.y },
  { sprite: ifInvestor, x: INVESTOR.x, y: INVESTOR.y },
]);

export const if18Opener: SceneArt = {
  id: 'if18-opener',
  label: 'At night an investor swings an axe at a withered sapling that never grew a coin, a crow flies off across the moon with one of its dead branches in its beak instead of a coin, a different kind of young tree waits in a burlap root ball to be planted in its place, and the money tree beyond keeps its gold coins.',
  width: 80,
  height: 60,
  base,
  layers: [
    // Across the moon's disc, so it reads black on the brightest thing in the sky.
    { sprite: crow, x: 8, y: 4, motion: { kind: 'drift', amp: 2, periodMs: 2600 } },
    { sprite: axe, x: AXE.x, y: AXE.y },
    { sprite: ifGlint, x: TREE.x + 14, y: TREE.y + 3 },
    { sprite: ifLater(ifGlint, 'if18-glint-low', 2, 290), x: TREE.x + 3, y: TREE.y + 16 },
    { sprite: ifLater(ifGlint, 'if18-glint-new', 4, 330), x: NEW_TREE.x + 3, y: NEW_TREE.y + 3 },
    { sprite: ifStarBig, x: 31, y: 6, motion: { kind: 'twinkle', periodMs: 2300, min: 0.3 } },
    { sprite: ifStar, x: 45, y: 3, motion: { kind: 'twinkle', periodMs: 1800, phase: 0.4, min: 0.2 } },
    { sprite: ifStar, x: 73, y: 6, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.7, min: 0.2 } },
    { sprite: ifFirefly, x: 7, y: 50, motion: { kind: 'rise', amp: 5, periodMs: 3500, phase: 0.2 } },
    { sprite: ifFirefly, x: 50, y: 47, motion: { kind: 'rise', amp: 6, periodMs: 4000, phase: 0.6 } },
    { sprite: ifFirefly, x: 73, y: 53, motion: { kind: 'rise', amp: 5, periodMs: 3700, phase: 0.85 } },
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────────── */

const emblemCrowTwig: PixelSprite = {
  id: 'if-emblem-crow-twig',
  name: 'if-emblem-crow-twig',
  tags: ['scene', 'if'],
  blurb: "Lesson 18: the tax crow carrying off a dead twig instead of a coin. A loss put to work against the tax.",
  rows: [
    '......KK..',
    '.....KKK..',
    '..KKKKKK..',
    '.KwKKKKKKK',
    'DDKKKKKK..',
    'xx........',
    '.xx.x.....',
    '..xxx.....',
  ],
};

export const if18Finish: SceneArt = ifKeepsake(
  'if18-finish',
  'A golden acorn hanging from an oak twig, with a black crow carrying a dead twig in its beak in its purple window and small sparkles around it.',
  emblemCrowTwig,
);

export const art: LessonArtSet = { opener: if18Opener, backdrop: ifBackdrop, finish: if18Finish };
