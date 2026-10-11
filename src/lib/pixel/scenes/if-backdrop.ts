/**
 * if-backdrop: the Investing Fundamentals world at night, behind every lesson screen of the pathway.
 * Where the quant skyline is hard rectangles, this is all rounded ground: a far ridge with a windmill
 * turning on it, a hill of orchard trees (a few coins still glinting in them), a split-rail fence,
 * and along the bottom, the part of the band a phone shows most, a tilled row of seedlings. Mist
 * drifts over the orchard and fireflies come and go. Every colour stays under luminance 0.15.
 */
import type { PixelSprite } from '../types';
import { IF_PALETTE } from './if-kit';
import type { SceneArt } from './types';

const base: PixelSprite = {
  id: 'if-backdrop-base',
  name: 'night orchard',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [
    '................................................................................................................',
    '................................................................................................................',
    '...............XX...............................................................................................',
    '..............XXXX..............................................................................................',
    '.............XXXXDD.............................................................................................',
    '.............XXXXDD.............................................................................................',
    '..............XXDD...............................................................DDD............................',
    '...............DD................................................................DkD............................',
    '.................................................................................DkD............................',
    '.................................................................................DkD.....................EE.....',
    '........................................EE.......................................DkD....................EKKK....',
    '.......................................EKKK.....................................DkOkD....................KKKKEE.',
    '......................EE...............KKKKKEEEEEEEE..EE........................DkkkD.................EEKKKKKKKK',
    '.....................EKKK..............KKKKKKKKKKKKKKEKKK.......................DkkkD..........EEEE.EEKKKKKKKKKK',
    '......................KK...........EEEEKKKKKKKKKKKKKKKKK........................DkkkD..........KKKKKKKKKKKKKKKKK',
    '.................EEEEKKKKKEEEEEEEEEKKKKKKKKKKKKKKKKKKKKKKK.......EE.............DkkkD..........KKKKKKKKKKKKKKKKK',
    '.......EEEE...ELLLKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKE....EKKK..LLL..EEEEEDkkkDEEEEEEEEEEKKKKKKKKKKKKKKKKK',
    'K...LLLKKKK.ELLLLVVVKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKLLLLVEKKKK.LLLVVEKKKKDkkkkkDKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKELLLVVKKKKKLLVVVVVKKKKKKKKKKKKKKKKKKKKKKKKKKKKLLLKKKKKKLLLVVVVKKKKLLVVVVVKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKLLVVVVVKKKKLVVVVVVKKKKKLLLLVKKKKKKKLLLKKKKKKLLLLVVVKKKKLLVVVVVKKKKLVVVVVVKKKKKKKKKKKKKKKKLLLLVKKKKKKKLLLKKKKKK',
    'KKLVVVVVVKKKKVVVVVVVKKKKLLLVVVVKKKKKLLLVVKKKKKLLVVVVVKKKLLVVVVVVVKKKVVVVVVVKKKKKKLLLKKKKKKLLLVVVVKKKKKLLLVVKKKKK',
    'KKVVVVVVVKKKKVVVVVVvKKKKLLVVVVVKKKKLLVVVVVKKKKLVVVVVVKKKVVVVVVVVVKKKVVVVVvvKKKKLLLLVVVKKKKLLVVVVVKKKKLLVVVVVKKKK',
    'KKVVVVVvvKKKKKVVVVvKKKKLLVVVVVVVKKKLVVVVVVKKKKVVVVVVVKKKKVVVVVVvKKKKKVVVvvKKKKKLLVVVVVKKKLLVVVVVVVKKKLVVVVVVKKKK',
    'KKKVVVvvKKKKKKKVvvKKKKKVVVVVVVVVKKKVVVVVVVKKKKVVVVVVvKKKKVVVVVvvKvvvvKKaKKKKKKKLVVVVVVKKKVVVVVVVVVKKKVVVVVVVKKKK',
    'KKKKKaKKKKKKvvvvavvvvKKKVVVVVVvKKKKVVVVVvvKKKKKVVVVvKKKKKKKVVvvvvvvvvvvaKKKKKKKVVVVVVVKKKKVVVVVVvKKKKVVVVVvvKKKv',
    'vvvvvavvvvvvvvvvvvvvvvvKVVVVVvvKKKKKVVVvvKKKKKKKVvvKKKKKKKvvavvvvvvvvvvvvvKKKKKVVVVVVvKKKKVVVVVvvKKKKKVVVvvKKvvv',
    'vvvvvvvvvvvvvvvvvvvvvvvvvvVVvKKKKKKKKKaKKKvvvvvvvavvvvvvvvvvvvvvvvvvvvvvvvvvvKKKVVVVvKKKKKKKVVvKKKKKKKKKaKvvvvvv',
    'vvvvvvvvvvvvvvvvvvvvvvvvvvvaKKKKKKKKKKavvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvKVvvKKKvvvvvvavvvvvvvvvvavvvvvvv',
    'vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvavvvvvvvvvvvvvvvvvvvvvvvvvvvvv',
    'vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv',
    'vvavvvvvvvvavvvvvvvvavvvvvvvvavvvvvvvvavvvvvvvvavvvvvvvvavvvvvvvvavvvvvvvvavvvvvvvvavvvvvvvvavvvvvvvvavvvvvvvvav',
    'vvAvvvvvvvvAvvvvvvvvAvvvvvvvvAvvvvvvvvAvvvvvvvvAvvvvvvvvAvvvvvvvvAvvvvvvvvAvvvvvvvvAvvvvvvvvAvvvvvvvvAvvvvvvvvAv',
    'aaAaaaaaaaaAaaaaaaaaAaaaaaaaaAaaaaaaaaAaaaaaaaaAaaaaaaaaAaaaaaaaaAaaaaaaaaAaaaaaaaaAaaaaaaaaAaaaaaaaaAaaaaaaaaAa',
    'vvAvvvvvvvvAvvvvvvvvAvvvvvvvvAvvvvvvvvAvvvvvvvvAvvvvvvvvAvvvvvvvvAvvvvvvvvAvvvvvvvvAvvvvvvvvAvvvvvvvvAvvvvvvvvAv',
    'vvAvvvvvvvvAvvvvvvvvAvvvvvvvvAvvvvvvvvAvvvvvvvvAvvvvvvvvAvvvvvvvvAvvvvvvvvAvvvvvvvvAvvvvvvvvAvvvvvvvvAvvvvvvvvAv',
    'aaAaaaaaaaaAaaaaaaaaAaaaaaaaaAaaaaaaaaAaaaaaaaaAaaaaaaaaAaaaaaaaaAaaaaaaaaAaaaaaaaaAaaaaaaaaAaaaaaaaaAaaaaaaaaAa',
    'VvAvVvvvvVvAvVvvvvVvAvVvvvvVvAvVvvvvVvAvVvvvvVvAvVvvvvVvAvVvvvvVvAvVvvvvVvAvVvvvvVvAvVvvvvVvAvVvvvvVvAvVvvvvVvAv',
    'VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV',
    'VVVnLVVVVnLVVnLVVVVVnLVVnLVVVVVnLVVnLVVVVnLVVVVnLVnLVVVVVnLVVnLVVVVVnLVVVnLVVnLVVVVVnLVVnLVVVVVnLVVnLVVVVVnLVVVV',
    'VVVVLVVVVVLVVVLVVVVVVLVVVLVVVVVVLVVVLVVVVVLVVVVVLVVLVVVVVVLVVVLVVVVVVLVVVVLVVVLVVVVVVLVVVLVVVVVVLVVVLVVVVVVLVVVV',
    'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
    'eeeeeeeeeDeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeDeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeDeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    'dddddddddddddddddeedddddddddddddddddddddddddddddddddeeedddddddddddddddddddddddddddddddddddeedddddddddddddddddddd',
    'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeDeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeDeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeDeeeeeeeeee',
  ],
};

