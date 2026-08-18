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
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/ambient-background';
import { Atlas } from '@/components/atlas';
import { CelebrationRays } from '@/components/celebration-burst';
import { Confetti } from '@/components/confetti';
import { ThemedText } from '@/components/themed-text';
import { GradientButton } from '@/components/ui/button';
import { Radius, Spacing, FontSize } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { money, STOCKS } from '@/lib/stocks';
import { useApp } from '@/lib/store';
import { RewardPop } from '@/shared/motion/reward-pop';
import { RiseIn } from '@/shared/motion/rise-in';

export default function Reward() {
  const theme = useTheme();
  const pending = useApp((s) => s.pendingRewards);
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
    setRevealed(card);
    setTotal((t) => t + card.value);
  };

  if (done) {
    return (
      <SafeAreaView style={styles.safe}>
        <AmbientBackground starCount={30} />
        <View style={styles.centre}>
          <Atlas size={116} expression="proud" interactive={false} idle />
          <ThemedText type="title" style={styles.centreText}>
            {total > 0 ? `You earned ${money(total)} of stock.` : 'Nothing to claim right now.'}
          </ThemedText>
          <ThemedText type="body" themeColor="mutedForeground" style={styles.centreText}>
            {total > 0
              ? 'It is already in your portfolio. Finish another lesson for more.'
              : 'Finish a lesson to earn free stock.'}
          </ThemedText>
        </View>
        <View style={styles.footer}>
          <GradientButton label="Back to learning" full onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <AmbientBackground starCount={30} />

      {revealed ? (
        <Animated.View key={`r-${revealed.sym}-${remaining}`} entering={FadeIn} exiting={FadeOut} style={styles.centre}>
          <Confetti />
          <CelebrationRays size={320} delay={80} />
          <RewardPop>
            <ThemedText type="label" themeColor="mutedForeground" style={styles.centreText}>
              CONGRATS, YOU GOT
            </ThemedText>
          </RewardPop>
          <RewardPop delay={140}>
            {/* The tilted card is Bloom's exact treatment — a physical object you just turned over. */}
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <ThemedText type="title" style={styles.ticker}>{revealed.sym}</ThemedText>
              <ThemedText type="body" themeColor="mutedForeground">{STOCKS[revealed.sym]?.name ?? revealed.sym}</ThemedText>
              <ThemedText type="display" style={{ fontSize: FontSize.displayLg, marginTop: Spacing.two }}>{money(revealed.value)}</ThemedText>
            </View>
          </RewardPop>
        </Animated.View>
      ) : (
        <View style={styles.centre}>
          <RiseIn>
            <Atlas size={104} expression="happy" interactive={false} idle />
          </RiseIn>
          <RiseIn delay={90}>
            <ThemedText type="title" style={styles.centreText}>
              You earned {remaining} free {remaining === 1 ? 'stock' : 'stocks'}.
            </ThemedText>
            <ThemedText type="body" themeColor="mutedForeground" style={styles.centreText}>
              Tap a card to see what you got.
            </ThemedText>
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
        {/* One handler per button. An earlier draft wrapped this GradientButton in a
            SpringPressable that ALSO called next(), which fires the reveal twice on one tap and
            silently burns a card. */}
        {revealed ? (
          <GradientButton
            label={remaining > 0 ? 'Next card' : 'Done'}
            full
            onPress={() => {
              setRevealed(null);
              if (remaining > 0) next();
            }}
          />
        ) : (
          <GradientButton label={`Reveal a card (${remaining})`} full onPress={next} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.three, paddingHorizontal: Spacing.four },
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
  card: {
    width: 220,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    transform: [{ rotate: '-3deg' }],
  },
  ticker: { fontSize: FontSize.displaySm },
  footer: { padding: Spacing.four, gap: Spacing.two },
});
