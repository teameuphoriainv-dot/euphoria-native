/**
 * Corporate Finance art kit: the people, props, signs and emblems every cf lesson scene is built from.
 *
 * The pathway's world is the company itself: a walnut-and-wine head office where cash rolls in from
 * the works on a conveyor and a CFO decides where it goes next. Lesson 1 drew the kit; later lessons
 * compose their openers from it with cfCompose instead of drawing a room from scratch, so the cast,
 * the hall and the signs stay the same objects from lesson to lesson.
 *
 * Light comes from the upper left, as on every other figure in the app. Outlines use the deep steps
 * (O, E, D) or walnut, never K: K is invisible on the dark canvas.
 */
import type { PixelSprite } from '../types';

/**
 * The kit's own tones: skin and hair (the cast's values, so a CFO matches the avatars), walnut and
 * wine for the hall, a cast-shadow step, and two glass tints for the keepsake. Carried per sprite,
 * as the cast does, so none of them can be picked up as a UI colour.
 */
export const CF_PALETTE: Record<string, string> = {
  S: '#F4CBA4', // skin
  M: '#D6A87C', // skin shadow
  h: '#2B2028', // hair
  A: '#4A2E1F', // walnut
  a: '#2B1C17', // walnut shadow
  V: '#3B1C2A', // wine wall
  v: '#2A1420', // wine stripe
  // Z is the cast-shadow step: drawn between the floor ink and the canvas, so a shadow on the
  // floor stays a shadow instead of reading as a hole.
  Z: '#110E17',
  c: '#1C2645', // glass
  C: '#2A3A66', // glass sheen
};

/** A still sprite and the top-left corner it is stamped at, in the ground's pixels. */
export type CfPart = readonly [sprite: PixelSprite, x: number, y: number];

/**
 * Flattens still sprites onto a ground, in order, into ONE sprite: the way an opener is built.
 *
 * WHY STAMP AND NOT LAYER. Every layer is meshed on its own, so a door, a plaque and a sign laid as
 * three layers never merge their runs with the wall behind them, and the rect budget goes on seams.
 * Stamped into the base they mesh as one picture. Only what moves stays a layer.
 *
 * A part may hang off the edge (the conveyor runs in from off frame); what falls outside is clipped.
 * Two parts that paint the same palette key in different colours throw, because the later one
 * would otherwise recolour every pixel of the earlier one, silently.
 */
export function cfCompose(id: string, ground: PixelSprite, parts: readonly CfPart[], blurb?: string): PixelSprite {
  const grid = ground.rows.map((row) => [...row]);
  const palette: Record<string, string> = { ...ground.palette };
  for (const [sprite, x, y] of parts) {
    for (const [key, hex] of Object.entries(sprite.palette ?? {})) {
      const had = palette[key];
      if (had !== undefined && had !== hex) {
        throw new Error(`cfCompose ${id}: ${sprite.id} paints "${key}" as ${hex}, the scene already has ${had}`);
      }
      palette[key] = hex;
    }
    sprite.rows.forEach((row, j) => {
      const line = grid[y + j];
      if (!line) return;
      [...row].forEach((ch, i) => {
        if (ch !== '.' && x + i >= 0 && x + i < line.length) line[x + i] = ch;
      });
    });
  }
  return { id, name: id, tags: ['scene', 'cf'], blurb, palette, rows: grid.map((r) => r.join('')) };
}

/**
 * The same animated sprite starting elsewhere in its cycle and running at its own pace. Frames tick
 * from mount with no offset, so two layers sharing one sprite would move in step; a motion `phase`
 * offsets the transform, not the frames.
 */
export function cfLater(sprite: PixelSprite, id: string, by: number, frameMs: number): PixelSprite {
  const frames = sprite.frames ?? [sprite.rows];
  return { ...sprite, id, name: id, frames: [...frames.slice(by), ...frames.slice(0, by)], frameMs };
}

/**
 * The head-office hall, 80x60: wine stripe wallpaper over a walnut wainscot, a dark floor. The
 * ground every interior opener stamps its props onto; it has no door or window of its own, so a
 * lesson places those where its story needs them.
 */
