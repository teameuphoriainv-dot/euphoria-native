/**
 * The Risk Management art kit: the pieces every scene in this pathway is assembled from.
 *
 * THE WORLD. Risk management is drawn as a lighthouse watch over a stormy harbour: the keeper is the
 * risk officer, the storm is the shock nobody scheduled, the barometer is the one number (VaR) and
 * the life ring is what you earn. The Quantitative Analysis course owns the city at night; this one
 * owns the sea, so the two never read as the same place. Sea tones are a navy ramp (RM_PALETTE),
 * the only colours here that are not in the shared palette.
 *
 * HOW A LESSON USES IT. An opener is rmCompose(room, set pieces) for the still base plus a few kit
 * layers that move; a finish is rmKeepsake(emblem); a backdrop variant is rmRetint over these same
 * sprites. Lesson 1 (rm1-opener, rm1-finish) is the worked example.
 *
 * NATIVE-OWNED, like everything in src/lib/pixel/scenes (CONSTITUTION 5.5). Nothing here edits or
 * re-exports a web-synced sprite file.
 */
import type { PixelSprite } from '../types';
import type { SceneArt, SceneLayer } from './types';

/**
 * The kit's own colours. Every kit sprite that needs one carries this map, so a base composed from
 * several of them has one palette and no letter means two colours.
 */
export const RM_PALETTE: Record<string, string> = {
  v: '#141B36', // night sea, the deepest water
  V: '#1E2A50', // sea body
  u: '#2C3F72', // wave face
  U: '#4462A0', // lit wave crest; luminance 0.125, so a backdrop may use it
  S: '#F4CBA4', // skin, the cast's S (sprites-characters.ts), so tones cannot drift
  M: '#D6A87C', // skin shade, the cast's M
  Z: '#110E17', // cast shadow, the pilot's tone: a drawn step between floor ink and the page
};

/* ── helpers ─────────────────────────────────────────────────────────────────────────────────── */

/** Writes `sprite` over `rows` with its top-left at (x, y); transparent pixels leave what is under. */
export function rmStamp(rows: string[], sprite: PixelSprite, x: number, y: number): string[] {
  const out = rows.slice();
  sprite.rows.forEach((line, dy) => {
    const ty = y + dy;
    if (ty < 0 || ty >= out.length) return;
    const chars = [...out[ty]];
    [...line].forEach((ch, dx) => {
      const tx = x + dx;
      if (ch !== '.' && tx >= 0 && tx < chars.length) chars[tx] = ch;
    });
    out[ty] = chars.join('');
  });
  return out;
}

/**
 * A still base composed from kit pieces, stamped in order over `ground`.
 *
 * WHY COMPOSE INSTEAD OF HAND-WRITING EVERY BASE. Twenty-five openers drawn from scratch would each
 * redraw the same window, table and keeper, and the copies would drift. Stamping keeps one source
 * for every piece; render-scene.mjs still shows the composed result, so nothing ships unseen.
 */
export function rmCompose(
  id: string,
  ground: string[],
  pieces: readonly (readonly [PixelSprite, number, number])[],
): PixelSprite {
  const rows = pieces.reduce((acc, [sprite, x, y]) => rmStamp(acc, sprite, x, y), ground);
  return { id, name: id, tags: ['scene', 'rm'], palette: RM_PALETTE, rows };
}

/** Swaps palette letters across rows and every frame, e.g. a bright prop retinted for a backdrop. */
export function rmRetint(sprite: PixelSprite, id: string, swap: Record<string, string>): PixelSprite {
  const tint = (rows: string[]) => rows.map((row) => [...row].map((ch) => swap[ch] ?? ch).join(''));
  return {
    ...sprite,
    id,
    name: id,
    rows: tint(sprite.rows),
    ...(sprite.frames ? { frames: sprite.frames.map(tint) } : {}),
  };
}

/**
 * The same framed sprite starting elsewhere in its cycle. Frames tick from mount with no offset
 * (PixelSpriteView), so two layers sharing one sprite would flash in step (the pilot's `later`).
 */
export function rmLater(sprite: PixelSprite, id: string, by: number, frameMs: number): PixelSprite {
  const frames = sprite.frames ?? [sprite.rows];
  return { ...sprite, id, name: id, frames: [...frames.slice(by), ...frames.slice(0, by)], frameMs };
}

