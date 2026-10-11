/**
 * Personal Finance art kit: every object the pathway's scenes are built from, drawn once.
 *
 * The pilot drew its opener as one hand-made base, which is right for one lesson and too slow for
 * twenty-five. Here each prop, the figure and every small moving bit is its own sprite, and a scene's
 * base is a list of placements (pfCompose). The world is home on payday: the kitchen table, the
 * window onto the neighbourhood the backdrop shows, and lesson 1's four pillars (earn, spend, save,
 * invest) as four objects on the table. Light comes from the upper left, as on the cast.
 */
import { EUPHORIA_PIXEL_PALETTE } from '../palette';
import type { PixelSprite } from '../types';

/* ── building a base ──────────────────────────────────────────────────────────────────────────── */

/** A kit sprite placed with its top-left at (x, y) on a composed base. */
export type PfStamp = readonly [sprite: PixelSprite, x: number, y: number];

/**
 * Paints stamps over a ground in order, later over earlier, `.` leaving what is under it. The ground
 * is one character filling the base, or hand-drawn rows of the exact size. Pixels past the edge are
 * clipped, so a house can run off the frame. A stamp's own palette (skin, hair) joins the base's; a
 * colour that would retint a shared character, or two sprites disagreeing on one, is an error.
 */
export function pfCompose(
  id: string,
  width: number,
  height: number,
  ground: string | string[],
  stamps: readonly PfStamp[],
): PixelSprite {
  const grid = typeof ground === 'string'
    ? Array.from({ length: height }, () => Array.from({ length: width }, () => ground))
    : ground.map((row) => [...row]);
  if (grid.length !== height || grid.some((row) => row.length !== width)) {
    throw new Error(`${id}: ground is not ${String(width)}x${String(height)}`);
  }
  const palette: Record<string, string> = {};
  for (const [sprite, x, y] of stamps) {
    for (const [ch, hex] of Object.entries(sprite.palette ?? {})) {
      const shared = EUPHORIA_PIXEL_PALETTE[ch];
      if ((shared && shared !== hex) || (palette[ch] && palette[ch] !== hex)) {
        throw new Error(`${id}: ${sprite.id} gives "${ch}" a second colour`);
      }
      palette[ch] = hex;
    }
    sprite.rows.forEach((row, j) => {
      for (let i = 0; i < row.length; i++) {
        const gx = x + i;
        const gy = y + j;
        if (row[i] !== '.' && gy >= 0 && gy < height && gx >= 0 && gx < width) grid[gy][gx] = row[i];
      }
    });
  }
  return {
    id,
    name: id,
    tags: ['scene', 'pf'],
    rows: grid.map((row) => row.join('')),
    ...(Object.keys(palette).length ? { palette } : {}),
  };
}

/**
 * The same framed sprite starting `by` frames later and ticking at its own pace. Frames tick from
 * mount with no offset, so two layers sharing one sprite would flash in step; a twinkle `phase`
 * only offsets opacity, not the shape.
 */
export function pfLater(sprite: PixelSprite, id: string, by: number, frameMs: number): PixelSprite {
  const frames = sprite.frames ?? [sprite.rows];
  return { ...sprite, id, frames: [...frames.slice(by), ...frames.slice(0, by)], frameMs };
}

/* ── the figure ───────────────────────────────────────────────────────────────────────────────── */

/** The cast's medium skin and dark brown hair (sprites-characters.ts), so a pf figure matches the avatars. */
const SKIN: Record<string, string> = {
  M: '#D6A87C',
  C: '#C08552',
  U: '#9A6638',
  j: '#6B3A1F',
  H: '#43291A',
};

export const pfSaver: PixelSprite = {
  id: 'pf-saver',
  name: 'pf-saver',
  tags: ['scene', 'pf'],
  blurb: "The pathway's figure, standing behind a table, arms down. Stamp the table after it.",
  palette: SKIN,
  rows: [
    '.....HHHHHH.....',
    '....HjjjjjjH....',
    '...HjjjjjjjjH...',
    '..HjjjjjjjjjjH..',
    '..HjjMCCjjjjjH..',
    '..HjCCCCCCCCjH..',
    '..HCCKCCCCKCCH..',
    '..HMCCCCCCCCUH..',
    '...MCCCUUCCCU...',
    '....UCCCCCCU....',
    '......UUUU......',
    '...bBBBBBBBBb...',
    '..bBBBwBBwBBBb..',
    '.bBBBBwBBwBBBBb.',
    '.bBBBBBBBBBBBBb.',
    '.bBBbBBBBBBbBBb.',
    '.bBBbBBBBBBbBBb.',
    '.bBBbBBBBBBbBBb.',
    '.bBBbBBBBBBbBBb.',
    '.bBBbBBBBBBbBBb.',
    '.bBBbBBBBBBbBBb.',
    '.bBBbBBBBBBbBBb.',
    '.bBBbBBBBBBbBBb.',
    '.bBBbBBBBBBbBBb.',
    '.bBBbBBBBBBbBBb.',
    '.bBBbBBBBBBbBBb.',
  ],
};

