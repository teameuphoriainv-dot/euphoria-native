/**
 * Investing Fundamentals lesson 16, Understanding Market Cycles: the orchard has seasons, and so does
 * the market.
 *
 * A new set for the pathway: one hill drawn as a wave, a full cycle from left to right. In the trough
 * a bare tree stands in snow (the bottom of a bear market); up the slope a tree comes into pink
 * blossom (expansion); on the crest a tree hangs full of coins (the peak); and down the far side a
 * tree has turned orange and is dropping its leaves (contraction). Read left to right it is the
 * lesson's four phases; the next trough is the start of the next spring. Snow and leaves fall
 * (frames), petals drift, coins glint, stars twinkle and fireflies rise over the summer grass.
 *
 * The backdrop is the pathway's own, turned to autumn: the same orchard with rust and brown leaves.
 * The keepsake's emblem is a wave, green up, red down, green up again.
 */
import type { PixelSprite } from '../types';
import {
  IF_PALETTE,
  ifCompose,
  ifFirefly,
  ifGlint,
  ifKeepsake,
  ifLater,
  ifStage,
  ifStar,
  ifStarBig,
} from './if-kit';
import { ifBackdrop } from './if-backdrop';
import { ifFruitTree, ifRecolour } from './if-kit-a';
import type { LessonArtSet, SceneArt } from './types';

/* ── the wave ──────────────────────────────────────────────────────────────────────────────────── */

/** The hill's top edge on each column: one full cycle, a trough at x 8 and the crest at x 48. */
const ridgeAt = (x: number) => Math.round(40 - 9 * Math.cos((2 * Math.PI * (x - 48)) / 80));

/** Which season a column of the hill is in, so its ground can carry snow, flowers, grass or leaves. */
const seasonAt = (x: number) => (x < 19 ? 'winter' : x < 38 ? 'spring' : x < 58 ? 'summer' : 'autumn');

/**
 * The hill, on a transparent 80x60 sheet: a lit ridge line over dark ground, snow along it in the
 * trough, flowers on the rise, grass tufts on the crest and fallen leaves down the far side.
 */
const hill: PixelSprite = {
  id: 'if16-hill',
  name: 'if16-hill',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: Array.from({ length: 60 }, (_, y) =>
    Array.from({ length: 80 }, (__, x) => {
      const top = ridgeAt(x);
      const depth = y - top;
      if (depth < 0) return '.';
      const season = seasonAt(x);
      if (season === 'winter' && depth <= 1) return depth === 0 ? 'w' : 'x';
      if (depth === 0) return 'n';
      if (depth === 1) {
        if (season === 'spring' && x % 4 === 1) return 'F';
        if (season === 'summer' && x % 3 === 0) return 'N';
        if (season === 'autumn' && x % 3 === 1) return x % 2 === 0 ? '3' : '4';
        return 'L';
      }
      if (season === 'winter' && depth === 3 && x % 5 === 2) return 'x';
      return depth < 4 ? 'V' : 'v';
    }).join(''),
  ),
};

/* ── the four trees ────────────────────────────────────────────────────────────────────────────── */

/** Winter, 12x17 (the fruit tree's footprint): bare branches lit from the left, snow on their tops. */
const winterTree: PixelSprite = {
  id: 'if16-winter-tree',
  name: 'if16-winter-tree',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [
    '..w....w....',
    '.wA..w.Aw...',
    '..hA.A.A..w.',
    'w..A.hA.AAw.',
    'AA.A.hA.A...',
    '.AAA.hAA..AA',
    '...AAhAAAAA.',
    '....hAAa....',
    '....hAa.....',
    '.....hA.....',
    '.....hA.....',
    '.....hA.....',
    '.....hA.....',
    '.....hA.....',
    '.....hA.....',
    '.....hA.....',
    '....hhAa....',
  ],
};

/** Spring: the coins are blossom. Summer: the kit's tree as it is. Autumn: every leaf and coin turned. */
const springTree = ifRecolour(ifFruitTree, 'if16-spring-tree', { O: 'f', y: 'w', G: 'F', g: 'f' });
const autumnTree = ifRecolour(ifFruitTree, 'if16-autumn-tree', { m: '4', N: '3', n: '2', V: '1', O: '2', y: '4', G: '3', g: '2' });

/** Each tree's trunk centre column; it stands with its last row on the ridge there. */
const TREES = [
  { sprite: winterTree, centre: 9 },
  { sprite: springTree, centre: 28 },
  { sprite: ifFruitTree, centre: 48 },
  { sprite: autumnTree, centre: 67 },
] as const;
const placed = TREES.map(({ sprite, centre }) => ({ sprite, x: centre - 5, y: ridgeAt(centre) - 16 }));
const at = (i: number) => placed[i] ?? { x: 0, y: 0 };

const base = ifCompose('if16-opener-base', 80, 60, [
  { sprite: ifStage, x: 0, y: 0 },
  { sprite: hill, x: 0, y: 0 },
  ...placed,
]);

/* ── moving parts ──────────────────────────────────────────────────────────────────────────────── */

