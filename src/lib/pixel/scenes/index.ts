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
  'quantitative-analysis:2': () => import('./qa2'),
  'quantitative-analysis:3': () => import('./qa3'),
  'quantitative-analysis:4': () => import('./qa4'),
  'quantitative-analysis:5': () => import('./qa5'),
  'quantitative-analysis:6': () => import('./qa6'),
  'quantitative-analysis:7': () => import('./qa7'),
  'quantitative-analysis:8': () => import('./qa8'),
  'quantitative-analysis:9': () => import('./qa9'),
  'investing-fundamentals:1': () => import('./if1'),
  'investing-fundamentals:2': () => import('./if2'),
  'investing-fundamentals:3': () => import('./if3'),
  'investing-fundamentals:4': () => import('./if4'),
  'investing-fundamentals:5': () => import('./if5'),
  'investing-fundamentals:6': () => import('./if6'),
  'investing-fundamentals:7': () => import('./if7'),
  'investing-fundamentals:8': () => import('./if8'),
  'investing-fundamentals:9': () => import('./if9'),
  'investing-fundamentals:10': () => import('./if10'),
  'investing-fundamentals:11': () => import('./if11'),
  'investing-fundamentals:12': () => import('./if12'),
  'investing-fundamentals:13': () => import('./if13'),
  'investing-fundamentals:14': () => import('./if14'),
  'investing-fundamentals:15': () => import('./if15'),
  'investing-fundamentals:16': () => import('./if16'),
  'investing-fundamentals:17': () => import('./if17'),
  'personal-finance:1': () => import('./pf1'),
  'personal-finance:2': () => import('./pf2'),
  'personal-finance:3': () => import('./pf3'),
  'personal-finance:4': () => import('./pf4'),
  'personal-finance:5': () => import('./pf5'),
  'personal-finance:6': () => import('./pf6'),
  'personal-finance:7': () => import('./pf7'),
  'personal-finance:8': () => import('./pf8'),
  'personal-finance:9': () => import('./pf9'),
  'global-economics:1': () => import('./ge1'),
  'global-economics:2': () => import('./ge2'),
  'global-economics:3': () => import('./ge3'),
  'global-economics:4': () => import('./ge4'),
  'global-economics:5': () => import('./ge5'),
  'global-economics:6': () => import('./ge6'),
  'global-economics:7': () => import('./ge7'),
  'global-economics:8': () => import('./ge8'),
  'global-economics:9': () => import('./ge9'),
  'global-economics:10': () => import('./ge10'),
  'global-economics:11': () => import('./ge11'),
  'global-economics:12': () => import('./ge12'),
  'global-economics:13': () => import('./ge13'),
  'global-economics:14': () => import('./ge14'),
  'global-economics:15': () => import('./ge15'),
  'global-economics:16': () => import('./ge16'),
  'global-economics:17': () => import('./ge17'),
  'corporate-finance:1': () => import('./cf1'),
  'corporate-finance:2': () => import('./cf2'),
  'corporate-finance:3': () => import('./cf3'),
  'corporate-finance:4': () => import('./cf4'),
  'corporate-finance:5': () => import('./cf5'),
  'corporate-finance:6': () => import('./cf6'),
  'corporate-finance:7': () => import('./cf7'),
  'corporate-finance:8': () => import('./cf8'),
  'corporate-finance:9': () => import('./cf9'),
  'corporate-finance:10': () => import('./cf10'),
  'corporate-finance:11': () => import('./cf11'),
  'corporate-finance:12': () => import('./cf12'),
  'corporate-finance:13': () => import('./cf13'),
  'corporate-finance:14': () => import('./cf14'),
  'corporate-finance:15': () => import('./cf15'),
  'corporate-finance:16': () => import('./cf16'),
  'corporate-finance:17': () => import('./cf17'),
  'business-strategy:1': () => import('./bs1'),
  'business-strategy:2': () => import('./bs2'),
  'business-strategy:3': () => import('./bs3'),
  'business-strategy:4': () => import('./bs4'),
  'business-strategy:5': () => import('./bs5'),
  'business-strategy:6': () => import('./bs6'),
  'business-strategy:7': () => import('./bs7'),
  'business-strategy:8': () => import('./bs8'),
  'business-strategy:9': () => import('./bs9'),
  'business-strategy:10': () => import('./bs10'),
  'business-strategy:11': () => import('./bs11'),
  'business-strategy:12': () => import('./bs12'),
  'business-strategy:13': () => import('./bs13'),
  'business-strategy:14': () => import('./bs14'),
  'business-strategy:15': () => import('./bs15'),
  'business-strategy:16': () => import('./bs16'),
  'business-strategy:17': () => import('./bs17'),
  'financial-analytics:1': () => import('./fa1'),
  'financial-analytics:2': () => import('./fa2'),
  'financial-analytics:3': () => import('./fa3'),
  'financial-analytics:4': () => import('./fa4'),
  'financial-analytics:5': () => import('./fa5'),
  'financial-analytics:6': () => import('./fa6'),
  'financial-analytics:7': () => import('./fa7'),
  'financial-analytics:8': () => import('./fa8'),
  'financial-analytics:9': () => import('./fa9'),
  'behavioral-finance:1': () => import('./bf1'),
  'behavioral-finance:2': () => import('./bf2'),
  'behavioral-finance:3': () => import('./bf3'),
  'behavioral-finance:4': () => import('./bf4'),
  'behavioral-finance:5': () => import('./bf5'),
  'behavioral-finance:6': () => import('./bf6'),
  'behavioral-finance:7': () => import('./bf7'),
  'behavioral-finance:8': () => import('./bf8'),
  'behavioral-finance:9': () => import('./bf9'),
  'behavioral-finance:10': () => import('./bf10'),
  'behavioral-finance:11': () => import('./bf11'),
  'behavioral-finance:12': () => import('./bf12'),
  'behavioral-finance:13': () => import('./bf13'),
  'behavioral-finance:14': () => import('./bf14'),
  'behavioral-finance:15': () => import('./bf15'),
  'behavioral-finance:16': () => import('./bf16'),
  'behavioral-finance:17': () => import('./bf17'),
  'applied-accounting:1': () => import('./aa1'),
  'applied-accounting:2': () => import('./aa2'),
  'applied-accounting:3': () => import('./aa3'),
  'applied-accounting:4': () => import('./aa4'),
  'applied-accounting:5': () => import('./aa5'),
  'applied-accounting:6': () => import('./aa6'),
  'applied-accounting:7': () => import('./aa7'),
  'applied-accounting:8': () => import('./aa8'),
  'applied-accounting:9': () => import('./aa9'),
  'risk-management:1': () => import('./rm1'),
  'risk-management:2': () => import('./rm2'),
  'risk-management:3': () => import('./rm3'),
  'risk-management:4': () => import('./rm4'),
  'risk-management:5': () => import('./rm5'),
  'risk-management:6': () => import('./rm6'),
  'risk-management:7': () => import('./rm7'),
  'risk-management:8': () => import('./rm8'),
  'risk-management:9': () => import('./rm9'),
  'alternative-investments:1': () => import('./ai1'),
  'alternative-investments:2': () => import('./ai2'),
  'alternative-investments:3': () => import('./ai3'),
  'alternative-investments:4': () => import('./ai4'),
  'alternative-investments:5': () => import('./ai5'),
  'alternative-investments:6': () => import('./ai6'),
  'alternative-investments:7': () => import('./ai7'),
  'alternative-investments:8': () => import('./ai8'),
  'alternative-investments:9': () => import('./ai9'),
  'alternative-investments:10': () => import('./ai10'),
  'alternative-investments:11': () => import('./ai11'),
  'alternative-investments:12': () => import('./ai12'),
  'alternative-investments:13': () => import('./ai13'),
  'alternative-investments:14': () => import('./ai14'),
  'alternative-investments:15': () => import('./ai15'),
  'alternative-investments:16': () => import('./ai16'),
  'alternative-investments:17': () => import('./ai17'),
  'wealth-management:1': () => import('./wm1'),
  'wealth-management:2': () => import('./wm2'),
  'wealth-management:3': () => import('./wm3'),
  'wealth-management:4': () => import('./wm4'),
  'wealth-management:5': () => import('./wm5'),
  'wealth-management:6': () => import('./wm6'),
  'wealth-management:7': () => import('./wm7'),
  'wealth-management:8': () => import('./wm8'),
  'wealth-management:9': () => import('./wm9'),
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
