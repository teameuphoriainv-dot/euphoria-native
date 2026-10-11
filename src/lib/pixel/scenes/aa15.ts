/**
 * Applied Accounting lesson 15, Payroll Accounting & Employee Benefits: what an employee really costs
 * is more than the pay in the packet.
 *
 * The pay office. A panelled partition fills the middle with a pay window cut into it, brass bars at
 * its sides and across its head, and through it the bookkeeper at the paymaster's desk, a lamp behind;
 * a manila pay packet slides out along the ledge. On the left wall is the time clock with its rack of
 * cards; on the right a charter reads W-2, and under it a gilt-framed chart sets the salary alone
 * beside the true cost, the same salary with stock, health cover, the pension match and payroll tax
 * stacked on top. A plate reads PAYROLL. Moving: the pay packet slides out, a card drops into the time
 * clock and its hand goes round, the lamp breathes, light runs on the bars, the bookkeeper blinks.
 */
import type { PixelSprite } from '../types';
import { AA_AT, AA_PALETTE, aaBankersLamp, aaBlink, aaBookkeeper, aaCharter, aaCompose, aaGlint, aaLampGlow, aaMote, aaPlaque } from './aa-kit';
import { aaFloor, aaFrame } from './aa-kit-a';
import { aaBlock, aaEnvelope } from './aa-kit-b';
import { aaKeepsake } from './aa1-finish';
import { aaBackdrop } from './aa-backdrop';
import type { LessonArtSet, SceneArt } from './types';

const sprite = (id: string, rows: string[], palette?: Record<string, string>): PixelSprite =>
  ({ id, name: id, tags: ['aa', 'aa15'], rows, ...(palette ? { palette } : {}) });

/** Manila for the pay packet. */
const MANILA = { ...AA_PALETTE, u: '#D9AE6E', v: '#9C7440' };

/** The partition, 44 x 48: a cornice, the pay window with a rounded head, a sill, two raised panels. */
const PARTITION = { x: 18, y: 9, w: 44, h: 48 };
const OPEN = { x0: 3, x1: 40, y0: 5, y1: 28 };
const partition = sprite('aa15-partition', Array.from({ length: PARTITION.h }, (_, y) => Array.from({ length: PARTITION.w }, (_, x) => {
  const corner = Math.min(x - OPEN.x0, OPEN.x1 - x);
  const open = x >= OPEN.x0 && x <= OPEN.x1 && y >= OPEN.y0 && y <= OPEN.y1 && !(y - OPEN.y0 < 3 && corner < 3 - (y - OPEN.y0));
  if (open) return '.';
  if (y === 0) return x === 0 ? 'y' : x === PARTITION.w - 1 ? 'g' : 'G';
  if (y === 29) return x === PARTITION.w - 1 ? 'g' : x === 0 ? 'y' : 'G';
  if (y === 30) return 'g';
  if (y === 31 || y === 1) return 'O';
  const inPanel = y >= 34 && y <= 45 && ((x >= 3 && x <= 20) || (x >= 23 && x <= 40));
  if (inPanel) return y === 34 || x === 3 || x === 23 ? 'g' : y === 45 || x === 20 || x === 40 ? 'K' : 'O';
  if (y >= 5 && y <= 28 && (x === OPEN.x1 + 1)) return 'g';
  return 'O';
}).join('')));

/** The window's brass: bars at each side and across the head, a rail above the sill. */
const grille = sprite('aa15-grille', Array.from({ length: OPEN.y1 - OPEN.y0 + 1 }, (_, y) => Array.from({ length: OPEN.x1 - OPEN.x0 + 1 }, (_, x) => {
  const side = x <= 8 || x >= 29;
  if (y === 3) return 'G';
  if (y < 3) return x % 3 === 1 ? 'g' : '.';
  return side && x % 3 === 1 ? 'G' : '.';
}).join('')));

/** The time clock, 13 x 24: a white dial, a card slot with a card in it, a red lever, a plinth. */
const CLOCK = { x: 2, y: 12 };
const DIAL = { x: 6, y: 6 };
const timeClock = sprite('aa15-time-clock', Array.from({ length: 24 }, (_, y) => Array.from({ length: 13 }, (_, x) => {
  const d = Math.hypot(x - DIAL.x, y - DIAL.y);
  if (y < 13 && d <= 4.6) return d > 3.6 ? 'O' : (x === DIAL.x && y >= 3 && y <= 6) ? 'K' : 'a';
  if (x === 0 || x === 12 || y === 0 || y === 23) return 'O';
  if (y === 15 && x >= 3 && x <= 9) return 'K';
  if ((y === 14 || y === 16) && x >= 2 && x <= 10) return 'D';
  if (y >= 18 && y <= 19 && x >= 9 && x <= 10) return 'R';
  if (y === 21) return 'g';
  return x === 1 ? 'G' : 'g';
}).join('')), AA_PALETTE);

/** The rack of time cards, 13 x 14: three rows of three white cards in their pockets. */
const cardRack = sprite('aa15-card-rack', [
  'OOOOOOOOOOOOO',
  ...[0, 1, 2].flatMap(() => ['OaaaOaaaOaaaO', 'OaacOaacOaacO', 'OgggggggggggO', 'OOOOOOOOOOOOO']),
], AA_PALETTE);