/** The same figure reaching out to its left, hand raised: the hand's middle is column 22, its foot row 10. */
export const pfSaverReach: PixelSprite = {
  id: 'pf-saver-reach',
  name: 'pf-saver-reach',
  tags: ['scene', 'pf'],
  blurb: 'The figure holding something out to let it go, a coin over a slot or a key over a hand.',
  palette: SKIN,
  rows: [
    '.....HHHHHH.............',
    '....HjjjjjjH............',
    '...HjjjjjjjjH...........',
    '..HjjjjjjjjjjH..........',
    '..HjjMCCjjjjjH..........',
    '..HjCCCCCCCCjH..........',
    '..HCCKCCCCKCCH..........',
    '..HMCCCCCCCCUH..........',
    '...MCCCUUCCCU...........',
    '....UCCCCCCU.........MCM',
    '......UUUU.........bBUCU',
    '...bBBBBBBBBb....BBBBb..',
    '..bBBBwBBwBBBBBBBBbb....',
    '.bBBBBwBBwBBBBbbbb......',
    '.bBBBBBBBBBBBBb.........',
    '.bBBbBBBBBBbBBb.........',
    '.bBBbBBBBBBbBBb.........',
    '.bBBbBBBBBBbBBb.........',
    '.bBBbBBBBBBbBBb.........',
    '.bBBbBBBBBBbBBb.........',
    '.bBBbBBBBBBbBBb.........',
    '.bBBbBBBBBBbBBb.........',
    '.bBBbBBBBBBbBBb.........',
    '.bBBbBBBBBBbBBb.........',
    '.bBBbBBBBBBbBBb.........',
    '.bBBbBBBBBBbBBb.........',
  ],
};

/* ── the four pillars, as things on a table ───────────────────────────────────────────────────── */

export const pfPayEnvelope: PixelSprite = {
  id: 'pf-pay-envelope',
  name: 'pf-pay-envelope',
  tags: ['scene', 'pf'],
  blurb: 'EARN. An opened pay envelope with green bills standing out of it.',
  rows: [
    '...nnnnnnnn',
    '.nnnnnnnnNn',
    '.nNmmNNNnNn',
    'DxwwwwwwwxD',
    'DwxwwwwwxwD',
    'DwwxwwwxwwD',
    'DwwwxwxwwwD',
    'DDDDDDDDDDD',
  ],
};

export const pfWallet: PixelSprite = {
  id: 'pf-wallet',
  name: 'pf-wallet',
  tags: ['scene', 'pf'],
  blurb: 'SPEND. An orchid wallet on end, its snap tab on the right and a card showing over the top.',
  rows: [
    '..bBBBBb...',
    '.EbBwwBbE..',
    'EPPPPPPPPE.',
    'EqqqqqqEEEE',
    'EPPPPPPEyGE',
    'EPPPPPPEEEE',
    'EppppppppE.',
    '.EEEEEEEE..',
  ],
};

export const pfPiggyBank: PixelSprite = {
  id: 'pf-piggy-bank',
  name: 'pf-piggy-bank',
  tags: ['scene', 'pf'],
  blurb: 'SAVE. A pink piggy bank facing right, its coin slot on top at columns 6 to 8.',
  rows: [
    '.........II....',
    '....IIKKKIFI...',
    '...IFFFFFFFFI..',
    '..IFwFFFFFFKFI.',
    '.IFwFFFFFFFFfII',
    'IIFFFFFFFFFfIfI',
    '.IFFFFFFFFfffII',
    '..IfFFFFFfffI..',
    '...IfffffffI...',
    '...II.....II...',
  ],
};

