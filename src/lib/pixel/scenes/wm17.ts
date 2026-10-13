/**
 * Wealth Management lesson 17 (behavioral wealth management): its opener, the pathway backdrop and
 * its keepsake, as one set loaded on demand.
 *
 * The opener is the sitting room on a stormy night: blue-striped walls over the kit's panelling,
 * the curtained window (wm-kit-a.ts) with lightning in it, a reading lamp, and the father sitting up
 * in a teal wing chair on an orchid rug, his written investment policy (a sealed scroll) held in his
 * lap. The storm is the market's panic, and beside his chair stands the temptation: a sell lever
 * with a red knob. His free hand drifts toward it and comes back to the armrest, again and again,
 * never touching it. Beyond it, on a side table, a brass clockwork machine keeps investing for him
 * (the automatic contribution): its gears turn and it drops a coin into a glass jar on every turn,
 * whatever the weather. The lesson's point is that the investor's own brain is the risk, so the
 * defence is a system (a written policy, automation, a coach) that keeps going while the urge to
 * sell gets no vote. What moves: rain and a fork of lightning in the window, his hand reaching and
 * drawing back, a glint on the red knob, the gears, the coin dropping into the jar, the lamp
 * breathing. The keepsake carries the machine's brass gear: the system over the impulse.
 */
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';
import { wmBackdrop } from './wm-backdrop';
import { wmBands, wmCompose, wmLater, WM_INKS } from './wm-kit';
import { wmStripes, wmWainscot, wmWindow } from './wm-kit-a';
import { wmKeepsake } from './wm1-finish';

/** The window's top-left. The storm layer sits on the panes of its sash, inset (5, 2). */
const WIN_X = 4;
const WIN_Y = 6;

/** The machine's top-left; its gears, nozzle and jar are placed from it. */
const MACH_X = 60;
const MACH_Y = 29;

const CHAIR_X = 33;
const CHAIR_Y = 34;

/** The sell lever's top-left, on the floor between the chair and the machine's table. */
const LEVER_X = 52;
const LEVER_Y = 39;

/** The reaching arm's layer: from his left shoulder out over the chair's arm toward the lever. */
const ARM_X = CHAIR_X + 11;
const ARM_Y = CHAIR_Y + 4;

/**
 * The father awake in a teal wing chair: the chair's back, wings and rolled arms, and him sitting
 * up in it, his right hand holding the written policy (a scroll with a red seal) in his lap, his
 * left hand at his side by the chair's arm, shoes on the rug. 18x21.
 */
const sitting: PixelSprite = {
  id: 'wm17-opener-sitting',
  name: 'wm17-opener-sitting',
  tags: ['scene', 'wm17'],
  palette: WM_INKS,
  rows: [
    '....tTTTTTTTTt....',
    '..tTTTTTTTTTTTTt..',
    '.tTTTTTTkkkTTTTTt.',
    '.tTTTTTkkkkkTTTTt.',
    '.tTTTTTkCCCkTTTTt.',
    '.tTTTTTCkCkUTTTTt.',
    '.tTTTTTTCCUTTTTTt.',
    '.tTTTTTbwRwbTTTTt.',
    '.tTTTTbBBRBbbTTTt.',
    'TTTtTTBBBRBbbtTTTt',
    'tttTTTgGGGgbbTttth',
    'tttTTCyOOOybUTttth',
    'tttTTTyOOyybTTttth',
    'hhhTTbgGGGgRbTThhh',
    'hhhtttbBBBbbttthhh',
    'hhhtttkkttkkttthhh',
    'hhhtttkkttkkttthhh',
    'hhhhhhkkhhkkhhhhhh',
    '.UO..KKK..KKK..OU.',
    '.UO............OU.',
    '.KK............KK.',
  ],
};

/** The temptation: a brass sell lever with a red ball knob, standing up from an iron box. 6x14. */
const lever: PixelSprite = {
  id: 'wm17-opener-lever',
  name: 'wm17-opener-lever',
  tags: ['scene', 'wm17'],
  rows: [
    '.sRr..',
    '.RRr..',
    '.rrI..',
    '..Gg..',
    '..Gg..',
    '..Gg..',
    '..Gg..',
    '..Gg..',
    '..Og..',
    '.DXXD.',
    'DxXXXD',
    'xXXXXD',
    'XXXXkD',
    'DDDDDD',
  ],
};

