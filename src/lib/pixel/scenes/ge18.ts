/**
 * Global Economics lesson 18: the economics of climate change, on the terraces at dawn.
 *
 * The sun comes up over the energy transition. On the shore terrace an old plant's red and white
 * chimney still puffs dark smoke into everyone's sky, a cost nobody paid for at the till (the
 * externality a carbon price puts back on the bill); up the hill, solar panels catch the first light
 * and two wind turbines turn, the investment that is replacing it. Only small layers move: the two
 * rotors, the smoke, the glints on the panels, the sun on the water and two gulls.
 *
 * The keepsake's emblem is a wind turbine turning on a green hill.
 */
import type { PixelSprite } from '../types';
import { geBackdrop } from './ge-backdrop';
import { GE_PALETTE, geCompose, geGull, geLater, geShimmer, geSmoke, geTint } from './ge-kit';
import { geGroundDawn } from './ge-kit-a';
import { geKeepsake } from './ge1-finish';
import type { LessonArtSet, SceneArt } from './types';

/* ── one-off props ──────────────────────────────────────────────────────────────────────────── */

/**
 * Everything standing on the terraces: the plant's shed and chimney on the shore terrace, three
 * solar panels on the second, the big turbine's tower on the third and the far one's on the top.
 */
const works: PixelSprite = {
  id: 'ge18-opener-works',
  name: 'chimney, panels and turbine towers',
  tags: ['ge18', 'prop'],
  blurb: 'An old shed with a red and white chimney, three solar panels on legs and two white turbine towers.',
  palette: GE_PALETTE,
  rows: [
    '........................................................................zzx',
    '........................................................................xxD',
    '...........................................................................',
    '.....................................................zzzx..............zx..',
    '.....................................................xxxD..............zx..',
    '.......................................................................zx..',
    '.DDDDD.............................................zx..................zx..',
    '.DRr1D.............................................zx..................zx..',
    '..Rr1..............................................zx..................zx..',
    '..Rr1..............................................zx..................zx..',
    '..zxX..............................................zx..................zx..',
    '..zxX..............................................zx..................zx..',
    '..zxX..............................................zx..................zx..',
    '..Rr1..............................................zx..................zx..',
    '..Rr1..............................................zx..................zx..',
    '..Rr1..............................................zx..................zx..',
    '..zxX..............................................zx..................zx..',
    '..zxX..............................................zx..................zx..',
    '..zxX..............................................zx..................zx..',
    '..Rr1..............................................zx..................zx..',
    '..Rr1..............................................zx.................XXXX.',
    '..Rr1..............................................zx......................',
    '..zxX..............................................zx......................',
    '..zxX..............................................zx......................',
    '..zxX..............................................zx......................',
    '..Rr1..............................................zx......................',
    '..Rr1.............................................XXXX.....................',
    '..Rr1......................................................................',
    '..zxX.....................DDDDD.DDDDD.DDDDD................................',
    '..zxX....................DBbBbDDBbBbDDBbBbD................................',
    '..zxX....................DbhbhDDbhbhDDbhbhD................................',
    'DDDDDDDDDDDD.............DDDDD.DDDDD.DDDDD.................................',
    'XXXXXXXXXXXD..............D..D..D..D..D..D.................................',
    'XXXXXXXXXXXD...............................................................',
    'XOOXXOOXOOXD...............................................................',
    'XggXXggXggXD...............................................................',
    'XXXXXDDXXXXD...............................................................',
    'XXXXXDDXXXXD...............................................................',
    'DDDDDDDDDDDD...............................................................',
  ],
};

