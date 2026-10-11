/**
 * Financial Analytics lesson 7, Monte Carlo simulation: roll the dice ten thousand times.
 *
 * OPENER. The simulation room. On the left a glass drum of dice tumbles on its cabinet, a counter
 * ticking off the runs and fa-kit's die on the door; the draws stream out of the drum along a pipe
 * into a big screen, where the lesson's picture grows from one starting point: possible futures
 * fanning out to the right, the best in green, the median in gold, the worst in red, ordinary runs
 * in teal and blue between them. The analyst stands under the screen, and the map lights MODEL.
 *
 * KEEPSAKE. The trophy with the fan: five paths leaving one point and spreading as they go.
 */
import { faBackdrop } from './fa-backdrop';
import { faAnalyst, faCompose, faConduit, faDie, faMeter, faPacketRun, faPipelineMap, faTabletLine, FA_ANALYST_TABLET } from './fa-kit';
import { faDrawnBy, faKeepsake, faMonitor, faRoom, faStageLight, FA_MONITOR_GLASS } from './fa-kit-a';
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';

/* ── fans ──────────────────────────────────────────────────────────────────────────────────── */

/** One path of a fan: [ink, end row, wiggle size]. Paths are drawn in order, later on top. */
type FaPath = readonly [ink: string, end: number, wiggle: number];

/**
 * Paths leaving (0, `start`) and spreading to the right edge of a `w` x `h` grid, each a straight
 * drift to its end row plus a small zigzag, so they read as random walks and not as rays. Steep
 * steps are filled in, so every path stays joined.
 */
function fan(w: number, h: number, start: number, paths: readonly FaPath[]): string[] {
  const grid = Array.from({ length: h }, () => Array.from({ length: w }, () => '.'));
  paths.forEach(([ink, end, wiggle], i) => {
    let prev = start;
    for (let x = 0; x < w; x++) {
      const zig = x < 2 ? 0 : [0, 1, 0, -1][(x + 2 * i) % 4] * wiggle;
      const y = Math.max(0, Math.min(h - 1, Math.round(start + ((end - start) * x) / (w - 1) + zig)));
      for (let j = Math.min(prev, y); j <= Math.max(prev, y); j++) if (x > 0 || j === y) grid[j][x] = ink;
      prev = y;
    }
  });
  grid[start][0] = 'w';
  return grid.map((r) => r.join(''));
}

/* ── the drum ──────────────────────────────────────────────────────────────────────────────── */

/** A round glass drum, 20 x 20: deep outline, a rim lit top-left, smoked glass with a reflection. */
const drum: PixelSprite = {
  id: 'fa7-drum',
  name: 'dice drum',
  tags: ['scene', 'fa7', 'station'],
  rows: Array.from({ length: 20 }, (_, y) =>
    Array.from({ length: 20 }, (_, x) => {
      const r = Math.hypot(x - 9.5, y - 9.5);
      if (r > 9.9) return '.';
      if (r > 8.9) return 'D';
      if (r > 7.9) return x + y < 19 ? 'x' : 'X';
      return r > 6.2 && r <= 7.2 && x + y < 12 ? 'X' : 'k';
    }).join('')),
};

/** The drum's cabinet, 20 x 21: a run counter window, a teal trim, the die on its door. */
const cabinet: PixelSprite = (() => {
  const plain = `Dx${'X'.repeat(16)}kD`;
  return {
    id: 'fa7-cabinet',
    name: 'drum cabinet',
    tags: ['scene', 'fa7', 'station'],
    rows: [
      'D'.repeat(20),
      plain,
      `DxXXX${'D'.repeat(8)}XXXXXkD`,
      `DxXXXDKKKKKKDXXXXXkD`,
      `DxXXXDKKKKKKDXXXXXkD`,
      `DxXXXDKKKKKKDXXXXXkD`,
      `DxXXX${'D'.repeat(8)}XXXXXkD`,
      plain,
      `D${'T'.repeat(17)}tD`,
      ...Array.from({ length: 10 }, () => plain),
      'D'.repeat(20),
      `.DkD${'.'.repeat(12)}DkD.`,
    ],
  };
})();

/* Where things stand. */
const MAP = { x: 2, y: 1 } as const;
const DRUM = { x: 4, y: 8 } as const;
const CABINET = { x: 4, y: 28 } as const;
const BOARD = { x: 35, y: 3 } as const;
const GLASS = { x: BOARD.x + FA_MONITOR_GLASS.x, y: BOARD.y + FA_MONITOR_GLASS.y } as const;
/** Every path starts here, on the glass's left edge, level with the drum's hub and the pipe. */
const START = 12;
const FEED = { x: 24, y: GLASS.y + START - 2, length: 11 } as const;
const ANALYST = { x: 55, y: 33 } as const;

