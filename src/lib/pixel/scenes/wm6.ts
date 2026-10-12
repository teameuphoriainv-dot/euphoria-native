/**
 * Wealth Management lesson 6 (charitable giving and philanthropy): its opener, the pathway
 * backdrop and its keepsake, as one set loaded on demand.
 *
 * The opener is the village green at night. On the right stands the stone hall the family gives
 * to: lamplit windows, a heart over the door, a bell in its tower. On the left the child, the
 * grandmother watching, pushes a share certificate into the slot of a donation box marked with a
 * heart. The certificate is drawn large enough to read, in lesson 20's look (a dark frame, cream
 * paper, a gold band), with a green line rising across it to an up-tick: an appreciated share.
 * That is the lesson's point: give the shares themselves, not cash, so the gift arrives whole and
 * no gains tax is paid on the way. What moves: the certificate nudges down into the slot (the
 * box's front is a layer drawn over it, so it passes behind), hearts rise from the gift toward the
 * hall, its windows glow, the bell swings, stars twinkle, a firefly rises. The keepsake carries
 * the same gift: a certificate with a rising line going into a heart-marked box.
 */
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';
import { wmBackdrop } from './wm-backdrop';
import { wmBands, wmCompose, wmElder, wmFirefly, wmStar, wmStarDot, WM_INKS } from './wm-kit';
import { wmTreeline } from './wm-kit-a';
import { wmKeepsake } from './wm1-finish';

/** The hall's top-left in the scene; its bell and windows are placed from it. */
const HALL_X = 48;
const HALL_Y = 12;

/** The donation box's top-left (its lid and slot are row 0) and the certificate standing in the slot. */
const BOX_X = 27;
const BOX_Y = 47;
const CERT_X = BOX_X + 2;
const CERT_Y = 40;

/** Fixed faint stars. */
const skyDots: PixelSprite = {
  id: 'wm6-opener-sky-dots',
  name: 'wm6-opener-sky-dots',
  tags: ['scene', 'wm6'],
  rows: [
    '................................................................................',
    '..........................D.....................................X...............',
    '..................................................X.............................',
    '...X..........................................................................D.',
    '......................................X.........................................',
    '................................................................................',
    '..........................D...............................................X.....',
    '................................................................................',
    '.................X..............................................................',
    '..............................................D.................................',
    '................................................................................',
    '.....D.....................................................................X....',
  ],
};

/** A half moon. 6x8. */
const moon: PixelSprite = {
  id: 'wm6-opener-moon',
  name: 'wm6-opener-moon',
  tags: ['scene', 'wm6'],
  rows: [
    '..xww.',
    '.xwww.',
    'xwwww.',
    'xwwww.',
    'xwwww.',
    'xwwww.',
    '.xwww.',
    '..xww.',
  ],
};

const trees = wmTreeline('wm6-opener-trees', 80, 10, [
  [40, 60, 3],
  [6, 7, 8],
  [19, 5, 6],
  [33, 6, 9],
  [44, 5, 5],
]);

/** The bell tower: a slate cap, an open arch for the bell, a stone base. 8x11. */
const belfry: PixelSprite = {
  id: 'wm6-opener-belfry',
  name: 'wm6-opener-belfry',
  tags: ['scene', 'wm6'],
  rows: [
    '...DD...',
    '..DkkD..',
    '.DkkkkD.',
    'DkkkkkkD',
    'XDDDDDDD',
    'xK....KD',
    'xK....KD',
    'xK....KD',
    'xKKKKKKD',
    'xXXXXXXD',
    'xXXXXXXD',
  ],
};

/** Half-widths of the slate roof, ridge to eaves. */
const ROOF_HALF = [3, 5, 7, 8, 10, 11, 13, 14];
const roof: PixelSprite = {
  id: 'wm6-opener-roof',
  name: 'wm6-opener-roof',
  tags: ['scene', 'wm6'],
  rows: [
    ...ROOF_HALF.map((half) =>
      Array.from({ length: 30 }, (_, x) => {
        if (x < 15 - half || x > 14 + half) return '.';
        return x === 15 - half || x === 14 + half ? 'D' : 'k';
      }).join(''),
    ),
    'D'.repeat(30),
  ],
};

/** The stone front: lit on the left edge, in shade on the right, a dark plinth. 26x14. */
const hallWall: PixelSprite = {
  id: 'wm6-opener-hall-wall',
  name: 'wm6-opener-hall-wall',
  tags: ['scene', 'wm6'],
  rows: [...Array.from({ length: 13 }, () => `X${'D'.repeat(24)}K`), 'k'.repeat(26)],
};

