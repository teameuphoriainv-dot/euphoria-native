/**
 * Global Economics lesson 15: trade wars and tariffs, at a strait by day.
 *
 * Two harbors face each other across a narrow strait, one under an emerald flag on its crane and the
 * other under a red one, and trade has not stopped: a cargo ship is crossing between them. A tariff is
 * a tax on imports, so each crane is landing the OTHER country's containers, and each stack wears a
 * percent tag in its own side's colour: the emerald side taxes the red boxes, the red side answers by
 * taxing the emerald ones. On the emerald quay the cost lands at home: a coin goes into the customs
 * booth (the importer pays, its barrier raised, so the goods come through), and the price tag beside
 * the imports reads 125, the lesson's 100 dollar shipment under a 25% tariff (the consumer pays). Only
 * small layers move: the two loads, the tags, the coin, the cranes' lights, the two flags, the ship,
 * two clouds, a gull and glints on the water.
 *
 * The keepsake's emblem is a container with a red percent tag hanging from it.
 */
import type { PixelSprite } from '../types';
import { geBackdrop } from './ge-backdrop';
import {
  GE_CRANE_TIP,
  GE_PALETTE,
  geBeacon,
  geCompose,
  geContainer,
  geCrane,
  geFlag,
  geGull,
  geLater,
  geMirror,
  geShipFar,
  geStamp,
  geTint,
} from './ge-kit';
import { geCloud, geCloudSmall, geFlagRed, geGlintDay } from './ge-kit-a';
import { geKeepsake } from './ge1-finish';
import type { LessonArtSet, SceneArt } from './types';

/* ── one-off props ──────────────────────────────────────────────────────────────────────────── */

/**
 * The strait by day, 80x60: the open sea to the horizon between two far coasts, and two quays facing
 * each other across an open channel, their decks from row 40 and their inner edges at x 25 and x 54.
 */
