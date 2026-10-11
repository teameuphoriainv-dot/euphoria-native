/**
 * Financial Analytics lesson 4, regression and forecasting: the line through the cloud.
 *
 * OPENER. The model bay's plotter: a wide board on legs, its glass ruled with a market axis and a
 * stock axis, scattered with blue dots (a stock's returns against the market's). A pen gantry
 * rides the rails back and forth while the fitted line draws itself through the cloud in gold, and
 * past the last dot it runs on dashed, the forecast. On the wall a gauge swings (the beta it
 * reads), the analyst checks the fit on the tablet, and the map lights MODEL.
 *
 * KEEPSAKE. The trophy with the lesson's picture: dots, then a gold line through them, then its
 * dashed forecast.
 */
import { faBackdrop } from './fa-backdrop';
import { faAnalyst, faCompose, faGaugeNeedle, faPipelineMap, faTabletLine, FA_ANALYST_TABLET } from './fa-kit';
import { faDial, faDrawnBy, faKeepsake, faRoom, faStageLight, FA_DIAL_NEEDLE } from './fa-kit-a';
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';

/* ── the plotter ───────────────────────────────────────────────────────────────────────────── */

const GLASS_W = 46;
const GLASS_H = 28;
/** The axes meet at the bottom left: the market's return across, the stock's return up. */
const ORIGIN = { x: 2, y: 25 } as const;
/** A tick every few pixels along each axis, so the glass reads as a chart and not a window. */
const tick = (x: number, y: number) => (y === ORIGIN.y + 1 && x > ORIGIN.x && x % 6 === 2) || (x === ORIGIN.x - 1 && y < ORIGIN.y && y % 6 === 1);
/** The fitted line's sprite sits here on the glass, 32 x 26, rising from its bottom-left corner. */
const FIT = { x: 7, y: 1, w: 32, h: 26 } as const;
const fitY = (sx: number) => Math.round(FIT.h - 1 - (sx * (FIT.h - 1)) / (FIT.w - 1));
/** Observations: [column along the fit, how far above (-) or below (+) the line it landed]. */
const DOTS: readonly (readonly [number, number])[] = [
  [1, 2], [3, -2], [4, 3], [6, -1], [8, 2], [9, -3], [11, 1], [13, 3],
  [14, -2], [16, 2], [18, -2], [19, 3], [21, -3], [23, 1], [24, -2],
];
const dotAt = new Set(DOTS.map(([sx, r]) => `${String(FIT.x + sx)},${String(FIT.y + fitY(sx) + r)}`));

/** 52 x 39: rails top and bottom, the ruled glass at (3, 3), legs to the floor. */
const plotter: PixelSprite = (() => {
  const glass = (y: number) =>
    Array.from({ length: GLASS_W }, (_, x) => (dotAt.has(`${String(x)},${String(y)}`) ? 'B' : (y === ORIGIN.y && x >= ORIGIN.x) || (x === ORIGIN.x && y <= ORIGIN.y) || tick(x, y) ? 'X' : 'K')).join('');
  return {
    id: 'fa4-plotter',
    name: 'plotter',
    tags: ['scene', 'fa4', 'station'],
    blurb: 'A plotter board on legs: rails for a pen gantry over ruled glass scattered with dots.',
    rows: [
      `.${'D'.repeat(50)}.`,
      `Dxw${'x'.repeat(46)}XkD`,
      `Dx${'D'.repeat(48)}kD`,
      ...Array.from({ length: GLASS_H }, (_, y) => `DxD${glass(y)}DkD`),
      `Dx${'D'.repeat(48)}kD`,
      `Dx${'X'.repeat(48)}kD`,
      'D'.repeat(52),
      ...Array.from({ length: 5 }, () => `.DkD${'.'.repeat(44)}DkD.`),
    ],
  };
})();

/* Where things stand. */
const MAP = { x: 2, y: 2 } as const;
const PLOTTER = { x: 3, y: 10 } as const;
const GLASS = { x: PLOTTER.x + 3, y: PLOTTER.y + 3 } as const;
const GAUGE = { x: 62, y: 10 } as const;
const ANALYST = { x: 63, y: 33 } as const;

