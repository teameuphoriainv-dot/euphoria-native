/**
 * if-kit: the Investing Fundamentals art kit. The pathway's world is a night orchard where money is
 * planted and grows: a coin goes into the soil, a sprout comes up, and each tree down the row is
 * taller and heavier with coins than the last. That is the course's argument (time does most of the
 * work) drawn as a place. Lesson 1 drew the kit; lessons 2 to 25 compose their art from it.
 *
 * COMPOSED, NOT COPIED. An opener's base is ifCompose(...) over the stage and kit props instead of
 * eighty hand-copied rows: twenty-five openers that each carry their own copy of the money tree
 * drift apart the first time one is touched up. A still prop is stamped into the base (it costs no
 * layer); only small things that move are layers.
 *
 * ONE PALETTE FOR THE KIT. IF_PALETTE adds what the shared palette has no ramp for: wood, soil, the
 * investor's skin and hair, and a night-foliage ramp. Every kit sprite that uses one carries the same
 * object, so a key means one colour across the kit and ifCompose can merge them (it throws if two
 * stamps disagree). The night foliage (v V L), the dark wood (a A) and all three soils sit under
 * luminance 0.15, so the backdrop can use them behind text; h and the skin tones cannot.
 *
 * LIGHT COMES FROM THE LEFT, as on every figure in the app (sprites-characters.ts): highlights on
 * upper-left edges, shadow on the lower right. ifFlip mirrors a sprite and its lighting with it, so
 * use it for background pieces, not a lit hero.
 *
 * NATIVE-OWNED (CONSTITUTION 5.5): nothing here is synced from the web repo.
 */
import type { PixelSprite } from '../types';
import type { SceneArt, SceneMotion } from './types';

export const IF_PALETTE: Record<string, string> = {
  // Wood: trunks, posts, the lantern post, the acorn cap.
  a: '#4A2C19',
  A: '#7B5233',
  h: '#A87A4D',
  // Soil: the tilled bed.
  d: '#24170F',
  e: '#4B3324',
  c: '#6E4C33',
  // The investor: the cast's medium skin tone and its shadow (sprites-characters.ts), and hair.
  C: '#C08552',
  U: '#9A6638',
  H: '#3A2418',
  // Night foliage: far hills, the field, the orchard behind the backdrop's fence.
  v: '#0E2218',
  V: '#183A28',
  L: '#25533A',
};

/* ── composing ─────────────────────────────────────────────────────────────────────────────────── */

/** One placement for ifCompose: a sprite with its top-left corner at (x, y), in scene pixels. */
export interface IfStamp {
  sprite: PixelSprite;
  x: number;
  y: number;
}

/**
 * Lays sprites onto one still base, in order, later over earlier. Transparent pixels let what is
 * under them show, and anything past the edge is clipped, so a tree may stand half out of frame. A
 * stamp is its still `rows`: frames are ignored, because anything that moves belongs in a layer.
 */
export function ifCompose(id: string, width: number, height: number, stamps: readonly IfStamp[]): PixelSprite {
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
  return { id, name: id, tags: ['scene', 'if'], palette, rows: cells.map((line) => line.join('')) };
}

/**
 * The same framed sprite starting elsewhere in its cycle and at its own pace. Frames tick from mount
 * with no offset (PixelSpriteView), so two layers sharing one sprite would flash in step; a twinkle
 * `phase` only offsets opacity, never the shape.
 */
export function ifLater(sprite: PixelSprite, id: string, by: number, frameMs: number): PixelSprite {
  const frames = sprite.frames ?? [sprite.rows];
  return { ...sprite, id, name: id, frames: [...frames.slice(by), ...frames.slice(0, by)], frameMs };
}

