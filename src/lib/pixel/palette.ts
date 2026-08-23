/**
 * The Euphoria pixel palette.
 *
 * Every colour here is pulled from the existing design tokens (see the orchid
 * retint in index.css and the accents in AnimatedVisuals.tsx) rather than from a
 * retro console palette. Game Boy green next to #B862ED reads as a bug; this
 * reads as Euphoria that happens to be made of squares.
 *
 * Each hue family is a three-step ramp (shadow / base / light) because ramps are
 * what make pixel art read as shaded form instead of flat clip art. Lowercase is
 * the darker step, uppercase the brighter, so a sprite's shape is legible in the
 * raw ASCII: `g` is gold shadow, `G` gold base, `y` gold light.
 */

/** `.` is always transparent and is not listed in any palette. */
export const TRANSPARENT = "." as const;

export const EUPHORIA_PIXEL_PALETTE: Record<string, string> = {
  // Ink — INTERIOR detail only (pupils, a coin's $, clock hands). Never the outer
  // silhouette: #1A1523 on the #0A090F canvas is invisible, so any sprite whose
  // structure is thin linework disappears. Outline with the deep steps below.
  K: "#1A1523",
  k: "#2E2739",

  // Deep steps — the outline tone for each hue family on dark surfaces. These are
  // what let a sprite keep its silhouette against #0A090F and #14121C.
  O: "#7A4E0F", // deep gold
  E: "#5B1A96", // deep orchid
  D: "#4A4356", // deep neutral
  I: "#8E1B50", // deep pink

  // Orchid — the brand ramp. Primary sprite hue.
  p: "#8028C3",
  P: "#A451E6",
  q: "#C57FF3",
  Q: "#E3C4FA",

  // Gold — money, coins, streaks, XP.
  g: "#B8791B",
  G: "#F0A72B",
  y: "#FFD98A",

  // Green — the positive sentiment accent (#34D399 in AnimatedVisuals).
  n: "#0E7A5F",
  N: "#34D399",
  m: "#86EFC7",

  // Red — the negative sentiment accent (#F87171 in AnimatedVisuals).
  r: "#B93B3B",
  R: "#F87171",
  s: "#FCA5A5",

  // Neutral — paper, text, muted UI.
  X: "#6E6579",
  x: "#A79DB5",
  w: "#F2EFF7",
  W: "#FFFFFF",

  // Fire — a five-step ramp written as DIGITS, brightest last, so a flame reads
  // as a heat gradient in the raw ASCII (1 is the cool ember edge, 5 the white
  // hot core). The gold ramp above is for money and streak counters and is too
  // yellow to read as fire: a flame drawn in G/y looks like a gold teardrop.
  "1": "#7E2318", // ember shadow, the outline tone on dark
  "2": "#C93A26", // deep red
  "3": "#EF6C33", // orange
  "4": "#FBA94C", // amber
  "5": "#FDECA8", // pale hot core

  // Teal, pink, blue — secondary object colours already used across shopArt.
  t: "#0F766E",
  T: "#2DD4BF",
  f: "#BE2A6B",
  F: "#F472B6",
  b: "#2563C4",
  B: "#60A5FA",
};

