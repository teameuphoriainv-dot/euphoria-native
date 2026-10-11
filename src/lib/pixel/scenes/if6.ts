/**
 * Investing Fundamentals lesson 6, ETFs & Index Funds: the whole market in one small box.
 *
 * A new set for the pathway: a night market stall at the edge of the orchard. On its counter each
 * crate holds one kind of fruit (coins, apples, plums, figs), which is buying single stocks one at a
 * time. The investor walks off with a single small crate holding one of every kind: one purchase
 * that holds everything on the stall, cheaply, which is an index fund. The orchard's gardener keeps
 * the stall. The lantern flickers, a moth circles it, coins glint, stars twinkle, fireflies drift.
 *
 * The keepsake's emblem is that crate seen from above: a grid with a little of everything in it.
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
import { IF_APPLE, IF_A_PALETTE, IF_FIG, IF_PLUM, ifGardener, ifRecolour } from './if-kit-a';
import type { LessonArtSet, SceneArt } from './types';

/* ── the stall ─────────────────────────────────────────────────────────────────────────────────── */

const awning: PixelSprite = {
  id: 'if6-awning',
  name: 'if6-awning',
  tags: ['scene', 'if'],
  rows: [
    'EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE',
    'PPPPQQQQPPPPQQQQPPPPQQQQPPPPQQQQPPPPQQQQPPPPQQ',
    'PPPPQQQQPPPPQQQQPPPPQQQQPPPPQQQQPPPPQQQQPPPPQQ',
    'PPPPQQQQPPPPQQQQPPPPQQQQPPPPQQQQPPPPQQQQPPPPQQ',
    'PPPPQQQQPPPPQQQQPPPPQQQQPPPPQQQQPPPPQQQQPPPPQQ',
    '.PP..QQ..PP..QQ..PP..QQ..PP..QQ..PP..QQ..PP..Q',
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
    'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',
    'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    'AAAAAaAAAAAaAAAAAaAAAAAaAAAAAaAAAAAaAAAAAaAAAA',
    'AAAAAaAAAAAaAAAAAaAAAAAaAAAAAaAAAAAaAAAAAaAAAA',
    'AAAAAaAAAAAaAAAAAaAAAAAaAAAAAaAAAAAaAAAAAaAAAA',
    'AAAAAaAAAAAaAAAAAaAAAAAaAAAAAaAAAAAaAAAAAaAAAA',
    'AAAAAaAAAAAaAAAAAaAAAAAaAAAAAaAAAAAaAAAAAaAAAA',
    'AAAAAaAAAAAaAAAAAaAAAAAaAAAAAaAAAAAaAAAAAaAAAA',
    'AAAAAaAAAAAaAAAAAaAAAAAaAAAAAaAAAAAaAAAAAaAAAA',
    'AAAAAaAAAAAaAAAAAaAAAAAaAAAAAaAAAAAaAAAAAaAAAA',
  ],
};

/** A crate heaped with coins, 7x6; ifRecolour turns the heap into another fruit. */
const crate: PixelSprite = {
  id: 'if6-crate',
  name: 'if6-crate',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [
    '..yGyG.',
    'yGgGgGg',
    'hhhhhhh',
    'hAAAAAa',
    'haaaaaa',
    'hAAAAAa',
  ],
};

