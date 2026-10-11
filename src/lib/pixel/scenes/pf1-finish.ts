/**
 * Personal Finance lesson 1 keepsake, and the shape every pf lesson's keepsake shares: a gold
 * house-shaped key fob with a teal enamel roof, on a steel split ring with a brass house key.
 * Base = the ring and the key. The fob is a bobbing layer whose eyelet has a real 2x2 hole; the
 * ring's lowest band sits in the hole's top row, so at rest and at the top of the bob the fob reads
 * as hanging on the ring. The fob's window is dark enamel, and the EMBLEM is its own layer riding
 * the same bob: pfKeepsake swaps it, so lessons 2 to 25 keep the shape and change only the emblem.
 */
import type { PixelSprite } from '../types';
import { pfEmblemPillars, pfLater, pfSparkle } from './pf-kit';
import type { SceneArt, SceneMotion } from './types';

const ringAndKey: PixelSprite = {
  id: 'pf-keepsake-ring',
  name: 'ring and key',
  tags: [],
  rows: [
    '.....................wxxxxx.....................',
    '....................wwwxxxxX....................',
    '...................xww....XXX...................',
    '...................xx......XX...................',
    '..................xxx......XXX..................',
    '..................xxx......XXX..................',
    '..................xxx......OOO..................',
    '...................xX.....OyGgO.................',
    '...................XXX....OGDgO.................',
    '....................XXDDDDOggGO.................',
    '.....................DDDDDDOOO..................',
    '.............................OGgO...............',
    '.............................OGgO...............',
    '..............................OGgO..............',
    '..............................OGgO..............',
    '...............................OGgO.............',
    '...............................OGgO.............',
    '................................OGgOO...........',
    '.................................OGgGgO.........',
    '.................................OGgGgO.........',
    '..................................OGgOO.........',
    '..................................OGgGgO........',
    '...................................OGgGgO.......',
    '...................................OGgGgO.......',
    '....................................OGgOO.......',
    '.....................................OGgO.......',
    '.....................................OOO........',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
  ],
};

const fob: PixelSprite = {
  id: 'pf-keepsake-fob',
  name: 'fob',
  tags: [],
  rows: [
    '.............OO.............',
    '............G..O............',
    '............G..O............',
    '.............OO.............',
    '......OOO....OO.............',
    '......OyO..OmmttO...........',
    '......OyO.OmmTTttO..........',
    '......OyOmmTTTTTTttO........',
    '......OOmmTTTTTTTTttO.......',
    '.....OmmTTTTTTTTTTTTttO.....',
    '....OmmTTTTTTTTTTTTTTttO....',
    '..OmmTTTTTTTTTTTTTTTTTTttO..',
    '.OmmTTTTTTTTTTTTTTTTTTTTttO.',
    'OOOOOOOOOOOOOOOOOOOOOOOOOOOO',
    '..OyyyyyyyyyyyyyyyyyyyyyyO..',
    '..OyGGGGGGGGGGGGGGGGGGGGgO..',
    '..OyGGggggggggggggggggGGgO..',
    '..OyGGgKKKKKKKKKKKKKKyGGgO..',
    '..OyGGgKkkkkkkkkkkkkkyGGgO..',
    '..OyGGgKkkkkkkkkkkkkkyGGgO..',
    '..OyGGgKkkkkkkkkkkkkkyGGgO..',
    '..OyGGgKkkkkkkkkkkkkkyGGgO..',
    '..OyGGgKkkkkkkkkkkkkkyGGgO..',
    '..OyGGgKkkkkkkkkkkkkkyGGgO..',
    '..OyGGgKkkkkkkkkkkkkkyGGgO..',
    '..OyGGgKkkkkkkkkkkkkkyGGgO..',
    '..OyGGyyyyyyyyyyyyyyyyGGgO..',
    '..OyGGGGGGGGGGGGGGGGGGGGgO..',
    '..OggggggggggggggggggggggO..',
    '..OOOOOOOOOOOOOOOOOOOOOOOO..',
  ],
};

const moteGold: PixelSprite = {
  id: 'pf-keepsake-mote-gold',
  name: 'mote-gold',
  tags: [],
  rows: [
    'y',
    'G',
  ],
};

const moteTeal: PixelSprite = {
  id: 'pf-keepsake-mote-teal',
  name: 'mote-teal',
  tags: [],
  rows: [
    'm',
    'T',
  ],
};

/** Where the fob hangs, and its window's enamel inside the fob: 14x9, the most an emblem may be. */
const FOB_X = 10;
const FOB_Y = 9;
const WINDOW = { x: 7, y: 17, w: 14, h: 9 };

/** One clock for the fob and its emblem, so the emblem never slides off its window. */
const SWAY: SceneMotion = { kind: 'bob', amp: 1, periodMs: 2600 };

const sparkleLater = pfLater(pfSparkle, 'pf-keepsake-sparkle-later', 2, 410);

/**
 * The pathway keepsake around any emblem up to 14x9, centred in the fob's window. An emblem is any
 * kit sprite drawn for a dark ground; lesson 1's is the four pillars.
 */
export function pfKeepsake(id: string, label: string, emblem: PixelSprite): SceneArt {
  const w = emblem.rows[0]?.length ?? 0;
  const h = emblem.rows.length;
  if (w > WINDOW.w || h > WINDOW.h) {
    throw new Error(`${id}: emblem ${emblem.id} is ${String(w)}x${String(h)}, the fob window holds 14x9`);
  }
  return {
    id,
    label,
    width: 48,
    height: 40,
    base: ringAndKey,
    layers: [
      { sprite: fob, x: FOB_X, y: FOB_Y, motion: SWAY },
      {
        sprite: emblem,
        x: FOB_X + WINDOW.x + Math.floor((WINDOW.w - w) / 2),
        y: FOB_Y + WINDOW.y + Math.floor((WINDOW.h - h) / 2),
        motion: SWAY,
      },
      { sprite: pfSparkle, x: 3, y: 15, motion: { kind: 'twinkle', periodMs: 1700, min: 0.45 } },
      { sprite: sparkleLater, x: 41, y: 30, motion: { kind: 'twinkle', periodMs: 2000, phase: 0.5, min: 0.45 } },
      { sprite: moteGold, x: 7, y: 31, motion: { kind: 'rise', amp: 5, periodMs: 2300, phase: 0.15 } },
      { sprite: moteTeal, x: 44, y: 14, motion: { kind: 'rise', amp: 4, periodMs: 2700, phase: 0.6 } },
      { sprite: moteGold, x: 39, y: 36, motion: { kind: 'rise', amp: 4, periodMs: 2000, phase: 0.4 } },
    ],
  };
}

export const pf1Finish = pfKeepsake(
  'pf1-finish',
  'A gold house-shaped key fob with a teal roof on a key ring with a brass key, its window showing four colored pillars, with small sparkles around it.',
  pfEmblemPillars,
);
