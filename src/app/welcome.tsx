/**
 * Welcome: the mascot spotlight (Brilliant's "Hi, I'm Koji!" descent). Atlas drops in on
 * a stepped pixel light beam, then the greeting fades up. First screen before onboarding.
 */
import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from 'react-native-reanimated';

import { AmbientBackground } from '@/components/ambient-background';
import { Atlas } from '@/components/atlas';
import { ThemedText } from '@/components/themed-text';
import { SlabButton } from '@/components/ui/button';
import { AtlasSpeech } from '@/components/atlas-speech';
import { PixelBeam } from '@/components/pixel-beam';
import { Spacing } from '@/constants/theme';

export default function Welcome() {
  const { height } = useWindowDimensions();
  const reduced = useReducedMotion();
  const drop = useSharedValue(reduced ? 0 : -(height * 0.42));

  useEffect(() => {
    // damping 13 was underdamped: the drop sprang PAST its resting position and pushed Atlas
    // down into the headline before settling back. That overshoot is what read as the mascot
    // falling into the text. 19 lands it with weight but without the dip.
    if (!reduced) drop.set(withSpring(0, { stiffness: 90, damping: 19, mass: 1 }));
  }, [reduced, drop]);

  const atlasStyle = useAnimatedStyle(() => ({ transform: [{ translateY: drop.get() }] }));
  // Same reach as the old trapezoid: from the top edge down to just over half the screen.
  const beamEnd = Math.round(height * 0.52);

  return (
    <SafeAreaView style={styles.safe}>
      <AmbientBackground />
      {/* Light beam narrowing down to Atlas. It was a smooth SVG gradient trapezoid with two
          hardcoded violet hex literals: smooth edges broke the pixel-art rule (CONSTITUTION 5.5),
          and the literals ignored the theme, so light mode got a dark-mode violet and the
          design-rules-pin hex ratchet counted three extra matches. PixelBeam draws 7 flat bands
          from theme.primary and theme.accent, each 8pt narrower than the one above, and fades
          them in top to bottom at 40ms apart (120ms each, done by 360ms), well before the drop
          spring lands Atlas. Under Reduce Motion the bands are simply there, like the drop. */}
      <View style={[StyleSheet.absoluteFill, styles.beam]} pointerEvents="none">
        <PixelBeam bands={7} baseWidth={40} step={8} height={beamEnd} order="down" stagger={40} bandDuration={120} />
      </View>

      <View style={styles.center}>
        {/* Atlas gets its own reserved stage. Without it the mascot and the headline shared one
            column, so the drop-in travelled straight through the text and the two were briefly
            on top of each other, so the arrival read as falling into the words. */}
        <View style={styles.stage}>
          <Animated.View style={atlasStyle}>
            <Atlas size={132} expression="happy" entrance="bounce" idle />
          </Animated.View>
        </View>
        {/* held until Atlas has actually landed, so the line is never revealed mid-fall */}
        <Animated.View entering={FadeIn.delay(900).duration(420)}>
          <ThemedText type="display" style={styles.title}>Hi, I&apos;m Atlas!</ThemedText>
          <AtlasSpeech text="I'll be your personal investing coach. One calm lesson at a time." tail="top" tailAlign="center" maxWidth={300} />
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
  beam: { alignItems: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  // 132 mascot + 1.04 aspect, plus headroom so the overshoot at the end of the drop still has
  // somewhere to go. Clipped, so nothing can escape into the headline.
  stage: { height: 190, width: '100%', alignItems: 'center', justifyContent: 'center' },
  title: { textAlign: 'center', marginTop: Spacing.five },
  sub: { textAlign: 'center', marginTop: Spacing.two, paddingHorizontal: Spacing.five },
  footer: { padding: Spacing.four, paddingTop: Spacing.two },
});
