/**
 * Financial Analytics lesson 9, machine learning in finance: a model that learns from the data.
 *
 * OPENER. The learning lab. A big glass panel shows the lesson's machine, a neural network in the
 * pathway's data colours: blue inputs on the left, teal hidden nodes, gold outputs, wired all to
 * all. Signals pulse along the wires and each layer lights in turn, left to right. A server rack
 * blinks beside it (the training), the four jobs the lesson names hang on the right (a credit
 * card, a fraud warning, a trading arrow, a sentiment bubble), and the map lights MODEL.
 *
 * KEEPSAKE. The trophy with a small network: three inputs, two hidden nodes, one gold output,
 * wiring itself up layer by layer.
 */
import { faBackdrop } from './fa-backdrop';
import { faAnalyst, faCompose, faPipelineMap, faTabletLine, FA_ANALYST_TABLET } from './fa-kit';
import { faDrawnBy, faKeepsake, faMonitor, faRoom, faStageLight, FA_MONITOR_GLASS } from './fa-kit-a';
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';

/* ── networks ──────────────────────────────────────────────────────────────────────────────── */

/** The pixels of a straight line from (x0, y0) to (x1, y1), in order (Bresenham). */
function linePixels(x0: number, y0: number, x1: number, y1: number): [number, number][] {
  const out: [number, number][] = [];
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  let [x, y] = [x0, y0];
  for (;;) {
    out.push([x, y]);
    if (x === x1 && y === y1) return out;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x += sx; }
    if (e2 <= dx) { err += dx; y += sy; }
  }
}

/** A network's layers: each is [column of node centres, ink, rows of node centres]. */
type FaLayer = readonly [x: number, ink: string, ys: readonly number[]];

/** Every wire between consecutive layers, from the right edge of one node to the left of the next. */
function wires(layers: readonly FaLayer[], half: number): [number, number][][] {
  return layers.slice(1).flatMap(([x1, , ys1], i) => {
    const [x0, , ys0] = layers[i];
    return ys0.flatMap((y0) => ys1.map((y1) => linePixels(x0 + half + 1, y0, x1 - half - 1, y1)));
  });
}

/* ── the lab ───────────────────────────────────────────────────────────────────────────────── */

/** The panel's network, on its 44 x 28 glass: three inputs, four hidden nodes, two outputs. */
const NET: readonly FaLayer[] = [
  [3, 'B', [6, 14, 22]],
  [21, 'T', [4, 11, 17, 24]],
  [39, 'y', [10, 18]],
];
const NET_WIRES = wires(NET, 1);
/** A node: a diamond with a lit centre. */
const node = (ink: string, lit: string) => ['.' + ink + '.', ink + lit + ink, '.' + ink + '.'];

const network: PixelSprite = (() => {
  const grid = Array.from({ length: 28 }, () => Array.from({ length: 44 }, () => '.'));
  for (const wire of NET_WIRES) for (const [x, y] of wire) grid[y][x] = 'D';
  for (const [x, ink, ys] of NET) {
    for (const y of ys) node(ink, 'w').forEach((row, dy) => [...row].forEach((ch, dx) => { if (ch !== '.') grid[y - 1 + dy][x - 1 + dx] = ch; }));
  }
  return { id: 'fa9-network', name: 'network', tags: ['scene', 'fa9'], rows: grid.map((r) => r.join('')) };
})();

/** A server rack, 11 x 31: nine units, each with drive slots and a pair of LED sockets. */
const rack: PixelSprite = {
  id: 'fa9-rack',
  name: 'server rack',
  tags: ['scene', 'fa9', 'station'],
  rows: [
    '.DDDDDDDDD.',
    'DxwxxxxxXkD',
    ...Array.from({ length: 9 }, () => ['DxDDDDDDDkD', 'DxDKKKXXDkD', 'DxXXXXXXXkD']).flat(),
    'DDDDDDDDDDD',
    '.DkD...DkD.',
  ],
};

/** The jobs the lesson names, as plates down the right wall: credit, fraud, trading, sentiment. */
const uses: PixelSprite = {
  id: 'fa9-uses',
  name: 'uses',
  tags: ['scene', 'fa9', 'prop'],
  blurb: 'A credit card, a fraud warning, a trading arrow and a sentiment bubble.',
  rows: [
    'GGGGGGG',
    'KKKKKKK',
    'GGGGGGG',
    'GwwGGGG',
    'GGGGGGG',
    '.......',
    '.......',
    '...R...',
    '..RwR..',
    '.RRwRR.',
    '.RRRRR.',
    'RRRwRRR',
    '.......',
    '.......',
    '....NNN',
    '.....NN',
    '..N.N.N',
    '.N.N...',
    'N......',
    '.......',
    '.......',
    '.TTTTT.',
    'TwTwTwT',
    '.TTTTT.',
    '.T.....',
  ],
};

/* Where things stand. */
const MAP = { x: 24, y: 1 } as const;
const PANEL = { x: 14, y: 9 } as const;
const GLASS = { x: PANEL.x + FA_MONITOR_GLASS.x, y: PANEL.y + FA_MONITOR_GLASS.y } as const;
const RACK = { x: 1, y: 18 } as const;
const ANALYST = { x: 66, y: 33 } as const;

const room = faRoom('fa9-opener-room', [
  [3, 50, 11, 1, 'Z'],
  [3, 51, 9, 1, 'Z'],
  [69, 57, 11, 2, 'Z'],
]);

const base = faCompose('fa9-opener-base', room, [
  [faPipelineMap, MAP.x, MAP.y],
  [faMonitor('fa9-panel', 50, 34), PANEL.x, PANEL.y],
  [network, GLASS.x, GLASS.y],
  [rack, RACK.x, RACK.y],
  [uses, 69, 4],
  [faAnalyst, ANALYST.x, ANALYST.y],
]);

