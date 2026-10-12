/**
 * Corporate Finance lesson 22, Executive Compensation & Incentives: pay that only comes when the
 * owners do well too.
 *
 * Opener: the board sets the pay. Three directors sit at the end of the board table under a chart
 * of the share price climbing past a dashed milestone line, a star where it crosses. The CFO stands
 * beside them holding out a gold key to an orchid chest of shares on a plinth: the key only turns,
 * and the chest only opens, once the price has passed the milestone. The return plaque is lit above
 * the chest. Seen from the side of the room this time, the board fills the left and the pay the
 * right. Only small layers move: the chest's lid opening on its glowing shares, the star on the
 * chart, the return sign lighting, a glint on the key.
 *
 * Keepsake: a gold key.
 */
import type { PixelSprite } from '../types';
import { cfBackdrop } from './cf-backdrop';
import { cfKeepsake } from './cf1-finish';
import { CF_PALETTE, cfCompose, cfHall, cfPlaque, cfSconce, cfShadowShort, cfSignReturn } from './cf-kit';
import { cfCfoReach, cfRecolor } from './cf-kit-a';
import { cfBoardTable, cfChairBack, cfDirector } from './cf-kit-b';
import { cfSignReturnDim } from './cf-kit-c';
import type { LessonArtSet, SceneArt } from './types';

/** Two more of the board, recoloured from the one director the way lesson 10 sat them. */
const directorAuburn = cfRecolor(cfDirector, 'cf22-director-auburn', { h: '1', X: '3', B: 'x', b: 'X' }, 'A director with auburn hair in a grey suit.');
const directorBurgundy = cfRecolor(cfDirector, 'cf22-director-burgundy', { h: 'G', X: 'y', B: 'I', b: '1', r: 'x' }, 'A blonde director in a burgundy suit.');

/** The share-price chart on the wall: its frame in scene pixels and the milestone row inside it. */
const CHART = { x: 4, y: 5, w: 31, h: 15, milestone: 6 } as const;
/** The price line's height in each column of the chart: up a pixel every three, with a small dip. */
const priceAt = (x: number) => 11 - Math.floor((x - 3) / 3) + (x % 6 === 4 ? 1 : 0);

/**
 * The chart, static: a gold frame, a dark board, two axes, the dashed milestone line and the price
 * line climbing through it. Computed, not drawn, because the line and the dashes must agree on the
 * one pixel where they cross, which is where the star goes.
 */
const chart: PixelSprite = {
  id: 'cf22-chart',
  name: 'cf22-chart',
  tags: ['scene', 'cf22'],
  blurb: 'A framed chart of a share price climbing past a dashed milestone.',
  palette: CF_PALETTE,
  rows: Array.from({ length: CHART.h }, (_, j) =>
    Array.from({ length: CHART.w }, (_, i) => {
      if (i === 0 || j === 0 || i === CHART.w - 1 || j === CHART.h - 1) return 'O';
      if (j === CHART.h - 2 || i === CHART.w - 2) return 'a';
      if (j === 1 || i === 1) return 'g';
      if (i >= 3 && i <= CHART.w - 4 && j === priceAt(i)) return 'N';
      if (i >= 3 && i <= CHART.w - 4 && j < priceAt(i) && j > priceAt(i + 1)) return 'N';
      if (i === 2 || j === CHART.h - 3) return 'D';
      if (j === CHART.milestone && i >= 3 && i % 3 !== 2) return 'y';
      return 'K';
    }).join(''),
  ),
};
/** Where the price first reaches the milestone: the chart column, then its scene position. */
const CROSS_X = Array.from({ length: CHART.w }, (_, i) => i).find((i) => i >= 3 && priceAt(i) <= CHART.milestone) ?? 18;

/**
 * The chest of shares, in the company's orchid (equity, as lesson 12 coloured it): a domed lid,
 * gold corner bands, a gold padlock on the hasp. Orchid, not walnut, so it stands off the wainscot.
 */
const chest: PixelSprite = {
  id: 'cf22-chest',
  name: 'cf22-chest',
  tags: ['scene', 'cf22'],
  blurb: 'A domed orchid chest with gold bands and a gold padlock.',
  rows: [
    '..EEEEEEEEEEE..',
    '.EqqqqqqqqqqPE.',
    'EGPPPPPPPPPPPgE',
    'EGPPPPPPPPPPPgE',
    'EGpppppppppppgE',
    'EyyyyyOyOyyyyGE',
    'EGPPPPyGgPPPPgE',
    'EGPPPPGKgPPPPgE',
    'EGPPPPgggPPPPgE',
    'EGPPPPPPPPPPPgE',
    'EGPPPPPPPPPPPgE',
    'EGpppppppppppgE',
    'EEEEEEEEEEEEEEE',
  ],
};

/** The plinth the chest stands on, a pixel wider each side. */
const PLINTH_W = 17;
const plinth: PixelSprite = {
  id: 'cf22-plinth',
  name: 'cf22-plinth',
  tags: ['scene', 'cf22'],
  blurb: 'A walnut plinth with a gold top.',
  palette: CF_PALETTE,
  rows: [
    `O${'y'.repeat(PLINTH_W - 3)}GO`,
    'O'.repeat(PLINTH_W),
    `.${'A'.repeat(PLINTH_W - 3)}a.`,
    `.A${'a'.repeat(PLINTH_W - 5)}Aa.`,
    `.${'A'.repeat(PLINTH_W - 3)}a.`,
    `.${'a'.repeat(PLINTH_W - 2)}.`,
  ],
};