/** The big turbine's blades, 19x19, a quarter of a third of a turn each frame: four frames loop without a seam. */
const rotorBig: PixelSprite = {
  id: 'ge18-opener-rotor-big',
  name: 'turbine blades',
  tags: ['ge18', 'animated'],
  blurb: 'Three white turbine blades turning round their hub.',
  palette: GE_PALETTE,
  rows: [
    '.........z.........',
    '.........z.........',
    '.........z.........',
    '.........z.........',
    '.........zx........',
    '.........zx........',
    '.........zx........',
    '.........zx........',
    '........xXx........',
    '......xxXD.........',
    '.....xxzzxzz.......',
    '....xzz...xxzz.....',
    '...zzz......xzzz...',
    '.zzz...........zzz.',
    '.z...............z.',
    '...................',
    '...................',
    '...................',
    '...................',
  ],
  frames: [
    [
      '.........z.........',
      '.........z.........',
      '.........z.........',
      '.........z.........',
      '.........zx........',
      '.........zx........',
      '.........zx........',
      '.........zx........',
      '........xXx........',
      '......xxXD.........',
      '.....xxzzxzz.......',
      '....xzz...xxzz.....',
      '...zzz......xzzz...',
      '.zzz...........zzz.',
      '.z...............z.',
      '...................',
      '...................',
      '...................',
      '...................',
    ],
    [
      '...................',
      '.............zz....',
      '.............z.....',
      '............zz.....',
      '............z......',
      '...........zz......',
      '...........zx......',
      '..........zx.......',
      '....xxxxxXzx.......',
      'zzzzzzzzXDx........',
      '.........xz........',
      '.........xz........',
      '.........xxz.......',
      '..........xzz......',
      '...........xz......',
      '............zz.....',
      '.............z.....',
      '.............zz....',
      '...................',
    ],
    [
      '...................',
      '...................',
      '...................',
      '...................',
      '.z.................',
      '.zzz...........zzz.',
      '...zzxx.......zz...',
      '.....zzxx...zzx....',
      '......zzxXzzzx.....',
      '........XDzxx......',
      '........xz.........',
      '........xz.........',
      '........xz.........',
      '........xz.........',
      '........xz.........',
      '.........z.........',
      '.........z.........',
      '.........z.........',
      '.........z.........',
    ],
    [
      '...................',
      '....zz.............',
      '.....z.............',
      '.....zz............',
      '......zx...........',
      '......zzx..........',
      '.......zxx.........',
      '........zx.........',
      '........xX.........',
      '........XDzzzzzzzzz',
      '.......xzzxxxxx....',
      '.......xz..........',
      '......xzz..........',
      '......xz...........',
      '......z............',
      '.....zz............',
      '.....z.............',
      '.....z.............',
      '...................',
    ],
  ],
  frameMs: 300,
};

/** The far turbine's blades, 13x13, turning a little faster so the two never move in step. */
const rotorFar: PixelSprite = {
  id: 'ge18-opener-rotor-far',
  name: 'far turbine blades',
  tags: ['ge18', 'animated'],
  blurb: 'Three small white turbine blades turning round their hub.',
  palette: GE_PALETTE,
  rows: [
    '......z......',
    '......z......',
    '......z......',
    '......zx.....',
    '......zx.....',
    '......zx.....',
    '...xxxX......',
    '...xzzxzz....',
    '..zz...xxzz..',
    '.zz.......zz.',
    '.............',
    '.............',
    '.............',
  ],
  frames: [
    [
      '......z......',
      '......z......',
      '......z......',
      '......zx.....',
      '......zx.....',
      '......zx.....',
      '...xxxX......',
      '...xzzxzz....',
      '..zz...xxzz..',
      '.zz.......zz.',
      '.............',
      '.............',
      '.............',
    ],
    [
      '.............',
      '.........z...',
      '........zz...',
      '........z....',
      '.......zx....',
      '...xxx.zx....',
      'zzzzzzXx.....',
      '......xz.....',
      '......xz.....',
      '......xxz....',
      '........zz...',
      '.........z...',
      '.............',
    ],
    [
      '.............',
      '.............',
      '.............',
      '.zz........z.',
      '..zzxx...zz..',
      '...zzzxzzz...',
      '.....zXzxx...',
      '.....xz......',
      '.....xz......',
      '.....xz......',
      '......z......',
      '......z......',
      '......z......',
    ],
    [
      '.............',
      '...z.........',
      '...zz........',
      '....zxx......',
      '.....zx......',
      '.....zz......',
      '.....xXzzzzzz',
      '....xzzxxx...',
      '....xz.......',
      '....zz.......',
      '....z........',
      '...z.........',
      '.............',
    ],
  ],
  frameMs: 260,
};

/** The low sun catching a solar panel. */
const glint: PixelSprite = {
  id: 'ge18-opener-glint',
  name: 'panel glint',
  tags: ['ge18'],
  blurb: 'A white glint of sun on a solar panel.',
  palette: GE_PALETTE,
  rows: [
    'zz',
  ],
};

/* ── the opener ─────────────────────────────────────────────────────────────────────────────── */

const WORKS = { x: 0, y: 8 };
/** Each rotor is placed so its hub lands on its tower's top. */
const BIG_HUB = { x: 52, y: 12 };
const FAR_HUB = { x: 71, y: 9 };

const base = geCompose('ge18-opener-base', geGroundDawn, [{ sprite: works, x: WORKS.x, y: WORKS.y }]);

/** Coal smoke, a step darker than the kit's. */
const smoke = geTint(geSmoke, 'ge18-opener-smoke', { x: 'X', X: 'D' });
const gullLater = geLater(geGull, 'ge18-opener-gull-later', 1, 520);

