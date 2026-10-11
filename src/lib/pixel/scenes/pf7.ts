/**
 * Personal Finance lesson 7, Taxes 101: filing before the deadline.
 *
 * The kitchen late at night, seen closer: the table top runs deep, so the return lies flat on it with
 * a calculator and the year's W-2s, and the figure bends over the form with a pencil. On the wall a
 * calendar turned to April, the fifteenth ringed in red; the window is dark under a moon. The cat
 * sleeps on the table among the papers. Moving: the pencil, the ring, the lamp, the coffee's steam,
 * two stars, the cat's z.
 */
import type { PixelSprite } from '../types';
import {
  pfCat,
  pfCompose,
  pfCurtain,
  pfKitchen,
  pfLampGlow,
  pfLampPool,
  pfPendantLamp,
  pfZzz,
} from './pf-kit';
import { pfMug, pfSteam, pfWindowNight } from './pf-kit-a';
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

/** The figure with its head bowed over the table, eyes down. Its arms are a separate stamp on the table. */
const saverBowed: PixelSprite = {
  id: 'pf7-saver-bowed',
  name: 'saver bowed',
  tags: ['scene', 'pf'],
  palette: SKIN,
  rows: [
    '.....HHHHHH.....',
    '....HjjjjjjH....',
    '...HjjjjjjjjH...',
    '..HjjjjjjjjjjH..',
    '..HjjjMCCjjjjH..',
    '..HjjCCCCCCjjH..',
    '..HCCCCCCCCCCH..',
    '..HMCKCCCCKCUH..',
    '...MCCCUUCCCU...',
    '....UCCCCCCU....',
    '......UUUU......',
    '...bBBBBBBBBb...',
    '..bBBBwBBwBBBb..',
    '.bBBBBwBBwBBBBb.',
    '.bBBBBBBBBBBBBb.',
    '.bBBbBBBBBBbBBb.',
    '.bBBbBBBBBBbBBb.',
    '.bBBbBBBBBBbBBb.',
    '.bBBbBBBBBBbBBb.',
    '.bBBbBBBBBBbBBb.',
    '.bBBbBBBBBBbBBb.',
    '.bBBbBBBBBBbBBb.',
    '.bBBbBBBBBBbBBb.',
    '.bBBbBBBBBBbBBb.',
    '.bBBbBBBBBBbBBb.',
    '.bBBbBBBBBBbBBb.',
  ],
};

/** The forearms laid forward on the table top, hands on the form: stamp at the figure's x, row 36. */
const forearms: PixelSprite = {
  id: 'pf7-forearms',
  name: 'forearms',
  tags: ['scene', 'pf'],
  palette: SKIN,
  rows: [
    '.bBBb......bBBb.',
    '.bBBb......bBBb.',
    '..bBBb....bBBb..',
    '...MCC....CCM...',
    '...UCU....UCU...',
  ],
};

