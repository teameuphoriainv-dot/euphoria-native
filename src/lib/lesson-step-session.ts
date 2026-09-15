/** In-memory state for one mounted lesson attempt. Nothing is persisted across lesson exits. */
export type LessonStepSession = {
  snapshots: Map<number, Map<string, unknown>>;
  completed: Set<number>;
};

export function createLessonStepSession(): LessonStepSession {
  return { snapshots: new Map(), completed: new Set() };
}

export function readLessonStepSnapshot<T>(
  session: LessonStepSession,
  stepIndex: number,
  stateKey: string,
  initialize: () => T,
): T {
  let step = session.snapshots.get(stepIndex);
  if (!step) {
    step = new Map();
    session.snapshots.set(stepIndex, step);
  }
  if (step.has(stateKey)) return step.get(stateKey) as T;
  const initial = initialize();
  step.set(stateKey, initial);
  return initial;
}

export function writeLessonStepSnapshot<T>(
  session: LessonStepSession,
  stepIndex: number,
  stateKey: string,
  value: T,
): void {
  let step = session.snapshots.get(stepIndex);
  if (!step) {
    step = new Map();
    session.snapshots.set(stepIndex, step);
  }
  step.set(stateKey, value);
}

/** Completion is monotonic inside one attempt: a remount's initial false cannot re-lock a step. */
export function markLessonStepCompletion(
  session: LessonStepSession,
  stepIndex: number,
  solved: boolean,
): boolean {
  if (solved) session.completed.add(stepIndex);
  return session.completed.has(stepIndex);
}

export function isLessonStepComplete(session: LessonStepSession, stepIndex: number): boolean {
  return session.completed.has(stepIndex);
}

// THE RESUME POINTER
//
// Everything above this line is SESSION state: it dies with the mounted lesson, which is correct
// for a widget's half-finished drag but wrong for "where was I". Backgrounding the app does not
// unmount the lesson screen, so Previous/forward kept working and the gap stayed invisible; a
// force quit or an OS eviction did not, and the learner came back to the warmup screen of a
// lesson they were nine steps into. Home called that button "Continue" the whole time.
//
// So the POSITION, and only the position, is persisted. Deliberately not the child snapshots: a
// restored drag-sort that looks finished but is not gated open is a lie the runner cannot detect,
// and this repo's rule is that wrong-but-confident must degrade to plain-but-correct. Coming back
// to the top of the screen you were on, with that screen's interaction to redo, is plain and
// correct.
//
// ONE pointer, not a map keyed by lesson. A map would grow with every lesson ever abandoned and
// would need a cap and an eviction rule to earn its keep, and the behaviour it buys is narrow:
// being mid-way through two different lessons at once. Last lesson open wins, and re-opening the
// other one starts it over, which is what the key check in resumeScreenFor does.

/** Where the learner left off, as persisted by the store. */
export type LessonResumePoint = {
  /** `lessonKey(courseId, num)`. A pointer only ever restores into the lesson that wrote it. */
  key: string;
  /** Runtime screen index, POST expansion, the same number `lesson.tsx` holds in `idx`. */
  screen: number;
  /** Fingerprint of the runtime step shape when the pointer was written. */
  shape: string;
  /** Wall clock of the write. Nothing expires on it yet; recorded so it can. */
  savedAt: number;
};

/**
 * A fingerprint of one lesson's runtime step sequence.
 *
 * WHY A SHAPE AND NOT JUST A COUNT. `src/lib/curriculum/**` is regenerated wholesale by
 * scripts/sync-curriculum.sh, and loadCourseLessons filters retired step types and drops
 * duplicate match steps at load, so a lesson's LENGTH is not a property of the corpus file, it is
 * a property of the corpus file plus this build's filter set. Retiring one more step type
 * renumbers every screen after it across 300 lessons at once. A saved "screen 7" recorded before
 * that change points at different content afterwards, and nothing would report it.
 *
 * Hashing the type sequence catches a length change AND a reorder, and costs one pass over at
 * most 17 short strings.
 *
 * FNV-1a, 32 bit, written out rather than imported so this module stays dependency free and the
 * regression scripts can load it under `node --import ./scripts/ts-resolve-hooks.mjs`. Not
 * cryptographic and does not need to be: the job is to notice that the curriculum moved, not to
 * resist anyone.
 */
export function lessonShapeSignature(stepTypes: readonly string[]): string {
  const input = `${String(stepTypes.length)}|${stepTypes.join('|')}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    // The classic 16777619 multiply, decomposed into shifts so it stays exact in 32 bits.
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

/**
 * Clamp any number to a usable lesson screen index.
 *
 * The sibling of `clampStep` in shared/motion/step-transition.ts, and it exists for the same
 * reason that one does: Apple rejected iOS 1.0 under guideline 2.1(a) over an onboarding index
 * past the end of its array, which rendered a blank body under a dead Continue button. The lesson
 * runner can reach the identical state, because `steps[idx - 1]` is `undefined` for any idx above
 * the step count and every render branch then declines to draw anything.
 *
 * Garbage resolves to 0, the warmup screen, rather than to the last screen. Same judgement as
 * clampStep: flinging someone onto the completion celebration of a lesson they never did is worse
 * than restarting it.
 */
export function clampLessonScreen(n: number, screens: number): number {
  if (!Number.isFinite(n)) return 0;
  const floored = Math.trunc(n);
  if (floored < 0) return 0;
  // screens + 2 is the streak screen, the last index the runner can address.
  const last = Math.max(0, screens) + 2;
  return floored > last ? last : floored;
}

/**
 * The screen a freshly opened lesson should start on. 0 means "start at the warmup", which is
 * both the no-pointer answer and the answer for every pointer we decline to trust.
 *
 * Declines, in order, and each one is a real wrong outcome this would otherwise produce:
 *   - no pointer at all: first time in, or completion cleared it.
 *   - a different lesson: the single pointer belongs to whichever lesson was open last.
 *   - a different shape: a curriculum re-sync moved the steps under the saved number.
 *   - a terminal screen: `screens + 1` is the completion celebration and `screens + 2` the streak
 *     screen, and the lesson is not credited until Continue is pressed from the streak screen.
 *     Restoring onto either would hand out a lesson's XP, coins and streak day for reopening the
 *     app, so the pointer is never written there and is refused here as well.
 */
export function resumeScreenFor(
  point: LessonResumePoint | null | undefined,
  lesson: { key: string; screens: number; shape: string },
): number {
  if (!point || point.key !== lesson.key || point.shape !== lesson.shape) return 0;
  const screen = clampLessonScreen(point.screen, lesson.screens);
  return screen >= 1 && screen <= lesson.screens ? screen : 0;
}

/**
 * Should this screen index be remembered?
 *
 * Only the content screens. 0 is the warmup, which is where a lesson starts anyway, so writing it
 * buys nothing and costs a storage round trip on every lesson open. Anything above the step count
 * is terminal, per the note on resumeScreenFor.
 */
export function isResumableScreen(screen: number, screens: number): boolean {
  return Number.isInteger(screen) && screen >= 1 && screen <= screens;
}
