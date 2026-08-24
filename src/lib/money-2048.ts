/**
 * MONEY 2048 — pure game logic, no React, no rendering.
 *
 * 2048's mechanic on the REAL US denomination ladder: $1 $2 $5 $10 $20 $50 $100. Two equal bills
 * merge into the next one up. That ladder is not a decoration — it is why the game teaches
 * anything at all. 2048's own ladder doubles every time, so every merge is worth exactly 2x the
 * tile. Money does not work that way: two $2 make $5 (2.5x) and two $20 make $50 (2.5x), while two
 * $5 make $10 (2x). A player feels that asymmetry long before they could name it.
 *
 * SEPARATED FROM THE SCREEN ON PURPOSE, the same as trend-game.ts. Every rule below is testable
 * without mounting anything, and the dev block at the bottom does test them — a merge engine that
 * is subtly wrong is a game that cheats, and nobody can see it happening.
 *
 * THE CANONICAL 2048 RULES, stated because getting any of them wrong is a different game:
 *   1. A tile merges AT MOST ONCE per move. [1,1,2] left is [2,2], never [5].
 *   2. Merges resolve from the direction of travel. [1,1,1] left is [2,1], not [1,2].
 *   3. A move that changes nothing does NOT spawn a tile, and does not count as a move.
 *   4. Game over is "no move in any of the four directions changes the board", not "board full".
 *      A full board with an adjacent pair is still playable, and ending it there is the single
 *      most common way an implementation of this steals a run from someone.
 */

/** The ladder. Index is the tile VALUE stored in the grid; 0 is empty. */
export const LADDER = [0, 1, 2, 5, 10, 20, 50, 100] as const;

export const SIZE = 4;
/** Reaching this is the win banner. The run may continue past it. */
export const GOAL = LADDER.length - 1;

export type Grid = number[][];
export type Dir = 'up' | 'down' | 'left' | 'right';

/** Same PRNG as trend-game.ts — deterministic, seedable, and no Math.random in a render path. */
export function rng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export const emptyGrid = (): Grid => Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => 0));

export const cellsFree = (g: Grid): [number, number][] => {
  const out: [number, number][] = [];
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (g[r][c] === 0) out.push([r, c]);
  return out;
};

/**
 * Drop a new bill on a free cell. 90% a $1, 10% a $2 — 2048's own 2-vs-4 split.
 * Returns a NEW grid; nothing here mutates its input, so React state stays honest.
 */
export function spawn(g: Grid, rand: () => number): Grid {
  const free = cellsFree(g);
  if (!free.length) return g;
  const [r, c] = free[Math.floor(rand() * free.length)];
  const next = g.map((row) => [...row]);
  next[r][c] = rand() < 0.9 ? 1 : 2;
  return next;
}

/**
 * Collapse ONE row leftwards. Every direction is this function plus a rotation, which is what
 * keeps the merge rules in a single place — four hand-written directions is four chances to get
 * rule 1 wrong in three of them.
 *
 * Returns the new row and the points scored: the VALUE OF THE BILL CREATED, so merging up to $100
 * pays 100. Scoring the merged pair instead would pay the same for a cheap merge as a dear one.
 */
export function collapse(row: number[]): { row: number[]; gained: number } {
  const tiles = row.filter((v) => v !== 0);
  const out: number[] = [];
  let gained = 0;
  for (let i = 0; i < tiles.length; i++) {
    // Rule 1: consuming BOTH tiles and stepping i past the partner is what stops a chain merge.
    if (i + 1 < tiles.length && tiles[i] === tiles[i + 1] && tiles[i] < GOAL) {
      const merged = tiles[i] + 1;
      out.push(merged);
      gained += LADDER[merged];
      i++;
    } else {
      out.push(tiles[i]);
    }
  }
  while (out.length < SIZE) out.push(0);
  return { row: out, gained };
}

const rotateCW = (g: Grid): Grid =>
  Array.from({ length: SIZE }, (_, r) => Array.from({ length: SIZE }, (_, c) => g[SIZE - 1 - c][r]));

/** Rotations needed to make `dir` behave as "left", and to put the result back. */
const TURNS: Record<Dir, number> = { left: 0, up: 3, right: 2, down: 1 };