/* ── the watch room ──────────────────────────────────────────────────────────────────────────── */

/**
 * The room the openers happen in: ceiling shadow, a cornice, plain wall, a baseboard and the floor.
 * Returns rows, not a sprite, because it is the ground every interior opener stamps onto.
 */
export function rmWatchRoom(width: number, height: number, floorY: number): string[] {
  return Array.from({ length: height }, (_, y) => {
    if (y < 2) return 'K'.repeat(width);
    if (y === 2) return 'D'.repeat(width);
    if (y < floorY - 1) return 'k'.repeat(width);
    if (y === floorY - 1) return 'D'.repeat(width);
    if (y === floorY) return 'k'.repeat(width);
    return 'K'.repeat(width);
  });
}

/** The tall window over the harbour, storm cloud overhead and the swell coming in. 44x32. */
export const rmStormWindow: PixelSprite = {
  id: 'rm-storm-window',
  name: 'storm window',
  tags: ['rm', 'set'],
  blurb: 'The watch-room window: storm sky, a far headland, the sea banding toward the glass, a sill.',
  palette: RM_PALETTE,
  rows: [
    '...DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD...',
    '..DDkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkKKKKKKDD..',
    '.DkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkKKKKKKKKD.',
    '.DkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkKKKKKKKKKD.',
    '.DkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkDKKKKKKKKKD.',
    '.DDkkkkkkkkDkkkkkkkkkkkkkkkkkkDDKKKKKKKKKKD.',
    '.DKDkkkkkDDKDkkkkkkkkkkkkkkkDDKKKKKKKKKKKKD.',
    '.DKKDDkDDKKKKDDkkkkkkkkkkDDDKKKKKKKKKKKKKKD.',
    '.DKKKKDKKKKKKKKDDkkkkkkDDKKKKKKKKKKKKKKKKKD.',
    '.DKKKKKKKKKKKKKKKDDDDDDKKKKKKKKKKKKKKKKKKKD.',
    '.DKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKD.',
    '.DkkkkKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKD.',
    '.DkkkkkkKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKD.',
    '.DkkkkkkkkuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuD.',
    '.DVVVVVVVVVVVVuuVVVVVVVVVVVVVVVVVVVuuVVVVVD.',
    '.DVVVuuVVVVVVVVVVVVVVVVVVuuuVVVVVVVVVVVVVVD.',
    '.DvVVVVVVVVVuuuVVVVVVVVVVVVVVVVVVVuuuVVVVVD.',
    '.DvvvvVVVVVVVVVVVVuuuuVVVVVVVVvvvvvvvvvvvvD.',
    '.DvvuuuuvvvvvvvvvvvvvvvvvvuuuuuvvvvvvvvvvvD.',
    '.DvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvuuuvvD.',
    '.DvvvvvvvvvvbbbbvvvvvvvvvvvvvvvvvvvvvvvvvvD.',
    '.DwwvvvvvvbbuuuubbvvvvvvvvvvvvvvbbbbvvvvvvD.',
    '.DuuBwvvbbuuuuuuuubbvvvvvvvvvbbbuuuubbvvvvD.',
    '.DuuuuBwBuuuuuuuuuuuBwvvvvbbbuuuuuuuuuBwvvD.',
    '.DVVuuuuuuuuuVVuuuuuuuBwwBuuuuuVVVuuuuuuBwD.',
    '.DVVVVuuuVVVVVVVVVVuuuuuuuuuuVVVVVVVVVuuuuD.',
    '.DVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVD.',
    '.DVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVD.',
    '.DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD.',
    'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    '.KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK.',
  ],
};

