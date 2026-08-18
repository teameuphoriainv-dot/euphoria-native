"""Windowed motion analysis for the per-route audit.

Reuses motion_energy's frame loader and burst detector so the audit and the
existing measurement agree BY CONSTRUCTION rather than by two similar
implementations drifting apart.

One clip per route holds both halves of the question:

    [0.0 .. 1.0]  recorder warm-up, discarded
    [1.0 .. 3.5]  ENTRY  — the transition on arrival
    [4.0 .. 9.0]  IDLE   — does anything move once it has settled

That split is the whole point: a screen that animates on arrival and then goes
flat is STATIC, which is a different defect from one that never moves at all
(DEAD) and needs a different fix.

Emits one JSON object per clip so the shell caller never parses prose.

    python3 scripts/motion_window.py <clip.mov> [clip2.mov ...]
"""
import json
import os
import sys

import subprocess

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from motion_energy import bursts, load_gray  # noqa: E402

FPS = 30.0
ENTRY = (1.0, 3.5)
# IDLE was (4.0, 9.0) — a FIVE SECOND window on a process whose events are 2.8-6.2s apart.
# It could, and did, catch zero blinks. Measured 2026-08-18: three runs of identical code on
# `start` returned 0, 0 and 150 idle_peak_px, and two full audits of the same code returned
# 1064 and 2107. A five-measurement spread of 0..2107 with nothing changed means single
# readings were never evidence, and every before/after built on them was noise.
# 20s covers ~3 blink cycles and ~10 saccades, so a zero now means genuinely nothing moved.
IDLE = (4.0, 20.0)

# --- why there is a SECOND, localized metric -------------------------------
# motion_energy.py averages |delta| over the WHOLE FRAME. That is right for the job it was
# built for (a 132px mascot reacting, filling a large share of the frame) and badly wrong for
# idle motion, because a whole-frame mean dilutes anything localized.
#
# Measured on this repo's own clips: `welcome` idles with 107 pixels changing at intensity 196
# — unmistakable motion — yet its whole-frame mean is 0.003, indistinguishable from a dead
# screen. Judging idle on the global mean alone reports every route as motionless and would
# have made the entire audit wrong in the same direction.
#
# So idle is judged on PIXELS CHANGED, which does not dilute, and the global burst metric is
# kept for entry transitions where it is the correct instrument.
LOCAL_W, LOCAL_H = 296, 640
PIXEL_DELTA = 6     # per-pixel intensity change that counts as real, above encoder noise
LIVE_PIXELS = 20    # frames with more changed pixels than this are genuinely moving


def _gray(path, w, h):
    cmd = ["ffmpeg", "-v", "error", "-i", path,
           "-vf", f"scale={w}:{h},format=gray", "-f", "rawvideo", "-"]
    raw = subprocess.run(cmd, capture_output=True).stdout
    n = len(raw) // (w * h)
    return np.frombuffer(raw[: n * w * h], dtype=np.uint8).reshape(n, h, w).astype(np.float32)


# A frame where this share of the screen changes is a NAVIGATION, a dialog, or a Metro
# refresh — never a mascot breathing. Windows containing one are contaminated, not idle.
CONTAMINATION_FRACTION = 0.05


def local_idle(path):
    """Localized idle motion over the idle window.

    Returns (pct_of_idle_frames_moving, peak_pixels_changed, contaminated).

    WHY THE CONTAMINATION FLAG EXISTS. Measured 2026-08-18: three runs of IDENTICAL code on
    `start` returned 0, 0 and 150 peak px on a 5s window, and 183706, 152 and 19 on a 20s
    window. A spread of 19..183706 with nothing changed is not a sparse-sampling problem — it
    is navigation landing inside the window. 183706 px is most of the frame; a mascot breathing
    moves hundreds. Any reading from a contaminated window is noise wearing a number's clothes,
    and every before/after built on one was worthless.
    """
    g = _gray(path, LOCAL_W, LOCAL_H)
    lo, hi = int(IDLE[0] * FPS), min(int(IDLE[1] * FPS), len(g))
    if hi - lo < 2:
        # FOUR values, like every other return in this function. This returned three, and since
        # the caller unpacks four it raised ValueError and killed the whole audit mid-run — twice,
        # on the same tail-end routes, leaving 21/26 rows and a clip on disk with no result. A
        # crash in the ANALYSER takes the harness down with it, so arity here is load-bearing.
        return 0.0, 0, 0, False
    d = np.abs(np.diff(g[lo:hi], axis=0))
    changed = (d > PIXEL_DELTA).sum(axis=(1, 2))
    contaminated = bool((changed > LOCAL_W * LOCAL_H * CONTAMINATION_FRACTION).any())
    if contaminated:
        # Refuse to report a number rather than report a plausible wrong one.
        return 0.0, 0, 0, True

    # EVENT COUNT, not peak. idle_peak_px is a MAX, so it is decided by whether one blink
    # happened to land inside the window — measured spread on identical code was 4x to 77x.
    # Counting discrete motion events instead samples the whole window: over 16s a live mascot
    # produces roughly 3 blinks and 8 saccades, and that total is stable run to run in a way
    # a single maximum never is.
    hot = changed > LIVE_PIXELS
    events, run = 0, False
    for h in hot:
        if h and not run:
            events += 1
        run = h
    return round(100.0 * hot.mean(), 1), int(changed.max()), events, False