const strait: PixelSprite = {
  id: 'ge15-opener-strait',
  name: 'strait by day',
  tags: ['ge15', 'ground'],
  blurb: 'A blue sky over two green coasts, the open sea between them, and two concrete quays facing each other across a channel.',
  palette: GE_PALETTE,
  rows: [
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbBBBBBBBBbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbBBBBBBBBBbbbbbbbbbbbbbbbbbbb',
    'bbbbbbBBBBBBBBBBBBBBBBBBBBBbbbbbbbbbbbbbbbbbbbBBBBBBBBBBBBBBBBBBBBBBBbbbbbbbbbbb',
    'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBbbbbbBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
    'BBBBBtttttBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBtttttBBBBBBBBtttt',
    'ttttttttttttttBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBttttttttttttttttttt',
    'ttttttttttttttttttBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBtttttttttttttttttttttt',
    'ttttttttttttttttttttttBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBttttttttttttttttttttttttt',
    'nnnnnnnnnnnnnnntttttttttttBBBBBBBBBBBBBBBBBBBBBBBBBBBtttttttttttttnnnnnnnnnnnnnn',
    'nnnnnnnnnnnnnnnnnnnnnnnntttttBBBBBBBBBBBBBBBBBBBBBBttttttnnnnnnnnnnnnnnnnnnnnnnn',
    'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnttBBBBBBBBBBBBBBBBBBtttnnnnnnnnnnnnnnnnnnnnnnnnnnnn',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbBBBBBBbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbBBBBBbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
    'ddBBBBBBddddddddddddddddddddddddddddddddddddddddddddddddddddBBBBBBBddddddddddddd',
    'ddddddddddddddddddddddddddddddbbbbbbbbdddddddddddddddddddddddddddddddddddddddddd',
    'ddddddddddddddBBBBBdddddddddddddddddddddddddddddddddddddddddddddddBBBBBBdddddddd',
    'ddddddddddddddddddddddddddddddddddddddddddbbbbbbdddddddddddddddddddddddddddddddd',
    'ddddBBBBBBBBdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
    'ddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddBBBBBddddd',
    'ddddddddddddddddddddddddddddbbbbbddddddddddddddddddddddddddddddddddddddddddddddd',
    'xxxxxxxxxxxxxxxxxxxxxxxxxxddddddddddddddddddddddddddddxxxxxxxxxxxxxxxxxxxxxxxxxx',
    'DDDDDDDDDDDDDDDDDDDDDDDDDxkdddddddddddddddddddbbbbbbdDxDDDDDDDDDDDDDDDDDDDDDDDDD',
    'XXXXXXXXXXXXXXXXXXXXXXXXXxkddddddddddddddddddddddddddDxXXXXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXxkddddddbbbbbbbdddddddddddddDxXXXXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXxkddddddddddddddddddddddddddDxXXXXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXxkdddddddddddddddddbbbbbddddDxXXXXXXXXXXXXXXXXXXXXXXXXX',
    'GGGGGGXXXGGGGGGXXXGGGGGGXxkddddddddddddddddddddddddddDxXGGGGGGXXXGGGGGGXXXGGGGGG',
    'XXXXXXXXXXXXXXXXXXXXXXXXXxkddddddddddddddddddddddddddDxXXXXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXxkddddddddddddddddddddddddddDxXXXXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXkKXxkddddddddddddddbbbbbbbbddddDxXKkXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXkkXxkddddddddddddddddddddddddddDxXkkXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXxkddddddddddddddddddddddddddDxXXXXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXxkdddbbbbbbdddddddddddddddddDxXXXXXXXXXXXXXXXXXXXXXXXXX',
    'DDDDDDDDDDDDDDDDDDDDDDDDDxkddddddddddddddddddddddddddDxDDDDDDDDDDDDDDDDDDDDDDDDD',
    'XXXXXXXXXXXXXXXXXXXXXXXXXxkcccddddddcccccccccccccccccDxXXXXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXxkcccccccccccccccccddddddddcDxXXXXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXxkccccccccccccccccccccccccccDxXXXXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXkKXxkccccccdddddddcccccccccccccDxXKkXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXkkXxkccccccccccccccccccccccccccDxXkkXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXxkcccccccccccccccccccddddddcDxXXXXXXXXXXXXXXXXXXXXXXXXX',
    'DDDDDDDDDDDDDDDDDDDDDDDDDxkcdddddccccccccccccccccccccDxDDDDDDDDDDDDDDDDDDDDDDDDD',
    'DDDDDDDDDDDDDDDDDDDDDDDDDxkccccccccccccccccccccccccccDxDDDDDDDDDDDDDDDDDDDDDDDDD',
  ],
};

/** geCrane with five more rows of leg, so its load clears a stack three containers high. */
const tallCrane: PixelSprite = {
  ...geCrane,
  id: 'ge15-opener-crane',
  rows: [...geCrane.rows.slice(0, 15), ...Array.from({ length: 5 }, () => geCrane.rows[15]), ...geCrane.rows.slice(16)],
};

/** The customs booth on the emerald quay, 8x9: an emerald roof, a dark window and a door. */
const booth: PixelSprite = {
  id: 'ge15-opener-booth',
  name: 'customs booth',
  tags: ['ge15', 'prop'],
  blurb: 'A small customs booth with an emerald roof, a dark window and a door.',
  palette: GE_PALETTE,
  rows: [
    'DDDDDDDD',
    'DnnnnnnD',
    'DNNNNNND',
    '.DxxxxD.',
    '.DKKKKD.',
    '.DKKKKD.',
    '.DxDDxD.',
    '.DxDKxD.',
    '.DDDDDD.',
  ],
};

/** The booth's barrier, 3x10, raised straight up on its post: goods pass, they just pay. */
const barrier: PixelSprite = {
  id: 'ge15-opener-barrier',
  name: 'raised barrier',
  tags: ['ge15', 'prop'],
  blurb: 'A red and white striped barrier arm raised upright on its post.',
  palette: GE_PALETTE,
  rows: [
    '.z.',
    '.z.',
    '.R.',
    '.R.',
    '.z.',
    '.z.',
    '.R.',
    '.R.',
    'DXD',
    'DDD',
  ],
};

