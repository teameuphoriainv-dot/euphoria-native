/**
 * The Wealth Management art kit: the pieces every lesson scene in this pathway is assembled from.
 *
 * THE PATHWAY'S WORLD IS AN OLD FAMILY ESTATE AT NIGHT: a marble house of five pillars, an oak,
 * clipped hedges, a lamp on the lawn, and three generations of one family. Wealth management is
 * about keeping and handing on, so the kit draws things that last (stone, trees, heirs) rather
 * than the quant's screens and skyline.
 *
 * COMPOSED, NOT REDRAWN. A lesson opener's still base is painted from these sprites by wmCompose
 * at module load, so a new opener is a list of stamps over a ground, and every lesson's temple,
 * oak and family are the same drawing. The base is still ONE sprite: one mesh with merged runs,
 * no extra views. Only small sprites carry frames (scenes/types.ts), and those are kept apart
 * here under "moving bits" so they are placed as layers, never stamped into a base.
 *
 * LIGHT COMES FROM THE UPPER LEFT on every piece, as on every figure in the app. Marble is the
 * neutral ramp (w, x, X, D), gold is money and is kept to marks and lamplight, and the custom inks
 * below are the only colours outside the shared palette.
 *
 * NATIVE-OWNED, like everything in src/lib/pixel/scenes (CONSTITUTION 5.5).
 */
import type { PixelSprite } from '../types';

/**
 * The kit's own inks. Night foliage is a dark green the shared palette does not have, and must
 * stay under the backdrop's luminance cap, which both greens do. Skin repeats the cast's tones
 * from sprites-characters.ts so a family member and an avatar never disagree. z is the cast shadow
 * on the lawn, a step below the night ground.
 */
export const WM_INKS: Record<string, string> = {
  h: '#16261F',
  H: '#24493B',
  S: '#F4CBA4',
  M: '#D6A87C',
  C: '#C08552',
  U: '#9A6638',
  z: '#110E17',
};

/* ── composing ──────────────────────────────────────────────────────────────────────────────── */

/** A sprite placed in a scene, by its top-left corner in scene pixels. */
export interface WmStamp {
  sprite: PixelSprite;
  x: number;
  y: number;
}

/**
 * Paints stamps over a ground, in order, into one still sprite. `.` in a stamp lets what is under
 * it show, so later stamps stand in front of earlier ones. A stamp may hang off the edge (a tree
 * cropped by the frame); the overhang is dropped. Two stamps that paint one character in two
 * colours throw, because the base would silently show the wrong one.
 */
export function wmCompose(id: string, ground: readonly string[], stamps: readonly WmStamp[]): PixelSprite {
  const grid = ground.map((row) => [...row]);
  const palette: Record<string, string> = { ...WM_INKS };
  for (const { sprite, x, y } of stamps) {
    for (const [ch, hex] of Object.entries(sprite.palette ?? {})) {
      if (palette[ch] && palette[ch] !== hex) {
        throw new Error(`wmCompose ${id}: ${sprite.id} paints "${ch}" as ${hex}, but it is already ${palette[ch]}`);
      }
      palette[ch] = hex;
    }
    sprite.rows.forEach((row, j) => {
      const line = grid[y + j];
      if (!line) return;
      [...row].forEach((ch, i) => {
        if (ch !== '.' && x + i >= 0 && x + i < line.length) line[x + i] = ch;
      });
    });
  }
  return { id, name: id, tags: ['scene', 'wm'], palette, rows: grid.map((line) => line.join('')) };
}

/** A ground of flat horizontal bands, top to bottom: `[['K', 40], ['h', 20]]`. */
export function wmBands(width: number, bands: readonly (readonly [string, number])[]): string[] {
  return bands.flatMap(([ch, n]) => Array.from({ length: n }, () => ch.repeat(width)));
}

/** The same sprite facing the other way, frames included. */
export function wmMirror(sprite: PixelSprite, id: string): PixelSprite {
  const flip = (rows: string[]) => rows.map((row) => [...row].reverse().join(''));
  return { ...sprite, id, name: id, rows: flip(sprite.rows), frames: sprite.frames?.map(flip) };
}

/**
 * The same framed sprite starting elsewhere in its cycle, at its own pace. Frames tick from mount
 * with no offset, so two layers sharing one sprite would flash in step; a motion `phase` only
 * offsets the transform and opacity, not the frames.
 */
