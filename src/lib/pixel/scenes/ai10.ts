/**
 * Alternative Investments lesson 10: the capstone, everything since lesson 1 brought together.
 *
 * The opener goes back to the vault gallery (ai-kit.ts) for the payoff of lesson 1's key. All six
 * niches are lit in one row under the cornice (real estate, private equity, hedge funds,
 * commodities, crypto, collectibles), and below them the round vault door stands open on its
 * hinge, gold light pouring out over a stack of bars, washing the wall and pooling on the floor,
 * while the collector holds the key up to it. Only small layers move: the long and short arrows
 * pump, the coin spins, the key glints, the light on the floor breathes, the collector blinks and
 * motes rise. The keepsake is the capstone's: a key whose bow is a ring set with six gems, one per
 * category, in the gold case (ai-kit-b.ts).
 */
import type { PixelSprite } from '../types';
import { aiBackdrop } from './ai-backdrop';
import {
  AI_COLLECTOR_EYE,
  aiCollectorBlink,
  aiCompose,
  aiCryptoCoin,
  aiFactory,
  aiGallery,
  aiGlintGold,
  aiGoldBars,
  aiHouse,
  aiLongShort,
  aiMoteGold,
  aiNiche,
  aiPainting,
  aiPictureLight,
  aiShadow,
} from './ai-kit';
import { AI_COLLECTOR_HAND, aiCollectorRaise } from './ai-kit-a';
import { AI_GOLD_PALETTE, aiKeepsakeGold } from './ai-kit-b';
import type { LessonArtSet, SceneArt } from './types';

/** The open vault: the round doorway lit from inside, then the door swung out on its hinge, bolts showing. */
const vault: PixelSprite = {
  id: 'ai10-vault',
  name: 'ai10-vault',
  tags: ['scene', 'ai'],
  blurb: "The vault standing open: a steel ring round a doorway full of gold light and bars, the thick door swung out.",
  rows: [
    '.........DDDDDD.................DDD..',
    '......DDDwxxxxxDDD.............DxXXD.',
    '.....DwwwxxxxxxxxXD............DwxXD.',
    '....DwwwxxxxxxxxXXXD..........DwxXXXD',
    '...DwwwxKKKKKKKKXXXXD.......GGDwxXXXD',
    '..DwwwxKGGGGGGGGKXXXXD........DwxXXXD',
    '.DwwwxKGGGyyyyGGGKXXXXDXXXXXXXDwxXXXD',
    '.DwwxKGGyyyyyyyyGGKXXXDDDDDDDDDwxXXXD',
    '.DwxKGGyyyyyyyyyyGGKXXD.....GGDwxXXXD',
    'DwxxKGGyyyyyyyyyyGGKXXDD......DwxXXXD',
    'DxxxKGyyyyyyyyyyyyGKXDDD......DwxGXXD',
    'DxxxKGyyyyyyyyyyyyGKDDDD......DwGOXXD',
    'DxxxKGyyyyyyyyyyyyGKDDDD....GGDwxGXXD',
    'DxxxKGyyyyyyyyyyyyGKDDDD......DwxXXXD',
    'DxxxKGGyyOOOOOOyyGGKDDDD......DwxXXXD',
    '.DxxKGGGyOGGGgOyGGGKDDD.......DwxXXXD',
    '.DxxXKOOOOOOOOOOOOKDDDD.....GGDwxXXXD',
    '.DxXXXKOGGgOOGGgOKDDDDDXXXXXXXDwxXXXD',
    '..DXXXXKOOOOOOOOKDDDDDDDDDDDDDDxxXXXD',
    '...DXXXXKKKKKKKKDDDDD.........DxxXXXD',
    '....DXXXXXXDDDDDDDDD........GGDxXXXDD',
    '.....DXXXXDDDDDDDDD............DXXXD.',
    '......DDDDDDDDDDDD.............DXXD..',
    '.........DDDDDD.................DD...',
  ],
};

/** The key the collector holds up: lesson 1's key, small. Its shaft stands on the raised hand. */
const key: PixelSprite = {
  id: 'ai10-key',
  name: 'ai10-key',
  tags: ['scene', 'ai'],
  blurb: "A small golden key, held upright.",
  rows: [
    '.OOOO.',
    'OyyGGO',
    'Oy..gO',
    'OG..gO',
    'OGggGO',
    '.OGgO.',
    '..Gg..',
    '..GgOO',
    '..GgGO',
    '..GgOO',
    '..Gg..',
    '..OO..',
  ],
};

/** The vault's glow washing the wall round the doorway; the door and niches are stamped over its inside. */
const halo: PixelSprite = {
  id: 'ai10-halo',
  name: 'ai10-halo',
  tags: ['scene', 'ai'],
  blurb: "A ring of lamp wash on the gallery wall round the open vault.",
  rows: [
    '................................',
    '..............dddd..............',
    '..........dddddddddddd..........',
    '........dddddddddddddddd........',
    '.......ddddddd....ddddddd.......',
    '......ddddd..........ddddd......',
    '.....dddd..............dddd.....',
    '....dddd................dddd....',
    '...dddd..................dddd...',
    '...ddd....................ddd...',
    '..dddd....................dddd..',
    '..ddd......................ddd..',
    '..ddd......................ddd..',
    '..ddd......................ddd..',
    '.ddd........................ddd.',
    '.ddd........................ddd.',
    '.ddd........................ddd.',
    '.ddd........................ddd.',
    '..ddd......................ddd..',
    '..ddd......................ddd..',
    '..ddd......................ddd..',
    '..dddd....................dddd..',
    '...ddd....................ddd...',
    '...dddd..................dddd...',
    '....dddd................dddd....',
    '.....dddd..............dddd.....',
    '......ddddd..........ddddd......',
  ],
};

