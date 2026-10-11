/**
 * Applied Accounting lesson 1 opener: the bookkeeper's desk, where every entry is written twice.
 *
 * Stamped from the pathway kit (aa-kit.ts): a bookkeeper in a green eyeshade behind a big open
 * ledger whose right page is a T-account, an engraved brass plate reading A=L+E, a framed 1494
 * charter for Pacioli, a banker's lamp, a level scale and a bookcase of ledgers. The ledger pages
 * are the brightest broad surface; the plate sits one value step behind. Only small layers move: the
 * quill writes a debit and then its matching credit until both columns total and rule off, the scale
 * takes a coin in both pans at once, the lamplight breathes, dust rises in it, the bookkeeper blinks.
 */
import type { PixelSprite } from '../types';
import {
  AA_AT,
  AA_PALETTE,
  aaBankersLamp,
  aaBlink,
  aaBookcase,
  aaBookkeeper,
  aaCharter,
  aaCoinDrop,
  aaCompose,
  aaDesk,
  aaHandRest,
  aaInkwell,
  aaLampGlow,
  aaLedgerOpen,
  aaMote,
  aaPlaque,
  aaQuillWriting,
  aaScale,
} from './aa-kit';
import type { SceneArt } from './types';

/** Skirting, floorboards and the desk's cast shadow, under everything. */
const room: PixelSprite = {
  id: 'aa1-opener-room',
  name: 'aa1-opener-room',
  tags: ['scene', 'aa1'],
  palette: AA_PALETTE,
  rows: [
    'gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg',
    'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
    'KKKKKKKKKkKKKKKKKKKKKKKKKKKKKKKkKKKKKKKKKKKKKKKKKKKKKKkKKKKKKKKKKKKKKKKKKkKKKKKK',
    'KKKKKKKKKkKKKKKKKKKKKKKKKKKKKKKkKKKKKKKKKKKKKKKKKKKKKKkKKKKKKKKKKKKKKKKKKkKKKKKK',
    'KKKKKKKKKkKKKKKKKKKKKKKKKKKKKKKkKKKKKKKKKKKKKKKKKKKKKKkKKKKKKKKKKKKKKKKKKkKKKKKK',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'KKKKKKKKKKKKKKKKKKKKkKKKKKKKKKKKKKKKKKKKKKKKkKKKKKKKKKKKKKKKKKKKKKkKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKkKKKKKKKKKKKKKKKKKKKKKKKkKKKKKKKKKKKKKKKKKKKKKkKKKKKKKKKKKKK',
    'KKKKKzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzKKK',
    'KKKKKKzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzKK',
    'KKKKKKKKKKKKKKKKKKKKkKKKKKKKKKKKKKKKKKKKKKKKkKKKKKKKKKKKKKKKKKKKKKkKKKKKKKKKKKKK',
  ],
};

const LEDGER = { x: 23, y: 31 };
const LAMP = { x: 7, y: 25 };
const SCALE = { x: 59, y: 24 };
const KEEPER = { x: LEDGER.x + AA_AT.bookkeeperOverLedger.x, y: LEDGER.y + AA_AT.bookkeeperOverLedger.y };

const base = aaCompose('aa1-opener-base', 80, 60, 'k', [
  { sprite: room, x: 0, y: 49 },
  { sprite: aaBookcase, x: 0, y: 4 },
  { sprite: aaPlaque('aa1-opener-plate', 'A=L+E'), x: 29, y: 1 },
  { sprite: aaCharter('aa1-opener-charter', '1494'), x: 59, y: 6 },
  { sprite: aaBookkeeper, ...KEEPER },
  { sprite: aaDesk, x: 4, y: 36 },
  { sprite: aaBankersLamp, ...LAMP },
  { sprite: aaLedgerOpen, ...LEDGER },
  { sprite: aaHandRest, x: LEDGER.x + AA_AT.handOnLedger.x, y: LEDGER.y + AA_AT.handOnLedger.y },
  { sprite: aaInkwell, x: 58, y: 40 },
  { sprite: aaScale, ...SCALE },
]);

export const aa1Opener: SceneArt = {
  id: 'aa1-opener',
  label: "A bookkeeper in a green eyeshade writes matching entries on both sides of a T-account in a big open ledger, under a brass plate reading A = L + E, beside a green banker's lamp, a level brass scale and shelves of ledgers.",
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: aaQuillWriting, x: LEDGER.x + AA_AT.quillOnLedger.x, y: LEDGER.y + AA_AT.quillOnLedger.y },
    { sprite: aaBlink, x: KEEPER.x + AA_AT.blinkOnBookkeeper.x, y: KEEPER.y + AA_AT.blinkOnBookkeeper.y },
    { sprite: aaCoinDrop, x: SCALE.x + AA_AT.coinsOnScale.x, y: SCALE.y + AA_AT.coinsOnScale.y },
    { sprite: aaLampGlow, x: LAMP.x + AA_AT.glowInLamp.x, y: LAMP.y + AA_AT.glowInLamp.y, motion: { kind: 'twinkle', periodMs: 3400, min: 0.35 } },
    { sprite: aaMote, x: 10, y: 35, motion: { kind: 'rise', amp: 5, periodMs: 2800 } },
    { sprite: aaMote, x: 17, y: 34, motion: { kind: 'rise', amp: 4, periodMs: 3300, phase: 0.5 } },
  ],
};