export const ge18Opener: SceneArt = {
  id: 'ge18-opener',
  label: 'At sunrise above the sea, two white wind turbines turn and solar panels catch the light on green terraces, while an old red and white chimney on the shore still puffs dark smoke.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: rotorBig, x: BIG_HUB.x - 9, y: BIG_HUB.y - 9 },
    { sprite: rotorFar, x: FAR_HUB.x - 6, y: FAR_HUB.y - 6 },
    { sprite: smoke, x: 1, y: 10, motion: { kind: 'rise', amp: 6, periodMs: 2800 } },
    { sprite: smoke, x: 2, y: 10, motion: { kind: 'rise', amp: 6, periodMs: 2800, phase: 0.5 } },
    { sprite: glint, x: 26, y: 37, motion: { kind: 'twinkle', periodMs: 2200, min: 0.2 } },
    { sprite: glint, x: 32, y: 37, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.4, min: 0.2 } },
    { sprite: glint, x: 38, y: 37, motion: { kind: 'twinkle', periodMs: 2400, phase: 0.75, min: 0.2 } },
    { sprite: geShimmer, x: 24, y: 30 },
    { sprite: geGull, x: 24, y: 7, motion: { kind: 'drift', amp: 3, periodMs: 7000 } },
    { sprite: gullLater, x: 33, y: 12, motion: { kind: 'drift', amp: 2, periodMs: 8200, phase: 0.5 } },
  ],
};

/* ── the keepsake ───────────────────────────────────────────────────────────────────────────── */

/** Climate: a wind turbine on a green hill, its blades turning. */
const emblemTurbine: PixelSprite = {
  id: 'ge18-emblem-turbine',
  name: 'emblem wind turbine',
  tags: ['ge', 'emblem', 'animated'],
  blurb: 'A white wind turbine on a green hill, its three blades turning.',
  palette: GE_PALETTE,
  rows: [
    '.......z........',
    '.......z........',
    '.......zx.......',
    '.......zx.......',
    '.......zxzx.....',
    '....xxxX........',
    '....xzzxzz......',
    '...zz..zxxzz....',
    '...z...zx..z....',
    '.......zx.......',
    '.......zx.......',
    '.......zx.......',
    '....mmmzxNNN....',
    '..mmnnnzxnnnNN..',
    '.mnnnnnnnnnnnnN.',
    'mnnnnnnnnnnnnnnN',
  ],
  frames: [
    [
      '.......z........',
      '.......z........',
      '.......zx.......',
      '.......zx.......',
      '.......zxzx.....',
      '....xxxX........',
      '....xzzxzz......',
      '...zz..zxxzz....',
      '...z...zx..z....',
      '.......zx.......',
      '.......zx.......',
      '.......zx.......',
      '....mmmzxNNN....',
      '..mmnnnzxnnnNN..',
      '.mnnnnnnnnnnnnN.',
      'mnnnnnnnnnnnnnnN',
    ],
    [
      '................',
      '.........zz.....',
      '.........z......',
      '........zx......',
      '....xxx.zxx.....',
      '..zzzzzXx.......',
      '.......xz.......',
      '.......xz.......',
      '.......xxz......',
      '.......zxzz.....',
      '.......zx.......',
      '.......zx.......',
      '....mmmzxNNN....',
      '..mmnnnzxnnnNN..',
      '.mnnnnnnnnnnnnN.',
      'mnnnnnnnnnnnnnnN',
    ],
    [
      '................',
      '................',
      '...z............',
      '...zzxx...zz....',
      '.....zzxzzz.....',
      '......zXzxx.....',
      '......xzx.......',
      '......xzx.......',
      '......xzx.......',
      '.......zx.......',
      '.......zx.......',
      '.......zx.......',
      '....mmmzxNNN....',
      '..mmnnnzxnnnNN..',
      '.mnnnnnnnnnnnnN.',
      'mnnnnnnnnnnnnnnN',
    ],
    [
      '................',
      '....zz..........',
      '.....zxx........',
      '......zx........',
      '......zzzzx.....',
      '......xXzzzzz...',
      '.....xzzxxx.....',
      '.....xzzx.......',
      '.....zzzx.......',
      '.....z.zx.......',
      '.......zx.......',
      '.......zx.......',
      '....mmmzxNNN....',
      '..mmnnnzxnnnNN..',
      '.mnnnnnnnnnnnnN.',
      'mnnnnnnnnnnnnnnN',
    ],
  ],
  frameMs: 280,
};

export const ge18Finish: SceneArt = geKeepsake(
  'ge18-finish',
  'A postage stamp with perforated edges and an emerald frame, showing a white wind turbine on a green hill with its blades turning, with small sparkles around it.',
  emblemTurbine,
);

export const art: LessonArtSet = { opener: ge18Opener, backdrop: geBackdrop, finish: ge18Finish };
