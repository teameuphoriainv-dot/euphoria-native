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

export function Typewriter({ text, delay = 0, style }: { text: string; delay?: number; style?: object }) {
  const reduced = useReducedMotion();
  const [n, setN] = useState(reduced ? text.length : 0);

  useEffect(() => {
    if (reduced) { setN(text.length); return; }
    setN(0);
    let i = 0;
    let iv: ReturnType<typeof setInterval>;
    const start = setTimeout(() => {
      iv = setInterval(() => {
        i += 1;
        setN(i);
        if (i >= text.length) clearInterval(iv);
      }, CHAR_MS);
    }, delay);
    return () => { clearTimeout(start); clearInterval(iv); };
  }, [text, delay, reduced]);

  /*
   * ACCESSIBILITY. Two copies of the text are on screen: a full one at opacity 0 reserving the box,
   * and the sliced visible one. An `opacity: 0` Text is STILL in the accessibility tree, so
   * VoiceOver read every line twice — and once ~10 onboarding questions started routing through
   * here, that was ten double-announcements. Focus landing mid-type also read a truncated question
   * ("How much do you k").
   *
   * The ghost is hidden from assistive tech, and the visible copy carries the FULL string as its
   * label so it is announced complete and once, whatever the animation has reached.
   */
  return (
    <View>
      {/* reserves the final box so the bubble never reflows as characters land */}
      <ThemedText
        type="bodyMedium"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[styles.line, style, { opacity: 0 }]}>
        {text}
      </ThemedText>
      <ThemedText type="bodyMedium" accessibilityLabel={text} style={[styles.line, style, styles.overlay]}>
        {text.slice(0, n)}
      </ThemedText>
    </View>
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
    pop.set(withDelay(delay, withSpring(1, { stiffness: 260, damping: 15 })));
  }, [reduced, pop, delay]);

  const style = useAnimatedStyle(() => ({
    opacity: Math.min(1, pop.get() * 2),
    transform: [{ scale: 0.82 + pop.get() * 0.18 }, { translateY: (1 - pop.get()) * 8 }],
  }));

  return (
    <Animated.View style={[{ maxWidth }, style]}>
      <View style={[styles.bubble, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Typewriter text={text} delay={delay + 180} style={textStyle} />
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
  overlay: { position: 'absolute', top: 0, left: 0, right: 0 },
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
