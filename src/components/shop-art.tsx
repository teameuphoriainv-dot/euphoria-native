/**
 * Shop item art — flat-geometric SVG in the Euphoria style.
 *
 * RULE ZERO. Ported from `euphoriaweb:src/features/shop/shopArt.tsx`, which states the constraint
 * this inherits: "All original art, no external or third-party assets, so the shop looks like a
 * real game store with zero license risk. Keyed by item id with a per-itemType fallback."
 *
 * The web pairs these with its 16x16 pixel sprites. Those port too — `compile.ts` emits plain
 * rects and react-native-svg has <Rect> — but that is its own piece of work
 * (refs/webapp/PIXEL-ART-SYSTEM.md). Until it lands, these geometric marks carry the shop, drawn to
 * the same ink outline and accent family so the two will sit together when the sprites arrive.
 */
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

const INK = '#1A1523';
const S = 3;

const Wrap = ({ size, children }: { size: number; children: React.ReactNode }) => (
  <Svg viewBox="0 0 100 100" width={size} height={size}>{children}</Svg>
);

/** Keyed by itemType, which is the fallback the web uses when an id has no bespoke mark. */
const ART: Record<string, (size: number) => React.ReactElement> = {
  double_xp: (size) => (
    <Wrap size={size}>
      <Path d="M52 8 L26 54 H46 L40 92 L74 40 H52 Z" fill="#F0A72B" stroke={INK} strokeWidth={S} strokeLinejoin="round" />
    </Wrap>
  ),
  streak_freeze: (size) => (
    <Wrap size={size}>
      <G stroke="#2DD4BF" strokeWidth={6} strokeLinecap="round">
        <Line x1={50} y1={18} x2={50} y2={82} />
        <Line x1={24} y1={33} x2={76} y2={67} />
        <Line x1={24} y1={67} x2={76} y2={33} />
      </G>
      <Circle cx={50} cy={50} r={8} fill="#A5F3EB" stroke={INK} strokeWidth={S} />
    </Wrap>
  ),
  heart_refill: (size) => (
    <Wrap size={size}>
      <Path d="M50 82 C18 60 24 30 44 30 C50 30 50 38 50 38 C50 38 50 30 56 30 C76 30 82 60 50 82 Z" fill="#F472B6" stroke={INK} strokeWidth={S} strokeLinejoin="round" />
      <G stroke="#fff" strokeWidth={5} strokeLinecap="round">
        <Line x1={50} y1={48} x2={50} y2={62} /><Line x1={43} y1={55} x2={57} y2={55} />
      </G>
    </Wrap>
  ),
  hint: (size) => (
    <Wrap size={size}>
      <Path d="M50 16 C34 16 24 28 24 42 C24 54 34 58 36 68 H64 C66 58 76 54 76 42 C76 28 66 16 50 16 Z" fill="#F0A72B" stroke={INK} strokeWidth={S} strokeLinejoin="round" />
      <G stroke={INK} strokeWidth={S} strokeLinecap="round">
        <Line x1={38} y1={76} x2={62} y2={76} /><Line x1={42} y1={85} x2={58} y2={85} />
      </G>
    </Wrap>
  ),
  avatar_item: (size) => (
    <Wrap size={size}>
      <Path d="M20 68 L28 30 L42 48 L50 24 L58 48 L72 30 L80 68 Z" fill="#F0A72B" stroke={INK} strokeWidth={S} strokeLinejoin="round" />
      <Rect x={20} y={68} width={60} height={12} rx={3} fill="#D98B1F" stroke={INK} strokeWidth={S} />
    </Wrap>
  ),
  profile_theme: (size) => (
    <Wrap size={size}>
      <Circle cx={50} cy={50} r={30} fill="#A855EB" stroke={INK} strokeWidth={S} />
      <Path d="M50 20 A30 30 0 0 1 50 80 Z" fill="#F472B6" stroke={INK} strokeWidth={S} />
    </Wrap>
  ),
  profile_frame: (size) => (
    <Wrap size={size}>
      <Rect x={20} y={20} width={60} height={60} rx={10} fill="none" stroke="#F0A72B" strokeWidth={9} />
      <Rect x={20} y={20} width={60} height={60} rx={10} fill="none" stroke={INK} strokeWidth={S} />
    </Wrap>
  ),
  profile_badge: (size) => (
    <Wrap size={size}>
      <Path d="M50 16 L62 40 L88 44 L69 62 L74 88 L50 76 L26 88 L31 62 L12 44 L38 40 Z" fill="#F0A72B" stroke={INK} strokeWidth={S} strokeLinejoin="round" />
    </Wrap>
  ),
};

export function ShopArt({ itemType, size = 56 }: { itemType: string; size?: number }) {
  const draw = ART[itemType] ?? ART.profile_badge;
  return draw(size);
}