export function wmLater(sprite: PixelSprite, id: string, by: number, frameMs: number): PixelSprite {
  const frames = sprite.frames ?? [sprite.rows];
  return { ...sprite, id, name: id, frames: [...frames.slice(by), ...frames.slice(0, by)], frameMs };
}

/* ── the house of five pillars ──────────────────────────────────────────────────────────────── */

/** One marble column: abacus, fluted shaft lit from the left, plinth. Column centres sit 10 apart. */
export const wmColumn: PixelSprite = {
  id: 'wm-column',
  name: 'wm-column',
  tags: ['scene', 'wm'],
  rows: [
    'xwwwwwX',
    'DXxxxXD',
    '.wxXxD.',
    '.wxXxD.',
    '.wxXxD.',
    '.wxXxD.',
    '.wxXxD.',
    '.wxXxD.',
    '.wxXxD.',
    '.wxXxD.',
    '.wxXxD.',
    '.wxXxD.',
    '.wxXxD.',
    '.wxXxD.',
    '.wxXxD.',
    '.wxXxD.',
    '.wxXxD.',
    '.wxXxD.',
    'xwwwwwX',
    'DXXXXXD',
  ],
};

/** The gable: a raking cornice at 3:1 over a recessed tympanum (D), which takes a small mark. */
export const wmPediment: PixelSprite = {
  id: 'wm-pediment',
  name: 'wm-pediment',
  tags: ['scene', 'wm'],
  rows: [
    '.......................wwwxxxx.......................',
    '....................wwwxxxXXXXxxx....................',
    '.................wwwxxxXXXDDDDXXXxxx.................',
    '..............wwwxxxXXXDDDDDDDDDDXXXxxx..............',
    '...........wwwxxxXXXDDDDDDDDDDDDDDDDXXXxxx...........',
    '........wwwxxxXXXDDDDDDDDDDDDDDDDDDDDDDXXXxxx........',
    '.....wwwxxxXXXDDDDDDDDDDDDDDDDDDDDDDDDDDDDXXXxxx.....',
    '..wwwxxxXXXDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDXXXxxx..',
    'xwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwX',
    'DXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXD',
  ],
};

/**
 * The frieze and architrave. Five dark 7x5 panels sit over the five columns (panel left edges at
 * 1, 11, 21, 31, 41) and take the pillar marks; triglyphs part them.
 */
export const wmEntablature: PixelSprite = {
  id: 'wm-entablature',
  name: 'wm-entablature',
  tags: ['scene', 'wm'],
  rows: [
    'xDDDDDDDwxXDDDDDDDwxXDDDDDDDwxXDDDDDDDwxXDDDDDDDX',
    'xDDDDDDDwxXDDDDDDDwxXDDDDDDDwxXDDDDDDDwxXDDDDDDDX',
    'xDDDDDDDwxXDDDDDDDwxXDDDDDDDwxXDDDDDDDwxXDDDDDDDX',
    'xDDDDDDDwxXDDDDDDDwxXDDDDDDDwxXDDDDDDDwxXDDDDDDDX',
    'xDDDDDDDwxXDDDDDDDwxXDDDDDDDwxXDDDDDDDwxXDDDDDDDX',
    'xwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwX',
    'DXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXD',
  ],
};

