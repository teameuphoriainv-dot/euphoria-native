/**
 * Financial Analytics lesson 19, anomaly detection: the one transaction that does not fit.
 *
 * OPENER. The fraud desk, at the CLEAN station. The wall screen is the lesson's own case, zoomed
 * on the Atlantic: a card used in New York (green pin), then thirty minutes later a purchase in
 * Lagos (red pin), and the flight path between them drawing itself, a journey no one can make in
 * half an hour; the red pin pulses. Beside it, the alert panel: a blinking warning over an anomaly
 * score that is nearly full. Underneath, transactions stream along the pipe into the cleaning tank,
 * teal after teal and then a red one; the tank drips its outliers into the bin under a turning red
 * beacon, and the analyst bends a magnifying glass over the bin. The map lights CLEAN.
 *
 * KEEPSAKE. The trophy with an outlier found: teal data points land, one red point lands apart
 * from them, and a magnifying glass draws itself around it while it blinks.
 */
import { faBackdrop } from './fa-backdrop';
import { faBubble, faCompose, faConduit, faFilterTank, faOutlierDrip, faPipelineMap, FA_FILTER_DRIP } from './fa-kit';
import { faDrawnBy, faKeepsake, faMonitor, faRoom, faStageLight, FA_MONITOR_GLASS } from './fa-kit-a';
import { faAnalystPoint, faBlank, faRowsOf, FA_CAST_ANALYST } from './fa-kit-b';
import { faBeacon, faBeaconLayers, faFigure, faHead, faPacketsRight } from './fa-kit-c';
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';

/* ── the map ───────────────────────────────────────────────────────────────────────────────── */

/**
 * The North Atlantic on the screen's glass, 36 x 22, land in dark teal: North America's coast on
 * the left (Florida, the islands, the top of South America below it), Europe and the bulge of
 * Africa on the right, the Gulf of Guinea cut into its south coast. Each run is where land starts
 * or ends on that row.
 */
const atlantic: PixelSprite = (() => {
  const g = faBlank(36, 22);
  const land = (x: number, y: number) => { g[y][x] = 't'; };
  const america = [9, 10, 10, 9, 9, 8, 8, 7, 6, 5, 4, 3, 2, 1];
  america.forEach((w, y) => { for (let x = 0; x < w; x++) land(x, y); });
  [3, 5, 8, 9, 9, 8].forEach((w, k) => { for (let x = 0; x < w; x++) land(x, 16 + k); });
  for (const [x, y] of [[4, 10], [4, 11], [4, 12], [7, 14], [8, 14], [10, 15], [11, 15], [13, 0], [14, 0], [15, 0], [14, 1]] as const) land(x, y);
  [31, 30, 29, 28, 28, 29, 30].forEach((from, k) => { for (let x = from; x < 36; x++) land(x, 1 + k); });
  [28, 26, 25, 25, 25, 26, 28, 31, 32, 32, 33, 33, 33].forEach((from, k) => { for (let x = from; x < 36; x++) land(x, 9 + k); });
  return { id: 'fa19-atlantic', name: 'atlantic', tags: ['scene', 'fa19'], rows: faRowsOf(g) };
})();

/** The two pins, 3 x 3, with white centres: where the card was, where it is now. */
const pin = (id: string, ink: string): PixelSprite => ({ id, name: id, tags: ['scene', 'fa19', 'prop'], rows: [`.${ink}.`, `${ink}w${ink}`, `.${ink}.`] });
const NEW_YORK = { x: 7, y: 6 } as const;
const LAGOS = { x: 29, y: 15 } as const;

/**
 * The flight path from New York to Lagos, a dotted arc over the Atlantic drawn from one pin to the
 * other (a quadratic curve through a point high over the ocean); it holds, then clears.
 */
