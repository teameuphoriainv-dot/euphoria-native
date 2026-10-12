/**
 * Alternative Investments lesson 10: the capstone, everything since lesson 1 brought together.
 *
 * The opener is the lesson's own framework, the Five Pillars, built in the vault gallery (ai-kit.ts):
 * five columns in the lesson's pillar colours, left to right allocation (orchid), correlation
 * (green), liquidity (blue), rebalancing (amber) and inflation (red). Each capital frames its cue: a
 * pie of the modified endowment mix, two lines moving opposite ways, an hourglass for matching
 * liquidity to the timeline, a balance scale with level pans, a thermometer running hot. Together
 * they hold up a lintel whose frieze carries the eight categories the capstone counts (real estate,
 * private equity, hedge funds, commodities, crypto, collectibles, infrastructure, farmland), so the
 * picture says five principles hold the eight up. Only small layers move: sand runs through the
 * hourglass, the thermometer's bulb glows, the gold glints and motes rise. The keepsake is the
 * capstone's key, its bow set with five gems in the pillar colours, in the gold case (ai-kit-b.ts).
 */
import type { PixelSprite } from '../types';
import { aiBackdrop } from './ai-backdrop';
import { aiCompose, aiGallery, aiGlintGold, aiMoteGold } from './ai-kit';
import { aiKeepsakeGold } from './ai-kit-b';
import { aiLedgeCover } from './ai-kit-c';
import type { LessonArtSet, SceneArt } from './types';

/* ── the frieze: the eight categories, 8x8 each ─────────────────────────────────────────────── */

const mini = (id: string, rows: string[]): PixelSprite => ({ id: `ai10-${id}`, name: `ai10-${id}`, tags: ['scene', 'ai'], rows });

const MINIS: readonly PixelSprite[] = [
  mini('house', ['...EE...', '..EqPE..', '.EqPPPE.', 'EqPPPPPE', '.DxxxXD.', '.DyxOXD.', '.DyxOXD.', '.DDDDDD.']),
  mini('factory', ['DD......', 'xX..x..x', 'xX.bx.bx', 'xXbBxbBx', 'DDDDDDDD', 'DyybyybD', 'DbbbbbbD', 'DDDDDDDD']),
  mini('long-short', ['..N.....', '.NNN....', 'NNNNN...', '..N.....', '.....R..', '...RRRRR', '....RRR.', '.....R..']),
  mini('gold-bars', ['........', '..OOOO..', '..OyyO..', '..OGgO..', 'OOOOOOOO', 'OyyOOyyO', 'OGgOOGgO', 'OOOOOOOO']),
  mini('crypto', ['..tttt..', '.tTTTTt.', 'tTTwwTTt', 'tTTwTwTt', 'tTTwwTTt', 'tTTwTwTt', '.tTwwTt.', '..tttt..']),
  mini('painting', ['GGGGGGGG', 'GBBBByBG', 'GBBBBBBG', 'GBNBBBBG', 'GNNNBNBG', 'GNNNNNNG', 'GnnnnnnG', 'gggggggg']),
  mini('toll-boom', ['.DD.....', 'DRRD....', 'DxxDDDDD', 'DxxRRwwR', 'DxxRRwwR', 'DxxDDDDD', 'DxxD....', 'DDDD....']),
  mini('wheat', ['.y.y.y..', 'yGyGyGy.', 'GgGgGgG.', '.GgGgG..', '..OOO...', '..GgG...', '.GgGgG..', 'Gg.G.gG.']),
];

/** The lintel across the gallery under the cornice: gold mouldings round a dark frieze band. 80x14. */
const lintel: PixelSprite = {
  id: 'ai10-lintel',
  name: 'ai10-lintel',
  tags: ['scene', 'ai'],
  blurb: "A gold lintel across the gallery with a dark frieze band for the eight category emblems.",
  rows: [
    'y'.repeat(80),
    'G'.repeat(80),
    'O'.repeat(80),
    ...Array.from({ length: 8 }, () => 'k'.repeat(80)),
    'O'.repeat(80),
    'G'.repeat(80),
    'g'.repeat(80),
  ],
};

/* ── the five pillars ─────────────────────────────────────────────────────────────────────── */

/**
 * A pillar, 14x34: a gold capital whose panel frames a 10x10 cue at (+2, +3), a fluted shaft in the
 * pillar's colour (outline, highlight, base, flutes, shadow), a gold base.
 */