/** A reading lamp: a gold shade lit from inside, a thin stem, a weighted foot. 7x33. */
const lamp: PixelSprite = {
  id: 'wm17-opener-lamp',
  name: 'wm17-opener-lamp',
  tags: ['scene', 'wm17'],
  rows: ['..yGg..', '.yGGGg.', 'yGGGGGg', 'gggggOO', ...Array.from({ length: 26 }, () => '...D...'), '..DDD..', '.DDDDD.', '.KKKKK.'],
};

/** An orchid rug edged in deeper orchid, gold fringe at each end. 30x4. */
const rug: PixelSprite = {
  id: 'wm17-opener-rug',
  name: 'wm17-opener-rug',
  tags: ['scene', 'wm17'],
  rows: [`g${'E'.repeat(28)}g`, `gEp${'P'.repeat(24)}pEg`, `gEp${'p'.repeat(24)}pEg`, `g${'E'.repeat(28)}g`],
};

/** A side table, wide enough for the machine and its jar. 19x12. */
const sideTable: PixelSprite = {
  id: 'wm17-opener-side-table',
  name: 'wm17-opener-side-table',
  tags: ['scene', 'wm17'],
  palette: WM_INKS,
  rows: [`${'C'.repeat(18)}U`, `${'U'.repeat(18)}O`, 'O'.repeat(19), ...Array.from({ length: 8 }, () => `.UO${'.'.repeat(13)}UO.`), `.KK${'.'.repeat(13)}KK.`],
};

/**
 * The clockwork investor: a brass hopper on top for the pay, a dark iron case with two gear
 * sockets and a dial, a brass pipe out to a nozzle over the jar. The gears are layers, bright
 * brass against the iron so they read as they turn. 15x13.
 */
const machine: PixelSprite = {
  id: 'wm17-opener-machine',
  name: 'wm17-opener-machine',
  tags: ['scene', 'wm17'],
  rows: [
    '..gyGGgO.......',
    '...gGGgO.......',
    '....gGO........',
    '.xXXXXXXXXgGGGg',
    'xXDDDDDDDDk...G',
    'xDkkkDDkkkk....',
    'xDkkkDDkkkk....',
    'xDkkkDDkkkk....',
    'xDDDDDDDDDk....',
    'xDDDwxwDDDk....',
    'xDDDxkxDDDk....',
    'XkkkkkkkkkK....',
    '.gg.....gg.....',
  ],
};

/** A glass jar on the table, a pile of coins in it; its empty glass shows the wall. 7x6. */
const jar: PixelSprite = {
  id: 'wm17-opener-jar',
  name: 'wm17-opener-jar',
  tags: ['scene', 'wm17'],
  rows: ['xwwwwwX', 'x.....X', 'xyGGgGX', 'xGGgGgX', 'xgGGGgX', '.XXXXX.'],
};

const base = wmCompose('wm17-opener-base', [
  ...wmBands(80, [['K', 2], ['D', 1]]),
  ...wmStripes(80, 35, 'k', 'b', 7),
  ...wmWainscot(80),
  ...wmBands(80, [['K', 1], ['O', 2], ['U', 1], ['O', 2], ['U', 1], ['O', 2], ['U', 1], ['O', 1]]),
], [
  { sprite: wmWindow, x: WIN_X, y: WIN_Y },
  { sprite: rug, x: 28, y: 51 },
  { sprite: lamp, x: 25, y: 22 },
  { sprite: sitting, x: CHAIR_X, y: CHAIR_Y },
  { sprite: lever, x: LEVER_X, y: LEVER_Y },
  { sprite: sideTable, x: MACH_X, y: MACH_Y + 13 },
  { sprite: machine, x: MACH_X, y: MACH_Y },
  { sprite: jar, x: MACH_X + 12, y: MACH_Y + 7 },
]);

/* ── the storm in the window ──────────────────────────────────────────────────────────────────── */

