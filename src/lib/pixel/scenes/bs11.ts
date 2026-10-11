/**
 * Business Strategy lesson 11 opener: the tavern that wins its customers, then keeps them.
 *
 * Built on bsTavern. A newcomer in teal stands in the open doorway, the top of the funnel chalked on
 * the slate that hangs from the beam: many come in at the top, fewer at each stage, one coin out of
 * the spout, and a gold arrow carrying it back round to the top, because the customer who returns is
 * the one who pays most. The strategist points at the slate. By the hearth the regulars stand at their
 * table under a rail of their own mugs, and their hearts rise. The fire is the warmest mark, the chalk
 * the brightest broad one. Moving: a customer drops through the funnel, comes out as a coin and goes
 * back round, the strategist points and blinks, the fire burns, the regulars shift and hearts rise over
 * them, and a star twinkles outside the door.
 */
import type { PixelSprite } from '../types';
import { bsBackdrop } from './bs-backdrop';
import { bsMoved, bsStar } from './bs-kit';
import { BS_COAT_BLUE, BS_COAT_GOLD, BS_COAT_GREEN, BS_COAT_TEAL, bsFolk, bsRecoloured, bsStrategistStand } from './bs-kit-a';
import { bsFolkBack, bsHearth, bsHearthFire, bsTavern, bsTavernDoor } from './bs-kit-b';
import { bsKeepsake } from './bs1-finish';
import type { LessonArtSet, SceneArt } from './types';

const funnelRows = [
  '...D..............D...',
  '...D..............D...',
  'OggggggggggggggggggggO',
  'OKKKKKKKKKKKKKKKKKKKKO',
  'OKKwKwKwKwKwKwKKKyKKKO',
  'OKKKKKKKKKKKKKKKyyyyKO',
  'OKxxxxxxxxxxxxxxKyKyKO',
  'OKxxxxxxxxxxxxxxKKKyKO',
  'OKKKKKKKKKKKKKKKKKKyKO',
  'OKKKqqqqqqqqqqKKKKKyKO',
  'OKKKqqqqqqqqqqKKKKKyKO',
  'OKKKKKKKKKKKKKKKKKKyKO',
  'OKKKKKBBBBBBKKKKKKKyKO',
  'OKKKKKBBBBBBKKKKKKKyKO',
  'OKKKKKKKKKKKKKKKKKKyKO',
  'OKKKKKKKmmKKKKKKKKKyKO',
  'OKKKKKKKyGKyyyyyyyyyKO',
  'OKKKKKKKGgKKKKKKKKKKKO',
  'OOOOOOOOOOOOOOOOOOOOOO',
];

const funnel: PixelSprite = {
  id: 'bs11-funnel',
  name: 'funnel',
  tags: [],
  blurb: 'The customer funnel chalked on a slate hung from the beam by two chains: prospects at the top, a band for each stage, a coin out of the spout and a gold arrow from the coin back up to the top. A customer drops through, comes out as a coin and goes back round.',
  rows: funnelRows,
  frames: [
    funnelRows,
    bsMoved(funnelRows, {
      5: 'OKKKKKKKWKKKKKKKyyyyKO',
    }),
    bsMoved(funnelRows, {
      8: 'OKKKKKKKWKKKKKKKKKKyKO',
    }),
    bsMoved(funnelRows, {
      11: 'OKKKKKKKWKKKKKKKKKKyKO',
    }),
    bsMoved(funnelRows, {
      14: 'OKKKKKKKWKKKKKKKKKKyKO',
    }),
    bsMoved(funnelRows, {
      16: 'OKKKKKKKWGKyyyyyyyyyKO',
      17: 'OKKKKKKKGyKKKKKKKKKKKO',
    }),
    bsMoved(funnelRows, {
      11: 'OKKKKKKKKKKKKKKKKKKWKO',
    }),
    bsMoved(funnelRows, {
      5: 'OKKKKKKKKKKKKKKKyWyyKO',
    }),
  ],
  frameMs: 400,
};

const mugs: PixelSprite = {
  id: 'bs11-mugs',
  name: 'mugs',
  tags: [],
  blurb: "The regulars' own mugs, each a different colour, hung from a rail under the beam.",
  rows: [
    'OOOOOOOOOOOOOOOOOOOOOOOOO',
    '..D...D...D...D...D...D..',
    '.xx..qq..BB..mm..GG..FF..',
    '.xXD.qpD.BbD.mnD.GgD.FfD.',
    '.XX..pp..bb..nn..gg..ff..',
  ],
};

