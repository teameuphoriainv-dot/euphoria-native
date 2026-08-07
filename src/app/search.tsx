/**
 * Ticker search — every active US-listed stock, not the seven in `lib/stocks.ts`.
 *
 * Backed by Polygon `/v3/reference/tickers`, so NYSE, NASDAQ and AMEX are all in scope. Yahoo
 * Finance keeps a search field permanently in its header and Deepstash keeps one at the top of the
 * feed; the shared idea is that search is the entry point to the catalogue, not a feature buried
 * in a menu.
 *
 * Debounced because every keystroke is an upstream request against a rate-limited key. 250ms is
 * below the threshold where typing feels laggy and well above per-character.
 */
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/ambient-background';
import { ThemedText } from '@/components/themed-text';
import { TickerLogo } from '@/components/ticker-logo';
import { UIcon } from '@/components/ui-icon';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { searchTickers, type TickerHit } from '@/lib/market';
import { SpringPressable } from '@/shared/motion/spring-pressable';

export default function Search() {
  const theme = useTheme();
  const [q, setQ] = useState('');
  // Results carry the term they answer, so "loading" is derived rather than flag-managed — no
  // setState in the effect body, and a stale result can never render under a newer query.
  const [hits, setHits] = useState<{ term: string; results: TickerHit[] } | null>(null);
  const seq = useRef(0);
  const term = q.trim();
  const loading = term.length > 0 && hits?.term !== term;
  const results = !term || loading ? null : (hits?.results ?? null);

  useEffect(() => {
    const term = q.trim();
    if (!term) return;
    // Guard against out-of-order responses: a slow "AA" must not overwrite a fast "AAPL".
    const mine = ++seq.current;
    const t = setTimeout(() => {
      searchTickers(term).then((r) => {
        if (mine !== seq.current) return;
        setHits({ term, results: r });
      });
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AmbientBackground starCount={22} glow={false} />

      <View style={styles.head}>
        <SpringPressable
          haptic={false}
          onPress={() => router.back()}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <UIcon name="chevronLeft" size={22} color={theme.mutedForeground} />
        </SpringPressable>
        <View style={[styles.field, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <UIcon name="search" size={17} color={theme.mutedForeground} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search any stock — name or ticker"
            placeholderTextColor={theme.mutedForeground}
            autoFocus
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={() => Keyboard.dismiss()}
            style={[styles.input, { color: theme.text }]}
            accessibilityLabel="Search stocks"
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
        {loading && <ActivityIndicator color={theme.primary} style={{ marginTop: Spacing.four }} />}

        {!loading && !term && (
          <ThemedText type="small" themeColor="mutedForeground" style={styles.hint}>
            Try AAPL, Ford, or an index fund.
          </ThemedText>
        )}

        {!loading && results?.length === 0 && (
          <ThemedText type="small" themeColor="mutedForeground" style={styles.hint}>
            {/* Distinguishes "no matches" from "no live data" — collapsing the two hides a missing
                key behind an apparently empty market. */}
            Nothing matched “{term}”. Live search may also be switched off in this build.
          </ThemedText>
        )}

        {results?.map((h, i) => (
          <SpringPressable
            key={`${h.sym}-${i}`}
            onPress={() => router.push(`/stock/${h.sym}`)}
            accessibilityRole="button"
            accessibilityLabel={`${h.sym}, ${h.name}`}
          >
            <View style={[styles.row, { borderBottomColor: theme.border }]}>
              <TickerLogo sym={h.sym} size={42} />
              <View style={{ flex: 1 }}>
                <ThemedText type="bodyMedium" numberOfLines={1}>{h.name}</ThemedText>
                <ThemedText type="small" themeColor="mutedForeground">
                  {h.sym}{h.exchange ? ` · ${h.exchange}` : ''}
                </ThemedText>
              </View>
              <UIcon name="arrowRight" size={16} color={theme.mutedForeground} />
            </View>
          </SpringPressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  head: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, padding: Spacing.three },
  field: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.three,
    height: 44,
  },
  input: { flex: 1, fontSize: 15 },
  list: { paddingHorizontal: Spacing.three, paddingBottom: Spacing.six },
  hint: { textAlign: 'center', marginTop: Spacing.four },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tick: { width: 42, height: 42, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
});
