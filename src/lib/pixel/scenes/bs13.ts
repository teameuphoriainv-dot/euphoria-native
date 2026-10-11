/**
 * Business Strategy lesson 13 opener: the same shield, worth more with the crest on it.
 *
 * Built on bsMarketSquare. Two shields of the same make stand on display: the plain grey one on the
 * left with a one-coin tag, which nobody stops for, and on the right the same shield painted in the
 * house orchid with the gold rook, its tag stacked with four coins. A crowd gathers by the crested one,
 * and what rises from them is the crest itself, in thought: a brand is what people carry in their
 * heads. The strategist points to it. The crested shield is the brightest mark; the grey one sits a
 * step above the dark street. Moving: light runs across the crest, the strategist points and blinks,
 * the crowd shifts, thoughts of the crest rise, and stars twinkle over the roofs.
 */
import type { PixelSprite } from '../types';
import { bsBackdrop } from './bs-backdrop';
import { bsMoved, bsStar } from './bs-kit';
import { BS_COAT_BLUE, BS_COAT_GOLD, BS_COAT_GREEN, bsFolk, bsMarketSquare, bsMirrored, bsRecoloured, bsStrategistStand } from './bs-kit-a';
import { bsKeepsake } from './bs1-finish';
import type { LessonArtSet, SceneArt } from './types';

const shieldPlain: PixelSprite = {
  id: 'bs13-shield-plain',
  name: 'shield-plain',
  tags: [],
  blurb: 'A plain grey shield on a display stand, the foot on the bottom row; a tag hangs from the bar under it at (x + 6, y + 15).',
  rows: [
    'KKKKKKKKKKK',
    'KxxxxxxxxxK',
    'KxXXXXXXXXK',
    'KxXXXXXXXXK',
    'KxXXXXXXXXK',
    'KxXXXXXXXXK',
    'KxXXXXXXXXK',
    'KxXXXXXXXXK',
    '.KXXXXXXXK.',
    '.KXXXXXXXK.',
    '..KXXXXXK..',
    '...KXXXK...',
    '....KKK....',
    '.....O.....',
    '...OOOOOO..',
    '.....O.....',
    '.....O.....',
    '.....O.....',
    '.....O.....',
    '.....O.....',
    '.....O.....',
    '.....O.....',
    '.....O.....',
    '.....O.....',
    '.....O.....',
    '.....O.....',
    '.....O.....',
    '..OOOOOOO..',
  ],
};

const shieldCrestRows = [
  'OOOOOOOOOOO',
  'OqqqqqqqqqO',
  'OqPPPPPPPPO',
  'OqPyPGPGPPO',
  'OqPyGGGGPPO',
  'OqPPyGGPPPO',
  'OqPPyGGPPPO',
  'OqPyGGGgPPO',
  '.OPgggggPO.',
  '.OPPPPPPPO.',
  '..OPPPPPO..',
  '...OPPPO...',
  '....OOO....',
  '.....O.....',
  '...OOOOOO..',
  '.....O.....',
  '.....O.....',
  '.....O.....',
  '.....O.....',
  '.....O.....',
  '.....O.....',
  '.....O.....',
  '.....O.....',
  '.....O.....',
  '.....O.....',
  '.....O.....',
  '.....O.....',
  '..OOOOOOO..',
];

const shieldCrest: PixelSprite = {
  id: 'bs13-shield-crest',
  name: 'shield-crest',
  tags: [],
  blurb: 'The same shield painted with the house crest, a gold rook on orchid, on its stand. Light runs across it.',
  rows: shieldCrestRows,
  frames: [
    shieldCrestRows,
    shieldCrestRows,
    bsMoved(shieldCrestRows, {
      2: 'OqWPPPPPPPO',
      3: 'OWPyPGPGPPO',
    }),
    bsMoved(shieldCrestRows, {
      1: 'OqqqqWqqqqO',
      2: 'OqPPWPPPPPO',
    }),
    bsMoved(shieldCrestRows, {
      1: 'OqqqqqqqqWO',
      2: 'OqPPPPPPWPO',
    }),
    bsMoved(shieldCrestRows, {
      5: 'OqPPyGGPPWO',
      6: 'OqPPyGGPWPO',
    }),
    shieldCrestRows,
  ],
  frameMs: 260,
};

const tagCheap: PixelSprite = {
  id: 'bs13-tag-cheap',
  name: 'tag-cheap',
  tags: [],
  blurb: 'A price tag with one coin, hung by its string.',
  rows: [
    '..D..',
    'wwwwx',
    'wyGyx',
    'wOgOx',
    'wwwwx',
  ],
};

