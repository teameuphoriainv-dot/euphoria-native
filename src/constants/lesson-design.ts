import { Colors, Fonts } from '@/constants/theme';

/**
 * Canonical lesson-viewer design tokens measured from euphoriainv.com.
 *
 * These are intentionally lesson-scoped. The rest of the native app has its own surface ramp and
 * typography, while the parity contract requires the 300 lesson experiences to mirror the web
 * viewer exactly.
 */
export const LessonColors = {
  ...Colors.dark,
  text: '#F4F4F5',
  textSecondary: '#F4F4F5',
  mutedForeground: '#6F6F7B',
  background: '#09090B',
  backgroundElement: '#101014',
  backgroundSelected: '#22222A',
  card: '#101014',
  cardElevated: '#22222A',
  border: '#1C1C22',
  input: '#22222A',
  muted: '#22222A',
  primary: '#A650E7',
  accent: '#BA66EA',
  success: '#21C45D',
  warning: '#F8C630',
  destructive: '#EF4343',
  ctaDepth: '#811CCE',
} as const;

export const LessonTypography = {
  display: { fontFamily: Fonts.black, fontSize: 30, lineHeight: 36, letterSpacing: -0.75 },
  title: { fontFamily: Fonts.black, fontSize: 24, lineHeight: 32 },
  heading: { fontFamily: Fonts.bold, fontSize: 18, lineHeight: 26 },
  body: { fontFamily: Fonts.body, fontSize: 16, lineHeight: 26 },
  bodyMedium: { fontFamily: Fonts.medium, fontSize: 16, lineHeight: 26 },
  small: { fontFamily: Fonts.body, fontSize: 14, lineHeight: 20 },
  smallBold: { fontFamily: Fonts.bold, fontSize: 14, lineHeight: 20 },
  label: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: 'uppercase' as const,
  },
  code: { fontFamily: Fonts.mono, fontSize: 13 },
} as const;

export const LessonDesign = {
  headerHeight: 56,
  outerGutter: 16,
  innerGutter: 24,
  contentTop: 32,
  contentBottom: 48,
  radius: { sm: 8, md: 10, lg: 12, card: 16 },
  cta: { minHeight: 44, radius: 12, depth: 4, maxWidth: 600 },
  maxWidth: { question: 680, graph: 900 },
} as const;
