/**
 * The native lessons and the gate that decides whether each one applies.
 *
 * HOW A NATIVE LESSON REACHES THE APP. curriculum/index.ts (the WRAPPED loader, the one every screen
 * reads) calls resolveNativeLessons with the RAW lessons of a course. For each native lesson of that
 * course this loads its data module, fingerprints the raw source lesson, and keeps the native lesson
 * only when the fingerprint is the one it was written against. withMobileDecks then hands the native
 * steps and challenge to the runner instead of the derived decks.
 *
 * APP ONLY. courseIndex.ts (the raw loader the website parity checks read) is untouched, so the web
 * keeps its own lesson.
 *
 * NOTHING HERE MAY BREAK A COURSE LOAD. A native lesson is a better version of a lesson that already
 * exists, so every failure (a data module that throws, a stale fingerprint, a missing source lesson,
 * an xp mismatch) drops that native lesson and the learner gets the synced lesson. That is the same
 * degrade-to-plain-but-correct rule overrides.ts follows. It is never silent at build time:
 * scripts/native-lesson-pin.mjs fails on every one of those states.
 *
 * Relative imports so scripts/native-lesson-pin.mjs loads this under plain node.
 */
import type { PathwayLesson } from '../curriculum/types';
import { lessonFingerprint } from './fingerprint';
import type { NativeLesson } from './types';

/*
 * One entry per native lesson, keyed `course:num`. Lazy, so a course with no native lesson never
 * loads one, and investing-fundamentals (the course Home loads on a cold start) pays for one small
 * data module only when its lessons are first read.
 */
const NATIVE_LESSON_LOADERS: Record<string, () => Promise<{ lesson: NativeLesson }>> = {
  'investing-fundamentals:1': () => import('./if1'),
};

/** Every native lesson key, for the pins that exempt or check native lessons. */
export function nativeLessonKeys(): string[] {
  return Object.keys(NATIVE_LESSON_LOADERS);
}

/** True when this course has at least one native lesson entry (stale or not). */
export function hasNativeLessons(courseId: string): boolean {
  const prefix = `${courseId}:`;
  return nativeLessonKeys().some((k) => k.startsWith(prefix));
}

// `__DEV__` is defined by Metro and undefined under the node pins, so it is read through typeof.
declare const __DEV__: boolean | undefined;
const isDev = () => typeof __DEV__ !== 'undefined' && __DEV__ === true;

/**
 * Loads one native lesson's data module, or null when it fails.
 *
 * A THROW WHILE A MODULE EVALUATES NEVER REJECTS THE IMPORT ON NATIVE (2026-10-11 audit, recorded at
 * loadLessonArt in src/lib/pixel/scenes/index.ts): Metro reports it through ErrorUtils as FATAL,
 * which ends a release build, and resolves the import with nothing in it. So for the length of the
 * import a fatal report is caught here and the lesson falls back to the synced one.
 *
 * THE GUARD HAS TO SURVIVE NESTING, which loadLessonArt's does not need to on its own. lesson.tsx
 * runs `Promise.all([loadCourseLessons(...), loadLessonArt(...)])`, so on a cold deep link both
 * guards are installed at once. loadLessonArt restores whatever handler it found, unconditionally. If
 * this guard simply swapped back the same way, the order "this starts, art starts, this ends, art
 * ends" would leave this guard installed for the life of the process, swallowing every fatal error
 * the app ever reports. So: this guard forwards to the real handler once its import has settled, and
 * it only restores the real handler when it is still the one installed. Every interleaving of the
 * two ends with the original handler in charge (walked through all four orders on 2026-10-13).
 */
