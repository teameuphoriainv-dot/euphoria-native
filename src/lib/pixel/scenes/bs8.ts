/**
 * Business Strategy lesson 8 opener: the newcomer's camp under the cracked keep.
 *
 * Built on bsHillside. The old keep still holds the hilltop, but it is dark, its flag hangs faded
 * and a crack runs from its battlements down through the wall, stones working loose. Across the
 * river a newcomer has pitched a small teal tent by a fire, and the sky on their side is already
 * going red with dawn: the incumbent ignored the small thing at the bottom of the market until it
 * grew. The fire and the moon are the brightest marks; the grey keep sits on the dark hill so its
 * crack reads. Moving: stones fall from the broken tower, the fire flickers and sparks, the teal
 * pennant flies, the newcomer shifts by the fire, a cloud drifts and stars twinkle.
 */
import type { PixelSprite } from '../types';
import { bsBackdrop } from './bs-backdrop';
import { bsEmber, bsMoved, bsStar } from './bs-kit';
import { BS_COAT_TEAL, bsFolk, bsHillside, bsRecoloured } from './bs-kit-a';
import { bsKeepsake } from './bs1-finish';
import type { LessonArtSet, SceneArt } from './types';

const dawn: PixelSprite = {
  id: 'bs8-dawn',
  name: 'dawn',
  tags: [],
  blurb: "Dawn reddening the sky on the newcomer's side, above the far ridge only.",
  rows: [
    '..................................................',
    '..................................................',
    '..................................................',
    '..................................................',
    '..................................................',
    '..................................................',
    '..................................................',
    '..................................................',
    '................................IIIIIIIIIIIIIIIIII',
    '................................IIIIIIIIIIIIIIIIII',
    '..............111111111111111111111111111111111111',
    '..............111111111111111111111111....11111111',
    '......11111111111111111111111111111111........1111',
    '..........1111111111111111111111111111............',
    '......................222222222222................',
    '......................222222222222................',
    '..........................2222....................',
    '..................................................',
    '..................................................',
  ],
};

const keep: PixelSprite = {
  id: 'bs8-keep',
  name: 'keep',
  tags: [],
  blurb: 'The old keep, unlit, cracked from the battlements down, a battlement broken off its right tower, its flag faded. Foot on the bottom row.',
  rows: [
    '............DD1r...........',
    '.............D1r...........',
    '.......X.X.X.D1X.X.X.......',
    '.......DDDDDDDKDDDDD.......',
    '.......DxXXXXXKDXXXD.......',
    '.......DxXXXXKDXXXXD.......',
    '.......DxXXXXKDXXXXD.......',
    'X.X.X.XDxXXXXXKDXXXD.X.....',
    'DDDDDDDDxXXKXXXKDXXDDDDDD..',
    'xxXXXXXDxXXKXXXKDXXDxXXXXX.',
    'xxXXXXXDxXXXXXKDXXXDxXXXXXD',
    'xxXXXXXDxXXXXKDXXXXDxXXXXXD',
    'xxXKXXXDxXXXXKDXXXXDxXKXXXD',
    'xxXKXXXDxXXXXXKDXXXDxXKXXXD',
    'xxXXXXXDxXXXXXXKDXXDxXXXXXD',
    'xxXXXXXDxXXKXXXKKDXDxXXXXXD',
    'xxXXXXXDxXXKXXXKKDXDxXXXXXD',
    'xxXXXXXDxXXXXXXKDXXDxXXXXXD',
    'xxXXXXXDxXXXXXKDXXXDxXXXXXD',
    'xxXXXXXDxXXXXXKDXXXDxXXXXXD',
    'xxXXXXXDxXXXXXXKDXXDxXXXXXD',
    'xxXXXXXDxXXXXXXXKDXDxXXXXXD',
    'xxXXXXXDxXXXXXXXXKDDxXXXXXD',
    'xxXXXXXDxXXDDDDDXXXDxXXXXXD',
    'xxXXXXXDxXXKKKKKXXXDxXXXXXD',
    'xxXXXXXDxXXKKKKKXXXDxXXXXXD',
    'xxXXXXXDxXXKKKKKXXXDxXXXXXD',
    'xxXXXXXDxXXKKKKKXXXDxXXXXXD',
    'xxXXXXXDxXXKKKKKXXXDxXXXXXD',
    'xxXXXXXDxXXKKKKKXXXDxXXXXXD',
  ],
};

const fallingRows = [
  'XD.',
  'DD.',
  '...',
  '...',
  '...',
  '...',
  '...',
  '...',
  '...',
  '...',
  '...',
  '...',
];

const falling: PixelSprite = {
  id: 'bs8-falling',
  name: 'falling',
  tags: [],
  blurb: 'A stone working loose from the broken tower and dropping away.',
  rows: fallingRows,
  frames: [
    fallingRows,
    bsMoved(fallingRows, {
      0: '...',
      1: '...',
      4: '.XD',
      5: '.DD',
    }),
    bsMoved(fallingRows, {
      0: '...',
      1: '...',
      9: 'XD.',
      10: 'DD.',
    }),
    bsMoved(fallingRows, {
      0: '...',
      1: '...',
    }),
  ],
  frameMs: 420,
};

