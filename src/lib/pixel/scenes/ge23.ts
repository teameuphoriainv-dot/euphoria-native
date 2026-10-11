/**
 * Global Economics lesson 23: the future of money, CBDCs and digital currency, in a gallery at night.
 *
 * Four lit niches along a gallery wall tell money's story from left to right over a gold timeline: a
 * cowrie shell, a gold coin, a paper banknote, and last a phone with a coin turning on its screen,
 * the digital money central banks are building now. The student stands in front of the newest one.
 * Only small layers move: the coin on the phone, sparkles round it, the niche lamps and a glint on
 * the old coin.
 *
 * The keepsake's emblem is a phone with a gold coin rising out of its screen.
 */
import type { PixelSprite } from '../types';
import { geBackdrop } from './ge-backdrop';
import { GE_PALETTE, geCoin, geCompose, geLater, geSparkle, geStar } from './ge-kit';
import { geStudentBack } from './ge-kit-a';
import { geKeepsake } from './ge1-finish';
import type { LessonArtSet, SceneArt } from './types';

/* ── one-off props ──────────────────────────────────────────────────────────────────────────── */

/**
 * The gallery at night, 80x60: a gilded cornice, four arched niches lit from above (centres x 10,
 * 30, 50 and 69, each with a stand whose top is row 27 and a plaque under its sill), a gold timeline
 * along the wall ending in an arrowhead, a panelled dado and a polished floor holding the niches' light.
 */