/** A sprite mirrored left to right, frames too. Its light then comes from the right (see above). */
export function ifFlip(sprite: PixelSprite, id: string): PixelSprite {
  const flip = (rows: string[]) => rows.map((row) => [...row].reverse().join(''));
  return { ...sprite, id, name: id, rows: flip(sprite.rows), ...(sprite.frames ? { frames: sprite.frames.map(flip) } : {}) };
}

/* ── the stage ─────────────────────────────────────────────────────────────────────────────────── */

export const ifStage: PixelSprite = {
  id: 'if-stage',
  name: 'if-stage',
  tags: ['scene', 'if'],
  blurb: "Every opener's ground, 80x60: a dusk sky going orchid at the horizon, a full moon with its halo, far hills, a moonlit field.",
  palette: IF_PALETTE,
  rows: [
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkEEEEEEkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkEEEEEEEEEEkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkEEEEEwwEEEEEkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkEEEwwwwwwEEEkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkEEEwwwwwwQwEEEkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkEEEwwxwwwwwEEEkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkEEwwwwwwwwQQEEkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkEEwwxwwwwQQQEEkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkEEEwwwwwxQQEEEkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkEEEwwwxwQQQEEEkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkEEEwwwQQQEEEkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkEEEEEQQEEEEEkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkEEEEEEEEEEkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkEEEEEEkkkkkkkkkkkkkkkkkkkkkkkkkkkkkEEEEEEEEEkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkEEEEEEEEEEEEEEEEEEEEEEEEkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE',
    'EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE',
    'EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE',
    'EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE',
    'EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE',
    'EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEvvEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE',
    'EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEvvvvEEEEEEEEEEEEEEEEEEEEEEEEEppppppppppppppvvEEEE',
    'EEEEEEppppppppppppppppppppEEEEEvvvvEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEvvvvEEE',
    'EEEEEEEEEEEEEEEEEEvvEEEEEEEEEEEvvvvvEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEvvvvvv',
    'EEEEEEEEEEEEEEEEEvvvvEEEEEEEEEvvvvvvvvvEEEEEEEEEEEEEEEEEEEEEEEEEEvvEEEEEvvvvvvvv',
    'pppppppppppppppvvvvvpppppppvvvvvvvvvvvvvppppppppppppppppppppppppvvvvppvvvvvvvvvv',
    'pppvvpppppppvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvpppvvvvpppppppvvvvppppvvvvvvvvvvvvvvvv',
    'ppvvvvppppvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvpvvvvpppvvvvvvvvvvvvvvvvvvvvvvvvvvvv',
    'vvvvvvppvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv',
    'vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv',
    'vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv',
    'vvvvvvvvvvLLLLLLLvvvvvvvvvvvvvvvvvvvvvvvvvvvvvLLLLLvvvvvvvvvvvvvvvvvvvvvvvvvvvvv',
    'vvvvvvvvLLVVVVVVVVLvvvvvvvvvvvvvvvvvvvvvvvvLLLVVVVVVLLLvvvvvvvvvvvvvvvvvvvvvvvvL',
    'vvvvvLLLVVVVVVVVVVVVLLvvvvvvvvvvvvvvvvvvvvLVVVVVVVVVVVVVLLLLLLLLLLvvvvvvvvvvvLLV',
    'VLLLLVVVVVVVVVVVVVVVVVVLLLLLLLLLLLLvvvvLLLVVVVVVVVVVVVVVVVVVVVVVVVVLLvvvvvvLLVVV',
    'VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVLLLVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVLLLLLVVVVV',
    'VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV',
    'VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV',
    'nVVVVVVVVVVnVVVVVVVVVVnVVVVVVVVVVnVVVVVVVVVVnVVVVVVVVVVnVVVVVVVVVVnVVVVVVVVVVnVV',
    'LnnLnnnLnnLnnnLnnLnnnLnnLnnnLnnLnnnLnnLnnnLnnLnnnLnnLnnnLnnLnnnLnnLnnnLnnLnnnLnn',
    'VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV',
    'VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV',
    'VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV',
    'VVVVVVVnVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV',
    'VVVVVVLVLVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV',
    'VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVnVVVVVVV',
    'VVVVVVVVVVVVVVVVVVVVVVVVVVVVnVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVLVLVVVVVV',
    'VVVVVVVVVQVVVVVVVVVVVVVVVVVLVLVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV',
    'vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvnvvvvvvvvvvvvvvvvvvvv',
    'vvvvvvvvvvvvvvvvnvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvLvLvvvvvvvvvvvvvQvvvvv',
    'vvvvvvvvvvvvvvvLvLvvvvvvvvvvvvvvvvvvvvvvvnvvvvvvvQvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv',
    'vvvnvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvnvvvvLvLvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvnv',
    'vvLvLvvvvvvvvvvvvvvvvyvvvvvvvvvvvvLvLvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvLvL',
    'vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvyvvvvvvvvvvvvvvv',
    'vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv',
  ],
};

