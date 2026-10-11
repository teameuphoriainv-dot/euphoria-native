/**
 * Alternative Investments lesson 3: cryptocurrency and digital assets.
 *
 * The opener is the vault gallery (ai-kit.ts) with a blockchain run along the wall: teal blocks
 * chained together, the newest still settling onto the end. Under it the kit's crypto coin spins on
 * a marble plinth, a framed chart on the left shows bitcoin's booms and busts, and the collector
 * holds up a hardware wallet. Only small layers move: the coin spins, the new block bobs, a spark
 * runs along the chain, the wallet's screen and the chart's latest high blink, the collector
 * blinks, a mote rises. The keepsake is the kit's coin in the glass case.
 */
import type { PixelSprite } from '../types';
import { aiBackdrop } from './ai-backdrop';
import {
  AI_COLLECTOR_EYE,
  aiCollectorBlink,
  aiCompose,
  aiCryptoCoin,
  aiGallery,
  aiGlintGold,
  aiKeepsake,
  aiMoteGold,
  aiShadow,
} from './ai-kit';
import { aiCollectorRaise } from './ai-kit-a';
import type { LessonArtSet, SceneArt } from './types';

const block: PixelSprite = {
  id: 'ai3-block',
  name: 'ai3-block',
  tags: ['scene', 'ai'],
  blurb: "One block of the chain: a teal cube with ledger lines on its face.",
  rows: [
    '..mmmmmmm',
    '.mmmmmmmt',
    'TTTTTTTtt',
    'TnnnnnTtt',
    'TTTTTTTtt',
    'TnnnnnTtt',
    'TTTTTTTt.',
    'TTTTTTT..',
  ],
};

const link: PixelSprite = {
  id: 'ai3-link',
  name: 'ai3-link',
  tags: ['scene', 'ai'],
  blurb: "A chain link between two blocks.",
  rows: [
    '.xx.',
    'x..x',
    '.xx.',
  ],
};

const boomChart: PixelSprite = {
  id: 'ai3-boom-chart',
  name: 'ai3-boom-chart',
  tags: ['scene', 'ai'],
  blurb: "A framed chart of bitcoin's price: three booms, each higher, each followed by a crash.",
  rows: [
    'OOOOOOOOOOOOOOOOOO',
    'OyGGGGGGGGGGGGGGgO',
    'OGKKKKKKKKKKKKKNgO',
    'OGKKKKKKKKKKKRKNgO',
    'OGKKKKKKKKRKKRKNgO',
    'OGKKKKKRKKRKNKNKgO',
    'OGKKKKKRKNKRNKNKgO',
    'OGKKKKNKRNKNKKKKgO',
    'OGKKRKNKNKKKKKKKgO',
    'OGKNKNKKKKKKKKKKgO',
    'OGNKKKKKKKKKKKKKgO',
    'OGgggggggggggggggO',
    'OOOOOOOOOOOOOOOOOO',
  ],
};

const plinth: PixelSprite = {
  id: 'ai3-plinth',
  name: 'ai3-plinth',
  tags: ['scene', 'ai'],
  blurb: "A marble plinth with gold caps, for the coin.",
  rows: [
    'OGGGGGGGGGgO',
    '.wwxxxxxxXX.',
    '.wwxxxxxxXX.',
    '.wwxxxxxxXX.',
    '.wwxxxGxxXX.',
    '.wwxxxxxxXX.',
    '.wwxxxxxxXX.',
    '.wwxxxxxxXX.',
    '.wwxxxxxxXX.',
    'OGGGGGGGGGgO',
  ],
};

const wallet: PixelSprite = {
  id: 'ai3-wallet',
  name: 'ai3-wallet',
  tags: ['scene', 'ai'],
  blurb: "A hardware wallet: a small steel device with a teal screen.",
  rows: [
    'XXXX',
    'XmTX',
    'XTTX',
    'XDDX',
    'XDxX',
    'XXXX',
  ],
};

const screen: PixelSprite = { id: 'ai3-screen', name: 'ai3-screen', tags: [], rows: ['mm', 'mm'] };
const high: PixelSprite = { id: 'ai3-high', name: 'ai3-high', tags: [], rows: ['m'] };

/** Left columns of the blocks already on the chain; the next one settles on at NEXT. */
const CHAIN = [31, 44, 57] as const;
const NEXT = 70;
const CHAIN_Y = 10;
const COIN = [52, 21] as const;
const CHART = [5, 9] as const;
const COLLECTOR = [8, 30] as const;

const base = aiCompose('ai3-opener-base', aiGallery.rows, [
  [boomChart, CHART[0], CHART[1]],
  ...CHAIN.map((x) => [block, x, CHAIN_Y] as const),
  ...[...CHAIN.slice(1), NEXT].map((x) => [link, x - 4, CHAIN_Y + 3] as const),
  [plinth, COIN[0], COIN[1] + 12],
  [aiShadow, COLLECTOR[0] + 2, COLLECTOR[1] + 27],
  [aiCollectorRaise, COLLECTOR[0], COLLECTOR[1]],
  [wallet, COLLECTOR[0] + 14, COLLECTOR[1] + 4],
]);

export const ai3Opener: SceneArt = {
  id: 'ai3-opener',
  label: 'A collector holds up a hardware wallet beside a spinning crypto coin on a plinth, under a chain of glowing blocks and a chart of booms and busts.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: aiCryptoCoin, x: COIN[0], y: COIN[1] },
    { sprite: block, x: NEXT, y: CHAIN_Y, motion: { kind: 'bob', amp: 1, periodMs: 1800 } },
    { sprite: aiGlintGold, x: 49, y: CHAIN_Y + 2, motion: { kind: 'drift', amp: 16, periodMs: 4200 } },
    { sprite: screen, x: COLLECTOR[0] + 15, y: COLLECTOR[1] + 5, motion: { kind: 'twinkle', periodMs: 1300, min: 0.3 } },
    { sprite: high, x: CHART[0] + 15, y: CHART[1] + 2, motion: { kind: 'twinkle', periodMs: 1100, min: 0.2, phase: 0.4 } },
    { sprite: aiCollectorBlink, x: COLLECTOR[0] + AI_COLLECTOR_EYE[0], y: COLLECTOR[1] + AI_COLLECTOR_EYE[1] },
    { sprite: aiMoteGold, x: 67, y: 31, motion: { kind: 'rise', amp: 5, periodMs: 2900, phase: 0.3 } },
  ],
};

export const ai3Finish = aiKeepsake(
  'ai3-finish',
  'A teal crypto coin spinning in a glass display case on a marble plinth, with sparkles around it.',
  aiCryptoCoin,
);

export const art: LessonArtSet = { opener: ai3Opener, backdrop: aiBackdrop, finish: ai3Finish };
