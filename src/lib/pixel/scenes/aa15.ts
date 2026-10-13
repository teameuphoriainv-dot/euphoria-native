/**
 * Applied Accounting lesson 15, Payroll Accounting & Employee Benefits: what an employee really costs
 * is more than the pay in the packet.
 *
 * The pay office, with the cost of a hire as its centrepiece. On the right a big gilt-framed chart sets
 * the pay alone beside the true cost on one baseline: a gold PAY bar, then a COST bar with the same
 * gold salary at its foot and the extras stacked on it, stock in orchid, health cover in green, the
 * pension match in blue and payroll tax in red, nearly twice as tall (the lesson's $178,000 against
 * $100,000). A dashed line carries the salary's height across, so everything above it on the COST bar
 * is cost beyond the paycheck. On the left the bookkeeper sits in an open pay window in a panelled
 * partition, a lamp behind, no bars in front, and a manila pay packet slides out along the sill. A
 * plate reads PAYROLL and a charter reads W-2. Moving: the pay packet slides out, the extras on the
 * COST bar glow, the lamp breathes, gilt glints on the window's rail, dust rises, the bookkeeper
 * blinks.
 */
import type { PixelSprite } from '../types';
import { AA_AT, AA_PALETTE, aaBankersLamp, aaBlink, aaBookkeeper, aaCharter, aaCompose, aaGlint, aaLampGlow, aaMote, aaPlaque, aaText } from './aa-kit';
import { aaFloor, aaFrame } from './aa-kit-a';
import { aaBlock, aaEnvelope } from './aa-kit-b';
import { aaKeepsake } from './aa1-finish';
import { aaBackdrop } from './aa-backdrop';
import type { LessonArtSet, SceneArt } from './types';

const sprite = (id: string, rows: string[], palette?: Record<string, string>): PixelSprite =>
  ({ id, name: id, tags: ['aa', 'aa15'], rows, ...(palette ? { palette } : {}) });

/** Manila for the pay packet. */
const MANILA = { ...AA_PALETTE, u: '#D9AE6E', v: '#9C7440' };

/** The partition, 36 x 48: a cornice, the pay window with a rounded head, a sill, two raised panels. */
const PARTITION = { x: 2, y: 9, w: 36, h: 48 };
const OPEN = { x0: 3, x1: 32, y0: 5, y1: 28 };
const partition = sprite('aa15-partition', Array.from({ length: PARTITION.h }, (_, y) => Array.from({ length: PARTITION.w }, (_, x) => {
  const corner = Math.min(x - OPEN.x0, OPEN.x1 - x);
  const open = x >= OPEN.x0 && x <= OPEN.x1 && y >= OPEN.y0 && y <= OPEN.y1 && !(y - OPEN.y0 < 3 && corner < 3 - (y - OPEN.y0));
  if (open) return '.';
  if (y === 0) return x === 0 ? 'y' : x === PARTITION.w - 1 ? 'g' : 'G';
  if (y === 29) return x === PARTITION.w - 1 ? 'g' : x === 0 ? 'y' : 'G';
  if (y === 30) return 'g';
  if (y === 31 || y === 1) return 'O';
  const inPanel = y >= 34 && y <= 45 && ((x >= 3 && x <= 16) || (x >= 19 && x <= 32));
  if (inPanel) return y === 34 || x === 3 || x === 19 ? 'g' : y === 45 || x === 16 || x === 32 ? 'K' : 'O';
  if (y >= 5 && y <= 28 && (x === OPEN.x1 + 1)) return 'g';
  return 'O';
}).join('')));

/** The window's one piece of brass: a rail across its head, above the bookkeeper, nothing in front. */
const rail = sprite('aa15-rail', [`y${'G'.repeat(OPEN.x1 - OPEN.x0 - 1)}g`]);

