/**
 * Personal Finance lesson 22, Charitable Giving & Tax Benefits: give smart, give more.
 *
 * A new set, the community hall on a giving day: bunting across the ceiling, a GIVE banner, and on
 * the wall the drive's thermometer, its red risen most of the way to the gold star of its goal. On
 * the trestle table stands the donation box with a red heart on its front, and the figure posts into
 * it not cash but a share certificate, its line rising, the appreciated stock the lesson says to give.
 * A noticeboard rates the charity four stars; boxes of donated tins wait on the floor and the cat
 * sleeps in an empty one. Moving: the certificate, a heart rising, the thermometer's glint, the
 * lamp, the cat's z.
 */
import type { PixelSprite } from '../types';
import {
  pfCat,
  pfCompose,
  pfKitchen,
  pfLampGlow,
  pfPendantLamp,
  pfSaverReach,
  pfSparkle,
  pfTable,
  pfZzz,
} from './pf-kit';
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

/** Bunting strung across the ceiling, sagging in the middle: a pennant every seven columns. */
const FLAGS = ['P', 'T', 'G', 'F'];
function bunting(width: number): PixelSprite {
  const sag = (x: number) => 1 + Math.round(3 * (1 - ((x - width / 2) / (width / 2)) ** 2));
  return {
    id: 'pf22-bunting',
    name: 'bunting',
    tags: ['scene', 'pf'],
    rows: Array.from({ length: 9 }, (_, y) =>
      Array.from({ length: width }, (_, x) => {
        if (y === sag(x)) return 'x';
        const start = x - (x % 7) + 1;
        const offset = x - start;
        const top = sag(start + 2) + 1;
        const depth = y - top;
        if (offset < 0 || offset > 4 || depth < 0 || depth > 2) return '.';
        const half = 2 - depth;
        if (Math.abs(offset - 2) > half) return '.';
        const flag = FLAGS[Math.floor(x / 7) % FLAGS.length];
        return depth === 0 && offset === 0 ? 'w' : flag;
      }).join(''),
    ),
  };
}

/** The GIVE banner: a teal cloth with swallowtail ends; the word is stamped on it. */
const banner: PixelSprite = {
  id: 'pf22-banner',
  name: 'banner',
  tags: ['scene', 'pf'],
  rows: [
    'tttttttttttttttttttttt',
    '.tTTTTTTTTTTTTTTTTTTt.',
    '..TTTTTTTTTTTTTTTTTT..',
    '..TTTTTTTTTTTTTTTTTT..',
    '..TTTTTTTTTTTTTTTTTT..',
    '..TTTTTTTTTTTTTTTTTT..',
    '..TTTTTTTTTTTTTTTTTT..',
    '.tTTTTTTTTTTTTTTTTTTt.',
    'tttttttttttttttttttttt',
  ],
};

/**
 * The drive's thermometer on a poster: a gold star for the goal, a tube with ticks, the red risen
 * to just short of the star (still, as data is), and the bulb.
 */
const thermometer: PixelSprite = {
  id: 'pf22-thermometer',
  name: 'thermometer',
  tags: ['scene', 'pf'],
  rows: [
    'xxxxxxxxxxX',
    'xwwwwywwwwX',
    'xwwwyGywwwX',
    'xwwwwywwwwX',
    'xwwwXXXwwwX',
    'xwwXwwwXwwX',
    'xwwXwwwXXwX',
    'xwwXwwwXwwX',
    'xwwXRRRXwwX',
    'xwwXRsRXXwX',
    'xwwXRRRXwwX',
    'xwwXRRRXwwX',
    'xwwXRRRXXwX',
    'xwwXRRRXwwX',
    'xwwXRRRXwwX',
    'xwwXRRRXXwX',
    'xwwXRRRXwwX',
    'xwwXRRRXwwX',
    'xwwXRRRXXwX',
    'xwwXRRRXwwX',
    'xwXRRRRRXwX',
    'xwXRsRRRXwX',
    'xwXRRRRrXwX',
    'xwwXrrrXwwX',
    'xwwwXXXwwwX',
    'xxxxxxxxxxX',
  ],
};

