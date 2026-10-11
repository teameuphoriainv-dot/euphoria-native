/**
 * Business Strategy lesson 7 opener: the deal, two houses made one.
 *
 * The war room with two lords at the table instead of one: the strategist in purple and the head of
 * another house in teal reach across and shake hands, each under their own banner, and on the felt
 * between them their two model castles stand in one moat, joined by a bridge. A while after the
 * handshake the far castle's teal flag comes down and ours goes up (the acquisition, done). The
 * banners are the brightest broad surfaces; the grey models sit on green felt so they read. Moving:
 * the hands shake, both lords blink, the flag changes, light runs on the moat, both banners flutter,
 * the torch and candles flicker, embers rise and stars twinkle.
 */
import type { PixelSprite } from '../types';
import { bsBackdrop } from './bs-backdrop';
import { bsCandle, bsEmber, bsLater, bsMoved, bsStar, bsTorch, bsWallBanner, bsWarRoom, bsWarTable } from './bs-kit';
import { BS_COAT_TEAL, bsMirrored, bsRecoloured, bsStrategistShake } from './bs-kit-a';
import { bsKeepsake } from './bs1-finish';
import type { LessonArtSet, SceneArt } from './types';

const twinKeepsRows = [
  '.....DqP................DmT...',
  '.....DPP................DTT...',
  '.....D..................D.....',
  '..D.D.D.D............D.D.D.D..',
  '..DxXXXXD............DxXXXXD..',
  '..DxXXXXD............DxXXXXD..',
  '..DxXKXXD.O..O..O..O.DxXKXXD..',
  '..DxXXXXDOOOOOOOOOOOODxXXXXD..',
  '..DxXKKXDggggggggggggDxXKKXD..',
  '..DDDKKDDOOOOOOOOOOOODDDKKDD..',
  '.nnnnnnnnnBBBBBBBBBwnnnnnnnnn.',
  'bBBBBBBBBBBBBBBBBBBBBBBBBBBBBb',
  'bBBBBBBBBwBBBBBBBBBBBBBBBBBBBb',
  '.bBBBBBBBBBBBBBBBBBBBBBBwBBBb.',
  '...bbbbbbbbbbbbbbbbbbbbbbbb...',
];

const twinKeepsB = bsMoved(twinKeepsRows, {
  10: '.nnnnnnnnnBBBBBBBBBBnnnnnnnnn.',
  11: 'bBBBBwBBBBBBBBBBBBBBBBBBBBBBBb',
  12: 'bBBBBBBBBBBBBBBBBBBBBBwBBBBBBb',
  13: '.bBBBBBBBBBBBwBBBBBBBBBBBBBBb.',
});

const twinKeepsC = bsMoved(twinKeepsRows, {
  0: '.....DqP................DqP...',
  1: '.....DPP................DPP...',
});

const twinKeepsD = bsMoved(twinKeepsRows, {
  0: '.....DqP................DqP...',
  1: '.....DPP................DPP...',
  10: '.nnnnnnnnnBBBBBBBBBBnnnnnnnnn.',
  11: 'bBBBBwBBBBBBBBBBBBBBBBBBBBBBBb',
  12: 'bBBBBBBBBBBBBBBBBBBBBBwBBBBBBb',
  13: '.bBBBBBBBBBBBwBBBBBBBBBBBBBBb.',
});

const twinKeeps: PixelSprite = {
  id: 'bs7-twin-keeps',
  name: 'twin-keeps',
  tags: [],
  blurb: "Two castle models in one moat, joined by a bridge, for the felt: place at (x, tableY - 7). The far keep's teal flag gives way to ours.",
  rows: twinKeepsRows,
  frames: [
    twinKeepsRows,
    twinKeepsB,
    twinKeepsRows,
    twinKeepsB,
    twinKeepsC,
    twinKeepsD,
    twinKeepsC,
    twinKeepsD,
  ],
  frameMs: 600,
};

const lordOurs = bsMirrored(bsStrategistShake, 'bs7-lord-ours');
const lordTheirs = bsRecoloured(bsStrategistShake, 'bs7-lord-theirs', BS_COAT_TEAL, { S: '#F4CBA4', U: '#D6A87C', H: '#3A2418' });
const bannerTheirs = bsRecoloured(bsLater(bsWallBanner, 'bs7-banner-theirs', 2, 580), 'bs7-banner-theirs', BS_COAT_TEAL);
const candleLater = bsLater(bsCandle, 'bs7-candle-later', 2, 470);

export const bs7Opener: SceneArt = {
  id: 'bs7-opener',
  label: 'Two lords, one in purple and one in teal, shake hands across a war table where their two model castles stand joined by a bridge.',
  width: 80,
  height: 60,
  base: bsWarRoom,
  layers: [
    { sprite: bsWallBanner, x: 2, y: 1 },
    { sprite: bannerTheirs, x: 55, y: 1 },
    { sprite: bsTorch, x: 37, y: 4 },
    { sprite: bsEmber, x: 38, y: 2, motion: { kind: 'rise', amp: 4, periodMs: 1500 } },
    { sprite: bsEmber, x: 39, y: 3, motion: { kind: 'rise', amp: 5, periodMs: 2100, phase: 0.5 } },
    { sprite: bsStar, x: 74, y: 7, motion: { kind: 'twinkle', periodMs: 1900, min: 0.2 } },
    { sprite: bsStar, x: 76, y: 12, motion: { kind: 'twinkle', periodMs: 2500, phase: 0.6, min: 0.2 } },
    { sprite: lordOurs, x: 16, y: 17 },
    { sprite: lordTheirs, x: 36, y: 17 },
    { sprite: bsWarTable, x: 9, y: 37 },
    { sprite: twinKeeps, x: 25, y: 30 },
    { sprite: bsCandle, x: 11, y: 33 },
    { sprite: candleLater, x: 64, y: 33 },
  ],
};

const emblem: PixelSprite = {
  id: 'bs7-emblem-merger',
  name: 'emblem-merger',
  tags: [],
  blurb: 'Lesson 7 emblem, 16x16: two keeps, purple flag and teal flag, joined by a gold bridge over one moat.',
  rows: [
    '..D..........D..',
    '..DqP.......DmT.',
    '..DPP.......DTT.',
    'D.D.D......D.D.D',
    'DxXXD......DxXXD',
    'DxKXDOOOOOODxKXD',
    'DxXXDggggggDxXXD',
    'DxKKDOOOOOODxKKD',
    'DDKKD......DDKKD',
    'nnnnnn....nnnnnn',
    'bBBBBbBBBBbBBBBb',
    'bBwBBBBBBBBBBwBb',
    '.bbBBBBwBBBBBbb.',
    '..bbbbbbbbbbbb..',
    '................',
    '................',
  ],
};

export const bs7Finish: SceneArt = bsKeepsake(
  'bs7-finish',
  'A purple house banner on a gold rod, its roundel showing two castles with purple and teal flags joined by a gold bridge over blue water.',
  emblem,
);

export const art: LessonArtSet = { opener: bs7Opener, backdrop: bsBackdrop, finish: bs7Finish };
