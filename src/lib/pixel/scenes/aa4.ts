/**
 * Applied Accounting lesson 4, The Balance Sheet Decoded: what the company owns against who has a
 * claim on it, on one date.
 *
 * The hall's strongroom. A big brass scale stands on the desk with a gold volume lettered A in one pan
 * and a red volume L on a green volume E in the other, the beam dead level: assets equal liabilities
 * plus equity. Behind it a round steel vault door (a fortress balance sheet), and a tear-off calendar
 * at the 31st, because the sheet is a snapshot on one day. Moving: a coin lands in both pans at once,
 * the vault's wheel turns, the calendar's corner lifts, light runs along the beam, dust rises.
 */
import type { PixelSprite } from '../types';
import { AA_PALETTE, aaCompose, aaDesk, aaGlint, aaMote, aaText } from './aa-kit';
import { aaFloor } from './aa-kit-a';
import { aaKeepsake } from './aa1-finish';
import { aaBackdrop } from './aa-backdrop';
import type { LessonArtSet, SceneArt } from './types';

const sprite = (id: string, rows: string[], palette?: Record<string, string>): PixelSprite =>
  ({ id, name: id, tags: ['aa', 'aa4'], rows, ...(palette ? { palette } : {}) });

/** A volume standing face on, `letter` on its cover: [outline, light edge, cover, shade]. */
const volume = (id: string, h: number, ramp: string, letter: string, ink: string) => {
  const [o, l, f, s] = [...ramp];
  const rows = Array.from({ length: h }, (_, y) =>
    (y === 0 || y === h - 1 ? o.repeat(9) : `${o}${l}${f.repeat(5)}${s}${o}`));
  return aaCompose(id, 9, h, '.', [
    { sprite: sprite(`${id}-cover`, rows, AA_PALETTE), x: 0, y: 0 },
    { sprite: aaText(`${id}-letter`, letter, ink), x: 3, y: Math.floor((h - 5) / 2) },
  ]);
};

/** A round steel vault door, 33 across: lit rim, twelve brass bolts, a panel seam, a hub. */
const vault = (() => {
  const R = 16;
  const cells: string[][] = Array.from({ length: 33 }, (_, y) => Array.from({ length: 33 }, (_, x) => {
    const d = Math.hypot(x - R, y - R);
    if (d > R + 0.5) return '.';
    if (d > R - 0.5) return 'K';
    if (d > R - 2.5) return x + y < 26 ? 'x' : 'X';
    if (d > R - 3.5 || (d > 8.5 && d <= 9.5)) return 'K';
    return d <= 3.5 ? 'X' : 'D';
  }));
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    cells[Math.round(R + Math.sin(a) * 14.5)][Math.round(R + Math.cos(a) * 14.5)] = i >= 6 && i <= 9 ? 'y' : 'G';
  }
  return sprite('aa4-vault', cells.map((r) => r.join('')));
})();

/** The scale, 49 x 34: beam, post and stepped foot, two pans on chains (contents stamped after). */
const SCALE_W = 49;
const scale = (() => {
  const cells = Array.from({ length: 34 }, () => Array.from({ length: SCALE_W }, () => '.'));
  const put = (x: number, y: number, ch: string) => { if (x >= 0 && x < SCALE_W && y >= 0 && y < 34) cells[y][x] = ch; };
  const pivot = 24;
  ['yGg', 'yGg'].forEach((r, y) => [...r].forEach((ch, dx) => put(pivot - 1 + dx, y, ch)));
  for (let x = 4; x <= 44; x++) { put(x, 2, 'y'); put(x, 3, 'g'); }
  put(3, 2, 'O'); put(3, 3, 'O'); put(45, 2, 'O'); put(45, 3, 'O');
  for (let y = 4; y < 30; y++) { put(pivot - 1, y, 'y'); put(pivot, y, 'G'); put(pivot + 1, y, 'g'); }
  ['....OyGGGgO....', '..OyGGGGGGGgO..', '.OyGGGGGGGGGgO.', 'OOOOOOOOOOOOOOO'].forEach((r, dy) =>
    [...r].forEach((ch, dx) => { if (ch !== '.') put(pivot - 7 + dx, 29 + dy + 1, ch); }));
  [7, 41].forEach((cx) => {
    for (let i = 0; i <= 18; i++) { const dx = Math.round((i * 6) / 18); put(cx - dx, 4 + i, 'O'); put(cx + dx, 4 + i, 'O'); }
    ['OyGGGGGGGGGGGgO', '.OgggggggggggO.', '..OOOOOOOOOOO..'].forEach((r, dy) =>
      [...r].forEach((ch, dx) => { if (ch !== '.') put(cx - 7 + dx, 23 + dy, ch); }));
  });
  return sprite('aa4-scale', cells.map((r) => r.join('')));
})();

/** The calendar, torn to the 31st. */
const calendar = aaCompose('aa4-calendar', 11, 10, '.', [
  { sprite: sprite('aa4-calendar-sheet', ['1rrrrrrrrr1', '1RRRRRRRRR1', '1rrrrrrrrr1', ...Array.from({ length: 6 }, () => 'caaaaaaaaac'), 'ccccccccccc'], AA_PALETTE), x: 0, y: 0 },
  { sprite: aaText('aa4-calendar-day', '31', 'k'), x: 2, y: 4 },
]);

