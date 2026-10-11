/**
 * The Global Economics kit, batch B (lessons 10 to 17): the bay the checkpoint and the sanctions
 * lesson share, a globe of any size, and flags for three more countries. Built from ge-kit.ts's
 * palette and helpers, as ge-kit-a.ts is; it adds to both and changes nothing in either.
 *
 * THE WHOLE BAY. ge-kit-a's grounds are the port up close; this one stands back on the promenade
 * and takes in the bay: two low headlands carrying the places the pathway has been (a bank, a
 * capitol, a factory, a tower), the harbor mouth between them with a light on each breakwater, and
 * the open sea beyond. Lesson 10 sets the world turning on it at dusk; lesson 16 closes it at night
 * by tinting it with GE_BAY_NIGHT, and a later lesson can do the same.
 *
 * NATIVE-OWNED, like everything in src/lib/pixel/scenes (CONSTITUTION 5.5: new art never goes in the
 * web-synced sprite files).
 */
import type { PixelSprite } from '../types';
import { GE_PALETTE, geFlag, geTint } from './ge-kit';

/* ── the bay ────────────────────────────────────────────────────────────────────────────────── */

/**
 * The bay at dusk from the promenade, 80x60. Sky to row 27, the far headlands on rows 10 to 28 with
 * the harbor mouth open between x 31 and 49 (its two breakwater lights at GE_BAY_LIGHTS), the bay
 * from row 29, the balustrade on rows 44 to 50 and the paving from row 51, where feet stand.
 */
export const geGroundBay: PixelSprite = {
  id: 'ge-ground-bay',
  name: 'bay at dusk',
  tags: ['ge', 'ground'],
  blurb: 'A dusk sky over two headlands with a bank, a capitol, a factory and a tower, the harbor mouth between them, the bay and a stone balustrade.',
  palette: GE_PALETTE,
  rows: [
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKkkkkkkkkkkkkkkkkkkkkkkkKKKKKKKKKKKKKKKKKKKkkkkkkkkkkkKKKKKKKKK',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk0000000000000000000kkkkkkkkkkkkkkkkKkkkk',
    '000000000000000000000000000000000000000000000000000000000000000000000000000K0000',
    '00000000000000000000000000000000000000000000000000000000000000000000000000KKK000',
    '0000000000000000000000000000000000000000000000000000000000000000000000000KKKKK00',
    '0000666666666666666666666000000000000000000000000000000066666666666666666KOKOK00',
    '66666666666666666666666666666666666666666666666666666666666666666KKKKKKK6KKKKK66',
    '666666K6666666666666666666666666666666666666666666666666666KK6666K6666666KOKKK66',
    '6666KKKKK66666666K66666666666666666666666666666666666666666KK6666K66666K6KKKKK66',
    '66KKKKKKKKK66666KKK6666666666666666666666666666666666666666KK66KKKK666666KKKOK66',
    '666K6K6K6K66666KKKKK66EEEEEEEEEEEEEEEEEEEEEEE66666666666666KKEEKEEKEEEEEEKKKKK66',
    'EEEKEKEKEKEEEEEKOKOKEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEKEEKEEKKKEEKKKKEEEEEEKOKKKEE',
    'EEEKEKEKEKEEEKKKKKKKKKEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEKKEKKEKKKKEKEEKEEEEEEKKKKKEE',
    'IIKKKKKKKKKIIKOKOKOKOKEEKEEEEEEEEEEEIIIIIIIIIIIIIIIIKKKKKKKKKKIK99K999999999EEEE',
    '9999999999999KKKKKKKKKIKKKIKIIIIIIIIIIIIIIIIIIIIIIIIKOKOKKOKOK999999999999999999',
    '99999999999999999999999KOKKK2IIDIIIIIIIIIIIIIIII2D22KKKKKKKKKK999999999999999999',
    '99999999999999999999999KKKOK22DOD222222222222222DOD2KKKKKKKKKK999999999999999999',
    '999999999999999999999999999933DXD333333333333333DXD33999999999999999999999999999',
    '999999999999999999999999999999DXD333333333333333DXD99999999999999999999999999999',
    '999999999999999999999999999999DXDddd444ddd4444ddDXD99999999999999999999999999999',
    'ccccccccccccccccccccccXXXXXXXXXXXcc2223333222cccXXXXXXXXXXXccccccccccccccccccccc',
    'ccccccccccccccccOcccccDDDDODDDDDDcccc222222cccccDDDDDDDDDDDccccccccccccccccccccc',
    'cccddOdddcccccccccccccccccccccccccccccccccccccccccccccOcccccddddddddcccccccOcccc',
    'cccccccccccccccccccOcccccccccccccc222233332222cccccccccccccccccccccccccccccccccc',
    'ccccccccccccccdddddddcccccccccccccccccccccccccccccdddddccOcccccccccccccccccccccc',
    'cccccccccccccccccccccccccccccccccccc22233222cccccccccccccccccccccccccccccccccccc',
    'cdddddccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccdddddddddccccc',
    'cccccccccccccccccccccccccccccccccccccc2222cccccccccccccccccccccccccccccccccccccc',
    'ccccccccccccccccccccddddddddccccccccccccccccddddddcccccccccccccccccccccccccccccc',
    'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
    'ccccccdddddddddccccccccccccccccccccccccccccccccccccccccccdddddddcccccccccccccccc',
    'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
    'ccccccccccccccccccccccccccccccddddddddddccccccccccccccccccccccccccccddddddcccccc',
    'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
    'ccccccccccccddddddddccccccccccccccccccccccccccccdddddddddccccccccccccccccccccccc',
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
  ],
};