/** The crate the investor buys, 9x7: one coin, one apple, one plum and one fig. Held at its top-left. */
const sampler: PixelSprite = {
  id: 'if6-sampler',
  name: 'if6-sampler',
  tags: ['scene', 'if'],
  palette: IF_A_PALETTE,
  rows: [
    '.yGsRBbQq',
    '.GgRrbuqP',
    'hhhhhhhhh',
    'hAAAAAAAa',
    'haaaaaaaa',
    'hAAAAAAAa',
    '.aaaaaaa.',
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

/* ── the opener ────────────────────────────────────────────────────────────────────────────────── */

const STALL_X = 34;
const COUNTER_Y = 36;
const CRATES = [
  { sprite: crate, x: 37 },
  { sprite: ifRecolour(crate, 'if6-crate-apples', IF_APPLE), x: 45 },
  { sprite: ifRecolour(crate, 'if6-crate-plums', IF_PLUM), x: 53 },
  { sprite: ifRecolour(crate, 'if6-crate-figs', IF_FIG), x: 61 },
] as const;
const VENDOR = { x: 65, y: 17 } as const;
const INVESTOR = { x: 8, y: 25 } as const;
const SAMPLER = { x: INVESTOR.x + IF_INVESTOR_HAND.x, y: INVESTOR.y + IF_INVESTOR_HAND.y - 2 } as const;
const LANTERN = { x: 46, y: 15 } as const;

const base = ifCompose('if6-opener-base', 80, 60, [
  { sprite: ifStage, x: 0, y: 0 },
  // The keeper behind the counter: the counter and crates are stamped after, so they hide the legs.
  { sprite: ifGardener, x: VENDOR.x, y: VENDOR.y },
  { sprite: post, x: STALL_X + 1, y: 15 },
  { sprite: post, x: 78, y: 15 },
  { sprite: awning, x: STALL_X, y: 9 },
  { sprite: counter, x: STALL_X, y: COUNTER_Y },
  ...CRATES.map(({ sprite, x }) => ({ sprite, x, y: COUNTER_Y - 6 })),
  { sprite: hangingLantern, x: LANTERN.x, y: LANTERN.y },
  // The crate before the investor, so the hand closes over its corner.
  { sprite: sampler, x: SAMPLER.x, y: SAMPLER.y },
  { sprite: ifInvestor, x: INVESTOR.x, y: INVESTOR.y },
]);

export const if6Opener: SceneArt = {
  id: 'if6-opener',
  label: 'At a night market stall where each crate holds one kind of fruit, an investor carries away one small crate holding a coin, an apple, a plum and a fig, the whole stall in one box.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: ifFlame, x: LANTERN.x + 1, y: LANTERN.y + 4 },
    { sprite: moth, x: LANTERN.x + 6, y: LANTERN.y + 2, motion: { kind: 'drift', amp: 3, periodMs: 1700 } },
    { sprite: ifGlint, x: 38, y: COUNTER_Y - 7 },
    { sprite: ifLater(ifGlint, 'if6-glint-sampler', 3, 300), x: SAMPLER.x, y: SAMPLER.y - 1 },
    { sprite: ifStarBig, x: 52, y: 2, motion: { kind: 'twinkle', periodMs: 2300, min: 0.3 } },
    { sprite: ifStar, x: 25, y: 9, motion: { kind: 'twinkle', periodMs: 1800, phase: 0.4, min: 0.2 } },
    { sprite: ifStar, x: 40, y: 4, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.7, min: 0.2 } },
    { sprite: ifStar, x: 69, y: 5, motion: { kind: 'twinkle', periodMs: 2000, phase: 0.2, min: 0.25 } },
    { sprite: ifFirefly, x: 4, y: 50, motion: { kind: 'rise', amp: 5, periodMs: 3400, phase: 0.1 } },
    { sprite: ifFirefly, x: 29, y: 47, motion: { kind: 'rise', amp: 6, periodMs: 4100, phase: 0.5 } },
    { sprite: ifFirefly, x: 74, y: 53, motion: { kind: 'rise', amp: 5, periodMs: 3700, phase: 0.8 } },
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────────── */

const emblemIndexCrate: PixelSprite = {
  id: 'if-emblem-index-crate',
  name: 'if-emblem-index-crate',
  tags: ['scene', 'if'],
  blurb: "Lesson 6: a crate seen from above, eight fruits of four kinds in a grid. One box holds the market.",
  palette: IF_A_PALETTE,
  rows: [
    'hhhhhhhhhh',
    'hyGsRBbQqh',
    'hGgRrbuqPh',
    'hhhhhhhhhh',
    'hsRQqyGBbh',
    'hRrqPGgbuh',
    'hhhhhhhhhh',
    '.a......a.',
  ],
};

export const if6Finish: SceneArt = ifKeepsake(
  'if6-finish',
  'A golden acorn hanging from an oak twig, with a crate holding a grid of four kinds of fruit in its purple window and small sparkles around it.',
  emblemIndexCrate,
);

export const art: LessonArtSet = { opener: if6Opener, backdrop: ifBackdrop, finish: if6Finish };
