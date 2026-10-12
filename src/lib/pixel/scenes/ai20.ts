/**
 * Alternative Investments lesson 20: liquidity and lock-ups.
 *
 * The opener is the vault gallery (ai-kit.ts) with its round door shut for the term: two chains
 * crossed over the face and a gold padlock through them where the wheel would turn, because money in
 * an illiquid fund cannot come out until the lock-up ends, or a gate opens. The collector waits
 * beside it, holding up an hourglass, under a wall clock that keeps going round. Only small layers
 * move: sand trickles through the hourglass, the clock's minute hand turns, the padlock glints, the
 * collector blinks and a mote drifts up. The keepsake is the padlock (ai-kit-c.ts, where the advanced
 * capstone finds it again).
 */
import type { PixelSprite } from '../types';
import { aiBackdrop } from './ai-backdrop';
import { aiCollectorBlink, aiCompose, aiGallery, aiGlintGold, aiKeepsake, aiMoteGold, aiShadow, aiVaultDoor, aiVaultWheel } from './ai-kit';
import { AI_COLLECTOR_EYE_FLIPPED, AI_COLLECTOR_HAND, aiCollectorRaise, aiFlip } from './ai-kit-a';
import { aiPadlock } from './ai-kit-c';
import type { LessonArtSet, SceneArt } from './types';

/** Two steel chains crossed over the vault door's face, meeting at its hub (13, 13), rimmed in ink. */
const chains: PixelSprite = {
  id: 'ai20-chains',
  name: 'ai20-chains',
  tags: ['scene', 'ai'],
  blurb: "Two steel chains crossed in an X over a round vault door.",
  rows: [
    '...........................',
    '...........................',
    '...........................',
    '....kk...............kk....',
    '...kwxk.............kxwk...',
    '....kwxk...........kxwk....',
    '.....kXDk.........kDXk.....',
    '......kXDk.......kDXk......',
    '.......kwxk.....kxwk.......',
    '........kwxk...kxwk........',
    '.........kXDk.kDXk.........',
    '..........kXDkDXk..........',
    '...........kwxwk...........',
    '...........kxwxk...........',
    '..........kDXkXDk..........',
    '.........kDXk.kXDk.........',
    '........kxwk...kwxk........',
    '.......kxwk.....kwxk.......',
    '......kDXk.......kXDk......',
    '.....kDXk.........kXDk.....',
    '....kxwk...........kwxk....',
    '...kxwk.............kwxk...',
    '..kDXk...............kXDk..',
    '...kk.................kk...',
    '...........................',
    '...........................',
    '...........................',
  ],
};

/** An ink rim round the padlock's outline, stamped under it so its steel shackle parts from the door. */
const lockRim: PixelSprite = {
  id: 'ai20-lock-rim',
  name: 'ai20-lock-rim',
  tags: [],
  rows: [
    '.....kkkkkk.....',
    '....kkkkkkkk....',
    '...kkkkkkkkkk...',
    '..kkkkkkkkkkkk..',
    '..kkkkkkkkkkkk..',
    '..kkkkk..kkkkk..',
    '.kkkkkkkkkkkkkk.',
    'kkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkk',
    '.kkkkkkkkkkkkkk.',
  ],
};

/** The wheel, stamped still: it cannot turn while the door is chained. */
const stuckWheel: PixelSprite = { id: 'ai20-stuck-wheel', name: 'ai20-stuck-wheel', tags: [], rows: aiVaultWheel.rows };

/** A round wall clock with a gold rim; the minute hand is its own layer. */
const clock: PixelSprite = {
  id: 'ai20-clock',
  name: 'ai20-clock',
  tags: ['scene', 'ai'],
  blurb: "A round wall clock with a gold rim and a white face.",
  rows: [
    '....OOOOO....',
    '..OOGGGGGOO..',
    '.OOGwwXwwGOO.',
    '.OGwwwwwwwGO.',
    'OGwwKwwwwwwGO',
    'OGwwwKwwwwwGO',
    'OGXwwwKwwwXGO',
    'OGwwwwwwwwwGO',
    'OGwwwwwwwwwGO',
    '.OGwwwwwwwGO.',
    '.OOGwwXwwGOO.',
    '..OOGGGGGOO..',
    '....OOOOO....',
  ],
};

