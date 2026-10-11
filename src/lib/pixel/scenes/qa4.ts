/**
 * Quantitative Analysis lesson 4, Portfolio Optimization & Markowitz: the efficient frontier on the
 * meeting-room whiteboard.
 *
 * Drawn in marker on the board: risk (σ) against return (μ), the frontier's bullet (the efficient
 * upper branch solid orchid, the inefficient lower branch dashed), a cloud of single-asset and mixed
 * portfolios inside it, and the capital market line in gold from the risk-free rate to the star at
 * the tangent portfolio, where the quant's pointer rests. A framed pie of the optimal allocation
 * hangs on the wall, an empty chair waits. Only small layers move: the star glints, the pointer
 * taps it, a few portfolios blink, the pie's gold slice catches the light.
 * Keepsake: the frontier with its optimal point.
 */
import type { PixelSprite } from '../types';
import { qaBackdrop } from './qa-backdrop';
import {
  QA_PALETTE, QA_REACH_HAND, qaCompose, qaKeepsake, qaPath, qaQuantReaching, qaQuantSeated, qaRect, qaRoom, qaText,
  qaWhiteboard,
} from './qa-kit';
import type { LessonArtSet, SceneArt } from './types';

/* ── the chart ─────────────────────────────────────────────────────────────────────────────────── */

/** The origin of the chart's axes, the risk-free rate on the μ axis, the tangent portfolio. */
const ORIGIN = { x: 27, y: 30 } as const;
const RISK_FREE = { x: 27, y: 23 } as const;
const TANGENT = { x: 44, y: 11 } as const;

const axes = qaPath('qa4-axes', 49, 25, [[0, 0], [0, 24], [48, 24]], 'K');

/** The bullet: efficient upper branch, the minimum-variance nose at (35, 20), the lower branch. */
const UPPER: [number, number][] = [[35, 20], [36, 17], [38, 15], [41, 13], [44, 11], [48, 9], [53, 7], [60, 5], [68, 4]];
const LOWER: [number, number][] = [[35, 20], [36, 23], [38, 25], [42, 27], [48, 28], [56, 29]];
const shift = (pts: [number, number][], dx: number, dy: number) => pts.map(([x, y]) => [x - dx, y - dy] as [number, number]);

const frontier = qaPath('qa4-frontier', 80, 60, UPPER, 'p');
const frontierInk = qaPath('qa4-frontier-ink', 80, 60, shift(UPPER, 0, -1), 'E');
const lowerBranch = qaPath('qa4-lower', 80, 60, LOWER, 'p', [2, 2]);
const marketLine = qaPath('qa4-cml', 80, 60, [[RISK_FREE.x, RISK_FREE.y], [TANGENT.x, TANGENT.y], [54, 4]], 'O', [3, 1]);

/** Portfolios the frontier dominates: the cloud inside the bullet. */
const CLOUD: [number, number][] = [
  [40, 19], [43, 16], [46, 21], [51, 18], [54, 12], [58, 16], [61, 10], [62, 20], [65, 14], [47, 25], [52, 26],
];
/** Two more portfolios, drawn only as blinking layers (a base copy under them would hide the blink). */
const BLINKING: [number, number][] = [[49, 14], [55, 23]];
const dot: PixelSprite = { id: 'qa4-dot', name: 'qa4-dot', tags: ['scene', 'qa4'], rows: ['b'] };
const cloud: PixelSprite = {
  id: 'qa4-cloud',
  name: 'qa4-cloud',
  tags: ['scene', 'qa4'],
  rows: Array.from({ length: 60 }, (_, y) => [...Array(80)].map((_, x) => (CLOUD.some(([cx, cy]) => cx === x && cy === y) ? 'b' : '.')).join('')),
};

