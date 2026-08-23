/**
 * The seven league crests, as pixel art.
 *
 * WHAT THIS REPLACES. league-crest.tsx drew a semi-3D shield: two linear gradients for the body
 * and face, a RadialGradient glow behind the whole crest, a specular sliver, and an animated
 * white sheen sweeping across it. That is, item for item, the thing the cofounder design doc
 * rejects — "I don\'t like the gradient look that we\'ve put across the entire app" and "they
 * can\'t have the vibe-coded glow behind them." The glow was literally a radial gradient behind
 * the badge. It also sat in an app whose whole visual identity is now pixel art, so it read as
 * imported from a different product.
 *
 * RULE ZERO, and what looking actually found. The web does NOT have a better version of this to
 * copy: its leagues are four emoji divisions in leaderboard/constants.ts — bronze/silver/gold/
 * diamond, drawn as the literal characters. iOS\'s seven-tier career ladder is AHEAD of web here,
 * so this is one of the rare cases where matching web would be a downgrade. The ladder stays; only
 * the drawing changes.
 *
 * GENERATED FROM ONE SHAPE FUNCTION, not hand-placed seven times, so no tier can drift from its
 * neighbours: same shield geometry, same top-left key light, same emblem placement. What varies is
 * the ramp, the emblem, and the hardware.
 *
 * THE HARDWARE LADDER. A rank keeps everything below it and adds a piece, so climbing is visible
 * as structure rather than as a hue swap:
 *     2+  shoulder flanges      4+  notched banner      6+  crown gem      7  radiance
 * Ranks 3 and 5 advance on emblem and ramp alone — stated plainly rather than padded with an
 * ornament that would crowd the face at this size.
 *
 * OUTLINES use the four sanctioned deep steps (O/E/D/I) and never K, per the palette\'s own note
 * that #1A1523 is invisible on the #0A090F canvas.
 */
import type { PixelSprite } from './types';
import { EUPHORIA_PIXEL_PALETTE } from './palette';

export const crestSaver: PixelSprite = {
  id: 'crest-saver',
  name: 'Saver Crest',
  tags: ['league','crest','saver'],
  rows: [
    '......................',
    '......................',
    '......................',
    '....OOOOOOOOOOOOOO....',
    '....OyyyyyyyyyyyGO....',
    '....OyyyyyyyyyyyGO....',
    '....OyGGGGGGGGGGgO....',
    '....OyGGGGGGGGGGgO....',
    '....OyGGWWWWWGGGgO....',
    '....OyGGGGGGGGGGgO....',
    '....OyGGWWWWWGGGgO....',
    '....OyGGGGGGGGGGgO....',
    '....OyGGWWWWWGGGgO....',
    '....OyGGGGGGGGGGgO....',
    '....OGGGGGGGGGGGgO....',
    '.....OGGGGGGGGGgO.....',
    '.....OGgGGGGGGggO.....',
    '......OGgGGGGggO......',
    '.......OGgGGggO.......',
    '........OGgggO........',
    '.........OGgO.........',
    '..........OO..........',
    '......................',
    '......................',
  ],
};

export const crestInvestor: PixelSprite = {
  id: 'crest-investor',
  name: 'Investor Crest',
  tags: ['league','crest','investor'],
  rows: [
    '......................',
    '......................',
    '......................',
    '....DDDDDDDDDDDDDD....',
    '....DwwwwwwwwwwwxD....',
    '.DDDDwwwwwwwwwwwxDDDD.',
    '.DxDDwxxxxxxxxxxXDDxD.',
    '.DxDDwxxxxxxxxxxXDDxD.',
    '.DDDDwxxxxxxKKxxXDDDD.',
    '....DwxxxxxKKKxxXD....',
    '....DwxxxxKKxxxxXD....',
    '....DwxxKKxxxxxxXD....',
    '....DwxKKxxxxxxxXD....',
    '....DwxxxxxxxxxxXD....',
    '....DxxxxxxxxxxxXD....',
    '.....DxxxxxxxxxXD.....',
    '.....DxXxxxxxxXXD.....',
    '......DxXxxxxXXD......',
    '.......DxXxxXXD.......',
    '........DxXXXD........',
    '.........DxXD.........',
    '..........DD..........',
    '......................',
    '......................',
  ],
};

