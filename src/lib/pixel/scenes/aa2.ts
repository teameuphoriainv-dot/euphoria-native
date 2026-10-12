/**
 * Applied Accounting lesson 2, Financial Ratios: X-Raying a Company. The bookkeeper turns doctor.
 *
 * A clinic, not the desk: a big lightbox on the wall holds an X-ray of the company's books, and what
 * shows through are four bones standing on a baseline at four heights, a bar chart of liquidity,
 * profitability, leverage and efficiency. The bookkeeper stands beside it in a doctor's head mirror
 * and stethoscope and points a brass pointer at the fourth bone, under a plate reading RATIOS. The
 * company's ledgers wait on a steel trolley, its chart pinned above them: A/B, because a ratio is one
 * figure over another (a current ratio of 1.05, debt to equity of 2.0x; only margins and returns read
 * as percents). Moving: a scan line sweeps the film, the film's edge glows and dims, the pilot light
 * blinks, the mirror catches a glint, the bookkeeper blinks and dust rises in the light.
 */
import type { PixelSprite } from '../types';
import { AA_AT, AA_PALETTE, aaBlink, aaCompose, aaGlint, aaMote, aaPlaque, aaText } from './aa-kit';
import { aaFloor } from './aa-kit-a';
import { aaBookkeeperStanding } from './aa-kit-b';
import { aaKeepsake } from './aa1-finish';
import { aaBackdrop } from './aa-backdrop';
import type { LessonArtSet, SceneArt } from './types';

const sprite = (id: string, rows: string[], palette?: Record<string, string>): PixelSprite =>
  ({ id, name: id, tags: ['aa', 'aa2'], rows, ...(palette ? { palette } : {}) });

/** The X-ray film, 40 x 26: four bones on a baseline, lit blue from behind. */
const FILM_W = 40;
const FILM_H = 26;
const film = (() => {
  const cells: string[][] = Array.from({ length: FILM_H }, (_, y) => Array.from({ length: FILM_W }, (_, x) => (x === 0 || y === 0 || x === FILM_W - 1 || y === FILM_H - 1 ? 'B' : 'b')));
  for (let x = 2; x < FILM_W - 2; x++) cells[22][x] = 'B';
  const knob = ['aa.ac', 'aaaac', '.aac.'];
  ([[4, 16], [13, 10], [22, 19], [31, 13]] as const).forEach(([x0, h]) => {
    const bone = [...knob, ...Array.from({ length: h - 6 }, () => '..ac.'), ...[...knob].reverse()];
    bone.forEach((r, dy) => [...r].forEach((ch, dx) => { if (ch !== '.') cells[22 - h + dy][x0 + dx] = ch; }));
  });
  [8, 9, 30, 31].forEach((x) => { cells[0][x] = 'x'; });
  return cells.map((r) => r.join(''));
})();

/** The lightbox, 44 x 32: a steel case, the film clipped in, a switch and a pilot light below it. */
const lightbox = sprite('aa2-lightbox', [
  'D'.repeat(FILM_W + 4),
  `D${'x'.repeat(FILM_W + 2)}D`,
  ...film.map((r) => `Dx${r}kD`),
  `Dx${'k'.repeat(FILM_W + 1)}D`,
  `D${'X'.repeat(FILM_W - 6)}OyOXrXXXD`,
  `D${'k'.repeat(FILM_W + 2)}D`,
  'D'.repeat(FILM_W + 4),
], AA_PALETTE);

/**
 * His right arm raised toward the film, the fist round the pointer's end, the sleeve down to his
 * shoulder, and the wall and skirting painted back where the arm hung (aaBookkeeperStanding's
 * columns 1 and 2).
 */
const arm = sprite('aa2-arm', [
  '.SS......',
  'SSM......',
  '.PPp.....',
  '.PPp.....',
  '..PPp....',
  '..PPp....',
  '...PPp...',
  '...PPp...',
  '....PPp..',
  '....PPp..',
  '.....PPp.',
  '.....PPp.',
  '......PPp',
  '......PPp',
  '......PPp',
  '......kk.',
  '......kk.',
  '......kk.',
  '......kk.',
  '......kk.',
  '......kk.',
  '......kk.',
  '......gg.',
], AA_PALETTE);

/** A doctor's head mirror, worn on the eyeshade. */
const headMirror = sprite('aa2-head-mirror', [
  '.DDDD.',
  'DaaacD',
  'DaaccD',
  'DaccXD',
  '.DDDD.',
], AA_PALETTE);

/** A stethoscope round his neck, over the jumper: two grey tubes, the gilt chest piece on the left one. */
const stethoscope = sprite('aa2-stethoscope', [
  '.x......x',
  '.x......x',
  '.x......x',
  '.x......x',
  '.x......X',
  'yG.......',
  'Gg.......',
]);

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

/** A steel clinic trolley, 17 x 16: two shelves on four legs, casters on the boards. */
const trolley = sprite('aa2-trolley', [
  'DDDDDDDDDDDDDDDDD',
  'XxxxxxxxxxxxxxxxX',
  'DDDDDDDDDDDDDDDDD',
  '.D.............D.',
  '.D.............D.',
  '.D.............D.',
  '.D.............D.',
  '.D.............D.',
  'DDDDDDDDDDDDDDDDD',
  'XxxxxxxxxxxxxxxxX',
  'DDDDDDDDDDDDDDDDD',
  '.D.............D.',
  '.D.............D.',
  '.D.............D.',
  'DXD...........DXD',
  '.D.............D.',
], AA_PALETTE);

