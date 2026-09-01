import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { CHALLENGE_HINT_RESET_MS, FREE_CHALLENGE_HINTS } from '@/lib/mastery-challenge-model';
import { useApp } from '@/lib/store';

const RESET_KEY = 'euphoria_mastery_hints_reset';
const FREE_KEY = 'euphoria_mastery_hints_free';

/** Native equivalent of production web's two free hints per two-hour window plus purchased hints. */
export function useMasteryHints() {
  const purchasedHints = useApp((state) => state.hints);
  const spendPurchasedHint = useApp((state) => state.spendHint);
  const [freeHints, setFreeHints] = useState(FREE_CHALLENGE_HINTS);
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    let live = true;
    void AsyncStorage.multiGet([RESET_KEY, FREE_KEY]).then((entries) => {
      if (!live) return;
      const storedReset = Number(entries[0]?.[1]);
      const now = Date.now();
      if (!Number.isFinite(storedReset) || now - storedReset >= CHALLENGE_HINT_RESET_MS) {
        setFreeHints(FREE_CHALLENGE_HINTS);
        setRemainingMs(CHALLENGE_HINT_RESET_MS);
        void AsyncStorage.multiSet([
          [RESET_KEY, String(now)],
          [FREE_KEY, String(FREE_CHALLENGE_HINTS)],
        ]).catch(() => undefined);
        return;
      }
      const storedFree = Number(entries[1]?.[1]);
      setFreeHints(Number.isInteger(storedFree) ? Math.max(0, storedFree) : FREE_CHALLENGE_HINTS);
      setRemainingMs(Math.max(0, storedReset + CHALLENGE_HINT_RESET_MS - now));
    }).catch(() => undefined);
    return () => { live = false; };
  }, []);

  const spendHint = useCallback((): boolean => {
    if (freeHints > 0) {
      const next = freeHints - 1;
      setFreeHints(next);
      void AsyncStorage.setItem(FREE_KEY, String(next)).catch(() => undefined);
      return true;
    }
    return spendPurchasedHint();
  }, [freeHints, spendPurchasedHint]);

  return { hints: freeHints + purchasedHints, spendHint, remainingMs };
}
