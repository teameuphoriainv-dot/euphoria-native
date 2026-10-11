/**
 * Applied Accounting lesson 13, Depreciation & Asset Management: an asset's cost spread over the
 * years it is useful, until only the salvage value is left.
 *
 * The same volume five times along a console, one for each year of its useful life, numbered 1 to 5
 * on their labels. Year 1 is new orchid leather and bright gilt; each year after is duller, until year
 * 5 is grey, its gilt gone, dust on its head and a cobweb strung from it to the wall. Above them a
 * gilt-framed chart draws the book value falling in a straight line, a point over each volume, down to
 * the dashed salvage line, under a plate reading DEPRECIATION. Moving: the chart's points light up
 * year by year, the spider rides its thread, dust lifts off the old volumes, gilt glints on the new one.
 */
import type { PixelSprite } from '../types';
import { AA_PALETTE, aaCompose, aaGlint, aaPlaque, aaText } from './aa-kit';
import { aaFloor, aaFrame } from './aa-kit-a';
import { aaKeepsake } from './aa1-finish';
import { aaBackdrop } from './aa-backdrop';
import type { LessonArtSet, SceneArt } from './types';

const sprite = (id: string, rows: string[], palette?: Record<string, string>): PixelSprite =>
  ({ id, name: id, tags: ['aa', 'aa13'], rows, ...(palette ? { palette } : {}) });

/** Where each year's volume stands, and its point on the chart above it. */
const YEAR_X = [15, 28, 41, 54, 67];
const YEAR_Y = [14, 16, 18, 20, 22];
const SALVAGE_Y = 22;
const AXIS_Y = 23;

/**
 * One volume, 10 x 14, spine out, its year on a dark label. Letters: o outline, h the lit edge, L
 * leather, s the shaded edge, b B d the gilt bands light to dark, k the label, n the numeral.
 */
const SPINE = [
  '.oooooooo.',
  'ohLLLLLLso',
  'obBBBBBBdo',
  'ohLLLLLLso',
  'ohkkkkkkso',
  ...Array.from({ length: 5 }, () => 'ohk___kkso'),
  'ohkkkkkkso',
  'obBBBBBBdo',
  'ohLLLLLLso',
  'oooooooooo',
];
/** Each year a step older: the leather fades, the gilt dulls and at last goes grey. */
const AGES: Record<string, string>[] = [
  { o: 'E', h: 'q', L: 'P', s: 'p', b: 'y', B: 'G', d: 'g', k: 'K', n: 'y' },
  { o: 'E', h: 'P', L: 'P', s: 'p', b: 'G', B: 'G', d: 'g', k: 'K', n: 'G' },
  { o: 'E', h: 'P', L: 'p', s: 'E', b: 'g', B: 'g', d: 'O', k: 'K', n: 'g' },
  { o: 'E', h: 'p', L: 'E', s: 'D', b: 'O', B: 'O', d: 'D', k: 'K', n: 'O' },
  { o: 'D', h: 'x', L: 'X', s: 'D', b: 'D', B: 'D', d: 'D', k: 'k', n: 'D' },
];
const volume = (year: number) => {
  const ink = AGES[year - 1];
  const digit = aaText(`aa13-year-${String(year)}-digit`, String(year), 'n').rows;
  let row = 0;
  return sprite(`aa13-volume-${String(year)}`, SPINE.map((r) => {
    const line = r.includes('_') ? r.replace('___', digit[row++].replace(/\./g, 'k')) : r;
    return [...line].map((ch) => (ch === '.' ? '.' : ink[ch])).join('');
  }));
};

/** Dust settled on the old volumes' heads, and a frayed corner on the oldest. */
const dust = sprite('aa13-dust', ['.x.x..x.x.'], AA_PALETTE);

/** The chart, 68 x 17: axes, the dashed salvage line, the book value falling straight through a point a year. */
const CHART = { x: 6, y: 10 };
const chart = (() => {
  const cells: string[][] = Array.from({ length: 13 }, () => Array.from({ length: 64 }, () => '.'));
  const put = (x: number, y: number, ch: string) => {
    cells[y - CHART.y - 2][x - CHART.x - 2] = ch;
  };
  for (let x = 10; x <= 70; x += 2) put(x, SALVAGE_Y, 'X');
  for (let x = 9; x <= 70; x++) put(x, AXIS_Y, 'c');
  for (let y = 13; y <= AXIS_Y; y++) put(9, y, 'c');
  for (let x = YEAR_X[0]; x <= YEAR_X[4]; x++) {
    const y = Math.round(YEAR_Y[0] + ((x - YEAR_X[0]) * (YEAR_Y[4] - YEAR_Y[0])) / (YEAR_X[4] - YEAR_X[0]));
    put(x, y, 'G');
    put(x, y + 1, 'g');
  }
  YEAR_X.forEach((x, i) => {
    put(x, YEAR_Y[i], 'y');
    put(x, AXIS_Y + 1, 'c');
  });
  return aaCompose('aa13-chart', 68, 17, '.', [
    { sprite: aaFrame('aa13-chart-frame', 68, 17, 'K'), x: 0, y: 0 },
    { sprite: sprite('aa13-chart-lines', cells.map((r) => r.join('')), AA_PALETTE), x: 2, y: 2 },
  ]);
})();

