/**
 * Business Strategy lesson 15 opener: the old records go into the glass.
 *
 * Built on bsStudy. The house's knowledge sits where it always has, on the shelves of an old bookcase;
 * now streams of light carry it off the shelves into a tall mirror in a gold frame, where it comes back
 * as a live chart that keeps updating. The strategist stands at the glass and points into it. Nothing
 * old is thrown out, it is carried across a step at a time, which is how the lesson says a change like
 * this succeeds. The mirror's teal glow is the brightest mark; the moonlit window sits above it. Moving:
 * the chart's bars climb and the newest point blinks, the streams run, sparks rise off the glass, the
 * strategist points and blinks, a candle burns and stars twinkle in the window.
 */
import type { PixelSprite } from '../types';
import { bsBackdrop } from './bs-backdrop';
import { bsCandle, bsLater, bsMoved, bsStar } from './bs-kit';
import { bsStrategistStand } from './bs-kit-a';
import { bsStudy } from './bs-kit-b';
import { bsKeepsake } from './bs1-finish';
import type { LessonArtSet, SceneArt } from './types';

const mirrorRows = [
  '...OOOOOOOOOOOOOO...',
  '..OyyyyyyyyyyyyyyO..',
  '.OyOOOOOOOOOOOOOOGO.',
  '.OyOttttttttttttOGO.',
  '.OyOttttttttttWtOGO.',
  '.OyOtttttttttwttOGO.',
  '.OyOttttttttwtttOGO.',
  '.OyOtttttttwttttOGO.',
  '.OyOtttttwwmmtttOGO.',
  '.OyOttttwttTTtttOGO.',
  '.OyOttwwtttTTtttOGO.',
  '.OyOtwttmmtTTtttOGO.',
  '.OyOttttTTtTTtttOGO.',
  '.OyOttttTTtTTtttOGO.',
  '.OyOtmmtTTtTTtttOGO.',
  '.OyOtTTtTTtTTtttOGO.',
  '.OyOtTTtTTtTTtttOGO.',
  '.OyOtTTtTTtTTtttOGO.',
  '.OyOttttttttttttOGO.',
  '.OyOOOOOOOOOOOOOOGO.',
  '.OGGGGGGGGGGGGGGGGO.',
  '.OOOOOOOOOOOOOOOOOO.',
  '........OOOO........',
  '.......O....O.......',
  '......OOOOOOOO......',
  '......O......O......',
  '.....O........O.....',
];

const mirror: PixelSprite = {
  id: 'bs15-mirror',
  name: 'mirror',
  tags: [],
  blurb: 'A tall mirror in a gold frame on a stand, its glass a teal screen with a live chart: three bars and a rising line. The bars climb and the newest point blinks. Feet on the bottom row.',
  rows: mirrorRows,
  frames: [
    mirrorRows,
    bsMoved(mirrorRows, {
      4: '.OyOttttttttttwtOGO.',
      7: '.OyOtttttttwmtttOGO.',
      8: '.OyOtttttwwTTtttOGO.',
      10: '.OyOttwwmmtTTtttOGO.',
      11: '.OyOtwttTTtTTtttOGO.',
      13: '.OyOtmmtTTtTTtttOGO.',
      14: '.OyOtTTtTTtTTtttOGO.',
    }),
    bsMoved(mirrorRows, {
      6: '.OyOtttttttmwtttOGO.',
      7: '.OyOtttttttwTtttOGO.',
      8: '.OyOtttttwwTTtttOGO.',
      9: '.OyOttttwmtTTtttOGO.',
      10: '.OyOttwwTTtTTtttOGO.',
      11: '.OyOtwttTTtTTtttOGO.',
      12: '.OyOtmmtTTtTTtttOGO.',
      13: '.OyOtTTtTTtTTtttOGO.',
      14: '.OyOtTTtTTtTTtttOGO.',
    }),
    bsMoved(mirrorRows, {
      4: '.OyOttttttttttwtOGO.',
      7: '.OyOtttttttwmtttOGO.',
      8: '.OyOtttttwwTTtttOGO.',
      9: '.OyOttttwmtTTtttOGO.',
      10: '.OyOttwwTTtTTtttOGO.',
      11: '.OyOtwttTTtTTtttOGO.',
      13: '.OyOtmmtTTtTTtttOGO.',
      14: '.OyOtTTtTTtTTtttOGO.',
    }),
    bsMoved(mirrorRows, {
      10: '.OyOttwwmmtTTtttOGO.',
      11: '.OyOtwttTTtTTtttOGO.',
    }),
    bsMoved(mirrorRows, {
      4: '.OyOttttttttttwtOGO.',
      7: '.OyOtttttttwmtttOGO.',
      8: '.OyOtttttwwTTtttOGO.',
      13: '.OyOtmmtTTtTTtttOGO.',
      14: '.OyOtTTtTTtTTtttOGO.',
    }),
  ],
  frameMs: 520,
};

