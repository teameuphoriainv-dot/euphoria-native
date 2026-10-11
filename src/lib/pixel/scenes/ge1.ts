/** Global Economics lesson 1: its opener, the pathway backdrop and its keepsake, as one set loaded on demand. */
import { geBackdrop } from './ge-backdrop';
import { ge1Finish } from './ge1-finish';
import { ge1Opener } from './ge1-opener';
import type { LessonArtSet } from './types';

export const art: LessonArtSet = { opener: ge1Opener, backdrop: geBackdrop, finish: ge1Finish };
