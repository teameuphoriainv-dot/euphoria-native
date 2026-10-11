/**
 * Business Strategy lesson 5 opener: launch night in the market square.
 *
 * Built on bsMarketSquare. Our stall opens under an orchid and gold awning with its price on a
 * board, the strategist as herald sounds the launch on a long trumpet hung with the house banner,
 * and the town answers: a buyer at the counter and a queue behind them, the plainest sign that a
 * product fits its market. The awning is the brightest broad surface; the lit windows behind sit a
 * step under it. Moving: notes rise from the trumpet and its banner flaps, the pennant flies, the
 * queue shuffles, a coin rises off the counter, the wall lanterns flicker and stars twinkle.
 */
import type { PixelSprite } from '../types';
import { bsBackdrop } from './bs-backdrop';
import { bsMoved, bsStar } from './bs-kit';
import { BS_COAT_BLUE, BS_COAT_GOLD, BS_COAT_GREEN, bsCoin, bsCoinStacks, bsFolk, bsMarketSquare, bsRecoloured } from './bs-kit-a';
import { bsKeepsake } from './bs1-finish';
import type { LessonArtSet, SceneArt } from './types';

const stall: PixelSprite = {
  id: 'bs5-stall',
  name: 'stall',
  tags: [],
  blurb: 'Our stall: a striped awning, a purple back cloth with a shelf of goods, a counter wearing the gold rook. Its shadow is the bottom row.',
  palette: { Z: '#110E17' },
  rows: [
    '.EEEEEEEEEEEEEEEEEEEEEEEEEE.',
    'PPyyPPyyPPyyPPyyPPyyPPyyPPyy',
    'PPyyPPyyPPyyPPyyPPyyPPyyPPyy',
    'PPyyPPyyPPyyPPyyPPyyPPyyPPyy',
    'PPyyPPyyPPyyPPyyPPyyPPyyPPyy',
    'PPyyPPyyPPyyPPyyPPyyPPyyPPyy',
    'ppGGppGGppGGppGGppGGppGGppGG',
    '.Og..pG..pG..pG..pG..pG..Og.',
    '.OgEEEEEEEEEEEEEEEEEEEEEEOg.',
    '.OgEEEEEEEEEEEEEEEEEEEEEEOg.',
    '.OgEEEEEEEEEEEEEEEEEEEEEEOg.',
    '.OgEEQEETEEqEEEEQEENEEqEEOg.',
    '.OgEEQqETtEqpEEEQqENnEqpEOg.',
    '.OgOOOOOOOOOOOOOOOOOOOOOOOg.',
    '.OgEEEEEEEEEEEEEEEEEEEEEEOg.',
    '.OgEEEEEEEEEEEEEEEEEEEEEEOg.',
    '.OgEEEEEEEEEEEEEEEEEEEEEEOg.',
    '.OgEqQEEEEEEEEEEEEEEETTEEOg.',
    '.OgEpqEEEEEEEEEEEEEEEtTEEOg.',
    'GGGGGGGGGGGGGGGGGGGGGGGGGGGG',
    'gggggggggggggggggggggggggggg',
    '.OOOOOOOOOOGOGOGOOOOOOOOOOO.',
    '.OOPPPPPPPPGGGGGPPPPPPPPPOO.',
    '.OOpppppppppGGGppppppppppOO.',
    '.OOpppppppppGGGppppppppppOO.',
    '.OOppppppppGGGGGpppppppppOO.',
    '.OOOOOOOOOOOOOOOOOOOOOOOOOO.',
    '.ZZZZZZZZZZZZZZZZZZZZZZZZZZ.',
  ],
};

const priceSign: PixelSprite = {
  id: 'bs5-price',
  name: 'price',
  tags: [],
  blurb: 'The price board hung under the awning: a gold coin.',
  rows: [
    '..D..',
    '.D.D.',
    'OOOOO',
    'OyGyO',
    'OGgGO',
    'OyGyO',
    'OOOOO',
  ],
};

