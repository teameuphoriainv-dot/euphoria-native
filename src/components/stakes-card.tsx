import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, FadeInLeft, FadeInRight, useReducedMotion } from 'react-native-reanimated';

import { AuthoredSvg } from '@/components/authored-svg';
import { LessonVisual } from '@/components/lesson-visual';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { UIcon } from '@/components/ui-icon';
import { useTheme } from '@/hooks/use-theme';
import type { StakesCardSpec } from '@/lib/lesson-steps';

const DIAGRAM_DWELL_SECONDS = 15;

/** Wall-time gate matching production useDwellGate(DWELL.diagram). */
function useDiagramDwell() {
  const [remaining, setRemaining] = useState(DIAGRAM_DWELL_SECONDS);
  useEffect(() => {
    const startedAt = Date.now();
    const timer = setInterval(() => {
      const next = Math.max(0, DIAGRAM_DWELL_SECONDS - Math.floor((Date.now() - startedAt) / 1000));
      setRemaining(next);
      if (next === 0) clearInterval(timer);
    }, 250);
    return () => clearInterval(timer);
  }, []);
  return remaining;
}

function StakesPanel({
  positive,
  heading,
  label,
  detail,
  visual,
  svg,
  showDetail,
  minHeight,
}: {
  positive: boolean;
  heading: string;
  label: string;
  detail: string;
  visual?: StakesCardSpec['withVisual'];
  svg?: string;
  showDetail: boolean;
  minHeight: number;
}) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const color = positive ? theme.success : theme.destructive;
  const entrance = reduced
    ? FadeIn.duration(0)
    : positive
      ? FadeInRight.delay(500).duration(280)
      : FadeInLeft.delay(300).duration(280);
  return (
    <Animated.View
      entering={entrance}
      style={[styles.panel, { minHeight, borderColor: color + '4D', backgroundColor: color + '0A' }]}>
      <View style={styles.panelHeading}>
        <UIcon name={positive ? 'check' : 'close'} size={20} color={color} strokeWidth={3} />
        <ThemedText type="smallBold" style={{ color }}>{heading}</ThemedText>
      </View>
      <View style={styles.visualStage}>
        {visual ? <LessonVisual visual={visual} bare /> : null}
        {!visual && svg ? <AuthoredSvg xml={svg} label={`${heading} chart`} /> : null}
      </View>
      <ThemedText type="bodyMedium">{label}</ThemedText>
      {showDetail ? <ThemedText type="small" themeColor="textSecondary" style={styles.detail}>{detail}</ThemedText> : null}
    </Animated.View>
  );
}

export function StakesCard({ spec, onComplete }: { spec: StakesCardSpec; onComplete: () => void }) {
  const { width, height } = useWindowDimensions();
  const remaining = useDiagramDwell();
  // Production deliberately hides both explanatory paragraphs when either authored visual exists.
  const showDetail = !spec.withoutVisual && !spec.withVisual;
  const panelMinHeight = Math.max(420, height * 0.55);
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ThemedText type="title" style={styles.title}>Why This Matters</ThemedText>
      <View style={[styles.panels, width >= 1024 && styles.panelsWide]}>
        <StakesPanel
          positive={false}
          heading={spec.withoutLabel}
          label={spec.without.label}
          detail={spec.without.detail}
          visual={spec.withoutVisual}
          svg={spec.withoutSvg}
          showDetail={showDetail}
          minHeight={panelMinHeight}
        />
        <StakesPanel
          positive
          heading={spec.withLabel}
          label={spec.with.label}
          detail={spec.with.detail}
          visual={spec.withVisual}
          svg={spec.withSvg}
          showDetail={showDetail}
          minHeight={panelMinHeight}
        />
      </View>
      <Button
        label={remaining > 0 ? `Continue in ${String(remaining)}s` : 'Continue'}
        disabled={remaining > 0}
        onPress={onComplete}
        style={styles.continueButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { flexGrow: 1, alignItems: 'center', gap: 24, paddingHorizontal: 8, paddingTop: 16, paddingBottom: 48 },
  title: { textAlign: 'center' },
  panels: { width: '100%', maxWidth: 1100, flexDirection: 'column', gap: 24 },
  panelsWide: { flexDirection: 'row' },
  panel: { flex: 1, gap: 16, padding: 32, borderWidth: 2, borderRadius: 16 },
  panelHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  visualStage: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  detail: { lineHeight: 20 },
  continueButton: { minWidth: 180 },
});
