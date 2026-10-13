/**
 * Risk Management lesson 18 opener, Model Risk & Validation: on the chart table stands a model of a
 * ship, upright on its cradle and in no weather at all, built from the blueprint pinned above it. The
 * keeper holds a magnifying glass to it, and in the lens the hull shows the crack its builder never
 * saw: independent validation, someone other than the builder looking for where the model is wrong.
 * Through the porthole the real sea is in a storm, which is what the model is for. Moving: lightning,
 * rain and the swell in the porthole, the lantern, a glint on the lens.
 */
import type { PixelSprite } from '../types';
import { rmBackdrop } from './rm-backdrop';
import { RM_PALETTE, rmChartTable, rmCompose, rmKeepsake, rmLantern, rmLater, rmLightning, rmWatchRoom } from './rm-kit';
import { rmFlip, rmGlint, rmKeeperReach, rmMark, rmPortRain, rmPortSwell, rmPorthole } from './rm-kit-a';
import { rmFill } from './rm-kit-b';
import type { LessonArtSet, SceneArt } from './types';

/** The model: a two-masted ship with its pennants, gun ports and a cradle to stand on. 23x18. */
const modelShip: PixelSprite = {
  id: 'rm18-opener-model-ship',
  name: 'model ship',
  tags: ['scene', 'rm18'],
  rows: [
    '.......O........O......',
    '.......OR.......OR.....',
    '....wwwwwwx..wwwwwwx...',
    '....wwwwwwx..wwwwwwx...',
    '....wwwwwwx..wwwwwwx...',
    '.......O........O......',
    '...wwwwwwwwxwwwwwwwwx..',
    '...wwwwwwwwxwwwwwwwwx..',
    '...wwwwwwwwxwwwwwwwwx..',
    '...wwwwwwwwxwwwwwwwwx..',
    '.......O........O......',
    'yGGGGGGGGGGGGGGGGGGGGGy',
    '.OggKggKggKggKggKggKgO.',
    '..OgggggggggggggggggO..',
    '...OgggggggggggggggO...',
    '.....OOOOOOOOOOOOO.....',
    '.......DX.....DX.......',
    '.....DDDDDDDDDDDDD.....',
  ],
};

/** The crack's path down the close-up, one x per row; where it gapes, rows 6 to 9, it is two pixels wide. */
const CRACK: Record<number, number> = { 4: 8, 5: 8, 6: 7, 7: 7, 8: 8, 9: 8, 10: 7, 11: 7 };

/**
 * What the lens shows: the hull close up, a strip of sail above its gold rail, then pale planks with
 * their seams and two small gun ports, so the black crack running down through them is the darkest
 * thing in the glass. (Dark planks with black ports read as a cracked biscuit on a phone.)
 */
function closeUp(x: number, y: number): string {
  const crack = CRACK[y];
  if (crack === x || (y >= 6 && y <= 9 && crack + 1 === x)) return 'K';
  if (y <= 3) return 'w';
  if (y === 4) return 'G';
  if (y === 7 || y === 10) return 'g';
  if ((y === 5 || y === 6) && (x === 4 || x === 11)) return 'O';
  return 'y';
}

/** The lens: a steel rim, a blue edge to the glass with a glare, and the close-up inside. 15x15. */
const LENS = Array.from({ length: 15 }, (_, y) =>
  Array.from({ length: 15 }, (_, x) => {
    const d2 = (x - 7) ** 2 + (y - 7) ** 2;
    if (d2 > 58) return '.';
    if (d2 > 47) return 'D';
    if (d2 > 35) return x + y <= 14 ? 'x' : 'X';
    if (d2 > 22) return (x === 3 && y === 4) || (x === 4 && y === 3) ? 'w' : 'B';
    return closeUp(x, y);
  }).join(''),
);

/**
 * The magnifying glass held up by its handle: the lens, a steel ferrule and a dark wooden grip
 * running down to the bottom-left pixel, which goes in the keeper's fist. 20x18.
 */
const magnifier: PixelSprite = {
  id: 'rm18-opener-magnifier',
  name: 'magnifying glass',
  tags: ['scene', 'rm18'],
  rows: rmMark(
    [...LENS.map((row) => `.....${row}`), '.'.repeat(20), '.'.repeat(20), '.'.repeat(20)],
    [[5, 13, 'x'], [6, 13, 'X'], [4, 14, 'g'], [5, 14, 'O'], [3, 15, 'g'], [4, 15, 'O'], [2, 16, 'g'], [3, 16, 'O'], [1, 17, 'g'], [2, 17, 'O']],
  ),
};

