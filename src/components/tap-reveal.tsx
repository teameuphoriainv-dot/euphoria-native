/**
 * TapReveal — term/definition reveal grid (Brilliant tap-reveal). Tap a card to cross-fade
 * its definition in. Must reveal all to continue.
 *
 * "Flip (spring pop)" is what this docstring used to claim, and the code never did it: the
 * front face was hard-cut and the back face zoomed in from scale 0. See RevealFaces below for
 * the three measured defects that came out of that and what replaced them.
 */
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, FontSize } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Duration, Ease } from '@/shared/motion/tokens';
import { SpringPressable } from '@/shared/motion/spring-pressable';

export type RevealSpec = { title: string; cards: { term: string; def: string }[] };

/**
 * The two faces of one card, CROSS-FADED IN PLACE.
 *
 * What this replaced, and why — measured, not preferred:
 *
 *   {revealed ? <Animated.View entering={ZoomIn.springify().damping(16)}> : <View>}
 *
 * Three defects in one line, all reported by the owner as "abrupt… messes up the pixels…
 * goes too large to small… acting like it's bouncing":
 *
 *  1. NOT A FLIP. The front face unmounted with no `exiting`, so it vanished on a hard cut
 *     while the back face grew in. The docstring above claims "flip (spring pop)"; the code
 *     did a swap. Both faces are now mounted for the whole transition, so there is nothing
 *     left to cut.
 *  2. SCALE FROM ZERO. `ZoomIn` starts at scale 0, so the text was rasterised at ~0 and
 *     resampled up — that is the reported pixel mess, and it is a resampling artefact rather
 *     than a rendering bug. Measured against the references: across **238 transitions** in
 *     refs/videos (Brilliant + Duolingo), the smallest starting footprint of any animating
 *     element is **9.2% of screen width**. Nothing in either app enters by growing from
 *     nothing. See refs/MOTION_RUBRIC.md R4. This now changes opacity only — the footprint
 *     never moves, so the artefact cannot occur.
 *  3. INHERITED BOUNCE. `.damping(16)` with no `.stiffness()` takes Reanimated's default
 *     stiffness 100 → ζ = 16/(2·√100) = 0.8, underdamped, so it overshot 1 and settled back.
 *     Rubric R2: of 124 reference transitions under 0.35s, 73% settle in ONE pass — bounce is
 *     the deliberate exception there, never a library default. A cross-fade cannot overshoot.
 *
 * Duration.base (280ms) sits inside the reference's measured p25–p75 band of 270–670ms (R1).
 *
 * A 3D rotateY flip was considered and REJECTED by the owner. It is also unsupported by the
 * evidence: the reference apps cross-fade and translate, they do not rotate cards.
 */
function RevealFaces({ term, def, revealed }: { term: string; def: string; revealed: boolean }) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const t = useSharedValue(revealed ? 1 : 0);

  useEffect(() => {
    // Reduced motion still needs the STATE CHANGE — it is the answer, not decoration. Only the
    // interpolation is dropped, so the definition appears instantly rather than not at all.
    if (reduced) t.set(revealed ? 1 : 0);
    else t.set(withTiming(revealed ? 1 : 0, { duration: Duration.base, easing: Ease.enter }));
  }, [revealed, reduced, t]);

  const backStyle = useAnimatedStyle(() => ({ opacity: t.get() }));
  const frontStyle = useAnimatedStyle(() => ({ opacity: 1 - t.get() }));

  return (
    // flex:1 so the card fills the row's height. Without it each card sizes to its OWN
    // definition, so two cards side by side end up different heights -- visible on device as a
    // short revealed card next to a tall unrevealed one. The row is already `alignItems:
    // stretch` by default; this is what lets the child actually take the offer.
    <View style={styles.faces}>
      {/* Back face is in FLOW so the card reserves the definition's height from the start.
          That is what removes the reflow: revealing changes no layout, only opacity. */}
      <Animated.View
        style={[styles.card, styles.fill, backStyle, { borderColor: theme.primary, backgroundColor: theme.primary + '12' }]}>
        <ThemedText type="smallBold" style={{ color: theme.iconLilac }}>{term}</ThemedText>
        <ThemedText type="small" themeColor="mutedForeground" style={{ marginTop: 4, lineHeight: 18 }}>{def}</ThemedText>
      </Animated.View>
      {/* Front face is absolute ON TOP, so revealing does not change the card's height and the
          grid never reflows mid-transition. `pointerEvents none` once faded so it cannot eat
          the tap that belongs to the SpringPressable wrapping it. */}
      <Animated.View
        pointerEvents={revealed ? 'none' : 'auto'}
        style={[
          styles.card, StyleSheet.absoluteFill, frontStyle,
          { borderColor: theme.border, backgroundColor: theme.card, alignItems: 'center', justifyContent: 'center' },
        ]}>
        <ThemedText type="heading" style={{ fontSize: FontSize.body, textAlign: 'center' }}>{term}</ThemedText>
        <ThemedText type="label" themeColor="mutedForeground" style={{ marginTop: 6 }}>Tap to flip</ThemedText>
      </Animated.View>
    </View>
  );
}

export function TapReveal({ spec, onSolvedChange }: { spec: RevealSpec; onSolvedChange: (solved: boolean) => void }) {
  const [revealed, setRevealed] = useState<boolean[]>(() => spec.cards.map(() => false));
  const allRevealed = revealed.every(Boolean);

  useEffect(() => {
    onSolvedChange(allRevealed);
    if (allRevealed) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [allRevealed, onSolvedChange]);

  const flip = (i: number) => {
    if (revealed[i]) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRevealed((prev) => prev.map((r, idx) => (idx === i ? true : r)));
  };

  return (
    <View>
      <ThemedText type="title" style={{ marginBottom: Spacing.two }}>{spec.title}</ThemedText>
      <ThemedText type="small" themeColor="mutedForeground" style={{ marginBottom: Spacing.four }}>Tap each card to reveal what it means.</ThemedText>

      <View style={styles.grid}>
        {spec.cards.map((c, i) => (
          <SpringPressable
            key={c.term}
            onPress={() => flip(i)}
            style={styles.cardWrap}
            haptic={false}
            accessibilityRole="button"
            // State goes in the accessible NAME rather than a checked flag: these are flip
            // cards, not toggles, and the whole point is whether the definition is showing.
            accessibilityLabel={revealed[i] ? `${c.term}. ${c.def}` : `${c.term}. Not revealed yet.`}
            accessibilityHint={revealed[i] ? undefined : 'Activate to reveal the definition.'}>
            <RevealFaces term={c.term} def={c.def} revealed={revealed[i]} />
          </SpringPressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two + 4 },
  cardWrap: { width: '47.5%', flexGrow: 1 },
  /* The two stacked faces of one card. flex:1 lets it take the row height the grid offers. */
  faces: { flex: 1 },
  fill: { flex: 1 },
  card: { minHeight: 118, borderRadius: Radius.lg, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.three },
});
