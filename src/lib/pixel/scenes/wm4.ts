/**
 * Wealth Management lesson 4 (estate planning and trusts): its opener, the pathway backdrop and
 * its keepsake, as one set loaded on demand.
 *
 * The opener is the house's strongroom by candlelight: dressed stone, a round steel vault door
 * with a gold wheel, the kit's safe on the floor, and a table holding the trust deed (the kit's
 * scroll, sealed in red wax) between two candles. In front of the vault the grandmother passes a
 * gold key to her grandchild: a trust hands the estate on directly, without the probate queue a
 * will alone would face. What moves: the key travels from her hand to the child's and glints, the
 * vault's wheel turns, the candles flicker, the wax seal catches the light, dust drifts up. The
 * keepsake carries the kit's key.
 */
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';
import { wmBackdrop } from './wm-backdrop';
import { wmChild, wmCompose, wmElder, wmEmblemKey, wmLater, wmScroll, wmVault, WM_INKS } from './wm-kit';
import { wmCandle, wmCandleFlame } from './wm-kit-a';
import { wmKeepsake } from './wm1-finish';

/** The vault door's top-left in the scene; its wheel is centred from it. */
const VAULT_X = 24;
const VAULT_Y = 8;
const VAULT = 26;

/** Dressed stone: courses of blocks 16 wide, lit along their tops, staggered by half a block. 80x48. */
const wall = Array.from({ length: 48 }, (_, y) => {
  if (y % 6 === 5) return 'K'.repeat(80);
  const shift = Math.floor(y / 6) % 2 === 0 ? 0 : 8;
  const face = y % 6 === 0 ? 'D' : 'k';
  return Array.from({ length: 80 }, (_, x) => ((x + shift) % 16 === 15 ? 'K' : face)).join('');
});

/** Flagstones, two courses. 80x12. */
const floor = Array.from({ length: 12 }, (_, j) => {
  if (j === 0 || j === 5) return 'K'.repeat(80);
  const shift = j < 5 ? 0 : 10;
  return Array.from({ length: 80 }, (_, x) => ((x + shift) % 20 === 0 ? 'K' : 'D')).join('');
});

/** Eight bolts round the door's rim. */
const BOLTS = Array.from({ length: 8 }, (_, k) => {
  const a = (k * Math.PI) / 4;
  return [Math.round(12.5 + 9.3 * Math.cos(a)), Math.round(12.5 + 9.3 * Math.sin(a))] as const;
});

/** One pixel of the vault door: a frame ring, a seam, the face with its bolts, a ring round the wheel. */
function vaultInk(i: number, j: number): string {
  const dx = i - 12.5;
  const dy = j - 12.5;
  const d = Math.hypot(dx, dy);
  /** Negative toward the upper left, where the light is. */
  const light = dx + dy;
  if (d > 13) return '.';
  if (d > 11.2) {
    if (light < -6) return 'x';
    return light > 6 ? 'K' : 'D';
  }
  if (d > 10.2) return 'K';
  if (BOLTS.some(([bx, by]) => bx === i && by === j)) return 'w';
  if (d > 4.5 && d < 5.5) return 'D';
  if (light < -8) return 'x';
  return light > 8 ? 'D' : 'X';
}

/** A round steel vault door. 26x26. */
const vaultDoor: PixelSprite = {
  id: 'wm4-opener-vault-door',
  name: 'wm4-opener-vault-door',
  tags: ['scene', 'wm4'],
  rows: Array.from({ length: VAULT }, (_, j) => Array.from({ length: VAULT }, (_, i) => vaultInk(i, j)).join('')),
};

/** An oak table for the deed and the candles. 22x12. */
const table: PixelSprite = {
  id: 'wm4-opener-table',
  name: 'wm4-opener-table',
  tags: ['scene', 'wm4'],
  palette: WM_INKS,
  rows: [
    `${'C'.repeat(21)}U`,
    `${'U'.repeat(21)}O`,
    `.O${'O'.repeat(18)}K.`,
    `.${'K'.repeat(20)}.`,
    ...Array.from({ length: 8 }, () => `.UO${'.'.repeat(16)}UO.`),
  ],
};

const base = wmCompose('wm4-opener-base', [...wall, ...floor], [
  { sprite: vaultDoor, x: VAULT_X, y: VAULT_Y },
  { sprite: wmVault, x: 8, y: 44 },
  { sprite: table, x: 52, y: 44 },
  { sprite: wmScroll, x: 57, y: 35 },
  { sprite: wmCandle, x: 53, y: 38 },
  { sprite: wmCandle, x: 69, y: 38 },
  { sprite: wmElder, x: 30, y: 44 },
  { sprite: wmChild, x: 39, y: 47 },
]);

