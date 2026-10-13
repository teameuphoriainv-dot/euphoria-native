/**
 * Business Strategy lesson 24 opener: money put back to work grows on itself.
 *
 * Built on bsCouncilHall. Down the counting table stands a row of coin stacks, each far taller than the
 * one before it, the last reaching halfway to the beam: what a coin becomes when every return goes back
 * in. The strategist, at the short end, drops one more coin onto the first stack; a backer in a top hat
 * watches from the tall end. Two lanterns hang from the beam and torches burn on the pillars. The
 * stacks are the brightest broad surface. Moving: the coin falls, the strategist blinks, the top of the
 * tallest stack glints, the lanterns and torches flicker, embers rise and the backer shifts.
 */
import type { PixelSprite } from '../types';
import { bsBackdrop } from './bs-backdrop';
import { bsEmber, bsMoved, bsTorch } from './bs-kit';
import { BS_COAT_GOLD, bsBustHat, bsCouncilHall, bsMirrored, bsRecoloured, bsStrategistStand } from './bs-kit-a';
import { bsLantern, bsTable } from './bs-kit-c';
import { bsKeepsake } from './bs1-finish';
import type { LessonArtSet, SceneArt } from './types';

/** Each stack's height in pixel rows: every one is roughly the two before it put together. */
const HEIGHTS = [2, 3, 5, 8, 13, 21];
const STACK_W = 4;
const STACK_GAP = 3;

/**
 * The stacks side by side on one sprite, bottoms on the last row. Coins alternate a lit face and a dark
 * rim, and each stack's top coin catches the light. Computed so every stack keeps the same width.
 */
function stacksRows(): string[] {
  const width = HEIGHTS.length * STACK_W + (HEIGHTS.length - 1) * STACK_GAP;
  const tallest = Math.max(...HEIGHTS);
  return Array.from({ length: tallest }, (_, y) => {
    let row = '';
    HEIGHTS.forEach((h, i) => {
      const k = tallest - 1 - y;
      let coin = '....';
      if (k === h - 1) coin = 'yyGG';
      else if (k < h) coin = k % 2 === 0 ? 'OggO' : 'yGGg';
      row += (i ? '.'.repeat(STACK_GAP) : '') + coin;
    });
    return row.padEnd(width, '.');
  });
}

const stacks: PixelSprite = {
  id: 'bs24-stacks',
  name: 'stacks',
  tags: [],
  blurb: 'Six stacks of gold coins, each far taller than the last, bottoms on the bottom row: stand them on a table.',
  rows: stacksRows(),
};

const placingRows = bsMoved(bsStrategistStand.rows, {
  6: '......SSSUHHD.........',
  7: '.......SSUUD..........',
  8: '.......wUUw...........',
  9: '......EqwwPGGE........',
  10: '.....EqPPPPPGpE.......',
  13: '...yG..EqGPPPPppE.....',
});

const placing: PixelSprite = {
  id: 'bs24-placing',
  name: 'placing',
  tags: [],
  blurb: 'The strategist standing, facing left, a coin held out at (x + 3..4, y + 13) ready to drop. Mirror it to drop to the right. Frames: rest, blink.',
  palette: { S: '#C08552', U: '#9A6638', H: '#43291A' },
  rows: placingRows,
  frames: [
    placingRows,
    placingRows,
    placingRows,
    bsMoved(placingRows, {
      4: '......SSSUHHHD........',
    }),
  ],
  frameMs: 650,
};

const dropFrame = (at: number) =>
  Array.from({ length: 11 }, (_, i) => {
    if (i === at) return 'yG';
    if (i === at + 1) return 'Og';
    return '..';
  });

const drop: PixelSprite = {
  id: 'bs24-drop',
  name: 'drop',
  tags: [],
  blurb: 'A coin falling from the hand onto the first stack.',
  rows: dropFrame(1),
  frames: [dropFrame(1), dropFrame(4), dropFrame(7), dropFrame(9), Array.from({ length: 11 }, () => '..')],
  frameMs: 240,
};

const glint: PixelSprite = {
  id: 'bs24-glint',
  name: 'glint',
  tags: [],
  blurb: 'A white point on the top coin of the tallest stack, for a twinkle layer.',
  rows: [
    'W',
  ],
};

const placingRight = bsMirrored(placing, 'bs24-placing-right');
const backer = bsRecoloured(bsBustHat, 'bs24-backer', BS_COAT_GOLD);
const table = bsTable('bs24-table', 56);

export const bs24Opener: SceneArt = {
  id: 'bs24-opener',
  label: 'In the council hall a strategist drops one more coin onto a row of coin stacks that grow along the table, each far taller than the one before, as a backer looks on.',
  width: 80,
  height: 60,
  base: bsCouncilHall,
  layers: [
    { sprite: bsTorch, x: 1, y: 14 },
    { sprite: bsEmber, x: 2, y: 12, motion: { kind: 'rise', amp: 4, periodMs: 1600 } },
    { sprite: bsTorch, x: 74, y: 14 },
    { sprite: bsEmber, x: 76, y: 12, motion: { kind: 'rise', amp: 5, periodMs: 2000, phase: 0.5 } },
    { sprite: bsLantern, x: 24, y: 5 },
    { sprite: bsLantern, x: 52, y: 5 },
    { sprite: placingRight, x: 8, y: 12 },
    { sprite: backer, x: 66, y: 28, motion: { kind: 'bob', amp: 1, periodMs: 2400 } },
    { sprite: table, x: 12, y: 38 },
    { sprite: stacks, x: 25, y: 18 },
    { sprite: drop, x: 25, y: 26 },
    { sprite: glint, x: 61, y: 18, motion: { kind: 'twinkle', periodMs: 1700, min: 0.1 } },
  ],
};

const emblem: PixelSprite = {
  id: 'bs24-emblem-roic',
  name: 'emblem-roic',
  tags: [],
  blurb: 'Lesson 24 emblem, 16x16: a tall green return bar beside a short red cost-of-capital bar on a gold line, ROIC beating WACC.',
  rows: [
    '................',
    '................',
    '..mNNNn.........',
    '..mNNNn.........',
    '..mNNNn.........',
    '..mNNNn.........',
    '..mNNNn.........',
    '..mNNNn.........',
    '..mNNNn..sRRRr..',
    '..mNNNn..sRRRr..',
    '..mNNNn..sRRRr..',
    '..mNNNn..sRRRr..',
    '..mNNNn..sRRRr..',
    '..mNNNn..sRRRr..',
    '.yGGGGGGGGGGGGg.',
    '................',
  ],
};

export const bs24Finish: SceneArt = bsKeepsake(
  'bs24-finish',
  'A purple house banner on a gold rod, its roundel showing a tall green return bar standing over a short red cost-of-capital bar.',
  emblem,
);

export const art: LessonArtSet = { opener: bs24Opener, backdrop: bsBackdrop, finish: bs24Finish };
