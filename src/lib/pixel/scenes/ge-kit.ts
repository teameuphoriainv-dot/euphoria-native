/**
 * The Global Economics art kit: the people, props, glyphs, emblems and small moving bits that every
 * scene in the pathway is built from.
 *
 * THE PATHWAY'S WORLD IS A HARBOR. The world economy is mostly things crossing water, so the kit
 * draws a port (gantry cranes, containers, a container ship, a lighthouse) and one student holding
 * one coin with more wants than it covers, which is lesson 1 and the start of every lesson after it.
 * The quant's world is screens and towers; this one is cargo, sea and horizon.
 *
 * COMPOSED, NOT REDRAWN. geCompose stamps kit sprites onto a ground at module load, so an opener is
 * a ground plus a list of placements, and the signpost in lesson 1 is the same drawing as the one in
 * lesson 22. The base is still ONE sprite (one mesh of merged runs, no extra views). Framed sprites
 * are kept under "moving bits" and placed as layers, never stamped: a stamped sprite keeps only its
 * still, so its animation would silently stop.
 *
 * LIGHT FROM THE LEFT, as on every figure in the app. Emerald is the pathway's colour (the course
 * accent): the student wears it and it frames the keepsake. Gold is money and is kept to coins, posts
 * and lamplight. Pale tones on a dark sky (paper, the bubble, stars, gulls) use GE_PALETTE entries,
 * not w/W: the light-canvas palette darkens w/W, and a full-bleed scene keeps its own dark sky in
 * both themes, so its stars would go out.
 *
 * NATIVE-OWNED, like everything in src/lib/pixel/scenes (CONSTITUTION 5.5: new art never goes in the
 * web-synced sprite files).
 */
import type { PixelSprite } from '../types';

/* ── palette ────────────────────────────────────────────────────────────────────────────────── */

/**
 * Every colour a ge scene uses that the shared palette lacks. ONE map for the whole pathway, so two
 * pieces stamped into one base can never give a character two colours (geCompose throws if they do).
 */
export const GE_PALETTE: Record<string, string> = {
  // People
  C: '#C08552', // skin
  M: '#D6A87C', // skin, lit
  U: '#9A6638', // skin, shade
  H: '#3A2418', // hair
  J: '#0A3F31', // deep emerald, the outline step the green ramp lacks
  L: '#2B4170', // denim
  V: '#1B2949', // denim, shade
  // Paper and sign wood that must stay pale on the light canvas
  z: '#F2EFF7', // paper white
  A: '#E6D3AE', // sign cream
  S: '#BFA57A', // sign cream, shade
  // Sea
  a: '#0B1828', // deep water
  c: '#132B47', // water
  d: '#1F4568', // ripple
  // Dusk sky and land
  '0': '#24183F', // dusk indigo
  '6': '#3A1E5C', // dusk violet
  '7': '#112A22', // meadow
  '8': '#1A3D30', // meadow, lit
  '9': '#0B1D18', // meadow, shade
  u: '#2E231D', // road, shade
  l: '#4A392D', // road
  o: '#6A5240', // road, lit
  Z: '#110E17', // cast shadow
  // Night tones for the backdrop, every one under luminance 0.15
  h: '#1A2D4C', // night blue
  v: '#4A1F27', // night red
  i: '#0F3A36', // night teal
  j: '#4A3517', // night gold
  e: '#163A2B', // night green
  Y: '#2A2340', // night haze
};

/**
 * The port after dark, for the backdrop. Steel, paint and lamp glass swap to night tones, every one
 * under the 0.15 luminance that art behind lesson text is held to. K is left alone so ink stays ink;
 * a sprite whose dark windows should be LIT at night adds `K: 'O'` on top of this.
 */
export const GE_NIGHT: Readonly<Record<string, string>> = {
  X: 'k', x: 'k', w: 'D', W: 'D', z: 'D', y: 'O', G: 'O', g: 'j',
  r: 'v', R: 'v', b: 'h', B: 'h', t: 'i', T: 'i', n: 'e', N: 'e', m: 'e',
};

/* ── composing ──────────────────────────────────────────────────────────────────────────────── */

/** One kit sprite placed in a composed base, top-left corner in scene pixels. */
export interface GePlacement {
  sprite: PixelSprite;
  x: number;
  y: number;
}

/**
 * `art` written over `rows` with its top-left at (x, y). `.` leaves what is under it, and anything
 * past an edge is cut, so a prop can stand half off the scene.
 */
export function geStamp(rows: readonly string[], art: readonly string[], x: number, y: number): string[] {
  const out = rows.map((row) => row.split(''));
  art.forEach((line, j) => {
    const row = out[y + j];
    if (!row) return;
    for (let i = 0; i < line.length; i += 1) {
      if (line[i] !== '.' && x + i >= 0 && x + i < row.length) row[x + i] = line[i];
    }
  });
  return out.map((row) => row.join(''));
}

/**
 * A scene's still base: `ground` with each placement stamped over it in order, as one sprite.
 *
 * THROWS ON A PALETTE CLASH. Two pieces that give one character different colours would otherwise
 * repaint each other with no error. The scene pin imports every scene, so a clash fails the check
 * instead of shipping a wrongly coloured picture.
 */
export function geCompose(id: string, ground: PixelSprite, placements: readonly GePlacement[]): PixelSprite {
  const palette: Record<string, string> = { ...ground.palette };
  let rows: string[] = [...ground.rows];
  for (const { sprite, x, y } of placements) {
    for (const [ch, hex] of Object.entries(sprite.palette ?? {})) {
      const had = palette[ch];
      if (had !== undefined && had !== hex) throw new Error(`${id}: ${sprite.id} paints "${ch}" ${hex} over ${had}`);
      palette[ch] = hex;
    }
    rows = geStamp(rows, sprite.rows, x, y);
  }
  return { id, name: id, tags: ['scene', 'ge'], palette, rows };
}

/**
 * Flipped left to right, every frame too. For things that face a way (a ship, a bubble's tail).
 * Not for people: light would then come from the right, against every other figure in the app.
 */
export function geMirror(sprite: PixelSprite, id: string): PixelSprite {
  const flip = (rows: readonly string[]) => rows.map((row) => row.split('').reverse().join(''));
  return { ...sprite, id, rows: flip(sprite.rows), ...(sprite.frames ? { frames: sprite.frames.map(flip) } : {}) };
}

/** Characters swapped by `map`, every frame too: a container in another colour, or a prop at night. */
export function geTint(sprite: PixelSprite, id: string, map: Readonly<Record<string, string>>): PixelSprite {
  const swap = (rows: readonly string[]) => rows.map((row) => row.split('').map((ch) => map[ch] ?? ch).join(''));
  return { ...sprite, id, rows: swap(sprite.rows), ...(sprite.frames ? { frames: sprite.frames.map(swap) } : {}) };
}

/**
 * The same framed sprite starting `by` frames later and ticking at `frameMs`. Frames tick from mount
 * with no offset (PixelSpriteView), so two layers sharing one sprite would flash in step; a twinkle
 * `phase` only offsets opacity, not the picture.
 */