const star: PixelSprite = {
  id: 'qa4-star',
  name: 'qa4-star',
  tags: ['scene', 'qa4'],
  blurb: 'The tangent portfolio: a gold star that swells and glints.',
  rows: ['..O..', '.OGO.', 'OGyGO', '.OGO.', '..O..'],
  frames: [
    ['..O..', '.OGO.', 'OGyGO', '.OGO.', '..O..'],
    ['..O..', '.OyO.', 'OyWyO', '.OyO.', '..O..'],
    ['..O..', '.OGO.', 'OGyGO', '.OGO.', '..O..'],
    ['..O..', '.OGO.', 'OGGGO', '.OGO.', '..O..'],
  ],
  frameMs: 420,
};

/* ── the pie of the optimal allocation, framed on the wall ─────────────────────────────────────── */

/** Clockwise from twelve: US equity, international, bonds, real assets, cash. */
const SLICES: [number, string][] = [[126, 'P'], [198, 'T'], [288, 'B'], [331, 'G'], [360, 'X']];

function pie(radius: number): string[] {
  const size = radius * 2 + 1;
  return [...Array(size)].map((_, y) => [...Array(size)].map((_, x) => {
    const dx = x - radius;
    const dy = y - radius;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d > radius + 0.4) return '.';
    if (d > radius - 0.6) return 'D';
    const angle = (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360;
    return (SLICES.find(([end]) => angle < end) ?? SLICES[0])[1];
  }).join(''));
}

const PIE_RADIUS = 6;

const poster: PixelSprite = {
  id: 'qa4-poster',
  name: 'qa4-poster',
  tags: ['scene', 'qa4'],
  blurb: 'A framed print of the optimal portfolio, as a pie.',
  rows: [
    'DDDDDDDDDDDDDDDDD',
    ...[...Array(17)].map(() => 'DXxxxxxxxxxxxxxxD'),
    'DDDDDDDDDDDDDDDDD',
  ],
};

/** The gold slice's glint, laid on the pie. */
const sliceGlint: PixelSprite = { id: 'qa4-slice-glint', name: 'qa4-slice-glint', tags: ['scene', 'qa4'], rows: ['y'] };

/** The chair from the seated quant's sprite, with nobody in it. */
const emptyChair: PixelSprite = { ...qaQuantSeated, id: 'qa4-empty-chair', name: 'qa4-empty-chair', rows: qaQuantSeated.rows.slice(11) };

/* ── the scene ─────────────────────────────────────────────────────────────────────────────────── */

/** The quant stands in front of the board, so the pointer rises straight up to the star and never
 * runs along the market line, which reaches the same star on a slant. */
const QUANT_AT = { x: TANGENT.x - QA_REACH_HAND.x - 1, y: 26 } as const;
const HAND = { x: QUANT_AT.x + QA_REACH_HAND.x, y: QUANT_AT.y + QA_REACH_HAND.y };

/** The pointer, from the raised hand up to just short of the star. */
const pointer = qaPath('qa4-pointer', 80, 60, [[TANGENT.x, HAND.y - 1], [TANGENT.x, TANGENT.y + 4]], 'D');

const bookshelf: PixelSprite = {
  id: 'qa4-bookshelf',
  name: 'qa4-bookshelf',
  tags: ['scene', 'qa4'],
  blurb: 'A low bookshelf of finance texts.',
  palette: QA_PALETTE,
  rows: [
    'OOOOOOOOOOOOOOOO',
    'Og............gO',
    'OgPqTBBGx.RrPQgO',
    'OgPqTbBGx.RrPqgO',
    'OgPqTbBGxXRrPqgO',
    'OgPpTbBgxXrrPpgO',
    'OOOOOOOOOOOOOOOO',
    'Og............gO',
    'OgBbGGwxTtPpRRgO',
    'OgBbGgwxTtPpRrgO',
    'OgBbGgwxTtPpRrgO',
    'OgbbggxXttppRrgO',
    'OOOOOOOOOOOOOOOO',
    'Og............gO',
    'OO............OO',
    'ZZZZZZZZZZZZZZZZ',
  ],
};

