/**
 * Risk Management lesson 10 opener, the capstone: for the first time the keeper is outside, up on the
 * gallery at the top of the lit lighthouse, the CRO with the whole harbour in view. The lens burns
 * behind the glass and its beam sweeps out over the sea; the keeper has the brass spyglass on the
 * storm rolling in, with a ship riding the swell under it. Every risk of the first nine lessons is
 * out there at once, and this is the one place they are all watched from. Moving: the beam, the lens,
 * lightning, the ship, the swell, gulls, stars. The backdrop is the stormy capstone variant and the
 * keepsake ring is gold.
 */
import type { PixelSprite } from '../types';
import { RM_PALETTE, rmCompose, rmGull, rmLater, rmLightning, rmShip, rmSwell } from './rm-kit';
import { rmKeeperBrass, rmPortSwell, rmStar } from './rm-kit-a';
import {
  rmBackdropStorm,
  rmBeam,
  rmFill,
  rmGalleryRail,
  rmKeepsakeGold,
  rmLanternRoom,
  rmLensGlow,
  rmTower,
} from './rm-kit-b';
import type { LessonArtSet, SceneArt } from './types';

/** Night sky over the sea: a storm bank rolling in from the left, the far headland, the swell's streaks. */
const ground = rmFill(
  Array.from({ length: 60 }, (_, y) => (y < 31 ? 'v' : y === 31 ? 'u' : y < 38 ? 'V' : 'v').repeat(80)),
  [
    [0, 44, 0, 'K'],
    [0, 42, 1, 'K'], [43, 44, 1, 'k'],
    [0, 39, 2, 'K'], [40, 41, 2, 'k'],
    [0, 36, 3, 'K'], [37, 38, 3, 'k'],
    [0, 31, 4, 'K'], [32, 34, 4, 'k'],
    [0, 27, 5, 'K'], [28, 30, 5, 'k'],
    [0, 9, 6, 'k'], [10, 22, 6, 'K'], [23, 25, 6, 'k'],
    [0, 4, 7, 'k'], [12, 19, 7, 'k'],
    [0, 6, 29, 'k'],
    [0, 10, 30, 'k'],
    [2, 9, 32, 'U'], [14, 18, 33, 'u'], [36, 40, 33, 'u'],
    [2, 6, 35, 'u'], [24, 29, 35, 'u'],
    [10, 14, 37, 'u'], [40, 45, 37, 'u'],
    [2, 8, 45, 'u'], [20, 26, 45, 'u'],
    [8, 13, 48, 'u'],
    [1, 5, 55, 'u'], [10, 16, 57, 'u'], [3, 8, 59, 'U'], [19, 23, 58, 'U'],
  ],
);

const base = rmCompose('rm10-opener-base', ground, [
  [rmLanternRoom, 51, 0],
  [rmTower('rm10-opener-tower', 54, 5, 3, 3, true), 26, 55],
]);

export const rm10Opener: SceneArt = {
  id: 'rm10-opener',
  label: 'A lighthouse keeper in a yellow raincoat stands on the gallery at the top of a lit lighthouse, brass spyglass raised to a storm at sea, as its beam sweeps out over a ship below.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: rmStar, x: 45, y: 2, motion: { kind: 'twinkle', periodMs: 3600, min: 0.2 } },
    { sprite: rmStar, x: 48, y: 12, motion: { kind: 'twinkle', periodMs: 4400, min: 0.2, phase: 0.5 } },
    { sprite: rmStar, x: 78, y: 8, motion: { kind: 'twinkle', periodMs: 3900, min: 0.2, phase: 0.3 } },
    { sprite: rmGull, x: 38, y: 7, motion: { kind: 'drift', amp: 3, periodMs: 6400 } },
    { sprite: rmLater(rmGull, 'rm10-opener-gull-later', 2, 240), x: 18, y: 22, motion: { kind: 'drift', amp: 2, periodMs: 5200, phase: 0.5 } },
    { sprite: rmLightning, x: 3, y: 8 },
    { sprite: rmShip, x: 6, y: 34, motion: { kind: 'bob', amp: 1, periodMs: 2400 } },
    { sprite: rmSwell, x: 0, y: 41, motion: { kind: 'drift', amp: 2, periodMs: 3800 } },
    { sprite: rmPortSwell, x: 8, y: 56, motion: { kind: 'drift', amp: 1, periodMs: 3200, phase: 0.4 } },
    { sprite: rmBeam('rm10-opener-beam', 36, 0.5), x: 15, y: 0, motion: { kind: 'twinkle', periodMs: 3200, min: 0.25 } },
    { sprite: rmLensGlow, x: 61, y: 24, motion: { kind: 'twinkle', periodMs: 1800, min: 0.3 } },
    { sprite: rmKeeperBrass, x: 28, y: 22 },
    { sprite: rmGalleryRail(62), x: 18, y: 39 },
  ],
};

/** Lesson 10's emblem: the lit lighthouse on its rock, the beam shining out both ways. 15x16. */
const emblemLighthouse: PixelSprite = {
  id: 'rm10-emblem-lighthouse',
  name: 'lighthouse',
  tags: ['rm', 'emblem', 'lesson 10'],
  palette: RM_PALETTE,
  rows: [
    '.......O.......',
    '......1R1......',
    '.....1RRr1.....',
    'yyy..DyWyD..yyy',
    'wwwwyDWWWDywwww',
    'yyy..DyWyD..yyy',
    '....DDDDDDD....',
    '.....DsRrD.....',
    '.....DsRrD.....',
    '.....DWwxD.....',
    '....DWwwxxD....',
    '....DsRRrrD....',
    '....DsRRrrD....',
    '...DWwwwwxxD...',
    '..uuDDDDDDDuu..',
    '...uUuuuuuUu...',
  ],
};

export const rm10Finish: SceneArt = rmKeepsakeGold(
  'rm10-finish',
  'A gold and white life ring hanging from a rope, with a lit lighthouse at its center, its beam shining out both ways.',
  emblemLighthouse,
);

export const art: LessonArtSet = { opener: rm10Opener, backdrop: rmBackdropStorm, finish: rm10Finish };
