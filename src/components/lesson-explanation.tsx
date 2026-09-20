/**
 * The explanation, on a screen of its own.
 *
 * WHY THIS EXISTS. Feedback used to render INLINE, underneath the question and its four options,
 * inside the same scroll view. Measured across the corpus that is not survivable on a phone: there
 * are 7,553 authored explanation strings behind 1,307 questions, their median length is 285
 * characters and the longest is 760. Stacking a 285-character explanation under a question and four
 * options pushed the Continue button off the bottom of the screen, which is what Sriyan hit on the
 * compound interest lesson.
 *
 * 71% of those strings are over about five lines on a 393pt iPhone. This is not a tail case to
 * shrink, it is the normal case, so the explanation gets the whole screen rather than a bubble.
 *
 * IT IS NOT A NEW STEP. This is a second page WITHIN the question's own step, the same call
 * `expandSteps` already makes for progressiveCalc and the same one the mobile deck makes. Lesson
 * length, the progress bar and every saved resume position key off `lesson.steps.length`, so
 * turning 1,307 questions into 2,614 steps would have moved every learner's saved place.
 *
 * NOTHING IS REWRITTEN HERE. Every word on screen is the string the curriculum author wrote. The
 * change is where it is shown, not what it says.
 */
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, useReducedMotion } from 'react-native-reanimated';

import { Atlas } from '@/components/atlas';
import { ThemedText } from '@/components/themed-text';
import { LessonColors, LessonTypography } from '@/constants/lesson-design';

export interface LessonExplanationProps {
  correct: boolean;
  /** "The answer is ..." on a miss. Absent when the learner was right. */
  answer?: string;
  /** The authored reasoning. The long one. */
  reason?: string;
  /** A scenario's authored outcome when the learner chose well. */
  outcome?: string;
  /** Bump to replay the shake when a SECOND wrong answer arrives without this remounting. */
  shakeKey?: number;
  /** Rendered under the button by the caller, so the caller keeps owning Continue. */
  children?: React.ReactNode;
}

/**
 * True when there is enough here to be worth a screen of its own.
 *
 * A correct answer with nothing authored to say gets no screen: the learner is right, they know it
 * from the tick on the option, and an extra tap to be told "Correct" is friction. Kept pure and
 * exported so the lesson runner and the regression can ask the same question.
 */
/**
 * Verdict words the heading already says.
 *
 * 333 of the 3,630 authored wrong-answer reasons, about one in eleven, open with one of these.
 * The authors wrote them because on the web there was no heading above the text, so the sentence
 * had to carry the verdict itself. Here "Not quite" is already the heading in amber above Atlas,
 * and the explanation repeating it reads as a stutter.
 *
 * REMOVAL ONLY, and only of the leading word. The rest of the sentence is the author's and is left
 * exactly as written, which is the same rule the mobile card compressor follows: never generate a
 * sentence, only drop material that is genuinely redundant.
 */
