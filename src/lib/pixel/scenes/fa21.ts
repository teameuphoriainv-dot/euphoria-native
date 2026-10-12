/**
 * Financial Analytics lesson 21, NLP: machines that read the filings no one has time to.
 *
 * OPENER. The reading machine, at the CLEAN station: eighty per cent of financial data is text, and
 * here it arrives as a 10-K, a waist-high stack of paper in a blue binder band. Its pages lift off
 * the top, tumble through the air and drop into the NLP engine's intake. On the engine's screen
 * the filing's lines run past and the machine tags them as it reads: risk words in red, company
 * names in gold, the odd good word in green. Its gear turns, its lights chase, and on the signal
 * board beside it the output reads out: the sentiment marker sits left of centre, the risk-word
 * bar runs long, and a big red down arrow flashes BEARISH. The client, seen from behind, takes it
 * in. The map lights CLEAN.
 *
 * KEEPSAKE. The trophy with a page being read: lines of text land, three words light up (a red
 * risk word, a green good one, a gold name), and a red arrow points down.
 */
import { faBackdrop } from './fa-backdrop';
import { faCompose, faConduit, faLater, faPipelineMap } from './fa-kit';
import { faDrawnBy, faKeepsake, faMonitor, faRoom, faStageLight, FA_MONITOR_GLASS } from './fa-kit-a';
import { faAnalystBack, faBlank, faRowsOf, FA_CAST_CLIENT } from './fa-kit-b';
import { faFigure, faWorn } from './fa-kit-c';
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';

/* ── the filing ────────────────────────────────────────────────────────────────────────────── */

/**
 * The 10-K, 16 x 27: the top sheet's text seen from above, then the stack's front, page edges in
 * alternating rows, a blue binder band with a gold label, on a wooden pallet.
 */
const filing: PixelSprite = {
  id: 'fa21-filing',
  name: 'filing',
  tags: ['scene', 'fa21', 'prop'],
  rows: [
    '.DDDDDDDDDDDDDD.',
    'DwwwwwwwwwwwwwxD',
    'DwXXXwXXXXXwwwxD',
    'DwwwwwwwwwwwwwxD',
    'DwXXXXwXXXwXXwxD',
    'DwwwwwwwwwwwwwxD',
    'DDDDDDDDDDDDDDDD',
    ...Array.from({ length: 17 }, (_, y) => {
      if (y >= 2 && y <= 4) return y === 3 ? 'DBByyyyyyyBBBBbD' : 'DBBBBBBBBBBBBBbD';
      return y % 2 ? 'DxxxxxxxxxxxxxXD' : 'DwwwwwwwwwwwwwxD';
    }),
    'DOOOOOOOOOOOOOOD',
    'DDDDDDDDDDDDDDDD',
    '.DOD...DOD..DOD.',
  ],
};

/** A page in the air, tumbling: flat to us, then edge on, by turns. */
const PAGE_FLAT = ['www', 'wXx', 'wxx'] as const;
const PAGE_EDGE = ['...', 'wwx', '...'] as const;

/**
 * A page's flight from the top of the filing to the engine's intake, 27 x 13: up, over and down,
 * tumbling as it goes, then a pause before the next. Its corner positions are scene pixels from
 * FLIGHT.
 */
const FLIGHT = { x: 9, y: 8 } as const;
const flyingPage: PixelSprite = (() => {
  const path = [[0, 10], [2, 6], [4, 3], [7, 1], [10, 0], [13, 0], [16, 1], [19, 3], [21, 5], [23, 7], [24, 9]] as const;
  const frames = path.map(([px, py], k) => {
    const g = faBlank(27, 13);
    (k % 2 ? PAGE_EDGE : PAGE_FLAT).forEach((row, j) => [...row].forEach((ch, i) => { if (ch !== '.') g[py + j][px + i] = ch; }));
    return faRowsOf(g);
  });
  const blank = faRowsOf(faBlank(27, 13));
  return { id: 'fa21-page', name: 'flying page', tags: ['scene', 'fa21'], rows: frames[0], frames: [...frames, blank, blank, blank], frameMs: 150 };
})();

