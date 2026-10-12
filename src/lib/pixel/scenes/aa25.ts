/**
 * Applied Accounting lesson 25, the Advanced Capstone: every domain of the pathway, set together.
 *
 * The capstone as the stone that holds an arch together. A great orchid arch spans the hall, its six
 * stones each carrying a gilt sign of one domain in the order the capstone works through them: the
 * T-account of the statements, the auditor's tick, the globe of the specialised fields, the bars of
 * management, the analyst's glass and the shield of ethics. At the top the gold keystone carries a
 * crown. Under it the bookkeeper stands holding the gold-bound last volume, between two short cases
 * of the twenty-four ledgers already earned, in six colours, under a plate reading CAPSTONE. Moving:
 * the six signs light one after another, left to right, and then the crown blazes; gilt glints on
 * the gold volume, the bookkeeper blinks, dust rises.
 *
 * The capstone keeps the pathway backdrop but lights it for the occasion (aa25Backdrop): both lamps
 * burn steady, gilt runs along the cornices and the floor rule, and a gold crown sits on the clock.
 */
import type { PixelSprite } from '../types';
import { AA_AT, AA_PALETTE, aaBlink, aaCompose, aaGlint, aaMote, aaPlaque } from './aa-kit';
import { aaFloor } from './aa-kit-a';
import { aaBookkeeperStanding, aaKeepsakeGold } from './aa-kit-b';
import { aaHeldBook, aaPaint } from './aa-kit-c';
import { aaBackdrop } from './aa-backdrop';
import type { LessonArtSet, SceneArt } from './types';

const sprite = (id: string, rows: string[], palette?: Record<string, string>): PixelSprite =>
  ({ id, name: id, tags: ['aa', 'aa25'], rows, ...(palette ? { palette } : {}) });

/* ── the arch ───────────────────────────────────────────────────────────────────────────────── */

/** The arch springs from the floor line at y = 48: seven stones, the fourth the keystone. */
const ARCH = { cx: 39.5, cy: 48, rIn: 25, rOut: 34, top: 9 };
const STONE = 180 / 7;
const KEY = 3;

const arch = aaPaint('aa25-arch', 80, ARCH.cy - ARCH.top + 1, (x, row) => {
  const dx = x - ARCH.cx;
  const dy = ARCH.cy - (row + ARCH.top);
  const d = Math.hypot(dx, dy);
  const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
  const i = Math.min(6, Math.floor(deg / STONE));
  const lo = i === KEY ? ARCH.rIn - 1.5 : ARCH.rIn;
  const hi = i === KEY ? ARCH.rOut + 3 : ARCH.rOut;
  if (d < lo || d >= hi) return '.';
  const joint = [1, 2, 3, 4, 5, 6].some((k) => (Math.abs(deg - k * STONE) * Math.PI * d) / 180 < 0.6);
  if (joint) return 'O';
  if (i === KEY) return d < lo + 1 || d >= hi - 1 ? 'O' : dx < -1 ? 'y' : dx > 1.5 ? 'g' : 'G';
  if (d < lo + 1 || d >= hi - 1) return 'E';
  return i > KEY && d >= hi - 2.2 ? 'P' : 'p';
});

/** Where a 5 x 5 sign sits on stone `i`: the middle of the stone. */
const onStone = (i: number) => {
  const a = ((i + 0.5) * STONE * Math.PI) / 180;
  return { x: Math.round(ARCH.cx + 29.5 * Math.cos(a) - 2), y: Math.round(ARCH.cy - 29.5 * Math.sin(a) - 2) };
};

