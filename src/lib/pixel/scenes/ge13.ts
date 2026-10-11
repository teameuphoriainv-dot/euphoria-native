/**
 * Global Economics lesson 13: economic indicators and leading signals, on the pier at night.
 *
 * A storm is gathering over the far shore and the harbor has seen it coming: the lighthouse sweeps
 * its beam toward it and the lamps on the signal mast change from green to amber to red before the
 * first drop lands here. Leading indicators turn before the economy does, and the student at the
 * railing is reading them. Only small layers move: the beam, the mast's lamps and its beacon, the
 * lightning, a fishing boat heading in, the pier lamps and the stars.
 *
 * The keepsake's emblem is the lighthouse sweeping its beam.
 */
import type { PixelSprite } from '../types';
import { geBackdrop } from './ge-backdrop';
import { GE_PALETTE, geBeacon, geCompose, geLighthouse, geStar, geStarBig } from './ge-kit';
import { GE_PIER_LAMPS, geGroundPier, geLampGlow, geStudentBack } from './ge-kit-a';
import { geKeepsake } from './ge1-finish';
import type { LessonArtSet, SceneArt } from './types';

/* ── one-off props ──────────────────────────────────────────────────────────────────────────── */

/** The storm, 41x24: a bank of dark round lobes lit along their tops, rain slanting down to the far shore. */
const storm: PixelSprite = {
  id: 'ge13-opener-storm',
  name: 'storm cloud',
  tags: ['ge13', 'prop'],
  blurb: 'A dark storm cloud with a moonlit top and slanting rain.',
  palette: GE_PALETTE,
  rows: [
    '...............XXXX.XXXXXXXX.............',
    '.............XXDDDDXDDDDDDDDX............',
    '............XDDYYYYDYYYYYYYYDXXXX........',
    '........XXXXDYYYYYYYYYYYYYYYYDDDDXX......',
    '......XXDDDDYYYYYYYYYYYYYYYYYYYYYDD......',
    '......DDYYYYYYYYYYYYYYYYYYYYYYYYYYYX.....',
    '.....XYYYYYYYYYYYYYYYYYYYYYYYYYYYYYDXXX..',
    '..XXXDYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYDDDX.',
    '.XDDDYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYDX',
    'XDYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYD',
    'DYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY',
    'YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY',
    'YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY',
    'YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    '.......D...........D...........D.........',
    '.......D...D.......D...D.......D...D.....',
    '...D..D....D...D..D....D...D..D....D...D.',
    '...D......D....D......D....D......D....D.',
    '..D..D........D..D........D..D........D..',
    '.....D...D.......D...D.......D...D.......',
    '.D.......D...D.......D...D.......D...D...',
    '.D...........D...........D...........D...',
  ],
};

/** The signal mast, 14x38: a yard near the top and three lamp housings hung from it, dark until lit. */
const mast: PixelSprite = {
  id: 'ge13-opener-mast',
  name: 'signal mast',
  tags: ['ge13', 'prop'],
  blurb: 'A harbor signal mast with three lamp housings hanging from its yard.',
  palette: GE_PALETTE,
  rows: [
    '..............',
    '..............',
    '.....XD.......',
    '.....XD.......',
    'DDDDDDDDDDDDD.',
    'DXXXXXXXXXXXX.',
    '.....XD....D..',
    '.....XD..Dkkk.',
    '.....XD..Dkkk.',
    '.....XD..Dkkk.',
    '.....XD..DDDD.',
    '.....XD....D..',
    '.....XD..Dkkk.',
    '.....XD..Dkkk.',
    '.....XD..Dkkk.',
    '.....XD..DDDD.',
    '.....XD....D..',
    '.....XD..Dkkk.',
    '.....XD..Dkkk.',
    '.....XD..Dkkk.',
    '.....XD..DDDD.',
    '.....XD.......',
    '.....XD.......',
    '.....XD.......',
    '.....XD.......',
    '.....XD.......',
    '.....XD.......',
    '.....XD.......',
    '.....XD.......',
    '.....XD.......',
    '.....XD.......',
    '.....XD.......',
    '.....XD.......',
    '.....XD.......',
    '.....XD.......',
    '.....XD.......',
    '....DDDD......',
    '...kkkkkk.....',
  ],
};

