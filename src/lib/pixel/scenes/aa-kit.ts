/**
 * Applied Accounting art kit: the pieces every lesson of the pathway builds its scenes from.
 *
 * THE WORLD is the ledger hall at night: a bookkeeper's desk under a green banker's lamp, bound
 * ledgers, a brass scale, shelves of volumes. Light comes from the left (the lamp side), the same
 * direction as every other figure in the app, so any piece can be stamped into any scene unshaded.
 *
 * HOW A SCENE USES IT. aaCompose stamps pieces into one still base, back to front, and only the
 * small framed bits at the end ride as moving layers. AA_AT says where each moving bit sits on its
 * piece, so lessons 2 to 25 can place them without re-reading the art. aaText and aaPlaque letter
 * any short word (GAAP, P&L, 1099) in the same 3x5 hand the A=L+E plate uses.
 *
 * NATIVE-OWNED, like everything in scenes/ (CONSTITUTION 5.5).
 */
import type { PixelSprite } from '../types';

/**
 * Colours the shared palette does not carry. Skin and hair stay per-sprite, as the cast's do. Ledger
 * paper is the shared white and grey under letters of its own: a scene with an opaque background is
 * a picture, and the light canvas would otherwise retint the page to #5C5468 and sink the T-account
 * into it. z is the cast shadow, a step under the floor ink.
 */
export const AA_PALETTE: Record<string, string> = {
  S: '#F4CBA4',
  M: '#D6A87C',
  h: '#6B3F24',
  a: '#F2EFF7',
  c: '#A79DB5',
  z: '#100D16',
};

/* ── composing ──────────────────────────────────────────────────────────────────────────────── */

/** A kit piece placed in a scene, by its top-left corner in scene pixels. */
export interface AaPart {
  sprite: PixelSprite;
  x: number;
  y: number;
}

/**
 * Stamps pieces into one still base, back to front. A `.` in a piece lets what is behind it show
 * through, so a lamp stands in front of a bookcase with no box round it; anything past the edge is
 * clipped. Palettes merge, and two pieces that draw one letter in two colours throw, because one of
 * them would otherwise render silently in the other's colour.
 */
export function aaCompose(id: string, width: number, height: number, ground: string, parts: AaPart[]): PixelSprite {
  const cells = Array.from({ length: height }, () => Array.from({ length: width }, () => ground));
  const palette: Record<string, string> = {};
  for (const { sprite, x, y } of parts) {
    for (const [ch, hex] of Object.entries(sprite.palette ?? {})) {
      if (palette[ch] && palette[ch] !== hex) {
        throw new Error(`${id}: ${sprite.id} draws "${ch}" as ${hex}, an earlier piece as ${palette[ch]}`);
      }
      palette[ch] = hex;
    }
    sprite.rows.forEach((row, dy) => {
      const gy = y + dy;
      if (gy < 0 || gy >= height) return;
      for (let dx = 0; dx < row.length; dx++) {
        const gx = x + dx;
        if (row[dx] !== '.' && gx >= 0 && gx < width) cells[gy][gx] = row[dx];
      }
    });
  }
  return {
    id,
    name: id,
    tags: ['scene', 'aa'],
    ...(Object.keys(palette).length ? { palette } : {}),
    rows: cells.map((r) => r.join('')),
  };
}

/**
 * The same framed bit starting elsewhere in its loop, at its own pace. Frames tick from mount with no
 * offset (PixelSpriteView), so two layers sharing one sprite would flash in step; a twinkle `phase`
 * moves only opacity, never the shape.
 */
export function aaOffsetFrames(sprite: PixelSprite, id: string, by: number, frameMs: number): PixelSprite {
  const frames = sprite.frames ?? [sprite.rows];
  const k = by % frames.length;
  return { ...sprite, id, name: id, frames: [...frames.slice(k), ...frames.slice(0, k)], frameMs };
}

/* ── lettering ──────────────────────────────────────────────────────────────────────────────── */

