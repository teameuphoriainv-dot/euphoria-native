/**
 * Personal Finance lesson 15, Introduction to Investing: water it every month and let it grow.
 *
 * A new set, a balcony at sunset: the glass door of home on the left (the cat watching from inside),
 * the parapet across the front, and past the building's corner the sun going down behind the roofs.
 * On the parapet the pathway's sprout has grown into a sapling in a big pot, and the figure waters it
 * from a can that pours gold coins, the lesson's steady $200 a month, onto soil where an earlier coin
 * already lies; a small sprout in its own pot stands at the end of the ledge. Moving: the coins, the
 * sapling and the sprout swaying, the sun's glow, a bird, the cat's tail.
 */
import type { PixelSprite } from '../types';
import { pfBird, pfCompose, pfPot, pfSaverReach, pfSprout } from './pf-kit';
import { pfCatSit } from './pf-kit-a';
import { pfPotLarge, pfSapling } from './pf-kit-b';
import { pfKeepsake } from './pf1-finish';
import { pfBackdrop } from './pf-backdrop';
import type { LessonArtSet, SceneArt } from './types';

/** Roofs past the corner: x, width and top row; a few windows lit. */
const ROOFS = [[40, 8, 30], [48, 9, 29], [57, 10, 31], [67, 13, 28]] as const;
const SKY = ['E', 'E', 'E', 'E', 'E', 'E', 'p', 'p', 'p', 'p', 'p', 'p', 'f', 'f', 'f', 'f', 'f', 'f', '3', '3', '3', '3', '3', '3', '4'];

/**
 * The balcony: the building's wall and corner on the left, the sunset and the roofs on the right, the
 * sun half down behind them, the parapet's coping and face, and the lit window heads of the floor below.
 */
function balcony(): string[] {
  return Array.from({ length: 60 }, (_, y) =>
    Array.from({ length: 80 }, (_, x) => {
      if (y >= 36) {
        if (y === 36) return 'x';
        if (y === 37) return 'X';
        if (y === 38) return 'K';
        if (y < 49) return x % 16 === 15 ? 'K' : 'D';
        if (y === 49) return 'X';
        if (y >= 53 && ((x >= 6 && x < 22) || (x >= 48 && x < 64))) {
          if (x === 6 || x === 21 || x === 48 || x === 63 || y === 53) return 'D';
          return y === 54 ? 'G' : 'g';
        }
        return 'k';
      }
      if (x < 40) return x === 39 ? 'D' : 'k';
      const roof = ROOFS.find(([rx, rw]) => x >= rx && x < rx + rw);
      if (roof && y >= roof[2]) return x % 4 === 2 && y === roof[2] + 2 && x !== roof[0] + 2 ? 'G' : 'K';
      const sun = (x - 61) ** 2 + (y - 29) ** 2;
      if (sun <= 9) return '5';
      if (sun <= 17) return '4';
      return SKY[Math.min(y, SKY.length - 1)];
    }).join(''),
  );
}

/** The glass door of home: a dim room, a floor lamp lit inside, the curtain drawn to one side. */
const balconyDoor: PixelSprite = {
  id: 'pf15-door',
  name: 'balcony door',
  tags: ['scene', 'pf'],
  rows: [
    'DDDDDDDDDDDDDD',
    'DXXXXXXXXXXXXD',
    'DXEEEEEEEpPqXD',
    'DXEyEEEEEpPqXD',
    'DXGGGEEEEpPqXD',
    'DXgGgEEEEpPqXD',
    'DXEOEEEEEpPqXD',
    'DXEOEEEEEpPqXD',
    'DXEOEEEEEpPqXD',
    'DXEOEEEEEpPqXD',
    'DXEOEEEEEpPqXD',
    'DXEOEEEEEpPqXD',
    'DXEOEEEEEpPqXD',
    'DXEOEEEEEpPqXD',
    'DXEOEEEEEpPqXD',
    'DXXXXXXXXXXXXD',
    'DXEOEEEEEpPqXD',
    'DXEOEEEEEpPqXD',
    'DXEOEEEEEpPqXD',
    'DXEOEEEEEpPqXD',
    'DXEOEEEEEpPqXD',
    'DXEOEEEEEpPqXD',
    'DXEOEEEEEpPqXD',
    'DXEOEEEEEpPqXD',
    'DXEOEEEEEpPqXD',
    'DXEOEEEEEpPqXD',
    'DXKOKKKKKpPqXD',
    'DXKOKKKKKpPqXD',
    'DXKKKKKKKKKKXD',
    'DXKKKKKKKKKKXD',
    'DXXXXXXXXXXXXD',
    'DDDDDDDDDDDDDD',
  ],
};