const gallery: PixelSprite = {
  id: 'ge23-opener-gallery',
  name: 'gallery at night',
  tags: ['ge23', 'ground'],
  blurb: 'A night-blue gallery wall with four lit arched niches, a gold timeline and a polished floor.',
  palette: GE_PALETTE,
  rows: [
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',
    'hhhhhhhOOOOOOOhhhhhhhhhhhhhOOOOOOOhhhhhhhhhhhhhOOOOOOOhhhhhhhhhhhhOOOOOOOhhhhhhh',
    'hhhhhhOOcDDDcOOhhhhhhhhhhhOOcDDDcOOhhhhhhhhhhhOOcDDDcOOhhhhhhhhhhOOcDDDcOOhhhhhh',
    'hhhhhOOcccdcccOOhhhhhhhhhOOcccdcccOOhhhhhhhhhOOcccdcccOOhhhhhhhhOOcccdcccOOhhhhh',
    'hhhhOOccccdccccOOhhhhhhhOOccccdccccOOhhhhhhhOOccccdccccOOhhhhhhOOccccdccccOOhhhh',
    'hhhhOccccdddccccOhhhhhhhOccccdddccccOhhhhhhhOccccdddccccOhhhhhhOccccdddccccOhhhh',
    'hhhhOccccdddccccOhhhhhhhOccccdddccccOhhhhhhhOccccdddccccOhhhhhhOccccdddccccOhhhh',
    'hhhOOccccdddccccOOhhhhhOOccccdddccccOOhhhhhOOccccdddccccOOhhhhOOccccdddccccOOhhh',
    'hhhOOcccdddddcccOOhhhhhOOcccdddddcccOOhhhhhOOcccdddddcccOOhhhhOOcccdddddcccOOhhh',
    'hhhOOcccdddddcccOOhhhhhOOcccdddddcccOOhhhhhOOcccdddddcccOOhhhhOOcccdddddcccOOhhh',
    'hhhOOcccdddddcccOOhhhhhOOcccdddddcccOOhhhhhOOcccdddddcccOOhhhhOOcccdddddcccOOhhh',
    'hhhOOccdddddddccOOhhhhhOOccdddddddccOOhhhhhOOccdddddddccOOhhhhOOccdddddddccOOhhh',
    'hhhOOccdddddddccOOhhhhhOOccdddddddccOOhhhhhOOccdddddddccOOhhhhOOccdddddddccOOhhh',
    'hhhOOccdddddddccOOhhhhhOOccdddddddccOOhhhhhOOccdddddddccOOhhhhOOccdddddddccOOhhh',
    'hhhOOcdddddddddcOOhhhhhOOcdddddddddcOOhhhhhOOcdddddddddcOOhhhhOOcdddddddddcOOhhh',
    'hhhOOcdddddddddcOOhhhhhOOcdddddddddcOOhhhhhOOcdddddddddcOOhhhhOOcdddddddddcOOhhh',
    'hhhOOcdddddddddcOOhhhhhOOcdddddddddcOOhhhhhOOcdddddddddcOOhhhhOOcdddddddddcOOhhh',
    'hhhOOdddddddddddOOhhhhhOOdddddddddddOOhhhhhOOdddddddddddOOhhhhOOdddddddddddOOhhh',
    'hhhOOdddddddddddOOhhhhhOOdddddddddddOOhhhhhOOdddddddddddOOhhhhOOdddddddddddOOhhh',
    'hhhOOdddddddddddOOhhhhhOOdddddddddddOOhhhhhOOdddddddddddOOhhhhOOdddddddddddOOhhh',
    'hhhOOdddxxxxxdddOOhhhhhOOdddxxxxxdddOOhhhhhOOdddxxxxxdddOOhhhhOOdddxxxxxdddOOhhh',
    'hhhOOddxzzzzzXddOOhhhhhOOddxzzzzzXddOOhhhhhOOddxzzzzzXddOOhhhhOOddxzzzzzXddOOhhh',
    'hhhOOdddXXXXXdddOOhhhhhOOdddXXXXXdddOOhhhhhOOdddXXXXXdddOOhhhhOOdddXXXXXdddOOhhh',
    'hhhxxxxxxxxxxxxxxxhhhhhxxxxxxxxxxxxxxxhhhhhxxxxxxxxxxxxxxxhhhhxxxxxxxxxxxxxxxhhh',
    'hhhXXXXXXXXXXXXXXXhhhhhXXXXXXXXXXXXXXXhhhhhXXXXXXXXXXXXXXXhhhhXXXXXXXXXXXXXXXhhh',
    'hhhhDDDDDDDDDDDDDhhhhhhhDDDDDDDDDDDDDhhhhhhhDDDDDDDDDDDDDhhhhhhDDDDDDDDDDDDDhhhh',
    'hhhhhhhhOOOOOhhhhhhhhhhhhhhhOOOOOhhhhhhhhhhhhhhhOOOOOhhhhhhhhhhhhhhOOOOOhhhhhhhh',
    'hhhhhhhhOyGgOhhhhhhhhhhhhhhhOyGgOhhhhhhhhhhhhhhhOyGgOhhhhhhhhhhhhhhOyGgOhhhhhhhh',
    'hhhhhhhhOOOOOhhhhhhhhhhhhhhhOOOOOhhhhhhhhhhhhhhhOOOOOhhhhhhhhhhhhhhOOOOOhhhhhGhh',
    'hhhhhhhhhhyhhhhhhhhhhhhhhhhhhhyhhhhhhhhhhhhhhhhhhhyhhhhhhhhhhhhhhhhhhyhhhhhhhGGh',
    'hGGGGGGGGyGgGGGGGGGGGGGGGGGGGyGgGGGGGGGGGGGGGGGGGyGgGGGGGGGGGGGGGGGGyGgGGGGGGGGG',
    'hOOOOOOOOOgOOOOOOOOOOOOOOOOOOOgOOOOOOOOOOOOOOOOOOOgOOOOOOOOOOOOOOOOOOgOOOOOOOOOh',
    'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhOhh',
    'oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo',
    'llllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllll',
    'llllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllll',
    'llllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllll',
    'uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu',
    'kkkkkkkkDDDDkkkkkkkkkkkkkkkkDDDDkkkkkkkkkkkkkkkkDDDDkkkkkkkkkkkkkkkDDDDkkkkkkkkk',
    'kkkkkkkkkDDDDkkkkkkkkkkkkkkkkDDDDkkkkkkkkkkkkkkkkDDDDkkkkkkkkkkkkkkkDDDDkkkkkkkk',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'kkkkkkkkkDDDDkkkkkkkkkkkkkkkkDDDDkkkkkkkkkkkkkkkkDDDDkkkkkkkkkkkkkkkDDDDkkkkkkkk',
    'kkkkkkkkDDDDkkkkkkkkkkkkkkkkDDDDkkkkkkkkkkkkkkkkDDDDkkkkkkkkkkkkkkkDDDDkkkkkkkkk',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'kkkkkkkkDDDDkkkkkkkkkkkkkkkkDDDDkkkkkkkkkkkkkkkkDDDDkkkkkkkkkkkkkkkDDDDkkkkkkkkk',
    'kkkkkkkkkDDDDkkkkkkkkkkkkkkkkDDDDkkkkkkkkkkkkkkkkDDDDkkkkkkkkkkkkkkkDDDDkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'KKKKKKKKKDDDDKKKKKKKKKKKKKKKKDDDDKKKKKKKKKKKKKKKKDDDDKKKKKKKKKKKKKKKDDDDKKKKKKKK',
    'kkkkkkkkDDDDkkkkkkkkkkkkkkkkDDDDkkkkkkkkkkkkkkkkDDDDkkkkkkkkkkkkkkkDDDDkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkDDDDkkkkkkkkkkkkkkkkDDDDkkkkkkkkkkkkkkkkDDDDkkkkkkkkkkkkkkkDDDDkkkkkkkkk',
    'kkkkkkkkkDDDDkkkkkkkkkkkkkkkkDDDDkkkkkkkkkkkkkkkkDDDDkkkkkkkkkkkkkkkDDDDkkkkkkkk',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
  ],
};

