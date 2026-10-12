/**
 * Investing Fundamentals lesson 17, Introduction to Options: a small price now for the right, not the
 * duty, to buy later at a price fixed today, until time runs out.
 *
 * Behind a white picket fence stands someone else's young money tree, and tied to the gate with a red
 * ribbon is a tag reading 100: the strike, the price the investor may buy it at. The investor holds
 * up one coin, the premium, all it costs for the right. In front of the gate a big hourglass stands on
 * a stump with its sand running, because the right expires and is worth less every day it waits (time
 * decay). Sand falls (frames), the ribbon flutters, coins glint, stars twinkle and fireflies drift.
 *
 * The keepsake's emblem is the hourglass with the strike tag tied to it on the red ribbon: a price
 * fixed today that holds only until the sand runs out, which no other lesson's hourglass would mean.
 */
import type { PixelSprite } from '../types';
import {
  IF_INVESTOR_HAND,
  IF_PALETTE,
  ifCoin,
  ifCompose,
  ifFirefly,
  ifGlint,
  ifInvestor,
  ifKeepsake,
  ifLater,
  ifStage,
  ifStar,
  ifStarBig,
  ifYoungTree,
} from './if-kit';
import { ifBackdrop } from './if-backdrop';
import { ifDigits } from './if-kit-b';
import type { LessonArtSet, SceneArt } from './types';

/* ── the hourglass ─────────────────────────────────────────────────────────────────────────────── */

/** The hourglass, 11x14: two wooden plates on lit posts, the glass bulbs between them, empty. */
const hourglass: PixelSprite = {
  id: 'if17-hourglass',
  name: 'if17-hourglass',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [
    'hhhhhhhhhhA',
    'aAAAAAAAAAa',
    'hw.......xa',
    'hw.......xa',
    'h.w.....x.a',
    'h..w...x..a',
    'h...w.x...a',
    'h...w.x...a',
    'h..w...x..a',
    'h.w.....x.a',
    'hw.......xa',
    'hw.......xa',
    'hhhhhhhhhhA',
    'aAAAAAAAAAa',
  ],
};

/** The inside of each bulb row, as its first and last column: the top bulb, the neck, the bottom bulb. */
const BULB: Readonly<Record<number, readonly [number, number]>> = {
  2: [2, 8], 3: [2, 8], 4: [3, 7], 5: [4, 6], 6: [5, 5], 7: [5, 5], 8: [4, 6], 9: [3, 7], 10: [2, 8], 11: [2, 8],
};

/**
 * The sand after `k` beats (0 to 4): the top bulb drains from its top row down, the pile in the bottom
 * bulb grows from its floor up, and while there is sand above, a thin stream runs through the neck.
 */
function sand(k: number): string[] {
  return Array.from({ length: 14 }, (_, y) =>
    Array.from({ length: 11 }, (__, x) => {
      const inside = BULB[y];
      if (!inside || x < inside[0] || x > inside[1]) return '.';
      const top = y <= 5 && y >= 2 + k;
      const pile = y >= 8 && y >= 11 - k;
      if (top || pile) return x === inside[0] ? 'y' : x === inside[1] ? 'g' : 'G';
      if (k < 4 && x === 5 && y >= 6 && y < 11 - k) return 'y';
      return '.';
    }).join(''),
  );
}

const sandFalling: PixelSprite = {
  id: 'if17-sand',
  name: 'if17-sand',
  tags: ['scene', 'if'],
  rows: sand(2),
  frames: [0, 1, 2, 3, 4, 4, 4].map(sand),
  frameMs: 520,
};

/** A wide stump for the hourglass, 13x4. */
const stump: PixelSprite = {
  id: 'if17-stump',
  name: 'if17-stump',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [
    '.hhhhhhhhhhA.',
    'ahAhAAhAAAAAa',
    'aAAAAAAAAAAaa',
    'aaaaaaaaaaaaa',
  ],
};

/* ── the fence and the tag ─────────────────────────────────────────────────────────────────────── */

const FENCE = { from: 40, top: 34, bottom: 44 } as const;

/** A white picket fence on a transparent 80x60 sheet: pointed pickets every four columns, two rails. */
const fence: PixelSprite = {
  id: 'if17-fence',
  name: 'if17-fence',
  tags: ['scene', 'if'],
  rows: Array.from({ length: 60 }, (_, y) =>
    Array.from({ length: 80 }, (__, x) => {
      if (x < FENCE.from || y < FENCE.top || y > FENCE.bottom) return '.';
      const col = (x - FENCE.from) % 4;
      if (col === 0) return 'w';
      if (col === 1) return y === FENCE.top ? '.' : 'x';
      return y === FENCE.top + 3 || y === FENCE.bottom - 2 ? 'x' : '.';
    }).join(''),
  ),
};

