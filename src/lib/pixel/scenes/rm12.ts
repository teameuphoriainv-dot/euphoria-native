/**
 * Risk Management lesson 12 opener, Counterparty Risk & Collateral Management: down on the quay in the
 * storm, the keeper holds a line made fast round an iron bollard, and the ship at the other end of it
 * is going down stern first. A hedge is only as good as whoever holds the other end of the rope; the
 * bollard is the collateral, the thing that holds when they cannot. The coil of line waits behind him.
 * Moving: rain, lightning, the swell over the stern, bubbles from the wreck, foam at the quay's end.
 */
import type { PixelSprite } from '../types';
import { rmBackdrop } from './rm-backdrop';
import { RM_PALETTE, rmCompose, rmKeepsake, rmLater, rmLightning, rmRain, rmRopeCoil, rmSwell } from './rm-kit';
import { rmFlip, rmKeeperReach, rmMark, rmPlot } from './rm-kit-a';
import type { RmPoint } from './rm-kit-a';
import { rmFill } from './rm-kit-b';
import type { LessonArtSet, SceneArt } from './types';

/** A straight line of rope from (x0, y0) to (x1, y1), its twist alternating light and dark. */
function rope(x0: number, y0: number, x1: number, y1: number): RmPoint[] {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  return Array.from({ length: steps + 1 }, (_, i) => {
    const x = Math.round(x0 + ((x1 - x0) * i) / steps);
    const y = Math.round(y0 + ((y1 - y0) * i) / steps);
    return [x, y, i % 2 === 0 ? 'x' : 'X'] as const;
  });
}

/** Storm sky, the horizon, the open sea, and the stone quay along the foot with its courses. */
const ground = rmFill(
  Array.from({ length: 60 }, (_, y) => (y < 7 ? 'K' : y < 24 ? 'k' : y < 28 ? 'D' : y === 28 ? 'u' : y < 37 ? 'V' : 'v').repeat(80)),
  [
    [0, 30, 7, 'K'], [44, 70, 7, 'K'],
    [0, 22, 8, 'K'], [50, 64, 8, 'K'],
    [4, 14, 9, 'K'], [53, 60, 9, 'K'],
    [20, 46, 14, 'K'], [24, 40, 15, 'K'],
    [60, 79, 17, 'K'], [66, 79, 18, 'K'],
    [0, 12, 21, 'D'], [30, 50, 22, 'D'],
    [8, 30, 25, 'k'], [52, 70, 26, 'k'],
    [6, 12, 31, 'u'], [24, 30, 33, 'u'], [40, 46, 30, 'u'],
    [0, 5, 37, 'u'], [14, 20, 39, 'u'], [46, 52, 41, 'u'],
    [58, 64, 47, 'u'], [42, 47, 50, 'u'], [66, 72, 53, 'u'], [48, 54, 56, 'u'],
    [0, 37, 44, 'x'],
    [0, 37, 45, 'X'],
    ...Array.from({ length: 14 }, (_, i) => [0, 37, 46 + i, (i + 1) % 4 === 0 ? 'K' : 'D'] as const),
    ...Array.from({ length: 16 }, (_, i) => [38, 38, 44 + i, 'K'] as const),
  ],
);

/** The quay face's vertical joints, offset course by course. */
const JOINTS: RmPoint[] = Array.from({ length: 14 }, (_, i) => i)
  .filter((i) => (i + 1) % 4 !== 0)
  .flatMap((i) => [0, 1, 2, 3, 4].map((k) => [(Math.floor(i / 4) % 2 === 0 ? 4 : 0) + k * 8, 46 + i, 'K'] as const))
  .filter(([x]) => x <= 37);

/**
 * The ship going down: hull tipped bow-up toward the quay, its portholes still lit, the stern already
 * under, masts leaning back, sails torn, a red flag. Drawn only above its waterline; the sea and the
 * swell cover the rest. 34x18.
 */
function shipRows(): string[] {
  const deck = (x: number) => 6 + Math.round(x * 0.45);
  const pts: RmPoint[] = [];
  for (let x = 0; x < 34; x++) {
    const top = deck(x);
    const bottom = x < 3 ? top + 1 + x : 17;
    for (let y = top; y <= Math.min(bottom, 17); y++) {
      const port = y === top + 2 && x % 4 === 1;
      pts.push([x, y, y === top ? 'x' : y === top + 1 ? 'X' : port ? 'y' : 'D']);
    }
  }
  const mast = (x0: number, foot: number, top: number) => {
    for (let y = foot; y >= top; y--) pts.push([x0 + Math.round((foot - y) * 0.45), y, 'D']);
  };
  mast(9, 9, 0);
  mast(20, 14, 5);
  const sails: RmPoint[] = [
    [11, 2, 'x'], [12, 2, 'x'], [11, 3, 'w'], [12, 3, 'x'], [13, 3, 'x'], [14, 3, 'x'],
    [10, 4, 'x'], [11, 4, 'w'], [12, 4, 'w'], [13, 4, 'x'], [14, 4, 'X'], [15, 4, 'x'],
    [10, 5, 'x'], [11, 5, 'w'], [12, 5, 'x'], [13, 5, 'x'], [15, 5, 'X'],
    [10, 6, 'X'], [11, 6, 'x'], [12, 6, 'x'], [14, 6, 'x'], [10, 7, 'X'], [11, 7, 'x'],
    [23, 7, 'x'], [24, 7, 'x'], [22, 8, 'x'], [23, 8, 'w'], [24, 8, 'x'], [25, 8, 'X'],
    [22, 9, 'x'], [23, 9, 'x'], [25, 9, 'x'], [22, 10, 'X'], [23, 10, 'x'],
    [14, 0, 'R'], [15, 0, 'R'], [16, 0, 'r'], [14, 1, 'r'], [15, 1, 'R'],
  ];
  return rmPlot(34, 18, [...pts, ...sails]);
}

