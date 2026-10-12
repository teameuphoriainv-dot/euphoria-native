/**
 * Applied Accounting lesson 20, Nonprofit & Government Accounting: money with strings attached, kept
 * in separate funds.
 *
 * Three funds stand on the counting-house counter under a plate reading FUND, each kept apart. On the
 * left, gifts without donor restrictions: an open glass jar of coins anyone may spend. In the middle,
 * gifts with them: a canvas sack tied shut with a red cord, a kraft tag hanging off the cord, the
 * strings attached. On the right the endowment, kept for good: an iron strongbox under a brass
 * padlock. Over the jar hangs a donation box with a red heart, and on the far wall the charter for
 * public money, GASB. Moving: a gift drops from the box into the jar and a coin through the
 * strongbox's slot, the tag swings on its cord, the padlock glints, dust rises.
 */
import type { PixelSprite } from '../types';
import { AA_PALETTE, aaCharter, aaCompose, aaGlint, aaMote, aaPlaque } from './aa-kit';
import { aaFloor } from './aa-kit-a';
import { aaPaint } from './aa-kit-c';
import { aaKeepsake } from './aa1-finish';
import { aaBackdrop } from './aa-backdrop';
import type { LessonArtSet, SceneArt } from './types';

const sprite = (id: string, rows: string[], palette?: Record<string, string>): PixelSprite =>
  ({ id, name: id, tags: ['aa', 'aa20'], rows, ...(palette ? { palette } : {}) });

/** Kraft card for the tag on the restricted gift. */
const KRAFT = { u: '#C49A6C', v: '#8E6A44' };

/** The counter, 78 x 15: a brass rail along the top, three raised panels, one under each fund. */
const STILES = [0, 26, 52, 77];
const counter = aaPaint('aa20-counter', 78, 15, (x, y) => {
  if (y === 0 || y === 2 || y >= 13) return 'O';
  if (y === 1) return x === 0 ? 'y' : x === 77 ? 'g' : 'G';
  if (STILES.includes(x) || y === 3 || y === 12) return 'O';
  const left = Math.max(...STILES.filter((s) => s < x));
  const right = Math.min(...STILES.filter((s) => s > x));
  if (x === left + 1 || y === 4) return 'g';
  return x === right - 1 || y === 11 ? 'K' : 'O';
});

/** Without restrictions: an open glass jar, 15 x 19, coins heaped in its lower half. */
const JAR_PILE: Record<number, number> = { 9: 2, 10: 4, 11: 5, 12: 6, 13: 7, 14: 7, 15: 7, 16: 7, 17: 7 };
const jar = aaPaint('aa20-jar', 15, 19, (x, y) => {
  if (y === 0) return x >= 2 && x <= 12 ? 'c' : '.';
  if (y === 1) return x === 2 || x === 12 ? 'c' : '.';
  if (y === 2) return x === 1 || x === 13 ? 'c' : '.';
  if (y === 18) return x >= 1 && x <= 13 ? 'c' : '.';
  if (x === 0 || x === 14) return 'c';
  const half = JAR_PILE[y] ?? 0;
  if (half && Math.abs(x - 7) <= half) return y === 9 || (y === 10 && Math.abs(x - 7) > 2) ? 'y' : y % 2 ? 'G' : 'g';
  return x === 1 && y >= 3 && y <= 8 ? 'a' : '.';
});

