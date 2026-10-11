/**
 * Wealth Management lesson 14 (real estate in wealth management): its opener, the pathway backdrop
 * and its keepsake, as one set loaded on demand.
 *
 * The opener is a stone cottage the family lets, down the lane from the estate under a crescent
 * moon: a slate roof, a chimney, two lamplit windows, a lantern by the door, a picket fence with
 * the garden gate open onto the cobbles. The father who owns it holds up its key, and a letting
 * sign with a little gold house swings from its post. The lesson's point is a building that pays
 * while it stands, so the cottage's chimney puffs gold coins up into the night like smoke: rent,
 * month after month. What moves: the coins and a wisp of smoke, the windows breathing, the door
 * lantern, the sign, a firefly, stars. The keepsake carries a house.
 */
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';
import { wmBackdrop } from './wm-backdrop';
import { wmBands, wmCoinMote, wmCompose, wmFirefly, wmLampFlame, wmStar, wmStarDot, WM_INKS } from './wm-kit';
import { wmTreeline } from './wm-kit-a';
import { wmAshlar, wmCobbles, wmCottageGlow, wmCottageWindow, wmSkyDots } from './wm-kit-b';
import { wmKeepsake } from './wm1-finish';

/** The cottage walls' top-left; windows, door and lantern are placed from it. */
const WALL_X = 38;
const WALL_Y = 32;

/** The chimney pot's top, where the coins and smoke start. */
const POT_X = 60;
const POT_Y = 11;

const skyDots = wmSkyDots('wm14-opener-sky-dots', 80, 30, [
  [24, 4, 'X'],
  [37, 11, 'D'],
  [48, 3, 'X'],
  [71, 8, 'D'],
  [77, 15, 'X'],
  [17, 19, 'D'],
  [3, 23, 'X'],
  [31, 22, 'D'],
]);

const moon: PixelSprite = {
  id: 'wm14-opener-moon',
  name: 'wm14-opener-moon',
  tags: ['scene', 'wm14'],
  rows: ['..xwwx.', '.xwwx..', 'xwwx...', 'xww....', 'xww....', 'xww....', 'xwwx...', '.xwwx..', '..xwwx.'],
};

const trees = wmTreeline('wm14-opener-trees', 80, 11, [
  [40, 40, 3],
  [8, 8, 9],
  [22, 6, 6],
  [76, 7, 8],
]);

/** The cottage's front: dressed stone lit down its left edge. 34x15. */
const walls: PixelSprite = {
  id: 'wm14-opener-walls',
  name: 'wm14-opener-walls',
  tags: ['scene', 'wm14'],
  rows: wmAshlar(32, 15, 'X', 'D', 6, 3).map((row) => `x${row}D`),
};

/** The slate roof: a lit ridge, slate courses, a lit verge on the left, the eaves' shadow. 40x13. */
const roof: PixelSprite = {
  id: 'wm14-opener-roof',
  name: 'wm14-opener-roof',
  tags: ['scene', 'wm14'],
  rows: Array.from({ length: 13 }, (_, j) => {
    const spread = Math.round((7 * j) / 12);
    return Array.from({ length: 40 }, (_, x) => {
      if (x < 7 - spread || x > 32 + spread) return '.';
      if (j === 0) return 'x';
      if (j === 12) return 'K';
      if (x === 7 - spread) return 'X';
      return j % 3 === 0 ? 'k' : 'D';
    }).join('');
  }),
};

/** A stone chimney stack with a terracotta pot. 5x10. */
const chimney: PixelSprite = {
  id: 'wm14-opener-chimney',
  name: 'wm14-opener-chimney',
  tags: ['scene', 'wm14'],
  palette: WM_INKS,
  rows: ['.UCU.', '.UCU.', 'xXXXD', 'xXDXD', 'xXXXD', 'xDXXD', 'xXXXD', 'xXXDD', 'xXXXD', 'xXXXD'],
};

/** A panelled front door with a brass knob, on a stone step. 6x11. */
const door: PixelSprite = {
  id: 'wm14-opener-door',
  name: 'wm14-opener-door',
  tags: ['scene', 'wm14'],
  palette: WM_INKS,
  rows: ['xXXXXD', 'xOUUOD', 'xUCCUD', 'xUCCUD', 'xUUUUD', 'xUCCGD', 'xUCCUD', 'xUCCUD', 'xUUUUD', 'xOOOOD', 'XXXXXX'],
};

