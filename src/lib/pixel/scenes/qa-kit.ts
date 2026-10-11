/**
 * qa-kit: the Quantitative Analysis art kit. The pathway's world is the quant's night shift: a dark
 * room lit by screens and a desk lamp, where the lesson's math is always drawn LITERALLY on a
 * monitor, a chalkboard or a whiteboard (a bell curve, a payoff, a fan of simulated paths). Lesson 1
 * drew the room; this kit cuts its pieces out pixel for pixel (the pilot files stay untouched) and
 * adds builders, so lessons 2 to 25 compose their art from one source.
 *
 * COMPOSED, NOT COPIED. An opener's base is qaCompose(...) over qaRoom and kit props instead of
 * eighty hand-copied rows: twenty-five openers that each carry their own copy of the desk drift
 * apart the first time one is touched up. A still prop is stamped into the base (it costs no
 * layer); only small things that move are layers.
 *
 * WHERE THE PILOT PUT THINGS. The kit's props keep the pilot's sizes, so the pilot's placements are
 * the reference: qaRoom's floor line is y=46, qaDesk's top goes at y=40, a qaMonitor's foot sits one
 * row above the desk top (y = deskY - 19), qaQuantSeated goes 21 rows above the desk top so the
 * chair lands on the floor, a qaRack stands with its top at y=22. Each prop's blurb says the same.
 *
 * LIGHT COMES FROM THE LEFT, as on every figure in the app: highlights on upper-left edges, shadow
 * on the lower right. The quant is always seen from behind, looking at the math with the viewer.
 *
 * ONE PALETTE FOR THE KIT. QA_PALETTE adds only the pilot's cast-shadow tone; everything else is the
 * shared palette. qaCompose merges stamp palettes and throws if two stamps paint one key two ways.
 *
 * NATIVE-OWNED (CONSTITUTION 5.5): nothing here is synced from the web repo.
 */
import type { PixelSprite } from '../types';
import type { SceneArt, SceneLayer, SceneMotion } from './types';

export const QA_PALETTE: Record<string, string> = {
  // Z is the cast-shadow tone: a drawn step between the floor ink and the page, so shadows stay
  // shadows on the light canvas instead of becoming holes.
  Z: '#110E17',
};

/* ── composing ─────────────────────────────────────────────────────────────────────────────────── */

/** One placement for qaCompose: a sprite with its top-left corner at (x, y), in scene pixels. */
export interface QaStamp {
  sprite: PixelSprite;
  x: number;
  y: number;
}

/**
 * Lays sprites onto one still base, in order, later over earlier. Transparent pixels let what is
 * under them show, and anything past the edge is clipped, so a rack may stand half out of frame. A
 * stamp is its still `rows`: frames are ignored, because anything that moves belongs in a layer.
 */
export function qaCompose(id: string, width: number, height: number, stamps: readonly QaStamp[]): PixelSprite {
  const cells = Array.from({ length: height }, () => new Array<string>(width).fill('.'));
  const palette: Record<string, string> = {};
  for (const { sprite, x, y } of stamps) {
    for (const [key, hex] of Object.entries(sprite.palette ?? {})) {
      // Two stamps giving one key two colours would silently repaint whichever came first.
      const had = palette[key];
      if (had !== undefined && had !== hex) {
        throw new Error(`${id}: ${sprite.id} paints '${key}' as ${hex}, an earlier stamp as ${had}`);
      }
      palette[key] = hex;
    }
    sprite.rows.forEach((row, j) => {
      const line = cells[y + j];
      if (!line) return;
      [...row].forEach((ch, i) => {
        if (ch !== '.' && x + i >= 0 && x + i < width) line[x + i] = ch;
      });
    });
  }
  return { id, name: id, tags: ['scene', 'qa'], palette, rows: cells.map((line) => line.join('')) };
}

/**
 * The same framed sprite starting elsewhere in its cycle and at its own pace. Frames tick from mount
 * with no offset (PixelSpriteView), so two layers sharing one sprite would flash in step; a twinkle
 * `phase` only offsets opacity, never the shape.
 */
export function qaLater(sprite: PixelSprite, id: string, by: number, frameMs: number): PixelSprite {
  const frames = sprite.frames ?? [sprite.rows];
  return { ...sprite, id, name: id, frames: [...frames.slice(by), ...frames.slice(0, by)], frameMs };
}

/** A sprite mirrored left to right, frames too. Its light then comes from the right, so keep it for props. */
export function qaFlip(sprite: PixelSprite, id: string): PixelSprite {
  const flip = (rows: string[]) => rows.map((row) => [...row].reverse().join(''));
  return { ...sprite, id, name: id, rows: flip(sprite.rows), ...(sprite.frames ? { frames: sprite.frames.map(flip) } : {}) };
}

/** A solid block of one colour: a wall, a floor band, a screen's fill, a bar of a chart. */
export function qaRect(id: string, width: number, height: number, ch: string): PixelSprite {
  return { id, name: id, tags: ['scene', 'qa'], rows: Array.from({ length: height }, () => ch.repeat(width)) };
}

/**
 * A polyline through `points` (scene-free: the sprite's own pixels), one pixel thick, for chart
 * data: a price path, a payoff, a frontier. Consecutive points are joined with Bresenham steps, so
 * a line reads as data, not as a hand-wobbled stroke. `dash` [on, off] counts drawn pixels along
 * the whole path, so a dashed band keeps its rhythm round the corners.
 */
