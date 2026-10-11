/**
 * Business Strategy lesson 10 opener: the capstone, the whole realm laid out on the table.
 *
 * The war room, its table swapped for a great map of the realm: the sea and a harbour to the west,
 * hills and a market town to the east, and the house castle in its moat in the middle. A road of gold
 * dashes runs from the little bookstall where the house began, past four milestone flags (mission,
 * analysis, strategy, execution), to the castle, and the strategist rakes our piece the last step home
 * while two allies watch. Above them hangs the long plan: a line that creeps along for years, then
 * climbs to a crown. The map is the broadest bright surface; the plan's parchment sits over it on the
 * dark wall. Moving: the flags light one after another along the road, a point runs up the plan and
 * the crown flashes, the strategist rakes and blinks, the castle flag flutters and its moat glints, the
 * ship rides at anchor, the torch flickers, embers rise and stars twinkle. The backdrop is the
 * pathway's, with the castle walls hung with two more pennants and more stars out, for the occasion.
 */
import type { PixelSprite } from '../types';
import { bsBackdrop } from './bs-backdrop';
import {
  bsEmber,
  bsLater,
  bsMoatKeep,
  bsMoved,
  bsNightPennant,
  bsNightStar,
  bsPawn,
  bsStar,
  bsStrategist,
  bsTorch,
  bsWarRoom,
} from './bs-kit';
import { BS_COAT_GOLD, BS_COAT_TEAL, bsBust, bsBustHat, bsRecoloured } from './bs-kit-a';
import { bsKeepsake } from './bs1-finish';
import type { LessonArtSet, SceneArt } from './types';

const realm: PixelSprite = {
  id: 'bs10-realm',
  name: 'realm',
  tags: [],
  blurb: 'The great table with the whole realm on its felt: sea and harbour west, hills and a market town east, a road of gold dashes from the bookstall to the castle with a flag pole at each milestone. Map rows 2..20 under a far edge on row 0, so the castle model goes at (x, y - 8) as bsMoatKeep does on the war table.',
  palette: { Z: '#110E17' },
  rows: [
    '.........OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO.........',
    '........OggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggO........',
    '........OgbbbbbbbbbnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnwXnnnnnnnOwX.......',
    '........OgbbbbbbbbbbnnnNnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnxXXnnnwXnnxXX.......',
    '........OgbBbbbbbbbbnNnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnxXXXXnxXXnxXXXX......',
    '.......OgbbbbbbbbbbbbnnnnNnnnnnnnnnnnnnnnnnnnnnnnnnnnGnnnnxDXXXXxXXXxXXXXXX.....',
    '.......OgbbbbbbBbbbbbnNnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnGnnnDnnnnnnnnnnnOO.......',
    '.......OgbbbbbbbbbbbnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnDnnnnnnnnnnnOO.......',
    '......OgbbbbbbbOOOOnNnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnGnnnnnNnnnnnNnnOO......',
    '......OgbbbbBbbbbbbnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnNnnnnnnOO......',
    '......OgbbbbbbbbbbnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnGnDNnnnnnnnnnnOO......',
    '.....OgbbbbbbbbbbbnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnDnnnnnnNnnnnnOO.....',
    '.....OgbbBbbbbbbbbbnnnnnnnnnnNnnnnnnnnnnnnnnnnnnnnnnnnnnnGnnDnnnnnnnnnnnnOO.....',
    '.....OgbbbbbbbbbbbbnnnnnnnnnnnnNnnnnnnnnnnnnnDnnnnnnnnnnnnnnnnfnnfnnnnnnnOO.....',
    '....OgbbbbbbbbBbbbnnEEEnnnnNnnnnnnnnnnnnnnnnnDnnnnnnnnnnGnnnnfFffFfnnEnnnnOO....',
    '....OgbbbbbbbbbbbnnEpppEnnnnnnnnnDnnnnnnnnnnnDnnnnnnGnGnnnnnnxGxxGxnEpEpnnOO....',
    '....OgbbBbbbbbbbnnnnxwxnnnnnnnnnnDnnnnnnnnGnGnGnGnGnnnnnnnnnnxxxxxxnxGxxnnOO....',
    '...OgbbbbbbbbbbbnnnnxKxnGnGnnnnnnDnnnnnnGnnnnnnnnnnnnnnnnnnnnnnnnbnnxxxxnnnOO...',
    '...OgbbbbbbBbbbnnnnnnnnnnnnnGnGnGnGnGnGnnnnnnnnnnnnnNnnnnnnnnnnnbBbnnnnnnnnOO...',
    '...OgbbbbbbbbbbnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnNnnnnNnnnnnnnnxGxnnnnnnnnOO...',
    '..OgbbbbbbbbbbnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnOO..',
    'OGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGO',
    'gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg',
    'gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg',
    'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
    '..GgOZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZGgO..',
    '..GgOZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZGgO..',
    '..GgOZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZGgO..',
    '..GgOZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZGgO..',
    '..GgOZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZGgO..',
    '.ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ.',
  ],
};

