/**
 * Corporate Finance kit, batch A (lessons 2 to 9): what more than one of those openers needs, kept
 * apart from cf-kit.ts so lesson 1's kit stays exactly as approved.
 *
 * A second pose for the CFO (one arm out: presenting, shaking on a deal, holding an umbrella over
 * the cash), the chief of another company for deals and boards, a recolour helper that makes a
 * variant of any kit sprite (a door, a suit, a head of hair) without redrawing it, and the gold
 * balance scale (lesson 4 weighs debt against equity; the plan gives it to lesson 12 as well).
 *
 * Same rules as the kit: light from the upper left, outlines in the deep steps, never K.
 */
import type { PixelSprite } from '../types';
import { CF_PALETTE } from './cf-kit';

/**
 * A copy of `sprite` with some keys swapped for others, in the still and in every frame. Only which
 * key a pixel uses changes, never what a key paints, so the copy still stamps beside the original
 * in one cfCompose without the palette clash cfCompose throws on.
 */
export function cfRecolor(sprite: PixelSprite, id: string, swap: Readonly<Record<string, string>>, blurb?: string): PixelSprite {
  const recolor = (rows: readonly string[]) => rows.map((row) => [...row].map((ch) => swap[ch] ?? ch).join(''));
  return {
    ...sprite,
    id,
    name: id,
    blurb: blurb ?? sprite.blurb,
    rows: recolor(sprite.rows),
    ...(sprite.frames ? { frames: sprite.frames.map(recolor) } : {}),
  };
}

/**
 * The CFO with the right arm out at chest height, hand open at the end (columns 16 and 17, rows 13
 * and 14): presenting a model, shaking a hand, holding an umbrella's shaft. The left arm hangs.
 * Stands on the same feet as cfCfo, so the two poses swap at the same y.
 */
export const cfCfoReach: PixelSprite = {
  id: 'cf-cfo-reach',
  name: 'cf-cfo-reach',
  tags: ['scene', 'cf', 'character'],
  blurb: 'The CFO in an orchid suit with one arm held out.',
  palette: CF_PALETTE,
  rows: [
    '.....hhhh.........',
    '...hhDDhhh........',
    '..hhDhhhhhh.......',
    '..hDhhhhhhh.......',
    '..hhSSSSShh.......',
    '..hSSSSSSSh.......',
    '..hSKSSSKSh.......',
    '..hSSSSSSMh.......',
    '...SSSSSSM........',
    '....SMMMM.........',
    '.....MMM..........',
    '...EpwwwpE........',
    '..EPPwGwppEEEEE...',
    '.EPPPwGwpppPPPPESS',
    'EPPPPwGwppppppEESM',
    'EPPPPPGpppEEEEE...',
    'EPEPPPGpppE.......',
    'EPEPPPPpppE.......',
    'EPEPPPPpppE.......',
    'SSEPPPgpppE.......',
    'MSEEEEEEEEE.......',
    '...EpE.EpE........',
    '...EpE.EpE........',
    '...EpE.EpE........',
    '...EpE.EpE........',
    '..DDDD.DDDD.......',
    '..DXXD.DXXD.......',
  ],
};

/**
 * The chief of another company: silver hair, a blue suit, a red tie, the left arm held out (hand
 * at columns 0 and 1, rows 13 and 14) to meet cfCfoReach's. Stamp it 16 columns right of the CFO
 * and the two hands land on the same pixels. Also a board member or an investor in later lessons.
 */
export const cfExec: PixelSprite = {
  id: 'cf-exec',
  name: 'cf-exec',
  tags: ['scene', 'cf', 'character'],
  blurb: 'A silver-haired chief in a blue suit with one arm held out.',
  palette: CF_PALETTE,
  rows: [
    '..........xxxx....',
    '........xxwwxxx...',
    '.......xxwxxxxxx..',
    '.......xwxxxxxxx..',
    '.......xxSSSSSxx..',
    '.......xSSSSSSSx..',
    '.......xSKSSSKSx..',
    '.......xSSSSSSMx..',
    '........SSSSSSM...',
    '.........SMMMM....',
    '..........MMM.....',
    '........DbwwwbD...',
    '...DDDDDBBwrwbbD..',
    'SSDBBBBBBBwrwbbbD.',
    'SMDDbbbBBBwrwbbbbD',
    '...DDDDDBBBrbbbbbD',
    '.......DBBBrbbbDbD',
    '.......DBBBbbbbDbD',
    '.......DBBBbbbbDbD',
    '.......DBBBbbbbDSS',
    '.......DDDDDDDDDSM',
    '........DbD.DbD...',
    '........DbD.DbD...',
    '........DbD.DbD...',
    '........DbD.DbD...',
    '.......DDDD.DDDD..',
    '.......DXXD.DXXD..',
  ],
};

