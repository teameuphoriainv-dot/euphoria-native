/**
 * Applied Accounting lesson 25, the Advanced Capstone: every domain of the pathway, set together.
 *
 * The lesson is the capstone of the pathway; the picture borrows an arch's keystone, the stone that
 * locks all the others in place, for the synthesis it asks for. A great orchid arch spans the hall,
 * three stones rising from each side, each numbered in gilt in the order the capstone works through
 * its domains: 1 DuPont, 2 quality of earnings, 3 consolidation, 4 tax and cross-border, 5 systems and
 * controls, 6 ethics. The two middle stones lean in on the gap at the crown, and into that gap the
 * bookkeeper, standing beneath with both arms raised, sets the wide gold keystone that joins the two
 * sides, under a plate reading CAPSTONE. Moving: the six numbers light one after another, 1 to 6,
 * and then the keystone blazes; dust rises, the bookkeeper blinks.
 *
 * The capstone keeps the pathway backdrop but lights it for the occasion (aa25Backdrop): both lamps
 * burn steady, gilt runs along the cornices and the floor rule, and a gold crown sits on the clock.
 */
import type { PixelSprite } from '../types';
import { AA_AT, AA_PALETTE, aaBlink, aaCompose, aaMote, aaPlaque, aaText } from './aa-kit';
import { aaFloor } from './aa-kit-a';
import { aaBookkeeperStanding, aaKeepsakeGold } from './aa-kit-b';
import { aaPaint } from './aa-kit-c';
import { aaBackdrop } from './aa-backdrop';
import type { LessonArtSet, SceneArt } from './types';

const sprite = (id: string, rows: string[], palette?: Record<string, string>): PixelSprite =>
  ({ id, name: id, tags: ['aa', 'aa25'], rows, ...(palette ? { palette } : {}) });

/* ── the arch ───────────────────────────────────────────────────────────────────────────────── */

/**
 * The arch springs from the floor line at y = 48: three stones a side and, at the crown, a keystone
 * wider than any of them. Angles run from the right (0) over the top to the left (180).
 */
const ARCH = { cx: 39.5, cy: 48, rIn: 22, rOut: 30, top: 18 };
const KEY_DEG = 42;
const SIDE_DEG = (180 - KEY_DEG) / 6;
const KEY_FROM = 3 * SIDE_DEG;
const KEY_TO = KEY_FROM + KEY_DEG;
const JOINTS = [1, 2, 3].map((k) => k * SIDE_DEG).concat([0, 1, 2].map((k) => KEY_TO + k * SIDE_DEG));
/** The lesson's step on each side stone, 1 at the left foot to 6 at the right, by its middle angle. */
const STONES = [6, 5, 4, 3, 2, 1].map((n, i) => ({ n, deg: i < 3 ? (i + 0.5) * SIDE_DEG : KEY_TO + (i - 2.5) * SIDE_DEG }));

const arch = aaPaint('aa25-arch', 80, ARCH.cy - ARCH.top + 1, (x, row) => {
  const dx = x - ARCH.cx;
  const dy = ARCH.cy - (row + ARCH.top);
  const d = Math.hypot(dx, dy);
  const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
  const key = deg >= KEY_FROM && deg < KEY_TO;
  if (d < ARCH.rIn || d >= ARCH.rOut) return '.';
  if (JOINTS.some((j) => (Math.abs(deg - j) * Math.PI * d) / 180 < 0.6)) return 'O';
  if (key) return d < ARCH.rIn + 1 || d >= ARCH.rOut - 1 ? 'O' : dx < -2 ? 'y' : dx > 2.5 ? 'g' : 'G';
  if (d < ARCH.rIn + 1 || d >= ARCH.rOut - 1) return 'E';
  return deg < 90 && d >= ARCH.rOut - 2.2 ? 'P' : 'p';
});

/** Where a digit sits on its stone: the middle of the stone, 3 x 5. */
const onStone = (deg: number) => {
  const a = (deg * Math.PI) / 180;
  const r = (ARCH.rIn + ARCH.rOut) / 2;
  return { x: Math.round(ARCH.cx + r * Math.cos(a) - 1), y: Math.round(ARCH.cy - r * Math.sin(a) - 2) };
};
const digit = (id: string, n: number, ink: string) => ({ ...aaText(id, String(n), ink), palette: AA_PALETTE });

