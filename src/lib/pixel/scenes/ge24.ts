/**
 * Global Economics lesson 24: development economics and poverty, at a border post at nightfall.
 *
 * One hillside, the same ridge and the same two terraces on either side, split down the middle by a
 * border fence that ends at a guard booth on the road, a flag flying on each side. The lesson's
 * Korea and Ghana started out alike in 1960 (Korea about 155 dollars a head, Ghana a little richer
 * at 183) and stood at 35,000 and 2,300 by 2024; its answer is institutions, not resources. So the
 * left has built them: a school with its bell, a courthouse with the scales of justice in its
 * pediment, an open market of striped stalls, and round them a town that has grown, its windows
 * lit. The right has a mine instead, fenced off, its gold rolling out of the picture in a cart
 * while a guard watches, and the two dark huts outside the fence get none of it. Only small layers
 * move: the two flags, the ore cart, the mine's winding wheel and warning light, the tower's
 * windows, the lamps, the booth's light and the stars.
 *
 * The keepsake's emblem is a border post with a lit house on one side and a dark hut on the other.
 */
import type { PixelSprite } from '../types';
import { geBackdrop } from './ge-backdrop';
import { GE_PALETTE, geBeacon, geCompose, geLater, geStar, geStarBig } from './ge-kit';
import { geFlagBlue, geFlagRed } from './ge-kit-a';
import { geKeepsake } from './ge1-finish';
import type { LessonArtSet, SceneArt } from './types';

/* ── one-off props ──────────────────────────────────────────────────────────────────────────── */

/**
 * The borderland at nightfall, 80x60: navy sky, one far ridge drawn the same either side of x 39.5,
 * two terraces (tops on rows 27 and 38) that run unbroken across the border, the road on rows 49 to
 * 54 and a verge with a few tufts below.
 */
const borderland: PixelSprite = {
  id: 'ge24-opener-borderland',
  name: 'borderland at nightfall',
  tags: ['ge24', 'ground'],
  blurb: 'A navy night sky over one dark ridge, two green terraces running unbroken across the scene and a road below.',
  palette: GE_PALETTE,
  rows: [
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',
    'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
    'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
    'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
    'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
    'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
    'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
    'dddddddddddddd9999999999999dddddddddddddddddddddddddd9999999999999dddddddddddddd',
    'ddddddddddd9999999999999999999dddddddddddddddddddd9999999999999999999ddddddddddd',
    'dddddddd999999999999999999999999999dddddddddd999999999999999999999999999dddddddd',
    'dddd999999999999999999999999999999999999999999999999999999999999999999999999dddd',
    '99999999999999999999999999999999999999999999999999999999999999999999999999999999',
    '99999999999999999999999999999999999999999999999999999999999999999999999999999999',
    '99999999999999999999999999999999999999999999999999999999999999999999999999999999',
    '99999999999999999999999999999999999999999999999999999999999999999999999999999999',
    '88888888888888888888888888888888888888888888888888888888888888888888888888888888',
    '77777777777777777777777777777777777777777777777777777777777777777777777777777777',
    '77777777777777777777777777777777777777777777777777777777777777777777777777777777',
    '77777777777777777777777777777777777777777777777777777777777777777777777777777777',
    '77777777777777777777777777777777777777777777777777777777777777777777777777777777',
    '77777777777777777777777777777777777777777777777777777777777777777777777777777777',
    '77777777777777777777777777777777777777777777777777777777777777777777777777777777',
    '77777777777777777777777777777777777777777777777777777777777777777777777777777777',
    '77777777777777777777777777777777777777777777777777777777777777777777777777777777',
    '77777777777777777777777777777777777777777777777777777777777777777777777777777777',
    '77777777777777777777777777777777777777777777777777777777777777777777777777777777',
    '88888888888888888888888888888888888888888888888888888888888888888888888888888888',
    '88888888888888888888888888888888888888888888888888888888888888888888888888888888',
    '77777777777777777777777777777777777777777777777777777777777777777777777777777777',
    '77777777777777777777777777777777777777777777777777777777777777777777777777777777',
    '77777777777777777777777777777777777777777777777777777777777777777777777777777777',
    '77777777777777777777777777777777777777777777777777777777777777777777777777777777',
    '77777777777777777777777777777777777777777777777777777777777777777777777777777777',
    '77777777777777777777777777777777777777777777777777777777777777777777777777777777',
    '77777777777777777777777777777777777777777777777777777777777777777777777777777777',
    '77777777777777777777777777777777777777777777777777777777777777777777777777777777',
    '77777777777777777777777777777777777777777777777777777777777777777777777777777777',
    'oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo',
    'llllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllll',
    'llllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllll',
    'llllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllll',
    'llllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllll',
    'uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu',
    '77777777777777777777777777777777777777777777777777777777777777777777777777777777',
    '77778777777787777777877777778777777787777777787777777877777778777777787777777877',
    '77787777777877777778777777787777777877777777877777778777777787777777877777778777',
    '77777777777777777777777777777777777777777777777777777777777777777777777777777777',
    '77777777777777777777777777777777777777777777777777777777777777777777777777777777',
  ],
};

