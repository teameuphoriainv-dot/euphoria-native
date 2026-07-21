/**
 * Learn — the Duolingo-style pathway trail (design mockup 2). Serpentine lesson nodes
 * (done / current / locked) with a dashed connector, START on the active node, Atlas
 * peeking alongside. Mock course data until Phase 3 wires real pathway progress.
 */
import { router } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { AmbientBackground } from '@/components/ambient-background';
import { Atlas } from '@/components/atlas';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { BottomTabInset, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';

const TOTAL = 12;
const CURRENT = 8; // 0-indexed: 0..7 done, 8 active, 9..11 locked
const GAP = 118;
const AMP = 64;
const NODE = 58;
const START = 78;

export default function Learn() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const cx = (width - Spacing.three * 2) / 2;

  const nodes = useMemo(
    () =>
      Array.from({ length: TOTAL }, (_, i) => {
        const size = i === CURRENT ? START : NODE;
        return { i, y: i * GAP, x: cx + Math.sin(i * 0.8) * AMP, size };
      }),
    [cx],
  );

  const trailHeight = (TOTAL - 1) * GAP + START;
  const pathD = nodes.map((n, i) => `${i === 0 ? 'M' : 'L'} ${n.x} ${n.y + START / 2}`).join(' ');

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AmbientBackground starCount={45} />

      {/* Sticky header */}
      <RiseIn>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <ThemedText type="title" style={{ fontSize: 22 }}>Investing Foundations</ThemedText>
              <ThemedText type="small" themeColor="mutedForeground" style={{ marginTop: 2 }}>Unit 1 · {CURRENT} of {TOTAL} lessons</ThemedText>
            </View>
            <View style={[styles.countPill, { backgroundColor: theme.primary + '24', borderColor: theme.primary + '4D' }]}>
              <ThemedText type="smallBold" style={{ color: theme.iconLilac }}>{CURRENT}/{TOTAL}</ThemedText>
            </View>
          </View>
          <View style={[styles.track, { backgroundColor: theme.muted }]}>
            <View style={[styles.fill, { backgroundColor: theme.primary, width: `${(CURRENT / TOTAL) * 100}%` }]} />
          </View>
        </View>
      </RiseIn>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={{ height: trailHeight, marginTop: Spacing.four }}>
          {/* Dashed connector behind nodes */}
          <Svg style={StyleSheet.absoluteFill} width={width} height={trailHeight}>
            <Path d={pathD} stroke={theme.border} strokeWidth={3} strokeDasharray="1 12" strokeLinecap="round" fill="none" />
          </Svg>

          {nodes.map((n) => {
            const done = n.i < CURRENT;
            const active = n.i === CURRENT;
            return (
              <View key={n.i} style={{ position: 'absolute', top: n.y, left: n.x - n.size / 2 }}>
                <SpringPressable onPress={() => router.push('/lesson')} disabled={n.i > CURRENT}>
                  <View
                    style={[
                      styles.node,
                      {
                        width: n.size,
                        height: n.size,
                        borderRadius: n.size / 2,
                        backgroundColor: done ? theme.primary : active ? theme.primary : theme.card,
                        borderColor: active ? theme.iconLilac : done ? theme.primary : theme.border,
                        borderWidth: active ? 3 : done ? 0 : StyleSheet.hairlineWidth,
                      },
                      active && { shadowColor: theme.primary, shadowOpacity: 0.7, shadowRadius: 16, shadowOffset: { width: 0, height: 0 } },
                    ]}>
                    {done && <UIcon name="check" size={26} color="#fff" strokeWidth={3} />}
                    {active && <ThemedText type="heading" style={{ fontSize: 14, color: '#fff' }}>START</ThemedText>}
                    {n.i > CURRENT && <UIcon name="lock" size={22} color={theme.mutedForeground} />}
                  </View>
                </SpringPressable>
                {active && (
                  <View style={{ position: 'absolute', left: n.size + 6, top: -6 }}>
                    <Atlas size={64} expression="watching" interactive={false} />
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: Spacing.three, paddingTop: Spacing.two },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two },
  countPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.pill, borderWidth: 1 },
  track: { height: 6, borderRadius: 6, overflow: 'hidden', marginTop: Spacing.three },
  fill: { height: 6, borderRadius: 6 },
  content: { paddingHorizontal: Spacing.three, paddingBottom: BottomTabInset + Spacing.five },
  node: { alignItems: 'center', justifyContent: 'center' },
});
