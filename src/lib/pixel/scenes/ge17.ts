/**
 * Global Economics lesson 17: commodity markets and natural resources, in the fields at golden hour.
 *
 * Above the sea the land turns into what the world trades by the shipload: a pump jack nods on the
 * oil field beside its storage tank, a grain silo and a red barn stand on the farm across the road,
 * and blue oil drums and sacks of grain wait at the roadside for the tanker out on the water. Oil and
 * food are the physical economy, priced the same the world over. Only small layers move: the pump
 * jack, the wheat in the wind, the tanker, two birds and the low sun.
 *
 * The keepsake's emblem is an oil drum beside a sheaf of wheat.
 */
import type { PixelSprite } from '../types';
import { geBackdrop } from './ge-backdrop';
import { GE_PALETTE, geCompose, geGull, geLater } from './ge-kit';
import { geKeepsake } from './ge1-finish';
import type { LessonArtSet, SceneArt } from './types';

/* ── one-off props ──────────────────────────────────────────────────────────────────────────── */

/**
 * The fields at golden hour, 80x60: the sun low at the left edge over a band of sea, green hills
 * from row 20, and ripe wheat from row 34 to the bottom, a dirt road climbing through it to the right.
 */
const fields: PixelSprite = {
  id: 'ge17-opener-fields',
  name: 'fields at golden hour',
  tags: ['ge17', 'ground'],
  blurb: 'A low golden sun over the sea, green hills, and ripe wheat with a dirt road climbing through it.',
  palette: GE_PALETTE,
  rows: [
    'IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII',
    'IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII',
    'IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII',
    'IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII',
    'IIIIIIIIII2222222222222222222222222222222IIIIIIIIIIIIIIIII2222222222222IIIIIIIII',
    '22222222222222222222222222222222222222222222222222222222222222222222222222222222',
    '22222222222222222222222222222222222222222222222222222222222222222222222222222222',
    '22222222222222222222222222222222222222222222222222222222222222222222222222222222',
    '22222222222222222222222222222222222222222222222222222222222222222222222222222222',
    '33333333333333333333333222222222222222222222333333333333333333333332222222222222',
    '33333333333333333333333333333333333333333333333333333333333333333333333333333333',
    '33333333333333333333333333333333333333333333333333333333333333333333333333333333',
    '33355533333333333333333333333333333333333333333333333333333333333333333333333333',
    '33555553333333333333333333333333333333333333333333333333333333333333333333333333',
    '33555553333333333333333333333333333333333333333333333333333333333333333333333333',
    '33555554444444444444444444444443333333333333333333334444444444444444444444433333',
    '44455544444444444444444444444444444444444444444444444444444444444444444444444444',
    '44444444444444444444444444444444444444444444444444444444444444444444444444444444',
    '44444444444444444444444444444444444444444444444444444444444444444444444444444444',
    '44444444444444444444444444444444444444444444444444444444444444444444444444444444',
    '444444444444444444444444444444444444444444444444444444444444444NNNNN444444444444',
    '44444444444444444444444444444444444444444444444444444444444NNNNn8888NNNNNNNN4444',
    'd44444444ddddddddddddddddddddddddddddddddddddddddddddddNNNNn888n888888888888NNNN',
    '4444dd444444dddddddddNNNNNNNddcccccccddddddddddddddddNNn888n88888888888888888888',
    'dd44444ddddddddNNNNNNn888888NNNNNNddddddddddccccccNNNn8n888888888888888888888888',
    'IIIIIIIIIIINNNNn88888n888888888888NNNNIIIIIIINNNNNn88n88888888888888888888888888',
    'IIIIINNNNNNn888n8888888888888888888888NNNNNNNn8888n88888888888888888888888888888',
    'NNNNNn88888n888888888888888888888888888888888n8888888888888888888888888888888888',
    '88888n88888888888888888888888888888888888888888888888888888888888888888888888888',
    '88888888888888888888888888888888888888888888888888888888888888888888888888888888',
    '88888888888888888888888888888888888888888888888888888888888888888888888888888888',
    '88888888888888888888888888888888888888888888888888888888888888888888888888888888',
    '88888888888888888888888888888888888888888888888888888888888888888888888888888888',
    '88888888888888888888888888888888888888888888888888888888888888888888888888888888',
    'gggggggggyGGGGGGGGgggggggggGGGGyGGGGggggggggollluGGGGygggggggggGyGGGGGGGgggggggg',
    'GGGGGGGyGgggggggggyGGGGGGGGgggggggggGGGGyGGGolllugggggGGGGGGGGygggggggggGyGGGGGG',
    'gggggggggGGGGGGGyGgggggggggyGGGGGGGGgggggggggollluGGGGgggggggggGGGGGGGGygggggggg',
    'GGGyGGGGGgggggggggGGGGGGGyGgggggggggyGGGGGGGGollluggggGGGGyGGGGgggggggggGGGGGGGG',
    'gggggggggGGGyGGGGGgggggggggGGGGGGGyGgggggggggyollluGGGgggggggggGGGGyGGGGgggggggg',
    'GGGGGGGGGgggggggggGGGyGGGGGgggggggggGGGGGGGyGollllluggyGGGGGGGGgggggggggGGGGyGGG',
    'GGGGGGGGyGGGGGGGGGgggggggggGGGyGGGGGGGGGGyGGGgolllllugGGGGGGGGGyGGGGGGGGgggggggg',
    'GGGGGGyGGgggggggggGGGGGGGGGGyGGGGGGGgggggggggGollllluGGGGGGGGyGgggggggggyGGGGGGG',
    'gggggggggGGGGGGyGGGGGGGGGGygggggggggGyGGGGGGGGGolllllugggggggggGGGGGGGyGGGGGGGGG',
    'GGyGGGGGGGGGGyGGGGgggggggggGGGGGGGGyGGGGGGGGGggollllluGGGyGGGGGGGGGGyGGGgggggggg',
    'yGGGGGGGGgggggggggGGGGyGGGGGGGGGGyGGgggggggggGGollllllluGGGGGGGgggggggggGGGGGyGG',
    'gggggggggyGGGGGGGGGGyGGGGGGgggggggggGGGGGGyGGGGolllllllugggggggGyGGGGGGGGGGyGGGG',
    'GGGGGGGyGGGGGGGGGGgggggggggGGyGGGGGGGGGGyGGGGgggollllllluGGGGGyGGGGGGGGGgggggggg',
    'GGGGGyGGGgggggggggGGGGGGGGGyGGGGGGGGGGyGGGGGGgggollllllluGGGyGGGGGGGGGGyGGGGGGGG',
    'gggggggggGGGGGyGGGGGGGGGGyGGGGGGGGGGgggggggggGGyGollllllluyGGGGGGGGGGyGGgggggggg',
    'GyGGGGGGGGGGyGGGGGGGGGGyGGGgggggggggGGGGGGGGGyGGollllllllluGGGGgggggggggGGGGGGyG',
    'GGGGGGGGGGyGGGGGGGgggggggggGGGGGyGGGGGGGGGGyGGGGGolllllllllugggGGyGGGGGGGGGGyGGG',
    'GGGGGGGGygggggggggGyGGGGGGGGGGyGGGGGGGGGGyGGGggggollllllllluGGGyGGGGGGGGGGyGGGGG',
    'gggggggggGGGGGGGGyGGGGGGGGGGyGGGGGGGgggggggggGGGGGollllllllluyGGGGGGGGGGgggggggg',
    'GGGGyGGGGGGGGGGyGGGGGGGGGGygggggggggGyGGGGGGGGGGyGollllllllluGGgggggggggGGGGGGGG',
    'GGyGGGGGGGGGGyGGGGgggggggggGGGGGGGGyGGGGGGGGGGyGGGollllllllllluGGGGGyGGGGGGGGGGy',
    'yGGGGGGGGgggggggggGGGGyGGGGGGGGGGyGGGGGGGGGGygggggollllllllllluGGGyGGGGGGGGGGyGG',
    'gggggggggyGGGGGGGGGGyGGGGGGGGGGyGGGGgggggggggGGGGGGollllllllllluyGGGGGGGgggggggg',
    'GGGGGGGyGGGGGGGGGGyGGGGGGGGgggggggggGGGGyGGGGGGGGGGollllllllllluggggggggGyGGGGGG',
    'GGGGGyGGGGGGGGGGyGgggggggggyGGGGGGGGGGyGGGGGGGGGGyGGollllllllllluGGGGGGyGGGGGGGG',
    'GGGyGGGGGgggggggggGGGGGGGyGGGGGGGGGGyGGGGGGGGggggggollllllllllllluGGGyGGGGGGGGGG',
  ],
};