/** The lit side, 38x35: a school with its bell, a courthouse with gold scales, a lit tower and houses, and an open market by the road. */
const town: PixelSprite = {
  id: 'ge24-opener-town',
  name: 'lit town',
  tags: ['ge24', 'prop'],
  blurb: 'A red-roofed school with a bell, a columned courthouse with gold scales, a lit tower, houses and two striped market stalls.',
  palette: GE_PALETTE,
  rows: [
    '...................O..................',
    '......DD..........OxO.....DDDD........',
    '.....DGGD........OxyxO...DyDyDD.......',
    '.....DzzD.......OxyyyxO..DDyDyD.......',
    '....DDDDDD.....OxGxyxGxO.DyyDyD.......',
    '...DrrrrrrD...OxGGGyGGGxODDyyyD.......',
    '..DrrrrrrrrD.OxxxxxyxxxxxOyDyDD.......',
    '.DrrrrrrrrrrOOOOOOOOOOOOOOOyyDD.......',
    '..AAAAAAAAAS.OzyOzyOzyOzyODyDyD..r....',
    '..AyyAyyAyyS.OzyOzyOzyOzyOyyyyD.rrr...',
    '..AyyAyyAyyS.OzyOzyOzyOzyODyDyDrrrrr..',
    '..AAAAOOAAASOOOOOOOOOOOOOOOyDyDAyAyS..',
    '..AAAAOOAAASOxxxxxxxxxxxxxOyyDDAAOAS..',
    '......................................',
    '......................................',
    '......................................',
    '......................................',
    '......................................',
    '......................................',
    '......................................',
    '......................................',
    '......................................',
    '......................................',
    '......................................',
    '......................................',
    '......................................',
    '.rzrzrzrzr.TzTzTzTzT..................',
    '.rzrzrzrzr.TzTzTzTzT....rr............',
    '..D.....D...D.....D....rrrr...........',
    'zyD.....D...D.....D...rrrrrr..zy......',
    'D.DGRGyND...DyNRGGD..rrrrrrrr.D.......',
    'D.SSSSSSS...SSSSSSS...AyyAyyS.D.......',
    'D.S.....S...S.....S...AyyAOOS.D.......',
    'D.............................D.......',
    'D.............................D.......',
  ],
};

