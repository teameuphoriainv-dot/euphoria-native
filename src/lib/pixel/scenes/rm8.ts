/**
 * Risk Management lesson 8 opener, Enterprise Risk Management: on a calm night the keeper sets one
 * board on the easel, the risk heat map, every risk on one grid from green to red, the worst corner
 * pulsing. Lesson 1's four signal flags hang over the room again, recoloured from four separate
 * risks into one scale, which is the point of ERM: the firm sees its risks together. Moving: the
 * flags, the red corner, the ship, the swell, the stars.
 */
import type { PixelSprite } from '../types';
import { rmBackdrop } from './rm-backdrop';
import { RM_PALETTE, rmCompose, rmKeepsake, rmRetint, rmRiskFlags, rmShip, rmWatchRoom } from './rm-kit';
import { rmCalmWindow, rmFlip, rmKeeperReach, rmStar, rmSwellCalm } from './rm-kit-a';
import type { LessonArtSet, SceneArt } from './types';

/** The grid, likelihood left to right and impact bottom to top: green, gold, orange, red. */
const HEAT = [
  ['G', '3', 'R', 'R'],
  ['N', 'G', '3', 'R'],
  ['N', 'N', 'G', '3'],
  ['N', 'N', 'N', 'G'],
];
/** Each cell's lit top row. */
const LIT: Record<string, string> = { N: 'm', G: 'y', '3': '4', R: 's' };

/** The heat map board: a framed 4x4 grid of 4x3 cells with dark gutters. 23x19. */
function heatBoardRows(): string[] {
  const grid: string[] = [];
  HEAT.forEach((cells, gy) => {
    if (gy > 0) grid.push('K'.repeat(19));
    grid.push(cells.map((c) => LIT[c].repeat(4)).join('K'));
    grid.push(cells.map((c) => c.repeat(4)).join('K'), cells.map((c) => c.repeat(4)).join('K'));
  });
  return ['D'.repeat(23), `D${'X'.repeat(21)}D`, ...grid.map((g) => `DX${g}XD`), `D${'X'.repeat(21)}D`, 'D'.repeat(23)];
}

const heatBoard: PixelSprite = {
  id: 'rm8-opener-heat-board',
  name: 'heat map board',
  tags: ['scene', 'rm8'],
  rows: heatBoardRows(),
};

/** The worst cell lit up; give it a `twinkle` so the red corner pulses. 4x3. */
const hotCell: PixelSprite = {
  id: 'rm8-opener-hot-cell',
  name: 'hot cell',
  tags: ['scene', 'rm8'],
  rows: ['ssss', 'ssss', 'ssss'],
};

/** The easel: a peg over the board, the ledge it stands on, three legs to the floor. 24x35. */
const easel: PixelSprite = {
  id: 'rm8-opener-easel',
  name: 'easel',
  tags: ['scene', 'rm8'],
  rows: [
    '...........Og...........',
    '...........Og...........',
    '...........Og...........',
    ...Array.from({ length: 19 }, () => '.'.repeat(24)),
    'OOOOOOOOOOOOOOOOOOOOOOOO',
    'gggggggggggggggggggggggg',
    '.....gO.....O.....Og....',
    '.....gO.....O.....Og....',
    '....gO......O......Og...',
    '....gO......O......Og...',
    '....gO......O......Og...',
    '...gO.......O.......Og..',
    '...gO.......O.......Og..',
    '...gO.......O.......Og..',
    '..gO.................Og.',
    '..gO.................Og.',
    '..OO.................OO.',
  ],
};

/** Lesson 1's four risk flags, retinted into the heat map's one scale. 46x9. */
const heatFlags = rmRetint(rmRiskFlags, 'rm8-opener-flags', { R: 'N', r: 'n', P: 'G', p: 'g', G: '3', g: '2', B: 'R', b: 'r' });

/** Floor shadows under the keeper and the easel's feet. */
const floorShadow: PixelSprite = {
  id: 'rm8-opener-floor-shadow',
  name: 'rm8-opener-floor-shadow',
  tags: ['scene', 'rm8'],
  palette: RM_PALETTE,
  rows: [
    '..ZZZZZZZZZZZZZZZZ...........................',
    '....ZZZZZZZZZZZZ.............................',
    '......................ZZZZ...............ZZZZ',
  ],
};

const base = rmCompose('rm8-opener-base', rmWatchRoom(80, 60, 50), [
  [rmCalmWindow, 2, 6],
  [floorShadow, 34, 52],
  [easel, 55, 19],
  [heatBoard, 55, 22],
]);

export const rm8Opener: SceneArt = {
  id: 'rm8-opener',
  label: 'A lighthouse keeper presents a risk heat map on an easel, a grid of green, gold, orange and red squares with the red corner glowing, under four signal flags in the same colors by a calm moonlit window.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: rmStar, x: 12, y: 9, motion: { kind: 'twinkle', periodMs: 3600, min: 0.2 } },
    { sprite: rmStar, x: 27, y: 13, motion: { kind: 'twinkle', periodMs: 4400, min: 0.2, phase: 0.4 } },
    { sprite: rmShip, x: 21, y: 15, motion: { kind: 'bob', amp: 1, periodMs: 3400 } },
    { sprite: rmSwellCalm, x: 6, y: 27, motion: { kind: 'drift', amp: 2, periodMs: 5600 } },
    { sprite: heatFlags, x: 1, y: 2 },
    { sprite: hotCell, x: 72, y: 24, motion: { kind: 'twinkle', periodMs: 1400, min: 0 } },
    { sprite: rmFlip(rmKeeperReach, 'rm8-opener-keeper'), x: 36, y: 24 },
  ],
};

/** Lesson 8's emblem: a 3x3 heat map, green to red, its corners rounded to sit in the ring. 14x14. */
const emblemHeatMap: PixelSprite = {
  id: 'rm8-emblem-heat-map',
  name: 'heat map',
  tags: ['rm', 'emblem', 'lesson 8'],
  rows: [
    '.yyy.4444.sss.',
    'GGGG.3333.RRRR',
    'GGGG.3333.RRRR',
    'GGGG.3333.RRRR',
    '..............',
    'mmmm.yyyy.4444',
    'NNNN.GGGG.3333',
    'NNNN.GGGG.3333',
    'NNNN.GGGG.3333',
    '..............',
    'mmmm.mmmm.yyyy',
    'NNNN.NNNN.GGGG',
    'NNNN.NNNN.GGGG',
    '.NNN.NNNN.GGG.',
  ],
};

export const rm8Finish: SceneArt = rmKeepsake(
  'rm8-finish',
  'A red and white life ring hanging from a rope, with a heat map at its center, squares running from green to red.',
  emblemHeatMap,
);

export const art: LessonArtSet = { opener: rm8Opener, backdrop: rmBackdrop, finish: rm8Finish };
