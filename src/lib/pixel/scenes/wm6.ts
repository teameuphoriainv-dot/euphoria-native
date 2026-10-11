/**
 * Wealth Management lesson 6 (charitable giving and philanthropy): its opener, the pathway
 * backdrop and its keepsake, as one set loaded on demand.
 *
 * The opener is the village green at night. On the right stands the schoolhouse the family gives
 * to: stone walls, lamplit windows, a heart over the door, a bell in its tower. On the left the
 * child, the grandmother behind, holds a stock certificate up to a gift box marked with a heart:
 * the lesson's point is to give the appreciated shares themselves, not cash, so the gift arrives
 * whole and no gains tax is paid on the way. What moves: hearts rise from the box toward the
 * school, its windows glow, the bell swings, stars twinkle, a firefly rises. The keepsake carries
 * a heart.
 */
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';
import { wmBackdrop } from './wm-backdrop';
import { wmBands, wmCompose, wmElder, wmFirefly, wmStar, wmStarDot, WM_INKS } from './wm-kit';
import { wmTreeline } from './wm-kit-a';
import { wmKeepsake } from './wm1-finish';

/** The schoolhouse's top-left in the scene; its bell and windows are placed from it. */
const SCHOOL_X = 48;
const SCHOOL_Y = 12;

/** Fixed faint stars. */
const skyDots: PixelSprite = {
  id: 'wm6-opener-sky-dots',
  name: 'wm6-opener-sky-dots',
  tags: ['scene', 'wm6'],
  rows: [
    '................................................................................',
    '..........................D.....................................X...............',
    '..................................................X.............................',
    '...X..........................................................................D.',
    '......................................X.........................................',
    '................................................................................',
    '..........................D...............................................X.....',
    '................................................................................',
    '.................X..............................................................',
    '..............................................D.................................',
    '................................................................................',
    '.....D.....................................................................X....',
  ],
};

/** A half moon. 6x8. */
const moon: PixelSprite = {
  id: 'wm6-opener-moon',
  name: 'wm6-opener-moon',
  tags: ['scene', 'wm6'],
  rows: [
    '..xww.',
    '.xwww.',
    'xwwww.',
    'xwwww.',
    'xwwww.',
    'xwwww.',
    '.xwww.',
    '..xww.',
  ],
};

const trees = wmTreeline('wm6-opener-trees', 80, 10, [
  [40, 60, 3],
  [6, 7, 8],
  [19, 5, 6],
  [33, 6, 9],
  [44, 5, 5],
]);

/** The bell tower: a slate cap, an open arch for the bell, a stone base. 8x11. */
const belfry: PixelSprite = {
  id: 'wm6-opener-belfry',
  name: 'wm6-opener-belfry',
  tags: ['scene', 'wm6'],
  rows: [
    '...DD...',
    '..DkkD..',
    '.DkkkkD.',
    'DkkkkkkD',
    'XDDDDDDD',
    'xK....KD',
    'xK....KD',
    'xK....KD',
    'xKKKKKKD',
    'xXXXXXXD',
    'xXXXXXXD',
  ],
};

/** Half-widths of the slate roof, ridge to eaves. */
const ROOF_HALF = [3, 5, 7, 8, 10, 11, 13, 14];
const roof: PixelSprite = {
  id: 'wm6-opener-roof',
  name: 'wm6-opener-roof',
  tags: ['scene', 'wm6'],
  rows: [
    ...ROOF_HALF.map((half) =>
      Array.from({ length: 30 }, (_, x) => {
        if (x < 15 - half || x > 14 + half) return '.';
        return x === 15 - half || x === 14 + half ? 'D' : 'k';
      }).join(''),
    ),
    'D'.repeat(30),
  ],
};

/** The stone front: lit on the left edge, in shade on the right, a dark plinth. 26x14. */
const schoolWall: PixelSprite = {
  id: 'wm6-opener-school-wall',
  name: 'wm6-opener-school-wall',
  tags: ['scene', 'wm6'],
  rows: [...Array.from({ length: 13 }, () => `X${'D'.repeat(24)}K`), 'k'.repeat(26)],
};

