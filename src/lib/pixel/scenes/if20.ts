/**
 * Investing Fundamentals lesson 20, Evaluating Investment Fees: a small number that eats a lot.
 *
 * The investor comes out with a lantern and finds beetles on the money tree. Three sit on its coins,
 * nibbling at them, and a line of three more marches down to a burrow carrying gold crumbs away. Nailed
 * to the trunk is a tag reading 1%: the fee looks tiny on the label, but it takes its bite out of every
 * coin, every year, and the crumbs add up. The beetles nibble and march (drift), a crumb falls (frames),
 * the lantern flame flickers, coins glint, stars twinkle and fireflies drift up.
 *
 * The keepsake's emblem is a coin with a bite out of it and the beetle that took it.
 */
import type { PixelSprite } from '../types';
import {
  IF_INVESTOR_HAND,
  IF_PALETTE,
  ifCompose,
  ifFirefly,
  ifFlame,
  ifGlint,
  ifInvestor,
  ifKeepsake,
  ifLater,
  ifMoneyTree,
  ifStage,
  ifStar,
  ifStarBig,
} from './if-kit';
import { ifBackdrop } from './if-backdrop';
import { ifFall } from './if-kit-c';
import type { LessonArtSet, SceneArt } from './types';

/* ── props ─────────────────────────────────────────────────────────────────────────────────────── */

/** A hand lantern, 5x7, carried by the top of its bail at (2, 0); the glass at (1, 3) takes ifFlame. */
const lantern: PixelSprite = {
  id: 'if20-lantern',
  name: 'if20-lantern',
  tags: ['scene', 'if'],
  rows: [
    '.XXX.',
    '.X.X.',
    'XXXXD',
    'D4y4D',
    'D454D',
    'D444D',
    '.DDD.',
  ],
};

/**
 * The fee tag, 12x7, nailed to the trunk at the top: 1% in ink on white paper. The percent sign is
 * drawn here at 5x5, two square dots and a slash, because the kit's 3x5 one is too small to read on a
 * tag this size.
 */
const tag: PixelSprite = {
  id: 'if20-tag',
  name: 'if20-tag',
  tags: ['scene', 'if'],
  rows: [
    '.wwwwwDwwwx.',
    'wwKwwKKwwKwx',
    'wKKwwKKwKwwx',
    'wwKwwwwKwwwx',
    'wwKwwwKwKKwx',
    'wKKKwKwwKKwx',
    '.xxxxxxxxxx.',
  ],
};

/** The beetles' burrow, 6x3: a little mound of soil with a dark hole. */
const burrow: PixelSprite = {
  id: 'if20-burrow',
  name: 'if20-burrow',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [
    '..cc..',
    '.cddc.',
    'ceddec',
  ],
};

/* ── the beetles ───────────────────────────────────────────────────────────────────────────────── */

/** A beetle nibbling, 5x4, facing left: a blue shell lit on top with a dark seam, head and legs. */
const nibbler: PixelSprite = {
  id: 'if20-nibbler',
  name: 'if20-nibbler',
  tags: ['scene', 'if'],
  rows: [
    '.BBB.',
    'KBKbb',
    'KbKbb',
    '.K.K.',
  ],
};

/** A beetle marching off to the right, 5x5, a gold crumb on its back. */
const carrier: PixelSprite = {
  id: 'if20-carrier',
  name: 'if20-carrier',
  tags: ['scene', 'if'],
  rows: [
    '..y..',
    '.BBB.',
    'bbKBK',
    'bbKbK',
    '.K.K.',
  ],
};

/** A crumb of gold dropping from a nibbled coin to the ground, then a beat before the next. */
const crumb = ifFall(
  'if20-crumb',
  1,
  14,
  ['y'],
  [[0, 0], [0, 3], [0, 6], [0, 9], [0, 13], [-9, -9], [-9, -9]],
  170,
);

/* ── the opener ────────────────────────────────────────────────────────────────────────────────── */

const INVESTOR = { x: 8, y: 25 } as const;
/** The lantern hangs from the hand by its bail. */
const LANTERN = { x: INVESTOR.x + IF_INVESTOR_HAND.x - 1, y: INVESTOR.y + IF_INVESTOR_HAND.y + 1 } as const;
const TREE = { x: 36, y: 12 } as const;
/** The money tree's coins (if-kit-a.ts notes) the beetles sit on: left of the crown, right, low left. */
const NIBBLED = [
  { x: TREE.x + 4, y: TREE.y + 8 },
  { x: TREE.x + 18, y: TREE.y + 10 },
  { x: TREE.x + 3, y: TREE.y + 16 },
] as const;
const TAG = { x: TREE.x + 6, y: TREE.y + 23 } as const;
const BURROW = { x: 72, y: 44 } as const;

