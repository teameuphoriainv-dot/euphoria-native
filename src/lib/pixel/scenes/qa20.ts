/**
 * Quantitative Analysis lesson 20, Execution Algorithms & Transaction Costs: the iceberg over the
 * trading floor.
 *
 * Over the floor hangs a board with the lesson's warning drawn on it: transaction costs are an
 * iceberg. Above the waterline the part everyone sees, the FEES; below it, far bigger, what the
 * order itself costs on the way in: the SPREAD it crosses and the IMPACT it makes on the price. A
 * little ship sails at the tip, as every order does. The quant sits at a trading desk in the front
 * row, four screens of slices and schedules and a sand timer, the far row of desks dark behind:
 * trade fast and pay in impact, trade slow and pay in risk. Only small layers move: the ship rocks,
 * the water laps, bubbles rise off the hidden mass, far screens flicker, the sand runs.
 * Keepsake: an hourglass, the trade-off between speed and cost.
 */
import type { PixelSprite } from '../types';
import { qaBackdrop } from './qa-backdrop';
import type { QaStamp } from './qa-kit';
import {
  QA_PALETTE, qaCompose, qaKeepsake, qaLater, qaPath, qaQuantSeated, qaRect, qaRoom, qaScreen, qaText,
} from './qa-kit';
import { qaColumns } from './qa-kit-c';
import type { LessonArtSet, SceneArt } from './types';

/* ── the board: the cost iceberg ───────────────────────────────────────────────────────────────── */

const BOARD = { x: 4, y: 1, width: 72, height: 28 } as const;
/** The picture inside the board's bezel, 68x24, in scene pixels. */
const PIC = { x: BOARD.x + 2, y: BOARD.y + 2, width: 68, height: 24 } as const;
const WATER_Y = 7;

/**
 * The berg's outline, [left, right] per row of the picture from row 1: a narrow tip up to the
 * waterline, then a far wider mass below it, cut in straight facets like ice, not a rounded rock.
 */
const BERG: readonly (readonly [number, number])[] = [
  [30, 31], [29, 32], [27, 33], [26, 35], [25, 36], [23, 38], [22, 39],
  [18, 43], [15, 46], [12, 49], [10, 52], [8, 54], [6, 56], [7, 55], [9, 53], [11, 51], [13, 50], [15, 48], [17, 46], [20, 43],
  [23, 40], [26, 37], [29, 34],
];

/** One row of ice: lit on its left edge, shaded on its right, `body` between. */
const ice = ([l, r]: readonly [number, number], body: string, lit: string, shade: string) =>
  [...Array(PIC.width)].map((_, x) => (x < l || x > r ? '.' : x === l ? lit : x >= r - 1 ? shade : body)).join('');

const berg: PixelSprite = {
  id: 'qa20-berg',
  name: 'qa20-berg',
  tags: ['scene', 'qa20'],
  blurb: 'The iceberg: a small white tip above the waterline, a far bigger mass under it, blue through the water.',
  rows: [
    '.'.repeat(PIC.width),
    ...BERG.map((row, i) => (i <= WATER_Y - 1 ? ice(row, 'w', 'W', 'x') : ice(row, 'B', 'w', 'b'))),
  ],
};

/** A few faint stars over the sea. */
const STARS = [[6, 0], [56, 0], [42, 2], [63, 4]] as const;
const stars: PixelSprite = {
  id: 'qa20-stars',
  name: 'qa20-stars',
  tags: ['scene', 'qa20'],
  rows: [...Array(WATER_Y)].map((_, y) => [...Array(PIC.width)].map((_, x) => (STARS.some(([sx, sy]) => sx === x && sy === y) ? 'x' : '.')).join('')),
};

const picture = qaCompose('qa20-picture', PIC.width, PIC.height, [
  { sprite: qaRect('qa20-sea', PIC.width, PIC.height - WATER_Y - 1, 'b'), x: 0, y: WATER_Y + 1 },
  { sprite: stars, x: 0, y: 0 },
  { sprite: qaRect('qa20-waterline', PIC.width, 1, 'w'), x: 0, y: WATER_Y },
  { sprite: berg, x: 0, y: 0 },
  { sprite: qaText('qa20-fees', 'FEES', 'w'), x: 8, y: 1 },
  { sprite: qaText('qa20-spread', 'SPREAD', 'K'), x: 20, y: WATER_Y + 2 },
  { sprite: qaText('qa20-impact', 'IMPACT', 'K'), x: 19, y: WATER_Y + 8 },
]);

