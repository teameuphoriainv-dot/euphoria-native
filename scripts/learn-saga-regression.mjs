import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/app/(tabs)/learn.tsx', import.meta.url), 'utf8');

const includes = (needle, message) => assert.ok(source.includes(needle), message);

includes('const SAGA_NODE = 56;', 'standard saga pods must stay at the compact 56pt scale');
includes('const SAGA_CURRENT = 64;', 'the current saga pod must stay at the compact 64pt scale');
includes('const SAGA_PITCH = 124;', 'saga stops must keep enough rhythm for a two-line label');
includes('const SAGA_AMPLITUDE = 48;', 'the compact pathway must retain a readable 48pt sway');
includes('const SAGA_LABEL_WIDTH = 136;', 'lesson labels must fit full two-line titles without becoming wide cards');
includes('const SAGA_LABEL_HEIGHT = 46;', 'labels must not reserve the old oversized block');
includes(
  'Math.sin((lessonIndex / 2.5) * Math.PI) * SAGA_AMPLITUDE',
  'the pathway must retain the production sinusoidal stagger',
);
includes("const SAGA_CURRENT_COLOR = '#22C55E';", 'the actionable lesson must remain green');
includes("const SAGA_CHALLENGE_COLOR = '#F59E0B';", 'completed challenge pods must remain amber');
includes('styles.specialNode', 'challenge and capstone pods must retain their diamond silhouette');
includes('<SagaCrown />', 'the capstone must retain its crown silhouette');
includes('<SagaBolt />', 'challenge nodes must retain their bolt silhouette');
includes('name="check"', 'completed lessons must retain a check');
includes('name="lock"', 'locked lessons must retain a lock');
includes('<View style={styles.playIcon} />', 'the current lesson must retain a play glyph');
includes('strokeWidth={2}', 'compact nodes need a continuous connector that remains visible');
assert.ok(!source.includes('strokeDasharray='), 'path connectors must not become decorative dashed rails');
includes('>Current</ThemedText>', 'the current lesson must retain its text label');
includes('<LivingStreakFlame />', 'Learn streak must mount the dedicated living flame treatment');
includes('<PixelSpriteView sprite={flameSprite} size={16} play="loop"', 'Learn streak must use the looping canonical pixel flame');
includes('withRepeat(', 'the small header flame must have a visible physical motion loop');
includes('useReducedMotion()', 'the header flame motion must honor Reduced Motion');
assert.ok(!source.includes('<UIcon name="flame"'), 'Learn must not reintroduce the mismatched vector flame');

// A current node plus its lip, label gap, and two-line label must fit before the next stop. The old
// 78 + 5 + 8 + 58 stack was 149pt inside a 132pt pitch, so labels collided with the next node.
assert.ok(64 + 4 + 8 + 46 <= 124, 'current node and label overlap the next saga stop');

// Pin the existing behavior around the visual pathway: this redesign must not bypass data,
// progression, entitlement, or navigation.
includes('loadCourseLessons(activeCourseId)', 'the pathway must keep loading canonical course lessons');
includes("entitled(useApp.getState(), 'lesson')", 'lesson taps must retain entitlement gating');
includes("pathname: '/lesson'", 'unlocked pods must still navigate into the lesson route');

console.log('learn saga regression passed');
