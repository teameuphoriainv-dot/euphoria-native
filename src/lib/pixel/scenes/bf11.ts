/**
 * Behavioral Finance lesson 11: anchoring bias and price perception, inside the investor's head.
 *
 * Built on bfMindRoom. Through the left eye the price peaks on a dashed gold line, the 52-week high,
 * with a little anchor hanging off its end, then falls far below it; through the right eye a price tag
 * says the same thing the shop's way: 100 struck through, 70. In the room System 1 is literally
 * anchored: the hare reaches and strains forward, sweating, a chain on its ankle running back to an
 * iron anchor, so every step is insufficient adjustment. The tortoise walks in with the fix, a key.
 *
 * The keepsake jar holds a brass anchor.
 */
import type { PixelSprite } from '../types';
import {
  bfConsoleLights,
  bfHareSlam,
  bfLater,
  bfMindRoom,
  bfShadowNarrow,
  bfShadowWide,
  bfStar,
  bfStarBig,
  bfTortoise,
} from './bf-kit';
import { BF_TORTOISE_MOUTH, bfRecolor, bfStamp } from './bf-kit-b';
import { bfBackdrop } from './bf-backdrop';
import { bfKeepsake } from './bf1-finish';
import type { LessonArtSet, SceneArt } from './types';

/** The left eye: the 52-week high as a dashed anchor line; the price peaks on it, then falls away. */
const highChart: PixelSprite = {
  id: 'bf11-opener-high',
  name: 'bf11-opener-high',
  tags: ['scene', 'bf11'],
  rows: [
    '.................y..',
    'y.y.y.y.N.y.y.y.yyy.',
    '.......N.R.......y..',
    '.......N..R....y.y.y',
    '......N....R....yyy.',
    '.....N.....R........',
    '....N.......R.......',
    '...N.........RR.....',
    '..N............RR...',
    'NN...............RRW',
  ],
};

/** The right eye: a price tag, 100 struck through in red, 70 under it. */
const priceTag: PixelSprite = {
  id: 'bf11-opener-tag',
  name: 'bf11-opener-tag',
  tags: ['scene', 'bf11'],
  rows: [
    '...DDDDDDDDDDDD.',
    '..DwwwwwwwwwwwwD',
    '.DwwwXwwXXXwXXXD',
    'DwwwXXwwXwXwXwXD',
    'DwRRRRRRRRRRRRRD',
    'DwwwwXwwXwXwXwXD',
    'DwKwXXXwXXXwXXXD',
    'DwKwwwwwwwwwwwwD',
    'DwwwwwRRRwRRRwwD',
    'DwwwwwwwRwRwRwwD',
    'DwwwwwwRwwRwRwwD',
    '.DwwwwwRwwRwRwwD',
    '..DwwwwRwwRRRwwD',
    '...DDDDDDDDDDDD.',
  ],
};

/** The anchor: iron, ring on top, a stock across, curved arms ending in flukes. */
const anchor: PixelSprite = {
  id: 'bf11-anchor',
  name: 'bf11-anchor',
  tags: ['prop', 'bf11'],
  rows: [
    '......DDDD......',
    '.....DwxxXD.....',
    '.....Dx..XD.....',
    '......DDDD......',
    '......DwXD......',
    '..DDDDDwXDDDDD..',
    '..DwwwwwxxxxXD..',
    '..DDDDDwXDDDDD..',
    '......DwXD......',
    '......DwXD......',
    '.DD...DwXD...DD.',
    'DwXD..DwXD..DwXD',
    'DwxXD.DwXD.DwxXD',
    '.DwxXDDwXDDXxwD.',
    '..DDwwwwxxxxDD..',
    '....DDDDDDDD....',
  ],
};

/** The opener's anchor in blue steel, so it stands clear of the grey hare and the console. */
const anchorSteel = bfRecolor(anchor, 'bf11-anchor-steel', { w: 'B', x: 'B', X: 'b' });

/** The chain along the floor, from the anchor's crown to the links on the hare's ankle. */
const chain: PixelSprite = {
  id: 'bf11-chain',
  name: 'bf11-chain',
  tags: ['prop', 'bf11'],
  rows: [
    'wXwXwXw',
  ],
};