/**
 * The true cost, a gilt-framed chart 39 x 33: PAY, the salary alone, beside COST, the same salary
 * with the extras stacked on it, at about 0.12 px per $1,000 of the lesson's figures (100 against
 * 178): salary 12, stock 4, health 2, pension 2, payroll tax 2. A dashed line carries the salary's
 * height across to the COST bar.
 */
const CHART = { x: 40, y: 16, w: 39, h: 33 };
const BASE_Y = 41;
const PAY_X = 45;
const COST_X = 61;
const BAR_W = 10;
const SALARY = 12;
const EXTRAS: [number, string, string][] = [[4, 'q', 'P'], [2, 'm', 'N'], [2, 'B', 'b'], [2, 's', 'R']];
const COST_H = SALARY + EXTRAS.reduce((sum, [h]) => sum + h, 0);
const costChart = (() => {
  const ox = CHART.x + 2;
  const oy = CHART.y + 2;
  const cells: string[][] = Array.from({ length: CHART.h - 4 }, () => Array.from({ length: CHART.w - 4 }, () => '.'));
  const put = (x: number, y: number, ch: string) => {
    cells[y - oy][x - ox] = ch;
  };
  const bar = (x0: number, from: number, to: number, lit: string, fill: string) => {
    for (let y = from; y > to; y--) for (let x = x0; x < x0 + BAR_W; x++) put(x, y, x === x0 ? lit : fill);
  };
  for (let x = ox + 1; x < ox + CHART.w - 5; x++) put(x, BASE_Y, 'c');
  bar(PAY_X, BASE_Y - 1, BASE_Y - 1 - SALARY, 'y', 'G');
  bar(COST_X, BASE_Y - 1, BASE_Y - 1 - SALARY, 'y', 'G');
  let top = BASE_Y - 1 - SALARY;
  for (const [h, lit, fill] of EXTRAS) {
    bar(COST_X, top, top - h, lit, fill);
    top -= h;
  }
  for (let x = PAY_X + BAR_W + 1; x < COST_X - 1; x++) if ((x - PAY_X) % 3 !== 0) put(x, BASE_Y - SALARY, 'a');
  const label = (word: string, cx: number) => aaText(`aa15-word-${word}`, word, 'c').rows.forEach((r, dy) => [...r].forEach((ch, dx) => {
    if (ch !== '.') put(cx - Math.floor(r.length / 2) + dx, BASE_Y + 1 + dy, ch);
  }));
  label('PAY', PAY_X + BAR_W / 2);
  label('COST', COST_X + BAR_W / 2);
  return aaCompose('aa15-cost-chart', CHART.w, CHART.h, '.', [
    { sprite: aaFrame('aa15-cost-frame', CHART.w, CHART.h, 'K'), x: 0, y: 0 },
    { sprite: sprite('aa15-cost-bars', cells.map((r) => r.join('')), AA_PALETTE), x: 2, y: 2 },
  ]);
})();

/** The extras' edge lit white over the COST bar: everything the paycheck does not show, glowing. */
const extrasGlow = sprite('aa15-extras-glow', Array.from({ length: COST_H - SALARY }, (_, y) =>
  (y === 0 ? 'a'.repeat(BAR_W) : `a${'.'.repeat(BAR_W - 2)}a`)), AA_PALETTE);

const KEEPER = { x: 6, y: 19 };
const LAMP = { x: 22, y: 24 };
const SILL_Y = PARTITION.y + 29;

const base = aaCompose('aa15-opener-base', 80, 60, 'k', [
  { sprite: aaFloor('aa15-floor', 80, [[2, 37]]), x: 0, y: 49 },
  { sprite: aaPlaque('aa15-opener-plate', 'PAYROLL'), x: 5, y: 0 },
  { sprite: aaBlock('aa15-office', OPEN.x1 - OPEN.x0 + 1, OPEN.y1 - OPEN.y0 + 1, 'K'), x: PARTITION.x + OPEN.x0, y: PARTITION.y + OPEN.y0 },
  { sprite: aaBankersLamp, ...LAMP },
  { sprite: aaBookkeeper, ...KEEPER },
  { sprite: partition, x: PARTITION.x, y: PARTITION.y },
  { sprite: rail, x: PARTITION.x + OPEN.x0 + 1, y: PARTITION.y + OPEN.y0 + 2 },
  { sprite: aaCharter('aa15-charter', 'W-2'), x: 52, y: 1 },
  { sprite: costChart, ...CHART },
]);

