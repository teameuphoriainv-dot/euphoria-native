/**
 * Applied Accounting lesson 6, Journal Entries & Double-Entry Bookkeeping: every transaction, first
 * in the journal.
 *
 * The camera comes down to the desk. A big open journal fills the frame, JOURNAL inked across the left
 * page over three entries already made, DR and CR heading the right page's money columns. The
 * bookkeeper's hand comes in from the right with a purple quill and makes the next entry the way the
 * lesson teaches: the debit account flush left with its amount in DR, then the credit account indented
 * with its amount in CR, then a green tick to say it is posted. On the left, a brass spike holds the
 * receipts the entries come from; the banker's lamp's shade glows at the top. Moving: the entry writes
 * itself and starts again, the lamp breathes, dust rises, a receipt's corner lifts, the ink glints.
 */
import type { PixelSprite } from '../types';
import { AA_PALETTE, aaCompose, aaGlint, aaInkwell, aaMote, aaText } from './aa-kit';
import { aaKeepsake } from './aa1-finish';
import { aaBackdrop } from './aa-backdrop';
import type { LessonArtSet, SceneArt } from './types';

const sprite = (id: string, rows: string[], palette?: Record<string, string>): PixelSprite =>
  ({ id, name: id, tags: ['aa', 'aa6'], rows, ...(palette ? { palette } : {}) });

/** The desk seen close: the wall above its far edge, then green leather with a tooled gilt line. */
const desk = sprite('aa6-desk', Array.from({ length: 60 }, (_, y) => {
  if (y < 6) return 'k'.repeat(80);
  if (y === 6) return 'O'.repeat(80);
  if (y === 7) return 'g'.repeat(80);
  if (y === 10) return `nn${'g'.repeat(76)}nn`;
  return y > 10 ? `nng${'n'.repeat(74)}gnn` : 'n'.repeat(80);
}));

/** The banker's lamp from below its shade: green glass, the bulb's glow, the brass stem to its foot. */
const lamp = sprite('aa6-lamp', [
  'mNNNNNNNNNNNNNNNNNNNNNn',
  'NNNNNNNNNNNNNNNNNNNNNNn',
  'ttnnnnnnnnnnnnnnnnnnntt',
  '.Gy444444444444444444yG',
  '..........Gg...........',
  '..........Gg...........',
  '........OGGGgO.........',
  '......OyGGGGGGgO.......',
]);

/** The open journal, 64 x 41: two ruled pages, money columns, the entries made so far. */
const BOOK_W = 64;
const journal = (() => {
  const cells: string[][] = Array.from({ length: 41 }, (_, r) => Array.from({ length: BOOK_W }, (_, c) => {
    if (r === 0) return c === 0 || c === 63 || (c >= 31 && c <= 33) ? '.' : 'a';
    if (r === 38) return c === 0 ? 'P' : c === 63 ? 'p' : c === 32 ? 'X' : 'c';
    if (r === 39) return c === 0 || c === 63 ? 'E' : c < 32 ? 'P' : 'p';
    if (r === 40) return c === 0 || c === 63 ? '.' : 'E';
    if (c === 0) return 'P';
    if (c === 63) return 'p';
    if (c === 31 || c === 33) return 'c';
    if (c === 32) return 'X';
    if (r === 8) return 'E';
    if (r > 8 && [20, 25, 44, 53].includes(c)) return 'c';
    return r > 8 && r % 4 === 0 ? 'c' : 'a';
  }));
  const ink = (r: number, from: number, to: number, ch: string) => { for (let c = from; c <= to; c++) cells[r][c] = ch; };
  [[11, 11, 15, 14], [19, 13, 23, 12], [27, 10, 31, 15]].forEach(([dr, dTo, cr, cTo]) => {
    ink(dr, 2, dTo, 'k'); ink(dr, 21, 24, 'b'); ink(cr, 5, cTo, 'k'); ink(cr, 26, 29, 'r');
  });
  ink(11, 36, 42, 'k'); ink(11, 46, 50, 'b'); ink(15, 39, 43, 'k'); ink(15, 56, 60, 'r');
  const stamp = (text: string, c0: number) =>
    aaText(`aa6-${text}`, text, 'E').rows.forEach((row, dy) => [...row].forEach((ch, dx) => { if (ch !== '.') cells[2 + dy][c0 + dx] = ch; }));
  stamp('JOURNAL', 2);
  stamp('DR', 45);
  stamp('CR', 55);
  return sprite('aa6-journal', cells.map((r) => r.join('')), AA_PALETTE);
})();

/** A brass spike of receipts, the transactions the journal records. */
const spike = sprite('aa6-spike', [
  '...y...',
  '...x...',
  '...x...',
  '...x...',
  '...x...',
  '...x...',
  'aaaaaac',
  'akkkkac',
  'aaaxaac',
  'akkaaac',
  'ccccccc',
  '.aaaaaa',
  '.akkkac',
  '.aaxaac',
  '.akkkac',
  '.cccccc',
  'aaaaaac',
  'akkkaac',
  'aaaxaac',
  'ccccccc',
  '...x...',
  '.OyGgO.',
  'OyGGGgO',
  'OOOOOOO',
], AA_PALETTE);

/*
 * The hand at work, 42 x 24 over the right page (local = page column - 30, page row - 6). Each frame
 * draws what is written so far, then the sleeve from the right edge, the quill, the fingers.
 */
const WRITER = { w: 42, h: 24 };
type Stroke = [row: number, from: number, to: number, ink: string];
const DEBIT: Stroke[] = [[13, 6, 9, 'k'], [13, 6, 12, 'k'], [13, 16, 20, 'b']];
const CREDIT: Stroke[] = [[17, 9, 13, 'k'], [17, 26, 30, 'r']];
const TICK = ['...n', 'n.n.', '.n..'];

