/**
 * Risk Management lesson 13 opener, Currency Risk & FX Hedging: closer in than any room so far, the
 * harbour office counter, with the keeper behind it. On the counter a brass balance weighs a heap of
 * gold coins against a heap of silver, and it will not settle: that tipping is the exchange rate, and
 * a cargo sold in one currency and paid for in another rides on it. Two small flags stand on the
 * counter, one for each money, and the map behind shows the crossing the cargo makes. Moving: the
 * balance, the flags, the ship on the map, coin glints.
 */
import type { PixelSprite } from '../types';
import { rmBackdrop } from './rm-backdrop';
import { rmCompose, rmKeepsake, rmWatchRoom } from './rm-kit';
import { rmGlint, rmKeeperRaise, rmMark, rmPlot } from './rm-kit-a';
import type { RmPoint } from './rm-kit-a';
import type { LessonArtSet, SceneArt } from './types';

/** A straight run of one letter from (x0, y0) to (x1, y1). */
function line(x0: number, y0: number, x1: number, y1: number, ch: string): RmPoint[] {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  return Array.from({ length: steps + 1 }, (_, i) => [
    Math.round(x0 + ((x1 - x0) * i) / steps),
    Math.round(y0 + ((y1 - y0) * i) / steps),
    ch,
  ] as const);
}

/** The heaps of coin on each pan: gold, and silver. 7x3. */
const GOLD_HEAP = ['..yGy..', '.yGGGg.', 'yGGyGGg'];
const SILVER_HEAP = ['..wxw..', '.wxxxX.', 'wxxwxxX'];

/**
 * One frame of the balance: the beam tipped `t` pixels (left end down for positive t) about its
 * pivot at (17.5, 4), and below each end three strings, a dish and its heap. 36x23, laid at (22, 10).
 */
function balanceFrame(t: number): string[] {
  const pts: RmPoint[] = [];
  for (let x = 5; x <= 30; x++) {
    const y = Math.round(4 + (t * (17.5 - x)) / 12.5);
    pts.push([x, y - 1, 'y'], [x, y, 'O']);
  }
  const pan = (ex: number, ey: number, heap: string[]) => {
    pts.push([ex, ey + 1, 'O'], ...line(ex, ey + 2, ex - 5, ey + 12, 'X'), ...line(ex, ey + 2, ex + 5, ey + 12, 'X'));
    heap.forEach((row, dy) => [...row].forEach((ch, dx) => { if (ch !== '.') pts.push([ex - 3 + dx, ey + 10 + dy, ch]); }));
    for (let dx = -5; dx <= 5; dx++) pts.push([ex + dx, ey + 13, Math.abs(dx) === 5 ? 'O' : 'G']);
    for (let dx = -4; dx <= 4; dx++) pts.push([ex + dx, ey + 14, Math.abs(dx) === 4 ? 'O' : 'g']);
    for (let dx = -2; dx <= 2; dx++) pts.push([ex + dx, ey + 15, 'O']);
  };
  pan(5, 4 + t, GOLD_HEAP);
  pan(30, 4 - t, SILVER_HEAP);
  pts.push([17, 3, 'y'], [18, 3, 'y'], [17, 4, 'G'], [18, 4, 'G']);
  return rmPlot(36, 23, pts);
}

/** The balance rocking: gold heavy, level, silver heavy, level. Framed, 36x23. */
const balance: PixelSprite = {
  id: 'rm13-opener-balance',
  name: 'balance',
  tags: ['scene', 'rm13'],
  rows: balanceFrame(2),
  frames: [balanceFrame(2), balanceFrame(1), balanceFrame(0), balanceFrame(-1), balanceFrame(-2), balanceFrame(-1), balanceFrame(0), balanceFrame(1)],
  frameMs: 300,
};

/** The balance's brass post and foot, standing on the counter top. 9x28. */
const post: PixelSprite = {
  id: 'rm13-opener-post',
  name: 'balance post',
  tags: ['scene', 'rm13'],
  rows: [
    '...OOO...',
    ...Array.from({ length: 23 }, () => '...OGO...'),
    '..OGyGO..',
    '.OGGGGgO.',
    'OGyGGGGgO',
    'OOOOOOOOO',
  ],
};

/** The cloths of the two flags, each 5x4: stripes with a blue canton at the hoist, and blue with a ring of gold. */
const STRIPES = ['RRRbb', 'wwwbb', 'RRRRR', 'wwwww'];
const RING = ['bbybb', 'bybyb', 'bbybb', 'bbbbb'];

/** One frame of the desk flags: two poles crossed in a brass foot, a flag on each, `wave` shifting the free ends. 17x14. */
function flagsFrame(wave: number): string[] {
  const pts: RmPoint[] = [...line(8, 11, 5, 1, 'x'), ...line(8, 11, 11, 1, 'x')];
  STRIPES.forEach((row, dy) => [...row].forEach((ch, dx) => pts.push([dx, 1 + dy + (dx < 2 ? wave : 0), ch])));
  RING.forEach((row, dy) => [...row].forEach((ch, dx) => pts.push([12 + dx, 1 + dy + (dx > 2 ? wave : 0), ch])));
  pts.push([5, 0, 'y'], [11, 0, 'y'], ...line(6, 12, 10, 12, 'G'), ...line(5, 13, 11, 13, 'O'));
  return rmPlot(17, 14, pts);
}