const LEADING_VERDICT = /^(not quite|not exactly|nope|incorrect|wrong|close|almost|good try|nice try|correct|exactly|right|yes|that's right|well done)\b[.,!:]?\s*/i;

/** Drop a verdict opener, then re-capitalise whatever is now first. */
function withoutVerdict(text: string): string {
  const out = text.replace(LEADING_VERDICT, '').trim();
  if (!out || out.length < 12) return text;
  return out[0].toUpperCase() + out.slice(1);
}

export function hasExplanationScreen(
  graded: { correct: boolean; correctOutcome?: string; correction?: { answer: string; reason?: string } } | undefined,
): boolean {
  if (!graded) return false;
  if (!graded.correct) return true;
  return Boolean(graded.correctOutcome?.trim());
}

export function LessonExplanation({ correct, answer, reason, outcome, shakeKey, children }: LessonExplanationProps) {
  const reduced = useReducedMotion();
  const enter = (delay: number) => (reduced ? undefined : FadeInDown.duration(280).delay(delay));

  return (
    <View style={styles.shell}>
      <Animated.View entering={reduced ? undefined : FadeIn.duration(240)} style={styles.head}>
        {/*
          `oops` on a miss and `happy` on a hit, matching what lesson.tsx already uses for its own
          wrong state so the app does not wear two faces for one event.
          `shake` IS on, and an earlier version of this comment argued it should not be, on the
          reasoning that the shake belongs to the moment of being marked wrong and had already
          played on the previous page. That was wrong. A choice step has no Atlas on the question
          page at all: the only feedback there is a red cross on the option. Leaving the shake off
          here meant the single most common wrong-answer surface in the app, 1,307 questions, was
          the one surface where Atlas never reacted. `shakeKey` re-fires it on a second wrong
          answer, the same latch the other reactions needed.
          atlas.tsx makes shake a no-op under Reduced Motion, so this costs nothing to anyone who
          has asked for less movement.
        */}
        <Atlas
          size={72}
          expression={correct ? 'happy' : 'oops'}
          interactive={false}
          shake={!correct}
          shakeKey={shakeKey}
        />
        <ThemedText style={[styles.verdict, { color: correct ? LessonColors.success : LessonColors.warning }]}>
          {correct ? 'Correct' : 'Not quite'}
        </ThemedText>
      </Animated.View>

      {/*
        THE TEXT STARTS UNDER THE HEADING, it does not float in the middle.
        With `justifyContent: 'center'` on a scroll that takes all the remaining height, a short
        explanation sat roughly 385pt below "Not quite" with nothing in between, which read as a
        missing element rather than as breathing room. Starting at the top keeps the verdict, the
        answer and the reason reading as one thought, and any leftover space falls below the text
        where it is simply margin.

        THE ANSWER AND THE REASON ARE ONE BLOCK, and both live inside the scroll.
        The answer used to sit outside it. Because the scroll takes the remaining height and centres
        its own content, that put the answer hard under the heading and the reason floating in the
        middle of the space below, with a large hole between two sentences that belong together.
        One scroll, one block, centred as a unit.
        It is still the ONLY thing that scrolls, so Atlas and the verdict stay pinned while a 760
        character reason moves under them, and a short one does not move at all.
      */}
      <Animated.ScrollView
        style={styles.bodyScroll}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
        entering={enter(60)}
      >
        {answer ? <ThemedText style={styles.answer}>{answer}</ThemedText> : null}
        {reason ? <ThemedText style={styles.reason}>{withoutVerdict(reason)}</ThemedText> : null}
        {outcome && outcome !== reason ? <ThemedText style={styles.reason}>{outcome}</ThemedText> : null}
      </Animated.ScrollView>

      <View style={styles.footer}>{children}</View>
    </View>
  );
}

/**
 * How far the Continue button sits off the bottom.
 *
 * `ask-atlas.tsx` floats a contextual speech bubble at `position: absolute; right: 64; bottom: 10;
 * width: 230`, and after a wrong answer it says "Want to know why that one was tricky?". Two lines
 * at its 17pt line height plus padding is about 60pt tall, so it occupies the bottom 70pt of the
 * screen and it landed directly on top of this page's Continue button.
 *
 * Nothing collided before because a choice question owns its own CTA and renders NO bottom footer
 * at all (see OWN_CTA_STEPS in lesson.tsx); this page is the first thing to put a button down
 * there. 76 clears the bubble's top edge with a little room, and it is a constant with the
 * arithmetic written down rather than a number somebody has to re-derive.
 */
const ATLAS_NUDGE_CLEARANCE = 76;

const styles = StyleSheet.create({
  shell: { flex: 1, paddingHorizontal: 24, paddingTop: 8, paddingBottom: ATLAS_NUDGE_CLEARANCE },
  head: { alignItems: 'center', gap: 10, paddingBottom: 6 },
  verdict: { ...LessonTypography.title, textAlign: 'center' },
  answer: {
    ...LessonTypography.bodyMedium,
    color: LessonColors.text,
    textAlign: 'center',
  },
  bodyScroll: { flex: 1 },
  bodyContent: { flexGrow: 1, justifyContent: 'flex-start', paddingTop: 4, paddingBottom: 12, gap: 14 },
  reason: {
    ...LessonTypography.body,
    color: LessonColors.textSecondary,
    textAlign: 'center',
  },
  footer: { paddingTop: 12 },
});
