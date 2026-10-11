/**
 * Applied Accounting kit, batch A (lessons 2 to 9): pieces more than one lesson stamps, on top of
 * aa-kit.ts and in the same light (from the left, the lamp side).
 *
 * aaFloor lays the skirting and floorboards of the hall with cast shadows wherever furniture stands;
 * aaFrame hangs a gilt-framed board for a chart. The props are the ones the plan names for more than
 * one lesson: the magnifier (auditing, forensics), the filing cabinet with its top drawer pulled
 * (auditing, then lesson 14) and the adding machine whose crank turns and tape prints (break-even,
 * then lesson 17). AA_AT_A says where each moving bit sits on its piece.
 */
import type { PixelSprite } from '../types';
import { AA_PALETTE } from './aa-kit';

/* ── the room ───────────────────────────────────────────────────────────────────────────────── */

/**
 * Skirting and floorboards, 11 tall: `shadows` are [from, to] columns of a cast shadow on the boards
 * under a piece of furniture, offset one pixel right on the lower row because the light is on the left.
 */
export function aaFloor(id: string, width: number, shadows: [number, number][] = []): PixelSprite {
  const boards = (seams: number[]) => Array.from({ length: width }, (_, x) => (seams.includes(x % 80) ? 'k' : 'K')).join('');
  const shade = (row: string, dx: number) =>
    [...row].map((ch, x) => (shadows.some(([a, b]) => x >= a + dx && x <= b + dx) ? 'z' : ch)).join('');
  const upper = boards([9, 31, 54, 73]);
  const lower = boards([20, 44, 66]);
  return {
    id,
    name: id,
    tags: ['aa', 'scene'],
    palette: AA_PALETTE,
    rows: ['g'.repeat(width), 'O'.repeat(width), upper, upper, upper, 'k'.repeat(width), lower, lower, shade(lower, 0), shade(lower, 1), lower],
  };
}

/** A gilt frame round a `field` (K slate, a paper), lit on the top and left, for a chart on the wall. */
export function aaFrame(id: string, w: number, h: number, field: string): PixelSprite {
  return {
    id,
    name: id,
    tags: ['aa', 'prop'],
    ...(field === 'a' || field === 'c' ? { palette: AA_PALETTE } : {}),
    rows: [
      'O'.repeat(w),
      `O${'y'.repeat(w - 3)}GO`,
      ...Array.from({ length: h - 4 }, () => `OG${field.repeat(w - 4)}gO`),
      `O${'g'.repeat(w - 2)}O`,
      'O'.repeat(w),
    ],
  };
}

/* ── props ──────────────────────────────────────────────────────────────────────────────────── */

/** A reading glass, 13 x 13: brass rim, clear lens with one glint, ebony handle down to the right. */
export const aaMagnifier: PixelSprite = {
  id: 'aa-magnifier',
  name: 'aa-magnifier',
  tags: ['aa', 'prop'],
  palette: AA_PALETTE,
  rows: [
    '...OOOO......',
    '.OOyyyyOO....',
    '.Oya...gO....',
    'Oya.....gO...',
    'Oy......gO...',
    'OG......gO...',
    'OG......gO...',
    '.Og....gO....',
    '.OOggggOOx...',
    '...OOOO.xDK..',
    '.........DKK.',
    '..........DKK',
    '...........DK',
  ],
};

/**
 * A steel filing cabinet, 15 x 33, standing on the floor: the top drawer pulled with folder tabs
 * showing, three closed below, brass handles and white label cards.
 */
export const aaFilingCabinet: PixelSprite = {
  id: 'aa-filing-cabinet',
  name: 'aa-filing-cabinet',
  tags: ['aa', 'prop'],
  palette: AA_PALETTE,
  rows: [
    'DDDDDDDDDDDDDDD',
    'DxxxxxxxxxxxxXD',
    'DKaKKRKKaKKBKKD',
    'DKaaRRRaaaBBBKD',
    ...[0, 1, 2, 3].flatMap((i) => [
      ...(i ? ['DDDDDDDDDDDDDDD'] : []),
      'DxxxxxxxxxxxxkD',
      'DxXXXOaaaOXXXkD',
      'DxXXXXXXXXXXXkD',
      'DxXXyGGGGGgXXkD',
      'DxXXXXXXXXXXXkD',
      'DkkkkkkkkkkkkkD',
    ]),
    'DDDDDDDDDDDDDDD',
    'DDDDDDDDDDDDDDD',
  ],
};

/**
 * An adding machine, 22 x 14, on a desk: black enamel, white keys, a red total key, the paper roll
 * on top. Its crank (aaCrankTurn) and printing tape (aaTapePrint) ride as layers (AA_AT_A).
 */
export const aaAddingMachine: PixelSprite = {
  id: 'aa-adding-machine',
  name: 'aa-adding-machine',
  tags: ['aa', 'prop'],
  palette: AA_PALETTE,
  rows: [
    '.....OOOOOOOO.........',
    '.....OaaaaaaO.........',
    '.....OccccccO.........',
    '..DDDDDDDDDDDDDDD.....',
    '.DXxxxxxxxxxxxxxXD....',
    '.DkKKKKKKKKKKKKKkD....',
    '.DkacacacacacRkKkDO...',
    '.DkKKKKKKKKKKKKKkDO...',
    '.DkacacacacacRkKkD....',
    '.DkKKKKKKKKKKKKKkD....',
    '.DkacacacacacakKkD....',
    'DDDDDDDDDDDDDDDDDDD...',
    'DXXXXXXXXXXXXXXXXXD...',
    'DDDDDDDDDDDDDDDDDDD...',
  ],
};

/** The adding machine's crank going round: up, forward, down, back. Pivot at row 3, column 0. */
export const aaCrankTurn: PixelSprite = {
  id: 'aa-crank-turn',
  name: 'aa-crank-turn',
  tags: ['aa', 'motion'],
  rows: [
    '.RR..',
    '.G...',
    '.G...',
    'yG...',
    '.....',
    '.....',
    '.....',
  ],
  frames: [
    ['.RR..', '.G...', '.G...', 'yG...', '.....', '.....', '.....'],
    ['.....', '.....', '....R', 'yGGGR', '.....', '.....', '.....'],
    ['.....', '.....', '.....', 'yG...', '.G...', '.G...', '.RR..'],
    ['.....', '.....', '.....', 'yg...', '.....', '.....', '.....'],
  ],
  frameMs: 260,
};

/**
 * The tape the machine prints, 4 x 10, rising out of the roll a line at a time until a red total
 * prints, then torn off. Still = the full tape.
 */
const TAPE = ['aac.', '.akc', '.aac', '.akc', '.aac', '.akc', '.aac', '.akc', '.aac', '.aRc'];
const tapeTo = (n: number) => [...Array.from({ length: 10 - n }, () => '....'), ...TAPE.slice(0, n)];
export const aaTapePrint: PixelSprite = {
  id: 'aa-tape-print',
  name: 'aa-tape-print',
  tags: ['aa', 'motion'],
  palette: AA_PALETTE,
  rows: TAPE,
  frames: [tapeTo(1), tapeTo(2), tapeTo(3), tapeTo(4), tapeTo(5), tapeTo(6), tapeTo(7), tapeTo(8), tapeTo(9), TAPE, TAPE, TAPE],
  frameMs: 520,
};

/** Where each moving bit sits, relative to the top-left of the piece it belongs to. */
export const AA_AT_A = {
  crankOnMachine: { x: 18, y: 4 },
  tapeOnMachine: { x: 8, y: -10 },
} as const;
