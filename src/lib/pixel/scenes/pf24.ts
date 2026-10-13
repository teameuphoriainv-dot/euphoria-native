/**
 * Personal Finance lesson 24, Teaching Kids About Money: spend, save, give, from the first coins.
 *
 * A new set, the pavement out front on a summer evening: a clipped hedge, the house behind with its
 * window lit, and a lemonade stand with LEMONADE painted on its sign. Behind the stand a child, a
 * small saver in a teal shirt, drops the day's first coin into the middle of three jars, a pink
 * piggy on the SAVE jar's label between the SPEND jar's bag and the GIVE jar's heart, while the
 * figure, the parent now, stands by. The pitcher and cups wait at the end; the cat sleeps on the
 * pavement. Moving: the coin, the porch light, a glint on the pitcher, a firefly, the cat's z.
 */
import type { PixelSprite } from '../types';
import { pfCat, pfCoinDrop, pfCompose, pfSaver, pfSparkle, pfZzz } from './pf-kit';
import { pfText } from './pf-kit-b';
import { pfKeepsake } from './pf1-finish';
import { pfBackdrop } from './pf-backdrop';
import type { LessonArtSet, SceneArt } from './types';

const SKIN: Record<string, string> = {
  M: '#D6A87C',
  C: '#C08552',
  U: '#9A6638',
  j: '#6B3A1F',
  H: '#43291A',
};

const SKY = ['E', 'E', 'E', 'E', 'p', 'p', 'p', 'p', 'p', 'f', 'f', 'f', 'f', 'f', 'f', 'F', 'F', 'F', 'F', 'F'];

/**
 * The street out front: an evening sky, the house on the right (a slate roof, dark siding), a clipped
 * hedge along the front garden from about row 25, and the pavement from row 43.
 */
function frontStreet(): string[] {
  return Array.from({ length: 60 }, (_, y) =>
    Array.from({ length: 80 }, (_, x) => {
      if (y >= 43) return y === 43 ? 'X' : y % 4 === 0 || (x + (y % 8 < 4 ? 0 : 6)) % 12 === 0 ? 'k' : 'D';
      const roof = 12 - Math.floor((x - 50) / 2);
      if (x >= 50 && y >= Math.max(roof, 3)) {
        if (y === Math.max(roof, 3) || (y < 13 && y === roof + 1)) return 'X';
        if (y < 13) return 'K';
        return y % 3 === 0 ? 'k' : 'D';
      }
      const hedge = 25 + (x % 6 === 2 || x % 6 === 3 ? 0 : x % 6 === 1 || x % 6 === 4 ? 1 : 2);
      if (y >= hedge) {
        if (y === hedge) return 'N';
        return (x * 5 + y * 3) % 23 === 0 ? 'N' : 'n';
      }
      return SKY[Math.min(y, SKY.length - 1)];
    }).join(''),
  );
}

/** The house's lit window with an orchid curtain drawn to one side, and the porch light by the door. */
const houseWindow: PixelSprite = {
  id: 'pf24-house-window',
  name: 'house window',
  tags: ['scene', 'pf'],
  rows: [
    'XXXXXXXXXXXX',
    'XqPyyyyyGGGX',
    'XqPyyyyyyGGX',
    'XqPyyyyyyyGX',
    'XXXXXXXXXXXX',
    'XqPGyyyyyGgX',
    'XqPGGyyyGGgX',
    'XqPgGGGGGggX',
    'XXXXXXXXXXXX',
  ],
};
const porchLamp: PixelSprite = {
  id: 'pf24-porch-lamp',
  name: 'porch lamp',
  tags: ['scene', 'pf'],
  rows: [
    'D.',
    'DD',
    'Dy',
    'DD',
  ],
};
const porchGlow: PixelSprite = {
  id: 'pf24-porch-glow',
  name: 'porch glow',
  tags: ['scene', 'pf'],
  rows: [
    'G.G',
    '...',
    'G.G',
  ],
};