/* ── the engine ────────────────────────────────────────────────────────────────────────────── */

/**
 * The NLP engine, 28 x 31: an intake funnel on top, a wide screen (22 x 10 at SCREEN), a porthole
 * on a gear (5 x 5 at GEAR) and a strip of lights (10 x 1 at LIGHTS), a teal trim for CLEAN.
 */
const engine: PixelSprite = {
  id: 'fa21-engine',
  name: 'nlp engine',
  tags: ['scene', 'fa21', 'station'],
  rows: [
    '......DDDDDDDDDDDDDDDD......',
    '......DxwxxxxxxxxxxXkD......',
    '......DKKKKKKKKKKKKKKD......',
    '.......DxXXXXXXXXXXkD.......',
    '........DxXXXXXXXXkD........',
    '.DDDDDDDDDDDDDDDDDDDDDDDDDD.',
    'DxwxxxxxxxxxxxxxxxxxxxxxxXkD',
    'DxDDDDDDDDDDDDDDDDDDDDDDDDkD',
    ...Array.from({ length: 10 }, () => 'DxDKKKKKKKKKKKKKKKKKKKKKKDkD'),
    'DxDDDDDDDDDDDDDDDDDDDDDDDDkD',
    'DxXXXXXXXXXXXXXXXXXXXXXXXXkD',
    'DxXDDDDDDDXXXXXXXXXXXXXXXXkD',
    'DxXDKKKKKDXXXXXXXXXXXXXXXXkD',
    'DxXDKKKKKDXXDDDDDDDDDDDDXXkD',
    'DxXDKKKKKDXXDKKKKKKKKKKDXXkD',
    'DxXDKKKKKDXXDDDDDDDDDDDDXXkD',
    'DxXDKKKKKDXXXXXXXXXXXXXXXXkD',
    'DxXDDDDDDDXXXXXXXXXXXXXXXXkD',
    'DxXXXXXXXXXXXXXXXXXXXXXXXXkD',
    'DTTTTTTTTTTTTTTTTTTTTTTTTTtD',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    '.DkD....................DkD.',
  ],
};
const SCREEN = { x: 3, y: 8 } as const;
const GEAR = { x: 4, y: 21 } as const;
const LIGHTS = { x: 13, y: 23 } as const;

/** The filing's lines running past on the engine's screen, 22 x 10, in dim grey. */
const TEXT = [
  '......................',
  '.XXXX.XXX.XXXXXX.XXX..',
  '......................',
  '.XXX.XXXXX.XXXX.XXXXX.',
  '......................',
  '.XXXXX.XX.XXXXXXX.XX..',
  '......................',
  '.XX.XXXX.XXX.XXXXXX...',
  '......................',
  '.XXXXXX.XXX.XXXX......',
] as const;
const text: PixelSprite = { id: 'fa21-text', name: 'text', tags: ['scene', 'fa21'], rows: [...TEXT] };

/** The tags the engine lays over words as it reads, one a beat: [row, from, to, ink]. */
const TAGS = [[1, 6, 8, 'R'], [3, 1, 3, 'G'], [5, 10, 16, 'R'], [7, 13, 18, 'G'], [9, 8, 10, 'N']] as const;
const tags: PixelSprite = (() => {
  const g = faBlank(22, 10);
  const order = new Map<string, number>();
  TAGS.forEach(([y, from, to, ink], k) => {
    for (let x = from; x <= to; x++) {
      g[y][x] = ink;
      order.set(`${String(x)},${String(y)}`, k);
    }
  });
  return faDrawnBy('fa21-tags', faRowsOf(g), (x, y) => order.get(`${String(x)},${String(y)}`) ?? 0, 450, 5);
})();

