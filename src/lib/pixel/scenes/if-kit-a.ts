/**
 * if-kit-a: what Investing Fundamentals lessons 2 to 9 added to the kit (if-kit.ts). Only sprites
 * that more than one of those lessons uses live here; a one-off prop stays in its lesson's file.
 *
 * FRUIT IS A RECOLOUR. On the kit's trees the coins are the only pixels drawn in O y G g, so
 * ifRecolour(tree, id, IF_APPLE) hangs the same tree with apples instead. Different fruit on one
 * silhouette is how the orchard draws different kinds of holding (diversification, funds, a first
 * portfolio) without a second set of trees to keep in step with the first.
 *
 * A SECOND FIGURE. ifGardener is the orchard's hired hand in a straw hat: the stall keeper at the
 * market (L6) and the manager tending a shared planter (L7). They face left, so the light from the
 * left falls on their face, and IF_GARDENER_HAND is where a held prop's grip goes.
 *
 * PALETTE. IF_A_PALETTE is IF_PALETTE plus four keys the kit had no colour for: u (a deep blue for
 * plums), J and z (the cast's deep skin tone and its shadow, from sprites-characters.ts) and o
 * (straw). A later kit that reuses these keys must keep these colours, because ifCompose throws when
 * two stamps disagree on a key.
 *
 * NATIVE-OWNED (CONSTITUTION 5.5): nothing here is synced from the web repo.
 */
import type { PixelSprite } from '../types';
import { IF_PALETTE } from './if-kit';

export const IF_A_PALETTE: Record<string, string> = {
  ...IF_PALETTE,
  u: '#1E3A78',
  J: '#8D5524',
  z: '#6E4019',
  o: '#D9A441',
};

/* ── recolouring ───────────────────────────────────────────────────────────────────────────────── */

/** A sprite with some keys swapped for others, frames too. The kit's coin keys are O y G g. */
export function ifRecolour(sprite: PixelSprite, id: string, swap: Readonly<Record<string, string>>): PixelSprite {
  const paint = (rows: string[]) => rows.map((row) => [...row].map((ch) => swap[ch] ?? ch).join(''));
  return {
    ...sprite,
    id,
    name: id,
    palette: { ...IF_A_PALETTE, ...(sprite.palette ?? {}) },
    rows: paint(sprite.rows),
    ...(sprite.frames ? { frames: sprite.frames.map(paint) } : {}),
  };
}

/** The coin's outline, light, body and shadow as an apple, a plum and a fig (orchid, like the brand). */
export const IF_APPLE: Readonly<Record<string, string>> = { O: '1', y: 's', G: 'R', g: 'r' };
export const IF_PLUM: Readonly<Record<string, string>> = { O: 'u', y: 'B', G: 'b', g: 'u' };
export const IF_FIG: Readonly<Record<string, string>> = { O: 'E', y: 'Q', G: 'q', g: 'P' };

/* ── ground ────────────────────────────────────────────────────────────────────────────────────── */

/** A tilled bed like the kit's ifBed, at any width, for plots shorter than its 56 pixels. */
export function ifBedOf(id: string, width: number): PixelSprite {
  const edge = (ch: string) => `.${ch.repeat(width - 2)}.`;
  const furrows = Array.from({ length: width }, (_, i) => (i % 6 === 3 || i % 6 === 4 ? 'd' : 'e')).join('');
  return { id, name: id, tags: ['scene', 'if'], palette: IF_PALETTE, rows: [edge('c'), furrows, 'e'.repeat(width), edge('d')] };
}

/* ── plants ────────────────────────────────────────────────────────────────────────────────────── */

export const ifCoinSprout: PixelSprite = {
  id: 'if-coin-sprout',
  name: 'if-coin-sprout',
  tags: ['scene', 'if'],
  blurb: "A sprout coming up through a coin half sunk in the soil, 7x7. Its last row sits on a bed's top edge.",
  palette: IF_PALETTE,
  rows: [
    '.mN.Nn.',
    'mNNnNNn',
    '.mNnNn.',
    '...n...',
    '..OnO..',
    '.OyGgO.',
    '..OOO..',
  ],
};

export const ifFruitTree: PixelSprite = {
  id: 'if-fruit-tree',
  name: 'if-fruit-tree',
  tags: ['scene', 'if'],
  blurb: "A small round tree, 12x17, with four coins; recolour them into other fruit with ifRecolour.",
  palette: IF_PALETTE,
  rows: [
    '....mmmmN...',
    '..mmmmmNNNN.',
    '.mmmOOmNNNNn',
    '.mmOyGONNNNn',
    'mmmOGgONNOOn',
    'mmNNOONNOyGO',
    'mNNNNNNNOGgO',
    'NNOONNNNnOOn',
    'NOyGONNnnnnn',
    'NOGgONnnOOnV',
    '.NOOnnnOyGOV',
    '..nnnnnOGgOV',
    '...nnnVVOOV.',
    '.....hAa....',
    '.....hA.....',
    '.....hA.....',
    '....hhAa....',
  ],
};

/* ── the gardener ─────────────────────────────────────────────────────────────────────────────── */

export const ifGardener: PixelSprite = {
  id: 'if-gardener',
  name: 'if-gardener',
  tags: ['scene', 'if'],
  blurb: "The orchard's hired hand, 14x21, facing left: straw hat, grey hair, blue shirt, green apron, one arm out holding whatever is placed at IF_GARDENER_HAND.",
  palette: IF_A_PALETTE,
  rows: [
    '......ooo.....',
    '.....oooooh...',
    '.....rrrrrr...',
    '..ooooooooooh.',
    '....JJJJJXXX..',
    '....JJJJJJXX..',
    '....JKJJJJJX..',
    '...JJJJJJJzX..',
    '....zJJJJJz...',
    '.....zJJJzz...',
    '.....BBBBBb...',
    'JJBBBNNNNNBb..',
    'zzbbbNNNNNbb..',
    '....BNNNNNnb..',
    '....BNNNNNnb..',
    '....BNNNNNnb..',
    '....nNNNNNnn..',
    '.....XXXXXD...',
    '....XXD.XXD...',
    '....XD..XXD...',
    '...hAAa.hAAa..',
  ],
};

/** Where the gardener's hand is, in the gardener's own pixels: a held prop's grip goes here. */
export const IF_GARDENER_HAND = { x: 0, y: 11 } as const;

/* ── a falling coin ───────────────────────────────────────────────────────────────────────────── */

const COIN_FACE = ['.OO.', 'OyGO', 'OGgO', '.OO.'];
const COIN_EDGE = ['.OO.', '.yG.', '.Gg.', '.OO.'];

/**
 * A coin falling along `path` (its top-left corner per frame, in the layer's own pixels), turning
 * face-on and edge-on as it goes. Layer motion can only rise, so anything that falls is frames. A
 * point off the layer (a negative one) is a frame with no coin: the beat after it lands. `still`
 * picks the frame shown at rest and under Reduce Motion.
 */
export function ifCoinDrop(
  id: string,
  width: number,
  height: number,
  path: readonly (readonly [number, number])[],
  frameMs: number,
  still = 0,
): PixelSprite {
  const frames = path.map(([x, y], i) => {
    const cells = Array.from({ length: height }, () => new Array<string>(width).fill('.'));
    (i % 2 === 0 ? COIN_FACE : COIN_EDGE).forEach((row, j) => {
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
  return { id, name: id, tags: ['scene', 'if'], rows, frames, frameMs };
}
