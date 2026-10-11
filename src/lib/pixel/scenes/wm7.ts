/**
 * Wealth Management lesson 7 (family wealth and multi-generational planning): its opener, the
 * pathway backdrop and its keepsake, as one set loaded on demand.
 *
 * The opener is the family oak from the kit, whole this time, under a full moon. A long branch
 * reaches out over the three generations, and from it hang three lanterns, one over each of them.
 * The lesson's dynasty plan is the motion: the grandmother's lantern lights, then the father's,
 * then the child's, and all three burn together before the night resets, the way a family's
 * wealth, governance and values are handed down and kept lit. Leaves drift, fireflies rise,
 * stars twinkle. The keepsake carries the kit's oak.
 */
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';
import { wmBackdrop } from './wm-backdrop';
import {
  wmBands,
  wmChild,
  wmCompose,
  wmElder,
  wmEmblemOak,
  wmFirefly,
  wmLeaf,
  wmOak,
  wmParent,
  wmStar,
  wmStarDot,
  WM_INKS,
} from './wm-kit';
import { wmTreeline } from './wm-kit-a';
import { wmKeepsake } from './wm1-finish';

/** Where the three lanterns hang, by their left edge; each sits over one generation. */
const LANTERN_X = [39, 51, 61];
const LANTERN_Y = 26;

/** Fixed faint stars. */
const skyDots: PixelSprite = {
  id: 'wm7-opener-sky-dots',
  name: 'wm7-opener-sky-dots',
  tags: ['scene', 'wm7'],
  rows: [
    '................................................................................',
    '...D..................................X...........................D.............',
    '.......................D........................................................',
    '...........................................................................X....',
    '..................................D.............................................',
    '................................................................................',
    '...........................................X.............................D......',
    '................................................................................',
    '..........................................................................X.....',
    '....................................D...........................................',
    '................................................................................',
    '...............................................................................D',
  ],
};

/** A full moon, larger than lesson 1's and lower. 12x12. */
const moon: PixelSprite = {
  id: 'wm7-opener-moon',
  name: 'wm7-opener-moon',
  tags: ['scene', 'wm7'],
  rows: [
    '....xwwx....',
    '..xwwwwwwx..',
    '.xwwwXwwwwx.',
    '.wwwwwwwwXw.',
    'xwwXwwwwwwwx',
    'wwwwwwwXwwwx',
    'wwwwwwwwwwxX',
    'xwwwwXwwwwxX',
    '.wwwwwwwwxX.',
    '.xwwwwwwxXX.',
    '..xxwwwxXX..',
    '....xxXX....',
  ],
};

const woods = wmTreeline('wm7-opener-woods', 80, 10, [
  [40, 60, 3],
  [36, 6, 7],
  [48, 5, 5],
  [60, 7, 8],
  [72, 5, 6],
  [79, 4, 5],
]);

/** The oak's long branch, reaching right over the family, leaves along its top. It dips at the end. 46x8. */
const branch: PixelSprite = {
  id: 'wm7-opener-branch',
  name: 'wm7-opener-branch',
  tags: ['scene', 'wm7'],
  palette: WM_INKS,
  rows: [
    '......hhh...............hhh...................',
    '....hhHnHhh..........hhHHnHh..........hhh.....',
    '..hhHHnnHHHh.......hhHHnnHHHh......hhHnHHhh...',
    '.hHHHHHHHHHHh.....hHHHHHHHHHHh...hhHHnnHHHHh..',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXhHHHHHHHHHHHHh.',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDXXXXXXXXXXXXXXX.',
    '..............................DDDDDDDDDDDDDDk.',
    '..............................................',
  ],
};

/** A lantern on a hook, its glass dark until the glow layer lights it. 5x7. */
const lantern: PixelSprite = {
  id: 'wm7-opener-lantern',
  name: 'wm7-opener-lantern',
  tags: ['scene', 'wm7'],
  rows: [
    '..D..',
    '.DXD.',
    'DkkkD',
    'DkkkD',
    'DkkkD',
    '.DXD.',
    '..D..',
  ],
};

/** A cord from the branch's underside to a lantern's hook. */
const cord = (length: number): PixelSprite => ({
  id: `wm7-opener-cord-${String(length)}`,
  name: `wm7-opener-cord-${String(length)}`,
  tags: ['scene', 'wm7'],
  rows: Array.from({ length }, () => 'D'),
});

