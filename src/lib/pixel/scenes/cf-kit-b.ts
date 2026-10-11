/**
 * Corporate Finance kit, batch B (lessons 10 to 17): what more than one cf opener needs, kept apart
 * from cf-kit.ts and cf-kit-a.ts so the approved kit stays exactly as it is.
 *
 * The boardroom: a long walnut board table seen front on, a high-backed leather chair, and a
 * director seated behind the table (lesson 10's board; the plan gives the table to lesson 22 too).
 * And a sheet of small things falling and wrapping round: confetti over the IPO bell in lesson 14,
 * coins pouring down the priority waterfall in lesson 15.
 *
 * Same rules as the kit: light from the upper left, outlines in the deep steps, never K.
 */
import type { PixelSprite } from '../types';
import { CF_PALETTE } from './cf-kit';

/**
 * A director seated behind the board table, cut at the chest: stamp the table on the row just under
 * the director's last (the director's y + 15). Black hair with a grey streak, a blue suit, a red
 * tie; cfRecolor makes the rest of the board (hair h and its streak X, suit B and b, tie r).
 */
export const cfDirector: PixelSprite = {
  id: 'cf-director',
  name: 'cf-director',
  tags: ['scene', 'cf', 'character'],
  blurb: 'A director in a blue suit, seated, seen from the chest up.',
  palette: CF_PALETTE,
  rows: [
    '...hhhhh...',
    '..hhXXhhh..',
    '.hhXhhhhhh.',
    '.hhSSSSShh.',
    '.hSSSSSSSh.',
    '.hSKSSSKSh.',
    '.hSSSSSSMh.',
    '..SSSSSSM..',
    '...SMMMM...',
    '....MMM....',
    '..DbwwwbD..',
    '.DBBwrwbbD.',
    'DBBBwrwbbbD',
    'DBBBBrbbbbD',
    'DBBBBBbbbbD',
  ],
};

/**
 * A high-backed leather chair, 13 wide, gold piping down both sides. A cfDirector stamped one
 * column in and four rows down sits in it with the piping showing either side of the shoulders.
 * Grey leather, not ink: black hair against a K or k chair would lose its outline.
 */
export function cfChairBack(id: string, height: number): PixelSprite {
  return {
    id,
    name: id,
    tags: ['scene', 'cf', 'boardroom'],
    blurb: 'The back of a grey leather boardroom chair.',
    rows: [
      '..OOOOOOOOO..',
      '.ODXDDDDDDDO.',
      ...Array.from({ length: height - 2 }, () => 'ODXDDDDDDDDDO'),
    ],
  };
}

/**
 * The board table, front on, `width` wide and 13 tall: a polished top, a brass edge, an apron,
 * and three pairs of legs standing in their own shadow. Long enough to run off the frame.
 */
export function cfBoardTable(id: string, width: number): PixelSprite {
  const mid = Math.floor(width / 2);
  const legs = (x: number) => (x === 1 || x === mid - 1 || x === width - 3 ? 'A' : x === 2 || x === mid || x === width - 2 ? 'a' : 'Z');
  const legRow = Array.from({ length: width }, (_, x) => legs(x)).join('');
  const feet = Array.from({ length: width }, (_, x) => (legs(x) === 'Z' ? 'Z' : 'O')).join('');
  return {
    id,
    name: id,
    tags: ['scene', 'cf', 'boardroom'],
    blurb: 'A long walnut board table with a brass edge.',
    palette: CF_PALETTE,
    rows: [
      'A'.repeat(width),
      'A'.repeat(width),
      'g'.repeat(width),
      'O'.repeat(width),
      'a'.repeat(width),
      `a${'A'.repeat(width - 2)}a`,
      `a${'A'.repeat(width - 2)}a`,
      'a'.repeat(width),
      legRow,
      legRow,
      legRow,
      legRow,
      feet,
    ],
  };
}

/**
 * A sheet of small things falling `fall` pixels a frame and wrapping round, so `height / fall`
 * frames loop. `pieces` are one column wide, top to bottom, handed out to the drops in turn.
 * Computed from a fixed scatter (`seed` shifts it), because hand-drawn frames of scattered bits
 * would each have to agree on where every piece went.
 */
export function cfFalling(
  id: string,
  width: number,
  height: number,
  pieces: readonly string[],
  opts: { count: number; seed: number; fall: number; frameMs: number },
): PixelSprite {
  const drops = Array.from({ length: opts.count }, (_, i) => ({
    x: (i * 7 + opts.seed * 3) % width,
    y: (i * 11 + opts.seed * 5) % height,
    piece: pieces[i % pieces.length] ?? '',
  }));
  const frame = (f: number) => {
    const grid = Array.from({ length: height }, () => Array.from({ length: width }, () => '.'));
    for (const { x, y, piece } of drops) {
      [...piece].forEach((ch, j) => {
        const row = grid[(y + f * opts.fall + j) % height];
        if (row) row[x] = ch;
      });
    }
    return grid.map((row) => row.join(''));
  };
  const count = Math.round(height / opts.fall);
  return {
    id,
    name: id,
    tags: ['scene', 'cf'],
    blurb: 'Small pieces falling.',
    rows: frame(0),
    frames: Array.from({ length: count }, (_, f) => frame(f)),
    frameMs: opts.frameMs,
  };
}
