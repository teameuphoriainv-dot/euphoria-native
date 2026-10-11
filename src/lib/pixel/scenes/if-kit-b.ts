/**
 * if-kit-b: what Investing Fundamentals lessons 10 to 17 added to the kit (if-kit.ts, if-kit-a.ts).
 * Sprites more than one of those lessons uses live here, and so do the pieces the plan gives to all
 * three 50-XP lessons (10, 24 and 25); a one-off prop stays in its lesson's file.
 *
 * THE 50-XP LESSONS ARE HARVESTS. Their openers are the grown orchard at sunset instead of at night:
 * ifSunsetSky repaints the stage's sky band by band (orchid, magenta, orange, amber, gold) around a
 * sun set low on the left, where every figure's light already comes from, and ifOrchardRow lines the
 * far hills with grown trees so the whole orchard is in view. Their keepsake is the same acorn with a
 * gold halo and a ring of extra sparkles (ifPremiumKeepsake), not a new keepsake shape.
 *
 * SITTING. ifInvestorSeated is the kit's investor sitting down (on a stump, on a swing): the same
 * head, hat and arm, the legs bent at the knee. IF_SEATED_HAND is where the hand is, and
 * IF_SEATED_SEAT is the row the seat's top edge goes under.
 *
 * NUMBERS. ifDigits writes a short number in a 3x5 face, for a price on a sign or a tag.
 *
 * NATIVE-OWNED (CONSTITUTION 5.5): nothing here is synced from the web repo.
 */
import type { PixelSprite } from '../types';
import {
  IF_PALETTE,
  ifCompose,
  ifKeepsake,
  ifOakSprig,
  ifStage,
  ifStar,
  ifStarBig,
} from './if-kit';
import type { SceneArt, SceneLayer } from './types';

/* ── sunset ────────────────────────────────────────────────────────────────────────────────────── */

/** The sky key for each of the stage's first 34 rows at sunset, top to bottom. */
const SUNSET_BANDS = [...'EEEE', ...'ppppp', ...'fffff', ...'33333', ...'444444', ...'yyyyyyyyy'];

/** Where the sun sits in the sunset sky, low on the left. Its rays and glints are placed from this. */
export const IF_SUNSET_SUN = { x: 12, y: 22, r: 5 } as const;

/** Thin clouds lit from below: a row, its first and last column, and the key. */
const SUNSET_CLOUDS = [
  [7, 56, 69, 'f'],
  [8, 61, 75, 'f'],
  [11, 35, 49, 'F'],
  [12, 29, 55, 'F'],
  [16, 45, 57, '4'],
  [17, 40, 62, '4'],
] as const;

function sunsetKey(ch: string, x: number, y: number): string {
  if (ch === 'v') return ch;
  const band = SUNSET_BANDS[y] ?? 'y';
  const d = Math.hypot(x - IF_SUNSET_SUN.x, y - IF_SUNSET_SUN.y);
  if (d <= IF_SUNSET_SUN.r - 1.5) return '5';
  if (d <= IF_SUNSET_SUN.r + 0.5) return 'y';
  if (d <= IF_SUNSET_SUN.r + 2.5 && band !== 'y') return '4';
  const cloud = SUNSET_CLOUDS.find(([row, from, to]) => row === y && x >= from && x <= to);
  return cloud ? cloud[3] : band;
}

/**
 * The stage's top 34 rows at sunset, laid over it at (0, 0). The far hills keep their shape and
 * colour; everything that was sky (the moon too) takes its row's band, the sun burns low on the left
 * with an amber glow round it, and a few thin clouds catch its light from below.
 */
export const ifSunsetSky: PixelSprite = {
  id: 'if-sunset-sky',
  name: 'if-sunset-sky',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: ifStage.rows.slice(0, 34).map((row, y) => [...row].map((ch, x) => sunsetKey(ch, x, y)).join('')),
};

