/**
 * Investing Fundamentals lesson 14, Growth vs Value Investing: two kinds of tree, and a pendulum
 * between them.
 *
 * On the left an old gnarled tree, broad and low, its trunk twisted with age and only a few big coins
 * in its crown: value, cheap and steady. On the right a skinny young tree shooting up past the
 * measuring pole planted beside it, all new leaves and no fruit yet: growth, priced for what it might
 * become. From the old tree's long branch hangs a swing, and the investor swings on it toward the
 * young tree and back, the lesson's pendulum: neither style leads for long. The swing swings
 * (frames), the young tree's tip sparkles, seed fluff rises round it, coins glint and stars twinkle.
 *
 * The keepsake's emblem is the same pair: a thin young tree beside a broad old one.
 */
import type { PixelSprite } from '../types';
import {
  IF_PALETTE,
  ifCompose,
  ifFirefly,
  ifGlint,
  ifKeepsake,
  ifLater,
  ifSeedMote,
  ifSparkle,
  ifStage,
  ifStar,
  ifStarBig,
} from './if-kit';
import { ifBackdrop } from './if-backdrop';
import { IF_SEATED_SEAT, ifInvestorSeated } from './if-kit-b';
import type { LessonArtSet, SceneArt } from './types';

/* ── the two trees ─────────────────────────────────────────────────────────────────────────────── */

/**
 * The old tree, 36x38: a broad flat crown with two big coins, a long bare branch reaching right to
 * (35, 12) for the swing, and a thick trunk that twists on its way down to spreading roots.
 */
const oldTree: PixelSprite = {
  id: 'if14-old-tree',
  name: 'if14-old-tree',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [
    '.....nNNNn.....nNNn.................',
    '...nNNmmNNn..nNNmmNn................',
    '..nNmmmNNNNnnNmmNNNNn...............',
    '.nNmmNNNNNNNNNNNNNNNNnn.............',
    'nNmNNNOONNNNNNNNNOONNNNn............',
    'nNNNNOyGONNNNNNNOyGONNNnn...........',
    'nNNNNOGgOnNNNNnnOGgOnNNnnn..........',
    '.nNNNnOOnnnnNnnnnOOnnnnnnV..........',
    '.VnnnnnnnnnnnnnnnnnnnnnnVV..........',
    '..VVnnnVVVnnnnVVVnnnnVVVV...........',
    '...VVVV.VVVVhhAVVVVVVVV.............',
    '.........VVahhAAaVVV................',
    '...........ahAAAAhhhhhhhhhhhhhhhhhnN',
    '...........ahAAAAAAAAAAAAAAAAAaaaamN',
    '...........ahAAAaaaaaaaaaaaaaa....Nn',
    '..........ahAAAAa...................',
    '..........ahhAAAa...................',
    '...........ahAAAa...................',
    '...........ahAdAa...................',
    '...........ahAAAa...................',
    '...........ahAAAa...................',
    '..........ahhAAaa...................',
    '..........ahAAAAa...................',
    '..........aAhAAAa...................',
    '..........aAhhAAa...................',
    '..........aAAhAAa...................',
    '..........aAAhAda...................',
    '..........aAAhAAa...................',
    '..........aAAAhAa...................',
    '..........aAAAhAa...................',
    '..........ahAAhAa...................',
    '..........ahAAAhAa..................',
    '.........ahAAAAhAa..................',
    '.........ahAAdAAhAa.................',
    '........ahhAAAAAAhAa................',
    '.......ahhAAaAAAAAhAaa..............',
    '......ahhAa..aAAAa..hAaa............',
    '.....ahAa....aAAa.....hAa...........',
  ],
};

/** The young tree, 9x39: a tall narrow crown of new leaves on a thin trunk, no coins yet. */
const youngTree: PixelSprite = {
  id: 'if14-young-tree',
  name: 'if14-young-tree',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [
    '....m....',
    '...mNn...',
    '...mNn...',
    '..mmNNn..',
    '..mNNNn..',
    '..mNNNn..',
    '.mmNNNnn.',
    '.mNNNNNn.',
    '.mNNNNnn.',
    '.mmNNNNn.',
    '.mNNNNnn.',
    'mmNNNNNnn',
    'mNNNNNNnn',
    'mNNNNNnnn',
    'mmNNNNNnV',
    '.mNNNNnnV',
    '.mNNNnnnV',
    '.NNNNnnVV',
    '..NNnnnV.',
    '..NnnnVV.',
    '...nnVV..',
    '....hA...',
    '....hA...',
    '....hA...',
    '....hA...',
    '....hA...',
    '....hA...',
    '....hA...',
    '....hA...',
    '....hA...',
    '....hA...',
    '....hA...',
    '....hA...',
    '....hA...',
    '....hA...',
    '....hA...',
    '....hA...',
    '...hhAa..',
    '..hAhAAa.',
  ],
};

/** A measuring pole, 3x33, notched every four rows: the young tree is already taller than it. */
const pole: PixelSprite = {
  id: 'if14-pole',
  name: 'if14-pole',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [...Array.from({ length: 32 }, (_, y) => (y % 4 === 0 ? 'whA' : '.hA')), 'ahA'],
};