export function qaPath(
  id: string,
  width: number,
  height: number,
  points: readonly (readonly [number, number])[],
  ch: string,
  dash?: readonly [number, number],
): PixelSprite {
  const cells = Array.from({ length: height }, () => new Array<string>(width).fill('.'));
  let step = 0;
  const plot = (x: number, y: number) => {
    const on = !dash || step % (dash[0] + dash[1]) < dash[0];
    step += 1;
    const line = cells[y];
    if (on && line && x >= 0 && x < width) line[x] = ch;
  };
  points.forEach(([x1, y1], i) => {
    if (i === 0) {
      plot(x1, y1);
      return;
    }
    const [x0, y0] = points[i - 1];
    const dx = Math.abs(x1 - x0);
    const dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    let x = x0;
    let y = y0;
    while (x !== x1 || y !== y1) {
      const e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        x += sx;
      }
      if (e2 <= dx) {
        err += dx;
        y += sy;
      }
      plot(x, y);
    }
  });
  return { id, name: id, tags: ['scene', 'qa'], rows: cells.map((line) => line.join('')) };
}

/* ── pixel lettering, for boards and screens ───────────────────────────────────────────────────── */

/** A 5-row font. '#' is ink. Glyphs are 2 to 5 wide; qaText sets them one pixel apart. */
const GLYPHS: Readonly<Record<string, readonly string[]>> = {
  '0': ['###', '#.#', '#.#', '#.#', '###'],
  '1': ['.#.', '##.', '.#.', '.#.', '###'],
  '2': ['###', '..#', '###', '#..', '###'],
  '3': ['###', '..#', '.##', '..#', '###'],
  '4': ['#.#', '#.#', '###', '..#', '..#'],
  '5': ['###', '#..', '###', '..#', '###'],
  '6': ['###', '#..', '###', '#.#', '###'],
  '7': ['###', '..#', '..#', '.#.', '.#.'],
  '8': ['###', '#.#', '###', '#.#', '###'],
  '9': ['###', '#.#', '###', '..#', '###'],
  A: ['.#.', '#.#', '###', '#.#', '#.#'],
  B: ['##.', '#.#', '##.', '#.#', '##.'],
  C: ['.##', '#..', '#..', '#..', '.##'],
  D: ['##.', '#.#', '#.#', '#.#', '##.'],
  E: ['###', '#..', '##.', '#..', '###'],
  F: ['###', '#..', '##.', '#..', '#..'],
  G: ['.##', '#..', '#.#', '#.#', '.##'],
  H: ['#.#', '#.#', '###', '#.#', '#.#'],
  I: ['###', '.#.', '.#.', '.#.', '###'],
  K: ['#.#', '##.', '#..', '##.', '#.#'],
  L: ['#..', '#..', '#..', '#..', '###'],
  M: ['#...#', '##.##', '#.#.#', '#...#', '#...#'],
  N: ['#..#', '##.#', '#.##', '#..#', '#..#'],
  O: ['.#.', '#.#', '#.#', '#.#', '.#.'],
  P: ['###', '#.#', '###', '#..', '#..'],
  Q: ['.#.', '#.#', '#.#', '##.', '.##'],
  R: ['##.', '#.#', '##.', '#.#', '#.#'],
  S: ['.##', '#..', '.#.', '..#', '##.'],
  T: ['###', '.#.', '.#.', '.#.', '.#.'],
  U: ['#.#', '#.#', '#.#', '#.#', '###'],
  V: ['#.#', '#.#', '#.#', '#.#', '.#.'],
  W: ['#...#', '#...#', '#.#.#', '##.##', '#...#'],
  X: ['#.#', '#.#', '.#.', '#.#', '#.#'],
  Y: ['#.#', '#.#', '.#.', '.#.', '.#.'],
  a: ['...', '.##', '#.#', '#.#', '.##'],
  d: ['..#', '.##', '#.#', '#.#', '.##'],
  p: ['...', '##.', '#.#', '##.', '#..'],
  r: ['...', '#.#', '##.', '#..', '#..'],
  t: ['.#.', '###', '.#.', '.#.', '..#'],
  x: ['...', '...', '#.#', '.#.', '#.#'],
  // Greek: what quant boards are written in.
  'α': ['....', '.#.#', '#.#.', '#.#.', '.#.#'],
  'β': ['##.', '#.#', '##.', '#.#', '##.'],
  'Δ': ['.#.', '.#.', '#.#', '#.#', '###'],
  'θ': ['.#.', '#.#', '###', '#.#', '.#.'],
  'μ': ['...', '#.#', '#.#', '###', '#..'],
  'Σ': ['####', '.#..', '..#.', '.#..', '####'],
  'σ': ['....', '.###', '#.#.', '#.#.', '.#..'],
  '=': ['...', '###', '...', '###', '...'],
  '+': ['...', '.#.', '###', '.#.', '...'],
  '-': ['...', '...', '###', '...', '...'],
  '%': ['#..', '..#', '.#.', '#..', '..#'],
  '.': ['.', '.', '.', '.', '#'],
  '·': ['.', '.', '#', '.', '.'],
  '(': ['.#', '#.', '#.', '#.', '.#'],
  ')': ['#.', '.#', '.#', '.#', '#.'],
  '[': ['##', '#.', '#.', '#.', '##'],
  ']': ['##', '.#', '.#', '.#', '##'],
  '/': ['..#', '..#', '.#.', '#..', '#..'],
  ' ': ['..', '..', '..', '..', '..'],
};

