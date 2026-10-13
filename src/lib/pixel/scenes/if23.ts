/**
 * Investing Fundamentals lesson 23, The Power of Long-Term Investing: time in the market, not timing it.
 *
 * A stormy night. A giant oak hung with gold acorns, planted long ago and never moved, fills the
 * right of the picture: a storm cloud has rolled in over its far side, rain is falling there, and the
 * wind has torn a ragged bite out of that edge, bare branches showing and leaves tumbling to the
 * ground, but the oak stands whole (bad years, absorbed by a long hold). Under its canopy the investor
 * sits on a stump with a steaming mug, in no hurry, while an owl blinks in a hollow of the trunk. Out
 * in the open beside them, the orchard's gardener is timing it: they keep digging the same tiny
 * sprouts up with a spade to move them, so their bed is pocked with holes and nothing in it grows.
 * The spade digs and lifts, the rain falls and the leaves tumble (frames), the owl blinks, steam
 * rises, stars twinkle and fireflies drift up.
 *
 * The keepsake's emblem is a tiny acorn beside a tall oak: the start, and what the years make of it.
 */
import type { PixelSprite } from '../types';
import {
  IF_PALETTE,
  ifCompose,
  ifFirefly,
  ifKeepsake,
  ifSprout,
  ifStage,
  ifStar,
  ifStarBig,
} from './if-kit';
import { ifBackdrop } from './if-backdrop';
import { IF_GARDENER_HAND, ifBedOf, ifGardener } from './if-kit-a';
import { IF_SEATED_HAND, IF_SEATED_SEAT, ifInvestorSeated } from './if-kit-b';
import type { LessonArtSet, SceneArt } from './types';

/* ── the oak ───────────────────────────────────────────────────────────────────────────────────── */

/**
 * The oak's crown, 46x23: a bumpy mass of leaf clusters lit from the upper left, a lit rim on the
 * front clusters, darkening toward its underside. On the right, the storm side, a ragged bite is torn
 * out of the edge, a few clumps left, and the bare branches that held those leaves show through.
 * Generated (one light gradient over lumps) and kept as rows.
 */
const crown: PixelSprite = {
  id: 'if23-crown',
  name: 'if23-crown',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [
    '...............mmmmmmmmm...mmmmmmmmm..........',
    '..............mmmmmmmmmmm.mmNNNNNNNNN.........',
    '.............mmmmmmmmmmmNmmNNNNNNNNNNN........',
    '............mmmmmmmmmNNNmmNNNNNNNNNNNNN.......',
    '...........mmmmmmmmNNNNmmNNNNNNNNNNNNNNN..aA..',
    '...........mmmmmNNNNNNNmNNNNNNNNNNNNNNNN.A....',
    '.......mmm.mmmNNNNNNNNNmNNNNNNNNNNNNNNNmm....a',
    '.....mmmmmmNNNNNNNNNNNmmNNNNNNNNNNNNNmmm..NmA.',
    '...mmmmmmNNNNNNNNNNNNNNNNNNNNNNNNNNmmmNN..nA..',
    '..mmmmmNNNNNNNNNNNNNNNNmmmmmmmmmNNmmNNNN.Aaa..',
    '..mmNNNNNNmmmmmmmmmNNNmmNNNNNNNNNNmNNnnAA.....',
    '..NNNNNNNmmNNNNNNNNNNmmNNNNNNNNNNNmnnnnnn.....',
    '.VNNNNNNmmNNNNNNNNNNmmNNNNNNNNNNnNNnnnnn...nn.',
    '..NNNNNmmNNNNNNNNNNmmNNNNNNNNNnnnnnnnnnn...n..',
    '..LNNNNmNNNNNNNNNNNmNNNNNNNNnnnnnnNnnnnAAaA.A.',
    '..VLLNNmNNNNNNNNNNNmNNNNNnnnnnnnnnNnnnnnnnnAa.',
    '...VVLLmNNNNNNNNNNmmNNNnnnnnnnnnnnnnnnnnn.n..A',
    '.....VVNNNNNNNNNNNNNnnnnnnnnnnnnnnnnnnnn......',
    '.......LNNNNNNNNNNnNnnnnnnnnnnnnnnnnnnnn......',
    '.......VLNNNNNNnnnnNLnnnnnnnnnnnnnLnnnnnnnLV..',
    '........VLNNNnnnnnnLVLnnnnnnnnnnnLVLLnnnLLV...',
    '.........VLLLLLLLLLV.VLLLLLLLLLLLV.VVLLLVV....',
    '..........VVVVVVVVV...VVVVVVVVVVV....VVV......',
  ],
};

