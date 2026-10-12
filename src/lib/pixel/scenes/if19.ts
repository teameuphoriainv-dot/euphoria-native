/**
 * Investing Fundamentals lesson 19, Behavioral Investing Pitfalls: the worst move is often the urge to
 * do something.
 *
 * Late at night, out of a cottage whose lamp is still lit, the investor has come out to the row of
 * coin sprouts planted earlier and, unable to wait, yanked one up to see if it is growing: they hold it
 * high by the stem, its coin and bare roots dangling, soil still falling off into the hole it left,
 * while every sprout left alone down the row is doing fine. A red alarm mark flashes over their head:
 * fear, panic selling, checking too often, all of it in one gesture. Soil falls (frames), smoke rises
 * from the chimney, the lamp flickers, a coin glints, seed fluff drifts and the stars twinkle.
 *
 * The keepsake's emblem is the uprooted sprout with its alarm mark.
 */
import type { PixelSprite } from '../types';
import {
  IF_PALETTE,
  ifCompose,
  ifFirefly,
  ifGlint,
  ifInvestor,
  ifKeepsake,
  ifLater,
  ifSeedMote,
  ifStage,
  ifStar,
  ifStarBig,
} from './if-kit';
import { ifBackdrop } from './if-backdrop';
import { ifBedOf, ifCoinSprout } from './if-kit-a';
import { ifFall } from './if-kit-c';
import type { LessonArtSet, SceneArt } from './types';

/* ── the cottage ───────────────────────────────────────────────────────────────────────────────── */

/**
 * The investor's cottage, gable end on, 20x27: a shingled roof lit on its left slope, a stone chimney,
 * dark plaster walls, a four-pane window with the lamp still lit inside, and a plank door. Its walls
 * are kept dark so the lit window, not the house, is what the eye finds.
 */
const cottage: PixelSprite = {
  id: 'if19-cottage',
  name: 'if19-cottage',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [
    '.........ha.........',
    '........hAAa..xXD...',
    '.......hAAAAa.XDD...',
    '......hAAaAAAaXDD...',
    '.....hAAAAAAAAXDD...',
    '....hAAAaAAAAAXDD...',
    '...hAAAAAAAAAAAAa...',
    '..hAAaAAAAAAaAAAAa..',
    '.hAAAAAAAAAAAAAAAAa.',
    'haaaaaaaaaaaaaaaaaaa',
    '.XDDDDDDDDDDDDDDDDk.',
    '.XDDDDDDDDDDDDDDDDk.',
    '.XDaaaaaaaDDDDDDDDk.',
    '.XDa54a54aDDDDDDDDk.',
    '.XDa43a43aDDDDDDDDk.',
    '.XDaaaaaaaDDDDDDDDk.',
    '.XDa54a54aDDDDDDDDk.',
    '.XDa43a43aDaaaaaaDk.',
    '.XDhhhhhhhDahAaAaDk.',
    '.XDDDDDDDDDahAaAaDk.',
    '.XDDDDDDDDDahAaAaDk.',
    '.XDDDDDDDDDahAaAaDk.',
    '.XDDDDDDDDDahAayaDk.',
    '.XDDDDDDDDDahAaAaDk.',
    '.XDDDDDDDDDahAaAaDk.',
    '.XDDDDDDDDDahAaAaDk.',
    '.kkkkkkkkkkahAaAakk.',
  ],
};

/** The lamp behind the panes, brighter: twinkled over the window so the light flickers. */
const lamp: PixelSprite = {
  id: 'if19-lamp',
  name: 'if19-lamp',
  tags: ['scene', 'if'],
  rows: [
    '.5..5',
    '55.55',
    '.....',
    '.5..5',
    '55.55',
  ],
};

const smoke: PixelSprite = {
  id: 'if19-smoke',
  name: 'if19-smoke',
  tags: ['scene', 'if'],
  rows: [
    '.X.',
    'XxX',
  ],
};

/* ── the pulled sprout ─────────────────────────────────────────────────────────────────────────── */

/**
 * A coin sprout pulled out of the bed, 7x12, held up by the stem: limp leaves above the fist, the coin,
 * a clod of soil and the bare roots hanging below it. Drawn in front of the investor's hand.
 */
const pulledSprout: PixelSprite = {
  id: 'if19-pulled-sprout',
  name: 'if19-pulled-sprout',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [
    '..mNn..',
    '.mNnNn.',
    'mNn.nNn',
    '...n...',
    '...n...',
    '..OnO..',
    '.OyGgO.',
    '..OOO..',
    '.cecec.',
    '.h.h.h.',
    'h..h..h',
    'h..h..h',
  ],
};

/** The hole it left in the bed, 7x3, with the soil it threw up on either side. */
const hole: PixelSprite = {
  id: 'if19-hole',
  name: 'if19-hole',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [
    '.c...c.',
    'cdddddc',
    '.ddddd.',
  ],
};

/** Soil shaken off the roots, falling all the way down into the hole. */
const crumbs = ifFall(
  'if19-crumbs',
  5,
  8,
  ['c..e', '.c..'],
  [[0, 0], [0, 1], [1, 3], [1, 5], [1, 6], [-9, -9], [-9, -9]],
  190,
  2,
  IF_PALETTE,
);