/**
 * Everything standing on the fields: the oil tank, the pump jack's post, skid, wellhead and
 * counterweight on the left hill, the silo and barn on the right, the drums and sacks either side of the road.
 */
const farm: PixelSprite = {
  id: 'ge17-opener-farm',
  name: 'oil field and farm',
  tags: ['ge17', 'prop'],
  blurb: 'An oil tank and the frame of a pump jack, a grain silo and a red barn, blue oil drums and sacks of grain.',
  palette: GE_PALETTE,
  rows: [
    '...............................................................DDD..............',
    '..............................................................DxxXD.............',
    '.............................................................DxXXXXD............',
    '.............................................................DxXXXDD............',
    '.............................................................DxXXXDD............',
    '.............................................................DxXXXDD............',
    '.............................................................DDDDDDD............',
    '.............................................................DxXXXDD............',
    '.............................................................DxXXXDD..DDDDDD....',
    '.............................................................DxXXXDD.DrrrrrrD...',
    '.............................................................DxXXXDDDrrrrrrrrD..',
    '.............................................................DDDDDDDrrrrrrrrrrD.',
    '.............................................................DxXXXDDzzzzzzzzzzD.',
    '...........................D.................................DxXXXDDrrrrrrrrrrD.',
    '.XXXXXXX...................D.................................DxXXXDDrrrrrrrrrrD.',
    '.DDDDDDD..................DXD................................DxXXXDD1111111111D.',
    'DxXXXXXXD.................DXD................................DDDDDDDrrzKKKzrrrD.',
    'DxXXXXXXD................DX.XD......DDDD.....................DxXXXDDrrKzKzKrrrD.',
    'DxXXXXXXD................DX.XD.....DxXXXD....................DxXXXDD11KKzKK111D.',
    'DxXXXXXXD...............DX...XD...DxXXXXXD...................DxXXXDDrrKKzKKrrrD.',
    'DDDDDDDDD...............DX...XD...DXXXXXXD...................DxXXXDDrrKzKzKrrrD.',
    '............DDD........DX.....XD..DXXXXXXD...................DxXXXDD11zKKKz111D.',
    '...........DXXXD.......DX.....XD...DXXXXD...................kkkkkkkkkkkkkkkkkkkk',
    '...........DXXXD......DX.......XD...DDDD........................................',
    '...........DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD.....................................',
    '...........kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk.....................................',
    '................................................................................',
    '................................................................................',
    '................................................................................',
    '....................................XXXX........................................',
    '....................................bBbh........................................',
    '....................................bBbh........................................',
    '....................................XXXX........................................',
    '....................................bBbh........................................',
    '....................................bBbh........................................',
    '....................................XXXX........................................',
    '..................................XXXXXXXX.....................SAA..............',
    '..................................bBbhbBbh....................SAAAS.............',
    '..................................bBbhbBbh....................SAAAS.............',
    '..................................XXXXXXXX....................SSSSS.............',
    '..................................bBbhbBbh...................SAA..SAA...........',
    '..................................bBbhbBbh..................SAAASSAAAS..........',
    '..................................XXXXXXXX..................SAAASSAAAS..........',
    '.................................OOOOOOOOOO.................SSSSSSSSSS..........',
    '...........................................................OOOOOOOOOOOO.........',
  ],
};

