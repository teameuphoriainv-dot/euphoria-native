/**
 * Personal Finance lesson 10, Building Long-Term Wealth (a 50 XP milestone): fill the jars in order.
 *
 * The kitchen at the golden end of the day, and on the table the lesson's order of operations as seven
 * glass jars in a row: the first three full of gold (the starter fund, the employer match, the costly
 * debt paid off), the fourth filling, the last three still empty and waiting their turn. The figure
 * drops one more coin into the fourth. A tall clock stands by the table for the decades that do the
 * compounding. Moving: the coin, the pendulum, a glint on the full jars, the lamp, smoke and a bird in
 * the sunset, the cat's z. The keepsake is the milestone fob, its roof gold.
 */
import type { PixelSprite } from '../types';
import {
  pfBird,
  pfCat,
  pfCompose,
  pfCurtain,
  pfKitchen,
  pfLampGlow,
  pfLampPool,
  pfPendantLamp,
  pfSaverReach,
  pfSmoke,
  pfSparkle,
  pfTable,
  pfWindowDusk,
  pfZzz,
} from './pf-kit';
import { pfKeepsakeGold } from './pf-kit-b';
import { pfBackdrop } from './pf-backdrop';
import type { LessonArtSet, SceneArt } from './types';

/** Coin layers for a jar, bottom up: gold bands with a glint, the highest one heaped. */
const COINS = ['GgGgG', 'gGyGg', 'GgGGg', 'gGgyG', 'GGgGg', 'gyGgG', '.GyG.'];

/** A glass jar 7x9, open at the top, `fill` rows of coins (0 to 7); the glass glints on the left. */
function jar(id: string, fill: number): PixelSprite {
  const inside = (row: number) => {
    const fromBottom = 7 - row;
    if (fromBottom < fill) return COINS[fromBottom];
    return row === 2 || row === 3 ? 'w....' : '.....';
  };
  return {
    id,
    name: id,
    tags: ['scene', 'pf'],
    rows: [
      '.xxxxX.',
      ...Array.from({ length: 7 }, (_, i) => {
        const row = i + 1;
        const fillRow = inside(row);
        // The glint stays on the glass over the coins too.
        const glass = row === 2 || row === 3 ? 'w' + fillRow.slice(1) : fillRow;
        return `x${glass}X`;
      }),
      '.xxxxX.',
    ],
  };
}

/** A tall case clock: bonnet, dial at 3 o'clock, a glass trunk for the pendulum (columns 4 to 8, rows 14 to 30), plinth and feet. */
const caseClock: PixelSprite = {
  id: 'pf10-case-clock',
  name: 'case clock',
  tags: ['scene', 'pf'],
  rows: [
    '.....OOO.....',
    '...OOGyGOO...',
    '.OOgGGGGGgOO.',
    'OgggggggggggO',
    'OOOOOOOOOOOOO',
    'OgOOxxxxxOOgO',
    'OgOxwwKwwxOgO',
    'OgOxwwKwwxOgO',
    'OgOxwwKKwxOgO',
    'OgOxwwwwwxOgO',
    'OgOxwwwwwxOgO',
    'OgOOxxxxxOOgO',
    'OOOOOOOOOOOOO',
    '.OgOOOOOOOgO.',
    '.OgOkkkkkOgO.',
    '.OgOkkkkkOgO.',
    '.OgOkkkkkOgO.',
    '.OgOkkkkkOgO.',
    '.OgOkkkkkOgO.',
    '.OgOkkkkkOgO.',
    '.OgOkkkkkOgO.',
    '.OgOkkkkkOgO.',
    '.OgOkkkkkOgO.',
    '.OgOkkkkkOgO.',
    '.OgOkkkkkOgO.',
    '.OgOkkkkkOgO.',
    '.OgOkkkkkOgO.',
    '.OgOkkkkkOgO.',
    '.OgOkkkkkOgO.',
    '.OgOkkkkkOgO.',
    '.OgOkkkkkOgO.',
    '.OgOOOOOOOgO.',
    '.OgggggggggO.',
    'OOOOOOOOOOOOO',
    'OgGGGGGGGGGgO',
    'OgGgggggggGgO',
    'OgGgggggggGgO',
    'OgGGGGGGGGGgO',
    'OgggggggggggO',
    'OOOOOOOOOOOOO',
    '.OO.......OO.',
  ],
};

/** The pendulum in the clock's glass trunk, swinging: rest, right, rest, left. */
const PEND_ROD = (col: number) => '.....'.slice(0, col) + 'X' + '.....'.slice(col + 1);
function pendulum(top: number, bottom: number, bob: readonly string[]): string[] {
  return [
    ...Array.from({ length: 6 }, () => PEND_ROD(top)),
    ...Array.from({ length: 6 }, () => PEND_ROD(bottom)),
    ...bob,
    '.....',
    '.....',
  ];
}
const PEND_REST = pendulum(2, 2, ['.GyG.', '.GGg.', '..g..']);
const PEND_RIGHT = pendulum(2, 3, ['..GyG', '..GGg', '...g.']);
const PEND_LEFT = pendulum(2, 1, ['GyG..', 'GGg..', '.g...']);
const clockPendulum: PixelSprite = {
  id: 'pf10-pendulum',
  name: 'pendulum',
  tags: ['scene', 'pf'],
  rows: PEND_REST,
  frames: [PEND_REST, PEND_RIGHT, PEND_REST, PEND_LEFT],
  frameMs: 500,
};