const tagDear: PixelSprite = {
  id: 'bs13-tag-dear',
  name: 'tag-dear',
  tags: [],
  blurb: 'A price tag stacked with four coins, hung by its string.',
  rows: [
    '..D..',
    'wwwwx',
    'wyGyx',
    'wOgOx',
    'wyGyx',
    'wOgOx',
    'wyGyx',
    'wOgOx',
    'wyGyx',
    'wOgOx',
    'wwwwx',
  ],
};

const thought: PixelSprite = {
  id: 'bs13-thought',
  name: 'thought',
  tags: [],
  blurb: 'A thought bubble holding the house crest, for a rise layer over someone in the crowd.',
  rows: [
    '.xxxxx.',
    'xwGwGwx',
    'xwGGGwx',
    'xwGGGwx',
    'xwwwwwx',
    '.xxxxx.',
    '..x....',
    '.x.....',
  ],
};

const strategistRight = bsMirrored(bsStrategistStand, 'bs13-strategist-right');
const fanGold = bsRecoloured(bsFolk, 'bs13-fan-gold', BS_COAT_GOLD);
const fanGreen = bsRecoloured(bsFolk, 'bs13-fan-green', BS_COAT_GREEN, { S: '#F4CBA4', U: '#D6A87C', H: '#3A2418' });
const fanBlue = bsRecoloured(bsFolk, 'bs13-fan-blue', BS_COAT_BLUE, { H: '#2A1B12' });

export const bs13Opener: SceneArt = {
  id: 'bs13-opener',
  label: 'In a market square two identical shields stand on display, but the one painted with the house crest draws the crowd, fills their thoughts and carries the higher price.',
  width: 80,
  height: 60,
  base: bsMarketSquare,
  layers: [
    { sprite: bsStar, x: 10, y: 3, motion: { kind: 'twinkle', periodMs: 2100, min: 0.2 } },
    { sprite: bsStar, x: 40, y: 5, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.4, min: 0.2 } },
    { sprite: bsStar, x: 70, y: 2, motion: { kind: 'twinkle', periodMs: 2300, phase: 0.75, min: 0.2 } },
    { sprite: shieldPlain, x: 7, y: 18 },
    { sprite: tagCheap, x: 13, y: 33 },
    { sprite: shieldCrest, x: 46, y: 18 },
    { sprite: tagDear, x: 52, y: 33 },
    { sprite: fanGold, x: 58, y: 33, motion: { kind: 'bob', amp: 1, periodMs: 1900 } },
    { sprite: fanGreen, x: 65, y: 34, motion: { kind: 'bob', amp: 1, periodMs: 2300, phase: 0.4 } },
    { sprite: fanBlue, x: 72, y: 33, motion: { kind: 'bob', amp: 1, periodMs: 2100, phase: 0.7 } },
    { sprite: thought, x: 58, y: 23, motion: { kind: 'rise', amp: 5, periodMs: 2800 } },
    { sprite: thought, x: 66, y: 24, motion: { kind: 'rise', amp: 6, periodMs: 3200, phase: 0.35 } },
    { sprite: thought, x: 73, y: 22, motion: { kind: 'rise', amp: 5, periodMs: 3000, phase: 0.7 } },
    { sprite: strategistRight, x: 25, y: 14 },
  ],
};

const emblem: PixelSprite = {
  id: 'bs13-emblem-arms',
  name: 'emblem-arms',
  tags: [],
  blurb: 'Lesson 13 emblem, 16x16: a heraldic shield quartered in house orchid and gold, rimmed in gold.',
  rows: [
    '................',
    '.OOOOOOOOOOOOOO.',
    '.OqqqqqqyGGGGGO.',
    '.OqPPPPPGGGGGgO.',
    '.OqPPPPPGGGGGgO.',
    '.OqPPPyGGgPPGgO.',
    '.OqPPPGGGGPPGgO.',
    '.OGGGGyGGgPPPpO.',
    '.OGGGGGGGgPPPpO.',
    '..OGGGGGGPPPpO..',
    '..OGGGGGGPPPpO..',
    '...OGGGGGPPpO...',
    '....OGGGGPpO....',
    '.....OGGGpO.....',
    '......OOOO......',
    '................',
  ],
};

export const bs13Finish: SceneArt = bsKeepsake(
  'bs13-finish',
  'A purple house banner on a gold rod, its roundel showing a shield quartered in orchid and gold.',
  emblem,
);

export const art: LessonArtSet = { opener: bs13Opener, backdrop: bsBackdrop, finish: bs13Finish };
