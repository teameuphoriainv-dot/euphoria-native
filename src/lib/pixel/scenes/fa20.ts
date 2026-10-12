/**
 * Financial Analytics lesson 20, real-time streaming: data handled the moment it happens.
 *
 * OPENER. The stream switchyard, at the COLLECT end. Three producers on the left wall (market
 * ticks in blue, orders in gold, news in teal) pour fast down three pipes into the broker, a tall
 * drum whose window is the event log, scrolling up without a pause as each event is appended in
 * its feed's colour. From the far side every event fans out at once, all three colours in each
 * pipe, to the three consumers: a trading screen whose lightning bolt flashes (thirty microseconds),
 * the risk dial swinging, and a dashboard with its live dot. The colleague holds a stopwatch up to
 * it all, its hand racing round. The map lights COLLECT.
 *
 * KEEPSAKE. The trophy with a stopwatch: speed lines streak in from the left, the dial draws
 * itself, and the red hand sweeps round.
 */
import { faBackdrop } from './fa-backdrop';
import { faCompose, faConduit, faGaugeNeedle, faPacketRun, faPipelineMap } from './fa-kit';
import { faDial, faKeepsake, faMonitor, faRoom, faStageLight, FA_DIAL_NEEDLE, FA_MONITOR_GLASS } from './fa-kit-a';
import { faBlank, faRowsOf, FA_CAST_COLLEAGUE } from './fa-kit-b';
import { faFigure, faHead, faPacketsRight } from './fa-kit-c';
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';

/* ── the producers ─────────────────────────────────────────────────────────────────────────── */

/** A feed on the wall, 8 x 7: a small dark screen showing what it produces (a 4x3 icon). */
function port(id: string, icon: readonly string[]): PixelSprite {
  const glass = icon.map((row) => row.replace(/\./g, 'K'));
  return {
    id,
    name: id,
    tags: ['scene', 'fa20', 'prop'],
    rows: ['.DDDDDD.', 'DxwxxXkD', `Dx${glass[0]}kD`, `Dx${glass[1]}kD`, `Dx${glass[2]}kD`, 'DxXXXXkD', '.DDDDDD.'],
  };
}

/** The three feeds, top to bottom: market ticks (rising bars), orders (a coin), news (lines of text). */
const FEEDS = [
  { id: 'market', y: 7, ink: 'B', icon: ['..B.', 'B.BB', 'BBBB'] },
  { id: 'orders', y: 16, ink: 'y', icon: ['.yy.', 'yGGy', '.yy.'] },
  { id: 'news', y: 25, ink: 'T', icon: ['TTTT', '....', 'TTT.'] },
] as const;

/* ── the broker ────────────────────────────────────────────────────────────────────────────── */

/**
 * The broker, 16 x 41: a tall drum with a lit cap and two rims, and a window down its face (6 x 28
 * at LOG) where the event log scrolls. Its feet are the bottom row.
 */
const broker: PixelSprite = {
  id: 'fa20-broker',
  name: 'broker',
  tags: ['scene', 'fa20', 'station'],
  rows: [
    '...DDDDDDDDDD...',
    '.DDxwwwwwwxxXDD.',
    'DxwxxxxxxxxxxXkD',
    'DXxxxxxxxxxxxXXD',
    'DDDDDDDDDDDDDDDD',
    'DxXXXXXXXXXXXXkD',
    'DxXXDDDDDDDDXXkD',
    ...Array.from({ length: 28 }, () => 'DxXXDKKKKKKDXXkD'),
    'DxXXDDDDDDDDXXkD',
    'DxXXXXXXXXXXXXkD',
    'DDDDDDDDDDDDDDDD',
    'DxXXXXXXXXXXXXkD',
    '.DDDDDDDDDDDDDD.',
    '.DkD........DkD.',
  ],
};
const LOG = { x: 5, y: 7, w: 6, h: 28 } as const;

/**
 * The event log: slots in the feeds' colours, appended at the bottom and scrolling up a row a
 * beat, never stopping. Nine slots of three rows make a 27-frame loop with no seam.
 */
const LOG_INKS = ['B', 'y', 'T', 'B', 'T', 'y', 'B', 'y', 'T'] as const;
const log: PixelSprite = (() => {
  const frames = Array.from({ length: 27 }, (_, f) => Array.from({ length: LOG.h }, (_, r) => {
    const i = r + f;
    return i % 3 < 2 ? `.${LOG_INKS[Math.floor(i / 3) % LOG_INKS.length].repeat(LOG.w - 2)}.` : '.'.repeat(LOG.w);
  }));
  return { id: 'fa20-log', name: 'event log', tags: ['scene', 'fa20'], rows: frames[0], frames, frameMs: 120 };
})();

/* ── the consumers ─────────────────────────────────────────────────────────────────────────── */

