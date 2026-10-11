/**
 * Applied Accounting lesson 7, Cost Accounting & Break-Even Analysis: the point where sales pay for
 * every cost.
 *
 * The set turns: an easel stands on the floorboards at the left with the break-even chart pinned to
 * it, a red total-cost line starting from the fixed costs, a green revenue line climbing from nothing,
 * the loss shaded red before they cross and the profit green after, a gold star where they meet. At the
 * desk the bookkeeper works the adding machine, whose tape prints line after line to a red total, under
 * a plate reading BREAK EVEN. Moving: a marker of units sold climbs the revenue line past the star, the
 * star glints, the crank turns, the tape prints, the bookkeeper blinks, dust rises.
 */
import type { PixelSprite } from '../types';
import { AA_AT, AA_PALETTE, aaBlink, aaBookkeeper, aaCompose, aaDesk, aaHandRest, aaMote, aaPlaque } from './aa-kit';
import { AA_AT_A, aaAddingMachine, aaCrankTurn, aaFloor, aaFrame, aaTapePrint } from './aa-kit-a';
import { aaKeepsake } from './aa1-finish';
import { aaBackdrop } from './aa-backdrop';
import type { LessonArtSet, SceneArt } from './types';

const sprite = (id: string, rows: string[], palette?: Record<string, string>): PixelSprite =>
  ({ id, name: id, tags: ['aa', 'aa7'], rows, ...(palette ? { palette } : {}) });

/** The chart's field, 24 x 21, origin at column 1, row 18. Lines are y = y0 + slope * (x - 2). */
const CHART = { w: 24, h: 21 };
const revenueY = (x: number) => Math.round(17 - 0.8 * (x - 2));
const costY = (x: number) => Math.round(12 - 0.25 * (x - 2));
const BREAK_EVEN = { x: 11, y: 10 };

const chart = (() => {
  const cells: string[][] = Array.from({ length: CHART.h }, () => Array.from({ length: CHART.w }, () => '.'));
  for (let x = 2; x <= 22; x++) {
    const r = revenueY(x);
    const c = costY(x);
    for (let y = Math.min(r, c) + 1; y < Math.max(r, c); y++) if ((x + y) % 2 === 0) cells[y][x] = x < BREAK_EVEN.x ? 's' : 'm';
    if (x % 2 === 0) cells[12][x] = 'x';
    cells[c][x] = 'R';
    cells[r][x] = 'N';
  }
  for (let y = 1; y <= 18; y++) cells[y][1] = 'k';
  for (let x = 1; x <= 22; x++) cells[18][x] = 'k';
  [[0, -1], [-1, 0], [0, 0], [1, 0], [0, 1]].forEach(([dx, dy]) => { cells[BREAK_EVEN.y + dy][BREAK_EVEN.x + dx] = dx || dy ? 'G' : 'y'; });
  return sprite('aa7-chart', cells.map((r) => r.join('')));
})();

/** The easel, 30 x 55: three legs to the floor, a ledge for the board. */
const easel = (() => {
  const cells: string[][] = Array.from({ length: 55 }, () => Array.from({ length: 30 }, () => '.'));
  for (let y = 0; y < 55; y++) {
    const spread = Math.round((y * 12) / 54);
    cells[y][14 - spread] = 'O'; cells[y][13 - spread] = 'g';
    cells[y][15 + spread] = 'O'; cells[y][16 + spread] = 'g';
    if (y > 28) { cells[y][14] = 'g'; cells[y][15] = 'O'; }
  }
  for (let x = 0; x < 30; x++) { cells[28][x] = x ? 'G' : 'y'; cells[29][x] = 'O'; }
  return sprite('aa7-easel', cells.map((r) => r.join('')));
})();

const EASEL = { x: 1, y: 2 };
const BOARD = { x: EASEL.x + 1, y: EASEL.y + 3 };
const FIELD = { x: BOARD.x + 2, y: BOARD.y + 2 };
const KEEPER = { x: 36, y: 17 };
const MACHINE = { x: 57, y: 26 };

