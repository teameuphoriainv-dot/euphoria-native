import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { RiseIn } from '@/shared/motion/rise-in';

/**
 * In-theme placeholder for tabs not yet built (Phase 1). Deliberately dense — header +
 * hero card + a "what's coming" list — so it reads intentional, never vibecoded (G3).
 */
export function StubScreen({
  title,
  icon,
  blurb,
  features,
}: {
  title: string;
  icon: string;
  blurb: string;
  features: string[];
}) {
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText type="display">{title}</ThemedText>
          <Badge label="Soon" tone="primary" />
        </View>

        <RiseIn>
          <Card style={styles.hero}>
            <Icon name={icon} size={64} />
            <ThemedText type="heading" style={{ marginTop: Spacing.three }}>Building {title}</ThemedText>
            <ThemedText type="body" themeColor="mutedForeground" style={styles.blurb}>{blurb}</ThemedText>
          </Card>
        </RiseIn>

        <ThemedText type="label" themeColor="mutedForeground" style={styles.sectionLabel}>{"What's coming"}</ThemedText>
        {features.map((f, i) => (
          <RiseIn key={f} delay={80 + i * 50}>
            <Card style={styles.row}>
              <Icon name="sparkle" size={22} />
              <ThemedText type="bodyMedium" style={{ flex: 1 }}>{f}</ThemedText>
            </Card>
          </RiseIn>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: Spacing.three, paddingBottom: BottomTabInset + Spacing.four },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.three },
  hero: { alignItems: 'center', paddingVertical: Spacing.five },
  blurb: { textAlign: 'center', marginTop: Spacing.two, paddingHorizontal: Spacing.two },
  sectionLabel: { marginTop: Spacing.four, marginBottom: Spacing.two },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two + 4, marginBottom: 10 },
});
