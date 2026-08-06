/**
 * Friends — a follow graph, not a friend-request queue.
 *
 * Modelled on Duolingo, whose help centre calls this "find, follow, and block" and whose Friend
 * Streak requires someone who "follows you back". So following is ONE-DIRECTIONAL and needs no
 * approval, and "friend" is DERIVED: it means both directions exist. There is deliberately no
 * accept/decline flow to build, which is simpler and matches the reference.
 *
 * Three sections fall out of the four relationship states, and each has an empty state, because
 * an empty section is the common case for a new account and the thing most likely to look broken.
 *
 * ⚠️ Everyone listed here is fabricated - see src/lib/people.ts. Nothing on this screen may
 * describe them as real people.
 */
import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/ambient-background';
import { LeagueCrest } from '@/components/league-crest';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { Card } from '@/components/ui/card';
import { BottomTabInset, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { tierForXp } from '@/lib/league';
import { PEOPLE, type Person } from '@/lib/people';
import { relationshipOf, useApp, type Relationship } from '@/lib/store';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';

const LABEL: Record<Relationship, string> = {
  none: 'Follow',
  following: 'Following',
  'follows-you': 'Follow back',
  friends: 'Friends',
};

function PersonRow({ person, rel, onToggle }: { person: Person; rel: Relationship; onToggle: () => void }) {
  const theme = useTheme();
  // A filled button is a call to action; an outlined one is a state you can undo. `none` and
  // `follows-you` are both invitations to act, so both are filled.
  const active = rel === 'none' || rel === 'follows-you';
  return (
    <View style={styles.row}>
      <View style={[styles.avatar, { backgroundColor: person.color }]}>
        <ThemedText type="smallBold" style={{ color: '#0A0A0F' }}>{person.name[0]}</ThemedText>
      </View>
      <View style={{ flex: 1 }}>
        <ThemedText type="bodyMedium" numberOfLines={1}>{person.name}</ThemedText>
        <ThemedText type="small" themeColor="mutedForeground" numberOfLines={1} style={styles.num}>
          @{person.handle} · {person.weeklyXp.toLocaleString()} XP
        </ThemedText>
      </View>
      <LeagueCrest tier={tierForXp(person.xp)} size={22} />
      <SpringPressable haptic={false} onPress={onToggle} hitSlop={8}>
        <View
          style={[
            styles.btn,
            {
              backgroundColor: active ? theme.primary : 'transparent',
              borderColor: active ? theme.primary : theme.border,
            },
          ]}>
          <ThemedText type="smallBold" style={{ color: active ? '#0A0A0F' : theme.mutedForeground }}>
            {LABEL[rel]}
          </ThemedText>
        </View>
      </SpringPressable>
    </View>
  );
}

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: Spacing.four }}>
      <ThemedText type="label" themeColor="mutedForeground">{title}</ThemedText>
      {note ? (
        <ThemedText type="small" themeColor="mutedForeground" style={{ marginTop: 4 }}>{note}</ThemedText>
      ) : null}
      <Card style={{ marginTop: Spacing.two }}>{children}</Card>
    </View>
  );
}

export default function Friends() {
  const theme = useTheme();
  const following = useApp((s) => s.following);
  const followers = useApp((s) => s.followers);
  const follow = useApp((s) => s.follow);
  const unfollow = useApp((s) => s.unfollow);
  const [query, setQuery] = useState('');

  const rel = (id: string) => relationshipOf(id, following, followers);
  const toggle = (id: string) => (following.includes(id) ? unfollow(id) : follow(id));

  const { friends, inbound, others } = useMemo(() => {
    // Sorted by weekly XP everywhere, matching the league, so the same person never appears in a
    // different order on two screens.
    const sorted = [...PEOPLE].sort((a, b) => b.weeklyXp - a.weeklyXp);
    const q = query.trim().toLowerCase();
    const match = (p: Person) => !q || p.name.toLowerCase().includes(q) || p.handle.includes(q);
    return {
      friends: sorted.filter((p) => rel(p.id) === 'friends'),
      inbound: sorted.filter((p) => rel(p.id) === 'follows-you'),
      others: sorted.filter((p) => rel(p.id) !== 'friends' && rel(p.id) !== 'follows-you' && match(p)),
    };
  }, [following, followers, query]);

  const empty = (text: string) => (
    <ThemedText type="small" themeColor="mutedForeground" style={styles.empty}>{text}</ThemedText>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AmbientBackground starCount={30} />
      <View style={styles.header}>
        <SpringPressable haptic={false} scaleTo={0.85} onPress={() => router.back()} style={styles.back} hitSlop={10}>
          <UIcon name="chevronLeft" size={22} color={theme.mutedForeground} />
        </SpringPressable>
        <ThemedText type="title" style={{ fontSize: 22 }}>Friends</ThemedText>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Section title="YOUR FRIENDS" note="People you follow who follow you back.">
          {friends.length
            ? friends.map((p) => <PersonRow key={p.id} person={p} rel={rel(p.id)} onToggle={() => toggle(p.id)} />)
            : empty('No friends yet. Follow someone below, and it becomes a friendship when they follow you back.')}
        </Section>

        {inbound.length ? (
          <Section title="FOLLOWS YOU">
            {inbound.map((p) => (
              <PersonRow key={p.id} person={p} rel={rel(p.id)} onToggle={() => toggle(p.id)} />
            ))}
          </Section>
        ) : null}

        <Section title="DISCOVER">
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name or handle"
            placeholderTextColor={theme.mutedForeground}
            autoCapitalize="none"
            autoCorrect={false}
            style={[styles.input, { borderColor: theme.border, color: theme.text }]}
          />
          {others.length
            ? others.map((p) => <PersonRow key={p.id} person={p} rel={rel(p.id)} onToggle={() => toggle(p.id)} />)
            : empty(query ? `Nobody matches "${query.trim()}".` : 'You are following everyone here.')}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingHorizontal: Spacing.three, paddingTop: Spacing.one },
  back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  content: { padding: Spacing.three, paddingBottom: BottomTabInset + Spacing.four },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two + 2, paddingVertical: Spacing.two },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  num: { fontVariant: ['tabular-nums'] },
  btn: { paddingHorizontal: Spacing.two + 4, paddingVertical: 7, borderRadius: Radius.pill, borderWidth: StyleSheet.hairlineWidth, minWidth: 84, alignItems: 'center' },
  input: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.md, paddingHorizontal: Spacing.two + 4, paddingVertical: 10, fontSize: 15, marginBottom: Spacing.two },
  empty: { paddingVertical: Spacing.two, lineHeight: 20 },
});
