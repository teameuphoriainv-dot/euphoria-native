/**
 * Business Strategy art kit: the pieces every scene in this pathway is put together from.
 *
 * The world is a strategist's realm at night. The house wears orchid and gold (its banner, the
 * strategist's coat), rivals are red, newcomers teal, and a castle in its moat stands for an advantage
 * worth defending. Lit pieces are for openers and keepsakes; the Night pieces stay at or under
 * luminance 0.15, so a backdrop can carry them behind text. Light comes from the left, edges use the
 * deep steps, and every framed piece is small and loops by itself (`rows` is its still, for Reduce
 * Motion). Each blurb says where its piece stands, so a new opener is mostly placement.
 *
 * NATIVE-OWNED, like everything in scenes/ (CONSTITUTION 5.5: new art never goes in the web-synced
 * sprite files).
 */
import type { PixelSprite } from '../types';

/**
 * The same framed sprite starting elsewhere in its cycle, at its own pace. Frames tick from mount
 * with no offset (PixelSpriteView), so two layers sharing one sprite would move in step; a twinkle
 * `phase` only offsets opacity, never the shape.
 */
export function bsLater(sprite: PixelSprite, id: string, by: number, frameMs: number): PixelSprite {
  const frames = sprite.frames ?? [sprite.rows];
  return { ...sprite, id, frames: [...frames.slice(by), ...frames.slice(0, by)], frameMs };
}

/** A frame made from a still by replacing only the rows that move, so the rest cannot drift from it. */
export function bsMoved(rows: string[], edits: Readonly<Record<number, string>>): string[] {
  return rows.map((row, i) => edits[i] ?? row);
}

// The set.

export const bsWarRoom: PixelSprite = {
  id: 'bs-war-room',
  name: 'war-room',
  tags: ['scene', 'bs'],
  blurb: 'The empty war room, 80x60, a whole opener base: stone wall, a moonlit arched window high on the right (sky at 72..77, 4..13), a dark floor from row 42.',
  rows: [
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkDDkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkKKKKkkkkkkkkkkkkkDDKKDDkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkKkkkkkkkkkkkkkkkDKKKKDkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkDKKKKyKDk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkDKKKKKyDk',
    'kKKKKkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkDKKKKyKDk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkDKKKKKKDk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkDKKKKKKDk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkDKKKKKKDk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkDKEKKKKDk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkDEEEKKKDk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkDEEEEEKDk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkDDDDDDDDk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkXXXXXXXXk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkKKKkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkKKKKkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkKkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkKKKKKkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkKkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkKKKKKKkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkKKKKKkkkkk',
    'kkkKkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkKkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
  ],
};

// The strategist. Skin and hair are the cast's own tones (sprites-characters.ts), carried per sprite
// rather than added to the shared palette, so they never retint on the light canvas.
const strategistRows = [
  '..............DDDD....',
  '.............DHHHHD...',
  '............DHHHHHHD..',
  '............SSSHHHHD..',
  '............SKSUHHHD..',
  '...........SSSSSHHD...',
  '............SSSUHHD...',
  '.............SSUUD....',
  '.............wUUw.....',
  '............EqwwPGGE..',
  '...........EqPPPPGGpE.',
  '..........EqPPEPPPPppE',
  '.........EqPPEqPPPPppE',
  '........EqPPEqqPPPPppE',
  '......SSqPPEqqPPPPPppE',
  '......SSEEEqqPPPPPPppE',
  '.....O....EqGPPPPPPppE',
  '.....O....EqPPPPPPPppE',
  '....O.....EqGPPPPPPppE',
  '....O.....EqPPPPPPPppE',
  '...O......EEEEEEEEEEEE',
  '...O..................',
  '..O...................',
  '.OOO..................',
  '......................',
];