const pillar = (id: string, shaft: string): PixelSprite => ({
  id: `ai10-${id}`,
  name: `ai10-${id}`,
  tags: ['scene', 'ai'],
  rows: [
    'yyyyyyyyyyyyyG',
    'OOOOOOOOOOOOOO',
    '.yGGGGGGGGGGg.',
    ...Array.from({ length: 10 }, () => '.GKKKKKKKKKKg.'),
    '.gggggggggggO.',
    ...Array.from({ length: 17 }, () => `..${shaft}..`),
    '.yGGGGGGGGGGg.',
    '.GGGGGGGGGGGg.',
    '.OOOOOOOOOOOO.',
  ],
});

/** The lesson's pillar colours (#ae66ed, #10b981, #3b82f6, #f59e0b, #ef4444) on the palette's ramps. */
const PILLARS: readonly PixelSprite[] = [
  pillar('allocation', 'DqPpPPpPpD'),
  pillar('correlation', 'DmNnNNnNnD'),
  pillar('liquidity', 'DwBbBBbBbD'),
  pillar('rebalance', 'DyGgGGgGgD'),
  pillar('inflation', 'DsRrRRrRrD'),
];

/** Pillar 1, allocation: a pie of the modified endowment mix, 35% alternatives (gold), 50% stocks, 15% bonds. */
const pie: PixelSprite = {
  id: 'ai10-pie',
  name: 'ai10-pie',
  tags: ['scene', 'ai'],
  blurb: "A pie: 35% alternatives in gold, 50% stocks in grey, 15% bonds in white.",
  rows: [
    '..........',
    '...wwGG...',
    '..wwwGGG..',
    '.XXwwGGGG.',
    '.XXXwGGGG.',
    '.XXXXXGGG.',
    '.XXXXXXGG.',
    '..XXXXXX..',
    '...XXXX...',
    '..........',
  ],
};

/** Pillar 2, correlation: two lines moving opposite ways, one at its peak where the other is at its trough. */
const waves: PixelSprite = {
  id: 'ai10-waves',
  name: 'ai10-waves',
  tags: ['scene', 'ai'],
  blurb: "Two zig-zag lines out of step: a white one up where a green one is down.",
  rows: [
    '..........',
    '..w...w...',
    '.w.w.w.w.w',
    'w...w...w.',
    '..........',
    '..........',
    'N...N...N.',
    '.N.N.N.N.N',
    '..N...N...',
    '..........',
  ],
};

/** Pillar 3, liquidity: an hourglass, sand running from the top bulb to the bottom one. 7x9. */
const hourglass: PixelSprite = {
  id: 'ai10-hourglass',
  name: 'ai10-hourglass',
  tags: ['scene', 'ai'],
  blurb: "An hourglass with gold sand running through.",
  rows: [
    'OOOOOOO',
    '.x...x.',
    '.xyyyx.',
    '..xGx..',
    '...G...',
    '..xGx..',
    '.x.y.x.',
    '.xGGGx.',
    'OOOOOOO',
  ],
  frames: [
    ['OOOOOOO', '.xyyyx.', '.xGGGx.', '..xGx..', '...G...', '..x.x..', '.x...x.', '.xyGyx.', 'OOOOOOO'],
    ['OOOOOOO', '.x...x.', '.xyyyx.', '..xGx..', '...G...', '..xGx..', '.x.y.x.', '.xGGGx.', 'OOOOOOO'],
    ['OOOOOOO', '.x...x.', '.x...x.', '..xyx..', '...G...', '..x.x..', '.xyyyx.', '.xGGGx.', 'OOOOOOO'],
  ],
  frameMs: 650,
};

/** Pillar 4, rebalancing: a balance scale, its two pans level. */
const scale: PixelSprite = {
  id: 'ai10-scale',
  name: 'ai10-scale',
  tags: ['scene', 'ai'],
  blurb: "A small gold balance scale with level pans.",
  rows: [
    '....yG....',
    '.yyyyGGGg.',
    '.O..Gg..O.',
    '.O..Gg..O.',
    'yyy.Gg.yyy',
    '.O..Gg..O.',
    '....Gg....',
    '....Gg....',
    '..yyGGgg..',
    '..OOOOOO..',
  ],
};

