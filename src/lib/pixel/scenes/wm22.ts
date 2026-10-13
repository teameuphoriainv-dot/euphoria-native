/**
 * Wealth Management lesson 22 (impact investing and values-based portfolios): its opener, the
 * pathway backdrop and its keepsake, as one set loaded on demand.
 *
 * The opener is the lawn under the family oak (wm-kit.ts) on a moonlit night, with wind turbines
 * turning on the far hills, each on a gold hub. The grandmother, drawn large from wm-kit-c.ts,
 * waters the spot where her grandchild has just planted a gold coin in fresh earth; a spade stands
 * in the turf. The lesson's point is money put to work for returns and for the things the family
 * values at once, measured for its real effect, so the picture is a planting of money: the coin is
 * the seed, a sapling grows up out of it under the water, and the turbines are the kind of thing
 * such money builds. The old oak was someone's long view; the sapling is this generation's. What
 * moves: the sapling sprouting from the coin and growing, the turbines turning out of step, water
 * falling from the can's rose, the coin glinting, fireflies rising, stars twinkling. The keepsake
 * carries a wind turbine with a gold coin for its hub.
 */
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';
import { wmBackdrop } from './wm-backdrop';
import { wmBands, wmCompose, wmFirefly, wmLater, wmOak, wmStar, wmStarDot, WM_INKS } from './wm-kit';
import { wmSkyDots } from './wm-kit-b';
import { wmChildTall, wmElderTall, wmMoon, wmRepose } from './wm-kit-c';
import { wmKeepsake } from './wm1-finish';

/** The far ridge's top row at column x: two slow swells, so the hills roll. */
const ridgeTop = (x: number) => 33 + Math.round(2 + 1.6 * Math.sin(x / 9) + 1.2 * Math.sin(x / 4 + 1));

/** Each turbine's hub, [x, y]; its tower runs down to the ridge, its rotor turns around the hub. */
const TURBINES: readonly (readonly [number, number])[] = [[56, 22], [66, 25], [74, 28]];

/** The can's top-left; its rose, the falling water and the sapling line up under it. */
const CAN_X = 33;
const CAN_Y = 45;

const skyDots = wmSkyDots('wm22-opener-sky-dots', 80, 30, [
  [24, 2, 'X'],
  [47, 4, 'D'],
  [52, 13, 'X'],
  [70, 6, 'D'],
  [77, 15, 'X'],
  [29, 17, 'D'],
  [61, 1, 'X'],
]);

/** The far hills, a lit crest over night ground, from the oak to the right edge. 80x9. */
const ridge: PixelSprite = {
  id: 'wm22-opener-ridge',
  name: 'wm22-opener-ridge',
  tags: ['scene', 'wm22'],
  rows: Array.from({ length: 9 }, (_, j) =>
    Array.from({ length: 80 }, (_, x) => {
      const top = ridgeTop(x) - 32;
      if (j < top) return '.';
      return j === top ? 'D' : 'k';
    }).join(''),
  ),
};

/** A turbine's tower from just under its hub down to the ridge, lit on its left. */
function tower(id: string, [x, y]: readonly [number, number]): { sprite: PixelSprite; x: number; y: number } {
  const height = ridgeTop(x) - y - 1;
  return {
    sprite: { id, name: id, tags: ['scene', 'wm22'], rows: ['XX', ...Array.from({ length: height - 1 }, () => 'xX')] },
    x,
    y: y + 1,
  };
}

/** The grandmother's left arm out, holding the watering can over the sapling. 15x22. */
const elderWatering = wmRepose(wmElderTall, 'wm22-opener-elder-watering', {
  10: '..qPPPPPPppppC.',
  11: '..PPpEEEpPpppU.',
  12: '.CPPpEEEpPp....',
}, 0, 3);

/** A tin watering can held by its handle, the spout raised to a rose on the right. 10x6. */
const can: PixelSprite = {
  id: 'wm22-opener-can',
  name: 'wm22-opener-can',
  tags: ['scene', 'wm22'],
  rows: ['.XxxX.....', '.X..X...XX', 'xwxxxX.X..', 'xwxxxXX...', 'xxxxxX....', 'XXXXXD....'],
};

