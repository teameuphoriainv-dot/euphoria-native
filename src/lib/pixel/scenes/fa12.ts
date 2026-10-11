/**
 * Financial Analytics lesson 12, sentiment and alternative data: signals from outside the
 * financial statements.
 *
 * OPENER. The plant's roof at night, its listening post. A satellite drifts overhead and the big
 * dish on the left answers it in rings (satellite data); over the parapet the city talks, speech
 * bubbles rising from the skyline, mostly green pluses and the odd red minus (social sentiment).
 * The analyst holds the tablet up to read the sentiment score as it climbs, a cable carries what
 * the roof collects along the front edge into the plant, and the plant's rooftop sign, the
 * pipeline map on two posts, lights COLLECT.
 *
 * KEEPSAKE. The trophy with a speech bubble that smiles: sentiment, read from what people say.
 */
import { faBackdrop } from './fa-backdrop';
import { faCompose, faConduit, faLamp, faPacketRun, faPipelineMap, FA_STEEL } from './fa-kit';
import { faDrawnBy, faKeepsake, faStageLight } from './fa-kit-a';
import { faAnalystTabletUp, faBlank, faRowsOf, FA_TABLET_UP_GLASS } from './fa-kit-b';
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';

/* ── the roof at night ─────────────────────────────────────────────────────────────────────── */

const PARAPET = 40;

/**
 * Sky (Z) down to the parapet, the city's blocks against it (c, lit on their left edges, a few
 * windows awake), the parapet's coping (e) and face (a), then the roof (c) with its seams.
 */
const night: PixelSprite = (() => {
  const grid: string[][] = Array.from({ length: 60 }, (_, y) => Array.from({ length: 80 }, () => (y < PARAPET ? 'Z' : 'c')));
  const blocks = [[0, 31, 6], [6, 27, 6], [12, 33, 5], [17, 29, 8], [25, 34, 5], [30, 25, 7], [37, 31, 6], [43, 28, 8], [51, 32, 6], [57, 26, 7], [64, 30, 6], [70, 24, 10]] as const;
  blocks.forEach(([x0, top, w], i) => {
    for (let y = top; y < PARAPET; y++) {
      for (let x = x0; x < x0 + w; x++) grid[y][x] = x === x0 ? 'a' : 'c';
    }
    for (let y = top + 2; y < PARAPET - 1; y += 3) {
      for (let x = x0 + 2; x < x0 + w - 1; x += 2) grid[y][x] = (x + y + i) % 7 === 0 ? 'O' : (x + y + i) % 11 === 0 ? 't' : 'a';
    }
  });
  for (const [x, y] of [[3, 14], [12, 6], [21, 17], [26, 9], [41, 4], [44, 15], [53, 7], [60, 18], [66, 3], [77, 11], [35, 20], [9, 22]] as const) grid[y][x] = 'e';
  grid[PARAPET].fill('e');
  for (const y of [41, 42, 43]) grid[y].fill('a');
  grid[44].fill('Z');
  for (const y of [50, 56]) for (let x = 0; x < 80; x += 1) if (x % 9 !== 4) grid[y][x] = 'Z';
  // Cast shadows on the roof: the dish's plate and the analyst's feet.
  for (let x = 3; x < 13; x++) grid[49][x] = 'Z';
  for (let x = 28; x < 41; x++) grid[54][x] = 'Z';
  return { id: 'fa12-night', name: 'roof at night', tags: ['scene', 'fa12'], palette: FA_STEEL, rows: faRowsOf(grid) };
})();

/** A crescent moon. */
const moon: PixelSprite = { id: 'fa12-moon', name: 'moon', tags: ['scene', 'fa12', 'prop'], rows: ['..yyy.', '.yyw..', 'yyw...', 'yy....', '.yy...', '..yyy.'] };

/**
 * The dish, its bowl turned up and to the right at the satellite: lit inner face, a deep rim,
 * the feed arm across it to the receiver at the focus, a post and a base plate on the roof.
 */
