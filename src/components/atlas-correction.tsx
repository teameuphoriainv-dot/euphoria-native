/**
 * The wrong-answer correction: Atlas, and what the answer actually was.
 *
 * Shared by every surface that can be got wrong (lesson choices, true/false, drag-sort, the number
 * line), which is why the reaction belongs HERE rather than at four call sites that would drift.
 *
 * ── ATLAS NOW REACTS TO BEING WRONG, WHICH HE DID NOT ───────────────────────────────────────
 * `<Atlas shake>` is a measured decaying shake that has existed in atlas.tsx the whole time. A
 * word-boundary search across src/app and src/components on 2026-09-14 found ZERO call sites for
 * it: the single most emotionally loaded moment in the app, and the mascot stood still through it.
 * Wiring it in one shared component fixes all four surfaces at once and adds no prop to any of
 * them.
 *
 * ── `oops`, NOT `whoa` ──────────────────────────────────────────────────────────────────────
 * `whoa` is the wide-eyed surprise face, and it is the right face for a gate sheet or a dismissal
 * offer, where something unexpected has just appeared. Being wrong is not a surprise, it is a
 * miss, and `oops` is the face atlas.tsx already draws for exactly that: pupils dropped to cy 32
 * and brows turned down. lesson.tsx already uses `oops` for its own wrong state, so this stops the
 * app from wearing two different faces for one event.
 */
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';

import { Atlas } from '@/components/atlas';
import { ThemedText } from '@/components/themed-text';

export function AtlasCorrection({
  show,
  answer,
  reason,
  /** Bump when a SECOND wrong answer arrives without this component unmounting, so the shake
   *  re-fires. Optional: the surfaces that mount a fresh correction per question get the reaction
   *  from the mount alone and never need to pass it. */
  attemptKey = 0,
}: { show: boolean; answer?: string; reason?: string; attemptKey?: number }) {
  const reduced = useReducedMotion();
  if (!show) return null;
  const entryMotion = reduced
    ? FadeInDown.duration(1)
    : FadeInDown.duration(380).withInitialValues({ opacity: 0, transform: [{ translateY: 20 }] });
  return (
    <Animated.View
      entering={entryMotion}
      style={styles.row}
      accessibilityRole="alert">
      {/* `shake` is a no-op under Reduced Motion (atlas.tsx guards it), so the correction still
          arrives, still says what the answer was, and simply does not move. */}
      <Atlas expression="oops" size={64} interactive={false} shake shakeKey={attemptKey} />
      <View style={styles.bubble}>
        <View style={styles.tail} accessible={false} />
        {answer ? <ThemedText style={styles.answer}>{answer}</ThemedText> : null}
        {reason ? <ThemedText style={[styles.reason, answer && styles.reasonAfter]}>{reason}</ThemedText> : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { width: '100%', flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  bubble: { position: 'relative', flex: 1, minWidth: 0, borderRadius: 16, borderTopLeftRadius: 4, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.12)', backgroundColor: '#14121C', paddingHorizontal: 16, paddingVertical: 14 },
  tail: { position: 'absolute', left: -6, top: 16, width: 10, height: 10, transform: [{ rotate: '45deg' }], backgroundColor: '#14121C', borderLeftWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.12)' },
  answer: { color: '#F1EFF5', fontSize: 14.5, lineHeight: 20, fontWeight: '700' },
  /* Tracks theme.mutedForeground by value, not by import: this bubble ships its own fixed
     dark palette (#14121C ground, #F1EFF5 answer) and never reads the theme. Lifted with the
     token on 2026-09-20 so it does not sit a shade duller than every other secondary line. */
  reason: { color: '#C6BFD2', fontSize: 13.5, lineHeight: 21 },
  reasonAfter: { marginTop: 6 },
});
