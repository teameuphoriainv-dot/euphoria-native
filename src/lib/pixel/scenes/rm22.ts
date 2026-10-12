/**
 * Risk Management lesson 22 opener, Behavioral Risk: two mates in matching oilskins have their brass
 * spyglasses on the same calm, moonlit sea, and agree about it. That is groupthink, the bias that
 * scales from one person to a firm: the more alike the watch, the more of the sea nobody is watching.
 * Behind them the door has blown open on a storm and a wave the height of the lintel. Only the keeper
 * has turned round, and points. Moving: the stars and the ship in the window, the swell, lightning,
 * rain and spray in the doorway.
 */
import type { PixelSprite } from '../types';
import { rmBackdrop } from './rm-backdrop';
import { RM_PALETTE, rmCompose, rmKeepsake, rmLightning, rmRetint, rmShip, rmWatchRoom } from './rm-kit';
import { rmCalmWindow, rmFlip, rmKeeperBrass, rmKeeperReach, rmMark, rmPlot, rmStar, rmSwellCalm } from './rm-kit-a';
import type { RmPoint } from './rm-kit-a';
import { RM_MATE_TINT, rmFill } from './rm-kit-b';
import type { LessonArtSet, SceneArt } from './types';

/** A grey beard along the jaw and down the neck, as rm-kit-b draws it on the mate. */
const BEARD: readonly RmPoint[] = [
  [9, 9, 'x'], [10, 9, 'x'], [11, 9, 'x'], [12, 9, 'X'],
  [9, 10, 'x'], [10, 10, 'x'], [11, 10, 'X'], [12, 10, 'X'],
  [11, 11, 'x'], [12, 11, 'X'],
];

/** The spyglass's own pixels in rmKeeperBrass, rows 6 to 9, kept brass when the coat goes orchid. */
const GLASS: readonly (readonly [number, number])[] = [
  [0, 6], [1, 6],
  ...Array.from({ length: 8 }, (_, x) => [x, 7] as const),
  ...Array.from({ length: 8 }, (_, x) => [x, 8] as const),
  [0, 9], [1, 9],
];

const orchid = rmRetint({ ...rmKeeperBrass, rows: rmMark(rmKeeperBrass.rows, BEARD) }, 'rm22-opener-mate', RM_MATE_TINT);

/** The mate with a brass spyglass, facing left: the keeper's brass pose in an orchid oilskin, bearded. 18x29. */
const mateWithGlass: PixelSprite = {
  ...orchid,
  rows: rmMark(orchid.rows, GLASS.map(([x, y]): RmPoint => [x, y, rmKeeperBrass.rows[y][x]])),
};

/** What the open door lets in: a black sky, and a wave rearing higher than the horizon, foam on its crest. 14x34. */
const STORM = [
  'KKKKKKKKKKKKKK',
  'KKKkkkkKKKKKKK',
  'KKkkkkkkkKKKkK',
  'KkkkkkkkkkKkkk',
  'KKkkkkkkKKKKkK',
  'KKKKKKKKKKKKKK',
  'KKKKKKKKKKKKKK',
  'KKKKKKKKKKKKKK',
  'KKKKKKKKKKKKKK',
  'KKKKKKKKKKKKKK',
  'KKKKKKKKKKKKKK',
  'KKKKKKKKwwwKKK',
  'KKKKKKwwwUwwKK',
  'KKKKKwwUUUUUwK',
  'KKKKwUUUuuUUUw',
  'KKKwUUuuuuuuUU',
  'KKwUUuuuuuuuuU',
  'KwUUuuuuuuuuuu',
  'wUUuuuuuuuuuuu',
  'UUuuuuuVuuuuuu',
  'UuuuuuVVVuuuuu',
  'uuuuuVVVVVuuuu',
  'uuuVVVVVVVVuuu',
  'uVVVVVVVVVVVVu',
  'VVVVVVVVVVVVVV',
  'VVVVuuuVVVVVVV',
  'VVVVVVVVVVuuVV',
  'vVVVVVVVVVVVVV',
  'vvvVVVVVuuVVVv',
  'vvvvvvvvvvvvvv',
  'vvvuuvvvvvvvvv',
  'vvvvvvvvvuuvvv',
  'vvvvvvvvvvvvvv',
  'vvvvvvvvvvvvvv',
];

/** The doorway: a wooden frame, lintel and sill, the storm through it. 18x37. */
const door: PixelSprite = {
  id: 'rm22-opener-door',
  name: 'open door',
  tags: ['scene', 'rm22'],
  palette: RM_PALETTE,
  rows: [
    'O'.repeat(18),
    `Og${'g'.repeat(14)}gO`,
    ...STORM.map((row) => `Og${row}gO`),
    'O'.repeat(18),
  ],
};

