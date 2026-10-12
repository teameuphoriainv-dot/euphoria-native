/**
 * Behavioral Finance lesson 6: mental accounting and framing, out on the fairground stage.
 *
 * Same $1,000, different behavior. The hare is a juggling act: the same money tossed round in three
 * coloured envelopes (fun, bills, savings), each treated as if it were a different kind of dollar,
 * sweating to keep them all up. Every envelope has the very same gold coin (bfCoin) poking out of it,
 * pixel for pixel, because it is the same money. The tortoise is the fungibility thinker: one envelope
 * with that same coin in it, because a dollar is a dollar whatever bucket it sits in. The juggle reuses
 * the hare's two arm poses from bfHareSlam (raised, then thrown forward) so only the envelopes in the
 * air are drawn here.
 *
 * The keepsake jar holds a fan of the three envelopes, the same coin poking out of each.
 */
import type { PixelSprite } from '../types';
import { bfHareSlam, bfShadowNarrow, bfShadowWide } from './bf-kit';
import { bfFairground, bfFairgroundLayers } from './bf-kit-a';
import { bfCoin, bfStamp } from './bf-kit-b';
import { bfBackdrop } from './bf-backdrop';
import { bfKeepsake } from './bf1-finish';
import type { LessonArtSet, SceneArt } from './types';

const slam = bfHareSlam.frames ?? [bfHareSlam.rows];

/** The hare tossing: fist up, then the arm thrown forward, round and round. */
const hareJuggle: PixelSprite = { ...bfHareSlam, id: 'bf6-hare-juggle', frames: [slam[0], slam[2]], frameMs: 300 };

/** The top of the pathway's gold coin, as it pokes out of an envelope. */
const coinTop: PixelSprite = { ...bfCoin, id: 'bf6-coin-top', name: 'bf6-coin-top', rows: bfCoin.rows.slice(0, 3) };

/**
 * One envelope of the money, flap shut, the coin poking out of the top: the same coin in every
 * envelope, pixel for pixel. Drawn pink; tint() swaps the flap and paper for green or blue.
 */
const ENVELOPE = [
  ...coinTop.rows.map((row) => `.${row}...`),
  'DDDDDDDDD',
  'DfFFFFFfD',
  'DFfFFFfFD',
  'DFFfFfFFD',
  'DFFFfFFFD',
  'DDDDDDDDD',
];
const tint = (dark: string, light: string): string[] =>
  ENVELOPE.map((row) => row.replace(/f/g, dark).replace(/F/g, light));
const PINK = tint('f', 'F');
const GREEN = tint('n', 'N');
const BLUE = tint('b', 'B');

/**
 * The juggle's six spots, clockwise from the top: [x, y] of an envelope's corner. The top one hangs
 * clear of the bulbs, the low ones clear of the ears, and the bottom one lands on the raised fist.
 */
const RING: readonly (readonly [number, number])[] = [[11, 0], [20, 2], [20, 7], [11, 12], [1, 7], [1, 2]];

/** One beat of the juggle: pink, green and blue two spots apart, all moved `k` spots round. */
function beat(k: number): string[] {
  const grid = Array.from({ length: 21 }, () => Array<string>(30).fill('.'));
  ([[PINK, 0], [GREEN, 2], [BLUE, 4]] as const).forEach(([tile, start]) => {
    const [x, y] = RING[(start + k) % RING.length];
    tile.forEach((row, j) => [...row].forEach((c, i) => {
      if (c !== '.') grid[y + j][x + i] = c;
    }));
  });
  return grid.map((r) => r.join(''));
}

/** Starts on the beat with one envelope in the paw and two in the air, so the juggle reads at rest. */
const beats = [1, 2, 3, 4, 5, 0].map(beat);

const envelopes: PixelSprite = {
  id: 'bf6-envelopes',
  name: 'bf6-envelopes',
  tags: ['prop', 'bf6'],
  blurb: "Three envelopes of the same money, pink, green and blue, the same gold coin poking out of each, going round in the air.",
  rows: beats[0],
  frames: beats,
  frameMs: 200,
};

