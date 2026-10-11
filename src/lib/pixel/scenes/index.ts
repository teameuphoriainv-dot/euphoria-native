/**
 * Which lesson carries which art.
 *
 * KEYED `course:lessonNumber`, the same position key parts/placements.ts uses, and for the same
 * reason: the curriculum files are synced from the web repo, so nothing about a lesson's art may
 * live inside them. A lesson with no entry keeps the shared defaults (the flame opener, the plain
 * starfield, the finish screen as it was), so adding art is always opt-in per lesson.
 *
 * LOADED ON DEMAND (owner, 2026-10-10: art for every lesson of every pathway). Each lesson's set
 * lives in its own module, `<prefix><N>.ts` exporting `art`, imported the first time that lesson
 * opens, the way the course decks are (curriculum/courseIndex.ts). The kits compose their bases
 * when a module loads, so importing all 300 lessons here would cost every cold start for pictures
 * nobody opened. lessonArtFor reads only what has loaded; lesson.tsx awaits loadLessonArt beside
 * the lesson itself, so the art is in place before the first screen draws.
 *
 * One literal import per lesson because Metro only bundles specifiers it can read statically.
 * scripts/lesson-scenes-pin.mjs fails if a `<prefix><N>.ts` file exists without an entry here.
 */
import type { LessonArtSet } from './types';

export const LESSON_ART_LOADERS: Readonly<Record<string, () => Promise<{ art: LessonArtSet }>>> = {
  'quantitative-analysis:1': () => import('./qa1'),
  'investing-fundamentals:1': () => import('./if1'),
  'personal-finance:1': () => import('./pf1'),
  'global-economics:1': () => import('./ge1'),
  'corporate-finance:1': () => import('./cf1'),
  'corporate-finance:2': () => import('./cf2'),
  'corporate-finance:3': () => import('./cf3'),
  'corporate-finance:4': () => import('./cf4'),
  'corporate-finance:5': () => import('./cf5'),
  'corporate-finance:6': () => import('./cf6'),
  'corporate-finance:7': () => import('./cf7'),
  'corporate-finance:8': () => import('./cf8'),
  'corporate-finance:9': () => import('./cf9'),
  'business-strategy:1': () => import('./bs1'),
  'business-strategy:2': () => import('./bs2'),
  'business-strategy:3': () => import('./bs3'),
  'business-strategy:4': () => import('./bs4'),
  'business-strategy:5': () => import('./bs5'),
  'business-strategy:6': () => import('./bs6'),
  'business-strategy:7': () => import('./bs7'),
  'business-strategy:8': () => import('./bs8'),
  'business-strategy:9': () => import('./bs9'),
  'financial-analytics:1': () => import('./fa1'),
  'behavioral-finance:1': () => import('./bf1'),
  'applied-accounting:1': () => import('./aa1'),
  'risk-management:1': () => import('./rm1'),
  'alternative-investments:1': () => import('./ai1'),
  'wealth-management:1': () => import('./wm1'),
};

const loaded = new Map<string, LessonArtSet>();
const keyOf = (courseId: string, lessonNumber: number) => `${courseId}:${String(lessonNumber)}`;

/** The lesson's art if it has loaded, else null. Synchronous, for render. */
export function lessonArtFor(courseId: string, lessonNumber: number): LessonArtSet | null {
  return loaded.get(keyOf(courseId, lessonNumber)) ?? null;
}

/** Loads (once) and returns the lesson's art; null for a lesson without any. */
export async function loadLessonArt(courseId: string, lessonNumber: number): Promise<LessonArtSet | null> {
  const key = keyOf(courseId, lessonNumber);
  const hit = loaded.get(key);
  if (hit) return hit;
  const load = LESSON_ART_LOADERS[key];
  if (!load) return null;
  const { art } = await load();
  loaded.set(key, art);
  return art;
}

export type { LessonArtSet, SceneArt, SceneLayer, SceneMotion } from './types';
