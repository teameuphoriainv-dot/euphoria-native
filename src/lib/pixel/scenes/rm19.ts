/**
 * Risk Management lesson 19 opener, Scenario Analysis & War Gaming: a tabletop exercise by lamplight.
 * The room is dark but for the lamp over the games table, and on the table is a chart of the harbour,
 * the headland with its lighthouse, the pier and the sea squared off for play, with the keeper's gold
 * ship tokens out on it. Across it the keeper raises a finger, what if, and the mate lifts a storm
 * token to set it down among them: playing the shock before it comes, while it still costs nothing.
 * On the wall the scenario matrix is chalked, impact up and likelihood along, and in the corner
 * where the impact is high and the odds are low, the corner the exercise is for, a storm in red.
 * Moving: the lamp flame, moths round the light, dust rising through it, a glint on a ship token.
 */
import type { PixelSprite } from '../types';
import { rmBackdrop } from './rm-backdrop';
import { RM_PALETTE, rmCompose, rmKeepsake, rmLater } from './rm-kit';
import { rmFlip, rmGlint, rmKeeperRaise, rmMark } from './rm-kit-a';
import type { RmPoint } from './rm-kit-a';
import { rmFill, rmMateLift } from './rm-kit-b';
import { rmMoth } from './rm-kit-c';
import type { LessonArtSet, SceneArt } from './types';

/** The dark room: the lamp's light falls in a cone from the shade to the floor and pools under the table. */
const ground = Array.from({ length: 60 }, (_, y) =>
  Array.from({ length: 80 }, (_, x) => {
    if (y < 2) return 'K';
    if (y === 2 || y === 49) return 'D';
    if (y < 49) return y >= 14 && Math.abs(x - 40) <= 3 + (y - 14) * 0.62 ? 'k' : 'K';
    return ((x - 40) / 27) ** 2 + ((y - 54) / 4.5) ** 2 <= 1 ? 'k' : 'K';
  }).join(''),
);

/** The lamp on its chain: a brass shade, lit inside. 9x11. */
const lamp: PixelSprite = {
  id: 'rm19-opener-lamp',
  name: 'hanging lamp',
  tags: ['scene', 'rm19'],
  rows: [
    '....X....',
    '....x....',
    '....X....',
    '....x....',
    '....X....',
    '....x....',
    '...OOO...',
    '..OyGgO..',
    '.OyGGGgO.',
    'OyGGGGGgO',
    'OOOOOOOOO',
  ],
};

/** The mantle glowing under the shade, flickering. Framed, 3x2. */
const flame: PixelSprite = {
  id: 'rm19-opener-flame',
  name: 'lamp flame',
  tags: ['scene', 'rm19'],
  rows: ['454', '.4.'],
  frames: [
    ['454', '.4.'],
    ['545', '.4.'],
    ['444', '.5.'],
    ['454', '.3.'],
  ],
  frameMs: 200,
};

/**
 * One row of the harbour chart on the table, 24 wide: the headland on the left with the lighthouse
 * on its point, the pier running out on the fourth row, and the sea squared off for play.
 */
function chartRow(r: number): string {
  const coast = [5, 5, 4, 4, 4, 3, 3, 3][r];
  return Array.from({ length: 24 }, (_, x) => {
    if (r === 1 && x === 1) return 'R';
    if (r === 2 && x === 1) return 'w';
    if (x < coast) return x + r < 4 ? 'x' : 'X';
    if (r === 3 && x < coast + 6) return 'x';
    return x % 6 === 5 || r === 5 ? 'b' : 'B';
  }).join('');
}

/** The games table: the harbour chart in a dark wood frame, a lit edge, a pedestal and its foot. 26x21. */
const chartTable: PixelSprite = {
  id: 'rm19-opener-table',
  name: 'chart table',
  tags: ['scene', 'rm19'],
  rows: [
    ...Array.from({ length: 8 }, (_, r) => `O${chartRow(r)}O`),
    `G${'y'.repeat(24)}G`,
    `O${'g'.repeat(24)}O`,
    `.${'O'.repeat(24)}.`,
    ...Array.from({ length: 7 }, () => '...........OggO...........'),
    '.........OOOggOOO.........',
    '.......OgggggggggggO......',
    '......OOOOOOOOOOOOOO......',
  ],
};

/** A token for the table: a small sprite of the exercise's pieces. */
const piece = (id: string, rows: string[]): PixelSprite => ({ id, name: id, tags: ['scene', 'rm19'], rows });

/** The keeper's ship token: a white sail over a gold hull. 4x3. */
const shipToken = piece('rm19-opener-ship-token', ['.w..', '.ww.', 'GGGg']);

/** The storm token the mate lifts to play: a grey cloud, a yellow bolt under it, on a dark base. 6x8. */
const stormToken = piece('rm19-opener-storm-token', ['.xxx..', 'xwwwx.', 'xwwxxX', 'XXXXXX', '..y...', '.yy...', '..y...', 'DDDDDD']);

