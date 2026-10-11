/**
 * Financial Analytics lesson 15, A/B testing: randomize, treat, measure, then trust the winner.
 *
 * OPENER. The test bay, built symmetrical so the comparison reads at a glance. Customers come down
 * the chute into the randomizer, whose die rolls a new face for each one, and leave it one to the
 * left, one to the right. Left is chamber A, the control, holding the lesson's plain blue card
 * offer; right is chamber B, the treatment, holding the gold one. Each chamber's tally fills as
 * results come in, and B's runs further; a green tick hangs by B. On the wall the two outcome
 * curves draw themselves apart (grey A, green B), the analyst stands at A and the colleague at B
 * with her clipboard, ticking, and the map lights ANALYZE.
 *
 * KEEPSAKE. The trophy with the lesson's test: a blue card and a gold card, and a green tick on
 * the gold one.
 */
import { faBackdrop } from './fa-backdrop';
import { faAnalyst, faBubble, faCompose, faConduit, faLater, faPacketRun, faPipelineMap, faRawBits, faTabletLine, FA_ANALYST_TABLET } from './fa-kit';
import { faDrawnBy, faKeepsake, faMonitor, faRoom, faStageLight, FA_MONITOR_GLASS } from './fa-kit-a';
import { faBlank, faChute, faColleague, faPacketsLeft, faRowsOf, faTrace, FA_CLIPBOARD } from './fa-kit-b';
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';

/* ── the bay ───────────────────────────────────────────────────────────────────────────────── */

/** A test chamber, 16 x 27: a glass tank on a cabinet with a tally window (10x3 at TALLY). */
const chamber: PixelSprite = {
  id: 'fa15-chamber',
  name: 'chamber',
  tags: ['scene', 'fa15', 'station'],
  rows: [
    '.DDDDDDDDDDDDDD.',
    'DxwxxxxxxxxxxXkD',
    'DDDDDDDDDDDDDDDD',
    ...Array.from({ length: 12 }, () => 'DxkKKKKKKKKKKKkD'),
    'DDDDDDDDDDDDDDDD',
    'DxXXXXXXXXXXXXkD',
    'DxDDDDDDDDDDDDkD',
    'DxDKKKKKKKKKKDkD',
    'DxDKKKKKKKKKKDkD',
    'DxDKKKKKKKKKKDkD',
    'DxDDDDDDDDDDDDkD',
    'DxXXXXXXXXXXXXkD',
    'DTTTTTTTTTTTTTtD',
    'DxXXXXXXXXXXXXkD',
    'DDDDDDDDDDDDDDDD',
    '.DkD........DkD.',
  ],
};
const TALLY = { x: 3, y: 18 } as const;

/** The randomizer: a wall cabinet the chute feeds, a die in its face, a pipe out of each side. */
const randomizer: PixelSprite = {
  id: 'fa15-randomizer',
  name: 'randomizer',
  tags: ['scene', 'fa15', 'station'],
  rows: [
    '.DDDDDDDDDDDD.',
    'DxwxxxxxxxxXkD',
    ...Array.from({ length: 8 }, () => 'DxXXXXXXXXXXkD'),
    'DDDDDDDDDDDDDD',
  ],
};

/** A pipe dropping from a side pipe into a chamber's lid, 5 x 5. */
const drop: PixelSprite = { id: 'fa15-drop', name: 'drop', tags: ['scene', 'fa15', 'prop'], rows: ['DxXkD', 'DxXkD', 'DDDDD', 'DxXkD', 'DxXkD'] };

const letterA: PixelSprite = { id: 'fa15-letter-a', name: 'letter a', tags: ['scene', 'fa15'], rows: ['.w.', 'w.w', 'www', 'w.w', 'w.w'] };
const letterB: PixelSprite = { id: 'fa15-letter-b', name: 'letter b', tags: ['scene', 'fa15'], rows: ['ww.', 'w.w', 'ww.', 'w.w', 'ww.'] };

/* Where things stand: the bay is symmetrical about the randomizer. */
const MAP = { x: 1, y: 1 } as const;
const BELLS = { x: 52, y: 1 } as const;
const CHUTE = { x: 37, y: 0 } as const;
const BOX = { x: 33, y: 10 } as const;
const PIPE_A = { x: 19, y: 12 } as const;
const PIPE_B = { x: 47, y: 12 } as const;
const TANK_A = { x: 14, y: 22 } as const;
const TANK_B = { x: 51, y: 22 } as const;
const ANALYST = { x: 1, y: 33 } as const;
const COLLEAGUE = { x: 68, y: 31 } as const;

const room = faRoom('fa15-opener-room', [
  [TANK_A.x + 2, 50, 15, 1, 'Z'],
  [TANK_B.x + 2, 50, 15, 1, 'Z'],
  [ANALYST.x + 4, 57, 12, 2, 'Z'],
  [COLLEAGUE.x + 4, 57, 8, 2, 'Z'],
]);

