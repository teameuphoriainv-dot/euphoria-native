/**
 * Business Strategy lesson 1 opener: the war room, where strategy means deciding where to stand.
 *
 * Put together from bs-kit on its empty war room. Porter's five forces hang on the wall as a chart,
 * the castle model on the table sits inside its moat (the lesson's word for an advantage rivals cannot
 * cross), rival pieces gather on the left, and the strategist pushes our piece into place. The
 * parchment is the brightest broad surface; the felt sits a step under it so the model and the pieces
 * read. Only small layers move: the forces press in, the strategist pushes and blinks, the flames
 * flicker, the banner flutters, light runs round the moat, embers rise and two stars twinkle.
 */
import {
  bsCandle,
  bsEmber,
  bsFiveForces,
  bsMoatKeep,
  bsPawn,
  bsPawnRival,
  bsScroll,
  bsStar,
  bsStrategist,
  bsTorch,
  bsWallBanner,
  bsWarRoom,
  bsWarTable,
} from './bs-kit';
import type { SceneArt } from './types';

export const bs1Opener: SceneArt = {
  id: 'bs1-opener',
  label: "A strategist leans over a war table, pushing a game piece toward a model castle ringed by its moat, under a chart of Porter's five forces.",
  width: 80,
  height: 60,
  base: bsWarRoom,
  layers: [
    { sprite: bsWallBanner, x: 3, y: 1 },
    { sprite: bsScroll, x: 21, y: 1 },
    { sprite: bsFiveForces, x: 25, y: 6 },
    { sprite: bsTorch, x: 57, y: 9 },
    { sprite: bsEmber, x: 59, y: 7, motion: { kind: 'rise', amp: 4, periodMs: 1500 } },
    { sprite: bsEmber, x: 58, y: 8, motion: { kind: 'rise', amp: 5, periodMs: 2100, phase: 0.5 } },
    { sprite: bsStar, x: 74, y: 7, motion: { kind: 'twinkle', periodMs: 1900, min: 0.2 } },
    { sprite: bsStar, x: 73, y: 10, motion: { kind: 'twinkle', periodMs: 2500, phase: 0.6, min: 0.2 } },
    { sprite: bsWarTable, x: 9, y: 37 },
    { sprite: bsMoatKeep, x: 25, y: 29 },
    { sprite: bsPawnRival, x: 18, y: 38 },
    { sprite: bsPawnRival, x: 15, y: 41 },
    { sprite: bsPawnRival, x: 21, y: 42 },
    { sprite: bsPawn, x: 50, y: 38 },
    { sprite: bsCandle, x: 11, y: 33 },
    { sprite: bsStrategist, x: 52, y: 17 },
  ],
};