/** The alarm over the investor's head, 2x5: red, so it reads on the orchid band. */
const alarm: PixelSprite = {
  id: 'if19-alarm',
  name: 'if19-alarm',
  tags: ['scene', 'if'],
  rows: [
    'sR',
    'Rr',
    'Rr',
    '..',
    'Rr',
  ],
};

/* ── the opener ────────────────────────────────────────────────────────────────────────────────── */

const COTTAGE = { x: 0, y: 19 } as const;
const INVESTOR = { x: 21, y: 25 } as const;
/** Held up by the stem, which runs up just past the fist (the hand is at the investor's (12, 11)). */
const PULLED = { x: INVESTOR.x + 11, y: INVESTOR.y + 8 } as const;
/** The bed runs across the foreground, in front of the investor, so the roots hang well clear of it. */
const BED = { x: 30, y: 50 } as const;
/** The sprouts left alone, every nine pixels down the bed. */
const SPROUTS = [42, 51, 60, 69] as const;

const base = ifCompose('if19-opener-base', 80, 60, [
  { sprite: ifStage, x: 0, y: 0 },
  { sprite: cottage, x: COTTAGE.x, y: COTTAGE.y },
  { sprite: ifBedOf('if19-bed', 48), x: BED.x, y: BED.y },
  { sprite: hole, x: PULLED.x, y: BED.y - 1 },
  ...SPROUTS.map((x) => ({ sprite: ifCoinSprout, x, y: BED.y - 6 })),
  { sprite: ifInvestor, x: INVESTOR.x, y: INVESTOR.y },
  // The sprout after the investor: held up in front of the fist, clear of the body.
  { sprite: pulledSprout, x: PULLED.x, y: PULLED.y },
]);

export const if19Opener: SceneArt = {
  id: 'if19-opener',
  label: 'Late at night outside a cottage with a lit window, an investor has pulled a coin sprout out of its bed to check on it, roots dangling and an alarm mark over their head, while the sprouts left alone grow on.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: crumbs, x: PULLED.x + 1, y: PULLED.y + 12 },
    { sprite: alarm, x: INVESTOR.x + 7, y: INVESTOR.y - 7, motion: { kind: 'twinkle', periodMs: 900, min: 0.15 } },
    { sprite: lamp, x: COTTAGE.x + 4, y: COTTAGE.y + 13, motion: { kind: 'twinkle', periodMs: 1700, min: 0.15 } },
    { sprite: smoke, x: COTTAGE.x + 14, y: COTTAGE.y - 1, motion: { kind: 'rise', amp: 6, periodMs: 3200 } },
    { sprite: smoke, x: COTTAGE.x + 15, y: COTTAGE.y - 4, motion: { kind: 'rise', amp: 6, periodMs: 3200, phase: 0.5 } },
    { sprite: ifLater(ifGlint, 'if19-glint', 2, 300), x: SPROUTS[1] + 1, y: BED.y - 2 },
    { sprite: ifSeedMote, x: SPROUTS[2] + 3, y: BED.y - 9, motion: { kind: 'rise', amp: 6, periodMs: 3600, phase: 0.3 } },
    { sprite: ifStarBig, x: 36, y: 6, motion: { kind: 'twinkle', periodMs: 2300, min: 0.3 } },
    { sprite: ifStar, x: 50, y: 3, motion: { kind: 'twinkle', periodMs: 1800, phase: 0.4, min: 0.2 } },
    { sprite: ifStar, x: 63, y: 10, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.7, min: 0.2 } },
    { sprite: ifStar, x: 74, y: 4, motion: { kind: 'twinkle', periodMs: 2900, phase: 0.2, min: 0.2 } },
    { sprite: ifFirefly, x: 24, y: 53, motion: { kind: 'rise', amp: 5, periodMs: 3500, phase: 0.1 } },
    { sprite: ifFirefly, x: 46, y: 57, motion: { kind: 'rise', amp: 6, periodMs: 4100, phase: 0.55 } },
    { sprite: ifFirefly, x: 71, y: 54, motion: { kind: 'rise', amp: 5, periodMs: 3800, phase: 0.8 } },
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────────── */

const emblemPulled: PixelSprite = {
  id: 'if-emblem-pulled-sprout',
  name: 'if-emblem-pulled-sprout',
  tags: ['scene', 'if'],
  blurb: "Lesson 19: a sprout pulled up by its roots, with an alarm mark. The urge to dig up what is growing.",
  palette: IF_PALETTE,
  rows: [
    '.mN.Nn..sR',
    'mNNnNNn.Rr',
    '..mnn...Rr',
    '...n....Rr',
    '..cnc.....',
    '.h.h.h..Rr',
    'h..h..h...',
    '...h......',
  ],
};

export const if19Finish: SceneArt = ifKeepsake(
  'if19-finish',
  'A golden acorn hanging from an oak twig, with a sprout pulled up by its roots and a red alarm mark in its purple window and small sparkles around it.',
  emblemPulled,
);

export const art: LessonArtSet = { opener: if19Opener, backdrop: ifBackdrop, finish: if19Finish };
