/**
 * fa-kit-b: the Financial Analytics parts lessons 10 to 17 share, on top of fa-kit and fa-kit-a.
 *
 * THE CAST. Batch A stood the analyst at the right in one pose every time; from here the analyst
 * moves. faAnalystCheer raises the pathway trophy (the capstones), faAnalystBack studies a wall
 * from behind, faAnalystPoint points up and left at a screen, faAnalystTabletUp holds the tablet
 * up to the sky. Two figures take any cast: faSeatedBack (in an office chair, seen from behind)
 * and faAtDesk (front on, behind a desk, hands on its top). The casts are the analyst, a client
 * (grey hair, blue suit) and a colleague (ginger bun, orchid blazer), who also stands on her own
 * with a clipboard (faColleague). Every pose keeps faAnalyst's face, so the analyst stays one
 * person whichever way they face.
 *
 * THE CAPSTONE NIGHT. faBackdropCapstone is the pathway backdrop over the same base with a
 * different layer table: every window lit, every packet gold, and the billboard building the
 * capstone pyramid. Lessons 10 and 25 use it; the rest keep faBackdrop.
 *
 * Same rules as fa-kit: light from the left, outlines in the deep steps, kit tones only from
 * FA_STEEL and the cast palettes, so anything here stamps cleanly next to anything there.
 */
import { faBackdrop } from './fa-backdrop';
import { faAnalyst, faFalling, faPacketRun, FA_STEEL } from './fa-kit';
import { faDrawnBy } from './fa-kit-a';
import type { PixelSprite } from '../types';
import type { SceneArt, SceneLayer } from './types';

/* ── casts ─────────────────────────────────────────────────────────────────────────────────── */

/**
 * Who wears a figure. Figures are drawn in the analyst's letters (j h H hair, S M skin, T t v top,
 * P accent); a cast swaps those letters for its own and brings the palette they need.
 */
export interface FaCast {
  swap: Readonly<Record<string, string>>;
  palette: Readonly<Record<string, string>>;
}

export const FA_CAST_ANALYST: FaCast = { swap: {}, palette: faAnalyst.palette ?? {} };

/** The client: grey hair, a blue suit with an orchid-shadowed back, a white shirt collar. */
export const FA_CAST_CLIENT: FaCast = {
  swap: { j: 'x', h: 'X', H: 'D', T: 'B', t: 'b', v: 'E', P: 'w' },
  palette: faAnalyst.palette ?? {},
};

/** The colleague's own tones: fair skin, ginger hair. Letters no other part uses. */
const COLLEAGUE_TONES: Record<string, string> = {
  A: '#EDBD95',
  C: '#C98E66',
  L: '#D9773A',
  U: '#A8521F',
  V: '#6B3013',
};

/** The colleague: ginger hair, an orchid blazer over a white shirt. */
export const FA_CAST_COLLEAGUE: FaCast = {
  swap: { S: 'A', M: 'C', j: 'L', h: 'U', H: 'V', T: 'P', t: 'p', v: 'E', P: 'w' },
  palette: COLLEAGUE_TONES,
};

const recast = (rows: readonly string[], cast: FaCast) => rows.map((row) => [...row].map((ch) => cast.swap[ch] ?? ch).join(''));

/* ── the analyst's poses ───────────────────────────────────────────────────────────────────── */

/**
 * The analyst raising the pathway trophy overhead in both hands: a gold terminal on an orchid
 * plinth, faTrophy at figure size. 14 x 31; the feet are the bottom row.
 */
export const faAnalystCheer: PixelSprite = {
  id: 'fa-analyst-cheer',
  name: 'analyst cheer',
  tags: ['scene', 'fa', 'character'],
  blurb: 'The analyst, front on, holding the gold trophy up in both hands.',
  palette: faAnalyst.palette,
  rows: [
    '....OOOOOO....',
    '...OyyyyyGO...',
    '...OyKKKKgO...',
    '...OyKNyKgO...',
    '...OggggggO...',
    '....OOOOOO....',
    '.....OyGO.....',
    '...SEqPPpEM...',
    '...SEEEEEEM...',
    '..TTjhhhhHtv..',
    '.TTjjhhhhhHtv.',
    'TTHjhhhhhhhHtv',
    'TTHhhSSSShhHtv',
    'TTHhSSSSSSMHtv',
    'TTHDwDSDwDMHtv',
    'TTHSSSSSSSMHtv',
    'TTHSSSkkSSMHtv',
    'TT.HSSSSSMH.tv',
    'TT....SM....tv',
    'TTTTTtwwtttttv',
    '..TTtPwwPttv..',
    '..TTttPPtttv..',
    '..TTttwwtttv..',
    '..TTttwwtttv..',
    '..TTtttttttv..',
    '..TTtttttttv..',
    '...Tttttttv...',
    '...DDDDDDkk...',
    '...DDD..Dkk...',
    '...DDD..Dkk...',
    '..OOOO..OOOO..',
  ],
};
/** The trophy's little screen on faAnalystCheer (4x2), for a glint layer. */
export const FA_CHEER_SCREEN = { x: 5, y: 2 } as const;

