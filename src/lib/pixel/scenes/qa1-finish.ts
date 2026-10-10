/**
 * Quantitative Analysis lesson 1 keepsake: a gold medallion on an orchid V ribbon, embossed with a
 * sigma, with sparkles and light motes. Drawn 2026-09-30 for the lesson-complete screen (3pt/px).
 * Base = the ribbon. The medal (bail ring + disc) is a bobbing layer; the ring has a real 2x2 hole
 * and the base carries orchid under it at every bob position, so the ribbon reads as threaded
 * through the ring. The straps are 8 wide and gather into a 6-wide neck behind the ring.
 */
import type { PixelSprite } from '../types';
import type { SceneArt } from './types';

const ribbon: PixelSprite = {
  id: 'qa1-finish-ribbon',
  name: 'ribbon',
  tags: [],
  rows: [
    '..........EqPPPPpE............EqPPPPpE..........',
    '...........EqPPPPpE..........EqPPPPpE...........',
    '............EqPPPPpE........EqPPPPpE............',
    '.............EqPPPPpE......EqPPPPpE.............',
    '..............EqPPPPpE....EqPPPPpE..............',
    '...............EqPPPPpE..EqPPPPpE...............',
    '................EqPPPPpEEqPPPPpE................',
    '.................EqPPPPEqPPPPpE.................',
    '...................EqPEppPPpE...................',
    '.....................EppppE.....................',
    '.....................EEppEE.....................',
    '.......................pp.......................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
  ],
};

const medal: PixelSprite = {
  id: 'qa1-finish-medal',
  name: 'medal',
  tags: [],
  rows: [
    '.........OOOO.........',
    '........Oy..gO........',
    '........OG..gO........',
    '.........OOOO.........',
    '........OOOOOO........',
    '......OOyyyyyyOO......',
    '....OOyyyyyyyyGGOO....',
    '...OywwyOOOOOOGGGGO...',
    '..OwwyOOyyyyGGOOGGGO..',
    '.OyyyOyyyyyGGGGGOGGGO.',
    '.OyyOyyOOOOOOOGGGOGGO.',
    'OyyyOyyGOyyyyyGGGOGGgO',
    'OyyOyGGGGOGGGGGGGGOGgO',
    'OyGOyGGGGGOGGGGGGgOggO',
    'OyGOGGGGGGGOGGGGGgOggO',
    'OGGOGGGGGGOyGGGGGgOggO',
    'OGGOGGGGGOyGGGGGggOggO',
    'OGGOGGGGOyGGGGGGggOgOO',
    'OGGGOGGOOOOOOOgggOggOO',
    '.OGGOGGGyyyyyggggOyOO.',
    '.OGGGOGGGGGgggggOygOO.',
    '..OGGGOOGgggggOOygOO..',
    '...OGGggOOOOOOyggOO...',
    '....OOGGgyyyyyggOO....',
    '......OOgggOOOOO......',
    '........OOOOOO........',
  ],
};

const sparkleBig: PixelSprite = {
  id: 'qa1-finish-sparkle-big',
  name: 'sparkle-big',
  tags: [],
  rows: [
    '..y..',
    '..w..',
    'ywWwy',
    '..w..',
    '..y..',
  ],
  frames: [
    [
      '..y..',
      '..w..',
      'ywWwy',
      '..w..',
      '..y..',
    ],
    [
      '.....',
      '..y..',
      '.yWy.',
      '..y..',
      '.....',
    ],
    [
      '.....',
      '.....',
      '..w..',
      '.....',
      '.....',
    ],
    [
      '.....',
      '..y..',
      '.yWy.',
      '..y..',
      '.....',
    ],
  ],
  frameMs: 340,
};

const sparkleSmall: PixelSprite = {
  id: 'qa1-finish-sparkle-small',
  name: 'sparkle-small',
  tags: [],
  rows: [
    '.y.',
    'yWy',
    '.y.',
  ],
  frames: [
    [
      '.y.',
      'yWy',
      '.y.',
    ],
    [
      '...',
      '.w.',
      '...',
    ],
  ],
  frameMs: 520,
};

const moteGold: PixelSprite = {
  id: 'qa1-finish-mote-gold',
  name: 'mote-gold',
  tags: [],
  rows: [
    'y',
    'G',
  ],
};

const moteWhite: PixelSprite = {
  id: 'qa1-finish-mote-white',
  name: 'mote-white',
  tags: [],
  rows: [
    'w',
    'y',
  ],
};

/**
 * The same sparkle starting elsewhere in its cycle and running a touch slower. Frames tick from
 * mount with no offset (PixelSpriteView), so two layers sharing one sprite would flash in step;
 * a twinkle `phase` only offsets opacity, not the shape.
 */
function later(sprite: PixelSprite, id: string, by: number, frameMs: number): PixelSprite {
  const frames = sprite.frames ?? [sprite.rows];
  return { ...sprite, id, frames: [...frames.slice(by), ...frames.slice(0, by)], frameMs };
}

const sparkleBigLater = later(sparkleBig, 'qa1-finish-sparkle-big-later', 2, 380);
const sparkleSmallLater = later(sparkleSmall, 'qa1-finish-sparkle-small-later', 1, 610);

export const qa1Finish: SceneArt = {
  id: 'qa1-finish',
  label: 'A gold medallion hanging from a purple ribbon, embossed with a sigma, with small sparkles around it.',
  width: 48,
  height: 40,
  base: ribbon,
  layers: [
    { sprite: medal, x: 13, y: 8, motion: { kind: 'bob', amp: 1, periodMs: 2400 } },
    { sprite: sparkleBig, x: 5, y: 12, motion: { kind: 'twinkle', periodMs: 1600, min: 0.45 } },
    { sprite: sparkleBigLater, x: 37, y: 27, motion: { kind: 'twinkle', periodMs: 1900, phase: 0.5, min: 0.45 } },
    { sprite: sparkleSmall, x: 39, y: 6, motion: { kind: 'twinkle', periodMs: 1300, phase: 0.25, min: 0.35 } },
    { sprite: sparkleSmallLater, x: 9, y: 31, motion: { kind: 'twinkle', periodMs: 2100, phase: 0.7, min: 0.35 } },
    { sprite: moteGold, x: 11, y: 24, motion: { kind: 'rise', amp: 5, periodMs: 2200, phase: 0.1 } },
    { sprite: moteWhite, x: 36, y: 20, motion: { kind: 'rise', amp: 5, periodMs: 2600, phase: 0.6 } },
    { sprite: moteGold, x: 34, y: 32, motion: { kind: 'rise', amp: 4, periodMs: 1900, phase: 0.35 } },
  ],
};
