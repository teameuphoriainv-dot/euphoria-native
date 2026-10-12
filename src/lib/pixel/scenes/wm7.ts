/**
 * Wealth Management lesson 7 (family wealth and multi-generational planning): its opener, the
 * pathway backdrop and its keepsake, as one set loaded on demand.
 *
 * The opener stages the lesson's own comparison, structured against unstructured transfer, as a
 * hall split down the middle by a marble pilaster. It is indoors so it no longer repeats lesson 1's
 * moonlit lawn, oak and family in a row. On the left, the bare stone side with no plan, three
 * lanterns hang from three separate nails, one per generation, each lit from the one before: at
 * every handoff oil leaks away, so the second flame is smaller and the third gutters out, which is
 * the lesson's 90% gone by the third generation. On the right, the panelled side with structure,
 * the same three lanterns hang from one brass rail fed by one sealed reservoir (the dynasty trust,
 * which owns the oil, so no death drains it), over the grandmother, the father and the child seated
 * together at a round council table with the family's book open on it (governance, and the heir at
 * the table). What moves: both sides hand on together, generation by generation, the left flames
 * shrinking while the right ones burn brighter; oil drips from the left lanterns at each handoff,
 * smoke rises from the dead one, and oil runs along the rail from the reservoir. The keepsake
 * carries the right side's answer: three lit lanterns on one rail.
 */
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';
import { wmBackdrop } from './wm-backdrop';
import { wmBands, wmChild, wmCompose, wmElder, wmParent, WM_INKS } from './wm-kit';
import { wmStripes, wmWainscot } from './wm-kit-a';
import { wmAshlar } from './wm-kit-b';
import { wmKeepsake } from './wm1-finish';

/** Where the lanterns hang, by their left edge: three on nails on the left, three on the rail on the right. */
const LEFT_X = [6, 17, 28];
const RIGHT_X = [47, 56, 65];
const LANTERN_Y = 17;
const PUDDLE_Y = 50;
const RAIL_Y = 13;
const RAIL_X = 45;
const RAIL_W = 30;

/** The hall's halves: stone to the left of the pilaster, panelling to its right. */
const WALL_TOP = 3;
const WALL_H = 44;
const PILASTER_X = 38;
const RIGHT_WALL_X = 42;

/** Bare dressed stone, unlit: the side with no plan. 38x44. */
const stoneWall: PixelSprite = {
  id: 'wm7-opener-stone-wall',
  name: 'wm7-opener-stone-wall',
  tags: ['scene', 'wm7'],
  rows: wmAshlar(PILASTER_X, WALL_H, 'k', 'K', 9, 5),
};

/** Gold-pinstriped paper over the kit's panelling: the side with structure. 38x44. */
const panelledWall: PixelSprite = {
  id: 'wm7-opener-panelled-wall',
  name: 'wm7-opener-panelled-wall',
  tags: ['scene', 'wm7'],
  palette: WM_INKS,
  rows: [...wmStripes(80 - RIGHT_WALL_X, WALL_H - 11, 'k', 'O', 6), ...wmWainscot(80 - RIGHT_WALL_X)],
};

/** The marble pilaster that parts the two halves, lit on its left face. 4x44. */
const pilaster: PixelSprite = {
  id: 'wm7-opener-pilaster',
  name: 'wm7-opener-pilaster',
  tags: ['scene', 'wm7'],
  rows: ['xwwX', 'DXXD', ...Array.from({ length: WALL_H - 4 }, () => 'wxXD'), 'xwwX', 'DXXD'],
};

/** Floorboards under a shadow line. 80x13. */
const floor = Array.from({ length: 13 }, (_, j) => {
  if (j === 0) return 'K'.repeat(80);
  return j % 4 === 1 ? 'U'.repeat(80) : 'O'.repeat(80);
});

/** A lantern on a ring, its glass dark until a glow layer lights it. 5x7. */
const lantern: PixelSprite = {
  id: 'wm7-opener-lantern',
  name: 'wm7-opener-lantern',
  tags: ['scene', 'wm7'],
  rows: ['..D..', '.DXD.', 'DkkkD', 'DkkkD', 'DkkkD', '.DXD.', '..D..'],
};

/** A nail in the stone and the cord down to a lantern's ring: one generation's own hook. 1x3. */
const nailAndCord: PixelSprite = {
  id: 'wm7-opener-nail',
  name: 'wm7-opener-nail',
  tags: ['scene', 'wm7'],
  rows: ['X', 'D', 'D'],
};