/**
 * The analyst from behind, studying a wall: all hair, ears at the sides, the lanyard cord across
 * the back of the collar, hands clasped at the small of the back. 12 x 24, the size of faAnalyst.
 */
export const faAnalystBack: PixelSprite = {
  id: 'fa-analyst-back',
  name: 'analyst back',
  tags: ['scene', 'fa', 'character'],
  blurb: 'The analyst seen from behind, hands clasped at the back.',
  palette: faAnalyst.palette,
  rows: [
    '...jhhhhH...',
    '..jjhhhhhH..',
    '.HjhhhhhhhH.',
    '.HjjhhhhhhH.',
    '.HjhhhhhhhH.',
    '.HjhhhhhhhH.',
    'SHjhhhhhhhHM',
    '.HjhhhhhhhH.',
    '..HhhhhhhH..',
    '.....SM.....',
    '..TTtPPttv..',
    '.TTTtttttvv.',
    '.TTttttttvv.',
    '.TTttttttvv.',
    '.TTttttttvv.',
    '.TTttttttvv.',
    '.TTtSSMttvv.',
    '.TTtSMMttvv.',
    '..TTttttvv..',
    '..Tttttttv..',
    '..DDDDDDkk..',
    '..DDD..Dkk..',
    '..DDD..Dkk..',
    '.OOOO..OOOO.',
  ],
};

/**
 * The analyst pointing up and to the left (at a screen on their right hand), the other hand at
 * the side. 16 x 24: faAnalyst four pixels in, the finger tip at FA_POINT_TIP.
 */
export const faAnalystPoint: PixelSprite = {
  id: 'fa-analyst-point',
  name: 'analyst point',
  tags: ['scene', 'fa', 'character'],
  blurb: 'The analyst, front on, pointing up and to the left.',
  palette: faAnalyst.palette,
  rows: [
    '.......jhhhhH...',
    '......jjhhhhhH..',
    '.....HjhhhhhhhH.',
    '.....HhhSSSShhH.',
    '.....HhSSSSSSMH.',
    '.....HDwDSDwDMH.',
    'S....HSSSSSSSMH.',
    '.SS..HSSSkkSSMH.',
    '..TT..HSSSSSMH..',
    '...TT....SM.....',
    '....TTTTtwwttv..',
    '.....TTtPwwPttv.',
    '.....TTttPPtttv.',
    '.....TTttwwtttv.',
    '.....TTttwwtttv.',
    '.....TTtttttttv.',
    '.....TTttttttvS.',
    '.....TTttttttvS.',
    '......TTtttttv..',
    '......Tttttttv..',
    '......DDDDDDkk..',
    '......DDD..Dkk..',
    '......DDD..Dkk..',
    '.....OOOO..OOOO.',
  ],
};
export const FA_POINT_TIP = { x: 0, y: 6 } as const;

/**
 * The analyst holding the tablet up and out to the side, screen to the viewer, the other hand at
 * the side. 19 x 24; the tablet's glass (5x4 at FA_TABLET_UP_GLASS) is left dark for a layer.
 */
export const faAnalystTabletUp: PixelSprite = {
  id: 'fa-analyst-tablet-up',
  name: 'analyst tablet up',
  tags: ['scene', 'fa', 'character'],
  blurb: 'The analyst, front on, holding the tablet up and out to show its screen.',
  palette: faAnalyst.palette,
  rows: [
    '...jhhhhH...DDDDDDD',
    '..jjhhhhhH..DKKKKKD',
    '.HjhhhhhhhH.DKKKKKD',
    '.HhhSSSShhH.DKKKKKD',
    '.HhSSSSSSMH.DKKKKKD',
    '.HDwDSDwDMH.DDDDDDD',
    '.HSSSSSSSMH...SM...',
    '.HSSSkkSSMH..tv....',
    '..HSSSSSMH..tv.....',
    '.....SM....tv......',
    '..TTtwwtttv........',
    '.TTtPwwPttv........',
    '.TTttPPtttv........',
    '.TTttwwtttv........',
    '.TTttwwtttv........',
    '.TTtttttttv........',
    '.STtttttttv........',
    '.STtttttttv........',
    '..TTttttvv.........',
    '..Tttttttv.........',
    '..DDDDDDkk.........',
    '..DDD..Dkk.........',
    '..DDD..Dkk.........',
    '.OOOO..OOOO........',
  ],
};
export const FA_TABLET_UP_GLASS = { x: 13, y: 1 } as const;

