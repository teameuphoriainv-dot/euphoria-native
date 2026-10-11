/**
 * Behavioral Finance lesson 5: overconfidence and the illusion of control, inside the investor's head.
 *
 * Built on bfMindRoom. System 1 has climbed onto the console between the eyes and crowned itself:
 * the hare in a gold crown, lids half shut, pumping a fist. Through the left eye is where it stands,
 * the Dunning-Kruger curve with its little red flag planted on Mount Stupid; through the right, the
 * Odean study, returns falling bar by bar from the least active traders to the most active. Down on
 * the floor the tortoise does the humble thing and keeps reading, head down in a book.
 *
 * The keepsake jar holds a crown.
 */
import type { PixelSprite } from '../types';
import {
  bfConsoleLights,
  bfLater,
  bfMindRoom,
  bfShadowWide,
  bfSparkle,
  bfStar,
  bfStarBig,
} from './bf-kit';
import { bfBackdrop } from './bf-backdrop';
import { bfKeepsake } from './bf1-finish';
import type { LessonArtSet, SceneArt } from './types';

/** The left eye: confidence against competence, peaking early on Mount Stupid, flag and all. */
const dunningKruger: PixelSprite = {
  id: 'bf5-opener-dunning-kruger',
  name: 'bf5-opener-dunning-kruger',
  tags: ['scene', 'bf5'],
  rows: [
    '....R..............',
    '...xRR.............',
    '...x...............',
    '...G...............',
    '..GyG..............',
    '..G..G.............',
    '..G...G............',
    '.G.....G...........',
    '.G......G.......GGy',
    'G........G....GG...',
    'G.........GGGG.....',
  ],
};

/** The right eye: annual return by trading frequency, least active on the left. */
const tradingBars: PixelSprite = {
  id: 'bf5-opener-trading-bars',
  name: 'bf5-opener-trading-bars',
  tags: ['scene', 'bf5'],
  rows: [
    'NN.............',
    'NN.NN..........',
    'NN.NN..........',
    'NN.NN.yy.......',
    'NN.NN.yy.......',
    'NN.NN.yy.RR....',
    'NN.NN.yy.RR....',
    'NN.NN.yy.RR.RR.',
    'NN.NN.yy.RR.RR.',
    'NN.NN.yy.RR.RR.',
    'xxxxxxxxxxxxxxx',
  ],
};

