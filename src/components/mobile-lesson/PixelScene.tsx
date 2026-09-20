/**
 * <PixelScene>: the illustration on a mobile lesson card.
 *
 * A deck replaces one dense authored step with three or four cards, and on each of those the
 * picture is doing work a paragraph used to do. That makes this the largest single element on the
 * card, which is a different job from <PixelSpriteView>: that renders a 16-24pt MARK beside UI text
 * and is used a hundred times a screen. This renders one 160pt SCENE and is used three times a
 * deck. The two differences that follow are the whole reason this file exists.
 *
 * 1. IT CANNOT OVERFLOW. A mark beside text is smaller than anything it could overflow. A scene is
 *    sized in points by its caller and a caller who passes 240 on a 393pt phone inside a padded
 *    card produces a picture wider than the card, which on iOS clips silently rather than erroring.
 *    So the requested size is a CEILING: the real size is measured from the container and snapped
 *    DOWN to a multiple of 16.
 *
 *    SNAPPING APPLIES TO THE CLAMP ONLY, and the first version got this wrong. The art is 16 pixels
 *    across, so at 160pt every art pixel is exactly 10pt and every edge lands on a whole point;
 *    off a multiple of 16 they do not, and the renderer's own note about adjacent rects sharing
 *    exact integer edges stops holding, which shows as hairline seams inside flat areas. So the
 *    first version snapped every size. That turned a caller's `size={44}` into 48, because the
 *    floor of 44 is 32 and a minimum floor then pushed it back UP: a component whose entire job is
 *    to not exceed its bounds was rendering wider than it was asked to. Callers pass 44, 72, 112,
 *    120 and 128, three of which are not multiples of 16 and all of which are deliberate.
 *
 *    So the caller's size is honoured EXACTLY, and snapping happens only when the container is
 *    narrower and we are shrinking anyway. There the few points snapping costs are free, because
 *    the alternative was an arbitrary measured width.
 *
 * 2. IT IS PRESSABLE. Sriyan asked for these to be interactive, and `SceneSpec.explain` already
 *    carries the sentence Atlas says when the art is pressed, so the contract was there before the
 *    renderer was. Pressing replays the animation from frame 0 and calls `onPress`.
 *
 * THE HOUSE RULE ON IDLE LOOPS IS KEPT. PixelSprite.tsx records this as a known defect class, not a
 * preference: twenty-one shop cards each holding a 60ms interval is the open idle-render
 * investigation, authored deliberately. So this plays `once`, on mount and on every press, and
 * never loops. The animation is an entrance and a reaction, which is also how it reads: a chart
 * that draws itself once when you arrive at the card teaches, and one that redraws itself forever
 * while you read the text underneath competes with the text.
 *
 * REDUCED MOTION is handled one level down and deliberately not re-implemented here. The format
 * keeps `rows` as the canonical still separate from `frames`, PixelSpriteView returns the still
 * when the setting is on, and every archetype's still is its COMPLETE state (the finished chart,
 * the crossed threshold, the full hourglass) rather than its first frame, so nothing is lost by
 * not animating. The press bounce comes from SpringPressable, which the reduced-motion audit
 * exempts by name: three percent, instant, and bound to the user's own finger.
 */
import { useMemo, useState } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { SpringPressable } from '@/shared/motion/spring-pressable';
import { PixelSpriteView } from '@/lib/pixel/PixelSprite';
import { composeScene } from '@/lib/pixel/sprites-mobile-kit';
import type { SceneSpec } from '@/lib/mobile-lesson/types';

/**
 * 160pt: ten points per art pixel. Measured against the target layout rather than picked, because
 * "looks about right" is how a default ends up being overridden at every call site. A 393pt iPhone
 * with the app's 16pt gutters leaves a 361pt card, and the card's own 16pt padding leaves 329pt of
 * content. 160 is under half of that, which is what lets a card carry a title, the picture and two
 * lines of body without the picture becoming the card.
 */
const DEFAULT_SIZE = 160;

/** One point per art pixel. Below this the grid is not a picture, it is a texture. */
const MIN_SIZE = 16;

/** Largest whole-point-per-art-pixel size that still fits. Only ever used to shrink. */
const snapDown = (points: number) => Math.max(MIN_SIZE, Math.floor(points / 16) * 16);

export function PixelScene({
  scene,
  size = DEFAULT_SIZE,
  onPress,
  style,
}: {
  scene: SceneSpec;
  /** A CEILING in points, not a fixed width. The container wins if it is narrower. */
  size?: number;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  /*
   * composeScene memoises internally and returns the SAME object for the same spec, which is what
   * PixelSpriteView's memo comparator and compile.ts's WeakMap mesh cache both key on. useMemo here
   * is the second half of that: without it a caller passing an inline `{archetype: 'x'}` object
   * would re-enter composeScene every render. With it, neither the lookup nor the mesh runs twice.
   */
  /*
   * DESTRUCTURED, THEN KEYED ON THE FIELDS. Every call site passes a fresh object literal
   * (`scene={{ archetype: 'compound' }}`), so a dependency on `scene` is a new identity on every
   * render and the memo never hits. Pulling the three fields composeScene actually reads out
   * first is what lets the dependency array be both correct AND stable; keying on `scene.accent`
   * inline does the same work but trips exhaustive-deps, and silencing that rule to keep a
   * correct memo is how the next person loses the memo without noticing.
   */
  const { archetype, accent, overlay } = scene;
  const sprite = useMemo(
    () => composeScene({ archetype, accent, overlay }),
    [archetype, accent, overlay],
  );

  const [avail, setAvail] = useState<number | null>(null);
  const [runs, setRuns] = useState(0);

  /*
   * RENDER NOTHING FOR AN ARCHETYPE THE KIT DOES NOT HAVE. This is how the rest of the pixel system
   * degrades and it is the right failure: lesson-art-pin exists because the previous generation of
   * this code fell back to a default coin, so a whole class of lessons wore the wrong picture and
   * it looked deliberate. Nothing beats wrong.
   */
  if (!sprite) return null;

  const px = avail != null && avail < size ? snapDown(avail) : size;
  const interactive = !!onPress || !!scene.explain;

  const art = (
    <PixelSpriteView
      sprite={sprite}
      size={px}
      play="once"
      // Changing this is what replays from frame 0; PixelSpriteView adjusts during render rather
      // than in an effect, so a press costs one render and not two.
      playKey={runs}
    />
  );

  return (
    // The outer view is full width so it can MEASURE, and hides overflow so the first frame before
    // that measurement arrives cannot spill out of a narrow card.
    <View
      style={[{ width: '100%', alignItems: 'center', overflow: 'hidden' }, style]}
      onLayout={(e) => { setAvail(e.nativeEvent.layout.width); }}>
      {interactive ? (
        <SpringPressable
          onPress={() => {
            setRuns((n) => n + 1);
            onPress?.();
          }}
          accessibilityLabel={scene.explain ?? sprite.blurb ?? sprite.name}
          accessibilityHint="Plays the illustration again"
          style={{ width: px, height: px }}>
          {art}
        </SpringPressable>
      ) : (
        <View
          accessible
          accessibilityRole="image"
          accessibilityLabel={sprite.blurb ?? sprite.name}
          style={{ width: px, height: px }}>
          {art}
        </View>
      )}
    </View>
  );
}
