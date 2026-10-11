/**
 * Quantitative Analysis lesson 9, Algorithmic Trading Systems: the system's architecture, built.
 *
 * Along a wall rail stand the four engines of an algo trading system, each with its icon: the
 * market data handler (signal bars), the signal engine (a bulb), the risk engine (a shield) and
 * the order management system (an order ticket), cabled to the exchange's columned hall at the
 * right. Orders flow out along the top cable in gold; market data comes back along the bottom one
 * in green. The quant stands under it beside a co-located server rack; a stopwatch on the wall races,
 * because in this business latency is measured in microseconds. Only small layers move: the packets flow both
 * ways, the engines' status lights blink, the exchange's flag waves, the stopwatch's hand races, the rack blinks, a pulse runs the fibre.
 * Keepsake: a gear, the machine that trades.
 */
import type { PixelSprite } from '../types';
import { qaBackdrop } from './qa-backdrop';
import {
  qaClockFace, qaClockTick, qaCompose, qaKeepsake, qaLater, qaPath, qaQuantStanding, qaRack, qaRackLights, qaRect,
  qaRoom,
} from './qa-kit';
import type { QaStamp } from './qa-kit';
import type { LessonArtSet, SceneArt } from './types';

/* ── the engines ───────────────────────────────────────────────────────────────────────────────── */

const ENGINE_Y = 14;
const ENGINE_X = [2, 16, 30, 44] as const;
const ENGINE_W = 10;
const ORDERS_Y = ENGINE_Y + 3;
const DATA_Y = ENGINE_Y + 9;
const EXCHANGE_X = 62;

/** An engine's case, 10x12: a dark icon panel up top, vents and a status light below. */
function engine(id: string, icon: readonly string[]): PixelSprite {
  const panel = icon.map((row) => `DxK${row.replace(/\./g, 'K')}KXD`);
  return {
    id,
    name: id,
    tags: ['scene', 'qa9'],
    rows: [
      'DDDDDDDDDD',
      'DxxxxxxxxD',
      'DxKKKKKKXD',
      ...panel,
      'DxKKKKKKXD',
      'DXXXXXXXXD',
      'DXkkkkXXXD',
      'DXkkkkXXXD',
      'DDDDDDDDDD',
    ],
  };
}

/** The four icons, 4x4: data's signal bars, the signal's bulb, risk's shield, the OMS's ticket. */
const ICONS = [
  ['...N', '..NN', '.NNN', 'NNNN'],
  ['.yy.', 'yyWy', '.yy.', '.XX.'],
  ['BBBB', 'BwBB', 'BBBB', '.BB.'],
  ['wwww', 'wXXw', 'wwww', 'wXXw'],
] as const;

const engines: QaStamp[] = ENGINE_X.map((x, i) => ({ sprite: engine(`qa9-engine-${String(i + 1)}`, ICONS[i]), x, y: ENGINE_Y }));

/** The gaps between engines, where the cables show: each runs from one case to the next. */
const GAPS = [...ENGINE_X.map((x, i) => [x + ENGINE_W, (ENGINE_X[i + 1] ?? EXCHANGE_X) - 1] as const)];

const cables: QaStamp[] = GAPS.flatMap(([from, to], i) => [
  { sprite: qaPath(`qa9-orders-${String(i)}`, 80, 60, [[from, ORDERS_Y], [to, ORDERS_Y]], 'D'), x: 0, y: 0 },
  { sprite: qaPath(`qa9-data-${String(i)}`, 80, 60, [[from, DATA_Y], [to, DATA_Y]], 'D'), x: 0, y: 0 },
]);

/**
 * The packets, one framed layer over the cable band: a gold order moving right and a green tick of
 * market data moving left in every gap, never over a case (a layer would draw on top of it).
 */
const BAND = { x: GAPS[0][0], y: ORDERS_Y, width: EXCHANGE_X - GAPS[0][0], height: DATA_Y - ORDERS_Y + 1 } as const;

function packets(step: number): string[] {
  const rows = Array.from({ length: BAND.height }, () => new Array<string>(BAND.width).fill('.'));
  for (const [from, to] of GAPS) {
    const span = to - from + 1;
    const out = from + (step % span);
    const back = to - ((step + 2) % span);
    rows[0][out - BAND.x] = 'y';
    rows[BAND.height - 1][back - BAND.x] = 'N';
  }
  return rows.map((row) => row.join(''));
}

const packetFlow: PixelSprite = {
  id: 'qa9-packets',
  name: 'qa9-packets',
  tags: ['scene', 'qa9'],
  blurb: 'Orders out along the top cable, market data back along the bottom one.',
  rows: packets(0),
  frames: [0, 1, 2, 3, 4, 5, 6, 7].map(packets),
  frameMs: 170,
};

/** The engines' status lights, one framed strip along their vent row. */
const LIGHTS_Y = ENGINE_Y + 9;
function statusLights(on: readonly boolean[]): string[] {
  const row = new Array<string>(ENGINE_X[3] + 8 - ENGINE_X[0]).fill('.');
  ENGINE_X.forEach((x, i) => {
    row[x + 7 - ENGINE_X[0]] = on[i] ? 'N' : 'n';
  });
  return [row.join('')];
}
const lights: PixelSprite = {
  id: 'qa9-lights',
  name: 'qa9-lights',
  tags: ['scene', 'qa9'],
  rows: statusLights([true, true, true, true]),
  frames: [
    statusLights([true, false, true, true]),
    statusLights([false, true, true, false]),
    statusLights([true, true, false, true]),
    statusLights([true, false, true, false]),
  ],
  frameMs: 380,
};