/** System 1 as king of the console: crown on, lids half shut, fist pumping. */
const hareKing: PixelSprite = {
  id: 'bf5-hare-king',
  name: 'bf5-hare-king',
  tags: ['character', 'bf5', 'system-1'],
  rows: [
    '......DD..DD...............',
    '.....DXXD.DxwD.............',
    '.....DXfXDDFwD.............',
    '.....DXfXDDFwD.............',
    '.....DXfXDDFwD.............',
    '.....OXfXODFwO.....DDD.....',
    '.....yOXOyOFOy....DwwwD....',
    '.....GyOGGGOyG....DxxxD....',
    '.....GRGGBGGRG....DxxXD....',
    '.....OOOOOOOOOD...DxxD.....',
    '....DXxxxxxxxxxD..DxxD.....',
    '....DXxxxxxDDDxxDDwxXD.....',
    '....DXxxxxxWWKWxxDxxD......',
    '....DXxxxxxxWWxxxDxxD......',
    '....DXXxxxxxxxxxDDxxD......',
    '.....DXXxxxxxxDDwwxXD......',
    '......DDXxxxDDwwxXXD.......',
    '.....DXXxxxDwwxXXDD........',
    '....DXXxxxDwxXXDD..........',
    '...DXXxxxxxDXDDwD..........',
    '.DDXXxxxxxxxDwwwD..........',
    'DwwDXxxxxxxxxwwxD..........',
    'DwwwDXxxxxxxxxxxD..........',
    '.DDDXXxxxxxxxxxXD..........',
    '....DXXXxxxxxxXXD..........',
    '....DXXXDDxxxxxxxD.........',
    '....DXXD..DXxxxxxwD........',
    '....DDDD..DDDDDDDDD........',
  ],
  frames: [
    [
      '......DD..DD...............',
      '.....DXXD.DxwD.............',
      '.....DXfXDDFwD.............',
      '.....DXfXDDFwD.............',
      '.....DXfXDDFwD.............',
      '.....OXfXODFwO.....DDD.....',
      '.....yOXOyOFOy....DwwwD....',
      '.....GyOGGGOyG....DxxxD....',
      '.....GRGGBGGRG....DxxXD....',
      '.....OOOOOOOOOD...DxxD.....',
      '....DXxxxxxxxxxD..DxxD.....',
      '....DXxxxxxDDDxxDDwxXD.....',
      '....DXxxxxxWWKWxxDxxD......',
      '....DXxxxxxxWWxxxDxxD......',
      '....DXXxxxxxxxxxDDxxD......',
      '.....DXXxxxxxxDDwwxXD......',
      '......DDXxxxDDwwxXXD.......',
      '.....DXXxxxDwwxXXDD........',
      '....DXXxxxDwxXXDD..........',
      '...DXXxxxxxDXDDwD..........',
      '.DDXXxxxxxxxDwwwD..........',
      'DwwDXxxxxxxxxwwxD..........',
      'DwwwDXxxxxxxxxxxD..........',
      '.DDDXXxxxxxxxxxXD..........',
      '....DXXXxxxxxxXXD..........',
      '....DXXXDDxxxxxxxD.........',
      '....DXXD..DXxxxxxwD........',
      '....DDDD..DDDDDDDDD........',
    ],
    [
      '......DD..DD...............',
      '.....DXXD.DxwD.............',
      '.....DXfXDDFwD.............',
      '.....DXfXDDFwD.............',
      '.....DXfXDDFwD.....DDD.....',
      '.....OXfXODFwO....DwwwD....',
      '.....yOXOyOFOy....DxxxD....',
      '.....GyOGGGOyG....DxxXD....',
      '.....GRGGBGGRG....DxxD.....',
      '.....OOOOOOOOOD...DxxD.....',
      '....DXxxxxxxxxxD.DwxXD.....',
      '....DXxxxxxDDDxxDDxxD......',
      '....DXxxxxxWWKWxxDxxD......',
      '....DXxxxxxxWWxxxDxxD......',
      '....DXXxxxxxxxxxDDxxD......',
      '.....DXXxxxxxxDDwwxXD......',
      '......DDXxxxDDwwxXXD.......',
      '.....DXXxxxDwwxXXDD........',
      '....DXXxxxDwxXXDD..........',
      '...DXXxxxxxDXDDwD..........',
      '.DDXXxxxxxxxDwwwD..........',
      'DwwDXxxxxxxxxwwxD..........',
      'DwwwDXxxxxxxxxxxD..........',
      '.DDDXXxxxxxxxxxXD..........',
      '....DXXXxxxxxxXXD..........',
      '....DXXXDDxxxxxxxD.........',
      '....DXXD..DXxxxxxwD........',
      '....DDDD..DDDDDDDDD........',
    ],
  ],
  frameMs: 380,
};

/** The tortoise with its head lowered over the floor, reading. */
const tortoiseReading: PixelSprite = {
  id: 'bf5-tortoise-reading',
  name: 'bf5-tortoise-reading',
  tags: ['character', 'bf5', 'system-2'],
  rows: [
    '........................................',
    '........................................',
    '........OOOOOOO.........................',
    '......OOyyGGGGgOO.........nnnnnn........',
    '.....OyyGOOOOOOgOO.......nmmmmmmn.......',
    '....OyGGOGGGGGGOggO.....nmNNNnnNmn......',
    '...OyGGOgGGGGGGGOggO....nNNNNNKNNmn.....',
    '...OGGGOgGGGGGGGOgggO..nmNNNNNNNNNmn....',
    '..OGGGGOgGGGGGGGOgggO.nmNNNNNNNNNnnn....',
    '..OgGGGOgGGGGGGGOggggnmNNNnnnnnnnnn.....',
    '.OOOOOOOOOOOOOOOOOOOOmNNnnnnnnnnnn......',
    'nOgggggOgggggOgggggOgONnnn..............',
    '.nOOOOOOOOOOOOOOOOOOOOn.................',
    '....nNNNn......nNNNNn...................',
    '...nNNNNn......nNNNNn...................',
    '...nNmNNn.....nNNmNNn...................',
    '...nnnnnn.....nnnnnnn...................',
  ],
};

