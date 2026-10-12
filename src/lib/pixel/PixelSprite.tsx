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
import { memo, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { useThemeMode } from '@/hooks/use-theme';

import { compileFrames, compileSprite, type PixelCanvas } from './compile';
import type { CompiledSprite, PixelSprite } from './types';

/**
 * ONE <Path> PER COLOUR, not one <Rect> per rect.
 *
 * react-native-svg backs every element with a NATIVE VIEW, and this renderer emitted a <Rect>
 * each. MEASURED by running compile.ts over the whole catalogue: 84 sprites, 2433 rects, mean 29
 * per sprite. A sprite only uses a handful of palette steps, so grouping by fill gives 305 paths
 * total — mean 3.6, an 8.0x reduction. (An earlier estimate off the raw ASCII said ~137 rects a
 * sprite; that counted horizontal runs only and missed how much the greedy mesh merges VERTICALLY.
 * The 29 is the real figure, from the real compiler.)
 *
 * Home draws roughly twenty sprites across the header pills, quest card, course rail and tab bar,
 * so this is ~580 native views down to ~70 in one ScrollView. That is a contributor to the
 * ~0.1-0.2s input lag reported on TestFlight, not on its own the whole of it. What it is NOT is a
 * backend problem: nothing on Home touches the network while you scroll.
 *
 * Identical output:
 * the mesh emits non-overlapping rects and every subpath is wound the same way (right, down, left,
 * close), so the default nonzero fill rule paints exactly what the rects did. Do NOT switch this
 * to evenodd — shared edges between adjacent rects would cancel and punch holes in the art.
 *
 * Keyed on the COMPILED sprite, which compile.ts already caches per (sprite, canvas), so this runs
 * once per sprite per theme for the life of the app rather than once per render.
 *
 * This lives here, and not in compile.ts, on purpose: compile/types/palette/sprites/catalogue are
 * byte-for-byte copies of the web's and must stay re-copyable. A renderer optimisation belongs in
 * the renderer, which is the one file in this folder that was never the web's.
 */
const pathCache = new WeakMap<CompiledSprite, { fill: string; d: string }[]>();

export function pathsFor(c: CompiledSprite): { fill: string; d: string }[] {
  const hit = pathCache.get(c);
  if (hit) return hit;
  const byFill = new Map<string, string>();
  for (const r of c.rects) {
    byFill.set(r.fill, (byFill.get(r.fill) ?? '') + `M${String(r.x)} ${String(r.y)}h${String(r.w)}v${String(r.h)}h${String(-r.w)}z`);
  }
  const out = [...byFill].map(([fill, d]) => ({ fill, d }));
  pathCache.set(c, out);
  return out;
}

export type PixelPlayMode = 'none' | 'once' | 'loop';

function PixelSpriteViewInner({
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

  /*
   * LATEST-REF, WRITTEN IN AN EFFECT. Assigning `done.current` during render is a ref write in the
   * render phase, which React can discard under Strict Mode and concurrent rendering — the callback
   * would silently never fire. The effect has no dependency array on purpose: it must run after
   * EVERY render so the interval's closure always calls the newest `onAnimationEnd`, which is the
   * entire reason this is a ref rather than a dependency.
   */
  const done = useRef(onAnimationEnd);
  useEffect(() => {
    done.current = onAnimationEnd;
  });

  const animated = play !== 'none' && !reduced && frames.length > 1;

  /*
   * RESTARTING THE SEQUENCE IS A RENDER-PHASE ADJUSTMENT, NOT AN EFFECT.
   *
   * The sequence must start at frame 0 whenever the run changes — a new `playKey` is how a caller
   * replays a "once" animation (the coin on a balance change, the flame on a streak). That used to
   * be `setFrame(0)` inside the interval effect, which is a synchronous setState in an effect: it
   * schedules a SECOND render pass for every sprite on mount, and this repo has an open
   * idle-render investigation measuring 4-5 commits per second while completely idle.
   *
   * Comparing the run against the previous one during render is React's own documented pattern for
   * adjusting state when a prop changes. It re-renders immediately with the corrected value instead
   * of painting a stale frame and then correcting it.
   */
  const runId = `${String(animated)}|${play}|${String(playKey ?? '')}`;
  const [prevRun, setPrevRun] = useState(runId);
  if (runId !== prevRun) {
    setPrevRun(runId);
    setFrame(0);
  }

  useEffect(() => {
    if (!animated) return;
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
  /* A SCALED sprite is as tall as its own rows. The box used to be px by px whatever the art's
     shape, which is right for the 16x16 catalogue and wrong for scene art: an 80x60 scene at scale
     4 got a 320x320 box, was letterboxed 40pt down inside it, and its layers (placed from the
     scene's true top-left) landed 40pt above the picture they belong to. `size` keeps the square
     box, so every existing call site renders exactly as before. */
  const pxHigh = scale ? shown.height * scale : px;

  return (
    <Svg width={px} height={pxHigh} viewBox={`0 0 ${String(shown.width)} ${String(shown.height)}`}>
      {pathsFor(shown).map((p) => (
        <Path key={p.fill} d={p.d} fill={p.fill} />
      ))}
    </Svg>
  );
}

/*
 * MEMOISED, FOR THE REASON ambient-background.tsx ALREADY PROVED ON THIS CODEBASE.
 *
 * That file carries a measurement from 2026-08-20: profiling five vertical scrolls, four rail
 * drags and three scroll-backs gave 131 commits in which `Circle` ALONE accounted for 14,629 —
 * about 1.75s of self time redrawing a background that never changed. The cause was not computing
 * the stars (already useMemo'd) but RE-CREATING and reconciling the elements every time a parent
 * re-rendered, and a scroll re-renders the screen. Wrapping it in memo() fixed it.
 *
 * This renderer had precisely the same shape and was never wrapped. Every sprite rebuilt its full
 * element list on any parent re-render — measured at mean 29 rects a sprite before the path
 * batching above, across roughly twenty sprites on Home. That is the same defect the starfield had,
 * in the art that is on every single screen, and it is the strongest candidate for the ~0.1-0.2s
 * input lag reported on TestFlight.
 *
 * WHY A CUSTOM COMPARATOR. Every prop but one is a primitive or a module-scope sprite object, so
 * the default shallow compare would be exactly right — except `onAnimationEnd`, which callers pass
 * as an inline arrow that is a new function identity on every render and would defeat the memo
 * completely. It is already latched into a ref by the effect above (written there rather than in
 * render, so Strict Mode cannot discard it), and the whole point of that ref is that the interval
 * always calls the NEWEST callback. So skipping it here is not merely safe, it is what makes the
 * latch worth having.
 */
export const PixelSpriteView = memo(PixelSpriteViewInner, (a, b) =>
  a.sprite === b.sprite &&
  a.size === b.size &&
  a.scale === b.scale &&
  a.play === b.play &&
  a.playKey === b.playKey &&
  a.frameMs === b.frameMs &&
  a.canvas === b.canvas,
);
