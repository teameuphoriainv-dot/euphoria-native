/** Personal Finance lesson 1: its opener, the pathway backdrop and its keepsake, as one set loaded on demand. */
import { pfBackdrop } from './pf-backdrop';
import { pf1Finish } from './pf1-finish';
import { pf1Opener } from './pf1-opener';
import type { LessonArtSet } from './types';

export const art: LessonArtSet = { opener: pf1Opener, backdrop: pfBackdrop, finish: pf1Finish };
