/**
 * Corporate Finance lesson 9, Risk Management & Hedging: keeping the cash dry when the weather turns.
 *
 * Opener: the one opener in this batch set outdoors, on the pavement outside head office at
 * night in a thunderstorm. Rain sheets down on both sides and lightning cracks out of the cloud,
 * but the CFO holds an orchid umbrella out over the company's cash, and under it the cash stays
 * dry. A hedge does not stop the storm (prices still swing); it keeps the swing off the cash. The
 * umbrella and the cash are the brightest things in a dark street. Only small layers move: four
 * sheets of rain, the lightning, rain splashing off the umbrella, two puddles rippling.
 *
 * Keepsake: an umbrella keeping the rain off two stacks of coins.
 */
import type { PixelSprite } from '../types';
import { cfBackdrop } from './cf-backdrop';
import { cfKeepsake } from './cf1-finish';
import { CF_PALETTE, cfCompose, cfShadowLong } from './cf-kit';
import { cfCfoReach } from './cf-kit-a';
import type { LessonArtSet, SceneArt } from './types';

/** The street at night: storm sky over a building line, a wet pavement, the kerb, the road. */
const street: PixelSprite = {
  id: 'cf9-street',
  name: 'cf9-street',
  tags: ['scene', 'cf9'],
  blurb: 'A night sky over a wet pavement and a kerb.',
  palette: CF_PALETTE,
  rows: [
    ...Array.from({ length: 44 }, () => 'c'.repeat(80)),
    'D'.repeat(80),
    ...Array.from({ length: 5 }, () => 'k'.repeat(80)),
    'kkkkkkkkkDkkkkkkkkkkkkkkkkkkkDkkkkkkkkkkkkkkkkkkkDkkkkkkkkkkkkkkkkkkkDkkkkkkkkkk',
    ...Array.from({ length: 6 }, () => 'k'.repeat(80)),
    'X'.repeat(80),
    'D'.repeat(80),
    'K'.repeat(80),
  ],
};

/** Head office, its top lost in the cloud: a dark tower, most windows out, a few still lit. */
const tower: PixelSprite = {
  id: 'cf9-tower',
  name: 'cf9-tower',
  tags: ['scene', 'cf9'],
  blurb: 'A dark office tower with a few lit windows.',
  palette: CF_PALETTE,
  rows: [
    'DDDDDDDDDDDDDDDDDDDDDDDD',
    'DkkkkkkkkkkkkkkkkkkkkkkD',
    ...[
      'DkKKkKKkOOkKKkKKkKKkOOkD',
      'DkOOkKKkKKkKKkGGkKKkKKkD',
      'DkKKkKKkKKkOOkKKkKKkKKkD',
      'DkKKkGGkKKkKKkKKkOOkKKkD',
      'DkKKkKKkKKkKKkKKkKKkKKkD',
      'DkOOkKKkKKkGGkKKkKKkOOkD',
      'DkKKkKKkOOkKKkKKkKKkKKkD',
      'DkKKkKKkKKkKKkOOkKKkKKkD',
      'DkGGkKKkKKkKKkKKkKKkGGkD',
    ].flatMap((windows) => [windows, windows, 'DkkkkkkkkkkkkkkkkkkkkkkD', 'DkkkkkkkkkkkkkkkkkkkkkkD']),
    'DDDDDDDDDDDDDDDDDDDDDDDD',
    'DkkkkkkkOOOOOOOOkkkkkkkD',
  ],
};

/** A lower block on the left edge. */
const block: PixelSprite = {
  id: 'cf9-block',
  name: 'cf9-block',
  tags: ['scene', 'cf9'],
  blurb: 'A low dark building with two lit windows.',
  palette: CF_PALETTE,
  rows: [
    'DDDDDDDDDDDDDDDDDD',
    'DkkkkkkkkkkkkkkkkD',
    ...[
      'DkKKkOOkKKkKKkKKkD',
      'DkKKkKKkKKkKKkGGkD',
      'DkKKkKKkKKkKKkKKkD',
      'DkGGkKKkKKkKKkKKkD',
    ].flatMap((windows) => [windows, windows, 'DkkkkkkkkkkkkkkkkD', 'DkkkkkkkkkkkkkkkkD']),
    'DDDDDDDDDDDDDDDDDD',
    'DkkkkkkkkkkkkkkkkD',
    'DkkkkkkkkkkkkkkkkD',
    'DkkkkkkkkkkkkkkkkD',
  ],
};

