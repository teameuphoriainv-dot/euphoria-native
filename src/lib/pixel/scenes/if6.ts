/**
 * Investing Fundamentals lesson 6, ETFs & Index Funds: the whole market in one box, for one small coin.
 *
 * A new set for the pathway: a night market stall at the edge of the orchard, kept by the orchard's
 * gardener. On its counter each crate holds one kind of fruit (coins, apples, plums, figs): the market,
 * bought one holding at a time. The investor carries a crate built like the whole counter in small, a
 * compartment for every crate on it, and pays for it with a single coin that flips across into the
 * gardener's palm: an index fund, everything for a tiny fee. Beside the stall a picker in a top hat
 * holds out a crate filled by hand with just two fruits, one of them withered, and coins keep dropping
 * out through a crack in its bottom onto a heap at the picker's feet: an active fund, a few picks for a
 * fee taken every year that piles up. The lantern flickers, a moth circles it, the coins glint, stars
 * twinkle and fireflies drift.
 *
 * The keepsake's emblem is a crate heaped with mixed fruit and a price tag on a string holding one
 * small coin: the whole market, and all it costs.
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
  ifLanternPost,
  ifLater,
  ifStage,
  ifStar,
  ifStarBig,
} from './if-kit';
import { ifBackdrop } from './if-backdrop';
import {
  IF_APPLE,
  IF_A_PALETTE,
  IF_FIG,
  IF_GARDENER_HAND,
  IF_PLUM,
  ifCoinDrop,
  ifGardener,
  ifRecolour,
} from './if-kit-a';
import { IF_R_PALETTE } from './if-kit-r';
import type { LessonArtSet, SceneArt } from './types';

/* ── the stall ─────────────────────────────────────────────────────────────────────────────────── */

const STALL = { x: 26, width: 33 } as const;
const COUNTER_Y = 36;

/** The awning's stripes, four pixels each, orchid and pale orchid. */
const stripe = (x: number) => (Math.floor(x / 4) % 2 === 0 ? 'P' : 'Q');

const awning: PixelSprite = {
  id: 'if6-awning',
  name: 'if6-awning',
  tags: ['scene', 'if'],
  rows: [
    'E'.repeat(STALL.width),
    ...Array.from({ length: 4 }, () => Array.from({ length: STALL.width }, (_, x) => stripe(x)).join('')),
    Array.from({ length: STALL.width }, (_, x) => (x % 4 === 1 || x % 4 === 2 ? stripe(x) : '.')).join(''),
  ],
};

/** One of the stall's two posts, from under the awning down to the counter. */
const post: PixelSprite = {
  id: 'if6-post',
  name: 'if6-post',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: Array.from({ length: 21 }, () => 'hA'),
};

const counter: PixelSprite = {
  id: 'if6-counter',
  name: 'if6-counter',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [
    'h'.repeat(STALL.width),
    'A'.repeat(STALL.width),
    ...Array.from({ length: 8 }, () => Array.from({ length: STALL.width }, (_, x) => (x % 6 === 5 ? 'a' : 'A')).join('')),
  ],
};

/** A crate heaped with coins, 6x6; ifRecolour turns the heap into another fruit. */
const crate: PixelSprite = {
  id: 'if6-crate',
  name: 'if6-crate',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [
    '.yGyG.',
    'yGgGgg',
    'hhhhhh',
    'hAAAAa',
    'haaaaa',
    'hAAAAa',
  ],
};

/**
 * The index crate the investor buys, 13x7: the counter in small, a compartment for each crate on it in
 * the same order (coins, apples, plums, figs). Held at its top-left.
 */
const indexCrate: PixelSprite = {
  id: 'if6-index-crate',
  name: 'if6-index-crate',
  tags: ['scene', 'if'],
  palette: IF_A_PALETTE,
  rows: [
    '.yG.sR.Bb.Qq.',
    'hGghRrhbuhqPh',
    'hhhhhhhhhhhhh',
    'hAAAAAAAAAAAa',
    'haaaaaaaaaaaa',
    'hAAAAAAAAAAAa',
    '.aaaaaaaaaaa.',
  ],
};

/** The kit's lantern without its post, hung from the awning on a short hook; glass at (1, 3). */
const hangingLantern: PixelSprite = {
  ...ifLanternPost,
  id: 'if6-hanging-lantern',
  name: 'if6-hanging-lantern',
  rows: ['..D..', ...ifLanternPost.rows.slice(0, 7)],
};

const moth: PixelSprite = {
  id: 'if6-moth',
  name: 'if6-moth',
  tags: ['scene', 'if'],
  rows: ['x.x', '.w.'],
};