const SCALE = { x: 6, y: 8 };
const LEFT_PAN = { x: SCALE.x + 7, y: SCALE.y + 23 };
const RIGHT_PAN = { x: SCALE.x + 41, y: SCALE.y + 23 };
const VAULT = { x: 54, y: 4 };

const base = aaCompose('aa4-opener-base', 80, 60, 'k', [
  { sprite: aaFloor('aa4-floor', 80, [[5, 76]]), x: 0, y: 49 },
  { sprite: vault, ...VAULT },
  { sprite: calendar, x: 39, y: 0 },
  { sprite: aaDesk, x: 4, y: 36 },
  { sprite: scale, ...SCALE },
  { sprite: volume('aa4-assets', 14, 'OyGg', 'A', 'K'), x: LEFT_PAN.x - 4, y: LEFT_PAN.y - 14 },
  { sprite: volume('aa4-liabilities', 7, '1sRr', 'L', 'a'), x: RIGHT_PAN.x - 4, y: RIGHT_PAN.y - 14 },
  { sprite: volume('aa4-equity', 7, 'nmNn', 'E', 'K'), x: RIGHT_PAN.x - 4, y: RIGHT_PAN.y - 7 },
]);

/** A coin falls onto each pan's load at the same moment: a new asset always brings its claim. */
const coinDrop: PixelSprite = {
  ...sprite('aa4-coin-drop', ['...', '...', '...', '...'], AA_PALETTE),
  frames: [
    ['...', '...', '...', '...'],
    ['.y.', '...', '...', '...'],
    ['...', '.y.', '...', '...'],
    ['...', '...', '.y.', '...'],
    ['...', '...', '...', 'yGg'],
    ['...', '...', '...', 'yag'],
    ['...', '...', '...', 'yGg'],
    ['...', '...', '...', '...'],
    ['...', '...', '...', '...'],
    ['...', '...', '...', '...'],
  ],
  frameMs: 300,
};

/** The vault's wheel turning, four spokes and their knobs. */
const WHEEL_PLUS = ['.....y.....', '.....G.....', '.....G.....', '.....G.....', '....OGO....', 'yGGGGOGGGGg',
  '....OgO....', '.....g.....', '.....g.....', '.....g.....', '.....g.....'];
const WHEEL_CROSS = ['y.........y', '.G.......G.', '..G.....G..', '...G...G...', '....OGO....', '....GOg....',
  '....OgO....', '...g...g...', '..g.....g..', '.g.......g.', 'g.........g'];
const wheel: PixelSprite = { ...sprite('aa4-wheel', WHEEL_PLUS), frames: [WHEEL_PLUS, WHEEL_CROSS], frameMs: 900 };

/** The calendar's bottom corner lifting off the wall. */
const corner: PixelSprite = {
  ...sprite('aa4-corner', ['...', '...', '...'], AA_PALETTE),
  frames: [['...', '...', '...'], ['...', '...', '...'], ['...', '..k', '.ck'], ['..k', '.ck', 'ckk'], ['...', '..k', '.ck']],
  frameMs: 520,
};

export const aa4Opener: SceneArt = {
  id: 'aa4-opener',
  label: 'A brass scale on a desk balances a gold volume marked A against a red volume L on a green volume E, in front of a round steel vault door, with a calendar on the wall at the 31st.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: coinDrop, x: LEFT_PAN.x - 1, y: LEFT_PAN.y - 18 },
    { sprite: coinDrop, x: RIGHT_PAN.x - 1, y: RIGHT_PAN.y - 18 },
    { sprite: wheel, x: VAULT.x + 11, y: VAULT.y + 11 },
    { sprite: corner, x: 47, y: 7 },
    { sprite: aaGlint, x: SCALE.x + 22, y: SCALE.y },
    { sprite: aaMote, x: 30, y: 33, motion: { kind: 'rise', amp: 5, periodMs: 3100 } },
    { sprite: aaMote, x: 60, y: 30, motion: { kind: 'rise', amp: 5, periodMs: 3700, phase: 0.5 } },
  ],
};

/** Lesson 4 emblem: a gilt balance, level, a pan on each side. */
const emblemScale = sprite('aa-emblem-scale', [
  '................',
  '.......yG.......',
  '.gGGGGGyGGGGGGg.',
  '..g....yG....g..',
  '.g.g...yG...g.g.',
  '.g.g...yG...g.g.',
  'g...g..yG..g...g',
  'gyGGg..yG..gyGGg',
  '.ggg...yG...ggg.',
  '.......yG.......',
  '.......yG.......',
  '.......yG.......',
  '.....OyGGgO.....',
  '....OyGGGGgO....',
  '...OOOOOOOOOO...',
  '................',
]);

export const aa4Finish = aaKeepsake(
  'aa4-finish',
  'A purple leather ledger with gold corners and a red ribbon bookmark, its cover stamped in gold with a level balance scale, with small glints and check marks around it.',
  emblemScale,
);

export const art: LessonArtSet = { opener: aa4Opener, backdrop: aaBackdrop, finish: aa4Finish };
