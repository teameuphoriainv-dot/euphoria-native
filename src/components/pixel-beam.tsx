/**
 * PixelBeam: the stepped light beam behind Atlas on welcome, the plan reveal and lesson complete.
 *
 * Usage:
 *   // welcome: 7 bands, fading in top to bottom, Atlas lands at the narrow end
 *   <PixelBeam bands={7} baseWidth={40} height={beamEnd} order="down" stagger={40} />
 *   // reveal / lesson complete: 5 bands growing up out of the path node
 *   <PixelBeam bands={5} baseWidth={44} height={120} order="up" delay={150} stagger={50} />
 *
 * Geometry is always "narrow at the bottom": the bottom band is `baseWidth` wide and every band
 * above it is `step` points wider, so the edges climb in visible pixel stairs. `order` only picks
 * which end appears first. Place it absolutely so its bottom edge sits on Atlas or the node.
 *
 * Why it exists: welcome drew a smooth SVG gradient trapezoid with two hardcoded violet hex literals.
 * Smooth paths broke the pixel-art rule (CONSTITUTION §5.5) and the two literals sat outside the
 * theme, so light mode and the hex ratchet in design-rules-pin both got them wrong.
 */
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, FadeIn, useReducedMotion } from 'react-native-reanimated';

import { useTheme } from '@/hooks/use-theme';

export type PixelBeamProps = {
  /** Number of flat bands. Welcome uses 7, reveal and lesson complete use 5. */
  bands?: number;
  /** Width of the narrowest (bottom) band, in points. */
  baseWidth: number;
  /** How much wider each band is than the one below it, in points (split evenly per side). */
  step?: number;
  /** Total height. Rounded to whole points per band so the stairs never land on half pixels. */
  height: number;
  /** 'down' = top band appears first (light falling onto Atlas); 'up' = bottom first (rising from a node). */
  order?: 'down' | 'up';
  /** ms before the first band starts. */
  delay?: number;
  /** ms between bands. */
  stagger?: number;
  /** ms each band takes to fade in. */
  bandDuration?: number;
  /** Opacity of the widest (top) band. The ramp is linear to `maxOpacity` at the bottom. */
  minOpacity?: number;
  /** Opacity of the narrowest (bottom) band, where the light is strongest. */
  maxOpacity?: number;
};

/**
 * Pure band geometry, top band first. Exported so a pin can check the stairs without rendering.
 * Opacity only ever rises toward the bottom and width only ever falls: a non-monotonic ramp
 * reads as a flicker band in a static beam, which is the defect this ordering prevents.
 */
export function beamBands(
  bands: number, baseWidth: number, step: number, height: number, minOpacity: number, maxOpacity: number,
): { width: number; top: number; height: number; opacity: number; fromBottom: number }[] {
  const n = Math.max(1, Math.floor(bands));
  const bandH = Math.max(1, Math.round(height / n));
  // Snap the step to an even whole number so each side moves by a whole point: an odd or
  // fractional step centres every band on a half point and blurs the stair edge, which then
  // stops matching the 4pt art pixel of <PixelSpriteView scale={4}> standing on it.
  const evenStep = Math.max(0, 2 * Math.round(step / 2));
  const base = Math.max(0, Math.round(baseWidth));
  return Array.from({ length: n }, (_, i) => {
    const fromBottom = n - 1 - i;
    const t = n === 1 ? 1 : i / (n - 1);
    return {
      width: base + fromBottom * evenStep,
      top: i * bandH,
      height: bandH,
      opacity: minOpacity + (maxOpacity - minOpacity) * t,
      fromBottom,
    };
  });
}

export function PixelBeam({
  bands = 7,
  baseWidth,
  step = 8,
  height,
  order = 'down',
  delay = 0,
  stagger = 40,
  bandDuration = 120,
  minOpacity = 0.06,
  maxOpacity = 0.42,
}: PixelBeamProps) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const rows = beamBands(bands, baseWidth, step, height, minOpacity, maxOpacity);
  const outerW = rows[0]?.width ?? baseWidth;
  const outerH = rows.length * (rows[0]?.height ?? 0);

  return (
    <View
      pointerEvents="none"
      // decorative light only: VoiceOver would otherwise land on 5 to 7 empty rectangles
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: outerW, height: outerH }}
    >
      {rows.map((r, i) => {
        const seq = order === 'down' ? i : r.fromBottom;
        // Fade is a plain timing curve, never a spring: the beam is light, not a character,
        // so it must not overshoot (overshoot is reserved for Atlas and rewards).
        const entering = reduced
          ? undefined
          : FadeIn.delay(delay + seq * stagger).duration(bandDuration).easing(Easing.out(Easing.quad));
        return (
          <Animated.View
            key={i}
            entering={entering}
            style={[styles.band, { top: r.top, height: r.height, width: r.width, left: (outerW - r.width) / 2 }]}
          >
            {/* Opacity lives on this inner view, not the Animated one: FadeIn drives the outer
                view's opacity to exactly 1, which would erase the ramp and paint a solid slab.
                It is an opacity style, not a two-digit hex alpha suffix, because light-mode
                accent is hsl, and alpha-appending onto hsl renders at FULL opacity. */}
            <View
              style={[
                StyleSheet.absoluteFill,
                // the two bands nearest the source take the lighter accent, like the old gradient's end stop
                { backgroundColor: r.fromBottom < 2 ? theme.accent : theme.primary, opacity: r.opacity },
              ]}
            />
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  band: { position: 'absolute' },
});
