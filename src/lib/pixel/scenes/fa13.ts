/**
 * Financial Analytics lesson 13, credit scoring: five weighted factors, one score, a decision.
 *
 * OPENER. The loan office: a client sits across the desk from the analyst, their card standing in
 * the reader between them. On the wall the lesson's model runs left to right. The factor board
 * grows the five FICO factors as bars sized by their weights (payment history, amounts owed,
 * length of history, new credit, credit mix), a pipe carries them into the score dial, and the
 * dial lights its bands red, orange, gold and green before the needle lands in the green. The
 * reader's light blinks green, and the map lights MODEL.
 *
 * KEEPSAKE. The trophy with the score dial: its bands lighting in turn, the needle in the green.
 */
import { faBackdrop } from './fa-backdrop';
import { faCompose, faConduit, faPacketRun, faPipelineMap, faTwinkleSmall } from './fa-kit';
import { faDesk, faDrawnBy, faKeepsake, faMonitor, faRoom, faStageLight, FA_MONITOR_GLASS } from './fa-kit-a';
import { faAtDesk, faBlank, faLine, faRowsOf, faSeatedBack, FA_CAST_ANALYST, FA_CAST_CLIENT } from './fa-kit-b';
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';

/* ── dials ─────────────────────────────────────────────────────────────────────────────────── */

/**
 * The pixels of a half-ring around (cx, cy), measured in pixel edges, between radii `rIn` and
 * `rOut`, each with `t`: 0 at the ring's left end to 1 at its right, the way a score reads.
 */
function halfRing(w: number, h: number, cx: number, cy: number, rOut: number, rIn: number): [number, number, number][] {
  const out: [number, number, number][] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x + 0.5 - cx;
      const dy = cy - (y + 0.5);
      const r = Math.hypot(dx, dy);
      if (dy > 0 && r <= rOut && r >= rIn) out.push([x, y, 1 - Math.atan2(dy, dx) / Math.PI]);
    }
  }
  return out;
}

/** Poor, fair, good, very good and up: where each band ends along the dial. */
const BANDS = [[0.36, 'R'], [0.52, '3'], [0.68, 'G'], [Infinity, 'N']] as const;
const bandOf = (t: number) => BANDS.findIndex(([until]) => t < until);
/** The score the needle lands on: well into the green. */
const SCORE = 0.84;

/**
 * A score dial `w` x `h` that lights band by band, then drops its needle (2px thick when `bold`)
 * from the pivot at the bottom centre: the reveal only adds, then holds, then clears.
 */
function scoreDial(id: string, w: number, h: number, rOut: number, rIn: number, needle: number, bold: boolean, frameMs: number): PixelSprite {
  const grid = faBlank(w, h);
  const step = new Map<string, number>();
  const put = (x: number, y: number, ink: string, at: number) => {
    grid[y][x] = ink;
    step.set(`${String(x)},${String(y)}`, at);
  };
  for (const [x, y, t] of halfRing(w, h, w / 2, h, rOut, rIn)) {
    const band = bandOf(t);
    put(x, y, BANDS[band][1], band);
  }
  const angle = (1 - SCORE) * Math.PI;
  const [px, py] = [w / 2, h - 2];
  const tip = [Math.round(px + needle * Math.cos(angle)), Math.round(py - needle * Math.sin(angle))] as const;
  for (const [x, y] of faLine(px, py, tip[0], tip[1])) {
    put(x, y, 'w', 4);
    if (bold && y > 0) put(x, y - 1, 'w', 4);
  }
  for (const [x, y] of [[px - 1, h - 1], [px, h - 1], [px - 1, h - 2]] as const) put(x, y, 'x', 4);
  return faDrawnBy(id, faRowsOf(grid), (x, y) => step.get(`${String(x)},${String(y)}`) ?? 0, frameMs, 5);
}

/* ── the office ────────────────────────────────────────────────────────────────────────────── */

const MAP = { x: 40, y: 1 } as const;
const FACTORS = { x: 4, y: 7 } as const;
const GAUGE = { x: 42, y: 9 } as const;
const DESK = { x: 36, y: 41 } as const;
const ANALYST = { x: 52, y: 27 } as const;
const CLIENT = { x: 33, y: 34 } as const;
const READER = { x: 65, y: 34 } as const;
const LINK = { x: 33, y: 15, length: 10 } as const;

/** The five factors' weights (35, 30, 15, 10 and 10 per cent) as bar lengths, and their inks. */
const FACTOR_BARS = [[21, 'N', 'n'], [18, 'G', 'g'], [9, 'T', 't'], [6, 'B', 'b'], [6, 'q', 'p']] as const;

