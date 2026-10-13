/**
 * Financial Analytics lesson 16, SQL: asking the database for exactly the rows you need.
 *
 * OPENER. The data vault. Two databases stand at the back, drawn as the stacked-disk symbol: trades
 * (blue bands) and prices (teal bands), their lights blinking. Their rows climb out of the lids into
 * a pipe overhead, the trades joining the prices on the way (packets alternating blue and teal), and
 * the stream runs into the wall screen. On the screen, the lesson's query in one line of coloured
 * code (SELECT, FROM trades JOIN prices) with its cursor blinking, and under it the JOIN itself: the
 * trades table (blue header, its symbol column on the right) and the prices table (teal header, its
 * symbol column on the left) slide together until their symbol columns meet, each symbol (white,
 * gold, pink) beside its own, the matched rows light, and the joined rows land in the results table
 * one by one, each a symbol, a blue cell from trades, a teal cell from prices and a green market
 * value, the values shrinking down the list (ORDER BY market_value DESC). The analyst sits at the
 * console with their back to us, typing, and the map lights COLLECT.
 *
 * KEEPSAKE. The trophy with a database: a stack of three blue disks building up, then the middle
 * one lit gold, the rows the query selected, which is how it rests.
 */
import { faBackdrop } from './fa-backdrop';
import { faCompose, faConduit, faPipelineMap } from './fa-kit';
import { faDesk, faDrawnBy, faKeepsake, faMonitor, faRoom, faStageLight, FA_MONITOR_GLASS } from './fa-kit-a';
import { faBlank, faPacketsLeft, faRowsOf, faSeatedBack, FA_CAST_ANALYST } from './fa-kit-b';
import { faDbDrum, faDbLeds, faPacketsUp, faRiser, FA_DB_LED_X } from './fa-kit-r';
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';

/* ── the screen ────────────────────────────────────────────────────────────────────────────── */

/**
 * The query on the screen's glass, one line of coloured tokens (SELECT, a column, FROM, trades in
 * its drum's blue, JOIN, prices in teal), then the results table's gold header and its rule. The
 * two source tables and the results' rows are drawn by the join layer.
 */
const GLASS_W = 36;
const RESULTS_Y = 11;
const page: PixelSprite = (() => {
  const g = faBlank(GLASS_W, 19);
  [...'qqqqqq.ww.qqqq.BBBBBB.qqqq.TTTTTT'].forEach((ch, x) => { if (ch !== '.') g[0][x] = ch; });
  for (const [from, to] of [[0, 1], [4, 12], [15, 26], [30, 33]] as const) for (let x = from; x <= to; x++) g[RESULTS_Y][x] = 'y';
  for (let x = 0; x < GLASS_W; x++) g[RESULTS_Y + 1][x] = 'D';
  return { id: 'fa16-page', name: 'query page', tags: ['scene', 'fa16'], rows: faRowsOf(g) };
})();
const CURSOR = { x: 34, y: 0 } as const;

/**
 * The JOIN, 36 x 17 under the query: the trades table (values, then its symbol column) and the
 * prices table (its symbol column, then values) slide in from either side four steps until the
 * two symbol columns meet in the middle, every symbol beside its own; the matched values light;
 * then the joined rows land in the results table one a beat (symbol, a blue trades cell, a teal
 * prices cell, a green market value shrinking down the list, a grey share), hold, and clear.
 */
const KEYS = ['w', 'y', 'F'] as const;
const join: PixelSprite = (() => {
  const W = 10;
  const table = (g: string[][], x0: number, head: string, keyLeft: boolean, lit: boolean) => {
    for (let x = 0; x < W; x++) g[0][x0 + x] = head;
    KEYS.forEach((key, k) => {
      const y = 2 + k * 2;
      for (let x = 0; x < W; x++) {
        const inKey = keyLeft ? x < 2 : x >= W - 2;
        const inValue = keyLeft ? x >= 5 : x < 5;
        if (inKey) g[y][x0 + x] = key;
        else if (inValue) g[y][x0 + x] = lit ? 'w' : 'x';
      }
    });
  };
  const VALUES = [12, 10, 9] as const;
  const result = (g: string[][], k: number) => {
    const y = RESULTS_Y + 3 + k * 2 - 2;
    for (let x = 0; x < 2; x++) g[y][x] = KEYS[k];
    for (let x = 4; x < 8; x++) g[y][x] = 'B';
    for (let x = 9; x < 13; x++) g[y][x] = 'T';
    for (let x = 15; x < 15 + VALUES[k]; x++) g[y][x] = 'N';
    for (let x = 30; x < 33; x++) g[y][x] = 'x';
  };
  const frame = (step: number, lit: boolean, rows: number) => {
    const g = faBlank(GLASS_W, 17);
    table(g, step * 2, 'B', false, lit);
    table(g, GLASS_W - W - step * 2, 'T', true, lit);
    for (let k = 0; k < rows; k++) result(g, k);
    return faRowsOf(g);
  };
  const frames = [
    frame(0, false, 0), frame(1, false, 0), frame(2, false, 0), frame(3, false, 0), frame(4, false, 0),
    frame(4, true, 0), frame(4, false, 1), frame(4, false, 2), frame(4, false, 3),
    frame(4, false, 3), frame(4, false, 3), frame(4, false, 3), frame(4, false, 3),
    faRowsOf(faBlank(GLASS_W, 17)),
  ];
  return { id: 'fa16-join', name: 'join', tags: ['scene', 'fa16'], rows: frames[8], frames, frameMs: 420 };
})();

/* ── the vault ─────────────────────────────────────────────────────────────────────────────── */

