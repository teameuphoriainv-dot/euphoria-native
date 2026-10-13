/**
 * Corporate Finance lesson 19, ESG & Sustainable Finance: money that pays for a cleaner company.
 *
 * Opener: the view from head office has changed. A tall gold-framed window fills the wall, and
 * outside, under a blue morning sky, three wind turbines turn on green hills where the stacks used
 * to be. The CFO presents them; across the room a young tree in a walnut pot hangs with gold coins under
 * the lit invest sign: investing green can pay. The bright window is the picture's light. Only
 * small layers move: the three rotors, two birds, the invest sign lighting, a leaf rising off the
 * tree, the sun.
 *
 * Keepsake: a wind turbine on a green hill.
 */
import type { PixelSprite } from '../types';
import { cfBackdrop } from './cf-backdrop';
import { cfKeepsake } from './cf1-finish';
import { CF_PALETTE, cfCompose, cfHall, cfPlaque, cfSconce, cfShadowShort, cfSignInvest } from './cf-kit';
import { cfCfoReach } from './cf-kit-a';
import { cfSignInvestDim } from './cf-kit-c';
import type { LessonArtSet, SceneArt } from './types';

/** The window's outer frame, in scene pixels; the view sits two pixels inside it. */
const WIN = { x: 19, y: 5, w: 42, h: 26 } as const;
const VIEW = { x: WIN.x + 2, y: WIN.y + 2, w: WIN.w - 4, h: WIN.h - 4 } as const;
/** The mullion's two columns, in the view's pixels. */
const MULLION = Math.floor(VIEW.w / 2) - 1;

/** The three turbines, in the view's pixels: hub, blade length, and where the hill takes the tower. */
const TURBINES = [
  { x: 9, y: 7, blade: 6 },
  { x: 25, y: 10, blade: 4 },
  { x: 33, y: 13, blade: 2 },
] as const;

const SUN = { x: 33, y: 3 } as const;
const farTop = (x: number) => Math.round(13 + 1.5 * Math.sin(x / 4));
const nearTop = (x: number) => Math.round(17 + 2 * Math.sin((x + 6) / 6.5));

/**
 * The world outside: sky deepening to the top, the sun, a far teal ridge, the near green hills and
 * the turbine towers standing on them. Computed, not drawn: hills are curves, and a tower must meet
 * its hill wherever the curve puts the ground.
 */
const view: PixelSprite = {
  id: 'cf19-view',
  name: 'cf19-view',
  tags: ['scene', 'cf19'],
  blurb: 'Wind turbine towers on green hills under a blue sky.',
  rows: Array.from({ length: VIEW.h }, (_, y) =>
    Array.from({ length: VIEW.w }, (_, x) => {
      if (x === MULLION || x === MULLION + 1) return '.';
      const near = nearTop(x);
      if (y >= near) return y === near ? 'm' : y >= VIEW.h - 3 ? 'n' : 'N';
      if (TURBINES.some((t) => t.x === x && y > t.y)) return 'w';
      if (y >= farTop(x)) return 't';
      if (Math.hypot(x - SUN.x, y - SUN.y) < 3) return 'G';
      return y < 4 ? 'b' : 'B';
    }).join(''),
  ),
};

/** The gold frame: a deep outline, lit inner edge top and left, shadow bottom and right, a mullion. */
const frame: PixelSprite = {
  id: 'cf19-frame',
  name: 'cf19-frame',
  tags: ['scene', 'cf19'],
  blurb: 'A tall gold window frame with a mullion.',
  palette: CF_PALETTE,
  rows: Array.from({ length: WIN.h }, (_, j) =>
    Array.from({ length: WIN.w }, (_, i) => {
      if (i === 0 || j === 0 || i === WIN.w - 1 || j === WIN.h - 1) return 'O';
      if (j === WIN.h - 2 || i === WIN.w - 2) return 'a';
      if (j === 1 || i === 1) return 'g';
      if (i - 2 === MULLION) return 'g';
      if (i - 2 === MULLION + 1) return 'a';
      return '.';
    }).join(''),
  ),
};

/** A cloud passing in front of the sun. */
const CLOUD: readonly string[] = ['..www....', '.wwwwww..', 'wwwwwwwww', '.xxxxxxx.'];
const cloud: PixelSprite = { id: 'cf19-cloud', name: 'cf19-cloud', tags: ['scene', 'cf19'], rows: [...CLOUD] };

/** A walnut pot with a gold rim. */
const pot: PixelSprite = {
  id: 'cf19-pot',
  name: 'cf19-pot',
  tags: ['scene', 'cf19'],
  blurb: 'A walnut plant pot with a gold rim.',
  palette: CF_PALETTE,
  rows: [
    'OyGGGGGGGGgO',
    'OOOOOOOOOOOO',
    '.AAAAAAAAAa.',
    '.AAAAAAAAAa.',
    '.aaaaaaaaaa.',
    '.AAAAAAAAAa.',
    '..AAAAAAAa..',
    '..aaaaaaaa..',
  ],
};

