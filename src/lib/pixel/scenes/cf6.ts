/**
 * Corporate Finance lesson 6, Working Capital Management: cash goes round, and the days it takes count.
 *
 * Opener: a loop conveyor laid on the hall floor, seen from above. Along the far side boxes of
 * stock ride right from the supplier's stack (cash spent on stock) to the till in the corner (the
 * sale); along the near side the cash comes back left to buy the next boxes. Gold arrows turn at
 * both ends. Tan card, not walnut, so the stock never melts into the wainscot behind it. On
 * the wall the works window, a calendar whose marked day keeps moving (the cycle is counted in
 * days), and a plaque with the cycle sign. Only small layers move: both loads, the calendar, the
 * arrows, the sign, the smoke.
 *
 * Keepsake: two green arrows chasing each other round a gold coin.
 */
import type { PixelSprite } from '../types';
import { cfBackdrop } from './cf-backdrop';
import { cfKeepsake } from './cf1-finish';
import { cfCashBundle, cfCompose, cfHall, cfPlaque, cfSmokePuff, cfWindowWorks } from './cf-kit';
import { cfRecolor } from './cf-kit-a';
import type { LessonArtSet, SceneArt } from './types';

/** The straight runs between the two rounded ends of the loop. */
const SPAN = 68;

/**
 * The loop belt from above: a thin far run, a deeper near run, the ends turning between them. Its
 * middle is a dark table top. Rows are spelled out by run length so the two runs cannot drift apart.
 */
const loopBelt: PixelSprite = {
  id: 'cf6-loop-belt',
  name: 'cf6-loop-belt',
  tags: ['scene', 'cf6'],
  blurb: 'A loop conveyor seen from above.',
  rows: [
    `....${'D'.repeat(SPAN)}....`,
    `..DD${'X'.repeat(SPAN)}DD..`,
    `.DXX${'D'.repeat(SPAN)}XXD.`,
    ...Array.from({ length: 7 }, () => `DXXD${'k'.repeat(SPAN)}DXXD`),
    `DXXX${'D'.repeat(SPAN)}XXXD`,
    `DXXX${'X'.repeat(SPAN)}XXXD`,
    `DxxX${'x'.repeat(SPAN)}XxxD`,
    `.DDD${'D'.repeat(SPAN)}DDD.`,
  ],
};

/** A small box of stock, the size that rides the belt: tan card, so it never melts into walnut. */
const crate: readonly string[] = [
  'OOOOO',
  'OGyGO',
  'OgGgO',
  'OOOOO',
];

/** A big box for the supplier's stack, taped across the top. */
const bigCrate: PixelSprite = {
  id: 'cf6-big-crate',
  name: 'cf6-big-crate',
  tags: ['scene', 'cf6'],
  rows: [
    'OOOOOOOO',
    'OGGGyGGO',
    'OgggGggO',
    'OgggGggO',
    'OgggGggO',
    'OOOOOOOO',
  ],
};

/** The till where stock becomes a sale: a green display, keys, a drawer of coins. */
const till: PixelSprite = {
  id: 'cf6-till',
  name: 'cf6-till',
  tags: ['scene', 'cf6'],
  blurb: 'A grey cash register with a coin drawer.',
  rows: [
    '.....DDDDD..',
    '.....DnNND..',
    '.....DDDDD..',
    '..DDDDDDDDD.',
    '.DxwxwxwxwXD',
    '.DXxXxXxXxXD',
    '.DxwxwxwxwXD',
    'DDDDDDDDDDDD',
    'DXXXXXXXXXXD',
    'DXXOyyyyOXXD',
    'DXXOGGGGOXXD',
    'DDDDDDDDDDDD',
  ],
};

/** The cycle: two arrows chasing each other round. Lit as a layer over its dim copy. */
const signCycle: PixelSprite = {
  id: 'cf6-sign-cycle',
  name: 'cf6-sign-cycle',
  tags: ['scene', 'cf6', 'sign'],
  blurb: 'Two green arrows going round.',
  rows: [
    '.mNNN..',
    'N....N.',
    'N...NNN',
    '.......',
    'NNN...N',
    '.N....N',
    '..NNNm.',
  ],
};
const signCycleDim = cfRecolor(signCycle, 'cf6-sign-cycle-dim', { N: 'n', m: 'n' });

const CALENDAR: readonly string[] = [
  '..D.....D..',
  'DDXDDDDDXDD',
  'DrrrrrrrrrD',
  'DrrrrrrrrrD',
  'DwwwwwwwwwD',
  'DwXwXwXwXwD',
  'DwwwwwwwwwD',
  'DwXwXwXwXwD',
  'DwwwwwwwwwD',
  'DwXwXwXwXwD',
  'DwwwwwwwwwD',
  'DxxxxxxxxxD',
  'DDDDDDDDDDD',
];
/** The twelve days on the page, in reading order. */
const DAYS = [5, 7, 9].flatMap((y) => [2, 4, 6, 8].map((x) => [x, y] as const));

/** The calendar with `day` circled in red; the frames walk the mark through every day. */
function calendarOn(day: number): string[] {
  const [dx, dy] = DAYS[day % DAYS.length] ?? [2, 5];
  return CALENDAR.map((row, y) => (y === dy ? `${row.slice(0, dx)}r${row.slice(dx + 1)}` : row));
}

