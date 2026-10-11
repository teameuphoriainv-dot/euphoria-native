/**
 * Global Economics lesson 24: development economics and poverty, in a village in the morning.
 *
 * Above the sea a path climbs into a village and forks at a signpost: one board points to the homes
 * on the hill, the other to the new clinic with a red heart over its door. Homes to live in and care
 * to stay well are what development builds, and the student has walked up the path to see it. Lesson
 * 1's signpost asked what one coin should buy; this one shows where a whole village's road can lead.
 * Only small layers move: smoke from a chimney, the clinic's heart, the clouds and two birds.
 *
 * The keepsake's emblem is a house with a heart beating over its roof.
 */
import type { PixelSprite } from '../types';
import { geBackdrop } from './ge-backdrop';
import { GE_PALETTE, geCompose, geGlyphHeart, geGlyphHouse, geGull, geLater, geSignWith, geSmoke } from './ge-kit';
import { geCloud, geCloudSmall, geStudentBack } from './ge-kit-a';
import { geKeepsake } from './ge1-finish';
import type { LessonArtSet, SceneArt } from './types';

/* ── one-off props ──────────────────────────────────────────────────────────────────────────── */

/**
 * The village in the morning, 80x60: the sun up over the left, the sea far off at the right, green
 * hills, and a path climbing from us to a fork at (40, 45), one branch to the houses on the left and
 * one to the clinic on the right, through a meadow of flowers.
 */
const village: PixelSprite = {
  id: 'ge24-opener-village',
  name: 'village in the morning',
  tags: ['ge24', 'ground'],
  blurb: 'A morning sun, the sea far off, green hills and a dirt path that forks through a flowered meadow.',
  palette: GE_PALETTE,
  rows: [
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'bbbbbbbGGGbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'bbbbbbyyyyGbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'bbbbbGyyyyGGbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'bbbbbGyyyyGGbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'bbbbbGyyyyGGbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'bbbbbbGGGGGbbbbbbbbbBBBBBBBBBBBBBbbbbbbbbbbbbbbbbbbbbbbbBBBBBBBBBBBBBBBbbbbbbbbb',
    'bbbbbbbGGGBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBbbbbbbbBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
    'BBBBBBBtttttBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
    'BBBttttttttttttttttBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
    'ttttttttttttttttttttttttBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
    'tttttttttttttttttttttttttttttttBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
    'ttttttttttttttttttttttttttttttttttttttBBBBBBddddddddddddddddddddddddddddbbbbdddd',
    'ttttttttttttttttttttttttttttttttttttttttttBBddddddbbbbbddddddddddddddddddddddddd',
    'ttttttNNNNNNttttttttttttttttttttttttttttttttttttttttddddddddddbbbbbbbddddddddddd',
    'NNNNNNnnnnnnNNNNtttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt',
    'nnnnnnnnnnnnnnnnNNNNtttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt',
    'nnnnnnnnnnnnnnnnnnnnNNNtttttttttttttttttttttttttttttttttttttttttttNNNNNNNNNttttt',
    'nnnnnnnnnnnnnnnnnnnnnnnNNttttttttttttttttttttttttttttttttttNNNNNNNnnnnnnnnnNNNNN',
    'nnnnnnnnnnnnnnnnnnnnnnnnnNNtttttttttttttttttttttttttttttNNNnnnnnnnnnnnnnnnnnnnnn',
    'nnnnnnnnnnnnnnnnnnnnnnnnnnnNNtttttttttttttttttttttttNNNNnnnnnnnnnnnnnnnnnnnnnnnn',
    'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnNNttttttttttttttttttNNNnnnnnnnnnnnnnnnnnnnnnnnnnnnn',
    'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnNNttttttttttttttNNnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn',
    'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnNNNNNttttttNNNnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn',
    'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnNNNNNNnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn',
    'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn',
    'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn',
    'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn',
    'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnoooolnnnnnnnnnnnnnnn',
    'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnooooooolnnnnnnnnnnnnnnnn',
    'nnnnnnnnnnnnnnnnooooollnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnoooooolnnnnnnnnnnnnnnnnnnn',
    'nnnnnnnnnnnnnnnnnnooooolllnnnnnnnnnnnnnnnnnnnnnnnnnnoooooolnnnnnnnnnnnnnnnnnnnnn',
    'nnnnnnnnnnnnnnnnnnnnnooooolllnnnnnnnnnnnnnnnnnnnnnoooooolnnnnnnnnnnnnnnnnnnnnnnn',
    'nnnnnnnnnnnnnnnnnnnnnnnnooooollnnnnnnnnnnnnnnnnnoooooolnnnnnnnnnnnnnnnnnnnnnnnnn',
    'nnnnnnnnnnnnnnnnnnnnnnnnnnooooolllnnnnnnnnnnnnoooooolnnnnnnnnnnnnnnnnnnnnnnnnnnn',
    'nnnnnnnnnnnnnnnnnnnnnnnnnnnnooooooolllnnnnnoooooooolnnnnnnnnnnnnnnnnnnnnnnnnnnnn',
    'nnnnnnnnnnn77777777777777nnnnnnooooooollnoooooooolnnnnnn77777777777777nnnnnnnnnn',
    '777777777778888888888888877777777ooooooooooooool77777777888888888888887777777777',
    '888888888888888888888888888888888887oooooooool8888888888888888888888888888888888',
    '8888888888888888888888888888888888888looooou888888888888888888888888888888888888',
    '888888888888888Q888888888888888888888looooou888888888888888888888888888888888888',
    '888888888888888J88888888888888888888looooooou88888888888888888888888y88888888888',
    '8888R8888888888888888888888888888888looooooou88888888888888888888888J88888888888',
    '8888J888888888888888888888888888888looooooooou888888888Q888888888888888888888888',
    '88888888888888888888888888888888888looooooooou888888888J888888888888888888888888',
    '8888888888888888888888R88888888888looooooooooou888888888888888888888888888888888',
    '8888888888888888888888J88888888888looooooooooou888888888888888888888888888R88888',
    '888888888888888888888888888888888looooooooooooou88888888888888888888888888J88888',
    '888888888y88888888888888888888888looooooooooooou88888888888888888888888888888888',
    '888888888J8888888888888888888888looooooooooooooou888888888888R888888888888888888',
    '888888888888888888888888888y8888looooooooooooooou8y8888888888J888888888888888888',
    '888888888888Q88888888888888J888looooooooooooooooouJ88888888888888888888888888Q88',
    '888888888888J888888888888888888looooooooooooooooou888888888888888888888888888J88',
  ],
};

