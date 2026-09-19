/**
 * Atlas's once-per-install lesson introduction, ported from production web 49e.
 *
 * The first beat is intentionally cinematic: a 13.4-second ember/fire build, Atlas rising at
 * 11.7 seconds, then three short typed origin lines. The second beat teaches where the persistent
 * lesson tutor lives. Reduced Motion skips the fire build and lands directly on the settled Atlas.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInUp,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { Atlas } from '@/components/atlas';
import { AtlasSpeech, Typewriter } from '@/components/atlas-speech';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { PixelSpriteView, flame as flameSprite } from '@/lib/pixel';
import { SpringPressable } from '@/shared/motion/spring-pressable';

export const ATLAS_INTRO_SEEN_KEY = 'euphoria_atlas_intro_seen';

const ORIGIN_MS = 13_400;
const ATLAS_RISE_MS = 11_700;
const LINE_DWELL_MS = 1_500;
const TYPE_MS = 29;

const ORIGIN_LINES = [
  'Born from the ashes of every bad money decision ever made.',
  "I'm Atlas.",
  "I'm here to teach the world how money actually works. Starting with you.",
];
const WHERE = "This is me. Tap me any time you're stuck and I'll explain anything on the screen.";

export async function hasSeenAtlasIntro(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(ATLAS_INTRO_SEEN_KEY)) === '1';
  } catch {
    // If storage is unavailable, skip the once-only cinematic rather than replaying forever.
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

function FirePlume({
  progress,
  at,
  left,
  size,
}: {
  progress: SharedValue<number>;
  /** Start time as a fraction of the 13.4-second production clock. */
  at: number;
  left: `${number}%`;
  size: number;
}) {
  const style = useAnimatedStyle(() => {
    const t = progress.get();
    return {
      opacity: interpolate(t, [at, at + 0.025, at + 0.075, at + 0.105], [0, 1, 0.72, 0], 'clamp'),
      transform: [
        { translateY: interpolate(t, [at, at + 0.07], [42, -24], 'clamp') },
        { scaleX: interpolate(t, [at, at + 0.035, at + 0.1], [0.38, 1, 0.62], 'clamp') },
        { scaleY: interpolate(t, [at, at + 0.05, at + 0.1], [0.2, 1.3, 0.72], 'clamp') },
      ],
    };
  });

  return (
    <Animated.View pointerEvents="none" style={[styles.plume, { left, width: size, height: size, marginLeft: -size / 2 }, style]}>
      <PixelSpriteView sprite={flameSprite} size={size} play="loop" />
    </Animated.View>
  );
}

function OriginStage({ reduced, onSettled }: { reduced: boolean; onSettled: () => void }) {
  const progress = useSharedValue(reduced ? 1 : 0);
  const rise = useSharedValue(reduced ? 1 : 0);
  const [settled, setSettled] = useState(reduced);
  const settledRef = useRef(onSettled);

  useEffect(() => {
    settledRef.current = onSettled;
  }, [onSettled]);

  useEffect(() => {
    if (reduced) {
      settledRef.current();
      return;
    }

    progress.set(withTiming(1, { duration: ORIGIN_MS, easing: Easing.linear }));
    // Production's Atlas rises 110px from half-size on a 180/19/0.95 spring. Drive the transform
    // directly so translate and scale keep the same spring instead of competing layout builders.
    rise.set(withDelay(ATLAS_RISE_MS, withSpring(1, { stiffness: 180, damping: 19, mass: 0.95 })));
    const finish = setTimeout(() => {
      setSettled(true);
      settledRef.current();
    }, ORIGIN_MS);
    return () => {
      clearTimeout(finish);
    };
  }, [progress, reduced, rise]);

  const flash = useAnimatedStyle(() => ({
    opacity: interpolate(progress.get(), [0.18, 0.195, 0.215, 0.82, 0.84], [0, 0.82, 0, 0.42, 0], 'clamp'),
  }));
  const atlasRise = useAnimatedStyle(() => ({
    opacity: rise.get(),
    transform: [
      { translateY: 110 * (1 - rise.get()) },
      { scale: 0.5 + rise.get() * 0.5 },
    ],
  }));

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {!reduced ? (
        <>
          <FirePlume progress={progress} at={0.22} left="50%" size={150} />
          <FirePlume progress={progress} at={0.34} left="23%" size={126} />
          <FirePlume progress={progress} at={0.35} left="77%" size={126} />
          <FirePlume progress={progress} at={0.49} left="31%" size={142} />
          <FirePlume progress={progress} at={0.49} left="69%" size={142} />
          <FirePlume progress={progress} at={0.61} left="50%" size={180} />
          <FirePlume progress={progress} at={0.74} left="18%" size={136} />
          <FirePlume progress={progress} at={0.74} left="50%" size={194} />
          <FirePlume progress={progress} at={0.74} left="82%" size={136} />
          <Animated.View style={[StyleSheet.absoluteFill, styles.flash, flash]} />
        </>
      ) : null}

      <Animated.View pointerEvents="none" style={[styles.originAtlas, atlasRise]}>
        <Atlas size={132} expression={settled ? 'happy' : 'whoa'} interactive={false} idle={settled} />
      </Animated.View>
    </View>
  );
}