export const ifBed: PixelSprite = {
  id: 'if-bed',
  name: 'if-bed',
  tags: ['scene', 'if'],
  blurb: "A tilled bed for a planted row, 56x4. Plants stand with their last row on its top edge.",
  palette: IF_PALETTE,
  rows: [
    '.cccccccccccccccccccccccccccccccccccccccccccccccccccccc.',
    'eeeddeeeeddeeeeddeeeeddeeeeddeeeeddeeeeddeeeeddeeeeddeee',
    'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    '.dddddddddddddddddddddddddddddddddddddddddddddddddddddd.',
  ],
};

/* ── plants, smallest to tallest: heights 5, 13, 21, 34, so the row itself compounds ────────────── */

export const ifSprout: PixelSprite = {
  id: 'if-sprout',
  name: 'if-sprout',
  tags: ['scene', 'if'],
  blurb: "Two leaves just out of the soil.",
  palette: IF_PALETTE,
  rows: [
    '.mN.Nn.',
    'mNNnNNn',
    '.mNnNn.',
    '...n...',
    '..ene..',
  ],
};

export const ifSapling: PixelSprite = {
  id: 'if-sapling',
  name: 'if-sapling',
  tags: ['scene', 'if'],
  blurb: "A first-year tree: leaves, no fruit yet.",
  palette: IF_PALETTE,
  rows: [
    '...mmm...',
    '..mmmNN..',
    '.mmNNNNn.',
    '.mmNNmmN.',
    'mmNNmNNNn',
    'mNNnNNNnn',
    'NNnnNNnnV',
    '.nnVAnVV.',
    '....A....',
    '....A....',
    '....A....',
    '....A....',
    '...aAa...',
  ],
};

export const ifYoungTree: PixelSprite = {
  id: 'if-young-tree',
  name: 'if-young-tree',
  tags: ['scene', 'if'],
  blurb: "A young tree with its first two coins.",
  palette: IF_PALETTE,
  rows: [
    '......mm......',
    '....mmmmNN....',
    '...mmmmNNNN...',
    '...mmNNNNOO...',
    '..mmNNNNOyGO..',
    '.mmmmNNNOGgON.',
    '.mmOOmmmNOONN.',
    'mmOyGONNNNNNnn',
    'mNOGgONNNNnnnn',
    '.NNOONNNnnnnV.',
    '.NnNNNNnnnVVV.',
    '....NNnnnV....',
    '.....nnnV.....',
    '......ha......',
    '......ha......',
    '......ha......',
    '......ha......',
    '......ha......',
    '......ha......',
    '......ha......',
    '.....hhaa.....',
  ],
};

