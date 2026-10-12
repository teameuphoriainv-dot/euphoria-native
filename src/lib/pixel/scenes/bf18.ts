/**
 * Behavioral Finance lesson 18: the gambler's fallacy and the hot hand, inside the head.
 *
 * Built on bfMindRoom. One eye watches a roulette wheel spin (Monte Carlo, 1913: black came up 26 times
 * in a row and the room bet red); the other watches a stock's winning streak climb, one green step at
 * a time, and blinks a gold question mark at the next step. Same streak, two biases: System 1 is on a
 * roll, shaking the dice in a raised fist and flinging them, sure the streak means something. The
 * tortoise brings the fix on a card: the odds are still 50%, because the next spin has no memory.
 *
 * The keepsake jar holds a pair of red casino dice, still rolling.
 */
import type { PixelSprite } from '../types';
import {
  bfConsoleLights,
  bfHareSlam,
  bfLater,
  bfMindRoom,
  bfShadowNarrow,
  bfShadowWide,
  bfStar,
  bfStarBig,
  bfTortoise,
} from './bf-kit';
import { BF_TORTOISE_MOUTH, bfStamp } from './bf-kit-b';
import { BF_HARE_FIST, bfHareRaise, bfText } from './bf-kit-c';
import { bfBackdrop } from './bf-backdrop';
import { bfKeepsake } from './bf1-finish';
import type { LessonArtSet, SceneArt } from './types';

/** The left eye: a roulette wheel turning one way while the ball runs round the other. */
const wheel: PixelSprite = {
  id: 'bf18-opener-wheel',
  name: 'bf18-opener-wheel',
  tags: ['scene', 'bf18'],
  rows: [
    '.....OOOOO.....',
    '...OOgggggOO...',
    '..OggKKRRRggO..',
    '.OggKKKRRRRggO.',
    '.OgRKKOOORKKgO.',
    'OgRRROOGOOKKKgO',
    'OgRROOGyGOOKKgO',
    'OgRROGyyyGORRgO',
    'OgKKOOGyGOORRgO',
    'OgKKKOOGOORRWgO',
    '.OgKKROOOKKRgO.',
    '.OggRRRRKKKggO.',
    '..OggRRRKKggO..',
    '...OOgggggOO...',
    '.....OOOOO.....',
  ],
  frames: [
    [
      '.....OOOOO.....',
      '...OOgggggOO...',
      '..OggKKRRRggO..',
      '.OggKKKRRRRggO.',
      '.OgRKKOOORKKgO.',
      'OgRRROOGOOKKKgO',
      'OgRROOGyGOOKKgO',
      'OgRROGyyyGORRgO',
      'OgKKOOGyGOORRgO',
      'OgKKKOOGOORRWgO',
      '.OgKKROOOKKRgO.',
      '.OggRRRRKKKggO.',
      '..OggRRRKKggO..',
      '...OOgggggOO...',
      '.....OOOOO.....',
    ],
    [
      '.....OOOOO.....',
      '...OOgggggOO...',
      '..OggKKKKWggO..',
      '.OggRRKKKRRggO.',
      '.OgRRROOORRRgO.',
      'OgKRROOGOORRKgO',
      'OgKKOOGyGOOKKgO',
      'OgKKOGyyyGOKKgO',
      'OgKKOOGyGOOKKgO',
      'OgKRROOGOORRKgO',
      '.OgRRROOORRRgO.',
      '.OggRRKKKRRggO.',
      '..OggKKKKKggO..',
      '...OOgggggOO...',
      '.....OOOOO.....',
    ],
    [
      '.....OOOOO.....',
      '...OOgggggOO...',
      '..OggRRKKKggO..',
      '.OggRRRKKKKggO.',
      '.OgKRROOOKRRgO.',
      'OgWKKOOGOORRRgO',
      'OgKKOOGyGOORRgO',
      'OgKKOGyyyGOKKgO',
      'OgRROOGyGOOKKgO',
      'OgRRROOGOOKKKgO',
      '.OgRRKOOORRKgO.',
      '.OggKKKKRRRggO.',
      '..OggKKKRRggO..',
      '...OOgggggOO...',
      '.....OOOOO.....',
    ],
    [
      '.....OOOOO.....',
      '...OOgggggOO...',
      '..OggRRRRRggO..',
      '.OggKKRRRKKggO.',
      '.OgKKKOOOKKKgO.',
      'OgRKKOOGOOKKRgO',
      'OgRROOGyGOORRgO',
      'OgRROGyyyGORRgO',
      'OgRROOGyGOORRgO',
      'OgRKKOOGOOKKRgO',
      '.OgKKKOOOKKKgO.',
      '.OggKKRRRKKggO.',
      '..OggWRRRRggO..',
      '...OOgggggOO...',
      '.....OOOOO.....',
    ],
  ],
  frameMs: 190,
};