/** An arched window, its panes dim until the glow layer lights them. 4x6. */
const schoolWindow: PixelSprite = {
  id: 'wm6-opener-school-window',
  name: 'wm6-opener-school-window',
  tags: ['scene', 'wm6'],
  rows: ['.KK.', 'KOOK', 'KOOK', 'KOOK', 'KOOK', 'XXXX'],
};

/** The school's door. 6x9. */
const schoolDoor: PixelSprite = {
  id: 'wm6-opener-school-door',
  name: 'wm6-opener-school-door',
  tags: ['scene', 'wm6'],
  palette: WM_INKS,
  rows: [
    '.OUUO.',
    'OUCCUO',
    'OCUUUO',
    'OCUUUO',
    'OCUUGO',
    'OCUUUO',
    'OCUUUO',
    'OCUUUO',
    'OOOOOO',
  ],
};

/** A pink heart, for the sign over the door and the box. 5x4. */
const heart: PixelSprite = {
  id: 'wm6-opener-heart',
  name: 'wm6-opener-heart',
  tags: ['scene', 'wm6'],
  rows: ['sF.Ff', 'FFFFf', '.FFf.', '..f..'],
};

/** The schoolhouse, composed. 30x34. */
const school = wmCompose('wm6-opener-school', wmBands(30, [['.', 34]]), [
  { sprite: belfry, x: 11, y: 0 },
  { sprite: roof, x: 0, y: 11 },
  { sprite: schoolWall, x: 2, y: 20 },
  { sprite: schoolWindow, x: 5, y: 23 },
  { sprite: schoolWindow, x: 21, y: 23 },
  { sprite: schoolDoor, x: 12, y: 25 },
  { sprite: heart, x: 12, y: 21 },
]);

/** Gravel from the school door down to us, widening, with a few lit stones. 26x14. */
const path: PixelSprite = {
  id: 'wm6-opener-path',
  name: 'wm6-opener-path',
  tags: ['scene', 'wm6'],
  rows: Array.from({ length: 14 }, (_, j) => {
    const half = 4 + j * 0.65;
    return Array.from({ length: 26 }, (_, x) => {
      if (Math.abs(x - 12.5) > half) return '.';
      return (x * 3 + j * 5) % 11 === 0 ? 'D' : 'k';
    }).join('');
  }),
};

/** The gift box on its stand: a slot in the lid, a heart on the front. 11x10. */
const giftBox: PixelSprite = {
  id: 'wm6-opener-gift-box',
  name: 'wm6-opener-gift-box',
  tags: ['scene', 'wm6'],
  palette: WM_INKS,
  rows: [
    'yCCKKKKCCCg',
    'OUUUUUUUUUO',
    'OUUsFUFfUUO',
    'OUUFFFFfUUO',
    'OUUUFFfUUUO',
    'OUUUUfUUUUO',
    'OOOOOOOOOOO',
    '.OUUUUUUUO.',
    '.O.......O.',
    '.K.......K.',
  ],
};

/** The heir in teal, one arm raised with a rolled share certificate, tied in gold. 7x10. */
const childGiving: PixelSprite = {
  id: 'wm6-opener-child-giving',
  name: 'wm6-opener-child-giving',
  tags: ['scene', 'wm6'],
  palette: WM_INKS,
  rows: [
    '.....yw',
    '.ggg.Gx',
    'gCCCgC.',
    'CkCkUT.',
    '.CCUT..',
    'tTTTt..',
    'CTTtU..',
    '.TTt...',
    '.k.k...',
    'KK.KK..',
  ],
};

const base = wmCompose('wm6-opener-base', wmBands(80, [['K', 44], ['h', 16]]), [
  { sprite: skyDots, x: 0, y: 0 },
  { sprite: moon, x: 8, y: 5 },
  { sprite: trees, x: 0, y: 34 },
  { sprite: school, x: SCHOOL_X, y: SCHOOL_Y },
  { sprite: path, x: 50, y: 46 },
  { sprite: wmElder, x: 11, y: 43 },
  { sprite: childGiving, x: 20, y: 45 },
  { sprite: giftBox, x: 27, y: 45 },
]);

