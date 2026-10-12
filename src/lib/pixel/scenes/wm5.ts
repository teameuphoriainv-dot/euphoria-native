/**
 * Wealth Management lesson 5 (insurance as a wealth tool): its opener, the pathway backdrop and
 * its keepsake, as one set loaded on demand.
 *
 * The opener is the lawn in a night storm: a bank of cloud, the far woods, the manor's lit windows
 * on the horizon. The family stands under one wide orchid umbrella that the father holds, the
 * money bag dry at their feet: an umbrella policy, a small premium keeping a large fortune out of
 * the weather. What moves: rain falls everywhere the umbrella is not, down to the lawn either side
 * of the family (framed tiles, masked to the canopy so the drops stop on it), lightning forks twice
 * and goes dark, a cloud drifts, drops splash on the canopy and ring the puddles, the manor's
 * windows glow. The label leaves the lightning out: it is dark at rest and under Reduce Motion.
 * The keepsake carries an umbrella.
 */
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';
import { wmBackdrop } from './wm-backdrop';
import { wmBands, wmChild, wmCompose, wmElder, wmMoneyBag, wmParent } from './wm-kit';
import { wmTreeline } from './wm-kit-a';
import { wmKeepsake } from './wm1-finish';

/** The umbrella's top-left in the scene; its shaft is the canopy's middle column. */
const CANOPY_X = 18;
const CANOPY_Y = 28;
const CANOPY_W = 37;
const MID = 18;

/**
 * Storm cloud from overlapping puffs ([x, y, radius]): lit along its top edge (D), dark below (K).
 */
function cloud(id: string, w: number, h: number, puffs: readonly (readonly [number, number, number])[]): PixelSprite {
  const inside = (x: number, y: number) => puffs.some(([cx, cy, r]) => Math.hypot(x - cx, y - cy) <= r);
  const rows = Array.from({ length: h }, (_, y) =>
    Array.from({ length: w }, (_, x) => {
      if (!inside(x, y)) return '.';
      if (!inside(x, y - 1)) return 'D';
      return inside(x, y + 1) ? 'k' : 'K';
    }).join(''),
  );
  return { id, name: id, tags: ['scene', 'wm5'], rows };
}

const cloudBank = cloud('wm5-opener-clouds', 80, 12, [
  [5, 1, 6],
  [15, 3, 6],
  [26, 0, 7],
  [37, 2, 6],
  [48, 0, 7],
  [60, 2, 6],
  [71, 0, 7],
  [80, 3, 5],
]);

const driftingCloud = cloud('wm5-opener-cloud-drift', 18, 6, [
  [5, 3, 3],
  [10, 2, 3.5],
  [14, 3, 2.5],
]);

const woods = wmTreeline('wm5-opener-woods', 80, 9, [
  [40, 60, 3],
  [4, 6, 7],
  [15, 5, 5],
  [27, 7, 8],
  [45, 6, 6],
  [57, 5, 5],
  [77, 6, 7],
]);

/** The manor far off on the rise, its windows dim until the glow layer lights them. 16x9. */
const manor: PixelSprite = {
  id: 'wm5-opener-manor',
  name: 'wm5-opener-manor',
  tags: ['scene', 'wm5'],
  rows: [
    '.......DD.......',
    '.....DDkkDD.....',
    '...DDkkkkkkDD...',
    '.DDkkkkkkkkkkDD.',
    'DDDDDDDDDDDDDDDD',
    'kkOkkkOkkOkkkOkk',
    'kkOkkkOkkOkkkOkk',
    'kkkkkkkkkkkkkkkk',
    'kkkkkkkOOkkkkkkk',
  ],
};

/** A rain puddle on the lawn. 9x2. */
const puddle: PixelSprite = {
  id: 'wm5-opener-puddle',
  name: 'wm5-opener-puddle',
  tags: ['scene', 'wm5'],
  rows: ['.DDDDDDD.', 'DKKKKKKKD'],
};

/** Half-widths of the umbrella's dome, from the row under the finial down to the widest. */
const HALF = [5, 9, 12, 13, 15, 16, 17, 17, 18, 18];

