/**
 * Quantitative Analysis lesson 8, Statistical Arbitrage: the pair on twin screens.
 *
 * Two monitors on one arm, because the trade is a pair. The left one shows two prices that have
 * tracked each other for years (red and blue, moving together) until the spread opens at the
 * right. The right one shows that spread round its mean (gold, dashed), between the bands at two
 * standard deviations (red above, where the pair is sold; green below, where it is bought). The
 * quant sits between them; two mugs on the desk make another pair. Only small layers move: the
 * live spread swings from one band to the other and back (mean reversion), the two prices' tips
 * flicker, steam rises from both mugs.
 * Keepsake: an up arrow beside a down arrow, the long and the short of the pair.
 */
import type { PixelSprite } from '../types';
import { qaBackdrop } from './qa-backdrop';
import { qaCompose, qaDesk, qaKeepsake, qaLamp, qaMug, qaPath, qaQuantSeated, qaRoom, qaScreen, qaSteam, qaText } from './qa-kit';
import type { LessonArtSet, SceneArt } from './types';

const LEFT = { x: 3, y: 3, width: 35, height: 23 } as const;
const RIGHT = { x: 42, y: 3, width: 35, height: 23 } as const;

/* ── the pair ──────────────────────────────────────────────────────────────────────────────────── */

/** The shared moves both prices make, then each line's own offset; the spread opens at the end. */
const COMMON = [14, 13, 14, 12, 11, 12, 10, 11, 12, 11, 10];
const pairPoints = (offset: number, split: readonly number[]): [number, number][] =>
  [...COMMON, ...split.map((dy) => COMMON[COMMON.length - 1] + dy)].map((y, i) => [LEFT.x + 3 + i * 2, y + offset + LEFT.y] as [number, number]);

const A_POINTS = pairPoints(0, [-1, -3, -5, -6]);
const B_POINTS = pairPoints(3, [1, 2, 3, 3]);
const priceA = qaPath('qa8-price-a', 80, 60, A_POINTS, 'R');
const priceB = qaPath('qa8-price-b', 80, 60, B_POINTS, 'B');

/** The next tick of each price, just past its line's end, flickering a pixel either way. */
const [A_END_X, A_END_Y] = A_POINTS[A_POINTS.length - 1];
const B_END_Y = B_POINTS[B_POINTS.length - 1][1];
const GAP = B_END_Y - A_END_Y;
const tick = (a: number, b: number) => Array.from({ length: GAP + 3 }, (_, r) => (r === a + 1 ? 'R' : r === b + 1 ? 'B' : '.'));

const tips: PixelSprite = {
  id: 'qa8-tips',
  name: 'qa8-tips',
  tags: ['scene', 'qa8'],
  rows: tick(0, GAP),
  frames: [tick(0, GAP), tick(-1, GAP + 1), tick(0, GAP), tick(1, GAP - 1)],
  frameMs: 420,
};

/* ── the spread ────────────────────────────────────────────────────────────────────────────────── */

const MEAN = 14;
const UPPER = 8;
const LOWER = 20;
const SPREAD_X = RIGHT.x + 4;

const mean = qaPath('qa8-mean', 80, 60, [[SPREAD_X, MEAN], [RIGHT.x + 31, MEAN]], 'y', [2, 1]);
const upper = qaPath('qa8-upper', 80, 60, [[SPREAD_X, UPPER], [RIGHT.x + 31, UPPER]], 'r', [1, 1]);
const lower = qaPath('qa8-lower', 80, 60, [[SPREAD_X, LOWER], [RIGHT.x + 31, LOWER]], 'n', [1, 1]);

/** The spread: wandering round the mean, out past the top band, back, out past the bottom, back. */
const spread = qaPath('qa8-spread', 80, 60, [
  [SPREAD_X, 14], [SPREAD_X + 2, 12], [SPREAD_X + 4, 15], [SPREAD_X + 6, 11], [SPREAD_X + 8, 7], [SPREAD_X + 10, 9],
  [SPREAD_X + 12, 13], [SPREAD_X + 14, 15], [SPREAD_X + 16, 13], [SPREAD_X + 18, 17], [SPREAD_X + 20, 21],
  [SPREAD_X + 22, 19], [SPREAD_X + 24, 15], [SPREAD_X + 25, 14],
], 'w');

