/** Behavioral Finance lesson 1: its opener, the pathway backdrop and its keepsake, as one set loaded on demand. */
import { bfBackdrop } from './bf-backdrop';
import { bf1Finish } from './bf1-finish';
import { bf1Opener } from './bf1-opener';
import type { LessonArtSet } from './types';

export const art: LessonArtSet = { opener: bf1Opener, backdrop: bfBackdrop, finish: bf1Finish };
