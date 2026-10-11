/**
 * Corporate Finance lesson 14, IPOs & Going Public: the day the company's shares first trade.
 *
 * Opener: the balcony over the exchange floor. The CFO presses the brass button on the podium and
 * the opening bell swings and rings; the chief beside him holds out a hand to it. The company's
 * orchid banner hangs off the balcony, the ticker tape runs green along the top, the board on the
 * wall shows the first-day pop (the closing price far over the offer price), and confetti comes
 * down. Only small layers move: the bell and its ring, the tape, two falls of confetti, the
 * screens on the floor below.
 *
 * Keepsake: the opening bell, ringing.
 */
import type { PixelSprite } from '../types';
import { cfBackdrop } from './cf-backdrop';
import { cfKeepsake } from './cf1-finish';
import { cfCompose, cfHall } from './cf-kit';
import { cfCfoReach, cfExec } from './cf-kit-a';
import { cfFalling } from './cf-kit-b';
import type { LessonArtSet, SceneArt } from './types';

/** The tape's frame across the top of the hall; the moving tape runs inside it. */
const tapeFrame: PixelSprite = {
  id: 'cf14-tape-frame',
  name: 'cf14-tape-frame',
  tags: ['scene', 'cf14'],
  rows: ['O'.repeat(80), ...Array.from({ length: 5 }, () => 'K'.repeat(80)), 'O'.repeat(80)],
};

const TAPE = { w: 80, h: 5, tile: 32, step: 4 } as const;
const UP: readonly string[] = ['..N..', '.NNN.', 'NNNNN'];
const DOWN: readonly string[] = ['rrrrr', '.rrr.', '..r..'];
const PRICE: readonly string[] = ['x.xx', 'xx.x'];

/** One tile of tape: up, a price, up, a price, down, a price. Two rises for every fall today. */
const tapeTile: string[][] = (() => {
  const grid = Array.from({ length: TAPE.h }, () => Array.from({ length: TAPE.tile }, () => '.'));
  const put = (glyph: readonly string[], x: number, y: number) => {
    glyph.forEach((row, j) => {
      [...row].forEach((ch, i) => {
        const line = grid[y + j];
        if (line && ch !== '.') line[x + i] = ch;
      });
    });
  };
  put(UP, 0, 1);
  put(PRICE, 6, 2);
  put(UP, 11, 1);
  put(PRICE, 17, 2);
  put(DOWN, 22, 1);
  put(PRICE, 28, 2);
  return grid;
})();

/** The tape scrolling left a tile's step a frame, eight frames to a tile. */
const tapeAt = (f: number) => tapeTile.map((row) => Array.from({ length: TAPE.w }, (_, x) => row[(x + f * TAPE.step) % TAPE.tile] ?? '.').join(''));
const tape: PixelSprite = {
  id: 'cf14-opener-tape',
  name: 'cf14-opener-tape',
  tags: ['scene', 'cf14'],
  blurb: 'A ticker tape of green and red arrows scrolling left.',
  rows: tapeAt(0),
  frames: Array.from({ length: TAPE.tile / TAPE.step }, (_, f) => tapeAt(f)),
  frameMs: 220,
};

/** The yoke the bell hangs from. */
const yoke: PixelSprite = { id: 'cf14-yoke', name: 'cf14-yoke', tags: ['scene', 'cf14'], rows: ['OGGGO', '..O..'] };

const BELL: readonly string[] = [
  '......O......',
  '.....OyO.....',
  '....OyGGO....',
  '...OyGGGgO...',
  '...OyGGGgO...',
  '...OyGGGgO...',
  '..OyGGGGGgO..',
  '..OyGGGGGgO..',
  '.OyGGGGGGGgO.',
  'OyyGGGGGGGggO',
  'OOOOOOOOOOOOO',
  '.....OgO.....',
];

/** The bell sheared `k` pixels at the lip: it swings from its loop, which stays put. */
const bellAt = (k: number) =>
  BELL.map((row, j) => {
    const shift = Math.round((k * j) / (BELL.length - 1));
    return '.'.repeat(2 + shift) + row + '.'.repeat(2 - shift);
  });
const bell: PixelSprite = {
  id: 'cf14-opener-bell',
  name: 'cf14-opener-bell',
  tags: ['scene', 'cf14'],
  blurb: 'A brass bell swinging.',
  rows: bellAt(0),
  frames: [bellAt(0), bellAt(2), bellAt(0), bellAt(-2)],
  frameMs: 260,
};

/** The first-day pop: the offer price, and the close far above it under a green arrow. */
const priceBoard: PixelSprite = {
  id: 'cf14-price-board',
  name: 'cf14-price-board',
  tags: ['scene', 'cf14'],
  rows: [
    '.OOOOOOOOOOO.',
    'OgggggggggggO',
    'OgKKKKKNNKKaO',
    'OgKKKKNNNNKaO',
    'OgKKKKKNNKKaO',
    'OgKKKKKNNKKaO',
    'OgKKKKKNNKKaO',
    'OgKxxKKNNKKaO',
    'OgKxxKKNNKKaO',
    'OgKxxKKNNKKaO',
    'OgKKKKKKKKKaO',
    'OaaaaaaaaaaaO',
    '.OOOOOOOOOOO.',
  ],
};

/** The podium with the bell button, the company's diamond on its front. */
const podium: PixelSprite = {
  id: 'cf14-podium',
  name: 'cf14-podium',
  tags: ['scene', 'cf14'],
  rows: [
    '...rRr....',
    '.OOOOOOOO.',
    'OyGGGGGGgO',
    'OAAAAAAAaO',
    'OAAAPAAAaO',
    'OAAPqPAAaO',
    'OAAAPAAAaO',
    'OAAAAAAAaO',
  ],
};

