/**
 * Behavioral Finance lesson 15: the narrative fallacy and storytelling in markets, on the fairground stage.
 *
 * A story stock sold the way a fairground sells anything: System 1 is the storyteller, the hare at a
 * lectern with a giant open storybook, fist up and then thrown out at the crowd, mouth going. Out of the
 * pages a rocket lifts off for the moon, which is what the story says the price will do. The tortoise
 * stands by with the other kind of evidence, its clipboard turned into a bar chart: data, not stories.
 * The stage and its lights are bf-kit-a.ts; the gesture is bfHareGesture (bf-kit-b.ts).
 *
 * The keepsake jar holds a storybook.
 */
import type { PixelSprite } from '../types';
import { bfShadowNarrow, bfShadowWide, bfSparkle, bfTortoisePlan } from './bf-kit';
import { bfFairground, bfFairgroundLayers, bfMirror } from './bf-kit-a';
import { BF_TORTOISE_MOUTH, bfHareGesture, bfStamp } from './bf-kit-b';
import { bfBackdrop } from './bf-backdrop';
import { bfKeepsake } from './bf1-finish';
import type { LessonArtSet, SceneArt } from './types';

/** The giant storybook open on its lectern: a rocket drawn on the left page, lines of story on the right. */
const lectern: PixelSprite = {
  id: 'bf15-lectern',
  name: 'bf15-lectern',
  tags: ['prop', 'bf15'],
  rows: [
    '.DDDDDDDD..DDDDDDDD.',
    'DwwwwwwwwDDwwwwwwwwD',
    'DwwwRwwwwDDwxxxxxxwD',
    'DwwRRRwwwDDwwwwwwwwD',
    'DwwwBwwwwDDwxxxxxxwD',
    'DwwwwwwwwDDwwwwwwwwD',
    'DwwRwRwwwDDwxxxxxwwD',
    'DwwwGwwwwDDwwwwwwwwD',
    'DwwwywwwwDDwxxxxxxwD',
    'RRRRRRRRRDDRRRRRRRRR',
    '.rrrrrrrrrrrrrrrrrr.',
    '..OOOOOOOOOOOOOOOO..',
    '.......OgGGO........',
    '.......OgGGO........',
    '.......OgGGO........',
    '.......OgGGO........',
    '.......OgGGO........',
    '.....OOOOOOOOO......',
    '....OgggggggggO.....',
  ],
};

/** The story taking off: a rocket lifting out of the pages, flame flickering. */
const rocket: PixelSprite = {
  id: 'bf15-rocket',
  name: 'bf15-rocket',
  tags: ['prop', 'bf15'],
  rows: [
    '..R..',
    '.RRR.',
    '.wBw.',
    '.www.',
    'RwwwR',
    'R.G.R',
    '..y..',
  ],
  frames: [
    [
      '..R..',
      '.RRR.',
      '.wBw.',
      '.www.',
      'RwwwR',
      'R.G.R',
      '..y..',
    ],
    [
      '..R..',
      '.RRR.',
      '.wBw.',
      '.www.',
      'RwwwR',
      'RGyGR',
      '.G.G.',
    ],
  ],
  frameMs: 200,
};

/** Where the story says the price is going. */
const moon: PixelSprite = {
  id: 'bf15-moon',
  name: 'bf15-moon',
  tags: ['prop', 'bf15'],
  rows: [
    '..yyy.',
    '.yWy..',
    'yWy...',
    'yW....',
    'yWy...',
    '.yWy..',
    '..yyy.',
  ],
};

/** The tortoise's checklist, turned into a bar chart for the clipboard: the data. */
const bars: PixelSprite = {
  id: 'bf15-bars',
  name: 'bf15-bars',
  tags: ['prop', 'bf15'],
  rows: [
    'wwwww',
    'wwwwN',
    'wwNwN',
    'RwNwN',
    'RwNwN',
    'XXXXX',
  ],
};

const tortoiseData = bfStamp(bfTortoisePlan, 'bf15-tortoise-data', bars, BF_TORTOISE_MOUTH.x + 1, BF_TORTOISE_MOUTH.y + 2, BF_TORTOISE_MOUTH.dys);

/** System 1 telling the tale, facing the book and the crowd. */
const hareTeller = bfMirror(bfHareGesture, 'bf15-hare-teller');

export const bf15Opener: SceneArt = {
  id: 'bf15-opener',
  label: 'At a night fairground, a hare at a lectern tells a story from a giant open book as a rocket lifts off its pages toward the moon, while a calm tortoise holds up a clipboard with a bar chart.',
  width: 80,
  height: 60,
  base: bfFairground,
  layers: [
    ...bfFairgroundLayers,
    { sprite: moon, x: 30, y: 12 },
    { sprite: bfShadowWide, x: 1, y: 55 },
    { sprite: bfShadowNarrow, x: 58, y: 55 },
    { sprite: lectern, x: 38, y: 37 },
    { sprite: rocket, x: 44, y: 26, motion: { kind: 'rise', amp: 9, periodMs: 2400 } },
    { sprite: bfSparkle, x: 36, y: 32, motion: { kind: 'twinkle', periodMs: 1500, min: 0.4 } },
    { sprite: tortoiseData, x: 0, y: 40 },
    { sprite: hareTeller, x: 53, y: 28 },
  ],
};

const emblemStorybook: PixelSprite = {
  id: 'bf15-emblem-storybook',
  name: 'bf15-emblem-storybook',
  tags: ['emblem', 'bf', 'lesson-15'],
  blurb: "Lesson 15's emblem: the narrative fallacy caught as an open storybook with a star on its page.",
  rows: [
    '.DDDDDD..DDDDDD.',
    'DwwwwwwDDwwwwwwD',
    'DwwwywwDDwxxxxwD',
    'DwwyGywDDwwwwwwD',
    'DwyGWGyDDwxxxxwD',
    'DwwyGywDDwwwwwwD',
    'DwwwywwDDwxxxwwD',
    'DwwwwwwDDwwwwwwD',
    'DwxxxxwDDwxxxxwD',
    'DwwwwwwDDwwwwwwD',
    'RRRRRRRDDRRRRRRR',
    '.rrrrrrRRrrrrrr.',
    '.......Rr.......',
    '.......Rr.......',
    '......R..r......',
  ],
};

export const bf15Finish: SceneArt = bfKeepsake(
  'bf15-finish',
  'A corked glass jar with a paper tag, holding a little open storybook with a gold star on its page and a red ribbon, with bubbles rising inside and sparkles around it.',
  emblemStorybook,
);

export const art: LessonArtSet = { opener: bf15Opener, backdrop: bfBackdrop, finish: bf15Finish };
