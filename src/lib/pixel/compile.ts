import { EUPHORIA_PIXEL_PALETTE, TRANSPARENT } from "./palette";
import type { CompiledSprite, PixelRect, PixelSprite } from "./types";

/**
 * Compiles ASCII sprite rows into a minimal set of rectangles.
 *
 * A naive renderer emits one <rect> per pixel: a 24x24 sprite becomes 576 nodes,
 * and a gallery of them will visibly cost layout time. This runs greedy meshing
 * instead (extend right while the colour matches, then extend that whole span
 * down while every pixel in it matches), which collapses typical sprites by
 * roughly 5-10x because pixel art is mostly flat runs by construction.
 *
 * Adjacent rects share exact integer edges, so the renderer pairs this with
 * shape-rendering="crispEdges" to keep antialiasing from drawing hairline seams
 * between them.
 */

const cache = new WeakMap<PixelSprite, CompiledSprite>();
const framesCache = new WeakMap<PixelSprite, CompiledSprite[]>();

export class PixelSpriteError extends Error {}

/** Validates the art and reports the exact row, because a miscounted row is the one bug this format has. */
function validate(sprite: PixelSprite): { width: number; height: number } {
  const { rows, id } = sprite;
  if (!rows.length) throw new PixelSpriteError(`Sprite "${id}" has no rows.`);

  const width = rows[0].length;
  if (!width) throw new PixelSpriteError(`Sprite "${id}" row 0 is empty.`);

  rows.forEach((row, y) => {
    if (row.length !== width) {
      throw new PixelSpriteError(
        `Sprite "${id}" row ${y} is ${row.length} chars, expected ${width}. Row: "${row}"`,
      );
    }
  });

  const palette = { ...EUPHORIA_PIXEL_PALETTE, ...(sprite.palette ?? {}) };
  const unknown = new Set<string>();
  for (const row of rows) {
    for (const ch of row) {
      if (ch !== TRANSPARENT && !palette[ch]) unknown.add(ch);
    }
  }
  if (unknown.size) {
    throw new PixelSpriteError(
      `Sprite "${id}" uses characters with no palette entry: ${[...unknown].join(", ")}`,
    );
  }

  return { width, height: rows.length };
}

export function compileSprite(sprite: PixelSprite): CompiledSprite {
  const hit = cache.get(sprite);
  if (hit) return hit;

  const { width, height } = validate(sprite);
  const palette = { ...EUPHORIA_PIXEL_PALETTE, ...(sprite.palette ?? {}) };
  const compiled = mesh(sprite.rows, palette, width, height);
  cache.set(sprite, compiled);
  return compiled;
}

/**
 * Compiles every animation frame. Returns a single-entry array for a still
 * sprite, so callers never branch on whether animation exists.
 */
export function compileFrames(sprite: PixelSprite): CompiledSprite[] {
  const hit = framesCache.get(sprite);
  if (hit) return hit;

  const { width, height } = validate(sprite);
  if (!sprite.frames?.length) {
    const out = [compileSprite(sprite)];
    framesCache.set(sprite, out);
    return out;
  }

  const palette = { ...EUPHORIA_PIXEL_PALETTE, ...(sprite.palette ?? {}) };
  const out = sprite.frames.map((rows, i) => {
    if (rows.length !== height) {
      throw new PixelSpriteError(
        `Sprite "${sprite.id}" frame ${i} has ${rows.length} rows, expected ${height}.`,
      );
    }
    rows.forEach((row, y) => {
      if (row.length !== width) {
        throw new PixelSpriteError(
          `Sprite "${sprite.id}" frame ${i} row ${y} is ${row.length} chars, expected ${width}.`,
        );
      }
    });
    return mesh(rows, palette, width, height);
  });

  framesCache.set(sprite, out);
  return out;
}

/** The greedy meshing pass, shared by the still and every animation frame. */
function mesh(
  rows: string[],
  palette: Record<string, string>,
  width: number,
  height: number,
): CompiledSprite {
  // consumed[y][x] — pixels already folded into an emitted rect.
  const consumed: boolean[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => false),
  );
  const rects: PixelRect[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const ch = rows[y][x];
      if (ch === TRANSPARENT || consumed[y][x]) continue;

      // Extend right along this row while the colour matches.
      let w = 1;
      while (x + w < width && rows[y][x + w] === ch && !consumed[y][x + w]) w++;

      // Extend the whole span downward while every pixel in it still matches.
      let h = 1;
      outer: while (y + h < height) {
        for (let dx = 0; dx < w; dx++) {
          if (rows[y + h][x + dx] !== ch || consumed[y + h][x + dx]) break outer;
        }
        h++;
      }

      for (let dy = 0; dy < h; dy++) {
        for (let dx = 0; dx < w; dx++) consumed[y + dy][x + dx] = true;
      }

      rects.push({ x, y, w, h, fill: palette[ch] });
    }
  }

  return { width, height, rects };
}