export const bsStrategist: PixelSprite = {
  id: 'bs-strategist',
  name: 'strategist',
  tags: ['scene', 'bs'],
  blurb: "The strategist in profile facing left, leaning over a table and pushing a piece with a long rake. Row 20 is the table's far edge: place at (x, tableY - 20), drawn after the table; the rake head lands on the felt at (x + 1..3, tableY + 3). Frames: rest, push, rest, blink.",
  palette: { S: '#C08552', U: '#9A6638', H: '#43291A' },
  rows: strategistRows,
  frames: [
    strategistRows,
    bsMoved(strategistRows, {
      14: '.....SSqqPPEqqPPPPPppE',
      15: '.....SSEEEEqqPPPPPPppE',
      16: '....O.....EqGPPPPPPppE',
      17: '....O.....EqPPPPPPPppE',
      18: '...O......EqGPPPPPPppE',
      19: '...O......EqPPPPPPPppE',
      20: '..O.......EEEEEEEEEEEE',
      21: '..O...................',
      22: '.O....................',
      23: 'OOO...................',
    }),
    strategistRows,
    bsMoved(strategistRows, {
      4: '............SSSUHHHD..',
    }),
  ],
  frameMs: 650,
};

// The war table and what stands on it. Z is the cast-shadow tone the quant opener uses: a drawn step
// between the floor ink and the canvas, so the shadow stays a shadow instead of a hole.
export const bsWarTable: PixelSprite = {
  id: 'bs-war-table',
  name: 'war-table',
  tags: ['scene', 'bs'],
  blurb: 'The war table in 3/4 view: green map felt on rows 1 to 8, a wood apron, four legs, its own floor shadow. Draw pieces after it.',
  palette: { Z: '#110E17' },
  rows: [
    '...OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO...',
    '...OggggggggggggggggggggggggggggggggggggggggggggggggggggggO...',
    '...OgnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnOO...',
    '..OgnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnOO..',
    '..OgnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnOO..',
    '..OgnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnOO..',
    '.OgnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnOO.',
    '.OgnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnOO.',
    '.OgnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnOO.',
    'OGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGO',
    'OggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggO',
    'OggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggO',
    'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
    '..GgOZZZOOZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZOOZZZZGgO..',
    '..GgOZZZOOZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZOOZZZZGgO..',
    '..GgOZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZGgO..',
    '..GgOZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZGgO..',
    '..GgOZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZGgO..',
    '.ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ.',
  ],
};

export const bsMoatKeep: PixelSprite = {
  id: 'bs-moat-keep',
  name: 'moat-keep',
  tags: ['scene', 'bs'],
  blurb: 'A castle model on an island ringed by its moat, for the table: place at (x, tableY - 8) so the ring lies on the felt. Light runs round the water and the flag flutters.',
  rows: [
    '...........qP...........',
    '...........PPq..........',
    '...........D............',
    '..DD.DD....D.....DD.DD..',
    '..DxXxD..DDDDD...DxXXD..',
    '..DxXXD.DDxDxDD..DxXXD..',
    '..DxXXDDDxxxXXDDDDxXXD..',
    '..DxKXDxxxxxXXXXDDxKXD..',
    '..DxXXDxxxxDDXXXDDxXXD..',
    '..DxXXDxxxDKKDXXDDxXXD..',
    '..DDDDDDDDDKKDDDDDDDDD..',
    '..bBBBnnNNNNNNNNnnBBwb..',
    '.bBBBnnNNNNNNNNNNnnBBBb.',
    '.bBBwBnnNNNNNNNNnnBBBBb.',
    '..bBBBBBBBBBBBBBBBBBBb..',
    '....bbbBBBBBBBBwBbbb....',
  ],
  frames: [
    [
      '...........qP...........',
      '...........PPq..........',
      '...........D............',
      '..DD.DD....D.....DD.DD..',
      '..DxXxD..DDDDD...DxXXD..',
      '..DxXXD.DDxDxDD..DxXXD..',
      '..DxXXDDDxxxXXDDDDxXXD..',
      '..DxKXDxxxxxXXXXDDxKXD..',
      '..DxXXDxxxxDDXXXDDxXXD..',
      '..DxXXDxxxDKKDXXDDxXXD..',
      '..DDDDDDDDDKKDDDDDDDDD..',
      '..bBBBnnNNNNNNNNnnBBwb..',
      '.bBBBnnNNNNNNNNNNnnBBBb.',
      '.bBBwBnnNNNNNNNNnnBBBBb.',
      '..bBBBBBBBBBBBBBBBBBBb..',
      '....bbbBBBBBBBBwBbbb....',
    ],
    [
      '...........qPP..........',
      '...........PP...........',
      '...........D............',
      '..DD.DD....D.....DD.DD..',
      '..DxXxD..DDDDD...DxXXD..',
      '..DxXXD.DDxDxDD..DxXXD..',
      '..DxXXDDDxxxXXDDDDxXXD..',
      '..DxKXDxxxxxXXXXDDxKXD..',
      '..DxXXDxxxxDDXXXDDxXXD..',
      '..DxXXDxxxDKKDXXDDxXXD..',
      '..DDDDDDDDDKKDDDDDDDDD..',
      '..bwBBnnNNNNNNNNnnBBBb..',
      '.bBBBnnNNNNNNNNNNnnBBBb.',
      '.bBBBBnnNNNNNNNNnnBBBBb.',
      '..bBBBwBBBBBBBBBBwBBBb..',
      '....bbbBBBBBBBBBBbbb....',
    ],
    [
      '...........qP...........',
      '...........PPq..........',
      '...........D............',
      '..DD.DD....D.....DD.DD..',
      '..DxXxD..DDDDD...DxXXD..',
      '..DxXXD.DDxDxDD..DxXXD..',
      '..DxXXDDDxxxXXDDDDxXXD..',
      '..DxKXDxxxxxXXXXDDxKXD..',
      '..DxXXDxxxxDDXXXDDxXXD..',
      '..DxXXDxxxDKKDXXDDxXXD..',
      '..DDDDDDDDDKKDDDDDDDDD..',
      '..bBBBnnNNNNNNNNnnBBBb..',
      '.bBBBnnNNNNNNNNNNnnBBBb.',
      '.bBBBBnnNNNNNNNNnnBBwBb.',
      '..bBBBBBBBBBBBBBBBBBBb..',
      '....bbbBBwBBBBBBBbbb....',
    ],
  ],
  frameMs: 600,
};

