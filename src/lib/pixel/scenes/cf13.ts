/**
 * Corporate Finance lesson 13, Leveraged Buyouts & Private Equity: buying a whole company with
 * mostly borrowed money.
 *
 * Opener: the one opener in this batch set outdoors, a building yard at dusk with the city behind.
 * A tower crane lowers a whole company (head office, cornice and all) onto a capital stack: two
 * wide blue blocks of senior debt stamped with the bank, a teal block of mezzanine, and only a thin
 * orchid slice of the buyer's own equity on top. The private equity buyer, silver-haired in
 * charcoal, points at the stack. Only small layers move: the company on its cable, the crane's
 * warning light, windows lighting in the city, a glint on the equity, two birds.
 *
 * Keepsake: a company standing on its capital stack.
 */
import type { PixelSprite } from '../types';
import { cfBackdrop } from './cf-backdrop';
import { cfKeepsake } from './cf1-finish';
import { CF_PALETTE, cfCompose, cfShadowShort, cfSignFinance } from './cf-kit';
import { cfExec, cfRecolor } from './cf-kit-a';
import type { LessonArtSet, SceneArt } from './types';

/** Dusk: navy at the top through orchid and rose to ember on the horizon, then the yard. */
const SKY: readonly (readonly [tone: string, rows: number])[] = [['c', 10], ['C', 10], ['E', 10], ['I', 9], ['1', 9], ['D', 1], ['k', 11]];

const yard: PixelSprite = {
  id: 'cf13-yard',
  name: 'cf13-yard',
  tags: ['scene', 'cf13'],
  blurb: 'A dusk sky over a dark yard.',
  palette: CF_PALETTE,
  rows: SKY.flatMap(([tone, rows]) => Array.from({ length: rows }, () => tone.repeat(80))),
};

/** The city behind: blocks of different heights, a few windows still lit. Row 0 sits at scene row 30. */
const SKYLINE: readonly (readonly [from: number, to: number, top: number])[] = [
  [0, 7, 6], [8, 13, 7], [14, 19, 9], [20, 27, 4], [28, 35, 8], [36, 41, 1],
  [42, 49, 7], [50, 57, 3], [58, 63, 10], [64, 71, 5], [72, 79, 2],
];
const CITY_WINDOWS: readonly (readonly [number, number])[] = [
  [2, 9], [5, 12], [10, 10], [16, 12], [48, 9], [39, 9], [47, 11], [52, 6], [55, 10], [61, 13], [68, 8], [74, 5], [77, 9], [75, 13],
];
const skylineTop = (x: number) => SKYLINE.find(([from, to]) => x >= from && x <= to)?.[2] ?? 18;

const city: PixelSprite = {
  id: 'cf13-city',
  name: 'cf13-city',
  tags: ['scene', 'cf13'],
  blurb: 'A dark city skyline with a few lit windows.',
  rows: Array.from({ length: 18 }, (_, y) =>
    Array.from({ length: 80 }, (_, x) => {
      if (y < skylineTop(x)) return '.';
      return CITY_WINDOWS.some(([wx, wy]) => wx === x && wy === y) ? 'O' : 'K';
    }).join(''),
  ),
};

/** The windows that light up in turn: some of the same windows, brighter. */
const cityLit: PixelSprite = {
  id: 'cf13-opener-city-lit',
  name: 'cf13-opener-city-lit',
  tags: ['scene', 'cf13'],
  rows: Array.from({ length: 18 }, (_, y) =>
    Array.from({ length: 80 }, (_, x) => (CITY_WINDOWS.some(([wx, wy], i) => i % 2 === 0 && wx === x && wy === y) ? 'y' : '.')).join(''),
  ),
};

/** A block of the capital stack: an edge colour, a lit top and left edge, a face. */
function slab(id: string, width: number, height: number, lit: string, face: string, edge: string): PixelSprite {
  return {
    id,
    name: id,
    tags: ['scene', 'cf13'],
    palette: CF_PALETTE,
    rows: [
      `${edge}${lit.repeat(width - 2)}${edge}`,
      ...Array.from({ length: height - 2 }, () => `${edge}${lit}${face.repeat(width - 3)}${edge}`),
      edge.repeat(width),
    ],
  };
}

const seniorLow = slab('cf13-senior-low', 26, 9, 'B', 'b', 'C');
const seniorHigh = slab('cf13-senior-high', 22, 9, 'B', 'b', 'C');
const mezzanine = slab('cf13-mezzanine', 18, 6, 'T', 't', 'n');
const equity = slab('cf13-equity', 12, 4, 'q', 'P', 'E');

/** The bank, in white, stamped on each block of senior debt: this money is borrowed. */
const bankMark = cfRecolor(cfSignFinance, 'cf13-bank-mark', { B: 'w', b: 'x' });

