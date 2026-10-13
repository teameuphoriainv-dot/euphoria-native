/**
 * Global Economics lesson 25, the advanced capstone: one shock traced through the whole economy, on
 * the bay at dawn.
 *
 * The capstone's method is the professional's: identify the shock, then trace how it travels. Its
 * own example is Europe's gas in 2022, which became electricity bills, then factory costs, then the
 * price of bread, then a central bank's rate decision. So a gas tanker sits stalled in the harbor
 * mouth with the sun coming up behind it, its warning light blinking, and from it a gold line hops
 * along the far shore from roof to roof: the port's crane, the power station's cooling tower, the
 * factory, the homes and the central bank, each lighting up in turn as the line reaches it, until
 * the last hop comes down to the student on the promenade, who holds up a magnifying glass. Then the
 * shock comes again. Only small layers move: the shock's burst, the line and the five lit places,
 * the tanker's light, steam from the cooling tower, the sun on the water and two gulls.
 *
 * The keepsake's emblem is the world inside a loop of six coloured beads, one for each framework the
 * capstone joins, a spark running round the loop.
 */
import type { PixelSprite } from '../types';
import { geBackdrop } from './ge-backdrop';
import { GE_PALETTE, GE_STUDENT_HOLD, geBeacon, geCompose, geGull, geLater, geShimmer, geSmoke, geStudent } from './ge-kit';
import { geKeepsake } from './ge1-finish';
import type { LessonArtSet, SceneArt } from './types';

/* ── one-off props ──────────────────────────────────────────────────────────────────────────── */

/**
 * The bay at dawn, 80x60, the harbor mouth moved to the left: the sky deepening from navy to a red
 * horizon, the sun's rim up over the sea between two breakwater lights (x 0 to 21), the far shore's
 * low land from x 21 (rows 27 to 31) where the places stand, the bay from row 31 with the sun's path
 * under the mouth, the balustrade on rows 42 to 48 and the paving from row 49, where feet stand.
 */
