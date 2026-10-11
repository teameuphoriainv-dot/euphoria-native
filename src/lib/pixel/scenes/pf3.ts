/**
 * Personal Finance lesson 3, Tracking Your Spending: the month's receipts, all of them.
 *
 * The figure holds up one receipt so long it runs off the table and along the rug, where the cat,
 * awake for once, paws at its curled end. Small leaks sit on the table: a coffee steaming (the
 * latte factor) and a phone lighting up with another subscription charge. On the wall, a cork board
 * of pinned receipts and the calendar counting to payday. Moving: the cat's paw, the steam, the
 * phone's badge, the lamp's glow, the payday ring.
 */
import type { PixelSprite } from '../types';
import {
  pfCalendar,
  pfCompose,
  pfKitchen,
  pfLampGlow,
  pfLampPool,
  pfPaydayRing,
  pfPendantLamp,
  pfTable,
} from './pf-kit';
import { pfMug, pfSaverHold, pfSteam } from './pf-kit-a';
import { pfKeepsake } from './pf1-finish';
import { pfBackdrop } from './pf-backdrop';
import type { LessonArtSet, SceneArt } from './types';

/** A cork board with three receipts and a sticky note pinned to it. */
const corkboard: PixelSprite = {
  id: 'pf3-corkboard',
  name: 'cork board',
  tags: ['scene', 'pf'],
  rows: [
    'OOOOOOOOOOOOOOOOOOOO',
    'OggggggggggggggggggO',
    'OggRggggggBggggggggO',
    'OgwwwwgggwwwwwggNggO',
    'OgwxxwgggwxxxwgwwwwO',
    'OgwwwwgggwwwwwgwxxwO',
    'OgwxxwgggwxxrwgwwwwO',
    'OgwwwwgggwwwwwgwxwwO',
    'OgwxwwgggwgwgwgwwwwO',
    'OgwwwwggggggggOwxxwO',
    'OgwgwgggyyyyygOwwwwO',
    'OgggggggyGGGygOwgwgO',
    'OgggggggyyyyygggggOO',
    'OggggggggggggggggggO',
    'OOOOOOOOOOOOOOOOOOOO',
  ],
};

/**
 * The month's receipt, held at its top by both hands (figure at its own x - 5), hanging down over
 * the table's front and running along the rug to a curl the cat can reach.
 */
const longReceipt: PixelSprite = {
  id: 'pf3-long-receipt',
  name: 'long receipt',
  tags: ['scene', 'pf'],
  rows: [
    'wwwwwx..........',
    'wxxwxx..........',
    'wwwwwx..........',
    'wxxxwx..........',
    'wwwwwx..........',
    'wxwxxx..........',
    'wwwwwx..........',
    'wxxwxx..........',
    'wwwwwx..........',
    'wxxxwx..........',
    'wwwwwx..........',
    'wxwxxx..........',
    'wwwwwx..........',
    'wxxwxx..........',
    'wwwwwx..........',
    'wxxxwx..........',
    'wwwwwx..........',
    'wxwxxx..........',
    'wwwwwx..........',
    'wxxwxx..........',
    'wwwwwx..........',
    'wxxxwx..........',
    'wwwwwx..........',
    'wxxwwwx.........',
    '.wwwwwwwx.......',
    '..xxwwwwwwwx....',
    '....xxxxwwwwwx..',
    '..........xwwx..',
  ],
};

/** A phone propped on the table, its screen a list of charges. pfPhoneBadge lights its corner. */
const phone: PixelSprite = {
  id: 'pf3-phone',
  name: 'phone',
  tags: ['scene', 'pf'],
  rows: [
    'DDDDDD',
    'DKKKKD',
    'DBxxKD',
    'DKKKKD',
    'DBxxKD',
    'DKKKKD',
    'DBxxKD',
    'DKKKKD',
    'DDxxDD',
  ],
};

const phoneBadge: PixelSprite = {
  id: 'pf3-phone-badge',
  name: 'phone badge',
  tags: ['scene', 'pf'],
  rows: [
    'RR',
    'rR',
  ],
};

