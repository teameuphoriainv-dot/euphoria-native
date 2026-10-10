/**
 * Welcome: the first screen, as one short film rather than a poster.
 *
 * REBUILT 2026-09-30. The owner's words: "an actual beautiful intro animation, like a video where
 * Atlas is like welcome to Euphoria; the current one is super super boring". The old screen dropped
 * Atlas down a beam and faded a title and a bubble up under him, and that was all. This one runs a
 * 3.2 second sequence (Duration.earned, the one earned-moment length in the app) on ONE CLOCK:
 *
 *      0   the pixel beam falls, band by band (PixelBeam, as before)
 *    200   Atlas drops down it and lands at 1000, greeting you with a nod
 *   1000   a ring of pixel sparkles bursts out from where he landed
 *   1100   "Welcome to Euphoria" rises in, a word at a time, the brand word in the accent
 *   1450   a coin, a chart and a bolt fly in and settle around him, each playing its own
 *          animation once as it lands: what the app is about, said in its own art
 *   1750   his one line, plain text under the title (no bubble: one text block, not two)
 *   2500   the button rises in
 *
 * Every element reads its window off `clock`, so the beats cannot drift apart, and a tap anywhere
 * parks the clock at 1: the whole end state, at once, for anyone who has seen it. Reduce Motion is
 * that same end state from the first frame. Nothing here loops; once landed, the scene is still,
 * apart from Atlas's own idle, which is his.
 */
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { AmbientBackground } from '@/components/ambient-background';
import { Atlas } from '@/components/atlas';
import { PixelBeam } from '@/components/pixel-beam';
import { PixelBurst } from '@/components/pixel-burst';
import { ThemedText } from '@/components/themed-text';
import { SlabButton } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { bolt as boltSprite, chartUp as chartSprite, coin as coinSprite, PixelSpriteView, star as starSprite, type PixelSprite } from '@/lib/pixel';
import { Duration } from '@/shared/motion/tokens';

const TOTAL_MS = Duration.earned;
/** A moment in ms as a fraction of the clock. A worklet: `window` below reads it on the UI thread. */
function at(ms: number): number {
  'worklet';
  return ms / TOTAL_MS;
}

const DROP_FROM_MS = 200;
const LAND_MS = 1000;
const BURST_END_MS = 1500;
const WORD_FROM_MS = 1100;
const WORD_GAP_MS = 140;
const WORD_MS = 320;
const LINE_FROM_MS = 1750;
const LINE_MS = 300;
const SPRITE_FROM_MS = 1450;
const SPRITE_GAP_MS = 150;
const SPRITE_MS = 400;
const BUTTON_FROM_MS = 2500;
const BUTTON_MS = 300;

const ATLAS = 132;
const STAGE_H = 200;
/** 16px art at 3 points a pixel: crisp, and small beside a 132pt Atlas. */
const SPRITE_SCALE = 3;
const SPRITE_PT = 16 * SPRITE_SCALE;

const WORDS = ['Welcome', 'to', 'Euphoria'] as const;

/**
 * Where each sprite settles, relative to Atlas's centre, and which side it flies in from: two from
 * the left, two from the right, alternating, so the arrivals cross rather than pile, and the four
 * land as a ring around him rather than a heap on one side.
 */
const ORBIT: { sprite: PixelSprite; x: number; y: number; fromX: number }[] = [
  { sprite: coinSprite, x: -114, y: -36, fromX: -240 },
  { sprite: chartSprite, x: 110, y: -36, fromX: 240 },
  { sprite: boltSprite, x: -102, y: 52, fromX: -240 },
  { sprite: starSprite, x: 100, y: 52, fromX: 240 },
];

function window(clock: SharedValue<number>, fromMs: number, toMs: number): number {
  'worklet';
  return interpolate(clock.get(), [at(fromMs), at(toMs)], [0, 1], 'clamp');
}

function Word({ clock, index, text, accent }: { clock: SharedValue<number>; index: number; text: string; accent?: string }) {
  const from = WORD_FROM_MS + index * WORD_GAP_MS;
  const style = useAnimatedStyle(() => {
    const p = Easing.out(Easing.cubic)(window(clock, from, from + WORD_MS));
    return { opacity: p, transform: [{ translateY: 14 * (1 - p) }] };
  });
  return (
    <Animated.View style={style}>
      <ThemedText type="display" style={[styles.word, accent ? { color: accent } : null]}>{text}</ThemedText>
    </Animated.View>
  );
}

function Orbiter({ clock, index, playKey }: { clock: SharedValue<number>; index: number; playKey: number }) {
  const o = ORBIT[index];
  const from = SPRITE_FROM_MS + index * SPRITE_GAP_MS;
  const style = useAnimatedStyle(() => {
    const p = Easing.out(Easing.cubic)(window(clock, from, from + SPRITE_MS));
    return {
      opacity: Math.min(1, p / 0.4),
      transform: [{ translateX: o.fromX + (o.x - o.fromX) * p }, { translateY: o.y }],
    };
  });
  return (
    <Animated.View pointerEvents="none" style={[styles.orbiter, style]}>
      <PixelSpriteView sprite={o.sprite} scale={SPRITE_SCALE} play={playKey > 0 ? 'once' : 'none'} playKey={playKey} />
    </Animated.View>
  );
}