export const cfHall: PixelSprite = {
  id: 'cf-hall',
  name: 'cf-hall',
  tags: ['scene', 'cf'],
  blurb: 'The empty hall: crown moulding, wine wallpaper, walnut wainscot, dark floor.',
  palette: CF_PALETTE,
  rows: [
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
    'VvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVV',
    'VvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVV',
    'VvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVV',
    'VvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVV',
    'VvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVV',
    'VvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVV',
    'VvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVV',
    'VvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVV',
    'VvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVV',
    'VvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVV',
    'VvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVV',
    'VvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVV',
    'VvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVV',
    'VvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVV',
    'VvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVV',
    'VvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVV',
    'VvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVV',
    'VvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVV',
    'VvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVV',
    'VvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVV',
    'VvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVV',
    'VvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVV',
    'VvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVV',
    'VvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVV',
    'VvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVV',
    'VvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVV',
    'VvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVVVvVV',
    'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
    'gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg',
    'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    'AaaaaaaaaAAaaaaaaaaAAaaaaaaaaAAaaaaaaaaAAaaaaaaaaAAaaaaaaaaAAaaaaaaaaAAaaaaaaaaA',
    'AaOOOOOOaAAaOOOOOOaAAaOOOOOOaAAaOOOOOOaAAaOOOOOOaAAaOOOOOOaAAaOOOOOOaAAaOOOOOOaA',
    'AaAAAAAAaAAaAAAAAAaAAaAAAAAAaAAaAAAAAAaAAaAAAAAAaAAaAAAAAAaAAaAAAAAAaAAaAAAAAAaA',
    'AaAAAAAAaAAaAAAAAAaAAaAAAAAAaAAaAAAAAAaAAaAAAAAAaAAaAAAAAAaAAaAAAAAAaAAaAAAAAAaA',
    'AaAAAAAAaAAaAAAAAAaAAaAAAAAAaAAaAAAAAAaAAaAAAAAAaAAaAAAAAAaAAaAAAAAAaAAaAAAAAAaA',
    'AaAAAAAAaAAaAAAAAAaAAaAAAAAAaAAaAAAAAAaAAaAAAAAAaAAaAAAAAAaAAaAAAAAAaAAaAAAAAAaA',
    'AaaaaaaaaAAaaaaaaaaAAaaaaaaaaAAaaaaaaaaAAaaaaaaaaAAaaaaaaaaAAaaaaaaaaAAaaaaaaaaA',
    'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
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
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
  ],
};

/** The CFO, arms folded: the person who decides where the cash goes. Faces the viewer. */
export const cfCfo: PixelSprite = {
  id: 'cf-cfo',
  name: 'cf-cfo',
  tags: ['scene', 'cf', 'character'],
  blurb: 'The CFO in an orchid suit and gold tie, arms folded.',
  palette: CF_PALETTE,
  rows: [
    '.....hhhh....',
    '...hhDDhhh...',
    '..hhDhhhhhh..',
    '..hDhhhhhhh..',
    '..hhSSSSShh..',
    '..hSSSSSSSh..',
    '..hSKSSSKSh..',
    '..hSSSSSSMh..',
    '...SSSSSSM...',
    '....SMMMM....',
    '.....MMM.....',
    '...EpwwwpE...',
    '..EPPwGwppE..',
    '.EPPPwGwpppE.',
    'EPPPPPGppppE.',
    'EqqqqqqPPPpE.',
    'EPPPPPPPPpSE.',
    'ESPPPPPPpppE.',
    '.EEPPPPpppEE.',
    '..EPPPgpppE..',
    '..EEEEEEEEE..',
    '...EpE.EpE...',
    '...EpE.EpE...',
    '...EpE.EpE...',
    '...EpE.EpE...',
    '..DDDD.DDDD..',
    '..DXXD.DXXD..',
  ],
};

/** One banded bundle of notes. The unit every pile, pallet and briefcase of cash is built from. */
export const cfCashBundle: PixelSprite = {
  id: 'cf-cash-bundle',
  name: 'cf-cash-bundle',
  tags: ['scene', 'cf', 'cash'],
  blurb: 'A banded bundle of green notes.',
  rows: [
    'mmmwmmm',
    'NNNwNNN',
    'nnnxnnn',
  ],
};

