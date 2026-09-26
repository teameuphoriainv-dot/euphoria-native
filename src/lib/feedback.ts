/**
 * ONE VOCABULARY FOR LEARNING EVENTS. Each event always feels and sounds the same, on the same
 * beat, wherever it fires -- the consistency Duolingo's feel rests on. Heavy haptics are kept for
 * earned moments so they keep their meaning. Motion stays with the component (it owns layout and
 * its reduced-motion outcome); this owns haptic + sound. Both respect the Settings switches.
 */
import * as Haptics from './haptics';
import { playSfx, warmSfx, type Sfx } from './sfx';

type Haptic = 'success' | 'error' | 'warning' | 'light' | 'medium' | 'selection';

const EVENTS = {
  correct: { h: 'success', s: 'correct' },
  wrong: { h: 'error', s: 'wrong' },
  retry: { h: 'selection' },
  reveal: { h: 'light', s: 'reveal' },
  partComplete: { h: 'light' },
  lessonComplete: { h: 'success', s: 'complete' },
  combo: { h: 'medium', s: 'correct' },
  reward: { h: 'success', s: 'reveal' },
  purchase: { h: 'success', s: 'purchase' },
  lockedTap: { h: 'warning' },
} as const satisfies Record<string, { h: Haptic; s?: Sfx }>;

export type FeedbackEvent = keyof typeof EVENTS;

function haptic(h: Haptic) {
  switch (h) {
    case 'success': return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    case 'error': return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    case 'warning': return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    case 'light': return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    case 'medium': return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    case 'selection': return Haptics.selectionAsync();
  }
}

/** `rate` pitch-steps the sound (the combo chime climbs with the run). */
export function feedback(event: FeedbackEvent, opts?: { rate?: number }): void {
  const e: { h: Haptic; s?: Sfx } = EVENTS[event];
  void haptic(e.h).catch(() => undefined);
  if (e.s) playSfx(e.s, opts);
}

/** Create the lesson's players up front so the first Check is not the one that loads audio. */
export const warmLesson = () => warmSfx(['correct', 'wrong', 'complete']);