export const crestAnalyst: PixelSprite = {
  id: 'crest-analyst',
  name: 'Analyst Crest',
  tags: ['league','crest','analyst'],
  rows: [
    '......................',
    '......................',
    '......................',
    '....OOOOOOOOOOOOOO....',
    '....OWWWWWWWWWWWyO....',
    '.OOOOWWWWWWWWWWWyOOOO.',
    '.OyOOWyyyyyyyyyyGOOyO.',
    '.OyOOWyyyyyyyyyyGOOyO.',
    '.OOOOWyyyyKyyyyyGOOOO.',
    '....OWyyKyKyyyyyGO....',
    '....OWyyKyKyKyyyGO....',
    '....OWyyKyKyKyyyGO....',
    '....OWyKKKKKKKyyGO....',
    '....OWyyyyyyyyyyGO....',
    '....OyyyyyyyyyyyGO....',
    '.....OyyyyyyyyyGO.....',
    '.....OyGyyyyyyGGO.....',
    '......OyGyyyyGGO......',
    '.......OyGyyGGO.......',
    '........OyGGGO........',
    '.........OyGO.........',
    '..........OO..........',
    '......................',
    '......................',
  ],
};

export const crestStrategist: PixelSprite = {
  id: 'crest-strategist',
  name: 'Strategist Crest',
  tags: ['league','crest','strategist'],
  rows: [
    '......................',
    '......................',
    '......................',
    '....DDDDDDDDDDDDDD....',
    '....DwwwwwwwwwwwBD....',
    '.DDDDwwwwwwwwwwwBDDDD.',
    '.DBDDwBBBBBBBBBBbDDBD.',
    '.DBDDwBWWWBWWWBBbDDBD.',
    '.DDDDwBWBWBWWWBBbDDDD.',
    '....DwBWWWBWWWBBbD....',
    '....DwBBBBBBBBBBbD....',
    '....DwBWWWBWWWBBbD....',
    '....DwBWBWBWBWBBbD....',
    '....DwBWWWBWWWBBbD....',
    '....DBBBBBBBBBBBbD....',
    '.....DBBBBBBBBBbD.....',
    '.....DBbBBBBBBbbD.....',
    '......DBbBBBBbbD......',
    '.......DBbBBbbD.......',
    '.DDDDDDDDDDDDDDDDDDDD.',
    '.DwwwwwwwwwwwwwwwwwwD.',
    '.DBBBBBBBBBBBBBBBBBBD.',
    '.DDDDDD........DDDDDD.',
    '......................',
  ],
};

export const crestPortfolioManager: PixelSprite = {
  id: 'crest-portfoliomanager',
  name: 'Portfolio Manager Crest',
  tags: ['league','crest','portfoliomanager'],
  rows: [
    '......................',
    '......................',
    '......................',
    '....DDDDDDDDDDDDDD....',
    '....DmmmmmmmmmmmND....',
    '.DDDDmmmmmmmmmmmNDDDD.',
    '.DNDDmNNNNNNNNNNnDDND.',
    '.DNDDmNNNWWWNNNNnDDND.',
    '.DDDDmNNWWNNWNNNnDDDD.',
    '....DmNWWWNNNWNNnD....',
    '....DmNWWWWNNWNNnD....',
    '....DmNWWWWWWWNNnD....',
    '....DmNNWWWWWNNNnD....',
    '....DmNNNWWWNNNNnD....',
    '....DNNNNNNNNNNNnD....',
    '.....DNNNNNNNNNnD.....',
    '.....DNnNNNNNNnnD.....',
    '......DNnNNNNnnD......',
    '.......DNnNNnnD.......',
    '.DDDDDDDDDDDDDDDDDDDD.',
    '.DmmmmmmmmmmmmmmmmmmD.',
    '.DNNNNNNNNNNNNNNNNNND.',
    '.DDDDDD........DDDDDD.',
    '......................',
  ],
};

