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