/* ── moving parts ──────────────────────────────────────────────────────────────────────────── */

/**
 * Signals running along some of the wires between two layers: a white head and a teal tail, each
 * pulse on its own wire and its own beat. Drawn over the glass from column `from`.
 */
function pulses(id: string, from: number, width: number, picks: readonly (readonly [wire: number, phase: number])[]): PixelSprite {
  const F = 10;
  const frames = Array.from({ length: F }, (_, f) => {
    const grid = Array.from({ length: 28 }, () => Array.from({ length: width }, () => '.'));
    for (const [w, phase] of picks) {
      const wire = NET_WIRES[w];
      const at = Math.floor((((f + phase) % F) / F) * wire.length);
      for (const [i, ink] of [[at, 'w'], [at - 1, 'T']] as const) {
        if (i >= 0) grid[wire[i][1]][wire[i][0] - from] = ink;
      }
    }
    return grid.map((r) => r.join(''));
  });
  return { id, name: id, tags: ['scene', 'fa9'], rows: frames[0], frames, frameMs: 140 };
}
// Wires 0 to 11 run inputs to hidden nodes, 12 to 19 hidden nodes to outputs.
const pulsesIn = pulses('fa9-pulses-in', 5, 15, [[1, 0], [6, 4], [11, 7]]);
const pulsesOut = pulses('fa9-pulses-out', 23, 15, [[12, 2], [15, 6], [19, 9]]);

/** Each layer's nodes, lit white for a beat: the wave of activation passing left to right. */
const glow = (id: string, layer: FaLayer): PixelSprite => {
  const [, , ys] = layer;
  const top = Math.min(...ys);
  const rows = Array.from({ length: Math.max(...ys) + 1 - top }, (_, y) => (ys.includes(y + top) ? 'www' : '...'));
  return { id, name: id, tags: ['scene', 'fa9'], rows };
};
const glowAt = (layer: FaLayer) => ({ x: GLASS.x + layer[0] - 1, y: GLASS.y + Math.min(...layer[2]) });

/** LEDs on the rack's units, blinking out of step while the model trains. */
const leds: PixelSprite = (() => {
  const frames = Array.from({ length: 6 }, (_, f) => Array.from({ length: 25 }, (_, y) => {
    if (y % 3 !== 0) return '..';
    const u = y / 3;
    return [(u * 3 + f) % 4 ? 'N' : '.', (u + f * 2) % 3 ? '.' : 'B'].join('');
  }));
  return { id: 'fa9-leds', name: 'leds', tags: ['scene', 'fa9'], rows: frames[0], frames, frameMs: 320 };
})();

export const fa9Opener: SceneArt = {
  id: 'fa9-opener',
  label: 'A machine learning lab in the data works: a glass panel shows a neural network of blue inputs, teal hidden nodes and gold outputs with signals pulsing along its wires, beside a blinking server rack, signs for credit, fraud, trading and sentiment, and an analyst with a tablet.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: pulsesIn, x: GLASS.x + 5, y: GLASS.y },
    { sprite: pulsesOut, x: GLASS.x + 23, y: GLASS.y },
    ...NET.map((layer, i) => ({
      sprite: glow(`fa9-glow-${String(i)}`, layer),
      ...glowAt(layer),
      motion: { kind: 'twinkle' as const, periodMs: 1800, phase: i / 3, min: 0 },
    })),
    { sprite: leds, x: RACK.x + 6, y: RACK.y + 3 },
    faStageLight('model', MAP.x, MAP.y),
    { sprite: faTabletLine, x: ANALYST.x + FA_ANALYST_TABLET.x, y: ANALYST.y + FA_ANALYST_TABLET.y },
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────── */

/**
 * LESSON 9: machine learning. Three blue inputs, two teal hidden nodes, one gold output: the
 * inputs light, their wires run in, the hidden nodes light, their wires run on, the output
 * lights. It holds, the screen clears.
 */
export const faEmblemNetwork: PixelSprite = (() => {
  const layers: readonly FaLayer[] = [[1, 'B', [1, 5, 9]], [8, 'T', [3, 7]], [14, 'y', [5]]];
  const grid = Array.from({ length: 11 }, () => Array.from({ length: 16 }, () => '.'));
  const step = new Map<string, number>();
  wires(layers, 1).forEach((wire, i) => wire.forEach(([x, y]) => { grid[y][x] = 'b'; step.set(`${String(x)},${String(y)}`, i < 6 ? 1 : 3); }));
  layers.forEach(([x, ink, ys], i) => ys.forEach((y) => node(ink, i === 2 ? 'w' : ink).forEach((row, dy) => [...row].forEach((ch, dx) => {
    if (ch === '.') return;
    grid[y - 1 + dy][x - 1 + dx] = ch;
    step.set(`${String(x - 1 + dx)},${String(y - 1 + dy)}`, i * 2);
  }))));
  return {
    ...faDrawnBy('fa-emblem-network', grid.map((r) => r.join('')), (x, y) => step.get(`${String(x)},${String(y)}`) ?? 0, 300),
    name: 'emblem network',
    blurb: 'A small neural network, wiring itself up.',
  };
})();

export const fa9Finish: SceneArt = faKeepsake(
  'fa9-finish',
  'A gold terminal trophy on a purple stand, its screen drawing a small neural network, blue inputs wired through teal nodes to a gold output, with small sparkles around it.',
  faEmblemNetwork,
);

export const art: LessonArtSet = { opener: fa9Opener, backdrop: faBackdrop, finish: fa9Finish };