/**
 * `text` set in the kit's 5-row font, inked in `ch`: chalk on a board ('w' or 'x'), a label on a
 * screen. Throws on a glyph the font lacks rather than drawing a gap where a symbol should be.
 */
export function qaText(id: string, text: string, ch: string): PixelSprite {
  const glyphs = [...text].map((c) => {
    const glyph = GLYPHS[c];
    if (!glyph) throw new Error(`${id}: qaText has no glyph for '${c}'`);
    return glyph;
  });
  const rows = [0, 1, 2, 3, 4].map((r) => glyphs.map((g) => g[r].replace(/#/g, ch)).join('.'));
  return { id, name: id, tags: ['scene', 'qa'], rows };
}

/* ── the room ──────────────────────────────────────────────────────────────────────────────────── */

/** Every opener's ground, 80x60, as the pilot: the k wall, a D baseboard at y=46, the K floor below. */
export const qaRoom: PixelSprite = {
  id: 'qa-room',
  name: 'qa-room',
  tags: ['scene', 'qa'],
  blurb: "The pilot's room, 80x60: wall to y=45, baseboard at y=46, floor from y=47.",
  rows: Array.from({ length: 60 }, (_, y) => (y < 46 ? 'k' : y === 46 ? 'D' : 'K').repeat(80)),
};

export const qaWindow: PixelSprite = {
  id: 'qa-window',
  name: 'qa-window',
  tags: ['scene', 'qa'],
  blurb: "The pilot's night window with the crescent moon and its sill, 20x22 (the pilot puts it at 1, 3).",
  rows: [
    '.DDDDDDDDDDDDDDDDDD.',
    '.DKKKKKKKKDKKKKyyyD.',
    '.DKKKKKKKKDKKKyyKKD.',
    '.DKKxKKKKKDKKyyKKKD.',
    '.DKKKKKKKKDKKyGKKKD.',
    '.DKKKKKKKKDKKyGKKKD.',
    '.DKKKKKKKKDKKKyGKKD.',
    '.DKKKKKxKKDKKKKyyyD.',
    '.DKKKKKKKKDKKKKKKKD.',
    '.DKKKKKKKKDKKKKKKKD.',
    '.DDDDDDDDDDDDDDDDDD.',
    '.DKKKKKKKKDxKKKKKKD.',
    '.DKKKKKKKKDKKKKKKKD.',
    '.DKKKKKKKKDKKKxKKKD.',
    '.DKKKKKKKKDKKKKKKKD.',
    '.DKKKKKKKKDKKKKKKKD.',
    '.DKKKKxKKKDKKKKKKKD.',
    '.DKKKKKKKKDKKKKKKKD.',
    '.DKKKKKKKKDKKKKKKKD.',
    '.DDDDDDDDDDDDDDDDDD.',
    'xxxxxxxxxxxxxxxxxxxx',
    'DDDDDDDDDDDDDDDDDDDD',
  ],
};

export const qaClock: PixelSprite = {
  id: 'qa-clock',
  name: 'qa-clock',
  tags: ['scene', 'qa'],
  blurb: "The pilot's wall clock, 8x8, hands at three o'clock.",
  rows: [
    '..DDDD..',
    '.DwwwwD.',
    'DwwwKwwD',
    'DwwwKwwD',
    'DwwwKKwD',
    'DwwwwwwD',
    '.DwwwwD.',
    '..DDDD..',
  ],
};

/** The clock with no hands, for qaClockTick to turn on. */
export const qaClockFace: PixelSprite = {
  ...qaClock,
  id: 'qa-clock-face',
  name: 'qa-clock-face',
  blurb: 'The wall clock without its hands. Lay qaClockTick at its (1, 1).',
  rows: qaClock.rows.map((row) => row.replace(/K/g, 'w')),
};

export const qaClockTick: PixelSprite = {
  id: 'qa-clock-tick',
  name: 'qa-clock-tick',
  tags: ['scene', 'qa'],
  blurb: "The clock's hands, 6x6: the hour hand stays at three, the minute hand goes round.",
  rows: ['...K..', '...K..', '...K..', '...KK.', '......', '......'],
  frames: [
    ['......', '...K..', '...K..', '...KK.', '......', '......'],
    ['......', '......', '......', '...KKK', '......', '......'],
    ['......', '......', '......', '...KK.', '...K..', '...K..'],
    ['......', '......', '......', '.KKKK.', '......', '......'],
  ],
  frameMs: 700,
};

/* ── the desk and what stands on it ────────────────────────────────────────────────────────────── */

export const qaDesk: PixelSprite = {
  id: 'qa-desk',
  name: 'qa-desk',
  tags: ['scene', 'qa'],
  blurb: "The pilot's desk, 57x15, cleared. Top at y=40 on qaRoom (the pilot's x=11): the legs then stand on the floor and the shadow under it lands there.",
  palette: QA_PALETTE,
  rows: [
    'O' + 'g'.repeat(54) + 'O.',
    'O' + 'G'.repeat(33) + 'g'.repeat(21) + 'O.',
    'O' + 'G'.repeat(33) + 'g'.repeat(21) + 'O.',
    'Og' + 'G'.repeat(32) + 'g'.repeat(21) + 'O.',
    'O'.repeat(56) + '.',
    '.Og' + '.'.repeat(51) + 'Og.',
    '.Og' + '.'.repeat(51) + 'Og.',
    '.Og' + 'Z'.repeat(51) + 'Og.',
    '.Og' + 'Z'.repeat(51) + 'Og.',
    '.OO' + '.'.repeat(51) + 'OO.',
    '.OO' + '.'.repeat(51) + 'OO.',
    '.OO' + '.'.repeat(51) + 'OO.',
    '.OO' + '.'.repeat(51) + 'OO.',
    '.OO' + '.'.repeat(51) + 'OO.',
    '.ZZZ' + '.'.repeat(50) + 'ZZZ',
  ],
};

/**
 * A screen of any size: the pilot monitor's bezel (lit X top and left, D chin and right side) round
 * a `surface` fill. With `axes`, the left column and bottom row of the surface become a chart's
 * axes with a tick every 4 pixels, as on the pilot; qaPlotArea says where the chart then goes.
 */
export function qaScreen(
  id: string,
  width: number,
  height: number,
  options: { axes?: boolean; surface?: string; axis?: string; tick?: string } = {},
): PixelSprite {
  const { axes = false, surface = 'b', axis = 'B', tick = 'w' } = options;
  const inner = width - 4;
  const rows: string[] = ['D'.repeat(width), 'D' + 'X'.repeat(width - 2) + 'D'];
  const last = height - 3;
  for (let r = 2; r <= last; r += 1) {
    let line: string;
    if (axes && r === last) {
      line = [...Array(inner)].map((_, i) => (i > 0 && i % 4 === 0 ? tick : axis)).join('');
    } else if (axes) {
      line = ((last - r) % 4 === 0 ? tick : axis) + surface.repeat(inner - 1);
    } else {
      line = surface.repeat(inner);
    }
    rows.push('DX' + line + 'DD');
  }
  rows.push('DX' + 'D'.repeat(width - 2), 'D'.repeat(width));
  return { id, name: id, tags: ['scene', 'qa'], rows };
}

/** Where a chart goes inside qaScreen(..., { axes: true }) of this size, in the screen's pixels. */
export function qaPlotArea(width: number, height: number) {
  return { x: 3, y: 2, width: width - 5, height: height - 5 } as const;
}

const MONITOR_SCREEN = qaScreen('qa-monitor-screen', 23, 16, { axes: true });

export const qaMonitor: PixelSprite = {
  id: 'qa-monitor',
  name: 'qa-monitor',
  tags: ['scene', 'qa'],
  blurb: "The pilot's monitor on its stand, 23x19, with chart axes. Its foot sits one row above the desk top (y = deskY - 19).",
  rows: [
    ...MONITOR_SCREEN.rows,
    '..........DXD..........',
    '..........DXD..........',
    '......DXXXXXXXXXD......',
  ],
};

/** The chart area inside qaMonitor: 18x11 at (3, 2). */
export const QA_MONITOR_PLOT = qaPlotArea(23, 16);

export const qaKeyboard: PixelSprite = {
  id: 'qa-keyboard',
  name: 'qa-keyboard',
  tags: ['scene', 'qa'],
  blurb: "The pilot's keyboard, 15x4, lying on the desk top (its rows are the desk's top rows).",
  rows: ['DDDDDDDDDDDDDDD', 'DxXxXxXxXxXxXxD', 'DXxxxxxxxxxxxXD', 'DDDDDDDDDDDDDDD'],
};

export const qaMouse: PixelSprite = {
  id: 'qa-mouse',
  name: 'qa-mouse',
  tags: ['scene', 'qa'],
  rows: ['DDD', 'DxD', 'DXD', 'DDD'],
};

export const qaLamp: PixelSprite = {
  id: 'qa-lamp',
  name: 'qa-lamp',
  tags: ['scene', 'qa'],
  blurb: "The pilot's desk lamp, 17x18. Its row 15 is the desk's back edge: rows 15 to 17 are the pool of light it throws on the desk top.",
  rows: [
    '.....OGGGGO......',
    '....OGyGGGGO.....',
    '...OGyGGGGGGO....',
    '..OyyyyyyyyyyO...',
    '....XD...........',
    '...XD............',
    '..XD.............',
    '..XD.............',
    '..XD.............',
    '..XD.............',
    '..XD.............',
    '..XD.............',
    '..XD.............',
    '.DDDDD...........',
    'DxXXXXD..........',
    'DDDDDDDyyyyyyyyyy',
    '..yyyyyyyyyyyyyyy',
    '..yyyyyyyyyyyyyy.',
  ],
};

export const qaMug: PixelSprite = {
  id: 'qa-mug',
  name: 'qa-mug',
  tags: ['scene', 'qa'],
  blurb: "The pilot's coffee mug, 7x6. Its last row sits on the desk's back edge row; qaSteam goes at its (1, -4).",
  rows: ['DDDDD..', 'DOOOD..', 'DQqPDD.', 'DQqPD.D', 'DQqPDDD', '.DDD...'],
};

export const qaSteam: PixelSprite = {
  id: 'qa-steam',
  name: 'qa-steam',
  tags: ['scene', 'qa'],
  blurb: 'Steam, bright at the rim and fading as it rises. Give it rise, amp 3.',
  rows: ['..xx.', '.xx..', '..xx.', '...ww', '..ww.'],
};

export const qaPapers: PixelSprite = {
  id: 'qa-papers',
  name: 'qa-papers',
  tags: ['scene', 'qa'],
  blurb: 'A stack of printouts with a pencil on top, 7x6, standing on the desk.',
  rows: ['...OGGy', '..DDDDD', '..DwwwD', '.DxxxxD', 'DwwwwwD', 'DDDDDDD'],
};

export const qaBin: PixelSprite = {
  id: 'qa-bin',
  name: 'qa-bin',
  tags: ['scene', 'qa'],
  blurb: "The pilot's waste bin with a screwed-up page beside it, 10x7, standing on the floor (the pilot's 2, 47).",
  rows: ['DxxxxxD...', 'DxXXXXD...', 'DxXXXXD...', '.DxXXD....', '.DxXXD.ww.', '.DxXXDwwxw', '.DDDDD.ww.'],
};

/* ── boards ────────────────────────────────────────────────────────────────────────────────────── */

/**
 * A chalkboard of any size in the pilot's dress: a deep-gold frame with a gold bevel, the teal
 * slate, and a chalk tray under it (the last two rows, 2 pixels in from each side). The slate is
 * qaBoardSlate(width, height); write on it with qaText and qaPath in 'w' and 'x'.
 */
export function qaChalkboard(id: string, width: number, height: number): PixelSprite {
  const rows = ['O'.repeat(width), 'O' + 'g'.repeat(width - 3) + 'OO'];
  for (let r = 2; r < height - 4; r += 1) rows.push('Og' + 't'.repeat(width - 4) + 'OO');
  rows.push('O'.repeat(width), 'O'.repeat(width));
  rows.push('..' + 'g'.repeat(width - 4) + '..', '..' + 'O'.repeat(width - 4) + '..');
  return { id, name: id, tags: ['scene', 'qa'], rows };
}

/**
 * A whiteboard of any size: an aluminium frame (X lit top and left, D shadow), a pale x surface (a
 * white board would out-shine every screen in the room) and a marker tray. Draw on it in strong
 * marker tones: K, p, E, n, b, r, O. The surface is plain on purpose: a sheen stripe reads as a
 * white bar at this size, so a lesson adds a glint where its chart leaves room.
 */
export function qaWhiteboard(id: string, width: number, height: number): PixelSprite {
  const rows = ['D'.repeat(width), 'D' + 'X'.repeat(width - 2) + 'D'];
  for (let r = 2; r < height - 4; r += 1) rows.push('DX' + 'x'.repeat(width - 4) + 'DD');
  rows.push('DX' + 'D'.repeat(width - 2), 'D'.repeat(width));
  rows.push('..' + 'X'.repeat(width - 4) + '..', '..' + 'D'.repeat(width - 4) + '..');
  return { id, name: id, tags: ['scene', 'qa'], rows };
}

/** The writable inside of qaChalkboard or qaWhiteboard of this size, in the board's pixels. */
export function qaBoardSlate(width: number, height: number) {
  return { x: 2, y: 2, width: width - 4, height: height - 6 } as const;
}

/* ── the server rack ───────────────────────────────────────────────────────────────────────────── */

const RACK_UNIT = ['DxXXXXXXXD', 'DXkkkkXXXD', 'DXkkkkXXXD', 'DXXXXXXXXD', 'DDDDDDDDDD'];

export const qaRack: PixelSprite = {
  id: 'qa-rack',
  name: 'qa-rack',
  tags: ['scene', 'qa'],
  blurb: "The pilot's server rack, 11x33 with its floor shadow: six units. Top at y=22 on qaRoom; qaRackLights goes at its (7, 2).",
  palette: QA_PALETTE,
  rows: [
    'DDDDDDDDDD.',
    'DxxxxxxxxD.',
    ...[0, 1, 2, 3, 4, 5].flatMap(() => RACK_UNIT.map((row) => row + '.')),
    '.ZZZZZZZZZZ',
  ],
};

export const qaRackLights: PixelSprite = {
  id: 'qa-rack-lights',
  name: 'qa-rack-lights',
  tags: ['scene', 'qa'],
  blurb: "The rack's status lights, 2x29, blinking. Use qaLater for a second rack so they do not blink in step.",
  rows: [
    '..', 'Nn', 'nN', '..', '..', '..', 'nN', 'Nn', '..', '..', '..', 'NG', 'nn', '..', '..',
    '..', 'nn', 'Nn', '..', '..', '..', 'Nn', 'nN', '..', '..', '..', 'RN', 'nn', '..',
  ],
  frames: [
    ['..', 'Nn', 'nN', '..', '..', '..', 'nN', 'Nn', '..', '..', '..', 'NG', 'nn', '..', '..',
      '..', 'nn', 'Nn', '..', '..', '..', 'Nn', 'nN', '..', '..', '..', 'RN', 'nn', '..'],
    ['..', 'nN', 'Nn', '..', '..', '..', 'Nn', 'nN', '..', '..', '..', 'Nn', 'Nn', '..', '..',
      '..', 'Nn', 'nN', '..', '..', '..', 'nN', 'Nn', '..', '..', '..', 'nN', 'nN', '..'],
    ['..', 'NN', 'nn', '..', '..', '..', 'nn', 'NN', '..', '..', '..', 'nG', 'Nn', '..', '..',
      '..', 'Nn', 'nn', '..', '..', '..', 'NN', 'nN', '..', '..', '..', 'Rn', 'Nn', '..'],
    ['..', 'nN', 'NN', '..', '..', '..', 'NN', 'nn', '..', '..', '..', 'Nn', 'nN', '..', '..',
      '..', 'nN', 'Nn', '..', '..', '..', 'nn', 'NN', '..', '..', '..', 'nN', 'nn', '..'],
  ],
  frameMs: 520,
};

/* ── the quant ─────────────────────────────────────────────────────────────────────────────────── */

export const qaQuantSeated: PixelSprite = {
  id: 'qa-quant-seated',
  name: 'qa-quant-seated',
  tags: ['scene', 'qa'],
  blurb: "The pilot's quant from behind on the office chair, 14x32. Place it 21 rows above the desk top (the pilot's 48, 19) and stamp it after the desk: the chair stem runs down in front of it to the floor.",
  palette: QA_PALETTE,
  rows: [
    '.....DDDD.....',
    '....DppEED....',
    '...DEpEEEED...',
    '...DEEEEEED...',
    '...DEEEEEED...',
    '....DEEEED....',
    '.....DssD.....',
    '...EEDssDEE...',
    '.EEPPPPPPPPEE.',
    'EPqqPPPPPPPPpE',
    'EPqPPPPPPPPPpE',
    'DDDDDDDDDDDDD.',
    'DxXXXXXXXXXXDD',
    'DxXXXXXXXXXXDD',
    'DxXXXXXXXXXXDD',
    'DxXXXXXXXXXXDD',
    'DxXXXXXXXXXXDD',
    'DxXXXXXXXXXXDD',
    '.DDDDDDDDDDDD.',
    '.....DXD......',
    '.....DXD......',
    '.....DXD......',
    '.....DXD......',
    '.....DXD......',
    '.....DXD......',
    '.....DXD......',
    '.....DXD......',
    '.....DXD......',
    '.....DXD......',
    '..DDDDXDDDDD..',
    '.DD...D...DD..',
    '..ZZZZZZZZZZZ.',
  ],
};

/** The quant standing, from behind: the same head and shoulders as the pilot, 14x30 with the cast shadow. */
export const qaQuantStanding: PixelSprite = {
  id: 'qa-quant-standing',
  name: 'qa-quant-standing',
  tags: ['scene', 'qa'],
  blurb: 'The quant standing from behind, arms down, 14x30. Its last row is the floor shadow: stand it on the floor (feet at y=48 or lower).',
  palette: QA_PALETTE,
  rows: [
    '.....DDDD.....',
    '....DppEED....',
    '...DEpEEEED...',
    '...DEEEEEED...',
    '...DEEEEEED...',
    '....DEEEED....',
    '.....DssD.....',
    '...EEDssDEE...',
    '.EEPPPPPPPPEE.',
    'EPqqPPPPPPPPpE',
    'EqPpPPPPPPpPpE',
    'EqPpPPPPPPpPpE',
    'EqPpPPPPPPpPpE',
    'EqPpPPPPPPpPpE',
    'EqPEPPPPPPEPpE',
    'EEEEppppppEEEE',
    'EssEDXDDDDEssE',
    '.ssDXDDDDDDss.',
    '...DXDDKDDD...',
    '...DXDDKDDD...',
    '...DXDDKXDD...',
    '...DXDDKXDD...',
    '...DXDDKXDD...',
    '...DXDDKXDD...',
    '...DXDDKXDD...',
    '...DXDDKXDD...',
    '...DXDDKXDD...',
    '..DxxDDKxxDD..',
    '..DDDDDDDDDD..',
    '..ZZZZZZZZZZZ.',
  ],
};

/**
 * The quant standing from behind with the right arm raised to write or point, 18x30 (the body as
 * qaQuantStanding, two columns wider on the right for the arm). The hand is at QA_REACH_HAND: chalk,
 * a marker or a pointer's grip goes there.
 */
export const qaQuantReaching: PixelSprite = {
  id: 'qa-quant-reaching',
  name: 'qa-quant-reaching',
  tags: ['scene', 'qa'],
  blurb: 'The quant from behind, right arm raised, 18x30. Stand it on the floor like qaQuantStanding.',
  palette: QA_PALETTE,
  rows: [
    '...............ss.',
    '.....DDDD.....EssE',
    '....DppEED....EPPE',
    '...DEpEEEED..EPPpE',
    '...DEEEEEED..EPPE.',
    '...DEEEEEED.EPPpE.',
    '....DEEEED..EPPE..',
    '.....DssD..EPPpE..',
    '...EEDssDEEPPPE...',
    '.EEPPPPPPPPPPpE...',
    'EPqqPPPPPPPPPE....',
    'EqPpPPPPPPPpE.....',
    'EqPpPPPPPPPpE.....',
    'EqPpPPPPPPpPE.....',
    'EqPpPPPPPPpPE.....',
    'EqPEPPPPPPEPE.....',
    'EEEEppppppEEE.....',
    'EssEDXDDDDDD......',
    '.ssDXDDDDDDD......',
    '...DXDDKDDD.......',
    '...DXDDKXDD.......',
    '...DXDDKXDD.......',
    '...DXDDKXDD.......',
    '...DXDDKXDD.......',
    '...DXDDKXDD.......',
    '...DXDDKXDD.......',
    '...DXDDKXDD.......',
    '..DxxDDKxxDD......',
    '..DDDDDDDDDD......',
    '..ZZZZZZZZZZZ.....',
  ],
};

/** The top-left of qaQuantReaching's raised hand (2x2), in its own pixels: a held prop's grip goes here. */
export const QA_REACH_HAND = { x: 15, y: 0 } as const;

/* ── small moving bits ─────────────────────────────────────────────────────────────────────────── */

export const qaStar: PixelSprite = {
  id: 'qa-star',
  name: 'qa-star',
  tags: ['scene', 'qa'],
  rows: ['w'],
};

export const qaStarBig: PixelSprite = {
  id: 'qa-star-big',
  name: 'qa-star-big',
  tags: ['scene', 'qa'],
  rows: ['.w.', 'www', '.w.'],
};

/** The pilot's four twinkling stars for a qaWindow whose top-left is at (x, y). */
export function qaWindowStars(x: number, y: number): SceneLayer[] {
  return [
    { sprite: qaStarBig, x: x + 3, y: y + 4, motion: { kind: 'twinkle', periodMs: 2200, min: 0.3 } },
    { sprite: qaStar, x: x + 12, y: y + 12, motion: { kind: 'twinkle', periodMs: 1700, phase: 0.4, min: 0.2 } },
    { sprite: qaStar, x: x + 6, y: y + 14, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.7, min: 0.2 } },
    { sprite: qaStar, x: x + 15, y: y + 2, motion: { kind: 'twinkle', periodMs: 1900, phase: 0.2, min: 0.25 } },
  ];
}

/** A blinking text cursor or a data point's live tip, 1x2. */
export const qaBlip: PixelSprite = {
  id: 'qa-blip',
  name: 'qa-blip',
  tags: ['scene', 'qa'],
  rows: ['w', 'w'],
};

/* ── the keepsake: the pilot's gold medallion on its orchid ribbon, with a swappable emblem ────── */

export const qaRibbon: PixelSprite = {
  id: 'qa-ribbon',
  name: 'qa-ribbon',
  tags: ['scene', 'qa'],
  blurb: "The keepsake's still base, 48x40: the pilot's orchid V ribbon, gathered into the neck the medal's ring threads.",
  rows: [
    '..........EqPPPPpE............EqPPPPpE..........',
    '...........EqPPPPpE..........EqPPPPpE...........',
    '............EqPPPPpE........EqPPPPpE............',
    '.............EqPPPPpE......EqPPPPpE.............',
    '..............EqPPPPpE....EqPPPPpE..............',
    '...............EqPPPPpE..EqPPPPpE...............',
    '................EqPPPPpEEqPPPPpE................',
    '.................EqPPPPEqPPPPpE.................',
    '...................EqPEppPPpE...................',
    '.....................EppppE.....................',
    '.....................EEppEE.....................',
    '.......................pp.......................',
    ...Array.from({ length: 28 }, () => '.'.repeat(48)),
  ],
};

/** The pilot's medal with the sigma polished off: bail ring and disc, 22x26, emblem field blank. */
const MEDAL_BLANK: PixelSprite = {
  id: 'qa-medal-blank',
  name: 'qa-medal-blank',
  tags: ['scene', 'qa'],
  rows: [
    '.........OOOO.........',
    '........Oy..gO........',
    '........OG..gO........',
    '.........OOOO.........',
    '........OOOOOO........',
    '......OOyyyyyyOO......',
    '....OOyyyyyyyyGGOO....',
    '...OywwyOOOOOOGGGGO...',
    '..OwwyOOyyyyGGOOGGGO..',
    '.OyyyOyyyyyGGGGGOGGGO.',
    '.OyyOyyyyGGGGGGGGOGGO.',
    'OyyyOyyyGGGGGGGGGOGGgO',
    'OyyOyyGGGGGGGGGGGGOGgO',
    'OyGOyGGGGGGGGGGGGgOggO',
    'OyGOGGGGGGGGGGGGGgOggO',
    'OGGOGGGGGGGGGGGGGgOggO',
    'OGGOGGGGGGGGGGGGggOggO',
    'OGGOGGGGGGGGGGGGggOgOO',
    'OGGGOGGGGGGGGGgggOggOO',
    '.OGGOGGGGGGGgggggOyOO.',
    '.OGGGOGGGGGgggggOygOO.',
    '..OGGGOOGgggggOOygOO..',
    '...OGGggOOOOOOyggOO...',
    '....OOGGgyyyyyggOO....',
    '......OOgggOOOOO......',
    '........OOOOOO........',
  ],
};

/**
 * The emblem field, in medal pixels: every emblem is exactly 12x12 and is laid at (5, 9), inside the
 * disc's inner ring. Its four corner pixels fall on the ring, so they must stay transparent. Engrave
 * in the pilot sigma's manner: an O stroke with a y lip on its lower-right side (light from the
 * upper left), gold tones only, a pixel clear of the ring where you can.
 */
export const QA_EMBLEM = { x: 5, y: 9, width: 12, height: 12 } as const;
const EMBLEM_CORNERS = [[0, 0], [11, 0], [0, 11], [11, 11]] as const;

/**
 * The medal with one lesson's emblem engraved in its field, as ONE sprite: stamping the emblem in
 * (instead of laying it as its own layer) keeps it seated in the field however the medal moves.
 * Throws on a wrong-sized emblem or one that paints over the inner ring.
 */
export function qaMedal(id: string, emblem: PixelSprite): PixelSprite {
  if (emblem.rows.length !== QA_EMBLEM.height || emblem.rows.some((row) => row.length !== QA_EMBLEM.width)) {
    throw new Error(`${id}: emblem ${emblem.id} must be ${String(QA_EMBLEM.width)}x${String(QA_EMBLEM.height)}`);
  }
  for (const [cx, cy] of EMBLEM_CORNERS) {
    if (emblem.rows[cy][cx] !== '.') throw new Error(`${id}: emblem ${emblem.id} paints its corner (${String(cx)}, ${String(cy)}), which is the medal's ring`);
  }
  const medal = qaCompose(id, 22, 26, [
    { sprite: MEDAL_BLANK, x: 0, y: 0 },
    { sprite: emblem, x: QA_EMBLEM.x, y: QA_EMBLEM.y },
  ]);
  return { ...medal, tags: ['scene', 'qa', 'keepsake'] };
}

export const qaSparkleBig: PixelSprite = {
  id: 'qa-sparkle-big',
  name: 'qa-sparkle-big',
  tags: ['scene', 'qa'],
  rows: ['..y..', '..w..', 'ywWwy', '..w..', '..y..'],
  frames: [
    ['..y..', '..w..', 'ywWwy', '..w..', '..y..'],
    ['.....', '..y..', '.yWy.', '..y..', '.....'],
    ['.....', '.....', '..w..', '.....', '.....'],
    ['.....', '..y..', '.yWy.', '..y..', '.....'],
  ],
  frameMs: 340,
};

export const qaSparkleSmall: PixelSprite = {
  id: 'qa-sparkle-small',
  name: 'qa-sparkle-small',
  tags: ['scene', 'qa'],
  rows: ['.y.', 'yWy', '.y.'],
  frames: [
    ['.y.', 'yWy', '.y.'],
    ['...', '.w.', '...'],
  ],
  frameMs: 520,
};

export const qaMoteGold: PixelSprite = {
  id: 'qa-mote-gold',
  name: 'qa-mote-gold',
  tags: ['scene', 'qa'],
  rows: ['y', 'G'],
};

export const qaMoteWhite: PixelSprite = {
  id: 'qa-mote-white',
  name: 'qa-mote-white',
  tags: ['scene', 'qa'],
  rows: ['w', 'y'],
};

const SPARKLE_BIG_LATER = qaLater(qaSparkleBig, 'qa-sparkle-big-later', 2, 380);
const SPARKLE_SMALL_LATER = qaLater(qaSparkleSmall, 'qa-sparkle-small-later', 1, 610);

/** Where the medal hangs in the 48x40 keepsake, and how it sways: the pilot's numbers. */
export const QA_MEDAL_AT = { x: 13, y: 8 } as const;
export const QA_MEDAL_SWAY: SceneMotion = { kind: 'bob', amp: 1, periodMs: 2400 };

/**
 * The pathway's keepsake with one lesson's emblem on the medal, laid out exactly as the pilot's.
 * `options.base` swaps the ribbon (a checkpoint's double ribbon) and `options.extra` adds layers
 * drawn over everything (a laurel, more sparkles), so later batches build the special medallions
 * from this without copying it.
 */
export function qaKeepsake(
  id: string,
  label: string,
  emblem: PixelSprite,
  options: { base?: PixelSprite; extra?: readonly SceneLayer[] } = {},
): SceneArt {
  return {
    id,
    label,
    width: 48,
    height: 40,
    base: options.base ?? qaRibbon,
    layers: [
      { sprite: qaMedal(`${id}-medal`, emblem), x: QA_MEDAL_AT.x, y: QA_MEDAL_AT.y, motion: QA_MEDAL_SWAY },
      { sprite: qaSparkleBig, x: 5, y: 12, motion: { kind: 'twinkle', periodMs: 1600, min: 0.45 } },
      { sprite: SPARKLE_BIG_LATER, x: 37, y: 27, motion: { kind: 'twinkle', periodMs: 1900, phase: 0.5, min: 0.45 } },
      { sprite: qaSparkleSmall, x: 39, y: 6, motion: { kind: 'twinkle', periodMs: 1300, phase: 0.25, min: 0.35 } },
      { sprite: SPARKLE_SMALL_LATER, x: 9, y: 31, motion: { kind: 'twinkle', periodMs: 2100, phase: 0.7, min: 0.35 } },
      { sprite: qaMoteGold, x: 11, y: 24, motion: { kind: 'rise', amp: 5, periodMs: 2200, phase: 0.1 } },
      { sprite: qaMoteWhite, x: 36, y: 20, motion: { kind: 'rise', amp: 5, periodMs: 2600, phase: 0.6 } },
      { sprite: qaMoteGold, x: 34, y: 32, motion: { kind: 'rise', amp: 4, periodMs: 1900, phase: 0.35 } },
      ...(options.extra ?? []),
    ],
  };
}
