/**
 * Behavioral Finance art kit, batch B (lessons 10 to 17): what more than one of those lessons builds on.
 *
 * PROPS IN MOUTHS AND PAWS. bfStamp draws a small prop onto every frame of a cast sprite, so a lesson
 * hands the tortoise its fix (a key, a slate, a coin, a wrench, a lantern, a watering can) without
 * redrawing the animal. On the kit tortoise (bfTortoise, bfTortoisePlan) the jaw is where the
 * clipboard's clip sits, and the head dips a row on the second frame: BF_TORTOISE_MOUTH carries both,
 * for props drawn with their grip at (2..4, 0) like that clip. To face left, stamp first, then bfMirror.
 *
 * THE FINISH LINE. Both capstones (lessons 10 and 25) end the fable's race: the tortoise crossing the
 * fairground finish line past the hare, asleep. The gate, the napping hare and its snore, the confetti,
 * the fireworks and the lit-up wheel live here so lesson 25 can stage its own finish.
 *
 * THE FAIRGROUND LIT UP. bfFairWheelLit is the stage's Ferris wheel with its rim and gondolas lit;
 * bfBackdropLit is the pathway backdrop for a capstone: the wheel's rim lit in dim gold, bulbs chasing
 * along the coaster, fireworks overhead, every colour still under the backdrop's luminance cap.
 *
 * House rules as bf-kit.ts: deep-step outlines, framed sprites within the 32x32 area, nothing
 * web-synced.
 */
import type { PixelSprite } from '../types';
import { bfHareSlam, bfLater } from './bf-kit';
import { bfFairWheel } from './bf-kit-a';
import { bfBackdrop } from './bf-backdrop';
import type { SceneArt } from './types';

/**
 * `sprite` with `prop` drawn over it at (x, y) on every frame, the canvas grown to fit. `dys` nudges
 * the prop down per frame, so a prop held in a mouth rides a head that dips; null leaves that frame
 * bare (a coin that has just been thrown).
 */
export function bfStamp(
  sprite: PixelSprite,
  id: string,
  prop: PixelSprite,
  x: number,
  y: number,
  dys: readonly (number | null)[] = [],
): PixelSprite {
  const dyOf = (i: number): number | null => (i < dys.length ? dys[i] : 0);
  const w = Math.max(sprite.rows[0].length, x + prop.rows[0].length);
  const h = Math.max(sprite.rows.length, y + prop.rows.length + Math.max(0, ...dys.map((d) => d ?? 0)));
  const draw = (rows: string[], dy: number | null) => {
    const grid = Array.from({ length: h }, (_, j) => (rows[j] ?? '').padEnd(w, '.').split(''));
    if (dy !== null) {
      prop.rows.forEach((row, j) => {
        [...row].forEach((c, i) => {
          if (c !== '.') grid[y + dy + j][x + i] = c;
        });
      });
    }
    return grid.map((r) => r.join(''));
  };
  const palette = { ...sprite.palette, ...prop.palette };
  return {
    ...sprite,
    id,
    rows: draw(sprite.rows, dyOf(0)),
    ...(sprite.frames ? { frames: sprite.frames.map((rows, i) => draw(rows, dyOf(i))) } : {}),
    ...(Object.keys(palette).length ? { palette } : {}),
  };
}

/** `sprite` with its colours swapped through `map`, frames and all (a lit wheel, a dimmed burst). */
export function bfRecolor(sprite: PixelSprite, id: string, map: Readonly<Record<string, string>>): PixelSprite {
  const swap = (rows: string[]) => rows.map((row) => [...row].map((c) => map[c] ?? c).join(''));
  return { ...sprite, id, rows: swap(sprite.rows), ...(sprite.frames ? { frames: sprite.frames.map(swap) } : {}) };
}

/** Where a prop goes to sit in the kit tortoise's mouth, and how it rides the head's dip. */
export const BF_TORTOISE_MOUTH = { x: 32, y: 6, dys: [0, 1] } as const;

/* ── shared props and poses ───────────────────────────────────────────────────────────────── */