/** The chart table under the instruments: a sea chart on top, two drawers, legs. 26x14. */
export const rmChartTable: PixelSprite = {
  id: 'rm-chart-table',
  name: 'chart table',
  tags: ['rm', 'prop'],
  rows: [
    '.DDDDDDDDDDDDDDDDDDDDDDDD.',
    'DXxwwwwbbwwwwwwwwwwwwwwxXD',
    'DXwwbbbbwwwRwRwRwwbbbwwwXD',
    'DXXXXXXXXXXXXXXXXXXXXXXXXD',
    'DDDDDDDDDDDDDDDDDDDDDDDDDD',
    'DKKKKKKKKKKKDKKKKKKKKKKKKD',
    'DKKKKKxKKKKKDKKKKKKxKKKKKD',
    'DKKKKKKKKKKKDKKKKKKKKKKKKD',
    'DDDDDDDDDDDDDDDDDDDDDDDDDD',
    '.DXD..................DXD.',
    '.DXD..................DXD.',
    '.DXD..................DXD.',
    '.DXD..................DXD.',
    '.DDD..................DDD.',
  ],
};

/** The ship's clock, stopped at a quarter past four: JPMorgan's 4:15 risk report. 11x11. */
export const rmShipClock: PixelSprite = {
  id: 'rm-ship-clock',
  name: 'ship clock',
  tags: ['rm', 'prop'],
  rows: [
    '...OOOOO...',
    '.OOGGGGGOO.',
    '.OGwwXwwgO.',
    'OGwwwwwwwgO',
    'OGwwwwwwwgO',
    'OGXwwKKKXgO',
    'OGwwwwKwwgO',
    'OGwwwwwwwgO',
    '.OGwwXwwgO.',
    '.OOgggggOO.',
    '...OOOOO...',
  ],
};

/**
 * The barometer: the one number. A brass dial with a fair-change-storm arc whose needle trembles
 * toward storm. Framed, 13x13, so it moves on its own frames without a transform.
 */
export const rmBarometer: PixelSprite = {
  id: 'rm-barometer',
  name: 'barometer',
  tags: ['rm', 'prop', 'var'],
  blurb: 'Value at Risk as a barometer: green fair, gold change, red storm, the needle near storm.',
  rows: [
    '....OOOOO....',
    '..OOGGGGGOO..',
    '.OOGGGGGGGOO.',
    '.OGNGwwwGRgO.',
    'OGNNwwwwKRRgO',
    'OGNwwwwKKwRgO',
    'OGNwwwOwwwRgO',
    'OGNwwwwwwwRgO',
    'OGNwwwwwwwRgO',
    '.OGwwwwwwwgO.',
    '.OOgwwwwwgOO.',
    '..OOgggggOO..',
    '....OOOOO....',
  ],
  frames: [
    [
      '....OOOOO....',
      '..OOGGGGGOO..',
      '.OOGGGGGGGOO.',
      '.OGNGwwwGRgO.',
      'OGNNwwwwKRRgO',
      'OGNwwwwKKwRgO',
      'OGNwwwOwwwRgO',
      'OGNwwwwwwwRgO',
      'OGNwwwwwwwRgO',
      '.OGwwwwwwwgO.',
      '.OOgwwwwwgOO.',
      '..OOgggggOO..',
      '....OOOOO....',
    ],
    [
      '....OOOOO....',
      '..OOGGGGGOO..',
      '.OOGGGGGGGOO.',
      '.OGNGwwwGRgO.',
      'OGNNwwwwwRRgO',
      'OGNwwwwwKKRgO',
      'OGNwwwOKwwRgO',
      'OGNwwwwwwwRgO',
      'OGNwwwwwwwRgO',
      '.OGwwwwwwwgO.',
      '.OOgwwwwwgOO.',
      '..OOgggggOO..',
      '....OOOOO....',
    ],
    [
      '....OOOOO....',
      '..OOGGGGGOO..',
      '.OOGGGGGGGOO.',
      '.OGNGwwwGRgO.',
      'OGNNwwwwKRRgO',
      'OGNwwwwKKwRgO',
      'OGNwwwOwwwRgO',
      'OGNwwwwwwwRgO',
      'OGNwwwwwwwRgO',
      '.OGwwwwwwwgO.',
      '.OOgwwwwwgOO.',
      '..OOgggggOO..',
      '....OOOOO....',
    ],
    [
      '....OOOOO....',
      '..OOGGGGGOO..',
      '.OOGGGGGGGOO.',
      '.OGNGwwwGRgO.',
      'OGNNwwwwKRRgO',
      'OGNwwwwKwwRgO',
      'OGNwwwOwwwRgO',
      'OGNwwwwwwwRgO',
      'OGNwwwwwwwRgO',
      '.OGwwwwwwwgO.',
      '.OOgwwwwwgOO.',
      '..OOgggggOO..',
      '....OOOOO....',
    ],
  ],
  frameMs: 260,
};