/** A teal watering can held by its handle (columns 1 to 3, row 0), tipped so the rose at column 11 pours. */
const wateringCan: PixelSprite = {
  id: 'pf15-watering-can',
  name: 'watering can',
  tags: ['scene', 'pf'],
  rows: [
    '.ttt.........',
    't...t........',
    'tTTTTTt......',
    'TmTTTTTttt...',
    'TTTTTTTt.tty.',
    'tTTTTTTt.....',
    '.tttttt......',
  ],
};

/**
 * Coins pouring from the rose into the big pot, the kit's coin outlined in deep gold so it shows on the
 * sunset: out of the rose, down in a short arc onto the soil, a glint where it goes in, then the next.
 */
const COIN = ['.OO.', 'OyGO', 'OGgO', '.OO.'];
function coinAt(cx: number, cy: number): string[] {
  const rows = Array.from({ length: 7 }, () => [...'.......']);
  COIN.forEach((row, j) => [...row].forEach((ch, i) => { if (ch !== '.') rows[cy + j][cx + i] = ch; }));
  return rows.map((r) => r.join(''));
}
const pour: PixelSprite = {
  id: 'pf15-pour',
  name: 'pour',
  tags: ['scene', 'pf'],
  rows: coinAt(0, 0),
  frames: [
    coinAt(0, 0),
    coinAt(1, 1),
    coinAt(2, 2),
    coinAt(3, 3),
    ['.......', '.......', '.......', '....y..', '...yWy.', '....y..', '.......'],
    ['.......', '.......', '.......', '.......', '....w..', '.......', '.......'],
  ],
  frameMs: 240,
};

/** A coin poured before, lying on the soil on the far side of the trunk. */
const soilCoin: PixelSprite = {
  id: 'pf15-soil-coin',
  name: 'soil coin',
  tags: ['scene', 'pf'],
  rows: COIN,
};

/** The low sun's glow, a ring for a slow twinkle. */
const sunGlow: PixelSprite = {
  id: 'pf15-sun-glow',
  name: 'sun glow',
  tags: ['scene', 'pf'],
  rows: [
    '...4.4.4...',
    '.4.......4.',
    '4.........4',
  ],
};

/** Lesson 15's emblem: the sapling in its pot. */
const emblemSapling: PixelSprite = {
  id: 'pf15-emblem-sapling',
  name: 'pf15-emblem-sapling',
  tags: ['scene', 'pf', 'emblem'],
  rows: [
    '......mN......',
    '....mNNNNn....',
    '...mNNNNNNn...',
    '.mNn.nNNn.Nm..',
    'mNNNn.gO.nNNn.',
    '......gO......',
    '...14433321...',
    '....143321....',
    '.....1111.....',
  ],
};

// Order is depth: the can behind the hand that holds it, the figure behind the parapet, pots on it,
// then the coin already on the big pot's soil.
const base = pfCompose('pf15-opener-base', 80, 60, balcony(), [
  [balconyDoor, 1, 4],
  [wateringCan, 33, 19],
  [pfSaverReach, 13, 10],
  [pfPotLarge, 45, 29],
  [soilCoin, 52, 25],
  [pfPot, 66, 31],
]);

export const pf15Opener: SceneArt = {
  id: 'pf15-opener',
  label: 'On a balcony at sunset, a person waters a young sapling in a big pot with a can that pours gold coins, beside a small sprout in its own pot, while the cat watches through the glass door.',
  width: 80,
  height: 60,
  base,
  layers: [
    // The sapling stands on the big pot's soil (pot at 45,29); the sprout on the small pot's (66,31).
    { sprite: pfSapling, x: 44, y: 14 },
    { sprite: pfSprout, x: 66, y: 26 },
    // Each coin leaves the can's rose (can at 33,19; rose at column 11, row 4) and arcs down onto the
    // soil's near half (pot at 45,29; soil on row 29), clear of the sapling's trunk at columns 50 and 51.
    { sprite: pour, x: 43, y: 22 },
    { sprite: sunGlow, x: 56, y: 23, motion: { kind: 'twinkle', periodMs: 3000, min: 0.3 } },
    { sprite: pfBird, x: 70, y: 11, motion: { kind: 'drift', amp: 2, periodMs: 5200 } },
    // The cat sits on the floor inside the door, watching.
    { sprite: pfCatSit, x: 2, y: 22 },
  ],
};

export const pf15Finish = pfKeepsake(
  'pf15-finish',
  'A gold house-shaped key fob with a teal roof on a key ring with a brass key, its window showing a young sapling growing in a pot, with small sparkles around it.',
  emblemSapling,
);

export const art: LessonArtSet = { opener: pf15Opener, backdrop: pfBackdrop, finish: pf15Finish };
