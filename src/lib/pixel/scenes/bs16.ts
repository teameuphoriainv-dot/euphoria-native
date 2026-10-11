/**
 * Business Strategy lesson 16 opener: a fair test, read off the board before anyone decides.
 *
 * Built on bsHillside. Across the river two test fields grow side by side under signs marked A and B,
 * the same ground and the same weather, one change between them: field A's sprouts are still short,
 * field B's wheat stands tall and golden. On the near hill the strategist points at the board where the
 * results come in, a short bar for A and a tall one for B that climbs as the count grows and earns its
 * star only once it is done. The board's parchment is the brightest broad surface; the moon sits above.
 * Moving: B's bar climbs and the star comes out, the wheat and the sprouts sway, fireflies blink over
 * the fields, the strategist points and blinks, a cloud crosses the moon and stars twinkle.
 */
import type { PixelSprite } from '../types';
import { bsBackdrop } from './bs-backdrop';
import { bsMoved, bsStar } from './bs-kit';
import { bsHillside, bsMirrored, bsStrategistStand } from './bs-kit-a';
import { bsKeepsake } from './bs1-finish';
import type { LessonArtSet, SceneArt } from './types';

const tallyRows = [
  'OOOOOOOOOOO',
  'OyyyyyyGyGO',
  'OyyyyyGgGGO',
  'OyyyyyyGyGO',
  'OyyyyyyyyGO',
  'OyyyyymNNGO',
  'OyyyyyNNNGO',
  'OyyyyyNNNGO',
  'OyqPPyNNNGO',
  'OyPPPyNNNGO',
  'OyPPPyNNNGO',
  'OyPPPyNNNGO',
  'OOOOOOOOOGO',
  'OyyEyynnyGO',
  'OyEyEynynGO',
  'OyEEEynnyGO',
  'OyEyEynynGO',
  'OyEyEynnyGO',
  'OOOOOOOOOOO',
  '...O.D.O...',
  '...O.D.O...',
  '..O..D..O..',
  '..O..D..O..',
  '..O..D..O..',
  '.O...D...O.',
  '.O.......O.',
];

const tally: PixelSprite = {
  id: 'bs16-tally',
  name: 'tally',
  tags: [],
  blurb: "The results board on an easel, feet on the bottom row: a short orchid bar over A and a green bar over B that climbs as the count comes in, and a gold star once it is done.",
  rows: tallyRows,
  frames: [
    bsMoved(tallyRows, {
      1: 'OyyyyyyyyGO',
      2: 'OyyyyyyyyGO',
      3: 'OyyyyyyyyGO',
      5: 'OyyyyyyyyGO',
      6: 'OyyyyyyyyGO',
      7: 'OyyyyyyyyGO',
      8: 'OyqPPyyyyGO',
      9: 'OyPPPymNNGO',
    }),
    bsMoved(tallyRows, {
      1: 'OyyyyyyyyGO',
      2: 'OyyyyyyyyGO',
      3: 'OyyyyyyyyGO',
      5: 'OyyyyyyyyGO',
      6: 'OyyyyyyyyGO',
      7: 'OyyyyymNNGO',
    }),
    bsMoved(tallyRows, {
      1: 'OyyyyyyyyGO',
      2: 'OyyyyyyyyGO',
      3: 'OyyyyyyyyGO',
    }),
    tallyRows,
    tallyRows,
    bsMoved(tallyRows, {
      1: 'OyyyyyyyyGO',
      2: 'OyyyyyyyyGO',
      3: 'OyyyyyyyyGO',
    }),
  ],
  frameMs: 560,
};

const plotARows = [
  'DDDDD........',
  'DwEwD........',
  'DEwED........',
  'DEEED........',
  'DEwED........',
  'DEwED........',
  'DDDDD........',
  '..O...O.....O',
  '..O...ON.N.NO',
  '..O...On.n.nO',
  '..O...ggggggg',
  '..O..OOOOOOOO',
];

const plotA: PixelSprite = {
  id: 'bs16-plot-a',
  name: 'plot-a',
  tags: [],
  blurb: 'Test field A behind a low fence under its sign: short sprouts that sway. Soil on the bottom row.',
  rows: plotARows,
  frames: [
    plotARows,
    plotARows,
    bsMoved(plotARows, {
      8: '..O...O.N.N.N',
    }),
    bsMoved(plotARows, {
      8: '..O...O.N.N.N',
    }),
  ],
  frameMs: 700,
};