/** The hurricane lantern on the chart table; the flame flickers. 7x10. */
export const rmLantern: PixelSprite = {
  id: 'rm-lantern',
  name: 'lantern',
  tags: ['rm', 'prop'],
  rows: [
    '..OOO..',
    '.O...O.',
    '.OGGGO.',
    '.x.4.x.',
    '.x434x.',
    '.x353x.',
    '.x434x.',
    '.OGGGO.',
    'OGGGGGO',
    '.OOOOO.',
  ],
  frames: [
    [
      '..OOO..',
      '.O...O.',
      '.OGGGO.',
      '.x.4.x.',
      '.x434x.',
      '.x353x.',
      '.x434x.',
      '.OGGGO.',
      'OGGGGGO',
      '.OOOOO.',
    ],
    [
      '..OOO..',
      '.O...O.',
      '.OGGGO.',
      '.x4..x.',
      '.x343x.',
      '.x454x.',
      '.x434x.',
      '.OGGGO.',
      'OGGGGGO',
      '.OOOOO.',
    ],
    [
      '..OOO..',
      '.O...O.',
      '.OGGGO.',
      '.x.4.x.',
      '.x434x.',
      '.x353x.',
      '.x343x.',
      '.OGGGO.',
      'OGGGGGO',
      '.OOOOO.',
    ],
    [
      '..OOO..',
      '.O...O.',
      '.OGGGO.',
      '.x..4x.',
      '.x434x.',
      '.x454x.',
      '.x434x.',
      '.OGGGO.',
      'OGGGGGO',
      '.OOOOO.',
    ],
  ],
  frameMs: 180,
};

/** The keeper's logbook, open on the table. 13x4. */
export const rmLogbook: PixelSprite = {
  id: 'rm-logbook',
  name: 'logbook',
  tags: ['rm', 'prop'],
  rows: [
    '.wwwwwDwwwww.',
    'wXXXwwDwXXXww',
    'wwwwwwDwwwwww',
    'rrrrrrrrrrrrr',
  ],
};

/** A coil of mooring line on the floor, its end trailing off to the right. 16x7. */
export const rmRopeCoil: PixelSprite = {
  id: 'rm-rope-coil',
  name: 'rope coil',
  tags: ['rm', 'prop'],
  rows: [
    '....DxXxXxXD....',
    '..DxXDDDDDDXxD..',
    '.DXxDxXxXxXDxXD.',
    '.DxXDDKKKKDDXxD.',
    '.DXxDxXxXxXDxXD.',
    '..DxXDDDDDDXxD..',
    '....DxXxXxXDXxXx',
  ],
};

/* ── the keeper ──────────────────────────────────────────────────────────────────────────────── */

/**
 * The keeper: the risk officer in a yellow oilskin and sou'wester, spyglass to the eye, facing left
 * toward the window. 18x29. Boots are D, not K, so they keep their shape on the K floor.
 */
export const rmKeeper: PixelSprite = {
  id: 'rm-keeper',
  name: 'keeper',
  tags: ['rm', 'character'],
  palette: RM_PALETTE,
  rows: [
    '..........OOOO....',
    '.........OyyGGO...',
    '........OyGGGGgO..',
    '........OGGGGGgO..',
    '.....OOOOGGGGGggOO',
    '....OyyyyyyyGGGggO',
    'OO...OOOMMMMMOGggO',
    'OyyyyyyySSSSMOGggO',
    'OGGGGGgOKSSSMOGgO.',
    'OO..SSMOSSSSMOggO.',
    '...OSSMO.SSMMOOO..',
    '....OGGO..OMMOGO..',
    '.....OGGOGGGGGGO..',
    '......OGGgGGGGGgO.',
    '......OyGgGGGGGggO',
    '......OyOgGGGGGggO',
    '......OyGgGGGGGggO',
    '......OyOgGGGGGggO',
    '......OyGgGGgggggO',
    '.....OyGOgGGGGGggO',
    '.....OyGGgGGGGGggO',
    '.....OyGGgGGGGgggO',
    '.....OOOOOOOOOOOOO',
    '.......DkkD.DkkD..',
    '.......DkkD.DkkD..',
    '......DXDDD.DXDDD.',
    '......DXDDD.DXDDD.',
    '....DDXDDDDDXDDDD.',
    '....DDDDDDDDDDDDD.',
  ],
};