const minuteHand: PixelSprite = {
  id: 'ai20-minute-hand',
  name: 'ai20-minute-hand',
  tags: ['scene', 'ai'],
  blurb: "A clock's minute hand going round.",
  rows: [
    '....k....',
    '....k....',
    '....k....',
    '....k....',
    '.........',
    '.........',
    '.........',
    '.........',
    '.........',
  ],
  frames: [
    [
      '....k....',
      '....k....',
      '....k....',
      '....k....',
      '.........',
      '.........',
      '.........',
      '.........',
      '.........',
    ],
    [
      '.........',
      '.......k.',
      '......k..',
      '.....k...',
      '.........',
      '.........',
      '.........',
      '.........',
      '.........',
    ],
    [
      '.........',
      '.........',
      '.........',
      '.........',
      '.....kkkk',
      '.........',
      '.........',
      '.........',
      '.........',
    ],
    [
      '.........',
      '.........',
      '.........',
      '.........',
      '.........',
      '.....k...',
      '......k..',
      '.......k.',
      '.........',
    ],
    [
      '.........',
      '.........',
      '.........',
      '.........',
      '.........',
      '....k....',
      '....k....',
      '....k....',
      '....k....',
    ],
    [
      '.........',
      '.........',
      '.........',
      '.........',
      '.........',
      '...k.....',
      '..k......',
      '.k.......',
      '.........',
    ],
    [
      '.........',
      '.........',
      '.........',
      '.........',
      'kkkk.....',
      '.........',
      '.........',
      '.........',
      '.........',
    ],
    [
      '.........',
      '.k.......',
      '..k......',
      '...k.....',
      '.........',
      '.........',
      '.........',
      '.........',
      '.........',
    ],
  ],
  frameMs: 450,
};

/** An hourglass, sand trickling from the top bulb into the bottom one. */
const hourglass: PixelSprite = {
  id: 'ai20-hourglass',
  name: 'ai20-hourglass',
  tags: ['scene', 'ai'],
  blurb: "A small hourglass with gold sand trickling through.",
  rows: [
    'OOOOO',
    'xGGGx',
    '.xGx.',
    '..G..',
    '.xKx.',
    'xKGKx',
    'xGGGx',
    'xGGGx',
    'OOOOO',
  ],
  frames: [
    [
      'OOOOO',
      'xGGGx',
      '.xGx.',
      '..G..',
      '.xKx.',
      'xKGKx',
      'xGGGx',
      'xGGGx',
      'OOOOO',
    ],
    [
      'OOOOO',
      'xGGGx',
      '.xGx.',
      '..x..',
      '.xGx.',
      'xKKKx',
      'xGGGx',
      'xGGGx',
      'OOOOO',
    ],
  ],
  frameMs: 320,
};

const collector = aiFlip(aiCollectorRaise, 'ai20-collector');

const DOOR = [4, 19] as const;
const LOCK = [DOOR[0] + 6, DOOR[1] + 10] as const;
const CLOCK = [58, 10] as const;
const COLLECTOR = [54, 30] as const;
/** The turned collector's raised hand. */
const HAND = [COLLECTOR[0] + 19 - AI_COLLECTOR_HAND[0], COLLECTOR[1] + AI_COLLECTOR_HAND[1]] as const;

const base = aiCompose('ai20-opener-base', aiGallery.rows, [
  [aiVaultDoor, DOOR[0], DOOR[1]],
  [stuckWheel, DOOR[0] + 9, DOOR[1] + 9],
  [chains, DOOR[0], DOOR[1]],
  [lockRim, LOCK[0] - 1, LOCK[1] - 1],
  [aiPadlock, LOCK[0], LOCK[1]],
  [clock, CLOCK[0], CLOCK[1]],
  [aiShadow, COLLECTOR[0] + 3, COLLECTOR[1] + 27],
  [collector, COLLECTOR[0], COLLECTOR[1]],
]);

export const ai20Opener: SceneArt = {
  id: 'ai20-opener',
  label: 'A round vault door is chained shut with a gold padlock through the chains, while a collector waits beside it holding up an hourglass under a wall clock.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: hourglass, x: HAND[0] - 3, y: HAND[1] - 9 },
    { sprite: minuteHand, x: CLOCK[0] + 2, y: CLOCK[1] + 2 },
    { sprite: aiGlintGold, x: LOCK[0] - 1, y: LOCK[1] + 4, motion: { kind: 'twinkle', periodMs: 1900, min: 0.35 } },
    { sprite: aiCollectorBlink, x: COLLECTOR[0] + AI_COLLECTOR_EYE_FLIPPED[0], y: COLLECTOR[1] + AI_COLLECTOR_EYE_FLIPPED[1] },
    { sprite: aiMoteGold, x: 40, y: 30, motion: { kind: 'rise', amp: 5, periodMs: 3000, phase: 0.25 } },
  ],
};

export const ai20Finish = aiKeepsake(
  'ai20-finish',
  'A gold padlock, shut, floating in a glass display case on a marble plinth, with sparkles around it.',
  aiPadlock,
);

export const art: LessonArtSet = { opener: ai20Opener, backdrop: aiBackdrop, finish: ai20Finish };
