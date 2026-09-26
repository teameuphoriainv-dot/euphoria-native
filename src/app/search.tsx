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
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { EmptyState } from '@/components/empty-state';
import { Keyboard, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/ambient-background';
import { RetryNotice } from '@/components/retry-notice';
import { SkeletonRows } from '@/components/skeleton';
import { ThemedText } from '@/components/themed-text';
import { TickerLogo } from '@/components/ticker-logo';
import { UIcon } from '@/components/ui-icon';
import { Radius, Spacing, FontSize, Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { searchTickers, type TickerHit } from '@/lib/market';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import { STAGGER_CAP, STAGGER_GAP } from '@/shared/motion/tokens';

export default function Search() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ qa?: string }>();
  const qa = __DEV__ ? params.qa : undefined;
  const [q, setQ] = useState(() => (qa ? 'ZZZZQATEST' : ''));
  // Results carry the term they answer, so "loading" is derived rather than flag-managed — no
  // setState in the effect body, and a stale result can never render under a newer query.
  const [hits, setHits] = useState<{ term: string; results: TickerHit[] } | null>(null);
  /*
   * searchTickers().then() had no .catch(). Because `loading` is DERIVED as
   * `hits?.term !== term`, a rejected request never sets hits, so loading stays true and the
   * skeleton runs forever — the same hung-loading shape options.tsx had, reached by the same
   * missing rejection path. Five requests a minute makes typing into this box a normal way to
   * hit it.
   */
  const [err, setErr] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  const retry = useCallback(() => {
    setErr(null);
    setNonce((n) => n + 1);
  }, []);
  const seq = useRef(0);
  const term = q.trim();
  const loading = qa === 'loading' || (!qa && term.length > 0 && hits?.term !== term);
  const results = qa === 'empty' ? [] : !term || loading || qa === 'error' ? null : (hits?.results ?? null);
  const shownError = qa === 'error' ? 'upstream' : err;

  useEffect(() => {
    if (qa) return;
    const term = q.trim();
    if (!term) return;
    // Guard against out-of-order responses: a slow "AA" must not overwrite a fast "AAPL".
    const mine = ++seq.current;
    const t = setTimeout(() => {
      setErr(null);
      searchTickers(term)
        .then((r) => {
          if (mine !== seq.current) return;
          setHits({ term, results: r });
        })
        .catch((e: unknown) => {
          // Only the latest term may surface an error, or a stale slow failure would blank a
          // good result — the same out-of-order guard the success path already uses.
          if (mine !== seq.current) return;
          setErr(e instanceof Error ? e.message : 'upstream');
        });
    }, 250);
    return () => clearTimeout(t);
  }, [q, nonce, qa]);

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
            placeholder="Search any stock by name or ticker"
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
        {/* UNIT 13 item 3 */}
          {/* Blocking: on this screen the results ARE the screen, so an error replaces them
              rather than sitting alongside. err wins over loading — a skeleton that never
              resolves tells the user to wait for something that is not coming. */}
          {shownError ? <RetryNotice code={shownError} onRetry={retry} /> : loading && <SkeletonRows count={5} height={60} />}

        {!loading && !term && (
          <EmptyState title="Find a stock to practise with" suggestions={['AAPL', 'Ford', 'SPY']} onSuggestion={setQ} />
        )}

        {!loading && results?.length === 0 && (
          /* Distinguishes "no matches" from "no live data" — collapsing the two hides a missing
             key behind an apparently empty market. */
          <EmptyState title={`Nothing matched “${term}”`} sub="Live search may also be switched off in this build." />
        )}

        {/*
          * Results STAGGER IN. Measured before this: they appeared in a single 0.11s window with
          * one peak -- an instantaneous hard cut, well under the reference's 0.27-0.67s band, and
          * the only list in the app that arrived without choreography. search.tsx was one of just
          * four screens with no entrance animation at all, alongside friends.tsx.
          *
          * Capped at STAGGER_CAP for the reason tokens.ts gives: an uncapped cascade leaves the
          * tail of a long list dragging behind the user, and ticker search can return dozens.
          * RiseIn degrades to a fade under Reduced Motion on its own, so no guard is needed here.
          */}
        {results?.map((h, i) => (
          <RiseIn key={`${h.sym}-${i}`} delay={Math.min(i * STAGGER_GAP, STAGGER_CAP)}>
          <SpringPressable
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
            </View>
          </SpringPressable>
          </RiseIn>
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
    // minHeight, not height: 44 is the HIG touch-target floor and must be KEPT, but at AX5 the
    // input text reaches ~50pt inside a 44pt box and clips. minHeight preserves the tap target
    // while letting the field grow — the same shape the price chart's fixed 120pt plot had.
    minHeight: 44,
  },
  input: { flex: 1, fontSize: FontSize.bodySm, fontFamily: Fonts.body },
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
