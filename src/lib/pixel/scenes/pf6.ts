/**
 * Personal Finance lesson 6, Managing Debt Wisely: minimums on every debt, every extra dollar at the
 * highest rate.
 *
 * A new set, the front hall: an orchid front door whose mail slot keeps letting bills in onto the
 * mat, a chair rail along the wall, and a console table seen from a little above. On it lie three
 * debts colour-coded by interest rate, red for the highest, then amber, then green, each with a coin
 * for its minimum payment. The figure pushes a fat stack of cash onto the red one and stamps it PAID:
 * the avalanche the lesson teaches. On the wall a chart of the balance, stacked in the same three
 * colours, loses its red first, then its amber, then steps down to a green zero. Moving: a bill
 * through the slot, the stamp, the sconce's halo, a glint where the chart reaches zero, the cat's z.
 */
import type { PixelSprite } from '../types';
import { pfCat, pfCoin, pfCompose, pfKitchen, pfSaver, pfSparkle, pfZzz } from './pf-kit';
import { pfBlock } from './pf-kit-a';
import { pfText } from './pf-kit-b';
import { pfKeepsake } from './pf1-finish';
import { pfBackdrop } from './pf-backdrop';
import type { LessonArtSet, SceneArt } from './types';

const SKIN: Record<string, string> = {
  M: '#D6A87C',
  C: '#C08552',
  U: '#9A6638',
  j: '#6B3A1F',
  H: '#43291A',
};

/** The front door, standing on the floor line: casing, two raised panels, a brass mail slot (columns 6 to 9, row 16). */
const frontDoor: PixelSprite = {
  id: 'pf6-front-door',
  name: 'front door',
  tags: ['scene', 'pf'],
  rows: [
    'DDDDDDDDDDDDDDDD',
    'DXXXXXXXXXXXXXXD',
    'DXEEEEEEEEEEEEXD',
    'DXEppppppppppEXD',
    'DXEpEEEEEEEEpEXD',
    'DXEpEqPPPPPEpEXD',
    'DXEpEPPPPPPEpEXD',
    'DXEpEPPPPPPEpEXD',
    'DXEpEPPPPPPEpEXD',
    'DXEpEPPPPPPEpEXD',
    'DXEpEPPPPPPEpEXD',
    'DXEpEPPPPPPEpEXD',
    'DXEpEEEEEEEEpEXD',
    'DXEppppppppppEXD',
    'DXEppppppppppEXD',
    'DXEppOOOOOOppEXD',
    'DXEppOKKKKOppEXD',
    'DXEppOGGGGOppEXD',
    'DXEppppppppppEXD',
    'DXEpppppppyGpEXD',
    'DXEppppppppOpEXD',
    'DXEppppppppppEXD',
    'DXEpEEEEEEEEpEXD',
    'DXEpEqPPPPPEpEXD',
    'DXEpEPPPPPPEpEXD',
    'DXEpEPPPPPPEpEXD',
    'DXEpEPPPPPPEpEXD',
    'DXEpEPPPPPPEpEXD',
    'DXEpEPPPPPPEpEXD',
    'DXEpEPPPPPPEpEXD',
    'DXEpEEEEEEEEpEXD',
    'DXEppppppppppEXD',
    'DXEEEEEEEEEEEEXD',
    'DDDDDDDDDDDDDDDD',
  ],
};

/** The coir mat inside the door, and the bills already on it. */
const doormat: PixelSprite = {
  id: 'pf6-doormat',
  name: 'doormat',
  tags: ['scene', 'pf'],
  rows: [
    'OgOgOgOgOgOgOgOgOg',
    'gOgOgOgOgOgOgOgOgO',
    'OOOOOOOOOOOOOOOOOO',
  ],
};

const billPile: PixelSprite = {
  id: 'pf6-bill-pile',
  name: 'bill pile',
  tags: ['scene', 'pf'],
  rows: [
    '....wwwwwx......',
    '.wwwwxRwxwwwwx..',
    '.wxRwxxxwwxwRwx.',
    'wwwwwxxxxxwwwwx.',
    'xxxxxxxxxxxxxxx.',
  ],
};

