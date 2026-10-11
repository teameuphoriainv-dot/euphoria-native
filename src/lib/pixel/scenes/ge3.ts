/**
 * Global Economics lesson 3: the Federal Reserve and monetary policy, in the city plaza at dusk.
 *
 * The central bank stands on the plaza steps with the student at their foot, looking up at it. A
 * hawk and a dove circle over it, the two moods of a rate decision, coins rise from its doors as
 * money goes out into the economy, and a board on the plaza shows the rate going up and down. Only
 * small layers move: the two birds, the coins, the board's arrow, the lamps and the first stars.
 *
 * The keepsake's emblem is the policy rate: a percent sign with an arrow up and an arrow down.
 */
import type { PixelSprite } from '../types';
import { geBackdrop } from './ge-backdrop';
import { GE_PALETTE, geCoinSmall, geCompose, geLater, geStar, geStarBig } from './ge-kit';
import {
  GE_PLAZA_LAMPS,
  GE_PLAZA_STAGE,
  geBankGrand,
  geGroundPlaza,
  geLampGlow,
  geShadow,
  geStudentBack,
} from './ge-kit-a';
import { geKeepsake } from './ge1-finish';
import type { LessonArtSet, SceneArt } from './types';

/* ── one-off props ──────────────────────────────────────────────────────────────────────────── */

/** A hawk seen from below, 11x6, wings up and then level: the hawkish mood, rates up to cool prices. */
const hawk: PixelSprite = {
  id: 'ge3-opener-hawk',
  name: 'hawk',
  tags: ['ge3', 'animated'],
  blurb: 'A brown hawk with a gold beak, beating its wings.',
  palette: GE_PALETTE,
  rows: [
    'U.........U',
    'CU.......UC',
    '.CU.MMM.UC.',
    '..CUUGUUC..',
    '....UHU....',
    '.....H.....',
  ],
  frames: [
    [
      'U.........U',
      'CU.......UC',
      '.CU.MMM.UC.',
      '..CUUGUUC..',
      '....UHU....',
      '.....H.....',
    ],
    [
      '...........',
      '....MMM....',
      'UCCCUGUCCCU',
      '.UU.UUU.UU.',
      '....UHU....',
      '.....H.....',
    ],
  ],
  frameMs: 520,
};

/** A dove seen from below, 11x6, an olive leaf in its beak: the dovish mood, rates down to help jobs. */
const dove: PixelSprite = {
  id: 'ge3-opener-dove',
  name: 'dove',
  tags: ['ge3', 'animated'],
  blurb: 'A white dove with an olive leaf, beating its wings.',
  palette: GE_PALETTE,
  rows: [
    'x.........x',
    'zx.......xz',
    '.zx.zzz.xz.',
    '..zxxnxxz..',
    '....xzx....',
    '.....x.....',
  ],
  frames: [
    [
      'x.........x',
      'zx.......xz',
      '.zx.zzz.xz.',
      '..zxxnxxz..',
      '....xzx....',
      '.....x.....',
    ],
    [
      '...........',
      '....zzz....',
      'xzzzxnxzzzx',
      '.xx.xxx.xx.',
      '....xzx....',
      '.....x.....',
    ],
  ],
  frameMs: 600,
};

/** The rate board on its stand, 13x16: a percent sign, and room at (7, 2) for the arrow. */
const rateBoard: PixelSprite = {
  id: 'ge3-opener-board',
  name: 'rate board',
  tags: ['ge3', 'prop'],
  blurb: 'A dark board on a stand with a gold percent sign.',
  palette: GE_PALETTE,
  rows: [
    'XXXXXXXXXXXXX',
    'XKKKKKKKKKKKX',
    'XKGGKKGKKKKKX',
    'XKGGKGKKKKKKX',
    'XKKKGKKKKKKKX',
    'XKKGKGGKKKKKX',
    'XKGKKGGKKKKKX',
    'XKKKKKKKKKKKX',
    'XXXXXXXXXXXXX',
    '..X.......X..',
    '..X.......X..',
    '..XXXXXXXXX..',
    '..X.......X..',
    '..X.......X..',
    '..X.......X..',
    '.kXk.....kXk.',
  ],
};

/** The board's arrow, 5x5: up in green, then down in red. */
const rateArrow: PixelSprite = {
  id: 'ge3-opener-arrow',
  name: 'rate arrow',
  tags: ['ge3', 'animated'],
  blurb: 'An arrow that points up in green, then down in red.',
  palette: GE_PALETTE,
  rows: [
    '..m..',
    '.mNm.',
    'mNNNm',
    '..N..',
    '..N..',
  ],
  frames: [
    [
      '..m..',
      '.mNm.',
      'mNNNm',
      '..N..',
      '..N..',
    ],
    [
      '..R..',
      '..R..',
      'sRRRs',
      '.sRs.',
      '..s..',
    ],
  ],
  frameMs: 1400,
};

/* ── the opener ─────────────────────────────────────────────────────────────────────────────── */

