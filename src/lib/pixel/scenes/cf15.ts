/**
 * Corporate Finance lesson 15, Financial Distress & Restructuring: who gets paid when the money
 * runs out.
 *
 * Opener: the hall in hard times, the wallpaper cracked, a window boarded over, one bare bulb. The
 * company's safe has split, and what is left of its cash pours down the absolute priority
 * waterfall: four bins stepping down the wall, each a class of claim. The blue bin (secured
 * creditors) fills first and overflows into the teal one (unsecured), which overflows in a
 * trickle into the orchid one (preferred); the green bin at the bottom (common shareholders) stays
 * empty, and the CFO stands beside it. Only small layers move: three streams of coins, the
 * flickering bulb, a glint on the first bin's heap.
 *
 * Keepsake: a cracked coin with a plaster across it.
 */
import type { PixelSprite } from '../types';
import { cfBackdrop } from './cf-backdrop';
import { cfKeepsake } from './cf1-finish';
import { CF_PALETTE, cfCfo, cfCompose, cfHall, cfShadowShort } from './cf-kit';
import { cfFalling } from './cf-kit-b';
import type { LessonArtSet, SceneArt } from './types';

/** The company's safe, split down the front, coins escaping at the foot of the crack. */
const safe: PixelSprite = {
  id: 'cf15-safe',
  name: 'cf15-safe',
  tags: ['scene', 'cf15'],
  blurb: 'A grey safe split by a crack.',
  rows: [
    '.DDDDDDDDDDD.',
    'DxxxxxxxxxKxD',
    'DxXXXXXXXXKXD',
    'DxXXOOOXXKXXD',
    'DxXOyGgOXKXXD',
    'DxXOGggOXXKXD',
    'DxXXOOOXXXKXD',
    'DxXXXXXXXKXXD',
    'DxXXXXXXXKXXD',
    'DxXXXXXXXXK.D',
    '.DDDDDDDDD...',
  ],
};

type Fill = 'heaped' | 'level' | 'few' | 'none';
const INSIDE: Record<Fill, string> = { heaped: 'GyGgGyGgGyGg', level: 'GyGgGyGgGyGg', few: 'KKGyKKKKGgKK', none: 'KKKKKKKKKKKK' };

/**
 * One bin of the waterfall, 14x8: two rows for a heap of coins over the rim, then the bin itself
 * in one claim's colours (lit rim, face, edge). `fill` says how far the money reached it.
 */
function bin(id: string, lit: string, face: string, edge: string, fill: Fill): PixelSprite {
  const heaped = fill === 'heaped';
  return {
    id,
    name: id,
    tags: ['scene', 'cf15'],
    blurb: 'A bin of the priority waterfall.',
    rows: [
      heaped ? '...OyO.OyO....' : '.'.repeat(14),
      heaped ? '.OyGgOyGgOyGO.' : '.'.repeat(14),
      lit.repeat(14),
      `${edge}${INSIDE[fill]}${edge}`,
      `${lit}${face.repeat(12)}${edge}`,
      `.${lit}${face.repeat(10)}${edge}.`,
      `.${lit}${face.repeat(10)}${edge}.`,
      `..${edge.repeat(10)}..`,
    ],
  };
}

const binSecured = bin('cf15-bin-secured', 'B', 'b', 'C', 'heaped');
const binUnsecured = bin('cf15-bin-unsecured', 'T', 't', 'n', 'heaped');
const binPreferred = bin('cf15-bin-preferred', 'q', 'P', 'E', 'few');
const binCommon = bin('cf15-bin-common', 'm', 'N', 'n', 'none');

/** A brass shelf on two brackets, for the safe and the bins up the wall. */
const shelf = (id: string, width: number): PixelSprite => ({
  id,
  name: id,
  tags: ['scene', 'cf15'],
  rows: ['g'.repeat(width), 'O'.repeat(width), `.O${'.'.repeat(width - 4)}O.`, `..O${'.'.repeat(width - 6)}O..`],
});

/** A window boarded over with two crossed planks, nailed. */
const boarded: PixelSprite = {
  id: 'cf15-boarded-window',
  name: 'cf15-boarded-window',
  tags: ['scene', 'cf15'],
  blurb: 'A window boarded up with crossed planks.',
  palette: CF_PALETTE,
  rows: Array.from({ length: 13 }, (_, y) =>
    Array.from({ length: 15 }, (_, x) => {
      if (y === 0 || y === 12 || x === 0 || x === 14) return 'O';
      const down = Math.round(1 + ((y - 1) * 12) / 10);
      const up = 14 - down;
      for (const t of [down, up]) {
        if (x === t) return y === 1 || y === 11 ? 'x' : 'A';
        if (x === t + 1) return 'a';
      }
      if (y === 1 || y === 11 || x === 1 || x === 13) return 'a';
      return 'K';
    }).join(''),
  ),
};