const table: PixelSprite = {
  id: 'bs11-table',
  name: 'table',
  tags: [],
  blurb: "The regulars' table, mugs on top; the regulars stand on its near side, drawn after it.",
  palette: { Z: '#110E17' },
  rows: [
    '.....xx.......qq......GG......',
    '.....xXD......qpE.....GgO.....',
    '.....XX.......pp......gg......',
    '..gggggggggggggggggggggggggg..',
    '.gggggggggggggggggggggggggggg.',
    'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
    'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
    '.OO........................OO.',
    '.OO........................OO.',
    '.OO........................OO.',
    'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  ],
};

const heart: PixelSprite = {
  id: 'bs11-heart',
  name: 'heart',
  tags: [],
  blurb: 'A pink heart, for a rise layer over a regular: a customer who keeps coming back.',
  rows: [
    'FW.FF',
    'FFFFf',
    '.FFf.',
    '..f..',
  ],
};

const newcomer = bsRecoloured(bsFolk, 'bs11-newcomer', BS_COAT_TEAL, { S: '#F4CBA4', U: '#D6A87C', H: '#3A2418' });
const regularGold = bsRecoloured(bsFolkBack, 'bs11-regular-gold', BS_COAT_GOLD);
const regularGreen = bsRecoloured(bsFolkBack, 'bs11-regular-green', BS_COAT_GREEN, { H: '#3A2418' });
const regularBlue = bsRecoloured(bsFolkBack, 'bs11-regular-blue', BS_COAT_BLUE, { H: '#2A1B12' });

export const bs11Opener: SceneArt = {
  id: 'bs11-opener',
  label: 'In a tavern a strategist points at a chalk funnel of customers, as a newcomer steps in at the door and regulars gather by the fire under a rail of their own mugs.',
  width: 80,
  height: 60,
  base: bsTavern,
  layers: [
    { sprite: bsTavernDoor, x: 1, y: 19 },
    { sprite: bsStar, x: 6, y: 23, motion: { kind: 'twinkle', periodMs: 2300, min: 0.2 } },
    { sprite: newcomer, x: 4, y: 30, motion: { kind: 'bob', amp: 1, periodMs: 2000 } },
    { sprite: funnel, x: 13, y: 7 },
    { sprite: bsHearth, x: 56, y: 16 },
    { sprite: bsHearthFire, x: 62, y: 33 },
    { sprite: mugs, x: 54, y: 7 },
    { sprite: table, x: 48, y: 39 },
    { sprite: regularGold, x: 50, y: 42, motion: { kind: 'bob', amp: 1, periodMs: 2400, phase: 0.2 } },
    { sprite: regularGreen, x: 59, y: 43, motion: { kind: 'bob', amp: 1, periodMs: 2100, phase: 0.6 } },
    { sprite: regularBlue, x: 68, y: 42, motion: { kind: 'bob', amp: 1, periodMs: 2600 } },
    { sprite: heart, x: 52, y: 36, motion: { kind: 'rise', amp: 6, periodMs: 2600 } },
    { sprite: heart, x: 72, y: 35, motion: { kind: 'rise', amp: 5, periodMs: 3000, phase: 0.5 } },
    { sprite: bsStrategistStand, x: 32, y: 13 },
  ],
};

const emblem: PixelSprite = {
  id: 'bs11-emblem-funnel',
  name: 'emblem-funnel',
  tags: [],
  blurb: 'Lesson 11 emblem, 16x16: a gold funnel with a coin falling out, and an orchid arrow looping back to the top.',
  rows: [
    '..w..w..w..q....',
    '..........qqqq..',
    'OOOOOOOOOOOq.q..',
    'OyGGGGGGGgO..q..',
    '.OyGGGGGgO...q..',
    '..OyGGGgO....q..',
    '...OyGgO.....q..',
    '....OGO......q..',
    '....OGO......q..',
    '....OgO......q..',
    '.............q..',
    '....OO.......q..',
    '...OyGO......q..',
    '...OGgO.qqqqqq..',
    '....OO..........',
    '................',
  ],
};

export const bs11Finish: SceneArt = bsKeepsake(
  'bs11-finish',
  'A purple house banner on a gold rod, its roundel showing a gold funnel with a coin falling out and an arrow looping back round to the top.',
  emblem,
);

export const art: LessonArtSet = { opener: bs11Opener, backdrop: bsBackdrop, finish: bs11Finish };
