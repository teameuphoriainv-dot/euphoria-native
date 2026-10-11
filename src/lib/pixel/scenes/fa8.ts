/**
 * Financial Analytics lesson 8, data visualization and dashboards: the right chart for the job.
 *
 * OPENER. The control room's video wall, a dashboard at room scale. Across the top, three KPI cards
 * (the portfolio's value drawing a gold line, the day's P&L with a green up arrow, value at risk
 * with a red down arrow). Below them the big screen draws a candlestick chart candle by candle, a
 * heatmap shifts beside it, and a small treemap sits under that. A console desk runs along the
 * wall, the analyst stands at its end, and the map lights ANALYZE.
 *
 * KEEPSAKE. The trophy with a candlestick chart: green and red candles on their wicks, landing one
 * at a time as the price climbs.
 */
import { faBackdrop } from './fa-backdrop';
import { faAnalyst, faCompose, faPipelineMap, faTabletLine, FA_ANALYST_TABLET } from './fa-kit';
import { faDesk, faDrawnBy, faKeepsake, faMonitor, faRoom, faStageLight, FA_MONITOR_GLASS } from './fa-kit-a';
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';

/* ── candles ───────────────────────────────────────────────────────────────────────────────── */

/** A candle: body top and bottom rows, wick top and bottom rows, and whether it closed up. */
type FaCandle = readonly [bodyTop: number, bodyBottom: number, wickTop: number, wickBottom: number, up: boolean];

/**
 * Candles on a `w` x `h` grid, one every `pitch` columns from `left`: a 3px body lit on its left
 * (green up, red down) on a wick of its own darker step.
 */
function candles(w: number, h: number, left: number, pitch: number, list: readonly FaCandle[]): string[] {
  const grid = Array.from({ length: h }, () => Array.from({ length: w }, () => '.'));
  list.forEach(([top, bottom, wickTop, wickBottom, up], i) => {
    const x = left + i * pitch;
    const body = up ? ['m', 'N', 'n'] : ['s', 'R', 'r'];
    for (let y = wickTop; y <= wickBottom; y++) grid[y][x + 1] = up ? 'n' : 'r';
    for (let y = top; y <= bottom; y++) for (let dx = 0; dx < 3; dx++) grid[y][x + dx] = body[dx];
  });
  return grid.map((r) => r.join(''));
}

/* ── the wall ──────────────────────────────────────────────────────────────────────────────── */

/** KPI card faces, 8 x 3 each: an arrow or a line, and a value. */
const kpiUp: PixelSprite = { id: 'fa8-kpi-up', name: 'kpi up', tags: ['scene', 'fa8'], rows: ['.N..xxxx', 'NNN.....', '....xxx.'] };
const kpiDown: PixelSprite = { id: 'fa8-kpi-down', name: 'kpi down', tags: ['scene', 'fa8'], rows: ['RRR.xxxx', '.R......', '....xxx.'] };
const treemap: PixelSprite = { id: 'fa8-treemap', name: 'treemap', tags: ['scene', 'fa8'], rows: ['NNNTTy', 'NNNTTy', 'NNNBBy', 'nnnBBg'] };

/* Where things stand. */
const MAP = { x: 2, y: 2 } as const;
const KPI_X = [36, 50, 64] as const;
const KPI_Y = 1;
const CANDLES = { x: 2, y: 11 } as const;
const HEAT = { x: 48, y: 11 } as const;
const TREE = { x: 48, y: 29 } as const;
const ANALYST = { x: 63, y: 33 } as const;
const glassOf = (at: { x: number; y: number }) => ({ x: at.x + FA_MONITOR_GLASS.x, y: at.y + FA_MONITOR_GLASS.y });

const room = faRoom('fa8-opener-room', [
  [3, 50, 48, 1, 'Z'],
  [3, 51, 46, 1, 'Z'],
  [66, 57, 13, 2, 'Z'],
]);

const base = faCompose('fa8-opener-base', room, [
  [faPipelineMap, MAP.x, MAP.y],
  ...KPI_X.map((x, i) => [faMonitor(`fa8-kpi-${String(i)}`, 14, 9), x, KPI_Y] as const),
  [kpiUp, KPI_X[1] + FA_MONITOR_GLASS.x, KPI_Y + FA_MONITOR_GLASS.y],
  [kpiDown, KPI_X[2] + FA_MONITOR_GLASS.x, KPI_Y + FA_MONITOR_GLASS.y],
  [faMonitor('fa8-candle-screen', 44, 26, true), CANDLES.x, CANDLES.y],
  [faMonitor('fa8-heat-screen', 30, 17), HEAT.x, HEAT.y],
  [faMonitor('fa8-tree-screen', 12, 10), TREE.x, TREE.y],
  [treemap, glassOf(TREE).x, glassOf(TREE).y],
  [faDesk('fa8-desk', 48), 1, 41],
  [faAnalyst, ANALYST.x, ANALYST.y],
]);

