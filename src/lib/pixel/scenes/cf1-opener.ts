/**
 * Corporate Finance lesson 1 opener: one pile of cash, three doors, and the CFO who picks the door.
 *
 * Composed from the cf kit on the hall ground: three doors with their signs above (invest, finance,
 * return), the cash pile in the middle, the conveyor bringing it in from the works off the left
 * edge, a window onto the works, and the CFO at the right. The pile is the brightest broad surface;
 * the lit transoms sit a step behind it. Only small layers move: bundles ride the belt, the transoms
 * glow in turn, coins spin up off the pile, smoke leaves the stack, and the CFO's thought bubble
 * cycles the three choices.
 */
import type { PixelSprite } from '../types';
import {
  cfCashPile,
  cfCfo,
  cfCoinSpin,
  cfCompose,
  cfConveyor,
  cfConveyorLoad,
  cfDoor,
  cfHall,
  cfLater,
  cfPlaque,
  cfSconce,
  cfShadowLong,
  cfShadowShort,
  cfSignAsk,
  cfSignFinance,
  cfSignInvest,
  cfSignReturn,
  cfSmokePuff,
  cfThinking,
  cfWindowWorks,
} from './cf-kit';
import type { SceneArt } from './types';

const base = cfCompose('cf1-opener-base', cfHall, [
  [cfDoor, 1, 15],
  [cfDoor, 20, 15],
  [cfDoor, 39, 15],
  [cfPlaque, 2, 4],
  [cfPlaque, 21, 4],
  [cfPlaque, 40, 4],
  [cfSignInvest, 4, 6],
  [cfSignFinance, 23, 6],
  [cfSignReturn, 42, 6],
  [cfSconce, 15, 22],
  [cfSconce, 34, 22],
  [cfWindowWorks, 65, 4],
  [cfConveyor, 0, 47],
  [cfShadowLong, 24, 53],
  [cfCashPile, 13, 38],
  [cfShadowShort, 68, 57],
  [cfCfo, 65, 31],
], 'The still hall: three signed doors, two lamps, a window on the works, the pile, the conveyor, the CFO.');

const glowInvest: PixelSprite = {
  id: 'cf1-opener-glow-invest',
  name: 'cf1-opener-glow-invest',
  tags: ['scene', 'cf1'],
  blurb: 'The lit transom over the invest door.',
  rows: [
    'NNNNNNNN',
    'NmmmmmmN',
  ],
};

const glowFinance: PixelSprite = {
  id: 'cf1-opener-glow-finance',
  name: 'cf1-opener-glow-finance',
  tags: ['scene', 'cf1'],
  blurb: 'The lit transom over the finance door.',
  rows: [
    'BBBBBBBB',
    'BBwwwwBB',
  ],
};

const glowReturn: PixelSprite = {
  id: 'cf1-opener-glow-return',
  name: 'cf1-opener-glow-return',
  tags: ['scene', 'cf1'],
  blurb: 'The lit transom over the return door.',
  rows: [
    'GGGGGGGG',
    'GGyyyyGG',
  ],
};

/** Wonders first, then names the three doors in turn. */
const thinking = cfThinking('cf1-opener-thinking', [cfSignAsk, cfSignInvest, cfSignFinance, cfSignReturn], 1100);

const coinB = cfLater(cfCoinSpin, 'cf1-opener-coin-b', 1, 300);
const coinC = cfLater(cfCoinSpin, 'cf1-opener-coin-c', 2, 280);

export const cf1Opener: SceneArt = {
  id: 'cf1-opener',
  label: 'A finance chief in an orchid suit stands beside a pile of cash that rolls in on a conveyor, wondering which of three doors it goes through: invest, finance or return.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: cfConveyorLoad, x: 0, y: 44 },
    { sprite: glowInvest, x: 4, y: 18, motion: { kind: 'twinkle', periodMs: 3000, min: 0.35 } },
    { sprite: glowFinance, x: 23, y: 18, motion: { kind: 'twinkle', periodMs: 3000, phase: 0.33, min: 0.35 } },
    { sprite: glowReturn, x: 42, y: 18, motion: { kind: 'twinkle', periodMs: 3000, phase: 0.66, min: 0.35 } },
    { sprite: cfSmokePuff, x: 75, y: 8, motion: { kind: 'rise', amp: 2, periodMs: 3600 } },
    { sprite: thinking, x: 53, y: 18 },
    { sprite: cfCoinSpin, x: 9, y: 40, motion: { kind: 'rise', amp: 8, periodMs: 2800 } },
    { sprite: coinB, x: 27, y: 33, motion: { kind: 'rise', amp: 9, periodMs: 3100, phase: 0.4 } },
    { sprite: coinC, x: 43, y: 40, motion: { kind: 'rise', amp: 8, periodMs: 2900, phase: 0.75 } },
  ],
};