const bayDawn: PixelSprite = {
  id: 'ge25-opener-bay',
  name: 'bay at dawn',
  tags: ['ge25', 'ground'],
  blurb: 'A dawn sky over the sea in a harbor mouth on the left, a low far shore, the bay and a stone balustrade.',
  palette: GE_PALETTE,
  rows: [
    'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',
    'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
    'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
    'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
    'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
    'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
    '66666666666666666666666666666666666666666666666666666666666666666666666666666666',
    '66666666666666666666666666666666666666666666666666666666666666666666666666666666',
    '66666666666666666666666666666666666666666666666666666666666666666666666666666666',
    '66666666666666666666666666666666666666666666666666666666666666666666666666666666',
    '66666666666666666666666666666666666666666666666666666666666666666666666666666666',
    'EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE',
    'EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE',
    'EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE',
    'EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE',
    'EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE',
    'IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII',
    'IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII',
    'IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII',
    'IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII',
    '22222222222222222222222222222222222222222222222222222222222222222222222222222222',
    '33333333555333333333332222222222222222222222222222222222222222222222222222222222',
    '3D33333555553333333D322222222222222222222222222222222222222222222222222222222222',
    'DrD444555555544444DrD99999999999999999999999999999999999999999999999999999999999',
    'DXD444444444444442DXD99999999999999999999999999999999999999999999999999999999999',
    'DXD222222222222222DXD99999999999999999999999999999999999999999999999999999999999',
    'XXX222222222222222XXXX9999999999999999999999999999999999999999999999999999999999',
    'DDD444444444444cccDDDDcccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
    'cccc333333333cccccccccccccccccddddddddddcccccccccccccccccccccccccccccccccccccccc',
    'ccccccccccccccccccccccccccccccccccccccccccccccccccccdddddccccccccccccccccccccccc',
    'cccccc444444ccccccccccccccccccccccccccccccccddddddddcccccccccccccccccccccccccccc',
    'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
    'ccccccc3333cccccccccccccdddddddccccccccccccccccccccccccccccccccccccccccccccccccc',
    'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
    'ccccccc333ccccccccccccccccccccccccccccccddddddddcccccccccccccccccccccccccccccccc',
    'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
    'cccccccc33ccccccddddddddcccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
    'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
    'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'cxXXDcxXXDcxXXDcxXXDcxXXDcxXXDcxXXDcxXXDcxXXDcxXXDcxXXDcxXXDcxXXDcxXXDcxXXDcxXXD',
    'cxXXDcxXXDcxXXDcxXXDcxXXDcxXXDcxXXDcxXXDcxXXDcxXXDcxXXDcxXXDcxXXDcxXXDcxXXDcxXXD',
    'cxXXDcxXXDcxXXDcxXXDcxXXDcxXXDcxXXDcxXXDcxXXDcxXXDcxXXDcxXXDcxXXDcxXXDcxXXDcxXXD',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'DDDkDDDDDDDkDDDDDDDkDDDDDDDkDDDDDDDkDDDDDDDkDDDDDDDkDDDDDDDkDDDDDDDkDDDDDDDkDDDD',
    'DDDkDDDDDDDkDDDDDDDkDDDDDDDkDDDDDDDkDDDDDDDkDDDDDDDkDDDDDDDkDDDDDDDkDDDDDDDkDDDD',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'DDDDDDDkDDDDDDDDDDkDDDDDDDDDDkDDDDDDDDDDkDDDDDDDDDDkDDDDDDDDDDkDDDDDDDDDDkDDDDDD',
    'DDDDDDDkDDDDDDDDDDkDDDDDDDDDDkDDDDDDDDDDkDDDDDDDDDDkDDDDDDDDDDkDDDDDDDDDDkDDDDDD',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'DkDDDDDDDDDDDDDDkDDDDDDDDDDDDDDkDDDDDDDDDDDDDDkDDDDDDDDDDDDDDkDDDDDDDDDDDDDDkDDD',
    'DkDDDDDDDDDDDDDDkDDDDDDDDDDDDDDkDDDDDDDDDDDDDDkDDDDDDDDDDDDDDkDDDDDDDDDDDDDDkDDD',
    'DkDDDDDDDDDDDDDDkDDDDDDDDDDDDDDkDDDDDDDDDDDDDDkDDDDDDDDDDDDDDkDDDDDDDDDDDDDDkDDD',
    'DkDDDDDDDDDDDDDDkDDDDDDDDDDDDDDkDDDDDDDDDDDDDDkDDDDDDDDDDDDDDkDDDDDDDDDDDDDDkDDD',
    'DkDDDDDDDDDDDDDDkDDDDDDDDDDDDDDkDDDDDDDDDDDDDDkDDDDDDDDDDDDDDkDDDDDDDDDDDDDDkDDD',
  ],
};

/** The stalled tanker, 13x6, in the harbor mouth: three gas domes, its bridge at the stern, no wake. */
const tanker: PixelSprite = {
  id: 'ge25-opener-tanker',
  name: 'gas tanker',
  tags: ['ge25', 'prop'],
  blurb: 'A gas tanker with three white domes and its bridge at the stern, lying still.',
  palette: GE_PALETTE,
  rows: [
    '..........DD.',
    '..........Dx.',
    '.zz..zz..DxxD',
    'zxxzzxxzzDkxD',
    'DDDDDDDDDDDDD',
    '.DrrrrrrrrrD.',
  ],
};

/*
 * The five places the shock reaches, left to right along the far shore, each standing on row 26 and
 * lit from the left by the low sun. A `k` is a dark window; it lights when the shock arrives.
 */

/** The port, 14x14: a ship-to-shore crane, its boom out over the water toward the mouth. */
const crane: PixelSprite = {
  id: 'ge25-opener-crane',
  name: 'port crane',
  tags: ['ge25', 'prop'],
  blurb: 'A grey ship-to-shore crane with its boom reaching out over the water.',
  palette: GE_PALETTE,
  rows: [
    'XXXXXXXXXXXX..',
    'xxxxxxxxxxxX..',
    'XXXXXXXXXXXX..',
    '.......XkxX...',
    '.......XxxX...',
    '......Xx..XD..',
    '......XxXXxD..',
    '......Xx..XD..',
    '......XxXXxD..',
    '......Xx..XD..',
    '......Xx..XD..',
    '......Xx..XD..',
    '.....XXXD.XXD.',
    '.....DDDD.DDD.',
  ],
};

