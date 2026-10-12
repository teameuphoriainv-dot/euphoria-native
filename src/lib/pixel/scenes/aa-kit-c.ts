/**
 * Applied Accounting kit, batch C (lessons 18 to 25): what more than one of the last eight lessons
 * stamps, on top of aa-kit.ts, aa-kit-a.ts and aa-kit-b.ts and in the same light (from the left).
 *
 * aaPaint builds a sprite from a rule for each pixel, for the round things this batch is full of: a
 * globe, gauges, an arch, gilt emblems. aaHeldBook puts a book in aaBookkeeperStanding's hands at the
 * chest, the sleeves bent in under it, for the decision at the signpost (lesson 21) and the capstone.
 */
import type { PixelSprite } from '../types';
import { AA_PALETTE } from './aa-kit';

/** A w x h sprite painted by `ink(x, y)`, which returns a palette letter, or '.' to leave it clear. */
export function aaPaint(
  id: string,
  w: number,
  h: number,
  ink: (x: number, y: number) => string,
  palette: Record<string, string> = AA_PALETTE,
): PixelSprite {
  return {
    id,
    name: id,
    tags: ['aa', 'paint'],
    palette,
    rows: Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) => ink(x, y)).join('')),
  };
}

/**
 * A book held at the chest, 18 x 7, over rows 18 to 24 of aaBookkeeperStanding (place it at the
 * figure's x and y + AA_AT_B.propInHands.y). `face` is the book as the viewer sees it, 13 x 7: the
 * hands grip its edges on rows 3 and 4 and the sleeves come in under it, over the hands that hung.
 */
export function aaHeldBook(id: string, face: string[], palette: Record<string, string> = AA_PALETTE): PixelSprite {
  if (face.length !== 7 || face.some((r) => r.length !== 13)) throw new Error(`${id}: a held book is 13 x 7`);
  const sides = (r: number) => (r < 3 ? ['...', '..'] : r < 5 ? ['..S', 'M.'] : ['.Pp', 'p.']);
  return {
    id,
    name: id,
    tags: ['aa', 'prop'],
    palette,
    rows: face.map((row, r) => `${sides(r)[0]}${row}${sides(r)[1]}`),
  };
}