/** The right eye: a stock up five days running, each green step a little higher than the last. */
const streak: PixelSprite = {
  id: 'bf18-opener-streak',
  name: 'bf18-opener-streak',
  tags: ['scene', 'bf18'],
  rows: [
    '............mN',
    '............NN',
    '.........mN.NN',
    '.........NN.NN',
    '......mN.NN...',
    '......NN.NN...',
    '...mN.NN......',
    '...NN.NN......',
    'mN.NN.........',
    'NN.NN.........',
    'NN............',
    'NN............',
  ],
};

/** Where the streak goes next: the question both biases answer wrongly. */
const next = bfText('bf18-opener-next', '?', 'y');

/** Two dice in a fist, face on and tumbling. */
const dicePair: PixelSprite = {
  id: 'bf18-dice-pair',
  name: 'bf18-dice-pair',
  tags: ['prop', 'bf18'],
  rows: [
    '......DDDDD',
    'DDDDD.DKwwD',
    'DwwwDDDwwwD',
    'DwKwDDDwwKD',
    'DwwwD.DDDDD',
    'DDDDD......',
  ],
};

const dicePairTurned: PixelSprite = {
  id: 'bf18-dice-pair-turned',
  name: 'bf18-dice-pair-turned',
  tags: ['prop', 'bf18'],
  rows: [
    '......DDDDD',
    'DDDDD.DwwwD',
    'DKwwDDDwKwD',
    'DwwwDDDwwwD',
    'DwwKD.DDDDD',
    'DDDDD......',
  ],
};

const dieTumbling: PixelSprite = {
  id: 'bf18-die-tumbling',
  name: 'bf18-die-tumbling',
  tags: ['prop', 'bf18'],
  rows: [
    '..D..',
    '.DwD.',
    'DwKwD',
    '.DwD.',
    '..D..',
  ],
};

const dieFlat: PixelSprite = {
  id: 'bf18-die-flat',
  name: 'bf18-die-flat',
  tags: ['prop', 'bf18'],
  rows: [
    'DDDDD',
    'DKwwD',
    'DwKwD',
    'DwwKD',
    'DDDDD',
  ],
};

const raise = bfHareRaise.frames ?? [bfHareRaise.rows];
const fling = (bfHareSlam.frames ?? [bfHareSlam.rows])[2].map((row) => row.replace(/[Bb]/g, '.'));

/** System 1 on a roll: two shakes of the fist, the throw, the dice landing; the canvas is 32 wide for the throw. */
const hareFrames: PixelSprite = {
  ...bfHareRaise,
  id: 'bf18-hare-frames',
  rows: raise[0],
  frames: [raise[0], raise[1], raise[0], raise[3], fling, fling],
  frameMs: 210,
};

const fist = { x: BF_HARE_FIST.x - 4, y: BF_HARE_FIST.y - 5 };
const shaking = bfStamp(
  bfStamp(hareFrames, 'bf18-hare-shake-a', dicePair, fist.x, fist.y, [0, null, 0, null, null, null]),
  'bf18-hare-shake-b',
  dicePairTurned,
  fist.x + 1,
  fist.y,
  [null, 0, null, 0, null, null],
);
const throwing = bfStamp(
  bfStamp(shaking, 'bf18-hare-throw-a', dieTumbling, 25, 6, [null, null, null, null, 0, null]),
  'bf18-hare-throw-b',
  dieTumbling,
  27,
  11,
  [null, null, null, null, 0, null],
);
const hareRolling = bfStamp(
  bfStamp(throwing, 'bf18-hare-land-a', dieFlat, 25, 22, [null, null, null, null, null, 0]),
  'bf18-hare-rolling',
  dieFlat,
  27,
  17,
  [null, null, null, null, null, 0],
);

/** The fix, on a card in the tortoise's mouth: the odds are still 50%, streak or no streak. */
const oddsText = bfText('bf18-odds-text', '50%', 'K').rows;
const oddsCard: PixelSprite = {
  id: 'bf18-odds-card',
  name: 'bf18-odds-card',
  tags: ['prop', 'bf18'],
  rows: [
    '..DxD..........',
    'OOOxOOOOOOOOOOO',
    'OwwwwwwwwwwwwwO',
    ...oddsText.map((row) => `Ow${row.replace(/\./g, 'w')}wO`),
    'OwwwwwwwwwwwwwO',
    'OOOOOOOOOOOOOOO',
  ],
};

const tortoiseOdds = bfStamp(bfTortoise, 'bf18-tortoise-odds', oddsCard, BF_TORTOISE_MOUTH.x, BF_TORTOISE_MOUTH.y, BF_TORTOISE_MOUTH.dys);

const consoleLightsLater = bfLater(bfConsoleLights, 'bf18-opener-console-lights-later', 1, 560);

