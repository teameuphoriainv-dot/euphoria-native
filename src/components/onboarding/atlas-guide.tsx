/**
 * AtlasGuide: Atlas and one short speech bubble, the line that reacts to the previous answer.
 *
 * Owner decision 2: Atlas guides EVERY onboarding screen. The line comes from
 * src/lib/onboarding/atlas-lines.ts (pure, pinned by scripts/onboarding-atlas-guide-pin.mjs); this
 * file only draws it.
 *
 * TWO VARIANTS.
 *   default  Atlas at GUIDE_ATLAS beside a bubble whose text types in (the shared Typewriter, so
 *            VoiceOver hears the whole line once and Reduce Motion gets it instantly). For the
 *            question steps.
 *   compact  Atlas at COMPACT_ATLAS and a two-line bubble at a FIXED height, no typing. For the
 *            paywall, which must not scroll at the largest Dynamic Type it supports (CONSTITUTION
 *            5.3). The height is fixed and the text is capped at two lines and a 1.3 font
 *            multiplier, so a larger text setting cannot make this row taller and push the renewal
 *            terms below the fold. atlas-lines.ts keeps the paywall line under COMPACT_LINE_MAX so
 *            the cap never has to truncate it.
 *
 * ONE MASCOT PER SCREEN (CONSTITUTION 5.6). Onboarding already draws Atlas in a persistent
 * <AtlasStage>. Drawing him again here would put two Atlases on one screen, so `showAtlas={false}`
 * gives the bubble alone, sliding down out of the stage. The guide never renders the user's
 * avatar: the avatar is the user, Atlas is Atlas.
 *
 * MOTION. The bubble fades in and slides 8pt out of Atlas with withTiming and Ease.enter, no
 * overshoot: it is text arriving, not a reward. Atlas gets a nod on every new line, which is his
 * own overshoot and allowed for the character. Under Reduce Motion the bubble is simply there and
 * Atlas holds still (his nod is already guarded inside <Atlas>).
 */
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import Svg, { Path } from 'react-native-svg';

import { Atlas, type AtlasExpression } from '@/components/atlas';
import { Typewriter } from '@/components/atlas-speech';
import { ThemedText } from '@/components/themed-text';
import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Duration, Ease } from '@/shared/motion/tokens';

/** Atlas beside the bubble. Small enough to share a row with a two-line bubble on a 375pt screen
 *  without squeezing the bubble to one word per line. */
export const GUIDE_ATLAS = 56;
/** Atlas on the paywall. The paywall's AtlasStage is 69pt tall today (a 52pt Atlas, round(52 x 1.04)
 *  = 54, plus round(28 x 52 / 96) = 15 of hop headroom). The compact row is meant to REPLACE that
 *  stage, not sit under it, and at COMPACT_GUIDE_HEIGHT it is 13pt shorter than what it replaces. */
export const COMPACT_ATLAS = 32;
/** The compact row's fixed height: two caption lines at the 1.3 cap (2 x 16 x 1.3 = 41.6) plus the
 *  bubble's 6pt vertical padding each side, rounded up. Fixed so Dynamic Type cannot grow it. */
export const COMPACT_GUIDE_HEIGHT = 56;
/** Distance the bubble slides out of Atlas on entry. */
const SLIDE = 8;