/**
 * A coin let go over the open jar: held, falling past the rim, landing on the coins inside (the
 * sprite's last row sits just above them), a glint, then a new coin in hand.
 */
const C0 = ['.OO.', 'OyGO', 'OGgO', '.OO.'];
const EMPTY = '....';
function coinAt(row: number): string[] {
  return Array.from({ length: 12 }, (_, i) => (i >= row && i < row + 4 ? C0[i - row] : EMPTY));
}
const jarCoin: PixelSprite = {
  id: 'pf10-jar-coin',
  name: 'jar coin',
  tags: ['scene', 'pf'],
  rows: coinAt(0),
  frames: [
    coinAt(0),
    coinAt(0),
    coinAt(0),
    coinAt(2),
    coinAt(5),
    coinAt(8),
    [...Array.from({ length: 10 }, () => EMPTY), '.OO.', 'OGgO'],
    [...Array.from({ length: 9 }, () => EMPTY), '.y..', 'yWy.', '.y..'],
    [...Array.from({ length: 10 }, () => EMPTY), '.w..', EMPTY],
    Array.from({ length: 12 }, () => EMPTY),
  ],
  frameMs: 170,
};

/** Lesson 10's emblem: three stacks of coins, each taller than the last. */
const emblemWealth: PixelSprite = {
  id: 'pf10-emblem-wealth',
  name: 'pf10-emblem-wealth',
  tags: ['scene', 'pf', 'emblem'],
  rows: [
    '...........OO.',
    '..........OyGO',
    '..........OggO',
    '......OO..OGGO',
    '.....OyGO.OggO',
    '.OO..OggO.OGGO',
    'OyGO.OGGO.OggO',
    'OggO.OggO.OGGO',
    'OGGO.OGGO.OggO',
  ],
};

// Order is depth: the figure behind the table, the lamp's pool on the top, the jars standing on it.
const base = pfCompose('pf10-opener-base', 80, 60, pfKitchen.rows, [
  [pfWindowDusk, 50, 3],
  [pfCurtain, 49, 2],
  [pfCurtain, 73, 2],
  [caseClock, 1, 7],
  [pfPendantLamp, 38, 0],
  [pfSaverReach, 23, 12],
  [pfTable(66, 12), 14, 36],
  [pfLampPool, 32, 37],
  [jar('pf10-jar-1', 7), 16, 29],
  [jar('pf10-jar-2', 7), 25, 29],
  [jar('pf10-jar-3', 7), 34, 29],
  [jar('pf10-jar-4', 3), 43, 29],
  [jar('pf10-jar-5', 0), 52, 29],
  [jar('pf10-jar-6', 0), 61, 29],
  [jar('pf10-jar-7', 0), 70, 29],
  [pfCat, 30, 50],
]);

export const pf10Opener: SceneArt = {
  id: 'pf10-opener',
  label: 'At a kitchen table at sunset, a person drops a coin into the fourth of seven glass jars lined up in order, the first three full of gold and the last three still empty, beside a tall clock, with the cat asleep on the rug.',
  width: 80,
  height: 60,
  base,
  layers: [
    // The coin hangs from the reaching hand (figure at 23,12; hand at column 22, row 10) over the
    // fourth jar's mouth (jar at 43,29) and lands on its coins (row 34).
    { sprite: jarCoin, x: 44, y: 22 },
    { sprite: clockPendulum, x: 5, y: 21 },
    { sprite: pfSparkle, x: 15, y: 22, motion: { kind: 'twinkle', periodMs: 1900, min: 0.35 } },
    { sprite: pfLampGlow, x: 39, y: 9, motion: { kind: 'twinkle', periodMs: 3000, min: 0.55 } },
    { sprite: pfSmoke, x: 54, y: 9, motion: { kind: 'rise', amp: 2, periodMs: 2600 } },
    { sprite: pfBird, x: 62, y: 12, motion: { kind: 'drift', amp: 2, periodMs: 5200 } },
    { sprite: pfZzz, x: 29, y: 45, motion: { kind: 'rise', amp: 3, periodMs: 2800, phase: 0.3 } },
  ],
};

export const pf10Finish = pfKeepsakeGold(
  'pf10-finish',
  'A gold house-shaped key fob with a gold roof, on a key ring with a brass key, its window showing three stacks of coins growing taller, with small sparkles around it.',
  emblemWealth,
);

export const art: LessonArtSet = { opener: pf10Opener, backdrop: pfBackdrop, finish: pf10Finish };