/** Three of the four exhibits on their stands: a cowrie shell, a green banknote and a phone. */
const exhibits: PixelSprite = {
  id: 'ge23-opener-exhibits',
  name: 'shell, banknote and phone',
  tags: ['ge23', 'prop'],
  blurb: 'A cream cowrie shell, a green paper banknote and a dark phone with a blank screen.',
  palette: GE_PALETTE,
  rows: [
    '..........................................................DDDDDDDD.',
    '.........................................................DXXXDDXXXD',
    '.........................................................DXhhhhhhhD',
    '.........................................................DXhhhhhhhD',
    '.........................................................DXhhhhhhhD',
    '.........................................................DXhhhhhhhD',
    '......................................nnnnnnnnnnn........DXhhhhhhhD',
    '..AAA.................................nmNNNNNNNNn........DXhhhhhhhD',
    '.AzAAA................................nNzzNNNyNNn........DXhhhhhhhD',
    'AAAAAAS...............................nNzMzNNNNNn........DXhhhhhhhD',
    'AgOgOgS...............................nNzzNNNyNNn........DXXXXDXXXD',
    '.SSSSS................................nnnnnnnnnnn.........DDDDDDDD.',
  ],
};

/** The coin on the phone's screen, 7x7, turning edge-on and back: money that lives in the phone. */
const digitalCoin: PixelSprite = {
  id: 'ge23-opener-digital-coin',
  name: 'digital coin',
  tags: ['ge23', 'animated'],
  blurb: 'A gold coin turning on a phone screen.',
  palette: GE_PALETTE,
  rows: [
    '..GGG..',
    '.GyyGg.',
    'GyGOGgg',
    'GyOOOgg',
    'GyGOGgg',
    '.GGggg.',
    '..ggg..',
  ],
  frames: [
    [
      '..GGG..',
      '.GyyGg.',
      'GyGOGgg',
      'GyOOOgg',
      'GyGOGgg',
      '.GGggg.',
      '..ggg..',
    ],
    [
      '...G...',
      '..GyG..',
      '..yOg..',
      '..yOg..',
      '..yOg..',
      '..Ggg..',
      '...g...',
    ],
    [
      '...G...',
      '...y...',
      '...G...',
      '...G...',
      '...G...',
      '...g...',
      '...g...',
    ],
    [
      '...G...',
      '..GyG..',
      '..yOg..',
      '..yOg..',
      '..yOg..',
      '..Ggg..',
      '...g...',
    ],
  ],
  frameMs: 380,
};

/** A niche's lamp, for a slow `twinkle`. */
const lamp: PixelSprite = {
  id: 'ge23-opener-lamp',
  name: 'niche lamp',
  tags: ['ge23'],
  blurb: 'The pale glow of a small picture lamp.',
  palette: GE_PALETTE,
  rows: [
    'yyy',
  ],
};

/* ── the opener ─────────────────────────────────────────────────────────────────────────────── */

/** The four niches' centres, oldest money on the left. */
const NICHES = [10, 30, 50, 69] as const;
/** The old coin stands on the second niche's stand; the phone's screen starts two pixels inside it. */
const COIN = { x: NICHES[1] - 3, y: 20 };
const SCREEN = { x: 66, y: 17 };
/** Where the student stands: in front of the newest niche. */
const STUDENT = { x: NICHES[3] - 8, y: 35 };

const base = geCompose('ge23-opener-base', gallery, [
  { sprite: exhibits, x: 7, y: 15 },
  { sprite: geCoin, x: COIN.x, y: COIN.y },
  { sprite: geStudentBack, x: STUDENT.x, y: STUDENT.y },
]);

const sparkleLater = geLater(geSparkle, 'ge23-opener-sparkle-later', 2, 400);

export const ge23Opener: SceneArt = {
  id: 'ge23-opener',
  label: 'In a gallery at night, four lit niches tell the story of money from a cowrie shell to a gold coin to a paper banknote to a phone with a coin turning on its screen, and a student looks at the newest.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: digitalCoin, x: SCREEN.x, y: SCREEN.y },
    { sprite: geSparkle, x: 59, y: 13, motion: { kind: 'twinkle', periodMs: 1800, min: 0.35 } },
    { sprite: sparkleLater, x: 74, y: 22, motion: { kind: 'twinkle', periodMs: 2200, phase: 0.5, min: 0.35 } },
    ...NICHES.map((c, i) => ({ sprite: lamp, x: c - 1, y: 9, motion: { kind: 'twinkle' as const, periodMs: 2400 + 300 * i, phase: 0.3 * i, min: 0.4 } })),
    { sprite: geStar, x: COIN.x + 2, y: COIN.y + 1, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.2, min: 0.1 } },
  ],
};

