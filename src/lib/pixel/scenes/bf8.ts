/**
 * Behavioral Finance lesson 8: nudge theory and choice architecture, out on the fairground stage.
 *
 * Making good choices easy. The tortoise is the choice architect, brush still in its mouth: it has
 * painted the signpost's big green SAVE arrow and a trail of green chevrons along the floor, and left
 * the other way a small grey arrow nobody looks at. The hare does what System 1 always does with a
 * default: it follows the path of least effort, hopping straight along the chevrons to the piggy
 * bank, a coin hovering over the slot. Nobody was forced; the path was just made easy.
 *
 * The keepsake jar holds the signpost.
 */
import type { PixelSprite } from '../types';
import { bfShadowNarrow, bfShadowWide } from './bf-kit';
import { bfFairground, bfFairgroundLayers, bfHareHop } from './bf-kit-a';
import { bfBackdrop } from './bf-backdrop';
import { bfKeepsake } from './bf1-finish';
import type { LessonArtSet, SceneArt } from './types';

const signpost: PixelSprite = {
  id: 'bf8-signpost',
  name: 'bf8-signpost',
  tags: ['prop', 'bf8'],
  blurb: "A wooden signpost: a big green SAVE arrow pointing on, a small grey arrow pointing away.",
  rows: [
    '...........OOOO...........',
    '...........OggO...........',
    '...nnnnnnnnnnnnnnnnnnn....',
    '...nNwwwNNwNNwNwNwwwNNn...',
    '...nNwNNNwNwNwNwNwNNNNNn..',
    '...nNwwwNwwwNwNwNwwNNNNNn.',
    '...nNNNwNwNwNwNwNwNNNNNn..',
    '...nNwwwNwNwNNwNNwwwNNn...',
    '...nnnnnnnnnnnnnnnnnnn....',
    '...........OggO...........',
    '...........OggO...........',
    '..DDDDDDDDDDggO...........',
    '.DXxxxxxxxxDggO...........',
    'DXxxxxxxxxxDggO...........',
    '.DXXXXXXXXXDggO...........',
    '..DDDDDDDDDDggO...........',
    '...........OggO...........',
    '...........OggO...........',
    '...........OggO...........',
    '...........OggO...........',
    '...........OggO...........',
    '...........OggO...........',
    '...........OggO...........',
    '.........OOOOOOOO.........',
  ],
};

/** The painted guide path: green chevrons on the floor, pulsing like runway lights. */
const chevrons: PixelSprite = {
  id: 'bf8-chevrons',
  name: 'bf8-chevrons',
  tags: ['prop', 'bf8'],
  rows: [
    'N.......N.......N...',
    'NN......NN......NN..',
    '.NN......NN......NN.',
    'NN......NN......NN..',
    'N.......N.......N...',
  ],
};

const piggy: PixelSprite = {
  id: 'bf8-piggy',
  name: 'bf8-piggy',
  tags: ['prop', 'bf8'],
  blurb: "A pink piggy bank at the end of the path, coin slot on top, curly tail.",
  rows: [
    '.......IIIII.....',
    '...I.IIFKKFFII...',
    '..IFIFFFFFFFFFI..',
    '.IIFFFFFFFFFFFFI.',
    'IssIFKFFFFFFFFFIf',
    'IsKsIFFFFFFFFFFIf',
    'IssIFFFFFFFFFFFI.',
    '.IIFFFFFFFFFFFFI.',
    '..IffFFFFFFFFfI..',
    '...IIfIIIIIfII...',
    '...IfI.....IfI...',
    '...III.....III...',
  ],
};

const coin: PixelSprite = {
  id: 'bf8-coin',
  name: 'bf8-coin',
  tags: ['prop', 'bf8'],
  rows: [
    '.OO.',
    'OyGO',
    'OGgO',
    '.OO.',
  ],
};

