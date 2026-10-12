/**
 * Investing Fundamentals lesson 23, The Power of Long-Term Investing: time is what makes a giant.
 *
 * One oak fills the night sky: a crown sixty pixels wide hung with gold acorns, a trunk so broad an owl
 * lives in a hollow in it, roots spread over the ground like a hand. At its foot, small enough to show
 * the scale, the investor holds up a single gold acorn, which is all this tree once was. Nothing here
 * is clever timing; it is twenty years of staying put. The owl blinks (frames), acorns glint, stars
 * twinkle and fireflies drift up through the branches' shadow.
 *
 * The keepsake's emblem is an oak leaf.
 */
import type { PixelSprite } from '../types';
import {
  IF_INVESTOR_HAND,
  IF_PALETTE,
  ifCompose,
  ifFirefly,
  ifGlint,
  ifInvestor,
  ifKeepsake,
  ifLater,
  ifStage,
  ifStar,
  ifStarBig,
} from './if-kit';
import { ifBackdrop } from './if-backdrop';
import type { LessonArtSet, SceneArt } from './types';

/* ── the oak ───────────────────────────────────────────────────────────────────────────────────── */

/**
 * The oak's crown, 62x30: overlapping lumps of leaves, each lit on its upper left, the whole mass
 * darkening toward its underside. Generated as lit blobs (the batch tool blob2.mjs) and kept as rows.
 */
