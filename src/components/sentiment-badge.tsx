/**
 * The Alpha Vantage sentiment chip, and the `ago()` clock that always sits beside it.
 *
 * WHY THIS IS A COMPONENT AND NOT COPIED TWICE. Two screens render article rows — `news.tsx` (the
 * full wire) and the Trade tab's holdings feed. The badge encodes a real editorial rule: the
 * ±0.15 dead band that decides when a score counts as bullish or bearish at all. Duplicated, the
 * two screens would drift the moment anyone tuned that threshold, and the same article would read
 * BULLISH on one screen and neutral on the other. That is C1/C2's defect exactly — two systems
 * rendering the same idea slightly differently, which no type-checker catches and no single
 * screenshot reveals.
 *
 * Sentiment is the whole reason Alpha Vantage is the preferred provider: a headline says what
 * happened, the label says how the market read it, and that second part is what a learner cannot
 * infer yet. Polygon articles carry no score, so the chip renders NOTHING rather than guessing a
 * neutral — an invented reading is worse than an absent one.
 */
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** The dead band. Scores inside ±0.15 are noise, and colouring them would overstate the signal. */
const BAND = 0.15;

/** "3h ago". Absolute timestamps make a reader do arithmetic to answer "is this stale?". */
export function ago(iso: string, now: number): string {
  const ms = now - new Date(iso).getTime();
  if (!Number.isFinite(ms) || ms < 0) return '';
  const m = Math.floor(ms / 60000);
  if (m < 60) return `${Math.max(1, m)}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function SentimentBadge({ score, label }: { score?: number; label?: string }) {
  const theme = useTheme();
  if (!label) return null;

  const v = score ?? 0;
  const tone =
    v > BAND
      ? { fg: theme.success, bg: theme.success + '22' }
      : v < -BAND
        ? { fg: theme.destructive, bg: theme.destructive + '22' }
        : { fg: theme.mutedForeground, bg: theme.muted };

  return (
    <View style={[styles.chip, { backgroundColor: tone.bg }]}>
      <ThemedText type="smallBold" style={{ fontSize: 10, color: tone.fg }}>
        {label.toUpperCase()}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.sm },
});
