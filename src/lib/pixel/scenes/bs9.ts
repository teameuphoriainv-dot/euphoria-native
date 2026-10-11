/**
 * Business Strategy lesson 9 opener: the council, and the shape it is organised in.
 *
 * Built on bsCouncilHall. A purple tapestry hung from the beam carries the house's organization
 * chart (one head, three leads, six teams), and the strategist stands at the head of a round table
 * pointing up at it. The council sits around the table and speaks up, the habit that best predicts
 * a team that works (psychological safety). The tapestry is the brightest broad surface; the gold
 * table sits a step under it so the seated heads read. Moving: a signal runs down the chart from
 * the head to the teams, speech bubbles rise from the council, someone speaking up and someone asking, the strategist points and blinks,
 * the candle and the pillar torches flicker, embers rise and stars twinkle in the windows.
 */
import type { PixelSprite } from '../types';
import { bsBackdrop } from './bs-backdrop';
import { bsCandle, bsEmber, bsMoved, bsStar, bsTorch } from './bs-kit';
import { BS_COAT_BLUE, BS_COAT_GOLD, BS_COAT_GREEN, BS_COAT_TEAL, bsBust, bsCouncilHall, bsRecoloured, bsStrategistStand } from './bs-kit-a';
import { bsKeepsake } from './bs1-finish';
import type { LessonArtSet, SceneArt } from './types';

const chartRows = [
  'yOOOOOOOOOOOOOOOOOOOOOOOOy',
  'gggggggggggggggggggggggggg',
  '.EqPPPPPPPPPPPPPPPPPPPPPE.',
  '.EqPPPPPPPGyyyyGPPPPPPPPE.',
  '.EqPPPPPPPxxxxxxPPPPPPPPE.',
  '.EqPPPPPPPxxxxxxPPPPPPPPE.',
  '.EqPPPPPPPPPGGPPPPPPPPPPE.',
  '.EqPPPPPPPPPGGPPPPPPPPPPE.',
  '.EqPPGGGGGGGGGGGGGGGGPPPE.',
  '.EqPPGPPPPPPGPPPPPPPGPPPE.',
  '.EqxxxxxPPxxxxxPPPxxxxxPE.',
  '.EqxxxxxPPxxxxxPPPxxxxxPE.',
  '.EqxxxxxPPxxxxxPPPxxxxxPE.',
  '.EqPPGPPPPPPGPPPPPPPGPPPE.',
  '.EqGGGGGPPGGGGGPPPGGGGGPE.',
  '.EqxxPPxxPxxPPxxPPxxPPxxE.',
  '.EqxxPPxxPxxPPxxPPxxPPxxE.',
  '.EqPPPPPPPPPPPPPPPPPPPPPE.',
  '.EPPPPPPPPPPPPPPPPPPPPPPE.',
  '.EPPPPPPPPPPEEPPPPPPPPPPE.',
  '..EPPPPPPPPE..EPPPPPPPPE..',
  '...EPPPPPPE....EPPPPPPE...',
];

const chart: PixelSprite = {
  id: 'bs9-chart',
  name: 'chart',
  tags: [],
  blurb: 'The organization chart on a purple tapestry with a swallowtail hem: a lit signal runs from the head to the leads to the teams.',
  rows: chartRows,
  frames: [
    bsMoved(chartRows, {
      3: '.EqPPPPPPPGWWWWGPPPPPPPPE.',
      4: '.EqPPPPPPPWWWWWWPPPPPPPPE.',
      5: '.EqPPPPPPPWWWWWWPPPPPPPPE.',
    }),
    bsMoved(chartRows, {
      10: '.EqWWWWWPPWWWWWPPPWWWWWPE.',
      11: '.EqWWWWWPPWWWWWPPPWWWWWPE.',
      12: '.EqWWWWWPPWWWWWPPPWWWWWPE.',
    }),
    bsMoved(chartRows, {
      15: '.EqWWPPWWPWWPPWWPPWWPPWWE.',
      16: '.EqWWPPWWPWWPPWWPPWWPPWWE.',
    }),
    chartRows,
  ],
  frameMs: 600,
};

const table: PixelSprite = {
  id: 'bs9-table',
  name: 'table',
  tags: [],
  blurb: 'The round council table in 3/4 view, its apron and its shadow. Seated busts go before it, backs after.',
  palette: { Z: '#110E17' },
  rows: [
    '.............gggggggggggggggggggggg.............',
    '.......gggGGGggggggggggggggggggggggGGGggg.......',
    '...ggGGggggggggggggggggggggggggggggggggggGGgg...',
    '.ggGggggggggggggggggggggggggggggggggggggggggGgg.',
    'ggGggggggggggggggggggggggggggggggggggggggggggGgg',
    'OgGGggggggggggggggggggggggggggggggggggggggggGGgO',
    'OOOgGGGggggggggggggggggggggggggggggggggggGGGgOOO',
    'OOOOOOOgGGGGGggggggggggggggggggggggGGGGGgOOOOOOO',
    '.OOOOOOOOOOOOgggGGGGGGGGGGGGGGGGgggOOOOOOOOOOOO.',
    '...OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO...',
    '.......OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO.......',
    '......OOO....OOOOOOOOOOOOOOOOOOOOOO....OOO......',
    '......OOO..............................OOO......',
    '...ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ...',
  ],
};

