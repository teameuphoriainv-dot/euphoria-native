/**
 * <LessonBackdrop> pins a lesson's backdrop art along the bottom of the screen, behind everything.
 *
 * It is atmosphere, so it takes no touches and says nothing to VoiceOver. The art is wider than any
 * phone (112 pixels at 4 points is 448 points) and is centred, so the screen shows its middle and
 * the overflow is clipped at the edges rather than scaled: a fractional scale would put art pixels
 * on part points and blur them.
 *
 * FADED, 2026-09-30 (owner: "a little cluttered, maybe fade a bit"). At full strength the skyline
 * sat behind body text, option cards and the check bar, and the translucent surfaces let it
 * through. The band now renders at BACKDROP_OPACITY and its top half dissolves into the canvas
 * through a gradient, so the art reads as a horizon under the content rather than a layer on it.
 *
 * AND IT STEPS ASIDE FOR A VERDICT. The check bar slides up over the footer and ends above the
 * screen's bottom edge, so a strip of skyline showed under it (owner: "glitch on the answering
 * thing, happens on a lot of screens with the pixel art at the bottom"). While a bar is up the
 * band fades to nothing; an opacity fade carries no vestibular motion, so it runs under Reduce
 * Motion too.
 */
import { LinearGradient } from 'expo-linear-gradient';
import { memo, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { PixelSceneView } from '@/components/pixel-scene-view';
import { useTheme } from '@/hooks/use-theme';
import type { SceneArt } from '@/lib/pixel/scenes';
import { Duration } from '@/shared/motion/tokens';

/** Points per art pixel. The backdrop is drawn for this scale. */
const BACKDROP_SCALE = 4;
/** How much of the art shows at its strongest, at the very bottom. */
const BACKDROP_OPACITY = 0.55;
/** The top of the band fades from canvas to clear over this share of its height. */
const FADE_SHARE = 0.55;

function LessonBackdropInner({ art, hidden = false }: { art: SceneArt; /** True while a verdict bar or sheet covers the floor. */ hidden?: boolean }) {
  const theme = useTheme();
  const shown = useSharedValue(hidden ? 0 : 1);
  useEffect(() => {
    shown.set(withTiming(hidden ? 0 : 1, { duration: Duration.base }));
  }, [hidden, shown]);
  const fade = useAnimatedStyle(() => ({ opacity: BACKDROP_OPACITY * shown.get() }));
  return (
    <Animated.View pointerEvents="none" style={[styles.band, fade]}>
      <PixelSceneView art={art} scale={BACKDROP_SCALE} decorative />
      {/* theme.background is a hex token, so alpha-append is safe (CONSTITUTION 5.8). */}
      <LinearGradient
        pointerEvents="none"
        colors={[theme.background, `${theme.background}00`]}
        locations={[0, FADE_SHARE]}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

export const LessonBackdrop = memo(LessonBackdropInner);

const styles = StyleSheet.create({
  band: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center', overflow: 'hidden' },
});
