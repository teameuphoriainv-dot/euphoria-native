/**
 * Alternative Investments lesson 23: structuring alternative investment vehicles.
 *
 * The opener is the vault gallery (ai-kit.ts) with the heart of a fund's structure built in gold: the
 * distribution waterfall as a real one, a fountain where profits fill the top basin and spill over its
 * lip into the next and on into the widest, the way the partnership agreement sends money down a set
 * order. Above, a framed waterfall chart steps that order down in its four tiers (capital back, the
 * preferred return, the GP's catch-up, then the 80/20 split), and the collector studies the fountain through the
 * magnifier. Only small layers move: coins drop down the four streams, the pool glints, the
 * collector blinks and the lens glints. The keepsake is where the waterfall ends: a basin spilling four
 * coins to the investors' orchid pool for every one to the manager's gold cup. (The fountain sprite
 * the keepsake used to show lives on in ai-kit-c.ts, where the advanced capstone finds it.)
 */
import type { PixelSprite } from '../types';
import { aiBackdrop } from './ai-backdrop';
import {
  aiCollector,
  aiCollectorBlink,
  aiCompose,
  aiGallery,
  aiGlintGold,
  aiKeepsake,
  aiLater,
  aiLensGlare,
  aiPictureLight,
  aiShadow,
} from './ai-kit';
import { AI_COLLECTOR_EYE_FLIPPED, AI_COLLECTOR_GLARE_FLIPPED, aiFlip } from './ai-kit-a';
import type { LessonArtSet, SceneArt } from './types';

/** A gold fountain of three basins on a pedestal, each basin a pool of coins spilling into the next. */
const fountain: PixelSprite = {
  id: 'ai23-fountain',
  name: 'ai23-fountain',
  tags: ['scene', 'ai'],
  blurb: "A gold fountain of three basins: coins pool in each basin and spill over its lip into the wider one below.",
  rows: [
    '....................yy....................',
    '...................OyGO...................',
    '...................OOOO...................',
    '...................OGgO...................',
    '...................OGgO...................',
    '..................OOOOOO..................',
    '................OOyGyyGyOO................',
    '...............OyyyyyyyyyyO...............',
    '..............yOGGGGGGGGGGOy..............',
    '................OggggggggO................',
    '..............y...OOOOOO...y..............',
    '...................OGgO...................',
    '..............y....OGgO....y..............',
    '...................OGgO...................',
    '..............y....OGgO....y..............',
    '...................OGgO...................',
    '............OOyOOOOOOOOOOOOyOO............',
    '..........OOyGyyGyGyyGyGyyGyGyOO..........',
    '.........OyyyyyyyyyyyyyyyyyyyyyyO.........',
    '........yOGGGGGGGGGGGGGGGGGGGGGGOy........',
    '..........OGGGGGGGGGGGGGGGGGGGGO..........',
    '........y..OggggggggggggggggggO..y........',
    '.............OOOOOOOOOOOOOOOO.............',
    '........y..........OGgO..........y........',
    '...................OGgO...................',
    '........y..........OGgO..........y........',
    '...................OGgO...................',
    '........y..........OGgO..........y........',
    '....OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO....',
    '..OOyGyyGyGyyGyGyyGyGyyGyGyyGyGyyGyGyyOO..',
    '.OyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyO.',
    '.OGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGO.',
    '..OGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGO..',
    '...OGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGO...',
    '....OggggggggggggggggggggggggggggggggO....',
    '......OOOOOOOOOOOOOOOOOOOOOOOOOOOOOO......',
    '..................OOOOOO..................',
    '.................OGGGGGgO.................',
    '.................OGGGGGgO.................',
    '................OGGGGGGGgO................',
    '................OyyyyyyyyO................',
    '..............OGGGGGGGGGGGgO..............',
    '.............OyyyyyyyyyyyyyyO.............',
    '.............OOOOOOOOOOOOOOOO.............',
    '..........................................',
  ],
};

/** A coin dropping down the short stream from the top basin. */
const dropShort: PixelSprite = {
  id: 'ai23-drop-short',
  name: 'ai23-drop-short',
  tags: ['scene', 'ai'],
  blurb: "A gold coin falling.",
  rows: [
    'yG',
    'Gg',
    '..',
    '..',
    '..',
    '..',
    '..',
    '..',
  ],
  frames: [
    [
      'yG',
      'Gg',
      '..',
      '..',
      '..',
      '..',
      '..',
      '..',
    ],
    [
      '..',
      '..',
      'yG',
      'Gg',
      '..',
      '..',
      '..',
      '..',
    ],
    [
      '..',
      '..',
      '..',
      '..',
      'yG',
      'Gg',
      '..',
      '..',
    ],
    [
      '..',
      '..',
      '..',
      '..',
      '..',
      '..',
      'yG',
      'Gg',
    ],
  ],
  frameMs: 190,
};