/** The price tag on the emerald quay, 13x8: 125, the lesson's 100 dollar shipment after a 25% tariff. */
const priceTag: PixelSprite = {
  id: 'ge15-opener-price',
  name: 'price tag',
  tags: ['ge15', 'prop', 'money'],
  blurb: 'A cream price card reading 125.',
  palette: GE_PALETTE,
  rows: [
    'OOOOOOOOOOOOO',
    'OAKAAKKAAKKKO',
    'OKKAAAAKAKAAO',
    'OAKAAAKAAKKAO',
    'OAKAAKAAAAAKO',
    'OKKKAKKKAKKAO',
    'OSSSSSSSSSSSO',
    'OOOOOOOOOOOOO',
  ],
};

/** A tariff tag on its string, 11x9, swinging a pixel out and back. */
function tariffTag(id: string, blurb: string, frames: string[][]): PixelSprite {
  return { id, name: 'tariff tag', tags: ['ge15', 'animated'], blurb, palette: GE_PALETTE, rows: frames[0], frames, frameMs: 900 };
}

/** The emerald side's tariff: an emerald tag with a white percent sign, hung from the left corner of its stack. */
const tagOurs = tariffTag('ge15-opener-tag-ours', 'An emerald tag with a white percent sign on a string, swinging.', [
  [
    '..........D',
    '..........D',
    '.JJJJJJJ..D',
    '.JzznnnzJ.D',
    '.JzznnznnJD',
    '.JnnnznnnKJ',
    '.JnnznzznJ.',
    '.JnznnzzJ..',
    '.JJJJJJJ...',
  ],
  [
    '..........D',
    '..........D',
    'JJJJJJJ..D.',
    'JzznnnzJ.D.',
    'JzznnznnJD.',
    'JnnnznnnKJ.',
    'JnnznzznJ..',
    'JnznnzzJ...',
    'JJJJJJJ....',
  ],
]);

/** The red side's answer: a red tag with a white percent sign, hung from the right corner of its stack. */
const tagTheirs = tariffTag('ge15-opener-tag-theirs', 'A red tag with a white percent sign on a string, swinging.', [
  [
    'D..........',
    'D..........',
    'D..1111111.',
    'D.1zzrrrz1.',
    'D1rzzrrzr1.',
    '1Krrrrzrr1.',
    '.1rrrzrzz1.',
    '..1rzrrzz1.',
    '...1111111.',
  ],
  [
    'D..........',
    'D..........',
    '.D..1111111',
    '.D.1zzrrrz1',
    '.D1rzzrrzr1',
    '.1Krrrrzrr1',
    '..1rrrzrzz1',
    '...1rzrrzz1',
    '....1111111',
  ],
]);

/** The importer's coin, 8x3: passed in at the booth's window, then gone, then the next one. */
const coinIn: PixelSprite = {
  id: 'ge15-opener-coin',
  name: 'coin paid in',
  tags: ['ge15', 'money', 'animated'],
  blurb: 'A gold coin sliding left into a window, then gone.',
  palette: GE_PALETTE,
  rows: [
    '.O......',
    'OyO.....',
    '.O......',
  ],
  frames: [
    [
      '.....O..',
      '....OyO.',
      '.....O..',
    ],
    [
      '...O....',
      '..OyO...',
      '...O....',
    ],
    [
      '.O......',
      'OyO.....',
      '.O......',
    ],
    [
      '........',
      '........',
      '........',
    ],
  ],
  frameMs: 600,
};

const box = (ch: string) => geTint(geContainer, `ge15-opener-box-${ch}`, { r: ch });

