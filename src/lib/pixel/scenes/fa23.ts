/**
 * Financial Analytics lesson 23, risk analytics: what a portfolio does in the worst case, not the
 * usual one.
 *
 * OPENER. The stress test bay, at the MODEL station. A hydraulic press, hazard stripes on its beam
 * and a warning beacon turning on top, drives its ram down onto a portfolio, a tan briefcase on the
 * bed: strain marks flash at its sides at the bottom of each stroke, then the ram lifts and comes
 * again. Its gauge swings over into the red. On the wall screen, the distribution of returns: teal
 * bars for the ordinary days, and past the dashed 95% value-at-risk line the long left tail in red,
 * the worst 5% of days (3 of the 58 counts), low but running far out. The tail pulses because that
 * is where the losses VaR does not count live, the ones expected shortfall averages. The analyst
 * and the colleague watch from behind the yellow and black line in hard hats, tablet and clipboard
 * in hand. The map lights MODEL.
 *
 * KEEPSAKE. The opener's histogram in miniature: teal bars rise, a dashed white value-at-risk line
 * drops in near the left, and the red tail past it pulses.
 */
import { faBackdrop } from './fa-backdrop';
import { faAnalyst, faCompose, faGaugeNeedle, faPipelineMap, faTabletLine, FA_ANALYST_TABLET } from './fa-kit';
import { faDial, faDrawnBy, faKeepsake, faMonitor, faRoom, faStageLight, FA_DIAL_NEEDLE, FA_MONITOR_GLASS } from './fa-kit-a';
import { faBlank, faColleague, faRowsOf, FA_CLIPBOARD } from './fa-kit-b';
import { faBeacon, faBeaconLayers, faTicks } from './fa-kit-c';
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';

/* ── the press ─────────────────────────────────────────────────────────────────────────────── */

/**
 * The hydraulic press, 28 x 41: a cylinder cap on a beam striped yellow and black, two columns,
 * and a bed. The space between the columns is left open (the wall shows through); the ram is a
 * layer, the portfolio sits on the bed at PORTFOLIO.
 */
const press: PixelSprite = {
  id: 'fa23-press',
  name: 'press',
  tags: ['scene', 'fa23', 'station'],
  rows: [
    '..........DDDDDDDD..........',
    '..........DxwxxXkD..........',
    '..........DxXXXXkD..........',
    '..........DxXXXXkD..........',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    'DxwxxxxxxxxxxxxxxxxxxxxxxXkD',
    `Dx${'yyKK'.repeat(6)}kD`,
    'DxXXXXXXXXXXXXXXXXXXXXXXXXkD',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    ...Array.from({ length: 25 }, () => `DxkD${'.'.repeat(20)}DxkD`),
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    'DxwxxxxxxxxxxxxxxxxxxxxxxXkD',
    'DxXXXXXXXXXXXXXXXXXXXXXXXXkD',
    'DxXXXXXXXXXXXXXXXXXXXXXXXXkD',
    'DxXXXXXXXXXXXXXXXXXXXXXXXXkD',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    `.DkD${'.'.repeat(20)}DkD.`,
  ],
};
const RAM = { x: 6, y: 9 } as const;
const PORTFOLIO = { x: 6, y: 24 } as const;

/** The portfolio under test: a tan briefcase, 16 x 10, a gold clasp, a seam round its middle. */
const portfolio: PixelSprite = {
  id: 'fa23-portfolio',
  name: 'portfolio',
  tags: ['scene', 'fa23', 'prop'],
  rows: [
    '.....DDDDDD.....',
    '.....DD..DD.....',
    'DDDDDDDDDDDDDDDD',
    'DGGGGGGyyGGGGGgD',
    'DGggggggggggggOD',
    'DGggggggggggggOD',
    'DDDDDDDDDDDDDDDD',
    'DGggggggggggggOD',
    'DGggggggggggggOD',
    'DDDDDDDDDDDDDDDD',
  ],
};

/**
 * The ram's stroke, 16 x 15: a chrome rod pushing the platen down onto the briefcase in four
 * steps, holding it there for three beats, and lifting again. Falling is drawn in frames because
 * a layer's own motion only rises.
 */
const STROKE = [0, 3, 6, 9, 12, 12, 12, 9, 6, 3] as const;
const STROKE_MS = 260;
const ram: PixelSprite = (() => {
  const frames = STROKE.map((t) => Array.from({ length: 15 }, (_, r) => {
    if (r < t) return '......DwXD......';
    if (r === t || r === t + 2) return 'DDDDDDDDDDDDDDDD';
    return r === t + 1 ? 'DxwxxxxxxxxxxXkD' : '................';
  }));
  return { id: 'fa23-ram', name: 'ram', tags: ['scene', 'fa23'], rows: frames[4], frames, frameMs: STROKE_MS };
})();

