/**
 * Risk Management lesson 2 opener, Measuring & Managing Market Risk: the calm before AIG's storm.
 *
 * Measure, then test beyond the measure. Outside the window the night is calm, the moon on a flat
 * sea, and the barometer on the wall (VaR, built from history) holds steady in the green. On the
 * chart table lies the keeper's open logbook, its pages rows of small blue waves: every sea ever
 * logged, the history that historical VaR sorts through. The keeper does not trust it. With a quill
 * he draws a tall red dashed wave rising off the page, bigger than anything in the book: the stress
 * scenario, the question the lesson asks ("could this happen", not "has it happened"). Moving: the
 * dashes march round the drawn wave, the quill twitches, the needle trembles but stays in the green,
 * the swell rolls, a star twinkles, the lantern flame.
 */
import type { PixelSprite } from '../types';
import { rmBackdrop } from './rm-backdrop';
import {
  RM_PALETTE,
  rmBarometer,
  rmChartTable,
  rmCompose,
  rmKeepsake,
  rmLantern,
  rmLater,
  rmRopeCoil,
  rmWatchRoom,
} from './rm-kit';
import { type RmPoint, rmCalmWindow, rmFlip, rmKeeperReach, rmMark, rmPlot, rmStar, rmSwellCalm } from './rm-kit-a';
import type { LessonArtSet, SceneArt } from './types';

/** The pixels of a polyline through `points`, every step 8-connected, no pixel twice. */
function trace(points: readonly (readonly [number, number])[]): [number, number][] {
  const out: [number, number][] = [];
  const seen = new Set<string>();
  const add = (x: number, y: number) => {
    const key = `${String(x)},${String(y)}`;
    if (!seen.has(key)) { seen.add(key); out.push([x, y]); }
  };
  points.forEach(([x, y], i) => {
    if (i === 0) { add(x, y); return; }
    const [px, py] = points[i - 1];
    const steps = Math.max(Math.abs(x - px), Math.abs(y - py));
    for (let s = 1; s <= steps; s++) add(Math.round(px + ((x - px) * s) / steps), Math.round(py + ((y - py) * s) / steps));
  });
  return out;
}

/**
 * A path drawn as bold dashes: `on` steps inked with a 2x2 nib, `off` steps skipped, starting
 * `phase` steps along, so stepping the phase marches the dashes round the path. The nib's top-left
 * takes `lit`, the rest `ink`.
 */
function boldDashes(path: readonly [number, number][], phase: number, on: number, off: number, ink: string, lit = ink): RmPoint[] {
  return path.flatMap(([x, y], i): RmPoint[] => ((i + phase) % (on + off) < on
    ? [[x, y, lit], [x + 1, y, ink], [x, y + 1, ink], [x + 1, y + 1, ink]]
    : []));
}

/**
 * The stress scenario: a tall breaking wave, the lip curling back toward the keeper. Its outline
 * runs from the front foot (bottom left, where the quill is) up the face, under and round the lip,
 * over the crest and down the back, in bold red dashes that march round it. 21x25.
 */
const WAVE_W = 21;
const WAVE_H = 25;
const WAVE_PATH = trace([
  [1, 23], [4, 19], [6, 16], [8, 13], [9, 10], [8, 8], [6, 7], [4, 8], [3, 10], [2, 9], [1, 6], [2, 3], [5, 1], [9, 0],
  [13, 0], [16, 2], [18, 5], [19, 9], [19, 14], [18, 19], [18, 23],
]);
const stressWave: PixelSprite = {
  id: 'rm2-opener-stress-wave',
  name: 'stress wave',
  tags: ['scene', 'rm2'],
  rows: rmPlot(WAVE_W, WAVE_H, boldDashes(WAVE_PATH, 0, 3, 2, 'R', 's')),
  frames: [0, 1, 2, 3, 4].map((p) => rmPlot(WAVE_W, WAVE_H, boldDashes(WAVE_PATH, p, 3, 2, 'R', 's'))),
  frameMs: 400,
};

/** One logged wave, a small blue crest: what every past sea in the book looks like. */
const LOGGED = ['.b.', 'b.b'];

/**
 * The keeper's logbook, open on the chart table, 26x13: white pages, the spine, red leather under
 * them, and rows of small logged waves on both pages (fewer on the left, where the new one is drawn).
 */
const logbook: PixelSprite = (() => {
  const page = (crests: readonly (readonly [number, number])[]) => {
    const cells = Array.from({ length: 10 }, () => Array.from({ length: 11 }, () => 'w'));
    crests.forEach(([x, y]) => LOGGED.forEach((r, dy) => [...r].forEach((ch, dx) => { if (ch !== '.') cells[y + dy][x + dx] = ch; })));
    return cells.map((r) => r.join(''));
  };
  const left = page([[4, 4], [8, 4], [0, 7], [4, 7], [8, 7]]);
  const right = page([[0, 1], [4, 1], [8, 1], [0, 4], [4, 4], [8, 4], [0, 7], [4, 7], [8, 7]]);
  return {
    id: 'rm2-opener-logbook',
    name: 'logbook, open',
    tags: ['scene', 'rm2'],
    rows: [
      `.${'w'.repeat(11)}DD${'w'.repeat(11)}.`,
      ...left.map((r, y) => `r${r}DD${right[y]}r`),
      `r${'x'.repeat(11)}DD${'x'.repeat(11)}r`,
      'r'.repeat(26),
    ],
  };
})();

