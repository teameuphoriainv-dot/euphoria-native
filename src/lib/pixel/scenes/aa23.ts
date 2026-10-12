/**
 * Applied Accounting lesson 23, Accounting Information Systems: one transaction entered once, and
 * every ledger it touches updated at the same time.
 *
 * The counting house wired up, under a plate reading ERP. On the left a mainframe cabinet turns its
 * tape reels over a panel of lights; in the middle the bookkeeper types at a desk, the terminal
 * beside them showing the general ledger, GL; on the right a cabinet of modules, one labelled drawer
 * each for GL, AP, AR, PAY and INV. A cable runs from the terminal along the wall to the modules.
 * Moving: the reels turn and the lights blink, the bookkeeper types, the cursor flashes, a pulse runs
 * along the cable and the modules' lamps light one after another, top to bottom.
 */
import type { PixelSprite } from '../types';
import { AA_AT, AA_PALETTE, aaBlink, aaBookkeeper, aaCompose, aaDesk, aaPlaque, aaText } from './aa-kit';
import { aaFloor } from './aa-kit-a';
import { aaPaint } from './aa-kit-c';
import { aaKeepsake } from './aa1-finish';
import { aaBackdrop } from './aa-backdrop';
import type { LessonArtSet, SceneArt } from './types';

const sprite = (id: string, rows: string[], palette?: Record<string, string>): PixelSprite =>
  ({ id, name: id, tags: ['aa', 'aa23'], rows, ...(palette ? { palette } : {}) });

/* ── the mainframe ──────────────────────────────────────────────────────────────────────────── */

/** A steel cabinet, 18 x 46: two tape windows, a panel of lights, a vent, lit down its left edge. */
const LIGHTS: [number, number, string][] = [[3, 15, 'n'], [7, 15, 'r'], [11, 15, 'g'], [3, 17, 'g'], [7, 17, 'n'], [11, 17, 'n'], [3, 19, 'r'], [7, 19, 'g'], [11, 19, 'n']];
const mainframe = aaPaint('aa23-mainframe', 18, 46, (x, y) => {
  if (y >= 44) return 'K';
  if (y === 0 || x === 0) return 'X';
  if (x === 17) return 'k';
  const window = y >= 3 && y <= 11 && ((x >= 2 && x <= 8) || (x >= 10 && x <= 16));
  if (window) return 'K';
  if (y >= 14 && y <= 20 && x >= 2 && x <= 15) {
    const light = LIGHTS.find(([lx, ly]) => y === ly && (x === lx || x === lx + 1));
    return light ? light[2] : 'K';
  }
  if (y >= 24 && y <= 40 && x >= 3 && x <= 14 && y % 2 === 0) return 'K';
  return 'D';
}, AA_PALETTE);

/** A tape reel, 7 x 7, turned `turn` radians: a grey flange with three windows onto the tape. */
const reelRows = (turn: number) => Array.from({ length: 7 }, (_, y) => Array.from({ length: 7 }, (_, x) => {
  const dx = x - 3;
  const dy = y - 3;
  const d = Math.hypot(dx, dy);
  if (d > 3.5) return '.';
  if (d < 0.8) return 'D';
  if (d > 2.7) return 'c';
  return Math.cos(3 * (Math.atan2(dy, dx) - turn)) > 0.4 ? 'k' : 'c';
}).join(''));
const reel = (id: string, from: number): PixelSprite => ({
  ...sprite(id, reelRows(0), AA_PALETTE),
  frames: [0, 1, 2].map((k) => reelRows(((k + from) * Math.PI) / 4.5)),
  frameMs: 300,
});

/* ── the desk ───────────────────────────────────────────────────────────────────────────────── */

/** aaDesk cut down to 40 wide: both pedestals, a narrow kneehole. */
const desk = sprite('aa23-desk', aaDesk.rows.map((r) => r.slice(0, 20) + r.slice(52)), AA_PALETTE);