/* ── figures any cast can wear ─────────────────────────────────────────────────────────────── */

/**
 * Someone in an office chair, seen from behind: the back of the head, shoulders and elbows
 * either side of the chair back, the seat, the column and the five-star base. 12 x 24, the
 * casters on the bottom row. Facing a desk, the head clears a desk top 7 rows above the casters.
 */
export function faSeatedBack(id: string, cast: FaCast): PixelSprite {
  return {
    id,
    name: id,
    tags: ['scene', 'fa', 'character'],
    blurb: 'A figure in an office chair, seen from behind.',
    palette: cast.palette,
    rows: recast([
      '...jhhhhH...',
      '..jjhhhhhH..',
      '.HjhhhhhhhH.',
      '.HjjhhhhhhH.',
      '.HjhhhhhhhH.',
      '.HjhhhhhhhH.',
      'SHjhhhhhhhHM',
      '.HjhhhhhhhH.',
      '..HhhhhhhH..',
      '.....SM.....',
      '..TTtPPttv..',
      '.TTTtttttvv.',
      'TTTttttttvvv',
      'TTtDDDDDDtvv',
      'TTtDxXXkDtvv',
      '.TtDxXXkDtv.',
      '..tDxXXkDv..',
      '...DxXXkD...',
      '.DDDDDDDDDD.',
      '.DxxXXXXXkD.',
      '.DDDDDDDDDD.',
      '.....Dk.....',
      '.DDDDDDDDDD.',
      '.X...XX...X.',
    ], cast),
  };
}

/** The analyst's head and neck (faAnalyst's first ten rows), and the colleague's, with her bun. */
const ANALYST_HEAD = faAnalyst.rows.slice(0, 10);
const COLLEAGUE_HEAD = [
  '....VVVV....',
  '...VLLUUV...',
  '...VLUUUV...',
  '..VLUUUUUV..',
  '.VLLUUUUUUV.',
  '.VLUAAAAUUV.',
  '.VLAAAAAACV.',
  '.VAKAAAAKCV.',
  '.VAAAAAAACV.',
  '.VAAACCAACV.',
  '..VAAAAACV..',
  '.....AC.....',
];

/**
 * Someone front on behind a desk: head, shoulders, then a blank row where the desk's top edge
 * runs in front of them and the hands resting on its top. Stamp it AFTER the desk, its last row
 * on the desk's lit top (the desk's row 1).
 */
export function faAtDesk(id: string, cast: FaCast): PixelSprite {
  const colleague = cast === FA_CAST_COLLEAGUE;
  return {
    id,
    name: id,
    tags: ['scene', 'fa', 'character'],
    blurb: 'A figure behind a desk, front on, hands on the desk top.',
    palette: cast.palette,
    rows: [
      ...(colleague ? COLLEAGUE_HEAD : ANALYST_HEAD),
      ...recast([
        '..TTtwwttv..',
        '.TTtPwwPttv.',
        '.TTttPPtttv.',
        'TTTttwwtttvv',
        '............',
        '.SM......SM.',
      ], cast),
    ],
  };
}

/**
 * The colleague standing front on, a clipboard held at the chest: the cast's second regular, so
 * the analyst has someone to compare notes with. 12 x 26, two rows taller for her bun.
 */
export const faColleague: PixelSprite = {
  id: 'fa-colleague',
  name: 'colleague',
  tags: ['scene', 'fa', 'character'],
  blurb: 'A colleague with a ginger bun and an orchid blazer, holding a clipboard.',
  palette: COLLEAGUE_TONES,
  rows: [
    ...COLLEAGUE_HEAD,
    '..PPpwwppE..',
    '.qPPpwwpppE.',
    '.qPPppwpppE.',
    '.qPPpppppE..',
    '.qDDDXXDDDE.',
    '.ADwwwwwwDC.',
    '.ADwXXXXwDC.',
    '..DwXXXwwD..',
    '..DDDDDDDD..',
    '..PPppppE...',
    '..DDDDDDkk..',
    '..DDD..Dkk..',
    '..DDD..Dkk..',
    '.EEEE..EEEE.',
  ],
};
/** The clipboard's paper (6x2 at FA_CLIPBOARD), for a tick layer. */
export const FA_CLIPBOARD = { x: 3, y: 17 } as const;

