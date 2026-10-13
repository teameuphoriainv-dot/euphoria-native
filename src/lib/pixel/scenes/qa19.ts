/**
 * Quantitative Analysis lesson 19, Backtesting & Strategy Validation: the glass wall.
 *
 * Late in an office whose back wall is all glass, the city at night beyond it, the quant draws on
 * the glass in marker the chart every quant learns to fear. Up to a dashed gold line the backtest
 * climbs smooth and green, too good to be true; past the line, where the strategy went LIVE, the
 * same strategy stumbles in red. In-sample is not out-of-sample: the gap between the two is what
 * look-ahead bias, survivorship and data snooping cost. Only small layers move: windows light up
 * across the city, the mast's warning light blinks, the newest live day blinks at the red line's
 * end, the marker's tip glints, stars twinkle.
 * Keepsake: the chart in small, a climb to the dashed go-live line and the fall after it.
 */
import type { PixelSprite } from '../types';
import { qaBackdrop } from './qa-backdrop';
import {
  QA_REACH_HAND, qaCompose, qaKeepsake, qaPath, qaQuantReaching, qaRect, qaRoom, qaStar, qaText,
} from './qa-kit';
import { qaBridge } from './qa-kit-b';
import { qaGlints, qaSkyline } from './qa-kit-c';
import type { LessonArtSet, SceneArt } from './types';

/* ── the glass wall and the city behind it ─────────────────────────────────────────────────────── */

const SILL_Y = 43;
const MULLIONS = [0, 56, 78] as const;

/** A mullion: a slim frame, lit on its left. */
const mullion: PixelSprite = { id: 'qa19-mullion', name: 'qa19-mullion', tags: ['scene', 'qa19'], rows: Array.from({ length: SILL_Y }, () => 'XD') };
const header: PixelSprite = { id: 'qa19-header', name: 'qa19-header', tags: ['scene', 'qa19'], rows: ['D'.repeat(80), 'X'.repeat(80)] };
const sill: PixelSprite = { id: 'qa19-sill', name: 'qa19-sill', tags: ['scene', 'qa19'], rows: ['x'.repeat(80), 'X'.repeat(80), 'D'.repeat(80)] };

/** Low towers under the chart, one tall tower with a mast in the right-hand pane. */
const TOWERS = [
  [2, 34, 8], [9, 31, 7], [16, 36, 9], [25, 32, 8], [33, 35, 7], [40, 31, 9], [49, 34, 8], [58, 26, 8], [61, 12, 10], [71, 22, 8],
] as const;
const city = qaSkyline('qa19-city', 80, SILL_Y, TOWERS, 19);
const MAST = { x: 66, top: 6 } as const;

/** The pilot's crescent moon, small, over the city. */
const moon: PixelSprite = { id: 'qa19-moon', name: 'qa19-moon', tags: ['scene', 'qa19'], rows: ['.yyy', 'yy..', 'yG..', 'yG..', '.yyy'] };

const STARS = [[8, 2], [30, 3], [47, 2], [72, 16]] as const;
const dimStar: PixelSprite = { id: 'qa19-star-dim', name: 'qa19-star-dim', tags: ['scene', 'qa19'], rows: ['x'] };

/* ── the chart in marker: the backtest, the go-live line, the live record ──────────────────────── */

const ORIGIN = { x: 5, y: 30 } as const;
const LIVE_X = 39;
const START = [ORIGIN.x + 1, 28] as const;
const PEAK = [LIVE_X, 11] as const;
const NOW = [53, 23] as const;

/** In-sample: a near-perfect climb. Out-of-sample: the same strategy, live, giving it back. */
const BACKTEST = qaBridge(7, START, PEAK, { step: 2, jitter: 0.6, top: 10, bottom: 29 });
const LIVE = qaBridge(31, PEAK, NOW, { step: 2, jitter: 1.9, top: 10, bottom: 29 });

const chart: PixelSprite[] = [
  qaPath('qa19-y-axis', 80, 60, [[ORIGIN.x, 4], [ORIGIN.x, ORIGIN.y]], 'x'),
  qaPath('qa19-x-axis', 80, 60, [[ORIGIN.x, ORIGIN.y], [54, ORIGIN.y]], 'x'),
  qaPath('qa19-go-live', 80, 60, [[LIVE_X, 4], [LIVE_X, ORIGIN.y - 1]], 'y', [2, 1]),
  qaPath('qa19-backtest', 80, 60, BACKTEST, 'N'),
  qaPath('qa19-live', 80, 60, LIVE, 'R'),
];

/* ── the quant, drawing ────────────────────────────────────────────────────────────────────────── */

