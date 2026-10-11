/**
 * Personal Finance lesson 5, Understanding Credit Scores: a score is built one on-time payment at a time.
 *
 * A new set, the study desk: a banker's lamp, drawers, and on the wall a gold-framed meter, red to
 * green, its needle resting in the green the way an excellent score sits. Beside it a calendar whose
 * every payment is checked off in green (payment history, the biggest factor). The figure holds up
 * its one card; the bills under the lamp are stamped paid. The cat sits on the desk for once.
 * Moving: a glint on the card, the needle's tip, the newest check, the lamp, the cat's tail.
 */
import type { PixelSprite } from '../types';
import { pfCompose, pfKitchen, pfPaydayRing, pfSparkle, pfTable } from './pf-kit';
import { pfCard, pfCatSit } from './pf-kit-a';
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

/** The figure with its left arm raised, holding something up: the hand is columns 17 to 19, rows 2 and 3. */
const saverRaise: PixelSprite = {
  id: 'pf5-saver-raise',
  name: 'saver raising a hand',
  tags: ['scene', 'pf'],
  palette: SKIN,
  rows: [
    '.....HHHHHH.........',
    '....HjjjjjjH........',
    '...HjjjjjjjjH....MCM',
    '..HjjjjjjjjjjH...UCU',
    '..HjjMCCjjjjjH...bBb',
    '..HjCCCCCCCCjH..BBb.',
    '..HCCKCCCCKCCH..BBb.',
    '..HMCCCCCCCCUH.BBb..',
    '...MCCCUUCCCU..BBb..',
    '....UCCCCCCU..BBb...',
    '......UUUU....BBb...',
    '...bBBBBBBBBBBBb....',
    '..bBBBwBBwBBBBb.....',
    '.bBBBBwBBwBBBBb.....',
    '.bBBBBBBBBBBBBb.....',
    '.bBBbBBBBBBBBBb.....',
    '.bBBbBBBBBBBBBb.....',
    '.bBBbBBBBBBBBBb.....',
    '.bBBbBBBBBBBBBb.....',
    '.bBBbBBBBBBBBBb.....',
    '.bBBbBBBBBBBBBb.....',
    '.bBBbBBBBBBBBBb.....',
    '.bBBbBBBBBBBBBb.....',
    '.bBBbBBBBBBBBBb.....',
    '.bBBbBBBBBBBBBb.....',
    '.bBBbBBBBBBBBBb.....',
  ],
};

/** The score meter: poor, fair, good, excellent around the arc; the needle in the green. */
const scoreMeter: PixelSprite = {
  id: 'pf5-score-meter',
  name: 'score meter',
  tags: ['scene', 'pf'],
  rows: [
    'OOOOOOOOOOOOOOOOOOOOOOOOO',
    'OgggggggggggggggggggggggO',
    'OgKKKKKKKKKKKKKKKKKKKKKgO',
    'OgKKKKKKKK333GGKKKKKKKKgO',
    'OgKKKKK333333GGGGGKKKKKgO',
    'OgKKKK3333333GGGGGGKKKKgO',
    'OgKKKRR333KKKKKGGGGGKKKgO',
    'OgKKRRR3KKKKKKKKKGGNNKKgO',
    'OgKRRRRKKKKKKKKKKKNNNNKgO',
    'OgKRRRKKKKKKKKKKKKKNNNKgO',
    'OgKRRRKKKKKKKKKKKKwNNNKgO',
    'OgRRRKKKKKKKKKKKwwKKNNNgO',
    'OgRRRKKKKKKKKKwwKKKKNNNgO',
    'OgRRRKKKKKKKxwKKKKKKNNNgO',
    'OgggggggggggggggggggggggO',
    'OOOOOOOOOOOOOOOOOOOOOOOOO',
  ],
};

/** A glow at the needle's tip, for a twinkle. */
const needleGlow: PixelSprite = {
  id: 'pf5-needle-glow',
  name: 'needle glow',
  tags: ['scene', 'pf'],
  rows: [
    '.m.',
    'mWm',
    '.m.',
  ],
};

/** The calendar of the lesson's payment history: every month paid on time, checked in green. */
const paidCalendar: PixelSprite = {
  id: 'pf5-paid-calendar',
  name: 'paid calendar',
  tags: ['scene', 'pf'],
  rows: [
    '...D.....D...',
    'nNNDNNNNNDNNn',
    'nNwwwNwwwwNNn',
    'nnnnnnnnnnnnn',
    'wwwwwwwwwwwwx',
    'wNwwNwwNwwNwx',
    'wwwwwwwwwwwwx',
    'wNwwNwwNwwNwx',
    'wwwwwwwwwwwwx',
    'wNwwNwwNwwxwx',
    'wwwwwwwwwwwwx',
    'xxxxxxxxxxxxx',
  ],
};

