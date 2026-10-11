/**
 * Corporate Finance lesson 4, Capital Structure: the bank lobby, where the money is weighed.
 *
 * Opener: the hall dressed as a bank lobby, a marble column at each side and a chandelier, with
 * a gold balance scale in the middle. On one pan sits a bank (debt: borrowed, paid back with
 * interest); on the other a pie with a slice lifted out (equity: a piece of the company sold).
 * The beam tips one way, then the other, the way a CFO weighs the mix. The CFO stands by with the
 * finance plaque above him, thinking it over. Only small layers move: the beam and its pans, the
 * thought bubble (a question, then the bank, then the pie), the plaque lighting, the candles.
 *
 * Keepsake: a balance scale with a bank on one pan and a pie on the other.
 */
import type { PixelSprite } from '../types';
import { cfBackdrop } from './cf-backdrop';
import { cfKeepsake } from './cf1-finish';
import {
  cfCfo,
  cfCompose,
  cfHall,
  cfPlaque,
  cfShadowShort,
  cfSignAsk,
  cfSignFinance,
  cfThinking,
} from './cf-kit';
import { cfRecolor, cfScaleBeam, cfScaleStand } from './cf-kit-a';
import type { LessonArtSet, SceneArt } from './types';

/** A marble column: capital, fluted shaft, base. Lit from the left. */
const column: PixelSprite = {
  id: 'cf4-column',
  name: 'cf4-column',
  tags: ['scene', 'cf4'],
  blurb: 'A pale marble column.',
  rows: [
    'wwwwwwwx',
    'xxxxxxxX',
    '.XwwwxX.',
    '..XXXX..',
    ...Array.from({ length: 30 }, () => '.wxXxXD.'),
    '.XXXXXX.',
    'wwwwwwwx',
    'xxxxxxxX',
    'XXXXXXXD',
  ],
};

/** A gold chandelier on a chain, three arms a side. Its candle flames are layers. */
const chandelier: PixelSprite = {
  id: 'cf4-chandelier',
  name: 'cf4-chandelier',
  tags: ['scene', 'cf4'],
  blurb: 'A gold chandelier.',
  rows: [
    '.......Og.......',
    '.......Og.......',
    '.......Og.......',
    '..x....Og....x..',
    '..G..x.Og.x..G..',
    '..O..G.Og.G..O..',
    '.OGOOOOGGOOOOGO.',
    '..OGGGGGGGGGGO..',
    '......OGGO......',
    '.......OO.......',
  ],
};

/** Debt: a bank, borrowed from and paid back. */
const panBank: readonly string[] = [
  '...BBB...',
  '.BBBBBBB.',
  'BBBBBBBBB',
  '.bKbKbKb.',
  '.bKbKbKb.',
  '.bKbKbKb.',
  'BBBBBBBBB',
];

/** Equity: a pie with one slice lifted out, a piece of the company sold. */
const panPie: readonly string[] = [
  '......m..',
  '..mN..mN.',
  '.mNN..NNn',
  'mNNN.....',
  'NNNNNNn..',
  'NNNNNnn..',
  '.NNnnn...',
  '..nnn....',
];

const scaleBeam = cfScaleBeam('cf4-opener-scale-beam', panBank, panPie);

/** The finance sign dimmed, for the base; the lit sign above it is a layer. */
const signFinanceDim = cfRecolor(cfSignFinance, 'cf4-sign-finance-dim', { B: 'b' });

/** Equity as a sign for the thought bubble: a pie with a slice gone. */
const signPie: PixelSprite = {
  id: 'cf4-sign-pie',
  name: 'cf4-sign-pie',
  tags: ['scene', 'cf4', 'sign'],
  blurb: 'A green pie with a slice gone.',
  rows: [
    '..NN...',
    '.mNN...',
    'mNNN...',
    'NNNNNNn',
    'NNNNNnn',
    '.NNnnn.',
    '..nnn..',
  ],
};

const base = cfCompose('cf4-opener-base', cfHall, [
  [column, 1, 4],
  [column, 72, 4],
  [chandelier, 21, 0],
  [cfScaleStand, 19, 22],
  [cfPlaque, 58, 4],
  [signFinanceDim, 60, 6],
  [cfShadowShort, 65, 56],
  [cfCfo, 62, 30],
], 'The still lobby: two marble columns, a chandelier, the scale stand, the finance plaque, the CFO.');

const flamesOuter: PixelSprite = { id: 'cf4-opener-flames-outer', name: 'cf4-opener-flames-outer', tags: ['scene', 'cf4'], rows: ['y..........y'] };
const flamesInner: PixelSprite = { id: 'cf4-opener-flames-inner', name: 'cf4-opener-flames-inner', tags: ['scene', 'cf4'], rows: ['y....y'] };

/** Wonders first, then names the two ways to raise the money in turn. */
const thinking = cfThinking('cf4-opener-thinking', [cfSignAsk, cfSignFinance, signPie], 1200);

export const cf4Opener: SceneArt = {
  id: 'cf4-opener',
  label: 'In a marble bank lobby a gold balance scale weighs a bank against a pie with a slice taken out, debt against equity, while the finance chief thinks it over.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: flamesOuter, x: 23, y: 2, motion: { kind: 'twinkle', periodMs: 1700, min: 0.4 } },
    { sprite: flamesInner, x: 26, y: 3, motion: { kind: 'twinkle', periodMs: 2100, phase: 0.5, min: 0.4 } },
    { sprite: cfSignFinance, x: 60, y: 6, motion: { kind: 'twinkle', periodMs: 3200, min: 0.25 } },
    { sprite: scaleBeam, x: 12, y: 18 },
    { sprite: thinking, x: 50, y: 17 },
  ],
};

/** Lesson 4's emblem: the scale, a bank on the left pan, a pie on the right. */
const emblemScale: PixelSprite = {
  id: 'cf4-emblem-scale',
  name: 'cf4-emblem-scale',
  tags: [],
  blurb: 'A gold balance scale holding a blue bank and a green pie.',
  rows: [
    '.......yO.......',
    'OyGGGGGGGGGGGGgO',
    '..x....Og....x..',
    '..x....Og....x..',
    '..B....Og...NN..',
    '.BBB...Og..NmN..',
    'BbBbB..Og..NNNNn',
    'BBBBB..Og...Nnn.',
    'OGGGO..Og..OGGGO',
    '.OOO...Og...OOO.',
    '.......Og.......',
    '.......Og.......',
    '.......Og.......',
    '.....OyGGgO.....',
    '....OyyGGGgO....',
    '...OOOOOOOOOO...',
  ],
};

export const cf4Finish = cfKeepsake(
  'cf4-finish',
  'A crystal award on a gold stand with a balance scale weighing a bank against a pie inside, and small sparkles around it.',
  emblemScale,
);

export const art: LessonArtSet = { opener: cf4Opener, backdrop: cfBackdrop, finish: cf4Finish };
