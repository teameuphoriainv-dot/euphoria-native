/**
 * Risk Management lesson 23 opener, Quantitative Risk Modeling: Monte Carlo is rolling the dice, so the
 * keeper tosses them across the chart table, again and again. Pinned above is what the rolls
 * add up to, a fan of simulated paths out of one start, most of them blue and the worst two red: the
 * tail the model is for. The big barometer from lesson 2 still gives the one number; the fan is what
 * it hides. Moving: the dice, the barometer's needle, the lantern, a moth at its light, a glint on the
 * brass.
 */
import type { PixelSprite } from '../types';
import { rmBackdrop } from './rm-backdrop';
import { RM_PALETTE, rmChartTable, rmCompose, rmKeepsake, rmLantern, rmLater, rmStamp, rmWatchRoom } from './rm-kit';
import { rmGlint, rmKeeperReach, rmMark } from './rm-kit-a';
import type { RmPoint } from './rm-kit-a';
import { rmFill } from './rm-kit-b';
import { rmMoth } from './rm-kit-c';
import type { LessonArtSet, SceneArt } from './types';

/** The big barometer's dial with no needle, as lesson 2 draws it: brass bezel, fair-change-storm arc. 21x21. */
const DIAL = [
  '.......OOOOOOO.......',
  '.....OOyyyyyyyOO.....',
  '....OyyyGGGGGGGgO....',
  '...OyGGOOOOOOOGggO...',
  '..OyGOONGGGGGROOggO..',
  '..OyONNwwwwwwwRROgO..',
  '.OyONwwwwwwwwwwwROgO.',
  '.OyONwwwwwwwwwwwROgO.',
  'OGONwwwwwwwwwwwwwROgO',
  'OGONwwwwwwwwwwwwwROgO',
  'OGONwwwwwwwwwwwwwROgO',
  'OGONwwwwwwwwwwwwwROgO',
  'OGOwwwwwwwwwwwwwwwOgO',
  '.OGOwwwwxxxxxwwwwOgO.',
  '.OgOwwwwwwwwwwwwwOgO.',
  '..OgOwwwwwwwwwwwOgO..',
  '..OggOOwwwwwwwOOggO..',
  '...OgggOOOOOOOgggO...',
  '....OgggggggggggO....',
  '.....OOgggggggOO.....',
  '.......OOOOOOO.......',
];

/** The needle at three angles in the red: the hub, a short tail, then the pointer. */
const NEEDLE_45 = [[10, 10, 'O'], [9, 11, 'K'], [11, 9, 'K'], [12, 8, 'K'], [13, 7, 'K'], [14, 6, 'K']] as const;
const NEEDLE_30 = [[10, 10, 'O'], [9, 11, 'K'], [11, 9, 'K'], [12, 9, 'K'], [13, 8, 'K'], [14, 8, 'K'], [15, 7, 'K']] as const;
const NEEDLE_60 = [[10, 10, 'O'], [9, 11, 'K'], [11, 9, 'K'], [11, 8, 'K'], [12, 7, 'K'], [12, 6, 'K'], [13, 5, 'K']] as const;

/** VaR as the big barometer, the needle trembling in the storm arc. Framed, 21x21. */
const bigBarometer: PixelSprite = {
  id: 'rm23-opener-barometer',
  name: 'big barometer',
  tags: ['scene', 'rm23'],
  rows: rmMark(DIAL, NEEDLE_45),
  frames: [rmMark(DIAL, NEEDLE_45), rmMark(DIAL, NEEDLE_30), rmMark(DIAL, NEEDLE_45), rmMark(DIAL, NEEDLE_60)],
  frameMs: 280,
};

/**
 * The fan chart: nine simulated runs out of one start at the left, each wandering its own way to its
 * own end, the worst two drawn last and in red. Pinned paper, 26x16.
 */
function fanRows(): string[] {
  const paper = [
    '............R.............',
    'x'.repeat(26),
    ...Array.from({ length: 13 }, () => `x${'w'.repeat(24)}x`),
    'x'.repeat(26),
  ];
  const runs: RmPoint[] = [];
  for (let k = 0; k < 9; k++) {
    const end = 3 + k * 1.25;
    for (let x = 2; x <= 23; x++) {
      const t = (x - 2) / 21;
      runs.push([x, Math.round(8.5 + (end - 8.5) * t + Math.sin(k * 7.3 + x * 1.7) * 0.9 * t), k >= 7 ? 'R' : 'B']);
    }
  }
  return rmMark(paper, [...runs, [1, 8, 'K'], [2, 8, 'K']]);
}

