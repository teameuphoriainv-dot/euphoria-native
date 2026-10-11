/**
 * Business Strategy lesson 4 opener: the pitch, and what each round of money costs.
 *
 * Built on bsCouncilHall. The strategist stands at a chart hung from the beam and points at it: each
 * funding round adds a taller bar of money and cuts another backer's slice out of the founder's
 * purple pie (dilution). Across the hall two backers in top hats sit behind their table with a chest
 * of gold open in front of them. The parchment is the brightest broad surface, the gold chest the
 * brightest small one. Moving: the rounds play out on the chart, the strategist points and blinks,
 * coins rise off the chest, torches on the pillars flicker and spark, stars twinkle in the windows.
 */
import type { PixelSprite } from '../types';
import { bsBackdrop } from './bs-backdrop';
import { bsEmber, bsScroll, bsStar, bsTorch } from './bs-kit';
import { BS_COAT_BLUE, BS_COAT_GOLD, bsBustHat, bsCoin, bsCouncilHall, bsMirrored, bsRecoloured, bsStrategistStand } from './bs-kit-a';
import { bsKeepsake } from './bs1-finish';
import type { LessonArtSet, SceneArt } from './types';

const roundsRows = [
  '.........................',
  '.....OOOOO...............',
  '...OOggPPPOO.............',
  '..OOgggPPPPOO............',
  '.OOggggPPPPPOO...........',
  '.OgggggPPPPPPO...........',
  'OggggggPPPPPPPO..........',
  'OggggggPPPPPPPO..........',
  'OPPPPPPPPPPPPPO..........',
  'OPPPPPPPPPPPPPO..........',
  'OPPPPPPPPPPPPPO..........',
  '.OPPPPPPPPPPPO...........',
  '.OOPPPPPPPPPOO...Gg......',
  '..OOPPPPPPPOO....Gg......',
  '...OOPPPPPOO.....Gg......',
  '.....OOOOO.......Gg......',
  '.................OOOOOOOO',
];

const roundsB = [
  '.........................',
  '.....OOOOO...............',
  '...OOttPPPOO...........Gg',
  '..OOtttPPPPOO..........Gg',
  '.OOttttPPPPPOO.........Gg',
  '.ObttttPPPPPPO.........Gg',
  'ObbbbttPPPPPPPO........Gg',
  'ObbbbbtPPPPPPPO........Gg',
  'ObbbbbbgPPPPPPO.....Gg.Gg',
  'ObbbbbggPPPPPPO.....Gg.Gg',
  'ObbbbggggPPPPPO.....Gg.Gg',
  '.ObgggggggPPPO......Gg.Gg',
  '.OOgggggggPPOO...Gg.Gg.Gg',
  '..OOgggggggOO....Gg.Gg.Gg',
  '...OOgggggOO.....Gg.Gg.Gg',
  '.....OOOOO.......Gg.Gg.Gg',
  '.................OOOOOOOO',
];

const rounds: PixelSprite = {
  id: 'bs4-rounds',
  name: 'rounds',
  tags: [],
  blurb: "For the scroll: the founder's pie and the money raised. Each round adds a taller gold bar and a backer's slice (gold, then blue, then teal) while the purple share shrinks.",
  rows: roundsRows,
  frames: [
    roundsRows,
    [
      '.........................',
      '.....OOOOO...............',
      '...OObbPPPOO.............',
      '..OObbbPPPPOO............',
      '.OObbbbPPPPPOO...........',
      '.ObbbbbPPPPPPO...........',
      'ObbbbbbPPPPPPPO..........',
      'OgggbbbPPPPPPPO..........',
      'OggggggPPPPPPPO.....Gg...',
      'OggggggPPPPPPPO.....Gg...',
      'OggggggPPPPPPPO.....Gg...',
      '.OgggggPPPPPPO......Gg...',
      '.OOgggPPPPPPOO...Gg.Gg...',
      '..OOggPPPPPOO....Gg.Gg...',
      '...OOgPPPPOO.....Gg.Gg...',
      '.....OOOOO.......Gg.Gg...',
      '.................OOOOOOOO',
    ],
    roundsB,
    roundsB,
  ],
  frameMs: 800,
};