/** A pyramid of bundles on a spill of coins: the company's whole cash pile. */
export const cfCashPile: PixelSprite = {
  id: 'cf-cash-pile',
  name: 'cf-cash-pile',
  tags: ['scene', 'cf', 'cash'],
  blurb: 'Ten bundles stacked four, three, two, one on a heap of gold coins.',
  rows: [
    '.............mmmwmmm.............',
    '.............NNNwNNN.............',
    '.............nnnxnnn.............',
    '.........mmmwmmm.mmmwmmm.........',
    '.........NNNwNNN.NNNwNNN.........',
    '.........nnnxnnn.nnnxnnn.........',
    '.....mmmwmmm.mmmwmmm.mmmwmmm.....',
    '.....NNNwNNN.NNNwNNN.NNNwNNN.....',
    '.....nnnxnnn.nnnxnnn.nnnxnnn.....',
    '.mmmwmmm.mmmwmmm.mmmwmmm.mmmwmmm.',
    '.NNNwNNN.NNNwNNN.NNNwNNN.NNNwNNN.',
    '.nnOOyGO.OyyGOnOOyGOOyyGOnOOyGOn.',
    '..OgGGgOOgGGgOOgGGgOgGGgOOgGGgOO.',
    '.OyyGOOyyGOOyyGOOyyGOyyGOOyyGOyGO',
    'OgGGgOgGGgOgGGggGGgOgGGgOgGGgOgGO',
    'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
  ],
};

/** A gold coin. */
export const cfCoin: PixelSprite = {
  id: 'cf-coin',
  name: 'cf-coin',
  tags: ['scene', 'cf', 'cash'],
  blurb: 'A small gold coin.',
  rows: [
    '.OO.',
    'OyGO',
    'OGgO',
    '.OO.',
  ],
};

/** A gold coin turning over. Pairs with a `rise` motion for cash on its way somewhere. */
export const cfCoinSpin: PixelSprite = {
  id: 'cf-coin-spin',
  name: 'cf-coin-spin',
  tags: ['scene', 'cf', 'cash'],
  blurb: 'A gold coin spinning: face, edge, back.',
  rows: [
    '.OOO.',
    'OyyGO',
    'OyGgO',
    'OGggO',
    '.OOO.',
  ],
  frames: [
    [
      '.OOO.',
      'OyyGO',
      'OyGgO',
      'OGggO',
      '.OOO.',
    ],
    [
      '..OO.',
      '.OyGO',
      '.OGgO',
      '.OggO',
      '..OO.',
    ],
    [
      '..O..',
      '..O..',
      '..O..',
      '..O..',
      '..O..',
    ],
    [
      '.OO..',
      'OGgO.',
      'OggO.',
      'OggO.',
      '.OO..',
    ],
  ],
  frameMs: 260,
};

/** A conveyor running in from the left edge: belt, rollers, legs. Its load is a separate layer. */
export const cfConveyor: PixelSprite = {
  id: 'cf-conveyor',
  name: 'cf-conveyor',
  tags: ['scene', 'cf', 'works'],
  blurb: 'A short belt conveyor on two legs, open to the left.',
  rows: [
    'XXXXXXXXXXXX.',
    'DKDKDKDKDKDKX',
    'XXXXXXXXXXXX.',
    '..D......D...',
    '..D......D...',
    '..D......D...',
    '.DDD....DDD..',
  ],
};

/**
 * What rides the conveyor: bundles moving right two pixels a frame while the belt texture runs
 * with them. Sits three rows above cfConveyor so its bottom row is the belt. The bundles leave the
 * right edge where a pile or a vault should be waiting.
 */
export const cfConveyorLoad: PixelSprite = {
  id: 'cf-conveyor-load',
  name: 'cf-conveyor-load',
  tags: ['scene', 'cf', 'works'],
  blurb: 'Cash bundles riding the belt.',
  rows: [
    'Nm...mNwNm..',
    'NN...NNwNN..',
    'nn...nnxnn..',
    'xXXXxXXXxXXX',
  ],
  frames: [
    [
      'Nm...mNwNm..',
      'NN...NNwNN..',
      'nn...nnxnn..',
      'xXXXxXXXxXXX',
    ],
    [
      'NwNm...mNwNm',
      'NwNN...NNwNN',
      'nxnn...nnxnn',
      'XXxXXXxXXXxX',
    ],
    [
      '.mNwNm...mNw',
      '.NNwNN...NNw',
      '.nnxnn...nnx',
      'xXXXxXXXxXXX',
    ],
    [
      '...mNwNm...m',
      '...NNwNN...N',
      '...nnxnn...n',
      'XXxXXXxXXXxX',
    ],
  ],
  frameMs: 300,
};

