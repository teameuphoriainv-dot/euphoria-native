/**
 * Alternative Investments lesson 4: commodities and futures.
 *
 * The opener is the lesson's own hook, April 20, 2020, on the kit's land at night (ai-kit-a.ts). On
 * the left an oil tank farm whose gauges all read full, the reason the lesson gives for the crash:
 * holders of expiring futures had nowhere to store the oil. Over the middle a lit exchange board
 * plots the lesson's WTI chart (Jan $63, Mar $20, Apr 19 $18, Apr 20 -$37.63), the last day falling
 * through the zero line. On the right, the other extreme of that day: gold, the safe haven, glowing
 * in a vault set into the hill. A barrel and one wheat sheaf by the fence stand for the energy and
 * agriculture sectors. The chart and the gauges hold still; only the minus 37 point blinks, the
 * tank warning lights and the stars twinkle and the gold glints. The keepsake is the kit's gold bars
 * in the glass case.
 */
import type { PixelSprite } from '../types';
import { aiBackdrop } from './ai-backdrop';
import { aiGlintGold, aiGoldBars, aiKeepsake } from './ai-kit';
import { aiComposeLand, aiMoon, aiStar } from './ai-kit-a';
import { AI_GOLD_PALETTE } from './ai-kit-b';
import type { LessonArtSet, SceneArt } from './types';

/**
 * The board's screen, 34x17: WTI over a dashed zero line (row 10) labelled 0. The price line joins
 * the lesson's four points at even steps, $63 (2, 1), $20 (12, 7), $18 (21, 7) and -$37.63 (31, 15),
 * gold above zero and red below, with -37 beside the drop.
 */
const SCREEN = [
  'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
  'KKyKKKKKKKKKKKKKKKKKwKKKwKwwwKwwwK',
  'KKKyyKKKKKKKKKKKKKKKwKKKwKKwKKKwKK',
  'KKKKKyyKKKKKKKKKKKKKwKwKwKKwKKKwKK',
  'KKKKKKKyKKKKKKKKKKKKwKwKwKKwKKKwKK',
  'KKKKKKKKyyKKKKKKKKKKKwKwKKKwKKwwwK',
  'KKKKKKKKKKyyKKKKKKKKKKKKKKKKKKKKKK',
  'KKKKKKKKKKKKyyyyyyyyyyKKKKKKKKKKKK',
  'XXXKKKKKKKKKKKKKKKKKKKyKKKKKKKKKKK',
  'XKXKKKKKKKKKKKKKKKKKKKKyyKKKKKKKKK',
  'XKXKXKXKXKXKXKXKXKXKXKXKXRXKXKXKXK',
  'XKXKKKKKKKKKKKRRRKRRRKKKKKRKKKKKKK',
  'XXXKKKKKKKKKKKKKRKKKRKKKKKKRKKKKKK',
  'KKKKKKKKKKRRRKKRRKKKRKKKKKKKRRKKKK',
  'KKKKKKKKKKKKKKKKRKKRKKKKKKKKKKRKKK',
  'KKKKKKKKKKKKKKRRRKKRKKKKKKKKKKKRKK',
  'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
];

/** The exchange board: the screen in a steel frame, lit along its top, on two legs. */
const board: PixelSprite = {
  id: 'ai4-board',
  name: 'ai4-board',
  tags: ['scene', 'ai'],
  blurb: "A lit exchange board on two legs plotting WTI crude in early 2020, falling through zero to -37.",
  rows: [
    'D'.repeat(38),
    `D${'x'.repeat(36)}D`,
    ...SCREEN.map((row) => `Dx${row}XD`),
    `D${'X'.repeat(36)}D`,
    'D'.repeat(38),
    ...Array.from({ length: 13 }, () => `${'.'.repeat(8)}xD${'.'.repeat(18)}xD${'.'.repeat(8)}`),
  ],
};

/** The minus 37 point, the one part of the chart that moves: it blinks. Centred on screen (31, 15). */
const lowPoint: PixelSprite = { id: 'ai4-low-point', name: 'ai4-low-point', tags: [], rows: ['rRr', 'RsR', 'rRr'] };