const writerFrame = (nib: [number, number], strokes: Stroke[], tick = false) => {
  const cells = Array.from({ length: WRITER.h }, () => Array.from({ length: WRITER.w }, () => '.'));
  const put = (x: number, y: number, ch: string) => { if (x >= 0 && x < WRITER.w && y >= 0 && y < WRITER.h) cells[y][x] = ch; };
  strokes.forEach(([y, from, to, ch]) => { for (let x = from; x <= to; x++) put(x, y, ch); });
  if (tick) TICK.forEach((r, dy) => [...r].forEach((ch, dx) => { if (ch !== '.') put(4 + dx, 15 + dy, ch); }));
  const [nx, ny] = nib;
  for (let x = nx + 7; x < WRITER.w; x++) {
    const top = ny - 3 + Math.floor((x - nx - 6) / 8);
    ['E', 'P', 'P', 'p', 'E'].forEach((ch, dy) => put(x, top + dy, ch));
  }
  for (let dy = -3; dy <= 1; dy++) put(nx + 6, ny + dy, 'c');
  put(nx, ny, 'k');
  put(nx + 1, ny - 1, 'D');
  for (let i = 4; i <= 9; i++) { put(nx + i, ny - i, 'P'); put(nx + i, ny - i - 1, 'q'); put(nx + i + 1, ny - i, 'p'); }
  put(nx + 10, ny - 10, 'q');
  [[-3, 2, 'SSM'], [-2, 1, 'SSSMM'], [-1, 2, 'SSMM'], [0, 3, 'SMM']].forEach(([dy, dx, run]) =>
    [...(run as string)].forEach((ch, i) => put(nx + (dx as number) + i, ny + (dy as number), ch)));
  return cells.map((r) => r.join(''));
};

const written = writerFrame([18, 11], [DEBIT[1], DEBIT[2], ...CREDIT], true);
const writer: PixelSprite = {
  ...sprite('aa6-writer', written, AA_PALETTE),
  frames: [
    writerFrame([6, 13], []),
    writerFrame([9, 13], [DEBIT[0]]),
    writerFrame([12, 13], [DEBIT[1]]),
    writerFrame([20, 13], [DEBIT[1], DEBIT[2]]),
    writerFrame([9, 17], [DEBIT[1], DEBIT[2]]),
    writerFrame([13, 17], [DEBIT[1], DEBIT[2], CREDIT[0]]),
    writerFrame([30, 17], [DEBIT[1], DEBIT[2], ...CREDIT]),
    writerFrame([7, 15], [DEBIT[1], DEBIT[2], ...CREDIT], true),
    written,
    written,
  ],
  frameMs: 480,
};

/** The top receipt's corner lifting in the lamp's warmth. */
const receiptCorner: PixelSprite = {
  ...sprite('aa6-receipt-corner', ['..', '..'], AA_PALETTE),
  frames: [['..', '..'], ['..', '..'], ['.k', 'ck'], ['..', '..']],
  frameMs: 640,
};

const BOOK = { x: 8, y: 12 };
const SPIKE = { x: 0, y: 29 };
const INKWELL = { x: 73, y: 8 };

const base = aaCompose('aa6-opener-base', 80, 60, 'k', [
  { sprite: desk, x: 0, y: 0 },
  { sprite: lamp, x: 0, y: 0 },
  { sprite: journal, ...BOOK },
  { sprite: spike, ...SPIKE },
  { sprite: aaInkwell, ...INKWELL },
]);

const glow = sprite('aa6-glow', ['4'.repeat(18)]);

export const aa6Opener: SceneArt = {
  id: 'aa6-opener',
  label: 'A close look at an open journal headed JOURNAL, where a hand with a purple quill writes a debit line and an indented credit line under DR and CR, beside a spike of receipts.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: writer, x: BOOK.x + 30, y: BOOK.y + 6 },
    { sprite: glow, x: 3, y: 3, motion: { kind: 'twinkle', periodMs: 3400, min: 0.35 } },
    { sprite: receiptCorner, x: SPIKE.x + 5, y: SPIKE.y + 6 },
    { sprite: aaGlint, x: INKWELL.x - 1, y: INKWELL.y - 2 },
    { sprite: aaMote, x: 6, y: 9, motion: { kind: 'rise', amp: 4, periodMs: 2800 } },
    { sprite: aaMote, x: 15, y: 10, motion: { kind: 'rise', amp: 5, periodMs: 3300, phase: 0.5 } },
  ],
};

/** Lesson 6 emblem: a gilt quill over an open journal. */
const emblemQuill = sprite('aa-emblem-quill', [
  '.............yG.',
  '............yGg.',
  '...........yGg..',
  '..........yGg...',
  '.........yGg....',
  '........yGg.....',
  '.......yGg......',
  '......Gg........',
  '.....Og.........',
  '....O...........',
  '.OOOOOO..OOOOOO.',
  'OyyyyyyOOyyyyyyO',
  'OyGGGGGOOGGGGGgO',
  'OGGGGGGOOGGGGGgO',
  'OOOOOOOOOOOOOOOO',
  '................',
]);

export const aa6Finish = aaKeepsake(
  'aa6-finish',
  'A purple leather ledger with gold corners and a red ribbon bookmark, its cover stamped in gold with a quill over an open journal, with small glints and check marks around it.',
  emblemQuill,
);

export const art: LessonArtSet = { opener: aa6Opener, backdrop: aaBackdrop, finish: aa6Finish };
