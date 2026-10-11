/**
 * Financial Analytics lesson 16, SQL: asking the database for exactly the rows you need.
 *
 * OPENER. The data vault. Two database drums stand at the back, trades (blue bands) and prices
 * (teal bands), their lights blinking. A pipe runs over them: prices flow out of the far drum, the
 * trades drum joins its rows to them (the JOIN, packets alternating blue and teal), and the joined
 * stream runs into the wall screen. On the screen, the lesson's query in coloured code (SELECT,
 * FROM trades JOIN prices, WHERE, ORDER BY) with its cursor blinking, and under it the results
 * table filling in row by row, the market values shrinking down the list. The analyst sits at the
 * console with their back to us, typing, and the map lights COLLECT.
 *
 * KEEPSAKE. The trophy with a database: a stack of three blue disks building up, then the middle
 * one lit gold, the rows the query selected.
 */
import { faBackdrop } from './fa-backdrop';
import { faCompose, faConduit, faPipelineMap } from './fa-kit';
import { faDesk, faDrawnBy, faKeepsake, faMonitor, faRoom, faStageLight, FA_MONITOR_GLASS } from './fa-kit-a';
import { faBlank, faPacketsLeft, faRowsOf, faSeatedBack, FA_CAST_ANALYST } from './fa-kit-b';
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';

/* ── the vault ─────────────────────────────────────────────────────────────────────────────── */

/**
 * A database drum, 12 x 30: a lit top, four platters each ringed by a band in the table's colour,
 * an LED socket on each (rows 6, 12, 18 and 24, column 8), feet on the bottom row.
 */
function drum(id: string, lit: string, dark: string): PixelSprite {
  const platter = ['DxDDDDDDDDkD', 'DxXXXXXXXXkD', 'DxXXXXXXKXkD', 'DxXXXXXXXXkD', 'DxXXXXXXXXkD', `D${lit}${dark.repeat(9)}D`];
  return {
    id,
    name: id,
    tags: ['scene', 'fa16', 'station'],
    rows: [
      '..DDDDDDDD..',
      '.DxwwwwxxXD.',
      'DxwxxxxxxxXD',
      'DXxxxxxxxXXD',
      ...platter, ...platter, ...platter, ...platter.slice(0, 5),
      '.DDDDDDDDDD.',
      '..DDDDDDDD..',
      '..DkD..DkD..',
    ],
  };
}
const LED_ROWS: readonly number[] = [6, 12, 18, 24];

/** A short pipe from the main pipe down into a drum's lid, 5 x 2. */
const stub: PixelSprite = { id: 'fa16-stub', name: 'stub', tags: ['scene', 'fa16', 'prop'], rows: ['DxXkD', 'DxXkD'] };

/**
 * The query on the screen's glass, in coloured tokens: keywords in orchid, tables in their drums'
 * colours, columns in white, the date in gold. Four lines, a row of space between each.
 */
const query: PixelSprite = (() => {
  const lines = [
    'qqqqqq.wwwwww.TTTTTTTT',
    'qqqq.BBBBBB.qqqq.TTTTTT',
    'qqqqq.wwww.x.yyyyy',
    'qqqqqqqq.wwwwww',
  ];
  const grid = faBlank(24, 7);
  lines.forEach((line, k) => [...line].forEach((ch, x) => { if (ch !== '.') grid[k * 2][x] = ch; }));
  return { id: 'fa16-query', name: 'query', tags: ['scene', 'fa16'], rows: faRowsOf(grid) };
})();
const CURSOR = { x: 16, y: 6 } as const;

/** The results: a gold header, a rule, then three rows landing in order, values shrinking. */
const results: PixelSprite = (() => {
  const grid = faBlank(24, 8);
  const step = new Map<string, number>();
  const put = (x: number, y: number, ink: string, at: number) => { grid[y][x] = ink; step.set(`${String(x)},${String(y)}`, at); };
  for (const [from, to] of [[0, 5], [8, 17], [20, 23]] as const) for (let x = from; x <= to; x++) put(x, 0, 'y', 0);
  for (let x = 0; x < 24; x++) put(x, 1, 'D', 0);
  [8, 7, 6].forEach((value, k) => {
    const y = 3 + k * 2;
    for (let x = 0; x < 4; x++) put(x, y, 'w', k + 1);
    for (let x = 8; x < 8 + value; x++) put(x, y, 'N', k + 1);
    for (let x = 20; x < 23; x++) put(x, y, 'x', k + 1);
  });
  return faDrawnBy('fa16-results', faRowsOf(grid), (x, y) => step.get(`${String(x)},${String(y)}`) ?? 0, 520, 6);
})();

/* Where things stand. */
const MAP = { x: 2, y: 1 } as const;
const SCREEN = { x: 2, y: 9 } as const;
const GLASS = { x: SCREEN.x + FA_MONITOR_GLASS.x, y: SCREEN.y + FA_MONITOR_GLASS.y } as const;
const DRUM_A = { x: 49, y: 19 } as const;
const DRUM_B = { x: 65, y: 19 } as const;
const PIPE = { x: 44, y: 12, length: 31 } as const;
const ANALYST = { x: 16, y: 34 } as const;