/** Rays round the sunset sun, 17x17, centred on it; give it a slow twinkle. */
export const ifSunsetRays: PixelSprite = {
  id: 'if-sunset-rays',
  name: 'if-sunset-rays',
  tags: ['scene', 'if'],
  rows: [
    '........5........',
    '........y........',
    '..y...........y..',
    '...4.........4...',
    '.................',
    '.................',
    '.................',
    '.................',
    '5y.............y5',
    '.................',
    '.................',
    '.................',
    '.................',
    '...4.........4...',
    '..y...........y..',
    '.................',
    '.................',
  ],
};

/** Where to put ifSunsetRays so they centre on the sun. */
export const IF_SUNSET_RAYS_AT = { x: IF_SUNSET_SUN.x - 8, y: IF_SUNSET_SUN.y - 8 } as const;

/**
 * The far orchard, 80x9: a row of grown trees standing on the far hills, lit on the left by the
 * sunset, with gaps where the sun and the near props go. Lay it at (0, 25), over ifSunsetSky.
 */
const ORCHARD_TREES = [
  [22, 4], [29, 3], [36, 4], [43, 3], [50, 4], [57, 3], [64, 4], [71, 3], [78, 4],
] as const;

function orchardKey(x: number, y: number): string {
  for (const [cx, cy] of ORCHARD_TREES) {
    const dx = x - cx;
    const dy = y - cy;
    if (Math.hypot(dx, dy * 1.15) <= 3.4) return dx + dy <= -2 ? 'L' : dx + dy >= 3 ? 'v' : 'V';
    if (dx === 0 && y > cy + 2) return 'a';
  }
  return '.';
}

export const ifOrchardRow: PixelSprite = {
  id: 'if-orchard-row',
  name: 'if-orchard-row',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: Array.from({ length: 9 }, (_, y) => Array.from({ length: 80 }, (__, x) => orchardKey(x, y)).join('')),
};

/* ── the premium keepsake ─────────────────────────────────────────────────────────────────────── */

/** The halo's centre and radius in the 48x40 keepsake: the middle of the hanging acorn. */
const HALO = { x: 24, y: 22, r: 16 } as const;
const ON_RING = (deg: number) => ({
  x: Math.round(HALO.x + HALO.r * Math.cos((deg * Math.PI) / 180)),
  y: Math.round(HALO.y + HALO.r * Math.sin((deg * Math.PI) / 180)),
});

/** A dotted gold ring behind the acorn: a dot every 12 degrees, the brighter ones every 36. */
const halo: PixelSprite = (() => {
  const cells = Array.from({ length: 40 }, () => new Array<string>(48).fill('.'));
  for (let deg = 0; deg < 360; deg += 12) {
    const { x, y } = ON_RING(deg);
    const line = cells[y];
    if (line && x >= 0 && x < 48) line[x] = deg % 36 === 0 ? 'G' : 'g';
  }
  return { id: 'if-halo', name: 'if-halo', tags: ['scene', 'if'], rows: cells.map((line) => line.join('')) };
})();

/**
 * Extra lights on the halo, clear of the twig and of the keepsake's own four sparkles, twinkling one
 * after the other so the light seems to run round the ring.
 */
const RING_LIGHTS: SceneLayer[] = [
  { deg: 75, big: true },
  { deg: 105, big: true },
  { deg: 135, big: false },
  { deg: 200, big: true },
  { deg: 225, big: false },
  { deg: 45, big: false },
].map(({ deg, big }, i) => {
  const { x, y } = ON_RING(deg);
  return {
    sprite: big ? ifStarBig : ifStar,
    x: big ? x - 1 : x,
    y: big ? y - 1 : y,
    motion: { kind: 'twinkle', periodMs: 1800, phase: i / 6, min: 0.2 },
  };
});

/**
 * The keepsake for a 50-XP lesson: ifKeepsake's acorn and emblem, hung inside a gold halo with a ring
 * of extra lights. Same shape as every other keepsake, so the pathway still reads as one set.
 */
export function ifPremiumKeepsake(id: string, label: string, emblem: PixelSprite): SceneArt {
  const plain = ifKeepsake(id, label, emblem);
  return {
    ...plain,
    base: ifCompose(`${id}-base`, 48, 40, [
      { sprite: halo, x: 0, y: 0 },
      { sprite: ifOakSprig, x: 0, y: 0 },
    ]),
    layers: [...plain.layers, ...RING_LIGHTS],
  };
}

