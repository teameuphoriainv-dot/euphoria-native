/**
 * Wealth Management lesson 12 (Social Security and government benefits): its opener, the pathway
 * backdrop and its keepsake, as one set loaded on demand.
 *
 * The opener is the estate's gate on the lane at night: stone piers with lanterns, the iron gates
 * open on a drive that climbs to the manor on its rise (the backdrop's house in small: two wings
 * and a white pediment over the door), low walls either side, a full moon. The grandmother sits on
 * a bench outside with an hourglass beside her, and by the lane stands the mailbox where the
 * monthly check arrives. The lesson's claiming decision is the picture: every year she waits, the
 * check grows. What moves: the sand runs while the envelope in the mailbox grows from a slip to a
 * fat sealed letter, then the year starts again; the mailbox's red flag stays down, because a raised
 * flag means mail going out. The gate lanterns flicker, the manor's windows glow, a firefly rises,
 * stars twinkle. The keepsake carries a sealed envelope.
 */
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';
import { wmBackdrop } from './wm-backdrop';
import {
  wmBands,
  wmCompose,
  wmFirefly,
  wmHourglass,
  wmLampFlame,
  wmLater,
  wmMirror,
  wmStar,
  wmStarDot,
  WM_INKS,
} from './wm-kit';
import { wmTreeline } from './wm-kit-a';
import { wmAshlar, wmCobbles, wmSkyDots } from './wm-kit-b';
import { wmKeepsake } from './wm1-finish';

/** The far manor's top-left, between the gate piers; its window glow is placed from it. */
const HOUSE_X = 34;
const HOUSE_Y = 27;

/** The mailbox's top-left; the envelope layer is placed from it. */
const MAILBOX_X = 61;
const MAILBOX_Y = 32;

const skyDots = wmSkyDots('wm12-opener-sky-dots', 80, 30, [
  [22, 3, 'X'],
  [36, 9, 'D'],
  [47, 2, 'X'],
  [58, 14, 'D'],
  [71, 4, 'X'],
  [77, 19, 'D'],
  [18, 21, 'D'],
  [2, 16, 'X'],
]);

const moon: PixelSprite = {
  id: 'wm12-opener-moon',
  name: 'wm12-opener-moon',
  tags: ['scene', 'wm12'],
  rows: [
    '..xwwwx..',
    '.xwwwwwx.',
    'xwwXwwwwx',
    'wwwwwwXwx',
    'wXwwwwwwx',
    'wwwwXwwxX',
    'xwwwwwwxX',
    '.xwwwwxX.',
    '..xxxXX..',
  ],
};

/** The rise the house stands on, behind the gate. */
const mound = wmTreeline('wm12-opener-mound', 31, 6, [[15, 15, 5]]);

/**
 * The manor far up the drive, the backdrop's house in small: a white pediment on two columns over
 * the door, slate roofs over the two wings, dim windows the glow layer lights. 16x8.
 */
const house: PixelSprite = {
  id: 'wm12-opener-house',
  name: 'wm12-opener-house',
  tags: ['scene', 'wm12'],
  rows: [
    '.......xX.......',
    '.....xwwwwX.....',
    '...kxwwwwwwXk...',
    'kkkkDDDDDDDDkkkk',
    'DkOkDXkkkkXDkOkD',
    'DkkkDXkOOkXDkkkD',
    'DkOkDXkOOkXDkOkD',
    'DDDDDDDDDDDDDDDD',
  ],
};

/** Gravel up the drive from the gateway to the house's door, narrowing with distance. 16x17. */
const drive: PixelSprite = {
  id: 'wm12-opener-drive',
  name: 'wm12-opener-drive',
  tags: ['scene', 'wm12'],
  rows: Array.from({ length: 17 }, (_, j) => {
    const half = 1 + (7 * j) / 16;
    return Array.from({ length: 16 }, (_, x) => (Math.abs(x - 7.5) <= half ? 'k' : '.')).join('');
  }),
};

/** A gate pier of dressed stone, lit down its left edge. 8x25. */
const pier: PixelSprite = {
  id: 'wm12-opener-pier',
  name: 'wm12-opener-pier',
  tags: ['scene', 'wm12'],
  rows: wmAshlar(6, 25, 'X', 'D', 4, 3).map((row) => `x${row}D`),
};

/** The pier's coping. 10x3. */
const pierCap: PixelSprite = {
  id: 'wm12-opener-pier-cap',
  name: 'wm12-opener-pier-cap',
  tags: ['scene', 'wm12'],
  rows: ['xwwwwwwwwX', 'XxxxxxxxxD', '.DDDDDDDD.'],
};

