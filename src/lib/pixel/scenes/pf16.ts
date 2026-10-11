/**
 * Personal Finance lesson 16, Retirement Accounts Deep Dive: build the nest egg, one golden egg at a time.
 *
 * A new set, the back garden at sunset: a grey picket fence, a hedge, the lawn. The sapling of lesson
 * 15 is planted out now, a young tree, and on its low branch sits a nest of golden eggs, the nest egg
 * the lesson's accounts build (the 401(k), the Roth IRA, the HSA). From behind the hedge the figure
 * sets down the third. An empty rocking chair waits on the lawn for the years they pay for, and the cat
 * sleeps in front of it. Moving: the egg, fireflies, a bird, the sun's glow, the cat's z.
 */
import type { PixelSprite } from '../types';
import { pfBird, pfCat, pfCompose, pfSaverReach, pfZzz } from './pf-kit';
import { pfYoungTree } from './pf-kit-b';
import { pfKeepsake } from './pf1-finish';
import { pfBackdrop } from './pf-backdrop';
import type { LessonArtSet, SceneArt } from './types';

const SKY = ['E', 'E', 'E', 'E', 'E', 'E', 'p', 'p', 'p', 'p', 'p', 'p', 'f', 'f', 'f', 'f', 'f', 'f', '3', '3', '3', '3', '3', '3', '4'];

/**
 * The garden: a sunset with the sun half down behind a grey picket fence (boards three wide, a dark
 * gap, a lit left edge, pointed tops on row 30), and the lawn in evening shadow from row 46.
 */
function garden(): string[] {
  return Array.from({ length: 60 }, (_, y) =>
    Array.from({ length: 80 }, (_, x) => {
      if (y >= 46) return (x * 3 + y * 5) % 11 === 0 ? 'n' : 'k';
      const board = x % 4;
      if (y >= 31 && board !== 3) return board === 0 ? 'X' : 'D';
      if (y === 30 && (board === 1 || board === 2)) return 'D';
      if (y >= 31) return 'K';
      const sun = (x - 8) ** 2 + (y - 31) ** 2;
      if (sun <= 16) return '5';
      if (sun <= 28) return '4';
      return SKY[Math.min(y, SKY.length - 1)];
    }).join(''),
  );
}

/** The tree's low branch, from its tip under the nest (column 0) down to the trunk (the last columns). */
const branch: PixelSprite = {
  id: 'pf16-branch',
  name: 'branch',
  tags: ['scene', 'pf'],
  rows: [
    'gggggggggggg................',
    'OOOOOOOOOOOOgggg............',
    '............OOOOggggg.......',
    '................OOOOOgggg...',
    '.....................OOOOggg',
    '.........................OOO',
  ],
};

/** A few leaves at the branch's tip. */
const tipLeaves: PixelSprite = {
  id: 'pf16-tip-leaves',
  name: 'tip leaves',
  tags: ['scene', 'pf'],
  rows: [
    'mN.',
    'NNn',
    '.nn',
  ],
};

/** The nest of twigs, two golden eggs in it and room on the left (columns 2 to 4) for a third. */
const nest: PixelSprite = {
  id: 'pf16-nest',
  name: 'nest',
  tags: ['scene', 'pf'],
  rows: [
    '......Wy.Wy..',
    '.....yyGyyG..',
    'gOgGgOgGgOgGg',
    'OgOgOgOgOgOgO',
    '.OOgOOgOOgOO.',
  ],
};

/** The third egg, held in the hand, set down in the nest, a glint; then another in hand. */
const EGG_TOP = '.Wy';
const EGG_BASE = 'yyG';
const NONE = '...';
function eggAt(row: number, glint = false): string[] {
  return Array.from({ length: 6 }, (_, i) => {
    if (i === row) return EGG_TOP;
    if (i === row + 1) return EGG_BASE;
    if (glint && i === row - 1) return '.W.';
    return NONE;
  });
}
const egg: PixelSprite = {
  id: 'pf16-egg',
  name: 'golden egg',
  tags: ['scene', 'pf'],
  rows: eggAt(2),
  frames: [eggAt(2), eggAt(2), eggAt(3), eggAt(4), eggAt(4, true), eggAt(4), eggAt(4), Array.from({ length: 6 }, () => NONE)],
  frameMs: 260,
};

