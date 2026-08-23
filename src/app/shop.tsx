/**
 * EUPHORIUM SHOP (N21) — "Add an in-app currency for completing achievements... maybe add a
 * currency system like the web app has."
 *
 * RULE ZERO: built from the web Shop screen, walked 2026-08-23, not from a description of it.
 * What was copied, and what was checked rather than assumed:
 *   - header, subtitle and the "How to earn Euphorium" panel: the web's own copy and rates.
 *   - three tabs in the web's order with the web's labels.
 *   - a two-column card grid: tinted art panel with a RARITY TAG top-right, then name,
 *     description, then a price row.
 *   - the second number on each card is `item.price - coins` — HOW MANY MORE YOU NEED. It reads
 *     like a discounted Pro tier behind that padlock, and it is not. Confirmed in CoinShop.tsx:224
 *     rather than inferred from the pixels, which would have invented a pricing tier that does not
 *     exist.
 */
import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/ambient-background';
import { ShopArt } from '@/components/shop-art';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { Card } from '@/components/ui/card';
import { BottomTabInset, FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { PixelSpriteView, coin as coinSprite } from '@/lib/pixel';
import { EARN, SHOP_CATEGORIES, SHOP_ITEMS, type Rarity, type ShopCategory } from '@/lib/shop-items';
import { useApp } from '@/lib/store';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import { STAGGER_CAP } from '@/shared/motion/tokens';

/** Rarity colours read off the web's own tags: common grey, uncommon green, rare blue, then up. */
const RARITY: Record<Rarity, string> = {
  common: '#8B8494',
  uncommon: '#34D399',
  rare: '#5FA8FF',
  epic: '#C084FC',
  legendary: '#F0A72B',
};

export default function Shop() {
  const theme = useTheme();
  const router = useRouter();
  const coins = useApp((s) => s.coins);
  const inventory = useApp((s) => s.inventory);
  const equipped = useApp((s) => s.equipped);
  const buyItem = useApp((s) => s.buyItem);
  const equipItem = useApp((s) => s.equipItem);
  const [tab, setTab] = useState<ShopCategory>('power-up');

  const items = useMemo(() => SHOP_ITEMS.filter((i) => i.category === tab), [tab]);

  const EARN_TILES = [
    { label: 'Complete lessons', value: `+${String(EARN.lessonMin)}–${String(EARN.lessonMax)}` },
    { label: 'Daily streaks', value: `+${String(EARN.dailyStreak)}` },
    { label: 'Win games', value: `+${String(EARN.gameWinMin)}–${String(EARN.gameWinMax)}` },
    { label: 'Daily challenges', value: `+${String(EARN.dailyChallenge)}` },
  ];

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AmbientBackground starCount={26} />
      <View style={styles.header}>
        <SpringPressable haptic={false} scaleTo={0.85} onPress={() => router.back()} hitSlop={10} accessibilityRole="button" accessibilityLabel="Back">
          <UIcon name="chevronLeft" size={22} color={theme.mutedForeground} />
        </SpringPressable>
        <View style={{ flex: 1 }}>
          <ThemedText type="title" style={{ fontSize: FontSize.titleSm }}>Euphorium Shop</ThemedText>
          <ThemedText type="small" themeColor="mutedForeground">Spend your coins on boosts and looks</ThemedText>
        </View>
        <View style={[styles.balance, { borderColor: theme.iconGold + '55', backgroundColor: theme.iconGold + '18' }]}>
          <PixelSpriteView sprite={coinSprite} size={15} />
          <ThemedText type="smallBold" style={[NUM, { color: theme.iconGold }]}>{coins}</ThemedText>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <RiseIn>
          <Card style={styles.earn}>
            <ThemedText type="label" themeColor="mutedForeground">HOW TO EARN EUPHORIUM</ThemedText>
            <View style={styles.earnGrid}>
              {EARN_TILES.map((t) => (
                <View key={t.label} style={[styles.earnTile, { borderColor: theme.border }]}>
                  <ThemedText type="smallBold" style={[NUM, { color: theme.iconGold }]}>{t.value}</ThemedText>
                  <ThemedText type="small" themeColor="mutedForeground" style={styles.earnLabel} numberOfLines={2}>{t.label}</ThemedText>
                </View>
              ))}
            </View>
          </Card>
        </RiseIn>

        {/*
          * SAID OUT LOUD, not hidden. The web wallet lives behind an account in Supabase; iOS has no
          * accounts, so this balance cannot follow anyone between the two. Owner's condition when he
          * approved shipping it local — the same standard as the practice-profiles note on Friends.
          */}
        <ThemedText type="small" themeColor="mutedForeground" style={styles.localNote}>
          Your balance lives on this device until accounts arrive. It does not follow you to the web app yet.
        </ThemedText>

        <View style={styles.tabs}>
          {SHOP_CATEGORIES.map((c) => {
            const active = tab === c.id;
            return (
              <SpringPressable key={c.id} scaleTo={0.95} onPress={() => setTab(c.id)} accessibilityRole="button" accessibilityLabel={c.label}>
                <View style={[styles.tab, { borderColor: active ? theme.primary : theme.border, backgroundColor: active ? theme.primary + '1F' : 'transparent' }]}>
                  <ThemedText type="smallBold" style={{ color: active ? theme.iconLilac : theme.mutedForeground }}>{c.label}</ThemedText>
                </View>
              </SpringPressable>
            );
          })}
        </View>

        <View key={tab} style={styles.grid}>
          {items.map((item, i) => {
            const owned = inventory.includes(item.id);
            const isEquipped = Object.values(equipped).includes(item.id);
            const short = item.price - coins;
            const cosmetic = item.category !== 'power-up';
            const tint = RARITY[item.rarity];
            return (
              <RiseIn key={item.id} delay={Math.min(i * 40, STAGGER_CAP)} style={styles.cell}>
                <SpringPressable
                  scaleTo={0.97}
                  onPress={() => {
                    if (cosmetic && owned) { equipItem(item.id); return; }
                    buyItem(item.id);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.name}, ${String(item.price)} Euphorium`}>
                  <Card padded={false} style={[styles.card, { borderColor: tint + '33' }]}>
                    <View style={[styles.art, { backgroundColor: tint + '12' }]}>
                      <ShopArt id={item.id} itemType={item.itemType} size={52} />
                      <View style={styles.rarity}>
                        <View style={[styles.dot, { backgroundColor: tint }]} />
                        <ThemedText type="small" style={{ fontSize: FontSize.tiny, color: tint }}>
                          {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}
                        </ThemedText>
                      </View>
                    </View>
                    <View style={styles.body}>
                      <ThemedText type="bodyMedium" numberOfLines={2}>{item.name}</ThemedText>
                      <ThemedText type="small" themeColor="mutedForeground" numberOfLines={3} style={{ marginTop: 2 }}>{item.description}</ThemedText>
                      <View style={styles.priceRow}>
                        <View style={styles.price}>
                          <PixelSpriteView sprite={coinSprite} size={14} />
                          <ThemedText type="smallBold" style={[NUM, { color: theme.iconGold }]}>{item.price}</ThemedText>
                        </View>
                        {isEquipped ? (
                          <ThemedText type="small" style={{ color: theme.success, fontSize: FontSize.tiny }}>Equipped</ThemedText>
                        ) : owned ? (
                          <ThemedText type="small" style={{ color: theme.iconLilac, fontSize: FontSize.tiny }}>Equip</ThemedText>
                        ) : short > 0 ? (
                          /* `price - coins`: how many MORE you need. Not a second price. */
                          <View style={[styles.needPill, { borderColor: theme.border }]}>
                            <UIcon name="lock" size={10} color={theme.mutedForeground} />
                            <ThemedText type="small" themeColor="mutedForeground" style={[NUM, { fontSize: FontSize.tiny }]}>{short}</ThemedText>
                          </View>
                        ) : null}
                      </View>
                    </View>
                  </Card>
                </SpringPressable>
              </RiseIn>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const NUM = { fontVariant: ['tabular-nums' as const] };

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingHorizontal: Spacing.three, paddingBottom: Spacing.two },
  balance: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, paddingHorizontal: Spacing.two + 2, paddingVertical: Spacing.one + 2, borderRadius: Radius.pill, borderWidth: StyleSheet.hairlineWidth },
  content: { padding: Spacing.three, paddingBottom: BottomTabInset + Spacing.four, gap: Spacing.three },
  earn: { gap: Spacing.two },
  earnGrid: { flexDirection: 'row', gap: Spacing.two },
  earnTile: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: Spacing.two, borderRadius: Radius.md, borderWidth: StyleSheet.hairlineWidth },
  earnLabel: { fontSize: FontSize.tiny, textAlign: 'center' },
  localNote: { marginTop: -Spacing.one },
  tabs: { flexDirection: 'row', gap: Spacing.two },
  tab: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: Radius.pill, borderWidth: StyleSheet.hairlineWidth },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  cell: { width: '48.5%' },
  card: { overflow: 'hidden' },
  art: { height: 92, alignItems: 'center', justifyContent: 'center' },
  rarity: { position: 'absolute', top: Spacing.two, right: Spacing.two, flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  body: { padding: Spacing.two + 2, gap: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.two },
  price: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  needPill: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: Spacing.two, paddingVertical: 3, borderRadius: Radius.pill, borderWidth: StyleSheet.hairlineWidth },
});
