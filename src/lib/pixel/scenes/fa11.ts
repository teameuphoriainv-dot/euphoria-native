/**
 * Financial Analytics lesson 11, time series: one series pulled apart into what drives it.
 *
 * OPENER. The control room's wall screen, seen over the analyst's shoulder: the analyst stands
 * with their back to us, hands clasped, studying it. The screen runs the lesson's decomposition as
 * four strips on one time axis: the raw series (blue, jagged) draws first, then the three parts it
 * is made of draw together beneath it, the trend (gold, rising), the seasonal cycle (a teal wave)
 * and the residual noise (a grey floor with red bursts where bad days come in bunches, the
 * volatility clustering the lesson ends on). A wall calendar ticks off the days, LEDs run along
 * the console, and the map lights ANALYZE.
 *
 * KEEPSAKE. The trophy with a series in miniature: a gold trend rising, and a teal cycle riding it.
 */
import { faBackdrop } from './fa-backdrop';
import { faCompose, faLedChase, faPipelineMap } from './fa-kit';
import { faDesk, faDrawnBy, faKeepsake, faMonitor, faRoom, faStageLight, FA_MONITOR_GLASS } from './fa-kit-a';
import { faAnalystBack, faBlank, faRowsOf, faTrace } from './fa-kit-b';
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';

/* ── the series ────────────────────────────────────────────────────────────────────────────── */

/** Columns on the plot; every strip shares the one time axis. */
const PLOT_W = 53;
const trendOf = (x: number) => (3 * x) / (PLOT_W - 1);
const seasonOf = (x: number) => 1.5 * Math.sin((x / PLOT_W) * Math.PI * 7);
/** Two bunches of big residuals among small ones: volatility clustering. */
const clustered = (x: number) => (x >= 13 && x <= 19) || (x >= 36 && x <= 42);
const noiseOf = (x: number) => (((x * 37 + 11) % 7) / 3 - 1) * (clustered(x) ? 1.6 : 0.4);

/** Values to rows of a strip `h` tall, highest value on row 0. */
function rowsFor(values: readonly number[], h: number): number[] {
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  return values.map((v) => h - 1 - Math.round(((v - lo) / (hi - lo)) * (h - 1)));
}

const xs = Array.from({ length: PLOT_W }, (_, x) => x);

/** Each strip: its row on the glass, its height, its ink, and its pixels. */
const STRIPS = {
  raw: { top: 0, h: 6, ink: 'B' },
  trend: { top: 7, h: 4, ink: 'y' },
  season: { top: 12, h: 4, ink: 'T' },
  noise: { top: 17, h: 3, ink: 'x' },
} as const;

const tracePixels = {
  raw: faTrace(rowsFor(xs.map((x) => trendOf(x) + seasonOf(x) + noiseOf(x)), STRIPS.raw.h)),
  trend: faTrace(rowsFor(xs.map(trendOf), STRIPS.trend.h)),
  season: faTrace(rowsFor(xs.map(seasonOf), STRIPS.season.h)),
};

/**
 * The raw series draws first, three columns a frame; then the three parts draw together, holding
 * to the same beat. Frame counts match (the raw strip holds through the parts), so the four
 * layers stay in step.
 */
const PARTS_FROM = Math.floor((PLOT_W - 1) / 3) + 1;
const HOLD = 8;
function strip(id: string, h: number, pixels: readonly (readonly [number, number, string])[], first: number): PixelSprite {
  const grid = faBlank(PLOT_W, h);
  for (const [x, y, ink] of pixels) grid[y][x] = ink;
  const hold = first === 0 ? PARTS_FROM + HOLD : HOLD;
  return faDrawnBy(id, faRowsOf(grid), (x) => first + Math.floor(x / 3), 130, hold);
}

const rawStrip = strip('fa11-raw', STRIPS.raw.h, tracePixels.raw.map(([x, y]) => [x, y, 'B']), 0);
const trendStrip = strip('fa11-trend', STRIPS.trend.h, tracePixels.trend.map(([x, y]) => [x, y, 'y']), PARTS_FROM);
const seasonStrip = strip('fa11-season', STRIPS.season.h, tracePixels.season.map(([x, y]) => [x, y, 'T']), PARTS_FROM);
/** Residuals: a dotted grey floor, and red stems where the bad days bunch up. */
const noiseStrip = strip('fa11-noise', STRIPS.noise.h, xs.flatMap((x): [number, number, string][] => {
  const r = 1 - Math.round(noiseOf(x));
  const y = Math.max(0, Math.min(2, r));
  if (!clustered(x)) return x % 2 ? [] : [[x, 1, 'X']];
  return y === 1 ? [[x, 1, 'R']] : [[x, 1, 'R'], [x, y, 'R']];
}), PARTS_FROM);

/* ── the room ──────────────────────────────────────────────────────────────────────────────── */

const MAP = { x: 17, y: 1 } as const;
const WALL = { x: 2, y: 8 } as const;
const GLASS = { x: WALL.x + FA_MONITOR_GLASS.x, y: WALL.y + FA_MONITOR_GLASS.y } as const;
const PLOT_X = GLASS.x + 3;
const CALENDAR = { x: 67, y: 12 } as const;
const ANALYST = { x: 27, y: 34 } as const;

