/**
 * Applied Accounting lesson 14, Accounts Receivable & Payable Management: who owes the business, whom
 * it owes, and how long each has been waiting.
 *
 * The post room. Across the wall runs a rack of pigeonholes that is the aging schedule, a sign reading
 * DAYS pointing along its brass tags of 0, 30, 60 and 90. Every paper in it is an invoice with a green
 * dollar sign on it: fresh white invoices in the first, fewer and yellower ones along
 * the row, and in the last a single old invoice flagged red. The filing cabinet stands at the left
 * with its top drawer pulled, under a plate reading AR/AP; on the counter are trays for IN and OUT,
 * the post that brings cash in and the bills that send it out. Behind the counter the bookkeeper holds
 * up another overdue invoice. Moving: a new invoice drops into the IN tray, the red flag and seals
 * pulse, the lamp breathes, dust rises, the bookkeeper blinks.
 *
 * Receivables keep the left of the counter and payables the right. The bookkeeper holds the overdue
 * invoice up in both hands between them, a red seal on it like the one in the 90 slot; over the OUT
 * tray, whose bills stand up with red tabs, hangs a calendar headed DUE with one day marked red.
 */
import type { PixelSprite } from '../types';
import { AA_AT, AA_PALETTE, aaBankersLamp, aaBlink, aaBookkeeper, aaCompose, aaLampGlow, aaMote, aaPlaque, aaText } from './aa-kit';
import { aaFilingCabinet, aaFloor } from './aa-kit-a';
import { aaPaint } from './aa-kit-c';
import { aaKeepsake } from './aa1-finish';
import { aaBackdrop } from './aa-backdrop';
import type { LessonArtSet, SceneArt } from './types';

const sprite = (id: string, rows: string[], palette?: Record<string, string>): PixelSprite =>
  ({ id, name: id, tags: ['aa', 'aa14'], rows, ...(palette ? { palette } : {}) });

/** Paper going yellow with age: 30 days cream, 60 straw, 90 old gold. */
const AGED = { ...AA_PALETTE, e: '#E6DDC4', d: '#B5A98A', u: '#D8C690', v: '#A89560', U: '#C2A464', V: '#86703F' };

/**
 * An invoice, 11 x 7: lines of the bill down the left, a green dollar sign at the right, the edge in
 * `shade`. An overdue one carries a red seal where its lower lines would be.
 */
const DOLLAR = aaText('aa14-dollar', '$', 'n').rows;
const SEAL = ['.r.', 'rRr', '.r.'];
const invoice = (id: string, paper: string, shade: string, overdue = false) => sprite(id, Array.from({ length: 7 }, (_, y) =>
  Array.from({ length: 11 }, (_, x) => {
    if (y === 6 || x === 10) return shade;
    if (y === 0) return paper;
    if (x >= 6 && x <= 8) return DOLLAR[y - 1][x - 6] === '.' ? paper : 'n';
    if (overdue && x >= 1 && x <= 3 && y >= 3) {
      const ch = SEAL[y - 3][x - 1];
      return ch === '.' ? paper : ch;
    }
    if ((y === 1 && x <= 4) || (y === 3 && x <= 3) || (y === 5 && x <= 4)) return x >= 1 ? 'X' : paper;
    return paper;
  }).join('')), AGED);

/** The aging rack, 53 x 18: a brass tag over each of four pigeonholes, a lit shelf edge under them. */
const DAYS = ['0', '30', '60', '90'];
const RACK = { x: 25, y: 1 };
const HOLE_W = 12;
const holeX = (i: number) => 1 + i * (HOLE_W + 1);
const HOLE_Y = 8;
const rack = aaCompose('aa14-rack', 53, 18, '.', [
  { sprite: sprite('aa14-rack-body', [
    'O'.repeat(53),
    ...Array.from({ length: 6 }, () => 'O'.repeat(53)),
    'O'.repeat(53),
    ...Array.from({ length: 8 }, () => `O${`${'K'.repeat(HOLE_W)}O`.repeat(4)}`),
    'O'.repeat(53),
    `y${'G'.repeat(51)}g`,
  ]), x: 0, y: 0 },
  ...DAYS.flatMap((d, i) => {
    const text = aaText(`aa14-tag-${d}`, d, 'K').rows;
    const w = text[0].length + 2;
    return [{
      sprite: sprite(`aa14-tag-${d}-plate`, [`y${'y'.repeat(w - 2)}G`, ...text.map((r) => `G${r.replace(/\./g, 'G')}g`)]),
      x: holeX(i) + Math.floor((HOLE_W - w) / 2),
      y: 1,
    }];
  }),
  { sprite: invoice('aa14-inv-0-back', 'a', 'c'), x: holeX(0) + 1, y: HOLE_Y },
  { sprite: invoice('aa14-inv-0-front', 'a', 'c'), x: holeX(0), y: HOLE_Y + 1 },
  { sprite: invoice('aa14-inv-30', 'e', 'd'), x: holeX(1) + 1, y: HOLE_Y + 1 },
  { sprite: invoice('aa14-inv-60', 'u', 'v'), x: holeX(2) + 1, y: HOLE_Y + 1 },
  { sprite: invoice('aa14-inv-90', 'U', 'V', true), x: holeX(3) + 1, y: HOLE_Y + 1 },
  { sprite: sprite('aa14-flag', ['rr', 'rr', 'r.']), x: holeX(3) + 10, y: HOLE_Y },
]);