/** The back wall between the columns, with a lamplit doorway in each of the four bays. */
const wmCella: PixelSprite = {
  id: 'wm-cella',
  name: 'wm-cella',
  tags: ['scene', 'wm'],
  rows: [
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkOkkkkkkkkkOkkkkkkkkkOkkkkkkkkkOkkkkkkkkk',
    'kkkkkkkkOgOkkkkkkkOgOkkkkkkkOgOkkkkkkkOgOkkkkkkkk',
    'kkkkkkkkOgOkkkkkkkOgOkkkkkkkOgOkkkkkkkOgOkkkkkkkk',
    'kkkkkkkkOgOkkkkkkkOgOkkkkkkkOgOkkkkkkkOgOkkkkkkkk',
    'kkkkkkkkOgOkkkkkkkOgOkkkkkkkOgOkkkkkkkOgOkkkkkkkk',
    'kkkkkkkkOgOkkkkkkkOgOkkkkkkkOgOkkkkkkkOgOkkkkkkkk',
    'kkkkkkkkOgOkkkkkkkOgOkkkkkkkOgOkkkkkkkOgOkkkkkkkk',
    'kkkkkkkkOgOkkkkkkkOgOkkkkkkkOgOkkkkkkkOgOkkkkkkkk',
    'kkkkkkkkOgOkkkkkkkOgOkkkkkkkOgOkkkkkkkOgOkkkkkkkk',
    'kkkkkkkkOgOkkkkkkkOgOkkkkkkkOgOkkkkkkkOgOkkkkkkkk',
    'kkkkkkkkOgOkkkkkkkOgOkkkkkkkOgOkkkkkkkOgOkkkkkkkk',
    'kkkkkkkkOgOkkkkkkkOgOkkkkkkkOgOkkkkkkkOgOkkkkkkkk',
    'kkkkkkkkOgOkkkkkkkOgOkkkkkkkOgOkkkkkkkOgOkkkkkkkk',
    'kkkkkkkkOgOkkkkkkkOgOkkkkkkkOgOkkkkkkkOgOkkkkkkkk',
    'kkkkkkkkOgOkkkkkkkOgOkkkkkkkOgOkkkkkkkOgOkkkkkkkk',
  ],
};

/** Three marble steps, each two pixels wider a side than the one above: the foundation. */
export const wmSteps: PixelSprite = {
  id: 'wm-steps',
  name: 'wm-steps',
  tags: ['scene', 'wm'],
  rows: [
    '....wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwx....',
    '....xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXD....',
    '..wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwx..',
    '..xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXD..',
    'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwx',
    'xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXD',
  ],
};

/**
 * The house of five pillars, 59x43, composed from the pieces above. Where the marks go, in temple
 * pixels: frieze panels at x 6, 16, 26, 36, 46 (y 10, each 7x5); the tympanum centre at x 29,
 * y 6; the top step at y 37. The apex is x 29, y 0.
 */
export const wmTemple: PixelSprite = wmCompose('wm-temple', wmBands(59, [['.', 43]]), [
  { sprite: wmPediment, x: 3, y: 0 },
  { sprite: wmEntablature, x: 5, y: 10 },
  { sprite: wmCella, x: 5, y: 17 },
  { sprite: wmColumn, x: 6, y: 17 },
  { sprite: wmColumn, x: 16, y: 17 },
  { sprite: wmColumn, x: 26, y: 17 },
  { sprite: wmColumn, x: 36, y: 17 },
  { sprite: wmColumn, x: 46, y: 17 },
  { sprite: wmSteps, x: 0, y: 37 },
]);

/* ── the five pillar marks: gold reliefs for the frieze panels, 7x5 ─────────────────────────── */

/** Earn: a coin. */
export const wmMarkEarn: PixelSprite = {
  id: 'wm-mark-earn',
  name: 'wm-mark-earn',
  tags: ['scene', 'wm'],
  rows: [
    '..yGG..',
    '.yGOGg.',
    '.GGOGg.',
    '.gGOgg.',
    '..ggg..',
  ],
};

/** Save: a lidded jar. */
export const wmMarkSave: PixelSprite = {
  id: 'wm-mark-save',
  name: 'wm-mark-save',
  tags: ['scene', 'wm'],
  rows: [
    '..OOO..',
    '..yGg..',
    '.yGGGg.',
    '.GGGgg.',
    '..ggg..',
  ],
};

/** Invest: a rising arrow. */
export const wmMarkInvest: PixelSprite = {
  id: 'wm-mark-invest',
  name: 'wm-mark-invest',
  tags: ['scene', 'wm'],
  rows: [
    '....yGG',
    '.....Gg',
    '....G.g',
    '..yG...',
    'yG.....',
  ],
};

/** Protect: a shield with a centre rib. */
export const wmMarkProtect: PixelSprite = {
  id: 'wm-mark-protect',
  name: 'wm-mark-protect',
  tags: ['scene', 'wm'],
  rows: [
    'yyGGGgg',
    'yGGOGgg',
    '.yGOGg.',
    '..GOg..',
    '...g...',
  ],
};

/** Transfer: a key, bow on the left. */
export const wmMarkTransfer: PixelSprite = {
  id: 'wm-mark-transfer',
  name: 'wm-mark-transfer',
  tags: ['scene', 'wm'],
  rows: [
    '.......',
    'yGg....',
    'G.GGGGg',
    'yGg.G.g',
    '.......',
  ],
};

