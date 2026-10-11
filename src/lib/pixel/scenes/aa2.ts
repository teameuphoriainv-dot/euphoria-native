/**
 * Applied Accounting lesson 2, Financial Ratios: X-Raying a Company. The bookkeeper turns doctor.
 *
 * A lightbox on the hall wall holds an X-ray of the company's books, and what shows through are four
 * bones standing on a baseline at four heights, a bar chart of liquidity, profitability, leverage and
 * efficiency. The bookkeeper, a doctor's head mirror on his eyeshade, points at the shortest-but-one
 * with a brass pointer; a sheet with a percent figure and a stack of ledgers wait on the desk under a
 * plate reading RATIOS. No banker's lamp tonight: the lightbox is the light. Moving: a scan line
 * sweeps the film, the film's edge glows and dims, the pilot light blinks, the mirror catches a glint,
 * the bookkeeper blinks and dust rises.
 */
import type { PixelSprite } from '../types';
import { AA_AT, AA_PALETTE, aaBlink, aaBookkeeper, aaCompose, aaDesk, aaGlint, aaHandRest, aaInkwell, aaMote, aaPlaque, aaText } from './aa-kit';
import { aaFloor } from './aa-kit-a';
import { aaKeepsake } from './aa1-finish';
import { aaBackdrop } from './aa-backdrop';
import type { LessonArtSet, SceneArt } from './types';

const sprite = (id: string, rows: string[], palette?: Record<string, string>): PixelSprite =>
  ({ id, name: id, tags: ['aa', 'aa2'], rows, ...(palette ? { palette } : {}) });

/** The X-ray film, 30 x 22: four bones on a baseline, lit blue from behind. */
const film = (() => {
  const W = 30;
  const H = 22;
  const cells: string[][] = Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => (x === 0 || y === 0 || x === W - 1 || y === H - 1 ? 'B' : 'b')));
  for (let x = 2; x < W - 2; x++) cells[19][x] = 'B';
  const knob = ['aa.ac', 'aaaac', '.aac.'];
  ([[2, 14], [9, 9], [16, 17], [23, 11]] as const).forEach(([x0, h]) => {
    const bone = [...knob, ...Array.from({ length: h - 6 }, () => '..ac.'), ...[...knob].reverse()];
    bone.forEach((r, dy) => [...r].forEach((ch, dx) => { if (ch !== '.') cells[19 - h + dy][x0 + dx] = ch; }));
  });
  [6, 7, 22, 23].forEach((x) => { cells[0][x] = 'x'; });
  return cells.map((r) => r.join(''));
})();

/** The lightbox, 34 x 27: a steel case, the film clipped in, a switch and a pilot light below it. */
const lightbox = sprite('aa2-lightbox', [
  'D'.repeat(34),
  `D${'x'.repeat(32)}D`,
  ...film.map((r) => `Dx${r}kD`),
  `Dx${'k'.repeat(31)}D`,
  `D${'X'.repeat(24)}OyOXrXXXD`,
  `D${'k'.repeat(32)}D`,
  'D'.repeat(34),
], AA_PALETTE);

/** The pointer from the bookkeeper's raised fist to the top of the fourth bone. */
const pointer = (() => {
  const cells = Array.from({ length: 14 }, () => Array.from({ length: 15 }, () => '.'));
  for (let i = 0; i <= 14; i++) cells[Math.round((i * 13) / 14)][i] = i === 0 ? 'y' : 'G';
  return sprite('aa2-pointer', cells.map((r) => r.join('')));
})();

/** His right arm, raised, the fist round the pointer's end and the sleeve back to his shoulder. */
const arm = sprite('aa2-arm', [
  '.SSM.....',
  '.SSMM....',
  '..PPPp...',
  '...PPPp..',
  '....PPPp.',
  '.....PPPp',
  '......PPp',
], AA_PALETTE);

/** A doctor's head mirror, worn on the eyeshade. */
const headMirror = sprite('aa2-head-mirror', [
  '.DDDD.',
  'DaaacD',
  'DaaccD',
  'DaccXD',
  '.DDDD.',
], AA_PALETTE);

/** Three closed ledgers lying flat, spines out, gilt bands on the spines. */
const ledgerStack = sprite('aa2-ledger-stack', [
  '..EEEEEEEEEEEEEE.',
  '..EPPPyGPPPPPPPE.',
  '..EppppppppppppE.',
  '1111111111111111.',
  '1RRRRRRRyGRRRRR1.',
  '1rrrrrrrrrrrrrr1.',
  '.KKKKKKKKKKKKKKKK',
  '.KbbyGbbbbbbbbbbK',
  '.KKKKKKKKKKKKKKKK',
]);

