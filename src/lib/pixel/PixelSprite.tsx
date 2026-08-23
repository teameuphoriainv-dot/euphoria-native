/**
 * <PixelSpriteView> — the iOS renderer for the Euphoria pixel system.
 *
 * THE ONLY FILE IN THIS FOLDER THAT IS NOT THE WEB'S. types / palette / compile / sprites /
 * catalogue are byte-for-byte copies of `euphoriaweb@origin/master:src/lib/pixel/*` and compile
 * here with no edits at all — they are pure TypeScript with no DOM or React dependency, which is
 * what made the port a copy rather than a rewrite. One catalogue, two renderers. When a sprite
 * changes on web, RE-COPY; never re-draw.
 *
 * ── THE HOUSE RULE, and I got it wrong first ────────────────────────────────────────────────────
 * The first version of this file defaulted to `animate: true` and looped forever. Comparing the
 * rendered iOS shop against the rendered web shop is what caught it: the bolt came out WHITE on
 * iOS and gold on web, because `bolt`'s frame 0 is deliberately blown out ("a zap, not a pulse:
 * it starts blown out and decays back to the still") and iOS was mid-loop while web sat on the
 * still.
 *
 * The web states the rule in its own props: "Animation, off by default. The house rule is no idle
 * loops, so a sprite only moves when something asks it to: 'once' for a reaction (a coin awarded,
 * a streak extended), 'loop' only where continuous motion is genuinely the point."
 *
 * That is not a preference here, it is a known defect class: this app already carries an open
 * idle-render investigation (refs/NEXT_SESSION.md §4.1) measuring 4-5 React commits per second
 * while completely idle. Twenty-one shop cards each holding a 60ms interval is that bug, authored
 * deliberately. So this API mirrors the web's exactly: `play` defaults to "none".
 *
 * REDUCED MOTION. `rows` is always the canonical still, kept separate from `frames` by the format
 * itself, so honouring the setting costs one boolean and never needs a second asset.
 */
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'react-native-reanimated';
import Svg, { Rect } from 'react-native-svg';

import { useThemeMode } from '@/hooks/use-theme';

import { compileFrames, compileSprite, type PixelCanvas } from './compile';
import type { PixelSprite } from './types';

export type PixelPlayMode = 'none' | 'once' | 'loop';

export function PixelSpriteView({
  sprite,
  size,
  scale,
  play = 'none',
  playKey,
  frameMs,
  onAnimationEnd,
  canvas,
}: {
  sprite: PixelSprite;
  /** Rendered width in points. Ignored when `scale` is given. */
  size?: number;
  /** Integer pixel multiplier — truer to pixel art than an arbitrary size. 4 = each art pixel is 4pt. */
  scale?: number;
  play?: PixelPlayMode;
  /** Changing this replays a "once" animation, e.g. keyed on a coin balance. */
  playKey?: string | number;
  /** Overrides the sprite's authored frameMs, so one sprite can play at different speeds. */
  frameMs?: number;
  onAnimationEnd?: () => void;
  /**
   * Which background this sprite sits on. Defaults to the active theme.
   *
   * Pass `"dark"` explicitly when the sprite sits on a deliberately dark plate that does NOT
   * follow the theme — a tinted tile, a coloured card, a scrim. Getting this wrong is quiet: the
   * sprite renders, it is just the wrong contrast for what is behind it.
   *
   * See palette.ts. The shared palette is tuned for #0A090F and outlines with the deep ramp
   * because ink is invisible there; on a light page the pale steps vanish instead, which would
   * make the Investor crest (X/x/w) a white shape on a white background.
   */
  canvas?: PixelCanvas;
}) {
  const reduced = useReducedMotion();
  const mode = useThemeMode();
  const cv = canvas ?? mode;
  const still = compileSprite(sprite, cv);
  const frames = compileFrames(sprite, cv);
  const [frame, setFrame] = useState(0);
  const done = useRef(onAnimationEnd);
  done.current = onAnimationEnd;

  const animated = play !== 'none' && !reduced && frames.length > 1;

  useEffect(() => {
    if (!animated) {
      setFrame(0);
      return;
    }
    setFrame(0);
    const ms = frameMs ?? sprite.frameMs ?? 120;
    const id = setInterval(() => {
      setFrame((f) => {
        const next = f + 1;
        if (next < frames.length) return next;
        if (play === 'loop') return 0;
        // "once" parks on the LAST frame, which for these sprites is the authored still — see the
        // bolt's own note about decaying back to it.
        clearInterval(id);
        done.current?.();
        return frames.length - 1;
      });
    }, ms);
    return () => { clearInterval(id); };
  }, [animated, play, playKey, frames.length, frameMs, sprite.frameMs]);

  const shown = animated ? frames[frame] : still;
  const px = scale ? shown.width * scale : (size ?? 48);

  return (
    <Svg width={px} height={px} viewBox={`0 0 ${String(shown.width)} ${String(shown.height)}`}>
      {shown.rects.map((r, i) => (
        <Rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} fill={r.fill} />
      ))}
    </Svg>
  );
}