const reach = (bfHareSlam.frames ?? [bfHareSlam.rows])[2];
/** The reach with an iron band on the back ankle and the first links of chain trailing off it. */
const shackled = (rows: string[], sweatAt: number | null) =>
  rows.map((row, y) => {
    if (y === 25) return '...DwxxwDDxxxxxxxD.........';
    if (y === 26) return 'wXwXDXXD..DXxxxxxwD........';
    const dry = row.replace(/[Bb]/g, '.');
    if (sweatAt !== null && y === sweatAt) return `.B${dry.slice(2)}`;
    if (sweatAt !== null && y === sweatAt + 1) return `.b${dry.slice(2)}`;
    return dry;
  });

/** System 1 anchored: straining forward on a chain it cannot see the end of, sweat flying off. */
const hareChained: PixelSprite = {
  id: 'bf11-hare-chained',
  name: 'bf11-hare-chained',
  tags: ['character', 'bf11', 'system-1'],
  rows: shackled(reach, null),
  frames: [shackled(reach, null), shackled(reach, 7), shackled(reach, 9)],
  frameMs: 300,
};

/** The fix in the tortoise's mouth: a gold key, bow in its jaw, teeth forward. */
const key: PixelSprite = {
  id: 'bf11-key',
  name: 'bf11-key',
  tags: ['prop', 'bf11'],
  rows: [
    '.OOO........',
    'OyyGO.......',
    'Oy.gOOOOOOO.',
    'OGggGGGGGGyO',
    '.OOOOOOOGOGO',
    '.......OOOOO',
  ],
};

const tortoiseKey = bfStamp(bfTortoise, 'bf11-tortoise-key', key, BF_TORTOISE_MOUTH.x, BF_TORTOISE_MOUTH.y, BF_TORTOISE_MOUTH.dys);

const consoleLightsLater = bfLater(bfConsoleLights, 'bf11-opener-console-lights-later', 3, 570);

export const bf11Opener: SceneArt = {
  id: 'bf11-opener',
  label: "Inside an investor's head, a hare strains forward on a chain locked to a heavy anchor, the eyes show an old price high and a tag cut from 100 to 70, and a calm tortoise walks in carrying a key.",
  width: 80,
  height: 60,
  base: bfMindRoom,
  layers: [
    { sprite: bfStarBig, x: 13, y: 19, motion: { kind: 'twinkle', periodMs: 2500, min: 0.3 } },
    { sprite: bfStar, x: 68, y: 21, motion: { kind: 'twinkle', periodMs: 2000, phase: 0.4, min: 0.2 } },
    { sprite: highChart, x: 11, y: 16 },
    { sprite: priceTag, x: 51, y: 15 },
    { sprite: bfConsoleLights, x: 24, y: 34 },
    { sprite: consoleLightsLater, x: 42, y: 34 },
    { sprite: bfShadowWide, x: 1, y: 54 },
    { sprite: bfShadowNarrow, x: 55, y: 54 },
    { sprite: anchorSteel, x: 38, y: 40 },
    { sprite: chain, x: 46, y: 54 },
    { sprite: tortoiseKey, x: 0, y: 39 },
    { sprite: hareChained, x: 53, y: 28 },
  ],
};

const emblemAnchor: PixelSprite = {
  ...bfRecolor(anchor, 'bf11-emblem-anchor', { D: 'O', w: 'y', x: 'G', X: 'g' }),
  name: 'bf11-emblem-anchor',
  tags: ['emblem', 'bf', 'lesson-11'],
  blurb: "Lesson 11's emblem: the anchoring bias caught as a brass anchor.",
};

export const bf11Finish: SceneArt = bfKeepsake(
  'bf11-finish',
  'A corked glass jar with a paper tag, holding a small brass anchor, with bubbles rising inside and sparkles around it.',
  emblemAnchor,
);

export const art: LessonArtSet = { opener: bf11Opener, backdrop: bfBackdrop, finish: bf11Finish };