export const ifMoneyTree: PixelSprite = {
  id: 'if-money-tree',
  name: 'if-money-tree',
  tags: ['scene', 'if'],
  blurb: "The grown tree, hung with six coins. The pathway's hero prop.",
  palette: IF_PALETTE,
  rows: [
    '..........mmmm..........',
    '........mmmmmmNN........',
    '.......mmmmmNNNNN.......',
    '......mmmmNNNNNOON......',
    '......mmmNNNNNOyGO......',
    '...mmmmmmmmmmmOGgOmmN...',
    '..mmmmmNmmmmmmNOOmNNNN..',
    '.mmmmNNmmmmmmNNNNNNNNNN.',
    '.mmmNOOmmmNNNNNNNNNNNNn.',
    '.mmNOyGOmNNNNNNNNNnNNnn.',
    'mmNNOGgONNNNNNNNnnnOOnnn',
    '.NNNNOONNNNNNNNnnnOyGOn.',
    '.NNmmmmmNNNNNNnmmmOGgOV.',
    '.NmmmmNNNmOOmmNmmmNOONV.',
    '.mmmNNNNmOyGONNNNNNNNNn.',
    '.mmNNNNmmOGgONNNNNNNNnn.',
    '.mNNOONmmNOONNNNnNNNnnn.',
    '.NNOyGOmmNNNNNNnnNnnnnn.',
    '.NNOGgONNNNNNnnOOnnnnVV.',
    '..NNOOnNNNNNnnOyGOnnVV..',
    '...nnnnNNNnnnnOGgOnVV...',
    '........NnnnnnVOO.......',
    '.........nnnnVV.........',
    '..........hAAa..........',
    '..........hAAa..........',
    '..........hAAa..........',
    '..........hAAa..........',
    '..........hAAa..........',
    '..........hAAa..........',
    '..........hAAa..........',
    '..........hAAa..........',
    '..........hAAa..........',
    '.........hhAAaa.........',
    '........hAhAAaAa........',
  ],
};

/* ── props ─────────────────────────────────────────────────────────────────────────────────────── */

export const ifCoin: PixelSprite = {
  id: 'if-coin',
  name: 'if-coin',
  tags: ['scene', 'if'],
  blurb: "A gold coin, 4x4, the size it hangs on the trees.",
  rows: [
    '.OO.',
    'OyGO',
    'OGgO',
    '.OO.',
  ],
};

export const ifWateringCan: PixelSprite = {
  id: 'if-watering-can',
  name: 'if-watering-can',
  tags: ['scene', 'if'],
  blurb: "A teal can, gripped at the top of its handle (1, 0), spout rising to the right, rose at (10, 1).",
  rows: [
    'tTTt........',
    'T..T......Tt',
    'TTTTTT....TB',
    'TwTTTTt..T..',
    'TwTTTTt.T...',
    'TTTTTTtT....',
    'TTTTTTt.....',
    '.tttttt.....',
  ],
};

export const ifLanternPost: PixelSprite = {
  id: 'if-lantern-post',
  name: 'if-lantern-post',
  tags: ['scene', 'if'],
  blurb: "A lantern on a wooden post, glass at (1, 3) for ifFlame.",
  palette: IF_PALETTE,
  rows: [
    '..X..',
    '.XXD.',
    'XXXXD',
    'D4y4D',
    'D454D',
    'D444D',
    '.DDD.',
    '.hAa.',
    '.hAa.',
    '.hAa.',
    '.hAa.',
    '.hAa.',
    '.hAa.',
    '.hAa.',
    '.hAa.',
    '.hAa.',
    '.hAa.',
    '.hAa.',
    '.hAa.',
    '.hAa.',
    '.hAa.',
    'ahAaa',
  ],
};

/* ── the investor ─────────────────────────────────────────────────────────────────────────────── */

