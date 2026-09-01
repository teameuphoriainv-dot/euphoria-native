#!/usr/bin/env node

import assert from 'node:assert/strict';

import { COURSES, loadCourseLessons } from '../src/lib/curriculum/courseIndex.ts';

const visualKeys = ['visual', 'diagramVisual', 'withVisual', 'withoutVisual'];
const coverage = {
  flows: 0,
  flowNodes: 0,
  maxFlowNodes: 0,
  metrics: 0,
  metricSprites: 0,
};

for (const course of COURSES) {
  for (const lesson of await loadCourseLessons(course.id)) {
    for (const step of lesson.steps ?? []) {
      for (const key of visualKeys) {
        const visual = step?.[key];
        if (visual?.type === 'flow') {
          coverage.flows += 1;
          coverage.flowNodes += visual.nodes.length;
          coverage.maxFlowNodes = Math.max(coverage.maxFlowNodes, visual.nodes.length);
        }
        if (visual?.type === 'metric') {
          coverage.metrics += 1;
          if (visual.sprite) coverage.metricSprites += 1;
        }
      }
    }
  }
}

assert.deepEqual(
  coverage,
  { flows: 403, flowNodes: 1824, maxFlowNodes: 27, metrics: 277, metricSprites: 228 },
  'live-49e flow/metric corpus coverage drifted',
);

let motion;
try {
  motion = await import('../src/lib/lesson-visual-motion.ts');
} catch {
  motion = {};
}

assert.equal(typeof motion.buildMetricMotionPlan, 'function', 'the metric renderer has no production motion plan');
assert.equal(typeof motion.buildFlowMotionPlan, 'function', 'the flow renderer has no production motion plan');

assert.deepEqual(
  motion.buildMetricMotionPlan(true, false),
  { titleDelay: 0, spriteDelay: 70, valueDelay: 140, detailDelay: 210, duration: 350, translateY: 10 },
  'sprite-backed metric staging drifted from production',
);
assert.deepEqual(
  motion.buildMetricMotionPlan(false, false),
  { titleDelay: 0, spriteDelay: null, valueDelay: 70, detailDelay: 140, duration: 350, translateY: 10 },
  'sprite-free metric staging drifted from production',
);
assert.deepEqual(
  motion.buildMetricMotionPlan(true, true),
  { titleDelay: 0, spriteDelay: 0, valueDelay: 0, detailDelay: 0, duration: 0, translateY: 0 },
  'Reduced Motion does not resolve metric content immediately',
);

const flow = motion.buildFlowMotionPlan(3, true, false);
assert.deepEqual(
  { headerDelay: flow.headerDelay, titleDelay: flow.titleDelay, duration: flow.duration, translateY: flow.translateY },
  { headerDelay: 0, titleDelay: 70, duration: 350, translateY: 10 },
  'flow header staging drifted from production',
);
assert.deepEqual(
  flow.nodes,
  [
    { entranceDelay: 140, signalDelay: 180, dotDuration: 200, connectorDuration: 260, ringDuration: 0 },
    { entranceDelay: 210, signalDelay: 440, dotDuration: 200, connectorDuration: 260, ringDuration: 0 },
    { entranceDelay: 280, signalDelay: 700, dotDuration: 200, connectorDuration: 0, ringDuration: 700 },
  ],
  'flow nodes no longer reveal and carry their signal in production order',
);
assert.equal(
  motion.buildFlowMotionPlan(27, false, false).nodes.at(-1).signalDelay,
  6940,
  'the 27-node corpus maximum no longer reaches its final destination on schedule',
);

const reducedFlow = motion.buildFlowMotionPlan(3, true, true);
assert.deepEqual(
  reducedFlow.nodes,
  [
    { entranceDelay: 0, signalDelay: 0, dotDuration: 0, connectorDuration: 0, ringDuration: 0 },
    { entranceDelay: 0, signalDelay: 0, dotDuration: 0, connectorDuration: 0, ringDuration: 0 },
    { entranceDelay: 0, signalDelay: 0, dotDuration: 0, connectorDuration: 0, ringDuration: 0 },
  ],
  'Reduced Motion still schedules flow travel or arrival motion',
);

console.log('flow/metric motion regression: PASS — 403 flows, 1,824 nodes, 277 metrics');
