/**
 * The Wealth Management art kit for lessons 2 to 9: the rooms of the house, the far trees, and the
 * pieces more than one of those lessons is furnished from.
 *
 * LESSON 1 STOOD ON THE LAWN; THE ADVISOR'S LESSONS GO INDOORS. So this adds what the study, the
 * library and the drawing room are built from: wallpaper and panelling as grounds for wmCompose,
 * a curtained night window, a bookcase, a candle, the advisor's pointing pose, a line of far tree
 * crowns for the outdoor scenes, and the scales emblem that lesson 8 shares with lesson 16. The
 * rules are wm-kit.ts's: light from the upper left, gold kept to fittings and flames, and only
 * small sprites carry frames.
 *
 * WOOD IS DRAWN IN THE CAST'S WARM TONES. The shared palette has no brown, so panelling, shelves and
 * frames reuse WM_INKS C and U over deep gold O, with K in the joints.
 *
 * NATIVE-OWNED, like everything in src/lib/pixel/scenes (CONSTITUTION 5.5).
 */
import type { PixelSprite } from '../types';
import { wmBands, wmCompose, wmMirror, WM_INKS } from './wm-kit';

/* ── grounds ────────────────────────────────────────────────────────────────────────────────── */

/** Wallpaper: `height` rows of `ground` with a one-pixel `stripe` every `every` columns. */
export function wmStripes(width: number, height: number, ground: string, stripe: string, every: number): string[] {
  const row = Array.from({ length: width }, (_, x) => (x % every === every - 1 ? stripe : ground)).join('');
  return Array.from({ length: height }, () => row);
}

/**
 * Dark mahogany panelling under a dado rail, 11 rows: the rail lit along its top, a run of raised
 * panels 12 wide (lit on the top and left bevels), the skirting. Cut wherever `width` ends.
 */
export function wmWainscot(width: number): string[] {
  const panel = ['OOOOOOOOOOOO', 'OUUUUUUUUUKO', 'OUOOOOOOOOKO', 'OUOOOOOOOOKO', 'OKKKKKKKKKKO', 'OOOOOOOOOOOO'];
  const across = (unit: string) => Array.from({ length: width }, (_, x) => unit[x % unit.length]).join('');
  return ['U'.repeat(width), 'O'.repeat(width), 'K'.repeat(width), ...panel.map(across), 'U'.repeat(width), 'K'.repeat(width)];
}

/**
 * A far line of tree crowns, `height` rows tall. Each crown is [centre, half width, height]: a
 * rounded top in night green (h), lit along its left shoulder (H). Later crowns stand in front of
 * earlier ones; columns no crown reaches stay clear for the sky.
 */
export function wmTreeline(
  id: string,
  width: number,
  height: number,
  crowns: readonly (readonly [number, number, number])[],
): PixelSprite {
  const rows = Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => {
      let ink = '.';
      for (const [centre, half, tall] of crowns) {
        const dx = (x - centre) / half;
        if (Math.abs(dx) > 1) continue;
        const top = height - Math.round(tall * Math.sqrt(1 - dx * dx));
        if (y >= top) ink = x < centre && y < top + 2 ? 'H' : 'h';
      }
      return ink;
    }).join(''),
  );
  return { id, name: id, tags: ['scene', 'wm'], palette: WM_INKS, rows };
}

/* ── the rooms ──────────────────────────────────────────────────────────────────────────────── */

/** The sash: two leaves of panes onto the night, a moon in the top right pane, trees at the foot. 13x22. */
const windowSash: PixelSprite = {
  id: 'wm-window-sash',
  name: 'wm-window-sash',
  tags: ['scene', 'wm'],
  palette: WM_INKS,
  rows: [
    'xxxxxxxxxxxxD',
    'xKKKKKXKKKKKD',
    'xKKKKKXKKxwxD',
    'xKKxKKXKKwwwD',
    'xKKKKKXKKxwxD',
    'xXXXXXXXXXXXD',
    'xKKKKKXKKKKKD',
    'xKKKKKXKKKxKD',
    'xKxKKKXKKKKKD',
    'xKKKKKXKKKKKD',
    'xxxxxxxxxxxxD',
    'XXXXXXXXXXXXD',
    'xKKKKKXKKKKKD',
    'xKKKKKXKKKKKD',
    'xKKKKKXKKKKKD',
    'xKKKKKXKKKKKD',
    'xXXXXXXXXXXXD',
    'xKKKKKXKKKKKD',
    'xKKKKKXKKHKKD',
    'xKHKKKXKHHHKD',
    'xHHHhHXHhhhHD',
    'xhhhhhXhhhhhD',
  ],
};

/** An orchid curtain, gathered at a gold tie-back. The right one is its mirror. 5x22. */
const curtain: PixelSprite = {
  id: 'wm-window-curtain',
  name: 'wm-window-curtain',
  tags: ['scene', 'wm'],
  rows: [
    'EqPpP',
    'EqPpP',
    'EqPpP',
    'EqPpP',
    'EqPpP',
    'EqPp.',
    'EqPp.',
    'EqPp.',
    'EqP..',
    'EqP..',
    'EqP..',
    'yGg..',
    'EqP..',
    'EqPp.',
    'EqPp.',
    'EqPpP',
    'EqPpP',
    'EqPpP',
    'EqPpP',
    'EqPpP',
    'EqPpP',
    'EpppE',
  ],
};

const curtainRod: PixelSprite = {
  id: 'wm-window-rod',
  name: 'wm-window-rod',
  tags: ['scene', 'wm'],
  rows: ['GOOOOOOOOOOOOOOOOOOOG'],
};

