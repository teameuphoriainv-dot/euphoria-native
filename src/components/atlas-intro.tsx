/**
 * Atlas's once-per-install lesson introduction: ONE beat that teaches where the tutor lives.
 *
 * REBUILT 2026-09-30 (owner: "make it cleaner"). The port from production web ran a 13.4 second
 * ember-and-fire build with nine flame plumes and a white flash, Atlas rising at 11.7 seconds, then
 * three typed origin lines, and only THEN the spotlight on the tutor mark. Coming straight after
 * the welcome film and the onboarding, the fire was a second introduction to a character the
 * learner had just met, and the owner's screenshot of it was a near-black screen. The beat that
 * carried information was the last one, so that is the whole intro now:
 *
 *   the lesson dims, Atlas arrives at the spot where he will live for every lesson, and his one
 *   line says what tapping him does. Got it, and the lesson begins.
 *
 * Reduce Motion: the same screen, still. The "Atlas introduction" label stays for VoiceOver and
 * for scripts/atlas-intro-live-regression.py, which waits for it after Start lesson.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInUp, useReducedMotion } from 'react-native-reanimated';

import { Atlas } from '@/components/atlas';
import { AtlasSpeech } from '@/components/atlas-speech';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import { Duration } from '@/shared/motion/tokens';

export const ATLAS_INTRO_SEEN_KEY = 'euphoria_atlas_intro_seen';

const WHERE = "This is me. Tap me any time you're stuck and I'll explain anything on the screen.";
/** The bubble follows Atlas's arrival, not the dim. */
const BUBBLE_AT_MS = 320;

export async function hasSeenAtlasIntro(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(ATLAS_INTRO_SEEN_KEY)) === '1';
  } catch {
    // If storage is unavailable, skip the once-only intro rather than replaying forever.
    return true;
  }
}

export async function resetAtlasIntroForDev(): Promise<void> {
  if (!__DEV__) return;
  await AsyncStorage.removeItem(ATLAS_INTRO_SEEN_KEY);
}

async function markAtlasIntroSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(ATLAS_INTRO_SEEN_KEY, '1');
  } catch {
    // Finishing the lesson must never depend on local persistence being writable.
  }
}

export function AtlasIntro({ visible, onDone }: { visible: boolean; onDone: () => void }) {
  const reduced = useReducedMotion();
  const theme = useTheme();

  if (!visible) return null;

  const finish = () => {
    void markAtlasIntroSeen();
    onDone();
  };

  return (
    <Animated.View
      entering={reduced ? FadeIn.duration(1) : FadeIn.duration(Duration.base)}
      style={[styles.overlay, { backgroundColor: `${theme.background}F5` }]}
      accessibilityViewIsModal>
      <View
        accessible
        accessibilityRole="text"
        accessibilityLabel="Atlas introduction"
        style={styles.a11yLabel}
      />

      {/* The spot the floating tutor occupies in every lesson (lesson.tsx), marked with a square
          ring, not a circle: round shapes beside pixel sprites read as a different product (5.5). */}
      <View style={[styles.spotlightRing, { borderColor: theme.accent }]} />
      <View style={styles.tutorMark}>
        <Atlas size={52} expression="happy" interactive={false} idle entrance={reduced ? undefined : 'bounce'} />
      </View>

      <Animated.View
        entering={reduced ? FadeIn.duration(1) : FadeInUp.delay(BUBBLE_AT_MS).duration(Duration.base)}
        style={styles.whereBubble}>
        <AtlasSpeech text={WHERE} tail="bottom" tailAlign="right" maxWidth={300} delay={reduced ? 0 : BUBBLE_AT_MS + Duration.fast} />
        <SpringPressable
          onPress={finish}
          scaleTo={0.96}
          style={[styles.gotIt, { backgroundColor: theme.primary }]}
          accessibilityRole="button"
          accessibilityLabel="Got it">
          <ThemedText type="smallBold" style={{ color: theme.primaryForeground }}>Got it</ThemedText>
        </SpringPressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    inset: 0,
    zIndex: 100,
    elevation: 100,
    overflow: 'hidden',
  },
  // Keep the intro identifiable to VoiceOver and to the live parity harness while leaving the
  // Got it control as its own accessibility element. Fully transparent nodes are omitted from
  // iOS's accessibility tree, hence the single physical point without opacity: 0.
  a11yLabel: { position: 'absolute', left: 0, top: 0, width: 1, height: 1 },
  spotlightRing: {
    position: 'absolute',
    right: 6,
    bottom: 10,
    width: 72,
    height: 72,
    borderRadius: 12,
    borderWidth: 2,
  },
  tutorMark: { position: 'absolute', right: 16, bottom: 20, width: 52, height: 54 },
  whereBubble: { position: 'absolute', right: 24, bottom: 100, maxWidth: 300, alignItems: 'flex-end', gap: Spacing.three },
  gotIt: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: 24,
    borderRadius: 999,
  },
});
