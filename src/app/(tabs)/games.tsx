/**
 * Games — hub of finance mini-games (Brilliant/Duolingo games tab). 2-col grid of game
 * cards with EUPHORIA icons + free/pro locks. Term Match is playable; others are stubs.
 */
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/ambient-background';
import { Icon } from '@/components/icon';
import { type EuphoriaIconName } from '@/lib/euphoria-icons';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { Card } from '@/components/ui/card';
import { BottomTabInset, Radius, Spacing, FontSize } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import { STAGGER_CAP } from '@/shared/motion/tokens';

const GAMES: { name: string; icon: EuphoriaIconName; route?: string; pro?: boolean }[] = [
  { name: 'Term Match', icon: 'brain', route: '/games/term-match' },
  { name: 'Trend Master', icon: 'trend-line' },
  { name: 'Budget Balancer', icon: 'cash' },
  { name: 'Credit Climb', icon: 'bank' },
  { name: 'Market Reaction', icon: 'bolt' },
  { name: 'Bias Busted', icon: 'target', pro: true },
  { name: 'Black Swan', icon: 'whale', pro: true },
  { name: 'Trade War', icon: 'sword', pro: true },
  { name: 'Invest Life', icon: 'rocket', pro: true },
  { name: 'Startup Sim', icon: 'building', pro: true },
  { name: 'AI Rival', icon: 'alien', pro: true },
  { name: 'Candlesticks', icon: 'bar-chart', pro: true },
];

export default function Games() {
  const theme = useTheme();
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AmbientBackground starCount={40} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <RiseIn>
          <ThemedText type="title" style={{ fontSize: FontSize.titleSm }}>Games</ThemedText>
          <ThemedText type="small" themeColor="mutedForeground">Learn by playing. Concepts become muscle memory.</ThemedText>
        </RiseIn>

        <View style={styles.grid}>
          {GAMES.map((g, i) => (
            <RiseIn key={g.name} delay={Math.min(i * 40, STAGGER_CAP)} style={styles.cell}>
              <SpringPressable onPress={() => g.route && router.push(g.route as never)} disabled={!!g.pro}>
                <Card style={[styles.gameCard, g.pro && { opacity: 0.6 }]}>
                  {g.pro && (
                    <View style={[styles.proBadge, { backgroundColor: theme.warning + '2A' }]}>
                      <UIcon name="lock" size={11} color={theme.warning} />
                      <ThemedText type="label" style={{ color: theme.warning, fontSize: FontSize.micro }}>Pro</ThemedText>
                    </View>
                  )}
                  <View style={[styles.iconBubble, { backgroundColor: theme.primary + '18' }]}>
                    <Icon name={g.icon} size={40} />
                  </View>
                  <ThemedText type="heading" style={{ fontSize: FontSize.bodySm, lineHeight: 20, marginTop: Spacing.two }}>{g.name}</ThemedText>
                </Card>
              </SpringPressable>
            </RiseIn>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: Spacing.three, paddingBottom: BottomTabInset + Spacing.four },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three, marginTop: Spacing.four },
  cell: { width: '47%', flexGrow: 1 },
  gameCard: { alignItems: 'center', paddingVertical: Spacing.four },
  iconBubble: { width: 68, height: 68, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  proBadge: { position: 'absolute', top: 10, right: 10, flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: Radius.pill },
});