/* ── the keepsake ───────────────────────────────────────────────────────────────────────────── */

/** Digital money: a phone with a gold coin rising out of its screen and settling back. */
const emblemPhoneCoin: PixelSprite = {
  id: 'ge23-emblem-phone-coin',
  name: 'emblem digital money',
  tags: ['ge', 'emblem', 'animated'],
  blurb: 'A dark phone with a gold coin rising out of its glowing screen and settling back.',
  palette: GE_PALETTE,
  rows: [
    '................',
    '................',
    '................',
    '................',
    '.....XXXXXXX....',
    '....XxxXXXxxD...',
    '....XxbbbbbbD...',
    '....XxbBbbbbD...',
    '....XxbOOObbD...',
    '....XxOyyGObD...',
    '....XxOyGgObD...',
    '....XxOGggObD...',
    '....XxbOOObbD...',
    '....XxxxxxxxD...',
    '....XxxxDxxxD...',
    '.....DDDDDDD....',
  ],
  frames: [
    [
      '................',
      '................',
      '................',
      '................',
      '.....XXXXXXX....',
      '....XxxXXXxxD...',
      '....XxbbbbbbD...',
      '....XxbBbbbbD...',
      '....XxbOOObbD...',
      '....XxOyyGObD...',
      '....XxOyGgObD...',
      '....XxOGggObD...',
      '....XxbOOObbD...',
      '....XxxxxxxxD...',
      '....XxxxDxxxD...',
      '.....DDDDDDD....',
    ],
    [
      '................',
      '................',
      '................',
      '................',
      '.....XXXXXXX....',
      '....XxxOOOxxD...',
      '....XTOyyGObD...',
      '....XxOyGgObD...',
      '....XxOGggObD...',
      '....XxbOOObbD...',
      '....XxbbbbbbD...',
      '....XxbbbbbbD...',
      '....XxbbbbbbD...',
      '....XxxxxxxxD...',
      '....XxxxDxxxD...',
      '.....DDDDDDD....',
    ],
    [
      '................',
      '.......OOO......',
      '......OyyGO.....',
      '......OyGgO.....',
      '.....XOGggOX....',
      '....XxxOOOxxD...',
      '....XTbbbbTbD...',
      '....XxTBbTbbD...',
      '....XxbbbbbbD...',
      '....XxbbbbbbD...',
      '....XxbbbbbbD...',
      '....XxbbbbbbD...',
      '....XxbbbbbbD...',
      '....XxxxxxxxD...',
      '....XxxxDxxxD...',
      '.....DDDDDDD....',
    ],
    [
      '.......OOO......',
      '......OyyGO.....',
      '......OyGgO.....',
      '......OGggO.....',
      '.....XXOOOXX....',
      '....XxxXXXxxD...',
      '....XTbbbbTbD...',
      '....XxTBbTbbD...',
      '....XxbbbbbbD...',
      '....XxbbbbbbD...',
      '....XxbbbbbbD...',
      '....XxbbbbbbD...',
      '....XxbbbbbbD...',
      '....XxxxxxxxD...',
      '....XxxxDxxxD...',
      '.....DDDDDDD....',
    ],
    [
      '................',
      '.......OOO......',
      '......OyyGO.....',
      '......OyGgO.....',
      '.....XOGggOX....',
      '....XxxOOOxxD...',
      '....XTbbbbTbD...',
      '....XxTBbTbbD...',
      '....XxbbbbbbD...',
      '....XxbbbbbbD...',
      '....XxbbbbbbD...',
      '....XxbbbbbbD...',
      '....XxbbbbbbD...',
      '....XxxxxxxxD...',
      '....XxxxDxxxD...',
      '.....DDDDDDD....',
    ],
    [
      '................',
      '................',
      '................',
      '................',
      '.....XXXXXXX....',
      '....XxxOOOxxD...',
      '....XTOyyGObD...',
      '....XxOyGgObD...',
      '....XxOGggObD...',
      '....XxbOOObbD...',
      '....XxbbbbbbD...',
      '....XxbbbbbbD...',
      '....XxbbbbbbD...',
      '....XxxxxxxxD...',
      '....XxxxDxxxD...',
      '.....DDDDDDD....',
    ],
  ],
  frameMs: 420,
};

export const ge23Finish: SceneArt = geKeepsake(
  'ge23-finish',
  'A postage stamp with perforated edges and an emerald frame, showing a dark phone with a gold coin rising out of its screen, with small sparkles around it.',
  emblemPhoneCoin,
);

export const art: LessonArtSet = { opener: ge23Opener, backdrop: geBackdrop, finish: ge23Finish };