/** The rocks the lighthouse stands in, 18x6. */
const rocks: PixelSprite = {
  id: 'ge13-opener-rocks',
  name: 'rocks',
  tags: ['ge13', 'prop'],
  blurb: 'Dark rocks at the foot of a lighthouse.',
  palette: GE_PALETTE,
  rows: [
    '....DDDD..DDD.....',
    '..DDXXXDDDXXDD....',
    '.DXXxXXDDXxXXDDD..',
    'DXxXXXDkDXXXXXXDD.',
    'DDDDDDkkkDDDDDDDDD',
    'kkkkkkkkkkkkkkkkkk',
  ],
};

/** The mast's three lamps, 3x13: green lit, then amber, then red, the signal turning ahead of the storm. */
const signal: PixelSprite = {
  id: 'ge13-opener-signal',
  name: 'signal lamps',
  tags: ['ge13', 'animated'],
  blurb: 'Three signal lamps lighting green, then amber, then red.',
  palette: GE_PALETTE,
  rows: [
    'nNn',
    'NmN',
    'nNn',
    '...',
    '...',
    '...',
    '...',
    '...',
    '...',
    '...',
    '...',
    '...',
    '...',
  ],
  frames: [
    [
      'nNn',
      'NmN',
      'nNn',
      '...',
      '...',
      '...',
      '...',
      '...',
      '...',
      '...',
      '...',
      '...',
      '...',
    ],
    [
      '...',
      '...',
      '...',
      '...',
      '...',
      'gGg',
      'GyG',
      'gGg',
      '...',
      '...',
      '...',
      '...',
      '...',
    ],
    [
      '...',
      '...',
      '...',
      '...',
      '...',
      '...',
      '...',
      '...',
      '...',
      '...',
      'rRr',
      'RsR',
      'rRr',
    ],
  ],
  frameMs: 1100,
};

/** The lighthouse beam, 58x5 with the lamp at local x 44 to 47: swept left toward the storm, dark, a short sweep right, dark. */
const beam: PixelSprite = {
  id: 'ge13-opener-beam',
  name: 'lighthouse beam',
  tags: ['ge13', 'animated'],
  blurb: 'A lighthouse beam, bright at the lamp and widening, sweeping left and then right.',
  palette: GE_PALETTE,
  rows: [
    'j.j.j.j.j.j.j.j.j.........................................',
    '.j.j.j.jjjjjOOOOOOOOOOOOOOOOOOOOOOOO......................',
    'j.j.j.j.jjjjOOOOOOOOOOOOOOOOGGGGGGGGGGGyyyyy..............',
    '.j.j.j.jjjjjOOOOOOOOOOOOOOOOOOOOOOOO......................',
    'j.j.j.j.j.j.j.j.j.........................................',
  ],
  frames: [
    [
      'j.j.j.j.j.j.j.j.j.........................................',
      '.j.j.j.jjjjjOOOOOOOOOOOOOOOOOOOOOOOO......................',
      'j.j.j.j.jjjjOOOOOOOOOOOOOOOOGGGGGGGGGGGyyyyy..............',
      '.j.j.j.jjjjjOOOOOOOOOOOOOOOOOOOOOOOO......................',
      'j.j.j.j.j.j.j.j.j.........................................',
    ],
    [
      '..........................................................',
      '..........................................................',
      '..........................................................',
      '..........................................................',
      '..........................................................',
    ],
    [
      '..........................................................',
      '......................................................OOOO',
      '................................................yyyyGGGGGG',
      '......................................................OOOO',
      '..........................................................',
    ],
    [
      '..........................................................',
      '..........................................................',
      '..........................................................',
      '..........................................................',
      '..........................................................',
    ],
  ],
  frameMs: 700,
};