/** The storm layer covers the sash's panes, 11x18; the mullion and the glazing rails stay clear. */
const STORM_W = 11;
const STORM_H = 18;
const MULLION = 5;
const RAILS = new Set([4, 9, 10, 15]);
const isPane = (x: number, y: number) => x !== MULLION && !RAILS.has(y);

/** Cloud over the moon and the stars the clear-night window shows, [x, y, ink]. */
const CLOUD: readonly (readonly [number, number, string])[] = [
  [7, 0, 'k'], [8, 0, 'D'], [9, 0, 'D'], [10, 0, 'k'],
  [6, 1, 'k'], [7, 1, 'D'], [8, 1, 'D'], [9, 1, 'D'], [10, 1, 'k'],
  [6, 2, 'D'], [7, 2, 'D'], [8, 2, 'D'], [9, 2, 'D'], [10, 2, 'k'],
  [7, 3, 'k'], [8, 3, 'k'], [9, 3, 'D'], [10, 3, 'k'],
  [2, 2, 'k'], [9, 6, 'k'], [1, 7, 'k'],
];

/** The lightning's path down the left leaf, top to bottom, breaking where it crosses a rail. */
const BOLT: readonly (readonly [number, number])[] = [
  [3, 0], [3, 1], [2, 2], [2, 3], [3, 5], [4, 6], [3, 7], [3, 8], [2, 11], [2, 12], [3, 13], [3, 14], [2, 16],
];

function stormFrame(rain: number, bolt: boolean, flash = false): string[] {
  const grid = wmBands(STORM_W, [['.', STORM_H]]).map((row) => [...row]);
  for (let y = 0; y < STORM_H; y += 1) {
    for (let x = 0; x < STORM_W; x += 1) {
      if (!isPane(x, y)) continue;
      if (flash) grid[y][x] = 'k';
      if ((x * 3 + y - 3 * rain + 27) % 9 === 0) grid[y][x] = 'X';
    }
  }
  for (const [x, y, ink] of CLOUD) grid[y][x] = ink;
  if (bolt) BOLT.forEach(([x, y], i) => { grid[y][x] = i % 3 === 0 ? 'W' : 'w'; });
  return grid.map((row) => row.join(''));
}

const storm: PixelSprite = {
  id: 'wm17-opener-storm',
  name: 'wm17-opener-storm',
  tags: ['scene', 'wm17'],
  blurb: 'Rain and lightning at the window: the market panic outside that the sleeper never hears.',
  rows: stormFrame(0, false),
  frames: [
    ...Array.from({ length: 9 }, (_, f) => stormFrame(f % 3, false)),
    stormFrame(0, true, true),
    stormFrame(1, true),
    stormFrame(2, false),
  ],
  frameMs: 170,
};

/* ── the machine at work ──────────────────────────────────────────────────────────────────────── */

/** A gear turning: teeth square, then on the diagonals. 5x5. */
const gear: PixelSprite = {
  id: 'wm17-opener-gear',
  name: 'wm17-opener-gear',
  tags: ['scene', 'wm17'],
  rows: ['..y..', '.GGG.', 'yGOGy', '.GGG.', '..y..'],
  frames: [
    ['..y..', '.GGG.', 'yGOGy', '.GGG.', '..y..'],
    ['.y.y.', 'yGGGy', '.GOG.', 'yGGGy', '.y.y.'],
  ],
  frameMs: 300,
};
const gearLater = wmLater(gear, 'wm17-opener-gear-later', 1, 300);

/** A coin leaving the nozzle and dropping into the jar, then a pause. 2x6. */
const COIN = ['yG', 'Gg'];
const coinAt = (y: number) => Array.from({ length: 6 }, (_, j) => (j === y ? COIN[0] : j === y + 1 ? COIN[1] : '..'));
const noCoin = Array.from({ length: 6 }, () => '..');
const coinDrop: PixelSprite = {
  id: 'wm17-opener-coin-drop',
  name: 'wm17-opener-coin-drop',
  tags: ['scene', 'wm17'],
  blurb: 'The machine dropping a coin into the jar on schedule.',
  rows: coinAt(2),
  frames: [coinAt(0), coinAt(2), coinAt(4), noCoin, noCoin, noCoin],
  frameMs: 280,
};

