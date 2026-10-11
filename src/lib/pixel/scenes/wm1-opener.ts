/**
 * Wealth Management lesson 1 opener: three generations of one family at the foot of the house of
 * five pillars, at night.
 *
 * Composed from the kit (wm-kit.ts) over a ground of sky, far woods and lawn: the oak cropped by
 * the left edge, the temple, hedges, the lamp, the family on the gravel path. The frieze carries
 * the lesson's five pillars as gold marks (earn, save, invest, protect, transfer) over the
 * columns, the tympanum holds the family oak (the roof the pillars hold up is generational
 * wealth) and the steps are the foundation. What moves: the five marks light up one after another
 * in the order the lesson teaches them, the pennant waves, the lamp flickers, lamplight breathes in
 * the doorways, fireflies rise, a leaf drifts, stars twinkle.
 */
import type { PixelSprite } from '../types';
import type { SceneArt } from './types';
import {
  wmBands,
  wmChild,
  wmCompose,
  wmElder,
  wmFirefly,
  wmFlag,
  wmHedge,
  wmLampFlame,
  wmLampPost,
  wmLeaf,
  wmMarkEarn,
  wmMarkInvest,
  wmMarkOak,
  wmMarkProtect,
  wmMarkSave,
  wmMarkTransfer,
  wmOak,
  wmParent,
  wmStar,
  wmStarDot,
  wmTemple,
  WM_INKS,
} from './wm-kit';

/** The temple's top-left in the scene. Every temple position below is offset from it. */
const TX = 10;
const TY = 7;

const moon: PixelSprite = {
  id: 'wm1-opener-moon',
  name: 'wm1-opener-moon',
  tags: ['scene', 'wm1'],
  rows: [
    '..xwwwx..',
    '.xwwwwwx.',
    'xwwXwwwwx',
    'wwwwwwXwx',
    'wwXwwwwwx',
    'wwwwwwwxX',
    'xwwwwXwxX',
    '.xwwwwxX.',
    '..xxxXX..',
  ],
};

const flagPole: PixelSprite = {
  id: 'wm1-opener-flag-pole',
  name: 'wm1-opener-flag-pole',
  tags: ['scene', 'wm1'],
  rows: [
    'D',
    'x',
    'x',
    'x',
    'x',
    'x',
  ],
};

/** Far woods behind the house, showing either side of it. */
const woods: PixelSprite = {
  id: 'wm1-opener-woods',
  name: 'wm1-opener-woods',
  tags: ['scene', 'wm1'],
  palette: WM_INKS,
  rows: [
    '................................................................................',
    '...HHHHh...........................................................HHHHh........',
    '..HHHHhhh.........................................................HHHHhhh.....HH',
    '.HHHHhhhhh.......................................................HHHHhhhhh.H.HHH',
    'HHHHhhhhhhh.....................................................HHHHhhhhHHHHhHHH',
    'HHHhhhhhhhhH.................................................HHHHHHhhhhHHHHhhHHh',
    'HHhhhhhhhHHHhh..............................................HHHhHHhhhhhHHHhhHHhh',
    'HhhhhhhhHHHhhhh............................................HHHhhHhhhhhhHHhhhHhhh',
    'hhhhhhhhHHhhhhh............................................HHhhhhhhhhhHHhhhhhhhh',
    'hhhhhhhHHhhhhhhh...........................................HhhhhhhhhhhHhhhhhhhhh',
    'hhhhhhhHhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',
  ],
};

/** The lawn: the steps' cast shadow (z), a gravel path widening toward us, lamplight on the grass. */
const lawn: PixelSprite = {
  id: 'wm1-opener-lawn',
  name: 'wm1-opener-lawn',
  tags: ['scene', 'wm1'],
  palette: WM_INKS,
  rows: [
    'hhhhhhhhhhzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhKkkkkkkkkkkkkkkkkkKhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhHhhhhhhhhhhhhhhhKkkDkkkkkkkkkkkkkkKhhhhhhhhhHhhhhhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhKkkkkkkkkkkkkkkDkkkkKhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhhhhhhhhhhhhKkkkkkkkkkkkkkkkkkkkkkKhhhhhhhhhhhhhhhhhhhhhhnhhhhhh',
    'hhhhhhhhhhhhhhhhhhhHhhhhhhhKkkkkkkkkkDkkkkkkkkkkkkkKhhhhhhhhhhhhhhhhhhhnHhnhhhhh',
    'hhhhhhHhhhhhhhhhhhhhhhhhhhKkkkkkkkkkkkkkkkkkkkkkDkkkKhhhhhhhhhHhhhhhhhhhhHhhhhhh',
    'hhhhhhhhhhhhhhhhhhhhhhhhhhKkkkkkkkkkkkkkkkkkkkkkkkkkKhhhhhhhhhhhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhhhhhhhhhKkkkkkkkkkkkkkkkDkkkkkkkkkkkKhhhhhhhhhhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhhhhhhhhKkkkkkkkkkkkkkkkkkkkkkkkkkkkkkKhhhhhhhhhhhhhhhhhhhhhhhhh',
  ],
};

/** Fixed faint stars, so the twinkling ones are not the only lights in the sky. */
const skyDots: PixelSprite = {
  id: 'wm1-opener-sky-dots',
  name: 'wm1-opener-sky-dots',
  tags: ['scene', 'wm1'],
  rows: [
    '................................................................................',
    '...X..................D.........................................................',
    '................................................................................',
    '..........D.....................................X...............................',
    '..............................................................................D.',
    '...............................X................................................',
    '................................................................................',
    '................................................................................',
    '.........................................................D......................',
    '..X.............................................................................',
    '................................................................................',
    '................................................................................',
    '................................................................................',
    '.......................................................................X........',
  ],
};