/** The gear behind the porthole, turning an eighth of a turn a beat. */
const gear: PixelSprite = {
  id: 'fa21-gear',
  name: 'gear',
  tags: ['scene', 'fa21'],
  rows: ['.G.G.', 'GGGGG', '.GKG.', 'GGGGG', '.G.G.'],
  frames: [
    ['.G.G.', 'GGGGG', '.GKG.', 'GGGGG', '.G.G.'],
    ['G.G.G', '.GGG.', 'GGKGG', '.GGG.', 'G.G.G'],
  ],
  frameMs: 300,
};

/** The engine's lights chasing along the strip. */
const lights: PixelSprite = (() => {
  const frames = Array.from({ length: 10 }, (_, f) => [Array.from({ length: 10 }, (_, x) => (x === f ? 'T' : (x + 1) % 10 === f ? 't' : '.')).join('')]);
  return { id: 'fa21-lights', name: 'lights', tags: ['scene', 'fa21'], rows: frames[0], frames, frameMs: 160 };
})();

/* ── the signal board ──────────────────────────────────────────────────────────────────────── */

/**
 * The board's glass, 17 x 18: the sentiment scale with its marker left of centre (a negative
 * reading), the risk-word bar running long, and the big down arrow, resting dark red, that a layer
 * flashes bright: BEARISH.
 */
const ARROW = [
  '....RRRRR....',
  '....RRRRR....',
  '....RRRRR....',
  '....RRRRR....',
  '....RRRRR....',
  'RRRRRRRRRRRRR',
  '.RRRRRRRRRRR.',
  '..RRRRRRRRR..',
  '...RRRRRRR...',
  '....RRRRR....',
  '.....RRR.....',
] as const;
const ARROW_AT = { x: 2, y: 7 } as const;
const signals: PixelSprite = (() => {
  const g = faBlank(17, 18);
  for (let x = 1; x <= 15; x++) g[1][x] = 'x';
  for (const y of [0, 2]) g[y][8] = 'x';
  for (let y = 0; y <= 2; y++) g[y][5] = 'R';
  for (let x = 1; x <= 15; x++) for (const y of [4, 5]) g[y][x] = x <= 11 ? 'R' : 'X';
  ARROW.forEach((row, j) => [...row].forEach((ch, i) => { if (ch !== '.') g[ARROW_AT.y + j][ARROW_AT.x + i] = 'r'; }));
  return { id: 'fa21-signals', name: 'signals', tags: ['scene', 'fa21'], rows: faRowsOf(g) };
})();
const arrowLit: PixelSprite = { id: 'fa21-arrow', name: 'bearish arrow', tags: ['scene', 'fa21'], rows: [...ARROW] };

/** The client, seen from behind: faAnalystBack in grey hair and the blue suit. */
const client = faFigure('fa21-client', FA_CAST_CLIENT, faWorn(faAnalystBack.rows, FA_CAST_CLIENT), 'The client, seen from behind, hands clasped at the back.');

/* ── the room ──────────────────────────────────────────────────────────────────────────────── */

/* Where things stand. */
const MAP = { x: 46, y: 1 } as const;
const FILING = { x: 3, y: 22 } as const;
const ENGINE = { x: 23, y: 18 } as const;
const BOARD = { x: 55, y: 9, w: 23, h: 24 } as const;
const BOARD_GLASS = { x: BOARD.x + FA_MONITOR_GLASS.x, y: BOARD.y + FA_MONITOR_GLASS.y } as const;
const CLIENT = { x: 61, y: 34 } as const;

const room = faRoom('fa21-opener-room', [
  [FILING.x + 1, 50, 16, 1, 'Z'],
  [ENGINE.x + 2, 50, 26, 1, 'Z'],
  [ENGINE.x + 4, 51, 22, 1, 'Z'],
  [CLIENT.x + 2, 58, 9, 1, 'Z'],
]);

