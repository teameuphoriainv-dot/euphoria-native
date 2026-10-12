/**
 * Corporate Finance lesson 23, Corporate Tax Strategy: why the tax a company pays is far less than
 * the rate on the sign.
 *
 * Opener: the tax funnel. Revenue pours down a pipe from the ceiling into a big steel funnel, its
 * mouth heaped with gold. Partway down, a side pipe (the deductions and tax shields) carries coins
 * back out to a heap at the CFO's feet, and only a thin trickle drops out of the spout into the
 * government's stone tax box, a red per cent sign on its front. The rate plaque glows on the far
 * wall. The heaped gold in the funnel's mouth is the brightest surface. Only small layers move:
 * the pour from the ceiling, the coins dropping from the side pipe, the trickle into the box, the
 * rate sign lighting, a glint on the heap.
 *
 * Keepsake: a funnel taking in coins and letting one through.
 */
import type { PixelSprite } from '../types';
import { cfBackdrop } from './cf-backdrop';
import { cfKeepsake } from './cf1-finish';
import { CF_PALETTE, cfCfo, cfCompose, cfHall, cfPlaque, cfSconce, cfShadowShort } from './cf-kit';
import { cfRecolor } from './cf-kit-a';
import { cfFalling } from './cf-kit-b';
import type { LessonArtSet, SceneArt } from './types';

/** The funnel, in scene pixels: its centre column, its mouth row and half-width, its spout. */
const FUNNEL = { cx: 46, mouth: 13, half: 16, neck: 33, neckHalf: 3, spoutEnd: 38 } as const;
/** The funnel's half-width on row `y`, narrowing evenly from the mouth to the neck. */
const halfAt = (y: number) =>
  y > FUNNEL.neck ? 2 : Math.round(FUNNEL.half - ((y - FUNNEL.mouth) * (FUNNEL.half - FUNNEL.neckHalf)) / (FUNNEL.neck - FUNNEL.mouth));
/** Where the side pipe leaves the funnel's wall. */
const SIDE = { y: 21, x: 21 } as const;

/**
 * The funnel: a steel cone lit down its left side, a band round its middle, a narrow spout, and the
 * elliptical mouth on top, dark inside, its back rim lit and its front rim in shadow. Computed, not
 * drawn: a cone's two walls must narrow by the same step on both sides of every row.
 */
const FUNNEL_BOX = { x: FUNNEL.cx - FUNNEL.half - 1, y: FUNNEL.mouth - 3, w: 2 * FUNNEL.half + 3, h: FUNNEL.spoutEnd - FUNNEL.mouth + 4 } as const;
const funnel: PixelSprite = {
  id: 'cf23-funnel',
  name: 'cf23-funnel',
  tags: ['scene', 'cf23'],
  blurb: 'A big steel funnel with a narrow spout.',
  rows: Array.from({ length: FUNNEL_BOX.h }, (_, j) =>
    Array.from({ length: FUNNEL_BOX.w }, (_, i) => {
      const x = FUNNEL_BOX.x + i;
      const y = FUNNEL_BOX.y + j;
      const e = Math.hypot((x - FUNNEL.cx) / (FUNNEL.half + 0.5), (y - FUNNEL.mouth) / 2.6);
      if (e <= 1) {
        if (e > 0.72) return y < FUNNEL.mouth ? 'x' : y === FUNNEL.mouth ? 'X' : 'D';
        return 'K';
      }
      if (y <= FUNNEL.mouth) return '.';
      const half = halfAt(y);
      const dx = x - FUNNEL.cx;
      if (Math.abs(dx) > half) return '.';
      if (Math.abs(dx) === half || y === FUNNEL.spoutEnd) return 'D';
      if (dx >= half - 2) return 'D';
      if (y === 24 || y === 25) return y === 24 ? 'x' : 'D';
      return dx <= -half + 2 ? 'x' : 'X';
    }).join(''),
  ),
};

