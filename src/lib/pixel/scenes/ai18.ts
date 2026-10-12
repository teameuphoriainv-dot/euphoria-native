/**
 * Alternative Investments lesson 18: funds of funds and multi-strategy funds.
 *
 * The opener is the vault gallery (ai-kit.ts) with the lesson's structure made into an object: a
 * stack of nested boxes on the floor, a gold box of coins inside a teal box inside an orchid one,
 * because a fund of funds is a fund that holds funds. A coin lifts off the rim of each layer, the
 * double fee the lesson warns about, while the collector studies the stack through the magnifier.
 * On the wall a framed chart draws the same thing: one investor, one fund, four funds under it. Only
 * small layers move: the two coins rise, the gold glints, the collector blinks, the lens glints and
 * a mote drifts up. The keepsake is a new emblem: the nested boxes.
 */
import type { PixelSprite } from '../types';
import { aiBackdrop } from './ai-backdrop';
import {
  AI_COLLECTOR_EYE,
  AI_COLLECTOR_GLARE,
  aiCollector,
  aiCollectorBlink,
  aiCompose,
  aiGallery,
  aiGlintGold,
  aiKeepsake,
  aiLensGlare,
  aiMoteGold,
  aiPictureLight,
  aiShadow,
} from './ai-kit';
import { aiCoin } from './ai-kit-b';
import { aiLedgeCover } from './ai-kit-c';
import type { LessonArtSet, SceneArt } from './types';

/** Three open boxes, each standing in the next: gold coins in a gold box, in a teal box, in an orchid one. */
const stack: PixelSprite = {
  id: 'ai18-stack',
  name: 'ai18-stack',
  tags: ['scene', 'ai'],
  blurb: "Nested boxes: a gold box of coins rising out of a teal box rising out of an orchid one, brass plates on the front.",
  rows: [
    '.............GyyG.............',
    '............GyGGyG............',
    '...........OGGyGGGO...........',
    '..........OGyGGOGyGO..........',
    '..........OOGGOGGOGO..........',
    '..........OyyyyyyyyO..........',
    '..........OGGGGGGGgO..........',
    '..........OGGGGGGGgO..........',
    '......ttttOGGGGGGGgOtttt......',
    '.....tmKKKOGGGGGGGgOKKKmt.....',
    '.....tmKKKOGGGGGGGgOKKKmt.....',
    '.....tmmmmmmmmmmmmmmmmmmt.....',
    '.....tTTTTTTTTTTTTTTTTTtt.....',
    '.....tTTTTTTOOOOOOTTTTTtt.....',
    '.....tTTTTTTOyGGgOTTTTTtt.....',
    '.EEEEtTTTTTTOOOOOOTTTTTttEEEE.',
    'EqKKKtTTTTTTTTTTTTTTTTTttKKKqE',
    'EqKKKtTTTTTTTTTTTTTTTTTttKKKqE',
    'EqqqqqqqqqqqqqqqqqqqqqqqqqqqqE',
    'EGGPPPPPPPPPPPPPPPPPPPPPPPPGGE',
    'EPPPPPPPPPPPPPPPPPPPPPPPPPPPpE',
    'EPPPPPPPPPPPPPPPPPPPPPPPPPPPpE',
    'EPPPPPPPPPPOOOOOOOOPPPPPPPPPpE',
    'EPPPPPPPPPPOyyGGGgOPPPPPPPPPpE',
    'EPPPPPPPPPPOOOOOOOOPPPPPPPPPpE',
    'EPPPPPPPPPPPPPPPPPPPPPPPPPPPpE',
    'EGGPPPPPPPPPPPPPPPPPPPPPPPPGGE',
    'EppppppppppppppppppppppppppppE',
    'EEEEEEEEEEEEEEEEEEEEEEEEEEEEEE',
  ],
};