/** Pillar 5, inflation: a thermometer running hot, its red column near the top, ticks on the right. */
const thermometer: PixelSprite = {
  id: 'ai10-thermometer',
  name: 'ai10-thermometer',
  tags: ['scene', 'ai'],
  blurb: "A white thermometer, its red column almost to the top.",
  rows: [
    '....ww....',
    '...wRRw...',
    '...wRRwx..',
    '...wRRw...',
    '...wRRwx..',
    '...wRRw...',
    '...wRRwx..',
    '..wRRRRw..',
    '..wRRRRw..',
    '...wwww...',
  ],
};

/** The bulb's glow, breathing over it. */
const bulbGlow: PixelSprite = { id: 'ai10-bulb-glow', name: 'ai10-bulb-glow', tags: [], rows: ['.ss.', 'sRRs', 'sRRs'] };
/** Each pillar's cast shadow on the floor. */
const shadow: PixelSprite = { id: 'ai10-shadow', name: 'ai10-shadow', tags: [], rows: ['.zzzzzzzzzzzz.', '...zzzzzzzz...'] };

/** The capstone's key: its bow a ring set with five gems, the pillar colours clockwise from the top. */
const fiveGemKey: PixelSprite = {
  id: 'ai10-five-gem-key',
  name: 'ai10-five-gem-key',
  tags: ['scene', 'ai'],
  blurb: "Lesson 10: a gold key whose bow is a ring of five gems, one for each of the Five Pillars.",
  rows: [
    '......OOOO......',
    '....OOyPPGOO....',
    '...OyyyPPGGGO...',
    '..ORRyOOOOGNNO..',
    '..ORRO....ONNO..',
    '.OyyO......OGgO.',
    '.OyyO......OGgO.',
    '..O33O....OBBO..',
    '..O33gOOOOgBBO..',
    '...OggGGGGggO...',
    '....OOgGGgOO....',
    '......OGgO......',
    '......OGgOOO....',
    '......OGgGgO....',
    '......OGgOOO....',
    '......OOOOOO....',
  ],
};

/** The five pillars' left edges: 12 wide with 4 between. Each capital is a pixel wider either side. */
const PILLAR_X = [2, 18, 34, 50, 66] as const;
const PILLAR_Y = 21;
/** Where a pillar's 10x10 cue panel starts. */
const cue = (n: number) => [PILLAR_X[n] + 1, PILLAR_Y + 3] as const;
/** The eight frieze emblems, 8 wide with 2 between. */
const FRIEZE_Y = 10;
const friezeX = (n: number) => 1 + n * 10;

const base = aiCompose('ai10-opener-base', aiGallery.rows, [
  aiLedgeCover,
  [lintel, 0, 7],
  ...MINIS.map((m, n) => [m, friezeX(n), FRIEZE_Y] as const),
  ...PILLARS.map((p, n) => [p, PILLAR_X[n] - 1, PILLAR_Y] as const),
  ...PILLAR_X.map((x) => [shadow, x - 1, PILLAR_Y + 34] as const),
  [pie, ...cue(0)],
  [waves, ...cue(1)],
  [scale, ...cue(3)],
  [thermometer, ...cue(4)],
]);

export const ai10Opener: SceneArt = {
  id: 'ai10-opener',
  label: 'Five gallery columns in orchid, green, blue, amber and red hold up a gold lintel carrying eight small emblems of the alternative categories, their capitals showing a pie chart, two lines moving opposite ways, an hourglass, a level balance scale and a hot thermometer.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: hourglass, x: cue(2)[0] + 1, y: cue(2)[1] },
    { sprite: bulbGlow, x: cue(4)[0] + 3, y: cue(4)[1] + 7, motion: { kind: 'twinkle', periodMs: 2200, min: 0.2 } },
    { sprite: aiGlintGold, x: friezeX(3) + 4, y: FRIEZE_Y - 1, motion: { kind: 'twinkle', periodMs: 1700, min: 0.4 } },
    { sprite: aiMoteGold, x: 15, y: 47, motion: { kind: 'rise', amp: 6, periodMs: 2900, phase: 0.15 } },
    { sprite: aiMoteGold, x: 63, y: 45, motion: { kind: 'rise', amp: 6, periodMs: 3300, phase: 0.6 } },
  ],
};

export const ai10Finish = aiKeepsakeGold(
  'ai10-finish',
  'A gold key whose bow is a ring set with five gems in orchid, green, blue, orange and red, one for each of the Five Pillars, floating in a gilded glass case with a crown on top, with sparkles around it.',
  fiveGemKey,
);

export const art: LessonArtSet = { opener: ai10Opener, backdrop: aiBackdrop, finish: ai10Finish };
