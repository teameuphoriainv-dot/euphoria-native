/**
 * Behavioral Finance lesson 17: the disposition effect, selling winners too early, inside the head.
 *
 * Built on bfMindRoom. Through the left eye a winner climbs, gets cut (a red x where it was sold), and
 * a dotted line shows where it went on to; through the right a loser keeps falling, still held. In the
 * room it is cutting the flowers and watering the weeds: System 1 reaches in with scissors to snip a
 * flower in full bloom, a petal already falling, while the weed it keeps sits wilting on the console.
 * The tortoise is the rule that lets winners run: it waters the flower.
 *
 * The keepsake jar holds a flower cut early.
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
import { bfMirror } from './bf-kit-a';
import { BF_TORTOISE_MOUTH, bfStamp } from './bf-kit-b';
import { bfBackdrop } from './bf-backdrop';
import { bfKeepsake } from './bf1-finish';
import type { LessonArtSet, SceneArt } from './types';

/** The left eye: a winner climbing, sold partway up (the red x), and the dotted climb it went on to. */
const winnerCut: PixelSprite = {
  id: 'bf17-opener-winner',
  name: 'bf17-opener-winner',
  tags: ['scene', 'bf17'],
  rows: [
    '...................m',
    '..................n.',
    '................n...',
    '.........R.R..n.....',
    '..........R.n.......',
    '........NR.R........',
    '.......N............',
    '.....NN.............',
    '....N...............',
    '..NN................',
    'NN..................',
  ],
};

/** The right eye: a loser still falling, still held. */
const loserHeld: PixelSprite = {
  id: 'bf17-opener-loser',
  name: 'bf17-opener-loser',
  tags: ['scene', 'bf17'],
  rows: [
    'RR..................',
    '..RR................',
    '....R...............',
    '.....RR.............',
    '.......R............',
    '........RR..........',
    '..........RR........',
    '............RR......',
    '..............RRR...',
    '.................RRw',
  ],
};

/** The winner: a flower in full bloom in a clay pot, leaves out, still growing. */
const flower: PixelSprite = {
  id: 'bf17-flower',
  name: 'bf17-flower',
  tags: ['prop', 'bf17'],
  rows: [
    '...fFf...',
    '.fFFFFFf.',
    'fFFfGfFFf',
    'FFFGyGFFF',
    'fFFfGfFFf',
    '.fFFFFFf.',
    '...fFf...',
    '....n....',
    '....N....',
    '....N....',
    '....N....',
    '....N.nm.',
    '....Nnn..',
    '.mn.N....',
    '..nnN....',
    '....N....',
    '....N....',
    '....n....',
    '.1KKKKK1.',
    '111111111',
    '133333321',
    '.1333321.',
    '.1333221.',
    '.1322221.',
    '..11111..',
  ],
};

/** A petal coming off the cut flower, drifting down. */
const petal: PixelSprite = {
  id: 'bf17-petal',
  name: 'bf17-petal',
  tags: ['prop', 'bf17'],
  rows: [
    'F...',
    '....',
    '....',
    '....',
    '....',
    '....',
    '....',
    '....',
    '....',
    '....',
    '....',
    '....',
  ],
  frames: [
    [
      'F...',
      '....',
      '....',
      '....',
      '....',
      '....',
      '....',
      '....',
      '....',
      '....',
      '....',
      '....',
    ],
    [
      '....',
      '....',
      '....',
      '..F.',
      '....',
      '....',
      '....',
      '....',
      '....',
      '....',
      '....',
      '....',
    ],
    [
      '....',
      '....',
      '....',
      '....',
      '....',
      '....',
      '.f..',
      '....',
      '....',
      '....',
      '....',
      '....',
    ],
    [
      '....',
      '....',
      '....',
      '....',
      '....',
      '....',
      '....',
      '....',
      '....',
      '...f',
      '....',
      '....',
    ],
  ],
  frameMs: 450,
};

/** The loser it keeps: a weed in a pot on the console, wilting. */
const weed: PixelSprite = {
  id: 'bf17-weed',
  name: 'bf17-weed',
  tags: ['prop', 'bf17'],
  rows: [
    '..X....',
    '.XxX...',
    'X..xX..',
    '...x.X.',
    '...x...',
    '.11111.',
    '.13321.',
    '..111..',
  ],
};

const scissorsOpen: PixelSprite = {
  id: 'bf17-scissors-open',
  name: 'bf17-scissors-open',
  tags: ['prop', 'bf17'],
  rows: [
    '......ww',
    '....ww..',
    'RRxx....',
    '....ww..',
    '......ww',
  ],
};

const scissorsShut: PixelSprite = {
  id: 'bf17-scissors-shut',
  name: 'bf17-scissors-shut',
  tags: ['prop', 'bf17'],
  rows: [
    '........',
    '........',
    'RRxwwwww',
    '........',
    '........',
  ],
};

