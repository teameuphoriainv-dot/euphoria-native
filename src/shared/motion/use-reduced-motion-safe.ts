/**
 * Reduced-motion is first-class (guardrail G4). Every motion primitive checks this and
 * degrades to opacity-only / instant. Wraps Reanimated's reduced-motion signal.
 */
import { useReducedMotion } from 'react-native-reanimated';

export function useReducedMotionSafe(): boolean {
  return useReducedMotion();
}
