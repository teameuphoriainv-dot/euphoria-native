/**
 * NumberRollup — eased count-up for money/XP/stats (Brilliant/Duolingo reward feel).
 * Animates 0 → value on mount via requestAnimationFrame (easeOutCubic). Reduced-motion → instant.
 * Renders as a ThemedText so it drops in anywhere a number lives.
 */
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'react-native-reanimated';

import { ThemedText, type ThemedTextProps } from '@/components/themed-text';

function withCommas(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function NumberRollup({
  value,
  prefix = '',
  suffix = '',
  duration = 900,
  ...rest
}: Omit<ThemedTextProps, 'children'> & { value: number; prefix?: string; suffix?: string; duration?: number }) {
  /*
   * TEXT, NOT A NUMBER, IS THE STATE — because the number changes far more often than the text.
   *
   * MEASURED 2026-08-21 by profiling the running app: this called setState on EVERY animation
   * frame, so a 900ms count is about 54 re-renders of the component and everything under it.
   *
   * Two things fix most of that without changing what is rendered:
   *
   *   1. Store the STRING. `withCommas` rounds, so on small values many consecutive frames
   *      produce byte-identical text -- an XP counter running 0 to 30 has 54 frames and at most
   *      31 distinct strings. Comparing the string skips those renders entirely, and React's own
   *      bail-out on an unchanged value does the rest.
   *   2. Cap the update rate. Digits changing faster than about 24 times a second cannot be read;
   *      past that the extra renders buy nothing a viewer can perceive.
   *
   * WHAT THIS IS NOT: the complete fix. That is a Reanimated shared value driving
   * `animatedProps.text` on a TextInput, which never touches the React render path at all. It is
   * not done here because it swaps the rendered element away from ThemedText -- which carries the
   * theme colour and type scale -- on a MONEY display, and that trade needs typography verified
   * on device rather than assumed at speed.
   */
  const [text, setText] = useState(() => prefix + withCommas(0) + suffix);
  const reduced = useReducedMotion();
  /*
   * COUNT FROM WHAT IS SHOWING, not from 0. This rendered value * ease(p), so EVERY change counted
   * up from zero again: a 2048 score replayed 0 -> score on each merge, a calculator projection
   * restarted at $0 on each tap. `shown` is the number currently on screen (updated per frame), so
   * a change rolls old -> new, and a change landing mid-count carries on from where it is. First
   * mount still counts up from 0, which is the reveal every reward call site wants.
   */
  const shown = useRef(0);

  useEffect(() => {
    const render = (v: number) => prefix + withCommas(v) + suffix;
    if (reduced) {
      // Reduced Motion takes the instant path: land on the final value instead of animating to
      // it. One render, then return -- there is no rAF loop on this branch.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setText(render(value));
      shown.current = value;
      return;
    }
    const from = shown.current;
    let raf = 0;
    let start: number | null = null;
    let lastAt = 0;
    let lastText = '';
    const MIN_GAP_MS = 1000 / 24;
    const tick = (t: number) => {
      if (start === null) start = t;
      const p = Math.min(1, (t - start) / duration);
      if (p >= 1) {
        shown.current = value;
        setText(render(value));
        return;
      }
      if (t - lastAt >= MIN_GAP_MS) {
        lastAt = t;
        const v = from + (value - from) * (1 - Math.pow(1 - p, 3));
        shown.current = v;
        const next = render(v);
        // Identical text means an identical tree; skipping it costs the viewer nothing.
        if (next !== lastText) {
          lastText = next;
          setText(next);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, reduced, prefix, suffix]);

  return <ThemedText {...rest}>{text}</ThemedText>;
}
