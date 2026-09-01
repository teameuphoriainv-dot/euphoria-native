import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';

import {
  readLessonStepSnapshot,
  writeLessonStepSnapshot,
  type LessonStepSession,
} from '@/lib/lesson-step-session';

type LessonStepSessionContextValue = { session: LessonStepSession; stepIndex: number };
const LessonStepSessionContext = createContext<LessonStepSessionContextValue | null>(null);

export function LessonStepSessionProvider({
  session,
  stepIndex,
  children,
}: LessonStepSessionContextValue & { children: ReactNode }) {
  const value = useMemo(() => ({ session, stepIndex }), [session, stepIndex]);
  return <LessonStepSessionContext.Provider value={value}>{children}</LessonStepSessionContext.Provider>;
}

/** A useState-compatible slot restored whenever its runtime lesson screen remounts. */
export function useLessonStepState<T>(stateKey: string, initial: T | (() => T)): [T, Dispatch<SetStateAction<T>>] {
  const context = useContext(LessonStepSessionContext);
  const initialize = useCallback(
    () => typeof initial === 'function' ? (initial as () => T)() : initial,
    [initial],
  );
  const [value, setValue] = useState<T>(() => context
    ? readLessonStepSnapshot(context.session, context.stepIndex, stateKey, initialize)
    : initialize());
  const setPersistentValue = useCallback<Dispatch<SetStateAction<T>>>((action) => {
    setValue((previous) => {
      const next = typeof action === 'function'
        ? (action as (current: T) => T)(previous)
        : action;
      if (context) writeLessonStepSnapshot(context.session, context.stepIndex, stateKey, next);
      return next;
    });
  }, [context, stateKey]);
  return [value, setPersistentValue];
}
