/**
 * Risk Management lesson 19 opener, Scenario Analysis & War Gaming: a war game by lamplight. The room
 * is dark but for the lamp over the chessboard; across it the keeper raises a finger, what if they do
 * this, and the mate lifts a knight to try it. Scenario analysis is playing the attack before it
 * comes, moving for the other side as hard as you can while it still costs nothing. Moving: the lamp
 * flame, moths round the light, dust rising through it, a glint on the gold king.
 */
import type { PixelSprite } from '../types';
import { rmBackdrop } from './rm-backdrop';
import { RM_PALETTE, rmCompose, rmKeepsake, rmLater } from './rm-kit';
import { rmFlip, rmGlint, rmKeeperRaise } from './rm-kit-a';
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

/** One row of the board: three-pixel squares, light and dark, offset every second pair of rows. */
const squares = (r: number) =>
  Array.from({ length: 24 }, (_, x) => ((Math.floor(x / 3) + Math.floor(r / 2)) % 2 === 0 ? 'x' : 'X')).join('');

/** The games table: the board in a dark wood frame, a lit edge, a pedestal and its foot. 26x21. */
const chessTable: PixelSprite = {
  id: 'rm19-opener-table',
  name: 'chess table',
  tags: ['scene', 'rm19'],
  rows: [
    ...Array.from({ length: 8 }, (_, r) => `O${squares(r)}O`),
    `G${'y'.repeat(24)}G`,
    `O${'g'.repeat(24)}O`,
    `.${'O'.repeat(24)}.`,
    ...Array.from({ length: 7 }, () => '...........OggO...........'),
    '.........OOOggOOO.........',
    '.......OgggggggggggO......',
    '......OOOOOOOOOOOOOO......',
  ],
};

/** The pieces on the board: the keeper's in gold, the mate's in orchid. */
const piece = (id: string, rows: string[]): PixelSprite => ({ id, name: id, tags: ['scene', 'rm19'], rows });
const goldKing = piece('rm19-opener-gold-king', ['.y.', 'yGy', '.G.', 'yGg', '.G.', '.G.', 'yGg']);
const goldPawn = piece('rm19-opener-gold-pawn', ['.y.', 'yGg', '.G.', 'yGg']);
const orchidQueen = piece('rm19-opener-orchid-queen', ['q.q', 'qPp', '.P.', '.P.', '.P.', 'qPp']);
const orchidPawn = piece('rm19-opener-orchid-pawn', ['.q.', 'qPp', '.P.', 'qPp']);

/** The knight the mate lifts to move: ears, eye, muzzle to the board, on its base. 6x8. */
const knight = piece('rm19-opener-knight', ['..q.q.', '.qPPPq', 'qPPKPP', 'PPPPPp', 'qq.PPp', '..qPPp', '.qPPPp', 'EEEEEE']);

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
  [floorShadow, 6, 52],
  [chessTable, 27, 32],
  [goldKing, 31, 28],
  [goldPawn, 35, 33],
  [orchidPawn, 43, 32],
  [orchidQueen, 47, 28],
  [rmFlip(rmKeeperRaise, 'rm19-opener-keeper'), 8, 24],
  [rmMateLift, 54, 24],
  [knight, 52, 23],
]);

export const rm19Opener: SceneArt = {
  id: 'rm19-opener',
  label: 'In a dark room lit by one hanging lamp, the lighthouse keeper raises a finger across a chessboard as a bearded mate in an orchid oilskin lifts a knight to make the next move.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: flame, x: 39, y: 14 },
    { sprite: rmMoth, x: 31, y: 11, motion: { kind: 'drift', amp: 3, periodMs: 2600 } },
    { sprite: rmLater(rmMoth, 'rm19-opener-moth-later', 1, 140), x: 47, y: 16, motion: { kind: 'drift', amp: 2, periodMs: 2100, phase: 0.5 } },
    { sprite: mote, x: 36, y: 30, motion: { kind: 'rise', amp: 9, periodMs: 3800 } },
    { sprite: mote, x: 45, y: 27, motion: { kind: 'rise', amp: 7, periodMs: 3100, phase: 0.5 } },
    { sprite: rmGlint, x: 31, y: 27, motion: { kind: 'twinkle', periodMs: 2400, min: 0.2 } },
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
