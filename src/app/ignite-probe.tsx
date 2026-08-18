/**
 * Dev probe for StreakIgnite. Deep link: euphorianative://ignite-probe
 *
 * Exists so the earned moment can be MEASURED before it is placed. Where a 3200ms celebration
 * belongs in the product is a taste call; whether it actually runs for 3200ms is not, and this
 * route answers the second question without pre-judging the first.
 *
 * Replays on a timer so a single recording captures several full cycles — one 3200ms beat inside
 * a 22s clip is easy to miss, and a burst that never fired looks identical to one that was never
 * built. Delete once the moment has a real home.
 */
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { StreakIgnite } from '@/components/streak-ignite';
import { ThemedText } from '@/components/themed-text';
import { Duration } from '@/shared/motion/tokens';

export default function IgniteProbe() {
  const [run, setRun] = useState(0);

  useEffect(() => {
    // A gap between cycles, so the measurement can tell one beat from the next.
    const gap = 1200;
    const t = setInterval(() => setRun((n) => n + 1), Duration.earned + gap);
    return () => clearInterval(t);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#09090D', justifyContent: 'center' }}>
      <ThemedText style={{ textAlign: 'center', opacity: 0.5 }} accessibilityLabel="ignite probe">
        ignite probe · cycle {run}
      </ThemedText>
      <StreakIgnite key={run} days={7} />
    </View>
  );
}