/** Grass catching the moonlight. */
const tufts: PixelSprite = {
  id: 'wm7-opener-tufts',
  name: 'wm7-opener-tufts',
  tags: ['scene', 'wm7'],
  palette: WM_INKS,
  rows: [
    '..........................................................H.....................',
    '....H.................n.............................................H...........',
    '...H.n..........H...............H...........................n..........H.n......',
    '..........................................................................H.....',
    '......................................H.........................................',
    '.........n.H.......................................................H............',
  ],
};

const base = wmCompose('wm7-opener-base', wmBands(80, [['K', 40], ['h', 20]]), [
  { sprite: skyDots, x: 0, y: 0 },
  { sprite: moon, x: 52, y: 3 },
  { sprite: woods, x: 0, y: 31 },
  { sprite: tufts, x: 0, y: 46 },
  { sprite: branch, x: 26, y: 17 },
  { sprite: wmOak, x: 4, y: 8 },
  { sprite: cord(3), x: LANTERN_X[0] + 2, y: 23 },
  { sprite: cord(3), x: LANTERN_X[1] + 2, y: 23 },
  { sprite: cord(2), x: LANTERN_X[2] + 2, y: 24 },
  ...LANTERN_X.map((x) => ({ sprite: lantern, x, y: LANTERN_Y })),
  { sprite: wmElder, x: 38, y: 44 },
  { sprite: wmParent, x: 50, y: 43 },
  { sprite: wmChild, x: 61, y: 47 },
]);

/** A lantern's glass, lit. */
const LIT = ['yGg', 'GyG', 'gGg'];
const GLOW_W = LANTERN_X[2] - LANTERN_X[0] + 3;

/** The three lanterns' glass, lit as `lit` says, in one strip. */
function glow(lit: readonly boolean[]): string[] {
  return LIT.map((row) =>
    Array.from({ length: GLOW_W }, (_, i) => {
      const k = LANTERN_X.findIndex((x) => i >= x - LANTERN_X[0] && i < x - LANTERN_X[0] + 3);
      return k >= 0 && lit[k] ? row[i - (LANTERN_X[k] - LANTERN_X[0])] : '.';
    }).join(''),
  );
}

/** The lanterns lighting one generation after another, all three together, then a dark beat. */
const lanternGlow: PixelSprite = {
  id: 'wm7-opener-lantern-glow',
  name: 'wm7-opener-lantern-glow',
  tags: ['scene', 'wm7'],
  blurb: 'Three lanterns lighting in turn, grandmother, father, child, then all together.',
  rows: glow([true, true, true]),
  frames: [
    glow([true, false, false]),
    glow([true, true, false]),
    glow([true, true, true]),
    glow([true, true, true]),
    glow([true, true, true]),
    glow([false, false, false]),
  ],
  frameMs: 800,
};

export const wm7Opener: SceneArt = {
  id: 'wm7-opener',
  label: 'Three generations stand under the old oak at night as lanterns on its long branch light one after another, from the grandmother to the father to the child.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: lanternGlow, x: LANTERN_X[0] + 1, y: LANTERN_Y + 2 },
    { sprite: wmLeaf, x: 33, y: 33, motion: { kind: 'drift', amp: 2, periodMs: 2800 } },
    { sprite: wmLeaf, x: 59, y: 37, motion: { kind: 'drift', amp: 2, periodMs: 3300, phase: 0.5 } },
    { sprite: wmFirefly, x: 21, y: 47, motion: { kind: 'rise', amp: 5, periodMs: 3100, phase: 0.2 } },
    { sprite: wmFirefly, x: 72, y: 45, motion: { kind: 'rise', amp: 6, periodMs: 3500, phase: 0.65 } },
    { sprite: wmStar, x: 14, y: 3, motion: { kind: 'twinkle', periodMs: 2500, min: 0.3 } },
    { sprite: wmStarDot, x: 41, y: 8, motion: { kind: 'twinkle', periodMs: 1900, phase: 0.4, min: 0.2 } },
  ],
};

export const wm7Finish: SceneArt = wmKeepsake(
  'wm7-finish',
  wmEmblemOak,
  'A green crest with a gold rim bearing an oak tree, framed by laurel over a purple banner, with sparkles around it.',
);

export const art: LessonArtSet = { opener: wm7Opener, backdrop: wmBackdrop, finish: wm7Finish };
