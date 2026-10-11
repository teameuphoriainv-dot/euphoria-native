/**
 * Alternative Investments art kit: the pieces every lesson of the pathway is built from.
 *
 * THE WORLD. Alternatives are what a portfolio holds beyond stocks and bonds, so the pathway lives
 * in an endowment's vault gallery (a round vault door, lit display niches, the collector with a
 * magnifier) and on the estate's land at night (timber, a wind turbine, a manor, a barn, an oil
 * pump). Teal walls and gold trim are its colours, so it never reads as the quant course's city.
 *
 * HOW A LESSON USES IT. An opener is a ground with kit pieces stamped on by aiCompose, which
 * flattens them into ONE still base: a stamped piece costs nothing at run time, only the moving
 * layers do. The six category emblems are 12x12 and sit in aiNiche. Any emblem up to 16x16 drops
 * into aiKeepsake, the pathway's glass case, so a lesson's keepsake is one call. aiDim turns any
 * piece into backdrop-safe tones.
 *
 * NATIVE-OWNED, like everything in scenes/ (CONSTITUTION 5.5).
 */
import type { PixelSprite } from '../types';
import type { SceneArt } from './types';

/**
 * The kit's own tones, one table for every piece, so two pieces flattened by aiCompose can never
 * give one letter two colours. a/c/d are the gallery's teal wall (base, recess, lamp wash), z the
 * floor's cast shadow, Z and V the glass case's tint and its cone of light, S and U the
 * collector's skin and its shadow (skin is not a UI colour, so it rides here, as the cast's does).
 */
export const AI_PALETTE: Readonly<Record<string, string>> = {
  a: '#103236',
  c: '#0B2326',
  d: '#16464A',
  z: '#0F0C14',
  Z: '#0F1C1E',
  V: '#132A2C',
  S: '#D6A87C',
  U: '#B07A4F',
};

/** A kit piece placed on a ground: the sprite and its top-left corner, in scene pixels. */
export type AiPart = readonly [sprite: PixelSprite, x: number, y: number];

/**
 * Stamps each part's opaque pixels onto a copy of `ground`, in order, so later parts sit in front.
 * A part running off the ground is clipped instead of widening a row: a row of the wrong width
 * does not compile.
 */
export function aiCompose(id: string, ground: readonly string[], parts: readonly AiPart[]): PixelSprite {
  const grid = ground.map((row) => [...row]);
  for (const [sprite, x, y] of parts) {
    sprite.rows.forEach((row, j) => {
      const line = grid[y + j];
      if (!line) return;
      [...row].forEach((ch, i) => {
        if (ch !== '.' && x + i >= 0 && x + i < line.length) line[x + i] = ch;
      });
    });
  }
  return { id, name: id, tags: ['scene', 'ai'], palette: { ...AI_PALETTE }, rows: grid.map((line) => line.join('')) };
}

/**
 * Backdrop tones. A backdrop sits behind body text, so no colour in it may pass luminance 0.15
 * (lesson-scenes-pin). Each bright step falls to a deep step of its own hue, so a dimmed piece
 * keeps its identity: gold stays gold, teal stays teal, steel stays steel.
 */
const NIGHT: Readonly<Record<string, string>> = {
  W: 'X', w: 'X', x: 'X', X: 'D', y: 'O', G: 'O', g: 'O', m: 'n', N: 'n', T: 't', Q: 'p', q: 'p', P: 'p',
  s: 'r', R: 'r', B: 'b', F: 'f', S: 'O', U: 'O', '2': '1', '3': '1', '4': '1', '5': '1',
};
const toNight = (rows: readonly string[]) => rows.map((row) => [...row].map((ch) => NIGHT[ch] ?? ch).join(''));

/** A copy of `sprite` in backdrop-safe tones, frames included. */
export function aiDim(sprite: PixelSprite, id: string): PixelSprite {
  return { ...sprite, id, name: id, rows: toNight(sprite.rows), frames: sprite.frames?.map(toNight) };
}

/**
 * The same framed sprite starting elsewhere in its cycle, at its own pace. Frames tick from mount
 * with no offset (PixelSpriteView), so two layers sharing one sprite would flash in step.
 */
export function aiLater(sprite: PixelSprite, id: string, by: number, frameMs: number): PixelSprite {
  const frames = sprite.frames ?? [sprite.rows];
  return { ...sprite, id, frames: [...frames.slice(by), ...frames.slice(0, by)], frameMs };
}

