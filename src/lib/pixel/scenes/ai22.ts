/**
 * Alternative Investments lesson 22: alternative data and analytics.
 *
 * The opener turns the camera round: the collector seen from behind, rim-lit in teal, standing in
 * front of a screen that fills the gallery wall. On it a satellite looks down on a store and its
 * parking lot, every stall in rows, every car a block of colour, three of them boxed in green and
 * a readout counting them, the lesson's best-known example of data from outside a company's own
 * reports. Only small layers move: a scan line climbs the lot, the boxes blink, the satellite
 * icon floats, the readout's light blinks and the screen's light breathes on the floor. The
 * keepsake is the satellite (ai-kit-c.ts, where the advanced capstone finds it again).
 */
import type { PixelSprite } from '../types';
import { aiBackdrop } from './ai-backdrop';
import { AI_PALETTE, aiCompose, aiGallery, aiKeepsake, aiShadow } from './ai-kit';
import { aiLedgeCover, aiSatellite } from './ai-kit-c';
import type { LessonArtSet, SceneArt } from './types';

/** A wall screen: a satellite view of a store's roof and its parking lot, a car count top right. */
const screen: PixelSprite = {
  id: 'ai22-screen',
  name: 'ai22-screen',
  tags: ['scene', 'ai'],
  blurb: "A wall screen showing a satellite view: a store's roof, rows of parked cars, trees, a car count.",
  rows: [
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    'DKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKD',
    'DKnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnNNNNNNNNNNNnKD',
    'DKnnNNnnnnnnNNnnnnnnDDDDDDDDDDDDDDDDDDDDDDDDDDDDnnNNnnNKNKNKNNNKNnKD',
    'DKnNmNNnnnnNmNNnnnnnDXXXXXXXXXXXXXXXXXXXXXXXXXXDnNmNNnNKNKNKKKNKNnKD',
    'DKnNNNnnnnnNNNnnnnnnDXXxxXXXXxxXXXGGGGXXXxxXXXXDnNNNnnNKNNNKNNNKNnKD',
    'DKnnNnnnnnnnNnnnnnnnDXXxxXXXXxxXXXGGGGXXXxxXXXXDnnNnnnNKKKNKNKKKNnKD',
    'DKnnnnnnnnnnnnnnnnnnDXXXXXXXXXXXXXXXXXXXXXXXXXXDnnnnnnNKKKNKNNNKNnKD',
    'DKnnnnnnnnnnnnnnnnnnDXXXXXXXXXXXXXXXXXXXXXXXXXXDnnnnnnNNNNNNNNNNNnKD',
    'DKnnnnnnnnnnnnnnnnnnDDDDDDDDDDDDDDDDDDDDDDDDDDDDnnnnnnnnnnnnnnnnnnKD',
    'DKnnNNnnxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxnnnnnnKD',
    'DKnNmNNnDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDnnNNnnKD',
    'DKnNNNnnDxDRRDxDBBDxDDDDxDwwDxDGGDxDPPDxDDDDxDTTDxDxxDxDDDDxnNmNNnKD',
    'DKnnNnnnDxDkkDxDkkDxDDDDxDkkDxDkkDxDkkDxDDDDxDkkDxDkkDxDDDDxnNNNnnKD',
    'DKnnnnnnDxDRRDxDBBDxDDDDxDwwDxDGGDxDPPDxDDDDxDTTDxDxxDxDDDDxnnNnnnKD',
    'DKnnnnnnDxDDDDxDDDDxDDDDxDDDDxDDDDxDDDDxDDDDxDDDDxDDDDxDDDDxnnnnnnKD',
    'DKnnnnnnDxDDDDxDDDDxDDDDxDDDDxDDDDxDDDDxDDDDxDDDDxDDDDxDDDDxnnnnnnKD',
    'DKnnNNnnDxDDDDxDwwDxDRRDxDbbDxDDDDxDGGDxDNNDxDPPDxDDDDxDBBDxnnnnnnKD',
    'DKnNmNNnDxDDDDxDkkDxDkkDxDkkDxDDDDxDkkDxDkkDxDkkDxDDDDxDkkDxnnNNnnKD',
    'DKnNNNnnDxDDDDxDwwDxDRRDxDbbDxDDDDxDGGDxDNNDxDPPDxDDDDxDBBDxnNmNNnKD',
    'DKnnNnnnDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDnNNNnnKD',
    'DKnnnnnnDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDnnNnnnKD',
    'DKnnnnnnDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDnnnnnnKD',
    'DKnnnnnnDxDxxDxDPPDxDDDDxDBBDxDRRDxDDDDxDwwDxDGGDxDTTDxDrrDxnnnnnnKD',
    'DKnnNNnnDxDkkDxDkkDxDDDDxDkkDxDkkDxDDDDxDkkDxDkkDxDkkDxDkkDxnnNNnnKD',
    'DKnNmNNnDxDxxDxDPPDxDDDDxDBBDxDRRDxDDDDxDwwDxDGGDxDTTDxDrrDxnNmNNnKD',
    'DKnNNNnnDxDDDDxDDDDxDDDDxDDDDxDDDDxDDDDxDDDDxDDDDxDDDDxDDDDxnNNNnnKD',
    'DKnnNnnnxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxnnNnnnKD',
    'DKnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnKD',
    'DKnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnKD',
    'DKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKD',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
  ],
};

