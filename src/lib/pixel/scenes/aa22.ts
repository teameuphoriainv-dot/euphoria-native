/**
 * Applied Accounting lesson 22, Advanced Financial Statement Analysis: return on equity taken apart
 * into what drives it.
 *
 * The DuPont engine: an instrument panel in a gilt frame over a console desk, under a plate reading
 * DUPONT. Three brass gauges multiply into a fourth, as the sum reads: a 5% profit margin, times 1.0
 * asset turnover, times a 4.0 equity multiplier, equals a 20% return on equity. The ROE gauge sits
 * in its green; the equity multiplier's needle is deep in the red, and a warning lamp burns over it,
 * because that 20% is borrowed. On the desk lies the annual report the figures came from. Moving:
 * the warning lamp blinks, a gold halo pulses round the ROE gauge, light crosses the gauge glass,
 * dust rises.
 */
import type { PixelSprite } from '../types';
import { AA_PALETTE, aaCompose, aaDesk, aaGlint, aaMote, aaOffsetFrames, aaPlaque, aaText } from './aa-kit';
import { aaFloor, aaFrame } from './aa-kit-a';
import { aaPaint } from './aa-kit-c';
import { aaKeepsake } from './aa1-finish';
import { aaBackdrop } from './aa-backdrop';
import type { LessonArtSet, SceneArt } from './types';

const sprite = (id: string, rows: string[], palette?: Record<string, string>): PixelSprite =>
  ({ id, name: id, tags: ['aa', 'aa22'], rows, ...(palette ? { palette } : {}) });

/** Degrees round a gauge face from straight up, clockwise, between -180 and 180. */
const bearing = (dx: number, dy: number) => (Math.atan2(dx, -dy) * 180) / Math.PI;

/**
 * A round gauge, 2r + 1 square: a brass bezel lit from the left, a white face with five ticks, an
 * arc of `zone` colour between two bearings, and the needle fixed at `needle` degrees.
 */
const gauge = (id: string, r: number, needle: number, zone: [number, number, string]) => {
  const rad = (needle * Math.PI) / 180;
  const hand = new Set(Array.from({ length: r - 1 }, (_, k) => `${String(Math.round(r + k * Math.sin(rad)))},${String(Math.round(r - k * Math.cos(rad)))}`));
  return aaPaint(id, 2 * r + 1, 2 * r + 1, (x, y) => {
    const dx = x - r;
    const dy = y - r;
    const d = Math.hypot(dx, dy);
    if (d > r + 0.45) return '.';
    if (d > r - 0.75) return dx + dy < -1 ? 'y' : dx + dy > 1 ? 'g' : 'G';
    if (dx === 0 && dy === 0) return 'D';
    if (hand.has(`${String(x)},${String(y)}`)) return 'K';
    const deg = bearing(dx, dy);
    if (d > r - 2.2 && deg >= zone[0] && deg <= zone[1]) return zone[2];
    if (d > r - 2.2 && [-120, -60, 0, 60, 120].some((t) => Math.abs(deg - t) < 9)) return 'c';
    return 'a';
  });
};

/** The panel: the three drivers, a times sign between them, an equals sign before the return. */
const PANEL = { x: 2, y: 11, w: 76, h: 28 };
const DIAL_Y = 22;
const DRIVERS = [
  { cx: 12, needle: -50, zone: [60, 130, 'R'] as [number, number, string], value: '5%' },
  { cx: 30, needle: 0, zone: [60, 130, 'R'] as [number, number, string], value: '1.0' },
  { cx: 48, needle: 105, zone: [60, 130, 'R'] as [number, number, string], value: '4.0' },
];
const ROE = { cx: 66, r: 7, needle: 55 };
const LABEL_Y = 31;

const times = sprite('aa22-times', ['y.y', '.y.', 'y.y']);
const label = (id: string, text: string, cx: number, ink: string) => {
  const s = aaText(id, text, ink);
  return { sprite: s, x: cx - Math.floor(s.rows[0].length / 2), y: LABEL_Y };
};

/** The warning lamp over the multiplier, dark; its lit glass blinks as a layer. */
const lamp = sprite('aa22-lamp', ['.ODO.', 'OrrrO', '.ODO.']);
const lampLit = sprite('aa22-lamp-lit', ['.rRr.', 'rRsRr', '.rRr.']);

/** The annual report the figures came from, open on the desk. */
const report = sprite('aa22-report', [
  '.aaaaaaaccaaaaaaa.',
  'akkkkkkaccakkkkkka',
  'aaaaaaaaccaaaaaaaa',
  'akkkkkaaccakkkkkaa',
  'aaaaaaaaccaaaaaaaa',
  'EEEEEEEEEEEEEEEEEE',
  '.EEEEEEEEEEEEEEEE.',
], AA_PALETTE);

