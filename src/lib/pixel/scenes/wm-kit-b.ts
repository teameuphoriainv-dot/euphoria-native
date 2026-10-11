/**
 * The Wealth Management art kit for lessons 10 to 17: the gate, the lane and the high street.
 *
 * LESSONS 10 TO 17 GO OUT PAST THE GATE. After the capstone on the temple's forecourt, the outdoor
 * lessons leave the estate: Social Security waits at the gate, real estate is a cottage down the
 * lane, the family firm is a shop on the high street. So this adds the grounds those scenes are
 * built on: dressed stone for gate piers and walls, a cobbled lane, a sky of fixed faint stars, and
 * a cottage window with the lamplight that breathes in it. The rules are wm-kit.ts's: light from
 * the upper left, gold kept to lamps and marks, and only small sprites carry frames.
 *
 * NATIVE-OWNED, like everything in src/lib/pixel/scenes (CONSTITUTION 5.5).
 */
import type { PixelSprite } from '../types';
import { wmBands } from './wm-kit';

/* ── grounds ────────────────────────────────────────────────────────────────────────────────── */

/**
 * Dressed stone, `width` x `height`: courses of `face` blocks `block` wide over a mortar row of
 * `joint`, each course `course` rows tall and every other one offset by half a block.
 */
export function wmAshlar(width: number, height: number, face = 'D', joint = 'k', block = 8, course = 4): string[] {
  return Array.from({ length: height }, (_, y) => {
    if (y % course === course - 1) return joint.repeat(width);
    const offset = Math.floor(y / course) % 2 === 0 ? 0 : Math.floor(block / 2);
    return Array.from({ length: width }, (_, x) => ((x + offset) % block === block - 1 ? joint : face)).join('');
  });
}

/**
 * A cobbled lane, `width` x `height`: a `ground` of setts with the tops of a few `stone` cobbles
 * catching the light, two to a run, every fourth row and staggered so they never stack.
 */
export function wmCobbles(width: number, height: number, ground = 'k', stone = 'D'): string[] {
  return Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) =>
      (y % 4 === 1 && (x + 4 * (Math.floor(y / 4) % 2)) % 8 < 2 ? stone : ground)).join(''),
  );
}

/** Fixed faint stars over a clear sky, `width` x `height`: a dot of `ink` at each [x, y, ink]. */
export function wmSkyDots(
  id: string,
  width: number,
  height: number,
  dots: readonly (readonly [number, number, string])[],
): PixelSprite {
  const rows = wmBands(width, [['.', height]]).map((row) => [...row]);
  for (const [x, y, ink] of dots) rows[y][x] = ink;
  return { id, name: id, tags: ['scene', 'wm'], rows: rows.map((row) => row.join('')) };
}

/* ── the village ────────────────────────────────────────────────────────────────────────────── */

/**
 * A cottage window: a lit stone lintel and sill, four panes behind a cross mullion. The panes are
 * K, so wmCottageGlow can breathe in them; lay it one pixel in from the top-left corner. 7x7.
 */
export const wmCottageWindow: PixelSprite = {
  id: 'wm-cottage-window',
  name: 'wm-cottage-window',
  tags: ['scene', 'wm'],
  rows: [
    'XxxxxxD',
    'xKKDKKD',
    'xKKDKKD',
    'xDDDDDD',
    'xKKDKKD',
    'xKKDKKD',
    'XXXXXXD',
  ],
};

/** Lamplight in wmCottageWindow's four panes, brightest at the top left. A layer only. 5x5. */
export const wmCottageGlow: PixelSprite = {
  id: 'wm-cottage-glow',
  name: 'wm-cottage-glow',
  tags: ['scene', 'wm'],
  rows: [
    'yG.Gg',
    'Gg.gg',
    '.....',
    'Gg.gO',
    'gg.OO',
  ],
};
