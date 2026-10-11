/**
 * Risk Management lesson 6 opener, Options & Hedging Strategies: the roof has sprung a leak in the
 * rain and the keeper holds an umbrella over the chart table, the protective put drawn as weather.
 * The umbrella cost him something to own and does nothing on a dry day, but when the drops come the
 * chart stays dry: the loss stops at the premium. The anchor on the wall is the other hedge, the one
 * that holds a ship in place. Moving: the drips, rain on the glass, the ship, the swell, the lantern.
 */
import type { PixelSprite } from '../types';
import { rmBackdrop } from './rm-backdrop';
import {
  RM_PALETTE,
  rmChartTable,
  rmCompose,
  rmKeepsake,
  rmLantern,
  rmLogbook,
  rmRain,
  rmShip,
  rmStormWindow,
  rmSwell,
  rmWatchRoom,
} from './rm-kit';
import { rmKeeperLift, rmPlot } from './rm-kit-a';
import type { LessonArtSet, SceneArt } from './types';

/**
 * The umbrella, orchid canopy and its shaft, laid so the shaft runs down into the keeper's fist
 * (umbrella at keeper x - 11, y - 14). 25x21.
 */
const umbrella: PixelSprite = {
  id: 'rm6-opener-umbrella',
  name: 'umbrella',
  tags: ['scene', 'rm6'],
  rows: [
    '............x............',
    '..........EEPEE..........',
    '.......EEqqqPPPpEE.......',
    '.....EEqqPPPPPPPppEE.....',
    '...EqqPPPPPPpPPPPPPppE...',
    '..EqPPpPPPPPpPPPPPpPPpE..',
    '.EqPPpPPPPPPpPPPPPPpPPpE.',
    'pEEEEEpEEEEEpEEEEEpEEEEEp',
    'E.....E.....x.....E.....E',
    '............x............',
    '............x............',
    '............x............',
    '............x............',
    '............x............',
    '............x............',
    '............x............',
    '............x............',
    '............x............',
    '............x............',
    '............x............',
    '............x............',
  ],
};

/** Drips from the leak, falling onto the canopy and splashing. Framed, 3x10. */
const drips: PixelSprite = {
  id: 'rm6-opener-drips',
  name: 'drips',
  tags: ['scene', 'rm6'],
  rows: rmPlot(3, 10, [[1, 0, 'B'], [1, 1, 'b']]),
  frames: [
    rmPlot(3, 10, [[1, 0, 'B'], [1, 1, 'b']]),
    rmPlot(3, 10, [[1, 3, 'B'], [1, 4, 'b']]),
    rmPlot(3, 10, [[1, 6, 'B'], [1, 7, 'b']]),
    rmPlot(3, 10, [[0, 9, 'B'], [2, 9, 'B'], [1, 0, 'b']]),
  ],
  frameMs: 220,
};

/** The leak: a crack in the cornice and the wet stain under it. 7x3. */
const leak: PixelSprite = {
  id: 'rm6-opener-leak',
  name: 'leak',
  tags: ['scene', 'rm6'],
  palette: RM_PALETTE,
  rows: [
    '..KDK..',
    '.uuKuu.',
    '..uuu..',
  ],
};

/** The anchor hung on the wall: ring, stock, shank, flukes. Iron. 13x20. */
const anchor: PixelSprite = {
  id: 'rm6-opener-anchor',
  name: 'anchor',
  tags: ['scene', 'rm6'],
  rows: [
    '....DDDDD....',
    '...DX...XD...',
    '...DX...XD...',
    '....DXxXD....',
    '.....DxD.....',
    '.DDDDDXDDDDD.',
    '.DxxxxXxxxxD.',
    '.DDDDDXDDDDD.',
    '.....DXD.....',
    '.....DXD.....',
    '.....DXD.....',
    '.....DXD.....',
    '.....DXD.....',
    '.....DXD.....',
    'xD...DXD...Dx',
    'DXD..DXD..DXD',
    '.DXD.DXD.DXD.',
    '..DXDDXDDXD..',
    '...DXXXXXD...',
    '....DDDDD....',
  ],
};

/** The peg the anchor's ring hangs on. 3x2. */
const peg: PixelSprite = {
  id: 'rm6-opener-peg',
  name: 'peg',
  tags: ['scene', 'rm6'],
  rows: [
    'OGO',
    '.O.',
  ],
};

/** Floor shadows under the table and the keeper. */
const floorShadow: PixelSprite = {
  id: 'rm6-opener-floor-shadow',
  name: 'rm6-opener-floor-shadow',
  tags: ['scene', 'rm6'],
  palette: RM_PALETTE,
  rows: [
    '..ZZZZZZZZZZZZZZZZZZZZZZZZ..ZZZZZZZZZZZZZZ',
    '....ZZZZZZZZZZZZZZZZZZZZ......ZZZZZZZZZZ..',
  ],
};

const base = rmCompose('rm6-opener-base', rmWatchRoom(80, 60, 50), [
  [rmStormWindow, 36, 5],
  [leak, 18, 2],
  [peg, 6, 6],
  [anchor, 1, 8],
  [floorShadow, 4, 52],
  [rmChartTable, 6, 38],
  [rmLogbook, 16, 36],
]);

export const rm6Opener: SceneArt = {
  id: 'rm6-opener',
  label: 'A lighthouse keeper holds an orchid umbrella over the chart table as a leak drips from the ceiling in the rain, with an iron anchor hung on the wall.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: rmShip, x: 60, y: 15, motion: { kind: 'bob', amp: 1, periodMs: 2600 } },
    { sprite: rmSwell, x: 41, y: 26, motion: { kind: 'drift', amp: 2, periodMs: 3800 } },
    { sprite: rmRain, x: 38, y: 7 },
    { sprite: umbrella, x: 16, y: 10 },
    { sprite: drips, x: 20, y: 3 },
    { sprite: rmKeeperLift, x: 27, y: 24 },
    { sprite: rmLantern, x: 8, y: 30 },
  ],
};

/** Lesson 6's emblem: an orchid umbrella shrugging off two raindrops. 15x13. */
const emblemUmbrella: PixelSprite = {
  id: 'rm6-emblem-umbrella',
  name: 'umbrella',
  tags: ['rm', 'emblem', 'lesson 6'],
  rows: [
    '.......x.......',
    '..B..EEPEE..B..',
    '...EEqqPPpEE...',
    '..EqqPPPPPppE..',
    '.EqPPPPpPPPPpE.',
    'EqPPPPPpPPPPPpE',
    'E..E...x...E..E',
    '.......x.......',
    '.......x.......',
    '.......x.......',
    '.......x.......',
    '.......x..x....',
    '........xx.....',
  ],
};

export const rm6Finish: SceneArt = rmKeepsake(
  'rm6-finish',
  'A red and white life ring hanging from a rope, with an orchid umbrella at its center shedding two raindrops.',
  emblemUmbrella,
);

export const art: LessonArtSet = { opener: rm6Opener, backdrop: rmBackdrop, finish: rm6Finish };