/** The marker in the quant's raised hand, its gold tip on the go-live line. */
const marker: PixelSprite = { id: 'qa19-marker', name: 'qa19-marker', tags: ['scene', 'qa19'], rows: ['y.', '.D'] };
const HAND = { x: LIVE_X + 1, y: 26 } as const;
const QUANT_AT = { x: HAND.x - QA_REACH_HAND.x, y: HAND.y - QA_REACH_HAND.y } as const;

/** The polished floor gives back a little of the city: a few long faint streaks. */
const reflections: PixelSprite = {
  id: 'qa19-reflections',
  name: 'qa19-reflections',
  tags: ['scene', 'qa19'],
  rows: [
    '..kkkkkk...kkkkk......kkkkkkk..kkkk.....kkkkkkkk..kkkkk.......kkkkkkkkkk..kkkkk.',
    '................................................................................',
    '.....kkkk.......kkkkk.........kkkk..........kkkk..............kkkkkk............',
  ],
};

const base = qaCompose('qa19-opener-base', 80, 60, [
  { sprite: qaRoom, x: 0, y: 0 },
  { sprite: qaRect('qa19-night', 80, SILL_Y, 'K'), x: 0, y: 0 },
  ...STARS.map(([x, y]) => ({ sprite: dimStar, x, y })),
  { sprite: moon, x: 72, y: 4 },
  { sprite: city, x: 0, y: 0 },
  { sprite: qaRect('qa19-mast', 1, 12 - MAST.top, 'D'), x: MAST.x, y: MAST.top },
  ...chart.map((sprite) => ({ sprite, x: 0, y: 0 })),
  { sprite: qaText('qa19-backtest-label', 'BACKTEST', 'N'), x: 7, y: 4 },
  { sprite: qaText('qa19-live-label', 'LIVE', 'R'), x: LIVE_X + 2, y: 4 },
  { sprite: header, x: 0, y: 0 },
  ...MULLIONS.map((x) => ({ sprite: mullion, x, y: 0 })),
  { sprite: sill, x: 0, y: SILL_Y },
  { sprite: reflections, x: 0, y: 49 },
  { sprite: qaQuantReaching, x: QUANT_AT.x, y: QUANT_AT.y },
  { sprite: marker, x: HAND.x - 1, y: HAND.y - 2 },
]);

export const qa19Opener: SceneArt = {
  id: 'qa19-opener',
  label: 'At night in an office with a glass wall onto the city, a quant draws on the glass in marker: a backtest climbing smooth and green up to a dashed line, then the same strategy live, stumbling in red.',
  width: 80,
  height: 60,
  base,
  layers: [
    ...qaGlints([[5, 39], [12, 36], [21, 41], [47, 36], [64, 20], [66, 32], [74, 27]]),
    { sprite: { id: 'qa19-warning', name: 'qa19-warning', tags: ['scene', 'qa19'], rows: ['R'] }, x: MAST.x, y: MAST.top - 1, motion: { kind: 'twinkle', periodMs: 1400, min: 0.15 } },
    { sprite: { id: 'qa19-now', name: 'qa19-now', tags: ['scene', 'qa19'], rows: ['WW', 'WW'] }, x: NOW[0], y: NOW[1] - 1, motion: { kind: 'twinkle', periodMs: 1100, phase: 0.3, min: 0.2 } },
    { sprite: { id: 'qa19-tip', name: 'qa19-tip', tags: ['scene', 'qa19'], rows: ['W'] }, x: HAND.x - 1, y: HAND.y - 2, motion: { kind: 'twinkle', periodMs: 800, phase: 0.6, min: 0.1 } },
    { sprite: qaStar, x: 21, y: 2, motion: { kind: 'twinkle', periodMs: 2300, min: 0.2 } },
    { sprite: qaStar, x: 52, y: 6, motion: { kind: 'twinkle', periodMs: 1900, phase: 0.5, min: 0.2 } },
  ],
};

/**
 * Lesson 19's emblem: the opener's chart in small. A line climbs to a dashed white go-live line, then
 * falls away past it: the backtest, and the same strategy live.
 */
const emblemBacktestLive: PixelSprite = {
  id: 'qa19-emblem-backtest-live',
  name: 'qa19-emblem-backtest-live',
  tags: ['scene', 'qa19'],
  rows: [
    '............',
    '.......w....',
    '............',
    '......OOw...',
    '.....OOyOO..',
    '....OOy.wOO.',
    '...OOy....OO',
    '..OOy...w..y',
    '.OOy........',
    'OOy.....w...',
    'Oy..........',
    '............',
  ],
};

export const qa19Finish: SceneArt = qaKeepsake(
  'qa19-finish',
  'A gold medallion hanging from a purple ribbon, embossed with a line that climbs to a dashed go-live line and then falls away past it, with small sparkles around it.',
  emblemBacktestLive,
);

export const art: LessonArtSet = { opener: qa19Opener, backdrop: qaBackdrop, finish: qa19Finish };
