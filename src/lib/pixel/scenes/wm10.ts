/**
 * Wealth Management lesson 10 (the capstone): its opener, the capstone backdrop and its keepsake,
 * as one set loaded on demand.
 *
 * The opener is the house of five pillars on the night the whole plan comes together: the full
 * temple from the kit (wm-kit.ts) with every frieze mark and the tympanum oak lit at once,
 * fireworks over the pediment, a lamp either side of the forecourt, and the family with their
 * advisor at the foot of the steps, the child waving a sparkler. The lesson's point is integration:
 * earn, save, invest, protect and transfer working as one system. Lesson 1 lit the marks one by
 * one; here they breathe together, and a gold spark runs the length of the architrave beneath them
 * as the thread that joins them. What moves: the marks' glow, the spark, three fireworks out of
 * step, the pennant, both lamps, the sparkler, fireflies, stars.
 *
 * The backdrop is the pathway's estate with every window of the manor lit, as the plan allows the
 * two capstones. The keepsake carries a crown set with five jewels, one for each pillar.
 */
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt, SceneLayer } from './types';
import { wmBackdrop } from './wm-backdrop';
import {
  wmAdvisor,
  wmBands,
  wmCompose,
  wmElder,
  wmFirefly,
  wmFlag,
  wmLampFlame,
  wmLampPost,
  wmLater,
  wmMarkEarn,
  wmMarkInvest,
  wmMarkOak,
  wmMarkProtect,
  wmMarkSave,
  wmMarkTransfer,
  wmParent,
  wmStar,
  wmStarDot,
  wmTemple,
  wmTwinkle,
} from './wm-kit';
import { wmTreeline } from './wm-kit-a';
import { wmSkyDots } from './wm-kit-b';
import { wmKeepsake } from './wm1-finish';

/** The temple's top-left in the scene. Every temple position below is offset from it. */
const TX = 10;
const TY = 6;

/** Where the child stands; the sparkler's spark is placed from it. */
const CHILD_X = 39;
const CHILD_Y = 47;

const skyDots = wmSkyDots('wm10-opener-sky-dots', 80, 30, [
  [14, 2, 'D'],
  [31, 2, 'X'],
  [49, 1, 'D'],
  [61, 17, 'X'],
  [78, 21, 'D'],
  [6, 24, 'X'],
  [70, 26, 'X'],
  [29, 14, 'D'],
]);

const trees = wmTreeline('wm10-opener-trees', 80, 12, [
  [40, 40, 3],
  [5, 9, 10],
  [75, 8, 11],
]);

const flagPole: PixelSprite = {
  id: 'wm10-opener-flag-pole',
  name: 'wm10-opener-flag-pole',
  tags: ['scene', 'wm10'],
  rows: ['D', 'x', 'x', 'x', 'x', 'x'],
};

/**
 * The forecourt: gravel spreading from the foot of the steps to the bottom of the frame, the
 * steps' cast shadow (z) along its top row. 80x11.
 */
const forecourt: PixelSprite = {
  id: 'wm10-opener-forecourt',
  name: 'wm10-opener-forecourt',
  tags: ['scene', 'wm10'],
  rows: Array.from({ length: 11 }, (_, j) =>
    Array.from({ length: 80 }, (_, x) => {
      if (x < 9 - j || x > 69 + j) return '.';
      return j === 0 && x >= TX && x <= TX + 58 ? 'z' : 'k';
    }).join(''),
  ),
};

/** The heir in teal holding a sparkler up on a wire stick. The spark itself is a layer. 7x11. */
const childSparkler: PixelSprite = {
  id: 'wm10-opener-child-sparkler',
  name: 'wm10-opener-child-sparkler',
  tags: ['scene', 'wm10'],
  rows: [
    '......X',
    '.....X.',
    '.ggg.C.',
    'gCCCgC.',
    'CkCkUT.',
    '.CCUT..',
    'tTTTt..',
    'CTTt...',
    '.TTt...',
    '.k.k...',
    'KK.KK..',
  ],
};

const base = wmCompose('wm10-opener-base', wmBands(80, [['K', 42], ['h', 18]]), [
  { sprite: skyDots, x: 0, y: 0 },
  { sprite: trees, x: 0, y: 30 },
  { sprite: forecourt, x: 0, y: 49 },
  { sprite: flagPole, x: TX + 29, y: TY - 6 },
  { sprite: wmTemple, x: TX, y: TY },
  { sprite: wmLampPost, x: 1, y: 25 },
  { sprite: wmLampPost, x: 74, y: 25 },
  { sprite: wmElder, x: 24, y: 46 },
  { sprite: wmParent, x: 31, y: 45 },
  { sprite: childSparkler, x: CHILD_X, y: CHILD_Y },
  { sprite: wmAdvisor, x: 48, y: 45 },
]);

