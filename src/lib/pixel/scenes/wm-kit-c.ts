/**
 * The Wealth Management art kit for lessons 18 to 25: the family drawn larger, a moon, a coin in flight.
 *
 * THE CAST STEPS FORWARD. Lessons 1 to 17 stood the family and the advisor small at the foot of the
 * house or the end of a table. These openers bring the camera closer, so the people are the second
 * focus of each picture, as the quant is in the pilot: the same four as wm-kit.ts (the grandmother,
 * the father, the heir, the advisor) in the same clothes and inks, about one and a half times the
 * size, with faces that carry eyes, a lit cheek and a shadowed jaw. A lesson that needs a pose (a
 * hand held out, both arms up, kneeling) draws it from these with wmRepose, so every pose keeps the
 * kit's head and coat. Furniture in these openers is scaled to them: a desk reaches a hip, not a chin.
 *
 * The rules are wm-kit.ts's: light from the upper left, gold kept to fittings, marks and flames,
 * and only small sprites carry frames. The moon is lesson 1's, for the two outdoor openers here, and
 * wmCoinFlight carries money from one place to another in the openers where it changes hands.
 *
 * NATIVE-OWNED, like everything in src/lib/pixel/scenes (CONSTITUTION 5.5).
 */
import type { PixelSprite } from '../types';
import { wmBands, WM_INKS } from './wm-kit';

/* ── posing ─────────────────────────────────────────────────────────────────────────────────── */

/**
 * A pose of a cast member: `sprite` widened by `left` and `right` clear columns, with the rows in
 * `edits` (by index, drawn at the widened size) replacing the kit's. Rows not edited are the kit's
 * own, so the head and coat never drift from the standing figure.
 */
export function wmRepose(
  sprite: PixelSprite,
  id: string,
  edits: Readonly<Record<number, string>>,
  left = 0,
  right = 0,
): PixelSprite {
  const rows = sprite.rows.map((row, i) => edits[i] ?? `${'.'.repeat(left)}${row}${'.'.repeat(right)}`);
  return { ...sprite, id, name: id, rows };
}

/* ── the family and the advisor, drawn larger ───────────────────────────────────────────────── */

/**
 * The grandmother: a silver bun, an orchid shawl over a deeper dress, an ebony cane in her right hand.
 * Her head is the father's size inside a frame of hair, so she reads older, not smaller. 12x22.
 */
export const wmElderTall: PixelSprite = {
  id: 'wm-elder-tall',
  name: 'wm-elder-tall',
  tags: ['scene', 'wm'],
  palette: WM_INKS,
  rows: [
    '.....xwx....',
    '....xwwwX...',
    '...xwwwwwX..',
    '..xwwwwwwwX.',
    '..xwCCCCCX..',
    '..xCCKCKCX..',
    '..xCCCCCCU..',
    '...xCCCCU...',
    '....qPPPp...',
    '...qPPPPPp..',
    '..qPPPPPPpp.',
    '..PPpEEEpPp.',
    '.CPPpEEEpPpU',
    '.X.PpEEEppU.',
    '.X..pEEEp...',
    '.X..pEEEp...',
    '.X..pEEEp...',
    '.X..pEEEp...',
    '.X.pEEEEEp..',
    '.X..k...k...',
    '.X..k...k...',
    '.DKKK..KKK..',
  ],
};

/** The father: dark hair, blue suit, white shirt, red tie, dark trousers. 11x23. */
export const wmParentTall: PixelSprite = {
  id: 'wm-parent-tall',
  name: 'wm-parent-tall',
  tags: ['scene', 'wm'],
  palette: WM_INKS,
  rows: [
    '...kkkkk...',
    '..kkkkkkk..',
    '..kDDkkkk..',
    '..kCCCCCk..',
    '..CCKCKCU..',
    '..CCCCCCU..',
    '...CCCCU...',
    '....CCU....',
    '...bwRwb...',
    '.BBBwRwBbb.',
    'BBbBBRBBbbb',
    'BBbBBRBBbbb',
    'BBbBBRBBbbb',
    'BBbBBBBBbbb',
    'BBbBBBBBbbb',
    'CCbBBBBBbUU',
    '..bBBBBBb..',
    '..kkk.kkk..',
    '..kkk.kkk..',
    '..kkk.kkk..',
    '..kkk.kkk..',
    '..kkk.kkk..',
    '.KKKK.KKKK.',
  ],
};

