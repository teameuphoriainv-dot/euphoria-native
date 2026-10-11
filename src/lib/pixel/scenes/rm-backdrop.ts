/**
 * rm-backdrop: the harbour at night, the Risk Management course's world, drawn to sit along the
 * bottom of every lesson screen behind the content. A headland on the left carries a banded
 * lighthouse whose beam swings round; a pier on the right holds two moored boats and a lamp; channel
 * buoys blink on the swell between them; a stone quay runs along the foot. The sea is the kit's navy
 * ramp, so this reads as a different place from the quant skyline at a glance. Everything stays
 * under luminance 0.15, including the beam (O, the deep gold) and the buoy lights (r and n).
 */
import type { PixelSprite } from '../types';
import { RM_PALETTE, rmGull, rmRetint, rmShip, rmSwell } from './rm-kit';
import type { SceneArt } from './types';

const base: PixelSprite = {
  id: 'rm-backdrop-base',
  name: 'harbour at night',
  tags: [],
  palette: RM_PALETTE,
  rows: [
    '................................................................................................................',
    '................................................................................................................',
    '.................D..............................................................................................',
    '................DkD.............................................................................................',
    '...............DkkkD............................................................................................',
    '...............DOOOD............................................................................................',
    '...............DOOOD............................................................................................',
    '..............DDDDDDD...........................................................................................',
    '...............DXXXD............................................................................................',
    '...............DXKXD............................................................................................',
    '...............DrrrD............................................................................................',
    '...............DrrrD............................................................................................',
    '..............DXXXXXD...........................................................................................',
    '..............DXXKXXD...........................................................................................',
    '..............DrrrrrD...........................................................................................',
    '..............DrrrrrD...........................................................................................',
    '..............DXXXXXD...........................................................................................',
    '.............DXXXXXXXD..........................................................................................',
    '.............DXXXkXXXD..........................................................................................',
    '..........DDDDDDDDDDDDDDD..............................................................................DDD......',
    '.......DDDKKKKKKKKKKKKKKKDD............................................................................DDD......',
    '....DDDKKKKKKKKKKKKKKKKKKKKD............................................................................D.......',
    '..DDKKKKKKKKKKKKKKKKKKKKKKKkD...........................................................................D.......',
    'DDKKKKKKKKKKkkKKKKKKKKKKKKKKk...........................................................................D.......',
    'KKKKKKKKKKKKKKkkKKKKKKKKKKKKKD..........................................................................D.......',
    'KKKKKKKKKKKKKKKKkkKKKKKKkkKKKkDuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuDuuuuuuu',
    'KKKkkKKKKKKKKKKKKKKKKKKKKKkkKKkVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVDVVVVVVV',
    'KKKKKkkKKKKKKKKKKKKkkKKKKKKKkKKDuuuVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVuuVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVDVVVVVVV',
    'KKKKKKKkKKKKKKKKKKKKKkkKKKKKKKKkDvvvvvvvvvvVVvvvvvvvvvvvvvvvvvvvVVVVvvvvvVVVvvvvvvvvvvvvvvvvvvvvvvvvvvvvDvvvvvvv',
    'KKKKKKKKKKKKKKKKKKKKKKKkkKKKKKKKkvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvVVvvvvvvvvvDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    'KKKKKKKKKKKKKKKKKKKKKKKKKkKKkkKKKDXvVVVVvvvvvvvVVvvvvvvvvvvvvvvvvvvvvVVVVVvvvvvvvvkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'KKKKKKKkkKKKKKKKKKKKKKKKKKKKKKkkKkDXvvvvvvvvvvvvvvvvvvvVVvvvvvvvvvvvvvvvvvvvvvvvvvvvkKvvVVkKvvvvkKvvvvkKvvvvkKvv',
    'KKKKKKKKKkkKKKKKKKKKKKKKKKKKKKKKKKkvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvVVVVvvvvvvvvvvvkKVVvVkKVvvvkKvvVVkKvvvvkKvv',
    'KKKKKKKKKKKkKKKkkKKKKKKKKKKKKKKKKKKDXvvVVvvvvvVVvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvVkKvvvvkKvvvvkKvvvvkKvvvvkKvv',
    'KKKKKKKKKKKKKKKKKkkKKKKKKKKKKKKKKKKkDvvvvuVVVvvvuuuuuVVVvvvvvvvVVVvvvvvvvvvvvvvvvvvvkKvvvvkKvvvvkKvvvvkKvvvvkKvv',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKkXvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvVVvuVvvvvvkKvvvvkKvvvvkKvvVVkKvvvvkKvv',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKXVVvvvvvDvvvvvvvvvvvvvvvvvvvvvDvvvvvuvuuvvvuvuvkKvvvvkKvvvvkKvvvvkKvvvvkKvv',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKvXvvvvvDkDvvvvvvvvvvvvvvvvvvvDkDvvvvvvvvvvvVVuukKvvvvkKvvvvkKvvvvkKvvvvkKvv',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKDvXvvvVDkDvvvvvvvvvvvvvuuuuuvDkDvvvvvvvvvvvvvvvkKvvVVkuuvuvkuuvvvkKvvvvkKvv',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    'kkkKkkkkkkkkKkkkkkkkkKkkkkkkkkKkkkkkkkkKkkkkkkkkKkkkkkkkkKkkkkkkkkKkkkkkkkkKkkkkkkkkKkkkkkkkkKkkkkkkkkKkkkkkkkkK',
    'kkkKkkkkkkkkKkkkkkkkkKkkkkkkkkKkkkkkkkkKkkkkkkkkKkkkkkkkkKkkkkkkkkKkkkkkkkkKkkkkkkkkKkkkkkkkkKkkkkkkkkKkkkkkkkkK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'kkkkkkkKkkkkkkkkKkkkkkkkkKkkkkkkkkKkkkkkkkkKkkkkkkkkKkkkkkkkkKkkkkkkkkKkkkkkkkkKkkkkkkkkKkkkkkkkkKkkkkkkkkKkkkkk',
  ],
};

