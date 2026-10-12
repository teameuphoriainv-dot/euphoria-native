/**
 * Financial Analytics lesson 18, automated reporting: the report that builds and sends itself.
 *
 * OPENER. The reporting room, where nobody makes the report by hand any more. The wall dashboard
 * is laid out the lesson's way, an inverted pyramid: four KPI cards on top (portfolio value, daily
 * P&L, value at risk, Sharpe), a line chart and a bar chart in the middle, a table at the bottom.
 * Its numbers blink as they refresh, the VaR card's border flashes an automated alert, and a bar
 * along the bezel fills and starts again, one refresh every fifteen seconds; the wall clock's red
 * second hand goes round on the same fifteen. The DECIDE slot prints the report on its own, page
 * after page, the console under the screen stands empty, and the analyst, who used to email the
 * spreadsheet, stands back with a mug of coffee. The map lights DECIDE.
 *
 * KEEPSAKE. The trophy with a dashboard in three tiers: KPI tiles, a line and a bar chart, two
 * table rows; then the tiles flash white as the numbers refresh.
 */
import { faBackdrop } from './fa-backdrop';
import { faCompose, faLamp, faOutputSlot, faPipelineMap, FA_OUTPUT_LAMP } from './fa-kit';
import { faDesk, faDrawnBy, faKeepsake, faMonitor, faRoom, faStageLight, FA_MONITOR_GLASS } from './fa-kit-a';
import { faBlank, faRowsOf, faTrace, FA_CAST_ANALYST } from './fa-kit-b';
import { faFigure, faHead, faPage } from './fa-kit-c';
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';

/* ── the dashboard ─────────────────────────────────────────────────────────────────────────── */

/**
 * The four KPI cards, left to right: where each sits on the glass, its value's resting ink (a
 * layer lights it a step brighter) and which way the day went.
 */
const KPI = [
  { x: 0, rest: 'G', lit: 'y', delta: 'up' },
  { x: 9, rest: 'n', lit: 'N', delta: 'up' },
  { x: 18, rest: 'r', lit: 'R', delta: 'down' },
  { x: 27, rest: 't', lit: 'T', delta: 'up' },
] as const;
const VAR_CARD = KPI[2];

/** The dashboard on the screen's glass, 36 x 22: KPI cards, two charts, a table, top to bottom. */
const board: PixelSprite = (() => {
  const g = faBlank(36, 22);
  const fill = (x: number, y: number, w: number, h: number, ch: string) => {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) g[j][i] = ch;
  };
  for (const { x, rest, delta } of KPI) {
    fill(x, 0, 8, 6, 'k');
    fill(x + 1, 1, 4, 1, 'X');
    fill(x + 1, 3, 3, 2, rest);
    const arrow = delta === 'up' ? ['.N.', 'NNN'] : ['RRR', '.R.'];
    arrow.forEach((row, j) => [...row].forEach((ch, i) => { if (ch !== '.') g[3 + j][x + 5 + i] = ch; }));
  }
  fill(0, 8, 17, 8, 'k');
  fill(19, 8, 17, 8, 'k');
  for (const [x, y] of faTrace([5, 4, 4, 5, 3, 4, 3, 2, 3, 2, 1, 2, 1, 1, 0])) g[9 + y][1 + x] = 'N';
  [3, 5, 4, 6, 5].forEach((h, k) => {
    for (let j = 0; j < h; j++) {
      g[14 - j][20 + k * 3] = 'T';
      g[14 - j][21 + k * 3] = 't';
    }
  });
  fill(0, 17, 5, 1, 'X');
  fill(7, 17, 10, 1, 'X');
  fill(27, 17, 5, 1, 'X');
  for (const [y, w, change] of [[19, 9, 'N'], [21, 8, 'R']] as const) {
    fill(0, y, 4, 1, 'w');
    fill(7, y, w, 1, 'x');
    fill(28, y, 3, 1, change);
  }
  return { id: 'fa18-board', name: 'dashboard', tags: ['scene', 'fa18'], rows: faRowsOf(g) };
})();

/** A KPI value lit a step brighter than its resting ink, so its twinkle reads as a refresh. */
const value = (ink: string): PixelSprite => ({ id: `fa18-value-${ink}`, name: 'kpi value', tags: ['scene', 'fa18'], rows: [ink.repeat(3), ink.repeat(3)] });

/** The automated alert: a red border around the VaR card, flashing. */
const alert: PixelSprite = {
  id: 'fa18-alert',
  name: 'alert',
  tags: ['scene', 'fa18'],
  rows: ['RRRRRRRR', 'R......R', 'R......R', 'R......R', 'R......R', 'RRRRRRRR'],
};