/** A window onto the works at dusk: sky, the sawtooth roof, a lit row of windows, the stack. */
export const cfWindowWorks: PixelSprite = {
  id: 'cf-window-works',
  name: 'cf-window-works',
  tags: ['scene', 'cf', 'works'],
  blurb: 'A gold-framed window over the factory roofline at dusk.',
  palette: CF_PALETTE,
  rows: [
    'OOOOOOOOOOOOOOO',
    'OgggggggggggggO',
    'OgEEEEEEEEEEEaO',
    'OgEEEEEEEEEEEaO',
    'OgEEEEEEEEEEEaO',
    'OgIIIIIIIIIIIaO',
    'OgIIIIIIIIIKIaO',
    'Og111111111K1aO',
    'Og11K11K11KK1aO',
    'Og1KK1KK1KKK1aO',
    'OgKKKKKKKKKKKaO',
    'OgKOKKOKKOKKKaO',
    'OaaaaaaaaaaaaaO',
    'OOOOOOOOOOOOOOO',
  ],
};

/** A puff from the stack. Give it a short `rise` inside cfWindowWorks, above column 11. */
export const cfSmokePuff: PixelSprite = {
  id: 'cf-smoke-puff',
  name: 'cf-smoke-puff',
  tags: ['scene', 'cf', 'works'],
  blurb: 'A small grey puff of smoke.',
  rows: [
    '.X.',
    'XxX',
    '.X.',
  ],
};

/**
 * A walnut door in a gold frame. Rows 3 and 4, columns 3 to 10, are its dark transom: lay a
 * coloured strip there to say what is behind it.
 */
export const cfDoor: PixelSprite = {
  id: 'cf-door',
  name: 'cf-door',
  tags: ['scene', 'cf', 'hall'],
  blurb: 'A panelled walnut door with a brass knob and a dark transom.',
  palette: CF_PALETTE,
  rows: [
    'OOOOOOOOOOOOOO',
    '.gggggggggggg.',
    '.OaaaaaaaaaaO.',
    '.OaKKKKKKKKaO.',
    '.OaKKKKKKKKaO.',
    '.OaaaaaaaaaaO.',
    '.OaAAAAAAAAaO.',
    '.OaAaaaaaaAaO.',
    '.OaAaAAAAaAaO.',
    '.OaAaAAAAaAaO.',
    '.OaAaAAAAaAaO.',
    '.OaAaAAAAaAaO.',
    '.OaAaAAAAaAaO.',
    '.OaAaaaaaaAaO.',
    '.OaAAAAAAAAaO.',
    '.OaAAAAAAAGaO.',
    '.OaAAAAAAAAaO.',
    '.OaAaaaaaaAaO.',
    '.OaAaAAAAaAaO.',
    '.OaAaAAAAaAaO.',
    '.OaAaAAAAaAaO.',
    '.OaAaAAAAaAaO.',
    '.OaAaAAAAaAaO.',
    '.OaAaaaaaaAaO.',
    '.OaAAAAAAAAaO.',
    '.OaAAAAAAAAaO.',
    '.OaaaaaaaaaaO.',
  ],
};

/** A gold-framed wall plaque. Its dark face takes a 7x7 sign at (2, 2). */
export const cfPlaque: PixelSprite = {
  id: 'cf-plaque',
  name: 'cf-plaque',
  tags: ['scene', 'cf', 'hall'],
  blurb: 'An empty gold-framed plaque.',
  palette: CF_PALETTE,
  rows: [
    '.OOOOOOOOO.',
    'OgggggggggO',
    'OgKKKKKKKaO',
    'OgKKKKKKKaO',
    'OgKKKKKKKaO',
    'OgKKKKKKKaO',
    'OgKKKKKKKaO',
    'OgKKKKKKKaO',
    'OgKKKKKKKaO',
    'OaaaaaaaaaO',
    '.OOOOOOOOO.',
  ],
};

/** A brass wall lamp, lit. */
export const cfSconce: PixelSprite = {
  id: 'cf-sconce',
  name: 'cf-sconce',
  tags: ['scene', 'cf', 'hall'],
  blurb: 'A lit brass wall lamp.',
  rows: [
    '.yyy.',
    'yyyyG',
    'yyyGG',
    '.GGg.',
    '..O..',
    '.OgO.',
  ],
};

