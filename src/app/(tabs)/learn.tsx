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
import { Icon } from '@/components/icon';
import { PulseHalo } from '@/components/pulse-halo';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { BottomTabInset, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';

// EUPHORIA_ICONS = colorful illustration-tier art (like Brilliant's unit illustrations)
const LESSONS = [
  { title: 'What is investing?', icon: 'money-bag' },
  { title: 'Stocks & shares', icon: 'trend-line' },
  { title: 'Risk & reward', icon: 'bull' },
  { title: 'Compound growth', icon: 'gains' },
  { title: 'Diversification', icon: 'target' },
  { title: 'Bonds basics', icon: 'bank' },
  { title: 'Index funds', icon: 'bar-chart' },
  { title: 'Reading a chart', icon: 'analytics' },
  { title: 'Your first trade', icon: 'coin' },
  { title: 'Market cycles', icon: 'whale' },
  { title: 'Fees & taxes', icon: 'cash' },
  { title: 'Portfolio review', icon: 'trophy' },
];
const TOTAL = LESSONS.length;
const CURRENT = 8; // 0-indexed: 0..7 done, 8 active, 9..11 locked
const GAP = 128;
const AMP = 66;
const NODE = 66;
const START = 84;
const LIP = 6; // 3D bottom-edge depth (Duolingo button look)

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
            <SpringPressable haptic={false} onPress={() => router.push('/courses')} style={{ flex: 1 }}>
              <ThemedText type="title" style={{ fontSize: 22 }}>Investing Foundations</ThemedText>
              <ThemedText type="small" style={{ marginTop: 2, color: theme.iconLilac }}>Tap to browse all courses</ThemedText>
            </SpringPressable>
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
            const locked = n.i > CURRENT;
            const lesson = LESSONS[n.i];
            // Brilliant-style: illustration on a surface tile with a colored ring + raised lip.
            const face = active ? theme.primary + '2E' : theme.card;
            const lip = active ? '#5B21B6' : done ? theme.primary + '55' : theme.border;
            const ring = active ? theme.iconLilac : done ? theme.primary : theme.border;
            const labelLeft = n.x + n.size / 2 > cx; // put label on the empty side
            return (
              <View key={n.i} style={{ position: 'absolute', top: n.y, left: n.x - n.size / 2, width: n.size, height: n.size + LIP }}>
                {active && <PulseHalo size={n.size} color={theme.primary} />}
                <SpringPressable onPress={() => router.push('/lesson')} disabled={locked} scaleTo={0.9}>
                  {/* bottom lip */}
                  <View style={{ position: 'absolute', top: LIP, width: n.size, height: n.size, borderRadius: n.size / 2, backgroundColor: lip }} />
                  {/* face */}
                  <View
                    style={[
                      styles.node,
                      {
                        width: n.size, height: n.size, borderRadius: n.size / 2,
                        backgroundColor: face,
                        borderColor: ring,
                        borderWidth: active ? 3 : 2,
                        opacity: locked ? 0.5 : 1,
                      },
                    ]}>
                    {done && <Icon name={lesson.icon} size={38} />}
                    {active && <Icon name={lesson.icon} size={40} />}
                    {locked && <UIcon name="lock" size={22} color={theme.mutedForeground} />}
                  </View>
                </SpringPressable>
                {/* lesson title label */}
                <View style={[styles.label, labelLeft ? { right: n.size + 12, alignItems: 'flex-end' } : { left: n.size + 12 }]}>
                  <ThemedText type="smallBold" style={{ color: locked ? theme.mutedForeground : theme.text, fontSize: 13 }} numberOfLines={2}>{lesson.title}</ThemedText>
                  {active && <ThemedText type="label" style={{ color: theme.iconLilac, marginTop: 1 }}>START</ThemedText>}
                  {done && <ThemedText type="small" themeColor="mutedForeground" style={{ fontSize: 11 }}>Complete</ThemedText>}
                </View>
                {active && (
                  <View style={{ position: 'absolute', left: labelLeft ? undefined : -70, right: labelLeft ? -70 : undefined, top: -4 }}>
                    <Atlas size={60} expression="watching" interactive={false} />
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
  label: { position: 'absolute', top: 14, width: 130, justifyContent: 'center' },
});