/** Storm cloud: a bank of grey, lit along its tops, dark beneath. */
const cloud: PixelSprite = {
  id: 'cf9-cloud',
  name: 'cf9-cloud',
  tags: ['scene', 'cf9'],
  blurb: 'A dark storm cloud.',
  rows: [
    '..........XXXX................',
    '.......XXXDDDDXX.....XXX......',
    '....XXXDDDDDDDDDXXXXXDDDXX....',
    '..XXDDDDDDDDDDDDDDDDDDDDDDXX..',
    '.XDDDDDDDDDDDDDDDDDDDDDDDDDDX.',
    'XDDDDDDDDDDDDDDDDDDDDDDDDDDDDX',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    '.DDDDDkDDDDDDDkkDDDDDDDDkDDDD.',
    '...kk...kkkk......kkk....kk...',
  ],
};

/** The orchid umbrella: a scalloped canopy, a silver shaft whose grip is the CFO's hand, a hook. */
const umbrella: PixelSprite = {
  id: 'cf9-umbrella',
  name: 'cf9-umbrella',
  tags: ['scene', 'cf9'],
  blurb: 'An orchid umbrella.',
  rows: [
    '................O................',
    '...........EEEEEEEEEEE...........',
    '........EEEqqqPPPPPPPpEEE........',
    '......EEqqqPPPPPPPPPPPpppEE......',
    '....EqqqPPPPPPPPPPPPPPPPPpppE....',
    '..EqqPPPPPPPPPPPPPPPPPPPPPPpppE..',
    '.EqPPPPPPPPPPPPPPPPPPPPPPPPPPppE.',
    'EPPPPPPPPPPPPPPPPPPPPPPPPPPPPPppE',
    'EE.EEE.EEE.EEE.EEE.EEE.EEE.EEE.EE',
    ...Array.from({ length: 22 }, () => '................x................'),
    '..............x.x................',
    '...............x.................',
  ],
};

/** The company's cash under the umbrella: three bundles on a spill of coins. */
const cash: PixelSprite = {
  id: 'cf9-cash',
  name: 'cf9-cash',
  tags: ['scene', 'cf9', 'cash'],
  blurb: 'Three bundles of notes on a few gold coins.',
  rows: [
    '....mmmwmmm....',
    '....NNNwNNN....',
    '....nnnxnnn....',
    'mmmwmmm.mmmwmmm',
    'NNNwNNN.NNNwNNN',
    'nnnxnnn.nnnxnnn',
    '.OOyGOOOOyGOOO.',
    'OgGGgOgGGgOgGGO',
    'OOOOOOOOOOOOOOO',
  ],
};

/** Puddles on the pavement, each holding a lit window. */
const puddleA: PixelSprite = { id: 'cf9-puddle-a', name: 'cf9-puddle-a', tags: ['scene', 'cf9'], palette: CF_PALETTE, rows: ['..CCCCCCC..', 'CCCcCCOCCCC', '..CCCCCCC..'] };
const puddleB: PixelSprite = { id: 'cf9-puddle-b', name: 'cf9-puddle-b', tags: ['scene', 'cf9'], palette: CF_PALETTE, rows: ['.CCCCCCCCC.', 'CCOCCCcCCCC', '.CCCCCCCCC.'] };

const base = cfCompose('cf9-opener-base', street, [
  [tower, 56, 4],
  [block, 0, 22],
  [cloud, -4, -1],
  [cloud, 22, -3],
  [cloud, 50, 0],
  [puddleA, 4, 51],
  [puddleB, 60, 52],
  [cfShadowLong, 22, 55],
  [cfShadowLong, 34, 55],
  [umbrella, 22, 12],
  [cash, 40, 47],
  [cfCfoReach, 21, 29],
], 'The still street: head office and a lower block under storm cloud, two puddles, the CFO, the umbrella, the cash.');

const RAIN = { w: 22, h: 24, fall: 3, streaks: 13 } as const;

/**
 * A sheet of rain: short grey streaks falling three pixels a frame and wrapping, so eight frames
 * loop. Computed from a fixed scatter (`seed` shifts it), because four hand-drawn sheets of
 * scattered streaks would each need eight frames to agree on where every drop went.
 */