export function geLater(sprite: PixelSprite, id: string, by: number, frameMs: number): PixelSprite {
  const frames = sprite.frames ?? [sprite.rows];
  return { ...sprite, id, frames: [...frames.slice(by), ...frames.slice(0, by)], frameMs };
}

/* ── people ─────────────────────────────────────────────────────────────────────────────────── */

/**
 * The pathway's student, 16x25, front on, light from the left. The raised hand holds up a 5x5 thing
 * (a coin in lesson 1) placed as its own layer at GE_STUDENT_HOLD, so it can glint or be swapped.
 */
export const geStudent: PixelSprite = {
  id: 'ge-student',
  name: 'student',
  tags: ['ge', 'character'],
  blurb: 'A student in an emerald hoodie and orchid beanie, holding something up in the right hand.',
  palette: GE_PALETTE,
  rows: [
    '........EEEEE...',
    '.......EqPPPpE..',
    '.......EQqqqqE..',
    '.......HMMCCUH..',
    '.......HMKCKUH..',
    '.......HMCCCUH..',
    '..MM....UCCCU...',
    '..MC.....UCU....',
    '.JMJ.JJJNnnnnJJ.',
    '.JNJJNJJNznznJnJ',
    '.JNJJNJJNznznJnJ',
    '..JNJNJJNnnnnJnJ',
    '..JNJNJJNnnnnJnJ',
    '....JNJJNJJJJJnJ',
    '....JJJJJnnnJJnJ',
    '.......JNnnnnJUJ',
    '.......JJJJJJJC.',
    '........LLVLV...',
    '........LV.LV...',
    '........LV.LV...',
    '........LV.LV...',
    '........LV.LV...',
    '........LV.LV...',
    '.......DzzDzzD..',
    '.......DDDDDDD..',
  ],
};

/** Top-left of a 5x5 thing held up in geStudent's raised hand, relative to the student. */
export const GE_STUDENT_HOLD = { x: 1, y: 1 } as const;

/* ── props ──────────────────────────────────────────────────────────────────────────────────── */

/**
 * A two-way signpost, 25x28: a choice between two roads. The boards are blank; geSignWith writes a
 * 7x7 glyph on each so a lesson can say where each road goes.
 */
export const geSignpost: PixelSprite = {
  id: 'ge-signpost',
  name: 'signpost',
  tags: ['ge', 'prop'],
  blurb: 'A wooden two-way signpost with a blank cream board pointing each way.',
  palette: GE_PALETTE,
  rows: [
    '...........OyO...........',
    '...........OGgO..........',
    '...........OGgO..........',
    '....OOOOOOOOOOOO.........',
    '...OAAAAAAAAAAAO.........',
    '..OAAAAAAAAAAAAO.........',
    '.OAAAAAAAAAAAAAO.........',
    'OAAAAAAAAAAAAAAO.........',
    '.OSAAAAAAAAAAAAO.........',
    '..OSAAAAAAAAAAAO.........',
    '...OSSSSSSSSSSSO.........',
    '....OOOOOOOOOOOO.........',
    '...........OGgO..........',
    '.........OOOOOOOOOOOO....',
    '.........OAAAAAAAAAAAO...',
    '.........OAAAAAAAAAAAAO..',
    '.........OAAAAAAAAAAAAAO.',
    '.........OAAAAAAAAAAAAAAO',
    '.........OSAAAAAAAAAAAAO.',
    '.........OSAAAAAAAAAAAO..',
    '.........OSSSSSSSSSSSO...',
    '.........OOOOOOOOOOOO....',
    '...........OGgO..........',
    '...........OGgO..........',
    '...........OGgO..........',
    '...........OGgO..........',
    '..........OGGggO.........',
    '.........OOOOOOOO........',
  ],
};

/** Where geSignWith puts the two 7x7 glyphs, relative to the signpost. */
export const GE_SIGN_GLYPHS = { left: { x: 5, y: 4 }, right: { x: 13, y: 14 } } as const;

/** The signpost with a glyph on each board. */
export function geSignWith(id: string, left: PixelSprite, right: PixelSprite): PixelSprite {
  const { left: l, right: r } = GE_SIGN_GLYPHS;
  return { ...geSignpost, id, rows: geStamp(geStamp(geSignpost.rows, left.rows, l.x, l.y), right.rows, r.x, r.y) };
}

/** An empty thought bubble, 16x18, its dots trailing down and right toward the thinker's head. */
export const geBubble: PixelSprite = {
  id: 'ge-bubble',
  name: 'thought bubble',
  tags: ['ge', 'prop'],
  blurb: 'An empty thought bubble whose dots trail down to the right.',
  palette: GE_PALETTE,
  rows: [
    '...DDD..DDD.....',
    '..DzzzDDzzzDD...',
    '.DzzzzzzzzzzzD..',
    'DzzzzzzzzzzzzzD.',
    'DzzzzzzzzzzzzzD.',
    'DzzzzzzzzzzzzzD.',
    'DzzzzzzzzzzzzzD.',
    'DzzzzzzzzzzzzzD.',
    '.DzzzzzzzzzzzzD.',
    '.DzzzzzzzzzzzD..',
    '..DDzzzDDzzzD...',
    '....DDD..DDD....',
    '...........DD...',
    '..........DzzD..',
    '...........DD...',
    '.............D..',
    '............DzD.',
    '.............D..',
  ],
};

/** Where a 7x7 glyph sits in geBubble. */
export const GE_BUBBLE_GLYPH = { x: 4, y: 2 } as const;

/**
 * A thought bubble that flips between two glyphs, one want and then the other. `tail` is the side the
 * dots trail to, toward the head; the cloud mirrors for it but the glyphs never do.
 */
export function geBubbleChoice(id: string, a: PixelSprite, b: PixelSprite, tail: 'left' | 'right', frameMs = 1400): PixelSprite {
  const cloud = tail === 'right' ? geBubble.rows : geMirror(geBubble, id).rows;
  const x = tail === 'right' ? GE_BUBBLE_GLYPH.x : geBubble.rows[0].length - GE_BUBBLE_GLYPH.x - a.rows[0].length;
  const frames = [a, b].map((glyph) => geStamp(cloud, glyph.rows, x, GE_BUBBLE_GLYPH.y));
  return { ...geBubble, id, name: id, rows: frames[0], frames, frameMs };
}

/** A container ship, 40x14, bow to the right, waterline on its last row. */
export const geShip: PixelSprite = {
  id: 'ge-ship',
  name: 'container ship',
  tags: ['ge', 'prop', 'trade'],
  blurb: 'A container ship facing right: bridge and funnel at the stern, two tiers of containers.',
  palette: GE_PALETTE,
  rows: [
    '....DDDD................................',
    '....D1rD................................',
    '....DDDD................................',
    '..DDDDDDDD..............................',
    '..DxxxxxxD..............................',
    '..DKxKxKxD.rrrrDbbbbDttttDggggDnnnn.....',
    '..DxxxxxxD.rrrrDbbbbDttttDggggDnnnn.....',
    '..DxKxKxKD.bbbbDttttDrrrrDnnnnDbbbbDggg.',
    '..DxxxxxxD.bbbbDttttDrrrrDnnnnDbbbbDggg.',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    '.DkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkD.',
    '..DkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkD..',
    '...D11111111111111111111111111111111D...',
    '....DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD....',
  ],
};

