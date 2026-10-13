/**
 * Quantitative Analysis lesson 12, Volatility Modeling & GARCH: a rooftop in a thunderstorm.
 *
 * Volatility is weather: calm, then a storm, then calm again. On the roof a billboard shows a
 * return series doing exactly that: small green and red bars, then a cluster of big ones (the
 * Volmageddon kind), then a slow decay, with GARCH's estimate of sigma in gold hugging the bars, up
 * fast when the shocks land and down slowly after. The quant watches from under an umbrella while
 * lightning splits the sky over the skyline. Only small layers move: the rain falls, the lightning
 * flashes, a white tick blinks on today's return, the mast's warning light blinks, a puddle ripples.
 * Keepsake: a lightning bolt, the spike.
 */
import type { PixelSprite } from '../types';
import { qaBackdrop } from './qa-backdrop';
import {
  QA_PALETTE, qaCompose, qaKeepsake, qaPath, qaQuantReaching, qaRect, qaRoom, qaScreen, qaText,
} from './qa-kit';
import type { QaStamp } from './qa-kit';
import type { LessonArtSet, SceneArt } from './types';

/* ── the sky and the skyline ───────────────────────────────────────────────────────────────────── */

/** The storm's cloud deck, lit from below at its lower edge by the city. */
const clouds: PixelSprite = {
  id: 'qa12-clouds',
  name: 'qa12-clouds',
  tags: ['scene', 'qa12'],
  rows: [
    'k'.repeat(80),
    'k'.repeat(80),
    'kkkkkkkkkkkkkkkkkkDDkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkDDDkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkDDkkkkkkkDXXDkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkDXXXDkkkkkkkkkkkkDDkkkkkkkkkk',
    'kkkkkkkDXXDDkkkkDX..XDDkkkkkkkkkkkkkkkkkkkkkkkkkkkDDX...XDDkkkkkkkkDDXXDDkkkkkkkk',
    'kkkDDDDX..XXDDDDX.....XDDkkkkkkkkkkkkkkkkkkkkkkkDDX.......XDkkkkkkDX....XDDDkkkkk',
    'DDDX.............................................................................',
    'X................................................................................',
  ].map((row) => row.padEnd(80, '.').slice(0, 80)),
};

/** Distant towers: [x, top, width], each with a few lit windows. */
const TOWERS = [[0, 33, 10], [12, 30, 9], [24, 35, 11], [36, 31, 10], [46, 24, 8], [55, 18, 7], [62, 28, 8], [70, 13, 10]] as const;

function tower(id: string, width: number, height: number, seed: number): PixelSprite {
  return {
    id,
    name: id,
    tags: ['scene', 'qa12'],
    rows: Array.from({ length: height }, (_, y) => [...Array(width)].map((_, x) => {
      if (y % 3 !== 1 || x % 2 !== 1 || x === width - 1) return 'k';
      const lit = (x * 7 + y * 13 + seed) % 5;
      return lit === 0 ? 'y' : lit < 3 ? 'g' : 'k';
    }).join('')),
  };
}

const PARAPET_Y = 42;
const towers: QaStamp[] = TOWERS.map(([x, top, width], i) => ({ sprite: tower(`qa12-tower-${String(i)}`, width, PARAPET_Y - top, i * 3), x, y: top }));

/** The mast on the tallest tower, its warning light on top. */
const MAST = { x: 76, top: 5 } as const;

/* ── the billboard: returns that cluster, and GARCH's sigma ────────────────────────────────────── */

const BOARD = { x: 2, y: 5, width: 46, height: 26 } as const;
const ZERO = BOARD.y + 13;
const BAR_X = (i: number) => BOARD.x + 4 + i * 2;

/** The daily returns, in pixels: calm (under the label), then the storm, then the decay, the last of
 * them today's. Up is green, down red. */
const RETURNS = [1, -1, 1, 1, -1, 1, -1, 1, -1, 6, -8, 9, -7, 8, -6, -4, 3, -3, 2, -2] as const;
/** GARCH's sigma for each day: the first shock breaks out of the calm band, sigma jumps the day after,
 * and decays slowly after the last, still above the calm band today. */
const SIGMA = [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 9, 10, 10, 9, 9, 7, 5, 4, 4, 4] as const;

const bars: QaStamp[] = RETURNS.map((r, i) => ({
  sprite: qaRect(`qa12-bar-${String(i)}`, 1, Math.abs(r), r > 0 ? 'N' : 'R'),
  x: BAR_X(i),
  y: r > 0 ? ZERO - r : ZERO + 1,
}));