function rainSheet(id: string, width: number, seed: number): PixelSprite {
  const drops = Array.from({ length: RAIN.streaks }, (_, i) => [((i * 7) + seed * 3) % width, ((i * 11) + seed * 5) % RAIN.h] as const);
  const frame = (f: number) => {
    const grid = Array.from({ length: RAIN.h }, () => Array.from({ length: width }, () => '.'));
    for (const [x, y0] of drops) {
      const y = (y0 + f * RAIN.fall) % RAIN.h;
      const top = grid[y];
      const below = grid[y + 1];
      if (top) top[x] = 'x';
      if (below) below[x] = 'X';
    }
    return grid.map((row) => row.join(''));
  };
  const count = RAIN.h / RAIN.fall;
  return { id, name: id, tags: ['scene', 'cf9'], blurb: 'Falling rain.', rows: frame(0), frames: Array.from({ length: count }, (_, f) => frame(f)), frameMs: 90 };
}

const rainLeftHigh = rainSheet('cf9-opener-rain-left-high', 21, 1);
const rainLeftLow = rainSheet('cf9-opener-rain-left-low', 21, 2);
const rainRightHigh = rainSheet('cf9-opener-rain-right-high', 24, 3);
const rainRightLow = rainSheet('cf9-opener-rain-right-low', 24, 4);

/** One crack of lightning, then dark. A single flash a cycle, never a strobe. */
const BOLT: readonly string[] = [
  '....w.',
  '...wy.',
  '..wy..',
  '.wy...',
  'wwwww.',
  '...wy.',
  '..wy..',
  '.wy...',
  'wy....',
  'y.....',
];
const dark = BOLT.map((row) => '.'.repeat(row.length));
const lightning: PixelSprite = {
  id: 'cf9-opener-lightning',
  name: 'cf9-opener-lightning',
  tags: ['scene', 'cf9'],
  blurb: 'A fork of lightning.',
  rows: [...BOLT],
  frames: [[...BOLT], [...BOLT], ...Array.from({ length: 9 }, () => dark)],
  frameMs: 220,
};

/** Rain bouncing off the canopy. */
const splashes: PixelSprite = {
  id: 'cf9-opener-splashes',
  name: 'cf9-opener-splashes',
  tags: ['scene', 'cf9'],
  rows: [
    '.....x.......x.......x.......',
    'x.......x.......x.......x...x',
  ],
};

const ripple: PixelSprite = { id: 'cf9-opener-ripple', name: 'cf9-opener-ripple', tags: ['scene', 'cf9'], rows: ['.BBB.', 'B...B', '.BBB.'] };

export const cf9Opener: SceneArt = {
  id: 'cf9-opener',
  label: 'In a night thunderstorm outside head office, the finance chief holds an umbrella out over the company cash so the rain falling all around cannot reach it.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: lightning, x: 9, y: 7 },
    { sprite: rainLeftHigh, x: 0, y: 9 },
    { sprite: rainLeftLow, x: 0, y: 33 },
    { sprite: rainRightHigh, x: 56, y: 9 },
    { sprite: rainRightLow, x: 56, y: 33 },
    { sprite: splashes, x: 24, y: 13, motion: { kind: 'twinkle', periodMs: 900, min: 0.15 } },
    { sprite: ripple, x: 7, y: 51, motion: { kind: 'twinkle', periodMs: 1300, min: 0.1 } },
    { sprite: ripple, x: 64, y: 52, motion: { kind: 'twinkle', periodMs: 1500, phase: 0.5, min: 0.1 } },
  ],
};

/** Lesson 9's emblem: an orchid umbrella over two stacks of coins, rain falling either side. */
const emblemUmbrella: PixelSprite = {
  id: 'cf9-emblem-umbrella',
  name: 'cf9-emblem-umbrella',
  tags: [],
  blurb: 'An orchid umbrella keeping the rain off two stacks of coins.',
  rows: [
    'B.......O......B',
    '......EEEEE.....',
    '....EEqqPPPEE...',
    '..EEqqPPPPPppEE.',
    '.EqqPPPPPPPPppE.',
    '.EPPPPPPPPPPPpE.',
    '.EEE.EEE.EEE.EE.',
    'B.......x......B',
    '........x.......',
    '..OOOOO.x.......',
    '..OyyGO.x.OOOO..',
    '..OyGgO.x.OyGO..',
    '..OOOOO.x.OGgO..',
    '..OyGgO.x.OOOO..',
    '..OOOOO..xx.....',
    '................',
  ],
};

export const cf9Finish = cfKeepsake(
  'cf9-finish',
  'A crystal award on a gold stand with an umbrella keeping the rain off stacks of coins inside, and small sparkles around it.',
  emblemUmbrella,
);

export const art: LessonArtSet = { opener: cf9Opener, backdrop: cfBackdrop, finish: cf9Finish };
