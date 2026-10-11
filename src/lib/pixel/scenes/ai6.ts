/**
 * Alternative Investments lesson 6: hedge fund strategies.
 *
 * The opener is the vault gallery (ai-kit.ts) turned into a trading wall: a long screen whose line
 * climbs and a short screen whose line falls, a ticker running under both, and the kit's long and
 * short arrows lit in a niche, because a long/short fund holds one and sells the other. The
 * collector, turned to face the screens, studies them through the magnifier. Only small layers move:
 * the arrows pump apart, the ticker scrolls, both lines' newest points blink, the collector blinks
 * and the lens glints. The keepsake is the kit's long and short arrows in the glass case.
 */
import type { PixelSprite } from '../types';
import { aiBackdrop } from './ai-backdrop';
import {
  aiCollector,
  aiCollectorBlink,
  aiCompose,
  aiGallery,
  aiKeepsake,
  aiLensGlare,
  aiLongShort,
  aiNiche,
  aiPictureLight,
  aiShadow,
} from './ai-kit';
import { AI_COLLECTOR_EYE_FLIPPED, AI_COLLECTOR_GLARE_FLIPPED, aiFlip } from './ai-kit-a';
import type { LessonArtSet, SceneArt } from './types';

const longScreen: PixelSprite = {
  id: 'ai6-long-screen',
  name: 'ai6-long-screen',
  tags: ['scene', 'ai'],
  blurb: "The long book: a screen whose green line climbs, an up mark in its corner.",
  rows: [
    'DDDDDDDDDDDDDDDDDDDDDDD',
    'DkkkkkkkkkkkkkkkkkkkkkD',
    'DkKKKKKKKKKKKKKKKKKKKKD',
    'DkKKNKKKKKKKKKKKKKKKKKD',
    'DkKNNNKDKKDKKDKKDKKDNKD',
    'DkKKKKKKKKKKKKKKKKKNnKD',
    'DkKKKKKKKKKKKKKKKKKNKKD',
    'DkKKKKKKKKKKKKKNKKNnKKD',
    'DkKKKKKKKKKKKKNnNNnKKKD',
    'DkKKKKKKKKKKKKNKnnKKKKD',
    'DkKKKKKKKKNKKNnKKKKKKKD',
    'DkKKKKKKKNnNNnKKKKKKKKD',
    'DkKKKKKKKNKnnKKKKKKKKKD',
    'DkKKKNKKNnKKKKKKKKKKKKD',
    'DkKNNnNNnKKKKKKKKKKKKKD',
    'DkNnnKnnKKKKKKKKKKKKKKD',
    'DknKKKKKKKKKKKKKKKKKKKD',
    'DkKKKKKKKKKKKKKKKKKKKKD',
    'DDDDDDDDDDDDDDDDDDDDDDD',
  ],
};

const shortScreen: PixelSprite = {
  id: 'ai6-short-screen',
  name: 'ai6-short-screen',
  tags: ['scene', 'ai'],
  blurb: "The short book: a screen whose red line falls, a down mark in its corner.",
  rows: [
    'DDDDDDDDDDDDDDDDDDDDDDD',
    'DkkkkkkkkkkkkkkkkkkkkkD',
    'DkKKKKKKKKKKKKKKKKKKKKD',
    'DkKRRRKKKKKKKKKKKKKKKKD',
    'DkKKRKKDKKDKKDKKDKKDKKD',
    'DkKKKKKKKKKKKKKKKKKKKKD',
    'DkKKKKKKKKKKKKKKKKKKKKD',
    'DkRKKKKKKKKKKKKKKKKKKKD',
    'DkrRRKRRKKKKKKKKKKKKKKD',
    'DkKrrRrrRKKKKKKKKKKKKKD',
    'DkKKKrKKrRKRRKKKKKKKKKD',
    'DkKKKKKKKrRrrRKKKKKKKKD',
    'DkKKKKKKKKrKKrRKRRKKKKD',
    'DkKKKKKKKKKKKKrRrrRKKKD',
    'DkKKKKKKKKKKKKKrKKrRKKD',
    'DkKKKKKKKKKKKKKKKKKRKKD',
    'DkKKKKKKKKKKKKKKKKKrRKD',
    'DkKKKKKKKKKKKKKKKKKKrKD',
    'DDDDDDDDDDDDDDDDDDDDDDD',
  ],
};

const ticker: PixelSprite = {
  id: 'ai6-ticker',
  name: 'ai6-ticker',
  tags: ['scene', 'ai'],
  blurb: "The ticker board under the screens.",
  rows: [
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    'DKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKD',
    'DKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKD',
    'DKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKD',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
  ],
};

const tape: PixelSprite = {
  id: 'ai6-tape',
  name: 'ai6-tape',
  tags: ['scene', 'ai'],
  blurb: "Green and red ticks scrolling along the ticker.",
  rows: [
    'NN.R..NNN.RR..N.N..RRR.NN..R.NNN..R.N..',
  ],
};

const newestUp: PixelSprite = { id: 'ai6-newest-up', name: 'ai6-newest-up', tags: [], rows: ['m'] };
const newestDown: PixelSprite = { id: 'ai6-newest-down', name: 'ai6-newest-down', tags: [], rows: ['s'] };
const collector = aiFlip(aiCollector, 'ai6-collector');

const LONG = [3, 8] as const;
const SHORT = [28, 8] as const;
const NICHE = [61, 9] as const;
const COLLECTOR = [55, 30] as const;

const base = aiCompose('ai6-opener-base', aiGallery.rows, [
  [longScreen, LONG[0], LONG[1]],
  [shortScreen, SHORT[0], SHORT[1]],
  [ticker, 3, 29],
  [aiNiche, NICHE[0], NICHE[1]],
  [aiPictureLight, NICHE[0] + 4, NICHE[1] - 3],
  [aiShadow, COLLECTOR[0] + 3, COLLECTOR[1] + 27],
  [collector, COLLECTOR[0], COLLECTOR[1]],
]);

export const ai6Opener: SceneArt = {
  id: 'ai6-opener',
  label: 'A collector with a magnifier studies two trading screens, one line climbing and one falling, over a scrolling ticker, beside up and down arrows in a lit niche.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: aiLongShort, x: NICHE[0] + 1, y: NICHE[1] + 3 },
    { sprite: tape, x: 7, y: 31, motion: { kind: 'drift', amp: 2, periodMs: 3000 } },
    { sprite: newestUp, x: LONG[0] + 20, y: LONG[1] + 4, motion: { kind: 'twinkle', periodMs: 1200, min: 0.2 } },
    { sprite: newestDown, x: SHORT[0] + 20, y: SHORT[1] + 16, motion: { kind: 'twinkle', periodMs: 1200, min: 0.2, phase: 0.5 } },
    { sprite: aiCollectorBlink, x: COLLECTOR[0] + AI_COLLECTOR_EYE_FLIPPED[0], y: COLLECTOR[1] + AI_COLLECTOR_EYE_FLIPPED[1] },
    { sprite: aiLensGlare, x: COLLECTOR[0] + AI_COLLECTOR_GLARE_FLIPPED[0], y: COLLECTOR[1] + AI_COLLECTOR_GLARE_FLIPPED[1], motion: { kind: 'twinkle', periodMs: 1500, min: 0.3 } },
  ],
};

export const ai6Finish = aiKeepsake(
  'ai6-finish',
  'A green arrow pointing up and a red arrow pointing down, pumping apart in a glass display case on a marble plinth.',
  aiLongShort,
);

export const art: LessonArtSet = { opener: ai6Opener, backdrop: aiBackdrop, finish: ai6Finish };
