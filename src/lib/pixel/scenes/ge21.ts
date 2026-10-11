/**
 * Global Economics lesson 21: economic bubbles and financial crises, on the pier at night.
 *
 * A roller coaster runs the length of the pier, and its track is the shape of every bubble: a long
 * slow climb out of the station, steeper and steeper, a peak, a plunge back to the deck, one small
 * bounce and a long flat run after it. The car has just reached the top with its riders' arms in the
 * air and the whole drop in front of them. The track is drawn once and never moves; only small layers
 * do: the riders, the car rocking at the top, the bulbs along the rails, the pier lamps, the far
 * shore's lights and the stars.
 *
 * The keepsake's emblem is a soap bubble meeting a pin.
 */
import type { PixelSprite } from '../types';
import { geBackdrop } from './ge-backdrop';
import { GE_PALETTE, geCompose, geStar, geStarBig, geTint } from './ge-kit';
import { GE_PIER_LAMPS, geGroundPier, geLampGlow } from './ge-kit-a';
import { geKeepsake } from './ge1-finish';
import type { LessonArtSet, SceneArt } from './types';

/* ── one-off props ──────────────────────────────────────────────────────────────────────────── */

/**
 * The coaster, with the station's striped awning at its foot and a crescent moon above: red rails on
 * grey supports, the lift hill braced by a lattice tower under the peak.
 */
const coaster: PixelSprite = {
  id: 'ge21-opener-coaster',
  name: 'roller coaster',
  tags: ['ge21', 'prop'],
  blurb: 'A red roller coaster track on grey supports: a slow climb, a peak, a steep drop and a small bounce.',
  palette: GE_PALETTE,
  rows: [
    '.................................................................zz.............',
    '................................................................zA..............',
    '................................................................zA..............',
    '.................................................................zz.............',
    '........................................RRRRR...................................',
    '........................................RrrrRr..................................',
    '.......................................RRX.XRr..................................',
    '.......................................RrX.XRr..................................',
    '......................................RR.D.XRr..................................',
    '......................................Rr.XDXRr..................................',
    '.....................................RRX.X.DRr..................................',
    '....................................RRrX.XDXrRr.................................',
    '....................................Rr.D.D.X.Rr.................................',
    '...................................RR..XDD.X.Rr.................................',
    '...................................Rr..X.XDXDRr.................................',
    '..................................RRX..X.X.D.Rr.................................',
    '.................................RRrX..X.XDXDRr.................................',
    '.................................Rr.D..X.D.X.rRr................................',
    '................................RR..XD.D.D.X.DRr................................',
    '...............................RRr..X.DXDXDXDXRr................................',
    '..............................RRrX..X..D.XDD.XRr................................',
    '.............................RRr.X..X..X.XDDDXRr................................',
    '.............................Rr..D..X..X.D.X.DrRr...............................',
    '............................RR...XD.D..X.D.X.D.Rr...............................',
    '...........................RRr...X.DXD.D.XDXDX.Rr...............................',
    '..........................RRrX...X..D.DXDX.D.X.Rr...............................',
    '.........................RRr.X...X..X..D.XDXDX.Rr...............................',
    'RzRzRzRzRzR.............RRr..D...X..X..X.D.D.DDrRr..............................',
    'rxrxrxrxrxr...........RRRr...XD..D..X..X.D.X.D.DRr..............................',
    '.D.......D...........RRrrX...X.DDXD.D..X.XDXDX.XRr..............................',
    '.D.......D.........RRRr..X...X...D.DXD.D.X.D.X.XRr........RRRRR.................',
    '.................RRRrr...D...X...X..D.DXDXDDDX.XrRr......RRrrrRR................',
    '..............RRRRrrX....XD..X...X..X..D.DDXDD.X.Rr.....RRr...rRR..........RRRRR',
    'RRRRRRRRRRRRRRRrrr..X....X.DDD...X..X..X.D.D.DDX.Rr.....RrX....rRr...RRRRRRRrrrr',
    'rrrrrrrrrrrrrrrX....X....X...DD..X..X..X.XDXDX.D.Rr....RR.X....XRrRRRRrrrrrr..X.',
    'XXXXXXXXXXXX...X....X....X...X.DDX..X..X.X.D.X.X.RrRRRRRr.X....XrRRrrr....X...X.',
    'DDDDDDDDDDDD...X....X....X...X...D..X..X.XDXDX.X.rrrrrrr..X....X.rr..X....X...X.',
    '...D.....D.....D....D....D...D...D..D..D.D.D.D.D.....D....D....D.....D....D...D.',
  ],
};

