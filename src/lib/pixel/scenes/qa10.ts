/**
 * Quantitative Analysis lesson 10, the Foundations Checkpoint: everything comes together.
 *
 * The control room's video wall carries the first half of the pathway, a tile a lesson: lesson 2's
 * dice, 3's wave, 4's frontier and 5's hockey stick down the left; 6's fan, 7's factor staircase,
 * 8's spread and 9's pipeline down the right. Every tile feeds the gold-framed screen in the middle,
 * where the validation funnel turns a thousand ideas into three live strategies. The quant stands
 * at the console with both arms up. Only small layers move: the feeds pulse in towards the middle,
 * an idea drops through the funnel, the three live strategies twinkle, the wave tile rolls on, the
 * console's lights blink.
 * Keepsake: the funnel, on the honours medal (a gold-striped ribbon and a laurel).
 */
import type { PixelSprite } from '../types';
import { qaBackdrop } from './qa-backdrop';
import { qaCompose, qaKeepsake, qaLater, qaPath, qaRoom, qaScreen, qaSparkleSmall } from './qa-kit';
import type { QaStamp } from './qa-kit';
import { qaLaurelLayer, qaQuantCheer, qaRibbonHonour } from './qa-kit-b';
import type { LessonArtSet, SceneArt } from './types';

/* ── the video wall: a tile a lesson ───────────────────────────────────────────────────────────── */

const TILE = { width: 20, height: 11 } as const;
const TILE_X = { left: 0, right: 60 } as const;
const TILE_Y = [1, 12, 23, 34] as const;
/** A tile's chart area: qaScreen's surface, 16x7 at the tile's (2, 2). */
const MINI = { width: 16, height: 7 } as const;

const mini = (id: string, rows: string[]): PixelSprite => ({ id, name: id, tags: ['scene', 'qa10'], rows });

/** Lesson 2: the two dice's sums, the most likely (7, the expected value) in gold. */
const diceMini = mini('qa10-mini-dice', [
  '........y.......',
  '........y.......',
  '......w.y.w.....',
  '......w.y.w.....',
  '....w.w.y.w.w...',
  '....w.w.y.w.w...',
  '..w.w.w.y.w.w.w.',
]);

/** Lesson 3: the seasonal wave, one cycle every 12 pixels. */
function wave(shift: number): string[] {
  const points: [number, number][] = [...Array(MINI.width)].map((_, x) => [x, Math.round(3 - 3 * Math.sin(((x + shift) * Math.PI) / 6))]);
  return qaPath('qa10-mini-wave', MINI.width, MINI.height, points, 'Q').rows;
}

const waveRolling: PixelSprite = {
  ...mini('qa10-mini-wave', wave(0)),
  blurb: 'The wave tile rolling on, a quarter cycle a frame.',
  frames: [wave(0), wave(3), wave(6), wave(9)],
  frameMs: 450,
};

/** Lesson 4: the efficient frontier over its cloud of portfolios, the tangent portfolio a gold star. */
const frontierMini = qaCompose('qa10-mini-frontier', MINI.width, MINI.height, [
  { sprite: mini('qa10-mini-cloud', ['................', '................', '................', '...........B....', '........B.....B.', '.............B..', '..........B.....']), x: 0, y: 0 },
  { sprite: qaPath('qa10-mini-curve', MINI.width, MINI.height, [[1, 6], [2, 4], [3, 3], [5, 2], [8, 1], [12, 0], [15, 0]], 'P'), x: 0, y: 0 },
  { sprite: mini('qa10-mini-star', ['.y.', 'yWy', '.y.']), x: 4, y: 1 },
]);

/** Lesson 5: the call's payoff, flat to the strike, then up one for one. */
const hockeyMini = qaCompose('qa10-mini-hockey', MINI.width, MINI.height, [
  { sprite: qaPath('qa10-mini-strike', MINI.width, MINI.height, [[7, 0], [7, 5]], 'X', [1, 1]), x: 0, y: 0 },
  { sprite: qaPath('qa10-mini-payoff', MINI.width, MINI.height, [[1, 6], [7, 6], [13, 0]], 'N'), x: 0, y: 0 },
]);

