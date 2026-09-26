/**
 * TapReveal — canonical web reveal cards. Tap every card, then continue.
 */
import * as Haptics from '@/lib/haptics';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { useLessonStepState } from '@/components/lesson-step-session';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getSprite, PixelSpriteView } from '@/lib/pixel';
import { Duration, Ease } from '@/shared/motion/tokens';
import { SpringPressable } from '@/shared/motion/spring-pressable';

export type RevealSpec = {
  title: string;
  cards: { term: string; def: string; stat?: string; sprite?: string }[];
};

function RevealedCard({
  term,
  def,
  stat,
  sprite: spriteId,
}: {
  term: string;
  def: string;
  stat?: string;
  sprite?: string;
}) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const progress = useSharedValue(reduced ? 1 : 0);
  const sprite = spriteId ? getSprite(spriteId) : undefined;

  useEffect(() => {
    if (reduced) progress.set(1);
    else progress.set(withTiming(1, { duration: 280, easing: Ease.inOut }));
  }, [progress, reduced]);

  const entrance = useAnimatedStyle(() => ({
    opacity: progress.get(),
    transform: [{ translateY: reduced ? 0 : (1 - progress.get()) * 8 }],
  }));

  return (
    <Animated.View style={[styles.revealed, entrance]}>
      {sprite ? (
        <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <PixelSpriteView sprite={sprite} size={36} />
        </View>
      ) : null}
      {stat ? (
        <ThemedText
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
  );
}

/**
 * The two faces of one card, CROSS-FADED IN PLACE. No rotation.
 *
 * A 3D Y-axis card flip (perspective 900, 400ms) arrived in e25ed9c, a commit whose message is entirely
 * about the parity harness and never mentions this component. It went against two recorded
 * decisions: c499b09 notes a 3D flip "was considered and REJECTED by the owner", and the web
 * reveal this screen mirrors (euphoriaweb StepRenderer, `min-h-[210px]`, `initial={{ opacity: 0,
 * y: 8 }}`, `duration: 0.28`) swaps the content without rotating. The same commit added
 * scripts/tap-reveal-parity-regression.mjs banning that flip, so the pin went red on day one and
 * stayed red for three weeks because no npm script runs it (A4 scout, 2026-09-22).
 *
 * The SHOWING face sits in flow and the other is absolute. 315b150 measured what happens when the
 * hidden face reserves height instead: cards grew from 118 to 235pt and the last row sat 68pt
 * below the screen, untappable. The fixed `height: 280` the flip needed brought a milder form of
 * that back for every short card, so the card is minHeight 210 (the web value) and grows only when
 * the revealed answer needs the room.
 *
 * Reduced motion keeps the state change and drops the interpolation: the front face is gone and
 * the answer is there on the same frame.
 */
function RevealFaces({
  term,
  def,
  stat,
  sprite,
  isOpen,
  termColor,
}: {
  term: string;
  def: string;
  stat?: string;
  sprite?: string;
  isOpen: boolean;
  termColor: string;
}) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const t = useSharedValue(isOpen ? 1 : 0);

  useEffect(() => {
    if (reduced) t.set(isOpen ? 1 : 0);
    else t.set(withTiming(isOpen ? 1 : 0, { duration: Duration.base, easing: Ease.inOut }));
  }, [isOpen, reduced, t]);

  const frontStyle = useAnimatedStyle(() => ({ opacity: 1 - t.get() }));

  return (
    <View
      style={[
        styles.card,
        isOpen
          ? { borderColor: theme.iconGold + '4D', backgroundColor: theme.cardElevated }
          : { borderColor: theme.border, backgroundColor: theme.card },
      ]}>
      {isOpen ? <RevealedCard term={term} def={def} stat={stat} sprite={sprite} /> : null}
      <Animated.View
        pointerEvents="none"
        style={[styles.front, isOpen ? styles.frontLeaving : null, frontStyle]}>
        <ThemedText type="bodyMedium" style={styles.closedTerm} maxFontSizeMultiplier={1.6}>
          {term}
        </ThemedText>
        <ThemedText type="small" style={{ color: termColor }}>
          Tap to reveal
        </ThemedText>
      </Animated.View>
    </View>
  );
}

export function TapReveal({ spec, onComplete }: { spec: RevealSpec; onComplete: (correct: boolean) => void }) {
  const theme = useTheme();
  const [revealed, setRevealed] = useLessonStepState<boolean[]>('reveal.revealed', () => spec.cards.map(() => false));
  const allRevealed = revealed.every(Boolean);

  const reveal = (i: number) => {
    if (revealed[i]) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRevealed((prev) => {
      const next = prev.map((open, idx) => (idx === i ? true : open));
      if (next.every(Boolean)) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return next;
    });
  };

  return (
    <View style={styles.root}>
      <ThemedText type="heading" style={styles.title}>{spec.title}</ThemedText>
      <ThemedText type="small" themeColor="mutedForeground" style={styles.subtitle}>Tap each card to reveal the answer</ThemedText>

      <View style={styles.grid}>
        {spec.cards.map((card, i) => {
          const isOpen = revealed[i];
          return (
            <SpringPressable
              key={`${i}-${card.term}`}
              disabled={isOpen}
              onPress={() => reveal(i)}
              style={styles.cardWrap}
              haptic={false}
              accessibilityRole="button"
              accessibilityState={{ expanded: isOpen }}
              // The unrevealed label must state the card's own state. Dropping it left VoiceOver
              // unable to distinguish a flipped card from an unflipped one, and left the parity
              // driver unable to see that a reveal step was still gating Continue.
              accessibilityLabel={isOpen ? `${card.term}. ${card.def}` : `${card.term}. Not revealed yet.`}
              accessibilityHint={isOpen ? undefined : 'Activate to reveal the answer.'}>
              <RevealFaces
                term={card.term}
                def={card.def}
                stat={card.stat}
                sprite={card.sprite}
                isOpen={isOpen}
                termColor={theme.iconLilac}
              />
            </SpringPressable>
          );
        })}
      </View>

      <SpringPressable
        disabled={!allRevealed}
        onPress={() => onComplete(true)}
        style={[styles.continue, { backgroundColor: allRevealed ? theme.primary : theme.primary + '66' }]}
        accessibilityRole="button"
        accessibilityLabel="Continue">
        <ThemedText type="smallBold" style={{ color: theme.primaryForeground }}>Continue</ThemedText>
      </SpringPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', gap: Spacing.three, width: '100%' },
  title: { textAlign: 'center' },
  subtitle: { textAlign: 'center' },
  grid: { gap: Spacing.three, width: '100%' },
  cardWrap: { width: '100%' },
  card: {
    minHeight: 210,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  front: { justifyContent: 'center', alignItems: 'center', gap: Spacing.two },
  // Absolute only while fading out, so the leaving face adds no height (315b150). It sits on the
  // card's border box, so it needs the card's own 24 inset to stay put as it fades.
  frontLeaving: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, padding: 24 },
  closedTerm: { textAlign: 'center' },
  revealed: { alignItems: 'center', gap: 10 },
  stat: { fontSize: 36, lineHeight: 40, fontWeight: '900', textAlign: 'center', fontVariant: ['tabular-nums'] },
  term: { textAlign: 'center' },
  definition: { lineHeight: 19, textAlign: 'center' },
  definitionWithoutStat: { lineHeight: 23 },
  continue: { minWidth: 152, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.md, paddingHorizontal: 28 },
});