export const pfPot: PixelSprite = {
  id: 'pf-pot',
  name: 'pf-pot',
  tags: ['scene', 'pf'],
  blurb: 'INVEST, part one. A terracotta pot of soil; pfSprout grows out of it.',
  rows: [
    '.kkkkkk.',
    '14333321',
    '12222221',
    '.143321.',
    '.133321.',
    '.133221.',
    '..1111..',
  ],
};

export const pfSprout: PixelSprite = {
  id: 'pf-sprout',
  name: 'pf-sprout',
  tags: ['scene', 'pf'],
  blurb: 'INVEST, part two. A two-leaf sprout swaying; its stem foot sits on pfPot soil at column 3.',
  rows: [
    'NN...NN',
    'mNN.NNm',
    '.NNnNN.',
    '...n...',
    '...n...',
  ],
  frames: [
    [
      'NN...NN',
      'mNN.NNm',
      '.NNnNN.',
      '...n...',
      '...n...',
    ],
    [
      'NN..NN.',
      'mNNNNm.',
      '.NNnN..',
      '...n...',
      '...n...',
    ],
    [
      'NN...NN',
      'mNN.NNm',
      '.NNnNN.',
      '...n...',
      '...n...',
    ],
    [
      '.NN..NN',
      '.mNNNNm',
      '..NnNN.',
      '...n...',
      '...n...',
    ],
  ],
  frameMs: 600,
};

/* ── the room ─────────────────────────────────────────────────────────────────────────────────── */

/**
 * The kitchen every pf opener stands in, 80x60 like the pilot's: wall, a lit baseboard, the floor
 * and a dark rug edged in deep orchid where the table's legs land. Pass its rows as pfCompose's ground.
 */
export const pfKitchen: PixelSprite = {
  id: 'pf-kitchen',
  name: 'pf-kitchen',
  tags: ['scene', 'pf'],
  rows: [
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEKKKKKKK',
    'KKKKKKEkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkEKKKKKK',
    'KKKKKKEkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkEKKKKKK',
    'KKKKKKEkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkEKKKKKK',
    'KKKKKKEkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkEKKKKKK',
    'KKKKKKEkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkEKKKKKK',
    'KKKKKKEkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkEKKKKKK',
    'KKKKKKKEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
  ],
};

/** The kitchen table at any width: back edge, top, lit front lip, apron, and two legs `legs` tall. */
export function pfTable(width: number, legs: number): PixelSprite {
  const span = (edge: string, fill: string) => edge + fill.repeat(width - 2) + edge;
  const leg = '.OgO' + '.'.repeat(width - 8) + 'OgO.';
  return {
    id: `pf-table-${String(width)}`,
    name: 'pf-table',
    tags: ['scene', 'pf'],
    rows: [
      span('.', 'O'),
      span('O', 'g'),
      span('O', 'G'),
      span('O', 'O'),
      span('O', 'g'),
      span('O', 'O'),
      ...Array.from({ length: legs }, () => leg),
    ],
  };
}

export const pfWindowDusk: PixelSprite = {
  id: 'pf-window-dusk',
  name: 'pf-window-dusk',
  tags: ['scene', 'pf'],
  blurb: 'A sash window at sunset onto rooftops; a chimney top at column 5, row 12.',
  rows: [
    '.DDDDDDDDDDDDDDDDDDDDDDDD.',
    '.DXXXXXXXXXXXXXXXXXXXXXXD.',
    '.DXEEEEEEEEEEEEEEEEEEEEXD.',
    '.DXEEEEEEEEEEEEEEEEEEEEXD.',
    '.DXppppppppppppppppppppXD.',
    '.DXppppppppppppppppppppXD.',
    '.DXXXXXXXXXXXXXXXXXXXXXXD.',
    '.DXffffffffffffffffffffXD.',
    '.DXffffffffffffffffffffXD.',
    '.DX33333333333333333333XD.',
    '.DX33333333333333333333XD.',
    '.DX44444444444555444444XD.',
    '.DX44K4444444555554444KXD.',
    '.DX4KKK444444555554444KXD.',
    '.DXKKKKK4KKKKKKKKKK44KKXD.',
    '.DXKyKKK4KyKKKKyKKK44KyXD.',
    '.DXKKKKK4KKKKKKKKKK44KKXD.',
    '.DXKKKKKKKKKKKKKKKKKKKKXD.',
    '.DXXXXXXXXXXXXXXXXXXXXXXD.',
    'DxxxxxxxxxxxxxxxxxxxxxxxxD',
    'DDDDDDDDDDDDDDDDDDDDDDDDDD',
  ],
};