/** The quill in the keeper's hand, the feather up and out, the nib on the page; it twitches as it draws. 9x9. */
const QUILL_A: RmPoint[] = [[8, 0, 'w'], [7, 1, 'w'], [8, 1, 'x'], [6, 2, 'w'], [7, 2, 'x'], [5, 3, 'w'], [4, 4, 'x'], [1, 7, 'K']];
const quill: PixelSprite = {
  id: 'rm2-opener-quill',
  name: 'quill',
  tags: ['scene', 'rm2'],
  rows: rmPlot(9, 9, QUILL_A),
  frames: [rmPlot(9, 9, QUILL_A), rmPlot(9, 9, [...QUILL_A, [0, 8, 'K']]), rmPlot(9, 9, QUILL_A), rmPlot(9, 9, [...QUILL_A.slice(0, -1), [1, 8, 'K']])],
  frameMs: 460,
};

/** The wall barometer with its needle moved into the green: history says fair. It trembles, but stays there. */
const FACE = rmMark(rmBarometer.rows, [[8, 4, 'w'], [7, 5, 'w'], [8, 5, 'w']]);
const calmBarometer: PixelSprite = {
  id: 'rm2-opener-barometer-fair',
  name: 'barometer at fair',
  tags: ['scene', 'rm2'],
  rows: rmMark(FACE, [[5, 5, 'K'], [4, 4, 'K']]),
  frames: [rmMark(FACE, [[5, 5, 'K'], [4, 4, 'K']]), rmMark(FACE, [[5, 5, 'K'], [4, 5, 'K']]), rmMark(FACE, [[5, 5, 'K'], [4, 4, 'K']]), rmMark(FACE, [[5, 5, 'K'], [5, 4, 'K']])],
  frameMs: 300,
};

/** Floor shadows under the keeper and the table, so neither floats. */
const floorShadow: PixelSprite = {
  id: 'rm2-opener-floor-shadow',
  name: 'rm2-opener-floor-shadow',
  tags: ['scene', 'rm2'],
  palette: RM_PALETTE,
  rows: [
    '..ZZZZZZZZZZZZZZZZ..ZZZZZZZZZZZZZZZZZZZZZZZZZ',
    '....ZZZZZZZZZZZZ......ZZZZZZZZZZZZZZZZZZZZZ..',
  ],
};

const WINDOW = { x: 34, y: 3 };
const TABLE = { x: 30, y: 38 };
const BOOK = { x: TABLE.x, y: TABLE.y - 12 };
const KEEPER = { x: 17, y: 23 };
const QUILL = { x: 30, y: 27 };
/** The wave's front foot (path point 1,23) sits on the quill's nib (quill point 1,7). */
const WAVE = { x: QUILL.x, y: QUILL.y + 7 - 23 };

const base = rmCompose('rm2-opener-base', rmWatchRoom(80, 60, 50), [
  [rmCalmWindow, WINDOW.x, WINDOW.y],
  [floorShadow, 14, 52],
  [rmChartTable, TABLE.x, TABLE.y],
  [logbook, BOOK.x, BOOK.y],
  [rmRopeCoil, 62, 51],
  [rmFlip(rmKeeperReach, 'rm2-opener-keeper'), KEEPER.x, KEEPER.y],
]);

export const rm2Opener: SceneArt = {
  id: 'rm2-opener',
  label: 'On a calm moonlit night a lighthouse keeper, under a barometer steady in the green, takes a quill to an open logbook full of small blue logged waves and draws a tall red dashed wave rising off the page, bigger than anything in the book.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: rmSwellCalm, x: WINDOW.x + 4, y: WINDOW.y + 18, motion: { kind: 'drift', amp: 2, periodMs: 4200 } },
    { sprite: rmStar, x: WINDOW.x + 22, y: WINDOW.y + 2, motion: { kind: 'twinkle', periodMs: 1900, min: 0.2 } },
    { sprite: rmLater(rmLantern, 'rm2-opener-lantern', 2, 200), x: WINDOW.x + 32, y: WINDOW.y + 19 },
    { sprite: calmBarometer, x: 15, y: 7 },
    { sprite: stressWave, ...WAVE },
    { sprite: quill, ...QUILL },
  ],
};

/**
 * Lesson 2's emblem: the logbook and the wave drawn beyond it. An open book with a small blue logged
 * wave on each page, and one red wave curling up off it, far taller than anything in the book: the
 * opener's wave in one bold stroke, since dashes this small break up. 14x14, inside the ring's hole.
 */
const EMBLEM_WAVE = trace([[2, 9], [4, 7], [5, 5], [5, 3], [4, 2], [3, 3], [2, 4], [1, 3], [1, 1], [3, 0], [7, 0], [9, 1], [10, 3], [11, 6], [11, 9]]);
const emblemLogbook: PixelSprite = {
  id: 'rm2-emblem-logbook',
  name: 'logbook and stress wave',
  tags: ['rm', 'emblem', 'lesson 2'],
  rows: rmMark([
    ...Array.from({ length: 10 }, () => '.'.repeat(14)),
    '..wwwwDDwwww..',
    '.wwbwwDDwwbww.',
    '.wbwbwDDwbwbw.',
    '.rrrrrrrrrrrr.',
  ], boldDashes(EMBLEM_WAVE, 0, 1, 0, 'R', 's')),
};

export const rm2Finish: SceneArt = rmKeepsake(
  'rm2-finish',
  'A red and white life ring hanging from a rope, with an open logbook of small blue waves at its center and one tall red wave curling up off its page.',
  emblemLogbook,
);

export const art: LessonArtSet = { opener: rm2Opener, backdrop: rmBackdrop, finish: rm2Finish };