/** The trading screen's glass, 14 x 6: a lightning bolt (resting dim, lit by a layer) and a buy arrow. */
const BOLT = ['...GG', '..GG.', '.GGGG', '..GG.', '.GG..', 'GG...'] as const;
const trade: PixelSprite = {
  id: 'fa20-trade',
  name: 'trading screen',
  tags: ['scene', 'fa20'],
  rows: BOLT.map((bolt, y) => `.${bolt}..${['..N..', '.NNN.', 'NNNNN', '..N..', '..N..', '..N..'][y]}.`),
};
const boltLit: PixelSprite = { id: 'fa20-bolt', name: 'bolt', tags: ['scene', 'fa20'], rows: BOLT.map((row) => row.replace(/G/g, 'y')) };

/** The dashboard's glass, 14 x 6: four bars and a live dot in the corner (resting dim, lit by a layer). */
const dash: PixelSprite = (() => {
  const g = faBlank(14, 6);
  [2, 4, 3, 5].forEach((h, k) => {
    for (let j = 0; j < h; j++) {
      g[5 - j][1 + k * 3] = 'N';
      g[5 - j][2 + k * 3] = 'n';
    }
  });
  g[0][13] = 'r';
  return { id: 'fa20-dash', name: 'dashboard', tags: ['scene', 'fa20'], rows: faRowsOf(g) };
})();
const liveDot: PixelSprite = { id: 'fa20-live', name: 'live dot', tags: ['scene', 'fa20'], rows: ['R'] };

/* ── the colleague ─────────────────────────────────────────────────────────────────────────── */

/**
 * The colleague holding a stopwatch up and out to her left (our right), thumb on the crown, the
 * other hand at her side; faColleague's blazer with the clipboard gone. 19 x 26; the watch face
 * (5 x 4 at FACE) is left plain for the hand layer.
 */
const WATCH = ['..DyD..', '.DDDDD.', 'DwwwwxD', 'DwwwwxD', 'DwwwwxD', 'DxwwxxD', '.DDDDD.', '...AC..', '..pE...', '.pE....', 'pE.....', 'E......'] as const;
const top = faHead(FA_CAST_COLLEAGUE).map((row, y) => `${row}${WATCH[y]}`);
top[11] = `.....AC....p${WATCH[11]}`;
const colleague = faFigure('fa20-colleague', FA_CAST_COLLEAGUE, [
  ...top,
  ...[
    '..PPpwwppEE.',
    '.qPPpwwpppE.',
    '.qPPppwpppE.',
    '.qPPpppppE..',
    '.qPPpppppE..',
    '.APPpppppE..',
    '.APPpppppE..',
    '..PPppppE...',
    '..PPppppE...',
    '..PPppppE...',
    '..DDDDDDkk..',
    '..DDD..Dkk..',
    '..DDD..Dkk..',
    '.EEEE..EEEE.',
  ].map((row) => `${row}.......`),
], 'The colleague, front on, holding a stopwatch up beside her.');
const FACE = { x: 13, y: 2 } as const;

/** The stopwatch's red hand racing round its centre, a quarter turn a beat. */
const stopwatchHand: PixelSprite = {
  id: 'fa20-stopwatch-hand',
  name: 'stopwatch hand',
  tags: ['scene', 'fa20'],
  rows: ['..R..', '..R..', '..K..', '.....'],
  frames: [
    ['..R..', '..R..', '..K..', '.....'],
    ['.....', '.....', '..KRR', '.....'],
    ['.....', '.....', '..K..', '..R..'],
    ['.....', '.....', 'RRK..', '.....'],
  ],
  frameMs: 250,
};

/* ── the room ──────────────────────────────────────────────────────────────────────────────── */

/* Where things stand. */
const MAP = { x: 46, y: 1 } as const;
const PORT_X = 1;
const IN = { x: 9, length: 21 } as const;
const BROKER = { x: 30, y: 8 } as const;
const OUT = [{ y: 12, length: 11 }, { y: 23, length: 15 }, { y: 37, length: 11 }] as const;
const OUT_X = 46;
const TRADE = { x: 57, y: 8, w: 20, h: 12 } as const;
const DIAL = { x: 61, y: 20 } as const;
const DASH = { x: 57, y: 34, w: 20, h: 12 } as const;
const COLLEAGUE = { x: 2, y: 32 } as const;

const room = faRoom('fa20-opener-room', [
  [BROKER.x + 1, 50, 15, 1, 'Z'],
  [BROKER.x + 2, 51, 13, 1, 'Z'],
  [COLLEAGUE.x + 2, 58, 10, 1, 'Z'],
]);

const base = faCompose('fa20-opener-base', room, [
  [faPipelineMap, MAP.x, MAP.y],
  ...FEEDS.flatMap(({ id, y, icon }) => [
    [port(`fa20-port-${id}`, icon), PORT_X, y] as const,
    [faConduit(`fa20-in-${id}`, IN.length, 7), IN.x, y + 1] as const,
  ]),
  ...OUT.map(({ y, length }, k) => [faConduit(`fa20-out-${String(k)}`, length, 5), OUT_X, y] as const),
  [broker, BROKER.x, BROKER.y],
  [faMonitor('fa20-trade-screen', TRADE.w, TRADE.h), TRADE.x, TRADE.y],
  [trade, TRADE.x + FA_MONITOR_GLASS.x, TRADE.y + FA_MONITOR_GLASS.y],
  [faDial, DIAL.x, DIAL.y],
  [faMonitor('fa20-dash-screen', DASH.w, DASH.h), DASH.x, DASH.y],
  [dash, DASH.x + FA_MONITOR_GLASS.x, DASH.y + FA_MONITOR_GLASS.y],
  [colleague, COLLEAGUE.x, COLLEAGUE.y],
]);