/** Lesson 6: simulated paths fanning out from today's price, best green, median gold, worst red. */
const FAN: [string, [number, number][]][] = [
  ['x', [[1, 3], [5, 3], [8, 2], [11, 3], [15, 2]]],
  ['x', [[1, 3], [5, 4], [9, 4], [12, 5], [15, 4]]],
  ['N', [[1, 3], [4, 2], [7, 2], [10, 1], [13, 1], [15, 0]]],
  ['R', [[1, 3], [4, 4], [7, 5], [10, 5], [13, 6], [15, 6]]],
  ['y', [[1, 3], [4, 3], [8, 4], [12, 3], [15, 3]]],
];
const fanMini = qaCompose('qa10-mini-fan', MINI.width, MINI.height, [
  ...FAN.map(([ch, points], i) => ({ sprite: qaPath(`qa10-mini-fan-${String(i)}`, MINI.width, MINI.height, points, ch), x: 0, y: 0 })),
  { sprite: mini('qa10-mini-today', ['WW']), x: 0, y: 3 },
]);

/** Lesson 7: the return climbing a staircase of factors: beta, value, momentum, then the gold alpha. */
const staircaseMini = mini('qa10-mini-staircase', [
  '.............yGg',
  '.........BBb.yGg',
  '.....TTt.BBb....',
  '.qPp.TTt........',
  '.qPp............',
  '.qPp............',
  '.qPp............',
]);

/** Lesson 8: the spread swinging from band to band round its gold mean. */
const spreadMini = qaCompose('qa10-mini-spread', MINI.width, MINI.height, [
  { sprite: qaPath('qa10-mini-upper', MINI.width, 1, [[0, 0], [15, 0]], 'r', [1, 1]), x: 0, y: 0 },
  { sprite: qaPath('qa10-mini-lower', MINI.width, 1, [[0, 0], [15, 0]], 'n', [1, 1]), x: 0, y: 6 },
  { sprite: qaPath('qa10-mini-mean', MINI.width, 1, [[0, 0], [15, 0]], 'y', [2, 1]), x: 0, y: 3 },
  { sprite: qaPath('qa10-mini-swing', MINI.width, MINI.height, [[0, 3], [2, 2], [4, 0], [6, 2], [8, 4], [10, 6], [12, 4], [14, 3], [15, 3]], 'w'), x: 0, y: 0 },
]);

/** Lesson 9: the system's four engines, cabled in a row. */
const pipelineMini = mini('qa10-mini-pipeline', [
  '................',
  '................',
  'NNN.yyy.BBB.www.',
  'NNNXyyyXBBBXwwwX',
  'NNN.yyy.BBB.www.',
  '................',
  '................',
]);

const LEFT_MINIS = [diceMini, null, frontierMini, hockeyMini] as const;
const RIGHT_MINIS = [fanMini, staircaseMini, spreadMini, pipelineMini] as const;

const tiles: QaStamp[] = TILE_Y.flatMap((y, i) => {
  const stamps: QaStamp[] = [
    { sprite: qaScreen(`qa10-tile-l${String(i)}`, TILE.width, TILE.height, { surface: 'K' }), x: TILE_X.left, y },
    { sprite: qaScreen(`qa10-tile-r${String(i)}`, TILE.width, TILE.height, { surface: 'K' }), x: TILE_X.right, y },
    { sprite: RIGHT_MINIS[i], x: TILE_X.right + 2, y: y + 2 },
  ];
  const left = LEFT_MINIS[i];
  if (left) stamps.push({ sprite: left, x: TILE_X.left + 2, y: y + 2 });
  return stamps;
});

/* ── the gold screen: the validation funnel ────────────────────────────────────────────────────── */

const GOLD = { x: 22, y: 1, width: 36, height: 26 } as const;

/** qaScreen's build in gold: a lit y top and left, a g chin and right side, a dark surface. */
function goldScreen(id: string, width: number, height: number): PixelSprite {
  const rows = ['O'.repeat(width), 'O' + 'y'.repeat(width - 2) + 'O'];
  for (let r = 2; r < height - 2; r += 1) rows.push('Oy' + 'K'.repeat(width - 4) + 'gO');
  rows.push('Oy' + 'g'.repeat(width - 3) + 'O', 'O'.repeat(width));
  return { id, name: id, tags: ['scene', 'qa10'], rows };
}

/** The funnel's rim, its neck and its spout, in scene pixels. */
const RIM = { y: 7, left: 26, right: 53 } as const;
const NECK = { y: 16, left: 37, right: 42 } as const;
const SPOUT_END = 19;

/** The x of the funnel's left and right walls at row y. */
const wallAt = (y: number) => {
  const t = (y - RIM.y) / (NECK.y - RIM.y);
  return [Math.round(RIM.left + t * (NECK.left - RIM.left)), Math.round(RIM.right + t * (NECK.right - RIM.right))] as const;
};

