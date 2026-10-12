/**
 * Personal Finance lesson 9, Smart Saving & Banking: same insurance, 500 times the interest. Switch.
 *
 * The frame is split, the lesson's own comparison. On the left, dimmed, the little bank from the
 * backdrop's street: dressed stone, the top of a round vault door behind a marble counter with a brass
 * deposit tray, and a board reading 0.01% over three flat grey bars (year 1, 5 and 10 of $10,000
 * there). On the right, home: the figure stands at the desk, the piggy bank beside it, holding out a
 * phone whose online savings account reads 5% over three green bars that grow 6, 7 and 9 pixels, the
 * lesson's $10,500, $12,763 and $16,289 on the same scale as the bank's flat ones. One green shield,
 * the same deposit insurance, badges both. Moving: coins leaving the bank's tray and arcing into the
 * phone, the arrow over the tallest bar, the lamp, a glint over the piggy, the cat's z.
 */
import type { PixelSprite } from '../types';
import {
  pfCat,
  pfCoin,
  pfCompose,
  pfKitchen,
  pfLampGlow,
  pfPendantLamp,
  pfPiggyBank,
  pfSparkle,
  pfTable,
  pfZzz,
} from './pf-kit';
import { pfSaverReachLeft } from './pf-kit-a';
import { pfText } from './pf-kit-b';
import { pfKeepsake } from './pf1-finish';
import { pfBackdrop } from './pf-backdrop';
import type { LessonArtSet, SceneArt } from './types';

/** The left third is the bank, columns 0 to 26; a two-pixel frame edge; home from column 29. */
const BANK_W = 27;

/** The bank's hall: dressed stone in staggered courses above the counter, a checked floor below. */
function bankHall(): string[] {
  return Array.from({ length: 60 }, (_, y) =>
    Array.from({ length: 80 }, (_, x) => {
      if (y >= 50) return (Math.floor(x / 8) + Math.floor((y - 50) / 5)) % 2 ? 'D' : 'k';
      if (y % 6 === 5) return 'K';
      return (x + (Math.floor(y / 6) % 2 ? 8 : 0)) % 16 === 15 ? 'K' : 'k';
    }).join(''),
  );
}

/** The split ground: the bank's stone on the left, the frame edge, the pathway's kitchen on the right. */
function splitGround(): string[] {
  const hall = bankHall();
  return hall.map((row, y) => row.slice(0, BANK_W) + 'XD' + pfKitchen.rows[y].slice(BANK_W + 2));
}

/** The bank side is dimmed: every light step drops one, so it reads as the place being left. */
const DIM: Record<string, string> = { W: 'x', w: 'x', x: 'X', y: 'g', G: 'g', g: 'O' };
function dimmed(sprite: PixelSprite, id: string): PixelSprite {
  return { ...sprite, id, name: id, rows: sprite.rows.map((row) => row.replace(/[WwxyGg]/g, (ch) => DIM[ch])) };
}

/** The counter across the bank's third: a marble top, a brass rail, raised panels, a kick plate. */
const COUNTER_PANEL = ['XDDDDDDDDDDDDDDX', 'XDXXXXXXXXXXXXDX', 'XDDDDDDDDDDDDDDX'];
const counter: PixelSprite = {
  id: 'pf9-counter',
  name: 'counter',
  tags: ['scene', 'pf'],
  rows: [
    'w'.repeat(BANK_W),
    'x'.repeat(BANK_W),
    'G'.repeat(BANK_W),
    'g'.repeat(BANK_W),
    COUNTER_PANEL[0].repeat(2).slice(0, BANK_W),
    ...Array.from({ length: 5 }, () => COUNTER_PANEL[1].repeat(2).slice(0, BANK_W)),
    COUNTER_PANEL[2].repeat(2).slice(0, BANK_W),
    'X'.repeat(BANK_W),
    'D'.repeat(BANK_W),
    'K'.repeat(BANK_W),
  ],
};

/** The brass deposit tray set in the counter top, its slot on the second row. */
const tray: PixelSprite = {
  id: 'pf9-tray',
  name: 'tray',
  tags: ['scene', 'pf'],
  rows: [
    'OGGGGGGO',
    'OgKKKKgO',
  ],
};