export const bfCoin: PixelSprite = {
  id: 'bf-coin',
  name: 'bf-coin',
  tags: ['prop', 'bf'],
  blurb: "A gold coin, lit from the top left.",
  rows: [
    '.OOO.',
    'OyyGO',
    'OyGgO',
    'OGggO',
    '.OOO.',
  ],
};

const slam = bfHareSlam.frames ?? [bfHareSlam.rows];
const dry = (rows: string[]) => rows.map((row) => row.replace(/[Bb]/g, '.'));

/**
 * System 1 holding forth: the slam's raised fist, then the arm thrown forward, mouth open. Without the
 * sweat it is a hare making a point (telling a story, throwing a coin), not a hare in a panic.
 */
export const bfHareGesture: PixelSprite = {
  ...bfHareSlam,
  id: 'bf-hare-gesture',
  name: 'bf-hare-gesture',
  blurb: "System 1 making a point: fist up, then the arm thrown forward with its mouth open.",
  rows: dry(slam[0]),
  frames: [dry(slam[0]), dry(slam[2])],
  frameMs: 600,
};

/* ── the finish line (capstones) ──────────────────────────────────────────────────────────── */

/** The hare who stopped for a nap: lying on its belly, ears laid back, eye shut, chin on its paws. */
export const bfHareNap: PixelSprite = {
  id: 'bf-hare-nap',
  name: 'bf-hare-nap',
  tags: ['character', 'bf', 'system-1'],
  blurb: "System 1 asleep mid-race: the hare lying down, ears laid back, eye shut.",
  rows: [
    '..DDD.........................',
    '.DxxxD........................',
    '.DxFFxDDDDDDD.................',
    '..DxFFFFFFFFFxDDDDD...........',
    '...DDDxxxxxxxxxxxxxDDDDD......',
    '..DDXXDDDDDDDDDDDDDxxxxxDD....',
    '.DXxxxxxxxxxxxxxxxXxxxxxxxD...',
    'DXxxxxxxxxxxxxxxxxXxxxxxxxxD..',
    'DXxxxxxxxxxxxxxxxxXxxxxDDDxxD.',
    'DwXxxxxxxxxxxxxxxxXxxxxxxxxxwF',
    'DwwXxxxxxxxxxxxxxxxXxxxxxxxwwD',
    '.DwXXxxxxxxxxxxxxxxXXxxxxxwwD.',
    '..DDXXXwwwwwXXXXXXXDDwwwwwwD..',
    '....DDDDDDDDDDDDDDDDDDDDDDDD..',
  ],
};

/** Snores, made to rise and fade off a sleeping head: a small z and a big Z. */
export const bfSnore: PixelSprite = {
  id: 'bf-snore',
  name: 'bf-snore',
  tags: ['prop', 'bf'],
  rows: [
    'QQQQ',
    '..Q.',
    '.Q..',
    'QQQQ',
  ],
};

export const bfSnoreBig: PixelSprite = {
  id: 'bf-snore-big',
  name: 'bf-snore-big',
  tags: ['prop', 'bf'],
  rows: [
    'wwwww',
    '...w.',
    '..w..',
    '.w...',
    'wwwww',
  ],
};

/** FINISH on a checkered banner, 24 wide, to hang across the stage's open sky (x 28 to 51). */
export const bfFinishBanner: PixelSprite = {
  id: 'bf-finish-banner',
  name: 'bf-finish-banner',
  tags: ['prop', 'bf'],
  blurb: "The finish banner: checkered bands, FINISH in gold.",
  rows: [
    'DDDDDDDDDDDDDDDDDDDDDDDD',
    'DwwKKwwKKwwKKwwKKwwKKwwD',
    'DKKwwKKwwKKwwKKwwKKwwKKD',
    'DEEEEEEEEEEEEEEEEEEEEEED',
    'DEyyyEyEyEEyEyEyyyEyEyED',
    'DEyEEEyEyyEyEyEyEEEyEyED',
    'DEyyEEyEyEyyEyEyyyEyyyED',
    'DEyEEEyEyEEyEyEEEyEyEyED',
    'DEyEEEyEyEEyEyEyyyEyEyED',
    'DEEEEEEEEEEEEEEEEEEEEEED',
    'DwwKKwwKKwwKKwwKKwwKKwwD',
    'DKKwwKKwwKKwwKKwwKKwwKKD',
    'DDDDDDDDDDDDDDDDDDDDDDDD',
  ],
};

