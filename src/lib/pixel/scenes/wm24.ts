/**
 * Wealth Management lesson 24 (technology and robo-advisors): its opener, the pathway backdrop and
 * its keepsake, as one set loaded on demand.
 *
 * The opener is the study after dark with the lamps off: near-black walls, the curtained window
 * (wm-kit-a.ts), and the brightest thing in the room a big screen on the wall showing a portfolio as
 * a pie and a rising line. At the desk under it a small white robot advisor types away, eyes
 * glowing; the advisor of lessons past, drawn large from wm-kit-c.ts, stands by with his briefcase
 * and watches it work. The lesson's point is that software now does much of the routine (rebalancing,
 * tax-loss harvesting, low fees at any size), so the two advisors share the picture. The chart's line
 * stays put, because it is data; what moves is the robot: its eyes blink, its antenna light pulses,
 * its hands type, a cursor blinks at the line's end, steam rises from a mug, a star twinkles in the
 * window. The keepsake carries a microchip.
 */
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';
import { wmBackdrop } from './wm-backdrop';
import { wmBands, wmCompose, wmStarDot, WM_INKS } from './wm-kit';
import { wmStripes, wmWindow } from './wm-kit-a';
import { wmAdvisorTall } from './wm-kit-c';
import { wmKeepsake } from './wm1-finish';

/** The wall screen's top-left; its picture sits 2 in from the bezel. */
const SCREEN_X = 38;
const SCREEN_Y = 5;
const PICTURE_W = 32;
const PICTURE_H = 18;

/** The robot's top-left, behind the desk; its eyes, antenna and hands are placed from it. */
const ROBOT_X = 48;
const ROBOT_Y = 27;

const DESK_X = 34;
const DESK_Y = 46;

/** The portfolio's line, rising left to right: data, so it never moves. */
const LINE: readonly (readonly [number, number])[] = [
  [18, 14], [19, 14], [20, 13], [21, 13], [22, 12], [23, 11], [24, 11], [25, 9], [26, 9], [27, 8], [28, 6], [29, 5], [30, 4],
];

/** The screen's picture: a title bar, a pie of four holdings, a chart with its line. 32x18. */
function picture(): string[] {
  const grid = wmBands(PICTURE_W, [['b', PICTURE_H]]).map((row) => [...row]);
  for (let x = 0; x < PICTURE_W; x += 1) grid[0][x] = 'B';
  grid[0][1] = 'R';
  grid[0][3] = 'G';
  grid[0][5] = 'N';
  for (let y = 0; y < PICTURE_H; y += 1) {
    for (let x = 0; x < 16; x += 1) {
      const dx = x - 8;
      const dy = y - 10;
      if (dx * dx + dy * dy > 30) continue;
      if (dx >= 0) grid[y][x] = dy < 0 ? 'G' : 'N';
      else grid[y][x] = dy < 0 ? 'w' : 'q';
    }
  }
  for (let y = 3; y <= 16; y += 1) grid[y][17] = 'B';
  for (let x = 17; x <= 30; x += 1) grid[16][x] = 'B';
  for (const [x, y] of LINE) grid[y][x] = 'm';
  return grid.map((row) => row.join(''));
}

/** The wall screen: a dark bezel round the picture. 36x22. */
const screen: PixelSprite = {
  id: 'wm24-opener-screen',
  name: 'wm24-opener-screen',
  tags: ['scene', 'wm24'],
  rows: [
    'D'.repeat(PICTURE_W + 4),
    `D${'K'.repeat(PICTURE_W + 2)}D`,
    ...picture().map((row) => `DK${row}KD`),
    `D${'K'.repeat(PICTURE_W + 2)}D`,
    'D'.repeat(PICTURE_W + 4),
  ],
};

/**
 * The robot advisor from the waist up: a white domed head with a dark visor (its eyes are a layer),
 * ear bolts, an antenna, a chest panel of three lights, arms down to the keys. 16x19.
 */
const robot: PixelSprite = {
  id: 'wm24-opener-robot',
  name: 'wm24-opener-robot',
  tags: ['scene', 'wm24'],
  rows: [
    '.......r........',
    '.......X........',
    '....xwwwwwwX....',
    '...xwwwwwwwwX...',
    '..DxKKKKKKKKXD..',
    '..DxKKKKKKKKXD..',
    '...xKKKKKKKKX...',
    '...xwwwwwwwwX...',
    '....XXXXXXXX....',
    '......DXXD......',
    '..xwwwwwwwwwwX..',
    '.xwwwKKKKKKwwXX.',
    '.xwwwKNKRKGwwXX.',
    '.xwwwKKKKKKwwXX.',
    '.xwwwwwwwwwwwXX.',
    'xXwwwwwwwwwwwXDX',
    'xXwwwwwwwwwwwXDX',
    'xXwwwwwwwwwwwXDX',
    'xXwwwwwwwwwwwXDX',
  ],
};

/** The desk: a lit top, a panelled front, legs. 44x12. */
const desk: PixelSprite = {
  id: 'wm24-opener-desk',
  name: 'wm24-opener-desk',
  tags: ['scene', 'wm24'],
  palette: WM_INKS,
  rows: [
    `${'C'.repeat(43)}U`,
    `${'U'.repeat(43)}O`,
    `.${'K'.repeat(42)}.`,
    ...Array.from({ length: 6 }, () => `.U${'O'.repeat(40)}K.`),
    `.${'K'.repeat(42)}.`,
    `.UO${'.'.repeat(38)}UO.`,
    `.KK${'.'.repeat(38)}KK.`,
  ],
};

