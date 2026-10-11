/**
 * Personal Finance lesson 1 opener: payday at the kitchen table, the four pillars in one picture.
 *
 * Composed from the kit (pf-kit.ts) over its kitchen. On the table, left to right, the lesson's four
 * pillars as things you own: the pay envelope (earn), the wallet (spend), the piggy bank (save), the
 * sprout (invest). Around them, the first-job life the lesson's scenario starts from: a new diploma,
 * a calendar crossed off to payday, a sunset window, the cat asleep on the rug. The window is the
 * brightest broad surface. Only small layers move: a coin drops into the piggy, the sprout sways,
 * payday pulses, smoke rises, birds cross the sunset, the lamp glows, the cat's z drifts up.
 */
import {
  pfBird,
  pfCalendar,
  pfCat,
  pfCoinDrop,
  pfCompose,
  pfCurtain,
  pfDiploma,
  pfKitchen,
  pfLampGlow,
  pfLampPool,
  pfPaydayRing,
  pfPayEnvelope,
  pfPendantLamp,
  pfPiggyBank,
  pfPot,
  pfSaverReach,
  pfSmoke,
  pfSprout,
  pfTable,
  pfWallet,
  pfWindowDusk,
  pfZzz,
} from './pf-kit';
import type { SceneArt } from './types';

// Order is depth: the figure stands behind the table, so the table is stamped over its lower half.
const base = pfCompose('pf1-opener-base', 80, 60, pfKitchen.rows, [
  [pfWindowDusk, 3, 5],
  [pfCurtain, 2, 4],
  [pfCurtain, 26, 4],
  [pfDiploma, 47, 7],
  [pfCalendar, 64, 6],
  [pfPendantLamp, 32, 0],
  [pfSaverReach, 29, 12],
  [pfTable(72, 12), 4, 36],
  [pfLampPool, 26, 37],
  [pfPayEnvelope, 6, 30],
  [pfWallet, 19, 30],
  [pfPiggyBank, 44, 28],
  [pfPot, 66, 31],
  [pfCat, 31, 50],
]);

export const pf1Opener: SceneArt = {
  id: 'pf1-opener',
  label: 'At a kitchen table at sunset, a person drops a coin into a piggy bank beside a pay envelope, a wallet and a sprouting plant, under a pendant lamp, with a calendar counting down to payday and a cat asleep on the rug.',
  width: 80,
  height: 60,
  base,
  layers: [
    // The coin hangs from the reaching hand (figure at 29,12; hand at column 21, row 10) and its
    // foot meets the piggy's slot (piggy at 44,28; slot at columns 6 to 8, row 1).
    { sprite: pfCoinDrop, x: 50, y: 22 },
    { sprite: pfSprout, x: 66, y: 26 },
    { sprite: pfPaydayRing, x: 67, y: 14, motion: { kind: 'twinkle', periodMs: 1400, min: 0.15 } },
    { sprite: pfSmoke, x: 7, y: 11, motion: { kind: 'rise', amp: 2, periodMs: 2600 } },
    { sprite: pfBird, x: 15, y: 14, motion: { kind: 'drift', amp: 2, periodMs: 5200 } },
    { sprite: pfLampGlow, x: 33, y: 9, motion: { kind: 'twinkle', periodMs: 3000, min: 0.55 } },
    { sprite: pfZzz, x: 30, y: 45, motion: { kind: 'rise', amp: 3, periodMs: 2800, phase: 0.3 } },
  ],
};
