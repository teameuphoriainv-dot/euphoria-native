/**
 * Quantitative Analysis lesson 17, Machine Learning for Quant Trading: the pipeline on the lab wall.
 *
 * A wide screen runs the lesson's pipeline left to right: raw data (a satellite photo of a car
 * park, the alternative data quants count cars in), features ranked by importance, a neural network,
 * and the signal it gives: a green arrow, BUY. Two GPU towers hum either side, their fans ringed in
 * orchid light; the quant stands at a bench with a laptop. Only small layers move: the stages' arrows light in turn, the network lights
 * up layer by layer, the towers' fans spin, the BUY signal pulses.
 * Keepsake: a processor chip, where the model runs.
 */
import type { PixelSprite } from '../types';
import { qaBackdrop } from './qa-backdrop';
import { QA_PALETTE, qaCompose, qaKeepsake, qaLater, qaPath, qaQuantStanding, qaRoom, qaScreen, qaText } from './qa-kit';
import type { QaStamp } from './qa-kit';
import type { LessonArtSet, SceneArt } from './types';

/* ── the screen: data, features, model, signal ─────────────────────────────────────────────────── */

const SCREEN = { x: 2, y: 2, width: 76, height: 25 } as const;

/** Raw data: a satellite photo of a car park, two rows of parked cars either side of a lane. */
const satellite: PixelSprite = {
  id: 'qa17-satellite',
  name: 'qa17-satellite',
  tags: ['scene', 'qa17'],
  blurb: 'A satellite photo of a car park: the alternative data.',
  rows: [
    'XXXXXXXXXXXXXX',
    'XDDDDDDDDDDDDX',
    'XDRDwDBDyDDNDX',
    'XDRDwDBDyDDNDX',
    'XxxxxxxxxxxxxX',
    'XDDDDDDDDDDDDX',
    'XDDDDDDDDDDDDX',
    'XxxxxxxxxxxxxX',
    'XDBDDRDwDTDDDX',
    'XDBDDRDwDTDDDX',
    'XDDDDDDDDDDDDX',
    'XXXXXXXXXXXXXX',
  ],
};

/** Features, ranked by importance: the longest bar is the most predictive. */
const features: PixelSprite = {
  id: 'qa17-features',
  name: 'qa17-features',
  tags: ['scene', 'qa17'],
  rows: ['BBBBBBBBB', '.........', 'BBBBBBB..', '.........', 'BBBBBB...', '.........', 'BBBB.....', '.........', 'BB.......'],
};

/** The network: three inputs, three hidden units, one output. Nodes are 2x2, at their tops-left. */
const NET = { x: 43, y: 6 } as const;
const INPUTS = [[0, 0], [0, 4], [0, 8]] as const;
const HIDDEN = [[7, 0], [7, 4], [7, 8]] as const;
const OUTPUT = [14, 4] as const;
const NET_SIZE = { width: 16, height: 10 } as const;

const edges = qaCompose('qa17-edges', NET_SIZE.width, NET_SIZE.height, [
  ...INPUTS.flatMap(([ix, iy], i) => HIDDEN.map(([hx, hy], h) => ({
    sprite: qaPath(`qa17-edge-${String(i)}-${String(h)}`, NET_SIZE.width, NET_SIZE.height, [[ix + 2, iy + 1], [hx - 1, hy + 1]], 'X'),
    x: 0,
    y: 0,
  }))),
  ...HIDDEN.map(([hx, hy], h) => ({
    sprite: qaPath(`qa17-out-${String(h)}`, NET_SIZE.width, NET_SIZE.height, [[hx + 2, hy + 1], [OUTPUT[0] - 1, OUTPUT[1] + 1]], 'X'),
    x: 0,
    y: 0,
  })),
]);