/** Top-left of geShip's funnel, which is 4 wide like geSmoke, so a puff placed above it lines up. */
export const GE_SHIP_FUNNEL = { x: 4, y: 0 } as const;

/** The same ship at a distance, 22x8, for a horizon. */
export const geShipFar: PixelSprite = {
  id: 'ge-ship-far',
  name: 'distant ship',
  tags: ['ge', 'prop', 'trade'],
  blurb: 'The container ship at a distance, small enough to sit on a horizon.',
  palette: GE_PALETTE,
  rows: [
    '...DD.................',
    '..D1rD................',
    '.DDDDDD...............',
    '.DxKxKD.rrbbttGG.bb...',
    '.DxxxxD.rrbbttGG.bbnn.',
    'DDDDDDDDDDDDDDDDDDDDDD',
    '.DkkkkkkkkkkkkkkkkkkD.',
    '..D1111111111111111D..',
  ],
};

/** A ship-to-shore gantry crane, 24x20, boom reaching right. Its warning light goes at GE_CRANE_TIP. */
export const geCrane: PixelSprite = {
  id: 'ge-crane',
  name: 'gantry crane',
  tags: ['ge', 'prop', 'trade'],
  blurb: 'A ship-to-shore gantry crane, legs on the left and the boom out over the water to the right.',
  palette: GE_PALETTE,
  rows: [
    '..........DD............',
    '.........DXXD...........',
    '........DX..XD..........',
    'DDDDDDDDDDDDDDDDDDDDDDDD',
    'DXXXXXXXXXXXXXXXXXXXXXXD',
    'DDDDDDDDDDDDDDDDDDDDDDDD',
    '....DXXXXXXD.......D....',
    '....DXXXXGXD.......D....',
    '....DDDDDDDD.....DDDDD..',
    '....DX....XD.....DXXXD..',
    '....DXDDDDXD............',
    '....DXXDDXXD............',
    '....DX.XX.XD............',
    '....DXX..XXD............',
    '....DXDDDDXD............',
    '....DX....XD............',
    '....DX....XD............',
    '....DX....XD............',
    '...DXXD..DXXD...........',
    '...DDDD..DDDD...........',
  ],
};

/** The crane's apex, relative to the crane: where a geBeacon layer blinks. */
export const GE_CRANE_TIP = { x: 10, y: 0 } as const;

/** A shipping container, 8x3, in red; geTint it (`{ r: 'b' }`) for another line's colour. Stacks by stamping. */
export const geContainer: PixelSprite = {
  id: 'ge-container',
  name: 'shipping container',
  tags: ['ge', 'prop', 'trade'],
  blurb: 'A red shipping container, ribbed, seen side on.',
  palette: GE_PALETTE,
  rows: [
    'rrrrrrrK',
    'rKrKrKrK',
    'KKKKKKKK',
  ],
};

/** A striped lighthouse, 10x19. The lamp is row 3; geBeam sweeps from it. A signal you can read before trouble arrives. */
export const geLighthouse: PixelSprite = {
  id: 'ge-lighthouse',
  name: 'lighthouse',
  tags: ['ge', 'prop'],
  blurb: 'A striped lighthouse with its lamp room on top.',
  palette: GE_PALETTE,
  rows: [
    '....DD....',
    '...DXXD...',
    '..DDDDDD..',
    '..DGyyGD..',
    '..DDDDDD..',
    '...DxxD...',
    '...DrrD...',
    '...DxxD...',
    '...DxxD...',
    '..DrrrrD..',
    '..DxxxxD..',
    '..DxKxxD..',
    '..DrrrrD..',
    '..DxxxxD..',
    '..DxxxxD..',
    '.DrrrrrrD.',
    '.DxxxxxxD.',
    '.DxxKxxxD.',
    'DDDDDDDDDD',
  ],
};

/** A central bank, 20x15: pediment, four columns, steps, a coin where a crest would be. */
export const geBank: PixelSprite = {
  id: 'ge-bank',
  name: 'central bank',
  tags: ['ge', 'prop', 'institution'],
  blurb: 'A columned central bank with a gold coin in its pediment.',
  palette: GE_PALETTE,
  rows: [
    '.........OO.........',
    '.......OOxxOO.......',
    '.....OOxxxxxxOO.....',
    '...OOxxxxGGxxxxOO...',
    '.OOxxxxxGyyGxxxxxOO.',
    'OXXXXXXXXXXXXXXXXXXO',
    'OOOOOOOOOOOOOOOOOOOO',
    '.OwxO.OwxO.OwxO.OwxO',
    '.OwxO.OwxO.OwxO.OwxO',
    '.OwxO.OwxO.OwxO.OwxO',
    '.OwxO.OwxO.OwxO.OwxO',
    '.OwxO.OwxO.OwxO.OwxO',
    'OOOOOOOOOOOOOOOOOOOO',
    'OxxxxxxxxxxxxxxxxxXO',
    'OOOOOOOOOOOOOOOOOOOO',
  ],
};

/** A domed government building, 19x14, lit windows: the state that taxes, spends and borrows. */
export const geCapitol: PixelSprite = {
  id: 'ge-capitol',
  name: 'capitol',
  tags: ['ge', 'prop', 'institution'],
  blurb: 'A domed government building with lit windows.',
  palette: GE_PALETTE,
  rows: [
    '.........D.........',
    '........DxD........',
    '.......DxxXD.......',
    '......DxxxxXD......',
    '......DDDDDDD......',
    '......DyDyDyD......',
    '..DDDDDDDDDDDDDDD..',
    '..DxxxxxxxxxxxxXD..',
    '.DDDDDDDDDDDDDDDDD.',
    '..DyD.DyD.DyD.DyD..',
    '..DyD.DyD.DyD.DyD..',
    '..DGD.DGD.DGD.DGD..',
    '.DDDDDDDDDDDDDDDDD.',
    'DDDDDDDDDDDDDDDDDDD',
  ],
};

/** A desk globe's brass ring and foot, 16x19, empty: geGlobe spins in it at GE_GLOBE_SEAT. */
export const geGlobeStand: PixelSprite = {
  id: 'ge-globe-stand',
  name: 'globe stand',
  tags: ['ge', 'prop'],
  blurb: 'The brass meridian ring and foot of a desk globe, with no globe in it.',
  palette: GE_PALETTE,
  rows: [
    '......OOO.......',
    '.....O....OO....',
    '...............O',
    '...............O',
    '...............O',
    '...............O',
    '...............O',
    '...............O',
    '...............O',
    '...............O',
    '..............O.',
    '.............O..',
    '.....O.....OO...',
    '......OOOOO.....',
    '........O.......',
    '........O.......',
    '.......OgO......',
    '....OOOgGgOOO...',
    '...OOOOOOOOOOO..',
  ],
};

