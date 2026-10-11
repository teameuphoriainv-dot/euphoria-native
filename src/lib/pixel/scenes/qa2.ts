/**
 * Quantitative Analysis lesson 2, Probability & Expected Value: the quant at the chalkboard.
 *
 * The board carries the distribution of two dice in chalk (eleven bars, the tallest, a sum of 7, in
 * gold: the expected value) and, top right, a running average settling onto a gold EV line (the law
 * of large numbers). The quant is chalking EV = Σpx under it while a pair of dice tumbles on a felt
 * table under a pendant lamp. Only small layers move: the dice hop and turn, the formula's last
 * stroke is chalked in, chalk dust rises, the EV bar glints, the average's live tip blinks.
 * Keepsake: a die, embossed on the medal.
 */
import type { PixelSprite } from '../types';
import { qaBackdrop } from './qa-backdrop';
import {
  QA_PALETTE, QA_REACH_HAND, qaBin, qaBlip, qaChalkboard, qaCompose, qaKeepsake, qaPath, qaQuantReaching,
  qaRect, qaRoom, qaSparkleSmall, qaText,
} from './qa-kit';
import type { QaStamp } from './qa-kit';
import type { LessonArtSet, SceneArt } from './types';

/** P(sum) of two dice, in chalk pixels: 1/36 to 6/36 and back, two pixels a step. */
const SUMS = [2, 4, 6, 8, 10, 12, 10, 8, 6, 4, 2];
const BASELINE = 21;

function bar(id: string, height: number, lit: string, shade: string): PixelSprite {
  return { id, name: id, tags: ['scene', 'qa2'], rows: Array.from({ length: height }, () => lit + shade) };
}

const bars: QaStamp[] = SUMS.map((h, i) => ({
  sprite: i === 5 ? bar('qa2-bar-ev', h, 'y', 'G') : bar(`qa2-bar-${String(i + 2)}`, h, 'w', 'x'),
  x: 6 + 3 * i,
  y: BASELINE - h,
}));

const table: PixelSprite = {
  id: 'qa2-table',
  name: 'qa2-table',
  tags: ['scene', 'qa2'],
  blurb: 'A round felt-topped card table on a pedestal, lit from above.',
  palette: QA_PALETTE,
  rows: [
    '.....OOOOOOOOOOOO.....',
    '..OOOnnnnnnnnnnnnOOO..',
    '.OnnnnnNNNNNNNNnnnnnO.',
    'OnnnnNNNNmmmNNNNNnnnnO',
    'OnnnnNNNNNNNNNNNNnnnnO',
    '.OnnnnnNNNNNNNNnnnnnO.',
    '..OOOnnnnnnnnnnnnOOO..',
    '.....gGGGGGGGGGGg.....',
    '.....OOOOOOOOOOOO.....',
    '..........DXD.........',
    '..........DXD.........',
    '..........DXD.........',
    '..........DXD.........',
    '..........DXD.........',
    '..........DXD.........',
    '.......DDDDXDDDD......',
    '......ZZZZZZZZZZZ.....',
  ],
};

const chips: PixelSprite = {
  id: 'qa2-chips',
  name: 'qa2-chips',
  tags: ['scene', 'qa2'],
  blurb: 'A short stack of chips, red on blue on red.',
  rows: [
    'RRRR',
    'rwrr',
    'BBBB',
    'bwbb',
    'RRRR',
    'rwrr',
  ],
};

const pendant: PixelSprite = {
  id: 'qa2-pendant',
  name: 'qa2-pendant',
  tags: ['scene', 'qa2'],
  blurb: 'A pendant lamp on a cord from the ceiling, lit underneath.',
  rows: [
    ...Array.from({ length: 12 }, () => '.....D.....'),
    '....DXD....',
    '...OGGGO...',
    '..OGyGGGO..',
    '.OGyGGGGGO.',
    'OyyyyyyyyyO',
  ],
};

/** The chalk tray's contents: two sticks and a felt eraser. */
const trayBits: PixelSprite = {
  id: 'qa2-tray-bits',
  name: 'qa2-tray-bits',
  tags: ['scene', 'qa2'],
  rows: ['......XXXXX', 'ww.wx.DDDDD'],
};

/** The running average of many rolls, settling onto the expected value. */
const settle: QaStamp[] = [
  { sprite: qaPath('qa2-avg-axes', 13, 13, [[0, 0], [0, 12], [12, 12]], 'x'), x: 41, y: 6 },
  { sprite: qaPath('qa2-avg-ev', 12, 1, [[0, 0], [11, 0]], 'y', [2, 1]), x: 42, y: 12 },
  {
    sprite: qaPath('qa2-avg-line', 12, 11, [[0, 10], [2, 1], [4, 9], [6, 4], [8, 7], [9, 6], [11, 6]], 'w'),
    x: 42,
    y: 6,
  },
];

const QUANT_AT = { x: 34, y: 27 } as const;
const HAND = { x: QUANT_AT.x + QA_REACH_HAND.x, y: QUANT_AT.y + QA_REACH_HAND.y };