/** The hedge the figure stands behind, bumpy along its top. */
const hedge: PixelSprite = {
  id: 'pf16-hedge',
  name: 'hedge',
  tags: ['scene', 'pf'],
  rows: [
    '....mN.......mN.......mN.......mN.......mN....',
    '...NNNN.....NNNN.....NNNN.....NNNN.....NNNN...',
    '..NNnnNN...NNnnNN...NNnnNN...NNnnNN...NNnnNN..',
    'NNnnnnnnNNNnnnnnnNNNnnnnnnNNNnnnnnnNNNnnnnnnNN',
    'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn',
    'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn',
    'nnnnnNnnnnnnnnnnnnnnnnnNnnnnnnnnnnnnnnnnnNnnnn',
    'nnnnnnnnnnnnnnNnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn',
    'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnNnnnnnnnnnnnnn',
    'nnnnnnnnnnnnnnnnnnnNnnnnnnnnnnnnnnnnnnnnnnnnnn',
    'nnnnnnnnnnNnnnnnnnnnnnnnnnnnNnnnnnnnnnnnnnnnnn',
    'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnNnnnnnnnn',
    'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn',
  ],
};

/** An empty rocking chair in profile, facing left: a tall back, an orchid cushion, the rockers on the grass. */
const rockingChair: PixelSprite = {
  id: 'pf16-rocking-chair',
  name: 'rocking chair',
  tags: ['scene', 'pf'],
  rows: [
    '..............OO.',
    '.............OgO.',
    '.............OgO.',
    '............OgO..',
    '............OgO..',
    '...........OgO...',
    '..qPPPPPPPpOgO...',
    '.OOOOOOOOOOOgO...',
    '.OgggggggggggO...',
    '..Og.......Og....',
    '..Og.......Og....',
    '..Og.......Og....',
    'OO.Og.....Og..OO.',
    '.OOOOOOOOOOOOOO..',
  ],
};

/** A firefly over the hedge at dusk. */
const firefly: PixelSprite = {
  id: 'pf16-firefly',
  name: 'firefly',
  tags: ['scene', 'pf'],
  rows: [
    'y',
  ],
};

/** The sun's glow over the fence, for a slow twinkle. */
const sunGlow: PixelSprite = {
  id: 'pf16-sun-glow',
  name: 'sun glow',
  tags: ['scene', 'pf'],
  rows: [
    '...4.4.4...',
    '.4.......4.',
    '4.........4',
  ],
};

/** Lesson 16's emblem: the nest egg, three golden eggs in a nest of twigs. */
const emblemNestEgg: PixelSprite = {
  id: 'pf16-emblem-nest-egg',
  name: 'pf16-emblem-nest-egg',
  tags: ['scene', 'pf', 'emblem'],
  rows: [
    '...W...W...W..',
    '..Wyy.Wyy.Wyy.',
    '..yyG.yyG.yyG.',
    'gOgGgOgGgOgGgO',
    'OgOgOgOgOgOgOg',
    '.OgOgOgOgOgOO.',
    '..OOOOOOOOOO..',
  ],
};

// Order is depth: the tree, the figure, the branch reaching past its hand with the nest on it, the hedge in front.
const base = pfCompose('pf16-opener-base', 80, 60, garden(), [
  [pfYoungTree, 46, 15],
  [pfSaverReach, 15, 12],
  [branch, 32, 28],
  [tipLeaves, 29, 26],
  [nest, 34, 24],
  [hedge, 0, 34],
  [rockingChair, 62, 35],
  [pfCat, 61, 51],
]);

export const pf16Opener: SceneArt = {
  id: 'pf16-opener',
  label: 'In a back garden at sunset, a person reaches from behind a hedge to set a third golden egg in a nest on the low branch of a young tree, with an empty rocking chair on the lawn and the cat asleep in front of it.',
  width: 80,
  height: 60,
  base,
  layers: [
    // The egg leaves the reaching hand (figure at 15,12; hand at column 22, row 10) for the nest's
    // empty place (nest at 34,24; columns 2 to 4).
    { sprite: egg, x: 36, y: 20 },
    { sprite: firefly, x: 6, y: 33, motion: { kind: 'twinkle', periodMs: 1900, min: 0.1 } },
    { sprite: firefly, x: 52, y: 49, motion: { kind: 'twinkle', periodMs: 2500, min: 0.1, phase: 0.4 } },
    { sprite: sunGlow, x: 3, y: 24, motion: { kind: 'twinkle', periodMs: 3000, min: 0.3 } },
    { sprite: pfBird, x: 30, y: 8, motion: { kind: 'drift', amp: 3, periodMs: 5600 } },
    { sprite: pfZzz, x: 57, y: 47, motion: { kind: 'rise', amp: 3, periodMs: 2800, phase: 0.3 } },
  ],
};

export const pf16Finish = pfKeepsake(
  'pf16-finish',
  'A gold house-shaped key fob with a teal roof on a key ring with a brass key, its window showing three golden eggs in a nest, with small sparkles around it.',
  emblemNestEgg,
);

export const art: LessonArtSet = { opener: pf16Opener, backdrop: pfBackdrop, finish: pf16Finish };