/** The other side's mine, 36x24: a headframe and its winding wheel, a shed, a spoil heap and a fence with a gate. */
const mine: PixelSprite = {
  id: 'ge24-opener-mine',
  name: 'fenced mine',
  tags: ['ge24', 'prop'],
  blurb: 'A mine headframe with its wheel, a shed and a spoil heap behind a wire fence with a gate.',
  palette: GE_PALETTE,
  rows: [
    '...........XXXXX....................',
    '..........X.....X...................',
    '..........X..D..X...................',
    '..........X.....X...................',
    '...........XXXXX....................',
    '............DDD.....................',
    '...........D.D.D....................',
    '...........D.D.D....................',
    '..........D..D..D.....XXXXXXXXXX....',
    '..........DDDDDDD....XXXXXXXXXXXX...',
    '.........D...D...D...DDDDDDDDDDDD...',
    '.........D...D...D...DkkDDkkDDkkD...',
    '........D....D....D..DDDDDDDXXDDD...',
    '........DDDDDDDDDDD..DDDDDXXXXXXD...',
    '.......D.....D.....D....XXXXXXXXXX..',
    '.......D.....D.....D..XXXXXXXXXXXXXX',
    '........X.x.x.X.x.x.X.x.xX......X.x.',
    '........XDDDDDXDDDDDXDDDDX......XDDD',
    '........X.D..DX.D..DX.D..X......X.D.',
    '........X..D..X..D..X..D.X......X..D',
    '........XD..D.XD..D.XD..DX......XD..',
    '........X.D..DX.D..DX.D..X......X.D.',
    '........X..D..X..D..X..D.X......X..D',
    '........X.....X.....X....X......X...',
  ],
};

/** The ore line, 18x15: rails down from the mine gate to the road, then along it and off the scene. */
const rails: PixelSprite = {
  id: 'ge24-opener-rails',
  name: 'ore rails',
  tags: ['ge24', 'prop'],
  blurb: 'A pair of rails running down from a gate and along the road out of the picture.',
  palette: GE_PALETTE,
  rows: [
    '..........XDDX....',
    '..........X..X....',
    '.........XDDX.....',
    '.........X..X.....',
    '........XDDX......',
    '........X..X......',
    '.......XDDX.......',
    '.......X..X.......',
    '.......XDDX.......',
    '.......X..X.......',
    '.......XDDX.......',
    '.......X..X.......',
    '.......XDDX.......',
    '....XXXXXXXXXXXXXX',
    '.....D..D..D..D..D',
  ],
};

/** Two huts outside the fence, 26x9: thatch and mud walls, not a light between them. */
const huts: PixelSprite = {
  id: 'ge24-opener-huts',
  name: 'dark huts',
  tags: ['ge24', 'prop'],
  blurb: 'Two thatched huts with dark doorways and no lights.',
  palette: GE_PALETTE,
  rows: [
    '..........o...............',
    '.........ooo......o.......',
    '........oolll....ooo......',
    '.......oollllu..oolll.....',
    '......olllllllloollllu....',
    '.......uuuKuuuollllllll...',
    '.......uuuKuuu.uuuKuuu....',
    '.......uuuKuuu.uuuKuuu....',
    '...............uuuKuuu....',
  ],
};

/** The mine's guard, 6x11, in a peaked cap, standing by the ore line. */
const guard: PixelSprite = {
  id: 'ge24-opener-guard',
  name: 'guard',
  tags: ['ge24', 'character'],
  blurb: 'A guard in a grey uniform and a peaked cap.',
  palette: GE_PALETTE,
  rows: [
    '.DDDD.',
    'DDDDDD',
    '.MCCU.',
    '..CU..',
    '.DXXD.',
    'DXXXXD',
    'DXXXXD',
    'C.XX.C',
    '..XX..',
    '..XX..',
    '..DD..',
  ],
};

/**
 * The border, 20x31: the fence line from the ridge down to a booth that straddles it on the road, a
 * flagpole either side (each flag is its own layer) and the striped boom across the road.
 */
const border: PixelSprite = {
  id: 'ge24-opener-border',
  name: 'border post',
  tags: ['ge24', 'prop'],
  blurb: 'A fence line ending at a small guard booth, a striped boom and two flagpoles.',
  palette: GE_PALETTE,
  rows: [
    '.........X..........',
    '........DDD.........',
    '.........X..........',
    '.........X..........',
    '.........X..........',
    '........DDD.........',
    '.........X..........',
    '.........X..........',
    '.........X..........',
    '........DDD.........',
    '.........X..........',
    '...X.....X.....X....',
    '...X.....X.....X....',
    '...X....DDD....X....',
    '...X.....X.....X....',
    '...X.....X.....X....',
    '...X.....X.....X....',
    '...X....DDD....X....',
    '...X.....X.....X....',
    '...X.....X.....X....',
    '...X.....X.....X....',
    '...X....DDD....X....',
    '...X.....X.....X....',
    '...X..DDDDDDDD.X....',
    '...X..DXXXXXXD.X....',
    '...X...xxxxxD..X....',
    'zrzXzrDxyyyxD..X....',
    'DDDXDDDxyyyxD..X....',
    '...XD..xxxxxD..X....',
    '...XD..xxxxxD..X....',
    '...X...xxxxxD..X....',
  ],
};

