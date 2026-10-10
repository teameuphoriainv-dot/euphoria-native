/**
 * ONE MASCOT PER LESSON SCREEN (CONSTITUTION 6), enforced by the mascot itself.
 *
 * Most lesson steps draw Atlas in their own content: the prose and teaching-slide hosts, the
 * visual and graph captions, the number line's prompt, every wrong-answer <AtlasCorrection>. The
 * floating Ask-Atlas button sat over all of them, so the slider showed THREE Atlases on one screen
 * (prompt, correction, float). lesson.tsx used to exempt screens one at a time (deck cards, the
 * vocab chat, the part card), and every new step kind that drew Atlas re-broke the rule.
 *
 * Now every <Atlas> mounted inside the lesson content claims presence here, and the float hides
 * while any claim is held. Owner decision 2026-09-28: the in-content Atlas BECOMES the Ask-Atlas
 * door, so a tap on him opens the same tutor sheet and help stays one tap away on every screen.
 *
 * Outside this provider (Home, the float itself, the tutor sheet) the hook returns null and Atlas
 * behaves exactly as before.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react';

type LessonAtlasPresence = {
  /** Register a mounted mascot. Returns the release to call on unmount. */
  claim: () => () => void;
  /** Open the Ask-Atlas tutor sheet for the current step. */
  ask: () => void;
};

const Context = createContext<LessonAtlasPresence | null>(null);

export function LessonAtlasPresenceProvider({
  onPresentChange,
  onAsk,
  children,
}: {
  onPresentChange: (present: boolean) => void;
  onAsk: () => void;
  children: ReactNode;
}) {
  const count = useRef(0);
  // Refs, so the context value never changes identity and claiming Atlases never re-register.
  const present = useRef(onPresentChange);
  const askRef = useRef(onAsk);
  useEffect(() => {
    present.current = onPresentChange;
    askRef.current = onAsk;
  });

  const claim = useCallback(() => {
    count.current += 1;
    if (count.current === 1) present.current(true);
    let released = false;
    return () => {
      if (released) return;
      released = true;
      count.current -= 1;
      if (count.current === 0) present.current(false);
    };
  }, []);
  const ask = useCallback(() => askRef.current(), []);
  const value = useMemo(() => ({ claim, ask }), [claim, ask]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useLessonAtlasPresence(): LessonAtlasPresence | null {
  return useContext(Context);
}
