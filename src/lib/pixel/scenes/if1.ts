/** Investing Fundamentals lesson 1: its opener, the pathway backdrop and its keepsake, as one set loaded on demand. */
import { ifBackdrop } from './if-backdrop';
import { if1Finish } from './if1-finish';
import { if1Opener } from './if1-opener';
import type { LessonArtSet } from './types';

export const art: LessonArtSet = { opener: if1Opener, backdrop: ifBackdrop, finish: if1Finish };