/** Over the wall screen's glass: each strip's colour tab, and dotted rules between the strips. */
const stripFrame: PixelSprite = (() => {
  const grid = faBlank(56, 20);
  for (const { top, h, ink } of Object.values(STRIPS)) {
    for (let y = top; y < top + h; y++) grid[y][0] = grid[y][1] = ink;
    if (top > 0) for (let x = 0; x < 56; x += 2) grid[top - 1][x] = 'k';
  }
  return { id: 'fa11-strip-frame', name: 'strip frame', tags: ['scene', 'fa11'], rows: faRowsOf(grid) };
})();

/** A wall calendar on a nail: red header, binder rings, a page of days. */
const calendar: PixelSprite = {
  id: 'fa11-calendar',
  name: 'calendar',
  tags: ['scene', 'fa11', 'prop'],
  rows: [
    '....DD....',
    '...D..D...',
    'DDDDDDDDDD',
    'DRRRRRRRRD',
    'DRwRRRRwRD',
    'DDDDDDDDDD',
    'DwwwwwwwxD',
    'DwXwXwXwxD',
    'DwwwwwwwxD',
    'DwXwXwXwxD',
    'DwwwwwwwxD',
    'DxxxxxxxxD',
    'DDDDDDDDDD',
  ],
};

/** The calendar's page: today's ring moves day by day, then the page lifts and a new one starts. */
const calendarPage: PixelSprite = (() => {
  const page = ['wwwwwwwx', 'wXwXwXwx', 'wwwwwwwx', 'wXwXwXwx', 'wwwwwwwx', 'xxxxxxxx'];
  const days = [[1, 1], [3, 1], [5, 1], [1, 3], [3, 3], [5, 3]] as const;
  const marked = days.map(([dx, dy]) => page.map((row, y) => (y === dy ? row.slice(0, dx) + 'R' + row.slice(dx + 1) : row)));
  const lifting = ['xxxxxxxx', 'xxxxxxxx', 'DDDDDDDD', ...page.slice(3)];
  return { id: 'fa11-calendar-page', name: 'calendar page', tags: ['scene', 'fa11'], rows: marked[0], frames: [...marked, lifting, page], frameMs: 420 };
})();

const room = faRoom('fa11-opener-room', [
  [4, 50, 60, 1, 'Z'],
  [4, 51, 58, 1, 'Z'],
  [ANALYST.x + 3, 58, 12, 2, 'Z'],
]);

const base = faCompose('fa11-opener-base', room, [
  [faPipelineMap, MAP.x, MAP.y],
  [faMonitor('fa11-wall', 62, 26), WALL.x, WALL.y],
  [stripFrame, GLASS.x, GLASS.y],
  [calendar, CALENDAR.x, CALENDAR.y],
  [faDesk('fa11-desk', 62), 2, 41],
  [faAnalystBack, ANALYST.x, ANALYST.y],
]);

export const fa11Opener: SceneArt = {
  id: 'fa11-opener',
  label: 'A control room in the data works: a wide wall screen splits a jagged blue series into a gold trend, a teal seasonal wave and red bursts of noise, while the analyst studies it from behind and a wall calendar ticks off the days.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: rawStrip, x: PLOT_X, y: GLASS.y + STRIPS.raw.top },
    { sprite: trendStrip, x: PLOT_X, y: GLASS.y + STRIPS.trend.top },
    { sprite: seasonStrip, x: PLOT_X, y: GLASS.y + STRIPS.season.top },
    { sprite: noiseStrip, x: PLOT_X, y: GLASS.y + STRIPS.noise.top },
    { sprite: calendarPage, x: CALENDAR.x + 1, y: CALENDAR.y + 6 },
    { sprite: faLedChase, x: 52, y: 45 },
    faStageLight('analyze', MAP.x, MAP.y),
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────── */

/**
 * LESSON 11: time series. A bold gold trend climbs left to right, then a bold teal cycle rides on
 * top of it, touching down on the trend at each trough and lifting off between: the series is the
 * trend plus the season. It holds, the screen clears.
 */
export const faEmblemSeries: PixelSprite = (() => {
  const grid = faBlank(16, 11);
  const step = new Map<string, number>();
  const put = (x: number, y: number, ink: string, at: number) => {
    if (y < 0 || y > 10) return;
    grid[y][x] = ink;
    step.set(`${String(x)},${String(y)}`, at);
  };
  const trend = (x: number) => 9 - x * 0.4;
  // The trend, two pixels thick, draws first.
  for (let x = 0; x < 16; x++) {
    const y = Math.round(trend(x));
    put(x, y, 'y', Math.floor(x / 4));
    put(x, y + 1, 'G', Math.floor(x / 4));
  }
  // Then the cycle, two pixels thick, riding on top of it.
  const wave = Array.from({ length: 16 }, (_, x) => Math.round(trend(x) - 1 - 1.75 * (1 - Math.cos((x / 7.5) * Math.PI * 2))));
  for (const [x, y] of faTrace(wave)) {
    put(x, y, 'T', 4 + Math.floor(x / 2));
    put(x, y - 1, 'T', 4 + Math.floor(x / 2));
  }
  return {
    ...faDrawnBy('fa-emblem-series', faRowsOf(grid), (x, y) => step.get(`${String(x)},${String(y)}`) ?? 0, 300, 4),
    name: 'emblem series',
    blurb: 'A gold trend and a teal cycle riding on it.',
  };
})();

export const fa11Finish: SceneArt = faKeepsake(
  'fa11-finish',
  'A gold terminal trophy on a purple stand, its screen drawing a bold gold trend rising and a teal wave riding up and down on top of it, with small sparkles around it.',
  faEmblemSeries,
);

export const art: LessonArtSet = { opener: fa11Opener, backdrop: faBackdrop, finish: fa11Finish };
