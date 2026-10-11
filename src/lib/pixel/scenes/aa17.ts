/**
 * Applied Accounting lesson 17, Budgeting & Variance Analysis: the plan set beside what happened, and
 * every gap between them explained.
 *
 * A slate board in a gilt frame is the variance report: three pairs of bars on one baseline, revenue,
 * expenses and net profit, the budget drawn as a dashed outline and the actual filled in beside it.
 * Revenue came in over plan in gold, expenses a little over in red, and net profit over plan in green,
 * a green plus badge on it for a favourable variance. Under a plate reading BUDGET, a run of shelves
 * holds the year's ledgers, and on a side table the adding machine works the figures. Moving: the
 * crank turns, the tape prints to a red total, the plus badge pulses, the profit bar's rim glows, light
 * runs along the frame, dust rises.
 */
import type { PixelSprite } from '../types';
import { AA_PALETTE, aaBookcase, aaCompose, aaGlint, aaMote, aaPlaque, aaText } from './aa-kit';
import { AA_AT_A, aaAddingMachine, aaCrankTurn, aaFloor, aaFrame, aaTapePrint } from './aa-kit-a';
import { aaKeepsake } from './aa1-finish';
import { aaBackdrop } from './aa-backdrop';
import type { LessonArtSet, SceneArt } from './types';

const sprite = (id: string, rows: string[], palette?: Record<string, string>): PixelSprite =>
  ({ id, name: id, tags: ['aa', 'aa17'], rows, ...(palette ? { palette } : {}) });

/** The board, 52 x 30, and the three pairs on it: budget height, actual height, the actual's colours. */
const BOARD = { x: 2, y: 11, w: 52, h: 30 };
const BASE_Y = 33;
const PAIRS = [
  { cx: 12, word: 'REV', budget: 14, actual: 16, lit: 'y', fill: 'G' },
  { cx: 28, word: 'EXP', budget: 12, actual: 13, lit: 's', fill: 'R' },
  { cx: 44, word: 'NET', budget: 5, actual: 7, lit: 'm', fill: 'N' },
];

const bars = (() => {
  const W = BOARD.w - 4;
  const H = BOARD.h - 4;
  const ox = BOARD.x + 2;
  const oy = BOARD.y + 2;
  const cells: string[][] = Array.from({ length: H }, () => Array.from({ length: W }, () => '.'));
  const put = (x: number, y: number, ch: string) => {
    cells[y - oy][x - ox] = ch;
  };
  for (let x = ox + 1; x < ox + W - 1; x++) put(x, BASE_Y, 'c');
  for (const p of PAIRS) {
    for (let y = BASE_Y - p.budget; y < BASE_Y; y++) {
      for (let x = p.cx - 5; x <= p.cx - 1; x++) {
        const edge = y === BASE_Y - p.budget || x === p.cx - 5 || x === p.cx - 1;
        if (edge && (y === BASE_Y - p.budget ? x % 2 === 0 : y % 2 === 0)) put(x, y, 'c');
      }
      if (y >= BASE_Y - p.actual) for (let x = p.cx + 1; x <= p.cx + 5; x++) put(x, y, x === p.cx + 1 ? p.lit : p.fill);
    }
    for (let y = BASE_Y - p.actual; y < BASE_Y - p.budget; y++) for (let x = p.cx + 1; x <= p.cx + 5; x++) put(x, y, x === p.cx + 1 ? p.lit : p.fill);
    aaText(`aa17-word-${p.word}`, p.word, 'c').rows.forEach((r, dy) => [...r].forEach((ch, dx) => {
      if (ch !== '.') put(p.cx - 5 + dx, BASE_Y + 1 + dy, ch);
    }));
  }
  return aaCompose('aa17-board', BOARD.w, BOARD.h, '.', [
    { sprite: aaFrame('aa17-board-frame', BOARD.w, BOARD.h, 'K'), x: 0, y: 0 },
    { sprite: sprite('aa17-board-bars', cells.map((r) => r.join('')), AA_PALETTE), x: 2, y: 2 },
  ]);
})();

/** A case of ledgers cut to one shelf, 16 x 14, three side by side under the board. */
const lowCase = (id: string, top: number) => sprite(id, [
  ...aaBookcase.rows.slice(0, 4),
  ...aaBookcase.rows.slice(top, top + 8),
  ...aaBookcase.rows.slice(44, 46),
]);

