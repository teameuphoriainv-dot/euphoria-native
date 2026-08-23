/**
 * SPRITES AUTHORED FOR iOS, PENDING CONTRIBUTION UPSTREAM.
 *
 * WHY THIS FILE EXISTS RATHER THAN AN EDIT TO sprites.ts. That file is a byte-for-byte copy of
 * euphoriaweb's, and its value is exactly that: re-copying it when a sprite changes on web is a
 * one-line operation that cannot go wrong. Editing it would destroy that property, and the next
 * re-sync would silently clobber whatever had been added.
 *
 * WHAT THESE FIX. The shop sells three profile themes and three avatar frames, and BOTH apps drew
 * all three of each with a single generic theme/frame mark — so "Neon Glow", "Midnight Blue" and
 * "Golden Hour" rendered identically on a screen whose entire job is making you want one. The web
 * has the same gap. These are not an iOS-only flourish; they are art the shared catalogue is
 * missing.
 *
 * CONTRIBUTE THESE BACK. They belong in euphoriaweb's sprites.ts so both apps get them and this
 * file can disappear. Until then it is a deliberate, temporary second location, named as such.
 *
 * House rules followed: 16x16, shared palette characters only, and OUTLINED WITH THE DEEP RAMP (E)
 * rather than K — the web's own index says K is invisible against the app's dark canvas.
 */
import type { PixelSprite } from './types';
import { target } from './sprites';

export const themeNeon: PixelSprite = {
  id: 'theme-neon',
  name: 'Neon Glow Theme',
  tags: ['theme', 'neon', 'profile'],
  blurb: 'Profile theme swatch: teal into pink.',
  rows: [
    '................',
    '................',
    '.....EEEEEE.....',
    '...EETTTTFFEE...',
    '..ETTTTTTFFFFE..',
    '.ETTTTTTTFFFFFE.',
    '.ETTTTTTTFFFFFE.',
    '.ETTTTTTTFFFFFE.',
    '.ETTTTTTTFFFFFE.',
    '.ETTTTTTTFFFFFE.',
    '..ETTTTTFFFFFE..',
    '...EETTTFFFEE...',
    '.....EEEEEE.....',
    '................',
    '................',
    '................',
  ],
};

export const themeMidnight: PixelSprite = {
  id: 'theme-midnight',
  name: 'Midnight Blue Theme',
  tags: ['theme', 'midnight', 'profile'],
  blurb: 'Profile theme swatch: deep blue into sky.',
  rows: [
    '................',
    '................',
    '.....EEEEEE.....',
    '...EEbbbbBBEE...',
    '..EbbbbbbBBBBE..',
    '.EbbbbbbbBBBBBE.',
    '.EbbbbbbbBBBBBE.',
    '.EbbbbbbbBBBBBE.',
    '.EbbbbbbbBBBBBE.',
    '.EbbbbbbbBBBBBE.',
    '..EbbbbbBBBBBE..',
    '...EEbbbBBBEE...',
    '.....EEEEEE.....',
    '................',
    '................',
    '................',
  ],
};

export const themeGold: PixelSprite = {
  id: 'theme-gold',
  name: 'Golden Hour Theme',
  tags: ['theme', 'gold', 'profile'],
  blurb: 'Profile theme swatch: gold into warm sand.',
  rows: [
    '................',
    '................',
    '.....EEEEEE.....',
    '...EEGGGGyyEE...',
    '..EGGGGGGyyyyE..',
    '.EGGGGGGGyyyyyE.',
    '.EGGGGGGGyyyyyE.',
    '.EGGGGGGGyyyyyE.',
    '.EGGGGGGGyyyyyE.',
    '.EGGGGGGGyyyyyE.',
    '..EGGGGGyyyyyE..',
    '...EEGGGyyyEE...',
    '.....EEEEEE.....',
    '................',
    '................',
    '................',
  ],
};

export const frameFire: PixelSprite = {
  id: 'frame-fire',
  name: 'Fire Frame',
  tags: ['frame', 'fire', 'profile'],
  blurb: 'Avatar frame: ember red with a gold inner rule.',
  rows: [
    '................',
    '..EEEEEEEEEEEE..',
    '..ERRRRRRRRRRE..',
    '..ERGGGGGGGGRE..',
    '..ERG......GRE..',
    '..ERG......GRE..',
    '..ERG......GRE..',
    '..ERG......GRE..',
    '..ERG......GRE..',
    '..ERG......GRE..',
    '..ERGGGGGGGGRE..',
    '..ERRRRRRRRRRE..',
    '..EEEEEEEEEEEE..',
    '................',
    '................',
    '................',
  ],
};

export const frameDiamond: PixelSprite = {
  id: 'frame-diamond',
  name: 'Diamond Frame',
  tags: ['frame', 'diamond', 'profile'],
  blurb: 'Avatar frame: blue with an icy white inner rule.',
  rows: [
    '................',
    '..EEEEEEEEEEEE..',
    '..EBBBBBBBBBBE..',
    '..EBwwwwwwwwBE..',
    '..EBw......wBE..',
    '..EBw......wBE..',
    '..EBw......wBE..',
    '..EBw......wBE..',
    '..EBw......wBE..',
    '..EBw......wBE..',
    '..EBwwwwwwwwBE..',
    '..EBBBBBBBBBBE..',
    '..EEEEEEEEEEEE..',
    '................',
    '................',
    '................',
  ],
};

export const frameRainbow: PixelSprite = {
  id: 'frame-rainbow',
  name: 'Rainbow Frame',
  tags: ['frame', 'rainbow', 'profile'],
  blurb: 'Avatar frame: one hue per edge.',
  rows: [
    '................',
    '..EEEEEEEEEEEE..',
    '..ERRRRRRRRRRE..',
    '..ERGGGGGGGGRE..',
    '..ERG......GNE..',
    '..ENG......GNE..',
    '..ENG......GNE..',
    '..ENB......BNE..',
    '..ENB......BPE..',
    '..EPB......BPE..',
    '..EPBBBBBBBBPE..',
    '..EPPPPPPPPPPE..',
    '..EEEEEEEEEEEE..',
    '................',
    '................',
    '................',
  ],
};

export const ADDED_SPRITES: PixelSprite[] = [themeNeon, themeMidnight, themeGold, frameFire, frameDiamond, frameRainbow];

/**
 * The daily-goal target, RETINTED — not redrawn.
 *
 * The catalogue's `target` is a red-and-white bullseye, and red in this palette is documented as
 * "the negative sentiment accent". A red target on the daily-goal pill therefore reads as a loss
 * indicator on the one control that exists to say you are winning, and it clashes with the pill's
 * own orchid tint.
 *
 * A palette override reuses the existing art rather than adding a second 16x16 of the same shape,
 * so if the bullseye is ever redrawn this follows it automatically. Built once at module scope:
 * compileSprite caches on object identity, so deriving this per render would miss every time.
 * Gold centre because the centre is the thing you are trying to hit.
 */
export const targetGoal: PixelSprite = {
  ...target,
  id: 'target-goal',
  name: 'Daily goal target',
  palette: { r: '#8028C3', w: '#E3C4FA', R: '#F0A72B' },
};
