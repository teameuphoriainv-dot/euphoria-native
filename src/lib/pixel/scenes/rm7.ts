/**
 * Risk Management lesson 7 opener, Fixed Income Risk & Duration: a seesaw on a barrel, a gold rate
 * weight marked % on one end and a bond scroll on the other. It rocks, and whenever rates go up the
 * bond goes down; the plank is long because duration is the lever that makes a small rate move a
 * big price move. The chart pinned behind is that lever counted out: a 1% rise costs a 2, 5, 10 and
 * 30 year bond more and more. The keeper points it out under a calm night. Moving: the seesaw, the
 * ship, the swell, a gull, the stars.
 */
import type { PixelSprite } from '../types';
import { rmBackdrop } from './rm-backdrop';
import { RM_PALETTE, rmCompose, rmGull, rmKeepsake, rmShip, rmStamp, rmWatchRoom } from './rm-kit';
import { rmCalmWindow, rmKeeperRaise, rmPlot, rmStar, rmSwellCalm } from './rm-kit-a';
import type { RmPoint } from './rm-kit-a';
import type { LessonArtSet, SceneArt } from './types';

/** The rate: a gold weight marked %. 8x8. */
const rateWeight: PixelSprite = {
  id: 'rm7-opener-rate-weight',
  name: 'rate weight',
  tags: ['scene', 'rm7'],
  rows: [
    '.OOOOOO.',
    'OGyyyGGO',
    'OKKGGKGO',
    'OKKGKGGO',
    'OGGKGGGO',
    'OGKGKKGO',
    'OKGGKKGO',
    'OOOOOOOO',
  ],
};

/** The bond: a scroll with a line of writing, tied with a red ribbon. 11x6. */
const bondScroll: PixelSprite = {
  id: 'rm7-opener-bond',
  name: 'bond scroll',
  tags: ['scene', 'rm7'],
  rows: [
    '.xwwwRwwwx.',
    'xwwwwRwwwwx',
    'XwKKwRwKKwX',
    'XwwwRRRwwwX',
    'xwwwwRwwwwx',
    '.xwwwRwwwx.',
  ],
};

/**
 * One frame of the seesaw: the plank tipped so its right end sits `tip` pixels from level (negative
 * is up), the weight and the scroll riding its ends. 40x21; the plank rests on the barrel at (20, 15).
 */
function seesawFrame(tip: number): string[] {
  const plankTop = (x: number) => 13 + Math.round(((x - 20.5) / 18.5) * tip);
  const plank: RmPoint[] = [];
  for (let x = 2; x <= 39; x++) {
    const end = x === 2 || x === 39;
    plank.push([x, plankTop(x), end ? 'D' : 'x'], [x, plankTop(x) + 1, end ? 'D' : 'X'], [x, plankTop(x) + 2, 'D']);
  }
  return rmStamp(rmStamp(rmPlot(40, 21, plank), rateWeight, 2, plankTop(6) - 8), bondScroll, 28, plankTop(33) - 6);
}

/** The seesaw rocking: rates up and the bond down, level, then the other way. Framed, 40x21. */
const seesaw: PixelSprite = {
  id: 'rm7-opener-seesaw',
  name: 'seesaw',
  tags: ['scene', 'rm7'],
  rows: seesawFrame(5),
  frames: [seesawFrame(5), seesawFrame(0), seesawFrame(-5), seesawFrame(0)],
  frameMs: 620,
};

/** The barrel the plank pivots on. 14x10. */
const barrel: PixelSprite = {
  id: 'rm7-opener-barrel',
  name: 'barrel',
  tags: ['scene', 'rm7'],
  rows: [
    '..OOOOOOOOOO..',
    '.OGGGGGGGGGGO.',
    'ODDDDDDDDDDDDO',
    'OgGggggggggGgO',
    'OgGggggggggGgO',
    'ODDDDDDDDDDDDO',
    'OgGggggggggGgO',
    'OgGggggggggGgO',
    '.ODDDDDDDDDDO.',
    '..OOOOOOOOOO..',
  ],
};