/* ── grounds and set pieces ──────────────────────────────────────────────────────────────────── */

/** The ground for indoor openers. Stamp the door, niches and figures on with aiCompose. */
export const aiGallery: PixelSprite = {
  id: 'ai-gallery',
  name: 'ai-gallery',
  tags: ['scene', 'ai'],
  blurb: "The vault gallery, empty: teal wall under a gold cornice, a display ledge, a dark floor. 80x60.",
  palette: AI_PALETTE,
  rows: [
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg',
    'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
    'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDa',
    'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
  ],
};

/** 27x27. Its hub is at (13, 13): put aiVaultWheel at (+9, +9). */
export const aiVaultDoor: PixelSprite = {
  id: 'ai-vault-door',
  name: 'ai-vault-door',
  tags: ['scene', 'ai'],
  blurb: "A round vault door set in the wall, bolts on its face; the hub is left dark for aiVaultWheel.",
  rows: [
    '..........KKKKKKK..........',
    '.......KKKXXXXXXXKKK.......',
    '......KXXXwwwwwwxXXDK......',
    '....KKXXwwwDDDDDxxxDDKK....',
    '...KKXwwDDxxxxxXXDDxxDKK...',
    '...KXwwDxxxxxxxXXXXDxxDK...',
    'XXXXwwDxxxGxxxXXGXXXDxxDK..',
    'DDDXwDxxxxxDDDDDXXXXXDxDDK.',
    'DDDwDxxxxDDXXXXXDDXXXXDXDK.',
    '.KXwDxxxDXXXkkkXXXDXXXDXDK.',
    'KXwwxxGxDXkkkkkkkXDXGXXXXDK',
    'KXwDxxxDXXkkkkkkkXXDXXXDXDK',
    'KXwDxxxDXkkkkkkkkkXDXXXDXDK',
    'KXwDxxxDXkkkkkkkkkXDXXXDXDK',
    'KXwDxxXDXkkkkkkkkkXDXXXDXDK',
    'KXwDXXXDXXkkkkkkkXXDXXXDXDK',
    'KXxxXXGXDXkkkkkkkXDXGXXXXDK',
    '.KXxDXXXDXXXkkkXXXDXXXDXDK.',
    'XXXxDXXXXDDXXXXXDDXXXXDXDK.',
    'DDDDxDXXXXXDDDDDXXXXXDXDDK.',
    'DDDDxxDXXXGXXXXXGXXXDXXDK..',
    '...KDxxDXXXXXXXXXXXDXXDK...',
    '...KKDxxDDXXXXXXXDDXXDKK...',
    '....KKDDXXXDDDDDXXXDDKK....',
    '......KDDDXXXXXXXDDDK......',
    '.......KKKDDDDDDDKKK.......',
    '..........KKKKKKK..........',
  ],
};

export const aiVaultWheel: PixelSprite = {
  id: 'ai-vault-wheel',
  name: 'ai-vault-wheel',
  tags: ['scene', 'ai'],
  blurb: "The spoked handle wheel of the vault door, turning.",
  rows: [
    '....y....',
    '....g....',
    '....g....',
    '...GOO...',
    'yggOGOggy',
    '...OOO...',
    '....g....',
    '....g....',
    '....y....',
  ],
  frames: [
    [
      '....y....',
      '....g....',
      '....g....',
      '...GOO...',
      'yggOGOggy',
      '...OOO...',
      '....g....',
      '....g....',
      '....y....',
    ],
    [
      '......y..',
      '.....g...',
      'y....g...',
      '.ggGOO...',
      '...OGO...',
      '...OOOgg.',
      '...g....y',
      '...g.....',
      '..y......',
    ],
    [
      '.........',
      '.y.....y.',
      '..g...g..',
      '...GOO...',
      '...OGO...',
      '...OOO...',
      '..g...g..',
      '.y.....y.',
      '.........',
    ],
    [
      '..y......',
      '...g.....',
      '...g....y',
      '...GOOgg.',
      '...OGO...',
      '.ggOOO...',
      'y....g...',
      '.....g...',
      '......y..',
    ],
  ],
  frameMs: 300,
};

