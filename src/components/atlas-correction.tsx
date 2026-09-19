import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';

import { Atlas } from '@/components/atlas';
import { ThemedText } from '@/components/themed-text';

export function AtlasCorrection({ show, answer, reason }: { show: boolean; answer?: string; reason?: string }) {
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
      <Atlas expression="whoa" size={64} interactive={false} />
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
  reason: { color: '#A79DB5', fontSize: 13.5, lineHeight: 21 },
  reasonAfter: { marginTop: 6 },
});
