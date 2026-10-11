/**
 * Global Economics lesson 5: inflation and deflation, at a night market on the pier.
 *
 * The student holds up the same coin as in lesson 1 beside a market stall. Tied to the stall, a red
 * balloon blows up bigger and bigger while the price tag on its string climbs 1, 2, 3, 4: prices
 * inflating, so one coin buys less. When it can stretch no further it goes back to small and 1,
 * which is deflation. Only small layers move: the balloon and its tag, the coin's glint, the
 * stall's lantern, the pier lamps, the stars and the lights of the far town.
 *
 * The keepsake's emblem is the balloon with its tag, blowing up.
 */
import type { PixelSprite } from '../types';
import { geBackdrop } from './ge-backdrop';
import { GE_PALETTE, GE_STUDENT_HOLD, geCoinSmall, geCompose, geStamp, geStar, geStarBig, geStudent, geTint } from './ge-kit';
import { GE_PIER_LAMPS, GE_TAG_MARK, geGroundPier, geLampGlow, geShadow, geTag } from './ge-kit-a';
import { geKeepsake } from './ge1-finish';
import type { LessonArtSet, SceneArt } from './types';

/* ── one-off props ──────────────────────────────────────────────────────────────────────────── */

/** The market stall, 30x24: a striped awning, a lantern, bread, apples and fish on the counter. */
const stall: PixelSprite = {
  id: 'ge5-opener-stall',
  name: 'market stall',
  tags: ['ge5', 'prop'],
  blurb: 'A night market stall with a red and cream awning, a lantern, and bread, apples and fish on its counter.',
  palette: GE_PALETTE,
  rows: [
    '.uuuuuuuuuuuuuuuuuuuuuuuuuuuu.',
    'urrAArrAArrAArrAArrAArrAArrAAu',
    'urrAArrAArrAArrAArrAArrAArrAAu',
    'urrAArrAArrAArrAArrAArrAArrAAu',
    '.r.A.r.A.r.A.r.A.r.A.r.A.r.A..',
    '.lukkkkkkkkkkkkDkkkkkkkkkkklu.',
    '.lukkkkkkkkkkkOOOkkkkkkkkkklu.',
    '.lukkkkkkkkkkOyyyOkkkkkkkkklu.',
    '.lukkkkkkkkkkkOOOkkkkkkkkkklu.',
    '.lukkkkkkkkkkkkkkkkkkkkkkkklu.',
    '.lukko4okko4okkrRrRrRrXzzxklu.',
    '.luko444oo444oklllllllXxxzklu.',
    '.lukooooooooookuuuuuuuXzzxklu.',
    'uoooooooooooooooooooooooooooou',
    'ullllllllllllllllllllllllllllu',
    'ullllllllllllllllllllllllllllu',
    'uuuuuuuuuuuuuuuuuuuuuuuuuuuuuu',
    'ullllllllllllllllllllllllllllu',
    'ullllllllllllllllllllllllllllu',
    'uuuuuuuuuuuuuuuuuuuuuuuuuuuuuu',
    'ullllllllllllllllllllllllllllu',
    'ullllllllllllllllllllllllllllu',
    'ullllllllllllllllllllllllllllu',
    'uuuuuuuuuuuuuuuuuuuuuuuuuuuuuu',
  ],
};

/** A crescent moon, 5x6. */
const moon: PixelSprite = {
  id: 'ge5-opener-moon',
  name: 'moon',
  tags: ['ge5'],
  blurb: 'A pale crescent moon.',
  palette: GE_PALETTE,
  rows: [
    '..AA.',
    '.Az..',
    'Az...',
    'Az...',
    '.Az..',
    '..AA.',
  ],
};

/**
 * A balloon, `a` pixels either side of column `cx` and `2b` tall, its last row on row `bottom`:
 * dark red outline, red body lit on its upper left, one highlight.
 */
function balloonOnto(rows: readonly string[], cx: number, bottom: number, a: number, b: number): string[] {
  const cy = bottom + 0.5 - b;
  const inside = (x: number, y: number) => ((x - cx) / (a + 0.5)) ** 2 + ((y - cy) / b) ** 2 <= 1;
  const out = rows.map((row) => row.split(''));
  for (let y = bottom + 1 - 2 * b; y <= bottom; y += 1) {
    for (let x = cx - a; x <= cx + a; x += 1) {
      if (!inside(x, y)) continue;
      const edge = !inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || !inside(x, y + 1);
      out[y][x] = edge ? '1' : x < cx && y < cy ? 'R' : 'r';
    }
  }
  out[Math.round(cy - b / 2)][cx - Math.ceil(a / 2)] = 's';
  out[bottom + 1][cx] = '1';
  return out.map((row) => row.join(''));
}

/** What the tag says, one price after another. */
const digits = [
  ['..K..', '.KK..', '..K..', '..K..', '.KKK.'],
  ['.KK..', '...K.', '..K..', '.K...', '.KKK.'],
  ['.KK..', '...K.', '..K..', '...K.', '.KK..'],
  ['.K.K.', '.K.K.', '.KKK.', '...K.', '...K.'],
] as const;

const BALLOON = { w: 14, h: 26, cx: 6, bottom: 11 } as const;