/** The cat sitting up and pawing at the receipt's curl on its left: paw lifted, swiped, set down. */
const catPaw: PixelSprite = {
  id: 'pf3-cat-paw',
  name: 'cat pawing',
  tags: ['scene', 'pf'],
  rows: [
    '...1...1......',
    '..131.131...1.',
    '..1333331..131',
    '..13N3N31..131',
    '..1332331..131',
    '...13331111131',
    '...1334433331.',
    '...1334433331.',
    '...1334433331.',
    '...1441443331.',
    '...1111111111.',
  ],
  frames: [
    [
      '...1...1......',
      '..131.131...1.',
      '..1333331..131',
      '..13N3N31..131',
      '..1332331..131',
      '...13331111131',
      '...1334433331.',
      '...1334433331.',
      '...1334433331.',
      '...1441443331.',
      '...1111111111.',
    ],
    [
      '...1...1......',
      '..131.131.....',
      '..1333331...11',
      '..13N3N31..131',
      '..1332331..131',
      '...13331111131',
      '.111334433331.',
      '1441334433331.',
      '.111334433331.',
      '....1.1443331.',
      '...1111111111.',
    ],
    [
      '...1...1......',
      '..131.131.....',
      '..1333331...11',
      '..13N3N31..131',
      '..1332331..131',
      '...13331111131',
      '...1334433331.',
      '...1334433331.',
      '.111334433331.',
      '1441.11443331.',
      '.11.111111111.',
    ],
    [
      '...1...1......',
      '..131.131...1.',
      '..1333331..131',
      '..13N3N31..131',
      '..1332331..131',
      '...13331111131',
      '...1334433331.',
      '...1334433331.',
      '...1334433331.',
      '...1441443331.',
      '...1111111111.',
    ],
  ],
  frameMs: 520,
};

/** Lesson 3's emblem: a receipt under a magnifying glass that finds the red line on it. */
const emblemTracking: PixelSprite = {
  id: 'pf3-emblem-tracking',
  name: 'pf3-emblem-tracking',
  tags: ['scene', 'pf', 'emblem'],
  rows: [
    '.wwwwwx.......',
    '.wxxwxx.......',
    '.wwwXXXXX.....',
    '.wxXwwwwwX....',
    '.wwXRRRRwX....',
    '.wxXwwwwwX....',
    '.wwwXXXXXgO...',
    '.wxwxxx...gO..',
    '.w.w.w.....gO.',
  ],
};

// Order is depth: the figure behind the table, the receipt in front of both.
const base = pfCompose('pf3-opener-base', 80, 60, pfKitchen.rows, [
  [corkboard, 5, 6],
  [pfCalendar, 63, 6],
  [pfPendantLamp, 35, 0],
  [pfSaverHold, 32, 12],
  [pfTable(72, 12), 4, 36],
  [pfLampPool, 29, 37],
  [pfMug, 13, 32],
  [phone, 57, 29],
  [longReceipt, 37, 24],
]);

export const pf3Opener: SceneArt = {
  id: 'pf3-opener',
  label: 'At a kitchen table, a person holds up a receipt so long it spills off the table onto the rug, where the cat paws at its curl, beside a steaming mug, a phone showing a new charge and a board of pinned receipts.',
  width: 80,
  height: 60,
  base,
  layers: [
    // The cat sits on the rug with its paws on row 54, its reach landing on the receipt's curl.
    { sprite: catPaw, x: 50, y: 44 },
    { sprite: pfSteam, x: 14, y: 26, motion: { kind: 'rise', amp: 3, periodMs: 2400 } },
    { sprite: phoneBadge, x: 61, y: 28, motion: { kind: 'twinkle', periodMs: 1600, min: 0.2 } },
    { sprite: pfLampGlow, x: 36, y: 9, motion: { kind: 'twinkle', periodMs: 3000, min: 0.55 } },
    { sprite: pfPaydayRing, x: 66, y: 14, motion: { kind: 'twinkle', periodMs: 1400, min: 0.15, phase: 0.5 } },
  ],
};

export const pf3Finish = pfKeepsake(
  'pf3-finish',
  'A gold house-shaped key fob with a teal roof on a key ring with a brass key, its window showing a receipt under a magnifying glass, with small sparkles around it.',
  emblemTracking,
);

export const art: LessonArtSet = { opener: pf3Opener, backdrop: pfBackdrop, finish: pf3Finish };
