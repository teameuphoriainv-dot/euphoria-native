/**
 * Wealth Management lesson 23 (retirement income strategies): its opener, the pathway backdrop and
 * its keepsake, as one set loaded on demand.
 *
 * The opener is the grandmother's garden on a moonlit night, built as the lesson's bucket strategy.
 * Two stone steps run down from left to right to the lawn, a wooden pail of coins on each and one on
 * the grass: the big one on the top step is the growth money she will not touch for eight years and
 * more, the middle one the bonds for the years between, the small one at the bottom her cash for this
 * year and next. She sits in a wicker chair at the foot of the steps, drawn large from wm-kit-c.ts,
 * one hand on the small pail, and coins tumble down from pail to pail to keep it full. The kit's
 * hourglass runs beside the big pail, because that bucket's job is time. What moves: two coins
 * tumbling down the steps, the sand, the lamp's flame, a firefly, the stars. The keepsake carries
 * the three pails in small, big, middling and small, a coin hopping from each to the next.
 */
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';
import { wmBackdrop } from './wm-backdrop';
import {
  wmBands,
  wmCompose,
  wmFirefly,
  wmHourglass,
  wmLampFlame,
  wmLampPost,
  wmStar,
  wmStarDot,
  WM_INKS,
} from './wm-kit';
import { wmTreeline } from './wm-kit-a';
import { wmAshlar, wmSkyDots } from './wm-kit-b';
import { wmCoinFlight, wmElderTall, wmMoon } from './wm-kit-c';
import { wmKeepsake } from './wm1-finish';

/** The two steps, [left, top, width], from the top down; each runs to the ground at y 56. */
const STEPS: readonly (readonly [number, number, number])[] = [[2, 34, 26], [28, 43, 17]];
const GROUND = 57;

const skyDots = wmSkyDots('wm23-opener-sky-dots', 80, 26, [
  [8, 3, 'X'],
  [22, 9, 'D'],
  [31, 2, 'D'],
  [46, 7, 'X'],
  [74, 12, 'D'],
  [52, 18, 'X'],
  [3, 17, 'D'],
]);

const trees = wmTreeline('wm23-opener-trees', 80, 8, [[40, 40, 2], [10, 10, 6], [36, 12, 4], [72, 10, 7]]);

/** A stone step: a lit top edge over dressed stone. */
function step(id: string, width: number, height: number): PixelSprite {
  return { id, name: id, tags: ['scene', 'wm23'], rows: [`${'x'.repeat(width - 1)}X`, ...wmAshlar(width, height - 1, 'D', 'k', 8, 4)] };
}

/** Ivy trailing over a step's lip. 6x6. */
const ivy: PixelSprite = {
  id: 'wm23-opener-ivy',
  name: 'wm23-opener-ivy',
  tags: ['scene', 'wm23'],
  palette: WM_INKS,
  rows: ['HnHHnh', '.Hn.h.', '..H.n.', '..n...', '..H...', '...h..'],
};

/** The growth pail: big, heaped with coins, an iron handle over the heap. 13x11. */
const pailBig: PixelSprite = {
  id: 'wm23-opener-pail-big',
  name: 'wm23-opener-pail-big',
  tags: ['scene', 'wm23'],
  palette: WM_INKS,
  rows: [
    '....DDDDD....',
    '..DD.....DD..',
    '.D..yGGGg..D.',
    '.D.yGGGGGg.D.',
    'XxxxxxxxxxxxD',
    '.CCUCCCUCCCU.',
    '.KKKKKKKKKKK.',
    '..CUCCCUCCU..',
    '..CUCCCUCCU..',
    '..KKKKKKKKK..',
    '...UUUUUUU...',
  ],
};

/** The bond pail, middling. 11x9. */
const pailMid: PixelSprite = {
  id: 'wm23-opener-pail-mid',
  name: 'wm23-opener-pail-mid',
  tags: ['scene', 'wm23'],
  palette: WM_INKS,
  rows: [
    '...DDDDD...',
    '..D.....D..',
    '.D.yGGGg.D.',
    'XxxxxxxxxxD',
    '.CCUCCUCCU.',
    '.KKKKKKKKK.',
    '..CUCCUCU..',
    '..KKKKKKK..',
    '...UUUUU...',
  ],
};

