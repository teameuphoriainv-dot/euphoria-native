/**
 * LessonArt — illustrated lesson-node art for the Learn path.
 *
 * Replaces EUPHORIA_ICONS on lesson nodes. Those were glyphs (3-4 flat shapes, some using
 * <text>, which RN-SVG renders with a fallback font). These are small SCENES, per
 * MASTER_PLAN §1.4: one concrete metaphor per topic, semi-isometric, single top-light,
 * soft colored contact shadow, 2-3 stop gradients.
 *
 * Every piece of art is a pure function of the course ACCENT colour, so the same lesson
 * reads differently across courses and the whole path stays chromatically coherent.
 * Art is chosen by matching the real lesson title against METAPHORS — a NARROW concept tier
 * first, then broader course-level nets. Unmatched titles hash to NEUTRAL.
 *
 * The narrow tier is not decoration: without it, matching happened at course granularity and
 * Behavioral Finance rendered the same `mind` icon on 24 of its 25 nodes, sixteen of them
 * consecutive. See the comment above METAPHORS for the measurements and the ordering rule.
 */
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { courseAccent } from '@/lib/course-accents';

/* ---------------------------------------------------------------- colour utils */

const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));

/** Shift a hex colour toward white (t>0) or black (t<0). t in [-1, 1]. */
export function shade(hex: string, t: number): string {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const mix = (c: number) => clamp(t >= 0 ? c + (255 - c) * t : c * (1 + t));
  return `#${[mix(r), mix(g), mix(b)].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

/** The palette every illustration draws from. Derived so art tints per course for free. */
export type ArtPalette = {
  /** brightest — top-lit faces and highlights */
  lite: string;
  /** the course accent itself — primary mass */
  base: string;
  /** shaded side / underside */
  dark: string;
  /** warm counterpoint, used sparingly for value/reward beats */
  gold: string;
  /** near-black ink for grounding strokes */
  ink: string;
};

function paletteFor(accent: string): ArtPalette {
  return {
    lite: shade(accent, 0.42),
    base: accent,
    dark: shade(accent, -0.34),
    gold: '#FBBF24',
    ink: '#241C33',
  };
}

/* ---------------------------------------------------------------- shared scene parts */

/** Soft contact shadow. The single cue that makes 2D art feel like it has weight. */
function Ground({ p, cx = 24, cy = 41, rx = 14 }: { p: ArtPalette; cx?: number; cy?: number; rx?: number }) {
  return (
    <>
      <Ellipse cx={cx} cy={cy} rx={rx} ry={rx * 0.24} fill={p.dark} opacity={0.38} />
      <Ellipse cx={cx} cy={cy} rx={rx * 0.6} ry={rx * 0.14} fill={p.dark} opacity={0.3} />
    </>
  );
}

/* ---------------------------------------------------------------- the art registry */

type Art = (p: ArtPalette) => React.ReactNode;

/**
 * Each entry is one concrete metaphor. Keep them to ~6-12 elements: enough to read as a
 * scene at 38px, few enough to stay crisp. No <text> — it renders with a fallback font.
 */
const ART: Record<string, Art> = {
  /* ──────────────────────────────────────────────────────────────────────────────────────
   * ADDED 2026-08-07 to break within-course repetition. Measured before: behavioralFinance
   * showed 'mind' on 24 of 25 nodes with a run of SIXTEEN consecutive identical icons;
   * appliedAccounting 'ledger' 19/25; businessStrategy 'chess' 20/25. The cause was that
   * METAPHORS matched at COURSE granularity, so every lesson in a course hit one broad
   * regex. These scenes exist so the narrow tier at the top of METAPHORS has somewhere to
   * point. Same language as the originals: semi-isometric, one top light, contact shadow.
   * ────────────────────────────────────────────────────────────────────────────────────── */

  /* Herd behaviour — a cluster following one leader. Reads as "everyone else went that way". */
  crowd: (p) => (
    <>
      <Ground p={p} cx={24} cy={40} rx={15} />
      <Circle cx={13} cy={26} r={3.4} fill={p.dark} opacity={0.55} />
      <Path d="M9 38c0-4 2-6 4-6s4 2 4 6Z" fill={p.dark} opacity={0.5} />
      <Circle cx={22} cy={24} r={3.8} fill={p.base} opacity={0.8} />
      <Path d="M17 38c0-5 2-7 5-7s5 2 5 7Z" fill={p.base} opacity={0.7} />
      <Circle cx={34} cy={21} r={4.6} fill="url(#laBall)" />
      <Path d="M28 38c0-6 3-9 6-9s6 3 6 9Z" fill={p.lite} opacity={0.9} />
      <Circle cx={32} cy={19} r={1.4} fill="#fff" opacity={0.5} />
    </>
  ),

  /* Anchoring — an actual anchor. Distinct from `pricetag`, which is about what a thing IS worth. */
  anchor: (p) => (
    <>
      <Ground p={p} cx={24} cy={41} rx={12} />
      <Circle cx={24} cy={9} r={4} fill="none" stroke={p.lite} strokeWidth={2.4} />
      <Path d="M24 13v22" stroke={p.base} strokeWidth={3} strokeLinecap="round" />
      <Path d="M16 19h16" stroke={p.base} strokeWidth={2.6} strokeLinecap="round" />
      <Path d="M11 28c0 8 6 11 13 11s13-3 13-11" fill="none" stroke="url(#laBall)" strokeWidth={3} strokeLinecap="round" />
      <Circle cx={11} cy={28} r={1.8} fill={p.dark} opacity={0.7} />
      <Circle cx={37} cy={28} r={1.8} fill={p.dark} opacity={0.7} />
    </>
  ),

  /* Framing — the same content inside a frame. The frame is the point, not the picture. */
  frame: (p) => (
    <>
      <Ground p={p} cx={24} cy={41} rx={13} />
      <Rect x={7} y={11} width={34} height={26} rx={3} fill="none" stroke={p.lite} strokeWidth={3} />
      <Rect x={12} y={16} width={24} height={16} rx={2} fill="url(#laBall)" opacity={0.55} />
      <Path d="M14 30l6-6 4 4 6-7 5 6" stroke={p.dark} strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.75} />
    </>
  ),

  /* Attention / media pull — a horseshoe magnet with filings drawn toward it. */
  magnet: (p) => (
    <>
      <Ground p={p} cx={24} cy={41} rx={12} />
      <Path d="M14 34V21a10 10 0 0 1 20 0v13" fill="none" stroke="url(#laBall)" strokeWidth={6} strokeLinecap="round" />
      <Path d="M14 34h6M28 34h6" stroke={p.dark} strokeWidth={5} strokeLinecap="round" opacity={0.8} />
      <Circle cx={40} cy={14} r={1.5} fill={p.lite} opacity={0.9} />
      <Circle cx={43} cy={20} r={1.2} fill={p.lite} opacity={0.7} />
      <Circle cx={7} cy={16} r={1.3} fill={p.lite} opacity={0.7} />
    </>
  ),

  /* Narrative fallacy — a speech bubble whose contents are a wandering line, not data. */
  story: (p) => (
    <>
      <Ground p={p} cx={24} cy={41} rx={12} />
      <Path d="M8 12h32a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H21l-7 6v-6H8a3 3 0 0 1-3-3V15a3 3 0 0 1 3-3Z" fill="url(#laBall)" opacity={0.85} />
      <Path d="M11 24c4-7 8 4 12-3s7 5 11-1" stroke={p.dark} strokeWidth={2.2} fill="none" strokeLinecap="round" opacity={0.8} />
    </>
  ),

  /* Receivables / payables — a document with an arrow leaving it. Distinct from `receipt` (tax). */
  invoice: (p) => (
    <>
      <Ground p={p} cx={22} cy={41} rx={12} />
      <Path d="M10 7h16l8 8v22a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" fill="url(#laBall)" />
      <Path d="M26 7v8h8" fill={p.dark} opacity={0.45} />
      <Path d="M15 22h12M15 28h8" stroke={p.dark} strokeWidth={2} strokeLinecap="round" opacity={0.7} />
      <Path d="M32 31l8 6-8 6" stroke={p.lite} strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),

  /* Inventory — three stacked crates, isometric. */
  boxes: (p) => (
    <>
      <Ground p={p} cx={24} cy={42} rx={14} />
      <Path d="M6 28l10-5 10 5-10 5Z" fill={p.lite} opacity={0.9} />
      <Path d="M6 28v8l10 5v-8Z" fill={p.base} opacity={0.8} />
      <Path d="M26 28v8l-10 5v-8Z" fill={p.dark} opacity={0.6} />
      <Path d="M24 18l9-4 9 4-9 4Z" fill={p.lite} opacity={0.75} />
      <Path d="M24 18v7l9 4v-7Z" fill={p.base} opacity={0.65} />
      <Path d="M42 18v7l-9 4v-7Z" fill={p.dark} opacity={0.5} />
    </>
  ),

  /* Depreciation — a solid mass stepping down. The stair descends, which is the whole idea. */
  decay: (p) => (
    <>
      <Ground p={p} cx={24} cy={42} rx={15} />
      <Rect x={7} y={14} width={9} height={24} rx={1.5} fill="url(#laBall)" />
      <Rect x={18} y={21} width={9} height={17} rx={1.5} fill={p.base} opacity={0.8} />
      <Rect x={29} y={28} width={9} height={10} rx={1.5} fill={p.dark} opacity={0.7} />
      <Path d="M11 9l0 0M9 8h30" stroke={p.lite} strokeWidth={0} />
      <Path d="M38 12l4 4-4 4" stroke={p.lite} strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />
      <Path d="M14 16h26" stroke={p.lite} strokeWidth={2} strokeLinecap="round" opacity={0.5} strokeDasharray="3 3" />
    </>
  ),

  /* Go-to-market / positioning — a flag planted on a mound. Claimed ground. */
  flag: (p) => (
    <>
      <Ground p={p} cx={24} cy={41} rx={14} />
      <Path d="M6 39c5-9 13-13 18-13s13 4 18 13Z" fill={p.dark} opacity={0.45} />
      <Path d="M20 39V9" stroke={p.base} strokeWidth={2.8} strokeLinecap="round" />
      <Path d="M20 10h17l-4 6 4 6H20Z" fill="url(#laBall)" />
      <Circle cx={20} cy={8} r={2} fill={p.lite} />
    </>
  ),

  /* Partnership / M&A — two interlocking links. One object made of two. */
  handshake: (p) => (
    <>
      <Ground p={p} cx={24} cy={41} rx={13} />
      <Path d="M20 17a8 8 0 0 0 0 14h4" fill="none" stroke="url(#laBall)" strokeWidth={5} strokeLinecap="round" />
      <Path d="M28 31a8 8 0 0 0 0-14h-4" fill="none" stroke={p.base} strokeWidth={5} strokeLinecap="round" opacity={0.85} />
      <Circle cx={24} cy={24} r={2.2} fill="#fff" opacity={0.55} />
    </>
  ),

  /* Customer acquisition — a funnel: many in, few out. */
  funnel: (p) => (
    <>
      <Ground p={p} cx={24} cy={42} rx={11} />
      <Path d="M7 10h34l-13 15v11l-8 4V25Z" fill="url(#laBall)" />
      <Circle cx={13} cy={6} r={1.7} fill={p.lite} opacity={0.85} />
      <Circle cx={24} cy={5} r={1.7} fill={p.lite} opacity={0.85} />
      <Circle cx={35} cy={6} r={1.7} fill={p.lite} opacity={0.85} />
      <Circle cx={24} cy={44} r={1.9} fill={p.dark} opacity={0.8} />
    </>
  ),

  /* Machine learning / NLP — nodes and edges. A network, not a chart. */
  network: (p) => (
    <>
      <Ground p={p} cx={24} cy={42} rx={13} />
      <Path d="M11 15L26 24 11 33M26 24l11-14M26 24l11 14" stroke={p.dark} strokeWidth={1.8} fill="none" opacity={0.65} />
      <Circle cx={11} cy={15} r={3.4} fill={p.base} opacity={0.85} />
      <Circle cx={11} cy={33} r={3.4} fill={p.base} opacity={0.85} />
      <Circle cx={26} cy={24} r={5} fill="url(#laBall)" />
      <Circle cx={37} cy={10} r={2.8} fill={p.lite} opacity={0.9} />
      <Circle cx={37} cy={38} r={2.8} fill={p.lite} opacity={0.9} />
    </>
  ),

  /* Dashboards — a panel of small readouts. Distinct from `magnifier` (investigation). */
  dashboard: (p) => (
    <>
      <Ground p={p} cx={24} cy={42} rx={15} />
      <Rect x={5} y={10} width={38} height={27} rx={3} fill="url(#laBall)" opacity={0.9} />
      <Rect x={9} y={14} width={13} height={9} rx={1.5} fill={p.dark} opacity={0.5} />
      <Path d="M10 21l3-3 3 2 4-4" stroke={p.lite} strokeWidth={1.6} fill="none" strokeLinecap="round" />
      <Rect x={26} y={14} width={13} height={9} rx={1.5} fill={p.dark} opacity={0.5} />
      <Rect x={9} y={27} width={5} height={6} rx={1} fill={p.dark} opacity={0.6} />
      <Rect x={17} y={25} width={5} height={8} rx={1} fill={p.dark} opacity={0.6} />
      <Rect x={25} y={28} width={5} height={5} rx={1} fill={p.dark} opacity={0.6} />
    </>
  ),

  /* Scaling — ascending blocks. `decay` descends; this climbs, and they must never be confused. */
  stairs: (p) => (
    <>
      <Ground p={p} cx={24} cy={42} rx={15} />
      <Rect x={7} y={29} width={9} height={9} rx={1.5} fill={p.dark} opacity={0.7} />
      <Rect x={18} y={22} width={9} height={16} rx={1.5} fill={p.base} opacity={0.85} />
      <Rect x={29} y={13} width={9} height={25} rx={1.5} fill="url(#laBall)" />
      <Path d="M35 9l4-4M39 5h-4M39 5v4" stroke={p.lite} strokeWidth={2} fill="none" strokeLinecap="round" />
    </>
  ),

  /* Compounding — a snowball gathering mass as it rolls DOWNHILL. Direction matters: the
     mass sits low-left with tracks receding up-slope, so it reads as accumulation. */
  snowball: (p) => (
    <>
      <Path d="M2 42 L44 10 L44 42 Z" fill={p.dark} opacity={0.3} />
      <Path d="M2 42 L44 10" stroke={p.dark} strokeWidth={1.6} opacity={0.55} strokeLinecap="round" />
      <Circle cx={38} cy={14} r={1.3} fill={p.dark} opacity={0.6} />
      <Circle cx={32} cy={18} r={2} fill={p.dark} opacity={0.65} />
      <Circle cx={26} cy={23} r={3} fill={p.base} opacity={0.8} />
      <Ground p={p} cx={15} cy={39} rx={11} />
      <Circle cx={15} cy={28} r={10.5} fill="url(#laBall)" />
      <Circle cx={11} cy={23.5} r={3.4} fill={p.lite} opacity={0.8} />
      <Circle cx={19.5} cy={32} r={1.7} fill={p.dark} opacity={0.4} />
      <Circle cx={17} cy={22} r={1.2} fill="#fff" opacity={0.5} />
    </>
  ),

  /* Stocks — isometric candlesticks, the one chart shape that reads instantly. */
  candles: (p) => (
    <>
      <Ground p={p} cx={24} cy={41} rx={16} />
      <G strokeLinecap="round">
        <Path d="M10 30 L10 38" stroke={p.dark} strokeWidth={1.8} />
        <Rect x={6.5} y={26} width={7} height={9} rx={1.8} fill={p.dark} />
        <Path d="M21 14 L21 20 M21 33 L21 38" stroke={p.base} strokeWidth={1.8} />
        <Rect x={17.5} y={19} width={7} height={15} rx={1.8} fill="url(#laBall)" />
        <Rect x={17.5} y={19} width={2.4} height={15} rx={1.2} fill={p.lite} opacity={0.5} />
        <Path d="M32 8 L32 15 M32 30 L32 36" stroke={p.gold} strokeWidth={1.8} />
        <Rect x={28.5} y={14} width={7} height={17} rx={1.8} fill={p.gold} />
        <Rect x={28.5} y={14} width={2.4} height={17} rx={1.2} fill="#FDE68A" opacity={0.7} />
      </G>
    </>
  ),

  /* Risk — a balance scale, mid-tilt so it reads as a live trade-off, not a static symbol. */
  scale: (p) => (
    <>
      <Ground p={p} cx={24} cy={41} rx={12} />
      <Path d="M24 12 L24 37" stroke={p.dark} strokeWidth={2.6} strokeLinecap="round" />
      <Path d="M17 37 L31 37" stroke={p.dark} strokeWidth={2.8} strokeLinecap="round" />
      <Path d="M9 16 L39 11" stroke={p.base} strokeWidth={2.6} strokeLinecap="round" />
      <Circle cx={24} cy={12.5} r={2.6} fill={p.lite} />
      <Path d="M4 17 L14 17 L11 25 Q9 27, 7 25 Z" fill="url(#laBall)" />
      <Path d="M34 12 L44 12 L41 19 Q39 21, 37 19 Z" fill={p.gold} />
      <Path d="M9 16 L9 18 M39 11 L39 13" stroke={p.dark} strokeWidth={1.4} strokeLinecap="round" />
    </>
  ),

  /* Diversification — one basket, deliberately unlike eggs: varied assets, varied colour. */
  basket: (p) => (
    <>
      <Ground p={p} cx={24} cy={41} rx={14} />
      <Circle cx={15} cy={19} r={5} fill={p.lite} />
      <Circle cx={24} cy={15} r={5.6} fill={p.gold} />
      <Circle cx={33} cy={19} r={5} fill={p.base} />
      <Circle cx={13.4} cy={17.2} r={1.6} fill="#fff" opacity={0.5} />
      <Circle cx={22.2} cy={13} r={1.8} fill="#FDE68A" opacity={0.8} />
      <Path d="M8 22 L40 22 L36 37 Q35 39, 33 39 L15 39 Q13 39, 12 37 Z" fill="url(#laBall)" />
      <Path d="M8 22 L40 22 L39 26 L9 26 Z" fill={p.lite} opacity={0.55} />
      <Path d="M17 26 L19 39 M24 26 L24 39 M31 26 L29 39" stroke={p.dark} strokeWidth={1.2} opacity={0.4} />
    </>
  ),

  /* Inflation — a balloon straining upward while the bill below it shrinks. */
  balloon: (p) => (
    <>
      <Ground p={p} cx={24} cy={42} rx={10} />
      <Path d="M24 26 C22 30, 26 32, 24 36" stroke={p.dark} strokeWidth={1.5} fill="none" strokeLinecap="round" />
      <Path d="M24 5 C32 5, 36 12, 36 17 C36 23, 30 27, 24 27 C18 27, 12 23, 12 17 C12 12, 16 5, 24 5 Z" fill="url(#laBall)" />
      <Path d="M19 10 C17 13, 16.5 16, 17 19" stroke={p.lite} strokeWidth={2.4} strokeLinecap="round" fill="none" opacity={0.7} />
      <Path d="M22 27 L26 27 L24.6 29.5 L23.4 29.5 Z" fill={p.dark} />
      <Rect x={16} y={35} width={16} height={7} rx={1.6} fill={p.gold} opacity={0.9} />
      <Circle cx={24} cy={38.5} r={2} fill={p.dark} opacity={0.5} />
    </>
  ),

  /* Bonds — a certificate with a pressed wax seal and ribbon tails. The seal is the tell:
     a bond is a promise someone had to physically sign for. */
  certificate: (p) => (
    <>
      <Ground p={p} cx={24} cy={43} rx={13} />
      <Rect x={10} y={6} width={27} height={33} rx={2.4} fill="url(#laBall)" />
      <Rect x={10} y={6} width={27} height={7} rx={2.4} fill={p.lite} opacity={0.6} />
      <Path
        d="M15 19 L32 19 M15 23.5 L27 23.5 M15 28 L30 28"
        stroke={p.dark}
        strokeWidth={1.5}
        opacity={0.45}
        strokeLinecap="round"
      />
      <Path d="M29 36 L26.5 45 L30 42.6 L33.5 45 L32.5 36 Z" fill={p.gold} opacity={0.75} />
      <Circle cx={30} cy={35} r={5.2} fill={p.gold} />
      <Circle cx={30} cy={35} r={2.4} fill={p.dark} opacity={0.4} />
      <Circle cx={28.3} cy={33.3} r={1.4} fill="#FDE68A" opacity={0.85} />
    </>
  ),

  /* Tax — a till receipt with the top-right corner sliced clean off, the wedge floating
     away. The gap is the whole idea: a fixed share leaves before you ever hold it. */
  receipt: (p) => (
    <>
      <Ground p={p} cx={24} cy={43} rx={12} />
      <Path
        d="M11 9 L27 9 L35 17 L35 39 L32 36.4 L29 39 L26 36.4 L23 39 L20 36.4 L17 39 L14 36.4 L11 39 Z"
        fill="url(#laBall)"
      />
      <Path d="M11 9 L27 9 L30 12 L11 12 Z" fill={p.lite} opacity={0.55} />
      <Path
        d="M15 18 L26 18 M15 23 L31 23 M15 28 L24 28"
        stroke={p.dark}
        strokeWidth={1.5}
        opacity={0.42}
        strokeLinecap="round"
      />
      <Path d="M31 5 L42 5 L42 16 Z" fill={p.gold} />
      <Path d="M31 5 L42 5 L38.5 5 Z" fill="#FDE68A" opacity={0.6} />
      <Path d="M32.5 6.4 L40.4 6.4" stroke="#FDE68A" strokeWidth={1.6} opacity={0.75} strokeLinecap="round" />
    </>
  ),

  /* Retirement — an hourglass, mostly run through. Time is the asset being spent. */
  hourglass: (p) => (
    <>
      <Ground p={p} cx={24} cy={43} rx={12} />
      <Rect x={11} y={4} width={26} height={3.6} rx={1.8} fill={p.dark} />
      <Path d="M14 7.6 L34 7.6 L24 23 L34 38.4 L14 38.4 L24 23 Z" fill="url(#laBall)" opacity={0.6} />
      <Path d="M17 10.5 L31 10.5 L25.1 20 L22.9 20 Z" fill={p.gold} />
      <Path d="M17.5 38.4 L30.5 38.4 L27 31.5 Q24 28.5, 21 31.5 Z" fill={p.gold} />
      <Path d="M24 21 L24 32" stroke={p.gold} strokeWidth={1.4} strokeLinecap="round" />
      <Path d="M17.6 11 L21 17.5" stroke="#fff" strokeWidth={1.7} opacity={0.4} strokeLinecap="round" />
      <Rect x={11} y={38.4} width={26} height={3.6} rx={1.8} fill={p.dark} />
    </>
  ),

  /* Budgeting — one stream split three ways into jars filled to different levels.
     The unequal levels are the point: a budget is a decision, not an average. */
  jars: (p) => (
    <>
      <Ground p={p} cx={24} cy={42} rx={16} />
      <Path d="M5 4 L16 4 L14.6 12 L9.4 12 Z" fill={p.dark} />
      <Path
        d="M12 12 L11 22 M12 12 C14 17, 24 16, 24 22 M12 12 C16 17, 37 15, 37 22"
        stroke={p.gold}
        strokeWidth={1.7}
        fill="none"
        strokeLinecap="round"
      />
      <Path d="M5.4 24 L16.6 24 L15.7 38 Q15.6 39.6, 14 39.6 L8 39.6 Q6.4 39.6, 6.3 38 Z" fill="url(#laBall)" />
      <Path d="M18.4 24 L29.6 24 L28.7 38 Q28.6 39.6, 27 39.6 L21 39.6 Q19.4 39.6, 19.3 38 Z" fill="url(#laBall)" />
      <Path d="M31.4 24 L42.6 24 L41.7 38 Q41.6 39.6, 40 39.6 L34 39.6 Q32.4 39.6, 32.3 38 Z" fill="url(#laBall)" />
      <Rect x={6.6} y={30} width={8.8} height={9} rx={1.6} fill={p.gold} opacity={0.9} />
      <Rect x={19.6} y={27} width={8.8} height={12} rx={1.6} fill={p.gold} opacity={0.9} />
      <Rect x={32.6} y={34} width={8.8} height={5} rx={1.6} fill={p.gold} opacity={0.9} />
      <Rect x={6} y={22.2} width={10} height={2.8} rx={1.4} fill={p.lite} />
      <Rect x={19} y={22.2} width={10} height={2.8} rx={1.4} fill={p.lite} />
      <Rect x={32} y={22.2} width={10} height={2.8} rx={1.4} fill={p.lite} />
    </>
  ),

  /* Debt & credit — a card, with steps rising away behind it. The card is the near mass,
     the climb is the exit. */
  card: (p) => (
    <>
      <Ground p={p} cx={24} cy={41} rx={15} />
      <Rect x={29} y={26} width={6.5} height={9} rx={1.2} fill={p.dark} opacity={0.5} />
      <Rect x={36} y={19} width={6.5} height={16} rx={1.2} fill={p.dark} opacity={0.36} />
      <Rect x={5} y={13} width={30} height={21} rx={3.6} fill="url(#laBall)" />
      <Rect x={5} y={18.5} width={30} height={4.8} fill={p.dark} opacity={0.75} />
      <Rect x={9} y={26} width={7.5} height={5.4} rx={1.3} fill={p.gold} />
      <Path
        d="M9.6 28.7 L15.9 28.7 M12.7 26.2 L12.7 31.2"
        stroke={p.dark}
        strokeWidth={0.9}
        opacity={0.5}
      />
      <Rect x={5} y={13} width={30} height={3.2} rx={1.6} fill={p.lite} opacity={0.5} />
      <Path d="M21 28 L31 28 M21 31 L28 31" stroke={p.lite} strokeWidth={1.4} opacity={0.45} strokeLinecap="round" />
    </>
  ),

  /* Dividends — a tree that keeps its trunk and drops coins anyway. The canopy stays,
     which is the difference between a dividend and selling the tree. */
  dividendtree: (p) => (
    <>
      <Ground p={p} cx={24} cy={42} rx={12} />
      <Path d="M21.6 24 L21.6 40 L26.4 40 L26.4 24 Z" fill={p.dark} />
      <Path d="M24 29 L17.5 23 M24 33 L30.5 27" stroke={p.dark} strokeWidth={1.7} strokeLinecap="round" />
      <Circle cx={14.5} cy={20} r={6.2} fill={p.dark} opacity={0.8} />
      <Circle cx={33} cy={20} r={5.8} fill={p.base} />
      <Circle cx={24} cy={15.5} r={11} fill="url(#laBall)" />
      <Circle cx={19.5} cy={10.5} r={2.8} fill="#fff" opacity={0.32} />
      <Circle cx={12} cy={30} r={2.7} fill={p.gold} />
      <Circle cx={35} cy={32} r={2.2} fill={p.gold} opacity={0.9} />
      <Circle cx={24} cy={35} r={1.7} fill={p.gold} opacity={0.7} />
    </>
  ),

  /* Fees — a bucket losing what it carries through a hole nobody looks at. */
  bucket: (p) => (
    <>
      <Ground p={p} cx={24} cy={42} rx={12} />
      <Path d="M13.5 15 Q24 3, 34.5 15" stroke={p.dark} strokeWidth={1.9} fill="none" strokeLinecap="round" />
      <Path d="M11 15 L37 15 L33 37 Q32.6 39, 30.6 39 L17.4 39 Q15.4 39, 15 37 Z" fill="url(#laBall)" />
      <Ellipse cx={24} cy={15} rx={13} ry={3.6} fill={p.lite} />
      <Ellipse cx={24} cy={15.4} rx={10.2} ry={2.4} fill={p.gold} opacity={0.9} />
      <Circle cx={30.5} cy={26} r={2.3} fill={p.ink} opacity={0.85} />
      <Path d="M33.5 27 Q36.6 30.5, 35.6 33.4 Q34.6 35.4, 33.2 33.8 Q32.4 30.4, 33.5 27 Z" fill={p.gold} />
      <Circle cx={37.5} cy={37.5} r={1.9} fill={p.gold} opacity={0.85} />
      <Circle cx={35} cy={43} r={1.2} fill={p.gold} opacity={0.55} />
    </>
  ),

  /* Research — a lens held over a filing, close enough that one line is enlarged. */
  magnifier: (p) => (
    <>
      <Ground p={p} cx={24} cy={43} rx={13} />
      <Rect x={8} y={5} width={24} height={33} rx={2.6} fill="url(#laBall)" />
      <Rect x={8} y={5} width={24} height={5.4} rx={2.6} fill={p.lite} opacity={0.55} />
      <Path
        d="M12 15 L28 15 M12 20 L24 20 M12 25 L26 25 M12 30 L21 30"
        stroke={p.dark}
        strokeWidth={1.5}
        opacity={0.42}
        strokeLinecap="round"
      />
      <Path d="M31.5 30.5 L41 40" stroke={p.dark} strokeWidth={4.4} strokeLinecap="round" />
      <Circle cx={26} cy={25.5} r={9.6} fill="#fff" opacity={0.15} />
      <Circle cx={26} cy={25.5} r={9.6} fill="none" stroke={p.gold} strokeWidth={2.8} />
      <Path d="M21.5 20.5 Q19.6 23.4, 20.2 26.6" stroke="#fff" strokeWidth={2} opacity={0.5} fill="none" strokeLinecap="round" />
    </>
  ),

  /* Behavioural finance — a head with the spiral still turning inside it. */
  mind: (p) => (
    <>
      <Ground p={p} cx={24} cy={43} rx={12} />
      <Path d="M8 45 Q10 34.5, 19.5 32.5 L30 32.5 Q38 34.5, 40 45 Z" fill={p.dark} />
      <Path
        d="M27.5 34 L27.5 29.5 Q34.5 26.5, 35.5 18 Q36.5 5.5, 24 5 Q13 4.6, 11.6 15 L8.6 20.6 Q8 22.2, 10.2 22.6 L12.2 23 L12.2 27.4 Q12.4 31.4, 17.4 31.8 L17.4 34 Z"
        fill="url(#laBall)"
      />
      <Path d="M15 8.6 Q19.5 5.8, 24.6 6.4" stroke="#fff" strokeWidth={2} opacity={0.3} fill="none" strokeLinecap="round" />
      <Path
        d="M29 12.6 C24.6 10, 18.4 12.4, 18.8 17.6 C19.2 22.6, 26.6 23.6, 27.6 18.6 C28.3 15.3, 24.2 13.8, 22.6 16.6"
        stroke={p.gold}
        strokeWidth={2.1}
        fill="none"
        strokeLinecap="round"
      />
      <Circle cx={22.9} cy={17.6} r={1.4} fill={p.gold} />
    </>
  ),

  /* Real estate — a house drawn front-on with a lit window, because at 38px a pitched
     roof plus a door is the fastest-reading building there is. */
  house: (p) => (
    <>
      <Ground p={p} cx={24} cy={41} rx={16} />
      <Rect x={30} y={11} width={4.6} height={9} rx={1.2} fill={p.dark} />
      <Path d="M24 5 L44 21 L4 21 Z" fill={p.lite} />
      <Path d="M24 5 L44 21 L24 21 Z" fill={p.base} opacity={0.85} />
      <Rect x={9} y={21} width={30} height={18} rx={1.6} fill="url(#laBall)" />
      <Rect x={12} y={25} width={6.4} height={6.4} rx={1.2} fill={p.gold} opacity={0.9} />
      <Rect x={29.6} y={25} width={6.4} height={6.4} rx={1.2} fill={p.gold} opacity={0.55} />
      <Rect x={20} y={28} width={8} height={11} rx={1.3} fill={p.dark} />
      <Circle cx={26} cy={34} r={0.95} fill={p.gold} />
      <Path d="M4 21 L44 21" stroke={p.dark} strokeWidth={1.5} opacity={0.45} strokeLinecap="round" />
    </>
  ),

  /* Banking — a pedimented hall on three columns. Institutions built like temples on
     purpose; the shape still says "your money is kept here". */
  bank: (p) => (
    <>
      <Ground p={p} cx={24} cy={42} rx={16} />
      <Path d="M24 4 L43 15 L5 15 Z" fill={p.lite} />
      <Circle cx={24} cy={11} r={2.3} fill={p.gold} />
      <Rect x={6.5} y={15} width={35} height={3.4} rx={1.2} fill={p.base} />
      <Rect x={10.5} y={18.4} width={5.8} height={16} fill="url(#laBall)" />
      <Rect x={21.1} y={18.4} width={5.8} height={16} fill="url(#laBall)" />
      <Rect x={31.7} y={18.4} width={5.8} height={16} fill="url(#laBall)" />
      <Rect x={7.5} y={34.4} width={33} height={3} fill={p.base} opacity={0.9} />
      <Rect x={4.5} y={37.4} width={39} height={3.4} rx={1.4} fill={p.dark} />
    </>
  ),

  /* Savings — a vault door, dialled shut. Weight and thickness do the talking. */
  vault: (p) => (
    <>
      <Ground p={p} cx={24} cy={43} rx={14} />
      <Rect x={4} y={5} width={40} height={35} rx={4} fill={p.dark} />
      <Rect x={4} y={5} width={40} height={4} rx={2} fill={p.lite} opacity={0.28} />
      <Circle cx={24} cy={22.5} r={14} fill="url(#laBall)" />
      <Circle cx={24} cy={22.5} r={10.6} fill="none" stroke={p.dark} strokeWidth={1.4} opacity={0.45} />
      <Path
        d="M24 11.5 L24 33.5 M13 22.5 L35 22.5 M16.2 14.7 L31.8 30.3 M31.8 14.7 L16.2 30.3"
        stroke={p.gold}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
      <Circle cx={24} cy={22.5} r={4.8} fill={p.dark} />
      <Circle cx={24} cy={22.5} r={2.1} fill={p.gold} />
      <Circle cx={17} cy={15.5} r={2.4} fill="#fff" opacity={0.28} />
    </>
  ),

  /* Global markets — a world with something in orbit around it. The ring is what makes it
     read as a planet rather than a ball. */
  globe: (p) => (
    <>
      <Ground p={p} cx={24} cy={43} rx={12} />
      <Circle cx={24} cy={22} r={13} fill="url(#laBall)" />
      <Path d="M13.8 16.5 Q18 12.4, 22.2 15.4 Q24.4 19.4, 20.2 21.6 Q15 21.6, 13.8 16.5 Z" fill={p.dark} opacity={0.5} />
      <Path d="M26 24 Q31 21.6, 33.2 26 Q33.2 31, 28 31.2 Q25 28, 26 24 Z" fill={p.dark} opacity={0.5} />
      <Ellipse cx={24} cy={22} rx={5.6} ry={13} fill="none" stroke={p.dark} strokeWidth={1} opacity={0.32} />
      <Path d="M11 22 L37 22" stroke={p.dark} strokeWidth={1} opacity={0.32} strokeLinecap="round" />
      <Circle cx={18.5} cy={14.5} r={2.6} fill="#fff" opacity={0.3} />
      <G rotation={-18} originX={24} originY={24}>
        <Ellipse cx={24} cy={24} rx={19} ry={6.2} fill="none" stroke={p.gold} strokeWidth={1.9} />
      </G>
      <Circle cx={42} cy={18.2} r={2.2} fill={p.gold} />
    </>
  ),

  /* Valuation — a tag hung on the thing that did the arithmetic. Two objects, one claim:
     a number was produced, then attached. */
  pricetag: (p) => (
    <>
      <Ground p={p} cx={24} cy={43} rx={13} />
      <Rect x={3} y={23} width={18} height={19} rx={2.6} fill={p.dark} />
      <Rect x={5.2} y={25.4} width={13.6} height={4.4} rx={1.2} fill={p.lite} opacity={0.8} />
      <Path
        d="M6.4 33.4 h2.6 M11 33.4 h2.6 M15.6 33.4 h2.6 M6.4 37.6 h2.6 M11 37.6 h2.6 M15.6 37.6 h2.6"
        stroke={p.lite}
        strokeWidth={2.4}
        opacity={0.45}
        strokeLinecap="round"
      />
      <Path d="M41 6 L45.5 1.5" stroke={p.dark} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M31 4 L44 4 L44 17 L28 33 L15 20 Z" fill="url(#laBall)" />
      <Path d="M31 4 L44 4 L44 8.4 L35.4 8.4 Z" fill={p.lite} opacity={0.5} />
      <Circle cx={39.6} cy={8.4} r={2.4} fill={p.dark} />
      <Path d="M23 17 L31 25 M28.5 14 L33 18.5" stroke={p.gold} strokeWidth={2.6} strokeLinecap="round" />
    </>
  ),

  /* Insurance — a canopy wide enough that what falls never lands on you. */
  umbrella: (p) => (
    <>
      <Ground p={p} cx={24} cy={43} rx={11} />
      <Path
        d="M5 24 Q5 7, 24 7 Q43 7, 43 24 Q38 19, 33 24 Q28.5 19, 24 24 Q19.5 19, 15 24 Q10 19, 5 24 Z"
        fill="url(#laBall)"
      />
      <Path d="M6.5 21 Q9 10, 18 8" stroke="#fff" strokeWidth={2} opacity={0.32} fill="none" strokeLinecap="round" />
      <Path d="M24 7 L24 24" stroke={p.dark} strokeWidth={1} opacity={0.3} />
      <Path
        d="M24 22 L24 36 Q24 40.5, 19.6 40.5 Q16.4 40.5, 16.4 37"
        stroke={p.dark}
        strokeWidth={2.4}
        fill="none"
        strokeLinecap="round"
      />
      <Circle cx={24} cy={6.6} r={1.6} fill={p.gold} />
      <Path d="M8.5 29 Q10.8 32, 9.9 34.4 Q9 36.2, 7.8 34.7 Q7.2 32, 8.5 29 Z" fill={p.gold} opacity={0.9} />
      <Circle cx={39} cy={30} r={2} fill={p.gold} opacity={0.85} />
      <Circle cx={35.5} cy={37} r={1.4} fill={p.gold} opacity={0.6} />
    </>
  ),

  /* Cash flow — two inbound lines joining into one outbound. Plumbing, not arrows:
     the flanges and the wall thickness are what stop it reading as a diagram. */
  pipes: (p) => (
    <>
      <Ground p={p} cx={24} cy={43} rx={12} />
      <Path
        d="M12 7 L12 17 Q12 23, 18 23 L24 23 M36 7 L36 17 Q36 23, 30 23 L24 23 M24 23 L24 39"
        stroke={p.dark}
        strokeWidth={8.4}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 7 L12 17 Q12 23, 18 23 L24 23 M36 7 L36 17 Q36 23, 30 23 L24 23 M24 23 L24 39"
        stroke="url(#laBall)"
        strokeWidth={5.2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Rect x={7.2} y={6.4} width={9.6} height={3.6} rx={1.5} fill={p.lite} />
      <Rect x={31.2} y={6.4} width={9.6} height={3.6} rx={1.5} fill={p.lite} />
      <Rect x={19.2} y={31} width={9.6} height={3.6} rx={1.5} fill={p.lite} />
      <Circle cx={24} cy={23} r={3.2} fill={p.gold} />
      <Circle cx={24} cy={38} r={1.9} fill={p.gold} opacity={0.7} />
    </>
  ),

  /* Probability — two dice mid-settle. Concrete odds you can hold, not a bell curve. */
  dice: (p) => (
    <>
      <Ground p={p} cx={24} cy={42} rx={15} />
      <G rotation={14} originX={32} originY={20}>
        <Rect x={24} y={11} width={16} height={16} rx={3.4} fill={p.gold} />
        <Rect x={24} y={11} width={16} height={4} rx={2} fill="#FDE68A" opacity={0.55} />
        <Circle cx={28.6} cy={15.6} r={1.5} fill={p.dark} opacity={0.65} />
        <Circle cx={32} cy={19} r={1.5} fill={p.dark} opacity={0.65} />
        <Circle cx={35.4} cy={22.4} r={1.5} fill={p.dark} opacity={0.65} />
      </G>
      <Rect x={6} y={19} width={21} height={21} rx={4.4} fill="url(#laBall)" />
      <Rect x={6} y={19} width={21} height={4.6} rx={2.3} fill={p.lite} opacity={0.5} />
      <G fill={p.ink} opacity={0.62}>
        <Circle cx={11.5} cy={24.5} r={1.9} />
        <Circle cx={21.5} cy={24.5} r={1.9} />
        <Circle cx={16.5} cy={29.5} r={1.9} />
        <Circle cx={11.5} cy={34.5} r={1.9} />
        <Circle cx={21.5} cy={34.5} r={1.9} />
      </G>
    </>
  ),

  /* Accounting — an open ledger, both pages carrying entries, ribbon still in it.
     Two facing pages is the whole discipline: every entry lands twice. */
  ledger: (p) => (
    <>
      <Ground p={p} cx={24} cy={38} rx={16} />
      <Path d="M24 9 L5 12.5 L5 33 L24 29.5 Z" fill="url(#laBall)" />
      <Path d="M24 9 L43 12.5 L43 33 L24 29.5 Z" fill={p.base} />
      <Path
        d="M9 18 L20 16.2 M9 22 L18 20.4 M9 26 L20 24.4"
        stroke={p.dark}
        strokeWidth={1.4}
        opacity={0.42}
        strokeLinecap="round"
      />
      <Path
        d="M28 16.2 L39 18 M28 20.4 L37 22 M28 24.4 L39 26"
        stroke={p.lite}
        strokeWidth={1.4}
        opacity={0.55}
        strokeLinecap="round"
      />
      <Path d="M24 9 L24 29.5" stroke={p.dark} strokeWidth={1.7} opacity={0.7} />
      <Path d="M21.5 10 L26.5 10 L26.5 43 L24 39.4 L21.5 43 Z" fill={p.gold} />
      <Path d="M22.4 10.8 L22.4 38" stroke="#FDE68A" strokeWidth={1} opacity={0.5} strokeLinecap="round" />
    </>
  ),

  /* Strategy — a rook. Crenellations and a plinth, so it reads as a played piece rather
     than a tower; the board tile under it sets the scale. */
  chess: (p) => (
    <>
      <Ground p={p} cx={24} cy={41} rx={13} />
      <Path d="M5 40 L24 44.5 L43 40 L24 35.5 Z" fill={p.dark} opacity={0.4} />
      <Path
        d="M13 7 L18 7 L18 11 L21.5 11 L21.5 7 L26.5 7 L26.5 11 L30 11 L30 7 L35 7 L35 15 L31.5 18 L31.5 29 L35 33 L35 37 L13 37 L13 33 L16.5 29 L16.5 18 L13 15 Z"
        fill="url(#laBall)"
      />
      <Rect x={14.5} y={16.6} width={19} height={3.4} rx={1.3} fill={p.lite} opacity={0.6} />
      <Path d="M19.5 21 L19.5 29" stroke={p.lite} strokeWidth={2.6} opacity={0.45} strokeLinecap="round" />
      <Rect x={11.5} y={35.5} width={25} height={4.2} rx={1.7} fill={p.dark} />
      <Rect x={14.5} y={8} width={5} height={2.4} rx={1} fill={p.gold} opacity={0.85} />
      <Rect x={28.5} y={8} width={5} height={2.4} rx={1} fill={p.gold} opacity={0.85} />
    </>
  ),

  /* Fraud & security — a padlock, shackle closed. The gold core is what is being kept. */
  lock: (p) => (
    <>
      <Ground p={p} cx={24} cy={43} rx={12} />
      <Path
        d="M15 23 L15 15 Q15 6.5, 24 6.5 Q33 6.5, 33 15 L33 23"
        stroke={p.dark}
        strokeWidth={4.6}
        fill="none"
        strokeLinecap="round"
      />
      <Path d="M17.4 20 L17.4 15 Q17.4 9, 22 8.4" stroke={p.lite} strokeWidth={1.6} fill="none" opacity={0.45} strokeLinecap="round" />
      <Rect x={8.5} y={20.5} width={31} height={19.5} rx={4.2} fill="url(#laBall)" />
      <Rect x={8.5} y={20.5} width={31} height={4.2} rx={2.1} fill={p.lite} opacity={0.5} />
      <Circle cx={24} cy={29} r={4.2} fill={p.gold} />
      <Path d="M24 30.5 L24 35.5" stroke={p.gold} strokeWidth={2.8} strokeLinecap="round" />
      <Circle cx={22.4} cy={27.5} r={1.4} fill="#FDE68A" opacity={0.85} />
    </>
  ),

  /* Fallback — a coin stack with depth. Never blank, never embarrassing. */
  coins: (p) => (
    <>
      <Ground p={p} cx={24} cy={41} rx={13} />
      <Ellipse cx={24} cy={34} rx={12} ry={4.4} fill={p.dark} />
      <Rect x={12} y={28} width={24} height={6} fill={p.dark} />
      <Ellipse cx={24} cy={28} rx={12} ry={4.4} fill={p.base} />
      <Rect x={12} y={22} width={24} height={6} fill={p.base} />
      <Ellipse cx={24} cy={22} rx={12} ry={4.4} fill="url(#laBall)" />
      <Rect x={12} y={16} width={24} height={6} fill={p.lite} opacity={0.9} />
      <Ellipse cx={24} cy={16} rx={12} ry={4.4} fill={p.lite} />
      <Ellipse cx={20} cy={15} rx={4} ry={1.6} fill="#fff" opacity={0.45} />
    </>
  ),
};

/* ---------------------------------------------------------------- title -> metaphor */

/**
 * Matched in order, first hit wins — so put specific phrases above generic words.
 * Titles come from the real curriculum (342 of them), which is finance-wide, so this
 * matches on topic vocabulary rather than trying to enumerate every lesson.
 */
const METAPHORS: ReadonlyArray<readonly [RegExp, string]> = [
  /* ══════════════════════════════════════════════════════════════════════════════════════
   * TIER 0 — CONCEPT-LEVEL, matched FIRST. Added 2026-08-07.
   *
   * WHY THIS TIER EXISTS. The table below TIER 0 matches at COURSE granularity: every lesson
   * in Behavioral Finance contains a behavioural word, so all of them hit the `mind` net.
   * Measured across the real 295 authored lesson titles before this tier existed:
   *
   *   behavioralFinance   'mind'      24 of 25 nodes (96%)  — 16 CONSECUTIVE identical icons
   *   businessStrategy    'chess'     20 of 25 (80%)        —  7 in a row
   *   appliedAccounting   'ledger'    19 of 25 (76%)        —  6 in a row
   *   financialAnalytics  'magnifier' 16 of 25 (64%)        —  6 in a row
   *
   * A path of 25 nodes showing one glyph is decoration wearing the costume of information —
   * the same conclusion that got node-TYPE badges removed from learn.tsx. The fix is not more
   * fallbacks; it is matching the CONCEPT the lesson actually teaches.
   *
   * ORDER IS LOAD-BEARING. Every pattern here must stay above the broad nets, and narrower
   * ones above wider ones inside this tier. `/depreciat/` in particular must precede the
   * `ledger` net, which also matches it.
   *
   * Verify any change with the distribution script: no course may show one icon on more than
   * ~5 of its 25 nodes, and no icon may repeat on 3+ consecutive nodes.
   * ══════════════════════════════════════════════════════════════════════════════════════ */

  /* -- behavioural concepts ---------------------------------------------------------- */
  [/herd behav|social proof|bandwagon/i, 'crowd'],
  [/anchoring/i, 'anchor'],
  [/framing|mental account/i, 'frame'],
  [/nudge|choice architect/i, 'funnel'],
  [/narrative fallacy|storytell/i, 'story'],
  [/attention bias|media influence/i, 'magnet'],
  [/social media/i, 'network'],
  [/sunk cost/i, 'decay'],
  [/status quo|inertia/i, 'lock'],
  [/regret aversion|paralysis/i, 'hourglass'],
  [/overconfiden|illusion of control|emotional cycle/i, 'balloon'],
  [/disposition effect|selling winners/i, 'candles'],
  [/gambler|hot hand/i, 'dice'],
  [/endowment effect/i, 'house'],
  [/debiasing|cognitive tool|your brain/i, 'mind'],
  [/cognitive bias/i, 'bucket'],
  [/behavioral portfolio/i, 'basket'],
  [/everyday life/i, 'jars'],
  [/market anomal/i, 'magnifier'],
  [/rational (investment )?framework/i, 'stairs'],
  [/prospect theory/i, 'scale'],

  /* -- accounting concepts ----------------------------------------------------------- */
  [/balance sheet/i, 'scale'],
  [/inventory/i, 'boxes'],
  [/depreciat/i, 'decay'],
  [/payroll|employee benefit/i, 'crowd'],
  [/receivable|payable/i, 'handshake'],
  [/consolidat|group accounting/i, 'basket'],
  [/information system/i, 'network'],
  [/financial statement analysis/i, 'dashboard'],
  [/income statement|revenue recognition|accrual/i, 'invoice'],
  [/cost accounting|break.?even/i, 'bucket'],
  [/internal control|\bauditing\b/i, 'lock'],
  [/forensic|fraud detection|x.?ray/i, 'magnifier'],
  [/managerial account/i, 'chess'],
  [/nonprofit|government account/i, 'bank'],
  [/\bifrs\b|\bgaap\b|international account/i, 'globe'],
  [/ethics|professional standard/i, 'certificate'],
  [/journal entr|double.entry|language of account/i, 'ledger'],
  [/variance analysis/i, 'jars'],

  /* -- strategy concepts ------------------------------------------------------------- */
  [/market positioning|competitive analysis|go.to.market/i, 'flag'],
  [/merger|acquisition|partnership|alliance/i, 'handshake'],
  [/scaling a business|business model|predictive model/i, 'stairs'],
  [/leadership|organizational|talent strategy|human capital/i, 'crowd'],
  [/customer acquisition|retention/i, 'funnel'],
  [/brand building|market perception|financial modeling/i, 'frame'],
  [/supply chain|\bsql\b|database quer|big data/i, 'boxes'],
  [/digital transformation|innovation|disrupt|machine learning|\bnlp\b|natural language|python for/i, 'network'],
  [/data.driven|dashboard|data visuali|what is financial analytics/i, 'dashboard'],
  [/crisis management|business continuity|stress test/i, 'umbrella'],
  [/sustainab|\besg\b|social responsib/i, 'dividendtree'],
  [/platform business|real.time data|streaming/i, 'pipes'],
  [/product strategy|portfolio analytics/i, 'basket'],
  [/strategic finance/i, 'ledger'],

  /* -- analytics concepts ------------------------------------------------------------ */
  [/sentiment analysis|alternative data/i, 'story'],
  [/time series/i, 'hourglass'],
  [/credit scoring/i, 'card'],
  [/a\/b test|experimentation/i, 'funnel'],
  [/automated reporting/i, 'invoice'],
  [/anomaly detection|fraud analytics/i, 'lock'],
  [/monte carlo|descriptive statistic/i, 'dice'],
  [/regression analysis/i, 'magnifier'],

  /* -- macro / global economics ------------------------------------------------------ */
  [/supply and demand/i, 'scale'],
  [/federal reserve|monetary polic|central bank/i, 'bank'],
  [/\bgdp\b|economic indicator|leading signal/i, 'dashboard'],
  [/fiscal polic|government spending|deficit|sovereign risk/i, 'invoice'],
  [/currency market|exchange rate|\bcbdc|digital currency|future of money/i, 'coins'],
  [/emerging market|development econom|poverty/i, 'stairs'],
  [/labor market|employment|income inequal|wealth distribution/i, 'crowd'],
  [/trade war|tariff|sanction|geopolit/i, 'flag'],
  [/commodit|natural resource/i, 'boxes'],
  [/climate/i, 'dividendtree'],
  [/digital economy|platform econom/i, 'network'],
  [/bubble|financial cris|contagion|systemic risk/i, 'balloon'],
  [/international trade|globalizat/i, 'globe'],

  /* -- wealth management ------------------------------------------------------------- */
  [/estate plan|trusts|wealth transfer/i, 'certificate'],
  [/charitable|philanthrop|impact investing|values.based/i, 'dividendtree'],
  [/family wealth|multi.generational/i, 'crowd'],
  [/financial advisor|robo.advisor/i, 'handshake'],
  [/asset location|tax.efficient|tax.advantaged|tax optimization/i, 'receipt'],
  [/social security|government benefit/i, 'bank'],
  [/health care planning|\bhsa/i, 'umbrella'],
  [/concentrated stock/i, 'candles'],
  [/divorce|financial separation/i, 'scale'],
  [/business owner wealth/i, 'flag'],
  [/preserving wealth|building & preserving/i, 'vault'],
  [/retirement income|withdrawal strateg/i, 'hourglass'],

  /* -- risk management --------------------------------------------------------------- */
  [/value at risk|risk decomposition|quantitative risk model/i, 'dice'],
  [/credit risk|default probab|counterparty|collateral/i, 'card'],
  [/operational|liquidity risk/i, 'pipes'],
  [/hedging|\bfx hedg/i, 'umbrella'],
  [/duration|interest rate (risk|model)/i, 'certificate'],
  [/enterprise risk|risk governance|board oversight/i, 'chess'],
  [/basel|regulatory framework/i, 'lock'],
  [/tail risk|black swan/i, 'balloon'],
  [/cyber|technology threat/i, 'magnet'],
  [/model risk|validation|backtest/i, 'frame'],
  [/scenario analysis|war gaming/i, 'story'],
  [/risk transfer/i, 'handshake'],

  /* -- quantitative ------------------------------------------------------------------ */
  [/portfolio optimiz|markowitz/i, 'basket'],
  [/black.scholes|derivatives pricing|risk.neutral|measure theory/i, 'pricetag'],
  [/factor model|alpha generation/i, 'network'],
  [/statistical arbitrage|high.frequency|market microstructure/i, 'candles'],
  [/algorithmic trading|execution algorithm|transaction cost/i, 'pipes'],
  [/stochastic calculus/i, 'dice'],
  [/copula|dependency model/i, 'network'],
  [/bayesian/i, 'scale'],
  [/volatilit.*garch|\bgarch\b/i, 'balloon'],
  [/exotic option|path.dependent/i, 'anchor'],
  [/quantum computing/i, 'magnet'],

  /* -- investing fundamentals -------------------------------------------------------- */
  [/compound interest|dollar cost averag/i, 'snowball'],
  [/stocks vs\.? bonds|mutual fund|fund types/i, 'certificate'],
  [/diversificat/i, 'basket'],
  [/etfs? & index|index funds/i, 'boxes'],
  [/first portfolio|rebalancing/i, 'scale'],
  [/account types/i, 'vault'],
  [/reading stock chart|market order|market cycle/i, 'candles'],
  [/dividend/i, 'dividendtree'],
  [/growth vs value/i, 'stairs'],
  [/international investing/i, 'globe'],
  [/introduction to options/i, 'anchor'],
  [/investing pitfall/i, 'mind'],
  [/investment fees/i, 'bucket'],
  [/due diligence/i, 'magnifier'],
  [/long.term investing/i, 'hourglass'],
  [/paper trading/i, 'flag'],
  [/risk vs\.? reward/i, 'dice'],

  /* -- every course ends in one; keeps the last node from inheriting a broad net ----- */
  [/capstone|checkpoint/i, 'vault'],

  /* -- narrow, high-confidence topics first ------------------------------------------ */
  [/compound|snowball|exponential|growth over time|dollar cost averag|time value|long-term investing/i, 'snowball'],
  [/inflation|purchasing power|cost of living|deflation|hyperinflat/i, 'balloon'],
  [/retire|401|\bira\b|pension|nest egg|annuit|social security|withdrawal strateg/i, 'hourglass'],
  [/fraud|identity theft|\bscam|phishing|cyber|password|security\b|embezzl|ponzi|\btheft/i, 'lock'],
  [/\bbond|treasur|coupon|fixed income|credit rating|debenture|duration|yield curve|regulat|complian|basel|structured product|prospectus|disclosure/i, 'certificate'],
  [/\btax|\birs\b|deduction|withhold|capital gains|estate plan|write-off|philanthrop|charitable|\bhsa/i, 'receipt'],
  [/dividend|payout|passive income|income stream|buyback|yield on cost/i, 'dividendtree'],
  [/budget|spending|sinking fund|envelope|zero-based|paycheck|salary|negotiat/i, 'jars'],
  [/real estate|\bhome\b|housing|property|\brent|mortgage|\breit|landlord|homeown|farmland|infrastructure/i, 'house'],
  [/\bdebt|credit card|credit score|\bloan|borrow|leverage|\bapr\b|refinanc|amortiz|default probab|distress|restructur|bankrupt|insolven/i, 'card'],
  [/\bfees?\b|expense ratio|cost drag|commission|12b-1|leak|\bload\b|transaction cost/i, 'bucket'],
  [/insur|coverage|deductible|underwrit|policyholder|actuar|reinsur/i, 'umbrella'],
  [/cash flow|cashflow|liquidit|working capital|free cash|burn rate|runway|inflow|outflow|fundrais|venture fund|startup finance/i, 'pipes'],
  [/behavio|\bbias|debias|psycholog|emotion|herd|anchoring|overconfiden|\bfomo\b|mental account|aversion|your brain|framing|prospect theory|nudge|choice architect|fallacy|disposition effect|paralysis/i, 'mind'],
  [/bank|\bfdic\b|monetary polic|federal reserve|\bdeposit|checking account|credit union|the fed\b/i, 'bank'],
  [/saving|emergency fund|vault|store of value|preserv|thrift|wealth\b|financial advisor|financial planning|life events|\bhnw\b/i, 'vault'],
  [/global|internationa|currenc|forex|exchange rate|geopolit|emerging market|world econom|tariff|\bimport|\bexport|\bgdp\b|supply and demand|crypto|\bdefi\b|token|blockchain|digital asset|econom/i, 'globe'],
  [/valuation|\bdcf\b|intrinsic|price target|\bp\/e\b|multiples|apprais|pricing|book value|black-scholes|\bprice\b|valuing|\bwacc\b|cost of capital|compensation|value investing/i, 'pricetag'],
  [/probabilit|monte carlo|\bdice\b|\bodds\b|bayes|stochast|expected value|simulat|random|standard deviation|statistic|regression|\bquant/i, 'dice'],
  [/account|ledger|balance sheet|bookkeep|\bdebit|\bgaap\b|\bifrs\b|journal|double-entry|income statement|financial statement|depreciat|revenue recognition|\baudit/i, 'ledger'],
  [/strateg|competit|\bmoat\b|game theory|chess|positioning|first.mover|\bswot\b|porter|go-to-market|scaling a business|business model|governance|\bethic|innovat|disrupt|leadership|organizational|customer acquisition|digital transformation|crisis management|sustainab|\besg\b|social responsib|merger|acquisition/i, 'chess'],

  /* -- broader nets last; everything above must stay reachable ----------------------- */
  [/diversif|allocat|portfolio|basket|spread|rebalanc|optimiz|\betfs?\b|index fund|mutual fund|asset class|alternative (invest|asset)|collectib|commodit/i, 'basket'],
  [/risk|volatil|uncertain|downside|hedge|safety|protect|derivativ|option/i, 'scale'],
  [/research|due diligence|forensic|red flag|screening|investigat|analy(s|z|t)|model|forecast|ratio|\bdata\b|dashboard|machine learning|\bsql\b|reporting|algorithm|comput|visualiz|testing|experiment/i, 'magnifier'],
  [/stock|share|equit|market|ticker|chart|candle|trading|trade|order|\bipo|\bspac|blank check/i, 'candles'],
];

/**
 * Topic-neutral art for titles that match no metaphor. Chosen by hashing the TITLE, not the
 * index: art must not change when a lesson is reordered, and two adjacent generic titles
 * should still differ. Keep these generic — never put a strong metaphor (inflation, risk)
 * in here or it will assert something false about an unrelated lesson.
 */
const NEUTRAL = ['coins', 'candles'] as const;

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function artKeyFor(title: string, _index = 0): string {
  for (const [re, key] of METAPHORS) if (re.test(title)) return key;
  return NEUTRAL[hash(title) % NEUTRAL.length];
}

/* ---------------------------------------------------------------- component */

export function LessonArt({
  courseId,
  title,
  index = 0,
  size = 38,
}: {
  courseId: string;
  title: string;
  index?: number;
  size?: number;
}) {
  const accent = courseAccent(courseId);
  const p = paletteFor(accent);
  const key = artKeyFor(title, index);
  const draw = ART[key] ?? ART.coins;

  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Defs>
        {/* top-lit primary mass — the single light source every scene shares */}
        <LinearGradient id="laBall" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={p.lite} />
          <Stop offset="0.5" stopColor={p.base} />
          <Stop offset="1" stopColor={p.dark} />
        </LinearGradient>
      </Defs>
      {draw(p)}
    </Svg>
  );
}
