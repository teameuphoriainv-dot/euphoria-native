/**
 * Onboarding step choreography — the Brilliant cadence, measured off refs/videos/*.mov:
 * mascot rises and fades out → a dead beat where the old content is fully gone → the new
 * headline cross-fades in → the mascot descends back into place → children stagger.
 *
 * Why a driven timeline rather than Reanimated entering/exiting: an exiting view stays in
 * FLOW until its animation finishes, so the incoming step would mount *below* the outgoing
 * one and the ScrollView's content height would roughly double mid-transition. The
 * reference has a gap, so the two steps never need to coexist — which is what makes the
 * lagging `renderStep` both simpler and jump-free.
 *
 * Every duration derives from shared/motion/tokens. No magic numbers.
 */
import type { RefObject } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ScrollView } from 'react-native';
import { useReducedMotion, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';

import { Duration, Ease, STAGGER_GAP, Spring } from './tokens';

const EXIT = Duration.fast; //                      150 — body fade + mascot rise
const GAP = Math.round(Duration.fast * 0.6); //      90 — dead beat, nothing on screen
const HEADLINE = Duration.base; //                  280 — headline cross-fade in
const ATLAS_LEAD = Duration.fast; //                150 — mascot follows the headline in

/** Children start the instant the headline lands. */
export const CHILD_BASE = GAP + HEADLINE;

/** Stagger delay for the i-th child of a step. Capped per tokens.ts ("first ~12 items"). */
export const childDelay = (i: number) => CHILD_BASE + Math.min(i, 11) * STAGGER_GAP;

export function useStepTransition(initial: number, scrollRef: RefObject<ScrollView | null>) {
  const reduced = useReducedMotion();
  /** Logical step — drives the progress bar and button label the moment the tap lands. */
  const [step, setStep] = useState(initial);
  /** Committed step — lags behind `step`, drives the body and the mascot's expression. */
  const [renderStep, setRenderStep] = useState(initial);
  const bodyOpacity = useSharedValue(reduced ? 1 : 0);
  /** 0 = risen, shrunk and transparent · 1 = at rest. Exit and entry share one path. */
  const atlasT = useSharedValue(reduced ? 1 : 0);
  const busy = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const commit = useCallback(
    (next: number) => {
      setRenderStep(next);
      // Runs while bodyOpacity is exactly 0, so the content-height change and the scroll
      // reset both happen invisibly. This is what removes the layout jump.
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      bodyOpacity.set(withDelay(GAP, withTiming(1, { duration: HEADLINE, easing: Ease.out })));
      atlasT.set(withDelay(GAP + ATLAS_LEAD, withSpring(1, Spring.smooth)));
      busy.current = false;
    },
    [scrollRef, bodyOpacity, atlasT],
  );

  const goTo = useCallback(
    (next: number) => {
      if (busy.current) return;
      setStep(next); // progress bar moves on the tap, not after the transition
      if (reduced) {
        setRenderStep(next);
        bodyOpacity.set(1);
        atlasT.set(1);
        return;
      }
      busy.current = true;
      atlasT.set(withTiming(0, { duration: EXIT, easing: Ease.inOut }));
      bodyOpacity.set(withTiming(0, { duration: EXIT, easing: Ease.inOut }));
      // Commit on a JS timer, NOT on the animation's completion callback. Reanimated fires
      // that callback with finished=false whenever the animation is cancelled — and skipping
      // the commit on that path strands `busy` at true, after which every future goTo()
      // silently no-ops and the whole flow deadlocks. Observed in testing. A timer always runs.
      clearTimeout(timer.current);
      timer.current = setTimeout(() => commit(next), EXIT);
    },
    [reduced, commit, bodyOpacity, atlasT],
  );

  // never commit into an unmounted screen
  useEffect(() => () => clearTimeout(timer.current), []);

  // Play the entrance for the first step on mount. Deliberately NOT commit() — renderStep
  // already equals `initial`, so calling it would setState synchronously in an effect for
  // no benefit. Only the animation needs starting.
  useEffect(() => {
    if (reduced) {
      bodyOpacity.set(1);
      atlasT.set(1);
      return;
    }
    bodyOpacity.set(withDelay(GAP, withTiming(1, { duration: HEADLINE, easing: Ease.out })));
    atlasT.set(withDelay(GAP + ATLAS_LEAD, withSpring(1, Spring.smooth)));
    // Mount-only: re-running this would replay the entrance mid-flow.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { step, renderStep, bodyOpacity, atlasT, goTo };
}