/** The collector from behind: hair, the gold scarf round the neck, the orchid coat, rim-lit by the screen. */
const collectorBack: PixelSprite = {
  id: 'ai22-collector-back',
  name: 'ai22-collector-back',
  tags: ['scene', 'ai'],
  blurb: "The collector seen from behind, lit round the edges by the screen in front.",
  rows: [
    '....................',
    '......mkkkkkkm......',
    '.....mkkDDkkkkm.....',
    '....mkkDDkkkkkkm....',
    '....mkDDkkkkkkkm....',
    '....mkkkkkkkkkkm....',
    '....mkkkkkkkkkkm....',
    '....mkkkkkkkkkkm....',
    '....mkkkkkkkkkkm....',
    '.....mkkkkkkkkm.....',
    '......kkkkkkkk......',
    '........UUUU........',
    '.....mGGGGGGGGm.....',
    '....mEGGGGGGGGEm....',
    '....EqPPPPpPPPpE....',
    '....EqPPPPpPPPpE....',
    '....EqPPPPpPPPpE....',
    '....EqPPPPpPPPpE....',
    '....EqPPPPpPPPpE....',
    '...EqPPPPPpPPPPpE...',
    '...EqPPPPPpPPPPpE...',
    '...EqPPPPPpPPPPpE...',
    '...EEEEEEEEEEEEEE...',
    '......DXD..DXD......',
    '......DXD..DXD......',
    '......DXD..DXD......',
    '......DXD..DXD......',
    '.....OggO..OggO.....',
  ],
};

/** The detection boxes drawn round three parked cars. */
const boxes: PixelSprite = {
  id: 'ai22-boxes',
  name: 'ai22-boxes',
  tags: [],
  rows: [
    '................................................................',
    '................................................................',
    '................................................................',
    '................................................................',
    '................................................................',
    '................................................................',
    '................................................................',
    '................................................................',
    '................................................................',
    '............NNNNNN..............................................',
    '............N....N..............................................',
    '............N....N..............................................',
    '............N....N..............................................',
    '............N....N..............................................',
    '............NNNNNN........................NNNNNN................',
    '..........................................N....N................',
    '..........................................N....N................',
    '..........................................N....N................',
    '..........................................N....N................',
    '..........................................NNNNNN................',
    '............NNNNNN..............................................',
    '............N....N..............................................',
    '............N....N..............................................',
    '............N....N..............................................',
    '............N....N..............................................',
    '............NNNNNN..............................................',
    '................................................................',
    '................................................................',
  ],
};

/** The scan line, rising up the lot from the near row of stalls and settling back. */
const scan: PixelSprite = { id: 'ai22-scan', name: 'ai22-scan', tags: [], rows: ['m'.repeat(52)] };

/** The satellite icon in the screen's corner. */
const icon: PixelSprite = { id: 'ai22-icon', name: 'ai22-icon', tags: [], rows: ['BB.y.BB', 'BBxGxBB', 'BB.G.BB'] };

/** The readout's live light. */
const live: PixelSprite = { id: 'ai22-live', name: 'ai22-live', tags: [], rows: ['R'] };

/** The screen's light lying on the floor in front of it, broken where the collector stands. */
const spill: PixelSprite = {
  id: 'ai22-spill',
  name: 'ai22-spill',
  tags: [],
  palette: AI_PALETTE,
  rows: [
    '..ddddddddddddddddddddddd..............ddddddddddddddddddddddd..',
    '....ddddddddddddddddddddd..............ddddddddddddddddddddd....',
    '........ddddddddddddddddd..............ddddddddddddddddd........',
  ],
};

const SCREEN = [6, 8] as const;
/** The inside of the screen, past its bezel. */
const VIEW = [SCREEN[0] + 2, SCREEN[1] + 2] as const;
const COLLECTOR = [30, 30] as const;

const base = aiCompose('ai22-opener-base', aiGallery.rows, [
  aiLedgeCover,
  [screen, SCREEN[0], SCREEN[1]],
  [aiShadow, COLLECTOR[0] + 3, COLLECTOR[1] + 27],
  [collectorBack, COLLECTOR[0], COLLECTOR[1]],
]);

export const ai22Opener: SceneArt = {
  id: 'ai22-opener',
  label: 'Seen from behind, a collector stands before a wall screen showing a satellite view of a store and its parking lot, cars boxed in green and counted.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: scan, x: VIEW[0] + 6, y: VIEW[1] + 20, motion: { kind: 'bob', amp: 11, periodMs: 4600 } },
    { sprite: boxes, x: VIEW[0], y: VIEW[1], motion: { kind: 'twinkle', periodMs: 1600, min: 0.15 } },
    { sprite: icon, x: VIEW[0] + 1, y: VIEW[1] + 1, motion: { kind: 'bob', amp: 1, periodMs: 2400 } },
    { sprite: live, x: VIEW[0] + 61, y: VIEW[1] + 1, motion: { kind: 'twinkle', periodMs: 1000, min: 0.1 } },
    { sprite: spill, x: 8, y: 47, motion: { kind: 'twinkle', periodMs: 3000, min: 0.45 } },
  ],
};

export const ai22Finish = aiKeepsake(
  'ai22-finish',
  'A satellite with a gold body between two blue solar panels floating in a glass display case on a marble plinth, with sparkles around it.',
  aiSatellite,
);

export const art: LessonArtSet = { opener: ai22Opener, backdrop: aiBackdrop, finish: ai22Finish };