const base = aaCompose('aa22-opener-base', 80, 60, 'k', [
  { sprite: aaFloor('aa22-floor', 80, [[4, 75]]), x: 0, y: 49 },
  { sprite: aaPlaque('aa22-opener-plate', 'DUPONT'), x: 27, y: 1 },
  { sprite: aaFrame('aa22-panel', PANEL.w, PANEL.h, 'K'), x: PANEL.x, y: PANEL.y },
  ...DRIVERS.map((g, i) => ({ sprite: gauge(`aa22-gauge-${String(i + 1)}`, 6, g.needle, g.zone), x: g.cx - 6, y: DIAL_Y - 6 })),
  { sprite: gauge('aa22-gauge-roe', ROE.r, ROE.needle, [30, 130, 'N']), x: ROE.cx - ROE.r, y: DIAL_Y - ROE.r },
  { sprite: times, x: 20, y: DIAL_Y - 1 },
  { sprite: times, x: 38, y: DIAL_Y - 1 },
  { sprite: aaText('aa22-equals', '=', 'y'), x: 56, y: DIAL_Y - 2 },
  ...DRIVERS.map((g, i) => label(`aa22-value-${String(i + 1)}`, g.value, g.cx, 'G')),
  label('aa22-value-roe', '20%', ROE.cx, 'y'),
  { sprite: lamp, x: DRIVERS[2].cx - 2, y: 13 },
  { sprite: aaDesk, x: 4, y: 39 },
  { sprite: report, x: 31, y: 40 },
]);

/** A gold halo round the ROE gauge, for a slow pulse: the number everyone looks at. */
const halo = aaPaint('aa22-halo', 17, 17, (x, y) => {
  const d = Math.hypot(x - 8, y - 8);
  return d >= 7.5 && d < 8.5 ? 'y' : '.';
});
const glintLater = aaOffsetFrames(aaGlint, 'aa22-glint-later', 4, 280);

export const aa22Opener: SceneArt = {
  id: 'aa22-opener',
  label: 'An instrument panel under a brass plate reading DUPONT multiplies three gauges into a fourth: 5% times 1.0 times 4.0 equals 20%, the last gauge in the green while a red warning lamp burns over the 4.0 gauge, its needle deep in the red.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: lampLit, x: DRIVERS[2].cx - 2, y: 13, motion: { kind: 'twinkle', periodMs: 1400, min: 0 } },
    { sprite: halo, x: ROE.cx - 8, y: DIAL_Y - 8, motion: { kind: 'twinkle', periodMs: 3000, min: 0.1 } },
    { sprite: aaGlint, x: DRIVERS[1].cx - 5, y: DIAL_Y - 5 },
    { sprite: glintLater, x: ROE.cx - 6, y: DIAL_Y - 6 },
    { sprite: aaMote, x: 24, y: 42, motion: { kind: 'rise', amp: 5, periodMs: 3300 } },
    { sprite: aaMote, x: 57, y: 41, motion: { kind: 'rise', amp: 4, periodMs: 3800, phase: 0.5 } },
  ],
};

/** Lesson 22 emblem: a gilt gauge, its needle deep in the red. */
const emblemGauge = aaPaint('aa-emblem-gauge', 16, 16, (x, y) => {
  const dx = x - 7.5;
  const dy = y - 8.5;
  const d = Math.hypot(dx, dy);
  if (d > 7.4) return '.';
  if (d > 6.1) return dx + dy < -3 ? 'y' : dx + dy > 3 ? 'g' : 'G';
  if (d < 1.2) return 'O';
  const along = dx * Math.sin((100 * Math.PI) / 180) - dy * Math.cos((100 * Math.PI) / 180);
  const across = Math.abs(dx * Math.cos((100 * Math.PI) / 180) + dy * Math.sin((100 * Math.PI) / 180));
  if (along > 0 && along < 5.6 && across < 0.6) return 'K';
  const deg = bearing(dx, dy);
  if (d > 3.8 && deg >= 60 && deg <= 135) return 'R';
  if (d > 4.4 && [-135, -90, -45, 0, 45].some((t) => Math.abs(deg - t) < 10)) return 'O';
  return 'a';
});

export const aa22Finish = aaKeepsake(
  'aa22-finish',
  'A purple leather ledger with gold corners and a red ribbon bookmark, its cover stamped with a gold gauge whose needle points deep into the red, with small glints and check marks around it.',
  emblemGauge,
);

export const art: LessonArtSet = { opener: aa22Opener, backdrop: aaBackdrop, finish: aa22Finish };