/** The vault door in its steel frame, bolts on the rim, hinges on the left. Only its top shows over the counter. */
const vault: PixelSprite = {
  id: 'pf9-vault',
  name: 'vault',
  tags: ['scene', 'pf'],
  rows: [
    'DDDDDDDDDDDDDDDDDDDDDDDDD',
    'DXXXXXXXXXXXXXXXXXXXXXXXD',
    'DXKKKKKKKKDDDDDKKKKKKKKKD',
    'DXKKKKKDDDxxxxxDDDKKKKKKD',
    'DXKKKKDDxxxxyxxxXDDKKKKKD',
    'DXKKKDxxxxDDDDDXXXXDKKKKD',
    'DOGODxyxDDDwxxDDDXyXDKKKD',
    'DOGODxxDDwwxxxxxDDXXDDKKD',
    'DXKDxxDDwwxxxxxxxDDXXDKKD',
    'DXKDxxDwwxxxxxxxxxDXXDKKD',
    'DXDxxDDwxxxxxxxxxxDDXXDKD',
    'DXDxxDwxxxxxxxxxxxxDXXDKD',
    'DXDxyDxxxxxxxxxxxxxDyXDKD',
    'DXDxxDxxxxxxxxxxxxxDXXDKD',
    'DXDxxDDxxxxxxxxxxxDDXXDKD',
    'DXKDxXDxxxxxxxxxxxDXXDKKD',
    'DXKDXXDDxxxxxxxxxDDXXDKKD',
    'DOGODXXDDxxxxxxxDDXXDDKKD',
    'DOGODXyXDDDxxxDDDXyXDKKKD',
    'DXKKKDXXXXDDDDDXXXXDKKKKD',
    'DXKKKKDDXXXXyXXXXDDKKKKKD',
    'DXKKKKKDDDXXXXXDDDKKKKKKD',
    'DXKKKKKKKKDDDDDKKKKKKKKKD',
    'DXKKKKKKKKKKKKKKKKKKKKKKD',
    'DDDDDDDDDDDDDDDDDDDDDDDDD',
  ],
};

/** The vault's wheel, square, standing still on the door. */
const vaultWheel: PixelSprite = {
  id: 'pf9-vault-wheel',
  name: 'vault wheel',
  tags: ['scene', 'pf'],
  rows: [
    '....y....',
    '....G....',
    '....G....',
    '...OOO...',
    'yGGOyOGGy',
    '...OOO...',
    '....G....',
    '....G....',
    '....y....',
  ],
};

/** The deposit insurance, a small green shield: the same one badges the bank's board and the phone. */
const shield: PixelSprite = {
  id: 'pf9-shield',
  name: 'shield',
  tags: ['scene', 'pf'],
  rows: [
    'nNNNn',
    'NmNNn',
    'NNNNn',
    '.NNn.',
    '..n..',
  ],
};

/** "0.01%" in the 3x5 capitals; the font has no point, so the point is drawn as one pixel. */
function bankRate(ink: string): string[] {
  const zero = pfText('pf9-rate-0', '0', ink).rows;
  const rest = pfText('pf9-rate-01', '01%', ink).rows;
  return zero.map((row, i) => `${row}.${i === 4 ? ink : '.'}.${rest[i]}`);
}

/**
 * The bank's rate board: 0.01% over three flat grey bars, year 1, 5 and 10 of $10,000 at 0.01%
 * ($10,001, $10,005, $10,010), on the phone's scale, where $10,500 is six pixels.
 */
const bankBoard: PixelSprite = {
  id: 'pf9-bank-board',
  name: 'bank board',
  tags: ['scene', 'pf'],
  rows: [
    'DDDDDDDDDDDDDDDDDDDDDDD',
    'DXXXXXXXXXXXXXXXXXXXXXD',
    'DXKKKKKKKKKKKKKKKKKKKXD',
    ...bankRate('x').map((row) => `DXK${row}KXD`),
    'DXKKKKKKKKKKKKKKKKKKKXD',
    'DXKKKKKKKKKKKKKKKKKKKXD',
    'DXKKKxxXKKxxXKKxxXKKKXD',
    ...Array.from({ length: 5 }, () => 'DXKKKXXDKKXXDKKXXDKKKXD'),
    'DXKDDDDDDDDDDDDDDDDDKXD',
    'DXXXXXXXXXXXXXXXXXXXXXD',
    'DDDDDDDDDDDDDDDDDDDDDDD',
  ],
};

/** The bars on the phone, bottom-aligned: the lesson's $10,500, $12,763, $16,289 at 6, 7 and 9 pixels. */
const HYSA_BARS = [6, 7, 9];

/**
 * The phone held out, dark and rounded with its notch, an online savings account lit on its screen:
 * 5% over the three green bars. The screen is columns 2 to 11, rows 2 to 18; the tallest bar is
 * columns 9 and 10.
 */
function phone(): PixelSprite {
  const grid = [
    [...'.DDDDDDDDDDDD.'],
    [...'DXDDDKKKKDDDDD'],
    ...Array.from({ length: 17 }, () => [...'DXwwwwwwwwwwDD']),
    [...'DXDDDDDDDDDDDD'],
    [...'.DDDDDDDDDDDD.'],
  ];
  pfText('pf9-rate-5', '5%', 'n').rows.forEach((row, j) => {
    [...row].forEach((ch, i) => {
      if (ch !== '.') grid[3 + j][3 + i] = ch;
    });
  });
  HYSA_BARS.forEach((h, b) => {
    for (let k = 0; k < h; k++) {
      grid[18 - k][3 + b * 3] = 'N';
      grid[18 - k][4 + b * 3] = 'n';
    }
  });
  return { id: 'pf9-phone', name: 'phone', tags: ['scene', 'pf'], rows: grid.map((row) => row.join('')) };
}