/* ── drawing ───────────────────────────────────────────────────────────────────────────────── */

/** A blank `w` x `h` grid to paint pixels into, and the rows of a painted one. */
export const faBlank = (w: number, h: number): string[][] => Array.from({ length: h }, () => Array.from({ length: w }, () => '.'));
export const faRowsOf = (grid: readonly (readonly string[])[]): string[] => grid.map((row) => row.join(''));

/** The pixels of a straight line from (x0, y0) to (x1, y1), in order (Bresenham). */
export function faLine(x0: number, y0: number, x1: number, y1: number): [number, number][] {
  const out: [number, number][] = [];
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  let [x, y] = [x0, y0];
  for (;;) {
    out.push([x, y]);
    if (x === x1 && y === y1) return out;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x += sx; }
    if (e2 <= dx) { err += dx; y += sy; }
  }
}

/**
 * A line chart's pixels from one value per column (`ys`, rows from the top), left to right. A
 * column that jumps also fills the rows back towards the previous value, so the line never breaks.
 */
export function faTrace(ys: readonly number[]): [number, number][] {
  return ys.flatMap((y, x) => {
    const prev = x > 0 ? ys[x - 1] : y;
    const step = y > prev ? -1 : 1;
    const run: [number, number][] = [[x, y]];
    if (Math.abs(y - prev) > 1) for (let r = y + step; r !== prev; r += step) run.push([x, r]);
    return run;
  });
}

/**
 * Packets running LEFT along a `length` pipe, two pixels long, one every `gap`: fa-kit's
 * faPacketRun the other way. `ink` colours each packet by its count, so packets can alternate
 * (two tables' rows in one joined stream); the loop is `gap` x `inks` frames, so it never seams.
 */
export function faPacketsLeft(id: string, length: number, inks: readonly string[], gap = 6, frameMs = 170): PixelSprite {
  const span = gap * inks.length;
  const frames = Array.from({ length: span }, (_, f) => {
    let row = '';
    for (let x = 0; x < length; x++) {
      const p = (((x + f) % span) + span) % span;
      row += p % gap < 2 ? inks[Math.floor(p / gap)] : '.';
    }
    return [row];
  });
  return { id, name: id, tags: ['scene', 'fa'], rows: frames[0], frames, frameMs };
}

/* ── props ─────────────────────────────────────────────────────────────────────────────────── */

/** A chute hanging from the ceiling, 6 x `h`, with a flange every eight rows: data falls out of it. */
export function faChute(id: string, h: number): PixelSprite {
  return {
    id,
    name: id,
    tags: ['scene', 'fa', 'prop'],
    blurb: 'A steel chute dropping from the ceiling.',
    rows: Array.from({ length: h }, (_, y) => (y % 8 === 6 ? 'DDDDDD' : y === h - 1 ? 'DKKKKD' : 'DxXXkD')),
  };
}

/**
 * Confetti in the five stage colours and white, falling down a `w` x `h` strip: the capstones'
 * celebration. `seed` staggers the pieces so two strips never fall in step.
 */
export function faConfetti(id: string, w: number, h: number, seed: number, frameMs = 150): PixelSprite {
  const inks = ['B', 'T', 'N', 'q', 'y', 'w'];
  const drops = Array.from({ length: Math.floor((w * h) / 18) }, (_, i) => {
    const k = (i * 7 + seed * 13) % 97;
    return [(i * 5 + seed * 3) % w, (k * 11) % h, inks[(i + seed) % inks.length]] as const;
  });
  return faFalling(id, w, h, drops, frameMs);
}

/* ── the capstone night ────────────────────────────────────────────────────────────────────── */

/** A night gold for packets and lit doorways, the brightest gold under the backdrop's 0.15 ceiling. */
const NIGHT_GOLD: Record<string, string> = { u: '#8A5E12' };

const lit = (id: string, w: number, h: number, ch: string, palette?: Record<string, string>): PixelSprite => ({
  id,
  name: id,
  tags: ['scene', 'fa'],
  palette,
  rows: Array.from({ length: h }, () => ch.repeat(w)),
});

/** The capstone pyramid on the billboard, building course by course in the stages' night tones. */
const capstoneBillboard: PixelSprite = (() => {
  const full = [
    '.....uu.....',
    '.....uu.....',
    '....pppp....',
    '....pppp....',
    '...nnnnnn...',
    '...nnnnnn...',
    '.tttttttttt.',
    '.tttttttttt.',
    'bbbbbbbbbbbb',
    'bbbbbbbbbbbb',
  ];
  return { ...faDrawnBy('fa-billboard-capstone', full, (_x, y) => 4 - Math.floor(y / 2), 600, 6), palette: NIGHT_GOLD };
})();

