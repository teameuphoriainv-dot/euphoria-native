/**
 * Alternative Investments lesson 17: emerging market alternatives.
 *
 * The opener is the estate on the kit's land (ai-kit-a.ts) at the end of the night: the sun is coming
 * up behind the far hill, an emerging market's rise, and against its glow a city climbs over the
 * crest with two tower cranes still building it (the lesson's infrastructure gap and capital gap).
 * In front of the pines a cell tower sends out its signal, the lesson's digital leapfrogging: a
 * phone network before the landlines. The glow and the skyline are drawn only on the land's sky, so
 * both rise from behind the hill. Only small layers move: the cranes' hooks run along their jibs,
 * the tower's light blinks, its signal pulses, a window lights and stars twinkle. The keepsake is a
 * new emblem: a globe on a stand.
 */
import type { PixelSprite } from '../types';
import { aiBackdrop } from './ai-backdrop';
import { aiKeepsake } from './ai-kit';
import { aiComposeLand, aiMoon, aiStar } from './ai-kit-a';
import type { LessonArtSet, SceneArt } from './types';

/**
 * The dawn over aiLand's top 32 rows, already cut to its sky: the sun's glow in the fire ramp (5 the
 * core out to 1 the ember edge), dark towers with a few lit windows, two gold tower cranes.
 */
const dawn: PixelSprite = {
  id: 'ai17-dawn',
  name: 'ai17-dawn',
  tags: ['scene', 'ai'],
  blurb: "Sunrise behind the hill: a glow from pale gold to ember, a dark skyline and two cranes against it.",
  rows: [
    '................................................................................',
    '................................................................................',
    '................................................................................',
    '................................................................................',
    '................................................................................',
    '................................................................................',
    '................................................................................',
    '........................................................................G.......',
    '....................................................................GGGGGGGG....',
    '..............................................G.....................DDD.G.......',
    '..........................................GGGGGGGGGGGGGG................g.......',
    '..........................................DDD.G.............11111.......G.......',
    '..............................................g........111111111111111..g.......',
    '..............................................G.....11111111111111111111G.......',
    '..............................................g...1111111111111111111111g11.....',
    '..............................................G.111111111111111111111111G1111...',
    '..............................................g1111111111111111111111111g11111..',
    '..............................................G1111111111222222222221111G111111.',
    '.............................................1g1111111122222222222222211g1111111',
    '............................................11G1111112222222222222222222G1111111',
    '............................................11g1111122222222333332222222g1111111',
    '...........................................kkkkk111222222333333333332222G2111111',
    '...........................................kkkkk1122222233333333333332kkkk211111',
    '..........................................1kkkkk1kkk222333344444443333kykk211111',
    '......................................kkkk1kkkkk1kkk223334445555544433kkkk2kkkk1',
    '......................................kkkk1kkkkk1kkk2kkk34455555554433kkkk2kkkk1',
    '......................................kkkk1kkkkk1kkk2kyk44555555555443kykk2kkkk1',
    '......................................kkkk1kkkkk1kyk2kkk44..........43kkkk2kkkk1',
    '......................................kkkk1kkkyk1kkk2k..................kk2kykk1',
    '......................................kkkk1kkkkk1k..........................kkk1',
    '......................................kkkk1kkk..................................',
    '................................................................................',
  ],
};

/** A cell tower: a lattice mast widening to the ground, antenna panels near the top, a light on it. */
const cellTower: PixelSprite = {
  id: 'ai17-cell-tower',
  name: 'ai17-cell-tower',
  tags: ['scene', 'ai'],
  blurb: "A lattice cell tower with antenna panels and a warning light.",
  rows: [
    '....r....',
    '....X....',
    '...wXx...',
    '...wXx...',
    '...XXX...',
    '...XxX...',
    '...XxX...',
    '...X.x...',
    '...XXX...',
    '...XxX...',
    '...XxX...',
    '...X.x...',
    '..XXXXX..',
    '..Xx..X..',
    '..X.x.X..',
    '..X..xX..',
    '..XXXXX..',
    '..Xx..X..',
    '..X.x.X..',
    '..X..xX..',
    '.XXXXXXX.',
    '.X.x...X.',
    '.X..x..X.',
    '.X....xX.',
    '.XXXXXXX.',
    '.X.x...X.',
    '.X..x..X.',
    '.X....xX.',
    'XXXXXXXXX',
    'X.x.....X',
    'X...x...X',
  ],
};