const streamRows = [
  'm...T...m.',
  '..w...m...',
  'T...m...T.',
];

/** The stream moved `by` columns along, wrapping round, so the points run right. */
const streamShifted = (by: number) => streamRows.map((row) => row.slice(-by) + row.slice(0, -by));

const stream: PixelSprite = {
  id: 'bs15-stream',
  name: 'stream',
  tags: [],
  blurb: 'Records as points of light, running right from the bookcase into the glass.',
  rows: streamRows,
  frames: [streamRows, streamShifted(1), streamShifted(2), streamShifted(3)],
  frameMs: 200,
};

const candleStand: PixelSprite = {
  id: 'bs15-candle-stand',
  name: 'candle-stand',
  tags: [],
  blurb: 'An iron candle stand, foot on the bottom row; bsCandle stands on top at (x, y - 7).',
  rows: [
    '.OGO.',
    '..D..',
    '..D..',
    '..D..',
    '..D..',
    '..D..',
    '..D..',
    '..D..',
    '..D..',
    '..D..',
    '.DXD.',
    'DDDDD',
  ],
};

const spark: PixelSprite = {
  id: 'bs15-spark',
  name: 'spark',
  tags: [],
  blurb: 'A mote of teal light off the glass, for a rise layer.',
  rows: [
    'm',
  ],
};

const streamLater = bsLater(stream, 'bs15-stream-later', 2, 230);

export const bs15Opener: SceneArt = {
  id: 'bs15-opener',
  label: 'In a tower study, streams of light run from the old books on their full shelves into a tall glowing mirror that shows a live chart, while a strategist points at it.',
  width: 80,
  height: 60,
  base: bsStudy,
  layers: [
    { sprite: bsStar, x: 35, y: 10, motion: { kind: 'twinkle', periodMs: 2200, min: 0.2 } },
    { sprite: bsStar, x: 37, y: 14, motion: { kind: 'twinkle', periodMs: 2800, phase: 0.4, min: 0.2 } },
    { sprite: bsStar, x: 45, y: 15, motion: { kind: 'twinkle', periodMs: 2500, phase: 0.75, min: 0.2 } },
    { sprite: mirror, x: 30, y: 17 },
    { sprite: spark, x: 34, y: 16, motion: { kind: 'rise', amp: 5, periodMs: 2200 } },
    { sprite: spark, x: 44, y: 16, motion: { kind: 'rise', amp: 6, periodMs: 2700, phase: 0.5 } },
    { sprite: stream, x: 21, y: 24 },
    { sprite: streamLater, x: 21, y: 31 },
    { sprite: candleStand, x: 72, y: 32 },
    { sprite: bsCandle, x: 72, y: 25 },
    { sprite: bsStrategistStand, x: 48, y: 13 },
  ],
};

const emblem: PixelSprite = {
  id: 'bs15-emblem-scroll',
  name: 'emblem-scroll',
  tags: [],
  blurb: 'Lesson 15 emblem, 16x16: an old scroll whose open end breaks up into teal squares of light.',
  rows: [
    '................',
    '................',
    '.OO.........mT..',
    'OGyO......T.....',
    'OyyOyyyyyy..m.T.',
    'OyyOyOOOyy.T....',
    'OyyOyyyyy.T..m..',
    'OyyOyOOOy.m.T...',
    'OyyOyyyyyT..m...',
    'OyyOyOOO.m.T..T.',
    'OyyOyyyyT.m.....',
    'OyyOyOOm.T..m...',
    'OyyOyyyyT..T....',
    'OGgOGGGG.m......',
    '.OO.............',
    '................',
  ],
};

export const bs15Finish: SceneArt = bsKeepsake(
  'bs15-finish',
  'A purple house banner on a gold rod, its roundel showing an old scroll breaking up into teal squares of light.',
  emblem,
);

export const art: LessonArtSet = { opener: bs15Opener, backdrop: bsBackdrop, finish: bs15Finish };
