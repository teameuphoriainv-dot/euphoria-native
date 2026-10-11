/**
 * Global Economics lesson 12: income inequality and wealth distribution, in the city plaza at dusk.
 *
 * A stone statue of a balance stands on the plaza steps, and it does not balance: one pan sits low
 * under a mountain of gold coins while the other swings high holding a single coin, the wealth at
 * the top against everyone else's. Lesson 2's balance tipped and came level again; this one is cut
 * in stone, tipped for good. The student stands at the foot of the steps looking up at it. Only small
 * layers move: the lone coin's glint, sparkles on the mountain, the lamps and the first stars.
 *
 * The keepsake's emblem is the tipped balance in small.
 */
import type { PixelSprite } from '../types';
import { geBackdrop } from './ge-backdrop';
import { GE_PALETTE, geCoinSmall, geCompose, geLater, geSparkle, geStar, geStarBig } from './ge-kit';
import { GE_PLAZA_LAMPS, geGroundPlaza, geLampGlow, geShadow, geStudentBack } from './ge-kit-a';
import { geKeepsake } from './ge1-finish';
import type { LessonArtSet, SceneArt } from './types';

/* ── one-off props ──────────────────────────────────────────────────────────────────────────── */

/**
 * The statue, 63x31: a stone balance on a plinth on the top step, its beam tipped seven rows each way
 * from the hub, the low pan heaped with gold coins and the high pan bare for the lone coin.
 */
const statue: PixelSprite = {
  id: 'ge12-opener-statue',
  name: 'statue of a tipped balance',
  tags: ['ge12', 'prop'],
  blurb: 'A stone balance on a plinth, tipped hard, one pan heaped with gold coins and the other high and nearly empty.',
  palette: GE_PALETTE,
  rows: [
    '.....................................................DDD.......',
    '..................................................DDDxxD.......',
    '..............................................DDDDxxxDDD.......',
    '...........................................DDDxxxxDDDD.D.......',
    '..............................DD........DDDxxxDDDD..D...D......',
    '.............................DxXD...DDDDxxxDDD......D...D......',
    '.............................DDDDDDDxxxxDDD........D.....D.....',
    '............................DxxXXDxxDDDD..........D.......D....',
    '...........................DDxXXXDDD.............D.........D...',
    '.......................DDDDxxDDDD................D.........D...',
    '....................DDDxxxxDDDxXD...............D...........D..',
    '.................DDDxxxDDDD..DxXD..............D.............D.',
    '.............DDDDxxxDDD......DxXD.............DxxxxxxxxxxxxxxxD',
    '..........DDDxxxxDDD.........DxXD..............DXXXXXXXXXXXXXD.',
    '.......DDDxxxDDDD............DxXD................DDDDDDDDDDD...',
    '.......xDxDDD................DxXD..............................',
    '.......DDD...................DxXD..............................',
    '.......OOO...................DxXD..............................',
    '......OyGOD..................DxXD..............................',
    '.....OOOOOO..................DxXD..............................',
    '.....OyyGGgO.................DxXD..............................',
    '....OOOOOOOOO................DxXD..............................',
    '...OyyyGGGggOD...............DxXD..............................',
    '..OOOOOOOOOOOO...............DxXD..............................',
    '..OyyyyGGGGgggO..............DxXD..............................',
    '.OOOOOOOOOOOOOOO........xxxxxxxxxxxxxx.........................',
    'DxxxxxxxxxxxxxxxD........xXXXXXXXXXXD..........................',
    '.DXXXXXXXXXXXXXD.........xXXXXXXXXXXD..........................',
    '...DDDDDDDDDDD...........xXXXXXXXXXXD..........................',
    '.........................xXXXXXXXXXXD..........................',
    '.......................xxxxxxxxxxxxxxxx........................',
  ],
};

/* ── the opener ─────────────────────────────────────────────────────────────────────────────── */

const STATUE = { x: 10, y: 3 };
/** The high pan's rim is row 15 between x 56 and 72; the lone coin sits on it, centred under the beam's end. */
const LONE_COIN = { x: 62, y: 10 };
/** Where the student stands, at the foot of the steps under the high pan. */
const STUDENT = { x: 56, y: 35 };

const base = geCompose('ge12-opener-base', geGroundPlaza, [
  { sprite: statue, x: STATUE.x, y: STATUE.y },
  { sprite: geShadow, x: STUDENT.x + 7, y: STUDENT.y + 24 },
  { sprite: geStudentBack, x: STUDENT.x, y: STUDENT.y },
]);

const sparkleLater = geLater(geSparkle, 'ge12-opener-sparkle-later', 2, 380);
const sparkleLast = geLater(geSparkle, 'ge12-opener-sparkle-last', 1, 420);