/* ── the urge to sell, kept off ───────────────────────────────────────────────────────────────── */

/**
 * His left arm, 9x9 from (ARM_X, ARM_Y): resting at his side (nothing drawn, the base shows the
 * hand), lifting, then reaching over the chair's arm toward the lever's knob and stopping a pixel
 * short of it. While it is raised, the resting hand under it is painted over with his coat.
 */
const ARM_REST = wmBands(9, [['.', 9]]);
const ARM_LIFT = ['.........', '.........', '.........', '.........', '.....CC..', '...BBCU..', '..BBbb...', '.b.......', '.........'];
const ARM_REACH = ['.........', '......CC.', '.....BCU.', '....BBb..', '...BBb...', '..BBb....', '..Bb.....', '.b.......', '.........'];
const reach: PixelSprite = {
  id: 'wm17-opener-reach',
  name: 'wm17-opener-reach',
  tags: ['scene', 'wm17'],
  palette: WM_INKS,
  blurb: 'His hand drifting toward the red sell lever and drawing back without touching it.',
  rows: ARM_REST,
  frames: [ARM_REST, ARM_REST, ARM_LIFT, ARM_REACH, ARM_REACH, ARM_LIFT, ARM_REST, ARM_REST],
  frameMs: 430,
};

/** A glint on the red knob. */
const knobGlint: PixelSprite = {
  id: 'wm17-opener-knob-glint',
  name: 'wm17-opener-knob-glint',
  tags: ['scene', 'wm17'],
  rows: ['W'],
};

/** Light spilling under the lamp's shade. */
const lampGlow: PixelSprite = {
  id: 'wm17-opener-lamp-glow',
  name: 'wm17-opener-lamp-glow',
  tags: ['scene', 'wm17'],
  rows: ['yWWWy'],
};

export const wm17Opener: SceneArt = {
  id: 'wm17-opener',
  label: 'On a stormy night a father sits in a wing chair with his written plan in his lap, his hand drifting toward a red sell lever and drawing back without pulling it, while a brass machine beside him keeps dropping coins into a glass jar.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: storm, x: WIN_X + 5, y: WIN_Y + 2 },
    { sprite: gear, x: MACH_X + 1, y: MACH_Y + 4 },
    { sprite: gearLater, x: MACH_X + 6, y: MACH_Y + 4 },
    { sprite: coinDrop, x: MACH_X + 13, y: MACH_Y + 5 },
    { sprite: reach, x: ARM_X, y: ARM_Y },
    { sprite: knobGlint, x: LEVER_X + 1, y: LEVER_Y, motion: { kind: 'twinkle', periodMs: 1700, min: 0 } },
    { sprite: lampGlow, x: 26, y: 26, motion: { kind: 'twinkle', periodMs: 3200, min: 0.45 } },
  ],
};

/** The machine's brass gear, eight teeth round a white hub: the system that runs over the impulse. 13x13. */
const emblemGear: PixelSprite = {
  id: 'wm17-emblem-gear',
  name: 'wm17-emblem-gear',
  tags: ['scene', 'wm17'],
  rows: [
    '.....yGg.....',
    '.yg..yGg..Gg.',
    '.yGGyGGGGGgg.',
    '..yGGGGGGGg..',
    '..yGGOOOGGg..',
    'yyGGOwwwOGGgg',
    'yGGGOwwwOGggg',
    'yGGGOwwwOgggO',
    '..GGgOOOggg..',
    '..gGGGggggO..',
    '.gGGgggggggO.',
    '.gO..ggO..gO.',
    '.....ggO.....',
  ],
};

export const wm17Finish: SceneArt = wmKeepsake(
  'wm17-finish',
  emblemGear,
  'A green crest with a gold rim bearing a brass gear with a white hub, framed by laurel over a purple banner, with sparkles around it.',
);

export const art: LessonArtSet = { opener: wm17Opener, backdrop: wmBackdrop, finish: wm17Finish };