/* ── weather and sea, the small moving bits ─────────────────────────────────────────────────── */

/** A small sailing ship riding the swell, stern lantern lit. 11x9. Give it a `bob`. */
export const rmShip: PixelSprite = {
  id: 'rm-ship',
  name: 'ship',
  tags: ['rm', 'sea'],
  rows: [
    '.....D.....',
    '....wD.....',
    '...wwDx....',
    '..wwwDxx...',
    '.wwwwDxxx..',
    'wwwwwDxxxx.',
    '.....D.....',
    'yDDDDDDDDDD',
    '.kkkkkkkkk.',
  ],
};

/** Lightning: a bolt that fires twice and goes dark. The still is the bolt. 7x11. */
export const rmLightning: PixelSprite = {
  id: 'rm-lightning',
  name: 'lightning',
  tags: ['rm', 'weather'],
  rows: [
    '...WQ..',
    '..WQ...',
    '..W....',
    '.WWWW..',
    '...WQ..',
    '..WQ...',
    '..W....',
    '.WWQ...',
    '.W.....',
    'Q......',
    '.......',
  ],
  frames: [
    [
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
    ],
    [
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
    ],
    [
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
    ],
    [
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
    ],
    [
      '...WQ..',
      '..WQ...',
      '..W....',
      '.WWWW..',
      '...WQ..',
      '..WQ...',
      '..W....',
      '.WWQ...',
      '.W.....',
      'Q......',
      '.......',
    ],
    [
      '...QQ..',
      '..QQ...',
      '..Q....',
      '.QQQQ..',
      '...QQ..',
      '..QQ...',
      '..Q....',
      '.QQQ...',
      '.Q.....',
      'Q......',
      '.......',
    ],
    [
      '...WQ..',
      '..WQ...',
      '..W....',
      '.WWWW..',
      '...WQ..',
      '..WQ...',
      '..W....',
      '.WWQ...',
      '.W.....',
      'Q......',
      '.......',
    ],
    [
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
    ],
    [
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
    ],
    [
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
    ],
    [
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
    ],
    [
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
    ],
    [
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
      '.......',
    ],
  ],
  frameMs: 170,
};

/** Rain on the glass, three frames falling. 40x24, so it covers a window and stays framed-legal. */
export const rmRain: PixelSprite = {
  id: 'rm-rain',
  name: 'rain',
  tags: ['rm', 'weather'],
  rows: [
    '........................................',
    '............X...........................',
    '...........X...X........................',
    '..........x...X.........................',
    '.............x..........................',
    '...................X....................',
    '..................X.....................',
    '.................x......................',
    '................x.......................',
    '.....X............................X.....',
    'X...X............................X......',
    '...x................X...........x.......',
    '...................X....................',
    '..................x....X................',
    '......................X.................',
    '.....................x..................',
    '........................................',
    '........X...............................',
    '.......X................................',
    '......x.....X..........X................',
    '...........X..........X.................',
    '..........x..........x..................',
    '........................................',
    '........................................',
  ],
  frames: [
    [
      '........................................',
      '............X...........................',
      '...........X...X........................',
      '..........x...X.........................',
      '.............x..........................',
      '...................X....................',
      '..................X.....................',
      '.................x......................',
      '................x.......................',
      '.....X............................X.....',
      'X...X............................X......',
      '...x................X...........x.......',
      '...................X....................',
      '..................x....X................',
      '......................X.................',
      '.....................x..................',
      '........................................',
      '........X...............................',
      '.......X................................',
      '......x.....X..........X................',
      '...........X..........X.................',
      '..........x..........x..................',
      '........................................',
      '........................................',
    ],
    [
      '........................................',
      '.....X..................................',
      '....X...................................',
      '...x.....X..........X...................',
      '........X..........X....................',
      '.......x..........x.....................',
      '........................................',
      '........................................',
      '........................................',
      '.........X..............................',
      '........X...X...........................',
      '.......x...X............................',
      '..........x.............................',
      '................X.......................',
      '...............X........................',
      '..............x.........................',
      '.............x..........................',
      '..X............................X........',
      '.X............................X......X..',
      'x................X...........x......X...',
      '................X..................x....',
      '...............x....X...................',
      '...................X....................',
      '..................x.....................',
    ],
    [
      '........................................',
      '............................X..........X',
      '...........................X......X...X.',
      '..............X...........x......X...x..',
      '.............X..................x.......',
      '............x....X......................',
      '................X.......................',
      '...............x........................',
      '........................................',
      '..X.....................................',
      '.X......................................',
      'x.....X..........X......................',
      '.....X..........X.......................',
      '....x..........x........................',
      '........................................',
      '........................................',
      '........................................',
      '......X.................................',
      '.....X...X..............................',
      '....x...X...............................',
      '.......x................................',
      '.............X..........................',
      '............X...........................',
      '...........x............................',
    ],
  ],
  frameMs: 150,
};

