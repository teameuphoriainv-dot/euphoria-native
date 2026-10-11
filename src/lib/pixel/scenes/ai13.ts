/**
 * Alternative Investments lesson 13: DeFi and tokenized assets.
 *
 * The opener goes inside the vault, to the room of safe deposit boxes (ai-kit-b.ts), where a machine
 * stands in for a smart contract: the kit's house sinks into its hopper, the code on its screen
 * runs, and a pipe drops the house out the other side as tokens, small teal coins, into a pool of
 * them (the lesson's liquidity pool). No banker anywhere, which is the point of DeFi. Only small
 * layers move: a gear turns behind the porthole, a token falls into the pool and rings spread where
 * it lands, the cursor and the status light blink and the pool glints. The keepsake is the lesson's
 * coin: a teal token stamped with a house, a real asset made into a token.
 */
import type { PixelSprite } from '../types';
import { aiBackdrop } from './ai-backdrop';
import { aiCompose, aiGlint, aiHouse, aiKeepsake } from './ai-kit';
import { aiVaultRoom } from './ai-kit-b';
import type { LessonArtSet, SceneArt } from './types';

/** The smart contract as a machine: a hopper, a code screen, a porthole for the gear, a pipe to a spout. */
const machine: PixelSprite = {
  id: 'ai13-machine',
  name: 'ai13-machine',
  tags: ['scene', 'ai'],
  blurb: "A steel machine: a hopper on top, a screen of code, a round porthole, a gold plate, a pipe out to a spout.",
  rows: [
    '..DxxxxxxxxxxxxxxxxD....................',
    '...DXXXXXXXXXXXXXXD.....................',
    '....DXXXXXXXXXXXXD......................',
    '.....DXXXXXXXXXXD.......................',
    '......DXXXXXXXXD........................',
    '.......DXXXXXXD.........................',
    'DDDDDDDDXXXXXXDDDDDDDDDDDDDDDDD.........',
    'DxxxxxxxxxxxxxxxxxxxxxxxxxxxxxD.........',
    'DXGXXXXXXXXXXXXXXXXXXXXXXXXXGXD.........',
    'DXXDDDDDDDDDDDDDDXXXXDDDDDXXXXD.........',
    'DXXDKKKKKKKKKKKKDXXXDKKKKKDXXXD.........',
    'DXXDKNNNNKmmmKKKDXXDKKKKKKKDXXD.........',
    'DXXDKKKTTTKNNNKKDXXDKKKKKKKDXXD.........',
    'DXXDKKKTTTTTKKKKDXXDKKKKKKKDXXD.........',
    'DXXDKKKNNKmmmmKKDXXDKKKKKKKDXXD.........',
    'DXXDKNNNKKKKKKKKDXXDKKKKKKKDXXD.........',
    'DXXDKKKKKKKKKKKKDXXXDKKKKKDXXXD.........',
    'DXXDDDDDDDDDDDDDDXXXXDDDDDXXXXD.........',
    'DXXXXXXXXXXXXXXXXXXXXXXXXXXXXXD.........',
    'DXXXXXXXXXXXXXXXXXXXXXXXXXXXXXDDDDDDDDD.',
    'DXXXXXXXXXXXXXXXXXXXXXXXXXXXXXDxxxxxxxD.',
    'DXXXXXXXXXXXXXXXXXXXXXXXXXXXXXDXXXXxXXD.',
    'DXXOGGGGGGOXXXXXXXXXXXXXNXGXrXDDDDDDxXD.',
    'DXXOyyyGGgOXXXXXXXXXXXXXXXXXXXD....DxXD.',
    'DXXOOOOOOOOXXXXXXXXXXXXXXXXXXXD....DxXD.',
    'DXGXXXXXXXXXXXXXXXXXXXXXXXXXGXD...DDDDDD',
    'DxxxxxxxxxxxxxxxxxxxxxxxxxxxxxD.........',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD.........',
    '.DDDD.....................DDDD..........',
    '.DDDD.....................DDDD..........',
  ],
};

/** The liquidity pool: an oval basin seen from the front, deep blue water lit along its far edge. */
const pool: PixelSprite = {
  id: 'ai13-pool',
  name: 'ai13-pool',
  tags: ['scene', 'ai'],
  blurb: "An oval steel basin of deep blue water.",
  rows: [
    '..............DDDDDDDD..............',
    '.......DDxxxxxBBBBBBBBxxxxxDD.......',
    '...DDxxxBBBBBBBBBBBBBBBBBBBBxxxDD...',
    '.DDxxbbbbbbbbbbbbbbbbbbbbbbbbbbxxDD.',
    '.DxxbbbbbbbbbbbbbbbbbbbbbbbbbbbbxxD.',
    '.DXXbbbbbbbbbbbbbbbbbbbbbbbbbbbbXXD.',
    '.DDXXbbbbbbbbbbbbbbbbbbbbbbbbbbXXDD.',
    '.DkDDXXXbbbbbbbbbbbbbbbbbbbbXXXDDkD.',
    '.DDkkkkDDXXXXXbbbbbbbbXXXXXDDkkkkDD.',
    '...DDkkkkkkkkkDDDDDDDDkkkkkkkkkDD...',
    '.......DDkkkkkkkkkkkkkkkkkkDD.......',
    '..............DDDDDDDD..............',
  ],
};

/** A token afloat, seen from above. */
const afloat: PixelSprite = { id: 'ai13-afloat', name: 'ai13-afloat', tags: [], rows: ['.tt.', 'tTmt', '.tt.'] };

