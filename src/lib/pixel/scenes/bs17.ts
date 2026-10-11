/**
 * Business Strategy lesson 17 opener: two houses, one toast, both still themselves.
 *
 * Built on bsTavern, turned round from lesson 11: the hearth burns on the left. On the wall the two
 * houses' banners hang crossed, orchid and teal on poles bound by a gold knot, and below them the two
 * lords raise their goblets over the table where their charter lies sealed twice, once in each colour.
 * This is an alliance, not a merger: neither banner comes down and neither lord gives up their colours.
 * The banners are the brightest broad surfaces; the fire is the warmest. Moving: the lords raise their
 * goblets together and the glasses flash as they meet, both blink, the banners flutter, the fire burns,
 * the candles and the hanging lantern flicker.
 */
import type { PixelSprite } from '../types';
import { bsBackdrop } from './bs-backdrop';
import { bsCandle, bsLater, bsMoved } from './bs-kit';
import { BS_COAT_TEAL, bsMirrored, bsRecoloured, bsStrategistStand } from './bs-kit-a';
import { bsHearth, bsHearthFire, bsTavern } from './bs-kit-b';
import { bsKeepsake } from './bs1-finish';
import type { LessonArtSet, SceneArt } from './types';

const crossedRows = [
  '................................',
  '................................',
  '................................',
  'yOOOOOOOyO............OyOOOOOOOy',
  '.EqPPPpE..O..........O..tmTTTtt.',
  '.GGGGGGG...O........O...GGGGGGG.',
  '.EqPPPpE....O......O....tmTTTtt.',
  '.EqPPPpE....O......O....tmTTTtt.',
  '.EqPPPpE.....O....O.....tmTTTtt.',
  '.EqPEPpE......O..O......tmTtTtt.',
  '.EqP.PpE.......OO.......tmT.Ttt.',
  '.Eq...pE.......yG.......tm...tt.',
  '..............OGGO..............',
  '.............O....O.............',
  '............O......O............',
  '............O......O............',
  '...........O........O...........',
  '..........O..........O..........',
  '.........O............O.........',
  '........O..............O........',
];

const crossed: PixelSprite = {
  id: 'bs17-crossed-banners',
  name: 'crossed-banners',
  tags: [],
  blurb: "The two houses' banners, orchid and teal, hung from crossbars on poles that cross under a gold knot. The tails flutter.",
  rows: crossedRows,
  frames: [
    crossedRows,
    bsMoved(crossedRows, {
      9: '.EqPPEpE......O..O......tmTtTtt.',
      10: '.EqPP.pE.......OO.......tmT.Ttt.',
      11: '.EqP...E.......yG.......tm...tt.',
    }),
    crossedRows,
    bsMoved(crossedRows, {
      9: '.EqPEPpE......O..O......tmtTTtt.',
      10: '.EqP.PpE.......OO.......tm.TTtt.',
      11: '.Eq...pE.......yG.......t...Ttt.',
    }),
    crossedRows,
    bsMoved(crossedRows, {
      9: '.EqEPPpE......O..O......tmTTttt.',
      10: '.Eq.PPpE.......OO.......tmTT.tt.',
      11: '.E...PpE.......yG.......tmT...t.',
    }),
  ],
  frameMs: 540,
};

const toastRest = bsMoved(bsStrategistStand.rows, {
  6: '......SSSUHHD.........',
  7: '.......SSUUD..........',
  8: '..yGG..wUUw...........',
  9: '..GGg.EqwwPGGE........',
});

const toastRaise = bsMoved(bsStrategistStand.rows, {
  4: 'W.....SKSUHHHD........',
  5: '.yGG.SSSSSHHD.........',
  6: '.GGg..SSSUHHD.........',
  7: '..O....SSUUD..........',
  8: '..SS...wUUw...........',
  9: '..SSq.EqwwPGGE........',
  10: '....qEqPPPPPGpE.......',
  11: '.....qqqPPPPPppE......',
  12: '.....EEEqPPPPppE......',
});

const toast: PixelSprite = {
  id: 'bs17-toast',
  name: 'toast',
  tags: [],
  blurb: 'The strategist standing, facing left, holding a goblet out; it rises for the toast and flashes at its rim. Mirror it for the other party and set them 20 apart so the goblets meet. Frames: rest, raise, raise, rest, blink.',
  palette: { S: '#C08552', U: '#9A6638', H: '#43291A' },
  rows: toastRest,
  frames: [
    toastRest,
    toastRaise,
    toastRaise,
    toastRest,
    bsMoved(toastRest, {
      4: '......SSSUHHHD........',
    }),
  ],
  frameMs: 560,
};