const sinkingShip: PixelSprite = {
  id: 'rm12-opener-ship',
  name: 'sinking ship',
  tags: ['scene', 'rm12'],
  rows: shipRows(),
};

/** The iron bollard on the quay, the line taking a turn round its waist. 6x6. */
const bollard: PixelSprite = {
  id: 'rm12-opener-bollard',
  name: 'bollard',
  tags: ['scene', 'rm12'],
  rows: [
    '.DDDD.',
    'DxxXXD',
    '.DXXD.',
    '.xXxX.',
    '.DXXD.',
    'DDDDDD',
  ],
};

/** Bubbles off the wreck; give them a `rise`. 5x3. */
const bubbles: PixelSprite = {
  id: 'rm12-opener-bubbles',
  name: 'bubbles',
  tags: ['scene', 'rm12'],
  rows: [
    '.w...',
    '...B.',
    'B....',
  ],
};

/** Foam where the swell breaks on the quay's end; give it a `twinkle`. 4x6. */
const foam: PixelSprite = {
  id: 'rm12-opener-foam',
  name: 'foam',
  tags: ['scene', 'rm12'],
  palette: RM_PALETTE,
  rows: [
    'w...',
    'Uw..',
    'wUw.',
    'Uww.',
    '.Uw.',
    'UUU.',
  ],
};

/** The line: from the keeper's hand down to the bollard, and from the bollard out to the ship's bow. 48x42. */
const line: PixelSprite = {
  id: 'rm12-opener-line',
  name: 'mooring line',
  tags: ['scene', 'rm12'],
  rows: rmPlot(48, 42, [...rope(27, 29, 30, 37), ...rope(35, 41, 45, 31)]),
};

const base = rmCompose('rm12-opener-base', rmMark(ground, JOINTS), [
  [sinkingShip, 46, 25],
  [line, 0, 0],
  [bollard, 29, 38],
  [rmRopeCoil, 0, 37],
]);

export const rm12Opener: SceneArt = {
  id: 'rm12-opener',
  label: 'In a storm, a lighthouse keeper on a stone quay holds a mooring line made fast round an iron bollard, its other end tied to a ship that is sinking stern first.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: rmLightning, x: 64, y: 2 },
    { sprite: rmSwell, x: 45, y: 41, motion: { kind: 'drift', amp: 2, periodMs: 3400 } },
    { sprite: bubbles, x: 66, y: 40, motion: { kind: 'rise', amp: 5, periodMs: 2000 } },
    { sprite: bubbles, x: 72, y: 41, motion: { kind: 'rise', amp: 4, periodMs: 2600, phase: 0.5 } },
    { sprite: foam, x: 39, y: 44, motion: { kind: 'twinkle', periodMs: 1600, min: 0.3 } },
    { sprite: rmRain, x: 0, y: 0 },
    { sprite: rmLater(rmRain, 'rm12-opener-rain-later', 1, 150), x: 40, y: 6 },
    { sprite: rmFlip(rmKeeperReach, 'rm12-opener-keeper'), x: 9, y: 15 },
  ],
};

/**
 * Lesson 12's emblem: two bollards with a line made fast between them, the near one capped in the
 * keeper's gold, the far one in the mate's orchid and cracking. 16x12.
 */
const emblemBollards: PixelSprite = {
  id: 'rm12-emblem-bollards',
  name: 'two bollards',
  tags: ['rm', 'emblem', 'lesson 12'],
  rows: [
    '.OOOO......EEEE.',
    'OyGGgO....EqPPpE',
    '.DXXD......DXXD.',
    '.DXXD......DXRD.',
    '.xXxXxXxXxXxXRx.',
    '.XxXxXxXxXxXxXR.',
    '.DXXD......DRXD.',
    '.DXXD......DXRD.',
    '.DXXD......DRXD.',
    'DDDDDD....DDDDDD',
    'xxxxxxxxxxxxxxxx',
    '.XXXXXXXXXXXXXX.',
  ],
};

export const rm12Finish: SceneArt = rmKeepsake(
  'rm12-finish',
  'A red and white life ring hanging from a rope, with two bollards at its center tied together by a line, one capped in gold and the far one in orchid and cracking.',
  emblemBollards,
);

export const art: LessonArtSet = { opener: rm12Opener, backdrop: rmBackdrop, finish: rm12Finish };