# A burst longer than this is a real payoff beat. 400ms is the documented
# structural ceiling in src/shared/motion/tokens.ts — nothing in the app
# currently exceeds it, and that is the gap the program exists to close.
EARNED_MS = 400
# Below this the screen is inert. 100ms is tokens.ts's `instant`: anything
# shorter reads as a cut, not a transition.
ALIVE_MS = 100


def _overlap(run, window):
    """Does a (start_frame, end_frame) burst intersect a (t0, t1) second window?"""
    s, e = run[0] / FPS, run[1] / FPS
    return s < window[1] and e > window[0]


def _active_pct(runs, window, total_frames):
    lo, hi = int(window[0] * FPS), min(int(window[1] * FPS), total_frames)
    if hi <= lo:
        return 0.0
    active = 0
    for s, e in runs:
        active += max(0, min(e, hi) - max(s, lo))
    return 100.0 * active / (hi - lo)


def analyse(path):
    g = load_gray(path)
    if len(g) < 2:
        return {"clip": os.path.basename(path), "error": "too few frames"}

    diff = np.abs(np.diff(g, axis=0)).mean(axis=(1, 2))
    floor = float(np.percentile(diff, 40))
    thresh = max(floor * 2.5, 0.6)
    runs = bursts(diff, thresh)

    entry_runs = [r for r in runs if _overlap(r, ENTRY)]
    longest_ms = max((1000 * (e - s) / FPS for s, e in runs), default=0.0)

    # Idle is judged localized, entry globally — see the note above the constants.
    idle_pct, idle_peak_px, idle_events, contaminated = local_idle(path)

    # Entry transitions run ~460ms (Duration.screen), so a long burst during ENTRY is
    # navigation, not a payoff. Only a long burst OUTSIDE the entry window is EARNED.
    payoff_ms = max(
        (1000 * (e - s) / FPS for s, e in runs if not _overlap((s, e), ENTRY)), default=0.0
    )

    # Ordered most-severe-first: the first band that matches wins.
    if contaminated:
        verdict = "CONTAMINATED"      # navigation inside the idle window; not a motion finding
    elif payoff_ms > EARNED_MS:
        verdict = "GOOD"
    elif idle_events >= 6:
        verdict = "OK"
    elif entry_runs or idle_pct > 0:
        verdict = "STATIC"
    else:
        verdict = "DEAD"

    return {
        "clip": os.path.basename(path),
        "frames": int(len(g)),
        "dur_s": round(len(g) / FPS, 1),
        "thresh": round(thresh, 2),
        "bursts": len(runs),
        "entry_bursts": len(entry_runs),
        "idle_pct": idle_pct,
        "idle_peak_px": idle_peak_px,
        "idle_events": idle_events,
        "contaminated": contaminated,
        "overall_pct": round(100.0 * sum(e - s for s, e in runs) / len(diff), 1),
        "longest_ms": round(longest_ms),
        "payoff_ms": round(payoff_ms),
        "verdict": verdict,
    }


def _demo():
    """Self-check on the windowing maths — no clips, no ffmpeg, no simulator."""
    # A burst from frame 30..60 is t=1.0..2.0s, i.e. inside ENTRY only.
    assert _overlap((30, 60), ENTRY) and not _overlap((30, 60), IDLE)
    # frame 150..180 is t=5.0..6.0s, inside IDLE only.
    assert _overlap((150, 180), IDLE) and not _overlap((150, 180), ENTRY)
    # Every local_idle return path must have the SAME arity — a 3-tuple from one branch raised
    # ValueError in the caller and killed the audit mid-run, twice, on the same routes.
    #
    # Parsed with ast, not by splitting on commas: the first version of this check did that and
    # reported {4, 5}, because `round(100.0 * hot.mean(), 1)` contains a comma. The code was
    # right and the checker was wrong, which is its own lesson about verifiers.
    import ast as _ast
    import inspect as _inspect
    import textwrap as _tw
    _fn = _ast.parse(_tw.dedent(_inspect.getsource(local_idle))).body[0]
    _arities = {len(n.value.elts) for n in _ast.walk(_fn)
                if isinstance(n, _ast.Return) and isinstance(n.value, _ast.Tuple)}
    assert _arities == {4}, f"local_idle returns mixed arity: {_arities}"
    # A burst wholly before the windows touches neither.
    assert not _overlap((0, 15), ENTRY) and not _overlap((0, 15), IDLE)
    # IDLE spans 4.0-9.0s = 150 frames; a 75-frame burst inside it is 50%.
    assert abs(_active_pct([(150, 225)], IDLE, 270) - 50.0) < 0.1
    # A burst outside the window contributes nothing.
    assert _active_pct([(30, 60)], IDLE, 270) == 0.0
    print("motion_window self-check OK")


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--demo":
        _demo()
    else:
        for p in sys.argv[1:]:
            print(json.dumps(analyse(p)))