/** The hall clock, its second hand ticking round in eight steps. */
export const cfClock: PixelSprite = {
  id: 'cf-clock',
  name: 'cf-clock',
  tags: ['scene', 'cf', 'hall'],
  blurb: 'A round gold wall clock with a red second hand.',
  rows: [
    '...OOOOO...',
    '..OgggggO..',
    '.OgwwrwwgO.',
    'OgwwwKwwwgO',
    'OgwXXKwwwgO',
    'OgwwwKwwwgO',
    'OgwwwwwwwgO',
    'OgwwwwwwwgO',
    '.OgwwwwwgO.',
    '..OgggggO..',
    '...OOOOO...',
  ],
  frames: [
    [
      '...OOOOO...',
      '..OgggggO..',
      '.OgwwrwwgO.',
      'OgwwwKwwwgO',
      'OgwXXKwwwgO',
      'OgwwwKwwwgO',
      'OgwwwwwwwgO',
      'OgwwwwwwwgO',
      '.OgwwwwwgO.',
      '..OgggggO..',
      '...OOOOO...',
    ],
    [
      '...OOOOO...',
      '..OgggggO..',
      '.OgwwwwwrO.',
      'OgwwwwwKwgO',
      'OgwXXwKwwgO',
      'OgwwwKwwwgO',
      'OgwwwwwwwgO',
      'OgwwwwwwwgO',
      '.OgwwwwwgO.',
      '..OgggggO..',
      '...OOOOO...',
    ],
    [
      '...OOOOO...',
      '..OgggggO..',
      '.OgwwwwwgO.',
      'OgwwwwwwwgO',
      'OgwXXwwwwgO',
      'OgwwwKKKrgO',
      'OgwwwwwwwgO',
      'OgwwwwwwwgO',
      '.OgwwwwwgO.',
      '..OgggggO..',
      '...OOOOO...',
    ],
    [
      '...OOOOO...',
      '..OgggggO..',
      '.OgwwwwwgO.',
      'OgwwwwwwwgO',
      'OgwXXwwwwgO',
      'OgwwwKwwwgO',
      'OgwwwwKwwgO',
      'OgwwwwwKwgO',
      '.OgwwwwwrO.',
      '..OgggggO..',
      '...OOOOO...',
    ],
    [
      '...OOOOO...',
      '..OgggggO..',
      '.OgwwwwwgO.',
      'OgwwwwwwwgO',
      'OgwXXwwwwgO',
      'OgwwwKwwwgO',
      'OgwwwKwwwgO',
      'OgwwwKwwwgO',
      '.OgwwrwwgO.',
      '..OgggggO..',
      '...OOOOO...',
    ],
    [
      '...OOOOO...',
      '..OgggggO..',
      '.OgwwwwwgO.',
      'OgwwwwwwwgO',
      'OgwXXwwwwgO',
      'OgwwwKwwwgO',
      'OgwwKwwwwgO',
      'OgwKwwwwwgO',
      '.OrwwwwwgO.',
      '..OgggggO..',
      '...OOOOO...',
    ],
    [
      '...OOOOO...',
      '..OgggggO..',
      '.OgwwwwwgO.',
      'OgwwwwwwwgO',
      'OgwXXwwwwgO',
      'OgrKKKwwwgO',
      'OgwwwwwwwgO',
      'OgwwwwwwwgO',
      '.OgwwwwwgO.',
      '..OgggggO..',
      '...OOOOO...',
    ],
    [
      '...OOOOO...',
      '..OgggggO..',
      '.OrwwwwwgO.',
      'OgwKwwwwwgO',
      'OgwXKwwwwgO',
      'OgwwwKwwwgO',
      'OgwwwwwwwgO',
      'OgwwwwwwwgO',
      '.OgwwwwwgO.',
      '..OgggggO..',
      '...OOOOO...',
    ],
  ],
  frameMs: 1000,
};

