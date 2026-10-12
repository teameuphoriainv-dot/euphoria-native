/**
 * Quantitative Analysis lesson 18, High-Frequency Trading & Market Microstructure: the co-location
 * cage.
 *
 * Inside the exchange's data centre, behind the welded mesh of a co-location cage, a big screen
 * shows the limit order book as a depth chart: the bids pile up in green on the left, the asks in
 * red on the right, and between the best bid and the best ask lies the gap every trade has to
 * cross, the spread. The quant's servers stand in the cage a few metres from the matching engine,
 * fed by the yellow fibre tray overhead, because here a microsecond is an edge. Only small layers
 * move: packets race along the tray, the racks blink, cold air rises from the vented floor tile, the
 * best bid and the best ask glint as orders come and go.
 * Keepsake: fast-forward, the speed of the game.
 */
import type { PixelSprite } from '../types';
import { qaBackdrop } from './qa-backdrop';
import {
  qaCompose, qaKeepsake, qaLater, qaPath, qaQuantStanding, qaRack, qaRackLights, qaRect, qaRoom, qaScreen, qaText,
} from './qa-kit';
import { qaColumns } from './qa-kit-c';
import type { LessonArtSet, SceneArt } from './types';

/* ── the cage ──────────────────────────────────────────────────────────────────────────────────── */

/** The cage's welded mesh over the wall, a wire every 4 pixels both ways. */
const MESH_TOP = 3;
const mesh: PixelSprite = {
  id: 'qa18-mesh',
  name: 'qa18-mesh',
  tags: ['scene', 'qa18'],
  rows: Array.from({ length: 46 - MESH_TOP }, (_, j) => [...Array(80)].map((_, x) => ((MESH_TOP + j) % 4 === 1 || x % 4 === 1 ? 'D' : '.')).join('')),
};

/** The yellow fibre tray along the ceiling: a lit lip, its side, its shadowed underside. */
const tray: PixelSprite = { id: 'qa18-tray', name: 'qa18-tray', tags: ['scene', 'qa18'], rows: ['G'.repeat(80), 'g'.repeat(80), 'O'.repeat(80)] };

/** The raised floor: tiles with k seams, and a vented tile in the cold aisle in front of the racks. */
const floorSeams: PixelSprite = {
  id: 'qa18-floor-seams',
  name: 'qa18-floor-seams',
  tags: ['scene', 'qa18'],
  rows: Array.from({ length: 13 }, (_, j) => [...Array(80)].map((_, x) => (j === 4 || j === 9 || x % 10 === 4 ? 'k' : '.')).join('')),
};
const VENT = { x: 65, y: 52 } as const;
const vent: PixelSprite = {
  id: 'qa18-vent',
  name: 'qa18-vent',
  tags: ['scene', 'qa18'],
  rows: ['DDDDDDDDD', 'DKDKDKDKD', 'DDDDDDDDD', 'DKDKDKDKD'],
};

/* ── the screen: the order book as a depth chart ───────────────────────────────────────────────── */

const SCREEN = { x: 2, y: 4, width: 48, height: 30 } as const;
/** The chart's corner inside the screen, and its size: 44x26 with the price axis on its last row. */
const CHART = { x: SCREEN.x + 2, y: SCREEN.y + 2, width: 44, height: 26 } as const;
const AXIS_Y = CHART.height - 1;

/**
 * Resting orders, summed from the touch outwards: each step is the depth at one more price level.
 * The bids end at the best bid, the asks start at the best ask; between them the spread.
 */
const BIDS: readonly (readonly [number, number, number])[] = [[0, 3, 18], [4, 8, 13], [9, 13, 9], [14, 18, 4]];
const ASKS: readonly (readonly [number, number, number])[] = [[24, 28, 5], [29, 33, 8], [34, 38, 13], [39, 43, 17]];
const GAP = { from: 19, to: 23 } as const;
const MID = (GAP.from + GAP.to) / 2;

const depth = (steps: typeof BIDS) => [...Array(CHART.width)].map((_, x) => steps.find(([a, b]) => x >= a && x <= b)?.[2] ?? 0);

const axis: PixelSprite = {
  id: 'qa18-axis',
  name: 'qa18-axis',
  tags: ['scene', 'qa18'],
  rows: [[...Array(CHART.width)].map((_, x) => (x % 4 === 2 ? 'x' : 'X')).join('')],
};

/** The spread, measured: a gold bracket across the gap, under a dotted mid-price line. */
const bracket: PixelSprite = {
  id: 'qa18-bracket',
  name: 'qa18-bracket',
  tags: ['scene', 'qa18'],
  rows: ['y...y', 'yyyyy', 'y...y'],
};

const chart = qaCompose('qa18-chart', CHART.width, CHART.height, [
  { sprite: qaColumns('qa18-bids', depth(BIDS), AXIS_Y, 'n', 'N'), x: 0, y: 0 },
  { sprite: qaColumns('qa18-asks', depth(ASKS), AXIS_Y, 'r', 'R'), x: 0, y: 0 },
  { sprite: axis, x: 0, y: AXIS_Y },
  { sprite: qaText('qa18-bid', 'BID', 'N'), x: 1, y: 1 },
  { sprite: qaText('qa18-ask', 'ASK', 'R'), x: CHART.width - 12, y: 1 },
  { sprite: qaText('qa18-spread', 'SPREAD', 'y'), x: MID - 11, y: 8 },
  { sprite: qaPath('qa18-mid', 1, 6, [[0, 0], [0, 5]], 'g', [1, 1]), x: MID, y: 14 },
  { sprite: bracket, x: GAP.from, y: 21 },
]);

