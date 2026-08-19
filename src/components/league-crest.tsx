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
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  ClipPath,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
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

/** Blend two hex colours. `t` is how far from `a` toward `b`. */
function mix(a: string, b: string, t: number): string {
  const pa = parseInt(a.replace('#', ''), 16);
  const pb = parseInt(b.replace('#', ''), 16);
  const ch = (sh: number) => Math.round((((pa >> sh) & 0xff) * (1 - t)) + (((pb >> sh) & 0xff) * t));
  const to2 = (v: number) => v.toString(16).padStart(2, '0');
  return `#${to2(ch(16))}${to2(ch(8))}${to2(ch(0))}`;
}

/**
 * Below this an emblem is finer than the pixels available and reads as a smudge on the face.
 * Deliberately LOWER than PIP_MIN_SIZE: at small sizes the emblem is the more useful of the two,
 * because a shape identifies a tier at a glance where counting pips does not.
 */
const EMBLEM_MIN_SIZE = 34;

/**
 * ONE EMBLEM PER TIER — the thing the crest was missing.
 *
 * The shield already had tone, a rim, a specular sliver and pips, and it still read as plain,
 * because none of that is IDENTITY: at tier 1 the whole badge was a brown shape with a single
 * white dot. Counted in pixels, Duolingo's league badges and Elevate's achievement badges
 * (`111769`) both carry a distinct figure per rank — 2/2 — and colour alone is never asked to
 * carry the rank.
 *
 * Each mark is geometric and reads at 24pt as well as at 104pt, which is why none of them is an
 * illustration. They are drawn twice: a near-black copy pushed 1.5 down at low opacity, then the
 * light copy over it. That is an ENGRAVING, and it is what stops a white shape sitting on metal
 * looking like a sticker.
 */