/** The ore cart, 12x5 along the road rails: a load of gold rolls out of the scene, then the next one comes. */
const oreCart: PixelSprite = {
  id: 'ge24-opener-ore-cart',
  name: 'ore cart',
  tags: ['ge24', 'animated'],
  blurb: 'A mine cart heaped with gold ore rolling along the rails and out of the picture.',
  palette: GE_PALETTE,
  rows: [
    '...yGGyG....',
    '..GGgGGgG...',
    '..DXXXXXD...',
    '...DXXXD....',
    '...K...K....',
  ],
  frames: [
    [
      '.yGGyG......',
      'GGgGGgG.....',
      'DXXXXXD.....',
      '.DXXXD......',
      '.K...K......',
    ],
    [
      '...yGGyG....',
      '..GGgGGgG...',
      '..DXXXXXD...',
      '...DXXXD....',
      '...K...K....',
    ],
    [
      '.....yGGyG..',
      '....GGgGGgG.',
      '....DXXXXXD.',
      '.....DXXXD..',
      '.....K...K..',
    ],
    [
      '.......yGGyG',
      '......GGgGGg',
      '......DXXXXX',
      '.......DXXXD',
      '.......K...K',
    ],
    [
      '.........yGG',
      '........GGgG',
      '........DXXX',
      '.........DXX',
      '.........K..',
    ],
    [
      '...........y',
      '..........GG',
      '..........DX',
      '...........D',
      '...........K',
    ],
    [
      '............',
      '............',
      '............',
      '............',
      '............',
    ],
  ],
  frameMs: 520,
};

/** The headframe's winding wheel, 7x5, turning: the mine never stops. */
const wheel: PixelSprite = {
  id: 'ge24-opener-wheel',
  name: 'winding wheel',
  tags: ['ge24', 'animated'],
  blurb: 'A mine winding wheel turning on top of its headframe.',
  palette: GE_PALETTE,
  rows: [
    '.XXXXX.',
    'X..D..X',
    'XDDDDDX',
    'X..D..X',
    '.XXXXX.',
  ],
  frames: [
    [
      '.XXXXX.',
      'X..D..X',
      'XDDDDDX',
      'X..D..X',
      '.XXXXX.',
    ],
    [
      '.XXXXX.',
      'X.D.D.X',
      'X..D..X',
      'X.D.D.X',
      '.XXXXX.',
    ],
  ],
  frameMs: 450,
};

/** The lit tower's windows, 4x10, a few going on and off as people come and go. */
const towerLights: PixelSprite = {
  id: 'ge24-opener-tower-lights',
  name: 'tower windows',
  tags: ['ge24', 'animated'],
  blurb: 'A grid of gold lit windows, a few switching on and off.',
  palette: GE_PALETTE,
  rows: [
    'yDyD',
    'DyDy',
    'yyDy',
    'Dyyy',
    'yDyD',
    'yyyD',
    'DyDy',
    'yyyy',
    'DyDy',
    'yyDy',
  ],
  frames: [
    [
      'yDyD',
      'DyDy',
      'yyDy',
      'Dyyy',
      'yDyD',
      'yyyD',
      'DyDy',
      'yyyy',
      'DyDy',
      'yyDy',
    ],
    [
      'yDyD',
      'DyDD',
      'yyDy',
      'Dyyy',
      'yDyD',
      'yDyD',
      'DyDy',
      'yyyy',
      'yyDy',
      'yyDy',
    ],
    [
      'yDyD',
      'DyDy',
      'yyDy',
      'DDyy',
      'yDyD',
      'yyyD',
      'yyDy',
      'yyyy',
      'DyDy',
      'yyyy',
    ],
  ],
  frameMs: 1100,
};