/** The heir: sandy hair, a teal jumper, dark shorts. Nearly the adults' head on a small body. 9x15. */
export const wmChildTall: PixelSprite = {
  id: 'wm-child-tall',
  name: 'wm-child-tall',
  tags: ['scene', 'wm'],
  palette: WM_INKS,
  rows: [
    '..ggggg..',
    '.gGGgggg.',
    '.gGgggggg',
    'ggCCCCCgg',
    '.CCKCKCU.',
    '.CCCCCCU.',
    '..CCCCU..',
    '.tTTTTTt.',
    'TTtTTTttt',
    'TTtTTTttt',
    'CCtTTTtUU',
    '..tTTTt..',
    '..kk.kk..',
    '..kk.kk..',
    '.KKK.KKK.',
  ],
};

/** The wealth manager: grey suit, gold tie, a briefcase in the left hand. 14x23. */
export const wmAdvisorTall: PixelSprite = {
  id: 'wm-advisor-tall',
  name: 'wm-advisor-tall',
  tags: ['scene', 'wm'],
  palette: WM_INKS,
  rows: [
    '...kkkkk......',
    '..kkkkkkk.....',
    '..kDDkkkk.....',
    '..kSSSSSk.....',
    '..SSKSKSM.....',
    '..SSSSSSM.....',
    '...SSSSM......',
    '....SSM.......',
    '...XwGwX......',
    '.xxXwGwXXD....',
    'xxDXXGXXDDD...',
    'xxDXXGXXDDD...',
    'xxDXXGXXDDD...',
    'xxDXXXXXDDD...',
    'xxDXXXXXDDD...',
    'SSDXXXXXDMM...',
    '..DXXXXXD.MO..',
    '..kkk.kkkOgGO.',
    '..kkk.kkyGGGgO',
    '..kkk.kkGGyGgO',
    '..kkk.kkgggggO',
    '..kkk.kkOOOOOO',
    '.KKKK.KKKK....',
  ],
};

/* ── the night ──────────────────────────────────────────────────────────────────────────────── */

/** A full moon lit from the upper left, as over lesson 1's house. 9x9. */
export const wmMoon: PixelSprite = {
  id: 'wm-moon',
  name: 'wm-moon',
  tags: ['scene', 'wm'],
  rows: [
    '..xwwwx..',
    '.xwwwwwx.',
    'xwwXwwwwx',
    'wwwwwwXwx',
    'wwXwwwwwx',
    'wwwwwwwxX',
    'xwwwwXwxX',
    '.xwwwwxX.',
    '..xxxXX..',
  ],
};

/* ── moving bits: layers only, never stamped into a base ────────────────────────────────────── */

/**
 * A gold coin flying along `path` ([x, y] stops for its 2x2 top-left) inside a `width` x `height`
 * box, a stop a frame, then `rest` empty frames. Falling things are frames, because layer motion
 * can only rise. The still is the coin at its first stop, on the lip it leaves from.
 */
export function wmCoinFlight(
  id: string,
  width: number,
  height: number,
  path: readonly (readonly [number, number])[],
  rest: number,
  frameMs: number,
): PixelSprite {
  const empty = wmBands(width, [['.', height]]);
  const at = ([x, y]: readonly [number, number]) =>
    empty.map((row, j) => (j === y || j === y + 1 ? `${row.slice(0, x)}${j === y ? 'yG' : 'Gg'}${row.slice(x + 2)}` : row));
  return {
    id,
    name: id,
    tags: ['scene', 'wm'],
    rows: at(path[0]),
    frames: [...path.map(at), ...Array.from({ length: rest }, () => empty)],
    frameMs,
  };
}
