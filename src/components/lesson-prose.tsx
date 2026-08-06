/**
 * Renders the text side of a curriculum step. `teachingSlide`, `hookOpener`, `caseStudy`,
 * `misconceptions`, `summaryCards`, `stakesCard` and friends are ~40% of all 5,341 steps, and they
 * all reduce to the same handful of blocks (see lib/lesson-steps.ts).
 */
import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ProseBlock } from '@/lib/lesson-steps';

/** footer padding (24) + button (56) + breathing room — keeps the last line clear of the CTA */
const CTA_CLEARANCE = 104;

export function LessonProse({ label, title, blocks }: { label?: string; title: string; blocks: ProseBlock[] }) {
  const theme = useTheme();
  return (
    // the CTA is a sibling pinned below this view, so the last paragraph needs its height as
    // padding or long teachingSlides scroll their final line underneath the button
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: CTA_CLEARANCE }}>
      {label ? (
        <ThemedText type="label" style={{ color: theme.iconLilac, marginBottom: Spacing.one }}>
          {label.toUpperCase()}
        </ThemedText>
      ) : null}
      <ThemedText type="title" style={{ marginBottom: Spacing.three }}>{title}</ThemedText>

      <View style={{ gap: Spacing.three }}>
        {blocks.map((b, i) => {
          if (b.b === 'p') return <ThemedText key={i} type="body" themeColor="textSecondary">{b.text}</ThemedText>;

          if (b.b === 'stat')
            return (
              <Card key={i} elevated style={styles.stat}>
                <ThemedText type="display" style={{ fontSize: 28, color: theme.iconLilac }}>{b.value}</ThemedText>
                <ThemedText type="small" themeColor="mutedForeground" style={{ flex: 1 }}>{b.label}</ThemedText>
              </Card>
            );

          if (b.b === 'term')
            return (
              <Card key={i} style={{ gap: 4 }}>
                <ThemedText type="smallBold" style={{ color: theme.iconLilac }}>{b.term}</ThemedText>
                <ThemedText type="body">{b.definition}</ThemedText>
                {b.example ? <ThemedText type="small" themeColor="mutedForeground">{b.example}</ThemedText> : null}
              </Card>
            );

          if (b.b === 'pair')
            return (
              <View key={i} style={styles.pairRow}>
                <Card style={[styles.pairCell, { borderColor: theme.destructive + '3D' }]}>
                  <ThemedText type="label" style={{ color: theme.destructive }}>{b.leftLabel.toUpperCase()}</ThemedText>
                  <ThemedText type="body" style={{ marginTop: 4 }}>{b.left}</ThemedText>
                </Card>
                <Card style={[styles.pairCell, { borderColor: theme.success + '3D' }]}>
                  <ThemedText type="label" style={{ color: theme.success }}>{b.rightLabel.toUpperCase()}</ThemedText>
                  <ThemedText type="body" style={{ marginTop: 4 }}>{b.right}</ThemedText>
                </Card>
              </View>
            );

          // event
          return (
            <View key={i} style={styles.eventRow}>
              <View style={[styles.when, { backgroundColor: theme.primary + '1F' }]}>
                <ThemedText type="smallBold" style={{ color: theme.iconLilac, fontSize: 11 }}>{b.when}</ThemedText>
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText type="bodyMedium">{b.what}</ThemedText>
                {b.detail ? <ThemedText type="small" themeColor="mutedForeground" style={{ marginTop: 2 }}>{b.detail}</ThemedText> : null}
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  stat: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  pairRow: { flexDirection: 'row', gap: Spacing.two },
  pairCell: { flex: 1, borderWidth: 1, borderRadius: Radius.lg },
  eventRow: { flexDirection: 'row', gap: Spacing.two + 4, alignItems: 'flex-start' },
  when: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.pill, minWidth: 58, alignItems: 'center' },
});