const flight: PixelSprite = (() => {
  const [x0, y0, cx, cy, x1, y1] = [NEW_YORK.x + 1, NEW_YORK.y - 2, 16, -5, LAGOS.x - 1, LAGOS.y - 2];
  const dots: [number, number][] = [];
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    const x = Math.round((1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t ** 2 * x1);
    const y = Math.round((1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t ** 2 * y1);
    const last = dots[dots.length - 1];
    if (!last || last[0] !== x || last[1] !== y) dots.push([x, y]);
  }
  const kept = dots.filter((_, i) => i % 2 === 0);
  const g = faBlank(36, 22);
  const order = new Map<string, number>();
  kept.forEach(([x, y], i) => { g[y][x] = 'w'; order.set(`${String(x)},${String(y)}`, Math.floor(i / 2)); });
  return faDrawnBy('fa19-flight', faRowsOf(g), (x, y) => order.get(`${String(x)},${String(y)}`) ?? 0, 180, 9);
})();

/** Lagos pulsing: a ring opens round the red pin, then a wider, fainter one, then rest. */
const pulse: PixelSprite = {
  id: 'fa19-pulse',
  name: 'pulse',
  tags: ['scene', 'fa19'],
  rows: ['.......', '..RRR..', '.R...R.', '.R...R.', '.R...R.', '..RRR..', '.......'],
  frames: [
    ['.......', '..RRR..', '.R...R.', '.R...R.', '.R...R.', '..RRR..', '.......'],
    ['..rrr..', '.r...r.', 'r.....r', 'r.....r', 'r.....r', '.r...r.', '..rrr..'],
    ['.......', '.......', '.......', '.......', '.......', '.......', '.......'],
    ['.......', '.......', '.......', '.......', '.......', '.......', '.......'],
  ],
  frameMs: 380,
};

/**
 * The alert panel's glass, 12 x 6: a warning mark (resting dim, lit by a layer) beside the anomaly
 * score, a red bar all but full, and a grey caption under it.
 */
const score: PixelSprite = {
  id: 'fa19-score',
  name: 'anomaly score',
  tags: ['scene', 'fa19'],
  rows: ['rr..........', 'rr.RRRRRRRRX', 'rr.RRRRRRRRX', '............', 'rr.XXXX.XXX.', '............'],
};
const warning: PixelSprite = { id: 'fa19-warning', name: 'warning', tags: ['scene', 'fa19'], rows: ['RR', 'RR', 'RR', '..', 'RR'] };

/* ── the analyst ───────────────────────────────────────────────────────────────────────────── */

/**
 * The analyst holding a brass magnifying glass up at head height to their right (our left), the
 * other hand at the side: faAnalystPoint's body with the pointing arm bent back to hold the
 * handle. 18 x 24; the lens's glass is light blue, its glint at LENS_GLINT.
 */
const LENS = ['......', '......', '......', '.GGGG.', 'GwBBBg', 'GBBBBg', 'GBBBBg', 'gBBBBg', '.ggggO', '......'] as const;
const head = faHead(FA_CAST_ANALYST).map((row, y) => `${LENS[y]}${row}`);
head[9] = `${LENS[9]}OS...SM.....`;
const analyst = faFigure('fa19-analyst', FA_CAST_ANALYST, [
  ...head,
  '.......TTTtwwttv..',
  ...faAnalystPoint.rows.slice(11).map((row) => `......${row.slice(4)}`),
], 'The analyst, front on, holding a magnifying glass up beside their head.');
const LENS_GLINT = { x: 2, y: 4 } as const;
const glint: PixelSprite = { id: 'fa19-glint', name: 'glint', tags: ['scene', 'fa19'], rows: ['.W', 'W.'] };

/* ── the room ──────────────────────────────────────────────────────────────────────────────── */

/* Where things stand. */
const MAP = { x: 46, y: 1 } as const;
const WORLD = { x: 2, y: 2, w: 42, h: 28 } as const;
const GLASS = { x: WORLD.x + FA_MONITOR_GLASS.x, y: WORLD.y + FA_MONITOR_GLASS.y } as const;
const ALERT = { x: 60, y: 9, w: 18, h: 12 } as const;
const TANK = { x: 48, y: 21 } as const;
const BEACON = { x: 50, y: 17 } as const;
const PIPE = { x: 3, y: 43, length: 45 } as const;
const ANALYST = { x: 58, y: 33 } as const;

const room = faRoom('fa19-opener-room', [
  [TANK.x + 1, 50, 9, 1, 'Z'],
  [ANALYST.x + 8, 57, 10, 1, 'Z'],
]);

const base = faCompose('fa19-opener-base', room, [
  [faPipelineMap, MAP.x, MAP.y],
  [faMonitor('fa19-world', WORLD.w, WORLD.h), WORLD.x, WORLD.y],
  [atlantic, GLASS.x, GLASS.y],
  [pin('fa19-pin-new-york', 'N'), GLASS.x + NEW_YORK.x - 1, GLASS.y + NEW_YORK.y - 1],
  [pin('fa19-pin-lagos', 'R'), GLASS.x + LAGOS.x - 1, GLASS.y + LAGOS.y - 1],
  [faMonitor('fa19-alert', ALERT.w, ALERT.h), ALERT.x, ALERT.y],
  [score, ALERT.x + FA_MONITOR_GLASS.x, ALERT.y + FA_MONITOR_GLASS.y],
  [faFilterTank, TANK.x, TANK.y],
  [faBeacon, BEACON.x, BEACON.y],
  [faConduit('fa19-pipe', PIPE.length, 9), PIPE.x, PIPE.y],
  [analyst, ANALYST.x, ANALYST.y],
]);

export const fa19Opener: SceneArt = {
  id: 'fa19-opener',
  label: 'A fraud desk in the data plant: a map traces one card from New York to Lagos in half an hour, an alert panel blinks over a nearly full anomaly score, transactions stream into the cleaning tank where a red outlier drops into the bin under a flashing beacon, and the analyst inspects it with a magnifying glass.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: flight, x: GLASS.x, y: GLASS.y },
    { sprite: pulse, x: GLASS.x + LAGOS.x - 3, y: GLASS.y + LAGOS.y - 3 },
    { sprite: warning, x: ALERT.x + FA_MONITOR_GLASS.x, y: ALERT.y + FA_MONITOR_GLASS.y, motion: { kind: 'twinkle', periodMs: 900, min: 0.1 } },
    { sprite: faPacketsRight('fa19-transactions', PIPE.length - 2, ['T', 'T', 'T', 'T', 'T', 'R'], 6, 140), x: PIPE.x + 1, y: PIPE.y + 2 },
    { sprite: faBubble, x: TANK.x + 3, y: TANK.y + 14, motion: { kind: 'rise', amp: 6, periodMs: 1800 } },
    { sprite: faBubble, x: TANK.x + 6, y: TANK.y + 15, motion: { kind: 'rise', amp: 6, periodMs: 2300, phase: 0.5 } },
    { sprite: faOutlierDrip, x: TANK.x + FA_FILTER_DRIP.x, y: TANK.y + FA_FILTER_DRIP.y },
    ...faBeaconLayers(BEACON.x, BEACON.y),
    { sprite: glint, x: ANALYST.x + LENS_GLINT.x, y: ANALYST.y + LENS_GLINT.y, motion: { kind: 'twinkle', periodMs: 1700, min: 0 } },
    faStageLight('clean', MAP.x, MAP.y),
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────── */

/**
 * LESSON 19: anomaly detection. Five teal data points land one by one, then a red one well apart
 * from them; a magnifying glass draws itself around the red point, rim and then handle, and the
 * point blinks while it holds, then the screen clears.
 */
export const faEmblemOutlier: PixelSprite = (() => {
  const full = [
    '........wwwww...',
    '.......wwwwxxx..',
    '...TT.ww.....xx.',
    '...Tt.ww.RRR.xx.',
    '......ww.RRR.xx.',
    'TT....ww.rrr.xx.',
    'Tt....ww.....xx.',
    '...TT..xxxxxxx..',
    '...Tt...xxxxxGG.',
    '.TT...TT......GG',
    '.Tt...Tt.......G',
  ];
  const step = (x: number, y: number, ch: string) => {
    if (ch === 'T' || ch === 't') return y <= 3 ? 0 : y <= 6 ? 1 : y <= 8 ? 2 : x <= 3 ? 3 : 4;
    if (ch === 'R' || ch === 'r') return 5;
    if (ch === 'G') return 8;
    return x <= 10 ? 6 : 7;
  };
  const drawn = faDrawnBy('fa-emblem-outlier', full, step, 280, 6);
  const frames = drawn.frames ?? [drawn.rows];
  // Found: the outlier blinks while the glass holds over it.
  for (const f of [10, 12]) frames[f] = frames[f].map((row) => row.replace(/R/g, 's'));
  return { ...drawn, name: 'emblem outlier', blurb: 'A magnifying glass over one red point apart from the teal ones.', frames };
})();

export const fa19Finish: SceneArt = faKeepsake(
  'fa19-finish',
  'A gold terminal trophy on a purple stand, its screen placing teal data points and one red point apart from them, then drawing a magnifying glass around the red one as it blinks, with small sparkles around it.',
  faEmblemOutlier,
);

export const art: LessonArtSet = { opener: fa19Opener, backdrop: faBackdrop, finish: fa19Finish };