/** The banner's two candy-striped posts, the same 24 wide: place them right under it. */
export const bfFinishPosts: PixelSprite = {
  id: 'bf-finish-posts',
  name: 'bf-finish-posts',
  tags: ['prop', 'bf'],
  rows: [
    '.ww..................ww.',
    '.ww..................ww.',
    '.RR..................RR.',
    '.RR..................RR.',
    '.ww..................ww.',
    '.ww..................ww.',
    '.RR..................RR.',
    '.RR..................RR.',
    '.ww..................ww.',
    '.ww..................ww.',
    '.RR..................RR.',
    '.RR..................RR.',
    '.ww..................ww.',
    '.ww..................ww.',
    '.RR..................RR.',
    '.RR..................RR.',
    '.ww..................ww.',
    '.ww..................ww.',
    '.RR..................RR.',
    '.RR..................RR.',
    '.ww..................ww.',
    '.ww..................ww.',
    '.RR..................RR.',
    '.RR..................RR.',
    '.ww..................ww.',
    '.ww..................ww.',
    '.RR..................RR.',
    '.RR..................RR.',
    'DDDD................DDDD',
  ],
};

/** Confetti falling through the gate, every piece four rows a frame, looping. */
export const bfConfetti: PixelSprite = {
  id: 'bf-confetti',
  name: 'bf-confetti',
  tags: ['prop', 'bf'],
  rows: [
    '.yy...................',
    '....................F.',
    '...........q..........',
    '......................',
    '......N...............',
    '......................',
    '................RR....',
    '........G.............',
    '......................',
    '....F.................',
    '.............y........',
    '......................',
    '...qq.................',
    '.........BB...........',
    '..................w...',
    '...............N......',
  ],
  frames: [
    [
      '.yy...................',
      '....................F.',
      '...........q..........',
      '......................',
      '......N...............',
      '......................',
      '................RR....',
      '........G.............',
      '......................',
      '....F.................',
      '.............y........',
      '......................',
      '...qq.................',
      '.........BB...........',
      '..................w...',
      '...............N......',
    ],
    [
      '...q..................',
      '...q.....B............',
      '.........B........w...',
      '...............N......',
      '.y....................',
      '.y..................F.',
      '...........q..........',
      '......................',
      '......N...............',
      '......................',
      '................R.....',
      '........G.......R.....',
      '......................',
      '....F.................',
      '.............y........',
      '......................',
    ],
    [
      '......................',
      '....F.................',
      '.............y........',
      '......................',
      '...qq.................',
      '.........BB...........',
      '..................w...',
      '...............N......',
      '.yy...................',
      '....................F.',
      '...........q..........',
      '......................',
      '......N...............',
      '......................',
      '................RR....',
      '........G.............',
    ],
    [
      '......N...............',
      '......................',
      '................R.....',
      '........G.......R.....',
      '......................',
      '....F.................',
      '.............y........',
      '......................',
      '...q..................',
      '...q.....B............',
      '.........B........w...',
      '...............N......',
      '.y....................',
      '.y..................F.',
      '...........q..........',
      '......................',
    ],
  ],
  frameMs: 260,
};