export const aiNiche: PixelSprite = {
  id: 'ai-niche',
  name: 'ai-niche',
  tags: ['scene', 'ai'],
  blurb: "A lit display niche with gold trim. 14x16; a 12x12 emblem stands at (+1, +3).",
  rows: [
    '.GGGGGGGGGGGg.',
    'gDDDDDDDDDDDDO',
    'gkkkkkkkkkkkkO',
    'gKKKKKKKKKKKKO',
    'gKKKKKKKKKKKKO',
    'gKKKKKKKKKKKKO',
    'gKKKKKKKKKKKKO',
    'gKKKKKKKKKKKKO',
    'gKKKKKKKKKKKKO',
    'gKKKKKKKKKKKKO',
    'gKKKKKKKKKKKKO',
    'gKKKKKKKKKKKKO',
    'gKKKKKKKKKKKKO',
    'gKKKKKKKKKKKKO',
    'gkkkkkkkkkkkkO',
    '.OOOOOOOOOOOO.',
  ],
};

export const aiPictureLight: PixelSprite = {
  id: 'ai-picture-light',
  name: 'ai-picture-light',
  tags: ['scene', 'ai'],
  blurb: "A brass picture light; sits on the niche top at (+4, -3).",
  rows: [
    '..OO..',
    'OGGGGO',
    '.yyyy.',
  ],
};

export const aiAllocationChart: PixelSprite = {
  id: 'ai-allocation-chart',
  name: 'ai-allocation-chart',
  tags: ['scene', 'ai'],
  blurb: "A framed pie on the wall: more than 80% in alternatives (gold), the rest in stocks and bonds (grey).",
  rows: [
    'OOOOOOOOOOOOO',
    'OGGGGGGGGGGGO',
    'OgkkkkxkkkkgO',
    'OgkkyyxxxkkgO',
    'OgkyyyxxxxkgO',
    'OgkyyyxxGGkgO',
    'OgkyyGGGGGkgO',
    'OgkyGGGGGGkgO',
    'OgkkGGGGGkkgO',
    'OgkkkkGkkkkgO',
    'OgggggggggggO',
    'OOOOOOOOOOOOO',
  ],
};

export const aiShadow: PixelSprite = {
  id: 'ai-shadow',
  name: 'ai-shadow',
  tags: ['scene', 'ai'],
  blurb: "A cast shadow on the floor, under a standing figure.",
  palette: AI_PALETTE,
  rows: [
    '..zzzzzzzzzz..',
    'zzzzzzzzzzzzzz',
  ],
};


/* ── the collector ───────────────────────────────────────────────────────────────────────────── */

/** 20x28, facing right. Blink and lens glare sit at AI_COLLECTOR_EYE and AI_COLLECTOR_GLARE. */
export const aiCollector: PixelSprite = {
  id: 'ai-collector',
  name: 'ai-collector',
  tags: ['scene', 'ai'],
  blurb: "The collector: the pathway's investor in an orchid coat and gold scarf, studying a piece through a magnifier.",
  palette: AI_PALETTE,
  rows: [
    '....................',
    '.....kkkkkk.........',
    '....kDDDDkkk........',
    '...kDDkkkkkkk.......',
    '...kDkkkkkkkkk.GGG..',
    '...kkkkkkSSSSkGwBBO.',
    '...kkkkSSSSSSSGBBBO.',
    '...kkkUSSKSSKSGBBBO.',
    '...kkkUSSSSSSS.OOO..',
    '....kkkSSSSUS...O...',
    '.....kkUSSSS...SO...',
    '.......UUU....SS....',
    '.....EGGGGGgEPP.....',
    '....EqyGGGgPPPE.....',
    '....EqPPGgPPPpE.....',
    '....EqPPPPPPPpE.....',
    '....EqPPPGPPPpE.....',
    '....EqPPPPPPPpE.....',
    '....EqPPPGPPPpE.....',
    '...EqPPPPPPPPPpE....',
    '...EqPPPPPPPPPpE....',
    '...EqPPPPPPPPPpE....',
    '...EEEEEEEEEEEEE....',
    '.....DXD...DXD......',
    '.....DXD...DXD......',
    '.....DXD...DXD......',
    '.....DXD...DXD......',
    '....OgOO..OgOO......',
  ],
};

/** Where the collector's eye and lens glare are, from the collector's top-left. */
export const AI_COLLECTOR_EYE = [9, 7] as const;
export const AI_COLLECTOR_GLARE = [15, 5] as const;