export const pfCurtain: PixelSprite = {
  id: 'pf-curtain',
  name: 'pf-curtain',
  tags: ['scene', 'pf'],
  blurb: 'An orchid curtain panel gathered by a gold tie; it overlaps a window frame by two columns.',
  rows: [
    'EqPE',
    'EqPE',
    'EqPE',
    'EqPE',
    'EqPE',
    'EqPE',
    'EqPE',
    'EqPE',
    'EqPE',
    'EqPE',
    '.EE.',
    'yGGg',
    '.EE.',
    'EqPE',
    'EqpE',
    'EqPE',
    'EqpE',
    'EqPE',
    'EpEE',
  ],
};

export const pfPendantLamp: PixelSprite = {
  id: 'pf-pendant-lamp',
  name: 'pf-pendant-lamp',
  tags: ['scene', 'pf'],
  blurb: 'A green enamel pendant lamp on a short cord; hang it from row 0.',
  rows: [
    '....X....',
    '....X....',
    '....X....',
    '...DXD...',
    '..nNNNn..',
    '.nNmNNNn.',
    'nNmNNNNNn',
    'nnnnnnnnn',
    '..yyWyy..',
  ],
};

/** The lamp's pool on a pfTable top, centred under the shade: a lit top row, then a brighter lip. */
export const pfLampPool: PixelSprite = {
  id: 'pf-lamp-pool',
  name: 'pf-lamp-pool',
  tags: ['scene', 'pf'],
  rows: [
    '..GGGGGGGGGGGGGGGGG..',
    'yyyyyyyyyyyyyyyyyyyyy',
  ],
};

export const pfLampGlow: PixelSprite = {
  id: 'pf-lamp-glow',
  name: 'pf-lamp-glow',
  tags: ['scene', 'pf'],
  blurb: 'Warm light spilling under the pendant shade, for a slow twinkle.',
  rows: [
    '.GyyyG.',
    'G.y.y.G',
  ],
};

export const pfDiploma: PixelSprite = {
  id: 'pf-diploma',
  name: 'pf-diploma',
  tags: ['scene', 'pf'],
  blurb: 'A framed diploma with a red seal: just graduated, first job, first paycheck.',
  rows: [
    'OOOOOOOOOOO',
    'OgggggggggO',
    'OgwwwwwwwgO',
    'OgwxxxxxwgO',
    'OgwwwwwwwgO',
    'OgwxxxwRwgO',
    'OgwwwwrrwgO',
    'OgggggggggO',
    'OOOOOOOOOOO',
  ],
};

export const pfCalendar: PixelSprite = {
  id: 'pf-calendar',
  name: 'pf-calendar',
  tags: ['scene', 'pf'],
  blurb: 'A wall calendar: nine days crossed off in red, payday in gold at column 4, row 9.',
  rows: [
    '...D.....D...',
    'rRRDRRRRRDRRr',
    'rRwwwRwwwwRRr',
    'rrrrrrrrrrrrr',
    'wwwwwwwwwwwwx',
    'wrwwrwwrwwrwx',
    'wwwwwwwwwwwwx',
    'wrwwrwwrwwrwx',
    'wwwwwwwwwwwwx',
    'wrwwGwwXwwXwx',
    'wwwwwwwwwwwwx',
    'xxxxxxxxxxxxx',
  ],
};

/** A ring around the calendar's payday, for a pulse. Its centre sits on the payday square. */
export const pfPaydayRing: PixelSprite = {
  id: 'pf-payday-ring',
  name: 'pf-payday-ring',
  tags: ['scene', 'pf'],
  rows: [
    'NNN',
    'N.N',
    'NNN',
  ],
};

/* ── small moving bits ────────────────────────────────────────────────────────────────────────── */

export const pfCoin: PixelSprite = {
  id: 'pf-coin',
  name: 'pf-coin',
  tags: ['scene', 'pf'],
  rows: [
    '.OO.',
    'OyGO',
    'OGgO',
    '.OO.',
  ],
};

/**
 * A coin let go over a slot: held, falling, swallowed row by row, a glint where it went in, then a
 * new coin in hand. The slot is under the bottom row, so place the sprite's foot on it.
 */
