/**
 * pf-backdrop: the personal finance world after dark. A neighbourhood street for the pathway, drawn
 * to sit along the bottom of every lesson screen behind the content: homes, a brick walk-up with a
 * water tower, a bungalow behind a picket fence, the corner store under a striped awning, and the
 * little bank at the end of the block. Low and pitched where the quant skyline is tall and flat.
 * Windows glow deep gold on their own clocks, a TV flickers, chimneys smoke, street lamps hum and
 * pool on the pavement, fireflies drift by the trees. Everything stays under luminance 0.15.
 */
import type { PixelSprite } from '../types';
import { pfCompose } from './pf-kit';
import type { SceneArt } from './types';

const Lstreet: PixelSprite = {
  id: 'pf-backdrop-street',
  name: 'street',
  tags: ['scene', 'pf'],
  blurb: "The pavement, kerb and a dashed street.",
  rows: [
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKDDDDKKKKDDDDKKKKDDDDKKKKDDDDKKKKDDDDKKKKDDDDKKKKDDDDKKKKDDDDKKKKDDDDKKKKDDDDKKKKDDDDKKKKDDDDKKKKDDDDKKKKDDDDKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
  ],
};

const LhouseA: PixelSprite = {
  id: 'pf-backdrop-house-a',
  name: 'house-a',
  tags: ['scene', 'pf'],
  blurb: "A two-storey house, front gable, chimney.",
  rows: [
    '..........XXXX.',
    '.......E...DD..',
    '......EEE..DD..',
    '.....EEkEE.DD..',
    '....EEkkkEEDD..',
    '...EEkKKKkEED..',
    '..EEkkKKKkkEE..',
    '.EEkkkkkkkkkEE.',
    'EEEEEEEEEEEEEEE',
    '.Dkkkkkkkkkkkk.',
    '.DkKKKkkkKKKkk.',
    '.DkKKKkkkKKKkk.',
    '.DkKKKkkkKKKkk.',
    '.DkDDDkkkDDDkk.',
    '.DkKKKKkkKDKkk.',
    '.DkKKKKkkKKKkk.',
    '.DkKKKKkkKKKkk.',
    '.DkDDDDkkKKKkk.',
    '.DkkkkkkkKKKkk.',
  ],
};

const Ltree: PixelSprite = {
  id: 'pf-backdrop-tree',
  name: 'tree',
  tags: ['scene', 'pf'],
  rows: [
    '..kktk...',
    '.ktttkkk.',
    'kttnttkkk',
    'ktnttkkkK',
    'kkttkkkKK',
    '.kkkkKKK.',
    '..kkKKK..',
    '....k....',
    '....k....',
    '....k....',
    '....k....',
    '....k....',
    '....k....',
    '....k....',
    '....k....',
    '....k....',
  ],
};

const Lapartment: PixelSprite = {
  id: 'pf-backdrop-walkup',
  name: 'walk-up',
  tags: ['scene', 'pf'],
  blurb: "A brick walk-up, three floors of four windows.",
  rows: [
    'DDDDDDDDDDDDDDDDDD',
    'DDDDDDDDDDDDDDDDDD',
    'D11111111111111111',
    'D1KK11KK11KK11KK11',
    'D1KK11KK11KK11KK11',
    'D1KK11KK11KK11KK11',
    'D1DD11DD11DD11DD11',
    'DDDDDDDDDDDDDDDDDD',
    'D11111111111111111',
    'D1KK11KK11KK11KK11',
    'D1KK11KK11KK11KK11',
    'D1KK11KK11KK11KK11',
    'D1DD11DD11DD11DD11',
    'DDDDDDDDDDDDDDDDDD',
    'D11111111111111111',
    'D1KK11KK11KK11KK11',
    'D1KK11KK11KK11KK11',
    'D1KK11KK11KK11KK11',
    'D1DD11DDDDDD11DD11',
    'D111111KKKK1111111',
    'D111111KKKK1111111',
    'D111111KKKK1111111',
    'D111111KKKK1111111',
  ],
};

const Ltower: PixelSprite = {
  id: 'pf-backdrop-water-tower',
  name: 'water-tower',
  tags: ['scene', 'pf'],
  rows: [
    '.DDDD.',
    'DDDDDD',
    'DkkkkD',
    'DDDDDD',
    'DkkkkD',
    'DkkkkD',
    '.DDDD.',
    '.D..D.',
  ],
};

