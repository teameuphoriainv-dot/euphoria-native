/**
 * Applied Accounting lesson 9, Forensic Accounting & Fraud Detection: reading the books for what they
 * hide.
 *
 * The hall after hours. A corkboard on the wall carries the fraud triangle: three cards pinned and
 * strung in red, P for pressure, O for opportunity, R for rationalisation. Beside it a pinned chart
 * of Benford's law, the first digit 1 standing tallest and the bars falling away to 9. At the desk the
 * bookkeeper holds a reading glass to his eye, his eye huge in it, and a red flag stands in the ledger
 * at his elbow. Moving: the magnified eye looks one way, then the other, and blinks; the red flag
 * waves; the 1 bar glows; the lamp breathes; dust rises.
 */
import type { PixelSprite } from '../types';
import { AA_AT, AA_PALETTE, aaBankersLamp, aaBookkeeper, aaCompose, aaDesk, aaLampGlow, aaLedgerOpen, aaMote, aaText } from './aa-kit';
import { aaFloor } from './aa-kit-a';
import { aaKeepsake } from './aa1-finish';
import { aaBackdrop } from './aa-backdrop';
import type { LessonArtSet, SceneArt } from './types';

const sprite = (id: string, rows: string[], palette?: Record<string, string>): PixelSprite =>
  ({ id, name: id, tags: ['aa', 'aa9'], rows, ...(palette ? { palette } : {}) });

/** A pinned card lettered in ink, 9 x 7, its red pin at the top. */
const card = (id: string, letter: string) => aaCompose(id, 9, 8, '.', [
  { sprite: sprite(`${id}-sheet`, ['....RR...', ...Array.from({ length: 6 }, () => 'aaaaaaaac'), 'ccccccccc'], AA_PALETTE), x: 0, y: 0 },
  { sprite: aaText(`${id}-letter`, letter, 'k'), x: 3, y: 1 },
]);

/** The corkboard, 40 x 23: a dark frame, speckled cork, the fraud triangle strung in red. */
const BOARD = { x: 2, y: 2, w: 40, h: 23 };
const CARDS: [string, number, number][] = [['P', 15, 2], ['O', 4, 13], ['R', 27, 13]];
const board = (() => {
  const cells: string[][] = Array.from({ length: BOARD.h }, (_, y) => Array.from({ length: BOARD.w }, (_, x) => {
    if (x === 0 || y === 0 || x === BOARD.w - 1 || y === BOARD.h - 1) return 'D';
    if (x === 1 || y === 1) return 'X';
    if (x === BOARD.w - 2 || y === BOARD.h - 2) return 'K';
    return (x * 7 + y * 13) % 11 === 0 ? 'g' : 'O';
  }));
  const pins = CARDS.map(([, x, y]) => [x + 4, y] as const);
  for (let i = 0; i < 3; i++) {
    const [x0, y0] = pins[i];
    const [x1, y1] = pins[(i + 1) % 3];
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    for (let s = 0; s <= n; s++) cells[Math.round(y0 + ((y1 - y0) * s) / n)][Math.round(x0 + ((x1 - x0) * s) / n)] = 'R';
  }
  return aaCompose('aa9-board', BOARD.w, BOARD.h, '.', [
    { sprite: sprite('aa9-cork', cells.map((r) => r.join(''))), x: 0, y: 0 },
    ...CARDS.map(([letter, x, y]) => ({ sprite: card(`aa9-card-${letter.toLowerCase()}`, letter), x, y })),
  ]);
})();

/** Benford's law, 22 x 18: nine first digits, 1 at about 30 in 100, 9 under 5. */
const BENFORD = [10, 6, 4, 3, 3, 2, 2, 2, 1];
const benford = aaCompose('aa9-benford', 22, 18, '.', [
  { sprite: sprite('aa9-benford-sheet', Array.from({ length: 18 }, (_, y) => {
    if (y === 0) return '..........RR..........';
    if (y === 17) return 'c'.repeat(22);
    if (y === 11) return `a${'k'.repeat(20)}c`;
    return `a${BENFORD.map((h, i) => (y <= 10 && y > 10 - h ? (i % 2 ? 'bb' : 'BB') : 'aa')).join('')}ac`;
  }), AA_PALETTE), x: 0, y: 0 },
  { sprite: aaText('aa9-digit-1', '1', 'k'), x: 1, y: 12 },
  { sprite: aaText('aa9-digit-9', '9', 'k'), x: 17, y: 12 },
]);

const LAMP = { x: 6, y: 25 };
const LEDGER = { x: 22, y: 31 };
const KEEPER = { x: 60, y: 19 };
const BENFORD_AT = { x: 44, y: 2 };

const base = aaCompose('aa9-opener-base', 80, 60, 'k', [
  { sprite: aaFloor('aa9-floor', 80, [[5, 76]]), x: 0, y: 49 },
  { sprite: board, x: BOARD.x, y: BOARD.y },
  { sprite: benford, ...BENFORD_AT },
  { sprite: aaBookkeeper, ...KEEPER },
  { sprite: aaDesk, x: 4, y: 36 },
  { sprite: aaBankersLamp, ...LAMP },
  { sprite: aaLedgerOpen, ...LEDGER },
]);