export const aiCollectorBlink: PixelSprite = {
  id: 'ai-collector-blink',
  name: 'ai-collector-blink',
  tags: ['scene', 'ai'],
  blurb: "The collector's eyes: open, then a blink.",
  palette: AI_PALETTE,
  rows: [
    'KSSK',
  ],
  frames: [
    [
      'KSSK',
    ],
    [
      'KSSK',
    ],
    [
      'KSSK',
    ],
    [
      'KSSK',
    ],
    [
      'KSSK',
    ],
    [
      'KSSK',
    ],
    [
      'KSSK',
    ],
    [
      'KSSK',
    ],
    [
      'KSSK',
    ],
    [
      'USSU',
    ],
  ],
  frameMs: 320,
};

export const aiLensGlare: PixelSprite = {
  id: 'ai-lens-glare',
  name: 'ai-lens-glare',
  tags: ['scene', 'ai'],
  blurb: "The glint on the magnifier's glass.",
  rows: [
    'W',
  ],
};


/* ── the six categories (12x12, one per niche) ───────────────────────────────────────────────── */

export const aiHouse: PixelSprite = {
  id: 'ai-house',
  name: 'ai-house',
  tags: ['scene', 'ai'],
  blurb: "Real estate: a house with a lit window, a door and a chimney.",
  rows: [
    '.....EE.DD..',
    '....EqPExX..',
    '...EqPPpxX..',
    '..EqPPPPxX..',
    '.EqPPPPPPpE.',
    'EEEEEEEEEEEE',
    '.DXXXXXXXXD.',
    '.DxyyxxxxXD.',
    '.DxyyxOgxXD.',
    '.DxxxxOgxXD.',
    '.DxxxxOgxXD.',
    '.DDDDDDDDDD.',
  ],
};

export const aiFactory: PixelSprite = {
  id: 'ai-factory',
  name: 'ai-factory',
  tags: ['scene', 'ai'],
  blurb: "Private equity: a company to buy and improve, a sawtooth-roofed factory with lit windows.",
  rows: [
    '.DD.........',
    '.xX.........',
    '.xX.........',
    '.xX....x...x',
    '.xX...bx..bx',
    '.xX..bBx.bBx',
    '.xX.bBBxbBBx',
    'DDDDDDDDDDDD',
    'DbyybyybyybD',
    'DbyybyybyybD',
    'DbbbbbbbbbbD',
    'DDDDDDDDDDDD',
  ],
};

export const aiLongShort: PixelSprite = {
  id: 'ai-long-short',
  name: 'ai-long-short',
  tags: ['scene', 'ai'],
  blurb: "Hedge funds: a long arrow up and a short arrow down, pumping apart.",
  rows: [
    '............',
    '..n.........',
    '.nNn....rrr.',
    'nNmNn...rRr.',
    'nnNnn...rRr.',
    '.nNn....rRr.',
    '.nNn....rRr.',
    '.nNn...rrRrr',
    '.nNn...rRsRr',
    '.nnn....rRr.',
    '.........r..',
    '............',
  ],
  frames: [
    [
      '............',
      '..n.........',
      '.nNn....rrr.',
      'nNmNn...rRr.',
      'nnNnn...rRr.',
      '.nNn....rRr.',
      '.nNn....rRr.',
      '.nNn...rrRrr',
      '.nNn...rRsRr',
      '.nnn....rRr.',
      '.........r..',
      '............',
    ],
    [
      '..n.........',
      '.nNn........',
      'nNmNn.......',
      'nnNnn...rrr.',
      '.nNn....rRr.',
      '.nNn....rRr.',
      '.nNn....rRr.',
      '.nNn....rRr.',
      '.nnn...rrRrr',
      '.......rRsRr',
      '........rRr.',
      '.........r..',
    ],
  ],
  frameMs: 520,
};

export const aiGoldBars: PixelSprite = {
  id: 'ai-gold-bars',
  name: 'ai-gold-bars',
  tags: ['scene', 'ai'],
  blurb: "Commodities: three gold bars stacked.",
  rows: [
    '............',
    '............',
    '............',
    '....OOOO....',
    '...OwyyyO...',
    '...OGGGGO...',
    '...OGGGgO...',
    '.OOOOOOOOOO.',
    'OyyyyOOyyyyO',
    'OGGGGOOGGGGO',
    'OGGGgOOGGGgO',
    'OOOOOOOOOOOO',
  ],
};

