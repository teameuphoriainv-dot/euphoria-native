/**
 * Behavioral Finance lesson 4: herd behavior and social proof, out on the fairground stage.
 *
 * An information cascade in one line: sheep march toward a booth whose sign flashes BUY!, each one
 * louder than the last (one "!", then two, then three), and the hare has hopped into the middle of
 * the flock. The tortoise is the one question that beats every crowd: it is walking the other way.
 * The stage and its lights are bf-kit-a.ts; the sheep, the booth and the sign are this lesson's.
 *
 * The keepsake jar holds a sheep.
 */
import type { PixelSprite } from '../types';
import { bfShadowNarrow } from './bf-kit';
import { bfFairground, bfFairgroundLayers, bfHareHop } from './bf-kit-a';
import { bfBackdrop } from './bf-backdrop';
import { bfKeepsake } from './bf1-finish';
import type { LessonArtSet, SceneArt } from './types';

const sheep: PixelSprite = {
  id: 'bf4-sheep',
  name: 'bf4-sheep',
  tags: ['character', 'bf4'],
  blurb: "A sheep in the flock: a cloud of wool, a grey face, eyes on the sheep in front.",
  rows: [
    '...DDD.DDD......',
    '..DwWwDwWwDD....',
    '.DwWwwwwwwwwD...',
    'DwWwwwwwwwwwDDD.',
    'DwwwwwwwwwwDXXXD',
    'DxwwwwwwwwwDXKXD',
    'DxxwwwwwwwxDXXD.',
    '.DxxxxxxxxxDDD..',
    '..DXD.DXD.DXD...',
    '..DXD.DXD.DXD...',
    '..DDD.DDD.DDD...',
  ],
};

const sheepStep: PixelSprite = {
  ...sheep,
  id: 'bf4-sheep-step',
  frames: [
    sheep.rows,
    [
      '...DDD.DDD......',
      '..DwWwDwWwDD....',
      '.DwWwwwwwwwwD...',
      'DwWwwwwwwwwwDDD.',
      'DwwwwwwwwwwDXXXD',
      'DxwwwwwwwwwDXKXD',
      'DxxwwwwwwwxDXXD.',
      '.DxxxxxxxxxDDD..',
      '.DXD..DXD.DXD...',
      'DXD....DXD.DXD..',
      'DDD....DDD.DDD..',
    ],
  ],
  frameMs: 420,
};

const booth: PixelSprite = {
  id: 'bf4-booth',
  name: 'bf4-booth',
  tags: ['prop', 'bf4'],
  blurb: "The hype stall: a striped awning over a wooden counter, posts up to the sign.",
  rows: [
    '.....D.......D.......',
    '.....D.......D.......',
    'FFFwwwFFFwwwFFFwwwFFF',
    'FFFwwwFFFwwwFFFwwwFFF',
    'fFFwwxfFFwwxfFFwwxfFf',
    '.f..x..f..x..f..x..f.',
    'D...................D',
    'D...................D',
    'D...................D',
    'D...................D',
    'D...................D',
    'DOOOOOOOOOOOOOOOOOOOD',
    'DgGGGGGGGGGGGGGGGGGgD',
    'DgggggggggggggggggggD',
    'DOOOOOOOOOOOOOOOOOOOD',
    'DgggggggggggggggggggD',
    'DOOOOOOOOOOOOOOOOOOOD',
    'DgggggggggggggggggggD',
    'DDDDDDDDDDDDDDDDDDDDD',
  ],
};

const sign: PixelSprite = {
  id: 'bf4-sign',
  name: 'bf4-sign',
  tags: ['prop', 'bf4'],
  blurb: "BUY! in lit letters on a dark board, made to flash.",
  rows: [
    'OOOOOOOOOOOOOOOOO',
    'OKKKKKKKKKKKKKKKO',
    'OKyyKKyKyKyKyKyKO',
    'OKyKyKyKyKyKyKyKO',
    'OKyyKKyKyKKyKKyKO',
    'OKyKyKyKyKKyKKKKO',
    'OKyyKKyyyKKyKKyKO',
    'OKKKKKKKKKKKKKKKO',
    'OOOOOOOOOOOOOOOOO',
  ],
};

/** FOMO over the flock, louder down the line: one "!", then two, then three. */
const shout1: PixelSprite = {
  id: 'bf4-shout-1',
  name: 'bf4-shout-1',
  tags: ['prop', 'bf4'],
  rows: [
    '.DD.',
    'DwwD',
    'DwwD',
    'DwwD',
    '.DD.',
    'DwwD',
    '.DD.',
  ],
};