/** A bill pushed through the slot (the slot is the sprite's top row) that drops onto the pile. */
const slotBill: PixelSprite = {
  id: 'pf6-slot-bill',
  name: 'slot bill',
  tags: ['scene', 'pf'],
  rows: ['....', '....', '....', '....', '....', '....', '....', '....', '....', '....', '....', '....', '....', '....', '....'],
  frames: [
    ['....', '....', '....', '....', '....', '....', '....', '....', '....', '....', '....', '....', '....', '....', '....'],
    ['wwww', '....', '....', '....', '....', '....', '....', '....', '....', '....', '....', '....', '....', '....', '....'],
    ['wRww', 'wwwx', '....', '....', '....', '....', '....', '....', '....', '....', '....', '....', '....', '....', '....'],
    ['....', 'wRww', 'wwwx', 'xxxx', '....', '....', '....', '....', '....', '....', '....', '....', '....', '....', '....'],
    ['....', '....', '....', '....', 'wRww', 'wwwx', 'xxxx', '....', '....', '....', '....', '....', '....', '....', '....'],
    ['....', '....', '....', '....', '....', '....', '....', '....', 'wRww', 'wwwx', 'xxxx', '....', '....', '....', '....'],
    ['....', '....', '....', '....', '....', '....', '....', '....', '....', '....', '....', '....', 'wRww', 'wwwx', 'xxxx'],
    ['....', '....', '....', '....', '....', '....', '....', '....', '....', '....', '....', '....', '....', 'wRww', 'xxxx'],
    ['....', '....', '....', '....', '....', '....', '....', '....', '....', '....', '....', '....', '....', '....', '....'],
    ['....', '....', '....', '....', '....', '....', '....', '....', '....', '....', '....', '....', '....', '....', '....'],
  ],
  frameMs: 180,
};

/** The console seen from a little above: `depth` rows of top, so the bills lie flat on it. */
function deepConsole(width: number, depth: number, legs: number): PixelSprite {
  const span = (edge: string, fill: string) => edge + fill.repeat(width - 2) + edge;
  const leg = '.OgO' + '.'.repeat(width - 8) + 'OgO.';
  return {
    id: `pf6-console-${String(width)}`,
    name: 'console',
    tags: ['scene', 'pf'],
    rows: [
      span('.', 'O'),
      ...Array.from({ length: depth }, () => span('O', 'g')),
      span('O', 'G'),
      span('O', 'O'),
      span('O', 'g'),
      span('O', 'O'),
      ...Array.from({ length: legs }, () => leg),
    ],
  };
}

/** The highest-rate debt, a statement edged red, flat in front of the figure: cash, PAID and a coin go on it. */
const redBill: PixelSprite = {
  id: 'pf6-red-bill',
  name: 'red bill',
  tags: ['scene', 'pf'],
  rows: [
    'rRRRRRRRRRRRRRRRRRRRRRRRRRRRr',
    'Rwwwwwwwwwwwwwwwwwwwwwwwwwwwr',
    'Rxxxxxxwwwwwwwwwwwwwwwwwwwwwr',
    'Rwwwwwwwwwwwwwwwwwwwwwwwwwwwr',
    'Rxxxxxwwwwwwwwwwwwwwwwwwxxxwr',
    'Rwwwwwwwwwwwwwwwwwwwwwwwwwwwr',
    'rrrrrrrrrrrrrrrrrrrrrrrrrrrrr',
  ],
};

/** A lower-rate debt, edged amber or green, getting only its minimum. */
function smallBill(id: string, band: string, shade: string): PixelSprite {
  return {
    id,
    name: id,
    tags: ['scene', 'pf'],
    rows: [
      shade + band.repeat(8) + shade,
      band + 'wwwwwwww' + shade,
      band + 'xxwwwwww' + shade,
      band + 'wwwwwwww' + shade,
      band + 'xxxwwwww' + shade,
      shade.repeat(10),
    ],
  };
}