const heraldRows = [
  '..........DDDD................',
  '.........DHHHHD..............y',
  '........DHHHHHHD............Oy',
  '........DHHHHSSS...........OGy',
  '........DHHHUSKS..........OGGy',
  '.........DHHSSSSSgyyyyyyyOGGGy',
  '.........DHHUSSS.GGGGGGGGGGGGy',
  '..........DUUSS....EPPPPPEGGGy',
  '...........wUUw..SSEPGyGPEOGGy',
  '........EGGPwwqE.q.EPGGGPE.OGy',
  '.......EpGPPPPPqq..EPPGPPE..Oy',
  '......EEppPPPPPqEqqEPGGGPE...y',
  '......EEppPPPPPqEEEEPPEPPE....',
  '.....EppPPPPGqE.....E...E.....',
  '.....EppPPPPPqE...............',
  '.....EppPPPPGqE...............',
  '.....EppPPPPPqE...............',
  '.....EppPPPPGqE...............',
  '.....EppPPPPPPqE..............',
  '....EppPPPPPPPqE..............',
  '....EppPPPPPPPqE..............',
  '....EppPPPPPPPPqE.............',
  '...EpppPPPPPPPPqE.............',
  '...EpppPPPPPPPPPqE............',
  '...EpppPPPPPPPPPqE............',
  '..EGGGGGGGGGGGGGGE............',
  '..EEEEEEEEEEEEEEEE............',
  '......DXD...DXD...............',
  '......DXD...DXD...............',
  '......DXXD..DXXD..............',
  '......DDDD..DDDD..............',
];

const herald: PixelSprite = {
  id: 'bs5-herald',
  name: 'herald',
  tags: [],
  blurb: 'The strategist as herald, facing right, sounding a long trumpet that carries the house banner; boots on the bottom row. The banner flaps.',
  palette: { S: '#C08552', U: '#9A6638', H: '#43291A' },
  rows: heraldRows,
  frames: [
    heraldRows,
    bsMoved(heraldRows, {
      12: '......EEppPPPPPqEEEEPE.EPE....',
      13: '.....EppPPPPGqE....E.....E....',
    }),
  ],
  frameMs: 560,
};

const note: PixelSprite = {
  id: 'bs5-note',
  name: 'note',
  tags: [],
  blurb: 'A note off the trumpet, for a rise layer.',
  rows: [
    '.yy',
    '.y.',
    'yy.',
  ],
};

const pennantRows = [
  'DE...',
  'DPPq.',
  'DPPPq',
  'DPP..',
  'D....',
  'D....',
];

const pennant: PixelSprite = {
  id: 'bs5-pennant',
  name: 'pennant',
  tags: [],
  blurb: 'The house pennant on the stall, lit: its pole foot is the bottom-left pixel.',
  rows: pennantRows,
  frames: [
    pennantRows,
    bsMoved(pennantRows, {
      1: 'DPq..',
      3: 'DPPq.',
    }),
    pennantRows,
    bsMoved(pennantRows, {
      1: 'DPPPq',
      2: 'DPPq.',
      3: 'DP...',
    }),
  ],
  frameMs: 560,
};

const lanternRows = [
  'DDD..',
  '..D..',
  '.DDD.',
  'D343D',
  'D454D',
  '.DDD.',
];

const lantern: PixelSprite = {
  id: 'bs5-lantern',
  name: 'lantern',
  tags: [],
  blurb: 'A lantern on an iron bracket, hung from a house wall; the flame flickers.',
  rows: lanternRows,
  frames: [
    lanternRows,
    bsMoved(lanternRows, {
      3: 'D434D',
      4: 'D545D',
    }),
    lanternRows,
    bsMoved(lanternRows, {
      3: 'D333D',
      4: 'D444D',
    }),
  ],
  frameMs: 460,
};