/** The cash pail, small, the one she draws on. 9x7. */
const pailSmall: PixelSprite = {
  id: 'wm23-opener-pail-small',
  name: 'wm23-opener-pail-small',
  tags: ['scene', 'wm23'],
  palette: WM_INKS,
  rows: [
    '..DDDDD..',
    '.D.yGg.D.',
    'XxxxxxxxD',
    '.CCUCCUC.',
    '.KKKKKKK.',
    '..CUCCU..',
    '...UUU...',
  ],
};

/** A wicker garden chair, front on: a tall banded back, two arms, the seat's edge, four legs. 16x21. */
const chair: PixelSprite = {
  id: 'wm23-opener-chair',
  name: 'wm23-opener-chair',
  tags: ['scene', 'wm23'],
  palette: WM_INKS,
  rows: [
    '...UCCCCCCCCU...',
    '..UCCCCCCCCCCU..',
    ...Array.from({ length: 11 }, (_, i) => (i % 2 === 0 ? '..CUUUUUUUUUUC..' : '..CCCCCCCCCCCC..')),
    'CCC..........CCC',
    'UUC..........CUU',
    'UUCCCCCCCCCCCCUU',
    'OOUUUUUUUUUUUUOO',
    '.U............U.',
    '.U............U.',
    '.U............U.',
    '.K............K.',
  ],
};

/** Her lap and feet over the seat's edge. 16x6. */
const lap: PixelSprite = {
  id: 'wm23-opener-lap',
  name: 'wm23-opener-lap',
  tags: ['scene', 'wm23'],
  rows: ['....pEEEEEEp....', '....pEEEEEEp....', '.....pEEEEp.....', '......k..k......', '......k..k......', '.....KK..KK.....'],
};

/** Her left arm out over the chair's arm, the hand on the small pail's rim. 4x2. */
const reach: PixelSprite = {
  id: 'wm23-opener-reach',
  name: 'wm23-opener-reach',
  tags: ['scene', 'wm23'],
  palette: WM_INKS,
  rows: ['CqPP', 'Uppp'],
};

/** The grandmother seated: the chair, the kit's figure to the waist, her lap, her reaching hand. 16x21. */
const grandmother = wmCompose('wm23-opener-grandmother', wmBands(16, [['.', 21]]), [
  { sprite: chair, x: 0, y: 0 },
  { sprite: { ...wmElderTall, rows: wmElderTall.rows.slice(0, 13) }, x: 2, y: 1 },
  { sprite: lap, x: 0, y: 14 },
  { sprite: reach, x: 0, y: 12 },
]);

const base = wmCompose('wm23-opener-base', wmBands(80, [['K', 34], ['h', 26]]), [
  { sprite: skyDots, x: 0, y: 0 },
  { sprite: wmMoon, x: 60, y: 4 },
  { sprite: trees, x: 0, y: 26 },
  ...STEPS.map(([x, y, w], i) => ({ sprite: step(`wm23-opener-step-${i}`, w, GROUND - y), x, y })),
  { sprite: ivy, x: 21, y: STEPS[0][1] },
  { sprite: ivy, x: 38, y: STEPS[1][1] },
  { sprite: pailBig, x: 13, y: STEPS[0][1] - 11 },
  { sprite: pailMid, x: 30, y: STEPS[1][1] - 9 },
  { sprite: pailSmall, x: 47, y: GROUND - 7 },
  { sprite: grandmother, x: 56, y: 37 },
  { sprite: wmLampPost, x: 74, y: 33 },
]);

/** A coin tumbling from the big pail's heap into the middle pail. */
const fallToMid = wmCoinFlight('wm23-opener-coin-to-mid', 18, 17, [
  [1, 6], [3, 3], [5, 1], [7, 0], [9, 1], [11, 3], [12, 6], [13, 9], [14, 12], [14, 15],
], 6, 150);

