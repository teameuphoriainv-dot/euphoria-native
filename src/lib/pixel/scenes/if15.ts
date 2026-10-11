/**
 * Investing Fundamentals lesson 15, International Investing: the orchard does not end at the shore.
 *
 * A new set for the pathway: the orchard's edge where it meets the sea. The far hills are now another
 * country's coast, a lighthouse blinking on it and a sailboat crossing between. On the near shore the
 * trees are no longer all one kind: a cherry in pink blossom on one side, a palm hung with gold
 * coconuts on the other, and between them the investor gives a globe on its stand a spin. Most of
 * the world's orchard is somewhere else. The globe turns (frames), the boat sails, the lighthouse
 * blinks, the moon's path shimmers on the water, petals drift and the stars twinkle.
 *
 * The keepsake's emblem is the globe.
 */
import type { PixelSprite } from '../types';
import {
  IF_PALETTE,
  ifCompose,
  ifFirefly,
  ifGlint,
  ifInvestor,
  ifKeepsake,
  ifStage,
  ifStar,
  ifStarBig,
} from './if-kit';
import { ifBackdrop } from './if-backdrop';
import { IF_A_PALETTE, ifFruitTree, ifRecolour } from './if-kit-a';
import type { LessonArtSet, SceneArt } from './types';

/* ── the sea ───────────────────────────────────────────────────────────────────────────────────── */

const SEA_Y = 31;

/** The moon's path on the water, under the moon: per sea row, its first and last column and its key. */
const MOON_PATH = [
  [11, 12, 'Q'],
  null,
  [10, 12, 'w'],
  null,
  [11, 13, 'Q'],
  [9, 10, 'Q'],
  [10, 13, 'w'],
  null,
  [12, 13, 'Q'],
  [9, 11, 'Q'],
  null,
] as const;

/** The sea, 80x11, purple with the sky in it: ripple dashes, and the moon's path below the moon. */
const sea: PixelSprite = {
  id: 'if15-sea',
  name: 'if15-sea',
  tags: ['scene', 'if'],
  rows: Array.from({ length: 11 }, (_, j) =>
    Array.from({ length: 80 }, (__, x) => {
      const path = MOON_PATH[j];
      if (path && x >= path[0] && x <= path[1]) return path[2];
      if (j % 2 === 1 && (x + j * 3) % 9 < 3) return 'p';
      return 'E';
    }).join(''),
  ),
};

/** The beach between the water and the grass: wet sand, then dry. */
const beach: PixelSprite = {
  id: 'if15-beach',
  name: 'if15-beach',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: ['e'.repeat(80), Array.from({ length: 80 }, (_, x) => (x % 11 === 4 ? 'h' : 'c')).join('')],
};

/* ── the far coast ─────────────────────────────────────────────────────────────────────────────── */

const lighthouse: PixelSprite = {
  id: 'if15-lighthouse',
  name: 'if15-lighthouse',
  tags: ['scene', 'if'],
  rows: [
    '.D.',
    'DyD',
    'www',
    'wwx',
    'RRr',
    'wwx',
    'RRr',
    'wwx',
    'RRr',
  ],
};

const lighthouseGlow: PixelSprite = {
  id: 'if15-lighthouse-glow',
  name: 'if15-lighthouse-glow',
  tags: ['scene', 'if'],
  rows: ['.y.', 'y5y', '.y.'],
};

/** A sloop, 8x8, sail lit on the left; its hull sits on the sea's top rows. */
const boat: PixelSprite = {
  id: 'if15-boat',
  name: 'if15-boat',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [
    '...x....',
    '...wx...',
    '..wwx...',
    '..wwxx..',
    '.wwwxx..',
    '.wwwxxx.',
    'aAAAAAAa',
    '.aaaaaa.',
  ],
};

/* ── the globe ─────────────────────────────────────────────────────────────────────────────────── */

/** The world's land in one band round the globe, 22 columns: it scrolls past two columns a frame. */
const LAND = [
  '......................',
  '...##.........##......',
  '..####.......####.....',
  '..#####.....#####..#..',
  '...####....######.##..',
  '....###.....####..##..',
  '.....##......##...#...',
  '.....##.......#.......',
  '......#.......##......',
  '..............#.......',
  '......................',
] as const;

/** One turn of the globe, 13x13: a sphere lit from the left in a dark rim, the land shifted by `turn`. */
function globeFrame(turn: number): string[] {
  return Array.from({ length: 13 }, (_, y) =>
    Array.from({ length: 13 }, (__, x) => {
      const r2 = (x - 6) ** 2 + (y - 6) ** 2;
      if (r2 > 42) return '.';
      if (r2 > 30) return 'u';
      const band = LAND[y - 1] ?? '';
      const land = band[(x - 1 + turn * 2 + 22) % 22] === '#';
      if (x <= 3) return land ? 'm' : 'B';
      if (x >= 9) return land ? 'n' : 'u';
      return land ? 'N' : 'b';
    }).join(''),
  );
}

const globe: PixelSprite = {
  id: 'if15-globe',
  name: 'if15-globe',
  tags: ['scene', 'if'],
  palette: IF_A_PALETTE,
  rows: globeFrame(0),
  frames: Array.from({ length: 11 }, (_, k) => globeFrame(k)),
  frameMs: 220,
};