/**
 * Things falling through a patch: each listed pixel (column, starting row, key) falls `step` rows a
 * frame and comes round again every `period` rows, so the loop has no seam. Layer motion only rises,
 * so falling is frames.
 */
function falling(
  id: string,
  width: number,
  height: number,
  bits: readonly (readonly [number, number, string])[],
  period: number,
  step: number,
  frameMs: number,
): PixelSprite {
  const frames = Array.from({ length: period / step }, (_, f) =>
    Array.from({ length: height }, (__, y) =>
      Array.from({ length: width }, (___, x) => {
        const bit = bits.find(([bx, by]) => bx === x && (((y - by - f * step) % period) + period) % period === 0);
        return bit ? bit[2] : '.';
      }).join(''),
    ),
  );
  return { id, name: id, tags: ['scene', 'if'], rows: frames[0] ?? [], frames, frameMs };
}

const snow = falling('if16-snow', 16, 16, [[1, 0, 'w'], [4, 5, 'x'], [7, 2, 'w'], [10, 6, 'w'], [13, 1, 'x'], [15, 4, 'w']], 8, 2, 260);
const leaves = falling('if16-leaves', 14, 14, [[1, 1, '3'], [4, 5, '4'], [8, 0, '2'], [11, 4, '3'], [13, 7, '4']], 8, 2, 300);
const petal: PixelSprite = { id: 'if16-petal', name: 'if16-petal', tags: ['scene', 'if'], rows: ['F'] };

export const if16Opener: SceneArt = {
  id: 'if16-opener',
  label: 'A hill shaped like a wave carries four trees through the seasons: a bare tree in snow in the trough, one in pink blossom on the rise, one full of gold coins on the crest and one turning orange on the way down.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: snow, x: at(0).x - 2, y: at(0).y - 1 },
    { sprite: leaves, x: at(3).x - 1, y: at(3).y + 3 },
    { sprite: petal, x: at(1).x + 13, y: at(1).y + 6, motion: { kind: 'drift', amp: 3, periodMs: 2600 } },
    { sprite: petal, x: at(1).x - 2, y: at(1).y + 3, motion: { kind: 'drift', amp: 2, periodMs: 3200, phase: 0.5 } },
    { sprite: ifGlint, x: at(2).x + 3, y: at(2).y + 2 },
    { sprite: ifLater(ifGlint, 'if16-glint-low', 3, 300), x: at(2).x + 8, y: at(2).y + 4 },
    { sprite: ifStarBig, x: 30, y: 6, motion: { kind: 'twinkle', periodMs: 2300, min: 0.3 } },
    { sprite: ifStar, x: 66, y: 5, motion: { kind: 'twinkle', periodMs: 1800, phase: 0.4, min: 0.2 } },
    { sprite: ifStar, x: 75, y: 15, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.7, min: 0.2 } },
    { sprite: ifFirefly, x: 45, y: 40, motion: { kind: 'rise', amp: 5, periodMs: 3500, phase: 0.2 } },
    { sprite: ifFirefly, x: 54, y: 43, motion: { kind: 'rise', amp: 6, periodMs: 4100, phase: 0.6 } },
  ],
};

/* ── the backdrop, in autumn ───────────────────────────────────────────────────────────────────── */

/** The orchard's three foliage keys turned rust, brown and near black; all stay under luminance 0.15. */
const AUTUMN_FOLIAGE: Readonly<Record<string, string>> = { v: '#2A140C', V: '#4E2410', L: '#7A3A12' };
const autumnal = (sprite: PixelSprite): PixelSprite => ({
  ...sprite,
  id: `if16-${sprite.id}`,
  palette: { ...(sprite.palette ?? {}), ...AUTUMN_FOLIAGE },
});

export const if16Backdrop: SceneArt = {
  ...ifBackdrop,
  id: 'if16-backdrop',
  label: 'A dark orchard in autumn on rolling hills at night, with a windmill on the ridge, a wooden fence, a row of seedlings along the bottom and a few fireflies.',
  base: autumnal(ifBackdrop.base),
  layers: ifBackdrop.layers.map((layer) => ({ ...layer, sprite: autumnal(layer.sprite) })),
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────────── */

const emblemWave: PixelSprite = {
  id: 'if-emblem-wave',
  name: 'if-emblem-wave',
  tags: ['scene', 'if'],
  blurb: "Lesson 16: a wave rising green, falling red and rising again. A full market cycle.",
  rows: [
    '.NR.......',
    '.NRR......',
    'N..R.....N',
    'N..RR....N',
    '....R...NN',
    '....RR..N.',
    '.....RRNN.',
    '.....RRN..',
  ],
};

export const if16Finish: SceneArt = ifKeepsake(
  'if16-finish',
  'A golden acorn hanging from an oak twig, with a wave rising in green, falling in red and rising again in its purple window and small sparkles around it.',
  emblemWave,
);

export const art: LessonArtSet = { opener: if16Opener, backdrop: if16Backdrop, finish: if16Finish };