/** A firework: a flash, a ring of sparks, a wide burst, embers, then a beat of dark sky. */
export const bfFirework: PixelSprite = {
  id: 'bf-firework',
  name: 'bf-firework',
  tags: ['prop', 'bf'],
  rows: [
    '...........',
    '...........',
    '...........',
    '.....G.....',
    '.....y.....',
    '...GyWyG...',
    '.....y.....',
    '.....G.....',
    '...........',
    '...........',
    '...........',
  ],
  frames: [
    [
      '...........',
      '...........',
      '...........',
      '.....G.....',
      '.....y.....',
      '...GyWyG...',
      '.....y.....',
      '.....G.....',
      '...........',
      '...........',
      '...........',
    ],
    [
      '...........',
      '...........',
      '..y..y..y..',
      '...G.G.G...',
      '...........',
      '..yG.W.Gy..',
      '...........',
      '...G.G.G...',
      '..y..y..y..',
      '...........',
      '...........',
    ],
    [
      '.....y.....',
      '.y...G...y.',
      '..G.....G..',
      '...........',
      '...........',
      'yG.......Gy',
      '...........',
      '...........',
      '..G.....G..',
      '.y...G...y.',
      '.....y.....',
    ],
    [
      '...........',
      '...........',
      '.O...O...O.',
      '...........',
      '...........',
      '...........',
      'O.........O',
      '...........',
      '...........',
      '..O.....O..',
      '.....O.....',
    ],
    [
      '...........',
      '...........',
      '...........',
      '...........',
      '...........',
      '...........',
      '...........',
      '...........',
      '...........',
      '...........',
      '...........',
    ],
  ],
  frameMs: 320,
};

/** The stage's Ferris wheel lit up for a finish: gold rim, bright gondolas, a white hub. */
export const bfFairWheelLit: PixelSprite = bfRecolor(bfFairWheel, 'bf-fair-wheel-lit', { D: 'g', O: 'G', I: 'F', X: 'w' });

/* ── the backdrop lit up (capstones) ──────────────────────────────────────────────────────── */

/** Bulbs sitting on the coaster track, two sets that chase each other. */
const coasterBulbsA: PixelSprite = {
  id: 'bf-backdrop-lit-bulbs-a',
  name: 'bf-backdrop-lit-bulbs-a',
  tags: ['prop', 'bf'],
  rows: [
    '................O........................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '........................f................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '........p...............................b',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    'n........................................',
    '.........................................',
    '.........................................',
    '................................O........',
  ],
};

const coasterBulbsB: PixelSprite = {
  id: 'bf-backdrop-lit-bulbs-b',
  name: 'bf-backdrop-lit-bulbs-b',
  tags: ['prop', 'bf'],
  rows: [
    '................f........................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '........O................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '........................................n',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '........................b................',
    '.........................................',
    'p........................................',
    '................................O........',
  ],
};

const fireworkDim = bfRecolor(bfFirework, 'bf-backdrop-lit-firework', { W: 'f', y: 'O', G: 'p', O: 'D' });
const fireworkDimLater = bfLater(bfRecolor(bfFirework, 'bf-backdrop-lit-firework-b', { W: 'O', y: 'f', G: 'I', O: 'D' }), 'bf-backdrop-lit-firework-later', 2, 380);

/** The pathway backdrop for a capstone: the same fairground, its wheel and coaster lit, fireworks overhead. */
export const bfBackdropLit: SceneArt = {
  ...bfBackdrop,
  id: 'bf-backdrop-lit',
  label: 'A dark fairground at night lit up for a finish, with bulbs chasing along the rollercoaster, a glowing Ferris wheel and fireworks overhead.',
  layers: [
    ...bfBackdrop.layers.map((layer) =>
      layer.sprite.id === 'bf-backdrop-wheel'
        ? { ...layer, sprite: bfRecolor(layer.sprite, 'bf-backdrop-lit-wheel', { D: 'O' }) }
        : layer,
    ),
    { sprite: coasterBulbsA, x: 2, y: 11, motion: { kind: 'twinkle', periodMs: 1200, min: 0.15 } },
    { sprite: coasterBulbsB, x: 6, y: 9, motion: { kind: 'twinkle', periodMs: 1200, phase: 0.5, min: 0.15 } },
    { sprite: fireworkDim, x: 27, y: 0 },
    { sprite: fireworkDimLater, x: 96, y: 1 },
  ],
};