/** The desk flags fluttering in the draught. Framed, 17x14. */
const deskFlags: PixelSprite = {
  id: 'rm13-opener-desk-flags',
  name: 'desk flags',
  tags: ['scene', 'rm13'],
  rows: flagsFrame(0),
  frames: [flagsFrame(0), flagsFrame(1), flagsFrame(0), flagsFrame(-1)],
  frameMs: 420,
};

/** The sea chart on the wall: two coasts, the ocean between, the crossing dashed in red. 18x14. */
const chart: PixelSprite = {
  id: 'rm13-opener-chart',
  name: 'sea chart',
  tags: ['scene', 'rm13'],
  rows: [
    'OOOOOOOOOOOOOOOOOO',
    'OwwwwwwwwwwwwwwwwO',
    'OwNNBBBBBBBBBBNNwO',
    'OwNNNBBBBBBBBBNNwO',
    'OwNNBBBBBBBBBNNNwO',
    'OwNnBBBBBBBBBBNnwO',
    'OwNRBRBRBRBRBRRNwO',
    'OwNnBBBBBBBBBBnNwO',
    'OwNNBBBBBBBBBBBNwO',
    'OwNNNBBBBBBBBBNNwO',
    'OwnNBBBBBBBBBBNnwO',
    'OwwwwwwwwwwwwwwwwO',
    'OggggggggggggggggO',
    'OOOOOOOOOOOOOOOOOO',
  ],
};

/** The little ship on the chart, crossing; give it a `drift`. 3x2. */
const chartShip: PixelSprite = {
  id: 'rm13-opener-chart-ship',
  name: 'chart ship',
  tags: ['scene', 'rm13'],
  rows: [
    '.K.',
    'KKK',
  ],
};

/** The counter: its back edge, the worn top, a lit front edge, and the panelled front below. 80x22. */
const counter: PixelSprite = {
  id: 'rm13-opener-counter',
  name: 'counter',
  tags: ['scene', 'rm13'],
  rows: rmMark(
    [
      'D'.repeat(80),
      'X'.repeat(80),
      'x'.repeat(80),
      'D'.repeat(80),
      ...Array.from({ length: 18 }, (_, y) => (y === 1 || y === 15 ? 'D' : y === 17 ? 'K' : 'k').repeat(80)),
    ],
    Array.from({ length: 14 }, (_, i) => [[0, 2 + i], [19, 2 + i], [39, 2 + i], [59, 2 + i], [79, 2 + i]] as const)
      .flat()
      .map(([x, y]) => [x, 4 + y, 'D'] as const),
  ),
};

const base = rmCompose('rm13-opener-base', rmWatchRoom(80, 60, 50), [
  [chart, 3, 6],
  [rmKeeperRaise, 58, 21],
  [counter, 0, 38],
  [post, 35, 13],
]);

export const rm13Opener: SceneArt = {
  id: 'rm13-opener',
  label: 'A lighthouse keeper behind a counter watches a brass balance tip back and forth between a heap of gold coins and a heap of silver coins, beside two small crossed flags and a sea chart of a crossing.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: chartShip, x: 9, y: 10, motion: { kind: 'drift', amp: 3, periodMs: 6000 } },
    { sprite: deskFlags, x: 4, y: 26 },
    { sprite: balance, x: 22, y: 10 },
    { sprite: rmGlint, x: 37, y: 34, motion: { kind: 'twinkle', periodMs: 2100, min: 0.2 } },
    { sprite: rmGlint, x: 10, y: 35, motion: { kind: 'twinkle', periodMs: 2700, min: 0.2, phase: 0.5 } },
  ],
};

/**
 * Lesson 13's emblem: the hedge. A gold coin and a silver coin, the two currencies of the opener's
 * balance, at opposite corners, joined by two bold white arrows, one each way: the swap that fixes
 * what one will cost in the other. A tipped balance read as scales of justice at keepsake size, its
 * coin heaps too small to see. 16x16.
 */
const emblemSwap: PixelSprite = {
  id: 'rm13-emblem-swap',
  name: 'currency swap',
  tags: ['rm', 'emblem', 'lesson 13'],
  rows: [
    '..OOO...........',
    '.OyyGO..........',
    'OyyGGgOwwwwwww..',
    'OyGGGgOwwwwwww..',
    'OGGGggO.....ww..',
    '.OGggO......ww..',
    '..OOO.....wwwwww',
    '..ww.......wwww.',
    '.wwww.......ww..',
    'wwwwww.....DDD..',
    '..ww......DwwxD.',
    '..ww.....DwwxxXD',
    '..wwwwww.DwxxxXD',
    '..wwwwww.DxxxXXD',
    '..........DxXXD.',
    '...........DDD..',
  ],
};

export const rm13Finish: SceneArt = rmKeepsake(
  'rm13-finish',
  'A red and white life ring hanging from a rope, with a gold coin and a silver coin at its center joined by two white arrows, one each way, a currency swap.',
  emblemSwap,
);

export const art: LessonArtSet = { opener: rm13Opener, backdrop: rmBackdrop, finish: rm13Finish };
