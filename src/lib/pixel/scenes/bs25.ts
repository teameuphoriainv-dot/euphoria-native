/**
 * Business Strategy lesson 25 opener: the capstone, the house's castle whole and under all five flags.
 *
 * A new set for the last lesson: not a model on the war table this time (that was lesson 10) but the
 * castle itself at night, close up. The keep rises in the middle with four towers about it, and each of
 * the five flies its own colour, green, blue, orchid, teal and red: competitive position, portfolio,
 * finance, organisation and innovation, every dimension of the strategy flown at once and none left
 * bare. The gate is open and lit, the drawbridge is down across the moat, fireworks burst overhead, the
 * court has gathered on the shore to look, and the strategist points up at what the house has built.
 * The stone is the broadest light surface; the flags and fireworks carry the colour. Moving: the flags
 * flap out of step, fireworks rise and burst, windows and the moat glint, the strategist points and
 * blinks, the court shifts and stars twinkle. The backdrop is the pathway's, with lanterns rising and
 * faint fireworks over the realm, for the occasion.
 */
import type { PixelSprite } from '../types';
import { bsBackdrop } from './bs-backdrop';
import { bsLater, bsStar } from './bs-kit';
import { BS_COAT_BLUE, BS_COAT_GOLD, BS_COAT_GREEN, BS_COAT_TEAL, bsRecoloured, bsStrategistStand } from './bs-kit-a';
import { bsFolkBack } from './bs-kit-b';
import { bsKeepsake } from './bs1-finish';
import type { LessonArtSet, SceneArt } from './types';