export const bsPawn: PixelSprite = {
  id: 'bs-pawn',
  name: 'pawn',
  tags: ['scene', 'bs'],
  blurb: 'Our piece on the war table: orchid, standing on its bottom row.',
  rows: [
    '.q.',
    'qPp',
    '.P.',
    'qPp',
    'EEE',
  ],
};

export const bsPawnRival: PixelSprite = {
  id: 'bs-pawn-rival',
  name: 'pawn-rival',
  tags: ['scene', 'bs'],
  blurb: "A rival's piece: red, standing on its bottom row.",
  rows: [
    '.s.',
    'sRr',
    '.R.',
    'sRr',
    '111',
  ],
};

// On the walls.

export const bsScroll: PixelSprite = {
  id: 'bs-scroll',
  name: 'scroll',
  tags: ['scene', 'bs'],
  blurb: 'A blank parchment chart hung from a nail. The parchment runs from (2, 4) to (28, 22); a diagram up to 25x17 sits on it.',
  rows: [
    '...............DD...............',
    '.............gggggg.............',
    'GggggggggggggggggggggggggggggggG',
    'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
    '.OyyyyyyyyyyyyyyyyyyyyyyyyyyyGO.',
    '.OyyyyyyyyyyyyyyyyyyyyyyyyyyyGO.',
    '.OyyyyyyyyyyyyyyyyyyyyyyyyyyyGO.',
    '.OyyyyyyyyyyyyyyyyyyyyyyyyyyyGO.',
    '.OyyyyyyyyyyyyyyyyyyyyyyyyyyyGO.',
    '.OyyyyyyyyyyyyyyyyyyyyyyyyyyyGO.',
    '.OyyyyyyyyyyyyyyyyyyyyyyyyyyyGO.',
    '.OyyyyyyyyyyyyyyyyyyyyyyyyyyyGO.',
    '.OyyyyyyyyyyyyyyyyyyyyyyyyyyyGO.',
    '.OyyyyyyyyyyyyyyyyyyyyyyyyyyyGO.',
    '.OyyyyyyyyyyyyyyyyyyyyyyyyyyyGO.',
    '.OyyyyyyyyyyyyyyyyyyyyyyyyyyyGO.',
    '.OyyyyyyyyyyyyyyyyyyyyyyyyyyyGO.',
    '.OyyyyyyyyyyyyyyyyyyyyyyyyyyyGO.',
    '.OyyyyyyyyyyyyyyyyyyyyyyyyyyyGO.',
    '.OyyyyyyyyyyyyyyyyyyyyyyyyyyyGO.',
    '.OyyyyyyyyyyyyyyyyyyyyyyyyyyyGO.',
    '.OyyyyyyyyyyyyyyyyyyyyyyyyyyyGO.',
    '.OyyyyyyyyyyyyyyyyyyyyyyyyyyyGO.',
    '.OGGGGGGGGGGGGGGGGGGGGGGGGGGGGO.',
    'GggggggggggggggggggggggggggggggG',
    'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
    '................................',
  ],
};