const tortoiseBrush: PixelSprite = {
  id: 'bf8-tortoise-brush',
  name: 'bf8-tortoise-brush',
  tags: ['character', 'bf8', 'system-2'],
  blurb: "The tortoise as choice architect, a green-tipped paintbrush held up in its mouth.",
  rows: [
    '......................................NN',
    '..........................nnnnnn......ww',
    '........OOOOOOO..........nmmmmmmn.....xw',
    '......OOyyGGGGgOO.......nmNNNnnNmn....XX',
    '.....OyyGOOOOOOgOO......nNNNNNKNNmn...O.',
    '....OyGGOGGGGGGOggO....nmNNNNNNNNNmn.O..',
    '...OyGGOgGGGGGGGOggO..nmNNNNNNNNNnnnO...',
    '...OGGGOgGGGGGGGOgggOnmNNNnnnnnnnnnO....',
    '..OGGGGOgGGGGGGGOgggOmNNnnnnnnnnnn......',
    '..OgGGGOgGGGGGGGOggggONnnn..............',
    '.OOOOOOOOOOOOOOOOOOOOOOn................',
    'nOgggggOgggggOgggggOggOn................',
    '.nOOOOOOOOOOOOOOOOOOOOn.................',
    '....nNNNn......nNNNNn...................',
    '...nNNNNn......nNNNNn...................',
    '...nNmNNn.....nNNmNNn...................',
    '...nnnnnn.....nnnnnnn...................',
  ],
  frames: [
    [
      '......................................NN',
      '..........................nnnnnn......ww',
      '........OOOOOOO..........nmmmmmmn.....xw',
      '......OOyyGGGGgOO.......nmNNNnnNmn....XX',
      '.....OyyGOOOOOOgOO......nNNNNNKNNmn...O.',
      '....OyGGOGGGGGGOggO....nmNNNNNNNNNmn.O..',
      '...OyGGOgGGGGGGGOggO..nmNNNNNNNNNnnnO...',
      '...OGGGOgGGGGGGGOgggOnmNNNnnnnnnnnnO....',
      '..OGGGGOgGGGGGGGOgggOmNNnnnnnnnnnn......',
      '..OgGGGOgGGGGGGGOggggONnnn..............',
      '.OOOOOOOOOOOOOOOOOOOOOOn................',
      'nOgggggOgggggOgggggOggOn................',
      '.nOOOOOOOOOOOOOOOOOOOOn.................',
      '....nNNNn......nNNNNn...................',
      '...nNNNNn......nNNNNn...................',
      '...nNmNNn.....nNNmNNn...................',
      '...nnnnnn.....nnnnnnn...................',
    ],
    [
      '........................................',
      '......................................NN',
      '........OOOOOOO...........nnnnnn......ww',
      '......OOyyGGGGgOO........nmmmmmmn.....xw',
      '.....OyyGOOOOOOgOO......nmNNNnnNmn....XX',
      '....OyGGOGGGGGGOggO.....nNNNNNKNNmn...O.',
      '...OyGGOgGGGGGGGOggO..nnmNNNNNNNNNmn.O..',
      '...OGGGOgGGGGGGGOgggOnmmNNNNNNNNNnnnO...',
      '..OGGGGOgGGGGGGGOgggOmNNNnnnnnnnnnnO....',
      '..OgGGGOgGGGGGGGOggggONNnnnnnnnnnn......',
      '.OOOOOOOOOOOOOOOOOOOOOOnn...............',
      'nOgggggOgggggOgggggOggOn................',
      '.nOOOOOOOOOOOOOOOOOOOOn.................',
      '.....nNNNn...nNNNNn.....................',
      '.....nNNNNn..nNNNNn.....................',
      '....nNNmNNn..nNmNNn.....................',
      '....nnnnnnn..nnnnnn.....................',
    ],
  ],
  frameMs: 560,
};

export const bf8Opener: SceneArt = {
  id: 'bf8-opener',
  label: 'On a night fairground stage, a tortoise with a paintbrush has painted a green SAVE arrow and a trail on the floor, and a hare hops straight along it to a piggy bank.',
  width: 80,
  height: 60,
  base: bfFairground,
  layers: [
    ...bfFairgroundLayers,
    { sprite: signpost, x: 28, y: 23 },
    { sprite: piggy, x: 63, y: 35 },
    { sprite: coin, x: 71, y: 29, motion: { kind: 'bob', amp: 1, periodMs: 1100 } },
    { sprite: chevrons, x: 42, y: 55, motion: { kind: 'twinkle', periodMs: 1300, min: 0.35 } },
    { sprite: bfShadowWide, x: 1, y: 56 },
    { sprite: bfShadowNarrow, x: 44, y: 54 },
    { sprite: tortoiseBrush, x: 0, y: 40 },
    { sprite: bfHareHop, x: 43, y: 32, motion: { kind: 'bob', amp: 2, periodMs: 520 } },
  ],
};

const emblemSignpost: PixelSprite = {
  id: 'bf8-emblem-signpost',
  name: 'bf8-emblem-signpost',
  tags: ['emblem', 'bf', 'lesson-8'],
  blurb: "Lesson 8's emblem: the nudge caught as a signpost, the green way big and the grey way small.",
  rows: [
    '.....OOOO.......',
    '.....OggO.......',
    '.nnnnnnnnnnnn...',
    '.nNNNNNNNNNNNn..',
    '.nNNNNNNNNNNNNn.',
    '.nNNNNNNNNNNNn..',
    '.nnnnnnnnnnnn...',
    '.....OggO.......',
    '...DDDDDDDDDD...',
    '..DXxxxxxxxxD...',
    '.DXxxxxxxxxxD...',
    '..DXXXXXXXXXD...',
    '...DDDDDDDDDD...',
    '.....OggO.......',
    '.....OggO.......',
    '.....OggO.......',
    '...OOOOOOOO.....',
  ],
};

export const bf8Finish: SceneArt = bfKeepsake(
  'bf8-finish',
  'A corked glass jar with a paper tag, holding a little signpost with a big green arrow and a small grey one, with bubbles rising inside and sparkles around it.',
  emblemSignpost,
);

export const art: LessonArtSet = { opener: bf8Opener, backdrop: bfBackdrop, finish: bf8Finish };