const goldPipe = (id: string): PixelSprite => ({ ...faPacketRun(id, 24, [[Infinity, 'u']], 8, 260), palette: NIGHT_GOLD });
const beacon = (id: string, on: string, off: string): PixelSprite => ({ id, name: id, tags: ['scene', 'fa'], rows: [on], frames: [[on], [off]], frameMs: 1600 });
const star: PixelSprite = { id: 'fa-capstone-star', name: 'star', tags: ['scene', 'fa'], palette: FA_STEEL, rows: ['e'] };
const puff: PixelSprite = { id: 'fa-capstone-puff', name: 'puff', tags: ['scene', 'fa'], palette: FA_STEEL, rows: ['.e.', 'ece'] };
const glow = (sprite: PixelSprite, x: number, y: number, phase: number): SceneLayer => ({ sprite, x, y, motion: { kind: 'twinkle', periodMs: 5200, min: 0.7, phase } });

/**
 * The capstone backdrop: faBackdrop's base with every window lit (the four hall windows, the hall
 * door, both silo windows, the hut, the silo slits), every packet on the floor pipe gold, the hopper
 * spout dropping gold grains and the billboard building the capstone pyramid. Lessons 10 and 25.
 */
export const faBackdropCapstone: SceneArt = {
  id: 'fa-backdrop-capstone',
  label: 'The data plant at night with every window lit, gold data pulsing along the pipe on the ground and a billboard building a stepped pyramid.',
  width: faBackdrop.width,
  height: faBackdrop.height,
  base: faBackdrop.base,
  layers: [
    glow(lit('fa-cap-win-o', 2, 4, 'O'), 55, 26, 0.1),
    glow(lit('fa-cap-win-t', 2, 4, 't'), 59, 26, 0.6),
    glow(lit('fa-cap-win-o', 2, 4, 'O'), 68, 26, 0.35),
    glow(lit('fa-cap-win-t', 2, 4, 't'), 72, 26, 0.8),
    glow(lit('fa-cap-door', 4, 6, 'u', NIGHT_GOLD), 62, 30, 0.5),
    glow(lit('fa-cap-silo-a', 3, 4, 'b'), 28, 31, 0.2),
    glow(lit('fa-cap-silo-b', 2, 3, 't'), 20, 32, 0.7),
    glow(lit('fa-cap-hut', 2, 2, 'b'), 9, 31, 0.45),
    glow(lit('fa-cap-slit-o', 1, 2, 'O'), 21, 22, 0.9),
    glow(lit('fa-cap-slit-o', 1, 2, 'O'), 30, 21, 0.3),
    glow(lit('fa-cap-slit-t', 1, 2, 't'), 36, 25, 0.65),
    { sprite: beacon('fa-cap-beacon-silo', 'n', 'K'), x: 29, y: 5 },
    { sprite: beacon('fa-cap-beacon-stack', 'K', 'r'), x: 72, y: 4 },
    { sprite: star, x: 17, y: 3, motion: { kind: 'twinkle', periodMs: 5200, min: 0.3, phase: 0.2 } },
    { sprite: star, x: 61, y: 6, motion: { kind: 'twinkle', periodMs: 6100, min: 0.3, phase: 0.7 } },
    { sprite: star, x: 99, y: 4, motion: { kind: 'twinkle', periodMs: 4700, min: 0.3, phase: 0.4 } },
    { sprite: puff, x: 71, y: 2, motion: { kind: 'rise', amp: 3, periodMs: 5200 } },
    { sprite: puff, x: 72, y: 1, motion: { kind: 'rise', amp: 2, periodMs: 6400, phase: 0.5 } },
    { sprite: { ...faFalling('fa-cap-grains', 1, 7, [[0, 0, 'u'], [0, 3, 'u'], [0, 5, 'u']], 240), palette: NIGHT_GOLD }, x: 46, y: 23 },
    { sprite: capstoneBillboard, x: 96, y: 18 },
    { sprite: goldPipe('fa-cap-pipe-a'), x: 5, y: 37 },
    { sprite: goldPipe('fa-cap-pipe-b'), x: 33, y: 37 },
    { sprite: goldPipe('fa-cap-pipe-a'), x: 61, y: 37 },
    { sprite: goldPipe('fa-cap-pipe-b'), x: 87, y: 37 },
  ],
};
