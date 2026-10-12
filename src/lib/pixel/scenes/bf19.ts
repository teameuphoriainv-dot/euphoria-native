/**
 * Behavioral Finance lesson 19: the endowment effect and loss aversion, inside the head.
 *
 * Built on bfMindRoom. Same mug, different values (Kahneman, Knetsch and Thaler): the eye over the
 * owner reads SELL $7, the eye over the buyer reads BUY $3. System 1 owns the mug and it is suddenly
 * precious: the hare hugs it to its chest, hearts rising off it. The tortoise is the buyer and the fix
 * at once, holding out a coin, the fair price, and the clean slate question with it: would you buy it
 * today at that price? The hare will not let go.
 *
 * The keepsake jar holds the mug, a heart on its side, still steaming.
 */
import type { PixelSprite } from '../types';
import {
  bfConsoleLights,
  bfHare,
  bfLater,
  bfMindRoom,
  bfShadowNarrow,
  bfShadowWide,
  bfStar,
  bfStarBig,
  bfTortoise,
} from './bf-kit';
import { bfMirror } from './bf-kit-a';
import { BF_TORTOISE_MOUTH, bfCoin, bfStamp } from './bf-kit-b';
import { bfHeart, bfText } from './bf-kit-c';
import { bfBackdrop } from './bf-backdrop';
import { bfKeepsake } from './bf1-finish';
import type { LessonArtSet, SceneArt } from './types';

/** The owner's eye: what it would take to part with the mug. */
const askWord = bfText('bf19-opener-ask-word', 'SELL', 'x');
const askPrice = bfText('bf19-opener-ask-price', '$7', 'G');

/** The buyer's eye: what the same mug is worth to someone who does not own it. */
const bidWord = bfText('bf19-opener-bid-word', 'BUY', 'x');
const bidPrice = bfText('bf19-opener-bid-price', '$3', 'N');

/** The mug, held to the chest: orchid, a white heart on its side, two paws round it. */
const mugHugged: PixelSprite = {
  id: 'bf19-mug-hugged',
  name: 'bf19-mug-hugged',
  tags: ['prop', 'bf19'],
  rows: [
    '..EEEEEEE..',
    '..EQQQQQEEE',
    '..EPWPWPE.E',
    'DDEPWWWPE.E',
    'DwwPPWPPEEE',
    'DwwpPPPpE..',
    '.DDEEEEE...',
  ],
};

const hareHugging = bfStamp(bfHare, 'bf19-hare-hugging', mugHugged, 10, 16);

/** The buyer's offer, held out in the tortoise's mouth; it faces the hare. */
const tortoiseOffer = bfMirror(
  bfStamp(bfTortoise, 'bf19-tortoise-offer-right', bfCoin, BF_TORTOISE_MOUTH.x + 1, BF_TORTOISE_MOUTH.y + 1, BF_TORTOISE_MOUTH.dys),
  'bf19-tortoise-offer',
);

const consoleLightsLater = bfLater(bfConsoleLights, 'bf19-opener-console-lights-later', 2, 510);

export const bf19Opener: SceneArt = {
  id: 'bf19-opener',
  label: "Inside an investor's head, a hare hugs its mug as hearts rise off it, one eye reading SELL $7 and the other BUY $3, while a calm tortoise holds out a coin for it.",
  width: 80,
  height: 60,
  base: bfMindRoom,
  layers: [
    { sprite: askWord, x: 14, y: 15 },
    { sprite: askPrice, x: 18, y: 21 },
    { sprite: bidWord, x: 53, y: 15 },
    { sprite: bidPrice, x: 55, y: 21 },
    { sprite: bfStar, x: 12, y: 22, motion: { kind: 'twinkle', periodMs: 2100, min: 0.2 } },
    { sprite: bfStarBig, x: 65, y: 23, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.4, min: 0.3 } },
    { sprite: bfConsoleLights, x: 30, y: 34 },
    { sprite: consoleLightsLater, x: 62, y: 34 },
    { sprite: bfShadowNarrow, x: 3, y: 54 },
    { sprite: bfShadowWide, x: 41, y: 55 },
    { sprite: tortoiseOffer, x: 39, y: 39 },
    { sprite: hareHugging, x: 2, y: 27 },
    { sprite: bfHeart, x: 21, y: 35, motion: { kind: 'rise', amp: 7, periodMs: 2200 } },
    { sprite: bfHeart, x: 27, y: 39, motion: { kind: 'rise', amp: 6, periodMs: 2600, phase: 0.5 } },
  ],
};

/** The keepsake emblem: the orchid mug with a white heart on its side, steam curling off it. */
const emblemMug: PixelSprite = {
  id: 'bf19-emblem-mug',
  name: 'bf19-emblem-mug',
  tags: ['emblem', 'bf', 'lesson-19'],
  blurb: "Lesson 19's emblem: the endowment effect caught as a mug with a heart on it, worth more because it is yours.",
  rows: [
    '..x...x........',
    '...x...x.......',
    '..x...x........',
    '...............',
    'EEEEEEEEEEE....',
    'EQQQQQQQQQE....',
    'EPPPPPPPPpEEEE.',
    'EPWWPWWPPpE..E.',
    'EPWWWWWPPpE..E.',
    'EPWWWWWPPpE..E.',
    'EPPWWWPPPpE..E.',
    'EPPPWPPPPpEEEE.',
    'EpPPPPPPPpE....',
    'EppppppppppE...',
    '.EEEEEEEEEE....',
  ],
  frames: [
    [
      '..x...x........',
      '...x...x.......',
      '..x...x........',
      '...............',
      'EEEEEEEEEEE....',
      'EQQQQQQQQQE....',
      'EPPPPPPPPpEEEE.',
      'EPWWPWWPPpE..E.',
      'EPWWWWWPPpE..E.',
      'EPWWWWWPPpE..E.',
      'EPPWWWPPPpE..E.',
      'EPPPWPPPPpEEEE.',
      'EpPPPPPPPpE....',
      'EppppppppppE...',
      '.EEEEEEEEEE....',
    ],
    [
      '...x...x.......',
      '..x...x........',
      '...x...x.......',
      '...............',
      'EEEEEEEEEEE....',
      'EQQQQQQQQQE....',
      'EPPPPPPPPpEEEE.',
      'EPWWPWWPPpE..E.',
      'EPWWWWWPPpE..E.',
      'EPWWWWWPPpE..E.',
      'EPPWWWPPPpE..E.',
      'EPPPWPPPPpEEEE.',
      'EpPPPPPPPpE....',
      'EppppppppppE...',
      '.EEEEEEEEEE....',
    ],
    [
      '...............',
      '...x...x.......',
      '..x...x........',
      '...............',
      'EEEEEEEEEEE....',
      'EQQQQQQQQQE....',
      'EPPPPPPPPpEEEE.',
      'EPWWPWWPPpE..E.',
      'EPWWWWWPPpE..E.',
      'EPWWWWWPPpE..E.',
      'EPPWWWPPPpE..E.',
      'EPPPWPPPPpEEEE.',
      'EpPPPPPPPpE....',
      'EppppppppppE...',
      '.EEEEEEEEEE....',
    ],
  ],
  frameMs: 500,
};

export const bf19Finish: SceneArt = bfKeepsake(
  'bf19-finish',
  'A corked glass jar with a paper tag, holding an orchid mug with a white heart on its side and steam curling off it, with bubbles rising inside and sparkles around it.',
  emblemMug,
);

export const art: LessonArtSet = { opener: bf19Opener, backdrop: bfBackdrop, finish: bf19Finish };
