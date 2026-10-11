/**
 * The Risk Management kit, batch A: the pieces lessons 2 to 9 share, built on rm-kit.ts.
 *
 * THE KEEPER'S POSES. rm-kit draws the keeper one way, spyglass raised to the window. Eight openers
 * in that pose would read as one picture, so these redraw only the arm on the same body: reaching
 * forward (to tap, point or pull), raised with a finger up, and lifted with a fist that carries a
 * lantern or an umbrella. rmFlip turns any of them, or any prop, to face right. Lesson 1's review
 * asked that the spyglass read as brass, not as more raincoat: rmKeeperBrass redraws it in the dark
 * brass of the clock rim with a glint and a blue lens, and is the spyglass keeper from lesson 2 on.
 *
 * THE WEATHER AT THE GLASS. rmCalmWindow is the storm window's frame over a clear night (moon,
 * stars, a flat sea) for the calm lessons; rmPorthole is a round brass window for rooms the big
 * window would crowd, with rain drawn to stay on its glass.
 *
 * NATIVE-OWNED, like everything in src/lib/pixel/scenes (CONSTITUTION 5.5).
 */
import type { PixelSprite } from '../types';
import { RM_PALETTE, rmKeeper, rmRetint, rmSwell } from './rm-kit';

/* ── helpers ─────────────────────────────────────────────────────────────────────────────────── */

/** A pixel to set: x, y and its palette letter. */
export type RmPoint = readonly [number, number, string];

/** `rows` with single pixels overwritten, e.g. a needle drawn onto a dial for each of its frames. */
export function rmMark(rows: readonly string[], points: readonly RmPoint[]): string[] {
  const grid = rows.map((row) => [...row]);
  for (const [x, y, ch] of points) {
    if (y >= 0 && y < grid.length && x >= 0 && x < grid[y].length) grid[y][x] = ch;
  }
  return grid.map((row) => row.join(''));
}

/** A blank `width` x `height` frame with only `points` drawn: rain, sparks, a trickle of sand. */
export function rmPlot(width: number, height: number, points: readonly RmPoint[]): string[] {
  return rmMark(Array.from({ length: height }, () => '.'.repeat(width)), points);
}

/** A sprite mirrored left to right, rows and every frame: the keeper or a prop turned to face right. */
export function rmFlip(sprite: PixelSprite, id: string): PixelSprite {
  const flip = (rows: string[]) => rows.map((row) => [...row].reverse().join(''));
  return {
    ...sprite,
    id,
    name: id,
    rows: flip(sprite.rows),
    ...(sprite.frames ? { frames: sprite.frames.map(flip) } : {}),
  };
}

/* ── the keeper, four ways ───────────────────────────────────────────────────────────────────── */

/** The sou'wester, the same in every pose. */
const HAT = [
  '..........OOOO....',
  '.........OyyGGO...',
  '........OyGGGGgO..',
  '........OGGGGGgO..',
  '.....OOOOGGGGGggOO',
  '....OyyyyyyyGGGggO',
];

/** The face in profile once no spyglass covers it: brim shade, eye, nose, chin. */
const FACE = [
  '.....OOOMMMMMOGggO',
  '.......OSSSSMOGggO',
  '.......OSKSSMOGgO.',
  '......OSSSSSMOggO.',
  '........OSSMMOOO..',
];

/** The oilskin from the chest down and the boots: rm-kit's keeper rows 14 to 28, so they cannot drift. */
const COAT = rmKeeper.rows.slice(14);

/**
 * The keeper with the spyglass in brass: dark brass tube, a glint, ring bands, a blue lens, so it
 * no longer reads as a yellow sleeve. Facing left, 18x29, the same footprint as rmKeeper.
 */
export const rmKeeperBrass: PixelSprite = {
  id: 'rm-keeper-brass',
  name: 'keeper, brass spyglass',
  tags: ['rm', 'character'],
  palette: RM_PALETTE,
  rows: [
    ...HAT,
    'OO...OOOMMMMMOGggO',
    'BgyygOggSSSSMOGggO',
    'OOggOOgOKSSSMOGgO.',
    'OO..SSMOSSSSMOggO.',
    ...rmKeeper.rows.slice(10),
  ],
};

/** The keeper reaching forward at chest height, finger out: to tap a glass, point, pull a lever. 18x29. */
export const rmKeeperReach: PixelSprite = {
  id: 'rm-keeper-reach',
  name: 'keeper, reaching',
  tags: ['rm', 'character'],
  palette: RM_PALETTE,
  rows: [
    ...HAT,
    ...FACE,
    '..........OMMOGO..',
    '........OGGGGGGO..',
    '..OOOOOOOyGGGGGgO.',
    'SSSyyyyyyGgGGGGggO',
    'OSMGGGGGGgGGGGGggO',
    '.OOOOOOOOOgGGGGggO',
    ...COAT.slice(3),
  ],
};

