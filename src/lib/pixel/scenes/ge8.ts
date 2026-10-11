/**
 * Global Economics lesson 8: currency markets and exchange rates, in the study at dusk.
 *
 * The desk globe turns between two little flags, one country's and another's. On the wall a rate
 * board trades a gold coin for a silver one: the arrows between them light one way and then the
 * other, the two coins rise and fall against each other, and the last digit of the rate keeps
 * changing, because a floating exchange rate is never still. A travel case waits on the floor. Only
 * small layers move: the globe, the flags, the coins, the arrows, the digit and the stars.
 *
 * The keepsake's emblem is the exchange itself: two coins with arrows running each way between them.
 */
import type { PixelSprite } from '../types';
import { geBackdrop } from './ge-backdrop';
import {
  GE_GLOBE_SEAT,
  GE_PALETTE,
  geCoin,
  geCompose,
  geFlag,
  geGlobe,
  geGlobeStand,
  geLater,
  geStar,
  geStarBig,
  geTint,
} from './ge-kit';
import { geFlagRed, geGroundStudy } from './ge-kit-a';
import { geKeepsake } from './ge1-finish';
import type { LessonArtSet, SceneArt } from './types';

/* ── one-off props ──────────────────────────────────────────────────────────────────────────── */

/**
 * The rate board, 31x23: a framed dark board showing a rate of 1.0 and one more digit, which
 * changes as a layer at (19, 13). The two coins hang as layers at (5, 4) and (19, 4), the arrows
 * at (12, 4).
 */
const board: PixelSprite = {
  id: 'ge8-opener-board',
  name: 'rate board',
  tags: ['ge8', 'prop'],
  blurb: 'A framed dark board with an exchange rate in amber digits.',
  palette: GE_PALETTE,
  rows: [
    'uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu',
    'ulllllllllllllllllllllllllllllu',
    'ulKKKKKKKKKKKKKKKKKKKKKKKKKKKlu',
    'ulKKKKKKKKKKKKKKKKKKKKKKKKKKKlu',
    'ulKKKKKKKKKKKKKKKKKKKKKKKKKKKlu',
    'ulKKKKKKKKKKKKKKKKKKKKKKKKKKKlu',
    'ulKKKKKKKKKKKKKKKKKKKKKKKKKKKlu',
    'ulKKKKKKKKKKKKKKKKKKKKKKKKKKKlu',
    'ulKKKKKKKKKKKKKKKKKKKKKKKKKKKlu',
    'ulKKKKKKKKKKKKKKKKKKKKKKKKKKKlu',
    'ulKKKKKKKKKKKKKKKKKKKKKKKKKKKlu',
    'ulKKKKKKKKKKKKKKKKKKKKKKKKKKKlu',
    'ulKKKKKKKKKKKKKKKKKKKKKKKKKKKlu',
    'ulKKKKKKKK4KKKK444KKKKKKKKKKKlu',
    'ulKKKKKKK44KKKK4K4KKKKKKKKKKKlu',
    'ulKKKKKKKK4KKKK4K4KKKKKKKKKKKlu',
    'ulKKKKKKKK4KKKK4K4KKKKKKKKKKKlu',
    'ulKKKKKKK444K4K444KKKKKKKKKKKlu',
    'ulKKKKKKKKKKKKKKKKKKKKKKKKKKKlu',
    'ulKKKKKKKKKKKKKKKKKKKKKKKKKKKlu',
    'ulKKKKKKKKKKKKKKKKKKKKKKKKKKKlu',
    'ulllllllllllllllllllllllllllllu',
    'uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu',
  ],
};

/** The other country's coin, silver. */
const coinSilver = geTint(geCoin, 'ge8-opener-coin-silver', { y: 'z', G: 'x', g: 'X', O: 'D' });

/** The arrows between the coins, 7x7: one way lit, then the other. */
const arrows: PixelSprite = {
  id: 'ge8-opener-arrows',
  name: 'exchange arrows',
  tags: ['ge8', 'animated'],
  blurb: 'Two arrows, one pointing right and one pointing left, lighting in turn.',
  palette: GE_PALETTE,
  rows: [
    '....m..',
    'NNNNNm.',
    '....m..',
    '.......',
    '..p....',
    '.pppppp',
    '..p....',
  ],
  frames: [
    [
      '....m..',
      'NNNNNm.',
      '....m..',
      '.......',
      '..p....',
      '.pppppp',
      '..p....',
    ],
    [
      '....n..',
      'nnnnnn.',
      '....n..',
      '.......',
      '..q....',
      '.qPPPPP',
      '..q....',
    ],
  ],
  frameMs: 1100,
};

/** The rate's last digit, 3x5 in amber, never settling. */
const lastDigit: PixelSprite = {
  id: 'ge8-opener-digit',
  name: 'rate digit',
  tags: ['ge8', 'animated'],
  blurb: 'An amber digit flicking between 8, 9, 6 and 7.',
  palette: GE_PALETTE,
  rows: ['444', '4.4', '444', '4.4', '444'],
  frames: [
    ['444', '4.4', '444', '4.4', '444'],
    ['444', '4.4', '444', '..4', '444'],
    ['444', '4..', '444', '4.4', '444'],
    ['444', '..4', '.4.', '.4.', '.4.'],
  ],
  frameMs: 900,
};

