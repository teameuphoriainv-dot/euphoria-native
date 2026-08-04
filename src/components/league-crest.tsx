/**
 * LeagueCrest — the tier badge, drawn semi-3D.
 *
 * NOT a flat shield, and not an icon-registry glyph. Two reasons:
 *
 *  1. `UIconName` is a closed union, so a per-tier coloured badge cannot live there without
 *     widening the type, and the registry has no size range this needs.
 *  2. refs/BRILLIANT_VISUAL_ANALYSIS.md:7-8 names flat-vs-illustrated as THE gap against the
 *     reference: "Brilliant is COLORFUL + ILLUSTRATED, ours was flat/minimal". A flat shield is
 *     precisely the failure that document describes.
 *
 * So it uses the treatment the Digest figures already ship in this product: a lit top-left face,
 * a shadowed bottom-right face, a cast shadow, and a soft radial glow, in three tones derived
 * from the tier's own colour. That keeps it native to the app rather than imported-looking.
 *
 * Pips encode tier index as well as colour, so tiers stay separable in greyscale and for
 * colour-blind users. They are hidden below `PIP_MIN_SIZE` where they would be sub-pixel mush;
 * in the ladder strip, order already conveys rank, so nothing is lost there.
 */
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from 'react-native-svg';

import { TIERS, type Tier } from '@/lib/league';

/** Below this the pips stop being readable and just add noise. */
const PIP_MIN_SIZE = 56;

/** Shield outline in a 100x112 space. Rounded shoulders tapering to a point. */
const SHIELD = 'M50 3 L93 19 L93 57 Q93 89 50 109 Q7 89 7 57 L7 19 Z';
/** Inset face, so the crest reads as having a rim rather than being a single flat plate. */
const FACE = 'M50 14 L83 26 L83 56 Q83 80 50 96 Q17 80 17 56 L17 26 Z';

/** Mix a hex colour toward white (t > 0) or black (t < 0). Kept local: this is the only place in
 *  the app that needs tone derivation, and a shared util for one caller is premature. */
function shade(hex: string, t: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  const target = t > 0 ? 255 : 0;
  const k = Math.abs(t);
  const ch = (shift: number) => {
    const v = (n >> shift) & 0xff;
    return Math.round(v + (target - v) * k);
  };
  const to2 = (v: number) => v.toString(16).padStart(2, '0');
  return `#${to2(ch(16))}${to2(ch(8))}${to2(ch(0))}`;
}

export function LeagueCrest({
  tier,
  size = 96,
  locked = false,
}: {
  tier: Tier;
  size?: number;
  /** Tiers not yet reached: drained of colour so the ladder reads as a goal, not a decoration. */
  locked?: boolean;
}) {
  const base = locked ? '#3A3546' : tier.color;
  const lit = shade(base, locked ? 0.1 : 0.42);
  const dark = shade(base, -0.4);
  const id = `${tier.name.replace(/\s/g, '')}${locked ? 'L' : ''}`;
  // pip count rises with rank; league.ts owns the order
  const pips = Math.max(1, TIERS.findIndex((t) => t.name === tier.name) + 1);

  return (
    <Svg width={size} height={size * 1.12} viewBox="0 0 100 112">
      <Defs>
        {/* key light from the top left, the same direction every other figure in the app uses */}
        <LinearGradient id={`body${id}`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={lit} />
          <Stop offset="1" stopColor={dark} />
        </LinearGradient>
        <LinearGradient id={`face${id}`} x1="0.1" y1="0" x2="0.9" y2="1">
          <Stop offset="0" stopColor={shade(base, locked ? 0.02 : 0.22)} />
          <Stop offset="1" stopColor={shade(base, -0.18)} />
        </LinearGradient>
        <RadialGradient id={`glow${id}`} cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor={base} stopOpacity={locked ? 0 : 0.42} />
          <Stop offset="1" stopColor={base} stopOpacity="0" />
        </RadialGradient>
      </Defs>

      <Circle cx={50} cy={54} r={49} fill={`url(#glow${id})`} />
      {/* cast shadow, offset down: grounds the crest instead of letting it float */}
      <Path d={SHIELD} fill="#000" opacity={0.28} transform="translate(0, 5)" />
      <Path d={SHIELD} fill={`url(#body${id})`} />
      <Path d={FACE} fill={`url(#face${id})`} />
      {/* specular sliver along the lit shoulder */}
      <Path d="M50 8 L86 21 L86 30 Q68 17 50 14 Z" fill="#fff" opacity={locked ? 0.05 : 0.2} />

      {size >= PIP_MIN_SIZE && (
        <G>
          {Array.from({ length: pips }).map((_, i) => (
            <Circle
              key={i}
              cx={50 + (i - (pips - 1) / 2) * 11}
              cy={78}
              r={3.4}
              fill={locked ? shade(base, 0.2) : '#fff'}
              opacity={locked ? 0.5 : 0.92}
            />
          ))}
        </G>
      )}
    </Svg>
  );
}
