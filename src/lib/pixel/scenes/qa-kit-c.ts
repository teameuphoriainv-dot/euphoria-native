/**
 * qa-kit-c: what lessons 18 to 25 add to the Quantitative Analysis kit. qa-kit.ts stays the source of
 * the room, the props, the font and the keepsake builder, qa-kit-b.ts of the honours and the random
 * paths; this file only adds pieces more than one of the last eight lessons uses.
 *
 * FILLED CHARTS. qaColumns fills a column chart under a bright edge that steps down the risers, so a
 * staircase of orders or a histogram keeps an unbroken outline. qaHump is the same fill under a bell
 * curve and qaBellPoints the curve as a line for qaPath: risk-neutral pricing, copulas and Bayes all
 * draw distributions, and a shift of measure or a narrowing posterior is then a change of two numbers.
 *
 * GILT FRAMES. qaGiltFrame hangs a painting in the gallery or a slate over the mantel: deep gold
 * outside, lit top and left, a dark lip round the canvas.
 *
 * THE CITY AT NIGHT. qaSkyline draws towers with a scatter of lit windows on a transparent ground, for
 * the view through the glass wall and the capstone's plaza; qaGlints lights more windows as layers.
 *
 * NATIVE-OWNED (CONSTITUTION 5.5): nothing here is synced from the web repo.
 */
import type { PixelSprite } from '../types';
import { qaRandom } from './qa-kit-b';
import type { SceneLayer } from './types';

/* ── filled charts ─────────────────────────────────────────────────────────────────────────────── */

/**
 * A column chart `heights.length` wide and `height` tall: `fill` under each column's top, `edge` on
 * the top pixel and down every riser to meet the lower neighbour, so the outline never breaks. A
 * column of 0 stays empty, and the column beside it is all edge: the chart's flank. The sprite's own
 * left and right sides get no flank, so a chart may run on past them.
 */
export function qaColumns(id: string, heights: readonly number[], height: number, fill: string, edge: string): PixelSprite {
  const tops = heights.map((h) => height - Math.max(0, Math.min(height, h)));
  const rows = Array.from({ length: height }, (_, y) => tops.map((top, x) => {
    if (y < top) return '.';
    const reach = Math.max(top, Math.max(tops[x - 1] ?? top, tops[x + 1] ?? top) - 1);
    return y <= reach ? edge : fill;
  }).join(''));
  return { id, name: id, tags: ['scene', 'qa'], rows };
}

/** A bell curve's height over column x: `peak` at the mean, falling off with spread `sd`. */
function bell(x: number, mean: number, sd: number, peak: number): number {
  return peak * Math.exp(-0.5 * ((x - mean) / sd) ** 2);
}

/** A filled bell curve, `width` x `height`, peaking `peak` rows high at column `mean`. */
export function qaHump(
  id: string,
  width: number,
  height: number,
  curve: { mean: number; sd: number; peak?: number },
  fill: string,
  edge: string,
): PixelSprite {
  const { mean, sd, peak = height } = curve;
  return qaColumns(id, [...Array(width)].map((_, x) => Math.round(bell(x, mean, sd, peak))), height, fill, edge);
}

/** The same bell curve as points for qaPath, standing on the sprite's bottom row. */
export function qaBellPoints(width: number, height: number, curve: { mean: number; sd: number; peak?: number }): [number, number][] {
  const { mean, sd, peak = height - 1 } = curve;
  return [...Array(width)].map((_, x) => [x, height - 1 - Math.round(bell(x, mean, sd, peak))]);
}

/* ── gilt frames ───────────────────────────────────────────────────────────────────────────────── */

/**
 * A gilt picture frame round a `canvas` fill: an O outside, a y bevel lit top and left (g in shadow
 * bottom and right), a g lip. Paint inside qaFrameCanvas(width, height).
 */
export function qaGiltFrame(id: string, width: number, height: number, canvas: string): PixelSprite {
  const rows = Array.from({ length: height }, (_, y) => [...Array(width)].map((_, x) => {
    const ring = Math.min(x, y, width - 1 - x, height - 1 - y);
    if (ring === 0) return 'O';
    if (ring === 1) {
      const lit = x === 1 || y === 1;
      const shade = x === width - 2 || y === height - 2;
      return lit && shade ? 'G' : lit ? 'y' : 'g';
    }
    if (ring === 2) return 'g';
    return canvas;
  }).join(''));
  return { id, name: id, tags: ['scene', 'qa'], rows };
}

/** The canvas inside qaGiltFrame of this size, in the frame's pixels. */
export function qaFrameCanvas(width: number, height: number) {
  return { x: 3, y: 3, width: width - 6, height: height - 6 } as const;
}

/* ── the city at night ─────────────────────────────────────────────────────────────────────────── */

/**
 * Towers against the night sky, `towers` as [x, top, width] in the sprite's pixels, later ones in
 * front: a k body under a D roof line, with windows every other column and third row, about one in
 * five lit (g, a few y). Seeded, so the city is the same on every build. The ground is transparent:
 * stamp it over the sky.
 */
export function qaSkyline(
  id: string,
  width: number,
  height: number,
  towers: readonly (readonly [number, number, number])[],
  seed: number,
): PixelSprite {
  const rand = qaRandom(seed);
  const cells = Array.from({ length: height }, () => new Array<string>(width).fill('.'));
  for (const [tx, top, tw] of towers) {
    for (let y = Math.max(0, top); y < height; y += 1) {
      for (let x = Math.max(0, tx); x < Math.min(width, tx + tw); x += 1) {
        const [lx, ly] = [x - tx, y - top];
        let ch = ly === 0 ? 'D' : 'k';
        if (ly > 1 && ly % 3 === 2 && lx % 2 === 1 && lx < tw - 1) {
          const r = rand();
          if (r < 0.06) ch = 'y';
          else if (r < 0.2) ch = 'g';
        }
        cells[y][x] = ch;
      }
    }
  }
  return { id, name: id, tags: ['scene', 'qa'], rows: cells.map((line) => line.join('')) };
}

/** One lit window, for qaGlints. */
export const qaGlint: PixelSprite = { id: 'qa-glint', name: 'qa-glint', tags: ['scene', 'qa'], rows: ['y'] };

/**
 * Windows lighting and dimming at their own pace, one layer each, at scene points. Keep the base
 * pixel under each a dark k: a glint over a lit window never visibly blinks.
 */
export function qaGlints(points: readonly (readonly [number, number])[]): SceneLayer[] {
  return points.map(([x, y], i) => ({
    sprite: qaGlint,
    x,
    y,
    motion: { kind: 'twinkle', periodMs: 1700 + ((i * 530) % 1500), phase: (i * 0.37) % 1, min: 0.1 },
  }));
}
