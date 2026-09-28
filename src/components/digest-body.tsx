/**
 * Blocks: renders a Digest article's markdown with the app's own type scale.
 *
 * Purpose-built rather than a markdown dependency: a general renderer would ship its own
 * typography, which is the thing that made Digest look imported in the first place.
 *
 * THE GRAMMAR IS THE WEB'S, block for block (euphoriaweb src/features/digest/components/
 * DigestMarkdown.tsx). Blocks are split on BLANK LINES and a block's first characters decide its
 * kind: "## " and "### " headings, "- " lists (every line), "> " quotes, ">>> Title" callouts,
 * "::: value :: label" stat rows, "[[chart:key]]" charts, else a paragraph. Inline: **bold** and
 * [text](https://...) links. This parser used to split on single lines, which is not what the web
 * does: a paragraph hard-wrapped over two lines rendered as two paragraphs here and one there.
 * scripts/sync-digest.mjs rejects any block this file cannot draw, so nothing unknown gets here
 * from the web.
 *
 * Two kinds never come from the body: `keypoints` and `sources` are the post's keyPoints and
 * sources lists, which the reader splices in at the top and the end of the article (as the web
 * article page does), so they paginate with everything else.
 */
import type { ReactNode } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { DigestChart } from '@/components/digest-chart';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { Fonts, FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { DigestChart as ChartSpec, DigestSource } from '@/lib/digest-content';

export type Block =
  | { kind: 'h2'; text: string }
  | { kind: 'h3'; text: string }
  | { kind: 'p'; text: string }
  | { kind: 'bullet'; items: string[] }
  | { kind: 'quote'; text: string }
  | { kind: 'callout'; title: string; text: string }
  | { kind: 'stats'; items: { value: string; label: string }[] }
  | { kind: 'chart'; key: string }
  | { kind: 'keypoints'; items: string[] }
  | { kind: 'sources'; items: DigestSource[] };

/**
 * Smart Brevity's section labels are ANCHORS, not titles.
 *
 * The newer posts are written in Axios's format, where a fixed vocabulary of labels lets the eye
 * skip to the part it wants. Rendering "Why it matters" at the same 21px as a real heading defeats
 * that: it reads as a chapter title and the scanning stops working.
 *
 * Detected from the label TEXT rather than new markdown syntax, which is what keeps the web
 * renderer, which has no concept of this, rendering the same posts correctly as plain headings.
 */
const BREVITY_LABELS = /^(why it matters|the big picture|by the numbers|the catch|between the lines|what to do|what it solves|go deeper|the bottom line)$/i;

/** The closer gets its own treatment: it is the one line most readers will actually finish on. */
const isBottomLine = (text: string) => /^the bottom line$/i.test(text);

/** Inline **bold** spans and [text](https://...) links. The web's INLINE regex, unchanged. */
const INLINE = /\*\*(.+?)\*\*|\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;

/** A heading's plain text, inline markup stripped (web headingText). */
const plain = (raw: string) =>
  raw.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '$1');

/** HTML collapses a newline inside a paragraph to a space; RN would print a line break. */
const flow = (s: string) => s.replace(/\s*\n\s*/g, ' ').trim();

export function parseBlocks(md: string): Block[] {
  const out: Block[] = [];
  for (const block of md.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean)) {
    const lines = block.split('\n');
    if (block.startsWith('## ')) {
      out.push({ kind: 'h2', text: plain(flow(block.slice(3))) });
      continue;
    }
    if (block.startsWith('### ')) {
      out.push({ kind: 'h3', text: plain(flow(block.slice(4))) });
      continue;
    }
    const chart = /^\[\[chart:([a-z0-9-]+)\]\]$/.exec(block);
    if (chart) {
      out.push({ kind: 'chart', key: chart[1] });
      continue;
    }
    if (block.startsWith('::: ')) {
      out.push({
        kind: 'stats',
        items: lines
          .filter((l) => l.startsWith('::: '))
          .map((l) => {
            const [value, ...rest] = l.slice(4).split(' :: ');
            return { value: value.trim(), label: rest.join(' :: ').trim() };
          }),
      });
      continue;
    }
    if (block.startsWith('>>> ')) {
      const [first, ...rest] = lines;
      out.push({ kind: 'callout', title: first.slice(4).trim(), text: flow(rest.join(' ')) });
      continue;
    }
    if (block.startsWith('> ')) {
      out.push({ kind: 'quote', text: flow(block.replace(/^> ?/gm, '')) });
      continue;
    }
    if (lines.every((l) => l.startsWith('- '))) {
      out.push({ kind: 'bullet', items: lines.map((l) => l.slice(2)) });
      continue;
    }
    out.push({ kind: 'p', text: flow(block) });
  }
  return out;
}