/** The pump jack's walking beam, 32x19, rocking on its post: the gold horse head dips and lifts the rod. */
const jack: PixelSprite = {
  id: 'ge17-opener-jack',
  name: 'pump jack',
  tags: ['ge17', 'animated'],
  blurb: 'The walking beam of a pump jack nodding, its gold horse head rising and dipping.',
  palette: GE_PALETTE,
  rows: [
    '................................',
    '................................',
    '................................',
    '................................',
    '.OOOO...........................',
    'OGyyG...........................',
    'OGGGGDDDDDDDDDDDDDDDDDDDDDDDDD..',
    'OGGGgXXXXXXXXXDxXDXXXXXXXXXXXX..',
    'OGGGgDDDDDDDDDDDDDDDDDDDDDDDDD..',
    '.OGGg........................X..',
    '..Ogg........................X..',
    '..X.........................X...',
    '..X.........................X...',
    '..X........................X....',
    '..X........................X....',
    '..X.............................',
    '..X.............................',
    '..X.............................',
    '..X.............................',
  ],
  frames: [
    [
      '................................',
      '................................',
      '................................',
      '................................',
      '.OOOO...........................',
      'OGyyG...........................',
      'OGGGGDDDDDDDDDDDDDDDDDDDDDDDDD..',
      'OGGGgXXXXXXXXXDxXDXXXXXXXXXXXX..',
      'OGGGgDDDDDDDDDDDDDDDDDDDDDDDDD..',
      '.OGGg........................X..',
      '..Ogg........................X..',
      '..X.........................X...',
      '..X.........................X...',
      '..X........................X....',
      '..X........................X....',
      '..X.............................',
      '..X.............................',
      '..X.............................',
      '..X.............................',
    ],
    [
      '................................',
      '.OOOO...........................',
      'OGyyG...........................',
      'OGGGGDD.........................',
      'OGGGgXXDDDD.....................',
      'OGGGgDDXXXXDDDD.................',
      '.OGGg..DDDDXXXXDDDD.............',
      '..Ogg......DDDDxXDXDDDD.........',
      '..X............DDDDXXXXDDDD.....',
      '..X................DDDDXXXXDDD..',
      '..X....................DDDDXXX..',
      '..X........................DDD..',
      '..X..........................X..',
      '..X..........................X..',
      '..X.........................X...',
      '..X.........................X...',
      '..X........................X....',
      '..X.............................',
      '..X.............................',
    ],
    [
      '................................',
      '................................',
      '................................',
      '................................',
      '.OOOO...........................',
      'OGyyG...........................',
      'OGGGGDDDDDDDDDDDDDDDDDDDDDDDDD..',
      'OGGGgXXXXXXXXXDxXDXXXXXXXXXXXX..',
      'OGGGgDDDDDDDDDDDDDDDDDDDDDDDDD..',
      '.OGGg........................X..',
      '..Ogg........................X..',
      '..X.........................X...',
      '..X.........................X...',
      '..X........................X....',
      '..X........................X....',
      '..X.............................',
      '..X.............................',
      '..X.............................',
      '..X.............................',
    ],
    [
      '................................',
      '................................',
      '................................',
      '..........................DDDD..',
      '......................DDDDXXXX..',
      '..................DDDDXXXXDDDD..',
      '..............DDDDXXXXDDDD...X..',
      '.OOOO.....DDDDDxXDDDDD.......X..',
      'OGyyG.DDDDXXXXDDDD..........X...',
      'OGGGGDXXXXDDDD..............X...',
      'OGGGgXDDDD..................X...',
      'OGGGgD......................X...',
      '.OGGg......................X....',
      '..Ogg......................X....',
      '..X.............................',
      '..X.............................',
      '..X.............................',
      '..X.............................',
      '..X.............................',
    ],
  ],
  frameMs: 450,
};

