/**
 * Wealth Management lesson 18 (alternative investments for HNW clients): its opener, the pathway
 * backdrop and its keepsake, as one set loaded on demand.
 *
 * The opener is a private viewing room at night: orchid walls, three spotlights, and on three marble
 * plinths behind a red velvet rope the assets the lesson adds beyond stocks and bonds. A pile of gold
 * bars stands for real assets, a model rocket for venture capital, and an iron-bound strongbox under
 * a padlock for private equity, whose money is locked away for years (the illiquidity premium is
 * what that lock is paid). The rope is the accredited-investor rule. The advisor, drawn large from
 * wm-kit-c.ts, shows the father along the plinths. What moves: the spotlights breathe, a glint
 * crosses the gold, the rocket hovers on a flickering flame, the padlock glints. The keepsake
 * carries a cut gem.
 */
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';
import { wmBackdrop } from './wm-backdrop';
import { wmBands, wmCompose, WM_INKS } from './wm-kit';
import { wmAdvisorTall, wmParentTall, wmRepose } from './wm-kit-c';
import { wmKeepsake } from './wm1-finish';

/** Each plinth's left edge (they are 11 wide); its spotlight, cone and exhibit are placed from it. */
const PLINTHS = [18, 35, 52] as const;
const PLINTH_TOP = 34;

/** The rope's posts, left edges (5 wide), standing on the floor in front of the plinths. */
const POSTS = [13, 38, 63] as const;
const POST_TOP = 46;

/** A ceiling spotlight: a can on a short stem, its lens at the bottom. 5x4. */
const spotlight: PixelSprite = {
  id: 'wm18-opener-spotlight',
  name: 'wm18-opener-spotlight',
  tags: ['scene', 'wm18'],
  rows: ['..D..', '.DXD.', 'DXxXD', 'gGyGg'],
};

/** A marble plinth: a lit top slab, a fluted shaft with a brass label, a base slab. 11x14. */
const plinth: PixelSprite = {
  id: 'wm18-opener-plinth',
  name: 'wm18-opener-plinth',
  tags: ['scene', 'wm18'],
  rows: [
    'xwwwwwwwwwX',
    'DxxxxxxxxxD',
    '.DDDDDDDDD.',
    '.wxxxxxxXD.',
    '.wxxgGgxXD.',
    ...Array.from({ length: 7 }, () => '.wxxxxxxXD.'),
    'xwwwwwwwwwX',
    'DXXXXXXXXXD',
  ],
};

/** A brass stanchion: a ball finial the rope hooks to, a shaft, a round foot. 5x12. */
const post: PixelSprite = {
  id: 'wm18-opener-post',
  name: 'wm18-opener-post',
  tags: ['scene', 'wm18'],
  rows: ['.yGg.', '.gOO.', ...Array.from({ length: 7 }, () => '..Gg.'), '.yGGg', 'yGGGg', 'KOOOK'],
};

/** Red velvet slung between two posts, `width` wide, sagging `sag` at its middle. */
function rope(id: string, width: number, sag: number): PixelSprite {
  const rows = wmBands(width, [['.', sag + 2]]).map((row) => [...row]);
  for (let x = 0; x < width; x += 1) {
    const t = ((x + 0.5) / width) * 2 - 1;
    const y = Math.round(sag * (1 - t * t));
    rows[y][x] = 'R';
    rows[y + 1][x] = 'r';
  }
  return { id, name: id, tags: ['scene', 'wm18'], rows: rows.map((row) => row.join('')) };
}

/** The advisor with his right arm up, pointing the father along the plinths. 14x23. */
const advisorPointing = wmRepose(wmAdvisorTall, 'wm18-opener-advisor-pointing', {
  5: '..SSSSSSM....S',
  6: '...SSSSM....SM',
  7: '....SSM....xD.',
  8: '...XwGwX..xD..',
  9: '.xxXwGwXXxD...',
  10: 'xxDXXGXXDD....',
  11: 'xxDXXGXXD.....',
  12: 'xxDXXGXXD.....',
  13: 'xxDXXXXXD.....',
  14: 'xxDXXXXXD.....',
  15: 'SSDXXXXXD.....',
  16: '..DXXXXXD.....',
  17: '..kkk.kkk.....',
  18: '..kkk.kkk.....',
  19: '..kkk.kkk.....',
  20: '..kkk.kkk.....',
  21: '..kkk.kkk.....',
});

const base = wmCompose('wm18-opener-base', [
  ...wmBands(80, [['K', 2], ['D', 1], ['k', 1], ['E', 3], ['O', 1], ['E', 36], ['K', 1], ['k', 1]]),
  ...wmBands(80, [['O', 2], ['U', 1], ['O', 3], ['U', 1], ['O', 4], ['U', 1], ['O', 2]]),
], [
  ...PLINTHS.map((x) => ({ sprite: spotlight, x: x + 3, y: 3 })),
  ...PLINTHS.map((x) => ({ sprite: plinth, x, y: PLINTH_TOP })),
  ...POSTS.map((x) => ({ sprite: post, x, y: POST_TOP })),
  { sprite: rope('wm18-opener-rope-left', POSTS[1] - POSTS[0] - 5, 3), x: POSTS[0] + 5, y: POST_TOP + 1 },
  { sprite: rope('wm18-opener-rope-right', POSTS[2] - POSTS[1] - 5, 3), x: POSTS[1] + 5, y: POST_TOP + 1 },
  { sprite: advisorPointing, x: 0, y: 35 },
  { sprite: wmParentTall, x: 68, y: 35 },
]);

/* ── the light and the exhibits: layers, so each exhibit stands in front of its beam ─────────── */

