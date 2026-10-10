/**
 * Free-stock reward cards.
 *
 * Bloom's reward loop, frame-for-frame from ScreensDesign flow 53308 (858–920s):
 *
 *   860.5s  "Woohoo! You passed & earned 3 free stocks!" + a summary + "Claim Free Stocks"
 *   878.9s  "NOW SCRATCH THE CARDS!" — a stack of face-down cards
 *   885.3s  reveal: confetti, tilted card, "CONGRATS! YOU GOT SHIFT4 PAYMENTS", FOUR, $1.00
 *   902.5s  "SCRATCH THE NEXT CARD" — repeats once per stock
 *
 * Why this matters more than any other single thing in the pull: Euphoria already had XP and a
 * paper portfolio and NOTHING connected them. Finishing a lesson paid out in a number that bought
 * nothing. Now it pays out in the thing you trade with.
 *
 * Departures from Bloom, deliberate:
 *   - TAP, not a scratch gesture. A scratch needs a masked canvas and a pan responder; the payoff
 *     is identical and a tap is reachable by VoiceOver, which a drag is not.
 *   - No "Share +50". Bloom pays its soft currency for social shares; we have no such currency and
 *     no share destination, and a button that pays nothing is the dead control this app is purging.
 */
import * as Haptics from '@/lib/haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/ambient-background';
import { Atlas } from '@/components/atlas';
import { Confetti } from '@/components/confetti';
import { ThemedText } from '@/components/themed-text';
import { TickerLogo } from '@/components/ticker-logo';
import { SlabButton } from '@/components/ui/button';
import { AtlasSpeech } from '@/components/atlas-speech';
import { Radius, Spacing, FontSize } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { money, STOCKS } from '@/lib/stocks';
import { playSfx } from '@/lib/sfx';
import { useApp } from '@/lib/store';
import { RiseIn } from '@/shared/motion/rise-in';
import { Duration } from '@/shared/motion/tokens';

export default function Reward() {
  const theme = useTheme();
  /* The lesson just finished, when the lesson sent us: its last card hands over to Up next. */
  const params = useLocalSearchParams<{ course?: string; num?: string; seed?: string }>();
  const pending = useApp((s) => s.pendingRewards);
  /* DEV ONLY: `?seed=1` queues three cards so the reveal can be checked without finishing a lesson.
     Tickers with a bundled logo, so the flip shows the real mark. */
  const seed = __DEV__ && params.seed === '1';
  useEffect(() => {
    if (!seed || useApp.getState().pendingRewards.length > 0) return;
    useApp.setState({ pendingRewards: [{ sym: 'AAPL', value: 1.24 }, { sym: 'MSFT', value: 0.93 }, { sym: 'NVDA', value: 1.67 }] });
  }, [seed]);
  const claim = useApp((s) => s.claimReward);
  // The card most recently revealed. Held locally because the store drops it from `pending` the
  // instant it is claimed — this screen is the only place it is ever shown.
  const [revealed, setRevealed] = useState<{ sym: string; value: number } | null>(null);
  const [total, setTotal] = useState(0);

  const remaining = pending.length;
  const done = remaining === 0 && revealed === null;

  const next = () => {
    const card = pending[0];
    if (!card) return;
    claim();
    // Turning a card over is the earned beat: the confetti and pop were already here, it was silent.
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    playSfx('reveal');
    setRevealed(card);
    setTotal((t) => t + card.value);
  };

  if (done) {
    return (
      <SafeAreaView style={styles.safe}>
        <AmbientBackground starCount={30} />
        <ScrollView contentContainerStyle={styles.centre} showsVerticalScrollIndicator={false}>
          <Atlas size={116} expression="proud" interactive={false} idle />
          <ThemedText type="title" maxFontSizeMultiplier={1.6} style={styles.centreText}>
            {total > 0 ? `You earned ${money(total)} of stock.` : 'Nothing to claim right now.'}
          </ThemedText>
          <AtlasSpeech
            text={total > 0
              ? 'It is already in your portfolio. Finish another lesson for more.'
              : 'Finish a lesson to earn free stock.'}
            tail="top"
            tailAlign="center"
            maxWidth={300}
          />
        </ScrollView>
        <View style={styles.footer}>
          <SlabButton
            label={params.course ? 'Continue' : 'Back to learning'}
            full
            onPress={() => {
              if (params.course) router.replace({ pathname: '/up-next', params: { course: params.course, num: params.num ?? '0' } } as never);
              else router.back();
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <AmbientBackground starCount={30} />

      {revealed ? (
        <View key={`r-${revealed.sym}-${remaining}`} style={styles.centre}>
          <Confetti />
          <ThemedText type="label" themeColor="mutedForeground" style={styles.centreText}>
            CONGRATS, YOU GOT
          </ThemedText>
          <FlipCard sym={revealed.sym} value={revealed.value} />
        </View>
      ) : (
        <View style={styles.centre}>
          <RiseIn>
            <Atlas size={104} expression="happy" interactive={false} idle />
          </RiseIn>
          <RiseIn delay={90}>
            <ThemedText type="title" maxFontSizeMultiplier={1.6} style={styles.centreText}>
              You earned {remaining} free {remaining === 1 ? 'stock' : 'stocks'}.
            </ThemedText>
            <AtlasSpeech text="Tap a card to see what you got." tail="top" tailAlign="center" maxWidth={300} />
          </RiseIn>
          <RiseIn delay={160}>
            <View style={styles.stack}>
              {pending.slice(0, 3).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.faceDown,
                    { backgroundColor: theme.primary + '22', borderColor: theme.primary + '55', marginLeft: i * -18, top: i * 4 },
                  ]}
                >
                  <ThemedText type="display" style={{ fontSize: FontSize.titleLg, color: theme.iconLilac }}>?</ThemedText>
                </View>
              ))}
            </View>
          </RiseIn>
        </View>
      )}

      <View style={styles.footer}>
        {/* One handler per button. An earlier draft wrapped this SlabButton in a
            SpringPressable that ALSO called next(), which fires the reveal twice on one tap and
            silently burns a card. */}
        {revealed ? (
          <SlabButton
            label={remaining > 0 ? 'Next card' : 'Done'}
            full
            onPress={() => {
              setRevealed(null);
              if (remaining > 0) next();
            }}
          />
        ) : (
          <SlabButton label={`Reveal a card (${remaining})`} full onPress={next} />
        )}
      </View>
    </SafeAreaView>
  );
}