/** A coin tumbling from the middle pail into the small one at her side. */
const fallToSmall = wmCoinFlight('wm23-opener-coin-to-small', 17, 22, [
  [1, 5], [3, 2], [5, 0], [7, 0], [9, 1], [11, 3], [12, 6], [13, 9], [13, 12], [14, 15], [14, 19],
], 9, 140);

export const wm23Opener: SceneArt = {
  id: 'wm23-opener',
  label: 'A grandmother sits in her garden chair at night with one hand over the smallest of three pails of coins set down a flight of stone steps, coins tumbling from the biggest pail down to keep it full, an hourglass running on the top step.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: wmHourglass, x: 4, y: STEPS[0][1] - 10 },
    { sprite: fallToMid, x: 20, y: 19 },
    { sprite: fallToSmall, x: 36, y: 30 },
    { sprite: wmLampFlame, x: 75, y: 36 },
    { sprite: wmFirefly, x: 38, y: 50, motion: { kind: 'rise', amp: 5, periodMs: 3000, phase: 0.3 } },
    { sprite: wmStar, x: 16, y: 6, motion: { kind: 'twinkle', periodMs: 2200, min: 0.3 } },
    { sprite: wmStarDot, x: 40, y: 12, motion: { kind: 'twinkle', periodMs: 1800, phase: 0.5, min: 0.2 } },
  ],
};

/* ── the keepsake: the bucket strategy in small ──────────────────────────────────────────────── */

/** The three pails heaped with coins, bound in gold hoops, on one line: growth, bonds, cash. */
const EMBLEM_PAILS: readonly { rows: readonly string[]; x: number; y: number }[] = [
  { rows: ['..yG.', '.yGGg', 'yGGGg', 'xxxxX', 'CCUCU', 'GGGGg', 'CCUCU', 'CCUCU', '.UUU.'], x: 0, y: 4 },
  { rows: ['.yG.', 'yGGg', 'xxxX', 'CUCU', 'GGGg', 'CUCU', '.UU.'], x: 6, y: 6 },
  { rows: ['yGg', 'xxX', 'CUC', 'GGg', '.U.'], x: 11, y: 8 },
];

/**
 * The coin's stops (a 2x2 coin's top-left, or a glint where it lands): off the big heap, onto the
 * middle one, off it again, onto the small one.
 */
type PailStop = readonly [number, number] | readonly [number, number, 'glint'] | null;
const PAIL_HOPS: readonly PailStop[] = [null, [2, 2], [4, 1], [6, 3], [7, 6, 'glint'], [8, 4], [10, 4], [11, 6], [12, 8, 'glint'], null];

/** The emblem, 14x13, with the hopping coin at `stop`. */
function pailsAt(stop: PailStop): string[] {
  const grid = wmBands(14, [['.', 13]]).map((row) => [...row]);
  const paint = (rows: readonly string[], x: number, y: number) => {
    rows.forEach((row, j) => [...row].forEach((ch, i) => {
      if (ch !== '.') grid[y + j][x + i] = ch;
    }));
  };
  EMBLEM_PAILS.forEach(({ rows, x, y }) => paint(rows, x, y));
  if (stop && stop.length === 3) grid[stop[1]][stop[0]] = 'W';
  else if (stop) paint(['yG', 'Gg'], stop[0], stop[1]);
  return grid.map((row) => row.join(''));
}

/**
 * The bucket strategy in small: three pails of coins, big, middling and small, a coin hopping from
 * the big one into the middle one and on into the small one to keep it full. The still is the coin
 * at the top of its first hop.
 */
const emblemPails: PixelSprite = {
  id: 'wm23-emblem-pails',
  name: 'wm23-emblem-pails',
  tags: ['scene', 'wm23'],
  palette: WM_INKS,
  rows: pailsAt(PAIL_HOPS[2]),
  frames: PAIL_HOPS.map(pailsAt),
  frameMs: 360,
};

export const wm23Finish: SceneArt = wmKeepsake(
  'wm23-finish',
  emblemPails,
  'A green crest with a gold rim bearing three wooden pails of gold coins, big, middling and small, a coin hopping from the biggest toward the next, framed by laurel over a purple banner, with sparkles around it.',
);

export const art: LessonArtSet = { opener: wm23Opener, backdrop: wmBackdrop, finish: wm23Finish };