/** The lesson's architecture, framed: an investor, the fund of funds, and four funds it holds. */
const chart: PixelSprite = {
  id: 'ai18-chart',
  name: 'ai18-chart',
  tags: ['scene', 'ai'],
  blurb: "A framed diagram: a small figure over one orchid fund, branching down to four coloured funds.",
  rows: [
    'OOOOOOOOOOOOOOOOOOOOOOOO',
    'OyGGGGGGGGGGGGGGGGGGGGgO',
    'OGKKKKKKKKKKKKKKKKKKKKgO',
    'OGKKKKKKKKKqqKKKKKKKKKgO',
    'OGKKKKKKKKqPPqKKKKKKKKgO',
    'OGKKKKKKKKKxxKKKKKKKKKgO',
    'OGKKKKKKKqqqqqqKKKKKKKgO',
    'OGKKKKKKKPPPPPPKKKKKKKgO',
    'OGKKKKKKKppppppKKKKKKKgO',
    'OGKKKKKKKKKxxKKKKKKKKKgO',
    'OGKKxxxxxxxxxxxxxxxxKKgO',
    'OGKKxKKKKxKKKKxKKKKxKKgO',
    'OGKTTTKKGGGKKNNNKKBBBKgO',
    'OGKtttKKgggKKnnnKKbbbKgO',
    'OGKKKKKKKKKKKKKKKKKKKKgO',
    'OggggggggggggggggggggggO',
    'OOOOOOOOOOOOOOOOOOOOOOOO',
  ],
};

/** The stack's shadow on the floor. */
const floorShadow: PixelSprite = { id: 'ai18-floor-shadow', name: 'ai18-floor-shadow', tags: [], palette: { z: '#0F0C14' }, rows: ['z'.repeat(32)] };

const nestedBoxes: PixelSprite = {
  id: 'ai18-nested-boxes',
  name: 'ai18-nested-boxes',
  tags: ['scene', 'ai'],
  blurb: "Lesson 18: nested boxes, a gold box of coins inside a teal box inside an orchid one.",
  rows: [
    '.....GyyG.....',
    '....OGyGyO....',
    '....OyGGGO....',
    '....OyyyyO....',
    '..ttOGGGGOtt..',
    '..tKOggggOKt..',
    '..tmmmmmmmmt..',
    'EEtTTTTTTTTtEE',
    'EKtTTTTTTTTtKE',
    'EqqqqqqqqqqqqE',
    'EPPPOyyGgOPPpE',
    'EPPPOOOOOOPPpE',
    'EppppppppppppE',
    'EEEEEEEEEEEEEE',
  ],
};

const STACK = [31, 29] as const;
const CHART = [53, 8] as const;
const COLLECTOR = [5, 30] as const;

const base = aiCompose('ai18-opener-base', aiGallery.rows, [
  aiLedgeCover,
  [chart, CHART[0], CHART[1]],
  [aiPictureLight, CHART[0] + 9, CHART[1] - 3],
  [floorShadow, STACK[0] - 1, STACK[1] + 29],
  [stack, STACK[0], STACK[1]],
  [aiShadow, COLLECTOR[0] + 2, COLLECTOR[1] + 27],
  [aiCollector, COLLECTOR[0], COLLECTOR[1]],
]);

export const ai18Opener: SceneArt = {
  id: 'ai18-opener',
  label: 'A collector with a magnifying glass studies a stack of nested boxes, a gold box of coins inside a teal box inside an orchid one, a coin rising off each, under a framed chart of one fund holding four.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: aiCoin, x: STACK[0] + 2, y: STACK[1] + 13, motion: { kind: 'rise', amp: 5, periodMs: 2600, phase: 0.1 } },
    { sprite: aiCoin, x: STACK[0] + 20, y: STACK[1] + 6, motion: { kind: 'rise', amp: 5, periodMs: 3000, phase: 0.6 } },
    { sprite: aiGlintGold, x: STACK[0] + 11, y: STACK[1] - 3, motion: { kind: 'twinkle', periodMs: 1800, min: 0.35 } },
    { sprite: aiCollectorBlink, x: COLLECTOR[0] + AI_COLLECTOR_EYE[0], y: COLLECTOR[1] + AI_COLLECTOR_EYE[1] },
    { sprite: aiLensGlare, x: COLLECTOR[0] + AI_COLLECTOR_GLARE[0], y: COLLECTOR[1] + AI_COLLECTOR_GLARE[1], motion: { kind: 'twinkle', periodMs: 1500, min: 0.3 } },
    { sprite: aiMoteGold, x: 66, y: 32, motion: { kind: 'rise', amp: 5, periodMs: 3100, phase: 0.35 } },
  ],
};

export const ai18Finish = aiKeepsake(
  'ai18-finish',
  'Nested boxes, a gold box of coins inside a teal box inside an orchid one, floating in a glass display case on a marble plinth, with sparkles around it.',
  nestedBoxes,
);

export const art: LessonArtSet = { opener: ai18Opener, backdrop: aiBackdrop, finish: ai18Finish };