export const bsFiveForces: PixelSprite = {
  id: 'bs-five-forces',
  name: 'five-forces',
  tags: ['scene', 'bs'],
  blurb: "Porter's five forces for the scroll, at scroll + (4, 5): new entrants, suppliers, buyers and substitutes press on rivalry in the middle. The arrows push in and ease off.",
  rows: [
    'OO.OOO..OOOOOOO........',
    'O.OO....ONNNNNO........',
    '........OOOOOOO........',
    'rrrrr......O...........',
    '..........OOO..........',
    '...........O...........',
    '........OOOOOOO........',
    'OOOOO.O.ORRRRRO.O.OOOOO',
    'ObbbOOOOORrOrROOOOOpppO',
    'OOOOO.O.ORRRRRO.O.OOOOO',
    '........OOOOOOO........',
    '...........O...........',
    '..........OOO..........',
    '...........O...........',
    '........OOOOOOO...OOO.O',
    '........OtttttO..OO.OO.',
    '........OOOOOOO........',
  ],
  frames: [
    [
      'OO.OOO..OOOOOOO........',
      'O.OO....ONNNNNO........',
      '........OOOOOOO........',
      'rrrrr......O...........',
      '..........OOO..........',
      '...........O...........',
      '........OOOOOOO........',
      'OOOOO.O.ORRRRRO.O.OOOOO',
      'ObbbOOOOORrOrROOOOOpppO',
      'OOOOO.O.ORRRRRO.O.OOOOO',
      '........OOOOOOO........',
      '...........O...........',
      '..........OOO..........',
      '...........O...........',
      '........OOOOOOO...OOO.O',
      '........OtttttO..OO.OO.',
      '........OOOOOOO........',
    ],
    [
      'OO.OOO..OOOOOOO........',
      'O.OO....ONNNNNO........',
      '........OOOOOOO........',
      'rrrrr..................',
      '...........O...........',
      '..........OOO..........',
      '........OOOOOOO........',
      'OOOOO..OORRRRROO..OOOOO',
      'ObbbO.OOORrOrROOO.OpppO',
      'OOOOO..OORRRRROO..OOOOO',
      '........OOOOOOO........',
      '..........OOO..........',
      '...........O...........',
      '.......................',
      '........OOOOOOO...OOO.O',
      '........OtttttO..OO.OO.',
      '........OOOOOOO........',
    ],
  ],
  frameMs: 700,
};

const wallBannerRows = [
  '.......DD.......',
  '......g..g......',
  '.G...g....g...G.',
  'GyOOOOOOOOOOOOyG',
  '.GEEEEEEEEEEEEG.',
  '..EqPPPPPPPPpE..',
  '..EqPPPPPPPPpE..',
  '..EqPyG.yG.GpE..',
  '..EqPyGGyGGGpE..',
  '..EqPyGGGGGOpE..',
  '..EqPOOOOOOOpE..',
  '..EqPPyGGGOPpE..',
  '..EqPPyGGGOPpE..',
  '..EqPPyGGGOPpE..',
  '..EqPPyGGGOPpE..',
  '..EqPyGGGGGOpE..',
  '..EqPOOOOOOOpE..',
  '..EqPPPPPPPPpE..',
  '..EGGGGGGGGGGE..',
  '..EqPPPPPPPPpE..',
  '..EqPPPEEPPPpE..',
  '..EqPPE..EPPpE..',
  '..EqPE....EPpE..',
  '..EqE......EpE..',
  '..EE........EE..',
];