/** The water lapping along the waterline: crests that travel right. */
const LAP = 24;
const lapFrame = (k: number) => [[...Array(LAP)].map((_, x) => ((x + 6 - k * 2) % 6 === 0 ? 'B' : '.')).join('')];
const lap: PixelSprite = {
  id: 'qa20-lap',
  name: 'qa20-lap',
  tags: ['scene', 'qa20'],
  rows: lapFrame(0),
  frames: [0, 1, 2].map(lapFrame),
  frameMs: 420,
};

/** A little ship at the tip, as every order sails in. */
const ship: PixelSprite = {
  id: 'qa20-ship',
  name: 'qa20-ship',
  tags: ['scene', 'qa20'],
  rows: ['..w...', '..ww..', '..wwx.', 'RRRRRR', '.rrrr.'],
};

const bubble: PixelSprite = { id: 'qa20-bubble', name: 'qa20-bubble', tags: ['scene', 'qa20'], rows: ['.B', 'B.', '..', 'B.'] };

/* ── the trading floor ─────────────────────────────────────────────────────────────────────────── */

/** The far row of desks: small screens in pairs over a dark desk line, empty chairs in front. */
const FAR_Y = 31;
const FAR_SCREENS = [2, 12, 22, 50, 60, 70] as const;
const farRow = qaCompose('qa20-far-row', 80, 9, [
  { sprite: qaRect('qa20-far-desk', 80, 1, 'D'), x: 0, y: 6 },
  ...FAR_SCREENS.flatMap((x, i): QaStamp[] => [
    { sprite: { id: `qa20-far-screen-${String(i)}`, name: 'qa20-far-screen', tags: ['scene', 'qa20'], rows: ['DDDDDDDD', `D${i % 2 === 0 ? 'bb' : 'tt'}DD${i % 3 === 0 ? 'nn' : 'bb'}D`, 'DDDDDDDD', '...DD...'] }, x, y: 1 },
    { sprite: { id: `qa20-far-chair-${String(i)}`, name: 'qa20-far-chair', tags: ['scene', 'qa20'], rows: ['.kkk.', 'kkkkk'] }, x: x + 2, y: 7 },
  ]),
]);

/** A screen on the quant's desk, 12x10 with its stand: a picture inside a dark surface. */
function deskScreen(id: string, chart: PixelSprite): PixelSprite {
  return qaCompose(id, 12, 10, [
    { sprite: qaScreen(`${id}-frame`, 12, 8, { surface: 'K' }), x: 0, y: 0 },
    { sprite: chart, x: 2, y: 2 },
    { sprite: { id: `${id}-stand`, name: 'qa20-stand', tags: ['scene', 'qa20'], rows: ['....DX......', '..DXXXXD....'] }, x: 0, y: 8 },
  ]);
}
const mini = (id: string, rows: string[]): PixelSprite => ({ id, name: id, tags: ['scene', 'qa20'], rows });

/** The day's volume, heavy at the open and the close: the profile VWAP follows. */
const volume = qaColumns('qa20-volume', [4, 3, 2, 1, 2, 4, 1, 2], 4, 'b', 'B');
/** TWAP: the parent order cut into equal child orders. */
const slices = mini('qa20-slices', ['........', 'NN.NN.NN', 'NN.NN.NN', '........']);
/** Almgren-Chriss: trade fast (red, steep) or slow (green, gentle) down to zero. */
const schedules = qaCompose('qa20-schedules', 8, 4, [
  { sprite: qaPath('qa20-slow', 8, 4, [[0, 0], [7, 3]], 'N'), x: 0, y: 0 },
  { sprite: qaPath('qa20-fast', 8, 4, [[0, 0], [1, 2], [2, 3], [7, 3]], 'R'), x: 0, y: 0 },
]);
/** The fill price against VWAP, gold. */
const fills = qaCompose('qa20-fills', 8, 4, [
  { sprite: qaPath('qa20-vwap', 8, 4, [[0, 2], [7, 2]], 'y', [1, 1]), x: 0, y: 0 },
  { sprite: qaPath('qa20-price', 8, 4, [[0, 3], [2, 1], [4, 2], [6, 0], [7, 1]], 'w'), x: 0, y: 0 },
]);

const DESK_Y = 50;
const SCREENS: readonly (readonly [number, PixelSprite])[] = [
  [4, deskScreen('qa20-screen-volume', volume)],
  [17, deskScreen('qa20-screen-slices', slices)],
  [52, deskScreen('qa20-screen-schedules', schedules)],
  [65, deskScreen('qa20-screen-fills', fills)],
];

const desk: PixelSprite = {
  id: 'qa20-desk',
  name: 'qa20-desk',
  tags: ['scene', 'qa20'],
  palette: QA_PALETTE,
  rows: [
    'O' + 'g'.repeat(76) + 'O',
    'O'.repeat(78),
    ...Array.from({ length: 6 }, () => '.Og' + 'Z'.repeat(72) + 'Og.'),
  ],
};

