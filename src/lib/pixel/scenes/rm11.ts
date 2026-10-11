/**
 * Risk Management lesson 11 opener, Tail Risk & Black Swan Events: a storm at the window, and out on
 * the water, among the white swans the keeper has been counting all his life, a black one, lit up by
 * the lightning. The slate on the wall is the count: tally after tally of white swans, the forty years
 * of data that said it could not happen. One black swan is enough to undo all of it; that is the fat
 * tail. Moving: lightning and the water it lights, rain on the glass, the swell, the three swans.
 */
import type { PixelSprite } from '../types';
import { rmBackdrop } from './rm-backdrop';
import {
  RM_PALETTE,
  rmCompose,
  rmKeepsake,
  rmLightning,
  rmRain,
  rmRopeCoil,
  rmStormWindow,
  rmWatchRoom,
} from './rm-kit';
import { rmFlip, rmKeeperRaise, rmPortSwell } from './rm-kit-a';
import type { LessonArtSet, SceneArt } from './types';

/** A white swan on the water, facing left: orange bill, S-neck, tail up. 9x8. */
const whiteSwan: PixelSprite = {
  id: 'rm11-opener-white-swan',
  name: 'white swan',
  tags: ['scene', 'rm11'],
  rows: [
    '.ww......',
    '3wKw.....',
    '..ww.....',
    '...w.....',
    '...w...ww',
    '..wwwwwwx',
    '.wwwwwwxx',
    '..xxxxxx.',
  ],
};

/**
 * The black swan: the white swans' own pose, half as big again, black, rim-lit in slate by the
 * lightning so its shape holds on the dark water, red bill and red eye. 14x13.
 */
const blackSwan: PixelSprite = {
  id: 'rm11-opener-black-swan',
  name: 'black swan',
  tags: ['scene', 'rm11'],
  rows: [
    '.XXX..........',
    'XKKKX.........',
    'RRKsKX........',
    '.XXKKX........',
    '...XKX........',
    '...XKX........',
    '...XKX.....XX.',
    '...XKKX...XKKX',
    '..XKKKKXXXKKKX',
    '.XKKKKKKKKKKKX',
    'XKKKKKKKKKKKX.',
    '.XKKKKKKKKKX..',
    '..XXXXXXXXX...',
  ],
};

/** The lightning's light on the water under the black swan, lit rows between dimmer ones. 22x5. */
const litWater: PixelSprite = {
  id: 'rm11-opener-lit-water',
  name: 'lit water',
  tags: ['scene', 'rm11'],
  palette: RM_PALETTE,
  rows: [
    '....UUUUUUUUUUUUUU....',
    '..BBBwBBBBBBBBBwBBBB..',
    'UUUUUUUUUUUUUUUUUUUUUU',
    '.BBwBBBBBBBwBBBBBBwBB.',
    '...UUUUUUUUUUUUUUUU...',
  ],
};

/** One tally in chalk: four strokes and the slash across them. 7x5. */
const TALLY = ['x.x.x.w', 'x.x.xwx', 'x.xww.x', 'xww.x.x', 'w.x.x.x'];
/** The chalk swan at the top of the slate. 7x5. */
const CHALK_SWAN = ['.ww....', '3w.....', '.w...w.', '.wwwwww', '..wwww.'];
const chalk = (row: string) => row.replace(/\./g, 'K');

/** The tally slate: a chalk swan, then tally after tally of white swans counted. 19x23. */
const slate: PixelSprite = {
  id: 'rm11-opener-slate',
  name: 'tally slate',
  tags: ['scene', 'rm11'],
  rows: [
    '.OOOOOOOOOOOOOOOOO.',
    'OgggggggggggggggggO',
    'OgKKKKKKKKKKKKKKKgO',
    ...CHALK_SWAN.map((row) => `OgK${chalk(row)}KKKKKKKgO`),
    'OgKKKKKKKKKKKKKKKgO',
    ...TALLY.map((t) => `Og${chalk(t)}K${chalk(t)}gO`),
    'OgKKKKKKKKKKKKKKKgO',
    ...TALLY.map((t) => `Og${chalk(t)}KxKxKKKKgO`),
    'OgKKKKKKKKKKKKKKKgO',
    'OgggggggggggggggggO',
    '.OOOOOOOOOOOOOOOOO.',
  ],
};

/** Floor shadows under the keeper and the coil. */
const floorShadow: PixelSprite = {
  id: 'rm11-opener-floor-shadow',
  name: 'rm11-opener-floor-shadow',
  tags: ['scene', 'rm11'],
  palette: RM_PALETTE,
  rows: [
    '..ZZZZZZZZZZZZZZZZ..........ZZZZZZZZZZZZZZ',
    '....ZZZZZZZZZZZZ..............ZZZZZZZZZZ..',
  ],
};

const base = rmCompose('rm11-opener-base', rmWatchRoom(80, 60, 50), [
  [rmStormWindow, 36, 5],
  [slate, 1, 4],
  [floorShadow, 15, 52],
  [rmRopeCoil, 42, 51],
]);

export const rm11Opener: SceneArt = {
  id: 'rm11-opener',
  label: 'In a storm, a lighthouse keeper points out of the window at a black swan swimming among white swans, under a slate covered in tally marks for every white swan he has counted.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: rmLightning, x: 63, y: 7 },
    { sprite: litWater, x: 55, y: 27, motion: { kind: 'twinkle', periodMs: 2200, min: 0.4 } },
    { sprite: rmPortSwell, x: 40, y: 30, motion: { kind: 'drift', amp: 1, periodMs: 3400 } },
    { sprite: whiteSwan, x: 40, y: 20, motion: { kind: 'bob', amp: 1, periodMs: 2600, phase: 0.2 } },
    { sprite: whiteSwan, x: 47, y: 23, motion: { kind: 'bob', amp: 1, periodMs: 2900, phase: 0.7 } },
    { sprite: blackSwan, x: 59, y: 18, motion: { kind: 'bob', amp: 1, periodMs: 2400 } },
    { sprite: rmRain, x: 38, y: 7 },
    { sprite: rmFlip(rmKeeperRaise, 'rm11-opener-keeper'), x: 17, y: 24 },
  ],
};

/** Lesson 11's emblem: a black swan against a full moon, rising off the water. 16x15. */
const emblemBlackSwan: PixelSprite = {
  id: 'rm11-emblem-black-swan',
  name: 'black swan',
  tags: ['rm', 'emblem', 'lesson 11'],
  palette: RM_PALETTE,
  rows: [
    '................',
    '.....yyyyyy.....',
    '...yyywwyyyyy...',
    '..yyywKKyyyyyy..',
    '..yyyRKKKyyyyy..',
    '.yyyyyyKKyyyyyy.',
    '.yyyyyyKyyyyyyy.',
    '.yyyyyyKKyyyyyy.',
    '.yyyyyyyKyyyKKy.',
    '.yyyyyyKKKyKKKy.',
    '..yyyKKKKKKKKKK.',
    '..yyKKKKKKKKKKw.',
    '...gKKKKKKKKKww.',
    '..uUUKKKKKKKKUu.',
    '...uuuuuuuuuu...',
  ],
};

export const rm11Finish: SceneArt = rmKeepsake(
  'rm11-finish',
  'A red and white life ring hanging from a rope, with a black swan at its center, outlined against a full moon.',
  emblemBlackSwan,
);

export const art: LessonArtSet = { opener: rm11Opener, backdrop: rmBackdrop, finish: rm11Finish };