const Lbungalow: PixelSprite = {
  id: 'pf-backdrop-bungalow',
  name: 'bungalow',
  tags: ['scene', 'pf'],
  blurb: "A bungalow under a pink hip roof.",
  rows: [
    '...IIIIIIII...',
    '..IIIIIIIIII..',
    '.IIIIIIIIIIII.',
    'IIIIIIIIIIIIII',
    'EEEEEEEEEEEEEE',
    '.Dkkkkkkkkkkk.',
    '.Dkkkkkkkkkkk.',
    '.DKKKkKKkKKKk.',
    '.DKKKkKKkKKKk.',
    '.DKKKkKKkKKKk.',
    '.DkkkkKKkkkkk.',
    '.DkkkkKKkkkkk.',
  ],
};

const Lfence: PixelSprite = {
  id: 'pf-backdrop-fence',
  name: 'fence',
  tags: ['scene', 'pf'],
  rows: [
    'D.D.D.D.D.D.D.',
    'DDDDDDDDDDDDDD',
    'D.D.D.D.D.D.D.',
  ],
};

const Lstore: PixelSprite = {
  id: 'pf-backdrop-corner-store',
  name: 'corner-store',
  tags: ['scene', 'pf'],
  blurb: "The corner store: flat above, teal awning, lit window.",
  rows: [
    'DDDDDDDDDDDDDDDDDD',
    'Dkkkkkkkkkkkkkkkkk',
    'Dkkkkkkkkkkkkkkkkk',
    'DkKKKkkkKKKkkKKKkk',
    'DkKKKkkkKKKkkKKKkk',
    'DkKKKkkkKKKkkKKKkk',
    'Dkkkkkkkkkkkkkkkkk',
    'DKKKKKKKKKKKKKKKKk',
    'DKKKKKKKKKKKKKKKKk',
    'tktktktktktktktktk',
    'tktktktktktktktktk',
    'tktktktktktktktktk',
    'DOOOKOOOKOOOkKKKkk',
    'DKKKKKKKKKKKkKKKkk',
    'DOOOKOOOKOOOkKKKkk',
    'DOOOKOOOKOOOkKKKkk',
  ],
};

const LhouseC: PixelSprite = {
  id: 'pf-backdrop-house-c',
  name: 'house-c',
  tags: ['scene', 'pf'],
  blurb: "A slate-roofed house with a dormer and a chimney.",
  rows: [
    '..........XXXX.',
    '......DDD..DD..',
    '.....DDDDD.DD..',
    '....DDKKKDDDD..',
    '...DDDKKKDDDD..',
    '..DDDDDDDDDDD..',
    '.DDDDDDDDDDDDD.',
    'XXXXXXXXXXXXXXX',
    '.Dkkkkkkkkkkkk.',
    '.DkKKKkkkKKKkk.',
    '.DkKKKkkkKKKkk.',
    '.DkKKKkkkKKKkk.',
    '.DkDDDkkkDDDkk.',
    '.DkKKKkkkKKKkk.',
    '.DkKKKkkkKKKkk.',
    '.DkKKKkkkKKKkk.',
    '.DkkkkkkkKKKkk.',
    '.DkkkkkkkKKKkk.',
  ],
};

const Ltree2: PixelSprite = {
  id: 'pf-backdrop-tree-small',
  name: 'tree-small',
  tags: ['scene', 'pf'],
  rows: [
    '..ktk..',
    '.kttkk.',
    'ktntkkk',
    'kttkkKK',
    '.kkkKK.',
    '...k...',
    '...k...',
    '...k...',
    '...k...',
    '...k...',
    '...k...',
    '...k...',
    '...k...',
  ],
};

