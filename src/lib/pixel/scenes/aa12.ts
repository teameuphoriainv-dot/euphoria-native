/**
 * Applied Accounting lesson 12, Inventory Accounting Methods: the same goods, costed in a different
 * order, give a different profit.
 *
 * The hall's stockroom, no desk in sight. Every crate is stencilled with what it cost, and the price
 * has been rising: $1 for the oldest, $3 for the newest. On the left the crates stand in a stack on a
 * pallet under a plate reading LIFO, and the last one in, $3 on top, is the one lifted off. On the
 * right they queue along a roller conveyor under a plate reading FIFO, and the first one in, $1 at
 * the front, rolls off the end into the bin. A green enamel lamp hangs over the conveyor and more stock
 * waits on a wall shelf. Moving: the
 * top crate lifts, the front crate rolls off and drops, the rollers turn, the lamp breathes, dust rises.
 */
import type { PixelSprite } from '../types';
import { AA_PALETTE, aaCompose, aaGlint, aaMote, aaPlaque, aaText } from './aa-kit';
import { aaFloor } from './aa-kit-a';
import { aaKeepsake } from './aa1-finish';
import { aaBackdrop } from './aa-backdrop';
import type { LessonArtSet, SceneArt } from './types';

const sprite = (id: string, rows: string[], palette?: Record<string, string>): PixelSprite =>
  ({ id, name: id, tags: ['aa', 'aa12'], rows, ...(palette ? { palette } : {}) });

/** Deal for the crates and the stock shelf. */
const WOOD = { u: '#C49A6C', v: '#8E6A44' };

/** A white price label, 9 x 7, the cost in black. */
const label = (id: string, price: string) => sprite(id, [
  'aaaaaaaac',
  ...aaText(`${id}-text`, `$${price}`, 'K').rows.map((r) => `a${r.replace(/\./g, 'a')}c`),
  'ccccccccc',
], AA_PALETTE);

/** A slatted deal crate, 13 x 10, with what it cost on a label. */
const crate = (id: string, price: string) => aaCompose(id, 13, 10, '.', [
  { sprite: sprite(`${id}-box`, [
    'O'.repeat(13),
    'OuuuuuuuuuuvO',
    'OvvvvvvvvvvvO',
    'O'.repeat(13),
    'OuuuuuuuuuuvO',
    'OvvvvvvvvvvvO',
    'O'.repeat(13),
    'OuuuuuuuuuuvO',
    'OvvvvvvvvvvvO',
    'O'.repeat(13),
  ], WOOD), x: 0, y: 0 },
  { sprite: label(`${id}-label`, price), x: 2, y: 1 },
]);

/** A wall shelf of smaller stock, 23 x 12: cartons on a plank on two brackets. */
const shelf = sprite('aa12-shelf', [
  '..OOOOOO...............',
  '..OuuuuO......OOOOOOO..',
  '..OuvvuO......OuuuuuO..',
  '..OuuuuO.OOOO.OuvvvuO..',
  '..OvvvvO.OuuO.OuuuuuO..',
  '..OOOOOO.OvvO.OvvvvvO..',
  'yGGGGGGGGGGGGGGGGGGGGGg',
  'OOOOOOOOOOOOOOOOOOOOOOO',
  '..O.................O..',
  '..OO................OO.',
  '..OOO...............OOO',
  '.......................',
], WOOD);

/** The pallet under the stack, 15 x 3. */
const pallet = sprite('aa12-pallet', ['uuuuuuuuuuuuuuv', 'Ov.Ov..Ov..Ov.O', 'OOOOOOOOOOOOOOO'], WOOD);

/** The roller conveyor, 44 x 17: steel rollers along the top, a frame painted with arrows, three legs. */
const CONVEYOR = { x: 20, y: 40, w: 44 };
const conveyor = sprite('aa12-conveyor', [
  Array.from({ length: CONVEYOR.w }, (_, x) => (x % 3 === 1 ? 'X' : 'c')).join(''),
  'D'.repeat(CONVEYOR.w),
  `D${'K'.repeat(CONVEYOR.w - 2)}D`,
  `D${'KKKKKKcKK'.repeat(5).slice(0, CONVEYOR.w - 2)}D`,
  `D${'KKKKKKKcK'.repeat(5).slice(0, CONVEYOR.w - 2)}D`,
  `D${'KKKKKKcKK'.repeat(5).slice(0, CONVEYOR.w - 2)}D`,
  'D'.repeat(CONVEYOR.w),
  ...Array.from({ length: 10 }, () => `.Dx${'.'.repeat(18)}Dx${'.'.repeat(18)}Dx.`),
], AA_PALETTE);

/** The rollers turning: the light on each roller steps along. */
const rollers: PixelSprite = {
  ...sprite('aa12-rollers', [conveyor.rows[0]], AA_PALETTE),
  frames: [0, 1, 2].map((k) => [Array.from({ length: CONVEYOR.w }, (_, x) => ((x + k) % 3 === 1 ? 'X' : 'c')).join('')]),
  frameMs: 450,
};

/** The bin at the conveyor's end, 15 x 12, open at the top. */
const bin = sprite('aa12-bin', [
  'O.............O',
  'Ou...........vO',
  'OuOOOOOOOOOOOvO',
  'OuuuuuuuuuuuuvO',
  'OuvvvvvvvvvvvvO',
  'OuOOOOOOOOOOOvO',
  'OuuuuuuuuuuuuvO',
  'OuvvvvvvvvvvvvO',
  'OuOOOOOOOOOOOvO',
  'OuuuuuuuuuuuuvO',
  'OOOOOOOOOOOOOOO',
  '.OO.........OO.',
], WOOD);