/** Top-left of geGlobe in geGlobeStand, relative to the stand. */
export const GE_GLOBE_SEAT = { x: 1, y: 1 } as const;

/* ── glyphs ─────────────────────────────────────────────────────────────────────────────────── */

/*
 * 7x7 marks for a sign board or a thought bubble: the thing a choice is about. They are drawn for a
 * PALE ground (cream board, white bubble), so dark ink is allowed in them as interior detail.
 */

/** College, school, study. */
export const geGlyphCap: PixelSprite = {
  id: 'ge-glyph-cap',
  name: 'glyph cap',
  tags: ['ge', 'glyph'],
  blurb: 'A small mark: a graduation cap.',
  palette: GE_PALETTE,
  rows: [
    '.......',
    'KKKKKKK',
    '.KKKKKG',
    '..kkk.G',
    '..kkk.G',
    '..kkk.y',
    '.......',
  ],
};

/** A job, work, wages. */
export const geGlyphCase: PixelSprite = {
  id: 'ge-glyph-case',
  name: 'glyph case',
  tags: ['ge', 'glyph'],
  blurb: 'A small mark: a briefcase.',
  palette: GE_PALETTE,
  rows: [
    '..OOO..',
    '..O.O..',
    'OOOOOOO',
    'OgGGGgO',
    'OOOyOOO',
    'OgggggO',
    'OOOOOOO',
  ],
};

/** Health care. */
export const geGlyphHeart: PixelSprite = {
  id: 'ge-glyph-heart',
  name: 'glyph heart',
  tags: ['ge', 'glyph'],
  blurb: 'A small mark: a heart.',
  palette: GE_PALETTE,
  rows: [
    '.rr.rr.',
    'rRsrRRr',
    'rRRRRRr',
    'rRRRRRr',
    '.rRRRr.',
    '..rRr..',
    '...r...',
  ],
};

/** Defense. */
export const geGlyphShield: PixelSprite = {
  id: 'ge-glyph-shield',
  name: 'glyph shield',
  tags: ['ge', 'glyph'],
  blurb: 'A small mark: a shield with a chevron.',
  palette: GE_PALETTE,
  rows: [
    'DDDDDDD',
    'DBBBBbD',
    'DwBBBwD',
    'DBwBwbD',
    '.DBwbD.',
    '..DbD..',
    '...D...',
  ],
};

/** Housing, a family. */
export const geGlyphHouse: PixelSprite = {
  id: 'ge-glyph-house',
  name: 'glyph house',
  tags: ['ge', 'glyph'],
  blurb: 'A small mark: a house.',
  palette: GE_PALETTE,
  rows: [
    '...O...',
    '..OGO..',
    '.OGGGO.',
    'OGGGGGO',
    '.DzzzD.',
    '.DzKzD.',
    '.DDKDD.',
  ],
};

/** A coin with a square hole, 7x7: money that crosses borders. Works as a glyph too. */
export const geCoin: PixelSprite = {
  id: 'ge-coin',
  name: 'coin',
  tags: ['ge', 'money'],
  blurb: 'A gold coin with a square hole, an old shape of money that crossed borders.',
  palette: GE_PALETTE,
  rows: [
    '..OOO..',
    '.OyyyO.',
    'OyGGGgO',
    'OyGOGgO',
    'OyGGGgO',
    '.OgggO.',
    '..OOO..',
  ],
};

/* ── moving bits: placed as layers, never stamped ───────────────────────────────────────────── */

/** A 5x5 coin that glints every fourth beat: the one coin in the student's hand. */
export const geCoinSmall: PixelSprite = {
  id: 'ge-coin-small',
  name: 'small coin',
  tags: ['ge', 'money', 'animated'],
  blurb: 'A small gold coin that glints now and then.',
  palette: GE_PALETTE,
  rows: [
    '.OOO.',
    'OyyGO',
    'OyOgO',
    'OGggO',
    '.OOO.',
  ],
  frames: [
    [
      '.OOO.',
      'OyyGO',
      'OyOgO',
      'OGggO',
      '.OOO.',
    ],
    [
      '.OOO.',
      'OyyGO',
      'OyOgO',
      'OGggO',
      '.OOO.',
    ],
    [
      '.OOO.',
      'OWyGO',
      'OyOgO',
      'OGggO',
      '.OOO.',
    ],
    [
      '.OOO.',
      'OyWGO',
      'OWOgO',
      'OGggO',
      '.OOO.',
    ],
  ],
  frameMs: 300,
};