/** A worksheet with a percent figure on it. */
const sheet = aaCompose('aa2-sheet', 9, 7, 'a', [
  { sprite: sprite('aa2-sheet-shade', ['........c', '........c', '........c', '........c', '........c', '........c', 'ccccccccc'], AA_PALETTE), x: 0, y: 0 },
  { sprite: aaText('aa2-sheet-pct', '%', 'k'), x: 1, y: 1 },
  { sprite: sprite('aa2-sheet-lines', ['kkk', '...', 'kk.'], AA_PALETTE), x: 5, y: 2 },
]);

const LIGHTBOX = { x: 3, y: 4 };
const FILM = { x: LIGHTBOX.x + 2, y: LIGHTBOX.y + 2 };
const KEEPER = { x: 52, y: 16 };
const MIRROR = { x: KEEPER.x + 6, y: KEEPER.y + 1 };

const base = aaCompose('aa2-opener-base', 80, 60, 'k', [
  { sprite: aaFloor('aa2-floor', 80, [[5, 76]]), x: 0, y: 49 },
  { sprite: lightbox, ...LIGHTBOX },
  { sprite: aaPlaque('aa2-opener-plate', 'RATIOS'), x: 48, y: 3 },
  { sprite: aaBookkeeper, ...KEEPER },
  { sprite: headMirror, ...MIRROR },
  { sprite: pointer, x: 33, y: 14 },
  { sprite: arm, x: 46, y: 27 },
  { sprite: aaDesk, x: 4, y: 36 },
  { sprite: ledgerStack, x: 9, y: 33 },
  { sprite: sheet, x: 55, y: 38 },
  { sprite: aaHandRest, x: KEEPER.x + 12, y: 36 },
  { sprite: aaInkwell, x: 70, y: 39 },
]);

const scanLine = sprite('aa2-scan-line', ['T'.repeat(28)]);
const filmGlow = sprite('aa2-film-glow', film.map((r, y) => [...r].map((_, x) => (x === 0 || y === 0 || x === 29 || y === 21 ? 'a' : '.')).join('')), AA_PALETTE);
const pilot = sprite('aa2-pilot', ['R']);

export const aa2Opener: SceneArt = {
  id: 'aa2-opener',
  label: "A bookkeeper wearing a doctor's head mirror points at an X-ray on a lightbox, where four bones stand like a bar chart of a company's ratios, under a brass plate reading RATIOS.",
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: scanLine, x: FILM.x + 1, y: FILM.y + 20, motion: { kind: 'bob', amp: 18, periodMs: 4400 } },
    { sprite: filmGlow, ...FILM, motion: { kind: 'twinkle', periodMs: 2600, min: 0.2 } },
    { sprite: pilot, x: LIGHTBOX.x + 29, y: LIGHTBOX.y + 25, motion: { kind: 'twinkle', periodMs: 1800, min: 0.15 } },
    { sprite: aaGlint, x: MIRROR.x - 1, y: MIRROR.y - 1 },
    { sprite: aaBlink, x: KEEPER.x + AA_AT.blinkOnBookkeeper.x, y: KEEPER.y + AA_AT.blinkOnBookkeeper.y },
    { sprite: aaMote, x: 39, y: 33, motion: { kind: 'rise', amp: 5, periodMs: 3000 } },
    { sprite: aaMote, x: 27, y: 32, motion: { kind: 'rise', amp: 4, periodMs: 3500, phase: 0.5 } },
  ],
};

/** Lesson 2 emblem: a gilt percent sign, the unit most ratios are read in. */
const emblemPercent = sprite('aa-emblem-percent', [
  '............OO..',
  '.OOOO......OyGO.',
  'OyGGgO....OyGO..',
  'OG..gO...OyGO...',
  'OG..gO..OyGO....',
  'OggggO.OyGO.....',
  '.OOOO.OyGO......',
  '.....OyGO.......',
  '....OyGO........',
  '...OyGO....OOOO.',
  '..OyGO....OyGGgO',
  '.OyGO.....OG..gO',
  'OyGO......OG..gO',
  '.OO.......OggggO',
  '...........OOOO.',
  '................',
]);

export const aa2Finish = aaKeepsake(
  'aa2-finish',
  'A purple leather ledger with gold corners and a red ribbon bookmark, its cover stamped in gold with a percent sign, with small glints and check marks around it.',
  emblemPercent,
);

export const art: LessonArtSet = { opener: aa2Opener, backdrop: aaBackdrop, finish: aa2Finish };
