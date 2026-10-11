/**
 * Financial Analytics lesson 1 keepsake: a gold terminal trophy on an orchid plinth, its screen
 * drawing lesson 1's emblem (three bars of what happened, a gold arrow for what to do), with a
 * sheen running along the bezel, a blinking power light, crossed twinkles and rising data motes.
 *
 * ONE SHAPE, TWENTY-FIVE EMBLEMS. The trophy (fa-kit faTrophy) is the pathway's keepsake for every
 * lesson; only the emblem layer changes. A later lesson's finish is this file with its own emblem
 * from fa-kit, drawn at FA_EMBLEM size on dark glass, in the same slot. The trophy stands still
 * (it is a trophy, not a medal on a ribbon), so the emblem needs no motion of its own to stay in
 * its screen; the movement is the emblem drawing itself and the dressing around it.
 */
import { faEmblemAnalytics, faKeepsakeDressing, faTrophy, FA_TROPHY } from './fa-kit';
import type { SceneArt } from './types';

export const fa1Finish: SceneArt = {
  id: 'fa1-finish',
  label: 'A gold terminal trophy on a purple stand, its screen drawing three rising bars and a gold arrow, with small sparkles around it.',
  width: FA_TROPHY.width,
  height: FA_TROPHY.height,
  base: faTrophy,
  layers: [
    // The emblem: the one layer a later lesson swaps.
    { sprite: faEmblemAnalytics, x: FA_TROPHY.emblem.x, y: FA_TROPHY.emblem.y },
    ...faKeepsakeDressing,
  ],
};