export const aiCryptoCoin: PixelSprite = {
  id: 'ai-crypto-coin',
  name: 'ai-crypto-coin',
  tags: ['scene', 'ai'],
  blurb: "Crypto: a teal coin with a ticked B, spinning.",
  rows: [
    '....tttt....',
    '..ttTTTTtt..',
    '.twTTtTtTTt.',
    '.twTttttTTt.',
    'tTTTtTTTtTTt',
    'tTTTttttTTTt',
    'tTTTtTTTtTTt',
    'tTTTttttTTTt',
    '.tTTTtTtTTt.',
    '.tTTTTTTTTt.',
    '..ttTTTTtt..',
    '....tttt....',
  ],
  frames: [
    [
      '....tttt....',
      '..ttTTTTtt..',
      '.twTTtTtTTt.',
      '.twTttttTTt.',
      'tTTTtTTTtTTt',
      'tTTTttttTTTt',
      'tTTTtTTTtTTt',
      'tTTTttttTTTt',
      '.tTTTtTtTTt.',
      '.tTTTTTTTTt.',
      '..ttTTTTtt..',
      '....tttt....',
    ],
    [
      '....tttt....',
      '..ttTTTTtt..',
      '.twTTtTtTTt.',
      '.twTttttTTt.',
      'tTTTtTTTtTTt',
      'tTTTttttTTTt',
      'tTTTtTTTtTTt',
      'tTTTttttTTTt',
      '.tTTTtTtTTt.',
      '.tTTTTTTTTt.',
      '..ttTTTTtt..',
      '....tttt....',
    ],
    [
      '....tttt....',
      '..ttTTTTtt..',
      '.twTTtTtTTt.',
      '.twTttttTTt.',
      'tTTTtTTTtTTt',
      'tTTTttttTTTt',
      'tTTTtTTTtTTt',
      'tTTTttttTTTt',
      '.tTTTtTtTTt.',
      '.tTTTTTTTTt.',
      '..ttTTTTtt..',
      '....tttt....',
    ],
    [
      '....tttt....',
      '...tTTTTt...',
      '..twTTTTTt..',
      '..twTTTTTt..',
      '..tTTTTTTt..',
      '..tTTTTTTt..',
      '..tTTTTTTt..',
      '..tTTTTTTt..',
      '..tTTTTTTt..',
      '..tTTTTTTt..',
      '...tTTTTt...',
      '....tttt....',
    ],
    [
      '.....tt.....',
      '.....tT.....',
      '.....tT.....',
      '.....tT.....',
      '.....tT.....',
      '.....tT.....',
      '.....tT.....',
      '.....tT.....',
      '.....tT.....',
      '.....tT.....',
      '.....tT.....',
      '.....tt.....',
    ],
    [
      '....tttt....',
      '...tTTTTt...',
      '..twTTTTTt..',
      '..twTTTTTt..',
      '..tTTTTTTt..',
      '..tTTTTTTt..',
      '..tTTTTTTt..',
      '..tTTTTTTt..',
      '..tTTTTTTt..',
      '..tTTTTTTt..',
      '...tTTTTt...',
      '....tttt....',
    ],
  ],
  frameMs: 200,
};

export const aiPainting: PixelSprite = {
  id: 'ai-painting',
  name: 'ai-painting',
  tags: ['scene', 'ai'],
  blurb: "Collectibles: a landscape painting in a gold frame.",
  rows: [
    '............',
    'OOOOOOOOOOOO',
    'OyGGGGGGGGgO',
    'OGBBBBBByygO',
    'OGBBBBBByygO',
    'OGBBNNBBBBgO',
    'OGBNNNNBNNgO',
    'OGNNNNNNNNgO',
    'OGnnnnnnnngO',
    'OggggggggggO',
    'OOOOOOOOOOOO',
    '............',
  ],
};


/* ── keepsake emblems (up to 16x16, for aiKeepsake) ──────────────────────────────────────────── */