/** A 3x5 hand, upper case only: plates, charters and ledger labels across the pathway. */
const GLYPHS: Record<string, string[]> = {
  A: ['.#.', '#.#', '###', '#.#', '#.#'], B: ['##.', '#.#', '##.', '#.#', '##.'],
  C: ['.##', '#..', '#..', '#..', '.##'], D: ['##.', '#.#', '#.#', '#.#', '##.'],
  E: ['###', '#..', '##.', '#..', '###'], F: ['###', '#..', '##.', '#..', '#..'],
  G: ['.##', '#..', '#.#', '#.#', '.##'], H: ['#.#', '#.#', '###', '#.#', '#.#'],
  I: ['###', '.#.', '.#.', '.#.', '###'], J: ['..#', '..#', '..#', '#.#', '.#.'],
  K: ['#.#', '#.#', '##.', '#.#', '#.#'], L: ['#..', '#..', '#..', '#..', '###'],
  M: ['#.#', '###', '###', '#.#', '#.#'], N: ['##.', '#.#', '#.#', '#.#', '#.#'],
  O: ['.#.', '#.#', '#.#', '#.#', '.#.'], P: ['##.', '#.#', '##.', '#..', '#..'],
  Q: ['.#.', '#.#', '#.#', '##.', '.##'], R: ['##.', '#.#', '##.', '#.#', '#.#'],
  S: ['.##', '#..', '.#.', '..#', '##.'], T: ['###', '.#.', '.#.', '.#.', '.#.'],
  U: ['#.#', '#.#', '#.#', '#.#', '###'], V: ['#.#', '#.#', '#.#', '#.#', '.#.'],
  W: ['#.#', '#.#', '###', '###', '#.#'], X: ['#.#', '#.#', '.#.', '#.#', '#.#'],
  Y: ['#.#', '#.#', '.#.', '.#.', '.#.'], Z: ['###', '..#', '.#.', '#..', '###'],
  0: ['###', '#.#', '#.#', '#.#', '###'], 1: ['.#.', '##.', '.#.', '.#.', '###'],
  2: ['##.', '..#', '.#.', '#..', '###'], 3: ['##.', '..#', '.#.', '..#', '##.'],
  4: ['#.#', '#.#', '###', '..#', '..#'], 5: ['###', '#..', '##.', '..#', '##.'],
  6: ['.##', '#..', '###', '#.#', '###'], 7: ['###', '..#', '.#.', '.#.', '.#.'],
  8: ['###', '#.#', '###', '#.#', '###'], 9: ['###', '#.#', '###', '..#', '##.'],
  '=': ['...', '###', '...', '###', '...'], '+': ['...', '.#.', '###', '.#.', '...'],
  '-': ['...', '...', '###', '...', '...'], '$': ['.##', '##.', '.#.', '.##', '##.'],
  '%': ['#.#', '..#', '.#.', '#..', '#.#'], '&': ['.#.', '#..', '.##', '#.#', '.##'],
  '/': ['..#', '..#', '.#.', '#..', '#..'], '.': ['...', '...', '...', '...', '.#.'],
  ' ': ['...', '...', '...', '...', '...'],
};

