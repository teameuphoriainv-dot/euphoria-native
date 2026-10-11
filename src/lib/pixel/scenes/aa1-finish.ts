/**
 * Applied Accounting keepsake: a bound ledger volume in orchid leather with gold corners, a gilt
 * fillet down the spine and a red ribbon, its cover plate stamped with the lesson's emblem. Drawn
 * 2026-10-10 for the lesson-complete screen (3pt/px).
 *
 * ONE SHAPE, TWENTY-FIVE VOLUMES. The volume is the pathway's keepsake and the emblem in its plate is
 * the lesson's: aaKeepsake() takes any emblem up to 16 x 16 (the catalogue size, so a catalogue
 * sprite can stand in) and centres it on the plate's dark field. Base = the volume, still. Moving:
 * the ribbon sways, gilt glints open and close, auditor's ticks rise past the fore-edge.
 */
import type { PixelSprite } from '../types';
import { aaCompose, aaEmblemTAccount, aaGlint, aaOffsetFrames, aaTick } from './aa-kit';
import type { SceneArt } from './types';

const volume: PixelSprite = {
  id: 'aa-keepsake-volume',
  name: 'volume',
  tags: [],
  rows: [
    '.EEEEEEEEEEEEEEEEEEEEEEEEEEEEEE.....',
    'EqqqqqqqqqqqqqqqqqqqqqqqgGGGGGyE....',
    'EqPpppyPPPPPPPPPPPPPPPPPPgGGGGGExwwE',
    'EqPpppGPPPPPPPPPPPPPPPPPPPgGGGGExwxE',
    'EqPpppGPPPPPPPPPPPPPPPPPPPPgGGGExwwE',
    'EqPpppGPPPPPPPPPPPPPPPPPPPPPgGGExwxE',
    'EqPpppGPPPPPPPPPPPPPPPPPPPPPPgGExwwE',
    'EqPpppGPPOOOOOOOOOOOOOOOOOOOOPpExwxE',
    'EqPpppGPPOyyyyyyyyyyyyyyyyyGOPpExwwE',
    'EqPpppGPPOyKKKKKKKKKKKKKKKKgOPpExwxE',
    'EqPpppGPPOyKKKKKKKKKKKKKKKKgOPpExwwE',
    'EqPpppGPPOyKKKKKKKKKKKKKKKKgOPpExwxE',
    'EqPpppGPPOyKKKKKKKKKKKKKKKKgOPpExwwE',
    'EqPpppGPPOyKKKKKKKKKKKKKKKKgOPpExwxE',
    'EqPpppGPPOyKKKKKKKKKKKKKKKKgOPpExwwE',
    'EqPpppGPPOyKKKKKKKKKKKKKKKKgOPpExwxE',
    'EqPpppGPPOyKKKKKKKKKKKKKKKKgOPpExwwE',
    'EqPpppGPPOyKKKKKKKKKKKKKKKKgOPpExwxE',
    'EqPpppGPPOyKKKKKKKKKKKKKKKKgOPpExwwE',
    'EqPpppGPPOyKKKKKKKKKKKKKKKKgOPpExwxE',
    'EqPpppGPPOyKKKKKKKKKKKKKKKKgOPpExwwE',
    'EqPpppGPPOyKKKKKKKKKKKKKKKKgOPpExwxE',
    'EqPpppGPPOyKKKKKKKKKKKKKKKKgOPpExwwE',
    'EqPpppGPPOyKKKKKKKKKKKKKKKKgOPpExwxE',
    'EqPpppGPPOyKKKKKKKKKKKKKKKKgOPpExwwE',
    'EqPpppGPPOGgggggggggggggggggOPpExwxE',
    'EqPpppGPPOOOOOOOOOOOOOOOOOOOOPpExwwE',
    'EqPpppGPPPPPPPPPPPPPPPPPPPPPPPgExwxE',
    'EqPpppGPPPPPPPPPPPPPPPPPPPPPPgGExwwE',
    'EqPpppGPPPPPPPPPPPPPPPPPPPPPgGGExwxE',
    'EqPpppGPPPPPPPPPPPPPPPPPPPPgGGGExwwE',
    'EqPpppGPPPPPPPPPPPPPPPPPPPgGGGGExwxE',
    'EqpppppppppppppppppppppppgGGGGGExwwE',
    '.EEEEEEEEEEEEEEEEEEEEEEEEEEEEEE.xwxE',
    '...EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE',
  ],
};

const ribbon: PixelSprite = {
  id: 'aa-keepsake-ribbon',
  name: 'ribbon',
  tags: [],
  rows: [
    '.22r.',
    '.22r.',
    '.22r.',
    '.22r.',
    '.2.r.',
  ],
  frames: [
    [
      '.22r.',
      '.22r.',
      '.22r.',
      '.22r.',
      '.2.r.',
    ],
    [
      '.22r.',
      '.22r.',
      '..22r',
      '..22r',
      '..2.r',
    ],
    [
      '.22r.',
      '.22r.',
      '.22r.',
      '.22r.',
      '.2.r.',
    ],
    [
      '.22r.',
      '.22r.',
      '22r..',
      '22r..',
      '2.r..',
    ],
  ],
  frameMs: 460,
};

const base = aaCompose('aa-keepsake-base', 48, 40, '.', [{ sprite: volume, x: 6, y: 0 }]);

/** The plate's dark field in scene pixels: the emblem slot every lesson fills. */
const SLOT = { x: 17, y: 9, size: 16 };

const glintLater = aaOffsetFrames(aaGlint, 'aa-keepsake-glint-later', 3, 270);
const glintLatest = aaOffsetFrames(aaGlint, 'aa-keepsake-glint-latest', 5, 310);

/**
 * The keepsake for any lesson of the pathway: this volume with `emblem` centred on its plate.
 * Throws past 16 x 16 rather than let an emblem spill over the plate's gilt frame.
 */
export function aaKeepsake(id: string, label: string, emblem: PixelSprite): SceneArt {
  const w = emblem.rows[0]?.length ?? 0;
  const h = emblem.rows.length;
  if (w > SLOT.size || h > SLOT.size) {
    throw new Error(`${id}: emblem ${emblem.id} is ${String(w)}x${String(h)}, the plate holds ${String(SLOT.size)}x${String(SLOT.size)}`);
  }
  return {
    id,
    label,
    width: 48,
    height: 40,
    base,
    layers: [
      { sprite: emblem, x: SLOT.x + Math.floor((SLOT.size - w) / 2), y: SLOT.y + Math.floor((SLOT.size - h) / 2) },
      { sprite: ribbon, x: 30, y: 35 },
      { sprite: aaGlint, x: 34, y: 0, motion: { kind: 'twinkle', periodMs: 2600, min: 0.5 } },
      { sprite: glintLater, x: 0, y: 27, motion: { kind: 'twinkle', periodMs: 3100, phase: 0.4, min: 0.5 } },
      { sprite: glintLatest, x: 13, y: 5 },
      { sprite: aaTick, x: 1, y: 12, motion: { kind: 'rise', amp: 6, periodMs: 3000 } },
      { sprite: aaTick, x: 43, y: 18, motion: { kind: 'rise', amp: 6, periodMs: 3600, phase: 0.5 } },
    ],
  };
}

export const aa1Finish = aaKeepsake(
  'aa1-finish',
  'A purple leather ledger with gold corners and a red ribbon bookmark, its cover stamped in gold with a T-account, with small glints and check marks around it.',
  aaEmblemTAccount,
);