/** The brass rail all three right-hand lanterns hang from, which is also their oil line. 30x2. */
const rail: PixelSprite = {
  id: 'wm7-opener-rail',
  name: 'wm7-opener-rail',
  tags: ['scene', 'wm7'],
  rows: [`y${'G'.repeat(RAIL_W - 2)}g`, 'O'.repeat(RAIL_W)],
};

/** A brass feed from the rail down to a lantern's ring. 1x2. */
const feed: PixelSprite = {
  id: 'wm7-opener-feed',
  name: 'wm7-opener-feed',
  tags: ['scene', 'wm7'],
  rows: ['g', 'g'],
};

/** The sealed reservoir on the wall: a riveted brass tank with a capped top, its foot on the rail. 8x10. */
const reservoir: PixelSprite = {
  id: 'wm7-opener-reservoir',
  name: 'wm7-opener-reservoir',
  tags: ['scene', 'wm7'],
  rows: [
    '..yGGg..',
    '.OOOOOO.',
    'yGwGGGgg',
    'yGGGGGgg',
    'OgOggOgO',
    'yGGGGGgg',
    'yGGGGGgg',
    'OgOggOgO',
    'gGGGGggO',
    '.gOOOgO.',
  ],
};

/** The round council table seen from the front: a lit top, its edge, a pedestal on a foot. 30x14. */
const table: PixelSprite = {
  id: 'wm7-opener-table',
  name: 'wm7-opener-table',
  tags: ['scene', 'wm7'],
  palette: WM_INKS,
  rows: [
    '....CCCCCCCCCCCCCCCCCCCCCC....',
    '.CCCCCCCCCCCCCCCCCCCCCCCCCCCC.',
    'UUUUUUUUUUUUUUUUUUUUUUUUUUUUUU',
    '.OOOOOOOOOOOOOOOOOOOOOOOOOOOO.',
    '...KKKKKKKKKKKKKKKKKKKKKKKK...',
    '.............UOK..............',
    '.............UOK..............',
    '.............UOK..............',
    '.............UOK..............',
    '.............UOK..............',
    '.............UOK..............',
    '............UUOKK.............',
    '..........UUOOOOKKK...........',
    '.........UO........OK.........',
  ],
};

/** The family's book, open on the table: its constitution. 7x2. */
const book: PixelSprite = {
  id: 'wm7-opener-book',
  name: 'wm7-opener-book',
  tags: ['scene', 'wm7'],
  rows: ['.wwXww.', 'pwwXwwp'],
};

/** Oil spilled on the boards under a left-hand lantern, a gold glint in the dark pool. */
const puddle = (w: number): PixelSprite => ({
  id: `wm7-opener-puddle-${String(w)}`,
  name: `wm7-opener-puddle-${String(w)}`,
  tags: ['scene', 'wm7'],
  rows: [`.${'K'.repeat(w - 2)}.`, `K${'K'.repeat(Math.floor((w - 3) / 2))}g${'K'.repeat(Math.ceil((w - 3) / 2))}K`],
});

/** An orchid rug under the council table. 34x3. */
const rug: PixelSprite = {
  id: 'wm7-opener-rug',
  name: 'wm7-opener-rug',
  tags: ['scene', 'wm7'],
  rows: [
    `g${'G'.repeat(32)}g`,
    `g${Array.from({ length: 32 }, (_, x) => (x % 6 === 2 ? 'p' : 'E')).join('')}g`,
    `O${'g'.repeat(32)}O`,
  ],
};

const base = wmCompose('wm7-opener-base', [...wmBands(80, [['K', 2], ['D', 1], ['k', WALL_H]]), ...floor], [
  { sprite: stoneWall, x: 0, y: WALL_TOP },
  { sprite: panelledWall, x: RIGHT_WALL_X, y: WALL_TOP },
  { sprite: pilaster, x: PILASTER_X, y: WALL_TOP },
  ...LEFT_X.map((x) => ({ sprite: nailAndCord, x: x + 2, y: LANTERN_Y - 3 })),
  ...LEFT_X.map((x) => ({ sprite: lantern, x, y: LANTERN_Y })),
  { sprite: puddle(4), x: LEFT_X[1] + 1, y: PUDDLE_Y },
  { sprite: puddle(6), x: LEFT_X[2], y: PUDDLE_Y },
  { sprite: rail, x: RAIL_X, y: RAIL_Y },
  { sprite: reservoir, x: 72, y: WALL_TOP },
  ...RIGHT_X.map((x) => ({ sprite: feed, x: x + 2, y: RAIL_Y + 2 })),
  ...RIGHT_X.map((x) => ({ sprite: lantern, x, y: LANTERN_Y })),
  { sprite: rug, x: 43, y: 55 },
  { sprite: wmElder, x: 46, y: 33 },
  { sprite: wmParent, x: 55, y: 32 },
  { sprite: wmChild, x: 65, y: 36 },
  { sprite: table, x: 44, y: 41 },
  { sprite: book, x: 56, y: 40 },
]);

