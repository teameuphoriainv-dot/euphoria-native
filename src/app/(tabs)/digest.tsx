/**
 * Digest — the app's daily read, rebuilt against refs/BRILLIANT_VISUAL_ANALYSIS.md.
 *
 * Three things changed from the first version, all of them for the same reason: the screen claimed
 * a daily ritual it did not actually have.
 *
 *  1. TODAY COMPLETES. Reading today's guide used to swap the card for the next unread one, so
 *     finishing never felt like finishing. It now rests on a "done for today" state. That state is
 *     DERIVED from `dailyPick` + `readPosts` — no new persisted field, nothing to add to partialize.
 *  2. IT IS A LIBRARY, NOT A QUEUE. Category chips (Brilliant's top-of-screen pattern) replace the
 *     "Next up 5 + See all" accordion. DIGEST_CATEGORIES already existed and had never been used.
 *  3. THE ART IS BIG ENOUGH TO READ. The old rows showed a flat category mark at 26px because the
 *     real hero illustrations "collapse into noise" small. Brilliant's answer to that is a bigger
 *     slot, not a simpler glyph — so the rows became illustrated cards carrying the actual hero.
 *
 * Type matches the other tabs (title @22 + the shared ThemedText scale). The serif that used to
 * live here came over with the web page and was the only serif in the app.
 */
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import { AmbientBackground } from '@/components/ambient-background';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { SlabButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { BottomTabInset, Radius, Spacing, FontSize, Fonts } from '@/constants/theme';
import {
  ALL_DIGEST_CATEGORIES as DIGEST_CATEGORIES,
  ALL_DIGEST_POSTS as DIGEST_POSTS,
  EXTRA_HERO_ART,
  type AnyDigestCategory,
  type ExtraPost,
} from '@/lib/digest-extra';
import { pickToday } from '@/lib/digest-pick';
import { heroTint, tintedHero } from '@/lib/hero-tint';
import { dayKey, useApp } from '@/lib/store';
import { useTheme } from '@/hooks/use-theme';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import { STAGGER_CAP } from '@/shared/motion/tokens';
import {
  PixelSpriteView, bolt, chartUp, checkBadge, compass, creditCard, flame as flameSprite, car, house, paycheck, shield, umbrella,
  stockTicker, wallet, type PixelSprite,
} from '@/lib/pixel';
import { ProfileButton } from '@/components/profile-button';
import { useSharedValue } from 'react-native-reanimated';
import { CompactTitle } from '@/shared/motion/compact-title';
import { RevealScrollView } from '@/shared/motion/scroll-reveal';

/**
 * A mark per Digest category.
 *
 * The section rows carried no art at all — five near-identical cards separated only by a tint and
 * a word, on the screen whose whole job is letting you pick one. A mark is what makes a row
 * findable at a glance rather than read.
 *
 * All five distinct, and all already in the shared catalogue. `DigestCategory` is a union, so a
 * category added without a mark is a COMPILE error rather than a blank slot — the same reasoning
 * as StatMark, and the reason this needs no pin.
 */
const CATEGORY_ART: Record<AnyDigestCategory, PixelSprite> = {
  Credit: creditCard,
  Strategy: compass,
  Investing: chartUp,
  'Money basics': wallet,
  Markets: stockTicker,
  // ── iOS-added categories (digest-extra.ts)
  Earning: paycheck,
  Housing: house,
  'Staying safe': shield,
  Insurance: umbrella,
  'Big purchases': car,
};

const ALL = 'All';

function Hero({ post, size }: { post: ExtraPost; size: number }) {
  /*
   * TWO KINDS OF HERO, and the key tells them apart. The 35 synced guides carry SVG scenes from
   * the web repo. Guides added on iOS carry a `px-` key that resolves to a sprite instead, because
   * the synced art cannot be changed from here and new art should not be written in a style the
   * rest of the app has left behind.
   */
  const sprite = EXTRA_HERO_ART[post.hero];
  if (sprite) return <PixelSpriteView sprite={sprite} size={Math.round(size * 0.66)} />;

  const xml = tintedHero(post.hero, post.category);
  if (!xml) return null;
  // default preserveAspectRatio letterboxes inside the box, so the illustration never distorts
  return <SvgXml xml={xml} width={size} height={size} />;
}

/** Today's guide, before it has been read. Brilliant's big-hero treatment. */
function TodayCard({ post }: { post: ExtraPost }) {
  const theme = useTheme();
  return (
    <View>
      {/*
        * ART BESIDE THE TEXT, NOT ABOVE IT. Measured on the QA device: this card ran y=146..494 of
        * an 874pt screen, about 40% of the viewport for ONE guide, and left exactly TWO library
        * rows visible above the tab bar with 29 guides in the list.
        *
        * That is C48's defect returning on a different tab. Home's next-lesson hero occupied 36%
        * for one lesson and was fixed by exactly this move, so the fix is the one this codebase
        * has already proven rather than a new idea. The `heroPanel` alone was 150pt tall.
        *
        * The art is not shrunk to nothing: 84pt in a 96pt panel still reads as illustration, and
        * the covers were authored at 320x200 so they survive the reduction. What goes is the
        * full-bleed band, which was spending a third of the card on decoration.
        */}
      <Card style={styles.today} tint={theme.primary} elevated>
        <View style={styles.todayTop}>
          <View style={[styles.heroPanelSm, { backgroundColor: (heroTint(post.category) ?? theme.primary) + '14' }]}>
            <Hero post={post} size={84} />
          </View>
          <View style={styles.todayHead}>
            <View style={styles.metaRow}>
              <ThemedText type="label" style={{ color: theme.iconLilac }}>
                Today · {post.category} · {post.readMinutes} min
              </ThemedText>
            </View>
            <ThemedText type="heading" maxFontSizeMultiplier={1.6} style={styles.todayTitle}>
              {post.title}
            </ThemedText>
          </View>
        </View>

        {/* Two lines. The excerpt states the surprise, which is its whole job on this card, and
            the third line was always the part that repeated the title. */}
        <ThemedText
          type="body"
          themeColor="mutedForeground"
          numberOfLines={2}
          style={styles.todayExcerpt}>
          {post.excerpt}
        </ThemedText>

        {/* The card's one control: a real button, not 13px link text at the bottom of the hero. */}
        <SlabButton label="Read today’s guide" full onPress={() => router.push(`/digest/${post.slug}`)} style={{ marginTop: Spacing.three }} />
      </Card>
    </View>
  );
}

/**
 * The beat the tab never had. Duolingo ends a day on a rest state, not on the next thing — so this
 * says the day is closed, shows what the read bought, and points at tomorrow. The library below
 * stays fully readable: this frames the habit, it does not gate the content.
 */
function DoneCard({ post, streak }: { post: ExtraPost; streak: number }) {
  const theme = useTheme();
  return (
    <Card style={styles.today} tint={theme.success} elevated>
      <View style={styles.doneHead}>
        {/* The catalogue's own check, not a vector tick on a green disc. This card is the payoff
            for finishing a guide and it sits directly above a grid of pixel marks — a smooth
            circle here was the one thing on the screen speaking a different language. */}
        <PixelSpriteView sprite={checkBadge} size={40} />
        <View style={{ flex: 1 }}>
          <ThemedText type="heading" style={{ fontSize: FontSize.heading }}>
            Done for today
          </ThemedText>
          <ThemedText type="small" themeColor="mutedForeground" style={{ marginTop: 2 }}>
            New guide tomorrow
          </ThemedText>
        </View>
      </View>

      <View style={styles.doneChips}>
        {/* A celebration that announces "0 day streak" is not a celebration. Guides only started
            advancing the streak this session, so anyone whose last read predates that legitimately
            sits at 0 — show them the XP and say nothing about a streak they do not have. */}
        {streak > 0 ? (
          <View style={[styles.chipStat, { backgroundColor: theme.streak + '18', borderColor: theme.streak + '40' }]}>
            {/* The same pixel flame the Home header wears. These two chips carry exactly the
                Home pills' semantics — streak and XP — so they should not be a different picture
                of the same thing one tab over. */}
            <PixelSpriteView sprite={flameSprite} size={16} />
            <ThemedText type="smallBold" style={{ color: theme.streak }}>
              {streak} day streak
            </ThemedText>
          </View>
        ) : null}
        <View style={[styles.chipStat, { backgroundColor: theme.primary + '1F', borderColor: theme.primary + '4D' }]}>
          <PixelSpriteView sprite={bolt} size={16} />
          <ThemedText type="smallBold" style={{ color: theme.iconLilac }}>
            +25 XP
          </ThemedText>
        </View>
      </View>

      <SpringPressable haptic={false} onPress={() => router.push(`/digest/${post.slug}`)}>
        <View style={[styles.doneRead, { borderColor: theme.border }]}>
          <Hero post={post} size={40} />
          <ThemedText type="bodyMedium" maxFontSizeMultiplier={1.6} style={{ flex: 1, lineHeight: 20 }} numberOfLines={2}>
            {post.title}
          </ThemedText>
          <UIcon name="chevronRight" size={16} color={theme.mutedForeground} />
        </View>
      </SpringPressable>
    </Card>
  );
}

/** Brilliant's unit card: rich illustration on the LEFT, title beside it, at a size that reads. */
function GuideCard({ post, read }: { post: ExtraPost; read: boolean }) {
  const theme = useTheme();
  return (
    <SpringPressable onPress={() => router.push(`/digest/${post.slug}`)} scaleTo={0.97}>
      <Card style={styles.guide}>
        <View style={[styles.guideArt, { backgroundColor: (heroTint(post.category) ?? theme.primary) + '12' }]}>
          <Hero post={post} size={62} />
        </View>
        <View style={{ flex: 1 }}>
          <ThemedText type="bodyMedium" themeColor={read ? 'mutedForeground' : undefined} style={{ lineHeight: 20 }}>
            {post.title}
          </ThemedText>
          <ThemedText type="small" themeColor="mutedForeground" style={{ marginTop: 3 }}>
            {post.category} · {post.readMinutes} min
          </ThemedText>
        </View>
        <View
          style={[
            styles.tick,
            { borderColor: read ? theme.primary : theme.border, backgroundColor: read ? theme.primary : 'transparent' },
          ]}>
          {read && <UIcon name="check" size={11} color="#fff" />}
        </View>
      </Card>
    </SpringPressable>
  );
}

export default function Digest() {
  const scrollY = useSharedValue(0);
  const theme = useTheme();
  const readPosts = useApp((s) => s.readPosts);
  const dailyPick = useApp((s) => s.dailyPick);
  const setDailyPick = useApp((s) => s.setDailyPick);
  // a stored NUMBER is a safe selector; a getter that builds an array is not
  const streak = useApp((s) => s.streak);

  const { day, post: today } = useMemo(() => pickToday(readPosts, dailyPick), [readPosts, dailyPick]);

  // pin the choice so the rest of the day keeps offering the same guide
  useEffect(() => {
    if (dailyPick?.day !== day || dailyPick.slug !== today.slug) setDailyPick(day, today.slug);
  }, [day, today.slug, dailyPick, setDailyPick]);

  // Today is done only when the guide pinned to TODAY has been read. Reading a catch-up guide is
  // not the ritual, and yesterday's pin must not close today.
  const doneToday = dailyPick?.day === dayKey() && readPosts.includes(dailyPick.slug);

  const [filter, setFilter] = useState<string>(ALL);
  const [query, setQuery] = useState('');

  /* Counts are over the WHOLE library including today's pick, because the chip answers "how much
     Credit is there", not "how much Credit is left in the list below". */
  const counts = useMemo(() => {
    const m: Record<string, number> = { [ALL]: DIGEST_POSTS.length };
    for (const p of DIGEST_POSTS) m[p.category] = (m[p.category] ?? 0) + 1;
    return m;
  }, []);
  const readCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const p of DIGEST_POSTS) if (readPosts.includes(p.slug)) m[p.category] = (m[p.category] ?? 0) + 1;
    return m;
  }, [readPosts]);
  // On first paint the list staggers in behind the header and hero, so it starts late on purpose.
  // A filter TAP is a different event: the user acted and wants to see the list answer, so the
  // cascade starts immediately and only the per-item offset remains. Same animation, different
  // lead-in, because the two moments mean different things.
  const [touched, setTouched] = useState(false);
  /** Show the section index rather than a list: no category chosen and nothing searched. */
  const browsing = filter === ALL && query.trim() === '';
  const cascadeBase = touched ? 0 : 190;

  const q = query.trim().toLowerCase();
  const library = useMemo(
    () =>
      DIGEST_POSTS.filter((p) => {
        if (p.slug === today.slug) return false;
        if (filter !== ALL && p.category !== filter) return false;
        if (!q) return true;
        // Title AND excerpt: the excerpt carries the surprise, so "compound" should find the
        // guide that explains compounding even when the word is absent from its title.
        return `${p.title} ${p.excerpt}`.toLowerCase().includes(q);
      })
        // unread first, so the list always leads with something to do
        .sort((a, b) => Number(readPosts.includes(a.slug)) - Number(readPosts.includes(b.slug))),
    [today.slug, readPosts, filter, q],
  );

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AmbientBackground starCount={40} />
      <RevealScrollView scrollY={scrollY} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header and today's card paint on the first frame (no RiseIn): an entrance fade here
            left the tab blank while it mounted. The grid below still staggers in. */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ThemedText type="title" style={{ flex: 1, fontSize: FontSize.titleSm }}>
            Digest
          </ThemedText>
          <ProfileButton />
        </View>

        {doneToday ? <DoneCard post={today} streak={streak} /> : <TodayCard post={today} />}

        <RiseIn delay={130}>
          <View style={[styles.search, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}>
            <UIcon name="search" size={17} color={theme.mutedForeground} />
            <TextInput
              value={query}
              onChangeText={(t) => {
                setQuery(t);
                setTouched(true);
              }}
              placeholder="Search guides"
              placeholderTextColor={theme.mutedForeground}
              style={[styles.searchInput, { color: theme.text }]}
              autoCorrect={false}
              returnKeyType="search"
              clearButtonMode="while-editing"
              accessibilityLabel="Search guides"
            />
          </View>
        </RiseIn>

        <RiseIn delay={145}>
          <View style={styles.sectionHead}>
            <ThemedText type="label" themeColor="mutedForeground">
              {browsing ? 'Categories' : 'Guides'}
            </ThemedText>
            {readPosts.length > 0 ? (
              <ThemedText type="small" themeColor="mutedForeground">
                {readPosts.length} of {DIGEST_POSTS.length} read
              </ThemedText>
            ) : null}
          </View>
        </RiseIn>

        {/*
          * SEARCH. 3/3 of the reference libraries carry one (Deepstash `247137`, Bloomberg
          * `101198`, Headway `128659`) and Digest had none. It was survivable at 25 guides and
          * stops being so at 60: the only way to reach a specific guide was to remember its
          * category and scroll.
          *
          * A plain input rather than a routed search screen, because the list it filters is
          * already on this screen and a route would throw away the scroll position to show the
          * same rows.
          */}

        {/*
         * SECTIONS DOWN THE PAGE, NOT CHIPS ACROSS THE TOP.
         *
         * Reported 2026-08-22 (N18): "replace the current dropdown-oval categories (credit,
         * strategy, etc.) with distinct sections/rectangles stacked down the screen (similar to the
         * Euphoria web app). Tapping a section opens its article list. Goal: more visual separation
         * between categories."
         *
         * The chip row filtered ONE flat list in place, so Credit and Strategy guides sat in the
         * same column in the same card shape and the only thing separating them was a word in the
         * caption. That is the "more visual separation" he is asking for: a category should be a
         * PLACE you enter, not a predicate applied to a list you are already looking at.
         *
         * Each section carries the category's own hero tint, so the colour that already identifies
         * a guide's art now identifies its section too — no new palette invented for this.
         *
         * Search still bypasses sections entirely: a query is a search across everything, and
         * making someone pick a category first would be a worse search.
         */}
        {browsing ? (
          <View style={styles.sections}>
            {DIGEST_CATEGORIES.map((c, i) => {
              const tint = heroTint(c) ?? theme.primary;
              return (
                <View key={c} style={styles.sectionCell}>
                  <RiseIn delay={160 + Math.min(i * 40, STAGGER_CAP)}>
                    <SpringPressable
                      onPress={() => {
                        setFilter(c);
                        setTouched(true);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`${c}, ${String(readCounts[c] ?? 0)} of ${String(counts[c] ?? 0)} read`}>
                      <Card tint={tint} style={styles.sectionCard}>
                        <PixelSpriteView sprite={CATEGORY_ART[c]} size={44} />
                        <ThemedText type="heading" maxFontSizeMultiplier={1.6} style={{ fontSize: FontSize.body, textAlign: 'center' }} numberOfLines={2}>
                          {c}
                        </ThemedText>
                        <ThemedText type="small" themeColor="mutedForeground">
                          {readCounts[c] ? `${String(readCounts[c])} of ${String(counts[c] ?? 0)} read` : `${String(counts[c] ?? 0)} ${counts[c] === 1 ? 'guide' : 'guides'}`}
                        </ThemedText>
                        {readCounts[c] ? (
                          <View style={styles.tileBar}>
                            <ProgressBar value={readCounts[c] / (counts[c] ?? 1)} tone={tint} />
                          </View>
                        ) : null}
                      </Card>
                    </SpringPressable>
                  </RiseIn>
                </View>
              );
            })}
          </View>
        ) : (
          /* Inside a category: a way back out. Without this the only exit from a section is the
             tab bar, which loses your place in the library. */
          filter !== ALL ? (
            <RiseIn delay={80}>
              <SpringPressable
                onPress={() => setFilter(ALL)}
                accessibilityRole="button"
                accessibilityLabel="Back to all categories"
                style={styles.backRow}>
                <UIcon name="chevronLeft" size={20} color={theme.iconLilac} />
                <ThemedText type="bodyMedium" style={{ color: theme.iconLilac }}>All categories</ThemedText>
              </SpringPressable>
            </RiseIn>
          ) : null
        )}

        {/* keyed by filter so EVERY card remounts and the whole list cascades on a chip tap.
            Without this key, cards surviving the filter keep their React key, never remount, and
            never replay RiseIn — so the list changed instantly with no feedback at all and only
            newly-matching cards animated. Half a list animating is worse than none. */}
        {browsing ? null : (
        <View key={filter} style={styles.list}>
          {library.map((p, i) => (
            <RiseIn key={p.slug} delay={cascadeBase + Math.min(i * 30, STAGGER_CAP)}>
              <GuideCard post={p} read={readPosts.includes(p.slug)} />
            </RiseIn>
          ))}
          {library.length === 0 ? (
            <ThemedText type="small" themeColor="mutedForeground" style={styles.empty}>
              {q ? `No guides match “${query.trim()}”` : `Nothing else in ${filter} yet.`}
            </ThemedText>
          ) : null}
        </View>
        )}
      </RevealScrollView>
      <CompactTitle title="Digest" scrollY={scrollY} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: Spacing.three, paddingBottom: BottomTabInset + Spacing.four },
  today: { marginTop: Spacing.three, padding: Spacing.three },
  // 96 square beside the text, replacing a 150pt full-bleed band above it. See TodayCard.
  heroPanelSm: {
    width: 96,
    height: 96,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  todayHead: { flex: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: Spacing.two },
  /* Capped where it is USED, not here — see the ThemedText below. At AX5 this 19pt heading
     reached ~59pt and broke mid-word as "Avalan / che vs". The frozen lineHeight is left
     alone deliberately: the device frame shows those lines rendering GENEROUSLY spaced, not
     crowded, so RN expanded past the 25pt box rather than clipping in it. The defect here was
     the uncapped font, not the leading. */
  todayTitle: { fontSize: FontSize.heading, lineHeight: 25, marginTop: 4 },
  todayExcerpt: { marginTop: Spacing.two, lineHeight: 21 },

  doneHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two + 2 },
  doneCheck: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  doneChips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.one + 2, marginTop: Spacing.three },
  chipStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  doneRead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.three,
    paddingTop: Spacing.two + 2,
    borderTopWidth: StyleSheet.hairlineWidth,
  },

  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.four },
  chipScroll: { marginTop: Spacing.two },
  /*
   * A GRID, NOT A STACK. Five full-width rows each ~100pt tall put one and a half categories on
   * screen under the Done card, and every one of them was a big rectangle holding a word, a count
   * and an arrow. Two columns fit the whole library above the fold and give the mark room to be
   * the thing you actually scan for, which is what a category picker is for.
   */
  sections: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  /** Just under half, so two fit per row with the gap between them and the wrap is not fragile. */
  sectionCell: { width: '48%' },
  sectionCard: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    // Fixed, so a two-line name ("Money basics") does not make its tile taller than the one beside
    // it and break the grid's rhythm.
    minHeight: 132,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
  },
  tileBar: { alignSelf: 'stretch', flexDirection: 'row', paddingHorizontal: Spacing.two },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, marginTop: Spacing.three, paddingVertical: Spacing.two, minHeight: 44 },
  chipRow: { gap: Spacing.one + 2, paddingRight: Spacing.three },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.pill, borderWidth: 1.5 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    height: 44, // HIG minimum, and the row is the tap target for the field
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: Spacing.two,
  },
  searchInput: { flex: 1, fontSize: FontSize.bodySm, padding: 0, fontFamily: Fonts.body },

  list: { marginTop: Spacing.two + 2, gap: Spacing.two },
  guide: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, padding: Spacing.two },
  guideArt: { width: 74, height: 74, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  tick: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  empty: { textAlign: 'center', paddingVertical: Spacing.four },
});