/** Rain blowing in through the doorway, three frames falling. 14x34, the opening's size. */
const doorRain: PixelSprite = {
  id: 'rm22-opener-door-rain',
  name: 'door rain',
  tags: ['scene', 'rm22'],
  rows: rmPlot(14, 34, [[3, 2, 'X'], [2, 3, 'x'], [10, 6, 'X'], [9, 7, 'x'], [5, 12, 'X'], [4, 13, 'x'], [12, 19, 'X'], [11, 20, 'x'], [7, 26, 'X'], [6, 27, 'x']]),
  frames: [
    rmPlot(14, 34, [[3, 2, 'X'], [2, 3, 'x'], [10, 6, 'X'], [9, 7, 'x'], [5, 12, 'X'], [4, 13, 'x'], [12, 19, 'X'], [11, 20, 'x'], [7, 26, 'X'], [6, 27, 'x']]),
    rmPlot(14, 34, [[6, 4, 'X'], [5, 5, 'x'], [12, 9, 'X'], [11, 10, 'x'], [2, 15, 'X'], [1, 16, 'x'], [9, 22, 'X'], [8, 23, 'x'], [4, 29, 'X'], [3, 30, 'x']]),
    rmPlot(14, 34, [[9, 1, 'X'], [8, 2, 'x'], [4, 8, 'X'], [3, 9, 'x'], [11, 14, 'X'], [10, 15, 'x'], [6, 21, 'X'], [5, 22, 'x'], [12, 28, 'X'], [11, 29, 'x']]),
  ],
  frameMs: 150,
};

/** Spray thrown off the crest; give it a `rise`. 3x2. */
const spray: PixelSprite = { id: 'rm22-opener-spray', name: 'spray', tags: ['scene', 'rm22'], rows: ['w.w', '.w.'] };

/** Floor shadows under the two mates and the keeper. */
const floorShadow: PixelSprite = {
  id: 'rm22-opener-floor-shadow',
  name: 'rm22-opener-floor-shadow',
  tags: ['scene', 'rm22'],
  palette: RM_PALETTE,
  rows: rmFill(['.'.repeat(60), '.'.repeat(60)], [[2, 17, 0, 'Z'], [22, 37, 0, 'Z'], [43, 58, 0, 'Z'], [4, 15, 1, 'Z'], [24, 35, 1, 'Z'], [45, 56, 1, 'Z']]),
};

const base = rmCompose('rm22-opener-base', rmWatchRoom(80, 60, 50), [
  [rmCalmWindow, 0, 6],
  [door, 61, 14],
  [floorShadow, 0, 52],
  [rmFlip(rmKeeperReach, 'rm22-opener-keeper'), 41, 24],
]);

export const rm22Opener: SceneArt = {
  id: 'rm22-opener',
  label: 'Two bearded mates in matching orchid oilskins look through spyglasses at a calm moonlit sea, while behind them the lighthouse keeper turns and points at an open door where a storm and a huge wave are coming in.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: rmStar, x: 6, y: 10, motion: { kind: 'twinkle', periodMs: 3600, min: 0.2 } },
    { sprite: rmStar, x: 17, y: 8, motion: { kind: 'twinkle', periodMs: 4300, min: 0.2, phase: 0.5 } },
    { sprite: rmShip, x: 8, y: 12, motion: { kind: 'bob', amp: 1, periodMs: 3200 } },
    { sprite: rmSwellCalm, x: 6, y: 20, motion: { kind: 'drift', amp: 2, periodMs: 5600 } },
    { sprite: rmLightning, x: 65, y: 16 },
    { sprite: doorRain, x: 63, y: 16 },
    { sprite: spray, x: 71, y: 24, motion: { kind: 'rise', amp: 3, periodMs: 1800 } },
    { sprite: mateWithGlass, x: 0, y: 24 },
    { sprite: mateWithGlass, x: 20, y: 24 },
  ],
};

/** Lesson 22's emblem: rose-tinted spectacles, gold rims and pink lenses with a glint. 16x7. */
const emblemSpectacles: PixelSprite = {
  id: 'rm22-emblem-spectacles',
  name: 'rose-tinted spectacles',
  tags: ['rm', 'emblem', 'lesson 22'],
  rows: [
    '..yyy......yyy..',
    '.yWssG....yWssG.',
    'GWssFFGGGGWssFFG',
    'GssFFFG..GssFFFG',
    'GsFFFFG..GsFFFFG',
    '.GFFFG....GFFFG.',
    '..GGG......GGG..',
  ],
};

export const rm22Finish: SceneArt = rmKeepsake(
  'rm22-finish',
  'A red and white life ring hanging from a rope, with a pair of rose-tinted spectacles at its center.',
  emblemSpectacles,
);

export const art: LessonArtSet = { opener: rm22Opener, backdrop: rmBackdrop, finish: rm22Finish };