/** A green enamel lamp hanging on its flex from the ceiling, 11 x 11. */
const pendant = sprite('aa12-pendant', [
  '.....D.....',
  '.....D.....',
  '.....D.....',
  '.....D.....',
  '.....D.....',
  '....OGO....',
  '...nNNNn...',
  '..nNmNNNn..',
  '.nNNNNNNNn.',
  'nnnnnnnnnnn',
  '...........',
]);
const bulb = sprite('aa12-bulb', ['.55555.', '..555..']);

const STACK = { x: 2, y: 24 };
const FIFO_CRATES = [{ price: '3', x: 22 }, { price: '2', x: 36 }];
const FRONT = { x: 50, y: 30 };
const BIN = { x: 65, y: 45 };
const LAMP = { x: 36, y: 0 };

const base = aaCompose('aa12-opener-base', 80, 60, 'k', [
  { sprite: aaFloor('aa12-floor', 80, [[2, 17], [20, 79]]), x: 0, y: 49 },
  { sprite: aaPlaque('aa12-plate-lifo', 'LIFO'), x: STACK.x, y: 12 },
  { sprite: aaPlaque('aa12-plate-fifo', 'FIFO'), x: 34, y: 14 },
  { sprite: pendant, ...LAMP },
  { sprite: shelf, x: 56, y: 15 },
  { sprite: bin, ...BIN },
  { sprite: conveyor, x: CONVEYOR.x, y: CONVEYOR.y },
  ...FIFO_CRATES.map(({ price, x }) => ({ sprite: crate(`aa12-crate-fifo-${price}`, price), x, y: CONVEYOR.y - 10 })),
  { sprite: pallet, x: STACK.x, y: 54 },
  { sprite: crate('aa12-crate-lifo-1', '1'), x: STACK.x + 1, y: 44 },
  { sprite: crate('aa12-crate-lifo-2', '2'), x: STACK.x + 1, y: 34 },
]);

/** The front crate, $1, rolling to the end of the conveyor and dropping into the bin, then the next. */
const frontCrate: PixelSprite = (() => {
  const one = crate('aa12-crate-front-box', '1');
  const box = one.rows;
  const W = 26;
  const H = 21;
  const at = (dx: number, dy: number) => Array.from({ length: H }, (_, y) =>
    Array.from({ length: W }, (_, x) => box[y - dy]?.[x - dx] ?? '.').join(''));
  const empty = at(-20, -20);
  return {
    ...sprite('aa12-crate-front', at(0, 0), one.palette),
    frames: [at(0, 0), at(0, 0), at(0, 0), at(3, 0), at(6, 0), at(9, 0), at(12, 1), at(14, 4), at(15, 8), empty, empty],
    frameMs: 380,
  };
})();

/** The top of the stack, $3, the last one in: lifted off first. */
const topCrate = crate('aa12-crate-lifo-3', '3');
const upArrow = sprite('aa12-up-arrow', ['..c..', '.ccc.', 'ccccc', '..c..', '..c..'], AA_PALETTE);

export const aa12Opener: SceneArt = {
  id: 'aa12-opener',
  label: 'A stockroom of crates stencilled $1, $2 and $3: under a plate reading LIFO the newest $3 crate is lifted off the top of a stack, and under a plate reading FIFO the oldest $1 crate rolls off the end of a conveyor into a bin.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: topCrate, x: STACK.x + 1, y: 24, motion: { kind: 'bob', amp: 3, periodMs: 2400 } },
    { sprite: upArrow, x: STACK.x + 15, y: 25, motion: { kind: 'twinkle', periodMs: 2400, min: 0.2 } },
    { sprite: frontCrate, ...FRONT },
    { sprite: rollers, x: CONVEYOR.x, y: CONVEYOR.y },
    { sprite: bulb, x: LAMP.x + 2, y: LAMP.y + 10, motion: { kind: 'twinkle', periodMs: 3400, min: 0.4 } },
    { sprite: aaGlint, x: 31, y: 15, motion: { kind: 'twinkle', periodMs: 3000, min: 0.5 } },
    { sprite: aaMote, x: 44, y: 22, motion: { kind: 'rise', amp: 5, periodMs: 3200 } },
  ],
};

/** Lesson 12 emblem: three gilt crates stacked two and one, the stock on hand. */
const emblemCrates = (() => {
  const box = (w: number) => ['y'.repeat(w), `y${'G'.repeat(w - 2)}g`, `y${'O'.repeat(w - 2)}g`, `y${'G'.repeat(w - 2)}g`, `y${'O'.repeat(w - 2)}g`, `y${'G'.repeat(w - 2)}g`, 'g'.repeat(w)];
  const top = box(8);
  const low = box(7);
  return sprite('aa-emblem-crates', [
    ...top.map((r) => `....${r}....`),
    '................',
    ...low.map((r) => `${r}..${r}`),
    '................',
  ]);
})();

export const aa12Finish = aaKeepsake(
  'aa12-finish',
  'A purple leather ledger with gold corners and a red ribbon bookmark, its cover stamped in gold with three crates stacked two and one, with small glints and check marks around it.',
  emblemCrates,
);

export const art: LessonArtSet = { opener: aa12Opener, backdrop: aaBackdrop, finish: aa12Finish };