export const ifInvestor: PixelSprite = {
  id: 'if-investor',
  name: 'if-investor',
  tags: ['scene', 'if'],
  blurb: "The pathway's investor, facing right, one arm out at shoulder height holding whatever is placed at IF_INVESTOR_HAND.",
  palette: IF_PALETTE,
  rows: [
    '.....44.......',
    '....4333......',
    '...433333.....',
    '..43333332....',
    '..22222222....',
    '..HHCCCCCC....',
    '..HCCCCCKC....',
    '..HCCCCCCCC...',
    '..HUCCCCCU....',
    '...UUCCCU.....',
    '...qPPPPp.....',
    '..qPPPPPpPPPCC',
    '..qPPPPPppppUU',
    '..qPPPPPPp....',
    '..qPPPPPPp....',
    '..qPPPPPPp....',
    '..EppppppE....',
    '...bBbbbb.....',
    '...bBb.bbb....',
    '...bBb..bb....',
    '..aAAA.aAAA...',
  ],
};

/** Where the investor's hand is, in the investor's own pixels: a held prop's grip goes here. */
export const IF_INVESTOR_HAND = { x: 12, y: 11 } as const;

/* ── small moving bits ─────────────────────────────────────────────────────────────────────────── */

export const ifWater: PixelSprite = {
  id: 'if-water',
  name: 'if-water',
  tags: ['scene', 'if'],
  blurb: "Drops falling from a can's rose. Its top-left goes at the can's (11, 3).",
  rows: [
    'B..',
    '.w.',
    '..B',
    'B..',
  ],
  frames: [
    [
      'B..',
      '.w.',
      '..B',
      'B..',
    ],
    [
      '..B',
      'B..',
      '.w.',
      '..B',
    ],
    [
      '.w.',
      '..B',
      'B..',
      '.w.',
    ],
  ],
  frameMs: 150,
};

export const ifGlint: PixelSprite = {
  id: 'if-glint',
  name: 'if-glint',
  tags: ['scene', 'if'],
  blurb: "A coin catching the light. Centre it on a coin's top-left highlight.",
  rows: [
    '...',
    '.w.',
    '...',
  ],
  frames: [
    [
      '.w.',
      'wWw',
      '.w.',
    ],
    [
      '...',
      '.w.',
      '...',
    ],
    [
      '...',
      '...',
      '...',
    ],
    [
      '...',
      '...',
      '...',
    ],
    [
      '...',
      '.y.',
      '...',
    ],
  ],
  frameMs: 240,
};

export const ifFlame: PixelSprite = {
  id: 'if-flame',
  name: 'if-flame',
  tags: ['scene', 'if'],
  blurb: "The lantern flame flickering, laid over the lantern glass.",
  rows: [
    '4y4',
    '454',
    '444',
  ],
  frames: [
    [
      '4y4',
      '454',
      '444',
    ],
    [
      'y4y',
      '454',
      '4y4',
    ],
    [
      '4y4',
      '4y4',
      '444',
    ],
    [
      '.y.',
      '454',
      '4y4',
    ],
  ],
  frameMs: 230,
};

export const ifStar: PixelSprite = {
  id: 'if-star',
  name: 'if-star',
  tags: ['scene', 'if'],
  rows: [
    'w',
  ],
};

export const ifStarBig: PixelSprite = {
  id: 'if-star-big',
  name: 'if-star-big',
  tags: ['scene', 'if'],
  rows: [
    '.x.',
    'xwx',
    '.x.',
  ],
};

export const ifFirefly: PixelSprite = {
  id: 'if-firefly',
  name: 'if-firefly',
  tags: ['scene', 'if'],
  blurb: "A firefly. Give it rise: it drifts up and goes out.",
  rows: [
    'y',
  ],
};

export const ifSeedMote: PixelSprite = {
  id: 'if-seed-mote',
  name: 'if-seed-mote',
  tags: ['scene', 'if'],
  blurb: "A green seed fluff on the air.",
  rows: [
    'm',
    'n',
  ],
};

export const ifGoldMote: PixelSprite = {
  id: 'if-gold-mote',
  name: 'if-gold-mote',
  tags: ['scene', 'if'],
  rows: [
    'y',
  ],
};

