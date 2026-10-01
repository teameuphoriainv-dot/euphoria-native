/**
 * <PixelSceneView> draws a SceneArt: the still base, then each layer over it, moving.
 *
 * Every measurement in the art is in scene pixels; `scale` is points per pixel. Use a whole number
 * so every art pixel lands on whole points and stays sharp.
 *
 * MOTION RUNS ON ONE CLOCK PER LAYER, on the UI thread. It stops when the screen loses focus (a
 * lesson left open behind another screen should not keep animating) and never starts under Reduce
 * Motion, where the scene is its still picture.
 */
import { useIsFocused } from 'expo-router';
import { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { PixelSpriteView } from '@/lib/pixel';
import type { SceneArt, SceneLayer } from '@/lib/pixel/scenes/types';

function MovingLayer({ layer, scale, live }: { layer: SceneLayer; scale: number; live: boolean }) {
  const t = useSharedValue(0);
  const motion = layer.motion;
  const kind = motion?.kind;
  const period = motion?.periodMs ?? 0;
  const phase = motion?.phase ?? 0;

  useEffect(() => {
    if (!live || !kind || period <= 0) {
      cancelAnimation(t);
      t.set(0);
      return;
    }
    // `rise` runs one way and restarts; the others go there and back, so half a period each way.
    const oneWay = kind === 'rise';
    const run = withRepeat(
      withTiming(1, {
        duration: oneWay ? period : period / 2,
        easing: oneWay ? Easing.linear : Easing.inOut(Easing.sin),
      }),
      -1,
      !oneWay,
    );
    t.set(withDelay(phase * period, run));
    return () => cancelAnimation(t);
  }, [live, kind, period, phase, t]);

  const amp = (motion?.amp ?? 0) * scale;
  const min = motion?.min ?? 0.25;
  const style = useAnimatedStyle(() => {
    const v = t.get();
    switch (kind) {
      case 'bob':
        return { opacity: 1, transform: [{ translateX: 0 }, { translateY: -amp * v }] };
      case 'drift':
        return { opacity: 1, transform: [{ translateX: amp * (v * 2 - 1) }, { translateY: 0 }] };
      case 'twinkle':
        return { opacity: 1 - (1 - min) * v, transform: [{ translateX: 0 }, { translateY: 0 }] };
      case 'rise':
        // Fades in over the first fifth and out over the rest, so the restart is never a pop.
        return {
          opacity: v < 0.2 ? v / 0.2 : 1 - (v - 0.2) / 0.8,
          transform: [{ translateX: 0 }, { translateY: -amp * v }],
        };
      default:
        return { opacity: 1, transform: [{ translateX: 0 }, { translateY: 0 }] };
    }
  });

  return (
    <Animated.View style={[styles.layer, { left: layer.x * scale, top: layer.y * scale }, style]}>
      <PixelSpriteView sprite={layer.sprite} scale={scale} play={live ? 'loop' : 'none'} />
    </Animated.View>
  );
}

function PixelSceneViewInner({ art, scale, decorative = false }: {
  art: SceneArt;
  scale: number;
  /** Atmosphere, not content: VoiceOver skips it instead of reading the label. */
  decorative?: boolean;
}) {
  const reduced = useReducedMotion();
  const focused = useIsFocused();
  const live = !reduced && focused;
  return (
    <View
      style={{ width: art.width * scale, height: art.height * scale }}
      accessible={!decorative}
      accessibilityRole={decorative ? undefined : 'image'}
      accessibilityLabel={decorative ? undefined : art.label}
      accessibilityElementsHidden={decorative}
      importantForAccessibility={decorative ? 'no-hide-descendants' : 'yes'}>
      <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <PixelSpriteView sprite={art.base} scale={scale} />
        {art.layers.map((layer, i) => (
          <MovingLayer key={`${layer.sprite.id}-${String(i)}`} layer={layer} scale={scale} live={live} />
        ))}
      </View>
    </View>
  );
}

export const PixelSceneView = memo(PixelSceneViewInner);

const styles = StyleSheet.create({
  layer: { position: 'absolute' },
});