/** The terminal, 17 x 15: a grey case, a dark screen, a neck and a foot on the desk. */
const terminal = sprite('aa23-terminal', [
  '.aaaaaaaaaaaaaaa.',
  'acccccccccccccccX',
  'acDDDDDDDDDDDDDcX',
  ...Array.from({ length: 6 }, () => 'acDKKKKKKKKKKKDcX'),
  'acDDDDDDDDDDDDDcX',
  'acccccccccccccccX',
  '.XXXXXXXXXXXXXXX.',
  '.......ccX.......',
  '.......ccX.......',
  '....XXXXXXXXX....',
], AA_PALETTE);

const keyboard = sprite('aa23-keyboard', ['DDDDDDDDDDDDDDDD', 'DcXcXcXcXcXcXcXD', 'DDDDDDDDDDDDDDDD'], AA_PALETTE);

/** Both hands on the keys, one down while the other lifts: the bookkeeper typing. */
const HAND = ['PPp', 'PPp', 'SSM', 'SMM'];
const hands = (leftDown: boolean) => Array.from({ length: 5 }, (_, y) => {
  const side = (down: boolean) => (down ? ['...', ...HAND][y] : [...HAND, '...'][y]);
  return `${side(leftDown)}${'.'.repeat(11)}${side(!leftDown)}`;
});
const typing: PixelSprite = {
  ...sprite('aa23-typing', hands(true), AA_PALETTE),
  frames: [hands(true), hands(false)],
  frameMs: 300,
};

/* ── the modules ────────────────────────────────────────────────────────────────────────────── */

const MODULES = ['GL', 'AP', 'AR', 'PAY', 'INV'];
/** A cabinet of modules, 18 x 44: a drawer each, a lamp at its left, a white card naming it. */
const cards = MODULES.map((m, i) => aaText(`aa23-card-${String(i)}`, m, 'K').rows);
const rack = aaPaint('aa23-rack', 18, 44, (x, y) => {
  if (y >= 42) return 'K';
  if (y < 2) return y === 0 ? 'X' : 'D';
  const i = Math.floor((y - 2) / 8);
  const r = (y - 2) % 8;
  if (x === 0 || x === 17) return 'D';
  if (r === 0) return 'K';
  if (x === 1) return 'X';
  if (x === 16) return 'k';
  if (x >= 2 && x <= 3) return r >= 3 && r <= 4 ? 'n' : 'D';
  if (x === 4) return 'D';
  if (r === 7) return 'D';
  if (r === 6) return 'c';
  const t = cards[i];
  const ox = 5 + Math.floor((11 - t[0].length) / 2);
  const g = t[r - 1]?.[x - ox];
  return g && g !== '.' ? 'K' : 'a';
}, AA_PALETTE);

/** The cable from the terminal up the wall and along to the modules. */
const CABLE_Y = 16;
const cable = aaPaint('aa23-cable', 24, 11, (x, y) => (y === 0 || x === 0 ? 'D' : '.'));
const link = sprite('aa23-link', ['DD']);

const KEEPER = { x: 40, y: 19 };
const TERMINAL = { x: 21, y: 26 };
const RACK = { x: 61, y: 13 };

const base = aaCompose('aa23-opener-base', 80, 60, 'k', [
  { sprite: aaFloor('aa23-floor', 80, [[1, 18], [20, 59], [61, 78]]), x: 0, y: 49 },
  { sprite: aaPlaque('aa23-opener-plate', 'ERP'), x: 32, y: 1 },
  { sprite: cable, x: TERMINAL.x + 16, y: CABLE_Y },
  { sprite: mainframe, x: 1, y: 11 },
  { sprite: link, x: 19, y: 34 },
  { sprite: rack, ...RACK },
  { sprite: aaBookkeeper, ...KEEPER },
  { sprite: desk, x: 20, y: 38 },
  { sprite: terminal, ...TERMINAL },
  { sprite: aaText('aa23-screen', 'GL', 'N'), x: TERMINAL.x + 4, y: TERMINAL.y + 3 },
  { sprite: keyboard, x: KEEPER.x + 1, y: 41 },
]);

