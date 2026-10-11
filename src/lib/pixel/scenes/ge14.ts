/**
 * Global Economics lesson 14: central banks around the world, in the city plaza at night.
 *
 * Three central banks stand side by side on the plaza, each flying its own country's flag, with a
 * different coin in each pediment, and their coins pass back and forth between them: every central
 * bank sets its own rate, and money moves to wherever it is paid more, so no bank's decision stays at
 * home. Lesson 3 met one bank at dusk; this is the world's banks at night. Only small layers move: the
 * three flags, the silver and copper coins crossing between the banks, the lamps and the stars.
 *
 * The keepsake's emblem is a bank with the world turning in its pediment.
 */
import type { PixelSprite } from '../types';
import { geBackdrop } from './ge-backdrop';
import { GE_PALETTE, geBank, geCoinSmall, geCompose, geFlag, geLater, geStar, geStarBig, geTint } from './ge-kit';
import { GE_PLAZA_LAMPS, geFlagRed, geGroundPlaza, geLampGlow } from './ge-kit-a';
import { geFlagGold } from './ge-kit-b';
import { geKeepsake } from './ge1-finish';
import type { LessonArtSet, SceneArt } from './types';

/* ── one-off props ──────────────────────────────────────────────────────────────────────────── */

/** The plaza after dark: every band of the dusk sky a step deeper, the skyline black against it. */
const night = geTint(geGroundPlaza, 'ge14-opener-plaza', { k: 'K', '0': 'k', '6': '0', E: '6', I: '6', '2': 'E', '3': 'E' });

/** A crescent moon, 5x5. */
const moon: PixelSprite = {
  id: 'ge14-opener-moon',
  name: 'moon',
  tags: ['ge14', 'prop'],
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

/** geBank minted in other metals: silver and copper coins in the pediment instead of gold. */
const silverBank = geTint(geBank, 'ge14-opener-bank-silver', { G: 'z', y: 'z', g: 'X' });
const copperBank = geTint(geBank, 'ge14-opener-bank-copper', { G: '3', y: '4', g: '2' });

/* ── the opener ─────────────────────────────────────────────────────────────────────────────── */

/** The three banks' left edges; each stands with its bottom row on the plaza's row 33. */
const BANKS = [4, 30, 56] as const;
const BANK_Y = 19;
/** A flag's pole foot sits on its bank's apex, nine pixels in from the bank's left edge. */
const flagAt = (bankX: number) => ({ x: bankX + 9, y: BANK_Y - 10 });

const base = geCompose('ge14-opener-base', night, [
  { sprite: silverBank, x: BANKS[0], y: BANK_Y },
  { sprite: geBank, x: BANKS[1], y: BANK_Y },
  { sprite: copperBank, x: BANKS[2], y: BANK_Y },
  { sprite: moon, x: 70, y: 3 },
]);

const flagRedLater = geLater(geFlagRed, 'ge14-opener-flag-red-later', 1, 340);
const flagGoldLater = geLater(geFlagGold, 'ge14-opener-flag-gold-later', 2, 360);
/** The money crossing between the banks is each country's own: a silver coin one way, a copper one the other. */
const silverCoin = geTint(geCoinSmall, 'ge14-opener-coin-silver', { O: 'D', y: 'z', G: 'x', g: 'X', W: 'z' });
const copperCoin = geLater(geTint(geCoinSmall, 'ge14-opener-coin-copper-tint', { O: '1', y: '4', G: '3', g: '2', W: '5' }), 'ge14-opener-coin-copper', 2, 300);

export const ge14Opener: SceneArt = {
  id: 'ge14-opener',
  label: 'At night on a city plaza, three central banks stand side by side, each flying its own country\'s flag, while silver and copper coins pass back and forth between them.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: flagRedLater, ...flagAt(BANKS[0]) },
    { sprite: geFlag, ...flagAt(BANKS[1]) },
    { sprite: flagGoldLater, ...flagAt(BANKS[2]) },
    { sprite: silverCoin, x: 25, y: 20, motion: { kind: 'drift', amp: 5, periodMs: 3400 } },
    { sprite: copperCoin, x: 50, y: 20, motion: { kind: 'drift', amp: 5, periodMs: 3800, phase: 0.5 } },
    { sprite: geLampGlow, x: GE_PLAZA_LAMPS[0].x, y: GE_PLAZA_LAMPS[0].y, motion: { kind: 'twinkle', periodMs: 2600, min: 0.45 } },
    { sprite: geLampGlow, x: GE_PLAZA_LAMPS[1].x, y: GE_PLAZA_LAMPS[1].y, motion: { kind: 'twinkle', periodMs: 3100, phase: 0.5, min: 0.45 } },
    { sprite: geStarBig, x: 30, y: 2, motion: { kind: 'twinkle', periodMs: 2400, min: 0.3 } },
    { sprite: geStar, x: 8, y: 4, motion: { kind: 'twinkle', periodMs: 1900, phase: 0.4, min: 0.2 } },
    { sprite: geStar, x: 48, y: 6, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.7, min: 0.2 } },
    { sprite: geStar, x: 60, y: 2, motion: { kind: 'twinkle', periodMs: 2100, phase: 0.2, min: 0.25 } },
    { sprite: geStar, x: 18, y: 1, motion: { kind: 'twinkle', periodMs: 1700, phase: 0.55, min: 0.2 } },
  ],
};