/** A mark lit from inside: every gold step goes one brighter. */
function litFrom(sprite: PixelSprite): PixelSprite {
  const up: Record<string, string> = { O: 'g', g: 'G', G: 'y', y: 'w' };
  return { ...sprite, rows: sprite.rows.map((row) => [...row].map((ch) => up[ch] ?? ch).join('')) };
}

/**
 * Every mark lit at once, the tympanum oak and the five frieze marks, as one sprite laid from the
 * frieze's left edge and the oak's top. The base leaves the panels bare: the marks live only in
 * this layer, so they breathe between full and half light without a still copy under them, and a
 * reader with Reduce Motion sees them fully lit. Built from the kit's marks, so a redrawn mark
 * keeps its glow.
 */
const allLit = wmCompose('wm10-opener-all-lit', wmBands(49, [['.', 12]]), [
  { sprite: litFrom(wmMarkOak), x: 21, y: 0 },
  ...[wmMarkEarn, wmMarkSave, wmMarkInvest, wmMarkProtect, wmMarkTransfer].map((mark, i) => ({
    sprite: litFrom(mark),
    x: 1 + 10 * i,
    y: 7,
  })),
]);

/** A gold spark running the white architrave under the frieze, left to right, then a rest. 49x1. */
const SPARK_STOPS = Array.from({ length: 12 }, (_, i) => 1 + 4 * i);
const sparkAt = (x: number) => [`${'.'.repeat(x)}yG${'.'.repeat(47 - x)}`];
const unlitArchitrave = ['.'.repeat(49)];
const architraveSpark: PixelSprite = {
  id: 'wm10-opener-architrave-spark',
  name: 'wm10-opener-architrave-spark',
  tags: ['scene', 'wm10'],
  blurb: 'A gold spark running under all five marks: the thread that joins the pillars into one plan.',
  rows: unlitArchitrave,
  frames: [...SPARK_STOPS.map(sparkAt), ...Array.from({ length: 8 }, () => unlitArchitrave)],
  frameMs: 100,
};

/** A burst of eight rays: tips in the light ink (L), the rays in the mid ink (M); Z is the dark ink. 11x11. */
const BLOOM = [
  '.....L.....',
  '.L...M...L.',
  '..M..M..M..',
  '...M...M...',
  '...........',
  'LMM.....MML',
  '...........',
  '...M...M...',
  '..M..M..M..',
  '.L...M...L.',
  '.....L.....',
];

/**
 * A firework: a spark climbs, pops, blooms, droops and fades, then a rest. The still is the pop,
 * so a reader with Reduce Motion still sees a burst, at a fraction of the bloom's rects. 11x11.
 */
function firework(id: string, light: string, mid: string, dark: string, frameMs: number): PixelSprite {
  const ink = (rows: readonly string[]) =>
    rows.map((row) => row.replace(/L/g, light).replace(/M/g, mid).replace(/Z/g, dark));
  const empty = wmBands(11, [['.', 11]]);
  const spark = (y: number) => empty.map((row, j) => {
    if (j === y) return `.....${light}.....`;
    if (j === y + 1) return `.....${dark}.....`;
    return row;
  });
  const pop = [
    '...........',
    '...........',
    '...........',
    '.....L.....',
    '....M.M....',
    '...L.W.L...',
    '....M.M....',
    '.....L.....',
    '...........',
    '...........',
    '...........',
  ];
  const droop = [
    '...........',
    '.....M.....',
    '.M.......M.',
    '...........',
    '...........',
    '...........',
    'M.........M',
    '...........',
    '...........',
    '...........',
    '.M.......M.',
  ];
  const fade = [
    '...........',
    '...........',
    '.....Z.....',
    '.Z.......Z.',
    '...........',
    '...........',
    '...........',
    'Z.........Z',
    '...........',
    '...........',
    '...........',
  ];
  return {
    id,
    name: id,
    tags: ['scene', 'wm10'],
    rows: ink(pop),
    frames: [spark(9), spark(6), spark(4), ink(pop), ink(BLOOM), ink(droop), ink(fade), empty, empty, empty],
    frameMs,
  };
}

