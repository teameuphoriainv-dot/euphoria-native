/**
 * Behavioral Finance lesson 16: attention bias and media influence, on the fairground stage.
 *
 * What gets the spotlight gets the money. A lamp on the bulb wire throws a beam down onto centre stage
 * and System 1 stands in it starstruck, stars for eyes, while a megaphone beside the lamp blares the
 * day's hot story. Off at the edge, past the wheel where nobody is looking, the tortoise has its own
 * small light: a lantern, and just ahead of it a gem nobody else has seen, the neglected stock.
 * The stage and its lights are bf-kit-a.ts; the beam, the megaphone and the far tortoise are this lesson's.
 *
 * The keepsake jar holds a megaphone.
 */
import type { PixelSprite } from '../types';
import { bfHare, bfShadowNarrow, bfSparkle } from './bf-kit';
import { bfFairground, bfFairgroundLayers, bfMirror } from './bf-kit-a';
import { bfStamp } from './bf-kit-b';
import { bfBackdrop } from './bf-backdrop';
import { bfKeepsake } from './bf1-finish';
import type { LessonArtSet, SceneArt } from './types';

/** The spotlight's beam, widening from the lamp to the stage floor; L is lit night air. */
const beam: PixelSprite = {
  id: 'bf16-beam',
  name: 'bf16-beam',
  tags: ['prop', 'bf16'],
  palette: { L: '#2F2857' },
  rows: [
    '..........LLLLL..........',
    '..........LLLLL..........',
    '.........LLLLLLL.........',
    '.........LLLLLLL.........',
    '.........LLLLLLL.........',
    '.........LLLLLLL.........',
    '........LLLLLLLLL........',
    '........LLLLLLLLL........',
    '........LLLLLLLLL........',
    '.......LLLLLLLLLLL.......',
    '.......LLLLLLLLLLL.......',
    '.......LLLLLLLLLLL.......',
    '......LLLLLLLLLLLLL......',
    '......LLLLLLLLLLLLL......',
    '......LLLLLLLLLLLLL......',
    '......LLLLLLLLLLLLL......',
    '.....LLLLLLLLLLLLLLL.....',
    '.....LLLLLLLLLLLLLLL.....',
    '.....LLLLLLLLLLLLLLL.....',
    '....LLLLLLLLLLLLLLLLL....',
    '....LLLLLLLLLLLLLLLLL....',
    '....LLLLLLLLLLLLLLLLL....',
    '...LLLLLLLLLLLLLLLLLLL...',
    '...LLLLLLLLLLLLLLLLLLL...',
    '...LLLLLLLLLLLLLLLLLLL...',
    '...LLLLLLLLLLLLLLLLLLL...',
    '..LLLLLLLLLLLLLLLLLLLLL..',
    '..LLLLLLLLLLLLLLLLLLLLL..',
    '..LLLLLLLLLLLLLLLLLLLLL..',
    '.LLLLLLLLLLLLLLLLLLLLLLL.',
    '.LLLLLLLLLLLLLLLLLLLLLLL.',
    '.LLLLLLLLLLLLLLLLLLLLLLL.',
    'LLLLLLLLLLLLLLLLLLLLLLLLL',
  ],
};

/** The pool of light the beam makes on the floor. */
const spot: PixelSprite = {
  id: 'bf16-spot',
  name: 'bf16-spot',
  tags: ['prop', 'bf16'],
  palette: { M: '#40386C' },
  rows: [
    '....MMMMMMMMMMMMMMMMMMM....',
    '.MMMMMMMMMMMMMMMMMMMMMMMMM.',
    'MMMMMMMMMMMMMMMMMMMMMMMMMMM',
    '.MMMMMMMMMMMMMMMMMMMMMMMMM.',
    '....MMMMMMMMMMMMMMMMMMM....',
  ],
};

/** The spotlight itself, hung from the bulb wire, its lens blazing. */
const lamp: PixelSprite = {
  id: 'bf16-lamp',
  name: 'bf16-lamp',
  tags: ['prop', 'bf16'],
  rows: [
    '...D...',
    '..DDD..',
    '.DXXXD.',
    'DXxxxXD',
    '.yWWWy.',
  ],
};

/** The megaphone on the wire, blaring the hot story at the stage. */
const megaphone: PixelSprite = {
  id: 'bf16-megaphone',
  name: 'bf16-megaphone',
  tags: ['prop', 'bf16'],
  rows: [
    '...D.....',
    '...D...11',
    '...D.11Rw',
    '1111RRRRw',
    '1rRRRRRRw',
    '1111RRRRw',
    '.....11Rw',
    '.......11',
  ],
};

/** Sound coming off the megaphone's bell. */
const blare: PixelSprite = {
  id: 'bf16-blare',
  name: 'bf16-blare',
  tags: ['prop', 'bf16'],
  rows: [
    '.y..',
    '..y.',
    '..y.y',
    '..y.y',
    '..y.',
    '.y..',
  ].map((row) => row.padEnd(5, '.')),
};

/** The hare in the beam, stars where its eyes were. */
const starEyes: PixelSprite = {
  id: 'bf16-star-eyes',
  name: 'bf16-star-eyes',
  tags: ['prop', 'bf16'],
  rows: [
    '.y.',
    'yWy',
    '.y.',
  ],
};

const hareStarstruck = bfStamp(bfHare, 'bf16-hare-starstruck', starEyes, 11, 11);