const reach = (bfHareSlam.frames ?? [bfHareSlam.rows])[2].map((row) => row.replace(/[Bb]/g, '.'));
const reachTwice: PixelSprite = { ...bfHareSlam, id: 'bf17-reach', rows: reach, frames: [reach, reach], frameMs: 420 };

/** System 1 selling the winner: arm out, scissors snapping open and shut at the stem; it faces left. */
const hareSnip = bfMirror(
  bfStamp(bfStamp(reachTwice, 'bf17-hare-snip-open', scissorsOpen, 23, 11, [0, null]), 'bf17-hare-snip-shut', scissorsShut, 23, 11, [null, 0]),
  'bf17-hare-snip',
);

/** The fix in the tortoise's mouth: a watering can, its rose tipped at the flower. */
const wateringCan: PixelSprite = {
  id: 'bf17-watering-can',
  name: 'bf17-watering-can',
  tags: ['prop', 'bf17'],
  rows: [
    '..DDDD.....DD',
    '.D....D...DBD',
    'DDDDDDDD.DBD.',
    'DBBBBBBDDBD..',
    'DBwBBBBBBD...',
    'DBBBBBBBD....',
    'DbbbbbbbD....',
    '.DDDDDDD.....',
  ],
};

const tortoiseWatering = bfStamp(bfTortoise, 'bf17-tortoise-watering', wateringCan, BF_TORTOISE_MOUTH.x - 1, BF_TORTOISE_MOUTH.y, BF_TORTOISE_MOUTH.dys);

/** Water falling from the can's rose onto the flower. */
const drops: PixelSprite = {
  id: 'bf17-drops',
  name: 'bf17-drops',
  tags: ['prop', 'bf17'],
  rows: [
    'B..',
    '...',
    '.B.',
    '...',
    '...',
  ],
  frames: [
    [
      'B..',
      '...',
      '.B.',
      '...',
      '...',
    ],
    [
      '...',
      'B..',
      '...',
      '.B.',
      '..B',
    ],
  ],
  frameMs: 400,
};

const consoleLightsLater = bfLater(bfConsoleLights, 'bf17-opener-console-lights-later', 3, 470);

export const bf17Opener: SceneArt = {
  id: 'bf17-opener',
  label: "Inside an investor's head, a hare snips a flower in full bloom with scissors while a weed wilts on the console and the eyes show a winner sold too soon, and a calm tortoise waters the flower.",
  width: 80,
  height: 60,
  base: bfMindRoom,
  layers: [
    { sprite: bfStarBig, x: 26, y: 24, motion: { kind: 'twinkle', periodMs: 2400, min: 0.3 } },
    { sprite: bfStar, x: 64, y: 17, motion: { kind: 'twinkle', periodMs: 1900, phase: 0.5, min: 0.2 } },
    { sprite: winnerCut, x: 12, y: 16 },
    { sprite: loserHeld, x: 49, y: 17 },
    { sprite: bfConsoleLights, x: 24, y: 34 },
    { sprite: consoleLightsLater, x: 56, y: 34 },
    { sprite: weed, x: 73, y: 26 },
    { sprite: bfShadowWide, x: 1, y: 54 },
    { sprite: bfShadowNarrow, x: 56, y: 54 },
    { sprite: flower, x: 43, y: 31 },
    { sprite: petal, x: 51, y: 37 },
    { sprite: tortoiseWatering, x: 0, y: 39 },
    { sprite: drops, x: 43, y: 46 },
    { sprite: hareSnip, x: 47, y: 28 },
  ],
};

const emblemFlowerCut: PixelSprite = {
  id: 'bf17-emblem-flower-cut',
  name: 'bf17-emblem-flower-cut',
  tags: ['emblem', 'bf', 'lesson-17'],
  blurb: "Lesson 17's emblem: the disposition effect caught as a flower cut off in full bloom, a petal falling.",
  rows: [
    '....fFFf......',
    '..fFFFFFFf....',
    '.fFFfGGfFFf...',
    '.FFFGyyGFFF...',
    '.fFFGyGGFFf...',
    '..fFFfGfFf....',
    '...fFFFFf.....',
    '.....nN.......',
    '.....nN...Ff..',
    '....nnN...f...',
    '...mnnN.......',
    '.....nN.......',
    '.....nW.......',
    '..............',
    '.....WN.......',
    '......N.......',
    '.....nN.......',
    '.....nN.......',
  ],
};

export const bf17Finish: SceneArt = bfKeepsake(
  'bf17-finish',
  'A corked glass jar with a paper tag, holding a pink flower cut off at the stem, a petal falling, with bubbles rising inside and sparkles around it.',
  emblemFlowerCut,
);

export const art: LessonArtSet = { opener: bf17Opener, backdrop: bfBackdrop, finish: bf17Finish };