/* Where things stand. */
const MAP = { x: 2, y: 1 } as const;
const SCREEN = { x: 2, y: 9 } as const;
const GLASS = { x: SCREEN.x + FA_MONITOR_GLASS.x, y: SCREEN.y + FA_MONITOR_GLASS.y } as const;
const BANDS = 3;
const BAND_ROWS = 3;
const DRUM_A = { x: 46, y: 32 } as const;
const DRUM_B = { x: 63, y: 32 } as const;
const PIPE = { x: 44, y: 21, length: 29 } as const;
/** Each riser stands on its drum's lid, its channel over the lid's middle. */
const RISER_Y = PIPE.y + 3;
const RISER_H = DRUM_A.y + 1 - RISER_Y;
const riserX = (drum: { x: number }) => drum.x + 5;
const ANALYST = { x: 16, y: 34 } as const;

const room = faRoom('fa16-opener-room', [
  [DRUM_A.x + 1, 50, 32, 1, 'Z'],
  [DRUM_A.x + 2, 51, 30, 1, 'Z'],
  [4, 50, 40, 1, 'Z'],
  [ANALYST.x + 3, 58, 10, 2, 'Z'],
]);

const base = faCompose('fa16-opener-base', room, [
  [faPipelineMap, MAP.x, MAP.y],
  [faMonitor('fa16-screen', 42, 25), SCREEN.x, SCREEN.y],
  [page, GLASS.x, GLASS.y],
  [faRiser('fa16-riser-trades', RISER_H), riserX(DRUM_A), RISER_Y],
  [faRiser('fa16-riser-prices', RISER_H), riserX(DRUM_B), RISER_Y],
  [faConduit('fa16-pipe', PIPE.length, 8), PIPE.x, PIPE.y],
  [faDbDrum('fa16-drum-trades', 'B', 'b', BANDS, BAND_ROWS), DRUM_A.x, DRUM_A.y],
  [faDbDrum('fa16-drum-prices', 'T', 't', BANDS, BAND_ROWS), DRUM_B.x, DRUM_B.y],
  [faDesk('fa16-desk', 42), 2, 41],
  [faSeatedBack('fa16-analyst', FA_CAST_ANALYST), ANALYST.x, ANALYST.y],
]);

/* ── moving parts ──────────────────────────────────────────────────────────────────────────── */

/** Rows climbing out of each drum, prices along the pipe to the trades riser, then both together. */
const JOIN_X = riserX(DRUM_A) + 2;
const UP_H = DRUM_A.y - (PIPE.y + 4);
const prices = faPacketsLeft('fa16-prices', riserX(DRUM_B) + 2 - JOIN_X, ['T'], 6, 170);
const joined = faPacketsLeft('fa16-joined', JOIN_X - PIPE.x - 1, ['B', 'T'], 6, 170);

const cursor: PixelSprite = { id: 'fa16-cursor', name: 'cursor', tags: ['scene', 'fa16'], rows: ['w'] };

export const fa16Opener: SceneArt = {
  id: 'fa16-opener',
  label: 'A data vault in the plant: two stacked-disk databases of trades and prices pipe their rows into a wall screen, where under a one-line SQL query the trades table and the prices table slide together until their symbols match and the joined rows land in a results table, while the analyst sits typing at the console with their back to us.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: join, x: GLASS.x, y: GLASS.y + 2 },
    { sprite: cursor, x: GLASS.x + CURSOR.x, y: GLASS.y + CURSOR.y, motion: { kind: 'twinkle', periodMs: 900, min: 0 } },
    { sprite: faPacketsUp('fa16-up-trades', UP_H, 'B', 6, 170), x: riserX(DRUM_A) + 2, y: PIPE.y + 4 },
    { sprite: faPacketsUp('fa16-up-prices', UP_H, 'T', 6, 170), x: riserX(DRUM_B) + 2, y: PIPE.y + 4 },
    { sprite: prices, x: JOIN_X, y: PIPE.y + 2 },
    { sprite: joined, x: PIPE.x + 1, y: PIPE.y + 2 },
    { sprite: faDbLeds('fa16-leds-trades', 'B', BANDS, BAND_ROWS, 0), x: DRUM_A.x + FA_DB_LED_X, y: DRUM_A.y },
    { sprite: faDbLeds('fa16-leds-prices', 'N', BANDS, BAND_ROWS, 2), x: DRUM_B.x + FA_DB_LED_X, y: DRUM_B.y },
    faStageLight('collect', MAP.x, MAP.y),
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────── */

/**
 * LESSON 16: SQL. A database, a stack of three blue disks under a lit top, builds from the bottom
 * up; then its middle disk turns gold, the rows the query selected, and holds gold for five beats
 * before the screen clears. At rest (Reduce Motion) it shows the gold disk too.
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
  const drawn = faDrawnBy('fa-emblem-database', full, (_x, y) => (y >= 9 ? 0 : y >= 6 ? 1 : y >= 3 ? 2 : 3), 360, 6);
  const frames = drawn.frames ?? [drawn.rows];
  // The selected rows: the middle disk lights gold from the beat after the stack is built.
  const select = (rows: readonly string[]) => rows.map((row, y) => (y === 6 ? row.replace(/B/g, 'y').replace(/b/g, 'G') : y === 7 ? row.replace(/b/g, 'g') : row));
  for (let f = 4; f <= 9; f++) frames[f] = select(frames[f]);
  return { ...drawn, name: 'emblem database', blurb: 'A database of three disks, the middle one selected in gold.', rows: select(full), frames };
})();

export const fa16Finish: SceneArt = faKeepsake(
  'fa16-finish',
  'A gold terminal trophy on a purple stand, its screen building a database of three stacked blue disks, then lighting the middle disk gold, with small sparkles around it.',
  faEmblemDatabase,
);

export const art: LessonArtSet = { opener: fa16Opener, backdrop: faBackdrop, finish: fa16Finish };
