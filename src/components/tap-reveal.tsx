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
import { getSprite, PixelSpriteView } from '@/lib/pixel';
import { Duration, Ease } from '@/shared/motion/tokens';
import { SpringPressable } from '@/shared/motion/spring-pressable';

export type RevealSpec = {
  title: string;
  cards: { term: string; def: string; stat?: string; sprite?: string }[];
};

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
function RevealFaces({
  term,
  def,
  stat,
  sprite: spriteId,
  revealed,
}: {
  term: string;
  def: string;
  stat?: string;
  sprite?: string;
  revealed: boolean;
}) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const t = useSharedValue(revealed ? 1 : 0);
  const sprite = spriteId ? getSprite(spriteId) : undefined;

  useEffect(() => {
    // Reduced motion still needs the STATE CHANGE — it is the answer, not decoration. Only the
    // interpolation is dropped, so the definition appears instantly rather than not at all.
    if (reduced) t.set(revealed ? 1 : 0);
    else t.set(withTiming(revealed ? 1 : 0, { duration: Duration.base, easing: Ease.enter }));
  }, [revealed, reduced, t]);

  const backStyle = useAnimatedStyle(() => ({ opacity: t.get() }));
  const frontStyle = useAnimatedStyle(() => ({ opacity: 1 - t.get() }));

  return (
    <View style={styles.faces}>
      {/*
        * WHICHEVER FACE IS SHOWING SITS IN FLOW; the other is absolute and contributes no height.
        *
        * The first version of this fix kept the BACK face permanently in flow so that revealing
        * changed no layout. That removed reflow -- but reflow was never a reported defect, and
        * the cost was measured on device: every unrevealed card reserved its definition's height,
        * so cards grew from minHeight 118 to 235pt, the six-card grid roughly doubled, and the
        * last row ended up 68pt BELOW the screen and behind the Continue button, where it could
        * not be tapped. That is a worse bug than the one it prevented.
        *
        * Swapping which face is in flow keeps the cross-fade -- both faces stay mounted the whole
        * time, so there is still no hard cut and still no scale-from-zero -- while the card sizes
        * to the state it is actually in.
        */}
      <Animated.View
        style={[
          styles.card, backStyle, revealed ? null : StyleSheet.absoluteFill,
          styles.back,
          { borderColor: theme.iconGold + '4D', backgroundColor: theme.primary + '12' },
        ]}
        pointerEvents="none">
        {sprite ? (
          <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <PixelSpriteView sprite={sprite} size={36} />
          </View>
        ) : null}
        {stat ? (
          <ThemedText
            type="display"
            maxFontSizeMultiplier={1.6}
            style={[styles.stat, { color: theme.iconGold }]}>
            {stat}
          </ThemedText>
        ) : null}
        <ThemedText type="smallBold" themeColor="mutedForeground" style={styles.term}>{term}</ThemedText>
        <ThemedText
          type={stat ? 'small' : 'body'}
          themeColor="textSecondary"
          style={[styles.definition, stat ? null : styles.definitionWithoutStat]}>
          {def}
        </ThemedText>
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.card, frontStyle, revealed ? StyleSheet.absoluteFill : null,
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
      <ThemedText type="small" themeColor="mutedForeground" style={{ marginBottom: Spacing.four }}>Tap each card to reveal the answer</ThemedText>

      <View style={styles.grid}>
        {spec.cards.map((c, i) => (
          <SpringPressable
            key={`${i}-${c.term}`}
            onPress={() => flip(i)}
            style={styles.cardWrap}
            haptic={false}
            accessibilityRole="button"
            // State goes in the accessible NAME rather than a checked flag: these are flip
            // cards, not toggles, and the whole point is whether the definition is showing.
            accessibilityLabel={revealed[i] ? `${c.term}. ${c.def}` : `${c.term}. Not revealed yet.`}
            accessibilityHint={revealed[i] ? undefined : 'Activate to reveal the definition.'}>
            <RevealFaces term={c.term} def={c.def} stat={c.stat} sprite={c.sprite} revealed={revealed[i]} />
          </SpringPressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two + 4 },
  // The canonical web lesson uses one column on phones. Rich rewritten definitions and their
  // headline stats need the full iPhone measure; squeezing them into two 175pt columns produces
  // 10+ line cards and destroys the intended hierarchy.
  cardWrap: { width: '100%' },
  /* The two stacked faces of one card. flex:1 lets it take the row height the grid offers. */
  faces: { flex: 1 },
  card: { minHeight: 118, borderRadius: Radius.lg, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.three },
  back: { alignItems: 'center', justifyContent: 'center', gap: Spacing.two },
  stat: { fontSize: FontSize.displaySm, lineHeight: 42, textAlign: 'center', fontVariant: ['tabular-nums'] },
  term: { textAlign: 'center' },
  definition: { lineHeight: 19, textAlign: 'center' },
  definitionWithoutStat: { lineHeight: 22 },
});