/** The power station, 12x11: a cooling tower and its turbine hall. */
const power: PixelSprite = {
  id: 'ge25-opener-power',
  name: 'power station',
  tags: ['ge25', 'prop'],
  blurb: 'A pale cooling tower beside a small turbine hall.',
  palette: GE_PALETTE,
  rows: [
    '..xxxxX.....',
    '..xxxxX.....',
    '...xxX......',
    '...xxX......',
    '...xxX......',
    '..xxxxX.....',
    '..xxxxXDDDD.',
    '.xxxxxxXkDkD',
    '.xxxxxxXDDDD',
    'xxxxxxxxXkDk',
    'xxxxxxxxXDDD',
  ],
};

/** The factory, 10x12: red brick under a sawtooth roof, its chimney on the right. */
const factory: PixelSprite = {
  id: 'ge25-opener-factory',
  name: 'factory',
  tags: ['ge25', 'prop'],
  blurb: 'A red brick factory with a sawtooth roof and a tall chimney.',
  palette: GE_PALETTE,
  rows: [
    '........DD',
    '........Dk',
    '........Dk',
    '........Dk',
    '........Dk',
    '.r.r.r..Dk',
    'rRrRrRrrDk',
    'RRRRRRRRrr',
    'RkkRkkRkkr',
    'RRRRRRRRRr',
    'RkkRkkRkkr',
    'RRRRRRRRRr',
  ],
};

/** The homes, 10x8: two houses, where the price of bread lands. */
const homes: PixelSprite = {
  id: 'ge25-opener-homes',
  name: 'homes',
  tags: ['ge25', 'prop'],
  blurb: 'Two cream houses with red roofs.',
  palette: GE_PALETTE,
  rows: [
    '..r....r..',
    '.rrr..rrr.',
    'rrrrrrrrrr',
    'AkkAAAkkAS',
    'AAAAAAAAAS',
    'AAOAAAAOAS',
    'AAOAAAAOAS',
    'AAAAAAAAAS',
  ],
};

/** The central bank, 13x11: pediment, a gold coin in it, columns and steps. */
const bank: PixelSprite = {
  id: 'ge25-opener-bank',
  name: 'central bank',
  tags: ['ge25', 'prop'],
  blurb: 'A columned central bank with a gold coin in its pediment.',
  palette: GE_PALETTE,
  rows: [
    '......O......',
    '....OOxOO....',
    '..OOxxGxxOO..',
    'OOxxxGyGxxxOO',
    'OXXXXXXXXXXXO',
    'OOOOOOOOOOOOO',
    '.OzxOzxOzxOz.',
    '.OzxOzxOzxOz.',
    '.OzxOzxOzxOz.',
    'OOOOOOOOOOOOO',
    'OxxxxxxxxxxxO',
  ],
};

/** A magnifying glass, 5x5, held up: the economist looking closely. */
const magnifier: PixelSprite = {
  id: 'ge25-opener-magnifier',
  name: 'magnifying glass',
  tags: ['ge25'],
  blurb: 'A magnifying glass with a pale blue lens and a gold handle.',
  palette: GE_PALETTE,
  rows: [
    '.zzz.',
    'zBBBz',
    'zBzBz',
    '.zzzO',
    '....O',
  ],
};

/* ── the shock and its trace ────────────────────────────────────────────────────────────────── */

/** The loop: the shock bursts, then one frame for each hop of the line, then a beat with everything lit. */
const TRACE_FRAMES = 8;
const TRACE_MS = 600;

type Point = { readonly x: number; readonly y: number };

/** A layer that stays dark until frame `from`, then shows `lit` to the end of the loop. Its still is lit. */
function litFrom(id: string, blurb: string, from: number, lit: string[]): PixelSprite {
  const dark = lit.map((row) => '.'.repeat(row.length));
  const frames = Array.from({ length: TRACE_FRAMES }, (_, i) => (i >= from ? lit : dark));
  return { id, name: id, tags: ['ge25', 'animated'], blurb, palette: GE_PALETTE, rows: lit, frames, frameMs: TRACE_MS };
}