/** The gold coin the grandchild has planted, half sunk in the fresh earth at the top of the mound. 6x3. */
const plantedCoin: PixelSprite = {
  id: 'wm22-opener-planted-coin',
  name: 'wm22-opener-planted-coin',
  tags: ['scene', 'wm22'],
  rows: ['.yGGg.', 'yGGGgg', '.gggO.'],
};

/** Where the sapling grows from: its 5x5 box stands on the planted coin, its stem over the coin's middle. */
const SAPLING_X = CAN_X + 7;
const SAPLING_Y = 49;

/** Fresh earth heaped round the sapling's roots. 17x4. */
const mound: PixelSprite = {
  id: 'wm22-opener-mound',
  name: 'wm22-opener-mound',
  tags: ['scene', 'wm22'],
  palette: WM_INKS,
  rows: ['....CCCCCCCCU....', '..CCCCUUUUUUUUU..', '.CUUUUUUUUUUUUUO.', 'UUUUUUUUUUUUUUOOO'],
};

/** The grandchild kneeling at the far side of the mound: the kit's figure down to the jumper's hem. 9x12. */
const childKneeling: PixelSprite = { ...wmChildTall, id: 'wm22-opener-child-kneeling', name: 'wm22-opener-child-kneeling', rows: wmChildTall.rows.slice(0, 12) };

/** A spade standing in the turf. 3x13. */
const spade: PixelSprite = {
  id: 'wm22-opener-spade',
  name: 'wm22-opener-spade',
  tags: ['scene', 'wm22'],
  palette: WM_INKS,
  rows: ['UUU', ...Array.from({ length: 8 }, () => '.U.'), 'xXX', 'xXX', 'xXD', '.D.'],
};

/** Tufts of lit grass across the lawn. */
const tufts = wmSkyDots('wm22-opener-tufts', 80, 20, [
  [22, 2, 'H'],
  [57, 3, 'H'],
  [70, 7, 'H'],
  [6, 9, 'H'],
  [64, 13, 'H'],
  [14, 15, 'H'],
  [76, 17, 'H'],
]);

const base = wmCompose('wm22-opener-base', wmBands(80, [['K', 40], ['h', 20]]), [
  { sprite: skyDots, x: 0, y: 0 },
  { sprite: { ...tufts, palette: WM_INKS }, x: 0, y: 40 },
  { sprite: wmMoon, x: 33, y: 3 },
  { sprite: ridge, x: 0, y: 32 },
  ...TURBINES.map((hub, i) => tower(`wm22-opener-tower-${i}`, hub)),
  { sprite: wmOak, x: -7, y: 6 },
  { sprite: spade, x: 58, y: 44 },
  { sprite: elderWatering, x: 20, y: 36 },
  { sprite: can, x: CAN_X, y: CAN_Y },
  { sprite: childKneeling, x: CAN_X + 13, y: 44 },
  { sprite: mound, x: CAN_X + 1, y: 54 },
  { sprite: plantedCoin, x: SAPLING_X, y: 53 },
]);

/* ── what moves ─────────────────────────────────────────────────────────────────────────────── */

/** Three blades round a hub at angle `a0`, a quarter of a blade's turn a frame. 9x9. */
function rotorFrame(a0: number): string[] {
  const grid = wmBands(9, [['.', 9]]).map((row) => [...row]);
  for (let k = 0; k < 3; k += 1) {
    const a = a0 + (k * 2 * Math.PI) / 3;
    for (let r = 1; r <= 4; r += 1) grid[Math.round(4 - r * Math.sin(a))][Math.round(4 + r * Math.cos(a))] = 'x';
  }
  grid[4][4] = 'G';
  return grid.map((row) => row.join(''));
}
const rotor: PixelSprite = {
  id: 'wm22-opener-rotor',
  name: 'wm22-opener-rotor',
  tags: ['scene', 'wm22'],
  blurb: 'A wind turbine turning on the hills: the kind of thing values-based money builds.',
  rows: rotorFrame(Math.PI / 2),
  frames: [0, 1, 2, 3].map((i) => rotorFrame(Math.PI / 2 - (i * Math.PI) / 6)),
  frameMs: 170,
};
const rotors = [rotor, wmLater(rotor, 'wm22-opener-rotor-b', 1, 200), wmLater(rotor, 'wm22-opener-rotor-c', 2, 230)];