/** The key in the CFO's hand: a gold bow and a long shaft whose tip meets the padlock. */
const key: PixelSprite = {
  id: 'cf22-key',
  name: 'cf22-key',
  tags: ['scene', 'cf22'],
  blurb: 'A long gold key.',
  rows: ['OyO.......', 'y.yGGGGGGG', 'OGO....g.g'],
};

const chairBack = cfChairBack('cf22-chair-back', 19);
const table = cfBoardTable('cf22-table', 42);
const CHEST = { x: 64, y: 36 } as const;

const base = cfCompose('cf22-opener-base', cfHall, [
  [chart, CHART.x, CHART.y],
  [cfPlaque, 67, 6],
  [cfSignReturnDim, 69, 8],
  [cfSconce, 49, 17],
  [chairBack, 2, 25],
  [chairBack, 14, 25],
  [chairBack, 26, 25],
  [directorAuburn, 3, 29],
  [cfDirector, 15, 29],
  [directorBurgundy, 27, 29],
  [table, 0, 44],
  [plinth, CHEST.x - 1, CHEST.y + 13],
  [chest, CHEST.x, CHEST.y],
  [cfShadowShort, 46, 56],
  [cfCfoReach, 42, 30],
  [key, 60, 42],
], 'The still boardroom from the side: the price chart, three directors at the table, the CFO with the key, the chest of shares on its plinth.');

/**
 * The chest's lid: shut (nothing over the base), then thrown back on a glow of white share
 * certificates and gold, the padlock hanging open on the hasp, then shut again. Its still is shut.
 */
const SHUT: readonly string[] = Array.from({ length: 10 }, () => '.'.repeat(15));
const OPEN: readonly string[] = [
  '..EEEEEEEEEEE..',
  '.EqqqqqqqqqqPE.',
  'EGpppppppppppgE',
  '...y..w..y..w..',
  '..ywyyyyyyywy..',
  '.ywwxyGyGywwxy.',
  'EwwxwyGyGywwxwE',
  'EwxwwGgGgGwxwwE',
  'EpppppgggpppppE',
  'EyyyyyO.OyyyyGE',
];
const lid: PixelSprite = {
  id: 'cf22-opener-lid',
  name: 'cf22-opener-lid',
  tags: ['scene', 'cf22'],
  blurb: 'The chest lid opening on glowing shares.',
  rows: [...SHUT],
  frames: [SHUT, SHUT, SHUT, OPEN, OPEN, OPEN].map((rows) => [...rows]),
  frameMs: 600,
};

const star: PixelSprite = { id: 'cf22-opener-star', name: 'cf22-opener-star', tags: ['scene', 'cf22'], rows: ['.W.', 'WyW', '.W.'] };
const glint: PixelSprite = { id: 'cf22-opener-glint', name: 'cf22-opener-glint', tags: ['scene', 'cf22'], rows: ['.w.', 'wWw', '.w.'] };

export const cf22Opener: SceneArt = {
  id: 'cf22-opener',
  label: 'Three directors at the board table sit under a chart of the share price climbing past its milestone, while the finance chief holds out a gold key to a locked chest of shares that opens on a glow.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: lid, x: CHEST.x, y: CHEST.y - 4 },
    { sprite: star, x: CHART.x + CROSS_X - 1, y: CHART.y + CHART.milestone - 1, motion: { kind: 'twinkle', periodMs: 1800, min: 0.2 } },
    { sprite: cfSignReturn, x: 69, y: 8, motion: { kind: 'twinkle', periodMs: 3000, min: 0.35 } },
    { sprite: glint, x: 59, y: 41, motion: { kind: 'twinkle', periodMs: 2500, phase: 0.3, min: 0 } },
  ],
};

/** Lesson 22's emblem: a gold key on the diagonal, a white glint on its bow. */
const emblemKey: PixelSprite = {
  id: 'cf22-emblem-key',
  name: 'cf22-emblem-key',
  tags: [],
  blurb: 'A gold key on the diagonal.',
  rows: [
    '...OOOO.........',
    '..OyyyGO........',
    '.OyWOOGgO.......',
    '.OyO..OgO.......',
    '.OGO..OgO.......',
    '.OGgOOggO.......',
    '..OGggggOO......',
    '...OOOOGgOO.....',
    '.......OGgOO....',
    '........OGgOO...',
    '.........OGgOO..',
    '........OOOGgOO.',
    '.......OGgOOGgO.',
    '........OGgOGgO.',
    '.........OOOGgO.',
    '...........OOO..',
  ],
};

export const cf22Finish = cfKeepsake(
  'cf22-finish',
  'A crystal award on a gold stand with a gold key inside, and small sparkles around it.',
  emblemKey,
);

export const art: LessonArtSet = { opener: cf22Opener, backdrop: cfBackdrop, finish: cf22Finish };