const planRows = [
  '..............DD..............',
  'GggggggggggggggggggggggggggggG',
  'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
  '.OyyyyyyyyyyyyyyyyyyyyyyyyyyGO',
  '.OyyyyyyyyyyyyyyyyyyyEyOyOyOGO',
  '.OyyyyyyyyyyyyyyyPyEEyyOgggOGO',
  '.OyyyyyyyyyyyPyyEPEyyyyOgggOGO',
  '.OyyyyyyyyyyyPEEyyyyyyyOOOOOGO',
  '.OEEyyyyPEEEEyyyyyyyyyyyyyyyGO',
  '.OEEEEEEPyyyyyyyyyyyyyyyyyyyGO',
  '.OGGGGGGGGGGGGGGGGGGGGGGGGGGGO',
  'GggggggggggggggggggggggggggggG',
  'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
];

const plan: PixelSprite = {
  id: 'bs10-plan',
  name: 'plan',
  tags: [],
  blurb: 'The long plan on a parchment: a line that creeps along for years past three milestones, then climbs to a crown. A point of light runs up it and the crown flashes.',
  rows: planRows,
  frames: [
    planRows,
    bsMoved(planRows, {
      9: '.OEEEWEEPyyyyyyyyyyyyyyyyyyyGO',
    }),
    bsMoved(planRows, {
      8: '.OEEyyyyPWEEEyyyyyyyyyyyyyyyGO',
    }),
    bsMoved(planRows, {
      7: '.OyyyyyyyyyyyPWEyyyyyyyOOOOOGO',
    }),
    bsMoved(planRows, {
      6: '.OyyyyyyyyyyyPyyEWEyyyyOgggOGO',
    }),
    bsMoved(planRows, {
      5: '.OyyyyyyyyyyyyyyyPyEWyyOgggOGO',
    }),
    bsMoved(planRows, {
      4: '.OyyyyyyyyyyyyyyyyyyyWyOyOyOGO',
    }),
    bsMoved(planRows, {
      5: '.OyyyyyyyyyyyyyyyPyEEyyOyyyOGO',
      6: '.OyyyyyyyyyyyPyyEPEyyyyOyyyOGO',
    }),
    planRows,
  ],
  frameMs: 420,
};

const ship: PixelSprite = {
  id: 'bs10-ship',
  name: 'ship',
  tags: [],
  blurb: "The house ship at anchor on the map's sea, by the harbour jetty.",
  rows: [
    '..D...',
    '..Pq..',
    '..PPq.',
    'gOOOOg',
    '.OOOO.',
  ],
};

const milestone: PixelSprite = {
  id: 'bs10-milestone',
  name: 'milestone',
  tags: [],
  blurb: "A milestone flag's pennant, for the top of one of the map's flag poles. Four of them light in turn along the road.",
  rows: [
    'qP',
    'PE',
  ],
};

const allyTeal = bsRecoloured(bsBust, 'bs10-ally-teal', BS_COAT_TEAL, { S: '#F4CBA4', U: '#D6A87C', H: '#3A2418' });
const allyGold = bsRecoloured(bsBustHat, 'bs10-ally-gold', BS_COAT_GOLD);