export function AtlasIntro({ visible, onDone }: { visible: boolean; onDone: () => void }) {
  const reduced = useReducedMotion();
  const [lineIndex, setLineIndex] = useState(-1);
  const [spotlight, setSpotlight] = useState(false);

  useEffect(() => {
    if (!visible || lineIndex < 0 || spotlight) return;
    const line = ORIGIN_LINES[lineIndex];
    const timer = setTimeout(() => {
      if (lineIndex < ORIGIN_LINES.length - 1) setLineIndex((current) => current + 1);
      else setSpotlight(true);
    }, line.length * (reduced ? 0 : TYPE_MS) + LINE_DWELL_MS);
    return () => clearTimeout(timer);
  }, [lineIndex, reduced, spotlight, visible]);

  if (!visible) return null;

  const finish = () => {
    void markAtlasIntroSeen();
    onDone();
  };

  return (
    <View style={styles.overlay} accessibilityViewIsModal>
      <View
        accessible
        accessibilityRole="text"
        accessibilityLabel="Atlas introduction"
        style={styles.a11yLabel}
      />

      {!spotlight ? (
        <>
          <OriginStage reduced={reduced} onSettled={() => setLineIndex((current) => Math.max(0, current))} />

          {lineIndex >= 0 ? (
            <Animated.View key={lineIndex} entering={reduced ? FadeIn.duration(1) : FadeInUp.duration(280)} style={styles.dialogue}>
              <View style={styles.dialogueBubble}>
                <Typewriter text={ORIGIN_LINES[lineIndex]} />
              </View>
              <View style={styles.dots}>
                {ORIGIN_LINES.map((_line, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      index === lineIndex && styles.dotCurrent,
                      { backgroundColor: index <= lineIndex ? '#BB83F1' : 'rgba(255,255,255,0.16)' },
                    ]}
                  />
                ))}
              </View>
            </Animated.View>
          ) : null}

          {lineIndex >= 0 ? (
            <SpringPressable
              onPress={finish}
              scaleTo={0.96}
              style={styles.skip}
              accessibilityRole="button"
              accessibilityLabel="Skip the introduction">
              <ThemedText type="smallBold" style={styles.buttonText}>Skip</ThemedText>
            </SpringPressable>
          ) : null}
        </>
      ) : (
        <View style={StyleSheet.absoluteFill}>
          <View style={styles.spotlightShade} />
          <View style={styles.spotlightRing} />
          <View style={styles.tutorMark}>
            <Atlas size={52} expression="happy" interactive={false} idle />
          </View>
          <Svg width={118} height={76} viewBox="0 0 118 76" style={styles.arrow} accessible={false}>
            <Path d="M16 8 C28 40 54 60 84 68" stroke="#C57FF3" strokeWidth={2.5} strokeLinecap="round" fill="none" />
            <Path d="M75 60 L84 68 L72.5 71" stroke="#C57FF3" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </Svg>
          <Animated.View entering={reduced ? FadeIn.duration(1) : FadeInUp.duration(280)} style={styles.whereBubble}>
            <AtlasSpeech text={WHERE} tail="bottom" tailAlign="center" maxWidth={300} />
            <SpringPressable
              onPress={finish}
              scaleTo={0.96}
              style={styles.gotIt}
              accessibilityRole="button"
              accessibilityLabel="Got it">
              <ThemedText type="smallBold" style={styles.buttonText}>Got it</ThemedText>
            </SpringPressable>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    inset: 0,
    zIndex: 100,
    elevation: 100,
    overflow: 'hidden',
    backgroundColor: 'rgba(6,5,10,0.985)',
  },
  // Keep the cinematic identifiable to VoiceOver and to the live parity harness while leaving
  // every later Skip/Got-it control as its own accessibility element. Fully transparent nodes are
  // omitted from iOS's accessibility tree, hence the single physical point without opacity: 0.
  a11yLabel: { position: 'absolute', left: 0, top: 0, width: 1, height: 1 },
  plume: { position: 'absolute', bottom: '30%', alignItems: 'center', justifyContent: 'center' },
  flash: { backgroundColor: '#FFF3D1' },
  originAtlas: {
    position: 'absolute',
    left: '50%',
    top: '42%',
    width: 132,
    height: 138,
    marginLeft: -66,
    marginTop: -69,
  },
  dialogue: {
    position: 'absolute',
    left: Spacing.three,
    right: Spacing.three,
    bottom: 104,
    alignItems: 'center',
    gap: Spacing.three,
  },
  dialogueBubble: {
    width: '100%',
    maxWidth: 520,
    minHeight: 96,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: Radius.xl,
    borderTopLeftRadius: Radius.sm,
    borderTopRightRadius: Radius.sm,
    backgroundColor: '#14121C',
    borderColor: 'rgba(255,255,255,0.14)',
    borderWidth: StyleSheet.hairlineWidth,
  },
  dots: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  dot: { width: 6, height: 6, borderRadius: 999 },
  dotCurrent: { width: 20 },
  skip: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: '#A650E7',
  },
  buttonText: { color: '#FFFFFF' },
  spotlightShade: { position: 'absolute', inset: 0, backgroundColor: 'rgba(10,9,15,0.88)' },
  spotlightRing: {
    position: 'absolute',
    right: 6,
    bottom: 10,
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: 'rgba(197,127,243,0.9)',
    backgroundColor: 'rgba(10,9,15,0.2)',
  },
  tutorMark: { position: 'absolute', right: 16, bottom: 20, width: 52, height: 54 },
  arrow: { position: 'absolute', right: 8, bottom: 88 },
  whereBubble: { position: 'absolute', right: 24, bottom: 190, maxWidth: 300, alignItems: 'flex-end', gap: Spacing.three },
  gotIt: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: 24,
    borderRadius: 999,
    backgroundColor: '#A650E7',
  },
});
