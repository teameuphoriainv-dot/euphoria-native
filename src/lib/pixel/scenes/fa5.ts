/**
 * Financial Analytics lesson 5, financial modeling: three statements wired into one model.
 *
 * OPENER. The model wall, a straight-on view of the bay: three statement screens side by side,
 * the income statement (green), the cash flow (gold) and the balance sheet (blue), each a header,
 * five lines and a bottom line. Pipes join the bottom lines, so net income runs into the cash flow
 * and cash runs on into the balance sheet: the three-statement model. Under them sits the
 * assumptions panel, three sliders (growth, margin, the discount rate) being nudged back and
 * forth, and beside it a dial swings with the valuation they drive. The map lights MODEL.
 *
 * KEEPSAKE. The trophy with three small statements, each linked to the next by a gold bottom line.
 */
import { faBackdrop } from './fa-backdrop';
import { faAnalyst, faCompose, faConduit, faGaugeNeedle, faPacketRun, faPipelineMap, faTabletLine, FA_ANALYST_TABLET } from './fa-kit';
import { faDial, faDrawnBy, faKeepsake, faMonitor, faRoom, faStageLight, FA_DIAL_NEEDLE, FA_MONITOR_GLASS } from './fa-kit-a';
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';

/* ── the statements ────────────────────────────────────────────────────────────────────────── */

/**
 * A statement's page for an 18 x 22 monitor's glass (12 x 16): a header in its colour, five lines
 * of [label, value] widths, a rule, and the bottom line's value in the header colour.
 */
function statement(id: string, head: string, shade: string, lines: readonly (readonly [number, number])[]): PixelSprite {
  const line = (label: number, value: number, ink: string) =>
    Array.from({ length: 12 }, (_, x) => (x >= 1 && x <= label ? 'X' : x >= 11 - value && x <= 10 ? ink : '.')).join('');
  const blank = '.'.repeat(12);
  return {
    id,
    name: id,
    tags: ['scene', 'fa5', 'prop'],
    rows: [
      head.repeat(12),
      shade.repeat(12),
      blank,
      ...lines.flatMap(([label, value]) => [line(label, value, 'x'), blank]),
      '........XXX.',
      line(4, 3, head),
      blank,
    ],
  };
}

const income = statement('fa5-income', 'N', 'n', [[5, 3], [3, 3], [4, 3], [5, 3], [3, 2]]);
const cashFlow = statement('fa5-cash-flow', 'G', 'g', [[4, 3], [5, 2], [3, 3], [4, 3], [5, 3]]);
const balance = statement('fa5-balance', 'B', 'b', [[3, 3], [4, 3], [5, 3], [3, 3], [4, 2]]);

/** The assumptions panel, 46 x 12: three slider slots, each with a colour mark at its left end. */
const panel: PixelSprite = (() => {
  const plain = `Dx${'X'.repeat(42)}kD`;
  const track = (mark: string) => `DxX${mark}XD${'K'.repeat(34)}DXXXkD`;
  return {
    id: 'fa5-panel',
    name: 'assumptions panel',
    tags: ['scene', 'fa5', 'prop'],
    blurb: 'Three slider slots for the assumptions a model runs on.',
    rows: [
      `.${'D'.repeat(44)}.`,
      `Dxw${'x'.repeat(40)}XkD`,
      plain, track('N'), plain, plain, track('T'), plain, plain, track('q'), plain,
      `.${'D'.repeat(44)}.`,
    ],
  };
})();

/* Where things stand: three screens in a row, the panel and dial under them. */
const MAP = { x: 24, y: 2 } as const;
const SHEETS_Y = 11;
const SHEET_X = [3, 31, 59] as const;
/** The bottom line's row on every screen, where the pipes join them. */
const BOTTOM_Y = SHEETS_Y + FA_MONITOR_GLASS.y + 14;
const PANEL = { x: 4, y: 36 } as const;
const DIAL = { x: 53, y: 36 } as const;
const ANALYST = { x: 67, y: 33 } as const;

const room = faRoom('fa5-opener-room', [[70, 57, 10, 2, 'Z']]);
const link = faConduit('fa5-link', 10);

