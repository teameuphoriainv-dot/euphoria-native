/**
 * Behavioral Finance lesson 17: the disposition effect, selling winners too early, inside the head.
 *
 * Built on bfMindRoom. Through the left eye a winner climbs, gets cut (a big red x where it was sold),
 * and a dotted line shows where it went on to; through the right, Odean's finding as two bars: 14.8% of
 * gains realized against 9.8% of losses, winners sold and losers held. In the room it is cutting the
 * flowers and watering the weeds: System 1 reaches in with scissors to snip a flower in full bloom, a
 * petal already falling, while the weed it keeps wilts in the same clay pot against its foot. The
 * tortoise is the rule that lets winners run: it waters the flower.
 *
 * The keepsake jar holds a flower cut early, its bloom tipping away from the stump.
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

/** The left eye: a winner climbing, sold partway up (the big red x), and the dotted climb it went on to. */
const winnerCut: PixelSprite = {
  id: 'bf17-opener-winner',
  name: 'bf17-opener-winner',
  tags: ['scene', 'bf17'],
  rows: [
    '...................m',
    '..................n.',
    '........R...R...n...',
    '.........R.R..n.....',
    '..........R.n.......',
    '........NR.R........',
    '.......NR...R.......',
    '.....NN.............',
    '....N...............',
    '..NN................',
    'NN..................',
  ],
};

/**
 * The right eye: what Odean found in 10,000 accounts. Investors realized 14.8% of their gains (the green
 * bar, full height) but only 9.8% of their losses (the red bar, two thirds of it): winners sold, losers held.
 */
const odeanBars: PixelSprite = {
  id: 'bf17-opener-odean',
  name: 'bf17-opener-odean',
  tags: ['scene', 'bf17'],
  rows: [
    '.mmmm.......',
    '.NNNn.......',
    '.NNNn.......',
    '.NNNn.......',
    '.NNNn..ssss.',
    '.NNNn..RRRr.',
    '.NNNn..RRRr.',
    '.NNNn..RRRr.',
    '.NNNn..RRRr.',
    '.NNNn..RRRr.',
    '.NNNn..RRRr.',
    '.NNNn..RRRr.',
    'XXXXXXXXXXXX',
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

/**
 * The loser it keeps: a weed in the flower's own clay pot, on the floor against the hare's foot, its
 * stalk bent over and its spiky leaves drooping. Flower and weed stand side by side, winner and loser.
 */
const weed: PixelSprite = {
  id: 'bf17-weed',
  name: 'bf17-weed',
  tags: ['prop', 'bf17'],
  rows: [
    '.ggg.....',
    'g.g.g....',
    '..g.n....',
    '.....n...',
    '.....n...',
    'g....n..g',
    '.g.g.n.g.',
    '..gngngg.',
    '.ggnnnng.',
    '.1KKKKK1.',
    '111111111',
    '133333321',
    '.1333321.',
    '.1333221.',
    '.1322221.',
    '..11111..',
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
  label: "Inside an investor's head, a hare snips a flower in full bloom with scissors while keeping a wilting weed in a pot against its foot, the left eye shows a winner sold too soon and the right eye a tall green bar of winners sold beside a shorter red bar of losers sold, and a calm tortoise waters the flower.",
  width: 80,
  height: 60,
  base: bfMindRoom,
  layers: [
    { sprite: bfStarBig, x: 26, y: 24, motion: { kind: 'twinkle', periodMs: 2400, min: 0.3 } },
    { sprite: bfStar, x: 67, y: 18, motion: { kind: 'twinkle', periodMs: 1900, phase: 0.5, min: 0.2 } },
    { sprite: winnerCut, x: 12, y: 16 },
    { sprite: odeanBars, x: 53, y: 15 },
    { sprite: bfConsoleLights, x: 24, y: 34 },
    { sprite: consoleLightsLater, x: 56, y: 34 },
    { sprite: bfShadowWide, x: 1, y: 54 },
    { sprite: bfShadowNarrow, x: 56, y: 54 },
    { sprite: flower, x: 43, y: 31 },
    { sprite: petal, x: 51, y: 37 },
    { sprite: tortoiseWatering, x: 0, y: 39 },
    { sprite: drops, x: 43, y: 46 },
    { sprite: weed, x: 52, y: 43 },
    { sprite: hareSnip, x: 47, y: 28 },
  ],
};

const emblemFlowerCut: PixelSprite = {
  id: 'bf17-emblem-flower-cut',
  name: 'bf17-emblem-flower-cut',
  tags: ['emblem', 'bf', 'lesson-17'],
  blurb: "Lesson 17's emblem: the disposition effect caught as a flower snipped off in full bloom, the top tipping away from its stump, a petal falling.",
  rows: [
    '......fFFf....',
    '....fFFFFFFf..',
    '...fFFfGGfFFf.',
    '...FFFGyyGFFF.',
    '...fFFGyGGFFf.',
    '....fFFfGfFf..',
    '.....fFFFFf...',
    '.......nN.....',
    '.......nN..Ff.',
    '......nnN..f..',
    '....mnnN......',
    '......nN......',
    '......nW......',
    '..............',
    '..............',
    '.....WN.......',
    '......N.......',
    '.....nN.......',
    '.....nN.......',
  ],
};

export const bf17Finish: SceneArt = bfKeepsake(
  'bf17-finish',
  'A corked glass jar with a paper tag, holding a pink flower snipped off its stem, the bloom tipping away from the cut stump and a petal falling, with bubbles rising inside and sparkles around it.',
  emblemFlowerCut,
);

export const art: LessonArtSet = { opener: bf17Opener, backdrop: bfBackdrop, finish: bf17Finish };
