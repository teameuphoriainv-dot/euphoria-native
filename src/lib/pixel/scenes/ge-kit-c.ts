/**
 * The Global Economics kit, batch C (lessons 18 to 25): a ground at another hour. Built from
 * ge-kit.ts's palette and helpers, as ge-kit-a.ts and ge-kit-b.ts are; it adds to all three and
 * changes nothing in any of them.
 *
 * ONE GROUND, ANOTHER HOUR. geTint swaps a character everywhere, which suits a prop but not a ground:
 * on the quay `b` is the sky AND the ripples on the water, and on the bay `k` is the high sky AND the
 * joints in the paving. geTintRows tints each band of rows by its own map, so the sky can go to night
 * while the stone below keeps its colour. Lesson 19 takes the quay into the night with it, and lesson
 * 25 brings the bay to dawn.
 *
 * NATIVE-OWNED, like everything in src/lib/pixel/scenes (CONSTITUTION 5.5: new art never goes in the
 * web-synced sprite files).
 */
import type { PixelSprite } from '../types';

/** One band of a ground, rows `from` to `to` inclusive, and the swaps that band takes. */
export interface GeTintBand {
  from: number;
  to: number;
  map: Readonly<Record<string, string>>;
}

/**
 * A still ground with each band of rows tinted by its own map. A row takes the first band it falls
 * in, and rows in no band are left as drawn.
 */
export function geTintRows(sprite: PixelSprite, id: string, bands: readonly GeTintBand[]): PixelSprite {
  const rows = sprite.rows.map((row, y) => {
    const band = bands.find(({ from, to }) => y >= from && y <= to);
    return band ? row.split('').map((ch) => band.map[ch] ?? ch).join('') : row;
  });
  return { ...sprite, id, name: id, rows };
}