/** A big storage tank, moonlit on its left, its level gauge lit to the top: full. */
const tankBig: PixelSprite = {
  id: 'ai4-tank-big',
  name: 'ai4-tank-big',
  tags: ['scene', 'ai'],
  blurb: "A squat oil storage tank with a low coned roof and a level gauge lit to the top.",
  rows: [
    '.......DDDD.......',
    '....DDDxwxxDDD....',
    '.DDDxwwwxxxxxXDDD.',
    'DxxwwwwxxxxxxxXXXD',
    'DDDDDDDDDDDDDDDDDD',
    'DxwwwxxxxDDDDXXXXD',
    'DxwwwxxxxDRRDXXXXD',
    'DxwwwxxxxDyyDXXXXD',
    'DXXXXXXXXDyyDXXXXD',
    'DxwwwxxxxDyyDXXXXD',
    'DxwwwxxxxDyyDXXXXD',
    'DxwwwxxxxDGGDXXXXD',
    'DxwwwxxxxDDDDXXXXD',
    '.DDDDDDDDDDDDDDDD.',
  ],
};

const tankSmall: PixelSprite = {
  id: 'ai4-tank-small',
  name: 'ai4-tank-small',
  tags: ['scene', 'ai'],
  blurb: "A smaller storage tank in front, its gauge full too.",
  rows: [
    '......DDD......',
    '...DDDxwxDDD...',
    '.DDxwwwxxxxXDD.',
    'DDDDDDDDDDDDDDD',
    'DxwwwxxxDDDDXXD',
    'DxwwwxxxDRRDXXD',
    'DXXXXXXXDyyDXXD',
    'DxwwwxxxDyyDXXD',
    'DxwwwxxxDGGDXXD',
    'DxwwwxxxDDDDXXD',
    '.DDDDDDDDDDDDD.',
  ],
};

/** The tanks' shadow on the meadow. */
const tankShadow: PixelSprite = { id: 'ai4-tank-shadow', name: 'ai4-tank-shadow', tags: [], palette: { z: '#0F0C14' }, rows: ['z'.repeat(30)] };

const barrel: PixelSprite = {
  id: 'ai4-barrel',
  name: 'ai4-barrel',
  tags: ['scene', 'ai'],
  blurb: "A blue oil drum with a steel lid and two ribs, lit on its left.",
  rows: [
    '.DDDDD.',
    'DxxxXXD',
    'DBBbbbD',
    'DDDDDDD',
    'DBBbbbD',
    'DBBbbbD',
    'DBBbbbD',
    'DDDDDDD',
    'DBBbbbD',
    '.DDDDD.',
  ],
};

const sheaf: PixelSprite = {
  id: 'ai4-sheaf',
  name: 'ai4-sheaf',
  tags: ['scene', 'ai'],
  blurb: "One wheat sheaf, its heads fanned out over a gold band.",
  rows: [
    '.y..y..y',
    'yGyyGyyG',
    'GgGGgGGg',
    '.GgGgGg.',
    '..GgGg..',
    '..GgGg..',
    '.OOOOOO.',
    '..GgGg..',
    '.GgGgGg.',
    'Gg.Gg.gG',
  ],
};

/** A rise in the far hills for the vault: moonlit rim, hill tones (AI_LAND_PALETTE). */
const mound: PixelSprite = {
  id: 'ai4-mound',
  name: 'ai4-mound',
  tags: ['scene', 'ai'],
  blurb: "The far hill rising on the right, to hold the vault.",
  rows: [
    '...................MMMMMMMM.........',
    '...............MMMMLLLLLLLLMMM......',
    '.............MMLLLLLLLLLLLLLLLMM....',
    '...........MMLLLLLLLLLLLLLLLLLLLM...',
    '.........MMLLLLLLLLLLLLLLLLLLLLLLMM.',
    '........MLLLLLLLLLLLLLLLLLLLLLLLLLLM',
    '.......MLLLLLLLLLLLLLLLLLLLLLLLLLLLL',
    '.....MMLLLLLLLLLLLLLLLLLLLLLLLLLLLLL',
    '....MLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL',
    '...MLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL',
    '..MLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL',
    '.MLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL',
    'MLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL',
  ],
};