/** Near swell crests with foam. Give it a `drift`; keep `amp` inside whatever frames it. 34x3. */
export const rmSwell: PixelSprite = {
  id: 'rm-swell',
  name: 'swell',
  tags: ['rm', 'sea'],
  palette: RM_PALETTE,
  rows: [
    '...ww............ww..........ww...',
    '.wBBBw.........wBBBw.......wBBBBw.',
    'BBuuuBBB.....BBuuuuBB....BBuuuuuBB',
  ],
};

/** A gull: wings up, level, down, level. 7x3. */
export const rmGull: PixelSprite = {
  id: 'rm-gull',
  name: 'gull',
  tags: ['rm', 'sea'],
  rows: [
    'w.....w',
    '.w...w.',
    '..wxw..',
  ],
  frames: [
    [
      'w.....w',
      '.w...w.',
      '..wxw..',
    ],
    [
      '.......',
      'ww...ww',
      '..wxw..',
    ],
    [
      '.......',
      '..wxw..',
      '.w...w.',
    ],
    [
      '.......',
      'ww...ww',
      '..wxw..',
    ],
  ],
  frameMs: 220,
};

/* ── signal flags: the four risks ────────────────────────────────────────────────────────────── */

/**
 * Bunting of the four risk types in the lesson's own colours, left to right: market (red), credit
 * (orchid), operational (gold), liquidity (blue). Each pennant sways on its own phase. 46x9.
 */
export const rmRiskFlags: PixelSprite = {
  id: 'rm-risk-flags',
  name: 'risk flags',
  tags: ['rm', 'prop', 'four risks'],
  rows: [
    'Dx..........................................xD',
    '..xxxxx................................xxxxx..',
    '.......xxxxxxx..................xxxxxxx.......',
    '......RRRRr...xxxxxxxxxxxxxxxxxx...BBBBb......',
    '......RRRRr.....PPPPp....GGGGg.....BBBBb......',
    '.......RRr......PPPPp....GGGGg......BBb.......',
    '.......RRr.......PPp.......GGg.......BBb......',
    '........R.......PPp........GGg........B.......',
    '.................P..........G.................',
  ],
  frames: [
    [
      'Dx..........................................xD',
      '..xxxxx................................xxxxx..',
      '.......xxxxxxx..................xxxxxxx.......',
      '......RRRRr...xxxxxxxxxxxxxxxxxx...BBBBb......',
      '......RRRRr.....PPPPp....GGGGg.....BBBBb......',
      '.......RRr......PPPPp....GGGGg......BBb.......',
      '.......RRr.......PPp.......GGg.......BBb......',
      '........R.......PPp........GGg........B.......',
      '.................P..........G.................',
    ],
    [
      'Dx..........................................xD',
      '..xxxxx................................xxxxx..',
      '.......xxxxxxx..................xxxxxxx.......',
      '......RRRRr...xxxxxxxxxxxxxxxxxx...BBBBb......',
      '......RRRRr.....PPPPp....GGGGg.....BBBBb......',
      '.......RRr......PPPPp....GGGGg.......BBb......',
      '........RRr......PPp......GGg........BBb......',
      '.........R.......PPp.....GGg..........B.......',
      '..................P.......G...................',
    ],
    [
      'Dx..........................................xD',
      '..xxxxx................................xxxxx..',
      '.......xxxxxxx..................xxxxxxx.......',
      '......RRRRr...xxxxxxxxxxxxxxxxxx...BBBBb......',
      '......RRRRr.....PPPPp....GGGGg.....BBBBb......',
      '........RRr.....PPPPp....GGGGg......BBb.......',
      '........RRr......PPp......GGg......BBb........',
      '.........R........PPp.....GGg.......B.........',
      '...................P.......G..................',
    ],
    [
      'Dx..........................................xD',
      '..xxxxx................................xxxxx..',
      '.......xxxxxxx..................xxxxxxx.......',
      '......RRRRr...xxxxxxxxxxxxxxxxxx...BBBBb......',
      '......RRRRr.....PPPPp....GGGGg.....BBBBb......',
      '.......RRr......PPPPp....GGGGg......BBb.......',
      '......RRr.........PPp.....GGg.......BBb.......',
      '.......R..........PPp......GGg.......B........',
      '...................P........G.................',
    ],
  ],
  frameMs: 300,
};