const back: PixelSprite = {
  id: 'bs9-back',
  name: 'back',
  tags: [],
  blurb: 'A councillor seen from behind, head and shoulders, on the near side of the table.',
  palette: { S: '#C08552', U: '#9A6638', H: '#43291A' },
  rows: [
    '..DDD..',
    '.DHHHD.',
    '.HHHHH.',
    '.HHHHH.',
    '..HHH..',
    '.qPPPp.',
    'qPPPPPp',
    'qPPPPPp',
  ],
};

const bubbleBang: PixelSprite = {
  id: 'bs9-bubble-bang',
  name: 'bubble-bang',
  tags: [],
  blurb: 'A speech bubble with a gold exclamation mark, for a rise layer: someone speaking up.',
  rows: [
    '.xxxxx.',
    'xwwGwwx',
    'xwwGwwx',
    'xwwwwwx',
    'xwwGwwx',
    '.xxxxx.',
    '.x.....',
  ],
};

const bubbleAsk: PixelSprite = {
  id: 'bs9-bubble-ask',
  name: 'bubble-ask',
  tags: [],
  blurb: 'A speech bubble with a gold question mark, for a rise layer: someone asking.',
  rows: [
    '.xxxxx.',
    'xwGGwwx',
    'xwwwGwx',
    'xwwGwwx',
    'xwwwwwx',
    'xwwGwwx',
    '.xxxxx.',
    '....x..',
  ],
};

const councilTeal = bsRecoloured(bsBust, 'bs9-council-teal', BS_COAT_TEAL, { S: '#F4CBA4', U: '#D6A87C', H: '#3A2418' });
const councilGreen = bsRecoloured(bsBust, 'bs9-council-green', BS_COAT_GREEN, { S: '#9A6638', U: '#7A4E2A', H: '#1A1523' });
const councilBlue = bsRecoloured(bsBust, 'bs9-council-blue', BS_COAT_BLUE, { S: '#D6A87C', U: '#B07A4F', H: '#A79DB5' });
const backGold = bsRecoloured(back, 'bs9-back-gold', BS_COAT_GOLD, { H: '#3A2418' });

export const bs9Opener: SceneArt = {
  id: 'bs9-opener',
  label: 'A council sits around a round table under a purple tapestry of their organization chart, the strategist pointing up at it while members speak up.',
  width: 80,
  height: 60,
  base: bsCouncilHall,
  layers: [
    { sprite: bsStar, x: 15, y: 13, motion: { kind: 'twinkle', periodMs: 2200, min: 0.2 } },
    { sprite: bsStar, x: 63, y: 15, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.5, min: 0.2 } },
    { sprite: chart, x: 20, y: 3 },
    { sprite: bsTorch, x: 1, y: 14 },
    { sprite: bsEmber, x: 2, y: 12, motion: { kind: 'rise', amp: 4, periodMs: 1600 } },
    { sprite: bsTorch, x: 74, y: 14 },
    { sprite: bsEmber, x: 76, y: 12, motion: { kind: 'rise', amp: 5, periodMs: 2000, phase: 0.5 } },
    { sprite: bsStrategistStand, x: 45, y: 16 },
    { sprite: councilTeal, x: 14, y: 33 },
    { sprite: bsBust, x: 22, y: 33 },
    { sprite: councilGreen, x: 30, y: 33 },
    { sprite: councilBlue, x: 38, y: 33 },
    { sprite: table, x: 12, y: 40 },
    { sprite: bsCandle, x: 50, y: 38 },
    { sprite: back, x: 20, y: 52 },
    { sprite: backGold, x: 42, y: 52 },
    { sprite: bubbleBang, x: 12, y: 25, motion: { kind: 'rise', amp: 5, periodMs: 2600 } },
    { sprite: bubbleAsk, x: 28, y: 24, motion: { kind: 'rise', amp: 6, periodMs: 3000, phase: 0.35 } },
    { sprite: bubbleBang, x: 37, y: 25, motion: { kind: 'rise', amp: 5, periodMs: 2800, phase: 0.7 } },
  ],
};

const emblem: PixelSprite = {
  id: 'bs9-emblem-org',
  name: 'emblem-org',
  tags: [],
  blurb: 'Lesson 9 emblem, 16x16: an organization chart, a gold head over three purple teams.',
  rows: [
    '......yyyy......',
    '.....yGGGGy.....',
    '.....yGGGGg.....',
    '......OggO......',
    '.......GG.......',
    '.......GG.......',
    '.GGGGGGGGGGGGGG.',
    '.GG....GG....GG.',
    '.GG....GG....GG.',
    'EqqE..EqqE..EqqE',
    'EqPE..EqPE..EqPE',
    'EPPE..EPPE..EPPE',
    'EEEE..EEEE..EEEE',
    '................',
    '................',
    '................',
  ],
};

export const bs9Finish: SceneArt = bsKeepsake(
  'bs9-finish',
  'A purple house banner on a gold rod, its roundel showing an organization chart, a gold head joined to three purple teams.',
  emblem,
);

export const art: LessonArtSet = { opener: bs9Opener, backdrop: bsBackdrop, finish: bs9Finish };