/** Where the student stands, at the foot of the steps. */
const STUDENT = { x: 30, y: 35 };
const BOARD = { x: 61, y: 40 };

const base = geCompose('ge3-opener-base', geGroundPlaza, [
  { sprite: geBankGrand, x: GE_PLAZA_STAGE.x, y: GE_PLAZA_STAGE.bottom + 1 - geBankGrand.rows.length },
  { sprite: rateBoard, x: BOARD.x, y: BOARD.y },
  { sprite: geShadow, x: STUDENT.x + 7, y: STUDENT.y + 24 },
  { sprite: geStudentBack, x: STUDENT.x, y: STUDENT.y },
]);

const coinLater = geLater(geCoinSmall, 'ge3-opener-coin-later', 2, 300);

export const ge3Opener: SceneArt = {
  id: 'ge3-opener',
  label: 'At dusk a student looks up at a columned central bank while a hawk and a dove circle above it, coins rise from its doors and a board beside it shows the interest rate going up and down.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: hawk, x: 9, y: 9, motion: { kind: 'drift', amp: 4, periodMs: 6400 } },
    { sprite: dove, x: 60, y: 8, motion: { kind: 'drift', amp: 4, periodMs: 7200, phase: 0.5 } },
    { sprite: geCoinSmall, x: 31, y: 24, motion: { kind: 'rise', amp: 9, periodMs: 3000 } },
    { sprite: coinLater, x: 44, y: 26, motion: { kind: 'rise', amp: 9, periodMs: 3400, phase: 0.45 } },
    { sprite: rateArrow, x: BOARD.x + 7, y: BOARD.y + 2 },
    { sprite: geLampGlow, x: GE_PLAZA_LAMPS[0].x, y: GE_PLAZA_LAMPS[0].y, motion: { kind: 'twinkle', periodMs: 2600, min: 0.45 } },
    { sprite: geLampGlow, x: GE_PLAZA_LAMPS[1].x, y: GE_PLAZA_LAMPS[1].y, motion: { kind: 'twinkle', periodMs: 3100, phase: 0.5, min: 0.45 } },
    { sprite: geStarBig, x: 21, y: 1, motion: { kind: 'twinkle', periodMs: 2400, min: 0.3 } },
    { sprite: geStar, x: 33, y: 4, motion: { kind: 'twinkle', periodMs: 1900, phase: 0.4, min: 0.2 } },
    { sprite: geStar, x: 50, y: 2, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.7, min: 0.2 } },
    { sprite: geStar, x: 77, y: 13, motion: { kind: 'twinkle', periodMs: 2100, phase: 0.2, min: 0.25 } },
  ],
};

/* ── the keepsake ───────────────────────────────────────────────────────────────────────────── */

/** The policy rate: a gold percent sign, its up arrow and down arrow lighting in turn. */
const emblemRate: PixelSprite = {
  id: 'ge3-emblem-rate',
  name: 'emblem policy rate',
  tags: ['ge', 'emblem', 'animated'],
  blurb: 'A gold percent sign with a green arrow up and a red arrow down beside it, lighting in turn.',
  palette: GE_PALETTE,
  rows: [
    '................',
    '............m...',
    '.OOO....O..mNm..',
    'OyyGO..OG.mNNNm.',
    'OyGgO.OGO...N...',
    '.OOO.OGO....N...',
    '....OGO.....n...',
    '...OGO..........',
    '..OGO.......1...',
    '.OGO.OOO....r...',
    'OGO.OyyGO...r...',
    'GO..OyGgO.1rrr1.',
    'O....OOO...1r1..',
    '............1...',
    '................',
    '................',
  ],
  frames: [
    [
      '................',
      '............m...',
      '.OOO....O..mNm..',
      'OyyGO..OG.mNNNm.',
      'OyGgO.OGO...N...',
      '.OOO.OGO....N...',
      '....OGO.....n...',
      '...OGO..........',
      '..OGO.......1...',
      '.OGO.OOO....r...',
      'OGO.OyyGO...r...',
      'GO..OyGgO.1rrr1.',
      'O....OOO...1r1..',
      '............1...',
      '................',
      '................',
    ],
    [
      '................',
      '............n...',
      '.OOO....O..nnn..',
      'OyyGO..OG.nnnnn.',
      'OyGgO.OGO...n...',
      '.OOO.OGO....n...',
      '....OGO.....J...',
      '...OGO..........',
      '..OGO.......R...',
      '.OGO.OOO....R...',
      'OGO.OyyGO...R...',
      'GO..OyGgO.sRRRs.',
      'O....OOO...sRs..',
      '............s...',
      '................',
      '................',
    ],
  ],
  frameMs: 900,
};

export const ge3Finish: SceneArt = geKeepsake(
  'ge3-finish',
  'A postage stamp with perforated edges and an emerald frame, showing a gold percent sign with a green arrow pointing up and a red arrow pointing down, with small sparkles around it.',
  emblemRate,
);

export const art: LessonArtSet = { opener: ge3Opener, backdrop: geBackdrop, finish: ge3Finish };
