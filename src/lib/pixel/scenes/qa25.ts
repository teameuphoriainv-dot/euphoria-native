/**
 * Quantitative Analysis lesson 25, the Advanced Capstone: everything comes together.
 *
 * On a plaza in the financial district at night stands a stepped pyramid of twenty-four sandstone
 * blocks, a block a lesson, each carved in gold with that lesson's own medal in small, white where the
 * medal has white: from the base up, sigma, the die, a price over its moving average, the frontier,
 * the hockey stick, the fan of paths and alpha; the spread between its bands, the gear, the funnel, the
 * integral, the lightning bolt and the yield curve; KO, the shield, the anchor, the neural network and
 * fast-forward; the backtest's climb and fall, the hourglass, Q and the linked rings; and at the top
 * the prior and posterior, and psi. Each framework stands on the ones below it. Now the gold capstone
 * settles on top, the pathway's sigma on its face, while the quant cheers at the pyramid's foot, off
 * to one side so every block shows, and fireworks burst over the skyline. Only small layers move: the
 * capstone lifts and settles, two fireworks burst, sparkles flash round the capstone, windows light
 * across the city.
 * Keepsake: the stepped pyramid crowned with its white capstone, on the honours medal with a gold
 * laurel (the checkpoint's laurel is green).
 */
import type { PixelSprite } from '../types';
import { qaBackdrop } from './qa-backdrop';
import {
  QA_MEDAL_SWAY, qaCompose, qaKeepsake, qaLater, qaRect, qaRoom, qaSparkleBig, qaSparkleSmall, qaStar,
} from './qa-kit';
import { QA_LAUREL_AT, qaLaurel, qaQuantCheer, qaRibbonHonour } from './qa-kit-b';
import { qaGlints, qaSkyline } from './qa-kit-c';
import type { LessonArtSet, SceneArt } from './types';

/* ── the night over the city ───────────────────────────────────────────────────────────────────── */

const GROUND_Y = 46;
const TOWERS = [
  [0, 24, 7], [6, 19, 7], [12, 27, 6], [17, 22, 8], [24, 30, 7], [50, 26, 6], [55, 20, 8], [62, 28, 6], [67, 17, 7], [73, 25, 7],
] as const;
const city = qaSkyline('qa25-city', 80, GROUND_Y, TOWERS, 25);
const STARS = [[20, 3], [27, 8], [33, 2], [38, 8], [56, 9], [58, 2], [19, 12]] as const;
const dimStar: PixelSprite = { id: 'qa25-star-dim', name: 'qa25-star-dim', tags: ['scene', 'qa25'], rows: ['x'] };

/* ── the pyramid: a stone a lesson ─────────────────────────────────────────────────────────────── */

/**
 * Each lesson's medal emblem carved small enough for its stone: '#' is gold, 'w' is white (where the
 * medal has white), five rows tall and five wide, KO's two letters seven.
 */
const CARVED: Readonly<Record<string, readonly string[]>> = {
  sigma: ['#####', '.#...', '..#..', '.#...', '#####'],
  die: ['#####', '#.#.#', '#####', '#.#.#', '#####'],
  priceAverage: ['....#', '.#.#.', '#.#..', '...ww', 'www..'],
  frontier: ['#...#', '#..w.', '#.#..', '#.#..', '#####'],
  hockeyStick: ['#....', '#...#', '#..#.', '###..', '#####'],
  fan: ['...##', '.##..', '#####', '.##..', '...##'],
  alpha: ['.....', '.##.#', '#..#.', '#..#.', '.##.#'],
  reversion: ['w.w.w', '.#...', '#.#.#', '...#.', 'w.w.w'],
  gear: ['.#.#.', '#####', '##.##', '#####', '.#.#.'],
  funnel: ['#####', '.###.', '..#..', '..#..', '..w..'],
  integral: ['...##', '..#..', '..#..', '..#..', '##...'],
  bolt: ['..##.', '.##..', '#####', '..##.', '.##..'],
  yieldCurve: ['#w...', '#.w##', '#.#ww', '##...', '#####'],
  knockOut: ['#.#..#.', '##..#.#', '#...#.#', '##..#.#', '#.#..#.'],
  shield: ['#####', '#####', '#####', '.###.', '..#..'],
  anchor: ['..#..', '.###.', '..#..', '#.#.#', '.###.'],
  network: ['#....', '.w#w.', '#...#', '.w#w.', '#....'],
  fastForward: ['#..#.', '##.##', '#####', '##.##', '#..#.'],
  backtest: ['..w..', '..#..', '.#.#.', '#.w.#', '..w..'],
  hourglass: ['#####', '.###.', '..#..', '.###.', '#####'],
  measureQ: ['.###.', '#...#', '#...#', '#..#.', '.##.#'],
  rings: ['###..', '#.#..', '#####', '..#.#', '..###'],
  update: ['...#.', '...#.', '.ww#.', 'w.###', '#####'],
  psi: ['#.#.#', '#.#.#', '.###.', '..#..', '..#..'],
};