/** The six domains, left to right as the capstone takes them, each on its stone. */
const DOMAINS: { stone: number; sign: string[] }[] = [
  { stone: 6, sign: ['#####', '..#..', '..#..', '..#..', '..#..'] },
  { stone: 5, sign: ['.....', '....#', '...#.', '#.#..', '.#...'] },
  { stone: 4, sign: ['.###.', '#.#.#', '#####', '#.#.#', '.###.'] },
  { stone: 2, sign: ['....#', '..#.#', '..#.#', '#.#.#', '#####'] },
  { stone: 1, sign: ['###..', '#.#..', '###..', '...#.', '....#'] },
  { stone: 0, sign: ['#####', '#####', '#####', '.###.', '..#..'] },
];
const sign = (id: string, rows: string[], ink: string) => sprite(id, rows.map((r) => r.replace(/#/g, ink)), AA_PALETTE);

/** The crown on the keystone. */
const CROWN = ['#..#..#', '##.#.##', '#######', '#######'];
const CROWN_AT = { x: 36, y: 16 };

/** A plinth under each foot of the arch. */
const plinth = sprite('aa25-plinth', ['O'.repeat(13), `y${'G'.repeat(11)}g`, 'O'.repeat(13)]);

/* ── the earned ledgers ─────────────────────────────────────────────────────────────────────── */

/** Spine colours, light then dark, for the six domains. */
const SPINE: Record<string, [string, string]> = {
  orchid: ['P', 'p'], blue: ['B', 'b'], teal: ['T', 't'], green: ['N', 'n'], red: ['R', 'r'], pink: ['F', 'f'],
};
const run = (a: string, na: number, b: string, nb: number) => [...Array.from({ length: na }, () => SPINE[a]), ...Array.from({ length: nb }, () => SPINE[b])];

/** A short case, 14 x 13: two shelves of six volumes, a gilt band across each. */
const shortCase = (id: string, top: [string, string][], bottom: [string, string][]) => aaPaint(id, 14, 13, (x, y) => {
  if (y === 0 || y === 6 || y === 12 || x === 0 || x === 13) return 'O';
  const [light, dark] = (y < 6 ? top : bottom)[Math.floor((x - 1) / 2)];
  const left = (x - 1) % 2 === 0;
  if (y === 2 || y === 8) return left ? 'y' : 'G';
  return left ? light : dark;
});

/* ── the bookkeeper ─────────────────────────────────────────────────────────────────────────── */

const KEEPER = { x: 31, y: 25 };
/** The last volume, bound in gold, a small crown on its dark plate. */
const heldVolume = aaHeldBook('aa25-held-volume', [
  'OOOOOOOOOOOOO',
  'OyyyyyyyyyyGO',
  'OyGKKKKKKKGgO',
  'OyGKyKyKyKGgO',
  'OyGKyyyyyKGgO',
  'OGggggggggggO',
  'OOOOOOOOOOOOO',
]);

const base = aaCompose('aa25-opener-base', 80, 60, 'k', [
  { sprite: aaFloor('aa25-floor', 80, [[4, 16], [31, 48], [63, 75]]), x: 0, y: 49 },
  { sprite: aaPlaque('aa25-opener-plate', 'CAPSTONE'), x: 22, y: 1 },
  { sprite: shortCase('aa25-case-left', run('orchid', 4, 'blue', 2), run('blue', 2, 'teal', 4)), x: 17, y: 36 },
  { sprite: shortCase('aa25-case-right', run('green', 4, 'red', 2), run('red', 2, 'pink', 4)), x: 49, y: 36 },
  { sprite: arch, x: 0, y: ARCH.top },
  ...DOMAINS.map(({ stone, sign: rows }) => ({ sprite: sign(`aa25-sign-${String(stone)}`, rows, 'g'), ...onStone(stone) })),
  { sprite: sign('aa25-crown', CROWN, 'O'), ...CROWN_AT },
  { sprite: plinth, x: 4, y: 46 },
  { sprite: plinth, x: 63, y: 46 },
  { sprite: aaBookkeeperStanding, ...KEEPER },
  { sprite: heldVolume, x: KEEPER.x, y: KEEPER.y + 18 },
]);

export const aa25Opener: SceneArt = {
  id: 'aa25-opener',
  label: 'The bookkeeper stands under a great purple arch holding a gold-bound ledger, six gilt signs on the arch stones lighting in turn up to a gold keystone with a crown, between two short cases of ledgers in six colours, under a brass plate reading CAPSTONE.',
  width: 80,
  height: 60,
  base,
  layers: [
    ...DOMAINS.map(({ stone, sign: rows }, k) => ({
      sprite: sign(`aa25-sign-lit-${String(stone)}`, rows, 'y'),
      ...onStone(stone),
      motion: { kind: 'twinkle' as const, periodMs: 4200, phase: k * 0.1, min: 0 },
    })),
    { sprite: sign('aa25-crown-lit', CROWN, 'a'), ...CROWN_AT, motion: { kind: 'twinkle', periodMs: 4200, phase: 0.65, min: 0 } },
    { sprite: aaGlint, x: KEEPER.x + 4, y: KEEPER.y + 16 },
    { sprite: aaBlink, x: KEEPER.x + AA_AT.blinkOnBookkeeper.x, y: KEEPER.y + AA_AT.blinkOnBookkeeper.y },
    { sprite: aaMote, x: 24, y: 30, motion: { kind: 'rise', amp: 5, periodMs: 3100 } },
    { sprite: aaMote, x: 55, y: 31, motion: { kind: 'rise', amp: 4, periodMs: 3600, phase: 0.5 } },
  ],
};

/* ── the backdrop, lit for the capstone ─────────────────────────────────────────────────────── */

/** Gilt that stays under the backdrop's luminance ceiling, the same gold the checkpoint used. */
const GILT = { j: '#8F6218' };
const hallBulb = sprite('aa25-hall-bulb', ['.jjjjjjj.', 'j.......j'], GILT);
const cornice = (id: string, w: number) => sprite(id, ['j'.repeat(w)], GILT);
const hallCrown = sprite('aa25-hall-crown', ['j..j..j', 'jj.j.jj', 'jjjjjjj'], GILT);

export const aa25Backdrop: SceneArt = {
  ...aaBackdrop,
  id: 'aa25-backdrop',
  label: 'A dark hall of tall bookcases full of ledgers at night, trimmed in gold, a gold crown on the ticking clock, both green lamps burning and a gilt rule along the floor.',
  layers: [
    ...aaBackdrop.layers,
    { sprite: hallBulb, x: 0, y: 25, motion: { kind: 'twinkle', periodMs: 5200, min: 0.8 } },
    { sprite: hallBulb, x: 97, y: 25, motion: { kind: 'twinkle', periodMs: 5800, min: 0.8, phase: 0.5 } },
    { sprite: cornice('aa25-hall-cornice-a', 16), x: 11, y: 7, motion: { kind: 'twinkle', periodMs: 4600, min: 0.4 } },
    { sprite: cornice('aa25-hall-cornice-b', 16), x: 50, y: 16, motion: { kind: 'twinkle', periodMs: 4600, min: 0.4, phase: 0.33 } },
    { sprite: cornice('aa25-hall-cornice-c', 14), x: 81, y: 6, motion: { kind: 'twinkle', periodMs: 4600, min: 0.4, phase: 0.66 } },
    { sprite: hallCrown, x: 39, y: 5, motion: { kind: 'twinkle', periodMs: 3800, min: 0.5, phase: 0.2 } },
    { sprite: cornice('aa25-hall-rule', 112), x: 0, y: 41, motion: { kind: 'twinkle', periodMs: 6000, min: 0.3 } },
  ],
};

/* ── the keepsake ───────────────────────────────────────────────────────────────────────────── */

/** Lesson 25 emblem: a gilt crown, white pearls on its three points, a red jewel in its band. */
const APEX = [1.5, 7.5, 13.5];
const emblemCrown = aaPaint('aa-emblem-crown', 16, 16, (x, y) => {
  if (x < 1 || x > 14 || y > 13) return '.';
  const off = Math.min(...APEX.map((a) => Math.abs(x - a)));
  if (y <= 2) return y >= 1 && off < 1 ? 'a' : '.';
  const top = 3 + Math.floor((5 / 3) * off);
  if (y < top) return '.';
  if (y === 10 || y === 13) return 'O';
  if (y === 11) return x === 7 || x === 8 ? 'R' : x === 3 || x === 12 ? 'a' : 'G';
  if (x === 1 || (y === top && x < 7.5)) return 'y';
  return x === 14 ? 'g' : 'G';
});

export const aa25Finish = aaKeepsakeGold(
  'aa25-finish',
  'A gold leather ledger with purple corners and a red ribbon bookmark, its cover stamped with a gilt crown set with white pearls and a red jewel, with small glints and check marks around it.',
  emblemCrown,
);

export const art: LessonArtSet = { opener: aa25Opener, backdrop: aa25Backdrop, finish: aa25Finish };
