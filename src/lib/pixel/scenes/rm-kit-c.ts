/**
 * The Risk Management kit, batch C: the pieces lessons 18 to 25 share, built on rm-kit.ts and rm-kit-a.ts.
 *
 * THINGS THAT TIP. Layer motion only rises, so anything that goes over is drawn, not moved, and
 * redrawing a piece at every angle by hand would let the copies drift. rmTurn turns one small upright
 * design about its bottom-right corner, the way a domino goes over, so a lesson draws the same piece
 * standing and down at any angle from one set of rows. Nearest-pixel sampling breaks up below about
 * 15 degrees; for a slight lean, shear the rows instead (lesson 21's teetering domino does).
 *
 * LIFE IN A LAMPLIT ROOM. A moth that flutters round the flame, for the lessons that happen by a lamp
 * or a lantern instead of at a window.
 *
 * NATIVE-OWNED, like everything in src/lib/pixel/scenes (CONSTITUTION 5.5).
 */
import type { PixelSprite } from '../types';
import type { RmPoint } from './rm-kit-a';

/**
 * `design` turned `deg` degrees clockwise about its bottom-right corner, with that corner at (px, py):
 * the points to plot with rmMark or rmPlot. Nearest-pixel sampling keeps every pixel's letter, so a
 * domino's pips survive the turn; a negative `deg` tips it the other way about the same corner.
 */
export function rmTurn(design: readonly string[], px: number, py: number, deg: number): RmPoint[] {
  const w = design[0].length;
  const h = design.length;
  const t = (deg * Math.PI) / 180;
  const reach = w + h;
  const points: RmPoint[] = [];
  for (let y = Math.floor(py - reach); y < py + reach; y++) {
    for (let x = Math.floor(px - reach); x < px + reach; x++) {
      const dx = x + 0.5 - px;
      const up = py - (y + 0.5);
      const col = Math.floor(dx * Math.cos(t) - up * Math.sin(t) + w);
      const row = Math.floor(h - (dx * Math.sin(t) + up * Math.cos(t)));
      if (col < 0 || col >= w || row < 0 || row >= h) continue;
      const ch = design[row][col];
      if (ch !== '.') points.push([x, y, ch]);
    }
  }
  return points;
}

/** A moth: wings up, then level, a pale body between. Give it a `drift` and it flutters round a flame. 3x2. */
export const rmMoth: PixelSprite = {
  id: 'rm-moth',
  name: 'moth',
  tags: ['rm', 'life'],
  rows: ['x.x', '.X.'],
  frames: [
    ['x.x', '.X.'],
    ['...', 'xXx'],
  ],
  frameMs: 120,
};