function Emblem({ name, light, size }: { name: string; light: string; size: number }) {
  if (size < EMBLEM_MIN_SIZE) return null;

  /*
   * The mark is a FUNCTION OF COLOUR, not a node recoloured afterwards. An earlier pass wrapped
   * the finished node in `<G stroke="#000">` to make the shadow copy — which silently does
   * nothing, because every child here sets `stroke` explicitly and a child's own attribute beats
   * the group's. Building twice is the only version that actually renders two colours.
   */
  const build = (c: string) => {
    const stroke = { stroke: c, strokeWidth: 3.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
    switch (name) {
      // Saver — coins seen edge on. The most literal mark in the set on purpose: tier 1 is where
      // the metaphor has to be legible without having learned the ladder yet.
      case 'Saver':
        return (
          <G>
            <Ellipse cx={50} cy={35} rx={13} ry={4.6} {...stroke} />
            <Ellipse cx={50} cy={44} rx={13} ry={4.6} {...stroke} />
            <Ellipse cx={50} cy={53} rx={13} ry={4.6} {...stroke} />
          </G>
        );
      // Investor — a position that went up. Not a generic arrow: the elbow is the point.
      case 'Investor':
        return (
          <G>
            <Path d="M34 56 L44 46 L52 52 L66 33" {...stroke} />
            <Path d="M57 33 L66 33 L66 42" {...stroke} />
          </G>
        );
      // Analyst — reading the distribution, so: bars of unequal height on a baseline.
      case 'Analyst':
        return (
          <G>
            <Path d="M35 57 L65 57" {...stroke} />
            <Path d="M41 57 L41 46" {...stroke} />
            <Path d="M50 57 L50 36" {...stroke} />
            <Path d="M59 57 L59 42" {...stroke} />
          </G>
        );
      // Strategist — the board, with one square committed to.
      case 'Strategist':
        return (
          <G>
            <Rect x={35} y={30} width={13} height={13} rx={2.5} {...stroke} />
            <Rect x={52} y={30} width={13} height={13} rx={2.5} fill={c} stroke={c} strokeWidth={3.2} />
            <Rect x={35} y={47} width={13} height={13} rx={2.5} {...stroke} />
            <Rect x={52} y={47} width={13} height={13} rx={2.5} {...stroke} />
          </G>
        );
      // Portfolio Manager — an allocation: the whole, and the slice you chose.
      case 'Portfolio Manager':
        return (
          <G>
            <Circle cx={50} cy={44} r={14} {...stroke} />
            <Path d="M50 44 L50 30" {...stroke} />
            <Path d="M50 44 L62 51" {...stroke} />
          </G>
        );
      // Partner — two parties, genuinely interlocked rather than merely adjacent.
      case 'Partner':
        return (
          <G>
            <Circle cx={43} cy={44} r={11} {...stroke} />
            <Circle cx={57} cy={44} r={11} {...stroke} />
          </G>
        );
      // Magnate — the summit. The only figurative mark, and it earns it by being last.
      case 'Magnate':
        return (
          <G>
            <Path d="M34 55 L34 33 L42 42 L50 30 L58 42 L66 33 L66 55 Z" {...stroke} />
            <Path d="M34 55 L66 55" {...stroke} />
          </G>
        );
      default:
        return null;
      }
  };

  if (!build(light)) return null;

  return (
    <G>
      <G opacity={0.38} transform="translate(0, 1.5)">{build('#000')}</G>
      {build(light)}
    </G>
  );
}

/**
 * ORNAMENT — what makes the ladder a ladder instead of a palette swap.
 *
 * NO STRONG MATCH IN SCREENSDESIGN, stated rather than faked: `app_name: "Clash"` returns 0 rows
 * and the Games category has no ranked-badge coverage, so per AGENTS.md rule 7 this is specced
 * from the named reference and the token system, labelled as such — not bent out of an off-topic
 * education-app pull.
 *
 * The mechanic being copied is the one Clash Royale's arenas actually use, and it is NOT colour:
 * **the badge gains STRUCTURE as you climb.** Seven identical shields in seven hues read as one
 * asset recoloured, which is exactly what the ladder looked like. So each rank keeps everything
 * the ranks below it earned and adds one more piece of hardware:
 *
 *   2 Investor   + shoulder flanges
 *   3 Analyst    + laurel leaves at the base
 *   4 Strategist + a banner ribbon
 *   5 Portfolio  + wings
 *   6 Partner    + a faceted gem at the crown of the shield
 *   7 Magnate    + a sunburst behind the whole crest
 *
 * Rays are behind the shield and the banner is in front, which is the only ordering that reads as
 * assembled hardware rather than as stickers on a card.
 */
function OrnamentBack({ rank, lit, dark, dim }: { rank: number; lit: string; dark: string; dim: number }) {
  // Rim every ornament, for the same reason the shield is rimmed: against near-black an
  // unstroked shape has no edge and dissolves into the card.
  const rim = { stroke: dark, strokeWidth: 1.4 };
  return (
    <G opacity={dim}>
      {/* 6 — sunburst. Behind everything, so the crest sits IN light rather than next to it. */}
      {rank >= 6 && (
        <G>
          {/* A DISC first, then rays. Twelve 8-unit-wide triangles read as a spiked collar --
              measured against the shipped gallery, Magnate looked hostile rather than earned.
              Eight broader rays over a soft disc read as radiance because the eye gets a
              continuous edge to anchor on before it resolves the spokes. */}
          <Circle cx={50} cy={56} r={58} fill={lit} opacity={0.10} />
          {Array.from({ length: 8 }).map((_, i) => (
            <Path
              key={i}
              d="M50 -20 L61 24 L50 32 L39 24 Z"
              fill={lit}
              opacity={0.42}
              transform={`rotate(${i * 45} 50 56)`}
            />
          ))}
        </G>
      )}
      {/* 4 — wings. RETIRED at rank 6: the sunburst is also radial mass behind the shield,
          and two radial layers cannot both be read. Magnate trades wings for radiance. */}
      {rank >= 4 && rank < 6 && (
        <G>
          {/* Three feathers a side, each rooted ON the shield edge and sweeping UP.
              The previous two swept sideways and level, which at ladder size read as a pair of
              spikes rather than a wing -- a wing is recognised by its upward arc, not by having
              two shapes. Each is wider than it is long for the same reason. */}
          <Path d="M14 30 Q-16 20 -19 34 Q-3 34 12 42 Z" fill={lit} {...rim} />
          <Path d="M13 41 Q-14 36 -15 50 Q0 47 13 53 Z" fill={lit} opacity={0.9} {...rim} />
          <Path d="M13 52 Q-9 51 -8 63 Q3 57 14 62 Z" fill={lit} opacity={0.78} {...rim} />
          <Path d="M86 30 Q116 20 119 34 Q103 34 88 42 Z" fill={lit} {...rim} />
          <Path d="M87 41 Q114 36 115 50 Q100 47 87 53 Z" fill={lit} opacity={0.9} {...rim} />
          <Path d="M87 52 Q109 51 108 63 Q97 57 86 62 Z" fill={lit} opacity={0.78} {...rim} />
        </G>
      )}
      {/* 2 — laurels. RETIRED at rank 5+: they sit in the same base-of-shield zone the
          wings sweep through, and carrying both is what made Partner and Magnate read as one
          undifferentiated mass rather than as the top of a ladder. */}
      {rank >= 2 && rank < 5 && (
        <G>
          {/* Sprigs with SEPARATED leaves. One filled blob per side has no internal edge, so at
              44pt it read as a smudge under the shield rather than as laurel. Three leaves and a
              stem give it structure that survives the shrink. */}
          <Path d="M26 96 Q9 86 12 63" fill="none" stroke={lit} strokeWidth={3} strokeLinecap="round" />
          <Path d="M13 68 Q4 70 6 79 Q14 77 15 70 Z" fill={lit} {...rim} />
          <Path d="M17 79 Q7 82 10 91 Q18 88 19 81 Z" fill={lit} {...rim} />
          <Path d="M22 89 Q14 93 18 100 Q25 96 25 91 Z" fill={lit} {...rim} />
          <Path d="M74 96 Q91 86 88 63" fill="none" stroke={lit} strokeWidth={3} strokeLinecap="round" />
          <Path d="M87 68 Q96 70 94 79 Q86 77 85 70 Z" fill={lit} {...rim} />
          <Path d="M83 79 Q93 82 90 91 Q82 88 81 81 Z" fill={lit} {...rim} />
          <Path d="M78 89 Q86 93 82 100 Q75 96 75 91 Z" fill={lit} {...rim} />
        </G>
      )}
      {/* 1 — shoulder flanges. Every crest gets these, so no tier is ever a bare plate. */}
      {rank >= 1 && (
        <G>
          {/* Deeper and notched. At the shipped 44pt these were ~3pt slivers, so Investor was
              indistinguishable from Saver in the gallery -- the first rung of the ladder read as
              no rung at all. The notch gives a silhouette that survives being shrunk. */}
          <Path d="M7 18 L-11 26 L-11 44 L7 37 Z" fill={lit} {...rim} />
          <Path d="M-11 33 L1 30 L1 38 L-11 40 Z" fill={dark} opacity={0.55} />
          <Path d="M93 18 L111 26 L111 44 L93 37 Z" fill={lit} {...rim} />
          <Path d="M111 33 L99 30 L99 38 L111 40 Z" fill={dark} opacity={0.55} />
        </G>
      )}
    </G>
  );
}

function OrnamentFront({ rank, lit, dark, dim }: { rank: number; lit: string; dark: string; dim: number }) {
  return (
    <G opacity={dim}>
      {/* 3 — banner. Crosses the shield's point, which is what a ribbon on a crest does. */}
      {rank >= 3 && (
        <G>
          <Path d="M2 88 L98 88 L98 105 L80 98 L50 108 L20 98 L2 105 Z" fill={lit} stroke={dark} strokeWidth={1.4} />
          <Path d="M2 88 L98 88 L98 92 L2 92 Z" fill={lit} opacity={0.55} />
        </G>
      )}
      {/* 5 — the gem, at the shield's crown. Two facets so it is a stone and not a diamond icon. */}
      {rank >= 5 && (
        <G>
          <Path d="M50 2 L60 12 L50 24 L40 12 Z" fill={lit} />
          <Path d="M50 2 L60 12 L50 12 Z" fill="#fff" opacity={0.55} />
          <Path d="M40 12 L50 12 L50 24 Z" fill="#000" opacity={0.25} />
        </G>
      )}
    </G>
  );
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
  /*
   * MOTION, AND WHY IT IS ON A VIEW RATHER THAN ON THE SVG.
   *
   * The first version animated the sheen's `x` with `useAnimatedProps` on
   * `Animated.createAnimatedComponent(Rect)`. It type-checked, it lint-passed, and it did
   * NOTHING: six screenshots of the crest differed by **0 pixels**, while the Learn screen —
   * where PulseHalo lives — differed by 1.12M over four. So Reanimated runs and reduced-motion is
   * off; `animatedProps` simply does not drive react-native-svg's geometry props in this setup.
   * A green typecheck said nothing about whether it moved, which is why it was measured.
   *
   * Both animations therefore run through `useAnimatedStyle` on an `Animated.View`, the idiom
   * already proven in this app:
   *   float — a slow bob, so the crest sits in space instead of being printed on the card
   *   glint — a shield-clipped diagonal band fading in and out on a long cycle
   *
   * The glint is PERIODIC, not a loop: ~1.2s lit, then a 3.4s rest, so the eye catches it
   * occasionally rather than being pulled back to the same corner forever. Both are suppressed for
   * `locked` (an unearned tier must not look lit) and for reduced motion, the same accessibility
   * contract PulseHalo honours.
   */
  const bob = useSharedValue(0);
  const glint = useSharedValue(0);
  const reduced = useReducedMotion();
  const still = reduced || locked;

  useEffect(() => {
    if (still) return;
    bob.set(
      withRepeat(withTiming(1, { duration: 1900, easing: Easing.inOut(Easing.ease) }), -1, true),
    );
    glint.set(
      withRepeat(
        withSequence(
          withTiming(1, { duration: 620, easing: Easing.out(Easing.ease) }),
          withTiming(0, { duration: 620, easing: Easing.in(Easing.ease) }),
          withDelay(3400, withTiming(0, { duration: 0 })),
        ),
        -1,
        false,
      ),
    );
  }, [still, bob, glint]);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -3 * bob.get() }],
  }));
  const glintStyle = useAnimatedStyle(() => ({ opacity: glint.get() }));

  // Locked tiers are muted toward the dark card surface but KEEP THEIR HUE, so the ladder reads
  // as six colours you are climbing toward rather than one grey shape repeated six times. Mixing
  // to a flat neutral threw away colour that TIERS already carries.
  const base = locked ? mix(tier.color, '#15121C', 0.72) : tier.color;
  // NARROW tonal range. This ran +0.42 to -0.40, which desaturated bronze into tan-to-mud at the
  // extremes: a wide value spread reads as brown, a tight one reads as metal.
  const lit = shade(base, locked ? 0.12 : 0.3);
  const dark = shade(base, locked ? -0.12 : -0.22);
  const id = `${tier.name.replace(/\s/g, '')}${locked ? 'L' : ''}`;
  // pip count rises with rank; league.ts owns the order
  const pips = Math.max(1, TIERS.findIndex((t) => t.name === tier.name) + 1);

  return (
    // Fixed box so wrapping the Svg cannot change any caller's layout — the crest sits in a hero,
    // a ladder row and a friends row, and a shrink-to-content wrapper would move all three.
    <Animated.View style={[{ width: size, height: size * 1.12 }, floatStyle]}>
    <Svg width={size} height={size * 1.12} viewBox="-20 -18 140 157">
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
          <Stop offset="0" stopColor={lit} stopOpacity={locked ? 0.12 : 0.55} />
          <Stop offset="0.55" stopColor={base} stopOpacity={locked ? 0.06 : 0.22} />
          <Stop offset="1" stopColor={base} stopOpacity="0" />
        </RadialGradient>
      </Defs>

      <Circle cx={50} cy={52} r={66} fill={`url(#glow${id})`} />
      <OrnamentBack rank={pips} lit={lit} dark={dark} dim={locked ? 0.7 : 1} />

      {/* cast shadow, offset down: grounds the crest instead of letting it float */}
      <Path d={SHIELD} fill="#000" opacity={0.28} transform="translate(0, 5)" />
      <Path d={SHIELD} fill={`url(#body${id})`} />
      <Path d={FACE} fill={`url(#face${id})`} />
      {/* Against near-black an unstroked shape has no edge and reads as a flat blob. */}
      <Path d={SHIELD} fill="none" stroke={lit} strokeWidth={1.6} opacity={locked ? 0.28 : 0.75} />
      {/* specular sliver along the lit shoulder */}
      <Path d="M50 8 L86 21 L86 30 Q68 17 50 14 Z" fill="#fff" opacity={locked ? 0.05 : 0.2} />

      {/* The tier's own mark. Drawn on the FACE, above the pip band. Locked crests keep the mark
          but at the drained tone — the goal should be identifiable, just not lit. */}
      <Emblem
        name={tier.name}
        light={locked ? shade(base, 0.34) : '#fff'}
        size={size}
      />

      {size >= PIP_MIN_SIZE && (
        <G>
          <Path d="M26 70 Q50 76 74 70 L74 86 Q50 92 26 86 Z" fill="#000" opacity={0.18} />
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

      <OrnamentFront rank={pips} lit={lit} dark={dark} dim={locked ? 0.7 : 1} />

    </Svg>

    {/* The glint, as its own overlay so the thing being animated is a VIEW. It sits above the
        emblem and pips deliberately — light that skipped them would read as a band sliding under
        glass rather than across a surface. */}
    {!still && (
      <Animated.View style={[StyleSheet.absoluteFill, glintStyle]} pointerEvents="none">
        <Svg width={size} height={size * 1.12} viewBox="-20 -18 140 157">
          <Defs>
            <ClipPath id={`gclip${id}`}>
              <Path d={SHIELD} />
            </ClipPath>
            <LinearGradient id={`gsheen${id}`} x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#fff" stopOpacity="0" />
              <Stop offset="0.5" stopColor="#fff" stopOpacity="0.62" />
              <Stop offset="1" stopColor="#fff" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <G clipPath={`url(#gclip${id})`}>
            <Rect x={22} y={-24} width={30} height={160} fill={`url(#gsheen${id})`} transform="rotate(18 50 56)" />
          </G>
        </Svg>
      </Animated.View>
    )}
    </Animated.View>
  );
}
