/**
 * Personal Finance lesson 6, Managing Debt Wisely: stop adding to it, then pay it down.
 *
 * A new set, the front hall: an orchid front door whose mail slot keeps letting bills in onto the
 * mat, a chair rail along the wall, and a narrow console table. Behind it the figure cuts up a credit
 * card, a stack of bills flagged red at its elbow; on the wall a chart of the balance stepping down
 * to zero, the debt payoff the lesson plans. Moving: a bill through the slot, the scissors, the
 * sconce's halo, a glint where the chart reaches zero, the cat's z.
 */
import type { PixelSprite } from '../types';
import { pfCat, pfCompose, pfKitchen, pfSparkle, pfTable, pfZzz } from './pf-kit';
import { pfBlock, pfSaverHold } from './pf-kit-a';
import { pfKeepsake } from './pf1-finish';
import { pfBackdrop } from './pf-backdrop';
import type { LessonArtSet, SceneArt } from './types';

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

/** The bills waiting on the console, red flags on the overdue ones. */
const billStack: PixelSprite = {
  id: 'pf6-bill-stack',
  name: 'bill stack',
  tags: ['scene', 'pf'],
  rows: [
    '.wwwwwx',
    '.wRRwxx',
    '.xxxxxx',
    'wwwwwx.',
    'wxxwRx.',
    'xxxxxx.',
    '.wwwwwx',
    'RRwxwwx',
    '.xxxxxx',
    'wwwwwwx',
    'wxRRwwx',
    'xxxxxxx',
    'wwwwwwx',
    'xxxxxxx',
  ],
};

/** The card being cut, a slit already in it from the right edge. */
const cutCard: PixelSprite = {
  id: 'pf6-cut-card',
  name: 'cut card',
  tags: ['scene', 'pf'],
  rows: [
    '.ttttttt..',
    'tTTTTTTT.t',
    'tTyGTTTTK.',
    'tTGgTTTTKt',
    'tTTTTTTTTt',
    'tTwwTwwTTt',
    '.tttttttt.',
  ],
};

/** Scissors, blades to the left over the card's slit, finger rings to the right: open, then snipped shut. */
const scissors: PixelSprite = {
  id: 'pf6-scissors',
  name: 'scissors',
  tags: ['scene', 'pf'],
  rows: [
    '.......RR.',
    '.w....R..R',
    '..ww.R.RR.',
    '....wG....',
    '..ww.R.RR.',
    '.w....R..R',
    '.......RR.',
  ],
  frames: [
    [
      '.......RR.',
      '.w....R..R',
      '..ww.R.RR.',
      '....wG....',
      '..ww.R.RR.',
      '.w....R..R',
      '.......RR.',
    ],
    [
      '.......RR.',
      '......R..R',
      '.....R.RR.',
      'wwwwwG....',
      '.....R.RR.',
      '......R..R',
      '.......RR.',
    ],
  ],
  frameMs: 460,
};

/** The balance chart on the wall: four bars stepping down, then the baseline turning green at zero. */
const payoffChart: PixelSprite = {
  id: 'pf6-payoff-chart',
  name: 'payoff chart',
  tags: ['scene', 'pf'],
  rows: [
    '.......R.......',
    'xxxxxxxrxxxxxxx',
    'xwwwwwwwwwwwwwX',
    'xwRrwwwwwwwwwwX',
    'xwRrwwwwwwwwwwX',
    'xwRrwRrwwwwwwwX',
    'xwRrwRrwwwwwwwX',
    'xwRrwRrwRrwwwwX',
    'xwRrwRrwRrwwwwX',
    'xwRrwRrwRrwRrwX',
    'xwXXXXXXXXXXNNX',
    'xwwwwwwwwwwwwwX',
    'xXXXXXXXXXXXXXX',
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

/** Lesson 6's emblem: the card with the scissors' blades biting into it. */
const emblemDebt: PixelSprite = {
  id: 'pf6-emblem-debt',
  name: 'pf6-emblem-debt',
  tags: ['scene', 'pf', 'emblem'],
  rows: [
    '...........RR.',
    '.tttttttt.R..R',
    'tTTTTTwwtR.RR.',
    'tTyGTTTTwG....',
    'tTGgTTwwtR.RR.',
    'tTTTTTTTt.R..R',
    'tTwwTwwTt..RR.',
    '.tttttttt.....',
  ],
};

// Order is depth: door and rail on the wall, the figure behind the console, the card and stack on top.
const base = pfCompose('pf6-opener-base', 80, 60, pfKitchen.rows, [
  [pfBlock('pf6-rail-top', 80, 1, 'X'), 0, 30],
  [pfBlock('pf6-rail', 80, 1, 'D'), 0, 31],
  [frontDoor, 3, 14],
  [doormat, 2, 48],
  [billPile, 3, 44],
  [sconce, 22, 18],
  [payoffChart, 61, 7],
  [pfSaverHold, 37, 12],
  [pfTable(30, 12), 30, 36],
  [billStack, 52, 24],
  [cutCard, 35, 23],
  [pfCat, 30, 50],
]);

export const pf6Opener: SceneArt = {
  id: 'pf6-opener',
  label: 'In the front hall, a person cuts up a credit card beside a stack of overdue bills while more bills drop through the mail slot onto the mat and a chart on the wall steps the balance down to zero.',
  width: 80,
  height: 60,
  base,
  layers: [
    // The door's slot is at (9, 30); the bill falls from it to the pile on the mat.
    { sprite: slotBill, x: 9, y: 30 },
    // The blades close across the card's slit (card at 35,23); the right hand is inside the rings.
    { sprite: scissors, x: 41, y: 22 },
    { sprite: sconceHalo, x: 21, y: 17, motion: { kind: 'twinkle', periodMs: 2600, min: 0.3 } },
    { sprite: pfSparkle, x: 72, y: 14, motion: { kind: 'twinkle', periodMs: 1900, min: 0.4 } },
    { sprite: pfZzz, x: 29, y: 45, motion: { kind: 'rise', amp: 3, periodMs: 2800, phase: 0.3 } },
  ],
};

export const pf6Finish = pfKeepsake(
  'pf6-finish',
  'A gold house-shaped key fob with a teal roof on a key ring with a brass key, its window showing a credit card being cut with scissors, with small sparkles around it.',
  emblemDebt,
);

export const art: LessonArtSet = { opener: pf6Opener, backdrop: pfBackdrop, finish: pf6Finish };