/** A 12x12 globe turning one full revolution in fourteen frames, so the loop has no seam. */
export const geGlobe: PixelSprite = {
  id: 'ge-globe',
  name: 'globe',
  tags: ['ge', 'world', 'animated'],
  blurb: 'A small blue globe turning, continents in green.',
  palette: GE_PALETTE,
  rows: [
    '....bbbb....',
    '..bbmBBBbb..',
    '.bbmmmBBBbb.',
    '.bBmmNBBBBb.',
    'bBBBNBBBBbnb',
    'bBBBBBBBBnnb',
    'bBNBBBBBBbnb',
    'bNNNBBBBBbnb',
    '.bNBBBBBbbb.',
    '.bbBBBBBbbb.',
    '..bbBBBBbb..',
    '....bbbb....',
  ],
  frames: [
    [
      '....bbbb....',
      '..bbmBBBbb..',
      '.bbmmmBBBbb.',
      '.bBmmNBBBBb.',
      'bBBBNBBBBbnb',
      'bBBBBBBBBnnb',
      'bBNBBBBBBbnb',
      'bNNNBBBBBbnb',
      '.bNBBBBBbbb.',
      '.bbBBBBBbbb.',
      '..bbBBBBbb..',
      '....bbbb....',
    ],
    [
      '....bbbb....',
      '..bbBBBNbb..',
      '.bbmBBBNNbb.',
      '.bmmBBBBNNb.',
      'bBmBBBBBNnnb',
      'bBBBBBBNNnnb',
      'bBBBBBBBNnnb',
      'bNBBBBBBNnbb',
      '.bBBBBBBbbb.',
      '.bbBBBBBbbb.',
      '..bbBBBBbb..',
      '....bbbb....',
    ],
    [
      '....bbbb....',
      '..bbBmmNbb..',
      '.bbBBmNNNbb.',
      '.bBBBBNNBBb.',
      'bBBBBBNNNbbb',
      'bBBBBNNNNbbb',
      'bBBBBBNNNbbb',
      'bBBBBBNNBbbb',
      '.bBBBBBBbbb.',
      '.bbBBBBBbbb.',
      '..bbBBBBbb..',
      '....bbbb....',
    ],
    [
      '....bbbb....',
      '..bbmmmNbb..',
      '.bbmmmNBBbb.',
      '.bBBmNBBBNb.',
      'bBBBNNNBBbnb',
      'bBBNNNNBBbbb',
      'bBBBNNNBBbbb',
      'bBBBNNBBBbbb',
      '.bBBBBBBbbb.',
      '.bbBBBBBbbb.',
      '..bbBBBBbb..',
      '....bbbb....',
    ],
    [
      '....bbbb....',
      '..bbmmBBbb..',
      '.bbmmBBNNbb.',
      '.bmmBBBNNNb.',
      'bBmmNBBBNnnb',
      'bmmNNBBBBnnb',
      'bBNNNBBBBbbb',
      'bBNNBBBBBbbb',
      '.bBBBBBBbbb.',
      '.bbBBBBBbbb.',
      '..bbBBBBbb..',
      '....bbbb....',
    ],
    [
      '....bbbb....',
      '..bbBBmNbb..',
      '.bbBBmNNNbb.',
      '.bBBBNNNNNb.',
      'bmmBBBNNNnbb',
      'bmmBBBBNNbbb',
      'bmNBBBBBBbbb',
      'bNBBBBBBBnbb',
      '.bBBBBBBnnb.',
      '.bbBBBBBbbb.',
      '..bbBBBBbb..',
      '....bbbb....',
    ],
    [
      '....bbbb....',
      '..bbmmmNbb..',
      '.bbmmmNNNbb.',
      '.bBmmNNNNBb.',
      'bBBBNNNNBbbb',
      'bBBBBNNBBbbb',
      'bBBBBBBBBbbb',
      'bBBBBBBNBbbb',
      '.bBBBBNNnbb.',
      '.bbBBBBNbbb.',
      '..bbBBBBbb..',
      '....bbbb....',
    ],
    [
      '....bbbb....',
      '..bbmmBBbb..',
      '.bbmmmNBBbb.',
      '.bmmmNNBBBb.',
      'bBmmNNBBBbbb',
      'bBBNNBBBBbnb',
      'bBBBBBBBBbnb',
      'bBBBBNBBBbbb',
      '.bBBNNNBbbb.',
      '.bbBBNBBbbb.',
      '..bbBBBBbb..',
      '....bbbb....',
    ],
    [
      '....bbbb....',
      '..bbBBBNbb..',
      '.bbmmBBNNbb.',
      '.bmmmBBBBBb.',
      'bmmmBBBBBnbb',
      'bmmBBBBBNnnb',
      'bBBBBBBBNnnb',
      'bBBNBBBBBnnb',
      '.bNNNBBBbbb.',
      '.bbNBBBBbbb.',
      '..bbBBBBbb..',
      '....bbbb....',
    ],
    [
      '....bbbb....',
      '..bbBmmNbb..',
      '.bbBBmNBBbb.',
      '.bmBBBBBBBb.',
      'bmBBBBBNBbbb',
      'bBBBBBNNNbbb',
      'bBBBBBNNNnbb',
      'bNBBBBBNNbbb',
      '.bNBBBBBbbb.',
      '.bbBBBBBbbb.',
      '..bbBBBBbb..',
      '....bbbb....',
    ],
    [
      '....bbbb....',
      '..bbmmBBbb..',
      '.bbmmBBBBbb.',
      '.bBBBBBBBBb.',
      'bBBBBNBBBbbb',
      'bBBBNNNBBbbb',
      'bBBBNNNNBbnb',
      'bBBBBNNBBnnb',
      '.bBBBBBBbbb.',
      '.bbBBBBBbbb.',
      '..bbBBBBbb..',
      '....bbbb....',
    ],
    [
      '....bbbb....',
      '..bbBBBNbb..',
      '.bbBBBBBNbb.',
      '.bBBBBBBBNb.',
      'bBBmBBBBBbnb',
      'bBmNNBBBBbbb',
      'bBNNNNBBNbbb',
      'bBBNNBBNNnbb',
      '.bBBBBBBnbb.',
      '.bbBBBBBbbb.',
      '..bbBBBBbb..',
      '....bbbb....',
    ],
    [
      '....bbbb....',
      '..bbBmmNbb..',
      '.bbBBBNNNbb.',
      '.bBBBBBNNNb.',
      'bmBBBBBBNbbb',
      'bmmBBBBBBbbb',
      'bmNNBBNBBbbb',
      'bNNBBNNNBbbb',
      '.bBBBBNBbbb.',
      '.bbBBBBBbbb.',
      '..bbBBBBbb..',
      '....bbbb....',
    ],
    [
      '....bbbb....',
      '..bbmmmBbb..',
      '.bbBmmNNBbb.',
      '.bBBBNNNBBb.',
      'bBBBBBNBBbbb',
      'bBBBBBBBBbbb',
      'bmBBNBBBBbbb',
      'bBBNNNBBBbbb',
      '.bBBNBBBbbb.',
      '.bbBBBBBbbb.',
      '..bbBBBBbb..',
      '....bbbb....',
    ],
  ],
  frameMs: 260,
};

/** A balance, 19x15, tipping left, level, right: a trade-off, an equilibrium, a balance of trade. */
export const geScale: PixelSprite = {
  id: 'ge-scale',
  name: 'balance scale',
  tags: ['ge', 'trade-off', 'animated'],
  blurb: 'A gold balance scale tipping one way, level, then the other.',
  palette: GE_PALETTE,
  rows: [
    '...................',
    '........OyO........',
    '........OGO........',
    '.OOOOOOOOOOOOOOOOO.',
    '.GGGGGGGGygggggggg.',
    '.OOOOOOOOOOOOOOOOO.',
    '.O...O..OGO..O...O.',
    '.O...O..OGO..O...O.',
    'OGGGGgO.OGO.OGGGGgO',
    '.OgggO..OGO..OgggO.',
    '........OGO........',
    '........OGO........',
    '........OGO........',
    '.....OOgGGGgOO.....',
    '....OOOOOOOOOOO....',
  ],
  frames: [
    [
      '...................',
      '........OyO........',
      '........OGO........',
      '.OOOOOOOOOOOOOOOOO.',
      '.GGGGGGGGygggggggg.',
      '.OOOOOOOOOOOOOOOOO.',
      '.O...O..OGO..O...O.',
      '.O...O..OGO..O...O.',
      'OGGGGgO.OGO.OGGGGgO',
      '.OgggO..OGO..OgggO.',
      '........OGO........',
      '........OGO........',
      '........OGO........',
      '.....OOgGGGgOO.....',
      '....OOOOOOOOOOO....',
    ],
    [
      '...................',
      '........OyO........',
      '........OGO...OOOO.',
      '.....OOOOOOOOOgggg.',
      '.OOOOGGGGyggggOOOO.',
      '.GGGGOOOOOOOOO...O.',
      '.OOOO...OGO..O...O.',
      '.O...O..OGO.OGGGGgO',
      '.O...O..OGO..OgggO.',
      'OGGGGgO.OGO........',
      '.OgggO..OGO........',
      '........OGO........',
      '........OGO........',
      '.....OOgGGGgOO.....',
      '....OOOOOOOOOOO....',
    ],
    [
      '...................',
      '........OyO........',
      '........OGO........',
      '.OOOOOOOOOOOOOOOOO.',
      '.GGGGGGGGygggggggg.',
      '.OOOOOOOOOOOOOOOOO.',
      '.O...O..OGO..O...O.',
      '.O...O..OGO..O...O.',
      'OGGGGgO.OGO.OGGGGgO',
      '.OgggO..OGO..OgggO.',
      '........OGO........',
      '........OGO........',
      '........OGO........',
      '.....OOgGGGgOO.....',
      '....OOOOOOOOOOO....',
    ],
    [
      '...................',
      '........OyO........',
      '.OOOO...OGO........',
      '.GGGGOOOOOOOOO.....',
      '.OOOOGGGGyggggOOOO.',
      '.O...OOOOOOOOOgggg.',
      '.O...O..OGO...OOOO.',
      'OGGGGgO.OGO..O...O.',
      '.OgggO..OGO..O...O.',
      '........OGO.OGGGGgO',
      '........OGO..OgggO.',
      '........OGO........',
      '........OGO........',
      '.....OOgGGGgOO.....',
      '....OOOOOOOOOOO....',
    ],
  ],
  frameMs: 650,
};