/* ── the exchange ──────────────────────────────────────────────────────────────────────────────── */

const COLUMNS = 'DwxXKwxXKwxXKwxD';
const exchange: PixelSprite = {
  id: 'qa9-exchange',
  name: 'qa9-exchange',
  tags: ['scene', 'qa9'],
  blurb: "The exchange's hall standing on the floor: a pediment, four columns, its steps. The flag goes at (9, 0).",
  rows: [
    '........D.......',
    '........D.......',
    '........D.......',
    '.......DDD......',
    '.....DDxwxDD....',
    '...DDxxxwxxxDD..',
    '.DDxxxxxxxxxxxDD',
    'DDDDDDDDDDDDDDDD',
    'DwwwwwwwwwwwwwwD',
    'DDDDDDDDDDDDDDDD',
    ...Array.from({ length: 21 }, () => COLUMNS),
    'DDDDDDDDDDDDDDDD',
    'DxxxxxxxxxxxxxxD',
    'DDDDDDDDDDDDDDDD',
    'xxxxxxxxxxxxxxxx',
    'DDDDDDDDDDDDDDDD',
  ],
};

const flag: PixelSprite = {
  id: 'qa9-flag',
  name: 'qa9-flag',
  tags: ['scene', 'qa9'],
  blurb: "The exchange's flag waving.",
  rows: ['PPPq', 'pPPP'],
  frames: [
    ['PPPq', 'pPPP'],
    ['PPq.', 'pPPq'],
    ['PPPP', 'ppPP'],
    ['PqPP', 'pPpP'],
  ],
  frameMs: 300,
};

/* ── the room ───────────────────────────────────────────────────────────────────────────────── */

const rail: PixelSprite = qaRect('qa9-rail', EXCHANGE_X, 2, 'D');

/** The stopwatch: the wall clock's face with a crown and side button, its hand racing. */
const stopwatchCase: PixelSprite = {
  id: 'qa9-stopwatch-case',
  name: 'qa9-stopwatch-case',
  tags: ['scene', 'qa9'],
  rows: ['...DD...', '..DXXD..'],
};
const racing = qaLater(qaClockTick, 'qa9-stopwatch-hand', 0, 160);

const EXCHANGE_Y = 10;

/** Co-location: the rack's fibre run along the skirting straight into the exchange, a pulse racing it. */
const FIBRE = { x: 12, y: 45, width: EXCHANGE_X - 12 } as const;
const fibre = qaRect('qa9-fibre', FIBRE.width, 1, 't');
const pulse: PixelSprite = {
  id: 'qa9-pulse',
  name: 'qa9-pulse',
  tags: ['scene', 'qa9'],
  rows: ['TW' + '.'.repeat(FIBRE.width - 2)],
  frames: [...Array(10)].map((_, i) => {
    const at = i * 5;
    return ['.'.repeat(at) + 'TW' + '.'.repeat(Math.max(0, FIBRE.width - at - 2))].map((row) => row.slice(0, FIBRE.width));
  }),
  frameMs: 120,
};

const base = qaCompose('qa9-opener-base', 80, 60, [
  { sprite: qaRoom, x: 0, y: 0 },
  { sprite: rail, x: 0, y: ENGINE_Y + 12 },
  ...cables,
  ...engines,
  { sprite: exchange, x: EXCHANGE_X, y: EXCHANGE_Y },
  { sprite: stopwatchCase, x: 4, y: 1 },
  { sprite: qaClockFace, x: 4, y: 3 },
  { sprite: fibre, x: FIBRE.x, y: FIBRE.y },
  { sprite: qaRack, x: 2, y: 28 },
  { sprite: qaQuantStanding, x: 26, y: 27 },
]);

export const qa9Opener: SceneArt = {
  id: 'qa9-opener',
  label: 'A quant stands under an algorithmic trading system on a wall rail, four engines for market data, signals, risk and orders cabled to a columned exchange hall, gold orders flowing out and green data flowing back, under a racing stopwatch.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: packetFlow, x: BAND.x, y: BAND.y },
    { sprite: lights, x: ENGINE_X[0], y: LIGHTS_Y },
    { sprite: flag, x: EXCHANGE_X + 9, y: EXCHANGE_Y },
    { sprite: racing, x: 5, y: 4 },
    { sprite: qaRackLights, x: 9, y: 30 },
    { sprite: pulse, x: FIBRE.x, y: FIBRE.y },
  ],
};

/** Lesson 9's emblem: a gear, the trading machine. */
const emblemGear: PixelSprite = {
  id: 'qa9-emblem-gear',
  name: 'qa9-emblem-gear',
  tags: ['scene', 'qa9'],
  rows: [
    '............',
    '....O..O....',
    '..OOOOOOOO..',
    '.OOOyyyyOOO.',
    '..OOy..yOOy.',
    '.OOOy..yOOOy',
    '.OOOy..yOOOy',
    '..OOOyyOOOy.',
    '.OOOOOOOOOOy',
    '...yOOOOyy..',
    '....Oy.Oy...',
    '.....y..y...',
  ],
};

export const qa9Finish: SceneArt = qaKeepsake(
  'qa9-finish',
  'A gold medallion hanging from a purple ribbon, embossed with a gear, with small sparkles around it.',
  emblemGear,
);

export const art: LessonArtSet = { opener: qa9Opener, backdrop: qaBackdrop, finish: qa9Finish };
