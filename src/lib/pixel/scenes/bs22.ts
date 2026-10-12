/**
 * Business Strategy lesson 22 opener: the best people come to the house that is known for its people.
 *
 * Built on bsTavern, the hearth swapped for the house banner and the door moved to the right. It is
 * recruiting night: the strategist stands behind the table and reaches out to welcome a newcomer in
 * teal, seated with the contract and the inkwell in front of them and a gold star over their head, the
 * one in a hundred the house was looking for. More hopefuls queue from the open door, one of them in a
 * rival's red, drawn away by the house's name. The star and the lantern are the brightest marks. Moving:
 * the star sparkles and bobs, the strategist gestures and blinks, the banner flutters, the lantern and
 * the candle flicker, and the queue shifts its weight.
 */
import type { PixelSprite } from '../types';
import { bsBackdrop } from './bs-backdrop';
import { bsCandle, bsWallBanner } from './bs-kit';
import {
  BS_COAT_BLUE,
  BS_COAT_GREEN,
  BS_COAT_TEAL,
  bsBust,
  bsFolk,
  bsMirrored,
  bsRecoloured,
  bsStrategistShake,
} from './bs-kit-a';
import { bsTavern, bsTavernDoor } from './bs-kit-b';
import { bsLantern, bsTable } from './bs-kit-c';
import { bsKeepsake } from './bs1-finish';
import type { LessonArtSet, SceneArt } from './types';

const starRows = [
  '..y..',
  '.yGg.',
  'yGGGg',
  '.GGg.',
  '.g.g.',
];

const star: PixelSprite = {
  id: 'bs22-star',
  name: 'star',
  tags: [],
  blurb: "The gold star over the recruit's head; its heart flashes white.",
  rows: starRows,
  frames: [
    starRows,
    [
      '..y..',
      '.yWg.',
      'yWWWg',
      '.GWg.',
      '.g.g.',
    ],
    starRows,
    starRows,
  ],
  frameMs: 420,
};

const contract: PixelSprite = {
  id: 'bs22-contract',
  name: 'contract',
  tags: [],
  blurb: 'The contract lying open on the table, sealed in orchid.',
  rows: [
    'yyyyyyyO',
    'yxxxyPyO',
  ],
};

const inkwell: PixelSprite = {
  id: 'bs22-inkwell',
  name: 'inkwell',
  tags: [],
  blurb: 'An inkwell with a quill standing in it, its foot on the bottom row.',
  rows: [
    '...w',
    '..w.',
    '.w..',
    'OKO.',
  ],
};

const RIVAL_COAT = { E: '1', q: 's', P: 'R', p: 'r' } as const;
const LIGHT_SKIN = { S: '#F4CBA4', U: '#D6A87C', H: '#3A2418' } as const;

const welcome = bsMirrored(bsStrategistShake, 'bs22-strategist-welcome');
const recruit = bsRecoloured(bsBust, 'bs22-recruit', BS_COAT_TEAL, LIGHT_SKIN);
const hopefulGreen = bsRecoloured(bsFolk, 'bs22-hopeful-green', BS_COAT_GREEN);
const hopefulBlue = bsRecoloured(bsFolk, 'bs22-hopeful-blue', BS_COAT_BLUE, LIGHT_SKIN);
const hopefulRival = bsRecoloured(bsFolk, 'bs22-hopeful-rival', RIVAL_COAT);
const table = bsTable('bs22-table', 32);

export const bs22Opener: SceneArt = {
  id: 'bs22-opener',
  label: 'In a tavern on recruiting night a strategist welcomes a newcomer marked with a gold star to the house table, while more hopefuls queue from the open door.',
  width: 80,
  height: 60,
  base: bsTavern,
  layers: [
    { sprite: bsWallBanner, x: 3, y: 6 },
    { sprite: bsLantern, x: 40, y: 6 },
    { sprite: bsTavernDoor, x: 62, y: 19 },
    { sprite: hopefulGreen, x: 65, y: 30, motion: { kind: 'bob', amp: 1, periodMs: 2000 } },
    { sprite: hopefulRival, x: 55, y: 33, motion: { kind: 'bob', amp: 1, periodMs: 2300, phase: 0.4 } },
    { sprite: hopefulBlue, x: 47, y: 35, motion: { kind: 'bob', amp: 1, periodMs: 2600, phase: 0.7 } },
    { sprite: welcome, x: 12, y: 18 },
    { sprite: recruit, x: 34, y: 33 },
    { sprite: table, x: 12, y: 40 },
    { sprite: contract, x: 22, y: 40 },
    { sprite: inkwell, x: 30, y: 37 },
    { sprite: bsCandle, x: 13, y: 32 },
    { sprite: star, x: 35, y: 26, motion: { kind: 'bob', amp: 1, periodMs: 1600 } },
  ],
};

const emblem: PixelSprite = {
  id: 'bs22-emblem-medal',
  name: 'emblem-medal',
  tags: [],
  blurb: 'Lesson 22 emblem, 16x16: a gold star medal hanging from an orchid ribbon.',
  rows: [
    '..EPE.....EPE...',
    '...EPE...EPE....',
    '....EPE.EPE.....',
    '.....EPEPE......',
    '......EPE.......',
    '......OyO.......',
    '.......y........',
    '......yGg.......',
    '......yGg.......',
    '..yyyyGGGGggg...',
    '...yGGGGGGGg....',
    '....yGGGGGg.....',
    '....yGGWGGg.....',
    '...yGGg.yGGg....',
    '...yGg...yGg....',
    '..yg.......Og...',
  ],
};

export const bs22Finish: SceneArt = bsKeepsake(
  'bs22-finish',
  'A purple house banner on a gold rod, its roundel showing a gold star medal hanging from a purple ribbon.',
  emblem,
);

export const art: LessonArtSet = { opener: bs22Opener, backdrop: bsBackdrop, finish: bs22Finish };