/** The gold heaped in the funnel's mouth. */
const mouthCoins: PixelSprite = {
  id: 'cf23-mouth-coins',
  name: 'cf23-mouth-coins',
  tags: ['scene', 'cf23'],
  blurb: 'Gold coins heaped in the funnel mouth.',
  rows: [
    '.......OyGO..OyO.....',
    '....OyGGgOOyGGgOyO...',
    '..OyGGgOyGGgOyGGgOyO.',
  ],
};

/** The pipe the revenue comes down from the ceiling, with a flange at its mouth. */
const inPipe: PixelSprite = {
  id: 'cf23-in-pipe',
  name: 'cf23-in-pipe',
  tags: ['scene', 'cf23'],
  blurb: 'A steel pipe down from the ceiling.',
  rows: [...Array.from({ length: 5 }, () => '.xXXXD.'), 'xxXXXDD', 'DDDDDDD'],
};

/**
 * The side pipe: out of the funnel's wall, left along the wall, down an elbow, ending in a lip over
 * the CFO's heap. Computed so its run always meets the funnel wherever the cone puts its wall.
 */
const SIDE_END = 44;
const SIDE_WALL = FUNNEL.cx - halfAt(SIDE.y + 1);
const sidePipe: PixelSprite = {
  id: 'cf23-side-pipe',
  name: 'cf23-side-pipe',
  tags: ['scene', 'cf23'],
  blurb: 'A steel pipe running out of the funnel and down.',
  rows: Array.from({ length: SIDE_END - SIDE.y + 1 }, (_, j) =>
    Array.from({ length: SIDE_WALL - SIDE.x + 1 }, (_, i) => {
      if (j === 0) return 'x';
      if (j <= 2) return i === 0 ? 'x' : j === 1 || i <= 2 ? 'X' : 'D';
      if (i > 2) return '.';
      if (j === SIDE_END - SIDE.y) return 'D';
      return i === 0 ? 'x' : i === 1 ? 'X' : 'D';
    }).join(''),
  ),
};

/** The CFO's heap: the coins the side pipe brings back. */
const heap: PixelSprite = {
  id: 'cf23-heap',
  name: 'cf23-heap',
  tags: ['scene', 'cf23'],
  blurb: 'A small heap of gold coins.',
  rows: [
    '.....OyGO....',
    '...OyGgOyGO..',
    '..OyGgOyGGgO.',
    '.OyGGgOgGgOyO',
    'OOOOOOOOOOOOO',
  ],
};

/** The government's tax box: grey stone, a coin slot in its lid, a red per cent sign on its front. */
const taxBox: PixelSprite = {
  id: 'cf23-tax-box',
  name: 'cf23-tax-box',
  tags: ['scene', 'cf23'],
  blurb: 'A grey stone tax box with a slot and a red per cent sign.',
  rows: [
    'DDDDDDDDDDDDDDD',
    'DxxxxxKKKxxxxXD',
    'DXXXXXXXXXXXXXD',
    'DDDDDDDDDDDDDDD',
    'DxXXXXXXXXXXXXD',
    'DxXXXRRXXRXXXXD',
    'DxXXXRRXRXXXXXD',
    'DxXXXXXRXXXXXXD',
    'DxXXXXRXRRXXXXD',
    'DxXXXRXXRRXXXXD',
    'DxXXXXXXXXXXXXD',
    'DDDDDDDDDDDDDDD',
  ],
};

/** The rate as a sign: a red per cent. */
const signRate: PixelSprite = {
  id: 'cf23-sign-rate',
  name: 'cf23-sign-rate',
  tags: ['scene', 'cf23', 'sign'],
  blurb: 'A red per cent sign.',
  rows: [
    '.RR...R',
    '.RR..R.',
    '....R..',
    '...R...',
    '..R....',
    '.R..RR.',
    'R...RR.',
  ],
};
const signRateDim = cfRecolor(signRate, 'cf23-sign-rate-dim', { R: 'r' });

