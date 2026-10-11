/** Risk Management lesson 1: its opener, the pathway backdrop and its keepsake, as one set loaded on demand. */
import { rmBackdrop } from './rm-backdrop';
import { rm1Finish } from './rm1-finish';
import { rm1Opener } from './rm1-opener';
import type { LessonArtSet } from './types';

export const art: LessonArtSet = { opener: rm1Opener, backdrop: rmBackdrop, finish: rm1Finish };