/** The blueprint the model was built from, pinned to the wall: masts, yards and hull in white. 18x12. */
const blueprint: PixelSprite = {
  id: 'rm18-opener-blueprint',
  name: 'blueprint',
  tags: ['scene', 'rm18'],
  rows: [
    '........R.........',
    'bbbbbbbbbbbbbbbbbb',
    'bbbbbwbbbbbbwbbbbb',
    'bbbwwwwwbbwwwwwbbb',
    'bbbbbwbbbbbbwbbbbb',
    'bbwwwwwwwbwwwwwbbb',
    'bbbbbwbbbbbbwbbbbb',
    'bwwwwwwwwwwwwwwwwb',
    'bbwbbbbbbbbbbbbwbb',
    'bbbwwwwwwwwwwwwbbb',
    'bbbbbbbbbbbbBBBBbb',
    'bbbbbbbbbbbbbbbbbb',
  ],
};

/** The lantern's wall bracket. 5x3. */
const bracket: PixelSprite = {
  id: 'rm18-opener-bracket',
  name: 'bracket',
  tags: ['scene', 'rm18'],
  rows: [
    'DDDDD',
    'D..D.',
    '...D.',
  ],
};

/** Floor shadows under the keeper and the table. */
const floorShadow: PixelSprite = {
  id: 'rm18-opener-floor-shadow',
  name: 'rm18-opener-floor-shadow',
  tags: ['scene', 'rm18'],
  palette: RM_PALETTE,
  rows: rmFill(['.'.repeat(46), '.'.repeat(46)], [[2, 45, 0, 'Z'], [4, 17, 1, 'Z'], [22, 43, 1, 'Z']]),
};

const base = rmCompose('rm18-opener-base', rmWatchRoom(80, 60, 50), [
  [rmPorthole, 58, 6],
  [blueprint, 6, 6],
  [bracket, 64, 27],
  [floorShadow, 12, 52],
  [rmChartTable, 32, 38],
  [modelShip, 38, 20],
  [rmFlip(rmKeeperReach, 'rm18-opener-keeper'), 14, 24],
]);

export const rm18Opener: SceneArt = {
  id: 'rm18-opener',
  label: 'A lighthouse keeper holds a magnifying glass to a model ship on the chart table, and the lens shows a crack in its hull, while a storm rages in the porthole.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: rmLightning, x: 64, y: 9 },
    { sprite: rmPortSwell, x: 63, y: 16, motion: { kind: 'drift', amp: 1, periodMs: 3000 } },
    { sprite: rmPortRain, x: 58, y: 6 },
    { sprite: rmLater(rmLantern, 'rm18-opener-lantern', 1, 190), x: 65, y: 30 },
    { sprite: magnifier, x: 29, y: 21 },
    { sprite: rmGlint, x: 36, y: 22, motion: { kind: 'twinkle', periodMs: 2200, min: 0.2 } },
  ],
};

/** Distance from (px, py) to the segment from a to b. */
function toSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const vx = bx - ax;
  const vy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / (vx * vx + vy * vy)));
  return Math.hypot(px - ax - t * vx, py - ay - t * vy);
}

/** The emblem crack's path through the planks, one x per row, two pixels wide. */
const EMBLEM_CRACK: Record<number, number> = { 2: 6, 3: 6, 4: 5, 5: 5, 6: 6, 7: 6, 8: 5, 9: 5 };

/**
 * Lesson 18's emblem: the flaw found in the model. A brass magnifying glass whose lens shows a strip
 * of the model's hull planks, pale gold with dark seams, and a bold red crack running down through
 * them. The crack is in the planks behind the glass, a rim of clear blue glass round them, so it reads
 * as a flaw found and not as the checker's own glass broken. 15x15.
 */
const emblemMagnifier: PixelSprite = {
  id: 'rm18-emblem-magnifier',
  name: 'magnifier on a flaw',
  tags: ['rm', 'emblem', 'lesson 18'],
  rows: Array.from({ length: 15 }, (_, y) =>
    Array.from({ length: 15 }, (_, x) => {
      const dx = x + 0.5 - 6;
      const dy = y + 0.5 - 6;
      const d = Math.hypot(dx, dy);
      if (d <= 6) {
        if (d > 5) return dx + dy < -3 ? 'y' : dx + dy > 3 ? 'g' : 'G';
        if (d > 4.1) return x + y < 6 ? 'W' : 'B';
        const crack = EMBLEM_CRACK[y];
        if (crack === x || crack + 1 === x) return 'r';
        return y === 3 || y === 6 || y === 9 ? 'O' : 'y';
      }
      if (toSegment(x + 0.5, y + 0.5, 10, 10, 14, 14) <= 1.05) return x > y ? 'g' : 'G';
      return '.';
    }).join(''),
  ),
};

export const rm18Finish: SceneArt = rmKeepsake(
  'rm18-finish',
  'A red and white life ring hanging from a rope, with a brass magnifying glass at its center whose lens shows a model ship\'s hull planks with a red crack running through them.',
  emblemMagnifier,
);

export const art: LessonArtSet = { opener: rm18Opener, backdrop: rmBackdrop, finish: rm18Finish };
