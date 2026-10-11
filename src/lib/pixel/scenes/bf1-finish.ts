/**
 * Behavioral Finance lesson 1 keepsake, and the pathway's keepsake SHAPE: a specimen jar.
 *
 * Every lesson in this pathway catches one mental shortcut and keeps it: a corked glass jar with a
 * paper tag on a string, the lesson's emblem (bf-kit.ts) floating inside it. Lesson 1 caught
 * System 1, so its jar holds a crackling bolt of lightning. Drawn for the lesson-complete screen at
 * 3pt/px, 48x40 like the pilot. Base = the jar: cork, lip ring, glass edges and highlights, the
 * interior left clear so the page shows through as glass. The tag sways, the emblem floats on a slow
 * bob, bubbles rise inside and sparkles flare outside.
 *
 * Lessons 2 to 25 call bfKeepsake with their own id, label and emblem and change nothing else.
 */
import type { PixelSprite } from '../types';
import { bfBubble, bfEmblemBolt, bfGlint, bfLater, bfSparkle } from './bf-kit';
import type { SceneArt } from './types';

const jar: PixelSprite = {
  id: 'bf-keepsake-jar',
  name: 'jar',
  tags: ['keepsake', 'bf'],
  blurb: "The specimen jar: cork, lip ring, glass, the string's knot at the neck.",
  rows: [
    '................................................',
    '................................................',
    '...................OOOOOOOOOO...................',
    '..................OyyyGGGGGGgO..................',
    '..................OGGGGOGGGGgO..................',
    '...................OGGGGGGOgO...................',
    '...................OgGOGGGGgO...................',
    '...................OOOOOOOOOO...................',
    '................wwwwwwwwwwwwwwww................',
    '................XxxxxxxxxxxxxxxX................',
    '.................XXXXXXXXXXXXXX.................',
    '.................x............X.................',
    '.................x............X.................',
    '...............xx..............XX...............',
    '.............xx..................XX.............',
    '............x..w...................X............',
    '............x.w....................X............',
    '...........x........................X...........',
    '...........x.w......................X...........',
    '...........x.w......................X...........',
    '...........x.w.x....................X...........',
    '...........x.w.x....................X...........',
    '...........x.w.x....................X...........',
    '...........x.w.x....................X...........',
    '...........x.w......................X...........',
    '...........x.w......................X...........',
    '...........x.w......................X...........',
    '...........x.w....................x.X...........',
    '...........x.w....................x.X...........',
    '...........x.w....................x.X...........',
    '...........x.w....................x.X...........',
    '...........x......................x.X...........',
    '...........x........................X...........',
    '...........x........................X...........',
    '...........x........................X...........',
    '............x......................X............',
    '............XX.XXXXXXXXXXXXXXXXXX.XX............',
    '..............XXXXXXXXXXXXXXXXXXXX..............',
    '................................................',
    '................................................',
  ],
};

const tag: PixelSprite = {
  id: 'bf-keepsake-tag',
  name: 'tag',
  tags: ['keepsake', 'bf'],
  blurb: "The paper tag on its string, swaying.",
  rows: [
    'O.........',
    '.OO.......',
    '...OOOOOO.',
    '..OwwwKwwO',
    '..OwwwwwwO',
    '..OwPPPxwO',
    '..OwxxxxwO',
    '..OwwwwwxO',
    '...OOOOOO.',
    '..........',
  ],
  frames: [
    [
      'O.........',
      '.OO.......',
      '...OOOOOO.',
      '..OwwwKwwO',
      '..OwwwwwwO',
      '..OwPPPxwO',
      '..OwxxxxwO',
      '..OwwwwwxO',
      '...OOOOOO.',
      '..........',
    ],
    [
      'O.........',
      'O.........',
      '.O........',
      '..OOOOOO..',
      '.OwwwKwwO.',
      '.OwwwwwwO.',
      '.OwPPPxwO.',
      '.OwxxxxwO.',
      '.OwwwwwxO.',
      '..OOOOOO..',
    ],
  ],
  frameMs: 900,
};

/** Where an emblem floats: the centre of the jar's body, in scene pixels. */
const EMBLEM_CENTRE = { x: 24, y: 25 };

const sparkleLater = bfLater(bfSparkle, 'bf-keepsake-sparkle-later', 2, 380);

/**
 * A Behavioral Finance keepsake: the jar with `emblem` floating in it. Keep emblems within 16x20 so
 * they clear the glass at the top of their bob.
 */
export function bfKeepsake(id: string, label: string, emblem: PixelSprite): SceneArt {
  const ex = EMBLEM_CENTRE.x - Math.floor(emblem.rows[0].length / 2);
  const ey = EMBLEM_CENTRE.y - Math.floor(emblem.rows.length / 2);
  return {
    id,
    label,
    width: 48,
    height: 40,
    base: jar,
    layers: [
      { sprite: tag, x: 32, y: 10 },
      { sprite: bfBubble, x: 15, y: 31, motion: { kind: 'rise', amp: 9, periodMs: 3200, phase: 0.1 } },
      { sprite: bfBubble, x: 30, y: 33, motion: { kind: 'rise', amp: 12, periodMs: 4100, phase: 0.55 } },
      { sprite: emblem, x: ex, y: ey, motion: { kind: 'bob', amp: 1, periodMs: 2600 } },
      { sprite: bfGlint, x: 13, y: 14, motion: { kind: 'twinkle', periodMs: 2200, phase: 0.3, min: 0.2 } },
      { sprite: bfSparkle, x: 3, y: 15, motion: { kind: 'twinkle', periodMs: 1700, min: 0.45 } },
      { sprite: sparkleLater, x: 38, y: 28, motion: { kind: 'twinkle', periodMs: 2100, phase: 0.5, min: 0.45 } },
    ],
  };
}

export const bf1Finish: SceneArt = bfKeepsake(
  'bf1-finish',
  'A corked glass jar with a paper tag, holding a crackling gold bolt of lightning, with bubbles rising inside and sparkles around it.',
  bfEmblemBolt,
);