/** The tortoise walking in from the right, an envelope in its mouth, the flap a full V; the coin goes in below. */
const tortoiseCarrying: PixelSprite = {
  id: 'bf6-tortoise-carrying',
  name: 'bf6-tortoise-carrying',
  tags: ['character', 'bf6', 'system-2'],
  blurb: "The tortoise walking in from the right with one envelope in its mouth, the same coin poking out of it: one pot of money.",
  rows: [
    '........................................',
    '........nnnnnn..........................',
    '.......nmmmmmmn..........OOOOOOO........',
    '......nmNnnNNNmn.......OOgGGGGyyOO......',
    '.....nmNNKNNNNNn......OOgOOOOOOGyyO.....',
    '....nmNNNNNNNNNmn....OggOGGGGGGOGGyO....',
    '....nnnNNNNNNNNNmn..OggOGGGGGGGgOGGyO...',
    '.....nnnnnnnnnNNNmnOgggOGGGGGGGgOGGGO...',
    'DDDDDDDDnnnnnnnnNNmOgggOGGGGGGGgOGGGGO..',
    'DxxxxxxD......nnnNOggggOGGGGGGGgOGGGgO..',
    'DwxxxxwD........nOOOOOOOOOOOOOOOOOOOOOO.',
    'DwwxxwwD........nOggOgggggOgggggOgggggOn',
    'DwwwwwwD.........nOOOOOOOOOOOOOOOOOOOOn.',
    'DDDDDDDD...........nNNNNn......nNNNn....',
    '...................nNNNNn......nNNNNn...',
    '...................nNNmNNn.....nNNmNn...',
    '...................nnnnnnn.....nnnnnn...',
  ],
  frames: [
    [
      '........................................',
      '........nnnnnn..........................',
      '.......nmmmmmmn..........OOOOOOO........',
      '......nmNnnNNNmn.......OOgGGGGyyOO......',
      '.....nmNNKNNNNNn......OOgOOOOOOGyyO.....',
      '....nmNNNNNNNNNmn....OggOGGGGGGOGGyO....',
      '....nnnNNNNNNNNNmn..OggOGGGGGGGgOGGyO...',
      '.....nnnnnnnnnNNNmnOgggOGGGGGGGgOGGGO...',
      'DDDDDDDDnnnnnnnnNNmOgggOGGGGGGGgOGGGGO..',
      'DxxxxxxD......nnnNOggggOGGGGGGGgOGGGgO..',
      'DwxxxxwD........nOOOOOOOOOOOOOOOOOOOOOO.',
      'DwwxxwwD........nOggOgggggOgggggOgggggOn',
      'DwwwwwwD.........nOOOOOOOOOOOOOOOOOOOOn.',
      'DDDDDDDD...........nNNNNn......nNNNn....',
      '...................nNNNNn......nNNNNn...',
      '...................nNNmNNn.....nNNmNn...',
      '...................nnnnnnn.....nnnnnn...',
    ],
    [
      '........................................',
      '........................................',
      '........nnnnnn...........OOOOOOO........',
      '.......nmmmmmmn........OOgGGGGyyOO......',
      '......nmNnnNNNmn......OOgOOOOOOGyyO.....',
      '.....nmNNKNNNNNn.....OggOGGGGGGOGGyO....',
      '....nmNNNNNNNNNmnn..OggOGGGGGGGgOGGyO...',
      '....nnnNNNNNNNNNmmnOgggOGGGGGGGgOGGGO...',
      '.....nnnnnnnnnnNNNmOgggOGGGGGGGgOGGGGO..',
      'DDDDDDDDnnnnnnnnNNOggggOGGGGGGGgOGGGgO..',
      'DxxxxxxD.......nnOOOOOOOOOOOOOOOOOOOOOO.',
      'DwxxxxwD........nOggOgggggOgggggOgggggOn',
      'DwwxxwwD.........nOOOOOOOOOOOOOOOOOOOOn.',
      'DwwwwwwD.............nNNNNn...nNNNn.....',
      'DDDDDDDD.............nNNNNn..nNNNNn.....',
      '.....................nNNmNn..nNNmNNn....',
      '.....................nnnnnn..nnnnnnn....',
    ],
  ],
  frameMs: 520,
};

/** The same coin poking out of the tortoise's envelope at its top left, riding the head's dip. */
const tortoiseEnvelope = bfStamp(tortoiseCarrying, 'bf6-tortoise-envelope', coinTop, 0, 5, [0, 1]);

export const bf6Opener: SceneArt = {
  id: 'bf6-opener',
  label: 'On a night fairground stage, a sweating hare juggles pink, green and blue envelopes with the same gold coin poking out of each, while a calm tortoise carries one envelope holding that same coin.',
  width: 80,
  height: 60,
  base: bfFairground,
  layers: [
    ...bfFairgroundLayers,
    { sprite: bfShadowNarrow, x: 18, y: 55 },
    { sprite: bfShadowWide, x: 43, y: 55 },
    { sprite: tortoiseEnvelope, x: 40, y: 39 },
    { sprite: hareJuggle, x: 17, y: 28 },
    { sprite: envelopes, x: 24, y: 12, motion: { kind: 'bob', amp: 1, periodMs: 1200 } },
  ],
};

const emblemEnvelopes: PixelSprite = {
  id: 'bf6-emblem-envelopes',
  name: 'bf6-emblem-envelopes',
  tags: ['emblem', 'bf', 'lesson-6'],
  blurb: "Lesson 6's emblem: mental accounting caught as three coloured envelopes, the same gold coin poking out of each.",
  rows: [
    '..OOO....OOO....',
    '.OyyGO..OyyGO...',
    '.OyGgO..OyGgO...',
    'DDDDDDDDDDDDDDDD',
    'DfFFFFFDnNNNNNnD',
    'DFfFFFfDNnNNNnND',
    'DFFfFOOONNnNnNND',
    'DFFFOyyGONNnNNND',
    'DDDDOyGgODDDDDDD',
    '...DDDDDDDDD....',
    '...DbBBBBBbD....',
    '...DBbBBBbBD....',
    '...DBBbBbBBD....',
    '...DBBBbBBBD....',
    '...DDDDDDDDD....',
  ],
};

export const bf6Finish: SceneArt = bfKeepsake(
  'bf6-finish',
  'A corked glass jar with a paper tag, holding a fan of pink, green and blue envelopes with the same gold coin poking out of each, with bubbles rising inside and sparkles around it.',
  emblemEnvelopes,
);

export const art: LessonArtSet = { opener: bf6Opener, backdrop: bfBackdrop, finish: bf6Finish };
