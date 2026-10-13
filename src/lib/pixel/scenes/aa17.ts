/**
 * Applied Accounting lesson 17, Budgeting & Variance Analysis: the plan set beside what happened, and
 * every gap between them explained.
 *
 * A slate board in a gilt frame is the variance report: three pairs of bars on one baseline and one
 * scale, revenue, expenses and net profit, the budget drawn as a dashed outline and the actual filled in
 * beside it, so net profit is revenue less expenses in both. Revenue came in over plan in gold, expenses
 * a little over in red, and net profit over plan in green, a green plus badge on it for a favourable
 * variance. Under a plate reading BUDGET, a run of shelves holds the year's ledgers, and on a side table
 * the adding machine works the figures. Moving: the crank turns, the tape prints down to a green total,
 * the favourable result, the plus badge pulses, the profit bar's rim glows, light runs along the frame,
 * dust rises.
 */
import type { PixelSprite } from '../types';
import { AA_PALETTE, aaBookcase, aaCompose, aaGlint, aaMote, aaPlaque, aaText } from './aa-kit';
import { AA_AT_A, aaAddingMachine, aaCrankTurn, aaFloor, aaFrame, aaTapePrint } from './aa-kit-a';
import { aaPaint } from './aa-kit-c';
import { aaKeepsake } from './aa1-finish';
import { aaBackdrop } from './aa-backdrop';
import type { LessonArtSet, SceneArt } from './types';

const sprite = (id: string, rows: string[], palette?: Record<string, string>): PixelSprite =>
  ({ id, name: id, tags: ['aa', 'aa17'], rows, ...(palette ? { palette } : {}) });

/**
 * The board, 52 x 31, and the three pairs on it: budget height, actual height, the actual's colours.
 * The tallest bar, revenue's actual, stops a pixel short of the frame so it cannot read as part of it.
 */
const BOARD = { x: 2, y: 11, w: 52, h: 31 };
const BASE_Y = 34;
// One scale for every bar, about 1.8 px per $1M of the lesson's report, so net is revenue less
// expenses: 18 - 14 and 20 - 15.
const PAIRS = [
  { cx: 12, word: 'REV', budget: 18, actual: 20, lit: 'y', fill: 'G' },
  { cx: 28, word: 'EXP', budget: 14, actual: 15, lit: 's', fill: 'R' },
  { cx: 44, word: 'NET', budget: 4, actual: 5, lit: 'm', fill: 'N' },
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
    const top = BASE_Y - p.budget;
    for (let y = top; y < BASE_Y; y++) {
      // The budget's outline in dashes two on, one off, counted from its top corners so even the
      // short net-profit budget keeps both corners and reads as a box.
      for (let x = p.cx - 5; x <= p.cx - 1; x++) {
        const edge = y === top || x === p.cx - 5 || x === p.cx - 1;
        if (edge && (y === top ? (x - (p.cx - 5)) % 3 !== 2 : (y - top) % 3 !== 2)) put(x, y, 'c');
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

/** The adding machine's tape with its total printed in green, the favourable variance, not the kit's red. */
const tapeGreen: PixelSprite = {
  ...aaTapePrint,
  id: 'aa17-tape-print',
  name: 'aa17-tape-print',
  rows: aaTapePrint.rows.map((r) => r.replace(/R/g, 'n')),
  frames: (aaTapePrint.frames ?? []).map((f) => f.map((r) => r.replace(/R/g, 'n'))),
};

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
    { sprite: tapeGreen, x: MACHINE.x + AA_AT_A.tapeOnMachine.x, y: MACHINE.y + AA_AT_A.tapeOnMachine.y },
    { sprite: badge, x: NET.cx, y: BASE_Y - NET.actual - 8, motion: { kind: 'twinkle', periodMs: 2200, min: 0.35 } },
    { sprite: netRim, x: NET.cx + 1, y: BASE_Y - NET.actual, motion: { kind: 'twinkle', periodMs: 2200, min: 0.1, phase: 0.5 } },
    { sprite: aaGlint, x: BOARD.x + BOARD.w - 4, y: BOARD.y - 2, motion: { kind: 'twinkle', periodMs: 3000, min: 0.4 } },
    { sprite: aaMote, x: 58, y: 36, motion: { kind: 'rise', amp: 5, periodMs: 3100 } },
  ],
};

/**
 * Lesson 17 emblem: the variance itself. A dashed white budget bar stands beside a taller solid gilt
 * actual on one baseline; a dashed line carries the budget's level across, and the actual's part above
 * it is green with a white plus, the favourable gap.
 */
const emblemVariance = aaPaint('aa-emblem-variance', 16, 16, (x, y) => {
  const BUDGET_TOP = 6;
  if (y === 13) return x >= 1 && x <= 14 ? (x === 1 ? 'y' : 'G') : '.';
  if (y === 14) return x >= 1 && x <= 14 ? 'g' : '.';
  if (x >= 9 && x <= 13 && y >= 1 && y <= 12) {
    if (y < BUDGET_TOP) return (x === 11 && y >= 2 && y <= 4) || (y === 3 && x >= 10 && x <= 12) ? 'a' : x === 9 ? 'm' : x === 13 ? 'n' : 'N';
    return x === 9 ? 'y' : x === 13 ? 'g' : 'G';
  }
  if (y === BUDGET_TOP && x >= 2 && x <= 8) return (x - 2) % 3 !== 2 ? 'a' : '.';
  if (y > BUDGET_TOP && y <= 12 && (x === 2 || x === 6)) return (y - BUDGET_TOP) % 3 !== 2 ? 'a' : '.';
  return '.';
});

export const aa17Finish = aaKeepsake(
  'aa17-finish',
  'A purple leather ledger with gold corners and a red ribbon bookmark, its cover stamped with a dashed white budget bar beside a taller gold actual bar whose top above the budget line is green with a white plus, with small glints and check marks around it.',
  emblemVariance,
);

export const art: LessonArtSet = { opener: aa17Opener, backdrop: aaBackdrop, finish: aa17Finish };
