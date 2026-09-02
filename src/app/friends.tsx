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
import { useCallback, useMemo, useState } from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/ambient-background';
import { LeagueCrest } from '@/components/league-crest';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { Card } from '@/components/ui/card';
import { BottomTabInset, Radius, Spacing, FontSize, Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { tierForXp } from '@/lib/league';
import { PEOPLE, type Person } from '@/lib/people';
import { relationshipOf, useApp, type Relationship } from '@/lib/store';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import { STAGGER_CAP, STAGGER_GAP } from '@/shared/motion/tokens';
import { PixelSpriteView } from '@/lib/pixel';

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
      {/* Same mark this person wears in the league standings, so following someone and then racing
          them is visibly the same person. A ring in their colour, their sprite inside it. */}
      <View style={[styles.avatar, { backgroundColor: theme.cardElevated, borderColor: person.color, borderWidth: 1.5 }]}>
        <PixelSpriteView sprite={person.avatar} size={22} />
      </View>
      <View style={{ flex: 1 }}>
        <ThemedText type="bodyMedium" numberOfLines={1}>{person.name}</ThemedText>
        <ThemedText type="small" themeColor="mutedForeground" numberOfLines={1} style={styles.num}>
          @{person.handle} · {person.weeklyXp.toLocaleString()} XP
        </ThemedText>
      </View>
      <LeagueCrest tier={tierForXp(person.xp)} size={22} />
      <SpringPressable
        haptic={false}
        onPress={onToggle}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`${LABEL[rel]} ${person.name}`}
      >
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

  /* useCallback, not a plain arrow: the memo below depends on `rel`, and a function
     recreated every render would make that memo recompute every render — strictly worse
     than the missing-dependency warning it was silencing. */
  const rel = useCallback((id: string) => relationshipOf(id, following, followers), [following, followers]);
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
  /* `rel` is memoised on [following, followers], so naming those here too is redundant —
     the memo already invalidates through rel. */
  }, [query, rel]);

  const empty = (text: string) => (
    <ThemedText type="small" themeColor="mutedForeground" style={styles.empty}>{text}</ThemedText>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AmbientBackground starCount={30} />
      <View style={styles.header}>
        <SpringPressable haptic={false} scaleTo={0.85} onPress={() => router.back()} style={styles.back} hitSlop={10} accessibilityRole="button" accessibilityLabel="Back">
          <UIcon name="chevronLeft" size={22} color={theme.mutedForeground} />
        </SpringPressable>
        <ThemedText type="title" style={{ fontSize: FontSize.titleSm }}>Friends</ThemedText>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/*
          COPY: owner SELECTED this option; the wording is mine. Recorded as DELEGATED rather than
          owner-authored, because §0.7 draws that distinction on purpose — "the owner said choose"
          is different provenance from "the owner chose".

          The previous note read "People you follow who follow you back." Every person in
          `lib/people.ts` is fabricated — that file's own header says so and says "nothing
          user-facing may present them as real people" — so the note asserted a mutual relationship
          with people who do not exist. That is §0.4 and, for App Review, a social graph of fake
          accounts presented as real.
        */}
        <Section title="YOUR FRIENDS" note="Practice profiles. Real friends arrive when accounts do.">
          {/*
            * Rows STAGGER IN. Measured before this: the list arrived in a single 0.64s window
            * with ONE peak and 163,082 changed pixels -- the whole thing slamming in at once.
            * friends.tsx was one of only four screens in the app with no entrance animation,
            * against 15 that use RiseIn. Capped per tokens.ts so a long DISCOVER list does not
            * leave its tail dragging. RiseIn degrades to a fade under Reduced Motion by itself.
            */}
          {friends.length
            ? friends.map((p, i) => (
                <RiseIn key={p.id} delay={Math.min(i * STAGGER_GAP, STAGGER_CAP)}>
                  <PersonRow person={p} rel={rel(p.id)} onToggle={() => toggle(p.id)} />
                </RiseIn>
              ))
            : /*
                COPY: same delegated provenance as the section note above — owner selected the
                approach, wording is mine (§0.7).
                This read "…and it becomes a friendship when they follow you back", which promises
                an event THAT CANNOT HAPPEN. `follow()` in store.ts only appends to `following`;
                nothing ever adds to `followers`, which is seeded once with priya and chris. So for
                every other profile the promised follow-back will never arrive, and the line also
                contradicted the "practice profiles" label directly above it.
              */
              empty('Follow anyone below. Mutual follows show up here once accounts are real.')}
        </Section>

        {inbound.length ? (
          <Section title="FOLLOWS YOU">
            {inbound.map((p, i) => (
              <RiseIn key={p.id} delay={Math.min(i * STAGGER_GAP, STAGGER_CAP)}>
                <PersonRow person={p} rel={rel(p.id)} onToggle={() => toggle(p.id)} />
              </RiseIn>
            ))}
          </Section>
        ) : null}

        {/*
          * The SAME disclosure YOUR FRIENDS already carried. It did not, and this is the section
          * the reporter was actually looking at: "suggested friends (e.g., 'Priya S,' 'Chris M')
          * appear to be bots, not real users." They are — lib/people.ts says so in its first line —
          * and the one section that listed them said nothing. A label on one section and silence on
          * the next reads as "the labelled ones are fake and these ones are real", which is worse
          * than no label at all.
          */}
        <Section title="DISCOVER" note="Practice profiles. Real people appear here when accounts do.">
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name or handle"
            accessibilityLabel="Search friends"
            placeholderTextColor={theme.mutedForeground}
            autoCapitalize="none"
            autoCorrect={false}
            style={[styles.input, { borderColor: theme.border, color: theme.text }]}
          />
          {others.length
            ? others.map((p, i) => (
                <RiseIn key={p.id} delay={Math.min(i * STAGGER_GAP, STAGGER_CAP)}>
                  <PersonRow person={p} rel={rel(p.id)} onToggle={() => toggle(p.id)} />
                </RiseIn>
              ))
            : empty(query ? `Nobody matches "${query.trim()}".` : 'No one left to follow here yet.')}
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
  input: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.md, paddingHorizontal: Spacing.two + 4, paddingVertical: 10, fontSize: FontSize.bodySm, marginBottom: Spacing.two, fontFamily: Fonts.body },
  empty: { paddingVertical: Spacing.two, lineHeight: 20 },
});