export const aiKey: PixelSprite = {
  id: 'ai-key',
  name: 'ai-key',
  tags: ['scene', 'ai'],
  blurb: "Lesson 1: a golden key, the way into everything beyond stocks and bonds.",
  rows: [
    '......OOOO......',
    '.....OyyGGO.....',
    '....OyGOOGgO....',
    '....OGO..OgO....',
    '....OGO..OgO....',
    '....OGgOOggO....',
    '.....OggggO.....',
    '......OGgO......',
    '.....OGGggO.....',
    '......OGgO......',
    '......OGgO......',
    '......OGgOOO....',
    '......OGgGgO....',
    '......OGgOOO....',
    '......OGgGgO....',
    '......OOOOOO....',
  ],
};


/* ── outdoors ────────────────────────────────────────────────────────────────────────────────── */

export const aiTurbineBlades: PixelSprite = {
  id: 'ai-turbine-blades',
  name: 'ai-turbine-blades',
  tags: ['scene', 'ai'],
  blurb: "Infrastructure: three wind turbine blades turning round their hub at (7, 7).",
  rows: [
    '.......X.......',
    '.......X.......',
    '.......x.......',
    '.......x.......',
    '.......x.......',
    '.......x.......',
    '.......x.......',
    '.......w.......',
    '.....xx.xx.....',
    '...xx.....xx...',
    '.XXx.......xXX.',
    '.X.............',
    '...............',
    '...............',
    '...............',
  ],
  frames: [
    [
      '.......X.......',
      '.......X.......',
      '.......x.......',
      '.......x.......',
      '.......x.......',
      '.......x.......',
      '.......x.......',
      '.......w.......',
      '.....xx.xx.....',
      '...xx.....xx...',
      '.XXx.......xXX.',
      '.X.............',
      '...............',
      '...............',
      '...............',
    ],
    [
      '...............',
      '...............',
      '...........X...',
      '..........xx...',
      '.........xx....',
      '........xx.....',
      'XXxxx...x......',
      '.....xxw.......',
      '........x......',
      '........x......',
      '........x......',
      '........xx.....',
      '.........x.....',
      '.........X.....',
      '.........X.....',
    ],
    [
      '...............',
      '...............',
      '...X...........',
      '...xx..........',
      '....xx.........',
      '.....xx........',
      '......x...xxxXX',
      '.......wxx.....',
      '......x........',
      '......x........',
      '......x........',
      '.....xx........',
      '.....x.........',
      '.....X.........',
      '.....X.........',
    ],
  ],
  frameMs: 360,
};

export const aiPumpJack: PixelSprite = {
  id: 'ai-pump-jack',
  name: 'ai-pump-jack',
  tags: ['scene', 'ai'],
  blurb: "Commodities: an oil pump nodding, its horse head on the left over the well.",
  rows: [
    '..................',
    '..................',
    '..G...............',
    '.GgxxxxxxwxxxxxX..',
    '.Gg......X.....X..',
    '..G.....X.X....X..',
    '.X......X.X...X...',
    '.X.....X...X.DDD..',
    '.X.....X...X.DxD..',
    '.X....X.....XDDXXX',
    'DDD...XXXXXXX..XXX',
    '.DDDDDDDDDDDDDDDD.',
  ],
  frames: [
    [
      '..................',
      '..................',
      '..G...............',
      '.GgxxxxxxwxxxxxX..',
      '.Gg......X.....X..',
      '..G.....X.X....X..',
      '.X......X.X...X...',
      '.X.....X...X.DDD..',
      '.X.....X...X.DxD..',
      '.X....X.....XDDXXX',
      'DDD...XXXXXXX..XXX',
      '.DDDDDDDDDDDDDDDD.',
    ],
    [
      '..................',
      '..............xX..',
      '...........xxx.X..',
      '........xwx....X..',
      '..G..xxx.X.....X..',
      '.Ggxx...X.X...X...',
      '.Gg.....X.X...X...',
      '..G....X...X.DDD..',
      '.X.....X...X.DxD..',
      '.X....X.....XDDXXX',
      'DDD...XXXXXXX..XXX',
      '.DDDDDDDDDDDDDDDD.',
    ],
    [
      '..................',
      '..................',
      '..G...............',
      '.GgxxxxxxwxxxxxX..',
      '.Gg......X.....X..',
      '..G.....X.X....X..',
      '.X......X.X...X...',
      '.X.....X...X.DDD..',
      '.X.....X...X.DxD..',
      '.X....X.....XDDXXX',
      'DDD...XXXXXXX..XXX',
      '.DDDDDDDDDDDDDDDD.',
    ],
    [
      '..G...............',
      '.Ggxx.............',
      '.Gg..xxx..........',
      '..G.....xwx.......',
      '.X.......X.xxx....',
      '.X......X.X...xX..',
      '.X......X.X....X..',
      '.X.....X...X.DDD..',
      '.X.....X...X.DxD..',
      '.X....X.....XDDXXX',
      'DDD...XXXXXXX..XXX',
      '.DDDDDDDDDDDDDDDD.',
    ],
  ],
  frameMs: 420,
};