/** The homes stepping up the left slope, one with a chimney, and the white clinic with a red heart. */
const buildings: PixelSprite = {
  id: 'ge24-opener-buildings',
  name: 'houses and clinic',
  tags: ['ge24', 'prop'],
  blurb: 'Three cream houses with red roofs and a white clinic with a red heart over its door.',
  palette: GE_PALETTE,
  rows: [
    '..........R..................................................................',
    '.........Rrr.................................................................',
    '........Rrrrr................................................................',
    '.......Rrrrrrr...............................................................',
    '......Rrrrrrrrr..............................................................',
    '.....rrrrrrrrrrr........................................xxxxxxxxxxxxxxxxxxxx.',
    '......AAAAAAAAS........................................XXXXXXXXXXXXXXXXXXXXXX',
    '......RhhAAAAAS.........................................zzzzzzzzzzzzzzzzzzzx.',
    '.....RrrhAAuuAS.........................................zzzzzzzzzRzRzzzzzzzx.',
    '....RrrrrAAuuAS.......ll................................zzBBzzBBRRsRRzBBzzzx.',
    '...RrrrrrrAuuAS....R..ll................................zzBBzzBBRRRRRzBBzzzx.',
    '..Rrrrrrrrr.......Rrr.ll................................zzzzzzzzzRRRzzzzzzzx.',
    '.Rrrrrrrrrrr.....Rrrrr..................................zzzzzzzzzzRzzzzzzzzx.',
    'rrrrrrrrrrrrr...Rrrrrrr.................................zzzzzzzzzzzzzzzzzzzx.',
    '.AAAAAAAAAAS...Rrrrrrrrr................................zzBBzzBBzzzzzzBBzzzx.',
    '.AhhAAAAAAAS..Rrrrrrrrrrr...............................zzBBzzBBzbbbzzBBzzzx.',
    '.AhhAAAAuuAS.rrrrrrrrrrrrr..............................zzzzzzzzzbbbzzzzzzzx.',
    '.AAAAAAAuuAS..AAAAAAAAAAS...............................zzzzzzzzzbbbzzzzzzzx.',
    '.AAAAAAAuuAS..AhhAAAAAAAS...............................zzzzzzzzzbbbzzzzzzzx.',
    '..............AhhAAAAuuAS...............................xxxxxxxxxbbbxxxxxxxx.',
    '..............AAAAAAAuuAS....................................................',
    '..............AAAAAAAuuAS....................................................',
  ],
};

/** The clinic's heart lit pale, for a slow `twinkle` over the red one so it beats. */
const heartGlow: PixelSprite = {
  id: 'ge24-opener-heart-glow',
  name: 'heart glow',
  tags: ['ge24'],
  blurb: 'A pale pink heart.',
  palette: GE_PALETTE,
  rows: [
    '.s.s.',
    'sssss',
    'sssss',
    '.sss.',
    '..s..',
  ],
};

/* ── the opener ─────────────────────────────────────────────────────────────────────────────── */

/** The signpost's foot stands on the fork; the house board points left, the heart board right. */
const SIGN = { x: 28, y: 18 };
/** Where the student stands, on the path below the fork, looking up at the sign. */
const STUDENT = { x: 20, y: 35 };
/** The top of the chimney on the nearest house, where the smoke leaves it. */
const CHIMNEY = { x: 21, y: 21 };

const base = geCompose('ge24-opener-base', village, [
  { sprite: buildings, x: 0, y: 15 },
  { sprite: geSignWith('ge24-opener-sign', geGlyphHouse, geGlyphHeart), x: SIGN.x, y: SIGN.y },
  { sprite: geStudentBack, x: STUDENT.x, y: STUDENT.y },
]);