/** A noticeboard with the charity's rating card pinned up, four gold stars of five. */
const noticeboard: PixelSprite = {
  id: 'pf22-noticeboard',
  name: 'noticeboard',
  tags: ['scene', 'pf'],
  rows: [
    'OOOOOOOOOOOOOOOOO',
    'OgggggggggggggggO',
    'OgwwwwwwwwwwRwggO',
    'OgwXXXXXXXXwwwggO',
    'OgwwwwwwwwwwwwggO',
    'OgwyGwyGwyGwyGwgO',
    'OgwGgwGgwGgwGgwgO',
    'OgwwwwwwwwwwwwwgO',
    'OgwwwwwwwwwwwwwgO',
    'OgggggggggggggggO',
    'OgggwwwwwwwBggggO',
    'OgggwXXXXwwwggggO',
    'OgggwwwwwwwwggggO',
    'OgggwXXXwwwwggggO',
    'OgggwwwwwwwwggggO',
    'OgggggggggggggggO',
    'OOOOOOOOOOOOOOOOO',
  ],
};

/**
 * The donation box: a wooden box with a slot in its lid (columns 7 to 11 of row 1) and a big red
 * heart on its front.
 */
const donationBox: PixelSprite = {
  id: 'pf22-donation-box',
  name: 'donation box',
  tags: ['scene', 'pf'],
  rows: [
    '.OOOOOOOOOOOOOOOO.',
    'OyGGGGGKKKKKGGGGgO',
    'OOOOOOOOOOOOOOOOOO',
    'OGgggggggggggggggO',
    'OGggggRRggRRgggggO',
    'OGgggRsRRRRRRggggO',
    'OGgggRRRRRRRRggggO',
    'OGggggRRRRRRgggggO',
    'OGgggggRRRRggggggO',
    'OGggggggRRgggggggO',
    'OGgggggggggggggggO',
    'OGgggggggggggggggO',
    'OOOOOOOOOOOOOOOOOO',
  ],
};

/**
 * The share certificate posted into the slot, a LAYER only: its top four rows show above the lid
 * (the rest is already in the box), held, let go, sliding in row by row, a glint, then another.
 */
const CERT = ['wwwwN', 'wwwNw', 'wNwNw', 'NwNww'];
const NO_CERT = '.....';
const certAt = (shift: number) => Array.from({ length: 4 }, (_, i) => (i < shift ? NO_CERT : CERT[i - shift]));
const certificate: PixelSprite = {
  id: 'pf22-certificate',
  name: 'certificate',
  tags: ['scene', 'pf'],
  rows: certAt(0),
  frames: [
    certAt(0),
    certAt(0),
    certAt(0),
    certAt(1),
    certAt(2),
    certAt(3),
    [NO_CERT, NO_CERT, '..y..', '.yWy.'],
    [NO_CERT, NO_CERT, NO_CERT, '..w..'],
    certAt(4),
  ],
  frameMs: 260,
};

/** A small heart rising off the box. */
const heart: PixelSprite = {
  id: 'pf22-heart',
  name: 'heart',
  tags: ['scene', 'pf'],
  rows: [
    'R.R',
    'RRR',
    '.R.',
  ],
};

/** A cardboard box of donated tins, its flaps open. */
const tinBox: PixelSprite = {
  id: 'pf22-tin-box',
  name: 'tin box',
  tags: ['scene', 'pf'],
  rows: [
    '..xXx.xXx.xXx..',
    '..RRR.NNN.BBB..',
    '..rrr.nnn.bbb..',
    'O.xXx.xXx.xXx.O',
    'gOOOOOOOOOOOOOg',
    'OGGGGGGGGGGGGgO',
    'OGgggggggggggOO',
    'OGgggggggggggOO',
    'OGgggggggggggOO',
    'OGgggggggggggOO',
    'OOOOOOOOOOOOOOO',
  ],
};

