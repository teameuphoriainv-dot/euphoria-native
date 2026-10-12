/**
 * Risk Management lesson 21 opener, Systemic Risk & Contagion: the storm is at the window and the
 * dominoes are going over. The first, the red one, the bank that failed, is already down; it took the
 * next with it, and that one the next, and the fourth is tipping now. The keeper has a hand on the
 * last two, the capital and the clearing house that stop a fall from becoming the whole row. Pinned up
 * beside him is the same thing as a network: one red node, and red running out along every line from
 * it. Moving: the tipping domino, lightning, rain on the glass, the ship and the swell.
 */
import type { PixelSprite } from '../types';
import { rmBackdrop } from './rm-backdrop';
import {
  RM_PALETTE,
  rmCompose,
  rmKeepsake,
  rmLightning,
  rmRain,
  rmShip,
  rmStormWindow,
  rmSwell,
  rmWatchRoom,
} from './rm-kit';
import { rmKeeperReach, rmPlot } from './rm-kit-a';
import type { RmPoint } from './rm-kit-a';
import { rmFill } from './rm-kit-b';
import { rmTurn } from './rm-kit-c';
import type { LessonArtSet, SceneArt } from './types';

/**
 * A domino standing on its end: two pips over the bar, four under it, the right edge and foot in
 * shade. Solid to its edges, with no outline, so it stays clean when rmTurn tips it over. 6x16.
 */
const DOMINO = [
  'wwwwwx',
  'wwwwwx',
  'wKwwwx',
  'wwwwwx',
  'wwwwwx',
  'wwwKwx',
  'wwwwwx',
  'XXXXXX',
  'wwwwwx',
  'wKwKwx',
  'wwwwwx',
  'wwwwwx',
  'wwwwwx',
  'wKwKwx',
  'wwwwwx',
  'xxxxxx',
];

/** A domino in red with white pips: the bank that failed first. */
const reddened = (rows: readonly string[]) =>
  rows.map((row) => [...row].map((ch) => ({ w: 'R', W: 'R', x: 'r', X: 'r', K: 'w' })[ch] ?? ch).join(''));

/** Where each domino's right edge stands, left to right; every one stands on the floor at y 53. */
const EDGES = [8, 18, 28, 38, 48, 58];

/**
 * The fourth domino leaning `top` pixels over at its top, its foot still: a shear rather than a turn,
 * which keeps a small tilt crisp where rotation would break up its edges. 9x17.
 */
const lean = (top: number) =>
  rmPlot(9, 17, DOMINO.flatMap((row, r) => [...row].map((ch, c): RmPoint => [c + Math.round((top * (15 - r)) / 15), r + 1, ch])));

/** The fourth domino teetering, a pixel over, two, one, back. Framed, 9x17 at its own corner. */
const tipping: PixelSprite = {
  id: 'rm21-opener-tipping',
  name: 'tipping domino',
  tags: ['scene', 'rm21'],
  rows: lean(0),
  frames: [lean(0), lean(1), lean(2), lean(1)],
  frameMs: 300,
};

/** The network pinned on the wall: one red node, red lines out to every bank tied to it. 17x13. */
const network: PixelSprite = {
  id: 'rm21-opener-network',
  name: 'contagion network',
  tags: ['scene', 'rm21'],
  rows: [
    '........R........',
    'xxxxxxxxxxxxxxxxx',
    'xXXwwwwwXwwwwwXXx',
    'xXXrwwwwrwwwwrXXx',
    'xwwwrrwwrwwrrwwwx',
    'xwwwwwrRRRrwwwwwx',
    'xXXrrrrRRRrrrrXXx',
    'xXXwwwrRRRrwwwXXx',
    'xwwwrrwwrwwrrwwwx',
    'xwwrwwwwrwwwwrwwx',
    'xXXwwwwwXwwwwwXXx',
    'xXXwwwwwwwwwwwXXx',
    'xxxxxxxxxxxxxxxxx',
  ],
};

/** Shadows along the floor under the row of dominoes and the keeper. */
const floorShadow: PixelSprite = {
  id: 'rm21-opener-floor-shadow',
  name: 'rm21-opener-floor-shadow',
  tags: ['scene', 'rm21'],
  palette: RM_PALETTE,
  rows: rmFill(['.'.repeat(72), '.'.repeat(72)], [[0, 69, 0, 'Z'], [52, 67, 1, 'Z']]),
};

/** The fallen and the standing dominoes, drawn in order so each rests against the next. */
const row: PixelSprite = {
  id: 'rm21-opener-dominoes',
  name: 'row of dominoes',
  tags: ['scene', 'rm21'],
  rows: rmPlot(80, 60, [
    ...rmTurn(reddened(DOMINO), EDGES[0], 53, 70),
    ...rmTurn(DOMINO, EDGES[1], 53, 50),
    ...rmTurn(DOMINO, EDGES[2], 53, 30),
    ...rmTurn(DOMINO, EDGES[4], 53, 0),
    ...rmTurn(DOMINO, EDGES[5], 53, 0),
  ]),
};

const base = rmCompose('rm21-opener-base', rmWatchRoom(80, 60, 50), [
  [rmStormWindow, 2, 6],
  [network, 61, 5],
  [floorShadow, 6, 53],
  [row, 0, 0],
  [rmKeeperReach, 58, 24],
]);

export const rm21Opener: SceneArt = {
  id: 'rm21-opener',
  label: 'In a storm, a row of dominoes topples across the watch room floor from a red one at the start, and the lighthouse keeper holds out a hand to stop the last ones falling.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: rmLightning, x: 24, y: 13 },
    { sprite: rmShip, x: 10, y: 12, motion: { kind: 'bob', amp: 1, periodMs: 1900 } },
    { sprite: rmSwell, x: 6, y: 26, motion: { kind: 'drift', amp: 2, periodMs: 3000 } },
    { sprite: rmSwell, x: 8, y: 29, motion: { kind: 'drift', amp: 2, periodMs: 3000, phase: 0.5 } },
    { sprite: rmRain, x: 4, y: 8 },
    { sprite: tipping, x: EDGES[3] - 6, y: 36 },
  ],
};

/** Lesson 21's emblem: a row of white dominoes, the red one at its head leaning into them. 15x11. */
const emblemDominoes: PixelSprite = {
  id: 'rm21-emblem-dominoes',
  name: 'falling dominoes',
  tags: ['rm', 'emblem', 'lesson 21'],
  rows: [
    '....WWx.WWx.WWx',
    '....WWx.WWx.WWx',
    '...RKWx.KWx.KWx',
    '...RWWx.WWx.WWx',
    '..RRWKx.WKx.WKx',
    '..rrxxx.xxx.xxx',
    '..RRWWx.WWx.WWx',
    '.wRrKWx.KWx.KWx',
    '.RRrWWx.WWx.WWx',
    'Rwr.WKx.WKx.WKx',
    'rrr.xxx.xxx.xxx',
  ],
};

export const rm21Finish: SceneArt = rmKeepsake(
  'rm21-finish',
  'A red and white life ring hanging from a rope, with a row of white dominoes at its center and a red one leaning into them.',
  emblemDominoes,
);

export const art: LessonArtSet = { opener: rm21Opener, backdrop: rmBackdrop, finish: rm21Finish };