const base = faCompose('fa15-opener-base', room, [
  [faPipelineMap, MAP.x, MAP.y],
  [faMonitor('fa15-bells', 27, 16), BELLS.x, BELLS.y],
  [faChute('fa15-chute', 4), CHUTE.x, CHUTE.y],
  [randomizer, BOX.x, BOX.y],
  [faConduit('fa15-pipe-a', 14), PIPE_A.x, PIPE_A.y],
  [faConduit('fa15-pipe-b', 14), PIPE_B.x, PIPE_B.y],
  [drop, TANK_A.x + 5, 17],
  [drop, TANK_B.x + 5, 17],
  [letterA, TANK_A.x, 16],
  [letterB, TANK_B.x + 11, 16],
  [chamber, TANK_A.x, TANK_A.y],
  [chamber, TANK_B.x, TANK_B.y],
  [faAnalyst, ANALYST.x, ANALYST.y],
  [faColleague, COLLEAGUE.x, COLLEAGUE.y],
]);

/* ── moving parts ──────────────────────────────────────────────────────────────────────────── */

/** The randomizer's die rolling a new face for every customer it sends left or right. */
const die: PixelSprite = (() => {
  const blank = ['DDDDDDD', 'DwwwwxD', 'DwwwwxD', 'DwwwwxD', 'DwwwwxD', 'DxxxxxD', 'DDDDDDD'];
  const PIPS: Record<string, readonly (readonly [number, number])[]> = {
    1: [[3, 3]],
    2: [[2, 2], [4, 4]],
    3: [[2, 2], [3, 3], [4, 4]],
    4: [[2, 2], [4, 2], [2, 4], [4, 4]],
    5: [[2, 2], [4, 2], [3, 3], [2, 4], [4, 4]],
    6: [[2, 2], [4, 2], [2, 3], [4, 3], [2, 4], [4, 4]],
  };
  const face = (n: number) => blank.map((row, y) => [...row].map((ch, x) => (PIPS[n].some(([px, py]) => px === x && py === y) ? 'K' : ch)).join(''));
  const frames = [3, 6, 2, 5, 1, 4].map(face);
  return { id: 'fa15-die', name: 'die', tags: ['scene', 'fa15'], rows: frames[4], frames, frameMs: 540 };
})();

/** A customer leaving for A, then one for B: the two runs are half a gap apart. */
const toA = faPacketsLeft('fa15-to-a', 12, ['B'], 6, 180);
const toB = faLater(faPacketRun('fa15-to-b', 12, [[Infinity, 'B']], 6, 180), 'fa15-to-b-later', 3, 180);

/** The offers: A's plain blue card, B's gold one. */
const cardA: PixelSprite = { id: 'fa15-card-a', name: 'card a', tags: ['scene', 'fa15'], rows: ['.DDDDDDD.', 'DBBBBBBbD', 'DKKKKKKKD', 'DBwwBBBbD', 'DbbbbbbbD', '.DDDDDDD.'] };
const cardB: PixelSprite = { id: 'fa15-card-b', name: 'card b', tags: ['scene', 'fa15'], rows: ['.OOOOOOO.', 'OyyyyyyGO', 'OKKKKKKKO', 'OGwwGGGgO', 'OgggggggO', '.OOOOOOO.'] };

/** A chamber's tally filling column by column to `n` of 10, holding, then clearing: both last 14 beats. */
function tally(id: string, n: number, lit: string, dark: string): PixelSprite {
  const frames = Array.from({ length: 14 }, (_, f) => {
    const cols = f < 13 ? Math.min(f, n) : 0;
    return [0, 1, 2].map((y) => Array.from({ length: 10 }, (_, x) => (x < cols ? (y === 0 ? lit : dark) : '.')).join(''));
  });
  return { id, name: id, tags: ['scene', 'fa15'], rows: frames[12], frames, frameMs: 400 };
}

const tick: PixelSprite = { id: 'fa15-tick', name: 'tick', tags: ['scene', 'fa15'], rows: ['....N', '...NN', 'N.NN.', 'NNN..', '.N...'] };

/** The outcome curves on the wall: A's (grey) draws, then B's (green), shifted to the right. */
const bells: PixelSprite = (() => {
  const grid = faBlank(21, 10);
  const step = new Map<string, number>();
  const bell = (centre: number) => Array.from({ length: 21 }, (_, x) => 9 - Math.round(8 * Math.exp(-((x - centre) ** 2) / (2 * 2.6 * 2.6))));
  for (const [x, y] of faTrace(bell(7))) { grid[y][x] = 'x'; step.set(`${String(x)},${String(y)}`, Math.floor(x / 2)); }
  for (const [x, y] of faTrace(bell(13))) { grid[y][x] = 'N'; step.set(`${String(x)},${String(y)}`, 11 + Math.floor(x / 2)); }
  return faDrawnBy('fa15-bells-curves', faRowsOf(grid), (x, y) => step.get(`${String(x)},${String(y)}`) ?? 0, 200, 6);
})();

