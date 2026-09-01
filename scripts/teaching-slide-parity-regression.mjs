#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { deepStrictEqual, strictEqual } from 'node:assert';

const ROOT = new URL('..', import.meta.url).pathname;
const imported = (path) => import(pathToFileURL(join(ROOT, path)).href);
const { COURSES, loadCourseLessons } = await imported('src/lib/curriculum/courseIndex.ts');
const { normalizeStep } = await imported('src/lib/lesson-steps.ts');
const {
  TEACHING_SLIDE_DWELL_MS,
  TEACHING_SLIDE_SCROLL_MARGIN,
  teachingDwellRemaining,
  teachingTextSegments,
} = await imported('src/lib/teaching-slide.ts');

const segments = teachingTextSegments('Risk (premium) and RISK.', [
  { term: 'risk', definition: 'Uncertainty' },
  { term: 'premium', definition: 'Extra return', example: 'Stocks may earn one.' },
]);
deepStrictEqual(segments.filter((segment) => segment.kind === 'term').map((segment) => segment.text), ['Risk', 'premium', 'RISK']);
strictEqual(teachingDwellRemaining(15_000, 0), 15);
strictEqual(teachingDwellRemaining(15_000, 14_001), 1);
strictEqual(teachingDwellRemaining(15_000, 15_001), 0);
strictEqual(TEACHING_SLIDE_DWELL_MS, 15_000);
strictEqual(TEACHING_SLIDE_SCROLL_MARGIN, 100);

let slides = 0;
let terms = 0;
let visuals = 0;
let svgs = 0;
let hints = 0;
let recaps = 0;
for (const course of COURSES) {
  for (const lesson of await loadCourseLessons(course.id)) {
    for (const raw of lesson.steps ?? []) {
      if (raw.type !== 'teachingSlide') continue;
      slides += 1;
      terms += raw.highlightedTerms?.length ?? 0;
      visuals += raw.diagramVisual ? 1 : 0;
      svgs += raw.diagramSvg && !raw.diagramVisual ? 1 : 0;
      hints += raw.atlas?.hint ? 1 : 0;
      recaps += raw.atlas?.recap ? 1 : 0;

      const normalized = normalizeStep(raw);
      strictEqual(normalized.kind, 'teaching');
      strictEqual(normalized.spec.title, raw.title);
      deepStrictEqual(normalized.spec.highlightedTerms, raw.highlightedTerms);
      deepStrictEqual(normalized.spec.atlas, raw.atlas);
      strictEqual(Boolean(normalized.spec.diagramVisual || normalized.spec.diagramSvg), true, `${course.id} L${String(lesson.num)} lost its visual`);
    }
  }
}

deepStrictEqual({ slides, terms, visuals, svgs, hints, recaps }, {
  slides: 432,
  terms: 1445,
  visuals: 427,
  svgs: 5,
  hints: 250,
  recaps: 250,
});

const component = await readFile(join(ROOT, 'src/components/teaching-slide.tsx'), 'utf8');
const visualComponent = await readFile(join(ROOT, 'src/components/lesson-visual.tsx'), 'utf8');
const runner = await readFile(join(ROOT, 'src/app/lesson.tsx'), 'utf8');
strictEqual(component.includes("useLessonStepState('teaching.dwellDeadline'"), true, 'dwell deadline is not preserved across back navigation');
strictEqual(component.includes("useLessonStepState('teaching.bottomReached'"), true, 'bottom gate is not preserved across back navigation');
strictEqual(component.includes("useLessonStepState('teaching.showRecap'"), true, 'recap state is not preserved across back navigation');
strictEqual(component.includes('useReducedMotion()'), true, 'teaching slide ignores Reduced Motion');
strictEqual(component.includes('Show me an example'), true, 'authored example follow-up is absent');
strictEqual(component.includes("width >= 1280"), true, 'desktop-only diagram guide breakpoint drifted');
strictEqual(component.includes("backgroundColor: '#14121C'"), true, 'canonical Atlas bubble surface drifted');
strictEqual(component.includes('spec.sectionLabel ?'), false, 'production web does not render a teaching-slide section label');
strictEqual(component.includes("content: { width: '100%', maxWidth: 800, alignSelf: 'center', paddingHorizontal: 24"), true, 'teaching content must keep the web 40-point total mobile gutter');
strictEqual(component.includes("title: { fontSize: 24, lineHeight: 32"), true, 'mobile teaching title must match web text-2xl sizing');
strictEqual(component.includes("paragraph: { color: 'rgba(244,244,245,0.90)', fontSize: 14, lineHeight: 23"), true, 'mobile teaching prose must match web text-sm sizing');
strictEqual(visualComponent.includes("style={{ color: accent }}>{r.value}"), false, 'comparison values must use the web foreground color, not sentiment accent');
strictEqual(visualComponent.includes("comparisonHeader: { fontSize: 13, lineHeight: 18, borderBottomWidth"), true, 'comparison headers must use the compact divided web treatment');
strictEqual(visualComponent.includes("comparisonRow: { paddingHorizontal: 6, paddingVertical: 4"), true, 'comparison rows must be visually compact like web');
strictEqual(visualComponent.includes("comparisonLabel: { flex: 1, fontSize: 12, lineHeight: 15"), true, 'comparison labels must match web sizing');
strictEqual(visualComponent.includes("comparisonValue: { flexShrink: 0, fontSize: 12.5, lineHeight: 16"), true, 'comparison values must match web sizing');
strictEqual(runner.includes("norm.kind === 'teaching'"), true, 'lesson runner does not dispatch teaching slides');
strictEqual(runner.includes("'teaching'"), true, 'lesson runner may render a duplicate footer CTA');

console.log(`teaching-slide parity ok — ${slides} slides, ${terms} terms, ${visuals} animated visuals, ${svgs} SVGs, ${hints} hints, ${recaps} recaps`);