/** An arched window, its panes dim until the glow layer lights them. 4x6. */
const hallWindow: PixelSprite = {
  id: 'wm6-opener-hall-window',
  name: 'wm6-opener-hall-window',
  tags: ['scene', 'wm6'],
  rows: ['.KK.', 'KOOK', 'KOOK', 'KOOK', 'KOOK', 'XXXX'],
};

/** The hall's door. 6x9. */
const hallDoor: PixelSprite = {
  id: 'wm6-opener-hall-door',
  name: 'wm6-opener-hall-door',
  tags: ['scene', 'wm6'],
  palette: WM_INKS,
  rows: [
    '.OUUO.',
    'OUCCUO',
    'OCUUUO',
    'OCUUUO',
    'OCUUGO',
    'OCUUUO',
    'OCUUUO',
    'OCUUUO',
    'OOOOOO',
  ],
};

/** A pink heart, for the sign over the door and the hearts rising from the gift. 5x4. */
const heart: PixelSprite = {
  id: 'wm6-opener-heart',
  name: 'wm6-opener-heart',
  tags: ['scene', 'wm6'],
  rows: ['sF.Ff', 'FFFFf', '.FFf.', '..f..'],
};

/** The hall, composed. 30x34. */
const hall = wmCompose('wm6-opener-hall', wmBands(30, [['.', 34]]), [
  { sprite: belfry, x: 11, y: 0 },
  { sprite: roof, x: 0, y: 11 },
  { sprite: hallWall, x: 2, y: 20 },
  { sprite: hallWindow, x: 5, y: 23 },
  { sprite: hallWindow, x: 21, y: 23 },
  { sprite: hallDoor, x: 12, y: 25 },
  { sprite: heart, x: 12, y: 21 },
]);

/** Gravel from the hall door down to us, widening, with a few lit stones. 26x14. */
const path: PixelSprite = {
  id: 'wm6-opener-path',
  name: 'wm6-opener-path',
  tags: ['scene', 'wm6'],
  rows: Array.from({ length: 14 }, (_, j) => {
    const half = 4 + j * 0.65;
    return Array.from({ length: 26 }, (_, x) => {
      if (Math.abs(x - 12.5) > half) return '.';
      return (x * 3 + j * 5) % 11 === 0 ? 'D' : 'k';
    }).join('');
  }),
};

/**
 * The donation box: a lid with a slot as wide as the certificate (columns 2 to 9), a heart on the
 * front, short feet. Rows 1 and 2 are also drawn as a layer over the certificate, so the paper
 * pushed into the slot passes behind the front. 12x8.
 */
const BOX = [
  'yCKKKKKKKKCg',
  'OUUUUUUUUUUO',
  'OUUUsFUFfUUO',
  'OUUUFFFFfUUO',
  'OUUUUFFfUUUO',
  'OUUUUUfUUUUO',
  'OOOOOOOOOOOO',
  '.K........K.',
];
const giftBox: PixelSprite = {
  id: 'wm6-opener-gift-box',
  name: 'wm6-opener-gift-box',
  tags: ['scene', 'wm6'],
  palette: WM_INKS,
  rows: BOX,
};
const boxFront: PixelSprite = {
  id: 'wm6-opener-box-front',
  name: 'wm6-opener-box-front',
  tags: ['scene', 'wm6'],
  palette: WM_INKS,
  rows: BOX.slice(1, 3),
};

/**
 * The share certificate in lesson 20's look (wm20.ts): a dark frame, cream paper, a gold band, and
 * across it a green line rising to an up-tick, the share that has grown. Rows 7 to 9 are in the
 * slot and behind the box's front at rest; the bob lifts them into view and lets them sink back.
 * 8x10.
 */
const certificate: PixelSprite = {
  id: 'wm6-opener-certificate',
  name: 'wm6-opener-certificate',
  tags: ['scene', 'wm6'],
  rows: [
    'DDDDDDDD',
    'DyyyynND',
    'DyyyyynD',
    'DyynynyD',
    'DynynyyD',
    'DnyyyyyD',
    'DyGgGgyD',
    'DyyyyyyD',
    'DyyyyyyD',
    'DyyyyyyD',
  ],
};

/** The heir in teal, the right arm raised to hold the certificate's edge at the slot. 8x12. */
const childGiving: PixelSprite = {
  id: 'wm6-opener-child-giving',
  name: 'wm6-opener-child-giving',
  tags: ['scene', 'wm6'],
  palette: WM_INKS,
  rows: [
    '........',
    '......CC',
    '......T.',
    '.ggg.T..',
    'gCCCgT..',
    'CkCkUT..',
    '.CCUT...',
    'tTTTt...',
    'CTTt....',
    '.TTt....',
    '.k.k....',
    'KK.KK...',
  ],
};