const buyer = bsRecoloured(bsFolk, 'bs5-buyer', BS_COAT_BLUE);
const queueGreen = bsRecoloured(bsFolk, 'bs5-queue-green', BS_COAT_GREEN, { S: '#F4CBA4', U: '#D6A87C', H: '#3A2418' });
const queueGold = bsRecoloured(bsFolk, 'bs5-queue-gold', BS_COAT_GOLD, { S: '#D6A87C', U: '#B07A4F', H: '#A79DB5' });
const queuePink = bsRecoloured(bsFolk, 'bs5-queue-pink', { E: 'f', q: 'F', P: 'F', p: 'f' }, { S: '#9A6638', U: '#7A4E2A', H: '#1A1523' });

export const bs5Opener: SceneArt = {
  id: 'bs5-opener',
  label: 'On launch night in the market square a herald sounds a trumpet beside a striped stall, and townsfolk queue up to buy.',
  width: 80,
  height: 60,
  base: bsMarketSquare,
  layers: [
    { sprite: bsStar, x: 10, y: 3, motion: { kind: 'twinkle', periodMs: 2100, min: 0.2 } },
    { sprite: bsStar, x: 40, y: 5, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.4, min: 0.2 } },
    { sprite: bsStar, x: 70, y: 2, motion: { kind: 'twinkle', periodMs: 2300, phase: 0.75, min: 0.2 } },
    { sprite: lantern, x: 2, y: 26 },
    { sprite: lantern, x: 74, y: 27 },
    { sprite: pennant, x: 43, y: 17 },
    { sprite: stall, x: 30, y: 23 },
    { sprite: priceSign, x: 51, y: 30 },
    { sprite: bsCoinStacks, x: 39, y: 38 },
    { sprite: bsCoin, x: 44, y: 36, motion: { kind: 'rise', amp: 6, periodMs: 2300, phase: 0.2 } },
    { sprite: herald, x: 0, y: 19 },
    { sprite: note, x: 28, y: 15, motion: { kind: 'rise', amp: 6, periodMs: 2000 } },
    { sprite: note, x: 24, y: 17, motion: { kind: 'rise', amp: 5, periodMs: 2600, phase: 0.5 } },
    { sprite: buyer, x: 50, y: 38, motion: { kind: 'bob', amp: 1, periodMs: 1800 } },
    { sprite: queueGreen, x: 59, y: 37, motion: { kind: 'bob', amp: 1, periodMs: 2100, phase: 0.3 } },
    { sprite: queueGold, x: 66, y: 37, motion: { kind: 'bob', amp: 1, periodMs: 1900, phase: 0.6 } },
    { sprite: queuePink, x: 73, y: 37, motion: { kind: 'bob', amp: 1, periodMs: 2400, phase: 0.15 } },
  ],
};

const emblem: PixelSprite = {
  id: 'bs5-emblem-horn',
  name: 'emblem-horn',
  tags: [],
  blurb: "Lesson 5 emblem, 16x16: the herald's gold trumpet hung with the purple house banner.",
  rows: [
    '................',
    '..............Oy',
    '.............OGy',
    '............OGGy',
    '...........OGGGy',
    'O.yyyyyyyyOGGGGy',
    'OGGGGGGGGGGGGGGy',
    '.OOOOOOOOOOGGGGy',
    '..EPPPPPE..OGGGy',
    '..EPGyGPE...OGGy',
    '..EPGGGPE....OGy',
    '..EPPGPPE.....Oy',
    '..EPGGGPE.......',
    '..EPPEPPE.......',
    '..EPE.EPE.......',
    '..EE...EE.......',
  ],
};

export const bs5Finish: SceneArt = bsKeepsake(
  'bs5-finish',
  "A purple house banner on a gold rod, its roundel showing a gold herald's trumpet hung with a purple banner.",
  emblem,
);

export const art: LessonArtSet = { opener: bs5Opener, backdrop: bsBackdrop, finish: bs5Finish };