/* ── the picker ────────────────────────────────────────────────────────────────────────────────── */

/**
 * The picker, 14x23, facing left like the gardener and built on the same figure: the cast's light skin
 * tone (IF_R_PALETTE), a tall black top hat with a gold band, a moustache, a red tailcoat over a gold
 * waistcoat, one arm out holding whatever is placed at PICKER_HAND.
 */
const picker: PixelSprite = {
  id: 'if6-picker',
  name: 'if6-picker',
  tags: ['scene', 'if'],
  palette: IF_R_PALETTE,
  rows: [
    '.....KKKKK....',
    '.....DKKKK....',
    '.....DKKKK....',
    '.....DKKKK....',
    '.....GGGGg....',
    '...KKKKKKKKK..',
    '....SSSSSHHH..',
    '....SSSSSSHH..',
    '....SKSSSSSH..',
    '...SSSSSSSMH..',
    '....HHSSSSM...',
    '.....MSSSMM...',
    '.....2www21...',
    'SS2222GGG221..',
    'MM1112GgG211..',
    '....22GgG21...',
    '....22GgG21...',
    '....22GgG21...',
    '....12222211..',
    '.....XXXXXD...',
    '....XXD.XXD...',
    '....XD..XXD...',
    '...hAAa.hAAa..',
  ],
};
const PICKER_HAND = { x: 0, y: 13 } as const;

/**
 * The picker's crate, 7x6: an apple and a withered grey fruit, nothing else, and a crack in the bottom
 * slat at (2, 5) that the coins fall through.
 */
const pickedCrate: PixelSprite = {
  id: 'if6-picked-crate',
  name: 'if6-picked-crate',
  tags: ['scene', 'if'],
  palette: IF_A_PALETTE,
  rows: [
    '.sR.xX.',
    '.Rr.XD.',
    'hhhhhhh',
    'hAAAAAa',
    'haaaaaa',
    'hA.AAAa',
  ],
};

/** The coins that have dropped out of the picker's crate, heaped on the ground, 10x4. */
const feeHeap: PixelSprite = {
  id: 'if6-fee-heap',
  name: 'if6-fee-heap',
  tags: ['scene', 'if'],
  rows: [
    '...yGyG...',
    '..yGgGgGy.',
    '.yGgGgGgGy',
    'yGgGgGgGgg',
  ],
};

/* ── the opener ────────────────────────────────────────────────────────────────────────────────── */

const CRATES = [
  { sprite: crate, x: 29 },
  { sprite: ifRecolour(crate, 'if6-crate-apples', IF_APPLE), x: 36 },
  { sprite: ifRecolour(crate, 'if6-crate-plums', IF_PLUM), x: 43 },
  { sprite: ifRecolour(crate, 'if6-crate-figs', IF_FIG), x: 50 },
] as const;
const VENDOR = { x: 31, y: 17 } as const;
const PALM = { x: VENDOR.x + IF_GARDENER_HAND.x, y: VENDOR.y + IF_GARDENER_HAND.y } as const;
const INVESTOR = { x: 0, y: 25 } as const;
const INDEX_CRATE = { x: INVESTOR.x + IF_INVESTOR_HAND.x, y: INVESTOR.y + IF_INVESTOR_HAND.y - 2 } as const;
const LANTERN = { x: 46, y: 15 } as const;
const PICKER = { x: 66, y: 23 } as const;
/** The picker holds the crate by its top-right corner. */
const PICKED_CRATE = { x: PICKER.x + PICKER_HAND.x - 6, y: PICKER.y + PICKER_HAND.y - 2 } as const;
const FEE_HEAP = { x: PICKED_CRATE.x - 2, y: 45 } as const;

const base = ifCompose('if6-opener-base', 80, 60, [
  { sprite: ifStage, x: 0, y: 0 },
  // The keeper behind the counter: the counter and crates are stamped after, so they hide the legs.
  { sprite: ifGardener, x: VENDOR.x, y: VENDOR.y },
  { sprite: post, x: STALL.x + 1, y: 15 },
  { sprite: post, x: STALL.x + STALL.width - 2, y: 15 },
  { sprite: awning, x: STALL.x, y: 9 },
  { sprite: counter, x: STALL.x, y: COUNTER_Y },
  ...CRATES.map(({ sprite, x }) => ({ sprite, x, y: COUNTER_Y - 6 })),
  { sprite: hangingLantern, x: LANTERN.x, y: LANTERN.y },
  // Each crate before the hand holding it, so the hand closes over its corner.
  { sprite: indexCrate, x: INDEX_CRATE.x, y: INDEX_CRATE.y },
  { sprite: ifInvestor, x: INVESTOR.x, y: INVESTOR.y },
  { sprite: feeHeap, x: FEE_HEAP.x, y: FEE_HEAP.y },
  { sprite: pickedCrate, x: PICKED_CRATE.x, y: PICKED_CRATE.y },
  { sprite: picker, x: PICKER.x, y: PICKER.y },
]);

