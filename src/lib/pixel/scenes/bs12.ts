/**
 * Business Strategy lesson 12 opener: three prices, and the one built to be chosen.
 *
 * Built on bsCouncilHall. Three banners hang from the beam like the tiers of a price list: a short
 * plain grey one marked with a single coin, the long blue one marked with five (the anchor that makes
 * the others look reasonable), and between them the widest, the house orchid trimmed in gold and
 * crowned, marked with two. Under each stands its chest, and the buyers walk up to the middle one. The
 * crowned banner is the brightest broad surface; the plain one sits a step above the dark wall. Moving:
 * the crown sparkles, light runs over the middle chest's lid, a coin rises from it as it sells, the
 * buyers shift, the pillar torches flicker and spark, and stars twinkle in the windows.
 */
import type { PixelSprite } from '../types';
import { bsBackdrop } from './bs-backdrop';
import { bsEmber, bsMoved, bsStar, bsTorch } from './bs-kit';
import { BS_COAT_BLUE, BS_COAT_GREEN, bsCoin, bsCouncilHall, bsRecoloured } from './bs-kit-a';
import { bsFolkBack } from './bs-kit-b';
import { bsKeepsake } from './bs1-finish';
import type { LessonArtSet, SceneArt } from './types';

const tierBasic: PixelSprite = {
  id: 'bs12-tier-basic',
  name: 'tier-basic',
  tags: [],
  blurb: 'The plain tier: a short grey banner marked with one coin, hung from the beam by two rings.',
  rows: [
    '..D.....D..',
    'OgggggggggO',
    '.KXDDDDDkK.',
    '.KXDDDDDkK.',
    '.KXDDDDDkK.',
    '.KXDDDDDkK.',
    '.KXDyGyDkK.',
    '.KXDOgODkK.',
    '.KXDDDDDkK.',
    '.KXDDDDDkK.',
    '.KXDDDDDkK.',
    '.KKKKKKKKK.',
    '.KXDK.KDkK.',
    '.KXK...KkK.',
    '.KK.....KK.',
  ],
};

const tierPro: PixelSprite = {
  id: 'bs12-tier-pro',
  name: 'tier-pro',
  tags: [],
  blurb: 'The middle tier, the one built to be chosen: the widest banner, house orchid trimmed in gold, crowned, marked with two coins.',
  rows: [
    '..D.........D..',
    'OgggggggggggggO',
    '.EqPPPPPPPPPpE.',
    '.EGGGGGGGGGGGE.',
    '.EqPPPPPPPPPpE.',
    '.EqPPyPyPyPPpE.',
    '.EqPPGyGyGPPpE.',
    '.EqPPGGGGGPPpE.',
    '.EqPPOOOOOPPpE.',
    '.EqPPPPPPPPPpE.',
    '.EqPPPPPPPPPpE.',
    '.EqPPPPPPPPPpE.',
    '.EqPPPyGyPPPpE.',
    '.EqPPPOgOPPPpE.',
    '.EqPPPPPPPPPpE.',
    '.EqPPPyGyPPPpE.',
    '.EqPPPOgOPPPpE.',
    '.EqPPPPPPPPPpE.',
    '.EGGGGGGGGGGGE.',
    '.EEEEEEEEEEEEE.',
    '.EqPPPE.EPPPpE.',
    '.EqPPE...EPPpE.',
    '.EqPE.....EPpE.',
  ],
};

const tierPremium: PixelSprite = {
  id: 'bs12-tier-premium',
  name: 'tier-premium',
  tags: [],
  blurb: 'The anchor tier: the longest banner, deep blue, marked with five coins, there to make the middle one look reasonable.',
  rows: [
    '..D.....D..',
    'OgggggggggO',
    '.KBbbbbbbK.',
    '.KBbbbbbbK.',
    '.KBbyGybbK.',
    '.KBbOgObbK.',
    '.KBbbbbbbK.',
    '.KBbyGybbK.',
    '.KBbOgObbK.',
    '.KBbbbbbbK.',
    '.KBbyGybbK.',
    '.KBbOgObbK.',
    '.KBbbbbbbK.',
    '.KBbyGybbK.',
    '.KBbOgObbK.',
    '.KBbbbbbbK.',
    '.KBbyGybbK.',
    '.KBbOgObbK.',
    '.KBbbbbbbK.',
    '.KBbbbbbbK.',
    '.KBbbbbbbK.',
    '.KBbbbbbbK.',
    '.KKKKKKKKK.',
    '.KBbK.KbbK.',
    '.KBK...KbK.',
    '.KK.....KK.',
  ],
};

const chestBasic: PixelSprite = {
  id: 'bs12-chest-basic',
  name: 'chest-basic',
  tags: [],
  blurb: 'A plain wooden box under the plain tier, standing on its bottom row.',
  rows: [
    '.OOOOO.',
    'OgggggO',
    'OOOOOOO',
    'OgggggO',
    'OOOOOOO',
  ],
};