const base = faCompose('fa5-opener-base', room, [
  [faPipelineMap, MAP.x, MAP.y],
  ...SHEET_X.map((x, i) => [faMonitor(`fa5-screen-${String(i)}`, 18, 22), x, SHEETS_Y] as const),
  [income, SHEET_X[0] + FA_MONITOR_GLASS.x, SHEETS_Y + FA_MONITOR_GLASS.y],
  [cashFlow, SHEET_X[1] + FA_MONITOR_GLASS.x, SHEETS_Y + FA_MONITOR_GLASS.y],
  [balance, SHEET_X[2] + FA_MONITOR_GLASS.x, SHEETS_Y + FA_MONITOR_GLASS.y],
  [link, SHEET_X[0] + 18, BOTTOM_Y - 2],
  [link, SHEET_X[1] + 18, BOTTOM_Y - 2],
  [panel, PANEL.x, PANEL.y],
  [faDial, DIAL.x, DIAL.y],
  [faAnalyst, ANALYST.x, ANALYST.y],
]);

/* ── moving parts ──────────────────────────────────────────────────────────────────────────── */

/** Net income running into the cash flow, and cash running on into the balance sheet. */
const netIncome = faPacketRun('fa5-net-income', 8, [[Infinity, 'N']], 4, 200);
const cash = faPacketRun('fa5-cash', 8, [[Infinity, 'G']], 4, 200);

const knob = (id: string, rows: readonly string[]): PixelSprite => ({ id, name: id, tags: ['scene', 'fa5'], rows: [...rows] });
const growthKnob = knob('fa5-knob-growth', ['mN', 'NN', 'Nn']);
const marginKnob = knob('fa5-knob-margin', ['wT', 'TT', 'Tt']);
const rateKnob = knob('fa5-knob-rate', ['Qq', 'qq', 'qp']);

export const fa5Opener: SceneArt = {
  id: 'fa5-opener',
  label: 'A model wall in the data works: income, cash flow and balance sheet screens pass their bottom lines along pipes, while three assumption sliders slide below and a dial swings with the valuation.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: netIncome, x: SHEET_X[0] + 19, y: BOTTOM_Y },
    { sprite: cash, x: SHEET_X[1] + 19, y: BOTTOM_Y },
    { sprite: growthKnob, x: PANEL.x + 22, y: PANEL.y + 2, motion: { kind: 'drift', amp: 9, periodMs: 3100 } },
    { sprite: marginKnob, x: PANEL.x + 18, y: PANEL.y + 5, motion: { kind: 'drift', amp: 7, periodMs: 4300, phase: 0.4 } },
    { sprite: rateKnob, x: PANEL.x + 26, y: PANEL.y + 8, motion: { kind: 'drift', amp: 8, periodMs: 3700, phase: 0.7 } },
    { sprite: faGaugeNeedle, x: DIAL.x + FA_DIAL_NEEDLE.x, y: DIAL.y + FA_DIAL_NEEDLE.y },
    faStageLight('model', MAP.x, MAP.y),
    { sprite: faTabletLine, x: ANALYST.x + FA_ANALYST_TABLET.x, y: ANALYST.y + FA_ANALYST_TABLET.y },
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────── */

/**
 * LESSON 5: the three-statement model. Three small pages, green, gold and blue, each filling in
 * header first, then its lines, then its bottom line, which a gold link carries to the next page.
 * It holds, the screen clears.
 */
export const faEmblemStatements: PixelSprite = (() => {
  const full = [
    'NNNN..GGGG..BBBB',
    'nnnn..gggg..bbbb',
    'DDDD..DDDD..DDDD',
    'DxxD..DxDD..DxxD',
    'DDDD..DDDD..DDDD',
    'DxDD..DxxD..DxDD',
    'DDDD..DDDD..DDDD',
    'DxxD..DxDD..DxxD',
    'DDDD..DDDD..DDDD',
    'DNNDyyDGGDyyDBBD',
    'DDDD..DDDD..DDDD',
  ];
  return {
    ...faDrawnBy('fa-emblem-statements', full, (x, y) => {
      const page = Math.floor(x / 6);
      if (x % 6 >= 4) return page * 4 + 3;
      return page * 4 + (y < 2 ? 0 : y < 9 ? 1 : 2);
    }, 220),
    name: 'emblem statements',
    blurb: 'Three statements linked by their bottom lines.',
  };
})();

export const fa5Finish: SceneArt = faKeepsake(
  'fa5-finish',
  'A gold terminal trophy on a purple stand, its screen drawing three small statements, green, gold and blue, linked by gold bottom lines, with small sparkles around it.',
  faEmblemStatements,
);

export const art: LessonArtSet = { opener: fa5Opener, backdrop: faBackdrop, finish: fa5Finish };
