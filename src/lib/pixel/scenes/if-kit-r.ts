/**
 * if-kit-r: what the Investing Fundamentals redraws added to the kit (if-kit.ts, if-kit-a.ts). Only
 * what more than one redrawn lesson uses lives here; a one-off prop stays in its lesson's file.
 *
 * A THIRD SKIN TONE. The kit's investor carries the cast's medium tone (C U) and the gardener its deep
 * one (J z); IF_R_PALETTE adds the light one (S M, from sprites-characters.ts) for the new faces the
 * redraws of lessons 6 and 7 bring in: L6's picker, and L7's fund manager and one of the investors
 * pooling their coins. A later kit that reuses S or M must keep these colours, because ifCompose
 * throws when two stamps disagree on a key.
 *
 * BONDS ARE A TEAL BUSH. Lesson 9 planted the first portfolio as coin sprouts for home stocks, a fig
 * for the rest of the world and a small teal bush for bonds. ifBondBush is that bush grown, for the
 * lessons that show a whole portfolio later on (L21's rebalancing, L25's graduation), so bonds look
 * the same wherever they appear. It is foliage only, lit on its upper left, with no fruit: the coins
 * stay the stocks' colour.
 *
 * NATIVE-OWNED (CONSTITUTION 5.5): nothing here is synced from the web repo.
 */
import type { PixelSprite } from '../types';
import { IF_PALETTE } from './if-kit';
import { IF_A_PALETTE } from './if-kit-a';

export const IF_R_PALETTE: Record<string, string> = {
  ...IF_A_PALETTE,
  S: '#F4CBA4',
  M: '#D6A87C',
};

/** The bonds, grown: a round teal bush, 14x11, lit on its upper left, on a short woody base. */
export const ifBondBush: PixelSprite = {
  id: 'if-bond-bush',
  name: 'if-bond-bush',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [
    '....mmmTT.....',
    '..mmmTTTTTt...',
    '.mmTTTTTTTTt..',
    'mmTTTmmTTTTtt.',
    'mTTTmTTTTTTttt',
    'TTTTTTTTTTtttt',
    'TTTTTTTTTtttt.',
    '.TTTTTTTtttt..',
    '..tttTTtttt...',
    '....aahAa.....',
    '...aAahAAa....',
  ],
};
