/**
 * Compound Growth Lab — an interactive explorable (Brilliant-style). Adjust monthly
 * contribution, years, and return rate with steppers; the future value + growth curve
 * update live. Shows the "money makes money" intuition without a single formula on screen.
 */
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient as SvgGradient, Path, Stop } from 'react-native-svg';

import { AmbientBackground } from '@/components/ambient-background';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { Card } from '@/components/ui/card';
import { Radius, Spacing, FontSize } from '@/constants/theme';
import { NumberRollup } from '@/shared/motion/number-rollup';
import { useTheme } from '@/hooks/use-theme';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';

/** Future value of a monthly contribution compounded monthly over `years` at annual `rate`%. */
function futureValue(monthly: number, years: number, ratePct: number) {
  const r = ratePct / 100 / 12;
  const n = years * 12;
  if (r === 0) return monthly * n;
  return monthly * ((Math.pow(1 + r, n) - 1) / r);
}

function Stepper({ label, value, onDec, onInc }: { label: string; value: string; onDec: () => void; onInc: () => void }) {
  const theme = useTheme();
  return (
    <Card style={styles.stepper}>
      <ThemedText type="small" themeColor="mutedForeground">{label}</ThemedText>
      <View style={styles.stepRow}>
        <SpringPressable scaleTo={0.88} onPress={onDec}>
          <View style={[styles.stepBtn, { borderColor: theme.border }]}><ThemedText type="heading" style={{ fontSize: FontSize.headingLg }}>−</ThemedText></View>
        </SpringPressable>
        <ThemedText type="heading" style={{ fontSize: FontSize.subhead, minWidth: 84, textAlign: 'center' }}>{value}</ThemedText>
        <SpringPressable scaleTo={0.88} onPress={onInc}>
          <View style={[styles.stepBtn, { borderColor: theme.border, backgroundColor: theme.primary + '22' }]}><ThemedText type="heading" style={{ fontSize: FontSize.headingLg, color: theme.iconLilac }}>+</ThemedText></View>
        </SpringPressable>
      </View>
    </Card>
  );
}

export default function CompoundLab() {
  const theme = useTheme();
  const [monthly, setMonthly] = useState(200);
  const [years, setYears] = useState(20);
  const [rate, setRate] = useState(7);

  const fv = Math.round(futureValue(monthly, years, rate));
  const contributed = monthly * years * 12;
  const growth = fv - contributed;

  // build a growth curve path across the years
  const path = useMemo(() => {
    const pts: string[] = [];
    for (let y = 0; y <= years; y++) {
      const v = futureValue(monthly, y, rate);
      const x = (y / years) * 320;
      const yy = 96 - (v / (fv || 1)) * 92;
      pts.push(`${x.toFixed(1)} ${yy.toFixed(1)}`);
    }
    return 'M' + pts.join(' L');
  }, [monthly, years, rate, fv]);

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AmbientBackground starCount={30} glow={false} />
      <View style={styles.content}>
        <SpringPressable haptic={false} onPress={() => router.back()} style={styles.back}>
          <UIcon name="chevronLeft" size={22} color={theme.mutedForeground} />
          {/* "Explore" named a section that does not exist — this is reached from a lesson step. */}
          <ThemedText type="small" themeColor="mutedForeground">Back</ThemedText>
        </SpringPressable>

        <RiseIn>
          {/* Capped: at AX5 a 24pt title reaches ~75pt and "Compound" alone outgrows the line,
              breaking mid-word as "Compou / nd". 1.6 keeps whole words on whole lines. */}
          <ThemedText type="title" maxFontSizeMultiplier={1.6} style={{ fontSize: FontSize.title }}>Compound Growth Lab</ThemedText>
          <ThemedText type="body" themeColor="mutedForeground" style={{ marginTop: 4 }}>See how small, steady investing snowballs.</ThemedText>
        </RiseIn>

        <RiseIn delay={80}>
          <Card style={styles.resultCard} elevated>
            <ThemedText type="label" themeColor="mutedForeground">In {years} years you&apos;d have</ThemedText>
            {/* SPLIT NUMBER guard: displayLg reaches ~106pt at AX5 and a projection wrapping
                mid-figure reads as a different amount. Numeric data gets cap + one line, the
                opposite of the treatment prose gets in this codebase. */}
            <NumberRollup value={fv} prefix="$" duration={600} type="display" maxFontSizeMultiplier={1.6} numberOfLines={1} style={{ fontSize: FontSize.displayLg, marginTop: 2 }} />
            <View style={styles.splitRow}>
              {/* 'en-US' pinned, matching lib/stocks.ts money(). The $ here is a LITERAL character in
                  JSX text, so an unpinned number renders "$42.000" on a German phone — a US symbol
                  wired to European separators. The locale lane reported 0 of these until its regex
                  learned the JSX shape; it only knew the template-literal one. */}
              <ThemedText type="small" themeColor="mutedForeground">You put in ${contributed.toLocaleString('en-US')}</ThemedText>
              <ThemedText type="smallBold" style={{ color: theme.success }}>+${growth.toLocaleString('en-US')} growth</ThemedText>
            </View>
            <Svg width="100%" height={100} viewBox="0 0 320 100" preserveAspectRatio="none" style={{ marginTop: Spacing.two }}>
              <Defs>
                <SvgGradient id="carea" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={theme.iconLilac} stopOpacity={0.35} />
                  <Stop offset="1" stopColor={theme.iconLilac} stopOpacity={0.02} />
                </SvgGradient>
              </Defs>
              <Path d={`${path} L320 100 L0 100 Z`} fill="url(#carea)" />
              <Path d={path} stroke={theme.iconLilac} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Card>
        </RiseIn>

        <View style={{ gap: Spacing.two + 2, marginTop: Spacing.three }}>
          <RiseIn delay={140}><Stepper label="Monthly investment" value={`$${monthly}`} onDec={() => setMonthly(Math.max(50, monthly - 50))} onInc={() => setMonthly(monthly + 50)} /></RiseIn>
          <RiseIn delay={190}><Stepper label="Years" value={`${years} yr`} onDec={() => setYears(Math.max(1, years - 1))} onInc={() => setYears(Math.min(50, years + 1))} /></RiseIn>
          <RiseIn delay={240}><Stepper label="Annual return" value={`${rate}%`} onDec={() => setRate(Math.max(1, rate - 1))} onInc={() => setRate(Math.min(15, rate + 1))} /></RiseIn>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1, padding: Spacing.three },
  back: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: Spacing.two },
  resultCard: { marginTop: Spacing.three },
  splitRow: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.two },
  stepper: { gap: Spacing.two },
  stepRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: Spacing.two },
  stepBtn: { width: 46, height: 46, borderRadius: Radius.md, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' },
});