const base = wmCompose('wm6-opener-base', wmBands(80, [['K', 44], ['h', 16]]), [
  { sprite: skyDots, x: 0, y: 0 },
  { sprite: moon, x: 8, y: 5 },
  { sprite: trees, x: 0, y: 34 },
  { sprite: hall, x: HALL_X, y: HALL_Y },
  { sprite: path, x: 50, y: 46 },
  { sprite: wmElder, x: 11, y: 43 },
  { sprite: childGiving, x: 21, y: 43 },
  { sprite: giftBox, x: BOX_X, y: BOX_Y },
]);

/** The hall's bell, swinging in its arch. 6x4. */
const BELL = ['.yg.', 'yGGg', 'yGGg', 'gggO'];
const bellAt = (left: number) => BELL.map((row) => `${'.'.repeat(left)}${row}${'.'.repeat(2 - left)}`);
const bell: PixelSprite = {
  id: 'wm6-opener-bell',
  name: 'wm6-opener-bell',
  tags: ['scene', 'wm6'],
  rows: bellAt(1),
  frames: [bellAt(1), bellAt(2), bellAt(1), bellAt(0)],
  frameMs: 450,
};

/** Lamplight in a window's panes. */
const windowGlow: PixelSprite = {
  id: 'wm6-opener-window-glow',
  name: 'wm6-opener-window-glow',
  tags: ['scene', 'wm6'],
  rows: ['Gy', 'GG', 'Gg', 'gg'],
};

const smallHeart: PixelSprite = {
  id: 'wm6-opener-small-heart',
  name: 'wm6-opener-small-heart',
  tags: ['scene', 'wm6'],
  rows: ['F.F', 'FFf', '.f.'],
};

export const wm6Opener: SceneArt = {
  id: 'wm6-opener',
  label: 'A child slips a share certificate with a rising green line into a heart-marked donation box as the grandmother watches, and hearts rise from the gift toward a lamplit stone hall with a bell tower.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: certificate, x: CERT_X, y: CERT_Y, motion: { kind: 'bob', amp: 2, periodMs: 2400 } },
    { sprite: boxFront, x: BOX_X, y: BOX_Y + 1 },
    { sprite: heart, x: 29, y: 34, motion: { kind: 'rise', amp: 14, periodMs: 3400, phase: 0 } },
    { sprite: smallHeart, x: 35, y: 35, motion: { kind: 'rise', amp: 12, periodMs: 3400, phase: 0.35 } },
    { sprite: heart, x: 33, y: 30, motion: { kind: 'rise', amp: 16, periodMs: 3400, phase: 0.7 } },
    { sprite: windowGlow, x: HALL_X + 6, y: HALL_Y + 24, motion: { kind: 'twinkle', periodMs: 4200, min: 0.4 } },
    { sprite: windowGlow, x: HALL_X + 22, y: HALL_Y + 24, motion: { kind: 'twinkle', periodMs: 4800, phase: 0.5, min: 0.4 } },
    { sprite: bell, x: HALL_X + 12, y: HALL_Y + 5 },
    { sprite: wmStar, x: 36, y: 4, motion: { kind: 'twinkle', periodMs: 2400, min: 0.3 } },
    { sprite: wmStarDot, x: 44, y: 11, motion: { kind: 'twinkle', periodMs: 1800, phase: 0.6, min: 0.2 } },
    { sprite: wmFirefly, x: 41, y: 41, motion: { kind: 'rise', amp: 5, periodMs: 2900, phase: 0.3 } },
  ],
};

/**
 * The gift itself: a share certificate with a green line rising to an up-tick, going into the slot
 * of a gold box with a pink heart on its front.
 */
const emblemGift: PixelSprite = {
  id: 'wm6-emblem-gift',
  name: 'wm6-emblem-gift',
  tags: ['scene', 'wm6'],
  rows: [
    '..yyyyyyyyyg..',
    '..ywwwwwwnng..',
    '..ywwwwwnwng..',
    '..ywwnwnwwwg..',
    '..ywnwnwwwwg..',
    '..ynwwwwwwwg..',
    'yGKKKKKKKKKKGg',
    'yGGGGGGGGGGGgg',
    'yGGGsFGFfGGGgg',
    'yGGGFFFFfGGGgg',
    'yGGGGFFfGGGGgg',
    'gGGGGGfGGGGggO',
    '.ggggggggggOO.',
  ],
};

export const wm6Finish: SceneArt = wmKeepsake(
  'wm6-finish',
  emblemGift,
  'A green crest with a gold rim bearing a share certificate with a rising green line going into a heart-marked box, framed by laurel over a purple banner, with sparkles around it.',
);

export const art: LessonArtSet = { opener: wm6Opener, backdrop: wmBackdrop, finish: wm6Finish };