export const bsWallBanner: PixelSprite = {
  id: 'bs-wall-banner',
  name: 'wall-banner',
  tags: ['scene', 'bs'],
  blurb: 'The house banner hung from a nail: orchid, a gold rook, a swallowtail that flutters.',
  rows: wallBannerRows,
  frames: [
    wallBannerRows,
    bsMoved(wallBannerRows, {
      21: '..EqPPPE.EPPpE..',
      22: '..EqPPE...EPpE..',
      23: '...EqE.....EpE..',
      24: '...EE.......EE..',
    }),
    wallBannerRows,
    bsMoved(wallBannerRows, {
      21: '..EqPPE.EPPPpE..',
      22: '..EqPE...EPPpE..',
      23: '..EqE.....EpE...',
      24: '..EE.......EE...',
    }),
  ],
  frameMs: 520,
};

const torchRows = [
  '..2..',
  '.232.',
  '.343.',
  '23432',
  '34543',
  '.454.',
  'OGyGO',
  '.OgO.',
  '..O..',
  '..O..',
  'DDODD',
  '..D..',
];

export const bsTorch: PixelSprite = {
  id: 'bs-torch',
  name: 'torch',
  tags: ['scene', 'bs'],
  blurb: 'A wall torch on an iron bracket; the flame leans and flickers. Embers rise from just above it, at (x + 1..2, y - 2).',
  rows: torchRows,
  frames: [
    torchRows,
    bsMoved(torchRows, {
      0: '...2.',
      1: '..32.',
    }),
    bsMoved(torchRows, {
      0: '.....',
      1: '..2..',
      2: '.232.',
      3: '.3432',
    }),
    bsMoved(torchRows, {
      0: '.2...',
      1: '.23..',
    }),
  ],
  frameMs: 540,
};

const candleRows = [
  '..3..',
  '.343.',
  '..5..',
  '.wwx.',
  '.wwx.',
  '.wwx.',
  'OGGGO',
  '.OOO.',
];

export const bsCandle: PixelSprite = {
  id: 'bs-candle',
  name: 'candle',
  tags: ['scene', 'bs'],
  blurb: 'A candle in a brass dish, standing on its bottom row; the flame sways.',
  rows: candleRows,
  frames: [
    candleRows,
    bsMoved(candleRows, {
      0: '...3.',
      1: '..43.',
    }),
    bsMoved(candleRows, {
      0: '.....',
      1: '..3..',
      2: '.353.',
    }),
    bsMoved(candleRows, {
      0: '.3...',
      1: '.34..',
    }),
  ],
  frameMs: 440,
};

// Emblems: 16x16, one per lesson, for the keepsake roundel.

export const bsEmblemMoat: PixelSprite = {
  id: 'bs-emblem-moat',
  name: 'emblem-moat',
  tags: ['scene', 'bs'],
  blurb: 'Lesson 1 emblem, 16x16 like the catalogue: a gold keep standing in its moat. Sits in the keepsake roundel (bsKeepsake, bs1-finish).',
  rows: [
    '................',
    '.OOOO.OOOO.OOOO.',
    '.OyGO.OyGO.OGgO.',
    '.OyGOOOyGOOOGgO.',
    '.OyyGGGGGGGGGgO.',
    '.OOOOOOOOOOOOOO.',
    '...OyGGGGGGgO...',
    '...OyGGKKGGgO...',
    '...OyGGKKGGgO...',
    '...OyGGGGGGgO...',
    '...OyGGOOGGgO...',
    '..OOyGOKKOGgOO..',
    '.bBBOOOKKOOOBBb.',
    'bBwBBBBBBBBBwBBb',
    'bbBBBwBBBBwBBBbb',
    '.bbbbbbbbbbbbbb.',
  ],
};

// Small bits.

export const bsEmber: PixelSprite = {
  id: 'bs-ember',
  name: 'ember',
  tags: ['scene', 'bs'],
  blurb: 'A spark off a flame, for a rise layer.',
  rows: [
    '4',
    '2',
  ],
};

export const bsStar: PixelSprite = {
  id: 'bs-star',
  name: 'star',
  tags: ['scene', 'bs'],
  blurb: 'One star, for a twinkle layer.',
  rows: [
    'w',
  ],
};

// Night pieces: every colour at or under luminance 0.15, for backdrops.