/** An iron wall lantern; its glass (x 1, y 1, 3x3) takes wmLampFlame. 5x5. */
const lantern: PixelSprite = {
  id: 'wm14-opener-lantern',
  name: 'wm14-opener-lantern',
  tags: ['scene', 'wm14'],
  rows: ['.DXD.', 'DyGgD', 'DGyGD', 'DgGgD', '.DXD.'],
};

/** White pickets every four pixels on two rails, from x 0 to `width`. */
function fence(id: string, width: number): PixelSprite {
  const row = (picket: string, between: string) =>
    Array.from({ length: width }, (_, x) => (x % 4 === 0 ? picket : between)).join('');
  return {
    id,
    name: id,
    tags: ['scene', 'wm14'],
    rows: [row('w', '.'), row('x', '.'), row('x', 'X'), row('x', '.'), row('x', 'X'), row('D', '.')],
  };
}

/** Gravel from the door step down through the gate to the lane. 6x5. */
const path: PixelSprite = {
  id: 'wm14-opener-path',
  name: 'wm14-opener-path',
  tags: ['scene', 'wm14'],
  rows: ['kkkkkk', 'kkkkkk', 'kkDkkk', 'kkkkkk', 'kkkkDk'],
};

/** The sign's post and the arm it hangs from, with a brace. 12x19. */
const signPost: PixelSprite = {
  id: 'wm14-opener-sign-post',
  name: 'wm14-opener-sign-post',
  tags: ['scene', 'wm14'],
  palette: WM_INKS,
  rows: [
    'UC..........',
    'UCDDDDDDDDDD',
    'UCD.........',
    'UC.D........',
    ...Array.from({ length: 14 }, () => 'UC..........'),
    'OO..........',
  ],
};

/** The father holding up the cottage's key in his raised right hand. 9x13. */
const parentWithKey: PixelSprite = {
  id: 'wm14-opener-parent-key',
  name: 'wm14-opener-parent-key',
  tags: ['scene', 'wm14'],
  palette: WM_INKS,
  rows: [
    '..kkk..yG',
    '.kkkkk.Gg',
    '.kCCCk.g.',
    '.CkCkU.C.',
    '..CCU..b.',
    '.bwRwbb..',
    'bBBRBbb..',
    'BBBRBbb..',
    'CBBBBb...',
    '.bBBbb...',
    '.kk.kk...',
    '.kk.kk...',
    '.KK.KK...',
  ],
};

const base = wmCompose('wm14-opener-base', wmBands(80, [['K', 40], ['h', 20]]), [
  { sprite: skyDots, x: 0, y: 0 },
  { sprite: moon, x: 8, y: 5 },
  { sprite: trees, x: 0, y: 30 },
  { sprite: chimney, x: POT_X - 1, y: POT_Y },
  { sprite: roof, x: WALL_X - 3, y: WALL_Y - 13 },
  { sprite: walls, x: WALL_X, y: WALL_Y },
  { sprite: wmCottageWindow, x: WALL_X + 4, y: WALL_Y + 3 },
  { sprite: wmCottageWindow, x: WALL_X + 25, y: WALL_Y + 3 },
  { sprite: door, x: WALL_X + 13, y: WALL_Y + 4 },
  { sprite: lantern, x: WALL_X + 19, y: WALL_Y + 5 },
  { sprite: path, x: WALL_X + 13, y: 47 },
  { sprite: fence('wm14-opener-fence-left', 21), x: 30, y: 45 },
  { sprite: fence('wm14-opener-fence-right', 22), x: 58, y: 45 },
  { sprite: { id: 'wm14-opener-lane', name: 'wm14-opener-lane', tags: ['scene', 'wm14'], rows: wmCobbles(80, 8) }, x: 0, y: 52 },
  { sprite: signPost, x: 21, y: 33 },
  { sprite: parentWithKey, x: 41, y: 45 },
]);

/** The letting sign: a green board edged in gold with a little gold house on it. 9x6. */
const BOARD = ['OgggggggO', 'gHHHyHHHg', 'gHHyGgHHg', 'gHyGGGgHg', 'gHHGOGHHg', 'OgggggggO'];

