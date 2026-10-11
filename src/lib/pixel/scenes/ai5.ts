/**
 * Alternative Investments lesson 5: private equity and venture capital.
 *
 * The opener is the vault gallery (ai-kit.ts) with the lesson's J-curve framed on the wall: a fund's
 * return dips below zero in its first years, then climbs. On the ledge under it stand the two kinds
 * of deal, a model rocket for venture capital and the kit's factory for a buyout, and the collector
 * points up at the curve. Only small layers move: the curve's arrowhead, the factory's windows and
 * the rocket's nose glint, the collector blinks, motes rise. The keepsake is the kit's factory in
 * the glass case.
 */
import type { PixelSprite } from '../types';
import { aiBackdrop } from './ai-backdrop';
import {
  AI_COLLECTOR_EYE,
  aiCollectorBlink,
  aiCompose,
  aiFactory,
  aiGallery,
  aiKeepsake,
  aiMoteGold,
  aiShadow,
} from './ai-kit';
import { AI_COLLECTOR_HAND, aiCollectorRaise } from './ai-kit-a';
import type { LessonArtSet, SceneArt } from './types';

const jCurve: PixelSprite = {
  id: 'ai5-j-curve',
  name: 'ai5-j-curve',
  tags: ['scene', 'ai'],
  blurb: "A framed chart of the J-curve: below zero (red) for the early years, then a climb (green).",
  rows: [
    'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
    'OyGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGgO',
    'OGKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKgO',
    'OGKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKNNKKKgO',
    'OGKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKNNNNnnKKKgO',
    'OGKKKKKKKKKKKKKKKKKKKKKKKKKKKNNNNnnnnKKKKKgO',
    'OGKKKKKKKKKKKKKKKKKKKKKKKKNNNnnnnKKKKKKKKKgO',
    'OGKKKKKKKKKKKKKKKKKKKKKKNNnnnKKKKKKKKKKKKKgO',
    'OGRDDDDDDDDDDDDDDDDDDDDNnnDDDDDDDDDDDDDDDKgO',
    'OGrRRKDKKKKKKKDKKKKKKRRnKKKKKKDKKKKKKKDKKKgO',
    'OGKrrRKKKKKKKKKKKKKKRrrKKKKKKKKKKKKKKKKKKKgO',
    'OGKKKrRRKKKKKKKKKKRRrKKKKKKKKKKKKKKKKKKKKKgO',
    'OGKKKKrrRRRKKKKRRRrrKKKKKKKKKKKKKKKKKKKKKKgO',
    'OGKKKKKKrrrRRRRrrrKKKKKKKKKKKKKKKKKKKKKKKKgO',
    'OGKKKKKKKKKrrrrKKKKKKKKKKKKKKKKKKKKKKKKKKKgO',
    'OGKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKgO',
    'OGKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKgO',
    'OGKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKgO',
    'OGKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKgO',
    'OGgggggggggggggggggggggggggggggggggggggggggO',
    'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
  ],
};

const arrowhead: PixelSprite = {
  id: 'ai5-arrowhead',
  name: 'ai5-arrowhead',
  tags: ['scene', 'ai'],
  blurb: "The J-curve's arrowhead, pointing up and right.",
  rows: [
    'NNN',
    '.mN',
    'N.N',
  ],
};

const rocket: PixelSprite = {
  id: 'ai5-rocket',
  name: 'ai5-rocket',
  tags: ['scene', 'ai'],
  blurb: "A model rocket on its stand: the startup a venture fund backs.",
  rows: [
    '...w...',
    '..wwx..',
    '..wBx..',
    '..wBx..',
    '..wxx..',
    '..wxX..',
    '.rwxXr.',
    'rrwxXrr',
    'r.DDD.r',
    '.......',
    'OGGGGgO',
    '.O...O.',
  ],
};

/** One pixel past the raised hand: the collector points instead of holding something up. */
const finger: PixelSprite = { id: 'ai5-finger', name: 'ai5-finger', tags: [], rows: ['S'] };
const windows: PixelSprite = { id: 'ai5-windows', name: 'ai5-windows', tags: [], rows: ['yy.yy.yy', 'yy.yy.yy'] };
const nose: PixelSprite = { id: 'ai5-nose', name: 'ai5-nose', tags: [], rows: ['W'] };

const CHART = [34, 8] as const;
const ROCKET = [46, 32] as const;
const FACTORY = [60, 31] as const;
const COLLECTOR = [10, 30] as const;

const base = aiCompose('ai5-opener-base', aiGallery.rows, [
  [jCurve, CHART[0], CHART[1]],
  [rocket, ROCKET[0], ROCKET[1]],
  [aiFactory, FACTORY[0], FACTORY[1]],
  [aiShadow, COLLECTOR[0] + 2, COLLECTOR[1] + 27],
  [aiCollectorRaise, COLLECTOR[0], COLLECTOR[1]],
  [finger, COLLECTOR[0] + AI_COLLECTOR_HAND[0] + 1, COLLECTOR[1] + AI_COLLECTOR_HAND[1] - 1],
]);

export const ai5Opener: SceneArt = {
  id: 'ai5-opener',
  label: 'A collector points at a framed J curve that dips below zero and then climbs, over a model rocket and a model factory on a display ledge.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: arrowhead, x: CHART[0] + 38, y: CHART[1] + 2, motion: { kind: 'twinkle', periodMs: 1400, min: 0.35 } },
    { sprite: windows, x: FACTORY[0] + 2, y: FACTORY[1] + 8, motion: { kind: 'twinkle', periodMs: 3600, min: 0.3, phase: 0.4 } },
    { sprite: nose, x: ROCKET[0] + 3, y: ROCKET[1], motion: { kind: 'twinkle', periodMs: 1900, min: 0.3, phase: 0.7 } },
    { sprite: aiCollectorBlink, x: COLLECTOR[0] + AI_COLLECTOR_EYE[0], y: COLLECTOR[1] + AI_COLLECTOR_EYE[1] },
    { sprite: aiMoteGold, x: 30, y: 27, motion: { kind: 'rise', amp: 5, periodMs: 2700, phase: 0.15 } },
    { sprite: aiMoteGold, x: 75, y: 33, motion: { kind: 'rise', amp: 5, periodMs: 3200, phase: 0.6 } },
  ],
};

export const ai5Finish = aiKeepsake(
  'ai5-finish',
  'A small factory with lit windows and a tall chimney floating in a glass display case on a marble plinth, with sparkles around it.',
  aiFactory,
);

export const art: LessonArtSet = { opener: ai5Opener, backdrop: aiBackdrop, finish: ai5Finish };