/** Soft floor shadows, cast to the right of whatever stands on them. */
export const cfShadowLong: PixelSprite = {
  id: 'cf-shadow-long',
  name: 'cf-shadow-long',
  tags: ['scene', 'cf', 'hall'],
  blurb: 'A long floor shadow.',
  palette: CF_PALETTE,
  rows: [
    '..ZZZZZZZZZZZZZZZZZZZZZZ..',
    'ZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  ],
};

export const cfShadowShort: PixelSprite = {
  id: 'cf-shadow-short',
  name: 'cf-shadow-short',
  tags: ['scene', 'cf', 'hall'],
  blurb: 'A short floor shadow.',
  palette: CF_PALETTE,
  rows: [
    '.ZZZZZZZZZZ.',
    'ZZZZZZZZZZZZ',
  ],
};

/** Invest: a sprout in a pot. Build or buy something that should come back bigger. */
export const cfSignInvest: PixelSprite = {
  id: 'cf-sign-invest',
  name: 'cf-sign-invest',
  tags: ['scene', 'cf', 'sign'],
  blurb: 'A green sprout in a pot.',
  rows: [
    '..mN...',
    '.mNN.N.',
    '..NnNm.',
    '...nN..',
    '...n...',
    '.OgggO.',
    '..OOO..',
  ],
};

/** Finance: a bank front. Borrow or raise the money. */
export const cfSignFinance: PixelSprite = {
  id: 'cf-sign-finance',
  name: 'cf-sign-finance',
  tags: ['scene', 'cf', 'sign'],
  blurb: 'A blue bank front with columns.',
  rows: [
    '...B...',
    '..BBB..',
    '.BBBBB.',
    '.b.b.b.',
    '.b.b.b.',
    '.b.b.b.',
    'BBBBBBB',
  ],
};

/** Return: a coin and an arrow out. Cash handed back to the owners. */
export const cfSignReturn: PixelSprite = {
  id: 'cf-sign-return',
  name: 'cf-sign-return',
  tags: ['scene', 'cf', 'sign'],
  blurb: 'A gold coin with an arrow leaving it.',
  rows: [
    '...GGGG',
    '.....GG',
    '....G.G',
    '...G...',
    '.OO....',
    'OyGO...',
    '.OO....',
  ],
};

/** A question mark, for a decision not yet made. */
export const cfSignAsk: PixelSprite = {
  id: 'cf-sign-ask',
  name: 'cf-sign-ask',
  tags: ['scene', 'cf', 'sign'],
  blurb: 'A gold question mark.',
  rows: [
    '..yyy..',
    '.yG.yG.',
    '....yG.',
    '...yG..',
    '...yG..',
    '.......',
    '...yG..',
  ],
};

/** An empty thought bubble, tail down and to the right. Its dark face takes a 7x7 sign at (3, 2). */
export const cfBubble: PixelSprite = {
  id: 'cf-bubble',
  name: 'cf-bubble',
  tags: ['scene', 'cf'],
  blurb: 'An empty thought bubble.',
  rows: [
    '..xxxxxxxxx..',
    '.xwwwwwwwwwx.',
    'xwKKKKKKKKKwx',
    'xwKKKKKKKKKwx',
    'xwKKKKKKKKKwx',
    'xwKKKKKKKKKwx',
    'xwKKKKKKKKKwx',
    'xwKKKKKKKKKwx',
    'xwKKKKKKKKKwx',
    '.xwwwwwwwwwx.',
    '..xxxxxxxxx..',
    '.........xw..',
    '.........ww..',
    '...........w.',
  ],
};

/**
 * A thought bubble that cycles through `signs`, one per frame. Its still is the first sign, so under
 * Reduce Motion the bubble shows that one: lead with the sign that makes sense on its own.
 */
export function cfThinking(id: string, signs: readonly PixelSprite[], frameMs: number): PixelSprite {
  const shown = signs.map((sign) => cfCompose(`${id}-${sign.id}`, cfBubble, [[sign, 3, 2]]));
  const still = shown[0];
  if (!still) throw new Error(`cfThinking ${id}: a bubble needs at least one sign`);
  // Each sign's own tones ride along, or a sign drawn in kit tones would not compile in the bubble.
  const palette: Record<string, string> = {};
  for (const frame of shown) Object.assign(palette, frame.palette);
  return {
    ...cfBubble,
    id,
    name: id,
    blurb: 'A thought bubble cycling through signs.',
    palette,
    rows: still.rows,
    frames: shown.map((frame) => frame.rows),
    frameMs,
  };
}

/** Lesson 1: a signpost pointing three ways out of a heap of coins. Invest, finance or return. */
export const cfEmblemSignpost: PixelSprite = {
  id: 'cf-emblem-signpost',
  name: 'cf-emblem-signpost',
  tags: ['scene', 'cf', 'emblem'],
  blurb: 'A wooden signpost with green, blue and gold boards standing in coins.',
  rows: [
    '.......Og.......',
    '.NNNNNNNNNNn....',
    'NmmmmmmmmmmNn...',
    '.nnnnnnOgnnn....',
    '.......Og.......',
    '....BBBBBBBBBBB.',
    '...bBwwwwwwwwwwB',
    '....bbbOgbbbbbb.',
    '.......Og.......',
    '.GGGGGGGGGGg....',
    'GyyyyyyyyyyGg...',
    '.ggggggOgggg....',
    '.....OOOgOO.....',
    '...OOyyGGyGOO...',
    '..OyyGGOOGGGgO..',
    '.OOOOOOOOOOOOOO.',
  ],
};
