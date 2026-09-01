import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Atlas } from '@/components/atlas';
import { ThemedText } from '@/components/themed-text';
import { PixelSpriteView, heart, lightbulb } from '@/lib/pixel';
import { CHALLENGE_INTRO_EXIT_MS, CHALLENGE_INTRO_MS } from '@/lib/mastery-challenge-model';

const LINE = 'Alright. Time for a quick check.';

export function MasteryChallengeIntro({ visible, onDone }: { visible: boolean; onDone: () => void }) {
  const reduced = useReducedMotion();
  const doneRef = useRef(onDone);
  const dismissing = useRef(false);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const overlay = useSharedValue(1);
  const atlasScale = useSharedValue(reduced ? 1 : 0.45);
  const atlasY = useSharedValue(reduced ? 0 : 26);
  const atlasOpacity = useSharedValue(reduced ? 1 : 0);
  const bubble = useSharedValue(reduced ? 1 : 0);
  const detail = useSharedValue(reduced ? 1 : 0);

  useEffect(() => { doneRef.current = onDone; }, [onDone]);

  const dismiss = useCallback(() => {
    if (dismissing.current) return;
    dismissing.current = true;
    const duration = reduced ? 0 : CHALLENGE_INTRO_EXIT_MS;
    overlay.set(withTiming(0, { duration, easing: Easing.out(Easing.quad) }));
    exitTimer.current = setTimeout(() => doneRef.current(), duration);
  }, [overlay, reduced]);

  useEffect(() => {
    if (!visible) return;
    dismissing.current = false;
    overlay.set(1);
    if (reduced) {
      atlasScale.set(1);
      atlasY.set(0);
      atlasOpacity.set(1);
      bubble.set(1);
      detail.set(1);
    } else {
      const ease = Easing.bezier(0.16, 1, 0.3, 1);
      atlasScale.set(withTiming(1, { duration: 620, easing: ease }));
      atlasY.set(withSequence(
        withTiming(-4, { duration: 384, easing: ease }),
        withTiming(0, { duration: 236, easing: ease }),
      ));
      atlasOpacity.set(withTiming(1, { duration: 620, easing: ease }));
      bubble.set(withDelay(340, withTiming(1, { duration: 340, easing: ease })));
      detail.set(withDelay(700, withTiming(1, { duration: 220 })));
    }
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const timer = setTimeout(dismiss, CHALLENGE_INTRO_MS);
    return () => {
      clearTimeout(timer);
      if (exitTimer.current) clearTimeout(exitTimer.current);
    };
  }, [atlasOpacity, atlasScale, atlasY, bubble, detail, dismiss, overlay, reduced, visible]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlay.get() }));
  const atlasStyle = useAnimatedStyle(() => ({
    opacity: atlasOpacity.get(),
    transform: [{ translateY: atlasY.get() }, { scale: atlasScale.get() }],
  }));
  const bubbleStyle = useAnimatedStyle(() => ({
    opacity: bubble.get(),
    transform: [{ translateY: (1 - bubble.get()) * 14 }, { scale: 0.95 + bubble.get() * 0.05 }],
  }));
  const detailStyle = useAnimatedStyle(() => ({ opacity: detail.get() }));

  if (!visible) return null;
  return (
    <Animated.View style={[styles.overlay, overlayStyle]}>
      <Pressable
        style={styles.pressable}
        onPress={dismiss}
        accessibilityRole="button"
        accessibilityLabel="Start the challenge"
        accessibilityHint="Skips the introduction and reveals the mastery questions">
        <Animated.View style={atlasStyle}>
          <Atlas expression="watching" size={150} interactive={false} />
        </Animated.View>
        <Animated.View style={[styles.bubble, bubbleStyle]}>
          <View style={styles.tail} accessible={false} />
          <ThemedText type="title" style={styles.line}>{LINE}</ThemedText>
        </Animated.View>
        <Animated.View style={[styles.details, detailStyle]}>
          <View style={styles.detailItem}>
            <PixelSpriteView sprite={heart} size={18} />
            <ThemedText type="small" themeColor="mutedForeground">3 hearts</ThemedText>
          </View>
          <View style={styles.detailItem}>
            <PixelSpriteView sprite={lightbulb} size={18} />
            <ThemedText type="small" themeColor="mutedForeground">hints if you need them</ThemedText>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFill, zIndex: 70, backgroundColor: 'rgba(10,9,15,0.96)' },
  pressable: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24, paddingHorizontal: 24 },
  bubble: { position: 'relative', borderRadius: 24, borderTopLeftRadius: 4, borderTopRightRadius: 4, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.14)', backgroundColor: '#14121C', paddingHorizontal: 28, paddingVertical: 16 },
  tail: { position: 'absolute', top: -7, left: '50%', marginLeft: -7, width: 14, height: 14, transform: [{ rotate: '45deg' }], backgroundColor: '#14121C', borderLeftWidth: StyleSheet.hairlineWidth, borderTopWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.14)' },
  line: { color: '#F2EFF7', fontSize: 22, lineHeight: 29, textAlign: 'center' },
  details: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 20 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
