/**
 * Global Economics lesson 13: economic indicators and leading signals, on the pier at night.
 *
 * The harbor keeps a signal board on the pier, and the student stands under it reading. Its top row
 * is the economy's three vital signs as dials with red, amber and green zones, each marked with the
 * lesson's own sign: output (a factory) and jobs (a briefcase) in the green, prices (a tag) just into
 * the amber, as the lesson's numbers put them (GDP 2.5%, unemployment 3.7%, CPI 3.1%). Its bottom row
 * is the leading signals, the ones about what is coming: the Leading Economic Index falling six months
 * running, the yield curve inverted, and the warning lamp beside them lit red. A storm is gathering
 * over the far shore and has not reached the pier yet. The dials, bars and curve stay still; only
 * small layers move: the warning lamp, the lightning, a fishing boat heading in, the pier lamps and
 * the stars.
 *
 * The keepsake's emblem is the board in small: a dial in the green over falling bars and the red lamp.
 */
import type { PixelSprite } from '../types';
import { geBackdrop } from './ge-backdrop';
import { GE_PALETTE, geCompose, geStar, geStarBig } from './ge-kit';
import { GE_PIER_LAMPS, geGroundPier, geLampGlow, geShadow, geStudentBack } from './ge-kit-a';
import { geKeepsake } from './ge1-finish';
import type { LessonArtSet, SceneArt } from './types';

/* ── one-off props ──────────────────────────────────────────────────────────────────────────── */

/** The storm, 30x22: a bank of round lobes lit along their tops, a dark underside, rain slanting down to the far shore. */
const storm: PixelSprite = {
  id: 'ge13-opener-storm',
  name: 'storm cloud',
  tags: ['ge13', 'prop'],
  blurb: 'A grey storm cloud with a moonlit top, a dark underside and slanting rain.',
  palette: GE_PALETTE,
  rows: [
    '..............................',
    '...........xxx................',
    '.........xxXXXxx.XXXXX........',
    '........xXXDDDXXXXXXXXX.......',
    '........XDDDDDDDXDDDDDXX......',
    '.....xxxDDDDDDDDDDDDDDDX......',
    '....xXXXDDDDDDDDDDDDDDDDXXXX..',
    '...xXDDDDDDDDDDDDDDDDDDDXXXXX.',
    '..xXDDDDDDDDDDDDDDDDDDDDDDDDX.',
    '..XDDDDDDDDDDDDDDDDDDDDDDDDDD.',
    '..XDDDDDDDDDDDDDDDDDDDDDDDDDD.',
    '...YYYYYYYYYYYYYYYYYYYYYYYYYY.',
    '....YYYYYYYY..YYY..YYYYYYYYY..',
    '..........X..........X........',
    '.........X......X...X.....D...',
    '...............X.........D....',
    '.............D..........X.....',
    '............D......X...X......',
    '..................X.........D.',
    '...........X..........X....D..',
    '..........X.....D....X....X...',
    '...............D.........X....',
  ],
};

/**
 * The harbor's signal board, 43x42 with its legs. Top row: three dials (red, amber, green zones, a
 * white needle) over a factory, a briefcase and a price tag, for output, jobs and prices. Below a rule:
 * the Leading Economic Index as six bars stepping down, the yield curve inverted (high at the short
 * end, falling to the long end), and the warning lamp's housing at local (34, 19), its glass a layer.
 */