/** The keystone's own pixels, lit pale: it blazes once the six are read. */
const keyLit = aaPaint('aa25-key-lit', 80, ARCH.cy - ARCH.top + 1, (x, row) => {
  const dx = x - ARCH.cx;
  const dy = ARCH.cy - (row + ARCH.top);
  const d = Math.hypot(dx, dy);
  const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
  if (deg < KEY_FROM + 1.5 || deg >= KEY_TO - 1.5 || d < ARCH.rIn + 1 || d >= ARCH.rOut - 1) return '.';
  return dx < -2 ? 'a' : 'y';
});

/** A plinth under each foot of the arch. */
const plinth = sprite('aa25-plinth', ['O'.repeat(13), `y${'G'.repeat(11)}g`, 'O'.repeat(13)]);

/* ── the bookkeeper, arms raised ────────────────────────────────────────────────────────────── */

/**
 * aaBookkeeperStanding with both arms raised beside the head, the hands at its top corners under the
 * keystone, and the arms that hung at the sides taken away so the figure keeps two.
 */
const HANDS: Record<number, [number, string][]> = {
  0: [[2, 'S'], [3, 'S'], [14, 'S'], [15, 'M']],
  1: [[1, 'S'], [2, 'S'], [3, 'M'], [14, 'S'], [15, 'M'], [16, 'M']],
  2: [[1, 'P'], [2, 'P'], [15, 'p'], [16, 'p']],
};
const lifting = sprite('aa25-bookkeeper-lifting', aaBookkeeperStanding.rows.map((row, y) => {
  const c = [...row];
  if (y >= 17 && y <= 24) [1, 2, 15, 16].forEach((x) => { c[x] = '.'; });
  for (const [x, ch] of HANDS[y] ?? []) c[x] = ch;
  if (y >= 3 && y <= 14) [[0, 'P'], [1, 'P'], [16, 'p'], [17, 'p']].forEach(([x, ch]) => { c[Number(x)] = String(ch); });
  if (y === 15) [[1, 'P'], [2, 'P'], [3, 'P'], [14, 'p'], [15, 'p'], [16, 'p']].forEach(([x, ch]) => { c[Number(x)] = String(ch); });
  if (y === 16) [[1, 'P'], [16, 'p']].forEach(([x, ch]) => { c[Number(x)] = String(ch); });
  return c.join('');
}), AA_PALETTE);

const KEEPER = { x: 31, y: 27 };

const base = aaCompose('aa25-opener-base', 80, 60, 'k', [
  { sprite: aaFloor('aa25-floor', 80, [[7, 19], [31, 48], [60, 72]]), x: 0, y: 49 },
  { sprite: aaPlaque('aa25-opener-plate', 'CAPSTONE'), x: 22, y: 1 },
  { sprite: arch, x: 0, y: ARCH.top },
  ...STONES.map(({ n, deg }) => ({ sprite: digit(`aa25-digit-${String(n)}`, n, 'g'), ...onStone(deg) })),
  { sprite: plinth, x: 7, y: 46 },
  { sprite: plinth, x: 60, y: 46 },
  { sprite: lifting, ...KEEPER },
]);

export const aa25Opener: SceneArt = {
  id: 'aa25-opener',
  label: 'Under a brass plate reading CAPSTONE, the bookkeeper stands beneath a great purple arch of six stones numbered 1 to 6 and, with both arms raised, sets the wide gold keystone into the gap at its crown.',
  width: 80,
  height: 60,
  base,
  layers: [
    ...STONES.map(({ n, deg }) => ({
      sprite: digit(`aa25-digit-lit-${String(n)}`, n, 'a'),
      ...onStone(deg),
      motion: { kind: 'twinkle' as const, periodMs: 4200, phase: (n - 1) * 0.1, min: 0 },
    })),
    { sprite: keyLit, x: 0, y: ARCH.top, motion: { kind: 'twinkle', periodMs: 4200, phase: 0.65, min: 0 } },
    { sprite: aaBlink, x: KEEPER.x + AA_AT.blinkOnBookkeeper.x, y: KEEPER.y + AA_AT.blinkOnBookkeeper.y },
    { sprite: aaMote, x: 22, y: 40, motion: { kind: 'rise', amp: 5, periodMs: 3100 } },
    { sprite: aaMote, x: 57, y: 41, motion: { kind: 'rise', amp: 4, periodMs: 3600, phase: 0.5 } },
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