/** The tiers from the base up, lessons 1 to 24 left to right: 7, 6, 5, 4 and 2 stones. */
const PITCH = { x: 8, y: 7 } as const;
const TIERS: readonly { y: number; glyphs: readonly string[] }[] = [
  { y: 39, glyphs: ['sigma', 'die', 'priceAverage', 'frontier', 'hockeyStick', 'fan', 'alpha'] },
  { y: 32, glyphs: ['reversion', 'gear', 'funnel', 'integral', 'bolt', 'yieldCurve'] },
  { y: 25, glyphs: ['knockOut', 'shield', 'anchor', 'network', 'fastForward'] },
  { y: 18, glyphs: ['backtest', 'hourglass', 'measureQ', 'rings'] },
  { y: 11, glyphs: ['update', 'psi'] },
];
/** The pyramid stands right of centre, so the quant can cheer at its foot without hiding a stone. */
const CENTRE_X = 50;
const tierX = (count: number) => CENTRE_X - (count * PITCH.x) / 2;

/**
 * One tier: sandstone blocks, wider than they are tall, in dark mortar, each lit along its top with its
 * lesson's emblem gilded in the middle and, on some, a hairline crack at the right edge. (Square grey
 * blocks with a letter each read as keyboard keys.)
 */
function tier(id: string, glyphs: readonly string[], seed: number): PixelSprite {
  const width = glyphs.length * PITCH.x + 1;
  return {
    id,
    name: id,
    tags: ['scene', 'qa25'],
    rows: [...Array(PITCH.y)].map((_, y) => [...Array(width)].map((_, x) => {
      if (y === 0 || x % PITCH.x === 0) return 'K';
      const [block, sx, sy] = [Math.floor(x / PITCH.x), (x % PITCH.x) - 1, y - 1];
      const glyph = CARVED[glyphs[block]];
      const left = Math.floor((PITCH.x - 1 - glyph[0].length) / 2);
      const carved = sy >= 1 ? glyph[sy - 1][sx - left] : undefined;
      if (carved !== undefined && carved !== '.') return carved === '#' ? 'y' : carved;
      if (left > 0 && (block + seed) % 3 === 0 && sx === PITCH.x - 2 && (sy === 2 || sy === 3)) return 'K';
      return sy === 0 ? 'g' : 'O';
    }).join('')),
  };
}

/** The capstone: a gold block with the pathway's sigma on its face in white. */
const CAP = { x: CENTRE_X - 4, y: 4, width: 9, height: 7 } as const;
const SIGMA: PixelSprite = {
  id: 'qa25-cap-sigma',
  name: 'qa25-cap-sigma',
  tags: ['scene', 'qa25'],
  rows: ['WWWWW', '.W...', '..W..', '.W...', 'WWWWW'],
};
const capstone = qaCompose('qa25-capstone', CAP.width, CAP.height, [
  {
    sprite: {
      id: 'qa25-cap-block',
      name: 'qa25-cap-block',
      tags: ['scene', 'qa25'],
      rows: [...Array(CAP.height)].map((_, y) => [...Array(CAP.width)].map((_, x) => {
        if (y === 0 || y === CAP.height - 1 || x === 0 || x === CAP.width - 1) return 'O';
        if (y === 1 || x === 1) return 'y';
        return y === CAP.height - 2 || x === CAP.width - 2 ? 'g' : 'G';
      }).join('')),
    },
    x: 0,
    y: 0,
  },
  { sprite: SIGMA, x: 2, y: 1 },
]);

/* ── the fireworks ─────────────────────────────────────────────────────────────────────────────── */

const BURST = 15;
const DIRS = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]] as const;
/** One stage of a firework: the shell climbing, the burst, the rays spreading, fading, gone. */
function burst(stage: number, [core, ray, tip]: readonly [string, string, string]): string[] {
  const g = Array.from({ length: BURST }, () => new Array<string>(BURST).fill('.'));
  const c = Math.floor(BURST / 2);
  const rays = (from: number, to: number, ch: (k: number) => string) => DIRS.forEach(([dx, dy]) => {
    for (let k = from; k <= to; k += 1) g[c + dy * k][c + dx * k] = ch(k);
  });
  if (stage === 0) [g[13][c], g[14][c]] = [ray, tip];
  if (stage === 1) [g[9][c], g[10][c], g[11][c]] = [core, ray, tip];
  if (stage === 2) {
    g[c][c] = core;
    rays(1, 2, (k) => (k === 1 ? ray : tip));
  }
  if (stage === 3) {
    g[c][c] = core;
    rays(2, 5, (k) => (k < 4 ? ray : tip));
  }
  if (stage === 4) rays(4, 6, (k) => (k === 5 ? '.' : tip));
  return g.map((row) => row.join(''));
}
function firework(id: string, colours: readonly [string, string, string], start: number, frameMs: number): PixelSprite {
  const stages = [0, 1, 2, 3, 4, 5];
  const order = [...stages.slice(start), ...stages.slice(0, start)];
  return { id, name: id, tags: ['scene', 'qa25'], rows: burst(3, colours), frames: order.map((s) => burst(s, colours)), frameMs };
}

