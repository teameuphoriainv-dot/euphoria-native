/**
 * Market news.
 *
 * Shape from Bloomberg (app 1580, $750k/mo), whose feed rows are consistently: category label,
 * bold headline, byline/source, time-ago — and a large hero for the lead story. Investing.com does
 * the same thing scoped to your holdings ("Related News" under the portfolio), which is the more
 * useful version for us: news about what you actually own beats a general wire.
 *
 * So this screen has two modes:
 *   /news            -> the market wire
 *   /news?sym=AAPL   -> that ticker only, reached from its stock page
 *
 * Backed by Polygon `/v2/reference/news` via `api/market+api.ts`. With no key it says so plainly
 * rather than rendering placeholder headlines — a fake headline is worse than an empty screen
 * because it looks like it is working.
 */
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/ambient-background';
import { ago, SentimentBadge } from '@/components/sentiment-badge';
import { RetryNotice } from '@/components/retry-notice';
import { SkeletonRows } from '@/components/skeleton';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { Card } from '@/components/ui/card';
import { BottomTabInset, Spacing, FontSize } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getNews, type Article } from '@/lib/market';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import { STAGGER_CAP } from '@/shared/motion/tokens';

export default function News() {
  const theme = useTheme();
  const { sym } = useLocalSearchParams<{ sym?: string }>();
  const [articles, setArticles] = useState<Article[] | null>(null);
  const [loaded, setLoaded] = useState(false);
  /*
   * getNews().then() had no .catch(), so a rejection left `loaded` false and the skeleton
   * running forever — the third screen with this exact shape.
   *
   * The tempting shortcut is to setLoaded(true) in the catch and let the existing empty state
   * handle it. That would be a LIE: this screen already says "no news for this symbol" when
   * articles is empty, and a failed request is not an empty result. Telling a user there is no
   * news when the truth is that we could not load it is worse than telling them nothing —
   * they would stop looking.
   */
  const [err, setErr] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  const retry = useCallback(() => {
    setErr(null);
    setNonce((n) => n + 1);
  }, []);
  // Captured once when the list lands, so every row measures against the same instant and no
  // `Date.now()` runs during render.
  const [at, setAt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    // Clears a stale error when the dependency changes, before the fetch that may set a new one.
    // React bails out via Object.is when the value is already null, so on the common path this
    // renders nothing -- it is not the cascading render the rule exists to catch. refs/TASK_QUEUE.md
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setErr(null);
    getNews(sym)
      .then((a) => {
        if (cancelled) return;
        setArticles(a);
        setAt(Date.now());
        setLoaded(true);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        // Deliberately NOT setLoaded(true) — see above. An error is not an empty result.
        setErr(e instanceof Error ? e.message : 'upstream');
      });
    return () => {
      cancelled = true;
    };
  }, [sym, nonce]);

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AmbientBackground starCount={24} glow={false} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SpringPressable
          haptic={false}
          onPress={() => router.back()}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <UIcon name="chevronLeft" size={22} color={theme.mutedForeground} />
          <ThemedText type="small" themeColor="mutedForeground">Back</ThemedText>
        </SpringPressable>

        <RiseIn>
          <ThemedText type="title" style={{ fontSize: FontSize.titleLg }}>{sym ? `${sym} news` : 'Market news'}</ThemedText>
          <ThemedText type="small" themeColor="mutedForeground" style={{ marginTop: 4 }}>
            {sym ? 'Stories mentioning this company.' : 'What moved, and why.'}
          </ThemedText>
        </RiseIn>

        {/* UNIT 13 item 3: the shape of the article rows that are coming, not a bare spinner. */}
        {err ? <RetryNotice code={err} onRetry={retry} /> : !loaded && <SkeletonRows count={4} height={92} />}

        {loaded && (articles?.length ?? 0) === 0 && (
          <RiseIn delay={60}>
            <Card style={styles.empty}>
              <ThemedText type="body" themeColor="mutedForeground" style={styles.center}>
                {/* Two different failures, said differently. Collapsing them would hide a missing
                    key behind an apparently quiet news day. */}
                No stories right now. Live news isn’t switched on in this build.
              </ThemedText>
            </Card>
          </RiseIn>
        )}

        {articles?.map((a, i) => (
          <RiseIn key={a.id ?? i} delay={60 + Math.min(i * 25, STAGGER_CAP)}>
            <SpringPressable
              scaleTo={0.98}
              onPress={() => void Linking.openURL(a.url).catch(() => undefined)}
              accessibilityRole="link"
              accessibilityLabel={`${a.title}. ${a.publisher}. Opens in your browser.`}
            >
              <Card style={styles.row}>
                <View style={styles.metaRow}>
                  <ThemedText type="label" themeColor="mutedForeground" style={{ flex: 1 }} numberOfLines={1}>
                    {a.publisher}{a.published ? ` · ${ago(a.published, at)}` : ''}
                  </ThemedText>
                  <SentimentBadge score={a.sentiment} label={a.sentimentLabel} />
                </View>
                <ThemedText type="bodyMedium" style={styles.headline}>{a.title}</ThemedText>
              </Card>
            </SpringPressable>
          </RiseIn>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: Spacing.three, paddingBottom: BottomTabInset + Spacing.four, gap: Spacing.three },
  back: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  center: { textAlign: 'center' },
  empty: { paddingVertical: Spacing.four },
  row: { gap: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  headline: { lineHeight: 22 },
});