/** The patient's chart, 15 x 15, on a clip: A/B, one figure over another. */
const chart = aaCompose('aa2-chart', 15, 15, '.', [
  { sprite: sprite('aa2-chart-sheet', [
    '.....OyGO......',
    '.....OggO......',
    `${'a'.repeat(14)}c`,
    ...Array.from({ length: 11 }, () => `${'a'.repeat(14)}c`),
    'c'.repeat(15),
  ], AA_PALETTE), x: 0, y: 0 },
  { sprite: aaText('aa2-chart-ratio', 'A/B', 'b'), x: 2, y: 4 },
  { sprite: sprite('aa2-chart-lines', ['kkkkkkkkk', '.........', 'kkkkkk...'], AA_PALETTE), x: 2, y: 10 },
]);

const LIGHTBOX = { x: 17, y: 11 };
const FILM = { x: LIGHTBOX.x + 2, y: LIGHTBOX.y + 2 };
const KEEPER = { x: 62, y: 25 };
const MIRROR = { x: KEEPER.x + 6, y: KEEPER.y + 1 };
const ARM = { x: KEEPER.x - 5, y: KEEPER.y + 2 };
/** The pointer runs at 45 degrees from the fist to just over the fourth bone's top. */
const POINTER = { x: ARM.x - 4, y: ARM.y - 6, len: 6 };
const pointer = sprite('aa2-pointer', Array.from({ length: POINTER.len }, (_, dy) =>
  Array.from({ length: POINTER.len }, (_, dx) => (dx === dy ? (dx ? 'G' : 'y') : '.')).join('')));
const TROLLEY = { x: 0, y: 40 };

const base = aaCompose('aa2-opener-base', 80, 60, 'k', [
  { sprite: aaFloor('aa2-floor', 80, [[0, 16], [63, 78]]), x: 0, y: 49 },
  { sprite: aaPlaque('aa2-opener-plate', 'RATIOS'), x: LIGHTBOX.x + 9, y: 1 },
  { sprite: lightbox, ...LIGHTBOX },
  { sprite: chart, x: 1, y: 14 },
  { sprite: trolley, ...TROLLEY },
  { sprite: ledgerStack, x: TROLLEY.x, y: TROLLEY.y - 9 },
  { sprite: aaBookkeeperStanding, ...KEEPER },
  { sprite: stethoscope, x: KEEPER.x + 4, y: KEEPER.y + 15 },
  { sprite: headMirror, ...MIRROR },
  { sprite: pointer, x: POINTER.x, y: POINTER.y },
  { sprite: arm, ...ARM },
]);

const scanLine = sprite('aa2-scan-line', ['T'.repeat(FILM_W - 2)]);
const filmGlow = sprite('aa2-film-glow', film.map((r, y) => [...r].map((_, x) => (x === 0 || y === 0 || x === FILM_W - 1 || y === FILM_H - 1 ? 'a' : '.')).join('')), AA_PALETTE);
const pilot = sprite('aa2-pilot', ['R']);

export const aa2Opener: SceneArt = {
  id: 'aa2-opener',
  label: "A bookkeeper in a doctor's head mirror and stethoscope stands beside a big lightbox and points a brass pointer at an X-ray where four bones of different heights stand like a bar chart of a company's ratios, under a brass plate reading RATIOS, with the company's ledgers on a trolley.",
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: scanLine, x: FILM.x + 1, y: FILM.y + 24, motion: { kind: 'bob', amp: 22, periodMs: 4800 } },
    { sprite: filmGlow, ...FILM, motion: { kind: 'twinkle', periodMs: 2600, min: 0.2 } },
    { sprite: pilot, x: LIGHTBOX.x + FILM_W - 1, y: LIGHTBOX.y + FILM_H + 3, motion: { kind: 'twinkle', periodMs: 1800, min: 0.15 } },
    { sprite: aaGlint, x: MIRROR.x - 1, y: MIRROR.y - 1 },
    { sprite: aaBlink, x: KEEPER.x + AA_AT.blinkOnBookkeeper.x, y: KEEPER.y + AA_AT.blinkOnBookkeeper.y },
    { sprite: aaMote, x: 30, y: 46, motion: { kind: 'rise', amp: 5, periodMs: 3000 } },
    { sprite: aaMote, x: 47, y: 45, motion: { kind: 'rise', amp: 4, periodMs: 3500, phase: 0.5 } },
  ],
};

/**
 * Lesson 2 emblem: the opener's X-ray in miniature. Four white bones at four heights on a gilt
 * baseline, each with notched knuckles at both ends, and the film's two clips across the top.
 */
const emblemXray = (() => {
  const cells = Array.from({ length: 16 }, () => Array.from({ length: 15 }, () => '.'));
  ([[0, 9], [4, 6], [8, 11], [12, 8]] as const).forEach(([x0, h]) => {
    for (let i = 0; i < h; i++) {
      const row = i === 0 || i === h - 1 ? 'a.c' : i === 1 || i === h - 2 ? 'aac' : '.a.';
      [...row].forEach((ch, dx) => { if (ch !== '.') cells[14 - h + i][x0 + dx] = ch; });
    }
  });
  for (let x = 0; x < 15; x++) cells[14][x] = 'g';
  [3, 10].forEach((x) => { cells[0][x] = 'y'; cells[0][x + 1] = 'G'; cells[1][x] = 'G'; cells[1][x + 1] = 'g'; });
  return sprite('aa-emblem-xray', cells.map((r) => r.join('')), AA_PALETTE);
})();

export const aa2Finish = aaKeepsake(
  'aa2-finish',
  'A purple leather ledger with gold corners and a red ribbon bookmark, its cover stamped with an X-ray of four white bones of different heights standing on a gold line like a bar chart, clipped at the top, with small glints and check marks around it.',
  emblemXray,
);

export const art: LessonArtSet = { opener: aa2Opener, backdrop: aaBackdrop, finish: aa2Finish };