const book: PixelSprite = {
  id: 'bf5-book',
  name: 'bf5-book',
  tags: ['prop', 'bf5'],
  blurb: "An open book on the floor, a page turning now and then.",
  rows: [
    '.DDDDD.DDDDD.',
    'DwwwwwDwwwwwD',
    'DwxxxwDwxxxwD',
    'DwwwwwDwwwwwD',
    'DwxxwwDwxxwwD',
    'DbbbbbDbbbbbD',
  ],
  frames: [
    [
      '.DDDDD.DDDDD.',
      'DwwwwwDwwwwwD',
      'DwxxxwDwxxxwD',
      'DwwwwwDwwwwwD',
      'DwxxwwDwxxwwD',
      'DbbbbbDbbbbbD',
    ],
    [
      '.DDDDD.DDDDD.',
      'DwwwwwDwwwwwD',
      'DwxxxwDwxxxwD',
      'DwwwwwDwwwwwD',
      'DwxxwwDwxxwwD',
      'DbbbbbDbbbbbD',
    ],
    [
      '.DDDDD.DDDDD.',
      'DwwwwwDwwwwwD',
      'DwxxxwDwxxxwD',
      'DwwwwwDwwwwwD',
      'DwxxwwDwxxwwD',
      'DbbbbbDbbbbbD',
    ],
    [
      '.DDDDD...DD..',
      'DwwwwwD.DwwD.',
      'DwxxxwDDwxwD.',
      'DwwwwwDwwwwD.',
      'DwxxwwDwxxwwD',
      'DbbbbbDbbbbbD',
    ],
  ],
  frameMs: 700,
};

const consoleLightsLater = bfLater(bfConsoleLights, 'bf5-opener-console-lights-later', 3, 490);

export const bf5Opener: SceneArt = {
  id: 'bf5-opener',
  label: "Inside an investor's head, a hare in a gold crown stands on the console pumping its fist under a chart of Mount Stupid, while a humble tortoise below keeps its head in a book.",
  width: 80,
  height: 60,
  base: bfMindRoom,
  layers: [
    { sprite: dunningKruger, x: 11, y: 15 },
    { sprite: tradingBars, x: 54, y: 16 },
    { sprite: bfStarBig, x: 24, y: 15, motion: { kind: 'twinkle', periodMs: 2500, min: 0.3 } },
    { sprite: bfStar, x: 66, y: 15, motion: { kind: 'twinkle', periodMs: 1900, phase: 0.5, min: 0.2 } },
    { sprite: bfConsoleLights, x: 24, y: 34 },
    { sprite: consoleLightsLater, x: 62, y: 34 },
    { sprite: hareKing, x: 30, y: 5 },
    { sprite: bfSparkle, x: 31, y: 7, motion: { kind: 'twinkle', periodMs: 1600, min: 0.4 } },
    { sprite: bfShadowWide, x: 2, y: 55 },
    { sprite: tortoiseReading, x: 1, y: 39 },
    { sprite: book, x: 27, y: 50 },
  ],
};

const emblemCrown: PixelSprite = {
  id: 'bf5-emblem-crown',
  name: 'bf5-emblem-crown',
  tags: ['emblem', 'bf', 'lesson-5'],
  blurb: "Lesson 5's emblem: overconfidence caught as a gold crown with red and blue gems.",
  rows: [
    '..O....O....O..',
    '.OyO..OyO..OyO.',
    '.OGO..OGO..OGO.',
    'OGyGOOGyGOOGyGO',
    'OGGGGGGGGGGGGGO',
    'OGRGGGGBGGGGRGO',
    'OGGGGGGGGGGGGGO',
    'OyyyyyyyyyyyyyO',
    'OgggggggggggggO',
    '.OOOOOOOOOOOOO.',
  ],
};

export const bf5Finish: SceneArt = bfKeepsake(
  'bf5-finish',
  'A corked glass jar with a paper tag, holding a small gold crown set with red and blue gems, with bubbles rising inside and sparkles around it.',
  emblemCrown,
);

export const art: LessonArtSet = { opener: bf5Opener, backdrop: bfBackdrop, finish: bf5Finish };