/** A bolt of lightning, 5x8, flashing twice and going dark. */
const lightning: PixelSprite = {
  id: 'ge13-opener-lightning',
  name: 'lightning',
  tags: ['ge13', 'animated'],
  blurb: 'A forked bolt of lightning flashing.',
  palette: GE_PALETTE,
  rows: [
    '...zy',
    '..zy.',
    '.zy..',
    'zzzy.',
    '..zy.',
    '.zy..',
    '.y...',
    'y....',
  ],
  frames: [
    [
      '.....',
      '.....',
      '.....',
      '.....',
      '.....',
      '.....',
      '.....',
      '.....',
    ],
    [
      '.....',
      '.....',
      '.....',
      '.....',
      '.....',
      '.....',
      '.....',
      '.....',
    ],
    [
      '...zy',
      '..zy.',
      '.zy..',
      'zzzy.',
      '..zy.',
      '.zy..',
      '.y...',
      'y....',
    ],
    [
      '.....',
      '.....',
      '.....',
      '.....',
      '.....',
      '.....',
      '.....',
      '.....',
    ],
    [
      '...zy',
      '..zy.',
      '.zy..',
      'zzzy.',
      '..zy.',
      '.zy..',
      '.y...',
      'y....',
    ],
    [
      '.....',
      '.....',
      '.....',
      '.....',
      '.....',
      '.....',
      '.....',
      '.....',
    ],
  ],
  frameMs: 320,
};

/** A fishing boat heading in, 9x5, its lantern lit. */
const boat: PixelSprite = {
  id: 'ge13-opener-boat',
  name: 'fishing boat',
  tags: ['ge13', 'prop'],
  blurb: 'A small fishing boat with a lit lantern on its mast.',
  palette: GE_PALETTE,
  rows: [
    '....y....',
    '....D....',
    '...DXD...',
    'DDDDDDDDD',
    '.D11111D.',
  ],
};

/* ── the opener ─────────────────────────────────────────────────────────────────────────────── */

const STORM = { x: 11, y: 2 };
/** The storm's flat underside, where the lightning breaks out of it. */
const CLOUD_BASE = STORM.y + 15;
const MAST = { x: 3, y: 9 };
/** The mast's three lamp housings, top to bottom, five rows apart. */
const SIGNAL = { x: MAST.x + 10, y: MAST.y + 7 };
const ROCKS = { x: 59, y: 29 };
/** The lighthouse stands in the rocks; its lamp is on its row 3, where the beam starts. */
const LIGHTHOUSE = { x: 63, y: 12 };
const BEAM = { x: 22, y: 13 };
/** Where the student stands at the railing, looking out to sea. */
const STUDENT = { x: 28, y: 22 };

const base = geCompose('ge13-opener-base', geGroundPier, [
  { sprite: storm, x: STORM.x, y: STORM.y },
  { sprite: geLighthouse, x: LIGHTHOUSE.x, y: LIGHTHOUSE.y },
  { sprite: rocks, x: ROCKS.x, y: ROCKS.y },
  { sprite: mast, x: MAST.x, y: MAST.y },
  { sprite: geStudentBack, x: STUDENT.x, y: STUDENT.y },
]);

export const ge13Opener: SceneArt = {
  id: 'ge13-opener',
  label: 'At night on a pier, a lighthouse sweeps its beam toward a storm gathering over the far shore while the lamps on a signal mast change from green to amber to red, and a student watches from the railing.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: beam, x: BEAM.x, y: BEAM.y },
    { sprite: signal, x: SIGNAL.x, y: SIGNAL.y },
    { sprite: geBeacon, x: MAST.x + 5, y: MAST.y + 1 },
    { sprite: lightning, x: 22, y: CLOUD_BASE },
    { sprite: boat, x: 47, y: 29, motion: { kind: 'bob', amp: 1, periodMs: 2800 } },
    { sprite: geLampGlow, x: GE_PIER_LAMPS[0].x, y: GE_PIER_LAMPS[0].y, motion: { kind: 'twinkle', periodMs: 2600, min: 0.45 } },
    { sprite: geLampGlow, x: GE_PIER_LAMPS[1].x, y: GE_PIER_LAMPS[1].y, motion: { kind: 'twinkle', periodMs: 3100, phase: 0.5, min: 0.45 } },
    { sprite: geStarBig, x: 58, y: 3, motion: { kind: 'twinkle', periodMs: 2400, min: 0.3 } },
    { sprite: geStar, x: 2, y: 2, motion: { kind: 'twinkle', periodMs: 1900, phase: 0.4, min: 0.2 } },
    { sprite: geStar, x: 71, y: 6, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.7, min: 0.2 } },
    { sprite: geStar, x: 77, y: 1, motion: { kind: 'twinkle', periodMs: 2100, phase: 0.2, min: 0.25 } },
  ],
};