/** A coin dropping down the longer stream from the middle basin. */
const dropLong: PixelSprite = {
  id: 'ai23-drop-long',
  name: 'ai23-drop-long',
  tags: ['scene', 'ai'],
  blurb: "A gold coin falling further.",
  rows: [
    'yG',
    'Gg',
    '..',
    '..',
    '..',
    '..',
    '..',
    '..',
    '..',
    '..',
  ],
  frames: [
    [
      'yG',
      'Gg',
      '..',
      '..',
      '..',
      '..',
      '..',
      '..',
      '..',
      '..',
    ],
    [
      '..',
      '..',
      'yG',
      'Gg',
      '..',
      '..',
      '..',
      '..',
      '..',
      '..',
    ],
    [
      '..',
      '..',
      '..',
      '..',
      'yG',
      'Gg',
      '..',
      '..',
      '..',
      '..',
    ],
    [
      '..',
      '..',
      '..',
      '..',
      '..',
      '..',
      'yG',
      'Gg',
      '..',
      '..',
    ],
    [
      '..',
      '..',
      '..',
      '..',
      '..',
      '..',
      '..',
      '..',
      'yG',
      'Gg',
    ],
  ],
  frameMs: 190,
};

/** A framed waterfall chart: the gold total, then the four tiers stepping down from it (teal, orchid, blue, green). */
const chart: PixelSprite = {
  id: 'ai23-chart',
  name: 'ai23-chart',
  tags: ['scene', 'ai'],
  blurb: "A framed waterfall chart: one tall gold bar, then four smaller bars stepping down from its top, one per tier.",
  rows: [
    'OOOOOOOOOOOOOOOOOOOOOO',
    'OGGGGGGGGGGGGGGGGGGGgO',
    'OGKKKKKKKKKKKKKKKKKKgO',
    'OGKyyyxTTKKKKKKKKKKKgO',
    'OGKGGGKTTKKKKKKKKKKKgO',
    'OGKGGGKTTKKKKKKKKKKKgO',
    'OGKGGGKKKxPPKKKKKKKKgO',
    'OGKGGGKKKKPPKKKKKKKKgO',
    'OGKGGGKKKKKKxBBKKKKKgO',
    'OGKGGGKKKKKKKBBKKKKKgO',
    'OGKGGGKKKKKKKKKxNNKKgO',
    'OGKGGGKKKKKKKKKKNNKKgO',
    'OGKGGGKKKKKKKKKKNNKKgO',
    'OGKXXXXXXXXXXXXXXXXKgO',
    'OGgggggggggggggggggggO',
    'OOOOOOOOOOOOOOOOOOOOOO',
  ],
};

const collector = aiFlip(aiCollector, 'ai23-collector');

const FOUNTAIN = [6, 13] as const;
const CHART = [55, 8] as const;
const COLLECTOR = [58, 30] as const;

const base = aiCompose('ai23-opener-base', aiGallery.rows, [
  [chart, CHART[0], CHART[1]],
  [aiPictureLight, CHART[0] + 8, CHART[1] - 3],
  [fountain, FOUNTAIN[0], FOUNTAIN[1]],
  [aiShadow, COLLECTOR[0] + 3, COLLECTOR[1] + 27],
  [collector, COLLECTOR[0], COLLECTOR[1]],
]);

export const ai23Opener: SceneArt = {
  id: 'ai23-opener',
  label: 'A collector with a magnifying glass studies a gold fountain, coins spilling from the top basin into the next and on into the widest, under a framed chart stepping down in four tiers.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: dropShort, x: FOUNTAIN[0] + 13, y: FOUNTAIN[1] + 8 },
    { sprite: aiLater(dropShort, 'ai23-drop-short-later', 2, 210), x: FOUNTAIN[0] + 26, y: FOUNTAIN[1] + 8 },
    { sprite: dropLong, x: FOUNTAIN[0] + 7, y: FOUNTAIN[1] + 19 },
    { sprite: aiLater(dropLong, 'ai23-drop-long-later', 3, 200), x: FOUNTAIN[0] + 33, y: FOUNTAIN[1] + 19 },
    { sprite: aiGlintGold, x: FOUNTAIN[0] + 28, y: FOUNTAIN[1] + 26, motion: { kind: 'twinkle', periodMs: 1900, min: 0.35 } },
    { sprite: aiCollectorBlink, x: COLLECTOR[0] + AI_COLLECTOR_EYE_FLIPPED[0], y: COLLECTOR[1] + AI_COLLECTOR_EYE_FLIPPED[1] },
    { sprite: aiLensGlare, x: COLLECTOR[0] + AI_COLLECTOR_GLARE_FLIPPED[0], y: COLLECTOR[1] + AI_COLLECTOR_GLARE_FLIPPED[1], motion: { kind: 'twinkle', periodMs: 1500, min: 0.3 } },
  ],
};

/** The keepsake emblem: the end of the waterfall, the 80/20 split. Four coins go to the investors' wide orchid pool for every one that reaches the manager's small gold cup. */
const emblemSplit: PixelSprite = {
  id: 'ai23-emblem-split',
  name: 'ai23-emblem-split',
  tags: ['scene', 'ai'],
  rows: [
    '...OyyyyyyO...',
    '....OGGGGO....',
    '.yG..OggO.....',
    '.Gg.......yG..',
    '..........Gg..',
    '..yG..........',
    '..Gg..........',
    '..............',
    'EqqqqqqqE.OyyO',
    'EPGPPGPPE.OGgO',
    '.EPPPPPE...Og.',
    '..EEEEE...OOOO',
  ],
};

export const ai23Finish = aiKeepsake(
  'ai23-finish',
  'A gold basin spilling coins down both sides, four into a wide orchid pool for the investors and one into a small gold cup for the manager, floating in a glass display case on a marble plinth, with sparkles around it.',
  emblemSplit,
);

export const art: LessonArtSet = { opener: ai23Opener, backdrop: aiBackdrop, finish: ai23Finish };
