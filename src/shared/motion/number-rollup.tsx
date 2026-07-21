/**
 * NumberRollup — eased count-up for money/XP/stats (Brilliant/Duolingo reward feel).
 * Animates 0 → value on mount via requestAnimationFrame (easeOutCubic). Reduced-motion → instant.
 * Renders as a ThemedText so it drops in anywhere a number lives.
 */
import { useEffect, useState } from 'react';
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
  const [n, setN] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      setN(value);
      return;
    }
    let raf = 0;
    let start: number | null = null;
    const tick = (t: number) => {
      if (start === null) start = t;
      const p = Math.min(1, (t - start) / duration);
      setN(value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setN(value);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, reduced]);

  return <ThemedText {...rest}>{prefix + withCommas(n) + suffix}</ThemedText>;
}