/** The keeper with an arm raised and a finger up: look, up there. 18x29. */
export const rmKeeperRaise: PixelSprite = {
  id: 'rm-keeper-raise',
  name: 'keeper, arm raised',
  tags: ['rm', 'character'],
  palette: RM_PALETTE,
  rows: [
    ...HAT.slice(0, 5),
    '.S..OyyyyyyyGGGggO',
    'OSO..OOOMMMMMOGggO',
    'OSSO...OSSSSMOGggO',
    'OSMO...OSKSSMOGgO.',
    '.OGO..OSSSSSMOggO.',
    '.OyGO...OSSMMOOO..',
    '.OyGGOOO..OMMOGO..',
    '..OGGGGGOGGGGGGO..',
    '...OOOOOGGgGGGGGgO',
    ...COAT,
  ],
};

/**
 * The keeper with a fist lifted in front of the face, holding something up: a lantern hung from the
 * fist at (x - 2, y + 9) from the keeper's corner, or an umbrella whose shaft runs down to (x + 1).
 * 18x29.
 */
export const rmKeeperLift: PixelSprite = {
  id: 'rm-keeper-lift',
  name: 'keeper, holding up',
  tags: ['rm', 'character'],
  palette: RM_PALETTE,
  rows: [
    ...HAT,
    FACE[0],
    '.OO....OSSSSMOGggO',
    'OSSO...OSKSSMOGgO.',
    'OSMO..OSSSSSMOggO.',
    '.OGO....OSSMMOOO..',
    '.OyGOOOOO.OMMOGO..',
    '..OyGGGGOGGGGGGO..',
    '...OOOOOGGgGGGGgO.',
    ...COAT,
  ],
};

/* ── windows ─────────────────────────────────────────────────────────────────────────────────── */

/**
 * The storm window's frame over a calm night: navy sky, a full moon with its path on the water,
 * stars, the far headland and a flat sea. 44x32, the same footprint as rmStormWindow, so a lesson
 * swaps one for the other without moving anything.
 */
export const rmCalmWindow: PixelSprite = {
  id: 'rm-calm-window',
  name: 'calm window',
  tags: ['rm', 'set'],
  blurb: 'The watch-room window on a clear night: moon, stars, the headland, a flat sea, a sill.',
  palette: RM_PALETTE,
  rows: [
    '...DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD...',
    '..DDvvvvvvvvxvvvvvvvvvvvvvvvvvvvvvvvvvvvDD..',
    '.DvvvvvvvvvvvvvvvvvvvvwvvvvvvvvvvvvvvvvvvvD.',
    '.DvvvvvxvvvvvvvvvvvvvvvvvvvvvvvvyyyvvvvvvvD.',
    '.DvvvvvvvvvvvvvxvvvvvvvvvvvvvvvyywwyvvvvvvD.',
    '.DvvvvvvvvvvvvvvvvvvvvvvvvvvvvvywwwyvvvvxvD.',
    '.DvvvvvvvvxvvvvvvvvvvvvvvvvvvvvyywyyvvvvvvD.',
    '.DvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvyyyvvvvvvvD.',
    '.DvvvvvvvvvvvvvvvvvvxvvvvvvvvvvvvvvvvvvvvvD.',
    '.DvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvD.',
    '.DvvvvxvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvD.',
    '.DkkkkvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvD.',
    '.DkkkkkkvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvD.',
    '.DkkkkkkkkuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuD.',
    '.DVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxUVVVVVVVD.',
    '.DVVVVuuuVVVVVVVVVVVVVVVVuuVVVVVVUVVVVVVVVD.',
    '.DVVVVVVVVVVVVuuuVVVVVVVVVVVVVVxUxVVVVuuVVD.',
    '.DvVVVVVVVVVVVVVVVVVVVVVuuuVVVVVVUVVVVVVVVD.',
    '.DvvvvVVVVVVVVVVVVVVVVVVVVVVVVVxUxVVVVVVVVD.',
    '.DvvvvvvuuuVVVVVVVVVVVVVVVVVVVVVUVVVVuuuVVD.',
    '.DvvvvvvvvvvvvvVVVVVVVVVVVVVVVvUxUvvvvvvvvD.',
    '.DvvvvvvvvvvvvvvvvvvvuuuvvvvvvvvUvvvvvvvvvD.',
    '.DvvvuuvvvvvvvvvvvvvvvvvvvvvvvvxUxvvvvuuvvD.',
    '.DvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvUvvvvvvvvvD.',
    '.DvvvvvvvvvvvvvuuuuvvvvvvvvvvvvvUxUvvvvvvvD.',
    '.DvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvUvvvvvvvvD.',
    '.DvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvD.',
    '.DvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvD.',
    '.DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD.',
    'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    '.KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK.',
  ],
};