/** A small gold oak for the tympanum: the family tree the house is built to hold up. 7x5. */
export const wmMarkOak: PixelSprite = {
  id: 'wm-mark-oak',
  name: 'wm-mark-oak',
  tags: ['scene', 'wm'],
  rows: [
    '..yGG..',
    '.yGGGg.',
    '.gGGgg.',
    '...g...',
    '..ggg..',
  ],
};

/* ── the grounds ────────────────────────────────────────────────────────────────────────────── */

/** The family oak: clumped canopy lit from the upper left, a forked trunk, roots. 26x36. */
export const wmOak: PixelSprite = {
  id: 'wm-oak',
  name: 'wm-oak',
  tags: ['scene', 'wm'],
  palette: WM_INKS,
  rows: [
    '.................h........',
    '......hhhhh...hhhHhhh.....',
    '.....hnnHHHh.hnnnHHHHh....',
    '....hnnnHHHHhHnnnnHHHh....',
    '...hnnnnnHHHHHnnnHHHHh....',
    '...hnnnnHHHHHHHnHHHHHhh...',
    '...hHHnHHHHHHHHHHHHHhh....',
    '...hHHHHHHnnnHHHHHHHHHhh..',
    '..hHHHHHHnnnnnHHHHhnnHHHh.',
    '.hnnHHHHHnnnnnHHHHhnnnHHhh',
    'hnnnnHHHHnnnnHHHHHhnnHHHHh',
    'hnnnHHHHHHnnHHHHHhhhHHHHhh',
    'hHnHHHHHHHHHHHHHhhhHHHHhhh',
    'hHHHHHHHHHHHHHHHHHHHHHhhhh',
    'hHHHHHnnHHHHHHnnnHHHHhhhh.',
    '.hHHHnnnnHHHHHnnnnHHhhhh..',
    '..hhHnnnHHHHhHnnnHHHHh....',
    '....hHnHHHHhhHHnHHHHhh....',
    '....hHHHHHhhhHHHHHHhhh....',
    '.....hHHHhhhDhHHHHhhhh....',
    '......hhhXDDDDkhhh........',
    '........hhXDDDkh..........',
    '...........XDDk...........',
    '...........XDDk...........',
    '...........XDDk...........',
    '...........XDDk...........',
    '...........XDDk...........',
    '...........XDDk...........',
    '...........XDDk...........',
    '...........XDDk...........',
    '...........XDDk...........',
    '...........XDDk...........',
    '..........XDDDkk..........',
    '.........XDDDDDkk.........',
    '.......kXDDDDDDDkkk.......',
    '......KKKKKKKKKKKKKK......',
  ],
};

/** A clipped hedge, 12x7. */
export const wmHedge: PixelSprite = {
  id: 'wm-hedge',
  name: 'wm-hedge',
  tags: ['scene', 'wm'],
  palette: WM_INKS,
  rows: [
    '...hhhhh....',
    '.hhHHnHHhh..',
    'hHHnnHHHHHh.',
    'hHnnHHHHHHhh',
    'hHHHHHHHhhhh',
    'hhHHHHhhhhhh',
    '.hhhhhhhhhh.',
  ],
};

/** An iron lamp post. The glass sits at x 1, y 3 (3x3); wmLampFlame lays over it. 5x24. */
export const wmLampPost: PixelSprite = {
  id: 'wm-lamp-post',
  name: 'wm-lamp-post',
  tags: ['scene', 'wm'],
  rows: [
    '..D..',
    '.DXD.',
    'DXxXD',
    'DyGgD',
    'DGyGD',
    'DgGgD',
    'DXXXD',
    '.DXD.',
    '..X..',
    '..X..',
    '..X..',
    '..X..',
    '..X..',
    '..X..',
    '..X..',
    '..X..',
    '..X..',
    '..X..',
    '..X..',
    '..X..',
    '..X..',
    '.DXD.',
    '.DXD.',
    'DDDDD',
  ],
};

/* ── people: three generations and the advisor, front view, lit from the left ───────────────── */