const base = ifCompose('if20-opener-base', 80, 60, [
  { sprite: ifStage, x: 0, y: 0 },
  { sprite: ifMoneyTree, x: TREE.x, y: TREE.y },
  { sprite: tag, x: TAG.x, y: TAG.y },
  { sprite: burrow, x: BURROW.x, y: BURROW.y },
  // The lantern before the investor, so the hand closes over its bail.
  { sprite: lantern, x: LANTERN.x, y: LANTERN.y },
  { sprite: ifInvestor, x: INVESTOR.x, y: INVESTOR.y },
]);

export const if20Opener: SceneArt = {
  id: 'if20-opener',
  label: 'At night an investor carrying a lantern finds a money tree with a tag reading 1% nailed to its trunk, beetles nibbling its gold coins, and a line of beetles carrying crumbs of gold away to a burrow.',
  width: 80,
  height: 60,
  base,
  layers: [
    // Each nibbler's head sits on its coin's right edge; the drift is the nibbling.
    ...NIBBLED.map(({ x, y }, i) => ({
      sprite: nibbler,
      x: x + 3,
      y,
      motion: { kind: 'drift' as const, amp: 1, periodMs: 900 + i * 170, phase: i / 3 },
    })),
    { sprite: carrier, x: 52, y: 42, motion: { kind: 'drift', amp: 2, periodMs: 2400 } },
    { sprite: carrier, x: 59, y: 43, motion: { kind: 'drift', amp: 2, periodMs: 2400, phase: 0.33 } },
    { sprite: carrier, x: 66, y: 44, motion: { kind: 'drift', amp: 2, periodMs: 2400, phase: 0.66 } },
    { sprite: crumb, x: NIBBLED[2].x + 3, y: NIBBLED[2].y + 3 },
    { sprite: ifFlame, x: LANTERN.x + 1, y: LANTERN.y + 3 },
    { sprite: ifGlint, x: TREE.x + 14, y: TREE.y + 3 },
    { sprite: ifLater(ifGlint, 'if20-glint-low', 2, 300), x: TREE.x + 14, y: TREE.y + 18 },
    { sprite: ifStarBig, x: 26, y: 7, motion: { kind: 'twinkle', periodMs: 2300, min: 0.3 } },
    { sprite: ifStar, x: 40, y: 3, motion: { kind: 'twinkle', periodMs: 1800, phase: 0.4, min: 0.2 } },
    { sprite: ifStar, x: 66, y: 6, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.7, min: 0.2 } },
    { sprite: ifStar, x: 75, y: 15, motion: { kind: 'twinkle', periodMs: 2900, phase: 0.2, min: 0.2 } },
    { sprite: ifFirefly, x: 29, y: 52, motion: { kind: 'rise', amp: 5, periodMs: 3600, phase: 0.15 } },
    { sprite: ifFirefly, x: 57, y: 54, motion: { kind: 'rise', amp: 6, periodMs: 4100, phase: 0.6 } },
    { sprite: ifFirefly, x: 76, y: 51, motion: { kind: 'rise', amp: 5, periodMs: 3800, phase: 0.85 } },
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────────── */

const emblemBittenCoin: PixelSprite = {
  id: 'if-emblem-bitten-coin',
  name: 'if-emblem-bitten-coin',
  tags: ['scene', 'if'],
  blurb: "Lesson 20: a coin with a bite out of it and the beetle that took it. A fee, eating the return.",
  rows: [
    '..OOO.....',
    '.OyyGO.Bb.',
    'OyyGGOKBBb',
    'OyGGGgOK.K',
    'OGGGgggO..',
    'OGGggggO..',
    '.OggggO...',
    '..OOOO....',
  ],
};

export const if20Finish: SceneArt = ifKeepsake(
  'if20-finish',
  'A golden acorn hanging from an oak twig, with a gold coin missing a bite and a beetle chewing at it in its purple window and small sparkles around it.',
  emblemBittenCoin,
);

export const art: LessonArtSet = { opener: if20Opener, backdrop: ifBackdrop, finish: if20Finish };