const openLink = (url: string) => void Linking.openURL(url).catch(() => undefined);

/** Renders inline **bold** and links as nested Text, so they stay inside their sentence.
 *  Prose uses the app's own body type. It is only lifted to textSecondary, because
 *  mutedForeground is the chrome grey and is too dim to read paragraphs in. */
function Rich({
  text,
  muted = true,
  tight = false,
  lead = false,
  small = false,
}: {
  text: string;
  muted?: boolean;
  tight?: boolean;
  lead?: boolean;
  /** Stat labels and callout bodies: the small reading size. */
  small?: boolean;
}) {
  const theme = useTheme();
  const base = lead ? styles.lead : small ? styles.smallPara : styles.para;
  // `strong` MUST track its paragraph's size and lineHeight: it renders nested, and a mismatch
  // shifts the baseline mid-sentence.
  const strong = lead ? styles.leadStrong : small ? styles.smallStrong : styles.strong;
  const parts: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(INLINE)) {
    const at = m.index;
    if (at > last) parts.push(text.slice(last, at));
    if (m[1] !== undefined) {
      parts.push(
        <ThemedText key={at} style={[strong, { color: theme.text }]}>
          {m[1]}
        </ThemedText>,
      );
    } else {
      const url = m[3];
      parts.push(
        <ThemedText
          key={at}
          accessibilityRole="link"
          onPress={() => openLink(url)}
          style={[base, styles.inlineFix, styles.link, { color: theme.text, textDecorationColor: theme.iconLilac }]}>
          {m[2]}
        </ThemedText>,
      );
    }
    last = at + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return (
    <ThemedText style={[base, tight && styles.paraTight, { color: lead || !muted ? theme.text : theme.textSecondary }]}>
      {parts}
    </ThemedText>
  );
}

/**
 * A Smart Brevity label renders as a signpost, a real heading renders as a heading.
 * Shared so the two block switches in this app cannot drift on it.
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

/** A bulleted list, shared by body lists, Key points and the "Key takeaways" callout. */
function Bullets({ items, muted = true }: { items: string[]; muted?: boolean }) {
  const theme = useTheme();
  return (
    <View style={styles.list}>
      {items.map((it, j) => (
        <View key={j} style={styles.li}>
          <View style={[styles.dot, { backgroundColor: theme.primary }]} />
          <View style={{ flex: 1 }}>
            <Rich text={it} muted={muted} tight />
          </View>
        </View>
      ))}
    </View>
  );
}

/** The tinted box that Key points, callouts and "Key takeaways" share. */
function Panel({ title, children }: { title: string; children: ReactNode }) {
  const theme = useTheme();
  return (
    <View style={[styles.panel, { borderColor: theme.primary + '3D', backgroundColor: theme.primary + '12' }]}>
      <ThemedText type="label" style={{ color: theme.iconLilac }}>{title}</ThemedText>
      {children}
    </View>
  );
}

