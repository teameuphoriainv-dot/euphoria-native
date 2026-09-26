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
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { RiseIn } from '@/shared/motion/rise-in';
import { Duration, Ease } from '@/shared/motion/tokens';
import { SpringPressable } from '@/shared/motion/spring-pressable';

const AnimatedImage = Animated.createAnimatedComponent(Image);

const CARD_W = 236;
const IMAGE_H = 96;
/**
 * A FIXED card height, so an image card and a text card sit level in the rail. Letting each card
 * size to its own content produced a ragged row where the image card towered over its neighbour,
 * and it was tall enough that the first headline was clipped by the tab bar. Read off a screenshot;
 * the a11y tree reports every card as present at any height.
 */
const CARD_H = 176;

/*
 * `eager` GATES THE IMAGE FETCH, and it exists because of what the network log showed.
 *
 * OBSERVED in the running app 2026-08-20: one Trade tab visit pulled
 *   crescent-capital-bdc-logo-1200x675.png   463.4 KB
 *   deutsche-bank-bl.JPG                     183.8 KB
 *   ndsn-stock-pops...jpg                    140.4 KB
 * -- roughly 830KB of full-size press images, nearly three times the whole market-marks payload,
 * on every visit.
 *
 * The rail renders EIGHT cards and about one and a half fit on a 402pt screen, so six of those
 * downloads were for cards nobody had scrolled to. Publisher art cannot be resized at the source
 * and proxying arbitrary remote URLs through our own server to shrink them would be an SSRF
 * surface, so the fix is simply not to fetch what is not on screen yet.
 *
 * The text card renders identically in the meantime -- `withImage` already degrades to the
 * text-only variant, which is the same discipline ticker-logo uses for a missing mark.
 */
function GalleryCard({ a, at, eager }: { a: Article; at: number; eager: boolean }) {
  const theme = useTheme();
  /*
   * Same discipline as ticker-logo.tsx: a remote image is an UPGRADE to a card that already works.
   * If the bytes never arrive, or the host 404s, the card silently becomes the text variant rather
   * than showing a grey rectangle where a photo should be.
   */
  const [broken, setBroken] = useState(false);
  const [shown, setShown] = useState(false);
  const shownT = useSharedValue(0);
  useEffect(() => { shownT.set(withTiming(shown ? 1 : 0, { duration: Duration.base, easing: Ease.out })); }, [shown, shownT]);
  const imgStyle = useAnimatedStyle(() => ({ opacity: shownT.get() }));
  const withImage = eager && a.image !== undefined && a.image !== '' && !broken;

  return (
    <SpringPressable
      scaleTo={0.97}
      onPress={() => void Linking.openURL(a.url).catch(() => undefined)}
      accessibilityRole="link"
      accessibilityLabel={`${a.title}. ${a.publisher}. Opens in your browser.`}
    >
      <Card padded={false} style={[styles.card, { width: CARD_W, height: CARD_H }]}>
        {withImage && (
          /* FADE IN ON DECODE. This had no onLoad and no opacity at all, so a remote image
             replaced the placeholder tint on a single frame — a 0ms swap, below R1's p10 of
             0.13s. Each article's bytes arrive whenever the network returns them, so a row of
             cards snapped in at unrelated moments. Opacity only, so no reduced-motion guard is
             needed; there is no vestibular motion in a fade. */
          <AnimatedImage
            source={{ uri: a.image }}
            style={[styles.image, { backgroundColor: theme.cardElevated }, imgStyle]}
            resizeMode="cover"
            onLoad={() => setShown(true)}
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

  /** How many cards may fetch their image. Grows as the rail scrolls. */
  const [eagerCount, setEagerCount] = useState(3);

  // null = still loading, [] = nothing to show. Both render NOTHING rather than a placeholder.
  if (articles === null || articles.length === 0) return null;

  return (
    <RiseIn delay={delay}>
      <ThemedText type="label" themeColor="mutedForeground" style={styles.sectionLabel}>
        {scope === undefined ? 'Market news' : `News · ${scope}`}
      </ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        /* Reveal the next card's image as the rail moves, one card-width at a time. Two ahead of
           the leading edge so a fetch has started before the card arrives. */
        onScroll={(e) => {
          const lead = Math.ceil(e.nativeEvent.contentOffset.x / (CARD_W + 8)) + 3;
          if (lead > eagerCount) setEagerCount(Math.min(8, lead));
        }}
        contentContainerStyle={styles.rail}
        /*
         * SNAP TO THE CARD GRID. Without this the rail free-scrolls and comes to rest wherever
         * momentum happens to die, so a flick leaves cards halfway off the edge at arbitrary
         * offsets — the behaviour the owner described as dragging something and having it "move
         * all over the place". Every horizontal rail in the app had no paging, no snapping and
         * the default deceleration.
         *
         * The interval is the card plus the gap between cards: CARD_W (236) + Spacing.two (8).
         * `start` alignment keeps the existing affordance intact — the rail still bleeds past the
         * screen edge so the next card is visibly cut off, which is what tells the user it
         * scrolls; it now lands on a card boundary instead of mid-card.
         */
        snapToInterval={CARD_W + Spacing.two}
        snapToAlignment="start"
        decelerationRate="fast"
        // The rail bleeds to the screen edge so a card is visibly cut off, which is what tells the
        // user it scrolls. Padding lives on the content, not the ScrollView.
        style={styles.railOuter}
      >
        {articles.slice(0, 8).map((a, i) => (
          <GalleryCard key={a.id} a={a} at={at} eager={i < eagerCount} />
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
