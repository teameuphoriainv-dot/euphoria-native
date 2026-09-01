import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Atlas } from '@/components/atlas';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { Fonts } from '@/constants/theme';
import { askAtlas, chatErrorMessage, ChatError, type ChatTurn } from '@/lib/atlas-chat';
import type { AtlasLessonContext } from '@/lib/atlas-lesson-context';
import { useTier } from '@/lib/entitlement';
import { useApp } from '@/lib/store';

import { lessonAtlasModes } from './lesson-atlas-sheet-model';

const COLORS = {
  surface: '#14121C',
  border: '#1C1C22',
  text: '#F4F4F5',
  muted: '#6F6F7B',
  primary: '#A650E7',
  atlasBubble: 'rgba(255,255,255,0.05)',
  atlasBorder: 'rgba(255,255,255,0.10)',
  userBubble: 'rgba(166,80,231,0.20)',
  userBorder: 'rgba(166,80,231,0.30)',
} as const;

function ThinkingDot({ delay }: { delay: number }) {
  const reduced = useReducedMotion();
  const opacity = useSharedValue(reduced ? 1 : 0.3);

  useEffect(() => {
    if (reduced) {
      opacity.set(1);
      return;
    }
    opacity.set(withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 500 }),
          withTiming(0.3, { duration: 500 }),
        ),
        -1,
      ),
    ));
    return () => cancelAnimation(opacity);
  }, [delay, opacity, reduced]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.get() }));
  return <Animated.View style={[styles.thinkingDot, style]} />;
}

function ThinkingDots() {
  return (
    <View style={styles.thinkingDots} accessibilityLabel="Atlas is thinking">
      <ThinkingDot delay={0} />
      <ThinkingDot delay={150} />
      <ThinkingDot delay={300} />
    </View>
  );
}

