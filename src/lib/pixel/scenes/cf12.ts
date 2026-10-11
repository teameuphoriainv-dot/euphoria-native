/**
 * Corporate Finance lesson 12, Cost of Capital & WACC: the blended price of the company's money,
 * and the hurdle every project has to clear.
 *
 * Opener: on the left the gold balance scale weighs the mix, a tall stack of orchid equity coins
 * (60 per cent) against a shorter stack of blue debt coins (40), with the same split as a pie on
 * the wall above. On the right stands a hurdle whose bar is striped in those two colours, the
 * weighted average set as a height, and a sprouting project takes a run at it and leaps over.
 * Only small layers move: the beam and its pans, the jumping project, the finance sign lighting,
 * a glint on the bar, a puff of dust where the project lands.
 *
 * Keepsake: a sprouting project arcing over a striped hurdle.
 */
import type { PixelSprite } from '../types';
import { cfBackdrop } from './cf-backdrop';
import { cfKeepsake } from './cf1-finish';
import { CF_PALETTE, cfCompose, cfHall, cfPlaque, cfShadowLong, cfShadowShort, cfSignFinance, cfSignInvest } from './cf-kit';
import { cfRecolor, cfScaleBeam, cfScaleStand } from './cf-kit-a';
import type { LessonArtSet, SceneArt } from './types';

/** Equity: six orchid coins, the 60 per cent. */
const panEquity: readonly string[] = [
  '.EqqqqqE.',
  '.EPPPPpE.',
  '.EpppppE.',
  '.EPPPPpE.',
  '.EpppppE.',
  '.EPPPPpE.',
  '.EpppppE.',
  '.EEEEEEE.',
];

/** Debt: four blue coins, the 40 per cent. */
const panDebt: readonly string[] = [
  '.CBBBBBC.',
  '.CbbbbbC.',
  '.CcccccC.',
  '.CbbbbbC.',
  '.CcccccC.',
  '.CCCCCCC.',
];

/** The beam carries glass navy on the debt stack, so it takes the kit palette. */
const scaleBeam: PixelSprite = { ...cfScaleBeam('cf12-opener-scale-beam', panEquity, panDebt), palette: CF_PALETTE };

const PIE = { size: 11, radius2: 30, equityDegrees: 216 } as const;

/**
 * The 60/40 mix as a framed pie: orchid equity from twelve o'clock round to 216 degrees, blue debt
 * for the rest. Computed, not drawn: a hand-typed wedge is where 60 per cent quietly becomes 55.
 */
const pieFrame: PixelSprite = {
  id: 'cf12-pie',
  name: 'cf12-pie',
  tags: ['scene', 'cf12'],
  blurb: 'A framed pie chart, orchid and blue.',
  rows: [
    `.${'O'.repeat(13)}.`,
    `O${'g'.repeat(13)}O`,
    ...Array.from({ length: PIE.size }, (_, y) => {
      const face = Array.from({ length: PIE.size }, (_, x) => {
        const dx = x - 5;
        const dy = y - 5;
        if (dx * dx + dy * dy > PIE.radius2) return 'K';
        const degrees = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
        if (degrees < PIE.equityDegrees) return dx + dy > 3 ? 'p' : 'P';
        return dx + dy > 3 ? 'b' : 'B';
      }).join('');
      return `Og${face}aO`;
    }),
    `O${'a'.repeat(13)}O`,
    `.${'O'.repeat(13)}.`,
  ],
};

/** The hurdle: two gold posts, the bar striped in the mix's two colours. */
const hurdle: PixelSprite = {
  id: 'cf12-hurdle',
  name: 'cf12-hurdle',
  tags: ['scene', 'cf12'],
  blurb: 'A gold hurdle with an orchid and blue striped bar.',
  rows: [
    'OO.............OO',
    'Gg.............Gg',
    'GgPPPBBBPPPBBBPGg',
    'GgpppbbbpppbbbpGg',
    ...Array.from({ length: 11 }, () => 'Gg.............Gg'),
    'OOOO.........OOOO',
  ],
};

/** The finance sign dimmed, for the base; the lit sign above it is a layer. */
const signFinanceDim = cfRecolor(cfSignFinance, 'cf12-sign-finance-dim', { B: 'b' });