const windowSill: PixelSprite = {
  id: 'wm-window-sill',
  name: 'wm-window-sill',
  tags: ['scene', 'wm'],
  rows: ['xxxxxxxxxxxxxxxxx', 'DDDDDDDDDDDDDDDDD'],
};

/**
 * A tall sash window onto the estate at night, curtained in orchid on a brass rod. The panes are
 * the sky's K, so a star layer can twinkle in any of them. 21x25.
 */
export const wmWindow: PixelSprite = wmCompose('wm-window', wmBands(21, [['.', 25]]), [
  { sprite: windowSash, x: 4, y: 1 },
  { sprite: curtain, x: 0, y: 1 },
  { sprite: wmMirror(curtain, 'wm-window-curtain-right'), x: 16, y: 1 },
  { sprite: curtainRod, x: 0, y: 0 },
  { sprite: windowSill, x: 2, y: 23 },
]);

/** A bookcase: a crown, four shelves of spines in the house's inks with a few gilt bands, a cupboard. 16x39. */
export const wmBookcase: PixelSprite = {
  id: 'wm-bookcase',
  name: 'wm-bookcase',
  tags: ['scene', 'wm'],
  palette: WM_INKS,
  rows: [
    'CCCCCCCCCCCCCCCU',
    'UUUUUUUUUUUUUUUO',
    'OOOOOOOOOOOOOOOO',
    'UbbKKnKppKKKEEKO',
    'UbbrrnKppKttEEgO',
    'UGGrrnKppGttEEgO',
    'UbbrrnKppGttEEgO',
    'UbbrrnKppGttGGgO',
    'UbbrrnKppGttEEgO',
    'UCCCCCCCCCCCCCCO',
    'UKKKbIIOOKtKKKEO',
    'UnnKbIIOOptrrKEO',
    'UnnKbIIggptrrKEO',
    'UnnKbIIOOptrrKEO',
    'UnnKbIIOOptrrKEO',
    'UnnKbIIOOptrrKEO',
    'UCCCCCCCCCCCCCCO',
    'UKKKKKKppKttKbbO',
    'UKKKKKKppGttObbO',
    'UKKKKKKppGttObbO',
    'UnnnnKKppGttObbO',
    'UrrrrrKppGttObbO',
    'UbbbbbKppGttObbO',
    'UCCCCCCCCCCCCCCO',
    'UKKpKKKbbKnnKKKO',
    'UEEpKKKbbrnnKIIO',
    'UEEpKggbbrnnKIIO',
    'UEEpKggGGrnnKIIO',
    'UEEpKggbbrnnKIIO',
    'UEEpKggbbrnnKIIO',
    'UCCCCCCCCCCCCCCO',
    'UOOOOOOOOOOOOOOO',
    'UCUUUUUOCUUUUUOO',
    'UCUUUUGOCGUUUUOO',
    'UCUUUUUOCUUUUUOO',
    'UCOOOOOOCOOOOOOO',
    'OOOOOOOOOOOOOOOO',
    'UUUUUUUUUUUUUUUO',
    'KKKKKKKKKKKKKKKK',
  ],
};

/** A candle in a gold stick. Its flame (wmCandleFlame) sits in the three rows above the wick. 4x6. */
export const wmCandle: PixelSprite = {
  id: 'wm-candle',
  name: 'wm-candle',
  tags: ['scene', 'wm'],
  rows: [
    '.k..',
    '.wx.',
    '.wx.',
    '.wx.',
    'yGGg',
    '.Og.',
  ],
};

/** A candle flame, flickering. Layer it one column in from the candle's left, three rows up. 1x3. */
export const wmCandleFlame: PixelSprite = {
  id: 'wm-candle-flame',
  name: 'wm-candle-flame',
  tags: ['scene', 'wm'],
  rows: ['.', 'y', 'G'],
  frames: [
    ['.', 'y', 'G'],
    ['y', 'y', 'G'],
    ['.', 'W', 'y'],
    ['y', 'G', 'G'],
  ],
  frameMs: 280,
};

/* ── people ─────────────────────────────────────────────────────────────────────────────────── */

/**
 * The wealth manager without the briefcase, the left arm raised to point up and to our right: at a
 * chart, at a glass case. Behind a desk only the top ten rows show. 11x13.
 */
export const wmAdvisorPointing: PixelSprite = {
  id: 'wm-advisor-pointing',
  name: 'wm-advisor-pointing',
  tags: ['scene', 'wm'],
  palette: WM_INKS,
  rows: [
    '..kkk......',
    '.kkkkk.....',
    '.kSSSk.....',
    '.SkSkM.....',
    '..SSM....SM',
    '.XwGwX..XX.',
    'XxXGXXXX...',
    'xXXGXX.....',
    'SXXXXD.....',
    '.XXXXD.....',
    '.kk.kk.....',
    '.kk.kk.....',
    '.KK.KK.....',
  ],
};

/* ── keepsake emblems: 14x13, gold, for wmKeepsake (wm1-finish.ts) ──────────────────────────── */

/** A balance: tax optimisation and fair dealing (lessons 8 and 16). */
export const wmEmblemScales: PixelSprite = {
  id: 'wm-emblem-scales',
  name: 'wm-emblem-scales',
  tags: ['scene', 'wm'],
  rows: [
    '......yG......',
    '.yyGGGGGGGGgg.',
    '..G...Gg...g..',
    '.y.g..Gg..y.g.',
    'y...g.Gg.y...g',
    'yGGGg.Gg.yGGGg',
    '.ggg..Gg..ggg.',
    '......Gg......',
    '......Gg......',
    '......Gg......',
    '....yGGGgg....',
    '...yGGGGGgg...',
    '..OOOOOOOOOO..',
  ],
};