const boxShadow: PixelSprite = { id: 'cf23-box-shadow', name: 'cf23-box-shadow', tags: ['scene', 'cf23'], palette: CF_PALETTE, rows: ['Z'.repeat(16)] };

const BOX = { x: FUNNEL.cx - 7, y: 43 } as const;

const base = cfCompose('cf23-opener-base', cfHall, [
  [cfPlaque, 66, 6],
  [signRateDim, 68, 8],
  [cfSconce, 71, 21],
  [inPipe, FUNNEL.cx - 3, 0],
  [sidePipe, SIDE.x, SIDE.y],
  [funnel, FUNNEL_BOX.x, FUNNEL_BOX.y],
  [mouthCoins, FUNNEL.cx - 10, FUNNEL.mouth - 3],
  [boxShadow, BOX.x + 2, BOX.y + 12],
  [taxBox, BOX.x, BOX.y],
  [heap, SIDE.x - 5, 51],
  [cfShadowShort, 4, 57],
  [cfCfo, 1, 31],
], 'The still hall: the rate plaque, a lamp, the revenue pipe, the funnel with gold in its mouth, the side pipe, the tax box, the heap and the CFO.');

/** Coins in the air, gold on their way down. */
const COINS: readonly string[] = ['yG', 'Gg', 'yg'];
const pour = cfFalling('cf23-opener-pour', 5, 6, COINS, { count: 5, seed: 1, fall: 2, frameMs: 110 });
const back = cfFalling('cf23-opener-back', 3, 6, COINS, { count: 3, seed: 2, fall: 2, frameMs: 130 });
const trickle = cfFalling('cf23-opener-trickle', 1, 5, ['y'], { count: 1, seed: 0, fall: 1, frameMs: 220 });

const glint: PixelSprite = { id: 'cf23-opener-glint', name: 'cf23-opener-glint', tags: ['scene', 'cf23'], rows: ['.w.', 'wWw', '.w.'] };

export const cf23Opener: SceneArt = {
  id: 'cf23-opener',
  label: 'Coins pour from a pipe into a big steel funnel; a side pipe carries most of them back to a heap at the finance chief\'s feet, and only a thin trickle drops into the government tax box.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: pour, x: FUNNEL.cx - 2, y: 7 },
    { sprite: back, x: SIDE.x, y: SIDE_END + 1 },
    { sprite: trickle, x: FUNNEL.cx, y: FUNNEL.spoutEnd + 1 },
    { sprite: signRate, x: 68, y: 8, motion: { kind: 'twinkle', periodMs: 3000, min: 0.35 } },
    { sprite: glint, x: FUNNEL.cx - 3, y: FUNNEL.mouth - 4, motion: { kind: 'twinkle', periodMs: 2300, min: 0 } },
  ],
};

/** Lesson 23's emblem: a steel funnel with coins in its mouth and one dropping out of its spout. */
const emblemFunnel: PixelSprite = {
  id: 'cf23-emblem-funnel',
  name: 'cf23-emblem-funnel',
  tags: [],
  blurb: 'A steel funnel full of gold coins letting one coin through.',
  rows: [
    '...OyO..OyGO....',
    '.OyGGgOOyGGgOyO.',
    'DxxxxxxxxxxxxxxD',
    'DxKKKKKKKKKKKKXD',
    '.DxxXXXXXXXXXDD.',
    '..DxxXXXXXXXDD..',
    '...DxxXXXXXDD...',
    '....DxxXXXDD....',
    '.....DxXXDD.....',
    '......DxXD......',
    '......DxXD......',
    '......DDDD......',
    '.......OO.......',
    '......OyGO......',
    '......OGgO......',
    '.......OO.......',
  ],
};

export const cf23Finish = cfKeepsake(
  'cf23-finish',
  'A crystal award on a gold stand with a steel funnel full of coins letting one coin through inside, and small sparkles around it.',
  emblemFunnel,
);

export const art: LessonArtSet = { opener: cf23Opener, backdrop: cfBackdrop, finish: cf23Finish };
