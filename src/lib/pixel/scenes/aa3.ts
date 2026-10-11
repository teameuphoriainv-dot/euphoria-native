/**
 * Applied Accounting lesson 3, The Income Statement Deep Dive: from the top line to the bottom line.
 *
 * A slate chart in a gilt frame fills the wall: the income statement as a waterfall, a tall gold
 * revenue bar, red costs hanging from each level (cost of goods, operating expenses, tax), gold gross
 * and operating profit, and a small green net income bar at the end, REV and NET lettered under the
 * ends. The bookkeeper sits at the desk's far end under a plate reading P&L with the statement in front
 * of him, its bottom line green and double-ruled; three coin stacks on the desk step down the same way.
 * Moving: a coin hops down the waterfall from revenue to net income, the net income bar and the
 * bottom line glow, the lamp breathes, dust rises, the bookkeeper blinks.
 */
import type { PixelSprite } from '../types';
import { AA_AT, AA_PALETTE, aaBankersLamp, aaBlink, aaBookkeeper, aaCompose, aaDesk, aaHandRest, aaLampGlow, aaMote, aaPlaque, aaText } from './aa-kit';
import { aaFloor, aaFrame } from './aa-kit-a';
import { aaKeepsake } from './aa1-finish';
import { aaBackdrop } from './aa-backdrop';
import type { LessonArtSet, SceneArt } from './types';

const sprite = (id: string, rows: string[], palette?: Record<string, string>): PixelSprite =>
  ({ id, name: id, tags: ['aa', 'aa3'], rows, ...(palette ? { palette } : {}) });

/** Field of the chart, 47 x 20. Bars are [first column, top row, bottom row, ramp]. */
const FIELD = { w: 47, h: 20 };
const GOLD = 'yGGGg';
const RED = 'sRRRr';
const GREEN = 'mNNNn';
const BARS: [number, number, number, string][] = [
  [3, 2, 13, GOLD], [9, 2, 6, RED], [15, 7, 13, GOLD], [21, 7, 9, RED], [27, 10, 13, GOLD], [33, 10, 10, RED], [39, 11, 13, GREEN],
];
/** Each level carried across the gap to the next bar: [row, column]. */
const LEVELS: [number, number][] = [[2, 8], [7, 14], [7, 20], [10, 26], [10, 32], [11, 38]];

const waterfall = (() => {
  const cells = Array.from({ length: FIELD.h }, () => Array.from({ length: FIELD.w }, () => '.'));
  BARS.forEach(([x0, top, bottom, ramp]) => {
    for (let y = top; y <= bottom; y++) for (let dx = 0; dx < 5; dx++) cells[y][x0 + dx] = ramp[dx];
  });
  LEVELS.forEach(([y, x]) => { cells[y][x] = 'x'; });
  for (let x = 1; x < FIELD.w - 1; x++) cells[14][x] = 'x';
  return sprite('aa3-waterfall', cells.map((r) => r.join('')));
})();

/** Three coin stacks stepping down like the chart. */
const coinStack = (id: string, h: number) =>
  sprite(id, ['.OOO.', ...Array.from({ length: h }, (_, i) => (i % 2 ? 'OGggO' : 'OyGgO')), 'OOOOO']);

/** The statement on the desk: revenue, costs, gross profit, the bottom line in green, double-ruled. */
const statement = sprite('aa3-statement', [
  'aaaaaaaaaac',
  'akkkkkakkkc',
  'arrrraaarrc',
  'akkkkaaakkc',
  'annnnnannnc',
  'aaaaaaannnc',
  'aaaaaaaaaac',
  'aaaaaaannnc',
  'ccccccccccc',
], AA_PALETTE);

const CHART = { x: 3, y: 1 };
const FIELD_AT = { x: CHART.x + 2, y: CHART.y + 2 };
const LAMP = { x: 40, y: 25 };
const KEEPER = { x: 58, y: 16 };
const STATEMENT = { x: KEEPER.x + 2, y: 36 };