/** The balcony: a brass rail and a walnut front, panelled, with a gold trim along its foot. */
const balcony: PixelSprite = {
  id: 'cf14-balcony',
  name: 'cf14-balcony',
  tags: ['scene', 'cf14'],
  rows: [
    'G'.repeat(80),
    'O'.repeat(80),
    'a'.repeat(80),
    ...Array.from({ length: 7 }, (_, r) =>
      Array.from({ length: 80 }, (_, x) => {
        const c = x % 10;
        if (c === 0 || c === 9) return 'A';
        return r === 0 || r === 6 || c === 1 || c === 8 ? 'a' : 'A';
      }).join(''),
    ),
    'a'.repeat(80),
    'O'.repeat(80),
  ],
};

/** The company's banner on the balcony: orchid cloth on a gold rod, a gold diamond, a fringe. */
const banner: PixelSprite = {
  id: 'cf14-banner',
  name: 'cf14-banner',
  tags: ['scene', 'cf14'],
  rows: [
    'O'.repeat(30),
    `E${'q'.repeat(28)}E`,
    `E${'P'.repeat(13)}y${'P'.repeat(14)}E`,
    `E${'P'.repeat(12)}yGg${'P'.repeat(13)}E`,
    `E${'P'.repeat(11)}yGGgg${'P'.repeat(12)}E`,
    `E${'P'.repeat(12)}Ggg${'P'.repeat(13)}E`,
    `E${'P'.repeat(13)}g${'P'.repeat(14)}E`,
    `E${'p'.repeat(28)}E`,
    'G.'.repeat(15),
  ],
};

const MONITORS: readonly number[] = [3, 15, 27, 47, 59, 71];
const monitor: PixelSprite = { id: 'cf14-monitor', name: 'cf14-monitor', tags: ['scene', 'cf14'], rows: ['DDDD', 'DttD', '.DD.'] };

/** The floor's screens lit, a layer over the dim ones. */
const screens: PixelSprite = {
  id: 'cf14-opener-screens',
  name: 'cf14-opener-screens',
  tags: ['scene', 'cf14'],
  rows: [Array.from({ length: 74 }, (_, x) => (MONITORS.some((m) => x === m + 1 || x === m + 2) ? 'T' : '.')).join('')],
};

const base = cfCompose('cf14-opener-base', cfHall, [
  [tapeFrame, 0, 4],
  [yoke, 38, 11],
  [priceBoard, 66, 14],
  ...MONITORS.map((x) => [monitor, x, 53] as const),
  [cfCfoReach, 22, 17],
  [cfExec, 47, 17],
  [podium, 36, 30],
  [balcony, 0, 38],
  [banner, 25, 40],
], 'The still balcony: the tape frame, the bell yoke, the price board, the two chiefs, the podium, the banner, the floor.');

const ringLeft: PixelSprite = { id: 'cf14-opener-ring-left', name: 'cf14-opener-ring-left', tags: ['scene', 'cf14'], rows: ['.w', 'w.', 'w.', '.w'] };
const ringRight: PixelSprite = { id: 'cf14-opener-ring-right', name: 'cf14-opener-ring-right', tags: ['scene', 'cf14'], rows: ['w.', '.w', '.w', 'w.'] };

const CONFETTI: readonly string[] = ['F', 'y', 'N', 'B', 'q', 'G', 'R', 'w'];
const confettiLeft = cfFalling('cf14-opener-confetti-left', 30, 27, CONFETTI, { count: 12, seed: 1, fall: 3, frameMs: 160 });
const confettiRight = cfFalling('cf14-opener-confetti-right', 30, 27, CONFETTI, { count: 12, seed: 4, fall: 3, frameMs: 170 });

export const cf14Opener: SceneArt = {
  id: 'cf14-opener',
  label: 'On the stock exchange balcony the finance chief presses the button that rings the opening bell for the company\'s first day of trading, as confetti falls and the ticker runs green.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: tape, x: 0, y: 5 },
    { sprite: bell, x: 32, y: 13 },
    { sprite: ringLeft, x: 33, y: 17, motion: { kind: 'twinkle', periodMs: 1040, min: 0 } },
    { sprite: ringRight, x: 46, y: 17, motion: { kind: 'twinkle', periodMs: 1040, phase: 0.5, min: 0 } },
    { sprite: confettiLeft, x: 0, y: 11 },
    { sprite: confettiRight, x: 50, y: 11 },
    { sprite: screens, x: 0, y: 54, motion: { kind: 'twinkle', periodMs: 1900, min: 0.45 } },
  ],
};

/** Lesson 14's emblem: the opening bell on its yoke, ringing, a little confetti under it. */
const emblemBell: PixelSprite = {
  id: 'cf14-emblem-bell',
  name: 'cf14-emblem-bell',
  tags: [],
  blurb: 'A brass bell ringing, with a few pieces of confetti.',
  rows: [
    '....OOOOOOOO....',
    '.......OO.......',
    '......OyGO......',
    '.....OyGGgO.....',
    '....OyGGGGgO....',
    '.w..OyGGGGgO..w.',
    'w...OyGGGGgO...w',
    'w..OyGGGGGGgO..w',
    '.w.OyGGGGGGgO.w.',
    '..OyGGGGGGGGgO..',
    '.OyyGGGGGGGGggO.',
    '.OOOOOOOOOOOOOO.',
    '......OggO......',
    '.......OO.......',
    '.F............N.',
    '...y........B...',
  ],
};

export const cf14Finish = cfKeepsake(
  'cf14-finish',
  'A crystal award on a gold stand with the opening bell ringing inside, and small sparkles around it.',
  emblemBell,
);

export const art: LessonArtSet = { opener: cf14Opener, backdrop: cfBackdrop, finish: cf14Finish };