const gullLater = geLater(geGull, 'ge24-opener-gull-later', 1, 520);

export const ge24Opener: SceneArt = {
  id: 'ge24-opener',
  label: 'On a sunny morning in a village above the sea, a student walks up a path to a signpost whose boards point one way to the homes on the hill and the other to a clinic with a red heart over its door.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: geSmoke, x: CHIMNEY.x, y: CHIMNEY.y, motion: { kind: 'rise', amp: 6, periodMs: 3000 } },
    { sprite: geSmoke, x: CHIMNEY.x + 1, y: CHIMNEY.y, motion: { kind: 'rise', amp: 6, periodMs: 3000, phase: 0.5 } },
    { sprite: heartGlow, x: 64, y: 23, motion: { kind: 'twinkle', periodMs: 1400, min: 0 } },
    { sprite: geCloud, x: 44, y: 5, motion: { kind: 'drift', amp: 3, periodMs: 15000 } },
    { sprite: geCloudSmall, x: 18, y: 3, motion: { kind: 'drift', amp: 2, periodMs: 11000, phase: 0.5 } },
    { sprite: geGull, x: 30, y: 9, motion: { kind: 'drift', amp: 3, periodMs: 7000 } },
    { sprite: gullLater, x: 66, y: 13, motion: { kind: 'drift', amp: 2, periodMs: 8200, phase: 0.4 } },
  ],
};

/* ── the keepsake ───────────────────────────────────────────────────────────────────────────── */

/** Development: a home with a heart beating over its roof, somewhere to live and the health to live there. */
const emblemHome: PixelSprite = {
  id: 'ge24-emblem-home',
  name: 'emblem home and heart',
  tags: ['ge', 'emblem', 'animated'],
  blurb: 'A cream house with a red roof and a lit window, a red heart beating over it.',
  palette: GE_PALETTE,
  rows: [
    '................',
    '......R.R.......',
    '.....RsRRR......',
    '......RRR.......',
    '.......R........',
    '................',
    '.......Rr.......',
    '......Rrrr......',
    '.....Rrrrrr.....',
    '....Rrrrrrrr....',
    '..Rrrrrrrrrrrr..',
    '...AAAAAAAAAS...',
    '...AyyAAAuuAS...',
    '...AyyAAAuuAS...',
    '..NAAAAAAuuASN..',
    '.nnnnnnnnnnnnnn.',
  ],
  frames: [
    [
      '................',
      '......R.R.......',
      '.....RsRRR......',
      '......RRR.......',
      '.......R........',
      '................',
      '.......Rr.......',
      '......Rrrr......',
      '.....Rrrrrr.....',
      '....Rrrrrrrr....',
      '..Rrrrrrrrrrrr..',
      '...AAAAAAAAAS...',
      '...AyyAAAuuAS...',
      '...AyyAAAuuAS...',
      '..NAAAAAAuuASN..',
      '.nnnnnnnnnnnnnn.',
    ],
    [
      '.....RR.RR......',
      '....RsRRRRR.....',
      '....RRRRRRR.....',
      '.....RRRRR......',
      '......RRR.......',
      '.......R........',
      '.......Rr.......',
      '......Rrrr......',
      '.....Rrrrrr.....',
      '....Rrrrrrrr....',
      '..Rrrrrrrrrrrr..',
      '...AAAAAAAAAS...',
      '...AyyAAAuuAS...',
      '...AyyAAAuuAS...',
      '..NAAAAAAuuASN..',
      '.nnnnnnnnnnnnnn.',
    ],
    [
      '................',
      '......R.R.......',
      '.....RsRRR......',
      '......RRR.......',
      '.......R........',
      '................',
      '.......Rr.......',
      '......Rrrr......',
      '.....Rrrrrr.....',
      '....Rrrrrrrr....',
      '..Rrrrrrrrrrrr..',
      '...AAAAAAAAAS...',
      '...AyyAAAuuAS...',
      '...AyyAAAuuAS...',
      '..NAAAAAAuuASN..',
      '.nnnnnnnnnnnnnn.',
    ],
    [
      '................',
      '......R.R.......',
      '.....RsRRR......',
      '......RRR.......',
      '.......R........',
      '................',
      '.......Rr.......',
      '......Rrrr......',
      '.....Rrrrrr.....',
      '....Rrrrrrrr....',
      '..Rrrrrrrrrrrr..',
      '...AAAAAAAAAS...',
      '...AyyAAAuuAS...',
      '...AyyAAAuuAS...',
      '..NAAAAAAuuASN..',
      '.nnnnnnnnnnnnnn.',
    ],
  ],
  frameMs: 380,
};

export const ge24Finish: SceneArt = geKeepsake(
  'ge24-finish',
  'A postage stamp with perforated edges and an emerald frame, showing a cream house with a red roof and a red heart beating over it, with small sparkles around it.',
  emblemHome,
);

export const art: LessonArtSet = { opener: ge24Opener, backdrop: geBackdrop, finish: ge24Finish };
