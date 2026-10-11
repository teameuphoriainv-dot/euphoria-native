/**
 * Risk Management lesson 9 opener, Regulatory Frameworks & Basel III: a calm night, and the keeper
 * has his brass spyglass on the harbour wall. It is built in courses like the Basel III capital
 * stack: a deep grey footing of common equity, then the conservation buffer, the countercyclical
 * buffer and the surcharge for the biggest banks on top. The open sea throws itself at it and the
 * harbour behind stays flat. Beside him, the strongbox of capital and its stacks. Moving: spray off
 * the wall, the swell beyond it, a boat in the harbour, coin glints, stars.
 */
import type { PixelSprite } from '../types';
import { rmBackdrop } from './rm-backdrop';
import { RM_PALETTE, rmCompose, rmKeepsake, rmSwell, rmWatchRoom } from './rm-kit';
import { rmGlint, rmKeeperBrass, rmStar } from './rm-kit-a';
import type { LessonArtSet, SceneArt } from './types';

/** A course of the wall, 50 wide: a lit row over `rows - 1` body rows of 5-wide blocks, joints offset by `phase`. */
function course(lit: string, body: string, joint: string, phase: number, rows: number): string[] {
  const row = (fill: string) => Array.from({ length: 50 }, (_, i) => ((i + phase) % 6 === 5 ? joint : fill)).join('');
  return [row(lit), ...Array.from({ length: rows - 1 }, () => row(body))];
}

/** One row of churning foam where the sea hits the wall. */
const FOAM = 'wUwwU'.repeat(10);

/**
 * The wide window over the harbour wall: night sky and moon, the open sea, foam at the wall's face,
 * the wall's four courses (orchid surcharge, blue countercyclical, teal conservation, grey CET1),
 * then the flat harbour, the frame and the sill. 54x32.
 */
const seawallWindow: PixelSprite = {
  id: 'rm9-opener-seawall-window',
  name: 'seawall window',
  tags: ['scene', 'rm9'],
  palette: RM_PALETTE,
  rows: [
    `...${'D'.repeat(48)}...`,
    `..DD${'v'.repeat(10)}x${'v'.repeat(35)}DD..`,
    ...[
      `${'v'.repeat(24)}w${'v'.repeat(13)}yyy${'v'.repeat(9)}`,
      `${'v'.repeat(5)}x${'v'.repeat(31)}yywyy${'v'.repeat(8)}`,
      `${'v'.repeat(37)}ywwwy${'v'.repeat(8)}`,
      `${'v'.repeat(15)}x${'v'.repeat(21)}yywyy${'v'.repeat(3)}x${'v'.repeat(4)}`,
      `${'v'.repeat(38)}yyy${'v'.repeat(9)}`,
      `kkk${'v'.repeat(27)}x${'v'.repeat(19)}`,
      `kkkkk${'v'.repeat(45)}`,
      `kkkkkkk${'u'.repeat(43)}`,
      `${'V'.repeat(38)}UxU${'V'.repeat(9)}`,
      `VVuu${'V'.repeat(10)}uuu${'V'.repeat(22)}U${'V'.repeat(6)}uuVV`,
      `${'v'.repeat(6)}uuu${'v'.repeat(14)}uu${'v'.repeat(13)}xUx${'v'.repeat(9)}`,
      `uuu${'v'.repeat(17)}uuuu${'v'.repeat(15)}U${'v'.repeat(10)}`,
      `${'v'.repeat(5)}uwUwu${'v'.repeat(10)}uwwwu${'v'.repeat(9)}uwUwu${'v'.repeat(5)}uwUwuv`,
      FOAM,
      ...course('q', 'P', 'p', 0, 2),
      ...course('B', 'b', 'u', 3, 2),
      ...course('T', 't', 'K', 0, 2),
      ...course('x', 'X', 'D', 3, 3),
      `${'v'.repeat(12)}uu${'v'.repeat(20)}uuu${'v'.repeat(13)}`,
      `vvvuu${'v'.repeat(30)}uu${'v'.repeat(13)}`,
      'v'.repeat(50),
    ].map((row) => `.D${row}D.`),
    `.${'D'.repeat(52)}.`,
    'x'.repeat(54),
    'D'.repeat(54),
    `.${'K'.repeat(52)}.`,
  ],
};

/** Spray thrown up off the wall; give it a `rise`. 5x3. */
const spray: PixelSprite = {
  id: 'rm9-opener-spray',
  name: 'spray',
  tags: ['scene', 'rm9'],
  palette: RM_PALETTE,
  rows: [
    '.w.w.',
    'wUwUw',
    '.U.U.',
  ],
};

/** A small boat moored in the harbour behind the wall, masthead lit. 7x6. */
const harbourBoat: PixelSprite = {
  id: 'rm9-opener-boat',
  name: 'harbour boat',
  tags: ['scene', 'rm9'],
  rows: [
    '...y...',
    '...D...',
    '..wDx..',
    '..wDx..',
    'DDDDDDD',
    '.kkkkk.',
  ],
};