/* ── the handoffs: both sides hand on together, a generation a beat ───────────────────────────── */

/** A lantern's glass at each strength, 3x3: out, guttering, small, lit, brighter, brightest. */
const FLAME: Record<string, readonly string[]> = {
  out: ['...', '...', '...'],
  gutter: ['...', '...', '.g.'],
  small: ['...', '.y.', '.g.'],
  lit: ['yGg', 'GyG', 'gGg'],
  brighter: ['yyG', 'yWy', 'GyG'],
  brightest: ['yWy', 'WWW', 'yWy'],
};

/** Three lanterns' glass in one strip, their left edges at `xs`, each at its strength. */
function glassRow(xs: readonly number[], strengths: readonly string[]): string[] {
  const width = xs[2] - xs[0] + 3;
  return [0, 1, 2].map((j) =>
    Array.from({ length: width }, (_, i) => {
      const k = xs.findIndex((x) => i >= x - xs[0] && i < x - xs[0] + 3);
      return k >= 0 ? FLAME[strengths[k]][j][i - (xs[k] - xs[0])] : '.';
    }).join(''),
  );
}

/**
 * The beats, shared by every handoff layer: the first generation lit, the second, the third, the
 * left one guttering out, a held end, a dark beat before it begins again. Each layer below has
 * one frame per beat at BEAT_MS, so all of them hand on together.
 */
const BEAT_MS = 750;
const LEFT_BEATS = [
  ['lit', 'out', 'out'],
  ['lit', 'out', 'out'],
  ['lit', 'small', 'out'],
  ['lit', 'small', 'out'],
  ['lit', 'small', 'gutter'],
  ['lit', 'small', 'out'],
  ['lit', 'small', 'out'],
  ['out', 'out', 'out'],
];
const RIGHT_BEATS = [
  ['lit', 'out', 'out'],
  ['lit', 'out', 'out'],
  ['lit', 'brighter', 'out'],
  ['lit', 'brighter', 'out'],
  ['lit', 'brighter', 'brightest'],
  ['brighter', 'brighter', 'brightest'],
  ['brighter', 'brighter', 'brightest'],
  ['out', 'out', 'out'],
];

/** The left lanterns: each later flame smaller, the third guttering out. The still is the end. */
const leftGlow: PixelSprite = {
  id: 'wm7-opener-left-glow',
  name: 'wm7-opener-left-glow',
  tags: ['scene', 'wm7'],
  blurb: 'Three lanterns on separate nails, each lit from the last and smaller, the third going out.',
  rows: glassRow(LEFT_X, ['lit', 'small', 'out']),
  frames: LEFT_BEATS.map((s) => glassRow(LEFT_X, s)),
  frameMs: BEAT_MS,
};

/** The right lanterns: each later flame brighter, all three burning at the end. The still is the end. */
const rightGlow: PixelSprite = {
  id: 'wm7-opener-right-glow',
  name: 'wm7-opener-right-glow',
  tags: ['scene', 'wm7'],
  blurb: 'Three lanterns on one fed rail, each lit from the last and brighter.',
  rows: glassRow(RIGHT_X, ['brighter', 'brighter', 'brightest']),
  frames: RIGHT_BEATS.map((s) => glassRow(RIGHT_X, s)),
  frameMs: BEAT_MS,
};

/**
 * Oil leaking from the left lanterns at each handoff: a drop falls from the second as it is lit and
 * splashes in its puddle, then from the third. Three frames a beat over the same eight beats, so
 * the drops land on the handoffs. 27x28.
 */