/** The car at the peak, 9x6: two riders, arms up, then waving. One is the student, in the orchid beanie. */
const car: PixelSprite = {
  id: 'ge21-opener-car',
  name: 'coaster car',
  tags: ['ge21', 'animated'],
  blurb: 'A red coaster car with two riders waving their arms in the air.',
  palette: GE_PALETTE,
  rows: [
    '.M.M.M.M.',
    '.MPP.GGM.',
    '..CM.CM..',
    'RRRRRRRRR',
    'RzRRRRRRr',
    '.D.....D.',
  ],
  frames: [
    [
      '.M.M.M.M.',
      '.MPP.GGM.',
      '..CM.CM..',
      'RRRRRRRRR',
      'RzRRRRRRr',
      '.D.....D.',
    ],
    [
      'M...M....',
      '.MPP.GGM.',
      '..CM.CM..',
      'RRRRRRRRR',
      'RzRRRRRRr',
      '.D.....D.',
    ],
    [
      '.M.M.M.M.',
      '.MPP.GGM.',
      '..CM.CM..',
      'RRRRRRRRR',
      'RzRRRRRRr',
      '.D.....D.',
    ],
    [
      '.M.M...M.',
      '.MPPMGG..',
      '..CM.CM..',
      'RRRRRRRRR',
      'RzRRRRRRr',
      '.D.....D.',
    ],
  ],
  frameMs: 420,
};

/** One bulb on the rails. */
const bulb: PixelSprite = {
  id: 'ge21-opener-bulb',
  name: 'bulb',
  tags: ['ge21'],
  blurb: 'A small gold light bulb.',
  palette: GE_PALETTE,
  rows: [
    'y',
  ],
};

/* ── the opener ─────────────────────────────────────────────────────────────────────────────── */

/** Where the bulbs sit on the rails' top, from the station to the far end. */
const BULBS: readonly (readonly [number, number])[] = [[6, 37], [14, 37], [21, 34], [27, 29], [32, 23], [36, 17], [39, 12], [42, 8], [47, 25], [52, 39], [57, 36], [61, 34], [66, 39], [71, 37], [76, 36]];

const base = geCompose('ge21-opener-base', geGroundPier, [
  { sprite: coaster, x: 0, y: 4 },
]);

/** The far shore's lights: a warm window, not a star. */
const shoreLight = geTint(geStar, 'ge21-opener-shore-light', { z: 'G' });

export const ge21Opener: SceneArt = {
  id: 'ge21-opener',
  label: 'At night on a pier, a roller coaster climbs slowly, then steeply, to a towering peak and plunges back to the deck, and a car of cheering riders teeters at the very top.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: car, x: 40, y: 2, motion: { kind: 'bob', amp: 1, periodMs: 1600 } },
    ...BULBS.map(([x, y], i) => ({ sprite: bulb, x, y, motion: { kind: 'twinkle' as const, periodMs: 1500, phase: (i % 5) / 5, min: 0.15 } })),
    { sprite: geLampGlow, x: GE_PIER_LAMPS[0].x, y: GE_PIER_LAMPS[0].y, motion: { kind: 'twinkle', periodMs: 2600, min: 0.45 } },
    { sprite: geLampGlow, x: GE_PIER_LAMPS[1].x, y: GE_PIER_LAMPS[1].y, motion: { kind: 'twinkle', periodMs: 3100, phase: 0.5, min: 0.45 } },
    { sprite: shoreLight, x: 63, y: 22, motion: { kind: 'twinkle', periodMs: 3100, phase: 0.1, min: 0.35 } },
    { sprite: shoreLight, x: 13, y: 23, motion: { kind: 'twinkle', periodMs: 2700, phase: 0.6, min: 0.35 } },
    { sprite: geStarBig, x: 24, y: 3, motion: { kind: 'twinkle', periodMs: 2400, min: 0.3 } },
    { sprite: geStar, x: 8, y: 6, motion: { kind: 'twinkle', periodMs: 1900, phase: 0.4, min: 0.2 } },
    { sprite: geStar, x: 33, y: 9, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.7, min: 0.2 } },
    { sprite: geStar, x: 56, y: 2, motion: { kind: 'twinkle', periodMs: 2100, phase: 0.2, min: 0.25 } },
    { sprite: geStar, x: 75, y: 7, motion: { kind: 'twinkle', periodMs: 1700, phase: 0.55, min: 0.2 } },
  ],
};

