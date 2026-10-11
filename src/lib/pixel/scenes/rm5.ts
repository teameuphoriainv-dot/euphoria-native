/**
 * Risk Management lesson 5 opener, Operational & Liquidity Risk: two disasters, measured in minutes
 * and in hours. The radio cabinet has failed from the inside, one module scorched and sparking, its
 * lights gone wrong, and the keeper grabs the red kill switch wired to it. On the desk the hourglass
 * is nearly out, the time a bank has once its depositors queue, under the ship's clock and beside the
 * logbook. Moving: sparks, smoke, the cabinet lights, the warning lamp, the sand, rain on the porthole.
 */
import type { PixelSprite } from '../types';
import { rmBackdrop } from './rm-backdrop';
import {
  RM_PALETTE,
  rmChartTable,
  rmCompose,
  rmKeepsake,
  rmLogbook,
  rmShipClock,
  rmWatchRoom,
} from './rm-kit';
import { rmKeeperReach, rmMark, rmPlot, rmPortRain, rmPortSwell, rmPorthole } from './rm-kit-a';
import type { LessonArtSet, SceneArt } from './types';

/**
 * The radio cabinet, the lighthouse's machine: a dial, vented modules, a plinth, and the third
 * module scorched and cracked where it failed. Its lights are a layer. 16x37.
 */
const cabinet: PixelSprite = {
  id: 'rm5-opener-cabinet',
  name: 'radio cabinet',
  tags: ['scene', 'rm5'],
  rows: [
    'DDDDDDDDDDDDDDDD',
    'DxxxxxxxxxxxxxxD',
    'DDDDDDDDDDDDDDDD',
    'DKKKKKKKKKKKKKKD',
    'DKkkkkkkkkkkkkKD',
    'DKkkkkkDwwwDkkKD',
    'DKkkkkkDwKwDkkKD',
    'DKkkkkkDDDDDkkKD',
    'DKKKKKKKKKKKKKKD',
    'DKkkkkkkkkkkkkKD',
    'DKkkkkkDDDDDDkKD',
    'DKkkkkkkkkkkkkKD',
    'DKKKKKKKKKKKKKKD',
    'DKkkkkk1kkkk1kKD',
    'DKkkkkkkK1kKkkKD',
    'DKkkkkk1kkKkkkKD',
    'DKkkkkkkk1kkkkKD',
    'DKKKKKKKKKKKKKKD',
    'DKkkkkkkkkkkkkKD',
    'DKkkkkkDDDDDDkKD',
    'DKkkkkkkkkkkkkKD',
    'DKKKKKKKKKKKKKKD',
    'DKkkkkkkkkkkkkKD',
    'DKkkkkkDDDDDDkKD',
    'DKkkkkkkkkkkkkKD',
    'DKKKKKKKKKKKKKKD',
    'DKkkkkkkkkkkkkKD',
    'DKkkkkkDDDDDDkKD',
    'DKkkkkkkkkkkkkKD',
    'DKKKKKKKKKKKKKKD',
    'DKkkkkkkkkkkkkKD',
    'DKkkkkkDDDDDDkKD',
    'DKkkkkkkkkkkkkKD',
    'DKKKKKKKKKKKKKKD',
    'DDDDDDDDDDDDDDDD',
    'DXXXXXXXXXXXXXXD',
    'DDDDDDDDDDDDDDDD',
  ],
};