/**
 * geGroundBay after dark, for geTint: every sky band a step deeper, the afterglow on the water dimmed
 * and the stone a step darker. The far shore's windows stay lit.
 */
export const GE_BAY_NIGHT: Readonly<Record<string, string>> = {
  k: 'K', '0': 'k', '6': '0', E: '0', I: '6', '2': '6', '3': 'E', '4': '6', x: 'X', X: 'D', D: 'k',
};

/** The lamp on each breakwater light, where a geBeacon or a twinkle goes. */
export const GE_BAY_LIGHTS = [{ x: 31, y: 25 }, { x: 49, y: 25 }] as const;

/** Where geBayTower is drawn into geGroundBay. */
export const GE_BAY_TOWERS = [{ x: 30, y: 24 }, { x: 48, y: 24 }] as const;

/**
 * One breakwater light, 3x5, as drawn into geGroundBay at GE_BAY_TOWERS. Stamp it again over a thing
 * placed in the harbor mouth and the thing sits out beyond the breakwater.
 */
export const geBayTower: PixelSprite = {
  id: 'ge-bay-tower',
  name: 'breakwater light',
  tags: ['ge', 'prop'],
  blurb: 'A small stone light tower on the end of a breakwater.',
  palette: GE_PALETTE,
  rows: [
    '.D.',
    'DOD',
    'DXD',
    'DXD',
    'DXD',
  ],
};

/* ── the world, at any size ─────────────────────────────────────────────────────────────────── */

/**
 * The continents on a 32x16 map, longitude across and latitude down (`#` is land), starting at the
 * Atlantic so a globe at rest shows the Americas, Europe and Africa. geGlobeTurning wraps it round a
 * disc, so globes of every size show the same world.
 */
const GE_WORLD: readonly string[] = [
  '................................',
  '.###......####........#####.....',
  '.##..#########......########....',
  '###.###########....##########...',
  '#..#############....#########...',
  '###############......######.....',
  '####..#########.......####.....#',
  '#####...#####..........###.....#',
  '#####....##.#...........##......',
  '.####......##............###....',
  '..###.......###..........####...',
  '..##.......#####..........###...',
  '..#.........###...........##....',
  '...........................#....',
  '................................',
  '................................',
];

/**
 * A globe `size` pixels across that turns once in `frames` frames, drawn as geGlobe is (a blue rim,
 * blue sea, green land lit from the left), for a globe bigger than geGlobe's 12: a monument's, a
 * capstone's. Keep size x size within the framed-layer limit of 32 x 32.
 */
export function geGlobeTurning(id: string, size: number, frames: number, frameMs: number): PixelSprite {
  const r = size / 2;
  const inside = (x: number, y: number) => (x + 0.5 - r) ** 2 + (y + 0.5 - r) ** 2 <= r * r;
  const clamp = (v: number) => Math.max(-1, Math.min(1, v));
  const pixel = (x: number, y: number, turn: number) => {
    if (!inside(x, y)) return '.';
    if (!inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || !inside(x, y + 1)) return 'b';
    const dx = (x + 0.5 - r) / r;
    const lat = Math.asin(clamp((y + 0.5 - r) / r));
    const lon = Math.asin(clamp(dx / Math.cos(lat)));
    // Turning carries every coast to the right, west to east, the way the earth turns.
    const u = (((lon / (2 * Math.PI) - turn) % 1) + 1) % 1;
    const land = GE_WORLD[Math.min(15, Math.floor((lat / Math.PI + 0.5) * 16))][Math.floor(u * 32) % 32] === '#';
    if (land) return dx < -0.35 ? 'm' : dx > 0.4 ? 'n' : 'N';
    return dx > 0.55 ? 'b' : 'B';
  };
  const draw = (turn: number) =>
    Array.from({ length: size }, (_, y) => Array.from({ length: size }, (__, x) => pixel(x, y, turn)).join(''));
  const all = Array.from({ length: frames }, (_, i) => draw(i / frames));
  return {
    id,
    name: 'turning globe',
    tags: ['ge', 'world', 'animated'],
    blurb: 'A blue globe with green continents, turning.',
    palette: GE_PALETTE,
    rows: all[0],
    frames: all,
    frameMs,
  };
}

/* ── flags for three more countries ─────────────────────────────────────────────────────────── */

/** geFlag for a fourth country, in gold. */
export const geFlagGold: PixelSprite = geTint(geFlag, 'ge-flag-gold', { m: 'y', N: 'G', n: 'g', J: 'O' });

/** geFlag for a fifth country, in orchid. */
export const geFlagOrchid: PixelSprite = geTint(geFlag, 'ge-flag-orchid', { m: 'Q', N: 'P', n: 'p', J: 'E' });

/** geFlag for a sixth country, in teal. */
export const geFlagTeal: PixelSprite = geTint(geFlag, 'ge-flag-teal', { m: 'T', N: 'T', n: 't', J: 'i' });