/** The sand timer on the desk, running down, then turned over: trade fast or trade slow. */
const timerFrame = (top: string[], neck: string, bottom: string[]) => ['OOOOO', ...top, neck, ...bottom, 'OOOOO'];
const timer: PixelSprite = {
  id: 'qa20-timer',
  name: 'qa20-timer',
  tags: ['scene', 'qa20'],
  blurb: 'A sand timer: the sand runs from the top bulb to the bottom one, then it is turned over.',
  rows: timerFrame(['xGGGx', '.xGx.'], '..G..', ['.x.x.', 'x.G.x']),
  frames: [
    timerFrame(['xGGGx', '.xGx.'], '..G..', ['.x.x.', 'x.G.x']),
    timerFrame(['x.G.x', '.xGx.'], '..G..', ['.xGx.', 'xGGGx']),
    timerFrame(['x...x', '.x.x.'], '.....', ['.xGx.', 'xGGGx']),
  ],
  frameMs: 1100,
};

const QUANT_AT = { x: 33, y: DESK_Y - 21 } as const;

const base = qaCompose('qa20-opener-base', 80, 60, [
  { sprite: qaRoom, x: 0, y: 0 },
  { sprite: qaRect('qa20-cable-a', 1, 1, 'X'), x: 14, y: 0 },
  { sprite: qaRect('qa20-cable-b', 1, 1, 'X'), x: 65, y: 0 },
  { sprite: qaScreen('qa20-board', BOARD.width, BOARD.height, { surface: 'K' }), x: BOARD.x, y: BOARD.y },
  { sprite: picture, x: PIC.x, y: PIC.y },
  { sprite: farRow, x: 0, y: FAR_Y },
  { sprite: desk, x: 1, y: DESK_Y },
  ...SCREENS.map(([x, sprite]) => ({ sprite, x, y: DESK_Y - 10 })),
  { sprite: qaQuantSeated, x: QUANT_AT.x, y: QUANT_AT.y },
]);

const flicker = (id: string, rows: string[]): PixelSprite => ({ id, name: id, tags: ['scene', 'qa20'], rows });

export const qa20Opener: SceneArt = {
  id: 'qa20-opener',
  label: 'On a trading floor a quant sits at a desk of screens under a hanging board that shows transaction costs as an iceberg: the fees are the small tip above the water, the spread and the market impact are the far bigger mass below.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: lap, x: PIC.x + 1, y: PIC.y + WATER_Y - 1 },
    { sprite: qaLater(lap, 'qa20-lap-b', 1, 480), x: PIC.x + 42, y: PIC.y + WATER_Y - 1 },
    { sprite: ship, x: PIC.x + 47, y: PIC.y + WATER_Y - 4, motion: { kind: 'bob', amp: 1, periodMs: 1800 } },
    { sprite: bubble, x: PIC.x + 57, y: PIC.y + 17, motion: { kind: 'rise', amp: 5, periodMs: 2600 } },
    { sprite: bubble, x: PIC.x + 4, y: PIC.y + 19, motion: { kind: 'rise', amp: 4, periodMs: 3100, phase: 0.5 } },
    { sprite: timer, x: 47, y: DESK_Y - 7 },
    { sprite: flicker('qa20-far-glow-a', ['WW']), x: FAR_SCREENS[1] + 1, y: FAR_Y + 2, motion: { kind: 'twinkle', periodMs: 1500, min: 0.1 } },
    { sprite: flicker('qa20-far-glow-b', ['NN']), x: FAR_SCREENS[4] + 5, y: FAR_Y + 2, motion: { kind: 'twinkle', periodMs: 2100, phase: 0.4, min: 0.1 } },
  ],
};

/** Lesson 20's emblem: an hourglass, the execution trade-off between speed and cost. (The iceberg
 * itself turns to a spinning top at keepsake size; the hourglass reads at a glance.) */
const emblemHourglass: PixelSprite = {
  id: 'qa20-emblem-hourglass',
  name: 'qa20-emblem-hourglass',
  tags: ['scene', 'qa20'],
  rows: [
    '............',
    '.OOOOOOOOOy.',
    '..OOOOOOOy..',
    '...OOOOOy...',
    '....OOOy....',
    '.....Oy.....',
    '....OOOy....',
    '...OOOOOy...',
    '..OOOOOOOy..',
    '.OOOOOOOOOy.',
    '..yyyyyyyyy.',
    '............',
  ],
};

export const qa20Finish: SceneArt = qaKeepsake(
  'qa20-finish',
  'A gold medallion hanging from a purple ribbon, embossed with an hourglass, with small sparkles around it.',
  emblemHourglass,
);

export const art: LessonArtSet = { opener: qa20Opener, backdrop: qaBackdrop, finish: qa20Finish };