const shout2: PixelSprite = {
  id: 'bf4-shout-2',
  name: 'bf4-shout-2',
  tags: ['prop', 'bf4'],
  rows: [
    '.OO..OO.',
    'OyyOOyyO',
    'OyyOOyyO',
    'OyyOOyyO',
    '.OO..OO.',
    'OyyOOyyO',
    '.OO..OO.',
  ],
};

const shout3: PixelSprite = {
  id: 'bf4-shout-3',
  name: 'bf4-shout-3',
  tags: ['prop', 'bf4'],
  rows: [
    '.11..11..11.',
    '1RR11RR11RR1',
    '1RR11RR11RR1',
    '1ss11ss11ss1',
    '.11..11..11.',
    '1RR11RR11RR1',
    '.11..11..11.',
  ],
};

/** The tortoise far off by the big top, small with distance, walking away from the crowd. */
const tortoiseFar: PixelSprite = {
  id: 'bf4-tortoise-far',
  name: 'bf4-tortoise-far',
  tags: ['character', 'bf4', 'system-2'],
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
};

const tortoiseFarShadow: PixelSprite = {
  id: 'bf4-tortoise-far-shadow',
  name: 'bf4-tortoise-far-shadow',
  tags: ['prop', 'bf4'],
  palette: { Z: '#110E17' },
  rows: [
    '.ZZZZZZZZZZZZZZZZ.',
  ],
};

const sheepShadow: PixelSprite = {
  id: 'bf4-sheep-shadow',
  name: 'bf4-sheep-shadow',
  tags: ['prop', 'bf4'],
  palette: { Z: '#110E17' },
  rows: [
    '.ZZZZZZZZZZZZ.',
  ],
};

const sheepLater = { ...sheepStep, id: 'bf4-sheep-step-later', frames: [...(sheepStep.frames ?? [])].reverse(), frameMs: 460 };

export const bf4Opener: SceneArt = {
  id: 'bf4-opener',
  label: 'At a night fairground, a flock of sheep and a hopping hare stampede toward a stall flashing BUY, while a calm tortoise walks off the other way.',
  width: 80,
  height: 60,
  base: bfFairground,
  layers: [
    ...bfFairgroundLayers,
    { sprite: tortoiseFarShadow, x: 2, y: 46 },
    { sprite: tortoiseFar, x: 2, y: 37 },
    { sprite: sign, x: 61, y: 22, motion: { kind: 'twinkle', periodMs: 900, min: 0.55 } },
    { sprite: booth, x: 59, y: 31 },
    { sprite: sheepShadow, x: 2, y: 57 },
    { sprite: sheepShadow, x: 18, y: 57 },
    { sprite: bfShadowNarrow, x: 33, y: 57 },
    { sprite: sheepShadow, x: 59, y: 57 },
    { sprite: sheepStep, x: 2, y: 47, motion: { kind: 'bob', amp: 1, periodMs: 840 } },
    { sprite: sheepLater, x: 18, y: 47, motion: { kind: 'bob', amp: 1, periodMs: 920, phase: 0.5 } },
    { sprite: bfHareHop, x: 33, y: 35, motion: { kind: 'bob', amp: 2, periodMs: 520 } },
    { sprite: sheepStep, x: 59, y: 47, motion: { kind: 'bob', amp: 1, periodMs: 760, phase: 0.25 } },
    { sprite: shout1, x: 29, y: 40, motion: { kind: 'rise', amp: 3, periodMs: 1800 } },
    { sprite: shout2, x: 46, y: 29, motion: { kind: 'rise', amp: 3, periodMs: 1500, phase: 0.3 } },
    { sprite: shout3, x: 64, y: 41, motion: { kind: 'rise', amp: 3, periodMs: 1200, phase: 0.6 } },
  ],
};

const emblemSheep: PixelSprite = {
  id: 'bf4-emblem-sheep',
  name: 'bf4-emblem-sheep',
  tags: ['emblem', 'bf', 'lesson-4'],
  blurb: "Lesson 4's emblem: the herd caught as one sheep, wool and all.",
  rows: [
    '...DDD.DDD......',
    '..DwWwDwWwDD....',
    '.DwWwwwwwwwwD...',
    'DwWwwwwwwwwwDDD.',
    'DwwwwwwwwwwDXXXD',
    'DxwwwwwwwwwDXKXD',
    'DxxwwwwwwwxDXXD.',
    '.DxxxxxxxxxDDD..',
    '..DXD.DXD.DXD...',
    '..DXD.DXD.DXD...',
    '..DDD.DDD.DDD...',
  ],
};

export const bf4Finish: SceneArt = bfKeepsake(
  'bf4-finish',
  'A corked glass jar with a paper tag, holding a small woolly sheep, with bubbles rising inside and sparkles around it.',
  emblemSheep,
);

export const art: LessonArtSet = { opener: bf4Opener, backdrop: bfBackdrop, finish: bf4Finish };
