/**
 * Global Economics lesson 16: economic sanctions and geopolitics, on the bay at night.
 *
 * Lesson 10's bay after dark, and closed: a heavy chain hangs across the whole bay between two iron
 * gate posts with a big brass padlock locked on its lowest link, red lights blink on both posts and
 * on both breakwaters, and a cargo ship waits out beyond the harbor mouth that will not open for
 * it. Sanctions shut a country out of trade and freeze what it holds, and frost is settling on the
 * lock. Only small layers move: the four red lights, the frost glinting on the padlock and the stars.
 *
 * The keepsake's emblem is the padlock on its chain, frost glinting on it.
 */
import type { PixelSprite } from '../types';
import { geBackdrop } from './ge-backdrop';
import { GE_PALETTE, geBeacon, geCompose, geLater, geShipFar, geSparkle, geStar, geStarBig, geTint } from './ge-kit';
import { GE_BAY_LIGHTS, GE_BAY_NIGHT, GE_BAY_TOWERS, geBayTower, geGroundBay } from './ge-kit-b';
import { geKeepsake } from './ge1-finish';
import type { LessonArtSet, SceneArt } from './types';

/* ── one-off props ──────────────────────────────────────────────────────────────────────────── */

/** The chain, 78x27: two iron gate posts, the chain sagging across the bay between them and the padlock on its lowest link. */
const chain: PixelSprite = {
  id: 'ge16-opener-chain',
  name: 'chain and padlock',
  tags: ['ge16', 'prop'],
  blurb: 'A heavy chain sagging between two tall iron posts, a big brass padlock locked on its lowest link.',
  palette: GE_PALETTE,
  rows: [
    '..D........................................................................D..',
    '.DXD......................................................................DXD.',
    '.xXDxx....................................................................xXD.',
    '.xXDX.xx..............................................................xxxxxXD.',
    '.xXDDD..x..........................................................xxx.XDDxXD.',
    '.xXD..DDXxxxxxx................................................xx..X..DD..xXD.',
    '.xXD....DDDX...x............................................xxx.XxxDDD....xXD.',
    '.xXD.......DDDDXxxxxxxx................................xxx..X..DDDD.......xXD.',
    '.xXD...........DDDX...X..xxxxx......DDDDDD......xxx..xx..XxxDDD...........xXD.',
    '.xXD..............DDDDDxxX...X..xxxDxXXXXxDx..xx..XxxX.DDDDD..............xXD.',
    '.xXD...................DDDDDDDxxX..DxDxXDXDXxxX.DDDDDDD...................xXD.',
    '.xXD..........................DDDDDDxDDDDXDDDDDD..........................xXD.',
    '.xXD...............................DxD..DXD...............................xXD.',
    '.xXD.............................OOOOOOOOOOOO.............................xXD.',
    '.xXD.............................OyGGGGGGGGgO.............................xXD.',
    '.xXD.............................OyGGGGGGGGgO.............................xXD.',
    '.xXD.............................OyGGGKKGGGgO.............................xXD.',
    '.xXD.............................OyGGGKKGGGgO.............................xXD.',
    '.xXD.............................OyGGGGKGGGgO.............................xXD.',
    '.xXD.............................OgggggggggOO.............................xXD.',
    '.xXD.............................OOOOOOOOOOOO.............................xXD.',
    '.xXD......................................................................xXD.',
    '.xXD......................................................................xXD.',
    '.xXD......................................................................xXD.',
    '.xXD......................................................................xXD.',
    'DDDDD....................................................................DDDDD',
    'kkkkk....................................................................kkkkk',
  ],
};

/** A crescent moon, 5x5. */
const moon: PixelSprite = {
  id: 'ge16-opener-moon',
  name: 'moon',
  tags: ['ge16', 'prop'],
  blurb: 'A pale crescent moon.',
  palette: GE_PALETTE,
  rows: [
    '.zz..',
    'zz...',
    'z....',
    'zz...',
    '.zz..',
  ],
};

/** A gate post's red lamp, 2x2, lit for two beats and dim for one. */
const postLamp: PixelSprite = {
  id: 'ge16-opener-post-lamp',
  name: 'red lamp',
  tags: ['ge16', 'animated'],
  blurb: 'A small red warning lamp blinking.',
  palette: GE_PALETTE,
  rows: [
    'sR',
    'Rr',
  ],
  frames: [
    [
      'sR',
      'Rr',
    ],
    [
      'sR',
      'Rr',
    ],
    [
      'r1',
      '11',
    ],
  ],
  frameMs: 500,
};

/** geSparkle in ice: pale blue and white, frost catching the light. */
const frost = geTint(geSparkle, 'ge16-opener-frost', { m: 'B', N: 'B', W: 'z', w: 'z' });

/* ── the opener ─────────────────────────────────────────────────────────────────────────────── */

const night = geTint(geGroundBay, 'ge16-opener-bay', GE_BAY_NIGHT);
const tower = geTint(geBayTower, 'ge16-opener-tower', GE_BAY_NIGHT);
const CHAIN = { x: 1, y: 29 };
/** The waiting ship sits in the harbor mouth, its waterline on the horizon; the breakwater lights are stamped back over its ends. */
const SHIP = { x: 29, y: 21 };

const base = geCompose('ge16-opener-base', night, [
  { sprite: geShipFar, x: SHIP.x, y: SHIP.y },
  ...GE_BAY_TOWERS.map((t) => ({ sprite: tower, x: t.x, y: t.y })),
  { sprite: chain, x: CHAIN.x, y: CHAIN.y },
  { sprite: moon, x: 66, y: 4 },
]);