const base = wmCompose('wm1-opener-base', wmBands(80, [['K', 50], ['h', 10]]), [
  { sprite: skyDots, x: 0, y: 0 },
  { sprite: moon, x: 67, y: 2 },
  { sprite: woods, x: 0, y: 34 },
  { sprite: lawn, x: 0, y: 50 },
  { sprite: wmOak, x: -6, y: 15 },
  { sprite: flagPole, x: TX + 29, y: TY - 6 },
  { sprite: wmTemple, x: TX, y: TY },
  { sprite: wmMarkOak, x: TX + 26, y: TY + 3 },
  { sprite: wmMarkEarn, x: TX + 6, y: TY + 10 },
  { sprite: wmMarkSave, x: TX + 16, y: TY + 10 },
  { sprite: wmMarkInvest, x: TX + 26, y: TY + 10 },
  { sprite: wmMarkProtect, x: TX + 36, y: TY + 10 },
  { sprite: wmMarkTransfer, x: TX + 46, y: TY + 10 },
  { sprite: wmHedge, x: -1, y: 44 },
  { sprite: wmHedge, x: 69, y: 44 },
  { sprite: wmLampPost, x: 73, y: 30 },
  { sprite: wmElder, x: 30, y: 47 },
  { sprite: wmParent, x: 37, y: 46 },
  { sprite: wmChild, x: 45, y: 50 },
]);

/** A mark lit from inside: every gold step goes one brighter. */
function litFrom(rows: readonly string[]): string[] {
  const up: Record<string, string> = { O: 'g', g: 'G', G: 'y', y: 'w' };
  return rows.map((row) => [...row].map((ch) => up[ch] ?? ch).join(''));
}

/**
 * The frieze, 49x5, with one mark lit per frame in the lesson's order, then a beat of rest. Built
 * from the kit's marks so a redrawn mark can never fall out of step with its glow.
 */
const pillarMarks = [wmMarkEarn, wmMarkSave, wmMarkInvest, wmMarkProtect, wmMarkTransfer];
const unlitFrieze = wmBands(49, [['.', 5]]);
const pillarGlowFrames = [
  ...pillarMarks.map((mark, i) => wmCompose('wm1-opener-pillar-glow', unlitFrieze, [
    { sprite: { ...mark, rows: litFrom(mark.rows) }, x: 1 + 10 * i, y: 0 },
  ]).rows),
  unlitFrieze,
];
const pillarGlow: PixelSprite = {
  id: 'wm1-opener-pillar-glow',
  name: 'wm1-opener-pillar-glow',
  tags: ['scene', 'wm1'],
  blurb: 'The five pillar marks lighting up in turn: earn, save, invest, protect, transfer.',
  rows: unlitFrieze,
  frames: pillarGlowFrames,
  frameMs: 560,
};

/** Lamplight down the middle of the four doorways, breathing. */
const doorGlow: PixelSprite = {
  id: 'wm1-opener-door-glow',
  name: 'wm1-opener-door-glow',
  tags: ['scene', 'wm1'],
  rows: [
    'G.........G.........G.........G',
    'G.........G.........G.........G',
    'G.........G.........G.........G',
    'G.........G.........G.........G',
    'G.........G.........G.........G',
    'G.........G.........G.........G',
    'G.........G.........G.........G',
    'G.........G.........G.........G',
    'G.........G.........G.........G',
    'G.........G.........G.........G',
    'G.........G.........G.........G',
    'G.........G.........G.........G',
    'G.........G.........G.........G',
    'G.........G.........G.........G',
  ],
};

export const wm1Opener: SceneArt = {
  id: 'wm1-opener',
  label: 'A grandmother, a father and a child stand before a marble house of five pillars at night, its frieze marked with a coin, a jar, a rising arrow, a shield and a key, under a full moon beside an old oak and a lamp.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: pillarGlow, x: TX + 5, y: TY + 10 },
    { sprite: doorGlow, x: TX + 14, y: TY + 23, motion: { kind: 'twinkle', periodMs: 3400, min: 0.2 } },
    { sprite: wmFlag, x: TX + 30, y: TY - 6 },
    { sprite: wmLampFlame, x: 74, y: 33 },
    { sprite: wmFirefly, x: 9, y: 40, motion: { kind: 'rise', amp: 6, periodMs: 3200, phase: 0.1 } },
    { sprite: wmFirefly, x: 67, y: 41, motion: { kind: 'rise', amp: 5, periodMs: 2800, phase: 0.6 } },
    { sprite: wmFirefly, x: 20, y: 51, motion: { kind: 'rise', amp: 4, periodMs: 2400, phase: 0.35 } },
    { sprite: wmLeaf, x: 15, y: 31, motion: { kind: 'drift', amp: 2, periodMs: 2600 } },
    { sprite: wmStar, x: 54, y: 2, motion: { kind: 'twinkle', periodMs: 2100, min: 0.3 } },
    { sprite: wmStar, x: 7, y: 7, motion: { kind: 'twinkle', periodMs: 2700, phase: 0.5, min: 0.3 } },
    { sprite: wmStarDot, x: 24, y: 3, motion: { kind: 'twinkle', periodMs: 1800, phase: 0.3, min: 0.2 } },
    { sprite: wmStarDot, x: 61, y: 13, motion: { kind: 'twinkle', periodMs: 2300, phase: 0.8, min: 0.2 } },
  ],
};