/**
 * The trunk, 24x22: two great limbs going up into the crown, a bole ten pixels wide lit on its left,
 * a hollow for the owl, and roots flaring out over the ground.
 */
const trunk: PixelSprite = {
  id: 'if23-trunk',
  name: 'if23-trunk',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [
    '......hA......hAa.......',
    '.......hA....hAa........',
    '........hA..hAAa........',
    '........hAAhAAAa........',
    '.......hAAAAAAAAa.......',
    '.......hAAaAAAAAa.......',
    '.......hAKKKKKKAa.......',
    '.......hAKKKKKKAa.......',
    '.......hAKKKKKKAa.......',
    '.......hAKKKKKKAa.......',
    '.......hAKKKKKKAa.......',
    '.......hAKKKKKKAa.......',
    '.......hAAAAAAaAa.......',
    '.......hAaAAAAAAa.......',
    '......hhAAAAAaAAaa......',
    '......hAAAaAAAAAAa......',
    '.....hhAAAAAAAaAAaa.....',
    '....hhAAAAAAAAAAAAaa....',
    '...hhAAaAAAAAAAaAAAaa...',
    '..hhAAa.hAAAAAAa.aAAaa..',
    '.hAAa...hAAAAAAa...aAAa.',
    'hAa.....hhAAAAaa.....aAa',
  ],
};

/** Where the hollow is in the trunk: the owl sits in it. */
const HOLLOW = { x: 9, y: 7 } as const;

/** A gold acorn, 3x4, hanging from the crown. */
const goldAcorn: PixelSprite = {
  id: 'if23-gold-acorn',
  name: 'if23-gold-acorn',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [
    '.a.',
    'hAa',
    'yGg',
    '.g.',
  ],
};

/** Where the acorns hang, in crown pixels: on the lit leaves, clear of the storm side. */
const ACORNS = [
  [10, 9], [20, 4], [29, 10], [17, 15], [26, 17],
] as const;

/* ── the owl ───────────────────────────────────────────────────────────────────────────────────── */

const OWL_OPEN = [
  '.h..A.',
  'hhhAAA',
  'hyKyKA',
  'hhGgAa',
  '.hAAa.',
];
const OWL_SHUT = [
  '.h..A.',
  'hhhAAA',
  'haaaaA',
  'hhGgAa',
  '.hAAa.',
];

/** The owl in the hollow, 6x5: ear tufts, two gold eyes, and a slow blink. */
const owl: PixelSprite = {
  id: 'if23-owl',
  name: 'if23-owl',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: OWL_OPEN,
  frames: [OWL_OPEN, OWL_OPEN, OWL_OPEN, OWL_OPEN, OWL_OPEN, OWL_SHUT],
  frameMs: 320,
};

/* ── the storm ─────────────────────────────────────────────────────────────────────────────────── */

/** The storm cloud, 32x7, rolled in over the oak's far side: dark grey, its tops lit by the moon. */
const cloud: PixelSprite = {
  id: 'if23-cloud',
  name: 'if23-cloud',
  tags: ['scene', 'if'],
  rows: [
    '..........xxxx......xxxx........',
    '.......xxxXXXXxx..xxXXXXxx......',
    '....xxxXXXXXXXXXxxXXXXXXXXxxx...',
    '..xxXXXXXXXXXXXXXXXXXXXXXXXXXx..',
    '.xXXXXXXXXXXXXXXXXXXXXXXXXXXXXx.',
    'xXXDDDDDDDDDDDDDDDDDDDDDDDDDDDXx',
    '.DDDDDDDDDDDDDDDDDDDDDDDDDDDDDD.',
  ],
}

/** Rain, 18x34: short falling streaks, the pattern moving down two rows a frame and repeating every eight. */
const RAIN_STREAKS = [
  [1, 0], [6, 5], [11, 2], [16, 6],
] as const;
const RAIN_W = 18;
const RAIN_H = 34;
const rainFrame = (shift: number) => {
  const cells = Array.from({ length: RAIN_H }, () => new Array<string>(RAIN_W).fill('.'));
  for (let y0 = -8; y0 < RAIN_H + 8; y0 += 8) {
    for (const [x, dy] of RAIN_STREAKS) {
      for (let k = 0; k < 3; k += 1) {
        const line = cells[y0 + dy + shift + k];
        if (line) line[x] = 'B';
      }
    }
  }
  return cells.map((line) => line.join(''));
};
const RAIN_FRAMES = [rainFrame(0), rainFrame(2), rainFrame(4), rainFrame(6)];
const rain: PixelSprite = {
  id: 'if23-rain',
  name: 'if23-rain',
  tags: ['scene', 'if'],
  rows: RAIN_FRAMES[0] ?? [],
  frames: RAIN_FRAMES,
  frameMs: 130,
};