const room = faRoom('fa16-opener-room', [
  [DRUM_A.x + 1, 50, 28, 1, 'Z'],
  [DRUM_A.x + 1, 51, 26, 1, 'Z'],
  [4, 50, 40, 1, 'Z'],
  [ANALYST.x + 3, 58, 10, 2, 'Z'],
]);

const base = faCompose('fa16-opener-base', room, [
  [faPipelineMap, MAP.x, MAP.y],
  [faMonitor('fa16-screen', 42, 25), SCREEN.x, SCREEN.y],
  [query, GLASS.x + 1, GLASS.y],
  [faConduit('fa16-pipe', PIPE.length, 8), PIPE.x, PIPE.y],
  [stub, DRUM_A.x + 4, PIPE.y + 5],
  [stub, DRUM_B.x + 4, PIPE.y + 5],
  [drum('fa16-drum-trades', 'B', 'b'), DRUM_A.x, DRUM_A.y],
  [drum('fa16-drum-prices', 'T', 't'), DRUM_B.x, DRUM_B.y],
  [faDesk('fa16-desk', 42), 2, 41],
  [faSeatedBack('fa16-analyst', FA_CAST_ANALYST), ANALYST.x, ANALYST.y],
]);

/* ── moving parts ──────────────────────────────────────────────────────────────────────────── */

/** Prices leaving their drum for the join; past the trades drum the stream carries both. */
const JOIN_X = DRUM_A.x + 6;
const prices = faPacketsLeft('fa16-prices', DRUM_B.x + 6 - JOIN_X, ['T'], 6, 170);
const joined = faPacketsLeft('fa16-joined', JOIN_X - PIPE.x - 1, ['B', 'T'], 6, 170);

/** A drum's lights, each blinking on its own beat. */
function drumLeds(id: string, ink: string, offset: number): PixelSprite {
  const frames = Array.from({ length: 6 }, (_, f) =>
    Array.from({ length: 19 }, (_, y) => (LED_ROWS.includes(y + 6) && (y + f + offset) % 4 !== 0 ? ink : '.')));
  return { id, name: id, tags: ['scene', 'fa16'], rows: frames[0], frames, frameMs: 330 };
}

const cursor: PixelSprite = { id: 'fa16-cursor', name: 'cursor', tags: ['scene', 'fa16'], rows: ['w'] };

export const fa16Opener: SceneArt = {
  id: 'fa16-opener',
  label: 'A data vault in the plant: two database drums pipe their rows along a join into a wall screen running a coloured SQL query, the results table fills in row by row, and the analyst sits typing at the console with their back to us.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: results, x: GLASS.x + 1, y: GLASS.y + 9 },
    { sprite: cursor, x: GLASS.x + 1 + CURSOR.x, y: GLASS.y + CURSOR.y, motion: { kind: 'twinkle', periodMs: 900, min: 0 } },
    { sprite: prices, x: JOIN_X, y: PIPE.y + 2 },
    { sprite: joined, x: PIPE.x + 1, y: PIPE.y + 2 },
    { sprite: drumLeds('fa16-leds-trades', 'B', 0), x: DRUM_A.x + 8, y: DRUM_A.y + 6 },
    { sprite: drumLeds('fa16-leds-prices', 'N', 2), x: DRUM_B.x + 8, y: DRUM_B.y + 6 },
    faStageLight('collect', MAP.x, MAP.y),
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────── */

/**
 * LESSON 16: SQL. A database, a stack of three blue disks under a lit top, builds from the bottom
 * up; then its middle disk turns gold, the rows the query selected, and holds, and the screen
 * clears.
 */
export const faEmblemDatabase: PixelSprite = (() => {
  const full = [
    '....wwwwwwww....',
    '..wwBBBBBBBBww..',
    '..BwwwwwwwwwwB..',
    '..BBBBBBBBBBBb..',
    '..bbbbbbbbbbbb..',
    '..BwwwwwwwwwwB..',
    '..BBBBBBBBBBBb..',
    '..bbbbbbbbbbbb..',
    '..BwwwwwwwwwwB..',
    '..BBBBBBBBBBBb..',
    '....bbbbbbbb....',
  ];
  const drawn = faDrawnBy('fa-emblem-database', full, (_x, y) => (y >= 9 ? 0 : y >= 6 ? 1 : y >= 3 ? 2 : 3), 360, 4);
  const frames = drawn.frames ?? [drawn.rows];
  // The selected rows: the middle disk lights gold for the rest of the hold.
  const select = (rows: readonly string[]) => rows.map((row, y) => (y === 6 ? row.replace(/B/g, 'y').replace(/b/g, 'G') : y === 7 ? row.replace(/b/g, 'g') : row));
  for (const f of [5, 6, 7]) frames[f] = select(frames[f]);
  return { ...drawn, name: 'emblem database', blurb: 'A database of three disks, the middle one selected in gold.', frames };
})();

export const fa16Finish: SceneArt = faKeepsake(
  'fa16-finish',
  'A gold terminal trophy on a purple stand, its screen building a database of three stacked blue disks, then lighting the middle disk gold, with small sparkles around it.',
  faEmblemDatabase,
);

export const art: LessonArtSet = { opener: fa16Opener, backdrop: faBackdrop, finish: fa16Finish };