/**
 * The investor's one coin, flipped up off the crate and over the counter into the keeper's palm, and
 * then pocketed. At rest it lies in the palm.
 */
const TOSS_AT = { x: 10, y: 21 } as const;
const paidCoin = ifCoinDrop(
  'if6-paid-coin',
  24,
  16,
  [[3, 9], [6, 5], [9, 2], [12, 0], [15, 0], [18, 1], [PALM.x - 1 - TOSS_AT.x, PALM.y - 4 - TOSS_AT.y], [-9, -9], [-9, -9], [-9, -9]],
  170,
  6,
);

/** A coin slipping out through the crack in the picker's crate and dropping onto the heap. At rest it is mid-fall. */
const LEAK_AT = { x: PICKED_CRATE.x + 1, y: PICKED_CRATE.y + 6 } as const;
const leakingCoin = ifCoinDrop('if6-leaking-coin', 4, 10, [[0, 0], [0, 2], [0, 4], [-9, -9], [-9, -9]], 190, 1);

export const if6Opener: SceneArt = {
  id: 'if6-opener',
  label: 'At a night market stall where each crate holds one kind of fruit, an investor flips the keeper a single coin for a crate with a compartment for every crate on the counter, while beside the stall a picker in a top hat holds out a crate of just two fruits that keeps dropping coins onto a heap.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: paidCoin, x: TOSS_AT.x, y: TOSS_AT.y },
    { sprite: leakingCoin, x: LEAK_AT.x, y: LEAK_AT.y },
    { sprite: ifFlame, x: LANTERN.x + 1, y: LANTERN.y + 4 },
    { sprite: moth, x: LANTERN.x + 6, y: LANTERN.y + 2, motion: { kind: 'drift', amp: 3, periodMs: 1700 } },
    { sprite: ifGlint, x: INDEX_CRATE.x, y: INDEX_CRATE.y - 1 },
    { sprite: ifLater(ifGlint, 'if6-glint-heap', 3, 300), x: FEE_HEAP.x + 5, y: FEE_HEAP.y },
    { sprite: ifStarBig, x: 40, y: 2, motion: { kind: 'twinkle', periodMs: 2300, min: 0.3 } },
    { sprite: ifStar, x: 22, y: 9, motion: { kind: 'twinkle', periodMs: 1800, phase: 0.4, min: 0.2 } },
    { sprite: ifStar, x: 63, y: 5, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.7, min: 0.2 } },
    { sprite: ifStar, x: 75, y: 12, motion: { kind: 'twinkle', periodMs: 2000, phase: 0.2, min: 0.25 } },
    { sprite: ifFirefly, x: 4, y: 50, motion: { kind: 'rise', amp: 5, periodMs: 3400, phase: 0.1 } },
    { sprite: ifFirefly, x: 33, y: 52, motion: { kind: 'rise', amp: 6, periodMs: 4100, phase: 0.5 } },
    { sprite: ifFirefly, x: 75, y: 53, motion: { kind: 'rise', amp: 5, periodMs: 3700, phase: 0.8 } },
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────────── */

const emblemIndexCrate: PixelSprite = {
  id: 'if-emblem-index-crate',
  name: 'if-emblem-index-crate',
  tags: ['scene', 'if'],
  blurb: "Lesson 6: a crate heaped with mixed fruit, and a price tag holding one small coin. The whole market, for a tiny fee.",
  palette: IF_A_PALETTE,
  rows: [
    '......wwwx',
    '.sRQq.wyGx',
    '.RrqP.wGgx',
    'BbQqsRxxxx',
    'buqPRrx...',
    'hhhhhhh...',
    'hAAAAAa...',
    '.aaaaaa...',
  ],
};

export const if6Finish: SceneArt = ifKeepsake(
  'if6-finish',
  'A golden acorn hanging from an oak twig, with a crate heaped with mixed fruit and a price tag holding one small coin in its purple window and small sparkles around it.',
  emblemIndexCrate,
);

export const art: LessonArtSet = { opener: if6Opener, backdrop: ifBackdrop, finish: if6Finish };