/**
 * Two leaves torn off the storm side, tumbling down through the rain to the ground, one after the
 * other: 9x34, a step every 180ms, the second leaf half a trip behind the first.
 */
const LEAF = ['mN', 'Nn'];
const LEAF_PATH = [
  [3, 0], [5, 3], [4, 6], [6, 9], [5, 12], [7, 15], [6, 18], [7, 21], [6, 24], [7, 27], [6, 30], [-9, -9],
] as const;
const LEAF_W = 9;
const LEAF_H = 34;
const LEAF_FRAMES = LEAF_PATH.map((_, i) => {
  const cells = Array.from({ length: LEAF_H }, () => new Array<string>(LEAF_W).fill('.'));
  for (const step of [LEAF_PATH[i], LEAF_PATH[(i + 6) % LEAF_PATH.length]]) {
    if (!step) continue;
    const [x, y] = step;
    LEAF.forEach((row, j) => {
      const line = cells[y + j];
      if (!line) return;
      [...row].forEach((ch, k) => {
        if (x + k >= 0 && x + k < LEAF_W) line[x + k] = ch;
      });
    });
  }
  return cells.map((line) => line.join(''));
});
const leaves: PixelSprite = {
  id: 'if23-leaves',
  name: 'if23-leaves',
  tags: ['scene', 'if'],
  rows: LEAF_FRAMES[2] ?? [],
  frames: LEAF_FRAMES,
  frameMs: 180,
};

/* ── the investor, sheltered ───────────────────────────────────────────────────────────────────── */

/** A low stump to sit on, 7x3. */
const seat: PixelSprite = {
  id: 'if23-seat',
  name: 'if23-seat',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [
    'hhhhhhA',
    'hAaAAAa',
    'aAAAaAa',
  ],
};

/** A red mug of cocoa, 3x3, held by its lower left. */
const mug: PixelSprite = {
  id: 'if23-mug',
  name: 'if23-mug',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [
    'sAR',
    'RRr',
    'rrr',
  ],
};

const steam: PixelSprite = {
  id: 'if23-steam',
  name: 'if23-steam',
  tags: ['scene', 'if'],
  rows: [
    'x.',
    '.x',
  ],
};

/* ── the timer's bed ───────────────────────────────────────────────────────────────────────────── */

/** A hole dug and left open, 5x2: soil thrown up round a dark pit. */
const hole: PixelSprite = {
  id: 'if23-hole',
  name: 'if23-hole',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [
    'c...c',
    'cdddc',
  ],
};

const SPADE_IN = [
  '.............',
  '............h',
  '...........hA',
  '..........hA.',
  '..........hA.',
  '.........hA..',
  '.........hA..',
  '..mn.....hA..',
  '.mNNn...hA...',
  '..n.....hA...',
  '..n...xwX....',
  '..n...xxX....',
  '..e...cXc....',
  '.............',
];
const SPADE_UP = [
  '.............',
  '...........hA',
  '..mn.....hAA.',
  '.mNNn..hAA...',
  '..n..hAA.....',
  '.cecAA.......',
  '..xwX........',
  '..xxX........',
  '...X.........',
  '.............',
  '.............',
  '.............',
  '.............',
  '.............',
];

/**
 * The gardener's spade, 13x14, its handle in their fist: pushed into the bed beside a sprout, then
 * swung up about the fist with the sprout and a clod of soil on the blade, to be set down somewhere
 * else. It never stays in the ground long enough to grow.
 */
const spade: PixelSprite = {
  id: 'if23-spade',
  name: 'if23-spade',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: SPADE_IN,
  frames: [SPADE_IN, SPADE_IN, SPADE_IN, SPADE_UP, SPADE_UP, SPADE_UP],
  frameMs: 330,
};
/** Where the fist closes on the handle, in the spade's box: the handle passes it in both frames. */
const SPADE_GRIP = { x: 11, y: 2 } as const;

/* ── the opener ────────────────────────────────────────────────────────────────────────────────── */