/* ── the investor, sitting ────────────────────────────────────────────────────────────────────── */

export const ifInvestorSeated: PixelSprite = {
  id: 'if-investor-seated',
  name: 'if-investor-seated',
  tags: ['scene', 'if'],
  blurb: "The kit's investor sitting, 14x21, facing right, the arm out at IF_SEATED_HAND and the knees bent over a seat.",
  palette: IF_PALETTE,
  rows: [
    '.....44.......',
    '....4333......',
    '...433333.....',
    '..43333332....',
    '..22222222....',
    '..HHCCCCCC....',
    '..HCCCCCKC....',
    '..HCCCCCCCC...',
    '..HUCCCCCU....',
    '...UUCCCU.....',
    '...qPPPPp.....',
    '..qPPPPPpPPPCC',
    '..qPPPPPppppUU',
    '..qPPPPPPp....',
    '..qPPPPPPp....',
    '..EppppppE....',
    '..bBBBBBBBBb..',
    '..bbbbbbbbbb..',
    '.........bBb..',
    '.........bBb..',
    '........aAAA..',
  ],
};

/** Where the seated investor's hand is, in their own pixels: a held prop's grip goes here. */
export const IF_SEATED_HAND = { x: 12, y: 11 } as const;
/** The row under the seated investor's thighs (columns 2 to 8): a seat's top edge goes on this row. */
export const IF_SEATED_SEAT = { x: 2, y: 18, width: 7 } as const;

/* ── the harvest basket ───────────────────────────────────────────────────────────────────────── */

export const ifCoinBasket: PixelSprite = {
  id: 'if-coin-basket',
  name: 'if-coin-basket',
  tags: ['scene', 'if'],
  blurb: "A woven basket heaped with coins, 10x7: carried by its rim at IF_COIN_BASKET_GRIP, or set down to catch what falls.",
  palette: IF_PALETTE,
  rows: [
    '..yGyGyG..',
    '.yGgGgGgG.',
    'hhhhhhhhhh',
    'hAAhAAhAAa',
    'AhAAhAAhAa',
    '.AAhAAhAa.',
    '..aaaaaa..',
  ],
};

/** Where a hand holds the basket: the left end of its rim. */
export const IF_COIN_BASKET_GRIP = { x: 0, y: 2 } as const;

/* ── numbers ───────────────────────────────────────────────────────────────────────────────────── */

const DIGIT_FACE: Readonly<Record<string, readonly string[]>> = {
  '0': ['###', '#.#', '#.#', '#.#', '###'],
  '1': ['.#.', '##.', '.#.', '.#.', '###'],
  '2': ['###', '..#', '###', '#..', '###'],
  '3': ['###', '..#', '.##', '..#', '###'],
  '4': ['#.#', '#.#', '###', '..#', '..#'],
  '5': ['###', '#..', '###', '..#', '###'],
  '6': ['###', '#..', '###', '#.#', '###'],
  '7': ['###', '..#', '..#', '.#.', '.#.'],
  '8': ['###', '#.#', '###', '#.#', '###'],
  '9': ['###', '#.#', '###', '..#', '###'],
  '%': ['#.#', '..#', '.#.', '#..', '#.#'],
  '/': ['..#', '..#', '.#.', '#..', '#..'],
};

/** A short number in a 3x5 face, one clear column between characters, drawn in `ink`. */
export function ifDigits(id: string, text: string, ink: string): PixelSprite {
  const glyphs = [...text].map((ch) => {
    const glyph = DIGIT_FACE[ch];
    if (!glyph) throw new Error(`${id}: no glyph for '${ch}'`);
    return glyph;
  });
  const rows = Array.from({ length: 5 }, (_, j) => glyphs.map((g) => (g[j] ?? '...').replace(/#/g, ink)).join('.'));
  return { id, name: id, tags: ['scene', 'if'], rows };
}
