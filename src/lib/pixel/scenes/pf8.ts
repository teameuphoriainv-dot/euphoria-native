/**
 * Personal Finance lesson 8, Insurance Essentials: a small premium against the big disaster.
 *
 * A new set, the living room: an orchid sofa with the cat asleep on it, a floor lamp, a smoke alarm
 * blinking on the ceiling, and on the walls the three things the lesson insures, framed: the home,
 * the car, a heart for health. The figure stands behind the sofa holding up a teal shield with a
 * check on it, the cover between all of that and the bill. Moving: the alarm's light, a glint on the
 * shield, the lamp, a lit window in the house picture, the cat's z.
 */
import type { PixelSprite } from '../types';
import { pfCat, pfCompose, pfKitchen, pfLampGlow, pfSparkle, pfZzz } from './pf-kit';
import { pfSaverHold } from './pf-kit-a';
import { pfKeepsake } from './pf1-finish';
import { pfBackdrop } from './pf-backdrop';
import type { LessonArtSet, SceneArt } from './types';

/** The shield, held in front of the chest: gold rim, teal face, a white check. */
const shield: PixelSprite = {
  id: 'pf8-shield',
  name: 'shield',
  tags: ['scene', 'pf'],
  rows: [
    'OOOOOOOOOOOO',
    'OyGGGGGGGGgO',
    'OGmTTTTTTTgO',
    'OGTTTTTTwTgO',
    'OGTTTTTwwTgO',
    'OGTwTTwwTTgO',
    'OGTwwwwTTTgO',
    '.OGTwwTTTgO.',
    '.OGTTTTTTgO.',
    '..OGTTTTgO..',
    '...OGTTgO...',
    '....OOOO....',
  ],
};

/** A two-seat orchid sofa, `width` wide (even); its back's top edge is row 0, its legs the last two rows. */
function sofa(width: number): PixelSprite {
  const half = (width - 8) / 2;
  const split = (edge: string, fill: string) => edge + fill.repeat(half) + 'EE' + fill.repeat(half) + edge;
  return {
    id: `pf8-sofa-${String(width)}`,
    name: 'sofa',
    tags: ['scene', 'pf'],
    rows: [
      '..' + 'E'.repeat(width - 4) + '..',
      '..' + split('E', 'q') + '..',
      '..' + split('E', 'P') + '..',
      '..' + split('E', 'P') + '..',
      'EE' + split('E', 'P') + 'EE',
      'Eq' + split('E', 'p') + 'qE',
      'EP' + 'E'.repeat(width - 4) + 'PE',
      'EP' + split('E', 'q') + 'PE',
      'EP' + split('E', 'P') + 'PE',
      'EP' + split('E', 'P') + 'PE',
      'Ep' + split('E', 'p') + 'pE',
      'E'.repeat(width),
      '.OO' + '.'.repeat(width - 6) + 'OO.',
      '.OO' + '.'.repeat(width - 6) + 'OO.',
    ],
  };
}

/** The three things the lesson insures, each in a gold frame. */
const homePicture: PixelSprite = {
  id: 'pf8-home-picture',
  name: 'home picture',
  tags: ['scene', 'pf'],
  rows: [
    'OOOOOOOOOOOOO',
    'OgggggggggggO',
    'OgBBBBrBBBBgO',
    'OgBBBrrrBBBgO',
    'OgBBrrrrrBBgO',
    'OgBrrrrrrrBgO',
    'OgBBwwwwwBBgO',
    'OgBBwDOywBBgO',
    'OgnnwwOwwnngO',
    'OgggggggggggO',
    'OOOOOOOOOOOOO',
  ],
};

const carPicture: PixelSprite = {
  id: 'pf8-car-picture',
  name: 'car picture',
  tags: ['scene', 'pf'],
  rows: [
    'OOOOOOOOOOOOO',
    'OgggggggggggO',
    'OgBBBBBBBBBgO',
    'OgBBRRRRBBBgO',
    'OgBRRwwRRRBgO',
    'OgRRRRRRRRRgO',
    'OgDKKDDDKKDgO',
    'OgggggggggggO',
    'OOOOOOOOOOOOO',
  ],
};