/** A waving flag, 7x10, emerald; geTint it (`{ m: 'Q', N: 'P', n: 'p' }`) for another country. */
export const geFlag: PixelSprite = {
  id: 'ge-flag',
  name: 'flag',
  tags: ['ge', 'nation', 'animated'],
  blurb: 'A small emerald flag waving on a pole.',
  palette: GE_PALETTE,
  rows: [
    'G......',
    'XmmmmmN',
    'XNNNNNn',
    'XNNNNNn',
    'XnnnnnJ',
    'X......',
    'X......',
    'X......',
    'X......',
    'D......',
  ],
  frames: [
    [
      'G......',
      'XmmmmmN',
      'XNNNNNn',
      'XNNNNNn',
      'XnnnnnJ',
      'X......',
      'X......',
      'X......',
      'X......',
      'D......',
    ],
    [
      'G......',
      'XmmmN..',
      'XNNNmmN',
      'XNNNNNn',
      'XnnnNNn',
      'X...nnJ',
      'X......',
      'X......',
      'X......',
      'D......',
    ],
    [
      'G......',
      'Xmm..mN',
      'XNNmmNn',
      'XNNNNNn',
      'XnnNNnJ',
      'X..nn..',
      'X......',
      'X......',
      'X......',
      'D......',
    ],
  ],
  frameMs: 320,
};

/** A gull, 5x3, flapping. Give it a `drift` so it glides while it flaps. */
export const geGull: PixelSprite = {
  id: 'ge-gull',
  name: 'gull',
  tags: ['ge', 'animated'],
  blurb: 'A gull, wings up then level.',
  palette: GE_PALETTE,
  rows: [
    'z...z',
    '.z.z.',
    '..z..',
  ],
  frames: [
    [
      'z...z',
      '.z.z.',
      '..z..',
    ],
    [
      '.....',
      'zzzzz',
      '..z..',
    ],
  ],
  frameMs: 420,
};

/** A mint diamond sparkle, 5x5, the pathway's own (the quant's is a gold cross). */
export const geSparkle: PixelSprite = {
  id: 'ge-sparkle',
  name: 'sparkle',
  tags: ['ge', 'animated'],
  blurb: 'A mint diamond sparkle that shrinks to a point and opens again.',
  palette: GE_PALETTE,
  rows: [
    '..m..',
    '.mNm.',
    'mNWNm',
    '.mNm.',
    '..m..',
  ],
  frames: [
    [
      '..m..',
      '.mNm.',
      'mNWNm',
      '.mNm.',
      '..m..',
    ],
    [
      '.....',
      '..m..',
      '.mWm.',
      '..m..',
      '.....',
    ],
    [
      '.....',
      '.....',
      '..w..',
      '.....',
      '.....',
    ],
    [
      '.....',
      '..m..',
      '.mWm.',
      '..m..',
      '.....',
    ],
  ],
  frameMs: 360,
};

/** One star, for a `twinkle`. */
export const geStar: PixelSprite = {
  id: 'ge-star',
  name: 'star',
  tags: ['ge'],
  blurb: 'One pale star.',
  palette: GE_PALETTE,
  rows: [
    'z',
  ],
};

/** A brighter star, 3x3. */
export const geStarBig: PixelSprite = {
  id: 'ge-star-big',
  name: 'big star',
  tags: ['ge'],
  blurb: 'A bright four-point star.',
  palette: GE_PALETTE,
  rows: [
    '.z.',
    'zzz',
    '.z.',
  ],
};

/** A puff of smoke, 4x3, for a `rise` from a funnel or a chimney. */
export const geSmoke: PixelSprite = {
  id: 'ge-smoke',
  name: 'smoke',
  tags: ['ge'],
  blurb: 'A puff of grey smoke.',
  palette: GE_PALETTE,
  rows: [
    '.xx.',
    'xXXx',
    '.XX.',
  ],
};

/** Low sun on water, 10x3: warm glints that move along the swell. */
export const geShimmer: PixelSprite = {
  id: 'ge-shimmer',
  name: 'shimmer',
  tags: ['ge', 'animated'],
  blurb: 'Glints of a low sun on water, shifting.',
  palette: GE_PALETTE,
  rows: [
    'y44.....33',
    '...33.4...',
    '.4....33..',
  ],
  frames: [
    [
      'y44.....33',
      '...33.4...',
      '.4....33..',
    ],
    [
      '..y44...3.',
      '33....4...',
      '...4...33.',
    ],
    [
      '....y44...',
      '.33....4..',
      '33...4....',
    ],
  ],
  frameMs: 480,
};

/** A red warning light, 1x1, on for a beat and off for a beat. */
export const geBeacon: PixelSprite = {
  id: 'ge-beacon',
  name: 'beacon',
  tags: ['ge', 'animated'],
  blurb: 'A red warning light blinking.',
  palette: GE_PALETTE,
  rows: [
    'r',
  ],
  frames: [
    [
      'r',
    ],
    [
      'K',
    ],
  ],
  frameMs: 900,
};

/**
 * A lighthouse beam, 16x3, sweeping left, dark, right, dark: brightest at the lamp, wider and dimmer
 * as it goes. Dim gold, so it may sit in a backdrop.
 * Centre it on geLighthouse's lamp: x = lighthouse x - 3, y = lighthouse y + 2.
 */
export const geBeam: PixelSprite = {
  id: 'ge-beam',
  name: 'lighthouse beam',
  tags: ['ge', 'animated'],
  blurb: 'A dim lighthouse beam sweeping left, then right.',
  palette: GE_PALETTE,
  rows: [
    'jjj.............',
    'jjOOO...........',
    'jjj.............',
  ],
  frames: [
    [
      'jjj.............',
      'jjOOO...........',
      'jjj.............',
    ],
    [
      '................',
      '................',
      '................',
    ],
    [
      '.............jjj',
      '...........OOOjj',
      '.............jjj',
    ],
    [
      '................',
      '................',
      '................',
    ],
  ],
  frameMs: 700,
};