/** A place lit by the shock, one pixel bigger all round: an orange halo round its outline, its dark windows lit gold. */
function glow(art: readonly string[]): string[] {
  const h = art.length;
  const w = art[0].length;
  const solid = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && art[y][x] !== '.';
  return Array.from({ length: h + 2 }, (_, j) =>
    Array.from({ length: w + 2 }, (_, i) => {
      const x = i - 1;
      const y = j - 1;
      if (solid(x, y)) return art[y][x] === 'k' ? 'y' : '.';
      const edge = y < h && (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1));
      return edge ? '3' : '.';
    }).join(''),
  );
}

/** One hop of the line: gold dots every other pixel from `a` to `b`, bowed up over a long hop. Returns the dots' box. */
function hop(a: Point, b: Point): { x: number; y: number; rows: string[] } {
  const n = Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y));
  const bow = Math.abs(b.x - a.x) > 6 ? 2.5 : 0;
  const dots: Point[] = [];
  for (let i = 0; i <= n; i += 2) {
    const k = i / n;
    dots.push({ x: Math.round(a.x + (b.x - a.x) * k), y: Math.round(a.y + (b.y - a.y) * k - 4 * bow * k * (1 - k)) });
  }
  const x0 = Math.min(...dots.map((d) => d.x));
  const y0 = Math.min(...dots.map((d) => d.y));
  const w = Math.max(...dots.map((d) => d.x)) - x0 + 1;
  const h = Math.max(...dots.map((d) => d.y)) - y0 + 1;
  const rows = Array.from({ length: h }, (_, j) =>
    Array.from({ length: w }, (_, i) => (dots.some((d) => d.x === x0 + i && d.y === y0 + j) ? 'y' : '.')).join(''),
  );
  return { x: x0, y: y0, rows };
}

/** The shock's burst round the tanker's bridge, 9x9, in the first frame only. */
const burstRows = [
  '....R....',
  '.R.....R.',
  '....s....',
  '...sRs...',
  'R.sRzRs.R',
  '...sRs...',
  '....s....',
  '.R.....R.',
  '....R....',
];
const burst: PixelSprite = {
  id: 'ge25-opener-burst',
  name: 'shock burst',
  tags: ['ge25', 'animated'],
  blurb: 'A red burst flashing over the stalled tanker.',
  palette: GE_PALETTE,
  rows: burstRows,
  frames: Array.from({ length: TRACE_FRAMES }, (_, i) => (i === 0 ? burstRows : burstRows.map((row) => '.'.repeat(row.length)))),
  frameMs: TRACE_MS,
};

/* ── the opener ─────────────────────────────────────────────────────────────────────────────── */

const TANKER = { x: 4, y: 25 };
/** Each place's top-left on the far shore, in the order the shock reaches them. */
const PLACES = [
  { sprite: crane, x: 21, y: 13, top: { x: 27, y: 12 } },
  { sprite: power, x: 34, y: 16, top: { x: 38, y: 15 } },
  { sprite: factory, x: 46, y: 15, top: { x: 54, y: 14 } },
  { sprite: homes, x: 56, y: 19, top: { x: 58, y: 18 } },
  { sprite: bank, x: 66, y: 16, top: { x: 72, y: 15 } },
] as const;
/** Where the student stands on the promenade, below the bank. The magnifier is placed from it. */
const STUDENT = { x: 58, y: 34 };
const MAGNIFIER = { x: STUDENT.x + GE_STUDENT_HOLD.x, y: STUDENT.y + GE_STUDENT_HOLD.y };
/** The line's stops: the tanker's bridge, each place's top, then the magnifying glass. */
const STOPS: readonly Point[] = [{ x: TANKER.x + 11, y: TANKER.y - 1 }, ...PLACES.map((p) => p.top), { x: MAGNIFIER.x + 2, y: MAGNIFIER.y }];

const base = geCompose('ge25-opener-base', bayDawn, [
  { sprite: tanker, x: TANKER.x, y: TANKER.y },
  ...PLACES.map(({ sprite, x, y }) => ({ sprite, x, y })),
  { sprite: geStudent, x: STUDENT.x, y: STUDENT.y },
]);