/** The balance scale's post and walnut foot, which stay still in the base while the beam tips. */
export const cfScaleStand: PixelSprite = {
  id: 'cf-scale-stand',
  name: 'cf-scale-stand',
  tags: ['scene', 'cf'],
  blurb: 'A gold post on a walnut pedestal.',
  palette: CF_PALETTE,
  rows: [
    ...Array.from({ length: 22 }, () => '........yGg........'),
    '......OyyGgO.......',
    '....OOOOOOOOOOO....',
    '...OAAAAAAAAAAAO...',
    '...OAaaaaaaaaaAO...',
    '...OAAAAAAAAAAAO...',
    '..OOOOOOOOOOOOOOO..',
    '.OgggggggggggggggO.',
    'OOOOOOOOOOOOOOOOOOO',
  ],
};

const SCALE_PLATE: readonly string[] = [
  'OyGGGGGGGgO',
  '.OgggggggO.',
];

/** Beam geometry. Stamp the beam 7 left of and 4 above cfScaleStand and the pivot sits on its post. */
const SCALE = { w: 33, h: 19, pivot: 16, hang: [5, 27] } as const;

/**
 * The beam, chains, pans and loads with the left end `tilt` pixels down (negative: up). Computed,
 * not drawn: the beam is a straight line between two heights, and hand-typed frames of a slanting
 * beam are where a pan ends up hanging off nothing.
 */
function scaleFrame(left: readonly string[], right: readonly string[], tilt: number): string[] {
  const grid = Array.from({ length: SCALE.h }, () => Array.from({ length: SCALE.w }, () => '.'));
  const put = (x: number, y: number, ch: string) => {
    const row = grid[y];
    if (row && x >= 0 && x < SCALE.w) row[x] = ch;
  };
  const stamp = (rows: readonly string[], x: number, y: number) => {
    rows.forEach((row, j) => {
      [...row].forEach((ch, i) => {
        if (ch !== '.') put(x + i, y + j, ch);
      });
    });
  };
  const beamY = (x: number) => 3 + Math.round(((SCALE.pivot - x) / (SCALE.pivot - 1)) * tilt);
  for (let x = 1; x < SCALE.w - 1; x += 1) {
    put(x, beamY(x), 'G');
    put(x, beamY(x) + 1, 'g');
  }
  put(0, beamY(1), 'O');
  put(SCALE.w - 1, beamY(SCALE.w - 2), 'O');
  stamp(['.y.', 'OGO'], SCALE.pivot - 1, 1);
  SCALE.hang.forEach((cx, i) => {
    const top = beamY(cx) + 2;
    const plateY = top + 10;
    for (let j = 0; j < 10; j += 1) {
      const dx = Math.round(((j + 1) * 5) / 10);
      put(cx - dx, top + j, 'x');
      put(cx + dx, top + j, 'x');
    }
    put(cx, top - 1, 'O');
    const load = i === 0 ? left : right;
    stamp(load, cx - 4, plateY - load.length);
    stamp(SCALE_PLATE, cx - 5, plateY);
  });
  return grid.map((row) => row.join(''));
}

/**
 * The balance beam with `left` and `right` on its pans (each at most 9 wide and 8 tall), level, then
 * tipped left, level, tipped right. Its still is level. 33x19, inside the framed-layer limit.
 */
export function cfScaleBeam(id: string, left: readonly string[], right: readonly string[], frameMs = 900): PixelSprite {
  return {
    id,
    name: id,
    tags: ['scene', 'cf'],
    blurb: 'A gold balance beam tipping one way and the other.',
    rows: scaleFrame(left, right, 0),
    frames: [scaleFrame(left, right, 0), scaleFrame(left, right, 3), scaleFrame(left, right, 0), scaleFrame(left, right, -3)],
    frameMs,
  };
}