/** The best bid and the best ask, glinting as orders arrive at the touch. */
const touch: PixelSprite = {
  id: 'qa18-touch',
  name: 'qa18-touch',
  tags: ['scene', 'qa18'],
  rows: ['......W', 'W......'],
};

/* ── the fibre: packets racing along the tray ──────────────────────────────────────────────────── */

const RUN = 32;
function packetFrame(k: number): string[] {
  const row = new Array<string>(RUN).fill('.');
  for (const head of [(k * 4) % RUN, (k * 4 + RUN / 2) % RUN]) {
    row[head] = 'W';
    if (head > 0) row[head - 1] = 'y';
  }
  return [row.join('')];
}
const packets: PixelSprite = {
  id: 'qa18-packets',
  name: 'qa18-packets',
  tags: ['scene', 'qa18'],
  blurb: 'Light pulses racing along the fibre tray, four pixels a frame.',
  rows: packetFrame(0),
  frames: [0, 1, 2, 3, 4, 5, 6, 7].map(packetFrame),
  frameMs: 140,
};
const packetsLater = qaLater(packets, 'qa18-packets-b', 3, 140);

/** Cold air rising from the vented tile, pale blue and thinning. */
const coldAir: PixelSprite = {
  id: 'qa18-cold-air',
  name: 'qa18-cold-air',
  tags: ['scene', 'qa18'],
  rows: ['.b...', '..B..', '.B..b', 'B..B.', '.B.B.'],
};

/* ── the scene ─────────────────────────────────────────────────────────────────────────────────── */

const RACKS = [60, 70] as const;
const RACK_Y = 14;
const QUANT_AT = { x: 48, y: 29 } as const;

const base = qaCompose('qa18-opener-base', 80, 60, [
  { sprite: qaRoom, x: 0, y: 0 },
  { sprite: mesh, x: 0, y: MESH_TOP },
  { sprite: floorSeams, x: 0, y: 47 },
  { sprite: vent, x: VENT.x, y: VENT.y },
  { sprite: tray, x: 0, y: 0 },
  // The screen hangs from the tray on two rods; one fibre drops into each rack.
  { sprite: qaRect('qa18-rod-a', 1, 1, 'X'), x: 10, y: 3 },
  { sprite: qaRect('qa18-rod-b', 1, 1, 'X'), x: 41, y: 3 },
  ...RACKS.map((x, i) => ({ sprite: qaRect(`qa18-fibre-${String(i)}`, 1, RACK_Y - 3, 'G'), x: x + 4, y: 3 })),
  { sprite: qaScreen('qa18-screen', SCREEN.width, SCREEN.height, { surface: 'K' }), x: SCREEN.x, y: SCREEN.y },
  { sprite: chart, x: CHART.x, y: CHART.y },
  ...RACKS.map((x) => ({ sprite: qaRack, x, y: RACK_Y })),
  { sprite: qaQuantStanding, x: QUANT_AT.x, y: QUANT_AT.y },
]);

export const qa18Opener: SceneArt = {
  id: 'qa18-opener',
  label: 'In a data centre cage beside blinking server racks, a quant studies a screen showing the limit order book: green bids on the left, red asks on the right and the spread between them, while packets race along the yellow fibre tray overhead.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: packets, x: 6, y: 1 },
    { sprite: packetsLater, x: 42, y: 1 },
    { sprite: qaRackLights, x: RACKS[0] + 7, y: RACK_Y + 2 },
    { sprite: qaLater(qaRackLights, 'qa18-rack-lights-b', 2, 600), x: RACKS[1] + 7, y: RACK_Y + 2 },
    { sprite: coldAir, x: VENT.x + 2, y: VENT.y - 6, motion: { kind: 'rise', amp: 5, periodMs: 2400 } },
    { sprite: touch, x: CHART.x + GAP.from - 1, y: CHART.y + AXIS_Y - 5, motion: { kind: 'twinkle', periodMs: 900, min: 0.2 } },
  ],
};

/** Lesson 18's emblem: fast-forward, two arrowheads pointing right. */
const emblemFastForward: PixelSprite = {
  id: 'qa18-emblem-fast-forward',
  name: 'qa18-emblem-fast-forward',
  tags: ['scene', 'qa18'],
  rows: [
    '............',
    '............',
    '.O....O.....',
    '.OO...OO....',
    '.OOO..OOO...',
    '.OOOO.OOOO..',
    '.OOOOOOOOOO.',
    '.OOOOyOOOOy.',
    '.OOOy.OOOy..',
    '.OOy..OOy...',
    '.Oy...Oy....',
    '............',
  ],
};

export const qa18Finish: SceneArt = qaKeepsake(
  'qa18-finish',
  'A gold medallion hanging from a purple ribbon, embossed with a fast-forward sign, two arrowheads pointing right, with small sparkles around it.',
  emblemFastForward,
);

export const art: LessonArtSet = { opener: qa18Opener, backdrop: qaBackdrop, finish: qa18Finish };
