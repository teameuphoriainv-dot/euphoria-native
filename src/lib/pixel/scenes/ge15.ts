/**
 * Global Economics lesson 15: trade wars and tariffs, at a strait by day.
 *
 * Two harbors face each other across a narrow strait, one under an emerald flag and the other under
 * a red one, and neither is loading ships any more: each crane is stacking its own country's
 * containers into a wall, the next one always on its way down, while a cargo ship sits stuck in the
 * channel between them. A tariff answered by a tariff is a wall answered by a wall. Only small layers
 * move: the two loads, the cranes' lights, the two flags, the stuck ship, two clouds, a gull and
 * glints on the water.
 *
 * The keepsake's emblem is a container with a red tariff tag hanging from it.
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
 * each other across the channel, their decks from row 40 and their inner edges at x 25 and x 54.
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
    'XXXXXXXXXXXXXXXXXXXXXXXXXxkRRRzzzRRRzzzRRRzzzRRRzzzRRDxXXXXXXXXXXXXXXXXXXXXXXXXX',
    'GGGGGGXXXGGGGGGXXXGGGGGGXxkrrrxxxrrrxxxrrrxxxrrrxxxrrDxXGGGGGGXXXGGGGGGXXXGGGGGG',
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

/** A flagpole below its flag, 3x10, on a small foot: the flag layer carries the top ten rows. */
const pole: PixelSprite = {
  id: 'ge15-opener-pole',
  name: 'flagpole',
  tags: ['ge15', 'prop'],
  blurb: 'The lower part of a flagpole on a small foot.',
  palette: GE_PALETTE,
  rows: [
    '.X.',
    '.X.',
    '.X.',
    '.X.',
    '.X.',
    '.X.',
    '.X.',
    '.X.',
    '.X.',
    'DDD',
  ],
};

const box = (ch: string) => geTint(geContainer, `ge15-opener-box-${ch}`, { r: ch });

/** A crane's load, 8x8: the cable, the spreader and the next container for the wall. */
function load(id: string, ch: string): PixelSprite {
  const rows = geStamp(['...X....', '...X....', '...X....', '...X....', 'DDDDDDDD', '........', '........', '........'], box(ch).rows, 0, 5);
  return { id, name: 'crane load', tags: ['ge15', 'trade'], blurb: 'A container hanging from a crane cable.', palette: GE_PALETTE, rows };
}

/* ── the opener ─────────────────────────────────────────────────────────────────────────────── */

/** Each side's crane, the wall of three containers under its trolley, and its flag on the channel edge. */
const OURS = { crane: 0, wall: 16, flag: 24, colours: ['n', 't', 'n'], next: 'N' } as const;
const THEIRS = { crane: 56, wall: 57, flag: 49, colours: ['r', '3', 'r'], next: 'R' } as const;
const CRANE_Y = 22;
/** The walls' top container sits on row 41; the bottom one on the deck at row 49. */
const WALL_TOP = 41;
const FLAG_TOP = 30;

const theirCrane = geMirror(tallCrane, 'ge15-opener-crane-theirs');
const wall = (side: typeof OURS | typeof THEIRS) =>
  side.colours.map((ch, i) => ({ sprite: box(ch), x: side.wall, y: WALL_TOP + 3 * i }));

const base = geCompose('ge15-opener-base', strait, [
  { sprite: tallCrane, x: OURS.crane, y: CRANE_Y },
  { sprite: theirCrane, x: THEIRS.crane, y: CRANE_Y },
  ...wall(OURS),
  ...wall(THEIRS),
  { sprite: pole, x: OURS.flag - 1, y: FLAG_TOP + 10 },
  { sprite: pole, x: THEIRS.flag + 5, y: FLAG_TOP + 10 },
]);

/** Their flag flies the other way, toward the channel, so the two flags face each other. */
const theirFlag = geLater(geMirror(geFlagRed, 'ge15-opener-flag-theirs-mirror'), 'ge15-opener-flag-theirs', 1, 340);
const gullLater = geLater(geGull, 'ge15-opener-gull-later', 1, 520);

