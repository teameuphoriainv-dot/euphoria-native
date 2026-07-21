import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Atlas } from '@/components/atlas';
import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { GradientButton } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { BottomTabInset, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';

export default function Home() {
  const theme = useTheme();
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Greeting + streak */}
        <RiseIn>
          <View style={styles.headerRow}>
            <View>
              <ThemedText type="small" themeColor="mutedForeground">Good evening</ThemedText>
              <ThemedText type="title">Welcome back</ThemedText>
            </View>
            <View style={[styles.streak, { backgroundColor: theme.warning + '22' }]}>
              <Icon name="flame" size={18} />
              <ThemedText type="smallBold" style={{ color: theme.warning }}>7</ThemedText>
            </View>
          </View>
        </RiseIn>

        {/* Continue learning */}
        <RiseIn delay={70}>
          <Card style={styles.block}>
            <View style={styles.rowBetween}>
              <Badge label="Continue" tone="primary" />
              <ThemedText type="small" themeColor="mutedForeground">Lesson 8 of 25</ThemedText>
            </View>
            <ThemedText type="heading" style={{ marginTop: Spacing.two }}>Investing Fundamentals</ThemedText>
            <ThemedText type="body" themeColor="mutedForeground" style={{ marginTop: 2 }}>Diversification & risk</ThemedText>
            <View style={styles.progressRow}>
              <ProgressBar value={0.32} />
              <ThemedText type="smallBold" themeColor="mutedForeground">32%</ThemedText>
            </View>
            <GradientButton label="Resume lesson" full style={{ marginTop: Spacing.three }} onPress={() => router.push('/learn')} />
          </Card>
        </RiseIn>

        {/* Stat row */}
        <View style={styles.statRow}>
          <RiseIn delay={130} style={styles.statHalf}>
            <Card>
              <View style={styles.rowBetween}>
                <ThemedText type="label" themeColor="mutedForeground">Portfolio</ThemedText>
                <Icon name="bar-chart" size={18} />
              </View>
              <ThemedText type="title" style={{ marginTop: Spacing.one }}>$12,480</ThemedText>
              <ThemedText type="smallBold" style={{ color: theme.success, marginTop: 2 }}>+2.4% today</ThemedText>
            </Card>
          </RiseIn>
          <RiseIn delay={180} style={styles.statHalf}>
            <Card>
              <View style={styles.rowBetween}>
                <ThemedText type="label" themeColor="mutedForeground">Level 6</ThemedText>
                <Icon name="crown" size={18} />
              </View>
              <ThemedText type="title" style={{ marginTop: Spacing.one }}>2,340</ThemedText>
              <ThemedText type="smallBold" themeColor="mutedForeground" style={{ marginTop: 2 }}>XP · 160 to go</ThemedText>
            </Card>
          </RiseIn>
        </View>

        {/* Daily challenge */}
        <RiseIn delay={230}>
          <SpringPressable onPress={() => {}}>
            <Card style={styles.listRow}>
              <View style={[styles.iconBubble, { backgroundColor: theme.primary + '22' }]}>
                <Icon name="target" size={26} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText type="bodyMedium">Daily Challenge</ThemedText>
                <ThemedText type="small" themeColor="mutedForeground">5 questions · +50 XP</ThemedText>
              </View>
              <Icon name="ui-arrow" size={20} />
            </Card>
          </SpringPressable>
        </RiseIn>

        {/* Atlas coach */}
        <RiseIn delay={280}>
          <SpringPressable onPress={() => {}}>
            <Card style={styles.atlasRow}>
              <Atlas size={60} />
              <View style={{ flex: 1 }}>
                <ThemedText type="bodyMedium">Ask Atlas</ThemedText>
                <ThemedText type="small" themeColor="mutedForeground">Stuck on a concept? Your AI coach explains anything.</ThemedText>
              </View>
              <Icon name="ui-arrow" size={20} />
            </Card>
          </SpringPressable>
        </RiseIn>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: Spacing.three, paddingBottom: BottomTabInset + Spacing.four, gap: Spacing.three },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.pill },
  block: {},
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginTop: Spacing.three },
  statRow: { flexDirection: 'row', gap: Spacing.three },
  statHalf: { flex: 1 },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two + 4 },
  iconBubble: { width: 48, height: 48, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  atlasRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two + 4 },
});