/** The DAYS sign, 21 x 7: a brass board pointing right along the rack's tags. */
const daysText = aaText('aa14-days', 'DAYS', 'K').rows;
const daysSign = sprite('aa14-days-sign', Array.from({ length: 7 }, (_, y) => Array.from({ length: 21 }, (_, x) => {
  const tip = 3 - Math.abs(y - 3);
  if (x > 17 + tip) return '.';
  if (y === 0 || y === 6 || x === 0 || x === 17 + tip) return 'O';
  const g = daysText[y - 1]?.[x - 2];
  if (g && g !== '.') return 'K';
  return y === 1 ? 'y' : y === 5 ? 'g' : 'G';
}).join('')));

/** A wire tray, 11 or 15 wide by 8: the papers in it peek over a steel rim lettered IN or OUT. */
const tray = (id: string, word: string, papers: string) => {
  const text = aaText(`${id}-word`, word, 'c').rows;
  const w = text[0].length + 4;
  return sprite(id, [
    `..${papers.repeat(w - 5)}c..`,
    'D'.repeat(w),
    ...text.map((r) => `Dx${r.replace(/\./g, 'K')}KD`),
    'D'.repeat(w),
  ], AGED);
};
/** The OUT tray, 15 x 9: two bills stand up out of it, a red due tab on each. */
const outTray = sprite('aa14-tray-out', ['...rR....rR....', '..aaaac.aaaac..', ...tray('aa14-tray-out-body', 'OUT', 'a').rows.slice(1)], AGED);

/** The payables calendar, 15 x 12: a red head lettered DUE over two weeks of days, one marked red. */
const calendar = sprite('aa14-calendar', [
  'D'.repeat(15),
  `D${'r'.repeat(13)}D`,
  ...aaText('aa14-due', 'DUE', 'a').rows.map((r) => `Dr${r.replace(/\./g, 'r')}rD`),
  `D${'X'.repeat(13)}D`,
  'DXaXaXaXaXaXaXD',
  `D${'X'.repeat(13)}D`,
  'DXaXaXaXRXaXaXD',
  `D${'X'.repeat(13)}D`,
], AGED);

/** The counter, 62 x 17: green leather top, a lit edge, four panelled drawers. */
const COUNTER = { x: 18, y: 40, w: 62 };
const panel = (kind: 'top' | 'mid' | 'pull') =>
  kind === 'top' ? `${'g'.repeat(14)}O` : kind === 'pull' ? `g${'O'.repeat(5)}yy${'O'.repeat(6)}O` : `g${'O'.repeat(14)}`;
const counter = sprite('aa14-counter', [
  'O'.repeat(COUNTER.w),
  ...Array.from({ length: 3 }, () => `O${'n'.repeat(COUNTER.w - 2)}O`),
  `y${'G'.repeat(COUNTER.w - 2)}g`,
  'O'.repeat(COUNTER.w),
  `O${panel('top').repeat(4)}O`,
  `O${panel('mid').repeat(4)}O`,
  `O${panel('pull').repeat(4)}O`,
  ...Array.from({ length: 5 }, () => `O${panel('mid').repeat(4)}O`),
  'O'.repeat(COUNTER.w),
  'O'.repeat(COUNTER.w),
  'O'.repeat(COUNTER.w),
]);

const KEEPER = { x: 46, y: 20 };
const HELD = { x: 49, y: 33 };
const LAMP = { x: 19, y: 28 };
const IN_TRAY = { x: 32, y: 34 };
const OUT_TRAY = { x: 64, y: 33 };

/** The bookkeeper's hands at the held invoice's edges, raised to the shoulders. */
const grip = sprite('aa14-grip', ['SS.........SM', 'SS.........SM', 'SM.........MM'], AA_PALETTE);

