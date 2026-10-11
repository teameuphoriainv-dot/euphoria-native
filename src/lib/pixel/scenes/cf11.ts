/**
 * Corporate Finance lesson 11, Capital Budgeting & Project Evaluation: which projects get the money.
 *
 * Opener: the project review. Three blueprints stand on brass easels (a factory, a tower, a wind
 * turbine), and the CFO points his cane at them. Two carry a green tick, their future cash worth
 * more today than they cost (NPV above zero), and one a red cross; coins rise off the two worth
 * funding. The invest plaque and the window onto the works sit above. Only small layers move: the
 * three badges, two coins, the lit invest sign, smoke from the works.
 *
 * Keepsake: a blueprint with a green tick.
 */
import type { PixelSprite } from '../types';
import { cfBackdrop } from './cf-backdrop';
import { cfKeepsake } from './cf1-finish';
import {
  CF_PALETTE,
  cfCoinSpin,
  cfCompose,
  cfHall,
  cfLater,
  cfPlaque,
  cfShadowShort,
  cfSignInvest,
  cfSmokePuff,
  cfWindowWorks,
} from './cf-kit';
import { cfCfoReach, cfRecolor } from './cf-kit-a';
import type { LessonArtSet, SceneArt } from './types';

/** A blueprint, 17x13: blue paper, a lit top and left edge, its drawing in white lines. */
function blueprint(id: string, drawing: readonly string[]): PixelSprite {
  return {
    id,
    name: id,
    tags: ['scene', 'cf11'],
    blurb: 'A blueprint.',
    palette: CF_PALETTE,
    rows: [
      'B'.repeat(17),
      ...drawing.map((row) => `B${[...row].map((ch) => (ch === 'w' ? 'w' : 'b')).join('')}C`),
      'C'.repeat(17),
    ],
  };
}

const factory = blueprint('cf11-blueprint-factory', [
  '...............',
  '............w..',
  '............w..',
  '.w...w...w..w..',
  '.ww..ww..ww.w..',
  '.w.w.w.w.w.ww..',
  '.wwwwwwwwwwwww.',
  '.w...........w.',
  '.w.ww...ww...w.',
  '.w.ww...ww...w.',
  '.wwwwwwwwwwwww.',
]);

const tower = blueprint('cf11-blueprint-tower', [
  '.......w.......',
  '.....wwwww.....',
  '.....w.w.w.....',
  '.....wwwww.....',
  '.....w.w.w.....',
  '.....wwwww.....',
  '.....w.w.w.....',
  '.....wwwww.....',
  '.....w.w.w.....',
  '.....w.w.w.....',
  '.wwwwwwwwwwwww.',
]);

const turbine = blueprint('cf11-blueprint-turbine', [
  '.......w.......',
  '.......w.......',
  '.......w.......',
  '.......w.......',
  '......www......',
  '.....w.w.w.....',
  '....w..w..w....',
  '...w...w...w...',
  '.......w.......',
  '.......w.......',
  '.wwwwwwwwwwwww.',
]);

const EASEL = { legs: 19, splay: 3 } as const;

/** A brass easel: a mast, the ledge the blueprint stands on, three legs. The board covers rows 2 to 14. */
const easel: PixelSprite = {
  id: 'cf11-easel',
  name: 'cf11-easel',
  tags: ['scene', 'cf11'],
  blurb: 'A brass easel.',
  rows: [
    '........O........',
    '........g........',
    ...Array.from({ length: 13 }, () => '.................'),
    'OgggggggggggggggO',
    ...Array.from({ length: EASEL.legs }, (_, r) => {
      const t = r / (EASEL.legs - 1);
      const left = Math.round(4 - EASEL.splay * t);
      const right = Math.round(12 + EASEL.splay * t);
      return Array.from({ length: 17 }, (_, x) => (x === left || x === right ? 'g' : x === 8 ? 'O' : '.')).join('');
    }),
  ],
};

/** Accepted: a green disc with a white tick. */
const BADGE_TICK: readonly string[] = [
  '..nnn..',
  '.nnnnn.',
  'nnnnnwn',
  'nwnnwnn',
  'nnwwnnn',
  '.nnnnn.',
  '..nnn..',
];

