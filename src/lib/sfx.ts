/**
 * One-shot UI sounds, paired with the haptic on the same beat.
 *
 * Players are created lazily on first use and kept for the session, so the second play is
 * instant and the app does not decode a file per tap. Plain functions rather than a hook because
 * the call sites are event handlers (gradeChoice), not render. Sounds are Kenney CC0
 * (assets/sounds/LICENSE-kenney.txt).
 *
 * The audio session is set ONCE, explicitly, on first use: `playsInSilentMode: false` so the
 * ring/silent switch mutes every sound (a muted phone in class stays muted), and `mixWithOthers`
 * so the user's music keeps playing under a chime instead of being paused by it. The streak
 * celebration used to set this itself with its own players; it now shares this one helper.
 */
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

const FILES = {
  correct: require('../../assets/sounds/confirmation_001.m4a'),
  wrong: require('../../assets/sounds/error_004.m4a'),
  complete: require('../../assets/sounds/confirmation_002.m4a'),
  /* Shop purchase. drop_002 reads as a coin dropping, distinct from every lesson chime and from
     the streak ember's glass_002 tink, so a purchase never sounds like a streak. */
  purchase: require('../../assets/sounds/drop_002.m4a'),
  /* Reward card reveal: bong_001, used nowhere else, so turning a card over has its own sound. */
  reveal: require('../../assets/sounds/bong_001.m4a'),
  /* A game run ending. minimize_004 falls in pitch: an ending, not a mistake, so never `wrong`. */
  gameOver: require('../../assets/sounds/minimize_004.m4a'),
  /* Streak ignite. maximize_008 is the shorter, airier whoosh: it sits under the ~700ms turn
     without trailing past the landing. confirmation_004 is the landing chord -- deliberately NOT
     confirmation_002, which `complete` plays a moment earlier on the same lesson end. glass_002
     is a small bright tink, the right size for a flame settling into a 34pt dot. */
  whoosh: require('../../assets/sounds/maximize_008.m4a'),
  ignite: require('../../assets/sounds/confirmation_004.m4a'),
  ember: require('../../assets/sounds/glass_002.m4a'),
} as const;

export type Sfx = keyof typeof FILES;

const players: Partial<Record<Sfx, AudioPlayer>> = {};
let modeSet = false;

function player(name: Sfx): AudioPlayer {
  if (!modeSet) {
    modeSet = true;
    void setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers' }).catch(() => undefined);
  }
  return (players[name] ??= createAudioPlayer(FILES[name]));
}

/** Create (and so decode) players ahead of their beat, so a timed first play does not wait on a
 *  load. Call at mount for any sound scheduled inside an animation. */
export function warmSfx(names: readonly Sfx[]): void {
  for (const n of names) {
    try {
      player(n);
    } catch {
      // A failed decode here just means the first play pays for it (or stays silent).
    }
  }
}

export function playSfx(name: Sfx): void {
  try {
    const p = player(name);
    // Restart-safe: a finished player sits at its end, where play() is silent.
    void p.seekTo(0).catch(() => undefined);
    p.play();
  } catch {
    // Sound is garnish: a failed decode must never break answering a question.
  }
}
