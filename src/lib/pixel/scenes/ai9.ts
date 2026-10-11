/**
 * Alternative Investments lesson 9: portfolio integration and alternative allocation.
 *
 * The opener is the vault gallery (ai-kit.ts) with the portfolio as one big framed pie: stocks and
 * bonds in greys, the alternatives in the colours of their emblems (real estate orchid, private
 * equity blue, hedge funds green, crypto teal) and one gap, which the collector, turned to face it,
 * holds up the gold slice to fill. The kit's allocation chart hangs on the right as the target.
 * Only small layers move: the gap's outline blinks, the gold slice glints, the collector blinks and
 * motes rise. The keepsake is a new emblem: a pie with its gold slice pulled out.
 */
import type { PixelSprite } from '../types';
import { aiBackdrop } from './ai-backdrop';
import {
  aiAllocationChart,
  aiCollectorBlink,
  aiCompose,
  aiGallery,
  aiGlintGold,
  aiKeepsake,
  aiMoteGold,
  aiPictureLight,
  aiShadow,
} from './ai-kit';
import { AI_COLLECTOR_EYE_FLIPPED, AI_COLLECTOR_HAND, aiCollectorRaise, aiFlip } from './ai-kit-a';
import type { LessonArtSet, SceneArt } from './types';

const portfolio: PixelSprite = {
  id: 'ai9-portfolio',
  name: 'ai9-portfolio',
  tags: ['scene', 'ai'],
  blurb: "The portfolio as a framed pie: greys for stocks and bonds, emblem colours for the alternatives, a gap.",
  rows: [
    'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
    'OyGGGGGGGGGGGGGGGGGGGGGGGGGGgO',
    'OGkkkkkkkkkkkkkkkkkkkkkkkkkkgO',
    'OGkkkkkkkkkkkbbbbkkkkkkkkkkkgO',
    'OGkkkkkkkkppbbbbbbbnkkkkkkkkgO',
    'OGkkkkkkpppPBBBBBBNnnnkkkkkkgO',
    'OGkkkkkppPPPPBBBBBNNNnnkkkkkgO',
    'OGkkkkppPPPPPBBBBBNNNNnnkkkkgO',
    'OGkkkppPPPPPPBBBBNNNNNNttkkkgO',
    'OGkkkpPPPPPPPPBBBNNNNNTTtkkkgO',
    'OGkkDDXPPPPPPPBBBNNNTTTTttkkgO',
    'OGkkDXXXXPPPPPBBNNNTTTTTTtkkgO',
    'OGkkDXXXXXXPPPBBNNTTTTTTTtkkgO',
    'OGkDDXXXXXXXPPPBNTTTTTTTkkkkgO',
    'OGkDDXXXXXXXXXPNTTkkkkkkkkkkgO',
    'OGkDDXXXXXXXXXxxkkkkkkkkkkkkgO',
    'OGkDDXXXXXXxxxxxxkkkkkkkkkkkgO',
    'OGkkDXXXxxxxxxxxxxkkkkkkkkkkgO',
    'OGkkDxxxxxxxxxxxxxxkkkkkkkkkgO',
    'OGkkXXxxxxxxxxxxxxxxkkkkkkkkgO',
    'OGkkkXxxxxxxxxxxxxxxxkkkkkkkgO',
    'OGkkkXXxxxxxxxxxxxxxxxkkkkkkgO',
    'OGkkkkXXxxxxxxxxxxxxxxXkkkkkgO',
    'OGkkkkkXXxxxxxxxxxxxxXXkkkkkgO',
    'OGkkkkkkXXXxxxxxxxxXXXkkkkkkgO',
    'OGkkkkkkkkXXXXXXXXXXkkkkkkkkgO',
    'OGkkkkkkkkkkkXXXXkkkkkkkkkkkgO',
    'OGkkkkkkkkkkkkkkkkkkkkkkkkkkgO',
    'OGgggggggggggggggggggggggggggO',
    'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
  ],
};