/** The duration chart: four maturities, each bar the price lost to a 1% rate rise. 16x13. */
const durationChart: PixelSprite = {
  id: 'rm7-opener-duration-chart',
  name: 'duration chart',
  tags: ['scene', 'rm7'],
  rows: [
    '.......RR.......',
    '.wwwwwwrrwwwwwx.',
    '.wwwwwwwwwwwwwx.',
    '.KKKKKKKKKKKKKx.',
    '.wRRwRRwRRwRRwx.',
    '.wwwwRRwRRwRRwx.',
    '.wwwwRRwRRwRRwx.',
    '.wwwwwwwRRwRRwx.',
    '.wwwwwwwwwwRRwx.',
    '.wwwwwwwwwwRRwx.',
    '.wwwwwwwwwwRRwx.',
    '.wwwwwwwwwwRRwx.',
    '.xxxxxxxxxxxxxx.',
  ],
};

/** Floor shadows under the barrel and the keeper. */
const floorShadow: PixelSprite = {
  id: 'rm7-opener-floor-shadow',
  name: 'rm7-opener-floor-shadow',
  tags: ['scene', 'rm7'],
  palette: RM_PALETTE,
  rows: [
    '................................ZZZZZZZZZZZZZZZ',
    '..................................ZZZZZZZZZZZ..',
    '.ZZZZZZZZZZZZ..................................',
  ],
};

const base = rmCompose('rm7-opener-base', rmWatchRoom(80, 60, 50), [
  [rmCalmWindow, 36, 5],
  [durationChart, 9, 8],
  [floorShadow, 16, 52],
  [barrel, 16, 44],
]);

export const rm7Opener: SceneArt = {
  id: 'rm7-opener',
  label: 'A seesaw on a barrel rocks with a gold percent weight on one end and a bond scroll on the other, beside a chart of longer bonds losing more, as the keeper points under a calm moonlit window.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: rmStar, x: 44, y: 9, motion: { kind: 'twinkle', periodMs: 3400, min: 0.2 } },
    { sprite: rmStar, x: 57, y: 13, motion: { kind: 'twinkle', periodMs: 4200, min: 0.2, phase: 0.5 } },
    { sprite: rmGull, x: 49, y: 11, motion: { kind: 'drift', amp: 3, periodMs: 6200 } },
    { sprite: rmShip, x: 63, y: 15, motion: { kind: 'bob', amp: 1, periodMs: 3200 } },
    { sprite: rmSwellCalm, x: 41, y: 25, motion: { kind: 'drift', amp: 2, periodMs: 5200 } },
    { sprite: seesaw, x: 2, y: 28 },
    { sprite: rmKeeperRaise, x: 44, y: 24 },
  ],
};

/** Lesson 7's emblem: a seesaw on its fulcrum, the gold rate weight up and the bond scroll down. 16x10. */
const emblemSeesaw: PixelSprite = {
  id: 'rm7-emblem-seesaw',
  name: 'seesaw',
  tags: ['rm', 'emblem', 'lesson 7'],
  rows: [
    'OOOO............',
    'OGyO............',
    'OGGO............',
    'xxxx........xwx.',
    'DDDDxxxx...xwRwx',
    '....DDDDxxxxxwx.',
    '.......ODDDDxxxx',
    '......OGO...DDDD',
    '.....OGGGO......',
    '....OOOOOOO.....',
  ],
};

export const rm7Finish: SceneArt = rmKeepsake(
  'rm7-finish',
  'A red and white life ring hanging from a rope, with a seesaw at its center tipping a gold rate weight against a bond scroll.',
  emblemSeesaw,
);

export const art: LessonArtSet = { opener: rm7Opener, backdrop: rmBackdrop, finish: rm7Finish };