/** A crane's trolley, cable and load, run along the jib. */
const hook: PixelSprite = { id: 'ai17-hook', name: 'ai17-hook', tags: [], rows: ['.D.', '.x.', '.x.', '.x.', 'DXD', 'DDD'] };
const light: PixelSprite = { id: 'ai17-light', name: 'ai17-light', tags: [], rows: ['R'] };
const signalLeft: PixelSprite = { id: 'ai17-signal-left', name: 'ai17-signal-left', tags: [], rows: ['..T', '.T.', '.T.', '.T.', '..T'] };
const signalRight: PixelSprite = { id: 'ai17-signal-right', name: 'ai17-signal-right', tags: [], rows: ['T..', '.T.', '.T.', '.T.', 'T..'] };
const window_: PixelSprite = { id: 'ai17-window', name: 'ai17-window', tags: [], rows: ['y'] };

const globe: PixelSprite = {
  id: 'ai17-globe',
  name: 'ai17-globe',
  tags: ['scene', 'ai'],
  blurb: "Lesson 17: a globe of blue seas and green land on a stand, a gold half-meridian round it.",
  rows: [
    '.....bbbbb..y...',
    '...bbBNNBBbb.G..',
    '..bbwNNNBBnbbG..',
    '..bwNNNBBnnnb.y.',
    '.bBNNNBBbnnnbbG.',
    '.bBBNNBbbnnnnb.G',
    '.bBBBNbbnnnnnb.y',
    '.bBBBnnbbnnnbb.G',
    '.bBBbbnnbbnnbbG.',
    '..bbbbnnbbbnb.y.',
    '..bbbbbnbbbbbG..',
    '...bbbbbbbbb.G..',
    '.....bbbbb..y...',
    '.......O..G.....',
    '.......O........',
    '....OGGGGGO.....',
  ],
};

const CELL = [22, 10] as const;

const base = aiComposeLand('ai17-opener-base', [
  [aiMoon, 4, 3],
  [dawn, 0, 0],
  [cellTower, CELL[0], CELL[1]],
]);

export const ai17Opener: SceneArt = {
  id: 'ai17-opener',
  label: 'The sun rises behind a hill where a new city climbs into the dawn with two cranes still building it, while a cell tower in front of the pines sends out its signal.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: hook, x: 51, y: 10, motion: { kind: 'drift', amp: 2, periodMs: 4200 } },
    { sprite: hook, x: 73, y: 8, motion: { kind: 'drift', amp: 1, periodMs: 3600, phase: 0.5 } },
    { sprite: light, x: CELL[0] + 4, y: CELL[1], motion: { kind: 'twinkle', periodMs: 1500, min: 0.2 } },
    { sprite: signalLeft, x: CELL[0] - 1, y: CELL[1], motion: { kind: 'twinkle', periodMs: 1800, min: 0.1 } },
    { sprite: signalRight, x: CELL[0] + 7, y: CELL[1], motion: { kind: 'twinkle', periodMs: 1800, min: 0.1, phase: 0.5 } },
    { sprite: window_, x: 40, y: 25, motion: { kind: 'twinkle', periodMs: 3000, min: 0.1 } },
    { sprite: aiStar, x: 16, y: 5, motion: { kind: 'twinkle', periodMs: 2700, min: 0.2 } },
    { sprite: aiStar, x: 34, y: 2, motion: { kind: 'twinkle', periodMs: 3300, min: 0.2, phase: 0.6 } },
  ],
};

export const ai17Finish = aiKeepsake(
  'ai17-finish',
  'A globe of blue seas and green land on a small gold stand floating in a glass display case on a marble plinth, with sparkles around it.',
  globe,
);

export const art: LessonArtSet = { opener: ai17Opener, backdrop: aiBackdrop, finish: ai17Finish };