export const ge15Opener: SceneArt = {
  id: 'ge15-opener',
  label: 'Two harbors face each other across a narrow strait, each flying its own flag, while their cranes stack walls of green and red containers higher and a cargo ship sits stuck in the channel between them.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: load('ge15-opener-load-ours', OURS.next), x: OURS.wall, y: WALL_TOP - 9, motion: { kind: 'bob', amp: 2, periodMs: 2800 } },
    { sprite: load('ge15-opener-load-theirs', THEIRS.next), x: THEIRS.wall, y: WALL_TOP - 9, motion: { kind: 'bob', amp: 2, periodMs: 2800, phase: 0.5 } },
    { sprite: geBeacon, x: OURS.crane + GE_CRANE_TIP.x, y: CRANE_Y + GE_CRANE_TIP.y },
    { sprite: geLater(geBeacon, 'ge15-opener-beacon-theirs', 1, 900), x: THEIRS.crane + 23 - GE_CRANE_TIP.x, y: CRANE_Y + GE_CRANE_TIP.y },
    { sprite: geFlag, x: OURS.flag, y: FLAG_TOP },
    { sprite: theirFlag, x: THEIRS.flag, y: FLAG_TOP },
    { sprite: geShipFar, x: 29, y: 46, motion: { kind: 'bob', amp: 1, periodMs: 3400 } },
    { sprite: geCloud, x: 32, y: 4, motion: { kind: 'drift', amp: 4, periodMs: 12000 } },
    { sprite: geCloudSmall, x: 6, y: 9, motion: { kind: 'drift', amp: 3, periodMs: 9500, phase: 0.5 } },
    { sprite: geGull, x: 40, y: 15, motion: { kind: 'drift', amp: 3, periodMs: 7000 } },
    { sprite: gullLater, x: 62, y: 12, motion: { kind: 'drift', amp: 2, periodMs: 8400, phase: 0.4 } },
    { sprite: geGlintDay, x: 33, y: 56 },
  ],
};

/* ── the keepsake ───────────────────────────────────────────────────────────────────────────── */

/** A tariff: a shipping container with a red tag hung from it, swinging. */
const emblemTariff: PixelSprite = {
  id: 'ge15-emblem-tariff',
  name: 'emblem tariff',
  tags: ['ge', 'emblem', 'animated'],
  blurb: 'A blue shipping container with a red tag hanging from it on a short string, swinging.',
  palette: GE_PALETTE,
  rows: [
    '................',
    'nnnnnnnnnnnnnnnJ',
    'nmmmmmmmmmmmmmmJ',
    'nJnJnJnJnJnJnJnJ',
    'nJnJnJnJnJnJnJnJ',
    'nJnJnJnJnJnJnJnJ',
    'JJJJJJJJJJJJJJJJ',
    '...........1....',
    '..........1K1...',
    '.........1sRR1..',
    '........1sRRRr1.',
    '........1RzzzR1.',
    '........1RRRRr1.',
    '........1RzzRr1.',
    '........1RRRrr1.',
    '.........11111..',
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
      '...........1....',
      '..........1K1...',
      '.........1sRR1..',
      '........1sRRRr1.',
      '........1RzzzR1.',
      '........1RRRRr1.',
      '........1RzzRr1.',
      '........1RRRrr1.',
      '.........11111..',
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
      '.........1K1....',
      '........1sRR1...',
      '.......1sRRRr1..',
      '.......1RzzzR1..',
      '.......1RRRRr1..',
      '.......1RzzRr1..',
      '.......1RRRrr1..',
      '........11111...',
    ],
  ],
  frameMs: 650,
};

export const ge15Finish: SceneArt = geKeepsake(
  'ge15-finish',
  'A postage stamp with perforated edges and an emerald frame, showing a blue shipping container with a red tariff tag hanging from it, with small sparkles around it.',
  emblemTariff,
);

export const art: LessonArtSet = { opener: ge15Opener, backdrop: geBackdrop, finish: ge15Finish };