/** The live spread, a bright point that swings from the bottom band up through the mean and back. */
const live: PixelSprite = { id: 'qa8-live', name: 'qa8-live', tags: ['scene', 'qa8'], rows: ['WW', 'WW'] };
const LIVE_AT = { x: RIGHT.x + 29, y: LOWER - 1 } as const;

/* ── the desk ──────────────────────────────────────────────────────────────────────────────────── */

const arm: PixelSprite = {
  id: 'qa8-arm',
  name: 'qa8-arm',
  tags: ['scene', 'qa8'],
  blurb: 'The dual monitor arm: a pole from the desk, a crossbar behind both screens.',
  rows: [
    'DDDDDDD',
    ...Array.from({ length: 27 }, () => '..DXD..'),
    'DXXXXXD',
  ],
};

/** The second mug of the pair, in teal. */
const mugTeal: PixelSprite = {
  ...qaMug,
  id: 'qa8-mug-teal',
  name: 'qa8-mug-teal',
  rows: qaMug.rows.map((row) => row.replace(/Q/g, 'T').replace(/q/g, 'T').replace(/P/g, 't')),
};

const base = qaCompose('qa8-opener-base', 80, 60, [
  { sprite: qaRoom, x: 0, y: 0 },
  { sprite: arm, x: 37, y: 11 },
  { sprite: qaScreen('qa8-left', LEFT.width, LEFT.height), x: LEFT.x, y: LEFT.y },
  { sprite: qaScreen('qa8-right', RIGHT.width, RIGHT.height), x: RIGHT.x, y: RIGHT.y },
  { sprite: priceB, x: 0, y: 0 },
  { sprite: priceA, x: 0, y: 0 },
  { sprite: upper, x: 0, y: 0 },
  { sprite: lower, x: 0, y: 0 },
  { sprite: mean, x: 0, y: 0 },
  { sprite: spread, x: 0, y: 0 },
  { sprite: qaText('qa8-mu', 'μ', 'y'), x: RIGHT.x + 24, y: MEAN - 5 },
  { sprite: qaDesk, x: 11, y: 40 },
  { sprite: qaMug, x: 15, y: 34 },
  { sprite: mugTeal, x: 23, y: 34 },
  { sprite: qaLamp, x: 57, y: 25 },
  { sprite: qaQuantSeated, x: 33, y: 19 },
]);

const TIPS_AT = { x: A_END_X + 1, y: A_END_Y - 1 } as const;

export const qa8Opener: SceneArt = {
  id: 'qa8-opener',
  label: 'A quant sits between twin monitors: one shows two prices moving together until they drift apart, the other their spread swinging between bands around a gold mean line.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: live, x: LIVE_AT.x, y: LIVE_AT.y, motion: { kind: 'bob', amp: LOWER - UPPER, periodMs: 2600 } },
    { sprite: tips, x: TIPS_AT.x, y: TIPS_AT.y },
    { sprite: qaSteam, x: 16, y: 30, motion: { kind: 'rise', amp: 3, periodMs: 1800 } },
    { sprite: qaSteam, x: 24, y: 30, motion: { kind: 'rise', amp: 3, periodMs: 2100, phase: 0.5 } },
  ],
};

/** Lesson 8's emblem: the pair trade, long one side (up) and short the other (down). */
const emblemLongShort: PixelSprite = {
  id: 'qa8-emblem-long-short',
  name: 'qa8-emblem-long-short',
  tags: ['scene', 'qa8'],
  rows: [
    '............',
    '..OO....OO..',
    '.OOOO...OOy.',
    'OOOOOO..OOy.',
    '..OOy...OOy.',
    '..OOy...OOy.',
    '..OOy...OOy.',
    '..OOy...OOy.',
    '..OOy.OOOOOO',
    '..OOy..OOOOy',
    '..yy....OOy.',
    '.........y..',
  ],
};

export const qa8Finish: SceneArt = qaKeepsake(
  'qa8-finish',
  'A gold medallion hanging from a purple ribbon, embossed with an up arrow and a down arrow side by side, with small sparkles around it.',
  emblemLongShort,
);

export const art: LessonArtSet = { opener: qa8Opener, backdrop: qaBackdrop, finish: qa8Finish };
