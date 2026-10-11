/**
 * Behavioral Finance lesson 12: the sunk cost fallacy, inside the investor's head.
 *
 * Built on bfMindRoom. Through the left eye a ship is going down by the stern; through the right a
 * price falls step by step with a coin dropped in at every step, escalation of commitment drawn as a
 * chart. In the room System 1 throws good money after bad: the hare lobs coin after coin into a pit in
 * the floor, each one vanishing with a glint. The tortoise comes in from the other side with the
 * question that ends it, the clean slate test: a blank slate.
 *
 * The keepsake jar holds a sinking ship.
 */
import type { PixelSprite } from '../types';
import {
  bfBubble,
  bfConsoleLights,
  bfLater,
  bfMindRoom,
  bfShadowNarrow,
  bfShadowWide,
  bfStar,
  bfStarBig,
  bfTortoise,
} from './bf-kit';
import { bfMirror } from './bf-kit-a';
import { BF_TORTOISE_MOUTH, bfCoin, bfHareGesture, bfStamp } from './bf-kit-b';
import { bfBackdrop } from './bf-backdrop';
import { bfKeepsake } from './bf1-finish';
import type { LessonArtSet, SceneArt } from './types';

/** The left eye: a ship going down by the stern, sail still set (the sea layer hides what has sunk). */
const ship: PixelSprite = {
  id: 'bf12-opener-ship',
  name: 'bf12-opener-ship',
  tags: ['scene', 'bf12'],
  rows: [
    '..........D.....',
    '.........DW.....',
    '.........DwW....',
    '........DwwwW...',
    '........DwwwwW..',
    'OO.....D........',
    'OyOOO..D........',
    '.OGGyOOOO.......',
    '..OGGGGGyOOO....',
    '...OGGggggGGO...',
  ],
};

/** The sea the ship is sinking into, rolling. */
const sea: PixelSprite = {
  id: 'bf12-opener-sea',
  name: 'bf12-opener-sea',
  tags: ['scene', 'bf12'],
  rows: [
    'BbB.BbB.BbB.BbB.BbB.',
    'bbbbbbbbbbbbbbbbbbbb',
    '.b...b...b...b...b..',
  ],
  frames: [
    [
      'BbB.BbB.BbB.BbB.BbB.',
      'bbbbbbbbbbbbbbbbbbbb',
      '.b...b...b...b...b..',
    ],
    [
      '.BbB.BbB.BbB.BbB.BbB',
      'bbbbbbbbbbbbbbbbbbbb',
      '...b...b...b...b...b',
    ],
  ],
  frameMs: 700,
};

/** The right eye: the price falling step by step, a coin added under every step. */
const averagingDown: PixelSprite = {
  id: 'bf12-opener-averaging-down',
  name: 'bf12-opener-averaging-down',
  tags: ['scene', 'bf12'],
  rows: [
    'RR..................',
    '..R.................',
    '...RRR..............',
    '...yG.R.............',
    '...Gg..RRR..........',
    '.........R..........',
    '.......yG.RRR.......',
    '.......Gg....R......',
    '.............RRR....',
    '...........yG...R...',
    '...........Gg....RRW',
  ],
};

/** The hole in the floor the money goes into, a couple of coins glinting at the bottom. */
const pit: PixelSprite = {
  id: 'bf12-pit',
  name: 'bf12-pit',
  tags: ['prop', 'bf12'],
  palette: { Z: '#07060B' },
  rows: [
    '...XXXXXXXXX...',
    '.XXZZZZZZZZZXX.',
    'XZZZZZZZZZZZZZD',
    'DZZZgZZZZZOZZZD',
    '.DZZZZZZOgZZZD.',
    '...DDDDDDDDD...',
  ],
};