/* ── emblems: the keepsake stamp carries one in its window ──────────────────────────────────── */

/*
 * Framed, drawn to sit on the stamp's night-blue window (ge1-finish.ts). One per lesson theme; a
 * lesson's keepsake is the stamp with its emblem in the window.
 */

/** Every emblem is this many pixels square; geKeepsake refuses any other size. */
export const GE_EMBLEM_SIZE = 16;

/** Lesson 1, choice: two arrows on one post, lighting in turn. You can take one road, and that costs the other. */
export const geEmblemFork: PixelSprite = {
  id: 'ge-emblem-fork',
  name: 'emblem fork',
  tags: ['ge', 'emblem', 'animated'],
  blurb: 'A signpost with a gold arrow pointing left and an emerald arrow pointing right, each lighting in turn.',
  palette: GE_PALETTE,
  rows: [
    '......OOOO......',
    '...O..OGgO......',
    '..OyOOOOOOOO....',
    '.OyyyyyyyyyO....',
    'OyGGGGGGGGGO....',
    '.OGGGGGGGGgO....',
    '..OGOOOOOOOO....',
    '...O..OGgO......',
    '......OGgO..O...',
    '....OOOOOOOOmO..',
    '....OmmmmmmmmmO.',
    '....ONNNNNNNNNnO',
    '....ONNNNNNNNnO.',
    '....OOOOOOOOnO..',
    '......OGgO..O...',
    '....OOOOOOOO....',
  ],
  frames: [
    [
      '......OOOO......',
      '...O..OGgO......',
      '..OyOOOOOOOO....',
      '.OyyyyyyyyyO....',
      'OyGGGGGGGGGO....',
      '.OGGGGGGGGgO....',
      '..OGOOOOOOOO....',
      '...O..OGgO......',
      '......OGgO..O...',
      '....OOOOOOOOmO..',
      '....OmmmmmmmmmO.',
      '....ONNNNNNNNNnO',
      '....ONNNNNNNNnO.',
      '....OOOOOOOOnO..',
      '......OGgO..O...',
      '....OOOOOOOO....',
    ],
    [
      '......OOOO......',
      '...O..OGgO......',
      '..OWOOOOOOOO....',
      '.OWWWWWWWWWO....',
      'OWyyyyyyyyyO....',
      '.OyyyyyyyyGO....',
      '..OyOOOOOOOO....',
      '...O..OGgO......',
      '......OGgO..O...',
      '....OOOOOOOOmO..',
      '....OmmmmmmmmmO.',
      '....ONNNNNNNNNnO',
      '....ONNNNNNNNnO.',
      '....OOOOOOOOnO..',
      '......OGgO..O...',
      '....OOOOOOOO....',
    ],
    [
      '......OOOO......',
      '...O..OGgO......',
      '..OyOOOOOOOO....',
      '.OyyyyyyyyyO....',
      'OyGGGGGGGGGO....',
      '.OGGGGGGGGgO....',
      '..OGOOOOOOOO....',
      '...O..OGgO......',
      '......OGgO..O...',
      '....OOOOOOOOmO..',
      '....OmmmmmmmmmO.',
      '....ONNNNNNNNNnO',
      '....ONNNNNNNNnO.',
      '....OOOOOOOOnO..',
      '......OGgO..O...',
      '....OOOOOOOO....',
    ],
    [
      '......OOOO......',
      '...O..OGgO......',
      '..OyOOOOOOOO....',
      '.OyyyyyyyyyO....',
      'OyGGGGGGGGGO....',
      '.OGGGGGGGGgO....',
      '..OGOOOOOOOO....',
      '...O..OGgO......',
      '......OGgO..O...',
      '....OOOOOOOOWO..',
      '....OWWWWWWWWWO.',
      '....OmmmmmmmmmNO',
      '....OmmmmmmmmNO.',
      '....OOOOOOOONO..',
      '......OGgO..O...',
      '....OOOOOOOO....',
    ],
  ],
  frameMs: 700,
};