export const bf18Opener: SceneArt = {
  id: 'bf18-opener',
  label: "Inside an investor's head, one eye watches a roulette wheel spin and the other a stock's winning streak, as a hare shakes and throws dice while a calm tortoise holds up a card reading 50%.",
  width: 80,
  height: 60,
  base: bfMindRoom,
  layers: [
    { sprite: wheel, x: 14, y: 14 },
    { sprite: bfStar, x: 11, y: 19, motion: { kind: 'twinkle', periodMs: 1900, phase: 0.3, min: 0.2 } },
    { sprite: bfStarBig, x: 29, y: 25, motion: { kind: 'twinkle', periodMs: 2500, min: 0.3 } },
    { sprite: streak, x: 50, y: 15 },
    { sprite: next, x: 65, y: 15, motion: { kind: 'twinkle', periodMs: 1300, min: 0.25 } },
    { sprite: bfConsoleLights, x: 24, y: 34 },
    { sprite: consoleLightsLater, x: 36, y: 34 },
    { sprite: bfShadowWide, x: 1, y: 55 },
    { sprite: bfShadowNarrow, x: 48, y: 54 },
    { sprite: tortoiseOdds, x: 1, y: 39 },
    { sprite: hareRolling, x: 47, y: 27 },
  ],
};

/** The keepsake emblem: two red casino dice, their faces turning over as they roll. */
const emblemDice: PixelSprite = {
  id: 'bf18-emblem-dice',
  name: 'bf18-emblem-dice',
  tags: ['emblem', 'bf', 'lesson-18'],
  blurb: "Lesson 18's emblem: the gambler's fallacy caught as a pair of red dice, rolling with no memory.",
  rows: [
    '.......11111111.',
    '......1ssssssss1',
    '......1sRRRRRRr1',
    '......1sRRRRRRr1',
    '......1sRRWWRRr1',
    '......1sRRWWRRr1',
    '......1sRRRRRRr1',
    '......1sRRRRRRr1',
    '.11111111rrrrrr1',
    '1ssssssss111111.',
    '1sWWRRWWr1......',
    '1sWWRRWWr1......',
    '1sRRRRRRr1......',
    '1sRRRRRRr1......',
    '1sWWRRWWr1......',
    '1sWWRRWWr1......',
    '1srrrrrrr1......',
    '.11111111.......',
  ],
  frames: [
    [
      '.......11111111.',
      '......1ssssssss1',
      '......1sRRRRRRr1',
      '......1sRRRRRRr1',
      '......1sRRWWRRr1',
      '......1sRRWWRRr1',
      '......1sRRRRRRr1',
      '......1sRRRRRRr1',
      '.11111111rrrrrr1',
      '1ssssssss111111.',
      '1sWWRRWWr1......',
      '1sWWRRWWr1......',
      '1sRRRRRRr1......',
      '1sRRRRRRr1......',
      '1sWWRRWWr1......',
      '1sWWRRWWr1......',
      '1srrrrrrr1......',
      '.11111111.......',
    ],
    [
      '.......11111111.',
      '......1ssssssss1',
      '......1sWWRRWWr1',
      '......1sWWRRWWr1',
      '......1sRRRRRRr1',
      '......1sRRRRRRr1',
      '......1sWWRRWWr1',
      '......1sWWRRWWr1',
      '.11111111rrrrrr1',
      '1ssssssss111111.',
      '1sWWRRRRr1......',
      '1sWWRRRRr1......',
      '1sRRRRRRr1......',
      '1sRRRRRRr1......',
      '1sRRRRWWr1......',
      '1sRRRRWWr1......',
      '1srrrrrrr1......',
      '.11111111.......',
    ],
    [
      '.......11111111.',
      '......1ssssssss1',
      '......1sWWRRRRr1',
      '......1sWWRRRRr1',
      '......1sRRRRRRr1',
      '......1sRRRRRRr1',
      '......1sRRRRWWr1',
      '......1sRRRRWWr1',
      '.11111111rrrrrr1',
      '1ssssssss111111.',
      '1sRRRRRRr1......',
      '1sRRRRRRr1......',
      '1sRRWWRRr1......',
      '1sRRWWRRr1......',
      '1sRRRRRRr1......',
      '1sRRRRRRr1......',
      '1srrrrrrr1......',
      '.11111111.......',
    ],
  ],
  frameMs: 900,
};

export const bf18Finish: SceneArt = bfKeepsake(
  'bf18-finish',
  'A corked glass jar with a paper tag, holding a pair of red casino dice whose faces keep turning over, with bubbles rising inside and sparkles around it.',
  emblemDice,
);

export const art: LessonArtSet = { opener: bf18Opener, backdrop: bfBackdrop, finish: bf18Finish };