export const bs10Opener: SceneArt = {
  id: 'bs10-opener',
  label: 'A strategist leans over a great table where the whole realm is laid out as a map, raking a piece along a road of flags from a small bookstall to the castle, as two allies look on under a chart of the long plan.',
  width: 80,
  height: 60,
  base: bsWarRoom,
  layers: [
    { sprite: plan, x: 24, y: 2 },
    { sprite: bsTorch, x: 4, y: 7 },
    { sprite: bsEmber, x: 5, y: 5, motion: { kind: 'rise', amp: 4, periodMs: 1500 } },
    { sprite: bsEmber, x: 6, y: 6, motion: { kind: 'rise', amp: 5, periodMs: 2100, phase: 0.5 } },
    { sprite: bsStar, x: 74, y: 7, motion: { kind: 'twinkle', periodMs: 1900, min: 0.2 } },
    { sprite: bsStar, x: 76, y: 11, motion: { kind: 'twinkle', periodMs: 2500, phase: 0.6, min: 0.2 } },
    { sprite: allyGold, x: 11, y: 19 },
    { sprite: allyTeal, x: 20, y: 22 },
    { sprite: realm, x: 0, y: 29 },
    { sprite: ship, x: 9, y: 36, motion: { kind: 'bob', amp: 1, periodMs: 2200 } },
    { sprite: milestone, x: 34, y: 44, motion: { kind: 'twinkle', periodMs: 2800, min: 0.25 } },
    { sprite: milestone, x: 46, y: 42, motion: { kind: 'twinkle', periodMs: 2800, phase: 0.75, min: 0.25 } },
    { sprite: milestone, x: 61, y: 39, motion: { kind: 'twinkle', periodMs: 2800, phase: 0.5, min: 0.25 } },
    { sprite: milestone, x: 60, y: 34, motion: { kind: 'twinkle', periodMs: 2800, phase: 0.25, min: 0.25 } },
    { sprite: bsMoatKeep, x: 26, y: 21 },
    { sprite: bsPawn, x: 48, y: 28 },
    { sprite: bsStrategist, x: 50, y: 9 },
  ],
};

const wallPennantWest = bsLater(bsNightPennant, 'bs10-backdrop-pennant-wall-west', 2, 620);
const wallPennantEast = bsLater(bsNightPennant, 'bs10-backdrop-pennant-wall-east', 1, 700);

/** The pathway backdrop on its own base, dressed for the capstone: two more pennants on the curtain wall, more stars out. */
export const bs10Backdrop: SceneArt = {
  ...bsBackdrop,
  id: 'bs10-backdrop',
  label: 'A castle at night in its moat, its walls hung with pennants, with a rival fort on one hill and a small camp of newcomers around a fire on the other.',
  layers: [
    ...bsBackdrop.layers,
    { sprite: wallPennantWest, x: 41, y: 13 },
    { sprite: wallPennantEast, x: 70, y: 13 },
    { sprite: bsNightStar, x: 26, y: 1, motion: { kind: 'twinkle', periodMs: 4900, min: 0.3, phase: 0.15 } },
    { sprite: bsNightStar, x: 68, y: 3, motion: { kind: 'twinkle', periodMs: 5600, min: 0.3, phase: 0.55 } },
    { sprite: bsNightStar, x: 85, y: 2, motion: { kind: 'twinkle', periodMs: 4400, min: 0.3, phase: 0.85 } },
    { sprite: bsNightStar, x: 108, y: 4, motion: { kind: 'twinkle', periodMs: 6300, min: 0.3, phase: 0.35 } },
  ],
};

const emblem: PixelSprite = {
  id: 'bs10-emblem-crowned-rook',
  name: 'emblem-crowned-rook',
  tags: [],
  blurb: 'Lesson 10 emblem, 16x16, the capstone mark: a gold rook wearing a crown with an orchid band.',
  rows: [
    '...y...yy...y...',
    '...Gy..yG..yG...',
    '...GGy.GG.yGG...',
    '...OPPPqqPPPO...',
    '...OOOOOOOOOO...',
    '..OOO.OOOO.OOO..',
    '..OyO.OyGO.OgO..',
    '..OyOOOyGOOOgO..',
    '..OyyGGGGGGGgO..',
    '...OOOOOOOOOO...',
    '....OyGGGGgO....',
    '....OyGGGGgO....',
    '....OyGGGGgO....',
    '...OOOOOOOOOO...',
    '..OyGGGGGGGGgO..',
    '..OOOOOOOOOOOO..',
  ],
};

export const bs10Finish: SceneArt = bsKeepsake(
  'bs10-finish',
  'A purple house banner on a gold rod, its roundel showing a gold rook wearing a crown with an orchid band, the capstone mark.',
  emblem,
);

export const art: LessonArtSet = { opener: bs10Opener, backdrop: bs10Backdrop, finish: bs10Finish };
