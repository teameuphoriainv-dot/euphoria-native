/**
 * <EmptyState> — the one way to fill an empty screen or list. Owner: the lone small grey sentence
 * floating in empty space read as generated UI. Duolingo's empty states are a clear line in the
 * text colour plus something to DO, so this is a heading-weight line in theme.text, an optional
 * short sub, and optional suggestion chips that act.
 */
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { SpringPressable } from '@/shared/motion/spring-pressable';

export function EmptyState({
  title,
  sub,
  suggestions,
  onSuggestion,
}: {
  title: string;
  sub?: string;
  /** Tappable chips, e.g. search terms. */
  suggestions?: readonly string[];
  onSuggestion?: (s: string) => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.wrap}>
      <ThemedText type="heading" style={styles.center}>{title}</ThemedText>
      {sub ? <ThemedText type="body" themeColor="mutedForeground" style={styles.center}>{sub}</ThemedText> : null}
      {suggestions?.length ? (
        <View style={styles.chips}>
          {suggestions.map((s) => (
            <SpringPressable
              key={s}
              sink={2}
              scaleTo={1}
              onPress={() => onSuggestion?.(s)}
              accessibilityRole="button"
              accessibilityLabel={`Search ${s}`}>
              <View style={[styles.chip, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <ThemedText type="bodyMedium">{s}</ThemedText>
              </View>
            </SpringPressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.five, paddingHorizontal: Spacing.three },
  center: { textAlign: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: Spacing.two, marginTop: Spacing.two },
  // Duolingo chip anatomy at chip scale: 2px edge, 4px bottom.
  chip: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: Radius.pill, borderWidth: 2, borderBottomWidth: 4 },
});