const DRIP_W = LEFT_X[2] - LEFT_X[0] + 5;
const DRIP_TOP = LANTERN_Y + 7;
const DRIP_H = PUDDLE_Y + 2 - DRIP_TOP;
function dripAt(k: number | null, y: number | 'splash' = 0): string[] {
  const grid = Array.from({ length: DRIP_H }, () => Array.from({ length: DRIP_W }, () => '.'));
  if (k !== null) {
    const x = LEFT_X[k] - LEFT_X[0] + 2;
    if (y === 'splash') {
      [grid[DRIP_H - 3][x - 1], grid[DRIP_H - 3][x + 1], grid[DRIP_H - 2][x]] = ['g', 'g', 'y'];
    } else {
      grid[y][x] = 'G';
      grid[y + 1][x] = 'g';
    }
  }
  return grid.map((row) => row.join(''));
}
const NO_DRIP = dripAt(null);
const fall = (k: number) => [dripAt(k, 0), dripAt(k, 9), dripAt(k, 18), dripAt(k, 'splash')];
const drips: PixelSprite = {
  id: 'wm7-opener-drips',
  name: 'wm7-opener-drips',
  tags: ['scene', 'wm7'],
  blurb: 'Oil dripping away from the unplanned lanterns at each handoff.',
  rows: NO_DRIP,
  frames: [...Array.from({ length: 6 }, () => NO_DRIP), ...fall(1), NO_DRIP, NO_DRIP, ...fall(2), ...Array.from({ length: 8 }, () => NO_DRIP)],
  frameMs: BEAT_MS / 3,
};

/** Oil running along the rail from the reservoir to the lanterns: a bright dash, right to left. 26x1. */
const PULSE_W = 26;
const pulseAt = (x: number) => [Array.from({ length: PULSE_W }, (_, i) => (i === x ? 'W' : i === x + 1 ? 'y' : '.')).join('')];
const oilPulse: PixelSprite = {
  id: 'wm7-opener-oil-pulse',
  name: 'wm7-opener-oil-pulse',
  tags: ['scene', 'wm7'],
  rows: pulseAt(12),
  frames: [24, 21, 18, 15, 12, 9, 6, 3, 0].map(pulseAt),
  frameMs: 170,
};

/** A wisp of smoke from the lantern that went out. */
const smoke: PixelSprite = {
  id: 'wm7-opener-smoke',
  name: 'wm7-opener-smoke',
  tags: ['scene', 'wm7'],
  rows: ['.X.', 'X..', '.x.', '..X'],
};

export const wm7Opener: SceneArt = {
  id: 'wm7-opener',
  label: 'A hall split in two: on the bare left three lanterns hang from separate nails and dim from one generation to the next until the last goes out, while on the right three lanterns on one brass rail, fed by a sealed reservoir, burn brighter over the grandmother, father and child seated at a council table.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: leftGlow, x: LEFT_X[0] + 1, y: LANTERN_Y + 2 },
    { sprite: rightGlow, x: RIGHT_X[0] + 1, y: LANTERN_Y + 2 },
    { sprite: drips, x: LEFT_X[0], y: LANTERN_Y + 7 },
    { sprite: oilPulse, x: RAIL_X + 1, y: RAIL_Y },
    { sprite: smoke, x: LEFT_X[2] + 3, y: LANTERN_Y - 5, motion: { kind: 'rise', amp: 5, periodMs: 2600 } },
  ],
};

/** Three lanterns lit on one rail: the generations kept burning by one structure. */
const emblemLanterns: PixelSprite = {
  id: 'wm7-emblem-lanterns',
  name: 'wm7-emblem-lanterns',
  tags: ['scene', 'wm7'],
  rows: [
    'yGGGGGGGGGGGGg',
    'gggggggggggggO',
    '.gO...gO...gO.',
    '.gO...gO...gO.',
    'yGGg.yGGg.yGGg',
    'gOOO.gOOO.gOOO',
    'GWyg.GWyg.GWyg',
    'GyWg.GyWg.GyWg',
    'GyGg.GyGg.GyGg',
    'gOOO.gOOO.gOOO',
    'yGGg.yGGg.yGGg',
    '.gO...gO...gO.',
  ],
};

export const wm7Finish: SceneArt = wmKeepsake(
  'wm7-finish',
  emblemLanterns,
  'A green crest with a gold rim bearing three lit lanterns hanging from one rail, framed by laurel over a purple banner, with sparkles around it.',
);

export const art: LessonArtSet = { opener: wm7Opener, backdrop: wmBackdrop, finish: wm7Finish };