/** A tanker far out on the sea, 12x4, its bridge at the stern. */
const tanker: PixelSprite = {
  id: 'ge17-opener-tanker',
  name: 'tanker',
  tags: ['ge17', 'prop'],
  blurb: 'A small far-off oil tanker.',
  palette: GE_PALETTE,
  rows: [
    '.........DD.',
    '..x.x.x..DyD',
    'DDDDDDDDDDDD',
    '.D11111111D.',
  ],
};

/** A tuft of wheat ears, 5x4, for a slow sway in the wind. */
const tuft: PixelSprite = {
  id: 'ge17-opener-tuft',
  name: 'wheat',
  tags: ['ge17', 'prop'],
  blurb: 'A few ripe wheat ears.',
  palette: GE_PALETTE,
  rows: [
    'y.y.y',
    'GyGyG',
    '.g.g.',
    '.g.g.',
  ],
};

/** The low sun's halo, 9x9, breathing round it at the left edge. */
const halo: PixelSprite = {
  id: 'ge17-opener-halo',
  name: 'sun halo',
  tags: ['ge17'],
  blurb: 'A faint ring of light round the low sun.',
  palette: GE_PALETTE,
  rows: [
    '...555...',
    '.5.....5.',
    '.........',
    '5.......5',
    '5.......5',
    '5.......5',
    '.........',
    '.5.....5.',
    '...555...',
  ],
};

/* ── the opener ─────────────────────────────────────────────────────────────────────────────── */

const FARM = { x: 0, y: 9 };
/** The walking beam rocks on the samson post's top at (27, 21); the layer is placed so its pivot lands there. */
const JACK = { x: 11, y: 14 };