/** A spotlight's beam on the wall, from the lens to the plinth top, widening. 13x27. */
const CONE_H = 27;
const cone: PixelSprite = {
  id: 'wm18-opener-cone',
  name: 'wm18-opener-cone',
  tags: ['scene', 'wm18'],
  rows: Array.from({ length: CONE_H }, (_, j) => {
    const half = 1 + Math.floor((j * 5) / (CONE_H - 1));
    return Array.from({ length: 13 }, (_, x) => (Math.abs(x - 6) <= half ? 'p' : '.')).join('');
  }),
};

/** Real assets: three gold bars, two on the plinth and one across them. 10x6. */
const GOLD = [
  '...yyGg...',
  '..yGGGGg..',
  '..gggggO..',
  '.yyGg.yyGg',
  'yGGGgyGGGg',
  'ggggOggggO',
];
const GLINT_PATH: readonly (readonly [number, number])[] = [
  [3, 0], [4, 0], [5, 0], [6, 0], [1, 3], [2, 3], [3, 3], [6, 3], [7, 3], [8, 3],
];
const glintOn = ([x, y]: readonly [number, number]) =>
  GOLD.map((row, j) => (j === y ? `${row.slice(0, x)}W${row.slice(x + 1)}` : row));
const goldBars: PixelSprite = {
  id: 'wm18-opener-gold-bars',
  name: 'wm18-opener-gold-bars',
  tags: ['scene', 'wm18'],
  blurb: 'A glint crossing the gold bars: real assets.',
  rows: GOLD,
  frames: [...GLINT_PATH.map(glintOn), ...Array.from({ length: 10 }, () => GOLD)],
  frameMs: 110,
};

/** Venture capital: a white model rocket with red fins, hovering on its flame. 7x16. */
const ROCKET = [
  '...R...',
  '..sRr..',
  '..RRr..',
  '.xwwwX.',
  '.wwwwX.',
  '.wBbwX.',
  '.wbbwX.',
  '.wwwwX.',
  '.wwwwX.',
  '.wwwxX.',
  'RwwwxXr',
  'RRwwxrr',
  'RR.D.rr',
];
const FLAMES = [
  ['..454..', '...4...', '...3...'],
  ['..555..', '..444..', '...3...'],
  ['..454..', '..434..', '..3.3..'],
  ['...5...', '..444..', '...4...'],
];
const rocket: PixelSprite = {
  id: 'wm18-opener-rocket',
  name: 'wm18-opener-rocket',
  tags: ['scene', 'wm18'],
  blurb: 'A model rocket hovering over its plinth: venture capital.',
  rows: [...ROCKET, ...FLAMES[0]],
  frames: FLAMES.map((flame) => [...ROCKET, ...flame]),
  frameMs: 140,
};

/** Private equity: an iron-bound strongbox shut under a gold padlock. 10x9. */
const strongbox: PixelSprite = {
  id: 'wm18-opener-strongbox',
  name: 'wm18-opener-strongbox',
  tags: ['scene', 'wm18'],
  palette: WM_INKS,
  rows: [
    '.DXXXXXXD.',
    'DCCCCCCCUD',
    'DCCCyGCCUD',
    'DXXyXXgXXD',
    'DCCyGGgCUD',
    'DCCGOOgCUD',
    'DCCgggOCUD',
    'DUUUUUUUUD',
    'DDDDDDDDDD',
  ],
};

const glint: PixelSprite = {
  id: 'wm18-opener-glint',
  name: 'wm18-opener-glint',
  tags: ['scene', 'wm18'],
  rows: ['W'],
};

export const wm18Opener: SceneArt = {
  id: 'wm18-opener',
  label: 'An advisor shows a father three marble plinths behind a velvet rope under spotlights: a pile of gold bars, a model rocket hovering on its flame, and a padlocked strongbox.',
  width: 80,
  height: 60,
  base,
  layers: [
    ...PLINTHS.map((x, i) => ({
      sprite: cone,
      x: x - 1,
      y: 7,
      motion: { kind: 'twinkle' as const, periodMs: 3600 + 500 * i, min: 0.45, phase: 0.33 * i },
    })),
    { sprite: goldBars, x: PLINTHS[0] + 1, y: PLINTH_TOP - 6 },
    { sprite: rocket, x: PLINTHS[1] + 2, y: PLINTH_TOP - 16, motion: { kind: 'bob', amp: 2, periodMs: 2400 } },
    { sprite: strongbox, x: PLINTHS[2] + 1, y: PLINTH_TOP - 9 },
    { sprite: glint, x: PLINTHS[2] + 5, y: PLINTH_TOP - 7, motion: { kind: 'twinkle', periodMs: 1700, min: 0 } },
  ],
};

/** A cut gem: an alternative asset, rare and kept. */
const emblemGem: PixelSprite = {
  id: 'wm18-emblem-gem',
  name: 'wm18-emblem-gem',
  tags: ['scene', 'wm18'],
  rows: [
    '...yyyGGGg...',
    '..yywyGGgGg..',
    '.yyGGyGgGGgg.',
    'yyGGGyGgGGggO',
    'OgggggggggggO',
    '.yGGGyGgGggO.',
    '..yGGyGgGgO..',
    '...yGyGgGO...',
    '....yyGgO....',
    '.....yGO.....',
    '......O......',
  ],
};

export const wm18Finish: SceneArt = wmKeepsake(
  'wm18-finish',
  emblemGem,
  'A green crest with a gold rim bearing a cut gem, framed by laurel over a purple banner, with sparkles around it.',
);

export const art: LessonArtSet = { opener: wm18Opener, backdrop: wmBackdrop, finish: wm18Finish };