/** With restrictions: a canvas sack, 18 x 19, its neck tied with red cord, a gold $ on it. */
const SACK_SPAN: Record<number, [number, number]> = {
  5: [5, 12], 6: [4, 13], 7: [3, 14], 8: [2, 15], 9: [1, 16], 16: [1, 16], 17: [2, 15], 18: [3, 14],
};
const DOLLAR = ['..G..', '.GGGG', 'G.G..', '.GGG.', '..G.G', 'GGGG.', '..G..'];
const sack = aaPaint('aa20-sack', 18, 19, (x, y) => {
  if (y === 0) return x >= 4 && x <= 13 ? 'O' : '.';
  if (y === 1) return x === 5 || x === 12 ? 'O' : x > 5 && x < 12 ? (x === 11 ? 'c' : 'a') : '.';
  if (y === 2) return x === 6 || x === 11 ? 'O' : x > 6 && x < 11 ? (x === 10 ? 'c' : 'a') : '.';
  if (y === 3 || y === 4) return x >= 6 && x <= 11 ? (y === 4 && (x === 6 || x === 11) ? 'r' : 'R') : '.';
  const [a, b] = SACK_SPAN[y] ?? [0, 17];
  if (x < a || x > b) return '.';
  if (x === a || x === b || y === 18) return 'O';
  if (y === 17) return 'X';
  const d = DOLLAR[y - 9]?.[x - 6];
  if (d && d !== '.') return d;
  return x === b - 1 ? 'c' : 'a';
});

/** The endowment: an iron strongbox, 22 x 15, banded and riveted, a coin slot in its lid. */
const BANDS = [4, 17];
const strongbox = aaPaint('aa20-strongbox', 22, 15, (x, y) => {
  if (y === 0) return x === 0 || x === 21 ? '.' : 'D';
  if (y === 5) return 'K';
  if (y === 14 || x === 0 || x === 21) return 'D';
  if (y === 1) return x >= 9 && x <= 12 ? 'K' : 'X';
  if (BANDS.includes(x)) return [2, 4, 7, 10, 13].includes(y) ? 'c' : 'K';
  return x === 1 ? 'X' : x === 20 ? 'k' : 'D';
});

/** A brass padlock, 9 x 10, its steel shackle through the strongbox's hasp at the lid seam. */
const padlock = sprite('aa20-padlock', [
  '..ccccc..',
  '.cc...cc.',
  '.c.....c.',
  'OyGGGGGgO',
  'OyGGGGGgO',
  'OGGGKGGgO',
  'OGGGKGGgO',
  'OGGGGGGgO',
  'OgggggggO',
  '.OOOOOOO.',
], AA_PALETTE);

/** A donation box on the wall over the jar, 17 x 11, a red heart on it: the gifts come in here. */
const HEART_ON_BOX = ['.RR.RR.', 'RRRRRRR', '.RRRRR.', '..RRR..', '...R...'];
const donationBox = aaPaint('aa20-donation-box', 17, 11, (x, y) => {
  if (y >= 9) return x >= 7 && x <= 9 ? (x === 8 ? (y === 9 ? 'K' : '.') : 'O') : '.';
  if (y === 0) return x >= 1 && x <= 15 ? 'O' : '.';
  if (y === 8 || x === 0 || x === 16) return 'O';
  if (y === 1) return x >= 6 && x <= 10 ? 'K' : x === 1 ? 'y' : x === 15 ? 'g' : 'G';
  const h = HEART_ON_BOX[y - 3]?.[x - 5];
  if (h === 'R') return 'R';
  return x === 1 ? 'G' : x === 15 ? 'O' : 'g';
});

const JAR = { x: 6, y: 24 };
const SACK = { x: 30, y: 24 };
const BOX = { x: 54, y: 28 };

const base = aaCompose('aa20-opener-base', 80, 60, 'k', [
  { sprite: aaFloor('aa20-floor', 80, [[1, 78]]), x: 0, y: 49 },
  { sprite: aaPlaque('aa20-opener-plate', 'FUND'), x: 31, y: 1 },
  { sprite: aaCharter('aa20-charter', 'GASB'), x: 58, y: 3 },
  { sprite: donationBox, x: JAR.x - 1, y: 2 },
  { sprite: counter, x: 1, y: 43 },
  { sprite: jar, ...JAR },
  { sprite: sack, ...SACK },
  { sprite: strongbox, ...BOX },
  { sprite: padlock, x: BOX.x + 6, y: BOX.y + 3 },
]);