export const crestPartner: PixelSprite = {
  id: 'crest-partner',
  name: 'Partner Crest',
  tags: ['league','crest','partner'],
  rows: [
    '..........II..........',
    '.........IsFI.........',
    '..........ff..........',
    '....IIIIIIIIIIIIII....',
    '....IsssssssssssFI....',
    '.IIIIsssssssssssFIIII.',
    '.IFIIsFFFFFFFFFFfIIFI.',
    '.IFIIsFFFFFFFFFFfIIFI.',
    '.IIIIsFFWWFWWFFFfIIII.',
    '....IsFWFFWFFWFFfI....',
    '....IsFWFFWFFWFFfI....',
    '....IsFFWWFWWFFFfI....',
    '....IsFFFFFFFFFFfI....',
    '....IsFFFFFFFFFFfI....',
    '....IFFFFFFFFFFFfI....',
    '.....IFFFFFFFFFfI.....',
    '.....IFfFFFFFFffI.....',
    '......IFfFFFFffI......',
    '.......IFfFFffI.......',
    '.IIIIIIIIIIIIIIIIIIII.',
    '.IssssssssssssssssssI.',
    '.IFFFFFFFFFFFFFFFFFFI.',
    '.IIIIII........IIIIII.',
    '......................',
  ],
};

export const crestMagnate: PixelSprite = {
  id: 'crest-magnate',
  name: 'Magnate Crest',
  tags: ['league','crest','magnate'],
  rows: [
    '..........EE..........',
    '.........EQPE.........',
    '.QQ.......pp.......QQ.',
    '....EEEEEEEEEEEEEE....',
    '....EQQQQQQQQQQQPE....',
    '.EEEEQQQQQQQQQQQPEEEE.',
    '.EPEEQPPPPPPPPPPpEEPE.',
    '.EPEEQPPPPPPPPPPpEEPE.',
    '.EEEEQPWPPWPPWPPpEEEE.',
    '....EQPWPWWWPWPPpE....',
    'QQ..EQPWWWWWWWPPpE..QQ',
    '....EQPWWWWWWWPPpE....',
    '....EQPPWWWWWPPPpE....',
    '....EQPPPPPPPPPPpE....',
    '....EPPPPPPPPPPPpE....',
    '.....EPPPPPPPPPpE.....',
    '.QQ..EPpPPPPPPppE..QQ.',
    '......EPpPPPPppE......',
    '.......EPpPPppE.......',
    '.EEEEEEEEEEEEEEEEEEEE.',
    '.EQQQQQQQQQQQQQQQQQQE.',
    '.EPPPPPPPPPPPPPPPPPPE.',
    '.EEEEEE........EEEEEE.',
    '......................',
  ],
};

/** Tier name -> crest. Keyed by `Tier.name` so league.ts stays the single source of rank order. */
export const CRESTS: Record<string, PixelSprite> = {
  'Saver': crestSaver,
  'Investor': crestInvestor,
  'Analyst': crestAnalyst,
  'Strategist': crestStrategist,
  'Portfolio Manager': crestPortfolioManager,
  'Partner': crestPartner,
  'Magnate': crestMagnate,
};

/** Mix a hex toward the card surface. Locked tiers keep their HUE — draining to grey would turn
 *  a ladder of seven colours you are climbing toward into one grey shape repeated seven times. */
function drain(hex: string, t = 0.72): string {
  const a = parseInt(hex.slice(1), 16), b = 0x15121c;
  const ch = (s: number) => Math.round((((a >> s) & 0xff) * (1 - t)) + (((b >> s) & 0xff) * t));
  const h = (v: number) => v.toString(16).padStart(2, '0');
  return `#${h(ch(16))}${h(ch(8))}${h(ch(0))}`;
}

const DRAINED = Object.fromEntries(
  Object.entries(EUPHORIA_PIXEL_PALETTE).map(([c, hex]) => [c, drain(hex)]),
);

/**
 * Unreached tiers. Built ONCE at module load, never per render — compileSprite caches on the
 * sprite object\'s identity, so deriving `{...sprite, palette}` inside a component would miss the
 * cache on every single frame and re-mesh a 528-pixel grid each time.
 */
export const CRESTS_LOCKED: Record<string, PixelSprite> = Object.fromEntries(
  Object.entries(CRESTS).map(([k, s]) => [k, { ...s, id: `${s.id}-locked`, palette: DRAINED }]),
);