export const fa20Opener: SceneArt = {
  id: 'fa20-opener',
  label: 'A stream switchyard in the data plant: market prices, orders and news race down three pipes into a tall broker whose event log scrolls without stopping, then fan out to a trading screen, a risk dial and a dashboard, while a colleague times it all on a stopwatch.',
  width: 80,
  height: 60,
  base,
  layers: [
    ...FEEDS.map(({ id, y, ink }) => ({ sprite: faPacketRun(`fa20-feed-${id}`, IN.length - 2, [[Infinity, ink]], 6, 110), x: IN.x + 1, y: y + 3 })),
    ...OUT.map(({ y, length }, k) => ({ sprite: faPacketsRight(`fa20-fan-${String(k)}`, length - 2, ['B', 'y', 'T'], 5, 110), x: OUT_X + 1, y: y + 2 })),
    { sprite: log, x: BROKER.x + LOG.x, y: BROKER.y + LOG.y },
    { sprite: boltLit, x: TRADE.x + FA_MONITOR_GLASS.x + 1, y: TRADE.y + FA_MONITOR_GLASS.y, motion: { kind: 'twinkle', periodMs: 700, min: 0 } },
    { sprite: faGaugeNeedle, x: DIAL.x + FA_DIAL_NEEDLE.x, y: DIAL.y + FA_DIAL_NEEDLE.y },
    { sprite: liveDot, x: DASH.x + FA_MONITOR_GLASS.x + 13, y: DASH.y + FA_MONITOR_GLASS.y, motion: { kind: 'twinkle', periodMs: 1000, min: 0.1 } },
    { sprite: stopwatchHand, x: COLLEAGUE.x + FACE.x, y: COLLEAGUE.y + FACE.y },
    faStageLight('collect', MAP.x, MAP.y),
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────── */

/**
 * LESSON 20: real-time streaming. A stopwatch: blue speed lines streak in from the left, the white
 * dial draws itself and gets its gold crown, then the red hand sweeps round a quarter turn a beat
 * and the screen clears.
 */
export const faEmblemStream: PixelSprite = (() => {
  const full = [
    '..........yy....',
    '.........wwww...',
    '.......wwwwwwxx.',
    '.BBBB..ww....xx.',
    '......ww......xx',
    'BBBBB.ww......xx',
    '......ww......xx',
    '..BBB.ww......xx',
    '.......wx....xx.',
    '.......xxxxxxxx.',
    '.........xxxx...',
  ];
  const only = (keep: (x: number, y: number, ch: string) => boolean) =>
    full.map((row, y) => [...row].map((ch, x) => (ch !== '.' && keep(x, y, ch) ? ch : '.')).join(''));
  const PIVOT = [[10, 5], [11, 5], [10, 6], [11, 6]] as const;
  const HANDS = [
    [[10, 3], [11, 3], [10, 4], [11, 4]],
    [[12, 5], [13, 5], [12, 6], [13, 6]],
    [[10, 7], [11, 7], [10, 8], [11, 8]],
    [[8, 5], [9, 5], [8, 6], [9, 6]],
  ] as const;
  const hand = (k: number) => {
    const g = full.map((row) => [...row]);
    for (const [x, y] of [...PIVOT, ...HANDS[k]]) g[y][x] = 'R';
    return faRowsOf(g);
  };
  const frames = [
    only((_x, y, ch) => ch === 'B' && y === 5),
    only((_x, _y, ch) => ch === 'B'),
    only((x, _y, ch) => ch === 'B' || x <= 10),
    only((_x, _y, ch) => ch !== 'y'),
    [...full],
    hand(0),
    hand(1),
    hand(2),
    hand(3),
    hand(0),
    hand(1),
    full.map((row) => '.'.repeat(row.length)),
  ];
  // At rest (Reduce Motion) the watch keeps its hand, at twelve.
  return { id: 'fa-emblem-stream', name: 'emblem stream', tags: ['scene', 'fa', 'emblem'], blurb: 'A stopwatch with speed lines and a sweeping red hand.', rows: hand(0), frames, frameMs: 320 };
})();

export const fa20Finish: SceneArt = faKeepsake(
  'fa20-finish',
  'A gold terminal trophy on a purple stand, its screen drawing a white stopwatch with blue speed lines streaking in from the left and a red hand sweeping round, with small sparkles around it.',
  faEmblemStream,
);

export const art: LessonArtSet = { opener: fa20Opener, backdrop: faBackdrop, finish: fa20Finish };