/** The canopy's ink at `dx` from its middle on a row `half` wide: four gores lit from the left, dark ribs between. */
function canopyInk(dx: number, half: number): string {
  if (Math.abs(dx) > half) return '.';
  if (Math.abs(dx) === half) return 'E';
  const rib = Math.round(half / 2);
  if (dx === -rib || dx === 0 || dx === rib) return 'p';
  if (dx < -rib) return 'q';
  return dx < rib ? 'P' : 'p';
}

/** The rim dips between the five rib tips. */
const RIM_TIPS = new Set([-18, -17, -10, -9, -8, -1, 0, 1, 8, 9, 10, 17, 18]);

/** The orchid umbrella: a finial, a dome of four gores, a scalloped rim. 37x12. */
const canopy: PixelSprite = {
  id: 'wm5-opener-canopy',
  name: 'wm5-opener-canopy',
  tags: ['scene', 'wm5'],
  rows: [
    Array.from({ length: CANOPY_W }, (_, x) => (x === MID ? 'x' : '.')).join(''),
    ...HALF.map((half) => Array.from({ length: CANOPY_W }, (_, x) => canopyInk(x - MID, half)).join('')),
    Array.from({ length: CANOPY_W }, (_, x) => (RIM_TIPS.has(x - MID) ? 'E' : '.')).join(''),
  ],
};

const shaft: PixelSprite = {
  id: 'wm5-opener-shaft',
  name: 'wm5-opener-shaft',
  tags: ['scene', 'wm5'],
  rows: Array.from({ length: 13 }, () => 'D'),
};

const base = wmCompose('wm5-opener-base', wmBands(80, [['K', 44], ['h', 16]]), [
  { sprite: cloudBank, x: 0, y: 0 },
  { sprite: woods, x: 0, y: 35 },
  { sprite: manor, x: 61, y: 35 },
  { sprite: puddle, x: 3, y: 53 },
  { sprite: puddle, x: 57, y: 56 },
  { sprite: puddle, x: 66, y: 49 },
  { sprite: canopy, x: CANOPY_X, y: CANOPY_Y },
  { sprite: shaft, x: CANOPY_X + MID, y: CANOPY_Y + 12 },
  { sprite: wmElder, x: 19, y: 45 },
  { sprite: wmMoneyBag, x: 27, y: 47 },
  { sprite: wmParent, x: 37, y: 44 },
  { sprite: wmChild, x: 45, y: 48 },
]);

/** The scene row where the canopy's top edge is at scene column x, or past the bottom where there is no canopy. */
function canopyTop(x: number): number {
  const col = x - CANOPY_X;
  if (col < 0 || col >= CANOPY_W) return Infinity;
  const row = canopy.rows.findIndex((line) => line[col] !== '.');
  return row < 0 ? Infinity : CANOPY_Y + row;
}

/**
 * Rain over one box of the scene, in four frames: streaks three long every third column, falling
 * three rows a frame on a twelve-row cycle. Built from scene coordinates so neighbouring boxes
 * join without a seam, and kept above the canopy so the drops stop on the umbrella.
 */
const RAIN_CYCLE = 12;
function rain(id: string, x0: number, y0: number, w: number, h: number): PixelSprite {
  const frame = (f: number) =>
    Array.from({ length: h }, (_, j) =>
      Array.from({ length: w }, (_, i) => {
        const x = x0 + i;
        const y = y0 + j;
        if (x % 3 !== 0 || y >= canopyTop(x)) return '.';
        const offset = (x * 7) % RAIN_CYCLE;
        if ((((y - offset - 3 * f) % RAIN_CYCLE) + RAIN_CYCLE) % RAIN_CYCLE >= 3) return '.';
        return x % 4 === 1 ? 'x' : 'X';
      }).join(''),
    );
  return { id, name: id, tags: ['scene', 'wm5'], rows: frame(0), frames: [0, 1, 2, 3].map(frame), frameMs: 110 };
}

/** Forked lightning. 7x13. */
const BOLT = [
  '...yw..',
  '..yw...',
  '.yw....',
  'yw.....',
  'ywwwy..',
  '...yw..',
  '..yw...',
  '.yw....',
  'ywwy...',
  '..yw...',
  '.yw....',
  '.w.....',
  'y......',
];
const DARK = wmBands(7, [['.', 13]]);