/** A thousand ideas pour in over the rim, in every colour the pathway has drawn so far. */
const IDEAS: [number, number, string][] = [
  [27, 3, 'w'], [30, 4, 'Q'], [33, 3, 'N'], [36, 5, 'y'], [38, 3, 'T'], [41, 4, 'R'], [44, 3, 'B'], [47, 5, 'P'],
  [50, 3, 'w'], [52, 4, 'N'], [29, 5, 'B'], [35, 4, 'R'], [43, 5, 'w'], [49, 4, 'y'], [32, 5, 'T'], [46, 4, 'Q'],
];
/** Fewer survive each stage: the statistical tests, the factor adjustment, the walk-forward. */
const SURVIVORS: [number, number, string][] = [
  [31, 8, 'w'], [35, 9, 'Q'], [39, 8, 'N'], [43, 9, 'T'], [47, 8, 'B'], [37, 11, 'N'], [43, 12, 'T'], [40, 14, 'y'],
];

const dots = (id: string, list: readonly [number, number, string][]): PixelSprite => ({
  id,
  name: id,
  tags: ['scene', 'qa10'],
  rows: [...Array(60)].map((_, y) => [...Array(80)].map((_, x) => list.find(([dx, dy]) => dx === x && dy === y)?.[2] ?? '.').join('')),
});

const STAGES = [10, 13] as const;

const funnel: QaStamp[] = [
  { sprite: dots('qa10-ideas', IDEAS), x: 0, y: 0 },
  ...STAGES.map((y) => {
    const [l, r] = wallAt(y);
    return { sprite: qaPath(`qa10-stage-${String(y)}`, 80, 60, [[l + 2, y], [r - 2, y]], 'X', [1, 1]), x: 0, y: 0 };
  }),
  { sprite: dots('qa10-survivors', SURVIVORS), x: 0, y: 0 },
  { sprite: qaPath('qa10-wall-l', 80, 60, [[RIM.left, RIM.y], [NECK.left, NECK.y], [NECK.left, SPOUT_END]], 'x'), x: 0, y: 0 },
  { sprite: qaPath('qa10-wall-r', 80, 60, [[RIM.right, RIM.y], [NECK.right, NECK.y], [NECK.right, SPOUT_END]], 'x'), x: 0, y: 0 },
  { sprite: qaPath('qa10-rim', 80, 60, [[RIM.left, RIM.y], [RIM.right, RIM.y]], 'w'), x: 0, y: 0 },
];

/** One idea falling through the neck and out of the spout, two rows a frame. */
const DROP = { x: NECK.left + 1, y: 13, width: NECK.right - NECK.left - 1, height: 8 } as const;
function dropFrame(row: number): string[] {
  return [...Array(DROP.height)].map((_, y) => (y === row ? '.yG.' : '....').slice(0, DROP.width));
}
const drop: PixelSprite = {
  id: 'qa10-drop',
  name: 'qa10-drop',
  tags: ['scene', 'qa10'],
  blurb: 'An idea that passed every test, dropping out of the funnel.',
  rows: dropFrame(0),
  frames: [0, 2, 4, 6, 7, 7].map((r) => (r === 7 ? dropFrame(99) : dropFrame(r))),
  frameMs: 260,
};

/** The three live strategies, under the spout. */
const LIVE = [[32, 21], [38, 21], [44, 21]] as const;
const liveStars = [
  qaSparkleSmall,
  qaLater(qaSparkleSmall, 'qa10-live-b', 1, 560),
  qaLater(qaSparkleSmall, 'qa10-live-c', 0, 680),
];

/* ── the feeds: chevrons pulsing from every tile in towards the middle ─────────────────────────── */

const FEED = { height: 44, y: 1 } as const;
function feeds(point: 'in-right' | 'in-left', lit: number): string[] {
  const rows = Array.from({ length: FEED.height }, () => '..');
  TILE_Y.forEach((ty, i) => {
    const c = i === lit ? 'y' : 'g';
    const shape = point === 'in-right' ? [`${c}.`, `.${c}`, `${c}.`] : [`.${c}`, `${c}.`, `.${c}`];
    shape.forEach((row, j) => {
      rows[ty + 4 + j - FEED.y] = row;
    });
  });
  return rows;
}
const feedLeft: PixelSprite = {
  id: 'qa10-feed-left',
  name: 'qa10-feed-left',
  tags: ['scene', 'qa10'],
  rows: feeds('in-right', 0),
  frames: [0, 1, 2, 3].map((i) => feeds('in-right', i)),
  frameMs: 300,
};
const feedRight: PixelSprite = {
  id: 'qa10-feed-right',
  name: 'qa10-feed-right',
  tags: ['scene', 'qa10'],
  rows: feeds('in-left', 2),
  frames: [2, 3, 0, 1].map((i) => feeds('in-left', i)),
  frameMs: 340,
};