/*
 * The reading glass at his left eye, 12 x 18: rim, the eye seen through it four times its size, the
 * handle down to his fist at his chest. Frames: looking ahead, left, ahead, right, a blink.
 */
const glassFrame = (look: number, shut = false) => {
  const cells: string[][] = Array.from({ length: 18 }, (_, y) => Array.from({ length: 12 }, (_, x) => {
    const d = Math.hypot(x - 5, y - 5);
    if (d > 5.6) return '.';
    if (d > 4.4) return x + y < 9 ? 'y' : 'O';
    if (shut) return y === 5 ? 'k' : 'S';
    if (y < 3 || y > 7) return 'S';
    if (y === 3 || y === 7) return x > 1 && x < 9 ? 'k' : 'S';
    return x > 1 && x < 9 ? (Math.abs(x - 5 - look) <= 1 ? 'K' : 'a') : 'S';
  }));
  const grip: [number, number, string][] = [[11, 5, 'Og'], [12, 5, 'Og'], [13, 3, 'SSSSM'], [14, 3, 'SSSMM'], [15, 2, 'PPPPPp'], [16, 1, 'PPPPPPp'], [17, 1, 'PPPPPPp']];
  grip.forEach(([y, x0, run]) => [...run].forEach((ch, i) => { cells[y][x0 + i] = ch; }));
  return cells.map((r) => r.join(''));
};
const glass: PixelSprite = {
  ...sprite('aa9-glass', glassFrame(0), AA_PALETTE),
  frames: [glassFrame(0), glassFrame(0), glassFrame(-2), glassFrame(-2), glassFrame(0), glassFrame(2), glassFrame(2), glassFrame(0), glassFrame(0, true)],
  frameMs: 420,
};

/** A red flag on a pin, stuck in the ledger, waving. */
const FLAG_A = ['kRRR', 'kRRr', 'kRr.', 'k...', 'k...', 'k...'];
const FLAG_B = ['kRR.', 'kRRR', 'kRRr', 'k...', 'k...', 'k...'];
const flag: PixelSprite = { ...sprite('aa9-flag', FLAG_A), frames: [FLAG_A, FLAG_B], frameMs: 480 };

const firstDigit = sprite('aa9-first-digit', Array.from({ length: 10 }, () => 'yy'));

export const aa9Opener: SceneArt = {
  id: 'aa9-opener',
  label: "A bookkeeper peers through a reading glass, his eye huge in it, beside a corkboard with the fraud triangle strung in red and a chart of Benford's law, while a red flag waves in his ledger.",
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: glass, x: KEEPER.x + 7, y: KEEPER.y + 2 },
    { sprite: flag, x: LEDGER.x + 27, y: LEDGER.y - 5 },
    { sprite: firstDigit, x: BENFORD_AT.x + 1, y: BENFORD_AT.y + 1, motion: { kind: 'twinkle', periodMs: 2200, min: 0.1 } },
    { sprite: aaLampGlow, x: LAMP.x + AA_AT.glowInLamp.x, y: LAMP.y + AA_AT.glowInLamp.y, motion: { kind: 'twinkle', periodMs: 3400, min: 0.35 } },
    { sprite: aaMote, x: 10, y: 34, motion: { kind: 'rise', amp: 5, periodMs: 2800 } },
    { sprite: aaMote, x: 17, y: 33, motion: { kind: 'rise', amp: 4, periodMs: 3300, phase: 0.5 } },
  ],
};

/** Lesson 9 emblem: a gilt reading glass with the fraud triangle in its lens. */
const emblemGlass = (() => {
  const cells: string[][] = Array.from({ length: 16 }, (_, y) => Array.from({ length: 16 }, (_, x) => {
    const d = Math.hypot(x - 6, y - 6);
    if (d > 6.2) return '.';
    if (d > 5.2) return 'O';
    if (d > 4.1) return x + y < 11 ? 'y' : x + y > 13 ? 'g' : 'G';
    return '.';
  }));
  [[6, 3], [5, 4], [7, 4], [5, 5], [7, 5], [4, 6], [8, 6], [4, 7], [8, 7], [3, 8], [4, 8], [5, 8], [6, 8], [7, 8], [8, 8], [9, 8]].forEach(([x, y]) => {
    cells[y][x] = 'y';
  });
  for (let i = 0; i < 5; i++) {
    cells[10 + i][10 + i] = 'G';
    cells[10 + i][11 + i > 15 ? 15 : 11 + i] = 'g';
    if (11 + i < 16) cells[11 + i][10 + i] = 'O';
  }
  return sprite('aa-emblem-glass', cells.map((r) => r.join('')));
})();

export const aa9Finish = aaKeepsake(
  'aa9-finish',
  'A purple leather ledger with gold corners and a red ribbon bookmark, its cover stamped in gold with a reading glass framing a triangle, with small glints and check marks around it.',
  emblemGlass,
);

export const art: LessonArtSet = { opener: aa9Opener, backdrop: aaBackdrop, finish: aa9Finish };
