/**
 * Renders the text side of a curriculum step. `teachingSlide`, `hookOpener`, `caseStudy`,
 * `misconceptions`, `summaryCards`, `stakesCard` and friends all reduce to the same handful of
 * blocks (see lib/lesson-steps.ts).
 */
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, FadeInLeft, FadeInRight, useReducedMotion } from 'react-native-reanimated';

import { Atlas } from '@/components/atlas';
import { AuthoredSvg } from '@/components/authored-svg';
import { LessonVisual } from '@/components/lesson-visual';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Radius, Spacing, FontSize } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ProseBlock } from '@/lib/lesson-steps';

/** footer padding (24) + button (56) + breathing room — keeps the last line clear of the CTA */
const CTA_CLEARANCE = 104;

export function LessonProse({
  label,
  title,
  blocks,
  atlasHint,
}: {
  label?: string;
  title: string;
  blocks: ProseBlock[];
  atlasHint?: string;
}) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const { width, height } = useWindowDimensions();
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

          if (b.b === 'visual') return <LessonVisual key={i} visual={b.visual} />;

          if (b.b === 'svg') return <AuthoredSvg key={i} xml={b.xml} label={b.label} />;

          if (b.b === 'stat')
            return (
              <Card key={i} elevated style={styles.stat}>
                <ThemedText type="display" style={{ fontSize: FontSize.displaySm, color: theme.iconLilac }}>{b.value}</ThemedText>
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
              <View key={i} style={[styles.pairRow, width >= 1024 && styles.pairRowWide]}>
                <Animated.View
                  entering={b.stakes ? (reduced ? FadeIn.duration(200) : FadeInLeft.delay(300).duration(280)) : undefined}
                  style={styles.pairWrapper}>
                <Card style={[styles.pairCell, b.stakes && styles.stakesCell, b.stakes && { minHeight: height * 0.55, backgroundColor: theme.destructive + '0A' }, { borderColor: theme.destructive + '4D' }]}>
                  <ThemedText type="label" style={{ color: theme.destructive }}>{b.leftLabel.toUpperCase()}</ThemedText>
                  {b.leftVisual ? <LessonVisual visual={b.leftVisual} /> : null}
                  {b.leftSvg ? <AuthoredSvg xml={b.leftSvg.xml} label={b.leftSvg.label} /> : null}
                  <ThemedText type="body" style={{ marginTop: 4 }}>{b.left}</ThemedText>
                </Card>
                </Animated.View>
                <Animated.View
                  entering={b.stakes ? (reduced ? FadeIn.duration(200) : FadeInRight.delay(300).duration(280)) : undefined}
                  style={styles.pairWrapper}>
                <Card style={[styles.pairCell, b.stakes && styles.stakesCell, b.stakes && { minHeight: height * 0.55, backgroundColor: theme.success + '0A' }, { borderColor: theme.success + '4D' }]}>
                  <ThemedText type="label" style={{ color: theme.success }}>{b.rightLabel.toUpperCase()}</ThemedText>
                  {b.rightVisual ? <LessonVisual visual={b.rightVisual} /> : null}
                  {b.rightSvg ? <AuthoredSvg xml={b.rightSvg.xml} label={b.rightSvg.label} /> : null}
                  <ThemedText type="body" style={{ marginTop: 4 }}>{b.right}</ThemedText>
                </Card>
                </Animated.View>
              </View>
            );

          // event
          return (
            <View key={i} style={styles.eventRow}>
              <View style={[styles.when, { backgroundColor: theme.primary + '1F' }]}>
                <ThemedText type="smallBold" style={{ color: theme.iconLilac, fontSize: FontSize.label, lineHeight: 15 }}>{b.when}</ThemedText>
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText type="bodyMedium">{b.what}</ThemedText>
                {b.detail ? <ThemedText type="small" themeColor="mutedForeground" style={{ marginTop: 2 }}>{b.detail}</ThemedText> : null}
              </View>
            </View>
          );
        })}
        {atlasHint ? (
          <View style={styles.atlasHint}>
            <Atlas size={44} expression="watching" interactive={false} />
            <Card style={[styles.atlasHintBubble, { borderColor: theme.primary + '3D' }]}>
              <ThemedText type="small" themeColor="textSecondary">{atlasHint}</ThemedText>
            </Card>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  stat: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  pairRow: { flexDirection: 'column', gap: 24 },
  pairRowWide: { flexDirection: 'row' },
  pairWrapper: { flex: 1 },
  pairCell: { flex: 1, gap: 16, borderWidth: 1, borderRadius: Radius.lg },
  stakesCell: { minHeight: 420, padding: 32, borderWidth: 2, borderRadius: 16 },
  eventRow: { flexDirection: 'row', gap: Spacing.two + 4, alignItems: 'flex-start' },
  when: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.pill, minWidth: 58, alignItems: 'center' },
  atlasHint: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two },
  atlasHintBubble: { flex: 1, borderWidth: StyleSheet.hairlineWidth },
});