/** The sign on its two chains, swung `shift` pixels at the board. 11x8. */
function signAt(shift: number): string[] {
  const chain = (lean: number) => [...'.'.repeat(11)].map((ch, x) => (x === 2 + lean || x === 8 + lean ? 'D' : ch)).join('');
  return [chain(0), chain(shift), ...BOARD.map((row) => `${'.'.repeat(1 + shift)}${row}${'.'.repeat(1 - shift)}`)];
}

const sign: PixelSprite = {
  id: 'wm14-opener-sign',
  name: 'wm14-opener-sign',
  tags: ['scene', 'wm14'],
  palette: WM_INKS,
  rows: signAt(0),
  frames: [signAt(0), signAt(1), signAt(0), signAt(-1)],
  frameMs: 620,
};

/** A soft puff of chimney smoke. 4x3. */
const smoke: PixelSprite = {
  id: 'wm14-opener-smoke',
  name: 'wm14-opener-smoke',
  tags: ['scene', 'wm14'],
  rows: ['.kk.', 'kDDk', '.kk.'],
};

export const wm14Opener: SceneArt = {
  id: 'wm14-opener',
  label: 'A stone cottage on a moonlit lane puffs gold coins from its chimney like smoke, its windows lit, as the father who owns it holds up the key by the garden gate beneath a swinging sign.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: smoke, x: POT_X - 1, y: POT_Y - 4, motion: { kind: 'rise', amp: 6, periodMs: 4200, phase: 0.5 } },
    { sprite: wmCoinMote, x: POT_X, y: POT_Y - 3, motion: { kind: 'rise', amp: 8, periodMs: 2700, phase: 0 } },
    { sprite: wmCoinMote, x: POT_X + 2, y: POT_Y - 2, motion: { kind: 'rise', amp: 9, periodMs: 2700, phase: 0.33 } },
    { sprite: wmCoinMote, x: POT_X - 1, y: POT_Y - 2, motion: { kind: 'rise', amp: 7, periodMs: 2700, phase: 0.66 } },
    { sprite: wmCottageGlow, x: WALL_X + 5, y: WALL_Y + 4, motion: { kind: 'twinkle', periodMs: 4200, min: 0.4 } },
    { sprite: wmCottageGlow, x: WALL_X + 26, y: WALL_Y + 4, motion: { kind: 'twinkle', periodMs: 4800, phase: 0.5, min: 0.4 } },
    { sprite: wmLampFlame, x: WALL_X + 20, y: WALL_Y + 6 },
    { sprite: sign, x: 23, y: 35 },
    { sprite: wmFirefly, x: 12, y: 44, motion: { kind: 'rise', amp: 5, periodMs: 3000, phase: 0.2 } },
    { sprite: wmStar, x: 30, y: 7, motion: { kind: 'twinkle', periodMs: 2400, min: 0.3 } },
    { sprite: wmStarDot, x: 66, y: 4, motion: { kind: 'twinkle', periodMs: 1900, phase: 0.6, min: 0.2 } },
  ],
};

/** A house with a chimney, a lit window and a door: property. */
const emblemHouse: PixelSprite = {
  id: 'wm14-emblem-house',
  name: 'wm14-emblem-house',
  tags: ['scene', 'wm14'],
  rows: [
    '......yG..yg..',
    '.....yGGg.Gg..',
    '....yGGGGgGg..',
    '...yGGGGGGgg..',
    '..yGGGGGGGGgg.',
    '.yGGGGGGGGGGgg',
    'gggggggggggggO',
    '.yGGGGGGGGGGg.',
    '.yGwwGGGOOGGg.',
    '.yGwwGGGOOGGg.',
    '.yGGGGGGOOGGg.',
    '.yGGGGGGOOGGg.',
    '.OOOOOOOOOOOO.',
  ],
};

export const wm14Finish: SceneArt = wmKeepsake(
  'wm14-finish',
  emblemHouse,
  'A green crest with a gold rim bearing a house with a chimney and a lit window, framed by laurel over a purple banner, with sparkles around it.',
);

export const art: LessonArtSet = { opener: wm14Opener, backdrop: wmBackdrop, finish: wm14Finish };