/** The grandmother: silver bun, orchid shawl, a cane in her right hand. 7x12. */
export const wmElder: PixelSprite = {
  id: 'wm-elder',
  name: 'wm-elder',
  tags: ['scene', 'wm'],
  palette: WM_INKS,
  rows: [
    '..xwx..',
    '.xwwwx.',
    '.xCCCx.',
    '.xkCkx.',
    '..CCU..',
    '.pPPPp.',
    'pPqPPpp',
    'CPPPPpU',
    'O.PPpp.',
    'O.PPpp.',
    'O.k..k.',
    'OKK.KK.',
  ],
};

/** The parent: dark hair, blue suit, red tie. 7x13. */
export const wmParent: PixelSprite = {
  id: 'wm-parent',
  name: 'wm-parent',
  tags: ['scene', 'wm'],
  palette: WM_INKS,
  rows: [
    '..kkk..',
    '.kkkkk.',
    '.kCCCk.',
    '.CkCkU.',
    '..CCU..',
    '.bwRwb.',
    'bBBRBbb',
    'BBBRBbb',
    'CBBBBbU',
    '.bBBbb.',
    '.kk.kk.',
    '.kk.kk.',
    '.KK.KK.',
  ],
};

/** The heir: a child in teal. 5x9. */
export const wmChild: PixelSprite = {
  id: 'wm-child',
  name: 'wm-child',
  tags: ['scene', 'wm'],
  palette: WM_INKS,
  rows: [
    '.ggg.',
    'gCCCg',
    'CkCkU',
    '.CCU.',
    'tTTTt',
    'CTTtU',
    '.TTt.',
    '.k.k.',
    'KK.KK',
  ],
};

/** The wealth manager: grey suit, gold tie, a briefcase in the left hand. 9x13. */
export const wmAdvisor: PixelSprite = {
  id: 'wm-advisor',
  name: 'wm-advisor',
  tags: ['scene', 'wm'],
  palette: WM_INKS,
  rows: [
    '..kkk....',
    '.kkkkk...',
    '.kSSSk...',
    '.SkSkM...',
    '..SSM....',
    '.XwGwX...',
    'XxXGXXD..',
    'xXXGXXD..',
    'SXXXXDMO.',
    '.XXXXDOgO',
    '.kk.kkgGg',
    '.kk.kkggO',
    '.KK.KKOOO',
  ],
};

/* ── props for later lessons ────────────────────────────────────────────────────────────────── */

/** A stack of four coins. 7x9. */
export const wmCoinStack: PixelSprite = {
  id: 'wm-coin-stack',
  name: 'wm-coin-stack',
  tags: ['scene', 'wm'],
  rows: [
    '.yyGGg.',
    'yGGGGgg',
    'OgggggO',
    'yGGGGGg',
    'OgggggO',
    'yGGGGGg',
    'OgggggO',
    'yGGGGGg',
    'OOOOOOO',
  ],
};

/** A tied money bag. 9x10. */
export const wmMoneyBag: PixelSprite = {
  id: 'wm-money-bag',
  name: 'wm-money-bag',
  tags: ['scene', 'wm'],
  rows: [
    '..gG.Gg..',
    '...gGg...',
    '...OgO...',
    '..yGGGg..',
    '.yGGGGGg.',
    'yGGyGGGGg',
    'yGGGGGGgg',
    'GGGGGGggg',
    'gGGGGgggO',
    '.OOOOOOO.',
  ],
};

/** A steel safe with a gold dial. 12x12. */
export const wmVault: PixelSprite = {
  id: 'wm-vault',
  name: 'wm-vault',
  tags: ['scene', 'wm'],
  rows: [
    'DDDDDDDDDDDD',
    'DwxxxxxxxxXD',
    'DxXXXXXXXXkD',
    'DxXXyGGgXXkD',
    'DxXyGOOGgXkD',
    'DxXGOyGOgXkD',
    'DxXGOGgOgXkD',
    'DxXgGOOggXkD',
    'DxXXgggOXXkD',
    'DxXXXXXXXXkD',
    'DXkkkkkkkkkD',
    '.DD......DD.',
  ],
};

/** A will or a trust deed: parchment between two rolls, a red wax seal. 11x9. */
export const wmScroll: PixelSprite = {
  id: 'wm-scroll',
  name: 'wm-scroll',
  tags: ['scene', 'wm'],
  rows: [
    '.OgGGGGGgO.',
    'OgGGGGGGGgO',
    '.yyyyyyyyg.',
    '.yOOOOOyyg.',
    '.yyyyyyyyg.',
    '.yOOOOyrRr.',
    '.yyyyyrRRRr',
    'OgGGGGgrRr.',
    '.OgGGGGgO..',
  ],
};