/** A gate lantern; its glass (x 1, y 2, 3x3) takes wmLampFlame. 5x6. */
const lantern: PixelSprite = {
  id: 'wm12-opener-lantern',
  name: 'wm12-opener-lantern',
  tags: ['scene', 'wm12'],
  rows: ['..D..', '.DXD.', 'DyGgD', 'DGyGD', 'DgGgD', '.DXD.'],
};

/** An iron gate leaf swung open against its pier: rails and bars seen edge on. 3x18. */
const gateLeaf: PixelSprite = {
  id: 'wm12-opener-gate-leaf',
  name: 'wm12-opener-gate-leaf',
  tags: ['scene', 'wm12'],
  rows: ['X..', 'DX.', 'DDX', 'D.D', 'D.D', 'DDD', ...Array.from({ length: 10 }, () => 'D.D'), 'DDD', 'D.D'],
};

/** A low wall of dark dressed stone under a lit coping. */
function wall(id: string, width: number): PixelSprite {
  return {
    id,
    name: id,
    tags: ['scene', 'wm12'],
    rows: [`${'x'.repeat(width - 1)}X`, `${'X'.repeat(width - 1)}D`, ...wmAshlar(width, 9, 'D', 'k', 6, 3)],
  };
}

/** A slatted wooden bench, front on: two back rails, the seat's lit edge, legs. 18x11. */
const bench: PixelSprite = {
  id: 'wm12-opener-bench',
  name: 'wm12-opener-bench',
  tags: ['scene', 'wm12'],
  palette: WM_INKS,
  rows: [
    'CCCCCCCCCCCCCCCCCU',
    'UUUUUUUUUUUUUUUUUO',
    '.O..............O.',
    'CCCCCCCCCCCCCCCCCU',
    'UUUUUUUUUUUUUUUUUO',
    '.O..............O.',
    'CCCCCCCCCCCCCCCCCU',
    'OOOOOOOOOOOOOOOOOO',
    '.KO............OK.',
    '.KO............OK.',
    '.KK............KK.',
  ],
};

/** The grandmother sitting: the kit's wmElder with her lap on the seat, her cane planted. 7x13. */
const elderSitting: PixelSprite = {
  id: 'wm12-opener-elder-sitting',
  name: 'wm12-opener-elder-sitting',
  tags: ['scene', 'wm12'],
  palette: WM_INKS,
  rows: [
    '..xwx..',
    '.xwwwx.',
    '.xCCCx.',
    '.xkCkx.',
    '..CCU..',
    '.pPPPp.',
    'pPqPPpp',
    'CPPPPpU',
    'OPPPPPp',
    'O.pPp..',
    'O.k.k..',
    'O.k.k..',
    'OKK.KK.',
  ],
};

/**
 * The mailbox, side on: a rounded tin box open at its left end, its red flag lowered along its
 * side, as it stays: the flag goes up only for mail going out. 12x7.
 */
const mailbox: PixelSprite = {
  id: 'wm12-opener-mailbox',
  name: 'wm12-opener-mailbox',
  tags: ['scene', 'wm12'],
  rows: [
    '..xxxxxxxx..',
    '.xXXXXXXXXD.',
    'KkXXXXXXXXXD',
    'KkXXXRXXXXXD',
    'KkXXXRrrrrXD',
    '.DDDDDDDDDD.',
    '....DXXD....',
  ],
};

const post: PixelSprite = {
  id: 'wm12-opener-post',
  name: 'wm12-opener-post',
  tags: ['scene', 'wm12'],
  palette: WM_INKS,
  rows: Array.from({ length: 14 }, () => 'CU'),
};

const base = wmCompose('wm12-opener-base', wmBands(80, [['K', 38], ['h', 22]]), [
  { sprite: skyDots, x: 0, y: 0 },
  { sprite: moon, x: 6, y: 3 },
  { sprite: mound, x: 27, y: 33 },
  { sprite: house, x: HOUSE_X, y: HOUSE_Y },
  { sprite: drive, x: 34, y: 35 },
  { sprite: wall('wm12-opener-wall-left', 26), x: 0, y: 40 },
  { sprite: wall('wm12-opener-wall-right', 22), x: 58, y: 40 },
  { sprite: pier, x: 26, y: 26 },
  { sprite: pier, x: 50, y: 26 },
  { sprite: pierCap, x: 25, y: 23 },
  { sprite: pierCap, x: 49, y: 23 },
  { sprite: lantern, x: 27, y: 17 },
  { sprite: lantern, x: 51, y: 17 },
  { sprite: gateLeaf, x: 34, y: 33 },
  { sprite: wmMirror(gateLeaf, 'wm12-opener-gate-leaf-right'), x: 47, y: 33 },
  { sprite: { id: 'wm12-opener-lane', name: 'wm12-opener-lane', tags: ['scene', 'wm12'], rows: wmCobbles(80, 8) }, x: 0, y: 52 },
  { sprite: bench, x: 3, y: 40 },
  { sprite: elderSitting, x: 6, y: 38 },
  { sprite: post, x: 66, y: 39 },
  { sprite: mailbox, x: MAILBOX_X, y: MAILBOX_Y },
]);