const Lblades: PixelSprite = {
  id: 'if-backdrop-blades',
  name: 'if-backdrop-blades',
  tags: ['scene', 'if'],
  rows: [
    '.....X.....',
    '.....D.....',
    '.....D.....',
    '.....D.....',
    '.....D.....',
    'XDDDD.DDDDX',
    '.....D.....',
    '.....D.....',
    '.....D.....',
    '.....D.....',
    '.....X.....',
  ],
  frames: [
    [
      '.....X.....',
      '.....D.....',
      '.....D.....',
      '.....D.....',
      '.....D.....',
      'XDDDD.DDDDX',
      '.....D.....',
      '.....D.....',
      '.....D.....',
      '.....D.....',
      '.....X.....',
    ],
    [
      '...........',
      '.X.......X.',
      '..D.....D..',
      '...D...D...',
      '....D.D....',
      '...........',
      '....D.D....',
      '...D...D...',
      '..D.....D..',
      '.X.......X.',
      '...........',
    ],
  ],
  frameMs: 700,
};
const Lfirefly: PixelSprite = {
  id: 'if-backdrop-firefly',
  name: 'if-backdrop-firefly',
  tags: ['scene', 'if'],
  rows: [
    'O',
  ],
};
const Lspark: PixelSprite = {
  id: 'if-backdrop-spark',
  name: 'if-backdrop-spark',
  tags: ['scene', 'if'],
  rows: [
    'n',
  ],
};
const Lstar: PixelSprite = {
  id: 'if-backdrop-star',
  name: 'if-backdrop-star',
  tags: ['scene', 'if'],
  rows: [
    'D',
  ],
};
const Lfruit: PixelSprite = {
  id: 'if-backdrop-fruit',
  name: 'if-backdrop-fruit',
  tags: ['scene', 'if'],
  rows: [
    'O',
  ],
};
const LfogA: PixelSprite = {
  id: 'if-backdrop-fog-a',
  name: 'if-backdrop-fog-a',
  tags: ['scene', 'if'],
  rows: [
    '....kkkkkkkk.....kkkkkkk..',
    'kkkkk...kkkkkkkkkkk...kkkk',
  ],
};
const LfogB: PixelSprite = {
  id: 'if-backdrop-fog-b',
  name: 'if-backdrop-fog-b',
  tags: ['scene', 'if'],
  rows: [
    '..kkkkkkk..kkk',
    'kkk...kkkkkk..',
  ],
};
const Lsway1: PixelSprite = {
  id: 'if-backdrop-sway-1',
  name: 'if-backdrop-sway-1',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [
    '.L.',
    '.n.',
    '.L.',
  ],
  frames: [
    [
      '.L.',
      '.n.',
      '.L.',
    ],
    [
      'L..',
      '.n.',
      '.L.',
    ],
    [
      '.L.',
      '.n.',
      '.L.',
    ],
    [
      '..L',
      '.n.',
      '.L.',
    ],
  ],
  frameMs: 650,
};
const Lsway2: PixelSprite = {
  id: 'if-backdrop-sway-2',
  name: 'if-backdrop-sway-2',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [
    '.L.',
    '.n.',
    '.L.',
  ],
  frames: [
    [
      '.L.',
      '.n.',
      '.L.',
    ],
    [
      '..L',
      '.n.',
      '.L.',
    ],
    [
      '.L.',
      '.n.',
      '.L.',
    ],
    [
      'L..',
      '.n.',
      '.L.',
    ],
  ],
  frameMs: 780,
};