const castle: PixelSprite = {
  id: 'bs25-castle',
  name: 'castle',
  tags: [],
  blurb: 'The house castle at night, 80x60, a whole opener base: a keep (x 23..38) between two inner towers (12..19, 42..49) and two outer towers (1..6, 53..58), each with a flagpole whose top is at (4, 17), (15, 11), (30, 3), (45, 11) and (56, 17); the gate lit and open, the drawbridge down across the moat (rows 44..48), the shore from row 49 with a road toward us, a crescent moon top right.',
  palette: { V: '#15234D' },
  rows: [
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKGKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKwwwKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKxKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKwxKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKxKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKwwKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKxKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKwwKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKxKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKwwKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKxKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKwxKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKxXKXXKXXKXXKXXKXKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKwwwKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKxXXXXXXXXXXXXXXDKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKGKKKKKKKDDDDDDDDDDDDDDDDKKKKKKGKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKxKKKKKKKxXXXXXXXXXXXXXXDKKKKKKxKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKxKKKKKKKxXXXXXXXXXXXXXXDKKKKKKxKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKxKKKKKKKxXXXXXXXXXXXXXXDKKKKKKxKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKxKKKKKKKxXXOOXXOOXXOOXXDKKKKKKxKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKxKKKKKKKxXXGGXXGGXXGGXXDKKKKKKxKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKGKKKKKKKxXKXXKXXKKKxXXGGXXGGXXGGXXDKKKxXKXXKXXKKKKKKGKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKxKKKKKKKxXXXXXXDKKKxXXXXXXXXXXXXXXDKKKxXXXXXXDKKKKKKxKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKxKKKKKKKDDDDDDDDKKKxXXXXXXXXXXXXXXDKKKDDDDDDDDKKKKKKxKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKxKKKKKKKxXXXXXXDKKKxXXXXXXXXXXXXXXDKKKxXXXXXXDKKKKKKxKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKxKKKKKKKxXXXXXXDKKKxXXXXXXXXXXXXXXDKKKxXXXXXXDKKKKKKxKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKxKKKKKKKxXXXXXXDKKKxXXXXXXXXXXXXXXDKKKxXXXXXXDKKKKKKxKKKKKKKKKKKKKKKKKKKKKKK',
    'KxXKXXKKKKKKxXXOOXXDKKKxXXXXXXXXXXXXXXDKKKxXXOOXXDKKKxXKXXKKKKKKKKKKKKKKKKKKKKKK',
    'KxXXXXDKKKKKxXXGGXXDKKKxXXXXXXXXXXXXXXDKKKxXXGGXXDKKKxXXXXDKKKKKKKKKKKKKKKKKKKKK',
    'KDDDDDDKKKKKxXXGGXXDKKKxXXXXXXXXXXXXXXDKKKxXXGGXXDKKKDDDDDDKKKKKKKKKKKKKKKKKKKKK',
    'KxXXXXDKKKKKxXXXXXXDKKKxXXXXXXXXXXXXXXDKKKxXXXXXXDKKKxXXXXDKKKKKKKKKKKKKKKKKKKKK',
    'KxXXXXDKKKKKxXXXXXXDKKKxXXXXXXXXXXXXXXDKKKxXXXXXXDKKKxXXXXDKKKKKKKKKKKKKKKKKKKKK',
    'KxXXXXDKKKKKxXXXXXXDKKKxXXXXXXXXXXXXXXDKKKxXXXXXXDKKKxXXXXDKKKKKKKKKKKKKKKKKKKKK',
    'KxXXXXDKKKKKxXXXXXXDKKKxXXXXXXXXXXXXXXDKKKxXXXXXXDKKKxXXXXDKKKKKKKKKKKKKKKKKKKKK',
    'KxXOOXDxXKXXxXXXXXXDxXKxXXXXXXXXXXXXXXDxXKxXXXXXXDxXKxXOOXDKKKKKKKKKKKKKKKKKKKKK',
    'KxXGGXDxXXXDxXXXXXXDxXDxXXXXXXXXXXXXXXDxXDxXXXXXXDxXDxXGGXDKKKKKKKKKKKKKKKKKKKKK',
    'KxXGGXDDDDDDxXXXXXXDDDDxXXXXXXXXXXXXXXDDDDxXXXXXXDDDDxXGGXDKKKKKKKKKKKKKKKKKKKKK',
    'KxXXXXDxXXXDxXXXXXXDxXDxXXXXDDDDDDXXXXDxXDxXXXXXXDxXDxXXXXDKKKKKKKKKKKDDDDKKKKKK',
    'KxXXXXDxXXXDxXXXXXXDxXDxXXXDDODODODXXXDxXDxXXXXXXDxXDxXXXXDKKKKKKKKKDDkkkkDDDKKK',
    'KxXXXXDxXXXDxXXXXXXDxXDxXXXDOOOOOODXXXDxXDxXXXXXXDxXDxXXXXDKKKKKKKKDkkkkkkkkkDDD',
    'KxXXXXDxXDDDxXDDXXXDxXDxXXXDOOOOOODDXXDxXDxXXXXDDDxXDxXDDXDKKKKKKDDkkkkkkkkkkkkk',
    'DxXXXXDxXXXDxXXXXXXDxXDxXXXDOggggODXXXDxXDxXXXXXXDxXDxXXXXDKKKKKDkkkkkkkkkkkkkkk',
    'kxXXXXDxXXXDxXXXXXXDxXDxXXXDOggggODXXXDxXDxXXXXXXDxXDxXXXXDKKKDDkkkkkkkkkkkkkkkk',
    'kxXXXXDxXXXDxXXXXXXDxXDxXXXDOgGGgODXXXDxXDxXXXXXXDxXDxXXXXDDDDkkkkkkkkkkkkkkkkkk',
    'kxXDDXDxXXXDxXXXXDDDxXDxXDDDOgGGgODXXXDxXDxXDDXXXDxXDxXXXXDkkkkkkkkkkkkkkkkkkkkk',
    'kxXXXXDxXXXDxXXXXXXDxXDxXXXDOgGGgODXXXDxXDxXXXXXXDxXDxXXXXDkkkkkkkkkkkkkkkkkkkkk',
    'kxXXXXDxXXXDxXXXXXXDxXDxXXXDOgGGgODXXXDxXDxXXXXXXDxXDxXXXXDkkkkkkkkkkkkkkkkkkkkk',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDkkkkkkkkkkkkkkkkkkkk',
    'VVVVVVVVVVVVVVVVVVVVVVVVVVVOggggggOVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV',
    'VVbgbbVVVVVVVVVgVVVVVVbbbVVOOOOOOOOVVVVVVVVVVgVVVVVVbbbgVVVVVVVVVVVVVVbbbbbVVVVV',
    'VVVVOVVVVVVVVVVVOVVVVVVVVVVOggggggOVVVVVVbbbbVOVVVVVVVVVOVVVVVVVVVVVVVVVVVVVVVVV',
    'VVVVVVVVVVVVbbbbbVVVVVVVVVVOOOOOOOOVVVVVVVVVVVVVVVVVVVVVVVVVVVbbbbbbVVVVVVVVVVVV',
    'VVVVVVVVVVVVVVVVVVVVVVVVVVVOggggggOVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV',
    'nnnnnNNnnnnnnnnnnnnNnnnnnnnDDDDDDDDnnnnnnNnnnnnNnnnnnnnnnnnnnnnNNnnnnnnnnnnNnnnn',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkDDDDDDDDkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkKkkkkkkkkKkkkkkkkkkkDDDDDDDDkkkkkkkkKkkkkkkkkKkkkkkkkkKkkkkkkkkKkkkkkkkkK',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkDDDDDDDDDDkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkDDDDDDDDDDkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkKkkkkkkkkKkkkkkkkkkkkkkDDDDDDDDDDkkkkkkkkkkkkKkkkkkkkkKkkkkkkkkKkkkkkkkkKkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkDDDDDDDDDDDDkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkDDDDDDDDDDDDkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkKkkkkkkkkKkkkkkkkkDDDDDDDDDDDDkkkkkkKkkkkkkkkKkkkkkkkkKkkkkkkkkKkkkkkkkkK',
    'kkkkkkkkkkkkkkkkkkkkkkkkDDDDDDDDDDDDDDkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkDDDDDDDDDDDDDDkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
  ],
};

