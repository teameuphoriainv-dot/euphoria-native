/**
 * Applied Accounting kit, batch B (lessons 10 to 17): pieces more than one lesson stamps, on top of
 * aa-kit.ts and aa-kit-a.ts and in the same light (from the left, the lamp side).
 *
 * aaBookkeeperStanding is the bookkeeper on their feet, for the checkpoint and any scene that wants
 * the whole figure: the head is aaBookkeeper's, so aaBlink sits at the same AA_AT offset, and
 * AA_AT_B.propInHands says where a prop held at the chest goes (the lesson draws the hands round it).
 * aaKeepsakeGold is the checkpoint volume, the pathway keepsake bound in gold leather with orchid
 * corners, for lessons 10 and 25. aaBlock fills a wall, a plank or a field for aaCompose; aaEnvelope
 * and aaCoinBag are the post and the cash that several lessons pass across the desk.
 */
import type { PixelSprite } from '../types';
import { AA_PALETTE } from './aa-kit';
import { aaKeepsake } from './aa1-finish';
import type { SceneArt } from './types';

/** A w x h block of one letter: a wall, a plank, a chart's field. */
export function aaBlock(id: string, w: number, h: number, ch: string): PixelSprite {
  return {
    id,
    name: id,
    tags: ['aa', 'scene'],
    ...(ch in AA_PALETTE ? { palette: AA_PALETTE } : {}),
    rows: Array.from({ length: h }, () => ch.repeat(w)),
  };
}

/* ── the bookkeeper, standing ───────────────────────────────────────────────────────────────── */

/**
 * The bookkeeper standing, 18 x 32, front on: aaBookkeeper's head, the orchid jumper and red tie,
 * arms at the sides, grey trousers and brown shoes. Stands on the floorboards, not the skirting.
 */
export const aaBookkeeperStanding: PixelSprite = {
  id: 'aa-bookkeeper-standing',
  name: 'aa-bookkeeper-standing',
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
    '..PPPPPwrrwppppp..',
    '.PPpPPPPrrppppEpp.',
    '.PPpPPPPrrppppEpp.',
    '.PPpPPPPrPppppEpp.',
    '.PPpPPPPPPppppEpp.',
    '.PPpPPPPPPppppEpp.',
    '.PPpPPPPPPppppEpp.',
    '.SSpPPPPPPppppESM.',
    '.SMppppppppppppMM.',
    '....XDDDDDDDDD....',
    '....XDDDDDDDDD....',
    '....XDDD..XDDD....',
    '....XDDD..XDDD....',
    '....XDDD..XDDD....',
    '...gOOOO..gOOOO...',
    '...OOOOO..OOOOO...',
  ],
};

/* ── props ──────────────────────────────────────────────────────────────────────────────────── */

/**
 * An envelope, 11 x 7, seen from the back: the flap's V meets at a `seal`, the right and bottom
 * edges in `shade`. `palette` carries any custom paper (a manila pay packet); a/c are ledger white.
 */
export function aaEnvelope(id: string, paper: string, shade: string, seal: string = shade, palette: Record<string, string> = AA_PALETTE): PixelSprite {
  const ink: Record<string, string> = { P: paper, S: shade, e: seal };
  return {
    id,
    name: id,
    tags: ['aa', 'prop'],
    palette,
    rows: [
      'SPPPPPPPPPS',
      'PSPPPPPPPSS',
      'PPSPPPPPSPS',
      'PPPSPPPSPPS',
      'PPPPeeePPPS',
      'PPPPPPPPPPS',
      'SSSSSSSSSSS',
    ].map((r) => [...r].map((ch) => ink[ch]).join('')),
  };
}

/** A canvas coin bag, 10 x 12, tied at the neck with a gold $ stencilled on it. */
export const aaCoinBag: PixelSprite = {
  id: 'aa-coin-bag',
  name: 'aa-coin-bag',
  tags: ['aa', 'prop'],
  palette: AA_PALETTE,
  rows: [
    '..O....O..',
    '...O..O...',
    '....OO....',
    '...OaaO...',
    '..OaaaacO.',
    '.OaaaGGacO',
    'OaaaGGaacO',
    'OaaaaGaacO',
    'OaaaaGGacO',
    'OaaaGGaacO',
    '.OaaaaacXO',
    '..OOOOOOO.',
  ],
};

/* ── the checkpoint volume ──────────────────────────────────────────────────────────────────── */

/** The plate on aaKeepsake's volume, in scene pixels: its gilt stays as it is. */
const PLATE = { x0: 15, y0: 7, x1: 34, y1: 26 };
/** Orchid leather and gold trim trade places; the deep outline turns gold. */
const GILDED: Record<string, string> = { E: 'O', q: 'y', P: 'G', p: 'g', y: 'q', G: 'P', g: 'p' };

/**
 * The keepsake for a checkpoint or the capstone: aaKeepsake's volume bound in gold leather with
 * orchid corners and fillet, the plate, ribbon and moving bits unchanged, `emblem` on the plate.
 */
export function aaKeepsakeGold(id: string, label: string, emblem: PixelSprite): SceneArt {
  const plain = aaKeepsake(id, label, emblem);
  const inPlate = (x: number, y: number) => x >= PLATE.x0 && x <= PLATE.x1 && y >= PLATE.y0 && y <= PLATE.y1;
  return {
    ...plain,
    base: {
      ...plain.base,
      id: 'aa-keepsake-gold-base',
      name: 'aa-keepsake-gold-base',
      rows: plain.base.rows.map((row, y) => [...row].map((ch, x) => (inPlate(x, y) ? ch : GILDED[ch] ?? ch)).join('')),
    },
  };
}

/** Where things sit, relative to the top-left of the piece they belong to. */
export const AA_AT_B = {
  /** A prop held at the chest: its top-left, 10 wide, over rows 18 to 25 of aaBookkeeperStanding. */
  propInHands: { x: 4, y: 18 },
} as const;
