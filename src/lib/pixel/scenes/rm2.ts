/**
 * Risk Management lesson 2 opener, Measuring & Managing Market Risk: the keeper points at the big
 * barometer as the storm comes on, its needle shaking in the red. VaR is that one number; the chart
 * pinned by the table is why it is not enough, a bell curve whose left tail is fat and red, the
 * seven-sigma days the normal curve says almost never come. The storm is in the porthole. Moving:
 * the needle, lightning, rain and swell on the glass, the lantern flame.
 */
import type { PixelSprite } from '../types';
import { rmBackdrop } from './rm-backdrop';
import {
  RM_PALETTE,
  rmChartTable,
  rmCompose,
  rmKeepsake,
  rmLantern,
  rmLater,
  rmLightning,
  rmLogbook,
  rmRopeCoil,
  rmWatchRoom,
} from './rm-kit';
import { rmFlip, rmKeeperRaise, rmMark, rmPortRain, rmPortSwell, rmPorthole } from './rm-kit-a';
import type { LessonArtSet, SceneArt } from './types';

/** The big barometer's dial with no needle: brass bezel, a fair-change-storm arc, a label line. 21x21. */
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

/** VaR as the big barometer: the needle trembles deep in the storm arc. Framed, 21x21. */
const bigBarometer: PixelSprite = {
  id: 'rm2-opener-barometer',
  name: 'big barometer',
  tags: ['scene', 'rm2'],
  rows: rmMark(DIAL, NEEDLE_45),
  frames: [rmMark(DIAL, NEEDLE_45), rmMark(DIAL, NEEDLE_30), rmMark(DIAL, NEEDLE_45), rmMark(DIAL, NEEDLE_60)],
  frameMs: 280,
};

/** The pinned chart: a bell curve, its left tail past the cut-off fat and red. 20x14. */
const tailChart: PixelSprite = {
  id: 'rm2-opener-tail-chart',
  name: 'fat tail chart',
  tags: ['scene', 'rm2'],
  rows: [
    '.........RR.........',
    '.wwwwwwwwrrwwwwwwwx.',
    '.wwwwwwwwwwwwwwwwwx.',
    '.wwwwwwwwBBBwwwwwwx.',
    '.wwwwwwwBBBBBwwwwwx.',
    '.wwwwwwwBBBBBwwwwwx.',
    '.wwwwwwBBBBBBBwwwwx.',
    '.wwwwwwBBBBBBBwwwwx.',
    '.wwwwwBBBBBBBBBwwwx.',
    '.wwwRRBBBBBBBBBwwwx.',
    '.wRRRRBBBBBBBBBBwwx.',
    '.RRRRRBBBBBBBBBBBwx.',
    '.KKKKKKKKKKKKKKKKKx.',
    '.xxxxxxxxxxxxxxxxxx.',
  ],
};

/** Floor shadows under the keeper and the table, so neither floats. */
const floorShadow: PixelSprite = {
  id: 'rm2-opener-floor-shadow',
  name: 'rm2-opener-floor-shadow',
  tags: ['scene', 'rm2'],
  palette: RM_PALETTE,
  rows: [
    '..ZZZZZZZZZZZZZZZZ.........................ZZZZZZZZZZZZZZZZZZZZZZZZ',
    '....ZZZZZZZZZZZZ.............................ZZZZZZZZZZZZZZZZZZZZZ.',
  ],
};

const base = rmCompose('rm2-opener-base', rmWatchRoom(80, 60, 50), [
  [rmPorthole, 2, 6],
  [tailChart, 57, 9],
  [floorShadow, 12, 52],
  [rmChartTable, 54, 38],
  [rmLogbook, 65, 36],
  [rmRopeCoil, 33, 51],
]);

export const rm2Opener: SceneArt = {
  id: 'rm2-opener',
  label: 'A lighthouse keeper points at a big barometer whose needle shakes in the red storm zone, beside a pinned bell curve with a fat red left tail, as lightning flashes in a porthole.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: rmLightning, x: 8, y: 9 },
    { sprite: rmPortSwell, x: 7, y: 16, motion: { kind: 'drift', amp: 1, periodMs: 3000 } },
    { sprite: rmPortRain, x: 2, y: 6 },
    { sprite: rmFlip(rmKeeperRaise, 'rm2-opener-keeper'), x: 14, y: 24 },
    { sprite: bigBarometer, x: 31, y: 15 },
    { sprite: rmLater(rmLantern, 'rm2-opener-lantern', 2, 200), x: 56, y: 30 },
  ],
};

/** Lesson 2's emblem: a bell curve whose left tail, past the cut-off, is fat and red. 16x10. */
const emblemFatTail: PixelSprite = {
  id: 'rm2-emblem-fat-tail',
  name: 'fat tail',
  tags: ['rm', 'emblem', 'lesson 2'],
  rows: [
    '........www.....',
    '.......wBBBw....',
    '.......BBBBB....',
    '......wBBBBBw...',
    '......BBBBBBB...',
    '.....wBBBBBBBw..',
    '...ssBBBBBBBBB..',
    '.ssRRBBBBBBBBBw.',
    'sRRRRBBBBBBBBBBw',
    'xxxxxxxxxxxxxxxx',
  ],
};

export const rm2Finish: SceneArt = rmKeepsake(
  'rm2-finish',
  'A red and white life ring hanging from a rope, with a bell curve at its center whose left tail is fat and red.',
  emblemFatTail,
);

export const art: LessonArtSet = { opener: rm2Opener, backdrop: rmBackdrop, finish: rm2Finish };