const calendar: PixelSprite = {
  id: 'cf6-opener-calendar',
  name: 'cf6-opener-calendar',
  tags: ['scene', 'cf6'],
  blurb: 'A wall calendar whose marked day moves on.',
  rows: calendarOn(0),
  frames: DAYS.map((_, i) => calendarOn(i)),
  frameMs: 520,
};

/**
 * A row of `item` every `gap` pixels, shifted `offset` pixels along, clipped to `width`. Loads are
 * built from this so each frame is the last moved on by one step and the loop restarts unseen.
 */
function loadRow(item: readonly string[], width: number, gap: number, offset: number): string[] {
  const grid = item.map(() => Array.from({ length: width }, () => '.'));
  for (let start = (offset % gap) - gap; start < width; start += gap) {
    item.forEach((row, j) => {
      [...row].forEach((ch, i) => {
        const line = grid[j];
        if (line && ch !== '.' && start + i >= 0 && start + i < width) line[start + i] = ch;
      });
    });
  }
  return grid.map((row) => row.join(''));
}

const FAR = { width: 64, gap: 10, step: 2 } as const;
const NEAR = { width: 66, gap: 12, step: 2 } as const;

/** Stock riding right along the far side, two pixels a frame. */
const farLoad: PixelSprite = {
  id: 'cf6-opener-far-load',
  name: 'cf6-opener-far-load',
  tags: ['scene', 'cf6'],
  blurb: 'Boxes of stock riding the far side of the loop to the till.',
  rows: loadRow(crate, FAR.width, FAR.gap, 0),
  frames: Array.from({ length: FAR.gap / FAR.step }, (_, f) => loadRow(crate, FAR.width, FAR.gap, f * FAR.step)),
  frameMs: 320,
};

/** Cash riding left along the near side, back to the supplier. */
const nearLoad: PixelSprite = {
  id: 'cf6-opener-near-load',
  name: 'cf6-opener-near-load',
  tags: ['scene', 'cf6'],
  blurb: 'Cash bundles riding the near side of the loop back to the start.',
  rows: loadRow(cfCashBundle.rows, NEAR.width, NEAR.gap, 0),
  frames: Array.from({ length: NEAR.gap / NEAR.step }, (_, f) => loadRow(cfCashBundle.rows, NEAR.width, NEAR.gap, NEAR.gap - f * NEAR.step)),
  frameMs: 320,
};

const arrowDown: PixelSprite = { id: 'cf6-opener-arrow-down', name: 'cf6-opener-arrow-down', tags: ['scene', 'cf6'], rows: ['yyyyy', '.yyy.', '..y..'] };
const arrowUp: PixelSprite = { id: 'cf6-opener-arrow-up', name: 'cf6-opener-arrow-up', tags: ['scene', 'cf6'], rows: ['..y..', '.yyy.', 'yyyyy'] };

const base = cfCompose('cf6-opener-base', cfHall, [
  [cfWindowWorks, 6, 6],
  [cfPlaque, 62, 6],
  [signCycleDim, 64, 8],
  [bigCrate, 0, 36],
  [bigCrate, 8, 36],
  [bigCrate, 4, 30],
  [till, 66, 30],
  [loopBelt, 2, 44],
], 'The still hall: the works window, the cycle plaque, the supplier boxes, the till, the loop belt.');

export const cf6Opener: SceneArt = {
  id: 'cf6-opener',
  label: 'Boxes of stock ride a loop conveyor from a supplier stack to a till, and cash rides back round to buy more, while a wall calendar counts the days.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: calendar, x: 34, y: 9 },
    { sprite: cfSmokePuff, x: 16, y: 10, motion: { kind: 'rise', amp: 2, periodMs: 3600 } },
    { sprite: signCycle, x: 64, y: 8, motion: { kind: 'twinkle', periodMs: 3000, min: 0.2 } },
    { sprite: farLoad, x: 8, y: 42 },
    { sprite: nearLoad, x: 7, y: 53 },
    { sprite: arrowDown, x: 73, y: 49, motion: { kind: 'twinkle', periodMs: 1800, min: 0.25 } },
    { sprite: arrowUp, x: 1, y: 49, motion: { kind: 'twinkle', periodMs: 1800, phase: 0.5, min: 0.25 } },
  ],
};

/** Lesson 6's emblem: the cash conversion cycle, two arrows round a coin. */
const emblemCycle: PixelSprite = {
  id: 'cf6-emblem-cycle',
  name: 'cf6-emblem-cycle',
  tags: [],
  blurb: 'Two green arrows circling a gold coin.',
  rows: [
    '....mNNNNN......',
    '..NNn.....NN....',
    '.Nn.........N...',
    '.N.........NNN..',
    'N.........NNNNN.',
    'N.....OOO.......',
    'N....OyyGO......',
    '....OyyGGgO.....',
    '....OyGGggO.....',
    '.....OGggO.....N',
    '......OOO......N',
    '.NNNNN.........N',
    '..NNN.........N.',
    '...N.........nN.',
    '....NN.....nNN..',
    '......NNNNNm....',
  ],
};

export const cf6Finish = cfKeepsake(
  'cf6-finish',
  'A crystal award on a gold stand with two green arrows circling a gold coin inside, and small sparkles around it.',
  emblemCycle,
);

export const art: LessonArtSet = { opener: cf6Opener, backdrop: cfBackdrop, finish: cf6Finish };
