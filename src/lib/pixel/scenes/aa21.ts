/**
 * Applied Accounting lesson 21, Managerial Accounting & Decision Making: only the costs that change
 * with the choice decide it.
 *
 * The bookkeeper stands at a signpost in the hall with the figures open in their hands, the
 * make-or-buy decision in front of them. One arm of the post points left to MAKE, over a workbench
 * where a gear turns beside a hammer, its blueprint pinned up behind; the other points right to BUY,
 * over a stack of bought-in crates with a price tag hanging off one. Moving: the gear turns, the tag swings, a question mark rises
 * over the bookkeeper, the brass catches the light, the bookkeeper blinks, dust rises.
 */
import type { PixelSprite } from '../types';
import { AA_AT, AA_PALETTE, aaBlink, aaCompose, aaGlint, aaMote, aaText } from './aa-kit';
import { aaFloor, aaFrame } from './aa-kit-a';
import { aaBookkeeperStanding } from './aa-kit-b';
import { aaHeldBook, aaPaint } from './aa-kit-c';
import { aaKeepsake } from './aa1-finish';
import { aaBackdrop } from './aa-backdrop';
import type { LessonArtSet, SceneArt } from './types';

const sprite = (id: string, rows: string[], palette?: Record<string, string>): PixelSprite =>
  ({ id, name: id, tags: ['aa', 'aa21'], rows, ...(palette ? { palette } : {}) });

/** Deal for the crates. */
const WOOD = { u: '#C49A6C', v: '#8E6A44' };

/* ── the signpost ───────────────────────────────────────────────────────────────────────────── */

const POST_X = 39;
const post = sprite('aa21-post', ['.y.', 'yGg', ...Array.from({ length: 54 }, () => 'GgO')]);

/** A finger board, `text` cut in it, pointing `dir`: brass with a dark edge, 9 tall, its point 4 deep. */
const finger = (id: string, text: string, dir: 'left' | 'right') => {
  const t = aaText(`${id}-text`, text, 'K').rows;
  const w = t[0].length + 9;
  const textAt = dir === 'left' ? w - 3 - t[0].length : 3;
  return aaPaint(id, w, 9, (i, y) => {
    const x = dir === 'left' ? i : w - 1 - i;
    const tip = Math.abs(y - 4);
    if (x < tip) return '.';
    if (x === tip || y === 0 || y === 8 || x === w - 1) return 'O';
    const g = t[y - 2]?.[i - textAt];
    if (g && g !== '.') return 'K';
    return y === 1 ? 'y' : y === 7 ? 'g' : 'G';
  });
};
const make = finger('aa21-make', 'MAKE', 'left');
const buy = finger('aa21-buy', 'BUY', 'right');

/* ── MAKE: the workbench ────────────────────────────────────────────────────────────────────── */

const bench = sprite('aa21-bench', [
  'O'.repeat(22),
  `y${'G'.repeat(20)}g`,
  'O'.repeat(22),
  ...Array.from({ length: 11 }, (_, i) => (i === 6 ? `.OgO${'O'.repeat(14)}OgO.` : `.OgO${'.'.repeat(14)}OgO.`)),
]);
const bracket = sprite('aa21-bracket', ['...O...', '..OgO..', '..OgO..', '.Og.gO.', '.Og.gO.', 'OO...OO']);
const hammer = sprite('aa21-hammer', ['......XD', 'OggggGXD', '......XD']);

/** A brass gear, 11 x 11, turned `turn` radians: eight teeth round a hub. */
const gearRows = (turn: number) => Array.from({ length: 11 }, (_, y) => Array.from({ length: 11 }, (_, x) => {
  const dx = x - 5;
  const dy = y - 5;
  const d = Math.hypot(dx, dy);
  const tooth = Math.cos(8 * (Math.atan2(dy, dx) + turn)) > 0.2;
  if (d > 5.4 || (d > 4.2 && !tooth)) return '.';
  if (d < 1.3) return 'K';
  if (d > 4.2) return dx + dy < 0 ? 'y' : 'g';
  return dx + dy < -2 ? 'y' : dx + dy > 2 ? 'g' : 'G';
}).join(''));
const gear: PixelSprite = {
  ...sprite('aa21-gear', gearRows(0)),
  frames: [0, 1, 2].map((k) => gearRows((k * Math.PI) / 12)),
  frameMs: 240,
};

/** The plan for what would be made, pinned up over the bench: a white gear drawn on blueprint blue. */
const blueprint = aaCompose('aa21-blueprint', 20, 14, '.', [
  { sprite: aaFrame('aa21-blueprint-frame', 20, 14, 'b'), x: 0, y: 0 },
  { sprite: aaPaint('aa21-blueprint-drawing', 16, 10, (x, y) => {
    const d = Math.hypot(x - 5, y - 4.5);
    const tooth = Math.cos(6 * Math.atan2(y - 4.5, x - 5)) > 0.5;
    if ((d > 2.4 && d < 3.4) || (d >= 3.4 && d < 4.4 && tooth) || d < 0.9) return 'a';
    if (y === 9 && x >= 1 && x <= 9) return 'B';
    if (x >= 11 && x <= 14 && y >= 2 && y <= 7) return x === 11 || x === 14 || y === 2 || y === 7 ? 'B' : '.';
    return '.';
  }), x: 2, y: 2 },
]);