export function AtlasGuide({
  line,
  variant = 'default',
  showAtlas = true,
  expression = 'default',
  delay = 0,
  skipKey = 0,
}: {
  /** From atlasLineFor(). Null draws nothing: a step with no line shows no empty bubble. */
  line: string | null;
  variant?: 'default' | 'compact';
  /** False when an <AtlasStage> on the same screen already draws Atlas. */
  showAtlas?: boolean;
  expression?: AtlasExpression;
  /** ms before the bubble arrives, so it can follow the step transition instead of racing it. */
  delay?: number;
  /** Bump to finish the typing at once (the owning screen decides what tap means that). */
  skipKey?: number;
}) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const compact = variant === 'compact';
  const enter = useSharedValue(reduced ? 1 : 0);
  /* A KEY, NOT A BOOLEAN. Atlas's `nod` latches: a boolean would nod on the first line and then
   * stand still for every line after it, which is the exact bug atlas.tsx documents for
   * celebrateKey. Bumped once per new line. */
  const [nodKey, setNodKey] = useState(0);

  useEffect(() => {
    if (!line) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one bump per new line, not per frame
    setNodKey((k) => k + 1);
    if (reduced) {
      enter.set(1);
      return;
    }
    enter.set(0);
    enter.set(withDelay(delay, withTiming(1, { duration: Duration.base, easing: Ease.enter })));
  }, [line, reduced, delay, enter]);

  // An unmount mid-entry (a fast Continue tap during the step cross-fade) would otherwise leave the
  // timing running on the UI thread against a view that no longer exists.
  useEffect(() => () => cancelAnimation(enter), [enter]);

  const bubbleStyle = useAnimatedStyle(() => ({
    opacity: enter.get(),
    transform: showAtlas
      ? [{ translateX: (1 - enter.get()) * -SLIDE }]
      : [{ translateY: (1 - enter.get()) * -SLIDE }],
  }));

  if (!line) return null;

  const bubble = (
    <Animated.View
      style={[
        styles.bubble,
        compact ? styles.bubbleCompact : null,
        { backgroundColor: theme.card, borderColor: theme.border },
        bubbleStyle,
      ]}>
      {compact ? (
        <ThemedText
          type="small"
          numberOfLines={2}
          maxFontSizeMultiplier={1.3}
          style={styles.compactText}>
          {line}
        </ThemedText>
      ) : (
        <Typewriter text={line} delay={delay + Duration.fast} skipKey={skipKey} style={styles.text} />
      )}
      {/* THE TAIL SAYS WHO IS TALKING. Without it the bubble is a card floating near Atlas, and on
       * question steps (showAtlas false, AtlasStage above) it reads as page copy rather than his
       * line. Same fill, stroke and path shape as <AtlasSpeech>'s tail, so the two bubbles in the
       * flow look like one voice: pointing LEFT at the Atlas beside it, or UP at the stage. */}
      <View
        pointerEvents="none"
        style={showAtlas ? [styles.tailLeft, compact && styles.tailLeftCompact] : styles.tailTop}>
        <Svg width={showAtlas ? 11 : 18} height={showAtlas ? 18 : 11} viewBox={showAtlas ? '0 0 11 18' : '0 0 18 11'}>
          <Path
            d={showAtlas ? 'M11 0 L11 18 L0 7 Z' : 'M0 11 L18 11 L7 0 Z'}
            fill={theme.card}
            stroke={theme.border}
            strokeWidth={1}
          />
        </Svg>
      </View>
    </Animated.View>
  );

  return (
    <View
      // One VoiceOver stop that says who is talking. The Typewriter's own label still carries the
      // complete line, so focus landing mid-type never reads half a sentence.
      accessible
      accessibilityRole="text"
      accessibilityLabel={`Atlas says: ${line}`}
      style={[styles.row, compact ? { height: COMPACT_GUIDE_HEIGHT } : null, !showAtlas && styles.rowCentered]}>
      {showAtlas ? (
        <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
          <Atlas
            size={compact ? COMPACT_ATLAS : GUIDE_ATLAS}
            expression={expression}
            interactive={false}
            nod={nodKey > 0}
            nodKey={nodKey}
          />
        </View>
      ) : null}
      <View style={styles.bubbleWrap}>{bubble}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  // gap three, not two: the left tail hangs 10pt out of the bubble, and at an 8pt gap it would
  // overlap Atlas's arm instead of pointing at him.
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  rowCentered: { justifyContent: 'center' },
  bubbleWrap: { flexShrink: 1 },
  bubble: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  bubbleCompact: {
    borderRadius: Radius.md,
    paddingVertical: Spacing.one + 2,
    paddingHorizontal: Spacing.two + 2,
  },
  // -10 on the pointing edge, the same overlap AtlasSpeech uses: the tail's base covers the
  // bubble's hairline so the join has no seam.
  tailLeft: { position: 'absolute', left: -10, top: Spacing.two + 2 },
  tailLeftCompact: { top: Spacing.one + 2 },
  // Point sits at x=7 of the 18pt box (AtlasSpeech's path), so -7 centres it.
  tailTop: { position: 'absolute', top: -10, left: '50%', marginLeft: -7 },
  text: { fontSize: FontSize.bodySm, lineHeight: 21 },
  compactText: { fontSize: FontSize.caption, lineHeight: 16 },
});