/** The vault's wheel, its spokes turning an eighth at a time. 9x9. */
const wheel: PixelSprite = {
  id: 'wm4-opener-wheel',
  name: 'wm4-opener-wheel',
  tags: ['scene', 'wm4'],
  rows: [
    '..yGGGg..',
    '.y..G..g.',
    'y...G...g',
    'G...G...g',
    'GGGGyGGGg',
    'G...g...g',
    'g...g...O',
    '.g..g..O.',
    '..gggOO..',
  ],
  frames: [
    [
      '..yGGGg..',
      '.y..G..g.',
      'y...G...g',
      'G...G...g',
      'GGGGyGGGg',
      'G...g...g',
      'g...g...O',
      '.g..g..O.',
      '..gggOO..',
    ],
    [
      '..yGGGg..',
      '.y.....g.',
      'y.G...G.g',
      'G..G.G..g',
      'G...y...g',
      'G..G.g..g',
      'g.G...g.O',
      '.g.....O.',
      '..gggOO..',
    ],
  ],
  frameMs: 650,
};

/** The key, bow toward the child, teeth trailing. 6x3. */
const KEY = ['...yGg', 'GGGG.g', 'gg.gGO'];
const KEY_W = 10;
const KEY_H = 4;
function keyAt(dx: number, dy: number, glint = false): string[] {
  const rows = Array.from({ length: KEY_H }, () => [...'.'.repeat(KEY_W)]);
  KEY.forEach((row, j) => [...row].forEach((ch, i) => {
    if (ch !== '.') rows[dy + j][dx + i] = ch;
  }));
  if (glint) rows[dy][dx + 4] = 'W';
  return rows.map((row) => row.join(''));
}

/** The key passing from the grandmother's hand to the child's, a glint as it lands, a rest. 10x4. */
const keyHandoff: PixelSprite = {
  id: 'wm4-opener-key-handoff',
  name: 'wm4-opener-key-handoff',
  tags: ['scene', 'wm4'],
  blurb: 'The gold key passing from the grandmother to her grandchild.',
  rows: keyAt(2, 0),
  frames: [keyAt(0, 1), keyAt(0, 1), keyAt(1, 0), keyAt(2, 0), keyAt(3, 0), keyAt(4, 1), keyAt(4, 1, true), keyAt(4, 1), keyAt(4, 1)],
  frameMs: 380,
};

/** The wax seal catching the candlelight. */
const sealGlint: PixelSprite = {
  id: 'wm4-opener-seal-glint',
  name: 'wm4-opener-seal-glint',
  tags: ['scene', 'wm4'],
  rows: ['s'],
};

/** A mote of dust in the candlelight. */
const mote: PixelSprite = {
  id: 'wm4-opener-mote',
  name: 'wm4-opener-mote',
  tags: ['scene', 'wm4'],
  rows: ['x'],
};

export const wm4Opener: SceneArt = {
  id: 'wm4-opener',
  label: 'In a candlelit strongroom a grandmother hands a gold key to her grandchild before a round vault door, while a sealed trust deed lies on the table.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: keyHandoff, x: 32, y: 49 },
    { sprite: wheel, x: VAULT_X + 8, y: VAULT_Y + 8 },
    { sprite: wmCandleFlame, x: 54, y: 35 },
    { sprite: wmLater(wmCandleFlame, 'wm4-opener-flame-later', 2, 310), x: 70, y: 35 },
    { sprite: sealGlint, x: 65, y: 41, motion: { kind: 'twinkle', periodMs: 2600, min: 0.3 } },
    { sprite: mote, x: 60, y: 31, motion: { kind: 'rise', amp: 6, periodMs: 4200, phase: 0.2 } },
    { sprite: mote, x: 48, y: 37, motion: { kind: 'rise', amp: 5, periodMs: 3600, phase: 0.7 } },
  ],
};

export const wm4Finish: SceneArt = wmKeepsake(
  'wm4-finish',
  wmEmblemKey,
  'A green crest with a gold rim bearing a key, framed by laurel over a purple banner, with sparkles around it.',
);

export const art: LessonArtSet = { opener: wm4Opener, backdrop: wmBackdrop, finish: wm4Finish };