/** A travel case, 14x10, blue with stickers. */
const suitcase: PixelSprite = {
  id: 'ge8-opener-suitcase',
  name: 'travel case',
  tags: ['ge8', 'prop'],
  blurb: 'A blue travel case covered in stickers.',
  palette: GE_PALETTE,
  rows: [
    '.....DDDD.....',
    '....DD..DD....',
    'hhhhhhhhhhhhhh',
    'hBbbbAAbbbbbbh',
    'hBbbbAAbbRRbbh',
    'hhhhhhhhhhhhhh',
    'hBbbbbbbbRRbbh',
    'hBbNNbbbbbbbbh',
    'hbbNNbbbbbbbbh',
    '.hhhhhhhhhhhh.',
  ],
};

/* ── the opener ─────────────────────────────────────────────────────────────────────────────── */

const BOARD = { x: 4, y: 4 };
const STAND = { x: 48, y: 26 };

const base = geCompose('ge8-opener-base', geGroundStudy, [
  { sprite: board, x: BOARD.x, y: BOARD.y },
  { sprite: geGlobeStand, x: STAND.x, y: STAND.y },
  { sprite: suitcase, x: 8, y: 48 },
]);

const flagLater = geLater(geFlagRed, 'ge8-opener-flag-red-later', 1, 340);
/** A ship's light far out, seen through the window. */
const shipLight = geTint(geStar, 'ge8-opener-ship-light', { z: 'G' });

export const ge8Opener: SceneArt = {
  id: 'ge8-opener',
  label: 'In a study at dusk a desk globe turns between an emerald flag and a red flag, while a board on the wall trades a gold coin for a silver one with arrows lighting each way and a rate that keeps changing.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: geGlobe, x: STAND.x + GE_GLOBE_SEAT.x, y: STAND.y + GE_GLOBE_SEAT.y },
    { sprite: geFlag, x: 40, y: 35 },
    { sprite: flagLater, x: 68, y: 35 },
    { sprite: geCoin, x: BOARD.x + 5, y: BOARD.y + 4, motion: { kind: 'bob', amp: 1, periodMs: 2600 } },
    { sprite: coinSilver, x: BOARD.x + 19, y: BOARD.y + 4, motion: { kind: 'bob', amp: 1, periodMs: 2600, phase: 0.5 } },
    { sprite: arrows, x: BOARD.x + 12, y: BOARD.y + 4 },
    { sprite: lastDigit, x: BOARD.x + 19, y: BOARD.y + 13 },
    { sprite: geStar, x: 50, y: 7, motion: { kind: 'twinkle', periodMs: 2100, phase: 0.3, min: 0.2 } },
    { sprite: geStarBig, x: 64, y: 8, motion: { kind: 'twinkle', periodMs: 2600, min: 0.3 } },
    { sprite: shipLight, x: 69, y: 23, motion: { kind: 'twinkle', periodMs: 3100, phase: 0.6, min: 0.35 } },
  ],
};

/* ── the keepsake ───────────────────────────────────────────────────────────────────────────── */

/** The exchange: a gold coin and a silver coin, an arrow running each way between them, lighting in turn. */
const emblemExchange: PixelSprite = {
  id: 'ge8-emblem-exchange',
  name: 'emblem exchange',
  tags: ['ge', 'emblem', 'animated'],
  blurb: 'A gold coin and a silver coin with one arrow pointing right above them and one pointing left below.',
  palette: GE_PALETTE,
  rows: [
    '................',
    '...........N....',
    '...NNNNNNNNNN...',
    '...........N....',
    '..OOO......DDD..',
    '.OyyyO....DzzzD.',
    'OyGGGgO..DzxxxXD',
    'OyGOGgO..DzxDxXD',
    'OyGGGgO..DzxxxXD',
    '.OgggO....DXXXD.',
    '..OOO......DDD..',
    '................',
    '...p............',
    '..ppppppppppp...',
    '...p............',
    '................',
  ],
  frames: [
    [
      '................',
      '...........N....',
      '...NNNNNNNNNN...',
      '...........N....',
      '..OOO......DDD..',
      '.OyyyO....DzzzD.',
      'OyGGGgO..DzxxxXD',
      'OyGOGgO..DzxDxXD',
      'OyGGGgO..DzxxxXD',
      '.OgggO....DXXXD.',
      '..OOO......DDD..',
      '................',
      '...p............',
      '..ppppppppppp...',
      '...p............',
      '................',
    ],
    [
      '................',
      '...........n....',
      '...nnnnnnnnnn...',
      '...........n....',
      '..OOO......DDD..',
      '.OyyyO....DzzzD.',
      'OyGGGgO..DzxxxXD',
      'OyGOGgO..DzxDxXD',
      'OyGGGgO..DzxxxXD',
      '.OgggO....DXXXD.',
      '..OOO......DDD..',
      '................',
      '...q............',
      '..qqqqqqqqqqq...',
      '...q............',
      '................',
    ],
  ],
  frameMs: 900,
};

export const ge8Finish: SceneArt = geKeepsake(
  'ge8-finish',
  'A postage stamp with perforated edges and an emerald frame, showing a gold coin and a silver coin with an arrow running each way between them, with small sparkles around it.',
  emblemExchange,
);

export const art: LessonArtSet = { opener: ge8Opener, backdrop: geBackdrop, finish: ge8Finish };
