/**
 * Financial Analytics lesson 18, automated reporting: the report that builds and sends itself.
 *
 * OPENER. The reporting room, where nobody makes the report by hand any more. The wall dashboard
 * is laid out the lesson's way, an inverted pyramid: four KPI cards on top (portfolio value, daily
 * P&L, value at risk, Sharpe), a line chart and a bar chart in the middle, a table at the bottom.
 * It feeds itself: rows climb out of a database drum beside it and run along a pipe into the
 * screen, blue as they are extracted and teal once transformed, the ETL pipeline. Its numbers
 * blink as they refresh, and a bar along the bezel fills and starts again, one refresh every
 * fifteen seconds; the wall clock's red second hand steps a quarter turn each time the bar starts
 * again, so it goes round once a minute, as a second hand should. The VaR card's border flashes an
 * automated alert and the phone left on the empty console buzzes with it: the alert goes out on its
 * own, no printout, no emailed spreadsheet. The analyst who used to send that spreadsheet stands
 * back with a mug of coffee. The map lights DECIDE.
 *
 * KEEPSAKE. The trophy with a dashboard in three tiers: KPI tiles, a line and a bar chart, two
 * table rows; then the tiles flash white as the numbers refresh.
 */
import { faBackdrop } from './fa-backdrop';
import { faCompose, faConduit, faPacketRun, faPipelineMap } from './fa-kit';
import { faDesk, faDrawnBy, faKeepsake, faMonitor, faRoom, faStageLight, FA_MONITOR_GLASS } from './fa-kit-a';
import { faBlank, faRowsOf, faTrace, FA_CAST_ANALYST } from './fa-kit-b';
import { faFigure, faHead } from './fa-kit-c';
import { faDbDrum, faDbLeds, faPacketsUp, faRiser, FA_DB_LED_X, FA_DB_W } from './fa-kit-r';
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

/**
 * The red second hand: a quarter turn every fifteen seconds (12, 3, 6, 9 o'clock), so it goes round
 * once a minute like a real second hand, and it steps each time the refresh bar starts again.
 */
const secondHand: PixelSprite = (() => {
  const reach: readonly (readonly (readonly [number, number])[])[] = [
    [[5, 4], [5, 3], [5, 2]],
    [[6, 5], [7, 5], [8, 5]],
    [[5, 6], [5, 7], [5, 8]],
    [[4, 5], [3, 5], [2, 5]],
  ];
  const frames = reach.map((pixels) => {
    const g = faBlank(11, 11);
    for (const [x, y] of pixels) g[y][x] = 'R';
    return faRowsOf(g);
  });
  return { id: 'fa18-second-hand', name: 'second hand', tags: ['scene', 'fa18'], rows: frames[0], frames, frameMs: 15000 };
})();

/* ── the feed and the alert ────────────────────────────────────────────────────────────────── */

/** A phone stood on the console, 6 x 9, its screen dark until the alert lights it. */
const phone: PixelSprite = {
  id: 'fa18-phone',
  name: 'phone',
  tags: ['scene', 'fa18', 'prop'],
  rows: ['.DDDD.', 'DxXXkD', 'DKKKKD', 'DKKKKD', 'DKKKKD', 'DKKKKD', 'DKKKKD', 'DxwXkD', '.DDDD.'],
};
const PHONE_GLASS = { x: 1, y: 2 } as const;
/** The alert on the phone's screen: red, with a white mark. Flashes with the VaR card's border. */
const phoneAlert: PixelSprite = { id: 'fa18-phone-alert', name: 'phone alert', tags: ['scene', 'fa18'], rows: ['RwRR', 'RwRR', 'RwRR', 'RRRR', 'RwRR'] };
/** The phone buzzing: short marks either side of it. */
const buzz: PixelSprite = { id: 'fa18-buzz', name: 'buzz', tags: ['scene', 'fa18'], rows: ['x........x', '.x......x.', 'x........x'] };

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
const DRUM = { x: 22, y: 35 } as const;
/** The feed: a riser up from the drum's lid, then a pipe along into the dashboard's left side. */
const RISER = { x: DRUM.x + 5, y: 17 } as const;
const PIPE = { x: RISER.x, y: 14, length: DASH.x - RISER.x } as const;
const DESK = { x: 40, y: 41 } as const;
const PHONE = { x: 64, y: 32 } as const;
const ANALYST = { x: 5, y: 34 } as const;

const room = faRoom('fa18-opener-room', [
  [DRUM.x + 1, 50, FA_DB_W - 2, 1, 'Z'],
  [DESK.x + 2, 50, 30, 1, 'Z'],
  [ANALYST.x + 2, 58, 11, 1, 'Z'],
]);

/** Where the riser opens into the pipe's channel, so the two read as one run. */
const elbow: PixelSprite = { id: 'fa18-elbow', name: 'elbow', tags: ['scene', 'fa18', 'prop'], rows: ['K'] };

const base = faCompose('fa18-opener-base', room, [
  [faPipelineMap, MAP.x, MAP.y],
  [clock, CLOCK.x, CLOCK.y],
  [faMonitor('fa18-dash', DASH.w, DASH.h), DASH.x, DASH.y],
  [board, GLASS.x, GLASS.y],
  [faRiser('fa18-riser', DRUM.y + 1 - RISER.y), RISER.x, RISER.y],
  [faConduit('fa18-pipe', PIPE.length, 9), PIPE.x, PIPE.y],
  [elbow, RISER.x + 2, PIPE.y + 3],
  [faDbDrum('fa18-drum', 'B', 'b'), DRUM.x, DRUM.y],
  [faDesk('fa18-desk', 34), DESK.x, DESK.y],
  [phone, PHONE.x, PHONE.y],
  [analyst, ANALYST.x, ANALYST.y],
]);

/** Rows extracted from the drum climb the riser in blue; transformed, they run on in teal. */
const extracted = faPacketsUp('fa18-extracted', DRUM.y - (PIPE.y + 3), 'B', 6, 170);
const loaded = faPacketRun('fa18-loaded', PIPE.length - 3, [[Infinity, 'T']], 6, 170);

export const fa18Opener: SceneArt = {
  id: 'fa18-opener',
  label: 'A reporting room in the data plant: a database pipes its rows into a wall dashboard of number cards, charts and a table that refreshes itself every fifteen seconds as the wall clock steps its second hand a quarter turn, a red alert flashes on one card and buzzes a phone on the empty console, and the analyst stands back with a mug of coffee.',
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
    { sprite: phoneAlert, x: PHONE.x + PHONE_GLASS.x, y: PHONE.y + PHONE_GLASS.y, motion: { kind: 'twinkle', periodMs: 1000, min: 0 } },
    { sprite: buzz, x: PHONE.x - 2, y: PHONE.y + 3, motion: { kind: 'twinkle', periodMs: 1000, min: 0 } },
    { sprite: refresh, x: GLASS.x, y: DASH.y + DASH.h - 2 },
    { sprite: secondHand, x: CLOCK.x, y: CLOCK.y },
    { sprite: extracted, x: RISER.x + 2, y: PIPE.y + 3 },
    { sprite: loaded, x: RISER.x + 2, y: PIPE.y + 2 },
    { sprite: faDbLeds('fa18-drum-leds', 'N'), x: DRUM.x + FA_DB_LED_X, y: DRUM.y },
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