const band: QaStamp[] = [-1, 1].map((sign) => ({
  sprite: qaPath(`qa12-sigma-${String(sign)}`, 80, 60, SIGMA.map((s, i) => [BAR_X(i), ZERO + sign * s] as [number, number]), sign < 0 ? 'y' : 'G'),
  x: 0,
  y: 0,
}));

/** Today's return is the last bar, drawn with the rest; only a white tick at its end blinks, so the
 * value itself never changes. */
const TODAY = RETURNS.length - 1;
/** A bar's end pixel is ZERO - r either way: the top of an up bar, the bottom of a down one. */
const TODAY_TIP = { x: BAR_X(TODAY), y: ZERO - RETURNS[TODAY] } as const;
const todayTick: PixelSprite = { id: 'qa12-today', name: 'qa12-today', tags: ['scene', 'qa12'], rows: ['W'] };

const legs: PixelSprite = {
  id: 'qa12-legs',
  name: 'qa12-legs',
  tags: ['scene', 'qa12'],
  blurb: "The billboard's steel frame: two posts and a cross brace down to the parapet.",
  rows: qaCompose('qa12-legs-draw', 34, PARAPET_Y - BOARD.y - BOARD.height, [
    { sprite: qaPath('qa12-brace-a', 34, 11, [[2, 0], [31, 10]], 'D'), x: 0, y: 0 },
    { sprite: qaPath('qa12-brace-b', 34, 11, [[31, 0], [2, 10]], 'D'), x: 0, y: 0 },
    { sprite: qaRect('qa12-post-a', 2, 11, 'X'), x: 0, y: 0 },
    { sprite: qaRect('qa12-post-b', 2, 11, 'X'), x: 32, y: 0 },
  ]).rows,
};

/* ── the roof ──────────────────────────────────────────────────────────────────────────────────── */

const parapet: PixelSprite = {
  id: 'qa12-parapet',
  name: 'qa12-parapet',
  tags: ['scene', 'qa12'],
  rows: ['x'.repeat(80), 'X'.repeat(80), 'D'.repeat(80), 'D'.repeat(80), 'D'.repeat(80)],
};

const puddle: PixelSprite = {
  id: 'qa12-puddle',
  name: 'qa12-puddle',
  tags: ['scene', 'qa12'],
  blurb: "A rain puddle on the roof catching the billboard's glow.",
  rows: ['...DDDDDDDDDD...', '.DDkkbbkkbBbkDD.', '...DDDDDDDDDD...'],
};

const ripple: PixelSprite = {
  id: 'qa12-ripple',
  name: 'qa12-ripple',
  tags: ['scene', 'qa12'],
  rows: ['.....', '..x..', '.....'],
  frames: [['.....', '..x..', '.....'], ['..x..', '.x.x.', '..x..'], ['.x.x.', 'x...x', '.x.x.'], ['.....', '.....', '.....']],
  frameMs: 280,
};

/* ── the quant under an umbrella ───────────────────────────────────────────────────────────────── */

const canopy: PixelSprite = {
  id: 'qa12-canopy',
  name: 'qa12-canopy',
  tags: ['scene', 'qa12'],
  blurb: 'A teal umbrella from behind and below: six panels, lit on the left, scalloped at the rim.',
  rows: [
    '..........DD..........',
    '........DDTTDD........',
    '......DDTTTTTtDD......',
    '....DDTTTtTTTTttDD....',
    '...DTTTTtTTTtTTtttD...',
    '..DTTTTtTTTTtTTTtttD..',
    '.DTTTTtTTTTTtTTTttttD.',
    'DTTTTtTTTTTTtTTTtttttD',
    'DtDDtDDtDDtDDtDDtDDttD',
    '.D..D..D..D..D..D..D..',
  ],
};

/** The canopy over the raised hand, the shaft between them; the quant is qaQuantReaching. */
const QUANT_AT = { x: 50, y: 29 } as const;
const HAND = { x: QUANT_AT.x + 15, y: QUANT_AT.y } as const;
const CANOPY_AT = { x: HAND.x - 10, y: HAND.y - 13 } as const;

/* ── the storm ─────────────────────────────────────────────────────────────────────────────────── */

const bolt: PixelSprite = {
  id: 'qa12-bolt',
  name: 'qa12-bolt',
  tags: ['scene', 'qa12'],
  blurb: 'A forked lightning bolt from the cloud deck.',
  rows: [
    '....Wy..',
    '...Wy...',
    '..Wy....',
    '..WWWy..',
    '....Wy..',
    '...Wy...',
    '..Wy.y..',
    '.Wy...y.',
    '.Wy.....',
    'Wy......',
  ],
};