const Lbank: PixelSprite = {
  id: 'pf-backdrop-bank',
  name: 'bank',
  tags: ['scene', 'pf'],
  blurb: "The neighbourhood bank: pediment, columns, steps.",
  rows: [
    '.......D.......',
    '.....DkkkD.....',
    '...DkkkOkkkD...',
    '.DkkkkkkkkkkkD.',
    'DDDDDDDDDDDDDDD',
    'XXXXXXXXXXXXXXX',
    'DDDDDDDDDDDDDDD',
    'KXKKXKKXKKXKKXK',
    'KXKKXKKXKKXKKXK',
    'KXKKXKKXKKXKKXK',
    'KXKKXKKXKKXKKXK',
    'KXKKXKKXKKXKKXK',
    'KXKKXKKXKKXKKXK',
    'KXKKXKKXKKXKKXK',
    'DDDDDDDDDDDDDDD',
    'XXXXXXXXXXXXXXX',
  ],
};

const Llamp: PixelSprite = {
  id: 'pf-backdrop-lamp',
  name: 'street-lamp',
  tags: ['scene', 'pf'],
  rows: [
    'XXX',
    '.D.',
    '.D.',
    '.D.',
    '.D.',
    '.D.',
    '.D.',
    '.D.',
    '.D.',
    '.D.',
    '.D.',
    '.D.',
  ],
};

const Lpool: PixelSprite = {
  id: 'pf-backdrop-lamp-pool',
  name: 'lamp-pool',
  tags: ['scene', 'pf'],
  rows: [
    'OOOOOOO',
  ],
};

const base = pfCompose('pf-backdrop-base', 112, 44, '.', [
  [Lstreet, 0, 36],
  [LhouseA, 0, 17],
  [Ltree, 15, 20],
  [Lapartment, 24, 13],
  [Ltower, 34, 5],
  [Lbungalow, 42, 24],
  [Lfence, 42, 33],
  [Lstore, 56, 20],
  [LhouseC, 74, 18],
  [Ltree2, 89, 23],
  [Lbank, 97, 20],
  [Llamp, 21, 24],
  [Llamp, 54, 24],
  [Llamp, 94, 24],
  [Lpool, 19, 37],
  [Lpool, 52, 37],
  [Lpool, 92, 37],
]);

const LglowWalkupA: PixelSprite = {
  id: 'pf-backdrop-glow-walkup-a',
  name: 'glow-walkup-a',
  tags: ['scene', 'pf'],
  rows: [
    '....OO........',
    '....OO........',
    '....OO........',
    '..............',
    '..............',
    '..............',
    '............OO',
    '............OO',
    '............OO',
    '..............',
    '..............',
    '..............',
    'OO............',
    'OO............',
    'OO............',
  ],
};
const LglowWalkupB: PixelSprite = {
  id: 'pf-backdrop-glow-walkup-b',
  name: 'glow-walkup-b',
  tags: ['scene', 'pf'],
  rows: [
    'OO......',
    'OO......',
    'OO......',
    '........',
    '........',
    '........',
    '........',
    '........',
    '........',
    '........',
    '........',
    '........',
    '......OO',
    '......OO',
    '......OO',
  ],
};
const LglowBungalow: PixelSprite = {
  id: 'pf-backdrop-glow-bungalow',
  name: 'glow-bungalow',
  tags: ['scene', 'pf'],
  rows: [
    'OOO....OOO',
    'OOO....OOO',
  ],
};
const LglowStore: PixelSprite = {
  id: 'pf-backdrop-glow-store',
  name: 'glow-store',
  tags: ['scene', 'pf'],
  rows: [
    'OOO..OOO',
    'OOO..OOO',
    'OOO..OOO',
  ],
};
const LglowHouseA: PixelSprite = {
  id: 'pf-backdrop-glow-house-a',
  name: 'glow-house-a',
  tags: ['scene', 'pf'],
  rows: [
    'OOO',
    'OOO',
    'OOO',
  ],
};
const LglowHouseC: PixelSprite = {
  id: 'pf-backdrop-glow-house-c',
  name: 'glow-house-c',
  tags: ['scene', 'pf'],
  rows: [
    'OOO...',
    'OOO...',
    '......',
    '......',
    '......',
    '......',
    '...OOO',
    '...OOO',
    '...OOO',
  ],
};
const Ltv: PixelSprite = {
  id: 'pf-backdrop-tv',
  name: 'tv',
  tags: ['scene', 'pf'],
  rows: [
    'ttt',
    'tbt',
    'ttt',
  ],
  frames: [
    ['ttt', 'tbt', 'ttt'],
    ['bbb', 'btb', 'bbb'],
    ['ttt', 'ttt', 'tbt'],
    ['ttb', 'tbt', 'btt'],
  ],
  frameMs: 520,
};
const LporchLight: PixelSprite = {
  id: 'pf-backdrop-porch-light',
  name: 'porch-light',
  tags: ['scene', 'pf'],
  rows: [
    'O',
  ],
};
const LlampGlow: PixelSprite = {
  id: 'pf-backdrop-lamp-glow',
  name: 'lamp-glow',
  tags: ['scene', 'pf'],
  rows: [
    'OOO',
  ],
};
const Lsmoke: PixelSprite = {
  id: 'pf-backdrop-smoke',
  name: 'smoke',
  tags: ['scene', 'pf'],
  rows: [
    '.DD.',
    'DXXD',
    '.DD.',
    '..DD',
    '.DXD',
    '..D.',
  ],
};
const Lstar: PixelSprite = {
  id: 'pf-backdrop-star',
  name: 'star',
  tags: ['scene', 'pf'],
  rows: [
    'D',
  ],
};
const Lfirefly: PixelSprite = {
  id: 'pf-backdrop-firefly',
  name: 'firefly',
  tags: ['scene', 'pf'],
  rows: [
    'O',
  ],
};