const board: PixelSprite = {
  id: 'ge13-opener-board',
  name: 'signal board',
  tags: ['ge13', 'prop'],
  blurb: 'A steel-framed signal board on two legs: three dials over a factory, a briefcase and a price tag, then six falling red bars, a falling red curve and a lamp housing.',
  palette: GE_PALETTE,
  rows: [
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    'DxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxD',
    'DxaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaXD',
    'DxaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaXD',
    'DxaaaaGGGGGaaaaaaaaGGGGGaaaaaaaaGGGGGaaaaXD',
    'DxaaaRGGGGGNaaaaaaRGGGGGNaaaaaaRGGGGGNaaaXD',
    'DxaaRRRaaaNNNaaaaRRRaaaNNNaaaaRRRaazNNNaaXD',
    'DxaRRRaaaazNNNaaRRRaaaaazNNaaRRRaaazaNNNaXD',
    'DxaRRaaaazaaNNaaRRaaaazzaNNaaRRaaazaaaNNaXD',
    'DxaRRaaazaaaNNaaRRaaazaaaNNaaRRaaazaaaNNaXD',
    'DxaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaXD',
    'DxaaaxaaaaaaaaaaaaaaOOOaaaaaaaaaaAAAAAaaaXD',
    'DxaaaxaxxaxxaaaaaaOOOOOOOaaaaaaaAAAAAAaaaXD',
    'DxaaaxxxxxxxaaaaaaOgGyGgOaaaaaaAKAAAAAaaaXD',
    'DxaaaxGxGxGxaaaaaaOgggggOaaaaaaaASAAAAaaaXD',
    'DxaaaxxxxxxxaaaaaaOOOOOOOaaaaaaaaSSSSSaaaXD',
    'DxaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaXD',
    'DxDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDXD',
    'DxaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaXD',
    'DxaRraaaaaaaaaaaaaaaaaDaaaaaaaaaaaaDDDDDaXD',
    'DxaRraRraaaaaaaaaaaaaaDssssaaaaaaaDDaaaDDXD',
    'DxaRraRraRraaaaaaaaaaaDRRRRssaaaaaDaaaaaDXD',
    'DxaRraRraRraRraaaaaaaaDaaaaRRsaaaaDaaaaaDXD',
    'DxaRraRraRraRraRraaaaaDaaaaaaRssaaDaaaaaDXD',
    'DxaRraRraRraRraRraRraaDaaaaaaaRRsaDDaaaDDXD',
    'DxaRraRraRraRraRraRraaDaaaaaaaaaRaaDDDDDaXD',
    'DxaDDDDDDDDDDDDDDDDDaaDDDDDDDDDDDaaaaaaaaXD',
    'DxXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXD',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    '......xX...........................xX......',
    '......xX...........................xX......',
    '......xX...........................xX......',
    '......xX...........................xX......',
    '......xX...........................xX......',
    '......xX...........................xX......',
    '......xX...........................xX......',
    '......xX...........................xX......',
    '......xX...........................xX......',
    '......xX...........................xX......',
    '......xX...........................xX......',
    '......xX...........................xX......',
    '.....DDDD.........................DDDD.....',
  ],
};

