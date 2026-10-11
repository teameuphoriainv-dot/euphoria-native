/**
 * Risk Management lesson 3 opener, Value at Risk Deep Dive: the keeper holds his lantern up to the
 * barograph on the chart table, the instrument that keeps the record a barometer only states. Its
 * trace runs along above the red dashed line, the VaR limit, then drops through it: the day the
 * model said would not come, the loss a back-test exists to find. The barometer on the wall gives
 * the one number; the storm is in the window. Moving: the pen, the lantern, the barometer needle,
 * lightning, rain, the ship and the swell.
 */
import type { PixelSprite } from '../types';
import { rmBackdrop } from './rm-backdrop';
import {
  RM_PALETTE,
  rmBarometer,
  rmChartTable,
  rmCompose,
  rmKeepsake,
  rmLantern,
  rmLightning,
  rmRain,
  rmShip,
  rmStormWindow,
  rmSwell,
  rmWatchRoom,
} from './rm-kit';
import { rmKeeperLift, rmPlot } from './rm-kit-a';
import type { LessonArtSet, SceneArt } from './types';

/**
 * The barograph: a paper drum on a brass base, the trace above the red dashed VaR line until it
 * plunges through it near the pen. The pen arm is its own layer. 22x11.
 */
const barograph: PixelSprite = {
  id: 'rm3-opener-barograph',
  name: 'barograph',
  tags: ['scene', 'rm3'],
  rows: [
    '.OOOOOOOOOOOOOO.......',
    'OGyyyyyyyyyyyyGO......',
    '.xwwwwwwwwwwwwX.......',
    '.xwwwwBwwwwwwwX...OO..',
    '.xBBBBwBBwwwwwX..OgO..',
    '.xRwRwRwRBwRwwX...D...',
    '.xwwwwwwwwBwBwX...D...',
    '.xwwwwwwwwwBwwX...D...',
    'OgggggggggggggGO..D...',
    'DXXXXXXXXXXXXXXXXXXXXD',
    'DDDDDDDDDDDDDDDDDDDDDD',
  ],
};

/** The pen arm swinging on its pivot as the drum turns, the nib at the paper's edge. 6x4. */
const pen: PixelSprite = {
  id: 'rm3-opener-pen',
  name: 'barograph pen',
  tags: ['scene', 'rm3'],
  rows: rmPlot(6, 4, [[4, 1, 'x'], [3, 1, 'x'], [2, 2, 'x'], [1, 2, 'x'], [0, 2, 'b']]),
  frames: [
    rmPlot(6, 4, [[4, 1, 'x'], [3, 1, 'x'], [2, 2, 'x'], [1, 2, 'x'], [0, 2, 'b']]),
    rmPlot(6, 4, [[4, 1, 'x'], [3, 2, 'x'], [2, 2, 'x'], [1, 3, 'x'], [0, 3, 'b']]),
    rmPlot(6, 4, [[4, 1, 'x'], [3, 1, 'x'], [2, 2, 'x'], [1, 2, 'x'], [0, 2, 'b']]),
    rmPlot(6, 4, [[4, 1, 'x'], [3, 1, 'x'], [2, 1, 'x'], [1, 1, 'x'], [0, 1, 'b']]),
  ],
  frameMs: 340,
};

/** Floor shadows under the table and the keeper. */
const floorShadow: PixelSprite = {
  id: 'rm3-opener-floor-shadow',
  name: 'rm3-opener-floor-shadow',
  tags: ['scene', 'rm3'],
  palette: RM_PALETTE,
  rows: [
    '..ZZZZZZZZZZZZZZZZZZZZZZ.........ZZZZZZZZZZZZZZ.',
    '....ZZZZZZZZZZZZZZZZZZ.............ZZZZZZZZZZ...',
  ],
};

const base = rmCompose('rm3-opener-base', rmWatchRoom(80, 60, 50), [
  [rmStormWindow, 36, 4],
  [floorShadow, 11, 52],
  [rmChartTable, 12, 39],
  [barograph, 14, 30],
]);

export const rm3Opener: SceneArt = {
  id: 'rm3-opener',
  label: 'A lighthouse keeper holds up a lantern beside a barograph on the chart table, its trace dropping through a red dashed line, as a storm rages in the window behind him.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: rmLightning, x: 49, y: 6 },
    { sprite: rmShip, x: 64, y: 15, motion: { kind: 'bob', amp: 1, periodMs: 2400 } },
    { sprite: rmSwell, x: 41, y: 25, motion: { kind: 'drift', amp: 2, periodMs: 3600 } },
    { sprite: rmRain, x: 38, y: 6 },
    { sprite: rmKeeperLift, x: 40, y: 23 },
    { sprite: rmLantern, x: 38, y: 32 },
    { sprite: pen, x: 27, y: 33 },
    { sprite: rmBarometer, x: 18, y: 11 },
  ],
};

/** Lesson 3's emblem: a half dial whose needle stands in the red past the limit. 16x9. */
const emblemGauge: PixelSprite = {
  id: 'rm3-emblem-gauge',
  name: 'gauge in the red',
  tags: ['rm', 'emblem', 'lesson 3'],
  rows: [
    '.....OOOOOO.....',
    '...OONGGGGROO...',
    '..ONNwwwwwwRRO..',
    '.ONwwwwwwwwwKRO.',
    '.ONwwwwwwwwKwRO.',
    'ONwwwwwwwwKwwwRO',
    'ONwwwwwwwKwwwwRO',
    'OwwwwwwwOOwwwwwO',
    'OOOOOOOOOOOOOOOO',
  ],
};

export const rm3Finish: SceneArt = rmKeepsake(
  'rm3-finish',
  'A red and white life ring hanging from a rope, with a dial at its center whose needle points into the red.',
  emblemGauge,
);

export const art: LessonArtSet = { opener: rm3Opener, backdrop: rmBackdrop, finish: rm3Finish };
