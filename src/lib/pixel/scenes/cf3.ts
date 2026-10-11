/**
 * Corporate Finance lesson 3, Time Value of Money: the hall clock and the money that grows beside it.
 *
 * Opener: a tall case clock (the kit's clock face on a walnut case, a pendulum swinging behind its
 * glass) stands at the left, and across the floor five stacks of coins grow by more each time, one
 * coin, two, four, seven, twelve: money left to earn turns into more money, faster the longer it
 * waits. A painting of the $24 island hangs above them. The coins are the brightest surface; the
 * stacks step up toward the right so the eye climbs with them. Only small layers move: the second
 * hand, the pendulum, coins spinning up off the two tallest stacks, a glint on the top coin.
 *
 * Keepsake: an hourglass running with gold.
 */
import type { PixelSprite } from '../types';
import { cfBackdrop } from './cf-backdrop';
import { cfKeepsake } from './cf1-finish';
import { CF_PALETTE, cfClock, cfCoinSpin, cfCompose, cfHall, cfLater, cfShadowLong, cfShadowShort } from './cf-kit';
import type { LessonArtSet, SceneArt } from './types';

/**
 * A tall case clock: bonnet and finial, a hood whose dark recess takes cfClock at (2, 5), a
 * glass-fronted waist for the pendulum (interior 7 wide at (4, 19)), a panelled base.
 */
const clockCase: PixelSprite = {
  id: 'cf3-clock-case',
  name: 'cf3-clock-case',
  tags: ['scene', 'cf3'],
  blurb: 'A walnut long-case clock with a glass waist.',
  palette: CF_PALETTE,
  rows: [
    '.......y.......',
    '......OGO......',
    '....OOOOOOO....',
    '...OAAAAAAAO...',
    'OOOOOOOOOOOOOOO',
    'OaKKKKKKKKKKKaO',
    'OaKKKKKKKKKKKaO',
    'OaKKKKKKKKKKKaO',
    'OaKKKKKKKKKKKaO',
    'OaKKKKKKKKKKKaO',
    'OaKKKKKKKKKKKaO',
    'OaKKKKKKKKKKKaO',
    'OaKKKKKKKKKKKaO',
    'OaKKKKKKKKKKKaO',
    'OaKKKKKKKKKKKaO',
    'OaKKKKKKKKKKKaO',
    'OOOOOOOOOOOOOOO',
    '.OAAAAAAAAAAAO.',
    '..OgggggggggO..',
    '..OgKKKKKKKgO..',
    '..OgKKKKKKKgO..',
    '..OgKKKKKKKgO..',
    '..OgKKKKKKKgO..',
    '..OgKKKKKKKgO..',
    '..OgKKKKKKKgO..',
    '..OgKKKKKKKgO..',
    '..OgKKKKKKKgO..',
    '..OgKKKKKKKgO..',
    '..OgKKKKKKKgO..',
    '..OgKKKKKKKgO..',
    '..OgKKKKKKKgO..',
    '..OgKKKKKKKgO..',
    '..OgKKKKKKKgO..',
    '..OgggggggggO..',
    '.OAAAAAAAAAAAO.',
    'OAAAAAAAAAAAAAO',
    'OAaaaaaaaaaaaAO',
    'OAaAAAAAAAAAaAO',
    'OAaAAAAAAAAAaAO',
    'OAaAAAAAAAAAaAO',
    'OAaaaaaaaaaaaAO',
    'OAAAAAAAAAAAAAO',
    'OOOOOOOOOOOOOOO',
    'aa...........aa',
  ],
};

/** A painting of the island bought for $24 in 1626: a green hill in a dusk sea. */
const painting: PixelSprite = {
  id: 'cf3-painting',
  name: 'cf3-painting',
  tags: ['scene', 'cf3'],
  blurb: 'A gold-framed painting of a small green island at dusk.',
  palette: CF_PALETTE,
  rows: [
    'OOOOOOOOOOOOOOOOO',
    'OgggggggggggggggO',
    'OgEEEEEEEEEEEEEaO',
    'OgEEEEEEEEEEyEEaO',
    'OgEEEEEEEEEEEEEaO',
    'OgEEEEEnnnEEEEEaO',
    'OgEEEEnNNNnEEEEaO',
    'OgbbbnNmNNNnbbbaO',
    'OgbBbbbbbbbbbBbaO',
    'OgbbbbbBbbbbbbbaO',
    'OaaaaaaaaaaaaaaaO',
    'OOOOOOOOOOOOOOOOO',
  ],
};

/**
 * A stack of `coins` gold coins, 7 wide: a top face, then each coin's edge over a dark seam.
 * Built, not drawn, so the five stacks cannot disagree about what a coin looks like.
 */
function coinStack(id: string, coins: number): PixelSprite {
  const rows = ['.OOOOO.', 'OyyyyGO'];
  for (let i = 0; i < coins; i += 1) rows.push('OyGGGgO', 'OOOOOOO');
  return { id, name: id, tags: ['scene', 'cf3'], blurb: `A stack of ${String(coins)} gold coins.`, rows };
}