export async function loadNativeLesson(key: string): Promise<NativeLesson | null> {
  const load = NATIVE_LESSON_LOADERS[key];
  if (!load) return null;
  const errorUtils = typeof ErrorUtils === 'undefined' ? null : ErrorUtils;
  const original = errorUtils ? errorUtils.getGlobalHandler() : null;
  let failure: unknown = null;
  let settled = false;
  const guard = (error: unknown, isFatal?: boolean) => {
    if (!settled) {
      failure = error;
      return;
    }
    original?.(error, isFatal);
  };
  if (errorUtils && original) errorUtils.setGlobalHandler(guard);
  let lesson: NativeLesson | undefined;
  try {
    ({ lesson } = await load());
  } catch (error) {
    failure = error;
  } finally {
    settled = true;
    if (errorUtils && original && errorUtils.getGlobalHandler() === guard) errorUtils.setGlobalHandler(original);
  }
  if (failure !== null || !lesson) {
    if (isDev()) console.warn(`[native lesson] ${key} did not load; the synced lesson is used`, failure);
    return null;
  }
  return lesson;
}

export type NativeLessonState = 'active' | 'stale' | 'missing';
export interface NativeLessonStatus {
  state: NativeLessonState;
  /** The fingerprint the native lesson was written against ('' when its module did not load). */
  wanted: string;
  /** The raw source lesson's fingerprint today, null when there is no such lesson. */
  actual: string | null;
  reason: string;
}

/** The gate itself, on an already loaded native lesson. Pure, so the pin can feed it a corrupted copy. */
export function nativeLessonStatusOf(key: string, lesson: NativeLesson | null, raw: PathwayLesson[]): NativeLessonStatus {
  if (!lesson) return { state: 'missing', wanted: '', actual: null, reason: 'the data module did not load' };
  const wanted = lesson.source.fingerprint;
  const num = Number(key.slice(key.lastIndexOf(':') + 1));
  const source = raw.find((l) => l.num === num);
  if (!source) return { state: 'missing', wanted, actual: null, reason: `the course has no lesson ${String(num)}` };
  const actual = lessonFingerprint(source);
  if (lesson.key !== key || lesson.num !== num) {
    return { state: 'stale', wanted, actual, reason: `the data module says ${lesson.key} (num ${String(lesson.num)})` };
  }
  if (actual !== wanted) return { state: 'stale', wanted, actual, reason: 'the synced source lesson changed' };
  if (lesson.xp !== source.xp) {
    return { state: 'stale', wanted, actual, reason: `xp ${String(lesson.xp)} differs from the source's ${String(source.xp)}` };
  }
  return { state: 'active', wanted, actual, reason: 'fingerprint matches' };
}

/**
 * Why a native lesson does or does not apply. 'missing' covers both a source lesson that no longer
 * exists and a data module that failed to load; 'stale' a source that changed under the rewrite.
 */
export async function nativeLessonStatus(key: string, raw: PathwayLesson[]): Promise<NativeLessonStatus> {
  return nativeLessonStatusOf(key, await loadNativeLesson(key), raw);
}

/**
 * The native lessons that apply to this course, keyed by lesson number. Never rejects: any failure
 * leaves that lesson out, and an empty map means "use the synced lessons", which is also the answer
 * for the 11 courses with no native lesson (they return without importing anything).
 */
export async function resolveNativeLessons(courseId: string, raw: PathwayLesson[]): Promise<Map<number, NativeLesson>> {
  const out = new Map<number, NativeLesson>();
  if (!hasNativeLessons(courseId)) return out;
  const prefix = `${courseId}:`;
  for (const key of nativeLessonKeys().filter((k) => k.startsWith(prefix))) {
    try {
      const lesson = await loadNativeLesson(key);
      const status = nativeLessonStatusOf(key, lesson, raw);
      if (lesson && status.state === 'active') {
        out.set(lesson.num, lesson);
        continue;
      }
      if (isDev()) {
        console.warn(
          `[native lesson] ${key} is ${status.state} (${status.reason}; wanted ${status.wanted}, actual ${String(status.actual)}). ` +
            'The synced lesson is used. Re-review the rewrite, then run scripts/native-lesson-pin.mjs --print-fingerprint.',
        );
      }
    } catch (error) {
      if (isDev()) console.warn(`[native lesson] ${key} could not be resolved; the synced lesson is used`, error);
    }
  }
  return out;
}

export { lessonFingerprint } from './fingerprint';
export type { NativeLesson, NativeStep } from './types';