const heartPicture: PixelSprite = {
  id: 'pf8-heart-picture',
  name: 'heart picture',
  tags: ['scene', 'pf'],
  rows: [
    'OOOOOOOOOOO',
    'OgggggggggO',
    'OgksRkRRkgO',
    'OgRRRRRRRgO',
    'OgkRRRRRkgO',
    'OgkkRRRkkgO',
    'OgkkkRkkkgO',
    'OgggggggggO',
    'OOOOOOOOOOO',
  ],
};

/** The smoke alarm on the ceiling; its light is its own layer. */
const smokeAlarm: PixelSprite = {
  id: 'pf8-smoke-alarm',
  name: 'smoke alarm',
  tags: ['scene', 'pf'],
  rows: [
    '.xxxxx.',
    'xwwwwwx',
    '.xXXXx.',
  ],
};

const alarmLight: PixelSprite = {
  id: 'pf8-alarm-light',
  name: 'alarm light',
  tags: ['scene', 'pf'],
  rows: [
    'R',
  ],
};

/** A floor lamp: a lit shade on a pole, its base on the floor line (the last row). */
const floorLamp: PixelSprite = {
  id: 'pf8-floor-lamp',
  name: 'floor lamp',
  tags: ['scene', 'pf'],
  rows: [
    '..ggggg..',
    '.gyyyyyg.',
    '.gyyyyyg.',
    'gyyyyyyyg',
    'ggggggggg',
    ...Array.from({ length: 29 }, () => '....X....'),
    '..DXXXD..',
    '.DDDDDDD.',
  ],
};

/** The house picture's lit window, for a slow twinkle. */
const windowLight: PixelSprite = {
  id: 'pf8-window-light',
  name: 'window light',
  tags: ['scene', 'pf'],
  rows: [
    'y',
  ],
};

/** Lesson 8's emblem: the shield and its check. */
const emblemInsurance: PixelSprite = {
  id: 'pf8-emblem-insurance',
  name: 'pf8-emblem-insurance',
  tags: ['scene', 'pf', 'emblem'],
  rows: [
    'OOOOOOOOOOO',
    'OGTTTTTTTgO',
    'OGTTTTTwTgO',
    'OGTwTTwwTgO',
    'OGTwwwwTTgO',
    '.OGTwwTTgO.',
    '..OGTTTgO..',
    '...OGTgO...',
    '....OOO....',
  ],
};

// Order is depth: the figure behind the shield, both behind the sofa; the cat on the seat.
const base = pfCompose('pf8-opener-base', 80, 60, pfKitchen.rows, [
  [homePicture, 5, 6],
  [carPicture, 5, 20],
  [heartPicture, 53, 9],
  [smokeAlarm, 37, 0],
  [floorLamp, 67, 14],
  [pfSaverHold, 32, 12],
  [shield, 34, 24],
  [sofa(44), 18, 36],
  [pfCat, 20, 37],
]);

export const pf8Opener: SceneArt = {
  id: 'pf8-opener',
  label: 'In the living room, a person holds up a shield with a check mark behind the sofa where the cat sleeps, under framed pictures of a home, a car and a heart and a blinking smoke alarm.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: alarmLight, x: 40, y: 2, motion: { kind: 'twinkle', periodMs: 1200, min: 0.1 } },
    { sprite: pfSparkle, x: 31, y: 21, motion: { kind: 'twinkle', periodMs: 1800, min: 0.4 } },
    { sprite: pfLampGlow, x: 68, y: 19, motion: { kind: 'twinkle', periodMs: 3400, min: 0.55 } },
    { sprite: windowLight, x: 10, y: 13, motion: { kind: 'twinkle', periodMs: 2600, min: 0.3 } },
    { sprite: pfZzz, x: 19, y: 32, motion: { kind: 'rise', amp: 3, periodMs: 2800, phase: 0.3 } },
  ],
};

export const pf8Finish = pfKeepsake(
  'pf8-finish',
  'A gold house-shaped key fob with a teal roof on a key ring with a brass key, its window showing a teal shield with a white check mark, with small sparkles around it.',
  emblemInsurance,
);

export const art: LessonArtSet = { opener: pf8Opener, backdrop: pfBackdrop, finish: pf8Finish };
