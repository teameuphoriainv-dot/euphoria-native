/**
 * TapReveal — canonical web reveal cards. Tap every card, then continue.
 */
import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { useLessonStepState } from '@/components/lesson-step-session';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getSprite, PixelSpriteView } from '@/lib/pixel';
import { Ease } from '@/shared/motion/tokens';
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

function FlipCard({
  term,
  def,
  stat,
  sprite: spriteId,
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
  const reduced = useReducedMotion();
  const t = useSharedValue(0);

  useEffect(() => {
    if (reduced) {
      t.set(isOpen ? 1 : 0);
      return;
    }
    t.set(withTiming(isOpen ? 1 : 0, { duration: 400, easing: Easing.inOut(Easing.ease) }));
  }, [isOpen, reduced, t]);

  const frontStyle = useAnimatedStyle(() => {
    const angle = `${t.get() * 180}deg`;
    return {
      backfaceVisibility: 'hidden' as const,
      transform: [{ perspective: 900 }, { rotateY: angle }],
      opacity: 1 - t.get(),
    };
  });

  const backStyle = useAnimatedStyle(() => {
    const angle = `${180 - (t.get() * 180)}deg`;
    return {
      backfaceVisibility: 'hidden' as const,
      transform: [{ perspective: 900 }, { rotateY: angle }],
      opacity: t.get(),
    };
  });

  return (
      <View style={[styles.faces, styles.facesWidth]}>
      <Animated.View style={[styles.card, frontStyle, isOpen ? styles.cardOpen : styles.cardClosed]}>
        <ThemedText type="bodyMedium" style={styles.closedTerm} maxFontSizeMultiplier={1.6}>
          {term}
        </ThemedText>
        <ThemedText type="small" style={{ color: termColor }}>
          Tap to reveal
        </ThemedText>
      </Animated.View>
      <Animated.View pointerEvents="none" style={[styles.card, backStyle, styles.back, isOpen ? styles.cardOpen : styles.cardClosed]}>
        <RevealedCard term={term} def={def} stat={stat} sprite={spriteId} />
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
              accessibilityLabel={isOpen ? `${card.term}. ${card.def}` : card.term}
              accessibilityHint={isOpen ? undefined : 'Activate to reveal the answer.'}>
              <FlipCard
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
        <ThemedText type="smallBold" style={{ color: '#fff' }}>Continue</ThemedText>
      </SpringPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', gap: Spacing.three, width: '100%' },
  title: { textAlign: 'center' },
  subtitle: { textAlign: 'center' },
  grid: { gap: Spacing.three, width: '100%' },
  cardWrap: { width: '100%', height: 280 },
  faces: { height: 280 },
  facesWidth: { width: '100%' },
  card: {
    position: 'absolute',
    inset: 0,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.two,
  },
  cardOpen: { borderColor: 'rgba(251,191,36,0.30)', backgroundColor: 'rgba(255,255,255,0.04)' },
  cardClosed: { borderColor: 'rgba(255,255,255,0.10)', backgroundColor: 'rgba(255,255,255,0.02)' },
  back: { borderColor: 'rgba(255,255,255,0.10)' },
  closedTerm: { textAlign: 'center' },
  revealed: { alignItems: 'center', gap: 10 },
  stat: { fontSize: 36, lineHeight: 40, fontWeight: '900', textAlign: 'center', fontVariant: ['tabular-nums'] },
  term: { textAlign: 'center' },
  definition: { lineHeight: 19, textAlign: 'center' },
  definitionWithoutStat: { lineHeight: 23 },
  continue: { minWidth: 152, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.md, paddingHorizontal: 28 },
});