/* ── the plaza ─────────────────────────────────────────────────────────────────────────────────── */

const plaza: PixelSprite = {
  id: 'qa25-plaza',
  name: 'qa25-plaza',
  tags: ['scene', 'qa25'],
  rows: [...Array(60 - GROUND_Y)].map((_, j) => [...Array(80)].map((_, x) => {
    if (j === 0) return 'D';
    return j === 4 || j === 8 || j === 12 || x % 10 === 5 ? 'K' : 'k';
  }).join('')),
};

/** The quant cheers at the pyramid's foot on the left, clear of every stone. */
const QUANT_AT = { x: 0, y: 30 } as const;

const base = qaCompose('qa25-opener-base', 80, 60, [
  { sprite: qaRoom, x: 0, y: 0 },
  { sprite: qaRect('qa25-night', 80, GROUND_Y, 'K'), x: 0, y: 0 },
  ...STARS.map(([x, y]) => ({ sprite: dimStar, x, y })),
  { sprite: city, x: 0, y: 0 },
  ...TIERS.map(({ y, glyphs }, i) => ({ sprite: tier(`qa25-tier-${String(i)}`, glyphs, i), x: tierX(glyphs.length), y })),
  { sprite: plaza, x: 0, y: GROUND_Y },
  { sprite: qaQuantCheer, x: QUANT_AT.x, y: QUANT_AT.y },
]);

export const qa25Opener: SceneArt = {
  id: 'qa25-opener',
  label: 'A quant cheers beside a stepped pyramid of twenty-four sandstone blocks, each carved in gold with the emblem of an earlier lesson, as the gold capstone settles on top and fireworks burst over the city at night.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: capstone, x: CAP.x, y: CAP.y, motion: { kind: 'bob', amp: 2, periodMs: 2600 } },
    { sprite: firework('qa25-firework-gold', ['W', 'y', 'G'], 0, 300), x: 2, y: 2 },
    { sprite: firework('qa25-firework-orchid', ['W', 'q', 'P'], 3, 340), x: 63, y: 1 },
    { sprite: qaSparkleBig, x: CAP.x - 7, y: CAP.y - 3, motion: { kind: 'twinkle', periodMs: 1500, min: 0.4 } },
    { sprite: qaLater(qaSparkleSmall, 'qa25-sparkle-small', 1, 560), x: CAP.x + CAP.width + 2, y: CAP.y + 1, motion: { kind: 'twinkle', periodMs: 1900, phase: 0.4, min: 0.4 } },
    { sprite: qaStar, x: 30, y: 5, motion: { kind: 'twinkle', periodMs: 2300, min: 0.2 } },
    ...qaGlints([[3, 29], [7, 30], [72, 22], [76, 33]]),
  ],
};

/** Lesson 25's emblem: a stepped pyramid crowned with a white capstone. */
const emblemPyramid: PixelSprite = {
  id: 'qa25-emblem-pyramid',
  name: 'qa25-emblem-pyramid',
  tags: ['scene', 'qa25'],
  rows: [
    '............',
    '.....WW.....',
    '.....WWy....',
    '....OOOOy...',
    '....OOOOy...',
    '...OOOOOOy..',
    '...OOOOOOy..',
    '..OOOOOOOOy.',
    '..OOOOOOOOy.',
    '.OOOOOOOOOO.',
    '.OOOOOOOOOO.',
    '..yyyyyyyyy.',
  ],
};

/** The capstone's laurel is gold where the checkpoint's is green: the same leaves, recoloured. */
const laurelGold: PixelSprite = {
  ...qaLaurel,
  id: 'qa25-laurel-gold',
  name: 'qa25-laurel-gold',
  rows: qaLaurel.rows.map((row) => row.replace(/n/g, 'O').replace(/N/g, 'G').replace(/m/g, 'y')),
};

export const qa25Finish: SceneArt = qaKeepsake(
  'qa25-finish',
  'A gold medallion in a gold laurel, hanging from a purple ribbon striped with gold, embossed with a stepped pyramid crowned by a white capstone, with small sparkles around it.',
  emblemPyramid,
  { base: qaRibbonHonour, extra: [{ sprite: laurelGold, x: QA_LAUREL_AT.x, y: QA_LAUREL_AT.y, motion: QA_MEDAL_SWAY }] },
);

export const art: LessonArtSet = { opener: qa25Opener, backdrop: qaBackdrop, finish: qa25Finish };