/**
 * The lighthouse beam going round: swept right, a flare as it faces us, swept left, then away.
 * Sparse toward the tips so the beam thins out instead of ending on a hard edge.
 */
const beam: PixelSprite = {
  id: 'rm-backdrop-beam',
  name: 'beam',
  tags: [],
  rows: [
    '.....................OO.O..O...O.....',
    '...................OOOOOOOOO.OO.O..O.',
    '...................OOOOOOOOOO.OO.O..O',
    '.....................OO.O..O...O.....',
  ],
  frameMs: 700,
  frames: [
    [
      '.....................OO.O..O...O.....',
      '...................OOOOOOOOO.OO.O..O.',
      '...................OOOOOOOOOO.OO.O..O',
      '.....................OO.O..O...O.....',
    ],
    [
      '.................O...................',
      '...............OOOOO.................',
      '...............OOOOO.................',
      '.................O...................',
    ],
    [
      '.....O...O..O.OO.....................',
      '.O..O.OO.OOOOOOOOO...................',
      'O..O.OO.OOOOOOOOOO...................',
      '.....O...O..O.OO.....................',
    ],
    [
      '.....................................',
      '.....................................',
      '.....................................',
      '.....................................',
    ],
  ],
};

const buoyRed: PixelSprite = {
  id: 'rm-backdrop-buoy-red',
  name: 'buoy-red',
  tags: [],
  rows: [
    '..r..',
    '..D..',
    '.DrD.',
    '.DkD.',
    'DrrrD',
  ],
  frameMs: 800,
  frames: [
    [
      '..r..',
      '..D..',
      '.DrD.',
      '.DkD.',
      'DrrrD',
    ],
    [
      '.....',
      '..D..',
      '.DrD.',
      '.DkD.',
      'DrrrD',
    ],
  ],
};

const buoyGreen: PixelSprite = {
  id: 'rm-backdrop-buoy-green',
  name: 'buoy-green',
  tags: [],
  rows: [
    '..n..',
    '..D..',
    '.DnD.',
    '.DkD.',
    'DnnnD',
  ],
  frameMs: 1100,
  frames: [
    [
      '.....',
      '..D..',
      '.DnD.',
      '.DkD.',
      'DnnnD',
    ],
    [
      '..n..',
      '..D..',
      '.DnD.',
      '.DkD.',
      'DnnnD',
    ],
  ],
};

