/**
 * Quantitative Analysis lesson 6, Monte Carlo Methods in Finance: the simulation in the server room.
 *
 * A wide screen over the racks shows simulated price paths fanning out from today's price, coloured
 * by where they end (green the best, gold the median, red the worst), the histogram of where they
 * ended lying on its side at the right, and a dashed red line at the 5% Value at Risk. The quant
 * stands in the cold aisle watching it run. Only small layers move: one more path draws itself
 * across the fan, the four racks' lights blink out of step, the VaR label pulses.
 * Keepsake: a fan of paths from one point.
 */
import type { PixelSprite } from '../types';
import { qaBackdrop } from './qa-backdrop';
import { qaCompose, qaKeepsake, qaLater, qaPath, qaQuantStanding, qaRack, qaRackLights, qaRoom, qaScreen, qaText } from './qa-kit';
import type { QaStamp } from './qa-kit';
import type { LessonArtSet, SceneArt } from './types';

/* ── the simulation ────────────────────────────────────────────────────────────────────────────── */

const SCREEN = { x: 2, y: 1, width: 76, height: 25 } as const;
const START = { x: 7, y: 13 } as const;
const END_X = 58;
const STEP = 3;

/** A small seeded generator, so the fan is the same picture on every build. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * One simulated path from START to (END_X, endY): a random walk pinned at both ends (a Brownian
 * bridge), so the fan's spread grows with time the way a simulation's does and every path still
 * lands where its colour says it does.
 */
function simulatedPath(seed: number, endY: number): [number, number][] {
  const rand = mulberry32(seed);
  const steps = Math.round((END_X - START.x) / STEP);
  let walk = 0;
  const raw = [0];
  for (let i = 1; i <= steps; i += 1) {
    walk += (rand() - 0.5) * 1.7;
    raw.push(walk);
  }
  return raw.map((w, i) => {
    const t = i / steps;
    const y = START.y + (endY - START.y) * t + (w - raw[steps] * t);
    return [Math.min(END_X, START.x + i * STEP), Math.max(3, Math.min(23, Math.round(y)))];
  });
}

/** Where each path ends and its colour: drawn middle first, so the coloured tails sit on top. */
const PATHS: [number, number, string][] = [
  [11, 10, 'X'], [24, 16, 'X'], [33, 19, 'r'], [42, 7, 'n'], [57, 22, 'R'], [64, 4, 'N'], [97, 13, 'y'],
];

const fan: QaStamp[] = PATHS.map(([seed, endY, ch]) => ({
  sprite: qaPath(`qa6-path-${String(seed)}`, 80, 60, simulatedPath(seed, endY), ch),
  x: 0,
  y: 0,
}));

/** The ending values' histogram on its side: one bar per row, coloured as the paths that end there. */
const HISTOGRAM: [number, number, string][] = [
  [4, 1, 'N'], [5, 2, 'N'], [6, 2, 'N'], [7, 3, 'n'], [8, 4, 'n'], [9, 5, 'x'], [10, 6, 'x'], [11, 7, 'x'],
  [12, 8, 'x'], [13, 9, 'y'], [14, 8, 'x'], [15, 7, 'x'], [16, 6, 'x'], [17, 5, 'x'], [18, 4, 'r'],
  [19, 3, 'r'], [20, 2, 'R'], [21, 2, 'R'], [22, 1, 'R'],
];
const histogram: PixelSprite = {
  id: 'qa6-histogram',
  name: 'qa6-histogram',
  tags: ['scene', 'qa6'],
  rows: Array.from({ length: 24 }, (_, y) => {
    const bar = HISTOGRAM.find(([row]) => row === y);
    return bar ? bar[2].repeat(bar[1]).padEnd(10, '.') : '..........';
  }),
};

const varLine = qaPath('qa6-var', 80, 60, [[19, 20], [END_X, 20]], 'R', [2, 2]);

/** One more path, drawn a stretch at a time; its still is the finished path. */
const LIVE = simulatedPath(123, 9);
/** The live path's box, fitted to it: a framed layer must stay within 1024 pixels. */
const LIVE_TOP = Math.min(...LIVE.map(([, y]) => y));
const LIVE_BOX = {
  x: START.x,
  y: LIVE_TOP,
  width: END_X - START.x + 1,
  height: Math.max(...LIVE.map(([, y]) => y)) - LIVE_TOP + 1,
} as const;