const postLampLater = geLater(postLamp, 'ge16-opener-post-lamp-later', 1, 500);
const beaconLater = geLater(geBeacon, 'ge16-opener-beacon-later', 1, 900);
const frostLater = geLater(frost, 'ge16-opener-frost-later', 2, 400);

export const ge16Opener: SceneArt = {
  id: 'ge16-opener',
  label: 'At night a heavy chain hangs across a harbor between two iron posts with blinking red lights, a big brass padlock locked on it, while a cargo ship waits outside the closed harbor mouth.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: postLamp, x: CHAIN.x + 1, y: CHAIN.y - 2 },
    { sprite: postLampLater, x: CHAIN.x + 74, y: CHAIN.y - 2 },
    { sprite: geBeacon, x: GE_BAY_LIGHTS[0].x, y: GE_BAY_LIGHTS[0].y },
    { sprite: beaconLater, x: GE_BAY_LIGHTS[1].x, y: GE_BAY_LIGHTS[1].y },
    { sprite: frost, x: 31, y: 42, motion: { kind: 'twinkle', periodMs: 2200, min: 0.4 } },
    { sprite: frostLater, x: 44, y: 46, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.5, min: 0.4 } },
    { sprite: geStarBig, x: 20, y: 3, motion: { kind: 'twinkle', periodMs: 2400, min: 0.3 } },
    { sprite: geStar, x: 6, y: 8, motion: { kind: 'twinkle', periodMs: 1900, phase: 0.4, min: 0.2 } },
    { sprite: geStar, x: 40, y: 2, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.7, min: 0.2 } },
    { sprite: geStar, x: 54, y: 7, motion: { kind: 'twinkle', periodMs: 2100, phase: 0.2, min: 0.25 } },
    { sprite: geStar, x: 76, y: 2, motion: { kind: 'twinkle', periodMs: 1700, phase: 0.55, min: 0.2 } },
  ],
};

/* ── the keepsake ───────────────────────────────────────────────────────────────────────────── */

/** Sanctions: a brass padlock locked on a chain, frost glinting on one side and then the other. */
const emblemPadlock: PixelSprite = {
  id: 'ge16-emblem-padlock',
  name: 'emblem padlock',
  tags: ['ge', 'emblem', 'animated'],
  blurb: 'A brass padlock locked on a steel chain, frost glinting at its sides.',
  palette: GE_PALETTE,
  rows: [
    '................',
    '................',
    '................',
    'x.............x.',
    'XXx...DDDD..x..X',
    'D..XxDxXXxD.XXD.',
    '..D.XDxXXXDXD...',
    '....DDx.DXD.....',
    '...OOOOOOOOOO...',
    '...OyGGGGGGgO...',
    '...OyGGKKGGgO...',
    '...OyGGKKGGgO...',
    '...OyGGGKGGgO...',
    '...OgggggggOO...',
    '...OOOOOOOOOO...',
    '................',
  ],
  frames: [
    [
      '................',
      '................',
      '................',
      'x.............x.',
      'XXx...DDDD..x..X',
      'D..XxDxXXxD.XXD.',
      '..D.XDxXXXDXD...',
      '....DDx.DXD.....',
      '...OOOOOOOOOO...',
      '...OyGGGGGGgO...',
      '...OyGGKKGGgO...',
      '...OyGGKKGGgO...',
      '...OyGGGKGGgO...',
      '...OgggggggOO...',
      '...OOOOOOOOOO...',
      '................',
    ],
    [
      '................',
      '................',
      '................',
      'x.............x.',
      'XXx...DDDD..x..X',
      'D..XxDxXXxD.XXD.',
      '..D.XDxXXXDXD...',
      '....DDx.DXD.....',
      '...OOOOOOOOOO...',
      '..zOyGGGGGGgO...',
      '.B.ByGGKKGGgO...',
      '..BOyGGKKGGgO...',
      '...OyGGGKGGgO...',
      '...OgggggggOO...',
      '...OOOOOOOOOO...',
      '................',
    ],
    [
      '................',
      '................',
      '................',
      'x.............x.',
      'XXx...DDDD..x..X',
      'D..XxDxXXxD.XXD.',
      '..D.XDxXXXDXD...',
      '....DDx.DXD.....',
      '...OOOOOOOOOO...',
      '...OyGGGGGGgO...',
      '...OyGGKKGGgO...',
      '...OyGGKKGGgO...',
      '...OyGGGKGGgO...',
      '...OgggggggOO...',
      '...OOOOOOOOOO...',
      '................',
    ],
    [
      '................',
      '................',
      '................',
      'x.............x.',
      'XXx...DDDD..x..X',
      'D..XxDxXXxD.XXD.',
      '..D.XDxXXXDXD...',
      '....DDx.DXD.....',
      '...OOOOOOOOOO...',
      '...OyGGGGGGgO...',
      '...OyGGKKGGgO...',
      '...OyGGKKGGgO...',
      '...OyGGGKGGgO.z.',
      '...OgggggggOOB.B',
      '...OOOOOOOOOO.B.',
      '................',
    ],
  ],
  frameMs: 600,
};

export const ge16Finish: SceneArt = geKeepsake(
  'ge16-finish',
  'A postage stamp with perforated edges and an emerald frame, showing a brass padlock locked on a steel chain with frost glinting on it, with small sparkles around it.',
  emblemPadlock,
);

export const art: LessonArtSet = { opener: ge16Opener, backdrop: geBackdrop, finish: ge16Finish };