export const ifSparkle: PixelSprite = {
  id: 'if-sparkle',
  name: 'if-sparkle',
  tags: ['scene', 'if'],
  blurb: "A four-point star that swells and shrinks.",
  rows: [
    '.......',
    '...y...',
    '...w...',
    '.ywWwy.',
    '...w...',
    '...y...',
    '.......',
  ],
  frames: [
    [
      '...y...',
      '...w...',
      '..ywy..',
      'ywwWwwy',
      '..ywy..',
      '...w...',
      '...y...',
    ],
    [
      '.......',
      '...y...',
      '...w...',
      '.ywWwy.',
      '...w...',
      '...y...',
      '.......',
    ],
    [
      '.......',
      '.......',
      '...y...',
      '..yWy..',
      '...y...',
      '.......',
      '.......',
    ],
    [
      '.......',
      '...y...',
      '...w...',
      '.ywWwy.',
      '...w...',
      '...y...',
      '.......',
    ],
  ],
  frameMs: 330,
};

export const ifSparkleX: PixelSprite = {
  id: 'if-sparkle-x',
  name: 'if-sparkle-x',
  tags: ['scene', 'if'],
  blurb: "A diagonal glint, the sparkle's smaller partner.",
  rows: [
    '.....',
    '.y.y.',
    '..w..',
    '.y.y.',
    '.....',
  ],
  frames: [
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
      '..w..',
      '.y.y.',
      '.....',
    ],
    [
      '.....',
      '.....',
      '..y..',
      '.....',
      '.....',
    ],
  ],
  frameMs: 420,
};

/** The same two sparkles started elsewhere in their cycles, so a pair never flashes in step. */
const SPARKLE_LATER = ifLater(ifSparkle, 'if-sparkle-later', 2, 370);
const SPARKLE_X_LATER = ifLater(ifSparkleX, 'if-sparkle-x-later', 1, 480);

/* ── the keepsake: a golden acorn locket on an oak sprig, with a swappable emblem ─────────────── */

export const ifOakSprig: PixelSprite = {
  id: 'if-oak-sprig',
  name: 'if-oak-sprig',
  tags: ['scene', 'if'],
  blurb: "The keepsake's still base, 48x40: an oak twig with two leaves and the stem the acorn hangs from.",
  palette: IF_PALETTE,
  rows: [
    '..................................mN..NN........',
    '.................................mNNNNNNNN......',
    '...............................aannnnnnnnnN.....',
    '.................................nnnnnnnnn......',
    '..................hhhhAhhhhAhhhhAhnnhAnnhhAhh...',
    '............AhhhhAaaaaaAaaaaaaaaaaaaaaaaaaaaa...',
    '.......AhmNhaNNaaa.....Aa.......................',
    '....hhhmNNNNNNNN.......Aa.......................',
    '....aaNnnnnnnnnnaa.....Aa.......................',
    '.......nnnnnnnnn.......Aa.......................',
    '.........nn..nn........Aa.......................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
    '................................................',
  ],
};

export const ifAcorn: PixelSprite = {
  id: 'if-acorn',
  name: 'if-acorn',
  tags: ['scene', 'if'],
  blurb: "The golden acorn, 22x27: a hatched wooden cap over a gold nut with an orchid enamel window at (5, 12).",
  palette: IF_PALETTE,
  rows: [
    '..........ha..........',
    '..........ha..........',
    '.......aaaaaaaa.......',
    '....aaahhaAAaAAaaa....',
    '...aaahaaAaaAaaAaaa...',
    '.aahaahaaAaaAaaAaaAaa.',
    '.ahahhahhaAAaAAaAAaAa.',
    'aaahaahaaAaaAaaAaaAaaa',
    'aaahaahaaAaaAaaAaaAaaa',
    'ahhahhahhaAAaAAaAAaAAa',
    '.aaaaaaaaaaaaaaaaaaaa.',
    '.OyyyyyGGGGGGGGGGGGGO.',
    '.OyywGEEEEEEEEEEGGGgO.',
    '.OywGEPPppppppppEGggO.',
    '.OywGEPpppppppppEgggO.',
    '.OGGGEppppppppppEgggO.',
    '.OGGGEppppppppppEgggO.',
    '..OGGEppppppppppEggO..',
    '..OGGEppppppppppEggO..',
    '...OGEppppppppppEgO...',
    '...OGEppppppppppEgO...',
    '....OGEEEEEEEEEEgO....',
    '.....OGGggggggggO.....',
    '......OOggggggOO......',
    '........OggggO........',
    '.........OggO.........',
    '..........OO..........',
  ],
};