const base = geCompose('ge17-opener-base', fields, [{ sprite: farm, x: FARM.x, y: FARM.y }]);

const gullLater = geLater(geGull, 'ge17-opener-gull-later', 1, 520);

export const ge17Opener: SceneArt = {
  id: 'ge17-opener',
  label: 'At golden hour above the sea, a pump jack nods on a hill beside an oil tank, a grain silo and a red barn stand across the road, and blue oil drums and sacks of grain wait by the road through ripe wheat.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: jack, x: JACK.x, y: JACK.y },
    { sprite: tanker, x: 28, y: 21, motion: { kind: 'drift', amp: 3, periodMs: 11000 } },
    { sprite: halo, x: 0, y: 10, motion: { kind: 'twinkle', periodMs: 3200, min: 0.3 } },
    { sprite: tuft, x: 6, y: 40, motion: { kind: 'drift', amp: 1, periodMs: 2600 } },
    { sprite: tuft, x: 18, y: 49, motion: { kind: 'drift', amp: 1, periodMs: 3000, phase: 0.4 } },
    { sprite: tuft, x: 70, y: 56, motion: { kind: 'drift', amp: 1, periodMs: 2800, phase: 0.7 } },
    { sprite: geGull, x: 36, y: 6, motion: { kind: 'drift', amp: 3, periodMs: 7000 } },
    { sprite: gullLater, x: 50, y: 11, motion: { kind: 'drift', amp: 2, periodMs: 8400, phase: 0.4 } },
  ],
};

/* ── the keepsake ───────────────────────────────────────────────────────────────────────────── */

/** Commodities: a blue oil drum beside a sheaf of wheat, the ears swaying. */
const emblemCommodities: PixelSprite = {
  id: 'ge17-emblem-commodities',
  name: 'emblem oil and grain',
  tags: ['ge', 'emblem', 'animated'],
  blurb: 'A blue oil drum beside a tied sheaf of golden wheat, the ears swaying.',
  palette: GE_PALETTE,
  rows: [
    '............y...',
    '.........y.yG..y',
    '........yG.Gy.yG',
    '........Gy.yG.Gy',
    '........yG.Gg.yG',
    '.XXXXXX.Gg..g.Gg',
    'XbBBbbhX..g.g..g',
    'XbBbbbhX..g.g.g.',
    'XXXXXXXX...gg.g.',
    'XbBbbbhX...ggg..',
    'XbBbbbhX....gg..',
    'XbBbbbhX...OOO..',
    'XXXXXXXX....gg..',
    'XbBbbbhX...ggg..',
    'XbBbbbhX...gg.g.',
    '.XXXXXX...g.g.g.',
  ],
  frames: [
    [
      '............y...',
      '.........y.yG..y',
      '........yG.Gy.yG',
      '........Gy.yG.Gy',
      '........yG.Gg.yG',
      '.XXXXXX.Gg..g.Gg',
      'XbBBbbhX..g.g..g',
      'XbBbbbhX..g.g.g.',
      'XXXXXXXX...gg.g.',
      'XbBbbbhX...ggg..',
      'XbBbbbhX....gg..',
      'XbBbbbhX...OOO..',
      'XXXXXXXX....gg..',
      'XbBbbbhX...ggg..',
      'XbBbbbhX...gg.g.',
      '.XXXXXX...g.g.g.',
    ],
    [
      '............y...',
      '..........yyG..y',
      '.........yGGy.yG',
      '.........GyyG.Gy',
      '.........yGGg.yG',
      '.XXXXXX..Gg.g.Gg',
      'XbBBbbhX..g.g..g',
      'XbBbbbhX...gg.g.',
      'XXXXXXXX...gg.g.',
      'XbBbbbhX...ggg..',
      'XbBbbbhX....gg..',
      'XbBbbbhX...OOO..',
      'XXXXXXXX....gg..',
      'XbBbbbhX...ggg..',
      'XbBbbbhX...gg.g.',
      '.XXXXXX...g.g.g.',
    ],
  ],
  frameMs: 800,
};

export const ge17Finish: SceneArt = geKeepsake(
  'ge17-finish',
  'A postage stamp with perforated edges and an emerald frame, showing a blue oil drum beside a sheaf of golden wheat, with small sparkles around it.',
  emblemCommodities,
);

export const art: LessonArtSet = { opener: ge17Opener, backdrop: geBackdrop, finish: ge17Finish };