export function LessonAtlasSheet({
  visible,
  context,
  onDismiss,
}: {
  visible: boolean;
  context: AtlasLessonContext;
  onDismiss: () => void;
}) {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const isPro = useApp((state) => state.isPro);
  const questionsLeft = useApp((state) => state.atlasLeft());
  const spendQuestion = useApp((state) => state.spendAtlasMessage);
  const expired = useTier() === 'expired';
  const exhausted = !isPro && questionsLeft <= 0;
  const blocked = expired || exhausted;
  const modes = useMemo(() => lessonAtlasModes(context), [context]);

  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiConsent, setAiConsent] = useState(false);
  const scroller = useRef<ScrollView>(null);
  const request = useRef<AbortController | null>(null);

  const dim = useSharedValue(0);
  const rise = useSharedValue(0);
  useEffect(() => {
    if (!visible) {
      dim.set(0);
      rise.set(0);
      return;
    }
    if (reduced) {
      dim.set(1);
      rise.set(1);
      return;
    }
    dim.set(withTiming(1, { duration: 200 }));
    // Canonical web Atlas panel spring, measured from AtlasTutorPanel rather than a library default.
    rise.set(withSpring(1, { stiffness: 400, damping: 30, mass: 1 }));
  }, [dim, reduced, rise, visible]);
  useEffect(() => () => request.current?.abort(), []);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: dim.get() }));
  const sheetStyle = useAnimatedStyle(() => {
    const progress = rise.get();
    return {
      opacity: progress,
      transform: [
        { translateY: (1 - progress) * 24 },
        { scale: 0.9 + progress * 0.1 },
      ],
    };
  });

  const dismiss = useCallback(() => {
    Keyboard.dismiss();
    onDismiss();
  }, [onDismiss]);

  const run = useCallback(async (next: ChatTurn[]) => {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setTurns(next);
    setError(null);
    setPending(true);
    spendQuestion();
    try {
      const reply = await askAtlas(next, controller.signal, context);
      if (request.current !== controller) return;
      setTurns([...next, { role: 'model', content: reply }]);
    } catch (caught) {
      if (controller.signal.aborted) return;
      setError(chatErrorMessage(caught instanceof ChatError ? caught.code : 'unknown'));
    } finally {
      if (request.current === controller) {
        request.current = null;
        setPending(false);
      }
    }
  }, [context, spendQuestion]);

  const send = useCallback((value: string) => {
    const body = value.trim();
    if (!body || pending || blocked || request.current) return;
    const submit = () => {
      if (request.current || blocked) return;
      setDraft('');
      void run([...turns, { role: 'user', content: body }]);
    };
    if (aiConsent) {
      submit();
      return;
    }
    Alert.alert(
      'Share this chat with Atlas?',
      'Your question and this chat history will be sent to Google Gemini to generate a response. Do not include personal or sensitive information.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            setAiConsent(true);
            submit();
          },
        },
      ],
    );
  }, [aiConsent, blocked, pending, run, turns]);

  return (
    <Modal
      animationType="none"
      onRequestClose={dismiss}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.modal} accessibilityViewIsModal>
        <Animated.View pointerEvents="box-none" style={[StyleSheet.absoluteFill, backdropStyle]}>
          <Pressable
            accessibilityLabel="Close Atlas"
            accessibilityRole="button"
            onPress={dismiss}
            style={styles.backdrop}
          />
        </Animated.View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          pointerEvents="box-none"
          style={styles.keyboardLayer}
        >
          <Animated.View
            style={[
              styles.sheet,
              { paddingBottom: Math.max(insets.bottom, 12) },
              sheetStyle,
            ]}
          >
            <View style={styles.header}>
              <Atlas expression="happy" interactive={false} size={30} />
              <View style={styles.headerCopy}>
                <ThemedText style={styles.atlasLabel}>Atlas</ThemedText>
                <ThemedText numberOfLines={1} style={styles.contextLabel}>
                  Step {context.step.index + 1} of {context.step.total} · {context.lessonTitle}
                </ThemedText>
              </View>
              <Pressable
                accessibilityLabel="Close Atlas"
                accessibilityRole="button"
                hitSlop={12}
                onPress={dismiss}
                style={styles.close}
              >
                <UIcon color={COLORS.muted} name="close" size={16} />
              </Pressable>
            </View>

            <ScrollView
              ref={scroller}
              contentContainerStyle={styles.thread}
              keyboardDismissMode="interactive"
              keyboardShouldPersistTaps="handled"
              onContentSizeChange={() => scroller.current?.scrollToEnd({ animated: !reduced })}
              showsVerticalScrollIndicator={false}
              style={styles.threadScroll}
            >
              {turns.length === 0 && !pending ? (
                <View style={styles.welcome}>
                  <ThemedText style={styles.welcomeText}>
                    I can see this step. Ask me anything about it, or pick one of these.
                  </ThemedText>
                </View>
              ) : null}

              {turns.map((turn, index) => (
                <View
                  key={`${turn.role}-${String(index)}`}
                  style={[styles.messageRow, turn.role === 'user' && styles.userRow]}
                >
                  <View style={turn.role === 'user' ? styles.userBubble : styles.atlasBubble}>
                    <ThemedText style={styles.messageText}>{turn.content}</ThemedText>
                  </View>
                </View>
              ))}

              {pending ? (
                <View style={styles.messageRow}>
                  <View style={styles.atlasBubble}>
                    <ThinkingDots />
                  </View>
                </View>
              ) : null}

              {error ? (
                <View style={styles.errorCard}>
                  <ThemedText style={styles.errorText}>{error}</ThemedText>
                </View>
              ) : null}

              {blocked ? (
                <View style={styles.limitCard}>
                  <ThemedText style={styles.limitTitle}>
                    {expired ? 'Your free trial has ended.' : 'You have used your free Atlas questions.'}
                  </ThemedText>
                  <ThemedText style={styles.limitText}>Your lesson stays right behind this sheet.</ThemedText>
                </View>
              ) : null}
            </ScrollView>

            {!blocked ? (
              <View style={styles.footer}>
                <ScrollView
                  horizontal
                  keyboardShouldPersistTaps="handled"
                  showsHorizontalScrollIndicator={false}
                >
                  <View style={styles.modeRow} accessibilityLabel="Atlas tutor actions">
                    {modes.map((mode) => (
                      <Pressable
                        key={mode}
                        accessibilityLabel={mode}
                        accessibilityRole="button"
                        accessibilityState={{ disabled: pending }}
                        disabled={pending}
                        hitSlop={4}
                        onPress={() => send(mode)}
                        style={styles.modeTarget}
                      >
                        <View style={[styles.modePill, pending && styles.disabled]}>
                          <ThemedText style={styles.modeText}>{mode}</ThemedText>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>

                <View style={styles.composer}>
                  <TextInput
                    accessibilityLabel="Ask Atlas about this step"
                    editable={!pending}
                    multiline
                    onChangeText={setDraft}
                    onSubmitEditing={() => send(draft)}
                    placeholder="Ask Atlas about this step..."
                    placeholderTextColor={COLORS.muted}
                    returnKeyType="send"
                    style={styles.input}
                    value={draft}
                  />
                  <Pressable
                    accessibilityLabel="Send"
                    accessibilityRole="button"
                    accessibilityState={{ disabled: pending || !draft.trim() }}
                    disabled={pending || !draft.trim()}
                    hitSlop={6}
                    onPress={() => send(draft)}
                    style={[styles.send, (pending || !draft.trim()) && styles.sendDisabled]}
                  >
                    <View style={styles.sendGlyph}>
                      <UIcon color="#FFFFFF" name="arrowRight" size={16} />
                    </View>
                  </Pressable>
                </View>
              </View>
            ) : null}
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.52)' },
  keyboardLayer: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    height: '72%',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
  },
  header: {
    minHeight: 54,
    alignItems: 'center',
    borderBottomColor: 'rgba(255,255,255,0.10)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerCopy: { flex: 1, minWidth: 0 },
  atlasLabel: {
    color: COLORS.text,
    fontFamily: Fonts.bold,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 16,
  },
  contextLabel: { color: COLORS.muted, fontFamily: Fonts.body, fontSize: 11, lineHeight: 14 },
  close: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  threadScroll: { flex: 1 },
  thread: { flexGrow: 1, gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  welcome: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: COLORS.atlasBorder,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
  },
  welcomeText: { color: COLORS.text, fontFamily: Fonts.body, fontSize: 13, lineHeight: 20 },
  messageRow: { alignItems: 'flex-start' },
  userRow: { alignItems: 'flex-end' },
  atlasBubble: {
    maxWidth: '85%',
    backgroundColor: COLORS.atlasBubble,
    borderColor: COLORS.atlasBorder,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userBubble: {
    maxWidth: '85%',
    backgroundColor: COLORS.userBubble,
    borderColor: COLORS.userBorder,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  messageText: { color: COLORS.text, fontFamily: Fonts.body, fontSize: 13, lineHeight: 20 },
  thinkingDots: { minHeight: 20, flexDirection: 'row', alignItems: 'center', gap: 4 },
  thinkingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary },
  errorCard: {
    backgroundColor: 'rgba(239,68,68,0.07)',
    borderColor: 'rgba(239,68,68,0.30)',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
  },
  errorText: { color: '#F87171', fontFamily: Fonts.body, fontSize: 12.5, lineHeight: 17 },
  limitCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: COLORS.atlasBorder,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 4,
    padding: 12,
  },
  limitTitle: { color: COLORS.text, fontFamily: Fonts.bold, fontSize: 13, lineHeight: 18 },
  limitText: { color: COLORS.muted, fontFamily: Fonts.body, fontSize: 12, lineHeight: 17 },
  footer: {
    borderTopColor: 'rgba(255,255,255,0.10)',
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 4,
    paddingHorizontal: 12,
    paddingTop: 4,
  },
  modeRow: { flexDirection: 'row', gap: 2 },
  modeTarget: { minHeight: 40, justifyContent: 'center', paddingHorizontal: 2 },
  modePill: {
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  modeText: { color: COLORS.text, fontFamily: Fonts.bold, fontSize: 11.5, lineHeight: 17 },
  disabled: { opacity: 0.45 },
  composer: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  input: {
    minHeight: 38,
    maxHeight: 88,
    flex: 1,
    backgroundColor: COLORS.atlasBubble,
    borderColor: COLORS.border,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    color: COLORS.text,
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 19.5,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  send: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 18,
  },
  sendGlyph: { transform: [{ rotate: '-90deg' }] },
  sendDisabled: { backgroundColor: 'rgba(255,255,255,0.10)', opacity: 0.5 },
});