/** The emblem window's inside, in acorn pixels. Every emblem is exactly this size. */
export const IF_EMBLEM = { x: 6, y: 13, width: 10, height: 8 } as const;

export const ifEmblemSprout: PixelSprite = {
  id: 'if-emblem-sprout',
  name: 'if-emblem-sprout',
  tags: ['scene', 'if'],
  blurb: "Lesson 1: a sprout coming up out of a coin. Money put to work grows.",
  rows: [
    '..mN..Nn..',
    '.mNNnnNNn.',
    '..mNnnNn..',
    '....nn....',
    '...OnnO...',
    '..OyGGgO..',
    '..OGGggO..',
    '...OOOO...',
  ],
};

/** Where the acorn hangs in the 48x40 keepsake, and how it sways. The emblem rides the same bob. */
const ACORN_AT = { x: 13, y: 8 } as const;
const SWAY: SceneMotion = { kind: 'bob', amp: 1, periodMs: 2600 };

/**
 * The pathway's keepsake with one lesson's emblem in its window. The emblem is its own layer with
 * the acorn's exact motion, so it stays seated in the window as both bob; it must be IF_EMBLEM's
 * size, because a bigger one would spill over the gold and a smaller one would sit off-centre.
 */
export function ifKeepsake(id: string, label: string, emblem: PixelSprite): SceneArt {
  if (emblem.rows.length !== IF_EMBLEM.height || emblem.rows.some((row) => row.length !== IF_EMBLEM.width)) {
    throw new Error(`${id}: emblem ${emblem.id} must be ${String(IF_EMBLEM.width)}x${String(IF_EMBLEM.height)}`);
  }
  return {
    id,
    label,
    width: 48,
    height: 40,
    base: ifOakSprig,
    layers: [
      { sprite: ifAcorn, x: ACORN_AT.x, y: ACORN_AT.y, motion: SWAY },
      { sprite: emblem, x: ACORN_AT.x + IF_EMBLEM.x, y: ACORN_AT.y + IF_EMBLEM.y, motion: SWAY },
      { sprite: ifSparkle, x: 3, y: 17, motion: { kind: 'twinkle', periodMs: 1700, min: 0.45 } },
      { sprite: SPARKLE_LATER, x: 38, y: 27, motion: { kind: 'twinkle', periodMs: 2000, phase: 0.5, min: 0.45 } },
      { sprite: ifSparkleX, x: 39, y: 12, motion: { kind: 'twinkle', periodMs: 1400, phase: 0.3, min: 0.4 } },
      { sprite: SPARKLE_X_LATER, x: 6, y: 31, motion: { kind: 'twinkle', periodMs: 2200, phase: 0.7, min: 0.4 } },
      { sprite: ifGoldMote, x: 10, y: 27, motion: { kind: 'rise', amp: 5, periodMs: 2300, phase: 0.1 } },
      { sprite: ifSeedMote, x: 37, y: 21, motion: { kind: 'rise', amp: 5, periodMs: 2700, phase: 0.6 } },
      { sprite: ifGoldMote, x: 34, y: 34, motion: { kind: 'rise', amp: 4, periodMs: 2000, phase: 0.35 } },
    ],
  };
}