const fanChart: PixelSprite = { id: 'rm23-opener-fan-chart', name: 'fan chart', tags: ['scene', 'rm23'], rows: fanRows() };

/** A red die showing two, and one showing three, white pips, the far side in shade. 4x4 each. */
const TWO = ['RRRr', 'RwRr', 'RRwr', 'rrrr'];
const THREE = ['wRRr', 'RwRr', 'RRwr', 'rrrr'];

/** One frame of the roll: both dice at their places in an 18x10 box, the keeper's hand off its right. */
const roll = (ax: number, ay: number, a: string[], bx: number, by: number, b: string[]) =>
  rmStamp(rmStamp(Array.from({ length: 10 }, () => '.'.repeat(18)), { id: 'die', name: 'die', tags: [], rows: a }, ax, ay), { id: 'die', name: 'die', tags: [], rows: b }, bx, by);

/** The dice out of the hand, up, over, landing, lying a beat: the roll again and again. Framed, 18x10. */
const dice: PixelSprite = {
  id: 'rm23-opener-dice',
  name: 'dice',
  tags: ['scene', 'rm23'],
  rows: roll(3, 6, TWO, 8, 6, THREE),
  frames: [
    roll(14, 5, TWO, 11, 3, THREE),
    roll(10, 2, THREE, 7, 3, TWO),
    roll(6, 4, TWO, 4, 5, THREE),
    roll(3, 6, TWO, 8, 6, THREE),
    roll(3, 6, TWO, 8, 6, THREE),
    roll(3, 6, TWO, 8, 6, THREE),
  ],
  frameMs: 220,
};

/** Floor shadows under the table and the keeper. */
const floorShadow: PixelSprite = {
  id: 'rm23-opener-floor-shadow',
  name: 'rm23-opener-floor-shadow',
  tags: ['scene', 'rm23'],
  palette: RM_PALETTE,
  rows: rmFill(['.'.repeat(46), '.'.repeat(46)], [[0, 45, 0, 'Z'], [2, 23, 1, 'Z'], [28, 43, 1, 'Z']]),
};

const base = rmCompose('rm23-opener-base', rmWatchRoom(80, 60, 50), [
  [fanChart, 32, 5],
  [floorShadow, 22, 52],
  [rmChartTable, 24, 38],
  [rmKeeperReach, 50, 24],
]);

export const rm23Opener: SceneArt = {
  id: 'rm23-opener',
  label: 'A lighthouse keeper tosses a pair of red dice onto the chart table, under a big barometer and a fan chart of many simulated paths whose lowest are red.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: bigBarometer, x: 4, y: 4 },
    { sprite: rmGlint, x: 7, y: 6, motion: { kind: 'twinkle', periodMs: 2600, min: 0.2 } },
    { sprite: rmLater(rmLantern, 'rm23-opener-lantern', 2, 200), x: 26, y: 28 },
    { sprite: rmMoth, x: 22, y: 25, motion: { kind: 'drift', amp: 2, periodMs: 2300 } },
    { sprite: dice, x: 31, y: 28 },
  ],
};

/** Lesson 23's emblem: two red dice, a five and a three, white pips. 15x11. */
const FIVE = ['.ssRRr.', 'sRRRRRr', 'sRwRwRr', 'RRRwRRr', 'RRwRwRr', 'rRRRRRr', '.rrrrr.'];
const THREE_BIG = ['.ssRRr.', 'sRRRRRr', 'sRwRRRr', 'RRRwRRr', 'RRRRwRr', 'rRRRRRr', '.rrrrr.'];
const emblemDice: PixelSprite = {
  id: 'rm23-emblem-dice',
  name: 'dice',
  tags: ['rm', 'emblem', 'lesson 23'],
  rows: rmStamp(rmStamp(Array.from({ length: 11 }, () => '.'.repeat(15)), { id: 'five', name: 'five', tags: [], rows: FIVE }, 0, 4), { id: 'three', name: 'three', tags: [], rows: THREE_BIG }, 8, 0),
};

export const rm23Finish: SceneArt = rmKeepsake(
  'rm23-finish',
  'A red and white life ring hanging from a rope, with two red dice at its center, a five and a three.',
  emblemDice,
);

export const art: LessonArtSet = { opener: rm23Opener, backdrop: rmBackdrop, finish: rm23Finish };

