#!/usr/bin/env node
/**
 * Every scenario choice owns a different authored outcome. Prove native preserves the web's
 * authored option order and the shared lesson runner reads feedback by selected index.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { COURSES, loadCourseLessons } from '../src/lib/curriculum/courseIndex.ts';
import { buildAtlasLessonContext } from '../src/lib/atlas-lesson-context.ts';
import * as lessonSteps from '../src/lib/lesson-steps.ts';

assert.equal(
  typeof lessonSteps.choiceFeedback,
  'function',
  'lesson normalization must expose one selected-option feedback lookup',
);
assert.equal(
  typeof lessonSteps.choiceResponse,
  'function',
  'lesson normalization must expose the shared web-compatible choice response',
);

const lessonSource = readFileSync(new URL('../src/app/lesson.tsx', import.meta.url), 'utf8');
assert.match(
  lessonSource,
  /choiceResponse\(norm, pick\)/,
  'Atlas correction must show the selected authored outcome for an incorrect scenario pick',
);
assert.match(
  lessonSource,
  /gradedChoice\?\.correctOutcome/,
  'a correct scenario must show its selected authored outcome',
);

let scenarios = 0;
let choices = 0;

for (const course of COURSES) {
  for (const lesson of await loadCourseLessons(course.id)) {
    for (const raw of lesson.steps ?? []) {
      if (raw.type !== 'scenario') continue;
      scenarios += 1;

      const normalized = lessonSteps.normalizeStep(raw);
      assert.equal(normalized.kind, 'choice', `${course.id} L${String(lesson.num)} scenario changed kind`);
      assert.equal(
        normalized.feedbackByOption?.length,
        normalized.options.length,
        `${course.id} L${String(lesson.num)} scenario lost option feedback`,
      );
      assert.deepEqual(
        normalized.options,
        raw.choices.map((choice) => choice.label),
        `${course.id} L${String(lesson.num)} scenario must preserve authored web option order`,
      );
      const authoredCorrect = raw.choices.find((choice) => choice.correct);
      assert.equal(
        normalized.options[normalized.correct],
        authoredCorrect?.label,
        `${course.id} L${String(lesson.num)} changed its authored correct answer`,
      );

      for (const authored of raw.choices) {
        choices += 1;
        const runtimeIndex = normalized.options.indexOf(authored.label);
        assert.notEqual(runtimeIndex, -1, `${course.id} L${String(lesson.num)} lost choice ${authored.label}`);
        assert.equal(
          lessonSteps.choiceFeedback(normalized, runtimeIndex),
          authored.outcome,
          `${course.id} L${String(lesson.num)} attached the wrong outcome to ${authored.label}`,
        );
        const response = lessonSteps.choiceResponse(normalized, runtimeIndex);
        if (authored.correct) {
          assert.deepEqual(
            response,
            { correct: true, correctOutcome: authored.outcome },
            `${course.id} L${String(lesson.num)} correct scenario must show its authored outcome inline`,
          );
        } else {
          assert.deepEqual(
            response,
            {
              correct: false,
              correction: {
                answer: `The better move was "${authoredCorrect?.label}".`,
                reason: authored.outcome,
              },
            },
            `${course.id} L${String(lesson.num)} wrong scenario must use canonical correction copy`,
          );
        }
        const context = buildAtlasLessonContext({
          courseId: course.id,
          lessonTitle: lesson.title,
          lessonNumber: lesson.num,
          step: raw,
          normalized,
          stepIndex: 0,
          total: 1,
          attempted: true,
          wasCorrect: runtimeIndex === normalized.correct,
          chosen: authored.label,
          chosenIndex: runtimeIndex,
          correctSoFar: 0,
          recentMistakes: [],
        });
        assert.equal(
          context.step.revealed?.explanation,
          authored.outcome,
          `${course.id} L${String(lesson.num)} gave Atlas the wrong outcome for ${authored.label}`,
        );
      }
    }
  }
}

assert.equal(scenarios, 273, `expected 273 scenario steps, found ${String(scenarios)}`);
assert.ok(choices > scenarios * 2, 'scenario coverage did not reach the authored choices');

console.log(`scenario feedback regression: PASS — ${String(scenarios)} scenarios, ${String(choices)} option outcomes`);
