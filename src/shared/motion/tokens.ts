/**
 * Euphoria motion tokens — ported from euphoriaweb-current/src/shared/motion/tokens.ts
 * (the co-founder's Brilliant-caliber motion system). Reanimated-shaped spring configs.
 */
import { Easing } from 'react-native-reanimated';

export const Spring = {
  smooth: { stiffness: 260, damping: 30, mass: 1 },
  gentle: { stiffness: 180, damping: 26, mass: 1 },
  bouncy: { stiffness: 500, damping: 18, mass: 1 },
  snappy: { stiffness: 420, damping: 32, mass: 1 },
} as const;

export const Duration = {
  fast: 150,
  base: 280,
  slow: 400,
  count: 900,
} as const;

export const Ease = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.4, 0, 0.2, 1),
  outCubic: Easing.out(Easing.cubic),
} as const;

/** Stagger gap between children in a region (first ~12 items). */
export const STAGGER_GAP = 60;
