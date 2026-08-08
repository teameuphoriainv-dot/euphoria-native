/**
 * Blocks — renders a Digest article's markdown with the app's own type scale.
 *
 * Purpose-built rather than a markdown dependency: the corpus uses exactly five block kinds
 * (## heading, paragraph, - bullet, > quote, ![alt](heroKey)) and one inline kind (**bold**),
 * verified across all 15 posts. A general renderer would ship its own typography, which is the
 * thing that made Digest look imported in the first place.
 *
 * Inline images reference the same DIGEST_HEROES keys the post covers use.
 */
import { StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Spacing, FontSize } from '@/constants/theme';
import type { DigestCategory } from '@/lib/digest-content';
import { heroTint, tintedHero } from '@/lib/hero-tint';
import { useTheme } from '@/hooks/use-theme';

export type Block =
  | { kind: 'h2'; text: string }
  | { kind: 'p'; text: string }
  | { kind: 'bullet'; items: string[] }
  | { kind: 'quote'; text: string }
  | { kind: 'image'; hero: string; alt: string };

/**
 * Smart Brevity's section labels are ANCHORS, not titles.
 *
 * The newer posts are written in Axios's format, where a fixed vocabulary of labels lets the eye
 * skip to the part it wants. Rendering "Why it matters" at the same 21px as a real heading defeats
 * that — it reads as a chapter title and the scanning stops working. Eye-tracking is the whole
 * argument for the format: the reader samples until something catches, so the labels have to look
 * like signposts, not like prose.
 *
 * Detected from the label TEXT rather than new markdown syntax, which is what keeps the web
 * renderer — which has no concept of this — rendering the same posts correctly as plain headings.
 * The older 20 posts use ordinary descriptive headings and are untouched by this.
 */
const BREVITY_LABELS = /^(why it matters|the big picture|by the numbers|the catch|between the lines|what to do|what it solves|go deeper|the bottom line)$/i;

/** The closer gets its own treatment: it is the one line most readers will actually finish on. */
const isBottomLine = (text: string) => /^the bottom line$/i.test(text);

/** Splits the markdown into blocks. Consecutive `- ` lines collapse into one list. */
export function parseBlocks(md: string): Block[] {
  const out: Block[] = [];
  for (const raw of md.split('\n')) {
    const line = raw.trim();
    if (!line) continue;

    const img = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (img) {
      out.push({ kind: 'image', alt: img[1], hero: img[2] });
    } else if (line.startsWith('## ')) {
      out.push({ kind: 'h2', text: line.slice(3) });
    } else if (line.startsWith('> ')) {
      out.push({ kind: 'quote', text: line.slice(2) });
    } else if (line.startsWith('- ')) {
      const prev = out[out.length - 1];
      if (prev?.kind === 'bullet') prev.items.push(line.slice(2));
      else out.push({ kind: 'bullet', items: [line.slice(2)] });
    } else {
      out.push({ kind: 'p', text: line });
    }
  }
  return out;
}

/** Renders **bold** runs as nested Text so a bold phrase stays inline in its sentence.
 *  Prose uses the app's own body type. It is only lifted to textSecondary, because
 *  mutedForeground is the chrome grey and is too dim to read paragraphs in. */
function Rich({
  text,
  muted = true,
  tight = false,
  lead = false,
}: {
  text: string;
  muted?: boolean;
  tight?: boolean;
  lead?: boolean;
}) {
  const theme = useTheme();
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return (
    <ThemedText
      style={[
        lead ? styles.lead : styles.para,
        tight && styles.paraTight,
        { color: lead || !muted ? theme.text : theme.textSecondary },
      ]}>
      {parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**') ? (
          <ThemedText key={i} style={[lead ? styles.leadStrong : styles.strong, { color: theme.text }]}>
            {p.slice(2, -2)}
          </ThemedText>
        ) : (
          p
        ),
      )}
    </ThemedText>
  );
}

/**
 * A Smart Brevity label renders as a signpost, a real heading renders as a heading.
 *
 * Shared by both renderers below so the two cannot drift — this file already carries two near
 * identical block switches, and a third copy of this rule would be the one that gets forgotten.
 */
function H2({ text }: { text: string }) {
  const theme = useTheme();
  if (!BREVITY_LABELS.test(text)) {
    return (
      <ThemedText type="heading" style={styles.h2}>
        {text}
      </ThemedText>
    );
  }
  return (
    <View style={[styles.label, isBottomLine(text) && { ...styles.bottomRule, borderTopColor: theme.border }]}>
      <ThemedText type="label" style={{ color: theme.iconLilac }}>
        {text}
      </ThemedText>
    </View>
  );
}