/** The nodes, coloured by layer; `lit` (0, 1, 2) lights one layer white as the signal passes. */
function nodes(lit: number): string[] {
  const rows = Array.from({ length: NET_SIZE.height }, () => new Array<string>(NET_SIZE.width).fill('.'));
  const put = ([x, y]: readonly [number, number], ch: string) => {
    for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) rows[y + dy][x + dx] = ch;
  };
  INPUTS.forEach((n) => put(n, lit === 0 ? 'W' : 'B'));
  HIDDEN.forEach((n) => put(n, lit === 1 ? 'W' : 'q'));
  put(OUTPUT, lit === 2 ? 'W' : 'y');
  return rows.map((row) => row.join(''));
}
const nodesStill = { id: 'qa17-nodes-still', name: 'qa17-nodes-still', tags: ['scene', 'qa17'], rows: nodes(-1) };
const firing: PixelSprite = {
  id: 'qa17-firing',
  name: 'qa17-firing',
  tags: ['scene', 'qa17'],
  blurb: 'The network lighting up a layer at a time as a signal passes through.',
  rows: nodes(-1).map((row) => row.replace(/[A-Za-z]/g, '.')),
  frames: [0, 1, 2, -1].map((lit) => nodes(lit).map((row) => [...row].map((ch) => (ch === 'W' ? 'W' : '.')).join(''))),
  frameMs: 360,
};

/** The arrows between the stages, lit gold in turn: data to features to model to signal. */
const ARROWS = [21, 37, 60] as const;
const ARROW_Y = 9;
const ARROW = ['..X..', '...X.', 'XXXXX', '...X.', '..X..'] as const;
function arrows(lit: number): string[] {
  const width = ARROWS[2] - ARROWS[0] + 5;
  return ARROW.map((row) => {
    const line = new Array<string>(width).fill('.');
    ARROWS.forEach((ax, i) => [...row].forEach((ch, k) => {
      if (ch === 'X') line[ax - ARROWS[0] + k] = i === lit ? 'y' : 'X';
    }));
    return line.join('');
  });
}
const flow: PixelSprite = {
  id: 'qa17-flow',
  name: 'qa17-flow',
  tags: ['scene', 'qa17'],
  rows: arrows(-1),
  frames: [0, 1, 2, -1].map(arrows),
  frameMs: 420,
};

/** The signal: a green up arrow, lit on its left. */
const signal: PixelSprite = {
  id: 'qa17-signal',
  name: 'qa17-signal',
  tags: ['scene', 'qa17'],
  rows: ['...N...', '..mNN..', '.mNNNn.', 'mNNNNNn', '..mNn..', '..mNn..', '..mNn..', '..mNn..', '..mNn..'],
};

/* ── the lab ───────────────────────────────────────────────────────────────────────────────────── */

/** A GPU tower: a black case, lit on its left edge, an orchid light strip, and two fan grilles. */
const tower: PixelSprite = {
  id: 'qa17-tower',
  name: 'qa17-tower',
  tags: ['scene', 'qa17'],
  palette: QA_PALETTE,
  rows: [
    'DDDDDDDDDDD',
    ...Array.from({ length: 16 }, (_, r) => (r % 7 === 6 ? 'XKKKKKKKKqD' : 'XKDDDDDDKqD')),
    'DDDDDDDDDDD',
    '.ZZZZZZZZZZ',
  ],
};

/** A fan in its orchid light ring, turning: the blades as a plus, then as a cross. */
const fanPlus = ['.qqq.', 'qKxKq', 'qxxxq', 'qKxKq', '.qqq.'];
const fanCross = ['.qqq.', 'qxKxq', 'qKxKq', 'qxKxq', '.qqq.'];
const fans: PixelSprite = {
  id: 'qa17-fans',
  name: 'qa17-fans',
  tags: ['scene', 'qa17'],
  rows: [...fanPlus, '.....', '.....', ...fanPlus],
  frames: [[...fanPlus, '.....', '.....', ...fanCross], [...fanCross, '.....', '.....', ...fanPlus]],
  frameMs: 130,
};
const fansLater = qaLater(fans, 'qa17-fans-b', 1, 150);