/* ── the console and the quant ─────────────────────────────────────────────────────────────────── */

const CONSOLE = { x: 22, y: 37, width: 36 } as const;
const consoleDesk: PixelSprite = {
  id: 'qa10-console',
  name: 'qa10-console',
  tags: ['scene', 'qa10'],
  blurb: 'The control console under the gold screen: a lit desk top over a dark front panel.',
  rows: [
    'D'.repeat(CONSOLE.width),
    'D' + 'x'.repeat(CONSOLE.width - 2) + 'D',
    'D' + 'X'.repeat(CONSOLE.width - 2) + 'D',
    ...Array.from({ length: 6 }, () => 'D'.repeat(CONSOLE.width)),
  ],
};

/** The console's lights, either side of the quant (who stands in front of the middle of it). */
const LIGHT_XS = [2, 4, 6, 8, 27, 29, 31, 33] as const;
function consoleLights(on: readonly number[]): string[] {
  const row = new Array<string>(CONSOLE.width).fill('.');
  LIGHT_XS.forEach((x, i) => {
    row[x] = on.includes(i) ? ['N', 'y', 'B', 'N'][i % 4] : 'X';
  });
  return [row.join('')];
}
const lights: PixelSprite = {
  id: 'qa10-lights',
  name: 'qa10-lights',
  tags: ['scene', 'qa10'],
  rows: consoleLights([0, 2, 5, 7]),
  frames: [[0, 2, 5, 7], [1, 3, 4, 6], [0, 3, 5, 6], [1, 2, 4, 7]].map(consoleLights),
  frameMs: 420,
};

const QUANT_AT = { x: 29, y: 29 } as const;

const base = qaCompose('qa10-opener-base', 80, 60, [
  { sprite: qaRoom, x: 0, y: 0 },
  ...tiles,
  { sprite: goldScreen('qa10-gold-screen', GOLD.width, GOLD.height), x: GOLD.x, y: GOLD.y },
  ...funnel,
  { sprite: consoleDesk, x: CONSOLE.x, y: CONSOLE.y },
  { sprite: qaQuantCheer, x: QUANT_AT.x, y: QUANT_AT.y },
]);

export const qa10Opener: SceneArt = {
  id: 'qa10-opener',
  label: 'A quant cheers with both arms up in a control room where a wall of screens shows every chart from the lessons so far, all feeding a gold screen where a funnel turns a thousand ideas into three live strategies.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: waveRolling, x: TILE_X.left + 2, y: TILE_Y[1] + 2 },
    { sprite: feedLeft, x: TILE.width, y: FEED.y },
    { sprite: feedRight, x: TILE_X.right - 2, y: FEED.y },
    { sprite: drop, x: DROP.x, y: DROP.y },
    ...LIVE.map(([x, y], i) => ({ sprite: liveStars[i], x, y, motion: { kind: 'twinkle' as const, periodMs: 1500 + i * 300, phase: i * 0.3, min: 0.5 } })),
    { sprite: lights, x: CONSOLE.x, y: CONSOLE.y + 5 },
  ],
};

/** Lesson 10's emblem: the validation funnel, ideas dropping in over the rim and one coming out. */
const emblemFunnel: PixelSprite = {
  id: 'qa10-emblem-funnel',
  name: 'qa10-emblem-funnel',
  tags: ['scene', 'qa10'],
  rows: [
    '............',
    '.O..O..O..O.',
    '............',
    'OOOOOOOOOOOO',
    '.OOOOOOOOOOy',
    '..OOOOOOOOy.',
    '...OOOOOOy..',
    '....OOOOy...',
    '.....OOy....',
    '.....OOy....',
    '......y.....',
    '.....OO.....',
  ],
};

export const qa10Finish: SceneArt = qaKeepsake(
  'qa10-finish',
  'A gold medallion in a green laurel, hanging from a purple ribbon striped with gold, embossed with a funnel, with small sparkles around it.',
  emblemFunnel,
  { base: qaRibbonHonour, extra: [qaLaurelLayer] },
);

export const art: LessonArtSet = { opener: qa10Opener, backdrop: qaBackdrop, finish: qa10Finish };