/** The balloon at `size` (0 to 3) on its string, the tag threaded on the string showing `price`. */
function balloonFrame(size: number): string[] {
  const { w, h, cx, bottom } = BALLOON;
  let rows: string[] = Array.from({ length: h }, () => '.'.repeat(w));
  for (let y = bottom + 2; y < h; y += 1) rows = geStamp(rows, ['x'], cx, y);
  rows = geStamp(rows, geStamp(geTag.rows, digits[size], GE_TAG_MARK.x, GE_TAG_MARK.y), cx - 1, 14);
  return balloonOnto(rows, cx, bottom, size + 2, size + 3);
}

const balloonFrames = [0, 1, 2, 3].map(balloonFrame);

const balloon: PixelSprite = {
  id: 'ge5-opener-balloon',
  name: 'price balloon',
  tags: ['ge5', 'animated'],
  blurb: 'A red balloon blowing up bigger while the price tag on its string climbs from 1 to 4.',
  palette: GE_PALETTE,
  rows: balloonFrames[3],
  frames: balloonFrames,
  frameMs: 850,
};

/* ── the opener ─────────────────────────────────────────────────────────────────────────────── */

const STALL = { x: 44, y: 30 };
/** Where the student stands. The coin and the shadow are placed from it. */
const STUDENT = { x: 16, y: 33 };

const base = geCompose('ge5-opener-base', geGroundPier, [
  { sprite: moon, x: 9, y: 4 },
  { sprite: stall, x: STALL.x, y: STALL.y },
  { sprite: geShadow, x: STUDENT.x + 7, y: STUDENT.y + 24 },
  { sprite: geStudent, x: STUDENT.x, y: STUDENT.y },
]);

/** The far town's windows. */
const townLight = geTint(geStar, 'ge5-opener-town-light', { z: 'G' });

export const ge5Opener: SceneArt = {
  id: 'ge5-opener',
  label: 'At a night market on a pier, a student holds up a coin beside a stall where a red balloon keeps blowing up bigger while the price tag on its string climbs from 1 to 4.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: balloon, x: STALL.x + 1 - BALLOON.cx, y: STALL.y - BALLOON.h },
    { sprite: geCoinSmall, x: STUDENT.x + GE_STUDENT_HOLD.x, y: STUDENT.y + GE_STUDENT_HOLD.y },
    { sprite: geLampGlow, x: STALL.x + 14, y: STALL.y + 7, motion: { kind: 'twinkle', periodMs: 1900, min: 0.5 } },
    { sprite: geLampGlow, x: GE_PIER_LAMPS[0].x, y: GE_PIER_LAMPS[0].y, motion: { kind: 'twinkle', periodMs: 2700, min: 0.45 } },
    { sprite: geLampGlow, x: GE_PIER_LAMPS[1].x, y: GE_PIER_LAMPS[1].y, motion: { kind: 'twinkle', periodMs: 3300, phase: 0.5, min: 0.45 } },
    { sprite: geStarBig, x: 30, y: 3, motion: { kind: 'twinkle', periodMs: 2500, min: 0.3 } },
    { sprite: geStar, x: 20, y: 11, motion: { kind: 'twinkle', periodMs: 1900, phase: 0.4, min: 0.2 } },
    { sprite: geStar, x: 62, y: 5, motion: { kind: 'twinkle', periodMs: 2300, phase: 0.7, min: 0.2 } },
    { sprite: geStar, x: 74, y: 12, motion: { kind: 'twinkle', periodMs: 2100, phase: 0.2, min: 0.25 } },
    { sprite: townLight, x: 63, y: 22, motion: { kind: 'twinkle', periodMs: 3100, phase: 0.1, min: 0.35 } },
    { sprite: townLight, x: 17, y: 24, motion: { kind: 'twinkle', periodMs: 2700, phase: 0.6, min: 0.35 } },
  ],
};

/* ── the keepsake ───────────────────────────────────────────────────────────────────────────── */

/** A small tag, 6x5, threaded on the emblem's string, a gold price mark on it. */
const smallTag = ['..OOOO', '.OAAAO', 'OKAyAO', '.OAAAO', '..OOOO'];

function emblemFrame(a: number, b: number, shine: boolean): string[] {
  let rows: string[] = Array.from({ length: 16 }, () => '.'.repeat(16));
  for (let y = 11; y < 16; y += 1) rows = geStamp(rows, ['x'], 7, y);
  rows = geStamp(rows, smallTag, 6, 11);
  rows = balloonOnto(rows, 7, 9, a, b);
  if (shine) rows = geStamp(rows, ['z'], 7 - Math.ceil(a / 2), Math.round(9.5 - b - b / 2));
  return rows;
}

/** Inflation: a red balloon on a string with a price tag, blowing up and shining. */
const emblemBalloon: PixelSprite = {
  id: 'ge5-emblem-balloon',
  name: 'emblem price balloon',
  tags: ['ge', 'emblem', 'animated'],
  blurb: 'A red balloon blowing up on a string, a small price tag tied below it.',
  palette: GE_PALETTE,
  rows: emblemFrame(5, 5, false),
  frames: [emblemFrame(3, 4, false), emblemFrame(4, 4, false), emblemFrame(5, 5, false), emblemFrame(5, 5, true)],
  frameMs: 700,
};

export const ge5Finish: SceneArt = geKeepsake(
  'ge5-finish',
  'A postage stamp with perforated edges and an emerald frame, showing a red balloon blowing up on a string with a small price tag tied below it, with small sparkles around it.',
  emblemBalloon,
);

export const art: LessonArtSet = { opener: ge5Opener, backdrop: geBackdrop, finish: ge5Finish };
