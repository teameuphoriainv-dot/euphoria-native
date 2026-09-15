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

/**
 * SIX SECONDS, NOT FIFTEEN.
 *
 * The gate exists so a learner cannot skim past a diagram without looking at it, and that is worth
 * keeping. Fifteen was the web number, on a screen where the whole comparison is visible at once
 * and the reader has a mouse hovering over Continue. On a phone the same wait reads as the app
 * being broken: Sriyan sent a screenshot of a greyed-out "Continue in 5s" asking for it to be
 * shorter, and at that point the button had already been counting for ten seconds.
 *
 * Six is long enough that the eye has to land on the content and short enough that nobody wonders
 * whether the app has frozen.
 */
const DIAGRAM_DWELL_SECONDS = 6;

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
  visualMaxHeight,
}: {
  positive: boolean;
  heading: string;
  label: string;
  detail: string;
  visual?: StakesCardSpec['withVisual'];
  svg?: string;
  showDetail: boolean;
  /** Only set when the panels share a row. Stacked panels size to their content. */
  minHeight?: number;
  /** Caps the authored visual when the panels are stacked, so two of them still fit one screen. */
  visualMaxHeight?: number;
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
        {heading ? <ThemedText type="smallBold" style={{ color }}>{heading}</ThemedText> : null}
      </View>
      <View style={[styles.visualStage, visualMaxHeight ? { maxHeight: visualMaxHeight } : null]}>
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

  /*
   * THE MINIMUM HEIGHT ONLY APPLIES WHEN THE PANELS SIT SIDE BY SIDE.
   *
   * It used to be unconditional: `Math.max(420, height * 0.55)`. Side by side that is right, each
   * panel takes a little over half the viewport and they share one row. Stacked, which is what
   * happens on every phone, it guarantees the screen cannot fit: on an 852pt iPhone it forces each
   * panel to 469pt, so two panels are 938pt of a 852pt screen before the title, the gaps and the
   * button. Measured on device, the content ran to y=1253 and the Continue button sat roughly 400pt
   * below the fold while its own 15 second countdown ticked out of sight.
   *
   * Stacked panels size to their content, which is what a column of cards should do anyway.
   */
  const sideBySide = width >= 1024;
  const panelMinHeight = sideBySide ? Math.max(420, height * 0.55) : undefined;

  /*
   * STACKED PANELS SHARE ONE SCREEN, so the authored visual inside each one gets a ceiling.
   *
   * `visualStage` is `flex: 1` with no cap, so the panel is as tall as whatever LessonVisual draws.
   * Side by side that is fine. Stacked, two uncapped visuals plus two labels plus the title ran
   * past the bottom of the viewport and the second panel's label sat clipped under the pinned
   * Continue button, which reads as a broken screen even though it scrolls.
   *
   * A quarter of the window height each leaves room for both panels, their labels, the title and
   * the button on a 852pt iPhone, and it scales down rather than staying a magic constant on a
   * smaller device.
   */
  const visualMaxHeight = sideBySide ? undefined : Math.round(height * 0.25);

  return (
    <View style={styles.shell}>
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ThemedText type="title" style={styles.title}>Why This Matters</ThemedText>
      <View style={[styles.panels, sideBySide && styles.panelsWide]}>
        <StakesPanel
          positive={false}
          heading={spec.withoutLabel}
          label={spec.without.label}
          detail={spec.without.detail}
          visual={spec.withoutVisual}
          svg={spec.withoutSvg}
          showDetail={showDetail}
          minHeight={panelMinHeight}
          visualMaxHeight={visualMaxHeight}
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
          visualMaxHeight={visualMaxHeight}
        />
      </View>
    </ScrollView>
    {/*
      CONTINUE IS PINNED, NOT SCROLLED.
      It used to be the last child of the scroll view, so on a phone it scrolled away with the
      content and the learner had to find it 400pt below the fold. Worse, it is the control that
      carries the dwell countdown, so the one thing telling them the wait was finite was the one
      thing they could not see.
    */}
    <View style={styles.footer}>
      <Button
        label={remaining > 0 ? `Continue in ${String(remaining)}s` : 'Continue'}
        disabled={remaining > 0}
        onPress={onComplete}
        style={styles.continueButton}
      />
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  scroll: { flex: 1 },
  /*
   * The bottom padding CLEARS THE PINNED FOOTER, it is not decoration.
   * Pinning Continue outside the scroll fixed it falling below the fold, and immediately created
   * the opposite bug: the scroll still ran the full height of the shell, so the last line of the
   * second panel sat underneath the button with no way to scroll it into view. 96 is the footer's
   * own height plus its padding, with a little room.
   */
  /*
   * MEASURED, not chosen. On a 402x874 iPhone the two stacked panels come to about 319pt and 230pt.
   * With the old 24pt gaps, 32pt panel padding and 16pt top padding the column ended around y=790
   * against a footer whose top edge is 778, so the second panel's label sat clipped under the
   * button by roughly 12pt. That reads as a broken screen rather than as a scrollable one.
   * These numbers reclaim about 40pt, which clears it with room, and the bottom padding is the
   * footer's own height so a longer authored panel can still scroll fully into view.
   */
  content: { flexGrow: 1, alignItems: 'center', gap: 14, paddingHorizontal: 8, paddingTop: 8, paddingBottom: 96 },
  footer: { paddingTop: 8, paddingBottom: 12, alignItems: 'center' },
  title: { textAlign: 'center' },
  panels: { width: '100%', maxWidth: 1100, flexDirection: 'column', gap: 14 },
  panelsWide: { flexDirection: 'row' },
  panel: { flex: 1, gap: 10, padding: 16, borderWidth: 2, borderRadius: 16 },
  panelHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  visualStage: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  detail: { lineHeight: 20 },
  continueButton: { minWidth: 180 },
});