const dish: PixelSprite = {
  id: 'fa12-dish',
  name: 'dish',
  tags: ['scene', 'fa12', 'prop'],
  rows: [
    '...........DDDD.....',
    '.........DDxxwwD....',
    '.......DDxxxxxwD....',
    '......DxxxxxxDXD....',
    '.....DxxxxxxDxXD....',
    '....DxxxxxxDxXXD....',
    '...DxxxxxxDxXXkD....',
    '...DxxxxxDxXXkD.....',
    '..DwxxxxDXXXkD......',
    '..DwxxxDXXkkD.......',
    '.DwxXXDXkkDD........',
    '.DwXXXkkDD..........',
    '.DXXkkDD............',
    '..DDDDD.............',
    '...DkD..............',
    '...DkD..............',
    '...DkD..............',
    '...DkD..............',
    '...DkD..............',
    '...DkD..............',
    '...DkD..............',
    '.DDDDDDD............',
    'DxXXXXXkD...........',
    'DDDDDDDDD...........',
  ],
};
/** Where the feed arm meets the receiver, on the dish. */
const FOCUS = { x: 13, y: 2 } as const;

/** A post of the rooftop sign, from under the map down behind the parapet. */
const post: PixelSprite = { id: 'fa12-post', name: 'post', tags: ['scene', 'fa12', 'prop'], rows: Array.from({ length: 20 }, () => 'Dk') };

/* Where things stand. */
const DISH = { x: 1, y: 25 } as const;
const MAP = { x: 46, y: 13 } as const;
const ANALYST = { x: 24, y: 30 } as const;
const CABLE = { x: 6, y: 55, length: 74 } as const;

const base = faCompose('fa12-opener-base', night, [
  [moon, 5, 3],
  [post, MAP.x + 4, MAP.y + 7],
  [post, MAP.x + 26, MAP.y + 7],
  [faPipelineMap, MAP.x, MAP.y],
  [dish, DISH.x, DISH.y],
  [faAnalystTabletUp, ANALYST.x, ANALYST.y],
  [faConduit('fa12-cable', CABLE.length, 12), CABLE.x, CABLE.y],
]);

/* ── moving parts ──────────────────────────────────────────────────────────────────────────── */

/** The satellite: panels either side of a gold-foil body, its antenna turned down to the dish. */
const satellite: PixelSprite = {
  id: 'fa12-satellite',
  name: 'satellite',
  tags: ['scene', 'fa12'],
  rows: ['.....DDD.....', 'BbBbDxwGDbBbB', 'bBbBDGGgDBbBb', '.....DDD.....', '......x......'],
};

/** Rings leaving the dish's receiver towards the satellite, widening one after another. */
const rings: PixelSprite = (() => {
  const ring = (r: number) => {
    const out: [number, number][] = [];
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        const dx = x;
        const dy = 8 - y;
        const a = Math.atan2(dy, dx);
        if (Math.round(Math.hypot(dx, dy)) === r && a > 0.3 && a < 1.27) out.push([x, y]);
      }
    }
    return out;
  };
  const frame = (radii: readonly number[]) => {
    const grid = faBlank(9, 9);
    for (const r of radii) for (const [x, y] of ring(r)) grid[y][x] = r === 7 ? 't' : 'T';
    return faRowsOf(grid);
  };
  const frames = [[3], [3, 5], [3, 5, 7], [5, 7], [7], []].map(frame);
  return { id: 'fa12-rings', name: 'rings', tags: ['scene', 'fa12'], rows: frames[2], frames, frameMs: 260 };
})();

/** What the city says, rising over the parapet: a green plus, or a red minus. */
const bubble = (id: string, glyph: readonly string[]): PixelSprite => ({
  id,
  name: id,
  tags: ['scene', 'fa12'],
  rows: ['.wwwww.', `ww${glyph[0]}ww`, `ww${glyph[1]}ww`, `ww${glyph[2]}ww`, '.wwwww.', '.w.....'],
});
const plus = bubble('fa12-plus', ['wNw', 'NNN', 'wNw']);
const minus = bubble('fa12-minus', ['www', 'RRR', 'www']);