export function move(g: Grid, dir: Dir): { grid: Grid; gained: number; moved: boolean } {
  let work = g;
  for (let i = 0; i < TURNS[dir]; i++) work = rotateCW(work);

  let gained = 0;
  work = work.map((row) => {
    const res = collapse(row);
    gained += res.gained;
    return res.row;
  });

  for (let i = 0; i < (4 - TURNS[dir]) % 4; i++) work = rotateCW(work);

  const moved = work.some((row, r) => row.some((v, c) => v !== g[r][c]));
  return { grid: work, gained, moved };
}

/** Rule 4: over only when NO direction changes anything. A full board is not by itself over. */
export const canMove = (g: Grid): boolean =>
  (['left', 'right', 'up', 'down'] as Dir[]).some((d) => move(g, d).moved);

export const bestTile = (g: Grid): number => Math.max(...g.flat());

if (__DEV__) {
  const eq = (a: number[], b: number[]) => a.join() === b.join();

  // Rule 1: one merge per tile per move.
  if (!eq(collapse([1, 1, 1, 0]).row, [2, 1, 0, 0])) console.error('[2048] [1,1,1] must give [2,1], not a chain');
  if (!eq(collapse([1, 1, 1, 1]).row, [2, 2, 0, 0])) console.error('[2048] [1,1,1,1] must give [2,2]');
  // Rule 2: resolve from the direction of travel.
  if (!eq(collapse([0, 2, 2, 3]).row, [3, 3, 0, 0])) console.error('[2048] merge must resolve leftmost first');
  // Unequal neighbours never merge.
  if (!eq(collapse([1, 2, 3, 4]).row, [1, 2, 3, 4])) console.error('[2048] unequal tiles must not merge');
  // Scoring pays the bill CREATED: two $10 (index 4) make a $20.
  if (collapse([4, 4, 0, 0]).gained !== 20) console.error('[2048] merging two $10 must score 20');
  if (collapse([1, 1, 2, 2]).gained !== 2 + 5) console.error('[2048] two merges must score both bills');
  // The top of the ladder is terminal — two $100 cannot become a $200 that has no bill.
  if (collapse([GOAL, GOAL, 0, 0]).row[1] !== GOAL) console.error('[2048] $100 must not merge past the ladder');

  // A move that changes nothing must report moved:false, or rule 3 spawns a free tile every time
  // the player swipes into a wall.
  const wall: Grid = [[1, 2, 3, 4], [2, 3, 4, 5], [3, 4, 5, 6], [4, 5, 6, 7]];
  if (move(wall, 'left').moved) console.error('[2048] a packed unmergeable row must not report a move');
  if (canMove(wall)) console.error('[2048] that board is genuinely over');

  // Rule 4, the one that steals runs: FULL but with an adjacent pair is still playable.
  const fullButAlive: Grid = [[1, 1, 3, 4], [2, 3, 4, 5], [3, 4, 5, 6], [4, 5, 6, 7]];
  if (!cellsFree(fullButAlive).length && !canMove(fullButAlive)) console.error('[2048] a full board with a pair is NOT over');

  // Rotation must be an identity in four turns, or every non-left direction is silently mirrored.
  const probe: Grid = [[1, 2, 3, 4], [5, 6, 7, 0], [0, 1, 2, 3], [4, 5, 6, 7]];
  let spun = probe;
  for (let i = 0; i < 4; i++) spun = rotateCW(spun);
  if (spun.flat().join() !== probe.flat().join()) console.error('[2048] four rotations must return the original');

  // Every direction must actually move a lone tile the right way.
  const lone = emptyGrid(); lone[1][1] = 3;
  if (move(lone, 'left').grid[1][0] !== 3) console.error('[2048] left is wrong');
  if (move(lone, 'right').grid[1][SIZE - 1] !== 3) console.error('[2048] right is wrong');
  if (move(lone, 'up').grid[0][1] !== 3) console.error('[2048] up is wrong');
  if (move(lone, 'down').grid[SIZE - 1][1] !== 3) console.error('[2048] down is wrong');

  // Purity: move() must not mutate what it was handed.
  const before = probe.flat().join();
  move(probe, 'up');
  if (probe.flat().join() !== before) console.error('[2048] move() mutated its input grid');
}