export const bsNightPennant: PixelSprite = {
  id: 'bs-night-pennant',
  name: 'night-pennant',
  tags: ['scene', 'bs'],
  blurb: 'The house pennant on its pole, in night colours. The foot of the pole is the bottom-left pixel.',
  rows: [
    'D...',
    'Dpp.',
    'DppE',
    'DE..',
    'D...',
  ],
  frames: [
    [
      'D...',
      'Dpp.',
      'DppE',
      'DE..',
      'D...',
    ],
    [
      'D...',
      'Dp..',
      'DppE',
      'DpE.',
      'D...',
    ],
    [
      'D...',
      'Dpp.',
      'DppE',
      'DE..',
      'D...',
    ],
    [
      'D...',
      'DppE',
      'Dpp.',
      'DE..',
      'D...',
    ],
  ],
  frameMs: 600,
};

export const bsNightPennantRival: PixelSprite = {
  id: 'bs-night-pennant-rival',
  name: 'night-pennant-rival',
  tags: ['scene', 'bs'],
  blurb: "A rival's pennant on its pole, in night colours.",
  rows: [
    'D...',
    'Drr.',
    'Drr1',
    'D1..',
    'D...',
  ],
  frames: [
    [
      'D...',
      'Drr.',
      'Drr1',
      'D1..',
      'D...',
    ],
    [
      'D...',
      'Dr..',
      'Drr1',
      'Dr1.',
      'D...',
    ],
    [
      'D...',
      'Drr.',
      'Drr1',
      'D1..',
      'D...',
    ],
    [
      'D...',
      'Drr1',
      'Drr.',
      'D1..',
      'D...',
    ],
  ],
  frameMs: 640,
};

export const bsNightFire: PixelSprite = {
  id: 'bs-night-fire',
  name: 'night-fire',
  tags: ['scene', 'bs'],
  blurb: 'A far campfire; its crossed logs are the bottom row. Embers rise from (x + 1..2, y - 3).',
  rows: [
    '..1..',
    '.1r1.',
    '.rOr.',
    '1rOr1',
    'DkDkD',
  ],
  frames: [
    [
      '..1..',
      '.1r1.',
      '.rOr.',
      '1rOr1',
      'DkDkD',
    ],
    [
      '.1...',
      '..r1.',
      '.rOr.',
      '1rOr1',
      'DkDkD',
    ],
    [
      '.....',
      '..1..',
      '.1Or.',
      '1rOr1',
      'DkDkD',
    ],
    [
      '...1.',
      '.1r..',
      '.rOr.',
      '1rOr1',
      'DkDkD',
    ],
  ],
  frameMs: 420,
};

export const bsNightRipple: PixelSprite = {
  id: 'bs-night-ripple',
  name: 'night-ripple',
  tags: ['scene', 'bs'],
  blurb: 'Ripples sliding along dark water.',
  rows: [
    'bb..t...bbb.',
    '....bbt.....',
  ],
  frames: [
    [
      'bb..t...bbb.',
      '....bbt.....',
    ],
    [
      '.bb..t...bbb',
      '.....bbt....',
    ],
    [
      '..bb..t...bb',
      'b.....bbt...',
    ],
    [
      'b..bb..t...b',
      '.b.....bbt..',
    ],
  ],
  frameMs: 520,
};

export const bsNightTorch: PixelSprite = {
  id: 'bs-night-torch',
  name: 'night-torch',
  tags: ['scene', 'bs'],
  blurb: 'A far wall torch: one warm pixel that gutters over its bracket.',
  rows: [
    'O',
    '1',
    'D',
  ],
  frames: [
    [
      'O',
      '1',
      'D',
    ],
    [
      'r',
      '1',
      'D',
    ],
    [
      'O',
      'r',
      'D',
    ],
    [
      '1',
      'O',
      'D',
    ],
  ],
  frameMs: 460,
};

export const bsNightEmber: PixelSprite = {
  id: 'bs-night-ember',
  name: 'night-ember',
  tags: ['scene', 'bs'],
  blurb: 'A spark off a far fire, for a rise layer.',
  rows: [
    'O',
    '1',
  ],
};

export const bsNightStar: PixelSprite = {
  id: 'bs-night-star',
  name: 'night-star',
  tags: ['scene', 'bs'],
  blurb: 'A dim star, for a twinkle layer.',
  rows: [
    'D',
  ],
};