/* ── small moving bits ───────────────────────────────────────────────────────────────────────── */

export const aiGlint: PixelSprite = {
  id: 'ai-glint',
  name: 'ai-glint',
  tags: ['scene', 'ai'],
  blurb: "A teal gem-glint: a cross that turns to a star and fades.",
  rows: [
    'T...T',
    '.m.m.',
    '..W..',
    '.m.m.',
    'T...T',
  ],
  frames: [
    [
      'T...T',
      '.m.m.',
      '..W..',
      '.m.m.',
      'T...T',
    ],
    [
      '.....',
      '..m..',
      '.mWm.',
      '..m..',
      '.....',
    ],
    [
      '.....',
      '.....',
      '..m..',
      '.....',
      '.....',
    ],
    [
      '.....',
      '..m..',
      '.mWm.',
      '..m..',
      '.....',
    ],
  ],
  frameMs: 340,
};

export const aiGlintGold: PixelSprite = {
  id: 'ai-glint-gold',
  name: 'ai-glint-gold',
  tags: ['scene', 'ai'],
  blurb: "The same glint in gold, for metal.",
  rows: [
    'y...y',
    '.w.w.',
    '..W..',
    '.w.w.',
    'y...y',
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
      '..w..',
      '.wWw.',
      '..w..',
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
      '..w..',
      '.wWw.',
      '..w..',
      '.....',
    ],
  ],
  frameMs: 360,
};

export const aiMoteTeal: PixelSprite = {
  id: 'ai-mote-teal',
  name: 'ai-mote-teal',
  tags: ['scene', 'ai'],
  rows: [
    'm',
    'T',
  ],
};

export const aiMoteGold: PixelSprite = {
  id: 'ai-mote-gold',
  name: 'ai-mote-gold',
  tags: ['scene', 'ai'],
  rows: [
    'y',
    'O',
  ],
};


/* ── the keepsake ────────────────────────────────────────────────────────────────────────────── */

export const aiCase: PixelSprite = {
  id: 'ai-case',
  name: 'ai-case',
  tags: ['scene', 'ai'],
  blurb: "The pathway keepsake's shape: a glass case with a brass cap on a marble plinth with a gold plaque.",
  palette: AI_PALETTE,
  rows: [
    '................................................',
    '......................OOOO......................',
    '.....................OyyGGO.....................',
    '............OOOOOOOOOOOOOOOOOOOOOOOO............',
    '............yyyyyGGGGGGGGGGGGGGGGGGg............',
    '.............xZZZZZZZZVVVVZZZZZZZZX.............',
    '.............xZZZZxZZZVVVVZZZZZZZZX.............',
    '.............xZZZxZZZDVVVVZZZZZZZZX.............',
    '.............xZZxZZZDVVVVVVZZZZZZZX.............',
    '.............xZwZZZDZVVVVVVZZZZZZZX.............',
    '.............xZZZZDZZVVVVVVZZZZZZZX.............',
    '.............xZZZDZZVVVVVVVVZZZZZZX.............',
    '.............xZZDZZZVVVVVVVVZZZZZZX.............',
    '.............xZDZZZVVVVVVVVVVZZZZZX.............',
    '.............xZZZZZVVVVVVVVVVZZZZZX.............',
    '.............xZZZZZVVVVVVVVVVZZZZZX.............',
    '.............xZZZZVVVVVVVVVVVVZZZZX.............',
    '.............xZZZZVVVVVVVVVVVVZZZZX.............',
    '.............xZZZVVVVVVVVVVVVVVZZZX.............',
    '.............xZZZVVVVVVVVVVVVVVZZZX.............',
    '.............xZZZVVVVVVVVVVVVVVZZZX.............',
    '.............xZZVVVVVVVVVVVVVVVVZZX.............',
    '.............xZZVVVVVVVVVVVVVVVVZZX.............',
    '.............x....pqPPPPPPPPPp....X.............',
    '.............x...EEEEEEEEEEEEEE...X.............',
    '.............xEEEEEEEEEEEEEEEEEEEEX.............',
    '............GGGGGGgggggggggggggggggg............',
    '...........yyyyyyyyyyyyyyyyyyyyyyyyyy...........',
    '...........OggggggggggggggggggggggggO...........',
    '.............wwxxxxxxxxxxxxxxxxxxXX.............',
    '.............wwxxxxXxxxxxxxxxxxxxXX.............',
    '.............wwxxxxOOOOOOOOOOxxXxXX.............',
    '.............wwxxxXOyyyyGGGGOxxXxXX.............',
    '.............wwxxxXOGGggggGGOxXxxXX.............',
    '.............wwxxDxOOOOOOOOOOxXxxXX.............',
    '.............wwxxXxxxxxxxxxxxXxxxXX.............',
    '.............wwxXxxxxxxxxxxxxXxxxXX.............',
    '...........GGGGGGgggggggggggggggggggg...........',
    '..........OOOOOOOOOOOOOOOOOOOOOOOOOOOO..........',
    '..........OOOOOOOOOOOOOOOOOOOOOOOOOOOO..........',
  ],
};

