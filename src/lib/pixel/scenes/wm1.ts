/** Wealth Management lesson 1: its opener, the pathway backdrop and its keepsake, as one set loaded on demand. */
import { wmBackdrop } from './wm-backdrop';
import { wm1Finish } from './wm1-finish';
import { wm1Opener } from './wm1-opener';
import type { LessonArtSet } from './types';

export const art: LessonArtSet = { opener: wm1Opener, backdrop: wmBackdrop, finish: wm1Finish };
