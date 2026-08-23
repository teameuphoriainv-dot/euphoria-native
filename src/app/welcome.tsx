/**
 * Welcome — the mascot spotlight (Brilliant's "Hi, I'm Koji!" descent). Atlas drops in on
 * a violet light beam, then the greeting fades up. First screen before onboarding.
 */
import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient as SvgGradient, Path, Stop } from 'react-native-svg';

import { AmbientBackground } from '@/components/ambient-background';
import { Atlas } from '@/components/atlas';
import { ThemedText } from '@/components/themed-text';
import { SlabButton } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';

export default function Welcome() {
  const { width, height } = useWindowDimensions();
  const reduced = useReducedMotion();
  const drop = useSharedValue(reduced ? 0 : -(height * 0.42));

  useEffect(() => {
    // damping 13 was underdamped: the drop sprang PAST its resting position and pushed Atlas
    // down into the headline before settling back. That overshoot is what read as the mascot
    // falling into the text. 19 lands it with weight but without the dip.
    if (!reduced) drop.set(withSpring(0, { stiffness: 90, damping: 19, mass: 1 }));
  }, [reduced, drop]);

  const atlasStyle = useAnimatedStyle(() => ({ transform: [{ translateY: drop.get() }] }));
  const cx = width / 2;
  const beamEnd = height * 0.52;

  return (
    <SafeAreaView style={styles.safe}>
      <AmbientBackground />
      {/* Light beam narrowing down to Atlas */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width={width} height={height}>
          <Defs>
            <SvgGradient id="beam" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#A855EB" stopOpacity={0} />
              <Stop offset="0.8" stopColor="#A855EB" stopOpacity={0.18} />
              <Stop offset="1" stopColor="#C89CF5" stopOpacity={0.42} />
            </SvgGradient>
          </Defs>
          <Path d={`M${cx - 78} 0 L${cx + 78} 0 L${cx + 20} ${beamEnd} L${cx - 20} ${beamEnd} Z`} fill="url(#beam)" />
        </Svg>
      </View>

      <View style={styles.center}>
        {/* Atlas gets its own reserved stage. Without it the mascot and the headline shared one
            column, so the drop-in travelled straight through the text and the two were briefly
            on top of each other — the arrival read as falling into the words. */}
        <View style={styles.stage}>
          <Animated.View style={atlasStyle}>
            <Atlas size={132} expression="happy" entrance="bounce" idle />
          </Animated.View>
        </View>
        {/* held until Atlas has actually landed, so the line is never revealed mid-fall */}
        <Animated.View entering={FadeIn.delay(900).duration(420)}>
          <ThemedText type="display" style={styles.title}>Hi, I&apos;m Atlas!</ThemedText>
          <ThemedText type="body" themeColor="mutedForeground" style={styles.sub}>
            I&apos;ll be your personal investing coach — one calm lesson at a time.
          </ThemedText>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <SlabButton label="Let's go" full onPress={() => router.replace('/onboarding')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  // 132 mascot + 1.04 aspect, plus headroom so the overshoot at the end of the drop still has
  // somewhere to go. Clipped, so nothing can escape into the headline.
  stage: { height: 190, width: '100%', alignItems: 'center', justifyContent: 'center' },
  title: { textAlign: 'center', marginTop: Spacing.five },
  sub: { textAlign: 'center', marginTop: Spacing.two, paddingHorizontal: Spacing.five },
  footer: { padding: Spacing.four, paddingTop: Spacing.two },
});