/** Strain marks flashing at the briefcase's sides on the beats the ram holds it down, in step with it. */
const strain: PixelSprite = (() => {
  const on = ['....................', '.w................w.', 'w..................w', '.w................w.', '....................'];
  const off = on.map((row) => '.'.repeat(row.length));
  return { id: 'fa23-strain', name: 'strain', tags: ['scene', 'fa23'], rows: on, frames: STROKE.map((t) => (t === 12 ? on : off)), frameMs: STROKE_MS };
})();

/** The gauge's red zone, at the top right of its face where the needle ends its swing. */
const redZone: PixelSprite = { id: 'fa23-red-zone', name: 'red zone', tags: ['scene', 'fa23'], rows: ['R', 'R'] };

/** The safety line on the floor in front of the press, yellow and black. */
const hazard: PixelSprite = {
  id: 'fa23-hazard',
  name: 'hazard line',
  tags: ['scene', 'fa23', 'prop'],
  rows: [0, 1].map((r) => Array.from({ length: 40 }, (_, x) => (Math.floor((x + r) / 2) % 2 ? 'K' : 'y')).join('')),
};

/* ── the risk screen ───────────────────────────────────────────────────────────────────────── */

/**
 * The distribution of returns on the screen's glass, 28 x 17: nine bars, ordinary days in teal, the
 * left tail in red (resting dark, pulsed bright by a layer), the dashed 95% value-at-risk line
 * between the tail and the rest, and the axis. The tail holds 3 of the 58 counts, about 5%, which
 * is what a 95% VaR leaves out: low bars, but they run on far to the left.
 */
const BARS = [1, 1, 1, 5, 9, 13, 15, 9, 4] as const;
const TAIL = 3;
const VAR_LINE = 9;
const bars = (tailInk: string, all: boolean) => {
  const g = faBlank(28, 17);
  BARS.forEach((h, k) => {
    if (!all && k >= TAIL) return;
    for (let j = 0; j < h; j++) {
      g[15 - j][1 + k * 3] = k < TAIL ? tailInk : 'T';
      g[15 - j][2 + k * 3] = k < TAIL ? tailInk : 't';
    }
  });
  return g;
};
const returns: PixelSprite = (() => {
  const g = bars('r', true);
  for (let y = 0; y < 16; y += 2) g[y][VAR_LINE] = 'w';
  for (let x = 0; x < 28; x++) g[16][x] = 'X';
  return { id: 'fa23-returns', name: 'returns', tags: ['scene', 'fa23'], rows: faRowsOf(g) };
})();
const tail: PixelSprite = { id: 'fa23-tail', name: 'tail', tags: ['scene', 'fa23'], rows: faRowsOf(bars('R', false)).map((row) => row.slice(0, VAR_LINE)) };

/* ── the crew ──────────────────────────────────────────────────────────────────────────────── */

/** A yellow hard hat, 12 x 5, its brim wider than a head: stamp it over the hair. */
const hardHat: PixelSprite = {
  id: 'fa23-hard-hat',
  name: 'hard hat',
  tags: ['scene', 'fa23', 'prop'],
  rows: ['....yyyy....', '...yyyyGG...', '..yyyGGGGg..', '..yGGGGGGg..', 'yyGGGGGGGGgg'],
};

/* ── the room ──────────────────────────────────────────────────────────────────────────────── */

/* Where things stand. */
const MAP = { x: 2, y: 1 } as const;
const SCREEN = { x: 2, y: 9, w: 34, h: 23 } as const;
const GLASS = { x: SCREEN.x + FA_MONITOR_GLASS.x, y: SCREEN.y + FA_MONITOR_GLASS.y } as const;
const PRESS = { x: 40, y: 8 } as const;
const DIAL = { x: 68, y: 14 } as const;
const BEACON = { x: 41, y: 8 } as const;
const ANALYST = { x: 7, y: 34 } as const;
const COLLEAGUE = { x: 21, y: 32 } as const;

const room = faRoom('fa23-opener-room', [
  [PRESS.x + 1, 50, 27, 1, 'Z'],
  [ANALYST.x + 1, 58, 10, 1, 'Z'],
  [COLLEAGUE.x + 1, 58, 10, 1, 'Z'],
]);