const tent: PixelSprite = {
  id: 'bs8-tent',
  name: 'tent',
  tags: [],
  blurb: "The newcomer's teal tent, door open, its foot the bottom row; the apex is at (x + 7, y).",
  rows: [
    '.......D.......',
    '......DmD......',
    '.....DmTtD.....',
    '....DmTTTtD....',
    '...DmTTTTTtD...',
    '..DmTTTKTTTtD..',
    '.DmTTTKKKTTTtD.',
    'DmTTTTKKKTTTTtD',
    'DDDDDDKKKDDDDDD',
  ],
};

const pennantRows = [
  'Dt...',
  'DTTm.',
  'DTTTm',
  'DTT..',
  'D....',
  'D....',
];

const pennant: PixelSprite = {
  id: 'bs8-pennant',
  name: 'pennant',
  tags: [],
  blurb: "The newcomer's teal pennant; its pole foot is the bottom-left pixel.",
  rows: pennantRows,
  frames: [
    pennantRows,
    bsMoved(pennantRows, {
      1: 'DTm..',
      3: 'DTTm.',
    }),
    pennantRows,
    bsMoved(pennantRows, {
      1: 'DTTTm',
      2: 'DTTm.',
      3: 'DT...',
    }),
  ],
  frameMs: 520,
};

const fireRows = [
  '..3..',
  '.343.',
  '34543',
  '.454.',
  'OgOgO',
];

const fire: PixelSprite = {
  id: 'bs8-fire',
  name: 'fire',
  tags: [],
  blurb: 'A campfire on crossed logs (the bottom row); embers rise from (x + 1..2, y - 2).',
  rows: fireRows,
  frames: [
    fireRows,
    bsMoved(fireRows, {
      0: '...3.',
      1: '..43.',
    }),
    bsMoved(fireRows, {
      0: '.....',
      1: '..3..',
      2: '.353.',
    }),
    bsMoved(fireRows, {
      0: '.3...',
      1: '.34..',
    }),
  ],
  frameMs: 430,
};

const cloud: PixelSprite = {
  id: 'bs8-cloud',
  name: 'cloud',
  tags: [],
  blurb: 'A thin cloud that drifts past the moon.',
  rows: [
    '....kkkkkk......',
    '.kkkkkkkkkkkkk..',
    'kkkkkkkkkkkkkkkk',
  ],
};

const newcomer = bsRecoloured(bsFolk, 'bs8-newcomer', BS_COAT_TEAL, { S: '#F4CBA4', U: '#D6A87C', H: '#24493B' });

export const bs8Opener: SceneArt = {
  id: 'bs8-opener',
  label: 'An old grey keep stands cracked and dark on its hill while a newcomer camps by a fire beside a teal tent, with dawn breaking on their side of the valley.',
  width: 80,
  height: 60,
  base: bsHillside,
  layers: [
    { sprite: dawn, x: 30, y: 16 },
    { sprite: cloud, x: 34, y: 9, motion: { kind: 'drift', amp: 4, periodMs: 9000 } },
    { sprite: bsStar, x: 14, y: 3, motion: { kind: 'twinkle', periodMs: 2200, min: 0.2 } },
    { sprite: bsStar, x: 54, y: 6, motion: { kind: 'twinkle', periodMs: 2700, phase: 0.5, min: 0.2 } },
    { sprite: bsStar, x: 60, y: 4, motion: { kind: 'twinkle', periodMs: 2400, phase: 0.8, min: 0.2 } },
    { sprite: keep, x: 3, y: 6 },
    { sprite: falling, x: 28, y: 14 },
    { sprite: tent, x: 65, y: 35 },
    { sprite: pennant, x: 72, y: 29 },
    { sprite: fire, x: 53, y: 39 },
    { sprite: bsEmber, x: 54, y: 36, motion: { kind: 'rise', amp: 5, periodMs: 1600 } },
    { sprite: bsEmber, x: 55, y: 37, motion: { kind: 'rise', amp: 6, periodMs: 2100, phase: 0.5 } },
    { sprite: newcomer, x: 58, y: 32, motion: { kind: 'bob', amp: 1, periodMs: 2200 } },
  ],
};

const emblem: PixelSprite = {
  id: 'bs8-emblem-crack',
  name: 'emblem-crack',
  tags: [],
  blurb: 'Lesson 8 emblem, 16x16: a cracked grey tower and the small teal tent beside it.',
  rows: [
    '................',
    'X.X.X.X.........',
    'DDDDDDD.........',
    'DxXKXXD.........',
    'DxXXKXD.........',
    'DxXKXXD.........',
    'DxKXXXD.........',
    'DxXKXXD.....D...',
    'DxXXKXD....DmD..',
    'DxXKXXD...DmTtD.',
    'DxXXKXD..DmTTTtD',
    'DxXKKXD..DTTKTTD',
    'DxXKKXD.DmTKKKtD',
    'DDDKKDD.DDDKKKDD',
    'nnnnnnnnnnnnnnnn',
    '................',
  ],
};

export const bs8Finish: SceneArt = bsKeepsake(
  'bs8-finish',
  'A purple house banner on a gold rod, its roundel showing a cracked grey tower beside a small teal tent.',
  emblem,
);

export const art: LessonArtSet = { opener: bs8Opener, backdrop: bsBackdrop, finish: bs8Finish };
