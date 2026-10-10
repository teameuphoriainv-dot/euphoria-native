/**
 * The right-answer confetti signal. `feedback('correct')` fires it from wherever the answer was
 * graded (lesson.tsx, the number line, drag-sort...), and the one <CorrectConfettiHost> mounted
 * over the lesson draws it, so no step component has to own an overlay or know the screen size.
 */
type Listener = () => void;

const listeners = new Set<Listener>();

export function onCorrectBurst(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function fireCorrectBurst(): void {
  for (const listener of listeners) listener();
}
