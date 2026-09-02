/**
 * Entry points into Atlas chat.
 *
 * One component, six placements. The alternative — a bespoke button per screen — is how you end up
 * with six slightly different Atlas affordances that drift apart, and it is six places to fix when
 * the route changes.
 *
 * Deliberately NOT a floating action button. This app measures tab-bar clearance carefully (the
 * Home rail was moved 801 -> 701 to clear it by 118pt), and a FAB would sit on top of content on
 * every tab. The header slot is empty on all five tabs and collides with nothing.
 *
 * `topic` is the CONTEXT the chat header shows. 4/5 of the ScreensDesign reference apps put the
 * subject you arrived from in the chat header rather than a generic title — Astra AI shows
 * 'Ask / Computer Science', Answer.AI shows the lesson name. Passing it here is what makes that
 * possible, so pass it wherever the screen knows what the user is looking at.
 */
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { Atlas } from '@/components/atlas';
import { AtlasSpeech } from '@/components/atlas-speech';
import { LessonAtlasSheet } from '@/components/lesson-atlas-sheet';
import {
  lessonAtlasContextKey,
  lessonAtlasProactivePrompt,
} from '@/components/lesson-atlas-sheet-model';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { AtlasLessonContext } from '@/lib/atlas-lesson-context';
import { SpringPressable } from '@/shared/motion/spring-pressable';

export { buildAtlasLessonContext } from '@/lib/atlas-lesson-context';
export type { AtlasLessonContext } from '@/lib/atlas-lesson-context';

/** The only place the chat route is constructed. Home drives this directly because it already has
 *  an Atlas in its greeting — a second Atlas button beside the first would be absurd. */
export function openAtlasChat(topic?: string, context?: AtlasLessonContext) {
  if (topic || context) {
    router.push({
      pathname: context ? '/lesson-atlas' : '/chat',
      params: {
        ...(topic ? { topic } : {}),
        ...(context ? { lessonContext: JSON.stringify(context) } : {}),
      },
    });
    return;
  }
  router.push('/chat');
}

const open = openAtlasChat;
const PROACTIVE_SHOW_AT_MS = 1200;
const PROACTIVE_HIDE_AT_MS = 8200;

/** Compact circular Atlas, for a screen header. */
export function AskAtlasButton({ topic, context }: { topic?: string; context?: AtlasLessonContext }) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const label = context
    ? `Ask Atlas about step ${context.step.index + 1} of ${context.lessonTitle}`
    : topic ? `Ask Atlas about ${topic}` : 'Ask Atlas';

  // Match the web lesson trigger: Atlas himself is the button and reacts on touch. Keeping this
  // branch separate avoids nesting the mascot's Pressable inside SpringPressable, which would make
  // one gesture compete between opening the tutor and playing Atlas's reaction.
  if (context) {
    return (
      <Atlas
        size={48}
        expression="watching"
        interactive
        onPress={() => open(topic, context)}
        accessibilityLabel={label}
        accessibilityHint="Opens a tutor grounded in the current lesson step"
      />
    );
  }

  return (
    <SpringPressable
      haptic={false}
      scaleTo={reduced ? 1 : 0.9}
      onPress={() => { open(topic, context); }}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={[styles.round, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Atlas size={26} expression="watching" interactive={false} />
      </View>
    </SpringPressable>
  );
}

/** The web lesson mascot is a floating tutor, not another item squeezed into the progress header.
 * It speaks only at the same three useful moments, after the step has had 1.2s to settle. Reusing
 * AtlasSpeech keeps the verified pop and typewriter behavior consistent with onboarding. */
export function LessonAtlasButton({ context }: { topic: string; context: AtlasLessonContext }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [speechCycle, setSpeechCycle] = useState(0);
  const [hiddenPromptKey, setHiddenPromptKey] = useState<string | null>(null);
  const says = lessonAtlasProactivePrompt(context);
  const contextKey = lessonAtlasContextKey(context);
  const promptKey = `${contextKey}:${String(context.attempt.attempted)}:${String(context.attempt.wasCorrect)}:${String(context.recentMistakes.length)}:${String(speechCycle)}`;
  const promptVisible = Boolean(says) && !sheetOpen && hiddenPromptKey !== promptKey;

  useEffect(() => {
    if (!promptVisible) return;
    const hideAt = setTimeout(() => setHiddenPromptKey(promptKey), PROACTIVE_HIDE_AT_MS);
    return () => clearTimeout(hideAt);
  }, [promptKey, promptVisible]);

  const dismissSheet = () => {
    setSheetOpen(false);
    // The live tutor begins a fresh 1.2s → 8.2s proactive window after it closes.
    setSpeechCycle((current) => current + 1);
  };

  return (
    <View pointerEvents="box-none" style={styles.lessonTrigger}>
      {promptVisible && says ? (
        <View key={promptKey} pointerEvents="none" style={styles.lessonSpeech}>
          <AtlasSpeech
            text={says}
            delay={PROACTIVE_SHOW_AT_MS}
            tail="bottom"
            tailAlign="center"
            maxWidth={230}
            textStyle={styles.lessonSpeechText}
          />
        </View>
      ) : null}
      <Atlas
        size={52}
        expression={promptVisible ? 'happy' : 'watching'}
        interactive
        onPress={() => setSheetOpen(true)}
        accessibilityLabel={`Ask Atlas about step ${String(context.step.index + 1)} of ${context.lessonTitle}`}
        accessibilityHint="Opens a tutor grounded in the current lesson step"
      />
      <LessonAtlasSheet
        key={contextKey}
        context={context}
        onDismiss={dismissSheet}
        visible={sheetOpen}
      />
    </View>
  );
}

/**
 * Full-width row, for the end of a lesson or an article — the moment a question is most likely.
 * Gauth ($600k/mo) puts its escalation exactly here, at the point the user might still be stuck,
 * rather than leaving them to go hunting for help.
 */
export function AskAtlasRow({ topic, label, context }: { topic?: string; label?: string; context?: AtlasLessonContext }) {
  const theme = useTheme();
  return (
    <SpringPressable
      haptic={false}
      onPress={() => open(topic, context)}
      accessibilityRole="button"
      accessibilityLabel={label ?? (topic ? `Ask Atlas about ${topic}` : 'Ask Atlas')}
    >
      <View style={[styles.row, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Atlas size={34} expression="watching" interactive={false} />
        <View style={styles.rowText}>
          <ThemedText type="bodyMedium">{label ?? 'Still not clear?'}</ThemedText>
          <ThemedText type="label" themeColor="mutedForeground" numberOfLines={1}>
            Ask Atlas about {topic ?? 'this'}
          </ThemedText>
        </View>
      </View>
    </SpringPressable>
  );
}

const styles = StyleSheet.create({
  lessonTrigger: {
    width: 300,
    height: 54,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  lessonSpeech: {
    position: 'absolute',
    right: 64,
    bottom: 10,
    width: 230,
    maxWidth: 230,
  },
  lessonSpeechText: { fontSize: 12.5, lineHeight: 17 },
  round: {
    // 40pt drawn, but the press target is widened by hitSlop at the call site below: this button
    // sits in three tab headers directly beside the 44pt ProfileButton, and the app's own standard
    // (profile-button.tsx) is the 44pt HIG minimum. Growing the circle would change the design;
    // hitSlop 4 makes the TARGET 48pt without moving a pixel.
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    padding: Spacing.three,
  },
  rowText: { flex: 1, gap: 2 },
});