/** A coin falling `fall` rows and gone, then a pause: a frame per step. */
const dropping = (id: string, fall: number, pause: number): PixelSprite => {
  const at = (row: number) => Array.from({ length: fall + 1 }, (_, y) => (y === row ? 'yGg' : '...'));
  const steps = Array.from({ length: Math.ceil(fall / 3) + 1 }, (_, i) => at(Math.min(i * 3, fall)));
  return {
    ...sprite(id, at(-1)),
    frames: [...steps, ...Array.from({ length: pause }, () => at(-1))],
    frameMs: 240,
  };
};

/** The tag on the sack's cord, swinging: hanging, out to the right, hanging, back to the left. */
const TAG = ['uuuv', 'uKuv', 'uuuv', 'uuuv', 'vvvv'];
const tagAt = (shift: number) => [
  'Rr......',
  '..r.....',
  shift > 0 ? '...r....' : '..r.....',
  shift > 0 ? '....r...' : shift < 0 ? '..r.....' : '...r....',
  ...TAG.map((r) => `${'.'.repeat(2 + shift)}${r}${'.'.repeat(2 - shift)}`),
];
const tag: PixelSprite = {
  ...sprite('aa20-tag', tagAt(0), KRAFT),
  frames: [tagAt(0), tagAt(1), tagAt(0), tagAt(-1)],
  frameMs: 520,
};

export const aa20Opener: SceneArt = {
  id: 'aa20-opener',
  label: 'Three funds stand apart on a counter under a brass plate reading FUND: an open jar of coins fed from a donation box with a red heart, a sack tied shut with a red cord and a hanging tag, and an iron strongbox under a padlock, beside a framed charter reading GASB.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: dropping('aa20-coin-jar', 18, 4), x: JAR.x + 6, y: 13 },
    { sprite: dropping('aa20-coin-box', 11, 6), x: BOX.x + 9, y: 18 },
    { sprite: tag, x: SACK.x + 11, y: SACK.y + 3 },
    { sprite: aaGlint, x: BOX.x + 7, y: BOX.y + 5, motion: { kind: 'twinkle', periodMs: 2600, min: 0.4 } },
    { sprite: aaMote, x: 27, y: 33, motion: { kind: 'rise', amp: 5, periodMs: 3300 } },
    { sprite: aaMote, x: 51, y: 30, motion: { kind: 'rise', amp: 4, periodMs: 3800, phase: 0.5 } },
  ],
};

/** Lesson 20 emblem: a gilt heart tied with red cord in a bow, a gift with strings attached. */
const HEART = [
  '................',
  '................',
  '................',
  '...OOO....OOO...',
  '..OyyGO..OyGGO..',
  '.OyaGGGOOGGGGgO.',
  '.OyGGGGGGGGGGgO.',
  '.OyGGGGGGGGGGgO.',
  '.OGGGGGGGGGGGgO.',
  '..OGGGGGGGGGgO..',
  '...OGGGGGGGgO...',
  '....OGGGGGgO....',
  '.....OGGGgO.....',
  '......OGgO......',
  '.......OO.......',
  '................',
];
const BOW = ['....RRR..RRR....', '.....RRrrRR.....'];
const emblemHeart = aaPaint('aa-emblem-heart', 16, 16, (x, y) => {
  if (y === 1 || y === 2) return BOW[y - 1][x];
  const h = HEART[y][x];
  if ((x === 7 || x === 8) && y >= 3 && y <= 13) return x === 7 ? 'R' : 'r';
  if ((y === 8 || y === 9) && h !== '.') return y === 8 ? 'R' : 'r';
  return h;
});

export const aa20Finish = aaKeepsake(
  'aa20-finish',
  'A purple leather ledger with gold corners and a red ribbon bookmark, its cover stamped with a gold heart tied with red cord in a bow, with small glints and check marks around it.',
  emblemHeart,
);

export const art: LessonArtSet = { opener: aa20Opener, backdrop: aaBackdrop, finish: aa20Finish };