/* ── the check: it grows while she waits ─────────────────────────────────────────────────────── */

/** Envelopes poking out of the mailbox's open end, smallest to largest, right edges flush. */
const ENVELOPES: readonly (readonly string[])[] = [
  ['wwwx', 'xxxX'],
  ['wwwwwx', 'wxGyxx', 'xxxxxX'],
  ['wwwwwwwx', 'wxwwwwxx', 'wwxGyxwx', 'xxxxxxxX'],
];

/** The layer covers the biggest envelope's reach out of the box's mouth. 8x4. */
const MAIL_LAYER_X = MAILBOX_X - 6;
const MAIL_LAYER_Y = MAILBOX_Y + 1;

/** The mouth of the box with the envelope of `size` in it, or empty for -1. */
function mailFrame(size: number): string[] {
  const grid = wmBands(8, [['.', 4]]).map((row) => [...row]);
  const envelope = ENVELOPES[size];
  if (envelope) {
    const width = envelope[0].length;
    envelope.forEach((row, j) => {
      [...row].forEach((ch, i) => {
        grid[MAILBOX_Y + 5 - envelope.length + j - MAIL_LAYER_Y][MAILBOX_X + 2 - width + i - MAIL_LAYER_X] = ch;
      });
    });
  }
  return grid.map((row) => row.join(''));
}

const mail: PixelSprite = {
  id: 'wm12-opener-mail',
  name: 'wm12-opener-mail',
  tags: ['scene', 'wm12'],
  blurb: 'The monthly check growing the longer she waits.',
  rows: mailFrame(2),
  frames: [mailFrame(0), mailFrame(1), mailFrame(2), mailFrame(2), mailFrame(2), mailFrame(-1)],
  frameMs: 650,
};

/** Lamplight in the far manor's four wing windows. */
const houseGlow: PixelSprite = {
  id: 'wm12-opener-house-glow',
  name: 'wm12-opener-house-glow',
  tags: ['scene', 'wm12'],
  rows: ['G..........G', '............', 'G..........G'],
};

const lanternLater = wmLater(wmLampFlame, 'wm12-opener-lantern-later', 2, 300);

export const wm12Opener: SceneArt = {
  id: 'wm12-opener',
  label: 'A grandmother waits on a bench outside the estate gate at night, an hourglass running beside her, while the envelope in the mailbox by the lane grows bigger the longer she waits.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: wmHourglass, x: 14, y: 36 },
    { sprite: mail, x: MAIL_LAYER_X, y: MAIL_LAYER_Y },
    { sprite: wmLampFlame, x: 28, y: 19 },
    { sprite: lanternLater, x: 52, y: 19 },
    { sprite: houseGlow, x: HOUSE_X + 2, y: HOUSE_Y + 4, motion: { kind: 'twinkle', periodMs: 3800, min: 0.3 } },
    { sprite: wmFirefly, x: 23, y: 45, motion: { kind: 'rise', amp: 5, periodMs: 3100, phase: 0.3 } },
    { sprite: wmStar, x: 63, y: 8, motion: { kind: 'twinkle', periodMs: 2500, min: 0.3 } },
    { sprite: wmStarDot, x: 40, y: 13, motion: { kind: 'twinkle', periodMs: 1900, phase: 0.6, min: 0.2 } },
  ],
};

/** A sealed envelope: the monthly check. */
const emblemEnvelope: PixelSprite = {
  id: 'wm12-emblem-envelope',
  name: 'wm12-emblem-envelope',
  tags: ['scene', 'wm12'],
  rows: [
    'yyyyyyyyyyyyyg',
    'yOyyyyyyyyyyOg',
    'yGOyyyyyyyyOGg',
    'yGGOyyyyyyOGGg',
    'yGGGOyyyyOGGGg',
    'yGGGGOwwOGGGGg',
    'yGGGGGwwGGGGGg',
    'yGGGGGGGGGGGGg',
    'yGGGGGGGGGGGGg',
    'yGGGGGGGGGGGGg',
    'ggggggggggggOO',
  ],
};

export const wm12Finish: SceneArt = wmKeepsake(
  'wm12-finish',
  emblemEnvelope,
  'A green crest with a gold rim bearing a sealed envelope, framed by laurel over a purple banner, with sparkles around it.',
);

export const art: LessonArtSet = { opener: wm12Opener, backdrop: wmBackdrop, finish: wm12Finish };