/** The chalk scenario matrix's own marks: two axes with arrowheads, the grid between, a red storm high and to the left. */
const MATRIX_MARKS: readonly RmPoint[] = [
  ...Array.from({ length: 12 }, (_, i): RmPoint => [3, 2 + i, 'x']),
  [2, 3, 'x'], [4, 3, 'x'],
  ...Array.from({ length: 15 }, (_, i): RmPoint => [3 + i, 13, 'x']),
  [16, 12, 'x'], [16, 14, 'x'],
  ...Array.from({ length: 10 }, (_, i): RmPoint => [10, 3 + i, 'X']),
  ...Array.from({ length: 13 }, (_, i): RmPoint => [4 + i, 8, 'X']),
  [6, 4, 'x'], [7, 4, 'x'], [5, 5, 'x'], [6, 5, 'x'], [7, 5, 'x'], [8, 5, 'x'], [6, 6, 'R'], [5, 7, 'R'],
  [13, 10, 'x'], [12, 11, 'x'], [14, 11, 'x'],
];

/** The scenario matrix chalked on a slate on the wall: impact up the side, likelihood along the foot. 18x16. */
const matrix: PixelSprite = {
  id: 'rm19-opener-matrix',
  name: 'scenario matrix',
  tags: ['scene', 'rm19'],
  rows: rmMark(
    Array.from({ length: 16 }, (_, y) => (y === 0 || y === 15 ? 'D'.repeat(18) : `D${'K'.repeat(16)}D`)),
    MATRIX_MARKS,
  ),
};

/** A mote of dust in the lamplight; give it a `rise`. */
const mote = piece('rm19-opener-mote', ['x']);

/** Floor shadows under the keeper, the table's foot and the mate. */
const floorShadow: PixelSprite = {
  id: 'rm19-opener-floor-shadow',
  name: 'rm19-opener-floor-shadow',
  tags: ['scene', 'rm19'],
  palette: RM_PALETTE,
  rows: rmFill(['.'.repeat(66), '.'.repeat(66)], [[2, 19, 0, 'Z'], [25, 40, 0, 'Z'], [48, 65, 0, 'Z'], [4, 17, 1, 'Z'], [27, 38, 1, 'Z'], [50, 63, 1, 'Z']]),
};

const base = rmCompose('rm19-opener-base', ground, [
  [lamp, 36, 3],
  [matrix, 3, 4],
  [floorShadow, 6, 52],
  [chartTable, 27, 32],
  [shipToken, 37, 31],
  [shipToken, 43, 34],
  [rmFlip(rmKeeperRaise, 'rm19-opener-keeper'), 8, 24],
  [rmMateLift, 54, 24],
  [stormToken, 52, 23],
]);

export const rm19Opener: SceneArt = {
  id: 'rm19-opener',
  label: 'In a dark room lit by one hanging lamp, the lighthouse keeper raises a finger across a table spread with a harbor chart and gold ship tokens as a bearded mate lifts a storm token to play on it, under a chalked impact and likelihood grid with a red storm in its high impact corner.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: flame, x: 39, y: 14 },
    { sprite: rmMoth, x: 31, y: 11, motion: { kind: 'drift', amp: 3, periodMs: 2600 } },
    { sprite: rmLater(rmMoth, 'rm19-opener-moth-later', 1, 140), x: 47, y: 16, motion: { kind: 'drift', amp: 2, periodMs: 2100, phase: 0.5 } },
    { sprite: mote, x: 36, y: 30, motion: { kind: 'rise', amp: 9, periodMs: 3800 } },
    { sprite: mote, x: 45, y: 27, motion: { kind: 'rise', amp: 7, periodMs: 3100, phase: 0.5 } },
    { sprite: rmGlint, x: 42, y: 32, motion: { kind: 'twinkle', periodMs: 2400, min: 0.2 } },
  ],
};

/** Lesson 19's emblem: a white chess knight on a gold base. 13x14. */
const emblemKnight: PixelSprite = {
  id: 'rm19-emblem-knight',
  name: 'chess knight',
  tags: ['rm', 'emblem', 'lesson 19'],
  rows: [
    '....xx.......',
    '...xWWx......',
    '..xWWWWxx....',
    '.xWWKWWWWx...',
    'xWWWWWWWWWx..',
    'xWWWWWWWWWWx.',
    '.xxxxxWWWWWx.',
    '.....xWWWWWx.',
    '....xWWWWWWx.',
    '...xWWWWWWWx.',
    '...xWWWWWWWx.',
    '..xxxxxxxxxxx',
    '..yGGGGGGGGGg',
    '..OOOOOOOOOOO',
  ],
};

export const rm19Finish: SceneArt = rmKeepsake(
  'rm19-finish',
  'A red and white life ring hanging from a rope, with a white chess knight on a gold base at its center.',
  emblemKnight,
);

export const art: LessonArtSet = { opener: rm19Opener, backdrop: rmBackdrop, finish: rm19Finish };