/** The bench the quant stands at, and the laptop on it, lid towards us. */
const bench: PixelSprite = {
  id: 'qa17-bench',
  name: 'qa17-bench',
  tags: ['scene', 'qa17'],
  palette: QA_PALETTE,
  rows: [
    'X'.repeat(48),
    'D'.repeat(48),
    '.DX' + '.'.repeat(42) + 'DX.',
    '.DX' + '.'.repeat(42) + 'DX.',
    '.DX' + '.'.repeat(42) + 'DX.',
    '.DX' + 'Z'.repeat(42) + 'DX.',
  ],
};
const laptop: PixelSprite = {
  id: 'qa17-laptop',
  name: 'qa17-laptop',
  tags: ['scene', 'qa17'],
  blurb: "A laptop's lid from behind, its logo glowing.",
  rows: ['DDDDDDDDDD', 'DXXXXXXXXD', 'DXXXyyXXXD', 'DXXXyyXXXD', 'DXXXXXXXXD', 'DDDDDDDDDD', 'xxxxxxxxxx'],
};

const BENCH = { x: 16, y: 41 } as const;
const TOWERS = [2, 67] as const;
const TOWER_Y = 28;

const base = qaCompose('qa17-opener-base', 80, 60, [
  { sprite: qaRoom, x: 0, y: 0 },
  { sprite: qaScreen('qa17-screen', SCREEN.width, SCREEN.height, { surface: 'K' }), x: SCREEN.x, y: SCREEN.y },
  { sprite: satellite, x: 6, y: 6 },
  { sprite: features, x: 27, y: 7 },
  { sprite: edges, x: NET.x, y: NET.y },
  { sprite: nodesStill, x: NET.x, y: NET.y },
  { sprite: signal, x: 67, y: 6 },
  { sprite: qaText('qa17-data', 'DATA', 'x'), x: 5, y: 19 },
  { sprite: qaText('qa17-ml', 'ML', 'x'), x: 46, y: 19 },
  { sprite: qaText('qa17-buy', 'BUY', 'N'), x: 65, y: 18 },
  ...TOWERS.map((x): QaStamp => ({ sprite: tower, x, y: TOWER_Y })),
  { sprite: bench, x: BENCH.x, y: BENCH.y },
  { sprite: laptop, x: 19, y: BENCH.y - 7 },
  { sprite: qaQuantStanding, x: 33, y: 28 },
]);

export const qa17Opener: SceneArt = {
  id: 'qa17-opener',
  label: 'In an AI lab between two humming GPU towers, a quant watches a wide screen run a machine learning pipeline: a satellite photo of a car park, ranked features, a neural network, and a green BUY signal.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: flow, x: ARROWS[0], y: ARROW_Y },
    { sprite: firing, x: NET.x, y: NET.y },
    { sprite: fans, x: TOWERS[0] + 3, y: TOWER_Y + 3 },
    { sprite: fansLater, x: TOWERS[1] + 3, y: TOWER_Y + 3 },
    { sprite: { id: 'qa17-buy-glow', name: 'qa17-buy-glow', tags: ['scene', 'qa17'], rows: ['W'] }, x: 70, y: 6, motion: { kind: 'twinkle', periodMs: 1100, min: 0.1 } },
  ],
};

/** Lesson 17's emblem: a processor chip, its pins round a core. (A drawn network turns to mush at
 * keepsake size; the chip reads.) */
const emblemChip: PixelSprite = {
  id: 'qa17-emblem-chip',
  name: 'qa17-emblem-chip',
  tags: ['scene', 'qa17'],
  rows: [
    '............',
    '..O.O.O.O...',
    '.OOOOOOOOOy.',
    'OOOyyyyyOOOy',
    '.OOy...yOOy.',
    'OOOy.O.yOOOy',
    '.OOy...yOOy.',
    'OOOyyyyyOOOy',
    '.OOOOOOOOOy.',
    '..yOyOyOyO..',
    '...y.y.y.y..',
    '............',
  ],
};

export const qa17Finish: SceneArt = qaKeepsake(
  'qa17-finish',
  'A gold medallion hanging from a purple ribbon, embossed with a processor chip, with small sparkles around it.',
  emblemChip,
);

export const art: LessonArtSet = { opener: qa17Opener, backdrop: qaBackdrop, finish: qa17Finish };