/** An umbrella, for insurance. 11x10. */
export const wmUmbrella: PixelSprite = {
  id: 'wm-umbrella',
  name: 'wm-umbrella',
  tags: ['scene', 'wm'],
  rows: [
    '.....q.....',
    '...qqPPp...',
    '..qPPPPPpp.',
    '.qPPPPPPPpp',
    'qPPPPPPPPpp',
    'pEpEpOpEpEp',
    '.....O.....',
    '.....O.....',
    '.....O..O..',
    '......OO...',
  ],
};

/* ── keepsake emblems: 14x13, gold, centred in the crest's green field (wm1-finish.ts) ──────── */

/** The house of five pillars: lesson 1. */
export const wmEmblemPillars: PixelSprite = {
  id: 'wm-emblem-pillars',
  name: 'wm-emblem-pillars',
  tags: ['scene', 'wm'],
  rows: [
    '......yG......',
    '....yyGGgg....',
    '..yyGGGGGGgg..',
    'yyGGGGGGGGGGgg',
    'gggggggggggggO',
    'yG.yG.yG.yG.yG',
    'yG.yG.yG.yG.yG',
    'yG.yG.yG.yG.yG',
    'yG.yG.yG.yG.yG',
    'yG.yG.yG.yG.yG',
    'yGGGGGGGGGGGGg',
    'gggggggggggggO',
    'OOOOOOOOOOOOOO',
  ],
};

/** A key: estates, trusts, handing on. */
export const wmEmblemKey: PixelSprite = {
  id: 'wm-emblem-key',
  name: 'wm-emblem-key',
  tags: ['scene', 'wm'],
  rows: [
    '.....yGGg.....',
    '....yGOOGg....',
    '....GO..Og....',
    '....GO..Og....',
    '....yGOOGg....',
    '.....gGGg.....',
    '......Gg......',
    '......Gg......',
    '......GgGg....',
    '......Gg......',
    '......GgGGg...',
    '......Gg......',
    '......gO......',
  ],
};

/** An oak: family, generations. */
export const wmEmblemOak: PixelSprite = {
  id: 'wm-emblem-oak',
  name: 'wm-emblem-oak',
  tags: ['scene', 'wm'],
  rows: [
    '.....yyGG.....',
    '...yyGGGGGg...',
    '..yGGyyGGGGg..',
    '.yGGGGGGGGGgg.',
    '.yGGGGGgGGGgg.',
    'yGGGgGGGGGGggg',
    'yGGGGGGGgGgggg',
    '.gGGGGGGGGggg.',
    '..ggOgGgOggO..',
    '.....GgO......',
    '.....GgO......',
    '....yGgOg.....',
    '..ggGg..gOO...',
  ],
};

/** An hourglass: time, retirement. */
export const wmEmblemHourglass: PixelSprite = {
  id: 'wm-emblem-hourglass',
  name: 'wm-emblem-hourglass',
  tags: ['scene', 'wm'],
  rows: [
    'yGGGGGGGGGGGGg',
    '.gggggggggggO.',
    '.y.yGGGGGGg.g.',
    '.y..yGGGGg..g.',
    '.y...yGGg...g.',
    '.y....Gg....g.',
    '.y....Gg....g.',
    '.y.....g....g.',
    '.y...yGGg...g.',
    '.y..yGGGGg..g.',
    '.y.yGGGGGGg.g.',
    '.gggggggggggO.',
    'yGGGGGGGGGGGGg',
  ],
};

/* ── moving bits: layers only, never stamped into a base ────────────────────────────────────── */

/** An orchid pennant on the right of its pole, waving. 6x4. */
export const wmFlag: PixelSprite = {
  id: 'wm-flag',
  name: 'wm-flag',
  tags: ['scene', 'wm'],
  rows: [
    'PPq...',
    'PPPPq.',
    'PPPpp.',
    'Pp....',
  ],
  frames: [
    [
      'PPq...',
      'PPPPq.',
      'PPPpp.',
      'Pp....',
    ],
    [
      'PPPq..',
      'PPPPPq',
      'PPp...',
      'P.....',
    ],
    [
      'PPq...',
      'PPPPq.',
      'PPPpp.',
      'Pp....',
    ],
    [
      'Pq....',
      'PPPq..',
      'PPPPpq',
      'Ppp...',
    ],
  ],
  frameMs: 420,
};

