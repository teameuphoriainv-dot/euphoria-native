/**
 * /dev-gallery — every illustration source in the app, on one screen.
 *
 * WHY THIS EXISTS. The app has FIVE independent art systems and no surface that shows them
 * together, so nothing enforces consistency and drift is invisible. Measured before building this:
 *
 *   Digest cover composer   LIT #C89CF5   DARK #5B21B6   <- neither value exists in theme.ts
 *   Atlas mark              LIT #DEA5F5   DARK #A855EB   <- matches theme
 *   theme.ts                #A451E6 #A78BFA #B57BEF #7C3AED #A855EB   <- five violets
 *   lesson-art              #241C33 plus amber #FBBF24 #FDE68A        <- a non-violet hue
 *   league crests           tier hues, a DELIBERATE approved override
 *
 * Each system is internally consistent. None of them agree. That went unnoticed for one reason
 * only: you never see two of them at once, because each lives on its own screen against black.
 *
 * This route is the fix for the SEEING problem, not the palette problem. Judge the palette here,
 * then change it at source. Do not restyle anything in this file — it must show what ships.
 *
 * __DEV__ only, unreachable from any nav. Open with:
 *   xcrun simctl openurl $U "euphorianative://dev-gallery"
 */
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import { Atlas } from '@/components/atlas';
import { QuestMark, QUEST_MARK_NAMES } from '@/components/art/quest-mark';
import { LeagueCrest } from '@/components/league-crest';
import { LessonArt } from '@/components/lesson-art';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { DIGEST_HEROES } from '@/lib/digest-heroes';
import { EUPHORIA_ICONS, type EuphoriaIconName } from '@/lib/euphoria-icons';
import { TIERS } from '@/lib/league';
import { useTheme } from '@/hooks/use-theme';

function Section({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={{ marginTop: Spacing.four }}>
      <ThemedText type="label" style={{ color: theme.iconLilac }}>
        {title}
      </ThemedText>
      <ThemedText type="small" themeColor="mutedForeground" style={{ marginTop: 2, marginBottom: Spacing.two }}>
        {note}
      </ThemedText>
      <View style={styles.grid}>{children}</View>
    </View>
  );
}

/** Uniform cell so every system is judged at the SAME size. Comparing a 132pt hero against a 22pt
 *  icon tells you nothing about whether they share a palette. */
function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.cell}>
      <View style={styles.art}>{children}</View>
      <ThemedText type="small" themeColor="mutedForeground" style={styles.caption} numberOfLines={1}>
        {label}
      </ThemedText>
    </View>
  );
}

export default function DevGallery() {
  if (!__DEV__) return null;

  const heroKeys = Object.keys(DIGEST_HEROES);
  const iconNames = Object.keys(EUPHORIA_ICONS) as EuphoriaIconName[];

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedText type="title" style={{ fontSize: 22 }}>
          Art gallery
        </ThemedText>
        <ThemedText type="small" themeColor="mutedForeground" style={{ marginTop: 2 }}>
          {heroKeys.length} digest figures · {iconNames.length} icons · {TIERS.length} crests · Atlas · lesson art
        </ThemedText>

        <Section
          title="Digest figures"
          note="gen-digest-covers.mjs. Violet default; teal Markets, rose Credit, emerald Investing. Structure stays violet in every figure.">
          {heroKeys.map((k) => (
            <Cell key={k} label={k}>
              <SvgXml xml={DIGEST_HEROES[k]} width={96} height={60} />
            </Cell>
          ))}
        </Section>

        <Section title="Euphoria icons" note="Multicolour by design. `name` is now a narrow union of all 107 keys, so a typo is a compile error. Names arriving from the AUTO-SYNCED curriculum still cannot be checked at build time — those go through asEuphoriaIcon(), which logs in dev.">
          {iconNames.map((n) => (
            <Cell key={n} label={n}>
              <SvgXml xml={EUPHORIA_ICONS[n]} width={44} height={44} />
            </Cell>
          ))}
        </Section>

        <Section title="League crests" note="Tier hues deliberately override the violet-only rule, with approval. Shown held and locked.">
          {TIERS.map((t) => (
            <Cell key={t.name} label={t.name}>
              <LeagueCrest tier={t} size={56} />
            </Cell>
          ))}
          {TIERS.map((t) => (
            <Cell key={t.name + '-locked'} label={t.name + ' locked'}>
              <LeagueCrest tier={t} size={56} locked />
            </Cell>
          ))}
        </Section>

        <Section title="Quest marks" note="UNIT 12 deliverable 4, one per QuestKind. Home rotates two of the three each day, so this grid is the only place all three can be checked together — and the check that matters is that no two share a silhouette at the 16pt they actually ship at.">
          {QUEST_MARK_NAMES.map((n) => (
            <Cell key={n} label={n}>
              <QuestMark name={n} size={16} color="#BB83F1" />
            </Cell>
          ))}
          {QUEST_MARK_NAMES.map((n) => (
            <Cell key={n + '-lg'} label={n + ' @44'}>
              <QuestMark name={n} size={44} color="#BB83F1" />
            </Cell>
          ))}
        </Section>

        <Section title="Atlas" note="Vector, palette LIT #DEA5F5 / DARK #A855EB. Rendered at the sizes it actually ships at.">
          {[38, 56, 72, 104, 132].map((s) => (
            <Cell key={s} label={`${s}pt`}>
              <Atlas size={s} interactive={false} />
            </Cell>
          ))}
          {(['happy', 'proud', 'oops', 'thinking', 'whoa', 'watching'] as const).map((e) => (
            <Cell key={e} label={e}>
              <Atlas size={64} expression={e} interactive={false} />
            </Cell>
          ))}
        </Section>

        <Section title="Lesson art" note="Largest art surface in the app. Carries amber #FBBF24 — the one non-violet hue outside the crests.">
          {['investing-fundamentals', 'personal-finance', 'behavioral-finance', 'risk-management'].map((c) =>
            ['What is a stock?', 'Building an Emergency Fund', 'Understanding Market Cycles'].map((t) => (
              <Cell key={c + t} label={`${c.split('-')[0]} · ${t.slice(0, 12)}`}>
                <LessonArt courseId={c} title={t} size={56} />
              </Cell>
            )),
          )}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: Spacing.three, paddingBottom: Spacing.four * 3 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  cell: { width: 104, alignItems: 'center' },
  art: { height: 72, alignItems: 'center', justifyContent: 'center' },
  caption: { fontSize: 10, marginTop: 2, textAlign: 'center' },
});
