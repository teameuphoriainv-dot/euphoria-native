/**
 * Financial Analytics lesson 14, portfolio analytics and attribution: where the returns came from.
 *
 * OPENER. The briefing room. The analyst stands at the big screen and points into it, where the
 * portfolio's return is cut into a pie the way the lesson cuts it: beta (the market, blue, the
 * biggest slice), factor tilts (teal), and the slice that is true skill, alpha (gold), which lands
 * last, pulled out from the rest, under the red dot of the analyst's pointer. Up on the right a
 * second screen draws the fund against its benchmark, the gap between them opening as it goes. A
 * plant in a gold pot, and the map lights ANALYZE.
 *
 * KEEPSAKE. The trophy with the attribution pie: blue beta, teal tilts and the gold alpha slice,
 * popping out last.
 */
import { faBackdrop } from './fa-backdrop';
import { faCompose, faLamp, faPipelineMap } from './fa-kit';
import { faDrawnBy, faKeepsake, faMonitor, faRoom, faStageLight, FA_MONITOR_GLASS } from './fa-kit-a';
import { faAnalystPoint, faBlank, faRowsOf, faTrace } from './fa-kit-b';
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';

/* ── the pie ───────────────────────────────────────────────────────────────────────────────── */

/** A slice: where it ends (as a share of the turn, clockwise from twelve), its lit and dark inks. */
type Slice = readonly [until: number, lit: string, dark: string];

/** Alpha first (so it sits up and to the right, towards the pointer), then beta, then the tilts. */
const SLICES: readonly Slice[] = [[0.16, 'y', 'g'], [0.74, 'B', 'b'], [1, 'T', 't']];

/**
 * A pie `w` x `h` around (cx, cy), radius `r`, with the first slice pulled out by `pop`. Each
 * pixel gets its slice's dark ink on the lower right rim, and a step: the beta and tilt slices
 * sweep round in `sweep` beats, then alpha lands on its own beat.
 */
function pie(id: string, w: number, h: number, cx: number, cy: number, r: number, pop: readonly [number, number], sweep: number, frameMs: number): PixelSprite {
  const grid = faBlank(w, h);
  const step = new Map<string, number>();
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      const d = Math.hypot(dx, dy);
      if (d > r) continue;
      const f = (((Math.atan2(dx, -dy) / (Math.PI * 2)) % 1) + 1) % 1;
      const k = SLICES.findIndex(([until]) => f < until);
      const [, lit, dark] = SLICES[k];
      const ink = d > r - 1.6 && dx + dy > r * 0.3 ? dark : lit;
      const [px, py] = k === 0 ? [x + pop[0], y + pop[1]] : [x, y];
      grid[py][px] = ink;
      const at = k === 0 ? sweep : Math.min(sweep - 1, Math.floor(((f - SLICES[0][0]) / (1 - SLICES[0][0])) * sweep));
      step.set(`${String(px)},${String(py)}`, at);
    }
  }
  return faDrawnBy(id, faRowsOf(grid), (x, y) => step.get(`${String(x)},${String(y)}`) ?? 0, frameMs, 6);
}

/* ── the room ──────────────────────────────────────────────────────────────────────────────── */

const MAP = { x: 8, y: 1 } as const;
const SCREEN = { x: 2, y: 9 } as const;
const GLASS = { x: SCREEN.x + FA_MONITOR_GLASS.x, y: SCREEN.y + FA_MONITOR_GLASS.y } as const;
const PIE = { x: GLASS.x + 13, y: GLASS.y + 1 } as const;
const BENCH = { x: 49, y: 6 } as const;
const ANALYST = { x: 47, y: 31 } as const;
const PLANT = { x: 66, y: 37 } as const;

/** The legend down the screen's left side: a swatch per slice, a label and a figure beside it. */
const legend: PixelSprite = (() => {
  const grid = faBlank(10, 14);
  SLICES.forEach(([, lit, dark], k) => {
    const y = k * 5;
    grid[y][0] = grid[y][1] = lit;
    grid[y + 1][0] = grid[y + 1][1] = dark;
    for (let x = 3; x < 9; x++) grid[y][x] = 'x';
    for (let x = 3; x < 7; x++) grid[y + 1][x] = 'X';
  });
  return { id: 'fa14-legend', name: 'legend', tags: ['scene', 'fa14'], rows: faRowsOf(grid) };
})();

