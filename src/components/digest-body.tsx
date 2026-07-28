/**
 * DigestBody — renders a Digest article's markdown with the app's own type scale.
 *
 * Purpose-built rather than a markdown dependency: the corpus uses exactly five block kinds
 * (## heading, paragraph, - bullet, > quote, ![alt](heroKey)) and one inline kind (**bold**),
 * verified across all 15 posts. A general renderer would ship its own typography, which is the
 * thing that made Digest look imported in the first place.
 *
 * Inline images reference the same DIGEST_HEROES keys the post covers use.
 */
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { heroSvg } from '@/lib/digest-heroes';
import { useTheme } from '@/hooks/use-theme';

export type Block =
  | { kind: 'h2'; text: string }
  | { kind: 'p'; text: string }
  | { kind: 'bullet'; items: string[] }
  | { kind: 'quote'; text: string }
  | { kind: 'image'; hero: string; alt: string };

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
function Rich({ text, muted = true, tight = false }: { text: string; muted?: boolean; tight?: boolean }) {
  const theme = useTheme();
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return (
    <ThemedText style={[styles.para, tight && styles.paraTight, { color: muted ? theme.textSecondary : theme.text }]}>
      {parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**') ? (
          <ThemedText key={i} style={[styles.strong, { color: theme.text }]}>
            {p.slice(2, -2)}
          </ThemedText>
        ) : (
          p
        ),
      )}
    </ThemedText>
  );
}

/** Renders an arbitrary run of blocks. The paginated reader uses this per section; DigestBody
 *  below is the whole-article form. */
export function Blocks({ blocks }: { blocks: Block[] }) {
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
            return (
              <ThemedText key={i} type="heading" style={styles.h2}>
                {b.text}
              </ThemedText>
            );
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
            const xml = heroSvg(b.hero);
            if (!xml) return null;
            return (
              <View key={i} style={[styles.figure, { backgroundColor: theme.primary + '12' }]}>
                <SvgXml xml={xml} width="100%" height={196} />
              </View>
            );
          }
          default:
            return <Rich key={i} text={b.text} />;
        }
      })}
    </View>
  );
}

export function DigestBody({ markdown }: { markdown: string }) {
  const theme = useTheme();
  const blocks = useMemo(() => parseBlocks(markdown), [markdown]);

  /** Indices covered by the Key Takeaways callout, so they are not also rendered inline.
   *  Detected from the heading text rather than new markdown syntax — that keeps the web
   *  renderer, which has no concept of a callout, rendering these posts correctly too. */
  const takeaways = useMemo(() => {
    const h = blocks.findIndex((b) => b.kind === 'h2' && /^key takeaways$/i.test(b.text));
    if (h === -1) return null;
    const list = blocks[h + 1];
    if (list?.kind !== 'bullet') return null;
    return { headingIndex: h, listIndex: h + 1, items: list.items };
  }, [blocks]);

  return (
    <View>
      {blocks.map((b, i) => {
        if (takeaways && i === takeaways.headingIndex) {
          return (
            <View
              key={i}
              style={[styles.takeaways, { borderColor: theme.primary + '3D', backgroundColor: theme.primary + '12' }]}>
              <ThemedText type="label" style={{ color: theme.iconLilac }}>
                Key takeaways
              </ThemedText>
              <View style={{ marginTop: Spacing.two, gap: Spacing.one }}>
                {takeaways.items.map((it, j) => (
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
        if (takeaways && i === takeaways.listIndex) return null;

        switch (b.kind) {
          case 'h2':
            return (
              <ThemedText key={i} type="heading" style={styles.h2}>
                {b.text}
              </ThemedText>
            );
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
            const xml = heroSvg(b.hero);
            if (!xml) return null;
            return (
              <View key={i} style={[styles.figure, { backgroundColor: theme.primary + '12' }]}>
                <SvgXml xml={xml} width="100%" height={196} />
              </View>
            );
          }
          default:
            return <Rich key={i} text={b.text} />;
        }
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  h2: { fontSize: 21, lineHeight: 27, marginTop: Spacing.four, marginBottom: Spacing.one },
  // prose measures: 18/30 in a serif reads far better than 16/23 in the UI sans
  para: { fontFamily: Fonts.body, fontSize: 16.5, lineHeight: 26, marginTop: Spacing.three },
  paraTight: { marginTop: 0 },
  strong: { fontFamily: Fonts.semibold, fontSize: 16.5, lineHeight: 26 },
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
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 11 },
  figure: {
    height: 224,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.three,
  },
});