export const ge12Opener: SceneArt = {
  id: 'ge12-opener',
  label: 'At dusk on a city plaza, a stone statue of a balance tips hard to one side under a mountain of gold coins while its other pan swings high holding a single coin, and a student looks up at it.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: geCoinSmall, x: LONE_COIN.x, y: LONE_COIN.y },
    { sprite: geSparkle, x: 12, y: 21, motion: { kind: 'twinkle', periodMs: 1800, min: 0.4 } },
    { sprite: sparkleLater, x: 20, y: 24, motion: { kind: 'twinkle', periodMs: 2200, phase: 0.5, min: 0.4 } },
    { sprite: sparkleLast, x: 16, y: 17, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.25, min: 0.4 } },
    { sprite: geLampGlow, x: GE_PLAZA_LAMPS[0].x, y: GE_PLAZA_LAMPS[0].y, motion: { kind: 'twinkle', periodMs: 2600, min: 0.45 } },
    { sprite: geLampGlow, x: GE_PLAZA_LAMPS[1].x, y: GE_PLAZA_LAMPS[1].y, motion: { kind: 'twinkle', periodMs: 3100, phase: 0.5, min: 0.45 } },
    { sprite: geStarBig, x: 30, y: 1, motion: { kind: 'twinkle', periodMs: 2400, min: 0.3 } },
    { sprite: geStar, x: 50, y: 5, motion: { kind: 'twinkle', periodMs: 1900, phase: 0.4, min: 0.2 } },
    { sprite: geStar, x: 6, y: 3, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.7, min: 0.2 } },
    { sprite: geStar, x: 77, y: 9, motion: { kind: 'twinkle', periodMs: 2100, phase: 0.2, min: 0.25 } },
  ],
};

/* ── the keepsake ───────────────────────────────────────────────────────────────────────────── */

/** Inequality: a balance tipped hard, a heap of coins in the low pan and one coin in the high one. */
const emblemTipped: PixelSprite = {
  id: 'ge12-emblem-tipped',
  name: 'emblem tipped balance',
  tags: ['ge', 'emblem', 'animated'],
  blurb: 'A balance tipped hard, a heap of gold coins in its low pan and a single coin in its high pan, both glinting.',
  palette: GE_PALETTE,
  rows: [
    '................',
    '................',
    '...............x',
    '.............xxD',
    '..........DDxDD.',
    '.........xxDDyOD',
    '........xDDxxxxx',
    '......xxD.xDDDD.',
    '....xxDD..xD....',
    '..xxDD....xD....',
    '.xDD......xD....',
    'ODGgO.....xD....',
    'OGGGOD....xD....',
    'xxxxxx....xD....',
    '.DDDD...xXXXX...',
    '.......DDDDDDD..',
  ],
  frames: [
    [
      '................',
      '................',
      '...............x',
      '.............xxD',
      '..........DDxDD.',
      '.........xxDDyOD',
      '........xDDxxxxx',
      '......xxD.xDDDD.',
      '....xxDD..xD....',
      '..xxDD....xD....',
      '.xDD......xD....',
      'ODGgO.....xD....',
      'OGGGOD....xD....',
      'xxxxxx....xD....',
      '.DDDD...xXXXX...',
      '.......DDDDDDD..',
    ],
    [
      '................',
      '................',
      '...............x',
      '.............xxD',
      '..........DDxDD.',
      '.........xxDDyOD',
      '........xDDxxxxx',
      '......xxD.xDDDD.',
      '....xxDD..xD....',
      '..xxDD....xD....',
      '.xDD......xD....',
      'ODGgO.....xD....',
      'OGGGOD....xD....',
      'xxxxxx....xD....',
      '.DDDD...xXXXX...',
      '.......DDDDDDD..',
    ],
    [
      '................',
      '................',
      '...............x',
      '.............xxD',
      '..........DDxDD.',
      '.........xxDDzOD',
      '........xDDxxxxx',
      '......xxD.xDDDD.',
      '....xxDD..xD....',
      '..xxDD....xD....',
      '.zDD......xD....',
      'ODGgO.....xD....',
      'OGGGOD....xD....',
      'xxxxxx....xD....',
      '.DDDD...xXXXX...',
      '.......DDDDDDD..',
    ],
  ],
  frameMs: 700,
};

export const ge12Finish: SceneArt = geKeepsake(
  'ge12-finish',
  'A postage stamp with perforated edges and an emerald frame, showing a balance tipped hard with a heap of gold coins in its low pan and one coin in its high pan, with small sparkles around it.',
  emblemTipped,
);

export const art: LessonArtSet = { opener: ge12Opener, backdrop: geBackdrop, finish: ge12Finish };