const hops = STOPS.slice(1).map((stop, i) => {
  const { x, y, rows } = hop(STOPS[i], stop);
  return { sprite: litFrom(`ge25-opener-hop-${String(i)}`, 'A hop of a gold dotted line.', i + 1, rows), x, y };
});
const glows = PLACES.map(({ sprite, x, y }, i) => ({
  sprite: litFrom(`ge25-opener-glow-${String(i)}`, `The ${sprite.name} lit up with an orange halo.`, i + 1, glow(sprite.rows)),
  x: x - 1,
  y: y - 1,
}));
const gullLater = geLater(geGull, 'ge25-opener-gull-later', 1, 520);

export const ge25Opener: SceneArt = {
  id: 'ge25-opener',
  label: 'At dawn on a harbor promenade a student holds up a magnifying glass while, from a gas tanker stalled in the harbor mouth, a gold line hops along the far shore lighting up in turn the port crane, the power station, the factory, the homes and the central bank, and ends at the student.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: geShimmer, x: 3, y: 33 },
    { sprite: geSmoke, x: 36, y: 12, motion: { kind: 'rise', amp: 4, periodMs: 2600 } },
    ...glows,
    ...hops,
    { sprite: burst, x: TANKER.x + 7, y: TANKER.y - 5 },
    { sprite: geBeacon, x: TANKER.x + 10, y: TANKER.y - 1 },
    { sprite: magnifier, x: MAGNIFIER.x, y: MAGNIFIER.y, motion: { kind: 'twinkle', periodMs: 2400, min: 0.6 } },
    { sprite: geGull, x: 26, y: 5, motion: { kind: 'drift', amp: 3, periodMs: 7000 } },
    { sprite: gullLater, x: 50, y: 8, motion: { kind: 'drift', amp: 2, periodMs: 8200, phase: 0.4 } },
  ],
};

/* ── the keepsake ───────────────────────────────────────────────────────────────────────────── */

/** The world inside the loop the capstone draws: six coloured beads linked round it, a spark running from bead to bead. */
const BEADS = [
  { x: 7, y: 0, c: 'P' },
  { x: 13, y: 3, c: 'B' },
  { x: 13, y: 10, c: 'N' },
  { x: 7, y: 13, c: 'G' },
  { x: 1, y: 10, c: 'R' },
  { x: 1, y: 3, c: 'T' },
] as const;
const GLOBE = ['..bbbb..', '.bBmmBb.', 'bBmmBBNb', 'bBBmBNNb', 'bBBBBNnb', 'bmBBBBnb', '.bBNNbb.', '..bbbb..'];
function loopFrame(spark: number): string[] {
  const grid = Array.from({ length: 16 }, () => Array.from({ length: 16 }, () => '.'));
  const put = (x: number, y: number, ch: string) => { if (x >= 0 && y >= 0 && x < 16 && y < 16) grid[y][x] = ch; };
  GLOBE.forEach((row, j) => { [...row].forEach((ch, i) => { if (ch !== '.') put(4 + i, 4 + j, ch); }); });
  BEADS.forEach((a, i) => {
    const b = BEADS[(i + 1) % BEADS.length];
    const n = Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y));
    for (let s = 0; s <= n; s += 1) put(Math.round(a.x + 1 + ((b.x - a.x) * s) / n), Math.round(a.y + 1 + ((b.y - a.y) * s) / n), 'G');
  });
  BEADS.forEach(({ x, y, c }, i) => {
    for (let j = 0; j < 3; j += 1) for (let k = 0; k < 3; k += 1) put(x + k, y + j, i === spark && (j === 1 || k === 1) ? 'z' : c);
  });
  return grid.map((row) => row.join(''));
}
const emblemLoop: PixelSprite = {
  id: 'ge25-emblem-loop',
  name: 'emblem world in a loop',
  tags: ['ge', 'emblem', 'animated'],
  blurb: 'A blue and green globe inside a gold loop of six coloured beads, a white spark running from bead to bead.',
  palette: GE_PALETTE,
  rows: loopFrame(0),
  frames: BEADS.map((_, i) => loopFrame(i)),
  frameMs: 480,
};

export const ge25Finish: SceneArt = geKeepsake(
  'ge25-finish',
  'A postage stamp with perforated edges and an emerald frame, showing a blue and green globe inside a gold loop of six coloured beads with a white spark running round from bead to bead, with small sparkles around it.',
  emblemLoop,
);

export const art: LessonArtSet = { opener: ge25Opener, backdrop: geBackdrop, finish: ge25Finish };
