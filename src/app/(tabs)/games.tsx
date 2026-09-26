/**
 * Games — hub of finance mini-games (Brilliant/Duolingo games tab). 2-col grid of game
 * cards with EUPHORIA icons plus explicit playable, Pro, and Coming Soon states.
 */
import { router } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/ambient-background';
import {
  PixelSpriteView, bolt, chartUp, chat, crack, factory, globe, ladder, lightbulb,
  magnifier, rocket, scales, stockTicker, type PixelSprite,
  stackCash,
} from '@/lib/pixel';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { Card } from '@/components/ui/card';
import { BottomTabInset, Radius, Spacing, FontSize } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import { STAGGER_CAP } from '@/shared/motion/tokens';
import { ProfileButton } from '@/components/profile-button';
import { useSharedValue } from 'react-native-reanimated';
import { CompactTitle } from '@/shared/motion/compact-title';
import { RevealScrollView } from '@/shared/motion/scroll-reveal';

/**
 * THE SPRITE LIVES ON THE ENTRY, not in a lookup keyed by name.
 *
 * A `Record<string, PixelSprite>` beside this list would let a game be added with no art and fail
 * silently — a blank tile in a 12-tile grid, which reads as a broken layout rather than as missing
 * art. That is the exact bug course-mark-pin exists to catch, and here the type system can catch it
 * for free instead: `sprite` is required, so a game with no art will not compile.
 *
 * All twelve are distinct and all come from the shared catalogue — nothing was drawn for this.
 * The pairings read the game, not its category: Budget Balancer is `scales` because the game IS a
 * balance, Credit Climb is `ladder` because it is a climb, Black Swan is `crack` because the point
 * of a black swan is the break, not the bird.
 */
const GAMES: { name: string; sprite: PixelSprite; route?: string; pro?: boolean; comingSoon?: boolean }[] = [
  { name: 'Term Match', sprite: lightbulb, route: '/games/term-match' },
  { name: 'Trend Master', sprite: chartUp, route: '/games/trend-master' },
  { name: 'Money 2048', sprite: stackCash, route: '/games/money-2048' },
  { name: 'Budget Balancer', sprite: scales, route: '/games/budget-balancer' },
  { name: 'Credit Climb', sprite: ladder, comingSoon: true },
  { name: 'Market Reaction', sprite: bolt, comingSoon: true },
  { name: 'Bias Busted', sprite: magnifier, pro: true },
  { name: 'Black Swan', sprite: crack, pro: true },
  { name: 'Trade War', sprite: globe, pro: true },
  { name: 'Invest Life', sprite: rocket, pro: true },
  { name: 'Startup Sim', sprite: factory, pro: true },
  { name: 'AI Rival', sprite: chat, pro: true },
  { name: 'Candlesticks', sprite: stockTicker, pro: true },
];

/** Status is said ONCE, by the section heading, instead of a 9pt chip on every tile. */
const SECTIONS = [
  { title: 'Play now', games: GAMES.filter((g) => g.route) },
  { title: 'Soon', games: GAMES.filter((g) => g.comingSoon) },
];
/** Pro is ONE card, not a wall of locked tiles: nine dead tiles were the heaviest thing here. */
const PRO = GAMES.filter((g) => g.pro);

export default function Games() {
  const scrollY = useSharedValue(0);
  const theme = useTheme();
  const plate = { backgroundColor: theme.primary + '18' };
  let n = 0; // running index so the stagger continues across sections
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AmbientBackground starCount={40} />
      <RevealScrollView scrollY={scrollY} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <RiseIn>
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>Games</ThemedText>
            <ProfileButton />
          </View>
        </RiseIn>

        {SECTIONS.map((sec) => (
          <View key={sec.title}>
            <ThemedText type="heading" style={styles.section}>{sec.title}</ThemedText>
            <View style={styles.grid}>
              {sec.games.map((g) => {
                const inactive = !g.route;
                const i = n++;
                return (
                  <RiseIn key={g.name} delay={Math.min(i * 40, STAGGER_CAP)} style={styles.cell}>
                    <SpringPressable
                      accessibilityLabel={`${g.name}${g.comingSoon ? ', coming soon, not playable yet' : g.pro ? ', Pro, locked' : ''}`}
                      accessibilityHint={g.route ? 'Opens the game' : 'Shows when this game is available'}
                      onPress={() => {
                        if (g.route) {
                          router.push(g.route as never);
                          return;
                        }
                        /*
                         * A STATUS CARD IS STILL A CONTROL. These entries used to be disabled, so the
                         * press animation, haptic and handler were all suppressed and tapping felt
                         * like a broken button. Keep the roadmap honest and give the tap an answer
                         * without inventing a route.
                         */
                        Alert.alert(
                          g.name,
                          g.comingSoon
                            ? 'This game is still being built and is not playable yet.'
                            : 'This Pro game is still being built and is not playable yet.',
                        );
                      }}>
                      {/* Playable tiles carry the primary depth edge so they read as tappable blocks;
                          locked ones stay neutral. The dim is on the art only -- names keep AA
                          contrast via mutedForeground at full opacity. */}
                      <Card style={[styles.gameCard, inactive && styles.flat]} {...(g.route ? { tint: theme.primary } : null)}>
                        <View style={[styles.iconBubble, plate, inactive && styles.dim]}>
                          <PixelSpriteView sprite={g.sprite} size={40} />
                        </View>
                        <ThemedText type="heading" themeColor={inactive ? 'mutedForeground' : undefined} style={styles.name}>
                          {g.name}
                        </ThemedText>
                      </Card>
                    </SpringPressable>
                  </RiseIn>
                );
              })}
            </View>
          </View>
        ))}

        <ThemedText type="heading" style={styles.section}>Pro</ThemedText>
        <RiseIn delay={Math.min(n * 40, STAGGER_CAP)}>
          <SpringPressable
            accessibilityLabel={`${String(PRO.length)} Pro games, locked: ${PRO.map((g) => g.name).join(', ')}`}
            accessibilityHint="Shows when these games are available"
            onPress={() => Alert.alert('Pro games', 'These Pro games are still being built and are not playable yet.')}>
            <Card>
              <View style={styles.proHead}>
                <ThemedText type="heading" style={{ flex: 1 }}>{`${String(PRO.length)} Pro games`}</ThemedText>
                <UIcon name="lock" size={16} color={theme.mutedForeground} />
              </View>
              <View style={styles.proStrip}>
                {PRO.map((g) => (
                  <View key={g.name} style={[styles.proIcon, plate, styles.dim]}>
                    <PixelSpriteView sprite={g.sprite} size={26} />
                  </View>
                ))}
              </View>
            </Card>
          </SpringPressable>
        </RiseIn>
      </RevealScrollView>
      <CompactTitle title="Games" scrollY={scrollY} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: Spacing.three, paddingBottom: BottomTabInset + Spacing.four },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: FontSize.titleSm },
  section: { marginTop: Spacing.four, marginBottom: Spacing.two },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: Spacing.three },
  cell: { width: '48%' },
  gameCard: { alignItems: 'center', paddingVertical: Spacing.four },
  iconBubble: { width: 68, height: 68, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  dim: { opacity: 0.6 },
  // Not playable, so not a raised block: only tiles you can open get the thick depth edge.
  flat: { borderBottomWidth: 2 },
  proHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  proStrip: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.three },
  proIcon: { width: 40, height: 40, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: FontSize.bodySm, lineHeight: 20, marginTop: Spacing.two, textAlign: 'center' },
});