const crown: PixelSprite = {
  id: 'if23-crown',
  name: 'if23-crown',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [
    '..................mmmmmm...mmmmmmNN...mmmmmm..................',
    '................mmmmmmmNNNmmmmmNNNNNmmmmmmmNNN................',
    '...............mmmmmmNNNNNmmmNNNNNNNmmmmmNNNNNN...............',
    '..............mmmmmmNNNNNNmmNNNNNNNNmmmmNNNNNNNN..............',
    '..............mmmmNNNNNNNNNNNNNNNNnnmmNNNNNNNNNn..............',
    '.............mmmNNNNNNNNNNNNNNNNnnnnNNNNNNNNNNnnn.............',
    '.............mNNNNNNNNNNnnmmNNNnnnNNNNNNNNNNnnnnmm............',
    '............mNNNNNNNNNnnnmmNNNNNNNNNNNNNNNnnnnnmNNNN..........',
    '..........mmmmmNNNNNnnnnnNNNNNNNNNNNNNNNnnnnnnNNNNNNNN........',
    '........mmmmmmNNNNnnnnnnnNNNNNNNNNNNNNnnnnnnnNNNNNNNNNN.......',
    '.......mmmmmNNNNNnnnnnnnNNNNNNNNNNNnnnnnnnnnNNNNNNNNNNn.......',
    '.......mmmNNNNNNNNnnnnnNNNNNNNNNNnnnnnnnnnnNNNNNNNNNnnnn......',
    '......mmNNNNNNNNNNNNnnNNNNNNNNNnnnnnnnnnnNNNNNNNNNnnnnnn......',
    '......mNNNNNNNNNNNnnnnNNNNNNNnnnnnnnnnnnNNNNNNNNnnnnnnnnn.....',
    '.....mNNNNNNNNNNnnnnnnNNNNNnnnnnnnnnnnnnNNNNNNNnnnnnnnnnn.....',
    '.....mNNNNNNNNnnnnnnnnNNNnnnnnnnnnnnnnnnNNNNNnnnnnnnnnnnn.....',
    '....mNNNNNNNnnnnnnnnnnNnnnnnnnnnnnnnnnLLNNNnnnnnnnnnnnnLLN....',
    '..mNNNNNNNnnnnnnnnnnnnnnnnnnnnnnnnnnLLLLNnnnnnnnnnnnnLLNNNNN..',
    '.mNNNNNNnnnnnnnnnnnnnLnnnnnnnnnnnnLLLLLLnnnnnnnnnnnLLLNNNNNnn.',
    '.mNNNNNnnnnnnnnnnnnLLLLnnnnnnnnnLLLLLLLLnnnnnnnnnnLLLLNNNnnnn.',
    'mNNNNnnnnnnnnnnnnLLLLLNNnnnnNnnnnnLLLLNNNnnnnnnnLLLLLNNnnnnnnn',
    'mNNnnnnnnnnnnnnLLLLLNNnnnnNnnnnnnnnnLNNNnnnnnnLLLLLLNnnnnnnnnL',
    'mNnnnnnnnLnnnLLLLLLNNnnnnnnnnnnnnnnLLNNnnnnnLLLLLLLLnnnnnnnLLL',
    'VnnnnnnLLLnLLLLLLLLnnnnnnnnnnnnnnnLLNnnnnnnnLLLLLLLnnnnnnLLLLV',
    '.mnnnnLLLLLLLLLLLLnnnnnnnLnnnnnnLLLLnnnnnnnLLLLLLLVnnnnnLLLLL.',
    '.VnnLLLLLLVVLLLLLnnnnnnLLLnnnnLLLLLLnnnnnLLLLVVVVV.VnnLLLLLLV.',
    '..VVLLLLVV..VVVVVnnnnLLLLLnnLLLLLLLLnnnLLLLLL.......VVLLLLVV..',
    '....VVVV.........VnLLLLLLLLLLLLLLLLLnLLLLLLLV.........VVVV....',
    '..................VVLLLLVVVVLLLLLLVVVVLLLLVV..................',
    '....................VVVV....VVVVVV....VVVV....................',
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

/** Where the acorns hang, in crown pixels: on leaves, clear of the crown's edge. */
const ACORNS = [
  [12, 12], [24, 6], [36, 10], [47, 9], [54, 16], [8, 20], [29, 18], [42, 21],
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

/* ── the opener ────────────────────────────────────────────────────────────────────────────────── */

const CROWN = { x: 18, y: 1 } as const;
const TRUNK = { x: 38, y: 26 } as const;
const INVESTOR = { x: 2, y: 26 } as const;
/** The one acorn, held up in the fingers: its nut sits on the hand. */
const HELD = { x: INVESTOR.x + IF_INVESTOR_HAND.x + 1, y: INVESTOR.y + IF_INVESTOR_HAND.y - 3 } as const;

const base = ifCompose('if23-opener-base', 80, 60, [
  { sprite: ifStage, x: 0, y: 0 },
  // The trunk before the crown, so the leaves close over the tops of the limbs.
  { sprite: trunk, x: TRUNK.x, y: TRUNK.y },
  { sprite: crown, x: CROWN.x, y: CROWN.y },
  ...ACORNS.map(([x, y]) => ({ sprite: goldAcorn, x: CROWN.x + x, y: CROWN.y + y })),
  { sprite: ifInvestor, x: INVESTOR.x, y: INVESTOR.y },
  { sprite: goldAcorn, x: HELD.x, y: HELD.y },
]);

export const if23Opener: SceneArt = {
  id: 'if23-opener',
  label: 'Under a full moon a giant oak fills the sky, its wide crown hung with gold acorns and an owl blinking in a hollow of its trunk, while at its foot a small investor holds up a single gold acorn.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: owl, x: TRUNK.x + HOLLOW.x, y: TRUNK.y + HOLLOW.y },
    { sprite: ifGlint, x: HELD.x - 1, y: HELD.y + 1 },
    { sprite: ifLater(ifGlint, 'if23-glint-crown', 2, 300), x: CROWN.x + ACORNS[2][0] - 1, y: CROWN.y + ACORNS[2][1] + 1 },
    { sprite: ifLater(ifGlint, 'if23-glint-low', 4, 340), x: CROWN.x + ACORNS[5][0] - 1, y: CROWN.y + ACORNS[5][1] + 1 },
    { sprite: ifStarBig, x: 24, y: 9, motion: { kind: 'twinkle', periodMs: 2300, min: 0.3 } },
    { sprite: ifStar, x: 21, y: 2, motion: { kind: 'twinkle', periodMs: 1800, phase: 0.4, min: 0.2 } },
    { sprite: ifStar, x: 3, y: 20, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.7, min: 0.2 } },
    { sprite: ifFirefly, x: 27, y: 44, motion: { kind: 'rise', amp: 5, periodMs: 3500, phase: 0.1 } },
    { sprite: ifFirefly, x: 34, y: 36, motion: { kind: 'rise', amp: 6, periodMs: 4100, phase: 0.45 } },
    { sprite: ifFirefly, x: 66, y: 38, motion: { kind: 'rise', amp: 5, periodMs: 3800, phase: 0.7 } },
    { sprite: ifFirefly, x: 72, y: 50, motion: { kind: 'rise', amp: 5, periodMs: 3300, phase: 0.9 } },
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────────── */

const emblemOakLeaf: PixelSprite = {
  id: 'if-emblem-oak-leaf',
  name: 'if-emblem-oak-leaf',
  tags: ['scene', 'if'],
  blurb: "Lesson 23: an oak leaf. What a small acorn becomes, given the years.",
  palette: IF_PALETTE,
  rows: [
    '....mN....',
    '..mmNNn...',
    '.mNNnNNn..',
    '..mNnNn...',
    '.mNNnNNNn.',
    '..NNnNnn..',
    '...nnnn...',
    '....hA....',
  ],
};

export const if23Finish: SceneArt = ifKeepsake(
  'if23-finish',
  'A golden acorn hanging from an oak twig, with a green oak leaf in its purple window and small sparkles around it.',
  emblemOakLeaf,
);

export const art: LessonArtSet = { opener: if23Opener, backdrop: ifBackdrop, finish: if23Finish };