/** The pathway itself, the world turning: for the checkpoint and capstone lessons. */
export const geEmblemGlobe: PixelSprite = {
  id: 'ge-emblem-globe',
  name: 'emblem globe',
  tags: ['ge', 'emblem', 'animated'],
  blurb: 'A globe turning, blue sea and green continents.',
  palette: GE_PALETTE,
  rows: [
    '................',
    '......bbbb......',
    '....bbBBBBbb....',
    '...bmmmBBBNNb...',
    '..bBmmmBBBBNNb..',
    '..bBBmBBBBBNnb..',
    '.bBBBBBBBBNNnnb.',
    '.bBmBBBBBBBNnnb.',
    '.bmmNBBBBBBnnbb.',
    '.bBNBBBBBBBbbbb.',
    '..bBBBBBBBBbbb..',
    '..bBBBBBBBBbbb..',
    '...bBBNBBBbbb...',
    '....bbNNBBbb....',
    '......bbbb......',
    '................',
  ],
  frames: [
    [
      '................',
      '......bbbb......',
      '....bbBBBBbb....',
      '...bmmmBBBNNb...',
      '..bBmmmBBBBNNb..',
      '..bBBmBBBBBNnb..',
      '.bBBBBBBBBNNnnb.',
      '.bBmBBBBBBBNnnb.',
      '.bmmNBBBBBBnnbb.',
      '.bBNBBBBBBBbbbb.',
      '..bBBBBBBBBbbb..',
      '..bBBBBBBBBbbb..',
      '...bBBNBBBbbb...',
      '....bbNNBBbb....',
      '......bbbb......',
      '................',
    ],
    [
      '................',
      '......bbbb......',
      '....bbBBmmbb....',
      '...bmBBBmNNNb...',
      '..bmmBBBBNNBBb..',
      '..bmBBBBBNNNbb..',
      '.bBBBBBBNNNNbbb.',
      '.bBBBBBBBNNNbbb.',
      '.bmBBBBBBNNbbbb.',
      '.bBBBBBBBBBbbbb.',
      '..bBBBBBBBBbbb..',
      '..bBBBBBBBBbbb..',
      '...bNBBBBBbbb...',
      '....bbBBBBbb....',
      '......bbbb......',
      '................',
    ],
    [
      '................',
      '......bbbb......',
      '....bbmmmmbb....',
      '...bBBmmmNBBb...',
      '..bBBBBmNBBBNb..',
      '..bBBBBNNNBBbb..',
      '.bBBBBNNNNBBbbb.',
      '.bBBBBBNNNBBbbb.',
      '.bBBBBBNNBBbbbb.',
      '.bBBBBBBBBBbbbb.',
      '..bBBBBBBBBbbb..',
      '..bBBBBBBBBbbb..',
      '...bBBBBBBnnb...',
      '....bbBBBNbb....',
      '......bbbb......',
      '................',
    ],
    [
      '................',
      '......bbbb......',
      '....bbmmmBbb....',
      '...bmmmmBBNNb...',
      '..bBBmmBBBNNNb..',
      '..bBBmmNBBBNnb..',
      '.bBBmmNNBBBBnnb.',
      '.bBBBNNNBBBBbbb.',
      '.bBBBNNBBBBbbbb.',
      '.bBBBBBBBBBbbnb.',
      '..bBBBBBBBBbbb..',
      '..bBBBBBBBBbbb..',
      '...bBBBBNNbbb...',
      '....bbBNNNbb....',
      '......bbbb......',
      '................',
    ],
    [
      '................',
      '......bbbb......',
      '....bbmBBmbb....',
      '...bmmBBmNNNb...',
      '..bmmBBBNNNNNb..',
      '..bmmmBBBNNNnb..',
      '.bmmmmBBBBNNbbb.',
      '.bBmmNBBBBBBbbb.',
      '.bBmNBBBBBBbnbb.',
      '.bBBBBBBBBBnnnb.',
      '..bBBBBBBBBbnb..',
      '..bBBBBBBBBbbb..',
      '...bBBNNBBbbb...',
      '....bbNNNBbb....',
      '......bbbb......',
      '................',
    ],
    [
      '................',
      '......bbbb......',
      '....bbBmmmbb....',
      '...bBBmmmNNNb...',
      '..bBBBmmNNNNBb..',
      '..bmBBBNNNNBbb..',
      '.bmmBBBBNNBBbbb.',
      '.bmmBBBBBBBBbbb.',
      '.bmBBBBBBBNbbbb.',
      '.bBBBBBBBNNnbbb.',
      '..bBBBBBBBNbbb..',
      '..bBBBBBBBBbbb..',
      '...bNNBBBBbbb...',
      '....bbNBBBbb....',
      '......bbbb......',
      '................',
    ],
    [
      '................',
      '......bbbb......',
      '....bbmmmBbb....',
      '...bmmmmmNBBb...',
      '..bBmmmmNNBBBb..',
      '..bBBmmNNBBBbb..',
      '.bBBBBNNBBBBbnb.',
      '.bBBBBBBBBBBbnb.',
      '.bBBBBBBNBBbbbb.',
      '.bBBBBBNNNBbbbb.',
      '..bBBBBBNBBbbb..',
      '..bBBBBBBBBbbb..',
      '...bBBBBBBbbb...',
      '....bbBBBBbb....',
      '......bbbb......',
      '................',
    ],
    [
      '................',
      '......bbbb......',
      '....bbmBBBbb....',
      '...bmmmmBBNNb...',
      '..bmmmmmBBBBBb..',
      '..bmmmmBBBBBnb..',
      '.bBBmmBBBBBNnnb.',
      '.bBBBBBBBBBNnnb.',
      '.bBBBBNBBBBbnnb.',
      '.bBBBNNNBBBbbbb.',
      '..bBBBNBBBBbbb..',
      '..bBBBBBBBBbbb..',
      '...bBBBBBBbbb...',
      '....bbBBBBbb....',
      '......bbbb......',
      '................',
    ],
    [
      '................',
      '......bbbb......',
      '....bbBBmmbb....',
      '...bmmBBmNBBb...',
      '..bmmmBBBBBBBb..',
      '..bmmBBBBBNBbb..',
      '.bmmBBBBBNNNbbb.',
      '.bBBBBBBBNNNnbb.',
      '.bBBNBBBBBNnbbb.',
      '.bBNNNBBBBBbbbb.',
      '..bBNBBBBBBbbb..',
      '..bBBBBBBBBbbb..',
      '...bBBBBBBbbb...',
      '....bbBBBNbb....',
      '......bbbb......',
      '................',
    ],
    [
      '................',
      '......bbbb......',
      '....bbmmmBbb....',
      '...bBBmmBBBBb...',
      '..bmBBBBBBBBBb..',
      '..bBBBBBNBBBbb..',
      '.bBBBBBNNNBBbbb.',
      '.bBBBBBNNNNBbnb.',
      '.bmBBBBBNNBbnnb.',
      '.bmNBBBBBBBbbnb.',
      '..bBBBBBBBBbbb..',
      '..bBBBBBBBBbbb..',
      '...bBBBBBBbbb...',
      '....bbBNBBbb....',
      '......bbbb......',
      '................',
    ],
    [
      '................',
      '......bbbb......',
      '....bbmBBBbb....',
      '...bmmBBBBBNb...',
      '..bBBBBBBBBBNb..',
      '..bBBBmBBBBBbb..',
      '.bBBBmNNBBBBbbb.',
      '.bBBBNNNNBBNbbb.',
      '.bBBBBNNBBNnnbb.',
      '.bBBBBBBBBBnbbb.',
      '..bBBBBBBBBbbb..',
      '..bBBBBBBBBbbb..',
      '...bBBBBBBbbb...',
      '....bbBBBBbb....',
      '......bbbb......',
      '................',
    ],
    [
      '................',
      '......bbbb......',
      '....bbBBmmbb....',
      '...bBBBBBNNNb...',
      '..bBBBBBBBNNNb..',
      '..bBmBBBBBBNbb..',
      '.bBmmmBBBBBBbbb.',
      '.bBmmNNBBNBBbbb.',
      '.bBBNNBBNNNbbbb.',
      '.bBBBBBBBNBbbbb.',
      '..bBBBBBBBBbbb..',
      '..bBBBBBBBBbbb..',
      '...bBBBBBBbbb...',
      '....bbBBBBbb....',
      '......bbbb......',
      '................',
    ],
    [
      '................',
      '......bbbb......',
      '....bbmmmmbb....',
      '...bBBBmmNNBb...',
      '..bBBBBBNNNBBb..',
      '..bBBBBBBNBBbb..',
      '.bmmBBBBBBBBbbb.',
      '.bmmmBBNBBBBbbb.',
      '.bmmBBNNNBBbbbb.',
      '.bBBBBBNBBBbbbb.',
      '..bBBBBBBBBbbb..',
      '..bBBBBBBBBbbb..',
      '...bBBBBBBnbb...',
      '....bbBBBNbb....',
      '......bbbb......',
      '................',
    ],
    [
      '................',
      '......bbbb......',
      '....bbmmBBbb....',
      '...bBmmmmBBBb...',
      '..bBBBmmNBBBBb..',
      '..bBBBBNBBBBbb..',
      '.bBBBBBBBBBBnnb.',
      '.bmBBNBBBBBBbnb.',
      '.bBBNNNBBBBbbnb.',
      '.bBBBNBBBBBbbbb.',
      '..bBBBBBBBBbbb..',
      '..bBBBBBBBBbbb..',
      '...bBBBBNBbbb...',
      '....bbBNNNbb....',
      '......bbbb......',
      '................',
    ],
  ],
  frameMs: 240,
};