/** The refresh bar along the bezel, filling over fifteen one-second beats, then starting again. */
const REFRESH_W = 36;
const refresh: PixelSprite = (() => {
  const frames = Array.from({ length: 15 }, (_, k) => [Array.from({ length: REFRESH_W }, (_, x) => (x < Math.round((REFRESH_W * (k + 1)) / 15) ? 'N' : '.')).join('')]);
  return { id: 'fa18-refresh', name: 'refresh bar', tags: ['scene', 'fa18'], rows: frames[14], frames, frameMs: 1000 };
})();

/* ── the clock ─────────────────────────────────────────────────────────────────────────────── */

/** A wall clock, 11 x 11: white face lit from the left, hour marks, the hands at nine o'clock. */
const clock: PixelSprite = {
  id: 'fa18-clock',
  name: 'clock',
  tags: ['scene', 'fa18', 'prop'],
  rows: [
    '...DDDDD...',
    '.DDwwwwwDD.',
    '.DwwwKwwxD.',
    'DwwwwKwwwxD',
    'DwwwwKwwwxD',
    'DwKKKKwwKxD',
    'DwwwwwwwwxD',
    'DwwwwwwwwxD',
    '.DwwwKwwxD.',
    '.DDxxxxxDD.',
    '...DDDDD...',
  ],
};

/** The red second hand: eight steps of 1875ms, once round every fifteen seconds, like the refresh. */
const secondHand: PixelSprite = (() => {
  const reach: readonly (readonly (readonly [number, number])[])[] = [
    [[5, 4], [5, 3], [5, 2]],
    [[6, 4], [7, 3], [8, 2]],
    [[6, 5], [7, 5], [8, 5]],
    [[6, 6], [7, 7], [8, 8]],
    [[5, 6], [5, 7], [5, 8]],
    [[4, 6], [3, 7], [2, 8]],
    [[4, 5], [3, 5], [2, 5]],
    [[4, 4], [3, 3], [2, 2]],
  ];
  const frames = reach.map((pixels) => {
    const g = faBlank(11, 11);
    for (const [x, y] of pixels) g[y][x] = 'R';
    return faRowsOf(g);
  });
  return { id: 'fa18-second-hand', name: 'second hand', tags: ['scene', 'fa18'], rows: frames[0], frames, frameMs: 1875 };
})();

/* ── the analyst ───────────────────────────────────────────────────────────────────────────── */

/**
 * The analyst with nothing left to do by hand: no tablet, one hand at the side, the other raising
 * a white mug of coffee to the chest, out beside the body so its steam clears the head. 16 x 24;
 * the mug's rim is the dark coffee at MUG.
 */
const analyst = faFigure('fa18-analyst', FA_CAST_ANALYST, [
  ...faHead(FA_CAST_ANALYST).map((row) => `${row}....`),
  '..TTtwwttv......',
  '.TTtPwwPttv.DOOD',
  '.TTttPPtttvSwwxD',
  '.TTttwwtttvSwwxD',
  '.TTttwwtttvvDDDD',
  '.TTtttttttvv....',
  'STTtttttttv.....',
  'STTtttttttv.....',
  '..TTttttvv......',
  '..Tttttttv......',
  '..DDDDDDkk......',
  '..DDD..Dkk......',
  '..DDD..Dkk......',
  '.OOOO..OOOO.....',
], 'The analyst, front on, raising a mug of coffee.');
const MUG = { x: 13, y: 11 } as const;

/** A wisp of steam off the coffee. Give it a `rise`. */
const steam: PixelSprite = { id: 'fa18-steam', name: 'steam', tags: ['scene', 'fa18'], rows: ['w', 'x'] };

/* ── the room ──────────────────────────────────────────────────────────────────────────────── */

/* Where things stand. */
const MAP = { x: 2, y: 1 } as const;
const CLOCK = { x: 13, y: 11 } as const;
const DASH = { x: 36, y: 2, w: 42, h: 28 } as const;
const GLASS = { x: DASH.x + FA_MONITOR_GLASS.x, y: DASH.y + FA_MONITOR_GLASS.y } as const;
const OUTPUT = { x: 24, y: 30 } as const;
const DESK = { x: 40, y: 41 } as const;
const ANALYST = { x: 5, y: 34 } as const;

const room = faRoom('fa18-opener-room', [
  [OUTPUT.x + 1, 50, 9, 1, 'Z'],
  [DESK.x + 2, 50, 30, 1, 'Z'],
  [ANALYST.x + 2, 58, 11, 1, 'Z'],
]);