/** The cabinet's module lights, two per module; the failed module's pair is red. Framed, 3x27. */
const lights: PixelSprite = {
  id: 'rm5-opener-lights',
  name: 'cabinet lights',
  tags: ['scene', 'rm5'],
  rows: rmPlot(3, 27, [[0, 0, 'N'], [2, 0, 'G'], [0, 5, 'N'], [2, 5, 'N'], [0, 9, 'R'], [2, 9, 'R'], [0, 14, 'N'], [2, 14, 'G'], [0, 18, 'N'], [2, 18, 'N'], [0, 22, 'G'], [2, 22, 'N'], [0, 26, 'N'], [2, 26, 'N']]),
  frames: [
    rmPlot(3, 27, [[0, 0, 'N'], [2, 0, 'G'], [0, 5, 'N'], [2, 5, 'N'], [0, 9, 'R'], [2, 9, 'R'], [0, 14, 'N'], [2, 14, 'G'], [0, 18, 'N'], [2, 18, 'N'], [0, 22, 'G'], [2, 22, 'N'], [0, 26, 'N'], [2, 26, 'N']]),
    rmPlot(3, 27, [[0, 0, 'N'], [0, 5, 'N'], [2, 5, 'N'], [0, 14, 'N'], [2, 14, 'G'], [2, 18, 'N'], [0, 22, 'G'], [2, 22, 'N'], [0, 26, 'N']]),
    rmPlot(3, 27, [[0, 0, 'N'], [2, 0, 'G'], [0, 5, 'N'], [0, 9, 'R'], [2, 9, 'R'], [0, 14, 'N'], [0, 18, 'N'], [2, 18, 'N'], [2, 22, 'N'], [0, 26, 'N'], [2, 26, 'N']]),
  ],
  frameMs: 380,
};

/** Sparks spitting from the crack. Framed, 12x11. */
const sparks: PixelSprite = {
  id: 'rm5-opener-sparks',
  name: 'sparks',
  tags: ['scene', 'rm5'],
  rows: rmPlot(12, 11, [[4, 6, 'W'], [6, 4, 'y'], [9, 2, '4'], [2, 8, 'y']]),
  frames: [
    rmPlot(12, 11, [[4, 6, 'W'], [6, 4, 'y'], [9, 2, '4'], [2, 8, 'y']]),
    rmPlot(12, 11, [[5, 7, 'W'], [8, 6, 'y'], [11, 4, '5'], [6, 9, '4']]),
    rmPlot(12, 11, []),
    rmPlot(12, 11, [[4, 7, 'y'], [7, 8, 'W'], [10, 9, '4'], [6, 3, '5'], [3, 4, 'W']]),
    rmPlot(12, 11, []),
  ],
  frameMs: 140,
};

/** Smoke from the failed module; give it a `rise`. 3x2. */
const smoke: PixelSprite = {
  id: 'rm5-opener-smoke',
  name: 'smoke',
  tags: ['scene', 'rm5'],
  rows: [
    '.X.',
    'XxX',
  ],
};

/**
 * The kill switch: a wall box with a hazard plate, its lever out to the right, the red ball where
 * the keeper's hand closes. The lamp's socket sits on top. 13x12.
 */
const killSwitch: PixelSprite = {
  id: 'rm5-opener-kill-switch',
  name: 'kill switch',
  tags: ['scene', 'rm5'],
  rows: [
    '...DDD.......',
    '.DDDDDDD.....',
    'DXxxxxxXD....',
    'DXGKGKGXD....',
    'DXKGKGKXD....',
    'DXXXXXXXD....',
    'DXXDDDXXD.sR.',
    'DXXDOxxxxxRRR',
    'DXXDDDXXD.Rr.',
    'DXXXXXXXD....',
    'DXXXXXXXD....',
    'DDDDDDDDD....',
  ],
};

/** The warning lamp over the switch; give it a `twinkle`. 3x2. */
const lamp: PixelSprite = {
  id: 'rm5-opener-lamp',
  name: 'warning lamp',
  tags: ['scene', 'rm5'],
  rows: [
    '.R.',
    'RsR',
  ],
};

/** The cable from the switch, up the wall and over to the cabinet it can cut. 13x28. */
const cable: PixelSprite = {
  id: 'rm5-opener-cable',
  name: 'cable',
  tags: ['scene', 'rm5'],
  rows: rmPlot(13, 28, [
    ...Array.from({ length: 13 }, (_, x) => [x, 0, 'D'] as const),
    ...Array.from({ length: 27 }, (_, y) => [12, y + 1, 'D'] as const),
    ...Array.from({ length: 8 }, (_, y) => [0, y + 1, 'D'] as const),
  ]),
};