/** The tablet's sentiment score climbing, drawn left to right, then clearing. */
const score = faDrawnBy('fa12-score', ['....N', '...N.', '.NN..', 'N....'], (x) => x, 300, 4);

/** Collected data running along the cable into the plant. */
const cablePackets = faPacketRun('fa12-cable-packets', CABLE.length - 2, [[Infinity, 'B']], 8, 180);

const star: PixelSprite = { id: 'fa12-star', name: 'star', tags: ['scene', 'fa12'], rows: ['w'] };

export const fa12Opener: SceneArt = {
  id: 'fa12-opener',
  label: 'The data plant roof at night: a satellite drifts over a big dish sending rings back to it, green plus and red minus speech bubbles rise from the city, and the analyst holds up a tablet showing a climbing sentiment score.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: satellite, x: 27, y: 3, motion: { kind: 'drift', amp: 4, periodMs: 9000 } },
    { sprite: rings, x: DISH.x + FOCUS.x + 1, y: DISH.y + FOCUS.y - 8 },
    { sprite: faLamp, x: DISH.x + FOCUS.x + 1, y: DISH.y + FOCUS.y - 1, motion: { kind: 'twinkle', periodMs: 1200, min: 0.3 } },
    { sprite: star, x: 49, y: 5, motion: { kind: 'twinkle', periodMs: 2300, min: 0.2 } },
    { sprite: star, x: 70, y: 8, motion: { kind: 'twinkle', periodMs: 3100, phase: 0.5, min: 0.2 } },
    { sprite: star, x: 17, y: 11, motion: { kind: 'twinkle', periodMs: 2700, phase: 0.3, min: 0.2 } },
    { sprite: plus, x: 52, y: 31, motion: { kind: 'rise', amp: 8, periodMs: 3200 } },
    { sprite: minus, x: 59, y: 33, motion: { kind: 'rise', amp: 8, periodMs: 3400, phase: 0.7 } },
    { sprite: plus, x: 66, y: 30, motion: { kind: 'rise', amp: 8, periodMs: 3600, phase: 0.4 } },
    { sprite: plus, x: 56, y: 25, motion: { kind: 'rise', amp: 5, periodMs: 3000, phase: 0.15 } },
    { sprite: score, x: ANALYST.x + FA_TABLET_UP_GLASS.x, y: ANALYST.y + FA_TABLET_UP_GLASS.y },
    { sprite: cablePackets, x: CABLE.x + 1, y: CABLE.y + 2 },
    faStageLight('collect', MAP.x, MAP.y),
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────── */

/**
 * LESSON 12: sentiment. A white speech bubble draws its outline, two green eyes open, a green
 * smile draws across, it winks, it holds, the screen clears.
 */
export const faEmblemSentiment: PixelSprite = (() => {
  const full = [
    '.wwwwwwwwwwwwww.',
    'w..............w',
    'w...NN....NN...w',
    'w...NN....NN...w',
    'w..............w',
    'w..N........N..w',
    'w...NNNNNNNN...w',
    '.wwwwwwwwwwwwww.',
    '..ww............',
    '.ww.............',
    'ww..............',
  ];
  const drawn = faDrawnBy('fa-emblem-sentiment', full, (x, y, ch) => (ch === 'w' ? 0 : y < 4 ? 1 : 2 + Math.floor(x / 8)), 340, 4);
  const frames = drawn.frames ?? [drawn.rows];
  // A wink on the second beat of the hold.
  frames[5] = frames[5].map((row, y) => (y === 2 ? row.slice(0, 10) + '..' + row.slice(12) : row));
  return { ...drawn, name: 'emblem sentiment', blurb: 'A smiling speech bubble.', frames };
})();

export const fa12Finish: SceneArt = faKeepsake(
  'fa12-finish',
  'A gold terminal trophy on a purple stand, its screen drawing a white speech bubble with a green smiling face that winks, with small sparkles around it.',
  faEmblemSentiment,
);

export const art: LessonArtSet = { opener: fa12Opener, backdrop: faBackdrop, finish: fa12Finish };