/**
 * The child, a small saver: the cast's skin and hair in two bunches, a teal shirt, and the right arm
 * raised high with the hand at columns 13 to 15, rows 0 and 1, so a pfCoinDrop hangs at (x + 13, y + 1).
 */
const child: PixelSprite = {
  id: 'pf24-child',
  name: 'child',
  tags: ['scene', 'pf'],
  palette: SKIN,
  rows: [
    '.............MCM',
    '...HHHHHH....UCU',
    'HHHjjjjjjHHH.TT.',
    'HjHjjjjjjjHjTTt.',
    '.HjjMCCjjjjHTt..',
    '..HCCCCCCCCHTt..',
    '..HCKCCCKCCTTt..',
    '..HMCCCCCCUTt...',
    '...MCCssCCUTt...',
    '....UCCCCUTt....',
    '.....UUUUTt.....',
    '...tTTTTTTTt....',
    '..tTTTwTTTTt....',
    '..tTTTTTTTTt....',
    '..tTTtTTTTTt....',
    '..tTTtTTTTTt....',
    '..tTTtTTTTTt....',
  ],
};

/** The three jars' labels: a shopping bag (spend), a pink piggy (save), a red heart (give). */
const ICON_BAG = ['.x.x.', 'PPPPP', 'PqPPP', 'ppppp'];
const ICON_PIGGY = ['.FFF.', 'FwFFI', 'FFFFF', '.I.I.'];
const ICON_HEART = ['RR.RR', 'RsRRR', '.RRR.', '..R..'];

/**
 * A jar with a coloured lid slotted for coins (columns 3 to 5 of row 1), a white label with its icon,
 * and coins to the `coins` row from the bottom showing under the label.
 */
function kidJar(id: string, lid: string, lidShade: string, icon: readonly string[], coins: number): PixelSprite {
  const coinRow = (i: number) => (i < coins ? 'xGyGgGyGX' : 'x.......X');
  return {
    id,
    name: id,
    tags: ['scene', 'pf'],
    rows: [
      '.' + lidShade + lid.repeat(5) + lidShade + '.',
      '.' + lidShade + lid + 'KKK' + lid + lidShade + '.',
      'xxxxxxxxX',
      'xw......X',
      'xwwwwwwwX',
      ...icon.map((r) => 'xw' + r + 'wX'),
      coinRow(1),
      coinRow(0),
      '.xxxxxxX.',
    ],
  };
}

/** The lemonade stand: a counter (a back edge, a lit top, a lip), a front of planks, short legs. */
function stand(width: number): PixelSprite {
  return {
    id: 'pf24-stand',
    name: 'stand',
    tags: ['scene', 'pf'],
    rows: [
      '.' + 'O'.repeat(width - 2) + '.',
      'O' + 'g'.repeat(width - 2) + 'O',
      'O' + 'G'.repeat(width - 2) + 'O',
      'O'.repeat(width),
      ...Array.from({ length: 13 }, (_, y) =>
        Array.from({ length: width }, (_, x) => (x === 0 || x === width - 1 || y === 12 ? 'O' : x % 5 === 0 ? 'O' : 'g')).join(''),
      ),
      'OO' + '.'.repeat(width - 4) + 'OO',
      'OO' + '.'.repeat(width - 4) + 'OO',
    ],
  };
}

/** The sign hung on the stand's front, lemon yellow with a deep gold border; the word goes on it. */
const sign: PixelSprite = {
  id: 'pf24-sign',
  name: 'sign',
  tags: ['scene', 'pf'],
  rows: [
    'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
    ...Array.from({ length: 7 }, () => 'OyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyO'),
    'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
  ],
};

/** A glass pitcher of lemonade with a lemon slice on the rim, and two paper cups. */
const pitcher: PixelSprite = {
  id: 'pf24-pitcher',
  name: 'pitcher',
  tags: ['scene', 'pf'],
  rows: [
    '.xxxxxyG..',
    'xw.....yG.',
    'xyyyyyyX.x',
    'xwyyyGyX.x',
    'xyyyyyGX.x',
    'xwyyyGgXx.',
    'xyyyGgGX..',
    '.xxxxxX...',
  ],
};
const cups: PixelSprite = {
  id: 'pf24-cups',
  name: 'cups',
  tags: ['scene', 'pf'],
  rows: [
    'wwww.wwww',
    'xRRX.xRRX',
    'xwwX.xwwX',
    '.xX...xX.',
  ],
};