const chestProRows = [
  '..OOOOOOO..',
  '.OyGGGGGgO.',
  'OyGGGGGGGgO',
  'OOOOOqOOOOO',
  'OyGGGPGGGgO',
  'OyGGGGGGGgO',
  'OyGGGGGGGgO',
  'OOOOOOOOOOO',
];

const chestPro: PixelSprite = {
  id: 'bs12-chest-pro',
  name: 'chest-pro',
  tags: [],
  blurb: 'The gold chest under the crowned tier, standing on its bottom row; light runs over its lid.',
  rows: chestProRows,
  frames: [
    chestProRows,
    chestProRows,
    bsMoved(chestProRows, {
      1: '.OyWGGGGgO.',
    }),
    bsMoved(chestProRows, {
      1: '.OyGGWGGgO.',
      2: 'OyGGGWGGGgO',
    }),
    bsMoved(chestProRows, {
      2: 'OyGGGGGGWgO',
    }),
  ],
  frameMs: 300,
};

const chestPremium: PixelSprite = {
  id: 'bs12-chest-premium',
  name: 'chest-premium',
  tags: [],
  blurb: 'The heavy blue chest bound in gold under the anchor tier, standing on its bottom row.',
  rows: [
    '..OOOOOOOOO..',
    '.ObBBBBBBBbO.',
    'ObBBBBBBBBBbO',
    'OGGGGGGGGGGGO',
    'ObbbbbGbbbbbO',
    'ObbbbbybbbbbO',
    'ObbbbbbbbbbbO',
    'OGGGGGGGGGGGO',
    'OOOOOOOOOOOOO',
  ],
};

const sparkle: PixelSprite = {
  id: 'bs12-sparkle',
  name: 'sparkle',
  tags: [],
  blurb: 'A glint off the crown, for a twinkle layer.',
  rows: [
    '.w.',
    'wWw',
    '.w.',
  ],
};

const buyerBlue = bsRecoloured(bsFolkBack, 'bs12-buyer-blue', BS_COAT_BLUE);
const buyerGreen = bsRecoloured(bsFolkBack, 'bs12-buyer-green', BS_COAT_GREEN, { H: '#2A1B12' });

export const bs12Opener: SceneArt = {
  id: 'bs12-opener',
  label: 'Three priced banners hang in a council hall over three chests, the middle one widest, crowned and glowing, and buyers walk up to it.',
  width: 80,
  height: 60,
  base: bsCouncilHall,
  layers: [
    { sprite: bsStar, x: 15, y: 13, motion: { kind: 'twinkle', periodMs: 2200, min: 0.2 } },
    { sprite: bsStar, x: 63, y: 15, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.5, min: 0.2 } },
    { sprite: tierBasic, x: 19, y: 5 },
    { sprite: tierPro, x: 32, y: 5 },
    { sprite: tierPremium, x: 49, y: 5 },
    { sprite: sparkle, x: 43, y: 8, motion: { kind: 'twinkle', periodMs: 1700, min: 0.1 } },
    { sprite: bsTorch, x: 1, y: 14 },
    { sprite: bsEmber, x: 2, y: 12, motion: { kind: 'rise', amp: 4, periodMs: 1600 } },
    { sprite: bsTorch, x: 74, y: 14 },
    { sprite: bsEmber, x: 76, y: 12, motion: { kind: 'rise', amp: 5, periodMs: 2000, phase: 0.5 } },
    { sprite: chestBasic, x: 21, y: 41 },
    { sprite: chestPro, x: 34, y: 38 },
    { sprite: chestPremium, x: 48, y: 37 },
    { sprite: bsCoin, x: 38, y: 34, motion: { kind: 'rise', amp: 6, periodMs: 2300 } },
    { sprite: buyerBlue, x: 37, y: 46, motion: { kind: 'bob', amp: 1, periodMs: 2100 } },
    { sprite: buyerGreen, x: 27, y: 47, motion: { kind: 'bob', amp: 1, periodMs: 2500, phase: 0.4 } },
  ],
};

const emblem: PixelSprite = {
  id: 'bs12-emblem-tag',
  name: 'emblem-tag',
  tags: [],
  blurb: 'Lesson 12 emblem, 16x16: a gold price tag on a string, marked with an orchid gem.',
  rows: [
    '..DD............',
    '.D..D...........',
    '.D..............',
    '..DD............',
    '....DOOOOO......',
    '....ODGGGgO.....',
    '....OGKKGGgO....',
    '....OGKKGGGgO...',
    '....OGGGGPPGgO..',
    '....OgGGPqPPGgO.',
    '.....OgGPPPpGGgO',
    '......OgGPpGGGgO',
    '.......OgGGGGgO.',
    '........OgGGgO..',
    '.........OggO...',
    '..........OO....',
  ],
};

export const bs12Finish: SceneArt = bsKeepsake(
  'bs12-finish',
  'A purple house banner on a gold rod, its roundel showing a gold price tag on a string, marked with an orchid gem.',
  emblem,
);

export const art: LessonArtSet = { opener: bs12Opener, backdrop: bsBackdrop, finish: bs12Finish };
