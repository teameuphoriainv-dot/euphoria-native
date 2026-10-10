/**
 * <TypedMessage> - the vocab conversation's typewriter, as a leaf.
 *
 * WHY THIS IS ITS OWN COMPONENT. The typewriter used to be a hook inside AtlasConversation, so its
 * per-character setState re-rendered the whole conversation: the ScrollView, the progress bar,
 * Atlas, the bubble and every answer option, 46 times a second. Measured 2026-09-22 over the
 * wrapped corpus (src/lib/curriculum/index.ts): 186 vocab steps, a median of 1,649 typed characters
 * per step and 2,194 at worst (wealth-management lesson 7, step 5), and the conversation committed
 * once per character. scripts/typewriter-leaf-pin.mjs renders the conversation in node and counts
 * it: on the old code the ScrollView re-rendered as many times as the line had characters.
 *
 * Here the interval and the per-character state live in this leaf and nowhere else, so a tick
 * repaints one Text. The parent learns about typing exactly once per beat, through `onDone`.
 *
 * CONTRACT
 *   - Key it by beat. A new line is a new mount, which is what resets the count.
 *   - `finished` is the parent's "show it all now" (tap to finish, Reduced Motion, empty text).
 *     It stops the interval and paints the full line without calling `onDone` back, because the
 *     parent already knows.
 *   - `onDone` fires at most once per mount, when typing reaches the end on its own.
 *
 * No haptics here, on purpose: the vocab typewriter never had a tick (the tick lives in
 * atlas-speech.tsx and is held by scripts/typing-haptics-pin.mjs). Moving the typing into a leaf
 * must not quietly add one.
 */
import { memo, useEffect, useRef, useState } from 'react';
import type { StyleProp, TextStyle } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';

type TypedMessageProps = {
  text: string;
  msPerChar: number;
  finished: boolean;
  onDone: () => void;
  style?: StyleProp<TextStyle>;
  cursorStyle?: StyleProp<TextStyle>;
};

const UNTYPED = { color: 'transparent' } as const;

function TypedMessageInner({ text, msPerChar, finished, onDone, style, cursorStyle }: TypedMessageProps) {
  const reduced = useReducedMotion();
  // The count carries the text it was counted against, so a text change without a remount can
  // never paint a slice of the new line at the old line's length.
  const [typed, setTyped] = useState({ text, count: 0 });
  const count = typed.text === text ? typed.count : 0;

  /*
   * The latest onDone, read from inside the interval. Putting onDone in the effect's deps instead
   * would restart the interval from character zero whenever the parent handed over a new function
   * identity mid-line, and the line would visibly start typing again.
   */
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);
  const reported = useRef(false);

  useEffect(() => {
    // Reduced Motion, a tap to finish and an empty line all take the instant path: no interval.
    if (reduced || finished || !text) return;
    let n = 0;
    const interval = setInterval(() => {
      n += 1;
      if (n >= text.length) {
        clearInterval(interval);
        setTyped({ text, count: text.length });
        if (!reported.current) {
          reported.current = true;
          onDoneRef.current();
        }
        return;
      }
      setTyped({ text, count: n });
    }, msPerChar);
    return () => clearInterval(interval);
  }, [finished, msPerChar, reduced, text]);

  const complete = reduced || finished || !text || count >= text.length;
  const shown = complete ? text.length : count;
  /*
   * FULL STRING, UNTYPED REMAINDER TRANSPARENT. Rendering only text.slice(0, count) let a half-typed
   * word fit on line 1 and then jump to line 2 once it grew (users reported "investing" doing this in
   * onboarding). Laying out the whole sentence from the first character fixes every word's line.
   * The cursor TAKES THE SLOT of the next untyped character instead of being inserted beside it, so
   * the line only differs by one glyph's width difference rather than a whole extra glyph -- the
   * wrap holds, and typewriter-leaf-pin still sees a cursor while typing and none after.
   */
  return (
    <ThemedText accessibilityElementsHidden style={style}>
      {text.slice(0, shown)}
      {complete ? null : <ThemedText style={cursorStyle}>▌</ThemedText>}
      <ThemedText style={UNTYPED}>{text.slice(complete ? shown : shown + 1)}</ThemedText>
    </ThemedText>
  );
}

/*
 * memo() is load-bearing, not tidying. The parent re-renders when the beat finishes, when an answer
 * is picked and when the learner advances; without memo each of those would re-render this leaf
 * too. Held by scripts/typewriter-leaf-pin.mjs.
 */
export const TypedMessage = memo(TypedMessageInner);
