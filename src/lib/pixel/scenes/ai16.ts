/**
 * Alternative Investments lesson 16: SPACs, the blank check companies.
 *
 * The opener is the vault gallery (ai-kit.ts) with the lesson's name made literal: a blank cheque
 * framed on the wall, signed but with no payee and an empty amount box, because a SPAC raises the
 * money before it knows what it will buy. Beside it a lit niche stands empty with a question mark
 * where the target company will go, and on the ledge under it the money waits in trust, bricks of
 * notes in a glass box, while the collector studies them through the magnifier. Only small layers
 * move: the question mark pulses, the frame and the glass glint, the collector blinks, the lens
 * glints and motes rise. The keepsake is a new emblem: the blank cheque.
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
  aiGlint,
  aiGlintGold,
  aiKeepsake,
  aiLensGlare,
  aiMoteGold,
  aiNiche,
  aiPictureLight,
  aiShadow,
} from './ai-kit';
import type { LessonArtSet, SceneArt } from './types';

/** A framed cheque on orchid paper: a bank mark, a blank payee line, an empty amount box, a signature. */
const cheque: PixelSprite = {
  id: 'ai16-cheque',
  name: 'ai16-cheque',
  tags: ['scene', 'ai'],
  blurb: "A framed blank cheque: signed, with an empty payee line and an empty amount box.",
  rows: [
    'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
    'OyGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGO',
    'OGQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQgO',
    'OGQQOOQQQQQQQQQQQQQQQQQQQQQQQppppppQgO',
    'OGQOyGOQPPPQPPPQPPPQQQQQQQQQQQQQQQQQgO',
    'OGQOGgOQQQQQQQQQQQQQQQQQQQQQQQQQQQQQgO',
    'OGQQOOQQQQQQQQQQQQQQQQQQQQQpQQppppppgO',
    'OGQQQQQQQQQQQQQQQQQQQQQQQQpppQpwwwwpgO',
    'OGQPPPQPPPQQQQQQQQQQQQQQQQpQQQpwwwwpgO',
    'OGQQQQQQQQQqqqqqqqqqqqqqqQpppQpwwwwpgO',
    'OGQQQQQQQQQQQQQQQQQQQQQQQQQQpQpwwwwpgO',
    'OGQQQQQQQQQQQQQQQbQQQQQbQQpppQpwwwwpgO',
    'OGQqqqqqqqqqqQQQbQbQbbQbQQQpQQppppppgO',
    'OGQQQQQQQQQQQQQQQQQbQQbQbQQQQQQQQQQQgO',
    'OGQppQppQppQppQppQppQppQppQQQQQQQQQQgO',
    'OGQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQgO',
    'OGgggggggggggggggggggggggggggggggggggO',
    'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
  ],
};

/** The trust: bricks of notes in a glass box on a gold foot. */
const trust: PixelSprite = {
  id: 'ai16-trust',
  name: 'ai16-trust',
  tags: ['scene', 'ai'],
  blurb: "A small glass box holding three bricks of banknotes.",
  palette: { Z: '#0F1C1E' },
  rows: [
    'DDDDDDDDDDDDDD',
    'DxZZZZZZZZZZZD',
    'DxZZnNNNnZZZZD',
    'DxZZnmmmnZZZZD',
    'DxZZnNNNnZZZZD',
    'DxnNNNnnNNNnZD',
    'DxnmmmnnmmmnZD',
    'DxnNNNnnNNNnZD',
    'DDDDDDDDDDDDDD',
    '.OOOOOOOOOOOO.',
  ],
};

/** The target nobody has named yet, pulsing in the empty niche. */
const question: PixelSprite = {
  id: 'ai16-question',
  name: 'ai16-question',
  tags: [],
  rows: [
    '.GGG.',
    'Gy..G',
    '....G',
    '..GG.',
    '..G..',
    '.....',
    '..G..',
  ],
};

const blankCheque: PixelSprite = {
  id: 'ai16-blank-cheque',
  name: 'ai16-blank-cheque',
  tags: ['scene', 'ai'],
  blurb: "Lesson 16: a blank cheque, signed, its amount box empty.",
  rows: [
    'EEEEEEEEEEEEEEEE',
    'EQQQQQQQQQQQQQQE',
    'EQyGQPPPPQQQQQQE',
    'EQQQQQQQQQpppppE',
    'EQPPqqqqqQpwwwpE',
    'EQQQQQQQQQpppppE',
    'EQqqqqQQQQQQQQQE',
    'EQQQQQQQQQbQbbQE',
    'EQpQppQpQQQbQQQE',
    'EEEEEEEEEEEEEEEE',
  ],
};

const CHEQUE = [3, 9] as const;
const NICHE = [60, 12] as const;
const TRUST = [52, 33] as const;
const COLLECTOR = [27, 30] as const;

const base = aiCompose('ai16-opener-base', aiGallery.rows, [
  [cheque, CHEQUE[0], CHEQUE[1]],
  [aiPictureLight, CHEQUE[0] + 16, CHEQUE[1] - 3],
  [aiNiche, NICHE[0], NICHE[1]],
  [aiPictureLight, NICHE[0] + 4, NICHE[1] - 3],
  [trust, TRUST[0], TRUST[1]],
  [aiShadow, COLLECTOR[0] + 2, COLLECTOR[1] + 27],
  [aiCollector, COLLECTOR[0], COLLECTOR[1]],
]);

export const ai16Opener: SceneArt = {
  id: 'ai16-opener',
  label: 'A collector studies a glass box of banknotes held in trust beside an empty lit niche with a question mark, under a framed blank cheque with an empty amount box.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: question, x: NICHE[0] + 5, y: NICHE[1] + 5, motion: { kind: 'twinkle', periodMs: 1700, min: 0.2 } },
    { sprite: aiGlintGold, x: CHEQUE[0] + 33, y: CHEQUE[1] - 2, motion: { kind: 'twinkle', periodMs: 2100, min: 0.35 } },
    { sprite: aiGlint, x: TRUST[0] + 9, y: TRUST[1] - 2, motion: { kind: 'twinkle', periodMs: 1900, min: 0.3, phase: 0.5 } },
    { sprite: aiCollectorBlink, x: COLLECTOR[0] + AI_COLLECTOR_EYE[0], y: COLLECTOR[1] + AI_COLLECTOR_EYE[1] },
    { sprite: aiLensGlare, x: COLLECTOR[0] + AI_COLLECTOR_GLARE[0], y: COLLECTOR[1] + AI_COLLECTOR_GLARE[1], motion: { kind: 'twinkle', periodMs: 1500, min: 0.3 } },
    { sprite: aiMoteGold, x: 49, y: 26, motion: { kind: 'rise', amp: 5, periodMs: 2800, phase: 0.2 } },
    { sprite: aiMoteGold, x: 76, y: 30, motion: { kind: 'rise', amp: 5, periodMs: 3300, phase: 0.65 } },
  ],
};

export const ai16Finish = aiKeepsake(
  'ai16-finish',
  'A signed blank cheque with an empty amount box floating in a glass display case on a marble plinth, with sparkles around it.',
  blankCheque,
);

export const art: LessonArtSet = { opener: ai16Opener, backdrop: aiBackdrop, finish: ai16Finish };