/* ── the keepsake: a life ring with an emblem at its heart ───────────────────────────────────── */

/**
 * THE PATHWAY'S KEEPSAKE SHAPE. Red and white life ring, 32x32 with its grab line, rim-lit from the
 * top left. The hole is night sea (v), 18 across, so any emblem up to 16x16 sits inside with a pixel
 * to spare; the catalogue sprites are 16x16, so one can stand in for a drawn emblem in a hurry.
 */
export const rmLifeRing: PixelSprite = {
  id: 'rm-life-ring',
  name: 'life ring',
  tags: ['rm', 'keepsake'],
  palette: RM_PALETTE,
  rows: [
    '........xxxxxxxxxxxxxxxx........',
    '......xxx.11DWWWWWWD11.xxx......',
    '....xxx.11ssWWWWWWWWss11.xxx....',
    '...xx.11sssswwwwwwwwsssR11.xx...',
    '..xx.1ssssRRRwwwwwwRRRsRRR1.xx..',
    '..x.1sssRRRRRxxxxxxRRRRRRRR1.x..',
    '.xx1sssRRRrrrDDDDDDrrrRRRRRR1xx.',
    '.x.1ssRRRrr11vvvvvv11rRRRRRR1.x.',
    'xx1ssRRRrr1vvvvvvvvvv1RRRRRrr1xx',
    'x.1ssRRrr1vvvvvvvvvvvv1RRRRrr1.x',
    'x1ssRRrr1vvvvvvvvvvvvvv1RRRrrr1x',
    'x1ssRRr1vvvvvvvvvvvvvvvv1RRRrr1x',
    'xDWwRRr1vvvvvvvvvvvvvvvv1RRRxxDx',
    'xWWwwxDvvvvvvvvvvvvvvvvvvDwwxxxx',
    'xWWwwxDvvvvvvvvvvvvvvvvvvDwwxxxx',
    'xWWwwxDvvvvvvvvvvvvvvvvvvDwwxxxx',
    'XWWwwxDvvvvvvvvvvvvvvvvvvDwwxxxX',
    'XWWwwxDvvvvvvvvvvvvvvvvvvDwwxxxX',
    'XWWwwxDvvvvvvvvvvvvvvvvvvDwwxxxX',
    'XDWwRRr1vvvvvvvvvvvvvvvv1RRRxxDX',
    'X1ssRRr1vvvvvvvvvvvvvvvv1RRRrr1X',
    'X1ssRRrr1vvvvvvvvvvvvvv1RRRrrr1X',
    'X.1ssRRRR1vvvvvvvvvvvv1RRRRrr1.X',
    'XX1RRRRRRR1vvvvvvvvvv1RRRRrrr1XX',
    '.X.1RRRRRRR11vvvvvv11RRRRrrr1.X.',
    '.XX1RRRRRRRRRDDDDDDRRRRRrrrr1XX.',
    '..X.1RRRRRRRRwwwwwwRRRRrrrr1.X..',
    '..XX.1RRrrrRRwwwwwwRRrrrrr1.XX..',
    '...XX.11rrrrxxxxxxxxrrrr11.XX...',
    '....XXX.11rrxxxxxxxxrr11.XXX....',
    '......XXX.11DxxxxxxD11.XXX......',
    '........XXXXXXXXXXXXXXXX........',
  ],
};