const base = faCompose('fa23-opener-base', room, [
  [faPipelineMap, MAP.x, MAP.y],
  [faMonitor('fa23-screen', SCREEN.w, SCREEN.h), SCREEN.x, SCREEN.y],
  [returns, GLASS.x, GLASS.y],
  [press, PRESS.x, PRESS.y],
  [portfolio, PRESS.x + PORTFOLIO.x, PRESS.y + PORTFOLIO.y],
  [faBeacon, BEACON.x, BEACON.y],
  [faDial, DIAL.x, DIAL.y],
  [redZone, DIAL.x + 8, DIAL.y + 4],
  [hazard, 38, 52],
  [faAnalyst, ANALYST.x, ANALYST.y],
  [hardHat, ANALYST.x, ANALYST.y - 2],
  [faColleague, COLLEAGUE.x, COLLEAGUE.y],
  [hardHat, COLLEAGUE.x, COLLEAGUE.y],
]);

export const fa23Opener: SceneArt = {
  id: 'fa23-opener',
  label: 'A stress test bay in the data plant: a hydraulic press drives down on a portfolio briefcase as its gauge swings into the red and a warning light turns, a screen shows the red tail of the worst returns past a dashed value at risk line, and the analyst and the colleague watch in hard hats.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: ram, x: PRESS.x + RAM.x, y: PRESS.y + RAM.y },
    { sprite: strain, x: PRESS.x + PORTFOLIO.x - 2, y: PRESS.y + PORTFOLIO.y + 2 },
    ...faBeaconLayers(BEACON.x, BEACON.y, 900),
    { sprite: faGaugeNeedle, x: DIAL.x + FA_DIAL_NEEDLE.x, y: DIAL.y + FA_DIAL_NEEDLE.y },
    { sprite: tail, x: GLASS.x, y: GLASS.y, motion: { kind: 'twinkle', periodMs: 1600, min: 0.2 } },
    { sprite: faTabletLine, x: ANALYST.x + FA_ANALYST_TABLET.x, y: ANALYST.y + FA_ANALYST_TABLET.y },
    { sprite: faTicks, x: COLLEAGUE.x + FA_CLIPBOARD.x, y: COLLEAGUE.y + FA_CLIPBOARD.y },
    faStageLight('model', MAP.x, MAP.y),
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────── */

/**
 * LESSON 23: risk analytics. The opener's histogram in miniature, two-pixel bars told apart by their
 * lit and shadow sides: an axis, then the bars rise one a beat from the left, two low red ones for
 * the tail and five teal ones for the ordinary days, peaking right of centre; the dashed white
 * value-at-risk line drops in between the tail and the rest, and while it holds the red tail
 * pulses, the losses VaR leaves uncounted. The screen clears.
 */
export const faEmblemTail: PixelSprite = (() => {
  const TAIL_BARS = [1, 2] as const;
  const BODY_BARS = [4, 8, 10, 7, 3] as const;
  const LINE = 4;
  const g = faBlank(16, 11);
  const order = new Map<string, number>();
  const put = (x: number, y: number, ch: string, at: number) => { g[y][x] = ch; order.set(`${String(x)},${String(y)}`, at); };
  const bar = (x: number, h: number, lit: string, dark: string, at: number) => {
    for (let j = 0; j < h; j++) { put(x, 9 - j, lit, at); put(x + 1, 9 - j, dark, at); }
  };
  for (let x = 0; x < 16; x++) put(x, 10, 'x', 0);
  TAIL_BARS.forEach((h, k) => bar(k * 2, h, 'R', 'r', k));
  BODY_BARS.forEach((h, k) => bar(LINE + 1 + k * 2, h, 'T', 't', TAIL_BARS.length + k));
  for (let y = 0; y <= 9; y += 2) put(LINE, y, 'w', TAIL_BARS.length + BODY_BARS.length);
  const drawn = faDrawnBy('fa-emblem-tail', faRowsOf(g), (x, y) => order.get(`${String(x)},${String(y)}`) ?? 0, 300, 6);
  const frames = drawn.frames ?? [drawn.rows];
  // The tail pulses while it holds: its bars brighten a step on alternate beats.
  const bright = (rows: readonly string[]) => rows.map((row) => `${row.slice(0, LINE).replace(/R/g, 's').replace(/r/g, 'R')}${row.slice(LINE)}`);
  for (const f of [9, 11, 13]) frames[f] = bright(frames[f]);
  return { ...drawn, name: 'emblem tail', blurb: 'A histogram of returns, its red tail past the value-at-risk line.', frames };
})();

export const fa23Finish: SceneArt = faKeepsake(
  'fa23-finish',
  'A gold terminal trophy on a purple stand, its screen building a histogram of teal bars with a dashed white line near its left end and two short red bars of the tail past the line pulsing, with small sparkles around it.',
  faEmblemTail,
);

export const art: LessonArtSet = { opener: fa23Opener, backdrop: faBackdrop, finish: fa23Finish };