/** The school bell, swinging in its arch. 6x4. */
const BELL = ['.yg.', 'yGGg', 'yGGg', 'gggO'];
const bellAt = (left: number) => BELL.map((row) => `${'.'.repeat(left)}${row}${'.'.repeat(2 - left)}`);
const bell: PixelSprite = {
  id: 'wm6-opener-bell',
  name: 'wm6-opener-bell',
  tags: ['scene', 'wm6'],
  rows: bellAt(1),
  frames: [bellAt(1), bellAt(2), bellAt(1), bellAt(0)],
  frameMs: 450,
};

/** Lamplight in a window's panes. */
const windowGlow: PixelSprite = {
  id: 'wm6-opener-window-glow',
  name: 'wm6-opener-window-glow',
  tags: ['scene', 'wm6'],
  rows: ['Gy', 'GG', 'Gg', 'gg'],
};

const smallHeart: PixelSprite = {
  id: 'wm6-opener-small-heart',
  name: 'wm6-opener-small-heart',
  tags: ['scene', 'wm6'],
  rows: ['F.F', 'FFf', '.f.'],
};

export const wm6Opener: SceneArt = {
  id: 'wm6-opener',
  label: 'A child holds up a share certificate at a heart-marked gift box as the grandmother watches, and hearts rise toward a lamplit schoolhouse with a bell tower.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: heart, x: 28, y: 40, motion: { kind: 'rise', amp: 14, periodMs: 3400, phase: 0 } },
    { sprite: smallHeart, x: 32, y: 39, motion: { kind: 'rise', amp: 12, periodMs: 3400, phase: 0.35 } },
    { sprite: heart, x: 30, y: 41, motion: { kind: 'rise', amp: 16, periodMs: 3400, phase: 0.7 } },
    { sprite: windowGlow, x: SCHOOL_X + 6, y: SCHOOL_Y + 24, motion: { kind: 'twinkle', periodMs: 4200, min: 0.4 } },
    { sprite: windowGlow, x: SCHOOL_X + 22, y: SCHOOL_Y + 24, motion: { kind: 'twinkle', periodMs: 4800, phase: 0.5, min: 0.4 } },
    { sprite: bell, x: SCHOOL_X + 12, y: SCHOOL_Y + 5 },
    { sprite: wmStar, x: 36, y: 4, motion: { kind: 'twinkle', periodMs: 2400, min: 0.3 } },
    { sprite: wmStarDot, x: 44, y: 11, motion: { kind: 'twinkle', periodMs: 1800, phase: 0.6, min: 0.2 } },
    { sprite: wmFirefly, x: 41, y: 41, motion: { kind: 'rise', amp: 5, periodMs: 2900, phase: 0.3 } },
  ],
};

/** A heart: giving. */
const emblemHeart: PixelSprite = {
  id: 'wm6-emblem-heart',
  name: 'wm6-emblem-heart',
  tags: ['scene', 'wm6'],
  rows: [
    '..yyGg..yGGg..',
    '.yywGGgyGGGgg.',
    'yywGGGGGGGGggg',
    'yyGGGGGGGGGggg',
    'yGGGGGGGGGGggg',
    'yGGGGGGGGGgggO',
    '.GGGGGGGGGggO.',
    '..GGGGGGGggO..',
    '...GGGGGggO...',
    '....GGGggO....',
    '.....GggO.....',
    '......gO......',
    '..............',
  ],
};

export const wm6Finish: SceneArt = wmKeepsake(
  'wm6-finish',
  emblemHeart,
  'A green crest with a gold rim bearing a heart, framed by laurel over a purple banner, with sparkles around it.',
);

export const art: LessonArtSet = { opener: wm6Opener, backdrop: wmBackdrop, finish: wm6Finish };
