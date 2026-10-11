/**
 * Corporate Finance lesson 5, Valuing a Company: putting a price on the whole works.
 *
 * Opener: a scale model of the company's works stands on a walnut plinth like a lot at auction,
 * and a big price tag swings from its stack. Coins rise off its roof: a company is worth the cash
 * it will make, counted today. The CFO presents it; behind him a board of analyst targets shows
 * three prices for the same company (low, average, high). The white tag is the brightest
 * surface. Only small layers move: the tag, the smoke, the rising coins, the three targets in turn.
 *
 * Keepsake: a price tag marked with a dollar sign.
 */
import type { PixelSprite } from '../types';
import { cfBackdrop } from './cf-backdrop';
import { cfKeepsake } from './cf1-finish';
import {
  CF_PALETTE,
  cfCoinSpin,
  cfCompose,
  cfHall,
  cfLater,
  cfSconce,
  cfShadowLong,
  cfShadowShort,
  cfSmokePuff,
} from './cf-kit';
import { cfCfoReach } from './cf-kit-a';
import type { LessonArtSet, SceneArt } from './types';

/** A walnut plinth with a gold top and a brass name plate. */
const plinth: PixelSprite = {
  id: 'cf5-plinth',
  name: 'cf5-plinth',
  tags: ['scene', 'cf5'],
  blurb: 'A walnut display plinth with a brass plate.',
  palette: CF_PALETTE,
  rows: [
    'OOOOOOOOOOOOOOOOOOOOOOOOO',
    'OgggggggggggggggggggggggO',
    '..OAAAAAAAAAAAAAAAAAAAO..',
    '..OAaaaaaaaaaaaaaaaaaAO..',
    '..OAaAAAAAAAAAAAAAAAaAO..',
    '..OAaAAAOyyyyyyyOAAAaAO..',
    '..OAaAAAOgggggggOAAAaAO..',
    '..OAaAAAAAAAAAAAAAAAaAO..',
    '..OAaAAAAAAAAAAAAAAAaAO..',
    '..OAaAAAAAAAAAAAAAAAaAO..',
    '..OAaaaaaaaaaaaaaaaaaAO..',
    '..OAAAAAAAAAAAAAAAAAAAO..',
    '.OOOOOOOOOOOOOOOOOOOOOOO.',
    'OgggggggggggggggggggggggO',
    'OOOOOOOOOOOOOOOOOOOOOOOOO',
  ],
};

/** The works in miniature: a sawtooth roof glazed on its steep side, brick walls, lit windows, a stack. */
const model: PixelSprite = {
  id: 'cf5-model',
  name: 'cf5-model',
  tags: ['scene', 'cf5'],
  blurb: 'A scale model of a brick factory with a sawtooth roof and a tall stack.',
  rows: [
    '..................XD..',
    '..................XD..',
    '..................22..',
    '..................XD..',
    '..................XD..',
    'D.....D.....D.....XD..',
    'xD....xD....xD....XD..',
    'xXD...xXD...xXD...XD..',
    'xXXD..xXXD..xXXD..XD..',
    'xXXXD.xXXXD.xXXXD.XD..',
    'xXXXXDxXXXXDxXXXXDXDDD',
    '1111111111111111111111',
    '1GG1GG1GG1GG1GG1GG1111',
    '1GG1GG1GG1GG1GG1GG1OO1',
    '1111111111111111111OO1',
    '2222222222222222222OO2',
  ],
};

/** Analyst targets for the same company: a low price, the average, a high one. */
const targets: PixelSprite = {
  id: 'cf5-targets',
  name: 'cf5-targets',
  tags: ['scene', 'cf5'],
  blurb: 'A board of three price targets: red low, gold average, green high.',
  palette: CF_PALETTE,
  rows: [
    '.OOOOOOOOOOOOOOOOOOO.',
    'OgggggggggggggggggggO',
    'OgKKKKKKKKKKKKKKKKKaO',
    'OgKKKKKKKKKKKKNNNKKaO',
    'OgKKKKKKKKKKKKNNNKKaO',
    'OgKKKKKKKKKKKKNNNKKaO',
    'OgKKKKKKKGGGKKNNNKKaO',
    'OgKKKKKKKGGGKKNNNKKaO',
    'OgKKKKKKKGGGKKNNNKKaO',
    'OgKKKrrrKGGGKKNNNKKaO',
    'OgKKKrrrKGGGKKNNNKKaO',
    'OgKXXXXXXXXXXXXXXXKaO',
    'OaaaaaaaaaaaaaaaaaaaO',
    '.OOOOOOOOOOOOOOOOOOO.',
  ],
};

const TAG_BODY: readonly string[] = [
  '....DDD....',
  '...DwKwD...',
  '..DwwwwwD..',
  '.DwwwNwwwD.',
  'DwwwNNNwwxD',
  'DwwwNwwwwxD',
  'DwwwNNNwwxD',
  'DwwwwwNwwxD',
  'DwwwNNNwwxD',
  'DwwwwNwwwxD',
  'DxxxxxxxxxD',
  'DDDDDDDDDDD',
];
const TAG = { w: 15, h: 16, body: 2, top: 4 } as const;