/** The kitchen table seen from higher: `depth` rows of top, so paper can lie flat on it. */
function deepTable(width: number, depth: number, legs: number): PixelSprite {
  const span = (edge: string, fill: string) => edge + fill.repeat(width - 2) + edge;
  const leg = '.OgO' + '.'.repeat(width - 8) + 'OgO.';
  return {
    id: `pf7-deep-table-${String(width)}`,
    name: 'deep table',
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

/** The return, flat on the table: a blue form header, then lines to fill. */
const taxForm: PixelSprite = {
  id: 'pf7-tax-form',
  name: 'tax form',
  tags: ['scene', 'pf'],
  rows: [
    'wbbbbbbbwwwwwwwwwwwx',
    'wwwwwwwwwwwwwwwwwwwx',
    'wxxxxwxxxxxwwxxxxwwx',
    'wwwwwwwwwwwwwwwwwwwx',
    'wxxxxxwxxxxwwwxxxwwx',
    'xxxxxxxxxxxxxxxxxxxx',
  ],
};

const w2Stack: PixelSprite = {
  id: 'pf7-w2-stack',
  name: 'W-2 stack',
  tags: ['scene', 'pf'],
  rows: [
    'wwwwwwwwx',
    'wrrwxxwwx',
    'xxxxxxxxx',
  ],
};

/** A calculator lying flat, green readout at the top. */
const calculator: PixelSprite = {
  id: 'pf7-calculator',
  name: 'calculator',
  tags: ['scene', 'pf'],
  rows: [
    'DDDDDDD',
    'DnNNNnD',
    'DDDDDDD',
    'DxDxDxD',
    'DxDxDGD',
    'DDDDDDD',
  ],
};

/** The pencil in the hand, writing: its tip steps along the line and back. */
const pencil: PixelSprite = {
  id: 'pf7-pencil',
  name: 'pencil',
  tags: ['scene', 'pf'],
  rows: ['....F..', '...G...', '..G....', '.g.....', 'K......'],
  frames: [
    ['....F..', '...G...', '..G....', '.g.....', 'K......'],
    ['.....F.', '....G..', '...G...', '..g....', '.K.....'],
    ['......F', '.....G.', '....G..', '...g...', '..K....'],
    ['.....F.', '....G..', '...G...', '..g....', '.K.....'],
  ],
  frameMs: 300,
};

/** The wall calendar turned to APR, the fifteenth in red; deadlineRing pulses around it. */
const aprilCalendar: PixelSprite = {
  id: 'pf7-april-calendar',
  name: 'april calendar',
  tags: ['scene', 'pf'],
  rows: [
    '...D.......D...',
    'rRRDRRRRRRRDRRr',
    'rRRwRRwwRRwwRRr',
    'rRwRwRwRwRwRwRr',
    'rRwwwRwwRRwwRRr',
    'rRwRwRwRRRwRwRr',
    'rrrrrrrrrrrrrrr',
    'wwwwwwwwwwwwwwx',
    'wXwXwXwXwXwXwXx',
    'wwwwwwwwwwwwwwx',
    'wXwXwXwRwXwXwXx',
    'wwwwwwwwwwwwwwx',
    'wXwXwXwXwXwXwXx',
    'wwwwwwwwwwwwwwx',
    'xxxxxxxxxxxxxxx',
  ],
};

const deadlineRing: PixelSprite = {
  id: 'pf7-deadline-ring',
  name: 'deadline ring',
  tags: ['scene', 'pf'],
  rows: [
    'RRR',
    'R.R',
    'RRR',
  ],
};

const moon: PixelSprite = {
  id: 'pf7-moon',
  name: 'moon',
  tags: ['scene', 'pf'],
  rows: [
    '.ww.',
    'wwwx',
    'wwxx',
    '.xx.',
  ],
};

const star: PixelSprite = {
  id: 'pf7-star',
  name: 'star',
  tags: ['scene', 'pf'],
  rows: [
    'x',
  ],
};

/** Lesson 7's emblem: the return with its blue header, and the pencil filling it in. */
const emblemTaxes: PixelSprite = {
  id: 'pf7-emblem-taxes',
  name: 'pf7-emblem-taxes',
  tags: ['scene', 'pf', 'emblem'],
  rows: [
    '.wwwwwwwx.....',
    '.wbbbwwwx...F.',
    '.wwwwwwwx..Gg.',
    '.wxxxxwwx.Gg..',
    '.wwwwwwwxGg...',
    '.wxxxwxxGg....',
    '.wwwwwwGgx....',
    '.wxxxxKwwx....',
    '.xxxxxxxxx....',
  ],
};

// Order is depth: the figure behind the table, its forearms and everything flat on the top after it.
const base = pfCompose('pf7-opener-base', 80, 60, pfKitchen.rows, [
  [aprilCalendar, 6, 5],
  [pfWindowNight, 53, 4],
  [pfCurtain, 52, 3],
  [pfCurtain, 76, 3],
  [moon, 69, 6],
  [pfPendantLamp, 34, 0],
  [saverBowed, 30, 12],
  [deepTable(72, 7, 10), 4, 36],
  [pfLampPool, 28, 37],
  [taxForm, 28, 38],
  [forearms, 30, 36],
  [w2Stack, 17, 40],
  [calculator, 51, 38],
  [pfMug, 12, 33],
  [pfCat, 60, 34],
]);

export const pf7Opener: SceneArt = {
  id: 'pf7-opener',
  label: 'Late at night at the kitchen table, a person fills in a tax form with a pencil beside a calculator and a mug of coffee, under a calendar turned to April with the fifteenth circled, while the cat sleeps on the table.',
  width: 80,
  height: 60,
  base,
  layers: [
    // The pencil sits in the left hand (forearms at 30,36; hand at columns 3 to 5, rows 3 and 4).
    { sprite: pencil, x: 31, y: 36 },
    { sprite: deadlineRing, x: 12, y: 14, motion: { kind: 'twinkle', periodMs: 1400, min: 0.15 } },
    { sprite: pfLampGlow, x: 35, y: 9, motion: { kind: 'twinkle', periodMs: 3000, min: 0.55 } },
    { sprite: pfSteam, x: 13, y: 27, motion: { kind: 'rise', amp: 3, periodMs: 2400 } },
    { sprite: star, x: 59, y: 8, motion: { kind: 'twinkle', periodMs: 2300, min: 0.2 } },
    { sprite: star, x: 64, y: 12, motion: { kind: 'twinkle', periodMs: 3100, min: 0.2, phase: 0.5 } },
    { sprite: pfZzz, x: 59, y: 29, motion: { kind: 'rise', amp: 3, periodMs: 2800, phase: 0.3 } },
  ],
};

export const pf7Finish = pfKeepsake(
  'pf7-finish',
  'A gold house-shaped key fob with a teal roof on a key ring with a brass key, its window showing a tax form with a pencil filling it in, with small sparkles around it.',
  emblemTaxes,
);

export const art: LessonArtSet = { opener: pf7Opener, backdrop: pfBackdrop, finish: pf7Finish };
