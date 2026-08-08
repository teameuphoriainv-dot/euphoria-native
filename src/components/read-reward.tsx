/**
 * ReadReward — the payoff for finishing a Digest guide.
 *
 * ── TWO MISTAKES ALREADY MADE HERE. DO NOT REPEAT EITHER. ──
 *
 * 1. THE FACELESS MARK. Pass 2 swapped Atlas for AtlasMark, reaching for "the brand asset". Atlas
 *    IS the brand asset; AtlasMark is the same pinwheel with the face removed. The eyes are the
 *    character. Use <Atlas>.
 *
 * 2. PER-RING ROTATION IS INVISIBLE. Pass 1 span each ring about its own centre, reasoning from
 *    atlas-mark's note that per-ring rotation keeps the weave clip valid. It does — and it reads
 *    as nothing, because a ring is an annulus and an annulus is rotationally symmetric. Twelve
 *    frames of a recording were indistinguishable. The property that makes per-ring rotation safe
 *    is the property that makes it not show. Atlas owns its own motion; let it.
 *
 * WHAT WAS ACTUALLY WRONG WITH PASS 1, and is fixed here:
 *   - the reward sat crammed against the CTA with no room, so finishing crossed no threshold
 *   - two pill chips, and the orange streak pill read LOUDER than the primary button under it
 *   - no bloom at all, so the mascot arrived against flat black
 *
 * The glow is a RadialGradient. A background colour with a borderRadius is a flat disc with a hard
 * edge; at any useful size it swamps the character instead of blooming behind it.
 *
 * Quieter than lesson.tsx on purpose. That screen earns its wipe, confetti and four staggered pops
 * because it ends a whole lesson. A two-minute read that out-celebrated it would flatten the
 * difference between them, so celebrateGain sits between the quiet default and lesson's 1.
 *
 * TUNE is the iteration surface. Preview in isolation at /dev-beat.
 */
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { Atlas } from '@/components/atlas';
import { ThemedText } from '@/components/themed-text';
import { Spacing, FontSize } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { RewardPop } from '@/shared/motion/reward-pop';

/** ── ITERATION SURFACE ────────────────────────────────────────────────────── */
const TUNE = {
  atlasSize: 104,
  /** 1 is lesson.tsx's full payoff; the quiet per-tap default is 0.32. A guide sits between. */
  celebrateGain: 0.62,
  /** the bloom behind the character */
  glowDelay: 200,
  glowIn: 560,
  glowPeak: 0.9,
  /** multiple of atlasSize — the bloom should extend past the character, not sit inside it */
  glowSpread: 2.2,
  /** copy beats, ms from mount */
  titleAt: 680,
  statAt: 840,
} as const;

function Glow({ size, color, style }: { size: number; color: string; style: object }) {
  return (
    <Animated.View pointerEvents="none" style={[styles.glow, style]}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id="readGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={color} stopOpacity={0.5} />
            <Stop offset="0.5" stopColor={color} stopOpacity={0.16} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#readGlow)" />
      </Svg>
    </Animated.View>
  );
}

export function ReadReward({ streak, runKey = 0 }: { streak: number; runKey?: number }) {
  const theme = useTheme();
  const glow = useSharedValue(0);

  useEffect(() => {
    glow.set(0);
    glow.set(withDelay(TUNE.glowDelay, withTiming(1, { duration: TUNE.glowIn })));
  }, [runKey, glow]);

  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.get() * TUNE.glowPeak }));
  const glowSize = TUNE.atlasSize * TUNE.glowSpread;

  return (
    <View style={styles.wrap}>
      <View style={[styles.stage, { width: glowSize, height: glowSize }]}>
        <Glow size={glowSize} color={theme.primary} style={glowStyle} />
        <Atlas
          size={TUNE.atlasSize}
          expression="proud"
          entrance="arrive"
          celebrate
          celebrateGain={TUNE.celebrateGain}
          celebrateKey={runKey}
          interactive={false}
          idle
        />
      </View>

      <RewardPop delay={TUNE.titleAt}>
        <ThemedText type="heading" style={styles.title}>
          Guide finished
        </ThemedText>
      </RewardPop>

      {/* one quiet line, not two competing pills */}
      <RewardPop delay={TUNE.statAt}>
        <ThemedText type="smallBold" style={{ color: theme.iconLilac, marginTop: 6 }}>
          +25 XP · {streak} day streak
        </ThemedText>
      </RewardPop>
    </View>
  );
}

const styles = StyleSheet.create({
  // the space above is doing real work: it is what makes finishing read as a threshold rather than
  // as more content below the paragraph
  wrap: { alignItems: 'center', marginTop: Spacing.four, paddingBottom: Spacing.four },
  stage: { alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute' },
  title: { fontSize: FontSize.headingLg, marginTop: Spacing.one },
});
