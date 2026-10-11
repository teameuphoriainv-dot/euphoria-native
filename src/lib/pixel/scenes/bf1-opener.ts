/**
 * Behavioral Finance lesson 1 opener: your brain vs. your money, inside the investor's head mid-crash.
 *
 * Built from the kit (bf-kit.ts) on bfMindRoom. Through the eyes the market climbs in green, then
 * breaks and falls in red, and the red keeps falling. System 1 has the controls: the hare slams the
 * big red button under the amygdala's siren with the fear meter pinned, a "!" lifting off its head.
 * System 2 is not wrong, it is late: the tortoise is only now walking in with the written plan.
 * Only the window views are drawn here; everything else is a kit sprite placed for this lesson.
 */
import type { PixelSprite } from '../types';
import {
  bfConsoleLights,
  bfGauge,
  bfHareSlam,
  bfLater,
  bfMindRoom,
  bfPanic,
  bfPanicButton,
  bfShadowNarrow,
  bfShadowWide,
  bfSiren,
  bfStar,
  bfStarBig,
  bfTortoisePlan,
} from './bf-kit';
import type { SceneArt } from './types';

const climb: PixelSprite = {
  id: 'bf1-opener-climb',
  name: 'bf1-opener-climb',
  tags: ['scene', 'bf1'],
  blurb: "The left eye: the market climbing in green before the break.",
  rows: [
    '........................N',
    '.......................N.',
    '.......................N.',
    '..................NN..N..',
    '.................N..NN...',
    '................N........',
    '...........NN..N.........',
    '..........N..NN..........',
    '.........N...............',
    '...NNN..N................',
    '.NN...NN.................',
    'N........................',
  ],
};

const crash: PixelSprite = {
  id: 'bf1-opener-crash',
  name: 'bf1-opener-crash',
  tags: ['scene', 'bf1'],
  blurb: "The right eye: the same line breaking and falling in red.",
  rows: [
    'R...............',
    '.RR.RR..........',
    '...R..R.........',
    '.......R........',
    '.......R.RR.....',
    '........R..R....',
    '............R...',
    '............R...',
    '.............RRR',
  ],
};

const crashTip: PixelSprite = {
  id: 'bf1-opener-crash-tip',
  name: 'bf1-opener-crash-tip',
  tags: ['scene', 'bf1'],
  blurb: "The end of the crash line, still falling, its marker blinking at the bottom.",
  rows: [
    'R.....',
    '......',
    '......',
    '......',
    '......',
  ],
  frames: [
    [
      'R.....',
      '......',
      '......',
      '......',
      '......',
    ],
    [
      'R.....',
      '.R....',
      '......',
      '......',
      '......',
    ],
    [
      'R.....',
      '.R....',
      '..R...',
      '......',
      '......',
    ],
    [
      'R.....',
      '.R....',
      '..RR..',
      '....R.',
      '......',
    ],
    [
      'R.....',
      '.R....',
      '..RR..',
      '....R.',
      '....s.',
    ],
  ],
  frameMs: 380,
};

/** The right-hand console lights, out of step with the left. */
const consoleLightsLater = bfLater(bfConsoleLights, 'bf1-opener-console-lights-later', 2, 530);

export const bf1Opener: SceneArt = {
  id: 'bf1-opener',
  label: "Inside an investor's head during a crash, a panicked hare slams a big red sell button under a flashing alarm while a calm tortoise walks in carrying the written plan.",
  width: 80,
  height: 60,
  base: bfMindRoom,
  layers: [
    { sprite: climb, x: 9, y: 15 },
    { sprite: crash, x: 46, y: 14 },
    { sprite: crashTip, x: 61, y: 22 },
    { sprite: bfStarBig, x: 13, y: 14, motion: { kind: 'twinkle', periodMs: 2400, min: 0.3 } },
    { sprite: bfStar, x: 27, y: 13, motion: { kind: 'twinkle', periodMs: 1900, phase: 0.4, min: 0.2 } },
    { sprite: bfStar, x: 66, y: 15, motion: { kind: 'twinkle', periodMs: 2700, phase: 0.7, min: 0.2 } },
    { sprite: bfSiren, x: 33, y: 8 },
    { sprite: bfGauge, x: 33, y: 26 },
    { sprite: bfConsoleLights, x: 24, y: 34 },
    { sprite: consoleLightsLater, x: 69, y: 34 },
    { sprite: bfShadowWide, x: 2, y: 55 },
    { sprite: bfShadowNarrow, x: 45, y: 54 },
    { sprite: bfPanicButton, x: 60, y: 45 },
    { sprite: bfTortoisePlan, x: 1, y: 39 },
    { sprite: bfHareSlam, x: 44, y: 27 },
    { sprite: bfPanic, x: 46, y: 27, motion: { kind: 'rise', amp: 3, periodMs: 1400 } },
  ],
};