/** The colleague ticking results off down her clipboard. */
const clipboardTicks: PixelSprite = {
  id: 'fa15-clipboard-ticks',
  name: 'clipboard ticks',
  tags: ['scene', 'fa15'],
  rows: ['N.....', 'N.....'],
  frames: [['......', '......'], ['N.....', '......'], ['N.....', 'N.....'], ['N.....', 'N.....'], ['N.....', 'N.....']],
  frameMs: 700,
};

export const fa15Opener: SceneArt = {
  id: 'fa15-opener',
  label: 'A test bay in the data works: a randomizer rolls a die and sends customers left to chamber A with a blue card offer or right to chamber B with a gold one, B fills its tally further and earns a green tick, while the analyst and a colleague with a clipboard watch the two results draw apart.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: faRawBits, x: CHUTE.x + 1, y: CHUTE.y + 4 },
    { sprite: die, x: BOX.x + 3, y: BOX.y + 2 },
    { sprite: toA, x: PIPE_A.x + 1, y: PIPE_A.y + 2 },
    { sprite: toB, x: PIPE_B.x + 1, y: PIPE_B.y + 2 },
    { sprite: cardA, x: TANK_A.x + 3, y: TANK_A.y + 6, motion: { kind: 'bob', amp: 2, periodMs: 2600 } },
    { sprite: cardB, x: TANK_B.x + 3, y: TANK_B.y + 6, motion: { kind: 'bob', amp: 2, periodMs: 2600, phase: 0.5 } },
    { sprite: faBubble, x: TANK_A.x + 4, y: TANK_A.y + 13, motion: { kind: 'rise', amp: 9, periodMs: 2400 } },
    { sprite: faBubble, x: TANK_B.x + 12, y: TANK_B.y + 14, motion: { kind: 'rise', amp: 10, periodMs: 2100, phase: 0.4 } },
    { sprite: faBubble, x: TANK_B.x + 5, y: TANK_B.y + 13, motion: { kind: 'rise', amp: 9, periodMs: 1900, phase: 0.7 } },
    { sprite: tally('fa15-tally-a', 4, 'B', 'b'), x: TANK_A.x + TALLY.x, y: TANK_A.y + TALLY.y },
    { sprite: tally('fa15-tally-b', 8, 'N', 'n'), x: TANK_B.x + TALLY.x, y: TANK_B.y + TALLY.y },
    { sprite: tick, x: TANK_B.x + 15, y: 16, motion: { kind: 'twinkle', periodMs: 1600, min: 0.35 } },
    { sprite: bells, x: BELLS.x + FA_MONITOR_GLASS.x, y: BELLS.y + FA_MONITOR_GLASS.y },
    { sprite: faTabletLine, x: ANALYST.x + FA_ANALYST_TABLET.x, y: ANALYST.y + FA_ANALYST_TABLET.y },
    { sprite: clipboardTicks, x: COLLEAGUE.x + FA_CLIPBOARD.x, y: COLLEAGUE.y + FA_CLIPBOARD.y },
    faStageLight('analyze', MAP.x, MAP.y),
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────── */

/**
 * LESSON 15: A/B testing. Card A (blue, the control) and card B (gold, the test) land side by
 * side, then a bold green tick draws itself over B, it holds, the screen clears.
 */
export const faEmblemABTest: PixelSprite = (() => {
  const full = [
    '...............N',
    '..............NN',
    '.........NN..NN.',
    '..........NNNN..',
    '...........NN...',
    '................',
    'BBBBBBb..yyyyyyG',
    'DDDDDDD..DDDDDDD',
    'BwwBBBb..GwwGGGg',
    'BBBBBBb..GGGGGGg',
    'bbbbbbb..ggggggg',
  ];
  return {
    ...faDrawnBy('fa-emblem-ab-test', full, (x, y, ch) => (ch === 'N' ? 2 + Math.floor((x - 9) / 3) : x < 8 ? 0 : 1), 340, 4),
    name: 'emblem ab test',
    blurb: 'A blue card and a gold card with a green tick on the gold one.',
  };
})();

export const fa15Finish: SceneArt = faKeepsake(
  'fa15-finish',
  'A gold terminal trophy on a purple stand, its screen showing a blue card and a gold card side by side and a green tick drawing itself over the gold one, with small sparkles around it.',
  faEmblemABTest,
);

export const art: LessonArtSet = { opener: fa15Opener, backdrop: faBackdrop, finish: fa15Finish };