/** The gear behind the porthole: teeth square, then turned an eighth. */
const gear: PixelSprite = {
  id: 'ai13-gear',
  name: 'ai13-gear',
  tags: ['scene', 'ai'],
  blurb: "A gold gear turning.",
  rows: [
    '...g...',
    '..GGG..',
    '.GGOGG.',
    'gGOKOGg',
    '.GGOGG.',
    '..GGG..',
    '...g...',
  ],
  frames: [
    [
      '...g...',
      '..GGG..',
      '.GGOGG.',
      'gGOKOGg',
      '.GGOGG.',
      '..GGG..',
      '...g...',
    ],
    [
      '.g...g.',
      '..GGG..',
      '.GGOGG.',
      '.GOKOG.',
      '.GGOGG.',
      '..GGG..',
      '.g...g.',
    ],
  ],
  frameMs: 260,
};

/** One token dropping from the spout into the pool, a splash, then a rest. */
const drop: PixelSprite = {
  id: 'ai13-drop',
  name: 'ai13-drop',
  tags: ['scene', 'ai'],
  blurb: "A teal token falling, then splashing.",
  rows: Array.from({ length: 9 }, () => '......'),
  frames: [
    ['..tt..', '.tTmt.', '.tTTt.', '..tt..', '......', '......', '......', '......', '......'],
    ['......', '......', '..tt..', '.tTmt.', '.tTTt.', '..tt..', '......', '......', '......'],
    ['......', '......', '......', '......', '..tt..', '.tTmt.', '.tTTt.', '..tt..', '......'],
    ['......', '......', '......', '......', '......', '......', 'B....B', '.B..B.', '..BB..'],
    ['......', '......', '......', '......', '......', '.B..B.', '......', '......', '......'],
    ['......', '......', '......', '......', '......', '......', '......', '......', '......'],
    ['......', '......', '......', '......', '......', '......', '......', '......', '......'],
  ],
  frameMs: 170,
};

/** Rings spreading where the token lands. */
const ripple: PixelSprite = { id: 'ai13-ripple', name: 'ai13-ripple', tags: [], rows: ['..BBBB..', 'B......B', '..BBBB..'] };
const cursor: PixelSprite = { id: 'ai13-cursor', name: 'ai13-cursor', tags: [], rows: ['m'] };
const lamp: PixelSprite = { id: 'ai13-lamp', name: 'ai13-lamp', tags: [], rows: ['m'] };

const houseToken: PixelSprite = {
  id: 'ai13-house-token',
  name: 'ai13-house-token',
  tags: ['scene', 'ai'],
  blurb: "Lesson 13: a teal token stamped with a house, a real asset made into a token.",
  rows: [
    '....tttttt....',
    '..ttTTTTTTtt..',
    '.twTTTTTTTTTt.',
    '.twTTTttTTTTt.',
    'tTwTTttttTTTTt',
    'tTTTttttttTTTt',
    'tTTttttttttTTt',
    'tTTTttttttTTTt',
    'tTTTttTTttTTTt',
    'tTTTttTTttTTTt',
    '.tTTttTTttTTt.',
    '.tTTTTTTTTTTt.',
    '..ttTTTTTTtt..',
    '....tttttt....',
  ],
};

const MACHINE = [16, 18] as const;
const POOL = [42, 48] as const;
/** The spout's mouth, centred over the pool's near water. */
const SPOUT = [MACHINE[0] + 34, MACHINE[1] + 26] as const;

const base = aiCompose('ai13-opener-base', aiVaultRoom.rows, [
  [aiHouse, MACHINE[0] + 5, MACHINE[1] - 9],
  [machine, MACHINE[0], MACHINE[1]],
  [pool, POOL[0], POOL[1]],
  [afloat, POOL[0] + 14, POOL[1] + 4],
  [afloat, POOL[0] + 21, POOL[1] + 2],
  [afloat, POOL[0] + 18, POOL[1] + 6],
  [afloat, POOL[0] + 25, POOL[1] + 5],
]);

export const ai13Opener: SceneArt = {
  id: 'ai13-opener',
  label: 'Inside a vault lined with safe deposit boxes, a house sinks into the hopper of a machine with a screen of code, and teal tokens drop from its spout into a pool.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: gear, x: MACHINE[0] + 20, y: MACHINE[1] + 10 },
    { sprite: drop, x: SPOUT[0], y: SPOUT[1] },
    { sprite: ripple, x: SPOUT[0] - 1, y: POOL[1] + 3, motion: { kind: 'twinkle', periodMs: 1900, min: 0.15 } },
    { sprite: cursor, x: MACHINE[0] + 8, y: MACHINE[1] + 15, motion: { kind: 'twinkle', periodMs: 1000, min: 0.1 } },
    { sprite: lamp, x: MACHINE[0] + 24, y: MACHINE[1] + 22, motion: { kind: 'twinkle', periodMs: 1400, min: 0.2, phase: 0.4 } },
    { sprite: aiGlint, x: POOL[0] + 26, y: POOL[1] + 1, motion: { kind: 'twinkle', periodMs: 2300, min: 0.3 } },
  ],
};

export const ai13Finish = aiKeepsake(
  'ai13-finish',
  'A teal token stamped with a small house floating in a glass display case on a marble plinth, with sparkles around it.',
  houseToken,
);

export const art: LessonArtSet = { opener: ai13Opener, backdrop: aiBackdrop, finish: ai13Finish };