/** The tower crane: truss jib and counter-jib, a lattice mast, its cab, footing and counterweight. */
const JIB = { from: 0, to: 54, y: 7 } as const;
const jib: PixelSprite = {
  id: 'cf13-jib',
  name: 'cf13-jib',
  tags: ['scene', 'cf13'],
  rows: [
    'G'.repeat(JIB.to - JIB.from + 1),
    Array.from({ length: JIB.to - JIB.from + 1 }, (_, x) => (x % 4 === 0 ? 'g' : '.')).join(''),
    'g'.repeat(JIB.to - JIB.from + 1),
  ],
};
const MAST_BRACE: readonly string[] = ['GGGg', 'Gg.g', 'G.gg', 'G..g'];
const mast: PixelSprite = {
  id: 'cf13-mast',
  name: 'cf13-mast',
  tags: ['scene', 'cf13'],
  rows: ['.OO.', ...Array.from({ length: 5 }, () => '.Gg.'), ...Array.from({ length: 46 }, (_, r) => MAST_BRACE[r % 4] ?? 'G..g')],
};
const cab: PixelSprite = { id: 'cf13-cab', name: 'cf13-cab', tags: ['scene', 'cf13'], rows: ['GGGg', 'GBBg', 'GBbg', 'gggg'] };
const counterweight: PixelSprite = { id: 'cf13-counterweight', name: 'cf13-counterweight', tags: ['scene', 'cf13'], rows: ['xxxxx', 'XXXXD', 'XXXXD', 'XXXXD', 'DDDDD'] };
const footing: PixelSprite = { id: 'cf13-footing', name: 'cf13-footing', tags: ['scene', 'cf13'], rows: ['xxxxxxxxxx', 'XXXXXXXXXD', 'XXXXXXXXXD', 'DDDDDDDDDD'] };
const trolley: PixelSprite = { id: 'cf13-trolley', name: 'cf13-trolley', tags: ['scene', 'cf13'], rows: ['DDDDDD', '.DXXD.', '..x...', '..x...', '..x...'] };

/** The buyer: the other chief recoloured into private equity charcoal. */
const buyer = cfRecolor(cfExec, 'cf13-buyer', { B: 'X', b: 'D' }, 'A silver-haired buyer in a charcoal suit with one arm held out.');

const base = cfCompose('cf13-opener-base', yard, [
  [city, 0, 30],
  [jib, JIB.from, JIB.y],
  [counterweight, 0, 10],
  [mast, 6, 1],
  [cab, 10, 10],
  [footing, 3, 53],
  [trolley, 31, 10],
  [seniorLow, 21, 48],
  [bankMark, 30, 49],
  [seniorHigh, 23, 39],
  [bankMark, 30, 40],
  [mezzanine, 25, 33],
  [equity, 28, 29],
  [cfShadowShort, 58, 56],
  [buyer, 50, 30],
], 'The still yard: dusk, the city, the crane, the capital stack, the buyer.');

/**
 * The company on the crane's hook: cable, hook, slings, and the head office itself, cornice and lit
 * windows. It bobs a little on its cable just above the equity, the way a load is set down.
 */
const company: PixelSprite = {
  id: 'cf13-opener-company',
  name: 'cf13-opener-company',
  tags: ['scene', 'cf13'],
  blurb: 'A head office hanging from a crane hook.',
  palette: CF_PALETTE,
  rows: [
    '.....x.....',
    '....OGO....',
    '.....O.....',
    '....x.x....',
    '...x...x...',
    '..x.....x..',
    '.OOOOOOOOO.',
    'OGyGGGGGGgO',
    'OOOOOOOOOOO',
    'OxyxKxKxyXO',
    'OxxxxxxxxXO',
    'OxKxyxyxKXO',
    'OxxxxxxxxXO',
    'OxxxxAxxxXO',
    'OOOOOAOOOOO',
  ],
};

const warning: PixelSprite = { id: 'cf13-opener-warning', name: 'cf13-opener-warning', tags: ['scene', 'cf13'], rows: ['RR'] };
const glint: PixelSprite = { id: 'cf13-opener-glint', name: 'cf13-opener-glint', tags: ['scene', 'cf13'], rows: ['.w.', 'wWw', '.w.'] };
const birds: PixelSprite = { id: 'cf13-opener-birds', name: 'cf13-opener-birds', tags: ['scene', 'cf13'], rows: ['X.X...X.X', '.X.....X.'] };

export const cf13Opener: SceneArt = {
  id: 'cf13-opener',
  label: 'At dusk a crane lowers a whole company onto a tall stack of blue debt blocks stamped with banks, under a thin slice of orchid equity, while the buyer points at it.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: company, x: 28, y: 12, motion: { kind: 'bob', amp: 2, periodMs: 2600 } },
    { sprite: warning, x: 7, y: 0, motion: { kind: 'twinkle', periodMs: 1400, min: 0.1 } },
    { sprite: cityLit, x: 0, y: 30, motion: { kind: 'twinkle', periodMs: 4200, min: 0.3 } },
    { sprite: glint, x: 36, y: 28, motion: { kind: 'twinkle', periodMs: 2300, phase: 0.4, min: 0 } },
    { sprite: birds, x: 60, y: 14, motion: { kind: 'drift', amp: 3, periodMs: 5200 } },
  ],
};

/** Lesson 13's emblem: the company on its capital stack, mostly debt, a little equity. */
const emblemStack: PixelSprite = {
  id: 'cf13-emblem-stack',
  name: 'cf13-emblem-stack',
  tags: [],
  blurb: 'A head office standing on blocks of equity, mezzanine and bank debt.',
  palette: CF_PALETTE,
  rows: [
    '................',
    '....OOOOOOOO....',
    '....OGGGGGgO....',
    '....OxyxxyXO....',
    '....OxxxxxXO....',
    '....OxyxxyXO....',
    '....OOOAAOOO....',
    '...EqqqqqqqqE...',
    '...EPPPPPPPPE...',
    '..nTTTTTTTTTTn..',
    '..nttttttttttn..',
    '.CBBBBBBBBBBBBC.',
    '.CbbbbbwbbbbbbC.',
    '.CbbbbwwwbbbbbC.',
    '.CbbbbwbwbbbbbC.',
    '.CCCCCCCCCCCCCC.',
  ],
};

export const cf13Finish = cfKeepsake(
  'cf13-finish',
  'A crystal award on a gold stand with a company standing on a tall stack of debt and a thin slice of equity inside, and small sparkles around it.',
  emblemStack,
);

export const art: LessonArtSet = { opener: cf13Opener, backdrop: cfBackdrop, finish: cf13Finish };