/** A keyboard on the desk. 14x2. */
const keyboard: PixelSprite = {
  id: 'wm24-opener-keyboard',
  name: 'wm24-opener-keyboard',
  tags: ['scene', 'wm24'],
  rows: ['DxDxDxDxDxDxDx', 'KKKKKKKKKKKKKK'],
};

/** A white mug with a red band. 5x4. */
const mug: PixelSprite = {
  id: 'wm24-opener-mug',
  name: 'wm24-opener-mug',
  tags: ['scene', 'wm24'],
  rows: ['wwwX.', 'RRRrx', 'wwwXx', 'xxXX.'],
};

const base = wmCompose('wm24-opener-base', [
  ...wmBands(80, [['K', 2], ['D', 1], ['k', 1]]),
  ...wmStripes(80, 41, 'K', 'k', 6),
  ...wmBands(80, [['K', 1], ['k', 1], ['U', 1], ['O', 2], ['U', 1], ['O', 3], ['U', 1], ['O', 4], ['U', 1]]),
], [
  { sprite: wmWindow, x: 2, y: 6 },
  { sprite: screen, x: SCREEN_X, y: SCREEN_Y },
  { sprite: robot, x: ROBOT_X, y: ROBOT_Y },
  { sprite: desk, x: DESK_X, y: DESK_Y },
  { sprite: keyboard, x: ROBOT_X + 1, y: DESK_Y - 2 },
  { sprite: mug, x: 68, y: DESK_Y - 4 },
  { sprite: wmAdvisorTall, x: 19, y: 35 },
]);

/* ── the robot at work ──────────────────────────────────────────────────────────────────────── */

/** The robot's eyes, glowing teal behind the visor, blinking now and then. 6x1. */
const eyes: PixelSprite = {
  id: 'wm24-opener-eyes',
  name: 'wm24-opener-eyes',
  tags: ['scene', 'wm24'],
  rows: ['TT..TT'],
  frames: [['TT..TT'], ['TT..TT'], ['TT..TT'], ['TT..TT'], ['TT..TT'], ['DD..DD']],
  frameMs: 450,
};

/** Its hands on the keys, one pressing while the other lifts. 14x2. */
const typing: PixelSprite = {
  id: 'wm24-opener-typing',
  name: 'wm24-opener-typing',
  tags: ['scene', 'wm24'],
  rows: ['...........xwx', 'xwx...........'],
  frames: [
    ['...........xwx', 'xwx...........'],
    ['xwx...........', '...........xwx'],
  ],
  frameMs: 220,
};

const antennaLight: PixelSprite = {
  id: 'wm24-opener-antenna-light',
  name: 'wm24-opener-antenna-light',
  tags: ['scene', 'wm24'],
  rows: ['R'],
};

/** A cursor at the line's end, blinking: the robot is still at work, not the price moving. */
const cursor: PixelSprite = {
  id: 'wm24-opener-cursor',
  name: 'wm24-opener-cursor',
  tags: ['scene', 'wm24'],
  rows: ['W'],
};

const steam: PixelSprite = {
  id: 'wm24-opener-steam',
  name: 'wm24-opener-steam',
  tags: ['scene', 'wm24'],
  rows: ['.x.', 'x..', '.x.'],
};

export const wm24Opener: SceneArt = {
  id: 'wm24-opener',
  label: 'In a dark study a small white robot advisor types at a desk, its eyes glowing, under a big wall screen showing a portfolio pie and a rising line, while the advisor stands by with his briefcase.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: eyes, x: ROBOT_X + 5, y: ROBOT_Y + 5 },
    { sprite: antennaLight, x: ROBOT_X + 7, y: ROBOT_Y, motion: { kind: 'twinkle', periodMs: 1200, min: 0 } },
    { sprite: typing, x: ROBOT_X + 1, y: DESK_Y - 3 },
    { sprite: cursor, x: SCREEN_X + 2 + 30, y: SCREEN_Y + 2 + 4, motion: { kind: 'twinkle', periodMs: 1000, min: 0 } },
    { sprite: steam, x: 69, y: DESK_Y - 8, motion: { kind: 'rise', amp: 4, periodMs: 2400 } },
    { sprite: wmStarDot, x: 10, y: 10, motion: { kind: 'twinkle', periodMs: 2100, phase: 0.3, min: 0.2 } },
  ],
};

/** A microchip: a die in a square package, pins along every side. */
const emblemChip: PixelSprite = {
  id: 'wm24-emblem-chip',
  name: 'wm24-emblem-chip',
  tags: ['scene', 'wm24'],
  rows: [
    '...y.y..y.y...',
    '...G.G..G.g...',
    '..yyyyyyyyyg..',
    'yGyGGGGGGGGgGg',
    '..yGOOOOOOGg..',
    'yGyGOwyGGOGgGg',
    '..yGOyGGgOGg..',
    '..yGOGGggOGg..',
    'yGyGOOOOOOGgGg',
    '..yGGGGGGGGg..',
    'yGygggggggggGg',
    '...G.G..G.g...',
    '...g.g..g.O...',
  ],
};

export const wm24Finish: SceneArt = wmKeepsake(
  'wm24-finish',
  emblemChip,
  'A green crest with a gold rim bearing a microchip, framed by laurel over a purple banner, with sparkles around it.',
);

export const art: LessonArtSet = { opener: wm24Opener, backdrop: wmBackdrop, finish: wm24Finish };