const backersTable: PixelSprite = {
  id: 'bs4-backers-table',
  name: 'backers-table',
  tags: [],
  blurb: "The backers' table seen from the front, running off the right edge: a top, a purple cloth with a gold hem, two legs and its shadow.",
  palette: { Z: '#110E17' },
  rows: [
    '.gggggggggggggggggggggggggg',
    'ggggggggggggggggggggggggggg',
    'GGGGGGGGGGGGGGGGGGGGGGGGGGG',
    'Epppppppppppppppppppppppppp',
    'Epppppppppppppppppppppppppp',
    'Epppppppppppppppppppppppppp',
    'GGGGGGGGGGGGGGGGGGGGGGGGGGG',
    '.OO.....................OO.',
    '.OO.....................OO.',
    '.OO.....................OO.',
    'ZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  ],
};

const chest: PixelSprite = {
  id: 'bs4-chest',
  name: 'chest',
  tags: [],
  blurb: 'A chest of gold, open, standing on its bottom row.',
  rows: [
    '..OOOOOOOOO..',
    '.OgggggggggO.',
    '.OgGGGGGGGgO.',
    'OyGyGyGyGyGyO',
    'OGGGGGGGGGGGO',
    'OgOgggOgggOgO',
    'OgOggyOgggOgO',
    'OgOgggOgggOgO',
    'OOOOOOOOOOOOO',
  ],
};

const presenter = bsMirrored(bsStrategistStand, 'bs4-presenter');
const backerGold = bsRecoloured(bsBustHat, 'bs4-backer-gold', BS_COAT_GOLD);
const backerBlue = bsRecoloured(bsBustHat, 'bs4-backer-blue', BS_COAT_BLUE, { S: '#F4CBA4', U: '#D6A87C', H: '#A79DB5' });

export const bs4Opener: SceneArt = {
  id: 'bs4-opener',
  label: "In a council hall the strategist points at a chart where each funding round adds a taller bar and takes a slice of the founder's pie, while two backers in top hats sit behind a chest of gold.",
  width: 80,
  height: 60,
  base: bsCouncilHall,
  layers: [
    { sprite: bsStar, x: 15, y: 13, motion: { kind: 'twinkle', periodMs: 2200, min: 0.2 } },
    { sprite: bsStar, x: 63, y: 15, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.5, min: 0.2 } },
    { sprite: bsScroll, x: 24, y: 3 },
    { sprite: rounds, x: 28, y: 8 },
    { sprite: bsTorch, x: 1, y: 14 },
    { sprite: bsEmber, x: 2, y: 12, motion: { kind: 'rise', amp: 4, periodMs: 1600 } },
    { sprite: bsTorch, x: 74, y: 14 },
    { sprite: bsEmber, x: 76, y: 12, motion: { kind: 'rise', amp: 5, periodMs: 2000, phase: 0.5 } },
    { sprite: presenter, x: 10, y: 16 },
    { sprite: backerGold, x: 66, y: 27 },
    { sprite: backerBlue, x: 73, y: 27 },
    { sprite: backersTable, x: 53, y: 37 },
    { sprite: chest, x: 53, y: 29 },
    { sprite: bsCoin, x: 57, y: 27, motion: { kind: 'rise', amp: 6, periodMs: 2200 } },
    { sprite: bsCoin, x: 61, y: 26, motion: { kind: 'rise', amp: 5, periodMs: 2700, phase: 0.5 } },
  ],
};

const emblem: PixelSprite = {
  id: 'bs4-emblem-pie',
  name: 'emblem-pie',
  tags: [],
  blurb: "Lesson 4 emblem, 16x16: the founder's purple pie with a backer's gold slice pulled out.",
  rows: [
    '................',
    '.........OOO....',
    '.........OGGOO..',
    '.....EE..OyGGOO.',
    '...EEPP..OGyGGO.',
    '..EEqPP..OGGGGGO',
    '..EqqPP..OGGGGGO',
    '.EqqqPP.........',
    '.EqqqPP.........',
    '.EqqqPPPPPPPPE..',
    '.EqqqPPPPPPPPE..',
    '.EqqqPPPPPPPPE..',
    '..EqqPPPPPPPE...',
    '..EEqPPPPPPEE...',
    '...EEPPPPPEE....',
    '.....EEEEE......',
  ],
};

export const bs4Finish: SceneArt = bsKeepsake(
  'bs4-finish',
  'A purple house banner on a gold rod, its roundel showing a purple pie with one gold slice pulled out of it.',
  emblem,
);

export const art: LessonArtSet = { opener: bs4Opener, backdrop: bsBackdrop, finish: bs4Finish };