export const ifBackdrop: SceneArt = {
  id: 'if-backdrop',
  label: 'A dark orchard on rolling hills at night, with a windmill on the ridge, a wooden fence, a row of seedlings along the bottom and a few fireflies.',
  width: 112,
  height: 44,
  base,
  layers: [
    { sprite: Lblades, x: 77, y: 3 },
    { sprite: Lfirefly, x: 12, y: 28, motion: { kind: 'twinkle', periodMs: 6200, min: 0.15, phase: 0.2 } },
    { sprite: Lfirefly, x: 33, y: 23, motion: { kind: 'twinkle', periodMs: 5400, min: 0.15, phase: 0.6 } },
    { sprite: Lfirefly, x: 47, y: 33, motion: { kind: 'twinkle', periodMs: 7000, min: 0.15, phase: 0.1 } },
    { sprite: Lfirefly, x: 64, y: 27, motion: { kind: 'twinkle', periodMs: 5900, min: 0.15, phase: 0.8 } },
    { sprite: Lfirefly, x: 88, y: 31, motion: { kind: 'twinkle', periodMs: 6600, min: 0.15, phase: 0.4 } },
    { sprite: Lfirefly, x: 99, y: 24, motion: { kind: 'twinkle', periodMs: 5200, min: 0.15, phase: 0.9 } },
    { sprite: Lfirefly, x: 24, y: 34, motion: { kind: 'twinkle', periodMs: 7400, min: 0.15, phase: 0.5 } },
    { sprite: Lfirefly, x: 75, y: 35, motion: { kind: 'twinkle', periodMs: 6100, min: 0.15, phase: 0.3 } },
    { sprite: Lspark, x: 20, y: 37, motion: { kind: 'rise', amp: 6, periodMs: 6400 } },
    { sprite: Lspark, x: 58, y: 36, motion: { kind: 'rise', amp: 6, periodMs: 7200, phase: 0.45 } },
    { sprite: Lspark, x: 95, y: 37, motion: { kind: 'rise', amp: 6, periodMs: 6800, phase: 0.7 } },
    { sprite: Lstar, x: 40, y: 3, motion: { kind: 'twinkle', periodMs: 5200, min: 0.3, phase: 0.2 } },
    { sprite: Lstar, x: 61, y: 7, motion: { kind: 'twinkle', periodMs: 6100, min: 0.3, phase: 0.7 } },
    { sprite: Lstar, x: 102, y: 2, motion: { kind: 'twinkle', periodMs: 4700, min: 0.3, phase: 0.4 } },
    { sprite: Lfruit, x: 15, y: 19, motion: { kind: 'twinkle', periodMs: 4800, min: 0.3 } },
    { sprite: Lfruit, x: 50, y: 20, motion: { kind: 'twinkle', periodMs: 5500, min: 0.3, phase: 0.27 } },
    { sprite: Lfruit, x: 70, y: 19, motion: { kind: 'twinkle', periodMs: 6200, min: 0.3, phase: 0.54 } },
    { sprite: Lfruit, x: 94, y: 21, motion: { kind: 'twinkle', periodMs: 6900, min: 0.3, phase: 0.81 } },
    { sprite: LfogA, x: 22, y: 22, motion: { kind: 'drift', amp: 4, periodMs: 9000 } },
    { sprite: LfogB, x: 70, y: 25, motion: { kind: 'drift', amp: 3, periodMs: 7600, phase: 0.5 } },
    { sprite: Lsway1, x: 37, y: 37 },
    { sprite: Lsway2, x: 82, y: 37 },
  ],
};