const table: PixelSprite = {
  id: 'bs17-table',
  name: 'table',
  tags: [],
  blurb: 'A long table with the charter lying on it, sealed in orchid and in teal. People behind it are drawn before it.',
  palette: { Z: '#110E17' },
  rows: [
    '..gggggggggggggggggOyyyyyyyyyyyyOggggggggggggggggg..',
    '.ggggggggggggggggggOyPyyyyyyyyTyOgggggggggggggggggg.',
    'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
    'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
    '..OO............................................OO..',
    '..OO............................................OO..',
    '..OO............................................OO..',
    '..OO............................................OO..',
    'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  ],
};

const barrel: PixelSprite = {
  id: 'bs17-barrel',
  name: 'barrel',
  tags: [],
  blurb: 'An ale barrel with a tap, standing on its bottom row.',
  rows: [
    '..OOOOOO..',
    '.OGgggggO.',
    'OGgggggggO',
    'ODDDDDDDDO',
    'OGgggggggO',
    'OGgggggggO',
    'OGggggggXX',
    'OGgggggggD',
    'ODDDDDDDDO',
    'OGgggggggO',
    '.OGgggggO.',
    '..OOOOOO..',
  ],
};

const lanternRows = [
  '..D..',
  '..D..',
  '.OOO.',
  'O343O',
  'O454O',
  'O343O',
  '.OOO.',
  '..O..',
];

const lantern: PixelSprite = {
  id: 'bs17-lantern',
  name: 'lantern',
  tags: [],
  blurb: 'A lantern hung from the beam on a short chain; its flame flickers.',
  rows: lanternRows,
  frames: [
    lanternRows,
    bsMoved(lanternRows, {
      3: 'O434O',
      4: 'O545O',
    }),
    bsMoved(lanternRows, {
      3: 'O333O',
      5: 'O444O',
    }),
  ],
  frameMs: 470,
};

const lordOurs = bsMirrored(toast, 'bs17-lord-ours');
const lordTheirs = bsRecoloured(toast, 'bs17-lord-theirs', BS_COAT_TEAL, { S: '#F4CBA4', U: '#D6A87C', H: '#3A2418' });
const candleLater = bsLater(bsCandle, 'bs17-candle-later', 2, 470);

export const bs17Opener: SceneArt = {
  id: 'bs17-opener',
  label: 'In a tavern two lords, one in purple and one in teal, raise goblets to their alliance across a sealed charter, beneath their two banners crossed on the wall.',
  width: 80,
  height: 60,
  base: bsTavern,
  layers: [
    { sprite: bsHearth, x: 0, y: 16 },
    { sprite: bsHearthFire, x: 6, y: 33 },
    { sprite: crossed, x: 24, y: 3 },
    { sprite: lantern, x: 70, y: 7 },
    { sprite: barrel, x: 66, y: 30 },
    { sprite: lordOurs, x: 20, y: 16 },
    { sprite: lordTheirs, x: 40, y: 16 },
    { sprite: table, x: 14, y: 41 },
    { sprite: bsCandle, x: 18, y: 34 },
    { sprite: candleLater, x: 59, y: 34 },
  ],
};

const emblem: PixelSprite = {
  id: 'bs17-emblem-crossed',
  name: 'emblem-crossed',
  tags: [],
  blurb: 'Lesson 17 emblem, 16x16: two banners, orchid and teal, on poles crossed under a gold knot.',
  rows: [
    '................',
    '................',
    '................',
    'yOOOO......OOOOy',
    'qPPPO......OTTTt',
    'qPPPO......OTTTt',
    'qPPP.O....O.TTTt',
    'qPPP..O..O..TTTt',
    'qEPP...OO...TTtt',
    'q..P...yG...T..t',
    '.......GG.......',
    '......O..O......',
    '.....O....O.....',
    '.....O....O.....',
    '....O......O....',
    '...O.DDDDDD.O...',
  ],
};

export const bs17Finish: SceneArt = bsKeepsake(
  'bs17-finish',
  'A purple house banner on a gold rod, its roundel showing two banners, one orchid and one teal, on crossed poles.',
  emblem,
);

export const art: LessonArtSet = { opener: bs17Opener, backdrop: bsBackdrop, finish: bs17Finish };