/** Lightning: dark, a fork, dark, the fork again, a long dark. At rest the sky stays dark. */
const lightning: PixelSprite = {
  id: 'wm5-opener-lightning',
  name: 'wm5-opener-lightning',
  tags: ['scene', 'wm5'],
  rows: DARK,
  frames: [...Array.from({ length: 9 }, () => DARK), BOLT, DARK, BOLT, DARK, DARK],
  frameMs: 140,
};

/** A drop splashing on the canopy. */
const splash: PixelSprite = {
  id: 'wm5-opener-splash',
  name: 'wm5-opener-splash',
  tags: ['scene', 'wm5'],
  rows: ['.x.', 'x.x'],
};

/** A ring spreading on a puddle. */
const ripple: PixelSprite = {
  id: 'wm5-opener-ripple',
  name: 'wm5-opener-ripple',
  tags: ['scene', 'wm5'],
  rows: ['x.x'],
};

/** The manor's windows, lit. */
const manorGlow: PixelSprite = {
  id: 'wm5-opener-manor-glow',
  name: 'wm5-opener-manor-glow',
  tags: ['scene', 'wm5'],
  rows: ['..G...G..G...G..', '..g...g..g...g..'],
};

export const wm5Opener: SceneArt = {
  id: 'wm5-opener',
  label: 'A family shelters under one wide orchid umbrella in a night storm, the rain stopping at its canopy so their money bag stays dry at their feet, while the far manor\'s windows glow.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: manorGlow, x: 61, y: 40, motion: { kind: 'twinkle', periodMs: 3800, min: 0.4 } },
    { sprite: driftingCloud, x: 44, y: 9, motion: { kind: 'drift', amp: 2, periodMs: 10000 } },
    { sprite: lightning, x: 6, y: 3 },
    { sprite: rain('wm5-opener-rain-1', 0, 0, 18, 23), x: 0, y: 0 },
    { sprite: rain('wm5-opener-rain-2', 0, 23, 18, 22), x: 0, y: 23 },
    { sprite: rain('wm5-opener-rain-3', 18, 0, 19, 39), x: 18, y: 0 },
    { sprite: rain('wm5-opener-rain-4', 37, 0, 18, 39), x: 37, y: 0 },
    { sprite: rain('wm5-opener-rain-5', 55, 0, 25, 23), x: 55, y: 0 },
    { sprite: rain('wm5-opener-rain-6', 55, 23, 25, 22), x: 55, y: 23 },
    { sprite: rain('wm5-opener-rain-7', 0, 45, 18, 15), x: 0, y: 45 },
    { sprite: rain('wm5-opener-rain-8', 55, 45, 25, 15), x: 55, y: 45 },
    { sprite: splash, x: 23, y: 29, motion: { kind: 'twinkle', periodMs: 900, min: 0 } },
    { sprite: splash, x: 46, y: 29, motion: { kind: 'twinkle', periodMs: 1100, phase: 0.5, min: 0 } },
    { sprite: ripple, x: 6, y: 53, motion: { kind: 'twinkle', periodMs: 1300, min: 0 } },
    { sprite: ripple, x: 60, y: 56, motion: { kind: 'twinkle', periodMs: 1500, phase: 0.4, min: 0 } },
  ],
};

/** An umbrella: cover, insurance. */
const emblemUmbrella: PixelSprite = {
  id: 'wm5-emblem-umbrella',
  name: 'wm5-emblem-umbrella',
  tags: ['scene', 'wm5'],
  rows: [
    '......yG......',
    '....yyGGGg....',
    '..yyGGyGGGgg..',
    '.yGGGyGGGGGgg.',
    'yGGGyGGGGGgGgg',
    'yGGyGGGGGGgGgg',
    'g...g.Gg.g...O',
    '......Gg......',
    '......Gg......',
    '......Gg......',
    '......Gg......',
    '...y..Gg......',
    '...gGGg.......',
  ],
};

export const wm5Finish: SceneArt = wmKeepsake(
  'wm5-finish',
  emblemUmbrella,
  'A green crest with a gold rim bearing an umbrella, framed by laurel over a purple banner, with sparkles around it.',
);

export const art: LessonArtSet = { opener: wm5Opener, backdrop: wmBackdrop, finish: wm5Finish };