/* ── moving parts ──────────────────────────────────────────────────────────────────────────── */

/** The big chart: nine candles land one at a time as the price climbs, hold, and clear. */
const candleChart: PixelSprite = faDrawnBy('fa8-candles', candles(38, 20, 1, 4, [
  [14, 17, 12, 19, true],
  [12, 15, 10, 17, true],
  [12, 14, 11, 16, false],
  [10, 13, 8, 15, true],
  [7, 11, 6, 13, true],
  [8, 10, 6, 12, false],
  [5, 9, 3, 10, true],
  [6, 8, 5, 10, false],
  [2, 7, 0, 9, true],
]), (x) => Math.floor((x - 1) / 4), 300, 5);

/** The heatmap: six by three tiles whose colours shift from frame to frame, gains to losses. */
const heatmap: PixelSprite = (() => {
  const inks = ['N', 'n', 'm', 'D', 'r', 'R', 's'];
  const frames = Array.from({ length: 4 }, (_, f) => Array.from({ length: 11 }, (_, y) =>
    Array.from({ length: 24 }, (_, x) => {
      if (x % 4 === 3 || y % 4 === 3 || x > 22) return '.';
      const [c, r] = [Math.floor(x / 4), Math.floor(y / 4)];
      return inks[(r * 5 + c * 3 + f * 2 + (c * r) % 3) % inks.length];
    }).join('')));
  return { id: 'fa8-heatmap', name: 'heatmap', tags: ['scene', 'fa8'], rows: frames[0], frames, frameMs: 900 };
})();

/** The value card's gold line, drawing itself. */
const valueLine: PixelSprite = faDrawnBy('fa8-value-line', ['.....yyy', '...yy...', 'yyy.....'], (x) => x, 260, 4);

/** The P&L card's arrow, pulsing. */
const upArrow: PixelSprite = { id: 'fa8-up-arrow', name: 'up arrow', tags: ['scene', 'fa8'], rows: ['.m.', 'mmm'] };

export const fa8Opener: SceneArt = {
  id: 'fa8-opener',
  label: 'A control room dashboard in the data works: a wall of screens shows three key number cards, a candlestick chart drawing itself, a shifting heatmap and a treemap, over a console desk where an analyst with a tablet keeps watch.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: candleChart, x: glassOf(CANDLES).x, y: glassOf(CANDLES).y },
    { sprite: heatmap, x: glassOf(HEAT).x, y: glassOf(HEAT).y },
    { sprite: valueLine, x: KPI_X[0] + FA_MONITOR_GLASS.x, y: KPI_Y + FA_MONITOR_GLASS.y },
    { sprite: upArrow, x: KPI_X[1] + FA_MONITOR_GLASS.x, y: KPI_Y + FA_MONITOR_GLASS.y, motion: { kind: 'twinkle', periodMs: 1100, min: 0 } },
    faStageLight('analyze', MAP.x, MAP.y),
    { sprite: faTabletLine, x: ANALYST.x + FA_ANALYST_TABLET.x, y: ANALYST.y + FA_ANALYST_TABLET.y },
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────── */

/**
 * LESSON 8: data visualization. A candlestick chart, three candles up and one down on a rising
 * price, each landing in turn on its wick. It holds, the screen clears.
 */
export const faEmblemCandles: PixelSprite = {
  ...faDrawnBy('fa-emblem-candles', candles(16, 11, 0, 4, [
    [7, 9, 5, 10, true],
    [4, 7, 3, 9, true],
    [4, 6, 3, 8, false],
    [0, 4, 0, 6, true],
  ]), (x) => Math.floor(x / 4), 320),
  name: 'emblem candles',
  blurb: 'A candlestick chart on a rising price.',
};

export const fa8Finish: SceneArt = faKeepsake(
  'fa8-finish',
  'A gold terminal trophy on a purple stand, its screen drawing a candlestick chart of green and red candles on a rising price, with small sparkles around it.',
  faEmblemCandles,
);

export const art: LessonArtSet = { opener: fa8Opener, backdrop: faBackdrop, finish: fa8Finish };
