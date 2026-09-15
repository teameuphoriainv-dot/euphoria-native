/**
 * The clickthrough: one authored step, shown as three or four cards.
 *
 * WHY IT IS A DECK AND NOT FOUR STEPS. Lesson length, the progress bar, the dev preview's step
 * counter and saved progress all read `lesson.steps.length`. Turning one step into four would move
 * every learner's saved position the moment this shipped. `expandSteps()` already made this call
 * once, for progressiveCalc, which "intentionally stays as ONE outer screen ... instead of
 * distorting lesson progress". A deck is the same decision for the same reason.
 *
 * SO THE DECK OWNS ITS OWN PROGRESS. The dots at the top are progress WITHIN the step; the lesson's
 * own bar above is untouched and still counts steps. Two progress indicators sounds like one too
 * many, and it would be if they measured the same thing, but a learner four cards into a step needs
 * to know the step ends and the lesson bar cannot tell them that.
 *
 * BACK GOES BACKWARD THROUGH CARDS FIRST. Pressing back on card three returns to card two rather
 * than leaving the step. Leaving from the middle of a deck would discard cards the learner has read
 * and is the kind of small wrongness that makes an app feel careless.
 */
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { ChartCard, IdeaCard, TakeawayCard, TermCard } from '@/components/mobile-lesson/cards';
import { DeckInteractive } from '@/components/mobile-lesson/deck-interactives';
import { LessonColors, LessonTypography } from '@/constants/lesson-design';
import type { MobileCard, MobileDeck } from '@/lib/mobile-lesson/types';

/**
 * Does this card require the learner to do something before Continue unlocks?
 *
 * Only the interactive does. A card that is purely read cannot be "completed", and gating it behind
 * a timer would be inventing friction; the lesson's own dwell rules already handle pacing.
 */
function needsWork(card: MobileCard): boolean {
  return card.kind === 'interactive';
}

function CardBody({ card, onWorked }: { card: MobileCard; onWorked: () => void }) {
  if (card.kind === 'idea') return <IdeaCard card={card} />;
  if (card.kind === 'term') return <TermCard card={card} />;
  if (card.kind === 'chart') return <ChartCard card={card} />;
  if (card.kind === 'takeaway') return <TakeawayCard card={card} />;
  if (card.kind === 'interactive') return <DeckInteractive spec={card.spec} onWorked={onWorked} />;
  return null;
}

export interface CardDeckProps {
  deck: MobileDeck;
  /** Called once the last card is finished. The lesson advances to its next step. */
  onComplete: () => void;
  /**
   * Called when the learner presses back on the FIRST card, so the lesson can leave the step.
   * Omitted means there is nothing behind this step and back is hidden on card one.
   */
  onExit?: () => void;
}

export function CardDeck({ deck, onComplete, onExit }: CardDeckProps) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [worked, setWorked] = useState<Record<number, boolean>>({});

  const card = deck.cards[index];
  const last = index >= deck.cards.length - 1;
  const locked = card ? needsWork(card) && !worked[index] : false;

  const markWorked = useCallback(() => {
    setWorked((w) => (w[index] ? w : { ...w, [index]: true }));
  }, [index]);

  const advance = useCallback(() => {
    if (last) { onComplete(); return; }
    setIndex((i) => Math.min(i + 1, deck.cards.length - 1));
  }, [last, onComplete, deck.cards.length]);

  const back = useCallback(() => {
    if (index === 0) { onExit?.(); return; }
    setIndex((i) => Math.max(0, i - 1));
  }, [index, onExit]);

  const dots = useMemo(() => deck.cards.map((_, i) => i), [deck.cards]);

  // A deck with no cards cannot happen: scripts/mobile-deck-audit.mjs fails the build on one. The
  // guard exists so that if it ever did, the learner gets a step they can leave rather than a
  // frozen screen.
  if (!card) {
    return (
      <View style={styles.shell}>
        <Button label="Continue" onPress={onComplete} />
      </View>
    );
  }

  return (
    <View style={styles.shell}>
      <View style={styles.header}>
        <ThemedText style={styles.label}>{deck.label}</ThemedText>
        <View style={styles.dots} accessibilityRole="progressbar"
          accessibilityLabel={`Card ${index + 1} of ${deck.cards.length}`}>
          {dots.map((i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotOn, i < index && styles.dotDone]} />
          ))}
        </View>
      </View>

      <Animated.View
        // Remounting on index is what makes each card's entering animation actually run.
        key={index}
        entering={reduced ? undefined : FadeIn.duration(200)}
        style={styles.stage}
      >
        <CardBody card={card} onWorked={markWorked} />
      </Animated.View>

      <View style={styles.footer}>
        {index > 0 || onExit ? (
          <Button variant="ghost" label="Back" onPress={back} />
        ) : null}
        <Button
          label={last ? 'Continue' : 'Got it'}
          onPress={advance}
          disabled={locked}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, justifyContent: 'space-between' },
  header: { alignItems: 'center', gap: 10, paddingTop: 8, paddingHorizontal: 24 },
  label: { ...LessonTypography.label, color: LessonColors.mutedForeground },
  dots: { flexDirection: 'row', gap: 6 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: LessonColors.border,
  },
  dotOn: { backgroundColor: LessonColors.accent, width: 22 },
  dotDone: { backgroundColor: LessonColors.primary },
  stage: { flex: 1 },
  footer: { gap: 10, paddingHorizontal: 24, paddingBottom: 12 },
});