const base = cfCompose('cf12-opener-base', cfHall, [
  [pieFrame, 10, 4],
  [cfPlaque, 66, 6],
  [signFinanceDim, 68, 8],
  [cfShadowLong, 4, 57],
  [cfScaleStand, 8, 27],
  [cfShadowShort, 50, 57],
  [hurdle, 47, 41],
], 'The still room: the pie of the mix, the finance plaque, the scale stand, the hurdle.');

const JUMP = { w: 33, h: 29, ground: 22, apex: 2, land: 26 } as const;

/** One frame of the jump: the project's pot with its top-left at (x, y) in the jump's box, or none. */
function jumpFrame(x: number | null, y: number): string[] {
  const grid = Array.from({ length: JUMP.h }, () => Array.from({ length: JUMP.w }, () => '.'));
  if (x !== null) {
    cfSignInvest.rows.forEach((row, j) => {
      [...row].forEach((ch, i) => {
        const line = grid[y + j];
        if (line && ch !== '.') line[x + i] = ch;
      });
    });
  }
  return grid.map((row) => row.join(''));
}

/**
 * The project's leap: a parabola from the run-up to the landing, clear of the bar at its height.
 * Computed, so the arc is one curve and not nine guesses. It waits at the start, flies, lands,
 * holds, and is gone a beat before the next project lines up. Its still waits at the start.
 */
const arc = Array.from({ length: 9 }, (_, i) => {
  const t = i / 8;
  return jumpFrame(Math.round(JUMP.land * t), Math.round(JUMP.ground - 4 * (JUMP.ground - JUMP.apex) * t * (1 - t)));
});
const jump: PixelSprite = {
  id: 'cf12-opener-jump',
  name: 'cf12-opener-jump',
  tags: ['scene', 'cf12'],
  blurb: 'A potted sprout leaping a hurdle.',
  rows: jumpFrame(0, JUMP.ground),
  frames: [jumpFrame(0, JUMP.ground), ...arc, jumpFrame(JUMP.land, JUMP.ground), jumpFrame(JUMP.land, JUMP.ground), jumpFrame(null, 0)],
  frameMs: 170,
};

const glint: PixelSprite = { id: 'cf12-opener-glint', name: 'cf12-opener-glint', tags: ['scene', 'cf12'], rows: ['.w.', 'wWw', '.w.'] };
const dust: PixelSprite = { id: 'cf12-opener-dust', name: 'cf12-opener-dust', tags: ['scene', 'cf12'], rows: ['x.....x', '.X...X.'] };

export const cf12Opener: SceneArt = {
  id: 'cf12-opener',
  label: 'A gold scale weighs a tall stack of orchid equity coins against a shorter stack of blue debt coins, while a sprouting project leaps a hurdle whose bar is striped in the same two colours.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: scaleBeam, x: 1, y: 23 },
    { sprite: jump, x: 39, y: 28 },
    { sprite: cfSignFinance, x: 68, y: 8, motion: { kind: 'twinkle', periodMs: 3200, min: 0.4 } },
    { sprite: glint, x: 54, y: 41, motion: { kind: 'twinkle', periodMs: 2210, min: 0 } },
    { sprite: dust, x: 65, y: 55, motion: { kind: 'twinkle', periodMs: 2210, phase: 0.6, min: 0 } },
  ],
};

/** Lesson 12's emblem: a sprouting project arcing over a hurdle striped orchid and blue. */
const emblemHurdle: PixelSprite = {
  id: 'cf12-emblem-hurdle',
  name: 'cf12-emblem-hurdle',
  tags: [],
  blurb: 'A potted sprout leaping a gold hurdle with an orchid and blue bar.',
  rows: [
    '................',
    '......m.N.......',
    '......mNN.......',
    '.......n........',
    '.....OgggO......',
    '......OOO.......',
    '...y........y...',
    '................',
    '.y............y.',
    'OO............OO',
    'GgPPPBBBPPPBBBGg',
    'GgpppbbbpppbbbGg',
    'Gg............Gg',
    'Gg............Gg',
    'Gg............Gg',
    'OOOO........OOOO',
  ],
};

export const cf12Finish = cfKeepsake(
  'cf12-finish',
  'A crystal award on a gold stand with a sprouting project leaping a striped hurdle inside, and small sparkles around it.',
  emblemHurdle,
);

export const art: LessonArtSet = { opener: cf12Opener, backdrop: cfBackdrop, finish: cf12Finish };