/** A pennant in two tones of one colour, flapping: `hi` is the lit cloth, `lo` the fold. */
function flag(id: string, hi: string, lo: string): PixelSprite {
  const paint = (rows: string[]) => rows.map((row) => row.replace(/H/g, hi).replace(/L/g, lo));
  const out = paint(['HHHHL', 'HHHL.', 'HL...']);
  const lift = paint(['HHHL.', 'HHHHL', 'HHL..']);
  const dip = paint(['HHL..', 'HHHHL', 'HHHL.']);
  return {
    id,
    name: 'flag',
    tags: [],
    blurb: 'A pennant flying right from a pole: place it one pixel right of the pole top.',
    rows: out,
    frames: [out, lift, dip, lift],
    frameMs: 520,
  };
}

const flagGreen = flag('bs25-flag-green', 'N', 'n');
const flagBlue = bsLater(flag('bs25-flag-blue', 'B', 'b'), 'bs25-flag-blue-later', 1, 560);
const flagOrchid = bsLater(flag('bs25-flag-orchid', 'q', 'P'), 'bs25-flag-orchid-later', 2, 600);
const flagTeal = bsLater(flag('bs25-flag-teal', 'T', 't'), 'bs25-flag-teal-later', 3, 540);
const flagRed = bsLater(flag('bs25-flag-red', 'R', 'r'), 'bs25-flag-red-later', 1, 500);

/** A mark on a sprite grid: column, row and the character to put there. */
type Mark = readonly [number, number, string];

/** A `w` x `h` grid with marks on it, so every row of a placed-point sprite comes out the same width. */
function grid(w: number, h: number, marks: readonly Mark[]): string[] {
  const cells = Array.from({ length: h }, () => Array.from({ length: w }, () => '.'));
  for (const [x, y, ch] of marks) cells[y][x] = ch;
  return cells.map((row) => row.join(''));
}

const NEAR: readonly (readonly [number, number])[] = [[4, 2], [4, 6], [2, 4], [6, 4], [3, 3], [5, 3], [3, 5], [5, 5]];
const FAR: readonly (readonly [number, number])[] = [[4, 0], [4, 8], [0, 4], [8, 4], [1, 1], [7, 1], [1, 7], [7, 7]];

/** A firework, 9x9: the rocket climbs, bursts small, opens wide, fades, and the sky rests before the next. */
function burst(id: string, hi: string, mid: string, lo: string): PixelSprite {
  const empty = grid(9, 9, []);
  const wide = grid(9, 9, [[4, 4, 'W'], ...NEAR.map(([x, y]) => [x, y, mid] as const), ...FAR.map(([x, y]) => [x, y, hi] as const)]);
  return {
    id,
    name: 'firework',
    tags: [],
    blurb: 'A firework: the rocket climbs from the bottom row, bursts and fades.',
    rows: wide,
    frames: [
      grid(9, 9, [[4, 8, hi]]),
      grid(9, 9, [[4, 5, hi], [4, 6, lo], [4, 7, lo]]),
      grid(9, 9, [[4, 4, 'W'], [3, 4, hi], [5, 4, hi], [4, 3, hi], [4, 5, hi]]),
      wide,
      grid(9, 9, FAR.map(([x, y]) => [x, y, lo] as const)),
      empty,
      empty,
    ],
    frameMs: 330,
  };
}