/** A young tree, lit from the upper left, with gold coins hanging in its leaves. */
const tree: PixelSprite = {
  id: 'cf19-tree',
  name: 'cf19-tree',
  tags: ['scene', 'cf19'],
  blurb: 'A young leafy tree hung with gold coins.',
  palette: CF_PALETTE,
  rows: [
    '.....mmNN.....',
    '...mmNNNNNn...',
    '..mNNNyNNNNn..',
    '.mNNNNGNNNNnn.',
    '.NNNNNNNNyNnn.',
    'mNNyNNNNNGNNnn',
    'NNNGNNNNNNNnnn',
    'NNNNNNNnNNnnnn',
    '.NNNnNNnnNnnn.',
    '..nnnnAannnn..',
    '......Aa......',
    '......Aa......',
    '......Aa......',
    '......Aa......',
  ],
};

const base = cfCompose('cf19-opener-base', cfHall, [
  [view, VIEW.x, VIEW.y],
  [cloud, VIEW.x + 27, VIEW.y + 4],
  [frame, WIN.x, WIN.y],
  [cfPlaque, 65, 6],
  [cfSignInvestDim, 67, 8],
  [cfSconce, 8, 18],
  [tree, 64, 28],
  [pot, 65, 42],
  [cfShadowShort, 6, 56],
  [cfCfoReach, 2, 30],
], 'The still hall: the tall window onto the wind farm, the invest plaque, a lamp, the coin tree, the CFO.');

/**
 * A rotor of three blades `blade` long round its hub, a third of a turn in four steps. Computed,
 * not drawn: three blades at angles that are not multiples of 45 degrees are where a hand-typed
 * blade comes out bent.
 */
function rotor(id: string, blade: number, frameMs: number): PixelSprite {
  const size = 2 * blade + 1;
  const at = (turn: number) =>
    Array.from({ length: size }, (_, j) =>
      Array.from({ length: size }, (_, i) => {
        const dx = i - blade;
        const dy = j - blade;
        if (dx === 0 && dy === 0) return 'x';
        const on = [0, 1, 2].some((k) => {
          const a = turn + (k * 2 * Math.PI) / 3;
          const along = dx * Math.cos(a) + dy * Math.sin(a);
          return along > 0.4 && along < blade + 0.5 && Math.abs(dy * Math.cos(a) - dx * Math.sin(a)) < 0.55;
        });
        return on ? 'w' : '.';
      }).join(''),
    );
  const turns = [0, 1, 2, 3].map((k) => -Math.PI / 2 + (k * Math.PI) / 6);
  return { id, name: id, tags: ['scene', 'cf19'], blurb: 'A wind turbine rotor turning.', rows: at(-Math.PI / 2), frames: turns.map(at), frameMs };
}

const rotors = TURBINES.map((t, i) => ({
  sprite: rotor(`cf19-opener-rotor-${String(i)}`, t.blade, [260, 300, 340][i] ?? 300),
  x: VIEW.x + t.x - t.blade,
  y: VIEW.y + t.y - t.blade,
}));

const birds: PixelSprite = { id: 'cf19-opener-birds', name: 'cf19-opener-birds', tags: ['scene', 'cf19'], rows: ['D.D.D.D', '.D...D.'] };
const sunCore: PixelSprite = { id: 'cf19-opener-sun', name: 'cf19-opener-sun', tags: ['scene', 'cf19'], rows: ['.y.', 'yyy'] };
const leaf: PixelSprite = { id: 'cf19-opener-leaf', name: 'cf19-opener-leaf', tags: ['scene', 'cf19'], rows: ['mN', 'Nn'] };

export const cf19Opener: SceneArt = {
  id: 'cf19-opener',
  label: 'Through a tall window in the head office, wind turbines turn on green hills under a blue sky, while the finance chief presents them from the left and a young tree hung with gold coins stands at the right under the lit invest sign.',
  width: 80,
  height: 60,
  base,
  layers: [
    ...rotors,
    { sprite: birds, x: VIEW.x + 21, y: VIEW.y + 1, motion: { kind: 'drift', amp: 1, periodMs: 5200 } },
    { sprite: cfSignInvest, x: 67, y: 8, motion: { kind: 'twinkle', periodMs: 3000, min: 0.35 } },
    { sprite: leaf, x: 66, y: 31, motion: { kind: 'rise', amp: 6, periodMs: 3400, phase: 0.3 } },
    { sprite: sunCore, x: VIEW.x + SUN.x - 1, y: VIEW.y + SUN.y - 1, motion: { kind: 'twinkle', periodMs: 2400, min: 0.2 } },
  ],
};

/** Lesson 19's emblem: a white wind turbine with a gold hub on a green hill. */
const emblemTurbine: PixelSprite = {
  id: 'cf19-emblem-turbine',
  name: 'cf19-emblem-turbine',
  tags: [],
  blurb: 'A white wind turbine with a gold hub on a green hill.',
  rows: [
    '.......ww.......',
    '.......wx.......',
    '.......wx.......',
    '.......wx.......',
    '.......wx.......',
    '......OyGO......',
    '....wwOGgOww....',
    '..wwx..xX..xww..',
    'wwx....xX....xww',
    '.......xX.......',
    '.......xX.......',
    '.......xX.......',
    '....mmmxXmmm....',
    '..mmNNNNNNNNNm..',
    '.mNNNNNNNNNNNNn.',
    'NNNnnnnnnnnnnnnn',
  ],
};

export const cf19Finish = cfKeepsake(
  'cf19-finish',
  'A crystal award on a gold stand with a white wind turbine on a green hill inside, and small sparkles around it.',
  emblemTurbine,
);

export const art: LessonArtSet = { opener: cf19Opener, backdrop: cfBackdrop, finish: cf19Finish };
