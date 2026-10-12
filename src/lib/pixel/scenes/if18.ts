/**
 * Investing Fundamentals lesson 18, Tax-Efficient Investing: keeping more of what the orchard grows.
 *
 * Lesson 10 drew tax as a crow that flies off with a coin from every tree out in the open. Here the
 * investor has learned to keep the crows off: a scarecrow in a patched plaid shirt stands guard in
 * front of the grown money tree, every coin still on it, and two crows give up and fly off past the
 * moon with empty beaks. The investor carries the harvest home in a full basket: tax-efficient
 * investing is keeping more of what grew, not growing less. The crows flap (frames), coins glint,
 * stars twinkle and fireflies drift up.
 *
 * The keepsake's emblem is the scarecrow.
 */
import type { PixelSprite } from '../types';
import {
  IF_INVESTOR_HAND,
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
import { IF_A_PALETTE } from './if-kit-a';
import { IF_COIN_BASKET_GRIP, ifCoinBasket } from './if-kit-b';
import type { LessonArtSet, SceneArt } from './types';

/* ── the scarecrow ─────────────────────────────────────────────────────────────────────────────── */

/**
 * The scarecrow, 17x25: a straw hat, a burlap head with button eyes, a red plaid shirt with a blue
 * patch hung on a crossbar, straw bristling out of the cuffs and the hem, and the post it stands on.
 */
const scarecrow: PixelSprite = {
  id: 'if18-scarecrow',
  name: 'if18-scarecrow',
  tags: ['scene', 'if'],
  palette: IF_A_PALETTE,
  rows: [
    '.......ooo.......',
    '......oooooz.....',
    '......zzzzzz.....',
    '..ooooooooooooz..',
    '.....hhhhhhA.....',
    '.....hKhhhKA.....',
    '.....hhhhhhA.....',
    '.....hhaaahA.....',
    '......hhhhA......',
    '.oyRRrRRrRRrRRyo.',
    'oo.rrrrrrrrrrr.oo',
    '.....rRRrRRr.....',
    '.....rRRrBBr.....',
    '.....rrrrBbr.....',
    '.....hhhhhhA.....',
    '....orRRrRRro....',
    '.....o.oyo.o.....',
    '.......hA........',
    '.......hA........',
    '.......hA........',
    '.......hA........',
    '.......hA........',
    '.......hA........',
    '.......hA........',
    '......ahAa.......',
  ],
};

/* ── the crows ─────────────────────────────────────────────────────────────────────────────────── */

const CROW_UP = [
  '.....D....',
  '....DK....',
  '...DKK....',
  '.KKKKKKKKK',
  'XKKKKKK...',
  '..........',
];
const CROW_LEVEL = [
  '..........',
  '..........',
  '....DDDD..',
  '.KKKKKKKKK',
  'XKKKKKK...',
  '..........',
];
const CROW_DOWN = [
  '..........',
  '..........',
  '..........',
  '.KKKKKKKKK',
  'XKKKKKK...',
  '....KKD...',
];

/** A crow flying off to the left with nothing in its beak, wings beating: black, so it reads on the moon. */
const crow: PixelSprite = {
  id: 'if18-crow',
  name: 'if18-crow',
  tags: ['scene', 'if'],
  rows: CROW_LEVEL,
  frames: [CROW_UP, CROW_LEVEL, CROW_DOWN, CROW_LEVEL],
  frameMs: 160,
};

/* ── the opener ────────────────────────────────────────────────────────────────────────────────── */

const INVESTOR = { x: 6, y: 25 } as const;
const BASKET = {
  x: INVESTOR.x + IF_INVESTOR_HAND.x - IF_COIN_BASKET_GRIP.x,
  y: INVESTOR.y + IF_INVESTOR_HAND.y - IF_COIN_BASKET_GRIP.y,
} as const;
const SCARECROW = { x: 33, y: 21 } as const;
const TREE = { x: 55, y: 12 } as const;

const base = ifCompose('if18-opener-base', 80, 60, [
  { sprite: ifStage, x: 0, y: 0 },
  { sprite: ifMoneyTree, x: TREE.x, y: TREE.y },
  { sprite: scarecrow, x: SCARECROW.x, y: SCARECROW.y },
  // The basket before the investor, so the hand closes over its rim.
  { sprite: ifCoinBasket, x: BASKET.x, y: BASKET.y },
  { sprite: ifInvestor, x: INVESTOR.x, y: INVESTOR.y },
]);

export const if18Opener: SceneArt = {
  id: 'if18-opener',
  label: 'At night in the orchard, a scarecrow in a patched plaid shirt guards a money tree full of gold coins, two crows fly off past the moon with empty beaks, and an investor carries home a full basket of coins.',
  width: 80,
  height: 60,
  base,
  layers: [
    // One across the moon's disc and one across the orchid band, so both read black on light.
    { sprite: crow, x: 5, y: 6, motion: { kind: 'drift', amp: 2, periodMs: 2600 } },
    { sprite: ifLater(crow, 'if18-crow-later', 2, 180), x: 22, y: 17, motion: { kind: 'drift', amp: 2, periodMs: 3100, phase: 0.5 } },
    { sprite: ifGlint, x: TREE.x + 14, y: TREE.y + 3 },
    { sprite: ifLater(ifGlint, 'if18-glint-low', 2, 290), x: TREE.x + 3, y: TREE.y + 16 },
    { sprite: ifLater(ifGlint, 'if18-glint-basket', 4, 330), x: BASKET.x + 1, y: BASKET.y - 1 },
    { sprite: ifStarBig, x: 27, y: 7, motion: { kind: 'twinkle', periodMs: 2300, min: 0.3 } },
    { sprite: ifStar, x: 43, y: 3, motion: { kind: 'twinkle', periodMs: 1800, phase: 0.4, min: 0.2 } },
    { sprite: ifStar, x: 66, y: 6, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.7, min: 0.2 } },
    { sprite: ifFirefly, x: 29, y: 49, motion: { kind: 'rise', amp: 5, periodMs: 3500, phase: 0.2 } },
    { sprite: ifFirefly, x: 49, y: 44, motion: { kind: 'rise', amp: 6, periodMs: 4000, phase: 0.6 } },
    { sprite: ifFirefly, x: 73, y: 52, motion: { kind: 'rise', amp: 5, periodMs: 3700, phase: 0.85 } },
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────────── */

const emblemScarecrow: PixelSprite = {
  id: 'if-emblem-scarecrow',
  name: 'if-emblem-scarecrow',
  tags: ['scene', 'if'],
  blurb: "Lesson 18: a scarecrow in a straw hat. What keeps the tax crows off the harvest.",
  palette: IF_A_PALETTE,
  rows: [
    '...oooo...',
    '.oooooooz.',
    '..hKhhKA..',
    '..hhaahA..',
    'oyRRRRRRyo',
    '...RRrr...',
    '...ohAo...',
    '....hA....',
  ],
};

export const if18Finish: SceneArt = ifKeepsake(
  'if18-finish',
  'A golden acorn hanging from an oak twig, with a scarecrow in a straw hat in its purple window and small sparkles around it.',
  emblemScarecrow,
);

export const art: LessonArtSet = { opener: if18Opener, backdrop: ifBackdrop, finish: if18Finish };