/** The hourglass, its top bulb nearly empty. Framed: the falling sand. 9x12. */
const HOURGLASS = [
  'OgggggggO',
  'OOOOOOOOO',
  'Ox.....xO',
  'O.x...x.O',
  'O..xyx..O',
  'O...y...O',
  'O..x.x..O',
  'O.x...x.O',
  'Ox.yyy.xO',
  'OxyyGyyxO',
  'OOOOOOOOO',
  'OgggggggO',
];
const hourglass: PixelSprite = {
  id: 'rm5-opener-hourglass',
  name: 'hourglass',
  tags: ['scene', 'rm5'],
  rows: rmMark(HOURGLASS, [[4, 6, 'y']]),
  frames: [
    rmMark(HOURGLASS, [[4, 6, 'y']]),
    rmMark(HOURGLASS, [[4, 7, 'y']]),
    rmMark(HOURGLASS, [[4, 6, 'y'], [4, 7, 'y']]),
  ],
  frameMs: 300,
};

/** Floor shadows under the cabinet, the keeper and the desk. */
const floorShadow: PixelSprite = {
  id: 'rm5-opener-floor-shadow',
  name: 'rm5-opener-floor-shadow',
  tags: ['scene', 'rm5'],
  palette: RM_PALETTE,
  rows: [
    'ZZZZZZZZZZZZZZZZZZ...............ZZZZZZZZZZZZZZZ....ZZZZZZZZZZZZZZZZZZZZZZZZ',
    '.ZZZZZZZZZZZZZZZZ..................ZZZZZZZZZZZ........ZZZZZZZZZZZZZZZZZZZZZ.',
  ],
};

const base = rmCompose('rm5-opener-base', rmWatchRoom(80, 60, 50), [
  [cable, 10, 5],
  [rmPorthole, 36, 3],
  [rmShipClock, 64, 13],
  [floorShadow, 2, 51],
  [cabinet, 3, 14],
  [killSwitch, 21, 32],
  [rmChartTable, 54, 38],
  [rmLogbook, 66, 36],
]);

export const rm5Opener: SceneArt = {
  id: 'rm5-opener',
  label: 'A lighthouse keeper grabs the red handle of a kill switch wired to a sparking radio cabinet, while an hourglass runs low on the desk under the ship clock.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: rmPortSwell, x: 41, y: 13, motion: { kind: 'drift', amp: 1, periodMs: 3200 } },
    { sprite: rmPortRain, x: 36, y: 3 },
    { sprite: lights, x: 6, y: 19 },
    { sprite: smoke, x: 10, y: 24, motion: { kind: 'rise', amp: 6, periodMs: 2200 } },
    { sprite: sparks, x: 8, y: 21 },
    { sprite: lamp, x: 24, y: 30, motion: { kind: 'twinkle', periodMs: 900, min: 0.2 } },
    { sprite: rmKeeperReach, x: 33, y: 24 },
    { sprite: hourglass, x: 57, y: 28 },
  ],
};

/** Lesson 5's emblem: an hourglass with its top nearly run out. 11x13. */
const emblemHourglass: PixelSprite = {
  id: 'rm5-emblem-hourglass',
  name: 'hourglass',
  tags: ['rm', 'emblem', 'lesson 5'],
  rows: [
    'OGGGGGGGGGO',
    'OgggggggggO',
    '.Ow.....wO.',
    '.O.w...w.O.',
    '.O..wyw..O.',
    '.O...y...O.',
    '.O..w.w..O.',
    '.O.w.y.w.O.',
    '.Ow.yGy.wO.',
    '.OwyGGGywO.',
    '.OyGGGGGyO.',
    'OGGGGGGGGGO',
    'OgggggggggO',
  ],
};

export const rm5Finish: SceneArt = rmKeepsake(
  'rm5-finish',
  'A red and white life ring hanging from a rope, with an hourglass at its center whose sand has nearly run out.',
  emblemHourglass,
);

export const art: LessonArtSet = { opener: rm5Opener, backdrop: rmBackdrop, finish: rm5Finish };