/** Where the wallpaper has cracked: a long dark split, grey plaster showing along one side. */
const crack: PixelSprite = {
  id: 'cf15-crack',
  name: 'cf15-crack',
  tags: ['scene', 'cf15'],
  rows: ['..K..', '..K..', '.KD..', '.K...', '..KD.', '...K.', '..KK.', '.K...', '.KD..', '..K..', '...K.'],
};

/** The bare bulb's cord and socket; the bulb itself is a layer, flickering. */
const cord: PixelSprite = { id: 'cf15-cord', name: 'cf15-cord', tags: ['scene', 'cf15'], rows: ['.O.', '.O.', '.O.', '.O.', 'OXO'] };

const base = cfCompose('cf15-opener-base', cfHall, [
  [crack, 27, 4],
  [crack, 55, 16],
  [boarded, 63, 5],
  [cord, 43, 3],
  [shelf('cf15-shelf-safe', 10), 0, 14],
  [safe, 1, 3],
  [shelf('cf15-shelf-a', 15), 5, 24],
  [shelf('cf15-shelf-b', 15), 19, 33],
  [shelf('cf15-shelf-c', 15), 33, 42],
  [binSecured, 6, 16],
  [binUnsecured, 20, 25],
  [binPreferred, 34, 34],
  [binCommon, 48, 45],
  [cfShadowShort, 68, 56],
  [cfCfo, 65, 30],
], 'The still hall in hard times: cracks, a boarded window, the split safe, four bins on the wall and floor, the CFO.');

/** Coins in the air, gold on their way down. */
const COINS: readonly string[] = ['yG', 'Gg', 'yg'];
const pourSafe = cfFalling('cf15-opener-pour-safe', 3, 6, COINS, { count: 4, seed: 1, fall: 2, frameMs: 120 });
const pourSecured = cfFalling('cf15-opener-pour-secured', 3, 10, COINS, { count: 4, seed: 2, fall: 2, frameMs: 120 });
const pourUnsecured = cfFalling('cf15-opener-pour-unsecured', 3, 10, COINS, { count: 2, seed: 3, fall: 2, frameMs: 150 });

const bulb: PixelSprite = { id: 'cf15-opener-bulb', name: 'cf15-opener-bulb', tags: ['scene', 'cf15'], rows: ['yWy', '.y.'] };
const glint: PixelSprite = { id: 'cf15-opener-glint', name: 'cf15-opener-glint', tags: ['scene', 'cf15'], rows: ['.w.', 'wWw', '.w.'] };

export const cf15Opener: SceneArt = {
  id: 'cf15-opener',
  label: 'In a cracked, boarded-up hall, coins pour from a broken safe into four bins stepping down the wall, filling the first two to overflowing, barely reaching the third and leaving the last one empty beside the finance chief.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: pourSafe, x: 10, y: 13 },
    { sprite: pourSecured, x: 19, y: 18 },
    { sprite: pourUnsecured, x: 33, y: 27 },
    { sprite: bulb, x: 43, y: 8, motion: { kind: 'twinkle', periodMs: 900, min: 0.2 } },
    { sprite: glint, x: 14, y: 14, motion: { kind: 'twinkle', periodMs: 2100, min: 0 } },
  ],
};

/** The crack in the emblem's coin, top to bottom; the plaster covers its middle. */
const CRACK = new Set(['9,2', '9,3', '8,4', '8,5', '7,6', '7,7', '6,8', '6,9', '7,10', '6,11', '6,12', '5,13']);

/**
 * Lesson 15's emblem: a gold coin cracked top to bottom with a plaster across it. Computed: a disc,
 * a rim, the crack, and a plaster on the diagonal, which typed by hand is where a disc goes lumpy.
 */
const emblemMended: PixelSprite = {
  id: 'cf15-emblem-mended',
  name: 'cf15-emblem-mended',
  tags: [],
  blurb: 'A cracked gold coin with a plaster across it.',
  palette: CF_PALETTE,
  rows: Array.from({ length: 16 }, (_, y) =>
    Array.from({ length: 16 }, (_, x) => {
      const dx = x - 7.5;
      const dy = y - 7.5;
      const band = x + y - 15;
      if (x >= 4 && x <= 11 && Math.abs(band) <= 1) {
        if (band < 0) return 'w';
        return band === 0 && x !== 7 && x !== 8 ? 'S' : 'M';
      }
      const r2 = dx * dx + dy * dy;
      if (r2 > 44) return '.';
      if (CRACK.has(`${String(x)},${String(y)}`)) return 'K';
      if (r2 > 30) return 'O';
      if (dx + dy < -4) return 'y';
      return dx + dy > 4 ? 'g' : 'G';
    }).join(''),
  ),
};

export const cf15Finish = cfKeepsake(
  'cf15-finish',
  'A crystal award on a gold stand with a cracked gold coin mended by a plaster inside, and small sparkles around it.',
  emblemMended,
);

export const art: LessonArtSet = { opener: cf15Opener, backdrop: cfBackdrop, finish: cf15Finish };