/** Rejected: a red disc with a white cross. */
const BADGE_CROSS: readonly string[] = [
  '..rrr..',
  '.wrrrw.',
  'rrwrwrr',
  'rrrwrrr',
  'rrwrwrr',
  '.wrrrw.',
  '..rrr..',
];

/** The CFO's cane, a red tip at the far end. */
const cane: PixelSprite = { id: 'cf11-cane', name: 'cf11-cane', tags: ['scene', 'cf11'], rows: ['....r', '...x.', '..x..', '.x...', 'x....'] };

/** The invest sign dimmed, for the base; the lit sign above it is a layer. */
const signInvestDim = cfRecolor(cfSignInvest, 'cf11-sign-invest-dim', { m: 'N', N: 'n' });

const base = cfCompose('cf11-opener-base', cfHall, [
  [cfWindowWorks, 3, 4],
  [cfPlaque, 60, 6],
  [signInvestDim, 62, 8],
  [easel, 21, 22],
  [easel, 41, 22],
  [easel, 61, 22],
  [factory, 21, 24],
  [tower, 41, 24],
  [turbine, 61, 24],
  [cfShadowShort, 3, 56],
  [cfCfoReach, 0, 30],
  [cane, 18, 38],
], 'The still review: the works window, the invest plaque, three blueprints on easels, the CFO with his cane.');

const badge = (id: string, rows: readonly string[]): PixelSprite => ({ id, name: id, tags: ['scene', 'cf11'], rows: [...rows] });

const coinLater = cfLater(cfCoinSpin, 'cf11-opener-coin-later', 2, 300);

export const cf11Opener: SceneArt = {
  id: 'cf11-opener',
  label: 'A finance chief points his cane at three project blueprints on easels, a factory and a wind turbine marked with green ticks and a tower with a red cross, choosing which to fund.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: cfSmokePuff, x: 13, y: 8, motion: { kind: 'rise', amp: 2, periodMs: 3600 } },
    { sprite: cfSignInvest, x: 62, y: 8, motion: { kind: 'twinkle', periodMs: 3000, min: 0.4 } },
    { sprite: badge('cf11-opener-tick-a', BADGE_TICK), x: 33, y: 21, motion: { kind: 'twinkle', periodMs: 2400, min: 0.55 } },
    { sprite: badge('cf11-opener-cross', BADGE_CROSS), x: 53, y: 21, motion: { kind: 'twinkle', periodMs: 2400, phase: 0.33, min: 0.55 } },
    { sprite: badge('cf11-opener-tick-b', BADGE_TICK), x: 73, y: 21, motion: { kind: 'twinkle', periodMs: 2400, phase: 0.66, min: 0.55 } },
    { sprite: cfCoinSpin, x: 26, y: 15, motion: { kind: 'rise', amp: 7, periodMs: 2800 } },
    { sprite: coinLater, x: 66, y: 15, motion: { kind: 'rise', amp: 7, periodMs: 3100, phase: 0.5 } },
  ],
};

/** Lesson 11's emblem: a factory blueprint with a green tick in its corner. */
const emblemBlueprint: PixelSprite = {
  id: 'cf11-emblem-blueprint',
  name: 'cf11-emblem-blueprint',
  tags: [],
  blurb: 'A factory blueprint with a green tick.',
  palette: CF_PALETTE,
  rows: [
    '...........nnn..',
    '..........nnnnn.',
    'BBBBBBBBBnnnnnwn',
    'Bbbbbbbbbnwnnwnn',
    'Bbbbbbbbbnnwwnnn',
    'Bbbbbbbbwbnnnnn.',
    'Bbwbbbwbwbbnnn..',
    'BbwwbbwwwbbbC...',
    'BbwbwbwbwbbbC...',
    'BbwwwwwwwwwbC...',
    'BbwbbbbbbbwbC...',
    'BbwbwwbwwbwbC...',
    'BbwbwwbwwbwbC...',
    'BbwwwwwwwwwbC...',
    'BbbbbbbbbbbbC...',
    'CCCCCCCCCCCCC...',
  ],
};

export const cf11Finish = cfKeepsake(
  'cf11-finish',
  'A crystal award on a gold stand with a factory blueprint marked with a green tick inside, and small sparkles around it.',
  emblemBlueprint,
);

export const art: LessonArtSet = { opener: cf11Opener, backdrop: cfBackdrop, finish: cf11Finish };