const room = faRoom('fa7-opener-room', [
  [6, 50, 20, 1, 'Z'],
  [6, 51, 18, 1, 'Z'],
  [58, 57, 14, 2, 'Z'],
]);

const base = faCompose('fa7-opener-base', room, [
  [faPipelineMap, MAP.x, MAP.y],
  [faMonitor('fa7-board', 44, 30), BOARD.x, BOARD.y],
  [faConduit('fa7-feed', FEED.length), FEED.x, FEED.y],
  [drum, DRUM.x, DRUM.y],
  [cabinet, CABINET.x, CABINET.y],
  [faDie, CABINET.x + 6, CABINET.y + 10],
  [faAnalyst, ANALYST.x, ANALYST.y],
]);

/* ── moving parts ──────────────────────────────────────────────────────────────────────────── */

/** Ten thousand futures, in seven: they grow from today to the right edge, hold, and clear. */
const futures: PixelSprite = (() => {
  // Sample runs zigzag; the percentile lines over them (95th, median, 5th) are smooth.
  const full = fan(38, 24, START, [
    ['b', 3, 1], ['b', 20, 1], ['T', 7, 1], ['T', 16, 1], ['N', 0, 0], ['R', 23, 0], ['y', 9, 0],
  ]);
  return faDrawnBy('fa7-futures', full, (x) => Math.floor(x / 3), 230, 5);
})();

/**
 * Dice tumbling in the drum: two jostle in the bottom while a third is carried up and over and
 * drops back on them, eight frames to a turn.
 */
const tumble: PixelSprite = (() => {
  const white = ['wwwwx', 'wKwKx', 'wwwwx', 'wKwKx', 'xxxxx'];
  const red = ['RRRRr', 'RwRwr', 'RRwRr', 'RwRwr', 'rrrrr'];
  const at: readonly (readonly [number, number])[][] = [
    [[4, 11], [5, 11], [4, 10], [5, 11], [4, 11], [5, 10], [4, 11], [5, 11]],
    [[10, 12], [9, 12], [10, 11], [10, 12], [9, 12], [10, 11], [10, 12], [9, 12]],
    [[11, 6], [10, 3], [7, 2], [4, 4], [3, 7], [6, 7], [9, 7], [11, 7]],
  ];
  const frames = Array.from({ length: 8 }, (_, f) => {
    const grid = Array.from({ length: 20 }, () => Array.from({ length: 20 }, () => '.'));
    at.forEach((path, k) => {
      const [left, top] = path[f];
      (k === 1 ? red : white).forEach((row, dy) => [...row].forEach((ch, dx) => { grid[top + dy][left + dx] = ch; }));
    });
    return grid.map((r) => r.join(''));
  });
  return { id: 'fa7-tumble', name: 'tumbling dice', tags: ['scene', 'fa7'], rows: frames[0], frames, frameMs: 200 };
})();

/** Random draws streaming from the drum to the screen. */
const draws = faPacketRun('fa7-draws', FEED.length - 2, [[Infinity, 'w']], 4, 160);

export const fa7Opener: SceneArt = {
  id: 'fa7-opener',
  label: 'A simulation room in the data works: dice tumble in a glass drum and stream out as random draws into a big screen, where many possible futures fan out from today, green at the top, gold in the middle and red at the bottom.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: futures, x: GLASS.x, y: GLASS.y },
    { sprite: tumble, x: DRUM.x, y: DRUM.y },
    { sprite: draws, x: FEED.x + 1, y: FEED.y + 2 },
    { sprite: faMeter, x: CABINET.x + 6, y: CABINET.y + 3 },
    faStageLight('model', MAP.x, MAP.y),
    { sprite: faTabletLine, x: ANALYST.x + FA_ANALYST_TABLET.x, y: ANALYST.y + FA_ANALYST_TABLET.y },
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────── */

/**
 * LESSON 7: Monte Carlo. Five simulated paths leave one white point and spread as they go, the
 * best in green, the median in gold, the worst in red. They grow from the left together, hold,
 * and the screen clears for the next ten thousand.
 */
export const faEmblemFan: PixelSprite = {
  ...faDrawnBy('fa-emblem-fan', fan(16, 11, 6, [['T', 2, 1], ['T', 8, 1], ['N', 0, 1], ['R', 10, 1], ['y', 4, 1]]), (x) => Math.floor(x / 2), 260),
  name: 'emblem fan',
  blurb: 'Simulated paths fanning out from today.',
};

export const fa7Finish: SceneArt = faKeepsake(
  'fa7-finish',
  'A gold terminal trophy on a purple stand, its screen drawing five paths that fan out from one point, green at the top, gold in the middle and red at the bottom, with small sparkles around it.',
  faEmblemFan,
);

export const art: LessonArtSet = { opener: fa7Opener, backdrop: faBackdrop, finish: fa7Finish };