/**
 * THE CARD TURNS OVER. Face down (the "?" back the stack shows), then one rotation on the Y axis
 * into the face: the company's own mark (assets/logos, bundled, no network), the ticker, the name
 * and the value. REBUILT 2026-09-30 (owner: "these card animations can be way nicer with the
 * company logos; it's a bit glitchy"): the reveal used to be a cross-fade keyed on the symbol with
 * two RewardPop springs and a ray burst stacked on it, three motions starting at once. Now it is
 * one physical move. Reduce Motion lands on the face at once.
 */
function FlipCard({ sym, value }: { sym: string; value: number }) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const flip = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (reduced) return;
    flip.set(withTiming(1, { duration: Duration.earned / 4, easing: Easing.inOut(Easing.cubic) }));
  }, [flip, reduced]);
  const back = useAnimatedStyle(() => ({
    transform: [{ perspective: 900 }, { rotateY: `${String(flip.get() * 180)}deg` }],
    opacity: flip.get() < 0.5 ? 1 : 0,
  }));
  const face = useAnimatedStyle(() => ({
    transform: [{ perspective: 900 }, { rotateY: `${String(180 + flip.get() * 180)}deg` }],
    opacity: flip.get() < 0.5 ? 0 : 1,
  }));
  return (
    <View style={styles.flipBox}>
      <Animated.View style={[styles.card, styles.cardFace, { backgroundColor: theme.primary + '22', borderColor: theme.primary + '55' }, back]}>
        <ThemedText type="display" style={{ fontSize: FontSize.displayLg, color: theme.iconLilac }}>?</ThemedText>
      </Animated.View>
      <Animated.View
        style={[styles.card, styles.cardFace, { backgroundColor: theme.card, borderColor: theme.border }, face]}
        accessible
        accessibilityRole="text"
        accessibilityLabel={`${STOCKS[sym]?.name ?? sym}, ${money(value)} of stock`}>
        <TickerLogo sym={sym} size={64} />
        {/* A TICKER MUST NOT SPLIT: "AAPL" breaking as "AA" / "PL" reads as a different symbol. */}
        <ThemedText type="title" maxFontSizeMultiplier={1.6} numberOfLines={1} style={styles.ticker}>{sym}</ThemedText>
        <ThemedText type="body" themeColor="mutedForeground" numberOfLines={1}>{STOCKS[sym]?.name ?? sym}</ThemedText>
        {/* Rewards run REWARD_MIN 0.25 to REWARD_MAX 2, so "$2.00" is the longest real string. */}
        <ThemedText type="display" maxFontSizeMultiplier={1.6} numberOfLines={1} style={styles.value}>{money(value)}</ThemedText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  // flexGrow, not flex, because this is now a ScrollView contentContainer: it still centres
  // while the content is short, and scrolls once Dynamic Type makes it taller than the screen.
  // As a plain centred flex:1 View it pushed content off BOTH ends at AX5 — the same overflow
  // that put lesson.tsx's course label above the status bar.
  centre: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.three, paddingHorizontal: Spacing.four },
  centreText: { textAlign: 'center' },
  stack: { flexDirection: 'row', marginTop: Spacing.three, paddingLeft: 18 },
  faceDown: {
    width: 92,
    height: 122,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-4deg' }],
  },
  flipBox: { width: 236, height: 300, alignItems: 'center', justifyContent: 'center' },
  card: {
    width: 220,
    height: 280,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
  },
  cardFace: { position: 'absolute', backfaceVisibility: 'hidden' },
  ticker: { fontSize: FontSize.displaySm, marginTop: Spacing.two },
  value: { fontSize: FontSize.displayLg, marginTop: Spacing.two },
  footer: { padding: Spacing.four, gap: Spacing.two },
});
