/**
 * UNIT 10 — the trade news gallery.
 *
 * Banked research (§10a): Bloomberg leads with a hero image + headline, and its rows read
 * `SOURCE · time-ago` then a bold headline. Investing.com scopes "Related News" to your holdings,
 * which the plan calls the more useful variant — so this does that whenever the user holds
 * anything, and falls back to broad market news when they hold nothing.
 *
 * THE RULE THAT GOVERNS THIS FILE, and it is §0.4: there is no placeholder anything. No stock art,
 * no invented headlines, no skeleton pretending to be content. Alpha Vantage returns an empty
 * `banner_image` for a large share of its feed, so a layout that REQUIRED an image would show holes
 * on live data — not just when the key is missing. A card without a usable image renders as text,
 * and no articles at all renders nothing at all.
 */
import { useEffect, useState } from 'react';
import { Image, Linking, ScrollView, StyleSheet, View } from 'react-native';

import { SentimentBadge, ago } from '@/components/sentiment-badge';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getNews, type Article } from '@/lib/market';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';

const CARD_W = 236;
const IMAGE_H = 96;
/**
 * A FIXED card height, so an image card and a text card sit level in the rail. Letting each card
 * size to its own content produced a ragged row where the image card towered over its neighbour,
 * and it was tall enough that the first headline was clipped by the tab bar. Read off a screenshot;
 * the a11y tree reports every card as present at any height.
 */
const CARD_H = 176;

function GalleryCard({ a, at }: { a: Article; at: number }) {
  const theme = useTheme();
  /*
   * Same discipline as ticker-logo.tsx: a remote image is an UPGRADE to a card that already works.
   * If the bytes never arrive, or the host 404s, the card silently becomes the text variant rather
   * than showing a grey rectangle where a photo should be.
   */
  const [broken, setBroken] = useState(false);
  const withImage = a.image !== undefined && a.image !== '' && !broken;

  return (
    <SpringPressable
      scaleTo={0.97}
      onPress={() => void Linking.openURL(a.url).catch(() => undefined)}
      accessibilityRole="link"
      accessibilityLabel={`${a.title}. ${a.publisher}. Opens in your browser.`}
    >
      <Card padded={false} style={[styles.card, { width: CARD_W, height: CARD_H }]}>
        {withImage && (
          <Image
            source={{ uri: a.image }}
            style={[styles.image, { backgroundColor: theme.cardElevated }]}
            resizeMode="cover"
            onError={() => setBroken(true)}
            accessible={false}
          />
        )}
        <View style={styles.body}>
          <View style={styles.metaRow}>
            <ThemedText type="label" themeColor="mutedForeground" style={{ flex: 1 }} numberOfLines={1}>
              {a.publisher}
              {a.published ? ` · ${ago(a.published, at)}` : ''}
            </ThemedText>
            <SentimentBadge score={a.sentiment} label={a.sentimentLabel} />
          </View>
          {/* A text-only card gets the extra lines the image would have taken. */}
          <ThemedText type="bodyMedium" numberOfLines={withImage ? 2 : 4} style={styles.headline}>
            {a.title}
          </ThemedText>
        </View>
      </Card>
    </SpringPressable>
  );
}

export function NewsGallery({ symbols, delay = 0 }: { symbols: string[]; delay?: number }) {
  const [articles, setArticles] = useState<Article[] | null>(null);
  const [at] = useState(() => Date.now());

  // Investing.com's variant: scope to a holding when there is one.
  const scope = symbols[0];

  useEffect(() => {
    let live = true;
    getNews(scope)
      .then((a) => {
        if (live) setArticles(a);
      })
      .catch(() => {
        if (live) setArticles([]);
      });
    return () => {
      live = false;
    };
  }, [scope]);

  // null = still loading, [] = nothing to show. Both render NOTHING rather than a placeholder.
  if (articles === null || articles.length === 0) return null;

  return (
    <RiseIn delay={delay}>
      <ThemedText type="label" themeColor="mutedForeground" style={styles.sectionLabel}>
        {scope === undefined ? 'MARKET NEWS' : `NEWS · ${scope}`}
      </ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rail}
        // The rail bleeds to the screen edge so a card is visibly cut off, which is what tells the
        // user it scrolls. Padding lives on the content, not the ScrollView.
        style={styles.railOuter}
      >
        {articles.slice(0, 8).map((a) => (
          <GalleryCard key={a.id} a={a} at={at} />
        ))}
      </ScrollView>
    </RiseIn>
  );
}

const styles = StyleSheet.create({
  sectionLabel: { marginBottom: Spacing.two },
  railOuter: { marginHorizontal: -Spacing.three },
  rail: { paddingHorizontal: Spacing.three, gap: Spacing.two, paddingBottom: Spacing.one },
  card: { overflow: 'hidden' },
  image: { width: '100%', height: IMAGE_H, borderTopLeftRadius: Radius.md, borderTopRightRadius: Radius.md },
  body: { flex: 1, padding: Spacing.three, gap: Spacing.one },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  headline: { lineHeight: 20 },
});