export const pfBackdrop: SceneArt = {
  id: 'pf-backdrop',
  label: 'A quiet neighborhood street at night with lit windows, a corner store, a little bank and glowing street lamps.',
  width: 112,
  height: 44,
  base,
  layers: [
    { sprite: LglowWalkupA, x: 26, y: 16, motion: { kind: 'twinkle', periodMs: 6400, min: 0.35, phase: 0.1 } },
    { sprite: LglowWalkupB, x: 30, y: 16, motion: { kind: 'twinkle', periodMs: 7600, min: 0.3, phase: 0.6 } },
    { sprite: LglowBungalow, x: 44, y: 31, motion: { kind: 'twinkle', periodMs: 7000, min: 0.4, phase: 0.35 } },
    { sprite: LglowStore, x: 64, y: 23, motion: { kind: 'twinkle', periodMs: 6800, min: 0.35, phase: 0.8 } },
    { sprite: LglowHouseA, x: 9, y: 27, motion: { kind: 'twinkle', periodMs: 7200, min: 0.4, phase: 0.5 } },
    { sprite: LglowHouseC, x: 80, y: 21, motion: { kind: 'twinkle', periodMs: 6000, min: 0.35, phase: 0.25 } },
    { sprite: Ltv, x: 77, y: 31 },
    { sprite: LporchLight, x: 50, y: 30, motion: { kind: 'twinkle', periodMs: 2600, min: 0.5, phase: 0.2 } },
    { sprite: LlampGlow, x: 21, y: 25, motion: { kind: 'twinkle', periodMs: 4200, min: 0.55, phase: 0.0 } },
    { sprite: LlampGlow, x: 54, y: 25, motion: { kind: 'twinkle', periodMs: 4600, min: 0.55, phase: 0.45 } },
    { sprite: LlampGlow, x: 94, y: 25, motion: { kind: 'twinkle', periodMs: 3900, min: 0.55, phase: 0.7 } },
    { sprite: Lsmoke, x: 10, y: 10, motion: { kind: 'rise', amp: 5, periodMs: 6200, phase: 0.0 } },
    { sprite: Lsmoke, x: 84, y: 11, motion: { kind: 'rise', amp: 5, periodMs: 7000, phase: 0.5 } },
    { sprite: Lfirefly, x: 17, y: 30, motion: { kind: 'twinkle', periodMs: 1900, min: 0.1, phase: 0.3 } },
    { sprite: Lfirefly, x: 90, y: 31, motion: { kind: 'twinkle', periodMs: 2300, min: 0.1, phase: 0.75 } },
    { sprite: Lstar, x: 7, y: 4, motion: { kind: 'twinkle', periodMs: 5200, min: 0.3, phase: 0.2 } },
    { sprite: Lstar, x: 48, y: 3, motion: { kind: 'twinkle', periodMs: 6100, min: 0.3, phase: 0.7 } },
    { sprite: Lstar, x: 103, y: 5, motion: { kind: 'twinkle', periodMs: 4700, min: 0.3, phase: 0.4 } },
  ],
};