const base = qaCompose('qa4-opener-base', 80, 60, [
  { sprite: qaRoom, x: 0, y: 0 },
  { sprite: poster, x: 1, y: 3 },
  { sprite: { id: 'qa4-pie', name: 'qa4-pie', tags: ['scene', 'qa4'], rows: pie(PIE_RADIUS) }, x: 3, y: 6 },
  { sprite: qaWhiteboard('qa4-board', 58, 38), x: 20, y: 2 },
  { sprite: qaText('qa4-mu', 'μ', 'K'), x: 23, y: 5 },
  { sprite: qaText('qa4-sigma', 'σ', 'K'), x: 69, y: 31 },
  { sprite: axes, x: ORIGIN.x, y: ORIGIN.y - 24 },
  { sprite: cloud, x: 0, y: 0 },
  { sprite: lowerBranch, x: 0, y: 0 },
  { sprite: marketLine, x: 0, y: 0 },
  { sprite: frontierInk, x: 0, y: 0 },
  { sprite: frontier, x: 0, y: 0 },
  // The risk-free rate, ticked on the μ axis.
  { sprite: qaRect('qa4-rf', 2, 1, 'O'), x: RISK_FREE.x - 1, y: RISK_FREE.y },
  // Markers and an eraser on the tray.
  { sprite: { id: 'qa4-tray', name: 'qa4-tray', tags: ['scene', 'qa4'], rows: ['.....XXXXX', 'pp.nn.DDDD'] }, x: 47, y: 36 },
  { sprite: bookshelf, x: 3, y: 39 },
  { sprite: emptyChair, x: 58, y: 36 },
  { sprite: qaQuantReaching, x: QUANT_AT.x, y: QUANT_AT.y },
  { sprite: pointer, x: 0, y: 0 },
]);

const tip: PixelSprite = { id: 'qa4-pointer-tip', name: 'qa4-pointer-tip', tags: ['scene', 'qa4'], rows: ['K', 'D'] };

export const qa4Opener: SceneArt = {
  id: 'qa4-opener',
  label: 'A quant points at a gold star on a whiteboard chart of the efficient frontier, where the capital market line touches the curve above a cloud of portfolios, beside a framed pie chart.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: star, x: TANGENT.x - 2, y: TANGENT.y - 2, motion: { kind: 'twinkle', periodMs: 2000, min: 0.75 } },
    { sprite: tip, x: TANGENT.x, y: TANGENT.y + 3, motion: { kind: 'bob', amp: 1, periodMs: 900 } },
    { sprite: dot, x: BLINKING[0][0], y: BLINKING[0][1], motion: { kind: 'twinkle', periodMs: 1300, phase: 0.6, min: 0.1 } },
    { sprite: dot, x: BLINKING[1][0], y: BLINKING[1][1], motion: { kind: 'twinkle', periodMs: 1700, phase: 0.1, min: 0.1 } },
    { sprite: sliceGlint, x: 5, y: 9, motion: { kind: 'twinkle', periodMs: 2300, phase: 0.5, min: 0.2 } },
  ],
};

/** Lesson 4's emblem: the efficient frontier rising and levelling off on two axes, a white star at its optimum. */
const emblemFrontier: PixelSprite = {
  id: 'qa4-emblem-frontier',
  name: 'qa4-emblem-frontier',
  tags: ['scene', 'qa4'],
  rows: [
    '............',
    '.O..........',
    '.Oy.....OOO.',
    '.Oy..wOOyyy.',
    '.Oy.wWwy....',
    '.Oy.OwO.....',
    '.Oy.Oy......',
    '.Oy.Oy......',
    '.Oy.Oy......',
    '.Oy.Oy......',
    '.OOOOOOOOOO.',
    '..yyyyyyyyy.',
  ],
};

export const qa4Finish: SceneArt = qaKeepsake(
  'qa4-finish',
  'A gold medallion hanging from a purple ribbon, embossed with the efficient frontier curve and a star at its optimal point, with small sparkles around it.',
  emblemFrontier,
);

export const art: LessonArtSet = { opener: qa4Opener, backdrop: qaBackdrop, finish: qa4Finish };