const fireworkGold = firework('wm10-opener-firework-gold', 'y', 'G', 'g', 240);
const fireworkOrchid = wmLater(firework('wm10-opener-firework-orchid', 'Q', 'q', 'P', 270), 'wm10-opener-firework-orchid', 4, 270);
const fireworkGreen = wmLater(firework('wm10-opener-firework-green', 'm', 'N', 'n', 300), 'wm10-opener-firework-green', 7, 300);

/** The sparkler's spark: the kit's twinkle, quickened. */
const sparkle = wmLater(wmTwinkle, 'wm10-opener-sparkle', 1, 210);
const lampFlameLater = wmLater(wmLampFlame, 'wm10-opener-lamp-flame-later', 2, 300);

export const wm10Opener: SceneArt = {
  id: 'wm10-opener',
  label: 'Fireworks burst over the marble house of five pillars, every mark on its frieze glowing at once, as a grandmother, a father, a child with a sparkler and their advisor gather at the foot of the steps.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: allLit, x: TX + 5, y: TY + 3, motion: { kind: 'twinkle', periodMs: 2600, min: 0.5 } },
    { sprite: architraveSpark, x: TX + 5, y: TY + 15 },
    { sprite: fireworkGold, x: 1, y: 6 },
    { sprite: fireworkOrchid, x: 67, y: 4 },
    { sprite: fireworkGreen, x: 17, y: 0 },
    { sprite: wmFlag, x: TX + 30, y: TY - 6 },
    { sprite: wmLampFlame, x: 2, y: 28 },
    { sprite: lampFlameLater, x: 75, y: 28 },
    { sprite: sparkle, x: CHILD_X + 4, y: CHILD_Y - 3 },
    { sprite: wmFirefly, x: 9, y: 39, motion: { kind: 'rise', amp: 5, periodMs: 3000, phase: 0.2 } },
    { sprite: wmFirefly, x: 68, y: 37, motion: { kind: 'rise', amp: 6, periodMs: 3400, phase: 0.65 } },
    { sprite: wmStar, x: 33, y: 7, motion: { kind: 'twinkle', periodMs: 2300, min: 0.3 } },
    { sprite: wmStarDot, x: 57, y: 2, motion: { kind: 'twinkle', periodMs: 1900, phase: 0.4, min: 0.2 } },
  ],
};

/** A manor window lit for the celebration, over a dark pane of the backdrop's manor. 2x3. */
const manorWindow: PixelSprite = {
  id: 'wm10-backdrop-window',
  name: 'wm10-backdrop-window',
  tags: [],
  rows: ['OO', 'OO', 'OO'],
};

/** The panes the pathway backdrop leaves dark: both wings, the upper floor, beside the portico. */
const NEWLY_LIT: readonly (readonly [number, number])[] = [
  [72, 23],
  [82, 23],
  [61, 28],
  [93, 28],
  [61, 33],
  [65, 33],
  [93, 33],
  [97, 33],
  [71, 32],
  [87, 32],
];

const windowLayers: SceneLayer[] = NEWLY_LIT.map(([x, y], i) => ({
  sprite: manorWindow,
  x,
  y,
  motion: { kind: 'twinkle', periodMs: 5200 + 350 * i, min: 0.45, phase: (i * 0.37) % 1 },
}));

/** The pathway backdrop with every window of the manor lit: the house is home tonight. */
export const wm10Backdrop: SceneArt = {
  ...wmBackdrop,
  id: 'wm10-backdrop',
  label: 'A dark country estate at night with every window of the manor lit: an old oak with a swing, the manor house, and an iron fence with lanterns at an open gate.',
  layers: [...windowLayers, ...wmBackdrop.layers],
};

/** A crown of three points set with five jewels, one for each pillar of the plan. */
const emblemCrown: PixelSprite = {
  id: 'wm10-emblem-crown',
  name: 'wm10-emblem-crown',
  tags: ['scene', 'wm10'],
  rows: [
    '......yw......',
    'yw....yG....yg',
    'yG....GG....Gg',
    'yGG...GG...GGg',
    'yGGG.yGGg.GGGg',
    'yGGGGGGGGGGGGg',
    'yGGGGGGGGGGGGg',
    'gOOOOOOOOOOOOO',
    'yGwGrGwwGrGwGg',
    'yGGGGGGGGGGGGg',
    'OOOOOOOOOOOOOO',
  ],
};

export const wm10Finish: SceneArt = wmKeepsake(
  'wm10-finish',
  emblemCrown,
  'A green crest with a gold rim bearing a crown set with five jewels, framed by laurel over a purple banner, with sparkles around it.',
);

export const art: LessonArtSet = { opener: wm10Opener, backdrop: wm10Backdrop, finish: wm10Finish };