/** A fat stack of cash in its gold paper strap: the top face, then the edges of the bills. */
const cashStack: PixelSprite = {
  id: 'pf6-cash-stack',
  name: 'cash stack',
  tags: ['scene', 'pf'],
  rows: [
    '.mmmyymmm.',
    'mNNNyyNNNn',
    'mNNNyyNNNn',
    'nnnnnnnnnn',
    'NNNNNNNNNn',
    'nnnnnnnnnn',
  ],
};

/** The left forearm laid forward on the console, the hand on the cash: stamp at the figure's x, row 36. */
const leftForearm: PixelSprite = {
  id: 'pf6-left-forearm',
  name: 'left forearm',
  tags: ['scene', 'pf'],
  palette: SKIN,
  rows: [
    '.bBBb',
    '.bBBb',
    'MCCU.',
    'UCU..',
  ],
};

/** The mark the stamp leaves on the red bill, in its green ink. */
const PAID = pfText('pf6-paid', 'PAID', 'n').rows;

/** The stamp, orchid so it stands off the gold console, its knob in the right hand, green ink on its rubber. */
const STAMP = [
  '.......MCC.......',
  '.......UCU.......',
  '......qPPPp......',
  '......EPPPE......',
  '........E........',
  '..qqqqqqqqqqqqq..',
  '.EPPPPPPPPPPPPPE.',
  'EEEEEEEEEEEEEEEEE',
  'nnnnnnnnnnnnnnnnn',
];

/**
 * The stamp `drop` rows down the sprite: 0 is held up at the chest, 8 is pressed on the bill. PAID is
 * drawn here rather than in the base so that it shows while the stamp is lifted and never peeks out
 * from under it when pressed. Held up, the arm is raised, so the hanging sleeve below it is painted out.
 */
function stampAt(drop: number): string[] {
  const rows = Array.from({ length: 17 }, () => [...'.'.repeat(17)]);
  const paint = (art: readonly string[], x: number, y: number) => {
    art.forEach((row, j) => {
      [...row].forEach((ch, i) => {
        if (ch !== '.') rows[y + j][x + i] = ch;
      });
    });
  };
  if (drop < 8) paint(PAID, 1, 12);
  if (drop === 0) paint(['kkk'], 8, 9);
  paint(STAMP, 0, drop);
  return rows.map((row) => row.join(''));
}

/** The figure stamping PAID on the red bill: held up, coming down, pressed, lifted again. */
const stamp: PixelSprite = {
  id: 'pf6-stamp',
  name: 'stamp',
  tags: ['scene', 'pf'],
  palette: SKIN,
  rows: stampAt(0),
  frames: [stampAt(0), stampAt(0), stampAt(0), stampAt(4), stampAt(8), stampAt(8), stampAt(4), stampAt(0)],
  frameMs: 230,
};

/**
 * The balance on the wall, stacked by rate (red on top, amber, green at the foot): the red goes
 * first, then the amber, then the green, and the baseline turns green at zero.
 */
const payoffChart: PixelSprite = {
  id: 'pf6-payoff-chart',
  name: 'payoff chart',
  tags: ['scene', 'pf'],
  rows: [
    '..........G..........',
    'xxxxxxxxxxgxxxxxxxxxX',
    'xwwwwwwwwwwwwwwwwwwwX',
    'xwRRrwwwwwwwwwwwwwwwX',
    'xwRRrwwwwwwwwwwwwwwwX',
    'xwRRrwRRrwwwwwwwwwwwX',
    'xwGGgwGGgwwwwwwwwwwwX',
    'xwGGgwGGgwGGgwwwwwwwX',
    'xwGGgwGGgwGGgwwwwwwwX',
    'xwNNnwNNnwNNnwwwwwwwX',
    'xwNNnwNNnwNNnwNNnwwwX',
    'xwNNnwNNnwNNnwNNnwwwX',
    'xwXXXXXXXXXXXXXXXNNNX',
    'xwwwwwwwwwwwwwwwwwwwX',
    'xXXXXXXXXXXXXXXXXXXXX',
  ],
};