/** The tortoise far off past the wheel, small with distance, walking on into the dark. */
const tortoiseFar = bfMirror(
  {
    id: 'bf16-tortoise-far-left',
    name: 'bf16-tortoise-far',
    tags: ['character', 'bf16', 'system-2'],
    rows: [
      '........OOOOO.....',
      '......OOyyGGGOO...',
      '.nnn.OyyOGGGOGgO..',
      'nNNnOyGGOGGGOGggO.',
      'nKNmOGGGOGGGOGggO.',
      'nNNnOOOOOOOOOOOOOO',
      '.nnnOgggOgggOgggOn',
      '....nOOOOOOOOOOOn.',
      '.....nNNn...nNNn..',
      '.....nnnn...nnnn..',
    ],
    frames: [
      [
        '........OOOOO.....',
        '......OOyyGGGOO...',
        '.nnn.OyyOGGGOGgO..',
        'nNNnOyGGOGGGOGggO.',
        'nKNmOGGGOGGGOGggO.',
        'nNNnOOOOOOOOOOOOOO',
        '.nnnOgggOgggOgggOn',
        '....nOOOOOOOOOOOn.',
        '.....nNNn...nNNn..',
        '.....nnnn...nnnn..',
      ],
      [
        '........OOOOO.....',
        '......OOyyGGGOO...',
        '.nnn.OyyOGGGOGgO..',
        'nNNnOyGGOGGGOGggO.',
        'nKNmOGGGOGGGOGggO.',
        'nNNnOOOOOOOOOOOOOO',
        '.nnnOgggOgggOgggOn',
        '....nOOOOOOOOOOOn.',
        '....nNNn.....nNNn.',
        '....nnnn.....nnnn.',
      ],
    ],
    frameMs: 600,
  },
  'bf16-tortoise-far',
);

/** Its lantern, held out ahead of it, and the soft light it throws. */
const lantern: PixelSprite = {
  id: 'bf16-lantern',
  name: 'bf16-lantern',
  tags: ['prop', 'bf16'],
  rows: [
    '.D.',
    'DDD',
    'DyD',
    'DGD',
    'DDD',
  ],
};

const lanternGlow: PixelSprite = {
  id: 'bf16-lantern-glow',
  name: 'bf16-lantern-glow',
  tags: ['prop', 'bf16'],
  rows: [
    '..O..',
    '.....',
    'O...O',
    '.....',
    '..O..',
  ],
};

/** The neglected stock: a gem on the dark floor, glinting. */
const gem: PixelSprite = {
  id: 'bf16-gem',
  name: 'bf16-gem',
  tags: ['prop', 'bf16'],
  rows: [
    '.tt.',
    'tTWt',
    '.tt.',
  ],
};

const shadowFar: PixelSprite = {
  id: 'bf16-shadow-far',
  name: 'bf16-shadow-far',
  tags: ['prop', 'bf16'],
  palette: { Z: '#110E17' },
  rows: [
    '.ZZZZZZZZZZZZZZZZ.',
  ],
};

export const bf16Opener: SceneArt = {
  id: 'bf16-opener',
  label: 'At a night fairground, a starstruck hare stands in a spotlight while a megaphone blares, and far off in the dark a small tortoise with a lantern finds a glinting gem nobody else has seen.',
  width: 80,
  height: 60,
  base: bfFairground,
  layers: [
    ...bfFairgroundLayers,
    { sprite: beam, x: 28, y: 13 },
    { sprite: spot, x: 27, y: 46 },
    { sprite: lamp, x: 37, y: 9 },
    { sprite: megaphone, x: 20, y: 6 },
    { sprite: blare, x: 30, y: 9, motion: { kind: 'twinkle', periodMs: 700, min: 0.15 } },
    { sprite: shadowFar, x: 58, y: 49 },
    { sprite: tortoiseFar, x: 58, y: 39 },
    { sprite: lantern, x: 76, y: 43 },
    { sprite: lanternGlow, x: 75, y: 43, motion: { kind: 'twinkle', periodMs: 1300, min: 0.3 } },
    { sprite: gem, x: 75, y: 51, motion: { kind: 'twinkle', periodMs: 1700, phase: 0.4, min: 0.35 } },
    { sprite: bfShadowNarrow, x: 30, y: 55 },
    { sprite: hareStarstruck, x: 28, y: 28 },
    { sprite: bfSparkle, x: 24, y: 30, motion: { kind: 'twinkle', periodMs: 1100, min: 0.3 } },
    { sprite: bfSparkle, x: 47, y: 26, motion: { kind: 'twinkle', periodMs: 1400, phase: 0.5, min: 0.3 } },
  ],
};

const emblemMegaphone: PixelSprite = {
  id: 'bf16-emblem-megaphone',
  name: 'bf16-emblem-megaphone',
  tags: ['emblem', 'bf', 'lesson-16'],
  blurb: "Lesson 16's emblem: attention bias caught as a red megaphone, blaring.",
  rows: [
    '.........11...y.',
    '.......11Rw..y..',
    '.....11RRRw.....',
    '1111RRRRRRw..yy.',
    '1wwRRRRRRRw.....',
    '1wrRRRRRRRw..yy.',
    '1111RRRRRRw.....',
    '...1.11RRRw..y..',
    '...1...11Rw...y.',
    '...1.....11.....',
    '..111...........',
  ],
};

export const bf16Finish: SceneArt = bfKeepsake(
  'bf16-finish',
  'A corked glass jar with a paper tag, holding a little red megaphone with sound coming out of it, with bubbles rising inside and sparkles around it.',
  emblemMegaphone,
);

export const art: LessonArtSet = { opener: bf16Opener, backdrop: bfBackdrop, finish: bf16Finish };