/** A crane's load, 8x8: the cable, the spreader and the next container for the stack. */
function load(id: string, ch: string): PixelSprite {
  const rows = geStamp(['...X....', '...X....', '...X....', '...X....', 'DDDDDDDD', '........', '........', '........'], box(ch).rows, 0, 5);
  return { id, name: 'crane load', tags: ['ge15', 'trade'], blurb: 'A container hanging from a crane cable.', palette: GE_PALETTE, rows };
}

/* ── the opener ─────────────────────────────────────────────────────────────────────────────── */

/**
 * Each side's crane, the stack of the OTHER side's containers under its trolley, and that side's
 * flag on its crane's apex. The emerald quay lands red boxes; the red quay lands emerald ones.
 */
const OURS = { crane: 0, stack: 16, imports: ['r', '3', 'r'], next: 'R' } as const;
const THEIRS = { crane: 56, stack: 57, imports: ['n', 't', 'n'], next: 'N' } as const;
const CRANE_Y = 22;
/** The stacks' top container sits on row 41; the bottom one on the deck at row 49. */
const STACK_TOP = 41;
/** A flag's pole foot stands on its crane's apex (row 22); the mirrored crane's apex is at x 68. */
const FLAG_TOP = CRANE_Y - 10;
/** The customs corner of the emerald quay: barrier, booth, the coin at its window, the price tag. */
const BOOTH = { x: 3, y: 51 };

const theirCrane = geMirror(tallCrane, 'ge15-opener-crane-theirs');
const stack = (side: typeof OURS | typeof THEIRS) =>
  side.imports.map((ch, i) => ({ sprite: box(ch), x: side.stack, y: STACK_TOP + 3 * i }));

const base = geCompose('ge15-opener-base', strait, [
  { sprite: tallCrane, x: OURS.crane, y: CRANE_Y },
  { sprite: theirCrane, x: THEIRS.crane, y: CRANE_Y },
  ...stack(OURS),
  ...stack(THEIRS),
  { sprite: barrier, x: BOOTH.x - 3, y: BOOTH.y - 1 },
  { sprite: booth, x: BOOTH.x, y: BOOTH.y },
  { sprite: priceTag, x: 13, y: BOOTH.y },
]);

/** Their flag flies the other way, toward the channel, so the two flags face each other. */
const theirFlag = geLater(geMirror(geFlagRed, 'ge15-opener-flag-theirs-mirror'), 'ge15-opener-flag-theirs', 1, 340);
const gullLater = geLater(geGull, 'ge15-opener-gull-later', 1, 520);
/** The ship has crossed from the red side and is heading in to the emerald quay, bow first. */
const shipIn = geMirror(geShipFar, 'ge15-opener-ship-in');

export const ge15Opener: SceneArt = {
  id: 'ge15-opener',
  label: 'A cargo ship crosses a strait between two harbors whose cranes stack the other country\'s containers, and each stack wears a percent tariff tag in its own side\'s colour, while on the emerald quay a gold coin goes into a customs booth with its barrier raised, beside a price tag reading 125.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: load('ge15-opener-load-ours', OURS.next), x: OURS.stack, y: STACK_TOP - 9, motion: { kind: 'bob', amp: 2, periodMs: 2800 } },
    { sprite: load('ge15-opener-load-theirs', THEIRS.next), x: THEIRS.stack, y: STACK_TOP - 9, motion: { kind: 'bob', amp: 2, periodMs: 2800, phase: 0.5 } },
    { sprite: tagOurs, x: OURS.stack - 11, y: STACK_TOP },
    { sprite: geLater(tagTheirs, 'ge15-opener-tag-theirs-later', 1, 900), x: THEIRS.stack + 8, y: STACK_TOP },
    { sprite: coinIn, x: BOOTH.x + 3, y: BOOTH.y + 4 },
    { sprite: geBeacon, x: OURS.crane + GE_CRANE_TIP.x, y: CRANE_Y + GE_CRANE_TIP.y },
    { sprite: geLater(geBeacon, 'ge15-opener-beacon-theirs', 1, 900), x: THEIRS.crane + 23 - GE_CRANE_TIP.x, y: CRANE_Y + GE_CRANE_TIP.y },
    { sprite: geFlag, x: OURS.crane + GE_CRANE_TIP.x + 1, y: FLAG_TOP },
    { sprite: theirFlag, x: THEIRS.crane + 23 - GE_CRANE_TIP.x - 7, y: FLAG_TOP },
    { sprite: shipIn, x: 29, y: 46, motion: { kind: 'drift', amp: 2, periodMs: 9000 } },
    { sprite: geCloud, x: 32, y: 4, motion: { kind: 'drift', amp: 4, periodMs: 12000 } },
    { sprite: geCloudSmall, x: 20, y: 8, motion: { kind: 'drift', amp: 3, periodMs: 9500, phase: 0.5 } },
    { sprite: geGull, x: 40, y: 15, motion: { kind: 'drift', amp: 3, periodMs: 7000 } },
    { sprite: gullLater, x: 50, y: 13, motion: { kind: 'drift', amp: 2, periodMs: 8400, phase: 0.4 } },
    { sprite: geGlintDay, x: 33, y: 56 },
  ],
};

