/**
 * Applied Accounting lesson 16, Tax Accounting Fundamentals: the income in the books and the income
 * the tax return is filed on are two different numbers.
 *
 * Two sets of books, propped open on bookrests at either end of the desk with the bookkeeper between
 * them. Over the left hangs a plate reading BOOK, and its pages show income of 2B with a tall gold
 * bar; over the right a plate reading TAX, and its pages show taxable income of 1B with a bar half the
 * height. The difference is the deferred tax the lesson teaches. Between the plates hangs the charter
 * of the return itself, 1040, its seal catching the light. Moving: a quill writes in the tax book, the
 * book income bar glows, the seal glints, dust rises, the bookkeeper blinks.
 */
import type { PixelSprite } from '../types';
import { AA_AT, AA_PALETTE, aaBlink, aaBookkeeper, aaCharter, aaCompose, aaDesk, aaGlint, aaMote, aaPlaque, aaText } from './aa-kit';
import { aaFloor } from './aa-kit-a';
import { aaKeepsake } from './aa1-finish';
import { aaBackdrop } from './aa-backdrop';
import type { LessonArtSet, SceneArt } from './types';

const sprite = (id: string, rows: string[], palette?: Record<string, string>): PixelSprite =>
  ({ id, name: id, tags: ['aa', 'aa16'], rows, ...(palette ? { palette } : {}) });

/** The book's pages: a 9 x 12 page each side of the spine, the income bar left, its figure right. */
const PAGE = { w: 9, h: 12 };
const BAR = { x: 2, w: 5, base: 10 };

/**
 * A set of books open on a bookrest, 25 x 20: the wooden rest behind, the book with its income bar
 * `barH` tall on the left page and `figure` lettered on the right one over ruled lines.
 */
const bookrest = (id: string, figure: string, barH: number) => {
  const text = aaText(`${id}-figure`, figure, 'K').rows;
  const page = (side: 'left' | 'right') => Array.from({ length: PAGE.h }, (_, y) => Array.from({ length: PAGE.w }, (_, x) => {
    if (side === 'left') {
      if (y === BAR.base + 1) return x >= 1 && x <= 7 ? 'c' : 'a';
      if (x >= BAR.x && x < BAR.x + BAR.w && y <= BAR.base && y > BAR.base - barH) return x === BAR.x ? 'y' : 'G';
      return 'a';
    }
    if (y >= 1 && y <= 5) return text[y - 1][x - 1] === 'K' ? 'K' : 'a';
    return y >= 7 && y % 2 === 1 && x >= 1 && x <= 7 ? 'X' : 'a';
  }).join(''));
  const left = page('left');
  const right = page('right');
  return sprite(id, [
    'O'.repeat(25),
    `O${'g'.repeat(23)}O`,
    `Og${'E'.repeat(21)}gO`,
    ...left.map((r, y) => `OgE${r}${y % 2 ? 'c' : 'X'}${right[y]}EgO`),
    `Og${'E'.repeat(21)}gO`,
    `y${'G'.repeat(23)}g`,
    'O'.repeat(25),
    '..OO.................OO..',
  ], AA_PALETTE);
};

const BOOK = { x: 3, y: 19 };
const TAX = { x: 52, y: 19 };
const KEEPER = { x: 31, y: 17 };
const CHARTER = { x: 30, y: 1 };

const base = aaCompose('aa16-opener-base', 80, 60, 'k', [
  { sprite: aaFloor('aa16-floor', 80, [[5, 76]]), x: 0, y: 49 },
  { sprite: aaPlaque('aa16-plate-book', 'BOOK'), x: BOOK.x + 3, y: 3 },
  { sprite: aaPlaque('aa16-plate-tax', 'TAX'), x: TAX.x + 5, y: 3 },
  { sprite: aaCharter('aa16-charter', '1040'), ...CHARTER },
  { sprite: aaBookkeeper, ...KEEPER },
  { sprite: aaDesk, x: 4, y: 36 },
  { sprite: bookrest('aa16-books-book', '2B', 8), ...BOOK },
  { sprite: bookrest('aa16-books-tax', '1B', 4), ...TAX },
]);

/** The book income bar's edges lit, over the left book's bar: the gold stays, the rim glows. */
const barLit = sprite('aa16-bar-lit', Array.from({ length: 8 }, (_, y) => (y === 0 ? 'yyyyy' : 'y...y')));

/** A quill writing down the tax book's ruled lines. */
const quill = sprite('aa16-quill', [
  '......yG',
  '.....yG.',
  '....PPp.',
  '...PPp..',
  '..PPp...',
  '.Pp.....',
  'k.......',
], AA_PALETTE);

export const aa16Opener: SceneArt = {
  id: 'aa16-opener',
  label: 'The bookkeeper sits between two ledgers open on bookrests: under a brass plate reading BOOK the income is 2B with a tall gold bar, under one reading TAX the taxable income is 1B with a bar half as tall, and a charter reading 1040 hangs between.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: barLit, x: BOOK.x + 3 + BAR.x, y: BOOK.y + 3 + BAR.base - 7, motion: { kind: 'twinkle', periodMs: 3000, min: 0.1 } },
    { sprite: quill, x: TAX.x + 15, y: TAX.y + 5, motion: { kind: 'drift', amp: 2, periodMs: 1800 } },
    { sprite: aaGlint, x: CHARTER.x + 11, y: CHARTER.y + 8, motion: { kind: 'twinkle', periodMs: 2600, min: 0.4 } },
    { sprite: aaBlink, x: KEEPER.x + AA_AT.blinkOnBookkeeper.x, y: KEEPER.y + AA_AT.blinkOnBookkeeper.y },
    { sprite: aaMote, x: 29, y: 30, motion: { kind: 'rise', amp: 5, periodMs: 3200 } },
  ],
};

/** Lesson 16 emblem: a gilt temple front, pediment and four columns, the revenue service. */
const emblemColumns = sprite('aa-emblem-columns', [
  '.......yg.......',
  '.....yyGGgg.....',
  '...yyGGaaGGgg...',
  '.yyGGGGGGGGGGgg.',
  'yyyyyyyyyyyyyyyg',
  'gggggggggggggggg',
  '.yG..yG..yG..yG.',
  '.yG..yG..yG..yG.',
  '.yG..yG..yG..yG.',
  '.yG..yG..yG..yG.',
  '.yG..yG..yG..yG.',
  '.yG..yG..yG..yG.',
  'yyyyyyyyyyyyyyyg',
  'gggggggggggggggg',
  '.yyyyyyyyyyyyyg.',
  '.gggggggggggggg.',
], AA_PALETTE);

export const aa16Finish = aaKeepsake(
  'aa16-finish',
  'A purple leather ledger with gold corners and a red ribbon bookmark, its cover stamped in gold with a columned temple front, with small glints and check marks around it.',
  emblemColumns,
);

export const art: LessonArtSet = { opener: aa16Opener, backdrop: aaBackdrop, finish: aa16Finish };