/** A low open box on the floor, back wall and front, for the cat to sleep in. */
const catBoxBack: PixelSprite = {
  id: 'pf22-cat-box-back',
  name: 'cat box back',
  tags: ['scene', 'pf'],
  rows: [
    'gOOOOOOOOOOOOOOOOOg',
    'OgggggggggggggggggO',
  ],
};
const catBoxFront: PixelSprite = {
  id: 'pf22-cat-box-front',
  name: 'cat box front',
  tags: ['scene', 'pf'],
  rows: [
    'OGGGGGGGGGGGGGGGGgO',
    'OGgggggggggggggggOO',
    'OGgggggggggggggggOO',
    'OOOOOOOOOOOOOOOOOOO',
  ],
};

/** Lesson 22's emblem: a red heart held in two cupped hands. */
const emblemGivingHands: PixelSprite = {
  id: 'pf22-emblem-giving-hands',
  name: 'pf22-emblem-giving-hands',
  tags: ['scene', 'pf', 'emblem'],
  palette: SKIN,
  rows: [
    '.....RR.RR....',
    '....RsRRRRR...',
    '....RRRRRRR...',
    '.....RRRRR....',
    'M.....RRR....M',
    'CM.....R....MC',
    'UCM........MCU',
    '.UCCCCCCCCCCU.',
    '..UUUUUUUUUU..',
  ],
};

// Order is depth: the bunting, the banner, the posters, the lamp, the figure, the table over its
// lower half, the box on the table in front of its arm, then the boxes on the floor (the cat between
// its box's back and front).
const base = pfCompose('pf22-opener-base', 80, 60, pfKitchen.rows, [
  [thermometer, 3, 8],
  [banner, 31, 9],
  [pfText('pf22-give', 'GIVE', 'w'), 34, 11],
  [noticeboard, 59, 9],
  [bunting(80), 0, 0],
  [pfPendantLamp, 18, 0],
  [pfSaverReach, 14, 12],
  [pfTable(48, 12), 6, 36],
  [donationBox, 27, 25],
  [tinBox, 56, 40],
  [catBoxBack, 60, 49],
  [pfCat, 62, 49],
  [catBoxFront, 60, 53],
]);

export const pf22Opener: SceneArt = {
  id: 'pf22-opener',
  label: 'In a community hall hung with bunting and a GIVE banner, a person posts a share certificate with a rising line into a donation box with a red heart on it, beside a fundraising thermometer nearly at its goal, a four star rating card, boxes of donated tins and the cat asleep in an empty box.',
  width: 80,
  height: 60,
  base,
  layers: [
    // The certificate is in the hand (figure at 14,12; hand at column 22, row 10), its lower part
    // already through the slot (box at 27,25; slot at columns 7 to 11 of row 1).
    { sprite: certificate, x: 34, y: 22 },
    { sprite: heart, x: 40, y: 21, motion: { kind: 'rise', amp: 6, periodMs: 2600, phase: 0.2 } },
    { sprite: pfSparkle, x: 6, y: 9, motion: { kind: 'twinkle', periodMs: 1800, min: 0.35 } },
    { sprite: pfLampGlow, x: 19, y: 9, motion: { kind: 'twinkle', periodMs: 3000, min: 0.55 } },
    { sprite: pfZzz, x: 60, y: 43, motion: { kind: 'rise', amp: 3, periodMs: 2800, phase: 0.3 } },
  ],
};

export const pf22Finish = pfKeepsake(
  'pf22-finish',
  'A gold house-shaped key fob with a teal roof on a key ring with a brass key, its window showing a red heart held in two cupped hands, with small sparkles around it.',
  emblemGivingHands,
);

export const art: LessonArtSet = { opener: pf22Opener, backdrop: pfBackdrop, finish: pf22Finish };
