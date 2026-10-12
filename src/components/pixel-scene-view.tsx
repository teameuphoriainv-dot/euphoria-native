/**
 * <PixelSceneView> draws a SceneArt: the still base, then each layer over it, moving.
 *
 * Every measurement in the art is in scene pixels; `scale` is points per pixel. Use a whole number
 * so every art pixel lands on whole points and stays sharp.
 *
 * MOTION RUNS ON ONE CLOCK PER LAYER, on the UI thread. It stops when the screen loses focus (a
 * lesson left open behind another screen should not keep animating) and never starts under Reduce
 * Motion, where the scene is its still picture.
 *
 * THE STILL PICTURE IS THE AUTHORED ONE (2026-10-11 audit). A layer that is not live rests exactly
 * where it was drawn, at full opacity: the pose render-scene.mjs reviews and lesson-scenes-pin.mjs
 * bounds-checks. `rise` used to rest at its cycle start (opacity 0), so under Reduce Motion speech
 * bubbles, thought bubbles and a decision card were missing from the picture their labels describe.
 *
 * FRAMES SWITCH ON THE UI THREAD TOO (same audit). A framed layer used to be a PixelSpriteView with
 * its own setInterval, so every frame tick was a React render on the JS thread, and the lesson art
 * reached many times the pilot's tick rate. Here each frame is drawn once, as a group in one Svg,
 * and a Reanimated clock picks which group shows: no React work per tick. The frames compile as
 * stills through compileSprite, which caches per sprite AND canvas (compileFrames caches per sprite
 * only, so a theme switch would keep the first theme's colours).
 */
import { useIsFocused } from 'expo-router';
import { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  type SharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { G, Path } from 'react-native-svg';

import { useThemeMode } from '@/hooks/use-theme';
import { compileSprite, PixelSpriteView, type PixelSprite } from '@/lib/pixel';
import type { PixelCanvas } from '@/lib/pixel/compile';
import { pathsFor } from '@/lib/pixel/PixelSprite';
import type { SceneArt, SceneLayer } from '@/lib/pixel/scenes/types';

const AnimatedG = Animated.createAnimatedComponent(G);

/** Each frame of a framed sprite as its own still sprite, kept per source so identities (and compileSprite's cache) hold. */
const frameStills = new WeakMap<PixelSprite, PixelSprite[]>();
function stillsOf(sprite: PixelSprite): PixelSprite[] {
  let hit = frameStills.get(sprite);
  if (!hit) {
    hit = (sprite.frames ?? []).map((rows, i) => ({
      id: `${sprite.id}#${String(i)}`,
      name: sprite.name,
      tags: sprite.tags,
      rows,
      ...(sprite.palette ? { palette: sprite.palette } : {}),
    }));
    frameStills.set(sprite, hit);
  }
  return hit;
}

/** One frame of a framed layer, shown only while the layer's clock is on it. */
function FrameGroup({ clock, index, count, sprite, canvas }: {
  clock: SharedValue<number>;
  index: number;
  count: number;
  sprite: PixelSprite;
  canvas: PixelCanvas;
}) {
  const props = useAnimatedProps(() => ({ opacity: Math.floor(clock.get()) % count === index ? 1 : 0 }));
  return (
    <AnimatedG animatedProps={props}>
      {pathsFor(compileSprite(sprite, canvas)).map((p) => (
        <Path key={p.fill} d={p.d} fill={p.fill} />
      ))}
    </AnimatedG>
  );
}

/** A framed sprite looping its frames at its own frameMs, the way PixelSpriteView's 'loop' does, off the JS thread. */
function FramedSprite({ sprite, scale, live }: { sprite: PixelSprite; scale: number; live: boolean }) {
  const canvas = useThemeMode();
  const clock = useSharedValue(0);
  const stills = stillsOf(sprite);
  const count = stills.length;
  const ms = sprite.frameMs ?? 120;

  useEffect(() => {
    if (!live) {
      cancelAnimation(clock);
      clock.set(0);
      return;
    }
    clock.set(withRepeat(withTiming(count, { duration: count * ms, easing: Easing.linear }), -1, false));
    return () => cancelAnimation(clock);
  }, [live, count, ms, clock]);

  if (!live) return <PixelSpriteView sprite={sprite} scale={scale} />;
  const { width, height } = compileSprite(sprite, canvas);
  return (
    <Svg width={width * scale} height={height * scale} viewBox={`0 0 ${String(width)} ${String(height)}`}>
      {stills.map((s, i) => (
        <FrameGroup key={s.id} clock={clock} index={i} count={count} sprite={s} canvas={canvas} />
      ))}
    </Svg>
  );
}

function MovingLayer({ layer, scale, live }: { layer: SceneLayer; scale: number; live: boolean }) {
  const t = useSharedValue(0);
  const resting = useSharedValue(live ? 0 : 1);
  const motion = layer.motion;
  const kind = motion?.kind;
  const period = motion?.periodMs ?? 0;
  const phase = motion?.phase ?? 0;

  useEffect(() => {
    if (!live || !kind || period <= 0) {
      cancelAnimation(t);
      t.set(0);
      resting.set(1);
      return;
    }
    resting.set(0);
    // `rise` runs one way and restarts; `drift` is a sine on a one-way clock (so it starts from its
    // authored spot, not from one end); the others go there and back, so half a period each way.
    const oneWay = kind === 'rise' || kind === 'drift';
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
  }, [live, kind, period, phase, t, resting]);

  const amp = (motion?.amp ?? 0) * scale;
  const min = motion?.min ?? 0.25;
  const style = useAnimatedStyle(() => {
    if (resting.get() === 1) return { opacity: 1, transform: [{ translateX: 0 }, { translateY: 0 }] };
    const v = t.get();
    switch (kind) {
      case 'bob':
        return { opacity: 1, transform: [{ translateX: 0 }, { translateY: -amp * v }] };
      case 'drift':
        // The same sinusoid the eased there-and-back traced, a quarter cycle on, so it starts centred.
        return { opacity: 1, transform: [{ translateX: amp * Math.sin(2 * Math.PI * v) }, { translateY: 0 }] };
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

  const framed = (layer.sprite.frames?.length ?? 0) > 1;
  return (
    <Animated.View style={[styles.layer, { left: layer.x * scale, top: layer.y * scale }, style]}>
      {framed
        ? <FramedSprite sprite={layer.sprite} scale={scale} live={live} />
        : <PixelSpriteView sprite={layer.sprite} scale={scale} />}
    </Animated.View>
  );
}

function PixelSceneViewInner({ art, scale, decorative = false, paused = false }: {
  art: SceneArt;
  scale: number;
  /** Atmosphere, not content: VoiceOver skips it instead of reading the label. */
  decorative?: boolean;
  /** Hold the still picture while something covers the scene (the backdrop under a verdict bar). */
  paused?: boolean;
}) {
  const reduced = useReducedMotion();
  const focused = useIsFocused();
  const live = !reduced && focused && !paused;
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