/** A green-shaded banker's lamp; its light is a separate strip under the shade. */
const bankersLamp: PixelSprite = {
  id: 'pf5-bankers-lamp',
  name: "banker's lamp",
  tags: ['scene', 'pf'],
  rows: [
    '.nnnnnnnnnn.',
    'nNmmNNNNNNNn',
    'nnnnnnnnnnnn',
    '............',
    '.....OO.....',
    '.....Og.....',
    '.....Og.....',
    '...OOGgOO...',
    '..OGGGGGgO..',
  ],
};

const lampLight: PixelSprite = {
  id: 'pf5-lamp-light',
  name: 'lamp light',
  tags: ['scene', 'pf'],
  rows: [
    'GyyyyyyyyG',
  ],
};

/** A bill stamped with a green check, another under it. */
const paidBill: PixelSprite = {
  id: 'pf5-paid-bill',
  name: 'paid bill',
  tags: ['scene', 'pf'],
  rows: [
    'wwwwwwwwx',
    'wxxxwwwNx',
    'wwwwNwNwx',
    'wxxwwNwwx',
    'wwwwwwwwx',
    'xxxxxxxxx',
    'wwwwwwwwx',
  ],
};

/** Desk drawers under the desk's right end. */
const drawers: PixelSprite = {
  id: 'pf5-drawers',
  name: 'drawers',
  tags: ['scene', 'pf'],
  rows: [
    'OOOOOOOOOOOO',
    'OggggggggggO',
    'OggggyyggggO',
    'OggggggggggO',
    'OOOOOOOOOOOO',
    'OggggggggggO',
    'OggggyyggggO',
    'OggggggggggO',
    'OOOOOOOOOOOO',
    'OggggggggggO',
    'OggggyyggggO',
    'OOOOOOOOOOOO',
  ],
};

/** Lesson 5's emblem: the meter, its needle in the green. */
const emblemScore: PixelSprite = {
  id: 'pf5-emblem-score',
  name: 'pf5-emblem-score',
  tags: ['scene', 'pf', 'emblem'],
  rows: [
    '....333GG....',
    '...3333GGG...',
    '..R33...GGG..',
    '.RR.......NN.',
    'RRR......wNNN',
    'RR.....ww..NN',
    'RR....x....NN',
    '.....XXX.....',
  ],
};

// Order is depth: the card is held behind the raised hand, the figure behind the desk.
const base = pfCompose('pf5-opener-base', 80, 60, pfKitchen.rows, [
  [scoreMeter, 5, 4],
  [paidCalendar, 64, 6],
  [pfCard, 46, 7],
  [saverRaise, 32, 12],
  [pfTable(44, 12), 18, 36],
  [drawers, 46, 42],
  [bankersLamp, 19, 29],
  [paidBill, 33, 31],
]);

export const pf5Opener: SceneArt = {
  id: 'pf5-opener',
  label: 'At a study desk, a person holds up a credit card beside a calendar of payments all checked off in green, under a score meter whose needle rests in the green, while the cat sits by a stack of paid bills.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: pfSparkle, x: 55, y: 3, motion: { kind: 'twinkle', periodMs: 1700, min: 0.4 } },
    { sprite: needleGlow, x: 22, y: 13, motion: { kind: 'twinkle', periodMs: 2200, min: 0.3 } },
    { sprite: pfPaydayRing, x: 70, y: 14, motion: { kind: 'twinkle', periodMs: 1400, min: 0.15 } },
    { sprite: lampLight, x: 20, y: 32, motion: { kind: 'twinkle', periodMs: 3200, min: 0.5 } },
    // The cat sits on the desk top (row 37), under the raised card.
    { sprite: pfCatSit, x: 48, y: 27 },
  ],
};

export const pf5Finish = pfKeepsake(
  'pf5-finish',
  'A gold house-shaped key fob with a teal roof on a key ring with a brass key, its window showing a score meter with its needle in the green, with small sparkles around it.',
  emblemScore,
);

export const art: LessonArtSet = { opener: pf5Opener, backdrop: pfBackdrop, finish: pf5Finish };