const burstGold = burst('bs25-burst-gold', 'y', 'G', 'g');
const burstOrchid = bsLater(burst('bs25-burst-orchid', 'Q', 'q', 'P'), 'bs25-burst-orchid-later', 3, 350);
const burstTeal = bsLater(burst('bs25-burst-teal', 'm', 'T', 't'), 'bs25-burst-teal-later', 5, 310);

const keepGlints: PixelSprite = {
  id: 'bs25-keep-glints',
  name: 'keep-glints',
  tags: [],
  blurb: "Light flickering in the keep's three windows, at (26, 16).",
  rows: grid(10, 1, [[0, 0, 'y'], [4, 0, 'y'], [8, 0, 'y']]),
};

const towerGlints: PixelSprite = {
  id: 'bs25-tower-glints',
  name: 'tower-glints',
  tags: [],
  blurb: "Light flickering in the four towers' windows, at (3, 24).",
  rows: grid(54, 8, [[12, 0, 'y'], [42, 0, 'y'], [0, 7, 'y'], [52, 7, 'y']]),
};

const moatGlints: PixelSprite = {
  id: 'bs25-moat-glints',
  name: 'moat-glints',
  tags: [],
  blurb: 'Moonlight catching the moat, at (6, 45).',
  rows: grid(66, 2, [[0, 0, 'w'], [14, 1, 'w'], [36, 0, 'w'], [48, 1, 'w'], [60, 0, 'w']]),
};

const LIGHT_SKIN = { S: '#F4CBA4', U: '#D6A87C', H: '#3A2418' } as const;
const courtGold = bsRecoloured(bsFolkBack, 'bs25-court-gold', BS_COAT_GOLD);
const courtTeal = bsRecoloured(bsFolkBack, 'bs25-court-teal', BS_COAT_TEAL, LIGHT_SKIN);
const courtGreen = bsRecoloured(bsFolkBack, 'bs25-court-green', BS_COAT_GREEN, LIGHT_SKIN);
const courtBlue = bsRecoloured(bsFolkBack, 'bs25-court-blue', BS_COAT_BLUE);

export const bs25Opener: SceneArt = {
  id: 'bs25-opener',
  label: 'The house castle at night flies five flags of five colours as fireworks burst overhead, while a strategist points up at it and the court gathers on the shore.',
  width: 80,
  height: 60,
  base: castle,
  layers: [
    { sprite: bsStar, x: 21, y: 7, motion: { kind: 'twinkle', periodMs: 2200, min: 0.2 } },
    { sprite: bsStar, x: 52, y: 19, motion: { kind: 'twinkle', periodMs: 2700, phase: 0.5, min: 0.2 } },
    { sprite: bsStar, x: 66, y: 22, motion: { kind: 'twinkle', periodMs: 2400, phase: 0.8, min: 0.2 } },
    { sprite: bsStar, x: 77, y: 14, motion: { kind: 'twinkle', periodMs: 3000, phase: 0.3, min: 0.2 } },
    { sprite: burstGold, x: 4, y: 3 },
    { sprite: burstOrchid, x: 39, y: 1 },
    { sprite: burstTeal, x: 60, y: 5 },
    { sprite: flagGreen, x: 5, y: 17 },
    { sprite: flagBlue, x: 16, y: 11 },
    { sprite: flagOrchid, x: 31, y: 3 },
    { sprite: flagTeal, x: 46, y: 11 },
    { sprite: flagRed, x: 57, y: 17 },
    { sprite: keepGlints, x: 26, y: 16, motion: { kind: 'twinkle', periodMs: 2600, min: 0.3 } },
    { sprite: towerGlints, x: 3, y: 24, motion: { kind: 'twinkle', periodMs: 3100, phase: 0.5, min: 0.3 } },
    { sprite: moatGlints, x: 6, y: 45, motion: { kind: 'twinkle', periodMs: 2200, phase: 0.2, min: 0.1 } },
    { sprite: courtGold, x: 7, y: 48, motion: { kind: 'bob', amp: 1, periodMs: 2300 } },
    { sprite: courtTeal, x: 15, y: 47, motion: { kind: 'bob', amp: 1, periodMs: 2600, phase: 0.4 } },
    { sprite: courtGreen, x: 40, y: 47, motion: { kind: 'bob', amp: 1, periodMs: 2100, phase: 0.7 } },
    { sprite: courtBlue, x: 48, y: 48, motion: { kind: 'bob', amp: 1, periodMs: 2500, phase: 0.2 } },
    { sprite: bsStrategistStand, x: 57, y: 28 },
  ],
};

