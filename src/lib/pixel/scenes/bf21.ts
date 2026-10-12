/**
 * Behavioral Finance lesson 21: behavioral portfolio theory, on the fairground stage.
 *
 * Shefrin and Statman's portfolio is not one mean-variance blend but a pyramid of mental layers, and
 * this one stands in the middle of the midway: safety at the base (bonds and cash, a shield), income
 * above it (dividends, coins), growth above that (an arrow up), and the small aspirational layer at
 * the tip with the jackpot star shining over it. System 1 lives for the tip: the hare waves a lottery
 * ticket at the star. The tortoise builds from the bottom, carrying one more blue brick for the safety
 * layer. The stage and its lights are bf-kit-a.ts.
 *
 * The keepsake jar holds the same layered pyramid, small, its star on top.
 */
import type { PixelSprite } from '../types';
import { bfShadowNarrow, bfShadowWide, bfTortoise } from './bf-kit';
import { bfFairground, bfFairgroundLayers, bfMirror } from './bf-kit-a';
import { BF_TORTOISE_MOUTH, bfStamp } from './bf-kit-b';
import { BF_HARE_FIST, bfHareRaise, bfHeadroom } from './bf-kit-c';
import { bfBackdrop } from './bf-backdrop';
import { bfKeepsake } from './bf1-finish';
import type { LessonArtSet, SceneArt } from './types';

/** The four mental layers, widest at the bottom: aspiration, growth, income, safety. */
const pyramid: PixelSprite = {
  id: 'bf21-pyramid',
  name: 'bf21-pyramid',
  tags: ['prop', 'bf21'],
  rows: [
    '................DDDD................',
    '...............DsFFFD...............',
    '...............DsFFFD...............',
    '..............DsFFFFFD..............',
    '..............DsFFFFFD..............',
    '.............DsFFFFFFFD.............',
    '............DDDDDDDDDDDD............',
    '............DyGGGGWGGGGD............',
    '...........DyGGGGWWWGGGGD...........',
    '..........DyGGGGWGWGWGGGGD..........',
    '..........DyGGGGGGWGGGGGGD..........',
    '.........DyGGGGGGGWGGGGGGGD.........',
    '.........DyGGGGGGGGGGGGGGGD.........',
    '........DDDDDDDDDDDDDDDDDDDD........',
    '.......DmNNNNNONNNONNNONNNNND.......',
    '.......DmNNNNOyONOyONOyONNNND.......',
    '......DmNNNNNNONNNONNNONNNNNND......',
    '......DmNNNNNNNNNNNNNNNNNNNNND......',
    '.....DmNNNNNNNNNNNNNNNNNNNNNNND.....',
    '....DDDDDDDDDDDDDDDDDDDDDDDDDDDD....',
    '....DwBBBBBBBBBBWWWWWBBBBBBBBBBD....',
    '...DwBBBBBBBBBBBWwwwWBBBBBBBBBBBD...',
    '..DwBBBBBBBBBBBBWwwwWBBBBBBBBBBBBD..',
    '..DwBBBBBBBBBBBBBWwWBBBBBBBBBBBBBD..',
    '.DwBBBBBBBBBBBBBBBWBBBBBBBBBBBBBBBD.',
    '.DwBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBD.',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
  ],
};

/** The jackpot the aspirational layer is for, shining over the tip. */
const jackpot: PixelSprite = {
  id: 'bf21-jackpot',
  name: 'bf21-jackpot',
  tags: ['prop', 'bf21'],
  rows: [
    '..G..',
    '.GyG.',
    'GyWyG',
    '.GyG.',
    '..G..',
  ],
};

/** A lottery ticket: pink, a gold star, the small print. */
const ticket: PixelSprite = {
  id: 'bf21-ticket',
  name: 'bf21-ticket',
  tags: ['prop', 'bf21'],
  rows: [
    'fffffffff',
    'fFyFFwwwf',
    'fyWyFFFFf',
    'fFyFFwwFf',
    'fffffffff',
  ],
};

/** System 1 waving the ticket at the tip of the pyramid; it faces the stage. */
const hareTicket = bfMirror(
  bfStamp(bfHeadroom(bfHareRaise, 'bf21-hare-raise-tall', 4), 'bf21-hare-ticket-right', ticket, BF_HARE_FIST.x - 3, BF_HARE_FIST.y - 1),
  'bf21-hare-ticket',
);

/** One more brick for the safety layer, in the tortoise's mouth. */
const brick: PixelSprite = {
  id: 'bf21-brick',
  name: 'bf21-brick',
  tags: ['prop', 'bf21'],
  rows: [
    'DDDDDDD',
    'DwBBBBD',
    'DBBBBBD',
    'DbbbbbD',
    'DDDDDDD',
  ],
};

const tortoiseBuilding = bfStamp(bfTortoise, 'bf21-tortoise-building', brick, BF_TORTOISE_MOUTH.x, BF_TORTOISE_MOUTH.y + 1, BF_TORTOISE_MOUTH.dys);

export const bf21Opener: SceneArt = {
  id: 'bf21-opener',
  label: 'At a night fairground, a pyramid of four colored layers stands for safety, income, growth and a small aspirational tip under a shining star, as a hare waves a lottery ticket at it and a calm tortoise carries a brick for the base.',
  width: 80,
  height: 60,
  base: bfFairground,
  layers: [
    ...bfFairgroundLayers.filter((layer) => layer.sprite.id !== 'bf-star-big'),
    { sprite: pyramid, x: 24, y: 25 },
    { sprite: jackpot, x: 40, y: 18, motion: { kind: 'twinkle', periodMs: 1600, min: 0.35 } },
    { sprite: bfShadowWide, x: 0, y: 56 },
    { sprite: bfShadowNarrow, x: 58, y: 56 },
    { sprite: tortoiseBuilding, x: 0, y: 40 },
    { sprite: hareTicket, x: 53, y: 25, motion: { kind: 'bob', amp: 1, periodMs: 700 } },
  ],
};

/** The keepsake emblem: the layered pyramid, safety at the base and a star over the aspirational tip. */
const emblemPyramid: PixelSprite = {
  id: 'bf21-emblem-pyramid',
  name: 'bf21-emblem-pyramid',
  tags: ['emblem', 'bf', 'lesson-21'],
  blurb: "Lesson 21's emblem: behavioral portfolio theory caught as a pyramid of mental layers, a star at its tip.",
  rows: [
    '.......yy.......',
    '......yWWy......',
    '.......yy.......',
    '......DDDD......',
    '......DsFD......',
    '.....DsFFFD.....',
    '.....DsFFFD.....',
    '....DDDDDDDD....',
    '....DyGGGGGD....',
    '....DyGGGGGD....',
    '...DyGGGGGGGD...',
    '...DDDDDDDDDD...',
    '...DmNNNNNNND...',
    '..DmNNNNNNNNND..',
    '..DmNNNNNNNNND..',
    '..DDDDDDDDDDDD..',
    '.DwBBBBBBBBBBBD.',
    '.DwBBBBBBBBBBBD.',
    'DwBBBBBBBBBBBBBD',
    'DDDDDDDDDDDDDDDD',
  ],
};

export const bf21Finish: SceneArt = bfKeepsake(
  'bf21-finish',
  'A corked glass jar with a paper tag, holding a little pyramid in four colored layers, blue, green, gold and pink, with a star at its tip, bubbles rising inside and sparkles around it.',
  emblemPyramid,
);

export const art: LessonArtSet = { opener: bf21Opener, backdrop: bfBackdrop, finish: bf21Finish };
