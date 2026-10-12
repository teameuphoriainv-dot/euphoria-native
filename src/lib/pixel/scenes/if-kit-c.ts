/**
 * if-kit-c: what Investing Fundamentals lessons 18 to 25 added to the kit (if-kit.ts, if-kit-a.ts,
 * if-kit-b.ts). Only what more than one of those lessons uses lives here; a one-off prop stays in its
 * lesson's file.
 *
 * FALLING IS FRAMES. Layer motion can only rise (a bob lifts from rest, a rise floats up), so a thing
 * that falls is drawn frame by frame. ifCoinDrop (if-kit-a.ts) does it for a coin; ifFall does it for
 * any small shape: soil shaken off pulled-up roots (L19), a pruned twig (L21), a clump of confetti
 * (L25).
 *
 * NATIVE-OWNED (CONSTITUTION 5.5): nothing here is synced from the web repo.
 */
import type { PixelSprite } from '../types';

/**
 * `shape` falling along `path` (its top-left corner per frame, in the layer's own pixels). A point off
 * the layer (a negative one) is a frame with nothing in it: the beat after it lands. `still` picks the
 * frame shown at rest and under Reduce Motion. Pass `palette` when the shape uses kit keys (wood,
 * soil), because a layer is compiled on its own.
 */
export function ifFall(
  id: string,
  width: number,
  height: number,
  shape: readonly string[],
  path: readonly (readonly [number, number])[],
  frameMs: number,
  still = 0,
  palette?: Record<string, string>,
): PixelSprite {
  const frames = path.map(([x, y]) => {
    const cells = Array.from({ length: height }, () => new Array<string>(width).fill('.'));
    shape.forEach((row, j) => {
      const line = cells[y + j];
      if (!line) return;
      [...row].forEach((ch, k) => {
        if (ch !== '.' && x + k >= 0 && x + k < width) line[x + k] = ch;
      });
    });
    return cells.map((line) => line.join(''));
  });
  const rows = frames[still];
  if (!rows) throw new Error(`${id}: no frame ${String(still)} in a path of ${String(frames.length)}`);
  return { id, name: id, tags: ['scene', 'if'], ...(palette ? { palette } : {}), rows, frames, frameMs };
}
