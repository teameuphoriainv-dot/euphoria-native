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
 * Art is chosen by matching the real lesson title against METAPHORS; unmatched titles
 * fall back to a per-index rotation so a path never repeats one icon down the screen.
 */
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { courseAccent } from '@/lib/course-accents';

/* ---------------------------------------------------------------- colour utils */

const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));

/** Shift a hex colour toward white (t>0) or black (t<0). t in [-1, 1]. */
function shade(hex: string, t: number): string {
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
  [/compound|snowball|exponential|growth over time/i, 'snowball'],
  [/diversif|allocat|portfolio|basket|spread|rebalanc/i, 'basket'],
  [/inflation|purchasing power|cost of living|deflation/i, 'balloon'],
  [/risk|volatil|uncertain|downside|hedge|safety|protect/i, 'scale'],
  [/stock|share|equit|market|ticker|chart|candle|trading|trade|order/i, 'candles'],
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