export const pfCoinDrop: PixelSprite = {
  id: 'pf-coin-drop',
  name: 'pf-coin-drop',
  tags: ['scene', 'pf'],
  blurb: 'A coin dropping into a slot directly below the sprite.',
  rows: [
    '.OO.',
    'OyGO',
    'OGgO',
    '.OO.',
    '....',
    '....',
    '....',
  ],
  frames: [
    ['.OO.', 'OyGO', 'OGgO', '.OO.', '....', '....', '....'],
    ['.OO.', 'OyGO', 'OGgO', '.OO.', '....', '....', '....'],
    ['.OO.', 'OyGO', 'OGgO', '.OO.', '....', '....', '....'],
    ['....', '.OO.', 'OyGO', 'OGgO', '.OO.', '....', '....'],
    ['....', '....', '....', '.OO.', 'OyGO', 'OGgO', '.OO.'],
    ['....', '....', '....', '....', '....', '.OO.', 'OyGO'],
    ['....', '....', '....', '....', '....', '....', '.OO.'],
    ['....', '....', '....', '....', '.y..', 'yWy.', '.y..'],
    ['....', '....', '....', '....', '....', '.w..', '....'],
    ['....', '....', '....', '....', '....', '....', '....'],
  ],
  frameMs: 170,
};

export const pfSmoke: PixelSprite = {
  id: 'pf-smoke',
  name: 'pf-smoke',
  tags: ['scene', 'pf'],
  blurb: 'Chimney smoke in two pale puffs for a rise, read against a sunset.',
  rows: [
    '.xx.',
    'xwxX',
    '.xX.',
    '..xx',
    '.xXx',
    '..X.',
  ],
};

/** The household cat asleep, facing left: its head is columns 0 to 8. Every pf home scene can keep one. */
export const pfCat: PixelSprite = {
  id: 'pf-cat',
  name: 'pf-cat',
  tags: ['scene', 'pf'],
  blurb: 'An orange tabby curled asleep on the floor, tail wrapped along its front.',
  rows: [
    '..1...1.........',
    '.131.131........',
    '.1333331.111111.',
    '1333333313444331',
    '1311311332323331',
    '1333333333333331',
    '.14444443322221.',
    '..111111111111..',
  ],
};

/** A sleeper's z, for a slow rise over pfCat's head. */
export const pfZzz: PixelSprite = {
  id: 'pf-zzz',
  name: 'pf-zzz',
  tags: ['scene', 'pf'],
  rows: [
    'xxxx',
    '..x.',
    '.x..',
    'xxxx',
  ],
};

export const pfBird: PixelSprite = {
  id: 'pf-bird',
  name: 'pf-bird',
  tags: ['scene', 'pf'],
  blurb: 'A far bird flapping, dark against a sunset.',
  rows: [
    'K.K',
    '.K.',
  ],
  frames: [
    ['K.K', '.K.'],
    ['...', 'KKK'],
  ],
  frameMs: 420,
};

/** A glint that turns as it fades: a long diagonal cross, a small upright one, a point, a small diagonal. */
export const pfSparkle: PixelSprite = {
  id: 'pf-sparkle',
  name: 'pf-sparkle',
  tags: ['scene', 'pf'],
  rows: [
    'y...y',
    '.y.y.',
    '..W..',
    '.y.y.',
    'y...y',
  ],
  frames: [
    ['y...y', '.y.y.', '..W..', '.y.y.', 'y...y'],
    ['.....', '..y..', '.yWy.', '..y..', '.....'],
    ['.....', '.....', '..w..', '.....', '.....'],
    ['.....', '.y.y.', '..W..', '.y.y.', '.....'],
  ],
  frameMs: 360,
};

/* ── emblems: the centre of the pathway keepsake (pf1-finish.ts), 14x9 at most ───────────────── */

/** Lesson 1: the four pillars under one lintel, coloured as the lesson's diagram (earn, spend, save, invest). */
export const pfEmblemPillars: PixelSprite = {
  id: 'pf-emblem-pillars',
  name: 'pf-emblem-pillars',
  tags: ['scene', 'pf', 'emblem'],
  rows: [
    'wwwwwwwwwwwwww',
    'XXXXXXXXXXXXXX',
    'mN..qP..Bb..yG',
    'mN..qP..Bb..yG',
    'mN..qP..Bb..yG',
    'mN..qP..Bb..yG',
    'nn..pp..bb..gg',
    'wwwwwwwwwwwwww',
    'XXXXXXXXXXXXXX',
  ],
};
