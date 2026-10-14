/**
 * Story art registry: which art module a native lesson's story, toggle and term cards draw from,
 * loaded lazily so a lesson's pictures cost nothing until that lesson opens.
 *
 * Keys are the `artKey` a card spec names ('if1'). Each entry is a dynamic import, the same shape as
 * scenes/index.ts LESSON_ART_LOADERS, so Metro splits the art out of the main bundle.
 */
import type { StoryArt } from './types';

export const STORY_ART_LOADERS: Record<string, () => Promise<{ story: StoryArt }>> = {
  if1: () => import('./if1-story'),
};

const loaded = new Map<string, StoryArt>();

/** The art if it has loaded, else null. Synchronous, for render. */
export function storyArtFor(key: string): StoryArt | null {
  return loaded.get(key) ?? null;
}

/**
 * Loads (once) and returns the art; null for an unknown key or art that fails.
 *
 * A THROW WHILE AN ART MODULE EVALUATES NEVER REJECTS THE IMPORT ON NATIVE. The guard is copied from
 * loadLessonArt (scenes/index.ts, 2026-10-11 audit): Metro catches the throw, reports it through
 * ErrorUtils as FATAL, which ends a release build, and resolves the import with no export. The kit
 * throws on purpose when authoring goes wrong (ifCompose on a palette clash, ifDigits on a glyph it
 * lacks). Art is decoration and every card has a no-art fallback, so for the length of the import a
 * fatal report is caught here and the card opens without pictures instead of closing the app.
 *
 * A failure is not cached (CONSTITUTION 6.3): the next card to ask tries again.
 */
export async function loadStoryArt(key: string): Promise<StoryArt | null> {
  const hit = loaded.get(key);
  if (hit) return hit;
  const load = STORY_ART_LOADERS[key];
  if (!load) return null;
  let failure: unknown = null;
  const fatal = typeof ErrorUtils === 'undefined' ? null : ErrorUtils.getGlobalHandler();
  if (fatal) ErrorUtils.setGlobalHandler((error) => { failure = error; });
  let story: StoryArt | undefined;
  try {
    ({ story } = await load());
  } catch (error) {
    failure = error;
  } finally {
    if (fatal) ErrorUtils.setGlobalHandler(fatal);
  }
  if (failure !== null || !story) {
    // `typeof` first: __DEV__ is undefined under the node pins, and a bare read would throw there.
    if (typeof __DEV__ !== 'undefined' && __DEV__) console.warn(`[story art] ${key} did not load; the cards open without it`, failure);
    return null;
  }
  loaded.set(key, story);
  return story;
}

export type { StoryArt } from './types';