/* ── the keepsake ───────────────────────────────────────────────────────────────────────────── */

/** Bubbles: a soap bubble, a pin closing in, the pop, and a new bubble starting to swell. */
const emblemBubble: PixelSprite = {
  id: 'ge21-emblem-bubble',
  name: 'emblem bubble',
  tags: ['ge', 'emblem', 'animated'],
  blurb: 'A shimmering soap bubble that a gold pin pops into droplets, then a new bubble swelling.',
  palette: GE_PALETTE,
  rows: [
    '.............yG.',
    '.............Gg.',
    '....QQQmmm..x...',
    '..QQ......mx....',
    '..Q.......xm....',
    '.Q..zz......m...',
    '.Q..z.......m...',
    '.Q..........m...',
    '.Q..........B...',
    '.Q..........B...',
    '.Q..........B...',
    '..Q........B....',
    '..QQ......BB....',
    '....QQQBBB......',
    '................',
    '................',
  ],
  frames: [
    [
      '.............yG.',
      '.............Gg.',
      '....QQQmmm..x...',
      '..QQ......mx....',
      '..Q.......xm....',
      '.Q..zz......m...',
      '.Q..z.......m...',
      '.Q..........m...',
      '.Q..........B...',
      '.Q..........B...',
      '.Q..........B...',
      '..Q........B....',
      '..QQ......BB....',
      '....QQQBBB......',
      '................',
      '................',
    ],
    [
      '.............yG.',
      '.............Gg.',
      '....QQQmmm..x...',
      '..QQ......mx....',
      '..Q.......xm....',
      '.Q..zz......m...',
      '.Q..z.......m...',
      '.Q..........m...',
      '.Q..........B...',
      '.Q..........B...',
      '.Q..........B...',
      '..Q........B....',
      '..QQ......BB....',
      '....QQQBBB......',
      '................',
      '................',
    ],
    [
      '................',
      '............yG..',
      '....QQQmmm..Gg..',
      '..QQ......mx....',
      '..Q.......xm....',
      '.Q..zz...x..m...',
      '.Q..z.......m...',
      '.Q..........m...',
      '.Q..........B...',
      '.Q..........B...',
      '.Q..........B...',
      '..Q........B....',
      '..QQ......BB....',
      '....QQQBBB......',
      '................',
      '................',
    ],
    [
      '................',
      '............yG..',
      '............Gg..',
      '..m....Q...xm...',
      '..........x.....',
      '....z..z.xz.....',
      '................',
      '................',
      '..Q.z.....z.Q...',
      '................',
      '................',
      '....z..z..z.....',
      '................',
      '..m....Q....m...',
      '................',
      '................',
    ],
    [
      '.............yG.',
      '.......m.....Gg.',
      '.m..........x...',
      '...........x....',
      '..........x.....',
      '.............m..',
      '................',
      '.....QQmm.......',
      '.....Q..m.......',
      '.....Q..B.......',
      '.....QQBB.......',
      '................',
      '................',
      '..m.............',
      '............m...',
      '......m.........',
    ],
    [
      '.............yG.',
      '.............Gg.',
      '............x...',
      '...........x....',
      '....QQQmmmx.....',
      '...QQ....mm.....',
      '...Q.zz...m.....',
      '...Q.z....m.....',
      '...Q......B.....',
      '...Q......B.....',
      '...QQ....BB.....',
      '....QQQBBB......',
      '................',
      '................',
      '................',
      '................',
    ],
  ],
  frameMs: 520,
};

export const ge21Finish: SceneArt = geKeepsake(
  'ge21-finish',
  'A postage stamp with perforated edges and an emerald frame, showing a shimmering soap bubble that a gold pin pops into droplets, with small sparkles around it.',
  emblemBubble,
);

export const art: LessonArtSet = { opener: ge21Opener, backdrop: geBackdrop, finish: ge21Finish };
