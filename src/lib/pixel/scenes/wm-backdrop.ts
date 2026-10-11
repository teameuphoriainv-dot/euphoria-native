/**
 * wm-backdrop: the family estate at night, for every screen of the Wealth Management pathway. A low,
 * wide horizon where the quant's was tall and dense: rolling hills (K with an h ridge), the family
 * oak from the kit with a swing turning slowly under it, a Georgian manor whose four-column portico
 * echoes the house of five pillars, two cypresses, a hedge, and a wrought-iron fence with an open
 * gateway onto a lamplit door. What moves: a few windows and the gate lanterns breathe, smoke rises
 * from both chimneys, fireflies drift up over the lawn, the swing sways, stars twinkle. Everything
 * stays under luminance 0.15, so the band sits behind text as a horizon, never a layer on it.
 */
import type { PixelSprite } from '../types';
import type { SceneArt } from './types';
import { wmBands, wmCompose, wmOak, WM_INKS } from './wm-kit';

/** Far hills, the ridge picked out in night green. */
const hills: PixelSprite = {
  id: 'wm-backdrop-hills',
  name: 'wm-backdrop-hills',
  tags: [],
  palette: WM_INKS,
  rows: [
    '................................................................................................................',
    '...........................................................................................hhhhhhhhhhhhh........',
    '........................................hhhhhhhhhhh....................................hhhhKKKKKKKKKKKKKhhhh....',
    '....................................hhhhKKKKKKKKKKKhhhhh............................hhhKKKKKKKKKKKKKKKKKKKKKhh..',
    '.................................hhhKKKKKKKKKKKKKKKKKKKKhhhh.....................hhhKKKKKKKKKKKKKKKKKKKKKKKKKKhh',
    '..............................hhhKKKKKKKKKKKKKKKKKKKKKKKKKKKhhhh.............hhhhKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    '............................hhKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKhhhhhhhhhhhhhKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'hh.......................hhhKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKhhh.................hhhKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKhhhh.........hhhhKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKhhhhhhhhhKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
  ],
};

/** The manor: hipped roofs, two chimneys, a pedimented portico of four columns, the door lit. 44x24. */
const manor: PixelSprite = {
  id: 'wm-backdrop-manor',
  name: 'wm-backdrop-manor',
  tags: [],
  rows: [
    '..............DD............DD..............',
    '..............Dk............Dk..............',
    '..............DkKDDDDDDDDDDKDk..............',
    '..............DKKKKKKKKKKKKKKk..............',
    '..............KKKKKKKKKKKKKKKK..............',
    '.............KKKKKKKKKKKKKKKKKK.............',
    '............DDDDDDDDDDDDDDDDDDDD............',
    '............DkkkkkkkkkkkkkkkkkkK............',
    '..KDDDDDDK..DkKKkkKKkkkkKKkkKKkK..KDDDDDDK..',
    '.KKKKKKKKKK.DkKKkkKKkkkkKKkkKKkK.KKKKKKKKKK.',
    'DDDDDDDDDDDDDkKKkkKKkkkkKKkkKKkKDDDDDDDDDDDD',
    'DkkkkkkkkkkKDkDDkkDDkkkkDDkkDDkKDkkkkkkkkkkK',
    'DkkkkkkkkkkKDkkkkkkXDDDDDDkkkkkKDkkkkkkkkkkK',
    'DkkKKkkKKkkKDkkkkXXDDDDDDDDDkkkKDkkKKkkKKkkK',
    'DkkKKkkKKkkKDkkXXXXXXXXXXXXXXXkKDkkKKkkKKkkK',
    'DkkKKkkKKkkKDkkkXDkXDkkkXDkXDkkKDkkKKkkKKkkK',
    'DkkDDkkDDkkKDkkkXDkXDKKkXDkXDkkKDkkDDkkDDkkK',
    'DkkkkkkkkkkKDKKkXDkXDOOkXDkXDKKKDkkkkkkkkkkK',
    'DkkKKkkKKkkKDKKkXDkXDOOkXDkXDKKKDkkKKkkKKkkK',
    'DkkKKkkKKkkKDKKkXDkXDOOkXDkXDKKKDkkKKkkKKkkK',
    'DkkKKkkKKkkKDDDkXDkXDOOkXDkXDDDKDkkKKkkKKkkK',
    'DkkDDkkDDkkKDkkkXDkXDOOkXDkXDkkKDkkDDkkDDkkK',
    'DkkkkkkkkkkKDkkkXDkXDOOkXDkXDkkKDkkkkkkkkkkK',
    'DkkkkkkkkkkKDkkDDDDDDDDDDDDDDkkKDkkkkkkkkkkK',
  ],
};

