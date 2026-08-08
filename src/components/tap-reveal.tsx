/**
 * TapReveal — flashcard flip widget (Brilliant tap-reveal). Grid of term cards; tap to
 * flip (spring pop) and reveal the definition. Must flip all to continue.
 */
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, FontSize } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { SpringPressable } from '@/shared/motion/spring-pressable';

export type RevealSpec = { title: string; cards: { term: string; def: string }[] };

export function TapReveal({ spec, onSolvedChange }: { spec: RevealSpec; onSolvedChange: (solved: boolean) => void }) {
  const theme = useTheme();
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
            {revealed[i] ? (
              <Animated.View entering={ZoomIn.springify().damping(16)} style={[styles.card, { borderColor: theme.primary, backgroundColor: theme.primary + '12' }]}>
                <ThemedText type="smallBold" style={{ color: theme.iconLilac }}>{c.term}</ThemedText>
                <ThemedText type="small" themeColor="mutedForeground" style={{ marginTop: 4, lineHeight: 18 }}>{c.def}</ThemedText>
              </Animated.View>
            ) : (
              <View style={[styles.card, { borderColor: theme.border, backgroundColor: theme.card, alignItems: 'center', justifyContent: 'center' }]}>
                <ThemedText type="heading" style={{ fontSize: FontSize.body, textAlign: 'center' }}>{c.term}</ThemedText>
                <ThemedText type="label" themeColor="mutedForeground" style={{ marginTop: 6 }}>Tap to flip</ThemedText>
              </View>
            )}
          </SpringPressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two + 4 },
  cardWrap: { width: '47.5%', flexGrow: 1 },
  card: { minHeight: 118, borderRadius: Radius.lg, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.three },
});