const CROWN = { x: 34, y: 1 } as const;
const TRUNK = { x: 44, y: 24 } as const;
/** The investor sits on the stump in the oak's lee, under the canopy's left edge. */
const INVESTOR = { x: 29, y: 25 } as const;
const SEAT = { x: INVESTOR.x + IF_SEATED_SEAT.x, y: INVESTOR.y + IF_SEATED_SEAT.y } as const;
/** The mug in the fist (the hand is at the seated investor's (12, 11)). */
const MUG = { x: INVESTOR.x + IF_SEATED_HAND.x + 1, y: INVESTOR.y + IF_SEATED_HAND.y - 2 } as const;
/** The gardener faces left, over their bed, the spade's grip in their fist. */
const GARDENER = { x: 11, y: 25 } as const;
const SPADE = {
  x: GARDENER.x + IF_GARDENER_HAND.x - SPADE_GRIP.x,
  y: GARDENER.y + IF_GARDENER_HAND.y - SPADE_GRIP.y,
} as const;
const BED = { x: -3, y: 46 } as const;

const base = ifCompose('if23-opener-base', 80, 60, [
  { sprite: ifStage, x: 0, y: 0 },
  // The trunk before the crown, so the leaves close over the tops of the limbs.
  { sprite: trunk, x: TRUNK.x, y: TRUNK.y },
  { sprite: crown, x: CROWN.x, y: CROWN.y },
  ...ACORNS.map(([x, y]) => ({ sprite: goldAcorn, x: CROWN.x + x, y: CROWN.y + y })),
  { sprite: cloud, x: 48, y: 0 },
  { sprite: seat, x: SEAT.x, y: SEAT.y },
  { sprite: ifInvestorSeated, x: INVESTOR.x, y: INVESTOR.y },
  { sprite: mug, x: MUG.x, y: MUG.y },
  { sprite: ifBedOf('if23-bed', 22), x: BED.x, y: BED.y },
  { sprite: ifSprout, x: BED.x + 14, y: BED.y - 4 },
  { sprite: hole, x: BED.x + 3, y: BED.y - 1 },
  { sprite: hole, x: BED.x + 8, y: BED.y - 1 },
  { sprite: ifGardener, x: GARDENER.x, y: GARDENER.y },
]);

export const if23Opener: SceneArt = {
  id: 'if23-opener',
  label: 'On a stormy night a giant oak hung with gold acorns stands whole as the storm strips a few leaves from one side, an investor sits calmly under it with a steaming mug while an owl blinks in its trunk, and beside them a gardener keeps digging a tiny sprout back up out of a bed pocked with holes.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: owl, x: TRUNK.x + HOLLOW.x, y: TRUNK.y + HOLLOW.y },
    { sprite: rain, x: 62, y: 7 },
    { sprite: leaves, x: 70, y: 9 },
    { sprite: spade, x: SPADE.x, y: SPADE.y },
    { sprite: steam, x: MUG.x + 1, y: MUG.y - 3, motion: { kind: 'rise', amp: 4, periodMs: 2200 } },
    { sprite: ifStarBig, x: 26, y: 5, motion: { kind: 'twinkle', periodMs: 2300, min: 0.3 } },
    { sprite: ifStar, x: 36, y: 2, motion: { kind: 'twinkle', periodMs: 1800, phase: 0.4, min: 0.2 } },
    { sprite: ifStar, x: 22, y: 14, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.7, min: 0.2 } },
    { sprite: ifFirefly, x: 25, y: 52, motion: { kind: 'rise', amp: 5, periodMs: 3500, phase: 0.1 } },
    { sprite: ifFirefly, x: 40, y: 50, motion: { kind: 'rise', amp: 6, periodMs: 4100, phase: 0.45 } },
    { sprite: ifFirefly, x: 8, y: 55, motion: { kind: 'rise', amp: 5, periodMs: 3800, phase: 0.7 } },
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────────── */

const emblemAcornOak: PixelSprite = {
  id: 'if-emblem-acorn-oak',
  name: 'if-emblem-acorn-oak',
  tags: ['scene', 'if'],
  blurb: "Lesson 23: a tiny acorn beside a tall oak. What the years make of a small start that stays put.",
  palette: IF_PALETTE,
  rows: [
    '....mmNNN.',
    '...mNNNNNn',
    '..mNNNNNnn',
    '...NNnnnn.',
    '......hA..',
    '.ahA..hA..',
    '.yGg..hA..',
    '.GGg.hhAAa',
  ],
};

export const if23Finish: SceneArt = ifKeepsake(
  'if23-finish',
  'A golden acorn hanging from an oak twig, with a tiny gold acorn beside a tall green oak in its purple window and small sparkles around it.',
  emblemAcornOak,
);

export const art: LessonArtSet = { opener: if23Opener, backdrop: ifBackdrop, finish: if23Finish };