/* ── BUY: the crates ────────────────────────────────────────────────────────────────────────── */

/** A slatted deal crate, w x h, a seam every third row. */
const crate = (id: string, w: number, h: number) => aaPaint(id, w, h, (x, y) => {
  if (x === 0 || x === w - 1 || y % 3 === 0 || y === h - 1) return 'O';
  return y % 3 === 1 ? 'u' : 'v';
}, WOOD);

/** The price tag on its string, swinging from a nail on the top crate: a white card with a $. */
const TAG = ['aaaac', ...aaText('aa21-tag-dollar', '$', 'K').rows.map((r) => `a${r.replace(/\./g, 'a')}c`), 'ccccc'];
const tagAt = (shift: number) => [
  '...X...',
  shift > 0 ? '....X..' : shift < 0 ? '..X....' : '...X...',
  ...TAG.map((r) => `${'.'.repeat(1 + shift)}${r}${'.'.repeat(1 - shift)}`),
];
const priceTag: PixelSprite = {
  ...sprite('aa21-price-tag', tagAt(0), AA_PALETTE),
  frames: [tagAt(0), tagAt(1), tagAt(0), tagAt(-1)],
  frameMs: 560,
};

/* ── the bookkeeper ─────────────────────────────────────────────────────────────────────────── */

const KEEPER = { x: 31, y: 25 };
/** The figures, held open: the ledger's two pages, lines on each. */
const heldLedger = aaHeldBook('aa21-held-ledger', [
  'EEEEEEEEEEEEE',
  'EaaaaacaaaaaE',
  'EakkkacakkkaE',
  'EaaaaacaaaaaE',
  'EakkaacakkkaE',
  'EaaaaacaaaaaE',
  'EEEEEEEEEEEEE',
]);
/** A question mark rising over the bookkeeper: which way? */
const question = sprite('aa21-question', ['yy.', '..y', '.y.', '...', '.y.']);

const base = aaCompose('aa21-opener-base', 80, 60, 'k', [
  { sprite: aaFloor('aa21-floor', 80, [[1, 22], [33, 47], [61, 77]]), x: 0, y: 49 },
  { sprite: post, x: POST_X, y: 1 },
  { sprite: make, x: POST_X - make.rows[0].length, y: 5 },
  { sprite: buy, x: POST_X + 3, y: 15 },
  { sprite: blueprint, x: 2, y: 15 },
  { sprite: bench, x: 1, y: 43 },
  { sprite: bracket, x: 5, y: 37 },
  { sprite: hammer, x: 13, y: 40 },
  { sprite: crate('aa21-crate-low', 17, 10), x: 61, y: 47 },
  { sprite: crate('aa21-crate-mid', 14, 9), x: 63, y: 38 },
  { sprite: crate('aa21-crate-top', 10, 8), x: 65, y: 30 },
  { sprite: aaBookkeeperStanding, ...KEEPER },
  { sprite: heldLedger, x: KEEPER.x, y: KEEPER.y + 18 },
]);

export const aa21Opener: SceneArt = {
  id: 'aa21-opener',
  label: 'The bookkeeper stands at a signpost holding an open ledger, one arm of the post pointing to MAKE over a workbench with a turning gear and a hammer, the other to BUY over crates with a swinging price tag.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: gear, x: 3, y: 31 },
    { sprite: priceTag, x: 73, y: 38 },
    { sprite: question, x: 27, y: 19, motion: { kind: 'rise', amp: 3, periodMs: 2600 } },
    { sprite: aaBlink, x: KEEPER.x + AA_AT.blinkOnBookkeeper.x, y: KEEPER.y + AA_AT.blinkOnBookkeeper.y },
    { sprite: aaGlint, x: 13, y: 7, motion: { kind: 'twinkle', periodMs: 3000, min: 0.4 } },
    { sprite: aaMote, x: 55, y: 41, motion: { kind: 'rise', amp: 5, periodMs: 3400 } },
  ],
};

/** Lesson 21 emblem: a gilt signpost, two white boards pointing opposite ways. */
const board = (x: number, y: number, top: number, tipLeft: boolean) => {
  const r = y - top;
  if (r < 0 || r > 4) return null;
  const t = Math.abs(r - 2);
  const lo = tipLeft ? t : 3;
  const hi = tipLeft ? 12 : 15 - t;
  if (x < lo || x > hi) return null;
  if (x === lo || x === hi || r === 0 || r === 4) return 'O';
  return r === 3 ? 'c' : 'a';
};
const emblemSignpost = aaPaint('aa-emblem-signpost', 16, 16, (x, y) => {
  const b = board(x, y, 1, true) ?? board(x, y, 7, false);
  if (b) return b;
  if (y === 14) return x >= 5 && x <= 10 ? 'OyGGgO'[x - 5] : '.';
  if (y === 15) return x >= 3 && x <= 12 ? 'O' : '.';
  return x === 7 ? 'G' : x === 8 ? 'g' : '.';
});

export const aa21Finish = aaKeepsake(
  'aa21-finish',
  'A purple leather ledger with gold corners and a red ribbon bookmark, its cover stamped with a gold signpost whose two white arms point opposite ways, with small glints and check marks around it.',
  emblemSignpost,
);

export const art: LessonArtSet = { opener: aa21Opener, backdrop: aaBackdrop, finish: aa21Finish };
