import { EUPHORIA_PIXEL_PALETTE, PIXEL_PALETTE_LIGHT, TRANSPARENT } from "./palette";

/** Which background a sprite is being drawn on. Chooses the palette; see palette.ts. */
export type PixelCanvas = "dark" | "light";
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

/*
 * KEYED BY SPRITE **AND** PALETTE. This was a flat WeakMap<PixelSprite, CompiledSprite>, which was
 * correct while there was exactly one palette. Light mode adds a second, and the same sprite object
 * is rendered under both — so a flat cache would return the dark-canvas mesh for a light-canvas
 * request, silently, and the sprite would be invisible on the page it was retinted for. The bug
 * would appear only after the sprite had been drawn once in the other theme.
 */
const cache = new WeakMap<PixelSprite, Map<string, CompiledSprite>>();

const cacheGet = (sprite: PixelSprite, key: string) => cache.get(sprite)?.get(key);
const cacheSet = (sprite: PixelSprite, key: string, v: CompiledSprite) => {
  const byPalette = cache.get(sprite) ?? new Map<string, CompiledSprite>();
  byPalette.set(key, v);
  cache.set(sprite, byPalette);
};
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

export function compileSprite(sprite: PixelSprite, canvas: PixelCanvas = 'dark'): CompiledSprite {
  const hit = cacheGet(sprite, canvas);
  if (hit) return hit;

  const { width, height } = validate(sprite);
  const base = canvas === 'light' ? PIXEL_PALETTE_LIGHT : EUPHORIA_PIXEL_PALETTE;
  // A sprite's OWN palette still wins: an override is deliberate art direction (the drained locked
  // crests, the retinted goal target) and must not be second-guessed by the canvas.
  const palette = { ...base, ...(sprite.palette ?? {}) };
  const compiled = mesh(sprite.rows, palette, width, height);
  cacheSet(sprite, canvas, compiled);
  return compiled;
}

/**
 * Compiles every animation frame. Returns a single-entry array for a still
 * sprite, so callers never branch on whether animation exists.
 */
export function compileFrames(sprite: PixelSprite, canvas: PixelCanvas = 'dark'): CompiledSprite[] {
  const hit = framesCache.get(sprite);
  if (hit) return hit;

  const { width, height } = validate(sprite);
  if (!sprite.frames?.length) {
    const out = [compileSprite(sprite, canvas)];
    framesCache.set(sprite, out);
    return out;
  }

  const palette = { ...(canvas === 'light' ? PIXEL_PALETTE_LIGHT : EUPHORIA_PIXEL_PALETTE), ...(sprite.palette ?? {}) };
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
