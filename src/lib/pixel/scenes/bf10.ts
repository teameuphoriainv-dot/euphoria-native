/**
 * Behavioral Finance lesson 10: the capstone, the end of the fable's race, out on the fairground stage.
 *
 * Slow and steady wins: the tortoise walks under the FINISH banner, its head just past the post, while
 * the hare that sprinted off lies asleep in the foreground, snores rising. The fairground is lit up
 * for it (the wheel glowing gold, fireworks over the tent and the wheel, confetti falling through the
 * gate). The finish line, the napping hare and the lights are bf-kit-b.ts, built for both capstones.
 *
 * The keepsake is the capstone jar: a gold cap, a prize rosette where the tag hangs, and inside it a
 * crown, a bolt, a sheep and a coaster car, the shortcuts caught in lessons 1 to 9.
 */
import type { PixelSprite } from '../types';
import { bfLater, bfShadowWide, bfTortoise } from './bf-kit';
import { bfFairground, bfFairgroundLayers, bfMirror } from './bf-kit-a';
import {
  bfBackdropLit,
  bfConfetti,
  bfFairWheelLit,
  bfFinishBanner,
  bfFinishPosts,
  bfFirework,
  bfHareNap,
  bfRecolor,
  bfSnore,
  bfSnoreBig,
} from './bf-kit-b';
import { bfKeepsake } from './bf1-finish';
import type { LessonArtSet, SceneArt } from './types';

/** The stage, lit: the wheel glows, and the stage's two stars go (the banner hangs where they were). */
const stage = bfFairgroundLayers
  .filter((layer) => !layer.sprite.id.startsWith('bf-star'))
  .map((layer) => (layer.sprite.id === 'bf-fair-wheel' ? { ...layer, sprite: bfFairWheelLit } : layer));

const fireworkPink = bfLater(
  bfRecolor(bfFirework, 'bf10-firework-pink-base', { y: 'F', G: 'q', O: 'f' }),
  'bf10-firework-pink',
  2,
  360,
);

const hareAsleep = bfMirror(bfHareNap, 'bf10-hare-asleep');

export const bf10Opener: SceneArt = {
  id: 'bf10-opener',
  label: 'At a night fairground lit up for the finish, a calm tortoise walks under a FINISH banner as confetti falls and fireworks burst, while the hare lies asleep in front.',
  width: 80,
  height: 60,
  base: bfFairground,
  layers: [
    ...stage,
    { sprite: bfFirework, x: 2, y: 0 },
    { sprite: fireworkPink, x: 66, y: 0 },
    { sprite: bfFinishPosts, x: 28, y: 21 },
    { sprite: bfFinishBanner, x: 28, y: 11 },
    { sprite: bfShadowWide, x: 25, y: 48 },
    { sprite: bfTortoise, x: 26, y: 33 },
    { sprite: bfConfetti, x: 29, y: 24 },
    { sprite: hareAsleep, x: 0, y: 46 },
    { sprite: bfSnore, x: 4, y: 41, motion: { kind: 'rise', amp: 6, periodMs: 2600 } },
    { sprite: bfSnoreBig, x: 9, y: 36, motion: { kind: 'rise', amp: 6, periodMs: 2600, phase: 0.5 } },
  ],
};

/** The capstone emblem: a crown, a bolt, a sheep and a coaster car from earlier jars, piled together. */
const emblemTrophies: PixelSprite = {
  id: 'bf10-emblem-trophies',
  name: 'bf10-emblem-trophies',
  tags: ['emblem', 'bf', 'lesson-10'],
  blurb: "Lesson 10's emblem: the jar that keeps them all, a crown, a bolt, a sheep and a coaster car.",
  rows: [
    '...........OO...',
    '..........OyO...',
    'O..O..O..OyGO...',
    'yO.y.Oy.OyGO....',
    'GyGGGyG.OyyyyO..',
    'GRGBGRG..OOyGO..',
    'yyyyyyy...OyO...',
    'OOOOOOO..OyO....',
    '.........OO.....',
    '................',
    '..DD.DD.........',
    '.DwwDwwDD.......',
    'DwWwwwwwDDDD....',
    'DwwwwwwwDXKD....',
    'DxwwwwwxDXXD.11.',
    '.DxxxxxxDDD.1RR1',
    '..DXDDXD...1RRRR',
    '..DDD.DDD..1rrrr',
    '............K.K.',
    '................',
  ],
};

/** The capstone jar's gold cap, laid over the cork: no cork speckle, a shine, a knob on top. */
const goldCap: PixelSprite = {
  id: 'bf10-gold-cap',
  name: 'bf10-gold-cap',
  tags: ['keepsake', 'bf10'],
  rows: [
    '.....yy.....',
    '....OGGO....',
    '.OOOOOOOOOO.',
    'OWyyyyyyyGgO',
    'OyGGGGGGGGgO',
    '.OyGGGGGGgO.',
    '.OGGGGGGggO.',
    '.OOOOOOOOOO.',
  ],
};

/** A prize rosette on the jar's string, hung where the paper tag goes, swaying. */
const rosette: PixelSprite = {
  id: 'bf10-rosette',
  name: 'bf10-rosette',
  tags: ['keepsake', 'bf10'],
  rows: [
    'O.........',
    '.OO.......',
    '...OO.....',
    '....rRRRr.',
    '...rRyGGRr',
    '...RyGGGgR',
    '...RGGGggR',
    '...rRGggRr',
    '....rRRRr.',
    '....RR.RR.',
    '....Rr.rR.',
    '....R...R.',
  ],
  frames: [
    [
      'O.........',
      '.OO.......',
      '...OO.....',
      '....rRRRr.',
      '...rRyGGRr',
      '...RyGGGgR',
      '...RGGGggR',
      '...rRGggRr',
      '....rRRRr.',
      '....RR.RR.',
      '....Rr.rR.',
      '....R...R.',
    ],
    [
      'O.........',
      'O.........',
      '.O........',
      '..OrRRRr..',
      '..rRyGGRr.',
      '..RyGGGgR.',
      '..RGGGggR.',
      '..rRGggRr.',
      '...rRRRr..',
      '...RR.RR..',
      '...Rr.rR..',
      '...R...R..',
    ],
  ],
  frameMs: 900,
};

const jar = bfKeepsake(
  'bf10-finish',
  'A glass jar with a gold cap and a prize rosette, holding a crown, a lightning bolt, a sheep and a coaster car from earlier lessons, with bubbles rising and sparkles around it.',
  emblemTrophies,
);

/** The pathway jar, made the capstone's: the rosette replaces the paper tag, the gold cap goes on. */
export const bf10Finish: SceneArt = {
  ...jar,
  layers: [
    { sprite: goldCap, x: 18, y: 0 },
    { sprite: rosette, x: 32, y: 10 },
    ...jar.layers.filter((layer) => layer.sprite.id !== 'bf-keepsake-tag'),
  ],
};

export const art: LessonArtSet = { opener: bf10Opener, backdrop: bfBackdropLit, finish: bf10Finish };
