/**
 * Atlas speech bubble with typed-out text.
 *
 * From the Duolingo reference (refs/videos video 3, t≈141s and t≈149s): Duo never just *has* a
 * line of dialogue. The bubble pops in empty and the text types itself in, and the character
 * holds still while it does. Two things fall out of that which are easy to miss:
 *
 *   - typing buys TIME without the screen feeling stalled, which is how they hold a reward beat
 *     for several seconds without it dragging
 *   - it makes the mascot feel like it is addressing you now, rather than displaying a caption
 *
 * Deliberately not a character-by-character render of a <Text> per frame — that thrashes layout
 * on long strings. The full string is laid out once at zero opacity to reserve its box, and the
 * visible copy is sliced over the top, so the bubble never reflows mid-sentence.
 */
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withSpring } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, FontSize } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** ms per character. 26 is close to the reference and stays readable; below ~18 it stops
 *  reading as speech and starts reading as a glitch. */
const CHAR_MS = 26;

/*
 * A TICK WHILE ATLAS TALKS.
 *
 * `selectionAsync` and not `impactAsync`: this is the lightest tap iOS has, and it is the only
 * one that reads as texture under a voice rather than as a series of events happening to you.
 *
 * ponytail: fires every Nth CHARACTER, not every character. At CHAR_MS=26 a per-character tick
 * would ask the Taptic Engine for ~38 events a second, which iOS coalesces into an undifferentiated
 * buzz — the ceiling is the hardware, not the code. N=5 lands a tick roughly every 130ms, close to
 * a spoken syllable. Tune N here if it reads too busy or too sparse on a real device; the
 * simulator does not render haptics at all, so this can only be judged in the hand.
 */
const HAPTIC_EVERY_N_CHARS = 5;

export function Typewriter({ text, delay = 0, style, skipKey = 0 }: { text: string; delay?: number; style?: object; skipKey?: number }) {
  const reduced = useReducedMotion();
  const [n, setN] = useState(reduced ? text.length : 0);

  useEffect(() => {
    // Reduced Motion takes the instant path: show the whole string rather than type it. One
    // extra render on mount, no interval, no loop -- the state is already seeded to this value,
    // so React bails unless `text` changed.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (reduced) { setN(text.length); return; }
    /*
     * SKIP TO THE END. A typewriter is a pace, and a pace the reader cannot overtake is a wait.
     * At CHAR_MS a 110-character line takes 2.9 seconds, and every surface that uses this puts a
     * live control next to it (Continue in onboarding, Next in the tour), so a fast reader either
     * sat through the animation or tapped past a sentence they never saw.
     *
     * A KEY RATHER THAN A BOOLEAN, which is the same latch this repo fixed on the mascot's own
     * reactions: `skipped` as a flag would stick and the NEXT line would render instantly.
     * atlas-conversation.tsx already solved this for the vocab beats with its own `finish()`; this
     * gives the shared bubble the same courtesy.
     */
    if (skipKey > 0) { setN(text.length); return; }
    setN(0);
    let i = 0;
    let iv: ReturnType<typeof setInterval>;
    const start = setTimeout(() => {
      iv = setInterval(() => {
        i += 1;
        setN(i);
        // Reduced Motion and the skip both return before this interval exists, so a user who
        // opted out of animation never feels the typing either.
        if (i % HAPTIC_EVERY_N_CHARS === 0) void Haptics.selectionAsync();
        if (i >= text.length) clearInterval(iv);
      }, CHAR_MS);
    }, delay);
    return () => { clearTimeout(start); clearInterval(iv); };
  }, [text, delay, reduced, skipKey]);

  /*
   * ONE TEXT, FULL LENGTH. The untyped remainder is laid out but transparent, so the line breaks
   * are the final sentence's from the first character. Rendering only `text.slice(0, n)` let a
   * half-typed word fit on line 1 and then jump to line 2 once it grew ("investing" in the
   * onboarding questions) — the ghost reserved the box's height, not the words' positions.
   *
   * ACCESSIBILITY: the label is the full string, so VoiceOver announces it complete and once,
   * whatever the animation has reached.
   */
  return (
    <ThemedText type="bodyMedium" accessibilityLabel={text} style={[styles.line, style]}>
      {text.slice(0, n)}
      <ThemedText style={styles.untyped}>{text.slice(n)}</ThemedText>
    </ThemedText>
  );
}

/** Bubble with a tail, popping in on a spring before its text starts. */
export function AtlasSpeech({
  text,
  delay = 0,
  tail = 'bottom',
  maxWidth = 280,
  textStyle,
  tailAlign = 'left',
  skipKey = 0,
}: {
  text: string;
  delay?: number;
  /** Which edge the tail hangs off — 'bottom' when Atlas is below the bubble. */
  tail?: 'bottom' | 'top';
  maxWidth?: number;
  /** Override the bubble's text size. Onboarding asks its questions in here, and a question set in
   *  the default 15pt caption size would be the smallest thing on a screen it is the subject of. */
  textStyle?: object;
  /** Where the tail hangs. 'left' is the default because Atlas usually sits off to one side; the
   *  onboarding bubble hangs from a CENTRED Atlas, and a left tail there points at nothing. */
  tailAlign?: 'left' | 'center';
  /** Bump to drop the rest of the typewriter and show the whole line at once. The bubble itself is
   *  deliberately NOT a Pressable: this component renders inside other tappables (onboarding sets a
   *  question in one), and swallowing those taps would break controls to fix a pace. The owning
   *  screen decides what a tap means and bumps this. */
  skipKey?: number;
}) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const pop = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) return;
    /* zeta = 15/(2*sqrt(260)) = 0.47, so this overshoots about 19% before settling. That is a
       real pop, not a hint of one, and it is DELIBERATE: the speech bubble should arrive with
       character rather than slide into place. R2 asks only that a bounce be chosen per element
       and justified, which is what this comment is. */
    pop.set(withDelay(delay, withSpring(1, { stiffness: 260, damping: 15, mass: 1 })));
  }, [reduced, pop, delay]);

  const style = useAnimatedStyle(() => ({
    opacity: Math.min(1, pop.get() * 2),
    transform: [{ scale: 0.82 + pop.get() * 0.18 }, { translateY: (1 - pop.get()) * 8 }],
  }));

  return (
    <Animated.View style={[{ maxWidth }, style]}>
      <View style={[styles.bubble, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Typewriter text={text} delay={delay + 180} style={textStyle} skipKey={skipKey} />
      </View>
      <View style={[styles.tailWrap, tailAlign === 'center' && styles.tailCenter, tail === 'bottom' ? styles.tailBottom : styles.tailTop]}>
        <Svg width={18} height={11} viewBox="0 0 18 11">
          <Path
            d={tail === 'bottom' ? 'M0 0 L18 0 L7 11 Z' : 'M0 11 L18 11 L7 0 Z'}
            fill={theme.card}
            stroke={theme.border}
            strokeWidth={1}
          />
        </Svg>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  line: { fontSize: FontSize.bodySm, lineHeight: 21 },
  untyped: { color: 'transparent' },
  bubble: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.two + 2,
    paddingHorizontal: Spacing.three,
  },
  tailWrap: { position: 'absolute', left: Spacing.four },
  // -7, not -9. The tail path is `M0 11 L18 11 L7 0 Z` — its POINT is at x=7, not at the midpoint
  // of the 18pt box, so pulling back by half the width left the point 2pt off centre.
  tailCenter: { left: '50%', marginLeft: -7 },
  tailBottom: { bottom: -10 },
  tailTop: { top: -10 },
});
