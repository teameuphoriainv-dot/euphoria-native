/** Quantitative Analysis lesson 1: its opener, the pathway backdrop and its keepsake, as one set loaded on demand. */
import { qaBackdrop } from './qa-backdrop';
import { qa1Finish } from './qa1-finish';
import { qa1Opener } from './qa1-opener';
import type { LessonArtSet } from './types';

export const art: LessonArtSet = { opener: qa1Opener, backdrop: qaBackdrop, finish: qa1Finish };