/**
 * A highlight crossing the case's front pane, then a rest. Built rather than drawn: it is one
 * slanted band moved across the glass, and sixteen hand-copied frames are where a miscounted row
 * gets in. The still is clear glass, which is what Reduce Motion shows.
 */
function sweep(w: number, h: number, steps: number, rest: number): string[][] {
  const reach = w + Math.ceil(h * 0.6) + 2;
  return Array.from({ length: steps + rest }, (_, s) => {
    const at = s < steps ? Math.round((reach * s) / (steps - 1)) : -99;
    return Array.from({ length: h }, (_, y) =>
      Array.from({ length: w }, (_, x) => {
        const t = x + Math.floor(y * 0.6) - at;
        return t === 0 ? 'x' : t === 1 ? 'w' : '.';
      }).join(''),
    );
  });
}

export const aiCaseSheen: PixelSprite = {
  id: 'ai-case-sheen',
  name: 'ai-case-sheen',
  tags: ['scene', 'ai'],
  blurb: 'Light sweeping the glass of aiCase. Sits at (14, 5).',
  rows: Array.from({ length: 18 }, () => '.'.repeat(20)),
  frames: sweep(20, 18, 7, 9),
  frameMs: 150,
};

/** Where an emblem's bottom row rests in the case, and the column it is centred on. */
const CASE_FLOOR = 22;
const CASE_MID = 24;

/** The glints outside the glass, desynced so they never flash together. */
const aiGlintLater = aiLater(aiGlint, 'ai-glint-later', 2, 390);

/**
 * The pathway keepsake: `emblem` floating in aiCase, the same case for every lesson. Emblems are
 * at most 16x16, so the top of the bob stays under the brass cap. Layer order is the depth: the
 * emblem, then the sheen on the glass in front of it, then the glints and motes outside.
 */
export function aiKeepsake(id: string, label: string, emblem: PixelSprite): SceneArt {
  const w = emblem.rows[0]?.length ?? 0;
  const h = emblem.rows.length;
  return {
    id,
    label,
    width: 48,
    height: 40,
    base: aiCase,
    layers: [
      { sprite: emblem, x: CASE_MID - Math.ceil(w / 2), y: CASE_FLOOR + 1 - h, motion: { kind: 'bob', amp: 1, periodMs: 2600 } },
      { sprite: aiCaseSheen, x: 14, y: 5 },
      { sprite: aiGlint, x: 4, y: 9, motion: { kind: 'twinkle', periodMs: 1800, min: 0.45 } },
      { sprite: aiGlintLater, x: 39, y: 20, motion: { kind: 'twinkle', periodMs: 2100, phase: 0.5, min: 0.45 } },
      { sprite: aiMoteTeal, x: 8, y: 27, motion: { kind: 'rise', amp: 5, periodMs: 2400, phase: 0.1 } },
      { sprite: aiMoteGold, x: 40, y: 11, motion: { kind: 'rise', amp: 5, periodMs: 2800, phase: 0.6 } },
    ],
  };
}
