/**
 * Digest — Euphoria's money-guides hub. Ported from euphoriaweb DigestHome: serif
 * headline, category filter, featured post, post list. Content in lib/digest-content.ts.
 */
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/ambient-background';
import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { Card } from '@/components/ui/card';
import { BottomTabInset, Fonts, Radius, Spacing } from '@/constants/theme';
import { CATEGORY_ICON, DIGEST_CATEGORIES, DIGEST_POSTS, type DigestCategory } from '@/lib/digest-content';
import { useTheme } from '@/hooks/use-theme';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';

function Pill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const theme = useTheme();
  return (
    <SpringPressable haptic={false} scaleTo={0.94} onPress={onPress}>
      <View
        style={[
          styles.pill,
          { borderColor: active ? theme.primary : theme.border, backgroundColor: active ? theme.primary + '24' : 'transparent' },
        ]}>
        <ThemedText type="smallBold" style={{ color: active ? theme.text : theme.mutedForeground, fontSize: 12.5 }}>{label}</ThemedText>
      </View>
    </SpringPressable>
  );
}

function PostRow({ post, featured }: { post: (typeof DIGEST_POSTS)[number]; featured?: boolean }) {
  const theme = useTheme();
  return (
    <SpringPressable onPress={() => {}}>
      <Card style={featured ? styles.featured : styles.row} elevated={featured}>
        {featured ? (
          <>
            <View style={[styles.heroBubble, { backgroundColor: theme.primary + '1A' }]}>
              <Icon name={CATEGORY_ICON[post.category]} size={44} />
            </View>
            <View style={styles.catRow}>
              <ThemedText type="label" style={{ color: theme.iconLilac }}>{post.category}</ThemedText>
              <ThemedText type="small" themeColor="mutedForeground">{post.readMinutes} min read</ThemedText>
            </View>
            <ThemedText type="heading" style={{ marginTop: 4 }}>{post.title}</ThemedText>
            <ThemedText type="body" themeColor="mutedForeground" style={{ marginTop: 6, lineHeight: 21 }}>{post.excerpt}</ThemedText>
          </>
        ) : (
          <>
            <View style={[styles.iconBubble, { backgroundColor: theme.primary + '18' }]}>
              <Icon name={CATEGORY_ICON[post.category]} size={26} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText type="label" style={{ color: theme.iconLilac, marginBottom: 3 }}>{post.category} · {post.readMinutes} min</ThemedText>
              <ThemedText type="bodyMedium" style={{ lineHeight: 21 }}>{post.title}</ThemedText>
            </View>
          </>
        )}
      </Card>
    </SpringPressable>
  );
}

export default function Digest() {
  const theme = useTheme();
  const [category, setCategory] = useState<DigestCategory | null>(null);
  const [featured, ...rest] = DIGEST_POSTS;
  const shown = category ? DIGEST_POSTS.filter((p) => p.category === category) : rest;

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AmbientBackground starCount={40} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <RiseIn>
          <ThemedText style={styles.headline}>Money, explained like a friend would.</ThemedText>
          <ThemedText type="body" themeColor="mutedForeground" style={styles.sub}>
            Deep dives on investing, credit, and markets — real numbers, zero jargon. Read the idea, then practice it in the app.
          </ThemedText>
        </RiseIn>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pills}>
          <Pill label="All guides" active={category === null} onPress={() => setCategory(null)} />
          {DIGEST_CATEGORIES.map((c) => (
            <Pill key={c} label={c} active={category === c} onPress={() => setCategory(category === c ? null : c)} />
          ))}
        </ScrollView>

        {!category && (
          <RiseIn delay={80}>
            <PostRow post={featured} featured />
          </RiseIn>
        )}

        <View style={{ gap: Spacing.two + 4, marginTop: Spacing.three }}>
          {shown.map((p, i) => (
            <RiseIn key={p.slug} delay={120 + i * 45}>
              <PostRow post={p} />
            </RiseIn>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: Spacing.three, paddingBottom: BottomTabInset + Spacing.four },
  headline: { fontFamily: Fonts.serif, fontSize: 30, lineHeight: 36, color: '#F3EEFA' },
  sub: { marginTop: Spacing.two },
  pills: { gap: 8, paddingVertical: Spacing.three, paddingRight: Spacing.three },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.pill, borderWidth: StyleSheet.hairlineWidth },
  featured: { padding: Spacing.three + 2 },
  heroBubble: { width: 72, height: 72, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.three },
  catRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two + 4 },
  iconBubble: { width: 48, height: 48, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
});