const base = faCompose('fa21-opener-base', room, [
  [faPipelineMap, MAP.x, MAP.y],
  [faMonitor('fa21-board', BOARD.w, BOARD.h), BOARD.x, BOARD.y],
  [signals, BOARD_GLASS.x, BOARD_GLASS.y],
  [faConduit('fa21-cable', 4, 4), ENGINE.x + 28, 22],
  [filing, FILING.x, FILING.y],
  [engine, ENGINE.x, ENGINE.y],
  [text, ENGINE.x + SCREEN.x, ENGINE.y + SCREEN.y],
  [client, CLIENT.x, CLIENT.y],
]);

export const fa21Opener: SceneArt = {
  id: 'fa21-opener',
  label: 'A reading machine in the data plant: pages fly off a tall stack of a company filing into an engine that tags risk words in red and names in gold on its screen, its gear turning, while a signal board beside it flashes a big red arrow pointing down and the client, seen from behind, reads it.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: flyingPage, x: FLIGHT.x, y: FLIGHT.y },
    { sprite: faLater(flyingPage, 'fa21-page-later', 7, 150), x: FLIGHT.x, y: FLIGHT.y },
    { sprite: tags, x: ENGINE.x + SCREEN.x, y: ENGINE.y + SCREEN.y },
    { sprite: gear, x: ENGINE.x + GEAR.x, y: ENGINE.y + GEAR.y },
    { sprite: lights, x: ENGINE.x + LIGHTS.x, y: ENGINE.y + LIGHTS.y },
    { sprite: arrowLit, x: BOARD_GLASS.x + ARROW_AT.x, y: BOARD_GLASS.y + ARROW_AT.y, motion: { kind: 'twinkle', periodMs: 1200, min: 0.15 } },
    faStageLight('clean', MAP.x, MAP.y),
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────── */

/**
 * LESSON 21: NLP. A page of a filing: the paper lands, its lines of text run down it, then three
 * words light up in turn (a red risk word, a green good one, a gold company name), and a red arrow
 * points down beside it, flashing while it holds; then the screen clears.
 */
export const faEmblemReading: PixelSprite = (() => {
  const full = [
    'wwwwwwwwx.......',
    'wXXXwXXwx.......',
    'wwwwwwwwx...RR..',
    'wXXwRRRwx...RR..',
    'wwwwwwwwx...RR..',
    'wNNNwXXwx...RR..',
    'wwwwwwwwx.RRRRRR',
    'wXXwGGGwx..RRRR.',
    'wwwwwwwwx...RR..',
    'wXXXXwXwx.......',
    'xxxxxxxxx.......',
  ];
  const step = (x: number, y: number, ch: string) => {
    if (ch === 'w' || ch === 'x') return 0;
    if (ch === 'X') return 1 + (y - 1) / 2;
    if (x <= 8) return ch === 'R' ? 6 : ch === 'N' ? 7 : 8;
    return y <= 5 ? 9 : 10;
  };
  const drawn = faDrawnBy('fa-emblem-reading', full, step, 260, 5);
  const frames = drawn.frames ?? [drawn.rows];
  // The signal flashes while it holds.
  for (const f of [12, 14]) frames[f] = frames[f].map((row) => `${row.slice(0, 9)}${row.slice(9).replace(/R/g, 's')}`);
  return { ...drawn, name: 'emblem reading', blurb: 'A page whose words light up as a machine reads it, and a red arrow down.', frames };
})();

export const fa21Finish: SceneArt = faKeepsake(
  'fa21-finish',
  'A gold terminal trophy on a purple stand, its screen drawing a page of text whose words light up red, green and gold as it is read, then a red arrow pointing down, with small sparkles around it.',
  faEmblemReading,
);

export const art: LessonArtSet = { opener: fa21Opener, backdrop: faBackdrop, finish: fa21Finish };