/* ── the swing ─────────────────────────────────────────────────────────────────────────────────── */

/** The layer's top-left in the scene: its ropes hang from the old tree's branch at x 21 and 33. */
const SWING = { x: 18, y: 22 } as const;
const ROPES = [3, 15] as const;
/** The seat's row in the layer; the seated investor's own seat row lands on it. */
const SEAT = 22;
const SWING_W = 18;
const SWING_H = 25;

/**
 * One frame of the swing with its seat pushed `dx` pixels sideways: the ropes lean from their fixed
 * tops down to the seat, the plank spans them, and the investor sits on it holding the front rope.
 */
function swingFrame(dx: number): string[] {
  const cells = Array.from({ length: SWING_H }, () => new Array<string>(SWING_W).fill('.'));
  const put = (x: number, y: number, ch: string) => {
    const line = cells[y];
    if (line && x >= 0 && x < SWING_W && ch !== '.') line[x] = ch;
  };
  for (const top of ROPES) for (let y = 0; y <= SEAT; y += 1) put(top + Math.round((dx * y) / SEAT), y, 'x');
  for (let x = ROPES[0] + dx; x <= ROPES[1] + dx; x += 1) put(x, SEAT, x === ROPES[1] + dx ? 'a' : 'h');
  ifInvestorSeated.rows.forEach((row, j) => {
    [...row].forEach((ch, i) => put(2 + dx + i, SEAT - IF_SEATED_SEAT.y + j, ch));
  });
  return cells.map((line) => line.join(''));
}

const SWAY = [0, 1, 2, 2, 1, 0, -1, -2, -2, -1] as const;
const swing: PixelSprite = {
  id: 'if14-swing',
  name: 'if14-swing',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: swingFrame(0),
  frames: SWAY.map(swingFrame),
  frameMs: 170,
};

/* ── the opener ────────────────────────────────────────────────────────────────────────────────── */

const OLD = { x: 0, y: 8 } as const;
const YOUNG = { x: 52, y: 7 } as const;
const POLE = { x: 63, y: 13 } as const;

const base = ifCompose('if14-opener-base', 80, 60, [
  { sprite: ifStage, x: 0, y: 0 },
  { sprite: oldTree, x: OLD.x, y: OLD.y },
  { sprite: pole, x: POLE.x, y: POLE.y },
  { sprite: youngTree, x: YOUNG.x, y: YOUNG.y },
]);

export const if14Opener: SceneArt = {
  id: 'if14-opener',
  label: 'An investor swings back and forth on a swing hung from an old gnarled tree with a few big coins, toward a skinny young tree shooting up past a measuring pole.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: swing, x: SWING.x, y: SWING.y },
    { sprite: ifSparkle, x: YOUNG.x + 1, y: YOUNG.y - 3 },
    { sprite: ifSeedMote, x: YOUNG.x - 2, y: YOUNG.y + 22, motion: { kind: 'rise', amp: 6, periodMs: 3200, phase: 0.1 } },
    { sprite: ifSeedMote, x: YOUNG.x + 9, y: YOUNG.y + 15, motion: { kind: 'rise', amp: 5, periodMs: 3800, phase: 0.55 } },
    { sprite: ifGlint, x: OLD.x + 5, y: OLD.y + 4 },
    { sprite: ifLater(ifGlint, 'if14-glint-right', 3, 310), x: OLD.x + 16, y: OLD.y + 4 },
    { sprite: ifStarBig, x: 40, y: 4, motion: { kind: 'twinkle', periodMs: 2300, min: 0.3 } },
    { sprite: ifStar, x: 72, y: 6, motion: { kind: 'twinkle', periodMs: 1800, phase: 0.4, min: 0.2 } },
    { sprite: ifStar, x: 46, y: 15, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.7, min: 0.2 } },
    { sprite: ifFirefly, x: 44, y: 50, motion: { kind: 'rise', amp: 5, periodMs: 3500, phase: 0.2 } },
    { sprite: ifFirefly, x: 75, y: 47, motion: { kind: 'rise', amp: 6, periodMs: 4100, phase: 0.65 } },
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────────── */

const emblemTwoTrees: PixelSprite = {
  id: 'if-emblem-two-trees',
  name: 'if-emblem-two-trees',
  tags: ['scene', 'if'],
  blurb: "Lesson 14: a thin young tree beside a broad old one. Growth and value.",
  palette: IF_PALETTE,
  rows: [
    '.m........',
    'mNn..nNNn.',
    '.N..nNNNNn',
    'mNn.NNnNnn',
    '.N..nNNnnV',
    '.A...naAn.',
    '.A....hA..',
    'hAa..hhAaa',
  ],
};

export const if14Finish: SceneArt = ifKeepsake(
  'if14-finish',
  'A golden acorn hanging from an oak twig, with a thin young tree beside a broad old one in its purple window and small sparkles around it.',
  emblemTwoTrees,
);

export const art: LessonArtSet = { opener: if14Opener, backdrop: ifBackdrop, finish: if14Finish };