const base = aaCompose('aa14-opener-base', 80, 60, 'k', [
  { sprite: aaFloor('aa14-floor', 80, [[1, 79]]), x: 0, y: 49 },
  { sprite: daysSign, x: 4, y: 2 },
  { sprite: aaPlaque('aa14-opener-plate', 'AR/AP'), x: 1, y: 11 },
  { sprite: rack, ...RACK },
  { sprite: aaFilingCabinet, x: 1, y: 23 },
  { sprite: calendar, x: OUT_TRAY.x, y: 20 },
  { sprite: aaBookkeeper, ...KEEPER },
  { sprite: invoice('aa14-held', 'U', 'V', true), ...HELD },
  { sprite: grip, x: HELD.x - 1, y: HELD.y + 1 },
  { sprite: counter, x: COUNTER.x, y: COUNTER.y },
  { sprite: aaBankersLamp, ...LAMP },
  { sprite: tray('aa14-tray-in', 'IN', 'a'), ...IN_TRAY },
  { sprite: outTray, ...OUT_TRAY },
]);

/** A new invoice dropping into the IN tray, then resting a while. */
const arriving: PixelSprite = (() => {
  const paper = invoice('aa14-arriving-invoice', 'a', 'c').rows;
  const at = (dy: number) => Array.from({ length: 12 }, (_, y) => paper[y - dy] ?? '.'.repeat(11));
  const gone = at(20);
  return { ...sprite('aa14-arriving', at(5), AGED), frames: [gone, gone, at(0), at(2), at(4), at(5), at(5), at(5), gone], frameMs: 360 };
})();

/** The red of the overdue flag and seals, pulsing. */
const flagLit = sprite('aa14-flag-lit', ['RR', 'RR', 'R.']);
const sealLit = sprite('aa14-seal-lit', ['.R.', 'RsR', '.R.']);

export const aa14Opener: SceneArt = {
  id: 'aa14-opener',
  label: 'A rack of pigeonholes tagged 0, 30, 60 and 90 beside a sign reading DAYS holds invoices that yellow with age, the last flagged red; behind a counter with an IN tray, and an OUT tray of bills under a calendar headed DUE, the bookkeeper holds up another overdue invoice in both hands, with a filing cabinet at the left under a brass plate reading AR/AP.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: arriving, x: IN_TRAY.x, y: IN_TRAY.y - 11 },
    { sprite: flagLit, x: RACK.x + holeX(3) + 10, y: RACK.y + HOLE_Y, motion: { kind: 'twinkle', periodMs: 1800, min: 0.2 } },
    { sprite: sealLit, x: RACK.x + holeX(3) + 2, y: RACK.y + HOLE_Y + 4, motion: { kind: 'twinkle', periodMs: 1800, min: 0.2 } },
    { sprite: sealLit, x: HELD.x + 1, y: HELD.y + 3, motion: { kind: 'twinkle', periodMs: 1800, min: 0.2, phase: 0.5 } },
    { sprite: aaBlink, x: KEEPER.x + AA_AT.blinkOnBookkeeper.x, y: KEEPER.y + AA_AT.blinkOnBookkeeper.y },
    { sprite: aaLampGlow, x: LAMP.x + AA_AT.glowInLamp.x, y: LAMP.y + AA_AT.glowInLamp.y, motion: { kind: 'twinkle', periodMs: 3400, min: 0.35 } },
    { sprite: aaMote, x: 24, y: 36, motion: { kind: 'rise', amp: 5, periodMs: 3000 } },
  ],
};

/**
 * Lesson 14 emblem: an invoice past due. A white sheet with two lines of the bill and a big green
 * dollar sign, a red tab standing up from its top corner: money owed, and owed too long.
 */
const BIG_DOLLAR = ['..#..', '.####', '#.#..', '.###.', '..#.#', '####.', '..#..'];
const emblemInvoice = aaPaint('aa-emblem-invoice', 16, 16, (x, y) => {
  if (x >= 10 && x <= 12 && y <= 3) return x === 12 ? 'r' : 'R';
  if (x < 3 || x > 13 || y < 2 || y > 15) return '.';
  if (y === 15 || x === 13) return x === 3 ? '.' : 'c';
  if (y === 2 || x === 3) return 'a';
  const d = BIG_DOLLAR[y - 7]?.[x - 7];
  if (d === '#') return 'n';
  if ((y === 4 && x >= 5 && x <= 9) || (y === 6 && x >= 5 && x <= 7)) return 'X';
  return 'a';
});

export const aa14Finish = aaKeepsake(
  'aa14-finish',
  'A purple leather ledger with gold corners and a red ribbon bookmark, its cover stamped with a white invoice bearing a green dollar sign and a red past-due tab at its top corner, with small glints and check marks around it.',
  emblemInvoice,
);

export const art: LessonArtSet = { opener: aa14Opener, backdrop: aaBackdrop, finish: aa14Finish };