const base = aaCompose('aa3-opener-base', 80, 60, 'k', [
  { sprite: aaFloor('aa3-floor', 80, [[5, 76]]), x: 0, y: 49 },
  { sprite: aaFrame('aa3-chart', FIELD.w + 4, FIELD.h + 4, 'K'), ...CHART },
  { sprite: waterfall, ...FIELD_AT },
  { sprite: aaText('aa3-rev', 'REV', 'y'), x: FIELD_AT.x + 1, y: FIELD_AT.y + 15 },
  { sprite: aaText('aa3-net', 'NET', 'N'), x: FIELD_AT.x + 35, y: FIELD_AT.y + 15 },
  { sprite: aaPlaque('aa3-opener-plate', 'P&L'), x: 60, y: 4 },
  { sprite: aaBookkeeper, ...KEEPER },
  { sprite: aaDesk, x: 4, y: 36 },
  { sprite: aaBankersLamp, ...LAMP },
  { sprite: coinStack('aa3-stack-a', 7), x: 10, y: 33 },
  { sprite: coinStack('aa3-stack-b', 4), x: 17, y: 36 },
  { sprite: coinStack('aa3-stack-c', 2), x: 24, y: 38 },
  { sprite: statement, ...STATEMENT },
  { sprite: aaHandRest, x: KEEPER.x + 13, y: 36 },
]);

/** A coin rolls off each level and drops to the next, revenue to net income, then shines. */
const COIN_AT: [number, number][] = [[4, 0], [4, 0], [10, 0], [16, 5], [22, 5], [28, 8], [34, 8], [40, 9], [40, 9]];
const coinHop: PixelSprite = (() => {
  const frame = (at?: [number, number], shine = false) => {
    const cells = Array.from({ length: FIELD.h }, () => Array.from({ length: FIELD.w }, () => '.'));
    if (at) {
      const [x, y] = at;
      ['yGG', 'Ggg'].forEach((r, dy) => [...r].forEach((ch, dx) => { cells[y + dy][x + dx] = ch; }));
      if (shine) { cells[y][x + 3] = 'y'; cells[y + 1][x - 1] = 'y'; }
    }
    return cells.map((r) => r.join(''));
  };
  const frames = [...COIN_AT.map((at, i) => frame(at, i === COIN_AT.length - 1)), frame(), frame()];
  return { ...sprite('aa3-coin-hop', frames[0]), frames, frameMs: 430 };
})();

const netGlow = sprite('aa3-net-glow', ['mmmmm', 'mmmmm', 'mmmmm']);
const bottomLine = sprite('aa3-bottom-line', ['mmm', '...', 'mmm']);

export const aa3Opener: SceneArt = {
  id: 'aa3-opener',
  label: 'A bookkeeper sits under a waterfall chart where a coin steps down from a tall revenue bar past red costs to a small green net income bar, beside a brass plate reading P&L.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: coinHop, ...FIELD_AT },
    { sprite: netGlow, x: FIELD_AT.x + 39, y: FIELD_AT.y + 11, motion: { kind: 'twinkle', periodMs: 2400, min: 0.1 } },
    { sprite: bottomLine, x: STATEMENT.x + 7, y: STATEMENT.y + 5, motion: { kind: 'twinkle', periodMs: 2400, phase: 0.5, min: 0.1 } },
    { sprite: aaLampGlow, x: LAMP.x + AA_AT.glowInLamp.x, y: LAMP.y + AA_AT.glowInLamp.y, motion: { kind: 'twinkle', periodMs: 3400, min: 0.35 } },
    { sprite: aaBlink, x: KEEPER.x + AA_AT.blinkOnBookkeeper.x, y: KEEPER.y + AA_AT.blinkOnBookkeeper.y },
    { sprite: aaMote, x: 43, y: 34, motion: { kind: 'rise', amp: 5, periodMs: 2800 } },
    { sprite: aaMote, x: 50, y: 33, motion: { kind: 'rise', amp: 4, periodMs: 3300, phase: 0.5 } },
  ],
};

/** Lesson 3 emblem: a gilt waterfall, revenue down past two hanging costs to the bottom line. */
const emblemWaterfall = sprite('aa-emblem-waterfall', [
  '................',
  '................',
  '.yGggO..........',
  '.yG.gO..........',
  '.yG.gO..........',
  '.yG.gO..........',
  '.yG.gO..........',
  '.yG...gyGggO....',
  '.yG....yG.gO....',
  '.yG....yG.gO....',
  '.yG....yG...gyG.',
  '.yG....yG....yG.',
  '.yG....yG....yG.',
  '.yG....yG....yG.',
  'OOOOOOOOOOOOOOOO',
  '................',
]);

export const aa3Finish = aaKeepsake(
  'aa3-finish',
  'A purple leather ledger with gold corners and a red ribbon bookmark, its cover stamped in gold with a waterfall of bars stepping down to the bottom line, with small glints and check marks around it.',
  emblemWaterfall,
);

export const art: LessonArtSet = { opener: aa3Opener, backdrop: aaBackdrop, finish: aa3Finish };