const base = faCompose('fa18-opener-base', room, [
  [faPipelineMap, MAP.x, MAP.y],
  [clock, CLOCK.x, CLOCK.y],
  [faMonitor('fa18-dash', DASH.w, DASH.h), DASH.x, DASH.y],
  [board, GLASS.x, GLASS.y],
  [faOutputSlot, OUTPUT.x, OUTPUT.y],
  [faDesk('fa18-desk', 34), DESK.x, DESK.y],
  [analyst, ANALYST.x, ANALYST.y],
]);

export const fa18Opener: SceneArt = {
  id: 'fa18-opener',
  label: 'A reporting room in the data plant: a wall dashboard of number cards, charts and a table refreshes itself while a red alert flashes on one card, a wall clock ticks off fifteen seconds, a printer issues the report on its own, and the analyst stands back with a mug of coffee.',
  width: 80,
  height: 60,
  base,
  layers: [
    ...KPI.map(({ x, lit }, k) => ({
      sprite: value(lit),
      x: GLASS.x + x + 1,
      y: GLASS.y + 3,
      motion: { kind: 'twinkle' as const, periodMs: 1500 + k * 230, phase: k * 0.27, min: 0.2 },
    })),
    { sprite: alert, x: GLASS.x + VAR_CARD.x, y: GLASS.y, motion: { kind: 'twinkle', periodMs: 1000, min: 0 } },
    { sprite: refresh, x: GLASS.x, y: DASH.y + DASH.h - 2 },
    { sprite: secondHand, x: CLOCK.x, y: CLOCK.y },
    { sprite: faPage, x: OUTPUT.x + 1, y: OUTPUT.y - 9, motion: { kind: 'rise', amp: 5, periodMs: 2600 } },
    { sprite: faLamp, x: OUTPUT.x + FA_OUTPUT_LAMP.x, y: OUTPUT.y + FA_OUTPUT_LAMP.y, motion: { kind: 'twinkle', periodMs: 1300, min: 0.3 } },
    { sprite: steam, x: ANALYST.x + MUG.x, y: ANALYST.y + MUG.y - 3, motion: { kind: 'rise', amp: 6, periodMs: 2100 } },
    { sprite: steam, x: ANALYST.x + MUG.x + 1, y: ANALYST.y + MUG.y - 2, motion: { kind: 'rise', amp: 5, periodMs: 2500, phase: 0.5 } },
    { sprite: steam, x: ANALYST.x + MUG.x - 1, y: ANALYST.y + MUG.y - 4, motion: { kind: 'rise', amp: 4, periodMs: 2300, phase: 0.25 } },
    faStageLight('decide', MAP.x, MAP.y),
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────── */

/**
 * LESSON 18: automated reporting. A dashboard in the inverted pyramid: four gold KPI tiles land
 * across the top, then a green line chart and three teal bars, then two table rows; while it
 * holds, the tiles flash white as the numbers refresh, and the screen clears.
 */
export const faEmblemDashboard: PixelSprite = (() => {
  const full = [
    'yyy.yyy.yyy.yyy.',
    'GGg.GGg.GGg.GGg.',
    '................',
    '....NN.....Tt...',
    '..NNNN.....Tt.Tt',
    'NNNN....Tt.Tt.Tt',
    'NN......Tt.Tt.Tt',
    '................',
    'wwww.xxxxxxx.NN.',
    '................',
    'wwww.xxxxxx..RR.',
  ];
  const step = (x: number, y: number) => {
    if (y <= 1) return Math.floor(x / 4);
    if (y <= 6) return x <= 5 ? 4 + Math.floor(x / 2) : 7 + Math.floor((x - 8) / 3);
    return y === 8 ? 10 : 11;
  };
  const drawn = faDrawnBy('fa-emblem-dashboard', full, step, 240, 5);
  const frames = drawn.frames ?? [drawn.rows];
  // The refresh: the tiles flash white on one beat of the hold.
  frames[13] = frames[13].map((row, y) => (y <= 1 ? row.replace(/[yGg]/g, 'w') : row));
  return { ...drawn, name: 'emblem dashboard', blurb: 'A dashboard of KPI tiles, two charts and a table.', frames };
})();

export const fa18Finish: SceneArt = faKeepsake(
  'fa18-finish',
  'A gold terminal trophy on a purple stand, its screen building a dashboard of gold number tiles over a green line chart, teal bars and a table, the tiles flashing as they refresh, with small sparkles around it.',
  faEmblemDashboard,
);

export const art: LessonArtSet = { opener: fa18Opener, backdrop: faBackdrop, finish: fa18Finish };