/** The factor bars growing from their labels, all at one pace, so the heavy ones run longest. */
const factorBars: PixelSprite = (() => {
  const grid = faBlank(24, 14);
  FACTOR_BARS.forEach(([len, lit, dark], k) => {
    for (let x = 3; x < 3 + len; x++) {
      grid[k * 3][x] = lit;
      grid[k * 3 + 1][x] = dark;
    }
  });
  return faDrawnBy('fa13-factor-bars', faRowsOf(grid), (x) => Math.floor((x - 3) / 2), 220, 6);
})();

/** The board's labels, a grey stub at the head of each bar. */
const factorLabels: PixelSprite = {
  id: 'fa13-factor-labels',
  name: 'factor labels',
  tags: ['scene', 'fa13'],
  rows: Array.from({ length: 14 }, (_, y) => (y % 3 === 2 ? '..' : 'xX')),
};

/** A card reader on the desk, the client's gold card standing in its slot. */
const reader: PixelSprite = {
  id: 'fa13-reader',
  name: 'card reader',
  tags: ['scene', 'fa13', 'prop'],
  rows: ['..GGG..', '..GyG..', '.DDDDD.', 'DxXXXkD', 'DxKKKkD', 'DxXXXkD', 'DxXXXkD', 'DDDDDDD'],
};
const approved: PixelSprite = { id: 'fa13-approved', name: 'approved', tags: ['scene', 'fa13'], rows: ['NNN'] };

const room = faRoom('fa13-opener-room', [
  [DESK.x + 2, 50, 38, 1, 'Z'],
  [CLIENT.x + 3, 58, 11, 2, 'Z'],
]);

const base = faCompose('fa13-opener-base', room, [
  [faPipelineMap, MAP.x, MAP.y],
  [faMonitor('fa13-factors', 30, 20), FACTORS.x, FACTORS.y],
  [factorLabels, FACTORS.x + FA_MONITOR_GLASS.x, FACTORS.y + FA_MONITOR_GLASS.y],
  [faConduit('fa13-link', LINK.length, 5), LINK.x, LINK.y],
  [faMonitor('fa13-gauge', 30, 18), GAUGE.x, GAUGE.y],
  [faDesk('fa13-desk', 40), DESK.x, DESK.y],
  [faAtDesk('fa13-analyst', FA_CAST_ANALYST), ANALYST.x, ANALYST.y],
  [reader, READER.x, READER.y],
  [faSeatedBack('fa13-client', FA_CAST_CLIENT), CLIENT.x, CLIENT.y],
]);

export const fa13Opener: SceneArt = {
  id: 'fa13-opener',
  label: 'A loan office in the data works: a client sits across the desk from the analyst while a wall board grows five weighted credit factors that feed a big score dial, red through gold to green, its needle landing in the green.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: factorBars, x: FACTORS.x + FA_MONITOR_GLASS.x, y: FACTORS.y + FA_MONITOR_GLASS.y },
    { sprite: faPacketRun('fa13-link-packets', LINK.length - 2, [[Infinity, 'q']], 5, 200), x: LINK.x + 1, y: LINK.y + 2 },
    { sprite: scoreDial('fa13-dial', 24, 12, 11.5, 8.5, 8.5, false, 400), x: GAUGE.x + FA_MONITOR_GLASS.x, y: GAUGE.y + FA_MONITOR_GLASS.y },
    { sprite: approved, x: READER.x + 2, y: READER.y + 4, motion: { kind: 'twinkle', periodMs: 1100, min: 0.2 } },
    { sprite: faTwinkleSmall, x: READER.x + 2, y: READER.y - 3, motion: { kind: 'twinkle', periodMs: 1700, phase: 0.3, min: 0.4 } },
    faStageLight('model', MAP.x, MAP.y),
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────── */

/**
 * LESSON 13: credit scoring. The score dial: red, orange, gold and green bands light in turn, a
 * bold white needle drops into the green, it holds, the screen clears.
 */
export const faEmblemScore: PixelSprite = (() => {
  // Drawn one row short and padded underneath, so the dial sits in the middle of the screen.
  const dial = scoreDial('fa-emblem-score', 16, 10, 8, 5.2, 6, true, 360);
  const pad = (rows: readonly string[]) => [...rows, '.'.repeat(16)];
  return {
    ...dial,
    name: 'emblem score',
    tags: ['scene', 'fa', 'emblem'],
    blurb: 'A credit score dial, its needle in the green.',
    rows: pad(dial.rows),
    frames: (dial.frames ?? []).map(pad),
  };
})();

export const fa13Finish: SceneArt = faKeepsake(
  'fa13-finish',
  'A gold terminal trophy on a purple stand, its screen lighting a score dial from red through orange and gold to green, a white needle pointing into the green, with small sparkles around it.',
  faEmblemScore,
);

export const art: LessonArtSet = { opener: fa13Opener, backdrop: faBackdrop, finish: fa13Finish };
