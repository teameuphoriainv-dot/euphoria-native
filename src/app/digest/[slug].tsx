/**
 * Digest article reader — opened from a Digest post row. Hero illustration + category/read-time
 * meta + a single reading column: excerpt as the lead, then the full body from digest-bodies.ts
 * (the same prose the web publishes), closing on the "practice in the app" CTA.
 *
 * Type comes from the shared ThemedText scale, same as every tab. It used to set its own serif,
 * which arrived with the ported web page and was the only serif in the app.
 */
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import { AmbientBackground } from '@/components/ambient-background';
import { DigestBody } from '@/components/digest-body';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { GradientButton } from '@/components/ui/button';
import { BottomTabInset, Radius, Spacing } from '@/constants/theme';
import { DIGEST_POSTS } from '@/lib/digest-content';
import { bodyFor } from '@/lib/digest-bodies';
import { heroSvg } from '@/lib/digest-heroes';
import { useApp } from '@/lib/store';
import { useTheme } from '@/hooks/use-theme';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';

export default function DigestArticle() {
  const theme = useTheme();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const post = DIGEST_POSTS.find((p) => p.slug === slug);
  const markPostRead = useApp((s) => s.markPostRead);
  const body = post ? bodyFor(post.slug) : undefined;

  // opening the guide is what marks it read — that is what the Digest tab's ticks reflect
  useEffect(() => {
    if (post) markPostRead(post.slug);
  }, [post, markPostRead]);

  if (!post) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <ThemedText type="heading">Article not found</ThemedText>
        <SpringPressable onPress={() => router.back()} style={{ marginTop: Spacing.three }}>
          <ThemedText type="bodyMedium" style={{ color: theme.iconLilac }}>Back to Digest</ThemedText>
        </SpringPressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AmbientBackground starCount={30} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SpringPressable haptic={false} onPress={() => router.back()} style={styles.back}>
          <UIcon name="chevronLeft" size={22} color={theme.mutedForeground} />
          <ThemedText type="small" themeColor="mutedForeground">Digest</ThemedText>
        </SpringPressable>

        <RiseIn>
          <View style={[styles.heroPanel, { backgroundColor: theme.primary + '14' }]}>
            {heroSvg(post.hero) ? <SvgXml xml={heroSvg(post.hero)!} width={150} height={150} /> : null}
          </View>
          <View style={styles.metaRow}>
            <ThemedText type="label" style={{ color: theme.iconLilac }}>{post.category}</ThemedText>
            <ThemedText type="small" themeColor="mutedForeground">{post.readMinutes} min read</ThemedText>
          </View>
          <ThemedText type="title" style={styles.headline}>{post.title}</ThemedText>
        </RiseIn>

        <RiseIn delay={90}>
          <ThemedText type="body" style={styles.lead}>{post.excerpt}</ThemedText>
          {body ? (
            <DigestBody markdown={body} />
          ) : (
            <ThemedText type="body" themeColor="mutedForeground" style={styles.body}>
              The full write-up for this guide is still being synced from the web library.
            </ThemedText>
          )}
        </RiseIn>

        <RiseIn delay={160}>
          <GradientButton label="Practice this in a lesson" onPress={() => router.push('/lesson')} style={{ marginTop: Spacing.four }} />
        </RiseIn>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  content: { padding: Spacing.three, paddingBottom: BottomTabInset + Spacing.four },
  back: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: Spacing.three },
  heroPanel: { height: 170, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.three },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  headline: { fontSize: 26, lineHeight: 33 },
  lead: { fontSize: 18, lineHeight: 27, marginTop: Spacing.three },
  body: { marginTop: Spacing.three, lineHeight: 23 },
});