const room = faRoom('fa4-opener-room', [
  [5, 50, 52, 1, 'Z'],
  [5, 51, 50, 1, 'Z'],
  [66, 57, 13, 2, 'Z'],
]);

const base = faCompose('fa4-opener-base', room, [
  [faPipelineMap, MAP.x, MAP.y],
  [plotter, PLOTTER.x, PLOTTER.y],
  [faDial, GAUGE.x, GAUGE.y],
  [faAnalyst, ANALYST.x, ANALYST.y],
]);

/* ── moving parts ──────────────────────────────────────────────────────────────────────────── */

/** The fit drawing itself from the left, solid through the data, dashed past it as a forecast. */
const fitLine: PixelSprite = (() => {
  const lastDot = Math.max(...DOTS.map(([sx]) => sx));
  const full = Array.from({ length: FIT.h }, (_, y) =>
    Array.from({ length: FIT.w }, (_, sx) => (fitY(sx) === y && (sx <= lastDot + 1 || sx % 2 === 0) ? 'y' : '.')).join(''));
  return faDrawnBy('fa4-fit-line', full, (sx) => Math.floor(sx / 3), 220, 5);
})();

/**
 * The pen gantry: a dim bar across the rails with a bright carriage, riding back and forth. The bar
 * stays one step above the glass so it reads as a rail and does not cut the chart in two.
 */
const gantry: PixelSprite = {
  id: 'fa4-gantry',
  name: 'gantry',
  tags: ['scene', 'fa4'],
  rows: Array.from({ length: 32 }, (_, y) => (y >= 12 && y <= 14 ? ['DxD', 'xwx', 'DxD'][y - 12] : '.D.')),
};

export const fa4Opener: SceneArt = {
  id: 'fa4-opener',
  label: 'A plotter board in the data works: a pen gantry sweeps over scattered blue dots while a gold regression line draws itself through them and runs on as a dashed forecast, beside a wall gauge and an analyst with a tablet.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: fitLine, x: GLASS.x + FIT.x, y: GLASS.y + FIT.y },
    { sprite: gantry, x: GLASS.x + 21, y: PLOTTER.y + 1, motion: { kind: 'drift', amp: 18, periodMs: 7000 } },
    { sprite: faGaugeNeedle, x: GAUGE.x + FA_DIAL_NEEDLE.x, y: GAUGE.y + FA_DIAL_NEEDLE.y },
    faStageLight('model', MAP.x, MAP.y),
    { sprite: faTabletLine, x: ANALYST.x + FA_ANALYST_TABLET.x, y: ANALYST.y + FA_ANALYST_TABLET.y },
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────── */

/**
 * LESSON 4: regression. Blue observations land on either side of where the line will go, the gold
 * fit draws itself through them from the left, and two dashes carry it on past the data, the
 * forecast. It holds, the screen clears.
 */
export const faEmblemRegression: PixelSprite = (() => {
  const line = (x: number) => Math.round(10 - (x * 10) / 15);
  const dots = new Set(['1,7', '2,10', '4,9', '5,5', '6,8', '7,3', '9,6', '10,1']);
  const full = Array.from({ length: 11 }, (_, y) =>
    Array.from({ length: 16 }, (_, x) => {
      if (dots.has(`${String(x)},${String(y)}`)) return 'B';
      return line(x) === y && (x <= 10 || x === 12 || x === 14) ? 'y' : '.';
    }).join(''));
  return {
    ...faDrawnBy('fa-emblem-regression', full, (x, _y, ch) => (ch === 'B' ? (x < 6 ? 0 : 1) : 2 + Math.floor(x / 2)), 300),
    name: 'emblem regression',
    blurb: 'Dots and the line fitted through them, run on as a forecast.',
  };
})();

export const fa4Finish: SceneArt = faKeepsake(
  'fa4-finish',
  'A gold terminal trophy on a purple stand, its screen drawing blue dots and a gold regression line through them that runs on as a dashed forecast, with small sparkles around it.',
  faEmblemRegression,
);

export const art: LessonArtSet = { opener: fa4Opener, backdrop: faBackdrop, finish: fa4Finish };