/** A coin lobbed from the hare's paw: leaving it, dropping, then a glint in the pit as it lands. */
const coinArc: PixelSprite = {
  id: 'bf12-coin-arc',
  name: 'bf12-coin-arc',
  tags: ['prop', 'bf12'],
  rows: [
    '...............',
    '...............',
    '...............',
    '...............',
    '...............',
    '...............',
    '...............',
    '...............',
    '...............',
    '...............',
    '...............',
    '...............',
    '...............',
    '...............',
    '...............',
    '...............',
    '...............',
    '...........y...',
    '..........yWy..',
    '...........y...',
  ],
  frames: [
    [
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
      '...........y...',
      '..........yWy..',
      '...........y...',
    ],
    [
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
      '...........w...',
      '...............',
    ],
    [
      '...............',
      '...............',
      '...............',
      '..OOO..........',
      '.OyyGO.........',
      '.OyGgO.........',
      '.OGggO.........',
      '..OOO..........',
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
    ],
    [
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
      '........OOO....',
      '.......OyyGO...',
      '.......OyGgO...',
      '.......OGggO...',
      '........OOO....',
      '...............',
      '...............',
      '...............',
      '...............',
      '...............',
    ],
  ],
  frameMs: 300,
};

/** System 1 throwing good money after bad: a coin held up, then thrown, again and again. */
const hareToss = bfStamp(bfHareGesture, 'bf12-hare-toss', bfCoin, 18, 0, [0, null]);

/** The fix in the tortoise's mouth: a clean slate, nothing written on it yet. */
const slate: PixelSprite = {
  id: 'bf12-slate',
  name: 'bf12-slate',
  tags: ['prop', 'bf12'],
  rows: [
    '..DxD..',
    'OOOOOOO',
    'OgggggO',
    'OgwwwgO',
    'OgwWwgO',
    'OgwwwgO',
    'OgggggO',
    'OOOOOOO',
  ],
};

const tortoiseSlate = bfMirror(
  bfStamp(bfTortoise, 'bf12-tortoise-slate-right', slate, BF_TORTOISE_MOUTH.x, BF_TORTOISE_MOUTH.y, BF_TORTOISE_MOUTH.dys),
  'bf12-tortoise-slate',
);

const consoleLightsLater = bfLater(bfConsoleLights, 'bf12-opener-console-lights-later', 2, 490);

export const bf12Opener: SceneArt = {
  id: 'bf12-opener',
  label: "Inside an investor's head, a hare keeps throwing coins into a pit in the floor while the eyes show a sinking ship and a falling price, and a calm tortoise walks in holding a clean slate.",
  width: 80,
  height: 60,
  base: bfMindRoom,
  layers: [
    { sprite: bfStarBig, x: 26, y: 16, motion: { kind: 'twinkle', periodMs: 2300, min: 0.3 } },
    { sprite: bfStar, x: 66, y: 26, motion: { kind: 'twinkle', periodMs: 2900, phase: 0.6, min: 0.2 } },
    { sprite: ship, x: 13, y: 16 },
    { sprite: sea, x: 12, y: 24 },
    { sprite: bfBubble, x: 28, y: 21, motion: { kind: 'rise', amp: 4, periodMs: 1900 } },
    { sprite: averagingDown, x: 49, y: 16 },
    { sprite: bfConsoleLights, x: 44, y: 34 },
    { sprite: consoleLightsLater, x: 69, y: 34 },
    { sprite: bfShadowNarrow, x: 4, y: 54 },
    { sprite: bfShadowWide, x: 43, y: 54 },
    { sprite: pit, x: 29, y: 50 },
    { sprite: tortoiseSlate, x: 40, y: 39 },
    { sprite: hareToss, x: 3, y: 28 },
    { sprite: coinArc, x: 25, y: 33 },
  ],
};

const emblemShip: PixelSprite = {
  id: 'bf12-emblem-ship',
  name: 'bf12-emblem-ship',
  tags: ['emblem', 'bf', 'lesson-12'],
  blurb: "Lesson 12's emblem: the sunk cost caught as a ship going down by the stern.",
  rows: [
    '..........D.....',
    '.........DW.....',
    '.........DwW..Q.',
    '........DwwwW...',
    '........DwwwwW..',
    'OO.....D......Q.',
    'OyOOO..D....Q...',
    '.OGGyOOOO.......',
    '..OGGGGGyOOO....',
    'BbBOGGggggGBbBbB',
    'bbbbOggggbbbbbbb',
    'bBbbbbbbbbbbbbBb',
    '.bbbbbbbbbbbbbb.',
  ],
};

export const bf12Finish: SceneArt = bfKeepsake(
  'bf12-finish',
  'A corked glass jar with a paper tag, holding a little ship going down by the stern into blue waves, with bubbles rising inside and sparkles around it.',
  emblemShip,
);

export const art: LessonArtSet = { opener: bf12Opener, backdrop: bfBackdrop, finish: bf12Finish };