/** Water falling from the rose onto the sapling, drops sliding down a row a frame. 3x7. */
const DROPS: readonly (readonly [number, number])[] = [[1, 0], [0, 2], [2, 3], [1, 5]];
const waterAt = (f: number) => Array.from({ length: 7 }, (_, y) =>
  Array.from({ length: 3 }, (_, x) => (DROPS.some(([dx, dy]) => dx === x && (dy + f) % 7 === y) ? 'B' : '.')).join(''));
const water: PixelSprite = {
  id: 'wm22-opener-water',
  name: 'wm22-opener-water',
  tags: ['scene', 'wm22'],
  rows: waterAt(0),
  frames: Array.from({ length: 7 }, (_, f) => waterAt(f)),
  frameMs: 120,
};

/**
 * The sapling growing up out of the coin: bare earth, a two-leaved sprout, a young crown, then the
 * full sapling held while the water falls on it. The still is the full sapling. 5x5.
 */
const SPROUTING: readonly (readonly string[])[] = [
  ['.....', '.....', '.....', '.....', '.....'],
  ['.....', '.....', '.....', '.m.N.', '..U..'],
  ['.....', '.....', '.mNN.', '.NNn.', '..U..'],
  ['.mNN.', 'mNNNn', 'NNNnn', '.nnn.', '..U..'],
];
const sapling: PixelSprite = {
  id: 'wm22-opener-sapling',
  name: 'wm22-opener-sapling',
  tags: ['scene', 'wm22'],
  palette: WM_INKS,
  blurb: 'A sapling sprouting from the planted coin and growing under the water.',
  rows: [...SPROUTING[3]],
  frames: [...SPROUTING, ...Array.from({ length: 6 }, () => SPROUTING[3])].map((rows) => [...rows]),
  frameMs: 420,
};

const glint: PixelSprite = {
  id: 'wm22-opener-glint',
  name: 'wm22-opener-glint',
  tags: ['scene', 'wm22'],
  rows: ['W'],
};

export const wm22Opener: SceneArt = {
  id: 'wm22-opener',
  label: 'Under the old family oak at night a grandchild kneels by a gold coin planted in fresh earth as a sapling grows up out of it under the grandmother\'s watering can, while wind turbines turn on the moonlit hills.',
  width: 80,
  height: 60,
  base,
  layers: [
    ...TURBINES.map(([x, y], i) => ({ sprite: rotors[i], x: x - 4, y: y - 4 })),
    { sprite: sapling, x: SAPLING_X, y: SAPLING_Y },
    { sprite: water, x: CAN_X + 8, y: CAN_Y + 2 },
    { sprite: glint, x: SAPLING_X + 1, y: 53, motion: { kind: 'twinkle', periodMs: 1900, min: 0 } },
    { sprite: wmFirefly, x: 12, y: 44, motion: { kind: 'rise', amp: 6, periodMs: 3200, phase: 0.2 } },
    { sprite: wmFirefly, x: 66, y: 46, motion: { kind: 'rise', amp: 5, periodMs: 2800, phase: 0.7 } },
    { sprite: wmStar, x: 45, y: 8, motion: { kind: 'twinkle', periodMs: 2300, min: 0.3 } },
    { sprite: wmStarDot, x: 63, y: 10, motion: { kind: 'twinkle', periodMs: 1900, phase: 0.4, min: 0.2 } },
  ],
};

/**
 * A wind turbine, white blades and a grey tower, with a gold coin for its hub: money put to work in
 * the kind of thing the family values.
 */
const emblemTurbine: PixelSprite = {
  id: 'wm22-emblem-turbine',
  name: 'wm22-emblem-turbine',
  tags: ['scene', 'wm22'],
  rows: [
    '...........ww.',
    '..........ww..',
    '.........ww...',
    '......yGww....',
    '.wwwwyGGg.....',
    'wwww.GGgg.....',
    '......gg.w....',
    '......xX.ww...',
    '......xX..ww..',
    '......xX...ww.',
    '......xX......',
    '.....xxXD.....',
    '....xxXXDD....',
  ],
};

export const wm22Finish: SceneArt = wmKeepsake(
  'wm22-finish',
  emblemTurbine,
  'A green crest with a gold rim bearing a white wind turbine with a gold coin for its hub, framed by laurel over a purple banner, with sparkles around it.',
);

export const art: LessonArtSet = { opener: wm22Opener, backdrop: wmBackdrop, finish: wm22Finish };