/** The tag, 15x7: paper with a hole on the left for the ribbon and the strike, 100, in ink. */
const tagPaper: PixelSprite = {
  id: 'if17-tag-paper',
  name: 'if17-tag-paper',
  tags: ['scene', 'if'],
  rows: [
    '.wwwwwwwwwwwwwx',
    'wwwwwwwwwwwwwwx',
    'wwwwwwwwwwwwwwx',
    'wKwwwwwwwwwwwwx',
    'wwwwwwwwwwwwwwx',
    'wwwwwwwwwwwwwwx',
    '.xxxxxxxxxxxxxx',
  ],
};
const tag = ifCompose('if17-tag', 15, 7, [
  { sprite: tagPaper, x: 0, y: 0 },
  { sprite: ifDigits('if17-strike', '100', 'K'), x: 3, y: 1 },
]);

/** The ribbon's tail, 3x3, fluttering on the gate beside the tag's hole. */
const RIBBON_A = ['RR.', '.Rr', '..r'];
const RIBBON_B = ['RR.', '.RR', '.r.'];
const ribbon: PixelSprite = {
  id: 'if17-ribbon',
  name: 'if17-ribbon',
  tags: ['scene', 'if'],
  rows: RIBBON_A,
  frames: [RIBBON_A, RIBBON_B, RIBBON_A, RIBBON_A, RIBBON_B],
  frameMs: 240,
};

/* ── the opener ────────────────────────────────────────────────────────────────────────────────── */

const INVESTOR = { x: 4, y: 25 } as const;
/** The premium, pinched at its left edge so the hand closes over it. */
const COIN = { x: INVESTOR.x + IF_INVESTOR_HAND.x + 1, y: INVESTOR.y + IF_INVESTOR_HAND.y - 2 } as const;
const STUMP = { x: 22, y: 42 } as const;
const HOURGLASS = { x: STUMP.x + 1, y: STUMP.y - 14 } as const;
const TREE = { x: 52, y: 17 } as const;
const TAG = { x: 58, y: 36 } as const;

const base = ifCompose('if17-opener-base', 80, 60, [
  { sprite: ifStage, x: 0, y: 0 },
  { sprite: ifYoungTree, x: TREE.x, y: TREE.y },
  { sprite: fence, x: 0, y: 0 },
  { sprite: tag, x: TAG.x, y: TAG.y },
  { sprite: stump, x: STUMP.x, y: STUMP.y },
  { sprite: hourglass, x: HOURGLASS.x, y: HOURGLASS.y },
  { sprite: ifCoin, x: COIN.x, y: COIN.y },
  { sprite: ifInvestor, x: INVESTOR.x, y: INVESTOR.y },
]);

export const if17Opener: SceneArt = {
  id: 'if17-opener',
  label: 'An investor holds up one gold coin beside a big hourglass running on a stump, in front of a picket fence where a red ribbon ties a tag reading 100 to the gate of a young money tree.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: sandFalling, x: HOURGLASS.x, y: HOURGLASS.y },
    { sprite: ribbon, x: TAG.x - 2, y: TAG.y + 3 },
    { sprite: ifGlint, x: COIN.x, y: COIN.y },
    { sprite: ifLater(ifGlint, 'if17-glint-tree', 2, 290), x: TREE.x + 8, y: TREE.y + 3 },
    { sprite: ifLater(ifGlint, 'if17-glint-tree-low', 4, 330), x: TREE.x + 2, y: TREE.y + 6 },
    { sprite: ifStarBig, x: 33, y: 6, motion: { kind: 'twinkle', periodMs: 2300, min: 0.3 } },
    { sprite: ifStar, x: 47, y: 12, motion: { kind: 'twinkle', periodMs: 1800, phase: 0.4, min: 0.2 } },
    { sprite: ifStar, x: 70, y: 5, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.7, min: 0.2 } },
    { sprite: ifFirefly, x: 37, y: 47, motion: { kind: 'rise', amp: 5, periodMs: 3500, phase: 0.2 } },
    { sprite: ifFirefly, x: 74, y: 50, motion: { kind: 'rise', amp: 6, periodMs: 4000, phase: 0.6 } },
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────────── */

const emblemHourglass: PixelSprite = {
  id: 'if-emblem-hourglass',
  name: 'if-emblem-hourglass',
  tags: ['scene', 'if'],
  blurb: "Lesson 17: an hourglass with the strike tag tied to it. A fixed price, until time runs out.",
  palette: IF_PALETTE,
  rows: [
    'hhhhhARr..',
    'wyGGgx.Rr.',
    '.wGgx..Rw.',
    '..wx..wKwx',
    '..wx..wwwx',
    '.wyGx.wwwx',
    'wyGGgx.wwx',
    'hhhhhA.xxx',
  ],
};

export const if17Finish: SceneArt = ifKeepsake(
  'if17-finish',
  'A golden acorn hanging from an oak twig, with an hourglass of gold sand and a white price tag tied to it with a red ribbon in its purple window and small sparkles around it.',
  emblemHourglass,
);

export const art: LessonArtSet = { opener: if17Opener, backdrop: ifBackdrop, finish: if17Finish };