/** A firefly over the fence. */
const firefly: PixelSprite = {
  id: 'pf24-firefly',
  name: 'firefly',
  tags: ['scene', 'pf'],
  rows: [
    'y',
  ],
};

/**
 * Lesson 24's emblem: the three jars, spend, save and give, under their orchid, gold and red lids and
 * marked as on the stand, a shopping bag, a pink piggy and a red heart, coins in the bottom of each.
 */
const emblemThreeJars: PixelSprite = {
  id: 'pf24-emblem-three-jars',
  name: 'pf24-emblem-three-jars',
  tags: ['scene', 'pf', 'emblem'],
  rows: [
    '.PPP.GGG.RRR.',
    '.ppp.ggg.rrr.',
    'xxxxxxxxxxxxX',
    'xw.wxwFwxR.RX',
    'xPPPxFFFxRRRX',
    'xPqPxFwFxwRwX',
    'xPPPxI.IxwwwX',
    'xGyGxGyGxGyGX',
    '.xxxxxxxxxxX.',
  ],
};

// Order is depth: the house's window and lamp, the parent and the child behind the stand, the jars
// and the pitcher on the counter, the stand over their lower halves, its sign, the cat in front.
const base = pfCompose('pf24-opener-base', 80, 60, frontStreet(), [
  [houseWindow, 63, 16],
  [porchLamp, 77, 18],
  [pfSaver, 45, 9],
  [child, 12, 17],
  [stand(72), 1, 34],
  [kidJar('pf24-jar-spend', 'P', 'p', ICON_BAG, 1), 2, 24],
  [kidJar('pf24-jar-save', 'G', 'g', ICON_PIGGY, 2), 23, 24],
  [kidJar('pf24-jar-give', 'R', 'r', ICON_HEART, 1), 33, 24],
  [pitcher, 60, 28],
  [cups, 47, 32],
  [sign, 19, 38],
  [pfText('pf24-lemonade', 'LEMONADE', 'O'), 21, 40],
  [pfCat, 58, 52],
]);

export const pf24Opener: SceneArt = {
  id: 'pf24-opener',
  label: 'On a summer evening outside the house, a child at a lemonade stand drops a coin into the middle of three jars labelled with a shopping bag, a piggy bank and a heart, for spend, save and give, while their parent stands beside them, with a pitcher of lemonade, a LEMONADE sign and the cat asleep on the pavement.',
  width: 80,
  height: 60,
  base,
  layers: [
    // The coin hangs from the child's raised hand (child at 12,17; hand at columns 13 to 15, row 1)
    // over the save jar's slot (jar at 23,24; slot at columns 3 to 5 of row 1).
    { sprite: pfCoinDrop, x: 25, y: 18 },
    { sprite: porchGlow, x: 77, y: 19, motion: { kind: 'twinkle', periodMs: 2600, min: 0.3 } },
    { sprite: pfSparkle, x: 63, y: 24, motion: { kind: 'twinkle', periodMs: 1900, min: 0.35, phase: 0.4 } },
    { sprite: firefly, x: 5, y: 31, motion: { kind: 'twinkle', periodMs: 2100, min: 0.1 } },
    { sprite: pfZzz, x: 56, y: 47, motion: { kind: 'rise', amp: 3, periodMs: 2800, phase: 0.3 } },
  ],
};

export const pf24Finish = pfKeepsake(
  'pf24-finish',
  'A gold house-shaped key fob with a teal roof on a key ring with a brass key, its window showing three little jars under orchid, gold and red lids, marked with a shopping bag, a piggy bank and a heart, with small sparkles around it.',
  emblemThreeJars,
);

export const art: LessonArtSet = { opener: pf24Opener, backdrop: pfBackdrop, finish: pf24Finish };