/** Lesson 1's emblem: a compass star, one point per risk type in the flags' colours. 15x15. */
export const rmEmblemCompass: PixelSprite = {
  id: 'rm-emblem-compass',
  name: 'compass of four risks',
  tags: ['rm', 'emblem', 'lesson 1'],
  rows: [
    '.......R.......',
    '.......R.......',
    '......RRr......',
    '......RRr......',
    '.....RRRrr.....',
    '....BRRRrrP....',
    '..BBBBwwwPPPP..',
    'bbbbbbwWwPPPPPP',
    '..bbbbwwwpppp..',
    '....bGGgggp....',
    '.....GGggg.....',
    '......Ggg......',
    '......Ggg......',
    '.......g.......',
    '.......g.......',
  ],
};

/** The hook and rope the ring hangs from. Drawn into the keepsake's base. */
const keepsakeRope: PixelSprite = {
  id: 'rm-keepsake-rope',
  name: 'keepsake rope',
  tags: ['rm', 'keepsake'],
  rows: [
    '..OOO..',
    '.Oy.gO.',
    '.OG.gO.',
    '..OOO..',
    '...xX..',
    '..Xx...',
    '...xX..',
    '..Xx...',
    '...xX..',
  ],
};

const sparkleBig: PixelSprite = {
  id: 'rm-sparkle-big',
  name: 'sparkle big',
  tags: ['rm', 'keepsake'],
  rows: [
    '..w..',
    '..w..',
    'wwWww',
    '..w..',
    '..w..',
  ],
  frames: [
    ['..w..', '..w..', 'wwWww', '..w..', '..w..'],
    ['.....', '..w..', '.wWw.', '..w..', '.....'],
    ['.....', '.....', '..W..', '.....', '.....'],
    ['.....', '..w..', '.wWw.', '..w..', '.....'],
  ],
  frameMs: 360,
};

const droplet: PixelSprite = {
  id: 'rm-droplet',
  name: 'droplet',
  tags: ['rm', 'keepsake'],
  rows: [
    'B',
    'b',
  ],
};

/**
 * Builds a finish keepsake for any lesson: the ring and its emblem bob together on the rope, with
 * sparkles and spray around them. 48x40 at 3pt per pixel, the pilot's keepsake size.
 *
 * TWO LAYERS, ONE MOTION. The ring and the emblem are separate layers so the emblem can be swapped,
 * and they share the same bob (same period, no phase), so they start on the same frame and cannot
 * drift apart; a sub-point lag would be invisible anyway. The rope in the base runs two pixels into
 * the ring's top band, so the ring never lifts off it at the top of a bob.
 */
export function rmKeepsake(id: string, label: string, emblem: PixelSprite): SceneArt {
  const ew = emblem.rows[0].length;
  const eh = emblem.rows.length;
  const ringX = 8;
  const ringY = 7;
  const bob = { kind: 'bob', amp: 1, periodMs: 2600 } as const;
  const layers: SceneLayer[] = [
    { sprite: rmLifeRing, x: ringX, y: ringY, motion: bob },
    { sprite: emblem, x: ringX + 16 - Math.ceil(ew / 2), y: ringY + 16 - Math.ceil(eh / 2), motion: bob },
    { sprite: sparkleBig, x: 2, y: 10, motion: { kind: 'twinkle', periodMs: 1700, min: 0.45 } },
    { sprite: rmLater(sparkleBig, 'rm-sparkle-big-later', 2, 410), x: 41, y: 28, motion: { kind: 'twinkle', periodMs: 2100, phase: 0.5, min: 0.45 } },
    { sprite: droplet, x: 6, y: 30, motion: { kind: 'rise', amp: 5, periodMs: 2300, phase: 0.2 } },
    { sprite: droplet, x: 42, y: 14, motion: { kind: 'rise', amp: 4, periodMs: 2700, phase: 0.65 } },
  ];
  const ground = Array.from({ length: 40 }, () => '.'.repeat(48));
  return { id, label, width: 48, height: 40, base: rmCompose(`${id}-base`, ground, [[keepsakeRope, 21, 0]]), layers };
}