/** A sailboat moored for the night: masthead light, sail furled on the boom. */
const boat: PixelSprite = {
  id: 'rm-backdrop-boat',
  name: 'boat',
  tags: [],
  rows: [
    '......X......',
    '......D......',
    '......D......',
    '......D......',
    '......D......',
    '......D......',
    '......D......',
    '......D......',
    '...XXXDX.....',
    '...DDDDDDD...',
    '......D......',
    'DDDDDDDDDDDDD',
    '.kkkkkkkkkkk.',
    '..kkkkkkkkk..',
  ],
};

const lampLight: PixelSprite = {
  id: 'rm-backdrop-lamp',
  name: 'lamp',
  tags: [],
  rows: [
    'O',
  ],
};

const lampReflection: PixelSprite = {
  id: 'rm-backdrop-lamp-reflection',
  name: 'lamp-reflection',
  tags: [],
  rows: [
    'O',
    '.',
    'O',
    'O',
    '.',
    '.',
    'O',
  ],
};

const star: PixelSprite = {
  id: 'rm-backdrop-star',
  name: 'star',
  tags: [],
  rows: [
    'D',
  ],
};

/* The kit's bright pieces, retinted to the backdrop's quiet steps. */
const swellQuiet = rmRetint(rmSwell, 'rm-backdrop-swell', { w: 'U', B: 'u', u: 'V' });
const shipQuiet = rmRetint(rmShip, 'rm-backdrop-ship', { w: 'X', x: 'D', y: 'O' });
const gullQuiet = rmRetint(rmGull, 'rm-backdrop-gull', { w: 'X', x: 'D' });

export const rmBackdrop: SceneArt = {
  id: 'rm-backdrop',
  label: 'A dark harbor at night with a striped lighthouse on a headland, moored boats by a pier and blinking channel buoys.',
  width: 112,
  height: 44,
  base,
  layers: [
    { sprite: beam, x: 0, y: 4 },
    { sprite: star, x: 44, y: 6, motion: { kind: 'twinkle', periodMs: 5400, min: 0.3, phase: 0.2 } },
    { sprite: star, x: 71, y: 3, motion: { kind: 'twinkle', periodMs: 6200, min: 0.3, phase: 0.7 } },
    { sprite: star, x: 96, y: 9, motion: { kind: 'twinkle', periodMs: 4800, min: 0.3, phase: 0.4 } },
    { sprite: gullQuiet, x: 30, y: 9, motion: { kind: 'drift', amp: 3, periodMs: 7000, phase: 0.1 } },
    { sprite: shipQuiet, x: 56, y: 18, motion: { kind: 'drift', amp: 3, periodMs: 9000, phase: 0.6 } },
    { sprite: swellQuiet, x: 58, y: 26, motion: { kind: 'drift', amp: 2, periodMs: 6400, phase: 0.0 } },
    { sprite: swellQuiet, x: 38, y: 29, motion: { kind: 'drift', amp: 2, periodMs: 7200, phase: 0.5 } },
    { sprite: swellQuiet, x: 44, y: 33, motion: { kind: 'drift', amp: 2, periodMs: 6800, phase: 0.25 } },
    { sprite: buoyRed, x: 48, y: 29, motion: { kind: 'bob', amp: 1, periodMs: 2800, phase: 0.3 } },
    { sprite: buoyGreen, x: 60, y: 33, motion: { kind: 'bob', amp: 1, periodMs: 3100, phase: 0.8 } },
    { sprite: boat, x: 72, y: 22, motion: { kind: 'bob', amp: 1, periodMs: 3400, phase: 0.1 } },
    { sprite: boat, x: 89, y: 24, motion: { kind: 'bob', amp: 1, periodMs: 3800, phase: 0.6 } },
    { sprite: lampLight, x: 104, y: 20, motion: { kind: 'twinkle', periodMs: 3600, min: 0.5 } },
    { sprite: lampReflection, x: 105, y: 31, motion: { kind: 'twinkle', periodMs: 2600, min: 0.3, phase: 0.4 } },
  ],
};