/* ── the keepsake ───────────────────────────────────────────────────────────────────────────── */

/** A tariff: a shipping container with a red percent tag hung from it, swinging. */
const emblemTariff: PixelSprite = {
  id: 'ge15-emblem-tariff',
  name: 'emblem tariff',
  tags: ['ge', 'emblem', 'animated'],
  blurb: 'A green shipping container with a red tag marked with a white percent sign hanging from it on a short string, swinging.',
  palette: GE_PALETTE,
  rows: [
    '................',
    'nnnnnnnnnnnnnnnJ',
    'nmmmmmmmmmmmmmmJ',
    'nJnJnJnJnJnJnJnJ',
    'nJnJnJnJnJnJnJnJ',
    'nJnJnJnJnJnJnJnJ',
    'JJJJJJJJJJJJJJJJ',
    '..........11....',
    '.........1KK1...',
    '........1Rrrr1..',
    '.......1zzrrrz1.',
    '.......1zzrrzr1.',
    '.......1Rrrzrr1.',
    '.......1Rrzrzz1.',
    '.......1rzrrzz1.',
    '........111111..',
  ],
  frames: [
    [
      '................',
      'nnnnnnnnnnnnnnnJ',
      'nmmmmmmmmmmmmmmJ',
      'nJnJnJnJnJnJnJnJ',
      'nJnJnJnJnJnJnJnJ',
      'nJnJnJnJnJnJnJnJ',
      'JJJJJJJJJJJJJJJJ',
      '..........11....',
      '.........1KK1...',
      '........1Rrrr1..',
      '.......1zzrrrz1.',
      '.......1zzrrzr1.',
      '.......1Rrrzrr1.',
      '.......1Rrzrzz1.',
      '.......1rzrrzz1.',
      '........111111..',
    ],
    [
      '................',
      'nnnnnnnnnnnnnnnJ',
      'nmmmmmmmmmmmmmmJ',
      'nJnJnJnJnJnJnJnJ',
      'nJnJnJnJnJnJnJnJ',
      'nJnJnJnJnJnJnJnJ',
      'JJJJJJJJJJJJJJJJ',
      '..........1X....',
      '........1KK1....',
      '.......1Rrrr1...',
      '......1zzrrrz1..',
      '......1zzrrzr1..',
      '......1Rrrzrr1..',
      '......1Rrzrzz1..',
      '......1rzrrzz1..',
      '.......111111...',
    ],
  ],
  frameMs: 650,
};

export const ge15Finish: SceneArt = geKeepsake(
  'ge15-finish',
  'A postage stamp with perforated edges and an emerald frame, showing a green shipping container with a red tariff tag marked with a percent sign hanging from it, with small sparkles around it.',
  emblemTariff,
);

export const art: LessonArtSet = { opener: ge15Opener, backdrop: geBackdrop, finish: ge15Finish };