const gap: PixelSprite = {
  id: 'ai9-gap',
  name: 'ai9-gap',
  tags: ['scene', 'ai'],
  blurb: "The gap's dotted gold outline, blinking where the slice belongs.",
  rows: [
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '.........................y....',
    '..................y.......y...',
    '.........................y....',
    '..........................y...',
    '.........................y....',
    '..............................',
    '.........................y....',
    '........................y.....',
    '.......................y......',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
  ],
};

const slice: PixelSprite = {
  id: 'ai9-slice',
  name: 'ai9-slice',
  tags: ['scene', 'ai'],
  blurb: "The gold slice the collector holds up, its point toward the pie.",
  rows: [
    '.OO....',
    '.OyOO..',
    '.OyGGO.',
    'OGyGGGO',
    'OgGGGGO',
    'OggGGgO',
    '.OOOOO.',
  ],
};

const pieEmblem: PixelSprite = {
  id: 'ai9-pie',
  name: 'ai9-pie',
  tags: ['scene', 'ai'],
  blurb: "Lesson 9: a portfolio pie with its gold slice pulled out.",
  rows: [
    '................',
    '.....OOO........',
    '....OOGG.X......',
    '...OGGGG.XXXX...',
    '..OGGGGG.xxxXX..',
    '...GGGyy.xxxxXX.',
    '...n.yyy.xxxxxX.',
    '...nNN.y.xxxxxX.',
    '..nnNNNN.xxxxxXX',
    '..nnNNNNPBxxxxXX',
    '...nNPPPBBBxxxX.',
    '...pPPPPBBBBxxX.',
    '...ppPPPBBBBBXX.',
    '....ppPBBBBBbb..',
    '.....ppbbbbbb...',
    '........bb......',
  ],
};

const collector = aiFlip(aiCollectorRaise, 'ai9-collector');

const PIE = [5, 9] as const;
const COLLECTOR = [56, 30] as const;
/** The turned collector's raised hand. */
const HAND = [COLLECTOR[0] + 19 - AI_COLLECTOR_HAND[0], COLLECTOR[1] + AI_COLLECTOR_HAND[1]] as const;

const base = aiCompose('ai9-opener-base', aiGallery.rows, [
  [portfolio, PIE[0], PIE[1]],
  [aiPictureLight, PIE[0] + 12, PIE[1] - 3],
  [aiAllocationChart, 63, 9],
  [aiShadow, COLLECTOR[0] + 3, COLLECTOR[1] + 27],
  [collector, COLLECTOR[0], COLLECTOR[1]],
  [slice, HAND[0] - 5, HAND[1] - 7],
]);

export const ai9Opener: SceneArt = {
  id: 'ai9-opener',
  label: 'A collector holds up a gold slice to fill the gap in a big portfolio pie chart of stocks, bonds and alternatives, beside a smaller allocation chart.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: gap, x: PIE[0], y: PIE[1], motion: { kind: 'twinkle', periodMs: 1600, min: 0.15 } },
    { sprite: aiGlintGold, x: HAND[0] - 8, y: HAND[1] - 10, motion: { kind: 'twinkle', periodMs: 1700, min: 0.4 } },
    { sprite: aiCollectorBlink, x: COLLECTOR[0] + AI_COLLECTOR_EYE_FLIPPED[0], y: COLLECTOR[1] + AI_COLLECTOR_EYE_FLIPPED[1] },
    { sprite: aiMoteGold, x: 41, y: 30, motion: { kind: 'rise', amp: 5, periodMs: 2800, phase: 0.2 } },
    { sprite: aiMoteGold, x: 50, y: 18, motion: { kind: 'rise', amp: 5, periodMs: 3300, phase: 0.65 } },
  ],
};

export const ai9Finish = aiKeepsake(
  'ai9-finish',
  'A pie chart with one gold slice pulled out floating in a glass display case on a marble plinth, with sparkles around it.',
  pieEmblem,
);

export const art: LessonArtSet = { opener: ai9Opener, backdrop: aiBackdrop, finish: ai9Finish };