/** The lamp's flame, flickering inside the glass of wmLampPost. 3x3. */
export const wmLampFlame: PixelSprite = {
  id: 'wm-lamp-flame',
  name: 'wm-lamp-flame',
  tags: ['scene', 'wm'],
  rows: [
    'yGg',
    'GyG',
    'gGg',
  ],
  frames: [
    [
      'yGg',
      'GyG',
      'gGg',
    ],
    [
      'Gyg',
      'yWy',
      'gGg',
    ],
    [
      'yyG',
      'GyG',
      'gGg',
    ],
    [
      'Gyg',
      'yyG',
      'ggg',
    ],
  ],
  frameMs: 260,
};

/** Sand running through an hourglass. 7x10. */
export const wmHourglass: PixelSprite = {
  id: 'wm-hourglass',
  name: 'wm-hourglass',
  tags: ['scene', 'wm'],
  rows: [
    'gGGGGGg',
    '.OOOOO.',
    '.xGGGx.',
    '..xGx..',
    '...G...',
    '...G...',
    '..x.x..',
    '.xyGGx.',
    '.OOOOO.',
    'gGGGGGg',
  ],
  frames: [
    [
      'gGGGGGg',
      '.OOOOO.',
      '.xGGGx.',
      '..xGx..',
      '...G...',
      '...G...',
      '..x.x..',
      '.xyGGx.',
      '.OOOOO.',
      'gGGGGGg',
    ],
    [
      'gGGGGGg',
      '.OOOOO.',
      '.x.GGx.',
      '..xGx..',
      '...G...',
      '...y...',
      '..xGx..',
      '.xyGGx.',
      '.OOOOO.',
      'gGGGGGg',
    ],
    [
      'gGGGGGg',
      '.OOOOO.',
      '.x..Gx.',
      '..xGx..',
      '...y...',
      '...G...',
      '..xGx..',
      '.yGGGx.',
      '.OOOOO.',
      'gGGGGGg',
    ],
  ],
  frameMs: 500,
};

/** An X-shaped twinkle with diagonal rays. 5x5. */
export const wmTwinkle: PixelSprite = {
  id: 'wm-twinkle',
  name: 'wm-twinkle',
  tags: ['scene', 'wm'],
  rows: [
    'w...w',
    '.y.y.',
    '..W..',
    '.y.y.',
    'w...w',
  ],
  frames: [
    [
      'w...w',
      '.y.y.',
      '..W..',
      '.y.y.',
      'w...w',
    ],
    [
      '.....',
      '.w.w.',
      '..W..',
      '.w.w.',
      '.....',
    ],
    [
      '.....',
      '.....',
      '..y..',
      '.....',
      '.....',
    ],
    [
      '.....',
      '.y.y.',
      '..w..',
      '.y.y.',
      '.....',
    ],
  ],
  frameMs: 360,
};

/** A firefly with its glow. 3x3. */
export const wmFirefly: PixelSprite = {
  id: 'wm-firefly',
  name: 'wm-firefly',
  tags: ['scene', 'wm'],
  rows: [
    '.n.',
    'nmn',
    '.n.',
  ],
};

/** A small star. 3x3. */
export const wmStar: PixelSprite = {
  id: 'wm-star',
  name: 'wm-star',
  tags: ['scene', 'wm'],
  rows: [
    '.x.',
    'xwx',
    '.x.',
  ],
};

/** A pinpoint star. 1x1. */
export const wmStarDot: PixelSprite = {
  id: 'wm-star-dot',
  name: 'wm-star-dot',
  tags: ['scene', 'wm'],
  rows: [
    'w',
  ],
};

/** A coin mote, for rising. 2x2. */
export const wmCoinMote: PixelSprite = {
  id: 'wm-coin-mote',
  name: 'wm-coin-mote',
  tags: ['scene', 'wm'],
  rows: [
    'yG',
    'Gg',
  ],
};

/** A falling oak leaf, for drifting. 2x2. */
export const wmLeaf: PixelSprite = {
  id: 'wm-leaf',
  name: 'wm-leaf',
  tags: ['scene', 'wm'],
  palette: WM_INKS,
  rows: [
    'nH',
    '.n',
  ],
};