export default function Welcome() {
  const theme = useTheme();
  const { height } = useWindowDimensions();
  const reduced = useReducedMotion();
  const clock = useSharedValue(reduced ? 1 : 0);
  const dropFrom = -(height * 0.42);
  const [nodKey, setNodKey] = useState(0);
  /** Per sprite: 0 until it has landed, then a key that plays its animation once. */
  const [played, setPlayed] = useState<number[]>(() => ORBIT.map(() => (reduced ? 1 : 0)));
  const [finished, setFinished] = useState(reduced);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (reduced) return;
    clock.set(withTiming(1, { duration: TOTAL_MS, easing: Easing.linear }));
    const t = timers.current;
    t.push(setTimeout(() => setNodKey(1), LAND_MS));
    ORBIT.forEach((_, i) => {
      t.push(setTimeout(() => setPlayed((prev) => prev.map((v, j) => (j === i ? 1 : v))), SPRITE_FROM_MS + i * SPRITE_GAP_MS + SPRITE_MS));
    });
    t.push(setTimeout(() => setFinished(true), TOTAL_MS));
    return () => {
      t.forEach(clearTimeout);
      cancelAnimation(clock);
    };
  }, [reduced, clock]);

  /** A tap anywhere: the end state, now. The sprites still play their landing once, all together. */
  const skip = () => {
    if (finished) return;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    cancelAnimation(clock);
    clock.set(1);
    setNodKey((k) => k + 1);
    setPlayed(ORBIT.map(() => 1));
    setFinished(true);
  };

  const atlasStyle = useAnimatedStyle(() => {
    const p = Easing.out(Easing.cubic)(window(clock, DROP_FROM_MS, LAND_MS));
    return { transform: [{ translateY: dropFrom * (1 - p) }] };
  });
  const lineStyle = useAnimatedStyle(() => {
    const p = Easing.out(Easing.cubic)(window(clock, LINE_FROM_MS, LINE_FROM_MS + LINE_MS));
    return { opacity: p, transform: [{ translateY: 8 * (1 - p) }] };
  });
  const buttonStyle = useAnimatedStyle(() => {
    const p = Easing.out(Easing.cubic)(window(clock, BUTTON_FROM_MS, BUTTON_FROM_MS + BUTTON_MS));
    return { opacity: p, transform: [{ translateY: 10 * (1 - p) }] };
  });

  // From the top edge down to Atlas's landing spot. It used to reach 52% of the screen, which
  // with the two-line title now ran on behind "Welcome to"; 45% ends under his base.
  const beamEnd = Math.round(height * 0.45);

  return (
    <SafeAreaView style={styles.safe}>
      <AmbientBackground />
      {/* Seven flat bands from theme.primary and theme.accent, each 8pt narrower than the one
          above, fading in top to bottom 40ms apart: done by 360ms, well before Atlas lands.
          Under Reduce Motion the bands are simply there. */}
      <View style={[StyleSheet.absoluteFill, styles.beam]} pointerEvents="none">
        <PixelBeam bands={7} baseWidth={40} step={8} height={beamEnd} order="down" stagger={40} bandDuration={120} />
      </View>

      {/* Until the film has finished, any tap ends it. The button below renders after this so it is
          never under it, and Atlas gets his own taps back once the scene is still. */}
      {!finished ? (
        <Pressable
          onPress={skip}
          style={StyleSheet.absoluteFill}
          accessibilityRole="button"
          accessibilityLabel="Skip the introduction"
        />
      ) : null}

      <View style={styles.center} pointerEvents={finished ? 'auto' : 'none'}>
        <View style={styles.stage}>
          <Animated.View style={atlasStyle}>
            <Atlas size={ATLAS} expression="happy" entrance={reduced ? undefined : 'bounce'} idle nod={nodKey > 0} nodKey={nodKey} />
          </Animated.View>
          <PixelBurst clock={clock} from={at(LAND_MS)} to={at(BURST_END_MS)} color={theme.accent} radius={ATLAS / 2 + 6} spread={26} size={STAGE_H} />
          {ORBIT.map((o, i) => (
            <Orbiter key={o.sprite.id} clock={clock} index={i} playKey={played[i] ?? 0} />
          ))}
        </View>

        <View style={styles.title} accessible accessibilityRole="header" accessibilityLabel="Welcome to Euphoria">
          {WORDS.map((w, i) => (
            <Word key={w} clock={clock} index={i} text={w} accent={i === WORDS.length - 1 ? theme.accent : undefined} />
          ))}
        </View>
        <Animated.View style={lineStyle}>
          <ThemedText type="body" themeColor="mutedForeground" style={styles.line}>
            I&apos;m Atlas, your investing coach. One calm lesson at a time.
          </ThemedText>
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, buttonStyle]}>
        <SlabButton label="Let's go" full onPress={() => router.replace('/onboarding')} />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  beam: { alignItems: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  // Atlas's own stage, so the drop never travels through the words, plus the orbit around him.
  stage: { height: STAGE_H, width: '100%', alignItems: 'center', justifyContent: 'center' },
  orbiter: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: SPRITE_PT,
    height: SPRITE_PT,
    marginLeft: -SPRITE_PT / 2,
    marginTop: -SPRITE_PT / 2,
  },
  title: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', columnGap: 9, marginTop: Spacing.four, paddingHorizontal: Spacing.four },
  word: { textAlign: 'center', fontSize: 36, lineHeight: 44 },
  line: { textAlign: 'center', marginTop: Spacing.three, paddingHorizontal: Spacing.five, lineHeight: 22 },
  footer: { padding: Spacing.four, paddingTop: Spacing.two },
});
