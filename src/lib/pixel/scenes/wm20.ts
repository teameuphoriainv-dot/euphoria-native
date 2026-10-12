/**
 * Wealth Management lesson 20 (concentrated stock positions): its opener, the pathway backdrop and
 * its keepsake, as one set loaded on demand.
 *
 * The opener is the family's strongroom at night: riveted steel walls, a lamp on a long cord, the
 * company's share certificate framed on the wall, the kit's safe (wm-kit.ts, kept back for this
 * lesson). In the middle stands a tower of gold coins all
 * stamped with one company's mark, far taller than the father, who braces it with one hand and
 * throws the other up as its top sways. Beside him, on a steel table and on the safe, short steady
 * stacks in four colours: the same wealth spread across many holdings. The lesson's point is that a
 * fortune in one stock can fall with one company, and that a selling plan, an exchange fund or a
 * collar moves it into the steadier stacks a coin at a time. What moves: the tower's top sways, a
 * coin flies from it to a short stack, the lamp glows, the safe's dial glints. The keepsake carries
 * a pie with one slice lifted out.
 */
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';
import { wmBackdrop } from './wm-backdrop';
import { wmBands, wmCompose, wmVault } from './wm-kit';
import { wmCoinFlight, wmParentTall, wmRepose } from './wm-kit-c';
import { wmKeepsake } from './wm1-finish';

/** The tower's left edge: its foot stands on the floor, its swaying top leans one pixel right. */
const TOWER_X = 31;
const TOWER_FOOT_Y = 33;
const TOWER_TOP_Y = 16;

const TABLE_X = 41;
const TABLE_Y = 46;
const SAFE_X = 67;

/** Steel plates 20 wide and 15 tall: lit along the top and left, dark at the seams, two rivets each. */
function steel(width: number, height: number): string[] {
  return Array.from({ length: height }, (_, y) => {
    const row = y % 15;
    return Array.from({ length: width }, (_, x) => {
      const col = x % 20;
      if (row === 14 || col === 19) return 'D';
      if (row === 0 || col === 0) return 'x';
      if (row === 2 && (col === 2 || col === 17)) return 'x';
      return 'X';
    }).join('');
  });
}

/** One coin of the company's stock, face and rim, its mark struck in the middle. */
const COIN = ['yGGOGGg', 'OgggggO'];

/** The tower's lower eleven coins, which stand still. 7x22. */
const towerFoot: PixelSprite = {
  id: 'wm20-opener-tower-foot',
  name: 'wm20-opener-tower-foot',
  tags: ['scene', 'wm20'],
  rows: Array.from({ length: 11 }, () => COIN).flat(),
};

/** A stack of `n` coins in one ink ramp [light, base, shade, rim], like the kit's wmCoinStack. */
function stack(id: string, n: number, [l, b, s, o]: readonly [string, string, string, string]): PixelSprite {
  return {
    id,
    name: id,
    tags: ['scene', 'wm20'],
    rows: [`.${l}${l}${b}${b}${s}.`, ...Array.from({ length: n }, () => [`${l}${b.repeat(5)}${s}`, `${o}${s.repeat(5)}${o}`]).flat()],
  };
}

/** A steel table, lit along its top edge. 26x12. */
const table: PixelSprite = {
  id: 'wm20-opener-table',
  name: 'wm20-opener-table',
  tags: ['scene', 'wm20'],
  rows: [
    `${'x'.repeat(25)}X`,
    `${'X'.repeat(25)}D`,
    'D'.repeat(26),
    ...Array.from({ length: 8 }, () => `.XD${'.'.repeat(20)}XD.`),
    `.KK${'.'.repeat(20)}KK.`,
  ],
};

/** The company's share certificate, framed on the wall: an ornate border, lines of print, a seal. 17x12. */
const certificate: PixelSprite = {
  id: 'wm20-opener-certificate',
  name: 'wm20-opener-certificate',
  tags: ['scene', 'wm20'],
  rows: [
    'DDDDDDDDDDDDDDDDD',
    'DyyyyyyyyyyyyyyGD',
    'DyGgGgGgGgGgGgyGD',
    'DyGyyyyyyyyyyGyGD',
    'DyGyyOOOOOOyyGyGD',
    'DyGyyyyyyyyyyGyGD',
    'DyGyOOOOyOOOyGyGD',
    'DyGyOOOyyyRRyGyGD',
    'DyGyyyyyyRRRrGyGD',
    'DyGgGgGgGgRrGgyGD',
    'DGGGGGGGGGGGGGGgD',
    'DDDDDDDDDDDDDDDDD',
  ],
};

/** A lamp on a long cord, a green enamel shade. 7x9. */
const lamp: PixelSprite = {
  id: 'wm20-opener-lamp',
  name: 'wm20-opener-lamp',
  tags: ['scene', 'wm20'],
  rows: ['...D...', '...D...', '...D...', '...D...', '...D...', '..nNn..', '.nNNNn.', 'nNNNNNn', 'nnnnnnn'],
};

/**
 * The father bracing the tower with his left hand and throwing his right up as it sways: the kit's
 * figure with one arm out level and the other raised beside his head. 15x23.
 */
const fatherBracing = wmRepose(wmParentTall, 'wm20-opener-father-bracing', {
  1: 'C..kkkkkkk.....',
  2: 'CC.kDDkkkk.....',
  3: 'BB.kCCCCCk.....',
  4: 'BB.CCKCKCU.....',
  5: 'BB.CCCCCCU.....',
  6: '.BB.CCCCU......',
  7: '.BB..CCU.......',
  8: '.BB.bwRwb......',
  9: '.BBBBwRwBbb....',
  10: '...BBBRBBbbbbbC',
  11: '...BBBRBBbbbbbU',
  12: '...BBBRBBb.....',
  13: '...BBBBBBb.....',
  14: '...BBBBBBb.....',
  15: '...BBBBBBb.....',
}, 1, 3);

