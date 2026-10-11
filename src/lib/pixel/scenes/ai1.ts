/** Alternative Investments lesson 1: its opener, the pathway backdrop and its keepsake, as one set loaded on demand. */
import { aiBackdrop } from './ai-backdrop';
import { ai1Finish } from './ai1-finish';
import { ai1Opener } from './ai1-opener';
import type { LessonArtSet } from './types';

export const art: LessonArtSet = { opener: ai1Opener, backdrop: aiBackdrop, finish: ai1Finish };
