/**
 * /dev-beat — the iteration harness for ReadReward.
 *
 * Tuning an animation needs it replayed dozens of times. Doing that through the real reader costs
 * a deep link, four Continue taps and a fresh unread guide EVERY pass, and the guide stops being
 * unread after the first one — so the reward only fires once and the loop dies.
 *
 * Here it is one tap. Edit TUNE in read-reward.tsx, Fast Refresh, tap Replay, watch.
 *
 * Dev only: the route returns nothing in a production build, so it ships as an empty screen rather
 * than as a discoverable page. It is unreachable from any nav — reach it by deep link:
 *   xcrun simctl openurl $U "euphorianative://dev-beat"
 */
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/ambient-background';
import { ReadReward } from '@/components/read-reward';
import { ThemedText } from '@/components/themed-text';
import { GradientButton } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';

export default function DevBeat() {
  const [run, setRun] = useState(0);
  if (!__DEV__) return null;
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AmbientBackground starCount={30} />
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="label" themeColor="mutedForeground">
          Dev · ReadReward · run {run}
        </ThemedText>
        {/* keyed so a replay remounts the whole beat, entrance animations included — resetting the
            shared values alone would not re-fire RewardPop's entrances */}
        <ReadReward key={run} streak={4} runKey={run} />
      </ScrollView>
      <View style={styles.footer}>
        <GradientButton label="Replay" full onPress={() => setRun(run + 1)} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: Spacing.three, paddingTop: Spacing.four },
  footer: { padding: Spacing.four },
});