/** Renders an arbitrary run of blocks. The paginated reader uses this per card. */
export function Blocks({ blocks, charts }: { blocks: Block[]; charts?: Record<string, ChartSpec> }) {
  const theme = useTheme();
  // a "Key Takeaways" heading plus the list under it renders as one callout (older posts)
  const takeIdx = blocks.findIndex((b) => b.kind === 'h2' && /^key takeaways$/i.test(b.text));
  const takeList = takeIdx >= 0 && blocks[takeIdx + 1]?.kind === 'bullet' ? takeIdx + 1 : -1;

  return (
    <View>
      {blocks.map((b, i) => {
        if (takeList > 0 && i === takeIdx) {
          const list = blocks[takeList];
          if (list.kind !== 'bullet') return null;
          return (
            <Panel key={i} title="Key takeaways">
              <Bullets items={list.items} muted={false} />
            </Panel>
          );
        }
        if (i === takeList) return null;

        switch (b.kind) {
          case 'h2':
            return <H2 key={i} text={b.text} />;
          case 'h3':
            return (
              <ThemedText key={i} type="heading" style={styles.h3}>
                {b.text}
              </ThemedText>
            );
          case 'keypoints':
            return (
              <Panel key={i} title="Key points">
                <Bullets items={b.items} muted={false} />
              </Panel>
            );
          case 'callout':
            return (
              <Panel key={i} title={b.title}>
                {b.text ? <Rich text={b.text} small muted={false} /> : null}
              </Panel>
            );
          case 'stats':
            return (
              <View key={i} style={styles.stats}>
                {b.items.map((s, j) => (
                  <View key={j} style={[styles.stat, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
                    <ThemedText style={styles.statValue}>{s.value}</ThemedText>
                    <View style={{ flex: 1 }}>
                      <Rich text={s.label} small tight />
                    </View>
                  </View>
                ))}
              </View>
            );
          case 'chart': {
            const spec = charts?.[b.key];
            // The sync fails a body that references a chart the post never defined, so this is
            // only reachable by a hand edit. Nothing beats a broken box.
            return spec ? <DigestChart key={i} spec={spec} /> : null;
          }
          case 'quote':
            return (
              <View key={i} style={[styles.quote, { borderLeftColor: theme.primary, backgroundColor: theme.primary + '10' }]}>
                <Rich text={b.text} muted={false} tight />
              </View>
            );
          case 'bullet':
            return <Bullets key={i} items={b.items} />;
          case 'sources':
            return (
              <View key={i} style={[styles.sources, { borderTopColor: theme.border }]}>
                <ThemedText type="label" themeColor="mutedForeground">Sources</ThemedText>
                {b.items.map((s) => (
                  <Pressable
                    key={s.url}
                    accessibilityRole="link"
                    accessibilityLabel={s.label}
                    onPress={() => openLink(s.url)}
                    style={styles.sourceRow}>
                    <ThemedText type="small" style={[styles.link, { flex: 1, color: theme.textSecondary, textDecorationColor: theme.border }]}>
                      {s.label}
                    </ThemedText>
                    <UIcon name="arrowRight" size={14} color={theme.mutedForeground} />
                  </Pressable>
                ))}
              </View>
            );
          default:
            // the opening line carries the whole argument in this format: at body size it reads
            // as just another paragraph and the hook is lost
            return <Rich key={i} text={b.text} lead={i === 0} />;
        }
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  h2: { fontSize: FontSize.titleSm, lineHeight: 28, marginTop: Spacing.four, marginBottom: Spacing.one },
  h3: { fontSize: FontSize.subhead, lineHeight: 24, marginTop: Spacing.three },
  /**
   * Prose is 18/29, a 1.61 ratio. Publishing platforms settle around 18-21px for body text for
   * a reason: sustained reading at UI scale is work. 1.5-1.6 line height is the readability
   * guidance; the extra leading makes a column fall down the page instead of being climbed.
   */
  para: { fontFamily: Fonts.body, fontSize: FontSize.subhead, lineHeight: 29, marginTop: Spacing.three },
  paraTight: { marginTop: 0 },
  strong: { fontFamily: Fonts.semibold, fontSize: FontSize.subhead, lineHeight: 29 },
  smallPara: { fontFamily: Fonts.body, fontSize: FontSize.bodySm, lineHeight: 22, marginTop: Spacing.one },
  smallStrong: { fontFamily: Fonts.semibold, fontSize: FontSize.bodySm, lineHeight: 22 },
  // The lead is the hook. It gets its own scale so the first thing you see is the whole argument.
  lead: { fontFamily: Fonts.body, fontSize: FontSize.headingXl, lineHeight: 31, marginTop: Spacing.two },
  leadStrong: { fontFamily: Fonts.semibold, fontSize: FontSize.headingXl, lineHeight: 31 },
  // a nested link inherits size from `base`; its own top margin would be ignored anyway, zeroed
  // so the style reads true
  inlineFix: { marginTop: 0 },
  link: { textDecorationLine: 'underline' },
  label: { marginTop: Spacing.four, marginBottom: Spacing.one },
  bottomRule: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Spacing.three },
  quote: {
    borderLeftWidth: 3,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two + 2,
    marginTop: Spacing.three,
  },
  panel: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.three,
    marginTop: Spacing.four,
    gap: Spacing.two,
  },
  list: { marginTop: Spacing.three, gap: Spacing.two + 2 },
  li: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two },
  dot: { width: 5, height: 5, borderRadius: Radius.track, marginTop: 11 },
  /*
   * STAT ROWS STACK, value beside label. The web lays three tiles across at desktop width and
   * stacks them one per row on a phone. Across, a value like "3.50% to 3.75%" (the longest
   * synced 2026-09-28) cannot fit a third of a 358pt column at a readable size.
   */
  stats: { marginTop: Spacing.four, gap: Spacing.two },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingVertical: Spacing.two + 4,
    paddingHorizontal: Spacing.three,
  },
  statValue: { fontFamily: Fonts.bold, fontSize: FontSize.titleSm, lineHeight: 28, maxWidth: '50%' },
  sources: { marginTop: Spacing.five, paddingTop: Spacing.three, borderTopWidth: StyleSheet.hairlineWidth, gap: Spacing.one },
  // 44pt rows: each source is its own tap target (CONSTITUTION §5.10)
  sourceRow: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.two },
});
