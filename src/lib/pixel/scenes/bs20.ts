/**
 * Business Strategy lesson 20 opener: the house owns no goods, only the place where others trade.
 *
 * Built on bsMarketSquare. In the middle of the square stands the house's platform, a stage under an
 * awning striped in orchid and gold. Makers in teal carry their wares up the steps on the left, buyers
 * in gold come up on the right with coin in hand, and they meet in the middle, where the house's
 * strongbox takes its small cut of every trade. Above the awning hangs the house sign: two arrows
 * chasing each other round, teal and gold, more makers bringing more buyers bringing more makers. The
 * awning and the sign are the brightest marks. Moving: a spark runs round the sign, a coin rises from
 * the strongbox, the makers and buyers shift their weight and stars twinkle.
 */
import type { PixelSprite } from '../types';
import { bsBackdrop } from './bs-backdrop';
import { bsMoved, bsStar } from './bs-kit';
import { BS_COAT_GOLD, BS_COAT_TEAL, bsCoin, bsFolk, bsMarketSquare, bsRecoloured } from './bs-kit-a';
import { bsKeepsake } from './bs1-finish';
import type { LessonArtSet, SceneArt } from './types';

const plankRow = 'ggggggggO'.repeat(4) + 'gggg';

const stage: PixelSprite = {
  id: 'bs20-stage',
  name: 'stage',
  tags: [],
  blurb: "The house's platform: an awning striped orchid and gold on two posts, over a plank stage with steps at either end. People on the stage stand with their feet on row 19; the steps come down to the cobbles on row 26.",
  palette: { Z: '#110E17' },
  rows: [
    '..yGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGg..',
    '..OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO..',
    `..E${'PPPGGG'.repeat(7)}E..`,
    `..E${'PPPGGG'.repeat(7)}E..`,
    `..E${'pPpgGg'.repeat(7)}E..`,
    '....pGOg..p..g..p..g..p..g..p..g..p..g..pGOg....',
    '.....GO..................................GO.....',
    '.....GO..................................GO.....',
    '.....GO..................................GO.....',
    '.....GO..................................GO.....',
    '.....GO..................................GO.....',
    '.....GO..................................GO.....',
    '.....GO..................................GO.....',
    '.....GO..................................GO.....',
    '.....GO..................................GO.....',
    '.....GO..................................GO.....',
    '.....GO..................................GO.....',
    '.....GO..................................GO.....',
    '.....GO..................................GO.....',
    '.....GO..................................GO.....',
    '....yGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGg....',
    '....OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO....',
    `..yG${plankRow}Gg..`,
    `..OO${plankRow}OO..`,
    `yGgg${plankRow}ggGg`,
    'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
    'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  ],
};

/** The ring of the sign, clockwise from the teal arrow's tail to the gold arrow's head, for the running spark. */
const RING: readonly (readonly [number, number])[] = [
  [3, 4], [4, 3], [5, 2], [6, 2], [7, 2], [8, 2], [9, 2], [10, 3], [11, 4], [12, 5], [12, 6], [12, 7],
  [11, 10], [10, 11], [9, 12], [8, 12], [7, 12], [6, 12], [5, 12], [4, 11], [3, 10], [2, 9], [2, 8], [2, 7],
];

const signRows = [
  '....GGGGGGG....',
  '..GGKKKKKKKOO..',
  '.GKKKTTTTTKKKO.',
  '.GKKTKKKKKTKKO.',
  'GKKTKKKKKKKTKKO',
  'GKKKKKKKKKKKTKO',
  'GKyKKKKyKKKKTKO',
  'GyyyKKyGgKKmTmO',
  'OKGKKKKgKKKKmKO',
  'OKGKKKKKKKKKKKO',
  'OKKGKKKKKKKGKKO',
  '.OKKGKKKKKGKKO.',
  '.OKKKGGGGGKKKO.',
  '..OOKKKKKKKOO..',
  '....OOOOOOO....',
  '....D.....D....',
];

/** The sign with the spark at ring point `k`. */
function signFrame(k: number): string[] {
  const [x, y] = RING[k];
  return bsMoved(signRows, { [y]: signRows[y].slice(0, x) + 'W' + signRows[y].slice(x + 1) });
}

const sign: PixelSprite = {
  id: 'bs20-sign',
  name: 'sign',
  tags: [],
  blurb: "The house sign hung above the awning on two short chains (bottom row): a teal arrow and a gold arrow chasing each other round a coin, the flywheel of a two-sided market. A spark runs round it.",
  rows: signRows,
  frames: Array.from({ length: RING.length / 2 }, (_, i) => signFrame(i * 2)),
  frameMs: 260,
};

const strongbox: PixelSprite = {
  id: 'bs20-strongbox',
  name: 'strongbox',
  tags: [],
  blurb: "The house's strongbox on the stage, standing on its bottom row, a slot in its lid.",
  rows: [
    '.OOOOO.',
    'OEqKqEO',
    'OPPPPpO',
    'OPPyPpO',
    'OOOOOOO',
  ],
};

const makerRows = [
  '..DDD..',
  '.DHHHD.',
  '.HHHHH.',
  '.SKSKS.',
  '.SSSSS.',
  '..SUS..',
  'SOgggOS',
  'qOgygOp',
  'qOOOOOp',
  '.qPPPp.',
  '.DX.XD.',
  '.DD.DD.',
];

const buyerRows = [
  '..DDD..',
  '.DHHHD.',
  '.HHHHH.',
  '.SKSKS.',
  '.SSSSSy',
  '..SUS.S',
  '.qPwPpp',
  'qPPwPPp',
  'SqPPPp.',
  '.qPPPp.',
  '.DX.XD.',
  '.DD.DD.',
];

const maker = bsRecoloured(
  { ...bsFolk, id: 'bs20-maker', rows: makerRows, blurb: 'A maker carrying a crate of their wares, facing us, feet on the bottom row.' },
  'bs20-maker-teal',
  BS_COAT_TEAL,
);
const makerLight = bsRecoloured(maker, 'bs20-maker-teal-light', {}, { S: '#F4CBA4', U: '#D6A87C', H: '#3A2418' });
const buyer = bsRecoloured(
  { ...bsFolk, id: 'bs20-buyer', rows: buyerRows, blurb: 'A buyer holding a coin up, facing us, feet on the bottom row.' },
  'bs20-buyer-gold',
  BS_COAT_GOLD,
);
const buyerLight = bsRecoloured(buyer, 'bs20-buyer-gold-light', {}, { S: '#F4CBA4', U: '#D6A87C', H: '#3A2418' });

export const bs20Opener: SceneArt = {
  id: 'bs20-opener',
  label: 'In a market square makers in teal and buyers in gold climb onto the house platform to trade, under a sign of two arrows chasing each other round.',
  width: 80,
  height: 60,
  base: bsMarketSquare,
  layers: [
    { sprite: bsStar, x: 10, y: 3, motion: { kind: 'twinkle', periodMs: 2100, min: 0.2 } },
    { sprite: bsStar, x: 63, y: 4, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.4, min: 0.2 } },
    { sprite: bsStar, x: 74, y: 1, motion: { kind: 'twinkle', periodMs: 2300, phase: 0.75, min: 0.2 } },
    { sprite: sign, x: 32, y: 0 },
    { sprite: stage, x: 16, y: 16 },
    { sprite: strongbox, x: 37, y: 31 },
    { sprite: bsCoin, x: 39, y: 29, motion: { kind: 'rise', amp: 6, periodMs: 2300 } },
    { sprite: maker, x: 27, y: 24, motion: { kind: 'bob', amp: 1, periodMs: 2100 } },
    { sprite: buyer, x: 47, y: 24, motion: { kind: 'bob', amp: 1, periodMs: 2300, phase: 0.5 } },
    { sprite: makerLight, x: 8, y: 35, motion: { kind: 'bob', amp: 1, periodMs: 1900, phase: 0.2 } },
    { sprite: maker, x: 1, y: 38, motion: { kind: 'bob', amp: 1, periodMs: 2500, phase: 0.6 } },
    { sprite: buyerLight, x: 65, y: 35, motion: { kind: 'bob', amp: 1, periodMs: 2000, phase: 0.3 } },
    { sprite: buyer, x: 72, y: 38, motion: { kind: 'bob', amp: 1, periodMs: 2400, phase: 0.8 } },
  ],
};

const emblem: PixelSprite = {
  id: 'bs20-emblem-flywheel',
  name: 'emblem-flywheel',
  tags: [],
  blurb: 'Lesson 20 emblem, 16x16: a teal arrow and a gold arrow chasing each other round a gold coin.',
  rows: [
    '................',
    '.......TT.......',
    '....TTTmmTTT....',
    '...TTmm..mmTT...',
    '..TTm......mTT..',
    '..Tm........mT..',
    '...m...yG...m...',
    '..GG..yWGg.TTTT.',
    '.GGGG.GGgg..TT..',
    '...G...gg...G...',
    '..gG........Gg..',
    '..ggG......Ggg..',
    '...ggGG..GGgg...',
    '....gggGGggg....',
    '.......gg.......',
    '................',
  ],
};

export const bs20Finish: SceneArt = bsKeepsake(
  'bs20-finish',
  'A purple house banner on a gold rod, its roundel showing a teal arrow and a gold arrow chasing each other round a gold coin.',
  emblem,
);

export const art: LessonArtSet = { opener: bs20Opener, backdrop: bsBackdrop, finish: bs20Finish };