/** A wall sconce by the door, and its halo for a twinkle. */
const sconce: PixelSprite = {
  id: 'pf6-sconce',
  name: 'sconce',
  tags: ['scene', 'pf'],
  rows: [
    '.GyG.',
    'GyWyG',
    '.GyG.',
    '..O..',
    '.OOO.',
  ],
};

const sconceHalo: PixelSprite = {
  id: 'pf6-sconce-halo',
  name: 'sconce halo',
  tags: ['scene', 'pf'],
  rows: [
    '..g.g..',
    '.g...g.',
    'g.....g',
    '.g...g.',
    '..g.g..',
  ],
};

/**
 * Lesson 6's emblem: the opener's payoff chart in small. The stack loses its red first, then its
 * amber, then the white axis turns green at zero.
 */
const emblemDebt: PixelSprite = {
  id: 'pf6-emblem-debt',
  name: 'pf6-emblem-debt',
  tags: ['scene', 'pf', 'emblem'],
  rows: [
    'sRr...........',
    'RRr...........',
    'RRr...........',
    'yGg.yGg.......',
    'GGg.GGg.......',
    'mNn.mNn.mNn...',
    'NNn.NNn.NNn...',
    'NNn.NNn.NNn...',
    'wwwwwwwwwwwwmN',
  ],
};

// Order is depth: door and rail on the wall, the figure behind the console, the bills flat on its top
// and the cash, the forearm and the coins over them. PAID belongs to the stamp layer.
const base = pfCompose('pf6-opener-base', 80, 60, pfKitchen.rows, [
  [pfBlock('pf6-rail-top', 80, 1, 'X'), 0, 30],
  [pfBlock('pf6-rail', 80, 1, 'D'), 0, 31],
  [frontDoor, 3, 14],
  [doormat, 2, 48],
  [billPile, 3, 44],
  [sconce, 21, 18],
  [payoffChart, 55, 4],
  [pfSaver, 28, 12],
  [deepConsole(59, 7, 8), 21, 36],
  [redBill, 24, 37],
  [smallBill('pf6-amber-bill', 'G', 'g'), 55, 37],
  [smallBill('pf6-green-bill', 'N', 'n'), 67, 37],
  [cashStack, 22, 38],
  [leftForearm, 28, 36],
  [pfCoin, 49, 38],
  [pfCoin, 58, 38],
  [pfCoin, 70, 38],
  [pfCat, 44, 51],
]);

export const pf6Opener: SceneArt = {
  id: 'pf6-opener',
  label: 'In the front hall, three bills lie on the console color-coded by interest rate, red for the highest, then amber and green, each with a coin for its minimum payment, and a person pushes a stack of cash onto the red bill and stamps it PAID, while more bills drop through the mail slot and a wall chart shows the red debt cleared first, then the amber, down to a green zero.',
  width: 80,
  height: 60,
  base,
  layers: [
    // The door's slot is at (9, 30); the bill falls from it to the pile on the mat.
    { sprite: slotBill, x: 9, y: 30 },
    // The right hand at the end of the arm (columns 40 to 42) brings the stamp down on the bill; PAID lands at (33, 38).
    { sprite: stamp, x: 32, y: 26 },
    { sprite: sconceHalo, x: 20, y: 17, motion: { kind: 'twinkle', periodMs: 2600, min: 0.3 } },
    { sprite: pfSparkle, x: 71, y: 11, motion: { kind: 'twinkle', periodMs: 1900, min: 0.4 } },
    { sprite: pfZzz, x: 43, y: 47, motion: { kind: 'rise', amp: 2, periodMs: 2800, phase: 0.3 } },
  ],
};

export const pf6Finish = pfKeepsake(
  'pf6-finish',
  'A gold house-shaped key fob with a teal roof on a key ring with a brass key, its window showing a debt chart whose red bars step down to a green zero line, with small sparkles around it.',
  emblemDebt,
);

export const art: LessonArtSet = { opener: pf6Opener, backdrop: pfBackdrop, finish: pf6Finish };