const base = qaCompose('qa2-opener-base', 80, 60, [
  { sprite: qaRoom, x: 0, y: 0 },
  { sprite: qaChalkboard('qa2-board', 54, 34), x: 2, y: 2 },
  { sprite: trayBits, x: 7, y: 32 },
  { sprite: qaPath('qa2-axis', 35, 1, [[0, 0], [34, 0]], 'x'), x: 5, y: BASELINE },
  ...bars,
  ...settle,
  // EV = Σpx, the EV in the gold of its bar; the last x is chalked in by a layer.
  { sprite: qaText('qa2-ev', 'EV', 'y'), x: 25, y: 23 },
  { sprite: qaText('qa2-formula', '=Σp', 'w'), x: 33, y: 23 },
  { sprite: qaBin, x: 2, y: 47 },
  { sprite: pendant, x: 62, y: 0 },
  { sprite: table, x: 56, y: 38 },
  { sprite: chips, x: 58, y: 36 },
  { sprite: qaQuantReaching, x: QUANT_AT.x, y: QUANT_AT.y },
  // The chalk in the raised hand.
  { sprite: qaRect('qa2-chalk', 1, 1, 'w'), x: HAND.x - 1, y: HAND.y - 1 },
]);

/** The formula's last letter, chalked stroke by stroke. Its still is the finished x. */
const chalking: PixelSprite = {
  id: 'qa2-chalking',
  name: 'qa2-chalking',
  tags: ['scene', 'qa2'],
  rows: ['w.w', '.w.', 'w.w'],
  frames: [
    ['w.w', '.w.', 'w.w'],
    ['...', '...', '...'],
    ['w..', '...', '...'],
    ['w..', '.w.', '...'],
    ['w..', '.w.', '..w'],
    ['w.w', '.w.', '..w'],
    ['w.w', '.w.', 'w.w'],
  ],
  frameMs: 300,
};

const die = {
  two: ['.DDDDD.', 'DwwwwxD', 'DwKwwxD', 'DwwwwxD', 'DwwwKxD', 'DxxxxxD', '.DDDDD.'],
  three: ['.DDDDD.', 'DwwwwxD', 'DwKwwxD', 'DwwKwxD', 'DwwwKxD', 'DxxxxxD', '.DDDDD.'],
  four: ['.DDDDD.', 'DwwwwxD', 'DwKwKxD', 'DwwwwxD', 'DwKwKxD', 'DxxxxxD', '.DDDDD.'],
  five: ['.DDDDD.', 'DwwwwxD', 'DwKwKxD', 'DwwKwxD', 'DwKwKxD', 'DxxxxxD', '.DDDDD.'],
  six: ['.DDDDD.', 'DwwwwxD', 'DwKwKxD', 'DwKwKxD', 'DwKwKxD', 'DxxxxxD', '.DDDDD.'],
  turning: ['...D...', '..DwD..', '.DwKwD.', 'DwKwKxD', '.DwKxD.', '..DxD..', '...D...'],
};

/** Two dice, 15x8: `a` at the left, `b` at the right, each lifted by its `up` while it turns. */
function pair(a: string[], aUp: number, b: string[], bUp: number): string[] {
  return Array.from({ length: 8 }, (_, r) => {
    const left = a[r - 1 + aUp] ?? '.......';
    const right = b[r - 1 + bUp] ?? '.......';
    return left + '.' + right;
  });
}

const dice: PixelSprite = {
  id: 'qa2-dice',
  name: 'qa2-dice',
  tags: ['scene', 'qa2'],
  blurb: 'Two dice tumbling: they come to rest on 5 and 2, a sum of 7.',
  rows: pair(die.five, 0, die.two, 0),
  frames: [
    pair(die.five, 0, die.two, 0),
    pair(die.turning, 1, die.three, 0),
    pair(die.six, 0, die.turning, 1),
    pair(die.turning, 1, die.four, 0),
  ],
  frameMs: 300,
};

const dust: PixelSprite = { id: 'qa2-dust', name: 'qa2-dust', tags: ['scene', 'qa2'], rows: ['x'] };

export const qa2Opener: SceneArt = {
  id: 'qa2-opener',
  label: 'A quant chalks the expected value formula under a chalk chart of two dice outcomes, while a pair of dice tumbles on a green felt table under a hanging lamp.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: dice, x: 62, y: 35, motion: { kind: 'bob', amp: 2, periodMs: 1200 } },
    { sprite: chalking, x: 46, y: 25 },
    { sprite: dust, x: HAND.x, y: HAND.y - 2, motion: { kind: 'rise', amp: 3, periodMs: 1400 } },
    { sprite: qaSparkleSmall, x: 20, y: 7, motion: { kind: 'twinkle', periodMs: 1800, min: 0.4 } },
    { sprite: qaBlip, x: 53, y: 11, motion: { kind: 'twinkle', periodMs: 1100, phase: 0.3, min: 0.2 } },
  ],
};

/** Lesson 2's emblem: a die showing four, raised on the medal. */
const emblemDie: PixelSprite = {
  id: 'qa2-emblem-die',
  name: 'qa2-emblem-die',
  tags: ['scene', 'qa2'],
  rows: [
    '............',
    '..OOOOOOOO..',
    '.OyyyyyyyyO.',
    '.OyOOyyOOyOg',
    '.OyOOyyOOyOg',
    '.OyyyyyyyyOg',
    '.OyyyyyyyyOg',
    '.OyOOyyOOyOg',
    '.OyOOyyOOyOg',
    '.OyyyyyyyyOg',
    '..OOOOOOOOg.',
    '...gggggggg.',
  ],
};

export const qa2Finish: SceneArt = qaKeepsake(
  'qa2-finish',
  'A gold medallion hanging from a purple ribbon, embossed with a die showing four, with small sparkles around it.',
  emblemDie,
);

export const art: LessonArtSet = { opener: qa2Opener, backdrop: qaBackdrop, finish: qa2Finish };