const skyLantern: PixelSprite = {
  id: 'bs25-sky-lantern',
  name: 'sky-lantern',
  tags: [],
  blurb: 'A paper lantern drifting up, in night colours, for a rise layer.',
  rows: [
    'O',
    '1',
  ],
};

const nightBurstOrchid: PixelSprite = {
  id: 'bs25-night-burst-orchid',
  name: 'night-burst-orchid',
  tags: [],
  blurb: 'A far firework in night colours, for a twinkle layer.',
  rows: [
    '.p.p.',
    'p...p',
    '..O..',
    'p...p',
    '.p.p.',
  ],
};

const nightBurstTeal: PixelSprite = {
  ...nightBurstOrchid,
  id: 'bs25-night-burst-teal',
  name: 'night-burst-teal',
  rows: nightBurstOrchid.rows.map((row) => row.replace(/p/g, 't')),
};

const nightBurstGold: PixelSprite = {
  ...nightBurstOrchid,
  id: 'bs25-night-burst-gold',
  name: 'night-burst-gold',
  rows: nightBurstOrchid.rows.map((row) => row.replace(/O/g, '1').replace(/p/g, 'O')),
};

/** The pathway backdrop on its own base, dressed for the capstone: lanterns rising and far fireworks over the realm. */
export const bs25Backdrop: SceneArt = {
  ...bsBackdrop,
  id: 'bs25-backdrop',
  label: 'A castle at night in its moat as lanterns rise and fireworks bloom over it, with a rival fort on one hill and a camp of newcomers by a fire on the other.',
  layers: [
    ...bsBackdrop.layers,
    { sprite: nightBurstOrchid, x: 24, y: 1, motion: { kind: 'twinkle', periodMs: 3400, min: 0.1 } },
    { sprite: nightBurstGold, x: 70, y: 0, motion: { kind: 'twinkle', periodMs: 4100, phase: 0.45, min: 0.1 } },
    { sprite: nightBurstTeal, x: 100, y: 2, motion: { kind: 'twinkle', periodMs: 3700, phase: 0.8, min: 0.1 } },
    { sprite: skyLantern, x: 40, y: 8, motion: { kind: 'rise', amp: 8, periodMs: 5200 } },
    { sprite: skyLantern, x: 84, y: 10, motion: { kind: 'rise', amp: 9, periodMs: 6100, phase: 0.4 } },
    { sprite: skyLantern, x: 68, y: 14, motion: { kind: 'rise', amp: 8, periodMs: 5600, phase: 0.75 } },
  ],
};

const emblem: PixelSprite = {
  id: 'bs25-emblem-five-flags',
  name: 'emblem-five-flags',
  tags: [],
  blurb: 'Lesson 25 emblem, 16x16, the capstone mark: a gold keep in its moat under five flags, green, blue, orchid, teal and red.',
  rows: [
    '.......xqq......',
    '.......xqP......',
    '....xBBxq.xTT...',
    '....xBbx..xTt...',
    '.xNNxB.x..xT.xRR',
    '.xNnx..x..x..xRr',
    '.xN.x..x..x..xR.',
    '.x..x..x..x..x..',
    'yG.GG.GG.GG.GG.g',
    'OyGGGGGGGGGGGGgO',
    'OyGOGGGGGGGGOGgO',
    'OyGGGGOOOOGGGGgO',
    'OyGGGOKKKKOGGGgO',
    'OOOOOOKKKKOOOOOO',
    '.bBBwBBBBBBwBBb.',
    '..bbbbbbbbbbbb..',
  ],
};

export const bs25Finish: SceneArt = bsKeepsake(
  'bs25-finish',
  'A purple house banner on a gold rod, its roundel showing a gold keep in its moat under five flags of five colours, the capstone mark.',
  emblem,
);

export const art: LessonArtSet = { opener: bs25Opener, backdrop: bs25Backdrop, finish: bs25Finish };