/** A green dot on the cable, the pulse of one transaction. */
const pulse = sprite('aa23-pulse', ['mm']);
const lit = (ch: string) => sprite(`aa23-light-${ch}`, [ch === 'n' ? 'NN' : ch === 'r' ? 'RR' : 'yy']);
const lamp = sprite('aa23-lamp', ['mm', 'NN'], AA_PALETTE);
const cursor = sprite('aa23-cursor', ['m', 'm'], AA_PALETTE);
const reelLeft = reel('aa23-reel-left', 0);
const reelRight = reel('aa23-reel-right', 1);

export const aa23Opener: SceneArt = {
  id: 'aa23-opener',
  label: 'The bookkeeper types at a terminal showing GL, wired between a mainframe with turning tape reels and a cabinet of modules labelled GL, AP, AR, PAY and INV, whose lamps light one after another, under a brass plate reading ERP.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: reelLeft, x: 3, y: 15 },
    { sprite: reelRight, x: 11, y: 15 },
    { sprite: lit('n'), x: 8, y: 28, motion: { kind: 'twinkle', periodMs: 1300, min: 0 } },
    { sprite: lit('r'), x: 4, y: 30, motion: { kind: 'twinkle', periodMs: 1700, phase: 0.4, min: 0 } },
    { sprite: lit('g'), x: 12, y: 26, motion: { kind: 'twinkle', periodMs: 1100, phase: 0.7, min: 0 } },
    { sprite: typing, x: KEEPER.x, y: 37 },
    { sprite: aaBlink, x: KEEPER.x + AA_AT.blinkOnBookkeeper.x, y: KEEPER.y + AA_AT.blinkOnBookkeeper.y },
    { sprite: cursor, x: TERMINAL.x + 12, y: TERMINAL.y + 6, motion: { kind: 'twinkle', periodMs: 900, min: 0 } },
    ...[0, 1, 2].map((k) => ({
      sprite: pulse,
      x: TERMINAL.x + 22 + k * 7,
      y: CABLE_Y,
      motion: { kind: 'twinkle' as const, periodMs: 2400, phase: k * 0.12, min: 0 },
    })),
    ...MODULES.map((_, i) => ({
      sprite: lamp,
      x: RACK.x + 2,
      y: RACK.y + 2 + i * 8 + 3,
      motion: { kind: 'twinkle' as const, periodMs: 2400, phase: 0.42 + i * 0.1, min: 0 },
    })),
  ],
};

/** Lesson 23 emblem: a gilt terminal, white lines of entries on its dark screen and the cursor. */
const emblemTerminal = sprite('aa-emblem-terminal', [
  '................',
  '.OOOOOOOOOOOOOO.',
  '.OyyyyyyyyyyyGO.',
  '.OyKKKKKKKKKKgO.',
  '.OyKaaaKaaKKKgO.',
  '.OyKKKKKKKKKKgO.',
  '.OyKaaKaaaaKKgO.',
  '.OyKKKKKKKKKKgO.',
  '.OyKaKKKKKKKKgO.',
  '.OyKKKKKKKKKKgO.',
  '.OGgggggggggggO.',
  '.OOOOOOOOOOOOOO.',
  '......OyGO......',
  '......OGgO......',
  '.OyGGGGGGGGGGgO.',
  '.OOOOOOOOOOOOOO.',
], AA_PALETTE);

export const aa23Finish = aaKeepsake(
  'aa23-finish',
  'A purple leather ledger with gold corners and a red ribbon bookmark, its cover stamped with a gold computer terminal showing white lines of entries, with small glints and check marks around it.',
  emblemTerminal,
);

export const art: LessonArtSet = { opener: aa23Opener, backdrop: aaBackdrop, finish: aa23Finish };
