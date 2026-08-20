/**
 * Company logo, with the lettered badge as the floor.
 *
 * Every reference app shows real marks rather than initials — Bloom lists NVIDIA, Amazon and
 * Microsoft with their logos and puts the Shopify bag on its reward card; Investing.com and
 * TradingView do the same in every watchlist row. Four-letter text tiles are the tell that a
 * trading screen was assembled rather than designed.
 *
 * THE RULE THAT MATTERS HERE: this never renders a broken image and never renders a blank box.
 * The lettered badge draws FIRST and stays until real bytes have decoded, and any failure — no
 * key, no logo for that ticker, a dead network — simply leaves the badge in place. A logo is an
 * upgrade to a thing that already works, not a dependency.
 *
 * The bytes come through our own proxy because Polygon's asset URLs require the API key appended;
 * fetching them from the client would put the key in the bundle, which is the one thing every
 * network path in this app is built to avoid.
 *
 * BUNDLED FIRST, PROXY SECOND. Measured 2026-08-20 against the live endpoint: a cold trade screen
 * mounts seven rows in one tick against Polygon's 5-requests-per-minute free tier, so AAPL and
 * NVDA resolved 200 while MSFT, AMZN, META and GOOG all came back 429 and correctly fell back to
 * the lettered badge. No amount of client pacing turns 5/min into more than 5/min, and a
 * server-side cache does not help either -- the route module is re-evaluated per request, so its
 * Map is empty every time. The only thing that removes a cold-start network call is bytes that
 * are already on disk, which is what `scripts/fetch-logos.mjs` puts there.
 *
 * The proxy stays as the path for anything not bundled, and the badge stays as the floor under
 * both. A symbol missing from the map costs nothing -- it simply behaves as it did before.
 */
import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { BUNDLED_LOGOS } from '@/assets/logos';
import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { apiBase } from '@/lib/api';

export function TickerLogo({ sym, size = 44 }: { sym: string; size?: number }) {
  const theme = useTheme();
  // `false` until the image has actually decoded. Failures never flip it, so the badge persists.
  const [loaded, setLoaded] = useState(false);

  const radius = size >= 40 ? Radius.md : Radius.sm;
  // A bundled asset is a module id (number); the proxy needs a {uri}. Both are valid ImageSource.
  const bundled = BUNDLED_LOGOS[sym.toUpperCase()];

  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: radius, backgroundColor: theme.primary + '1F' }]}>
      {/* Drawn first and never unmounted — it is the floor, not a placeholder that gets swapped. */}
      {!loaded && (
        <ThemedText
          type="smallBold"
          style={{ color: theme.iconLilac, fontSize: size >= 40 ? 11 : 9, lineHeight: size >= 40 ? 15 : 12 }}
        >
          {sym.slice(0, 4)}
        </ThemedText>
      )}
      <Image
        source={bundled ?? { uri: `${apiBase()}/api/market?action=logo&sym=${encodeURIComponent(sym)}` }}
        style={[StyleSheet.absoluteFill, { borderRadius: radius, opacity: loaded ? 1 : 0 }]}
        resizeMode="contain"
        onLoad={() => setLoaded(true)}
        // Silent on purpose: a missing logo is normal (most tickers have none) and is not an
        // error the user should ever see.
        onError={() => undefined}
        accessible={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