/** A plant in a gold pot, for the corner. */
const plant: PixelSprite = {
  id: 'fa14-plant',
  name: 'plant',
  tags: ['scene', 'fa14', 'prop'],
  rows: [
    '....n....',
    '..n.Nn...',
    '.nN.NNn..',
    'nNNnNmNn.',
    '.nNNNNNnn',
    'nNmNnNNNn',
    '.nNNNmNn.',
    '..nNNNn..',
    '...nNn...',
    '....n....',
    '..OOOOO..',
    '.OyGGGgO.',
    '.OGGGGgO.',
    '..OGGgO..',
    '..OGGgO..',
    '..OOOOO..',
  ],
};

/** The fund (gold) against its benchmark (grey), drawn from the same start, the gap opening. */
const benchLines: PixelSprite = (() => {
  const grid = faBlank(23, 12);
  const line = (rise: number, wiggle: number, phase: number) =>
    Array.from({ length: 23 }, (_, x) => Math.max(0, Math.min(11, Math.round(9 - (x * rise) / 22 + wiggle * Math.sin(x * 0.8 + phase)))));
  for (const [x, y] of faTrace(line(3, 0.6, 0))) grid[y][x] = 'x';
  for (const [x, y] of faTrace(line(7, 0.8, 1))) grid[y][x] = 'y';
  return faDrawnBy('fa14-bench-lines', faRowsOf(grid), (x) => x, 200, 6);
})();

/** The pointer's red dot, on the alpha slice. */
const laser: PixelSprite = { id: 'fa14-laser', name: 'laser dot', tags: ['scene', 'fa14'], rows: ['.r.', 'rRr', '.r.'] };

const room = faRoom('fa14-opener-room', [
  [ANALYST.x + 5, 55, 12, 2, 'Z'],
  [PLANT.x + 3, 53, 7, 1, 'Z'],
]);

const base = faCompose('fa14-opener-base', room, [
  [faPipelineMap, MAP.x, MAP.y],
  [faMonitor('fa14-screen', 44, 32, true), SCREEN.x, SCREEN.y],
  [legend, GLASS.x + 1, GLASS.y + 7],
  [faMonitor('fa14-bench', 29, 18), BENCH.x, BENCH.y],
  [plant, PLANT.x, PLANT.y],
  [faAnalystPoint, ANALYST.x, ANALYST.y],
]);

export const fa14Opener: SceneArt = {
  id: 'fa14-opener',
  label: 'A briefing room in the data works: the analyst points at a big screen where a portfolio return is cut into a pie, a large blue market slice, a teal slice and a gold alpha slice pulled out under a red pointer dot, while a second screen draws a fund line rising above its benchmark.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: pie('fa14-pie', 24, 24, 11, 13, 10.5, [1, -2], 6, 260), x: PIE.x, y: PIE.y },
    { sprite: laser, x: PIE.x + 13, y: PIE.y + 4, motion: { kind: 'twinkle', periodMs: 900, min: 0.3 } },
    { sprite: benchLines, x: BENCH.x + FA_MONITOR_GLASS.x, y: BENCH.y + FA_MONITOR_GLASS.y },
    { sprite: faLamp, x: SCREEN.x + 39, y: SCREEN.y + 30, motion: { kind: 'twinkle', periodMs: 1500, min: 0.3 } },
    faStageLight('analyze', MAP.x, MAP.y),
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────── */

/**
 * LESSON 14: attribution. A pie sweeps round in blue (beta) and teal (factor tilts), then the gold
 * alpha slice lands pulled out from the rest, it holds, the screen clears.
 */
export const faEmblemAttribution: PixelSprite = {
  ...pie('fa-emblem-attribution', 16, 11, 7.5, 6, 5, [1, -1], 3, 340),
  name: 'emblem attribution',
  tags: ['scene', 'fa', 'emblem'],
  blurb: 'A return pie: blue beta, teal tilts, the gold alpha slice pulled out.',
};

export const fa14Finish: SceneArt = faKeepsake(
  'fa14-finish',
  'A gold terminal trophy on a purple stand, its screen drawing a pie of a large blue slice and a teal slice with a gold slice pulled out from the rest, with small sparkles around it.',
  faEmblemAttribution,
);

export const art: LessonArtSet = { opener: fa14Opener, backdrop: faBackdrop, finish: fa14Finish };