/** The strongbox of capital: iron-bound, locked, heaped with gold. 18x12. */
const capitalChest: PixelSprite = {
  id: 'rm9-opener-chest',
  name: 'capital chest',
  tags: ['scene', 'rm9'],
  rows: [
    '....yG..Gy..yG....',
    '..yGGyGyGGyGyGGy..',
    '.yGyGGyGGyGGyGyGG.',
    'DDDDDDDDDDDDDDDDDD',
    'DGyGGGGGGGGGGGGGGD',
    'DOOOOOOOOOOOOOOOOD',
    'DOOOOOOOxxxOOOOOOD',
    'DOOOOOOOxKxOOOOOOD',
    'DKKKKKKKxxxKKKKKKD',
    'DOOOOOOOOOOOOOOOOD',
    'DGyGGGGGGGGGGGGGGD',
    'DDDDDDDDDDDDDDDDDD',
  ],
};

/** Three stacks of coins, each taller than the last: capital built up. 19x8. */
const coinStacks: PixelSprite = {
  id: 'rm9-opener-coin-stacks',
  name: 'coin stacks',
  tags: ['scene', 'rm9'],
  rows: [
    '..............OyyyO',
    '..............OGGGO',
    '.......OyyyO..OgggO',
    '.......OGGGO..OGGGO',
    'OyyyO..OgggO..OgggO',
    'OGGGO..OGGGO..OGGGO',
    'OgggO..OgggO..OgggO',
    'OGGGO..OGGGO..OGGGO',
  ],
};

/** Floor shadows under the chest, the stacks and the keeper. */
const floorShadow: PixelSprite = {
  id: 'rm9-opener-floor-shadow',
  name: 'rm9-opener-floor-shadow',
  tags: ['scene', 'rm9'],
  palette: RM_PALETTE,
  rows: [
    'ZZZZZZZZZZZZZZZZZZZ.ZZZZZZZZZZZZZZZZZZZZ................ZZZZZZZZZZZZZZZ',
    '.ZZZZZZZZZZZZZZZZZ...ZZZZZZZZZZZZZZZZZZ...................ZZZZZZZZZZZ..',
  ],
};

const base = rmCompose('rm9-opener-base', rmWatchRoom(80, 60, 50), [
  [seawallWindow, 2, 5],
  [floorShadow, 3, 52],
  [capitalChest, 3, 40],
  [coinStacks, 24, 44],
]);

export const rm9Opener: SceneArt = {
  id: 'rm9-opener',
  label: 'A lighthouse keeper with a brass spyglass watches a harbor wall built in colored layers hold back the sea on a calm night, beside a chest of gold coins and three growing coin stacks.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: rmStar, x: 14, y: 8, motion: { kind: 'twinkle', periodMs: 3800, min: 0.2 } },
    { sprite: rmStar, x: 33, y: 11, motion: { kind: 'twinkle', periodMs: 4600, min: 0.2, phase: 0.5 } },
    { sprite: rmSwell, x: 8, y: 16, motion: { kind: 'drift', amp: 2, periodMs: 4400 } },
    { sprite: spray, x: 9, y: 17, motion: { kind: 'rise', amp: 3, periodMs: 1800 } },
    { sprite: spray, x: 38, y: 17, motion: { kind: 'rise', amp: 3, periodMs: 2100, phase: 0.5 } },
    { sprite: harbourBoat, x: 30, y: 26, motion: { kind: 'bob', amp: 1, periodMs: 3600 } },
    { sprite: rmGlint, x: 9, y: 40, motion: { kind: 'twinkle', periodMs: 2000, min: 0.2 } },
    { sprite: rmGlint, x: 38, y: 43, motion: { kind: 'twinkle', periodMs: 2600, min: 0.2, phase: 0.5 } },
    { sprite: rmKeeperBrass, x: 58, y: 24 },
  ],
};

/** Lesson 9's emblem: the strongbox of capital, iron-bound and heaped with gold. 16x12. */
const emblemChest: PixelSprite = {
  id: 'rm9-emblem-chest',
  name: 'capital chest',
  tags: ['rm', 'emblem', 'lesson 9'],
  rows: [
    '....yG.yG.Gy....',
    '..yGGyGGyGGyGy..',
    '.yGyGGyGGyGGyGy.',
    'DDDDDDDDDDDDDDDD',
    'DGyGGGGGGGGGGGGD',
    'DOOOOOOOOOOOOOOD',
    'DOOOOOOxxOOOOOOD',
    'DOOOOOOKxOOOOOOD',
    'DKKKKKKxxKKKKKKD',
    'DOOOOOOOOOOOOOOD',
    'DGyGGGGGGGGGGGGD',
    '.DDDDDDDDDDDDDD.',
  ],
};

export const rm9Finish: SceneArt = rmKeepsake(
  'rm9-finish',
  'A red and white life ring hanging from a rope, with an iron-bound chest heaped with gold coins at its center.',
  emblemChest,
);

export const art: LessonArtSet = { opener: rm9Opener, backdrop: rmBackdrop, finish: rm9Finish };