/**
 * A round brass porthole, storm cloud over a dark sea. 20x20. Its glass is rows 3 to 16; anything
 * laid over it (rmPortRain, rmLightning at +6,+3) is drawn to stay on the glass, off the rim.
 */
export const rmPorthole: PixelSprite = {
  id: 'rm-porthole',
  name: 'porthole',
  tags: ['rm', 'set'],
  palette: RM_PALETTE,
  rows: [
    '.......OOOOOO.......',
    '.....OOGGyyGGOO.....',
    '....OGyGOOOOGGgO....',
    '...OGyOOkkkkOOggO...',
    '..OGyOkkkkkkKKOggO..',
    '..OGOKkkkkkKKKkOgO..',
    '.OGyOKKkkkkkkKkOggO.',
    '.OGOkKKKkkkkkkkkOgO.',
    'OGGOkkkkkkkkKKkkOggO',
    'OyGOuuuuuuuuuuuuOggO',
    'OGGOVVVuuVVVVVVVOggO',
    'OGGOVVVVVVVVuuVVOggO',
    '.OGOvvvvvvvvvvvvOgO.',
    '.OGgOvvvvuuvvvvOggO.',
    '..OGOvvvvvvvvvvOgO..',
    '..OGgOvvvvvvvvOggO..',
    '...OggOOvvvvOOggO...',
    '....OgggOOOOgggO....',
    '.....OOggggggOO.....',
    '.......OOOOOO.......',
  ],
};

/** Rain streaks for the porthole's glass, three frames. Lay it at the porthole's own corner. 20x20. */
export const rmPortRain: PixelSprite = {
  id: 'rm-port-rain',
  name: 'porthole rain',
  tags: ['rm', 'weather'],
  rows: rmPlot(20, 20, [[10, 4, 'X'], [9, 5, 'x'], [14, 7, 'X'], [13, 8, 'x'], [7, 8, 'X'], [6, 9, 'x'], [12, 12, 'X'], [11, 13, 'x']]),
  frames: [
    rmPlot(20, 20, [[10, 4, 'X'], [9, 5, 'x'], [14, 7, 'X'], [13, 8, 'x'], [7, 8, 'X'], [6, 9, 'x'], [12, 12, 'X'], [11, 13, 'x']]),
    rmPlot(20, 20, [[12, 5, 'X'], [11, 6, 'x'], [8, 6, 'X'], [7, 7, 'x'], [15, 10, 'X'], [14, 11, 'x'], [9, 11, 'X'], [8, 12, 'x'], [6, 13, 'X'], [5, 14, 'x']]),
    rmPlot(20, 20, [[9, 3, 'X'], [8, 4, 'x'], [13, 9, 'X'], [12, 10, 'x'], [6, 10, 'X'], [5, 11, 'x'], [11, 14, 'X'], [10, 15, 'x']]),
  ],
  frameMs: 160,
};

/** Two small crests for the porthole's sea; lay at +5,+10 and give a `drift` of 1 so they stay on the glass. 10x2. */
export const rmPortSwell: PixelSprite = {
  id: 'rm-port-swell',
  name: 'porthole swell',
  tags: ['rm', 'sea'],
  rows: [
    '.ww....ww.',
    'wBBw..wBBw',
  ],
};

/* ── calm-sea pieces ─────────────────────────────────────────────────────────────────────────── */

/** The kit swell with its white foam stepped down to the calm sea's crest tones. 34x3. */
export const rmSwellCalm = rmRetint(rmSwell, 'rm-swell-calm', { w: 'U', B: 'u', u: 'V' });

/** One star; give it a `twinkle`. */
export const rmStar: PixelSprite = {
  id: 'rm-star',
  name: 'star',
  tags: ['rm', 'sky'],
  rows: ['w'],
};

/** A glint on gold or glass, a small plus; give it a `twinkle`. 3x3. */
export const rmGlint: PixelSprite = {
  id: 'rm-glint',
  name: 'glint',
  tags: ['rm', 'sparkle'],
  rows: [
    '.w.',
    'wWw',
    '.w.',
  ],
};