/** The arrow over the tallest bar, green on the lit screen, for a twinkle. */
const arrowGlow: PixelSprite = {
  id: 'pf9-arrow-glow',
  name: 'arrow glow',
  tags: ['scene', 'pf'],
  rows: [
    '.NN.',
    'NNNN',
  ],
};

/**
 * Coins leaving the bank: one rises out of the brass tray (its foot on the tray at the sprite's last
 * row), arcs over the frame edge and drops onto the phone's first bar, a glint, then the next.
 */
const COIN_PATH: readonly (readonly [number, number])[] = [[0, 18], [2, 11], [5, 6], [8, 3], [11, 1], [14, 1], [16, 3], [18, 7]];
function coinAt(at: readonly [number, number] | null, glint = false): string[] {
  const rows = Array.from({ length: 22 }, () => [...'.'.repeat(22)]);
  if (at) {
    pfCoin.rows.forEach((row, j) => {
      [...row].forEach((ch, i) => {
        if (ch !== '.') rows[at[1] + j][at[0] + i] = ch;
      });
    });
  }
  if (glint) {
    ['.y.', 'yWy', '.y.'].forEach((row, j) => {
      [...row].forEach((ch, i) => {
        if (ch !== '.') rows[8 + j][18 + i] = ch;
      });
    });
  }
  return rows.map((row) => row.join(''));
}
const coinArc: PixelSprite = {
  id: 'pf9-coin-arc',
  name: 'coin arc',
  tags: ['scene', 'pf'],
  rows: coinAt(COIN_PATH[0]),
  frames: [...COIN_PATH.map((at) => coinAt(at)), coinAt(null, true), coinAt(null)],
  frameMs: 170,
};

/** Lesson 9's emblem: the phone's screen in small, a gold percent sign by three green bars growing 6, 7 and 9. */
const emblemBanking: PixelSprite = {
  id: 'pf9-emblem-banking',
  name: 'pf9-emblem-banking',
  tags: ['scene', 'pf', 'emblem'],
  rows: [
    'yG..G.......Wm',
    'Gg.G........mN',
    '..G......Wm.mN',
    '.G.yG.Wm.mN.mN',
    'G..Gg.mN.mN.mN',
    '......mN.mN.mN',
    '......mN.mN.mN',
    '......mN.mN.mN',
    '......mN.mN.mN',
  ],
};

// Order is depth: the bank's board and vault behind its counter; at home the phone, then the figure
// so its hand grips the phone's edge, the desk and the piggy on it.
const base = pfCompose('pf9-opener-base', 80, 60, splitGround(), [
  [dimmed(vault, 'pf9-vault-dim'), 1, 23],
  [dimmed(vaultWheel, 'pf9-vault-wheel-dim'), 9, 31],
  [bankBoard, 2, 3],
  [shield, 20, 1],
  [dimmed(counter, 'pf9-counter-dim'), 0, 36],
  [dimmed(tray, 'pf9-tray-dim'), 17, 36],
  [pfPendantLamp, 58, 0],
  [phone(), 35, 11],
  [shield, 45, 9],
  [pfSaverReachLeft, 47, 12],
  [pfTable(28, 10), 52, 36],
  [pfPiggyBank, 65, 26],
  [pfCat, 31, 51],
]);

export const pf9Opener: SceneArt = {
  id: 'pf9-opener',
  label: 'The picture is split: on the left, a dim bank branch with a vault behind its counter and a board showing 0.01% over three flat grey bars, and on the right, at home, a person holds out a phone showing 5% over three rising green bars, both marked with the same green insurance shield, while coins arc out of the bank deposit tray into the phone, a piggy bank sits on the desk and the cat sleeps on the rug.',
  width: 80,
  height: 60,
  base,
  layers: [
    // The coin's path starts over the tray (17, 36) and ends on the phone's first bar (phone at 35, 11).
    { sprite: coinArc, x: 19, y: 14 },
    // The tallest bar is the phone's columns 9 and 10, its top row 10.
    { sprite: arrowGlow, x: 43, y: 19, motion: { kind: 'twinkle', periodMs: 1800, min: 0.2 } },
    { sprite: pfLampGlow, x: 59, y: 9, motion: { kind: 'twinkle', periodMs: 3000, min: 0.55 } },
    { sprite: pfSparkle, x: 72, y: 19, motion: { kind: 'twinkle', periodMs: 2100, min: 0.4 } },
    { sprite: pfZzz, x: 30, y: 46, motion: { kind: 'rise', amp: 3, periodMs: 2800, phase: 0.3 } },
  ],
};

export const pf9Finish = pfKeepsake(
  'pf9-finish',
  'A gold house-shaped key fob with a teal roof on a key ring with a brass key, its window showing a gold percent sign beside three green bars that grow taller, with small sparkles around it.',
  emblemBanking,
);

export const art: LessonArtSet = { opener: pf9Opener, backdrop: pfBackdrop, finish: pf9Finish };
