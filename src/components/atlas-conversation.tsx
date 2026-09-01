import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { Atlas, type AtlasExpression } from '@/components/atlas';
import { useLessonStepState } from '@/components/lesson-step-session';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  buildVocabConversation,
  type AtlasConversationBeat,
  type VocabTerm,
} from '@/lib/vocab-conversation';
import { SpringPressable } from '@/shared/motion/spring-pressable';

const TYPEWRITER_CPS = 46;
const TYPEWRITER_MS = 1000 / TYPEWRITER_CPS;

function useConversationTypewriter(text: string) {
  const reduced = useReducedMotion();
  const [typing, setTyping] = useState(() => ({
    text,
    shown: reduced ? text : '',
    done: reduced || !text,
  }));

  useEffect(() => {
    if (reduced || !text) return;
    let count = 0;
    const interval = setInterval(() => {
      count += 1;
      if (count >= text.length) {
        clearInterval(interval);
        setTyping({ text, shown: text, done: true });
        return;
      }
      setTyping({ text, shown: text.slice(0, count), done: false });
    }, TYPEWRITER_MS);
    return () => clearInterval(interval);
  }, [reduced, text]);

  const finish = useCallback(() => {
    setTyping({ text, shown: text, done: true });
  }, [text]);

  // Derive the reset frame instead of synchronously resetting state in an effect. The first timer
  // tick adopts the new text; until then the new bubble is intentionally empty, like the web.
  const current = reduced || !text
    ? { text, shown: text, done: true }
    : typing.text === text
      ? typing
      : { text, shown: '', done: false };
  return { shown: current.shown, done: current.done, finish };
}

function ConversationProgress({ current, total }: { current: number; total: number }) {
  const reduced = useReducedMotion();
  const progress = useSharedValue(total ? current / total : 0);

  useEffect(() => {
    const next = total ? current / total : 0;
    progress.set(reduced ? next : withTiming(next, { duration: 300 }));
  }, [current, progress, reduced, total]);

  const fillStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: progress.get() }] }));
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`Vocabulary conversation, step ${String(current)} of ${String(total)}`}
      style={styles.progressTrack}>
      <Animated.View style={[styles.progressFill, fillStyle]} />
    </View>
  );
}

function BubbleTail() {
  return (
    <View pointerEvents="none" style={styles.tail}>
      <Svg width={10} height={14} viewBox="0 0 10 14">
        <Path
          d="M10 1 C6 4 3 6 0 7 C3 8.5 6 11 10 13 Z"
          fill="#14121C"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={1}
        />
      </Svg>
    </View>
  );
}

export function AtlasConversation({
  beats,
  onFinish,
}: {
  beats: AtlasConversationBeat[];
  onFinish: (score: number, asked: number) => void;
}) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const [index, setIndex] = useLessonStepState('vocab.index', 0);
  const [picked, setPicked] = useLessonStepState<number | null>('vocab.picked', null);
  const [score, setScore] = useLessonStepState('vocab.score', 0);
  const completed = useRef(false);
  const beat = beats[index];
  const asked = useMemo(() => beats.filter((item) => item.kind === 'ask').length, [beats]);
  const visibleText = beat?.kind === 'teach' ? beat.text : (beat?.text ?? '');
  const { shown, done, finish } = useConversationTypewriter(visibleText);

  if (!beat) return null;

  const isAsk = beat.kind === 'ask';
  const answered = isAsk && picked !== null;
  const right = answered && picked === beat.correct;
  const expression: AtlasExpression =
    beat.kind === 'say'
      ? (beat.expression ?? 'watching')
      : beat.kind === 'teach'
        ? 'watching'
        : answered
          ? right ? 'happy' : 'whoa'
          : 'watching';

  const pick = (optionIndex: number) => {
    if (beat.kind !== 'ask' || picked !== null) return;
    setPicked(optionIndex);
    if (optionIndex === beat.correct) setScore((value) => value + 1);
  };

  const advance = () => {
    setPicked(null);
    if (index + 1 < beats.length) {
      setIndex((value) => value + 1);
      return;
    }
    if (completed.current) return;
    completed.current = true;
    onFinish(score, asked);
  };

  const nextLabel = beat.kind === 'say' && beat.cta
    ? beat.cta
    : index + 1 === beats.length
      ? 'Finish'
      : 'Next';

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <ConversationProgress current={index + 1} total={beats.length} />

      <View style={styles.conversationRow}>
        <Animated.View
          key={`atlas-${String(index)}-${expression}`}
          entering={reduced
            ? FadeIn.duration(1)
            : FadeInDown.springify().stiffness(420).damping(22).mass(1)}
          style={styles.atlas}>
          <Atlas expression={expression} size={72} interactive={false} />
        </Animated.View>

        <View style={styles.messageColumn}>
          <SpringPressable
            haptic={false}
            scaleTo={1}
            onPress={finish}
            accessibilityLabel={beat.kind === 'teach' ? `${beat.term}. ${visibleText}` : visibleText}
            accessibilityHint={done ? undefined : 'Double tap to reveal the full message'}
            style={styles.bubble}>
            <BubbleTail />
            {beat.kind === 'teach' ? (
              <ThemedText style={styles.term}>{beat.term}</ThemedText>
            ) : null}

            <View>
              <ThemedText
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                style={[styles.message, styles.ghost]}>
                {visibleText}
              </ThemedText>
              <ThemedText accessibilityElementsHidden style={[styles.message, styles.typed]}>
                {shown}
                {!done ? <ThemedText style={styles.cursor}>▌</ThemedText> : null}
              </ThemedText>
            </View>

            {beat.kind === 'teach' && beat.aside && done ? (
              <Animated.View entering={FadeIn.duration(reduced ? 1 : 200)}>
                <ThemedText themeColor="mutedForeground" style={styles.aside}>{beat.aside}</ThemedText>
              </Animated.View>
            ) : null}
          </SpringPressable>

          {isAsk && done ? (
            <Animated.View entering={FadeInDown.duration(reduced ? 1 : 220)} style={styles.options}>
              {beat.options.map((option, optionIndex) => {
                const isCorrect = optionIndex === beat.correct;
                const chosen = picked === optionIndex;
                const borderColor = answered && isCorrect
                  ? theme.success
                  : answered && chosen
                    ? theme.destructive
                    : 'rgba(255,255,255,0.10)';
                const backgroundColor = answered && isCorrect
                  ? theme.success + '1A'
                  : answered && chosen
                    ? theme.destructive + '1A'
                    : 'rgba(255,255,255,0.02)';
                const color = answered && isCorrect
                  ? theme.success
                  : answered && chosen
                    ? theme.destructive
                    : answered
                      ? theme.mutedForeground
                      : theme.text;
                return (
                  <SpringPressable
                    key={`${String(optionIndex)}-${option}`}
                    haptic={!answered}
                    scaleTo={0.97}
                    disabled={answered}
                    onPress={() => pick(optionIndex)}
                    accessibilityLabel={answered && isCorrect
                      ? `${option}. Correct answer.`
                      : answered && chosen
                        ? `${option}. Incorrect.`
                        : option}
                    accessibilityState={{ disabled: answered, selected: chosen }}
                    style={[styles.option, { borderColor, backgroundColor }]}>
                    <ThemedText type="smallBold" style={[styles.optionText, { color }]}>{option}</ThemedText>
                    {answered && isCorrect ? <UIcon name="check" size={16} color={theme.success} strokeWidth={3} /> : null}
                    {answered && chosen && !isCorrect ? <UIcon name="close" size={16} color={theme.destructive} strokeWidth={3} /> : null}
                  </SpringPressable>
                );
              })}
            </Animated.View>
          ) : null}

          {answered && !right && beat.kind === 'ask' && beat.onWrong ? (
            <Animated.View entering={FadeIn.duration(reduced ? 1 : 200)}>
              <ThemedText themeColor="mutedForeground" style={styles.wrong}>{beat.onWrong}</ThemedText>
            </Animated.View>
          ) : null}

          {((!isAsk && done) || answered) ? (
            <Animated.View entering={FadeIn.duration(reduced ? 1 : 150)} style={styles.nextWrap}>
              <SpringPressable
                onPress={advance}
                scaleTo={0.97}
                accessibilityLabel={nextLabel}
                style={[styles.next, { backgroundColor: theme.primary }]}>
                <ThemedText type="smallBold" style={styles.nextText}>{nextLabel}</ThemedText>
                <UIcon name="arrowRight" size={16} color="#FFFFFF" />
              </SpringPressable>
            </Animated.View>
          ) : null}
        </View>
      </View>
    </ScrollView>
  );
}