/** A cypress beside the house. 5x22. */
const cypress: PixelSprite = {
  id: 'wm-backdrop-cypress',
  name: 'wm-backdrop-cypress',
  tags: [],
  palette: WM_INKS,
  rows: [
    '..h..',
    '.Hhh.',
    '.hhh.',
    '.Hhh.',
    'Hhhhh',
    'hhhhh',
    'Hhhhh',
    'Hhhhh',
    'hhhhh',
    'Hhhhh',
    'Hhhhh',
    'hhhhh',
    'Hhhhh',
    'Hhhhh',
    'hhhhh',
    'Hhhhh',
    'Hhhhh',
    'hhhhh',
    'Hhhhh',
    'Hhhhh',
    '.hhh.',
    '..k..',
  ],
};

/** The hedge behind the fence, open at the gateway. */
const hedge: PixelSprite = {
  id: 'wm-backdrop-hedge',
  name: 'wm-backdrop-hedge',
  tags: [],
  palette: WM_INKS,
  rows: [
    '................................................................................................................',
    'hHHhhh......hHHhhh......hHHhhh......hHHhhh......hHHhhh......hHHhhh......hHHh........hHHhhh......hHHhhh......hHHh',
    'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh........hhhhhhhhhhhhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh........hhhhhhhhhhhhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh........hhhhhhhhhhhhhhhhhhhhhhhhhhhh',
  ],
};

/** Wrought iron: spear tips, one rail, stone posts, and the two gate posts either side of the gap. */
const fence: PixelSprite = {
  id: 'wm-backdrop-fence',
  name: 'wm-backdrop-fence',
  tags: [],
  rows: [
    '.X...X...X..DDDD.X...X...X...X...X...X..DDDD.X...X...X...X...X...X...X...XDDDD....DDDD...X...X...X...X...XDDDD..',
    '.D...D...D...XD..D...D...D...D...D...D...XD..D...D...D...D...D...D...D...D.XD......XDD...D...D...D...D...D.XDD..',
    'DDDDDDDDDDDDDXDDDDDDDDDDDDDDDDDDDDDDDDDDDXDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDXD......XDDDDDDDDDDDDDDDDDDDDDDDXDDDD',
    '.D...D...D...XD..D...D...D...D...D...D...XD..D...D...D...D...D...D...D...D.XD......XDD...D...D...D...D...D.XDD..',
    '.D...D...D...XD..D...D...D...D...D...D...XD..D...D...D...D...D...D...D...D.XD......XDD...D...D...D...D...D.XDD..',
    '.D...D...D...XD..D...D...D...D...D...D...XD..D...D...D...D...D...D...D...D.XD......XDD...D...D...D...D...D.XDD..',
    '.D...D...D...XD..D...D...D...D...D...D...XD..D...D...D...D...D...D...D...D.XD......XDD...D...D...D...D...D.XDD..',
  ],
};

/** Gravel through the gateway, up to the portico step. */
const gravel: PixelSprite = {
  id: 'wm-backdrop-gravel',
  name: 'wm-backdrop-gravel',
  tags: [],
  rows: [
    'kkDkkk',
    'kkkkDk',
  ],
};

/** The lawn edge, the walk, the kerb. */
const ground: PixelSprite = {
  id: 'wm-backdrop-ground',
  name: 'wm-backdrop-ground',
  tags: [],
  palette: WM_INKS,
  rows: [
    'hhhhhHhhhhhhhhhhhhhhhhhHhhhhhhhhhhHhhhhhhhhhhhhhhHhhhhhhhhhhhHhhhhhhhhhhhhhhhkkkkkkhhhhhhhhhhhhhHhhhhhhhHhhhhhhh',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
  ],
};

/** Lantern housings on the gate posts; the glass is dark here and lit by the lantern layers. */
const lanterns: PixelSprite = {
  id: 'wm-backdrop-lanterns',
  name: 'wm-backdrop-lanterns',
  tags: [],
  rows: [
    '.DD......DD.',
    'DkkD....DkkD',
  ],
};

const base = wmCompose('wm-backdrop-base', wmBands(112, [['.', 44]]), [
  { sprite: hills, x: 0, y: 24 },
  { sprite: ground, x: 0, y: 41 },
  { sprite: wmOak, x: 6, y: 6 },
  { sprite: cypress, x: 51, y: 17 },
  { sprite: cypress, x: 102, y: 17 },
  { sprite: manor, x: 58, y: 15 },
  { sprite: gravel, x: 77, y: 39 },
  { sprite: hedge, x: 0, y: 35 },
  { sprite: fence, x: 0, y: 34 },
  { sprite: lanterns, x: 74, y: 32 },
]);