/** The side table for the adding machine, 24 x 16. */
const sideTable = sprite('aa17-side-table', [
  'O'.repeat(24),
  `y${'G'.repeat(22)}g`,
  'O'.repeat(24),
  ...Array.from({ length: 13 }, () => `.OgO${'.'.repeat(16)}OgO.`),
]);

const TABLE = { x: 55, y: 41 };
const MACHINE = { x: 56, y: 28 };
const NET = PAIRS[2];

const base = aaCompose('aa17-opener-base', 80, 60, 'k', [
  { sprite: aaFloor('aa17-floor', 80, [[2, 49], [55, 78]]), x: 0, y: 49 },
  { sprite: aaPlaque('aa17-opener-plate', 'BUDGET'), x: 14, y: 1 },
  { sprite: bars, x: BOARD.x, y: BOARD.y },
  { sprite: lowCase('aa17-case-a', 12), x: 2, y: 43 },
  { sprite: lowCase('aa17-case-b', 28), x: 18, y: 43 },
  { sprite: lowCase('aa17-case-c', 4), x: 34, y: 43 },
  { sprite: sideTable, ...TABLE },
  { sprite: aaAddingMachine, ...MACHINE },
]);

/** The favourable variance: a green badge with a white plus, over the actual profit bar. */
const badge = sprite('aa17-badge', ['.nnnnn.', 'nNNaNNn', 'nNNaNNn', 'naaaaan', 'nNNaNNn', 'nNNaNNn', '.nnnnn.'], AA_PALETTE);
/** The actual profit bar's rim, lit. */
const netRim = sprite('aa17-net-rim', Array.from({ length: NET.actual }, (_, y) => (y === 0 ? 'aaaaa' : 'a...a')), AA_PALETTE);

export const aa17Opener: SceneArt = {
  id: 'aa17-opener',
  label: 'A gilt-framed board under a brass plate reading BUDGET sets dashed budget bars beside solid actual bars for revenue, expenses and net profit, a green plus badge on the profit that beat its budget, while an adding machine on a side table prints its tape.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: aaCrankTurn, x: MACHINE.x + AA_AT_A.crankOnMachine.x, y: MACHINE.y + AA_AT_A.crankOnMachine.y },
    { sprite: aaTapePrint, x: MACHINE.x + AA_AT_A.tapeOnMachine.x, y: MACHINE.y + AA_AT_A.tapeOnMachine.y },
    { sprite: badge, x: NET.cx, y: BASE_Y - NET.actual - 8, motion: { kind: 'twinkle', periodMs: 2200, min: 0.35 } },
    { sprite: netRim, x: NET.cx + 1, y: BASE_Y - NET.actual, motion: { kind: 'twinkle', periodMs: 2200, min: 0.1, phase: 0.5 } },
    { sprite: aaGlint, x: BOARD.x + BOARD.w - 4, y: BOARD.y - 2, motion: { kind: 'twinkle', periodMs: 3000, min: 0.4 } },
    { sprite: aaMote, x: 58, y: 36, motion: { kind: 'rise', amp: 5, periodMs: 3100 } },
  ],
};

/** Lesson 17 emblem: a gilt target with a white bull and an arrow home in it, the budget hit. */
const emblemTarget = (() => {
  const cells: string[][] = Array.from({ length: 16 }, (_, y) => Array.from({ length: 16 }, (_, x) => {
    const d = Math.hypot(x - 7.5, y - 7.5);
    if (d <= 1.6) return 'a';
    if (d > 3 && d <= 4.6) return 'G';
    if (d > 5.9 && d <= 7.6) return x + y < 13 ? 'y' : x + y > 18 ? 'g' : 'G';
    return '.';
  }));
  [[14, 1], [13, 2], [12, 3], [11, 4], [10, 5], [9, 6]].forEach(([x, y]) => {
    cells[y][x] = 'a';
  });
  [[15, 0], [14, 0], [15, 1]].forEach(([x, y]) => {
    cells[y][x] = 'R';
  });
  return sprite('aa-emblem-target', cells.map((r) => r.join('')), AA_PALETTE);
})();

export const aa17Finish = aaKeepsake(
  'aa17-finish',
  'A purple leather ledger with gold corners and a red ribbon bookmark, its cover stamped in gold with a target and an arrow in its white centre, with small glints and check marks around it.',
  emblemTarget,
);

export const art: LessonArtSet = { opener: aa17Opener, backdrop: aaBackdrop, finish: aa17Finish };