/* ── the keepsake ───────────────────────────────────────────────────────────────────────────── */

/** A signal read early: the lighthouse on its rock, its beam sweeping left and then right over the waves. */
const emblemLighthouse: PixelSprite = {
  id: 'ge13-emblem-lighthouse',
  name: 'emblem lighthouse',
  tags: ['ge', 'emblem', 'animated'],
  blurb: 'A striped lighthouse on a rock in the waves, its beam sweeping left and then right.',
  palette: GE_PALETTE,
  rows: [
    '.......DD.......',
    '......DXXD......',
    'OO...DDDDDD.....',
    'yyGO.DGyyGD.....',
    'OO...DDDDDD.....',
    '......DxxD......',
    '......DrrD......',
    '......DxxD......',
    '......DxxD......',
    '.....DrrrrD.....',
    '.....DxxxxD.....',
    '.....DxxxxD.....',
    '.....DrrrrD.....',
    '..DDDDDDDDDDDD..',
    'BB.dddd..dddd.BB',
    '.BBB..BBBB..BBB.',
  ],
  frames: [
    [
      '.......DD.......',
      '......DXXD......',
      'OO...DDDDDD.....',
      'yyGO.DGyyGD.....',
      'OO...DDDDDD.....',
      '......DxxD......',
      '......DrrD......',
      '......DxxD......',
      '......DxxD......',
      '.....DrrrrD.....',
      '.....DxxxxD.....',
      '.....DxxxxD.....',
      '.....DrrrrD.....',
      '..DDDDDDDDDDDD..',
      'BB.dddd..dddd.BB',
      '.BBB..BBBB..BBB.',
    ],
    [
      '.......DD.......',
      '......DXXD......',
      '.....DDDDDD.....',
      '.....DGyyGD.....',
      '.....DDDDDD.....',
      '......DxxD......',
      '......DrrD......',
      '......DxxD......',
      '......DxxD......',
      '.....DrrrrD.....',
      '.....DxxxxD.....',
      '.....DxxxxD.....',
      '.....DrrrrD.....',
      '..DDDDDDDDDDDD..',
      'BB.dddd..dddd.BB',
      '.BBB..BBBB..BBB.',
    ],
    [
      '.......DD.......',
      '......DXXD......',
      '.....DDDDDD...OO',
      '.....DGyyGD.OGyy',
      '.....DDDDDD...OO',
      '......DxxD......',
      '......DrrD......',
      '......DxxD......',
      '......DxxD......',
      '.....DrrrrD.....',
      '.....DxxxxD.....',
      '.....DxxxxD.....',
      '.....DrrrrD.....',
      '..DDDDDDDDDDDD..',
      'BB.dddd..dddd.BB',
      '.BBB..BBBB..BBB.',
    ],
    [
      '.......DD.......',
      '......DXXD......',
      '.....DDDDDD.....',
      '.....DGyyGD.....',
      '.....DDDDDD.....',
      '......DxxD......',
      '......DrrD......',
      '......DxxD......',
      '......DxxD......',
      '.....DrrrrD.....',
      '.....DxxxxD.....',
      '.....DxxxxD.....',
      '.....DrrrrD.....',
      '..DDDDDDDDDDDD..',
      'BB.dddd..dddd.BB',
      '.BBB..BBBB..BBB.',
    ],
  ],
  frameMs: 700,
};

export const ge13Finish: SceneArt = geKeepsake(
  'ge13-finish',
  'A postage stamp with perforated edges and an emerald frame, showing a striped lighthouse on a rock in the waves sweeping its beam left and right, with small sparkles around it.',
  emblemLighthouse,
);

export const art: LessonArtSet = { opener: ge13Opener, backdrop: geBackdrop, finish: ge13Finish };
