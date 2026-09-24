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

/** True when two authored strings say the same thing, ignoring case and punctuation. */
function sameWords(a?: string, b?: string): boolean {
  const norm = (x?: string) => String(x ?? '').toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
  const left = norm(a);
  return left.length > 0 && left === norm(b);
}

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
  tight,
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
  /** Smallest padding that still reads as a card. Set on screens under 720pt. */
  tight?: boolean;
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
      style={[styles.panel, tight && styles.panelTight, { minHeight, borderColor: color + '4D', backgroundColor: color + '0A' }]}>
      <View style={styles.panelHeading}>
        <UIcon name={positive ? 'check' : 'close'} size={20} color={color} strokeWidth={3} />
        {heading ? <ThemedText type="smallBold" style={{ color }}>{heading}</ThemedText> : null}
      </View>
      {/*
        THE CEILING BELONGS TO THE CHART, NOT TO THE STAGE.
        It was on this View, which also contains Atlas's tapped explanation. A maxHeight does not
        shorten that bubble, and RN leaves overflow visible on iOS, so a learner who tapped a point
        on the Microsoft chart got the explanation painted straight over the "Allocate cash well"
        label below it. Handing the cap to LessonVisual leaves the chart just as constrained and
        lets the explanation push the panel taller, which the surrounding ScrollView already allows.
      */}
      <View style={styles.visualStage}>
        {visual ? <LessonVisual visual={visual} bare chartMaxHeight={visualMaxHeight} /> : null}
        {!visual && svg ? (
          <View style={visualMaxHeight ? { maxHeight: visualMaxHeight, width: '100%' } : undefined}>
            <AuthoredSvg xml={svg} label={`${heading} chart`} />
          </View>
        ) : null}
      </View>
      {/*
        THE LABEL IS DROPPED WHEN THE VISUAL ALREADY SAYS IT.
        51 of the 600 panels in the corpus render a chart titled "Without a Budget" and then the
        words "Without a budget" directly underneath it. That is a wasted line on every screen and
        a line that does not fit on a short one: on a 667pt SE it was the element overlapping the
        pinned Continue button.
        Compared case and punctuation insensitively, because the two are authored separately and
        differ only in capitalisation.
      */}
      {sameWords(label, visual?.title) ? null : <ThemedText type="bodyMedium">{label}</ThemedText>}
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

  /*
   * A SHORT SCREEN NEEDS MORE THAN A PROPORTIONAL SHRINK.
   *
   * Everything above was measured on an 874pt iPhone, where the column ends around y=780 against a
   * footer at 778. An SE is 667pt, and on it the same card ran to 661 with the second panel's label
   * overlapping the Continue button: the header and the footer are FIXED costs, so a 207pt shorter
   * screen loses 207pt of content space rather than a proportional share of it.
   *
   * Below 720pt the paddings and gaps drop to the smallest values that still read as separate
   * cards. The threshold is the window height rather than a device name so a future size gets the
   * right treatment without anyone updating a list.
   */
  const shortScreen = !sideBySide && height < 720;

  return (
    <View style={styles.shell}>
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, shortScreen && styles.contentTight]}
      showsVerticalScrollIndicator={false}>
      <ThemedText type="title" style={[styles.title, shortScreen && styles.titleTight]}>Why This Matters</ThemedText>
      <View style={[styles.panels, sideBySide && styles.panelsWide, shortScreen && styles.panelsTight]}>
        <StakesPanel
          positive={false}
          heading={spec.withoutLabel}
          label={spec.without.label}
          detail={spec.without.detail}
          visual={spec.withoutVisual}
          svg={spec.withoutSvg}
          showDetail={showDetail}
          minHeight={panelMinHeight}
          visualMaxHeight={shortScreen ? Math.round(height * 0.15) : visualMaxHeight}
          tight={shortScreen}
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
          visualMaxHeight={shortScreen ? Math.round(height * 0.15) : visualMaxHeight}
          tight={shortScreen}
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
  /*
   * MEASURED TWICE, because the first pass was not enough.
   *
   * Tightening to gap 8 / padding 10 fixed the budgeting card on a 667pt SE but not the compound
   * interest one, whose panel labels run to two lines: content still reached y=630 against a
   * Continue at 611, a 19pt overlap. The labels cannot be trimmed, they carry the comparison
   * ("Starting at age 22, investing $400/month"), so the room has to come from the chrome.
   * These values clear it with content ending near 600.
   */
  contentTight: { gap: 6, paddingTop: 2, paddingBottom: 64 },
  panelsTight: { gap: 6 },
  panelTight: { padding: 8, gap: 4 },
  title: { textAlign: 'center' },
  titleTight: { fontSize: 20, lineHeight: 26 },
  panels: { width: '100%', maxWidth: 1100, flexDirection: 'column', gap: 14 },
  panelsWide: { flexDirection: 'row' },
  panel: { flex: 1, gap: 10, padding: 16, borderWidth: 2, borderRadius: 16 },
  panelHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  visualStage: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  detail: { lineHeight: 20 },
  continueButton: { minWidth: 180 },
});