/** A long console for the volumes, 72 x 15: a lit edge, three drawers, four legs. */
const consoleTable = sprite('aa13-console', [
  'O'.repeat(72),
  `y${'G'.repeat(70)}g`,
  'O'.repeat(72),
  ...[0, 1, 2].map((r) => `O${Array.from({ length: 3 }, () => (r === 1 ? `g${'O'.repeat(10)}yy${'O'.repeat(10)}` : `g${'O'.repeat(22)}`)).join('')}${'O'.repeat(2)}`),
  'O'.repeat(72),
  ...Array.from({ length: 8 }, () => `.OgO${'.'.repeat(18)}OgO${'.'.repeat(22)}OgO${'.'.repeat(18)}OgO.`),
]);

/** A cobweb strung from the oldest volume's head to the wall. */
const cobweb = sprite('aa13-cobweb', [
  'X......',
  '.X..X..',
  '..XX.X.',
  'XXXXXXX',
  '..X.X..',
  '.X...X.',
  'X.....X',
], AA_PALETTE);

/** The spider on its thread, riding up and down. */
const spider = sprite('aa13-spider', ['.x.', '.x.', '.x.', '.x.', 'xXx', 'XRX', '.X.'], AA_PALETTE);

const VOLUME_Y = 28;

const base = aaCompose('aa13-opener-base', 80, 60, 'k', [
  { sprite: aaFloor('aa13-floor', 80, [[4, 75]]), x: 0, y: 49 },
  { sprite: aaPlaque('aa13-opener-plate', 'DEPRECIATION'), x: 14, y: 0 },
  { sprite: chart, ...CHART },
  { sprite: cobweb, x: YEAR_X[4] + 5, y: VOLUME_Y - 3 },
  { sprite: consoleTable, x: 4, y: 42 },
  ...YEAR_X.map((x, i) => ({ sprite: volume(i + 1), x: x - 5, y: VOLUME_Y })),
  { sprite: dust, x: YEAR_X[3] - 5, y: VOLUME_Y },
  { sprite: dust, x: YEAR_X[4] - 5, y: VOLUME_Y },
]);

/** The year's point lit on the chart, one year after another, as a ring round the gold point. */
const yearLight: PixelSprite = (() => {
  const W = YEAR_X[4] - YEAR_X[0] + 3;
  const H = YEAR_Y[4] - YEAR_Y[0] + 3;
  const ring = (i: number) => Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => {
    const dx = x - (YEAR_X[i] - YEAR_X[0] + 1);
    const dy = y - (YEAR_Y[i] - YEAR_Y[0] + 1);
    return Math.abs(dx) + Math.abs(dy) === 1 ? 'a' : '.';
  }).join(''));
  return { ...sprite('aa13-year-light', ring(0), AA_PALETTE), frames: [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 4].map(ring), frameMs: 520 };
})();

const greyMote = sprite('aa13-grey-mote', ['x'], AA_PALETTE);

export const aa13Opener: SceneArt = {
  id: 'aa13-opener',
  label: 'Five copies of one ledger stand in a row, numbered 1 to 5, each older than the last until the fifth is grey, dusty and cobwebbed, under a gilt chart of book value falling in a straight line and a brass plate reading DEPRECIATION.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: yearLight, x: YEAR_X[0] - 1, y: YEAR_Y[0] - 1 },
    { sprite: spider, x: YEAR_X[4] + 7, y: VOLUME_Y, motion: { kind: 'bob', amp: 2, periodMs: 2600 } },
    { sprite: greyMote, x: YEAR_X[3] - 2, y: VOLUME_Y - 1, motion: { kind: 'rise', amp: 5, periodMs: 3400 } },
    { sprite: greyMote, x: YEAR_X[4] + 1, y: VOLUME_Y - 1, motion: { kind: 'rise', amp: 4, periodMs: 3900, phase: 0.5 } },
    { sprite: aaGlint, x: YEAR_X[0] + 1, y: VOLUME_Y, motion: { kind: 'twinkle', periodMs: 2600, min: 0.5 } },
  ],
};

/** Lesson 13 emblem: a gilt gear, the plant and machinery the lesson writes down. */
const emblemGear = sprite('aa-emblem-gear', Array.from({ length: 16 }, (_, y) => Array.from({ length: 16 }, (_, x) => {
  const d = Math.hypot(x - 7.5, y - 7.5);
  const square = (lo: number, hi: number, v: number) => v >= lo && v <= hi;
  const upright = (square(6, 9, x) && (y <= 2 || y >= 13)) || (square(6, 9, y) && (x <= 2 || x >= 13));
  const corner = (square(2, 4, x) || square(11, 13, x)) && (square(2, 4, y) || square(11, 13, y));
  if (d <= 1.6) return '.';
  if (d <= 2.7) return 'O';
  if (d <= 5.2 || upright || corner) return x + y < 13 ? 'y' : x + y > 17 ? 'g' : 'G';
  return '.';
}).join('')));

export const aa13Finish = aaKeepsake(
  'aa13-finish',
  'A purple leather ledger with gold corners and a red ribbon bookmark, its cover stamped in gold with a gear, with small glints and check marks around it.',
  emblemGear,
);

export const art: LessonArtSet = { opener: aa13Opener, backdrop: aaBackdrop, finish: aa13Finish };
