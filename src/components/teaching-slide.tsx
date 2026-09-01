import { useCallback, useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  type GestureResponderEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Animated, { FadeIn, FadeInDown, useReducedMotion } from 'react-native-reanimated';

import { Atlas } from '@/components/atlas';
import { AuthoredSvg } from '@/components/authored-svg';
import { LessonVisual } from '@/components/lesson-visual';
import { useLessonStepState } from '@/components/lesson-step-session';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { UIcon } from '@/components/ui-icon';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  TEACHING_SLIDE_DWELL_MS,
  TEACHING_SLIDE_SCROLL_MARGIN,
  teachingDwellRemaining,
  teachingTextSegments,
  type TeachingSlideSpec,
  type TeachingTerm,
} from '@/lib/teaching-slide';
import { SpringPressable } from '@/shared/motion/spring-pressable';

type ActiveTerm = { term: TeachingTerm; key: string; x: number; y: number };

function AtlasTermModal({ active, onClose }: { active: ActiveTerm | null; onClose: () => void }) {
  const reduced = useReducedMotion();
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const [answered, setAnswered] = useState(false);

  if (!active) return null;
  const popoverWidth = Math.min(340, width - 32);
  const popoverLeft = Math.max(16, Math.min(active.x - 150, width - popoverWidth - 16));
  const popoverTop = Math.max(72, Math.min(active.y + 8, height - 260));

  return (
    <Modal transparent animationType="none" visible onRequestClose={onClose}>
      <Pressable style={styles.scrim} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close definition">
        <Animated.View
          entering={reduced
            ? FadeIn.duration(1)
            : FadeInDown.springify().damping(30).stiffness(460).mass(1)}
          style={[styles.popoverPosition, { width: popoverWidth, left: popoverLeft, top: popoverTop }]}>
          <Pressable onPress={(event) => event.stopPropagation()} style={styles.popoverRow}>
            <Atlas size={50} expression="happy" interactive={false} />
            <View style={styles.bubble} accessible accessibilityLabel={`${active.term.term}. ${active.term.definition}`}>
              <SpringPressable
                haptic={false}
                scaleTo={0.96}
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Close definition"
                hitSlop={10}
                style={styles.close}>
                <UIcon name="close" size={15} color={theme.mutedForeground} />
              </SpringPressable>
              <ThemedText style={styles.termTitle}>{active.term.term}</ThemedText>
              <ThemedText style={styles.definition}>{active.term.definition}</ThemedText>
              {answered && active.term.example?.trim() ? (
                <Animated.View entering={reduced ? FadeIn.duration(1) : FadeInDown.duration(180)} style={styles.example}>
                  <ThemedText style={[styles.exampleText, { color: theme.mutedForeground }]}>{active.term.example}</ThemedText>
                </Animated.View>
              ) : null}
              {!answered && active.term.example?.trim() ? (
                <SpringPressable
                  haptic={false}
                  onPress={() => setAnswered(true)}
                  accessibilityRole="button"
                  accessibilityLabel={`Show an example of ${active.term.term}`}
                  style={styles.exampleButton}>
                  <ThemedText style={styles.exampleButtonText}>Show me an example</ThemedText>
                </SpringPressable>
              ) : null}
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

function AtlasRecap({ text, onDismiss }: { text: string; onDismiss: () => void }) {
  const reduced = useReducedMotion();
  return (
    <Animated.View
      entering={reduced
        ? FadeIn.duration(1)
        : FadeInDown.springify().damping(28).stiffness(380).mass(1)}
      style={styles.recap}>
      <Atlas size={52} expression="happy" interactive={false} />
      <View style={styles.recapBubble}>
        <ThemedText style={styles.recapText}>{text}</ThemedText>
        <SpringPressable
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Got it, continue lesson"
          style={styles.gotIt}>
          <ThemedText style={styles.gotItText}>Got it</ThemedText>
        </SpringPressable>
      </View>
    </Animated.View>
  );
}

export function TeachingSlide({ spec, onComplete }: { spec: TeachingSlideSpec; onComplete: () => void }) {
  const reduced = useReducedMotion();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const [deadline] = useLessonStepState('teaching.dwellDeadline', () => Date.now() + TEACHING_SLIDE_DWELL_MS);
  const [bottomReached, setBottomReached] = useLessonStepState('teaching.bottomReached', false);
  const [showRecap, setShowRecap] = useLessonStepState('teaching.showRecap', false);
  const [remaining, setRemaining] = useState(() => teachingDwellRemaining(deadline));
  const [activeTerm, setActiveTerm] = useState<ActiveTerm | null>(null);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setRemaining(teachingDwellRemaining(deadline)), 250);
    return () => clearInterval(timer);
  }, [deadline]);

  const detectBottom = useCallback((offsetY: number, viewport = viewportHeight, content = contentHeight) => {
    if (!bottomReached && viewport > 0 && content > 0 && offsetY + viewport >= content - TEACHING_SLIDE_SCROLL_MARGIN) {
      setBottomReached(true);
    }
  }, [bottomReached, contentHeight, setBottomReached, viewportHeight]);

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    detectBottom(event.nativeEvent.contentOffset.y, event.nativeEvent.layoutMeasurement.height, event.nativeEvent.contentSize.height);
  }, [detectBottom]);

  const ready = bottomReached && remaining === 0;
  const ctaLabel = bottomReached && remaining > 0 ? `Continue in ${String(remaining)}s` : 'Continue →';
  const completeOrRecap = () => {
    if (spec.atlas?.recap && !showRecap) setShowRecap(true);
    else onComplete();
  };

  return (
    <Animated.View entering={reduced ? FadeIn.duration(1) : FadeInDown.duration(300)} style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        onLayout={(event) => {
          const next = event.nativeEvent.layout.height;
          setViewportHeight(next);
          detectBottom(0, next, contentHeight);
        }}
        onContentSizeChange={(_, height) => {
          setContentHeight(height);
          detectBottom(0, viewportHeight, height);
        }}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.content}>
        <ThemedText type="title" style={styles.title}>{spec.title}</ThemedText>
        <View style={styles.paragraphs}>
          {spec.paragraphs.map((paragraph, paragraphIndex) => (
            <ThemedText key={`${String(paragraphIndex)}-${paragraph.slice(0, 20)}`} type="body" style={styles.paragraph}>
              {teachingTextSegments(paragraph, spec.highlightedTerms).map((segment, segmentIndex) => segment.kind === 'text'
                ? segment.text
                : (
                  <ThemedText
                    key={`${segment.term.term}-${String(segmentIndex)}`}
                    onPress={(event: GestureResponderEvent) => setActiveTerm((current) => current?.key === `${String(paragraphIndex)}-${String(segmentIndex)}`
                      ? null
                      : {
                          term: segment.term,
                          key: `${String(paragraphIndex)}-${String(segmentIndex)}`,
                          x: event.nativeEvent.pageX,
                          y: event.nativeEvent.pageY,
                        })}
                    accessibilityRole="button"
                    accessibilityLabel={`${segment.text}, tap for definition`}
                    style={[styles.inlineTerm, { color: theme.iconLilac }]}>
                    {segment.text}
                  </ThemedText>
                ))}
            </ThemedText>
          ))}
        </View>

        {spec.diagramVisual || spec.diagramSvg ? (
          <View style={styles.diagram} accessible={false}>
            {spec.diagramVisual ? <LessonVisual visual={spec.diagramVisual} bare /> : null}
            {!spec.diagramVisual && spec.diagramSvg ? <AuthoredSvg xml={spec.diagramSvg} label={spec.diagramDescription || spec.title} /> : null}
            {width >= 1280 && spec.atlas?.hint ? (
              <View style={styles.wideGuide} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                <Atlas size={54} expression="watching" interactive={false} />
                <View style={styles.guideBubble}><ThemedText style={styles.guideText}>{spec.atlas.hint}</ThemedText></View>
              </View>
            ) : null}
          </View>
        ) : null}

        {showRecap && spec.atlas?.recap ? <AtlasRecap text={spec.atlas.recap} onDismiss={onComplete} /> : null}
        <Button label={ctaLabel} disabled={!ready || showRecap} onPress={completeOrRecap} style={styles.cta} />
      </ScrollView>
      <AtlasTermModal key={activeTerm?.key ?? 'closed'} active={activeTerm} onClose={() => setActiveTerm(null)} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, width: '100%' },
  content: { width: '100%', maxWidth: 800, alignSelf: 'center', paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32 },
  title: { fontSize: 24, lineHeight: 32, marginBottom: 20 },
  paragraphs: { gap: 16 },
  paragraph: { color: 'rgba(244,244,245,0.90)', fontSize: 14, lineHeight: 23 },
  inlineTerm: { fontFamily: Fonts.medium, textDecorationLine: 'underline', textDecorationStyle: 'dotted' },
  diagram: { position: 'relative', width: '100%', marginTop: 20, padding: 20, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(139,92,246,0.15)' },
  wideGuide: { position: 'absolute', left: '100%', top: '35%', marginLeft: 24, width: 150, alignItems: 'center', gap: 8 },
  guideBubble: { backgroundColor: '#14121C', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8 },
  guideText: { color: '#F2EFF7', fontFamily: Fonts.semibold, fontSize: 12.5, lineHeight: 16 },
  cta: { alignSelf: 'center', minWidth: 160, marginTop: 24, marginBottom: 24, paddingHorizontal: 32 },
  scrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.26)' },
  popoverPosition: { position: 'absolute' },
  popoverRow: { width: '100%', maxWidth: 340, alignSelf: 'center', flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  bubble: { position: 'relative', flex: 1, minWidth: 0, borderRadius: 16, borderTopLeftRadius: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', backgroundColor: '#14121C', paddingHorizontal: 16, paddingVertical: 14 },
  close: { position: 'absolute', right: 10, top: 10, zIndex: 2 },
  termTitle: { paddingRight: 24, color: '#C57FF3', fontFamily: Fonts.black, fontSize: 13.5, lineHeight: 18 },
  definition: { marginTop: 6, color: '#F2EFF7', fontSize: 13, lineHeight: 20 },
  example: { marginTop: 10, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,255,255,0.1)' },
  exampleText: { fontSize: 12.5, lineHeight: 19, fontStyle: 'italic' },
  exampleButton: { alignSelf: 'flex-start', marginTop: 12, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 6 },
  exampleButtonText: { color: '#F2EFF7', fontFamily: Fonts.semibold, fontSize: 11.5, lineHeight: 15 },
  recap: { width: '100%', flexDirection: 'row', alignItems: 'flex-end', gap: 12, marginTop: 20 },
  recapBubble: { flex: 1, borderRadius: 16, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', backgroundColor: '#14121C', paddingHorizontal: 16, paddingVertical: 14 },
  recapText: { color: '#F2EFF7', fontSize: 13.5, lineHeight: 20 },
  gotIt: { alignSelf: 'flex-start', marginTop: 12, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)', paddingHorizontal: 14, paddingVertical: 7 },
  gotItText: { color: '#F2EFF7', fontFamily: Fonts.semibold, fontSize: 12.5, lineHeight: 16 },
});