/** Letters a short text in `ink`, one transparent column between glyphs. Throws on a glyph it lacks. */
export function aaText(id: string, text: string, ink: string): PixelSprite {
  const glyphs = [...text.toUpperCase()].map((ch) => {
    const g = GLYPHS[ch];
    if (!g) throw new Error(`${id}: no glyph for "${ch}"`);
    return g;
  });
  return {
    id,
    name: id,
    tags: ['aa', 'text'],
    rows: [0, 1, 2, 3, 4].map((r) => glyphs.map((g) => g[r].replace(/#/g, ink)).join('.')),
  };
}

/** An engraved brass plate: dark letters cut into polished brass, 9 tall and the text's width + 4. */
export function aaPlaque(id: string, text: string): PixelSprite {
  const t = aaText(`${id}-text`, text, 'K').rows;
  const w = t[0].length + 4;
  return {
    id,
    name: id,
    tags: ['aa', 'prop'],
    rows: [
      'O'.repeat(w),
      `O${'y'.repeat(w - 2)}O`,
      ...t.map((r) => `OG${r.replace(/\./g, 'G')}GO`),
      `O${'g'.repeat(w - 2)}O`,
      'O'.repeat(w),
    ],
  };
}

/** A framed parchment: the text inked at the top, two lines of script and a red wax seal. 14 tall. */
export function aaCharter(id: string, text: string): PixelSprite {
  const t = aaText(`${id}-text`, text, 'O').rows;
  const w = t[0].length + 4;
  const cells: string[][] = Array.from({ length: 14 }, (_, y) =>
    Array.from({ length: w }, (_, x) => (y === 0 || y === 13 || x === 0 || x === w - 1 ? 'O' : '5')));
  t.forEach((r, y) => [...r].forEach((ch, x) => { if (ch !== '.') cells[y + 2][x + 2] = ch; }));
  for (let x = 2; x < w - 7; x++) cells[8][x] = 'g';
  for (let x = 2; x < w - 9; x++) cells[10][x] = 'g';
  ['.22.', '2R22', '2222', '.22.'].forEach((r, dy) => [...r].forEach((ch, dx) => {
    if (ch !== '.') cells[9 + dy][w - 7 + dx] = ch;
  }));
  return { id, name: id, tags: ['aa', 'prop'], rows: cells.map((r) => r.join('')) };
}

/* ── the room ───────────────────────────────────────────────────────────────────────────────── */

/**
 * A tall bookcase of ledgers, 16 x 46: gilt-banded spines, a flat stack, a matched set of four
 * volumes.
 */
export const aaBookcase: PixelSprite = {
  id: 'aa-bookcase',
  name: 'aa-bookcase',
  tags: ['aa', 'prop'],
  rows: [
    'OOOOOOOOOOOOOOOO',
    'OyGGGGGGGGGGGGgO',
    'OggggggggggggggO',
    'OOOOOOOOOOOOOOOO',
    'OgKKKKKKKKKKKKKO',
    'OgPpKRrKBbKKTKKO',
    'OgyGNyGKBbGgTfIO',
    'OgPpNRrxBbGgTfIO',
    'OgPpNRrxyGGgTfIO',
    'OgPpNRrxBbGgTfIO',
    'OgPpNRrxBbGgTfIO',
    'OggggggggggggggO',
    'OgKKKKKKKKKKKKKO',
    'OgqPpqPpqPpqPpKO',
    'OgyGgyGgyGgyGgKO',
    'OgqPpqPpqPpqPpKO',
    'OgqwpqwpqwpqwpKO',
    'OgyGgyGgyGgyGgKO',
    'OgqPpqPpqPpqPpKO',
    'OggggggggggggggO',
    'OgKKKKKKKKKKKKKO',
    'OgKGGgKNnKKKTtKO',
    'OgKgggKNnPpKTtKO',
    'OgNNNnKyGPpKTtGO',
    'OgnnnnKNnyGKyGGO',
    'OgRRRRrNnPpKTtGO',
    'OgrrrrrNnPpKTtgO',
    'OggggggggggggggO',
    'OgKKKKKKKKKKKKKO',
    'OgPpKRrKBbKKTKKO',
    'OgyGNyGKBbGgTfIO',
    'OgPpNRrxBbGgTfIO',
    'OgPpNRrxyGGgTfIO',
    'OgPpNRrxBbGgTfIO',
    'OgPpNRrxBbGgTfIO',
    'OggggggggggggggO',
    'OgKKKKKKKKKKKKKO',
    'OgKKKKRrKKNnKKKO',
    'OgxxXKRrBbNnKxXO',
    'OgxwXKRrBbNnDxXO',
    'OgxxXKRrBbNnDxXO',
    'OgxxXKyGBbNnDxXO',
    'OgxxXKRrBbNnDxXO',
    'OggggggggggggggO',
    'OOOOOOOOOOOOOOOO',
    'OOOOOOOOOOOOOOOO',
  ],
};

/**
 * A pedestal desk, 72 x 21: green leather top, brass-handled drawers, a dark kneehole. Things stand
 * on rows 1 to 8.
 */
export const aaDesk: PixelSprite = {
  id: 'aa-desk',
  name: 'aa-desk',
  tags: ['aa', 'prop'],
  palette: AA_PALETTE,
  rows: [
    'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
    'OggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggO',
    'OgnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnngO',
    'OgnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnngO',
    'OgnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnngO',
    'OgnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnngO',
    'OgnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnngO',
    'OgnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnngO',
    'OggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggO',
    'yGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGg',
    'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
    'OgggggggggggggggggOgggggggggggggggggggggggggggggggggggggggggggggggggggOO',
    'OgOOOOOOOyyOOOOOOOOOOOOOOOOOOOOOOOOyyOOOOOOOOOOOOOOOOgOOOOOOOyyOOOOOOOOO',
    'OgOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOgOOOOOOOOOOOOOOOOOO',
    'OgggggggggggggggggOzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzgggggggggggggggggOO',
    'OgOOOOOOOyyOOOOOOOOzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzgOOOOOOOyyOOOOOOOOO',
    'OgOOOOOOOOOOOOOOOOOzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzgOOOOOOOOOOOOOOOOOO',
    'OgggggggggggggggggOzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzgggggggggggggggggOO',
    'OOOOOOOOOOOOOOOOOOOzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzOOOOOOOOOOOOOOOOOOO',
    'OOOOOOOOOOOOOOOOOOOzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzOOOOOOOOOOOOOOOOOOO',
    'OOOOOOOOOOOOOOOOOOOzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzOOOOOOOOOOOOOOOOOOO',
  ],
};

/* ── on the desk ────────────────────────────────────────────────────────────────────────────── */

/**
 * An open ledger, 35 x 14: a written journal page on the left, an empty T-account ruled across the
 * right.
 */
export const aaLedgerOpen: PixelSprite = {
  id: 'aa-ledger-open',
  name: 'aa-ledger-open',
  tags: ['aa', 'prop'],
  palette: AA_PALETTE,
  rows: [
    '.aaaaaaaaaaaaaaa...aaaaaaaaaaaaaaa.',
    'PaaraaaaaaaaaaaacXcaaaaaaaaaaaaaaap',
    'PaaraXXXXXXXaaaacXcakkkkkkkkkkkkkap',
    'PaaraaaaaaaaaaaacXcaaaaaaakaaaaaaap',
    'PaaraXXXXXaaaXXacXcaaaaaaakaaaaaaap',
    'PaaraaaaaaaaaaaacXcaaaaaaakaaaaaaap',
    'PaaraXXXXXXaaXXacXcaaaaaaakaaaaaaap',
    'PaaraaaaaaaaaaaacXcaaaaaaakaaaaaaap',
    'PaaraXXXXaaaaXXacXcaaaaaaakaaaaaaap',
    'PaaraaaaaaaaaaaacXcaaaaaaakaaaaaaap',
    'PaaraaaaaaaaaaaacXcaaaaaaakaaaaaaap',
    'PccccccccccccccccXccccccccccccccccp',
    'EPPPPPPPPPPPPPPPPpppppppppppppppppE',
    '.EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE.',
  ],
};

/** A banker's lamp, 13 x 14: green glass shade, brass stem and pull chain, lit underneath. */
export const aaBankersLamp: PixelSprite = {
  id: 'aa-bankers-lamp',
  name: 'aa-bankers-lamp',
  tags: ['aa', 'prop'],
  rows: [
    '...nNNNNNn...',
    '..nNmmNNNn...',
    '.nNmNNNNNNNn.',
    'nNNNNNNNNNNNn',
    'ttnnnnnnnnntt',
    '.Gy4444444yG.',
    '......Gg.....',
    '......Gg..O..',
    '......Gg..O..',
    '......Gg..y..',
    '......Gg.....',
    '....OGGGgO...',
    '..OGyGGGGGgO.',
    '..OOOOOOOOOO.',
  ],
};

export const aaInkwell: PixelSprite = {
  id: 'aa-inkwell',
  name: 'aa-inkwell',
  tags: ['aa', 'prop'],
  rows: [
    '.kXk.',
    'DkKkD',
    'DxKKD',
    'DKKKD',
    '.DDD.',
  ],
};

/** A brass balance scale, 18 x 16, level, a coin bar in each pan. */
export const aaScale: PixelSprite = {
  id: 'aa-scale',
  name: 'aa-scale',
  tags: ['aa', 'prop'],
  rows: [
    '........yG........',
    '.gGGGGGGGGGGGGGGg.',
    '..O.....Gg.....O..',
    '..O.....Gg.....O..',
    '.O.O....Gg....O.O.',
    '.O.O....Gg....O.O.',
    'O...O...Gg...O...O',
    'OyGgO...Gg...OyGgO',
    'OGGGO...Gg...OGGGO',
    '.OgO....Gg....OgO.',
    '........Gg........',
    '........Gg........',
    '......OGGGgO......',
    '.....OGGGGGgO.....',
    '....OyGGGGGGgO....',
    '....OOOOOOOOOO....',
  ],
};

/* ── the bookkeeper ─────────────────────────────────────────────────────────────────────────── */

/**
 * The bookkeeper, 18 x 20, seated, front on: green eyeshade, orchid jumper, red tie. A desk or
 * ledger hides the waist.
 */
export const aaBookkeeper: PixelSprite = {
  id: 'aa-bookkeeper',
  name: 'aa-bookkeeper',
  tags: ['aa', 'character'],
  palette: AA_PALETTE,
  rows: [
    '......hhhhhh......',
    '....hhhhhhhhhh....',
    '...hhhhhhhhhhhh...',
    '..mNNNNNNNNNNNNn..',
    '.mNNNNNNNNNNNNNNn.',
    '..nnnnnnnnnnnnnn..',
    '...hMMMMMMMMMMh...',
    '...hSkkSSSSkkMh...',
    '...SSWKSSSSWKMM...',
    '..SSSSSSSSSSSMMM..',
    '...SSSSSSSSSSMM...',
    '....SSSkSSkSMM....',
    '.....SSSkkSMM.....',
    '......SSSSMM......',
    '.......SSMM.......',
    '....PPwwrrwwpp....',
    '.PPPPPPwrrwpppppp.',
    'PPPpPPPPrrpppEppp.',
    'PPPpPPPPrPpppEppp.',
    'PPPpPPPPPPpppEppp.',
  ],
};

/** The bookkeeper's other hand, flat on a page (AA_AT.handOnLedger). */
export const aaHandRest: PixelSprite = {
  id: 'aa-hand-rest',
  name: 'aa-hand-rest',
  tags: ['aa', 'character'],
  palette: AA_PALETTE,
  rows: [
    'PPp',
    'PPp',
    'SSM',
    'SMM',
  ],
};

/* ── moving bits ────────────────────────────────────────────────────────────────────────────── */

/**
 * The quill at work on the ledger's T-account: a debit, then its matching credit, twice, then both
 * columns rule off and flash green. Still = the finished page.
 */
export const aaQuillWriting: PixelSprite = {
  id: 'aa-quill-writing',
  name: 'aa-quill-writing',
  tags: ['aa', 'motion'],
  palette: AA_PALETTE,
  rows: [
    '....................',
    '....PPpp............',
    '......PPppp.....yG..',
    '.........PPpp..yG...',
    '...........PPppg....',
    '.bbbbb...bbbbSM.....',
    '.............SM.....',
    '.bbbb....bbbk.......',
    '....................',
    '.kkkkk...kkkkk......',
    '....................',
    '.kkkkk...kkkkk......',
  ],
  frames: [
    [
      '.........yG.........',
      '....Ppp.yG..........',
      '.....Pppg...........',
      '......SM............',
      '......SM............',
      '.....k..............',
      '....................',
      '....................',
      '....................',
      '....................',
      '....................',
      '....................',
    ],
    [
      '.........yG.........',
      '....Ppp.yG..........',
      '.....Pppg...........',
      '......SM............',
      '......SM............',
      '.bbbbk..............',
      '....................',
      '....................',
      '....................',
      '....................',
      '....................',
      '....................',
    ],
    [
      '.................yG.',
      '....PPPPPPPPPP..yG..',
      '.....pppppppppppg...',
      '..............SM....',
      '..............SM....',
      '.bbbbb...bbbbk......',
      '....................',
      '....................',
      '....................',
      '....................',
      '....................',
      '....................',
    ],
    [
      '....................',
      '....Ppp.............',
      '....Ppp.yG..........',
      '.....PpyG...........',
      '.....Ppg............',
      '.bbbbSM..bbbbb......',
      '.....SM.............',
      '.bbbk...............',
      '....................',
      '....................',
      '....................',
      '....................',
    ],
    [
      '....................',
      '....PPpp............',
      '......PPppp.....yG..',
      '.........PPpp..yG...',
      '...........PPppg....',
      '.bbbbb...bbbbSM.....',
      '.............SM.....',
      '.bbbb....bbbk.......',
      '....................',
      '....................',
      '....................',
      '....................',
    ],
    [
      '....................',
      '....PPpp............',
      '......PPppp.....yG..',
      '.........PPpp..yG...',
      '...........PPppg....',
      '.bbbbb...bbbbSM.....',
      '.............SM.....',
      '.bbbb....bbbk.......',
      '....................',
      '.kkkkk...kkkkk......',
      '....................',
      '.kkkkk...kkkkk......',
    ],
    [
      '....................',
      '....PPpp............',
      '......PPppp.....yG..',
      '.........PPpp..yG...',
      '...........PPppg....',
      '.bbbbb...bbbbSM.....',
      '.............SM.....',
      '.bbbb....bbbk.......',
      '....................',
      '.nnnnn...nnnnn......',
      '....................',
      '.nnnnn...nnnnn......',
    ],
  ],
  frameMs: 520,
};

/** The bookkeeper's blink, over the eyes (AA_AT.blinkOnBookkeeper). Still = eyes open. */
export const aaBlink: PixelSprite = {
  id: 'aa-blink',
  name: 'aa-blink',
  tags: ['aa', 'motion'],
  palette: AA_PALETTE,
  rows: [
    '........',
    '........',
  ],
  frames: [
    [
      '........',
      '........',
    ],
    [
      '........',
      '........',
    ],
    [
      '........',
      '........',
    ],
    [
      '........',
      '........',
    ],
    [
      '........',
      '........',
    ],
    [
      '........',
      '........',
    ],
    [
      '........',
      '........',
    ],
    [
      '........',
      '........',
    ],
    [
      '........',
      '........',
    ],
    [
      'SS....SS',
      'kk....kk',
    ],
  ],
  frameMs: 300,
};

/**
 * One coin drops into each pan of aaScale at the same moment and the beam stays level: every entry
 * has two sides.
 */
export const aaCoinDrop: PixelSprite = {
  id: 'aa-coin-drop',
  name: 'aa-coin-drop',
  tags: ['aa', 'motion'],
  rows: [
    '..................',
    '..................',
    '..................',
    '..................',
  ],
  frames: [
    [
      '..................',
      '..................',
      '..................',
      '..................',
    ],
    [
      '..................',
      '..y............y..',
      '..................',
      '..................',
    ],
    [
      '..................',
      '..................',
      '..y............y..',
      '..................',
    ],
    [
      '..................',
      '..................',
      '..................',
      '.yGg..........yGg.',
    ],
    [
      '..................',
      '..................',
      '..................',
      '.yWg..........yWg.',
    ],
    [
      '..................',
      '..................',
      '..................',
      '..................',
    ],
    [
      '..................',
      '..................',
      '..................',
      '..................',
    ],
    [
      '..................',
      '..................',
      '..................',
      '..................',
    ],
  ],
  frameMs: 280,
};

/**
 * The bulb's light under aaBankersLamp's shade, for a slow twinkle (AA_AT.glowInLamp): the lamp
 * breathes.
 */
export const aaLampGlow: PixelSprite = {
  id: 'aa-lamp-glow',
  name: 'aa-lamp-glow',
  tags: ['aa', 'motion'],
  rows: [
    '5555555',
  ],
};

export const aaMote: PixelSprite = {
  id: 'aa-mote',
  name: 'aa-mote',
  tags: ['aa', 'motion'],
  rows: [
    'y',
  ],
};

/** An auditor's tick, for rising through a scene. */
export const aaTick: PixelSprite = {
  id: 'aa-tick',
  name: 'aa-tick',
  tags: ['aa', 'motion'],
  rows: [
    '...m',
    'N.N.',
    '.N..',
  ],
};

/** Light catching gilt: a point that opens into a cross and closes again. */
export const aaGlint: PixelSprite = {
  id: 'aa-glint',
  name: 'aa-glint',
  tags: ['aa', 'motion'],
  rows: [
    '.....',
    '..y..',
    '.yWy.',
    '..y..',
    '.....',
  ],
  frames: [
    [
      '.....',
      '.....',
      '..w..',
      '.....',
      '.....',
    ],
    [
      '.....',
      '..y..',
      '.yWy.',
      '..y..',
      '.....',
    ],
    [
      'y...y',
      '.w.w.',
      '..W..',
      '.w.w.',
      'y...y',
    ],
    [
      '.....',
      '.y.y.',
      '..W..',
      '.y.y.',
      '.....',
    ],
    [
      '.....',
      '.....',
      '..w..',
      '.....',
      '.....',
    ],
    [
      '.....',
      '.....',
      '.....',
      '.....',
      '.....',
    ],
    [
      '.....',
      '.....',
      '.....',
      '.....',
      '.....',
    ],
    [
      '.....',
      '.....',
      '.....',
      '.....',
      '.....',
    ],
  ],
  frameMs: 240,
};

/* ── emblems: one per lesson, 16 x 16 at most, for the keepsake plate (aa1-finish.ts) ───────── */

/** Lesson 1: a gilt T-account, two entries a side and both columns double-ruled. */
export const aaEmblemTAccount: PixelSprite = {
  id: 'aa-emblem-t-account',
  name: 'aa-emblem-t-account',
  tags: ['aa', 'emblem'],
  rows: [
    '................',
    '.OOOOOOOOOOOOOO.',
    '.OyyyyyyyyyyyyO.',
    '.OGGGGGGGGGGGGO.',
    '.OOOOOOyGOOOOOO.',
    '......OyGO......',
    '.GGGG.OyGO.GGGG.',
    '......OyGO......',
    '.GGG..OyGO.GGG..',
    '......OyGO......',
    '.yyyy.OyGO.yyyy.',
    '......OyGO......',
    '.yyyy.OyGO.yyyy.',
    '......OyGO......',
    '......OOOO......',
    '................',
  ],
};

/** Where each moving bit sits, relative to the top-left of the piece it belongs to. */
export const AA_AT = {
  quillOnLedger: { x: 19, y: -1 },
  bookkeeperOverLedger: { x: 8, y: -19 },
  handOnLedger: { x: 8, y: 0 },
  blinkOnBookkeeper: { x: 5, y: 7 },
  coinsOnScale: { x: 0, y: 3 },
  glowInLamp: { x: 3, y: 5 },
} as const;