/**
 * The tag on its string, swung `dx` columns from hanging straight. The string runs from the stack
 * (the sprite's top-left pixel, which never moves) to the hole. Computed so every frame's string
 * ends exactly at its tag.
 */
function tagFrame(dx: number): string[] {
  const grid = Array.from({ length: TAG.h }, () => Array.from({ length: TAG.w }, () => '.'));
  const left = TAG.body + dx;
  TAG_BODY.forEach((row, j) => {
    [...row].forEach((ch, i) => {
      const line = grid[TAG.top + j];
      if (line && ch !== '.') line[left + i] = ch;
    });
  });
  const holeX = left + 5;
  for (let y = 0; y < TAG.top; y += 1) {
    const x = Math.round((holeX * y) / TAG.top);
    const line = grid[y];
    if (line) line[x] = 'x';
  }
  return grid.map((row) => row.join(''));
}

const tag: PixelSprite = {
  id: 'cf5-opener-tag',
  name: 'cf5-opener-tag',
  tags: ['scene', 'cf5'],
  blurb: 'A white price tag with a green dollar sign, swinging on its string.',
  rows: tagFrame(0),
  frames: [tagFrame(0), tagFrame(1), tagFrame(0), tagFrame(-1)],
  frameMs: 650,
};

const base = cfCompose('cf5-opener-base', cfHall, [
  [targets, 56, 6],
  [cfSconce, 24, 10],
  [cfSconce, 47, 10],
  [cfShadowLong, 30, 53],
  [plinth, 22, 39],
  [model, 23, 23],
  [cfShadowShort, 6, 56],
  [cfCfoReach, 2, 30],
], 'The still hall: a board of price targets, two lamps, the plinth with the model works, the CFO.');

const glowLow: PixelSprite = { id: 'cf5-opener-glow-low', name: 'cf5-opener-glow-low', tags: ['scene', 'cf5'], rows: ['sss'] };
const glowMid: PixelSprite = { id: 'cf5-opener-glow-mid', name: 'cf5-opener-glow-mid', tags: ['scene', 'cf5'], rows: ['yyy'] };
const glowHigh: PixelSprite = { id: 'cf5-opener-glow-high', name: 'cf5-opener-glow-high', tags: ['scene', 'cf5'], rows: ['mmm'] };

const coinB = cfLater(cfCoinSpin, 'cf5-opener-coin-b', 2, 300);

export const cf5Opener: SceneArt = {
  id: 'cf5-opener',
  label: 'A finance chief presents a model of the company factory on a plinth, a big price tag swinging from its stack and gold coins rising off its roof.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: glowLow, x: 61, y: 15, motion: { kind: 'twinkle', periodMs: 3300, min: 0.3 } },
    { sprite: glowMid, x: 65, y: 12, motion: { kind: 'twinkle', periodMs: 3300, phase: 0.33, min: 0.3 } },
    { sprite: glowHigh, x: 70, y: 9, motion: { kind: 'twinkle', periodMs: 3300, phase: 0.66, min: 0.3 } },
    { sprite: cfSmokePuff, x: 41, y: 19, motion: { kind: 'rise', amp: 4, periodMs: 3400 } },
    { sprite: cfCoinSpin, x: 26, y: 26, motion: { kind: 'rise', amp: 8, periodMs: 2900 } },
    { sprite: coinB, x: 33, y: 24, motion: { kind: 'rise', amp: 9, periodMs: 3300, phase: 0.45 } },
    { sprite: tag, x: 42, y: 25 },
  ],
};

/** Lesson 5's emblem: a white price tag on a gold string, marked with a green dollar sign. */
const emblemTag: PixelSprite = {
  id: 'cf5-emblem-tag',
  name: 'cf5-emblem-tag',
  tags: [],
  blurb: 'A white price tag with a green dollar sign.',
  rows: [
    '.......GGG......',
    '......G...G.....',
    '......G...G.....',
    '.......G.G......',
    '......DDGDD.....',
    '.....DwwKwwD....',
    '....DwwwwwwwD...',
    '...DwwwwNwwwxD..',
    '...DwwwNNNwwxD..',
    '...DwwwNwwwwxD..',
    '...DwwwNNNwwxD..',
    '...DwwwwwNwwxD..',
    '...DwwwNNNwwxD..',
    '...DwwwwNwwwxD..',
    '...DxxxxxxxxxD..',
    '...DDDDDDDDDDD..',
  ],
};

export const cf5Finish = cfKeepsake(
  'cf5-finish',
  'A crystal award on a gold stand with a price tag marked with a dollar sign inside, and small sparkles around it.',
  emblemTag,
);

export const art: LessonArtSet = { opener: cf5Opener, backdrop: cfBackdrop, finish: cf5Finish };
