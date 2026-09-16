/**
 * <TierUpSheet> — the moment you cross into a new league.
 *
 * WHY THIS EXISTS. The ladder now resolves and pays, but it did so in a card you had to go looking
 * for. Seven named tiers are the app's longest-running progression and crossing one is the rarest
 * thing a user does — six times in a lifetime — and it happened in total silence. A milestone
 * nobody is told about is not a milestone.
 *
 * NOT celebration-burst.tsx, deliberately. That component draws gradient rays (`rayGrad`, orchid
 * fading to #5B21B6 at 0.1 opacity) and a four-stop gradient wipe. Those are the exact treatment
 * the cofounder design doc rejects — "I don't like the gradient look that we've put across the
 * entire app" — and this app's identity is pixel art. The celebration here is the CREST ITSELF
 * arriving: it is already the per-tier artwork, so nothing decorative needs to be invented to sit
 * behind it.
 *
 * THE MOTION IS A SPRING, NOT A LOOP. One overshoot on arrival, then still. PixelSprite.tsx spells
 * out why idle loops are a defect class here — this app already carries an open idle-render
 * investigation — and a sheet the user is reading is the worst place to leave something ticking.
 *
 * REDUCED MOTION collapses the pop to a cross-fade, which is the substitution the repo's own
 * reduced_motion_audit documents, and it is honoured by useSheetEntrance for the sheet itself.
 */
import { type ReactNode, useEffect } from 'react';
import { Modal, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { LeagueCrest } from '@/components/league-crest';
import { ThemedText } from '@/components/themed-text';
import { SlabButton } from '@/components/ui/button';
import { Radius, Spacing, FontSize } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { TIERS, TIER_UP_BONUS } from '@/lib/league';
import { PixelSpriteView, coin as coinSprite } from '@/lib/pixel';
import { SemanticMotion } from '@/shared/motion/semantic-motion';
import { useSheetEntrance } from '@/shared/motion/sheet-entrance';
import { Duration, Ease } from '@/shared/motion/tokens';

const COPY_DELAY = 160;
const REWARD_DELAY = 340;
const CTA_DELAY = 520;

/** Badge first, then meaning, reward, action. Unlike the crest, supporting information settles in
 * one monotonic pass so the rare milestone feels authored without making every element bounce. */
function StageReveal({
  visible,
  delay,
  children,
  style,
}: {
  visible: boolean;
  delay: number;
  children: ReactNode;
  style?: ViewStyle;
}) {
  const reduced = useReducedMotion();
  const opacity = useSharedValue(visible && reduced ? 1 : 0);
  const rise = useSharedValue(visible && reduced ? 0 : 6);

  useEffect(() => {
    if (!visible) {
      opacity.set(0);
      rise.set(6);
      return;
    }
    if (reduced) {
      opacity.set(1);
      rise.set(0);
      return;
    }
    opacity.set(withDelay(delay, withTiming(1, { duration: Duration.base, easing: Ease.enter })));
    rise.set(withDelay(delay, withTiming(0, { duration: Duration.base, easing: Ease.enter })));
  }, [delay, opacity, reduced, rise, visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.get(),
    transform: [{ translateY: rise.get() }],
  }));
  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}

export function TierUpSheet({ tier, onClaim }: { tier: string | null; onClaim: () => void }) {
  const theme = useTheme();
  const visible = tier !== null;
  const { backdrop, sheet } = useSheetEntrance(visible);

  // Falls back to the first tier rather than rendering an empty sheet: a celebration that arrives
  // blank is worse than one that names the wrong rung, and this can only diverge if TIERS is edited
  // while a crossing is already pending in storage.
  const t = TIERS.find((x) => x.name === tier) ?? TIERS[0];

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClaim}>
      <Animated.View style={[StyleSheet.absoluteFill, backdrop]} pointerEvents="box-none">
        <Pressable
          style={[styles.scrim, { backgroundColor: theme.background + 'E6' }]}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          onPress={onClaim}
        />
      </Animated.View>
      <Animated.View style={[styles.dock, sheet]} pointerEvents="box-none">
        <View style={[styles.card, { backgroundColor: theme.cardElevated, borderColor: theme.border }]}>
          <SemanticMotion event="league-promotion" enabled={visible} playKey={tier}>
            <LeagueCrest tier={t} size={128} />
          </SemanticMotion>
          <StageReveal visible={visible} delay={COPY_DELAY} style={styles.copy}>
            <ThemedText type="label" style={{ color: t.color }}>NEW LEAGUE</ThemedText>
            <ThemedText type="display" style={{ fontSize: FontSize.titleSm }} numberOfLines={2}>
              {t.name}
            </ThemedText>
            <ThemedText type="body" themeColor="mutedForeground" style={styles.sub}>
              {`You've climbed a rung. This one is yours for good.`}
            </ThemedText>
          </StageReveal>
          <StageReveal visible={visible} delay={REWARD_DELAY} style={styles.stageCenter}>
            <View style={[styles.pay, { borderColor: theme.iconGold + '40', backgroundColor: theme.iconGold + '18' }]}>
              <PixelSpriteView sprite={coinSprite} size={17} />
              <ThemedText type="smallBold" style={{ color: theme.iconGold, fontSize: FontSize.body }}>
                {`+${String(TIER_UP_BONUS)} Euphorium`}
              </ThemedText>
            </View>
          </StageReveal>
          <StageReveal visible={visible} delay={CTA_DELAY} style={styles.stageFull}>
            <SlabButton label="Collect" full onPress={onClaim} />
          </StageReveal>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1 },
  dock: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.four,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  copy: { alignItems: 'center', gap: Spacing.two },
  stageCenter: { alignItems: 'center' },
  stageFull: { alignSelf: 'stretch' },
  sub: { textAlign: 'center' },
  pay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
    borderWidth: 1,
    marginBottom: Spacing.one,
  },
});