/** The vault's light pooled on the floor in front of the threshold. l and Y are AI_GOLD_PALETTE's ambers. */
const pool: PixelSprite = {
  id: 'ai10-pool',
  name: 'ai10-pool',
  tags: ['scene', 'ai'],
  blurb: "Gold light lying on the floor in front of the open vault.",
  rows: [
    '.llllYYYYOOOOOOOOOOOOOOOOYYYYllll.',
    '.llllYYYYYOOOOOOOOOOOOOOYYYYYllll.',
    '...llllYYYYYYYOOOOOOYYYYYYYllll...',
    '.....lllllYYYYYYYYYYYYYYlllll.....',
    '.........llllllllllllllll.........',
  ],
};

/** The brightest part of the pool, breathing over it. */
const pulse: PixelSprite = {
  id: 'ai10-pulse',
  name: 'ai10-pulse',
  tags: [],
  rows: [
    'gggggggggggggggg',
    '.gggggggggggggg.',
  ],
};

/** Wall over the gallery's display ledge: the door takes its place. */
const wall: PixelSprite = { id: 'ai10-wall', name: 'ai10-wall', tags: [], rows: ['a'.repeat(46), 'a'.repeat(46), 'a'.repeat(46)] };

const sixGemKey: PixelSprite = {
  id: 'ai10-six-gem-key',
  name: 'ai10-six-gem-key',
  tags: ['scene', 'ai'],
  blurb: "Lesson 10: a gold key whose bow is a ring of six gems, one for each category of alternatives.",
  rows: [
    '......OOOO......',
    '....OOyWWGOO....',
    '...OyyyWWGGGO...',
    '..OPPyOOOOGTTO..',
    '..OPPO....OTTO..',
    '.OyyO......OGgO.',
    '..OBBO....ONNO..',
    '..OBBgOOOOgNNO..',
    '...OggGRRGggO...',
    '....OOgRRgOO....',
    '......OGgO......',
    '......OGgOOO....',
    '......OGgGgO....',
    '......OGgOOO....',
    '......OGgGgO....',
    '......OOOOOO....',
  ],
};

/** Six niches in one row under the cornice, each sharing its right edge with the next. */
const NICHE = [1, 14, 27, 40, 53, 66].map((x) => [x, 6] as const);
/** A 12x12 emblem stands one pixel in and three down from its niche's corner. */
const at = (n: number) => [NICHE[n][0] + 1, NICHE[n][1] + 3] as const;

const VAULT = [32, 23] as const;
const POOL = [27, 47] as const;
const COLLECTOR = [7, 30] as const;
/** The key's shaft stands on the raised hand. */
const KEY = [COLLECTOR[0] + AI_COLLECTOR_HAND[0] - 2, COLLECTOR[1] + AI_COLLECTOR_HAND[1] - 12] as const;

const composed = aiCompose('ai10-opener-base', aiGallery.rows, [
  [wall, 33, 43],
  [halo, VAULT[0] - 4, VAULT[1] - 4],
  ...NICHE.map(([x, y]) => [aiNiche, x, y] as const),
  ...NICHE.map(([x, y]) => [aiPictureLight, x + 4, y - 3] as const),
  [aiHouse, ...at(0)],
  [aiFactory, ...at(1)],
  [aiGoldBars, ...at(3)],
  [aiPainting, ...at(5)],
  [vault, VAULT[0], VAULT[1]],
  [pool, POOL[0], POOL[1]],
  [aiShadow, COLLECTOR[0] + 2, COLLECTOR[1] + 27],
  [aiCollectorRaise, COLLECTOR[0], COLLECTOR[1]],
  [key, KEY[0], KEY[1]],
]);
const base: PixelSprite = { ...composed, palette: { ...composed.palette, ...AI_GOLD_PALETTE } };

export const ai10Opener: SceneArt = {
  id: 'ai10-opener',
  label: 'A collector holds a golden key up to a round vault door standing open, gold light pouring out over stacked bars, under a row of six lit niches holding a house, a factory, up and down arrows, gold bars, a crypto coin and a painting.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: aiLongShort, x: at(2)[0], y: at(2)[1] },
    { sprite: aiCryptoCoin, x: at(4)[0], y: at(4)[1] },
    { sprite: pulse, x: POOL[0] + 9, y: POOL[1], motion: { kind: 'twinkle', periodMs: 2400, min: 0.2 } },
    { sprite: aiGlintGold, x: KEY[0] - 2, y: KEY[1] - 2, motion: { kind: 'twinkle', periodMs: 1600, min: 0.35 } },
    { sprite: aiCollectorBlink, x: COLLECTOR[0] + AI_COLLECTOR_EYE[0], y: COLLECTOR[1] + AI_COLLECTOR_EYE[1] },
    { sprite: aiMoteGold, x: VAULT[0] - 3, y: VAULT[1] + 8, motion: { kind: 'rise', amp: 5, periodMs: 2700, phase: 0.1 } },
    { sprite: aiMoteGold, x: VAULT[0] + 25, y: VAULT[1] + 6, motion: { kind: 'rise', amp: 5, periodMs: 3200, phase: 0.55 } },
    { sprite: aiMoteGold, x: VAULT[0] + 12, y: VAULT[1] - 1, motion: { kind: 'rise', amp: 3, periodMs: 2900, phase: 0.8 } },
  ],
};

export const ai10Finish = aiKeepsakeGold(
  'ai10-finish',
  'A gold key whose bow is a ring set with six coloured gems, floating in a gilded glass case with a crown on top, with sparkles around it.',
  sixGemKey,
);

export const art: LessonArtSet = { opener: ai10Opener, backdrop: aiBackdrop, finish: ai10Finish };