const base = aaCompose('aa7-opener-base', 80, 60, 'k', [
  { sprite: aaFloor('aa7-floor', 80, [[2, 30], [31, 79]]), x: 0, y: 49 },
  { sprite: aaPlaque('aa7-opener-plate', 'BREAK EVEN'), x: 36, y: 2 },
  { sprite: easel, ...EASEL },
  { sprite: aaFrame('aa7-board', CHART.w + 4, CHART.h + 4, 'a'), ...BOARD },
  { sprite: chart, ...FIELD },
  { sprite: aaBookkeeper, ...KEEPER },
  { sprite: aaDesk, x: 31, y: 36 },
  { sprite: aaHandRest, x: KEEPER.x + 12, y: 36 },
  { sprite: aaAddingMachine, ...MACHINE },
]);

/** Units sold: a marker climbing the revenue line, dark while it loses money, gold at the star. */
const MARKS = [2, 5, 8, 11, 14, 17, 20];
const marker: PixelSprite = (() => {
  const frame = (x?: number) => {
    const cells: string[][] = Array.from({ length: CHART.h }, () => Array.from({ length: CHART.w }, () => '.'));
    if (x !== undefined) {
      const y = revenueY(x);
      const ink = x === BREAK_EVEN.x ? 'y' : 'K';
      [[0, -1], [1, -1], [0, 0], [1, 0]].forEach(([dx, dy]) => { cells[y + dy][x + dx] = ink; });
    }
    return cells.map((r) => r.join(''));
  };
  return { ...sprite('aa7-marker', frame(), AA_PALETTE), frames: [...MARKS.map((x) => frame(x)), frame(), frame()], frameMs: 560 };
})();

const star = sprite('aa7-star', ['.y.', 'yay', '.y.'], AA_PALETTE);

export const aa7Opener: SceneArt = {
  id: 'aa7-opener',
  label: 'A bookkeeper at an adding machine that prints a tape, beside an easel chart where a green revenue line crosses a red cost line at a gold break-even star, under a plate reading BREAK EVEN.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: marker, ...FIELD },
    { sprite: star, x: FIELD.x + BREAK_EVEN.x - 1, y: FIELD.y + BREAK_EVEN.y - 1, motion: { kind: 'twinkle', periodMs: 1600, min: 0.15 } },
    { sprite: aaCrankTurn, x: MACHINE.x + AA_AT_A.crankOnMachine.x, y: MACHINE.y + AA_AT_A.crankOnMachine.y },
    { sprite: aaTapePrint, x: MACHINE.x + AA_AT_A.tapeOnMachine.x, y: MACHINE.y + AA_AT_A.tapeOnMachine.y },
    { sprite: aaBlink, x: KEEPER.x + AA_AT.blinkOnBookkeeper.x, y: KEEPER.y + AA_AT.blinkOnBookkeeper.y },
    { sprite: aaMote, x: 33, y: 31, motion: { kind: 'rise', amp: 5, periodMs: 3000 } },
    { sprite: aaMote, x: 56, y: 21, motion: { kind: 'rise', amp: 4, periodMs: 3500, phase: 0.5 } },
  ],
};

/** Lesson 7 emblem: gilt axes, a steep revenue line crossing a flat cost line at a star. */
const emblemBreakEven = (() => {
  const cells: string[][] = Array.from({ length: 16 }, () => Array.from({ length: 16 }, () => '.'));
  for (let y = 1; y <= 14; y++) cells[y][1] = 'g';
  for (let x = 1; x <= 15; x++) cells[14][x] = 'g';
  for (let x = 2; x <= 15; x++) {
    const c = Math.round(8 - (4 / 13) * (x - 2));
    cells[c][x] = 'G';
    if (c + 1 < 14) cells[c + 1][x] = 'O';
    const r = Math.round(13 - (12 / 13) * (x - 2));
    cells[r][x] = 'y';
    if (r + 1 < 14) cells[r + 1][x] = 'G';
  }
  [[0, -2], [0, -1], [-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0], [0, 1], [0, 2]].forEach(([dx, dy]) => {
    cells[6 + dy][10 + dx] = dx || dy ? 'y' : 'O';
  });
  return sprite('aa-emblem-break-even', cells.map((r) => r.join('')));
})();

export const aa7Finish = aaKeepsake(
  'aa7-finish',
  'A purple leather ledger with gold corners and a red ribbon bookmark, its cover stamped in gold with a revenue line crossing a cost line at a star, with small glints and check marks around it.',
  emblemBreakEven,
);

export const art: LessonArtSet = { opener: aa7Opener, backdrop: aaBackdrop, finish: aa7Finish };