/** The stand, 15x19: a gold meridian round the globe's right side, a wooden stem and foot. */
const globeStand: PixelSprite = (() => {
  const cells = Array.from({ length: 19 }, () => new Array<string>(15).fill('.'));
  for (let deg = -90; deg <= 90; deg += 5) {
    const x = Math.round(6 + 7 * Math.cos((deg * Math.PI) / 180));
    const y = Math.round(7 + 7 * Math.sin((deg * Math.PI) / 180));
    const line = cells[y];
    if (line) line[x] = deg < 20 ? 'G' : 'g';
  }
  const paint = (y: number, from: number, keys: string) => {
    const line = cells[y];
    if (line) [...keys].forEach((ch, i) => { line[from + i] = ch; });
  };
  paint(15, 6, 'hA');
  paint(16, 6, 'hA');
  paint(17, 3, 'hhhhAAa');
  paint(18, 2, 'aaaaaaaaa');
  return { id: 'if15-globe-stand', name: 'if15-globe-stand', tags: ['scene', 'if'], palette: IF_PALETTE, rows: cells.map((l) => l.join('')) };
})();

/* ── the trees ─────────────────────────────────────────────────────────────────────────────────── */

/** A cherry in blossom: the kit's fruit tree with its leaves turned pink. */
const cherry = ifRecolour(ifFruitTree, 'if15-cherry', { m: 's', N: 'F', n: 'f', V: 'I' });

/** A palm, 14x24, its trunk curving up to the right, gold coconuts under the fronds. */
const palm: PixelSprite = {
  id: 'if15-palm',
  name: 'if15-palm',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [
    '.....nNNmm....',
    '...nNNNNNNNn..',
    '.nNNn.mmNNnNNn',
    'nNn..mNNn..nNn',
    'Nn..mNOOn....N',
    'n..mN.OyGO....',
    '..mN..OGgO....',
    '..N....OOA....',
    '.........hA...',
    '.........hA...',
    '........hAa...',
    '........hA....',
    '........hA....',
    '.......hAa....',
    '.......hA.....',
    '.......hA.....',
    '......hAa.....',
    '......hA......',
    '......hA......',
    '.....hAa......',
    '.....hA.......',
    '.....hA.......',
    '....hhAa......',
    '...hAhAAa.....',
  ],
};

/* ── the opener ────────────────────────────────────────────────────────────────────────────────── */

const INVESTOR = { x: 14, y: 25 } as const;
/** The stand's foot rests on the grass; the globe sits inside its meridian. */
const STAND = { x: 28, y: 27 } as const;
const PALM = { x: 58, y: 21 } as const;
const LIGHTHOUSE = { x: 74, y: 20 } as const;

const base = ifCompose('if15-opener-base', 80, 60, [
  { sprite: ifStage, x: 0, y: 0 },
  { sprite: lighthouse, x: LIGHTHOUSE.x, y: LIGHTHOUSE.y },
  { sprite: sea, x: 0, y: SEA_Y },
  { sprite: beach, x: 0, y: SEA_Y + 11 },
  { sprite: cherry, x: 0, y: 27 },
  { sprite: palm, x: PALM.x, y: PALM.y },
  { sprite: globeStand, x: STAND.x, y: STAND.y },
  { sprite: ifInvestor, x: INVESTOR.x, y: INVESTOR.y },
]);

const petal: PixelSprite = { id: 'if15-petal', name: 'if15-petal', tags: ['scene', 'if'], rows: ['F'] };
/** A few bright breaks in the moon's path, shimmering. */
const glade: PixelSprite = { id: 'if15-glade', name: 'if15-glade', tags: ['scene', 'if'], rows: ['ww.Q'] };

export const if15Opener: SceneArt = {
  id: 'if15-opener',
  label: 'On a moonlit shore an investor spins a globe on its stand between a pink cherry tree and a palm hung with gold coconuts, while a sailboat crosses the sea toward a lighthouse on a far coast.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: globe, x: STAND.x, y: STAND.y + 1 },
    { sprite: boat, x: 44, y: SEA_Y - 6, motion: { kind: 'drift', amp: 3, periodMs: 5200 } },
    { sprite: lighthouseGlow, x: LIGHTHOUSE.x, y: LIGHTHOUSE.y, motion: { kind: 'twinkle', periodMs: 1600, min: 0.1 } },
    { sprite: glade, x: 9, y: SEA_Y + 7, motion: { kind: 'twinkle', periodMs: 1900, min: 0.3 } },
    { sprite: petal, x: 12, y: 31, motion: { kind: 'drift', amp: 3, periodMs: 2600 } },
    { sprite: petal, x: 4, y: 24, motion: { kind: 'drift', amp: 2, periodMs: 3100, phase: 0.5 } },
    { sprite: ifGlint, x: PALM.x + 6, y: PALM.y + 4 },
    { sprite: ifStarBig, x: 30, y: 5, motion: { kind: 'twinkle', periodMs: 2300, min: 0.3 } },
    { sprite: ifStar, x: 50, y: 9, motion: { kind: 'twinkle', periodMs: 1800, phase: 0.4, min: 0.2 } },
    { sprite: ifStar, x: 66, y: 3, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.7, min: 0.2 } },
    { sprite: ifFirefly, x: 50, y: 51, motion: { kind: 'rise', amp: 5, periodMs: 3600, phase: 0.3 } },
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────────── */

const emblemGlobe: PixelSprite = {
  id: 'if-emblem-globe',
  name: 'if-emblem-globe',
  tags: ['scene', 'if'],
  blurb: "Lesson 15: a globe on its stand. The whole world's orchard.",
  palette: IF_A_PALETTE,
  rows: [
    '...BBbb...',
    '..BmNbbu..',
    '.BmNNbbNu.',
    '.bNNbbNNu.',
    '.bbNbbbNu.',
    '..bbbbuu..',
    '...uuuu...',
    '..hhAAaa..',
  ],
};

export const if15Finish: SceneArt = ifKeepsake(
  'if15-finish',
  'A golden acorn hanging from an oak twig, with a blue and green globe on a stand in its purple window and small sparkles around it.',
  emblemGlobe,
);

export const art: LessonArtSet = { opener: if15Opener, backdrop: ifBackdrop, finish: if15Finish };