/** A lamp's hot core, 2x1, for a slow `twinkle` on the town's lamps and the booth's window. */
const lampCore: PixelSprite = {
  id: 'ge24-opener-lamp-core',
  name: 'lamp core',
  tags: ['ge24'],
  blurb: 'The pale hot core of a lamp.',
  palette: GE_PALETTE,
  rows: [
    '55',
  ],
};

/* ── the opener ─────────────────────────────────────────────────────────────────────────────── */

/** Where each piece stands. The border line is x 39, the booth straddles it on the road. */
const TOWN = { x: 0, y: 14 };
const MINE = { x: 44, y: 12 };
const RAILS = { x: 62, y: 35 };
const BORDER = { x: 30, y: 18 };
/** Each flag flies from its pole's top: the poles are the border's columns 3 and 15. */
const FLAGS = { left: { x: BORDER.x + 3, y: BORDER.y + 9 }, right: { x: BORDER.x + 15, y: BORDER.y + 9 } };
/** The wheel sits in the headframe's top, 10 in from the mine's corner. */
const WHEEL = { x: MINE.x + 10, y: MINE.y };
/** The heads of the town's two lamps (town columns 0 and 30, row 29). */
const LAMPS = [{ x: TOWN.x, y: TOWN.y + 29 }, { x: TOWN.x + 30, y: TOWN.y + 29 }] as const;

const base = geCompose('ge24-opener-base', borderland, [
  { sprite: town, x: TOWN.x, y: TOWN.y },
  { sprite: mine, x: MINE.x, y: MINE.y },
  { sprite: rails, x: RAILS.x, y: RAILS.y },
  { sprite: huts, x: 41, y: 39 },
  { sprite: guard, x: 63, y: 37 },
  { sprite: border, x: BORDER.x, y: BORDER.y },
]);

const flagRight = geLater(geFlagRed, 'ge24-opener-flag-right', 1, 340);

export const ge24Opener: SceneArt = {
  id: 'ge24-opener',
  label: 'At nightfall a border post splits one hillside in two: on the left a school, a courthouse and an open market stand in a town of lit windows, and on the right, beside two dark huts, a guard watches a cart of gold from a fenced mine roll out of the picture.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: geFlagBlue, x: FLAGS.left.x, y: FLAGS.left.y },
    { sprite: flagRight, x: FLAGS.right.x, y: FLAGS.right.y },
    { sprite: oreCart, x: 68, y: 43 },
    { sprite: wheel, x: WHEEL.x, y: WHEEL.y },
    { sprite: geBeacon, x: WHEEL.x + 3, y: WHEEL.y - 1 },
    { sprite: towerLights, x: TOWN.x + 26, y: TOWN.y + 2 },
    ...LAMPS.map((l, i) => ({ sprite: lampCore, x: l.x, y: l.y, motion: { kind: 'twinkle' as const, periodMs: 2600 + 500 * i, phase: 0.5 * i, min: 0.4 } })),
    { sprite: lampCore, x: BORDER.x + 8, y: BORDER.y + 26, motion: { kind: 'twinkle', periodMs: 3000, phase: 0.3, min: 0.5 } },
    { sprite: geStarBig, x: 15, y: 3, motion: { kind: 'twinkle', periodMs: 2400, min: 0.3 } },
    { sprite: geStar, x: 5, y: 8, motion: { kind: 'twinkle', periodMs: 1900, phase: 0.4, min: 0.2 } },
    { sprite: geStar, x: 28, y: 2, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.7, min: 0.2 } },
    { sprite: geStar, x: 37, y: 9, motion: { kind: 'twinkle', periodMs: 2100, phase: 0.2, min: 0.25 } },
    { sprite: geStar, x: 46, y: 4, motion: { kind: 'twinkle', periodMs: 1700, phase: 0.55, min: 0.2 } },
    { sprite: geStar, x: 70, y: 2, motion: { kind: 'twinkle', periodMs: 2300, phase: 0.15, min: 0.2 } },
    { sprite: geStar, x: 76, y: 10, motion: { kind: 'twinkle', periodMs: 2000, phase: 0.85, min: 0.2 } },
  ],
};