/** Renders an arbitrary run of blocks. The paginated reader uses this per section.
 *  `category` selects the figure's hue ramp — see lib/hero-tint.ts for why tinting
 *  happens at render time rather than in the synced artwork. */
export function Blocks({ blocks, category }: { blocks: Block[]; category: DigestCategory }) {
  const theme = useTheme();
  // a "Key Takeaways" heading plus the list under it renders as one callout
  const takeIdx = blocks.findIndex((b) => b.kind === 'h2' && /^key takeaways$/i.test(b.text));
  const takeList = takeIdx >= 0 && blocks[takeIdx + 1]?.kind === 'bullet' ? takeIdx + 1 : -1;

  return (
    <View>
      {blocks.map((b, i) => {
        if (takeList > 0 && i === takeIdx) {
          const list = blocks[takeList];
          if (list.kind !== 'bullet') return null;
          return (
            <View
              key={i}
              style={[styles.takeaways, { borderColor: theme.primary + '3D', backgroundColor: theme.primary + '12' }]}>
              <ThemedText type="label" style={{ color: theme.iconLilac }}>Key takeaways</ThemedText>
              <View style={{ marginTop: Spacing.two, gap: Spacing.one }}>
                {list.items.map((it, j) => (
                  <View key={j} style={styles.li}>
                    <View style={[styles.dot, { backgroundColor: theme.primary }]} />
                    <View style={{ flex: 1 }}>
                      <Rich text={it} muted={false} tight />
                    </View>
                  </View>
                ))}
              </View>
            </View>
          );
        }
        if (i === takeList) return null;

        switch (b.kind) {
          case 'h2':
            return <H2 key={i} text={b.text} />;
          case 'quote':
            return (
              <View key={i} style={[styles.quote, { borderLeftColor: theme.primary, backgroundColor: theme.primary + '10' }]}>
                <ThemedText type="bodyMedium" style={{ lineHeight: 23 }}>
                  {b.text}
                </ThemedText>
              </View>
            );
          case 'bullet':
            return (
              <View key={i} style={styles.list}>
                {b.items.map((it, j) => (
                  <View key={j} style={styles.li}>
                    <View style={[styles.dot, { backgroundColor: theme.primary }]} />
                    <View style={{ flex: 1 }}>
                      <Rich text={it} tight />
                    </View>
                  </View>
                ))}
              </View>
            );
          case 'image': {
            const xml = tintedHero(b.hero, category);
            if (!xml) return null;
            return (
              <View key={i} style={[styles.figure, { backgroundColor: (heroTint(category) ?? theme.primary) + '12' }]}>
                <SvgXml xml={xml} width="100%" height={196} />
              </View>
            );
          }
          default:
            // the opening line carries the whole argument in this format — at body size it reads
            // as just another paragraph and the hook is lost
            return <Rich key={i} text={b.text} lead={i === 0} />;
        }
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  h2: { fontSize: FontSize.titleSm, lineHeight: 28, marginTop: Spacing.four, marginBottom: Spacing.one },
  /**
   * Prose is 18/29 — a 1.61 ratio.
   *
   * It was 16.5/26, which is a UI size, not a reading size. Publishing platforms settle around
   * 18–21px for body text for a reason: sustained reading at UI scale is work, and work is the
   * opposite of wanting to keep going. 1.5–1.6 line height is the readability guidance; the extra
   * leading here is deliberate, because generous leading is what makes a column feel like it falls
   * down the page instead of having to be climbed.
   *
   * `strong` MUST track para's size and lineHeight — it renders as nested Text inside it, and a
   * mismatch shifts the baseline mid-sentence.
   */
  para: { fontFamily: Fonts.body, fontSize: FontSize.subhead, lineHeight: 29, marginTop: Spacing.three },
  paraTight: { marginTop: 0 },
  strong: { fontFamily: Fonts.semibold, fontSize: FontSize.subhead, lineHeight: 29 },
  // The lead is the hook. It gets its own scale so the first thing you see is the whole argument.
  lead: { fontFamily: Fonts.body, fontSize: FontSize.headingXl, lineHeight: 31, marginTop: Spacing.two },
  leadStrong: { fontFamily: Fonts.semibold, fontSize: FontSize.headingXl, lineHeight: 31 },
  label: { marginTop: Spacing.four, marginBottom: Spacing.one },
  bottomRule: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Spacing.three },
  quote: {
    borderLeftWidth: 3,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two + 2,
    marginTop: Spacing.three,
  },
  takeaways: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.three,
    marginTop: Spacing.four,
  },
  list: { marginTop: Spacing.three, gap: Spacing.two + 2 },
  li: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two },
  dot: { width: 5, height: 5, borderRadius: Radius.track, marginTop: 11 },
  figure: {
    height: 224,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.three,
  },
});