const base = wmCompose('wm20-opener-base', [
  ...steel(80, 45),
  ...wmBands(80, [['K', 1], ['X', 1], ['D', 3], ['k', 1], ['D', 4], ['k', 1], ['D', 4]]),
], [
  { sprite: lamp, x: TOWER_X, y: 0 },
  { sprite: certificate, x: 52, y: 14 },
  { sprite: table, x: TABLE_X, y: TABLE_Y },
  { sprite: stack('wm20-opener-stack-silver', 4, ['w', 'x', 'X', 'D']), x: TABLE_X + 2, y: TABLE_Y - 9 },
  { sprite: stack('wm20-opener-stack-orchid', 3, ['Q', 'q', 'P', 'E']), x: TABLE_X + 10, y: TABLE_Y - 7 },
  { sprite: stack('wm20-opener-stack-green', 5, ['m', 'N', 'n', 'n']), x: TABLE_X + 18, y: TABLE_Y - 11 },
  { sprite: wmVault, x: SAFE_X, y: TABLE_Y },
  { sprite: stack('wm20-opener-stack-red', 3, ['s', 'R', 'r', 'r']), x: SAFE_X + 2, y: TABLE_Y - 7 },
  { sprite: { id: 'wm20-opener-tower-shadow', name: 'wm20-opener-tower-shadow', tags: ['scene', 'wm20'], rows: ['z'.repeat(9)] }, x: TOWER_X - 1, y: TOWER_FOOT_Y + 22 },
  { sprite: towerFoot, x: TOWER_X, y: TOWER_FOOT_Y },
  { sprite: fatherBracing, x: 16, y: 35 },
]);

/** The tower's top eight coins, leaning a pixel right of the foot, swaying. A layer. 7x17. */
const towerTop: PixelSprite = {
  id: 'wm20-opener-tower-top',
  name: 'wm20-opener-tower-top',
  tags: ['scene', 'wm20'],
  blurb: 'The top of a tower of one company\'s coins, swaying: a concentrated position.',
  rows: ['.yyGGg.', ...Array.from({ length: 8 }, () => COIN).flat()],
};

/** A coin leaving the tower's top for the orchid stack: wealth moved a coin at a time. */
const FLIGHT: readonly (readonly [number, number])[] = [
  [1, 6], [4, 2], [7, 0], [10, 0], [13, 1], [15, 4], [17, 8], [19, 13], [20, 18], [21, 23], [21, 28],
];
const coinFlight = wmCoinFlight('wm20-opener-coin-flight', 24, 30, FLIGHT, 8, 130);

/** Light from the lamp's bulb under the shade, glowing. */
const lampGlow: PixelSprite = {
  id: 'wm20-opener-lamp-glow',
  name: 'wm20-opener-lamp-glow',
  tags: ['scene', 'wm20'],
  rows: ['.yWy.'],
};

/** Two little shake marks either side of the tower's top. 13x3. */
const shake: PixelSprite = {
  id: 'wm20-opener-shake',
  name: 'wm20-opener-shake',
  tags: ['scene', 'wm20'],
  rows: ['w...........w', '.w.........w.', '.............'],
};

const glint: PixelSprite = {
  id: 'wm20-opener-glint',
  name: 'wm20-opener-glint',
  tags: ['scene', 'wm20'],
  rows: ['W'],
};

export const wm20Opener: SceneArt = {
  id: 'wm20-opener',
  label: 'A father braces a tall, swaying tower of one company\'s gold coins while a coin flies from its top to short, steady stacks of many colours on a steel table beside a safe.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: towerTop, x: TOWER_X + 1, y: TOWER_TOP_Y, motion: { kind: 'drift', amp: 1, periodMs: 1600 } },
    { sprite: shake, x: TOWER_X - 3, y: TOWER_TOP_Y + 1, motion: { kind: 'twinkle', periodMs: 800, min: 0 } },
    { sprite: coinFlight, x: TOWER_X + 1, y: TOWER_TOP_Y - 7 },
    { sprite: lampGlow, x: TOWER_X + 1, y: 9, motion: { kind: 'twinkle', periodMs: 3000, min: 0.4 } },
    { sprite: glint, x: SAFE_X + 5, y: TABLE_Y + 5, motion: { kind: 'twinkle', periodMs: 2100, min: 0, phase: 0.4 } },
  ],
};

/** A pie with one slice lifted out: the single holding sold down into many. */
const emblemPie: PixelSprite = {
  id: 'wm20-emblem-pie',
  name: 'wm20-emblem-pie',
  tags: ['scene', 'wm20'],
  rows: [
    '........yG...',
    '........yGg..',
    '...yGG..gGGg.',
    '..yGGG..gGGGg',
    '.yGGGG..gGggO',
    'yGGGGg.......',
    'yGGGGg.......',
    'yGGGGGGGGgg..',
    'GGGGGGGGggg..',
    'gGGGGGGGggO..',
    '.gGGGGgggO...',
    '..gggggOO....',
    '...OOOOO.....',
  ],
};

export const wm20Finish: SceneArt = wmKeepsake(
  'wm20-finish',
  emblemPie,
  'A green crest with a gold rim bearing a pie with one slice lifted out, framed by laurel over a purple banner, with sparkles around it.',
);

export const art: LessonArtSet = { opener: wm20Opener, backdrop: wmBackdrop, finish: wm20Finish };