/** Rain: streaks falling down and left, three rows a frame, over a 32-pixel square. */
const DROPS = [[3, 1], [11, 5], [19, 2], [27, 7], [7, 13], [15, 17], [23, 11], [30, 19], [2, 24], [12, 27], [21, 23], [28, 29]] as const;
function rain(step: number): string[] {
  const rows = Array.from({ length: 32 }, () => new Array<string>(32).fill('.'));
  for (const [x, y] of DROPS) {
    for (let k = 0; k < 2; k += 1) {
      const py = (y + step * 3 + k) % 32;
      const px = (x - Math.floor((y + step * 3 + k) / 3) + 64) % 32;
      rows[py][px] = k === 0 ? 'X' : 'x';
    }
  }
  return rows.map((row) => row.join(''));
}
const rainSheet: PixelSprite = {
  id: 'qa12-rain',
  name: 'qa12-rain',
  tags: ['scene', 'qa12'],
  rows: rain(0),
  frames: [0, 1, 2, 3].map(rain),
  frameMs: 140,
};
const rainLater: PixelSprite = { ...rainSheet, id: 'qa12-rain-b', name: 'qa12-rain-b', frames: [2, 3, 0, 1].map(rain), frameMs: 160 };

const base = qaCompose('qa12-opener-base', 80, 60, [
  { sprite: qaRoom, x: 0, y: 0 },
  { sprite: { ...qaRect('qa12-sky', 80, PARAPET_Y, 'K'), palette: QA_PALETTE }, x: 0, y: 0 },
  { sprite: clouds, x: 0, y: 0 },
  ...towers,
  { sprite: qaRect('qa12-mast', 1, 8, 'X'), x: MAST.x, y: MAST.top },
  { sprite: legs, x: BOARD.x + 6, y: BOARD.y + BOARD.height },
  { sprite: qaScreen('qa12-billboard', BOARD.width, BOARD.height, { surface: 'K' }), x: BOARD.x, y: BOARD.y },
  { sprite: qaPath('qa12-zero', 80, 60, [[BOARD.x + 3, ZERO], [BOARD.x + BOARD.width - 4, ZERO]], 'X', [1, 1]), x: 0, y: 0 },
  ...band,
  ...bars,
  { sprite: qaText('qa12-garch', 'GARCH', 'x'), x: BOARD.x + 3, y: BOARD.y + 3 },
  { sprite: parapet, x: 0, y: PARAPET_Y },
  { sprite: puddle, x: 16, y: 52 },
  { sprite: canopy, x: CANOPY_AT.x, y: CANOPY_AT.y },
  { sprite: qaRect('qa12-shaft', 1, 3, 'D'), x: HAND.x, y: HAND.y - 3 },
  { sprite: qaQuantReaching, x: QUANT_AT.x, y: QUANT_AT.y },
]);

export const qa12Opener: SceneArt = {
  id: 'qa12-opener',
  label: 'On a rooftop in a thunderstorm, a quant under an umbrella watches a billboard of daily returns that are calm, then burst into a cluster of big swings, then calm down, with a gold volatility band hugging them.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: rainSheet, x: 48, y: 6 },
    { sprite: rainLater, x: 0, y: 28 },
    { sprite: bolt, x: 49, y: 6, motion: { kind: 'twinkle', periodMs: 2600, min: 0 } },
    { sprite: todayTick, x: TODAY_TIP.x, y: TODAY_TIP.y, motion: { kind: 'twinkle', periodMs: 1000, min: 0.2 } },
    { sprite: { id: 'qa12-warning', name: 'qa12-warning', tags: ['scene', 'qa12'], rows: ['R'] }, x: MAST.x, y: MAST.top - 1, motion: { kind: 'twinkle', periodMs: 1200, min: 0.1 } },
    { sprite: ripple, x: 25, y: 51 },
  ],
};

/** Lesson 12's emblem: a lightning bolt, the spike in volatility. */
const emblemBolt: PixelSprite = {
  id: 'qa12-emblem-bolt',
  name: 'qa12-emblem-bolt',
  tags: ['scene', 'qa12'],
  rows: [
    '............',
    '......OOO...',
    '.....OOOy...',
    '....OOOy....',
    '...OOOy.....',
    '..OOOOOOOO..',
    '......OOOy..',
    '.....OOOy...',
    '....OOOy....',
    '...OOy......',
    '..OOy.......',
    '..y.........',
  ],
};

export const qa12Finish: SceneArt = qaKeepsake(
  'qa12-finish',
  'A gold medallion hanging from a purple ribbon, embossed with a lightning bolt, with small sparkles around it.',
  emblemBolt,
);

export const art: LessonArtSet = { opener: qa12Opener, backdrop: qaBackdrop, finish: qa12Finish };
