import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Atlas } from '@/components/atlas';
import { ThemedText } from '@/components/themed-text';

const BEAT_MS = 2200;
const EXIT_MS = 380;

export function StepModeTransition({ visible, onDone }: { visible: boolean; onDone: () => void }) {
  const reduced = useReducedMotion();
  const { height } = useWindowDimensions();
  const doneRef = useRef(onDone);
  const overlayOpacity = useSharedValue(1);
  const scale = useSharedValue(reduced ? 1 : 0.15);
  const rotate = useSharedValue(reduced ? 0 : -320);
  const translateY = useSharedValue(reduced ? 0 : -40);
  const bubble = useSharedValue(reduced ? 1 : 0);

  useEffect(() => { doneRef.current = onDone; }, [onDone]);

  useEffect(() => {
    if (!visible) return;
    overlayOpacity.set(1);
    if (reduced) {
      scale.set(1);
      rotate.set(0);
      translateY.set(0);
      bubble.set(1);
    } else {
      const ease = Easing.bezier(0.16, 1, 0.3, 1);
      scale.set(withSequence(withTiming(0.98, { duration: 570, easing: ease }), withTiming(1, { duration: 380, easing: ease })));
      rotate.set(withSequence(withTiming(10, { duration: 570, easing: ease }), withTiming(-5, { duration: 220, easing: ease }), withTiming(0, { duration: 160, easing: ease })));
      translateY.set(withSequence(withTiming(6, { duration: 570, easing: ease }), withTiming(-3, { duration: 220, easing: ease }), withTiming(0, { duration: 160, easing: ease })));
      bubble.set(withDelay(800, withTiming(1, { duration: 260, easing: ease })));
    }
    const fade = setTimeout(() => overlayOpacity.set(withTiming(0, { duration: EXIT_MS, easing: Easing.out(Easing.quad) })), BEAT_MS - EXIT_MS);
    const done = setTimeout(() => doneRef.current(), BEAT_MS);
    return () => { clearTimeout(fade); clearTimeout(done); };
  }, [bubble, overlayOpacity, reduced, rotate, scale, translateY, visible]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.get() }));
  const atlasStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.get() }, { rotate: `${String(rotate.get())}deg` }, { scale: scale.get() }],
  }));
  const bubbleStyle = useAnimatedStyle(() => ({
    opacity: bubble.get(),
    transform: [{ translateY: (1 - bubble.get()) * 14 }, { scale: 0.94 + bubble.get() * 0.06 }],
  }));

  if (!visible) return null;
  const atlasSize = Math.min(height * 0.42, 340);
  return (
    <Animated.View style={[styles.overlay, overlayStyle]}>
      <Pressable style={styles.pressable} onPress={() => doneRef.current()} accessibilityRole="button" accessibilityLabel="Skip to the question">
        <Animated.View style={[styles.atlas, { width: atlasSize, height: atlasSize }, atlasStyle]}>
          <Atlas expression="silly" size={atlasSize} interactive={false} />
        </Animated.View>
        <Animated.View style={[styles.bubble, bubbleStyle]}>
          <View style={styles.tail} accessible={false} />
          <ThemedText type="title" style={styles.copy}>Now quiz yourself</ThemedText>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFill, zIndex: 70, backgroundColor: 'rgba(10,9,15,0.96)' },
  pressable: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24, paddingHorizontal: 24 },
  atlas: { alignItems: 'center', justifyContent: 'center' },
  bubble: { position: 'relative', borderRadius: 24, borderTopLeftRadius: 4, borderTopRightRadius: 4, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.14)', backgroundColor: '#14121C', paddingHorizontal: 28, paddingVertical: 16 },
  tail: { position: 'absolute', top: -7, left: '50%', marginLeft: -7, width: 14, height: 14, transform: [{ rotate: '45deg' }], backgroundColor: '#14121C', borderLeftWidth: StyleSheet.hairlineWidth, borderTopWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.14)' },
  copy: { color: '#F1EFF5', fontSize: 24, lineHeight: 32, textAlign: 'center' },
});