/** Production KeyTermsCards contract: teach every term, then pass with at least half the asks. */
export function VocabConversation({
  terms,
  onComplete,
}: {
  terms: VocabTerm[];
  onComplete: (passed: boolean) => void;
}) {
  const beats = useMemo(() => buildVocabConversation(terms), [terms]);
  if (!beats.length) {
    return (
      <View style={styles.empty}>
        <SpringPressable
          onPress={() => onComplete(true)}
          accessibilityLabel="Continue"
          style={[styles.next, { backgroundColor: '#A650E7' }]}>
          <ThemedText type="smallBold" style={styles.nextText}>Continue</ThemedText>
          <UIcon name="arrowRight" size={16} color="#FFFFFF" />
        </SpringPressable>
      </View>
    );
  }
  return (
    <AtlasConversation
      beats={beats}
      onFinish={(score, asked) => onComplete(asked === 0 || score >= Math.ceil(asked / 2))}
    />
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { flexGrow: 1, width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 24, paddingTop: Spacing.three, paddingBottom: 48 },
  progressTrack: { height: 4, borderRadius: 999, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.07)' },
  progressFill: { width: '100%', height: 4, borderRadius: 999, backgroundColor: '#B862ED', transformOrigin: 'left' },
  conversationRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginTop: 20 },
  atlas: { width: 72, flexShrink: 0 },
  messageColumn: { minWidth: 0, flex: 1 },
  bubble: { position: 'relative', width: '100%', borderRadius: 16, borderTopLeftRadius: 4, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.12)', backgroundColor: '#14121C', paddingHorizontal: 16, paddingVertical: 14 },
  tail: { position: 'absolute', left: -9, top: 16 },
  term: { marginBottom: 4, color: '#C57FF3', fontFamily: Fonts.black, fontSize: 15, lineHeight: 20, letterSpacing: -0.2 },
  message: { color: '#F2EFF7', fontSize: 14.5, lineHeight: 22 },
  ghost: { opacity: 0 },
  typed: { position: 'absolute', top: 0, left: 0, right: 0 },
  cursor: { color: '#C57FF3', fontSize: 14.5, lineHeight: 22 },
  aside: { marginTop: 8, fontSize: 12.5, lineHeight: 18, fontStyle: 'italic' },
  options: { marginTop: 12, gap: 8 },
  option: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 16, paddingVertical: 12 },
  optionText: { flex: 1, fontSize: 14, lineHeight: 20 },
  wrong: { marginTop: 10, fontSize: 13, lineHeight: 19 },
  nextWrap: { alignSelf: 'flex-start', marginTop: 14 },
  next: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 999, paddingHorizontal: 24, paddingVertical: 10 },
  nextText: { color: '#FFFFFF', fontSize: 14, lineHeight: 20 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
