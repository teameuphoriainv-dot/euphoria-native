import type { AnimatedVisual } from '@/lib/curriculum';

export const TEACHING_SLIDE_DWELL_MS = 15_000;
export const TEACHING_SLIDE_SCROLL_MARGIN = 100;

export type TeachingTerm = { term: string; definition: string; example?: string };

export type TeachingSlideSpec = {
  sectionLabel?: string;
  title: string;
  paragraphs: string[];
  highlightedTerms: TeachingTerm[];
  diagramDescription: string;
  diagramVisual?: AnimatedVisual;
  diagramSvg?: string;
  atlas?: { hint?: string; recap?: string };
};

export type TeachingTextSegment =
  | { kind: 'text'; text: string }
  | { kind: 'term'; text: string; term: TeachingTerm };

/** Mirrors the production renderer's case-insensitive, whole-term matching contract. */
export function teachingTextSegments(text: string, terms: TeachingTerm[]): TeachingTextSegment[] {
  const positions: { start: number; end: number; text: string; term: TeachingTerm }[] = [];
  for (const term of terms) {
    const escaped = term.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      positions.push({ start: match.index, end: match.index + match[0].length, text: match[0], term });
    }
  }
  positions.sort((a, b) => a.start - b.start);

  const segments: TeachingTextSegment[] = [];
  let lastEnd = 0;
  for (const position of positions) {
    // Authored terms should not overlap. Ignoring a later overlap prevents duplicated prose if a
    // future curriculum entry contains both a phrase and a word inside that phrase.
    if (position.start < lastEnd) continue;
    if (position.start > lastEnd) segments.push({ kind: 'text', text: text.slice(lastEnd, position.start) });
    segments.push({ kind: 'term', text: position.text, term: position.term });
    lastEnd = position.end;
  }
  if (lastEnd < text.length) segments.push({ kind: 'text', text: text.slice(lastEnd) });
  return segments.length > 0 ? segments : [{ kind: 'text', text }];
}

export function teachingDwellRemaining(deadline: number, now = Date.now()): number {
  return Math.max(0, Math.ceil((deadline - now) / 1000));
}