/** The true cost: salary alone against salary with stock, health, pension and payroll tax stacked on. */
const COST = { x: 64, y: 27 };
const costChart = (() => {
  const field = Array.from({ length: 18 }, (_, y) => Array.from({ length: 11 }, (_, x) => {
    const fromBottom = 17 - y;
    if (x >= 1 && x <= 4) return fromBottom < 10 ? (x === 1 ? 'y' : 'G') : '.';
    if (x >= 6 && x <= 9) {
      if (fromBottom < 10) return x === 6 ? 'y' : 'G';
      if (fromBottom < 13) return 'P';
      if (fromBottom < 15) return 'N';
      if (fromBottom < 17) return 'B';
      return 'R';
    }
    return '.';
  }).join(''));
  return aaCompose('aa15-cost-chart', 15, 22, '.', [
    { sprite: aaFrame('aa15-cost-frame', 15, 22, 'K'), x: 0, y: 0 },
    { sprite: sprite('aa15-cost-bars', field), x: 2, y: 2 },
  ]);
})();

const KEEPER = { x: 31, y: 19 };
const LAMP = { x: 47, y: 24 };
const SILL_Y = PARTITION.y + 29;

const base = aaCompose('aa15-opener-base', 80, 60, 'k', [
  { sprite: aaFloor('aa15-floor', 80, [[18, 61]]), x: 0, y: 49 },
  { sprite: aaPlaque('aa15-opener-plate', 'PAYROLL'), x: 24, y: 0 },
  { sprite: aaBlock('aa15-office', OPEN.x1 - OPEN.x0 + 1, OPEN.y1 - OPEN.y0 + 1, 'K'), x: PARTITION.x + OPEN.x0, y: PARTITION.y + OPEN.y0 },
  { sprite: aaBankersLamp, ...LAMP },
  { sprite: aaBookkeeper, ...KEEPER },
  { sprite: partition, x: PARTITION.x, y: PARTITION.y },
  { sprite: grille, x: PARTITION.x + OPEN.x0, y: PARTITION.y + OPEN.y0 },
  { sprite: timeClock, ...CLOCK },
  { sprite: cardRack, x: 2, y: 36 },
  { sprite: aaCharter('aa15-charter', 'W-2'), x: 64, y: 11 },
  { sprite: costChart, ...COST },
]);

/** The pay packet pushed out under the bars and along the sill, then a fresh one. */
const packet: PixelSprite = (() => {
  const env = aaEnvelope('aa15-packet-env', 'u', 'v', 'r', MANILA).rows;
  const W = 21;
  const at = (dx: number) => env.map((r) => `${'.'.repeat(dx)}${r}${'.'.repeat(W - 11 - dx)}`);
  const gone = env.map(() => '.'.repeat(W));
  return { ...sprite('aa15-packet', at(10), MANILA), frames: [gone, at(0), at(3), at(6), at(9), at(10), at(10), at(10), at(10), gone], frameMs: 420 };
})();

/** A card going down into the time clock's slot, row by row out of sight, and the dial's hand going round. */
const card: PixelSprite = (() => {
  const CARD = ['aac', 'aXc', 'aac', 'aXc'];
  const at = (dy: number) => Array.from({ length: 4 }, (_, y) => CARD[y - dy] ?? '...');
  return { ...sprite('aa15-card', at(0), AA_PALETTE), frames: [at(0), at(0), at(1), at(2), at(3), at(4), at(4), at(4)], frameMs: 450 };
})();
const HAND_STEPS = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];
const dialHand: PixelSprite = (() => {
  const frame = ([dx, dy]: number[]) => Array.from({ length: 7 }, (_, y) => Array.from({ length: 7 }, (_, x) =>
    [1, 2].some((k) => x === 3 + dx * k && y === 3 + dy * k) ? 'r' : '.').join(''));
  return { ...sprite('aa15-dial-hand', frame(HAND_STEPS[2])), frames: HAND_STEPS.map(frame), frameMs: 700 };
})();

export const aa15Opener: SceneArt = {
  id: 'aa15-opener',
  label: 'The bookkeeper slides a manila pay packet out of a barred pay window under a brass plate reading PAYROLL, between a time clock with its rack of cards and a W-2 charter above a chart where the true cost of a salary stands far taller than the salary alone.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: packet, x: KEEPER.x + 2, y: SILL_Y - 7 },
    { sprite: card, x: CLOCK.x + 5, y: CLOCK.y + 11 },
    { sprite: dialHand, x: CLOCK.x + DIAL.x - 3, y: CLOCK.y + DIAL.y - 3 },
    { sprite: aaBlink, x: KEEPER.x + AA_AT.blinkOnBookkeeper.x, y: KEEPER.y + AA_AT.blinkOnBookkeeper.y },
    { sprite: aaLampGlow, x: LAMP.x + AA_AT.glowInLamp.x, y: LAMP.y + AA_AT.glowInLamp.y, motion: { kind: 'twinkle', periodMs: 3400, min: 0.35 } },
    { sprite: aaGlint, x: PARTITION.x + OPEN.x0 + 2, y: PARTITION.y + OPEN.y0 + 1, motion: { kind: 'twinkle', periodMs: 2800, min: 0.4 } },
    { sprite: aaMote, x: 44, y: 30, motion: { kind: 'rise', amp: 4, periodMs: 3300 } },
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