/* ── the keepsake ───────────────────────────────────────────────────────────────────────────── */

/** Development: a border post between a lit house and a dark hut, the same ground under both. */
const emblemBorder: PixelSprite = {
  id: 'ge24-emblem-border',
  name: 'emblem border post',
  tags: ['ge', 'emblem', 'animated'],
  blurb: 'A striped border post with a lit house on one side and a dark hut on the other, on one strip of ground.',
  palette: GE_PALETTE,
  rows: [
    '................',
    '.......zz.......',
    '.......RR.......',
    '...R...zz.......',
    '..RRR..RR.......',
    '.RRRRR.zz...o...',
    'RRRRRRRRR..ooo..',
    '.AAAAA.zz.ooooo.',
    '.AyyyA.RR.lllll.',
    '.AyyyA.zz.lKKll.',
    '.AAAAA.RR.lKKll.',
    '.AAOAA.zz.lKKll.',
    'NNNNNNNNNNNNNNNN',
    'nnnnnnnnnnnnnnnn',
    '................',
    '................',
  ],
  frames: [
    [
      '................',
      '.......zz.......',
      '.......RR.......',
      '...R...zz.......',
      '..RRR..RR.......',
      '.RRRRR.zz...o...',
      'RRRRRRRRR..ooo..',
      '.AAAAA.zz.ooooo.',
      '.AyyyA.RR.lllll.',
      '.AyyyA.zz.lKKll.',
      '.AAAAA.RR.lKKll.',
      '.AAOAA.zz.lKKll.',
      'NNNNNNNNNNNNNNNN',
      'nnnnnnnnnnnnnnnn',
      '................',
      '................',
    ],
    [
      '................',
      '.......zz.......',
      '.......RR.......',
      '...R...zz.......',
      '..RRR..RR.......',
      '.RRRRR.zz...o...',
      'RRRRRRRRR..ooo..',
      '.AAAAA.zz.ooooo.',
      '.AGyGA.RR.lllll.',
      '.AyGyA.zz.lKKll.',
      '.AAAAA.RR.lKKll.',
      '.AAOAA.zz.lKKll.',
      'NNNNNNNNNNNNNNNN',
      'nnnnnnnnnnnnnnnn',
      '................',
      '................',
    ],
    [
      '................',
      '.......zz.......',
      '.......RR.......',
      '...R...zz.......',
      '..RRR..RR.......',
      '.RRRRR.zz...o...',
      'RRRRRRRRR..ooo..',
      '.AAAAA.zz.ooooo.',
      '.AyyyA.RR.lllll.',
      '.AyyyA.zz.lKKll.',
      '.AAAAA.RR.lKKll.',
      '.AAOAA.zz.lKKll.',
      'NNNNNNNNNNNNNNNN',
      'nnnnnnnnnnnnnnnn',
      '................',
      '................',
    ],
    [
      '..z.............',
      '.......zz.......',
      '.......RR.......',
      '...R...zz.......',
      '..RRR..RR.......',
      '.RRRRR.zz...o...',
      'RRRRRRRRR..ooo..',
      '.AAAAA.zz.ooooo.',
      '.AyyyA.RR.lllll.',
      '.AyyyA.zz.lKKll.',
      '.AAAAA.RR.lKKll.',
      '.AAOAA.zz.lKKll.',
      'NNNNNNNNNNNNNNNN',
      'nnnnnnnnnnnnnnnn',
      '................',
      '................',
    ],
  ],
  frameMs: 650,
};

export const ge24Finish: SceneArt = geKeepsake(
  'ge24-finish',
  'A postage stamp with perforated edges and an emerald frame, showing a striped border post with a lit house on one side and a dark hut on the other, with small sparkles around it.',
  emblemBorder,
);

export const art: LessonArtSet = { opener: ge24Opener, backdrop: geBackdrop, finish: ge24Finish };