function liveFrame(count: number): string[] {
  const points = LIVE.slice(0, count).map(([x, y]) => [x - LIVE_BOX.x, y - LIVE_BOX.y] as [number, number]);
  return qaPath('qa6-live', LIVE_BOX.width, LIVE_BOX.height, points, 'W').rows;
}

const liveDraw: PixelSprite = {
  id: 'qa6-live',
  name: 'qa6-live',
  tags: ['scene', 'qa6'],
  blurb: 'A new simulated path drawing itself across the fan.',
  rows: liveFrame(LIVE.length),
  frames: [1, 4, 7, 10, 13, 16, LIVE.length, LIVE.length].map(liveFrame),
  frameMs: 320,
};

/* ── the room ──────────────────────────────────────────────────────────────────────────────────── */

/** A raised data-centre floor: tile seams on the dark floor. */
const tiles: PixelSprite = {
  id: 'qa6-tiles',
  name: 'qa6-tiles',
  tags: ['scene', 'qa6'],
  rows: Array.from({ length: 13 }, (_, r) => (r === 3 || r === 9 ? 'k'.repeat(80) : [...Array(80)].map((_, x) => (x % 10 === 4 ? 'k' : '.')).join(''))),
};

const RACKS = [0, 10, 59, 69] as const;

const base = qaCompose('qa6-opener-base', 80, 60, [
  { sprite: qaRoom, x: 0, y: 0 },
  { sprite: tiles, x: 0, y: 47 },
  { sprite: qaScreen('qa6-screen', SCREEN.width, SCREEN.height, { surface: 'K' }), x: SCREEN.x, y: SCREEN.y },
  ...fan,
  { sprite: histogram, x: 63, y: 0 },
  // Today's price, where every path starts.
  { sprite: { id: 'qa6-start', name: 'qa6-start', tags: ['scene', 'qa6'], rows: ['WW', 'WW'] }, x: START.x - 1, y: START.y - 1 },
  { sprite: varLine, x: 0, y: 0 },
  ...RACKS.map((x) => ({ sprite: qaRack, x, y: 26 })),
  { sprite: qaQuantStanding, x: 33, y: 26 },
]);

const lights = [
  qaRackLights,
  qaLater(qaRackLights, 'qa6-rack-lights-b', 1, 610),
  qaLater(qaRackLights, 'qa6-rack-lights-c', 2, 470),
  qaLater(qaRackLights, 'qa6-rack-lights-d', 3, 560),
];

export const qa6Opener: SceneArt = {
  id: 'qa6-opener',
  label: 'In a server room a quant watches a wide screen of simulated price paths fanning out from one point, green at the top, gold in the middle and red at the bottom, with a histogram of outcomes and a dashed Value at Risk line.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: liveDraw, x: LIVE_BOX.x, y: LIVE_BOX.y },
    ...RACKS.map((x, i) => ({ sprite: lights[i], x: x + 7, y: 28 })),
    // The label lives only in this layer: a copy in the base would show through and hide the pulse.
    { sprite: qaText('qa6-var-label', 'VaR', 'R'), x: 6, y: 18, motion: { kind: 'twinkle', periodMs: 1600, min: 0.35 } },
  ],
};

/** Lesson 6's emblem: paths fanning out from one starting point. */
const emblemFan: PixelSprite = {
  id: 'qa6-emblem-fan',
  name: 'qa6-emblem-fan',
  tags: ['scene', 'qa6'],
  rows: [
    '............',
    '.........OOy',
    '.......OOy..',
    '.....OOy.OOy',
    '...OOy.OOy..',
    '.OOyOOy.....',
    'OOOOOOOOOOOy',
    '.OOyOOy.....',
    '...OOy.OOy..',
    '.....OOy.OOy',
    '.......OOy..',
    '.........Oy.',
  ],
};

export const qa6Finish: SceneArt = qaKeepsake(
  'qa6-finish',
  'A gold medallion hanging from a purple ribbon, embossed with a fan of paths spreading from one point, with small sparkles around it.',
  emblemFan,
);

export const art: LessonArtSet = { opener: qa6Opener, backdrop: qaBackdrop, finish: qa6Finish };