/** The warning lamp's glass, 5x5: lit red, then dimmed, so it blinks without ever going green. */
const warningLamp: PixelSprite = {
  id: 'ge13-opener-lamp',
  name: 'warning lamp',
  tags: ['ge13', 'animated'],
  blurb: 'A round red warning lamp blinking bright and dim.',
  palette: GE_PALETTE,
  rows: [
    '.RRR.',
    'RzsRR',
    'RsRRR',
    'RRRRr',
    '.rrr.',
  ],
  frames: [
    [
      '.RRR.',
      'RzsRR',
      'RsRRR',
      'RRRRr',
      '.rrr.',
    ],
    [
      '.rrr.',
      'rsrrr',
      'rrrrr',
      'rrrr1',
      '.111.',
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

const STORM = { x: 0, y: 2 };
/** The storm's underside, where the lightning breaks out of it. */
const CLOUD_BASE = STORM.y + 13;
/** The board stands on the pier; its legs end on the boardwalk at row 44. */
const BOARD = { x: 30, y: 3 };
/** The lamp's glass in its housing on the board's bottom row. */
const LAMP = { x: BOARD.x + 35, y: BOARD.y + 20 };
/** Where the student stands, under the board and looking up at it. */
const STUDENT = { x: 41, y: 33 };

const base = geCompose('ge13-opener-base', geGroundPier, [
  { sprite: storm, x: STORM.x, y: STORM.y },
  { sprite: board, x: BOARD.x, y: BOARD.y },
  { sprite: geShadow, x: STUDENT.x + 7, y: STUDENT.y + 24 },
  { sprite: geStudentBack, x: STUDENT.x, y: STUDENT.y },
]);

export const ge13Opener: SceneArt = {
  id: 'ge13-opener',
  label: 'At night on a pier, a student reads a harbor signal board: its three dials for output, jobs and prices still read green or amber, but on the leading row below, beside a falling index and an inverted yield curve, a red warning lamp blinks while a storm gathers over the far shore.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: warningLamp, x: LAMP.x, y: LAMP.y },
    { sprite: lightning, x: 14, y: CLOUD_BASE },
    { sprite: boat, x: 12, y: 28, motion: { kind: 'bob', amp: 1, periodMs: 2800 } },
    { sprite: geLampGlow, x: GE_PIER_LAMPS[0].x, y: GE_PIER_LAMPS[0].y, motion: { kind: 'twinkle', periodMs: 2600, min: 0.45 } },
    { sprite: geLampGlow, x: GE_PIER_LAMPS[1].x, y: GE_PIER_LAMPS[1].y, motion: { kind: 'twinkle', periodMs: 3100, phase: 0.5, min: 0.45 } },
    { sprite: geStarBig, x: 75, y: 6, motion: { kind: 'twinkle', periodMs: 2400, min: 0.3 } },
    { sprite: geStar, x: 2, y: 1, motion: { kind: 'twinkle', periodMs: 1900, phase: 0.4, min: 0.2 } },
    { sprite: geStar, x: 28, y: 1, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.7, min: 0.2 } },
    { sprite: geStar, x: 77, y: 13, motion: { kind: 'twinkle', periodMs: 2100, phase: 0.2, min: 0.25 } },
  ],
};

/* ── the keepsake ───────────────────────────────────────────────────────────────────────────── */

/** Signals read early: a dial still in the green over the leading index falling and the warning lamp blinking red. */
const emblemDashboard: PixelSprite = {
  id: 'ge13-emblem-dashboard',
  name: 'emblem signal dashboard',
  tags: ['ge', 'emblem', 'animated'],
  blurb: 'A dial with red, amber and green zones and its needle in the green, over three falling red bars and a red warning lamp that blinks.',
  palette: GE_PALETTE,
  rows: [
    '................',
    '.......GG.......',
    '....GGGGGGGG....',
    '...RRGGGGGGNN...',
    '..RRR......NNN..',
    '.RRR......z.NNN.',
    '.RR......zz..NN.',
    '.RR.....zz...NN.',
    'RRR....zz....NNN',
    '.....xxxxxx.....',
    '.Rr.........RRR.',
    '.Rr.Rr.....RzsRR',
    '.Rr.Rr.Rr..RsRRR',
    '.Rr.Rr.Rr..RRRRr',
    '.Rr.Rr.Rr...rrr.',
    '.Rr.Rr.Rr.......',
  ],
  frames: [
    [
      '................',
      '.......GG.......',
      '....GGGGGGGG....',
      '...RRGGGGGGNN...',
      '..RRR......NNN..',
      '.RRR......z.NNN.',
      '.RR......zz..NN.',
      '.RR.....zz...NN.',
      'RRR....zz....NNN',
      '.....xxxxxx.....',
      '.Rr.........RRR.',
      '.Rr.Rr.....RzsRR',
      '.Rr.Rr.Rr..RsRRR',
      '.Rr.Rr.Rr..RRRRr',
      '.Rr.Rr.Rr...rrr.',
      '.Rr.Rr.Rr.......',
    ],
    [
      '................',
      '.......GG.......',
      '....GGGGGGGG....',
      '...RRGGGGGGNN...',
      '..RRR......NNN..',
      '.RRR......z.NNN.',
      '.RR......zz..NN.',
      '.RR.....zz...NN.',
      'RRR....zz....NNN',
      '.....xxxxxx.....',
      '.Rr.........rrr.',
      '.Rr.Rr.....rsrrr',
      '.Rr.Rr.Rr..rrrrr',
      '.Rr.Rr.Rr..rrrr1',
      '.Rr.Rr.Rr...111.',
      '.Rr.Rr.Rr.......',
    ],
  ],
  frameMs: 700,
};

export const ge13Finish: SceneArt = geKeepsake(
  'ge13-finish',
  'A postage stamp with perforated edges and an emerald frame, showing a dial with its needle still in the green above three falling red bars and a blinking red warning lamp, with small sparkles around it.',
  emblemDashboard,
);

export const art: LessonArtSet = { opener: ge13Opener, backdrop: geBackdrop, finish: ge13Finish };