/* ── the keepsake ───────────────────────────────────────────────────────────────────────────── */

/** Central banks the world over: a columned bank with a small globe turning where its coin would be. */
const emblemWorldBank: PixelSprite = {
  id: 'ge14-emblem-world-bank',
  name: 'emblem world bank',
  tags: ['ge', 'emblem', 'animated'],
  blurb: 'A columned bank with a small blue and green globe turning in its pediment.',
  palette: GE_PALETTE,
  rows: [
    '.......OO.......',
    '......OxxO......',
    '.....OxxxxO.....',
    '....OxbBbxxO....',
    '...OxbNNBbxxO...',
    '..OxxbNBBbxxxO..',
    '.OxxxbBBNbxxxxO.',
    'OxxxxxbbbxxxxxxO',
    'OOOOOOOOOOOOOOOO',
    'OXXXXXXXXXXXXXXO',
    'OOOOOOOOOOOOOOOO',
    '.OwxO.OwxO.OwxO.',
    '.OwxO.OwxO.OwxO.',
    '.OwxO.OwxO.OwxO.',
    'OOOOOOOOOOOOOOOO',
    'OXXXXXXXXXXXXXXO',
  ],
  frames: [
    [
      '.......OO.......',
      '......OxxO......',
      '.....OxxxxO.....',
      '....OxbBbxxO....',
      '...OxbNNBbxxO...',
      '..OxxbNBBbxxxO..',
      '.OxxxbBBNbxxxxO.',
      'OxxxxxbbbxxxxxxO',
      'OOOOOOOOOOOOOOOO',
      'OXXXXXXXXXXXXXXO',
      'OOOOOOOOOOOOOOOO',
      '.OwxO.OwxO.OwxO.',
      '.OwxO.OwxO.OwxO.',
      '.OwxO.OwxO.OwxO.',
      'OOOOOOOOOOOOOOOO',
      'OXXXXXXXXXXXXXXO',
    ],
    [
      '.......OO.......',
      '......OxxO......',
      '.....OxxxxO.....',
      '....OxbBbxxO....',
      '...OxbBNNbxxO...',
      '..OxxbBNBbxxxO..',
      '.OxxxbNBBbxxxxO.',
      'OxxxxxbbbxxxxxxO',
      'OOOOOOOOOOOOOOOO',
      'OXXXXXXXXXXXXXXO',
      'OOOOOOOOOOOOOOOO',
      '.OwxO.OwxO.OwxO.',
      '.OwxO.OwxO.OwxO.',
      '.OwxO.OwxO.OwxO.',
      'OOOOOOOOOOOOOOOO',
      'OXXXXXXXXXXXXXXO',
    ],
    [
      '.......OO.......',
      '......OxxO......',
      '.....OxxxxO.....',
      '....OxbBbxxO....',
      '...OxbBBNbxxO...',
      '..OxxbBBNbxxxO..',
      '.OxxxbNNBbxxxxO.',
      'OxxxxxbbbxxxxxxO',
      'OOOOOOOOOOOOOOOO',
      'OXXXXXXXXXXXXXXO',
      'OOOOOOOOOOOOOOOO',
      '.OwxO.OwxO.OwxO.',
      '.OwxO.OwxO.OwxO.',
      '.OwxO.OwxO.OwxO.',
      'OOOOOOOOOOOOOOOO',
      'OXXXXXXXXXXXXXXO',
    ],
    [
      '.......OO.......',
      '......OxxO......',
      '.....OxxxxO.....',
      '....OxbBbxxO....',
      '...OxbNBBbxxO...',
      '..OxxbBBNbxxxO..',
      '.OxxxbBNNbxxxxO.',
      'OxxxxxbbbxxxxxxO',
      'OOOOOOOOOOOOOOOO',
      'OXXXXXXXXXXXXXXO',
      'OOOOOOOOOOOOOOOO',
      '.OwxO.OwxO.OwxO.',
      '.OwxO.OwxO.OwxO.',
      '.OwxO.OwxO.OwxO.',
      'OOOOOOOOOOOOOOOO',
      'OXXXXXXXXXXXXXXO',
    ],
  ],
  frameMs: 500,
};

export const ge14Finish: SceneArt = geKeepsake(
  'ge14-finish',
  'A postage stamp with perforated edges and an emerald frame, showing a columned bank with a small globe turning in its pediment, with small sparkles around it.',
  emblemWorldBank,
);

export const art: LessonArtSet = { opener: ge14Opener, backdrop: geBackdrop, finish: ge14Finish };