const plotBRows = [
  'DDDDD........',
  'DnnwD........',
  'DnwnD........',
  'DnnwD........',
  'DnwnD........',
  'DnnwD..y.y.y.',
  'DDDDD..G.G.G.',
  '..O....G.G.G.',
  '..O....nGnGn.',
  '..O....nnnnn.',
  '..O....nnnnn.',
  '..O...OnnnnnO',
  '..O...OnnnnnO',
  '..O...OnnnnnO',
  '..O...ggggggg',
  '..O..OOOOOOOO',
];

const plotB: PixelSprite = {
  id: 'bs16-plot-b',
  name: 'plot-b',
  tags: [],
  blurb: 'Test field B behind a low fence under its sign: tall golden wheat that sways. Soil on the bottom row.',
  rows: plotBRows,
  frames: [
    plotBRows,
    bsMoved(plotBRows, {
      5: 'DnnwD...y.y.y',
      6: 'DDDDD...G.G.G',
      7: '..O....nGnGnG',
    }),
    plotBRows,
    bsMoved(plotBRows, {
      5: 'DnnwD.y.y.y..',
      6: 'DDDDD.G.G.G..',
      7: '..O...GnGnGn.',
    }),
  ],
  frameMs: 650,
};

const cloud: PixelSprite = {
  id: 'bs16-cloud',
  name: 'cloud',
  tags: [],
  blurb: 'A grey cloud that drifts across the moon.',
  rows: [
    '...DDDD.....',
    '.DDXXXXDDD..',
    'DXXXXXXXXXDD',
    '.DDDDDDDDDD.',
  ],
};

const firefly: PixelSprite = {
  id: 'bs16-firefly',
  name: 'firefly',
  tags: [],
  blurb: 'A firefly over the fields, for a twinkle layer.',
  rows: [
    'm',
  ],
};

const strategistRight = bsMirrored(bsStrategistStand, 'bs16-strategist-right');

export const bs16Opener: SceneArt = {
  id: 'bs16-opener',
  label: 'On a hilltop a strategist points at a board of two results while, across the river, two test fields marked A and B grow side by side, field B clearly taller.',
  width: 80,
  height: 60,
  base: bsHillside,
  layers: [
    { sprite: cloud, x: 33, y: 9, motion: { kind: 'drift', amp: 4, periodMs: 9000 } },
    { sprite: bsStar, x: 8, y: 6, motion: { kind: 'twinkle', periodMs: 2200, min: 0.2 } },
    { sprite: bsStar, x: 56, y: 9, motion: { kind: 'twinkle', periodMs: 2700, phase: 0.5, min: 0.2 } },
    { sprite: bsStar, x: 72, y: 4, motion: { kind: 'twinkle', periodMs: 2400, phase: 0.8, min: 0.2 } },
    { sprite: plotA, x: 54, y: 31 },
    { sprite: plotB, x: 66, y: 27 },
    { sprite: firefly, x: 70, y: 24, motion: { kind: 'twinkle', periodMs: 1700, min: 0.1 } },
    { sprite: firefly, x: 76, y: 26, motion: { kind: 'twinkle', periodMs: 2100, phase: 0.5, min: 0.1 } },
    { sprite: firefly, x: 60, y: 28, motion: { kind: 'twinkle', periodMs: 2500, phase: 0.25, min: 0.1 } },
    { sprite: tally, x: 21, y: 8 },
    { sprite: strategistRight, x: 2, y: 4 },
  ],
};

const emblem: PixelSprite = {
  id: 'bs16-emblem-ab',
  name: 'emblem-ab',
  tags: [],
  blurb: 'Lesson 16 emblem, 16x16: two bars marked A and B, the taller B under a gold star.',
  rows: [
    '...........y....',
    '..........GyG...',
    '...........G....',
    '.........mNNNN..',
    '.........mNNNN..',
    '.........mNNNN..',
    '.........mNNNN..',
    '.........mNNNN..',
    '.qPPPP...mnnNN..',
    '.qPEPP...mnNnN..',
    '.qEPEP...mnnNN..',
    '.qEEEP...mnNnN..',
    '.qEPEP...mnnNN..',
    '.qEPEP...mNNNN..',
    'OOOOOOOOOOOOOOOO',
    '................',
  ],
};

export const bs16Finish: SceneArt = bsKeepsake(
  'bs16-finish',
  'A purple house banner on a gold rod, its roundel showing two bars marked A and B, the taller B under a gold star.',
  emblem,
);

export const art: LessonArtSet = { opener: bs16Opener, backdrop: bsBackdrop, finish: bs16Finish };
