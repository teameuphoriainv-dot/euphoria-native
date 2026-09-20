import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildAtlasLessonContext, ANSWER_FIELDS } from '../src/lib/atlas-lesson-context.ts';
import { COURSES, loadCourseLessons } from '../src/lib/curriculum/courseIndex.ts';
import { expandSteps, expandedStepIdentities, normalizeStep } from '../src/lib/lesson-steps.ts';
import { defaultGraphValues, effectiveGraphSliders } from '../src/lib/interactive-graph-model.ts';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const askAtlas = read('src/components/ask-atlas.tsx');
const lessonSheet = read('src/components/lesson-atlas-sheet.tsx');
const lessonSheetModel = read('src/components/lesson-atlas-sheet-model.ts');
const contextSource = read('src/lib/atlas-lesson-context.ts');
const lesson = read('src/app/lesson.tsx');
const chat = read('src/app/chat.tsx');
const client = read('src/lib/atlas-chat.ts');
const route = read('src/app/api/chat+api.ts');
const layout = read('src/app/_layout.tsx');
const lessonAtlasRoute = read('src/app/lesson-atlas.tsx');
const mascot = read('src/components/atlas.tsx');
const graph = read('src/components/interactive-graph.tsx');

assert.match(contextSource, /export type AtlasLessonContext/, 'Atlas lesson context must have one typed route contract');
assert.match(askAtlas, /buildAtlasLessonContext/, 'lesson snapshots must be built through the shared leak-safe projector');
assert.match(contextSource, /ANSWER_FIELDS/, 'pre-attempt lesson snapshots must strip answer-bearing fields');
assert.match(askAtlas, /LessonAtlasButton[^]*context/, 'the persistent floating Atlas must carry the exact lesson context');
assert.match(askAtlas, /pathname:\s*context\s*\?\s*['"]\/lesson-atlas['"]\s*:\s*['"]\/chat['"]/, 'lesson Atlas must open over the lesson instead of replacing it with generic chat');
assert.match(askAtlas, /<Atlas[^>]*interactive[^>]*onPress=/, 'the lesson Atlas mascot itself must react and open the tutor');
assert.match(askAtlas, /<LessonAtlasSheet/, 'the lesson mascot must keep the tutor over the mounted lesson');
assert.match(lessonSheet, /height:\s*['"]72%['"]/, 'the in-lesson tutor must open at the web panel’s 72% height');
assert.match(lessonSheet, /backgroundColor:\s*COLORS\.surface/, 'the lesson tutor must use its canonical compact panel surface');
assert.match(mascot, /onPress\?:\s*\(\)\s*=>\s*void/, 'Atlas must expose one accessible action without nesting pressables');
assert.match(layout, /name=['"]lesson-atlas['"][^]*presentation:\s*['"]formSheet['"]/, 'lesson Atlas must use the native in-lesson sheet presentation');
assert.match(layout, /sheetAllowedDetents:\s*\[0\.72,\s*1\]/, 'lesson Atlas sheet must open at the web tutor’s 72% height');
assert.match(lessonAtlasRoute, /from ['"]\.\/chat['"]/, 'the lesson sheet must reuse the one chat implementation');

assert.match(lesson, /<LessonAtlasButton[^]*context=\{atlasContext\}/, 'every rendered lesson step must expose Atlas before an answer is submitted');
assert.match(lesson, /styles\.atlasFloat/, 'lesson Atlas must float over the lesson like the web tutor instead of squeezing the progress header');
assert.match(askAtlas, /PROACTIVE_SHOW_AT_MS\s*=\s*1200/, 'proactive lesson prompts must wait for the step to settle');
assert.match(askAtlas, /<AtlasSpeech[^]*delay=\{PROACTIVE_SHOW_AT_MS\}/, 'proactive prompts must reuse the verified Atlas typewriter animation');
assert.match(lessonSheetModel, /Want to know why that one was tricky\?/, 'wrong answers must offer the web tutor’s contextual interruption');
assert.match(lessonSheetModel, /Stuck on anything\? Tap me\./, 'the first step must offer the web tutor’s contextual interruption');
assert.match(lessonSheetModel, /That was a tough run\. Want a hint on this one\?/, 'repeated mistakes must offer the web tutor’s contextual interruption');
assert.match(askAtlas, /useReducedMotion/, 'proactive tutor animation must respect Reduced Motion');
assert.match(lesson, /buildAtlasLessonContext/, 'the lesson must project its current runtime-expanded step');

assert.match(chat, /lessonContext/, 'chat must read lesson context from the lesson route');
assert.match(chat, /I can see this step/, 'lesson chat must acknowledge its step grounding');
assert.match(chat, /Give me a hint/, 'lesson chat must offer the web tutor’s Socratic actions');
assert.match(chat, /Why was I wrong\?/, 'post-attempt chat must expose the web tutor’s mistake action');
assert.match(chat, /lessonContextKey/, 'a reused chat route must reset before carrying context from a different lesson step');
assert.match(chat, /function ThinkingDots/, 'Atlas pending state must match the web tutor’s animated three-dot indicator');
assert.match(chat, /useReducedMotion/, 'the Atlas typing indicator must respect Reduced Motion');
assert.doesNotMatch(chat, />Thinking…</, 'Atlas pending state must not regress to static text');
assert.match(chat, /const lessonModes/, 'lesson Socratic modes must remain available after the first turn');
assert.match(chat, /styles\.lessonModeDock/, 'lesson Socratic modes must live in a persistent dock outside the scrolling thread');
assert.match(chat, /lessonMode:\s*\{[^}]*minHeight:\s*44/, 'persistent lesson actions must keep a full native touch target');
assert.match(chat, /atlasBubble:\s*\{[^}]*maxWidth:\s*['"]85%['"][^}]*flexShrink:\s*1/, 'Atlas bubbles must hug their content instead of spanning the row');
assert.doesNotMatch(chat, /atlasBubble:\s*\{[^}]*flex:\s*1/, 'Atlas bubbles must not regress to full-row width');
// Literal OR its EXACT token equivalent. A pin that greps for a number fails a correct
// refactor and passes a broken one that keeps the digits — which is what happened on
// 2026-09-20 when a sweep moved these onto tokens.ts. The alternative is not "match
// anything": each alternation names ONE token, so swapping in a different duration still
// fails, which is how the 500 -> Duration.screen (460) regression was caught.
assert.match(chat, /withTiming\(1,\s*\{\s*duration:\s*(?:500|Duration\.pulse)\s*\}\)/, 'typing dots must match the web tutor’s one-second pulse');
assert.match(graph, /onValuesChange/, 'interactive graphs must publish the values the learner is currently viewing to Atlas');
assert.match(lesson, /graphControls:/, 'lesson context must include current graph controls');

assert.match(client, /lessonContext/, 'the native Atlas client must send lesson context separately from visible turns');
assert.match(route, /lessonContext/, 'the server proxy must validate and ground the model with lesson context');
assert.match(route, /They have NOT attempted this step/, 'the server prompt must prohibit answer leaks before an attempt');
assert.match(route, /function providerContents/, 'caller-authored lesson data must stay in user authority');
assert.doesNotMatch(route, /CURRENT LESSON STEP \(JSON\)/, 'caller-authored lesson data must not be interpolated into the system instruction');

const answerKeys = new Set(ANSWER_FIELDS);
let screens = 0;
let maxBytes = 0;
let graphScreens = 0;

function assertNoAnswerKey(value, path) {
  if (Array.isArray(value)) {
    value.forEach((child, index) => assertNoAnswerKey(child, `${path}[${index}]`));
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    assert.ok(!answerKeys.has(key), `pre-attempt context leaked ${key} at ${path}.${key}`);
    assertNoAnswerKey(child, `${path}.${key}`);
  }
}

for (const course of COURSES) {
  for (const lessonItem of await loadCourseLessons(course.id)) {
    const steps = expandSteps(lessonItem.steps ?? []);
    const identities = expandedStepIdentities(lessonItem.steps ?? []);
    assert.equal(identities.length, steps.length, 'every runtime screen must retain its authored web identity');
    for (const [index, step] of steps.entries()) {
      const normalized = normalizeStep(step);
      const graphControls = normalized.kind === 'graph'
        ? effectiveGraphSliders(normalized.spec).map((slider, sliderIndex) => ({
            label: slider.label,
            value: defaultGraphValues(normalized.spec)[sliderIndex],
            ...(slider.unit ? { unit: slider.unit } : {}),
          }))
        : undefined;
      const context = buildAtlasLessonContext({
        courseId: course.id,
        lessonTitle: lessonItem.title,
        lessonNumber: lessonItem.num,
        step,
        normalized,
        stepIndex: identities[index].authoredIndex,
        total: lessonItem.steps.length,
        attempted: false,
        correctSoFar: 0,
        recentMistakes: [],
        graphControls,
      });
      if (normalized.kind === 'graph') {
        assert.equal(context.step.controls?.length, graphControls.length, 'Atlas lost an interactive graph control');
        graphScreens += 1;
      }
      assert.equal(context.step.revealed, undefined, 'pre-attempt context must never have a revealed answer');
      assertNoAnswerKey(context.step.visible, `${course.id}/${lessonItem.num}/${index}`);
      maxBytes = Math.max(maxBytes, JSON.stringify(context).length);
      screens += 1;
    }
  }
}

assert.ok(maxBytes <= 12_000, `largest lesson context is ${maxBytes} bytes and exceeds the server bound`);

// Inflation Eroder, Portfolio Mixer, and two Compound Growth labs are specialized graph screens
// rather than prose fallbacks, so the complete corpus contains 293 graph contexts.
assert.equal(graphScreens, 293, 'all interactive graph screens must carry live controls to Atlas');
console.log(`atlas lesson parity regression: PASS — ${screens} runtime screens, ${graphScreens} graphs with live controls, max context ${maxBytes} bytes`);