const STACKS = [1, 2, 4, 7, 12] as const;
const STACK_X = [24, 34, 44, 54, 64] as const;
/** Every stack stands on the same floor line, so its top is its height above it. */
const STACK_FOOT = 53;

const stackParts = STACKS.map((coins, i) => {
  const sprite = coinStack(`cf3-stack-${String(coins)}`, coins);
  return [sprite, STACK_X[i] ?? 0, STACK_FOOT + 1 - sprite.rows.length] as const;
});

const base = cfCompose('cf3-opener-base', cfHall, [
  [painting, 33, 8],
  [cfShadowShort, 3, 54],
  [cfShadowShort, 8, 54],
  [cfShadowLong, 23, 54],
  [cfShadowLong, 48, 54],
  [clockCase, 3, 10],
  ...stackParts,
], 'The still hall: a long-case clock, a painting of the island, five coin stacks growing to the right.');

/** The pendulum behind the waist glass: centre, left, centre, right. */
const pendulum: PixelSprite = {
  id: 'cf3-opener-pendulum',
  name: 'cf3-opener-pendulum',
  tags: ['scene', 'cf3'],
  blurb: 'A brass pendulum swinging.',
  rows: [
    '...O...',
    '...O...',
    '...O...',
    '...O...',
    '...O...',
    '...O...',
    '...O...',
    '...O...',
    '...O...',
    '..OOO..',
    '.OyyGO.',
    '.OyGgO.',
    '.OGggO.',
    '..OOO..',
  ],
  frames: [
    [
      '...O...',
      '...O...',
      '...O...',
      '...O...',
      '...O...',
      '...O...',
      '...O...',
      '...O...',
      '...O...',
      '..OOO..',
      '.OyyGO.',
      '.OyGgO.',
      '.OGggO.',
      '..OOO..',
    ],
    [
      '...O...',
      '...O...',
      '...O...',
      '...O...',
      '...O...',
      '..O....',
      '..O....',
      '..O....',
      '..O....',
      '.OOO...',
      'OyyGO..',
      'OyGgO..',
      'OGggO..',
      '.OOO...',
    ],
    [
      '...O...',
      '...O...',
      '...O...',
      '...O...',
      '...O...',
      '...O...',
      '...O...',
      '...O...',
      '...O...',
      '..OOO..',
      '.OyyGO.',
      '.OyGgO.',
      '.OGggO.',
      '..OOO..',
    ],
    [
      '...O...',
      '...O...',
      '...O...',
      '...O...',
      '...O...',
      '....O..',
      '....O..',
      '....O..',
      '....O..',
      '...OOO.',
      '..OyyGO',
      '..OyGgO',
      '..OGggO',
      '...OOO.',
    ],
  ],
  frameMs: 500,
};

/** A glint on the tallest stack's top coin. */
const glint: PixelSprite = {
  id: 'cf3-opener-glint',
  name: 'cf3-opener-glint',
  tags: ['scene', 'cf3'],
  rows: [
    '.y.',
    'ywy',
    '.y.',
  ],
};

const coinB = cfLater(cfCoinSpin, 'cf3-opener-coin-b', 2, 290);

export const cf3Opener: SceneArt = {
  id: 'cf3-opener',
  label: 'A tall clock ticks beside five stacks of gold coins that grow taller and taller toward the right, money growing as time passes.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: cfClock, x: 5, y: 15 },
    { sprite: pendulum, x: 7, y: 29 },
    { sprite: glint, x: 69, y: 26, motion: { kind: 'twinkle', periodMs: 1900, min: 0.2 } },
    { sprite: cfCoinSpin, x: 65, y: 21, motion: { kind: 'rise', amp: 9, periodMs: 2800 } },
    { sprite: coinB, x: 55, y: 32, motion: { kind: 'rise', amp: 8, periodMs: 3200, phase: 0.5 } },
  ],
};

/** Lesson 3's emblem: an hourglass whose sand is gold, most of it already run through. */
const emblemHourglass: PixelSprite = {
  id: 'cf3-emblem-hourglass',
  name: 'cf3-emblem-hourglass',
  tags: [],
  blurb: 'A gold-framed hourglass running with gold.',
  rows: [
    '.OOOOOOOOOOOOOO.',
    '.OyyyyyyyyyyyGO.',
    '..OgggggggggggO.',
    '..g.BB....BB.g..',
    '..g.Bw.....B.g..',
    '..g..BGyyGB..g..',
    '..g...BGGB...g..',
    '..g....yB....g..',
    '..g....yB....g..',
    '..g...ByGB...g..',
    '..g..B.yG.B..g..',
    '..g.B..yGG.B.g..',
    '..g.BOyyGGgB.g..',
    '..OgggggggggggO.',
    '.OyyyyyyyyyyyGO.',
    '.OOOOOOOOOOOOOO.',
  ],
};

export const cf3Finish = cfKeepsake(
  'cf3-finish',
  'A crystal award on a gold stand with an hourglass running with gold sand inside, and small sparkles around it.',
  emblemHourglass,
);

export const art: LessonArtSet = { opener: cf3Opener, backdrop: cfBackdrop, finish: cf3Finish };