/** A rope swing under the oak, swaying. 7x7. */
const swing: PixelSprite = {
  id: 'wm-backdrop-swing',
  name: 'wm-backdrop-swing',
  tags: [],
  rows: [
    '.D...D.',
    '.D...D.',
    '.D...D.',
    '.D...D.',
    '.D...D.',
    '.D...D.',
    '.XDDDk.',
  ],
  frames: [
    [
      '.D...D.',
      '.D...D.',
      '.D...D.',
      '.D...D.',
      '.D...D.',
      '.D...D.',
      '.XDDDk.',
    ],
    [
      '.D...D.',
      '.D...D.',
      '.D...D.',
      '..D...D',
      '..D...D',
      '..D...D',
      '..XDDDk',
    ],
    [
      '.D...D.',
      '.D...D.',
      '.D...D.',
      '.D...D.',
      '.D...D.',
      '.D...D.',
      '.XDDDk.',
    ],
    [
      '.D...D.',
      '.D...D.',
      '.D...D.',
      'D...D..',
      'D...D..',
      'D...D..',
      'XDDDk..',
    ],
  ],
  frameMs: 700,
};

/** A soft puff of chimney smoke. 4x3. */
const smoke: PixelSprite = {
  id: 'wm-backdrop-smoke',
  name: 'wm-backdrop-smoke',
  tags: [],
  rows: [
    '.kk.',
    'kDDk',
    '.kk.',
  ],
};

const litWindow: PixelSprite = {
  id: 'wm-backdrop-lit-window',
  name: 'wm-backdrop-lit-window',
  tags: [],
  rows: [
    'OO',
    'OO',
    'OO',
  ],
};

const lanternGlow: PixelSprite = {
  id: 'wm-backdrop-lantern-glow',
  name: 'wm-backdrop-lantern-glow',
  tags: [],
  rows: [
    'OO',
  ],
};

const firefly: PixelSprite = {
  id: 'wm-backdrop-firefly',
  name: 'wm-backdrop-firefly',
  tags: [],
  rows: [
    'n',
  ],
};

const star: PixelSprite = {
  id: 'wm-backdrop-star',
  name: 'wm-backdrop-star',
  tags: [],
  rows: [
    'X',
  ],
};

export const wmBackdrop: SceneArt = {
  id: 'wm-backdrop',
  label: 'A dark country estate at night: an old oak with a swing, a manor house with a few lit windows, and an iron fence with lanterns at an open gate.',
  width: 112,
  height: 44,
  base,
  layers: [
    { sprite: litWindow, x: 65, y: 28, motion: { kind: 'twinkle', periodMs: 6400, min: 0.35, phase: 0.1 } },
    { sprite: litWindow, x: 76, y: 23, motion: { kind: 'twinkle', periodMs: 7200, min: 0.3, phase: 0.6 } },
    { sprite: litWindow, x: 86, y: 23, motion: { kind: 'twinkle', periodMs: 5800, min: 0.35, phase: 0.35 } },
    { sprite: litWindow, x: 97, y: 28, motion: { kind: 'twinkle', periodMs: 6800, min: 0.3, phase: 0.8 } },
    { sprite: lanternGlow, x: 75, y: 33, motion: { kind: 'twinkle', periodMs: 3000, min: 0.4 } },
    { sprite: lanternGlow, x: 83, y: 33, motion: { kind: 'twinkle', periodMs: 3400, min: 0.4, phase: 0.5 } },
    { sprite: smoke, x: 71, y: 10, motion: { kind: 'rise', amp: 6, periodMs: 5200, phase: 0.0 } },
    { sprite: smoke, x: 85, y: 11, motion: { kind: 'rise', amp: 6, periodMs: 6000, phase: 0.5 } },
    { sprite: swing, x: 21, y: 26 },
    { sprite: firefly, x: 34, y: 31, motion: { kind: 'rise', amp: 5, periodMs: 4800, phase: 0.2 } },
    { sprite: firefly, x: 47, y: 33, motion: { kind: 'rise', amp: 6, periodMs: 5600, phase: 0.7 } },
    { sprite: firefly, x: 93, y: 30, motion: { kind: 'rise', amp: 5, periodMs: 5000, phase: 0.45 } },
    { sprite: firefly, x: 12, y: 32, motion: { kind: 'rise', amp: 4, periodMs: 4400, phase: 0.9 } },
    { sprite: star, x: 16, y: 2, motion: { kind: 'twinkle', periodMs: 5200, min: 0.3, phase: 0.2 } },
    { sprite: star, x: 46, y: 6, motion: { kind: 'twinkle', periodMs: 6100, min: 0.3, phase: 0.7 } },
    { sprite: star, x: 68, y: 3, motion: { kind: 'twinkle', periodMs: 4700, min: 0.3, phase: 0.4 } },
    { sprite: star, x: 97, y: 7, motion: { kind: 'twinkle', periodMs: 5500, min: 0.3, phase: 0.9 } },
  ],
};
