/**
 * if-kit-r: what the Investing Fundamentals redraws of lessons 6 and 7 added to the kit (if-kit.ts,
 * if-kit-a.ts). Only what more than one of those lessons uses lives here; a one-off prop stays in its
 * lesson's file.
 *
 * A THIRD SKIN TONE. The kit's investor carries the cast's medium tone (C U) and the gardener its deep
 * one (J z); IF_R_PALETTE adds the light one (S M, from sprites-characters.ts) for the new faces those
 * lessons bring in: L6's picker, and L7's fund manager and one of the investors pooling their coins. A
 * later kit that reuses S or M must keep these colours, because ifCompose throws when two stamps
 * disagree on a key.
 *
 * NATIVE-OWNED (CONSTITUTION 5.5): nothing here is synced from the web repo.
 */
import { IF_A_PALETTE } from './if-kit-a';

export const IF_R_PALETTE: Record<string, string> = {
  ...IF_A_PALETTE,
  S: '#F4CBA4',
  M: '#D6A87C',
};
