/** Business Strategy lesson 1: its opener, the pathway backdrop and its keepsake, as one set loaded on demand. */
import { bsBackdrop } from './bs-backdrop';
import { bs1Finish } from './bs1-finish';
import { bs1Opener } from './bs1-opener';
import type { LessonArtSet } from './types';

export const art: LessonArtSet = { opener: bs1Opener, backdrop: bsBackdrop, finish: bs1Finish };