/** The pay packet pushed out along the sill, then a fresh one. */
const packet: PixelSprite = (() => {
  const env = aaEnvelope('aa15-packet-env', 'u', 'v', 'r', MANILA).rows;
  const W = 21;
  const at = (dx: number) => env.map((r) => `${'.'.repeat(dx)}${r}${'.'.repeat(W - 11 - dx)}`);
  const gone = env.map(() => '.'.repeat(W));
  return { ...sprite('aa15-packet', at(10), MANILA), frames: [gone, at(0), at(3), at(6), at(9), at(10), at(10), at(10), at(10), gone], frameMs: 420 };
})();

export const aa15Opener: SceneArt = {
  id: 'aa15-opener',
  label: 'The bookkeeper slides a manila pay packet out of an open pay window under a brass plate reading PAYROLL, beside a big gilt chart where the true cost of a salary, with stock, health cover, pension and payroll tax stacked on it, stands nearly twice as tall as the pay alone, under a W-2 charter.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: packet, x: KEEPER.x + 2, y: SILL_Y - 7 },
    { sprite: extrasGlow, x: COST_X, y: BASE_Y - COST_H, motion: { kind: 'twinkle', periodMs: 2600, min: 0.1 } },
    { sprite: aaBlink, x: KEEPER.x + AA_AT.blinkOnBookkeeper.x, y: KEEPER.y + AA_AT.blinkOnBookkeeper.y },
    { sprite: aaLampGlow, x: LAMP.x + AA_AT.glowInLamp.x, y: LAMP.y + AA_AT.glowInLamp.y, motion: { kind: 'twinkle', periodMs: 3400, min: 0.35 } },
    { sprite: aaGlint, x: PARTITION.x + OPEN.x0 + 1, y: PARTITION.y + OPEN.y0, motion: { kind: 'twinkle', periodMs: 2800, min: 0.4 } },
    { sprite: aaMote, x: 31, y: 30, motion: { kind: 'rise', amp: 4, periodMs: 3300 } },
  ],
};

/** Lesson 15 emblem: a gilt head and shoulders with a coin at the shoulder, the cost of a person. */
const COIN = ['..OOO..', '.OGaaO.', 'OGaaGGO', 'OGGaGGO', 'OGGaaGO', '.OaaGO.', '..OOO..'];
const emblemPerson = (() => {
  const rows = [
    '................',
    '....yyyyG.......',
    '...yGGGGGg......',
    '...yGGGGGg......',
    '...yGGGGGg......',
    '....GGGGg.......',
    '.....ggg........',
    '..yyyGGGGG......',
    '.yGGGGGGGGGg....',
    'yGGGGGGGGGGGg...',
    'yGGGGGGGGGGGg...',
    'yGGGGGGGGGGGg...',
    'yGGGGGGGGGGGg...',
    'gggggggggggggg..',
    '................',
    '................',
  ].map((r) => [...r]);
  COIN.forEach((r, y) => [...r].forEach((ch, x) => { if (ch !== '.') rows[y + 8][x + 9] = ch; }));
  return sprite('aa-emblem-person', rows.map((r) => r.join('')), AA_PALETTE);
})();

export const aa15Finish = aaKeepsake(
  'aa15-finish',
  'A purple leather ledger with gold corners and a red ribbon bookmark, its cover stamped in gold with a head and shoulders beside a coin, with small glints and check marks around it.',
  emblemPerson,
);

export const art: LessonArtSet = { opener: aa15Opener, backdrop: aaBackdrop, finish: aa15Finish };