/** The vault in the hill, standing open: a steel ring round a doorway full of gold light and bars, the door swung out on its hinge. */
const vault: PixelSprite = {
  id: 'ai4-vault',
  name: 'ai4-vault',
  tags: ['scene', 'ai'],
  blurb: "A round vault door standing open, gold light and stacked bars inside.",
  rows: [
    '....DDDDDDDD.......DDD..',
    '...DDwwxxxXDD.....DxXXD.',
    '..DwwwKKKKXXXD....DwxXD.',
    '.DwwKKggggKKXXDDXXDwxXD.',
    '.DwwKgGGGGgKXXD...DwxXD.',
    'DwwKgGGyyGGgKXXD..DwGXD.',
    'DxxKggOOOOggKXXD..DwxXD.',
    'DxxKggOyyOggKXXD..DwxXD.',
    'DxxKggOGgOggKXXD..DwxXD.',
    'DxxKOOOOOOOOKXXD..DwGXD.',
    '.DxKOyyOOyyOKXD...DwxXD.',
    '.DxKOGgOOGgOKXDDXXDwxXD.',
    '..DXKOOOOOOKXD....DwxXD.',
    '...DDxxXXXXDD.....DxXXD.',
    '....DDDDDDDD.......DDD..',
  ],
};

/** The vault's light lying on the meadow in front of it, fading out to Y, AI_GOLD_PALETTE's dark amber. */
const pool: PixelSprite = {
  id: 'ai4-pool',
  name: 'ai4-pool',
  tags: ['scene', 'ai'],
  blurb: "Gold light on the grass in front of the open vault.",
  rows: [
    '..OOggggggggggOO..',
    'YOOOOOOOOOOOOOOOOY',
    '..YYYYYYYYYYYYYY..',
  ],
};

/** The brightest part of the light, breathing over it. */
const pulse: PixelSprite = { id: 'ai4-pulse', name: 'ai4-pulse', tags: [], rows: ['GGGGGG', '.OOOO.'] };
const warning: PixelSprite = { id: 'ai4-warning', name: 'ai4-warning', tags: [], rows: ['R'] };

const BOARD = [24, 2] as const;
/** The minus 37 point on the board: frame (2, 2) plus screen (31, 15), less one for the 3x3 blink. */
const LOW = [BOARD[0] + 2 + 31 - 1, BOARD[1] + 2 + 15 - 1] as const;
const TANK_BIG = [1, 27] as const;
const TANK_SMALL = [15, 30] as const;
const VAULT = [56, 24] as const;

const composed = aiComposeLand('ai4-opener-base', [
  [aiMoon, 3, 3],
  [mound, 44, 19],
  [tankShadow, 0, 41],
  [tankBig, TANK_BIG[0], TANK_BIG[1]],
  [tankSmall, TANK_SMALL[0], TANK_SMALL[1]],
  [board, BOARD[0], BOARD[1]],
  [vault, VAULT[0], VAULT[1]],
  [pool, VAULT[0] - 1, VAULT[1] + 15],
  [barrel, 11, 47],
  [sheaf, 19, 47],
]);
const base: PixelSprite = { ...composed, palette: { ...composed.palette, ...AI_GOLD_PALETTE } };

export const ai4Opener: SceneArt = {
  id: 'ai4-opener',
  label: 'At night two oil storage tanks with full gauges stand by a lit price board where the WTI oil line falls through zero to minus 37, a barrel and a wheat sheaf wait at the fence, and gold bars glow inside a round vault standing open in the hill.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: lowPoint, x: LOW[0], y: LOW[1], motion: { kind: 'twinkle', periodMs: 1200, min: 0.25 } },
    { sprite: warning, x: TANK_BIG[0] + 8, y: TANK_BIG[1] - 1, motion: { kind: 'twinkle', periodMs: 1500, min: 0.15 } },
    { sprite: warning, x: TANK_SMALL[0] + 7, y: TANK_SMALL[1] - 1, motion: { kind: 'twinkle', periodMs: 1500, min: 0.15, phase: 0.5 } },
    { sprite: pulse, x: VAULT[0] + 5, y: VAULT[1] + 15, motion: { kind: 'twinkle', periodMs: 2600, min: 0.2 } },
    { sprite: aiGlintGold, x: VAULT[0] + 8, y: VAULT[1] + 4, motion: { kind: 'twinkle', periodMs: 1700, min: 0.4 } },
    { sprite: aiStar, x: 15, y: 15, motion: { kind: 'twinkle', periodMs: 2800, min: 0.2 } },
    { sprite: aiStar, x: 70, y: 8, motion: { kind: 'twinkle', periodMs: 3300, min: 0.2, phase: 0.55 } },
  ],
};

export const ai4Finish = aiKeepsake(
  'ai4-finish',
  'Three stacked gold bars floating in a glass display case on a marble plinth, with sparkles around them.',
  aiGoldBars,
);

export const art: LessonArtSet = { opener: ai4Opener, backdrop: aiBackdrop, finish: ai4Finish };
